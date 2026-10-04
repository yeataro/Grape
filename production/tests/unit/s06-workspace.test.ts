import test from "node:test";
import assert from "node:assert/strict";
import { application } from "../fixtures/setup.ts";
import { nodeRef, composeNode } from "../../src/modules/nodes.ts";
import { imageKind } from "../../src/modules/image.ts";
import { fixedValues } from "../../src/modules/fixed-values.ts";
import { catalogRank } from "../../src/features/node-browser.ts";
import { canvasCommands } from "../../src/features/canvas.ts";
import { Graph, type Draft } from "../../src/model/graph.ts";
import { asNetwork } from "../../src/sdk/networks.ts";
function setup() {
  const s = application();
  s.app.grant("s06", canvasCommands);
  const run = (commandId: string, args: any = {}) =>
    s.app.execute({ panelId: "s06", typeId: "s06" }, s.target(), {
      commandId,
      args,
    });
  return { ...s, run };
}
test("S06 catalog is a detached read over exact document pins and current occurrence stage", () => {
  const s = setup(),
    before = s.app.snapshot,
    history = s.app.canUndo;
  s.definitions.register(fixedValues);
  const entries = s.app.creationCatalog(s.context);
  assert(entries.some((e) => e.ref.typeId === "float"));
  assert(
    !entries.some((e) => e.ref.moduleId === fixedValues.manifest.moduleId),
  );
  assert(Object.isFrozen(entries));
  assert(Object.isFrozen(entries[0].ports));
  assert.deepEqual(s.app.snapshot, before);
  assert.equal(s.app.canUndo, history);
  const vertex = before.document.graph.stages.find((s) => s.key === "vertex")!;
  s.run("grape.stage.navigate", { stageId: vertex.id });
  assert.equal(s.context.capture().scope.stageId, vertex.id);
  assert.deepEqual(s.app.creationCatalog(s.context), []);
  assert.deepEqual(s.app.snapshot, before);
});
test("S06 source/name/category literal rank uses NFKC, aliases and all terms without regular expressions", () => {
  const s = setup(),
    base = s.app.creationCatalog(s.context)[0],
    owner = base.presentation.label.owner;
  const item = {
    ...base,
    presentation: {
      label: { owner, key: "x", fallback: "Vector Compose" },
      searchTerms: [{ owner, key: "a", fallback: "pack" }],
      category: {
        id: "value",
        label: { owner, key: "c", fallback: "Values / Vector" },
      },
      description: { owner, key: "d", fallback: "Build components" },
    },
  };
  assert.equal(catalogRank(item, "Ｖｅｃｔｏｒ Ｃｏｍｐｏｓｅ"), 0);
  assert.equal(catalogRank(item, "pack"), 1);
  assert.equal(catalogRank(item, "vector"), 2);
  assert.equal(catalogRank(item, "compose vector"), 3);
  assert.equal(catalogRank(item, "vector pack"), 4);
  assert.equal(catalogRank(item, "compose values"), 5);
  assert.equal(catalogRank(item, "vector components"), 6);
  assert.equal(catalogRank(item, "[.*"), null);
  assert.equal(catalogRank(item, "vector missing"), null);
});
test("S06 stale creation proposals reject revision, navigation ABA, load and readonly without model or History writes", () => {
  for (const change of ["revision", "navigation", "load", "readonly"]) {
    const s = setup(),
      item = s.app
        .creationCatalog(s.context)
        .find((e) => e.ref.typeId === "float")!;
    if (change === "revision") s.add("multiply");
    if (change === "navigation") {
      const stages = s.app.snapshot.document.graph.stages;
      s.run("grape.stage.navigate", {
        stageId: stages.find((x) => x.key === "vertex")!.id,
      });
      s.run("grape.stage.navigate", {
        stageId: stages.find((x) => x.key === "pixel")!.id,
      });
    }
    if (change === "load") {
      s.app.newDocument();
    }
    if (change === "readonly") s.app.setReadonly(true);
    const before = s.app.snapshot;
    assert.throws(() =>
      s.run("grape.node.add", {
        ref: nodeRef("float"),
        position: [0, 0],
        scope: item.scope,
        revision: item.revision,
      }),
    );
    assert.deepEqual(s.app.snapshot, before);
  }
});
test("S06 connected creation replaces an occupied exact input atomically and Undo restores it", () => {
  const s = setup(),
    a = s.add("float"),
    b = s.add("multiply");
  s.run("grape.edge.connect", {
    from: { nodeId: a, portKey: "value" },
    to: { nodeId: b, portKey: "a" },
  });
  const before = s.app.snapshot.document,
    revision = s.app.snapshot.revision,
    wire = { nodeId: b, portKey: "a", direction: "input" as const },
    item = s.app
      .creationCatalog(s.context, wire)
      .find((e) => e.ref.typeId === "float")!;
  let notifications = 0;
  const off = s.app.subscribe(() => notifications++);
  s.run("grape.node.add", {
    ref: item.ref,
    position: [24, 48],
    scope: item.scope,
    revision: item.revision,
    wire,
    matchingPort: item.matchingPort,
  });
  off();
  assert.equal(s.app.snapshot.revision, revision + 1);
  assert.equal(notifications, 2);
  const after = s.app.snapshot.document;
  assert.equal(s.context.network().edges.length, 1);
  assert.notEqual(s.context.network().edges[0].from.nodeId, a);
  s.run("grape.undo");
  assert.deepEqual(s.app.snapshot.document, before);
  s.run("grape.redo");
  assert.deepEqual(s.app.snapshot.document, after);
});
test("S06 query disposable IDs do not collide with admitted persistent IDs and consume no canonical identity", () => {
  const s = setup(),
    document = structuredClone(s.app.snapshot.document);
  document.graph.stages.find((x) => x.key === "pixel")!.network.nodes[0].id =
    "catalog-probe-1";
  s.app.openText(JSON.stringify(document));
  const context = s.app.context(),
    before = s.app.snapshot;
  const first = s.app.creationCatalog(context),
    second = s.app.creationCatalog(context);
  assert(first.some((e) => e.ref.typeId === "multiply"));
  assert.deepEqual(first, second);
  assert.deepEqual(s.app.snapshot, before);
  assert.equal(s.app.canUndo, false);
});
test("S06 forged reference and mismatched matching-port proposals reject before any model publication", () => {
  for (const alteration of ["resource", "port", "parameters"]) {
    const s = setup(),
      destination = s.add("multiply"),
      wire = { nodeId: destination, portKey: "a", direction: "input" as const },
      item = s.app
        .creationCatalog(s.context, wire)
        .find((e) => e.ref.typeId === "float")!,
      before = s.app.snapshot;
    let publications = 0;
    const off = s.app.subscribe(() => publications++);
    const args: any = {
      ref: item.ref,
      scope: item.scope,
      revision: item.revision,
      wire,
      matchingPort: item.matchingPort,
      parameters: item.parameters,
      position: [24, 48],
    };
    if (alteration === "resource")
      args.creation = {
        kind: "reference",
        role: "source",
        resourceId: "missing",
      };
    if (alteration === "port") args.matchingPort = "wrong";
    if (alteration === "parameters") args.parameters = { unexpected: "value" };
    assert.throws(() => s.run("grape.node.add", args), /CREATION_UNAVAILABLE/);
    off();
    assert.deepEqual(s.app.snapshot, before);
    assert.equal(publications, 0);
  }
});
test("S06 reference catalog excludes nested source admission without publishing query changes", () => {
  const s = setup();
  const source = s.app
    .creationCatalog(s.context)
    .find((e) => e.creation?.kind === "source")!;
  assert(source);
  s.run("grape.node.add", {
    ref: source.ref,
    creation: source.creation,
    parameters: source.parameters,
    scope: source.scope,
    revision: source.revision,
    position: [0, 0],
  });
  s.run("grape.network.create");
  const caller = s.context.capture().primary!;
  s.run("grape.network.enter", { id: caller });
  const before = s.app.snapshot,
    entries = s.app.creationCatalog(s.context);
  assert(
    !entries.some(
      (e) =>
        e.creation?.kind === "source" ||
        (e.creation?.kind === "reference" && e.creation.role === "source"),
    ),
  );
  assert.deepEqual(s.app.snapshot, before);
});

