import { demand } from "./kernel.ts";
export type TypeToken =
  | { kind: "scalar"; id: string }
  | { kind: "structure"; id: string }
  | {
      kind: "array";
      element: TypeToken;
      extent: number | { sourceId: string };
    };
export function parseType(type: string, depth = 0): TypeToken {
  demand(depth <= 8, "TYPE_DEPTH");
  if (type.startsWith("struct@")) {
    demand(type.length > 7, "TYPE_ID");
    return { kind: "structure", id: type.slice(7) };
  }
  if (type.startsWith("array@")) {
    const tuple = JSON.parse(type.slice(6));
    demand(Array.isArray(tuple) && tuple.length === 2, "TYPE_TUPLE");
    const [element, extent] = tuple;
    demand(
      typeof element === "string" &&
        ((Number.isInteger(extent) && extent > 0 && extent <= 2147483647) ||
          (depth === 0 &&
            extent &&
            typeof extent.sourceId === "string" &&
            Object.keys(extent).length === 1)),
      "ARRAY_EXTENT",
    );
    return { kind: "array", element: parseType(element, depth + 1), extent };
  }
  demand(/^[A-Za-z_][A-Za-z0-9_.]*$/.test(type), "TYPE_TOKEN");
  return { kind: "scalar", id: type };
}
export function formatType(t: TypeToken): string {
  return t.kind === "scalar"
    ? t.id
    : t.kind === "structure"
      ? "struct@" + t.id
      : "array@" + JSON.stringify([formatType(t.element), t.extent]);
}
export function typeReferences(type: string): string[] {
  const walk = (t: TypeToken): string[] =>
    t.kind === "structure"
      ? [t.id]
      : t.kind === "array"
        ? [
            ...walk(t.element),
            ...(typeof t.extent === "number" ? [] : [t.extent.sourceId]),
          ]
        : [];
  return walk(parseType(type));
}
export function remapType(
  type: string,
  map: ReadonlyMap<string, string>,
): string {
  const walk = (t: TypeToken): TypeToken =>
    t.kind === "structure"
      ? { ...t, id: map.get(t.id) ?? t.id }
      : t.kind === "array"
        ? {
            ...t,
            element: walk(t.element),
            extent:
              typeof t.extent === "number"
                ? t.extent
                : { sourceId: map.get(t.extent.sourceId) ?? t.extent.sourceId },
          }
        : t;
  return formatType(walk(parseType(type)));
}
