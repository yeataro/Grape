import test from "node:test";
import assert from "node:assert/strict";
import { Graph, Registry, Editor } from "../core.ts";
import type {
  Json,
  NodeModule,
  NodeType,
  NodeEmission,
  Result,
  TypeRef,
} from "../contracts.ts";

function value<T>(result: Result<T>): T {
  if (!result.ok) assert.fail(JSON.stringify(result.error));
  return result.value;
}

const ref = (typeId: string): TypeRef => ({
  moduleId: "adversarial",
  typeId,
  version: "1",
  fingerprint: "adversarial-1",
});
const objectState = (state: Json) => state as { [key: string]: Json };

function moduleDefinition(): NodeModule {
  const base = (
    typeId: string,
  ): Pick<
    NodeType,
    "ref" | "role" | "stages" | "stateCodec" | "parameters" | "validate"
  > => ({
    ref: ref(typeId),
    role: "operation",
    stages: ["pixel"],
    stateCodec: {
      schemaVersion: 1,
      validate: (state) =>
        state !== null && typeof state === "object" && !Array.isArray(state)
          ? []
          : ["object required"],
    },
    parameters: () => [],
    validate: () => [],
  });
  return {
    manifest: {
      id: "adversarial",
      version: "1",
      fingerprint: "adversarial-1",
      coreApiVersion: 1,
      dependencies: [],
      source: "independent test module",
      license: "test",
    },
    types: [
      {
        ...base("output"),
        role: "boundary",
        initialize: () => ({ state: {} }),
        ports: () => [
          {
            key: "color",
            direction: "input",
            type: "vec4",
            supply: "required",
            semantic: "rgba",
          },
        ],
        emit: (_state, ctx) => ({ outputs: {}, color: ctx.input("color") }),
      },
      {
        ...base("constant"),
        initialize: (args) => ({ state: args }),
        ports: () => [{ key: "value", direction: "output", type: "float" }],
        parameters: () => [
          {
            key: "number",
            target: { kind: "state", key: "number" },
            presentation: "number",
          },
        ],
        emit: (state) => ({
          outputs: {
            value: { type: "float", code: `${objectState(state).number}.0` },
          },
        }),
      },
      {
        ...base("dynamic"),
        initialize: (args) => ({ state: args }),
        ports: (state) => {
          const mode = objectState(state).mode;
          if (mode === "throw") throw new Error("schema fault");
          if (mode === "removed") return [];
          if (mode === "duplicate")
            return [
              { key: "value", direction: "output", type: "float" },
              { key: "value", direction: "output", type: "float" },
            ];
          return [
            {
              key: "value",
              direction: "output",
              type: mode === "int" ? "int" : "vec4",
              semantic: mode === "int" ? "value" : "rgba",
            },
          ];
        },
        emit: (state): NodeEmission =>
          objectState(state).mode === "removed"
            ? { outputs: {} }
            : { outputs: { value: { type: "vec4", code: "vec4(1.0)" } } },
      },
      {
        ...base("pass"),
        initialize: () => ({ state: {} }),
        ports: () => [
          {
            key: "in",
            direction: "input",
            type: "float",
            supply: "local",
            default: 0,
          },
          { key: "out", direction: "output", type: "float" },
        ],
        emit: (_state, ctx) => ({ outputs: { out: ctx.input("in") } }),
      },
    ],
  };
}

function setup() {
  const registry = new Registry();
  value(registry.register(moduleDefinition()));
  const graph = new Graph({
    name: "Adversarial",
    definitions: registry.pin(),
    outputType: ref("output"),
  });
  const pixel = graph.stage("pixel");
  const output = pixel.nodes.find((node) => node.typeRef.typeId === "output")!;
  assert.ok(output);
  const create = (type: string, state: Json = {}, name?: string) => {
    const id = value(
      graph.change("Create node", (draft) =>
        draft.createNode(pixel.id, ref(type), state, name),
      ),
    );
    return graph.nodeById(id)!;
  };
  return { graph, registry, pixel, output, create };
}

test("A01 callback failure publishes nothing, including prior successful draft commands", () => {
  const { graph, create } = setup();
  const a = create("constant", { number: 1 }, "one");
  const b = create("constant", { number: 2 }, "two");
  const before = graph.exportJSON();
  const revision = graph.revision;
  const history = graph.history.length;
  let events = 0;
  graph.subscribe(() => events++);
  const result = graph.change("Fail atomically", (draft) => {
    draft.rename(a.id, "changed");
    draft.move(b.id, [19, 81]);
    throw new Error("deliberate callback fault");
  });
  assert.equal(result.ok, false);
  assert.equal(graph.exportJSON(), before);
  assert.equal(graph.revision, revision);
  assert.equal(graph.history.length, history);
  assert.equal(events, 0);
});

