/** Qualification-only application services; no DOM, platform imports or legacy code. */
import {
  ApiError,
  CanvasView,
  Editor,
  Graph,
  canonical,
  copy,
  freeze,
  adaptation,
  reconcileNetworkModel,
} from "./core.ts";
import { TypeEnvironment, moduleContext } from "./qualification-compute.ts";
import type {
  EditorContext,
  Parameter,
  Registry,
  SelectionRef,
  Operation,
} from "./core.ts";
import type {
  GraphDocument,
  Json,
  Result,
  Snapshot,
  NodeModule,
  ModuleContext,
  TypeRef,
  PortSpec,
  NodeRecord,
  EmitContext,
  NodeEmission,
  TypedExpression,
  ParameterSpec,
  EdgeRecord,
  LossRecord,
  Endpoint,
} from "./contracts.ts";

const success = <T>(value: T): Result<T> => ({ ok: true, value });
const failure = (code: string, message: string): Result<never> => ({
  ok: false,
  error: { code, message },
});
function attempt<T>(run: () => T): Result<T> {
  try {
    return success(run());
  } catch (e) {
    return failure(
      e instanceof ApiError ? e.code : "WORKSPACE",
      e instanceof Error ? e.message : String(e),
    );
  }
}
function requireValue<T>(result: Result<T>): T {
  if (!result.ok) throw new ApiError(result.error.code, result.error.message);
  return result.value;
}
function demand(value: unknown, code: string, message: string): asserts value {
  if (!value) throw new ApiError(code, message);
}

export type PanelKind =
  | "canvas"
  | "parameters"
  | "sources"
  | "preview"
  | "help"
  | "code";
export interface TabPlacement {
  id: string;
  kind: PanelKind;
  linkGroup: number;
}
export interface PanePlacement {
  id: string;
  tabs: string[];
  activeTab: string;
  collapsed: boolean;
}
export type Region =
  | { paneId: string }
  | { axis: "row" | "column"; ratio: number; first: Region; second: Region };
export interface WorkspaceLayout {
  version: 1;
  headerVisible: boolean;
  tabs: TabPlacement[];
  panes: PanePlacement[];
  root: Region;
  floating: {
    tabId: string;
    slot: "upper" | "lower";
    collapsed: boolean;
    width: number;
    height: number;
  }[];
}
interface PanelInstance {
  id: string;
  kind: PanelKind;
  context?: EditorContext;
  view?: CanvasView;
  pinned?: { contextId: string; nodeId: string } | null;
}

/** UI graph: layout data knows placement; registered instances know content. */
export class WorkspaceQualification {
  readonly editor = new Editor();
  #instances = new Map<string, PanelInstance>();
  #layout: WorkspaceLayout | null = null;
  #activeCanvas: string | null = null;
  #activeGroups = new Map<number, string>();
  #requests = new Map<string, number>();

