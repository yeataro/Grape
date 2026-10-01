import test from 'node:test';
import assert from 'node:assert/strict';
import { Graph, Registry } from '../executable-reference/core.ts';
import { builtinModule, refs } from '../executable-reference/nodes.ts';
import { generate } from '../executable-reference/generator.ts';
import { unwrap } from '../executable-reference/scenario.ts';
import { readDocument, writeDocument, exportRecovery } from './document-format.ts';
import type { CanonicalGraphDocument, DocumentRead, RecoveryDocument } from './document-format.ts';
import { referenceToWire, wireToReference } from './document-wire.qualification.ts';

function editable(result: DocumentRead): CanonicalGraphDocument {
  if (result.status !== 'editable') throw Error(result.reason); return result.document;
}
function fixture() {
  const registry = new Registry(); unwrap(registry.register(builtinModule));
  const graph = new Graph({ name: 'Wire contract test', definitions: registry.pin(), outputType: refs.output });
  const stage = graph.stage('pixel'); const output = stage.nodes[0].id;
  const constant = unwrap(graph.change('Constant', d => d.createNode(stage.id, refs.constant, { value: .5 }, 'source')));
  unwrap(graph.change('Connect with broadcast', d => d.connect(graph.nodeById(constant)!.output('out'), graph.nodeById(output)!.input('color'))));
  return { registry, graph, stage, output, constant };
}
function lossFixture() {
  const f = fixture();
  const compose = unwrap(f.graph.change('Dynamic color', d => d.createNode(f.stage.id, refs.compose, { mode: 'color' }, 'dynamic')));
  unwrap(f.graph.change('Use dynamic output', d => {
    d.setInput(compose, 'b', .75);
    d.connect(f.graph.nodeById(compose)!.output('out'), f.graph.nodeById(f.output)!.input('color'), { replace: true });
  }));
  const before = f.graph.snapshot().document;
  unwrap(f.graph.nodeById(compose)!.parameter('mode').write('pair'));
  assert.ok(f.graph.snapshot().document.losses.some(l => l.edge));
  assert.ok(f.graph.snapshot().document.losses.some(l => l.inputKey === 'b' && l.value === .75));
  const document = referenceToWire(f.graph.snapshot().document, before);
  return { ...f, compose, before, document };
}
function withRecovery(): CanonicalGraphDocument {
  const d = lossFixture().document;
  const recovery: RecoveryDocument = { schema: 'grape.recovery', version: 1, id: 'recovery-1', reason: 'user may review detached data', lossId: d.graph.losses[0].id, payload: structuredClone(d.graph.losses[0].payload), extensions: {} };
  d.graph.recovery.push(recovery); return d;
}
function readonly(raw: string, expectedPath: string) {
  const r = readDocument(raw); assert.equal(r.status, 'recovery-readonly');
  if (r.status === 'recovery-readonly') { assert.ok(r.unknownPaths.some(p => p.includes(expectedPath)), JSON.stringify(r)); assert.equal(exportRecovery(r), raw); }
  assert.throws(() => writeDocument(JSON.parse(raw)), /UNWRITABLE_DOCUMENT/);
}

