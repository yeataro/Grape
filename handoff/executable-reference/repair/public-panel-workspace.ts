/** Executable architecture specification. NOT THE PRODUCTION IMPLEMENTATION.
 * Public Panel composition contract; no Panel-kind switch or private model access.
 */
import { canonical, EditorContext, type Operation, type Graph, type SelectionRef, type NetworkSelectionScope } from '../core.ts';
import type { Json, Result } from '../contracts.ts';
import type { ScopeRef } from './scoped-parameter.ts';
import { inspectScopedObject } from './scoped-parameter.ts';
import type { PanelViewContribution } from '../../contracts/view-mount.ts';
import type { ApplicationPanelCommandAuthority, PanelCommandMountAuthority, PanelCommands, PanelCommandLease, PanelCommandIntent } from '../../contracts/panel-commands.ts';
import { NestedNetworkEditorQualification } from '../qualification-workspace.ts';

export type Unsubscribe = () => void;
export interface Check { allowed: boolean; reason?: string }
export interface ObjectRef { kind: SelectionRef['kind']; id: string }
export interface TargetRef { scope: ScopeRef; object: ObjectRef | null }
export type ResolvedTarget =
  | { status: 'resolved'; ref: TargetRef; selection: readonly ObjectRef[]; details?: Json }
  | { status: 'missing'; reason: string; requested?: TargetRef };
export interface TargetResolver {
  /** No canonical Graph mutation. May acquire/release view-local retained scope leases.
   * Validate scope/lifetime and return missing rather than choose another object. */
  resolve(context: EditorContext | undefined, reference: TargetRef, request?: { panelId: string; pinned: boolean }): ResolvedTarget;
  release?(panelId: string): void;
}
export interface RestoreResolver {
  /** Explicit restore mapping. Never infer a new load or Context by matching a display name. */
  context(id: string): string | null;
  target(reference: TargetRef): TargetRef | null;
}
export type Route =
  | { mode: 'provide'; contextId: string }
  | { mode: 'follow' }
  | { mode: 'followCanvas'; tabId: string }
  | { mode: 'pin'; target: TargetRef };
export interface TargetLease { readonly panelId: string; readonly generation: number }
export interface PanelUpdate { readonly target: ResolvedTarget; readonly lease: TargetLease }
export interface PanelServices {
  /** Checks freshness before invoking a callback; a stale reply has no observable callback. */
  accept(lease: TargetLease, callback: () => void): boolean;
  /** Effective scope Context; borrowed and lifecycle observable, including retained pin scope. */
  context(lease: TargetLease): ObservableEditorContext | null;
}
export interface Panel {
  /** IH-004: required by production Panel factories; optional only for pre-mount qualification fixtures. */
  createView?(): PanelViewContribution;
  readonly id: string;
  readonly typeId: string;
  restoreViewState(state: Json, resolver: RestoreResolver): { restored: boolean; reason?: string };
  exportViewState(): Json;
  /** Called first with resolved-or-missing initial target, then for each relevant public state publication. */
  receive(update: Readonly<PanelUpdate>): void;
  setVisible(visible: boolean): void;
  canClose(): Check;
  dispose(): void;
}
export interface PanelType {
  readonly typeId: string;
  readonly viewStateVersion: number;
  readonly providesContext?: boolean;
  /** Requests only; application policy must also grant each command. No request means read-only. */
  readonly commandIds?: readonly string[];
  create(input: { id: string; services: PanelServices }): Panel;
}
export interface SavedPanel {
  id: string; typeId: string; viewStateVersion: number; state: Json;
  route: Route; linkGroup: number; hidden: boolean;
}
export interface PaneRecord { id: string; tabs: string[]; activeTab: string | null }
export interface SavedWorkspace { version: 1; panes: PaneRecord[]; panels: SavedPanel[] }
export interface WorkspaceIssue { panelId: string | null; phase: string; message: string }

function clone<T>(value: T): T { canonical(value); return structuredClone(value); }
function immutable<T>(value: T): T {
  const copy = clone(value);
  const visit = (v: unknown): void => { if (v && typeof v === 'object') { Object.values(v).forEach(visit); Object.freeze(v); } };
  visit(copy); return copy;
}
function demand(ok: unknown, code: string): asserts ok { if (!ok) throw Error(code); }
function unwrap<T>(result: { ok: true; value: T } | { ok: false; error: unknown }): T {
  if (!result.ok) throw Error(String(result.error)); return result.value;
}
export function scopeOf(context: EditorContext): ScopeRef {
  return immutable({ graphId: context.graph.id, loadId: context.graph.loadId, contextId: context.id,
    stageId: context.stageId, networkPath: context.activeNetwork.path });
}

export type ContextEvent = 'selection' | 'navigation' | 'model' | 'operation-end' | 'disposed';
/** Additive public Context contract: direct public methods notify after successful model/projection publication.
 * Subclass changes no Graph/History code and stores no second selection/model state.
 */
