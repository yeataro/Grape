// IH-005 repair integrity. Does not grant independent acceptance or production authorization.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const errors=[];let checks=0;const check=(ok,msg)=>{checks++;if(!ok)errors.push(msg);};
const revision=read('HANDOFF_REVISION.json');
check(revision.packageId==='IH-005'&&revision.parentPackageId==='IH-004','Revision identity');
check(!revision.productionImplementationStarted,'Production must not have started');
check(revision.independentAcceptance==='pending','Must not self-accept');
check(['REPAIR_IN_PROGRESS','READY FOR TARGETED RE-REVIEW'].includes(revision.status),'Review-only status');
check(revision.productDecisions.includes('DEC-GRAPE-001'),'Owner decision missing');
for(const item of revision.independentReview)check(hash(path.join(root,item.path))===item.sha256,'Review evidence changed '+item.path);
const parent=read('provenance/IH-004_PARENT_CONTENTS.json');
check(parent.packageId==='IH-004','Immediate parent identity');
for(const p of ['compatibility/capabilities.json','SOURCE_BASELINES.json','data/invariants.json','executable-reference/core.ts','executable-reference/contracts.ts','executable-reference/generator.ts','executable-reference/qualification-host.ts','executable-reference/repair/scoped-parameter.ts','executable-reference/repair/localization.ts']){
  check(hash(path.join(root,p))===parent.files.find(f=>f.path===p)?.sha256,'Protected ownership/source changed '+p);
}
const repair=read('data/ih005-repair.json');
check(repair.findings.length===4,'Repair scope');
for(const f of repair.findings)for(const p of [...f.contracts,...f.validationFiles])check(fs.existsSync(path.join(root,p)),'Missing contract/evidence '+p);
const arg=process.argv.indexOf('--verify-parent');
if(arg>=0){const dir=process.argv[arg+1];if(!dir)throw Error('Exact parent directory required');for(const f of parent.files)check(hash(path.join(dir,f.path))===f.sha256,'Frozen IH-004 altered '+f.path);}
function enumerate(dir,prefix=''){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=prefix+e.name;return e.isDirectory()?e.name==='node_modules'||p==='executable-reference/evidence/runs'?[]:enumerate(path.join(dir,e.name),p+'/'):p==='HANDOFF_FILE_INDEX.json'?[]:[p];}).sort();}
if(process.argv.includes('--verify-index')){
  const index=read('HANDOFF_FILE_INDEX.json');check(index.packageId==='IH-005','Index identity');
  check(JSON.stringify(index.files.map(f=>f.path).sort())===JSON.stringify(enumerate(root)),'Index membership');
  for(const f of index.files)check(hash(path.join(root,f.path))===f.sha256,'Index hash drift '+f.path);
}
console.log(JSON.stringify({packageId:'IH-005',status:errors.length?'FAIL':'PASS',checks,errors,scope:'Repair integrity only; not product acceptance or independent verdict'},null,2));
process.exitCode=errors.length?1:0;
