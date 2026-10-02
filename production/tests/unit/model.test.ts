import { test } from "node:test";
import assert from "node:assert/strict";
import { setup, flow, application } from "../fixtures/setup.ts";
import { nodeRef } from "../../src/modules/nodes.ts";
import { compile } from "../../src/generation/compiler.ts";
import { esProfile } from "../../src/modules/image.ts";
import { Graph } from "../../src/model/graph.ts";
import { writeDocument, readDocument } from "../../src/persistence/codec.ts";
test("AT-S01-01: Float × Multiply → Compose emits pinned host-free GLSL without mutation", () => {
  const s = flow(),
    before = s.graph.capture(),
    result = compile(before, s.fixed, esProfile);
  assert.equal(result.status, "success", JSON.stringify(result.diagnostics));
  assert.match(result.artifacts.find((a) => a.key === "pixel")!.text, /0\.25/);
  assert.match(
    result.artifacts.find((a) => a.key === "pixel")!.text,
    /\* 2\.0/,
  );
  assert.equal(result.document.graph.id, before.document.graph.id);
  assert.deepEqual(s.graph.capture(), before);
  assert.equal(result.artifacts.length, 2);
});
test("AT-S01-02: direction, cross-network, occupied input, cycle and type failures are atomic", () => {
  const s = flow();
  const snapshot = s.graph.capture();
  const attempts = [
    (d: any) =>
      d.connect(
        s.network,
        { nodeId: s.multiply, portKey: "a" },
        { nodeId: s.multiply, portKey: "a" },
      ),
    (d: any) =>
      d.connect(
        s.network,
        { nodeId: s.float, portKey: "value" },
        { nodeId: s.multiply, portKey: "a" },
      ),
    (d: any) =>
      d.connect(
        s.network,
        { nodeId: s.multiply, portKey: "result" },
        { nodeId: s.multiply, portKey: "b" },
      ),
    (d: any) =>
      d.connect(
        "another-network",
        { nodeId: s.float, portKey: "value" },
        { nodeId: s.multiply, portKey: "a" },
      ),
    (d: any) =>
      d.connect(
        s.network,
        { nodeId: s.float, portKey: "value" },
        {
          nodeId:
            s.graph.capture().document.graph.stages[1].network.nodes[0].id,
          portKey: "color",
        },
        true,
      ),
  ];
  for (const attempt of attempts) {
    assert.throws(() => s.graph.change("invalid", attempt));
    assert.deepEqual(s.graph.capture(), snapshot);
  }
  assert.throws(() =>
    s.graph.change("poison", (d) => {
      d.move(s.network, s.float, [42, 42]);
      try {
        d.remove(s.network, "absent");
      } catch {}
    }),
  );
  assert.deepEqual(s.graph.capture(), snapshot);
});
test("AT-S01-03: mode change captures complete prior ports, edge plans and loss; undo/redo and reload", () => {
  const s = flow();
  const before = s.graph.capture().document;
  s.graph.change("shape", (d) =>
    d.parameter(s.network, s.compose, "mode", "vec2"),
  );
  const after = s.graph.capture();
  assert(after.diagnostics.some((d) => d.code === "INPUT_REQUIRED"));
  assert(after.document.graph.losses.some((l) => l.payload.kind === "edge"));
  assert(
    after.document.graph.losses.some(
      (l) =>
        l.payload.kind === "input-value" &&
        l.payload.port.key === "w" &&
        l.payload.value === 1,
    ),
  );
  assert.equal(compile(after, s.fixed, esProfile).status, "failed");
  const decoded = readDocument(writeDocument(after.document));
  assert.equal(decoded.status, "editable");
  if (decoded.status !== "editable") return;
  const reopened = new Graph(decoded.document, s.fixed, s.identity);
  assert.equal(
    compile(reopened.capture(), s.fixed, esProfile).status,
    "failed",
  );
  assert.deepEqual(reopened.capture().document, after.document);
  s.graph.undo();
  assert.deepEqual(s.graph.capture().document, before);
  s.graph.redo();
  assert.deepEqual(s.graph.capture().document, after.document);
  s.graph.change("restore shape without restoring edges", (d) =>
    d.parameter(s.network, s.compose, "mode", "vec4"),
  );
  assert(
    s.graph.capture().diagnostics.some((d) => d.code === "INPUT_REQUIRED"),
  );
});
test("AT-S01-04: multi-batch operation, cancel/no-op redo, expired draft and async draft", () => {
  const s = flow(),
    before = s.graph.capture().document,
    history = s.graph.historyLength,
    op = s.graph.begin("gesture");
  s.graph.change("move", (d) => d.move(s.network, s.float, [10, 20]), op);
  s.graph.change("move", (d) => d.move(s.network, s.float, [30, 40]), op);
  assert.equal(s.graph.historyLength, history);
  s.graph.commit(op);
  assert.equal(s.graph.historyLength, history + 1);
  s.graph.undo();
  assert.deepEqual(s.graph.capture().document, before);
  const cancel = s.graph.begin("cancel");
  s.graph.change("move", (d) => d.move(s.network, s.float, [50, 60]), cancel);
  s.graph.cancel(cancel);
  assert(s.graph.canRedo);
  s.graph.change("noop", () => {});
  assert(s.graph.canRedo);
  let leaked: any;
  s.graph.change("capture", (d) => {
    leaked = d;
  });
  assert.throws(() => leaked.move(s.network, s.float, [1, 2]), /DRAFT_EXPIRED/);
  assert.throws(() => s.graph.change("async", async () => {}), /ASYNC_DRAFT/);
});
test("AT-S01-08: projection before observers, reentrant writes reject and throwing observer does not roll back", () => {
  const s = flow();
  const revisions: number[] = [];
  let projection = 0;
  s.graph.subscribeProjection((snapshot) => {
    projection = snapshot.revision;
  });
  s.graph.subscribe(() => {
    assert.throws(() => s.graph.undo(), /REENTRANT_WRITE/);
    throw Error("observer failure");
  });
  s.graph.subscribe((snapshot) => {
    assert.equal(projection, snapshot.revision);
    revisions.push(snapshot.revision);
  });
  s.graph.change("edit", (d) => d.parameter(s.network, s.float, "value", 0.75));
  assert.equal(revisions.length, 1);
  assert.equal(s.graph.observerErrors.length, 1);
});
test("AT-S01-06: contexts share model and clean selection before external observation", () => {
  const s = application(),
    node = s.add("float"),
    other = s.app.context();
  other.select([node]);
  s.context.select([]);
  const ownBefore = s.context.capture().selection;
  let selected: string[] = [];
  s.app.subscribe(() => {
    selected = [...other.capture().selection];
  });
  s.context.select([node]);
  s.app.execute({ panelId: "test", typeId: "test" }, s.target(), {
    commandId: "grape.node.delete",
    args: {},
  });
  assert.deepEqual(selected, []);
  s.app.execute({ panelId: "test", typeId: "test" }, s.target(), {
    commandId: "grape.undo",
    args: {},
  });
  assert.deepEqual(other.capture().selection, []);
  assert.equal(other.network().nodes.length, s.context.network().nodes.length);
});
test("scoped field token rejects value ABA, busy, connected and dead targets; unrelated movement preserves token", () => {
  const s = application(),
    node = s.add("float"),
    target = s.app.parameter(
      s.context,
      node,
      "value",
      s.context.capture().scope,
    ),
    token = target.capture().editToken;
  target.commit(0.5, token);
  s.app.execute({ panelId: "test", typeId: "test" }, s.target(), {
    commandId: "grape.undo",
    args: {},
  });
  assert.throws(() => target.commit(0.7, token), /STALE_EDIT/);
  const before = target.capture().editToken,
    gesture = s.app.beginGesture(
      { panelId: "test", typeId: "test" },
      s.target(),
      { commandId: "grape.node.move", args: { ids: [node] } },
    );
  gesture.update({ positions: { [node]: [20, 30] } });
  assert.equal(target.capture().editToken, before);
  assert.throws(() => target.commit(0.4, before), /FIELD_READONLY/);
  gesture.cancel();
  target.dispose();
  assert.throws(() => target.capture(), /TARGET_EXPIRED/);
});
test("all model errors including unused nodes block generation; fixed definitions and boundaries remain protected", () => {
  const s = flow();
  const before = s.graph.capture();
  const output = before.document.graph.stages[1].network.nodes[0];
  assert.throws(
    () =>
      s.graph.change("remove boundary", (d) => d.remove(s.network, output.id)),
    /BOUNDARY_PROTECTED/,
  );
  const doc = structuredClone(before.document);
  doc.graph.stages[1].network.nodes.find((n) => n.id === s.float)!.state = {
    value: "bad",
  };
  const invalid = new Graph(doc, s.fixed, s.identity);
  assert.equal(compile(invalid.capture(), s.fixed, esProfile).status, "failed");
});

