import type {
  CanonicalGraphDocument,
  DocumentRead,
  ModulePin,
} from "../sdk/document.ts";
import type { Json } from "../sdk/public-surface.ts";
import { demand, plain, detached, pinKey } from "../sdk/kernel.ts";
/** Independent JSON parser: object keys are checked before assigning any parsed member. */
export function parseJSON(source: string, maxDepth = 128): Json {
  let offset = 0;
  const space = () => {
    while (offset < source.length && /[ \t\r\n]/.test(source[offset])) offset++;
  };
  const string = (): string => {
    const start = offset++;
    while (offset < source.length) {
      const c = source[offset++];
      if (c === "\\") offset++;
      else if (c === '"') return JSON.parse(source.slice(start, offset));
    }
    throw Error("JSON_STRING");
  };
  const value = (depth: number): Json => {
    demand(depth <= maxDepth, "JSON_DEPTH");
    space();
    const c = source[offset];
    if (c === '"') return string();
    if (c === "{" || c === "[") {
      const object = c === "{",
        end = object ? "}" : "]",
        entries: Record<string, Json> = {},
        array: Json[] = [],
        keys = new Set<string>();
      offset++;
      space();
      if (source[offset] === end) {
        offset++;
        return object ? entries : array;
      }
      while (true) {
        let key = "";
        if (object) {
          demand(source[offset] === '"', "JSON_KEY");
          key = string();
          demand(!keys.has(key), "DUPLICATE_JSON_KEY");
          keys.add(key);
          space();
          demand(source[offset++] === ":", "JSON_COLON");
        }
        const item = value(depth + 1);
        if (object)
          Object.defineProperty(entries, key, {
            value: item,
            enumerable: true,
            writable: true,
            configurable: true,
          });
        else array.push(item);
        space();
        const next = source[offset++];
        if (next === end) break;
        demand(next === ",", "JSON_SEPARATOR");
        space();
      }
      return object ? entries : array;
    }
    const match =
      /^(true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(
        source.slice(offset),
      );
    demand(match, "JSON_TOKEN");
    offset += match[0].length;
    const result = JSON.parse(match[0]);
    demand(
      typeof result !== "number" || Number.isFinite(result),
      "JSON_NUMBER",
    );
    return result;
  };
  const result = value(0);
  space();
  demand(offset === source.length, "JSON_TRAILING");
  return result;
}
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
  const check = payloads[String(r.kind)];
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
export function readDocument(
  raw: string,
  available: (pin: ModulePin) => boolean = () => true,
): DocumentRead {
  try {
    demand(
      new TextEncoder().encode(raw).byteLength <= 16 * 1024 * 1024,
      "DOCUMENT_SIZE",
    );
    const parsed = parseJSON(raw),
      o = record(parsed, "$");
    if (o.format !== "grape.document")
      return {
        status: "foreign",
        raw,
        format: typeof o.format === "string" ? o.format : null,
        reason: "IMPORT_CONVERTER_REQUIRED",
      };
    const version = record(o.formatVersion, "$.formatVersion");
    natural(version.major, "major", []);
    natural(version.minor, "minor", []);
    if (version.major !== 2 || version.minor !== 0)
      return {
        status: "recovery-readonly",
        raw,
        reason: "UNSUPPORTED_VERSION",
        unknownPaths: ["$.formatVersion"],
      };
    const unknowns: string[] = [];
    envelope(parsed, "$", unknowns);
    const document = parsed as unknown as CanonicalGraphDocument;
    pins(document);
    if (unknowns.length)
      return {
        status: "recovery-readonly",
        raw,
        reason: "UNKNOWN_STRUCTURE",
        unknownPaths: unknowns,
      };
    const unresolvedModules = document.graph.modules.filter(
      (p) => !available(p),
    );
    return {
      status: "editable",
      document: detached(document),
      unresolvedModules,
      generationBlockedByMissingModules: unresolvedModules.length > 0,
    };
  } catch (error) {
    return {
      status: "rejected",
      raw,
      reason:
        error instanceof Error
          ? error.name + ": " + error.message
          : String(error),
    };
  }
}
export function writeDocument(document: CanonicalGraphDocument): string {
  plain(document);
  const unknowns: string[] = [];
  envelope(document, "$", unknowns);
  demand(
    document.format === "grape.document" &&
      document.formatVersion.major === 2 &&
      document.formatVersion.minor === 0,
    "FORMAT_VERSION",
  );
  pins(document);
  demand(!unknowns.length, "UNKNOWN_STRUCTURE");
  return JSON.stringify(document, null, 2);
}
