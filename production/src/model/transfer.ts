import {
  validateNetworkStructure,
  validateResourceStructure,
} from "../sdk/document-validation.ts";
import type {
  CanonicalGraphDocument,
  NetworkDocument,
  ResourceDocument,
  NodeDocument,
  DocumentReference,
} from "../sdk/document.ts";
import type { DefinitionSet, GraphSnapshot } from "../sdk/editing.ts";
import type { Json } from "../sdk/public-surface.ts";
import type { IdentitySource } from "../sdk/kernel.ts";
import type { StructureData, SourceData } from "../sdk/networks.ts";
import { asNetwork, networkAt, frames } from "../sdk/networks.ts";
import { demand, detached, plain, equal } from "../sdk/kernel.ts";
import { typeReferences, remapType, parseType } from "../sdk/type-tokens.ts";
export interface ClipboardPacket {
  format: "grape.clipboard";
  version: 1;
  graphId: string;
  loadId: string;
  modules: CanonicalGraphDocument["graph"]["modules"];
  network: NetworkDocument;
  resources: ResourceDocument[];
}
export function nodeReferences(
  n: NodeDocument,
  defs: DefinitionSet,
): DocumentReference[] {
  const def = defs.node(n.type);
  demand(def && n.referencesComplete, "REFERENCES_INCOMPLETE");
  return [
    ...n.references,
    ...(def.stateReferences?.collect(detached(n.state)) ?? []),
    ...n.ports.flatMap((p) =>
      typeReferences(p.type).map((id) => ({
        slot: "type:" + p.key,
        kind: "resource" as const,
        targetId: id,
      })),
    ),
  ];
}
export function dependencies(
  r: ResourceDocument,
  defs: DefinitionSet,
): string[] {
  const def = defs.resource(r.type);
  demand(def && r.referencesComplete, "REFERENCES_INCOMPLETE");
  demand(
    def.model || def.stateReferences || def.referencePolicy === "declared",
    "RESOURCE_TRAVERSAL",
  );
  const refs = [
    ...r.references,
    ...(def.stateReferences?.collect(detached(r.data)) ?? []),
  ];
  const ids = refs.filter((x) => x.kind === "resource").map((x) => x.targetId);
  const data = asNetwork(r, defs);
  if (data) {
    for (const n of data.network.nodes) {
      const role = defs.node(n.type)?.modelRole;
      for (const ref of nodeReferences(n, defs)) {
        if (ref.kind === "node")
          demand(
            data.network.nodes.some((n) => n.id === ref.targetId) &&
              (!ref.networkId || ref.networkId === data.network.id),
            "REFERENCE_ESCAPE",
          );
        else if (
          !(
            ref.targetId === r.id &&
            (role === "network-input" || role === "network-output")
          )
        )
          ids.push(ref.targetId);
      }
    }
    for (const p of data.interface) ids.push(...typeReferences(p.type));
  }
  if (def.model === "structure")
    for (const f of (r.data as unknown as StructureData).fields)
      ids.push(...typeReferences(f.type));
  if (def.model === "source")
    ids.push(...typeReferences((r.data as unknown as SourceData).type));
  return [...new Set(ids)];
}
export function closure(
  resources: readonly ResourceDocument[],
  roots: readonly string[],
  defs: DefinitionSet,
): ResourceDocument[] {
  const output: ResourceDocument[] = [],
    done = new Set<string>(),
    active = new Set<string>();
  const walk = (id: string) => {
    demand(!active.has(id), "DEPENDENCY_CYCLE");
    if (done.has(id)) return;
    const r = resources.find((r) => r.id === id);
    demand(r, "DEPENDENCY_MISSING");
    active.add(id);
    for (const d of dependencies(r, defs)) walk(d);
    active.delete(id);
    done.add(id);
    output.push(r);
  };
  roots.forEach(walk);
  return output;
}
export function copySelection(
  snapshot: GraphSnapshot,
  defs: DefinitionSet,
  networkId: string,
  selection: readonly string[],
): ClipboardPacket {
  const source = networkAt(snapshot.document, defs, networkId),
    nodes = source.nodes.filter(
      (n) => selection.includes(n.id) && defs.node(n.type)?.role !== "boundary",
    ),
    ids = new Set(nodes.map((n) => n.id)),
    roots: string[] = [];
  for (const n of nodes)
    for (const r of nodeReferences(n, defs)) {
      if (r.kind === "resource") roots.push(r.targetId);
      else
        demand(
          (!r.networkId || r.networkId === networkId) && ids.has(r.targetId),
          "REFERENCE_ESCAPE",
        );
    }
  roots.push(
    ...frames(snapshot.document, defs, networkId)
      .filter((f) => f.nodeIds.length && f.nodeIds.every((id) => ids.has(id)))
      .map((f) => f.id),
  );
  const resources = closure(snapshot.document.graph.resources, roots, defs);
  const included = new Map([
    [networkId, ids],
    ...resources.flatMap((r) => {
      const nested = asNetwork(r, defs);
      return nested
        ? [
            [
              nested.network.id,
              new Set(nested.network.nodes.map((n) => n.id)),
            ] as const,
          ]
        : [];
    }),
  ]);
  for (const r of resources)
    for (const ref of [
      ...r.references,
      ...(defs.resource(r.type)?.stateReferences?.collect(detached(r.data)) ??
        []),
    ]) {
      if (ref.kind === "node")
        demand(
          ref.networkId && included.get(ref.networkId)?.has(ref.targetId),
          "REFERENCE_ESCAPE",
        );
    }
  return detached({
    format: "grape.clipboard",
    version: 1,
    graphId: snapshot.document.graph.id,
    loadId: snapshot.loadId,
    modules: snapshot.document.graph.modules,
    network: {
      id: networkId,
      nodes,
      edges: source.edges.filter(
        (e) => ids.has(e.from.nodeId) && ids.has(e.to.nodeId),
      ),
      extensions: {},
    },
    resources,
  });
}
export function pastePacket(
  document: CanonicalGraphDocument,
  defs: DefinitionSet,
  ids: IdentitySource,
  loadId: string,
  networkId: string,
  packet: ClipboardPacket,
): string[] {
  plain(packet);
  validateNetworkStructure(packet.network);
  for (const r of packet.resources) {
    validateResourceStructure(r);
    const def = defs.resource(r.type);
    demand(
      def && !def.codec.validate(r.data).some((i) => i.severity === "error"),
      "RESOURCE_STATE",
    );
    const n = asNetwork(r, defs);
    if (n) validateNetworkStructure(n.network);
  }
  demand(
    packet.format === "grape.clipboard" &&
      packet.version === 1 &&
      Array.isArray(packet.resources) &&
      Array.isArray(packet.network.nodes) &&
      Array.isArray(packet.network.edges),
    "CLIPBOARD_FORMAT",
  );
  demand(
    new TextEncoder().encode(JSON.stringify(packet)).length <= 512000,
    "CLIPBOARD_SIZE",
  );
  demand(
    packet.network.nodes.length <= 2048 &&
      packet.network.edges.length <= 8192 &&
      packet.resources.filter((r) => defs.resource(r.type)?.model === "network")
        .length <= 64,
    "CLIPBOARD_LIMIT",
  );
  demand(
    packet.modules.every(
      (p) => defs.module(p) && document.graph.modules.some((q) => equal(p, q)),
    ),
    "CLIPBOARD_MODULE",
  );
  if (!packet.network.nodes.length) {
    demand(
      !packet.resources.length && !packet.network.edges.length,
      "CLIPBOARD_EMPTY",
    );
    return [];
  }
  const same = document.graph.id === packet.graphId && loadId === packet.loadId,
    resourceIds = new Set(packet.resources.map((r) => r.id));
  demand(resourceIds.size === packet.resources.length, "DUPLICATE_RESOURCE");
  closure(packet.resources, [...resourceIds], defs);
  const includedNodes = new Map([
    [packet.network.id, new Set(packet.network.nodes.map((n) => n.id))],
    ...packet.resources.flatMap((r) => {
      const nested = asNetwork(r, defs);
      return nested
        ? [
            [
              nested.network.id,
              new Set(nested.network.nodes.map((n) => n.id)),
            ] as const,
          ]
        : [];
    }),
  ]);
  for (const r of packet.resources)
    for (const ref of [
      ...r.references,
      ...(defs.resource(r.type)?.stateReferences?.collect(detached(r.data)) ??
        []),
    ])
      if (ref.kind === "node")
        demand(
          ref.networkId && includedNodes.get(ref.networkId)?.has(ref.targetId),
          "REFERENCE_ESCAPE",
        );
  for (const r of packet.resources) {
    const current = document.graph.resources.find((x) => x.id === r.id);
    if (current && defs.resource(r.type)?.model === "structure")
      demand(equal(current, r), "NOMINAL_CONTENT_CONFLICT");
  }
  const occupied = new Set([
    ...resourceIds,
    ...document.graph.resources.map((r) => r.id),
  ]);
  const allocate = () => {
    for (let i = 0; i < 10000; i++) {
      const id = ids.next();
      if (!occupied.has(id)) {
        occupied.add(id);
        return id;
      }
    }
    throw Error("IDENTITY_EXHAUSTED");
  };
  const reused = new Set(
    packet.resources
      .filter(
        (r) =>
          same &&
          ![
            ...r.references,
            ...(defs
              .resource(r.type)
              ?.stateReferences?.collect(detached(r.data)) ?? []),
          ].some(
            (ref) => ref.kind === "node" && ref.networkId === packet.network.id,
          ) &&
          document.graph.resources.some((x) => x.id === r.id),
      )
      .map((r) => r.id),
  );
  // A reused resource cannot retain a reference to a dependency that this paste clones.
  let changed = true;
  while (changed) {
    changed = false;
    for (const resource of packet.resources)
      if (
        reused.has(resource.id) &&
        dependencies(resource, defs).some((id) => !reused.has(id))
      ) {
        reused.delete(resource.id);
        changed = true;
      }
  }
  demand(
    document.graph.resources.filter(
      (r) => defs.resource(r.type)?.model === "network",
    ).length +
      packet.resources.filter(
        (r) => defs.resource(r.type)?.model === "network" && !reused.has(r.id),
      ).length <=
      64,
    "DEFINITION_LIMIT",
  );
  const map = new Map(
    packet.resources.map((r) => [r.id, reused.has(r.id) ? r.id : allocate()]),
  );
  const networkMap = new Map<string, string>(),
    nodeMaps = new Map<string, Map<string, string>>();
  const target = networkAt(document, defs, networkId);
  networkMap.set(packet.network.id, networkId);
  const setup = (network: NetworkDocument, reuse = false) => {
    demand(
      new Set(network.nodes.map((n) => n.id)).size === network.nodes.length,
      "DUPLICATE_NODE",
    );
    nodeMaps.set(
      network.id,
      new Map(network.nodes.map((n) => [n.id, reuse ? n.id : ids.next()])),
    );
  };
  const networkIds = [
    packet.network.id,
    ...packet.resources.flatMap((r) => {
      const n = asNetwork(r, defs);
      return n ? [n.network.id] : [];
    }),
  ];
  demand(new Set(networkIds).size === networkIds.length, "DUPLICATE_NETWORK");
  setup(packet.network);
  for (const r of packet.resources) {
    const data = asNetwork(r, defs);
    if (data) {
      networkMap.set(
        data.network.id,
        reused.has(r.id) ? data.network.id : ids.next(),
      );
      setup(data.network, reused.has(r.id));
    }
  }
  const remap = (
    ref: DocumentReference,
    current: string,
  ): DocumentReference => {
    if (ref.kind === "resource") {
      const id = map.get(ref.targetId);
      demand(id, "DEPENDENCY_MISSING");
      return { ...ref, targetId: id };
    }
    const network = ref.networkId ?? current,
      id = nodeMaps.get(network)?.get(ref.targetId);
    demand(id, "REFERENCE_ESCAPE");
    return {
      ...ref,
      targetId: id,
      ...(ref.networkId ? { networkId: networkMap.get(network)! } : {}),
    };
  };
  const remapNetwork = (network: NetworkDocument) => {
    const old = network.id,
      nodeMap = nodeMaps.get(old)!;
    network.id = networkMap.get(old)!;
    for (const n of network.nodes) {
      const def = defs.node(n.type);
      demand(def && n.referencesComplete, "REFERENCES_INCOMPLETE");
      n.id = nodeMap.get(n.id)!;
      n.references = n.references.map((r) => remap(r, old));
      if (def.stateReferences)
        n.state = def.stateReferences.remap(detached(n.state), (r) =>
          remap(r, old),
        );
      n.ports = n.ports.map((p) => ({ ...p, type: remapType(p.type, map) }));
    }
    for (const e of network.edges) {
      demand(
        nodeMap.has(e.from.nodeId) && nodeMap.has(e.to.nodeId),
        "EDGE_ENDPOINT",
      );
      e.id = ids.next();
      e.from.nodeId = nodeMap.get(e.from.nodeId)!;
      e.to.nodeId = nodeMap.get(e.to.nodeId)!;
      e.adaptation.sourceType = remapType(e.adaptation.sourceType, map);
      e.adaptation.targetType = remapType(e.adaptation.targetType, map);
    }
  };
  const imported: ResourceDocument[] = [];
  for (const original of packet.resources) {
    if (reused.has(original.id)) continue;
    const r = structuredClone(original),
      def = defs.resource(r.type)!;
    r.id = map.get(original.id)!;
    if (def.model === "source") {
      const data = r.data as unknown as SourceData;
      const token = parseType(data.type);
      const scalar = (id: string) =>
        /^glsl.(float|int|uint|vec[234]|mat[234](x[234])?)$/.test(id);
      demand(
        data.clipboard &&
          ((token.kind === "scalar" && scalar(token.id)) ||
            (token.kind === "array" &&
              token.element.kind === "scalar" &&
              /^glsl.(float|vec[234])$/.test(token.element.id))),
        "SOURCE_CLIPBOARD_DENIED",
      );
      // Native-source path budgets are distinct from this inline numeric array value.
      let base = data.name,
        i = 2;
      while (
        [...document.graph.resources, ...imported].some(
          (x) =>
            defs.resource(x.type)?.model === "source" &&
            (x.data as unknown as SourceData).name === data.name,
        )
      )
        data.name = base + " " + i++;
      data.type = remapType(data.type, map);
    }
    if (def.stateReferences)
      r.data = structuredClone(
        def.stateReferences.remap(detached(r.data), (ref) => remap(ref, "")),
      );
    r.references = r.references.map((ref) => remap(ref, ""));
    const data = asNetwork(r, defs);
    if (data) {
      data.local = true;
      remapNetwork(data.network);
      data.interface = data.interface.map((p) => ({
        ...p,
        type: remapType(p.type, map),
      }));
    }
    if (def.model === "structure")
      for (const field of (r.data as unknown as StructureData).fields)
        field.type = remapType(field.type, map);
    imported.push(r);
  }
  const network = structuredClone(packet.network);
  remapNetwork(network);
  for (const n of network.nodes) {
    demand(defs.node(n.type)?.role !== "boundary", "BOUNDARY_PROTECTED");
    demand(
      defs.node(n.type)?.modelRole !== "source" ||
        document.graph.stages.some((s) => s.network.id === networkId),
      "SOURCE_ADMISSION",
    );
    let base = n.name,
      i = 2;
    while (
      [...target.nodes, ...network.nodes.filter((x) => x !== n)].some(
        (x) => x.name === n.name,
      )
    )
      n.name = base + " " + i++;
    n.position = [n.position[0] + 40, n.position[1] + 40];
  }
  document.graph.resources.push(...imported);
  target.nodes.push(...network.nodes);
  target.edges.push(...network.edges);
  return network.nodes.map((n) => n.id);
}