test("generation rejects missing/extra declared boundary output even when a module emits an incomplete map", () => {
  const s = flow(),
    original = s.fixed.node(nodeRef("image-output"))!;
  for (const boundaryOutputs of [
    undefined,
    {},
    { color: { type: "glsl.vec2", code: "vec2(1.0)" } },
  ]) {
    const definitions = {
      ...s.fixed,
      node: (ref: any) =>
        ref.typeId === "image-output"
          ? { ...original, emit: () => ({ outputs: {}, boundaryOutputs }) }
          : s.fixed.node(ref),
    };
    const result = compile(s.graph.capture(), definitions as any, esProfile);
    assert.equal(result.status, "failed");
    assert.deepEqual(result.artifacts, []);
  }
});

test("shared type environment rejects unknown identity and permits explicitly registered nominal types without changing core dispatch", async () => {
  const { TypeEnvironment } = await import("../../src/definitions/types.ts");
  const types = new TypeEnvironment([
    {
      id: "example.scalar",
      valueCodec: {
        schemaVersion: 1,
        validate: (value: any) =>
          typeof value === "number"
            ? []
            : [
                {
                  code: "VALUE",
                  severity: "error",
                  message: "number required",
                },
              ],
      },
    },
  ]);
  const source = {
      key: "out",
      direction: "output" as const,
      type: "example.scalar",
    },
    target = { key: "in", direction: "input" as const, type: "example.scalar" };
  assert.equal(types.adaptation(source, target).operation, "identity");
  assert(types.validValue("example.scalar", 3));
  assert.throws(
    () =>
      types.adaptation(
        { ...source, type: "unregistered" },
        { ...target, type: "unregistered" },
      ),
    /TYPE_UNKNOWN/,
  );
  assert.throws(
    () => types.adaptation(source, { ...target, type: "glsl.float" }),
    /TYPE_ADAPTATION/,
  );
  assert(!types.resolve("later.type"));
});

