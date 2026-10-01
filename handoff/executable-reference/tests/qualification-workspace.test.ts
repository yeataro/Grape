import test from "node:test";
import assert from "node:assert/strict";
import { Graph, Registry, Port, canonical } from "../core.ts";
import { builtinModule, refs } from "../nodes.ts";
import { generate, ES300_PROFILE } from "../generator.ts";
import { bindGeneratedDiagnostics } from "../generation-provenance.ts";
import {
  WorkspaceQualification,
  FieldDraftQualification,
  inspectQualificationDocument,
  strictJson,
  ResourceQualification,
  ImportReviewQualification,
  workspaceModule,
  workspaceRefs,
  GraphPacketQualification,
  NestedNetworkEditorQualification,
  SubgraphTransferPolicyQualification,
} from "../qualification-workspace.ts";
import type {
  WorkspaceLayout,
  SubgraphRecord,
} from "../qualification-workspace.ts";
import type { Result, NodeRecord, TypeRef, Json } from "../contracts.ts";
const ok = <T>(r: Result<T>): T => {
  if (!r.ok) throw Error(`${r.error.code}: ${r.error.message}`);
  return r.value;
};
function setup() {
  const registry = new Registry();
  ok(registry.register(builtinModule));
  const graph = new Graph({
    name: "Workspace",
    definitions: registry.pin(),
    outputType: refs.output,
  });
  const s = graph.stage("pixel");
  const nodes = ok(
    graph.change("Fixture", (d) => {
      const a = d.createNode(s.id, refs.constant, { value: 0.25 }, "a"),
        b = d.createNode(s.id, refs.constant, { value: 0.5 }, "b"),
        color = d.createNode(s.id, refs.compose, { mode: "color" }, "color");
      d.connect(
        new Port(graph, a, "output", "out"),
        new Port(graph, color, "input", "r"),
      );
      d.connect(
        new Port(graph, color, "output", "out"),
        s.node("output")!.input("color"),
      );
      return { a, b, color };
    }),
  );
  return { graph, registry, ...nodes };
}
function layout(): WorkspaceLayout {
  return {
    version: 1,
    headerVisible: true,
    tabs: [
      { id: "left", kind: "canvas", linkGroup: 1 },
      { id: "right", kind: "canvas", linkGroup: 2 },
      { id: "global", kind: "parameters", linkGroup: 0 },
      { id: "p1", kind: "parameters", linkGroup: 1 },
      { id: "p2", kind: "parameters", linkGroup: 2 },
    ],
    panes: [
      {
        id: "canvas",
        tabs: ["left", "right"],
        activeTab: "left",
        collapsed: false,
      },
      {
        id: "params",
        tabs: ["global", "p1", "p2"],
        activeTab: "global",
        collapsed: false,
      },
    ],
    root: {
      axis: "row",
      ratio: 0.7,
      first: { paneId: "canvas" },
      second: { paneId: "params" },
    },
    floating: [],
  };
}
function workspace(graph: Graph, other = graph) {
  const w = new WorkspaceQualification();
  ok(w.registerCanvas("left", graph));
  ok(w.registerCanvas("right", other));
  for (const id of ["global", "p1", "p2"])
    ok(w.registerPanel(id, "parameters"));
  ok(w.applyLayout(layout()));
  return w;
}

test("WS01 unplaced canvas/invalid primary cannot partially change selection or graph", () => {
  const { graph, a } = setup(),
    w = new WorkspaceQualification();
  const c = ok(w.registerCanvas("left", graph)),
    before = graph.exportJSON();
  assert.equal(w.select("left", [a]).ok, false);
  assert.deepEqual(c.selection.items, []);
  assert.equal(graph.exportJSON(), before);
  const full = workspace(graph);
  assert.equal(full.select("left", [a], "absent").ok, false);
  assert.deepEqual(full.context("left")!.selection.items, []);
});
test("WS02 linked inspectors follow activated context; two editors share model, not selection/camera", () => {
  const { graph, a, b } = setup(),
    w = workspace(graph);
  const history = graph.history.length;
  ok(w.select("left", [a]));
  ok(w.select("right", [b]));
  assert.equal(w.parameterTarget("global")?.nodeId, b);
  assert.equal(w.parameterTarget("p1")?.nodeId, a);
  assert.equal(w.parameterTarget("p2")?.nodeId, b);
  ok(w.activateCanvas("left"));
  assert.equal(w.parameterTarget("global")?.nodeId, a);
  ok(w.camera("left")!.setCamera({ x: 40, y: -10, zoom: 0.4 }));
  assert.equal(w.camera("right")!.camera.zoom, 1);
  assert.equal(graph.history.length, history);
  ok(w.context("left")!.change("Shared move", (d) => d.move(a, [20, 30])));
  assert.deepEqual(w.context("right")!.graph.nodeById(a)!.position, [20, 30]);
  assert.equal(w.context("right")!.selection.primary, b);
});
test("WS03 pinning and graph projection never expose deleted parameter targets; undo does not invent selection", () => {
  const { graph, a, b } = setup(),
    w = workspace(graph);
  ok(w.select("left", [a]));
  ok(w.select("right", [b]));
  ok(w.pinParameter("global", { contextId: w.context("left")!.id, nodeId: a }));
  assert.equal(w.parameterTarget("global")?.nodeId, a);
  let observed: unknown = "not called";
  graph.subscribe(() => (observed = w.parameterTarget("p1")));
  ok(graph.change("Remove selected", (d) => d.removeNode(a)));
  assert.equal(observed, null);
  assert.equal(w.parameterTarget("global"), null);
  ok(graph.history.undo());
  assert.equal(w.parameterTarget("p1"), null);
  assert.equal(w.parameterTarget("global")?.nodeId, a); // A pin is a logical Ref; ordinary selection is not restored.
});
test("WS04 layout validates unique placement/splits/float slots atomically and returns detached snapshots", () => {
  const { graph } = setup(),
    w = workspace(graph),
    before = canonical(w.layout),
    model = graph.exportJSON(),
    history = graph.history.length;
  const bad = layout();
  bad.panes[1].tabs.push("left");
  assert.equal(w.applyLayout(bad).ok, false);
  assert.equal(canonical(w.layout), before);
  const floats = layout();
  floats.floating = [
    {
      tabId: "global",
      slot: "upper",
      width: 300,
      height: 250,
      collapsed: false,
    },
    { tabId: "p1", slot: "upper", width: 300, height: 250, collapsed: false },
  ];
  assert.equal(w.applyLayout(floats).ok, false);
  const valid = layout();
  valid.headerVisible = false;
  valid.floating = [
    {
      tabId: "global",
      slot: "upper",
      width: 320,
      height: 320,
      collapsed: true,
    },
  ];
  ok(w.applyLayout(valid));
  valid.floating[0].width = 999;
  assert.equal(w.layout!.floating[0].width, 320);
  assert.throws(() => {
    w.layout!.panes[0].tabs.push("rogue");
  });
  assert.equal(graph.exportJSON(), model);
  assert.equal(graph.history.length, history);
});
test("WS05 closing a canvas disposes only its context and collapses layout; open model operation prevents abandonment", () => {
  const { graph } = setup(),
    w = workspace(graph),
    before = canonical(w.layout);
  const op = ok(w.context("right")!.beginOperation("Pending"));
  assert.equal(w.closeCanvas("left").ok, false);
  assert.equal(canonical(w.layout), before);
  ok(op.cancel());
  const model = graph.exportJSON();
  ok(w.closeCanvas("left"));
  assert.equal(w.context("left"), undefined);
  assert.deepEqual(w.layout!.panes[0].tabs, ["right"]);
  assert.equal(w.context("right")!.graph, graph);
  assert.equal(graph.exportJSON(), model);
  ok(w.closeCanvas("right"));
  assert.deepEqual(w.layout!.root, { paneId: "params" });
  assert.ok(graph.stage("pixel").nodes.length);
});
test("WS06 group move creates one model history step; view/layout changes stay outside that step", () => {
  const { graph, a, b } = setup(),
    w = workspace(graph),
    start = graph.history.length,
    op = ok(w.context("left")!.beginOperation("Move group"));
  ok(
    w.context("left")!.change(
      "Preview1",
      (d) => {
        d.move(a, [10, 10]);
        d.move(b, [20, 20]);
      },
      op,
    ),
  );
  ok(
    w.context("left")!.change(
      "Preview2",
      (d) => {
        d.move(a, [30, 30]);
        d.move(b, [40, 40]);
      },
      op,
    ),
  );
  assert.equal(graph.history.length, start);
  ok(op.commit());
  assert.equal(graph.history.length, start + 1);
  ok(w.camera("left")!.setCamera({ x: 55, y: 33, zoom: 0.2 }));
  ok(graph.history.undo());
  assert.deepEqual(graph.nodeById(a)!.position, [0, 0]);
  assert.deepEqual(graph.nodeById(b)!.position, [0, 0]);
  assert.equal(w.camera("left")!.camera.zoom, 0.2);
});
test("WS07 unfinished/IME/invalid text never enters save; unrelated move may coexist, stale value rejects commit", () => {
  const { graph, a } = setup(),
    p = graph.nodeById(a)!.parameter("value"),
    field = new FieldDraftQualification(p),
    before = graph.exportJSON();
  ok(field.setText("1e"));
  field.composition(true);
  assert.equal(field.commit(Number).ok, false);
  field.composition(false);
  assert.equal(field.commit(Number).ok, false);
  assert.equal(field.text, "1e");
  assert.equal(graph.exportJSON(), before);
  ok(field.setText(".75"));
  ok(graph.change("Unrelated position", (d) => d.move(a, [4, 5])));
  ok(field.commit(Number));
  assert.equal(p.read(), 0.75);
  const stale = new FieldDraftQualification(p);
  ok(stale.setText(".8"));
  ok(p.write(0.6));
  const count = graph.history.length;
  assert.equal(stale.commit(Number).ok, false);
  assert.equal(p.read(), 0.6);
  assert.equal(graph.history.length, count);
  stale.cancel();
  assert.equal(stale.setText("2").ok, false);
});
test("WS08 dynamic schema removal invalidates a field handle without writing a neighboring input", () => {
  const { graph, color } = setup(),
    node = graph.nodeById(color)!,
    field = new FieldDraftQualification(node.parameter("b"));
  ok(field.setText(".9"));
  ok(node.parameter("mode").write("pair"));
  const before = graph.exportJSON();
  assert.equal(field.commit(Number).ok, false);
  assert.equal(graph.exportJSON(), before);
  assert.equal(node.parameter("g").read(), 0);
});
test("WS09 code view rejects reversed requests and changed stage/revision instead of painting obsolete code", async () => {
  const { graph, a } = setup(),
    w = workspace(graph);
  let release!: (v: string) => void;
  const first = w.inspect(
    "left",
    () => new Promise<string>((r) => (release = r)),
  );
  const second = await w.inspect(
    "left",
    async (snapshot) => ok(generate(snapshot)).pixel,
  );
  assert.equal(second.ok, true);
  release("old");
  assert.equal((await first).ok, false);
  let next!: (v: string) => void;
  const pending = w.inspect(
    "left",
    () => new Promise<string>((r) => (next = r)),
  );
  ok(graph.change("Move", (d) => d.move(a, [3, 4])));
  next("before change");
  assert.equal((await pending).ok, false);
  let stage!: (v: string) => void;
  const last = w.inspect("left", () => new Promise<string>((r) => (stage = r)));
  ok(w.context("left")!.navigateStage("vertex"));
  stage("pixel");
  assert.equal((await last).ok, false);
});
test("WS10 strict read-only intake rejects duplicate keys/oversize/nonfinite and preserves error documents without executing archive", () => {
  const { graph, registry } = setup(),
    before = graph.exportJSON();
  assert.throws(() => strictJson('{"a":1,"\\u0061":2}'), /Duplicate/);
  assert.throws(() => strictJson('{"n":1e999}'));
  assert.throws(() => strictJson('"12345"', 3), /limit/);
  assert.throws(
    () => strictJson("[".repeat(129) + "0" + "]".repeat(129)),
    /nesting/,
  );
  const document = JSON.parse(before);
  document.archive = { script: "globalThis.executed=true", unknown: [1, 2] };
  const raw = JSON.stringify(document);
  const inspected = ok(inspectQualificationDocument(raw, registry));
  assert.equal(inspected.raw, raw);
  assert.deepEqual(inspected.document.archive, document.archive);
  const missing = ok(inspectQualificationDocument(raw, new Registry()));
  assert.ok(missing.modelErrors > 0);
  assert.deepEqual(missing.document.archive, document.archive);
  assert.equal(graph.exportJSON(), before);
  assert.equal(
    inspectQualificationDocument('{"formatVersion":2}', registry).ok,
    false,
  );
});

