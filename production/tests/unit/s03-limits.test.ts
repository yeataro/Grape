import { test } from "node:test";
import assert from "node:assert/strict";
import { flow } from "../fixtures/setup.ts";
import { Graph } from "../../src/model/graph.ts";
import { copySelection } from "../../src/model/transfer.ts";
import { asNetwork, modelContext } from "../../src/sdk/networks.ts";
import { nodeRef } from "../../src/modules/nodes.ts";
import { compile } from "../../src/generation/compiler.ts";
import { esProfile } from "../../src/modules/image.ts";
import { writeDocument } from "../../src/persistence/codec.ts";

test("S03 Group17 retains a draft, compilation rejects per-direction limit, Undo restores original", () => {
  const s = flow();
  let selected: string[] = [];
  s.graph.change("17 inputs", (d) => {
    for (let i = 0; i < 17; i++) {
      const f = d.add(s.network, nodeRef("float"), [i * 10, 0]),
        m = d.add(s.network, nodeRef("multiply"), [i * 10, 100]);
      d.connect(
        s.network,
        { nodeId: f, portKey: "value" },
        { nodeId: m, portKey: "a" },
      );
      selected.push(m);
    }
  });
  const before = s.graph.capture().document;
  s.graph.change("Group17", (d) => d.encapsulate(s.network, selected));
  const resource = s.graph.capture().document.graph.resources[0];
  assert.equal(
    asNetwork(resource, s.fixed)!.interface.filter(
      (p) => p.direction === "input",
    ).length,
    17,
  );
  const compiled = compile(s.graph.capture(), s.fixed, esProfile);
  assert.equal(compiled.status, "failed");
  assert(compiled.diagnostics.some((d) => d.code === "INTERFACE_PORT_LIMIT"));
  s.graph.undo();
  assert.deepEqual(s.graph.capture().document, before);
});
test("S03 64-definition destination rejects independence and imported 65th atomically", () => {
  const s = flow();
  let call = "";
  s.graph.change("64 definitions", (d) => {
    for (let i = 0; i < 64; i++)
      call = d.createSubgraph(s.network, "Group" + i);
  });
  const packet = structuredClone(
    copySelection(s.graph.capture(), s.fixed, s.network, [call]),
  );
  packet.graphId = "different";
  const before = s.graph.capture();
  assert.throws(
    () =>
      s.graph.change("65th independent", (d) =>
        d.makeIndependent(s.network, call),
      ),
    /DEFINITION_LIMIT/,
  );
  assert.throws(
    () => s.graph.change("65th paste", (d) => d.paste(s.network, packet)),
    /DEFINITION_LIMIT/,
  );
  assert.deepEqual(s.graph.capture(), before);
});
for (const kind of ["nodes", "edges"])
  test(`S03 nested ${kind} overflow rejects before paste publication`, () => {
    const s = flow();
    let call = "";
    s.graph.change("Group", (d) => {
      call = d.encapsulate(s.network, [s.multiply]);
    });
    const packet = structuredClone(
        copySelection(s.graph.capture(), s.fixed, s.network, [call]),
      ),
      data = asNetwork(packet.resources[0], s.fixed)!;
    if (kind === "nodes") {
      const template = data.network.nodes.find(
        (n) => n.type.typeId === "multiply",
      )!;
      while (data.network.nodes.length <= 256)
        data.network.nodes.push({
          ...structuredClone(template),
          id: "extra-" + data.network.nodes.length,
        });
    } else {
      const template = data.network.edges[0];
      while (data.network.edges.length <= 1024)
        data.network.edges.push({
          ...structuredClone(template),
          id: "extra-" + data.network.edges.length,
        });
    }
    const before = s.graph.capture();
    assert.throws(
      () => s.graph.change("Overflow", (d) => d.paste(s.network, packet)),
      /RESOURCE_STATE/,
    );
    assert.deepEqual(s.graph.capture(), before);
  });
test("S03 symbolic extents require int/uint sources, only outer dimension and pure compilation", () => {
  const s = flow();
  let extent = "",
    array = "";
  s.graph.change("Array", (d) => {
    extent = d.createSource("Extent", "glsl.uint", 2, true);
    array = d.createSource(
      "Array",
      "array@" + JSON.stringify(["glsl.float", { sourceId: extent }]),
      [1, 2],
      true,
    );
    d.addReferenceNode(s.network, "source", array);
  });
  const before = s.graph.capture(),
    type = "array@" + JSON.stringify(["glsl.float", { sourceId: extent }]);
  assert(modelContext(before.document, s.fixed).types.resolve(type));
  assert.equal(compile(before, s.fixed, esProfile).status, "success");
  assert.deepEqual(s.graph.capture(), before);
  const doc = structuredClone(before.document);
  (doc.graph.resources.find((r) => r.id === extent)!.data as any).type =
    "glsl.float";
  const types = modelContext(doc, s.fixed).types;
  assert(!types.resolve(type));
  assert.throws(() => types.defaultValue(type), /ARRAY_EXTENT/);
  assert(!types.resolve("array@" + JSON.stringify([type, 2])));
  const g = new Graph(doc, s.fixed, s.identity);
  assert.equal(compile(g.capture(), s.fixed, esProfile).status, "failed");
});

