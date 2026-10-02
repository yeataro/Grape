import { test } from "node:test";
import assert from "node:assert/strict";
import { setup, flow, application } from "../fixtures/setup.ts";
import { Graph } from "../../src/model/graph.ts";
import { copySelection } from "../../src/model/transfer.ts";
import {
  networks,
  asNetwork,
  modelContext,
  frames,
} from "../../src/sdk/networks.ts";
import { nodeRef } from "../../src/modules/nodes.ts";
import { compile } from "../../src/generation/compiler.ts";
import { esProfile } from "../../src/modules/image.ts";
import { canvasCommands } from "../../src/features/canvas.ts";
import { EditorContext } from "../../src/application/editor.ts";
import type { NetworkData } from "../../src/sdk/networks.ts";
const net = (s: ReturnType<typeof setup>, id: string) =>
  networks(s.graph.capture().document, s.fixed).find(
    (n) => n.network.id === id,
  )!.network;
const definition = (s: ReturnType<typeof setup>, caller: string) => {
  const n = net(s, s.network).nodes.find((n) => n.id === caller)!;
  const r = s.graph
    .capture()
    .document.graph.resources.find(
      (r) => r.id === (n.state as any).definition,
    )!;
  return { r, data: asNetwork(r, s.fixed)! };
};
test("S03 encapsulation deduplicates crossing interfaces, shared generation is pure, Undo restores all references", () => {
  const s = flow(),
    before = s.graph.capture();
  let call = "";
  s.graph.change("Group", (d) => {
    call = d.encapsulate(s.network, [s.multiply]);
  });
  const { data } = definition(s, call);
  assert.equal(data.interface.length, 2);
  assert.equal(data.network.nodes.length, 3);
  assert.equal(s.graph.historyLength, 2);
  const snap = s.graph.capture(),
    result = compile(snap, s.fixed, esProfile);
  assert.equal(result.status, "success", JSON.stringify(result.diagnostics));
  assert(result.artifacts[1].text.includes("* 2.0"));
  assert.deepEqual(s.graph.capture(), snap);
  s.graph.undo();
  assert.deepEqual(s.graph.capture().document, before.document);
  s.graph.redo();
  assert.deepEqual(s.graph.capture().document, snap.document);
});
test("S03 interface rename/reorder/type/removal reconciles every caller once and Undo restores values/invalid edges/loss", () => {
  const s = flow();
  let call = "",
    second = "";
  s.graph.change("Group", (d) => {
    call = d.encapsulate(s.network, [s.multiply]);
  });
  const { r, data } = definition(s, call);
  s.graph.change("Another", (d) => {
    second = d.addReferenceNode(s.network, "call", r.id);
  });
  const before = s.graph.capture();
  let observed = 0;
  s.graph.subscribe((snapshot) => {
    observed++;
    const n = networks(snapshot.document, s.fixed).find(
      (n) => n.network.id === s.network,
    )!.network;
    assert.deepEqual(
      n.nodes.find((n) => n.id === call)!.ports,
      n.nodes.find((n) => n.id === second)!.ports,
    );
  });
  s.graph.change("Interface", (d) =>
    d.interface(data.network.id, [
      { ...data.interface[1], name: "Renamed", type: "glsl.vec2" },
    ]),
  );
  assert.equal(observed, 1);
  const after = s.graph.capture();
  assert(after.document.graph.losses.length > 0);
  assert(after.document.graph.losses.some((l) => l.payload.kind === "edge"));
  s.graph.undo();
  assert.deepEqual(s.graph.capture().document, before.document);
});
test("S03 nested resource callers including unused ancestors reconcile child interface", () => {
  const s = setup();
  let child = "",
    parent = "";
  s.graph.change("Definitions", (d) => {
    child = d.createSubgraph(s.network, "Child");
    parent = d.createSubgraph(s.network, "Parent");
  });
  const c = definition(s, child),
    p = definition(s, parent);
  let inner = "";
  s.graph.change("Nested caller", (d) => {
    inner = d.addReferenceNode(p.data.network.id, "call", c.r.id);
  });
  s.graph.change("Child interface", (d) =>
    d.interface(c.data.network.id, [
      {
        key: "x",
        name: "X",
        direction: "input",
        type: "glsl.float",
        supply: "local",
        defaultValue: 3,
      },
    ]),
  );
  assert.equal(
    net(s, p.data.network.id).nodes.find((n) => n.id === inner)!.inputValues.x,
    3,
  );
  assert.equal(
    net(s, s.network).nodes.find((n) => n.id === child)!.inputValues.x,
    3,
  );
});
test("S03 library position keeps identity, semantic edit forks target and library ancestors and local refs atomically", () => {
  const s = setup();
  let child = "",
    parent = "";
  s.graph.change("Seed", (d) => {
    child = d.createSubgraph(s.network, "Child");
    parent = d.createSubgraph(s.network, "Parent");
  });
  let c = definition(s, child),
    p = definition(s, parent);
  s.graph.change("Nested", (d) =>
    d.addReferenceNode(p.data.network.id, "call", c.r.id),
  );
  const doc = structuredClone(s.graph.capture().document);
  for (const r of doc.graph.resources) {
    const data = asNetwork(r, s.fixed)!;
    data.local = false;
    data.origin = "library/" + r.id;
  }
  const g = new Graph(doc, s.fixed, s.identity),
    before = g.capture();
  g.change("Position", (d) =>
    d.move(c.data.network.id, c.data.network.nodes[0].id, [5, 5]),
  );
  assert.equal(g.capture().document.graph.resources[0].id, c.r.id);
  g.change("Semantic", (d) =>
    d.add(c.data.network.id, nodeRef("float"), [80, 80]),
  );
  assert(
    g
      .capture()
      .document.graph.resources.every((r) => ![c.r.id, p.r.id].includes(r.id)),
  );
  assert(
    g
      .capture()
      .document.graph.resources.every((r) => asNetwork(r, s.fixed)!.local),
  );
  assert(!g.capture().diagnostics.some((d) => d.code !== "INPUT_REQUIRED"));
  g.undo();
  assert.equal(g.capture().document.graph.resources[0].id, c.r.id);
  assert.equal(before.document.graph.resources[0].id, c.r.id);
});
test("S03 direct make independent clones direct definition, shares dependencies and remaps own boundary", () => {
  const s = setup();
  let c = "",
    p = "";
  s.graph.change("Seed", (d) => {
    c = d.createSubgraph(s.network, "Child");
    p = d.createSubgraph(s.network, "Parent");
  });
  const child = definition(s, c),
    parent = definition(s, p);
  s.graph.change("Nested", (d) =>
    d.addReferenceNode(parent.data.network.id, "call", child.r.id),
  );
  const before = s.graph.capture();
  s.graph.change("Independent", (d) => d.makeIndependent(s.network, p));
  const next = definition(s, p);
  assert.notEqual(next.r.id, parent.r.id);
  assert.equal(
    next.data.network.nodes.find((n) => n.type.typeId === "call")!.references[0]
      .targetId,
    child.r.id,
  );
  assert(
    next.data.network.nodes
      .filter((n) => n.type.typeId.startsWith("network-"))
      .every((n) => n.references[0].targetId === next.r.id),
  );
  s.graph.undo();
  assert.deepEqual(s.graph.capture().document, before.document);
});
test("S03 same-load clipboard reuses current source; cross-graph remaps resources and preserves text", () => {
  const s = flow();
  let source = "",
    n = "";
  s.graph.change("Source", (d) => {
    source = d.createSource("\u540c\u540d\ud83c\udf47", "glsl.float", 2, true);
    n = d.addReferenceNode(s.network, "source", source);
  });
  const packet = copySelection(s.graph.capture(), s.fixed, s.network, [n]);
  const changed = structuredClone(s.graph.capture().document);
  (changed.graph.resources[0].data as any).value = 9;
  s.graph.change("Current source", (d) => d.replaceDocument(changed));
  s.graph.change("Paste", (d) => d.paste(s.network, packet, s.graph.loadId));
  assert.equal(s.graph.capture().document.graph.resources.length, 1);
  assert.equal(
    (s.graph.capture().document.graph.resources[0].data as any).value,
    9,
  );
  const other = flow();
  const otherDoc = structuredClone(other.graph.capture().document);
  otherDoc.graph.id = "another-graph";
  const graph = new Graph(otherDoc, other.fixed, {
    next: () => "new-" + Math.random(),
  });
  graph.change("Paste", (d) => d.paste(other.network, packet, graph.loadId));
  assert.equal(graph.capture().document.graph.resources.length, 1);
  assert.notEqual(graph.capture().document.graph.resources[0].id, source);
  assert.equal(
    (graph.capture().document.graph.resources[0].data as any).name,
    "\u540c\u540d\ud83c\udf47",
  );
});
test("S03 clipboard typed native symbolic array closure remaps only semantic references", () => {
  const s = flow();
  let extent = "",
    source = "",
    n = "";
  s.graph.change("Array source", (d) => {
    extent = d.createSource("Size", "glsl.int", 2, true);
    source = d.createSource(
      "Array",
      "array@" + JSON.stringify(["glsl.float", { sourceId: extent }]),
      null,
      true,
      { kind: "native-array", path: "/symbolic-array" },
    );
    n = d.addReferenceNode(s.network, "source", source);
  });
  const packet = copySelection(s.graph.capture(), s.fixed, s.network, [n]);
  assert.equal(packet.resources.length, 2);
  const other = flow();
  const doc = structuredClone(other.graph.capture().document);
  doc.graph.id = "other";
  const g = new Graph(doc, other.fixed, {
    next: () => "fresh-" + Math.random(),
  });
  g.change("Paste", (d) => d.paste(other.network, packet, g.loadId));
  assert.equal(g.capture().diagnostics.length, 0);
  const resources = g.capture().document.graph.resources;
  const size = resources.find((r) => (r.data as any).name === "Size")!,
    array = resources.find((r) => (r.data as any).name === "Array")!;
  assert((array.data as any).type.includes(size.id));
  assert(!(array.data as any).type.includes(extent));
});
test("S03 late bad edge, escaping refs, forbidden source and missing closure reject without nodes/resources/history/notifications", () => {
  const s = flow();
  let call = "";
  s.graph.change("Group", (d) => {
    call = d.encapsulate(s.network, [s.multiply]);
  });
  const packet = copySelection(s.graph.capture(), s.fixed, s.network, [call]);
  for (const mutate of [
    (p: any) => p.resources.splice(0, 1),
    (p: any) =>
      p.network.nodes[0].references.push({
        slot: "bad",
        kind: "resource",
        targetId: "missing",
      }),
    (p: any) =>
      p.network.edges.push({
        id: "bad",
        from: { nodeId: "missing", portKey: "x" },
        to: { nodeId: p.network.nodes[0].id, portKey: "x" },
        adaptation: {
          schema: "grape.edge-adaptation",
          version: 1,
          sourceType: "glsl.float",
          targetType: "glsl.float",
          operation: "identity",
          extensions: {},
        },
        extensions: {},
      }),
  ]) {
    const p = structuredClone(packet);
    mutate(p);
    const before = s.graph.capture(),
      history = s.graph.historyLength;
    let observations = 0;
    const off = s.graph.subscribe(() => observations++);
    assert.throws(() =>
      s.graph.change("Bad paste", (d) => d.paste(s.network, p, s.graph.loadId)),
    );
    assert.deepEqual(s.graph.capture(), before);
    assert.equal(s.graph.historyLength, history);
    assert.equal(observations, 0);
    off();
  }
});
test("S03 source selection stays outside encapsulation; boundary-only grouping is no-op and preserves redo", () => {
  const s = setup();
  let source = "",
    n = "",
    f = "";
  s.graph.change("Source", (d) => {
    source = d.createSource("Source", "glsl.float", 1, true);
    n = d.addReferenceNode(s.network, "source", source);
    f = d.add(s.network, nodeRef("multiply"), [20, 20]);
    d.connect(
      s.network,
      { nodeId: n, portKey: "value" },
      { nodeId: f, portKey: "a" },
    );
  });
  let call = "";
  s.graph.change("Group", (d) => {
    call = d.encapsulate(s.network, [n, f]);
  });
  assert(net(s, s.network).nodes.some((x) => x.id === n));
  assert(!definition(s, call).data.network.nodes.some((x) => x.id === n));
  s.graph.undo();
  const before = s.graph.capture();
  s.graph.change("Nothing", (d) => d.encapsulate(s.network, [n]));
  assert.deepEqual(s.graph.capture(), before);
  assert(s.graph.canRedo);
});
test("S03 structure drafts retain stable fields, reject recursion and block deletion while referenced", () => {
  const s = setup();
  let id = "",
    n = "";
  s.graph.change("Struct", (d) => {
    id = d.createStructure("Pair", [
      { id: "x", name: "x", type: "glsl.float" },
      { id: "y", name: "y", type: "glsl.vec2" },
    ]);
    n = d.addReferenceNode(s.network, "structure", id);
  });
  assert(
    !s.graph.capture().diagnostics.some((d) => d.code !== "INPUT_REQUIRED"),
  );
  const before = s.graph.capture();
  assert.throws(
    () => s.graph.change("Delete", (d) => d.removeResource(id)),
    /RESOURCE_IN_USE/,
  );
  assert.throws(() =>
    s.graph.change("Recursive", (d) =>
      d.editStructure(id, {
        name: "Pair",
        fields: [{ id: "x", name: "x", type: "struct@" + id }],
      }),
    ),
  );
  assert.deepEqual(s.graph.capture(), before);
  s.graph.change("Reorder", (d) =>
    d.editStructure(id, {
      name: "Pair",
      fields: [
        { id: "y", name: "renamed", type: "glsl.vec2" },
        { id: "x", name: "x", type: "glsl.float" },
      ],
    }),
  );
  assert.deepEqual(
    net(s, s.network)
      .nodes.find((x) => x.id === n)!
      .ports.slice(0, 2)
      .map((p) => p.key),
    ["y", "x"],
  );
  s.graph.undo();
  assert.deepEqual(s.graph.capture().document, before.document);
});
test("S03 contexts distinguish occurrences; nested scoped targets never revive after navigation and Undo", () => {
  const a = application();
  a.app.grant("s03", canvasCommands);
  const run = (commandId: string, args: any = {}) =>
    a.app.execute(
      { panelId: "s03", typeId: "s03" },
      { scope: a.context.capture().scope, object: null },
      { commandId, args },
    );
  run("grape.network.create");
  const call = a.context.capture().primary!;
  run("grape.network.enter", { id: call });
  const node = a.add("float");
  const field = a.app.parameter(
      a.context,
      node,
      "value",
      a.context.capture().scope,
    ),
    token = field.capture().editToken;
  field.commit(0.5, token);
  run("grape.undo");
  assert.throws(() => field.capture(), /TARGET_EXPIRED|STALE_SCOPE/);
  const next = a.app.parameter(
    a.context,
    node,
    "value",
    a.context.capture().scope,
  );
  run("grape.network.up");
  run("grape.network.enter", { id: call });
  assert.throws(() => next.capture(), /TARGET_EXPIRED|STALE_SCOPE/);
  const other = a.app.context();
  assert.equal(other.capture().scope.networkPath.length, 0);
  assert.equal(a.context.capture().scope.networkPath.length, 1);
});