test("S06 configured Compose preview and published schema/edge agree in one transaction and one Undo/Redo", () => {
  const s = setup();
  let caller = "";
  s.graph.change("Destination", (d) => {
    caller = d.createSubgraph(s.network);
  });
  const resource = s.graph.capture().document.graph.resources[0];
  const data = asNetwork(resource, s.fixed)!;
  s.graph.change("Vec2 interface", (d) =>
    d.interface(
      data.network.id,
      data.interface.map((p) => ({
        ...p,
        type: "glsl.vec2",
        defaultValue: [0, 0],
      })),
    ),
  );
  s.app.openText(JSON.stringify(s.graph.capture().document));
  const context = s.app.context(),
    wire = { nodeId: caller, portKey: "value", direction: "input" as const };
  const item = s.app
    .creationCatalog(context, wire)
    .find((e) => e.ref.typeId === "compose")!;
  assert.deepEqual(item.parameters, { mode: "vec2" });
  const before = s.app.snapshot;
  const published: (typeof before)[] = [];
  const off = s.app.subscribe(() => published.push(s.app.snapshot));
  const run = (commandId: string, args: any = {}) =>
    s.app.execute(
      { panelId: "s06", typeId: "s06" },
      { scope: context.capture().scope, object: null },
      { commandId, args },
    );
  run("grape.node.add", { ...item, position: [120, 120], wire });
  off();
  const after = s.app.snapshot,
    node = context.network().nodes.find((n) => n.type.typeId === "compose")!;
  assert.equal((node.state as any).mode, "vec2");
  assert.deepEqual(node.ports, item.ports);
  assert.equal(
    context.network().edges.find((e) => e.from.nodeId === node.id)!.adaptation
      .operation,
    "identity",
  );
  assert.equal(after.revision, before.revision + 1);
  assert(published.length > 0);
  for (const event of published)
    assert.deepEqual(event.document, after.document);
  run("grape.undo");
  assert.deepEqual(s.app.snapshot.document, before.document);
  run("grape.redo");
  assert.deepEqual(s.app.snapshot.document, after.document);
});

