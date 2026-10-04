import {
  dependencies,
  closure,
  pastePacket,
  nodeReferences,
} from "./transfer.ts";
import type { ClipboardPacket } from "./transfer.ts";
import { personalSources } from "./library.ts";
import { parseType, typeReferences, remapType } from "../sdk/type-tokens.ts";
import type { StructureData, SourceData } from "../sdk/networks.ts";
import {
  networks,
  materializeDefault,
  networkAt,
  modelContext,
  asNetwork,
  callResource,
  typeSystem,
  definitionStages,
  frames,
  resourceReferences,
} from "../sdk/networks.ts";
import type { NetworkData } from "../sdk/networks.ts";
import { validateDocumentStructure } from "../sdk/document-validation.ts";
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
import { analyzeConstants } from "../definitions/constant-analysis.ts";
import type { GLSLProfile } from "../sdk/public-surface.ts";
export interface Operation {
  readonly token: object;
  readonly label: string;
}
type Entry = {
  before: CanonicalGraphDocument;
  after: CanonicalGraphDocument;
  label: string;
};
function findNetwork(
  doc: CanonicalGraphDocument,
  id: string,
  defs: DefinitionSet,
): NetworkDocument {
  return networkAt(doc, defs, id);
}
function findNode(
  doc: CanonicalGraphDocument,
  network: string,
  id: string,
  defs: DefinitionSet,
): NodeDocument {
  const n = findNetwork(doc, network, defs).nodes.find((x) => x.id === id);
  demand(n, "NODE_MISSING");
  return n;
}
function schema(
  def: NodeDefinition,
  state: Json,
  types: TypeSystem,
  context?: import("../sdk/editing.ts").ModelContext,
): PortSnapshot[] {
  const result = structuredClone([...def.ports(detached(state), context)]);
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
    if (p.defaultValue !== undefined) {
      p.defaultValue = materializeDefault(p.type, p.defaultValue, types);
      demand(types.validValue(p.type, p.defaultValue), "PORT_DEFAULT");
    }
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
  #epoch = 0;
  get epoch() {
    return this.#epoch;
  }
  resolveNetwork(id: string) {
    return detached(networkAt(this.#document, this.definitions, id));
  }
  get definitionSet() {
    return this.definitions;
  }
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
      formatVersion: { major: 2, minor: 1 },
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
    context?: import("../sdk/editing.ts").ModelContext,
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
    const ports = schema(def, state, types, context);
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
      references: [...(def.stateReferences?.collect(detached(state)) ?? [])],
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
    this.#epoch++;
    this.publish(e.before);
    this.#operationEnd.emit();
  }
  redo(): void {
    this.guard();
    const e = this.#redo.pop();
    if (!e) return;
    this.#undo.push(e);
    this.#epoch++;
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
      this.loadId,
      (def, state, pos, network) =>
        Graph.makeNode(
          def,
          this.identity,
          state,
          pos,
          network,
          typeSystem(candidate, this.definitions),
          modelContext(candidate, this.definitions),
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
      if (draft.replacing) validateDocumentStructure(candidate);
      else this.reconcile(before, candidate);
      for (const r of candidate.graph.resources) {
        const prior = before.graph.resources.find((x) => x.id === r.id);
        if (
          this.definitions.resource(r.type)?.model &&
          (!prior ||
            !equal(
              dependencies(prior, this.definitions),
              dependencies(r, this.definitions),
            ))
        ) {
          closure(candidate.graph.resources, [r.id], this.definitions);
          if (asNetwork(r, this.definitions))
            demand(
              definitionStages(candidate, this.definitions, r.id).length,
              "SUBGRAPH_STAGE",
            );
        }
      }
      if (draft.strict) validateDocumentStructure(candidate);
      diagnostics = this.validate(candidate);
      if (draft.replacing || draft.strict)
        demand(
          !diagnostics.some((d) => d.severity === "error"),
          "IMPORT_ERRORS",
        );
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
    let order: string[] = [];
    try {
      order = closure(
        after.graph.resources,
        after.graph.resources
          .filter((r) => this.definitions.resource(r.type)?.model)
          .map((r) => r.id),
        this.definitions,
      ).map((r) => r.id);
    } catch {}
    const rows = networks(after, this.definitions).sort(
      (a, b) =>
        (a.resource ? order.indexOf(a.resource.id) : -1) -
        (b.resource ? order.indexOf(b.resource.id) : -1),
    );
    rows.sort((a, b) => Number(!a.resource) - Number(!b.resource));
    for (const { network } of rows) {
      const oldNetwork = networks(before, this.definitions).find(
        (n) => n.network.id === network.id,
      )?.network;
      for (const node of network.nodes) {
        const def = this.definitions.node(node.type);
        if (!def) continue;
        const old = oldNetwork?.nodes.find((n) => n.id === node.id);
        if (
          old &&
          equal(old.state, node.state) &&
          equal(old.inputValues, node.inputValues) &&
          equal(before.graph.resources, after.graph.resources) &&
          !after.graph.resources.some(
            (r) => this.definitions.resource(r.type)?.resolveExtent,
          ) &&
          !node.ports.some((p) => typeReferences(p.type).length > 0)
        )
          continue;
        demand(
          !def.stateCodec
            .validate(detached(node.state))
            .some((x) => x.severity === "error"),
          "NODE_STATE",
        );
        const next = schema(
          def,
          node.state,
          typeSystem(after, this.definitions),
          modelContext(after, this.definitions),
        );
        if (def.stateReferences) {
          const current = def.stateReferences.collect(detached(node.state)),
            owned = new Set(
              [
                ...current,
                ...(old
                  ? def.stateReferences.collect(detached(old.state))
                  : []),
              ].map((r) => r.slot),
            );
          node.references = [
            ...node.references.filter((r) => !owned.has(r.slot)),
            ...structuredClone(current),
          ];
        }
        for (const [key, value] of Object.entries(node.inputValues)) {
          const p = next.find((p) => p.direction === "input" && p.key === key);
          const priorPort = old?.ports.find(
            (p) => p.direction === "input" && p.key === key,
          );
          if (
            p &&
            priorPort &&
            ["call", "structure", "network-output"].includes(
              def.modelRole ?? "",
            )
          ) {
            if (
              !def.isInputOverridden?.(node.state, key) &&
              equal(value, priorPort.defaultValue) &&
              p.defaultValue !== undefined &&
              !equal(priorPort.defaultValue, p.defaultValue)
            ) {
              node.inputValues[key] = structuredClone(p.defaultValue);
              continue;
            }
            if (
              !typeSystem(after, this.definitions).validValue(p.type, value)
            ) {
              try {
                const reshaped = typeSystem(after, this.definitions).reshape(
                  p.type,
                  value,
                );
                preserve(
                  {
                    kind: "input-value",
                    networkId: network.id,
                    nodeId: node.id,
                    port: priorPort,
                    value,
                  },
                  "INPUT_RESHAPED",
                );
                node.inputValues[key] = reshaped;
                continue;
              } catch {}
            }
          }
          if (
            !p ||
            !typeSystem(after, this.definitions).validValue(p.type, value)
          ) {
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
        if (!old) continue; // Fresh connections are validated by commands; hydrated plans must remain evidence.
        if (source && target) {
          try {
            demand(
              this.definitions
                .node(to!.type)
                ?.acceptsInput?.(detached(source), detached(target)) !== false,
              "INPUT_TYPE_POLICY",
            );
            const types = typeSystem(after, this.definitions);
            if (!types.planValid(edge.adaptation, source, target))
              edge.adaptation = types.adaptation(source, target);
            delete edge.invalid;
            continue;
          } catch {}
        }
        if (!old) continue; // Explicit connection commands already validated admission.
        const preserved = [from, to].some(
          (n) =>
            n &&
            this.definitions.node(n.type)?.invalidEdgePolicy === "preserve",
        );
        if (preserved)
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
    const checkReferences = (
      references: readonly import("../sdk/document.ts").DocumentReference[],
      networkId?: string,
    ) => {
      for (const ref of references) {
        const present =
          ref.kind === "resource"
            ? g.resources.some((r) => r.id === ref.targetId)
            : networks(document, this.definitions)
                .find((s) => s.network.id === (ref.networkId ?? networkId))
                ?.network.nodes.some((n) => n.id === ref.targetId);
        if (!present)
          out.push(
            issue(
              "REFERENCE_MISSING",
              "Declared reference cannot be resolved: " + ref.slot,
            ),
          );
      }
    };
    for (const stage of networks(document, this.definitions))
      for (const node of stage.network.nodes)
        checkReferences(node.references, stage.network.id);
    for (const resource of g.resources) checkReferences(resource.references);
    for (const resource of g.resources) {
      const def = this.definitions.resource(resource.type);
      try {
        checkReferences(
          def?.stateReferences?.collect(detached(resource.data)) ?? [],
        );
        if (
          def?.resolveExtent &&
          def.resolveExtent(
            detached(resource.data),
            detached(g.resources),
            detached(
              networks(document, this.definitions).map((n) => n.network),
            ),
          ) === undefined
        )
          out.push(
            issue(
              "EXTENT_UNRESOLVED",
              "Array extent dependency is unavailable or invalid.",
              { resourceId: resource.id },
            ),
          );
      } catch {
        out.push(
          issue(
            "RESOURCE_REFERENCES",
            "Owner references could not be resolved.",
          ),
        );
      }
    }
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
    for (const row of networks(document, this.definitions)) {
      demand(
        document.formatVersion.minor >= 1 ||
          row.network.edges.every((e) => e.adaptation.version === 1),
        "EDGE_DOCUMENT_VERSION",
      );
      const stage = g.stages.find((s) => s.id === row.stageId) ?? {
        id: row.stageId,
        network: row.network,
        stageKindId: row.stageKindId,
        implementation: "network",
      };
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
            !equal(
              schema(
                def,
                node.state,
                typeSystem(document, this.definitions),
                modelContext(document, this.definitions),
              ),
              node.ports,
            )
          )
            out.push(
              issue(
                "INTERFACE_MISMATCH",
                "Stored interface does not match the exact definition.",
                subject,
              ),
            );
          out.push(
            ...def
              .validate(
                detached(node),
                modelContext(document, this.definitions),
              )
              .map((x) => ({ ...x, subject })),
          );
        } catch {
          out.push(
            issue("MODULE_CALLBACK", "Module validation failed.", subject),
          );
        }
        const call = callResource(node, this.definitions);
        if (call) {
          const resource = g.resources.find((r) => r.id === call),
            data = resource && asNetwork(resource, this.definitions);
          if (
            !data ||
            !definitionStages(
              document,
              this.definitions,
              resource!.id,
            ).includes(stage.stageKindId)
          )
            out.push(
              issue(
                "SUBGRAPH_STAGE",
                "Definition is not eligible for this stage.",
              ),
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
            !typeSystem(document, this.definitions).validValue(p.type, value)
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
          !typeSystem(document, this.definitions).planValid(
            e.adaptation,
            a,
            b,
          ) ||
          this.definitions
            .node(network.nodes.find((n) => n.id === e.to.nodeId)!.type)
            ?.acceptsInput?.(detached(a), detached(b)) === false
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
    try {
      closure(
        g.resources,
        g.resources
          .filter((r) => this.definitions.resource(r.type)?.model)
          .map((r) => r.id),
        this.definitions,
      );
    } catch (error) {
      out.push(issue("RESOURCE_DEPENDENCY", String(error)));
    }
    for (const resource of g.resources) {
      const def = this.definitions.resource(resource.type);
      const nested = asNetwork(resource, this.definitions);
      if (nested) {
        for (const role of ["network-input", "network-output"]) {
          const boundary = nested.network.nodes.filter(
            (n) => this.definitions.node(n.type)?.modelRole === role,
          );
          if (
            boundary.length !== 1 ||
            (boundary[0].state as { definition: string }).definition !==
              resource.id
          )
            out.push(
              issue(
                "NETWORK_BOUNDARY",
                "Definition must retain its self-owned boundaries.",
              ),
            );
        }
        if (!definitionStages(document, this.definitions, resource.id).length)
          out.push(
            issue("SUBGRAPH_STAGE", "Definition has no admissible stage."),
          );
      }
      if (def?.model === "structure") {
        const data = resource.data as unknown as StructureData;
        for (const f of data.fields ?? [])
          if (!typeSystem(document, this.definitions).resolve(f.type))
            out.push(
              issue("FIELD_TYPE", "Invalid or recursive structure field."),
            );
      }
      if (def?.model === "source") {
        if (!def.sourcePolicy)
          out.push(
            issue(
              "SOURCE_PROVIDER_UNAVAILABLE",
              "Exact source admission provider is unavailable.",
            ),
          );
        else
          out.push(
            ...def.sourcePolicy.validate(
              detached(resource.data),
              Object.freeze({
                phase: "document",
                graphKind: detached(document.graph.kind),
                resources: detached(document.graph.resources),
                types: typeSystem(document, this.definitions),
              }),
            ),
          );
      }
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
    try {
      out.push(...analyzeConstants(document, this.definitions).diagnostics);
    } catch (error) {
      out.push(issue("CONSTANT_ANALYSIS_UNAVAILABLE", String(error)));
    }
    for (const loss of g.losses.filter(
      (l) => l.code === "FUNCTION_CONSTANT_DETACHED",
    ))
      out.push(
        issue(
          loss.code,
          loss.reason,
          {
            lossId: loss.id,
            ...(loss.payload.kind === "edge"
              ? {
                  edgeId: loss.payload.edge.id,
                  nodeId: loss.payload.edge.to.nodeId,
                  portKey: loss.payload.edge.to.portKey,
                }
              : {}),
          },
          "warning",
        ),
      );
    return detached(out);
  }
}
export class Draft {
  #live = true;
  #poison = false;
  #replacing = false;
  strict = false;
  requireValid() {
    this.run(() => {
      this.strict = true;
    });
  }
  get replacing(): boolean {
    return this.#replacing;
  }
  constructor(
    private readonly document: CanonicalGraphDocument,
    private readonly definitions: DefinitionSet,
    private readonly ids: IdentitySource,
    private readonly loadId: string,
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
  replaceDocument(candidate: CanonicalGraphDocument): void {
    this.run(() => {
      validateDocumentStructure(candidate);
      demand(
        equal(candidate.graph.modules, this.document.graph.modules) &&
          equal(candidate.graph.kind, this.document.graph.kind),
        "IMPORT_DEFINITIONS",
      );
      const replacement = structuredClone(candidate);
      replacement.graph.id = this.document.graph.id;
      this.document.graph = replacement.graph;
      this.document.formatVersion = replacement.formatVersion;
      this.#replacing = true;
    });
  }
  add(networkId: string, ref: NodeTypeRef, position: [number, number]): string {
    return this.run(() => {
      this.fork(networkId);
      const network = findNetwork(this.document, networkId, this.definitions),
        stage = this.stage(networkId);
      const def = this.definitions.node(ref);
      demand(def && def.role === "operation", "NODE_TYPE");
      demand(
        stage.implementation === "network" &&
          (stage.key === "nested"
            ? definitionStages(
                this.document,
                this.definitions,
                networks(this.document, this.definitions).find(
                  (r) => r.network.id === networkId,
                )!.resource!.id,
              ).some((id) => def.eligibility.stageKindIds.includes(id))
            : def.eligibility.stageKindIds.includes(stage.stageKindId)) &&
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
      findNode(this.document, network, id, this.definitions).position = [
        ...position,
      ];
    });
  }
  rename(network: string, id: string, name: string): void {
    this.run(() => {
      this.fork(network);
      demand(
        name.trim() &&
          !findNetwork(this.document, network, this.definitions).nodes.some(
            (n) => n.name === name && n.id !== id,
          ),
        "NODE_NAME",
      );
      findNode(this.document, network, id, this.definitions).name = name;
    });
  }
  remove(networkId: string, id: string): void {
    this.run(() => {
      this.fork(networkId);
      const network = findNetwork(this.document, networkId, this.definitions),
        node = findNode(this.document, networkId, id, this.definitions),
        kind = this.definitions.kind(this.document.graph.kind),
        stage = this.stage(networkId);
      demand(
        !["network-input", "network-output"].includes(
          this.definitions.node(node.type)?.modelRole ?? "",
        ),
        "BOUNDARY_PROTECTED",
      );
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
      for (const f of frames(this.document, this.definitions, networkId)) {
        const resource = this.document.graph.resources.find(
          (r) => r.id === f.id,
        )!;
        (
          resource.data as unknown as import("../sdk/networks.ts").FrameData
        ).nodeIds = f.nodeIds.filter((x) => x !== id);
      }
      network.nodes.splice(network.nodes.indexOf(node), 1);
      network.edges = network.edges.filter(
        (e) => e.from.nodeId !== id && e.to.nodeId !== id,
      );
    });
  }
  parameter(network: string, id: string, key: string, value: Json): void {
    this.run(() => {
      this.fork(network);
      plain(value);
      const node = findNode(this.document, network, id, this.definitions),
        def = this.definitions.node(node.type);
      demand(def, "NODE_MISSING");
      const spec = def
        .parameters(
          detached(node.state),
          modelContext(this.document, this.definitions),
        )
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
          !findNetwork(this.document, network, this.definitions).edges.some(
            (e) => !e.invalid && e.to.nodeId === id && e.to.portKey === key,
          ),
          "INPUT_CONNECTED",
        );
        const port = node.ports.find(
          (p) => p.direction === "input" && p.key === key,
        );
        demand(
          port &&
            typeSystem(this.document, this.definitions).validValue(
              port.type,
              value,
            ),
          "PARAMETER_VALUE",
        );
        node.inputValues[key] = value;
        if (def.markInputOverride)
          node.state = def.markInputOverride(detached(node.state), key);
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
      this.fork(networkId);
      const network = findNetwork(this.document, networkId, this.definitions),
        a = findNode(
          this.document,
          networkId,
          from.nodeId,
          this.definitions,
        ).ports.find((p) => p.key === from.portKey && p.direction === "output"),
        b = findNode(
          this.document,
          networkId,
          to.nodeId,
          this.definitions,
        ).ports.find((p) => p.key === to.portKey && p.direction === "input");
      demand(a && b, "PORT_DIRECTION");
      const old = network.edges.find(
        (e) => e.to.nodeId === to.nodeId && e.to.portKey === to.portKey,
      );
      demand(!old || replace, "INPUT_OCCUPIED");
      demand(
        this.definitions
          .node(
            findNode(this.document, networkId, to.nodeId, this.definitions)
              .type,
          )
          ?.acceptsInput?.(detached(a), detached(b)) !== false,
        "INPUT_TYPE_POLICY",
      );
      const plan = typeSystem(this.document, this.definitions).adaptation(a, b);
      if (old) network.edges.splice(network.edges.indexOf(old), 1);
      network.edges.push({
        id: this.ids.next(),
        from: { ...from },
        to: { ...to },
        adaptation: plan,
        extensions: {},
      });
      demand(!cycle(network), "CYCLE");
      if (b.requireConstant) {
        const edge = network.edges.at(-1)!;
        demand(
          analyzeConstants(this.document, this.definitions).edges.get(
            network.id + ":" + edge.id,
          ) === true,
          "CONSTANT_REQUIRED",
        );
      }
    });
  }

  paste(
    networkId: string,
    packet: ClipboardPacket,
    expectedLoadId = this.loadId,
  ): string[] {
    return this.run(() => {
      demand(expectedLoadId === this.loadId, "LOAD_MISMATCH");
      if (packet.network?.nodes?.length === 0)
        return pastePacket(
          this.document,
          this.definitions,
          this.ids,
          this.loadId,
          networkId,
          packet,
        );
      this.fork(networkId);
      const result = pastePacket(
        this.document,
        this.definitions,
        this.ids,
        this.loadId,
        networkId,
        packet,
      );
      if (result.length) this.strict = true;
      return result;
    });
  }
  insertLibrary(
    networkId: string,
    packet: ClipboardPacket,
    key: string,
  ): string[] {
    return this.run(() => {
      this.fork(networkId);
      demand(/^[a-f0-9]{64}$/.test(key), "LIBRARY_IDENTITY");
      const result = pastePacket(
        this.document,
        this.definitions,
        this.ids,
        this.loadId,
        networkId,
        packet,
        {
          key,
          admittedSources: personalSources(packet.resources, this.definitions),
        },
      );
      this.strict = true;
      return result;
    });
  }
  addResource(
    ref: NodeTypeRef,
    data: Json,
    references: import("../sdk/document.ts").DocumentReference[] = [],
  ): string {
    return this.run(() => {
      const def = this.definitions.resource(ref);
      demand(
        def &&
          !def.codec
            .validate(detached(data))
            .some((x) => x.severity === "error"),
        "RESOURCE_STATE",
      );
      const id = this.ids.next();
      this.document.graph.resources.push({
        id,
        type: { ...ref },
        data: structuredClone(data),
        references: structuredClone(references),
        referencesComplete: true,
        extensions: {},
      });
      return id;
    });
  }
  createStructure(
    name: string,
    fields: StructureData["fields"],
    description = "",
  ): string {
    return this.run(() => {
      const def = this.definitions.resourceByModel("structure");
      demand(def, "STRUCTURE_MODULE");
      const id = this.ids.next();
      this.document.graph.resources.push({
        id,
        type: { ...def.ref },
        data: { name: name.trim(), fields, description } as unknown as Json,
        references: [],
        referencesComplete: true,
        extensions: {},
      });
      this.validateStructure(id);
      return id;
    });
  }
  private validateStructure(id: string, previous?: StructureData) {
    const definitions = this.document.graph.resources.filter(
      (r) => this.definitions.resource(r.type)?.model === "structure",
    );
    const current = definitions.find((r) => r.id === id)!
      .data as unknown as StructureData;
    if (!previous) demand(definitions.length <= 64, "STRUCTURE_LIMIT");
    if (!previous || previous.name !== current.name)
      demand(
        !definitions.some(
          (r) =>
            r.id !== id &&
            (r.data as unknown as StructureData).name === current.name,
        ),
        "STRUCTURE_NAME",
      );
    const expands =
      !previous ||
      current.fields.some(
        (f) =>
          !previous.fields.some(
            (old) => old.id === f.id && old.type === f.type,
          ),
      );
    const count = (
      type: string,
      active: readonly string[],
      depth: number,
      authoredArray = false,
    ): number => {
      const t = parseType(type);
      if (t.kind === "array") {
        demand(
          typeof t.extent === "number" && (!authoredArray || t.extent <= 1024),
          "STRUCTURE_ARRAY",
        );
        const n =
          t.extent * count(importType(t.element), active, depth, authoredArray);
        if (expands) demand(n <= 65536, "STRUCTURE_EXPANSION");
        return n;
      }
      if (t.kind === "structure") {
        demand(!active.includes(t.id), "STRUCTURE_RECURSION");
        demand(depth < 16, "STRUCTURE_DEPTH");
        const r = definitions.find((r) => r.id === t.id);
        demand(r, "STRUCTURE_TYPE");
        const codec = this.definitions.resource(r.type)!;
        demand(
          !codec.codec.validate(r.data).some((i) => i.severity === "error"),
          "STRUCTURE_FIELDS",
        );
        const n = (r.data as unknown as StructureData).fields.reduce(
          (sum, f) =>
            sum +
            count(
              f.type,
              [...active, t.id],
              depth + 1,
              t.id === id &&
                (!previous ||
                  !previous.fields.some(
                    (old) => old.id === f.id && old.type === f.type,
                  )),
            ),
          0,
        );
        if (expands) demand(n <= 65536, "STRUCTURE_EXPANSION");
        return n;
      }
      demand(
        typeSystem(this.document, this.definitions).resolve(type) &&
          typeSystem(this.document, this.definitions).resolve(type)!
            .structureField !== false,
        "STRUCTURE_TYPE",
      );
      const matrix = /^glsl.mat([234])(?:x([234]))?$/.exec(type);
      return matrix
        ? Number(matrix[1]) * Number(matrix[2] ?? matrix[1])
        : /^glsl.vec[234]$/.test(type)
          ? Number(type.at(-1))
          : 1;
    };
    const importType = (t: ReturnType<typeof parseType>): string =>
      t.kind === "scalar"
        ? t.id
        : t.kind === "structure"
          ? "struct@" + t.id
          : "array@" + JSON.stringify([importType(t.element), t.extent]);
    count("struct@" + id, [], 0);
    // A shape edit can increase the depth or expansion of every transitive user.
    for (const definition of definitions)
      if (
        definition.id !== id &&
        closure(
          this.document.graph.resources,
          [definition.id],
          this.definitions,
        ).some((r) => r.id === id)
      )
        count("struct@" + definition.id, [], 0);
    closure(this.document.graph.resources, [id], this.definitions);
  }
  editStructure(id: string, data: StructureData): void {
    this.run(() => {
      const r = this.document.graph.resources.find((r) => r.id === id);
      demand(
        r && this.definitions.resource(r.type)?.model === "structure",
        "STRUCTURE_MISSING",
      );
      const previous = structuredClone(r.data) as unknown as StructureData;
      r.data = {
        ...structuredClone(data),
        name: data.name.trim(),
      } as unknown as Json;
      this.validateStructure(id, previous);
    });
  }
  removeResource(id: string): void {
    this.run(() => {
      const r = this.document.graph.resources.find((r) => r.id === id);
      demand(r, "RESOURCE_MISSING");
      demand(
        !this.document.graph.resources.some(
          (x) => x.id !== id && dependencies(x, this.definitions).includes(id),
        ),
        "RESOURCE_IN_USE",
      );
      for (const { network } of networks(this.document, this.definitions))
        for (const n of network.nodes)
          demand(
            ![
              ...n.references,
              ...(this.definitions
                .node(n.type)
                ?.stateReferences?.collect(n.state) ?? []),
            ].some((x) => x.kind === "resource" && x.targetId === id) &&
              !n.ports.some((p) => typeReferences(p.type).includes(id)),
            "RESOURCE_IN_USE",
          );
      this.document.graph.resources.splice(
        this.document.graph.resources.indexOf(r),
        1,
      );
    });
  }
  createSource(
    name: string,
    type: string,
    value: Json,
    clipboard = true,
    binding?: SourceData["binding"],
  ): string {
    return this.run(() => {
      demand(
        !this.document.graph.resources.some(
          (r) =>
            this.definitions.resource(r.type)?.model === "source" &&
            (r.data as unknown as SourceData).name === name,
        ),
        "SOURCE_NAME",
      );
      const def = this.definitions.resourceByModel("source");
      demand(def, "SOURCE_MODULE");
      const data = {
        name,
        type,
        value,
        clipboard,
        ...(binding ? { binding } : {}),
      } as Json;
      demand(def.sourcePolicy, "SOURCE_PROVIDER_UNAVAILABLE");
      const problems = def.sourcePolicy.validate(
        detached(data),
        Object.freeze({
          phase: "construction",
          graphKind: detached(this.document.graph.kind),
          resources: detached(this.document.graph.resources),
          types: typeSystem(this.document, this.definitions),
        }),
      );
      const problem = problems.find((p) => p.severity === "error");
      demand(!problem, problem?.code ?? "SOURCE_VALUE");
      const id = this.ids.next();
      this.document.graph.resources.push({
        id,
        type: { ...def.ref },
        data,
        references: [],
        referencesComplete: true,
        extensions: {},
      });
      return id;
    });
  }
  addReferenceNode(
    networkId: string,
    role: "call" | "source" | "structure" | "field",
    resourceId: string,
    field?: string,
    exactNode?: NodeTypeRef,
  ): string {
    return this.run(() => {
      this.fork(networkId);
      demand(
        role !== "source" ||
          this.document.graph.stages.some((s) => s.network.id === networkId),
        "SOURCE_ADMISSION",
      );
      demand(
        this.stage(networkId).implementation === "network",
        "NODE_ELIGIBILITY",
      );
      const def = exactNode
        ? this.definitions.node(exactNode)
        : this.definitions.nodeByRole(role);
      demand(def && def.modelRole === role, "NODE_TYPE");
      const key =
        role === "call"
          ? "definition"
          : role === "source"
            ? "source"
            : "structure";
      const network = networkAt(this.document, this.definitions, networkId),
        n = this.make(
          def,
          { [key]: resourceId, ...(field ? { field } : {}) },
          [200, 140],
          network,
        );
      network.nodes.push(n);
      const owner = networks(this.document, this.definitions).find(
        (r) => r.network.id === networkId,
      )?.resource;
      if (owner)
        demand(
          definitionStages(this.document, this.definitions, owner.id).length,
          "SUBGRAPH_STAGE",
        );
      else if (role === "call")
        demand(
          definitionStages(
            this.document,
            this.definitions,
            resourceId,
          ).includes(this.stage(networkId).stageKindId),
          "SUBGRAPH_STAGE",
        );
      closure(
        this.document.graph.resources,
        role === "call" ? [resourceId] : [],
        this.definitions,
      );
      return n.id;
    });
  }
  private stage(networkId: string) {
    const root = this.document.graph.stages.find(
      (s) => s.network.id === networkId,
    );
    if (root) return root;
    const entry = networks(this.document, this.definitions).find(
      (r) => r.network.id === networkId,
    );
    demand(entry, "NETWORK_MISSING");
    return {
      key: "nested",
      implementation: "network",
      stageKindId: entry.stageKindId,
    };
  }
  private fork(networkId: string) {
    const owner = networks(this.document, this.definitions).find(
      (r) => r.network.id === networkId,
    )?.resource;
    if (!owner) return;
    const affected = new Set([owner.id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const r of this.document.graph.resources) {
        const data = asNetwork(r, this.definitions);
        if (
          data &&
          !affected.has(r.id) &&
          [
            ...data.dependencies,
            ...data.network.nodes.map((n) => callResource(n, this.definitions)),
          ].some((id) => id && affected.has(id))
        ) {
          affected.add(r.id);
          changed = true;
        }
      }
    }
    const map = new Map(
      [...affected]
        .filter(
          (id) =>
            !asNetwork(
              this.document.graph.resources.find((r) => r.id === id)!,
              this.definitions,
            )!.local,
        )
        .map((id) => [id, this.ids.next()]),
    );
    if (!map.size) return;
    const remap = (ref: import("../sdk/document.ts").DocumentReference) => ({
      ...ref,
      targetId:
        ref.kind === "resource"
          ? (map.get(ref.targetId) ?? ref.targetId)
          : ref.targetId,
    });
    for (const r of this.document.graph.resources) {
      const old = r.id;
      const data = asNetwork(r, this.definitions);
      if (map.has(old)) {
        r.id = map.get(old)!;
        data!.local = true;
        data!.origin ??= old;
      }
      const codec = this.definitions.resource(r.type)?.stateReferences;
      if (codec) r.data = structuredClone(codec.remap(detached(r.data), remap));
      r.references = r.references.map(remap);
    }
    for (const { network } of networks(this.document, this.definitions))
      for (const n of network.nodes) {
        const codec = this.definitions.node(n.type)?.stateReferences;
        if (codec) n.state = codec.remap(detached(n.state), remap);
        n.references = n.references.map(remap);
      }
  }
  frameSelection(
    networkId: string,
    selection: readonly string[],
    name = "Frame",
  ): void {
    this.run(() => {
      const network = networkAt(this.document, this.definitions, networkId),
        members = network.nodes.filter((n) => selection.includes(n.id));
      demand(
        selection.length && members.length === selection.length,
        "FRAME_SELECTION",
      );
      const def = this.definitions.resourceByModel("frame");
      demand(def, "FRAME_MODULE");
      const id = this.ids.next(),
        x = Math.min(...members.map((n) => n.position[0])) - 18,
        y = Math.min(...members.map((n) => n.position[1])) - 30;
      this.document.graph.resources.push({
        id,
        type: { ...def.ref },
        data: {
          name,
          networkId,
          nodeIds: [...selection],
          position: [x, y],
          size: [
            Math.max(...members.map((n) => n.position[0] + 200)) - x + 18,
            Math.max(
              ...members.map((n) => n.position[1] + 60 + n.ports.length * 31),
            ) -
              y +
              18,
          ],
          color: "#6b7097",
        },
        references: [],
        referencesComplete: true,
        extensions: {},
      });
      const owner = networks(this.document, this.definitions).find(
        (n) => n.network.id === networkId,
      )?.resource;
      if (owner) asNetwork(owner, this.definitions)!.dependencies.push(id);
    });
  }
  sparePort(
    networkId: string,
    boundaryId: string,
    endpoint: EdgeDocument["from"],
  ): void {
    this.run(() => {
      this.fork(networkId);
      const network = networkAt(this.document, this.definitions, networkId),
        boundary = findNode(
          this.document,
          networkId,
          boundaryId,
          this.definitions,
        ),
        role = this.definitions.node(boundary.type)?.modelRole;
      demand(
        role === "network-input" || role === "network-output",
        "BOUNDARY_TYPE",
      );
      const source = findNode(
          this.document,
          networkId,
          endpoint.nodeId,
          this.definitions,
        ),
        port = source.ports.find(
          (p) =>
            p.key === endpoint.portKey &&
            p.direction === (role === "network-input" ? "input" : "output"),
        );
      demand(port, "PORT_DIRECTION");
      const resource = networks(this.document, this.definitions).find(
          (n) => n.network.id === networkId,
        )!.resource!,
        data = asNetwork(resource, this.definitions)!;
      demand(
        data.interface.filter(
          (p) =>
            p.direction === (role === "network-input" ? "input" : "output"),
        ).length < 16,
        "PORT_LIMIT",
      );
      const key = this.ids.next();
      data.interface.push({
        key,
        name: source.name + " " + port.key,
        direction: role === "network-input" ? "input" : "output",
        type: port.type,
        ...(role === "network-input"
          ? {
              supply: "local" as const,
              defaultValue:
                port.defaultValue ??
                typeSystem(this.document, this.definitions).defaultValue(
                  port.type,
                ),
            }
          : {}),
      });
      boundary.ports = schema(
        this.definitions.node(boundary.type)!,
        boundary.state,
        typeSystem(this.document, this.definitions),
        modelContext(this.document, this.definitions),
      );
      this.connect(
        networkId,
        role === "network-input"
          ? { nodeId: boundary.id, portKey: key }
          : endpoint,
        role === "network-input"
          ? endpoint
          : { nodeId: boundary.id, portKey: key },
      );
    });
  }
  emissionMode(
    networkId: string,
    mode: "expand" | "function",
    profile: GLSLProfile,
  ): void {
    this.run(() => {
      demand(mode === "expand" || mode === "function", "NETWORK_EMISSION_MODE");
      let resource = this.document.graph.resources.find(
        (r) => asNetwork(r, this.definitions)?.network.id === networkId,
      );
      demand(resource, "DEFINITION_MISSING");
      const semantics = this.definitions.resource(
        resource.type,
      )?.networkEmission;
      demand(
        semantics,
        "NETWORK_UPGRADE_REQUIRED",
        "Explicitly upgrade this document's subgraph owner before selecting a mode.",
      );
      if (semantics.mode(resource.data) === mode) return;
      const before = analyzeConstants(this.document, this.definitions, profile);
      // Qualification precedes localization and loss repair, on this fixed candidate.
      resource.data = structuredClone(semantics.setMode(resource.data, mode));
      if (mode === "function") {
        demand(
          profile.capabilities.includes("grape.glsl.functions"),
          "PROFILE_FUNCTION_UNSUPPORTED",
        );
        const failures =
          analyzeConstants(
            this.document,
            this.definitions,
            profile,
          ).functions.get(resource.id) ?? [];
        demand(
          !failures.length,
          "FUNCTION_INELIGIBLE",
          JSON.stringify(failures),
        );
      }
      this.fork(networkId);
      resource = this.document.graph.resources.find(
        (r) => asNetwork(r, this.definitions)?.network.id === networkId,
      )!;
      if (mode === "function") {
        const after = analyzeConstants(
          this.document,
          this.definitions,
          profile,
        );
        const affected = networks(this.document, this.definitions).flatMap(
          ({ network }) =>
            network.edges
              .filter(
                (e) =>
                  before.edges.get(network.id + ":" + e.id) === true &&
                  after.edges.get(network.id + ":" + e.id) === false,
              )
              .map((edge) => ({
                networkId: network.id,
                edge: structuredClone(edge),
              })),
        );
        for (const affectedEdge of affected) {
          this.fork(affectedEdge.networkId);
          const network = findNetwork(
            this.document,
            affectedEdge.networkId,
            this.definitions,
          );
          network.edges = network.edges.filter(
            (e) => e.id !== affectedEdge.edge.id,
          );
          this.document.graph.losses.push({
            schema: "grape.loss",
            version: 1,
            id: this.ids.next(),
            code: "FUNCTION_CONSTANT_DETACHED",
            reason: `Function mode of definition ${resource.id} makes this receiving input nonconstant.`,
            payload: {
              kind: "edge",
              networkId: network.id,
              edge: affectedEdge.edge,
            },
            extensions: {
              "grape.function-mode": {
                initiatingDefinition: resource.id,
                initiatingNetwork: networkId,
                mode,
              },
            },
          });
        }
      }
    });
  }
  createSubgraph(
    networkId: string,
    name = "Subgraph",
    libraryOrigin: string | null = null,
    empty = false,
  ): string {
    return this.run(() => {
      this.fork(networkId);
      const target = networkAt(this.document, this.definitions, networkId);
      name = name.trim();
      demand(
        name.length > 0 && name.length <= 80 && !/[\x00-\x1f\x7f]/.test(name),
        "DEFINITION_NAME",
      );
      demand(
        this.document.graph.resources.filter((r) =>
          asNetwork(r, this.definitions),
        ).length < 64,
        "DEFINITION_LIMIT",
      );
      const spec = this.definitions.resourceByModel("network"),
        call = this.definitions.nodeByRole("call");
      demand(spec && call, "NETWORK_MODULE");
      const id = this.ids.next(),
        network = {
          id: this.ids.next(),
          nodes: [],
          edges: [],
          extensions: {},
        } as NetworkDocument;
      const data: NetworkData = {
        name,
        local: !libraryOrigin,
        origin: libraryOrigin ? (spec.library?.origin ?? null) : null,
        network,
        interface:
          empty || libraryOrigin
            ? []
            : [
                {
                  key: "value",
                  name: "Value",
                  direction: "input",
                  type: "glsl.vec4",
                  supply: "local",
                  defaultValue: [1, 1, 1, 1],
                },
                {
                  key: "value",
                  name: "Value",
                  direction: "output",
                  type: "glsl.vec4",
                  defaultValue: [0, 0, 0, 1],
                },
              ],
        dependencies: [],
      };
      this.document.graph.resources.push({
        id,
        type: { ...spec.ref },
        data:
          spec.networkEmission?.initialize(data as unknown as Json) ??
          (data as unknown as Json),
        references: [],
        referencesComplete: true,
        extensions: {},
      });
      for (const role of ["network-input", "network-output"] as const) {
        const def = this.definitions.nodeByRole(role);
        demand(def, "NETWORK_MODULE");
        network.nodes.push(
          this.make(
            def,
            { definition: id },
            role === "network-input" ? [0, 0] : [600, 0],
            network,
          ),
        );
      }
      if (!empty && !libraryOrigin) {
        const from = network.nodes[0],
          to = network.nodes[1];
        network.edges.push({
          id: this.ids.next(),
          from: { nodeId: from.id, portKey: "value" },
          to: { nodeId: to.id, portKey: "value" },
          adaptation: typeSystem(this.document, this.definitions).adaptation(
            from.ports[0],
            to.ports[0],
          ),
          extensions: {},
        });
      }
      if (libraryOrigin) {
        demand(spec.library, "LIBRARY_MISSING");
        for (const entry of spec.library.nodes) {
          const def = this.definitions.node(entry.ref);
          demand(def, "NODE_MISSING");
          network.nodes.push(
            this.make(
              def,
              structuredClone(entry.state),
              entry.position,
              network,
            ),
          );
        }
      }
      const caller = this.make(call, { definition: id }, [160, 120], target);
      caller.name = name;
      let suffix = 2;
      while (target.nodes.some((n) => n.name === caller.name))
        caller.name = name + " " + suffix++;
      target.nodes.push(caller);
      return caller.id;
    });
  }
  interface(
    networkId: string,
    ports: NetworkData["interface"],
    name?: string,
  ): void {
    this.run(() => {
      const existing = networks(this.document, this.definitions).find(
        (n) => n.network.id === networkId,
      )?.resource;
      demand(existing, "DEFINITION_MISSING");
      const current = asNetwork(existing, this.definitions)!;
      if (
        equal(current.interface, ports) &&
        (name === undefined || name.trim() === current.name)
      )
        return;
      this.fork(networkId);
      const r = networks(this.document, this.definitions).find(
        (r) => r.network.id === networkId,
      )?.resource;
      demand(r, "DEFINITION_MISSING");
      const data = asNetwork(r, this.definitions)!;
      demand(
        ports.length <= 32 &&
          new Set(ports.map((p) => p.direction + ":" + p.key)).size ===
            ports.length &&
          ports.every(
            (p) =>
              p.name.trim() &&
              p.key &&
              typeSystem(this.document, this.definitions).resolve(p.type),
          ),
        "INTERFACE_INVALID",
      );
      for (const direction of ["input", "output"]) {
        const adding = ports.some(
          (p) =>
            p.direction === direction &&
            !data.interface.some(
              (old) => old.direction === direction && old.key === p.key,
            ),
        );
        if (adding)
          demand(
            ports.filter((p) => p.direction === direction).length <= 16,
            "PORT_LIMIT",
          );
      }
      for (const port of ports)
        if (port.defaultValue !== undefined)
          demand(
            typeSystem(this.document, this.definitions).validValue(
              port.type,
              port.defaultValue,
            ),
            "PORT_DEFAULT",
          );
      if (name !== undefined) {
        name = name.trim();
        demand(
          name.length > 0 && name.length <= 80 && !/[\x00-\x1f\x7f]/.test(name),
          "DEFINITION_NAME",
        );
        data.name = name;
      }
      data.interface = structuredClone(ports);
    });
  }
  makeIndependent(networkId: string, nodeId: string): void {
    this.run(() => {
      demand(
        this.document.graph.resources.filter(
          (r) => this.definitions.resource(r.type)?.model === "network",
        ).length < 64,
        "DEFINITION_LIMIT",
      );
      this.fork(networkId);
      const node = findNode(this.document, networkId, nodeId, this.definitions),
        id = callResource(node, this.definitions),
        r = this.document.graph.resources.find((r) => r.id === id);
      demand(r, "DEFINITION_MISSING");
      const copy = structuredClone(r);
      let data = asNetwork(copy, this.definitions)!;
      copy.id = this.ids.next();
      data.local = true;
      data.origin ??= r.id;
      const independentNetworkId = this.ids.next();
      const ids = new Map(
        data.network.nodes.map((n) => [n.id, this.ids.next()]),
      );
      const oldNetworkId = asNetwork(r, this.definitions)!.network.id;
      const reachable = closure(
        this.document.graph.resources,
        dependencies(r, this.definitions),
        this.definitions,
      );
      const clonedIds = new Map(
        reachable
          .filter((resource) =>
            resourceReferences(resource, this.definitions).some(
              (ref) => ref.kind === "node" && ref.networkId === oldNetworkId,
            ),
          )
          .map((resource) => [resource.id, this.ids.next()]),
      );
      let changed = true;
      while (changed) {
        changed = false;
        for (const resource of reachable)
          if (
            !clonedIds.has(resource.id) &&
            dependencies(resource, this.definitions).some((id) =>
              clonedIds.has(id),
            )
          ) {
            clonedIds.set(resource.id, this.ids.next());
            changed = true;
          }
      }
      const networkMap = new Map([[oldNetworkId, independentNetworkId]]),
        nodeMaps = new Map([[oldNetworkId, ids]]);
      for (const resource of reachable) {
        const nested = asNetwork(resource, this.definitions);
        if (!nested) continue;
        const cloned = clonedIds.has(resource.id);
        networkMap.set(
          nested.network.id,
          cloned ? this.ids.next() : nested.network.id,
        );
        nodeMaps.set(
          nested.network.id,
          new Map(
            nested.network.nodes.map((n) => [
              n.id,
              cloned ? this.ids.next() : n.id,
            ]),
          ),
        );
      }
      demand(
        this.document.graph.resources.filter((x) =>
          asNetwork(x, this.definitions),
        ).length +
          1 +
          reachable.filter(
            (x) => clonedIds.has(x.id) && asNetwork(x, this.definitions),
          ).length <=
          64,
        "DEFINITION_LIMIT",
      );
      const remap = (
        ref: import("../sdk/document.ts").DocumentReference,
        current = oldNetworkId,
      ) => {
        if (ref.kind === "resource")
          return {
            ...ref,
            targetId:
              ref.targetId === r.id
                ? copy.id
                : (clonedIds.get(ref.targetId) ?? ref.targetId),
          };
        const network = ref.networkId ?? current,
          targetId = nodeMaps.get(network)?.get(ref.targetId);
        demand(targetId, "REFERENCE_ESCAPE");
        return {
          ...ref,
          targetId,
          ...(ref.networkId ? { networkId: networkMap.get(network)! } : {}),
        };
      };
      const typeMap = new Map([[r.id, copy.id], ...clonedIds]);
      const remapNetwork = (
        network: import("../sdk/document.ts").NetworkDocument,
        old: string,
      ) => {
        const nodes = nodeMaps.get(old)!;
        network.id = networkMap.get(old)!;
        for (const n of network.nodes) {
          n.id = nodes.get(n.id)!;
          n.ports = n.ports.map((p) => ({
            ...p,
            type: remapType(p.type, typeMap),
          }));
          n.references = n.references.map((ref) => remap(ref, old));
          const codec = this.definitions.node(n.type)?.stateReferences;
          if (codec)
            n.state = structuredClone(
              codec.remap(detached(n.state), (ref) => remap(ref, old)),
            );
        }
        for (const e of network.edges) {
          e.id = this.ids.next();
          e.from.nodeId = nodes.get(e.from.nodeId)!;
          e.to.nodeId = nodes.get(e.to.nodeId)!;
          e.adaptation.sourceType = remapType(e.adaptation.sourceType, typeMap);
          e.adaptation.targetType = remapType(e.adaptation.targetType, typeMap);
        }
      };
      const rootCodec = this.definitions.resource(r.type)!.stateReferences;
      if (rootCodec)
        copy.data = structuredClone(
          rootCodec.remap(detached(copy.data), (ref) => remap(ref)),
        );
      data = asNetwork(copy, this.definitions)!;
      data.interface = data.interface.map((p) => ({
        ...p,
        type: remapType(p.type, typeMap),
      }));
      remapNetwork(data.network, oldNetworkId);
      for (const original of reachable.filter((resource) =>
        clonedIds.has(resource.id),
      )) {
        const cloned = structuredClone(original),
          codec = this.definitions.resource(original.type)!.stateReferences;
        cloned.id = clonedIds.get(original.id)!;
        if (codec)
          cloned.data = structuredClone(
            codec.remap(detached(cloned.data), (ref) => remap(ref)),
          );
        cloned.references = cloned.references.map((ref) => remap(ref));
        const nested = asNetwork(cloned, this.definitions);
        if (nested) {
          nested.interface = nested.interface.map((p) => ({
            ...p,
            type: remapType(p.type, typeMap),
          }));
          nested.local = true;
          nested.origin ??= original.id;
          remapNetwork(nested.network, nested.network.id);
        }
        this.document.graph.resources.push(cloned);
      }
      data.dependencies = asNetwork(r, this.definitions)!.dependencies.map(
        (id) => clonedIds.get(id) ?? id,
      );
      copy.references = copy.references.map((ref) => remap(ref));
      this.document.graph.resources.push(copy);
      const retarget = (ref: import("../sdk/document.ts").DocumentReference) =>
        ref.kind === "resource" && ref.targetId === r.id
          ? { ...ref, targetId: copy.id }
          : ref;
      node.state = this.definitions
        .node(node.type)!
        .stateReferences!.remap(detached(node.state), retarget);
      node.references = node.references.map(retarget);
    });
  }
  encapsulate(
    networkId: string,
    selection: readonly string[],
    name = "Subgraph",
  ): string {
    return this.run(() => {
      let network = networkAt(this.document, this.definitions, networkId);
      let chosen = network.nodes.filter(
        (n) =>
          selection.includes(n.id) &&
          this.definitions.node(n.type)?.role !== "boundary" &&
          this.definitions.node(n.type)?.modelRole !== "source",
      );
      if (!chosen.length) return "";
      this.fork(networkId);
      network = networkAt(this.document, this.definitions, networkId);
      chosen = network.nodes.filter((n) => chosen.some((x) => x.id === n.id));
      const ids = new Set(chosen.map((n) => n.id));
      const ownedResources = closure(
        this.document.graph.resources,
        chosen.flatMap((n) =>
          nodeReferences(n, this.definitions)
            .filter((r) => r.kind === "resource")
            .map((r) => r.targetId),
        ),
        this.definitions,
      );
      const includedNetworks = ownedResources.flatMap((resource) => {
        const nested = asNetwork(resource, this.definitions);
        return nested ? [nested.network] : [];
      });
      for (const resource of ownedResources)
        for (const ref of resourceReferences(resource, this.definitions))
          if (ref.kind === "node")
            demand(
              ref.networkId === networkId
                ? ids.has(ref.targetId)
                : includedNetworks.some(
                    (network) =>
                      network.id === ref.networkId &&
                      network.nodes.some((n) => n.id === ref.targetId),
                  ),
              "REFERENCE_ESCAPE",
            );
      for (const n of chosen)
        demand(
          n.referencesComplete &&
            [
              ...n.references,
              ...(this.definitions
                .node(n.type)
                ?.stateReferences?.collect(n.state) ?? []),
            ].every(
              (r) =>
                r.kind !== "node" ||
                ((!r.networkId || r.networkId === networkId) &&
                  ids.has(r.targetId)),
            ),
          "REFERENCE_ESCAPE",
        );
      const callerId = this.createSubgraph(networkId, name, null, true),
        caller = network.nodes.find((n) => n.id === callerId)!,
        resource = this.document.graph.resources.find(
          (r) => r.id === callResource(caller, this.definitions),
        )!,
        data = asNetwork(resource, this.definitions)!,
        inner = data.network;
      const input = inner.nodes.find(
          (n) => this.definitions.node(n.type)?.modelRole === "network-input",
        )!,
        output = inner.nodes.find(
          (n) => this.definitions.node(n.type)?.modelRole === "network-output",
        )!;
      const allFrames = frames(this.document, this.definitions, networkId),
        movedFrames = allFrames.filter((f) =>
          f.nodeIds.every((id) => ids.has(id)),
        );
      for (const f of allFrames) {
        const r = this.document.graph.resources.find((r) => r.id === f.id)!,
          d = r.data as unknown as import("../sdk/networks.ts").FrameData;
        if (movedFrames.includes(f)) {
          d.networkId = inner.id;
          data.dependencies.push(r.id);
          const oldOwner = networks(this.document, this.definitions).find(
            (n) => n.network.id === networkId,
          )?.resource;
          if (oldOwner)
            asNetwork(oldOwner, this.definitions)!.dependencies = asNetwork(
              oldOwner,
              this.definitions,
            )!.dependencies.filter((id) => id !== r.id);
        } else d.nodeIds = d.nodeIds.filter((id) => !ids.has(id));
      }
      for (const node of chosen) {
        const remap = (ref: import("../sdk/document.ts").DocumentReference) =>
          ref.kind === "node"
            ? { ...ref, ...(ref.networkId ? { networkId: inner.id } : {}) }
            : ref;
        node.references = node.references.map(remap);
        const codec = this.definitions.node(node.type)?.stateReferences;
        if (codec)
          node.state = structuredClone(
            codec.remap(detached(node.state), remap),
          );
      }
      for (const resource of ownedResources) {
        const remap = (ref: import("../sdk/document.ts").DocumentReference) =>
          ref.kind === "node" && ref.networkId === networkId
            ? { ...ref, networkId: inner.id }
            : ref;
        resource.references = resource.references.map(remap);
        const codec = this.definitions.resource(resource.type)?.stateReferences;
        if (codec)
          resource.data = structuredClone(
            codec.remap(detached(resource.data), remap),
          );
      }
      inner.nodes.push(...chosen);
      network.nodes = network.nodes.filter((n) => !ids.has(n.id));
      const incoming = new Map<string, string>(),
        outgoing = new Map<string, string>();
      const retained: EdgeDocument[] = [];
      for (const e of network.edges) {
        const a = ids.has(e.from.nodeId),
          b = ids.has(e.to.nodeId);
        if (a && b) {
          inner.edges.push(e);
          continue;
        }
        if (!a && !b) {
          retained.push(e);
          continue;
        }
        if (b) {
          const port = chosen
            .find((n) => n.id === e.to.nodeId)!
            .ports.find(
              (p) => p.key === e.to.portKey && p.direction === "input",
            )!;
          const dedup = e.from.nodeId + ":" + e.from.portKey + ":" + port.type;
          let key = incoming.get(dedup);
          if (!key) {
            key = this.ids.next();
            incoming.set(dedup, key);
            data.interface.push({
              key,
              name: "Input " + incoming.size,
              direction: "input",
              type: port.type,
              supply: "local",
              defaultValue:
                port.defaultValue ??
                typeSystem(this.document, this.definitions).defaultValue(
                  port.type,
                ),
              ...(port.requireConstant ? { requireConstant: true } : {}),
              ...(port.connectionPolicy
                ? { connectionPolicy: port.connectionPolicy }
                : {}),
            });
            retained.push({
              ...structuredClone(e),
              to: { nodeId: callerId, portKey: key },
            });
          }
          inner.edges.push({
            ...e,
            id: this.ids.next(),
            from: { nodeId: input.id, portKey: key },
            adaptation: typeSystem(this.document, this.definitions).adaptation(
              { ...port, direction: "output" },
              port,
            ),
          });
        } else {
          const port = chosen
            .find((n) => n.id === e.from.nodeId)!
            .ports.find(
              (p) => p.key === e.from.portKey && p.direction === "output",
            )!;
          const dedup = e.from.nodeId + ":" + e.from.portKey;
          let key = outgoing.get(dedup);
          if (!key) {
            key = this.ids.next();
            outgoing.set(dedup, key);
            data.interface.push({
              key,
              name: "Output " + outgoing.size,
              direction: "output",
              type: port.type,
            });
            inner.edges.push({
              ...structuredClone(e),
              id: this.ids.next(),
              to: { nodeId: output.id, portKey: key },
              adaptation: typeSystem(
                this.document,
                this.definitions,
              ).adaptation(port, { ...port, direction: "input" }),
            });
          }
          retained.push({ ...e, from: { nodeId: callerId, portKey: key } });
        }
      }
      network.edges = retained;
      data.dependencies = [
        ...new Set([
          ...data.dependencies,
          ...chosen
            .map((n) => callResource(n, this.definitions))
            .filter((id): id is string => !!id),
        ]),
      ];
      return callerId;
    });
  }

  disconnect(networkId: string, edgeId: string): void {
    this.run(() => {
      this.fork(networkId);
      const n = findNetwork(this.document, networkId, this.definitions),
        i = n.edges.findIndex((e) => e.id === edgeId);
      demand(i >= 0, "EDGE_MISSING");
      n.edges.splice(i, 1);
    });
  }
}
