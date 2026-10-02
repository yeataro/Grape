import { test } from "node:test";
import assert from "node:assert/strict";
import { application, flow, MemoryStorage } from "../fixtures/setup.ts";
import { readDocument, writeDocument } from "../../src/persistence/codec.ts";

function boundaryMissing(character = "x") {
  const doc = structuredClone(flow().graph.capture().document);
  const node = doc.graph.stages[1].network.nodes[1];
  node.type.fingerprint = "unavailable-exact";
  doc.graph.modules.push({ ...node.type });
  // The pin envelope has no typeId.
  delete (doc.graph.modules.at(-1) as any).typeId;
  node.state = { privateData: "" };
  const remaining = 512000 - Buffer.byteLength(JSON.stringify(doc));
  const width = Buffer.byteLength(character);
  node.state.privateData =
    character.repeat(Math.floor(remaining / width)) +
    "x".repeat(remaining % width);
  assert.equal(Buffer.byteLength(JSON.stringify(doc)), 512000);
  return doc;
}
for (const character of ["x", "中", "🍇"]) {
  test(`M1: missing-module boundary ${character} rename rejects save before ACK without data loss`, async () => {
    const storage = new MemoryStorage(),
      { app } = application(storage);
    const doc = boundaryMissing(character),
      raw = JSON.stringify(doc);
    assert.equal(app.openText(raw).status, "editable");
    await app.save();
    assert.equal(app.dirty, false);
    const priorSaved = storage.records.get(doc.graph.id)!;
    assert.equal(readDocument(priorSaved).status, "editable");
    assert.deepEqual(JSON.parse(priorSaved), doc);
    const context = app.context(),
      node = context.network().nodes[1];
    app.grant("rename", ["grape.node.rename"]);
    app.execute(
      { panelId: "rename", typeId: "rename" },
      { scope: context.capture().scope, object: null },
      {
        commandId: "grape.node.rename",
        args: { id: node.id, name: node.name + " longer" },
      },
    );
    const before = app.snapshot;
    await assert.rejects(app.save(), { code: "DOCUMENT_SIZE" });
    assert.deepEqual(app.snapshot, before);
    assert.equal(app.dirty, true);
    assert.equal(app.saving, false);
    assert.equal(storage.records.get(doc.graph.id), priorSaved);
    assert.equal(JSON.stringify(doc), raw);
    assert.deepEqual(
      app.snapshot.document.graph.stages[1].network.nodes[1].state,
      node.state,
    );
  });
}

test("M1: compact fallback validates actual emitted bytes at and beyond the budget", () => {
  const doc = boundaryMissing();
  assert(Buffer.byteLength(JSON.stringify(doc, null, 2)) > 512000);
  const compact = writeDocument(doc);
  assert.equal(compact, JSON.stringify(doc));
  assert.equal(readDocument(compact).status, "editable");
  doc.graph.name += "x";
  assert.throws(() => writeDocument(doc), { code: "DOCUMENT_SIZE" });
});

for (const [field, limit] of [
  ["nodes", 256],
  ["edges", 1024],
] as const) {
  test(`M1: ${field} at/beyond network limit obey save/reopen invariant`, () => {
    const doc = structuredClone(flow().graph.capture().document);
    const network = doc.graph.stages[1].network;
    while (network[field].length < limit) {
      const copy = structuredClone(network[field][1]) as any;
      copy.id = `extra-${network[field].length}`;
      if (field === "nodes") copy.name = copy.id;
      (network[field] as any[]).push(copy);
    }
    assert.equal(readDocument(writeDocument(doc)).status, "editable");
    const extra = structuredClone(network[field][1]) as any;
    extra.id = "over-limit";
    if (field === "nodes") extra.name = extra.id;
    (network[field] as any[]).push(extra);
    const before = structuredClone(doc);
    assert.throws(() => writeDocument(doc), { code: "NETWORK_SIZE" });
    assert.equal(
      (readDocument(JSON.stringify(doc)) as any).reason,
      "NETWORK_SIZE",
    );
    assert.deepEqual(doc, before);
  });
}

test("M1: editing beyond network capacity cannot acknowledge a save or erase the previous saved document", async () => {
  const storage = new MemoryStorage(),
    { app } = application(storage);
  const doc = structuredClone(flow().graph.capture().document),
    network = doc.graph.stages[1].network;
  while (network.nodes.length < 256) {
    const node = structuredClone(network.nodes[1]);
    node.id = node.name = `extra-${network.nodes.length}`;
    network.nodes.push(node);
  }
  assert.equal(app.openText(JSON.stringify(doc)).status, "editable");
  await app.save();
  const saved = storage.records.get(doc.graph.id)!;
  const context = app.context();
  app.execute(
    { panelId: "test", typeId: "test" },
    { scope: context.capture().scope, object: null },
    {
      commandId: "grape.node.add",
      args: { ref: { ...network.nodes[1].type }, position: [0, 0] },
    },
  );
  const before = app.snapshot;
  await assert.rejects(app.save(), { code: "NETWORK_SIZE" });
  assert.deepEqual(app.snapshot, before);
  assert.equal(app.dirty, true);
  assert.equal(storage.records.get(doc.graph.id), saved);
  assert.equal((await app.reopen(doc.graph.id)).status, "editable");
  assert.deepEqual(app.snapshot.document, JSON.parse(saved));
  assert.equal(app.dirty, false);
});