function resourceFixture() {
  const registry = new Registry();
  ok(registry.register(builtinModule));
  ok(registry.register(workspaceModule));
  const graph = new Graph({
    name: "Resources",
    definitions: registry.pin(),
    outputType: refs.output,
  });
  return { registry, graph, service: new ResourceQualification(graph) };
}
const uniform = (name: string, value = 0.25) => ({
  kind: "source" as const,
  sourceKind: "uniform" as const,
  name,
  valueType: "float" as const,
  default: value,
});
const recipe = (factor: number, dependencies: string[] = []) => ({
  kind: "subgraph" as const,
  name: "Scale",
  scope: "library" as const,
  origin: { id: "library.scale", version: "1" },
  dependencies,
  body: { kind: "scale" as const, factor },
});
function validColor(graph: Graph) {
  const s = graph.stage("pixel");
  ok(
    graph.change("Valid initial output", (d) => {
      const id = d.createNode(s.id, refs.constant, { value: 1 }, "initial");
      d.connect(
        new Port(graph, id, "output", "out"),
        s.node("output")!.input("color"),
      );
    }),
  );
}

test("WS11 two source nodes share Graph resource; default/name changes neither overwrite host live values nor rewrite uniform symbols", () => {
  const { graph, service } = resourceFixture();
  ok(service.createSource("uniform-id", uniform("amount")));
  const pixel = graph.stage("pixel");
  const { a, b } = ok(
    graph.change("Two references", (d) => {
      const a = d.createNode(
          pixel.id,
          workspaceRefs.source,
          { resourceId: "uniform-id" },
          "a",
        ),
        b = d.createNode(
          pixel.id,
          workspaceRefs.source,
          { resourceId: "uniform-id" },
          "b",
        ),
        multiply = d.createNode(pixel.id, refs.multiply, {}, "multiply");
      d.connect(
        new Port(graph, a, "output", "out"),
        new Port(graph, multiply, "input", "a"),
      );
      d.connect(
        new Port(graph, b, "output", "out"),
        new Port(graph, multiply, "input", "b"),
      );
      d.connect(
        new Port(graph, multiply, "output", "out"),
        pixel.node("output")!.input("color"),
      );
      return { a, b };
    }),
  );
  const code = ok(generate(graph.snapshot())).pixel,
    hostLive = new Map([["uniform-id", 0.9]]);
  assert.equal((code.match(/uniform float/g) || []).length, 1);
  ok(service.setDefault("uniform-id", 0.5));
  ok(service.renameSource("uniform-id", "renamed"));
  assert.equal(ok(generate(graph.snapshot())).pixel, code);
  assert.equal(hostLive.get("uniform-id"), 0.9);
  assert.equal(
    graph.nodeById(a)!.record.references.source.targetId,
    graph.nodeById(b)!.record.references.source.targetId,
  );
  assert.equal(
    graph.nodeById(a)!.record.state &&
      Object.keys(graph.nodeById(a)!.record.state as object).length,
    0,
  );
  const before = graph.exportJSON();
  assert.equal(service.createSource("second", uniform("renamed")).ok, false);
  assert.equal(service.setDefault("uniform-id", Infinity).ok, false);
  assert.equal(graph.exportJSON(), before);
});

test("WS12 source deletion leaves diagnostic reference, Undo recovers code, retarget is shared-history mutation", () => {
  const { graph, service, registry } = resourceFixture();
  ok(service.createSource("u", uniform("first")));
  ok(service.createSource("v", uniform("second")));
  const pixel = graph.stage("pixel"),
    id = ok(
      graph.change("Reference", (d) => {
        const id = d.createNode(
          pixel.id,
          workspaceRefs.source,
          { resourceId: "u" },
          "source",
        );
        d.connect(
          new Port(graph, id, "output", "out"),
          pixel.node("output")!.input("color"),
        );
        return id;
      }),
    );
  const code = ok(generate(graph.snapshot())).pixel;
  ok(service.removeSource("u"));
  assert.ok(graph.diagnostics.some((d) => d.severity === "error"));
  assert.equal(generate(graph.snapshot()).ok, false);
  assert.equal(graph.nodeById(id)!.record.references.source.targetId, "u");
  const saved = graph.exportJSON(),
    loaded = ok(Graph.load(saved, registry));
  assert.equal(loaded.nodeById(id)!.record.references.source.targetId, "u");
  assert.equal(generate(loaded.snapshot()).ok, false);
  ok(graph.history.undo());
  assert.equal(ok(generate(graph.snapshot())).pixel, code);
  ok(service.retargetSource(id, "v"));
  assert.equal(graph.nodeById(id)!.record.references.source.targetId, "v");
  ok(graph.history.undo());
  assert.equal(graph.nodeById(id)!.record.references.source.targetId, "u");
});

test("WS13 constant resource affects shader while uniform default does not; missing modules preserve payload and references", () => {
  const { graph, service } = resourceFixture();
  ok(
    service.createSource("c", {
      ...uniform("constant"),
      sourceKind: "constant",
    }),
  );
  const pixel = graph.stage("pixel"),
    id = ok(
      graph.change("Constant source", (d) => {
        const id = d.createNode(
          pixel.id,
          workspaceRefs.source,
          { resourceId: "c" },
          "c",
        );
        d.connect(
          new Port(graph, id, "output", "out"),
          pixel.node("output")!.input("color"),
        );
        return id;
      }),
    );
  const code = ok(generate(graph.snapshot())).pixel;
  ok(service.setDefault("c", 0.75));
  assert.notEqual(ok(generate(graph.snapshot())).pixel, code);
  const raw = graph.exportJSON(),
    missing = ok(Graph.load(raw, new Registry()));
  assert.deepEqual(
    missing.snapshot().document.resources,
    graph.snapshot().document.resources,
  );
  assert.equal(missing.nodeById(id)!.record.references.source.targetId, "c");
  assert.equal(generate(missing.snapshot()).ok, false);
  assert.equal(missing.exportJSON(), raw);
});

test("WS14 subgraph shared edit and independent direct clone preserve nested dependency identity and one model history", () => {
  const { graph, service, registry } = resourceFixture();
  ok(service.createSubgraph("inner", recipe(2)));
  ok(service.createSubgraph("outer", recipe(3, ["inner"])));
  const pixel = graph.stage("pixel"),
    { a, b } = ok(
      graph.change("Shared subgraph calls", (d) => {
        const a = d.createNode(
            pixel.id,
            workspaceRefs.subgraph,
            { resourceId: "outer" },
            "a",
          ),
          b = d.createNode(
            pixel.id,
            workspaceRefs.subgraph,
            { resourceId: "outer" },
            "b",
          );
        d.connect(
          new Port(graph, a, "output", "out"),
          new Port(graph, b, "input", "in"),
        );
        d.connect(
          new Port(graph, b, "output", "out"),
          pixel.node("output")!.input("color"),
        );
        return { a, b };
      }),
    );
  const before = ok(generate(graph.snapshot())).pixel;
  ok(service.editSubgraph("outer", 4));
  const changed = ok(generate(graph.snapshot())).pixel;
  assert.notEqual(changed, before);
  assert.equal((service.read("outer") as any).scope, "local");
  const count = graph.history.length;
  ok(service.independent(a, "independent"));
  assert.equal(graph.history.length, count + 1);
  assert.equal(
    graph.nodeById(a)!.record.references.subgraph.targetId,
    "independent",
  );
  assert.equal(graph.nodeById(b)!.record.references.subgraph.targetId, "outer");
  assert.deepEqual((service.read("independent") as any).dependencies, [
    "inner",
  ]);
  ok(service.editSubgraph("independent", 5));
  assert.equal((service.read("outer") as any).body.factor, 4);
  assert.notEqual(ok(generate(graph.snapshot())).pixel, changed);
  const reloaded = ok(Graph.load(graph.exportJSON(), registry));
  assert.equal(
    reloaded.nodeById(a)!.record.references.subgraph.targetId,
    "independent",
  );
  assert.deepEqual(
    reloaded.snapshot().document.resources,
    graph.snapshot().document.resources,
  );
  ok(graph.history.undo());
  ok(graph.history.undo());
  assert.equal(service.read("independent"), undefined);
  assert.equal(graph.nodeById(a)!.record.references.subgraph.targetId, "outer");
  assert.equal(ok(generate(graph.snapshot())).pixel, changed);
});