test("S03 library snapshot position edit retains origin, first semantic edit forks and old source remains immutable", () => {
  const s = flow();
  let call = "";
  s.graph.change("Library", (d) => {
    call = d.createSubgraph(s.network, "Library", "requested");
  });
  const { r, data } = definition(s, call),
    library = structuredClone(s.fixed.resourceByModel("network")!.library),
    float = data.network.nodes.find((n) => n.type.typeId === "float")!;
  s.graph.change("Move", (d) => d.move(data.network.id, float.id, [300, 200]));
  assert.equal(definition(s, call).r.id, r.id);
  s.graph.change("Parameter", (d) =>
    d.parameter(data.network.id, float.id, "value", 0.7),
  );
  assert.notEqual(definition(s, call).r.id, r.id);
  assert.deepEqual(s.fixed.resourceByModel("network")!.library, library);
  s.graph.undo();
  assert.equal(definition(s, call).r.id, r.id);
});
test("S03 nested delete and required boundary protection use the canonical Graph", () => {
  const s = setup();
  let call = "",
    node = "";
  s.graph.change("Definition", (d) => {
    call = d.createSubgraph(s.network);
  });
  const { data } = definition(s, call);
  s.graph.change("Add", (d) => {
    node = d.add(data.network.id, nodeRef("float"), [0, 0]);
  });
  s.graph.change("Delete", (d) => d.remove(data.network.id, node));
  assert(!net(s, data.network.id).nodes.some((n) => n.id === node));
  const before = s.graph.capture();
  assert.throws(
    () =>
      s.graph.change("Boundary", (d) =>
        d.remove(data.network.id, data.network.nodes[0].id),
      ),
    /BOUNDARY_PROTECTED/,
  );
  assert.deepEqual(s.graph.capture(), before);
});
test("S03 library ancestor traversal crosses local parents", () => {
  const s = setup();
  let c = "",
    p = "",
    a = "";
  s.graph.change("Seed", (d) => {
    c = d.createSubgraph(s.network, "Child");
    p = d.createSubgraph(s.network, "Parent");
    a = d.createSubgraph(s.network, "Ancestor");
  });
  const child = definition(s, c),
    parent = definition(s, p),
    ancestor = definition(s, a);
  s.graph.change("Calls", (d) => {
    d.addReferenceNode(parent.data.network.id, "call", child.r.id);
    d.addReferenceNode(ancestor.data.network.id, "call", parent.r.id);
  });
  const doc = structuredClone(s.graph.capture().document);
  for (const r of doc.graph.resources)
    if (r.id !== parent.r.id) (r.data as unknown as NetworkData).local = false;
  const g = new Graph(doc, s.fixed, s.identity);
  g.change("Fork", (d) =>
    d.add(child.data.network.id, nodeRef("float"), [0, 0]),
  );
  const rs = g.capture().document.graph.resources;
  assert(rs.some((r) => r.id === parent.r.id));
  assert(!rs.some((r) => r.id === child.r.id || r.id === ancestor.r.id));
});
test("S03 spare-port creation and first edge are one Undo entry with stable keys", () => {
  const s = setup();
  let call = "",
    f = "";
  s.graph.change("Definition", (d) => {
    call = d.createSubgraph(s.network);
  });
  const { data } = definition(s, call);
  s.graph.change("Float", (d) => {
    f = d.add(data.network.id, nodeRef("float"), [200, 100]);
  });
  const before = s.graph.capture();
  s.graph.change("Spare", (d) =>
    d.sparePort(
      data.network.id,
      data.network.nodes.find((n) => n.type.typeId === "network-output")!.id,
      { nodeId: f, portKey: "value" },
    ),
  );
  assert.equal(
    definition(s, call).data.interface.length,
    data.interface.length + 1,
  );
  assert.equal(
    net(s, data.network.id).edges.length,
    data.network.edges.length + 1,
  );
  s.graph.undo();
  assert.deepEqual(s.graph.capture().document, before.document);
});
test("S03 whole frames travel through grouping and cross-Graph clipboard with fresh identities", () => {
  const s = flow();
  s.graph.change("Frame", (d) =>
    d.frameSelection(s.network, [s.multiply], "Math frame"),
  );
  let call = "";
  s.graph.change("Group", (d) => {
    call = d.encapsulate(s.network, [s.multiply]);
  });
  const { data } = definition(s, call);
  assert.equal(
    frames(s.graph.capture().document, s.fixed, data.network.id)[0].name,
    "Math frame",
  );
  const packet = copySelection(s.graph.capture(), s.fixed, s.network, [call]);
  assert(
    packet.resources.some((r) => s.fixed.resource(r.type)?.model === "frame"),
    "Nested clipboard must include its owned frame",
  );
  const other = flow();
  other.graph.change("Paste", (d) =>
    d.paste(other.network, { ...packet, graphId: "other-graph" }),
  );
  const copied = other.graph
      .capture()
      .document.graph.resources.find((r) => asNetwork(r, other.fixed))!,
    nested = asNetwork(copied, other.fixed)!,
    copiedFrame = frames(
      other.graph.capture().document,
      other.fixed,
      nested.network.id,
    )[0];
  assert(nested.network.nodes.some((n) => n.id === copiedFrame.nodeIds[0]));
  assert.notEqual(
    copiedFrame.id,
    frames(s.graph.capture().document, s.fixed, data.network.id)[0].id,
  );
});
test("S03 vector/matrix reshape retains override components and defaults follow interface defaults", () => {
  const s = setup();
  let call = "";
  s.graph.change("Definition", (d) => {
    call = d.createSubgraph(s.network);
  });
  const { data } = definition(s, call);
  s.graph.change("Ports", (d) =>
    d.interface(data.network.id, [
      {
        key: "v",
        name: "Vector",
        direction: "input",
        type: "glsl.vec2",
        supply: "local",
        defaultValue: [0, 0],
      },
    ]),
  );
  s.graph.change("Override", (d) => d.parameter(s.network, call, "v", [2, 3]));
  s.graph.change("Shape", (d) =>
    d.interface(data.network.id, [
      {
        key: "v",
        name: "Vector",
        direction: "input",
        type: "glsl.vec3",
        supply: "local",
        defaultValue: [0, 0, 0],
      },
    ]),
  );
  assert.deepEqual(
    net(s, s.network).nodes.find((n) => n.id === call)!.inputValues.v,
    [2, 3, 0],
  );
  assert(
    s.graph
      .capture()
      .document.graph.losses.some((l) => l.code === "INPUT_RESHAPED"),
  );
  const t = modelContext(s.graph.capture().document, s.fixed).types;
  assert(
    t.validValue("glsl.mat2", [
      [1, 2],
      [3, 4],
    ]),
  );
  assert.deepEqual(
    t.reshape("glsl.mat3", [
      [1, 2],
      [3, 4],
    ]),
    [
      [1, 2, 0],
      [3, 4, 0],
      [0, 0, 0],
    ],
  );
});
test("S03 malformed resource envelopes, missing boundaries and nominal conflicts reject atomically", () => {
  const s = flow();
  let call = "";
  s.graph.change("Definition", (d) => {
    call = d.createSubgraph(s.network);
  });
  const packet = copySelection(s.graph.capture(), s.fixed, s.network, [call]);
  for (const mutate of [
    (p: any) => (p.resources[0].unexpected = true),
    (p: any) => (p.resources[0].data.network.nodes = []),
  ]) {
    const p = structuredClone(packet);
    p.graphId = "different";
    mutate(p);
    const before = s.graph.capture();
    assert.throws(() =>
      s.graph.change("Reject", (d) => d.paste(s.network, p, s.graph.loadId)),
    );
    assert.deepEqual(s.graph.capture(), before);
  }
  let id = "",
    node = "";
  s.graph.change("Struct", (d) => {
    id = d.createStructure("Pair", [
      { id: "a", name: "a", type: "glsl.float" },
    ]);
    node = d.addReferenceNode(s.network, "structure", id);
  });
  const p = structuredClone(
    copySelection(s.graph.capture(), s.fixed, s.network, [node]),
  );
  (p.resources[0].data as any).name = "Conflict";
  assert.throws(
    () =>
      s.graph.change("Conflict", (d) => d.paste(s.network, p, s.graph.loadId)),
    /NOMINAL_CONTENT_CONFLICT/,
  );
});
test("S03 source admission cannot be bypassed by nested add, grouping or pasted nodes", () => {
  const s = flow();
  let call = "",
    source = "",
    node = "";
  s.graph.change("Source", (d) => {
    call = d.createSubgraph(s.network);
    source = d.createSource("Private", "glsl.float", 3, false);
    node = d.addReferenceNode(s.network, "source", source);
  });
  const nested = definition(s, call).data.network.id,
    packet = copySelection(s.graph.capture(), s.fixed, s.network, [node]),
    before = s.graph.capture();
  assert.throws(
    () =>
      s.graph.change("Nested source", (d) =>
        d.addReferenceNode(nested, "source", source),
      ),
    /SOURCE_ADMISSION/,
  );
  assert.throws(
    () =>
      s.graph.change("Nested paste", (d) =>
        d.paste(nested, packet, s.graph.loadId),
      ),
    /SOURCE_ADMISSION/,
  );
  assert.throws(
    () =>
      s.graph.change("New load", (d) =>
        d.paste(s.network, packet, "another-load"),
      ),
    /LOAD_MISMATCH/,
  );
  assert.deepEqual(s.graph.capture(), before);
});
test("S03 layout proposal rejects navigation ABA, semantic fork and Undo", () => {
  const a = application();
  a.app.grant("s03", canvasCommands);
  const origin = { panelId: "s03", typeId: "s03" },
    run = (commandId: string, args: any = {}) =>
      a.app.execute(
        origin,
        { scope: a.context.capture().scope, object: null },
        { commandId, args },
      );
  run("grape.network.create", { library: true });
  const call = a.context.capture().primary!;
  run("grape.network.enter", { id: call });
  const proposal = a.app.layoutProposal(a.context);
  run("grape.network.up");
  run("grape.network.enter", { id: call });
  assert.throws(() => run("grape.network.layout", proposal), /STALE_PROPOSAL/);
  const fresh = a.app.layoutProposal(a.context);
  const f = a.context.network().nodes.find((n) => n.type.typeId === "float")!;
  const field = a.app.parameter(
    a.context,
    f.id,
    "value",
    a.context.capture().scope,
  );
  field.commit(0.8, field.capture().editToken);
  assert.throws(() => run("grape.network.layout", fresh), /STALE_PROPOSAL/);
  assert.throws(() => field.capture(), /TARGET_EXPIRED/);
  run("grape.undo");
  assert.throws(() => run("grape.network.layout", fresh), /STALE_PROPOSAL/);
});