for (const mode of ["duplicate", "throw"]) {
  test(`A02 dynamic schema ${mode} rejects the entire change and preserves connected edge`, () => {
    const { graph, output, create } = setup();
    const node = create("dynamic", { mode: "vec4" });
    value(
      graph.change("Connect", (draft) =>
        draft.connect(node.output("value"), output.input("color")),
      ),
    );
    const before = graph.exportJSON();
    let events = 0;
    graph.subscribe(() => events++);
    const result = graph.change("Bad schema", (draft) =>
      draft.setState(node.id, { mode }),
    );
    assert.equal(result.ok, false);
    assert.equal(graph.exportJSON(), before);
    assert.equal(events, 0);
  });
}

test("A03 initializer input and snapshot mutations cannot bypass the model boundary", () => {
  const { graph, create } = setup();
  const input: Json = { number: 2, nested: { values: [3, 4] } };
  const node = create("constant", input);
  const before = graph.exportJSON();
  try {
    objectState(input).number = 900;
  } catch {
    /* deep freezing is also valid */
  }
  const snapshot = graph.snapshot();
  try {
    snapshot.document.stages[1].nodes[0].name = "illegal snapshot mutation";
  } catch {
    /* immutable snapshot */
  }
  const state = node.state;
  try {
    objectState(state).number = 901;
  } catch {
    /* immutable projection */
  }
  assert.equal(graph.exportJSON(), before);
});

test("A04 observer throw is isolated and reentrant writes cannot change a pending observation", () => {
  const { graph, create } = setup();
  const node = create("constant", { number: 2 }, "original");
  const observations: { revision: number; name: string }[] = [];
  let nested: Result<unknown> | undefined;
  graph.subscribe((event) => {
    observations.push({
      revision: event.revision,
      name: graph.nodeById(node.id)!.name,
    });
    nested = graph.change("Reentrant write", (draft) =>
      draft.rename(node.id, "nested"),
    );
    throw new Error("subscriber error");
  });
  graph.subscribe((event) =>
    observations.push({
      revision: event.revision,
      name: graph.nodeById(node.id)!.name,
    }),
  );
  value(graph.change("Rename", (draft) => draft.rename(node.id, "published")));
  assert.equal(nested?.ok, false);
  if (nested && !nested.ok) assert.equal(nested.error.code, "REENTRANT_WRITE");
  assert.equal(observations.length, 2);
  assert.deepEqual(observations[0], observations[1]);
  assert.equal(graph.nodeById(node.id)!.name, "published");
});

test("A05 async callback is rejected and its retained draft expires before continuation", async () => {
  const { graph, create } = setup();
  const node = create("constant", { number: 2 }, "original");
  const before = graph.exportJSON();
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let continued = false;
  let lateFailure = false;
  const result = graph.change("Async invalid", async (draft) => {
    draft.rename(node.id, "before await");
    await pending;
    try {
      draft.rename(node.id, "after await");
    } catch {
      lateFailure = true;
    }
    continued = true;
  });
  assert.equal(result.ok, false);
  assert.equal(graph.exportJSON(), before);
  release();
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(continued, true);
  assert.equal(lateFailure, true);
  assert.equal(graph.exportJSON(), before);
});

test("A06 another writer cannot join an open operation; cancellation is observable but leaves no Undo entry", () => {
  const { graph, create } = setup();
  const node = create("constant", { number: 2 }, "original");
  const before = graph.exportJSON();
  const originalLength = graph.history.length;
  const op = value(graph.beginOperation("Multi-batch gesture"));
  const events: string[] = [];
  graph.subscribe((event) => events.push(event.kind));
  value(graph.change("First", (draft) => draft.rename(node.id, "first"), op));
  assert.equal(
    graph.change("Other writer", (draft) => draft.rename(node.id, "other")).ok,
    false,
  );
  value(graph.change("Second", (draft) => draft.move(node.id, [3, 4]), op));
  value(op.cancel());
  assert.equal(graph.exportJSON(), before);
  assert.equal(graph.history.length, originalLength);
  assert.deepEqual(events, ["change", "change", "cancel"]);
});

