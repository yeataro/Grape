import { test } from "node:test";
import assert from "node:assert/strict";
import { flow } from "../fixtures/setup.ts";
import { Graph } from "../../src/model/graph.ts";
import { copySelection } from "../../src/model/transfer.ts";
import { readDocument, writeDocument } from "../../src/persistence/codec.ts";
const array = (type: string) => "array@" + JSON.stringify([type, 2]);
function source(type: string, value: any, binding?: any) {
  const s = flow();
  let id = "",
    node = "";
  s.graph.change("Inline source", (d) => {
    id = d.createSource("Inline", type, value, true, binding);
    node = d.addReferenceNode(s.network, "source", id);
  });
  return {
    ...s,
    id,
    node,
    packet: copySelection(s.graph.capture(), s.fixed, s.network, [node]),
  };
}
function rejection(graph: Graph, s: ReturnType<typeof source>) {
  graph.change("Redo seed", (d) => d.move(s.network, s.float, [72, 81]));
  graph.undo();
  const before = graph.capture(),
    history = graph.historyLength,
    packet = structuredClone(s.packet);
  let publications = 0;
  const off = graph.subscribe(() => publications++);
  assert.equal(graph.canRedo, true);
  assert.throws(
    () => graph.change("Paste", (d) => d.paste(s.network, s.packet)),
    /SOURCE_CLIPBOARD_DENIED/,
  );
  assert.deepEqual(graph.capture(), before);
  assert.equal(graph.historyLength, history);
  assert.equal(graph.canRedo, true);
  assert.equal(publications, 0);
  assert.deepEqual(s.packet, packet);
  off();
}
for (const [type, value] of [
  [array("glsl.float"), [1, 2]],
  [
    array("glsl.vec2"),
    [
      [1, 2],
      [3, 4],
    ],
  ],
] as const)
  for (const kind of ["implicit constant", "constant", "uniform"] as const)
    test(`S03 EG01 round2 ${kind} ${type} preserves same-load reuse and rejects real cross-Graph and fresh-load publication`, () => {
      const s = source(
        type,
        value,
        kind === "implicit constant" ? undefined : { kind },
      );
      assert.deepEqual(s.graph.capture().diagnostics, []);
      const loaded = readDocument(
        writeDocument(s.graph.capture().document),
        s.fixed.module,
      );
      assert.equal(loaded.status, "editable");
      const edited = structuredClone(s.graph.capture().document),
        resource = edited.graph.resources.find((r) => r.id === s.id)!;
      (resource.data as any).value = type.includes("vec2")
        ? [
            [9, 8],
            [7, 6],
          ]
        : [9, 8];
      s.graph.change("Current value", (d) => d.replaceDocument(edited));
      const expected = structuredClone(resource.data);
      const history = s.graph.historyLength;
      let events = 0;
      const off = s.graph.subscribe(() => events++);
      s.graph.change("Reuse same load", (d) => d.paste(s.network, s.packet));
      off();
      assert.equal(events, 1);
      assert.equal(s.graph.historyLength, history + 1);
      assert.equal(s.graph.capture().document.graph.resources.length, 1);
      assert.deepEqual(
        s.graph.capture().document.graph.resources[0].data,
        expected,
      );
      const sourceBefore = s.graph.capture(),
        doc = structuredClone(flow().graph.capture().document);
      doc.graph.id = "actual-distinct-destination";
      let i = 0;
      const target = new Graph(doc, s.fixed, { next: () => `target-${++i}` });
      assert.notEqual(target.capture().document.graph.id, s.packet.graphId);
      assert.notEqual(target.loadId, s.packet.loadId);
      rejection(target, s);
      const reopened = new Graph(s.graph.capture().document, s.fixed, {
        next: () => `reopened-${++i}`,
      });
      assert.equal(reopened.capture().document.graph.id, s.packet.graphId);
      assert.notEqual(reopened.loadId, s.packet.loadId);
      rejection(reopened, s);
      assert.deepEqual(s.graph.capture(), sourceBefore);
    });
test("S03 EG01 round2 scalar/vector/matrix constants and uniforms still cross actual Graph and fresh load", () => {
  for (const [type, value] of [
    ["glsl.float", 1],
    ["glsl.vec2", [1, 2]],
    [
      "glsl.mat2",
      [
        [1, 0],
        [0, 1],
      ],
    ],
  ] as const)
    for (const kind of ["constant", "uniform"] as const) {
      const s = source(type, value, { kind }),
        doc = structuredClone(flow().graph.capture().document);
      doc.graph.id = "numeric-destination";
      let seq = 0;
      for (const graph of [
        new Graph(doc, s.fixed, { next: () => `numeric-${++seq}` }),
        new Graph(s.graph.capture().document, s.fixed, {
          next: () => `reopen-${++seq}`,
        }),
      ]) {
        const before = graph.capture(),
          count = before.document.graph.resources.length,
          history = graph.historyLength;
        let events = 0;
        graph.subscribe(() => events++);
        graph.change("Transfer", (d) => d.paste(s.network, s.packet));
        const after = graph.capture();
        assert.deepEqual(after.diagnostics, []);
        assert.equal(after.document.graph.resources.length, count + 1);
        const added = after.document.graph.resources.find(
          (r) =>
            !before.document.graph.resources.some((old) => old.id === r.id),
        )!;
        assert.notEqual(added.id, s.id);
        assert.deepEqual((added.data as any).value, value);
        assert.equal(graph.historyLength, history + 1);
        assert.equal(events, 1);
        graph.undo();
        assert.deepEqual(graph.capture().document, before.document);
        graph.redo();
        assert.deepEqual(graph.capture().document, after.document);
      }
    }
});
