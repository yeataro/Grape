// Maintainer-only local repair sealing. Not product bootstrap, acceptance or S01 authorization.
// Run only after the full runner passes; verifies all available frozen sibling snapshots.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const write=(p,data)=>fs.writeFileSync(path.join(root,p),JSON.stringify(data,null,2)+'\n');
const report=read('audit/evidence/RUN_HANDOFF.json');
if(report.packageId!=='IH-005'||report.status!=='PASS'||report.mode!=='full-reference-and-package')throw Error('Full current regression required');
for(const r of report.results){
  if(r.exitCode!==0||hash(path.join(root,r.log))!==r.sha256)throw Error('Run evidence invalid: '+r.name);
  if(r.counts&&(r.counts.tests!==r.counts.pass||r.counts.fail||r.counts.skipped||r.counts.cancelled||r.counts.todo))throw Error('Incomplete tests: '+r.name);
}
const now=new Date().toISOString();
const history=[];
for(const name of ['implementation-handoff','implementation-handoff-r2','implementation-handoff-r3','implementation-handoff-r4']){
  const dir=path.resolve(root,'..',name),idx=path.join(dir,'HANDOFF_FILE_INDEX.json');
  if(!fs.existsSync(idx))throw Error('Sealing requires original sibling snapshot: '+name);
  const manifest=JSON.parse(fs.readFileSync(idx,'utf8'));
  for(const f of manifest.files)if(hash(path.join(dir,f.path))!==f.sha256)throw Error('Frozen previous revision changed: '+name+'/'+f.path);
  history.push({packageId:manifest.packageId,path:'../'+name,verifiedFiles:manifest.files.length,indexSha256:hash(idx),status:'UNCHANGED'});
}
write('audit/FROZEN_PARENT_VERIFICATION.json',{verifiedAt:now,method:'Read-only SHA256 verification against each previous revision own sealed index; no previous file rewritten',revisions:history});
const counts=[...report.results.filter(x=>x.counts).map(x=>x.counts),report.referenceCounts,report.nodeAndHostExampleCounts];
if(counts.some(x=>!x||x.pass!==x.tests||x.fail||x.skipped||x.cancelled||x.todo))throw Error('Full pass without skips required');
const totals=Object.fromEntries(['tests','pass','fail','skipped','cancelled','todo'].map(k=>[k,counts.reduce((n,x)=>n+x[k],0)]));
const repair=read('data/ih005-repair.json');repair.status='READY FOR TARGETED RE-REVIEW';write('data/ih005-repair.json',repair);
const reference=read('executable-reference/evidence/PACKAGE_VALIDATION.json');
write('audit/IH005_VALIDATION.json',{
  packageId:'IH-005',parentPackageId:'IH-004',status:'EXECUTED_REGRESSION_PASS',submissionStatus:'READY FOR TARGETED RE-REVIEW',
  completedAt:report.completedAt,summaryRecordedAt:now,totals,
  directEvidence:{document:{retained:'DF01..DF17',added:'DW01..DW13',tests:30,log:'audit/evidence/production-contract-tests.txt'},panel:{added:'PC01..PC13',log:'audit/evidence/repair-tests.txt'},decision:{added:'PD01..PD09 + two locator cases',kind:'Scope/integrity only, NOT production Undo behavior',logs:['audit/evidence/ih005-decision-tests.txt','audit/evidence/implementation-state-tests.txt']}},
  commands:report.results.map(({name,exitCode,log,sha256,counts})=>({name,exitCode,log,sha256,...(counts?{counts}:{})})),
  browser:{tooling:reference.browserTooling,observedBrowserDiagnostics:reference.observedBrowserDiagnostics,scope:'Existing bounded WebGL qualification only; no new physical GPU, TD or production UI compatibility claim'},
  failedValidationHistory:repair.validationCausedRepairs,
  initialFullRun:{evidence:'audit/failed-runs/IH005-initial/RUN_HANDOFF.json',failures:['New scope checker referred to effectiveDisposition instead of canonical effectiveProductDisposition; corrected test path, not policy.','New repair index omitted executable-reference/repair prefix on Panel contract locator; corrected index.','Browser provider was not selected and two environment tests skipped; rerun selected already installed Playwright explicitly, with recorded version/hash. No skipped test accepted.']},
  immutableParents:'audit/FROZEN_PARENT_VERIFICATION.json',
  productAcceptance:'NOT_EXECUTED',deferredAcceptance:'AT-S09-03 remains DEFERRED_BY_PRODUCT_DECISION; ten AT-DEC-GRAPE-001 cases REQUIRED_NOT_EXECUTED',
  independentAcceptance:'pending',productionImplementationStarted:false,repositoryBundleProduced:false,
  s01ArchitectureDecisionsStillToInvent:'NONE',s01BlockingExternalInformation:'NONE',
  qualificationLimits:report.limits,
  newHumanProductDecisionRequired:false,
  retainedGates:['G-LU-UI-009','G-LU-UI-008','Host authority/CAS/receipts/readback','real TD/native/GPU','browser/device/IME','TOE/TOX evidence','G-DOCUMENT-STABILITY-COMMITMENT (public promise, not internal S01)']
});
const areas=[
 ['A','Architecture completeness','Exact production wire plus scoped Panel authority supplied; no broader research or ownership change.'],
 ['B','Responsibility clarity','Core codec/hydrator/module codec/Generator responsibilities separated; Application owns commands, Workspace owns origin binding, shell owns event guard.'],
 ['C','Extension clarity','Editable Panel uses normal registration and optional public mount capability, no Graph/History/private state/type switch. Existing Node/Widget/localization seams retained.'],
 ['D','Implementation executability','S01 technical schema/SDK responsibility is explicit. No missing S01 external input; production has not started.'],
 ['E','Legacy traceability','618 leaves retain frozen CQ evidence. LC-UI-100 effective deferral is separate from source Partial; original unified acceptance survives.'],
 ['F','Gate completeness','S08/S09 coordinator prerequisite removed by accepted decision; LU-UI-009/CAS/native authority/Reload safety remain required, never presumed passed.'],
 ['G','UI portability','Prior reference/screenshots unchanged; new example is fake-surface authority qualification only. Real browser UI remains gated.'],
 ['H','Executable specification validity',`${totals.pass}/${totals.tests} passing, no skips/failures; strict TypeScript, conformance and protected-source hashes pass.`],
 ['I','Package self-sufficiency','Current locator, format, examples, lifecycle and deferred scope have package-only answers; peer cross-check repaired two actual counterexamples. Independent re-review still required.']
].map(([id,area,evidence])=>({id,area,result:'LOCAL REPAIR QUALIFIED',evidence}));
write('audit/FINAL_HANDOFF_AUDIT.json',{packageId:'IH-005',disposition:'READY FOR TARGETED RE-REVIEW',independentAcceptance:'pending',productionStarted:false,items:areas,validation:'audit/IH005_VALIDATION.json',freshContext:'audit/FRESH_CONTEXT_SIMULATION.md',scope:'Local repair audit only, not HANDOFF PASS'});
fs.writeFileSync(path.join(root,'audit/FINAL_HANDOFF_AUDIT.md'),'# IH-005 local repair audit\n\n**READY FOR TARGETED RE-REVIEW. Independent acceptance remains pending. No S01 or repository bundle.**\n\n| Area | Local repair result and evidence |\n|---|---|\n'+areas.map(x=>'| '+x.id+' — '+x.area+' | '+x.evidence+' |').join('\n')+'\n\nExecutable counts and failed-validation history: [IH005_VALIDATION.json](IH005_VALIDATION.json). Package-only walkthrough: [FRESH_CONTEXT_SIMULATION.md](FRESH_CONTEXT_SIMULATION.md). Frozen-parent checks: [FROZEN_PARENT_VERIFICATION.json](FROZEN_PARENT_VERIFICATION.json). Historical audit retained under previous-IH-004/.\n\nNo new owner product decision is required by these repairs. The existing public document-stability commitment Gate remains; it does not block internal S01. All TD/GPU/browser/native evidence limits remain. The ten new domain-separated behavior acceptance cases are requirements, not tests executed by this repair.\n');
const revision=read('HANDOFF_REVISION.json');revision.status='READY FOR TARGETED RE-REVIEW';revision.finalizedAt=now;write('HANDOFF_REVISION.json',revision);
function enumerate(dir,prefix=''){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=prefix+e.name;return e.isDirectory()?e.name==='node_modules'||p==='executable-reference/evidence/runs'?[]:enumerate(path.join(dir,e.name),p+'/'):p==='HANDOFF_FILE_INDEX.json'?[]:[p];}).sort();}
const old=new Map(read('provenance/IH-004_PARENT_CONTENTS.json').files.map(f=>[f.path,f.sha256]));
const current=enumerate(root),changes=[];
for(const p of current.filter(x=>x!=='HANDOFF_CHANGES.json')){const sha256=hash(path.join(root,p));if(old.get(p)!==sha256)changes.push({path:p,kind:old.has(p)?'changed-in-new-revision':'added-in-new-revision',previousSha256:old.get(p)??null,sha256});}
for(const p of old.keys())if(p!=='HANDOFF_FILE_INDEX.json'&&p!=='HANDOFF_CHANGES.json'&&!current.includes(p))changes.push({path:p,kind:'absent-in-new-revision',previousSha256:old.get(p)});
write('HANDOFF_CHANGES.json',{packageId:'IH-005',parent:'IH-004',purpose:'Only IHR4 wire repair, accepted DEC-GRAPE-001 scope, editable Panel authority and current locator consistency; parent unchanged.',excluded:['HANDOFF_FILE_INDEX.json (derived index)','HANDOFF_CHANGES.json (self)','node_modules','executable-reference/evidence/runs'],changes});
write('HANDOFF_FILE_INDEX.json',{packageId:'IH-005',parentPackageId:'IH-004',capturedAt:now,status:revision.status,independentAcceptance:'pending',purpose:'Frozen local repair content index; not final acceptance/S01 authorization or repository bundle.',excluded:['HANDOFF_FILE_INDEX.json','node_modules','executable-reference/evidence/runs'],files:enumerate(root).map(p=>({path:p,sha256:hash(path.join(root,p))}))});
console.log(JSON.stringify({packageId:'IH-005',status:revision.status,totals,previousRevisions:history.map(x=>({packageId:x.packageId,verifiedFiles:x.verifiedFiles,status:x.status})),files:read('HANDOFF_FILE_INDEX.json').files.length,changes:changes.length},null,2));
