import type {
  CanonicalGraphDocument,
  NodeDocument,
  NetworkDocument,
  PortSnapshot,
  EdgeDocument,
  PreservedPayload,
} from "../sdk/document.ts";
import type {
  NodeTypeRef,
  Json,
  ContractIssue,
  GraphKindRef,
} from "../sdk/public-surface.ts";
import type {
  DefinitionSet,
  GraphSnapshot,
  NodeDefinition,
  ParameterSpec,
} from "../sdk/editing.ts";
import {
  demand,
  detached,
  equal,
  plain,
  exact,
  Signal,
  issue,
} from "../sdk/kernel.ts";
import type { IdentitySource } from "../sdk/kernel.ts";
import type { TypeSystem } from "../sdk/editing.ts";
export interface Operation {
  readonly token: object;
  readonly label: string;
}
type Entry = {
  before: CanonicalGraphDocument;
  after: CanonicalGraphDocument;
  label: string;
};
function findNetwork(doc: CanonicalGraphDocument, id: string): NetworkDocument {
  const n = doc.graph.stages.find((s) => s.network.id === id)?.network;
  demand(n, "NETWORK_MISSING");
  return n;
}
function findNode(
  doc: CanonicalGraphDocument,
  network: string,
  id: string,
): NodeDocument {
  const n = findNetwork(doc, network).nodes.find((x) => x.id === id);
  demand(n, "NODE_MISSING");
  return n;
}
function schema(
  def: NodeDefinition,
  state: Json,
  types: TypeSystem,
): PortSnapshot[] {
  const result = structuredClone([...def.ports(detached(state))]);
  plain(result);
  const keys = new Set<string>();
  for (const p of result) {
    demand(
      p.key &&
        ["input", "output"].includes(p.direction) &&
        p.type &&
        !keys.has(p.direction + ":" + p.key),
      "PORT_SCHEMA",
    );
    keys.add(p.direction + ":" + p.key);
    demand(types.resolve(p.type), "TYPE_UNKNOWN");
    if (p.defaultValue !== undefined)
      demand(types.validValue(p.type, p.defaultValue), "PORT_DEFAULT");
  }
  return result;
}
function cycle(network: NetworkDocument): boolean {
  const visiting = new Set<string>(),
    done = new Set<string>();
  const walk = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (done.has(id)) return false;
    visiting.add(id);
    for (const e of network.edges.filter(
      (e) => !e.invalid && e.from.nodeId === id,
    ))
      if (walk(e.to.nodeId)) return true;
    visiting.delete(id);
    done.add(id);
    return false;
  };
  return network.nodes.some((n) => walk(n.id));
}
export class Graph {
  #document: CanonicalGraphDocument;
  #revision = 0;
  #live = true;
  #writing = false;
  #publishing = false;
  #operation: { handle: Operation; before: CanonicalGraphDocument } | null =
    null;
  #undo: Entry[] = [];
  #redo: Entry[] = [];
  #project = new Signal<GraphSnapshot>();
  #changes = new Signal<GraphSnapshot>();
  #operationEnd = new Signal<void>();
  #diagnostics: readonly ContractIssue[] = [];
  readonly loadId: string;
  constructor(
    document: CanonicalGraphDocument,
    private readonly definitions: DefinitionSet,
    private readonly identity: IdentitySource,
  ) {
    plain(document);
    this.#document = detached(document);
    this.loadId = identity.next();
    this.#diagnostics = this.validate(this.#document);
  }
  static create(
    kindRef: GraphKindRef,
    definitions: DefinitionSet,
    identity: IdentitySource,
    name = "Untitled shader",
  ): Graph {
    const kind = definitions.kind(kindRef);
    demand(kind, "KIND_MISSING");
    const document: CanonicalGraphDocument = {
      format: "grape.document",
      formatVersion: { major: 2, minor: 0 },
      graph: {
        id: identity.next(),
        name,
        kind: { ...kindRef },
        kindSettings: structuredClone(kind.defaultSettings),
        modules: definitions.pins.map((x) => ({ ...x })),
        stages: [],
        resources: [],
        losses: [],
        recovery: [],
        extensions: {},
      },
    };
    for (const slot of kind.stages) {
      const network: NetworkDocument = {
        id: identity.next(),
        nodes: [],
        edges: [],
        extensions: {},
      };
      if (slot.defaultImplementation === "network")
        for (const boundary of slot.boundaries) {
          const def = definitions.node(boundary.nodeType);
          demand(def, "BOUNDARY_MISSING");
          network.nodes.push(
            Graph.makeNode(
              def,
              identity,
              boundary.initialState,
              [650, 180],
              network,
              definitions.types,
            ),
          );
        }
      document.graph.stages.push({
        id: identity.next(),
        key: slot.key,
        stageKindId: slot.stageKindId,
        implementation: slot.defaultImplementation,
        network,
        extensions: {},
      });
    }
    return new Graph(document, definitions, identity);
  }
  private static makeNode(
    def: NodeDefinition,
    identity: IdentitySource,
    state: Json,
    position: [number, number],
    network: NetworkDocument,
    types: TypeSystem,
  ): NodeDocument {
    plain(state);
    demand(
      position.length === 2 && position.every(Number.isFinite),
      "POSITION",
    );
    demand(
      !def.stateCodec
        .validate(detached(state))
        .some((x) => x.severity === "error"),
      "NODE_STATE",
    );
    const ports = schema(def, state, types);
    const base = def.presentation.label.fallback;
    let name = base,
      index = 2;
    while (network.nodes.some((x) => x.name === name))
      name = base + " " + index++;
    return {
      id: identity.next(),
      name,
      type: { ...def.ref },
      state: structuredClone(state),
      inputValues: Object.fromEntries(
        ports
          .filter(
            (p) => p.direction === "input" && p.defaultValue !== undefined,
          )
          .map((p) => [p.key, structuredClone(p.defaultValue!)]),
      ),
      ports,
      references: [],
      referencesComplete: true,
      position: [...position],
      extensions: {},
    };
  }
  capture(): GraphSnapshot {
    demand(this.#live, "GRAPH_DISPOSED");
    return detached({
      document: this.#document,
      loadId: this.loadId,
      revision: this.#revision,
      diagnostics: this.#diagnostics,
    });
  }
  get busy(): boolean {
    return this.#operation !== null;
  }
  get canUndo(): boolean {
    return !this.busy && this.#undo.length > 0;
  }
  get canRedo(): boolean {
    return !this.busy && this.#redo.length > 0;
  }
  get historyLength(): number {
    return this.#undo.length;
  }
  get revision(): number {
    return this.#revision;
  }
  subscribe(fn: (s: GraphSnapshot) => void): () => void {
    return this.#changes.subscribe(fn);
  }
  subscribeProjection(fn: (s: GraphSnapshot) => void): () => void {
    return this.#project.subscribe(fn);
  }
  onOperationEnd(fn: () => void): () => void {
    return this.#operationEnd.subscribe(fn);
  }
  get observerErrors(): readonly unknown[] {
    return [...this.#project.errors, ...this.#changes.errors];
  }
  private guard(op?: Operation): void {
    demand(this.#live, "GRAPH_DISPOSED");
    demand(!this.#publishing && !this.#writing, "REENTRANT_WRITE");
    demand(
      op ? this.#operation?.handle === op : !this.#operation,
      "HISTORY_BUSY",
    );
  }
  begin(label: string): Operation {
    this.guard();
    const handle = Object.freeze({ token: {}, label });
    this.#operation = { handle, before: this.#document };
    return handle;
  }
  commit(op: Operation): void {
    this.guard(op);
    const current = this.#operation!;
    this.#operation = null;
    if (!equal(current.before, this.#document)) {
      this.#undo.push({
        before: current.before,
        after: this.#document,
        label: op.label,
      });
      this.#redo = [];
    }
    this.#operationEnd.emit();
  }
  cancel(op: Operation): void {
    this.guard(op);
    const before = this.#operation!.before;
    this.#operation = null;
    if (!equal(before, this.#document)) this.publish(before);
    this.#operationEnd.emit();
  }
  undo(): void {
    this.guard();
    const e = this.#undo.pop();
    if (!e) return;
    this.#redo.push(e);
    this.publish(e.before);
    this.#operationEnd.emit();
  }
  redo(): void {
    this.guard();
    const e = this.#redo.pop();
    if (!e) return;
    this.#undo.push(e);
    this.publish(e.after);
    this.#operationEnd.emit();
  }
  dispose(): void {
    this.guard();
    this.#live = false;
    this.#project.clear();
    this.#changes.clear();
    this.#operationEnd.clear();
  }
  private publish(
    document: CanonicalGraphDocument,
    diagnostics = this.validate(document),
  ): void {
    this.#document = detached(document);
    this.#diagnostics = diagnostics;
    this.#revision++;
    this.#publishing = true;
    try {
      const s = this.capture();
      this.#project.emit(s);
      this.#changes.emit(s);
    } finally {
      this.#publishing = false;
    }
  }
  change(
    label: string,
    callback: (draft: Draft) => unknown,
    op?: Operation,
  ): void {
    this.guard(op);
    const before = this.#document,
      candidate = structuredClone(before);
    let diagnostics: readonly ContractIssue[] = [];
    this.#writing = true;
    const draft = new Draft(
      candidate,
      this.definitions,
      this.identity,
      (def, state, pos, network) =>
        Graph.makeNode(
          def,
          this.identity,
          state,
          pos,
          network,
          this.definitions.types,
        ),
    );
    try {
      const result = callback(draft);
      demand(
        !result ||
          (typeof result !== "object" && typeof result !== "function") ||
          !("then" in result),
        "ASYNC_DRAFT",
      );
      draft.finish();
      plain(candidate);
      this.reconcile(before, candidate);
      diagnostics = this.validate(candidate);
    } finally {
      draft.revoke();
      this.#writing = false;
    }
    if (equal(before, candidate)) return;
    if (!op) {
      this.#undo.push({ before, after: detached(candidate), label });
      this.#redo = [];
    }
    this.publish(candidate, diagnostics);
    if (!op) this.#operationEnd.emit();
  }
  private reconcile(
    before: CanonicalGraphDocument,
    after: CanonicalGraphDocument,
  ): void {
    const preserve = (payload: PreservedPayload, code: string) =>
      after.graph.losses.push({
        schema: "grape.loss",
        version: 1,
        id: this.identity.next(),
        code,
        reason: "Interface change removed authored data.",
        payload: structuredClone(payload),
        extensions: {},
      });
    for (const stage of after.graph.stages) {
      const network = stage.network,
        oldNetwork = before.graph.stages.find(
          (s) => s.network.id === network.id,
        )?.network;
      for (const node of network.nodes) {
        const def = this.definitions.node(node.type);
        if (!def) continue;
        const old = oldNetwork?.nodes.find((n) => n.id === node.id);
        if (
          old &&
          equal(old.state, node.state) &&
          equal(old.inputValues, node.inputValues)
        )
          continue;
        demand(
          !def.stateCodec
            .validate(detached(node.state))
            .some((x) => x.severity === "error"),
          "NODE_STATE",
        );
        const next = schema(def, node.state, this.definitions.types);
        for (const [key, value] of Object.entries(node.inputValues)) {
          const p = next.find((p) => p.direction === "input" && p.key === key);
          if (!p || !this.definitions.types.validValue(p.type, value)) {
            const previous = old?.ports.find(
              (p) => p.direction === "input" && p.key === key,
            );
            if (previous)
              preserve(
                {
                  kind: "input-value",
                  networkId: network.id,
                  nodeId: node.id,
                  port: previous,
                  value,
                },
                "INPUT_REMOVED",
              );
            delete node.inputValues[key];
          }
        }
        for (const p of next)
          if (
            p.direction === "input" &&
            p.defaultValue !== undefined &&
            !Object.hasOwn(node.inputValues, p.key)
          )
            node.inputValues[p.key] = structuredClone(p.defaultValue);
        node.ports = next;
      }
      for (const edge of [...network.edges]) {
        const from = network.nodes.find((n) => n.id === edge.from.nodeId),
          to = network.nodes.find((n) => n.id === edge.to.nodeId);
        const source = from?.ports.find(
            (p) => p.key === edge.from.portKey && p.direction === "output",
          ),
          target = to?.ports.find(
            (p) => p.key === edge.to.portKey && p.direction === "input",
          );
        const old = oldNetwork?.edges.find((e) => e.id === edge.id);
        const oldFrom = oldNetwork?.nodes.find(
            (n) => n.id === edge.from.nodeId,
          ),
          oldTo = oldNetwork?.nodes.find((n) => n.id === edge.to.nodeId);
        if (
          old &&
          equal(oldFrom?.ports, from?.ports) &&
          equal(oldTo?.ports, to?.ports)
        )
          continue; // Hydration errors are never silently repaired by unrelated edits.
        if (
          source &&
          target &&
          this.definitions.types.planValid(edge.adaptation, source, target)
        ) {
          delete edge.invalid;
          continue;
        }
        if (!old) continue; // Explicit connection commands already validated admission.
        const owner = this.definitions.node(to?.type ?? from!.type);
        if (owner?.invalidEdgePolicy === "preserve")
          edge.invalid = {
            code: "EDGE_INVALID",
            reason: "The stored connection no longer matches the interface.",
          };
        else {
          network.edges.splice(network.edges.indexOf(edge), 1);
          preserve(
            { kind: "edge", networkId: network.id, edge: old },
            "EDGE_DETACHED",
          );
        }
      }
    }
  }
  private validate(document: CanonicalGraphDocument): readonly ContractIssue[] {
    const out: ContractIssue[] = [];
    const g = document.graph;
    const kind = this.definitions.kind(g.kind);
    for (const pin of g.modules)
      if (!this.definitions.module(pin))
        out.push(issue("MISSING_MODULE", "Exact module is unavailable."));
    if (!kind)
      out.push(issue("KIND_MISSING", "Exact graph kind is unavailable."));
    else {
      const slots = new Set<string>();
      for (const stage of g.stages) {
        demand(!slots.has(stage.key), "DUPLICATE_IDENTITY");
        if (!kind.stages.some((slot) => slot.key === stage.key))
          out.push(
            issue("STAGE_TOPOLOGY", "Unexpected or duplicate stage slot.", {
              stageId: stage.id,
            }),
          );
        slots.add(stage.key);
      }
      try {
        out.push(...kind.settingsCodec.validate(detached(g.kindSettings)));
      } catch {
        out.push(issue("KIND_CODEC", "Graph kind validation failed."));
      }
      for (const slot of kind.stages) {
        const stage = g.stages.find((s) => s.key === slot.key);
        if (
          !stage ||
          stage.stageKindId !== slot.stageKindId ||
          !slot.implementations.includes(stage.implementation)
        ) {
          out.push(
            issue(
              "STAGE_TOPOLOGY",
              "Stage topology does not match its definition.",
            ),
          );
          continue;
        }
        if (stage.implementation === "network")
          for (const boundary of slot.boundaries.filter((x) => x.required)) {
            if (
              !stage.network.nodes.some(
                (n) =>
                  exact(n.type, boundary.nodeType) &&
                  n.type.typeId === boundary.nodeType.typeId,
              )
            )
              out.push(
                issue(
                  "BOUNDARY_REQUIRED",
                  "A required stage boundary is missing.",
                ),
              );
          }
      }
    }
    const stageIds = new Set<string>(),
      networkIds = new Set<string>();
    for (const stage of g.stages) {
      demand(
        !stageIds.has(stage.id) && !networkIds.has(stage.network.id),
        "DUPLICATE_IDENTITY",
      );
      stageIds.add(stage.id);
      networkIds.add(stage.network.id);
      if (!this.definitions.stage(stage.stageKindId))
        out.push(issue("STAGE_UNKNOWN", "Stage definition is unavailable."));
      const network = stage.network,
        names = new Set<string>(),
        ids = new Set<string>();
      if (
        stage.implementation === "profile-default" &&
        (network.nodes.length || network.edges.length)
      )
        out.push(
          issue(
            "DEFAULT_STAGE_CONTENT",
            "Default stage cannot execute network content.",
          ),
        );
      for (const node of network.nodes) {
        demand(!ids.has(node.id) && !names.has(node.name), "DUPLICATE_NODE");
        ids.add(node.id);
        names.add(node.name);
        const subject = { graphId: g.id, stageId: stage.id, nodeId: node.id };
        const def = this.definitions.node(node.type);
        if (!def) {
          out.push(
            issue(
              "NODE_MISSING",
              "Exact node definition is unavailable.",
              subject,
            ),
          );
          continue;
        }
        try {
          out.push(
            ...def.stateCodec
              .validate(detached(node.state))
              .map((x) => ({ ...x, subject })),
          );
          if (
            !equal(schema(def, node.state, this.definitions.types), node.ports)
          )
            out.push(
              issue(
                "INTERFACE_MISMATCH",
                "Stored interface does not match the exact definition.",
                subject,
              ),
            );
          out.push(
            ...def.validate(detached(node)).map((x) => ({ ...x, subject })),
          );
        } catch {
          out.push(
            issue("MODULE_CALLBACK", "Module validation failed.", subject),
          );
        }
        if (
          !def.eligibility.stageKindIds.includes(stage.stageKindId) ||
          (def.eligibility.graphKindIds &&
            !def.eligibility.graphKindIds.includes(g.kind.kindId))
        )
          out.push(
            issue(
              "NODE_ELIGIBILITY",
              "Node is not eligible for this stage.",
              subject,
            ),
          );
        for (const p of node.ports.filter((x) => x.direction === "input")) {
          const linked = network.edges.some(
            (e) =>
              !e.invalid && e.to.nodeId === node.id && e.to.portKey === p.key,
          );
          const value = node.inputValues[p.key];
          if (!linked && (p.supply === "required" || value === undefined))
            out.push(
              issue("INPUT_REQUIRED", "Connect the required input.", {
                ...subject,
                portKey: p.key,
              }),
            );
          if (
            value !== undefined &&
            !this.definitions.types.validValue(p.type, value)
          )
            out.push(
              issue("INPUT_VALUE", "Invalid shader input value.", {
                ...subject,
                portKey: p.key,
              }),
            );
        }
      }
      const edgeIds = new Set<string>(),
        incoming = new Set<string>();
      for (const e of network.edges) {
        demand(!edgeIds.has(e.id), "DUPLICATE_EDGE");
        edgeIds.add(e.id);
        const targetKey = e.to.nodeId + ":" + e.to.portKey;
        if (incoming.has(targetKey))
          out.push(issue("INPUT_OCCUPIED", "Multiple edges supply one input."));
        incoming.add(targetKey);
        const a = network.nodes
          .find((n) => n.id === e.from.nodeId)
          ?.ports.find(
            (p) => p.key === e.from.portKey && p.direction === "output",
          );
        const b = network.nodes
          .find((n) => n.id === e.to.nodeId)
          ?.ports.find(
            (p) => p.key === e.to.portKey && p.direction === "input",
          );
        if (
          e.invalid ||
          !a ||
          !b ||
          !this.definitions.types.planValid(e.adaptation, a, b)
        )
          out.push(
            issue("EDGE_INVALID", "Stored connection is not executable.", {
              edgeId: e.id,
              stageId: stage.id,
            }),
          );
      }
      if (cycle(network))
        out.push(issue("CYCLE", "Network has a cycle.", { stageId: stage.id }));
    }
    for (const resource of g.resources) {
      const def = this.definitions.resource(resource.type);
      if (!def)
        out.push(
          issue("RESOURCE_MISSING", "Exact resource codec is unavailable.", {
            resourceId: resource.id,
          }),
        );
      else
        try {
          out.push(...def.codec.validate(detached(resource.data)));
        } catch {
          out.push(
            issue("RESOURCE_CODEC", "Resource validation failed.", {
              resourceId: resource.id,
            }),
          );
        }
    }
    for (const loss of g.losses)
      out.push(issue(loss.code, loss.reason, { lossId: loss.id }, "warning"));
    for (const e of [...g.losses, ...g.recovery])
      if (e.payload.kind === "module") {
        const p = e.payload,
          codec = this.definitions.preservation(
            p.owner,
            p.codecId,
            p.codecVersion,
          );
        if (!codec)
          out.push(
            issue(
              "PRESERVATION_CODEC_MISSING",
              "Restoration is unavailable.",
              undefined,
              "warning",
            ),
          );
        else
          try {
            out.push(
              ...codec
                .validate(detached(p.data))
                .map((x) => ({ ...x, severity: "warning" as const })),
            );
          } catch {
            out.push(
              issue(
                "PRESERVATION_CODEC",
                "Preservation validation failed.",
                undefined,
                "warning",
              ),
            );
          }
      }
    return detached(out);
  }
}
export class Draft {
  #live = true;
  #poison = false;
  constructor(
    private readonly document: CanonicalGraphDocument,
    private readonly definitions: DefinitionSet,
    private readonly ids: IdentitySource,
    private readonly make: (
      def: NodeDefinition,
      state: Json,
      pos: [number, number],
      network: NetworkDocument,
    ) => NodeDocument,
  ) {}
  private run<T>(fn: () => T): T {
    demand(this.#live, "DRAFT_EXPIRED");
    try {
      return fn();
    } catch (error) {
      this.#poison = true;
      throw error;
    }
  }
  finish(): void {
    demand(!this.#poison, "POISONED_BATCH");
  }
  revoke(): void {
    this.#live = false;
  }
  add(networkId: string, ref: NodeTypeRef, position: [number, number]): string {
    return this.run(() => {
      const network = findNetwork(this.document, networkId),
        stage = this.document.graph.stages.find(
          (s) => s.network.id === networkId,
        )!;
      const def = this.definitions.node(ref);
      demand(def && def.role === "operation", "NODE_TYPE");
      demand(
        stage.implementation === "network" &&
          def.eligibility.stageKindIds.includes(stage.stageKindId) &&
          (!def.eligibility.graphKindIds ||
            def.eligibility.graphKindIds.includes(
              this.document.graph.kind.kindId,
            )),
        "NODE_ELIGIBILITY",
      );
      const node = this.make(def, def.initialize(), position, network);
      network.nodes.push(node);
      return node.id;
    });
  }
  move(network: string, id: string, position: [number, number]): void {
    this.run(() => {
      demand(
        position.length === 2 && position.every(Number.isFinite),
        "POSITION",
      );
      findNode(this.document, network, id).position = [...position];
    });
  }
  rename(network: string, id: string, name: string): void {
    this.run(() => {
      demand(
        name.trim() &&
          !findNetwork(this.document, network).nodes.some(
            (n) => n.name === name && n.id !== id,
          ),
        "NODE_NAME",
      );
      findNode(this.document, network, id).name = name;
    });
  }
  remove(networkId: string, id: string): void {
    this.run(() => {
      const network = findNetwork(this.document, networkId),
        node = findNode(this.document, networkId, id),
        kind = this.definitions.kind(this.document.graph.kind),
        stage = this.document.graph.stages.find(
          (s) => s.network.id === networkId,
        )!;
      demand(
        !kind?.stages
          .find((s) => s.key === stage.key)
          ?.boundaries.some(
            (b) =>
              !b.removable &&
              b.nodeType.typeId === node.type.typeId &&
              exact(b.nodeType, node.type),
          ),
        "BOUNDARY_PROTECTED",
      );
      network.nodes.splice(network.nodes.indexOf(node), 1);
      network.edges = network.edges.filter(
        (e) => e.from.nodeId !== id && e.to.nodeId !== id,
      );
    });
  }
  parameter(network: string, id: string, key: string, value: Json): void {
    this.run(() => {
      plain(value);
      const node = findNode(this.document, network, id),
        def = this.definitions.node(node.type);
      demand(def, "NODE_MISSING");
      const spec = def
        .parameters(detached(node.state))
        .find((p) => p.key === key);
      demand(spec, "PARAMETER_MISSING");
      if (spec.type === "number")
        demand(
          typeof value === "number" && Number.isFinite(Math.fround(value)),
          "PARAMETER_VALUE",
        );
      else if (spec.type === "choice")
        demand(
          spec.choices?.some((v) => equal(v, value)),
          "PARAMETER_VALUE",
        );
      if (spec.target === "state") {
        demand(
          node.state &&
            typeof node.state === "object" &&
            !Array.isArray(node.state),
          "STATE_RECORD",
        );
        node.state[key] = value;
      } else {
        demand(
          !findNetwork(this.document, network).edges.some(
            (e) => !e.invalid && e.to.nodeId === id && e.to.portKey === key,
          ),
          "INPUT_CONNECTED",
        );
        const port = node.ports.find(
          (p) => p.direction === "input" && p.key === key,
        );
        demand(
          port && this.definitions.types.validValue(port.type, value),
          "PARAMETER_VALUE",
        );
        node.inputValues[key] = value;
      }
    });
  }
  connect(
    networkId: string,
    from: EdgeDocument["from"],
    to: EdgeDocument["to"],
    replace = false,
  ): void {
    this.run(() => {
      const network = findNetwork(this.document, networkId),
        a = findNode(this.document, networkId, from.nodeId).ports.find(
          (p) => p.key === from.portKey && p.direction === "output",
        ),
        b = findNode(this.document, networkId, to.nodeId).ports.find(
          (p) => p.key === to.portKey && p.direction === "input",
        );
      demand(a && b, "PORT_DIRECTION");
      const old = network.edges.find(
        (e) => e.to.nodeId === to.nodeId && e.to.portKey === to.portKey,
      );
      demand(!old || replace, "INPUT_OCCUPIED");
      const plan = this.definitions.types.adaptation(a, b);
      if (old) network.edges.splice(network.edges.indexOf(old), 1);
      network.edges.push({
        id: this.ids.next(),
        from: { ...from },
        to: { ...to },
        adaptation: plan,
        extensions: {},
      });
      demand(!cycle(network), "CYCLE");
    });
  }
  disconnect(networkId: string, edgeId: string): void {
    this.run(() => {
      const n = findNetwork(this.document, networkId),
        i = n.edges.findIndex((e) => e.id === edgeId);
      demand(i >= 0, "EDGE_MISSING");
      n.edges.splice(i, 1);
    });
  }
}
