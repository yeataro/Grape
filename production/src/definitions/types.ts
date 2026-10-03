import { parseType, formatType } from "../sdk/type-tokens.ts";
import type { TypeResource } from "../sdk/editing.ts";
import type { StructureData, SourceData } from "../sdk/networks.ts";
import type { PortSnapshot, EdgeAdaptationDocument } from "../sdk/document.ts";
import type { Json } from "../sdk/public-surface.ts";
import type { ShaderTypeDefinition, TypeSystem } from "../sdk/editing.ts";
import { demand, detached, issue } from "../sdk/kernel.ts";
export function width(type: string): number {
  return type === "glsl.float"
    ? 1
    : /^glsl.vec[234]$/.test(type)
      ? Number(type.at(-1))
      : 0;
}
function numericValue(type: string, value: Json): boolean {
  const matrix = /^glsl.mat([234])(?:x([234]))?$/.exec(type);
  if (matrix)
    return (
      Array.isArray(value) &&
      value.length === Number(matrix[1]) &&
      value.every(
        (column) =>
          Array.isArray(column) &&
          column.length === Number(matrix[2] ?? matrix[1]) &&
          column.every(
            (n) => typeof n === "number" && Number.isFinite(Math.fround(n)),
          ),
      )
    );
  const w = width(type);
  const number = (n: unknown) =>
    typeof n === "number" &&
    Number.isFinite(n) &&
    Number.isFinite(Math.fround(n));
  return w === 1
    ? number(value)
    : w > 1 &&
        Array.isArray(value) &&
        value.length === w &&
        value.every(number);
}
export class TypeEnvironment implements TypeSystem {
  #types = new Map<string, Readonly<ShaderTypeDefinition>>();
  #resources: readonly TypeResource[] = [];
  #resolving = new Set<string>();
  constructor(declarations: readonly ShaderTypeDefinition[] = []) {
    for (const id of ["glsl.int", "glsl.uint"])
      this.#types.set(
        id,
        Object.freeze({
          id,
          valueCodec: Object.freeze({
            schemaVersion: 1,
            validate: (value: Json) =>
              Number.isInteger(value) &&
              Number(value) >= (id === "glsl.uint" ? 0 : -2147483648) &&
              Number(value) <= (id === "glsl.uint" ? 4294967295 : 2147483647)
                ? []
                : [issue("TYPE_VALUE", "Invalid integer value.")],
          }),
        }),
      );
    for (const id of [
      "glsl.float",
      "glsl.vec2",
      "glsl.vec3",
      "glsl.vec4",
      ...[2, 3, 4].flatMap((c) =>
        [2, 3, 4].map((r) => "glsl.mat" + c + (c === r ? "" : "x" + r)),
      ),
    ]) {
      this.#types.set(
        id,
        Object.freeze({
          id,
          numeric: Object.freeze({
            scalar: "float" as const,
            width: width(id),
          }),
          valueCodec: Object.freeze({
            schemaVersion: 1,
            validate: (value: Json) =>
              numericValue(id, value)
                ? []
                : [
                    issue(
                      "TYPE_VALUE",
                      "Value does not match its shader type.",
                    ),
                  ],
          }),
        }),
      );
    }
    for (const declaration of declarations) {
      demand(
        declaration.id && !this.#types.has(declaration.id),
        "DUPLICATE_TYPE",
      );
      if (declaration.numeric)
        demand(
          declaration.numeric.scalar === "float" &&
            [1, 2, 3, 4].includes(declaration.numeric.width),
          "NUMERIC_SHAPE",
        );
      this.#types.set(
        declaration.id,
        Object.freeze({
          ...declaration,
          ...(declaration.numeric
            ? { numeric: detached(declaration.numeric) }
            : {}),
          valueCodec: Object.freeze({ ...declaration.valueCodec }),
        }),
      );
    }
    Object.freeze(this);
  }
  forResources(resources: readonly TypeResource[]): TypeSystem {
    const next = new TypeEnvironment();
    next.#types = new Map(this.#types);
    next.#resources = resources;
    return next;
  }
  extent(id: string): number | undefined {
    const r = this.#resources.find((r) => r.id === id);
    const source =
      r?.model === "source" ? (r.data as unknown as SourceData) : null;
    const value =
      source && ["glsl.int", "glsl.uint"].includes(source.type)
        ? source.value
        : r?.extent;
    return Number.isInteger(value) &&
      Number(value) > 0 &&
      Number(value) <= 2147483647
      ? Number(value)
      : undefined;
  }
  defaultValue(id: string): Json {
    let budget = 65536;
    const build = (type: string, active: readonly string[] = []): Json => {
      const t = parseType(type);
      if (t.kind === "array") {
        demand(this.resolve(type), "ARRAY_EXTENT");
        const length =
          typeof t.extent === "number"
            ? t.extent
            : this.extent(t.extent.sourceId);
        demand(
          Number.isInteger(length) &&
            Number(length) > 0 &&
            Number(length) <= 2147483647,
          "ARRAY_EXTENT",
        );
        demand(Number(length) <= budget, "DEFAULT_EXPANSION");
        return Array.from({ length: Number(length) }, () =>
          build(formatType(t.element), active),
        );
      }
      if (t.kind === "structure") {
        demand(!active.includes(t.id) && active.length < 16, "STRUCTURE_DEPTH");
        const d = this.#resources.find(
          (r) => r.id === t.id && r.model === "structure",
        )?.data as unknown as StructureData;
        demand(d, "TYPE_UNKNOWN");
        return Object.fromEntries(
          d.fields.map((f) => [f.id, build(f.type, [...active, t.id])]),
        );
      }
      const matrix = /^glsl.mat([234])(?:x([234]))?$/.exec(type),
        w = width(type),
        size = matrix
          ? Number(matrix[1]) * Number(matrix[2] ?? matrix[1])
          : Math.max(1, w);
      budget -= size;
      demand(budget >= 0, "DEFAULT_EXPANSION");
      if (matrix)
        return Array.from({ length: Number(matrix[1]) }, () =>
          Array(Number(matrix[2] ?? matrix[1])).fill(0),
        );
      return w > 1 ? Array(w).fill(0) : 0;
    };
    return build(id);
  }
  reshape(id: string, value: Json): Json {
    const defaults = this.defaultValue(id);
    const shape = (template: Json, old: Json | undefined): Json => {
      if (typeof template === "number")
        return typeof old === "number" ? old : template;
      if (Array.isArray(template))
        return template.map((v, i) =>
          shape(
            v,
            Array.isArray(old)
              ? old[i]
              : typeof old === "number"
                ? old
                : undefined,
          ),
        );
      if (template && typeof template === "object")
        return Object.fromEntries(
          Object.entries(template).map(([k, v]) => [
            k,
            shape(
              v,
              old && typeof old === "object" && !Array.isArray(old)
                ? old[k]
                : undefined,
            ),
          ]),
        );
      return template;
    };
    const result = shape(defaults, value);
    demand(this.validValue(id, result), "RESHAPE_VALUE");
    return result;
  }
  resolve(id: string): Readonly<ShaderTypeDefinition> | undefined {
    const scalar = this.#types.get(id);
    if (scalar) return scalar;
    if (this.#resolving.has(id)) return undefined;
    this.#resolving.add(id);
    try {
      const t = parseType(id);
      if (t.kind === "scalar") return undefined;
      if (t.kind === "structure") {
        const r = this.#resources.find(
          (r) => r.id === t.id && r.model === "structure",
        );
        if (!r) return undefined;
        const data = r.data as unknown as StructureData;
        if (!data.fields.every((f) => this.resolve(f.type))) return undefined;
        return {
          id,
          valueCodec: {
            schemaVersion: 1,
            validate: (v: Json) =>
              v &&
              typeof v === "object" &&
              !Array.isArray(v) &&
              Object.keys(v).length === data.fields.length &&
              data.fields.every((f) => this.validValue(f.type, v[f.id]))
                ? []
                : [issue("TYPE_VALUE", "Invalid structure value.")],
          },
        };
      }
      const type = formatType(t.element),
        source =
          typeof t.extent === "number"
            ? null
            : this.#resources.find(
                (r) =>
                  r.id === (t.extent as { sourceId: string }).sourceId &&
                  r.model === "source",
              ),
        length =
          typeof t.extent === "number"
            ? t.extent
            : this.extent(t.extent.sourceId);
      if (
        (source &&
          !["glsl.int", "glsl.uint"].includes(
            (source.data as unknown as SourceData).type,
          )) ||
        !Number.isInteger(length) ||
        Number(length) <= 0 ||
        Number(length) > 2147483647 ||
        !this.resolve(type)
      )
        return undefined;
      return {
        id,
        valueCodec: {
          schemaVersion: 1,
          validate: (v: Json) =>
            Array.isArray(v) &&
            v.length === length &&
            v.every((x) => this.validValue(type, x))
              ? []
              : [issue("TYPE_VALUE", "Invalid array value.")],
        },
      };
    } catch {
      return undefined;
    } finally {
      this.#resolving.delete(id);
    }
  }
  validValue(id: string, value: Json): boolean {
    try {
      const type = this.resolve(id);
      return (
        !!type &&
        !type.valueCodec
          .validate(detached(value))
          .some((x) => x.severity === "error")
      );
    } catch {
      return false;
    }
  }
  adaptation(
    source: PortSnapshot,
    target: PortSnapshot,
  ): EdgeAdaptationDocument {
    const from = this.resolve(source.type),
      to = this.resolve(target.type);
    demand(from && to, "TYPE_UNKNOWN");
    const s = from.numeric?.width ?? 0,
      t = to.numeric?.width ?? 0;
    let operation: EdgeAdaptationDocument["operation"];
    if (source.type === target.type) operation = "identity";
    else {
      demand(
        target.connectionPolicy !== "exact" && s > 0 && t > 0,
        "TYPE_ADAPTATION",
      );
      if (s === t) operation = "numeric-cast";
      else if (s === 1) operation = "broadcast";
      else if (s > t) operation = "take-leading";
      else if (
        source.type === "glsl.vec2" &&
        ["glsl.vec3", "glsl.vec4"].includes(target.type)
      )
        operation = "pad-vector";
      else {
        demand(s === 3 && t === 4, "TYPE_ADAPTATION");
        operation = "append-alpha-one";
      }
    }
    return {
      schema: "grape.edge-adaptation",
      version: operation === "pad-vector" ? 2 : 1,
      sourceType: source.type,
      targetType: target.type,
      operation,
      extensions: {},
    };
  }
  planValid(
    plan: EdgeAdaptationDocument,
    source: PortSnapshot,
    target: PortSnapshot,
  ): boolean {
    try {
      const expected = this.adaptation(source, target);
      return (
        plan.schema === "grape.edge-adaptation" &&
        (plan.version === 1 || plan.version === 2) &&
        (plan.operation !== "pad-vector" || plan.version === 2) &&
        expected.operation === plan.operation &&
        expected.sourceType === plan.sourceType &&
        expected.targetType === plan.targetType
      );
    } catch {
      return false;
    }
  }
}
export function glslType(type: string): string {
  demand(
    width(type) > 0 || /^glsl.(int|uint|mat[234](x[234])?)$/.test(type),
    "PROFILE_TYPE",
  );
  return type.slice(5);
}
