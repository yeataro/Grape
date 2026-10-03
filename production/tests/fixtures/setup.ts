import { networkModule } from "../../src/modules/networks.ts";
import { Definitions } from "../../src/definitions/registry.ts";
import { Graph } from "../../src/model/graph.ts";
import { basicNodes, nodeRef } from "../../src/modules/nodes.ts";
import {
  graphKinds,
  imageKind,
  stages,
  esProfile,
} from "../../src/modules/image.ts";
import { EditorApplication } from "../../src/application/editor.ts";
import type { StorageAdapter } from "../../src/sdk/editing.ts";
export function setup() {
  let sequence = 0;
  const identity = { next: () => `id-${++sequence}` },
    definitions = new Definitions();
  stages.forEach((s) => definitions.registerStage(s));
  definitions.register(basicNodes);
  definitions.register(networkModule);
  definitions.register(graphKinds);
  definitions.registerKind(imageKind);
  const fixed = definitions.pin(definitions.pins()),
    graph = Graph.create(imageKind.ref, fixed, identity);
  const network = graph
    .capture()
    .document.graph.stages.find((s) => s.key === "pixel")!.network.id;
  return { identity, definitions, fixed, graph, network };
}
export function flow() {
  const s = setup();
  let float = "",
    multiply = "",
    compose = "";
  s.graph.change("Create flow", (d) => {
    float = d.add(s.network, nodeRef("float"), [0, 0]);
    multiply = d.add(s.network, nodeRef("multiply"), [200, 0]);
    compose = d.add(s.network, nodeRef("compose"), [400, 0]);
    d.connect(
      s.network,
      { nodeId: float, portKey: "value" },
      { nodeId: multiply, portKey: "a" },
    );
    d.connect(
      s.network,
      { nodeId: multiply, portKey: "result" },
      { nodeId: compose, portKey: "x" },
    );
    const output = s.graph
      .capture()
      .document.graph.stages.find((s) => s.key === "pixel")!.network.nodes[0]
      .id;
    d.connect(
      s.network,
      { nodeId: compose, portKey: "result" },
      { nodeId: output, portKey: "color" },
    );
  });
  return { ...s, float, multiply, compose };
}
export class MemoryStorage implements StorageAdapter {
  records = new Map<string, string>();
  async write(key: string, text: string) {
    this.records.set(key, text);
  }
  async read(key: string) {
    const text = this.records.get(key);
    if (text === undefined) throw Error("MISSING");
    return text;
  }
  async list() {
    return [...this.records].map(([key, text]) => ({
      key,
      name: JSON.parse(text).graph.name,
    }));
  }
}
export function application(storage: StorageAdapter = new MemoryStorage()) {
  const s = setup();
  let exported = "";
  const app = new EditorApplication(
    s.definitions,
    s.identity,
    imageKind.ref,
    esProfile,
    storage,
    {
      download: async (_name, text) => {
        exported = text;
      },
    },
  );
  app.grant("test", [
    "grape.node.add",
    "grape.node.move",
    "grape.node.delete",
    "grape.edge.connect",
    "grape.undo",
    "grape.redo",
  ]);
  app.newDocument();
  const context = app.context();
  const target = () => ({ scope: context.capture().scope, object: null });
  const add = (type: string) => {
    app.execute({ panelId: "test", typeId: "test" }, target(), {
      commandId: "grape.node.add",
      args: { ref: { ...nodeRef(type) }, position: [0, 0] },
    });
    return context.capture().primary!;
  };
  return { ...s, app, context, target, add, exported: () => exported };
}
