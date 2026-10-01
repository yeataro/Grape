// Read-only progress validation. Does not start implementation or authenticate approval.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const nonempty = x => typeof x === 'string' && x.trim().length > 0;
const date = x => nonempty(x) && /^\d{4}-\d{2}-\d{2}T/.test(x) && Number.isFinite(Date.parse(x));
const digest = x => typeof x === 'string' && /^[a-f0-9]{64}$/.test(x);
const unique = xs => Array.isArray(xs) && new Set(xs).size === xs.length;

export function validateImplementationState(state, baseline, readEvidence) {
  const errors = [];
  const check = (ok, message) => { if (!ok) errors.push(message); };
  if (!state || typeof state !== 'object') return {status: 'INVALID', errors: ['State must be an object.']};
  check(state.schemaVersion === 2, 'Unsupported progress schema.');
  check(['handoff-template', 'current'].includes(state.recordRole), 'Invalid recordRole.');
  check(state.handoffRevision === 'IH-005', 'Record must reference IH-005; adoption of another revision is explicit.');
  check(state.currentRecord === '../implementation-state.json', 'Canonical current locator changed.');
  check(['not-started', 'active', 'paused', 'complete'].includes(state.status), 'Invalid progress status.');
  for (const key of ['activeSlices', 'completedSlices', 'gateDecisions', 'acceptedEvidence', 'decisionReferences'])
    check(Array.isArray(state[key]), `${key} must be an array.`);
  if (errors.length) return {status: 'INVALID', errors};

  const sids = new Set(baseline.slices.map(s => s.id));
  const gates = new Map(baseline.gates.map(g => [g.id, g]));
  check(unique(state.activeSlices), 'Duplicate active slice.');
  for (const id of state.activeSlices) check(sids.has(id), `Unknown active slice ${id}.`);
  check(unique(state.completedSlices.map(s => s?.sliceId)), 'Duplicate completed slice.');
  check(unique(state.acceptedEvidence.map(e => e?.id)), 'Duplicate accepted evidence.');
  check(unique(state.gateDecisions.map(d => d?.gateId + ':' + d?.scope)), 'Duplicate Gate/scope decision.');

  const evidence = new Map();
  for (const e of state.acceptedEvidence) {
    check(e && typeof e === 'object', 'Invalid evidence record.');
    if (!e || typeof e !== 'object') continue;
    check(nonempty(e.id) && nonempty(e.scope) && nonempty(e.file) && digest(e.sha256), `Evidence identity/scope/file/digest missing: ${e.id}.`);
    check(['product-behavior', 'architecture-conformance', 'integration', 'product-decision'].includes(e.kind), `Invalid evidence kind: ${e.id}.`);
    check(nonempty(e.implementationRevision) && nonempty(e.acceptedBy) && date(e.acceptedAt), `Evidence revision/acceptance missing: ${e.id}.`);
    check(unique(e.sliceIds) && e.sliceIds.every(id => sids.has(id)), `Evidence has unknown/duplicate slices: ${e.id}.`);
    check(unique(e.gateIds) && e.gateIds.every(id => gates.has(id)), `Evidence has unknown/duplicate Gates: ${e.id}.`);
    if (nonempty(e.file) && digest(e.sha256) && readEvidence) {
      try { check(createHash('sha256').update(readEvidence(e.file)).digest('hex') === e.sha256, `Evidence digest mismatch: ${e.id}.`); }
      catch { check(false, `Evidence unreadable: ${e.id}.`); }
    }
    evidence.set(e.id, e);
  }
  check(state.latestAcceptedEvidenceId === null || evidence.has(state.latestAcceptedEvidenceId), 'Latest accepted evidence reference is missing.');
  check(state.acceptedEvidence.length === 0 ? state.latestAcceptedEvidenceId === null : state.latestAcceptedEvidenceId !== null, 'Latest accepted evidence must identify an accepted record.');
  if (state.latestAcceptedEvidenceId !== null && evidence.has(state.latestAcceptedEvidenceId)) {
    const latest = evidence.get(state.latestAcceptedEvidenceId);
    check(state.acceptedEvidence.every(e => !date(e?.acceptedAt) || Date.parse(e.acceptedAt) <= Date.parse(latest.acceptedAt)), 'Latest accepted evidence is not latest by acceptedAt.');
  }
  for (const s of state.completedSlices) {
    if (!s || typeof s !== 'object') { check(false, 'Invalid completed slice record.'); continue; }
    check(sids.has(s.sliceId) && !state.activeSlices.includes(s.sliceId), `Unknown or simultaneously active/completed slice ${s.sliceId}.`);
    check(nonempty(s.implementationRevision) && nonempty(s.scope), `Completed slice lacks revision/scope: ${s.sliceId}.`);
    check(unique(s.evidenceIds) && s.evidenceIds.length > 0 && s.evidenceIds.every(id => evidence.has(id)), `Completed slice has missing evidence: ${s.sliceId}.`);
    const es = (Array.isArray(s.evidenceIds) ? s.evidenceIds : []).map(id => evidence.get(id)).filter(Boolean);
    for (const kind of ['product-behavior', 'architecture-conformance'])
      check(es.some(e => e.kind === kind && e.implementationRevision === s.implementationRevision && e.sliceIds?.includes(s.sliceId)), `Completed ${s.sliceId} lacks same-revision ${kind} acceptance.`);
  }
  for (const d of state.gateDecisions) {
    if (!d || typeof d !== 'object') { check(false, 'Invalid Gate decision record.'); continue; }
    check(gates.has(d.gateId), `Unknown Gate ${d.gateId}.`);
    check(nonempty(d.scope) && nonempty(d.reason) && nonempty(d.residualScope), `Gate decision lacks scope/reason/residualScope: ${d.gateId}.`);
    check(['blocked', 'deferred', 'resolved-for-scope'].includes(d.disposition), `Invalid Gate disposition: ${d.gateId}.`);
    check(unique(d.evidenceIds) && d.evidenceIds.every(id => evidence.has(id) && evidence.get(id).gateIds?.includes(d.gateId)), `Gate evidence does not address ${d.gateId}.`);
    if (d.disposition === 'resolved-for-scope') check(d.evidenceIds?.length > 0, `Gate resolution requires accepted evidence: ${d.gateId}.`);
  }
  const decisions = new Map();
  check(unique(state.decisionReferences.map(d => d?.id)), 'Duplicate decision reference.');
  for (const d of state.decisionReferences) {
    if (!d || typeof d !== 'object') {check(false, 'Invalid decision reference.'); continue;}
    check(nonempty(d.id) && nonempty(d.scope) && nonempty(d.reason) && nonempty(d.file) && digest(d.sha256), 'Decision reference needs id/scope/reason/file/hash.');
    check(['engineering-decision','architecture-change','product-decision'].includes(d.kind), 'Unknown decision reference kind.');
    check(['proposed','accepted','rejected'].includes(d.status), 'Unknown decision status.');
    check(unique(d.sliceIds) && d.sliceIds.every(id => sids.has(id)), 'Decision has unknown/duplicate slices.');
    check(unique(d.gateIds) && d.gateIds.every(id => gates.has(id)), 'Decision has unknown/duplicate Gates.');
    check(unique(d.evidenceIds) && d.evidenceIds.every(id => evidence.has(id)), 'Decision points to missing accepted evidence.');
    if (d.status === 'accepted') check(nonempty(d.acceptedBy) && date(d.acceptedAt), 'Accepted decision requires recorded acceptance.');
    if (nonempty(d.file) && digest(d.sha256) && readEvidence) {
      try {check(createHash('sha256').update(readEvidence(d.file)).digest('hex') === d.sha256, 'Decision content hash mismatch: '+d.id);}
      catch {check(false, 'Decision content unreadable: '+d.id);}
    }
    decisions.set(d.id,d);
  }
  if (state.implementationBaseline !== null) {
    const ids=state.implementationBaseline?.decisionReferenceIds;
    check(unique(ids) && ids.every(id => decisions.get(id)?.status === 'accepted'), 'Baseline decision references must exist and be accepted.');
  }
  if (state.status === 'not-started') {
    check(state.project === null && state.implementationBaseline === null && state.build === null, 'Not-started record must not claim a project/baseline/build.');
    check(state.activeSlices.length + state.completedSlices.length + state.gateDecisions.length + state.acceptedEvidence.length + state.decisionReferences.length === 0 && state.latestAcceptedEvidenceId === null, 'Not-started record must not claim implementation progress.');
    check(state.updatedAt === null, 'Not-started template timestamp must be null.');
  } else {
    check(nonempty(state.project?.id) && nonempty(state.project?.root), 'Started record requires project identity/root.');
    check(nonempty(state.implementationBaseline?.id) && nonempty(state.implementationBaseline?.revision), 'Started record requires an explicit implementation baseline/revision.');
    check(date(state.updatedAt), 'Started record requires updatedAt.');
    if (state.build !== null) check(nonempty(state.build?.id) && nonempty(state.build?.revision) && nonempty(state.build?.profile) && nonempty(state.build?.artifact), 'Build requires id/revision/profile/artifact.');
  }
  if (state.recordRole === 'handoff-template') check(state.status === 'not-started', 'Frozen template cannot become a progress ledger.');
  if (state.status === 'complete') check(state.activeSlices.length === 0 && state.completedSlices.length > 0, 'Complete requires a completed scope and no active slices; it does not imply all capability/Gate acceptance.');
  return {status: errors.length ? 'INVALID' : state.recordRole === 'handoff-template' ? 'TEMPLATE_VALID' : 'CURRENT_RECORD_VALID', errors,
    inheritedGates: [...gates.values()].map(g => ({gateId: g.id, baselineStatus: g.status, scopedDecisions: state.gateDecisions.filter(d => d.gateId === g.id)})),
    limits: ['Structural validation and evidence digests do not authenticate human approval, evidence adequacy, product readiness, or semantic Gate resolution.', 'Scoped decisions never overwrite frozen Gate/qualification records. Omitted decisions inherit the baseline status.']};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some(a => a !== '--current') || args.length > 1) throw new Error('Usage: node tools/check-implementation-state.mjs [--current]');
  const current = args.includes('--current');
  const file = path.resolve(packageRoot, current ? '../implementation-state.json' : 'implementation-state.json');
  if (current && !fs.existsSync(file)) {
    console.log(JSON.stringify({status: 'NOT_REGISTERED', file, meaning: 'No current implementation record. No production progress or authorization is inferred.'}, null, 2));
  } else {
    const baseline = {slices: JSON.parse(fs.readFileSync(path.join(packageRoot, 'data/slices.json'), 'utf8')).slices, gates: JSON.parse(fs.readFileSync(path.join(packageRoot, 'data/gates.json'), 'utf8')).gates};
    const state = JSON.parse(fs.readFileSync(file, 'utf8'));
    const report = validateImplementationState(state, baseline, ref => fs.readFileSync(path.resolve(path.dirname(file), ref)));
    if (current && state.recordRole !== 'current') { report.status = 'INVALID'; report.errors.push('External locator must have recordRole=current.'); }
    console.log(JSON.stringify({file, ...report}, null, 2));
    process.exitCode = report.errors.length ? 1 : 0;
  }
}