test("WS15 dependency cycle, unknown dependency and duplicate resource IDs fail before publishing or changing history", () => {
  const { graph, service } = resourceFixture();
  ok(service.createSubgraph("a", recipe(1)));
  ok(service.createSubgraph("b", recipe(2, ["a"])));
  const before = graph.exportJSON(),
    history = graph.history.length;
  let events = 0;
  graph.subscribe(() => events++);
  assert.equal(service.editSubgraph("a", 3, ["b"]).ok, false);
  assert.equal(service.createSubgraph("c", recipe(2, ["missing"])).ok, false);
  assert.equal(service.createSubgraph("a", recipe(4)).ok, false);
  assert.equal(events, 0);
  assert.equal(graph.history.length, history);
  assert.equal(graph.exportJSON(), before);
});

test("WS16 read-only import review is stale guarded; acceptance replaces same Graph atomically and undo restores whole document", () => {
  const { graph, registry, a } = setup(),
    w = workspace(graph),
    before = graph.exportJSON(),
    document = JSON.parse(before);
  document.id = "foreign-graph";
  document.name = "Imported";
  document.archive = { opaque: "untouched" };
  document.stages
    .find((s: any) => s.kind === "pixel")
    .nodes.find((n: any) => n.id === a).position = [50, 60];
  const review = new ImportReviewQualification(
      graph,
      JSON.stringify(document),
      registry,
    ),
    id = graph.id,
    loadId = graph.loadId,
    count = graph.history.length;
  assert.equal(graph.exportJSON(), before);
  ok(review.accept());
  assert.equal(graph.id, id);
  assert.equal(graph.loadId, loadId);
  assert.equal(w.context("left")!.graph, graph);
  assert.equal(w.context("right")!.graph, graph);
  assert.deepEqual(graph.nodeById(a)!.position, [50, 60]);
  assert.equal(graph.history.length, count + 1);
  assert.equal(review.accept().ok, false);
  ok(graph.history.undo());
  assert.equal(graph.exportJSON(), before);
  ok(graph.history.redo());
  assert.equal(graph.snapshot().document.name, "Imported");
  const stale = new ImportReviewQualification(
    graph,
    JSON.stringify(document),
    registry,
  );
  ok(graph.change("Intervening move", (d) => d.move(a, [80, 80])));
  const now = graph.exportJSON();
  assert.equal(stale.accept().ok, false);
  assert.equal(graph.exportJSON(), now);
});

test("WS17 import cancellation, pin mismatch and model error preserve current graph and history", () => {
  const { graph, registry } = setup(),
    before = graph.exportJSON(),
    count = graph.history.length,
    cancel = new ImportReviewQualification(graph, before, registry);
  cancel.cancel();
  assert.equal(cancel.accept().ok, false);
  const malformed = JSON.parse(before);
  malformed.definitions = [];
  assert.throws(
    () =>
      new ImportReviewQualification(graph, JSON.stringify(malformed), registry),
    /DefinitionSet/,
  );
  ok(registry.register(workspaceModule));
  const bad = JSON.parse(before);
  bad.definitions = registry.pin().refs;
  bad.modules = registry.pin().modules;
  const review = new ImportReviewQualification(
    graph,
    JSON.stringify(bad),
    registry,
  );
  assert.equal(review.accept().ok, false);
  const errors = new ImportReviewQualification(graph, before, new Registry());
  assert.equal(errors.accept().ok, false);
  assert.equal(graph.exportJSON(), before);
  assert.equal(graph.history.length, count);
});

test("WS18 visual metadata is persistent and undoable without changing generated code; editor-only camera stays independent", () => {
  const { graph, a, registry } = setup(),
    w = workspace(graph),
    before = ok(generate(graph.snapshot())).pixel;
  ok(
    graph.change("Visual metadata", (d) => {
      d.setMetadata(a, "label", "Visible label");
      d.setMetadata(a, "notes", { markdown: "Notes", size: [200, 100] });
      d.setMetadata(null, "frames", [
        { id: "frame1", nodes: [a], title: "Group" },
      ]);
    }),
  );
  assert.equal(ok(generate(graph.snapshot())).pixel, before);
  const raw = graph.exportJSON(),
    loaded = ok(Graph.load(raw, registry));
  assert.deepEqual(
    loaded.nodeById(a)!.record.uiMetadata,
    graph.nodeById(a)!.record.uiMetadata,
  );
  ok(w.camera("left")!.setCamera({ x: 1, y: 2, zoom: 0.5 }));
  ok(graph.history.undo());
  assert.equal(graph.nodeById(a)!.record.uiMetadata, undefined);
  assert.equal(w.camera("left")!.camera.zoom, 0.5);
});

function innerNode(
  id: string,
  typeRef: TypeRef,
  state: Json = {},
  references: NodeRecord["references"] = {},
): NodeRecord {
  return {
    id,
    name: id,
    typeRef,
    state,
    references,
    referencesComplete: true,
    ports: [],
    values: {},
    position: [0, 0],
  };
}
function networkRecipe(id: string, child?: string): SubgraphRecord {
  const nodes = [
    innerNode(
      "input",
      workspaceRefs.networkInput,
      {},
      { subgraph: { kind: "resource", targetId: id } },
    ),
    innerNode("constant", refs.constant, { value: 2 }),
    innerNode("multiply", refs.multiply),
  ];
  const edges = [
    {
      from: { nodeId: "input", key: "value" },
      to: { nodeId: "multiply", key: "a" },
    },
    {
      from: { nodeId: "constant", key: "out" },
      to: { nodeId: "multiply", key: "b" },
    },
  ];
  let endpoint = { nodeId: "multiply", key: "out" };
  if (child) {
    nodes.push(
      innerNode(
        "nested",
        workspaceRefs.subgraph,
        {},
        { subgraph: { kind: "resource", targetId: child } },
      ),
    );
    edges.push({ from: endpoint, to: { nodeId: "nested", key: "value" } });
    endpoint = { nodeId: "nested", key: "result" };
  }
  return {
    ...recipe(1, child ? [child] : []),
    body: {
      kind: "network",
      ports: [
        {
          key: "value",
          direction: "input",
          type: "float",
          supply: "local",
          default: 1,
        },
        { key: "result", direction: "output", type: "float" },
      ],
      nodes,
      edges,
      outputs: { result: endpoint },
    },
  };
}

test("WS19 nested Network reuses pinned math/source modules, interface boundaries and distinct call-occurrence symbols", () => {
  const { graph, service, registry } = resourceFixture();
  ok(service.createSubgraph("inner", networkRecipe("inner")));
  ok(service.createSubgraph("outer", networkRecipe("outer", "inner")));
  const pixel = graph.stage("pixel");
  const { a, b } = ok(
    graph.change("Two nested calls", (d) => {
      const a = d.createNode(
          pixel.id,
          workspaceRefs.subgraph,
          { resourceId: "outer" },
          "a",
        ),
        b = d.createNode(
          pixel.id,
          workspaceRefs.subgraph,
          { resourceId: "outer" },
          "b",
        );
      d.connect(
        new Port(graph, a, "output", "result"),
        new Port(graph, b, "input", "value"),
      );
      d.connect(
        new Port(graph, b, "output", "result"),
        pixel.node("output")!.input("color"),
      );
      return { a, b };
    }),
  );
  const code = ok(generate(graph.snapshot())).pixel;
  const locals = code.match(/float (l_[A-Za-z0-9_]+) =/g) ?? [];
  assert.ok(locals.length >= 4);
  assert.equal(new Set(locals).size, locals.length);
  assert.deepEqual(
    graph.nodeById(a)!.record.ports.map((p) => p.key),
    ["value", "result"],
  );
  const resource = structuredClone(
    service.read("inner"),
  ) as unknown as SubgraphRecord;
  assert.equal(resource.body.kind, "network");
  if (resource.body.kind !== "network") throw Error();
  resource.body.nodes.find((n) => n.id === "constant")!.state = { value: 3 };
  ok(service.editNetwork("inner", resource.body, []));
  assert.notEqual(ok(generate(graph.snapshot())).pixel, code);
  assert.equal(
    graph.nodeById(a)!.record.references.subgraph.targetId,
    graph.nodeById(b)!.record.references.subgraph.targetId,
  );
  const loaded = ok(Graph.load(graph.exportJSON(), registry));
  assert.equal(
    ok(generate(loaded.snapshot())).pixel,
    ok(generate(graph.snapshot())).pixel,
  );
  ok(graph.history.undo());
  assert.equal(ok(generate(graph.snapshot())).pixel, code);
});

test("WS20 network rejects cycles/missing refs/unreachable invalid modules and duplicate wiring atomically", () => {
  const { graph, service } = resourceFixture();
  ok(service.createSubgraph("inner", networkRecipe("inner")));
  const history = graph.history.length,
    before = graph.exportJSON(),
    bad = networkRecipe("bad");
  if (bad.body.kind !== "network") throw Error();
  bad.body.edges.push({
    from: { nodeId: "multiply", key: "out" },
    to: { nodeId: "multiply", key: "a" },
  });
  assert.equal(service.createSubgraph("bad", bad).ok, false);
  const cycle = networkRecipe("cycle", "cycle");
  assert.equal(service.createSubgraph("cycle", cycle).ok, false);
  const missing = networkRecipe("missing", "not-present");
  assert.equal(service.createSubgraph("missing", missing).ok, false);
  const unused = networkRecipe("unused");
  if (unused.body.kind !== "network") throw Error();
  unused.body.nodes.push(
    innerNode("invalid", {
      moduleId: "missing",
      typeId: "unknown",
      version: "1",
      fingerprint: "missing",
    }),
  );
  assert.equal(service.createSubgraph("unused", unused).ok, false);
  assert.equal(graph.exportJSON(), before);
  assert.equal(graph.history.length, history);
});

test("WS21 network interface changes update every caller by stable port key, retain loss evidence, undo restores exact edges", () => {
  const { graph, service } = resourceFixture();
  ok(service.createSubgraph("inner", networkRecipe("inner")));
  const pixel = graph.stage("pixel"),
    { a, b } = ok(
      graph.change("Calls", (d) => {
        const a = d.createNode(
            pixel.id,
            workspaceRefs.subgraph,
            { resourceId: "inner" },
            "a",
          ),
          b = d.createNode(
            pixel.id,
            workspaceRefs.subgraph,
            { resourceId: "inner" },
            "b",
          );
        d.connect(
          new Port(graph, a, "output", "result"),
          new Port(graph, b, "input", "value"),
        );
        d.connect(
          new Port(graph, b, "output", "result"),
          pixel.node("output")!.input("color"),
        );
        return { a, b };
      }),
    );
  const before = graph.exportJSON(),
    next = structuredClone(service.read("inner")) as unknown as SubgraphRecord;
  if (next.body.kind !== "network") throw Error();
  next.body.ports[0].key = "renamed";
  next.body.edges[0].from.key = "renamed";
  ok(service.editNetwork("inner", next.body, []));
  assert.equal(graph.nodeById(a)!.record.ports[0].key, "renamed");
  assert.equal(graph.nodeById(b)!.record.ports[0].key, "renamed");
  assert.ok(
    graph.snapshot().document.losses.some((l) => l.edge?.to.nodeId === b),
  );
  ok(graph.history.undo());
  assert.equal(graph.exportJSON(), before);
});

