// Qualification mechanisms. This is NOT an implementation of the legacy node catalog.
import type { Adaptation, PortSpec, DefinitionResolver, GraphDocument, Issue, Json, ModuleContext, NodeRecord, Scalar, Value, ValueType } from "./contracts.ts";

export class ComputeContractError extends Error {
  readonly code: string;
  constructor(code: string, message: string) { super(message); this.code = code; }
}
function error(code: string, message: string): never { throw new ComputeContractError(code, message); }
function immutable<T>(value: T): T {
  const result = structuredClone(value);
  const freeze = (v: any): void => { if (v && typeof v === "object") { Object.values(v).forEach(freeze); Object.freeze(v); } };
  freeze(result); return result;
}
export const encodeIdentity = (id: string): string => Array.from(new TextEncoder().encode(id), b => b.toString(16).padStart(2, "0")).join("");

export function moduleContext(document: GraphDocument, node?: Pick<NodeRecord, "id" | "references">, stageKind: "vertex" | "pixel" = "pixel", definitions?: DefinitionResolver): ModuleContext {
  // Snapshot once. Callbacks cannot observe intermediate reconciliation or mutate the candidate.
  const resources = immutable(document.resources);
  const nodes = immutable(document.stages.flatMap(s => s.nodes));
  const edges = immutable(document.stages.flatMap(s => s.edges));
  const references = immutable(node?.references ?? {});
  return Object.freeze({
    graphKind: document.kind, stageKind, nodeId: node?.id ?? "",
    resource: (id: string) => resources.find(r => r.id === id)?.data,
    resources: (kind?: string) => kind === undefined ? resources : immutable(resources.filter(r => (r.data as any)?.kind === kind)),
    referenceId: (key: string) => references[key]?.targetId,
    resolveType: (ref: import("./contracts.ts").TypeRef) => definitions?.resolve(ref),
    inputSource: (key: string) => {
      const edge = edges.find(e => e.to.nodeId === node?.id && e.to.key === key);
      const port = edge && nodes.find(n => n.id === edge.from.nodeId)?.ports.find(p => p.direction === "output" && p.key === edge.from.key);
      return edge && port ? Object.freeze({ nodeId: edge.from.nodeId, key: edge.from.key, port }) : undefined;
    },
    reference: (key: string) => {
      const ref = references[key];
      return ref?.kind === "resource" ? resources.find(r => r.id === ref.targetId)?.data : ref?.kind === "node" ? nodes.find(n => n.id === ref.targetId) : undefined;
    },
  });
}

export type DataType =
  | { kind: "scalar"; scalar: Scalar }
  | { kind: "vector"; scalar: Scalar; width: number }
  | { kind: "matrix"; scalar: "float" | "double"; columns: number; rows: number }
  | { kind: "resource"; token: string }
  | { kind: "array"; element: ValueType; length: number | string }
  | { kind: "struct"; id: string; fields: { key: string; type: ValueType }[] };