for (const mode of ["removed", "int"]) {
  test(`A07 dynamic port ${mode} detaches invalid edge with loss and Undo restores exact structure`, () => {
    const { graph, pixel, output, create } = setup();
    const node = create("dynamic", { mode: "vec4" });
    value(
      graph.change("Connect", (draft) =>
        draft.connect(node.output("value"), output.input("color")),
      ),
    );
    const before = graph.exportJSON();
    value(
      graph.change("Change mode", (draft) => draft.setState(node.id, { mode })),
    );
    const doc = graph.snapshot().document;
    assert.equal(
      doc.stages.find((stage) => stage.id === pixel.id)!.edges.length,
      0,
    );
    assert.equal(doc.losses.length, 1);
    assert.ok(
      graph.snapshot().diagnostics.some((issue) => issue.severity === "error"),
    );
    value(graph.history.undo());
    assert.equal(graph.exportJSON(), before);
    value(graph.history.redo());
    assert.equal(graph.snapshot().document.losses.length, 1);
  });
}

test("A08 foreign-load port handle cannot address a reloaded copy even when all persistent IDs match", () => {
  const { graph, registry, output, create } = setup();
  const node = create("dynamic", { mode: "vec4" });
  const loaded = value(Graph.load(graph.exportJSON(), registry));
  const before = loaded.exportJSON();
  const result = loaded.change("Foreign handle", (draft) =>
    draft.connect(
      node.output("value"),
      loaded.nodeById(output.id)!.input("color"),
    ),
  );
  assert.equal(result.ok, false);
  assert.equal(loaded.exportJSON(), before);
});

test("A08b logical port handle is absent while removed and resolves again after Undo restores its key", () => {
  const { graph, output, create } = setup();
  const node = create("dynamic", { mode: "vec4" });
  const handle = node.output("value");
  value(
    graph.change("Remove output", (draft) =>
      draft.setState(node.id, { mode: "removed" }),
    ),
  );
  const before = graph.exportJSON();
  assert.equal(
    graph.change("Use absent handle", (draft) =>
      draft.connect(handle, output.input("color")),
    ).ok,
    false,
  );
  assert.equal(graph.exportJSON(), before);
  value(graph.history.undo());
  value(
    graph.change("Re-use restored handle", (draft) =>
      draft.connect(handle, output.input("color")),
    ),
  );
  assert.equal(
    graph.snapshot().document.stages.find((stage) => stage.kind === "pixel")!
      .edges.length,
    1,
  );
});

test("A08c retaining a synchronous draft does not retain write access after publication", () => {
  const { graph, create } = setup();
  const node = create("constant", { number: 1 });
  let lateWrite: (() => unknown) | undefined;
  value(
    graph.change("Capture draft", (draft) => {
      lateWrite = () => draft.rename(node.id, "late");
      draft.rename(node.id, "committed");
    }),
  );
  const before = graph.exportJSON();
  assert.throws(() => lateWrite!());
  assert.equal(graph.exportJSON(), before);
});

test("A09 both contexts reconcile deleted selection before external publication and Undo does not restore selection", () => {
  const { graph, create } = setup();
  const node = create("constant", { number: 1 });
  const other = create("constant", { number: 2 });
  const editor = new Editor();
  const a = editor.open(graph);
  const b = editor.open(graph);
  a.select([node.id]);
  b.select([node.id, other.id], other.id);
  let observed = false;
  graph.subscribe(() => {
    assert.deepEqual(a.selection.items, []);
    assert.deepEqual(b.selection.items, [other.id]);
    observed = true;
  });
  value(graph.change("Delete", (draft) => draft.removeNode(node.id)));
  assert.equal(observed, true);
  value(graph.history.undo());
  assert.deepEqual(a.selection.items, []);
  assert.deepEqual(b.selection.items, [other.id]);
});

