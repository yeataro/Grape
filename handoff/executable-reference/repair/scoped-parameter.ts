/** IH-002 additive executable contract. NOT PRODUCTION IMPLEMENTATION. */
import { ApiError, canonical } from '../core.ts';
import type { EditorContext, Operation } from '../core.ts';
import type { Json, Result, ParameterSpec, ParameterPresentation, PortSpec, TypeRef } from '../contracts.ts';
import { NestedNetworkEditorQualification } from '../qualification-workspace.ts';
import type { EditableParameter } from '../qualification-workspace.ts';
import { TypeEnvironment } from '../qualification-compute.ts';
import type { ParameterProjection, ParameterView, ParameterWidget } from '../qualification-presentation.ts';

export interface ScopeRef {
  readonly graphId: string; readonly loadId: string; readonly contextId: string;
  readonly stageId: string; readonly networkPath: readonly string[];
}
export interface ScopedNodeRef { readonly kind: 'node'; readonly id: string; }
/** Structural seam avoids a dependency on PanelWorkspace. Subscribe is scoped to this Context's lifecycle. */
export interface RoutedContext { readonly context: EditorContext; subscribe(listener: () => void): () => void; }
const immutable = <T>(value: T): T => {
  const result = structuredClone(value);
  const freeze = (v: unknown): void => { if (v && typeof v === 'object') { Object.values(v).forEach(freeze); Object.freeze(v); } };
  freeze(result); return result;
};
const requireIt = (yes: unknown, code: string, message: string): void => { if (!yes) throw new ApiError(code, message); };
const attempt = <T>(fn: () => T): Result<T> => { try { return { ok: true, value: fn() }; } catch (e) {
  return { ok: false, error: { code: e instanceof ApiError ? e.code : 'SCOPED_TARGET', message: String(e) } };
} };
const unwrap = <T>(r: Result<T>): T => { if (!r.ok) throw new ApiError(r.error.code, r.error.message); return r.value; };

export function captureScope(context: EditorContext): ScopeRef {
  requireIt(!context.disposed, 'CONTEXT_CLOSED', 'Context disposed');
  return immutable({ graphId: context.graph.id, loadId: context.graph.loadId, contextId: context.id,
    stageId: context.stageId, networkPath: [...context.activeNetwork.path] });
}
function requireScope(context: EditorContext, scope: ScopeRef): void {
  requireIt(canonical(captureScope(context)) === canonical(scope), 'PARAMETER_SCOPE', 'Target belongs to another load, context, stage or occurrence');
}
/** Public read adapter; only this application service resolves model scopes. Renderers never walk resources. */
export function inspectScopedObject(context: EditorContext, scope: ScopeRef, object: ScopedNodeRef): Result<{
  scope: ScopeRef; object: ScopedNodeRef; typeRef: TypeRef; name: string;
}> {
  return attempt(() => {
    requireScope(context, scope);
    const node = new NestedNetworkEditorQualification(context).resolvedNodes().find(n => n.id === object.id);
    requireIt(node, 'MISSING_NODE', 'Node does not exist in the requested occurrence');
    return immutable({ scope, object, typeRef: node!.typeRef, name: node!.name });
  });
}
export interface ScopedParameterSnapshot {
  readonly scope: ScopeRef; readonly object: ScopedNodeRef; readonly parameterKey: string;
  readonly ownerResourceId: string | null; readonly spec: ParameterSpec; readonly port: PortSpec | null;
  readonly value: Json; readonly hasValue: boolean;
  readonly links: readonly { from: { nodeId: string; key: string }; to: { nodeId: string; key: string }; invalid: boolean }[];
  readonly connected: boolean; readonly writable: boolean; readonly editToken: string;
  readonly dataType: ParameterProjection['dataType'];
}
export type ScopedTargetEvent = { kind: 'updated'; value: ScopedParameterSnapshot } | { kind: 'invalidated'; code: string };

