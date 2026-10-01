import { TypeEnvironment, automaticAdaptation, moduleContext, typeTokenValid, typeResourceIssues } from "./qualification-compute.ts";
import { captureIdentity } from "./identity.ts";
import type { IdentitySource } from "./identity.ts";
import type {
  Json,
  Value,
  ValueType,
  TypeRef,
  ModuleRef,
  NodeModule,
  NodeType,
  GraphDocument,
  NodeRecord,
  StageRecord,
  PortSpec,
  Adaptation,
  Result,
  Issue,
  Snapshot,
  ChangeEvent,
  ParameterSpec,
  StorageAdapter,
  ModuleContext,
  Reference,
  Endpoint,
  OperationEndEvent,
  DefinitionResolver,
  EdgeRecord,
  LossRecord,
} from "./contracts.ts";

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}
function fail(code: string, message: string): never {
  throw new ApiError(code, message);
}
const ok = <T>(value: T): Result<T> => ({ ok: true, value });
const failure = (error: unknown): Result<never> => ({
  ok: false,
  error: {
    code: error instanceof ApiError ? error.code : "CALLBACK_FAILED",
    message: error instanceof Error ? error.message : String(error),
  },
});
export function copy<T>(value: T): T {
  return structuredClone(value);
}
export function freeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const item of Object.values(value)) freeze(item);
  }
  return value;
}
export function canonical(
  value: unknown,
  ancestors = new Set<object>(),
): string {
  if (value === null || typeof value === "string" || typeof value === "boolean")
    return JSON.stringify(value);
  if (typeof value === "number" && Number.isFinite(value))
    return JSON.stringify(value);
  if (value && typeof value === "object") {
    if (ancestors.has(value)) fail("INVALID_JSON", "Cyclic data is not JSON");
    ancestors.add(value);
    try {
      if (Array.isArray(value)) {
        if (Object.keys(value).length !== value.length)
          fail("INVALID_JSON", "Sparse or decorated arrays are not JSON");
        const encoded: string[] = [];
        for (let i = 0; i < value.length; i++) {
          if (!Object.hasOwn(value, i))
            fail("INVALID_JSON", "Sparse arrays are not JSON");
          encoded.push(canonical(value[i], ancestors));
        }
        return "[" + encoded.join(",") + "]";
      }
      if (Object.getPrototypeOf(value) === Object.prototype)
        return (
          "{" +
          Object.keys(value)
            .sort()
            .map(
              (k) =>
                JSON.stringify(k) +
                ":" +
                canonical((value as Record<string, unknown>)[k], ancestors),
            )
            .join(",") +
          "}"
        );
    } finally {
      ancestors.delete(value);
    }
  }
  return fail(
    "INVALID_JSON",
    "Only finite, plain JSON data can cross the model boundary",
  );
}
export const refKey = (ref: TypeRef): string => canonical(ref);
const moduleKey = (ref: ModuleRef): string => canonical([ref.moduleId, ref.version, ref.fingerprint]);
const moduleRefsFor = (refs: readonly TypeRef[]): ModuleRef[] => [...new Map(refs.map(({ moduleId, version, fingerprint }) => { const ref = { moduleId, version, fingerprint }; return [moduleKey(ref), ref]; })).values()];
const same = (a: unknown, b: unknown) => canonical(a) === canonical(b);
const view = <T>(value: T): T => freeze(copy(value));
const normalizedName = (name: string): string => {
  if (typeof name !== "string" || !name.trim() || /[\\/]/.test(name))
    fail(
      "INVALID_NAME",
      "Name must be nonempty and cannot contain a path separator",
    );
  return name.normalize("NFC");
};
const validRef = (r: TypeRef) =>
  r &&
  ["moduleId", "typeId", "version", "fingerprint"].every(
    (k) => typeof (r as any)[k] === "string" && (r as any)[k].length,
  );

