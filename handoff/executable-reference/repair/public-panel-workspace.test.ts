import test from 'node:test';
import assert from 'node:assert/strict';
import { Graph, Registry } from '../core.ts';
import { builtinModule, refs } from '../nodes.ts';
import { WorkspaceQualification } from '../qualification-workspace.ts';
import { inspectScopedObject } from './scoped-parameter.ts';
import { ContextDirectory, ObservableEditorContext, PanelWorkspace, MissingPanel, scopeOf,
  type Panel, type PanelType, type PanelUpdate, type SavedPanel, type TargetResolver, type RestoreResolver } from './public-panel-workspace.ts';
import { SelectionSummaryPanel, selectionSummaryType } from '../../examples/minimal-panel/panel-template.ts';

class ProbePanel implements Panel {
  readonly id: string; readonly typeId: string;
  updates: Readonly<PanelUpdate>[] = []; disposed = 0; visible = true;
  constructor(id: string, typeId: string) { this.id = id; this.typeId = typeId; }
  restoreViewState(): { restored: true } { return { restored: true }; }
  exportViewState() { return { retained: true }; }
  receive(update: Readonly<PanelUpdate>): void { this.updates.push(update); }
  setVisible(visible: boolean): void { this.visible = visible; }
  canClose() { return { allowed: true }; }
  dispose(): void { this.disposed++; }
}
const providerType: PanelType = { typeId: 'test.canvas', viewStateVersion: 1, providesContext: true, create: ({ id }) => new ProbePanel(id, 'test.canvas') };
const saved = (id: string, extra: Partial<SavedPanel> = {}): SavedPanel => ({ id, typeId: selectionSummaryType.typeId, viewStateVersion: 1, state: { prefix: 'Selected' }, route: { mode: 'follow' }, linkGroup: 0, hidden: false, ...extra });
function fixture() {
  const registry = new Registry(); assert.equal(registry.register(builtinModule).ok, true);
  const graph = new Graph({ name: 'Panel repair', definitions: registry.pin(), outputType: refs.output });
  const a = new ObservableEditorContext(graph), b = new ObservableEditorContext(graph), contexts = new ContextDirectory(); contexts.add(a); contexts.add(b);
  const workspace = new PanelWorkspace(contexts); workspace.createPane('left'); workspace.createPane('right');
  workspace.register(providerType); workspace.register(selectionSummaryType);
  workspace.open(saved('canvas-a', { typeId: providerType.typeId, route: { mode: 'provide', contextId: a.id }, state: {}, linkGroup: 1 }), 'left');
  workspace.open(saved('canvas-b', { typeId: providerType.typeId, route: { mode: 'provide', contextId: b.id }, state: {}, linkGroup: 2 }), 'right');
  const output = graph.stage('pixel').node('output')!.id;
  return { graph, a, b, contexts, workspace, output };
}

