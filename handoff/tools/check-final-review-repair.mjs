// IH-004 integrity. Executed semantic cases and independent acceptance are separate.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const failures=[];let checks=0;const check=(ok,message)=>{checks++;if(!ok)failures.push(message);};
const revision=read('HANDOFF_REVISION.json');
check(revision.packageId==='IH-005'&&revision.parentPackageId==='IH-004','Revision identity');
check(!revision.productionImplementationStarted,'Production authorization drift');
check(['REPAIR_IN_PROGRESS','READY FOR TARGETED RE-REVIEW'].includes(revision.status),'Repair disposition');
for(const f of revision.independentReview)check(hash(path.join(root,f.path))===f.sha256,'Review evidence drift '+f.path);
const repair=read('data/final-review-repair.json');
check(repair.findings.map(x=>x.id).join(',')==='FIR-B01,FIR-N01','Scope expansion');
check(repair.architectureChanges.length===1&&repair.architectureChanges[0].id==='AC-IH004-01','Change not recorded');
for(const f of repair.findings)for(const p of [...f.contracts,...f.validationFiles])check(fs.existsSync(path.join(root,p)),'Missing contract/evidence '+p);
const extension=fs.readFileSync(path.join(root,'04_EXTENSION_MODEL.md'),'utf8');
const main=extension.split('## 10. Reference mapping')[0];
for(const old of ['GenerationProfile','HostServices','問題字串'])check(!main.includes(old),'Obsolete production-first terminology: '+old);
for(const term of ['LocalizableIssue','GLSLProfile','CapabilityDirectory','GraphKindRef'])check(main.includes(term),'Missing production terminology: '+term);
check(extension.includes('16_VIEW_MOUNT_CONTRACT.md'),'No view contract locator');
const parent=read('provenance/IH-003_PARENT_CONTENTS.json');
for(const p of ['executable-reference/core.ts','executable-reference/contracts.ts','executable-reference/repair/scoped-parameter.ts','executable-reference/repair/localization.ts']){
 check(hash(path.join(root,p))===parent.files.find(f=>f.path===p)?.sha256,'Unchanged ownership implementation altered: '+p);
}
const current=read('implementation-state.json');
check(current.handoffRevision==='IH-005'&&current.status==='not-started'&&current.activeSlices.length===0&&current.completedSlices.length===0,'Production progress drift');
const gate=read('data/gates.json').gates.find(g=>g.id==='G-EXTENSION-PANEL');
check(gate.sliceIds.includes('S01')&&gate.sliceIds.includes('S06'),'Rendering seam deferred after first UI foundation');
check(gate.qualification.productionRuntime==='not-implemented-not-verified','Fake surface promoted to production evidence');
const arg=process.argv.indexOf('--verify-parent');
if(arg>=0){const dir=process.argv[arg+1];if(!dir)throw Error('Exact parent directory required');for(const f of parent.files)check(hash(path.join(dir,f.path))===f.sha256,'Frozen IH-003 altered: '+f.path);}
function enumerate(dir,prefix=''){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=prefix+e.name;return e.isDirectory()?e.name==='node_modules'||p==='executable-reference/evidence/runs'?[]:enumerate(path.join(dir,e.name),p+'/'):p==='HANDOFF_FILE_INDEX.json'?[]:[p];}).sort();}
if(process.argv.includes('--verify-index')){
 const index=read('HANDOFF_FILE_INDEX.json');check(index.packageId==='IH-005','Index revision');
 check(JSON.stringify(index.files.map(f=>f.path).sort())===JSON.stringify(enumerate(root)),'Index membership drift');
 for(const f of index.files)check(hash(path.join(root,f.path))===f.sha256,'Index hash drift '+f.path);
}
console.log(JSON.stringify({packageId:'IH-005',status:failures.length?'FAIL':'PASS',checks,failures,claim:'Integrity and protected-source checks only; not independent acceptance or production runtime qualification.'},null,2));
process.exitCode=failures.length?1:0;