test("WS22 independent nested network rewrites own boundary but shares nested dependency; library fork rewrites all affected callers atomically", () => {
  const { graph, service } = resourceFixture();
  ok(service.createSubgraph("inner", networkRecipe("inner")));
  ok(service.createSubgraph("outer", networkRecipe("outer", "inner")));
  const pixel = graph.stage("pixel"),
    { a, b } = ok(
      graph.change("Calls", (d) => {
        const a = d.createNode(
            pixel.id,
            workspaceRefs.subgraph,
            { resourceId: "outer" },
            "a",
          ),
          b = d.createNode(
            pixel.id,
            workspaceRefs.subgraph,
            { resourceId: "outer" },
            "b",
          );
        d.connect(
          new Port(graph, a, "output", "result"),
          new Port(graph, b, "input", "value"),
        );
        d.connect(
          new Port(graph, b, "output", "result"),
          pixel.node("output")!.input("color"),
        );
        return { a, b };
      }),
    );
  ok(service.independent(a, "fork"));
  assert.deepEqual((service.read("fork") as any).dependencies, ["inner"]);
  assert.equal(
    (service.read("fork") as any).body.nodes.find((n: any) => n.id === "input")
      .references.subgraph.targetId,
    "fork",
  );
  assert.equal(generate(graph.snapshot()).ok, true);
  const before = graph.exportJSON(),
    count = graph.history.length,
    updated = structuredClone(
      service.read("inner"),
    ) as unknown as SubgraphRecord;
  if (updated.body.kind !== "network") throw Error();
  updated.body.nodes.find((n) => n.id === "constant")!.state = { value: 9 };
  const newId = ok(service.forkLibraryDefinition("inner", updated));
  assert.notEqual(newId, "inner");
  assert.equal(service.read("inner"), undefined);
  assert.equal(service.read("outer"), undefined);
  assert.equal((service.read(newId) as any).origin.id, "library.scale");
  assert.equal(graph.history.length, count + 1);
  assert.deepEqual((service.read("fork") as any).dependencies, [newId]);
  assert.equal(graph.nodeById(a)!.record.references.subgraph.targetId, "fork");
  assert.notEqual(
    graph.nodeById(b)!.record.references.subgraph.targetId,
    "outer",
  );
  assert.equal(generate(graph.snapshot()).ok, true);
  ok(graph.history.undo());
  assert.equal(graph.exportJSON(), before);
});

test("WS23 loaded invalid unused resource reports error and blocks generation without dropping opaque payload", () => {
  const { graph, registry } = resourceFixture(),
    doc = graph.snapshot().document;
  const candidate = structuredClone(doc);
  candidate.resources.push({
    id: "bad",
    data: {
      kind: "source",
      sourceKind: "constant",
      name: "bad",
      valueType: "float",
      default: "invalid",
    },
  });
  const raw = JSON.stringify(candidate),
    loaded = ok(Graph.load(raw, registry));
  assert.ok(loaded.diagnostics.some((issue) => issue.severity === "error"));
  assert.equal(generate(loaded.snapshot()).ok, false);
  assert.deepEqual(loaded.snapshot().document.resources, candidate.resources);
});

test("WS24 same-graph packet reuses existing resource without resetting latest defaults; cross-graph paste remaps nested closure and undo removes all copies", () => {
  const { graph, service } = resourceFixture();
  ok(service.createSource("u", uniform("amount")));
  ok(service.createSubgraph("inner", networkRecipe("inner")));
  ok(service.createSubgraph("outer", networkRecipe("outer", "inner")));
  const stage = graph.stage("pixel"),
    { source, call } = ok(
      graph.change("Copy graph", (d) => {
        const source = d.createNode(
            stage.id,
            workspaceRefs.source,
            { resourceId: "u" },
            "source",
          ),
          call = d.createNode(
            stage.id,
            workspaceRefs.subgraph,
            { resourceId: "outer" },
            "call",
          );
        d.connect(
          new Port(graph, source, "output", "out"),
          new Port(graph, call, "input", "value"),
        );
        d.connect(
          new Port(graph, call, "output", "result"),
          stage.node("output")!.input("color"),
        );
        return { source, call };
      }),
    );
  const packets = new GraphPacketQualification(graph),
    packet = ok(packets.export(stage.id, [source, call]));
  assert.equal(packet.edges.length, 1);
  assert.equal(packet.resources.length, 3);
  ok(service.setDefault("u", 0.8));
  const pasted = ok(packets.paste(packet, stage.id));
  assert.equal(
    graph.nodeById(pasted[0])!.record.references.source.targetId,
    "u",
  );
  assert.equal((service.read("u") as any).default, 0.8);
  const other = resourceFixture();
  validColor(other.graph);
  ok(other.service.createSource("u", uniform("amount", 0.9)));
  const before = other.graph.exportJSON(),
    count = other.graph.history.length,
    newIds = ok(
      new GraphPacketQualification(other.graph).paste(
        packet,
        other.graph.stage("pixel").id,
      ),
    );
  assert.equal(other.graph.history.length, count + 1);
  const newSourceId = other.graph.nodeById(newIds[0])!.record.references.source
      .targetId,
    newOuterId = other.graph.nodeById(newIds[1])!.record.references.subgraph
      .targetId;
  assert.notEqual(newSourceId, "u");
  assert.equal((other.service.read("u") as any).default, 0.9);
  assert.equal((other.service.read(newSourceId) as any).name, "amount1");
  const newOuter = other.service.read(newOuterId) as any;
  assert.notEqual(newOuter.dependencies[0], "inner");
  assert.equal(
    newOuter.body.nodes.find((n: any) => n.id === "input").references.subgraph
      .targetId,
    newOuterId,
  );
  assert.equal(
    newOuter.body.nodes.find((n: any) => n.id === "nested").references.subgraph
      .targetId,
    newOuter.dependencies[0],
  );
  ok(other.graph.history.undo());
  assert.equal(other.graph.exportJSON(), before);
});

test("WS25 paste late invalid edge rolls back inserted resource and nodes, opaque reference state and stale load are refused", () => {
  const from = resourceFixture();
  ok(from.service.createSource("u", uniform("a")));
  const stage = from.graph.stage("pixel"),
    id = ok(
      from.graph.change("Source", (d) =>
        d.createNode(
          stage.id,
          workspaceRefs.source,
          { resourceId: "u" },
          "source",
        ),
      ),
    ),
    packet = ok(
      new GraphPacketQualification(from.graph).export(stage.id, [id]),
    ),
    to = resourceFixture(),
    service = new GraphPacketQualification(to.graph),
    bad = structuredClone(packet);
  bad.edges.push({
    from: { nodeId: id, key: "out" },
    to: { nodeId: id, key: "missing" },
  });
  const before = to.graph.exportJSON(),
    count = to.graph.history.length;
  assert.equal(service.paste(bad, to.graph.stage("pixel").id).ok, false);
  assert.equal(to.graph.exportJSON(), before);
  assert.equal(to.graph.history.length, count);
  assert.equal(
    service.paste(packet, to.graph.stage("pixel").id, "old-load").ok,
    false,
  );
  const opaque = structuredClone(packet);
  opaque.nodes[0].referencesComplete = false;
  assert.equal(service.paste(opaque, to.graph.stage("pixel").id).ok, false);
  assert.equal(to.graph.exportJSON(), before);
});

test("WS26 module state codec remaps nominal type and symbolic extent only; notes containing same text remain untouched", () => {
  const ref = {
    moduleId: "test.typed-state",
    version: "1",
    fingerprint: "typed-state-v1",
    typeId: "value",
  };
  const module = {
    manifest: {
      id: ref.moduleId,
      version: ref.version,
      fingerprint: ref.fingerprint,
      coreApiVersion: 1 as const,
      dependencies: [],
      source: "test",
      license: "test",
    },
    types: [
      {
        ref,
        role: "operation" as const,
        stages: ["pixel" as const],
        stateCodec: { schemaVersion: 1, validate: () => [] },
        stateReferences: {
          collect: (s: Json) => [(s as any).nominal, (s as any).extent],
          remap: (s: Json, map: (id: string) => string) => ({
            ...(s as object),
            nominal: map((s as any).nominal),
            extent: map((s as any).extent),
          }),
        },
        initialize: (s: Json) => ({ state: s }),
        ports: (s: Json) => [
          {
            key: "out",
            direction: "output" as const,
            type: `@${(s as any).nominal}[#${(s as any).extent}]`,
          },
        ],
        parameters: () => [],
        validate: () => [],
        emit: () => ({ outputs: {} }),
      },
    ],
  };
  const create = () => {
      const registry = new Registry();
      ok(registry.register(builtinModule));
      ok(registry.register(module));
      return new Graph({
        name: "Typed copy",
        definitions: registry.pin(),
        outputType: refs.output,
      });
    },
    from = create();
  const id = ok(
    from.change("Typed resource and node", (d) => {
      d.putResource("shape", {
        kind: "dataType",
        type: { kind: "struct", fields: [{ key: "v", type: "float" }] },
      });
      d.putResource("extent", { kind: "arrayExtent", length: 2 });
      return d.createNode(
        from.stage("pixel").id,
        ref,
        {
          nominal: "shape",
          extent: "extent",
          comment: "shape extent @shape[#extent]",
        },
        "typed",
      );
    }),
  );
  const packet = ok(
    new GraphPacketQualification(from).export(from.stage("pixel").id, [id]),
  );
  assert.equal(packet.resources.length, 2);
  const to = create();
  validColor(to);
  const newId = ok(
      new GraphPacketQualification(to).paste(packet, to.stage("pixel").id),
    )[0],
    record = to.nodeById(newId)!.record;
  assert.notEqual((record.state as any).nominal, "shape");
  assert.notEqual((record.state as any).extent, "extent");
  assert.equal((record.state as any).comment, "shape extent @shape[#extent]");
  assert.equal(
    record.ports[0].type,
    `@${(record.state as any).nominal}[#${(record.state as any).extent}]`,
  );
});

