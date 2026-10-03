import type {
  PersonalPackage,
  LibraryStore,
  PackageProbe,
} from "../sdk/library.ts";
import type {
  CanonicalGraphDocument,
  NodeDocument,
  ResourceDocument,
  NetworkDocument,
} from "../sdk/document.ts";
import type {
  DefinitionSet,
  GraphSnapshot,
  Compilation,
} from "../sdk/editing.ts";
import type { GLSLProfile, Json } from "../sdk/public-surface.ts";
import {
  materializeDefault,
  asNetwork,
  typeSystem,
  modelContext,
} from "../sdk/networks.ts";
import { demand, detached, plain, pinKey, equal } from "../sdk/kernel.ts";
import { closure, pastePacket } from "../model/transfer.ts";
import type { ClipboardPacket } from "../model/transfer.ts";
import { personalSources } from "../model/library.ts";
import { Graph } from "../model/graph.ts";
import { compile } from "../generation/compiler.ts";
import { parseJSON } from "../persistence/codec.ts";
import { validateDocumentStructure } from "../sdk/document-validation.ts";

export const PERSONAL_LIMITS = Object.freeze({
  files: 64,
  fileBytes: 256000,
  totalBytes: 4000000,
});
const bytes = (s: string) => new TextEncoder().encode(s).length;
const stable = (v: unknown): string =>
  Array.isArray(v)
    ? "[" + v.map(stable).join(",") + "]"
    : v && typeof v === "object"
      ? "{" +
        Object.keys(v)
          .sort()
          .map(
            (k) =>
              JSON.stringify(k) +
              ":" +
              stable((v as Record<string, unknown>)[k]),
          )
          .join(",") +
        "}"
      : JSON.stringify(v);
async function digest(value: unknown): Promise<string> {
  return [
    ...new Uint8Array(
      await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(stable(value)),
      ),
    ),
  ]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
