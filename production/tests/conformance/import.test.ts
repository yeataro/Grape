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