test("S03 clipboard rejects forged hydrated plans and invalid edge evidence", () => {
  const s = flow(),
    packet = copySelection(s.graph.capture(), s.fixed, s.network, [
      s.float,
      s.multiply,
    ]);
  for (const change of [
    (p: any) => (p.network.edges[0].adaptation.sourceType = "glsl.vec4"),
    (p: any) =>
      (p.network.edges[0].invalid = {
        code: "EDGE_INVALID",
        reason: "preserve",
      }),
  ]) {
    const p = structuredClone(packet);
    change(p);
    const before = s.graph.capture();
    assert.throws(
      () => s.graph.change("Reject", (d) => d.paste(s.network, p)),
      /IMPORT_ERRORS/,
    );
    assert.deepEqual(s.graph.capture(), before);
  }
});
test("S03 empty library paste preserves origin, selection-independent History and Redo", () => {
  const s = flow();
  let call = "";
  s.graph.change("Library", (d) => {
    call = d.createSubgraph(s.network, "Library", "requested");
  });
  const { data } = definition(s, call);
  s.graph.change("Move", (d) =>
    d.move(data.network.id, data.network.nodes[0].id, [5, 5]),
  );
  s.graph.undo();
  const before = s.graph.capture(),
    packet = copySelection(before, s.fixed, data.network.id, []),
    history = s.graph.historyLength;
  s.graph.change("Empty", (d) => d.paste(data.network.id, packet));
  assert.deepEqual(s.graph.capture(), before);
  assert.equal(s.graph.historyLength, history);
  assert(s.graph.canRedo);
});
test("S03 packet-wide network identity collisions and malformed reused resource envelopes reject", () => {
  const s = flow();
  let call = "";
  s.graph.change("Group", (d) => {
    call = d.encapsulate(s.network, [s.multiply]);
  });
  const packet = copySelection(s.graph.capture(), s.fixed, s.network, [call]);
  for (const change of [
    (p: any) => (p.network.id = p.resources[0].data.network.id),
    (p: any) => (p.resources[0].unexpected = true),
    (p: any) => delete p.resources[0].extensions,
  ]) {
    const p = structuredClone(packet);
    change(p);
    const before = s.graph.capture();
    assert.throws(() => s.graph.change("Reject", (d) => d.paste(s.network, p)));
    assert.deepEqual(s.graph.capture(), before);
  }
});
test("S03 source transfer uses actual load identity and reopened documents cannot forge same-load reuse", () => {
  const s = flow();
  let id = "",
    n = "";
  s.graph.change("Source", (d) => {
    id = d.createSource("Private", "glsl.float", 2, false);
    n = d.addReferenceNode(s.network, "source", id);
  });
  const packet = copySelection(s.graph.capture(), s.fixed, s.network, [n]);
  let seq = 0;
  const reopened = new Graph(
    structuredClone(s.graph.capture().document),
    s.fixed,
    { next: () => "reopened-" + seq++ },
  );
  assert.notEqual(reopened.loadId, packet.loadId);
  const before = reopened.capture();
  assert.throws(
    () => reopened.change("Reject", (d) => d.paste(s.network, packet)),
    /SOURCE_CLIPBOARD_DENIED/,
  );
  assert.throws(
    () =>
      reopened.change("Spoof", (d) =>
        d.paste(s.network, packet, packet.loadId),
      ),
    /LOAD_MISMATCH/,
  );
  assert.deepEqual(reopened.capture(), before);
});
test("S03 structure emission is read-only, nominally declared once, field deletion preserves invalid edges and Undo", () => {
  const s = flow();
  let id = "",
    construct = "",
    access = "";
  s.graph.change("Structure", (d) => {
    id = d.createStructure("Pair", [
      { id: "stable-a", name: "a", type: "glsl.float" },
      { id: "stable-b", name: "b", type: "glsl.float" },
    ]);
    construct = d.addReferenceNode(s.network, "structure", id);
    access = d.addReferenceNode(s.network, "field", id, "stable-a");
    d.connect(
      s.network,
      { nodeId: construct, portKey: "value" },
      { nodeId: access, portKey: "value" },
    );
    d.connect(
      s.network,
      { nodeId: access, portKey: "field" },
      { nodeId: s.compose, portKey: "y" },
    );
  });
  const before = s.graph.capture(),
    compiled = compile(before, s.fixed, esProfile);
  assert.equal(
    compiled.status,
    "success",
    JSON.stringify(compiled.diagnostics),
  );
  assert.equal(
    compiled.artifacts[1].text.match(/struct GrapeStruct0/g)?.length,
    1,
  );
  assert.deepEqual(s.graph.capture(), before);
  s.graph.change("Remove field", (d) =>
    d.editStructure(id, {
      name: "Pair",
      fields: [{ id: "stable-b", name: "b", type: "glsl.float" }],
    }),
  );
  const invalid = s.graph.capture();
  assert(invalid.diagnostics.some((i) => i.code === "FIELD_MISSING"));
  assert(
    net(s, s.network).edges.some((e) => e.from.nodeId === access && e.invalid),
  );
  assert.equal(compile(invalid, s.fixed, esProfile).status, "failed");
  s.graph.undo();
  assert.deepEqual(s.graph.capture().document, before.document);
});
test("S03 accepted paste requires a valid destination and direct whole frames survive clipboard", () => {
  const s = flow();
  s.graph.change("Frame", (d) =>
    d.frameSelection(s.network, [s.float, s.multiply], "Pair"),
  );
  const packet = copySelection(s.graph.capture(), s.fixed, s.network, [
    s.float,
    s.multiply,
  ]);
  s.graph.change("Paste", (d) => d.paste(s.network, packet));
  assert.equal(
    frames(s.graph.capture().document, s.fixed, s.network).length,
    2,
  );
  const empty = setup(),
    before = empty.graph.capture();
  assert.throws(
    () =>
      empty.graph.change("Invalid destination", (d) =>
        d.paste(empty.network, { ...packet, graphId: "different" }),
      ),
    /IMPORT_ERRORS/,
  );
  assert.deepEqual(empty.graph.capture(), before);
});
test("S03 scoped parameters and proposals from identical persistent IDs expire across a new load", () => {
  const a = application();
  a.app.grant("s03", canvasCommands);
  const run = (commandId: string, args: any = {}) =>
    a.app.execute(
      { panelId: "s03", typeId: "s03" },
      { scope: a.context.capture().scope, object: null },
      { commandId, args },
    );
  run("grape.network.create");
  run("grape.network.enter", { id: a.context.capture().primary });
  const node = a.add("float"),
    field = a.app.parameter(
      a.context,
      node,
      "value",
      a.context.capture().scope,
    ),
    proposal = a.app.layoutProposal(a.context),
    text = JSON.stringify(a.app.snapshot.document);
  a.app.openText(text);
  assert.throws(() => field.capture());
  assert.throws(
    () =>
      a.app.execute(
        { panelId: "s03", typeId: "s03" },
        { scope: a.app.context().capture().scope, object: null },
        { commandId: "grape.network.layout", args: proposal },
      ),
    /STALE_PROPOSAL/,
  );
});

