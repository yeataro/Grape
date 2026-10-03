import type {
  CanonicalGraphDocument,
  DocumentRead,
  ModulePin,
} from "../sdk/document.ts";
import type { Json } from "../sdk/public-surface.ts";
import { demand, detached, Fault } from "../sdk/kernel.ts";
import {
  inspectDocumentStructure,
  validateDocumentStructure,
} from "../sdk/document-validation.ts";
export const DOCUMENT_MAX_BYTES = 512000;
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
function record(v: unknown, p: string): Record<string, unknown> {
  demand(v && typeof v === "object" && !Array.isArray(v), "OBJECT", p);
  return v as Record<string, unknown>;
}
export function readDocument(
  raw: string,
  available: (pin: ModulePin) => boolean = () => true,
): DocumentRead {
  try {
    demand(
      new TextEncoder().encode(raw).byteLength <= DOCUMENT_MAX_BYTES,
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
    for (const key of ["major", "minor"])
      demand(
        Number.isSafeInteger(version[key]) && Number(version[key]) >= 0,
        "VERSION",
        key,
      );
    if (version.major !== 2 || ![0, 1].includes(Number(version.minor)))
      return {
        status: "recovery-readonly",
        raw,
        reason: "UNSUPPORTED_VERSION",
        unknownPaths: ["$.formatVersion"],
      };
    const unknowns = inspectDocumentStructure(parsed);
    const document = parsed as unknown as CanonicalGraphDocument;
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
      reason: error instanceof Fault ? error.code : "INVALID_JSON",
    };
  }
}
export function writeDocument(document: CanonicalGraphDocument): string {
  validateDocumentStructure(document);
  demand(document.formatVersion.minor === 1, "DOCUMENT_UPGRADE_REQUIRED");
  const formatted = JSON.stringify(document, null, 2);
  const emitted =
    new TextEncoder().encode(formatted).length <= DOCUMENT_MAX_BYTES
      ? formatted
      : JSON.stringify(document);
  demand(
    new TextEncoder().encode(emitted).length <= DOCUMENT_MAX_BYTES,
    "DOCUMENT_SIZE",
  );
  return emitted;
}
