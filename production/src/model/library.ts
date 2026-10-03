import type { DefinitionSet } from "../sdk/editing.ts";
import type { ResourceDocument } from "../sdk/document.ts";
import type { SourceData } from "../sdk/networks.ts";
import { asNetwork, resourceReferences } from "../sdk/networks.ts";
import { parseType, type TypeToken } from "../sdk/type-tokens.ts";
import { demand } from "../sdk/kernel.ts";
/** Personal admission differs from document preservation and local clipboard.
 * DEC004 permits closed compile-time extent dependencies, never live sources. */
export function personalSources(
  resources: readonly ResourceDocument[],
  definitions: DefinitionSet,
): string[] {
  const allowed: string[] = [],
    extents = new Set<string>();
  const collect = (t: TypeToken): void => {
    if (t.kind === "array") {
      if (typeof t.extent !== "number") extents.add(t.extent.sourceId);
      collect(t.element);
    }
  };
  for (const r of resources) {
    const n = asNetwork(r, definitions);
    if (n) {
      for (const p of n.interface) collect(parseType(p.type));
      for (const node of n.network.nodes)
        for (const p of node.ports) collect(parseType(p.type));
    }
    if (definitions.resource(r.type)?.model === "structure")
      for (const f of (r.data as unknown as { fields: { type: string }[] })
        .fields)
        collect(parseType(f.type));
  }
  for (const r of resources) {
    const def = definitions.resource(r.type);
    demand(def, "RESOURCE_MISSING");
    const network = asNetwork(r, definitions);
    if (network)
      for (const n of network.network.nodes)
        demand(
          definitions.node(n.type)?.modelRole !== "source",
          "PERSONAL_SOURCE_DENIED",
        );
    if (def.model !== "source") continue;
    const d = r.data as unknown as SourceData;
    demand(
      ["glsl.int", "glsl.uint"].includes(d.type) &&
        (!d.binding || d.binding.kind === "constant") &&
        Number.isInteger(d.value) &&
        Number(d.value) > 0,
      "PERSONAL_SOURCE_DENIED",
    );
    demand(
      extents.has(r.id) ||
        resources.some(
          (e) =>
            definitions.resource(e.type)?.resolveExtent &&
            resourceReferences(e, definitions).some(
              (ref) => ref.kind === "resource" && ref.targetId === r.id,
            ),
        ),
      "PERSONAL_SOURCE_DENIED",
    );
    allowed.push(r.id);
  }
  return allowed;
}
