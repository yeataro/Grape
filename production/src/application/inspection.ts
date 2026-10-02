import type { CanonicalGraphDocument, DocumentRead } from "../sdk/document.ts";
import type { ContractIssue, Json } from "../sdk/public-surface.ts";
import { Definitions } from "../definitions/registry.ts";
import { Graph } from "../model/graph.ts";
import { detached } from "../sdk/kernel.ts";
import {
  DOCUMENT_MAX_BYTES,
  parseJSON,
  readDocument,
} from "../persistence/codec.ts";

export interface DocumentInspection {
  readonly status:
    | "valid"
    | "repairable"
    | "blocked"
    | "rejected"
    | "recovery-readonly"
    | "foreign";
  readonly reason: string;
  readonly raw: string;
  readonly read: DocumentRead;
  readonly document: CanonicalGraphDocument | null;
  readonly candidate: CanonicalGraphDocument | null;
  readonly diagnostics: readonly ContractIssue[];
  readonly repairs: readonly {
    path: string;
    before: Json;
    after: Json;
    reason: string;
  }[];
  readonly provenance: {
    format: string | null;
    sourceVersion: Json | null;
    sourceGraphId: string | null;
    conversion: "none";
    legacyGate: string | null;
  };
}

/** Inspection owns detached data only, never the destination Graph or its identity source. */
export function inspectDocument(
  raw: string,
  definitions: Definitions,
): DocumentInspection {
  let sourceFormat: string | null = null,
    sourceVersion: Json | null = null,
    sourceGraphId: string | null = null;
  if (new TextEncoder().encode(raw).length <= DOCUMENT_MAX_BYTES) {
    try {
      const source = parseJSON(raw);
      if (source && typeof source === "object" && !Array.isArray(source)) {
        sourceFormat = typeof source.format === "string" ? source.format : null;
        sourceVersion = source.formatVersion ?? null;
        const graph = source.graph;
        if (
          graph &&
          typeof graph === "object" &&
          !Array.isArray(graph) &&
          typeof graph.id === "string"
        )
          sourceGraphId = graph.id;
      }
    } catch {
      /* Malformed source has no inferred identity. */
    }
  }
  const available = (p: import("../sdk/document.ts").ModulePin) =>
    definitions.pin([p]).module(p);
  const original = readDocument(raw, available);
  let read = original;
  const repairs: { path: string; before: Json; after: Json; reason: string }[] =
    [];
  // Only the documented layout recovery has an unambiguous replacement. No ID,
  // reference, connection, state, pin or version is ever inferred here.
  if (
    original.status === "rejected" &&
    ["POSITION", "NUMBER"].includes(original.reason)
  ) {
    try {
      const value = parseJSON(raw) as unknown as CanonicalGraphDocument;
      if (
        value.format === "grape.document" &&
        value.formatVersion.major === 2 &&
        value.formatVersion.minor === 0
      ) {
        value.graph.stages.forEach((stage, si) =>
          stage.network.nodes.forEach((node, ni) => {
            if (
              !Array.isArray(node.position) ||
              node.position.length !== 2 ||
              !node.position.every(
                (n) => typeof n === "number" && Number.isFinite(n),
              )
            ) {
              repairs.push({
                path: `graph.stages[${si}].network.nodes[${ni}].position`,
                before: node.position as unknown as Json,
                after: [48, 96],
                reason:
                  "Replace malformed authored position with [48, 96]; original retained for export.",
              });
              node.position = [48, 96];
            }
          }),
        );
        read = readDocument(JSON.stringify(value), available);
      }
    } catch {
      /* The original failure remains authoritative. */
    }
  }
  let document: CanonicalGraphDocument | null = null;
  let candidate: CanonicalGraphDocument | null = null;
  let diagnostics: readonly ContractIssue[] = [];
  let status: DocumentInspection["status"] =
    read.status === "editable" ? "valid" : read.status;
  let reason = "DOCUMENT_VALID";
  if (read.status === "editable") {
    document = read.document;
    try {
      const graph = new Graph(
        document,
        definitions.pin(document.graph.modules),
        { next: () => "detached-inspection" },
      );
      diagnostics = graph.capture().diagnostics;
      graph.dispose();
      if (diagnostics.some((d) => d.severity === "error")) {
        status = "blocked";
        reason = "IMPORT_ERRORS";
      } else {
        candidate = document;
        status = repairs.length ? "repairable" : "valid";
        reason = repairs.length ? "POSITION_REPAIR_PROPOSED" : "DOCUMENT_VALID";
      }
    } catch {
      status = "rejected";
      reason = "HYDRATION_REJECTED";
      document = null;
    }
  } else reason = read.reason;
  // The original, potentially oversized source is always the source for recovery.
  if (new TextEncoder().encode(raw).byteLength > DOCUMENT_MAX_BYTES) {
    status = "rejected";
    reason = "DOCUMENT_SIZE";
    document = null;
    candidate = null;
  }
  return detached({
    status,
    reason,
    raw,
    read: original,
    document,
    candidate,
    diagnostics,
    repairs: candidate ? repairs : [],
    provenance: {
      format: sourceFormat,
      sourceVersion,
      sourceGraphId,
      conversion: "none",
      legacyGate: original.status === "foreign" ? "G-VERSION-COMPAT" : null,
    },
  });
}