test("S03 library grouping resolves the forked canonical network", () => {
  const s = flow();
  let call = "";
  s.graph.change("Library", (d) => {
    call = d.createSubgraph(s.network, "Library", "requested");
  });
  const { r, data } = definition(s, call),
    f = data.network.nodes.find((n) => n.type.typeId === "float")!;
  s.graph.change("Group inside library", (d) =>
    d.encapsulate(data.network.id, [f.id]),
  );
  assert.notEqual(definition(s, call).r.id, r.id);
  assert(net(s, data.network.id).nodes.some((n) => n.type.typeId === "call"));
  assert(!net(s, data.network.id).nodes.some((n) => n.id === f.id));
});
test("S03 local child semantic edit forks its library ancestor", () => {
  const s = flow();
  let child = "",
    parent = "";
  s.graph.change("Definitions", (d) => {
    child = d.createSubgraph(s.network);
    parent = d.createSubgraph(s.network);
  });
  const c = definition(s, child),
    p = definition(s, parent);
  s.graph.change("Call", (d) =>
    d.addReferenceNode(p.data.network.id, "call", c.r.id),
  );
  const doc = structuredClone(s.graph.capture().document);
  (doc.graph.resources.find((r) => r.id === p.r.id)!.data as any).local = false;
  const g = new Graph(doc, s.fixed, s.identity);
  g.change("Interface", (d) =>
    d.interface(c.data.network.id, [
      {
        key: "x",
        name: "x",
        direction: "input",
        type: "glsl.float",
        supply: "local",
        defaultValue: 0,
      },
    ]),
  );
  assert(g.capture().document.graph.resources.some((r) => r.id === c.r.id));
  assert(!g.capture().document.graph.resources.some((r) => r.id === p.r.id));
});
test("S03 explicit override equal to default survives interface defaults and save/reload", () => {
  const s = flow();
  let call = "";
  s.graph.change("Definition", (d) => {
    call = d.createSubgraph(s.network);
  });
  const { data } = definition(s, call),
    port = {
      key: "x",
      name: "x",
      direction: "input" as const,
      type: "glsl.float",
      supply: "local" as const,
      defaultValue: 0,
    };
  s.graph.change("Port", (d) => d.interface(data.network.id, [port]));
  s.graph.change("Override", (d) => d.parameter(s.network, call, "x", 7));
  s.graph.change("Equal override", (d) => d.parameter(s.network, call, "x", 0));
  const g = new Graph(
      JSON.parse(JSON.stringify(s.graph.capture().document)),
      s.fixed,
      s.identity,
    ),
    before = g.capture();
  g.change("Default", (d) =>
    d.interface(data.network.id, [{ ...port, defaultValue: 2 }]),
  );
  assert.equal(
    g
      .capture()
      .document.graph.stages.find((x) => x.network.id === s.network)!
      .network.nodes.find((n) => n.id === call)!.inputValues.x,
    0,
  );
  g.undo();
  assert.deepEqual(g.capture().document, before.document);
});
test("S03 direct independence preserves nonowned state, declared references and typed frame resources", () => {
  const s = flow();
  let call = "";
  s.graph.change("Definition", (d) => {
    call = d.createSubgraph(s.network);
  });
  const { data } = definition(s, call);
  const doc = structuredClone(s.graph.capture().document),
    caller = doc.graph.stages
      .find((x) => x.network.id === s.network)!
      .network.nodes.find((n) => n.id === call)!;
  Object.assign(caller.state, { note: "keep" });
  caller.references.push({
    slot: "independent",
    kind: "node",
    networkId: s.network,
    targetId: s.float,
  });
  const boundary = asNetwork(doc.graph.resources[0], s.fixed)!.network.nodes[0];
  Object.assign(boundary.state, { note: "boundary" });
  const g = new Graph(doc, s.fixed, s.identity);
  g.change("Frame", (d) =>
    d.frameSelection(data.network.id, [data.network.nodes[0].id]),
  );
  g.change("Independent", (d) => d.makeIndependent(s.network, call));
  const actual = g
    .capture()
    .document.graph.stages.find((x) => x.network.id === s.network)!
    .network.nodes.find((n) => n.id === call)!;
  assert.equal((actual.state as any).note, "keep");
  assert(
    actual.references.some(
      (r) => r.slot === "independent" && r.targetId === s.float,
    ),
  );
  const cloned = asNetwork(
    g
      .capture()
      .document.graph.resources.find(
        (r) => r.id === (actual.state as any).definition,
      )!,
    s.fixed,
  )!;
  assert.equal((cloned.network.nodes[0].state as any).note, "boundary");
  assert.equal(
    frames(g.capture().document, s.fixed, cloned.network.id).length,
    1,
  );
});
test("S03 encapsulation rejects cross-scope node references despite matching local IDs", () => {
  const s = flow(),
    doc = structuredClone(s.graph.capture().document),
    pixel = doc.graph.stages.find((x) => x.network.id === s.network)!.network,
    vertex = doc.graph.stages[0].network;
  const shadow = structuredClone(pixel.nodes.find((n) => n.id === s.float)!);
  vertex.nodes.push(shadow);
  pixel.nodes
    .find((n) => n.id === s.multiply)!
    .references.push({
      slot: "other",
      kind: "node",
      networkId: vertex.id,
      targetId: s.float,
    });
  const g = new Graph(doc, s.fixed, s.identity),
    before = g.capture();
  assert.throws(
    () =>
      g.change("Group", (d) => d.encapsulate(s.network, [s.float, s.multiply])),
    /REFERENCE_ESCAPE/,
  );
  assert.deepEqual(g.capture(), before);
});

