// Qualification replay on disposable byte copies. Never writes accepted handoff/.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {repositoryRoot,verifyBootstrap,indexedPaths} from './verify-bootstrap.mjs';

export function stageHandoff(root,workspace){
  const src=path.join(root,'handoff'),dest=path.join(workspace,'handoff');
  if(fs.existsSync(dest))throw Error('Fresh staging directory required');
  for(const p of indexedPaths(src).files){const target=path.join(dest,p);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(src,p),target);}
  fs.copyFileSync(path.join(root,'implementation-state.json'),path.join(workspace,'implementation-state.json'));
  return dest;
}
function run(binary,args,cwd,label){
  const r=spawnSync(binary,args,{cwd,env:process.env,stdio:'inherit'});
  if(r.error||r.status!==0)throw Error(label+' failed: '+(r.error??r.status));
}
function npm(command,cwd){
  // All command words are fixed below; no external path interpolated into shell text.
  if(process.platform==='win32')run(process.env.ComSpec??'cmd.exe',['/d','/s','/c','npm '+command],cwd,'npm tooling install');
  else run('npm',command.split(' '),cwd,'npm tooling install');
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const allowed=new Set(['--install-tools','--install-browser','--package-only']);
  const args=process.argv.slice(2);if(args.some(x=>!allowed.has(x)))throw Error('Allowed: --install-tools --install-browser --package-only');
  let workspace=null;let failure=null;let result=null;
  try{
    const before=await verifyBootstrap();if(before.status!=='PASS')throw Error(JSON.stringify(before));
    workspace=fs.mkdtempSync(path.join(os.tmpdir(),'grape-ih005-verification-'));
    const staged=stageHandoff(repositoryRoot,workspace),ref=path.join(staged,'executable-reference');
    console.log(JSON.stringify({workspace,scope:'Disposable qualification copy; not production or a second accepted baseline'}));
    if(args.includes('--install-tools'))npm('ci --ignore-scripts --no-audit --no-fund',ref);
    else if(process.env.GRAPE_QUALIFICATION_NODE_MODULES){
      const dependencies=path.resolve(process.env.GRAPE_QUALIFICATION_NODE_MODULES);
      for(const [name,version] of [['typescript','5.9.3'],['@types/node','25.9.8'],['prettier','3.6.2'],['undici-types','7.24.6']]){
        const pkg=JSON.parse(fs.readFileSync(path.join(dependencies,name,'package.json'),'utf8'));
        if(pkg.version!==version)throw Error('Locked qualification tooling mismatch '+name);
      }
      fs.cpSync(dependencies,path.join(ref,'node_modules'),{recursive:true,dereference:true});
    } else throw Error('Use --install-tools or explicitly set GRAPE_QUALIFICATION_NODE_MODULES to the locked test dependencies.');
    if(args.includes('--install-browser')){
      if(args.includes('--package-only'))throw Error('--install-browser and --package-only are mutually exclusive');
      const browser=path.join(ref,'browser-tools');fs.mkdirSync(browser,{recursive:true});
      fs.writeFileSync(path.join(browser,'package.json'),JSON.stringify({name:'grape-qualification-browser-tools',private:true,type:'module'})+'\n');
      npm('install --prefix . --ignore-scripts --no-audit --no-fund playwright@1.62.1',browser);
      run(process.execPath,[path.join(browser,'node_modules/playwright/cli.js'),'install','chromium'],browser,'Chromium install');
      process.env.GRAPE_PLAYWRIGHT_PATH=path.join(browser,'node_modules/playwright/index.mjs');
      process.env.GRAPE_BROWSER_CHANNEL='chromium';
    }
    // Without install flags, full browser prerequisites use only explicit environment or staged local provider.
    const replay=spawnSync(process.execPath,[path.join(staged,'tools/run-handoff.mjs'),...(args.includes('--package-only')?['--package-only']:[])],{cwd:staged,env:process.env,encoding:'utf8',maxBuffer:32*1024*1024});
    fs.writeFileSync(path.join(workspace,'replay-console.txt'),(replay.stdout??'')+(replay.stderr??''));
    const reportPath=path.join(staged,'audit/evidence/RUN_HANDOFF.json');
    result=fs.existsSync(reportPath)?JSON.parse(fs.readFileSync(reportPath,'utf8')):null;
    if(replay.error||replay.status!==0||!result)throw Error('Replay failed; see '+path.join(workspace,'replay-console.txt'));
  }catch(error){failure=String(error);}
  // Recheck even on failure. The immutable source must never be altered by a test.
  const after=await verifyBootstrap();
  const summary={status:failure||after.status!=='PASS'?'FAIL':result?.status,workspace,report:workspace?path.join(workspace,'handoff/audit/evidence/RUN_HANDOFF.json'):null,failure,acceptedHandoffAfter:after.status,results:result?.results.map(r=>({name:r.name,exitCode:r.exitCode,counts:r.counts})),referenceCounts:result?.referenceCounts,exampleCounts:result?.nodeAndHostExampleCounts,limits:['A replay does not alter accepted evidence or open production authorization.','Cloud/Chromium results are environment-specific; no implicit TD/physical-GPU compatibility.']};
  if(workspace)fs.writeFileSync(path.join(workspace,'REPLAY_RESULT.json'),JSON.stringify(summary,null,2)+'\n');
  console.log(JSON.stringify(summary,null,2));process.exitCode=summary.status==='PASS'||summary.status==='PACKAGE_ONLY_PASS'?0:1;
}
