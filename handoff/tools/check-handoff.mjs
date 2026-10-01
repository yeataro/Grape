// Package integrity and traceability checks, not product acceptance.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const errors=[]; let checks=0;
function check(ok,message){checks++;if(!ok)errors.push(message);}
const docs=['00_README.md','01_PRODUCT_MODEL.md','02_ARCHITECTURE_SPEC.md','03_RESPONSIBILITY_AND_DEPENDENCY.md','04_EXTENSION_MODEL.md','05_DATA_AND_LIFECYCLE.md','06_HOST_INTEGRATION.md','07_DEPLOYMENT_MODEL.md','08_IMPLEMENTATION_PLAN.md','09_ACCEPTANCE_AND_CONFORMANCE.md','10_KNOWN_GATES.md','11_LEGACY_COMPATIBILITY.md','12_DECISION_LOG.md','13_PRODUCTION_CONTRACT_SURFACE.md','14_DOCUMENT_FORMAT.md','15_LOCALIZATION_CONTRACT.md','SECOND_REVIEW_RECONCILIATION.md','16_VIEW_MOUNT_CONTRACT.md','17_PANEL_COMMAND_CONTRACT.md','audit/IH005_REPAIR.md','audit/FINAL_REVIEW_REPAIR.md','ui-reference/UI_SPEC.md','ui-reference/SCREEN_INDEX.md'];
for(const p of docs)check(fs.existsSync(path.join(root,p)),`Missing required document ${p}`);
const inventory=read('compatibility/capabilities.json'),coverage=read('data/capability-coverage.json'),gates=read('data/gates.json').gates,slices=read('data/slices.json').slices,lock=read('SOURCE_BASELINES.json');
const caps=inventory.capabilities,ids=new Set(caps.map(c=>c.id)),gids=new Set(gates.map(g=>g.id)),sids=new Set(slices.map(s=>s.id));
check(caps.length===618&&ids.size===618,'IR-001 capability cardinality changed');
check(coverage.entries.length===618&&new Set(coverage.entries.map(e=>e.capabilityId)).size===618,'Coverage not one-to-one');
check(coverage.groups.length===345,'Frozen coverage group count changed');
for(const e of coverage.entries)check(ids.has(e.capabilityId),`Unknown coverage ID ${e.capabilityId}`);
const sourceHashes=read('provenance/CQ-SUMMARY-HASHES.json');
for(const e of coverage.entries){
 const original=Object.fromEntries(sourceHashes.fields.map(k=>[k,e.sourceSummary?.[k]]));
 check(createHash('sha256').update(JSON.stringify(original)).digest('hex')===sourceHashes.entries.find(x=>x.capabilityId===e.capabilityId)?.sha256,`Source summary altered ${e.capabilityId}`);
 check(e.sourceSummary?.status==='historical-non-normative-summary',`CQ summary authority not separated ${e.capabilityId}`);
 check(e.persistence.graphOwner==='Graph / application persistence',`Canonical persistence owner absent ${e.capabilityId}`);
 for(const p of e.executionPath)if(p.owner==='Generator')check(p.mutatesCanonicalModel===false,`Generator mutation boundary absent ${e.capabilityId}`);
}
const groupMap=new Map(coverage.groups.map(g=>[g.id,g]));
for(const e of coverage.entries)check(groupMap.get(e.groupId)?.capabilityIds.includes(e.capabilityId),`Group lookup mismatch ${e.capabilityId}`);
const counts={}; for(const e of coverage.entries)counts[e.sourceDisposition]=(counts[e.sourceDisposition]??0)+1;
check(counts.Covered===262&&counts.Partial===348&&counts['Product Decision Required']===8,'Frozen dispositions changed');
check(caps.filter(c=>c.classification==='Environment-bound').length===215,'Environment-bound count changed');
check(caps.filter(c=>c.transformationRequired).length===215,'Transformation-required count changed');
check(gids.size===gates.length,'Duplicate Gate IDs');
const unknownGates=gates.filter(g=>g.sourceUnknownId&&g.kind==='legacy-unknown');
check(unknownGates.length===33&&new Set(unknownGates.map(g=>g.sourceUnknownId)).size===33,'All33 sourceUNKNOWN must have one baseGate');
for(const u of coverage.unknowns){const gs=unknownGates.filter(g=>g.sourceUnknownId===u.id);check(gs.length===1,`Missing/duplicate UNKNOWN gate ${u.id}`);if(gs.length)check(u.capabilityIds.every(id=>gs[0].capabilityIds.includes(id)),`Gate dropped affected capability ${u.id}`);}
check(unknownGates.filter(g=>g.architectureSignificant).length===13,'Significant UNKNOWN count changed');
for(const g of gates){for(const k of ['unknownBehavior','blocks','doesNotBlock','earliestRequiredPhase','requiredEvidence','disproofAction'])check(g[k]!==undefined&&String(g[k]).length>0,`${g.id} missing ${k}`);for(const id of g.capabilityIds??[])check(ids.has(id),`${g.id} unknowncap ${id}`);for(const id of g.sliceIds??[])check(sids.has(id),`${g.id} unknownslice ${id}`);}
const mandatory=['productBehaviorDelivered','capabilityIds','coverageGroupIds','architectureResponsibilities','prerequisites','gates','requiredProductDecisions','implementationScope','explicitNonGoals','acceptanceTests','runtimeIntegrationEvidence','architectureConformanceChecks','completionDefinition','mayProceedInParallel'];
check(sids.size===slices.length,'Duplicate slice IDs');
for(const s of slices){for(const k of mandatory)check(s[k]!==undefined,`${s.id} missing ${k}`);for(const id of s.capabilityIds)check(ids.has(id),`${s.id} unknowncap ${id}`);for(const id of s.coverageGroupIds)check(groupMap.has(id),`${s.id} unknown group ${id}`);for(const id of [...s.gates,...s.requiredProductDecisions])check(gids.has(id),`${s.id} unknowngate ${id}`);for(const id of s.prerequisites)check(sids.has(id)&&id!==s.id,`${s.id} invalid prerequisite ${id}`);for(const t of s.acceptanceTests){
 const planned=t.status?.startsWith('planned')||t.status==='REQUIRED_NOT_EXECUTED';
 const deferred=t.id==='AT-S09-03'&&t.status==='DEFERRED_BY_PRODUCT_DECISION';
 check(planned||deferred,`${t.id} must be planned/unexecuted or explicitly product-deferred; never counted PASS`);
}}
for(const s of slices)for(const p of s.conditionalPrerequisites??[]){check(sids.has(p.sliceId)&&p.sliceId!==s.id,`${s.id} invalid conditional prerequisite`);check(Boolean(p.branch&&p.output),`${s.id} conditional prerequisite lacks scope`);}
const visited=new Set(),active=new Set();function visit(id){if(active.has(id)){check(false,`Slice dependency cycle at ${id}`);return;}if(visited.has(id))return;active.add(id);const s=slices.find(s=>s.id===id);for(const p of [...(s?.prerequisites??[]),...(s?.conditionalPrerequisites??[]).map(p=>p.sliceId)])visit(p);active.delete(id);visited.add(id);}for(const s of slices)visit(s.id);
const assigned=new Set(slices.flatMap(s=>s.capabilityIds));check([...ids].every(id=>assigned.has(id)),'Unassigned compatibility leaf (not necessarily full implementation in one slice)');
const acceptance=read('data/acceptance-index.json').entries;
check(acceptance.length===618&&new Set(acceptance.map(e=>e.capabilityId)).size===618,'Acceptance index cardinality');
for(const e of acceptance){check(ids.has(e.capabilityId)&&groupMap.has(e.groupId),`Invalid acceptance identity ${e.capabilityId}`);const actualSlices=slices.filter(s=>s.capabilityIds.includes(e.capabilityId)).map(s=>s.id);const actualGates=gates.filter(g=>g.capabilityIds.includes(e.capabilityId)).map(g=>g.id);check(JSON.stringify(e.sliceIds)===JSON.stringify(actualSlices),`Stale acceptance slice join ${e.capabilityId}`);check(JSON.stringify(e.gateIds)===JSON.stringify(actualGates),`Stale acceptance gate join ${e.capabilityId}`);check(e.productionAcceptance==='not-executed'||(e.capabilityId==='LC-UI-100'&&e.productionAcceptance==='DEFERRED_BY_PRODUCT_DECISION'&&e.effectiveProductDisposition==='DEFERRED_BY_PRODUCT_DECISION'),`Unexpected acceptance claim ${e.capabilityId}`);}
for(const input of lock.immutableInputs){const bytes=fs.readFileSync(path.join(root,input.path));check(createHash('sha256').update(bytes).digest('hex')===input.sha256,`Baseline copy drift ${input.path}`);}
const refs=read('executable-reference/SOURCE_PROVENANCE.json');for(const f of refs.files){const p=path.join(root,'executable-reference',f.copiedPath);check(fs.existsSync(p)&&createHash('sha256').update(fs.readFileSync(p)).digest('hex')===f.sha256,`Reference drift ${f.copiedPath}`);}
for(const p of docs.filter(p=>fs.existsSync(path.join(root,p)))){
 const text=fs.readFileSync(path.join(root,p),'utf8');
 for(const m of text.matchAll(/\]\(([^)]+)\)/g)){
  const raw=m[1].replace(/^<|>$/g,'');if(/^(https?:|mailto:|#)/.test(raw))continue;
  const target=raw.split('#')[0].replace(/:\d+$/,'');if(!target)continue;
  check(!/^[a-zA-Z]:[\\/]/.test(target)&&!target.startsWith('/'),`${p} requires absolute outside path ${target}`);
  const resolved=path.resolve(root,path.dirname(p),target);
  check(resolved.startsWith(root+path.sep)&&fs.existsSync(resolved),`${p} broken/outside link ${target}`);
 }
}
const report={scope:'Package integrity/traceability/link checks only; semantic review and production acceptance separate',status:errors.length?'FAIL':'PASS',checks,capabilities:caps.length,coverageGroups:coverage.groups.length,slices:slices.length,gates:gates.length,unknownGates:unknownGates.length,errors};
console.log(JSON.stringify(report,null,2));process.exitCode=errors.length?1:0;