/** A view-local, occurrence-bound lease over canonical model state, never a value owner. */
export class ScopedParameterTarget implements EditableParameter {
  readonly scope: ScopeRef; readonly object: ScopedNodeRef; readonly key: string;
  readonly #context: EditorContext; readonly #resources: readonly (string | null)[]; readonly #typeRef: TypeRef; readonly #navigationRevision: number;
  #invalid: string | null = null; #listeners = new Set<(event: ScopedTargetEvent) => void>();
  #unsubscribe: () => void = () => {}; #unsubscribeContext: () => void = () => {}; #lastToken = ''; #semantic = ''; #editEpoch = 0; readonly observerErrors: string[] = [];
  private constructor(context: EditorContext, nodeId: string, key: string, scope: ScopeRef) {
    this.#context = context; this.scope = immutable(scope); this.object = immutable({ kind: 'node', id: nodeId }); this.key = key;
    this.#navigationRevision = context.navigationRevision;
    requireScope(context, scope);
    this.#typeRef = unwrap(inspectScopedObject(context, scope, this.object)).typeRef;
    this.#resources = this.#resourceChain();
    this.#lastToken = this.capture().editToken;
    this.#unsubscribe = context.graph.subscribe(() => { this.refresh(); });
  }
  static open(context: EditorContext, nodeId: string, key: string, scope?: ScopeRef): Result<ScopedParameterTarget> {
    return attempt(() => new ScopedParameterTarget(context, nodeId, key, scope ?? captureScope(context)));
  }
  /** Canonical UI entry: lifecycle notifications are mandatory, including navigation away-and-back and disposal. */
  static openRouted(input: RoutedContext, nodeId: string, key: string, scope?: ScopeRef): Result<ScopedParameterTarget> {
    return attempt(() => {
      const target = new ScopedParameterTarget(input.context, nodeId, key, scope ?? captureScope(input.context));
      try { target.#unsubscribeContext = input.subscribe(() => { target.refresh(); }); if (target.#invalid) target.#unsubscribeContext(); }
      catch (e) { target.dispose(); throw e; }
      return target;
    });
  }
  #resourceChain(): readonly (string | null)[] {
    const editor = new NestedNetworkEditorQualification(this.#context);
    return this.scope.networkPath.map((_, i) => editor.inspectPath(this.scope.networkPath.slice(0, i + 1)).resourceId);
  }
  #resolve() {
    requireIt(!this.#invalid, this.#invalid ?? 'TARGET_DISPOSED', 'Scoped target is invalid; obtain a new handle');
    requireScope(this.#context, this.scope);
    requireIt(this.#context.navigationRevision === this.#navigationRevision, 'PARAMETER_SCOPE', 'View navigation has changed since this target was acquired');
    requireIt(canonical(this.#resourceChain()) === canonical(this.#resources), 'PARAMETER_SCOPE', 'Occurrence now points to another definition');
    const object = unwrap(inspectScopedObject(this.#context, this.scope, this.object));
    requireIt(canonical(object.typeRef) === canonical(this.#typeRef), 'TYPE_CHANGED', 'NodeType identity changed');
    const editor = new NestedNetworkEditorQualification(this.#context), path = editor.inspectPath();
    const node = editor.resolvedNodes().find(n => n.id === this.object.id)!;
    const parameter: EditableParameter = path.resourceId ? editor.parameter(this.object.id, this.key) : this.#context.graph.nodeById(this.object.id)!.parameter(this.key);
    const edges = path.resource?.body.kind === 'network' ? path.resource.body.edges : this.#context.activeStage.record.edges;
    return { parameter, node, edges, resourceId: path.resourceId };
  }
  capture(): ScopedParameterSnapshot {
    try {
      const { parameter, node, edges, resourceId } = this.#resolve(), spec = parameter.spec;
      const port = spec.target.kind === 'input' ? node.ports.find(p => p.direction === 'input' && p.key === spec.target.key) ?? null : null;
      requireIt(spec.target.kind !== 'input' || port, 'MISSING_PORT', 'Parameter target port removed');
      const links = port ? edges.filter(e => e.to.nodeId === this.object.id && e.to.key === port.key)
        .map(e => ({ from: e.from, to: e.to, invalid: !!e.invalid })) : [];
      const raw = parameter.read(), hasValue = raw !== undefined, value = hasValue ? raw as Json : null;
      const connected = links.some(e => !e.invalid);
      const dataType = port ? new TypeEnvironment(this.#context.graph.snapshot().document.resources).resolve(port.type) : null;
      const writable = hasValue && !connected && (!port || port.supply === 'local') && dataType?.kind !== 'resource';
      const payload = { scope: this.scope, object: this.object, parameterKey: this.key, ownerResourceId: resourceId,
        spec, port, value, hasValue, links, connected, writable, dataType };
      canonical(payload);
      const semantic = canonical({ ...payload, typeRef: this.#typeRef, resourceChain: this.#resources });
      if (semantic !== this.#semantic) { this.#semantic = semantic; this.#editEpoch++; }
      return immutable({ ...payload, editToken: canonical({ semantic, editEpoch: this.#editEpoch }) });
    } catch (e) { this.#invalidate(e instanceof ApiError ? e.code : 'SCOPED_TARGET'); throw e; }
  }
  get spec(): ParameterSpec { return this.capture().spec; }
  read(): unknown { const v = this.capture(); return v.hasValue ? v.value : undefined; }
  write(value: Json, operation?: Operation): Result<void> { return this.commit(value, this.#safeToken(), operation); }
  #safeToken(): string { try { return this.capture().editToken; } catch { return ''; } }
  /** Tokens bind draft baseline to value, spec, resolved type, occurrence and link state, not unrelated Graph revisions. */
  commit(value: Json, expectedToken: string, operation?: Operation): Result<void> {
    return attempt(() => {
      const current = this.capture();
      requireIt(current.editToken === expectedToken, 'FIELD_STALE', 'Scoped value, type, interface or link state changed');
      requireIt(current.writable, 'FIELD_READONLY', 'Connected or non-local parameter is not editable');
      unwrap(this.#resolve().parameter.write(value, operation));
      // Library copy-on-write may succeed and invalidate this lease during Graph notification.
      // Successful model commit remains success; consumers reopen from their current routed scope.
    });
  }
  refresh(): Result<ScopedParameterSnapshot> {
    return attempt(() => { const value = this.capture(); if (value.editToken !== this.#lastToken) {
      this.#lastToken = value.editToken; this.#emit({ kind: 'updated', value });
    } return value; });
  }
  subscribe(listener: (event: ScopedTargetEvent) => void): () => void {
    requireIt(!this.#invalid, this.#invalid ?? 'TARGET_DISPOSED', 'Target is invalid');
    this.#listeners.add(listener); return () => { this.#listeners.delete(listener); };
  }
  #emit(event: ScopedTargetEvent): void { for (const listener of [...this.#listeners]) {
    // An earlier observer may close the lease. Never deliver an old update after its terminal event.
    if (event.kind === 'updated' && this.#invalid) break;
    try { listener(immutable(event)); } catch (e) { this.observerErrors.push(String(e)); }
  } }
  #invalidate(code: string): void {
    if (this.#invalid) return; this.#invalid = code; this.#unsubscribe(); this.#unsubscribeContext();
    this.#emit({ kind: 'invalidated', code }); this.#listeners.clear();
  }
  dispose(): void { this.#invalidate('TARGET_DISPOSED'); }
}

/** Generic widget registry projected from the public target, not root IDs or UI-side resource traversal.
 * Additive replacement of AC-002's root-only lookup; existing ParameterWidget/ParameterView contracts retained.
 */
export class ScopedParameterWidgets {
  #widgets = new Map<string, ParameterWidget>();
  constructor() {
    const body = (f: Readonly<ParameterProjection>): Json => ({ value: f.value, options: f.presentation.options ?? {} });
    for (const widget of [
      { id: 'core.number', accepts: (f: Readonly<ParameterProjection>) => f.dataType ? f.dataType.kind === 'scalar' && f.dataType.scalar !== 'bool' : typeof f.value === 'number', project: body },
      { id: 'core.boolean', accepts: (f: Readonly<ParameterProjection>) => f.dataType ? f.dataType.kind === 'scalar' && f.dataType.scalar === 'bool' : typeof f.value === 'boolean', project: body },
      { id: 'core.text', accepts: (f: Readonly<ParameterProjection>) => !f.dataType && typeof f.value === 'string', project: body },
      { id: 'core.menu', accepts: (f: Readonly<ParameterProjection>) => ['number', 'string', 'boolean'].includes(typeof f.value), project: body },
      { id: 'core.components', accepts: (f: Readonly<ParameterProjection>) => f.dataType?.kind === 'vector', project: body },
      { id: 'core.color', accepts: (f: Readonly<ParameterProjection>) => f.dataType?.kind === 'vector' && ['float', 'double'].includes(f.dataType.scalar) && [3, 4].includes(f.dataType.width), project: body },
      { id: 'core.matrix', accepts: (f: Readonly<ParameterProjection>) => f.dataType?.kind === 'matrix', project: (f: Readonly<ParameterProjection>): Json => ({ value: f.value, type: f.dataType as unknown as Json, major: 'column' }) },
      { id: 'core.readonly', accepts: () => true, project: body },
    ]) this.register(widget);
  }
  register(widget: ParameterWidget): void {
    requireIt(widget.id.trim() && !this.#widgets.has(widget.id), 'DUPLICATE_PARAMETER_WIDGET', 'Widget identity duplicate or empty');
    this.#widgets.set(widget.id, Object.freeze({ ...widget }));
  }
  projectTarget(target: ScopedParameterTarget, override?: ParameterPresentation): ParameterView {
    const view = target.capture(), spec = view.spec;
    const requested = override ?? (typeof spec.presentation === 'string' ? { widget: 'core.' + spec.presentation } : spec.presentation);
    canonical(requested);
    requireIt(requested && typeof requested.widget === 'string' && requested.widget.trim() && (requested.fallback === undefined || ['auto', 'none'].includes(requested.fallback)), 'PARAMETER_PRESENTATION', 'Invalid presentation');
    const field: ParameterProjection = immutable({ nodeId: view.object.id, key: view.parameterKey, target: spec.target,
      value: view.value, hasValue: view.hasValue, dataType: view.dataType, semantic: view.port?.semantic ?? null,
      connected: view.connected, writable: view.writable, presentation: requested, min: spec.min ?? null, max: spec.max ?? null, clamp: !!spec.clamp });
    const fallback = () => { if (!field.writable || requested.fallback === 'none') return 'core.readonly';
      return ['core.matrix', 'core.components', 'core.boolean', 'core.number', 'core.text'].find(id => this.#widgets.get(id)!.accepts(field)) ?? 'core.readonly'; };
    let selected = requested.widget, notice: string | null = null, body: Json;
    try { const widget = this.#widgets.get(selected);
      if (!widget || !widget.accepts(field)) { selected = fallback(); notice = 'Requested presentation unavailable or incompatible'; }
      body = this.#widgets.get(selected)!.project(field); canonical(body);
    } catch (e) { selected = fallback(); notice = 'Widget failed: ' + String(e); body = this.#widgets.get(selected)!.project(field); canonical(body); }
    return immutable({ requestedWidget: requested.widget, widget: selected, fallback: selected !== requested.widget,
      writable: field.writable && selected !== 'core.readonly', field, body, notice });
  }
}

/** UI draft owns text only. Scope/type/link changes conflict even if the old value and ParameterSpec compare equal. */
export class ScopedFieldDraft {
  readonly #target: ScopedParameterTarget; #token: string; #text: string; #closed = false; #composing = false;
  constructor(target: ScopedParameterTarget) { this.#target = target; const v = target.capture(); this.#token = v.editToken; this.#text = String(v.value); }
  get text(): string { return this.#text; }
  setText(text: string): Result<void> { return attempt(() => { requireIt(!this.#closed, 'FIELD_CLOSED', 'Draft closed'); this.#text = text; }); }
  composition(active: boolean): void { this.#composing = active; }
  commit(parse: (text: string) => Json): Result<void> {
    return attempt(() => {
      requireIt(!this.#closed, 'FIELD_CLOSED', 'Draft closed'); requireIt(!this.#composing, 'IME_COMPOSING', 'Composition unfinished');
      const next = parse(this.#text); unwrap(this.#target.commit(next, this.#token));
      this.#closed = true; // Single edit. A subsequent edit takes a fresh model snapshot.
    });
  }
  cancel(): void { this.#closed = true; }
}
