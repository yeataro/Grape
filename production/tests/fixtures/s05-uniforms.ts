import { stageFixture } from "./s05.ts";
import { functionOperationRef } from "../../src/modules/function-operations.ts";
import { asNetwork } from "../../src/sdk/networks.ts";

export const uniformModes = ["expand", "function", "nested", "mixed"] as const;
export const uniformCases = [
  "distinct",
  "shared-reversed",
  "distinct-types",
] as const;
export function linkedUniformFixture(
  kind: (typeof uniformCases)[number],
  mode: (typeof uniformModes)[number],
) {
  // Adapted from the preserved independent S05-FR-001 stageFixture recipe;
  // the original reviewer probe is not modified or used as a test dependency.
  const s = stageFixture();
  const ids: string[] = [];
  s.graph.change("Uniform resources", (d) => {
    ids.push(
      d.createSource("A", "glsl.float", 0.25, true, { kind: "uniform" }),
    );
    ids.push(
      d.createSource(
        "B",
        kind === "distinct-types" ? "glsl.vec2" : "glsl.float",
        kind === "distinct-types" ? [0.75, 0.5] : 0.75,
        true,
        { kind: "uniform" },
      ),
    );
    if (mode === "expand" || mode === "mixed")
      d.emissionMode(s.body, "expand", s.profile);
  });
  for (const [index, stage] of s.graph
    .capture()
    .document.graph.stages.entries()) {
    const call = stage.network.nodes.find(
      (n) => s.fixed.node(n.type)?.modelRole === "call",
    )!;
    s.graph.change("Stage Uniform inputs", (d) => {
      if (kind === "shared-reversed") {
        const compose = d.add(
          stage.network.id,
          functionOperationRef("add"),
          [200, 200],
        );
        for (const [component, resource] of (index === 0
          ? ids
          : [...ids].reverse()
        ).entries()) {
          const source = d.addReferenceNode(
            stage.network.id,
            "source",
            resource,
            undefined,
            functionOperationRef("source"),
          );
          d.connect(
            stage.network.id,
            { nodeId: source, portKey: "value" },
            { nodeId: compose, portKey: component === 0 ? "a" : "b" },
          );
        }
        d.connect(
          stage.network.id,
          { nodeId: compose, portKey: "value" },
          { nodeId: call.id, portKey: "value" },
          true,
        );
      } else {
        const source = d.addReferenceNode(
          stage.network.id,
          "source",
          ids[index],
          undefined,
          functionOperationRef("source"),
        );
        d.connect(
          stage.network.id,
          { nodeId: source, portKey: "value" },
          { nodeId: call.id, portKey: "value" },
          true,
        );
      }
    });
    if (mode === "nested" || mode === "mixed") {
      s.graph.change("Nest stage call", (d) =>
        d.encapsulate(stage.network.id, [call.id]),
      );
      const outer = s.graph
        .capture()
        .document.graph.resources.find((r) =>
          asNetwork(r, s.fixed)?.network.nodes.some((n) => n.id === call.id),
        )!;
      s.graph.change("Outer function", (d) =>
        d.emissionMode(
          asNetwork(outer, s.fixed)!.network.id,
          "function",
          s.profile,
        ),
      );
    }
  }
  return {
    ...s,
    ids,
    kind,
    mode,
    expectedPosition:
      kind === "shared-reversed" ? [1, 1, 1, 1] : [0.25, 0.25, 0.25, 0.25],
  };
}
