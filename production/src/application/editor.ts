import { frames } from "../sdk/networks.ts";
import { validateNetworkStructure } from "../sdk/document-validation.ts";
import { networks } from "../sdk/networks.ts";
import {
  copySelection,
  dependencies,
  nodeReferences,
} from "../model/transfer.ts";
import type { ClipboardPacket } from "../model/transfer.ts";
import type { StructureData } from "../sdk/networks.ts";
import { resolveOccurrence, modelContext } from "../sdk/networks.ts";
import type { NetworkData } from "../sdk/networks.ts";
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
import {
  Signal,
  detached,
  equal,
  demand,
  plain,
  exact,
  Fault,
} from "../sdk/kernel.ts";
import type { IdentitySource } from "../sdk/kernel.ts";
import { compile } from "../generation/compiler.ts";
import { readDocument, writeDocument } from "../persistence/codec.ts";
import { inspectDocument } from "./inspection.ts";
import { upgradeDocument } from "./document-upgrade.ts";
import { buildPersonal, readPersonal, packagePacket } from "./personal.ts";
import type { PersonalPackage, PackageProbe } from "../sdk/library.ts";
import type { DocumentInspection } from "./inspection.ts";
import type {
  CatalogEntry,
  CatalogWire,
  ContextRestoreHint,
} from "../sdk/ui.ts";

