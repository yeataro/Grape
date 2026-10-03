import type { CanonicalGraphDocument, ModulePin } from "./document.ts";
import { demand, plain, pinKey } from "./kernel.ts";

// Pure canonical structure rules shared by intake, writing and Graph publication.
type Check = (value: unknown, path: string, unknowns: string[]) => void;
const nonempty: Check = (v, p) =>
  demand(typeof v === "string" && v.length > 0, "STRING", p);
const boolean: Check = (v, p) => demand(typeof v === "boolean", "BOOLEAN", p);
const finite: Check = (v, p) =>
  demand(typeof v === "number" && Number.isFinite(v), "NUMBER", p);
const natural: Check = (v, p) =>
  demand(Number.isSafeInteger(v) && Number(v) >= 0, "VERSION", p);
const positive: Check = (v, p) =>
  demand(Number.isSafeInteger(v) && Number(v) > 0, "VERSION", p);
const opaque: Check = (v) => plain(v);
function enumOf(...options: string[]): Check {
  return (v, p) =>
    demand(typeof v === "string" && options.includes(v), "ENUM", p);
}
function record(v: unknown, p: string): Record<string, unknown> {
  demand(v && typeof v === "object" && !Array.isArray(v), "OBJECT", p);
  return v as Record<string, unknown>;
}
function shape(
  required: Record<string, Check>,
  optional: Record<string, Check> = {},
): Check {
  return (v, p, u) => {
    const o = record(v, p);
    for (const [key, check] of Object.entries(required)) {
      demand(Object.hasOwn(o, key), "REQUIRED", p + "." + key);
      check(o[key], p + "." + key, u);
    }
    for (const key of Object.keys(o)) {
      if (Object.hasOwn(required, key)) continue;
      const check = Object.hasOwn(optional, key) ? optional[key] : undefined;
      if (check) check(o[key], p + "." + key, u);
      else u.push(p + "." + key);
    }
  };
}
function list(check: Check, identity?: (v: unknown) => string): Check {
  return (v, p, u) => {
    demand(Array.isArray(v), "ARRAY", p);
    const seen = new Set<string>();
    v.forEach((x, i) => {
      check(x, p + "[" + i + "]", u);
      if (identity) {
        const id = identity(x);
        demand(!seen.has(id), "DUPLICATE_IDENTITY", p);
        seen.add(id);
      }
    });
  };
}
const id = (v: unknown) => String(record(v, "").id);
const extensions: Check = (v, p) => {
  for (const key of Object.keys(record(v, p)))
    demand(
      /^[a-z][a-z0-9_-]*(\.[a-z][a-z0-9_-]*)+$/.test(key),
      "EXTENSION_NAMESPACE",
      p,
    );
};
const modulePin = shape({
  moduleId: nonempty,
  version: nonempty,
  fingerprint: nonempty,
});
const typeRef = shape({
  moduleId: nonempty,
  version: nonempty,
  fingerprint: nonempty,
  typeId: nonempty,
});
const kindRef = shape({
  moduleId: nonempty,
  version: nonempty,
  fingerprint: nonempty,
  kindId: nonempty,
});
const references = list(
  shape(
    { slot: nonempty, kind: enumOf("node", "resource"), targetId: nonempty },
    { networkId: nonempty },
  ),
  (v) => String(record(v, "").slot),
);
const port = shape(
  { key: nonempty, direction: enumOf("input", "output"), type: nonempty },
  {
    semantic: nonempty,
    supply: enumOf("local", "required"),
    defaultValue: opaque,
    requireConstant: boolean,
    connectionPolicy: enumOf("default", "numeric", "exact"),
  },
);
const position: Check = (v, p, u) => {
  demand(Array.isArray(v) && v.length === 2, "POSITION", p);
  v.forEach((n) => finite(n, p, u));
};
const dictionary: Check = (v, p) => {
  record(v, p);
  plain(v);
};
const node = shape({
  id: nonempty,
  name: nonempty,
  type: typeRef,
  state: opaque,
  inputValues: dictionary,
  ports: list(port, (v) => {
    const p = record(v, "");
    return p.direction + ":" + p.key;
  }),
  references,
  referencesComplete: boolean,
  position,
  extensions,
});
function wire(schema: string, body: Check): Check {
  return (v, p, u) => {
    const r = record(v, p);
    nonempty(r.schema, p + ".schema", u);
    positive(r.version, p + ".version", u);
    if (r.schema !== schema || r.version !== 1) u.push(p + ".schema/version");
    else body(v, p, u);
  };
}
const conversion = wire(
  "grape.edge-adaptation",
  shape({
    schema: nonempty,
    version: positive,
    sourceType: nonempty,
    targetType: nonempty,
    operation: (v, p, u) => {
      nonempty(v, p, u);
      if (
        ![
          "identity",
          "broadcast",
          "take-leading",
          "append-alpha-one",
          "numeric-cast",
        ].includes(v as string)
      )
        u.push(p);
    },
    extensions,
  }),
);
const endpoint = shape({ nodeId: nonempty, portKey: nonempty });
const edge = shape(
  {
    id: nonempty,
    from: endpoint,
    to: endpoint,
    adaptation: conversion,
    extensions,
  },
  { invalid: shape({ code: nonempty, reason: nonempty }) },
);
const resource = shape({
  id: nonempty,
  type: typeRef,
  data: opaque,
  references,
  referencesComplete: boolean,
  extensions,
});
const payloads: Record<string, Check> = {
  edge: shape({ kind: nonempty, networkId: nonempty, edge }),
  node: shape({ kind: nonempty, networkId: nonempty, node }),
  resource: shape({ kind: nonempty, resource }),
  "input-value": shape({
    kind: nonempty,
    networkId: nonempty,
    nodeId: nonempty,
    port: (v, p, u) => {
      port(v, p, u);
      demand(record(v, p).direction === "input", "LOSS_INPUT_DIRECTION", p);
    },
    value: opaque,
  }),
  module: shape({
    kind: nonempty,
    owner: modulePin,
    codecId: nonempty,
    codecVersion: positive,
    data: opaque,
    references,
    referencesComplete: boolean,
  }),
};
const payload: Check = (v, p, u) => {
  const r = record(v, p);
  nonempty(r.kind, p + ".kind", u);
  const check = Object.hasOwn(payloads, String(r.kind))
    ? payloads[String(r.kind)]
    : undefined;
  if (check) check(v, p, u);
  else u.push(p + ".kind");
};
const loss = wire(
  "grape.loss",
  shape({
    schema: nonempty,
    version: positive,
    id: nonempty,
    code: nonempty,
    reason: nonempty,
    payload,
    extensions,
  }),
);
const recovery = wire(
  "grape.recovery",
  shape(
    {
      schema: nonempty,
      version: positive,
      id: nonempty,
      reason: nonempty,
      payload,
      extensions,
    },
    { lossId: nonempty },
  ),
);
const network = shape({
  id: nonempty,
  nodes: (v, p, u) => {
    list(node, id)(v, p, u);
    list(node, (x) => String(record(x, p).name))(v, p, u);
  },
  edges: list(edge, id),
  extensions,
});
const stage = shape({
  id: nonempty,
  key: nonempty,
  stageKindId: nonempty,
  implementation: enumOf("network", "profile-default"),
  network,
  extensions,
});
const graph = shape({
  id: nonempty,
  name: nonempty,
  kind: kindRef,
  kindSettings: opaque,
  modules: list(modulePin, (v) => pinKey(v as ModulePin)),
  stages: (v, p, u) => {
    list(stage, id)(v, p, u);
    list(stage, (x) => String(record(x, p).key))(v, p, u);
    const ids = (v as { network: { id: string } }[]).map((s) => s.network.id);
    demand(new Set(ids).size === ids.length, "DUPLICATE_NETWORK");
  },
  resources: list(resource, id),
  losses: list(loss, id),
  recovery: list(recovery, id),
  extensions,
});
const envelope = shape({
  format: nonempty,
  formatVersion: shape({ major: natural, minor: natural }),
  graph,
});
function pins(document: CanonicalGraphDocument): void {
  const modules = new Set(document.graph.modules.map(pinKey));
  const ref = (p: ModulePin) =>
    demand(modules.has(pinKey(p)), "UNDECLARED_EXACT_PIN");
  ref(document.graph.kind);
  document.graph.stages.forEach((s) =>
    s.network.nodes.forEach((n) => ref(n.type)),
  );
  document.graph.resources.forEach((r) => ref(r.type));
  for (const item of [...document.graph.losses, ...document.graph.recovery]) {
    const p = item.payload;
    if (!p) continue;
    if (p.kind === "module") ref(p.owner);
    if (p.kind === "node") ref(p.node.type);
    if (p.kind === "resource") ref(p.resource.type);
  }
}
function networkLimits(document: CanonicalGraphDocument): void {
  demand(
    document.graph.stages.every(
      (s) => s.network.nodes.length <= 256 && s.network.edges.length <= 1024,
    ),
    "NETWORK_SIZE",
  );
}

