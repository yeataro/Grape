import { currentSetup } from "./s04.ts";
import { functionNetworks } from "../../src/modules/function-networks.ts";
import {
  functionOperations,
  functionOperationRef,
  functionProfile,
} from "../../src/modules/function-operations.ts";
import { currentImageKind } from "../../src/modules/image-current.ts";
import { Graph } from "../../src/model/graph.ts";
import { nodeRef } from "../../src/modules/nodes.ts";
import { asNetwork, callResource } from "../../src/sdk/networks.ts";
export function functionSetup() {
  const s = currentSetup();
  s.definitions.register(functionNetworks);
  s.definitions.register(functionOperations);
  const fixed = s.definitions.pin(s.definitions.pins()),
    graph = Graph.create(currentImageKind.ref, fixed, s.identity),
    network = graph
      .capture()
      .document.graph.stages.find((s) => s.key === "pixel")!.network.id;
  return { ...s, fixed, graph, network };
}
export function functionFixture(shared = true) {
  const s = functionSetup();
  let call = "",
    second = "",
    compose = "";
  s.graph.change("Definition", (d) => {
    call = d.createSubgraph(s.network, "Shared arithmetic", null, true);
  });
  const definition = () => {
    const doc = s.graph.capture().document;
    const caller = doc.graph.stages
      .find((st) => st.network.id === s.network)!
      .network.nodes.find((n) => n.id === call)!;
    const r = doc.graph.resources.find(
      (r) => r.id === callResource(caller, s.fixed),
    )!;
    return { resource: r, data: asNetwork(r, s.fixed)! };
  };
  const body = definition().data.network.id;
  s.graph.change("Interface", (d) =>
    d.interface(body, [
      {
        key: "x",
        name: "X",
        direction: "input",
        type: "glsl.float",
        supply: "local",
        defaultValue: 0.2,
      },
      {
        key: "y",
        name: "Y",
        direction: "output",
        type: "glsl.float",
        defaultValue: 0,
      },
      {
        key: "twice",
        name: "Twice",
        direction: "output",
        type: "glsl.float",
        defaultValue: 0,
      },
    ]),
  );
  let add = "";
  s.graph.change("Body and calls", (d) => {
    const data = definition().data,
      input = data.network.nodes.find(
        (n) => s.fixed.node(n.type)?.modelRole === "network-input",
      )!,
      output = data.network.nodes.find(
        (n) => s.fixed.node(n.type)?.modelRole === "network-output",
      )!;
    add = d.add(body, functionOperationRef("add"), [250, 0]);
    d.connect(
      body,
      { nodeId: input.id, portKey: "x" },
      { nodeId: add, portKey: "a" },
    );
    d.connect(
      body,
      { nodeId: input.id, portKey: "x" },
      { nodeId: add, portKey: "b" },
    );
    d.connect(
      body,
      { nodeId: input.id, portKey: "x" },
      { nodeId: output.id, portKey: "y" },
    );
    d.connect(
      body,
      { nodeId: add, portKey: "value" },
      { nodeId: output.id, portKey: "twice" },
    );
    compose = d.add(s.network, nodeRef("compose"), [600, 100]);
    d.connect(
      s.network,
      { nodeId: call, portKey: "y" },
      { nodeId: compose, portKey: "x" },
    );
    d.connect(
      s.network,
      { nodeId: call, portKey: "twice" },
      { nodeId: compose, portKey: "y" },
    );
    if (shared) {
      second = d.addReferenceNode(s.network, "call", definition().resource.id);
      d.parameter(s.network, second, "x", 0.3);
      d.connect(
        s.network,
        { nodeId: second, portKey: "twice" },
        { nodeId: compose, portKey: "z" },
      );
    }
    const outputRoot = s.graph
      .capture()
      .document.graph.stages.find((st) => st.network.id === s.network)!.network
      .nodes[0];
    d.connect(
      s.network,
      { nodeId: compose, portKey: "result" },
      { nodeId: outputRoot.id, portKey: "color" },
    );
  });
  return {
    ...s,
    call,
    second,
    compose,
    body,
    add,
    definition,
    profile: functionProfile,
  };
}
export function shapeFixture(kind: "array" | "nominal") {
  const s = functionSetup();
  let call = "",
    structure = "";
  s.graph.change("Shape", (d) => {
    if (kind === "nominal")
      structure = d.createStructure("Pair", [
        { id: "component", name: "Component", type: "glsl.float" },
      ]);
    call = d.createSubgraph(s.network, "Shape function", null, true);
  });
  const definition = () => {
    const doc = s.graph.capture().document;
    return doc.graph.resources.find((r) => asNetwork(r, s.fixed))!;
  };
  const body = asNetwork(definition(), s.fixed)!.network.id,
    type = kind === "array" ? 'array@["glsl.float",3]' : "struct@" + structure;
  s.graph.change("Shape interface", (d) =>
    d.interface(body, [
      {
        key: "shape",
        name: "Shape",
        direction: "input",
        type,
        supply: "local",
        defaultValue: kind === "array" ? [0.1, 0.2, 0.3] : { component: 0.35 },
      },
      {
        key: "value",
        name: "Value",
        direction: "output",
        type: "glsl.float",
        defaultValue: 0,
      },
    ]),
  );
  s.graph.change("Shape nodes", (d) => {
    const data = asNetwork(definition(), s.fixed)!;
    let operation = "";
    if (kind === "array") {
      operation = d.add(body, functionOperationRef("array-length"), [0, 0]);
      d.parameter(body, operation, "type", type);
    } else
      operation = d.addReferenceNode(body, "field", structure, "component");
  });
  s.graph.change("Wire shape", (d) => {
    const data = asNetwork(definition(), s.fixed)!,
      operation = data.network.nodes[2],
      inputKey = operation.ports.find((p) => p.direction === "input")!.key,
      outputKey = operation.ports.find((p) => p.direction === "output")!.key;
    d.connect(
      body,
      { nodeId: data.network.nodes[0].id, portKey: "shape" },
      { nodeId: operation.id, portKey: inputKey },
    );
    const consumer = d.add(
      body,
      functionOperationRef("constant-input"),
      [0, 100],
    );
    if (kind === "array") {
      d.connect(
        body,
        { nodeId: operation.id, portKey: outputKey },
        { nodeId: consumer, portKey: "value" },
      );
      d.connect(
        body,
        { nodeId: consumer, portKey: "value" },
        { nodeId: data.network.nodes[1].id, portKey: "value" },
      );
    } else {
      d.remove(body, consumer);
      d.connect(
        body,
        { nodeId: operation.id, portKey: outputKey },
        { nodeId: data.network.nodes[1].id, portKey: "value" },
      );
    }
    const root = s.graph
      .capture()
      .document.graph.stages.find((st) => st.network.id === s.network)!.network
      .nodes[0];
    if (kind === "array") {
      const scale = d.add(s.network, nodeRef("multiply"), [400, 0]);
      d.parameter(s.network, scale, "b", 0.25);
      d.connect(
        s.network,
        { nodeId: call, portKey: "value" },
        { nodeId: scale, portKey: "a" },
      );
      d.connect(
        s.network,
        { nodeId: scale, portKey: "result" },
        { nodeId: root.id, portKey: "color" },
      );
    } else
      d.connect(
        s.network,
        { nodeId: call, portKey: "value" },
        { nodeId: root.id, portKey: "color" },
      );
  });
  return { ...s, call, body, definition, profile: functionProfile };
}
export function effectFixture(
  discard = false,
  unconsumed = false,
  nested = false,
) {
  const s = functionFixture(false);
  s.graph.change("Pixel effects", (d) => {
    const data = s.definition().data,
      fx = d.add(s.body, functionOperationRef("pixel-effect"), [200, 200]);
    d.connect(
      s.body,
      { nodeId: data.network.nodes[0].id, portKey: "x" },
      { nodeId: fx, portKey: "value" },
    );
    if (discard) d.parameter(s.body, fx, "discardBelow", 0.5);
    d.parameter(s.body, fx, "depth", 0.2);
    d.connect(
      s.body,
      { nodeId: fx, portKey: "first" },
      { nodeId: data.network.nodes[1].id, portKey: "y" },
      true,
    );
    d.connect(
      s.body,
      { nodeId: fx, portKey: "second" },
      { nodeId: data.network.nodes[1].id, portKey: "twice" },
      true,
    );
  });
  if (unconsumed)
    s.graph.change("Unconsumed effect call", (d) => {
      for (const edge of s.graph
        .capture()
        .document.graph.stages.find((st) => st.network.id === s.network)!
        .network.edges.filter((e) => e.from.nodeId === s.call))
        d.disconnect(s.network, edge.id);
    });
  s.graph.change("Effect function", (d) =>
    d.emissionMode(s.body, "function", s.profile),
  );
  if (nested) {
    s.graph.change("Nest effects", (d) => d.encapsulate(s.network, [s.call]));
    const parent = s.graph
      .capture()
      .document.graph.resources.find((r) =>
        asNetwork(r, s.fixed)?.network.nodes.some((n) => n.id === s.call),
      )!;
    s.graph.change("Outer effects", (d) =>
      d.emissionMode(
        asNetwork(parent, s.fixed)!.network.id,
        "function",
        s.profile,
      ),
    );
  }
  return s;
}
export function stageFixture() {
  const s = functionSetup();
  let call = "";
  s.graph.change("Shared stages", (d) => {
    call = d.createSubgraph(s.network);
  });
  const definition = s.graph
      .capture()
      .document.graph.resources.find((r) => asNetwork(r, s.fixed))!,
    body = asNetwork(definition, s.fixed)!.network.id;
  s.graph.change("Pixel result", (d) => {
    d.parameter(s.network, call, "value", [0.2, 0.4, 0.6, 1]);
    d.connect(
      s.network,
      { nodeId: call, portKey: "value" },
      {
        nodeId: s.graph.resolveNetwork(s.network).nodes[0].id,
        portKey: "color",
      },
    );
    d.emissionMode(body, "function", functionProfile);
  });
  const doc = structuredClone(s.graph.capture().document),
    stage = doc.graph.stages[0],
    def = s.fixed.node(nodeRef("vertex-output"))!;
  stage.implementation = "network";
  stage.network.nodes.push({
    id: "vertex-boundary",
    name: "Vertex output",
    type: def.ref,
    state: {},
    inputValues: {},
    ports: structuredClone([...def.ports({})]),
    references: [],
    referencesComplete: true,
    position: [0, 0],
    extensions: {},
  });
  const graph = new Graph(doc, s.fixed, s.identity);
  graph.change("Vertex invocation", (d) => {
    const vertexCall = d.addReferenceNode(
        stage.network.id,
        "call",
        definition.id,
      ),
      position = d.add(
        stage.network.id,
        functionOperationRef("vertex-position"),
        [0, 0],
      );
    d.connect(
      stage.network.id,
      { nodeId: position, portKey: "position" },
      { nodeId: vertexCall, portKey: "value" },
    );
    d.connect(
      stage.network.id,
      { nodeId: vertexCall, portKey: "value" },
      { nodeId: "vertex-boundary", portKey: "position" },
    );
  });
  return { ...s, graph, body, profile: functionProfile };
}
