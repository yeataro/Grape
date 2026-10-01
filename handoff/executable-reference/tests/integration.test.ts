import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exercise, unwrap } from "../scenario.ts";
import { Graph, Registry, Editor } from "../core.ts";
import { FileStorage } from "../storage.ts";
import { builtinModule, refs } from "../nodes.ts";
import { generate } from "../generator.ts";

test("the complete user-requested architecture path runs using public contracts only", async () => {
  const result = await exercise();
  assert.equal(result.trace.length, 10);
  assert.match(result.shader.pixel, /outColor = /);
  assert.equal(result.graph.diagnostics.length, 0);
});
test("actual filesystem save and reload preserves the full document and generation", async (t) => {
  const folder = await mkdtemp(join(tmpdir(), "grape-architecture-"));
  const adapter = new FileStorage(join(folder, "graph.json"));
  const result = await exercise(adapter);
  assert.equal(await readFile(adapter.path, "utf8"), result.saved);
  t.diagnostic(`Isolated saved file: ${adapter.path}`);
});
test("context close and navigation cannot abandon an open graph gesture", () => {
  const registry = new Registry();
  unwrap(registry.register(builtinModule));
  const graph = new Graph({
    name: "Lifetime",
    definitions: registry.pin(),
    outputType: refs.output,
  });
  const editor = new Editor(),
    context = editor.open(graph),
    other = editor.open(graph);
  const op = unwrap(context.beginOperation("Gesture"));
  assert.equal(editor.close(context.id).ok, false);
  assert.equal(other.navigateStage("vertex").ok, false);
  unwrap(op.cancel());
  unwrap(context.navigateStage("vertex"));
  assert.notEqual(context.stageId, other.stageId);
  unwrap(editor.close(context.id));
  assert.equal(context.change("Stale", () => {}).ok, false);
  assert.equal(other.graph, graph);
});
test("old immutable generation snapshot survives a later schema change", async () => {
  const { graph, ids } = await exercise();
  const snapshot = graph.snapshot();
  const before = unwrap(generate(snapshot));
  unwrap(graph.nodeById(ids.compose)!.parameter("mode").write("pair"));
  assert.equal(generate(graph.snapshot()).ok, false);
  const retained = unwrap(generate(snapshot));
  assert.equal(retained.pixel, before.pixel);
  assert.equal(retained.revision, snapshot.revision);
  assert.ok(retained.revision < graph.revision);
});