test("WS27 malformed unused packet resource cannot publish an error graph; large integral float uses shared literal formatter", () => {
  const from = resourceFixture();
  ok(
    from.service.createSource("u", {
      ...uniform("constant", 1e21),
      sourceKind: "constant",
    }),
  );
  const s = from.graph.stage("pixel"),
    id = ok(
      from.graph.change("Source", (d) => {
        const id = d.createNode(
          s.id,
          workspaceRefs.source,
          { resourceId: "u" },
          "source",
        );
        d.connect(
          new Port(from.graph, id, "output", "out"),
          s.node("output")!.input("color"),
        );
        return id;
      }),
    );
  assert.doesNotMatch(ok(generate(from.graph.snapshot())).pixel, /1e\+21\.0/);
  const packet = structuredClone(
    ok(new GraphPacketQualification(from.graph).export(s.id, [id])),
  );
  packet.resources.push({
    id: "invalid-unused",
    data: { kind: "arrayExtent", length: -2 },
  });
  const to = resourceFixture(),
    before = to.graph.exportJSON();
  let events = 0;
  to.graph.subscribe(() => events++);
  assert.equal(
    new GraphPacketQualification(to.graph).paste(
      packet,
      to.graph.stage("pixel").id,
    ).ok,
    false,
  );
  assert.equal(to.graph.exportJSON(), before);
  assert.equal(events, 0);
});

test("WS28 typed selection supports node/edge/frame/resource identities with independent contexts and legacy node projection", () => {
  const { graph, a, b } = setup(),
    w = workspace(graph),
    stage = graph.stage("pixel"),
    edge = stage.record.edges[0];
  ok(
    graph.change("Selectable objects", (d) => {
      d.putResource("source", { kind: "opaque-test" });
      d.setMetadata(null, "frames", [
        { id: "frame", stageId: stage.id, nodes: [a] },
      ]);
    }),
  );
  const history = graph.history.length;
  ok(w.select("left", [a]));
  ok(
    w.selectObjects(
      "right",
      [
        { kind: "node", id: b },
        { kind: "edge", id: edge.id },
        { kind: "frame", id: "frame" },
        { kind: "resource", id: "source" },
      ],
      { kind: "edge", id: edge.id },
    ),
  );
  assert.equal(w.context("right")!.selection.primary, b);
  assert.equal(w.context("right")!.objectSelection.primary?.kind, "edge");
  assert.deepEqual(w.parameterObjectTarget("p2")!.object, {
    kind: "edge",
    id: edge.id,
  });
  assert.equal(w.parameterTarget("p2"), null);
  assert.equal(w.parameterTarget("p1")?.nodeId, a);
  assert.equal(graph.history.length, history);
  const before = w.context("right")!.objectSelection;
  assert.equal(
    w.selectObjects("right", [
      { kind: "node", id: b },
      { kind: "node", id: b },
    ]).ok,
    false,
  );
  assert.deepEqual(w.context("right")!.objectSelection, before);
  assert.equal(
    w.selectObjects("right", [{ kind: "frame", id: "absent" }]).ok,
    false,
  );
  assert.deepEqual(w.context("right")!.objectSelection, before);
});

test("WS29 typed selection invalidates synchronously before ordinary observers; Undo never resurrects UI selection and stage navigation clears refs", () => {
  const { graph, a } = setup(),
    w = workspace(graph),
    stage = graph.stage("pixel"),
    edge = stage.record.edges[0];
  ok(
    graph.change("Selectables", (d) => {
      d.putResource("source", { kind: "opaque-test" });
      d.setMetadata(null, "frames", [
        { id: "frame", stageId: stage.id, nodes: [a] },
      ]);
    }),
  );
  ok(
    w.selectObjects("left", [
      { kind: "edge", id: edge.id },
      { kind: "frame", id: "frame" },
      { kind: "resource", id: "source" },
    ]),
  );
  let observed: unknown;
  graph.subscribe(() => (observed = w.context("left")!.objectSelection.items));
  ok(
    graph.change("Delete selected objects", (d) => {
      d.disconnect(edge.id);
      d.removeResource("source");
      d.setMetadata(null, "frames", []);
    }),
  );
  assert.deepEqual(observed, []);
  assert.equal(w.parameterObjectTarget("p1"), null);
  ok(graph.history.undo());
  assert.deepEqual(w.context("left")!.objectSelection.items, []);
  ok(w.selectObjects("left", [{ kind: "frame", id: "frame" }]));
  ok(w.context("left")!.navigateStage("vertex"));
  assert.deepEqual(w.context("left")!.objectSelection.items, []);
  assert.equal(
    w.context("left")!.selectObjects([{ kind: "frame", id: "frame" }]).ok,
    false,
  );
});

test("WS30 loaded duplicate source names are diagnosed even when neither source has a reference node", () => {
  const { graph, service, registry } = resourceFixture();
  validColor(graph);
  ok(service.createSource("first", uniform("amount")));
  const document = structuredClone(graph.snapshot().document);
  document.resources.push({ id: "second", data: uniform("amount", 0.9) });
  const loaded = ok(Graph.load(JSON.stringify(document), registry));
  assert.ok(
    loaded.diagnostics.some(
      (issue) =>
        issue.code === "RESOURCE_VALIDATION" && /unique/i.test(issue.message),
    ),
  );
  assert.equal(generate(loaded.snapshot()).ok, false);
  assert.equal(loaded.snapshot().document.resources.length, 2);
  ok(new ResourceQualification(loaded).renameSource("second", "other"));
  assert.equal(
    loaded.diagnostics.some((issue) => issue.severity === "error"),
    false,
  );
  assert.equal(generate(loaded.snapshot()).ok, true);
});

function nestedEditorFixture() {
  const base = resourceFixture();
  ok(base.service.createSubgraph("inner", networkRecipe("inner")));
  ok(base.service.createSubgraph("outer", networkRecipe("outer", "inner")));
  const stage = base.graph.stage("pixel");
  const { a, b } = ok(
    base.graph.change("Shared nested occurrences", (d) => {
      const a = d.createNode(
        stage.id,
        workspaceRefs.subgraph,
        { resourceId: "outer" },
        "a",
      );
      const b = d.createNode(
        stage.id,
        workspaceRefs.subgraph,
        { resourceId: "outer" },
        "b",
      );
      d.connectEndpoints(
        { nodeId: a, key: "result" },
        { nodeId: b, key: "value" },
      );
      d.connectEndpoints(
        { nodeId: b, key: "result" },
        { nodeId: stage.node("output")!.id, key: "color" },
      );
      return { a, b };
    }),
  );
  const w = workspace(base.graph),
    left = new NestedNetworkEditorQualification(w.context("left")!),
    right = new NestedNetworkEditorQualification(w.context("right")!);
  return { ...base, a, b, w, left, right };
}

test("WS31 nested occurrence navigation keeps two contexts independent and scoped parameters edit the single Graph with one library fork Undo", () => {
  const { graph, a, b, w, left, right } = nestedEditorFixture(),
    before = graph.exportJSON(),
    history = graph.history.length,
    code = ok(generate(graph.snapshot())).pixel;
  ok(left.enter(a));
  ok(left.enter("nested"));
  ok(right.enter(b));
  ok(right.enter("nested"));
  ok(w.select("left", ["constant"]));
  ok(w.select("right", ["multiply"]));
  assert.deepEqual(left.breadcrumbs, [a, "nested"]);
  assert.deepEqual(right.breadcrumbs, [b, "nested"]);
  assert.notEqual(
    left.context.activeNetwork.id,
    right.context.activeNetwork.id,
  );
  assert.equal(left.inspectPath().resourceId, right.inspectPath().resourceId);
  assert.equal(graph.history.length, history);
  assert.equal(graph.exportJSON(), before);
  const handle = ok(w.parameterEditor("p1", "value")),
    oldOther = right.parameter("constant", "value");
  assert.deepEqual(w.parameterTarget("p1")!.networkPath, [a, "nested"]);
  const draft = new FieldDraftQualification(handle);
  ok(draft.setText("5"));
  ok(draft.commit(Number));
  assert.equal(handle.read(), 5);
  assert.equal(right.parameter("constant", "value").read(), 5);
  assert.equal(oldOther.write(7).ok, false); // first edit retargeted both calls to a local definition
  assert.equal(graph.history.length, history + 1);
  assert.notEqual(ok(generate(graph.snapshot())).pixel, code);
  assert.equal(left.context.graph, graph);
  assert.equal(right.context.graph, graph);
  assert.deepEqual(left.context.selection.items, ["constant"]);
  assert.deepEqual(right.context.selection.items, ["multiply"]);
  assert.equal(
    graph.nodeById(a)!.record.references.subgraph.targetId,
    graph.nodeById(b)!.record.references.subgraph.targetId,
  );
  ok(graph.history.undo());
  assert.equal(graph.exportJSON(), before);
  assert.deepEqual(left.breadcrumbs, [a, "nested"]);
  assert.equal(left.parameter("constant", "value").read(), 2);
  assert.equal(handle.write(4).ok, false);
  ok(graph.history.redo());
  assert.equal(right.parameter("constant", "value").read(), 5);
  ok(left.up());
  assert.deepEqual(left.breadcrumbs, [a]);
  assert.deepEqual(left.context.selection.items, []);
  ok(left.root());
  assert.deepEqual(left.context.selection.items, []);
  assert.equal(left.context.select(["constant"]).ok, false);
  assert.deepEqual(right.context.selection.items, ["multiply"]);
});

test("WS32 missing nested occurrence clears breadcrumb and scoped selection before notification; Undo restores model but not navigation", () => {
  const { graph, a, b, w, left, right } = nestedEditorFixture();
  ok(left.enter(a));
  ok(left.enter("nested"));
  ok(right.enter(b));
  ok(w.select("left", ["constant"]));
  ok(w.select("right", ["nested"]));
  const handle = left.parameter("constant", "value");
  let seen: unknown;
  graph.subscribe(() => {
    seen = { path: left.breadcrumbs, selection: left.context.selection.items };
  });
  ok(graph.change("Delete parent occurrence", (d) => d.removeNode(a)));
  assert.deepEqual(seen, { path: [], selection: [] });
  assert.equal(handle.write(9).ok, false);
  assert.deepEqual(right.breadcrumbs, [b]);
  assert.deepEqual(right.context.selection.items, ["nested"]);
  ok(graph.history.undo());
  assert.ok(graph.nodeById(a));
  assert.deepEqual(left.breadcrumbs, []);
  assert.deepEqual(left.context.selection.items, []);
  ok(left.enter(a));
  ok(left.enter("nested"));
  assert.equal(left.parameter("constant", "value").read(), 2);
});