test("A10 missing module roundtrip preserves unknown data, core references, last ports and opaque state", () => {
  const { graph, create } = setup();
  const node = create("dynamic", {
    mode: "vec4",
    proprietary: { a: [1, "two", null] },
  });
  const doc = JSON.parse(graph.exportJSON());
  doc.vendorExtension = { untouched: ["hello", { number: 8 }] };
  const savedNode = doc.stages
    .flatMap((stage: { nodes: unknown[] }) => stage.nodes)
    .find((item: { id: string }) => item.id === node.id);
  savedNode.vendorNodeExtension = { unknown: true };
  savedNode.references = {
    privateResource: { kind: "resource", targetId: "resource-1" },
  };
  savedNode.referencesComplete = true;
  doc.resources.push({ id: "resource-1", data: { bytes: [1, 2, 3] } });
  const emptyRegistry = new Registry();
  const loaded = value(Graph.load(JSON.stringify(doc), emptyRegistry));
  assert.ok(
    loaded.snapshot().diagnostics.some((issue) => issue.severity === "error"),
  );
  value(
    loaded.change("Move missing node", (draft) => {
      draft.move(node.id, [5, 6]);
      draft.rename(node.id, "missingButEditable");
    }),
  );
  const next = JSON.parse(loaded.exportJSON());
  const nextNode = next.stages
    .flatMap((stage: { nodes: unknown[] }) => stage.nodes)
    .find((item: { id: string }) => item.id === node.id);
  assert.deepEqual(next.vendorExtension, doc.vendorExtension);
  assert.deepEqual(nextNode.vendorNodeExtension, savedNode.vendorNodeExtension);
  assert.deepEqual(nextNode.state, savedNode.state);
  assert.deepEqual(nextNode.ports, savedNode.ports);
  assert.deepEqual(nextNode.typeRef, savedNode.typeRef);
  assert.deepEqual(nextNode.references, savedNode.references);
  assert.deepEqual(nextNode.position, [5, 6]);
  assert.equal(nextNode.name, "missingButEditable");
  const again = value(Graph.load(loaded.exportJSON(), emptyRegistry));
  assert.equal(again.exportJSON(), loaded.exportJSON());
});

test("A10b missing module state cannot be edited by bypassing the unavailable Parameter UI", () => {
  const { graph, create } = setup();
  const node = create("dynamic", { mode: "vec4", privateData: [1, 2, 3] });
  const loaded = value(Graph.load(graph.exportJSON(), new Registry()));
  const before = loaded.exportJSON();
  assert.equal(
    loaded.change("Guess opaque state", (draft) =>
      draft.setState(node.id, { mode: "int" }),
    ).ok,
    false,
  );
  assert.equal(loaded.exportJSON(), before);
});

test("A11 occupied input and cycle reject without a hidden replacement or partial commit", () => {
  const { graph, create } = setup();
  const a = create("pass");
  const b = create("pass");
  const c = create("pass");
  value(
    graph.change("Connect", (draft) =>
      draft.connect(a.output("out"), b.input("in")),
    ),
  );
  const before = graph.exportJSON();
  assert.equal(
    graph.change("Occupied", (draft) =>
      draft.connect(c.output("out"), b.input("in")),
    ).ok,
    false,
  );
  assert.equal(graph.exportJSON(), before);
  assert.equal(
    graph.change("Cycle", (draft) =>
      draft.connect(b.output("out"), a.input("in")),
    ).ok,
    false,
  );
  assert.equal(graph.exportJSON(), before);
});

test("A11b catching a failed draft command cannot unpoison the failed batch", () => {
  const { graph, output, create } = setup();
  const node = create("constant", { number: 1 }, "original");
  const before = graph.exportJSON();
  let caught = false;
  const result = graph.change("Swallow command failure", (draft) => {
    try {
      draft.removeNode(output.id);
    } catch {
      caught = true;
    }
    draft.rename(node.id, "should-not-commit");
  });
  assert.equal(caught, true);
  assert.equal(result.ok, false);
  assert.equal(graph.exportJSON(), before);
});

test("A14 no-op edit after Undo preserves Redo and does not publish a revision", () => {
  const { graph, create } = setup();
  const node = create("constant", { number: 1 }, "original");
  value(graph.change("Rename", (draft) => draft.rename(node.id, "changed")));
  value(graph.history.undo());
  const before = graph.revision;
  let notifications = 0;
  graph.subscribe(() => notifications++);
  value(graph.change("No-op", (draft) => draft.rename(node.id, "original")));
  assert.equal(graph.revision, before);
  assert.equal(notifications, 0);
  value(graph.history.redo());
  assert.equal(graph.nodeById(node.id)!.name, "changed");
});

test("A15 modifying the caller-owned module after registration cannot alter pinned definitions", () => {
  const module = moduleDefinition();
  const registry = new Registry();
  value(registry.register(module));
  const fixed = registry.pin();
  const graph = new Graph({
    name: "Pinned",
    definitions: fixed,
    outputType: ref("output"),
  });
  const before = graph.exportJSON();
  try {
    module.types[0].ref.typeId = "changed-after-registration";
  } catch {
    /* freezing caller data also isolates registry */
  }
  try {
    module.types.splice(0, module.types.length);
  } catch {
    /* frozen */
  }
  assert.ok(fixed.resolve(ref("output")));
  assert.equal(graph.exportJSON(), before);
  assert.doesNotThrow(
    () =>
      new Graph({
        name: "PinnedAgain",
        definitions: fixed,
        outputType: ref("output"),
      }),
  );
});

