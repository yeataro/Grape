import { functionSetup } from "./s05.ts";
import { fixedValues, fixedValueRef } from "../../src/modules/fixed-values.ts";
import { currentImageKind } from "../../src/modules/image-current.ts";
import { functionProfile } from "../../src/modules/function-operations.ts";
import { nodeRef } from "../../src/modules/nodes.ts";
import { Graph } from "../../src/model/graph.ts";
import { asNetwork, callResource } from "../../src/sdk/networks.ts";
export const valueCases = [
  {
    key: "float",
    label: "Float",
    button: "Float (fixed)",
    type: "glsl.float",
    initial: 0.5,
    edited: 0.125,
    components: ["Value"],
  },
  {
    key: "vec2",
    label: "Vector 2",
    button: "Vector 2",
    type: "glsl.vec2",
    initial: [0.5, 0.5],
    edited: [0.125, 0.375],
    components: ["X", "Y"],
  },
  {
    key: "vec3",
    label: "Vector 3",
    button: "Vector 3",
    type: "glsl.vec3",
    initial: [1, 1, 1],
    edited: [0.125, 0.375, 0.625],
    components: ["X", "Y", "Z"],
  },
  {
    key: "color",
    label: "Color RGBA",
    button: "Color RGBA",
    type: "glsl.vec4",
    initial: [0.55, 0.28, 0.9, 1],
    edited: [0.125, 0.375, 0.625, 0.875],
    components: ["R", "G", "B", "A"],
  },
] as const;
export function valuesSetup(vertex = false) {
  const old = functionSetup();
  old.definitions.register(fixedValues);
  const fixed = old.definitions.pin(old.definitions.pins());
  let graph = Graph.create(currentImageKind.ref, fixed, old.identity);
  if (vertex) {
    const doc = structuredClone(graph.capture().document),
      stage = doc.graph.stages[0],
      def = fixed.node(nodeRef("vertex-output"))!;
    stage.implementation = "network";
    stage.network.nodes.push({
      id: old.identity.next(),
      name: "Vertex output",
      type: def.ref,
      state: {},
      inputValues: {},
      ports: structuredClone([...def.ports({})]),
      references: [],
      referencesComplete: true,
      position: [700, 80],
      extensions: {},
    });
    graph = new Graph(doc, fixed, old.identity);
  }
  const pixel = graph
    .capture()
    .document.graph.stages.find((s) => s.key === "pixel")!.network.id;
  const network = graph
    .capture()
    .document.graph.stages.find((s) => s.key === (vertex ? "vertex" : "pixel"))!
    .network.id;
  return { ...old, fixed, graph, network, pixel, profile: functionProfile };
}
export function valueFixture(
  key: string,
  stage: "vertex" | "pixel" = "pixel",
  mode: "root" | "expand" | "function" | "nested" = "root",
  edited = false,
  empty = false,
) {
  const item = valueCases.find((x) => x.key === key)!,
    s = valuesSetup(stage === "vertex");
  let leaf = "",
    target = s.graph.resolveNetwork(s.network).nodes[0].id,
    targetPort = stage === "vertex" ? "position" : "color";
  const bodies: string[] = [];
  let adapter = "";
  if (stage === "vertex") {
    s.graph.change("Supported vertex adapter", (d) => {
      adapter = d.createSubgraph(s.network, "Position");
      d.connect(
        s.network,
        { nodeId: adapter, portKey: "value" },
        { nodeId: target, portKey: targetPort },
      );
      const color = d.add(s.pixel, fixedValueRef("color"), [30, 60]);
      d.connect(
        s.pixel,
        { nodeId: color, portKey: "out" },
        {
          nodeId: s.graph.resolveNetwork(s.pixel).nodes[0].id,
          portKey: "color",
        },
      );
    });
    target = adapter;
    targetPort = "value";
  }
  if (!empty) {
    s.graph.change("Fixed value", (d) => {
      leaf = d.add(s.network, fixedValueRef(key), [40, 80]);
      if (edited)
        d.parameter(s.network, leaf, "value", structuredClone(item.edited));
      d.connect(
        s.network,
        { nodeId: leaf, portKey: "out" },
        { nodeId: target, portKey: targetPort },
      );
    });
    if (mode !== "root") {
      let call = "";
      s.graph.change("Encapsulate fixed value", (d) => {
        call = d.encapsulate(s.network, [leaf]);
      });
      const resource = s.graph
          .capture()
          .document.graph.resources.find((r) =>
            asNetwork(r, s.fixed)?.network.nodes.some((n) => n.id === leaf),
          )!,
        body = asNetwork(resource, s.fixed)!.network.id;
      bodies.push(body);
      s.graph.change("Shared body", (d) => {
        const second = d.addReferenceNode(s.network, "call", resource.id);
        d.move(s.network, second, [440, 260]);
        if (mode !== "expand") d.emissionMode(body, "function", s.profile);
      });
      if (mode === "nested") {
        s.graph.change("Nested call", (d) => d.encapsulate(s.network, [call]));
        const outer = s.graph
            .capture()
            .document.graph.resources.find((r) =>
              asNetwork(r, s.fixed)?.network.nodes.some((n) => n.id === call),
            )!,
          outerBody = asNetwork(outer, s.fixed)!.network.id;
        s.graph.change("Nested function", (d) =>
          d.emissionMode(outerBody, "function", s.profile),
        );
        bodies.push(outerBody);
      }
    }
  }
  const v = structuredClone(edited ? item.edited : item.initial),
    expected = Array.isArray(v) ? [...v] : [v, v, v, v];
  while (expected.length < 4) expected.push(expected.length === 3 ? 1 : 0);
  return {
    ...s,
    item,
    leaf,
    target,
    targetPort,
    adapter,
    bodies,
    expected,
    stage,
    mode,
  };
}
