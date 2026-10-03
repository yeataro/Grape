import type { CanonicalGraphDocument } from "../sdk/document.ts";
import type { DefinitionSet } from "../sdk/editing.ts";
import { validateDocumentStructure } from "../sdk/document-validation.ts";
import { networks, asNetwork } from "../sdk/networks.ts";
import { demand, detached } from "../sdk/kernel.ts";

/** Declared additive envelope upgrade. Validate original owner-visible networks
 * before changing the envelope; never rewrite pins, plans or authored payloads. */
export function upgradeDocument(
  document: CanonicalGraphDocument,
  definitions: DefinitionSet,
): CanonicalGraphDocument {
  validateDocumentStructure(document);
  if (document.formatVersion.minor === 0) {
    const all = networks(document, definitions).map((row) => row.network);
    for (const record of [
      ...document.graph.losses,
      ...document.graph.recovery,
    ]) {
      if (record.payload.kind !== "resource") continue;
      const data = asNetwork(record.payload.resource, definitions);
      if (data) all.push(data.network);
    }
    for (const network of all)
      demand(
        network.edges.every((e) => e.adaptation.version === 1),
        "EDGE_DOCUMENT_VERSION",
      );
  }
  const result = structuredClone(document);
  result.formatVersion = { major: 2, minor: 1 };
  return detached(result);
}