test("S06 configured creation rejects invalid missing and non-choice parameters atomically preserving Redo and expired Draft", () => {
  for (const parameters of [{ mode: "bogus" }, { missing: "vec2" }, { x: 1 }]) {
    const s = setup();
    let draft: Draft | undefined;
    s.graph.change("Prior", (d) => {
      draft = d;
      d.add(s.network, nodeRef("float"), [0, 0]);
    });
    s.graph.undo();
    const before = s.graph.capture(),
      history = s.graph.historyLength;
    let events = 0;
    const off = s.graph.subscribe(() => events++);
    assert.throws(
      () =>
        s.graph.change("Invalid choice", (d) =>
          d.add(s.network, nodeRef("compose"), [0, 0], parameters),
        ),
      /PARAMETER_/,
    );
    assert.throws(
      () => draft!.add(s.network, nodeRef("compose"), [0, 0], { mode: "vec2" }),
      /DRAFT_EXPIRED/,
    );
    off();
    assert.deepEqual(s.graph.capture(), before);
    assert.equal(events, 0);
    assert.equal(s.graph.historyLength, history);
    assert.equal(s.graph.canRedo, true);
  }
});

test("S06 configured creation preserves library fork/reference atomicity and rolls back a rejected choice", () => {
  const s = setup();
  s.graph.change("Library fixture", (d) => d.createSubgraph(s.network));
  const document = structuredClone(s.graph.capture().document),
    original = document.graph.resources[0],
    data = asNetwork(original, s.fixed)!;
  data.origin = "library/configured-choice";
  data.local = false;
  const graph = new Graph(document, s.fixed, s.identity),
    before = graph.capture();
  let events = 0;
  const off = graph.subscribe(() => events++);
  assert.throws(
    () =>
      graph.change("Invalid fork", (d) =>
        d.add(data.network.id, nodeRef("compose"), [0, 0], { mode: "bad" }),
      ),
    /PARAMETER_VALUE/,
  );
  assert.deepEqual(graph.capture(), before);
  assert.equal(events, 0);
  graph.change("Valid fork", (d) =>
    d.add(data.network.id, nodeRef("compose"), [0, 0], { mode: "vec2" }),
  );
  off();
  const after = graph.capture();
  assert.equal(events, 1);
  assert(!after.document.graph.resources.some((r) => r.id === original.id));
  assert.deepEqual(document, before.document);
  const local = after.document.graph.resources.find(
    (r) => r.id !== original.id,
  )!;
  const localData = asNetwork(local, s.fixed)!;
  assert.equal(
    localData.network.nodes
      .find((n) => n.type.typeId === "compose")!
      .ports.at(-1)!.type,
    "glsl.vec2",
  );
  assert(
    after.document.graph.stages
      .find((stage) => stage.key === "pixel")!
      .network.nodes.some((n) =>
        n.references.some((r) => r.targetId === local.id),
      ),
  );
  graph.undo();
  assert.deepEqual(graph.capture().document, before.document);
  graph.redo();
  assert.deepEqual(graph.capture().document, after.document);
});