test("WS33 nested navigation rejects invalid and busy paths without losing selection; local scoped gestures share History and closed handles fail", () => {
  const { graph, a, w, left } = nestedEditorFixture();
  ok(left.enter(a));
  ok(left.enter("nested"));
  ok(w.select("left", ["constant"]));
  const history = graph.history.length,
    path = left.breadcrumbs;
  assert.equal(left.enter("missing").ok, false);
  assert.deepEqual(left.breadcrumbs, path);
  assert.deepEqual(left.context.selection.items, ["constant"]);
  const operation = ok(left.context.beginOperation("Blocking navigation"));
  assert.equal(left.root().ok, false);
  assert.equal(left.up().ok, false);
  assert.deepEqual(left.breadcrumbs, path);
  ok(operation.cancel());
  assert.equal(graph.history.length, history);
  const parameter = left.parameter("constant", "value");
  ok(parameter.write(3)); // allocates local shared copy before the continuous gesture
  const localHistory = graph.history.length,
    gesture = ok(left.context.beginOperation("Nested slider"));
  ok(parameter.write(4, gesture));
  ok(parameter.write(6, gesture));
  ok(gesture.commit());
  assert.equal(graph.history.length, localHistory + 1);
  assert.equal(parameter.read(), 6);
  ok(graph.history.undo());
  assert.equal(parameter.read(), 3);
  ok(graph.history.redo());
  assert.equal(parameter.read(), 6);
  ok(w.closeCanvas("left"));
  assert.equal(parameter.write(8).ok, false);
});

test("WS34 asynchronous inspection cannot arrive in a different nested occurrence even with unchanged graph and stage", async () => {
  const { a, w, left } = nestedEditorFixture();
  let release!: (value: string) => void;
  const pending = w.inspect(
    "left",
    () =>
      new Promise<string>((resolve) => {
        release = resolve;
      }),
  );
  ok(left.enter(a));
  release("root artifact");
  assert.equal((await pending).ok, false);
  ok(left.root());
  const again = w.inspect(
    "left",
    () =>
      new Promise<string>((resolve) => {
        release = resolve;
      }),
  );
  ok(left.enter(a));
  ok(left.root());
  release("before leave and return");
  assert.equal((await again).ok, false);
});

test("WS35 reusable definitions infer permitted stages; vertex-only content is valid unused or in Vertex but rejected in Pixel", () => {
  const registry = new Registry();
  ok(registry.register(builtinModule));
  ok(registry.register(workspaceModule));
  const vertexRef = {
    moduleId: "qualification.vertex-only",
    version: "1",
    fingerprint: "v1",
    typeId: "constant",
  };
  const type = {
    ...builtinModule.types.find((t) => t.ref.typeId === "constant")!,
    ref: vertexRef,
    stages: ["vertex"] as ("vertex" | "pixel")[],
  };
  ok(
    registry.register({
      manifest: {
        ...workspaceModule.manifest,
        id: vertexRef.moduleId,
        fingerprint: "v1",
      },
      types: [type],
    }),
  );
  const graph = new Graph({
    name: "Vertex subgraph",
    definitions: registry.pin(),
    outputType: refs.output,
  });
  validColor(graph);
  const service = new ResourceQualification(graph),
    definition = networkRecipe("vertex");
  if (definition.body.kind !== "network") throw Error();
  definition.body.nodes.find((n) => n.id === "constant")!.typeRef = vertexRef;
  ok(service.createSubgraph("vertex", definition));
  assert.equal(
    graph.diagnostics.some((i) => i.severity === "error"),
    false,
  );
  const vertexId = ok(
    graph.change("Vertex call", (d) => {
      d.setStageImplementation("vertex", "network");
      return d.createNode(
        graph.stage("vertex").id,
        workspaceRefs.subgraph,
        { resourceId: "vertex" },
        "vertexCall",
      );
    }),
  );
  assert.equal(
    graph.diagnostics.some((i) => i.severity === "error"),
    false,
  );
  assert.ok(graph.nodeById(vertexId));
  const document = graph.exportJSON();
  const bad = graph.change("Wrong stage", (d) => {
    d.requireValid();
    d.createNode(
      graph.stage("pixel").id,
      workspaceRefs.subgraph,
      { resourceId: "vertex" },
      "wrong",
    );
  });
  assert.equal(bad.ok, false);
  assert.equal(graph.exportJSON(), document);
  const w = workspace(graph),
    ctx = w.context("left")!;
  ok(ctx.navigateStage("vertex"));
  const view = new NestedNetworkEditorQualification(ctx);
  ok(view.enter(vertexId));
  ok(view.parameter("constant", "value").write(8));
  assert.equal(view.parameter("constant", "value").read(), 8);
  assert.equal(
    graph.diagnostics.some((i) => i.severity === "error"),
    false,
  );
});

test("WS36 actual repeated nested calls emit physical-line provenance for each occurrence and resolve native reports without confusing shared definition IDs", () => {
  const { graph, a, b } = nestedEditorFixture(),
    artifact = ok(generate(graph.snapshot())),
    map = artifact.diagnosticMap!;
  assert.doesNotMatch(artifact.pixel, /__grape_trace_/);
  const matches = map.spans.filter(
    (s) =>
      s.definitionId === "inner" &&
      s.portKey === "out" &&
      s.path.at(-1) === "multiply",
  );
  const first = matches.find(
      (s) => canonical(s.path) === canonical([a, "nested", "multiply"]),
    )!,
    second = matches.find(
      (s) => canonical(s.path) === canonical([b, "nested", "multiply"]),
    )!;
  assert.ok(first);
  assert.ok(second);
  assert.notEqual(first.startLine, second.startLine);
  assert.match(artifact.pixel.split("\n")[first.startLine - 1], /float /);
  const target = {
    hostId: "test-host",
    targetId: "test-target",
    incarnation: "1",
    epoch: 1,
  };
  const binding = bindGeneratedDiagnostics(artifact, {
    target,
    requestId: "request",
    shapeId: "shape",
    loadId: graph.loadId,
    deliveryRevision: graph.revision,
    sources: [{ sourceId: "pixel-dat", stage: "pixel", lineOffset: 7 }],
  });
  const receipt = {
    target,
    requestId: "request",
    shapeId: "shape",
    artifactKey: map.artifactKey,
    sourceId: "pixel-dat",
    line: first.startLine + 7,
    message: "simulated compiler message",
  };
  const resolved = ok(binding.resolve(receipt));
  assert.deepEqual(resolved.spans[0].path, [a, "nested", "multiply"]);
  assert.equal(
    resolved.spans.some((s) => s.path[0] === b),
    false,
  );
});

test("WS37 nested NodeTypes declare and dynamically require backend capabilities through the enclosing generation profile", () => {
  const registry = new Registry();
  ok(registry.register(builtinModule));
  ok(registry.register(workspaceModule));
  const ref = {
    moduleId: "qualification.nested-capability",
    version: "1",
    fingerprint: "v1",
    typeId: "constant",
  };
  const original = builtinModule.types.find(
    (t) => t.ref.typeId === "constant",
  )!;
  const type = {
    ...original,
    ref,
    requiredCapabilities: ["qualification.declared"],
    emit: (state: Json, c: import("../contracts.ts").EmitContext) => {
      c.requireCapability("qualification.dynamic");
      return original.emit(state, c);
    },
  };
  ok(
    registry.register({
      manifest: {
        ...workspaceModule.manifest,
        id: ref.moduleId,
        fingerprint: "v1",
      },
      types: [type],
    }),
  );
  const graph = new Graph({
      name: "Nested capability",
      definitions: registry.pin(),
      outputType: refs.output,
    }),
    service = new ResourceQualification(graph),
    definition = networkRecipe("capability");
  if (definition.body.kind !== "network") throw Error();
  definition.body.nodes.find((n) => n.id === "constant")!.typeRef = ref;
  ok(service.createSubgraph("capability", definition));
  ok(
    graph.change("Call", (d) => {
      const id = d.createNode(
        graph.stage("pixel").id,
        workspaceRefs.subgraph,
        { resourceId: "capability" },
        "call",
      );
      d.connectEndpoints(
        { nodeId: id, key: "result" },
        { nodeId: graph.stage("pixel").node("output")!.id, key: "color" },
      );
    }),
  );
  const denied = generate(graph.snapshot());
  assert.equal(denied.ok, false);
  if (!denied.ok) assert.equal(denied.error.code, "BACKEND_CAPABILITY");
  const partial = generate(graph.snapshot(), {
    ...ES300_PROFILE,
    capabilities: ["qualification.declared"],
  });
  assert.equal(partial.ok, false);
  assert.equal(
    generate(graph.snapshot(), {
      ...ES300_PROFILE,
      capabilities: ["qualification.declared", "qualification.dynamic"],
    }).ok,
    true,
  );
});

function dynamicNestedFixture(preserve = false) {
  const registry = new Registry();
  ok(registry.register(builtinModule));
  ok(registry.register(workspaceModule));
  let composeRef = refs.compose;
  if (preserve) {
    composeRef = {
      moduleId: "qualification.preserve-compose",
      version: "1",
      fingerprint: "v1",
      typeId: "compose",
    };
    ok(
      registry.register({
        manifest: {
          ...workspaceModule.manifest,
          id: composeRef.moduleId,
          fingerprint: "v1",
        },
        types: [
          {
            ...builtinModule.types.find((t) => t.ref.typeId === "compose")!,
            ref: composeRef,
            invalidEdgePolicy: "preserve",
          },
        ],
      }),
    );
  }
  const graph = new Graph({
      name: "Nested dynamic",
      definitions: registry.pin(),
      outputType: refs.output,
    }),
    service = new ResourceQualification(graph),
    def = networkRecipe("dynamic");
  def.scope = "local";
  if (def.body.kind !== "network") throw Error();
  const boundary = def.body.nodes[0],
    constant = def.body.nodes[1],
    compose = innerNode("compose", composeRef, { mode: "color" });
  compose.values = { a: 0.7 };
  def.body.nodes = [boundary, constant, compose];
  def.body.ports = [{ key: "result", direction: "output", type: "vec4" }];
  def.body.edges = [
    {
      from: { nodeId: "constant", key: "out" },
      to: { nodeId: "compose", key: "a" },
    },
  ];
  def.body.outputs = { result: { nodeId: "compose", key: "out" } };
  ok(service.createSubgraph("dynamic", def));
  const call = ok(
    graph.change("Call", (d) => {
      const id = d.createNode(
        graph.stage("pixel").id,
        workspaceRefs.subgraph,
        { resourceId: "dynamic" },
        "call",
      );
      d.connectEndpoints(
        { nodeId: id, key: "result" },
        { nodeId: graph.stage("pixel").node("output")!.id, key: "color" },
      );
      return id;
    }),
  );
  const w = workspace(graph),
    view = new NestedNetworkEditorQualification(w.context("left")!);
  ok(view.enter(call));
  return { graph, service, registry, call, view };
}

