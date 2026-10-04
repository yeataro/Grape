import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { functionSetup } from "../fixtures/s05.ts";
import { MemoryStorage } from "../fixtures/setup.ts";
import { EditorApplication } from "../../src/application/editor.ts";
import { currentImageKind } from "../../src/modules/image-current.ts";
import { functionProfile } from "../../src/modules/function-operations.ts";
import { nodeRef } from "../../src/modules/nodes.ts";
import { Graph } from "../../src/model/graph.ts";

const raw = fs.readFileSync(
  new URL(
    "../../evidence/s05/repair-02/samples/legacy-owner.grape.json",
    import.meta.url,
  ),
  "utf8",
);
function setup() {
  const s = functionSetup(),
    app = new EditorApplication(
      s.definitions,
      s.identity,
      currentImageKind.ref,
      functionProfile,
      new MemoryStorage(),
      { download: async () => {} },
    );
  app.newDocument();
  app.grant("test", ["grape.node.add", "grape.undo", "grape.redo"]);
  return { ...s, app };
}
function snapshot(
  app: EditorApplication,
  contexts: ReturnType<EditorApplication["context"]>[],
) {
  return {
    graph: app.snapshot,
    undo: app.canUndo,
    redo: app.canRedo,
    dirty: app.dirty,
    contexts: contexts.map((c) => c.capture()),
  };
}
test("S05 replacement eligibility keeps source validity separate and exact mismatch refusal atomic", () => {
  for (const destination of ["default", "upgraded"] as const) {
    const { app } = setup();
    if (destination === "upgraded") {
      app.openText(raw);
      app.upgradeOwners();
    }
    const contexts = [app.context(), app.context()],
      review = app.inspectText(raw),
      before = snapshot(app, contexts);
    let notifications = 0;
    app.subscribe(() => notifications++);
    assert.equal(review.status, "valid");
    assert.ok(review.candidate);
    assert.deepEqual(app.replacementEligibility(review), {
      available: false,
      code: "IMPORT_DEFINITIONS",
    });
    assert.throws(() => app.acceptReview(review), /IMPORT_DEFINITIONS/);
    assert.deepEqual(snapshot(app, contexts), before);
    assert.equal(notifications, 0);
    assert.equal(review.raw, raw);
    app.openReviewed(review);
    assert.notEqual(app.snapshot.loadId, before.graph.loadId);
    assert.deepEqual(app.snapshot.document, JSON.parse(raw));
  }
});
test("S05 matching replacement preserves Graph load and Context identity with one full-content Undo Redo", () => {
  const { app } = setup();
  app.openText(raw);
  const contexts = [app.context(), app.context()],
    before = snapshot(app, contexts),
    doc = JSON.parse(raw);
  doc.graph.id = "different-source-id";
  doc.graph.name = "Replacement content";
  doc.graph.resources[0].data.description = "Preserved replacement resource";
  const review = app.inspectText(JSON.stringify(doc));
  const publications: ReturnType<typeof snapshot>[] = [];
  app.subscribe(() => publications.push(snapshot(app, contexts)));
  assert.deepEqual(app.replacementEligibility(review), { available: true });
  assert.equal(publications.length, 0);
  app.acceptReview(review);
  const after = app.snapshot;
  assert.equal(after.loadId, before.graph.loadId);
  assert.equal(after.document.graph.id, before.graph.document.graph.id);
  const expected = structuredClone(doc);
  expected.graph.id = before.graph.document.graph.id;
  assert.deepEqual(after.document, expected);
  assert.equal(after.revision, before.graph.revision + 1);
  // Application also reports operation end; every observation sees the same atomic content.
  assert.ok(publications.length > 0);
  for (const publication of publications)
    assert.deepEqual(publication.graph, after);
  for (const c of contexts) assert.equal(app.context(c.id), c);
  assert.deepEqual(app.replacementEligibility(review), {
    available: false,
    code: "REVIEW_CLOSED",
  });
  const execute = (commandId: string) =>
    app.execute(
      { panelId: "test", typeId: "test" },
      { scope: contexts[0].capture().scope, object: null },
      { commandId, args: {} },
    );
  execute("grape.undo");
  assert.deepEqual(app.snapshot.document, before.graph.document);
  assert.equal(app.canUndo, false);
  execute("grape.redo");
  assert.deepEqual(app.snapshot.document, after.document);
  assert.equal(app.canRedo, false);
  assert.equal(app.snapshot.loadId, before.graph.loadId);
});
test("S05 replacement eligibility and command retain stale cancelled invalid readonly and fabricated guards", () => {
  for (const mode of [
    "stale",
    "load",
    "cancelled",
    "invalid",
    "readonly",
    "fabricated",
  ] as const) {
    const { app } = setup();
    app.openText(raw);
    const context = app.context();
    let review = app.inspectText(mode === "invalid" ? "{bad" : raw);
    if (mode === "stale")
      app.execute(
        { panelId: "test", typeId: "test" },
        { scope: context.capture().scope, object: null },
        {
          commandId: "grape.node.add",
          args: { ref: nodeRef("float"), position: [1, 2] },
        },
      );
    if (mode === "load") app.openText(raw);
    if (mode === "cancelled") app.cancelReview(review);
    if (mode === "readonly") app.setReadonly(true);
    if (mode === "fabricated") review = structuredClone(review);
    const before = app.snapshot,
      history = [app.canUndo, app.canRedo, app.dirty];
    const code =
      mode === "invalid"
        ? "IMPORT_ERRORS"
        : mode === "readonly"
          ? "IMPORT_READONLY"
          : ["cancelled", "fabricated"].includes(mode)
            ? "REVIEW_CLOSED"
            : "IMPORT_STALE";
    assert.deepEqual(app.replacementEligibility(review), {
      available: false,
      code,
    });
    assert.throws(() => app.acceptReview(review), new RegExp(code));
    assert.deepEqual(app.snapshot, before);
    assert.deepEqual([app.canUndo, app.canRedo, app.dirty], history);
  }
});
test("S05 model preflight and publication share exact kind and ordered-pin refusal without History", () => {
  for (const mismatch of ["kind", "pins"] as const) {
    const s = functionSetup(),
      doc = JSON.parse(raw),
      graph = new Graph(doc, s.definitions.pin(doc.graph.modules), s.identity),
      candidate = structuredClone(doc),
      before = graph.capture();
    if (mismatch === "kind")
      candidate.graph.kind.kindId = "different-output-profile";
    else candidate.graph.modules.reverse();
    assert.throws(
      () => graph.checkReplacement(candidate),
      /IMPORT_DEFINITIONS/,
    );
    assert.throws(
      () => graph.change("Replace", (d) => d.replaceDocument(candidate)),
      /IMPORT_DEFINITIONS/,
    );
    assert.deepEqual(graph.capture(), before);
    assert.equal(graph.historyLength, 0);
  }
});