test("S06 configured creation keeps initializer descriptor, owner codec and reference validation before publication", () => {
  for (const failure of ["getter", "codec", "reference"]) {
    const s = setup(),
      pin = {
        moduleId: "test.configured-owner",
        version: "1.0.0",
        fingerprint: "configured-owner-v1",
      };
    let getters = 0;
    const owner = { ...pin, namespace: pin.moduleId, catalogVersion: 1 };
    const ref = { ...pin, typeId: "configured" };
    s.definitions.register({
      manifest: pin,
      presentation: { owner, defaultLocale: "en" },
      nodes: [
        {
          ...composeNode,
          ref,
          presentation: {
            label: { owner, key: "label", fallback: "Configured" },
          },
          initialize: () =>
            failure === "getter"
              ? Object.defineProperty({}, "mode", {
                  enumerable: true,
                  get() {
                    getters++;
                    return "vec4";
                  },
                })
              : { mode: "vec4" },
          stateCodec: {
            ...composeNode.stateCodec,
            validate: (state) =>
              failure === "codec" && (state as any).mode === "vec2"
                ? [
                    {
                      code: "OWNER_REJECTED",
                      severity: "error" as const,
                      message: "Owner rejects this state.",
                    },
                  ]
                : composeNode.stateCodec.validate(state),
          },
          stateReferences:
            failure === "reference"
              ? {
                  collect: () => {
                    throw Error("OWNER_REFERENCE_REJECTED");
                  },
                  remap: (state) => state,
                }
              : undefined,
        },
      ],
    });
    const fixed = s.definitions.pin(s.definitions.pins()),
      graph = Graph.create(imageKind.ref, fixed, s.identity);
    const network = graph
      .capture()
      .document.graph.stages.find((stage) => stage.key === "pixel")!.network.id;
    const before = graph.capture();
    let events = 0;
    const off = graph.subscribe(() => events++);
    assert.throws(
      () =>
        graph.change("Rejected owner", (d) =>
          d.add(
            network,
            ref,
            [0, 0],
            failure === "getter" ? {} : { mode: "vec2" },
          ),
        ),
      failure === "getter"
        ? /JSON_DESCRIPTOR/
        : failure === "codec"
          ? /NODE_STATE/
          : undefined,
    );
    off();
    assert.equal(getters, 0);
    assert.equal(events, 0);
    assert.deepEqual(graph.capture(), before);
    assert.equal(graph.historyLength, 0);
  }
});

test("S06 configured creation followed by failed connection rolls back the full batch", () => {
  const s = setup();
  const before = s.graph.capture();
  let events = 0;
  const off = s.graph.subscribe(() => events++);
  assert.throws(() =>
    s.graph.change("Invalid late edge", (d) => {
      const id = d.add(s.network, nodeRef("compose"), [0, 0], { mode: "vec2" });
      d.connect(
        s.network,
        { nodeId: id, portKey: "result" },
        {
          nodeId: before.document.graph.stages.find(
            (stage) => stage.key === "pixel",
          )!.network.nodes[0].id,
          portKey: "color",
        },
      );
    }),
  );
  off();
  assert.deepEqual(s.graph.capture(), before);
  assert.equal(events, 0);
  assert.equal(s.graph.historyLength, 0);
});
