import type { ContextSnapshot } from "../sdk/editing.ts";
import { Graph } from "../model/graph.ts";
import type { Operation } from "../model/graph.ts";
import { Definitions } from "../definitions/registry.ts";
import type {
  ScopeRef,
  ParameterProjection,
  FieldTarget,
  StorageAdapter,
  DocumentOutput,
  Compilation,
  GraphSnapshot,
} from "../sdk/editing.ts";
import type {
  Json,
  GraphKindRef,
  NodeTypeRef,
  GLSLProfile,
} from "../sdk/public-surface.ts";
import type { CanonicalGraphDocument, DocumentRead } from "../sdk/document.ts";
import type { WidgetSnapshot, WidgetDraft } from "../sdk/view-mount.ts";
import type {
  ApplicationPanelCommandAuthority,
  PanelCommandOrigin,
  PanelCommandTarget,
  PanelCommandIntent,
} from "../sdk/panel-commands.ts";
import { Signal, detached, equal, demand, plain } from "../sdk/kernel.ts";
import type { IdentitySource } from "../sdk/kernel.ts";
import { compile } from "../generation/compiler.ts";
import { readDocument, writeDocument } from "../persistence/codec.ts";

export class EditorContext {
  #selection: string[] = [];
  #primary: string | null = null;
  #navigation = 0;
  #live = true;
  #stage: string;
  #signal = new Signal<void>();
  #unsubscribe: () => void;
  constructor(
    readonly id: string,
    private readonly graph: Graph,
    stageId: string,
  ) {
    this.#stage = stageId;
    this.#unsubscribe = graph.subscribeProjection(() => {
      const ids = this.network().nodes.map((n) => n.id);
      this.#selection = this.#selection.filter((id) => ids.includes(id));
      if (!this.#selection.includes(this.#primary!))
        this.#primary = this.#selection.at(-1) ?? null;
      this.#signal.emit();
    });
  }
  capture(): ContextSnapshot {
    demand(this.#live, "CONTEXT_DISPOSED");
    const graph = this.graph.capture();
    return detached({
      scope: {
        graphId: graph.document.graph.id,
        loadId: graph.loadId,
        contextId: this.id,
        stageId: this.#stage,
        networkPath: [],
      },
      selection: this.#selection,
      primary: this.#primary,
      navigation: this.#navigation,
      graph,
    });
  }
  network() {
    demand(this.#live, "CONTEXT_DISPOSED");
    const stage = this.graph
      .capture()
      .document.graph.stages.find((s) => s.id === this.#stage);
    demand(stage, "STAGE_MISSING");
    return stage.network;
  }
  select(
    ids: readonly string[],
    primary: string | null = ids.at(-1) ?? null,
  ): void {
    demand(!this.#signal.notifying, "CONTEXT_REENTRY");
    demand(
      ids.every((id) => this.network().nodes.some((n) => n.id === id)) &&
        (!primary || ids.includes(primary)),
      "SELECTION",
    );
    this.#selection = [...new Set(ids)];
    this.#primary = primary;
    this.#signal.emit();
  }
  navigate(stageId: string): void {
    demand(!this.#signal.notifying && !this.graph.busy, "CONTEXT_BUSY");
    demand(
      this.graph.capture().document.graph.stages.some((s) => s.id === stageId),
      "STAGE_MISSING",
    );
    this.#stage = stageId;
    this.#navigation++;
    this.#selection = [];
    this.#primary = null;
    this.#signal.emit();
  }
  subscribe(fn: () => void): () => void {
    return this.#signal.subscribe(fn);
  }
  dispose(): void {
    demand(!this.#signal.notifying && !this.graph.busy, "CONTEXT_BUSY");
    if (!this.#live) return;
    this.#live = false;
    this.#unsubscribe();
    this.#signal.emit();
    this.#signal.clear();
  }
}
export class EditorApplication implements ApplicationPanelCommandAuthority {
  #graph: Graph | null = null;
  #contexts = new Map<string, EditorContext>();
  #signal = new Signal<void>();
  #saved: string | null = null;
  #saving = false;
  #compile: Compilation | null = null;
  #readonly = false;
  #origins = new Map<string, { contextId: string; cancel: () => void }>();
  #grants = new Map<string, Set<string>>();
  #unsubscribers: (() => void)[] = [];
  constructor(
    private readonly definitions: Definitions,
    private readonly identity: IdentitySource,
    private readonly kind: GraphKindRef,
    private readonly profile: GLSLProfile,
    private readonly storage: StorageAdapter,
    private readonly output: DocumentOutput,
  ) {}
  subscribe(fn: () => void): () => void {
    return this.#signal.subscribe(fn);
  }
  get snapshot(): GraphSnapshot {
    demand(this.#graph, "NO_DOCUMENT");
    return this.#graph.capture();
  }
  get dirty(): boolean {
    return (
      !!this.#graph && writeDocument(this.snapshot.document) !== this.#saved
    );
  }
  get saving(): boolean {
    return this.#saving;
  }
  get busy(): boolean {
    return !!this.#graph?.busy;
  }
  get canUndo(): boolean {
    return !this.#readonly && !!this.#graph?.canUndo;
  }
  get canRedo(): boolean {
    return !this.#readonly && !!this.#graph?.canRedo;
  }
  get compilation(): Compilation | null {
    return this.#compile;
  }
  get readonly(): boolean {
    return this.#readonly;
  }
  setReadonly(value: boolean): void {
    demand(!this.busy, "HISTORY_BUSY");
    this.#readonly = value;
    this.#signal.emit();
  }
  catalog() {
    return this.definitions
      .nodeTypes()
      .filter((n) => n.role === "operation")
      .map((n) => ({ ref: n.ref, presentation: n.presentation }));
  }
  private install(graph: Graph, saved: string | null): void {
    demand(!this.busy, "HISTORY_BUSY");
    for (const c of this.#contexts.values()) c.dispose();
    this.#contexts.clear();
    this.#unsubscribers.forEach((fn) => fn());
    this.#graph?.dispose();
    this.#graph = graph;
    this.#saved = saved;
    this.#compile = null;
    this.#unsubscribers = [
      graph.subscribe(() => this.#signal.emit()),
      graph.onOperationEnd(() => this.#signal.emit()),
    ];
    this.#signal.emit();
  }
  newDocument(): void {
    this.install(
      Graph.create(
        this.kind,
        this.definitions.pin(this.definitions.pins()),
        this.identity,
      ),
      null,
    );
  }
  openText(raw: string, saved = false): DocumentRead {
    const parsed = readDocument(raw, (p) =>
      this.definitions.pin([p]).module(p),
    );
    if (parsed.status === "editable") {
      const graph = new Graph(
        parsed.document,
        this.definitions.pin(parsed.document.graph.modules),
        this.identity,
      );
      this.install(graph, saved ? writeDocument(parsed.document) : null);
    }
    return parsed;
  }
  context(id?: string): EditorContext {
    if (id) {
      const context = this.#contexts.get(id);
      demand(context, "CONTEXT_MISSING");
      return context;
    }
    demand(this.#graph, "NO_DOCUMENT");
    const stage =
      this.snapshot.document.graph.stages.find(
        (s) => s.implementation === "network",
      ) ?? this.snapshot.document.graph.stages[0];
    demand(stage, "STAGE_MISSING");
    const context = new EditorContext(
      this.identity.next(),
      this.#graph,
      stage.id,
    );
    this.#contexts.set(context.id, context);
    return context;
  }
  releaseContext(id: string): void {
    demand(!this.originBusy(undefined, id), "HISTORY_BUSY");
    const c = this.#contexts.get(id);
    c?.dispose();
    this.#contexts.delete(id);
  }
  generate(): Compilation {
    demand(!this.busy, "HISTORY_BUSY");
    const snapshot = this.snapshot;
    this.#compile = compile(
      snapshot,
      this.definitions.pin(snapshot.document.graph.modules),
      this.profile,
    );
    this.#signal.emit();
    return this.#compile;
  }
  async save(): Promise<void> {
    demand(!this.#saving, "SAVE_BUSY");
    const snapshot = this.snapshot,
      text = writeDocument(snapshot.document);
    this.#saving = true;
    this.#signal.emit();
    try {
      await this.storage.write(snapshot.document.graph.id, text);
      if (this.#graph?.loadId === snapshot.loadId) this.#saved = text;
    } finally {
      this.#saving = false;
      this.#signal.emit();
    }
  }
  savedDocuments() {
    return this.storage.list();
  }
  async reopen(key: string): Promise<DocumentRead> {
    const base = this.#graph?.loadId,
      revision = this.#graph?.revision;
    const raw = await this.storage.read(key);
    demand(
      base === this.#graph?.loadId && revision === this.#graph?.revision,
      "OPEN_SUPERSEDED",
    );
    return this.openText(raw, true);
  }
  async download(): Promise<void> {
    const doc = this.snapshot.document;
    await this.output.download(
      doc.graph.name + ".grape.json",
      writeDocument(doc),
    );
  }
  exportText(): string {
    return writeDocument(this.snapshot.document);
  }
  grant(typeId: string, commands: readonly string[]): void {
    demand(!this.#grants.has(typeId), "DUPLICATE_GRANT");
    this.#grants.set(typeId, new Set(commands));
  }
  allows(typeId: string, commandId: string): boolean {
    return !this.#readonly && !!this.#grants.get(typeId)?.has(commandId);
  }
  originBusy(panelId?: string, contextId?: string): boolean {
    return [...this.#origins.entries()].some(
      ([id, o]) => id === panelId || o.contextId === contextId,
    );
  }
  private resolve(target: PanelCommandTarget): {
    context: EditorContext;
    network: string;
  } {
    const context = this.context(target.scope.contextId),
      current = context.capture().scope;
    demand(equal(target.scope, current), "STALE_SCOPE");
    return { context, network: context.network().id };
  }
  execute(
    origin: PanelCommandOrigin,
    target: PanelCommandTarget,
    intent: PanelCommandIntent,
  ): void {
    demand(this.allows(origin.typeId, intent.commandId), "COMMAND_DENIED");
    const { context, network } = this.resolve(target);
    const graph = this.#graph!;
    plain(intent.args);
    const args = intent.args as Record<string, Json>;
    const id = () => {
      demand(typeof args.id === "string", "COMMAND_ARGS");
      return args.id;
    };
    if (intent.commandId === "grape.undo") {
      graph.undo();
      return;
    }
    if (intent.commandId === "grape.redo") {
      graph.redo();
      return;
    }
    if (intent.commandId === "grape.node.add") {
      demand(
        args.ref &&
          typeof args.ref === "object" &&
          Array.isArray(args.position),
        "COMMAND_ARGS",
      );
      let created = "";
      graph.change("Add node", (d) => {
        created = d.add(
          network,
          args.ref as unknown as NodeTypeRef,
          args.position as [number, number],
        );
      });
      context.select([created]);
      return;
    }
    if (intent.commandId === "grape.node.delete") {
      const selected = context.capture().selection;
      graph.change("Delete nodes", (d) =>
        selected.forEach((n) => d.remove(network, n)),
      );
      return;
    }
    if (intent.commandId === "grape.edge.connect") {
      demand(
        args.from &&
          args.to &&
          typeof args.from === "object" &&
          typeof args.to === "object",
        "COMMAND_ARGS",
      );
      graph.change("Connect", (d) =>
        d.connect(
          network,
          args.from as { nodeId: string; portKey: string },
          args.to as { nodeId: string; portKey: string },
          args.replace === true,
        ),
      );
      return;
    }
    if (intent.commandId === "grape.edge.disconnect") {
      graph.change("Disconnect", (d) => d.disconnect(network, id()));
      return;
    }
    if (intent.commandId === "grape.node.rename") {
      demand(typeof args.name === "string", "COMMAND_ARGS");
      graph.change("Rename", (d) =>
        d.rename(network, id(), args.name as string),
      );
      return;
    }
    throw Error("COMMAND_UNKNOWN");
  }
  beginGesture(
    origin: PanelCommandOrigin,
    target: PanelCommandTarget,
    intent: PanelCommandIntent,
  ) {
    demand(
      this.allows(origin.typeId, intent.commandId) &&
        intent.commandId === "grape.node.move",
      "COMMAND_DENIED",
    );
    const { context, network } = this.resolve(target);
    const args = intent.args as { ids?: Json };
    demand(
      Array.isArray(args.ids) &&
        args.ids.length > 0 &&
        args.ids.every(
          (id) =>
            typeof id === "string" &&
            context.network().nodes.some((n) => n.id === id),
        ),
      "COMMAND_ARGS",
    );
    const ids = args.ids as string[];
    const graph = this.#graph!,
      op = graph.begin("Move nodes");
    let live = true;
    const cancel = () => {
      if (!live) return;
      graph.cancel(op);
      live = false;
      this.#origins.delete(origin.panelId);
    };
    this.#origins.set(origin.panelId, { contextId: context.id, cancel });
    return {
      update: (payload: Json) => {
        demand(
          live && this.allows(origin.typeId, intent.commandId),
          "GESTURE_EXPIRED",
        );
        this.resolve(target);
        const positions = (payload as { positions?: Json }).positions;
        demand(
          positions &&
            typeof positions === "object" &&
            !Array.isArray(positions) &&
            Object.keys(positions).length === ids.length &&
            ids.every((id) => Array.isArray(positions[id])),
          "COMMAND_ARGS",
        );
        graph.change(
          "Move nodes",
          (draft) =>
            ids.forEach((id) =>
              draft.move(network, id, positions[id] as [number, number]),
            ),
          op,
        );
      },
      commit: () => {
        demand(live, "GESTURE_EXPIRED");
        graph.commit(op);
        live = false;
        this.#origins.delete(origin.panelId);
      },
      cancel,
    };
  }
  parameterKeys(context: EditorContext, nodeId: string): readonly string[] {
    const node = context.network().nodes.find((n) => n.id === nodeId);
    if (!node) return [];
    return (
      this.definitions
        .pin(this.snapshot.document.graph.modules)
        .node(node.type)
        ?.parameters(node.state)
        .map((p) => p.key) ?? []
    );
  }
  parameter(
    context: EditorContext,
    nodeId: string,
    key: string,
    scope: ScopeRef,
  ): FieldTarget {
    const original = context.capture();
    demand(equal(scope, original.scope), "STALE_SCOPE");
    const type = original.graph.document.graph.stages
      .find((s) => s.id === scope.stageId)
      ?.network.nodes.find((n) => n.id === nodeId)?.type;
    demand(type, "NODE_MISSING");
    let live = true,
      epoch = 0,
      last = "",
      unsub: () => void = () => {};
    const changes = new Signal<void>();
    const capture = (): WidgetSnapshot<ParameterProjection> => {
      demand(live, "TARGET_EXPIRED");
      try {
        const c = context.capture();
        demand(
          equal(c.scope, scope) && c.navigation === original.navigation,
          "STALE_SCOPE",
        );
        const node = context.network().nodes.find((n) => n.id === nodeId);
        demand(node && equal(node.type, type), "NODE_MISSING");
        const def = this.definitions
          .pin(c.graph.document.graph.modules)
          .node(node.type);
        demand(def, "NODE_MISSING");
        const spec = def.parameters(node.state).find((s) => s.key === key);
        demand(spec, "PARAMETER_MISSING");
        const value =
          spec.target === "input"
            ? node.inputValues[key]
            : (node.state as Record<string, Json>)[key];
        demand(value !== undefined, "PARAMETER_VALUE");
        const port =
          spec.target === "input"
            ? node.ports.find((p) => p.key === key && p.direction === "input")
            : undefined;
        const links = context
          .network()
          .edges.filter((e) => e.to.nodeId === nodeId && e.to.portKey === key)
          .map((e) => ({
            edgeId: e.id,
            sourceNodeId: e.from.nodeId,
            invalid: !!e.invalid,
          }));
        const projection: ParameterProjection = {
          nodeId,
          spec,
          label: def.presentation.parameters?.[key]?.label ?? {
            ...def.presentation.label,
            key,
            fallback: key,
          },
          value,
          ...(port ? { port } : {}),
          links,
        };
        const signature = JSON.stringify(projection);
        if (signature !== last) {
          last = signature;
          epoch++;
        }
        return detached({
          projection,
          editToken: scope.loadId + ":" + nodeId + ":" + key + ":" + epoch,
          writable:
            !this.#readonly && !this.busy && !links.some((x) => !x.invalid),
        });
      } catch (error) {
        live = false;
        unsub();
        throw error;
      }
    };
    capture();
    const invalidate = () => {
      if (!live) return;
      try {
        capture();
      } catch {
        live = false;
        unsub();
      }
      changes.emit();
      if (!live) changes.clear();
    };
    const unsubscribeContext = context.subscribe(invalidate);
    const unsubscribeApplication = this.subscribe(invalidate);
    unsub = () => {
      unsubscribeContext();
      unsubscribeApplication();
    };
    return {
      capture,
      subscribe: (fn) => changes.subscribe(fn),
      commit: (value, token) => {
        const current = capture();
        demand(current.editToken === token, "STALE_EDIT");
        demand(current.writable, "FIELD_READONLY");
        const graph = this.#graph!;
        graph.change("Edit " + key, (d) =>
          d.parameter(context.network().id, nodeId, key, value),
        );
      },
      dispose: () => {
        if (!live) return;
        live = false;
        unsub();
        changes.emit();
        changes.clear();
      },
    };
  }
}
export class FieldDraft implements WidgetDraft {
  #text = "";
  #token = "";
  #active = false;
  #composition = false;
  constructor(private readonly target: FieldTarget) {}
  get text(): string {
    return this.#text;
  }
  get active(): boolean {
    return this.#active;
  }
  setText(text: string): void {
    if (!this.#active) {
      this.#token = this.target.capture().editToken;
      this.#active = true;
    }
    this.#text = text;
  }
  composition(active: boolean): void {
    this.#composition = active;
  }
  commit(parse: (text: string) => Json): void {
    demand(!this.#composition, "IME_COMPOSITION");
    if (!this.#active) return;
    const value = parse(this.#text);
    this.target.commit(value, this.#token);
    this.#active = false;
    this.#token = "";
  }
  cancel(): void {
    this.#active = false;
    this.#composition = false;
    this.#token = "";
    this.#text = "";
  }
}
