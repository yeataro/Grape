import test from "node:test";
import assert from "node:assert/strict";
import { Graph, Registry, Editor, Port, copy } from "../core.ts";
import { builtinModule, refs } from "../nodes.ts";
import {
  AutoLayout,
  NestedNetworkLayoutTarget,
  rankedLayout,
  CodeProjection,
  glslTokens,
  HelpView,
  SnapshotDownload,
} from "../qualification-actions.ts";
import type {
  LayoutInput,
  HelpContent,
  DocumentPacket,
} from "../qualification-actions.ts";
import type { Result, NodeRecord, TypeRef, Json } from "../contracts.ts";
import {
  ResourceQualification,
  NestedNetworkEditorQualification,
  workspaceModule,
  workspaceRefs,
} from "../qualification-workspace.ts";
import type { SubgraphRecord } from "../qualification-workspace.ts";
const ok = <T>(r: Result<T>): T => {
  if (!r.ok) throw Error(r.error.code + ": " + r.error.message);
  return r.value;
};
function fixture(kind: "td.top" | "td.mat" = "td.top") {
  const registry = new Registry();
  ok(registry.register(builtinModule));
  const graph = new Graph({
    name: "Actions",
    kind,
    definitions: registry.pin(),
    outputType: refs.output,
  });
  const stage = graph.stage("pixel");
  const ids = ok(
    graph.change("Fixture", (d) => {
      const a = d.createNode(stage.id, refs.constant, { value: 0.2 }, "a"),
        b = d.createNode(stage.id, refs.multiply, {}, "b"),
        outside = d.createNode(
          stage.id,
          refs.constant,
          { value: 0.8 },
          "outside",
        );
      d.connect(
        new Port(graph, a, "output", "out"),
        new Port(graph, b, "input", "a"),
      );
      return { a, b, outside };
    }),
  );
  const context = new Editor().open(graph);
  ok(context.select([ids.a, ids.b], ids.a));
  const extent = {
    [ids.a]: { width: 120, height: 160 },
    [ids.b]: { width: 350, height: 60 },
  };
  return { graph, context, extent, ...ids };
}
test("AQ01 pure layout handles SCC/unequal sizes/isolates/reverse and keeps edge directions unchanged", () => {
  const node = (id: string, order: number, width: number, height: number) => ({
    id,
    order,
    width,
    height,
    position: [0, 0] as [number, number],
    inputKeys: ["in"],
    outputKeys: ["first", "second"],
  });
  const input: LayoutInput = {
    nodes: [
      node("a", 0, 180, 80),
      node("b", 1, 80, 180),
      node("c", 2, 300, 60),
      node("isolate", 3, 60, 60),
    ],
    edges: [
      { from: { nodeId: "a", key: "first" }, to: { nodeId: "b", key: "in" } },
      { from: { nodeId: "b", key: "first" }, to: { nodeId: "a", key: "in" } },
      { from: { nodeId: "b", key: "second" }, to: { nodeId: "c", key: "in" } },
    ],
    reverse: false,
    gap: [96, 48],
  };
  const before = structuredClone(input),
    result = rankedLayout(input),
    p = new Map(result.positions.map((x) => [x.id, x.position]));
  assert.deepEqual(input, before);
  assert.deepEqual(rankedLayout(input), result);
  assert.equal(p.get("a")![0], p.get("b")![0]);
  assert.ok(p.get("c")![0] >= 276);
  assert.ok(p.get("isolate")![1] > p.get("b")![1] + 180);
  assert.equal(new Set(result.positions.map((x) => x.id)).size, 4);
  const rev = new Map(
    rankedLayout({ ...input, reverse: true }).positions.map((x) => [
      x.id,
      x.position,
    ]),
  );
  assert.ok(rev.get("c")![0] < rev.get("b")![0]);
  assert.deepEqual(input.edges, before.edges);
});
test("AQ02 layout proposes without mutation; one atomic commit/notification/history; Undo restores only positions", () => {
  const { graph, context, extent, a, b, outside } = fixture(),
    layout = new AutoLayout(),
    before = graph.exportJSON(),
    history = graph.history.length,
    events: string[] = [];
  graph.subscribe((e) => events.push(e.kind));
  const proposal = ok(layout.propose(context, extent, 1));
  assert.equal(graph.exportJSON(), before);
  const edges = graph.snapshot().document.stages[0].edges;
  ok(layout.apply(context, proposal, 1));
  assert.equal(graph.history.length, history + 1);
  assert.deepEqual(events, ["change"]);
  assert.deepEqual(graph.nodeById(outside)!.position, [0, 0]);
  assert.ok(graph.nodeById(b)!.position[0] > graph.nodeById(a)!.position[0]);
  assert.deepEqual(graph.snapshot().document.stages[0].edges, edges);
  ok(graph.history.undo());
  assert.equal(graph.exportJSON(), before);
  ok(graph.history.redo());
  assert.ok(graph.nodeById(b)!.position[0] > 0);
});
test("AQ03 layout rejects changed geometry, stale graph and forged proposal without partial mutation", () => {
  const { graph, context, extent, outside } = fixture(),
    layout = new AutoLayout(),
    proposal = ok(layout.propose(context, extent, 3)),
    before = graph.exportJSON();
  assert.equal(layout.apply(context, proposal, 4).ok, false);
  assert.equal(graph.exportJSON(), before);
  const forged = copy(proposal);
  forged.positions[0] = { id: outside, position: [900, 900] };
  assert.equal(layout.apply(context, forged, 3).ok, false);
  assert.equal(graph.exportJSON(), before);
  ok(graph.change("External change", (d) => d.move(outside, [5, 6])));
  const latest = graph.exportJSON();
  assert.equal(layout.apply(context, proposal, 3).ok, false);
  assert.equal(graph.exportJSON(), latest);
  assert.equal(
    new AutoLayout(() => ({
      positions: [{ id: outside, position: [0, 0] }],
    })).propose(context, extent, 4).ok,
    false,
  );
});
test("AQ04 token projection preserves hostile/unknown source as text, never returns HTML, validates custom tokenizers", () => {
  const projection = new CodeProjection();
  projection.register("glsl", glslTokens);
  const source =
    "#define N 1\n// <img src=x onerror=evil()>\nvec3 f(){ return mix(vec3(1.0),vec3(0.0),0.5); }\n<unknown>&";
  const result = ok(projection.project("glsl", source));
  assert.equal(result.tokens.map((t) => t.text).join(""), source);
  assert.equal(result.text, source);
  assert.equal("html" in result, false);
  assert.ok(
    result.tokens.some((t) => t.kind === "comment" && t.text.includes("<img")),
  );
  assert.ok(result.tokens.some((t) => t.kind === "function" && t.text === "f"));
  assert.ok(
    result.tokens.some((t) => t.kind === "builtin" && t.text === "mix"),
  );
  assert.deepEqual(Object.keys(result.tokens[0]).sort(), ["kind", "text"]);
  assert.deepEqual(ok(projection.project("missing", source)).tokens, [
    { kind: "plain", text: source },
  ]);
  projection.register("broken", () => [{ kind: "plain", start: 1, end: 2 }]);
  assert.equal(projection.project("broken", "abcd").ok, false);
  assert.throws(() => projection.register("glsl", glslTokens));
});
test("AQ05 Help resolves modular subject/context/locale, rejects reversed and selection-stale results, changes no graph history", async () => {
  const { graph, context, a, b } = fixture(),
    other = new Editor().open(graph),
    view = new HelpView(),
    before = graph.exportJSON(),
    count = graph.history.length;
  let release!: (v: HelpContent) => void;
  view.register("node", (q) => ({
    title: q.snapshot.document.stages
      .flatMap((s) => s.nodes)
      .find((n) => n.id === q.subject.id)!.name,
    paragraphs: [q.locale, q.stageId, q.contextId],
  }));
  view.register("deferred", () => new Promise((r) => (release = r)));
  view.register("extension", (q) => ({
    title: q.subject.id,
    paragraphs: [q.locale, "<script>plain text</script>"],
  }));
  const old = view.show(context, { kind: "deferred", id: a }, "en");
  const current = ok(
    await view.show(other, { kind: "extension", id: "new" }, "ja"),
  );
  release({ title: "obsolete", paragraphs: [] });
  assert.equal((await old).ok, false);
  assert.deepEqual(view.value, current);
  const pending = view.show(context, { kind: "deferred", id: a }, "en");
  ok(context.select([b], b));
  release({ title: "wrong selection", paragraphs: [] });
  assert.equal((await pending).ok, false);
  assert.equal(view.value, null);
  const node = ok(await view.show(context, { kind: "node", id: b }, "zh-TW"));
  assert.equal(node.title, "b");
  assert.deepEqual(node.paragraphs, ["zh-TW", context.stageId, context.id]);
  ok(context.select([a], a));
  assert.equal(view.value, null);
  assert.equal(
    (await view.show(context, { kind: "unregistered", id: a }, "en")).ok,
    false,
  );
  assert.equal(graph.exportJSON(), before);
  assert.equal(graph.history.length, count);
});
test("AQ06 Download hands off captured complete bytes and filename while graph advances; completion never acknowledges save", async () => {
  const { graph, context, a } = fixture(),
    before = graph.exportJSON(),
    revision = graph.revision,
    history = graph.history.length;
  let packet!: DocumentPacket, release!: (v: { status: "delivered" }) => void;
  const output = new SnapshotDownload({
      deliver: (p) => {
        packet = p;
        return new Promise((r) => (release = r));
      },
    }),
    pending = output.deliver(graph);
  assert.equal(packet.filename, "Grape-TOP.json");
  assert.equal(new TextDecoder().decode(packet.bytes), before);
  assert.equal(packet.revision, revision);
  assert.equal(packet.graphId, graph.id);
  ok(context.change("Newer edit", (d) => d.move(a, [8, 9])));
  release({ status: "delivered" });
  assert.equal(ok(await pending).revision, revision);
  assert.equal(graph.dirty, true);
  assert.equal(graph.history.length, history + 1);
  assert.equal(new TextDecoder().decode(packet.bytes), before);
  const mat = fixture("td.mat").graph;
  let matPacket!: DocumentPacket;
  ok(
    await new SnapshotDownload({
      deliver: async (p) => {
        matPacket = p;
        return { status: "delivered" };
      },
    }).deliver(mat),
  );
  assert.equal(matPacket.filename, "Grape-MAT.json");
  assert.equal(
    JSON.parse(new TextDecoder().decode(matPacket.bytes)).stages.length,
    2,
  );
});
test("AQ07 Download cancel/failed provider leave dirty/history/bytes untouched; invalid draft is still exportable", async () => {
  const { graph } = fixture(),
    before = graph.exportJSON(),
    count = graph.history.length;
  assert.ok(graph.diagnostics.some((x) => x.severity === "error"));
  assert.equal(
    (
      await new SnapshotDownload({
        deliver: async () => {
          throw Error("no permission");
        },
      }).deliver(graph)
    ).ok,
    false,
  );
  assert.equal(
    ok(
      await new SnapshotDownload({
        deliver: async () => ({ status: "cancelled" }),
      }).deliver(graph),
    ).status,
    "cancelled",
  );
  assert.equal(graph.exportJSON(), before);
  assert.equal(graph.history.length, count);
  assert.equal(graph.dirty, true);
});