function node(
  def: NonNullable<ReturnType<DefinitionSet["node"]>>,
  state: Json,
  id: string,
  document: CanonicalGraphDocument,
  defs: DefinitionSet,
): NodeDocument {
  const ports = structuredClone([
    ...def.ports(state, modelContext(document, defs)),
  ]);
  for (const p of ports)
    if (p.defaultValue !== undefined)
      p.defaultValue = materializeDefault(
        p.type,
        p.defaultValue,
        typeSystem(document, defs),
      );
  return {
    id,
    name: id,
    type: { ...def.ref },
    state: structuredClone(state),
    ports,
    inputValues: Object.fromEntries(
      ports
        .filter((p) => p.direction === "input" && p.defaultValue !== undefined)
        .map((p) => [p.key, structuredClone(p.defaultValue!)]),
    ),
    position: [120, 180],
    references: structuredClone([
      ...(def.stateReferences?.collect(state) ?? []),
    ]),
    referencesComplete: true,
    extensions: {},
  };
}
function shell(
  snapshot: GraphSnapshot,
  resources: readonly ResourceDocument[],
): CanonicalGraphDocument {
  const d = structuredClone(snapshot.document);
  d.graph.resources = structuredClone([...resources]);
  d.graph.losses = [];
  d.graph.recovery = [];
  d.graph.extensions = {};
  d.graph.stages.forEach((s) => {
    s.network.nodes = [];
    s.network.edges = [];
    s.network.extensions = {};
  });
  return d;
}
export function packagePacket(
  asset: PersonalPackage,
  document: CanonicalGraphDocument,
  defs: DefinitionSet,
): ClipboardPacket {
  const temp = structuredClone(document);
  temp.graph.resources = structuredClone(asset.resources);
  const call = defs.nodeByRole("call");
  demand(call, "NETWORK_MODULE");
  return {
    format: "grape.clipboard",
    version: 1,
    graphId: "personal-package",
    loadId: "personal-package",
    modules: asset.modules,
    resources: structuredClone(asset.resources),
    network: {
      id: "package-entry-network",
      nodes: [
        node(call, { definition: asset.entry }, "package-entry", temp, defs),
      ],
      edges: [],
      extensions: {},
    },
  };
}
export function qualifyPackage(
  asset: PersonalPackage,
  defs: DefinitionSet,
  profile: GLSLProfile,
  probeProvider?: PackageProbe,
): Compilation[] {
  demand(probeProvider, "PERSONAL_QUALIFIER_UNAVAILABLE");
  demand(equal(asset.profile, profile.ref), "PERSONAL_PROFILE");
  const root = asset.resources.find((r) => r.id === asset.entry),
    data = root && asNetwork(root, defs);
  demand(
    data &&
      asset.stageKindIds.length > 0 &&
      new Set(asset.stageKindIds).size === asset.stageKindIds.length,
    "PERSONAL_ENTRY",
  );
  demand(
    asset.modules.every((p) => defs.module(p)),
    "PERSONAL_MODULE",
  );
  const reachable = closure(asset.resources, [asset.entry], defs);
  demand(reachable.length === asset.resources.length, "PERSONAL_UNREACHABLE");
  const declared = new Set(asset.modules.map(pinKey));
  for (const resource of reachable) {
    demand(declared.has(pinKey(resource.type)), "PERSONAL_MODULE_DECLARATION");
    for (const node of asNetwork(resource, defs)?.network.nodes ?? [])
      demand(declared.has(pinKey(node.type)), "PERSONAL_MODULE_DECLARATION");
  }
  const callOwner = defs.nodeByRole("call");
  demand(
    callOwner && declared.has(pinKey(callOwner.ref)),
    "PERSONAL_MODULE_DECLARATION",
  );
  personalSources(reachable, defs);
  const result: Compilation[] = [];
  for (const stageKind of asset.stageKindIds) {
    demand(profile.stageKindIds.includes(stageKind), "PERSONAL_STAGE");
    const probe = probeProvider(defs, data, stageKind);
    let sequence = 0;
    const ids = { next: () => "probe-" + ++sequence };
    const { moduleId, version, fingerprint } = probe.kind.ref,
      probePin = { moduleId, version, fingerprint };
    const network: NetworkDocument = {
      id: ids.next(),
      nodes: [],
      edges: [],
      extensions: {},
    };
    const doc: CanonicalGraphDocument = {
      format: "grape.document",
      formatVersion: { major: 2, minor: 1 },
      graph: {
        id: ids.next(),
        name: "Personal qualification",
        kind: probe.kind.ref,
        kindSettings: {},
        modules: [...asset.modules, probePin],
        resources: structuredClone(asset.resources),
        stages: [
          {
            id: ids.next(),
            key: probe.kind.stages[0].key,
            stageKindId: stageKind,
            implementation: "network",
            network,
            extensions: {},
          },
        ],
        losses: [],
        recovery: [],
        extensions: {},
      },
    };
    const callDef = defs.nodeByRole("call");
    demand(callDef, "NETWORK_MODULE");
    const callId = ids.next();
    // Install only a job-local call shell, then its supplied constants, before
    // resolving input-dependent output shapes. No helper enters the asset.
    const call: NodeDocument = {
      id: callId,
      name: "Package",
      type: { ...callDef.ref },
      state: { definition: asset.entry },
      ports: structuredClone([
        ...callDef.ports({ definition: asset.entry }, modelContext(doc, defs)),
      ]),
      inputValues: {},
      position: [0, 0],
      references: [],
      referencesComplete: true,
      extensions: {},
    };
    network.nodes.push(call);
    for (const p of call.ports.filter((p) => p.direction === "input")) {
      if (p.supply === "local") {
        if (p.defaultValue !== undefined)
          call.inputValues[p.key] = structuredClone(p.defaultValue);
        continue;
      }
      let input: NodeDocument;
      if (p.requireConstant && ["glsl.int", "glsl.uint"].includes(p.type)) {
        const source = defs.resourceByModel("source"),
          sourceNode = defs.nodeByRole("source");
        demand(source && sourceNode, "PERSONAL_QUALIFIER_SOURCE");
        for (const ref of [source.ref, sourceNode.ref])
          if (!doc.graph.modules.some((pin) => pinKey(pin) === pinKey(ref))) {
            const { moduleId, version, fingerprint } = ref;
            doc.graph.modules.push({ moduleId, version, fingerprint });
          }
        const id = ids.next(),
          value = p.defaultValue ?? 1;
        doc.graph.resources.push({
          id,
          type: { ...source.ref },
          data: { name: id, type: p.type, value, clipboard: true },
          references: [],
          referencesComplete: true,
          extensions: {},
        });
        input = node(
          sourceNode,
          { source: id },
          ids.next(),
          doc,
          probe.definitions,
        );
      } else
        input = node(
          probe.definitions.node(probe.inputNode)!,
          {
            type: p.type,
            value:
              p.defaultValue ??
              typeSystem(doc, probe.definitions).defaultValue(p.type),
          },
          ids.next(),
          doc,
          probe.definitions,
        );
      network.nodes.push(input);
      network.edges.push({
        id: ids.next(),
        from: { nodeId: input.id, portKey: "value" },
        to: { nodeId: call.id, portKey: p.key },
        adaptation: typeSystem(doc, probe.definitions).adaptation(
          input.ports[0],
          p,
        ),
        extensions: {},
      });
    }
    const resolved = node(
      callDef,
      { definition: asset.entry },
      call.id,
      doc,
      probe.definitions,
    );
    Object.assign(call, resolved);
    const sink = node(
      probe.definitions.node(probe.sinkNode)!,
      {},
      ids.next(),
      doc,
      probe.definitions,
    );
    network.nodes.push(sink);
    for (const p of call.ports.filter((p) => p.direction === "output")) {
      const target = sink.ports.find((q) => q.key === p.key)!;
      network.edges.push({
        id: ids.next(),
        from: { nodeId: call.id, portKey: p.key },
        to: { nodeId: sink.id, portKey: p.key },
        adaptation: typeSystem(doc, probe.definitions).adaptation(p, target),
        extensions: {},
      });
    }
    validateDocumentStructure(doc);
    const graph = new Graph(doc, probe.definitions, ids);
    const compiled = compile(graph.capture(), probe.definitions, profile);
    graph.dispose();
    demand(
      compiled.status === "success",
      "PERSONAL_COMPILE",
      compiled.diagnostics.map((d) => d.code + ": " + d.message).join("; "),
    );
    result.push(compiled);
  }
  return result;
}
export async function buildPersonal(
  snapshot: GraphSnapshot,
  defs: DefinitionSet,
  rootId: string,
  profile: GLSLProfile,
  probeProvider?: PackageProbe,
): Promise<PersonalPackage> {
  const resources = closure(snapshot.document.graph.resources, [rootId], defs),
    source = rootId;
  const root = resources.find((r) => r.id === source),
    data = root && asNetwork(root, defs);
  demand(data, "PERSONAL_ENTRY");
  const inputs = personalSources(resources, defs),
    doc = shell(snapshot, []),
    network = doc.graph.stages.find(
      (s) => s.implementation === "network",
    )!.network;
  const call = defs.nodeByRole("call");
  demand(call, "NETWORK_MODULE");
  const sourceDoc = shell(snapshot, resources);
  const packet: ClipboardPacket = {
    format: "grape.clipboard",
    version: 1,
    graphId: "source",
    loadId: "source",
    modules: doc.graph.modules,
    resources: structuredClone(resources),
    network: {
      id: "entry",
      nodes: [
        node(call, { definition: rootId }, "entry-call", sourceDoc, defs),
      ],
      edges: [],
      extensions: {},
    },
  };
  let i = 0;
  pastePacket(
    doc,
    defs,
    { next: () => "p" + ++i },
    "target",
    network.id,
    packet,
    { key: null, admittedSources: inputs },
  );
  const entry = (network.nodes[0].state as { definition: string }).definition;
  for (const r of doc.graph.resources) {
    const n = asNetwork(r, defs);
    if (n) {
      n.local = true;
      n.origin = null;
    }
  }
  // Cached port/default snapshots are materialized in the package's own input
  // context, rather than retaining one source caller's temporary extent.
  const normalized = new Graph(doc, defs, {
    next: () => "normalization-" + ++i,
  });
  normalized.change("Materialize package input defaults", () => {});
  const normalizedDocument = normalized.capture().document;
  demand(
    normalizedDocument.graph.losses.length === 0,
    "PERSONAL_DEFAULT_CONTEXT",
  );
  doc.graph.resources = structuredClone(normalizedDocument.graph.resources);
  normalized.dispose();
  const used = new Map<string, PersonalPackage["modules"][number]>();
  const add = (pin: PersonalPackage["modules"][number]) => {
    const { moduleId, version, fingerprint } = pin;
    used.set(pinKey(pin), { moduleId, version, fingerprint });
  };
  doc.graph.resources.forEach((r) => {
    add(r.type);
    asNetwork(r, defs)?.network.nodes.forEach((n) => add(n.type));
  });
  add(call.ref);
  const stageKindIds = profile.stageKindIds.filter((stage) =>
    resources.every(
      (r) =>
        !asNetwork(r, defs) ||
        asNetwork(r, defs)!.network.nodes.every((n) =>
          defs.node(n.type)?.eligibility.stageKindIds.includes(stage),
        ),
    ),
  );
  const body = {
    format: "grape.personal" as const,
    version: 1 as const,
    name: data.name,
    entry,
    stageKindIds,
    profile: profile.ref,
    modules: [...used.values()].sort((a, b) =>
      pinKey(a).localeCompare(pinKey(b)),
    ),
    resources: doc.graph.resources,
  };
  const asset = { ...body, contentHash: await digest(body) };
  qualifyPackage(asset, defs, profile, probeProvider);
  demand(
    bytes(JSON.stringify(asset)) <= PERSONAL_LIMITS.fileBytes,
    "PERSONAL_SIZE",
  );
  return detached(asset);
}
export async function readPersonal(
  text: string,
  defs: DefinitionSet,
  profile: GLSLProfile,
  probeProvider?: PackageProbe,
): Promise<PersonalPackage> {
  demand(bytes(text) <= PERSONAL_LIMITS.fileBytes, "PERSONAL_SIZE");
  const raw = parseJSON(text);
  plain(raw);
  const asset = raw as unknown as PersonalPackage;
  demand(
    asset && typeof asset === "object" && !Array.isArray(asset),
    "PERSONAL_FORMAT",
  );
  const keys = [
    "format",
    "version",
    "name",
    "entry",
    "stageKindIds",
    "profile",
    "modules",
    "resources",
    "contentHash",
  ];
  demand(
    Object.keys(asset).length === keys.length &&
      keys.every((k) => Object.hasOwn(asset, k)) &&
      asset.format === "grape.personal" &&
      asset.version === 1 &&
      typeof asset.name === "string" &&
      asset.name.trim() &&
      typeof asset.entry === "string" &&
      Array.isArray(asset.modules) &&
      Array.isArray(asset.resources) &&
      Array.isArray(asset.stageKindIds) &&
      typeof asset.contentHash === "string",
    "PERSONAL_FORMAT",
  );
  const { contentHash, ...body } = asset;
  demand(
    /^[a-f0-9]{64}$/.test(contentHash) && (await digest(body)) === contentHash,
    "PERSONAL_CHECKSUM",
  );
  qualifyPackage(asset, defs, profile, probeProvider);
  return detached(asset);
}
export function personalFilename(name: string): string {
  let stem =
    name
      .trim()
      .replace(/[\s<>:"/\\|?*\x00-\x1f\x7f]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/[. ]+$/g, "") || "Subgraph";
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(stem))
    stem = "_" + stem;
  while (bytes(stem) > 180) stem = [...stem].slice(0, -1).join("");
  return stem + ".sgrape-function.json";
}
export class PersonalLibrary {
  constructor(
    readonly store: LibraryStore,
    readonly definitions: DefinitionSet,
    readonly profile: GLSLProfile,
    readonly probeProvider?: PackageProbe,
  ) {}
  async list() {
    const files = [...(await this.store.list())]
      .filter((f) => f.name.toLowerCase().endsWith(".sgrape-function.json"))
      .sort((a, b) =>
        a.name.toLowerCase() < b.name.toLowerCase()
          ? -1
          : a.name.toLowerCase() > b.name.toLowerCase()
            ? 1
            : 0,
      );
    const items: { name: string; asset: PersonalPackage }[] = [],
      issues: { name: string; code: string }[] = [],
      hashes = new Set<string>();
    let total = 0;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      try {
        demand(i < PERSONAL_LIMITS.files, "PERSONAL_FILE_LIMIT");
        demand(
          f.kind === "file" &&
            f.scope === this.store.scope &&
            !/[\\/]/.test(f.name) &&
            f.name !== "." &&
            f.name !== "..",
          "PERSONAL_SCOPE",
        );
        total += bytes(f.text);
        demand(total <= PERSONAL_LIMITS.totalBytes, "PERSONAL_TOTAL_SIZE");
        const asset = await readPersonal(
          f.text,
          this.definitions,
          this.profile,
          this.probeProvider,
        );
        if (!hashes.has(asset.contentHash)) {
          hashes.add(asset.contentHash);
          items.push({ name: f.name, asset });
        }
      } catch (e) {
        issues.push({
          name: f.name,
          code: e instanceof Error ? e.name : String(e),
        });
      }
    }
    return { items, issues };
  }
  async save(asset: PersonalPackage) {
    const text = JSON.stringify(asset);
    await readPersonal(
      text,
      this.definitions,
      this.profile,
      this.probeProvider,
    );
    const existing = await this.list(),
      same = existing.items.find(
        (i) => i.asset.contentHash === asset.contentHash,
      );
    if (same) return { name: same.name, reused: true };
    const initial = personalFilename(asset.name),
      stem = initial.slice(0, -".sgrape-function.json".length);
    for (let i = 1; i <= 10000; i++) {
      const suffix = i === 1 ? "" : "_" + i;
      let prefix = stem;
      while (bytes(prefix + suffix) > 180)
        prefix = [...prefix].slice(0, -1).join("");
      const name = prefix + suffix + ".sgrape-function.json";
      if ((await this.store.publish(name, text)) === "created")
        return { name, reused: false };
      const concurrent = (await this.list()).items.find(
        (item) => item.asset.contentHash === asset.contentHash,
      );
      if (concurrent) return { name: concurrent.name, reused: true };
    }
    throw Error("PERSONAL_NAME_EXHAUSTED");
  }
}
