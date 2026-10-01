import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateImplementationState} from './check-implementation-state.mjs';

const baseline = {slices: [{id: 'S01'}, {id: 'S02'}], gates: [{id: 'G-TEST', status: 'unresolved'}]};
const empty = () => ({schemaVersion: 2, recordRole: 'handoff-template', handoffRevision: 'IH-005', currentRecord: '../implementation-state.json', status: 'not-started', project: null, implementationBaseline: null, build: null, activeSlices: [], completedSlices: [], gateDecisions: [], acceptedEvidence: [], decisionReferences: [], latestAcceptedEvidenceId: null, updatedAt: null});
const bytes = Buffer.from('qualification evidence fixture, not production evidence');
const evidence = (id, kind) => ({id, kind, scope: 'S01 fixture scope', file: 'fixtures/result.txt', sha256: createHash('sha256').update(bytes).digest('hex'), implementationRevision: 'fixture-revision', acceptedBy: 'fixture-reviewer', acceptedAt: '2026-10-02T00:00:00.000Z', sliceIds: ['S01'], gateIds: ['G-TEST']});
function active() { return {...empty(), recordRole: 'current', status: 'active', project: {id: 'fixture', root: './fixture-project'}, implementationBaseline: {id: 'fixture-baseline', revision: 'fixture-revision', decisionReferenceIds: []}, activeSlices: ['S01'], updatedAt: '2026-10-02T00:00:00.000Z'}; }
const verify = s => validateImplementationState(s, baseline, () => bytes);

test('untouched not-started template preserves inherited unresolved Gates', () => {
  const r = verify(empty()); assert.equal(r.status, 'TEMPLATE_VALID');
  assert.deepEqual(r.inheritedGates, [{gateId: 'G-TEST', baselineStatus: 'unresolved', scopedDecisions: []}]);
});
test('frozen template rejects implementation progress', () => {
  const s = active(); s.recordRole = 'handoff-template'; assert.equal(verify(s).status, 'INVALID');
});
test('not-started cannot fabricate baseline or evidence', () => {
  const s = empty(); s.implementationBaseline = {id: 'invented', revision: 'invented'}; assert.equal(verify(s).status, 'INVALID');
});
test('current active state requires real identity and known slice IDs', () => {
  assert.equal(verify(active()).status, 'CURRENT_RECORD_VALID');
  const s = active(); s.activeSlices = ['UNKNOWN']; assert.equal(verify(s).status, 'INVALID');
});
test('completion needs same-revision product and conformance accepted evidence', () => {
  const s = active(); s.status = 'complete'; s.activeSlices = [];
  s.acceptedEvidence = [evidence('PB', 'product-behavior'), evidence('AC', 'architecture-conformance')]; s.latestAcceptedEvidenceId = 'AC';
  s.completedSlices = [{sliceId: 'S01', scope: 'fixture scope', implementationRevision: 'fixture-revision', evidenceIds: ['PB', 'AC']}];
  assert.equal(verify(s).status, 'CURRENT_RECORD_VALID');
  s.acceptedEvidence[1].implementationRevision = 'older'; assert.equal(verify(s).status, 'INVALID');
});
test('Gate resolution needs addressed accepted evidence; baseline is never rewritten', () => {
  const s = active(); s.gateDecisions = [{gateId: 'G-TEST', scope: 'fixture platform', disposition: 'resolved-for-scope', reason: 'fixture result', residualScope: 'All other platforms still unresolved', evidenceIds: []}];
  assert.equal(verify(s).status, 'INVALID');
  s.acceptedEvidence = [evidence('I', 'integration')]; s.latestAcceptedEvidenceId = 'I'; s.gateDecisions[0].evidenceIds = ['I'];
  const r = verify(s); assert.equal(r.status, 'CURRENT_RECORD_VALID'); assert.equal(r.inheritedGates[0].baselineStatus, 'unresolved');
});
test('unknown Gate and unaddressed evidence are rejected', () => {
  const s = active(); s.acceptedEvidence = [evidence('I', 'integration')]; s.latestAcceptedEvidenceId = 'I';
  s.gateDecisions = [{gateId: 'G-UNKNOWN', scope: 'fixture', disposition: 'resolved-for-scope', reason: 'fixture', residualScope: 'none', evidenceIds: ['I']}];
  assert.equal(verify(s).status, 'INVALID');
});
test('missing or altered evidence bytes cannot pass digest validation', () => {
  const s = active(); s.acceptedEvidence = [evidence('I', 'integration')]; s.latestAcceptedEvidenceId = 'I';
  assert.equal(validateImplementationState(s, baseline, () => Buffer.from('different')).status, 'INVALID');
  assert.equal(validateImplementationState(s, baseline, () => {throw new Error('missing');}).status, 'INVALID');
});
test('latest evidence must refer to newest acceptedAt, not stale success', () => {
  const s = active(); s.acceptedEvidence = [evidence('old', 'integration'), evidence('new', 'integration')];
  s.acceptedEvidence[1].acceptedAt = '2026-10-02T01:00:00.000Z'; s.latestAcceptedEvidenceId = 'old'; assert.equal(verify(s).status, 'INVALID');
});
test('malformed completion evidence is an invalid result rather than a crash', () => {
  const s = active(); s.activeSlices = []; s.completedSlices = [{sliceId: 'S01', evidenceIds: 'not-an-array'}];
  assert.equal(verify(s).status, 'INVALID');
});
test('null or primitive evidence entries are rejected without a latest-date crash', () => {
  for (const bad of [null, 42, 'bad']) {
    const s = active(); s.acceptedEvidence = [bad, evidence('I', 'integration')]; s.latestAcceptedEvidenceId = 'I';
    assert.equal(verify(s).status, 'INVALID');
  }
});