export class Registry {
  #types = new Map<string, NodeType>();
  #modules = new Map<string, string>();
  #moduleRefs = new Map<string, ModuleRef>();
  #resourceValidators = new Map<string, Map<string, { moduleId: string; validate: (data: Json, context: ModuleContext) => string[] }>>();
  register(module: NodeModule): Result<void> {
    try {
      const m = module.manifest;
      canonical(m);
      if (m.coreApiVersion !== 1 || !m.id || !m.version || !m.fingerprint)
        fail("MODULE_MANIFEST", "Invalid module manifest");
      const versionKey = canonical([m.id, m.version]);
      if (this.#modules.has(versionKey))
        fail("MODULE_CONFLICT", "Module version already registered");
      for (const dep of m.dependencies)
        if (
          this.#modules.get(canonical([dep.id, dep.version])) !==
          dep.fingerprint
        )
          fail("MODULE_DEPENDENCY", "Exact dependency missing");
      const moduleKey = canonical([m.id, m.version, m.fingerprint]);
      for (const [kind, validate] of Object.entries(module.resourceValidators ?? {})) {
        if (!kind || ["dataType", "arrayExtent"].includes(kind) || [...(this.#resourceValidators.get(kind)?.values() ?? [])].some(entry => entry.moduleId !== m.id) || typeof validate !== "function") fail("RESOURCE_KIND_CONFLICT", "Resource kind must have one module owner and cannot shadow core type resources");
      }
      const pending = new Map<string, NodeType>();
      for (const type of module.types) {
        if (
          !validRef(type.ref) ||
          type.ref.moduleId !== m.id ||
          type.ref.version !== m.version ||
          type.ref.fingerprint !== m.fingerprint
        )
          fail("TYPE_REF", "Type identity does not match module");
        const key = refKey(type.ref);
        if (pending.has(key) || this.#types.has(key))
          fail("TYPE_DUPLICATE", "Duplicate exact type");
        if (
          !["operation", "boundary"].includes(type.role) ||
          !Array.isArray(type.stages) ||
          type.stages.some((s) => !["vertex", "pixel"].includes(s)) ||
          (type.requiredCapabilities !== undefined && (!Array.isArray(type.requiredCapabilities) || type.requiredCapabilities.some(id => typeof id !== "string" || !id.length)))
        )
          fail("TYPE_CONTRACT", "Invalid role or stage declaration");
        if (
          type.stateCodec.schemaVersion !== 1 ||
          typeof type.stateCodec.validate !== "function" ||
          ["initialize", "ports", "parameters", "validate", "emit"].some(
            (k) => typeof (type as any)[k] !== "function",
          )
        )
          fail("TYPE_CONTRACT", "Incomplete NodeType implementation");
        pending.set(
          key,
          freeze({
            ...type,
            ref: copy(type.ref),
            stages: [...type.stages],
            stateCodec: { ...type.stateCodec },
          }),
        );
      }
      for (const [key, type] of pending) this.#types.set(key, type);
      this.#modules.set(versionKey, m.fingerprint);
      this.#moduleRefs.set(moduleKey, { moduleId: m.id, version: m.version, fingerprint: m.fingerprint });
      for (const [kind, validate] of Object.entries(module.resourceValidators ?? {})) {
        const versions = this.#resourceValidators.get(kind) ?? new Map();
        versions.set(moduleKey, { moduleId: m.id, validate }); this.#resourceValidators.set(kind, versions);
      }
      return ok(undefined);
    } catch (error) {
      return failure(error);
    }
  }
  pin(refs?: readonly TypeRef[], modules?: readonly ModuleRef[]): DefinitionSet {
    return new DefinitionSet(
      refs ?? [...this.#types.values()].map((t) => t.ref),
      this.#types,
      this.#resourceValidators,
      modules ?? (refs ? moduleRefsFor(refs) : [...this.#moduleRefs.values()]),
      new Set(this.#moduleRefs.keys()),
    );
  }
}
export class DefinitionSet {
  #refs: TypeRef[];
  #modules: ModuleRef[];
  #missingModules: ModuleRef[];
  #types = new Map<string, NodeType>();
  #validators = new Map<string, (data: Json, context: ModuleContext) => string[]>();
  constructor(refs: readonly TypeRef[], loaded: ReadonlyMap<string, NodeType>, validators: ReadonlyMap<string, ReadonlyMap<string, { moduleId: string; validate: (data: Json, context: ModuleContext) => string[] }>> = new Map(), modules: readonly ModuleRef[] = moduleRefsFor(refs), loadedModules: ReadonlySet<string> = new Set([...loaded.values()].map(type => moduleKey(type.ref)))) {
    for (const ref of modules) if (![ref.moduleId, ref.version, ref.fingerprint].every(v => typeof v === "string" && v)) fail("MODULE_REF", "Malformed pinned module");
    if (new Set(modules.map(moduleKey)).size !== modules.length) fail("MODULE_DUPLICATE", "Repeated pinned module");
    this.#modules = copy([...modules]);
    this.#missingModules = copy(modules.filter(ref => !loadedModules.has(moduleKey(ref))));
    for (const ref of refs)
      if (!validRef(ref)) fail("TYPE_REF", "Malformed pinned reference");
    if (new Set(refs.map(refKey)).size !== refs.length)
      fail("TYPE_DUPLICATE", "Repeated pinned reference");
    this.#refs = copy([...refs]);
    const moduleKeys = new Set(modules.map(moduleKey));
    if (refs.some(ref => !moduleKeys.has(moduleKey(ref)))) fail("UNPINNED_MODULE", "Each NodeType requires its exact module pin");
    for (const [kind, versions] of validators) {
      const selected = [...versions].filter(([key]) => moduleKeys.has(key));
      if (selected.length > 1) fail("RESOURCE_PROVIDER_AMBIGUOUS", `Resource kind ${kind} has multiple pinned provider versions`);
      if (selected.length === 1) this.#validators.set(kind, selected[0][1].validate);
    }
    for (const ref of refs) {
      const t = loaded.get(refKey(ref));
      if (t) this.#types.set(refKey(ref), t);
    }
    Object.freeze(this);
  }
  get refs(): TypeRef[] {
    return view(this.#refs);
  }
  get modules(): ModuleRef[] { return view(this.#modules); }
  validateResources(document: GraphDocument): Issue[] {
    const issues: Issue[] = this.#missingModules.map(ref => ({ code: "MISSING_MODULE", severity: "error", message: `Missing exact pinned module ${moduleKey(ref)}`, subject: {} }));
    for (const resource of document.resources) {
      const kind = (resource.data as any)?.kind;
      if (typeof kind !== "string" || ["dataType", "arrayExtent"].includes(kind)) continue;
      const validator = this.#validators.get(kind);
      if (!validator) {
        issues.push({ code: "UNKNOWN_RESOURCE_KIND", severity: "error", message: `Resource kind ${kind} has no pinned validator`, subject: { resourceId: resource.id } });
        continue;
      }
      try {
        const context = moduleContext(document, { id: resource.id, references: { self: { kind: "resource", targetId: resource.id } } }, "pixel", this);
        for (const message of validator(view(resource.data), context)) issues.push({ code: "RESOURCE_VALIDATION", severity: "error", message, subject: { resourceId: resource.id } });
      } catch (error) { issues.push({ code: "RESOURCE_CALLBACK", severity: "error", message: String(error), subject: { resourceId: resource.id } }); }
    }
    return issues;
  }
  has(ref: TypeRef): boolean {
    return this.#refs.some((r) => refKey(r) === refKey(ref));
  }
  resolve(ref: TypeRef): NodeType | undefined {
    return this.#types.get(refKey(ref));
  }
}

export function validValue(type: ValueType, value: unknown, resources: GraphDocument["resources"] = []): boolean {
  return new TypeEnvironment(resources).valid(type, value);
}
export function adaptation(
  from: PortSpec,
  to: PortSpec,
): Adaptation | undefined {
  return automaticAdaptation(from, to);
}
function portsFor(type: NodeType, state: Json, context?: ModuleContext, resources: GraphDocument["resources"] = []): PortSpec[] {
  const ports = copy(type.ports(view(state), context));
  canonical(ports);
  const keys = new Set<string>();
  for (const port of ports) {
    if (
      !port.key ||
      typeof port.key !== "string" ||
      !["input", "output"].includes(port.direction) ||
      !typeTokenValid(port.type) ||
      (port.connectionPolicy !== undefined && !["default", "numeric", "exact"].includes(port.connectionPolicy))
    )
      fail("PORT_SCHEMA", "Invalid port definition");
    const key = port.direction + ":" + port.key;
    if (keys.has(key)) fail("PORT_DUPLICATE", "Duplicate port key");
    keys.add(key);
    if (
      port.direction === "input" &&
      !["local", "required"].includes(port.supply ?? "")
    )
      fail("PORT_SCHEMA", "Input must declare supply");
    if (port.supply === "local" && !validValue(port.type, port.default, resources))
      fail("PORT_DEFAULT", "Invalid local default");
  }
  return ports;
}
const findRecord = (doc: GraphDocument, id: string): NodeRecord | undefined =>
  doc.stages.flatMap((s) => s.nodes).find((n) => n.id === id);
const findStage = (
  doc: GraphDocument,
  nodeId: string,
): StageRecord | undefined =>
  doc.stages.find((s) => s.nodes.some((n) => n.id === nodeId));
function hasCycle(stage: StageRecord): boolean {
  const active = new Set<string>(),
    done = new Set<string>();
  const visit = (id: string): boolean => {
    if (active.has(id)) return true;
    if (done.has(id)) return false;
    active.add(id);
    for (const e of stage.edges.filter((e) => e.from.nodeId === id))
      if (visit(e.to.nodeId)) return true;
    active.delete(id);
    done.add(id);
    return false;
  };
  return stage.nodes.some((n) => visit(n.id));
}
function issue(
  code: string,
  nodeId: string | undefined,
  message: string,
  severity: "error" | "warning" = "error",
): Issue {
  return { code, severity, message, subject: nodeId ? { nodeId } : {} };
}
function diagnose(doc: GraphDocument, definitions: DefinitionSet): Issue[] {
  const result: Issue[] = [...typeResourceIssues(doc), ...definitions.validateResources(doc)];
  for (const stage of doc.stages) {
    if (hasCycle(stage))
      result.push(
        issue("CYCLE", undefined, "Stage contains a dependency cycle"),
      );
    for (const node of stage.nodes) {
      const t = definitions.resolve(node.typeRef);
      if (!t)
        result.push(
          issue(
            "MISSING_MODULE",
            node.id,
            "Exact NodeType implementation unavailable",
          ),
        );
      else {
        try {
          for (const msg of t.stateCodec.validate(view(node.state)))
            result.push(issue("STATE_CODEC", node.id, msg));
          for (const msg of t.validate(view(node.state), moduleContext(doc, node, stage.kind, definitions)))
            result.push(issue("NODE_VALIDATION", node.id, msg));
          if (!t.stages.includes(stage.kind) || (t.targets && !t.targets.includes(doc.kind)))
            result.push(
              issue(
                "STAGE_UNSUPPORTED",
                node.id,
                "Node is not allowed in this Stage",
              ),
            );
          if (!same(portsFor(t, node.state, moduleContext(doc, node, stage.kind, definitions), doc.resources), node.ports))
            result.push(
              issue(
                "SCHEMA_MISMATCH",
                node.id,
                "Saved interface does not match pinned definition",
              ),
            );
        } catch (error) {
          result.push(issue("MODULE_CALLBACK", node.id, String(error)));
        }
      }
      for (const p of node.ports) {
        try { new TypeEnvironment(doc.resources).resolve(p.type); }
        catch (error) { result.push(issue("DATA_TYPE", node.id, String(error))); }
      }
      for (const p of node.ports.filter((p) => p.direction === "input")) {
        const connected = stage.edges.some(
          (e) => e.to.nodeId === node.id && e.to.key === p.key,
        );
        if (!connected && p.supply === "required")
          result.push(issue("REQUIRED_INPUT", node.id, `Missing ${p.key}`));
        if (p.supply === "local" && !validValue(p.type, node.values[p.key], doc.resources))
          result.push(issue("INPUT_VALUE", node.id, `Invalid ${p.key}`));
      }
      for (const ref of Object.values(node.references)) {
        if (
          (ref.kind === "node" && !findRecord(doc, ref.targetId)) ||
          (ref.kind === "resource" &&
            !doc.resources.some((r) => r.id === ref.targetId))
        )
          result.push(
            issue(
              "MISSING_REFERENCE",
              node.id,
              `Unresolved ${ref.kind}: ${ref.targetId}`,
            ),
          );
      }
    }
    for (const e of stage.edges) {
      const from = stage.nodes
        .find((n) => n.id === e.from.nodeId)
        ?.ports.find((p) => p.direction === "output" && p.key === e.from.key);
      const to = stage.nodes
        .find((n) => n.id === e.to.nodeId)
        ?.ports.find((p) => p.direction === "input" && p.key === e.to.key);
      if (
        !from ||
        !to ||
        !adaptation(from, to) ||
        e.adaptation.from !== from.type ||
        e.adaptation.to !== to.type || e.invalid
      )
        result.push({
          ...issue("INVALID_EDGE", e.to.nodeId, "Invalid saved edge"),
          subject: { nodeId: e.to.nodeId, edgeId: e.id },
        });
    }
  }
  for (const loss of doc.losses)
    result.push({
      code: "CONNECTION_LOSS",
      severity: "warning",
      message: loss.reason,
      subject: { nodeId: loss.nodeId, lossId: loss.id, ...(loss.resourceId ? { resourceId: loss.resourceId } : {}) },
    });
  if (doc.recovery.length)
    result.push(
      issue(
        "RECOVERY_RECORDS",
        undefined,
        "Unresolved imported data requires repair",
      ),
    );
  return result;
}

export class Port {
  readonly loadId: string;
  readonly nodeId: string;
  readonly direction: "input" | "output";
  readonly key: string;
  #graph: Graph;
  constructor(
    graph: Graph,
    nodeId: string,
    direction: "input" | "output",
    key: string,
  ) {
    this.#graph = graph;
    this.loadId = graph.loadId;
    this.nodeId = nodeId;
    this.direction = direction;
    this.key = key;
    Object.freeze(this);
  }
  get spec(): PortSpec | undefined {
    return this.#graph
      .record(this.nodeId)
      ?.ports.find((p) => p.direction === this.direction && p.key === this.key);
  }
  get exists(): boolean {
    return !!this.spec;
  }
  get node(): Node | undefined {
    return this.#graph.nodeById(this.nodeId);
  }
  get parameters(): Parameter[] {
    return (
      this.node?.parameters.filter(
        (p) => p.spec.target.kind === "input" && p.spec.target.key === this.key,
      ) ?? []
    );
  }
}
export class Node {
  #graph: Graph;
  readonly id: string;
  constructor(graph: Graph, id: string) {
    this.#graph = graph;
    this.id = id;
    Object.freeze(this);
  }
  get exists(): boolean {
    return !!this.#graph.record(this.id);
  }
  get record(): NodeRecord {
    return (
      this.#graph.record(this.id) ??
      fail("MISSING_NODE", "Node is no longer present")
    );
  }
  get state(): Json {
    return this.record.state;
  }
  get typeRef(): TypeRef {
    return this.record.typeRef;
  }
  get name(): string {
    return this.record.name;
  }
  get position(): [number, number] {
    return this.record.position;
  }
  get type(): NodeType | undefined {
    return this.#graph.definitions.resolve(this.record.typeRef);
  }
  input(key: string): Port {
    return new Port(this.#graph, this.id, "input", key);
  }
  output(key: string): Port {
    return new Port(this.#graph, this.id, "output", key);
  }
  get parameters(): Parameter[] {
    return (
      this.type
        ?.parameters(this.state)
        .map((p) => new Parameter(this.#graph, this.id, p.key)) ?? []
    );
  }
  parameter(key: string): Parameter {
    return new Parameter(this.#graph, this.id, key);
  }
}
export class Parameter {
  #graph: Graph;
  readonly nodeId: string;
  readonly key: string;
  constructor(graph: Graph, nodeId: string, key: string) {
    this.#graph = graph;
    this.nodeId = nodeId;
    this.key = key;
    Object.freeze(this);
  }
  get spec(): ParameterSpec {
    const n =
      this.#graph.nodeById(this.nodeId) ??
      fail("MISSING_NODE", "Parameter owner missing");
    const p =
      n.type?.parameters(n.state).find((p) => p.key === this.key) ??
      fail("MISSING_PARAMETER", "Parameter unavailable");
    const presentation = p.presentation;
    if (presentation !== "number" && presentation !== "menu") {
      if (!presentation || typeof presentation !== "object" ||
          typeof presentation.widget !== "string" || !presentation.widget.trim() ||
          presentation.fallback !== undefined && !["auto", "none"].includes(presentation.fallback) ||
          presentation.options !== undefined && (!presentation.options || typeof presentation.options !== "object" || Array.isArray(presentation.options)))
        fail("PARAMETER_PRESENTATION", "Invalid presentation descriptor");
      canonical(presentation);
    }
    return view(p);
  }
  read(): unknown {
    const n = this.#graph.nodeById(this.nodeId)!;
    const t = this.spec.target;
    return t.kind === "input"
      ? n.record.values[t.key]
      : (n.state as any)[t.key];
  }
  write(value: Json, operation?: Operation): Result<void> {
    try {
      const spec = this.spec;
      let v = copy(value);
      if (spec.clamp && typeof v === "number")
        v = Math.max(spec.min ?? -Infinity, Math.min(spec.max ?? Infinity, v));
      return this.#graph.change(
        `Edit ${this.key}`,
        (d) => {
          if (spec.target.kind === "input")
            d.setInput(this.nodeId, spec.target.key, v as Value);
          else {
            const state = d.readNode(this.nodeId).state;
            if (!state || typeof state !== "object" || Array.isArray(state))
              fail("PARAMETER_TARGET", "State is not a property record");
            d.setState(this.nodeId, { ...state, [spec.target.key]: v });
          }
        },
        operation,
      );
    } catch (error) {
      return failure(error);
    }
  }
}
export class Stage {
  #graph: Graph;
  readonly id: string;
  constructor(graph: Graph, id: string) {
    this.#graph = graph;
    this.id = id;
    Object.freeze(this);
  }
  get record(): StageRecord {
    return this.#graph
      .snapshot()
      .document.stages.find((s) => s.id === this.id)!;
  }
  get nodes(): Node[] {
    return freeze(this.record.nodes.map((n) => this.#graph.nodeById(n.id)!));
  }
  get edges() {
    return this.record.edges;
  }
  node(name: string): Node | undefined {
    const r = this.record.nodes.find((n) => n.name === name.normalize("NFC"));
    return r ? this.#graph.nodeById(r.id) : undefined;
  }
}
export class Operation {
  #finish: (cancel: boolean) => Result<void>;
  readonly id: string;
  constructor(id: string, finish: (cancel: boolean) => Result<void>) {
    this.id = id;
    this.#finish = finish;
    Object.freeze(this);
  }
  commit(): Result<void> {
    return this.#finish(false);
  }
  cancel(): Result<void> {
    return this.#finish(true);
  }
}
export class History {
  #graph: Graph;
  constructor(graph: Graph) {
    this.#graph = graph;
    Object.freeze(this);
  }
  get length(): number {
    return this.#graph.historyCounts.undo;
  }
  get redoLength(): number {
    return this.#graph.historyCounts.redo;
  }
  undo(): Result<void> {
    return this.#graph.restoreHistory(false);
  }
  redo(): Result<void> {
    return this.#graph.restoreHistory(true);
  }
}

export class Draft {
  #doc: GraphDocument;
  #identity: IdentitySource;
  #definitions: DefinitionSet;
  #loadId: string;
  #alive = true;
  #poison: unknown;
  #requireValid = false;
  constructor(
    doc: GraphDocument,
    definitions: DefinitionSet,
    loadId: string,
    identity: IdentitySource,
  ) {
    this.#doc = doc;
    this.#identity = identity;
    this.#definitions = definitions;
    this.#loadId = loadId;
  }
  #run<T>(f: () => T): T {
    if (!this.#alive) fail("DRAFT_CLOSED", "Draft capability has expired");
    try {
      return f();
    } catch (error) {
      this.#poison = error;
      throw error;
    }
  }
  revoke(): void {
    this.#alive = false;
  }
  get requiresValid(): boolean { return this.#requireValid; }
  requireValid(): void { this.#run(() => { this.#requireValid = true; }); }
  assertHealthy(): void {
    if (this.#poison) throw this.#poison;
  }
  #node(id: string): NodeRecord {
    return findRecord(this.#doc, id) ?? fail("MISSING_NODE", "Node not found");
  }
  readNode(id: string): NodeRecord {
    return this.#run(() => view(this.#node(id)));
  }
  recordLoss(loss: Omit<LossRecord, "id">): string {
    return this.#run(() => {
      canonical(loss);
      if (typeof loss.reason !== "string" || !loss.reason || typeof loss.nodeId !== "string" || !loss.nodeId || loss.resourceId !== undefined && (typeof loss.resourceId !== "string" || !loss.resourceId)) fail("LOSS_RECORD", "Recovery loss requires reason and scoped node identity");
      const id = this.#identity.newId();
      this.#doc.losses.push({ ...copy(loss), id });
      return id;
    });
  }
  createNode(
    stageId: string,
    ref: TypeRef,
    args: Json = {},
    name?: string,
  ): string {
    return this.#run(() => {
      const stage =
        this.#doc.stages.find((s) => s.id === stageId) ??
        fail("MISSING_STAGE", "Stage missing");
      if (stage.implementation !== "network")
        fail("STAGE_DEFAULT", "Default Stage has no editable network");
      const type =
        this.#definitions.resolve(ref) ??
        fail("MISSING_MODULE", "Pinned NodeType unavailable");
      if (type.role === "boundary")
        fail("PROTECTED_NODE", "Boundary nodes are created by the profile");
      if (!type.stages.includes(stage.kind) || (type.targets && !type.targets.includes(this.#doc.kind)))
        fail("STAGE_UNSUPPORTED", "Node cannot be created in this Stage");
      const id = this.#identity.newId(),
        base = normalizedName(name ?? "node");
      let chosen = base;
      if (name && stage.nodes.some((n) => n.name === base))
        fail("NAME_CONFLICT", "Node name occupied");
      for (let i = 1; stage.nodes.some((n) => n.name === chosen); i++)
        chosen = base + i;
      const init = type.initialize(view(args), moduleContext(this.#doc, { id, references: {} }, stage.kind, this.#definitions));
      canonical(init);
      const errors = type.stateCodec.validate(view(init.state));
      if (errors.length) fail("STATE_CODEC", errors.join("; "));
      const ports = portsFor(type, init.state, moduleContext(this.#doc, { id, references: init.references ?? {} }, stage.kind, this.#definitions), this.#doc.resources),
        values: Record<string, Value> = {};
      for (const p of ports)
        if (p.direction === "input" && p.supply === "local")
          values[p.key] = copy(p.default!);
      stage.nodes.push({
        id,
        name: chosen,
        typeRef: copy(ref),
        state: copy(init.state),
        position: [0, 0],
        ports,
        values,
        references: copy(init.references ?? {}),
        referencesComplete: init.referencesComplete ?? true,
      });
      return id;
    });
  }
  importNode(stageId: string, record: NodeRecord): string {
    return this.#run(() => {
      canonical(record);
      const stage = this.#doc.stages.find(s => s.id === stageId) ?? fail("MISSING_STAGE", "Destination Stage missing");
      if (stage.implementation !== "network") fail("STAGE_DEFAULT", "Default stage has no editable network");
      if (!this.#definitions.has(record.typeRef)) fail("UNPINNED_TYPE", "Imported node must use a pinned definition");
      const type = this.#definitions.resolve(record.typeRef);
      if (record.boundary === true || type?.role === "boundary") fail("PROTECTED_NODE", "Cannot import a second stage boundary");
      if (type && (!type.stages.includes(stage.kind) || type.targets && !type.targets.includes(this.#doc.kind))) fail("STAGE_UNSUPPORTED", "Imported node is ineligible here");
      if (type) { const errors = type.stateCodec.validate(view(record.state)); if (errors.length) fail("STATE_CODEC", errors.join("; ")); }
      const node = copy(record), base = normalizedName(node.name);
      node.id = this.#identity.newId();
      for (let i = 1; stage.nodes.some(n => n.name === node.name); i++) node.name = base + i;
      stage.nodes.push(node); return node.id;
    });
  }
  setStageImplementation(kind: "vertex", implementation: "default" | "network"): void {
    this.#run(() => {
      if (kind !== "vertex" || !["default", "network"].includes(implementation)) fail("STAGE_PROFILE", "Only vertex implementation can be selected");
      const stage = this.#doc.stages.find(s => s.kind === kind)!;
      if (implementation === "default" && stage.nodes.length) fail("STAGE_NOT_EMPTY", "Cannot discard an editable vertex network");
      stage.implementation = implementation;
    });
  }
  readResource(id: string): Json | undefined {
    return this.#run(() => { const data = this.#doc.resources.find(r => r.id === id)?.data; return data === undefined ? undefined : view(data); });
  }
  putResource(id: string, data: Json): void {
    this.#run(() => {
      if (typeof id !== "string" || !id) fail("RESOURCE_ID", "Resource identity is required");
      canonical(data);
      const existing = this.#doc.resources.find(r => r.id === id);
      if (existing) existing.data = copy(data); else this.#doc.resources.push({ id, data: copy(data) });
    });
  }
  removeResource(id: string): void {
    this.#run(() => {
      if (!this.#doc.resources.some(r => r.id === id)) fail("MISSING_RESOURCE", "Resource missing");
      this.#doc.resources = this.#doc.resources.filter(r => r.id !== id);
    });
  }
  setReference(id: string, key: string, reference: Reference | null): void {
    this.#run(() => {
      if (!key) fail("REFERENCE", "Reference key is required");
      const node = this.#node(id);
      if (reference === null) delete node.references[key];
      else { canonical(reference); node.references[key] = copy(reference); }
    });
  }
  setMetadata(id: string | null, key: string, value: Json): void {
    this.#run(() => {
      // Only a namespaced UI metadata bag is editable here; semantic fields remain typed operations.
      canonical(value); if (!key) fail("METADATA_KEY", "Metadata key required");
      const owner = id === null ? this.#doc : this.#node(id);
      const metadata = owner.uiMetadata;
      if (metadata !== undefined && (!metadata || typeof metadata !== "object" || Array.isArray(metadata))) fail("METADATA_SCHEMA", "Existing metadata is opaque");
      owner.uiMetadata = { ...(metadata as Record<string, Json> ?? {}), [key]: copy(value) };
    });
  }
  replaceDocument(candidate: GraphDocument): void {
    this.#run(() => {
      canonical(candidate);
      if (!same(candidate.definitions, this.#doc.definitions) || !same(candidate.modules ?? moduleRefsFor(candidate.definitions), this.#doc.modules ?? moduleRefsFor(this.#doc.definitions)) || !same(candidate.outputType, this.#doc.outputType)) fail("IMPORT_DEFINITIONS", "Replacement must use the destination pinned definitions and output profile");
      const replacement = copy(candidate); replacement.id = this.#doc.id;
      validateEnvelope(replacement);
      for (const key of Object.keys(this.#doc)) delete this.#doc[key];
      Object.assign(this.#doc, replacement);
    });
  }
  setState(id: string, state: Json): void {
    this.#run(() => {
      canonical(state);
      const n = this.#node(id),
        t =
          this.#definitions.resolve(n.typeRef) ??
          fail("MISSING_MODULE", "Cannot edit opaque module state");
      const errors = t.stateCodec.validate(view(state));
      if (errors.length) fail("STATE_CODEC", errors.join("; "));
      n.state = copy(state);
    });
  }
  setInput(id: string, key: string, value: Value): void {
    this.#run(() => {
      const n = this.#node(id);
      if (!this.#definitions.resolve(n.typeRef))
        fail("MISSING_MODULE", "Cannot edit opaque input");
      const p =
        portsFor(this.#definitions.resolve(n.typeRef)!, n.state, moduleContext(this.#doc, n, findStage(this.#doc, n.id)!.kind, this.#definitions), this.#doc.resources).find(
          (p) => p.direction === "input" && p.key === key,
        ) ?? fail("MISSING_PORT", "Input missing");
      if (p.supply !== "local" || !validValue(p.type, value, this.#doc.resources))
        fail("INPUT_VALUE", "Invalid local input");
      n.values[key] = copy(value);
    });
  }
  rename(id: string, name: string): void {
    this.#run(() => {
      const n = this.#node(id),
        s = findStage(this.#doc, id)!;
      const v = normalizedName(name);
      if (s.nodes.some((x) => x.id !== id && x.name === v))
        fail("NAME_CONFLICT", "Name occupied");
      n.name = v;
    });
  }
  move(id: string, position: [number, number]): void {
    this.#run(() => {
      if (
        !Array.isArray(position) ||
        position.length !== 2 ||
        !position.every(Number.isFinite)
      )
        fail("POSITION", "Invalid position");
      this.#node(id).position = copy(position);
    });
  }
  removeNode(id: string): void {
    this.#run(() => {
      const n = this.#node(id);
      if (n.boundary === true)
        fail("PROTECTED_NODE", "Cannot remove Stage boundary");
      const s = findStage(this.#doc, id)!;
      s.nodes = s.nodes.filter((n) => n.id !== id);
      s.edges = s.edges.filter(
        (e) => e.from.nodeId !== id && e.to.nodeId !== id,
      );
    });
  }
  connect(from: Port, to: Port, options: { replace?: boolean } = {}): string {
    return this.#run(() => {
      if (
        !(from instanceof Port) ||
        !(to instanceof Port) ||
        from.loadId !== this.#loadId ||
        to.loadId !== this.#loadId
      )
        fail("FOREIGN_PORT", "Port belongs to another loaded Graph");
      if (from.direction !== "output" || to.direction !== "input")
        fail("PORT_DIRECTION", "Expected output to input");
      return this.connectEndpoints({ nodeId: from.nodeId, key: from.key }, { nodeId: to.nodeId, key: to.key }, options);
    });
  }
  connectEndpoints(from: Endpoint, to: Endpoint, options: { replace?: boolean } = {}): string {
    return this.#run(() => {
      const s = findStage(this.#doc, from.nodeId),
        ts = findStage(this.#doc, to.nodeId);
      if (!s || s !== ts)
        fail("CROSS_NETWORK", "Endpoints must be in one Network");
      const fn = this.#node(from.nodeId),
        tn = this.#node(to.nodeId);
      const ft = this.#definitions.resolve(fn.typeRef),
        tt = this.#definitions.resolve(tn.typeRef);
      if (!ft || !tt)
        fail("MISSING_MODULE", "Cannot connect unknown implementation");
      const fp = portsFor(ft, fn.state, moduleContext(this.#doc, fn, s.kind, this.#definitions), this.#doc.resources).find(
          (p) => p.direction === "output" && p.key === from.key,
        );
      if (!fp) fail("MISSING_PORT", "Output missing");
      let tp: PortSpec | undefined;
      if (tt.connectionTypePolicy === "infer") {
        // Type inquiry uses a candidate edge and a copied document, never transient live state.
        const proposal = copy(this.#doc), ps = proposal.stages.find(stage => stage.id === s.id)!;
        ps.edges = ps.edges.filter(e => e.to.nodeId !== to.nodeId || e.to.key !== to.key);
        ps.edges.push({ id: "proposal", from: copy(from), to: copy(to), adaptation: { from: fp.type, to: fp.type, op: "identity" } });
        const pn = ps.nodes.find(node => node.id === tn.id)!;
        tp = portsFor(tt, tn.state, moduleContext(proposal, pn, s.kind, this.#definitions), proposal.resources).find(p => p.direction === "input" && p.key === to.key);
      } else tp = portsFor(tt, tn.state, moduleContext(this.#doc, tn, s.kind, this.#definitions), this.#doc.resources).find(p => p.direction === "input" && p.key === to.key);
      if (!tp) fail("MISSING_PORT", "Input missing");
      const plan = adaptation(fp, tp);
      if (!plan) fail("INCOMPATIBLE_TYPES", "No automatic adaptation");
      const occupied = s.edges.find(
        (e) => e.to.nodeId === to.nodeId && e.to.key === to.key,
      );
      if (occupied && !options.replace)
        fail("INPUT_OCCUPIED", "Explicit replace required");
      // Check only whether this new dependency creates a path back to its source.
      const reachable = (at: string, seen = new Set<string>()): boolean => {
        if (at === from.nodeId) return true;
        if (seen.has(at)) return false;
        seen.add(at);
        return s.edges
          .filter((e) => e !== occupied && e.from.nodeId === at)
          .some((e) => reachable(e.to.nodeId, seen));
      };
      if (reachable(to.nodeId))
        fail("CYCLE", "New edge would create a dependency cycle");
      if (occupied) s.edges = s.edges.filter((e) => e.id !== occupied.id);
      const id = this.#identity.newId();
      s.edges.push({
        id,
        from: { nodeId: from.nodeId, key: from.key },
        to: { nodeId: to.nodeId, key: to.key },
        adaptation: plan,
      });
      return id;
    });
  }
  disconnect(id: string): void {
    this.#run(() => {
      const s =
        this.#doc.stages.find((s) => s.edges.some((e) => e.id === id)) ??
        fail("MISSING_EDGE", "Edge missing");
      s.edges = s.edges.filter((e) => e.id !== id);
    });
  }
}

type HistoryEntry = {
  label: string;
  before: GraphDocument;
  after: GraphDocument;
};
export class Graph {
  readonly loadId: string;
  readonly identity: IdentitySource;
  #definitions: DefinitionSet;
  readonly history: History;
  #doc: GraphDocument;
  #revision = 0;
  #issues: Issue[] = [];
  #nodes = new Map<string, Node>();
  #undo: HistoryEntry[] = [];
  #redo: HistoryEntry[] = [];
  #active: { token: Operation; label: string; before: GraphDocument } | null =
    null;
  #notifying = false;
  #changing = false;
  #listeners = new Set<(event: ChangeEvent) => void>();
  #operationListeners = new Set<(event: OperationEndEvent) => void>();
  #projections = new Set<(event: ChangeEvent) => void>();
  #observerErrors: string[] = [];
  #savedText: string | null = null;
  #saving = false;
  constructor(options: {
    name: string;
    definitions: DefinitionSet;
    outputType: TypeRef;
    kind?: GraphDocument["kind"];
    identity?: IdentitySource;
  }) {
    this.identity = captureIdentity(options.identity);
    this.loadId = this.identity.newId();
    this.#definitions = options.definitions;
    this.history = new History(this);
    const name = normalizedName(options.name),
      type =
        options.definitions.resolve(options.outputType) ??
        fail("MISSING_MODULE", "Output NodeType unavailable");
    if (type.role !== "boundary" || !type.stages.includes("pixel"))
      fail("PROFILE_BOUNDARY", "Expected pixel boundary type");
    const init = type.initialize({});
    canonical(init);
    if (type.stateCodec.validate(init.state).length)
      fail("STATE_CODEC", "Invalid boundary initialization");
    const ports = portsFor(type, init.state);
    if (
      !ports.some(
        (p) =>
          p.direction === "input" &&
          p.key === "color" &&
          p.type === "vec4" &&
          p.supply === "required",
      )
    )
      fail("PROFILE_BOUNDARY", "Profile requires color vec4 input");
    const boundary: NodeRecord = {
      id: this.identity.newId(),
      name: "output",
      typeRef: copy(type.ref),
      state: copy(init.state),
      position: [0, 0],
      ports,
      values: {},
      references: copy(init.references ?? {}),
      referencesComplete: init.referencesComplete ?? true,
      boundary: true,
    };
    this.#doc = {
      format: "grape-core-experiment",
      formatVersion: 1,
      id: this.identity.newId(),
      name,
      kind: options.kind ?? "td.top",
      outputType: copy(type.ref),
      definitions: options.definitions.refs,
      modules: options.definitions.modules,
      stages: [
        {
          id: this.identity.newId(),
          kind: "vertex",
          implementation: "default",
          nodes: [],
          edges: [],
        },
        {
          id: this.identity.newId(),
          kind: "pixel",
          implementation: "network",
          nodes: [boundary],
          edges: [],
        },
      ],
      losses: [],
      resources: [],
      recovery: [],
    };
    validateEnvelope(this.#doc);
    this.#issues = diagnose(this.#doc, this.definitions);
    Object.freeze(this);
  }
  static load(
    text: string,
    registry: Registry,
    options: { identity?: IdentitySource } = {},
  ): Result<Graph> {
    try {
      const doc = JSON.parse(text) as GraphDocument;
      canonical(doc);
      validateEnvelope(doc);
      const definitions = registry.pin(doc.definitions, doc.modules);
      // Loading missing definitions must not require executing their constructor.

      // Hydration initializes private fields without executing a missing module.
      return ok(Graph.#fromDocument(doc, definitions, text, options.identity));
    } catch (error) {
      return failure(error);
    }
  }
  static #fromDocument(
    doc: GraphDocument,
    definitions: DefinitionSet,
    text: string,
    identity?: IdentitySource,
  ): Graph {
    const bootstrapType: NodeType = {
      ref: doc.outputType,
      role: "boundary",
      stages: ["pixel"],
      stateCodec: { schemaVersion: 1, validate: () => [] },
      initialize: () => ({ state: {} }),
      ports: () => [
        { key: "color", direction: "input", type: "vec4", supply: "required" },
      ],
      parameters: () => [],
      validate: () => [],
      emit: () => ({ outputs: {} }),
    };
    const temporary = new DefinitionSet(
      [doc.outputType],
      new Map([[refKey(doc.outputType), bootstrapType]]),
    );
    const graph = new Graph({
      name: doc.name,
      definitions: temporary,
      outputType: doc.outputType,
      identity,
    });
    // This temporary bootstrap is never published; hydration preserves saved identities.
    return graph.#adopt(doc, definitions, text);
  }
  #adopt(doc: GraphDocument, definitions: DefinitionSet, text: string): Graph {
    // One effective DefinitionSet, pinned before this loaded Graph is exposed.
    this.#definitions = definitions;
    this.#doc = copy(doc);
    this.#issues = diagnose(this.#doc, definitions);
    this.#savedText = canonical(doc);
    return this;
  }

  get definitions(): DefinitionSet {
    return this.#definitions;
  }
  get id(): string {
    return this.#doc.id;
  }
  get revision(): number {
    return this.#revision;
  }
  get busy(): boolean {
    return this.#active !== null;
  }
  get diagnostics(): Issue[] {
    return view(this.#issues);
  }
  get observerErrors(): string[] {
    return [...this.#observerErrors];
  }
  get historyCounts() {
    return { undo: this.#undo.length, redo: this.#redo.length };
  }
  get dirty(): boolean {
    return this.#savedText !== canonical(this.#doc);
  }
  record(id: string): NodeRecord | undefined {
    const n = findRecord(this.#doc, id);
    return n ? view(n) : undefined;
  }
  nodeById(id: string): Node | undefined {
    if (!findRecord(this.#doc, id)) return undefined;
    if (!this.#nodes.has(id)) this.#nodes.set(id, new Node(this, id));
    return this.#nodes.get(id);
  }
  stage(kind: "vertex" | "pixel"): Stage {
    const s =
      this.#doc.stages.find((s) => s.kind === kind) ??
      fail("MISSING_STAGE", "Stage missing");
    return new Stage(this, s.id);
  }
  snapshot(): Snapshot {
    return freeze({
      document: view(this.#doc),
      revision: this.#revision,
      loadId: this.loadId,
      diagnostics: this.diagnostics,
      definitions: this.definitions,
    });
  }
  exportJSON(): string {
    return JSON.stringify(this.#doc, null, 2) + "\n";
  }
  subscribe(listener: (event: ChangeEvent) => void): () => void {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }
  subscribeOperationEnd(listener: (event: OperationEndEvent) => void): () => void {
    this.#operationListeners.add(listener);
    return () => { this.#operationListeners.delete(listener); };
  }
  #publishOperationEnd(operationId: string, cancelled: boolean): void {
    this.#notifying = true;
    const event = freeze({ operationId, cancelled, snapshot: this.snapshot() });
    try { for (const listener of [...this.#operationListeners]) {
      try { listener(event); } catch (error) { this.#observerErrors.push(String(error)); }
    } } finally { this.#notifying = false; }
  }
  registerProjection(listener: (event: ChangeEvent) => void): () => void {
    this.#projections.add(listener);
    return () => {
      this.#projections.delete(listener);
    };
  }
  #available(): void {
    if (this.#notifying)
      fail(
        "REENTRANT_WRITE",
        "Writes during notification must be explicitly scheduled later",
      );
    if (this.#changing)
      fail("REENTRANT_WRITE", "Nested Graph mutation is not allowed");
  }
  beginOperation(label: string): Result<Operation> {
    try {
      this.#available();
      if (this.#active) fail("BUSY", "One writing Operation is already open");
      const id = this.identity.newId();
      const token: Operation = new Operation(id, (cancel) =>
        this.#finish(token, cancel),
      );
      this.#active = { token, label, before: copy(this.#doc) };
      return ok(token);
    } catch (e) {
      return failure(e);
    }
  }
  change<T>(
    label: string,
    callback: (draft: Draft) => T,
    operation?: Operation,
  ): Result<T> {
    let implicit = false,
      entered = false,
      draft: Draft | undefined;
    try {
      this.#available();
      if (operation) {
        if (this.#active?.token !== operation)
          fail(
            "OPERATION_CLOSED",
            "Operation is closed or belongs to another Graph",
          );
      } else {
        if (this.#active) fail("BUSY", "Graph has an open Operation");
        const begun = this.beginOperation(label);
        if (!begun.ok) return begun;
        operation = begun.value;
        implicit = true;
      }
      const candidate = copy(this.#doc);
      draft = new Draft(
        candidate,
        this.definitions,
        this.loadId,
        this.identity,
      );
      this.#changing = true;
      entered = true;
      const value = callback(draft);
      if (value && typeof (value as any).then === "function") {
        Promise.resolve(value).catch(() => {});
        fail("ASYNC_CHANGE", "Change callback must finish synchronously");
      }
      draft.assertHealthy();
      draft.revoke();
      reconcile(candidate, this.definitions, this.identity);
      validateEnvelope(candidate);
      const changed = !same(candidate, this.#doc);
      const issues = changed
        ? diagnose(candidate, this.definitions)
        : this.#issues;
      if (draft.requiresValid && issues.some(issue => issue.severity === "error")) fail("GRAPH_ERRORS", "Operation requires a valid final candidate");
      if (changed) {
        this.#doc = copy(candidate);
        this.#revision++;
        this.#issues = issues;
      }
      if (implicit) this.#commitActive();
      this.#changing = false;
      entered = false;
      if (changed) this.#publish("change", operation.id);
      if (implicit) this.#publishOperationEnd(operation.id, false);
      return ok(value);
    } catch (error) {
      draft?.revoke();
      if (entered) this.#changing = false;
      if (implicit) this.#active = null;
      return failure(error);
    }
  }
  #commitActive(): void {
    const a = this.#active!;
    if (!same(a.before, this.#doc)) {
      this.#undo.push({
        label: a.label,
        before: a.before,
        after: copy(this.#doc),
      });
      this.#redo = [];
    }
    this.#active = null;
  }
  #finish(operation: Operation, cancel: boolean): Result<void> {
    try {
      this.#available();
      if (this.#active?.token !== operation)
        fail("OPERATION_CLOSED", "Operation is no longer active");
      if (!cancel) {
        this.#commitActive();
        this.#publishOperationEnd(operation.id, false);
        return ok(undefined);
      }
      const before = this.#active.before,
        changed = !same(before, this.#doc);
      this.#changing = true;
      let issues: Issue[];
      try {
        issues = changed ? diagnose(before, this.definitions) : this.#issues;
      } finally {
        this.#changing = false;
      }
      this.#active = null;
      if (changed) {
        this.#doc = copy(before);
        this.#revision++;
        this.#issues = issues;
        this.#publish("cancel", operation.id);
      }
      this.#publishOperationEnd(operation.id, true);
      return ok(undefined);
    } catch (e) {
      return failure(e);
    }
  }
  restoreHistory(redo: boolean): Result<void> {
    try {
      this.#available();
      if (this.#active)
        fail("BUSY", "Finish the open Operation before history navigation");
      const source = redo ? this.#redo : this.#undo,
        target = redo ? this.#undo : this.#redo;
      const entry = source.at(-1);
      if (!entry) fail("HISTORY_EMPTY", "No history entry");
      const candidate = copy(redo ? entry.after : entry.before);
      this.#changing = true;
      let issues: Issue[];
      try {
        issues = diagnose(candidate, this.definitions);
      } finally {
        this.#changing = false;
      }
      source.pop();
      target.push(entry);
      this.#doc = candidate;
      this.#revision++;
      this.#issues = issues;
      this.#publish(redo ? "redo" : "undo", null);
      return ok(undefined);
    } catch (e) {
      return failure(e);
    }
  }
  #publish(kind: ChangeEvent["kind"], operationId: string | null): void {
    this.#notifying = true;
    const event = freeze({
      kind,
      operationId,
      revision: this.#revision,
      snapshot: this.snapshot(),
    });
    try {
      for (const listeners of [this.#projections, this.#listeners])
        for (const listener of [...listeners]) {
          try {
            listener(event);
          } catch (e) {
            this.#observerErrors.push(String(e));
          }
        }
    } finally {
      this.#notifying = false;
    }
  }
  async save(adapter: StorageAdapter): Promise<Result<{ revision: number }>> {
    if (this.#saving)
      return failure(new ApiError("SAVE_BUSY", "A save is already in flight"));
    if (this.#notifying || this.#changing)
      return failure(
        new ApiError(
          "REENTRANT_WRITE",
          "Cannot save from a partial publication",
        ),
      );
    this.#saving = true;
    const snapshot = this.snapshot(),
      text = JSON.stringify(snapshot.document, null, 2) + "\n";
    try {
      await adapter.write(text);
      this.#savedText = canonical(snapshot.document);
      return ok({ revision: snapshot.revision });
    } catch (e) {
      return failure(e);
    } finally {
      this.#saving = false;
    }
  }
}

function dependencyOrder(stage: { nodes: NodeRecord[]; edges: EdgeRecord[] }): NodeRecord[] {
  const emitted = new Set<string>(), active = new Set<string>(), ordered: NodeRecord[] = [];
  const visit = (node: NodeRecord) => {
    if (emitted.has(node.id) || active.has(node.id)) return;
    active.add(node.id);
    for (const edge of stage.edges) if (edge.to.nodeId === node.id) { const parent = stage.nodes.find(n => n.id === edge.from.nodeId); if (parent) visit(parent); }
    active.delete(node.id); emitted.add(node.id); ordered.push(node);
  };
  stage.nodes.forEach(visit); return ordered;
}
/** Reconcile a mutable candidate network only; caller owns publication/history and resource scope. */
export function reconcileNetworkModel(
  network: { nodes: NodeRecord[]; edges: EdgeRecord[] },
  definitions: DefinitionResolver,
  identity: IdentitySource,
  contextForNode: (node: NodeRecord) => ModuleContext,
  resources: GraphDocument["resources"],
): LossRecord[] {
  const losses: LossRecord[] = [];
  const s = network;
    for (const n of dependencyOrder(s)) {
      const type = definitions.resolve(n.typeRef);
      if (!type) continue;
      const ports = portsFor(type, n.state, contextForNode(n), resources),
        values: Record<string, Value> = {};
      for (const p of ports.filter(
        (p) => p.direction === "input" && p.supply === "local",
      )) {
        const old = n.values[p.key];
        values[p.key] = validValue(p.type, old, resources) ? copy(old) : copy(p.default!);
        if (old !== undefined && !validValue(p.type, old, resources))
          losses.push({
            id: identity.newId(),
            reason: "Input value no longer fits port type",
            nodeId: n.id,
            inputKey: p.key,
            value: copy(old),
          });
      }
      for (const [key, value] of Object.entries(n.values))
        if (
          !ports.some(
            (p) =>
              p.direction === "input" && p.supply === "local" && p.key === key,
          )
        )
          losses.push({
            id: identity.newId(),
            reason: "Input removed by schema change",
            nodeId: n.id,
            inputKey: key,
            value: copy(value),
          });
      n.ports = ports;
      n.values = values;
    }
  {
    s.edges = s.edges.filter((e) => {
      const from = s.nodes
          .find((n) => n.id === e.from.nodeId)
          ?.ports.find((p) => p.direction === "output" && p.key === e.from.key),
        to = s.nodes
          .find((n) => n.id === e.to.nodeId)
          ?.ports.find((p) => p.direction === "input" && p.key === e.to.key);
      let plan = from && to ? adaptation(from, to) : undefined;
      if (!plan) {
        const preserve = [e.from.nodeId, e.to.nodeId].some(id => {
          const node = s.nodes.find(n => n.id === id);
          return node && definitions.resolve(node.typeRef)?.invalidEdgePolicy === "preserve";
        });
        if (preserve) {
          e.invalid = { code: "INTERFACE_CHANGED", reason: "Endpoint removed or types incompatible; retained by module policy" };
          return true;
        }
        losses.push({
          id: identity.newId(),
          reason: "Port removed or automatic adaptation unavailable",
          nodeId: e.to.nodeId,
          edge: copy(e),
        });
        return false;
      }
      e.adaptation = copy(plan);
      delete e.invalid;
      return true;
    });
  }
  return losses;
}

function reconcile(doc: GraphDocument, definitions: DefinitionSet, identity: IdentitySource): void {
  for (const stage of doc.stages) doc.losses.push(...reconcileNetworkModel(
    stage, definitions, identity, node => moduleContext(doc, node, stage.kind, definitions), doc.resources,
  ));
}
function validateEnvelope(doc: GraphDocument): void {
  if (
    doc.format !== "grape-core-experiment" ||
    doc.formatVersion !== 1 ||
    !["td.top", "td.mat"].includes(doc.kind)
  )
    fail("DOCUMENT_FORMAT", "Unsupported experiment document");
  normalizedName(doc.name);
  if (doc.modules !== undefined) {
    if (!Array.isArray(doc.modules)) fail("MODULE_REF", "Module pins must be an array");
    const moduleKeys = new Set<string>();
    for (const ref of doc.modules) {
      if (!ref || ![ref.moduleId, ref.version, ref.fingerprint].every(v => typeof v === "string" && v)) fail("MODULE_REF", "Malformed pinned module");
      const key = moduleKey(ref); if (moduleKeys.has(key)) fail("MODULE_DUPLICATE", "Repeated pinned module"); moduleKeys.add(key);
    }
  }
  if (typeof doc.id !== "string" || !doc.id || !validRef(doc.outputType))
    fail("DOCUMENT_ID", "Malformed graph identity");
  if (
    !Array.isArray(doc.definitions) ||
    !Array.isArray(doc.stages) ||
    !Array.isArray(doc.losses) ||
    !Array.isArray(doc.resources) ||
    !Array.isArray(doc.recovery)
  )
    fail("DOCUMENT_FORMAT", "Missing collections");
  if (
    doc.stages.length !== 2 ||
    doc.stages.filter((s) => s.kind === "pixel").length !== 1 ||
    doc.stages.filter((s) => s.kind === "vertex").length !== 1
  )
    fail("STAGES", "Expected one vertex and one pixel Stage");
  const ids = new Set<string>();
  const add = (id: string) => {
    if (typeof id !== "string" || !id || ids.has(id))
      fail("DUPLICATE_ID", "Object IDs must be unique");
    ids.add(id);
  };
  add(doc.id);
  for (const r of doc.resources) add(r.id);
  for (const loss of doc.losses) add(loss.id);
  for (const s of doc.stages) {
    add(s.id);
    if (!Array.isArray(s.nodes) || !Array.isArray(s.edges))
      fail("DOCUMENT_FORMAT", "Invalid Stage collections");
    const names = new Set<string>();
    for (const n of s.nodes) {
      add(n.id);
      if (normalizedName(n.name) !== n.name || names.has(n.name))
        fail("NAME_CONFLICT", "Invalid or repeated node name");
      names.add(n.name);
      if (
        !validRef(n.typeRef) ||
        !doc.definitions.some((r) => refKey(r) === refKey(n.typeRef))
      )
        fail("UNPINNED_TYPE", "Node type not in DefinitionSet");
      if (
        !Array.isArray(n.ports) ||
        !n.values ||
        !n.references ||
        typeof n.referencesComplete !== "boolean" ||
        !Array.isArray(n.position) ||
        n.position.length !== 2 ||
        !n.position.every(Number.isFinite)
      )
        fail("DOCUMENT_NODE", "Invalid node record");
      canonical(n.state);
      const keys = new Set<string>();
      for (const p of n.ports) {
        const k = p.direction + ":" + p.key;
        if (
          !p.key ||
          keys.has(k) ||
          !["input", "output"].includes(p.direction) ||
          !typeTokenValid(p.type)
        )
          fail("PORT_SCHEMA", "Malformed saved port");
        keys.add(k);
      }
      for (const r of Object.values(n.references))
        if (
          !r ||
          !["node", "resource"].includes(r.kind) ||
          typeof r.targetId !== "string"
        )
          fail("REFERENCE", "Malformed reference slot");
    }
    const targets = new Set<string>();
    for (const e of s.edges) {
      add(e.id);
      const key = canonical(e.to);
      if (targets.has(key)) fail("INPUT_OCCUPIED", "Multiple incoming edges");
      targets.add(key);
      if (
        !e.invalid && (!s.nodes.some(
          (n) =>
            n.id === e.from.nodeId &&
            n.ports.some(
              (p) => p.direction === "output" && p.key === e.from.key,
            ),
        ) ||
        !s.nodes.some(
          (n) =>
            n.id === e.to.nodeId &&
            n.ports.some((p) => p.direction === "input" && p.key === e.to.key),
        )
      ))
        fail("DANGLING_EDGE", "Unresolvable endpoints");
      if (e.invalid && (e.invalid.code !== "INTERFACE_CHANGED" || typeof e.invalid.reason !== "string" || !s.nodes.some(n => n.id === e.from.nodeId) || !s.nodes.some(n => n.id === e.to.nodeId))) fail("INVALID_EDGE", "Malformed preserved edge");
      if (
        !e.adaptation ||
        !["identity", "broadcast", "take", "alpha", "cast"].includes(e.adaptation.op)
      )
        fail("ADAPTATION", "Malformed adaptation");
    }
  }
  const p = doc.stages.find((s) => s.kind === "pixel")!;
  if (
    p.nodes.filter(
      (n) =>
        n.boundary === true && refKey(n.typeRef) === refKey(doc.outputType),
    ).length !== 1
  )
    fail("PROFILE_BOUNDARY", "Expected exactly one protected output");
}

export interface SelectionRef { kind: "node" | "edge" | "frame" | "resource"; id: string; }
// A module supplies read-only scope resolution; Context owns the navigation state.
export interface NetworkSelectionScope {
  id: string;
  path: string[];
  valid(): boolean;
  contains(ref: SelectionRef): boolean;
}
export class EditorContext {
  readonly id: string;
  readonly graph: Graph;
  #stageKind: "vertex" | "pixel" = "pixel";
  #selection: { items: SelectionRef[]; primary: SelectionRef | null } = {
    items: [],
    primary: null,
  };
  #disposed = false;
  #networkScope: NetworkSelectionScope | null = null;
  #navigationRevision = 0;
  #unsubscribe: () => void;
  constructor(graph: Graph) {
    this.id = graph.identity.newId();
    this.graph = graph;
    this.#unsubscribe = graph.registerProjection(() => {
      if (this.#networkScope) {
        let valid = false;
        try { valid = this.#networkScope.valid(); } catch { /* invalid scope projects to root */ }
        if (!valid) { this.#networkScope = null; this.#navigationRevision++; this.#selection = { items: [], primary: null }; }
      }
      const items = this.#selection.items.filter((ref) => this.#selectable(ref));
      this.#selection = {
        items,
        primary: items.some(ref => same(ref, this.#selection.primary))
          ? this.#selection.primary
          : (items.at(-1) ?? null),
      };
    });
    Object.freeze(this);
  }
  get activeStage(): Stage {
    return this.graph.stage(this.#stageKind);
  }
  get stageId(): string {
    return this.activeStage.id;
  }
  get activeNetwork(): { id: string; path: string[] } {
    return view(this.#networkScope ? { id: this.#networkScope.id, path: this.#networkScope.path } : { id: this.stageId, path: [] });
  }
  get navigationRevision(): number { return this.#navigationRevision; }
  enterNetwork(scope: NetworkSelectionScope | null): Result<void> {
    try {
      if (this.#disposed) fail("CONTEXT_CLOSED", "Context disposed");
      if (this.graph.busy) fail("BUSY", "Finish Graph operation before network navigation");
      if (scope && (!scope.id || !Array.isArray(scope.path) || !scope.path.length || scope.path.some(id => typeof id !== "string" || !id) || !scope.valid())) fail("NETWORK_SCOPE", "Invalid network scope");
      this.#networkScope = scope ? Object.freeze({ ...scope, path: freeze([...scope.path]) }) : null;
      this.#navigationRevision++;
      this.#selection = { items: [], primary: null };
      return ok(undefined);
    } catch(e) { return failure(e); }
  }
  get disposed(): boolean {
    return this.#disposed;
  }
  navigateStage(kind: "vertex" | "pixel"): Result<void> {
    if (this.#disposed)
      return failure(new ApiError("CONTEXT_CLOSED", "Context disposed"));
    if (this.graph.busy)
      return failure(
        new ApiError("BUSY", "Finish the Graph operation before navigation"),
      );
    this.graph.stage(kind);
    this.#stageKind = kind;
    this.#navigationRevision++;
    this.#networkScope = null;
    this.#selection = { items: [], primary: null };
    return ok(undefined);
  }
  beginOperation(label: string): Result<Operation> {
    return this.#disposed
      ? failure(new ApiError("CONTEXT_CLOSED", "Context disposed"))
      : this.graph.beginOperation(label);
  }
  change<T>(
    label: string,
    callback: (draft: Draft) => T,
    operation?: Operation,
  ): Result<T> {
    return this.#disposed
      ? failure(new ApiError("CONTEXT_CLOSED", "Context disposed"))
      : this.graph.change(label, callback, operation);
  }
  get selection() {
    // Backward-compatible node view, derived from the single typed selection truth.
    const items = this.#selection.items.filter(ref => ref.kind === "node").map(ref => ref.id);
    const primary = this.#selection.primary?.kind === "node" ? this.#selection.primary.id : items.at(-1) ?? null;
    return view({ items, primary });
  }
  get objectSelection() { return view(this.#selection); }
  #selectable(ref: SelectionRef): boolean {
    if (!ref || typeof ref.id !== "string" || !ref.id) return false;
    if (this.#networkScope && ref.kind !== "resource") {
      try { return this.#networkScope.valid() && this.#networkScope.contains(ref); } catch { return false; }
    }
    const stage = this.activeStage.record;
    if (ref.kind === "node") return stage.nodes.some(node => node.id === ref.id);
    if (ref.kind === "edge") return stage.edges.some(edge => edge.id === ref.id);
    const document = this.graph.snapshot().document;
    if (ref.kind === "resource") return document.resources.some(resource => resource.id === ref.id);
    if (ref.kind === "frame") {
      const metadata = document.uiMetadata as { frames?: { id?: string; stageId?: string }[] } | undefined;
      return Array.isArray(metadata?.frames) && metadata.frames.some(frame => frame && frame.id === ref.id && frame.stageId === stage.id);
    }
    return false;
  }
  select(items: string[], primary?: string | null): Result<void> {
    return this.selectObjects(items.map(id => ({ kind: "node", id })), primary === undefined ? undefined : primary === null ? null : { kind: "node", id: primary });
  }
  selectObjects(items: SelectionRef[], primary?: SelectionRef | null): Result<void> {
    try {
      if (this.#disposed) fail("CONTEXT_CLOSED", "Context disposed");
      if (
        new Set(items.map(ref => canonical(ref))).size !== items.length ||
        items.some((ref) => !this.#selectable(ref))
      )
        fail("SELECTION", "Invalid selected objects in current Stage");
      const p = primary === undefined ? (items.at(-1) ?? null) : primary;
      if (
        (items.length > 0 && p === null) ||
        (p !== null && !items.some(ref => same(ref, p)))
      )
        fail("SELECTION", "Primary must belong to selected objects");
      this.#selection = copy({ items, primary: p });
      return ok(undefined);
    } catch (e) {
      return failure(e);
    }
  }
  dispose(): Result<void> {
    if (this.graph.busy)
      return failure(
        new ApiError(
          "BUSY",
          "Finish the Graph operation before closing context",
        ),
      );
    this.#unsubscribe();
    this.#disposed = true;
    this.#networkScope = null;
    this.#selection = { items: [], primary: null };
    return ok(undefined);
  }
}
export class Editor {
  #contexts = new Map<string, EditorContext>();
  get contexts(): EditorContext[] {
    return freeze([...this.#contexts.values()]);
  }
  open(graph: Graph): EditorContext {
    const c = new EditorContext(graph);
    this.#contexts.set(c.id, c);
    return c;
  }
  close(id: string): Result<void> {
    const c = this.#contexts.get(id);
    if (!c) return failure(new ApiError("MISSING_CONTEXT", "Context missing"));
    const r = c.dispose();
    if (!r.ok) return r;
    this.#contexts.delete(id);
    return ok(undefined);
  }
}
export class CanvasView {
  readonly context: EditorContext;
  #camera = { x: 0, y: 0, zoom: 1 };
  constructor(context: EditorContext) {
    this.context = context;
    Object.freeze(this);
  }
  get camera() {
    return view(this.#camera);
  }
  setCamera(camera: { x: number; y: number; zoom: number }): Result<void> {
    if (!Object.values(camera).every(Number.isFinite) || camera.zoom <= 0)
      return failure(new ApiError("CAMERA", "Invalid camera"));
    this.#camera = copy(camera);
    return ok(undefined);
  }
}