  registerCanvas(id: string, graph: Graph): Result<EditorContext> {
    return attempt(() => {
      demand(
        id && !this.#instances.has(id),
        "PANEL_ID",
        "Duplicate/empty panel identity",
      );
      const context = this.editor.open(graph);
      this.#instances.set(id, {
        id,
        kind: "canvas",
        context,
        view: new CanvasView(context),
      });
      return context;
    });
  }
  registerPanel(id: string, kind: Exclude<PanelKind, "canvas">): Result<void> {
    return attempt(() => {
      demand(
        id && !this.#instances.has(id),
        "PANEL_ID",
        "Duplicate/empty panel identity",
      );
      this.#instances.set(id, { id, kind, pinned: null });
    });
  }
  context(id: string): EditorContext | undefined {
    return this.#instances.get(id)?.context;
  }
  camera(id: string): CanvasView | undefined {
    return this.#instances.get(id)?.view;
  }
  get layout(): WorkspaceLayout | null {
    return this.#layout ? freeze(copy(this.#layout)) : null;
  }
  #tab(id: string): TabPlacement | undefined {
    return this.#layout?.tabs.find((t) => t.id === id);
  }
  applyLayout(candidate: WorkspaceLayout): Result<void> {
    return attempt(() => {
      canonical(candidate);
      const next = copy(candidate);
      demand(
        next.version === 1 && typeof next.headerVisible === "boolean",
        "LAYOUT",
        "Unsupported layout envelope",
      );
      const tabs = new Set<string>();
      for (const tab of next.tabs) {
        demand(!tabs.has(tab.id), "LAYOUT", "Duplicate tab");
        tabs.add(tab.id);
        demand(
          this.#instances.get(tab.id)?.kind === tab.kind,
          "LAYOUT",
          "Unbound or changed panel kind",
        );
        demand(
          Number.isInteger(tab.linkGroup) && tab.linkGroup >= 0,
          "LAYOUT",
          "Invalid link group",
        );
      }
      const panes = new Set<string>(),
        placed = new Set<string>();
      for (const pane of next.panes) {
        demand(pane.id && !panes.has(pane.id), "LAYOUT", "Duplicate pane");
        panes.add(pane.id);
        demand(
          typeof pane.collapsed === "boolean" &&
            pane.tabs.length > 0 &&
            pane.tabs.includes(pane.activeTab),
          "LAYOUT",
          "Invalid pane state",
        );
        for (const id of pane.tabs) {
          demand(
            tabs.has(id) && !placed.has(id),
            "LAYOUT",
            "Each tab needs exactly one dock position",
          );
          placed.add(id);
        }
      }
      demand(placed.size === tabs.size, "LAYOUT", "Unplaced tab");
      const regions = new Set<string>();
      const visit = (region: Region): void => {
        if ("paneId" in region) {
          demand(
            panes.has(region.paneId) && !regions.has(region.paneId),
            "LAYOUT",
            "Duplicate/missing region",
          );
          regions.add(region.paneId);
        } else {
          demand(
            ["row", "column"].includes(region.axis) &&
              Number.isFinite(region.ratio) &&
              region.ratio > 0 &&
              region.ratio < 1,
            "LAYOUT",
            "Invalid split",
          );
          visit(region.first);
          visit(region.second);
        }
      };
      visit(next.root);
      demand(regions.size === panes.size, "LAYOUT", "Unreachable pane");
      const floats = new Set<string>(),
        slots = new Set<string>();
      for (const f of next.floating) {
        demand(
          tabs.has(f.tabId) &&
            !floats.has(f.tabId) &&
            !slots.has(f.slot) &&
            ["upper", "lower"].includes(f.slot),
          "LAYOUT",
          "Floating collision",
        );
        demand(
          [f.width, f.height].every((v) => Number.isFinite(v) && v > 0) &&
            typeof f.collapsed === "boolean",
          "LAYOUT",
          "Invalid floating geometry",
        );
        floats.add(f.tabId);
        slots.add(f.slot);
      }
      this.#layout = next;
      // Old link-group routing cannot survive reassigning that canvas to another group.
      for (const [group, id] of this.#activeGroups)
        if (this.#tab(id)?.linkGroup !== group)
          this.#activeGroups.delete(group);
      if (this.#activeCanvas && !tabs.has(this.#activeCanvas))
        this.#activeCanvas = null;
    });
  }
  activateCanvas(id: string): Result<void> {
    return attempt(() => {
      const panel = this.#instances.get(id),
        tab = this.#tab(id);
      demand(
        panel?.context && !panel.context.disposed && tab,
        "CANVAS",
        "Canvas is not placed/live",
      );
      this.#activeCanvas = id;
      this.#activeGroups.set(tab.linkGroup, id);
    });
  }
  select(id: string, nodeIds: string[], primary?: string): Result<void> {
    return attempt(() => {
      const c = this.#instances.get(id)?.context;
      demand(c && this.#tab(id), "CANVAS", "Canvas missing/unplaced");
      requireValue(c.select(nodeIds, primary));
      requireValue(this.activateCanvas(id));
    });
  }
  selectObjects(
    id: string,
    objects: SelectionRef[],
    primary?: SelectionRef,
  ): Result<void> {
    return attempt(() => {
      const c = this.#instances.get(id)?.context;
      demand(c && this.#tab(id), "CANVAS", "Canvas missing/unplaced");
      requireValue(c.selectObjects(objects, primary));
      requireValue(this.activateCanvas(id));
    });
  }
  pinParameter(
    id: string,
    target: { contextId: string; nodeId: string } | null,
  ): Result<void> {
    return attempt(() => {
      const p = this.#instances.get(id);
      demand(p?.kind === "parameters", "PANEL", "Not a parameter panel");
      if (target) {
        const c = this.editor.contexts.find((c) => c.id === target.contextId);
        demand(
          c && !c.disposed && c.graph.nodeById(target.nodeId),
          "TARGET",
          "Pin target missing",
        );
      }
      p.pinned = target ? copy(target) : null;
    });
  }
  parameterTarget(id: string): {
    contextId: string;
    graphId: string;
    loadId: string;
    nodeId: string;
    networkPath: readonly string[];
  } | null {
    const target = this.parameterObjectTarget(id);
    return target?.object.kind === "node"
      ? {
          contextId: target.contextId,
          graphId: target.graphId,
          loadId: target.loadId,
          nodeId: target.object.id,
          networkPath: target.networkPath,
        }
      : null;
  }
  parameterObjectTarget(id: string): {
    contextId: string;
    graphId: string;
    loadId: string;
    object: SelectionRef;
    networkPath: readonly string[];
  } | null {
    const p = this.#instances.get(id),
      tab = this.#tab(id);
    if (p?.kind !== "parameters" || !tab) return null;
    const c = p.pinned
      ? this.editor.contexts.find((c) => c.id === p.pinned!.contextId)
      : this.#instances.get(
          (tab.linkGroup === 0
            ? this.#activeCanvas
            : this.#activeGroups.get(tab.linkGroup)) ?? "",
        )?.context;
    if (!c || c.disposed) return null;
    const object: SelectionRef | null = p.pinned
      ? c.graph.nodeById(p.pinned.nodeId)
        ? { kind: "node", id: p.pinned.nodeId }
        : null
      : c.objectSelection.primary;
    return object
      ? {
          contextId: c.id,
          graphId: c.graph.id,
          loadId: c.graph.loadId,
          object,
          networkPath: p.pinned ? [] : c.activeNetwork.path,
        }
      : null;
  }
  parameterEditor(id: string, key: string): Result<EditableParameter> {
    return attempt(() => {
      const target = this.parameterTarget(id);
      demand(target, "TARGET", "Parameter node target missing");
      const context = this.editor.contexts.find(
        (c) => c.id === target.contextId,
      )!;
      if (target.networkPath.length)
        return new NestedNetworkEditorQualification(context).parameter(
          target.nodeId,
          key,
        );
      const parameter = context.graph.nodeById(target.nodeId)!.parameter(key);
      demand(parameter, "MISSING_PARAMETER", "Parameter unavailable");
      const live = () =>
        demand(!context.disposed, "CONTEXT_CLOSED", "Parameter context closed");
      return {
        get spec() {
          live();
          return parameter.spec;
        },
        read() {
          live();
          return parameter.read();
        },
        write(value, operation) {
          return attempt(() => {
            live();
            requireValue(parameter.write(value, operation));
          });
        },
      };
    });
  }
  closeCanvas(id: string): Result<void> {
    return attempt(() => {
      const p = this.#instances.get(id);
      demand(p?.context, "CANVAS", "Canvas missing");
      requireValue(this.editor.close(p.context.id));
      this.#instances.delete(id);
      this.#requests.delete(id);
      if (this.#activeCanvas === id) this.#activeCanvas = null;
      for (const [group, active] of this.#activeGroups)
        if (active === id) this.#activeGroups.delete(group);
      if (this.#layout) {
        const next = copy(this.#layout);
        next.tabs = next.tabs.filter((t) => t.id !== id);
        for (const pane of next.panes) {
          pane.tabs = pane.tabs.filter((t) => t !== id);
          if (pane.activeTab === id) pane.activeTab = pane.tabs[0] ?? "";
        }
        next.panes = next.panes.filter((p) => p.tabs.length);
        next.floating = next.floating.filter((f) => f.tabId !== id);
        const live = new Set(next.panes.map((p) => p.id));
        const prune = (r: Region): Region | null => {
          if ("paneId" in r) return live.has(r.paneId) ? r : null;
          const a = prune(r.first),
            b = prune(r.second);
          return a && b ? { ...r, first: a, second: b } : (a ?? b);
        };
        const root = prune(next.root);
        this.#layout = root ? { ...next, root } : null;
      }
    });
  }
  /** The output is a transient view artifact, never Graph data or History. */
  async inspect<T>(
    canvasId: string,
    produce: (snapshot: Snapshot) => Promise<T>,
  ): Promise<Result<T>> {
    const c = this.context(canvasId);
    if (!c || c.disposed) return failure("CANVAS", "Canvas missing");
    const serial = (this.#requests.get(canvasId) ?? 0) + 1;
    this.#requests.set(canvasId, serial);
    const snapshot = c.graph.snapshot(),
      stageId = c.stageId,
      navigationRevision = c.navigationRevision;
    try {
      const value = await produce(snapshot);
      if (
        this.#requests.get(canvasId) !== serial ||
        this.context(canvasId) !== c ||
        c.disposed ||
        c.graph.loadId !== snapshot.loadId ||
        c.graph.revision !== snapshot.revision ||
        c.stageId !== stageId ||
        c.navigationRevision !== navigationRevision
      )
        return failure("STALE_VIEW", "View request no longer current");
      return success(value);
    } catch (e) {
      return failure("INSPECTION", e instanceof Error ? e.message : String(e));
    }
  }
}

/** Unfinished text belongs to one editor field, not to its Parameter value. */
export type EditableParameter = Pick<Parameter, "spec" | "read" | "write">;
export class FieldDraftQualification {
  readonly parameter: EditableParameter;
  #baseline: string;
  #schema: string;
  #text: string;
  #composing = false;
  #closed = false;
  constructor(parameter: EditableParameter) {
    this.parameter = parameter;
    this.#baseline = canonical(parameter.read());
    this.#schema = canonical(parameter.spec);
    this.#text = String(parameter.read());
  }
  get text(): string {
    return this.#text;
  }
  setText(text: string): Result<void> {
    if (this.#closed) return failure("FIELD_CLOSED", "Field disposed");
    this.#text = text;
    return success(undefined);
  }
  composition(active: boolean): void {
    this.#composing = active;
  }
  commit(parse: (text: string) => Json): Result<void> {
    if (this.#closed) return failure("FIELD_CLOSED", "Field disposed");
    if (this.#composing)
      return failure("IME_COMPOSING", "Composition is unfinished");
    return attempt(() => {
      demand(
        canonical(this.parameter.spec) === this.#schema &&
          canonical(this.parameter.read()) === this.#baseline,
        "FIELD_STALE",
        "Value or schema changed while editing",
      );
      const next = parse(this.#text);
      requireValue(this.parameter.write(next));
      this.#baseline = canonical(this.parameter.read());
      this.#text = String(this.parameter.read());
    });
  }
  cancel(): void {
    this.#closed = true;
  }
}

/** Read-only intake proof: retain original bytes and fail before touching Graph. */
export function inspectQualificationDocument(
  raw: string,
  registry: Registry,
): Result<{ raw: string; document: GraphDocument; modelErrors: number }> {
  return attempt(() => {
    strictJson(raw);
    const candidate = requireValue(Graph.load(raw, registry));
    return {
      raw,
      document: candidate.snapshot().document,
      modelErrors: candidate.diagnostics.filter((i) => i.severity === "error")
        .length,
    };
  });
}

/** JSON.parse alone silently accepts duplicate object keys. This parser rejects them. */
export function strictJson(raw: string, maxBytes = 1_048_576): Json {
  demand(
    new TextEncoder().encode(raw).byteLength <= maxBytes,
    "DOCUMENT_SIZE",
    "Document exceeds limit",
  );
  let at = 0,
    depth = 0;
  const ws = () => {
    while (/\s/.test(raw[at] ?? "") && at < raw.length) at++;
  };
  const str = (): string => {
    const start = at++;
    for (; at < raw.length; at++) {
      if (raw[at] === "\\") {
        at++;
        continue;
      }
      if (raw[at] === '"') {
        at++;
        return JSON.parse(raw.slice(start, at));
      }
    }
    throw new ApiError("JSON", "Unterminated string");
  };
  const val = (): void => {
    ws();
    demand(++depth <= 128, "DOCUMENT_DEPTH", "Document nesting exceeds limit");
    if (raw[at] === "{") {
      at++;
      ws();
      const keys = new Set<string>();
      if (raw[at] !== "}")
        while (true) {
          ws();
          demand(raw[at] === '"', "JSON", "Expected key");
          const key = str();
          demand(!keys.has(key), "DUPLICATE_KEY", "Duplicate object key");
          keys.add(key);
          ws();
          demand(raw[at++] === ":", "JSON", "Expected colon");
          val();
          ws();
          if (raw[at] === ",") {
            at++;
            continue;
          }
          break;
        }
      demand(raw[at++] === "}", "JSON", "Expected object end");
    } else if (raw[at] === "[") {
      at++;
      ws();
      if (raw[at] !== "]")
        while (true) {
          val();
          ws();
          if (raw[at] === ",") {
            at++;
            continue;
          }
          break;
        }
      demand(raw[at++] == "]", "JSON", "Expected array end");
    } else if (raw[at] === '"') str();
    else {
      const m = raw
        .slice(at)
        .match(
          /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/,
        );
      demand(m, "JSON", "Invalid JSON value");
      at += m[0].length;
    }
    depth--;
  };
  val();
  ws();
  demand(at === raw.length, "JSON", "Trailing document data");
  const value = JSON.parse(raw) as Json;
  canonical(value);
  return value;
}

type SourceRecord = {
  kind: "source";
  sourceKind: "uniform" | "constant";
  name: string;
  valueType: "float";
  default: number;
};
export type SubgraphRecord = {
  kind: "subgraph";
  name: string;
  scope: "library" | "local";
  origin: null | { id: string; version: string };
  dependencies: string[];
  body:
    | { kind: "scale"; factor: number }
    | {
        kind: "network";
        ports: PortSpec[];
        nodes: NodeRecord[];
        edges: {
          id?: string;
          adaptation?: EdgeRecord["adaptation"];
          invalid?: EdgeRecord["invalid"];
          from: { nodeId: string; key: string };
          to: { nodeId: string; key: string };
        }[];
        outputs: Record<string, { nodeId: string; key: string }>;
      };
};
const record = (v: unknown): v is Record<string, Json> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const finite = (v: unknown): v is number =>
  typeof v === "number" &&
  Number.isFinite(v) &&
  Number.isFinite(Math.fround(v));
function source(v: unknown): SourceRecord {
  demand(
    record(v) &&
      v.kind === "source" &&
      (v.sourceKind === "uniform" || v.sourceKind === "constant") &&
      v.valueType === "float" &&
      typeof v.name === "string" &&
      /^[A-Za-z_][A-Za-z0-9_]*$/.test(v.name) &&
      finite(v.default),
    "SOURCE_SCHEMA",
    "Expected named finite float source",
  );
  return v as unknown as SourceRecord;
}
function subgraph(v: unknown): SubgraphRecord {
  demand(
    record(v) &&
      v.kind === "subgraph" &&
      typeof v.name === "string" &&
      v.name.trim() &&
      v.name.length <= 80 &&
      !/[\u0000-\u001f]/.test(v.name) &&
      (v.scope === "library" || v.scope === "local") &&
      Array.isArray(v.dependencies) &&
      v.dependencies.every((x) => typeof x === "string") &&
      new Set(v.dependencies).size === v.dependencies.length &&
      record(v.body) &&
      ((v.body.kind === "scale" && finite(v.body.factor)) ||
        (v.body.kind === "network" &&
          Array.isArray(v.body.ports) &&
          Array.isArray(v.body.nodes) &&
          Array.isArray(v.body.edges) &&
          record(v.body.outputs))) &&
      (v.origin === null ||
        (record(v.origin) &&
          typeof v.origin.id === "string" &&
          typeof v.origin.version === "string")),
    "SUBGRAPH_SCHEMA",
    "Expected subgraph resource",
  );
  return v as unknown as SubgraphRecord;
}
const asJson = (value: SourceRecord | SubgraphRecord): Json =>
  copy(value) as unknown as Json;
const moduleRef = (typeId: string): TypeRef => ({
  moduleId: "qualification.workspace",
  typeId,
  version: "1",
  fingerprint: "workspace-resources-v1",
});
export const workspaceRefs = Object.freeze({
  source: moduleRef("source"),
  subgraph: moduleRef("subgraph"),
  networkInput: moduleRef("networkInput"),
});
const moduleErrors = (read: () => unknown): string[] => {
  try {
    read();
    return [];
  } catch (e) {
    return [e instanceof Error ? e.message : String(e)];
  }
};
function resourceInit(args: Json, key: string) {
  demand(
    record(args) && typeof args.resourceId === "string" && args.resourceId,
    "REFERENCE",
    "Resource id required",
  );
  return {
    state: {},
    references: {
      [key]: { kind: "resource" as const, targetId: args.resourceId },
    },
  };
}
/** Network compiler below reuses pinned NodeTypes, never dispatches by product node names. */
export const workspaceModule: NodeModule = {
  manifest: {
    id: "qualification.workspace",
    version: "1",
    fingerprint: "workspace-resources-v1",
    coreApiVersion: 1,
    dependencies: [],
    source: "qualification-workspace.ts",
    license: "experiment",
  },
  resourceValidators: {
    source: (data, context) =>
      moduleErrors(() => {
        const item = source(data);
        demand(
          context
            .resources("source")
            .filter(
              (entry) => record(entry.data) && entry.data.name === item.name,
            ).length === 1,
          "SOURCE_NAME",
          "Source name must be unique in Graph",
        );
      }),
    subgraph: (_data, context) =>
      moduleErrors(() =>
        permittedNetworkStages(context.referenceId("self")!, context),
      ),
  },
  types: [
    {
      ref: workspaceRefs.source,
      role: "operation",
      stages: ["vertex", "pixel"],
      stateCodec: {
        schemaVersion: 1,
        validate: (s) =>
          record(s) && Object.keys(s).length === 0
            ? []
            : ["Empty state required"],
      },
      initialize: (args) => resourceInit(args, "source"),
      ports: () => [{ key: "out", direction: "output", type: "float" }],
      parameters: () => [],
      validate: (_s, c) => moduleErrors(() => source(c?.reference("source"))),
      emit: (_s, c) => {
        const s = source(c.reference("source"));
        return {
          outputs: {
            out:
              s.sourceKind === "uniform"
                ? c.uniform(c.referenceId("source")!, "float")
                : {
                    type: "float",
                    code: new TypeEnvironment().literal("float", s.default),
                    constant: true,
                  },
          },
        };
      },
    },
    {
      ref: workspaceRefs.subgraph,
      role: "operation",
      stages: ["vertex", "pixel"],
      stateCodec: {
        schemaVersion: 1,
        validate: (s) =>
          record(s) && Object.keys(s).length === 0
            ? []
            : ["Empty state required"],
      },
      initialize: (args) => resourceInit(args, "subgraph"),
      ports: (_s, c) => {
        const s = subgraph(c?.reference("subgraph"));
        return s.body.kind === "network"
          ? copy(s.body.ports)
          : [
              {
                key: "in",
                direction: "input",
                type: "vec4",
                supply: "local",
                default: [1, 1, 1, 1],
              },
              { key: "out", direction: "output", type: "vec4" },
            ];
      },
      parameters: () => [],
      validate: (_s, c) =>
        moduleErrors(() => {
          demand(c, "CONTEXT", "Context required");
          validateNetwork(c.referenceId("subgraph")!, c);
        }),
      emit: (_s, c) => emitNetwork(c.referenceId("subgraph")!, c, []),
    },
    {
      ref: workspaceRefs.networkInput,
      role: "boundary",
      stages: ["vertex", "pixel"],
      stateCodec: {
        schemaVersion: 1,
        validate: (s) =>
          record(s) && Object.keys(s).length === 0
            ? []
            : ["Empty state required"],
      },
      initialize: (args) => resourceInit(args, "subgraph"),
      ports: (_s, c) => {
        const s = subgraph(c?.reference("subgraph"));
        demand(s.body.kind === "network", "NETWORK", "Network required");
        return s.body.ports
          .filter((p) => p.direction === "input")
          .map((p) => ({
            key: p.key,
            direction: "output" as const,
            type: p.type,
            ...(p.semantic ? { semantic: p.semantic } : {}),
          }));
      },
      parameters: () => [],
      validate: () => [],
      emit: () => {
        throw new ApiError(
          "BOUNDARY_CONTEXT",
          "Network input can only emit inside its definition",
        );
      },
    },
  ],
};

function nestedContext(parent: ModuleContext, node: NodeRecord): ModuleContext {
  return freeze({
    ...parent,
    nodeId: node.id,
    inputSource: () => undefined,
    referenceId: (key: string) => node.references[key]?.targetId,
    reference: (key: string) => {
      const ref = node.references[key];
      return ref?.kind === "resource"
        ? parent.resource(ref.targetId)
        : undefined;
    },
  });
}
function isInput(node: NodeRecord): boolean {
  return canonical(node.typeRef) === canonical(workspaceRefs.networkInput);
}
function isCall(node: NodeRecord): boolean {
  return canonical(node.typeRef) === canonical(workspaceRefs.subgraph);
}
function typeEnvironment(
  context: ModuleContext,
  ports: PortSpec[],
): TypeEnvironment {
  const resources: { id: string; data: Json }[] = [],
    done = new Set<string>();
  const visit = (type: string) => {
    for (const token of type.match(/@[^\[\]]+/g) ?? []) {
      const id = token.slice(1);
      if (done.has(id)) continue;
      done.add(id);
      const data = context.resource(id);
      demand(data !== undefined, "TYPE_MISSING", "Type resource missing");
      resources.push({ id, data });
      if (record(data) && record(data.type) && Array.isArray(data.type.fields))
        for (const field of data.type.fields)
          if (record(field) && typeof field.type === "string")
            visit(field.type);
    }
  };
  ports.forEach((p) => visit(p.type));
  return new TypeEnvironment(resources);
}
function networkShape(id: string, context: ModuleContext) {
  const resource = subgraph(context.resource(id));
  demand(resource.body.kind === "network", "NETWORK", "Network required");
  const body = resource.body,
    nodes = new Map<string, NodeRecord>(),
    ports = new Map<string, PortSpec[]>();
  for (const node of body.nodes) {
    demand(
      node.id && !nodes.has(node.id),
      "NODE_ID",
      "Duplicate network node ID",
    );
    demand(
      node.referencesComplete,
      "REFERENCES_OPAQUE",
      "Network opaque references cannot compile",
    );
    nodes.set(node.id, node);
  }
  const active = new Set<string>();
  const derive = (nodeId: string): PortSpec[] => {
    const found = ports.get(nodeId);
    if (found) return found;
    demand(!active.has(nodeId), "CYCLE", "Nested data cycle");
    const node = nodes.get(nodeId);
    demand(node, "NODE_MISSING", "Nested edge has missing node");
    active.add(nodeId);
    const type = context.resolveType(node.typeRef);
    demand(type, "MISSING_MODULE", "Network uses missing pinned NodeType");
    demand(
      type.stages.includes(context.stageKind) &&
        (!type.targets || type.targets.includes(context.graphKind)),
      "STAGE",
      "Nested node incompatible with target/stage",
    );
    demand(
      !type.stateCodec.validate(node.state).length,
      "STATE_CODEC",
      "Nested node state invalid",
    );
    const c: ModuleContext = {
      ...nestedContext(context, node),
      inputSource: (key) => {
        const edge = body.edges.find(
          (e) => e.to.nodeId === nodeId && e.to.key === key,
        );
        if (!edge) return undefined;
        const port = derive(edge.from.nodeId).find(
          (p) => p.direction === "output" && p.key === edge.from.key,
        );
        return port
          ? { nodeId: edge.from.nodeId, key: edge.from.key, port }
          : undefined;
      },
    };
    for (const edge of body.edges.filter((e) => e.to.nodeId === nodeId))
      derive(edge.from.nodeId);
    const result = type.ports(node.state, freeze(c));
    ports.set(nodeId, result);
    active.delete(nodeId);
    return result;
  };
  for (const node of nodes.values()) derive(node.id);
  return { resource, body, nodes, ports };
}
/** Validate the complete nested network, including unreachable nodes and recursive dependencies. */
function permittedNetworkStages(
  id: string,
  context: ModuleContext,
): ("vertex" | "pixel")[] {
  const passed: ("vertex" | "pixel")[] = [],
    errors: string[] = [];
  for (const stageKind of ["vertex", "pixel"] as const) {
    try {
      validateNetwork(id, { ...context, stageKind });
      passed.push(stageKind);
    } catch (error) {
      errors.push(
        `${stageKind}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  demand(
    passed.length,
    "SUBGRAPH_STAGES",
    `Definition cannot be used in any stage: ${errors.join("; ")}`,
  );
  return passed;
}
function validateNetwork(
  id: string,
  context: ModuleContext,
  stack: string[] = [],
): void {
  demand(!stack.includes(id), "SUBGRAPH_CYCLE", "Recursive subgraph network");
  const resource = subgraph(context.resource(id));
  if (resource.body.kind === "scale") return;
  const { body, nodes, ports } = networkShape(id, context),
    environment = typeEnvironment(context, [
      ...body.ports,
      ...[...ports.values()].flat(),
    ]),
    keys = new Set<string>();
  for (const p of body.ports) {
    const key = `${p.direction}:${p.key}`;
    demand(
      p.key && !keys.has(key),
      "PORT_DUPLICATE",
      "Duplicate interface key",
    );
    keys.add(key);
    environment.resolve(p.type);
    if (p.direction === "input")
      demand(
        p.supply === "required" ||
          (p.supply === "local" && environment.valid(p.type, p.default)),
        "PORT_DEFAULT",
        "Invalid interface supply/default",
      );
  }
  const inputs = [...nodes.values()].filter(isInput);
  demand(
    inputs.length === 1 && inputs[0].references.subgraph?.targetId === id,
    "NETWORK_BOUNDARY",
    "Exactly one correctly owned input boundary is required",
  );
  const actualDependencies = new Set<string>();
  for (const node of nodes.values()) {
    const c = {
      ...nestedContext(context, node),
      inputSource: (key: string) => {
        const e = body.edges.find(
            (e) => e.to.nodeId === node.id && e.to.key === key,
          ),
          p =
            e &&
            ports
              .get(e.from.nodeId)
              ?.find((p) => p.direction === "output" && p.key === e.from.key);
        return e && p
          ? { nodeId: e.from.nodeId, key: e.from.key, port: p }
          : undefined;
      },
    };
    if (isCall(node)) {
      const target = c.referenceId("subgraph");
      demand(target, "REFERENCE", "Nested subgraph reference required");
      actualDependencies.add(target);
      validateNetwork(target, c, [...stack, id]);
    } else if (!isInput(node)) {
      const type = context.resolveType(node.typeRef)!;
      demand(
        !type.validate(node.state, c).length,
        "NODE_VALIDATE",
        "Nested node validation failed",
      );
    }
    for (const ref of Object.values(node.references))
      demand(
        ref.kind === "resource" && context.resource(ref.targetId) !== undefined,
        "REFERENCE",
        "Nested references require existing graph resources",
      );
  }
  demand(
    canonical([...actualDependencies].sort()) ===
      canonical([...resource.dependencies].sort()),
    "DEPENDENCIES",
    "Declared dependency closure must match nested calls",
  );
  const incoming = new Set<string>(),
    adjacent = new Map<string, string[]>();
  for (const edge of body.edges) {
    const from = ports
        .get(edge.from.nodeId)
        ?.find((p) => p.key === edge.from.key && p.direction === "output"),
      to = ports
        .get(edge.to.nodeId)
        ?.find((p) => p.key === edge.to.key && p.direction === "input");
    demand(from && to, "ENDPOINT", "Nested edge endpoint missing");
    const key = JSON.stringify(edge.to);
    demand(
      !incoming.has(key),
      "MULTIPLE_INPUT",
      "Nested input has multiple incoming edges",
    );
    incoming.add(key);
    demand(adaptation(from, to), "TYPE", "Nested connection incompatible");
    adjacent.set(edge.to.nodeId, [
      ...(adjacent.get(edge.to.nodeId) ?? []),
      edge.from.nodeId,
    ]);
  }
  const active = new Set<string>(),
    done = new Set<string>();
  const visit = (id: string): void => {
    demand(!active.has(id), "CYCLE", "Nested network data cycle");
    if (done.has(id)) return;
    active.add(id);
    for (const predecessor of adjacent.get(id) ?? []) visit(predecessor);
    active.delete(id);
    done.add(id);
  };
  for (const node of nodes.values()) visit(node.id);
  for (const node of nodes.values())
    for (const p of ports.get(node.id) ?? []) {
      if (
        p.direction === "input" &&
        !incoming.has(JSON.stringify({ nodeId: node.id, key: p.key }))
      )
        demand(
          p.supply === "local" &&
            environment.valid(p.type, node.values[p.key] ?? p.default),
          "REQUIRED_INPUT",
          "Nested required input unconnected or invalid",
        );
    }
  const outputs = body.ports.filter((p) => p.direction === "output");
  demand(
    canonical(Object.keys(body.outputs).sort()) ===
      canonical(outputs.map((p) => p.key).sort()),
    "OUTPUT_INTERFACE",
    "Exactly one projection per output",
  );
  for (const p of outputs) {
    const endpoint = body.outputs[p.key],
      from = ports
        .get(endpoint.nodeId)
        ?.find((q) => q.direction === "output" && q.key === endpoint.key);
    demand(
      from && adaptation(from, p),
      "OUTPUT_INTERFACE",
      "Subgraph output projection incompatible",
    );
  }
}
function convertExpression(
  from: PortSpec,
  to: PortSpec,
  expression: TypedExpression,
): TypedExpression {
  const plan = adaptation(from, to);
  demand(plan, "TYPE", "Conversion unavailable");
  return {
    type: to.type,
    constant: expression.constant === true,
    code:
      plan.op === "identity"
        ? expression.code
        : plan.op === "broadcast" || plan.op === "cast"
          ? `${to.type}(${expression.code})`
          : plan.op === "alpha"
            ? `vec4(${expression.code}, 1.0)`
            : `(${expression.code}).${"xyzw".slice(0, to.type === "float" ? 1 : Number(to.type.slice(-1)))}`,
  };
}
function emitNetwork(
  id: string,
  context: EmitContext,
  path: string[],
): NodeEmission {
  validateNetwork(id, context);
  const resource = subgraph(context.resource(id));
  if (resource.body.kind === "scale") {
    const factor = new TypeEnvironment().literal("float", resource.body.factor);
    return {
      outputs: {
        out: {
          type: "vec4",
          code: `(${context.input("in").code} * ${factor})`,
        },
      },
    };
  }
  const { body, nodes, ports } = networkShape(id, context),
    environment = typeEnvironment(context, [
      ...body.ports,
      ...[...ports.values()].flat(),
    ]),
    emitted = new Map<string, Record<string, TypedExpression>>(),
    statements: string[] = [],
    effects: NonNullable<NodeEmission["effects"]> = [];
  const emit = (nodeId: string): Record<string, TypedExpression> => {
    const prior = emitted.get(nodeId);
    if (prior) return prior;
    const node = nodes.get(nodeId)!;
    if (isInput(node)) {
      const output = Object.fromEntries(
        body.ports
          .filter((p) => p.direction === "input")
          .map((p) => [p.key, context.input(p.key)]),
      );
      emitted.set(nodeId, output);
      return output;
    }
    const type = context.resolveType(node.typeRef)!,
      nestedPath = [...path, node.id],
      input = (key: string) => {
        const port = ports
          .get(nodeId)!
          .find((p) => p.direction === "input" && p.key === key);
        demand(port, "INPUT", "Unknown nested input");
        const edge = body.edges.find(
          (e) => e.to.nodeId === nodeId && e.to.key === key,
        );
        let value: TypedExpression;
        if (edge) {
          const from = ports
            .get(edge.from.nodeId)!
            .find((p) => p.direction === "output" && p.key === edge.from.key)!;
          value = convertExpression(
            from,
            port,
            emit(edge.from.nodeId)[edge.from.key],
          );
        } else
          value = {
            type: port.type,
            code: environment.literal(
              port.type,
              node.values[key] ?? port.default!,
            ),
            constant: true,
          };
        demand(
          !port.requireConstant || value.constant === true,
          "CONSTANT_REQUIRED",
          "Nested constant input requirement",
        );
        return freeze(value);
      };
    const c: EmitContext = freeze({
      ...nestedContext(context, node),
      input,
      inputSource: (key: string) => {
        const e = body.edges.find(
            (e) => e.to.nodeId === node.id && e.to.key === key,
          ),
          p =
            e &&
            ports
              .get(e.from.nodeId)
              ?.find((p) => p.direction === "output" && p.key === e.from.key);
        return e && p
          ? { nodeId: e.from.nodeId, key: e.from.key, port: p }
          : undefined;
      },
      local: (key: string) =>
        context.local(JSON.stringify([...nestedPath, key])),
      helper: (key: string, body: string) =>
        context.helper(JSON.stringify([node.typeRef, key]), body),
      uniform: context.uniform,
      varying: context.varying,
      requireCapability: context.requireCapability,
      trace: context.trace,
    });
    for (const capability of type.requiredCapabilities ?? [])
      c.requireCapability(capability);
    const result = isCall(node)
      ? emitNetwork(node.references.subgraph.targetId, c, nestedPath)
      : type.emit(node.state, c);
    demand(
      !result.color && !result.position,
      "NESTED_STAGE_OUTPUT",
      "Nested nodes cannot write stage boundary",
    );
    if (result.statements)
      statements.push(
        ...result.statements.map((statement) =>
          context.trace({ path: nestedPath, definitionId: id }, statement),
        ),
      );
    if (result.effects)
      effects.push(
        ...result.effects.map((effect) =>
          effect.kind === "discard"
            ? {
                ...effect,
                condition: {
                  ...effect.condition,
                  code: context.trace(
                    { path: nestedPath, definitionId: id },
                    effect.condition.code,
                  ),
                },
              }
            : {
                ...effect,
                value: {
                  ...effect.value,
                  code: context.trace(
                    { path: nestedPath, definitionId: id },
                    effect.value.code,
                  ),
                },
              },
        ),
      );
    const output: Record<string, TypedExpression> = {};
    for (const p of ports
      .get(nodeId)!
      .filter((p) => p.direction === "output")) {
      const value = result.outputs[p.key];
      demand(
        value && value.type === p.type,
        "EMIT_OUTPUT",
        "Nested output type mismatch",
      );
      if (value.constant === true)
        output[p.key] = {
          ...value,
          code: context.trace(
            { path: nestedPath, definitionId: id, portKey: p.key },
            value.code,
          ),
        };
      else {
        const symbol = c.local(p.key);
        statements.push(
          context.trace(
            { path: nestedPath, definitionId: id, portKey: p.key },
            `${environment.declaration(p.type, symbol)} = ${value.code};`,
          ),
        );
        output[p.key] = { type: p.type, code: symbol, constant: false };
      }
    }
    emitted.set(nodeId, output);
    return output;
  };
  const outputs: Record<string, TypedExpression> = {};
  for (const p of body.ports.filter((p) => p.direction === "output")) {
    const endpoint = body.outputs[p.key],
      from = ports
        .get(endpoint.nodeId)!
        .find((q) => q.direction === "output" && q.key === endpoint.key)!;
    outputs[p.key] = convertExpression(
      from,
      p,
      emit(endpoint.nodeId)[endpoint.key],
    );
  }
  for (const node of nodes.values())
    if (context.resolveType(node.typeRef)!.effectRoot) emit(node.id);
  return { outputs, statements, effects };
}

/** One model truth: resources and call references live in Graph, not these service objects. */
export class ResourceQualification {
  readonly graph: Graph;
  constructor(graph: Graph) {
    this.graph = graph;
  }
  read(id: string): Json | undefined {
    return this.graph.snapshot().document.resources.find((r) => r.id === id)
      ?.data;
  }
  createSource(id: string, data: SourceRecord): Result<void> {
    return attempt(() => {
      source(data);
      demand(!this.read(id), "RESOURCE_ID", "Resource already exists");
      this.#uniqueName(id, data.name);
      requireValue(
        this.graph.change("Create source", (d) =>
          d.putResource(id, asJson(data)),
        ),
      );
    });
  }
  #uniqueName(id: string, name: string) {
    demand(
      !this.graph
        .snapshot()
        .document.resources.some(
          (r) =>
            r.id !== id &&
            record(r.data) &&
            r.data.kind === "source" &&
            r.data.name === name,
        ),
      "SOURCE_NAME",
      "Source name must be unique in Graph",
    );
  }
  setDefault(id: string, value: number): Result<void> {
    return attempt(() => {
      const next = source({ ...source(this.read(id)), default: value });
      requireValue(
        this.graph.change("Set source default", (d) =>
          d.putResource(id, asJson(next)),
        ),
      );
    });
  }
  renameSource(id: string, name: string): Result<void> {
    return attempt(() => {
      const next = source({ ...source(this.read(id)), name });
      this.#uniqueName(id, name);
      requireValue(
        this.graph.change("Rename source", (d) =>
          d.putResource(id, asJson(next)),
        ),
      );
    });
  }
  removeSource(id: string): Result<void> {
    return attempt(() => {
      source(this.read(id));
      requireValue(
        this.graph.change("Remove source", (d) => d.removeResource(id)),
      );
    });
  }
  retargetSource(nodeId: string, id: string): Result<void> {
    return attempt(() => {
      source(this.read(id));
      demand(
        canonical(this.graph.nodeById(nodeId)?.typeRef) ===
          canonical(workspaceRefs.source),
        "SOURCE_NODE",
        "Only source-reference node can retarget",
      );
      requireValue(
        this.graph.change("Retarget source", (d) =>
          d.setReference(nodeId, "source", { kind: "resource", targetId: id }),
        ),
      );
    });
  }
  createSubgraph(id: string, data: SubgraphRecord): Result<void> {
    return attempt(() => {
      subgraph(data);
      demand(!this.read(id), "RESOURCE_ID", "Resource already exists");
      this.#acyclic(id, data);
      permittedNetworkStages(id, this.#context(id, data));
      requireValue(
        this.graph.change("Create subgraph", (d) =>
          d.putResource(id, asJson(data)),
        ),
      );
    });
  }
  #context(id: string, data: SubgraphRecord): ModuleContext {
    const snapshot = this.graph.snapshot();
    return {
      nodeId: "review",
      graphKind: snapshot.document.kind,
      stageKind: "pixel",
      inputSource: () => undefined,
      resources: (kind) =>
        freeze(
          copy(
            [
              ...snapshot.document.resources.filter((r) => r.id !== id),
              { id, data: asJson(data) },
            ].filter((r) => !kind || (record(r.data) && r.data.kind === kind)),
          ),
        ),
      resource: (key) =>
        key === id
          ? asJson(data)
          : snapshot.document.resources.find((r) => r.id === key)?.data,
      referenceId: () => undefined,
      reference: () => undefined,
      resolveType: (ref) => snapshot.definitions.resolve(ref),
    };
  }
  editNetwork(
    id: string,
    body: Extract<SubgraphRecord["body"], { kind: "network" }>,
    dependencies: string[],
  ): Result<void> {
    return attempt(() => {
      const next = subgraph({
        ...subgraph(this.read(id)),
        scope: "local",
        body,
        dependencies,
      });
      this.#acyclic(id, next);
      permittedNetworkStages(id, this.#context(id, next));
      const before = this.graph.snapshot().document,
        candidate = copy(before);
      candidate.resources.find((r) => r.id === id)!.data = asJson(next);
      const propagation = reconcileDefinitionCallers(
        this.graph,
        before,
        candidate,
        [id],
      );
      requireValue(
        this.graph.change("Edit subgraph network/interface", (d) => {
          d.putResource(id, asJson(next));
          for (const resource of propagation.resources)
            d.putResource(resource.id, resource.data);
          for (const loss of propagation.losses) {
            const { id: ignored, ...record } = loss;
            d.recordLoss(record);
          }
        }),
      );
    });
  }
  #acyclic(id: string, data: SubgraphRecord) {
    const active = new Set<string>(),
      done = new Set<string>();
    const visit = (key: string): void => {
      demand(!active.has(key), "SUBGRAPH_CYCLE", "Recursive dependency");
      if (done.has(key)) return;
      active.add(key);
      const item = key === id ? data : subgraph(this.read(key));
      for (const child of item.dependencies) visit(child);
      active.delete(key);
      done.add(key);
    };
    visit(id);
  }
  editSubgraph(
    id: string,
    factor: number,
    dependencies?: string[],
  ): Result<void> {
    return attempt(() => {
      const previous = subgraph(this.read(id));
      demand(
        previous.body.kind === "scale",
        "NETWORK",
        "Use editNetwork for network bodies",
      );
      const next = subgraph({
        ...previous,
        scope: "local",
        body: { kind: "scale", factor },
        dependencies: dependencies ?? previous.dependencies,
      });
      this.#acyclic(id, next);
      requireValue(
        this.graph.change("Edit shared local subgraph", (d) =>
          d.putResource(id, asJson(next)),
        ),
      );
    });
  }
  independent(nodeId: string, newId: string): Result<void> {
    return attempt(() => {
      const node = this.graph.nodeById(nodeId);
      demand(
        node && canonical(node.typeRef) === canonical(workspaceRefs.subgraph),
        "SUBGRAPH_NODE",
        "Subgraph call required",
      );
      const oldId = node.record.references.subgraph?.targetId;
      demand(oldId, "REFERENCE", "Call has no subgraph reference");
      const previous = subgraph(this.read(oldId));
      demand(!this.read(newId), "RESOURCE_ID", "Resource already exists");
      const next = subgraph({ ...copy(previous), scope: "local" });
      if (next.body.kind === "network")
        for (const n of next.body.nodes)
          if (isInput(n)) n.references.subgraph.targetId = newId;
      permittedNetworkStages(newId, this.#context(newId, next));
      requireValue(
        this.graph.change("Make direct definition independent", (d) => {
          d.putResource(newId, asJson(next));
          d.setReference(nodeId, "subgraph", {
            kind: "resource",
            targetId: newId,
          });
        }),
      );
    });
  }
  /** Public library semantic edits fork the shared graph snapshot and affected nonlocal callers once. */
  forkLibraryDefinition(
    id: string,
    replacement?: SubgraphRecord,
    authoring?: { losses: LossRecord[] },
  ): Result<string> {
    return attempt(() => {
      const document = this.graph.snapshot().document,
        current = subgraph(this.read(id));
      demand(current.scope === "library", "LOCAL", "Definition already local");
      if (authoring) {
        demand(
          current.body.kind === "network" &&
            replacement?.body.kind === "network",
          "NETWORK_SCOPE",
          "Authoring fork requires network bodies",
        );
        const previous = current.body.nodes.filter(isInput),
          next = replacement.body.nodes.filter(isInput);
        demand(
          previous.length === 1 &&
            next.length === 1 &&
            previous[0].id === next[0].id &&
            canonical(previous[0].state) === canonical(next[0].state) &&
            canonical(previous[0].references) === canonical(next[0].references),
          "PROTECTED_NODE",
          "Authoring cannot replace/remove/rebind the network input boundary",
        );
      }
      const changed = new Map<string, string>([
        [id, this.graph.identity.newId()],
      ]);
      let grew = true;
      while (grew) {
        grew = false;
        for (const r of document.resources) {
          if (!record(r.data) || r.data.kind !== "subgraph") continue;
          const s = subgraph(r.data);
          if (
            s.scope === "library" &&
            !changed.has(r.id) &&
            s.dependencies.some((dep) => changed.has(dep))
          ) {
            changed.set(r.id, this.graph.identity.newId());
            grew = true;
          }
        }
      }
      const rewritten: { id: string; data: Json }[] = document.resources.map(
        (r) => {
          if (!record(r.data) || r.data.kind !== "subgraph") return copy(r);
          const s = copy(
              r.id === id && replacement
                ? subgraph(replacement)
                : subgraph(r.data),
            ),
            nextId = changed.get(r.id) ?? r.id;
          s.dependencies = s.dependencies.map((dep) => changed.get(dep) ?? dep);
          if (changed.has(r.id)) s.scope = "local";
          if (s.body.kind === "network")
            for (const node of s.body.nodes)
              for (const ref of Object.values(node.references))
                if (ref.kind === "resource" && changed.has(ref.targetId))
                  ref.targetId = changed.get(ref.targetId)!;
          return { id: nextId, data: asJson(s) };
        },
      );
      const snapshot = this.graph.snapshot(),
        context: ModuleContext = {
          nodeId: "fork-review",
          graphKind: document.kind,
          stageKind: "pixel",
          inputSource: () => undefined,
          resources: (kind) =>
            freeze(
              copy(
                rewritten.filter(
                  (r) => !kind || (record(r.data) && r.data.kind === kind),
                ),
              ),
            ),
          resource: (key) => rewritten.find((r) => r.id === key)?.data,
          referenceId: () => undefined,
          reference: () => undefined,
          resolveType: (ref) => snapshot.definitions.resolve(ref),
        };
      // The edited definition is reviewed first. Ancestors must be reconciled before
      // validation; their formerly legal input values/edges are not new edits.
      if (!authoring) permittedNetworkStages(changed.get(id)!, context);
      const candidate = copy(document);
      candidate.resources = rewritten;
      const propagation = reconcileDefinitionCallers(
        this.graph,
        document,
        candidate,
        [changed.get(id)!],
        changed,
      );
      requireValue(
        this.graph.change("Fork library snapshot and edit", (d) => {
          for (const oldId of changed.keys()) d.removeResource(oldId);
          for (const r of rewritten) d.putResource(r.id, r.data);
          for (const loss of authoring?.losses ?? []) {
            const { id: ignored, ...record } = loss;
            d.recordLoss({ ...record, resourceId: changed.get(id)! });
          }
          for (const loss of propagation.losses) {
            const { id: ignored, ...record } = loss;
            d.recordLoss(record);
          }
          for (const stage of document.stages)
            for (const node of stage.nodes)
              for (const [key, ref] of Object.entries(node.references))
                if (ref.kind === "resource" && changed.has(ref.targetId))
                  d.setReference(node.id, key, {
                    kind: "resource",
                    targetId: changed.get(ref.targetId)!,
                  });
        }),
      );
      return changed.get(id)!;
    });
  }
}

/** Read-only review carries a base stamp. Accept publishes one replacement, never a new Graph object. */
export class ImportReviewQualification {
  readonly raw: string;
  readonly candidate: GraphDocument;
  readonly baseLoadId: string;
  readonly baseContent: string;
  #target: Graph;
  #closed = false;
  #errors: number;
  constructor(target: Graph, raw: string, registry: Registry) {
    const inspected = requireValue(inspectQualificationDocument(raw, registry));
    this.#target = target;
    this.raw = raw;
    this.candidate = freeze(copy(inspected.document));
    this.#errors = inspected.modelErrors;
    this.baseLoadId = target.loadId;
    this.baseContent = canonical(target.snapshot().document);
  }
  accept(): Result<void> {
    return attempt(() => {
      demand(!this.#closed, "REVIEW_CLOSED", "Review is no longer active");
      demand(
        this.#target.loadId === this.baseLoadId &&
          canonical(this.#target.snapshot().document) === this.baseContent,
        "IMPORT_STALE",
        "Destination changed since inspection",
      );
      demand(
        !this.#errors,
        "IMPORT_ERRORS",
        "Review contains unresolved model errors",
      );
      requireValue(
        this.#target.change("Accept graph import", (d) =>
          d.replaceDocument(this.candidate),
        ),
      );
      this.#closed = true;
    });
  }
  cancel(): void {
    this.#closed = true;
  }
}

export interface StateReferenceCodec {
  collect(state: Json): string[];
  remap(state: Json, resourceId: (id: string) => string): Json;
}
export const noStateReferences: StateReferenceCodec = Object.freeze({
  collect: () => [],
  remap: (state: Json) => copy(state),
});
export interface GraphPacket {
  format: "qualification-selection";
  version: 1;
  originGraphId: string;
  originLoadId: string;
  stageKind: "vertex" | "pixel";
  nodes: NodeRecord[];
  edges: {
    from: { nodeId: string; key: string };
    to: { nodeId: string; key: string };
  }[];
  resources: { id: string; data: Json }[];
}
const typeReferences = (type: string): string[] => [
  ...(type.match(/^@([^\[\]]+)/)?.slice(1) ?? []),
  ...Array.from(type.matchAll(/\[#([^\]]+)\]/g), (m) => m[1]),
];
const remapType = (type: string, map: (id: string) => string): string =>
  type
    .replace(/^@([^\[\]]+)/, (_m, id) => "@" + map(id))
    .replace(/\[#([^\]]+)\]/g, (_m, id) => "[#" + map(id) + "]");
/** Dependency traversal and typed remapping are module contracts, never a search/replace of JSON strings. */
export class GraphPacketQualification {
  readonly graph: Graph;
  constructor(graph: Graph) {
    this.graph = graph;
  }
  #codec(node: NodeRecord): StateReferenceCodec {
    demand(
      node.referencesComplete,
      "REFERENCES_OPAQUE",
      "Cannot copy unknown reference ownership",
    );
    const type = this.graph.snapshot().definitions.resolve(node.typeRef);
    demand(
      type,
      "MISSING_MODULE",
      "Unknown module cannot prove state reference traversal",
    );
    return type.stateReferences ?? noStateReferences;
  }
  #nodeDeps(node: NodeRecord): string[] {
    return [
      ...Object.values(node.references)
        .filter((r) => r.kind === "resource")
        .map((r) => r.targetId),
      ...this.#codec(node).collect(copy(node.state)),
      ...node.ports.flatMap((p) => typeReferences(p.type)),
    ];
  }
  #resourceDeps(data: Json): string[] {
    demand(record(data), "RESOURCE_SCHEMA", "Object resource required");
    if (data.kind === "source") {
      source(data);
      return [];
    }
    if (data.kind === "arrayExtent") return [];
    if (data.kind === "dataType") {
      demand(
        record(data.type) && Array.isArray(data.type.fields),
        "RESOURCE_SCHEMA",
        "Structure fields required",
      );
      return data.type.fields.flatMap((f) => {
        demand(
          record(f) && typeof f.type === "string",
          "RESOURCE_SCHEMA",
          "Typed structure fields required",
        );
        return typeReferences(f.type);
      });
    }
    if (data.kind === "subgraph") {
      const s = subgraph(data),
        body = s.body;
      return [
        ...s.dependencies,
        ...(body.kind === "network"
          ? [
              ...body.ports.flatMap((p) => typeReferences(p.type)),
              ...body.nodes
                .flatMap((n) => this.#nodeDeps(n))
                .filter(
                  (id) =>
                    id !==
                    body.nodes.find(isInput)?.references.subgraph?.targetId,
                ),
            ]
          : []),
      ];
    }
    throw new ApiError(
      "RESOURCE_KIND",
      "Resource kind lacks traversal contract",
    );
  }
  export(stageId: string, ids: string[]): Result<GraphPacket> {
    return attempt(() => {
      const snapshot = this.graph.snapshot(),
        stage = snapshot.document.stages.find((s) => s.id === stageId);
      demand(stage, "STAGE", "Stage missing");
      const selected = new Set(ids);
      demand(
        selected.size && selected.size === ids.length,
        "SELECTION",
        "Nonempty distinct selection required",
      );
      const nodes = ids.map((id) => {
          const n = stage.nodes.find((n) => n.id === id);
          demand(n, "NODE_MISSING", "Selected node missing");
          demand(
            snapshot.definitions.resolve(n.typeRef)?.role !== "boundary",
            "PROTECTED_NODE",
            "Stage boundary cannot be copied",
          );
          this.#codec(n);
          for (const r of Object.values(n.references))
            demand(
              r.kind !== "node" || selected.has(r.targetId),
              "REFERENCE_OUTSIDE_SELECTION",
              "Node references must be included",
            );
          return copy(n);
        }),
        done = new Set<string>(),
        active = new Set<string>(),
        resources: { id: string; data: Json }[] = [];
      const visit = (id: string): void => {
        if (done.has(id)) return;
        demand(
          !active.has(id),
          "RESOURCE_CYCLE",
          "Recursive resource dependencies",
        );
        const r = snapshot.document.resources.find((r) => r.id === id);
        demand(
          r,
          "MISSING_RESOURCE",
          "Resource missing from selection closure",
        );
        active.add(id);
        for (const dep of this.#resourceDeps(r.data)) visit(dep);
        active.delete(id);
        done.add(id);
        resources.push(copy(r));
      };
      for (const node of nodes)
        for (const id of this.#nodeDeps(node)) visit(id);
      return freeze({
        format: "qualification-selection",
        version: 1,
        originGraphId: this.graph.id,
        originLoadId: this.graph.loadId,
        stageKind: stage.kind,
        nodes,
        edges: stage.edges
          .filter(
            (e) => selected.has(e.from.nodeId) && selected.has(e.to.nodeId),
          )
          .map((e) => ({ from: copy(e.from), to: copy(e.to) })),
        resources,
      });
    });
  }
  paste(
    packet: GraphPacket,
    stageId: string,
    expectedLoadId = this.graph.loadId,
  ): Result<string[]> {
    return attempt(() => {
      demand(
        this.graph.loadId === expectedLoadId,
        "PASTE_STALE",
        "Destination load changed",
      );
      demand(
        packet.format === "qualification-selection" && packet.version === 1,
        "PACKET",
        "Unsupported packet",
      );
      const snapshot = this.graph.snapshot(),
        stage = snapshot.document.stages.find((s) => s.id === stageId);
      demand(
        stage && stage.kind === packet.stageKind,
        "STAGE",
        "Paste stage mismatch",
      );
      const same =
          packet.originGraphId === this.graph.id &&
          packet.originLoadId === this.graph.loadId,
        resourceMap = new Map<string, string>(),
        reused = new Set<string>();
      for (const r of packet.resources) {
        demand(
          !resourceMap.has(r.id),
          "RESOURCE_ID",
          "Duplicate packet resource",
        );
        if (
          same &&
          snapshot.document.resources.some((existing) => existing.id === r.id)
        ) {
          resourceMap.set(r.id, r.id);
          reused.add(r.id);
        } else resourceMap.set(r.id, this.graph.identity.newId());
      }
      const map = (id: string): string => {
        const next = resourceMap.get(id);
        demand(next, "REFERENCE_CLOSURE", "Packet omitted required resource");
        return next;
      };
      const nodeTransform = (original: NodeRecord): NodeRecord => {
        const node = copy(original);
        node.state = this.#codec(node).remap(copy(node.state), map);
        for (const ref of Object.values(node.references))
          if (ref.kind === "resource") ref.targetId = map(ref.targetId);
        for (const p of node.ports) p.type = remapType(p.type, map);
        return node;
      };
      const knownNames = new Set(
        snapshot.document.resources
          .filter((r) => record(r.data) && r.data.kind === "source")
          .map((r) => (r.data as Record<string, Json>).name),
      );
      const resources = packet.resources
        .filter((r) => !reused.has(r.id))
        .map((r) => {
          this.#resourceDeps(r.data).forEach(map);
          const data = copy(r.data) as Record<string, Json>;
          if (data.kind === "source") {
            const base = String(data.name);
            let name = base;
            for (let i = 1; knownNames.has(name); i++) name = base + i;
            knownNames.add(name);
            data.name = name;
          } else if (data.kind === "dataType") {
            for (const field of (data.type as Record<string, Json>)
              .fields as Record<string, Json>[])
              field.type = remapType(String(field.type), map);
          } else if (data.kind === "subgraph") {
            const s = subgraph(data);
            s.dependencies = s.dependencies.map(map);
            if (s.body.kind === "network") {
              s.body.ports.forEach((p) => (p.type = remapType(p.type, map)));
              s.body.nodes = s.body.nodes.map(nodeTransform);
            }
          }
          return { id: map(r.id), data: data as Json };
        });
      return requireValue(
        this.graph.change("Paste selection packet", (d) => {
          d.requireValid();
          for (const r of resources) d.putResource(r.id, r.data);
          const nodeMap = new Map<string, string>();
          for (const node of packet.nodes) {
            demand(!nodeMap.has(node.id), "NODE_ID", "Duplicate packet node");
            nodeMap.set(node.id, d.importNode(stageId, nodeTransform(node)));
          }
          for (const original of packet.nodes)
            for (const [key, ref] of Object.entries(original.references))
              if (ref.kind === "node") {
                const target = nodeMap.get(ref.targetId);
                demand(
                  target,
                  "REFERENCE_CLOSURE",
                  "Packet omitted node target",
                );
                d.setReference(nodeMap.get(original.id)!, key, {
                  kind: "node",
                  targetId: target,
                });
              }
          for (const edge of packet.edges) {
            const from = nodeMap.get(edge.from.nodeId),
              to = nodeMap.get(edge.to.nodeId);
            demand(
              from && to,
              "EDGE_ENDPOINT",
              "Packet edge outside node closure",
            );
            d.connectEndpoints(
              { nodeId: from, key: edge.from.key },
              { nodeId: to, key: edge.to.key },
            );
          }
          return [...nodeMap.values()];
        }),
      );
    });
  }
}

/** Entry-specific eligibility is separate from loading and ordinary graph preservation. */
export class SubgraphTransferPolicyQualification {
  readonly graph: Graph;
  constructor(graph: Graph) {
    this.graph = graph;
  }
  #directResources(node: NodeRecord): string[] {
    const definitions = this.graph.snapshot().definitions,
      type = definitions.resolve(node.typeRef);
    demand(
      type && node.referencesComplete,
      "REFERENCE_POLICY",
      "Known complete reference ownership required",
    );
    return [
      ...Object.values(node.references)
        .filter((r) => r.kind === "resource")
        .map((r) => r.targetId),
      ...(type.stateReferences?.collect(copy(node.state)) ?? []),
    ];
  }
  #assertGroupingNode(node: NodeRecord): void {
    const snapshot = this.graph.snapshot(),
      type = snapshot.definitions.resolve(node.typeRef);
    demand(
      type && type.role !== "boundary",
      "GROUP_ROLE",
      "A protected boundary cannot be encapsulated",
    );
    for (const id of this.#directResources(node)) {
      const data = snapshot.document.resources.find((r) => r.id === id)?.data;
      demand(
        !(record(data) && data.kind === "source"),
        "GROUP_SOURCE",
        "Direct graph sources must enter through a subgraph interface",
      );
    }
  }
  personalPacket(stageId: string, nodeIds: string[]): Result<GraphPacket> {
    return attempt(() => {
      const packet = requireValue(
        new GraphPacketQualification(this.graph).export(stageId, nodeIds),
      );
      demand(
        !packet.resources.some(
          (r) => record(r.data) && r.data.kind === "source",
        ),
        "NOT_SELF_CONTAINED",
        "Personal export cannot capture graph sources or current host values",
      );
      return packet;
    });
  }
  /** Deliberately bounded: caller supplies one exposed output and a selection with no crossing edges. */
  groupClosedSelection(
    stageId: string,
    nodeIds: string[],
    resourceId: string,
    output: Endpoint,
  ): Result<string> {
    return attempt(() => {
      const snapshot = this.graph.snapshot(),
        stage = snapshot.document.stages.find((s) => s.id === stageId);
      demand(stage, "STAGE", "Stage missing");
      const packet = requireValue(
        new GraphPacketQualification(this.graph).export(stageId, nodeIds),
      );
      packet.nodes.forEach((node) => this.#assertGroupingNode(node));
      const selected = new Set(nodeIds);
      demand(
        !stage.edges.some(
          (e) => selected.has(e.from.nodeId) !== selected.has(e.to.nodeId),
        ),
        "GROUP_CROSSING",
        "This bounded plan requires a closed selection",
      );
      const source = packet.nodes
        .find((n) => n.id === output.nodeId)
        ?.ports.find((p) => p.direction === "output" && p.key === output.key);
      demand(source, "GROUP_OUTPUT", "Selected output required");
      demand(
        !snapshot.document.resources.some((r) => r.id === resourceId),
        "RESOURCE_ID",
        "Resource already exists",
      );
      const boundary: NodeRecord = {
        id: this.graph.identity.newId(),
        name: "input",
        typeRef: workspaceRefs.networkInput,
        state: {},
        references: { subgraph: { kind: "resource", targetId: resourceId } },
        referencesComplete: true,
        ports: [],
        values: {},
        position: [0, 0],
      };
      const definition: SubgraphRecord = {
        kind: "subgraph",
        name: "Grouped selection",
        scope: "local",
        origin: null,
        dependencies: [
          ...new Set(
            packet.nodes
              .filter(isCall)
              .map((n) => n.references.subgraph.targetId),
          ),
        ],
        body: {
          kind: "network",
          ports: [{ key: "result", direction: "output", type: source.type }],
          nodes: [boundary, ...copy(packet.nodes)],
          edges: copy(packet.edges),
          outputs: { result: copy(output) },
        },
      };
      const candidate = copy(snapshot.document);
      candidate.resources.push({ id: resourceId, data: asJson(definition) });
      validateNetwork(
        resourceId,
        moduleContext(candidate, undefined, stage.kind, snapshot.definitions),
      );
      return requireValue(
        this.graph.change("Encapsulate closed selection", (d) => {
          d.requireValid();
          d.putResource(resourceId, asJson(definition));
          const call = d.createNode(
            stageId,
            workspaceRefs.subgraph,
            { resourceId },
            "subgraph",
          );
          for (const id of nodeIds) d.removeNode(id);
          return call;
        }),
      );
    });
  }
}

/** A navigation controller over the same Graph resources; it never constructs a second Graph. */
export class NestedNetworkEditorQualification {
  readonly context: EditorContext;
  constructor(context: EditorContext) {
    this.context = context;
  }
  get breadcrumbs(): readonly string[] {
    return this.context.activeNetwork.path;
  }
  resolvedNodes(): readonly NodeRecord[] {
    const view = this.inspectPath();
    if (!view.resourceId) return view.nodes;
    const snapshot = this.context.graph.snapshot(),
      ports = networkShape(
        view.resourceId,
        moduleContext(
          snapshot.document,
          undefined,
          this.context.activeStage.record.kind,
          snapshot.definitions,
        ),
      ).ports;
    return freeze(
      view.nodes.map((node) => ({
        ...copy(node),
        ports: copy(ports.get(node.id)!),
      })),
    );
  }
  inspectPath(path: readonly string[] = this.breadcrumbs): {
    resourceId: string | null;
    resource: SubgraphRecord | null;
    nodes: NodeRecord[];
  } {
    demand(!this.context.disposed, "CONTEXT_CLOSED", "Context disposed");
    const snapshot = this.context.graph.snapshot();
    let nodes = this.context.activeStage.record.nodes,
      resourceId: string | null = null,
      resource: SubgraphRecord | null = null;
    const visited = new Set<string>();
    for (const callId of path) {
      const call = nodes.find((n) => n.id === callId);
      demand(
        call && isCall(call),
        "NETWORK_SCOPE",
        "Subgraph occurrence no longer exists",
      );
      resourceId = call.references.subgraph?.targetId;
      demand(
        resourceId && !visited.has(resourceId),
        "SUBGRAPH_CYCLE",
        "Recursive occurrence path",
      );
      visited.add(resourceId);
      resource = subgraph(
        snapshot.document.resources.find((r) => r.id === resourceId)?.data,
      );
      demand(
        resource.body.kind === "network",
        "NETWORK_SCOPE",
        "Occurrence is not a network",
      );
      nodes = resource.body.nodes;
    }
    return { resourceId, resource, nodes };
  }
  #enterPath(path: string[]): Result<void> {
    if (!path.length) return this.root();
    return attempt(() => {
      this.inspectPath(path);
      requireValue(
        this.context.enterNetwork({
          id: canonical([
            this.context.graph.loadId,
            this.context.stageId,
            ...path,
          ]),
          path,
          valid: () => {
            try {
              this.inspectPath(path);
              return true;
            } catch {
              return false;
            }
          },
          contains: (ref) => {
            const view = this.inspectPath(path);
            if (ref.kind === "node")
              return view.nodes.some((n) => n.id === ref.id);
            if (ref.kind === "edge" && view.resource?.body.kind === "network")
              return view.resource.body.edges.some(
                (edge) => (edge as { id?: string }).id === ref.id,
              );
            return false;
          },
        }),
      );
    });
  }
  enter(callId: string): Result<void> {
    return this.#enterPath([...this.breadcrumbs, callId]);
  }
  root(): Result<void> {
    return this.context.enterNetwork(null);
  }
  up(): Result<void> {
    return this.#enterPath([...this.breadcrumbs].slice(0, -1));
  }
  node(id: string): NodeRecord | undefined {
    return this.inspectPath().nodes.find((n) => n.id === id);
  }
  parameter(nodeId: string, key: string): ScopedParameterQualification {
    return new ScopedParameterQualification(this, nodeId, key);
  }
}

/** Same shared reconciliation algorithm as root Stage, over one detached resource candidate. */
function reconcileNestedCandidate(
  graph: Graph,
  resourceId: string,
  before: SubgraphRecord,
  next: SubgraphRecord,
  stageKind: "vertex" | "pixel",
  documents?: {
    before: GraphDocument;
    candidate: GraphDocument;
    beforeResourceId: string;
  },
): LossRecord[] {
  demand(
    before.body.kind === "network" && next.body.kind === "network",
    "NETWORK_SCOPE",
    "Network required",
  );
  const snapshot = graph.snapshot(),
    oldContext = moduleContext(
      documents?.before ?? snapshot.document,
      undefined,
      stageKind,
      snapshot.definitions,
    ),
    oldPorts = networkShape(
      documents?.beforeResourceId ?? resourceId,
      oldContext,
    ).ports;
  const edges: EdgeRecord[] = next.body.edges.map((edge) => {
    const prior =
      before.body.kind === "network"
        ? before.body.edges.find(
            (e) =>
              canonical(e.from) === canonical(edge.from) &&
              canonical(e.to) === canonical(edge.to),
          )
        : undefined;
    const from = oldPorts
        .get(edge.from.nodeId)
        ?.find((p) => p.direction === "output" && p.key === edge.from.key),
      to = oldPorts
        .get(edge.to.nodeId)
        ?.find((p) => p.direction === "input" && p.key === edge.to.key);
    const plan =
      edge.adaptation ??
      prior?.adaptation ??
      (from && to ? adaptation(from, to) : undefined);
    demand(
      plan,
      "EDGE_RECOVERY",
      "No prior type evidence available for nested edge",
    );
    return {
      ...copy(edge),
      id: edge.id ?? prior?.id ?? graph.identity.newId(),
      adaptation: copy(plan),
    };
  });
  const candidate = documents?.candidate ?? copy(snapshot.document);
  candidate.resources.find((r) => r.id === resourceId)!.data =
    next as unknown as Json;
  const network = { nodes: next.body.nodes, edges };
  const losses = reconcileNetworkModel(
    network,
    snapshot.definitions,
    graph.identity,
    (node) => {
      const c = nestedContext(
        moduleContext(candidate, undefined, stageKind, snapshot.definitions),
        node,
      );
      return {
        ...c,
        inputSource: (key) => {
          const edge = network.edges.find(
              (e) => e.to.nodeId === node.id && e.to.key === key,
            ),
            port =
              edge &&
              network.nodes
                .find((n) => n.id === edge.from.nodeId)
                ?.ports.find(
                  (p) => p.direction === "output" && p.key === edge.from.key,
                );
          return edge && port
            ? { nodeId: edge.from.nodeId, key: edge.from.key, port }
            : undefined;
        },
      };
    },
    candidate.resources,
  );
  next.body.edges = network.edges;
  return losses.map((loss) => ({ ...loss, resourceId }));
}

/** Resource signatures invalidate every dependent Network, not only root Stage nodes.
 * Work entirely on one detached Graph candidate; root reconciliation and diagnostics run
 * at the single publication. Dependencies are walked child-first, including unused callers.
 */
function reconcileDefinitionCallers(
  graph: Graph,
  before: GraphDocument,
  candidate: GraphDocument,
  changedIds: string[],
  renamed = new Map<string, string>(),
): { resources: GraphDocument["resources"]; losses: LossRecord[] } {
  const definitions = graph.snapshot().definitions;
  const records = new Map(
    candidate.resources
      .filter((r) => record(r.data) && r.data.kind === "subgraph")
      .map((r) => [r.id, subgraph(r.data)]),
  );
  const dependencies = (s: SubgraphRecord): string[] => [
    ...new Set([
      ...s.dependencies,
      ...(s.body.kind === "network"
        ? s.body.nodes
            .filter(isCall)
            .map((n) => n.references.subgraph?.targetId)
            .filter((id): id is string => !!id)
        : []),
    ]),
  ];
  const affected = new Set(changedIds);
  let grew = true;
  while (grew) {
    grew = false;
    for (const [id, s] of records)
      if (!affected.has(id) && dependencies(s).some((d) => affected.has(d))) {
        affected.add(id);
        grew = true;
      }
  }
  const active = new Set<string>(),
    done = new Set<string>(),
    ordered: string[] = [];
  const visit = (id: string): void => {
    demand(
      !active.has(id),
      "SUBGRAPH_CYCLE",
      "Recursive dependency cannot be reconciled",
    );
    if (done.has(id)) return;
    const data = records.get(id);
    demand(data, "REFERENCE", "Dependent subgraph is missing");
    active.add(id);
    for (const dependency of dependencies(data)) visit(dependency);
    active.delete(id);
    done.add(id);
    if (affected.has(id)) ordered.push(id);
  };
  for (const id of affected) visit(id);
  const resources: GraphDocument["resources"] = [],
    losses: LossRecord[] = [];
  const originalIds = new Map([...renamed].map(([a, b]) => [b, a]));
  for (const id of ordered) {
    if (changedIds.includes(id)) continue;
    const originalId = originalIds.get(id) ?? id;
    const oldRecord = before.resources.find((r) => r.id === originalId);
    const newRecord = candidate.resources.find((r) => r.id === id)!;
    demand(oldRecord, "REFERENCE", "Previous dependent resource is missing");
    const previous = subgraph(oldRecord.data),
      next = subgraph(newRecord.data);
    if (previous.body.kind !== "network" || next.body.kind !== "network")
      continue;
    // Stage is an occurrence constraint; use any prior supported Network shape for
    // old edge type evidence, then let complete Graph diagnostics check every occurrence.
    let stageKind: "vertex" | "pixel" | undefined;
    for (const stage of ["pixel", "vertex"] as const) {
      try {
        networkShape(
          originalId,
          moduleContext(before, undefined, stage, definitions),
        );
        stageKind = stage;
        break;
      } catch {
        /* Another stage can own this reusable definition. */
      }
    }
    demand(
      stageKind,
      "CALLER_RECONCILE",
      "Dependent Network has no resolvable prior shape",
    );
    losses.push(
      ...reconcileNestedCandidate(graph, id, previous, next, stageKind, {
        before,
        candidate,
        beforeResourceId: originalId,
      }),
    );
    resources.push(newRecord);
  }
  return { resources, losses };
}

/** The same editable-Parameter surface can be implemented over a nested owner. */
export class ScopedParameterQualification implements EditableParameter {
  readonly editor: NestedNetworkEditorQualification;
  readonly nodeId: string;
  readonly key: string;
  #path: string[];
  #resourceId: string;
  #loadId: string;
  constructor(
    editor: NestedNetworkEditorQualification,
    nodeId: string,
    key: string,
  ) {
    this.editor = editor;
    this.nodeId = nodeId;
    this.key = key;
    this.#path = [...editor.breadcrumbs];
    const view = editor.inspectPath(this.#path);
    demand(
      view.resourceId,
      "NETWORK_SCOPE",
      "Use ordinary Node.parameter for root nodes",
    );
    this.#resourceId = view.resourceId;
    this.#loadId = editor.context.graph.loadId;
    this.#view();
  }
  #view() {
    const graph = this.editor.context.graph;
    demand(
      graph.loadId === this.#loadId &&
        canonical(this.editor.breadcrumbs) === canonical(this.#path),
      "PARAMETER_SCOPE",
      "Parameter belongs to another view scope",
    );
    const view = this.editor.inspectPath(this.#path);
    demand(
      view.resourceId === this.#resourceId && view.resource,
      "PARAMETER_SCOPE",
      "Occurrence points to another definition",
    );
    const node = view.nodes.find((n) => n.id === this.nodeId);
    demand(node, "MISSING_NODE", "Nested parameter owner missing");
    const type = graph.snapshot().definitions.resolve(node.typeRef);
    demand(type, "MISSING_MODULE", "Nested parameter module missing");
    return { graph, resource: view.resource, node, type };
  }
  get spec(): ParameterSpec {
    const { node, type } = this.#view(),
      spec = type.parameters(node.state).find((p) => p.key === this.key);
    demand(spec, "MISSING_PARAMETER", "Nested parameter unavailable");
    return freeze(copy(spec));
  }
  read(): unknown {
    const { graph, node } = this.#view(),
      spec = this.spec;
    if (spec.target.kind === "state")
      return record(node.state) ? node.state[spec.target.key] : undefined;
    const snapshot = graph.snapshot(),
      ports = networkShape(
        this.#resourceId,
        moduleContext(
          snapshot.document,
          undefined,
          this.editor.context.activeStage.record.kind,
          snapshot.definitions,
        ),
      ).ports.get(node.id)!;
    return (
      node.values[spec.target.key] ??
      ports.find((p) => p.direction === "input" && p.key === spec.target.key)
        ?.default
    );
  }
  write(value: Json, operation?: Operation): Result<void> {
    return attempt(() => {
      const { graph, resource, type } = this.#view(),
        spec = this.spec,
        next = copy(resource);
      demand(
        next.body.kind === "network",
        "NETWORK_SCOPE",
        "Network body required",
      );
      const node = next.body.nodes.find((n) => n.id === this.nodeId)!;
      let v = copy(value);
      if (spec.clamp && typeof v === "number")
        v = Math.max(spec.min ?? -Infinity, Math.min(spec.max ?? Infinity, v));
      if (spec.target.kind === "state") {
        demand(
          record(node.state),
          "PARAMETER_TARGET",
          "State properties required",
        );
        node.state = { ...node.state, [spec.target.key]: v };
        demand(
          !type.stateCodec.validate(node.state).length,
          "STATE_CODEC",
          "Nested state does not match its module codec",
        );
      } else {
        const snapshot = graph.snapshot(),
          ports = networkShape(
            this.#resourceId,
            moduleContext(
              snapshot.document,
              undefined,
              this.editor.context.activeStage.record.kind,
              snapshot.definitions,
            ),
          ).ports.get(node.id)!,
          port = ports.find(
            (p) => p.direction === "input" && p.key === spec.target.key,
          );
        demand(
          port &&
            port.supply === "local" &&
            typeEnvironment(moduleContext(snapshot.document), ports).valid(
              port.type,
              v,
            ),
          "INPUT_VALUE",
          "Nested input value invalid",
        );
        node.values[spec.target.key] = v as import("./contracts.ts").Value;
      }
      const losses = reconcileNestedCandidate(
        graph,
        this.#resourceId,
        resource,
        next,
        this.editor.context.activeStage.record.kind,
      );
      if (resource.scope === "library") {
        demand(
          !operation,
          "LIBRARY_OPERATION",
          "Fork first before opening a continuous nested gesture",
        );
        this.#resourceId = requireValue(
          new ResourceQualification(graph).forkLibraryDefinition(
            this.#resourceId,
            next,
            { losses },
          ),
        );
      } else {
        requireValue(
          this.editor.context.change(
            "Edit nested parameter",
            (d) => {
              d.putResource(this.#resourceId, asJson(next));
              for (const loss of losses) {
                const { id: ignored, ...record } = loss;
                d.recordLoss(record);
              }
            },
            operation,
          ),
        );
      }
    });
  }
}
