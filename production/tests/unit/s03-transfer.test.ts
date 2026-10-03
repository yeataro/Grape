import { test } from "node:test";
import assert from "node:assert/strict";
import { customTransferFixture } from "../fixtures/custom-transfer.ts";
import { flow } from "../fixtures/setup.ts";
import { copySelection } from "../../src/model/transfer.ts";
import { Graph } from "../../src/model/graph.ts";
import { networks, asNetwork } from "../../src/sdk/networks.ts";

for (const cross of [false, true])
  test(`S03 custom declared/state closure ${cross ? "cross" : "same"}-Graph remaps identities only and Undo/Redo`, () => {
    const s = customTransferFixture(),
      packet = copySelection(
        s.graph.capture(),
        s.fixed,
        s.network,
        s.selection,
      );
    assert.deepEqual(
      new Set(packet.resources.map((r) => r.id)),
      new Set([s.a, s.b, s.source, s.structure]),
    );
    const doc = structuredClone(s.targetDocument);
    doc.graph.id = "target";
    let i = 0;
    const graph = cross
        ? new Graph(doc, s.fixed, { next: () => `target-${++i}` })
        : s.graph,
      before = graph.capture().document;
    let ids: string[] = [];
    graph.change("Paste", (d) => {
      ids = d.paste(s.network, packet);
    });
    const after = graph.capture().document,
      n = networks(after, s.fixed)
        .flatMap((x) => x.network.nodes)
        .find((n) => ids.includes(n.id) && n.type.typeId === "owner")!;
    const a = after.graph.resources.find(
      (r) =>
        r.id ===
        (n.state as any).links.find((r: any) => r.slot === "state-root")
          .targetId,
    )!;
    const b = after.graph.resources.find(
      (r) =>
        r.id === n.references.find((r) => r.slot === "declared-root")!.targetId,
    )!;
    assert.notEqual(a.id, s.a);
    assert.notEqual(b.id, s.b);
    assert.equal(
      (a.data as any).links.find((r: any) => r.slot === "child").targetId,
      b.id,
    );
    assert.equal(
      b.references[0].targetId,
      ids.find((id) => id !== n.id),
    );
    assert.equal(b.references[0].networkId, s.network);
    assert.equal((n.state as any).literal, s.float + " " + s.a);
    assert.equal(n.extensions["test.literal"], s.b);
    assert.equal((a.data as any).literal, s.b);
    assert.equal(after.graph.resources.length, cross ? 6 : 6);
    const source = (a.data as any).links.find(
      (r: any) => r.slot === "source",
    ).targetId;
    assert.equal(source === s.source, !cross);
    graph.undo();
    assert.deepEqual(graph.capture().document, before);
    graph.redo();
    assert.deepEqual(graph.capture().document, after);
  });

test("S03 grouping an existing caller preserves child-owned frame node addresses", () => {
  const s = flow();
  let call = "";
  s.graph.change("Child", (d) => {
    call = d.encapsulate(s.network, [s.multiply]);
  });
  const resource = s.graph.capture().document.graph.resources[0],
    child = asNetwork(resource, s.fixed)!.network;
  s.graph.change("Frame", (d) => d.frameSelection(child.id, [s.multiply]));
  const frame = s.graph
    .capture()
    .document.graph.resources.find((r) => r.type.typeId === "frame")!;
  s.graph.change("Parent", (d) => d.encapsulate(s.network, [call]));
  assert.deepEqual(
    s.graph.capture().document.graph.resources.find((r) => r.id === frame.id),
    frame,
  );
});

test("S03 owner collect/remap throws and escaping/incomplete references reject atomically with Redo preserved", () => {
  const s = customTransferFixture(),
    packet = copySelection(s.graph.capture(), s.fixed, s.network, s.selection);
  s.graph.change("Move", (d) => d.move(s.network, s.float, [7, 7]));
  s.graph.undo();
  for (const change of [
    (p: any) =>
      (p.resources.find((r: any) => r.id === s.a).data.failCollect = true),
    (p: any) =>
      (p.resources.find((r: any) => r.id === s.a).data.failRemap = true),
    (p: any) =>
      (p.network.nodes.find((n: any) => n.id === s.custom).state.failRemap =
        true),
    (p: any) =>
      p.resources.splice(
        p.resources.findIndex((r: any) => r.id === s.b),
        1,
      ),
    (p: any) =>
      (p.resources.find((r: any) => r.id === s.b).referencesComplete = false),
    (p: any) =>
      (p.resources.find((r: any) => r.id === s.b).references[0].networkId =
        "wrong-network"),
    (p: any) =>
      (p.resources.find((r: any) => r.id === s.b).references[0].targetId =
        s.multiply),
  ]) {
    const p = structuredClone(packet);
    change(p);
    const before = s.graph.capture(),
      history = s.graph.historyLength;
    let events = 0;
    const off = s.graph.subscribe(() => events++);
    assert.throws(() => s.graph.change("Reject", (d) => d.paste(s.network, p)));
    assert.deepEqual(s.graph.capture(), before);
    assert.equal(s.graph.historyLength, history);
    assert(s.graph.canRedo);
    assert.equal(events, 0);
    off();
  }
});

test("S03 custom resources follow encapsulation and direct independence, ordinary dependencies remain shared", () => {
  const s = customTransferFixture(),
    before = s.graph.capture().document;
  let call = "";
  s.graph.change("Group", (d) => {
    call = d.encapsulate(s.network, s.selection);
  });
  const grouped = s.graph.capture().document,
    caller = grouped.graph.stages
      .find((x) => x.network.id === s.network)!
      .network.nodes.find((n) => n.id === call)!;
  const resource = grouped.graph.resources.find(
      (r) => r.id === (caller.state as any).definition,
    )!,
    inner = asNetwork(resource, s.fixed)!.network;
  assert.equal(
    grouped.graph.resources.find((r) => r.id === s.b)!.references[0].networkId,
    inner.id,
  );
  s.graph.change("Independent", (d) => d.makeIndependent(s.network, call));
  const doc = s.graph.capture().document,
    latest = doc.graph.stages
      .find((x) => x.network.id === s.network)!
      .network.nodes.find((n) => n.id === call)!;
  const copied = asNetwork(
      doc.graph.resources.find(
        (r) => r.id === (latest.state as any).definition,
      )!,
      s.fixed,
    )!.network,
    n = copied.nodes.find((n) => n.type.typeId === "owner")!;
  const b = doc.graph.resources.find(
    (r) =>
      r.id === n.references.find((r) => r.slot === "declared-root")!.targetId,
  )!;
  assert.notEqual(b.id, s.b);
  assert.equal(b.references[0].networkId, copied.id);
  assert(copied.nodes.some((n) => n.id === b.references[0].targetId));
  assert.equal(
    doc.graph.resources.filter((r) => r.type.typeId === "source-definition")
      .length,
    1,
  );
  s.graph.undo();
  assert.deepEqual(s.graph.capture().document, grouped);
  s.graph.undo();
  assert.deepEqual(s.graph.capture().document, before);
});