test("AT-S01-02: endpoints in two real Stage networks cannot be cross-connected", () => {
  const s = flow(),
    document = structuredClone(s.graph.capture().document);
  const stage = document.graph.stages[0],
    definition = s.fixed.node(nodeRef("vertex-output"))!;
  stage.implementation = "network";
  stage.network.nodes.push({
    id: "vertex-boundary",
    name: "Vertex output",
    type: nodeRef("vertex-output"),
    state: {},
    inputValues: {},
    ports: structuredClone([...definition.ports({})]),
    references: [],
    referencesComplete: true,
    position: [0, 0],
    extensions: {},
  });
  const graph = new Graph(document, s.fixed, s.identity),
    before = graph.capture();
  for (const network of [s.network, stage.network.id]) {
    assert.throws(
      () =>
        graph.change("cross-stage", (d) =>
          d.connect(
            network,
            { nodeId: s.compose, portKey: "result" },
            { nodeId: "vertex-boundary", portKey: "position" },
          ),
        ),
      /NODE_MISSING/,
    );
    assert.deepEqual(graph.capture(), before);
    assert.equal(graph.historyLength, 0);
  }
});

test("unknown Stage slots block generation; duplicate slot identities reject before hydration", () => {
  const s = flow();
  for (const key of ["pixel", "undeclared-slot"]) {
    const document = structuredClone(s.graph.capture().document),
      extra = structuredClone(document.graph.stages[1]);
    extra.id = "extra-stage";
    extra.key = key;
    extra.network.id = "extra-network";
    document.graph.stages.push(extra);
    if (key === "pixel") {
      assert.throws(
        () => new Graph(document, s.fixed, s.identity),
        /DUPLICATE_IDENTITY/,
      );
      assert.throws(() => writeDocument(document), /DUPLICATE_IDENTITY/);
      continue;
    }
    const graph = new Graph(document, s.fixed, s.identity);
    assert(
      graph.capture().diagnostics.some((d) => d.code === "STAGE_TOPOLOGY"),
    );
    assert.equal(compile(graph.capture(), s.fixed, esProfile).status, "failed");
    assert.equal(
      readDocument(writeDocument(graph.capture().document)).status,
      "editable",
    );
  }
});