/** Check all known structure before returning any unknown-field paths. */
export function inspectDocumentStructure(value: unknown): string[] {
  const unknowns: string[] = [];
  envelope(value, "$", unknowns);
  const document = value as CanonicalGraphDocument;
  pins(document);
  networkLimits(document);
  return unknowns;
}

/** Writable/publication contract: opaque JSON is retained; unknown structure is refused. */
export function validateDocumentStructure(
  document: CanonicalGraphDocument,
): void {
  plain(document);
  const unknowns = inspectDocumentStructure(document);
  demand(
    document.format === "grape.document" &&
      document.formatVersion.major === 2 &&
      document.formatVersion.minor === 0,
    "FORMAT_VERSION",
  );
  demand(!unknowns.length, "UNKNOWN_STRUCTURE");
}

export function validateNetworkStructure(value: unknown, limits = false): void {
  plain(value);
  const unknowns: string[] = [];
  network(value, "network", unknowns);
  demand(!unknowns.length, "UNKNOWN_STRUCTURE");
  if (limits) {
    const n = value as unknown as import("./document.ts").NetworkDocument;
    demand(n.nodes.length <= 256 && n.edges.length <= 1024, "NETWORK_SIZE");
  }
}

export function validateResourceStructure(value: unknown): void {
  plain(value);
  const unknowns: string[] = [];
  resource(value, "resource", unknowns);
  demand(!unknowns.length, "UNKNOWN_STRUCTURE");
}
