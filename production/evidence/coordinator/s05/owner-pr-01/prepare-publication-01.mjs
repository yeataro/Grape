// One-shot, metadata-only bookkeeping under S05-OWNER-PR-PUBLICATION-01.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {validateImplementationState} from '../../../../../handoff/tools/check-implementation-state.mjs';
const root=process.cwd(), out='production/evidence/coordinator/s05/owner-pr-01/';
const read=f=>fs.readFileSync(path.resolve(root,f));
const sha=b=>createHash('sha256').update(b).digest('hex');
const item=f=>{const b=read(f);return {file:f,bytes:b.length,sha256:sha(b)}};
const json=f=>JSON.parse(read(f));
const git=(...a)=>execFileSync('git',a,{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024,stdio:['pipe','pipe','pipe']}).trim();
const check=(ok,m)=>{if(!ok)throw new Error(m)};
const save=(f,x)=>fs.writeFileSync(out+f,JSON.stringify(x,null,2)+'\n',{flag:'wx'});
const verify=e=>{const a=item(e.file);check(a.sha256===e.sha256&&a.bytes===e.bytes,'Identity changed: '+e.file);return a};
const p=json(out+'publication-packet-01.json');
check(sha(read(out+'publication-packet-01.json'))==='dbb92a79944fd508411c44dc73040e7239663499f3ad76bdedbd8b1f8a5e87cb','Packet hash');
check(git('rev-parse','HEAD')===p.expectedWorkHead,'HEAD');
check(git('branch','--show-current')==='work','Branch');
check(git('diff','--cached','--name-only')==='','Index not empty');
check(git('diff','--name-only')==='production/src/features/canvas.ts','Unexpected tracked changes');
check(!fs.existsSync(out+'publication-result-01.json'),'Prior publication result');
verify(p.priorActionReceipt); p.preserveDirty.forEach(verify);
const checkpoint=json(p.priorActionReceipt.file);checkpoint.untracked.forEach(verify);
const dispatch=json(out+'publication-parent-result-01.json');
check(dispatch.actionKey===p.actionKey&&dispatch.actualWriterDispatches===1,'Dispatch attribution');
check(sha(read(dispatch.intent.file))===dispatch.intent.sha256,'Parent intent');
check(dispatch.packet.sha256===item(out+'publication-packet-01.json').sha256,'Parent packet');
const tracked=git('ls-files','-z').split('\0').filter(Boolean).map(item);
const untracked=git('ls-files','--others','--exclude-standard','-z').split('\0').filter(Boolean).map(item);
save('publication-preimages-01.json',{actionKey:p.actionKey,recordedAt:new Date().toISOString(),HEAD:p.expectedWorkHead,index:[],tracked,untracked,checkpointVerified:checkpoint.untracked.length,preserveDirty:p.preserveDirty});
const sourceManifest=json('production/evidence/s05/drag-performance-repair-01/source-config-manifest-01.json');
const request=sourceManifest.files.map(e=>p.expectedWorkHead+':'+e.file).join('\n')+'\n';
const blobs=execFileSync('git',['cat-file','--batch'],{input:request,maxBuffer:64*1024*1024}); let offset=0;
for(const e of sourceManifest.files){const end=blobs.indexOf(10,offset),header=blobs.subarray(offset,end).toString(),len=Number(header.split(' ')[2]);check(Number.isFinite(len),'Missing Git object');const b=blobs.subarray(end+1,end+1+len);check(len===e.bytes&&sha(b)===e.sha256,'Committed source mismatch: '+e.file);offset=end+len+2;}
const productPaths=git('diff','--name-only',p.implementationI,p.expectedWorkHead,'--','production').split('\n').filter(Boolean).filter(f=>!f.startsWith('production/evidence/'));
check(productPaths.length===0,'I6/P6 product diff');
const repair=json('production/evidence/coordinator/s05/escape-focus-repair-01/repair-packet-01.json');
const raw=repair.rawPreservation, support=json(raw.destination+'escape-focus-supporting-manifest-01.json');
const rawEntries=[...raw.copy,...support.files], seen=new Set(), relocated=[];
for(const e of rawEntries){const normalized=path.posix.normalize(e.file.replaceAll('\\','/'));check(!path.posix.isAbsolute(normalized)&&!normalized.startsWith('../')&&!seen.has(normalized.toLowerCase()),'Unsafe/duplicate raw path');seen.add(normalized.toLowerCase());const src=path.resolve(raw.sourceRoot,normalized),dst=raw.destination+normalized; const a=read(src),b=read(dst);check(a.length===e.bytes&&sha(a)===e.sha256&&a.equals(b),'Raw original mismatch: '+e.file);relocated.push({originalRelativePath:e.file,source:src,destination:dst,bytes:e.bytes,sha256:e.sha256});}
check(relocated.length===28,'Raw object count');
save('escape-review-relocation-01.json',{recordedAt:new Date().toISOString(),actionKey:p.actionKey,originalAuthorAndVerdictUnchanged:true,normalization:'Filesystem lookup only; original manifest bytes unchanged',objects:relocated});
const stateBefore=read('implementation-state.json'),state=JSON.parse(stateBefore), before=structuredClone(state);
for(const d of state.decisionReferences.filter(d=>['DEC-GRAPE-003','AC-GRAPE-002'].includes(d.id))){
 d.scope=d.scope.replace('No product defect was found in executed scope; completed probes are not independent PASS.','No product defect was found in the original review6 executed scope; completed probes are not independent PASS. The subsequent independent natural Escape finding S05-FR-ESCAPE-FOCUS-001 is FAIL and remains open; its working repair is deferred to the next round and excluded from this publication.');
 d.scope=d.scope.replace('Human acceptance remains NOT_GRANTED.','The Human Owner confirmed the tested I6 round and explicitly requested a draft PR (message 01a105ed-87bc-7f81-8a10-b17498092110). This bounded confirmation does not change either independent verdict or register whole-S05 acceptance.');
 d.scope=d.scope.replace('No full391 catalog, acceptance or global Gate completion.','S05 remains active; its exact remaining delivery boundary is being reconciled separately. No whole-S05 completion, global Gate closure, merge or next Slice authorization is inferred.');
}
const stripped=x=>({...x,decisionReferences:x.decisionReferences.map(d=>['DEC-GRAPE-003','AC-GRAPE-002'].includes(d.id)?{...d,scope:null}:d)});
check(JSON.stringify(stripped(state))===JSON.stringify(stripped(before)),'State scope exceeded');
const validation=validateImplementationState(state,{slices:json('handoff/data/slices.json').slices,gates:json('handoff/data/gates.json').gates},f=>read(f));check(validation.errors.length===0,'State invalid: '+validation.errors.join(';'));
let stateText=stateBefore.toString();for(let n=0;n<state.decisionReferences.length;n++){const old=before.decisionReferences[n].scope,next=state.decisionReferences[n].scope;if(old!==next){check(stateText.includes(JSON.stringify(old)),'State preimage');stateText=stateText.replace(JSON.stringify(old),JSON.stringify(next));}}
fs.writeFileSync(out+'state-candidate.tmp',stateText,{flag:'wx'});fs.renameSync(out+'state-candidate.tmp','implementation-state.json');
const readmeBefore=read('README.md'); let readme=readmeBefore.toString();
const old='The measured drag-performance repair is self-checked at I `aa4c86e20b0b4b54218b9992921578e7f24a28a2` and build `S05-drag-aa4c86e`, with a new exact independent review pending.';
const next='The measured drag-performance repair at I `aa4c86e20b0b4b54218b9992921578e7f24a28a2`, reviewed R `6c3a734325d0db2d924356a9614e971d80a966c8`, and build `S05-drag-aa4c86e` has independent verdict **BLOCKED / WF_PERMISSION**: two exact LAN/Tailscale archive checks remain unexecuted. A subsequent independent natural Escape check is **FAIL**; the Owner deferred that repair to the next round. The Owner confirmed the current tested I6 round and authorized a **draft PR**; this does not change either independent verdict.';
check(readme.includes(old),'README preimage');readme=readme.replace(old,next).replace('S05 acceptance, publication, merge and the next Slice are not granted.','Draft publication of the tested I6 round is Owner-authorized. Whole-S05 acceptance/completion, merge and the next Slice are not granted; pending Escape changes are excluded from this publication.');fs.writeFileSync('README.md',readme);
save('publication-bookkeeping-01.json',{recordedAt:new Date().toISOString(),actionKey:p.actionKey,status:'METADATA_PREPARED_NOT_PUBLISHED',writer:p.writer,packet:item(out+'publication-packet-01.json'),parentDispatch:item(out+'publication-parent-result-01.json'),implementationI:p.implementationI,reviewedR:p.reviewedR,buildId:p.buildId,metadataParent:p.expectedWorkHead,sourceConfigManifest:item('production/evidence/s05/drag-performance-repair-01/source-config-manifest-01.json'),committedSourceConfigFilesVerified:sourceManifest.files.length,I6ToP6ProductDiff:productPaths,rawReviewObjectsVerified:relocated.length,stateValidation:validation.status,stateChanges:['decisionReferences DEC-GRAPE-003 scope','decisionReferences AC-GRAPE-002 scope'],stateInvariantsUnchanged:['implementationBaseline','build','activeSlices','completedSlices','acceptedEvidence','latestAcceptedEvidenceId','gateDecisions','updatedAt'],readmeBefore:{bytes:readmeBefore.length,sha256:sha(readmeBefore)},stateBefore:{bytes:stateBefore.length,sha256:sha(stateBefore)},after:[item('README.md'),item('implementation-state.json')],preservedNextRound:p.preserveDirty,reviewLimitations:p.reviewLimitations,counters:{publicationAttempt:1,publicationRetries:0,performanceRepairAttempt:1,unsuccessfulTechnicalReviewRounds:0,globalReviewSequence:6,escapeRepairAttempt:1,escapeUnsuccessfulReviewRounds:0},noProductEdits:true,noServiceOrNetworkActions:true,noAcceptanceRegistration:true});
console.log(JSON.stringify({tracked:tracked.length,untracked:untracked.length,checkpointVerified:checkpoint.untracked.length,sourceConfigVerified:sourceManifest.files.length,rawObjectsVerified:relocated.length,state:validation.status}));
