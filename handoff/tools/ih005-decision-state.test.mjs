// Handoff scope/integrity qualification. These are NOT product Undo acceptance tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const bytes=p=>fs.readFileSync(new URL(p,root));
const read=p=>JSON.parse(bytes(p));
const hash=p=>createHash('sha256').update(bytes(p)).digest('hex');
const decision=read('provenance/product-decisions/DEC-GRAPE-001.json');
const coverage=read('data/capability-coverage.json');
const gates=read('data/gates.json').gates;
const slices=read('data/slices.json').slices;
const acceptance=read('data/acceptance-index.json').entries;
const parent=read('provenance/IH-004_PARENT_CONTENTS.json');
const gate=id=>gates.find(x=>x.id===id);
const slice=id=>slices.find(x=>x.id===id);
const leaf=id=>coverage.entries.find(x=>x.capabilityId===id);
const deferred='DEFERRED_BY_PRODUCT_DECISION';

test('PD01 accepted owner decision artifacts are copied byte-identically, not reauthorized',()=>{
  assert.equal(decision.id,'DEC-GRAPE-001');assert.equal(decision.status,'accepted');
  const provenance=read('provenance/product-decisions/COPY_PROVENANCE.json');
  assert.equal(provenance.artifacts.length,3);
  for(const a of provenance.artifacts)assert.equal(hash(a.packagePath),a.sha256);
  assert.equal(decision.architectureCheck.result,'NONE');
});

test('PD02 effective scope is deferred, frozen qualification remains Partial and not Covered',()=>{
  assert.equal(gate('G-MIXED-HISTORY').status,deferred);
  assert.equal(gate('G-MIXED-HISTORY').sourceGateSnapshot.status,'unresolved');
  const c=leaf('LC-UI-100');assert.equal(c.sourceDisposition,'Partial');assert.equal(c.effectiveProductDisposition,deferred);
  const a=acceptance.find(x=>x.capabilityId==='LC-UI-100');
  assert.equal(a.qualificationDisposition,'Partial');assert.equal(a.productionAcceptance,deferred);
  assert.equal(a.productDecisionRef.id,decision.id);
  assert.equal(coverage.entries.length,618);
});

test('PD03 unified chronology oracle survives verbatim, unexecuted and deferred',()=>{
  const a=slice('S09').acceptanceTests.find(x=>x.id==='AT-S09-03');
  assert.equal(a.status,deferred);
  assert.deepEqual(a.originalAcceptance,decision.preservedOriginalAcceptance);
  for(const k of ['given','when','then'])assert.equal(a[k],decision.preservedOriginalAcceptance[k]);
  assert.equal(acceptance.find(x=>x.capabilityId==='LC-UI-100').leafOracle.id,'LC-UI-100');
});

test('PD04 all ten domain-separated replacements are required, never reported executed',()=>{
  assert.equal(decision.acceptanceCases.length,10);
  for(const expected of decision.acceptanceCases){
    const current=slice('S09').acceptanceTests.find(x=>x.id===expected.id);
    assert.ok(current,expected.id);
    for(const k of ['given','when','then','status'])assert.deepEqual(current[k],expected[k],expected.id+':'+k);
    assert.equal(current.status,'REQUIRED_NOT_EXECUTED');
    assert.deepEqual(current.evidence,[]);
  }
  assert.equal(decision.productAcceptance.status,'NOT_EXECUTED');
});

test('PD05 defer removes only coordinator prerequisite; async/load/native safety remains required',()=>{
  for(const id of ['S08','S09']){
    const s=slice(id);assert.equal(s.scopeStatus,'SCOPE_ADJUSTED_NOT_STARTED');
    assert.ok(!s.gates.includes('G-MIXED-HISTORY'));assert.ok(s.deferredGateIds.includes('G-MIXED-HISTORY'));
    assert.ok(s.gates.includes('G-LU-UI-009'));
  }
  for(const id of ['G-LU-UI-008','G-LU-UI-009','G-LU-HOST-007'])assert.equal(gate(id).status,'unresolved');
  assert.equal(leaf('LC-UI-101').sourceDisposition,'Partial');
  assert.notEqual(leaf('LC-UI-101').effectiveProductDisposition,deferred);
  assert.ok(slice('S08').acceptanceTests.some(x=>x.id==='AT-S08-03'&&x.status==='planned-not-executed-in-handoff'));
  assert.ok(slice('S09').acceptanceTests.some(x=>x.id==='AT-S09-01'&&x.status==='planned-not-executed-in-handoff'));
  assert.ok(slice('S09').acceptanceTests.some(x=>x.id==='AT-S09-02'&&x.status==='planned-not-executed-in-handoff'));
});

test('PD06 canonical History/Host/CAS/snapshot and scoped parameter implementation are unchanged',()=>{
  for(const p of ['executable-reference/core.ts','executable-reference/contracts.ts','executable-reference/qualification-host.ts','executable-reference/qualification-updates.ts','executable-reference/repair/scoped-parameter.ts','data/invariants.json']){
    assert.equal(hash(p),parent.files.find(f=>f.path===p)?.sha256,p);
  }
  for(const term of ['LU-UI-009 lifetime protection','stale receipt protection','load / epoch fencing','Host authority','CAS / conditional-write semantics','Graph History canonical ownership'])assert.ok(decision.protectedObligations.includes(term),term);
});

test('PD07 inherited decision is not fabricated implementation progress',()=>{
  const r=read('HANDOFF_REVISION.json'),s=read('implementation-state.json');
  assert.equal(r.packageId,'IH-005');assert.equal(r.productionImplementationStarted,false);
  assert.ok(r.productDecisions.includes(decision.id));
  assert.equal(s.handoffRevision,'IH-005');assert.equal(s.status,'not-started');
  assert.deepEqual(s.activeSlices,[]);assert.deepEqual(s.completedSlices,[]);
  assert.deepEqual(s.acceptedEvidence,[]);assert.deepEqual(s.decisionReferences,[]);
  assert.equal(s.implementationBaseline,null);
});

test('PD08 production ledger retains inherited view seams and new exact wire/Panel seams',()=>{
  const l=read('data/production-contract-ledger.json');
  assert.equal(l.revision,'IH-005');
  for(const a of read('provenance/IH-004_CONTRACT_LEDGER.json').additions)assert.ok(l.additions.some(x=>x.id===a.id),a.id);
  for(const id of ['PC-WIRE-EVIDENCE','PC-PRESERVATION-CODECS','PC-PANEL-COMMANDS'])assert.ok(l.additions.some(x=>x.id===id));
  assert.equal(l.additions.find(x=>x.id==='PC-WIRE-EVIDENCE').classification,'EXACT_IDENTITY');
  assert.equal(l.additions.find(x=>x.id==='PC-PANEL-COMMANDS').spec,'17_PANEL_COMMAND_CONTRACT.md');
});

test('PD09 current instructions use IH-005 state and keep historical text clearly historical',()=>{
  const plan=bytes('08_IMPLEMENTATION_PLAN.md').toString();
  assert.ok(plan.includes('IH-005'));
  assert.ok(!/handoffRevision.{0,8}IH-003/.test(plan));
  assert.ok(bytes('00_README.md').toString().includes('grape.document 2.0'));
  assert.ok(bytes('START_HERE_PROMPT.md').toString().includes('不授權開始 S01'));
  assert.ok(bytes('provenance/product-decisions/README.md').toString().includes('歷史'));
});
