import { test } from "node:test";
import assert from "node:assert/strict";
import { application, flow } from "../fixtures/setup.ts";

test("S02 conformance: replacement uses one public Graph batch, isolates observers and retains two Context identities", () => {
  const s = application(),
    second = s.app.context();
  const review = s.app.inspectText(
    JSON.stringify(flow().graph.capture().document),
  );
  const ids = [s.context.id, second.id],
    loadId = s.app.snapshot.loadId;
  let reentryDenied = false,
    publications = 0;
  const unsubscribe = s.app.subscribe(() => {
    publications++;
    assert.equal(s.context.network().nodes.length, 4);
    assert.equal(second.network().nodes.length, 4);
    try {
      s.app.acceptReview(review);
    } catch {
      reentryDenied = true;
    }
    throw Error("observer must not roll back accepted content");
  });
  s.app.acceptReview(review);
  unsubscribe();
  assert(reentryDenied);
  assert(publications > 0);
  assert.equal(s.app.snapshot.revision, 1);
  assert.equal(s.app.snapshot.loadId, loadId);
  assert.deepEqual([s.context.id, second.id], ids);
  assert.throws(() => s.app.acceptReview(review), /REVIEW_CLOSED/);
});

test("S02 conformance: direct replacement rejects model Error without modifying document/history", () => {
  const s = flow(),
    before = s.graph.capture(),
    history = s.graph.historyLength;
  const candidate = structuredClone(before.document);
  candidate.graph.stages[1].network.edges[0].from.nodeId = "unknown-id";
  assert.throws(
    () => s.graph.change("Replace", (d) => d.replaceDocument(candidate)),
    /IMPORT_ERRORS/,
  );
  assert.deepEqual(s.graph.capture(), before);
  assert.equal(s.graph.historyLength, history);
});

for (const [label, mutate, code] of [
  [
    "malformed position component",
    (d: any) => {
      d.graph.stages[1].network.nodes[1].position = ["bad", 0];
    },
    "NUMBER",
  ],
  [
    "malformed position length",
    (d: any) => {
      d.graph.stages[1].network.nodes[1].position = [0];
    },
    "POSITION",
  ],
  [
    "duplicate recovery IDs",
    (d: any) => {
      const recovery = {
        schema: "grape.recovery",
        version: 1,
        id: "duplicate",
        reason: "retained",
        payload: {
          kind: "node",
          networkId: d.graph.stages[1].network.id,
          node: structuredClone(d.graph.stages[1].network.nodes[1]),
        },
        extensions: {},
      };
      d.graph.recovery = [recovery, structuredClone(recovery)];
    },
    "DUPLICATE_IDENTITY",
  ],
  [
    "unknown envelope field",
    (d: any) => {
      d.future = { preserve: "未知🍇" };
    },
    "UNKNOWN_STRUCTURE",
  ],
  [
    "unknown node field",
    (d: any) => {
      d.graph.stages[1].network.nodes[1].future = true;
    },
    "UNKNOWN_STRUCTURE",
  ],
  [
    "unknown endpoint field",
    (d: any) => {
      d.graph.stages[1].network.edges[0].from.future = true;
    },
    "UNKNOWN_STRUCTURE",
  ],
] as const) {
  test(`M2: direct replacement atomically rejects ${label} before publication`, () => {
    const { graph } = flow(),
      before = graph.capture(),
      history = graph.historyLength;
    const undo = graph.canUndo,
      redo = graph.canRedo;
    const candidate = structuredClone(before.document);
    mutate(candidate);
    const original = structuredClone(candidate);
    let publications = 0;
    const unsubscribe = graph.subscribe(() => publications++);
    assert.throws(
      () =>
        graph.change("Malformed replacement", (d) =>
          d.replaceDocument(candidate),
        ),
      { code },
    );
    unsubscribe();
    assert.deepEqual(candidate, original);
    assert.deepEqual(graph.capture(), before);
    assert.equal(graph.capture().revision, before.revision);
    assert.equal(graph.historyLength, history);
    assert.equal(graph.canUndo, undo);
    assert.equal(graph.canRedo, redo);
    assert.equal(publications, 0);
  });
}

test("M2: catching invalid replacement cannot publish earlier edits in the same batch", () => {
  const { graph, network, float } = flow(),
    before = graph.capture(),
    history = graph.historyLength;
  const candidate = structuredClone(before.document);
  (candidate as any).future = true;
  assert.throws(
    () =>
      graph.change("Poisoned replacement", (d) => {
        d.rename(network, float, "must not publish");
        try {
          d.replaceDocument(candidate);
        } catch {
          /* caller cannot rescue a partial batch */
        }
      }),
    { code: "POISONED_BATCH" },
  );
  assert.deepEqual(graph.capture(), before);
  assert.equal(graph.historyLength, history);
});

test("M2: valid detached replacement publishes once and retains exact Undo/Redo content", () => {
  const { graph } = flow(),
    before = graph.capture(),
    history = graph.historyLength;
  const candidate = structuredClone(before.document);
  candidate.graph.name = "Validated detached replacement";
  candidate.graph.id = "foreign-graph-id";
  const original = structuredClone(candidate);
  let publications = 0;
  const unsubscribe = graph.subscribe(() => publications++);
  graph.change("Replace", (d) => d.replaceDocument(candidate));
  unsubscribe();
  const accepted = graph.capture();
  assert.deepEqual(accepted.document, {
    ...candidate,
    graph: { ...candidate.graph, id: before.document.graph.id },
  });
  assert.equal(accepted.revision, before.revision + 1);
  assert.equal(accepted.loadId, before.loadId);
  assert.equal(graph.historyLength, history + 1);
  assert.equal(publications, 1);
  assert.deepEqual(candidate, original);
  graph.undo();
  assert.deepEqual(graph.capture().document, before.document);
  graph.redo();
  assert.deepEqual(graph.capture().document, accepted.document);
});
