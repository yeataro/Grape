import test from 'node:test';
import assert from 'node:assert/strict';
import { DOCUMENT_FORMAT, DOCUMENT_VERSION, readDocument, writeDocument, exportRecovery } from './document-format.ts';
import type { CanonicalGraphDocument, NodeDocument } from './document-format.ts';

const core = { moduleId: 'grape.core-nodes', version: '1.0.0', fingerprint: 'fixture-core-exact-pin' };
const kinds = { moduleId: 'grape.graph-kinds', version: '1.0.0', fingerprint: 'fixture-kinds-exact-pin' };
function fixture(): CanonicalGraphDocument {
  const multiply: NodeDocument = { id: 'multiply', name: 'Multiply', type: { ...core, typeId: 'multiply' }, state: {}, inputValues: { a: .25, b: 2 },
    ports: [{ key: 'a', direction: 'input', type: 'glsl.float', supply: 'local', defaultValue: 1 }, { key: 'b', direction: 'input', type: 'glsl.float', supply: 'local', defaultValue: 1 }, { key: 'out', direction: 'output', type: 'glsl.float' }],
    references: [], referencesComplete: true, position: [120, 80], extensions: {} };
  return { format: DOCUMENT_FORMAT, formatVersion: { ...DOCUMENT_VERSION }, graph: { id: 'work-1', name: 'Untitled', kind: { ...kinds, kindId: 'grape.image' }, kindSettings: {}, modules: [kinds, core],
    stages: [{ id: 'vertex-1', key: 'vertex', stageKindId: 'grape.stage.vertex', implementation: 'profile-default', network: { id: 'net-vertex', nodes: [], edges: [], extensions: {} }, extensions: {} },
      { id: 'pixel-1', key: 'pixel', stageKindId: 'grape.stage.pixel', implementation: 'network', network: { id: 'net-pixel', nodes: [multiply], edges: [], extensions: {} }, extensions: {} }],
    resources: [], losses: [], recovery: [], extensions: {} } };
}
test('DF01 production identity is product-owned, exact version and host-independent kind pin', () => {
  const d = fixture(), text = writeDocument(d); assert.equal(d.format, 'grape.document'); assert.deepEqual(d.formatVersion, { major: 2, minor: 0 });
  assert.equal(d.graph.kind.kindId, 'grape.image'); assert.equal(text.includes('grape-core-experiment'), false); assert.equal(text.includes('td.top'), false);
  const r = readDocument(text, { availableModule: () => true }); assert.equal(r.status, 'editable');
  if (r.status === 'editable') { assert.deepEqual(r.document, d); assert.equal(r.generationBlockedByMissingModules, false); }
});
test('DF02 S01 detached snapshot save/reopen preserves IDs, values, dynamic state, port snapshots and ordered arrays', async () => {
  const d = fixture(), node = d.graph.stages[1].network.nodes[0]; node.state = { mode: 'color', backup: { pair: [1, 2] } };
  const captured = writeDocument(d); const store = new Map<string, string>();
  const write = async (key: string, text: string) => { store.set(key, text); return { key, committedText: text }; };
  const pending = write('work-1', captured); node.inputValues.a = .75; const ack = await pending;
  assert.equal(ack.committedText, captured); assert.notEqual(writeDocument(d), ack.committedText, 'late ACK cannot clear newer dirty state');
  const reopened = readDocument(store.get('work-1')!, { availableModule: () => true }); assert.equal(reopened.status, 'editable');
  if (reopened.status === 'editable') { assert.equal(reopened.document.graph.id, 'work-1'); assert.equal(reopened.document.graph.stages[1].network.nodes[0].inputValues.a, .25); assert.equal(writeDocument(reopened.document), captured); }
});
test('DF03 missing module payload roundtrips exactly and permits outer name/position edit without generation authority', () => {
  const d = fixture(), n = d.graph.stages[1].network.nodes[0]; n.state = { future: { bytes: [0, 1, 255], bindingName: 'do-not-rewrite' } }; n.referencesComplete = false;
  const r = readDocument(writeDocument(d)); assert.equal(r.status, 'editable');
  if (r.status === 'editable') {
    assert.equal(r.generationBlockedByMissingModules, true); assert.equal(r.unresolvedModules.length, 2);
    const copy = structuredClone(r.document); copy.graph.stages[1].network.nodes[0].name = 'Renamed'; copy.graph.stages[1].network.nodes[0].position = [9, 10];
    const roundtrip = readDocument(writeDocument(copy)); assert.equal(roundtrip.status, 'editable');
    if (roundtrip.status === 'editable') assert.deepEqual(roundtrip.document.graph.stages[1].network.nodes[0].state, n.state);
    assert.throws(() => { r.document.graph.name = 'mutate projection'; }, /read only|readonly/i);
  }
});
test('DF04 unrecognized structural fields are never silently dropped by decode or encode', () => {
  const raw = writeDocument(fixture()).replace('"inputValues":', '"futureBindingAuthority": "unknown", "inputValues":');
  const r = readDocument(raw); assert.equal(r.status, 'recovery-readonly');
  if (r.status === 'recovery-readonly') { assert.ok(r.unknownPaths.some(p => p.endsWith('.futureBindingAuthority'))); assert.equal(exportRecovery(r), raw); }
  assert.throws(() => writeDocument(JSON.parse(raw)), /UNKNOWN_STRUCTURAL_FIELDS/);
});
test('DF05 unknown future major/minor stay original readonly even if familiar-looking graph payload is invalid', () => {
  for (const formatVersion of [{ major: 3, minor: 0 }, { major: 2, minor: 1 }, { major: 1, minor: 0 }]) {
    const raw = JSON.stringify({ format: DOCUMENT_FORMAT, formatVersion, graph: 'a new incompatible envelope' });
    const r = readDocument(raw); assert.equal(r.status, 'recovery-readonly'); if (r.status === 'recovery-readonly') assert.equal(exportRecovery(r), raw);
  }
});
test('DF06 legacy and experimental documents require explicit importer, never default canonical hydration', () => {
  for (const raw of ['{"format":"grape-core-experiment","formatVersion":1,"kind":"td.top"}', '{"nodes":[]}']) {
    const r = readDocument(raw); assert.equal(r.status, 'foreign'); if (r.status === 'foreign') assert.equal(exportRecovery(r), raw);
  }
});
test('DF07 inert namespaced extensions preserve arbitrary JSON without executing it', () => {
  const d = fixture(); d.graph.extensions['example.notes'] = { instruction: 'arbitrary literal', title: '名前', data: ['<script>', null, true] };
  const r = readDocument(writeDocument(d)); assert.equal(r.status, 'editable'); if (r.status === 'editable') assert.deepEqual(r.document.graph.extensions, d.graph.extensions);
  d.graph.extensions.unqualified = 'bad key'; assert.throws(() => writeDocument(d), /EXTENSION_NAMESPACE/);
});
test('DF08 duplicate JSON keys including escaped spelling are rejected with exact raw retained', () => {
  for (const raw of ['{"format":"grape.document","format":"other"}', '{"a":1,"\\u0061":2}']) {
    const r = readDocument(raw); assert.equal(r.status, 'rejected'); if (r.status === 'rejected') { assert.match(r.reason, /DUPLICATE_JSON_KEY/); assert.equal(exportRecovery(r), raw); }
  }
});
test('DF09 malformed identity, duplicate node/port IDs, and missing module exact pins reject instead of partial load', () => {
  const variants = [
    (d: CanonicalGraphDocument) => { d.graph.id = ''; },
    (d: CanonicalGraphDocument) => { d.graph.stages[1].network.nodes.push(structuredClone(d.graph.stages[1].network.nodes[0])); },
    (d: CanonicalGraphDocument) => { d.graph.stages[1].network.nodes[0].ports.push(structuredClone(d.graph.stages[1].network.nodes[0].ports[0])); },
    (d: CanonicalGraphDocument) => { d.graph.modules.pop(); },
  ];
  for (const mutate of variants) { const d = fixture(); mutate(d); assert.equal(readDocument(JSON.stringify(d)).status, 'rejected'); }
});
test('DF10 model semantic errors remain preservable and are not claimed generation-valid by envelope parser', () => {
  const d = fixture(); d.graph.stages[1].network.edges.push({ id: 'lost-edge', from: { nodeId: 'absent', portKey: 'out' }, to: { nodeId: 'multiply', portKey: 'a' }, adaptation: { schema: 'grape.edge-adaptation', version: 1, sourceType: 'glsl.float', targetType: 'glsl.float', operation: 'identity', extensions: {} }, invalid: { code: 'MISSING_SOURCE', reason: 'retain evidence' }, extensions: {} });
  d.graph.losses.push({ schema: 'grape.loss', version: 1, id: 'loss-1', code: 'INPUT_REMOVED', reason: 'interface changed', payload: { kind: 'input-value', networkId: 'net-pixel', nodeId: 'multiply', port: { key: 'missing-port', direction: 'input', type: 'glsl.float' }, value: 9 }, extensions: {} });
  const r = readDocument(writeDocument(d), { availableModule: () => true }); assert.equal(r.status, 'editable'); if (r.status === 'editable') assert.deepEqual(r.document, d);
});
test('DF11 JSON shape safety: nonfinite/undefined/functions/cycles/custom prototypes are rejected on writing', () => {
  for (const bad of [NaN, Infinity, undefined, () => 1, new Date(), { toJSON: () => ({ hidden: true }) }]) {
    const d = fixture(); (d.graph.kindSettings as unknown) = bad; assert.throws(() => writeDocument(d), /NON_JSON/);
  }
  const d = fixture(); const cyclic: Record<string, unknown> = {}; cyclic.self = cyclic; d.graph.kindSettings = cyclic as never;
  assert.throws(() => writeDocument(d), /JSON_CYCLE/);
});
test('DF12 parser limits are explicit per invocation, not silently truncated document-format ceilings', () => {
  const raw = writeDocument(fixture()); const short = readDocument(raw, { maxBytes: 12 }); assert.equal(short.status, 'rejected');
  if (short.status === 'rejected') { assert.match(short.reason, /DOCUMENT_SIZE/); assert.equal(short.raw, raw); }
  assert.equal(readDocument(raw, { maxBytes: 1_000_000, maxDepth: 128 }).status, 'editable');
  assert.equal(readDocument('{"a":1e999}').status, 'rejected'); assert.equal(readDocument(raw, { maxDepth: 1 }).status, 'rejected');
});
test('DF13 invalid version metadata rejects; decoder never rewrites version automatically', () => {
  for (const version of [1, { major: 0, minor: 0 }, { major: 1, minor: -1 }, { major: 1.2, minor: 0 }]) {
    const raw = JSON.stringify({ ...fixture(), formatVersion: version }); assert.equal(readDocument(raw).status, 'rejected');
  }
});
test('DF14 unknown top-level/Stage/reference metadata fences editing, not just unknown Node fields', () => {
  const d = fixture(); const variants: unknown[] = [ { ...d, hostOwnsGraph: true }, { ...d, graph: { ...d.graph, stages: d.graph.stages.map(s => ({ ...s, futureExecution: true })) } } ];
  for (const raw of variants.map(value => JSON.stringify(value))) assert.equal(readDocument(raw).status, 'recovery-readonly');
});
test('DF15 hidden hooks/accessors/custom arrays never execute or silently discard data', () => {
  let invoked = 0;
  const hiddenHook = Object.defineProperty({}, 'toJSON', { value: () => { invoked++; return {}; } });
  const hiddenGetter = Object.defineProperty({}, 'x', { get: () => { invoked++; return 1; } });
  const customArray = Object.setPrototypeOf([], { toJSON: () => { invoked++; return []; } });
  const hiddenData = Object.defineProperty({}, 'authored', { value: 'cannot silently drop' });
  const holeWithExtra: unknown[] & { extra?: string } = new Array(1); holeWithExtra.extra = 'same enumerable count as length';
  for (const bad of [hiddenHook, hiddenGetter, customArray, hiddenData, holeWithExtra]) {
    const d = fixture(); d.graph.kindSettings = bad as never; assert.throws(() => writeDocument(d), /NON_JSON/);
  }
  assert.equal(invoked, 0);
});
test('DF16 multiple exact module versions coexist; only duplicate exact pins reject', () => {
  const d = fixture(), alternate = { ...core, version: '2.0.0', fingerprint: 'fixture-core-v2-pin' };
  d.graph.modules.push(alternate); const other = structuredClone(d.graph.stages[1].network.nodes[0]);
  other.id = 'multiply-v2'; other.name = 'Multiply2'; other.type = { ...alternate, typeId: 'multiply' };
  d.graph.stages[1].network.nodes.push(other);
  const r = readDocument(writeDocument(d)); assert.equal(r.status, 'editable');
  if (r.status === 'editable') { assert.deepEqual(r.document, d); assert.equal(r.unresolvedModules.length, 3); }
  d.graph.modules.push(structuredClone(alternate)); assert.throws(() => writeDocument(d), /DUPLICATE_EXACT_PIN/);
});
test('DF17 authored resource metadata and complete port policy survive without abusing inert extensions', () => {
  const d = fixture(); d.graph.resources.push({ id: 'authoring-1', type: { ...core, typeId: 'authoring-metadata' },
    data: { frames: [{ id: 'frame-1', networkId: 'net-pixel', title: 'My group', rect: [0, 0, 800, 600], color: '#777777', members: ['multiply'] }], notes: ['Preserve this note'] },
    references: [{ slot: 'frame-1/member-0', kind: 'node', targetId: 'multiply', networkId: 'net-pixel' }], referencesComplete: true, extensions: {} });
  Object.assign(d.graph.stages[1].network.nodes[0].ports[0], { requireConstant: true, connectionPolicy: 'exact' });
  const r = readDocument(writeDocument(d)); assert.equal(r.status, 'editable'); if (r.status === 'editable') assert.deepEqual(r.document, d);
});