export class ObservableEditorContext extends EditorContext {
  #listeners = new Set<(event: ContextEvent) => void>();
  #guards = new Set<(action: 'selection' | 'navigation' | 'dispose') => Check>();
  #notifying = false;
  #afterNotification: (() => void)[] = [];
  #off: Unsubscribe[];
  #errors: string[] = [];
  constructor(graph: Graph) {
    super(graph);
    this.#off = [graph.subscribe(() => this.#emit('model')), graph.subscribeOperationEnd(() => this.#emit('operation-end'))];
  }
  subscribe(callback: (event: ContextEvent) => void): Unsubscribe { demand(!this.disposed, 'CONTEXT_CLOSED'); this.#listeners.add(callback); return () => this.#listeners.delete(callback); }
  guard(callback: (action: 'selection' | 'navigation' | 'dispose') => Check): Unsubscribe { demand(!this.disposed, 'CONTEXT_CLOSED'); this.#guards.add(callback); return () => this.#guards.delete(callback); }
  afterNotification(callback: () => void): void { if (this.#notifying) this.#afterNotification.push(callback); else callback(); }
  get observerErrors(): readonly string[] { return [...this.#errors]; }
  #emit(event: ContextEvent): void {
    this.#notifying = true;
    try { for (const listener of [...this.#listeners]) { try { listener(event); } catch (error) { this.#errors.push(String(error)); } } }
    finally {
      this.#notifying = false;
      for (const cleanup of this.#afterNotification.splice(0)) { try { cleanup(); } catch (error) { this.#errors.push(String(error)); } }
    }
  }
  #attempt(action: 'selection' | 'navigation' | 'dispose', callback: () => Result<void>): Result<void> {
    if (this.#notifying) return { ok: false, error: { code: 'CONTEXT_REENTRANCY', message: 'Context notification is read-only' } };
    for (const guard of this.#guards) {
      let check: Check; try { check = guard(action); } catch { check = { allowed: false, reason: 'CONTEXT_GUARD_FAILED' }; }
      if (!check.allowed) return { ok: false, error: { code: check.reason ?? 'CONTEXT_BUSY', message: 'Context operation blocked before mutation' } };
    }
    const result = callback(); if (result.ok) this.#emit(action === 'dispose' ? 'disposed' : action); return result;
  }
  override selectObjects(items: SelectionRef[], primary?: SelectionRef | null): Result<void> {
    return this.#attempt('selection', () => super.selectObjects(items, primary));
  }
  override navigateStage(stage: 'vertex' | 'pixel'): Result<void> { return this.#attempt('navigation', () => super.navigateStage(stage)); }
  override enterNetwork(scope: NetworkSelectionScope | null): Result<void> { return this.#attempt('navigation', () => super.enterNetwork(scope)); }
  override dispose(): Result<void> {
    const result = this.#attempt('dispose', () => { const result = super.dispose(); if (result.ok) { this.#off.forEach(off => off()); this.#guards.clear(); } return result; });
    if (result.ok) this.#listeners.clear(); return result;
  }
}

/** Registry/activation/origin service, not a copy of Context selection or Graph. */
export class ContextDirectory {
  #contexts = new Map<string, ObservableEditorContext>();
  #subscriptions = new Map<string, Unsubscribe[]>();
  #listeners = new Set<() => void>();
  #gestures = new Map<string, { contextId: string; panelId: string; operation: Operation }>();
  #active: string | null = null;
  #publishing = false;
  #releaseGuards = new Set<(id: string) => Check>();
  #afterPublication: (() => void)[] = [];
  readonly issues: string[] = [];
  get activeContextId(): string | null { return this.#active; }
  get(id: string): ObservableEditorContext | undefined { return this.#contexts.get(id); }
  values(): readonly ObservableEditorContext[] { return [...this.#contexts.values()]; }
  releaseGuard(callback: (id: string) => Check): Unsubscribe { this.#releaseGuards.add(callback); return () => this.#releaseGuards.delete(callback); }
  /** Owner cleanup is deferred until all observers saw the same publication. Never use this to resubmit rejected UI edits. */
  afterPublication(callback: () => void): void {
    if (this.#publishing) this.#afterPublication.push(callback); else callback();
  }
  add(context: ObservableEditorContext): void {
    demand(!this.#publishing, 'CONTEXT_REENTRANCY');
    demand(!context.disposed && !this.#contexts.has(context.id), 'CONTEXT_ID');
    this.#contexts.set(context.id, context);
    this.#subscriptions.set(context.id, [context.subscribe(event => {
      if (event === 'operation-end' && !context.graph.busy) this.#gestures.delete(context.graph.loadId);
      if (event === 'disposed') {
        this.#subscriptions.get(context.id)?.forEach(off => off()); this.#subscriptions.delete(context.id); this.#contexts.delete(context.id);
        if (this.#active === context.id) this.#active = null;
      }
      this.#publish();
    }), context.guard(action => {
      if (this.#publishing) return { allowed: false, reason: 'CONTEXT_REENTRANCY' };
      const origin = this.preflight([], [context.id]); if (!origin.allowed) return origin;
      if (action === 'dispose') for (const guard of this.#releaseGuards) { const check = guard(context.id); if (!check.allowed) return check; }
      return { allowed: true };
    })]);
    this.#publish();
  }
  subscribe(listener: () => void): Unsubscribe { this.#listeners.add(listener); return () => this.#listeners.delete(listener); }
  #publish(): void {
    if (this.#publishing) { this.issues.push('CONTEXT_REENTRANCY'); return; }
    this.#publishing = true;
    try { for (const callback of [...this.#listeners]) { try { callback(); } catch (error) { this.issues.push(String(error)); } } }
    finally {
      this.#publishing = false;
      const cleanup = this.#afterPublication.splice(0);
      for (const callback of cleanup) { try { callback(); } catch (error) { this.issues.push(String(error)); } }
    }
  }
  #live(id: string): EditorContext { const context = this.#contexts.get(id); demand(context && !context.disposed, 'CONTEXT_CLOSED'); return context; }
  #command(id: string, run: (context: EditorContext) => void): void {
    demand(!this.#publishing, 'CONTEXT_REENTRANCY');
    const check = this.preflight([], [id]); demand(check.allowed, check.reason ?? 'CONTEXT_BUSY');
    run(this.#live(id));
  }
  select(id: string, items: SelectionRef[], primary?: SelectionRef | null): void {
    this.#command(id, context => { unwrap(context.selectObjects(clone(items), primary === undefined ? undefined : clone(primary))); });
  }
  navigateStage(id: string, stage: 'vertex' | 'pixel'): void { this.#command(id, context => { unwrap(context.navigateStage(stage)); }); }
  navigateNetwork(id: string, scope: NetworkSelectionScope | null): void { this.#command(id, context => { unwrap(context.enterNetwork(scope)); }); }
  activate(id: string | null): void {
    demand(!this.#publishing, 'CONTEXT_REENTRANCY');
    if (id !== null) this.#live(id);
    if (this.#active === id) return;
    const check = this.preflight([], this.#active ? [this.#active] : []); demand(check.allowed, check.reason ?? 'CONTEXT_BUSY');
    this.#active = id; this.#publish();
  }
  beginGesture(contextId: string, panelId: string, label: string): Operation {
    demand(!this.#publishing, 'CONTEXT_REENTRANCY');
    const context = this.#live(contextId), operation = unwrap(context.beginOperation(label));
    this.#gestures.set(context.graph.loadId, { contextId, panelId, operation }); return operation;
  }
  preflight(panelIds: readonly string[], contextIds: readonly string[]): Check {
    for (const gesture of this.#gestures.values()) {
      if (panelIds.includes(gesture.panelId) || contextIds.includes(gesture.contextId)) return { allowed: false, reason: 'ORIGIN_GESTURE_BUSY' };
    }
    // An operation created outside the public origin service has unknown ownership: fail closed.
    for (const id of contextIds) { const c = this.#contexts.get(id); if (c?.graph.busy && !this.#gestures.has(c.graph.loadId)) return { allowed: false, reason: 'UNTRACKED_OPERATION' }; }
    return { allowed: true };
  }
  release(id: string): void {
    demand(!this.#publishing, 'CONTEXT_REENTRANCY');
    const check = this.preflight([], [id]); demand(check.allowed, check.reason ?? 'CONTEXT_BUSY');
    const context = this.#live(id); unwrap(context.dispose());
    // Direct Context.dispose emits the same removal notification; there is no second close path.
  }
}

/** Default application target service. Scope traversal lives here, never in a Panel contribution.
 * Pins lease a dedicated Context over the same Graph; normal Canvas navigation cannot retarget it.
 */
export class ScopedTargetService implements TargetResolver {
  #contexts: ContextDirectory;
  #pins = new Map<string, { key: string; context: ObservableEditorContext }>();
  constructor(contexts: ContextDirectory) { this.#contexts = contexts; }
  #position(context: ObservableEditorContext, reference: TargetRef): void {
    const stage = context.graph.snapshot().document.stages.find(stage => stage.id === reference.scope.stageId);
    demand(stage, 'STAGE_MISSING');
    if (context.stageId !== stage.id) unwrap(context.navigateStage(stage.kind));
    if (canonical(context.activeNetwork.path) !== canonical(reference.scope.networkPath)) {
      const editor = new NestedNetworkEditorQualification(context); unwrap(editor.root());
      for (const callId of reference.scope.networkPath) unwrap(editor.enter(callId));
    }
  }
  resolve(source: EditorContext | undefined, reference: TargetRef, request?: { panelId: string; pinned: boolean }): ResolvedTarget {
    try {
      const existing = request?.pinned ? this.#pins.get(request.panelId) : undefined;
      const resolvedSource = source && !source.disposed ? source : existing?.context;
      demand(resolvedSource && !resolvedSource.disposed && resolvedSource.graph.id === reference.scope.graphId && resolvedSource.graph.loadId === reference.scope.loadId, 'GRAPH_LIFETIME');
      let context: EditorContext = resolvedSource, ref = reference;
      if (request?.pinned) {
        const key = canonical(reference); let pin = this.#pins.get(request.panelId);
        if (pin?.key !== key) {
          this.release(request.panelId);
          const retained = new ObservableEditorContext(resolvedSource.graph);
          try { this.#position(retained, reference); } catch (error) { retained.dispose(); throw error; }
          pin = { key, context: retained }; this.#pins.set(request.panelId, pin); this.#contexts.add(retained);
        }
        this.#position(pin.context, reference); context = pin.context;
        ref = { scope: scopeOf(pin.context), object: reference.object };
      } else {
        if (request) this.release(request.panelId);
        demand(canonical(scopeOf(resolvedSource)) === canonical(reference.scope), 'SCOPE_MISMATCH');
      }
      if (ref.object) {
        const view = new NestedNetworkEditorQualification(context).inspectPath();
        if (ref.object.kind === 'node') unwrap(inspectScopedObject(context, ref.scope, { kind: 'node', id: ref.object.id }));
        else if (ref.object.kind === 'edge') demand((view.resource?.body.kind === 'network' ? view.resource.body.edges : context.activeStage.record.edges).some(edge => edge.id === ref.object!.id), 'EDGE_MISSING');
        else if (ref.object.kind === 'resource') demand(context.graph.snapshot().document.resources.some(resource => resource.id === ref.object!.id), 'RESOURCE_MISSING');
        else {
          const metadata = context.graph.snapshot().document.uiMetadata as { frames?: { id?: string; stageId?: string }[] } | undefined;
          demand(!ref.scope.networkPath.length && metadata?.frames?.some(frame => frame.id === ref.object!.id && frame.stageId === ref.scope.stageId), 'FRAME_MISSING');
        }
      }
      return immutable({ status: 'resolved', ref, selection: request?.pinned ? ref.object ? [ref.object] : [] : context.objectSelection.items });
    } catch (error) { return immutable({ status: 'missing', reason: String(error), requested: reference }); }
  }
  release(panelId: string): void {
    const pin = this.#pins.get(panelId); if (!pin) return; this.#pins.delete(panelId);
    pin.context.afterNotification(() => this.#contexts.afterPublication(() => {
      const result = pin.context.dispose();
      if (!result.ok && pin.context.graph.busy) {
        // Sealed Context disposal forbids any open Graph operation. Defer cleanup, never cancel another owner's edit.
        const off = pin.context.graph.subscribeOperationEnd(() => this.#contexts.afterPublication(() => { if (pin.context.dispose().ok) off(); }));
      } else if (!result.ok) throw Error('PIN_CONTEXT_RELEASE_FAILED: ' + result.error.code);
    }));
  }
}

export class MissingPanel implements Panel {
  readonly id: string; readonly typeId: string; readonly reason: string;
  #state: Json;
  constructor(record: SavedPanel, reason: string) { this.id = record.id; this.typeId = record.typeId; this.#state = clone(record.state); this.reason = reason; }
  restoreViewState(state: Json): { restored: true } { this.#state = clone(state); return { restored: true }; }
  exportViewState(): Json { return clone(this.#state); }
  receive(): void {}
  setVisible(): void {}
  canClose(): Check { return { allowed: true }; }
  dispose(): void {}
}
interface LivePanel { record: SavedPanel; panel: Panel; paneId: string; generation: number; signature: string; activation: number; target?: ResolvedTarget }

/** One public workspace registry/routing/lifecycle implementation for ordinary and provider panels. */
export class PanelWorkspace {
  readonly contexts: ContextDirectory;
  #resolver: TargetResolver;
  #restore: RestoreResolver;
  #commandAuthority?: ApplicationPanelCommandAuthority;
  #types = new Map<string, PanelType>();
  #panels = new Map<string, LivePanel>();
  #panes = new Map<string, PaneRecord>();
  #clock = 0;
  #generation = 0;
  #running = false;
  #pending = false;
  #disposed = false;
  #unsubscribe: Unsubscribe;
  #releaseGuard: Unsubscribe;
  #listeners = new Set<() => void>();
  #issues: WorkspaceIssue[] = [];
  #beforeDispose = new Set<(panel: Panel) => void>();
  /** Shell lifecycle seam; called only after close guards pass, before logical disposal/replacement. */
  beforePanelDispose(listener: (panel: Panel) => void): Unsubscribe { demand(!this.#disposed, "WORKSPACE_CLOSED"); this.#beforeDispose.add(listener); return () => this.#beforeDispose.delete(listener); }
  constructor(contexts: ContextDirectory, resolver: TargetResolver = new ScopedTargetService(contexts), restore?: RestoreResolver, commands?: ApplicationPanelCommandAuthority) {
    this.contexts = contexts; this.#resolver = resolver; this.#commandAuthority = commands;
    this.#restore = restore ?? {
      context: id => contexts.get(id)?.disposed === false ? id : null,
      target: ref => { const c = contexts.get(ref.scope.contextId); return c && !c.disposed && c.graph.id === ref.scope.graphId && c.graph.loadId === ref.scope.loadId ? clone(ref) : null; },
    };
    this.#unsubscribe = contexts.subscribe(() => { if (this.#running) this.#pending = true; else this.#run(() => {}); });
    this.#releaseGuard = contexts.releaseGuard(id => [...this.#panels.values()].some(p => p.record.route.mode === 'provide' && p.record.route.contextId === id)
      ? { allowed: false, reason: 'CONTEXT_IN_USE' } : { allowed: true });
  }
  get issues(): readonly WorkspaceIssue[] { return immutable(this.#issues); }
  panes(): readonly PaneRecord[] { return immutable([...this.#panes.values()]); }
  panels(): readonly { id: string; typeId: string; paneId: string; route: Route; linkGroup: number; hidden: boolean }[] {
    return immutable([...this.#panels.values()].map(p => ({ id: p.record.id, typeId: p.record.typeId, paneId: p.paneId, route: p.record.route, linkGroup: p.record.linkGroup, hidden: p.record.hidden })));
  }
  panel(id: string): Panel | undefined { return this.#panels.get(id)?.panel; }
  /** Shell composition only; feature receives the result through PanelMountContext, never this factory.
   * No caller-controlled origin/context/Graph is accepted. Captures exact Panel instance lifetime. */
  bindPanelCommands(id: string, mount: PanelCommandMountAuthority): PanelCommands | undefined {
    const original = this.#panels.get(id), authority = this.#commandAuthority;
    const requested = original && this.#types.get(original.record.typeId)?.commandIds;
    if (!original || original.panel instanceof MissingPanel || !authority || !requested?.length) return undefined;
    const instance = original.panel;
    const current = (lease: PanelCommandLease) => {
      mount.assertEvent();
      demand(!this.#disposed && !this.#running, 'PANEL_COMMAND_REENTRANCY');
      const item = this.#panels.get(id);
      demand(item && item.panel === instance && !(item.panel instanceof MissingPanel), 'PANEL_COMMAND_CLOSED');
      demand(lease.panelId === id && lease.generation === item.generation, 'PANEL_COMMAND_STALE');
      demand(item.target?.status === 'resolved' && this.targetContext(lease), 'PANEL_COMMAND_TARGET');
      return item.target.ref;
    };
    const checkIntent = (intent: PanelCommandIntent) => {
      demand(requested.includes(intent.commandId) && authority.allows(original.record.typeId, intent.commandId), 'PANEL_COMMAND_DENIED');
      return immutable(intent);
    };
    const origin = immutable({ panelId: id, typeId: original.record.typeId });
    return Object.freeze({
      execute: (lease: PanelCommandLease, intent: PanelCommandIntent) => {
        const target = current(lease), input = checkIntent(intent);
        authority.execute(origin, immutable(target), input);
      },
      beginGesture: (lease: PanelCommandLease, intent: PanelCommandIntent) => {
        const target = current(lease), input = checkIntent(intent), key = canonical(target);
        const gesture = authority.beginGesture(origin, immutable(target), input); let ended = false, executing = false, cancelPending = false;
        const check = (next: PanelCommandLease) => {
          demand(!ended, 'PANEL_GESTURE_CLOSED');
          demand(canonical(current(next)) === key, 'PANEL_GESTURE_RETARGETED');
          checkIntent(input);
        };
        // A model publication can invalidate its own view before update/commit returns.
        // Do not reenter Graph from that notification; drain cancellation at this command boundary.
        const cleanup = () => {
          if (ended) return;
          if (executing) { cancelPending = true; return; }
          executing = true;
          try { gesture.cancel(); ended = true; } finally { executing = false; }
        };
        const invoke = (action: () => void, terminal = false) => {
          executing = true;
          try { action(); if (terminal) ended = true; }
          finally { executing = false; if (cancelPending) { cancelPending = false; cleanup(); } }
        };
        mount.own(cleanup);
        return Object.freeze({
          update: (next: PanelCommandLease, args: Json) => { check(next); invoke(() => gesture.update(immutable(args))); },
          commit: (next: PanelCommandLease) => { check(next); invoke(() => gesture.commit(), true); },
          cancel: () => { mount.assertEvent(); demand(!ended, 'PANEL_GESTURE_CLOSED'); cleanup(); },
        });
      },
    });
  }
  subscribe(listener: () => void): Unsubscribe { demand(!this.#disposed, 'WORKSPACE_CLOSED'); this.#listeners.add(listener); return () => this.#listeners.delete(listener); }
  #issue(panelId: string | null, phase: string, error: unknown): void { this.#issues.push({ panelId, phase, message: String(error) }); }
  #run<T>(action: () => T): T {
    demand(!this.#disposed, 'WORKSPACE_CLOSED'); demand(!this.#running, 'WORKSPACE_REENTRANCY'); this.#running = true;
    try {
      const result = action();
      // Public Context state is already committed. Routing is computed before observer notification.
      do {
        do { this.#pending = false; this.#refresh(); } while (this.#pending);
        for (const listener of [...this.#listeners]) { try { listener(); } catch (error) { this.#issue(null, 'observer', error); } }
        // Shell unmount cleanup can cancel its own gesture while a workspace action
        // is publishing placement. Drain that model publication too, before return:
        // every Panel must get the post-cancel target lease, not an accepted stale one.
      } while (this.#pending);
      return result;
    } finally { this.#running = false; }
  }
  register(type: PanelType): void { this.#run(() => {
    demand(type.typeId.trim() && !this.#types.has(type.typeId), 'PANEL_TYPE_DUPLICATE');
    demand(Number.isSafeInteger(type.viewStateVersion) && type.viewStateVersion > 0, 'PANEL_STATE_VERSION');
    demand(type.commandIds === undefined || Array.isArray(type.commandIds) && type.commandIds.every(id => typeof id === 'string' && id.trim()) && new Set(type.commandIds).size === type.commandIds.length, 'PANEL_COMMAND_IDS');
    this.#types.set(type.typeId, Object.freeze({ ...type, commandIds: type.commandIds ? Object.freeze([...type.commandIds]) : undefined }));
  }); }
  createPane(id: string): void { this.#run(() => { demand(id.trim() && !this.#panes.has(id), 'PANE_ID'); this.#panes.set(id, { id, tabs: [], activeTab: null }); }); }
  #validate(record: SavedPanel): void {
    clone(record); demand(record.id.trim() && record.typeId.trim(), 'PANEL_ID');
    demand(Number.isSafeInteger(record.viewStateVersion) && record.viewStateVersion > 0, 'PANEL_STATE_VERSION');
    demand(Number.isSafeInteger(record.linkGroup) && record.linkGroup >= 0 && typeof record.hidden === 'boolean', 'PANEL_PLACEMENT');
    demand(['provide', 'follow', 'followCanvas', 'pin'].includes(record.route.mode), 'PANEL_ROUTE');
    if (record.route.mode === 'provide') demand(record.route.contextId.trim(), 'CONTEXT_ID');
    if (record.route.mode === 'followCanvas') demand(record.route.tabId.trim() && record.route.tabId !== record.id, 'FOLLOW_CYCLE');
    if (record.route.mode === 'pin') {
      const target = record.route.target, scope = target?.scope;
      demand(target && scope && [scope.graphId, scope.loadId, scope.contextId, scope.stageId].every(id => typeof id === 'string' && id.trim())
        && Array.isArray(scope.networkPath) && scope.networkPath.every(id => typeof id === 'string' && id.trim()), 'TARGET_REF');
      demand(target.object === null || target.object && ['node', 'edge', 'frame', 'resource'].includes(target.object.kind) && typeof target.object.id === 'string' && target.object.id.trim(), 'OBJECT_REF');
    }
  }
  #restoreRoute(route: Route): Route | null {
    if (route.mode === 'provide') { const id = this.#restore.context(route.contextId); return id ? { mode: 'provide', contextId: id } : null; }
    if (route.mode === 'pin') { const target = this.#restore.target(immutable(route.target)); return target ? { mode: 'pin', target } : null; }
    return clone(route);
  }
  #instantiate(record: SavedPanel): { panel: Panel; record: SavedPanel } {
    const type = this.#types.get(record.typeId), original = clone(record); let panel: Panel | undefined;
    try {
      if (!type || type.viewStateVersion !== record.viewStateVersion) throw Error(!type ? 'PANEL_TYPE_MISSING' : 'PANEL_STATE_VERSION');
      if (record.route.mode === 'provide' && !type.providesContext) throw Error('PANEL_NOT_PROVIDER');
      const route = this.#restoreRoute(record.route); if (!route) throw Error('PANEL_REFERENCE_UNRESOLVED');
      panel = type.create({ id: record.id, services: Object.freeze({ accept: (lease: TargetLease, callback: () => void) => lease.panelId === record.id && this.#panels.get(record.id)?.panel === panel && this.accept(lease, callback), context: (lease: TargetLease) => lease.panelId === record.id && this.#panels.get(record.id)?.panel === panel ? this.targetContext(lease) : null }) });
      demand(panel.id === record.id && panel.typeId === record.typeId, 'PANEL_FACTORY_IDENTITY');
      const result = panel.restoreViewState(clone(record.state), this.#restore); demand(result.restored, result.reason ?? 'PANEL_STATE_REJECTED');
      panel.setVisible(!record.hidden);
      return { panel, record: { ...record, route } };
    } catch (error) {
      if (panel) this.#dispose(panel); this.#issue(record.id, 'create/restore', error);
      return { panel: new MissingPanel(original, String(error)), record: original };
    }
  }
  #open(record: SavedPanel, paneId: string): Panel {
    this.#validate(record); const pane = this.#panes.get(paneId); demand(pane, 'PANE_MISSING'); demand(!this.#panels.has(record.id), 'PANEL_INSTANCE_DUPLICATE');
    const instance = this.#instantiate(clone(record));
    this.#panels.set(record.id, { ...instance, paneId, generation: ++this.#generation, signature: '', activation: 0 });
    pane.tabs.push(record.id); pane.activeTab ??= record.id; return instance.panel;
  }
  open(record: SavedPanel, paneId: string): Panel { this.#run(() => this.#open(record, paneId)); return this.#panels.get(record.id)!.panel; }
  #dispose(panel: Panel): void {
    for (const listener of [...this.#beforeDispose]) { try { listener(panel); } catch (error) { this.#issue(panel.id, 'view-dispose', error); } }
    try { panel.dispose(); } catch (error) { this.#issue(panel.id, 'dispose', error); }
  }
  #replaceFailed(item: LivePanel, phase: string, error: unknown): void {
    // Preserve the last successfully exported state when a view becomes unusable.
    try { item.record.state = clone(item.panel.exportViewState()); } catch (saveError) { this.#issue(item.record.id, 'export', saveError); }
    this.#issue(item.record.id, phase, error); item.generation = ++this.#generation; this.#dispose(item.panel);
    this.#resolver.release?.(item.record.id);
    item.panel = new MissingPanel(item.record, String(error)); item.signature = '';
  }
  #provider(id: string): LivePanel | undefined {
    const panel = this.#panels.get(id);
    return panel?.record.route.mode === 'provide' && !(panel.panel instanceof MissingPanel) && this.contexts.get(panel.record.route.contextId)?.disposed === false ? panel : undefined;
  }
  #reference(item: LivePanel): TargetRef | null {
    const route = item.record.route; if (route.mode === 'pin') return clone(route.target);
    let contextId: string | null = null;
    if (route.mode === 'provide') contextId = this.#provider(item.record.id) ? route.contextId : null;
    else if (route.mode === 'followCanvas') { const p = this.#provider(route.tabId); if (p?.record.route.mode === 'provide') contextId = p.record.route.contextId; }
    else if (item.record.linkGroup === 0) contextId = this.contexts.activeContextId;
    else {
      const candidates = [...this.#panels.values()].filter(p => this.#provider(p.record.id) && p.record.linkGroup === item.record.linkGroup && p.activation > 0).sort((a,b) => b.activation - a.activation);
      const provider = candidates[0]; if (provider?.record.route.mode === 'provide') contextId = provider.record.route.contextId;
    }
    const context = contextId ? this.contexts.get(contextId) : undefined;
    return context && !context.disposed ? { scope: scopeOf(context), object: clone(context.objectSelection.primary) } : null;
  }
  #refresh(): void {
    for (const item of this.#panels.values()) {
      if (item.panel instanceof MissingPanel) continue;
      let target: ResolvedTarget;
      try {
        const ref = this.#reference(item), context = ref ? this.contexts.get(ref.scope.contextId) : undefined;
        target = ref ? this.#resolver.resolve(context, immutable(ref), { panelId: item.record.id, pinned: item.record.route.mode === 'pin' }) : { status: 'missing', reason: 'TARGET_UNAVAILABLE' };
        const effective = target.status === 'resolved' ? this.contexts.get(target.ref.scope.contextId) : context;
        const signature = canonical({ target, revision: effective?.graph.revision ?? null, navigationRevision: effective?.navigationRevision ?? null });
        if (signature === item.signature) continue;
        item.signature = signature; item.generation = ++this.#generation; item.target = immutable(target);
        item.panel.receive(immutable({ target, lease: { panelId: item.record.id, generation: item.generation } }));
      } catch (error) { this.#replaceFailed(item, 'resolve/receive', error); }
    }
  }
  /** A token belongs to this live Panel instance and its most recent target/model publication. */
  accept(lease: TargetLease, callback: () => void): boolean {
    if (this.#disposed) return false;
    const item = this.#panels.get(lease.panelId);
    if (!item || item.panel instanceof MissingPanel || item.generation !== lease.generation) return false;
    callback(); return true;
  }
  targetContext(lease: TargetLease): ObservableEditorContext | null {
    const item = this.#panels.get(lease.panelId);
    if (this.#disposed || !item || item.panel instanceof MissingPanel || item.generation !== lease.generation || item.target?.status !== 'resolved') return null;
    return this.contexts.get(item.target.ref.scope.contextId) ?? null;
  }
  activate(tabId: string): void { this.#run(() => {
    const item = this.#panels.get(tabId); demand(item, 'PANEL_MISSING');
    const provider = this.#provider(tabId);
    if (provider?.record.route.mode === 'provide') { this.contexts.activate(provider.record.route.contextId); provider.activation = ++this.#clock; }
    this.#panes.get(item.paneId)!.activeTab = tabId;
  }); }
  setRoute(id: string, route: Route): void { this.#run(() => {
    const item = this.#panels.get(id); demand(item, 'PANEL_MISSING');
    const affected = item.record.route.mode === 'provide' ? [item.record.route.contextId] : [];
    const check = this.contexts.preflight([id], affected); demand(check.allowed, check.reason ?? 'PANEL_BUSY');
    const next = { ...item.record, route: clone(route) }; this.#validate(next);
    if (route.mode === 'provide') demand(this.#types.get(item.record.typeId)?.providesContext && this.contexts.get(route.contextId)?.disposed === false, 'PROVIDER_CONTEXT');
    const wasActive = item.record.route.mode === 'provide' && this.contexts.activeContextId === item.record.route.contextId;
    item.record = next;
    if (wasActive) { if (route.mode === 'provide') this.contexts.activate(route.contextId); else this.#chooseActive(); }
  }); }
  setLinkGroup(id: string, group: number): void { this.#run(() => {
    const item = this.#panels.get(id); demand(item, 'PANEL_MISSING'); demand(Number.isSafeInteger(group) && group >= 0, 'LINK_GROUP');
    const check = this.contexts.preflight([id], []); demand(check.allowed, check.reason ?? 'PANEL_BUSY'); item.record.linkGroup = group;
  }); }
  move(id: string, paneId: string, index?: number): void { this.#run(() => {
    const item = this.#panels.get(id), next = this.#panes.get(paneId); demand(item && next, 'PANEL_OR_PANE_MISSING');
    const old = this.#panes.get(item.paneId)!; const remaining = next.tabs.filter(tabId => tabId !== id), at = index ?? remaining.length;
    demand(Number.isSafeInteger(at) && at >= 0 && at <= remaining.length, 'TAB_INDEX');
    old.tabs = old.tabs.filter(tabId => tabId !== id); if (old.activeTab === id) old.activeTab = old.tabs.at(-1) ?? null;
    remaining.splice(at, 0, id); next.tabs = remaining; next.activeTab ??= id; item.paneId = paneId;
  }); }
  hide(id: string, hidden: boolean): void { this.#run(() => {
    const item = this.#panels.get(id); demand(item, 'PANEL_MISSING'); item.record.hidden = hidden;
    try { item.panel.setVisible(!hidden); } catch (error) { this.#replaceFailed(item, 'visibility', error); }
  }); }
  #chooseActive(): void {
    const candidates = [...this.#panels.values()].filter(p => this.#provider(p.record.id) && p.activation > 0).sort((a,b) => b.activation-a.activation);
    const first = candidates[0]; this.contexts.activate(first?.record.route.mode === 'provide' ? first.record.route.contextId : null);
  }
  #checkClose(item: LivePanel): Check {
    const contextIds = item.record.route.mode === 'provide' ? [item.record.route.contextId] : [];
    const origin = this.contexts.preflight([item.record.id], contextIds); if (!origin.allowed) return origin;
    try { return item.panel.canClose(); } catch(error) { this.#issue(item.record.id, 'canClose', error); return { allowed: false, reason: 'PANEL_CLOSE_FAILED' }; }
  }
  close(id: string): Check { return this.#run(() => {
    const item = this.#panels.get(id); if (!item) return { allowed: false, reason: 'PANEL_MISSING' };
    const check = this.#checkClose(item); if (!check.allowed) return check;
    const wasActive = item.record.route.mode === 'provide' && this.contexts.activeContextId === item.record.route.contextId;
    item.generation = ++this.#generation; this.#panels.delete(id);
    const pane = this.#panes.get(item.paneId)!; pane.tabs = pane.tabs.filter(tabId => tabId !== id); if (pane.activeTab === id) pane.activeTab = pane.tabs.at(-1) ?? null;
    this.#dispose(item.panel); this.#resolver.release?.(id); if (wasActive) this.#chooseActive(); return { allowed: true };
  }); }
  retry(id: string): boolean { this.#run(() => {
    const item = this.#panels.get(id); demand(item && item.panel instanceof MissingPanel, 'PANEL_NOT_MISSING');
    const next = this.#instantiate(item.record); this.#dispose(item.panel); item.panel = next.panel; item.record = next.record; item.generation = ++this.#generation; item.signature = '';
  }); return !(this.#panels.get(id)!.panel instanceof MissingPanel); }
  save(): SavedWorkspace {
    demand(!this.#disposed && !this.#running, 'WORKSPACE_BUSY');
    const panels = [...this.#panels.values()].map(item => {
      // Save either obtains the complete current view-state or rejects; it never silently uses stale state.
      const state = clone(item.panel.exportViewState()); item.record.state = state; return { ...clone(item.record), state };
    });
    return immutable({ version: 1, panes: [...this.#panes.values()], panels });
  }
  restore(saved: SavedWorkspace): void { this.#run(() => {
    demand(!this.#panels.size && !this.#panes.size, 'RESTORE_REQUIRES_EMPTY'); const state = clone(saved); demand(state.version === 1, 'LAYOUT_VERSION');
    const ids = new Set<string>(), tabs = new Set<string>();
    for (const pane of state.panes) { demand(pane.id.trim() && !ids.has(pane.id), 'PANE_ID'); ids.add(pane.id); demand(pane.activeTab === null || pane.tabs.includes(pane.activeTab), 'ACTIVE_TAB'); for (const id of pane.tabs) { demand(!tabs.has(id), 'TAB_DUPLICATE'); tabs.add(id); } }
    const panelIds = new Set<string>(); for (const p of state.panels) { this.#validate(p); demand(!panelIds.has(p.id) && tabs.has(p.id), 'PANEL_PLACEMENT'); panelIds.add(p.id); }
    demand(tabs.size === panelIds.size, 'TAB_MISSING');
    // All structural validation precedes mutation; individual contribution failure becomes an opaque placeholder.
    for (const pane of state.panes) this.#panes.set(pane.id, { id: pane.id, tabs: [], activeTab: null });
    const records = new Map(state.panels.map(p => [p.id,p]));
    for (const pane of state.panes) { for (const id of pane.tabs) this.#open(records.get(id)!, pane.id); this.#panes.get(pane.id)!.activeTab = pane.activeTab; }
    // Runtime activation order is deliberately not revived from disk. First explicit Canvas activation routes follow targets.
  }); }
  dispose(): Check {
    demand(!this.#running && !this.#disposed, 'WORKSPACE_BUSY');
    for (const item of this.#panels.values()) { const check = this.#checkClose(item); if (!check.allowed) return check; }
    this.#running = true;
    try {
      this.#unsubscribe(); this.#releaseGuard(); this.#disposed = true;
      for (const item of this.#panels.values()) { item.generation = ++this.#generation; this.#dispose(item.panel); this.#resolver.release?.(item.record.id); }
      this.#panels.clear(); this.#panes.clear(); this.#listeners.clear(); this.#beforeDispose.clear(); return { allowed: true };
    } finally { this.#running = false; }
  }
}