test("S03 New creates Value vec4 passthrough; shared rename retains instance names and no-op keeps library identity", () => {
  const s = flow();
  let call = "";
  s.graph.change("New", (d) => {
    call = d.createSubgraph(s.network, "  Example  ");
  });
  let { r, data } = definition(s, call);
  assert.equal(data.name, "Example");
  assert.deepEqual(
    data.interface.map((p) => [p.name, p.direction, p.type, p.defaultValue]),
    [
      ["Value", "input", "glsl.vec4", [1, 1, 1, 1]],
      ["Value", "output", "glsl.vec4", [0, 0, 0, 1]],
    ],
  );
  assert.equal(data.network.edges.length, 1);
  const name = net(s, s.network).nodes.find((n) => n.id === call)!.name;
  s.graph.change("Rename", (d) =>
    d.interface(data.network.id, data.interface, "Shared"),
  );
  assert.equal(definition(s, call).data.name, "Shared");
  assert.equal(net(s, s.network).nodes.find((n) => n.id === call)!.name, name);
  assert.throws(
    () =>
      s.graph.change("Bad name", (d) =>
        d.interface(data.network.id, data.interface, "\u0000"),
      ),
    /DEFINITION_NAME/,
  );
  let lib = "";
  s.graph.change("Library", (d) => {
    lib = d.createSubgraph(s.network, "Library", "requested");
  });
  const library = definition(s, lib),
    before = s.graph.capture();
  s.graph.change("Same", (d) =>
    d.interface(library.data.network.id, library.data.interface, "Library"),
  );
  assert.deepEqual(s.graph.capture(), before);
});
test("S03 explicit interface Add stops at16 per direction without erasing preserved oversized draft", () => {
  const s = flow();
  let call = "";
  s.graph.change("New", (d) => {
    call = d.createSubgraph(s.network);
  });
  const { data } = definition(s, call),
    ports = Array.from({ length: 16 }, (_, i) => ({
      key: "p" + i,
      name: "P" + i,
      type: "glsl.float",
      direction: "input" as const,
      supply: "local" as const,
      defaultValue: 0,
    }));
  s.graph.change("Sixteen", (d) => d.interface(data.network.id, ports));
  const before = s.graph.capture();
  assert.throws(
    () =>
      s.graph.change("Seventeen", (d) =>
        d.interface(data.network.id, [...ports, { ...ports[0], key: "p16" }]),
      ),
    /PORT_LIMIT/,
  );
  assert.deepEqual(s.graph.capture(), before);
  const doc = structuredClone(before.document);
  asNetwork(doc.graph.resources[0], s.fixed)!.interface.push({
    ...ports[0],
    key: "p16",
  });
  const g = new Graph(doc, s.fixed, s.identity);
  g.change("Rename preserved draft", (d) =>
    d.interface(
      data.network.id,
      asNetwork(g.capture().document.graph.resources[0], s.fixed)!.interface,
      "Oversized draft",
    ),
  );
  assert.equal(
    asNetwork(g.capture().document.graph.resources[0], s.fixed)!.interface
      .length,
    17,
  );
});
test("S03 structure authoring validates count, names, description, nested fixed arrays, recursion/depth and expansion", () => {
  const s = flow();
  const field = (type = "glsl.float") => [{ id: "v", name: "value", type }];
  let id = "";
  s.graph.change("Create", (d) => {
    id = d.createStructure("Unique", field(), "Description");
  });
  for (const [name, fields, description] of [
    ["Unique", field(), ""],
    ["x".repeat(81), field(), ""],
    ["Other", field(), "x".repeat(4001)],
    ["Other", [{ id: "v", name: "uniform", type: "glsl.float" }], ""],
  ] as any[]) {
    assert.throws(() =>
      s.graph.change("Reject", (d) =>
        d.createStructure(name, fields, description),
      ),
    );
  }
  const array = (type: string, n: any) => "array@" + JSON.stringify([type, n]);
  let source = "";
  s.graph.change("Extent", (d) => {
    source = d.createSource("Extent", "glsl.float", 2);
  });
  assert.throws(
    () =>
      s.graph.change("Nested symbolic field", (d) =>
        d.createStructure(
          "Bad",
          field(array(array("glsl.float", { sourceId: source }), 2)),
        ),
      ),
    /ARRAY_EXTENT/,
  );
  assert.throws(
    () =>
      s.graph.change("Large literal", (d) =>
        d.createStructure("Bad", field(array("glsl.float", 1025))),
      ),
    /STRUCTURE_ARRAY/,
  );
  assert.throws(
    () =>
      s.graph.change("Expansion", (d) =>
        d.createStructure("Bad", field(array(array("glsl.float", 1024), 65))),
      ),
    /STRUCTURE_EXPANSION/,
  );
  let nested = "glsl.float";
  for (let i = 0; i < 16; i++) {
    let next = "";
    s.graph.change("Depth", (d) => {
      next = d.createStructure("Depth" + i, field(nested));
    });
    nested = "struct@" + next;
  }
  assert.throws(
    () =>
      s.graph.change("Too deep", (d) =>
        d.createStructure("Deep", field(nested)),
      ),
    /STRUCTURE_DEPTH/,
  );
  for (
    let i = s.graph
      .capture()
      .document.graph.resources.filter(
        (r) => s.fixed.resource(r.type)?.model === "structure",
      ).length;
    i < 64;
    i++
  )
    s.graph.change("Fill", (d) => d.createStructure("Fill" + i, field()));
  assert.throws(
    () => s.graph.change("65", (d) => d.createStructure("Overflow", field())),
    /STRUCTURE_LIMIT/,
  );
  assert.equal(
    (
      s.graph.capture().document.graph.resources.find((r) => r.id === id)!
        .data as any
    ).description,
    "Description",
  );
});
test("S03 large external array declarations survive metadata edits; materialization remains bounded", () => {
  const s = flow();
  let id = "";
  s.graph.change("Structure", (d) => {
    id = d.createStructure("External", [
      { id: "v", name: "value", type: "glsl.float" },
    ]);
  });
  const doc = structuredClone(s.graph.capture().document),
    type = 'array@["glsl.float",2147483647]';
  (doc.graph.resources.find((r) => r.id === id)!.data as any).fields[0].type =
    type;
  const g = new Graph(doc, s.fixed, s.identity);
  const types = modelContext(g.capture().document, s.fixed).types;
  assert(types.resolve(type));
  assert.throws(() => types.defaultValue(type), /DEFAULT_EXPANSION/);
  g.change("Metadata only", (d) =>
    d.editStructure(id, {
      ...(g.capture().document.graph.resources.find((r) => r.id === id)!
        .data as any),
      name: "Renamed external",
      description: "kept",
    }),
  );
  assert.equal(
    (g.capture().document.graph.resources.find((r) => r.id === id)!.data as any)
      .fields[0].type,
    type,
  );
  assert.throws(
    () =>
      g.change("New oversized field", (d) =>
        d.editStructure(id, {
          name: "Renamed external",
          fields: [{ id: "new", name: "next", type }],
        }),
      ),
    /STRUCTURE_ARRAY/,
  );
});
test("S03 type tokens retain eight dimensions and reject extra tuple fields", () => {
  const types = modelContext(
    flow().graph.capture().document,
    flow().fixed,
  ).types;
  let type = "glsl.float";
  for (let i = 0; i < 8; i++) type = "array@" + JSON.stringify([type, 2]);
  assert(types.resolve(type));
  assert(!types.resolve("array@" + JSON.stringify([type, 2])));
  assert(!types.resolve('array@["glsl.float",2,"ignored"]'));
});