test('DW01 connected nonidentity adaptation roundtrips through production wire then regenerates identically', () => {
  const { graph, registry } = fixture(); const before = unwrap(generate(graph.snapshot()));
  const document = referenceToWire(graph.snapshot().document), edge = document.graph.stages[1].network.edges[0];
  assert.deepEqual(edge.adaptation, { schema: 'grape.edge-adaptation', version: 1, sourceType: 'glsl.float', targetType: 'glsl.vec4', operation: 'broadcast', extensions: {} });
  const decoded = editable(readDocument(writeDocument(document), { availableModule: () => true }));
  assert.deepEqual(decoded, document);
  const reloaded = unwrap(Graph.load(JSON.stringify(wireToReference(decoded)), registry));
  assert.equal(unwrap(generate(reloaded.snapshot())).pixel, before.pixel);
  assert.notEqual(reloaded.loadId, graph.loadId); assert.equal(reloaded.history.length, 0);
});
test('DW02 actual dynamic interface change creates typed detached Edge and removed-value losses; reload preserves inactive semantics', () => {
  const { graph, registry, document } = lossFixture();
  assert.equal(document.graph.stages[1].network.edges.length, 0);
  assert.ok(document.graph.losses.some(l => l.payload.kind === 'edge'));
  const removed = document.graph.losses.find(l => l.payload.kind === 'input-value' && l.payload.port.key === 'b')!;
  assert.equal(removed.payload.kind, 'input-value'); if (removed.payload.kind === 'input-value') { assert.equal(removed.payload.value, .75); assert.equal(removed.payload.port.type, 'glsl.float'); }
  const decoded = editable(readDocument(writeDocument(document), { availableModule: () => true })); assert.deepEqual(decoded.graph.losses, document.graph.losses);
  const reloaded = unwrap(Graph.load(JSON.stringify(wireToReference(decoded)), registry));
  assert.equal(reloaded.stage('pixel').edges.length, 0, 'loss payload is not a connection');
  assert.deepEqual(reloaded.snapshot().document.losses, graph.snapshot().document.losses);
  assert.equal(generate(reloaded.snapshot()).ok, false, 'required output remains unconnected; save does not heal it');
  assert.ok(reloaded.diagnostics.some(d => d.severity === 'warning'));
});
test('DW03 repaired active path regenerates after reload while unresolved historical losses stay preserved', () => {
  const { graph, registry, before, constant, output } = lossFixture();
  unwrap(graph.change('Repair explicitly', d => d.connect(graph.nodeById(constant)!.output('out'), graph.nodeById(output)!.input('color'))));
  const expected = unwrap(generate(graph.snapshot())).pixel;
  const d = referenceToWire(graph.snapshot().document, before), decoded = editable(readDocument(writeDocument(d), { availableModule: () => true }));
  assert.ok(decoded.graph.losses.length > 0);
  const loaded = unwrap(Graph.load(JSON.stringify(wireToReference(decoded)), registry));
  assert.equal(unwrap(generate(loaded.snapshot())).pixel, expected); assert.deepEqual(loaded.snapshot().document.losses, graph.snapshot().document.losses);
});
test('DW04 unknown adaptation subfield is recovery-readonly, never accepted as opaque JSON', () => {
  const d = referenceToWire(fixture().graph.snapshot().document);
  Object.assign(d.graph.stages[1].network.edges[0].adaptation, { futureRoundingMode: 'up' }); readonly(JSON.stringify(d), '.adaptation.futureRoundingMode');
});
test('DW05 unknown loss record and deeply nested detached Edge fields both fence editing', () => {
  const d = lossFixture().document;
  Object.assign(d.graph.losses[0], { futureRestoreAuthority: 'unknown' }); readonly(JSON.stringify(d), '.futureRestoreAuthority');
  const other = lossFixture().document; const loss = other.graph.losses.find(l => l.payload.kind === 'edge')!;
  if (loss.payload.kind === 'edge') Object.assign(loss.payload.edge.adaptation, { futureTransform: true });
  readonly(JSON.stringify(other), '.payload.edge.adaptation.futureTransform');
});
test('DW06 unknown recovery record/payload/port subfields fence editing and retain exact original text', () => {
  for (const place of ['record', 'payload', 'port']) {
    const d = withRecovery(), r = d.graph.recovery[0];
    if (place === 'record') Object.assign(r, { futureReplay: true });
    if (place === 'payload') Object.assign(r.payload, { futureReplay: true });
    if (place === 'port') { assert.equal(r.payload.kind, 'input-value'); if (r.payload.kind === 'input-value') Object.assign(r.payload.port, { futureReplay: true }); }
    readonly(JSON.stringify(d), '.futureReplay');
  }
});
test('DW07 known malformed adaptation/loss/recovery required shapes reject with untouched source', () => {
  const cases: unknown[] = [];
  const edge = referenceToWire(fixture().graph.snapshot().document); delete (edge.graph.stages[1].network.edges[0].adaptation as Partial<typeof edge.graph.stages[1]['network']['edges'][0]['adaptation']>).targetType; cases.push(edge);
  const loss = lossFixture().document; Object.assign(loss.graph.losses[0], { payload: { kind: 'input-value', networkId: 'net', nodeId: 'node', port: { key: 'x', direction: 'output', type: 'glsl.float' }, value: 1 } }); cases.push(loss);
  const recovery = withRecovery(); delete (recovery.graph.recovery[0] as Partial<RecoveryDocument>).payload; cases.push(recovery);
  const badVersion = withRecovery(); Object.assign(badVersion.graph.recovery[0], { version: 0 }); cases.push(badVersion);
  for (const value of cases) { const raw = JSON.stringify(value), r = readDocument(raw); assert.equal(r.status, 'rejected'); if (r.status === 'rejected') assert.equal(exportRecovery(r), raw); }
});
test('DW08 future wire schemas, codec versions, operations and payload discriminants are readonly, not guessed', () => {
  const variants = [
    (d: CanonicalGraphDocument) => Object.assign(d.graph.stages[1].network.edges[0].adaptation, { version: 2 }),
    (d: CanonicalGraphDocument) => Object.assign(d.graph.stages[1].network.edges[0].adaptation, { operation: 'quaternion-rotate' }),
  ];
  for (const mutate of variants) { const d = referenceToWire(fixture().graph.snapshot().document); mutate(d); readonly(JSON.stringify(d), '.adaptation'); }
  const loss = lossFixture().document; Object.assign(loss.graph.losses[0], { schema: 'future.loss', version: 1 }); readonly(JSON.stringify(loss), '.schema/version');
  const recovery = withRecovery(); Object.assign(recovery.graph.recovery[0], { payload: { kind: 'future-binary', bytes: [1, 2] } }); readonly(JSON.stringify(recovery), '.payload.kind');
});
test('DW09 opaque exact-owner recovery codec data and inert extensions preserve unknown data while envelope remains editable', () => {
  const d = withRecovery(), owner = { moduleId: 'example.authoring', version: '2.0.0', fingerprint: 'exact-missing-pin' }; d.graph.modules.push(owner);
  d.graph.recovery[0].payload = { kind: 'module', owner, codecId: 'detached-text', codecVersion: 3, data: { future: { language: '日本語', instructions: ['data', null] } }, references: [{ slot: 'node', kind: 'node', targetId: 'missing-node', networkId: 'network-1' }], referencesComplete: false };
  d.graph.recovery[0].extensions['example.annotation'] = { future: true };
  const decoded = editable(readDocument(writeDocument(d))); assert.deepEqual(decoded, d);
  const result = readDocument(writeDocument(d)); if (result.status === 'editable') { assert.ok(result.unresolvedModules.some(m => m.moduleId === owner.moduleId)); assert.equal(result.generationBlockedByMissingModules, true); }
  Object.assign(d.graph.recovery[0].payload, { hiddenReference: 'not-in-data' }); readonly(JSON.stringify(d), '.payload.hiddenReference');
});
test('DW10 nested Node/Resource evidence reuses full structural validation and exact pins; duplicate evidence identities reject', () => {
  const d = withRecovery(), node = d.graph.stages[1].network.nodes[0];
  d.graph.recovery[0].payload = { kind: 'node', networkId: d.graph.stages[1].network.id, node: structuredClone(node) };
  assert.deepEqual(editable(readDocument(writeDocument(d))), d);
  if (d.graph.recovery[0].payload.kind === 'node') Object.assign(d.graph.recovery[0].payload.node, { futureOwner: true }); readonly(JSON.stringify(d), '.payload.node.futureOwner');
  const r = withRecovery(); r.graph.recovery[0].payload = { kind: 'resource', resource: { id: 'resource', type: r.graph.stages[1].network.nodes[0].type, data: { preserved: true }, references: [], referencesComplete: true, extensions: {} } };
  assert.deepEqual(editable(readDocument(writeDocument(r))), r); r.graph.recovery.push(structuredClone(r.graph.recovery[0])); assert.equal(readDocument(JSON.stringify(r)).status, 'rejected');
});
test('DW11 unsupported grape.document 1.0 stays original readonly; no format-label rewrite migration', () => {
  const raw = JSON.stringify({ format: 'grape.document', formatVersion: { major: 1, minor: 0 }, graph: { losses: [{ oldInput: 'x', value: 1 }], recovery: [] } });
  const r = readDocument(raw); assert.equal(r.status, 'recovery-readonly'); if (r.status === 'recovery-readonly') { assert.equal(r.reason, 'UNSUPPORTED_FORMAT_VERSION'); assert.equal(exportRecovery(r), raw); }
});
test('DW12 structural editable never grants generation authority to a semantically forged adaptation', () => {
  const { graph, registry } = fixture(); const d = referenceToWire(graph.snapshot().document);
  d.graph.stages[1].network.edges[0].adaptation.operation = 'identity';
  const decoded = editable(readDocument(writeDocument(d), { availableModule: () => true }));
  const loaded = unwrap(Graph.load(JSON.stringify(wireToReference(decoded)), registry));
  assert.equal(generate(loaded.snapshot()).ok, false, 'registered type/admission validation must reject float -> vec4 identity');
});
test('DW13 coercible arrays are not string enums, including deeply preserved ports and references', () => {
  for (const [key, invalid] of [['direction', ['input']], ['supply', ['local']], ['connectionPolicy', ['exact']]] as const) {
    const d = withRecovery(), node = structuredClone(d.graph.stages[1].network.nodes[0]);
    Object.assign(node.ports[0], { [key]: invalid });
    d.graph.recovery[0].payload = { kind: 'node', networkId: d.graph.stages[1].network.id, node };
    const raw = JSON.stringify(d), result = readDocument(raw);
    assert.equal(result.status, 'rejected', key); if (result.status === 'rejected') assert.equal(exportRecovery(result), raw);
  }
  const reference = withRecovery(), node = structuredClone(reference.graph.stages[1].network.nodes[0]);
  node.references.push({ slot: 'peer', kind: 'node', targetId: 'other' });
  Object.assign(node.references[0], { kind: ['node'] });
  reference.graph.losses[0].payload = { kind: 'node', networkId: reference.graph.stages[1].network.id, node };
  assert.equal(readDocument(JSON.stringify(reference)).status, 'rejected');
  const stage = withRecovery(); Object.assign(stage.graph.stages[0], { implementation: ['profile-default'] });
  assert.equal(readDocument(JSON.stringify(stage)).status, 'rejected');
  const adaptation = referenceToWire(fixture().graph.snapshot().document); Object.assign(adaptation.graph.stages[1].network.edges[0].adaptation, { operation: ['broadcast'] });
  assert.equal(readDocument(JSON.stringify(adaptation)).status, 'rejected');
});