const scalarNames = new Set(["float", "double", "int", "uint", "bool"]);
const scalarPrefix: Record<string, Scalar> = { "": "float", d: "double", i: "int", u: "uint", b: "bool" };
const resourcePattern = /^(?:[iu]?sampler(?:1D|2D|3D|Cube|2DArray|Buffer))$/;
export function automaticAdaptation(from: PortSpec, to: PortSpec): Adaptation | undefined {
  const a = from.type, b = to.type;
  if (a === b) return { from: a, to: b, op: "identity" };
  if (to.connectionPolicy === "exact") return undefined;
  if (to.connectionPolicy === "numeric") {
    const shape = (token: string): { scalar: Scalar; width: number } | undefined => {
      if (scalarNames.has(token)) return { scalar: token as Scalar, width: 1 };
      const vector = token.match(/^([diub]?)vec([234])$/);
      return vector ? { scalar: scalarPrefix[vector[1]], width: Number(vector[2]) } : undefined;
    };
    const source = shape(a), target = shape(b);
    if (!source || !target || source.scalar === "bool" !== (target.scalar === "bool")) return undefined;
    if (source.width !== target.width && source.width !== 1) return undefined;
    if (source.scalar === "bool" && source.width !== 1) return undefined;
    return { from: a, to: b, op: source.scalar === target.scalar && source.width === 1 ? "broadcast" : "cast" };
  }
  if (a === "float" && /^vec[234]$/.test(b)) return { from: a, to: b, op: "broadcast" };
  if (/^vec[234]$/.test(a) && (b === "float" || (/^vec[234]$/.test(b) && a > b))) return { from: a, to: b, op: "take" };
  if (a === "vec3" && b === "vec4" && from.semantic === "rgb" && to.semantic === "rgba") return { from: a, to: b, op: "alpha" };
  return undefined;
}
export function typeTokenValid(type: unknown): type is ValueType {
  return typeof type === "string" && type.length > 0 && type.length <= 1024 &&
    (scalarNames.has(type) || /^[diub]?vec[234]$/.test(type) || /^d?mat[234](x[234])?$/.test(type) || resourcePattern.test(type) || /^@[^\[\]\s]+$/.test(type) || /\[(?:[1-9][0-9]*|#[^\[\]\s]+)\]$/.test(type) && typeTokenValid(type.slice(0, type.lastIndexOf("["))));
}
export function typeResourceIds(type: ValueType): string[] {
  if (!typeTokenValid(type)) error("UNKNOWN_TYPE", `Invalid type token ${type}`);
  const array = type.match(/^(.*)\[([1-9][0-9]*|#[^\[\]\s]+)\]$/);
  return array ? [...new Set([...typeResourceIds(array[1]), ...(array[2].startsWith("#") ? [array[2].slice(1)] : [])])] : type.startsWith("@") ? [type.slice(1)] : [];
}
export function remapTypeResources(type: ValueType, remap: (id: string) => string): ValueType {
  if (!typeTokenValid(type)) error("UNKNOWN_TYPE", `Invalid type token ${type}`);
  const array = type.match(/^(.*)\[([1-9][0-9]*|#[^\[\]\s]+)\]$/);
  const mapped = array ? `${remapTypeResources(array[1], remap)}[${array[2].startsWith("#") ? "#" + remap(array[2].slice(1)) : array[2]}]` : type.startsWith("@") ? "@" + remap(type.slice(1)) : type;
  if (!typeTokenValid(mapped)) error("TYPE_REFERENCE", "Remapped identity is not a valid type reference");
  return mapped;
}
export class TypeEnvironment {
  readonly #lookup: (id: string) => Json | undefined;
  constructor(resources: readonly { id: string; data: Json }[] = []) {
    const data = immutable([...resources]); this.#lookup = id => data.find(r => r.id === id)?.data;
  }
  resolve(type: ValueType, ancestors = new Set<string>()): DataType {
    if (!typeTokenValid(type)) error("UNKNOWN_TYPE", `Invalid type token ${type}`);
    if (ancestors.has(type)) error("TYPE_CYCLE", `Recursive value type ${type}`);
    const trail = new Set(ancestors).add(type);
    const array = type.match(/^(.*)\[([1-9][0-9]*|#[^\[\]\s]+)\]$/);
    if (array) {
      const reference = array[2].startsWith("#") ? this.#lookup(array[2].slice(1)) as any : null;
      if (array[2].startsWith("#") && reference?.kind !== "arrayExtent") error("MISSING_EXTENT", `Missing source-bound array extent ${array[2]}`);
      const length = reference ? reference.length ?? reference.symbol : Number(array[2]);
      if (typeof length === "string" ? !/^[A-Za-z_][A-Za-z0-9_]*$/.test(length) : !Number.isSafeInteger(length) || length < 1 || length > 4096) error("TYPE_LIMIT", "Array extent must be 1..4096 or an explicitly backend-bound GLSL symbol");
      this.resolve(array[1], trail);
      return { kind: "array", element: array[1], length };
    }
    if (scalarNames.has(type)) return { kind: "scalar", scalar: type as Scalar };
    const vector = type.match(/^([diub]?)vec([234])$/);
    if (vector) return { kind: "vector", scalar: scalarPrefix[vector[1]], width: Number(vector[2]) };
    const matrix = type.match(/^(d?)mat([234])(?:x([234]))?$/);
    if (matrix) return { kind: "matrix", scalar: matrix[1] ? "double" : "float", columns: Number(matrix[2]), rows: Number(matrix[3] ?? matrix[2]) };
    if (resourcePattern.test(type)) return { kind: "resource", token: type };
    const id = type.slice(1), resource = this.#lookup(id) as any;
    if (!resource || resource.kind !== "dataType" || resource.type?.kind !== "struct") error("MISSING_DATA_TYPE", `No nominal struct resource ${id}`);
    const fields = resource.type.fields;
    if (!Array.isArray(fields) || !fields.length || fields.length > 128) error("TYPE_FIELDS", "A struct needs 1..128 fields");
    const keys = new Set<string>();
    for (const field of fields) {
      if (!field || typeof field.key !== "string" || !field.key || keys.has(field.key)) error("TYPE_FIELDS", "Field keys must be unique and nonempty");
      keys.add(field.key);
      const resolved = this.resolve(field.type, trail);
      if (resolved.kind === "resource") error("RESOURCE_FIELD", "Opaque samplers cannot be struct value fields");
    }
    return { kind: "struct", id, fields: immutable(fields) };
  }
  valid(type: ValueType, value: unknown): value is Value {
    let spec: DataType; try { spec = this.resolve(type); } catch { return false; }
    const scalar = (s: Scalar, v: unknown): boolean => s === "bool" ? typeof v === "boolean" : typeof v === "number" && Number.isFinite(v) &&
      (s === "int" ? Number.isInteger(v) && v >= -2147483648 && v <= 2147483647 : s === "uint" ? Number.isInteger(v) && v >= 0 && v <= 4294967295 : s === "float" ? Number.isFinite(Math.fround(v)) : true);
    const array = (n: number, each: (v: unknown) => boolean): boolean => Array.isArray(value) && value.length === n && Object.keys(value).length === n && Array.from({ length: n }, (_, i) => Object.hasOwn(value, i) && each(value[i])).every(Boolean);
    if (spec.kind === "scalar") return scalar(spec.scalar, value);
    if (spec.kind === "vector") return array(spec.width, v => scalar(spec.scalar, v));
    // Matrix storage is column-major, matching GLSL constructors. No implicit identity padding.
    if (spec.kind === "matrix") return array(spec.columns * spec.rows, v => scalar(spec.scalar, v));
    if (spec.kind === "array") return typeof spec.length === "number" && array(spec.length, v => this.valid(spec.element, v));
    if (spec.kind === "struct") return !!value && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype && Object.keys(value).length === spec.fields.length && spec.fields.every(f => Object.hasOwn(value, f.key) && this.valid(f.type, (value as Record<string, unknown>)[f.key]));
    return false; // Resource identity/binding is never a local numeric value.
  }
  glsl(type: ValueType): string {
    const spec = this.resolve(type);
    if (spec.kind === "struct") return `s_${encodeIdentity(spec.id)}`;
    if (spec.kind === "array") return `${this.glsl(spec.element)}[${spec.length}]`;
    return type;
  }
  declaration(type: ValueType, name: string): string {
    const spec = this.resolve(type);
    return spec.kind === "array" ? this.declaration(spec.element, `${name}[${spec.length}]`) : `${this.glsl(type)} ${name}`;
  }
  field(key: string): string { return `f_${encodeIdentity(key)}`; }
  literal(type: ValueType, value: Value): string {
    if (!this.valid(type, value)) error("INPUT_VALUE", `Invalid ${type} literal`);
    const spec = this.resolve(type);
    if (spec.kind === "scalar") {
      if (spec.scalar === "bool") return String(value);
      if (spec.scalar === "uint") return `${value}u`;
      if (spec.scalar === "int") return String(value);
      const text = String(value); const number = Number.isInteger(value) && !/[eE]/.test(text) ? text + ".0" : text; return spec.scalar === "double" ? number + "lf" : number;
    }
    const values = value as Value[];
    const args = spec.kind === "vector" || spec.kind === "matrix" ? values.map(v => this.literal(spec.scalar, v)) : spec.kind === "array" ? values.map(v => this.literal(spec.element, v)) : spec.kind === "struct" ? spec.fields.map(f => this.literal(f.type, (value as Record<string, Value>)[f.key])) : error("RESOURCE_LITERAL", "Resource cannot have a literal");
    return `${this.glsl(type)}(${args.join(", ")})`;
  }
  requireES300(type: ValueType): void {
    const spec = this.resolve(type);
    if (spec.kind === "scalar" || spec.kind === "vector" || spec.kind === "matrix") { if (spec.scalar === "double") error("BACKEND_TYPE", "GLSL ES 3.00 does not support doubles"); }
    if (spec.kind === "resource" && !/^(?:[iu]?sampler(?:2D|3D|Cube|2DArray))$/.test(spec.token)) error("BACKEND_TYPE", `${type} requires a different backend`);
    if (spec.kind === "array") { if (typeof spec.length === "string") error("BACKEND_EXTENT", "A backend must bind symbolic extents explicitly"); const element = this.resolve(spec.element); if (element.kind === "array") error("BACKEND_TYPE", "Arrays of arrays are outside ES 3.00"); if (element.kind === "resource") error("BACKEND_TYPE", "Sampler array indexing/binding policy is not implemented by this backend"); this.requireES300(spec.element); }
    if (spec.kind === "struct") spec.fields.forEach(f => this.requireES300(f.type));
  }
  declarations(types: Iterable<ValueType>): string[] {
    const done = new Set<string>(), lines: string[] = [];
    const visit = (type: string) => {
      const spec = this.resolve(type);
      if (spec.kind === "array") return visit(spec.element);
      if (spec.kind !== "struct" || done.has(spec.id)) return;
      spec.fields.forEach(f => visit(f.type)); done.add(spec.id);
      lines.push(`struct ${this.glsl(type)} { ${spec.fields.map(f => this.declaration(f.type, this.field(f.key)) + ";").join(" ")} };`);
    };
    for (const type of types) visit(type); return lines;
  }
}

export function typeResourceIssues(document: GraphDocument): Issue[] {
  const environment = new TypeEnvironment(document.resources), result: Issue[] = [];
  for (const resource of document.resources) {
    const data = resource.data as any;
    try {
      if (data?.kind === "dataType") environment.resolve(`@${resource.id}`);
      if (data?.kind === "arrayExtent") environment.resolve(`float[#${resource.id}]`);
    } catch (error) { result.push({ code: "RESOURCE_TYPE", severity: "error", message: String(error), subject: { resourceId: resource.id } }); }
  }
  return result;
}

// Helpers are keyed by exact module identity + semantic key, never display names.
export class HelperRegistry {
  #bodies = new Map<string, { name: string; body: string }>();
  register(owner: string, key: string, body: string): string {
    const identity = JSON.stringify([owner, key]), name = `h_${encodeIdentity(identity)}`;
    if (!key || !body.includes("$name")) error("HELPER_SCHEMA", "Helper must use $name placeholder");
    const previous = this.#bodies.get(identity);
    if (previous && previous.body !== body) error("HELPER_CONFLICT", "Same helper identity has different definitions");
    this.#bodies.set(identity, { name, body }); return name;
  }
  source(): string[] { return [...this.#bodies.values()].map(v => v.body.replaceAll("$name", v.name)); }
}