test("AQ08 layout module consumes port order/card metrics without core type switches; malicious callback cannot mutate input", () => {
  const node = (id: string, order: number) => ({
    id,
    order,
    width: 80,
    height: 80,
    position: [0, 0] as [number, number],
    inputKeys: ["in"],
    outputKeys: ["first", "second"],
  });
  const input: LayoutInput = {
    nodes: [node("source", 0), node("second", 1), node("first", 2)],
    edges: [
      {
        from: { nodeId: "source", key: "second" },
        to: { nodeId: "second", key: "in" },
      },
      {
        from: { nodeId: "source", key: "first" },
        to: { nodeId: "first", key: "in" },
      },
    ],
    reverse: false,
    gap: [96, 48],
  };
  const p = new Map(
    rankedLayout(input).positions.map((x) => [x.id, x.position]),
  );
  assert.ok(p.get("first")![1] < p.get("second")![1]);
  const { graph, context, extent } = fixture(),
    before = graph.exportJSON();
  const bad = new AutoLayout((input) => {
    input.nodes[0].position[0] = 999;
    return {
      positions: input.nodes.map((n) => ({ id: n.id, position: n.position })),
    };
  });
  assert.equal(bad.propose(context, extent, 1).ok, false);
  assert.equal(graph.exportJSON(), before);
});

