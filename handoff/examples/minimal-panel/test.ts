import test from 'node:test';
import assert from 'node:assert/strict';
import { Graph, Registry } from '../../executable-reference/core.ts';
import { builtinModule, refs } from '../../executable-reference/nodes.ts';
import { ContextDirectory, ObservableEditorContext, PanelWorkspace, MissingPanel, type TargetResolver, type SavedPanel } from '../../executable-reference/repair/public-panel-workspace.ts';
import { inspectScopedObject } from '../../executable-reference/repair/scoped-parameter.ts';
import { SelectionSummaryPanel, selectionSummaryType } from './panel-template.ts';
function fixture() {
  const registry = new Registry(); assert.equal(registry.register(builtinModule).ok, true);
  const graph = new Graph({ name: 'Panel handoff', definitions: registry.pin(), outputType: refs.output });
  const context = new ObservableEditorContext(graph), contexts = new ContextDirectory(); contexts.add(context);
  const workspace = new PanelWorkspace(contexts); workspace.createPane('main'); workspace.register(selectionSummaryType); contexts.activate(context.id);
  return { graph, context, contexts, workspace };
}
const record = (id: string, overrides: Partial<SavedPanel> = {}): SavedPanel => ({ id, typeId: selectionSummaryType.typeId, viewStateVersion: 1, state: { prefix: 'Selected' }, route: { mode: 'follow' }, linkGroup: 0, hidden: false, ...overrides });
test('HP01 ordinary Panel registers into public workspace and receives direct Context notifications', () => {
  const { graph, context, workspace } = fixture(), before = graph.exportJSON(), history = graph.historyCounts;
  const panel = workspace.open(record('summary'), 'main') as SelectionSummaryPanel;
  const output = graph.stage('pixel').node('output')!.id;
  assert.equal(context.select([output]).ok, true);
  assert.deepEqual(panel.project(), { title: 'Selected', primary: output, count: 1, missing: false, visible: true });
  assert.throws(() => workspace.register(selectionSummaryType), /DUPLICATE/);
  assert.deepEqual(workspace.save().panels[0].state, { prefix: 'Selected' });
  assert.equal(graph.exportJSON(), before); assert.deepEqual(graph.historyCounts, history);
  assert.equal(workspace.close(panel.id).allowed, true); assert.throws(() => panel.project(), /CLOSED/);
  assert.equal(context.disposed, false); assert.equal(graph.exportJSON(), before);
});
test('HP02 unknown type and incompatible view state remain opaque workspace placeholders', () => {
  const { workspace } = fixture();
  const unknown = record('unknown', { typeId: 'external.future-panel', viewStateVersion: 8, state: { retained: ['opaque', 42] } });
  assert.ok(workspace.open(unknown, 'main') instanceof MissingPanel); assert.deepEqual(workspace.save().panels[0], unknown);
  const mismatch = record('mismatch', { viewStateVersion: 99, state: { future: true } });
  assert.ok(workspace.open(mismatch, 'main') instanceof MissingPanel); assert.deepEqual(workspace.save().panels[1], mismatch);
});
test('HP03 origin-owned gesture prevents close before dispose; unrelated Panel remains closable', () => {
  const { graph, context, contexts, workspace } = fixture();
  const panel = workspace.open(record('summary'), 'main'); workspace.open(record('unrelated'), 'main');
  const operation = contexts.beginGesture(context.id, panel.id, 'gesture');
  assert.deepEqual(workspace.close(panel.id), { allowed: false, reason: 'ORIGIN_GESTURE_BUSY' });
  assert.equal(workspace.panel(panel.id), panel); assert.equal(workspace.close('unrelated').allowed, true);
  assert.equal(operation.cancel().ok, true); assert.equal(workspace.close(panel.id).allowed, true);
  assert.equal(context.disposed, false); assert.equal(graph.busy, false);
});
test('HP04 restore failure disposes failed view and preserves original record in placeholder', () => {
  const { graph, workspace } = fixture(), before = graph.exportJSON(); let disposed = 0;
  workspace.register({ typeId: 'handoff.throwing', viewStateVersion: 1, create: ({ id }) => ({
    id, typeId: 'handoff.throwing', canClose: () => ({ allowed: true }), exportViewState: () => null,
    receive: () => {}, setVisible: () => {}, restoreViewState: () => { throw Error('unsupported future state'); }, dispose: () => { disposed++; },
  }) });
  const saved = record('failed', { typeId: 'handoff.throwing', state: { retained: true } });
  assert.ok(workspace.open(saved, 'main') instanceof MissingPanel); assert.equal(disposed, 1);
  assert.deepEqual(workspace.save().panels[0], saved); assert.equal(graph.exportJSON(), before);
});

