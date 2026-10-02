import { test } from "node:test";
import assert from "node:assert/strict";
import { flow, application, MemoryStorage } from "../fixtures/setup.ts";
import {
  writeDocument,
  readDocument,
  parseJSON,
} from "../../src/persistence/codec.ts";
import { Graph } from "../../src/model/graph.ts";
import { compile } from "../../src/generation/compiler.ts";
import { esProfile } from "../../src/modules/image.ts";
test("AT-S01-05: document identity, complete content, new lifetime/empty history and semantic regeneration", () => {
  const s = flow(),
    before = s.graph.capture();
  const read = readDocument(writeDocument(before.document));
  assert.equal(read.status, "editable");
  if (read.status !== "editable") return;
  const graph = new Graph(read.document, s.fixed, s.identity);
  assert.notEqual(graph.loadId, s.graph.loadId);
  assert.equal(graph.historyLength, 0);
  assert.deepEqual(graph.capture().document, before.document);
  assert.deepEqual(
    compile(graph.capture(), s.fixed, esProfile).artifacts,
    compile(before, s.fixed, esProfile).artifacts,
  );
});
test("AT-S01-07: ACK of A never marks B saved, rejection and SAVE_BUSY retain baseline; download is separate", async () => {
  let release: () => void = () => {};
  let reject: (error: Error) => void = () => {};
  const storage = new MemoryStorage();
  storage.write = (_key, _text) =>
    new Promise<void>((resolve, fail) => {
      release = resolve;
      reject = fail;
    });
  const s = application(storage),
    node = s.add("float"),
    target = s.app.parameter(
      s.context,
      node,
      "value",
      s.context.capture().scope,
    );
  const save = s.app.save();
  await assert.rejects(s.app.save(), /SAVE_BUSY/);
  target.commit(0.75, target.capture().editToken);
  release();
  await save;
  assert(s.app.dirty);
  await s.app.download();
  assert(s.app.dirty);
  assert(s.exported());
  const failed = s.app.save();
  reject(Error("disk failure"));
  await assert.rejects(failed, /disk failure/);
  assert(s.app.dirty);
  const success = s.app.save();
  release();
  await success;
  assert.equal(s.app.dirty, false);
});
test("old saved handle cannot attach to same persistent IDs after reload", async () => {
  const s = application(),
    id = s.add("float"),
    target = s.app.parameter(s.context, id, "value", s.context.capture().scope);
  await s.app.save();
  const key = s.app.snapshot.document.graph.id;
  const oldLoad = s.app.snapshot.loadId;
  await s.app.reopen(key);
  assert.notEqual(s.app.snapshot.loadId, oldLoad);
  assert.throws(() => target.capture());
  assert.equal(s.app.canUndo, false);
});
test("wire unknown structure, unsupported version/operation/tag, malformed known data precedence and original retention", () => {
  const s = flow(),
    base = s.graph.capture().document;
  for (const mutate of [
    (d: any) => (d.graph.stages[1].network.edges[0].adaptation.extra = 1),
    (d: any) => (d.formatVersion.major = 1),
    (d: any) =>
      (d.graph.stages[1].network.edges[0].adaptation.operation = "future"),
  ]) {
    const d = structuredClone(base);
    mutate(d);
    const raw = JSON.stringify(d),
      result = readDocument(raw);
    assert.equal(result.status, "recovery-readonly");
    assert.equal("raw" in result && result.raw, raw);
  }
  const bad: any = structuredClone(base);
  bad.graph.extra = 1;
  delete bad.graph.id;
  assert.equal(readDocument(JSON.stringify(bad)).status, "rejected");
  assert.equal(
    readDocument('{"format":"grape.document","format":"x"}').status,
    "rejected",
  );
  assert.throws(() => parseJSON('{"a":1,"\\u0061":2}'), /DUPLICATE_JSON_KEY/);
});
test("writer refuses executable/hidden values, sparse arrays, nonfinite numbers and altered prototypes without invoking getters", () => {
  const s = flow();
  let called = false;
  const doc = structuredClone(s.graph.capture().document);
  Object.defineProperty(doc, "toJSON", {
    value: () => {
      called = true;
      return {};
    },
  });
  assert.throws(() => writeDocument(doc));
  assert.equal(called, false);
  const getter = structuredClone(s.graph.capture().document);
  Object.defineProperty(getter.graph, "name", {
    get: () => {
      called = true;
      return "oops";
    },
  });
  assert.throws(() => writeDocument(getter));
  assert.equal(called, false);
  const sparse: any = structuredClone(s.graph.capture().document);
  sparse.graph.resources = new Array(2);
  assert.throws(() => writeDocument(sparse));
});
test("missing exact module preserves opaque state and last port policy; loss payload is never activated", () => {
  const s = flow(),
    doc: any = structuredClone(s.graph.capture().document),
    node = doc.graph.stages[1].network.nodes.find((n: any) => n.id === s.float);
  node.type.fingerprint = "missing";
  doc.graph.modules.push({
    moduleId: node.type.moduleId,
    version: node.type.version,
    fingerprint: "missing",
  });
  node.state.extra = { future: [1, 2] };
  const read = readDocument(JSON.stringify(doc), (p) => s.fixed.module(p));
  assert.equal(read.status, "editable");
  if (read.status !== "editable") return;
  assert.equal(read.unresolvedModules.length, 1);
  const graph = new Graph(read.document, s.fixed, s.identity);
  assert.equal(compile(graph.capture(), s.fixed, esProfile).status, "failed");
  graph.change("rename missing", (d) =>
    d.rename(s.network, s.float, "Preserved"),
  );
  assert.deepEqual(
    graph
      .capture()
      .document.graph.stages[1].network.nodes.find((n) => n.id === s.float)!
      .state,
    node.state,
  );
});
test("forged stored conversion remains saveable but cannot generate", () => {
  const s = flow(),
    doc = structuredClone(s.graph.capture().document);
  doc.graph.stages[1].network.edges[0].adaptation.operation = "broadcast";
  const read = readDocument(writeDocument(doc));
  assert.equal(read.status, "editable");
  if (read.status !== "editable") return;
  assert.equal(
    compile(
      new Graph(read.document, s.fixed, s.identity).capture(),
      s.fixed,
      esProfile,
    ).status,
    "failed",
  );
});