const decision=()=>({id:'AC-TEST',kind:'architecture-change',status:'accepted',scope:'fixture',reason:'fixture counterexample',file:'fixtures/decision.md',sha256:createHash('sha256').update(bytes).digest('hex'),sliceIds:['S01'],gateIds:[],evidenceIds:[],acceptedBy:'fixture-reviewer',acceptedAt:'2026-10-02T00:00:00.000Z'});
test('M6 current baseline references an explicit accepted AC without overwriting sealed qualification',()=>{const s=active();s.decisionReferences=[decision()];s.implementationBaseline.decisionReferenceIds=['AC-TEST'];assert.equal(verify(s).status,'CURRENT_RECORD_VALID');assert.equal(baseline.gates[0].status,'unresolved');});
test('M6 proposed/missing AC cannot silently become baseline authority',()=>{const s=active();s.implementationBaseline.decisionReferenceIds=['AC-TEST'];assert.equal(verify(s).status,'INVALID');s.decisionReferences=[{...decision(),status:'proposed'}];assert.equal(verify(s).status,'INVALID');});
test('M6 decision hashes, duplicates and malformed references fail',()=>{for(const d of [{...decision(),sha256:'0'.repeat(64)},null,{...decision(),sliceIds:['bad']}]){const s=active();s.decisionReferences=[d];assert.equal(verify(s).status,'INVALID');}const s=active();s.decisionReferences=[decision(),decision()];assert.equal(verify(s).status,'INVALID');});
test('M6 IH002 schema is not silently adopted as IH003 progress',()=>{const s=empty();s.schemaVersion=1;assert.equal(verify(s).status,'INVALID');});

test('IHR4-N01 only current IH-005 instructions/template may register this baseline', () => {
  assert.equal(verify(empty()).status, 'TEMPLATE_VALID');
  for (const old of ['IH-003','IH-004']) {
    const state = empty(); state.handoffRevision = old;
    assert.equal(verify(state).status, 'INVALID');
  }
});

test('IH005 inherited product deferral is not PASS or an unresolved-coordinator implementation requirement', () => {
  const scope = {slices: baseline.slices, gates: [{id:'G-MIXED-HISTORY', status:'DEFERRED_BY_PRODUCT_DECISION'}, {id:'G-LU-UI-009',status:'unresolved'}]};
  const result = validateImplementationState(empty(), scope, () => bytes);
  assert.equal(result.status, 'TEMPLATE_VALID');
  assert.equal(result.inheritedGates[0].baselineStatus, 'DEFERRED_BY_PRODUCT_DECISION');
  assert.equal(result.inheritedGates[1].baselineStatus, 'unresolved');
  assert.deepEqual(result.inheritedGates.map(g=>g.scopedDecisions), [[],[]]);
});