test("AQ09 DocumentOutput accepts a naming policy without core branching; naming failure never calls provider", async () => {
  const { graph } = fixture();
  let calls = 0;
  const output = {
    deliver: async (packet: DocumentPacket) => {
      calls++;
      assert.equal(packet.filename, "named-" + graph.id + ".json");
      return { status: "delivered" as const };
    },
  };
  ok(
    await new SnapshotDownload(
      output,
      (d) => "named-" + d.id + ".json",
    ).deliver(graph),
  );
  assert.equal(calls, 1);
  assert.equal(
    (
      await new SnapshotDownload(output, () => {
        throw Error("missing format");
      }).deliver(graph)
    ).ok,
    false,
  );
  assert.equal(
    (await new SnapshotDownload(output, () => "../outside.json").deliver(graph))
      .ok,
    false,
  );
  assert.equal(calls, 1);
});

function nestedLayoutFixture() {
  const registry = new Registry();
  ok(registry.register(builtinModule));
  ok(registry.register(workspaceModule));
  const graph = new Graph({
      name: "Nested layout",
      definitions: registry.pin(),
      outputType: refs.output,
    }),
    resources = new ResourceQualification(graph);
  const node = (
    id: string,
    typeRef: TypeRef,
    state: Json = {},
    references: NodeRecord["references"] = {},
  ): NodeRecord => ({
    id,
    name: id,
    typeRef,
    state,
    references,
    referencesComplete: true,
    ports: [],
    values: {},
    position: [0, 0],
  });
  const inner: SubgraphRecord = {
    kind: "subgraph",
    name: "inner",
    scope: "library",
    origin: { id: "library.inner", version: "1" },
    dependencies: [],
    body: {
      kind: "network",
      ports: [{ key: "out", direction: "output", type: "float" }],
      nodes: [
        node(
          "input",
          workspaceRefs.networkInput,
          {},
          { subgraph: { kind: "resource", targetId: "inner" } },
        ),
        node("constant", refs.constant, { value: 2 }),
        node("multiply", refs.multiply),
      ],
      edges: [
        {
          from: { nodeId: "constant", key: "out" },
          to: { nodeId: "multiply", key: "a" },
        },
      ],
      outputs: { out: { nodeId: "multiply", key: "out" } },
    },
  };
  ok(resources.createSubgraph("inner", inner));
  const outer: SubgraphRecord = {
    kind: "subgraph",
    name: "outer",
    scope: "library",
    origin: { id: "library.outer", version: "1" },
    dependencies: ["inner"],
    body: {
      kind: "network",
      ports: [{ key: "out", direction: "output", type: "float" }],
      nodes: [
        node(
          "input",
          workspaceRefs.networkInput,
          {},
          { subgraph: { kind: "resource", targetId: "outer" } },
        ),
        node(
          "nested",
          workspaceRefs.subgraph,
          {},
          { subgraph: { kind: "resource", targetId: "inner" } },
        ),
      ],
      edges: [],
      outputs: { out: { nodeId: "nested", key: "out" } },
    },
  };
  ok(resources.createSubgraph("outer", outer));
  const [a, b] = ok(
    graph.change("Occurrences", (d) => [
      d.createNode(
        graph.stage("pixel").id,
        workspaceRefs.subgraph,
        { resourceId: "outer" },
        "a",
      ),
      d.createNode(
        graph.stage("pixel").id,
        workspaceRefs.subgraph,
        { resourceId: "outer" },
        "b",
      ),
    ]),
  );
  const editor = new Editor(),
    left = new NestedNetworkEditorQualification(editor.open(graph)),
    right = new NestedNetworkEditorQualification(editor.open(graph));
  ok(left.enter(a));
  ok(left.enter("nested"));
  ok(right.enter(b));
  ok(right.enter("nested"));
  ok(left.context.select(["constant", "multiply"], "constant"));
  ok(right.context.select(["constant", "multiply"], "multiply"));
  return {
    graph,
    resources,
    a,
    b,
    left,
    right,
    extent: {
      constant: { width: 140, height: 80 },
      multiply: { width: 210, height: 120 },
    },
  };
}
test("AQ10 one nested geometry edit shares definition positions across occurrences, keeps contexts independent and undoes atomically", () => {
  const { graph, left, right, extent } = nestedLayoutFixture(),
    layout = new AutoLayout(rankedLayout, new NestedNetworkLayoutTarget()),
    before = graph.exportJSON(),
    count = graph.history.length,
    edges = copy(left.inspectPath().resource!.body);
  let events = 0;
  graph.subscribe(() => events++);
  const staleOther = ok(layout.propose(right.context, extent, 1)),
    proposal = ok(layout.propose(left.context, extent, 1));
  assert.ok(
    proposal.scope.nodes.find((n) => n.id === "multiply")!.ports.length > 0,
  );
  assert.equal(graph.exportJSON(), before);
  ok(layout.apply(left.context, proposal, 1));
  assert.equal(events, 1);
  assert.equal(graph.history.length, count + 1);
  assert.equal(left.context.graph, right.context.graph);
  assert.notEqual(
    left.context.activeNetwork.id,
    right.context.activeNetwork.id,
  );
  assert.equal(left.inspectPath().resourceId, right.inspectPath().resourceId);
  assert.deepEqual(
    left.node("multiply")!.position,
    right.node("multiply")!.position,
  );
  assert.ok(left.node("multiply")!.position[0] > 0);
  assert.equal(left.context.selection.primary, "constant");
  assert.equal(right.context.selection.primary, "multiply");
  assert.equal(left.inspectPath().resource!.scope, "library");
  assert.equal(layout.apply(right.context, staleOther, 1).ok, false);
  const body = left.inspectPath().resource!.body;
  assert.equal(body.kind, "network");
  if (body.kind === "network" && edges.kind === "network")
    assert.deepEqual(body.edges, edges.edges);
  ok(graph.history.undo());
  assert.equal(graph.exportJSON(), before);
  assert.deepEqual(left.breadcrumbs.length, 2);
  ok(graph.history.redo());
  assert.ok(right.node("multiply")!.position[0] > 0);
});
test("AQ11 nested proposal cannot survive semantic library fork, navigation away/back or deletion; new local proposal uses same Graph", () => {
  const { graph, left, right, extent, a } = nestedLayoutFixture(),
    layout = new AutoLayout(rankedLayout, new NestedNetworkLayoutTarget()),
    proposal = ok(layout.propose(left.context, extent, 1)),
    oldId = left.inspectPath().resourceId;
  ok(right.parameter("constant", "value").write(3));
  assert.notEqual(left.inspectPath().resourceId, oldId);
  assert.equal(left.inspectPath().resource!.scope, "local");
  let latest = graph.exportJSON();
  assert.equal(layout.apply(left.context, proposal, 1).ok, false);
  assert.equal(graph.exportJSON(), latest);
  const local = ok(layout.propose(left.context, extent, 2)),
    localId = left.inspectPath().resourceId;
  ok(layout.apply(left.context, local, 2));
  assert.equal(left.inspectPath().resourceId, localId);
  assert.deepEqual(
    left.node("multiply")!.position,
    right.node("multiply")!.position,
  );
  const navigated = ok(layout.propose(left.context, extent, 3));
  ok(left.up());
  ok(left.enter("nested"));
  ok(left.context.select(["constant", "multiply"], "constant"));
  latest = graph.exportJSON();
  assert.equal(layout.apply(left.context, navigated, 3).ok, false);
  assert.equal(graph.exportJSON(), latest);
  const removed = ok(layout.propose(left.context, extent, 4));
  ok(graph.change("Remove occurrence", (d) => d.removeNode(a)));
  latest = graph.exportJSON();
  assert.equal(layout.apply(left.context, removed, 4).ok, false);
  assert.equal(graph.exportJSON(), latest);
  assert.equal(left.breadcrumbs.length, 0);
  assert.equal(right.breadcrumbs.length, 2);
});

test("AQ12 Help cannot reuse identical local node IDs after navigating between two occurrences", async () => {
  const { left, b } = nestedLayoutFixture(),
    view = new HelpView();
  let release!: (v: HelpContent) => void;
  view.register("nested", () => new Promise((r) => (release = r)));
  const pending = view.show(
    left.context,
    { kind: "nested", id: "constant" },
    "en",
  );
  ok(left.root());
  ok(left.enter(b));
  ok(left.enter("nested"));
  ok(left.context.select(["constant", "multiply"], "constant"));
  release({ title: "from other occurrence", paragraphs: [] });
  assert.equal((await pending).ok, false);
  assert.equal(view.value, null);
});