test("S03 New may retain a 257-node draft; generation and save reject it without losing the draft", () => {
  const s = flow();
  s.graph.change("Fill root", (d) => {
    for (let i = 4; i < 256; i++) d.add(s.network, nodeRef("float"), [0, 0]);
  });
  const history = s.graph.historyLength;
  s.graph.change("New", (d) => d.createSubgraph(s.network));
  assert.equal(s.graph.historyLength, history + 1);
  const snapshot = s.graph.capture();
  assert.equal(
    snapshot.document.graph.stages.find((x) => x.network.id === s.network)!
      .network.nodes.length,
    257,
  );
  assert.equal(compile(snapshot, s.fixed, esProfile).status, "failed");
  assert.throws(() => writeDocument(snapshot.document), /NETWORK_SIZE/);
  assert.deepEqual(s.graph.capture(), snapshot);
  s.graph.undo();
  assert.equal(s.graph.capture().document.graph.resources.length, 0);
});

test("S03 partial frames stay outside clipboard; pasted relative positions retain a common offset", () => {
  const s = flow();
  s.graph.change("Frame", (d) =>
    d.frameSelection(s.network, [s.float, s.multiply]),
  );
  const packet = copySelection(s.graph.capture(), s.fixed, s.network, [
    s.float,
  ]);
  assert.equal(packet.resources.length, 0);
  const pair = copySelection(s.graph.capture(), s.fixed, s.network, [
    s.float,
    s.multiply,
  ]);
  let added: string[] = [];
  s.graph.change("Paste", (d) => {
    added = d.paste(s.network, pair);
  });
  const nodes = s.graph
    .capture()
    .document.graph.stages.find((x) => x.network.id === s.network)!.network
    .nodes;
  for (const [i, id] of added.entries())
    assert.deepEqual(
      nodes.find((n) => n.id === id)!.position,
      pair.network.nodes[i].position.map((v) => v + 40),
    );
});

test("S03 persisted nested source is preserved while new nested source admission remains rejected", () => {
  const s = flow();
  let call = "",
    source = "";
  s.graph.change("Setup", (d) => {
    call = d.createSubgraph(s.network);
    const id = d.createSource("Existing", "glsl.float", 2);
    source = d.addReferenceNode(s.network, "source", id);
  });
  const doc = structuredClone(s.graph.capture().document),
    root = doc.graph.stages.find((x) => x.network.id === s.network)!.network,
    resource = doc.graph.resources.find((r) => asNetwork(r, s.fixed))!,
    nested = asNetwork(resource, s.fixed)!.network,
    node = root.nodes.find((n) => n.id === source)!;
  root.nodes = root.nodes.filter((n) => n.id !== source);
  nested.nodes.push(node);
  const g = new Graph(doc, s.fixed, s.identity);
  assert(
    asNetwork(
      g.capture().document.graph.resources.find((r) => r.id === resource.id)!,
      s.fixed,
    )!.network.nodes.some((n) => n.id === source),
  );
  assert.throws(
    () =>
      g.change("New source", (d) =>
        d.addReferenceNode(nested.id, "source", (node.state as any).source),
      ),
    /SOURCE_ADMISSION/,
  );
});

test("S03 scalar/vector/matrix sources transfer; composite source reuses only within its source lifetime", () => {
  for (const [type, value] of [
    ["glsl.int", 2],
    ["glsl.uint", 3],
    ["glsl.float", 2.5],
    ["glsl.vec2", [1, 2]],
    [
      "glsl.mat2",
      [
        [1, 2],
        [3, 4],
      ],
    ],
  ] as const) {
    const s = flow();
    let node = "";
    s.graph.change("Source", (d) => {
      const source = d.createSource(
        "Numeric",
        type,
        structuredClone(value) as any,
      );
      node = d.addReferenceNode(s.network, "source", source);
    });
    const packet = structuredClone(
      copySelection(s.graph.capture(), s.fixed, s.network, [node]),
    );
    packet.graphId = "other";
    s.graph.change("Paste", (d) => d.paste(s.network, packet));
    assert.equal(s.graph.capture().document.graph.resources.length, 2);
  }
  const s = flow();
  let node = "";
  s.graph.change("Composite", (d) => {
    const structure = d.createStructure("Composite", [
        { id: "x", name: "x", type: "glsl.float" },
      ]),
      source = d.createSource("Composite source", "struct@" + structure, {
        x: 2,
      });
    node = d.addReferenceNode(s.network, "source", source);
  });
  const packet = copySelection(s.graph.capture(), s.fixed, s.network, [node]);
  s.graph.change("Reuse", (d) => d.paste(s.network, packet));
  const before = s.graph.capture();
  assert.throws(
    () =>
      s.graph.change("Cross", (d) =>
        d.paste(s.network, { ...packet, graphId: "other" }),
      ),
    /SOURCE_CLIPBOARD_DENIED/,
  );
  assert.deepEqual(s.graph.capture(), before);
});
