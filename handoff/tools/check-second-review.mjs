// Integrity of IH-003 delta. Not independent acceptance or product qualification.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
let checks=0;const errors=[];const check=(ok,msg)=>{checks++;if(!ok)errors.push(msg);};
const revision=read('HANDOFF_REVISION.json');
check(revision.packageId==='IH-005'&&revision.parentPackageId==='IH-004','Revision identity');
check(!revision.productionImplementationStarted,'Production work unexpectedly started');
for(const review of revision.independentReview)check(hash(path.join(root,review.path))===review.sha256,'Review evidence changed: '+review.path);
for(const p of ['13_PRODUCTION_CONTRACT_SURFACE.md','14_DOCUMENT_FORMAT.md','15_LOCALIZATION_CONTRACT.md','SECOND_REVIEW_RECONCILIATION.md'])check(fs.existsSync(path.join(root,p)),'Missing canonical locator: '+p);
const recon=read('data/second-review-reconciliation.json');
const valid=new Set(['ALREADY RESOLVED','STILL VALID','PARTIALLY RESOLVED','INVALIDATED BY CURRENT DESIGN','NEW CONFLICT EXPOSED']);
for(const id of ['B1','B2','M1','M2','M3','M4','M5','M6','m1','m2','m3','m4','m5','m6','POSITIONING','EXT-A','EXT-B','EXT-C','EXT-D','EXT-E','EXT-F','AI-WORKFLOW'])check(recon.findings.some(f=>f.id===id),'Missing finding '+id);
check(new Set(recon.findings.map(f=>f.id)).size===recon.findings.length,'Duplicate reconciliation finding');
for(const f of recon.findings){
 check(valid.has(f.status),'Invalid finding status '+f.id);
 for(const k of ['currentEvidence','affectedContracts','blocksFreshImplementation','category','humanDecisionRequired','action','remainingRisk'])check(f[k]!==undefined,'Missing '+k+' '+f.id);
 for(const p of f.affectedContracts)check(fs.existsSync(path.join(root,p)),'Unresolved contract link '+p);
}
const inv=read('data/invariants.json');
check(inv.invariants.length===21&&inv.invariants.every(i=>i.statusScope==='experimental-mechanism'),'Invariant status scope ambiguity');
check(inv.confirmedPrinciples.length===4&&inv.confirmedPrinciples.every(i=>i.status==='CONFIRMED'),'Confirmed principles missing');
const state=read('implementation-state.json');
check(state.schemaVersion===2&&state.decisionReferences.length===0&&state.status==='not-started','Current state template authority');
const gate=read('data/gates.json').gates.find(g=>g.id==='G-DOCUMENT-STABILITY-COMMITMENT');
check(gate?.status==='unresolved','Stability commitment must remain owner decision');

function enumerate(dir,prefix=''){let entries=[];for(const e of fs.readdirSync(dir,{withFileTypes:true})){
 const p=prefix+e.name;if(e.isDirectory()){if(e.name!=='node_modules'&&p!=='executable-reference/evidence/runs')entries.push(...enumerate(path.join(dir,e.name),p+'/'));}
 else if(p!=='HANDOFF_FILE_INDEX.json')entries.push(p);
}return entries.sort();}
if(process.argv.includes('--verify-index')){
 const index=read('HANDOFF_FILE_INDEX.json');const actual=enumerate(root);
 check(index.packageId==='IH-005','Current index version');
 check(JSON.stringify(index.files.map(f=>f.path).sort())===JSON.stringify(actual),'Index omission/addition');
 for(const f of index.files)check(hash(path.join(root,f.path))===f.sha256,'Index drift: '+f.path);
}
const parentArg=process.argv.indexOf('--verify-parent');
if(parentArg>=0){
 const parent=read('provenance/IH-002_PARENT_CONTENTS.json');const dir=process.argv[parentArg+1];if(!dir)throw Error('Exact IH-002 directory required');
 for(const f of parent.files)check(hash(path.join(dir,f.path))===f.sha256,'Frozen IH-002 changed: '+f.path);
}
console.log(JSON.stringify({packageId:'IH-005',status:errors.length?'FAIL':'PASS',checks,errors,claim:'Package integrity only. Full regression and independent review remain separate.'},null,2));process.exitCode=errors.length?1:0;