test("A12 two imported cycles can be repaired incrementally without dropping the other cycle", () => {
  const { graph, registry, pixel, create } = setup();
  const nodes = Array.from({ length: 4 }, () => create("pass"));
  const doc = JSON.parse(graph.exportJSON());
  const stage = doc.stages.find((item: { id: string }) => item.id === pixel.id);
  const edge = (id: string, from: number, to: number) => ({
    id,
    from: { nodeId: nodes[from].id, key: "out" },
    to: { nodeId: nodes[to].id, key: "in" },
    adaptation: { from: "float", to: "float", op: "identity" },
  });
  stage.edges.push(
    edge("cycle-a1", 0, 1),
    edge("cycle-a2", 1, 0),
    edge("cycle-b1", 2, 3),
    edge("cycle-b2", 3, 2),
  );
  const loaded = value(Graph.load(JSON.stringify(doc), registry));
  assert.equal(
    loaded.snapshot().document.stages.find((item) => item.id === pixel.id)!
      .edges.length,
    4,
  );
  assert.ok(
    loaded.snapshot().diagnostics.some((issue) => issue.code.includes("CYCLE")),
  );
  value(
    loaded.change("Repair first cycle", (draft) =>
      draft.disconnect("cycle-a2"),
    ),
  );
  assert.equal(
    loaded.snapshot().document.stages.find((item) => item.id === pixel.id)!
      .edges.length,
    3,
  );
  assert.ok(
    loaded.snapshot().diagnostics.some((issue) => issue.code.includes("CYCLE")),
  );
  value(
    loaded.change("Repair second cycle", (draft) =>
      draft.disconnect("cycle-b2"),
    ),
  );
  assert.equal(
    loaded.snapshot().document.stages.find((item) => item.id === pixel.id)!
      .edges.length,
    2,
  );
  assert.equal(
    loaded.snapshot().diagnostics.some((issue) => issue.code.includes("CYCLE")),
    false,
  );
});

test("A16 sparse arrays cannot silently change state to null entries during save and reload", () => {
  const { graph, pixel } = setup();
  const before = graph.exportJSON();
  const result = graph.change("Sparse JSON input", (draft) =>
    draft.createNode(pixel.id, ref("constant"), {
      number: 1,
      sparse: Array(2),
    }),
  );
  assert.equal(
    result.ok,
    false,
    "Sparse input is not a JSON array value; accepting it loses data identity on JSON serialization",
  );
  assert.equal(graph.exportJSON(), before);
});

test("A17 stage-ineligible node cannot be newly inserted through the public command surface", () => {
  const module = moduleDefinition();
  const type = module.types.find((type) => type.ref.typeId === "constant")!;
  type.stages = ["vertex"];
  const registry = new Registry();
  value(registry.register(module));
  const graph = new Graph({
    name: "Stage restrictions",
    definitions: registry.pin(),
    outputType: ref("output"),
  });
  const before = graph.exportJSON();
  const result = graph.change("Insert invalid node", (draft) =>
    draft.createNode(graph.stage("pixel").id, ref("constant"), { number: 1 }),
  );
  assert.equal(
    result.ok,
    false,
    "Imported incompatibility can be diagnosed, but createNode has an explicit stage eligibility precondition",
  );
  assert.equal(graph.exportJSON(), before);
});

test("A13 concurrent save is refused and a stale save completion cannot mark newer edits clean", async () => {
  const { graph, create } = setup();
  const node = create("constant", { number: 1 }, "original");
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let stored = "";
  let writes = 0;
  const adapter = {
    async write(text: string) {
      writes++;
      await pending;
      stored = text;
    },
    async read() {
      return stored;
    },
  };
  const first = graph.save(adapter);
  value(
    graph.change("New edit while saving", (draft) =>
      draft.rename(node.id, "newer"),
    ),
  );
  const second = await graph.save(adapter);
  assert.equal(second.ok, false);
  if (!second.ok) assert.equal(second.error.code, "SAVE_BUSY");
  assert.equal(writes, 1);
  release();
  value(await first);
  assert.equal(graph.dirty, true);
  assert.notEqual(stored, graph.exportJSON());
  value(await graph.save(adapter));
  assert.equal(graph.dirty, false);
  assert.equal(stored, graph.exportJSON());
});

