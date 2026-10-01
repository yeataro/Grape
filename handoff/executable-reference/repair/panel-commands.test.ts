/** IH-005 editable Panel seam. Fake controls and one application command, not production UI. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Graph, Registry, type Operation } from '../core.ts';
import { builtinModule, refs } from '../nodes.ts';
import { value } from './scoped-fixtures.ts';
import { PanelWorkspace, ContextDirectory, ObservableEditorContext, type PanelType, type PanelUpdate, type SavedPanel } from './public-panel-workspace.ts';
import { PanelRenderer } from './view-mount.ts';
import { QualificationLocalization } from './localization.ts';
import type { ApplicationPanelCommandAuthority, PanelCommandTarget, PanelCommandOrigin, PanelCommands } from '../../contracts/panel-commands.ts';
import type { PanelMountContext, MountSurface, PanelViewContribution } from '../../contracts/view-mount.ts';
import type { Json } from '../../contracts/public-surface.ts';
import { editablePanelType } from '../../examples/editable-panel/panel.ts';
class Surface {
  listeners = new Map<string, (args: Json) => void>(); paints: Json[] = [];
  surface: MountSurface = { protocol: 'qualification.controls.v1', target: this };
  open() { const own = new Set<string>(); return {
    paint: (v: Json) => this.paints.push(v), on: (name: string, fn: (v: Json) => void) => { own.add(name); this.listeners.set(name, fn); return () => this.listeners.delete(name); },
    dispose: () => { for (const name of own) this.listeners.delete(name); },
  }; }
  fire(name: string, args: Json = null) { this.listeners.get(name)?.(args); }
}
const record = (id: string, typeId = editablePanelType.typeId): SavedPanel => ({ id, typeId, viewStateVersion: 1, state: {}, route: { mode: 'follow' }, linkGroup: 0, hidden: false });
function setup() {
  const registry = new Registry(); value(registry.register(builtinModule)); const graph = new Graph({ name: 'Panel commands', definitions: registry.pin(), outputType: refs.output });
  const nodeId = value(graph.change('Fixture', d => d.createNode(graph.stage('pixel').id, refs.constant, { value: 3 })));
  const context = new ObservableEditorContext(graph), other = new ObservableEditorContext(graph), directory = new ContextDirectory();
  directory.add(context); directory.add(other); directory.activate(context.id); value(context.select([nodeId])); value(other.select([nodeId]));
  const origins: PanelCommandOrigin[] = []; let allowed = true;
  const resolve = (target: PanelCommandTarget) => { const c = directory.get(target.scope.contextId); assert.ok(c); assert.equal(c.graph.loadId, target.scope.loadId); assert.equal(target.scope.networkPath.length, 0); assert.equal(target.object?.kind, 'node'); return c; };
  const position = (args: Json): [number, number] => { if (!Array.isArray(args) || args.length !== 2 || !args.every(v => typeof v === 'number' && Number.isFinite(v))) throw Error('POSITION'); return args as [number, number]; };
  const authority: ApplicationPanelCommandAuthority = {
    allows: (_type, command) => allowed && command === 'grape.editor.move-target',
    execute: (origin, target, intent) => { const p = position(intent.args), c = resolve(target); origins.push(origin); value(c.change('Panel move', d => d.move(target.object!.id, p))); },
    beginGesture: (origin, target, intent) => {
      const first = position(intent.args), c = resolve(target); origins.push(origin);
      const op: Operation = directory.beginGesture(c.id, origin.panelId, 'Panel drag');
      const update = (args: Json) => { const p = position(args); value(c.change('Panel drag update', d => d.move(target.object!.id, p), op)); };
      try { update(first); } catch (e) { value(op.cancel()); throw e; }
      return { update, commit: () => { value(op.commit()); }, cancel: () => { value(op.cancel()); } };
    },
  };
  const workspace = new PanelWorkspace(directory, undefined, undefined, authority); workspace.createPane('a'); workspace.createPane('b'); workspace.register(editablePanelType);
  const surfaces = new Map<string, Surface>(); const surface = (id: string) => { if (!surfaces.has(id)) surfaces.set(id, new Surface()); return surfaces.get(id)!; };
  const renderer = new PanelRenderer(workspace, new QualificationLocalization(), id => surface(id).surface);
  const open = (id = 'a', pane = id) => workspace.open(record(id), pane);
  const point = () => graph.nodeById(nodeId)!.position;
  return { graph, nodeId, context, other, directory, workspace, renderer, origins, surface, open, point, deny: () => { allowed = false; } };
}
function probe(f: ReturnType<typeof setup>, id: string, commandIds: readonly string[] | undefined = ['grape.editor.move-target'], onRender: () => void = () => {}) {
  let update!: PanelUpdate, mount!: PanelMountContext; const subscribers = new Set<() => void>();
  const type: PanelType = { typeId: `probe.${id}`, viewStateVersion: 1, commandIds, create: ({ id }) => ({
    id, typeId: `probe.${id}`, restoreViewState: () => ({ restored: true }), exportViewState: () => ({}),
    receive: u => { update = u; subscribers.forEach(fn => fn()); }, setVisible() {}, canClose: () => ({ allowed: true }), dispose() {},
    createView: (): PanelViewContribution => ({ kind: 'panel', capture: () => update, subscribe: fn => { subscribers.add(fn); return () => subscribers.delete(fn); }, dispose() {}, mount: ctx => { mount = ctx; return { update: onRender }; } }),
  }) };
  f.workspace.register(type); f.workspace.open(record(id, type.typeId), id === 'a' ? 'a' : 'b');
  return { get update() { return update; }, get mount() { return mount; }, invoke: (fn: (commands: PanelCommands) => void) => mount.scope.event(() => fn(mount.commands!))() };
}

test('PC01 registered editable Panel submits application-owned semantic edit; normal Undo restores model', () => {
  const f = setup(); f.open(); f.surface('a').fire('execute', [4, 5]); assert.deepEqual(f.point(), [4, 5]); assert.equal(f.graph.historyCounts.undo, 2);
  assert.deepEqual(f.origins, [{ panelId: 'a', typeId: editablePanelType.typeId }]); value(f.graph.history.undo()); assert.deepEqual(f.point(), [0, 0]);
});
test('PC02 two Panels use identical seam; A cannot submit B lease or origin', () => {
  const f = setup(), a = probe(f, 'a'), b = probe(f, 'b');
  a.invoke(c => c.execute(b.update.lease, { commandId: 'grape.editor.move-target', args: [1, 2] })); assert.deepEqual(f.point(), [0, 0]); assert.equal(f.origins.length, 0);
  assert.match(f.renderer.issues('a').at(-1)!.message, /PANEL_COMMAND_STALE/);
  b.invoke(c => c.execute(b.update.lease, { commandId: 'grape.editor.move-target', args: [8, 9] })); assert.equal(f.origins[0].panelId, 'b');
});
test('PC03 read-only Panels receive no commands; requested command still needs application grant', () => {
  const f = setup(), a = probe(f, 'a', []), b = probe(f, 'b'); assert.equal(a.mount.commands, undefined);
  f.deny(); b.invoke(c => c.execute(b.update.lease, { commandId: 'grape.editor.move-target', args: [1, 2] })); assert.deepEqual(f.point(), [0, 0]); assert.match(f.renderer.issues('b').at(-1)!.message, /DENIED/);
});
test('PC04 outside-event, async continuation and stale target lease cannot submit commands', async () => {
  const f = setup(), a = probe(f, 'a'), commands = a.mount.commands!, oldLease = a.update.lease;
  assert.throws(() => commands.execute(oldLease, { commandId: 'grape.editor.move-target', args: [1, 2] }), /VIEW_EDIT_AUTHORITY/);
  value(f.context.select([])); a.invoke(c => c.execute(oldLease, { commandId: 'grape.editor.move-target', args: [1, 2] })); assert.deepEqual(f.point(), [0, 0]);
  let late!: () => void; a.mount.scope.event(() => { late = () => commands.execute(a.update.lease, { commandId: 'grape.editor.move-target', args: [2, 3] }); })(); await Promise.resolve(); assert.throws(late, /VIEW_EDIT_AUTHORITY/);
});
test('PC05 gesture updates aggregate in one History entry; close and retarget preflight retain authority', () => {
  const f = setup(); f.open(); const s = f.surface('a'); s.fire('begin', [1, 2]); s.fire('update', [3, 4]); assert.equal(f.graph.historyCounts.undo, 1);
  assert.equal(f.workspace.close('a').reason, 'ORIGIN_GESTURE_BUSY'); assert.throws(() => f.workspace.setRoute('a', { mode: 'pin', target: { scope: { graphId: f.graph.id, loadId: f.graph.loadId, contextId: f.other.id, stageId: f.other.stageId, networkPath: [] }, object: { kind: 'node', id: f.nodeId } } }), /ORIGIN_GESTURE_BUSY/);
  s.fire('commit'); assert.equal(f.graph.historyCounts.undo, 2); value(f.graph.history.undo()); assert.deepEqual(f.point(), [0, 0]); assert.equal(f.workspace.close('a').allowed, true);
});
test('PC06 gesture malformed update is atomic and retryable; cancel compensates without history', () => {
  const f = setup(); f.open(); const s = f.surface('a'); s.fire('begin', [2, 3]); s.fire('update', 'bad'); assert.deepEqual(f.point(), [2, 3]); s.fire('update', [4, 5]); s.fire('cancel'); assert.deepEqual(f.point(), [0, 0]); assert.equal(f.graph.historyCounts.undo, 1); assert.equal(f.graph.busy, false);
});
test('PC07 hide/remount cancels unfinished pointer gesture, retains Panel; revoked handler cannot edit', () => {
  const f = setup(), panel = f.open(), s = f.surface('a'); s.fire('begin', [3, 4]); const old = s.listeners.get('update')!;
  f.workspace.hide('a', true); assert.deepEqual(f.point(), [0, 0]); assert.equal(f.graph.busy, false); old([9, 9]); assert.deepEqual(f.point(), [0, 0]);
  f.workspace.hide('a', false); assert.equal(f.workspace.panel('a'), panel); s.fire('execute', [5, 6]); assert.deepEqual(f.point(), [5, 6]);
});
test('PC08 move and renderer detach revoke old command handles; no stale gesture survives event-route loss', () => {
  const f = setup(), a = probe(f, 'a'), oldMount = a.mount; let gesture!: ReturnType<PanelCommands['beginGesture']>;
  a.invoke(c => { gesture = c.beginGesture(a.update.lease, { commandId: 'grape.editor.move-target', args: [5, 6] }); });
  f.workspace.move('a', 'b'); assert.deepEqual(f.point(), [0, 0]); assert.throws(() => gesture.update(a.update.lease, [8, 9]), /CLOSED/);
  oldMount.scope.event(() => oldMount.commands!.execute(a.update.lease, { commandId: 'grape.editor.move-target', args: [9, 9] }))(); assert.deepEqual(f.point(), [0, 0]);
  f.renderer.dispose(); assert.throws(() => a.mount.commands!.execute(a.update.lease, { commandId: 'grape.editor.move-target', args: [9, 9] }), /VIEW_EDIT_AUTHORITY/);
});
test('PC09 retarget and close/reopen same ID fence old instance commands and leases', () => {
  const f = setup(), a = probe(f, 'a'), oldLease = a.update.lease, oldMount = a.mount;
  f.workspace.setRoute('a', { mode: 'pin', target: { scope: { graphId: f.graph.id, loadId: f.graph.loadId, contextId: f.other.id, stageId: f.other.stageId, networkPath: [] }, object: { kind: 'node', id: f.nodeId } } });
  a.invoke(c => c.execute(oldLease, { commandId: 'grape.editor.move-target', args: [2, 3] })); assert.deepEqual(f.point(), [0, 0]);
  assert.equal(f.workspace.close('a').allowed, true); f.workspace.open(record('a', 'probe.a'), 'a');
  oldMount.scope.event(() => oldMount.commands!.execute(a.update.lease, { commandId: 'grape.editor.move-target', args: [9, 9] }))(); assert.deepEqual(f.point(), [0, 0]);
});
test('PC10 capture/update render cannot execute Panel commands; failure yields placeholder without model mutation', () => {
  const f = setup(); let latest!: PanelUpdate; const type: PanelType = { typeId: 'render-edit', viewStateVersion: 1, commandIds: ['grape.editor.move-target'], create: ({ id }) => ({ id, typeId: 'render-edit', restoreViewState: () => ({ restored: true }), exportViewState: () => ({}), receive: u => { latest = u; }, setVisible() {}, canClose: () => ({ allowed: true }), dispose() {}, createView: () => ({ kind: 'panel', capture: () => latest, subscribe: () => () => {}, dispose() {}, mount: ctx => ({ update: () => ctx.commands!.execute(latest.lease, { commandId: 'grape.editor.move-target', args: [3, 4] }) }) }) }) };
  f.workspace.register(type); f.workspace.open(record('a', type.typeId), 'a'); assert.equal(f.renderer.status('a'), 'placeholder'); assert.deepEqual(f.point(), [0, 0]); assert.match(f.renderer.issues('a')[0].message, /VIEW_EDIT_AUTHORITY/);
});
test('PC11 feature example and generic renderer do not import Graph/History or branch on Panel type', () => {
  const example = fs.readFileSync(new URL('../../examples/editable-panel/panel.ts', import.meta.url), 'utf8'); assert.doesNotMatch(example, /from\s+['"][^'"]*(?:core|qualification-actions)\.ts|\.graph\b|\.history\b|beginOperation|instanceof/);
  const renderer = fs.readFileSync(new URL('./view-mount.ts', import.meta.url), 'utf8'); assert.doesNotMatch(renderer, /example\.position|move-target|instanceof|\.graph\b|\.history\b|switch\s*\(/);
});
test('PC12 render failure during gesture update cancels after model publication, without reentrant write or orphan operation', () => {
  const f = setup(); let fail = false; const a = probe(f, 'a', ['grape.editor.move-target'], () => { if (fail) throw Error('RENDER_FAILED'); });
  let gesture!: ReturnType<PanelCommands['beginGesture']>;
  a.invoke(c => { gesture = c.beginGesture(a.update.lease, { commandId: 'grape.editor.move-target', args: [1, 2] }); });
  fail = true; a.invoke(() => gesture.update(a.update.lease, [4, 5]));
  assert.equal(f.renderer.status('a'), 'placeholder'); assert.deepEqual(f.point(), [0, 0]); assert.equal(f.graph.busy, false); assert.equal(f.graph.historyCounts.undo, 1);
  assert.ok(!f.renderer.issues('a').some(issue => /REENTRANT_WRITE/.test(issue.message))); fail = false; f.renderer.retry('a'); assert.equal(f.renderer.status('a'), 'mounted');
});
test('PC13 hide cleanup publishes cancellation before returning, revokes old target reply and exposes current projection', () => {
  const f = setup(), a = probe(f, 'a'), b = probe(f, 'b', []);
  a.invoke(c => c.beginGesture(a.update.lease, { commandId: 'grape.editor.move-target', args: [2, 3] }));
  const beforeCancel = a.update.lease, otherBeforeCancel = b.update.lease, oldScope = a.mount.scope, oldTicket = oldScope.ticket(); let replies = 0;
  f.workspace.hide('a', true);
  assert.deepEqual(f.point(), [0, 0]); assert.equal(f.graph.busy, false);
  assert.ok(a.update.lease.generation > beforeCancel.generation, 'cleanup model publication must issue a new target lease before hide returns');
  assert.ok(b.update.lease.generation > otherBeforeCancel.generation, 'other Panels sharing the model must see the same post-cancel publication');
  assert.equal(f.workspace.accept(beforeCancel, () => replies++), false);
  assert.equal(f.workspace.accept(otherBeforeCancel, () => replies++), false);
  assert.equal(oldScope.accept(oldTicket, () => replies++), false); assert.equal(replies, 0);
  const current = f.workspace.targetContext(a.update.lease); assert.ok(current); assert.deepEqual(current.graph.nodeById(f.nodeId)!.position, [0, 0]);
  f.workspace.hide('a', false); assert.equal(f.renderer.status('a'), 'mounted');
  a.invoke(c => c.execute(a.update.lease, { commandId: 'grape.editor.move-target', args: [6, 7] })); assert.deepEqual(f.point(), [6, 7]);
});
