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
  constructor(declarations: readonly ShaderTypeDefinition[] = []) {
    for (const id of ["glsl.float", "glsl.vec2", "glsl.vec3", "glsl.vec4"]) {
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
  resolve(id: string): Readonly<ShaderTypeDefinition> | undefined {
    return this.#types.get(id);
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
      else {
        demand(s === 3 && t === 4, "TYPE_ADAPTATION");
        operation = "append-alpha-one";
      }
    }
    return {
      schema: "grape.edge-adaptation",
      version: 1,
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
  demand(width(type) > 0, "PROFILE_TYPE");
  return type.slice(5);
}