test("A18 Parameter implicit writes and explicit grouping share the same History boundary", () => {
  const { graph, create } = setup();
  const node = create("constant", { number: 1 });
  const parameter = node.parameter("number");
  const original = graph.history.length;
  value(parameter.write(2));
  value(parameter.write(3));
  assert.equal(parameter.read(), 3);
  assert.equal(graph.history.length, original + 2);
  const grouped = value(graph.beginOperation("One gesture"));
  value(parameter.write(4, grouped));
  value(parameter.write(5, grouped));
  assert.equal(graph.history.length, original + 2);
  assert.equal(
    parameter.write(6).ok,
    false,
    "Unattributed writer must not join an existing gesture",
  );
  assert.equal(parameter.read(), 5);
  value(grouped.commit());
  assert.equal(graph.history.length, original + 3);
  value(graph.history.undo());
  assert.equal(parameter.read(), 3);
  value(graph.history.redo());
  assert.equal(parameter.read(), 5);
});

test("A19 a protected profile boundary remains protected when its module is missing", () => {
  const { graph, output } = setup();
  const loaded = value(Graph.load(graph.exportJSON(), new Registry()));
  const before = loaded.exportJSON();
  assert.equal(
    loaded.change("Delete opaque boundary", (draft) =>
      draft.removeNode(output.id),
    ).ok,
    false,
  );
  assert.equal(loaded.exportJSON(), before);
});

test("A20 rejecting one nested graph.change must not unlock a second nested change", () => {
  const { graph, create } = setup();
  const node = create("constant", { number: 1 }, "initial");
  const operation = value(graph.beginOperation("Outer gesture"));
  const nested: Result<unknown>[] = [];
  value(
    graph.change(
      "Outer batch",
      (draft) => {
        nested.push(
          graph.change(
            "Nested one",
            (inner) => inner.rename(node.id, "nested-one"),
            operation,
          ),
        );
        nested.push(
          graph.change(
            "Nested two",
            (inner) => inner.rename(node.id, "nested-two"),
            operation,
          ),
        );
        draft.rename(node.id, "outer");
      },
      operation,
    ),
  );
  assert.equal(nested.length, 2);
  for (const result of nested) {
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.code, "REENTRANT_WRITE");
  }
  assert.equal(graph.nodeById(node.id)!.name, "outer");
  value(operation.commit());
});

test("A21 module validation cannot reenter the same Graph during change or history publication", () => {
  const module = moduleDefinition();
  let hook: (() => void) | undefined;
  module.types.find((type) => type.ref.typeId === "constant")!.validate =
    () => {
      const current = hook;
      hook = undefined;
      current?.();
      return [];
    };
  const registry = new Registry();
  value(registry.register(module));
  const graph = new Graph({
    name: "Validation guards",
    definitions: registry.pin(),
    outputType: ref("output"),
  });
  const id = value(
    graph.change("Create", (draft) =>
      draft.createNode(
        graph.stage("pixel").id,
        ref("constant"),
        { number: 1 },
        "initial",
      ),
    ),
  );
  const operation = value(graph.beginOperation("Outer gesture"));
  const nested: Result<unknown>[] = [];
  const revisions: number[] = [];
  graph.subscribe((event) => revisions.push(event.revision));
  hook = () => {
    nested.push(
      graph.change(
        "Validator write",
        (draft) => draft.rename(id, "forbidden"),
        operation,
      ),
    );
  };
  value(
    graph.change(
      "Outer state",
      (draft) => draft.setState(id, { number: 2 }),
      operation,
    ),
  );
  assert.equal(
    nested[0]?.ok,
    false,
    "Validating a candidate must hold the same-Graph write guard",
  );
  assert.equal(graph.nodeById(id)!.name, "initial");
  assert.equal(revisions.length, 1);
  value(operation.commit());
  hook = () => {
    nested.push(
      graph.change("Validator write during Undo", (draft) =>
        draft.rename(id, "forbidden"),
      ),
    );
  };
  value(graph.history.undo());
  assert.equal(
    nested[1]?.ok,
    false,
    "History validation must also prevent same-Graph reentrant writes",
  );
  assert.equal(graph.nodeById(id)!.name, "initial");
  assert.equal(revisions.length, 2);
});