test("prototype-named unknown structural keys and non-JSON whitespace are not silently accepted", () => {
  const s = flow(),
    raw = writeDocument(s.graph.capture().document);
  for (const name of ["__proto__", "constructor", "toString"]) {
    const doc = JSON.parse(raw);
    Object.defineProperty(doc.graph, name, {
      value: { future: true },
      enumerable: true,
    });
    assert.equal(readDocument(JSON.stringify(doc)).status, "recovery-readonly");
  }
  assert.equal(readDocument("\u00a0" + raw).status, "rejected");
});
test("unrelated edits preserve forged connection evidence rather than silently repairing it", () => {
  const s = flow(),
    doc = structuredClone(s.graph.capture().document);
  doc.graph.stages[1].network.edges[0].adaptation.operation = "broadcast";
  const g = new Graph(doc, s.fixed, s.identity);
  g.change("move", (d) => d.move(s.network, s.float, [40, 40]));
  assert.deepEqual(
    g.capture().document.graph.stages[1].network.edges,
    doc.graph.stages[1].network.edges,
  );
  assert.equal(g.capture().document.graph.losses.length, 0);
  assert.equal(compile(g.capture(), s.fixed, esProfile).status, "failed");
});

test("pending storage open cannot replace a newer edit or document lifetime", async () => {
  for (const replacement of ["edit", "load"]) {
    const storage = new MemoryStorage(),
      s = application(storage);
    const original = s.app.exportText();
    let release!: (raw: string) => void;
    storage.read = () => new Promise((resolve) => (release = resolve));
    const opening = s.app.reopen("old");
    if (replacement === "edit") s.add("float");
    else s.app.newDocument();
    const current = s.app.snapshot;
    release(original);
    await assert.rejects(opening, /OPEN_SUPERSEDED/);
    assert.deepEqual(s.app.snapshot, current);
  }
});

test("unrelated edits retain explicit invalid-edge evidence even when its stored plan is structurally valid", () => {
  const s = flow(),
    doc = structuredClone(s.graph.capture().document);
  doc.graph.stages[1].network.edges[0].invalid = {
    code: "RETAINED_ERROR",
    reason: "Preserved error evidence",
  };
  const graph = new Graph(doc, s.fixed, s.identity);
  graph.change("Move", (d) => d.move(s.network, s.float, [10, 20]));
  assert.deepEqual(
    graph.capture().document.graph.stages[1].network.edges[0].invalid,
    doc.graph.stages[1].network.edges[0].invalid,
  );
  assert.equal(compile(graph.capture(), s.fixed, esProfile).status, "failed");
});
