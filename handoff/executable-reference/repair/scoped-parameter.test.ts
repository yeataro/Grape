import test from 'node:test';
import assert from 'node:assert/strict';
import { Editor, Graph, Registry } from '../core.ts';
import type { Json, NodeModule, NodeType, ParameterSpec } from '../contracts.ts';
import { builtinModule, refs } from '../nodes.ts';
import { ParameterWidgets } from '../qualification-presentation.ts';
import { NestedNetworkEditorQualification } from '../qualification-workspace.ts';
import { workspaceRefs } from '../qualification-workspace.ts';
import type { SubgraphRecord } from '../qualification-workspace.ts';
import { captureScope, inspectScopedObject, ScopedFieldDraft, ScopedParameterTarget, ScopedParameterWidgets } from './scoped-parameter.ts';
import { scopedFixture, value } from './scoped-fixtures.ts';
import { ObservableEditorContext } from './public-panel-workspace.ts';

test('M01-RED original root-only projection rejects nested Parameter although scoped write is available', () => {
  const f = scopedFixture(), nested = new NestedNetworkEditorQualification(f.left).parameter('multiply', 'b');
  assert.equal(nested.read(), 1); value(nested.write(2));
  assert.throws(() => new ParameterWidgets().project(f.left, 'multiply', 'b'), /MISSING_NODE/);
});
test('M01-01 root spec/value/link/projection/write are one target; one Undo; unchanged on projection', () => {
  const f = scopedFixture(), target = value(ScopedParameterTarget.open(f.rootContext, f.root, 'a')), widgets = new ScopedParameterWidgets();
  const before = f.graph.exportJSON(), count = f.graph.historyCounts.undo;
  const seen: number[] = []; target.subscribe(e => { if (e.kind === 'updated') seen.push(Number(e.value.value)); });
  const p = widgets.projectTarget(target); assert.equal(p.field.value, 1); assert.equal(p.field.connected, false);
  assert.equal(target.capture().spec.target.key, 'a'); assert.equal(f.graph.exportJSON(), before);
  value(target.write(.25)); assert.equal(target.read(), .25); assert.deepEqual(seen, [.25]);
  assert.equal(f.graph.historyCounts.undo, count + 1); value(f.graph.history.undo()); assert.equal(target.read(), 1);
  value(f.graph.history.redo()); assert.equal(target.read(), .25); target.dispose();
});
test('M01-02 nested target resolves same specification, actual default and local link state', () => {
  const f = scopedFixture(), target = value(ScopedParameterTarget.open(f.left, 'multiply', 'b')), linked = value(ScopedParameterTarget.open(f.left, 'multiply', 'a'));
  const widgets = new ScopedParameterWidgets(), before = f.graph.historyCounts.undo;
  assert.equal(target.capture().ownerResourceId, 'shared'); assert.equal(target.capture().port?.type, 'float');
  assert.equal(widgets.projectTarget(target).field.value, 1); assert.equal(widgets.projectTarget(linked).field.connected, true);
  assert.equal(linked.capture().links[0].from.nodeId, 'input'); assert.equal(linked.write(9).ok, false);
  value(target.write(.5)); assert.equal(widgets.projectTarget(target).field.value, .5); assert.equal(f.graph.historyCounts.undo, before + 1);
});
test('M01-03 shared definition occurrences have distinct scope but shared model and independent draft conflicts', () => {
  const f = scopedFixture(), a = value(ScopedParameterTarget.open(f.left, 'multiply', 'b')), b = value(ScopedParameterTarget.open(f.right, 'multiply', 'b'));
  assert.notDeepEqual(a.scope.networkPath, b.scope.networkPath); assert.equal(a.capture().ownerResourceId, b.capture().ownerResourceId);
  const draft = new ScopedFieldDraft(b); value(draft.setText('4')); value(a.write(3));
  assert.equal(b.read(), 3); const commit = draft.commit(Number); assert.equal(commit.ok, false);
  if (!commit.ok) assert.equal(commit.error.code, 'FIELD_STALE');
  assert.equal(a.read(), 3); assert.deepEqual(f.left.activeNetwork.path, [f.a]); assert.deepEqual(f.right.activeNetwork.path, [f.b]);
});
test('M01-04 root name/id collision cannot leak into nested projection or write', () => {
  const f = scopedFixture(), raw = JSON.parse(f.graph.exportJSON());
  const root = raw.stages[1].nodes.find((n: { id: string }) => n.id === f.root); root.id = 'multiply'; root.values.b = 99;
  const graph = value(Graph.load(JSON.stringify(raw), f.registry)), context = new Editor().open(graph);
  value(new NestedNetworkEditorQualification(context).enter(f.a));
  const t = value(ScopedParameterTarget.open(context, 'multiply', 'b'));
  assert.equal(t.read(), 1); value(t.write(2)); assert.equal(graph.nodeById('multiply')!.parameter('b').read(), 99);
});
test('M01-05 deleting occurrence invalidates once before later writes; Undo never resurrects old UI lease', () => {
  const f = scopedFixture(), target = value(ScopedParameterTarget.open(f.left, 'multiply', 'b')), events: string[] = [];
  target.subscribe(e => events.push(e.kind)); value(f.graph.change('Delete occurrence', d => d.removeNode(f.a)));
  assert.deepEqual(events, ['invalidated']); const after = f.graph.exportJSON();
  assert.equal(target.write(9).ok, false); assert.equal(f.graph.exportJSON(), after); value(f.graph.history.undo());
  value(new NestedNetworkEditorQualification(f.left).enter(f.a)); assert.equal(target.write(9).ok, false);
  assert.equal(value(ScopedParameterTarget.open(f.left, 'multiply', 'b')).read(), 1);
});
test('M01-06 stale path, graph-load identity and context disposal never silently retarget', () => {
  const f = scopedFixture(), target = value(ScopedParameterTarget.open(f.left, 'multiply', 'b')), scope = captureScope(f.left);
  value(new NestedNetworkEditorQualification(f.left).root()); assert.equal(target.refresh().ok, false);
  value(new NestedNetworkEditorQualification(f.left).enter(f.a)); assert.equal(target.write(8).ok, false);
  const loaded = value(Graph.load(f.graph.exportJSON(), f.registry)), other = new Editor().open(loaded);
  value(new NestedNetworkEditorQualification(other).enter(f.a)); assert.equal(ScopedParameterTarget.open(other, 'multiply', 'b', scope).ok, false);
  const disposed = value(ScopedParameterTarget.open(f.right, 'multiply', 'b')); value(f.right.dispose());
  assert.equal(disposed.refresh().ok, false); assert.equal(disposed.write(6).ok, false);
});
test('M01-07 input interface removal invalidates old field; surviving mode target remains functional', () => {
  const f = scopedFixture(), alpha = value(ScopedParameterTarget.open(f.left, 'compose', 'a')), mode = value(ScopedParameterTarget.open(f.left, 'compose', 'mode'));
  const draft = new ScopedFieldDraft(alpha); value(draft.setText('.2')); value(mode.write('pair'));
  assert.equal(draft.commit(Number).ok, false); assert.throws(() => alpha.capture(), /invalid|unavailable|removed/i);
  assert.equal(mode.read(), 'pair'); value(f.graph.history.undo()); assert.equal(alpha.write(.2).ok, false);
  assert.equal(value(ScopedParameterTarget.open(f.left, 'compose', 'a')).read(), 1);
});
test('M01-08 same spec/value with changed input GLSL type rejects old draft', () => {
  const ref = { moduleId: 'repair.type', version: '1', fingerprint: 'fixed', typeId: 'typed' };
  const specs: ParameterSpec[] = [{ key: 'mode', target: { kind: 'state', key: 'mode' }, presentation: 'menu' }, { key: 'value', target: { kind: 'input', key: 'value' }, presentation: 'number' }];
  const typed: NodeType = { ref, role: 'operation', stages: ['pixel'], stateCodec: { schemaVersion: 1, validate: s => ['float', 'int'].includes((s as {mode: string}).mode) ? [] : ['mode'] },
    initialize: () => ({ state: { mode: 'float' } }), parameters: () => specs, validate: () => [],
    ports: s => [{ key: 'value', direction: 'input', type: (s as {mode: string}).mode, supply: 'local', default: 1 }], emit: () => ({ outputs: {} }) };
  const mod: NodeModule = { manifest: { id: ref.moduleId, version: ref.version, fingerprint: ref.fingerprint, coreApiVersion: 1, dependencies: [], source: 'test', license: 'test' }, types: [typed] };
  const registry = new Registry(); value(registry.register(builtinModule)); value(registry.register(mod));
  const graph = new Graph({ name: 'Dynamic type', definitions: registry.pin(), outputType: refs.output });
  const id = value(graph.change('Add', d => d.createNode(graph.stage('pixel').id, ref))), context = new Editor().open(graph);
  const target = value(ScopedParameterTarget.open(context, id, 'value')), draft = new ScopedFieldDraft(target), beforeSpec = target.spec;
  value(draft.setText('3')); value(ScopedParameterTarget.open(context, id, 'mode')).write('int');
  assert.deepEqual(target.spec, beforeSpec); assert.equal(target.read(), 1); assert.equal(target.capture().port?.type, 'int');
  const r = draft.commit(Number); assert.equal(r.ok, false); if (!r.ok) assert.equal(r.error.code, 'FIELD_STALE');
});
test('M01-09 connection established during draft rejects commit; unrelated position does not', () => {
  const f = scopedFixture(), target = value(ScopedParameterTarget.open(f.rootContext, f.root, 'a'));
  const draft = new ScopedFieldDraft(target); value(draft.setText('4'));
  value(f.graph.change('Wire', d => { const id = d.createNode(f.graph.stage('pixel').id, refs.constant, { value: 2 });
    d.connectEndpoints({ nodeId: id, key: 'out' }, { nodeId: f.root, key: 'a' }); }));
  assert.equal(draft.commit(Number).ok, false); assert.equal(target.capture().connected, true);
  const free = value(ScopedParameterTarget.open(f.rootContext, f.root, 'b')), next = new ScopedFieldDraft(free); value(next.setText('5'));
  value(f.graph.change('Move', d => d.move(f.root, [10, 20]))); value(next.commit(Number)); assert.equal(free.read(), 5);
});
test('M01-10 library copy-on-write commits once then invalidates both occurrence leases; fresh handles see the fork', () => {
  const f = scopedFixture('library'), a = value(ScopedParameterTarget.open(f.left, 'multiply', 'b')), b = value(ScopedParameterTarget.open(f.right, 'multiply', 'b'));
  const draft = new ScopedFieldDraft(a), before = f.graph.exportJSON(), count = f.graph.historyCounts.undo; value(draft.setText('8'));
  value(draft.commit(Number)); assert.equal(f.graph.historyCounts.undo, count + 1); assert.equal(b.write(7).ok, false); assert.equal(a.write(7).ok, false);
  assert.equal(value(ScopedParameterTarget.open(f.right, 'multiply', 'b')).read(), 8);
  value(f.graph.history.undo()); assert.equal(f.graph.exportJSON(), before);
});
test('M01-11 generic widget fault fallback and immutable field cannot mutate model; dispose does not close context', () => {
  const f = scopedFixture(), t = value(ScopedParameterTarget.open(f.left, 'multiply', 'b')), widgets = new ScopedParameterWidgets();
  widgets.register({ id: 'broken', accepts: () => true, project: field => { (field as {value: Json}).value = 90; return {}; } });
  const before = f.graph.exportJSON(); assert.equal(widgets.projectTarget(t, { widget: 'broken' }).fallback, true);
  assert.equal(f.graph.exportJSON(), before); let events = 0; t.subscribe(() => { events++; }); t.dispose(); t.dispose();
  assert.equal(events, 1); assert.equal(f.left.disposed, false); assert.equal(f.graph.exportJSON(), before);
  assert.throws(() => widgets.projectTarget(t), /invalid/i);
});
test('M01-12 invalid edge remains visible but cannot masquerade as a live connection', () => {
  const f = scopedFixture(), current = structuredClone(f.service.read('shared')) as unknown as SubgraphRecord;
  if (current.body.kind !== 'network') throw Error();
  // Preserved invalid edge evidence is legal import data; do not invent a repair mutation here.
  current.body.edges[0].invalid = { code: 'INTERFACE_CHANGED', reason: 'fixture unresolved old link' };
  value(f.graph.change('Load preserved evidence', d => d.putResource('shared', current as unknown as Json)));
  const t = value(ScopedParameterTarget.open(f.left, 'multiply', 'a'));
  assert.equal(t.capture().links[0].invalid, true); assert.equal(t.capture().connected, false);
});
test('M01-13 public Context navigation ABA and dispose automatically invalidate without renderer refresh', () => {
  const f = scopedFixture(), context = new ObservableEditorContext(f.graph), editor = new NestedNetworkEditorQualification(context);
  value(editor.enter(f.a)); const t = value(ScopedParameterTarget.openRouted({ context, subscribe: fn => context.subscribe(fn) }, 'multiply', 'b'));
  const events: string[] = []; t.subscribe(e => events.push(e.kind));
  value(editor.root()); assert.deepEqual(events, ['invalidated']); value(editor.enter(f.a));
  assert.equal(t.write(8).ok, false);
  const next = value(ScopedParameterTarget.openRouted({ context, subscribe: fn => context.subscribe(fn) }, 'multiply', 'b'));
  next.subscribe(e => events.push('next-' + e.kind)); value(context.dispose());
  assert.deepEqual(events, ['invalidated', 'next-invalidated']); assert.equal(next.write(8).ok, false);
});
test('M01-14 changing an ancestor definition with same leaf definition invalidates old occurrence lease', () => {
  const f = scopedFixture();
  const wrap = (id: string): SubgraphRecord => ({ kind: 'subgraph', name: id, scope: 'local', origin: null, dependencies: ['shared'], body: {
    kind: 'network', ports: [{ key: 'result', direction: 'output', type: 'float' }], nodes: [
      { id: 'input', name: 'input', typeRef: workspaceRefs.networkInput, state: {}, references: { subgraph: { kind: 'resource', targetId: id } }, referencesComplete: true, ports: [], values: {}, position: [0, 0] },
      { id: 'inner', name: 'inner', typeRef: workspaceRefs.subgraph, state: {}, references: { subgraph: { kind: 'resource', targetId: 'shared' } }, referencesComplete: true, ports: [], values: {}, position: [0, 0] }], edges: [], outputs: { result: { nodeId: 'inner', key: 'result' } },
  } });
  value(f.service.createSubgraph('outer1', wrap('outer1'))); value(f.service.createSubgraph('outer2', wrap('outer2')));
  value(f.graph.change('Wrap', d => d.setReference(f.a, 'subgraph', { kind: 'resource', targetId: 'outer1' })));
  const context = new ObservableEditorContext(f.graph), editor = new NestedNetworkEditorQualification(context); value(editor.enter(f.a)); value(editor.enter('inner'));
  const t = value(ScopedParameterTarget.openRouted({ context, subscribe: fn => context.subscribe(fn) }, 'multiply', 'b')), events: string[] = [];
  t.subscribe(e => events.push(e.kind)); value(f.graph.change('Replace ancestor', d => d.setReference(f.a, 'subgraph', { kind: 'resource', targetId: 'outer2' })));
  assert.deepEqual(events, ['invalidated']); assert.equal(t.write(3).ok, false);
  const next = value(ScopedParameterTarget.openRouted({ context, subscribe: fn => context.subscribe(fn) }, 'multiply', 'b')); assert.equal(next.capture().ownerResourceId, 'shared');
});
test('M01-15 disposal inside update delivery is terminal for all remaining observers', () => {
  const f = scopedFixture(), t = value(ScopedParameterTarget.open(f.rootContext, f.root, 'b')), events: string[] = [];
  t.subscribe(e => { if (e.kind === 'updated') t.dispose(); }); t.subscribe(e => events.push(e.kind));
  value(t.write(2)); assert.deepEqual(events, ['invalidated']); assert.equal(t.write(3).ok, false);
});
test('M01-16 value change and Undo do not resurrect a draft from before the change', () => {
  const f = scopedFixture(), t = value(ScopedParameterTarget.open(f.rootContext, f.root, 'b')), draft = new ScopedFieldDraft(t);
  value(draft.setText('4')); value(t.write(2)); value(f.graph.history.undo()); assert.equal(t.read(), 1);
  const r = draft.commit(Number); assert.equal(r.ok, false); if (!r.ok) assert.equal(r.error.code, 'FIELD_STALE');
});