test("S03 disconnected output boundary follows shared output defaults", () => {
  const s = flow();
  let call = "";
  s.graph.change("New", (d) => {
    call = d.createSubgraph(s.network);
  });
  const { data } = definition(s, call);
  s.graph.change("Disconnect", (d) =>
    d.disconnect(data.network.id, data.network.edges[0].id),
  );
  s.graph.change("Default", (d) =>
    d.interface(
      data.network.id,
      data.interface.map((p) =>
        p.direction === "output" ? { ...p, defaultValue: [4, 3, 2, 1] } : p,
      ),
    ),
  );
  const output = net(s, data.network.id).nodes.find(
    (n) => n.type.typeId === "network-output",
  )!;
  assert.deepEqual(output.inputValues.value, [4, 3, 2, 1]);
});

// LC-DATA-062's 2048 bound is a native source path bound, not inline array extent.
test("S03 inline array construction and same-load reuse allow2049 elements; cross-Graph clipboard rejects composites", () => {
  const s = flow();
  let node = "";
  s.graph.change("Inline array", (d) => {
    const id = d.createSource(
      "Array",
      "array@" + JSON.stringify(["glsl.float", 2049]),
      Array(2049).fill(1),
      true,
    );
    node = d.addReferenceNode(s.network, "source", id);
  });
  const packet = copySelection(s.graph.capture(), s.fixed, s.network, [node]),
    other = flow(),
    doc = structuredClone(other.graph.capture().document);
  doc.graph.id = "other-array-graph";
  let seq = 0;
  const graph = new Graph(doc, other.fixed, {
    next: () => "array-paste-" + ++seq,
  });
  s.graph.change("Reuse", (d) => d.paste(s.network, packet));
  assert.equal(
    (s.graph.capture().document.graph.resources[0].data as any).value.length,
    2049,
  );
  assert.equal(s.graph.capture().document.graph.resources.length, 1);
  const before = graph.capture();
  assert.throws(
    () => graph.change("Paste", (d) => d.paste(other.network, packet)),
    /SOURCE_CLIPBOARD_DENIED/,
  );
  assert.deepEqual(graph.capture(), before);
});
test("S03 nested input link ABA invalidates old edit tokens without changing History on rejection", () => {
  const a = application();
  a.app.grant("s03", canvasCommands);
  const run = (commandId: string, args: any = {}) =>
    a.app.execute(
      { panelId: "s03", typeId: "s03" },
      { scope: a.context.capture().scope, object: null },
      { commandId, args },
    );
  run("grape.network.create");
  run("grape.network.enter", { id: a.context.capture().primary });
  const f = a.add("float"),
    m = a.add("multiply"),
    field = a.app.parameter(a.context, m, "b", a.context.capture().scope),
    token = field.capture().editToken;
  run("grape.edge.connect", {
    from: { nodeId: f, portKey: "value" },
    to: { nodeId: m, portKey: "b" },
  });
  assert.equal(field.capture().writable, false);
  const linked = a.app.snapshot;
  assert.throws(() => field.commit(9, token), /STALE_EDIT|FIELD_READONLY/);
  assert.deepEqual(a.app.snapshot, linked);
  const edge = a.context.network().edges.find((e) => e.to.nodeId === m)!;
  run("grape.edge.disconnect", { id: edge.id });
  assert.equal(field.capture().writable, true);
  const disconnected = a.app.snapshot;
  assert.throws(() => field.commit(9, token), /STALE_EDIT/);
  assert.deepEqual(a.app.snapshot, disconnected);
  field.dispose();
});
test("S03 shared same-key type changes reject stale caller tokens and removed handles never revive", () => {
  const a = application();
  a.app.grant("s03", canvasCommands);
  const origin = { panelId: "s03", typeId: "s03" },
    run = (context: EditorContext, commandId: string, args: any = {}) =>
      a.app.execute(
        origin,
        { scope: context.capture().scope, object: null },
        { commandId, args },
      );
  run(a.context, "grape.network.create");
  const call = a.context.capture().primary!,
    field = a.app.parameter(
      a.context,
      call,
      "value",
      a.context.capture().scope,
    ),
    token = field.capture().editToken,
    other = a.app.context();
  other.enter(call);
  let ports = structuredClone(other.capture().definition!.data.interface);
  ports[0] = {
    ...ports[0],
    type: "glsl.mat2",
    defaultValue: [
      [1, 2],
      [3, 4],
    ],
  };
  run(other, "grape.network.interface", {
    ports,
    revision: a.app.snapshot.revision,
  });
  assert.equal(field.capture().projection.port!.type, "glsl.mat2");
  assert.throws(() => field.commit([1, 2, 3, 4], token), /STALE_EDIT/);
  run(other, "grape.network.interface", {
    ports: ports.filter((p) => p.direction !== "input"),
    revision: a.app.snapshot.revision,
  });
  assert.throws(() => field.capture());
  run(other, "grape.network.interface", {
    ports,
    revision: a.app.snapshot.revision,
  });
  assert.throws(() => field.capture(), /TARGET_EXPIRED/);
});
test("S03 cross-Graph nominal closure remaps nested structures and Undo removes the full insertion", () => {
  const s = flow();
  let node = "",
    inner = "",
    outer = "";
  s.graph.change("Structures", (d) => {
    inner = d.createStructure("Inner", [
      { id: "x", name: "x", type: "glsl.float" },
    ]);
    outer = d.createStructure("Outer", [
      { id: "inside", name: "inside", type: "struct@" + inner },
    ]);
    node = d.addReferenceNode(s.network, "structure", outer);
  });
  const packet = copySelection(s.graph.capture(), s.fixed, s.network, [node]),
    other = flow(),
    doc = structuredClone(other.graph.capture().document);
  doc.graph.id = "nominal-target";
  let seq = 0;
  const graph = new Graph(doc, other.fixed, { next: () => "nominal-" + ++seq }),
    before = graph.capture().document;
  graph.change("Paste", (d) => d.paste(other.network, packet));
  const resources = graph.capture().document.graph.resources,
    one = resources.find((r) => (r.data as any).name === "Inner")!,
    two = resources.find((r) => (r.data as any).name === "Outer")!;
  assert.notEqual(one.id, inner);
  assert.notEqual(two.id, outer);
  assert.equal((two.data as any).fields[0].type, "struct@" + one.id);
  const pasted = networks(graph.capture().document, other.fixed)
    .find((n) => n.network.id === other.network)!
    .network.nodes.find((n) => n.type.typeId === "structure")!;
  assert.equal((pasted.state as any).structure, two.id);
  assert(pasted.ports.some((p) => p.type === "struct@" + two.id));
  graph.undo();
  assert.deepEqual(graph.capture().document, before);
});
test("S03 reusable definition cycles reject atomically including unused dependencies", () => {
  const s = flow();
  let p = "",
    c = "";
  s.graph.change("Definitions", (d) => {
    p = d.createSubgraph(s.network, "Parent");
    c = d.createSubgraph(s.network, "Child");
  });
  const parent = definition(s, p),
    child = definition(s, c);
  s.graph.change("Child call", (d) =>
    d.addReferenceNode(parent.data.network.id, "call", child.r.id),
  );
  const before = s.graph.capture(),
    history = s.graph.historyLength;
  let notifications = 0;
  s.graph.subscribe(() => notifications++);
  assert.throws(() =>
    s.graph.change("Cycle", (d) =>
      d.addReferenceNode(child.data.network.id, "call", parent.r.id),
    ),
  );
  assert.throws(() =>
    s.graph.change("Self cycle", (d) =>
      d.addReferenceNode(child.data.network.id, "call", child.r.id),
    ),
  );
  assert.deepEqual(s.graph.capture(), before);
  assert.equal(s.graph.historyLength, history);
  assert.equal(notifications, 0);
});
