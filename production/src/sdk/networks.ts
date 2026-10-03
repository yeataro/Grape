import { parseType, formatType } from "./type-tokens.ts";
import type { Json } from "./public-surface.ts";
import type {
  CanonicalGraphDocument,
  ResourceDocument,
  NetworkDocument,
  PortSnapshot,
  DocumentReference,
} from "./document.ts";
import type { DefinitionSet, ModelContext } from "./editing.ts";
import { demand, detached } from "./kernel.ts";
export interface NetworkData {
  name: string;
  local: boolean;
  origin: string | null;
  network: NetworkDocument;
  interface: (PortSnapshot & { name: string })[];
  dependencies: string[];
}
export interface StructureData {
  name: string;
  description?: string;
  fields: { id: string; name: string; type: string }[];
}
export interface SourceData {
  name: string;
  type: string;
  value: Json;
  clipboard: boolean;
  binding?:
    | { kind: "constant" | "uniform" }
    | { kind: "native-array" | "sampler"; path: string }
    | {
        kind: "top";
        path: string;
        source: string;
        origin: string;
        slot: number;
      }
    | { kind: "specialization"; constantId: number };
}
export function asNetwork(
  resource: ResourceDocument,
  defs: DefinitionSet,
): NetworkData | null {
  return defs.resource(resource.type)?.model === "network"
    ? (resource.data as unknown as NetworkData)
    : null;
}
export function networks(doc: CanonicalGraphDocument, defs: DefinitionSet) {
  return [
    ...doc.graph.stages.map((s) => ({
      network: s.network,
      stageKindId: s.stageKindId,
      stageId: s.id,
      resource: null as ResourceDocument | null,
    })),
    ...doc.graph.resources.flatMap((resource) => {
      const d = asNetwork(resource, defs);
      return d
        ? [
            {
              network: d.network,
              stageKindId:
                definitionStages(doc, defs, resource.id)[0] ?? "unavailable",
              stageId: resource.id,
              resource,
            },
          ]
        : [];
    }),
  ];
}
export function networkAt(
  doc: CanonicalGraphDocument,
  defs: DefinitionSet,
  id: string,
): NetworkDocument {
  const n = networks(doc, defs).find((n) => n.network.id === id);
  demand(n, "NETWORK_MISSING");
  return n.network;
}
export function callResource(
  node: import("./document.ts").NodeDocument,
  defs: DefinitionSet,
): string | null {
  return defs.node(node.type)?.modelRole === "call"
    ? (node.state as { definition: string }).definition
    : null;
}
export function resolveOccurrence(
  doc: CanonicalGraphDocument,
  defs: DefinitionSet,
  stageId: string,
  path: readonly string[],
) {
  const stage = doc.graph.stages.find((s) => s.id === stageId);
  demand(stage, "STAGE_MISSING");
  let network = stage.network;
  const chain: string[] = [];
  for (const id of path) {
    const node = network.nodes.find((n) => n.id === id);
    demand(node, "OCCURRENCE_MISSING");
    const ref = callResource(node, defs);
    const resource = doc.graph.resources.find((r) => r.id === ref);
    demand(resource, "DEFINITION_MISSING");
    const data = asNetwork(resource, defs);
    demand(data && !chain.includes(resource.id), "DEFINITION_CYCLE");
    chain.push(resource.id);
    network = data.network;
  }
  return { network, chain };
}
export function modelContext(
  doc: CanonicalGraphDocument,
  defs: DefinitionSet,
): ModelContext {
  return Object.freeze({
    resources: detached(doc.graph.resources),
    types: typeSystem(doc, defs),
  });
}
export function resourceReferences(
  resource: ResourceDocument,
  defs: DefinitionSet,
): DocumentReference[] {
  const def = defs.resource(resource.type);
  demand(def, "RESOURCE_MISSING");
  demand(resource.referencesComplete, "REFERENCES_INCOMPLETE");
  return [
    ...resource.references,
    ...(def.stateReferences?.collect(detached(resource.data)) ?? []),
  ];
}

export function typeSystem(doc: CanonicalGraphDocument, defs: DefinitionSet) {
  return defs.types.forResources(
    doc.graph.resources.map((r) => ({
      id: r.id,
      model: defs.resource(r.type)?.model,
      data: r.data,
      ...(defs.resource(r.type)?.resolveExtent
        ? {
            extent: defs.resource(r.type)!.resolveExtent!(
              detached(r.data),
              detached(doc.graph.resources),
              detached(networks(doc, defs).map((n) => n.network)),
            ),
          }
        : {}),
    })),
  );
}

export function definitionStages(
  doc: CanonicalGraphDocument,
  defs: DefinitionSet,
  id: string,
  active: readonly string[] = [],
): string[] {
  if (active.includes(id)) return [];
  const resource = doc.graph.resources.find((r) => r.id === id),
    data = resource && asNetwork(resource, defs);
  if (!data) return [];
  let stages = [...new Set(doc.graph.stages.map((s) => s.stageKindId))];
  for (const n of data.network.nodes) {
    const def = defs.node(n.type);
    if (!def) return [];
    const called = callResource(n, defs),
      allowed = called
        ? definitionStages(doc, defs, called, [...active, id])
        : def.eligibility.stageKindIds;
    stages = stages.filter((s) => allowed.includes(s));
  }
  return stages;
}

export interface FrameData {
  name: string;
  networkId: string;
  nodeIds: string[];
  position: [number, number];
  size: [number, number];
  color: string;
}
export function frames(
  document: CanonicalGraphDocument,
  defs: DefinitionSet,
  networkId: string,
): (FrameData & { id: string })[] {
  return document.graph.resources
    .filter(
      (r) =>
        defs.resource(r.type)?.model === "frame" &&
        (r.data as unknown as FrameData).networkId === networkId,
    )
    .map((r) => ({ id: r.id, ...(r.data as unknown as FrameData) }));
}

/** Resolve an authored symbolic-array default for the current captured extent.
 * Only extent length varies; malformed element values remain errors. */
export function materializeDefault(
  type: string,
  value: import("./public-surface.ts").Json,
  types: import("./editing.ts").TypeSystem,
): import("./public-surface.ts").Json {
  const token = parseType(type);
  if (
    token.kind === "array" &&
    typeof token.extent !== "number" &&
    Array.isArray(value) &&
    value.every((v) => types.validValue(formatType(token.element), v))
  )
    return types.reshape(type, value);
  return value;
}