export class EditorContext {
  #selection: string[] = [];
  #primary: string | null = null;
  #navigation = 0;
  #live = true;
  #stage: string;
  #path: string[] = [];
  #chain: string[] = [];
  #epoch = 0;
  #stageKey: string;
  #signal = new Signal<void>();
  #unsubscribe: () => void;
  constructor(
    readonly id: string,
    private readonly graph: Graph,
    stageId: string,
    private readonly canDispose: () => boolean = () => true,
  ) {
    this.#stage = stageId;
    this.#stageKey = graph
      .capture()
      .document.graph.stages.find((s) => s.id === stageId)!.key;
    this.#unsubscribe = graph.subscribeProjection(() => {
      const stages = graph.capture().document.graph.stages;
      if (!stages.some((s) => s.id === this.#stage)) {
        this.#stage = (
          stages.find((s) => s.key === this.#stageKey) ?? stages[0]
        ).id;
        this.#navigation++;
        this.#selection = [];
        this.#primary = null;
      }
      if (this.#epoch !== graph.epoch) {
        this.#epoch = graph.epoch;
        if (this.#path.length) this.#navigation++;
      }
      let resolved;
      try {
        resolved = resolveOccurrence(
          graph.capture().document,
          graph.definitionSet,
          this.#stage,
          this.#path,
        );
      } catch {
        this.#path = [];
        resolved = resolveOccurrence(
          graph.capture().document,
          graph.definitionSet,
          this.#stage,
          [],
        );
        this.#navigation++;
      }
      if (!equal(this.#chain, resolved.chain)) {
        this.#chain = [...resolved.chain];
        this.#navigation++;
      }
      const ids = this.network().nodes.map((n) => n.id);
      this.#selection = this.#selection.filter((id) => ids.includes(id));
      if (!this.#selection.includes(this.#primary!))
        this.#primary = this.#selection.at(-1) ?? null;
      this.#signal.emit();
    });
  }
  capture(): ContextSnapshot {
    demand(this.#live, "CONTEXT_DISPOSED");
    const graph = this.graph.capture(),
      network = this.networkFrom(graph);
    return detached({
      scope: {
        graphId: graph.document.graph.id,
        loadId: graph.loadId,
        contextId: this.id,
        stageId: this.#stage,
        networkPath: this.#path,
        lifetime: this.#navigation,
      },
      selection: this.#selection,
      primary: this.#primary,
      navigation: this.#navigation,
      definitionNames: Object.fromEntries(
        network.nodes.flatMap((n) => {
          if (this.graph.definitionSet.node(n.type)?.modelRole !== "call")
            return [];
          const id = (n.state as { definition: string }).definition;
          const data = graph.document.graph.resources.find((r) => r.id === id)
            ?.data as unknown as NetworkData | undefined;
          return data ? [[n.id, data.name]] : [];
        }),
      ),
      breadcrumbs: [
        {
          depth: 0,
          name:
            graph.document.graph.name +
            " / " +
            graph.document.graph.stages.find((s) => s.id === this.#stage)!.key,
        },
        ...this.#chain.map((id, i) => ({
          depth: i + 1,
          name: (
            graph.document.graph.resources.find((r) => r.id === id)!
              .data as unknown as NetworkData
          ).name,
        })),
      ],
      network,
      frames: frames(graph.document, this.graph.definitionSet, network.id),
      portLabels: Object.fromEntries(
        network.nodes.map((n) => {
          const role = this.graph.definitionSet.node(n.type)?.modelRole;
          const id = (n.state as { definition?: string }).definition;
          const d = graph.document.graph.resources.find((r) => r.id === id)
            ?.data as unknown as NetworkData | undefined;
          return [
            n.id,
            role && ["call", "network-input", "network-output"].includes(role)
              ? Object.fromEntries(
                  (d?.interface ?? []).map((p) => [p.key, p.name]),
                )
              : {},
          ];
        }),
      ),
      nodeRoles: Object.fromEntries(
        network.nodes.map((n) => [
          n.id,
          this.graph.definitionSet.node(n.type)?.modelRole ??
            this.graph.definitionSet.node(n.type)?.role ??
            "operation",
        ]),
      ),
      structures: graph.document.graph.resources
        .filter(
          (r) =>
            this.graph.definitionSet.resource(r.type)?.model === "structure",
        )
        .map((r) => {
          const reaches = (id: string, seen = new Set<string>()): boolean => {
            if (id === r.id) return true;
            if (seen.has(id)) return false;
            seen.add(id);
            const resource = graph.document.graph.resources.find(
              (x) => x.id === id,
            );
            if (!resource) return false;
            try {
              return dependencies(resource, this.graph.definitionSet).some(
                (next) => reaches(next, seen),
              );
            } catch {
              return false;
            }
          };
          const uses = graph.document.graph.resources
            .filter((x) => x.id !== r.id && reaches(x.id))
            .map(
              (x) =>
                "Definition " +
                String((x.data as { name?: string }).name ?? x.id),
            );
          for (const { network } of networks(
            graph.document,
            this.graph.definitionSet,
          ))
            for (const node of network.nodes) {
              try {
                if (
                  nodeReferences(node, this.graph.definitionSet).some(
                    (ref) => ref.kind === "resource" && reaches(ref.targetId),
                  )
                )
                  uses.push(node.name + " / " + network.id);
              } catch {
                /* Diagnostics expose incomplete references; Help stays readable. */
              }
            }
          return { id: r.id, data: r.data as unknown as StructureData, uses };
        }),
      definition: this.#chain.length
        ? {
            id: this.#chain.at(-1)!,
            emissionMode: (() => {
              const r = graph.document.graph.resources.find(
                (r) => r.id === this.#chain.at(-1),
              )!;
              try {
                return (
                  this.graph.definitionSet
                    .resource(r.type)
                    ?.networkEmission?.mode(r.data) ?? null
                );
              } catch {
                return null;
              }
            })(),
            data: graph.document.graph.resources.find(
              (r) => r.id === this.#chain.at(-1),
            )!.data as unknown as NetworkData,
          }
        : null,
      graph,
    });
  }
  network() {
    demand(this.#live, "CONTEXT_DISPOSED");
    return this.networkFrom(this.graph.capture());
  }
  private networkFrom(graph: GraphSnapshot) {
    const stage = graph.document.graph.stages.find((s) => s.id === this.#stage);
    demand(stage, "STAGE_MISSING");
    return resolveOccurrence(
      graph.document,
      this.graph.definitionSet,
      this.#stage,
      this.#path,
    ).network;
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
  enter(nodeId: string): void {
    this.navigate(this.#stage, [...this.#path, nodeId]);
  }
  navigate(stageId: string, path: readonly string[] = []): void {
    demand(!this.#signal.notifying && !this.graph.busy, "CONTEXT_BUSY");
    demand(
      this.graph.capture().document.graph.stages.some((s) => s.id === stageId),
      "STAGE_MISSING",
    );
    const resolved = resolveOccurrence(
      this.graph.capture().document,
      this.graph.definitionSet,
      stageId,
      path,
    );
    this.#path = [...path];
    this.#chain = resolved.chain;
    this.#stage = stageId;
    this.#stageKey = this.graph
      .capture()
      .document.graph.stages.find((s) => s.id === stageId)!.key;
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
    demand(this.canDispose(), "CONTEXT_IN_USE");
    this.#live = false;
    this.#unsubscribe();
    this.#signal.emit();
    this.#signal.clear();
  }
}
export class EditorApplication implements ApplicationPanelCommandAuthority {
  #graph: Graph | null = null;
  #clipboard = "";
  get clipboardText() {
    return this.#clipboard;
  }
  copy(context: EditorContext): string {
    this.#clipboard = JSON.stringify(
      copySelection(
        this.snapshot,
        this.#graph!.definitionSet,
        context.network().id,
        context.capture().selection,
      ),
    );
    return this.#clipboard;
  }
  paste(context: EditorContext, text: string): void {
    demand(!this.#readonly, "COMMAND_DENIED");
    demand(new TextEncoder().encode(text).length <= 512000, "CLIPBOARD_SIZE");
    const packet = JSON.parse(text) as ClipboardPacket;
    let selected: string[] = [];
    this.#graph!.change("Paste", (d) => {
      selected = d.paste(context.network().id, packet, this.snapshot.loadId);
    });
    if (selected.length) context.select(selected);
  }
  async exportPersonal(context: EditorContext): Promise<PersonalPackage> {
    demand(
      this.#contexts.get(context.id) === context && !this.busy,
      "CONTEXT_EXPIRED",
    );
    const captured = context.capture(),
      snapshot = this.snapshot;
    const selected = captured.network.nodes.find(
      (n) => n.id === captured.primary,
    );
    const id =
      selected &&
      this.#graph!.definitionSet.node(selected.type)?.modelRole === "call"
        ? (selected.state as { definition: string }).definition
        : captured.definition?.id;
    demand(id, "PERSONAL_SELECT_SUBGRAPH");
    const asset = await buildPersonal(
      snapshot,
      this.#graph!.definitionSet,
      id,
      this.profile,
      this.packageProbe,
    );
    demand(
      this.snapshot.loadId === snapshot.loadId &&
        this.snapshot.revision === snapshot.revision &&
        equal(context.capture().scope, captured.scope),
      "PERSONAL_STALE",
    );
    return asset;
  }
  async insertPersonal(context: EditorContext, text: string): Promise<void> {
    demand(
      !this.#readonly &&
        !this.busy &&
        this.#contexts.get(context.id) === context,
      "COMMAND_DENIED",
    );
    const snapshot = this.snapshot,
      captured = context.capture();
    const asset = await readPersonal(
      text,
      this.#graph!.definitionSet,
      this.profile,
      this.packageProbe,
    );
    demand(
      !this.#readonly &&
        !this.busy &&
        this.#contexts.get(context.id) === context &&
        this.snapshot.loadId === snapshot.loadId &&
        this.snapshot.revision === snapshot.revision &&
        equal(context.capture().scope, captured.scope),
      "PERSONAL_STALE",
    );
    const stage = snapshot.document.graph.stages.find(
      (s) => s.id === captured.scope.stageId,
    )!;
    demand(asset.stageKindIds.includes(stage.stageKindId), "PERSONAL_STAGE");
    let ids: string[] = [];
    this.#graph!.change("Insert Library subgraph", (d) => {
      ids = d.insertLibrary(
        captured.network.id,
        packagePacket(asset, snapshot.document, this.#graph!.definitionSet),
        asset.contentHash,
      );
    });
    context.select(ids);
  }
  #contexts = new Map<string, EditorContext>();
  #contextBorrowers = new Map<string, number>();
  #signal = new Signal<void>();
  #saved: CanonicalGraphDocument | null = null;
  #saving = false;
  #compile: Compilation | null = null;
  #readonly = false;
  #origins = new Map<string, { contextId: string; cancel: () => void }>();
  #grants = new Map<string, Set<string>>();
  #unsubscribers: (() => void)[] = [];
  #reviews = new WeakMap<DocumentInspection, GraphSnapshot>();
  constructor(
    private readonly definitions: Definitions,
    private readonly identity: IdentitySource,
    private readonly kind: GraphKindRef,
    private readonly profile: GLSLProfile,
    private readonly storage: StorageAdapter,
    private readonly output: DocumentOutput,
    private readonly packageProbe?: PackageProbe,
  ) {}
  subscribe(fn: () => void): () => void {
    return this.#signal.subscribe(fn);
  }
  get snapshot(): GraphSnapshot {
    demand(this.#graph, "NO_DOCUMENT");
    return this.#graph.capture();
  }
  identifier(): string {
    return this.identity.next();
  }
  get dirty(): boolean {
    return !!this.#graph && !equal(this.snapshot.document, this.#saved);
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
      .filter((n) => n.role === "operation" && !n.modelRole)
      .map((n) => ({ ref: n.ref, presentation: n.presentation }));
  }
  /** Once per creator opening, never per search keystroke. Probes own disposable IDs/History. */
  creationCatalog(
    context: EditorContext,
    wire?: CatalogWire,
  ): readonly CatalogEntry[] {
    const current = context.capture(),
      snapshot = current.graph,
      network = current.network;
    const defs = this.definitions.pin(snapshot.document.graph.modules);
    const stage = snapshot.document.graph.stages.find(
      (s) => s.id === current.scope.stageId,
    )!;
    if (
      stage.implementation !== "network" ||
      this.busy ||
      !this.profile.graphKindIds.includes(
        snapshot.document.graph.kind.kindId,
      ) ||
      !this.profile.stageKindIds.includes(stage.stageKindId)
    )
      return [];
    const result: CatalogEntry[] = [];
    type Seed = {
      definition: NonNullable<ReturnType<typeof defs.node>>;
      presentation: CatalogEntry["presentation"];
      creation?: CatalogEntry["creation"];
      libraryScope: "builtin" | "project";
    };
    const seeds: Seed[] = this.definitions
      .nodeTypes()
      .filter((d) => d.role === "operation" && !d.modelRole)
      .map((definition) => ({
        definition,
        presentation: definition.presentation,
        libraryScope: "builtin",
      }));
    for (const resource of snapshot.document.graph.resources) {
      const model = defs.resource(resource.type)?.model,
        role =
          model === "network"
            ? "call"
            : model === "source"
              ? "source"
              : model === "structure"
                ? "structure"
                : null;
      if (!role) continue;
      const definition = defs.nodeByRole(role);
      if (!definition) continue;
      const data = resource.data as { name?: string },
        category =
          role === "call"
            ? "Project / Subgraphs"
            : role === "source"
              ? "Project / Sources"
              : "Project / Structures";
      const name = data.name ?? definition.presentation.label.fallback;
      seeds.push({
        definition,
        libraryScope: "project",
        creation: { kind: "reference", role, resourceId: resource.id },
        presentation: {
          ...definition.presentation,
          label: { ...definition.presentation.label, fallback: name },
          category: {
            id: category,
            label: { ...definition.presentation.label, fallback: category },
          },
          description: {
            ...definition.presentation.label,
            fallback:
              role === "source"
                ? "Existing source · reuses its current value and identity"
                : role === "call"
                  ? "Existing subgraph · shared definition and inputs/outputs"
                  : "Existing Structure · current declared fields",
          },
        },
      });
    }
    const sourceDefinition = defs.nodeByRole("source");
    if (sourceDefinition) {
      const usedNames = new Set(
        snapshot.document.graph.resources
          .filter((r) => defs.resource(r.type)?.model === "source")
          .map((r) => (r.data as { name: string }).name),
      );
      let name = "Source",
        suffix = 2;
      while (usedNames.has(name)) name = "Source " + suffix++;
      seeds.push({
        definition: sourceDefinition,
        libraryScope: "builtin",
        creation: { kind: "source", name, type: "glsl.float", value: 0 },
        presentation: {
          ...sourceDefinition.presentation,
          label: {
            ...sourceDefinition.presentation.label,
            fallback: "Float source (new)",
          },
          description: {
            ...sourceDefinition.presentation.label,
            fallback: "New constant source · independent value, initially 0",
          },
          category: {
            id: "sources",
            label: {
              ...sourceDefinition.presentation.label,
              fallback: "Sources",
            },
          },
        },
      });
    }
    const occupiedIds = new Set<string>();
    const collectIds = (v: unknown): void => {
      if (v && typeof v === "object") {
        if (!Array.isArray(v) && typeof (v as { id?: unknown }).id === "string")
          occupiedIds.add((v as { id: string }).id);
        for (const child of Object.values(v)) collectIds(child);
      }
    };
    collectIds(snapshot.document);
    for (const seed of seeds) {
      const { definition } = seed;
      if (
        !defs.node(definition.ref) ||
        definition.role !== "operation" ||
        !definition.eligibility.stageKindIds.includes(stage.stageKindId) ||
        (definition.eligibility.graphKindIds &&
          !definition.eligibility.graphKindIds.includes(
            snapshot.document.graph.kind.kindId,
          )) ||
        definition.eligibility.requiredGeneratorCapabilities?.some(
          (c) => !this.profile.capabilities.includes(c),
        )
      )
        continue;
      const state = definition.initialize(),
        choices = seed.creation
          ? []
          : definition
              .parameters(state, modelContext(snapshot.document, defs))
              .filter(
                (p) => p.target === "state" && p.type === "choice" && p.choices,
              );
      const variants: Record<string, Json>[] = [{}];
      if (wire)
        for (const p of choices)
          for (const value of p.choices!) variants.push({ [p.key]: value });
      let best: CatalogEntry | undefined;
      for (const parameters of variants) {
        let probe: Graph | undefined;
        try {
          let sequence = 0;
          probe = new Graph(snapshot.document, defs, {
            next: () => {
              let id: string;
              do {
                id = `catalog-probe-${++sequence}`;
              } while (occupiedIds.has(id));
              return id;
            },
          });
          let id = "";
          probe.change("Preview node", (d) => {
            if (seed.creation?.kind === "reference")
              id = d.addReferenceNode(
                network.id,
                seed.creation.role,
                seed.creation.resourceId,
                undefined,
                definition.ref,
              );
            else if (seed.creation?.kind === "source") {
              const c = seed.creation;
              const resource = d.createSource(c.name, c.type, c.value);
              id = d.addReferenceNode(
                network.id,
                "source",
                resource,
                undefined,
                definition.ref,
              );
            } else id = d.add(network.id, definition.ref, [0, 0], parameters);
          });
          const candidateNetwork = resolveOccurrence(
            probe.capture().document,
            defs,
            current.scope.stageId,
            current.scope.networkPath,
          ).network;
          const ports = candidateNetwork.nodes.find((n) => n.id === id)!.ports;
          if (
            ports.some((p) =>
              this.profile
                .validateType(p.type)
                .some((i) => i.severity === "error"),
            )
          )
            continue;
          const endpoint =
            wire &&
            network.nodes
              .find((n) => n.id === wire.nodeId)
              ?.ports.find(
                (p) => p.key === wire.portKey && p.direction === wire.direction,
              );
          if (wire && !endpoint) continue;
          const matches = wire
            ? ports
                .filter((p) => p.direction !== wire.direction)
                .sort(
                  (a, b) =>
                    Number(b.type === endpoint!.type) -
                    Number(a.type === endpoint!.type),
                )
            : [undefined];
          for (const port of matches) {
            try {
              if (wire && port)
                probe.change("Preview connection", (d) =>
                  d.connect(
                    network.id,
                    wire.direction === "output"
                      ? { nodeId: wire.nodeId, portKey: wire.portKey }
                      : { nodeId: id, portKey: port.key },
                    wire.direction === "input"
                      ? { nodeId: wire.nodeId, portKey: wire.portKey }
                      : { nodeId: id, portKey: port.key },
                    true,
                  ),
                );
              const item: CatalogEntry = {
                key: JSON.stringify([definition.ref, seed.creation ?? null]),
                ref: definition.ref,
                presentation: seed.presentation,
                libraryScope: seed.libraryScope,
                ...(seed.creation ? { creation: seed.creation } : {}),
                source: definition.ref.moduleId,
                ports,
                parameters,
                exactMatch: !wire || port?.type === endpoint?.type,
                scope: current.scope,
                revision: snapshot.revision,
                ...(port ? { matchingPort: port.key } : {}),
              };
              if (!best || (item.exactMatch && !best.exactMatch)) best = item;
              break;
            } catch {
              /* An inadmissible owner/type/constant variant is not a candidate. */
            }
          }
        } catch {
          /* Missing owner or rejected initial state remains unavailable. */
        } finally {
          probe?.dispose();
        }
      }
      if (best) result.push(best);
    }
    return detached(
      result.sort(
        (a, b) =>
          Number(b.exactMatch) - Number(a.exactMatch) ||
          a.presentation.label.fallback.localeCompare(
            b.presentation.label.fallback,
          ) ||
          a.key.localeCompare(b.key),
      ),
    );
  }
  private install(graph: Graph, saved: CanonicalGraphDocument | null): void {
    // A document replacement ends every old lifetime, including borrowed views.
    this.#contextBorrowers.clear();
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
        upgradeDocument(
          parsed.document,
          this.definitions.pin(parsed.document.graph.modules),
        ),
        this.definitions.pin(parsed.document.graph.modules),
        this.identity,
      );
      this.install(graph, saved ? parsed.document : null);
    }
    return parsed;
  }
  /** User-requested owner upgrade. The original snapshot and old pins remain immutable. */
  upgradeOwners(): void {
    demand(!this.#readonly && !this.busy, "UPGRADE_UNAVAILABLE");
    const source = this.snapshot,
      candidate = structuredClone(source.document);
    let changed = false;
    for (const resource of candidate.graph.resources) {
      const destinations = this.definitions
        .resourceTypes()
        .flatMap((owner) =>
          (owner.upgrades ?? [])
            .filter(
              (u) =>
                exact(u.from, resource.type) &&
                u.from.typeId === resource.type.typeId,
            )
            .map((upgrade) => ({ owner, upgrade })),
        );
      demand(destinations.length <= 1, "UPGRADE_AMBIGUOUS");
      if (!destinations.length) continue;
      const { owner, upgrade } = destinations[0];
      resource.data = structuredClone(upgrade.upgrade(detached(resource.data)));
      demand(
        !owner.codec
          .validate(resource.data)
          .some((i) => i.severity === "error"),
        "UPGRADE_PAYLOAD",
      );
      resource.type = { ...owner.ref };
      if (!candidate.graph.modules.some((p) => exact(p, owner.ref)))
        candidate.graph.modules.push({
          moduleId: owner.ref.moduleId,
          version: owner.ref.version,
          fingerprint: owner.ref.fingerprint,
        });
      changed = true;
    }
    if (!changed) return;
    const graph = new Graph(
      candidate,
      this.definitions.pin(candidate.graph.modules),
      this.identity,
    );
    demand(
      this.snapshot.loadId === source.loadId &&
        this.snapshot.revision === source.revision,
      "STALE_PROPOSAL",
    );
    this.install(graph, null);
  }
  /** Explicit kind migration creates a new load, not a content-replacement Undo. */
  upgradeGraphKind(destination: GraphKindRef): void {
    demand(
      !this.#readonly && !this.busy && !this.saving,
      "UPGRADE_UNAVAILABLE",
    );
    const source = this.snapshot;
    const owner = this.definitions
      .kinds()
      .find((k) => equal(k.ref, destination));
    demand(owner, "UPGRADE_OWNER_MISSING");
    if (equal(source.document.graph.kind, destination)) return;
    const choices = (owner.upgrades ?? []).filter((u) =>
      equal(u.from, source.document.graph.kind),
    );
    demand(choices.length === 1, "UPGRADE_UNSUPPORTED");
    const candidate = detached(choices[0].upgrade(detached(source.document)));
    demand(equal(candidate.graph.kind, destination), "UPGRADE_KIND");
    const graph = new Graph(
      candidate,
      this.definitions.pin(candidate.graph.modules),
      this.identity,
    );
    if (
      this.snapshot.loadId !== source.loadId ||
      this.snapshot.revision !== source.revision ||
      !equal(this.snapshot.document, source.document) ||
      this.#readonly ||
      this.busy ||
      this.saving
    ) {
      graph.dispose();
      throw new Fault("STALE_PROPOSAL");
    }
    this.install(graph, null);
  }
  inspectText(raw: string): DocumentInspection {
    const base = this.snapshot;
    const review = inspectDocument(raw, this.definitions);
    this.#reviews.set(review, base);
    return review;
  }
  cancelReview(review: DocumentInspection): void {
    this.#reviews.delete(review);
  }
  private checkReview(review: DocumentInspection): void {
    const base = this.#reviews.get(review);
    demand(base, "REVIEW_CLOSED");
    demand(!this.#readonly, "IMPORT_READONLY");
    demand(!this.busy, "HISTORY_BUSY");
    const now = this.snapshot;
    demand(
      now.loadId === base.loadId &&
        now.revision === base.revision &&
        equal(now.document, base.document),
      "IMPORT_STALE",
    );
  }
  acceptReview(review: DocumentInspection): void {
    this.checkReview(review);
    demand(review.candidate, "IMPORT_ERRORS");
    this.#graph!.change("Accept graph import", (draft) =>
      draft.replaceDocument(review.candidate!),
    );
    this.#reviews.delete(review);
  }
  /** Source validity is separate from the captured destination's eligibility.
   * This projection grants no authority; acceptance repeats all live guards. */
  replacementEligibility(
    review: DocumentInspection,
  ): { available: true } | { available: false; code: string } {
    try {
      this.checkReview(review);
      demand(review.candidate, "IMPORT_ERRORS");
      this.#graph!.checkReplacement(review.candidate);
      return { available: true };
    } catch (error) {
      if (!(error instanceof Fault)) throw error;
      return { available: false, code: error.code };
    }
  }
  /** Explicit load is a new lifetime. Unlike import acceptance, it can preserve
   * representable model errors, including missing definitions, for later re-save. */
  openReviewed(review: DocumentInspection): void {
    this.checkReview(review);
    demand(
      review.read.status === "editable" &&
        review.document &&
        review.reason !== "NETWORK_SIZE",
      "IMPORT_NOT_LOADABLE",
    );
    const doc = review.document;
    demand(doc.graph.stages.length > 0, "OPEN_NO_STAGE");
    const graph = new Graph(
      doc,
      this.definitions.pin(doc.graph.modules),
      this.identity,
    );
    this.install(graph, null);
    this.#reviews.delete(review);
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
    const newId = this.identity.next();
    const context = new EditorContext(
      newId,
      this.#graph,
      stage.id,
      () => !this.#contextBorrowers.get(newId),
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
  /** Borrowing a provider never transfers ownership of its Context to a Panel. */
  borrowContext(id: string): () => void {
    const context = this.context(id);
    context.capture();
    this.#contextBorrowers.set(id, (this.#contextBorrowers.get(id) ?? 0) + 1);
    let live = true;
    return () => {
      if (!live) return;
      live = false;
      if (this.#contexts.get(id) !== context) return;
      const count = (this.#contextBorrowers.get(id) ?? 1) - 1;
      if (count) this.#contextBorrowers.set(id, count);
      else this.#contextBorrowers.delete(id);
    };
  }
  contextHint(id: string): ContextRestoreHint {
    const current = this.context(id).capture();
    return detached({
      graphId: current.scope.graphId,
      stageId: current.scope.stageId,
      networkPath: current.scope.networkPath,
      selection: current.selection,
      primary: current.primary,
    });
  }
  /** Explicit application mapping: exact document/stage/occurrence, no names or fallback. */
  restoreContext(hint: ContextRestoreHint): EditorContext | null {
    demand(!this.busy, "HISTORY_BUSY");
    const graph = this.#graph;
    if (!graph || graph.capture().document.graph.id !== hint.graphId)
      return null;
    try {
      const resolved = resolveOccurrence(
        graph.capture().document,
        graph.definitionSet,
        hint.stageId,
        hint.networkPath,
      );
      if (
        !hint.selection.every((id) =>
          resolved.network.nodes.some((n) => n.id === id),
        ) ||
        (hint.primary !== null && !hint.selection.includes(hint.primary))
      )
        return null;
      const id = this.identity.next();
      const context = new EditorContext(
        id,
        graph,
        hint.stageId,
        () => !this.#contextBorrowers.get(id),
      );
      context.navigate(hint.stageId, hint.networkPath);
      context.select(hint.selection, hint.primary);
      this.#contexts.set(id, context);
      return context;
    } catch {
      return null;
    }
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
  private validateSave() {
    for (const row of networks(
      this.snapshot.document,
      this.#graph!.definitionSet,
    ))
      validateNetworkStructure(row.network, true);
  }
  async save(): Promise<void> {
    this.validateSave();
    demand(!this.#saving, "SAVE_BUSY");
    const snapshot = this.snapshot,
      text = writeDocument(snapshot.document);
    this.#saving = true;
    this.#signal.emit();
    try {
      await this.storage.write(snapshot.document.graph.id, text);
      if (this.#graph?.loadId === snapshot.loadId)
        this.#saved = snapshot.document;
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
    this.validateSave();
    return writeDocument(this.snapshot.document);
  }
  grant(typeId: string, commands: readonly string[]): void {
    demand(!this.#grants.has(typeId), "DUPLICATE_GRANT");
    this.#grants.set(typeId, new Set(commands));
  }
  allows(typeId: string, commandId: string): boolean {
    return (
      (!this.#readonly ||
        [
          "grape.network.enter",
          "grape.network.up",
          "grape.network.navigate",
          "grape.stage.navigate",
        ].includes(commandId)) &&
      !!this.#grants.get(typeId)?.has(commandId)
    );
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
    if (intent.commandId === "grape.stage.navigate") {
      demand(typeof args.stageId === "string", "COMMAND_ARGS");
      context.navigate(args.stageId);
      return;
    }
    if (intent.commandId === "grape.network.frame") {
      graph.change("Frame selection", (d) =>
        d.frameSelection(network, context.capture().selection),
      );
      return;
    }
    if (intent.commandId === "grape.network.layout") {
      const proposal = args as unknown as ReturnType<
        EditorApplication["layoutProposal"]
      >;
      demand(
        equal(proposal.scope, context.capture().scope) &&
          proposal.revision === this.snapshot.revision,
        "STALE_PROPOSAL",
      );
      demand(
        Object.keys(proposal.positions).length ===
          context.network().nodes.length,
        "LAYOUT_NODES",
      );
      graph.change("Arrange nodes", (d) => {
        for (const [id, position] of Object.entries(proposal.positions))
          d.move(network, id, position as [number, number]);
      });
      return;
    }
    if (intent.commandId === "grape.network.spare") {
      graph.change("Create interface port and connection", (d) =>
        d.sparePort(
          network,
          String(args.boundary),
          args.endpoint as unknown as { nodeId: string; portKey: string },
        ),
      );
      return;
    }
    if (intent.commandId === "grape.clipboard.copy") {
      this.copy(context);
      return;
    }
    if (intent.commandId === "grape.clipboard.paste") {
      demand(typeof args.text === "string", "COMMAND_ARGS");
      this.paste(context, args.text);
      return;
    }
    if (intent.commandId.startsWith("grape.structure.")) {
      demand(args.revision === this.snapshot.revision, "STALE_PROPOSAL");
      let node = "";
      graph.change("Edit structure", (d) => {
        if (intent.commandId === "grape.structure.apply") {
          const data = args.data as unknown as StructureData;
          if (typeof args.id === "string" && args.id)
            d.editStructure(args.id, data);
          else
            d.createStructure(data.name, data.fields, data.description ?? "");
        } else if (intent.commandId === "grape.structure.delete")
          d.removeResource(id());
        else if (intent.commandId === "grape.structure.instance")
          node = d.addReferenceNode(network, "structure", id());
        else if (intent.commandId === "grape.structure.field")
          node = d.addReferenceNode(network, "field", id(), String(args.field));
        else throw Error("COMMAND_UNKNOWN");
      });
      if (node) context.select([node]);
      return;
    }
    if (intent.commandId === "grape.network.enter") {
      context.enter(id());
      return;
    }
    if (intent.commandId === "grape.network.navigate") {
      const c = context.capture();
      demand(
        Number.isInteger(args.depth) &&
          Number(args.depth) >= 0 &&
          Number(args.depth) <= c.scope.networkPath.length,
        "COMMAND_ARGS",
      );
      context.navigate(
        c.scope.stageId,
        c.scope.networkPath.slice(0, Number(args.depth)),
      );
      return;
    }
    if (intent.commandId === "grape.network.up") {
      context.navigate(
        context.capture().scope.stageId,
        context.capture().scope.networkPath.slice(0, -1),
      );
      return;
    }
    if (
      [
        "grape.network.create",
        "grape.network.encapsulate",
        "grape.network.independent",
        "grape.network.interface",
        "grape.network.mode",
      ].includes(intent.commandId)
    ) {
      let created = "";
      graph.change("Edit subgraph", (d) => {
        if (intent.commandId === "grape.network.mode") {
          demand(args.revision === this.snapshot.revision, "STALE_PROPOSAL");
          demand(
            args.mode === "expand" || args.mode === "function",
            "COMMAND_ARGS",
          );
          d.emissionMode(network, args.mode, this.profile);
        }
        if (intent.commandId === "grape.network.create")
          created = d.createSubgraph(
            network,
            typeof args.name === "string" ? args.name : "Subgraph",
            args.library === true ? "example-library/1" : null,
          );
        if (intent.commandId === "grape.network.encapsulate")
          created = d.encapsulate(network, context.capture().selection);
        if (intent.commandId === "grape.network.independent")
          d.makeIndependent(network, context.capture().primary!);
        if (intent.commandId === "grape.network.interface") {
          demand(Array.isArray(args.ports), "COMMAND_ARGS");
          demand(args.revision === this.snapshot.revision, "STALE_PROPOSAL");
          d.interface(
            network,
            args.ports as unknown as NetworkData["interface"],
            typeof args.name === "string" ? args.name : undefined,
          );
        }
      });
      if (created) context.select([created]);
      return;
    }
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
      if (args.scope)
        demand(
          equal(args.scope, context.capture().scope) &&
            args.revision === this.snapshot.revision,
          "STALE_PROPOSAL",
        );
      const candidate =
        args.scope || args.creation || args.wire || args.parameters
          ? this.creationCatalog(
              context,
              args.wire as unknown as CatalogWire | undefined,
            ).find(
              (e) =>
                equal(e.ref, args.ref) &&
                equal(e.creation ?? null, args.creation ?? null) &&
                equal(e.parameters, args.parameters ?? {}) &&
                e.matchingPort === (args.matchingPort ?? undefined),
            )
          : undefined;
      if (args.scope || args.creation || args.wire || args.parameters)
        demand(candidate, "CREATION_UNAVAILABLE");
      graph.change("Add node", (d) => {
        if (candidate?.creation?.kind === "reference") {
          const c = candidate.creation;
          created = d.addReferenceNode(
            network,
            c.role,
            c.resourceId,
            undefined,
            candidate.ref,
          );
          d.move(network, created, args.position as [number, number]);
        } else if (candidate?.creation?.kind === "source") {
          const c = candidate.creation,
            resource = d.createSource(c.name, c.type, c.value);
          created = d.addReferenceNode(
            network,
            "source",
            resource,
            undefined,
            candidate.ref,
          );
          d.move(network, created, args.position as [number, number]);
        } else
          created = d.add(
            network,
            args.ref as unknown as NodeTypeRef,
            args.position as [number, number],
            candidate?.parameters ?? {},
          );
        if (args.wire) {
          const wire = args.wire as unknown as CatalogWire;
          demand(typeof args.matchingPort === "string", "COMMAND_ARGS");
          const own = { nodeId: created, portKey: args.matchingPort },
            other = { nodeId: wire.nodeId, portKey: wire.portKey };
          demand(
            wire.direction === "input" || wire.direction === "output",
            "COMMAND_ARGS",
          );
          d.connect(
            network,
            wire.direction === "output" ? other : own,
            wire.direction === "input" ? other : own,
            true,
          );
        }
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
  layoutProposal(context: EditorContext) {
    const c = context.capture();
    return detached({
      scope: c.scope,
      revision: c.graph.revision,
      positions: Object.fromEntries(
        c.network.nodes.map((n, i) => [
          n.id,
          [40 + (i % 4) * 220, 60 + Math.floor(i / 4) * 190],
        ]),
      ),
    });
  }
  reshapeValue(context: EditorContext, type: string, value: Json): Json {
    context.capture();
    return modelContext(
      this.snapshot.document,
      this.#graph!.definitionSet,
    ).types.reshape(type, value);
  }
  parameterKeys(context: EditorContext, nodeId: string): readonly string[] {
    const node = context.network().nodes.find((n) => n.id === nodeId);
    if (!node) return [];
    return (
      this.definitions
        .pin(this.snapshot.document.graph.modules)
        .node(node.type)
        ?.parameters(
          node.state,
          modelContext(this.snapshot.document, this.#graph!.definitionSet),
        )
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
    const type = original.network.nodes.find((n) => n.id === nodeId)?.type;
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
        const node = c.network.nodes.find((n) => n.id === nodeId);
        demand(node && equal(node.type, type), "NODE_MISSING");
        const def = this.definitions
          .pin(c.graph.document.graph.modules)
          .node(node.type);
        demand(def, "NODE_MISSING");
        const spec = def
          .parameters(
            node.state,
            modelContext(c.graph.document, this.#graph!.definitionSet),
          )
          .find((s) => s.key === key);
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
        const links = c.network.edges
          .filter((e) => e.to.nodeId === nodeId && e.to.portKey === key)
          .map((e) => ({
            edgeId: e.id,
            sourceNodeId: e.from.nodeId,
            invalid: !!e.invalid,
          }));
        const projection: ParameterProjection = {
          nodeId,
          spec,
          label: spec.label ??
            def.presentation.parameters?.[key]?.label ?? {
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