test("WS38 nested dynamic state changes reconcile removed values and edges in one publication, permit error documents and undo exactly", () => {
  const { graph, service, registry, view } = dynamicNestedFixture(),
    before = graph.exportJSON(),
    history = graph.history.length;
  let events = 0;
  graph.subscribe(() => events++);
  const parameter = view.parameter("compose", "mode");
  ok(parameter.write("pair"));
  const body = (service.read("dynamic") as unknown as SubgraphRecord).body;
  if (body.kind !== "network") throw Error();
  assert.equal(body.edges.length, 0);
  assert.equal(body.nodes.find((n) => n.id === "compose")!.values.a, undefined);
  assert.ok(
    graph
      .snapshot()
      .document.losses.some(
        (loss) => loss.nodeId === "compose" && loss.inputKey === "a",
      ),
  );
  assert.ok(
    graph
      .snapshot()
      .document.losses.some((loss) => loss.nodeId === "compose" && loss.edge),
  );
  assert.equal(events, 1);
  assert.equal(graph.history.length, history + 1);
  assert.equal(generate(graph.snapshot()).ok, false);
  const saved = graph.exportJSON(),
    loaded = ok(Graph.load(saved, registry));
  assert.equal(loaded.exportJSON(), saved);
  assert.equal(
    loaded.diagnostics.some((i) => i.severity === "error"),
    true,
  );
  ok(graph.history.undo());
  assert.equal(graph.exportJSON(), before);
  assert.equal(generate(graph.snapshot()).ok, true);
  ok(graph.history.redo());
  assert.equal(parameter.read(), "pair");
  assert.equal(graph.exportJSON(), saved);
  const invalidBefore = graph.exportJSON();
  assert.equal(parameter.write("not-a-mode").ok, false);
  assert.equal(graph.exportJSON(), invalidBefore);
});

test("WS39 nested preserve policy retains invalid edge and restores it when the interface returns, without a second Graph or History", () => {
  const { graph, service, view } = dynamicNestedFixture(true),
    parameter = view.parameter("compose", "mode");
  ok(parameter.write("pair"));
  let body = (service.read("dynamic") as unknown as SubgraphRecord).body;
  if (body.kind !== "network") throw Error();
  assert.equal(body.edges.length, 1);
  assert.ok((body.edges[0] as any).invalid);
  assert.equal(generate(graph.snapshot()).ok, false);
  const edgeId = (body.edges[0] as any).id;
  ok(parameter.write("color"));
  body = (service.read("dynamic") as unknown as SubgraphRecord).body;
  if (body.kind !== "network") throw Error();
  assert.equal((body.edges[0] as any).id, edgeId);
  assert.equal((body.edges[0] as any).invalid, undefined);
  assert.equal(generate(graph.snapshot()).ok, true);
});

test("WS40 first library dynamic edit can preserve an invalid authoring state while atomically forking, recording scoped loss, and protecting its boundary", () => {
  const { graph, service, view, call } = dynamicNestedFixture();
  const library = structuredClone(
    service.read("dynamic"),
  ) as unknown as SubgraphRecord;
  library.scope = "library";
  ok(
    graph.change("Fixture library snapshot", (d) =>
      d.putResource("dynamic", library as unknown as Json),
    ),
  );
  const original = graph.exportJSON(),
    history = graph.history.length;
  let events = 0;
  graph.subscribe(() => events++);
  const parameter = view.parameter("compose", "mode");
  ok(parameter.write("pair"));
  const id = graph.nodeById(call)!.record.references.subgraph.targetId;
  assert.notEqual(id, "dynamic");
  assert.equal(graph.history.length, history + 1);
  assert.equal(events, 1);
  assert.equal(
    graph.diagnostics.some((i) => i.severity === "error"),
    true,
  );
  assert.ok(
    graph.snapshot().document.losses.every((loss) => loss.resourceId === id),
  );
  assert.ok(
    graph.diagnostics.some(
      (i) =>
        i.severity === "warning" &&
        i.subject.lossId &&
        i.subject.resourceId === id,
    ),
  );
  ok(graph.history.undo());
  assert.equal(graph.exportJSON(), original);
  const bad = structuredClone(library);
  if (bad.body.kind !== "network") throw Error();
  bad.body.nodes = bad.body.nodes.filter((n) => n.id !== "input");
  assert.equal(
    service.forkLibraryDefinition("dynamic", bad, { losses: [] }).ok,
    false,
  );
  assert.equal(graph.exportJSON(), original);
});

test("WS41 type-lock and per-shape backup belong to shared serialized Node data, not either EditorContext", () => {
  const { graph, registry, a, color } = setup(),
    w = workspace(graph),
    left = w.context("left")!,
    right = w.context("right")!;
  ok(left.select([color]));
  ok(right.select([a]));
  ok(
    graph.change("Initial local values", (d) => {
      d.setInput(color, "g", 0.3);
      d.setInput(color, "a", 0.8);
    }),
  );
  const before = graph.exportJSON(),
    history = graph.history.length;
  // A module-specific shape recipe decides contents; Graph owns storage and mutation.
  const savedColor = structuredClone(graph.nodeById(color)!.record.values);
  ok(
    left.change("Choose manual pair shape", (d) => {
      d.setMetadata(color, "typeMode", "manual");
      d.setMetadata(color, "inputValuesByType", { color: savedColor });
      d.setState(color, { mode: "pair" });
    }),
  );
  assert.equal(
    (right.graph.nodeById(color)!.record.uiMetadata as any).typeMode,
    "manual",
  );
  assert.deepEqual(
    (right.graph.nodeById(color)!.record.uiMetadata as any).inputValuesByType
      .color,
    savedColor,
  );
  assert.equal(right.graph.nodeById(color)!.record.values.a, undefined);
  const pair = graph.exportJSON();
  assert.equal(graph.history.length, history + 1);
  const loaded = ok(Graph.load(pair, registry));
  assert.equal(loaded.exportJSON(), pair);
  assert.deepEqual(
    (loaded.nodeById(color)!.record.uiMetadata as any).inputValuesByType.color,
    savedColor,
  );
  ok(
    right.change("Edit visible pair component", (d) =>
      d.setInput(color, "g", 0.6),
    ),
  );
  const current = graph.nodeById(color)!.record.values,
    backup = (graph.nodeById(color)!.record.uiMetadata as any).inputValuesByType
      .color;
  ok(
    left.change("Restore color shape through module recipe", (d) => {
      d.setMetadata(color, "inputValuesByType", {
        color: backup,
        pair: current,
      });
      d.setState(color, { mode: "color" });
      for (const [key, value] of Object.entries({ ...backup, ...current }))
        d.setInput(color, key, value as number);
    }),
  );
  assert.equal(right.graph.nodeById(color)!.record.values.g, 0.6);
  assert.equal(right.graph.nodeById(color)!.record.values.a, 0.8);
  assert.deepEqual(left.selection.items, [color]);
  assert.deepEqual(right.selection.items, [a]);
  ok(graph.history.undo());
  assert.equal((graph.nodeById(color)!.state as any).mode, "pair");
  ok(graph.history.undo());
  assert.equal(graph.exportJSON(), pair);
  ok(graph.history.undo());
  assert.equal(graph.exportJSON(), before);
  ok(graph.history.redo());
  assert.equal(graph.exportJSON(), pair);
});

test("WS42 grouping creation policy rejects direct sources but atomically encapsulates an eligible closed selection", () => {
  const { graph, service } = resourceFixture();
  validColor(graph);
  ok(service.createSource("u", uniform("amount")));
  const stage = graph.stage("pixel"),
    ids = ok(
      graph.change("Fixture", (d) => ({
        source: d.createNode(
          stage.id,
          workspaceRefs.source,
          { resourceId: "u" },
          "source",
        ),
        value: d.createNode(stage.id, refs.constant, { value: 0.4 }, "value"),
      })),
    ),
    policy = new SubgraphTransferPolicyQualification(graph),
    before = graph.exportJSON(),
    history = graph.history.length;
  assert.equal(
    policy.groupClosedSelection(stage.id, [ids.source], "bad", {
      nodeId: ids.source,
      key: "out",
    }).ok,
    false,
  );
  assert.equal(graph.exportJSON(), before);
  assert.equal(
    policy.groupClosedSelection(stage.id, [stage.node("output")!.id], "bad", {
      nodeId: stage.node("output")!.id,
      key: "color",
    }).ok,
    false,
  );
  assert.equal(graph.exportJSON(), before);
  let events = 0;
  graph.subscribe(() => events++);
  const call = ok(
    policy.groupClosedSelection(stage.id, [ids.value], "group", {
      nodeId: ids.value,
      key: "out",
    }),
  );
  assert.equal(events, 1);
  assert.equal(graph.history.length, history + 1);
  assert.equal(graph.nodeById(ids.value), undefined);
  assert.ok(graph.nodeById(call));
  const body = (service.read("group") as unknown as SubgraphRecord).body;
  if (body.kind !== "network") throw Error();
  assert.ok(body.nodes.some((n) => n.id === ids.value));
  assert.equal(generate(graph.snapshot()).ok, true);
  assert.equal(policy.personalPacket(stage.id, [call]).ok, true);
  ok(graph.history.undo());
  assert.equal(graph.exportJSON(), before);
  ok(graph.history.redo());
  assert.ok(graph.nodeById(call));
});