test('B01-CE pre-repair public registration cannot express ordinary Panel routing', () => {
  const old = new WorkspaceQualification();
  // This line must remain a TypeScript error; removing the directive makes strict compilation fail.
  // @ts-expect-error sealed contract restricts kind to six built-in names.
  old.registerPanel('selection-summary', 'extension.selection-summary');
  assert.equal(old.parameterTarget('selection-summary'), null);
});
test('B01-01 registration, initial resolution and direct Context selection/navigation/model notifications', () => {
  const { graph, a, workspace, output } = fixture(); workspace.activate('canvas-a');
  const panel = workspace.open(saved('summary'), 'right') as SelectionSummaryPanel;
  assert.equal(panel.project().missing, false); assert.equal(panel.project().count, 0);
  assert.equal(a.select([output]).ok, true); assert.equal(panel.project().primary, output);
  const lease = panel.lease!;
  assert.equal(graph.change('Rename', draft => draft.rename(output, 'Changed')).ok, true);
  assert.notDeepEqual(panel.lease, lease); assert.equal(panel.accept(lease, () => assert.fail('late model response')), false);
  assert.equal(a.navigateStage('pixel').ok, true); assert.equal(panel.project().primary, null);
});
test('B01-02 routing follows group0/groupN/followCanvas/pin, not Parameter focus', () => {
  const { a, b, contexts, workspace, output } = fixture();
  a.select([output]);
  const global = workspace.open(saved('global'), 'left') as SelectionSummaryPanel;
  const group = workspace.open(saved('group', { linkGroup: 1 }), 'right') as SelectionSummaryPanel;
  const fixed = workspace.open(saved('fixed', { route: { mode: 'followCanvas', tabId: 'canvas-a' } }), 'right') as SelectionSummaryPanel;
  const pin = workspace.open(saved('pin', { route: { mode: 'pin', target: { scope: scopeOf(a), object: { kind: 'node', id: output } } } }), 'right') as SelectionSummaryPanel;
  assert.equal(group.project().missing, true);
  workspace.activate('canvas-a'); assert.equal(global.project().primary, output); assert.equal(group.project().primary, output);
  workspace.activate('canvas-b'); assert.equal(global.project().primary, null); assert.equal(group.project().primary, output); assert.equal(fixed.project().primary, output);
  workspace.activate('group'); assert.equal(contexts.activeContextId, b.id);
  a.select([]); assert.equal(pin.project().primary, output); assert.equal(fixed.project().primary, null);
  workspace.hide('canvas-a', true); assert.equal(group.project().missing, false);
  workspace.close('canvas-a'); assert.equal(group.project().missing, true); assert.equal(fixed.project().missing, true); assert.equal(pin.project().primary, output);
  assert.equal(a.disposed, false); workspace.close('canvas-b'); assert.equal(contexts.activeContextId, null); assert.equal(global.project().missing, true);
});
test('B01-03 move/hide preserve instance, private state, Context and model History', () => {
  const { graph, a, workspace } = fixture(); workspace.activate('canvas-a'); const before = graph.exportJSON(), history = graph.historyCounts;
  const panel = workspace.open(saved('summary'), 'left') as SelectionSummaryPanel;
  workspace.move('summary', 'right', 0); workspace.hide('summary', true);
  assert.equal(workspace.panel('summary'), panel); assert.equal(panel.project().visible, false);
  workspace.hide('summary', false); assert.equal(panel.project().title, 'Selected'); assert.equal(a.disposed, false);
  assert.equal(graph.exportJSON(), before); assert.deepEqual(graph.historyCounts, history);
  const layout = workspace.save(); assert.throws(() => { layout.panes[0].tabs.push('illicit'); });
  assert.throws(() => workspace.move('summary', 'left', -1), /TAB_INDEX/); assert.equal(workspace.panel('summary'), panel);
});
test('B01-04 origin preflight blocks retarget/Canvas close/direct Context disposal before callbacks', () => {
  const { a, contexts, workspace } = fixture(); workspace.activate('canvas-a');
  const panel = workspace.open(saved('summary'), 'right') as SelectionSummaryPanel;
  const operation = contexts.beginGesture(a.id, 'summary', 'numeric drag');
  assert.deepEqual(workspace.close('summary'), { allowed: false, reason: 'ORIGIN_GESTURE_BUSY' });
  assert.deepEqual(workspace.close('canvas-a'), { allowed: false, reason: 'ORIGIN_GESTURE_BUSY' });
  assert.throws(() => workspace.activate('canvas-b'), /ORIGIN_GESTURE_BUSY/);
  assert.throws(() => workspace.setRoute('summary', { mode: 'followCanvas', tabId: 'canvas-b' }), /ORIGIN_GESTURE_BUSY/);
  assert.equal(a.dispose().ok, false); assert.equal(workspace.panel('summary'), panel);
  assert.equal(operation.cancel().ok, true); assert.equal(a.dispose().ok, false); // still a live Canvas borrower
  assert.equal(workspace.close('summary').allowed, true); assert.equal(workspace.close('canvas-a').allowed, true);
  assert.equal(a.dispose().ok, true); assert.equal(contexts.get(a.id), undefined);
});
test('B01-05 late replies rejected after retarget, close, and reuse of same Panel ID', () => {
  const { workspace } = fixture(); workspace.activate('canvas-a');
  const panel = workspace.open(saved('summary'), 'left') as SelectionSummaryPanel, old = panel.lease!;
  workspace.setRoute('summary', { mode: 'followCanvas', tabId: 'canvas-b' });
  assert.equal(panel.accept(old, () => assert.fail('stale target')), false);
  const current = panel.lease!; let accepted = 0; assert.equal(panel.accept(current, () => { accepted++; }), true); assert.equal(accepted, 1);
  workspace.close('summary'); workspace.open(saved('summary'), 'right');
  assert.equal(panel.accept(current, () => assert.fail('old instance')), false);
});
test('B01-06 save to fresh workspace uses explicit restore resolver; unresolved references stay opaque', () => {
  const { graph, a, workspace, output } = fixture(); workspace.activate('canvas-a');
  workspace.open(saved('pin', { route: { mode: 'pin', target: { scope: scopeOf(a), object: { kind: 'node', id: output } } } }), 'left');
  const savedWorkspace = workspace.save(), nextContext = new ObservableEditorContext(graph), directory = new ContextDirectory(); directory.add(nextContext);
  let resolutions = 0;
  const restore: RestoreResolver = {
    context: old => { resolutions++; return old === a.id ? nextContext.id : null; },
    target: old => { resolutions++; return old.scope.contextId === a.id ? { ...old, scope: scopeOf(nextContext) } : null; },
  };
  const next = new PanelWorkspace(directory, undefined, restore); next.register(providerType); next.register(selectionSummaryType); next.restore(savedWorkspace);
  assert.ok(resolutions >= 3); assert.ok(next.panel('canvas-b') instanceof MissingPanel);
  assert.equal((next.panel('pin') as SelectionSummaryPanel).project().primary, output);
  assert.equal(nextContext.disposed, false); assert.equal(next.save().panels.find(p => p.id === 'canvas-b')!.route.mode, 'provide');
  const unresolved = new PanelWorkspace(directory); unresolved.register(providerType); unresolved.register(selectionSummaryType); unresolved.restore(savedWorkspace);
  assert.ok(unresolved.panel('pin') instanceof MissingPanel); assert.deepEqual(unresolved.save().panels.find(p => p.id === 'pin'), savedWorkspace.panels.find(p => p.id === 'pin'));
});
test('B01-07 missing type can be registered and explicitly retried through the same workspace', () => {
  const { workspace } = fixture(); const record = saved('later', { typeId: 'extension.later', state: { retained: true } });
  assert.ok(workspace.open(record, 'left') instanceof MissingPanel);
  workspace.register({ typeId: record.typeId, viewStateVersion: 1, create: ({ id }) => new ProbePanel(id, record.typeId) });
  assert.equal(workspace.retry('later'), true); assert.ok(workspace.panel('later') instanceof ProbePanel); assert.deepEqual(workspace.save().panels.find(p => p.id === 'later')!.state, record.state);
});
test('B01-08 callback errors, reentrancy and dispose failure remain isolated', () => {
  const { workspace } = fixture(); workspace.activate('canvas-a'); let disposed = 0;
  workspace.register({ typeId: 'extension.bad', viewStateVersion: 1, create: ({ id }) => ({
    id, typeId: 'extension.bad', restoreViewState: () => ({ restored: true }), exportViewState: () => ({ retained: 1 }), setVisible: () => {},
    receive: update => { assert.equal(Object.isFrozen(update.target), true); workspace.createPane('reentrant'); },
    canClose: () => ({ allowed: true }), dispose: () => { disposed++; throw Error('dispose failure'); },
  }) });
  const opened = workspace.open(saved('bad', { typeId: 'extension.bad', state: { retained: 1 } }), 'left');
  assert.equal(opened, workspace.panel('bad'));
  assert.ok(workspace.panel('bad') instanceof MissingPanel); assert.equal(disposed, 1); assert.equal(workspace.panes().some(p => p.id === 'reentrant'), false);
  assert.ok(workspace.issues.some(i => i.message.includes('REENTRANCY'))); assert.ok(workspace.issues.some(i => i.phase === 'dispose'));
  assert.equal(workspace.retry('bad'), false);
  const good = workspace.open(saved('good'), 'left') as SelectionSummaryPanel; assert.equal(good.project().missing, false);
});
test('B01-09 direct Context selection callbacks cannot reenter selection; operation-end refresh is automatic', () => {
  const { a, workspace, output } = fixture(); workspace.activate('canvas-a'); const panel = workspace.open(saved('summary'), 'right') as SelectionSummaryPanel;
  const off = a.subscribe(event => { if (event === 'selection') assert.equal(a.select([]).ok, false); });
  assert.equal(a.select([output]).ok, true); assert.equal(panel.project().primary, output); off();
  workspace.close('canvas-a'); assert.equal(a.dispose().ok, true); assert.equal(panel.project().missing, true);
});
test('B01-10 structural restore validation fails before creating any Tab or contribution', () => {
  const { contexts } = fixture(); const workspace = new PanelWorkspace(contexts); workspace.register(selectionSummaryType);
  assert.throws(() => workspace.restore({ version: 1, panes: [{ id: 'x', tabs: ['missing'], activeTab: 'missing' }], panels: [] }), /TAB_MISSING/);
  assert.deepEqual(workspace.panes(), []); assert.deepEqual(workspace.panels(), []);
});
test('B01-11 pin owns a retained scope lease, survives source navigation/disposal, releases only its own Context', () => {
  const { a, b, contexts, workspace, output } = fixture(); workspace.activate('canvas-a'); a.select([output]);
  const panel = workspace.open(saved('pin', { route: { mode: 'pin', target: { scope: scopeOf(a), object: { kind: 'node', id: output } } } }), 'right') as SelectionSummaryPanel;
  const effective = workspace.targetContext(panel.lease!)!;
  assert.notEqual(effective.id, a.id); assert.equal(effective.graph, a.graph);
  assert.equal(a.navigateStage('pixel').ok, true); assert.equal(panel.project().primary, output); assert.equal(workspace.targetContext(panel.lease!), effective);
  workspace.close('canvas-a'); assert.equal(a.dispose().ok, true);
  assert.equal(panel.project().primary, output); assert.equal(workspace.targetContext(panel.lease!), effective);
  const oldLease = panel.lease!;
  assert.equal(effective.graph.change('Pinned source gone', draft => draft.rename(output, 'renamedWhilePinned')).ok, true);
  assert.notDeepEqual(panel.lease, oldLease); assert.equal(panel.accept(oldLease, () => assert.fail('stale pinned reply')), false);
  assert.equal(workspace.close('pin').allowed, true); assert.equal(effective.disposed, true); assert.equal(contexts.get(effective.id), undefined); assert.equal(b.disposed, false);
});
test('B01-12 cross-Context reentry is rejected, not silently mutated with a dropped notification', () => {
  const { a, b, contexts, output } = fixture(); const before = b.objectSelection;
  const off = contexts.subscribe(() => { const reentry = b.select([output]); assert.equal(reentry.ok, false); if (!reentry.ok) assert.equal(reentry.error.code, 'CONTEXT_REENTRANCY'); });
  assert.equal(a.select([output]).ok, true); assert.deepEqual(b.objectSelection, before); off();
});
test('B01-13 pinned callback failure cleans retained Context after coherent publication', () => {
  const { a, contexts, workspace, output } = fixture(); workspace.activate('canvas-a'); let calls = 0;
  workspace.register({ typeId: 'pin.fail-later', viewStateVersion: 1, create: ({ id }) => ({
    id, typeId: 'pin.fail-later', restoreViewState: () => ({ restored: true }), exportViewState: () => ({ keep: true }), setVisible: () => {}, canClose: () => ({ allowed: true }), dispose: () => {},
    receive: () => { calls++; if (calls > 1) throw Error('render failure'); },
  }) });
  workspace.open(saved('pin-failed', { typeId: 'pin.fail-later', state: { keep: true }, route: { mode: 'pin', target: { scope: scopeOf(a), object: { kind: 'node', id: output } } } }), 'right');
  const retained = contexts.values().find(c => c.id !== a.id && !workspace.panels().some(p => p.route.mode === 'provide' && p.route.contextId === c.id))!;
  assert.ok(retained);
  assert.equal(a.graph.change('render next publication', d => d.rename(output, 'newName')).ok, true);
  assert.ok(workspace.panel('pin-failed') instanceof MissingPanel); assert.equal(retained.disposed, true); assert.equal(contexts.get(retained.id), undefined);
});
test('B01-14 malformed pin input is rejected before mutating the live Tab or calling contribution', () => {
  const { workspace } = fixture(); workspace.activate('canvas-a'); const panel = workspace.open(saved('summary'), 'right');
  const before = workspace.save();
  assert.throws(() => workspace.setRoute('summary', { mode: 'pin' } as never), /TARGET_REF/);
  assert.deepEqual(workspace.save(), before); assert.equal(workspace.panel('summary'), panel);
});
test('B01-15 canClose failure keeps Tab and Panel intact; dispose failure still completes allowed close', () => {
  const { workspace } = fixture(); let allow = false, disposed = 0;
  workspace.register({ typeId: 'close.guarded', viewStateVersion: 1, create: ({ id }) => ({
    id, typeId: 'close.guarded', restoreViewState: () => ({ restored: true }), exportViewState: () => null, receive: () => {}, setVisible: () => {},
    canClose: () => { if (!allow) throw Error('unfinished draft'); return { allowed: true }; }, dispose: () => { disposed++; throw Error('cleanup error'); },
  }) });
  const panel = workspace.open(saved('guarded', { typeId: 'close.guarded' }), 'right');
  assert.deepEqual(workspace.close('guarded'), { allowed: false, reason: 'PANEL_CLOSE_FAILED' }); assert.equal(disposed, 0); assert.equal(workspace.panel('guarded'), panel);
  allow = true; assert.equal(workspace.close('guarded').allowed, true); assert.equal(disposed, 1); assert.equal(workspace.panel('guarded'), undefined);
});
test('B01-16 pin failure during its own Context notification drains cleanup after notification', () => {
  const { a, b, contexts, workspace, output } = fixture(); let updates = 0, shouldFail = false;
  workspace.register({ typeId: 'last.pin', viewStateVersion: 1, create: ({ id }) => ({
    id, typeId: 'last.pin', restoreViewState: () => ({ restored: true }), exportViewState: () => ({}), setVisible: () => {}, canClose: () => ({ allowed: true }), dispose: () => {},
    receive: () => { updates++; if (shouldFail) throw Error('last Context render failure'); },
  }) });
  workspace.open(saved('last', { typeId: 'last.pin', state: {}, route: { mode: 'pin', target: { scope: scopeOf(a), object: { kind: 'node', id: output } } } }), 'right');
  workspace.close('canvas-a'); workspace.close('canvas-b'); assert.equal(a.dispose().ok, true); assert.equal(b.dispose().ok, true);
  const retained = contexts.values()[0]; assert.ok(retained); shouldFail = true;
  assert.equal(retained.graph.change('Only pin remains', d => d.rename(output, 'pinOnly')).ok, true);
  assert.ok(updates > 1); assert.ok(workspace.panel('last') instanceof MissingPanel); assert.equal(retained.disposed, true); assert.equal(contexts.values().length, 0);
});
test('B01-17 disposed public objects reject new subscriptions rather than retaining unreachable callbacks', () => {
  const { a, workspace } = fixture(); workspace.close('canvas-a'); assert.equal(a.dispose().ok, true);
  assert.throws(() => a.subscribe(() => {}), /CONTEXT_CLOSED/); assert.throws(() => a.guard(() => ({ allowed: true })), /CONTEXT_CLOSED/);
  assert.equal(workspace.dispose().allowed, true); assert.throws(() => workspace.subscribe(() => {}), /WORKSPACE_CLOSED/);
});

