// THIS IS NOT THE PRODUCTION IMPLEMENTATION.
// Package verification only: preserves the exact copied AC-002 source/test bytes.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const root = dirname(fileURLToPath(import.meta.url));
const evidence = join(root, 'evidence');
mkdirSync(evidence, {recursive:true});
const provenance = JSON.parse(readFileSync(join(root,'SOURCE_PROVENANCE.json'),'utf8'));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
for (const file of provenance.files) {
  if (digest(readFileSync(join(root,file.copiedPath))) !== file.sha256)
    throw new Error('COPIED_REFERENCE_DRIFT: ' + file.copiedPath);
}
const compiler = join(root,'node_modules/typescript/bin/tsc');
if (!existsSync(compiler)) throw new Error('Run npm ci in executable-reference for the locked typecheck tools. Runtime examples need no install.');
const localPlaywright=join(root,'browser-tools/node_modules/playwright/index.mjs');
const explicitPlaywright=process.env.GRAPE_PLAYWRIGHT_PATH;
const playwrightPath=explicitPlaywright?resolve(explicitPlaywright):localPlaywright;
const browserTooling={
  selection:explicitPlaywright?'explicit-environment':existsSync(localPlaywright)?'package-local':'unavailable',
  modulePath:playwrightPath,channel:process.env.GRAPE_BROWSER_CHANNEL??'msedge',
};
if (existsSync(playwrightPath)) {
  const metadataPath=join(dirname(playwrightPath),'package.json');
  const metadata=JSON.parse(readFileSync(metadataPath,'utf8'));
  if (metadata.name!=='playwright') throw new Error('GRAPE_PLAYWRIGHT_PATH must select a Playwright package index.mjs');
  Object.assign(browserTooling,{name:metadata.name,version:metadata.version,moduleSha256:digest(readFileSync(playwrightPath)),packageMetadataSha256:digest(readFileSync(metadataPath))});
}
// Always override the old test fallback. An absent explicit/package-local provider
// produces recorded skips, never an unreported machine-specific browser dependency.
const childEnvironment={...process.env,GRAPE_PLAYWRIGHT_PATH:playwrightPath,GRAPE_BROWSER_CHANNEL:browserTooling.channel};
// One sealed GPU test writes to a sibling architecture-coverage directory.
// A private run workspace keeps those unchanged paths inside this package area.
const workspace = join(evidence,'runs',String(Date.now()));
const runRoot = join(workspace,'architecture-core-prototype');
mkdirSync(join(runRoot,'evidence'),{recursive:true});
for (const file of provenance.files) {
  const target=join(runRoot,file.copiedPath); mkdirSync(dirname(target),{recursive:true});
  writeFileSync(target,readFileSync(join(root,file.copiedPath)));
}
function run(name,args,cwd=runRoot,input) {
  const result=spawnSync(process.execPath,args,{cwd,env:childEnvironment,encoding:'utf8',input,maxBuffer:32*1024*1024});
  const output=(result.stdout??'')+(result.stderr??'')+(result.error?String(result.error):'');
  writeFileSync(join(evidence,name+'.txt'),output);
  return {name,exitCode:result.status,output};
}
const typecheck=run('reference-typecheck',[compiler,'--pretty','false','--project',join(runRoot,'tsconfig.json')]);
const tests=run('reference-tests',['--test','--test-reporter=tap',...readdirSync(join(runRoot,'tests')).filter(n=>n.endsWith('.test.ts')).sort().map(n=>'tests/'+n)]);
const demo=run('reference-demo',['demo.ts']);
const contract=readFileSync(join(runRoot,'CORE_API_CONTRACTS.md'),'utf8');
const sample=contract.match(/## 9\.[\s\S]*?```ts\r?\n([\s\S]*?)```/)?.[1];
const docs=sample?run('reference-documentation',['--input-type=module-typescript'],runRoot,sample):{name:'reference-documentation',exitCode:1,output:'Missing sealed sample'};
const sampleNames=['minimal-node','dynamic-interface-node','minimal-host-adapter'];
const exampleFiles=sampleNames.flatMap(name=>['example.ts','example.test.ts'].map(file=>resolve(root,'../examples',name,file)));
const exampleTypecheck=run('example-typecheck',[compiler,'--noEmit','--strict','--target','ES2023','--module','NodeNext','--moduleResolution','NodeNext','--allowImportingTsExtensions','--skipLibCheck','--types','node','--typeRoots',join(root,'node_modules/@types'),...exampleFiles],root);
const examples=run('example-tests',['--test','--test-reporter=tap',...exampleFiles.filter(f=>f.endsWith('.test.ts'))],root);
const counts = output => Object.fromEntries(['tests','pass','fail','cancelled','skipped','todo'].map(key=>[key,Number(output.match(new RegExp('^# '+key+' (\\d+)','m'))?.[1]??-1)]));
const commands=[typecheck,tests,demo,docs,exampleTypecheck,examples];
const tc=counts(tests.output), ec=counts(examples.output);
const passed=commands.every(c=>c.exitCode===0)&&[tc,ec].every(c=>c.tests>0&&c.fail===0&&c.cancelled===0&&c.skipped===0&&c.todo===0);
const report={
  warning:'THIS IS NOT THE PRODUCTION IMPLEMENTATION',scope:'Reconstructed AC-002 package validity and exact-interface handoff examples; no new architecture claim or product migration',
  completedAt:new Date().toISOString(),runtime:process.version,platform:process.platform,
  browserTooling,
  observedBrowserDiagnostics:tests.output.split(/\r?\n/).filter(line=>line.startsWith('# {"browser":')).map(line=>JSON.parse(line.slice(2))),
  status:passed?'passed':'not-passed',referenceFilesVerified:provenance.files.length,
  provenanceSha256:digest(readFileSync(join(root,'SOURCE_PROVENANCE.json'))),
  commands:commands.map(({name,exitCode})=>({name,exitCode})),referenceCounts:tc,exampleCounts:ec,
  workspace:workspace.slice(root.length+1).replaceAll('\\','/'),
  logHashes:Object.fromEntries(commands.filter(c=>existsSync(join(evidence,c.name+'.txt'))).map(c=>[c.name+'.txt',digest(readFileSync(join(evidence,c.name+'.txt')))])),
  limitations:['Host tests use fake providers, not TD/native runtime.','WebGL tests depend on explicit external Playwright/browser prerequisites and only prove their recorded runtime.','Skipped optional environment tests prevent the full reference report from passing.','One initial handoff example mistakenly queried Port.type; corrected to the sealed Port.spec.type API without modifying the reference.'],
};
writeFileSync(join(evidence,'PACKAGE_VALIDATION.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
process.exitCode=passed?0:1;
