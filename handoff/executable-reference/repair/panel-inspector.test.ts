/** Combined B01/M01 qualification. NOT a production Inspector implementation. */
import test from 'node:test';
import assert from 'node:assert/strict';
import type { Json } from '../contracts.ts';
import { Graph } from '../core.ts';
import { NestedNetworkEditorQualification } from '../qualification-workspace.ts';
import { ContextDirectory, ObservableEditorContext, PanelWorkspace, scopeOf,
  type Panel, type PanelServices, type PanelUpdate, type SavedPanel } from './public-panel-workspace.ts';
import { ScopedParameterTarget, ScopedParameterWidgets } from './scoped-parameter.ts';
import { scopedFixture, value } from './scoped-fixtures.ts';

// Contribution reads only a public routed target. No Graph/resource traversal or root/nested switch.
class TestInspector implements Panel {
  readonly typeId = 'qualification.inspector';
  readonly id: string;
  #services: PanelServices;
  #widgets = new ScopedParameterWidgets();
  target: ScopedParameterTarget | null = null;
  update: Readonly<PanelUpdate> | null = null;
  disposed = 0;
  constructor(id: string, services: PanelServices) { this.id = id; this.#services = services; }
  restoreViewState(_state: Json) { return { restored: true }; }
  exportViewState(): Json { return {}; }
  receive(update: Readonly<PanelUpdate>): void {
    this.target?.dispose(); this.target = null; this.update = update;
    const context = this.#services.context(update.lease);
    if (update.target.status !== 'resolved' || update.target.ref.object?.kind !== 'node' || !context) return;
    const result = ScopedParameterTarget.openRouted({ context, subscribe: fn => context.subscribe(fn) },
      update.target.ref.object.id, 'b', update.target.ref.scope);
    if (result.ok) this.target = result.value;
  }
  project() { return this.target ? this.#widgets.projectTarget(this.target) : null; }
  setVisible(): void {}
  canClose() { return { allowed: true }; }
  dispose(): void { this.target?.dispose(); this.target = null; this.disposed++; }
}
const record = (id: string, extra: Partial<SavedPanel> = {}): SavedPanel => ({ id,
  typeId: 'qualification.inspector', viewStateVersion: 1, state: {}, route: { mode: 'follow' },
  linkGroup: 0, hidden: false, ...extra });
function setup() {
  const f = scopedFixture(), context = new ObservableEditorContext(f.graph), directory = new ContextDirectory();
  directory.add(context); directory.activate(context.id);
  const workspace = new PanelWorkspace(directory); workspace.createPane('main'); workspace.createPane('other');
  workspace.register({ typeId: 'qualification.inspector', viewStateVersion: 1,
    create: ({ id, services }) => new TestInspector(id, services) });
  return { ...f, context, directory, workspace, nested: new NestedNetworkEditorQualification(context) };
}

test('BM-01 one registered Panel reads/projects/writes root then nested target without renderer scope traversal', () => {
  const f = setup(); value(f.context.select([f.root]));
  const panel = f.workspace.open(record('inspector'), 'main') as TestInspector;
  assert.equal(panel.project()?.field.value, 1); const rootTarget = panel.target!;
  value(rootTarget.write(2)); assert.equal(panel.project()?.field.value, 2);
  value(f.nested.enter(f.a)); value(f.context.select(['multiply']));
  assert.equal(panel.project()?.field.value, 1); assert.equal(panel.target?.capture().ownerResourceId, 'shared');
  assert.equal(rootTarget.write(20).ok, false);
  const history = f.graph.historyCounts.undo; value(panel.target!.write(3));
  assert.equal(panel.project()?.field.value, 3); assert.equal(f.graph.historyCounts.undo, history + 1);
  assert.equal(f.graph.nodeById(f.root)!.parameter('b').read(), 2);
  value(f.graph.history.undo()); assert.equal(panel.project()?.field.value, 1);
  value(f.graph.history.redo()); assert.equal(panel.project()?.field.value, 3);
  assert.equal(f.workspace.issues.length, 0);
});

test('BM-02 shared occurrences have separate routed leases; move preserves view and close invalidates late results', () => {
  const f = setup(); value(f.nested.enter(f.a)); value(f.context.select(['multiply']));
  const panel = f.workspace.open(record('inspector'), 'main') as TestInspector;
  const first = panel.target!, oldLease = panel.update!.lease;
  value(first.write(4)); value(f.nested.root()); value(f.nested.enter(f.b)); value(f.context.select(['multiply']));
  assert.equal(panel.project()?.field.value, 4); assert.deepEqual(panel.target!.scope.networkPath, [f.b]);
  assert.equal(first.write(90).ok, false); assert.equal(f.workspace.accept(oldLease, () => assert.fail('late')), false);
  const current = panel.target, currentLease = panel.update!.lease;
  f.workspace.move('inspector', 'other', 0); assert.equal(f.workspace.panel('inspector'), panel); assert.equal(panel.target, current);
  assert.equal(f.workspace.close('inspector').allowed, true); assert.equal(panel.disposed, 1);
  assert.equal(current!.write(90).ok, false); assert.equal(f.workspace.accept(currentLease, () => assert.fail('closed')), false);
  assert.equal(f.context.disposed, false);
});

test('BM-03 pinned nested Inspector keeps same model scope when provider navigates and closes', () => {
  const f = setup(); value(f.nested.enter(f.a)); value(f.context.select(['multiply']));
  const panel = f.workspace.open(record('pin', { route: { mode: 'pin', target: {
    scope: scopeOf(f.context), object: { kind: 'node', id: 'multiply' },
  } } }), 'main') as TestInspector;
  const retained = f.workspace.targetContext(panel.update!.lease)!;
  assert.notEqual(retained, f.context); assert.equal(retained.graph, f.graph);
  value(f.nested.root()); assert.equal(panel.project()?.field.value, 1);
  f.directory.release(f.context.id); assert.equal(f.context.disposed, true);
  const oldLease = panel.update!.lease; value(panel.target!.write(7));
  assert.equal(panel.project()?.field.value, 7); assert.notDeepEqual(panel.update!.lease, oldLease);
  assert.deepEqual(panel.target!.scope.networkPath, [f.a]);
  assert.equal(f.workspace.close('pin').allowed, true); assert.equal(retained.disposed, true);
  assert.equal(f.graph.busy, false); assert.equal(f.workspace.issues.length, 0);
});

test('BM-04 stale occurrence becomes missing projection; reconnect requires a fresh target and old handle stays dead', () => {
  const f = setup(); value(f.nested.enter(f.a)); value(f.context.select(['multiply']));
  const panel = f.workspace.open(record('inspector'), 'main') as TestInspector, old = panel.target!;
  value(f.graph.change('Delete selected occurrence', draft => draft.removeNode(f.a)));
  assert.equal(panel.project(), null); const after = f.graph.exportJSON();
  assert.equal(old.write(10).ok, false); assert.equal(f.graph.exportJSON(), after);
  value(f.graph.history.undo()); value(f.nested.enter(f.a)); value(f.context.select(['multiply']));
  assert.equal(panel.project()?.field.value, 1); assert.notEqual(panel.target, old); assert.equal(old.write(10).ok, false);
  assert.equal(f.workspace.dispose().allowed, true); assert.equal(f.context.disposed, false);
});

test('BM-05 actual Graph reload restores pinned nested Inspector only through explicit new-lifetime mapping', () => {
  const f = setup(); value(f.nested.enter(f.a)); value(f.context.select(['multiply']));
  const panel = f.workspace.open(record('pin', { route: { mode: 'pin', target: {
    scope: scopeOf(f.context), object: { kind: 'node', id: 'multiply' },
  } } }), 'main') as TestInspector;
  value(panel.target!.write(6)); const old = panel.target!, saved = f.workspace.save();
  const graph = value(Graph.load(f.graph.exportJSON(), f.registry)), context = new ObservableEditorContext(graph);
  assert.notEqual(graph.loadId, f.graph.loadId);
  const contexts = new ContextDirectory(); contexts.add(context);
  // Document/layout reopen service supplies exact old→new identity mapping; no contribution code changes.
  const workspace = new PanelWorkspace(contexts, undefined, {
    context: id => id === f.context.id ? context.id : null,
    target: ref => ref.scope.graphId === graph.id && ref.scope.loadId === f.graph.loadId ? {
      ...ref, scope: { ...ref.scope, contextId: context.id, loadId: graph.loadId },
    } : null,
  });
  workspace.register({ typeId: 'qualification.inspector', viewStateVersion: 1,
    create: ({ id, services }) => new TestInspector(id, services) });
  workspace.restore(saved);
  const next = workspace.panel('pin') as TestInspector;
  assert.equal(next.project()?.field.value, 6); assert.equal(next.target!.scope.loadId, graph.loadId);
  assert.deepEqual(next.target!.scope.networkPath, [f.a]);
  assert.equal(f.workspace.dispose().allowed, true); assert.equal(old.write(9).ok, false);
  value(next.target!.write(8)); assert.equal(next.project()?.field.value, 8);
  assert.equal(value(ScopedParameterTarget.open(f.left, 'multiply', 'b')).read(), 6);
  assert.equal(workspace.issues.length, 0); assert.equal(workspace.dispose().allowed, true);
});
