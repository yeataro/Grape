import test from 'node:test';
import assert from 'node:assert/strict';
import { Editor, Graph, Registry } from '../../executable-reference/core.ts';
import { builtinModule, refs } from '../../executable-reference/nodes.ts';
import { ScopedParameterTarget, ScopedParameterWidgets } from '../../executable-reference/repair/scoped-parameter.ts';
import { scopedFixture, value } from '../../executable-reference/repair/scoped-fixtures.ts';
import { ObservableEditorContext } from '../../executable-reference/repair/public-panel-workspace.ts';
import { NestedNetworkEditorQualification } from '../../executable-reference/qualification-workspace.ts';
import { PercentFieldController, registerPercentWidget } from './contribution.ts';
function fixture() {
  const registry = new Registry(); assert.equal(registry.register(builtinModule).ok, true);
  const graph = new Graph({ name: 'Widget handoff', definitions: registry.pin(), outputType: refs.output });
  const created = graph.change('Create multiply', draft => draft.createNode(graph.stage('pixel').id, refs.multiply));
  assert.equal(created.ok, true); if (!created.ok) throw Error('fixture');
  const id = created.value, context = new ObservableEditorContext(graph), widgets = new ScopedParameterWidgets();
  registerPercentWidget(widgets);
  const input = { context, readonly: false, ime: false, textFocus: true };
  const target = value(ScopedParameterTarget.openRouted({ context, subscribe: fn => context.subscribe(fn) }, id, 'a'));
  return { graph, id, context, widgets, input, target, field: new PercentFieldController(input, target, widgets) };
}
test('HW01 custom appearance projects without editing; explicit commit uses Parameter and one Undo', () => {
  const { graph, id, field } = fixture(), before = graph.exportJSON(), history = graph.historyCounts;
  assert.equal(field.project().widget, 'handoff.percent'); field.input('25');
  assert.equal(graph.nodeById(id)!.parameter('a').read(), 1); assert.equal(graph.exportJSON(), before);
  assert.equal(field.commit(), 'executed'); assert.equal(graph.nodeById(id)!.parameter('a').read(), .25);
  assert.equal(graph.historyCounts.undo, history.undo + 1);
  assert.equal(graph.history.undo().ok, true); assert.equal(graph.exportJSON(), before);
});
test('HW02 readonly/IME/busy guards never submit draft; invalid text keeps model and text', () => {
  const { graph, input, field } = fixture(), before = graph.exportJSON(); field.input('20');
  input.readonly = true; assert.equal(field.commit(), 'blocked'); input.readonly = false;
  input.ime = true; assert.equal(field.commit(), 'blocked'); input.ime = false;
  const op = graph.beginOperation('gesture'); assert.equal(op.ok, true); assert.equal(field.commit(), 'blocked');
  if (op.ok) assert.equal(op.value.cancel().ok, true);
  field.input('not a number'); assert.throws(() => field.commit(), /FINITE|PARSE/);
  assert.equal(field.editingText, 'not a number'); assert.equal(graph.exportJSON(), before);
});
test('HW03 external field change rejects stale draft; missing widget retains typed value; disposal owns no Graph', () => {
  const { graph, id, context, widgets, field, target } = fixture(); field.input('25');
  assert.equal(graph.nodeById(id)!.parameter('a').write(.5).ok, true);
  assert.throws(() => field.commit(), /STALE|changed|VALUE/i); assert.equal(graph.nodeById(id)!.parameter('a').read(), .5);
  const view = widgets.projectTarget(target, { widget: 'external.missing', fallback: 'auto' });
  assert.equal(view.fallback, true); assert.equal(view.field.value, .5);
  const before = graph.exportJSON(); field.dispose(); assert.equal(context.disposed, false);
  assert.equal(graph.exportJSON(), before); assert.throws(() => field.input('30'), /CLOSED/);
});
test('HW04 the exact same widget/controller displays and edits a nested field shared by two occurrences', () => {
  const f = scopedFixture(), widgets = new ScopedParameterWidgets(); registerPercentWidget(widgets);
  const left = new ObservableEditorContext(f.graph), right = new ObservableEditorContext(f.graph);
  value(new NestedNetworkEditorQualification(left).enter(f.a)); value(new NestedNetworkEditorQualification(right).enter(f.b));
  const leftTarget = value(ScopedParameterTarget.openRouted({ context: left, subscribe: fn => left.subscribe(fn) }, 'multiply', 'b'));
  const rightTarget = value(ScopedParameterTarget.openRouted({ context: right, subscribe: fn => right.subscribe(fn) }, 'multiply', 'b'));
  const input = { context: left, readonly: false, ime: false, textFocus: true };
  const field = new PercentFieldController(input, leftTarget, widgets), count = f.graph.historyCounts.undo;
  assert.equal(field.project().widget, 'handoff.percent'); assert.equal(field.project().field.value, 1);
  field.input('60'); assert.equal(field.commit(), 'executed'); assert.equal(rightTarget.read(), .6);
  assert.equal(f.graph.historyCounts.undo, count + 1); value(f.graph.history.undo()); assert.equal(field.project().field.value, 1);
  field.dispose(); assert.equal(left.disposed, false); assert.equal(rightTarget.read(), 1);
});
test('HW05 a renderer cannot couple a target from one context to another action guard', () => {
  const f = scopedFixture(), widgets = new ScopedParameterWidgets(), target = value(ScopedParameterTarget.open(f.left, 'multiply', 'b'));
  assert.throws(() => new PercentFieldController({ context: f.right, readonly: false, ime: false, textFocus: true }, target, widgets), /CONTEXT_MISMATCH/);
});