test("WS43 load preserves a source inside existing nested definitions while personal policy rejects its declared closure without reading host values", () => {
  const { graph, service, registry } = resourceFixture();
  ok(service.createSource("u", uniform("amount", 0.4)));
  const def = networkRecipe("existing");
  if (def.body.kind !== "network") throw Error();
  def.body.nodes.find((n) => n.id === "constant")!.typeRef =
    workspaceRefs.source;
  def.body.nodes.find((n) => n.id === "constant")!.state = {};
  def.body.nodes.find((n) => n.id === "constant")!.references = {
    source: { kind: "resource", targetId: "u" },
  };
  ok(service.createSubgraph("existing", def));
  const stage = graph.stage("pixel"),
    call = ok(
      graph.change("Existing nested source", (d) => {
        const id = d.createNode(
          stage.id,
          workspaceRefs.subgraph,
          { resourceId: "existing" },
          "call",
        );
        d.connectEndpoints(
          { nodeId: id, key: "result" },
          { nodeId: stage.node("output")!.id, key: "color" },
        );
        return id;
      }),
    );
  const raw = graph.exportJSON(),
    loaded = ok(Graph.load(raw, registry));
  assert.equal(loaded.exportJSON(), raw);
  assert.equal(generate(loaded.snapshot()).ok, true);
  const policy = new SubgraphTransferPolicyQualification(loaded),
    history = loaded.history.length;
  assert.equal(
    policy.personalPacket(loaded.stage("pixel").id, [call]).ok,
    false,
  );
  assert.equal(loaded.exportJSON(), raw);
  assert.equal(loaded.history.length, history);
  assert.equal(
    new GraphPacketQualification(loaded).export(loaded.stage("pixel").id, [
      call,
    ]).ok,
    true,
  ); // ordinary clipboard closure is a different contract
});

test("WS44 interface edits reconcile all nested callers and root callers in one publication, including unused/transitive definitions", () => {
  const { graph, service, registry } = resourceFixture();
  const leaf = networkRecipe("leaf");
  leaf.scope = "local";
  ok(service.createSubgraph("leaf", leaf));
  const parent = networkRecipe("parent", "leaf");
  parent.scope = "local";
  if (parent.body.kind !== "network") throw Error();
  parent.body.nodes.find((n) => n.id === "nested")!.values.value = 7;
  ok(service.createSubgraph("parent", parent));
  const unused = structuredClone(parent);
  unused.name = "Unused";
  if (unused.body.kind !== "network") throw Error();
  unused.body.nodes.find(
    (n) => n.id === "input",
  )!.references.subgraph.targetId = "unused";
  unused.body.nodes.find((n) => n.id === "nested")!.values.value = 9;
  ok(service.createSubgraph("unused", unused));
  const outer = networkRecipe("outer", "parent");
  outer.scope = "local";
  ok(service.createSubgraph("outer", outer));
  const unrelated = networkRecipe("unrelated");
  ok(service.createSubgraph("unrelated", unrelated));
  const s = graph.stage("pixel");
  const direct = ok(
    graph.change("Caller fixture", (d) => {
      const direct = d.createNode(
        s.id,
        workspaceRefs.subgraph,
        { resourceId: "leaf" },
        "direct",
      );
      d.setInput(direct, "value", 11);
      const outer = d.createNode(
        s.id,
        workspaceRefs.subgraph,
        { resourceId: "outer" },
        "outer",
      );
      d.connect(
        new Port(graph, outer, "output", "result"),
        s.node("output")!.input("color"),
      );
      return direct;
    }),
  );
  const before = graph.exportJSON(),
    history = graph.history.length,
    unchanged = service.read("unrelated");
  let publications = 0;
  let observedCoherent = false;
  const unsubscribe = graph.subscribe(() => {
    publications++;
    observedCoherent = ["parent", "unused"].every((id) => {
      const r = service.read(id) as unknown as SubgraphRecord;
      return (
        r.body.kind === "network" &&
        r.body.nodes.find((n) => n.id === "nested")!.ports[0]?.key === "renamed"
      );
    });
  });
  const next = structuredClone(
    service.read("leaf"),
  ) as unknown as SubgraphRecord;
  if (next.body.kind !== "network") throw Error();
  next.body.ports[0].key = "renamed";
  next.body.edges[0].from.key = "renamed";
  ok(service.editNetwork("leaf", next.body, []));
  for (const id of ["parent", "unused"]) {
    const r = service.read(id) as unknown as SubgraphRecord;
    if (r.body.kind !== "network") throw Error();
    const call = r.body.nodes.find((n) => n.id === "nested")!;
    assert.equal(call.ports[0].key, "renamed");
    assert.equal(call.values.value, undefined);
    assert.equal(call.values.renamed, 1);
    assert.equal(
      r.body.edges.some((e) => e.to.nodeId === "nested"),
      false,
    );
    assert.ok(
      graph
        .snapshot()
        .document.losses.some(
          (l) => l.resourceId === id && l.value !== undefined,
        ),
    );
    assert.ok(
      graph
        .snapshot()
        .document.losses.some(
          (l) => l.resourceId === id && l.edge?.to.nodeId === "nested",
        ),
    );
  }
  const outerNow = service.read("outer") as unknown as SubgraphRecord;
  if (outerNow.body.kind !== "network") throw Error();
  assert.ok(outerNow.body.nodes.every((n) => n.ports.length > 0));
  assert.equal(graph.nodeById(direct)!.record.values.value, undefined);
  assert.equal(graph.nodeById(direct)!.record.values.renamed, 1);
  assert.deepEqual(service.read("unrelated"), unchanged);
  assert.equal(publications, 1);
  assert.equal(observedCoherent, true);
  assert.equal(graph.history.length, history + 1);
  assert.equal(generate(graph.snapshot()).ok, true);
  const after = graph.exportJSON();
  const loaded = ok(Graph.load(after, registry));
  assert.equal(loaded.exportJSON(), after);
  assert.equal(generate(loaded.snapshot()).ok, true);
  unsubscribe();
  ok(graph.history.undo());
  assert.equal(graph.exportJSON(), before);
  ok(graph.history.redo());
  assert.equal(graph.exportJSON(), after);
  // The same stable key may change type; every caller takes the shared value-recovery policy.
  const shape = structuredClone(
    service.read("leaf"),
  ) as unknown as SubgraphRecord;
  if (shape.body.kind !== "network") throw Error();
  shape.body.ports[0].type = "vec2";
  shape.body.ports[0].default = [0.25, 0.75];
  shape.body.edges = shape.body.edges.filter((e) => e.from.nodeId !== "input");
  ok(service.editNetwork("leaf", shape.body, []));
  for (const id of ["parent", "unused"]) {
    const r = service.read(id) as unknown as SubgraphRecord;
    if (r.body.kind !== "network") throw Error();
    const call = r.body.nodes.find((n) => n.id === "nested")!;
    assert.equal(call.ports[0].key, "renamed");
    assert.equal(call.ports[0].type, "vec2");
    assert.deepEqual(call.values.renamed, [0.25, 0.75]);
    assert.ok(
      graph
        .snapshot()
        .document.losses.some(
          (l) =>
            l.resourceId === id && l.inputKey === "renamed" && l.value === 1,
        ),
    );
  }
  assert.deepEqual(graph.nodeById(direct)!.record.values.renamed, [0.25, 0.75]);
  assert.equal(generate(graph.snapshot()).ok, true);
  ok(graph.history.undo());
  assert.equal(graph.exportJSON(), after);
});

test("WS45 library interface fork reconciles renamed ancestors and local callers before publishing scoped loss", () => {
  const { graph, service, registry } = resourceFixture();
  ok(service.createSubgraph("leaf", networkRecipe("leaf")));
  ok(service.createSubgraph("parent", networkRecipe("parent", "leaf")));
  const local = networkRecipe("local", "leaf");
  local.scope = "local";
  if (local.body.kind !== "network") throw Error();
  local.body.nodes.find((n) => n.id === "nested")!.values.value = 3;
  ok(service.createSubgraph("local", local));
  const s = graph.stage("pixel");
  const root = ok(
    graph.change("Root", (d) => {
      const id = d.createNode(s.id, workspaceRefs.subgraph, {
        resourceId: "parent",
      });
      d.connect(
        new Port(graph, id, "output", "result"),
        s.node("output")!.input("color"),
      );
      return id;
    }),
  );
  const before = graph.exportJSON(),
    history = graph.history.length;
  let publications = 0;
  graph.subscribe(() => publications++);
  const next = structuredClone(
    service.read("leaf"),
  ) as unknown as SubgraphRecord;
  if (next.body.kind !== "network") throw Error();
  next.body.ports[0].key = "renamed";
  next.body.edges[0].from.key = "renamed";
  const newLeaf = ok(service.forkLibraryDefinition("leaf", next));
  const newParent = graph.nodeById(root)!.record.references.subgraph.targetId;
  assert.notEqual(newParent, "parent");
  assert.equal(service.read("leaf"), undefined);
  assert.equal(service.read("parent"), undefined);
  assert.equal(publications, 1);
  assert.equal(graph.history.length, history + 1);
  for (const id of [newParent, "local"]) {
    const r = service.read(id) as unknown as SubgraphRecord;
    if (r.body.kind !== "network") throw Error();
    const call = r.body.nodes.find((n) => n.id === "nested")!;
    assert.equal(call.references.subgraph.targetId, newLeaf);
    assert.equal(call.ports[0].key, "renamed");
    assert.equal(
      r.body.edges.some((e) => e.to.nodeId === "nested"),
      false,
    );
    assert.ok(
      graph
        .snapshot()
        .document.losses.some(
          (l) => l.resourceId === id && l.edge?.to.nodeId === "nested",
        ),
    );
  }
  assert.equal(generate(graph.snapshot()).ok, true);
  const after = graph.exportJSON();
  assert.equal(ok(Graph.load(after, registry)).exportJSON(), after);
  ok(graph.history.undo());
  assert.equal(graph.exportJSON(), before);
  ok(graph.history.redo());
  assert.equal(graph.exportJSON(), after);
});

test("WS46 recursive interface replacement or fork rejects atomically and malformed saved recursion remains diagnosable", () => {
  const { graph, service, registry } = resourceFixture();
  ok(service.createSubgraph("leaf", networkRecipe("leaf")));
  ok(service.createSubgraph("parent", networkRecipe("parent", "leaf")));
  const before = graph.exportJSON(),
    history = graph.history.length;
  let publications = 0;
  graph.subscribe(() => publications++);
  const cycle = networkRecipe("leaf", "parent");
  if (cycle.body.kind !== "network") throw Error();
  assert.equal(service.editNetwork("leaf", cycle.body, ["parent"]).ok, false);
  assert.equal(service.forkLibraryDefinition("leaf", cycle).ok, false);
  assert.equal(graph.exportJSON(), before);
  assert.equal(graph.history.length, history);
  assert.equal(publications, 0);
  const raw = JSON.parse(before);
  raw.resources.find((r: { id: string }) => r.id === "leaf").data = cycle;
  const loaded = ok(Graph.load(JSON.stringify(raw), registry));
  assert.ok(loaded.diagnostics.some((d) => d.severity === "error"));
  assert.equal(generate(loaded.snapshot()).ok, false);
  assert.deepEqual(JSON.parse(loaded.exportJSON()).resources, raw.resources);
});
