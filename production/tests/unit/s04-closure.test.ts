import test from "node:test";
import assert from "node:assert/strict";
import {
  currentSetup,
  arrayFixture,
  nestedArrayFixture,
  conversionFixture,
} from "../fixtures/s04.ts";
import { customTransferFixture } from "../fixtures/custom-transfer.ts";
import { Graph } from "../../src/model/graph.ts";
import {
  buildPersonal,
  readPersonal,
  packagePacket,
  qualifyPackage,
  PersonalLibrary,
} from "../../src/application/personal.ts";
import { probeDefinitions } from "../../src/modules/package-probe.ts";
import { esProfile } from "../../src/modules/image.ts";
import { nodeRef } from "../../src/modules/nodes.ts";
import { asNetwork, callResource, typeSystem } from "../../src/sdk/networks.ts";
import { compile } from "../../src/generation/compiler.ts";
import { readDocument, writeDocument } from "../../src/persistence/codec.ts";

function valid(s: ReturnType<typeof currentSetup>) {
  s.graph.change("Valid", (d) => {
    const f = d.add(s.network, nodeRef("float"), [0, 0]);
    d.connect(
      s.network,
      { nodeId: f, portKey: "value" },
      {
        nodeId: s.graph.resolveNetwork(s.network).nodes[0].id,
        portKey: "color",
      },
    );
  });
}

test("S04 Personal complete owner payload and typed references survive reuse fork and absent Library source", async () => {
  const s = customTransferFixture(),
    doc = structuredClone(s.graph.capture().document);
  doc.graph.resources = doc.graph.resources.filter((r) => r.id !== s.source);
  const a = doc.graph.resources.find((r) => r.id === s.a)!;
  (a.data as any).links = (a.data as any).links.filter(
    (r: any) => r.targetId !== s.source,
  );
  (a.data as any).futureAuthored = {
    mode: "function",
    literal: s.a,
    options: [1, { constant: true }],
  };
  const graph = new Graph(doc, s.fixed, s.identity);
  let call = "";
  graph.change("Group complete owner closure", (d) => {
    call = d.encapsulate(s.network, s.selection);
  });
  const root = callResource(
    graph.resolveNetwork(s.network).nodes.find((n) => n.id === call)!,
    s.fixed,
  )!;
  const before = graph.capture(),
    asset = await buildPersonal(
      before,
      s.fixed,
      root,
      esProfile,
      probeDefinitions,
    );
  assert.deepEqual(graph.capture(), before);
  assert.equal(asset.stageKindIds.length, 1);
  const custom = asset.resources.find((r) => r.type.typeId === "state")!;
  assert.deepEqual(
    (custom.data as any).futureAuthored,
    (a.data as any).futureAuthored,
  );
  assert.equal((custom.data as any).literal, s.b);
  assert.notEqual((custom.data as any).links[0].targetId, s.b);
  const restored = await readPersonal(
    JSON.stringify(asset),
    s.fixed,
    esProfile,
    probeDefinitions,
  );
  const target = new Graph(s.targetDocument, s.fixed, s.identity);
  let ids: string[] = [];
  target.change("Insert", (d) => {
    ids = d.insertLibrary(
      s.network,
      packagePacket(restored, target.capture().document, s.fixed),
      asset.contentHash,
    );
  });
  const once = target.capture();
  target.change("Reuse", (d) =>
    d.insertLibrary(
      s.network,
      packagePacket(restored, target.capture().document, s.fixed),
      asset.contentHash,
    ),
  );
  assert.deepEqual(
    target.capture().document.graph.resources,
    once.document.graph.resources,
  );
  const r = callResource(
    target.resolveNetwork(s.network).nodes.find((n) => n.id === ids[0])!,
    s.fixed,
  )!;
  const n = asNetwork(
    target.capture().document.graph.resources.find((x) => x.id === r)!,
    s.fixed,
  )!;
  target.change("First semantic fork", (d) =>
    d.interface(n.network.id, n.interface, "Owned fork"),
  );
  assert.notEqual(
    callResource(
      target.resolveNetwork(s.network).nodes.find((n) => n.id === ids[0])!,
      s.fixed,
    ),
    r,
  );
  const owned = target
    .capture()
    .document.graph.resources.filter((r) => r.type.typeId === "state");
  assert.ok(owned.length > 0);
  owned.forEach((r) =>
    assert.deepEqual(
      (r.data as any).futureAuthored,
      (a.data as any).futureAuthored,
    ),
  );
  // The installed snapshot remains executable without any Library provider or source object.
  const loaded = readDocument(writeDocument(target.capture().document));
  assert.equal(loaded.status, "editable");
  if (loaded.status !== "editable") throw Error("read");
  const reopened = new Graph(loaded.document, s.fixed, s.identity);
  assert.equal(
    compile(reopened.capture(), s.fixed, esProfile).status,
    "success",
  );
  assert.deepEqual(
    await readPersonal(
      JSON.stringify(asset),
      s.fixed,
      esProfile,
      probeDefinitions,
    ),
    asset,
  );
  const missing = currentSetup();
  await assert.rejects(
    readPersonal(
      JSON.stringify(asset),
      missing.fixed,
      esProfile,
      probeDefinitions,
    ),
    /PERSONAL_MODULE/,
  );
});

test("S04 DEC004 same-name destination sources retain distinct identity and changed imported bindings regenerate", async () => {
  for (const mode of ["source", "direct-source", "input", "nested"] as const) {
    const s = mode === "nested" ? nestedArrayFixture() : arrayFixture(mode);
    s.graph.change("Distinct array item", (d) => {
      const f = d.add(s.net().network.id, nodeRef("float"), [0, 0]);
      d.parameter(s.net().network.id, f, "value", 0.375);
      d.connect(
        s.net().network.id,
        { nodeId: f, portKey: "value" },
        { nodeId: s.repeat, portKey: "item" },
      );
    });
    const asset = await buildPersonal(
        s.graph.capture(),
        s.fixed,
        "root" in s ? s.root : s.id,
        esProfile,
        probeDefinitions,
      ),
      target = currentSetup();
    valid(target);
    let collision = "";
    target.graph.change("Same name", (d) => {
      collision = d.createSource("Length", "glsl.int", 9);
    });
    let calls: string[] = [];
    target.graph.change("Import", (d) => {
      calls = d.insertLibrary(
        target.network,
        packagePacket(asset, target.graph.capture().document, target.fixed),
        asset.contentHash,
      );
    });
    const doc = structuredClone(target.graph.capture().document),
      root = callResource(
        target.graph
          .resolveNetwork(target.network)
          .nodes.find((n) => n.id === calls[0])!,
        target.fixed,
      )!;
    assert.equal(
      (doc.graph.resources.find((r) => r.id === collision)!.data as any).value,
      9,
    );
    if (mode === "source" || mode === "direct-source") {
      const imported = doc.graph.resources.find(
        (r) =>
          target.fixed.resource(r.type)?.model === "source" &&
          r.id !== collision,
      )!;
      assert.equal((imported.data as any).value, 4);
      assert.notEqual((imported.data as any).name, "Length");
      (imported.data as any).value = 6;
    }
    const reopened = new Graph(
      (readDocument(writeDocument(doc)) as any).document,
      target.fixed,
      target.identity,
    );
    if (mode === "input" || mode === "nested")
      reopened.change("Six through caller", (d) =>
        d.parameter(target.network, calls[0], "length", 6),
      );
    else reopened.change("Reconcile edited source", () => {});
    const before = reopened.capture(),
      round = await buildPersonal(
        before,
        target.fixed,
        root,
        esProfile,
        probeDefinitions,
      ).catch((e) => {
        e.message = mode + ": " + e.message;
        throw e;
      });
    assert.deepEqual(reopened.capture(), before);
    const results = qualifyPackage(
        round,
        target.fixed,
        esProfile,
        probeDefinitions,
      ),
      text = results.flatMap((c) => c.artifacts.map((a) => a.text)).join("\n");
    assert.match(text, /0\.375/);
    assert.match(
      text,
      mode === "source" || mode === "direct-source" ? /\[6\]/ : /\[4\]/,
    );
    // Input overrides are occurrence state; package defaults stay four, while the reopened graph resolves six.
    const extents = before.document.graph.resources.filter(
      (r) => r.type.typeId === "array-extent",
    );
    if (mode === "input" || mode === "nested")
      assert.ok(
        extents.every(
          (r) => typeSystem(before.document, target.fixed).extent(r.id) === 6,
        ),
      );
  }
});

test("S04 Personal malformed envelope checksum and unsupported owner reject before provider writes; list deduplicates renamed files", async () => {
  const s = arrayFixture("literal"),
    before = s.graph.capture(),
    asset = await buildPersonal(
      before,
      s.fixed,
      s.id,
      esProfile,
      probeDefinitions,
    ),
    cases: any[] = [];
  for (const mutation of [
    (a: any) => (a.version = 2),
    (a: any) => (a.extra = true),
    (a: any) => delete a.contentHash,
    (a: any) => (a.contentHash = "0".repeat(64)),
    (a: any) => (a.resources[0].data.name = 123),
    (a: any) => (a.resources[0].type.fingerprint = "sha256:" + "1".repeat(64)),
  ]) {
    const a = structuredClone(asset);
    mutation(a);
    cases.push(a);
  }
  let writes = 0;
  const records = [
    {
      name: "z.sgrape-function.json",
      text: JSON.stringify(asset),
      kind: "file" as const,
      scope: "same",
    },
    {
      name: "A.sgrape-function.json",
      text: JSON.stringify(asset, null, 2),
      kind: "file" as const,
      scope: "same",
    },
  ];
  const lib = new PersonalLibrary(
    {
      scope: "same",
      list: async () => records,
      publish: async () => {
        writes++;
        return "created";
      },
    },
    s.fixed,
    esProfile,
    probeDefinitions,
  );
  for (const bad of cases) {
    const raw = JSON.stringify(bad);
    await assert.rejects(
      readPersonal(raw, s.fixed, esProfile, probeDefinitions),
    );
    await assert.rejects(lib.save(bad));
    assert.equal(JSON.stringify(bad), raw);
  }
  assert.equal(writes, 0);
  assert.deepEqual(s.graph.capture(), before);
  const list = await lib.list();
  assert.equal(list.items.length, 1);
  assert.equal(list.items[0].name, "A.sgrape-function.json");
  assert.equal(list.issues.length, 0);
  assert.equal((await lib.save(asset)).reused, true);
  assert.equal(writes, 0);
});

test("S04 DEC002 one-source fanout does not mutate source or existing conversions and pad failures agree", () => {
  const s = conversionFixture("glsl.vec2", "glsl.vec4"),
    net = s.graph.resolveNetwork(s.network),
    source = net.nodes[1],
    sink = net.nodes[2];
  const before = structuredClone(source),
    edge = structuredClone(net.edges[0]);
  let compose = "",
    multiply = "";
  s.graph.change("Other targets", (d) => {
    compose = d.add(s.network, nodeRef("compose"), [0, 100]);
    d.parameter(s.network, compose, "mode", "vec3");
    multiply = d.add(s.network, nodeRef("multiply"), [0, 200]);
    d.connect(
      s.network,
      { nodeId: source.id, portKey: "value" },
      { nodeId: compose, portKey: "x" },
    );
    d.connect(
      s.network,
      { nodeId: source.id, portKey: "value" },
      { nodeId: multiply, portKey: "a" },
    );
  });
  let call = "";
  s.graph.change("Vec3 target", (d) => {
    call = d.createSubgraph(s.network, "Vec3 consumer", null, true);
  });
  const root = callResource(
    s.graph.resolveNetwork(s.network).nodes.find((n) => n.id === call)!,
    s.fixed,
  )!;
  const data = asNetwork(
    s.graph.capture().document.graph.resources.find((r) => r.id === root)!,
    s.fixed,
  )!;
  s.graph.change("Vec3 input", (d) =>
    d.interface(data.network.id, [
      {
        key: "v",
        name: "Vector",
        direction: "input",
        type: "glsl.vec3",
        supply: "local",
        defaultValue: [0, 0, 0],
      },
    ]),
  );
  s.graph.change("Fanout vec3", (d) =>
    d.connect(
      s.network,
      { nodeId: source.id, portKey: "value" },
      { nodeId: call, portKey: "v" },
    ),
  );
  assert.deepEqual(
    s.graph.resolveNetwork(s.network).nodes.find((n) => n.id === source.id),
    before,
  );
  assert.deepEqual(
    s.graph.resolveNetwork(s.network).edges.find((e) => e.id === edge.id),
    edge,
  );
  let events = 0;
  s.graph.subscribe(() => events++);
  const captured = s.graph.capture(),
    history = s.graph.historyLength;
  assert.throws(() =>
    s.graph.change("Invalid replacement", (d) =>
      d.connect(
        s.network,
        { nodeId: source.id, portKey: "missing" },
        { nodeId: sink.id, portKey: "value" },
        true,
      ),
    ),
  );
  assert.deepEqual(s.graph.capture(), captured);
  assert.equal(s.graph.historyLength, history);
  assert.equal(events, 0);
  for (const patch of [
    { version: 1 },
    { sourceType: "glsl.vec3" },
    { targetType: "glsl.float" },
    { operation: "truncate-vector" },
  ]) {
    const doc = structuredClone(captured.document),
      e = doc.graph.stages
        .find((s) => s.key === "pixel")!
        .network.edges.find((e) => e.id === edge.id)!;
    Object.assign(e.adaptation, patch);
    const graph = new Graph(doc, s.fixed, s.identity),
      snapshot = graph.capture();
    assert.ok(snapshot.diagnostics.some((d) => d.severity === "error"));
    assert.notEqual(compile(snapshot, s.fixed, esProfile).status, "success");
    graph.change("Revalidation", () => {});
    assert.ok(graph.capture().diagnostics.some((d) => d.severity === "error"));
  }
});

test("S04 Personal root owner remap and input-bound Independent retain complete typed scope", async () => {
  const s = currentSetup();
  let call = "";
  s.graph.change("Root", (d) => {
    call = d.createSubgraph(s.network);
  });
  const root = callResource(
    s.graph.resolveNetwork(s.network).nodes.find((n) => n.id === call)!,
    s.fixed,
  )!;
  const original = s.fixed.resourceByModel("network")!,
    pin = {
      moduleId: "test.personal.root",
      version: "1.0.0",
      fingerprint: "test-root-v1",
    },
    owner = { ...pin, namespace: pin.moduleId, catalogVersion: 1 };
  s.definitions.register({
    manifest: pin,
    presentation: { owner, defaultLocale: "en" },
    nodes: [],
    resources: [
      {
        ...original,
        ref: { ...pin, typeId: "root" },
        stateReferences: {
          collect: (data) => [
            ...original.stateReferences!.collect(data),
            (data as any).ownRef,
          ],
          remap: (data, map) => ({
            ...(original.stateReferences!.remap(data, map) as any),
            ownRef: map((data as any).ownRef),
          }),
        },
      },
    ],
  });
  const fixed = s.definitions.pin(s.definitions.pins()),
    doc = structuredClone(s.graph.capture().document);
  doc.graph.modules.push(pin);
  const resource = doc.graph.resources.find((r) => r.id === root)!;
  resource.type = { ...pin, typeId: "root" };
  const data = resource.data as any;
  data.ownRef = {
    slot: "owner-node",
    kind: "node",
    networkId: data.network.id,
    targetId: data.network.nodes[0].id,
  };
  data.extra = { literal: data.network.nodes[0].id, mode: "function" };
  const graph = new Graph(doc, fixed, s.identity),
    asset = await buildPersonal(
      graph.capture(),
      fixed,
      root,
      esProfile,
      probeDefinitions,
    );
  graph.change("Independent owner", (d) => d.makeIndependent(s.network, call));
  const newId = callResource(
      graph.resolveNetwork(s.network).nodes.find((n) => n.id === call)!,
      fixed,
    )!,
    copy = graph.capture().document.graph.resources.find((r) => r.id === newId)!
      .data as any;
  assert.equal(copy.ownRef.networkId, copy.network.id);
  assert.equal(copy.ownRef.targetId, copy.network.nodes[0].id);
  assert.deepEqual(copy.extra, data.extra);
  assert.deepEqual(
    (asset.resources.find((r) => r.type.moduleId === pin.moduleId)!.data as any)
      .extra,
    data.extra,
  );
  const bound = arrayFixture("input");
  bound.graph.change("Independent array", (d) =>
    d.makeIndependent(bound.network, bound.call),
  );
  const independent = callResource(
    bound.graph
      .resolveNetwork(bound.network)
      .nodes.find((n) => n.id === bound.call)!,
    bound.fixed,
  )!;
  bound.graph.change("Independent six", (d) =>
    d.parameter(bound.network, bound.call, "length", 6),
  );
  const network = asNetwork(
    bound.graph
      .capture()
      .document.graph.resources.find((r) => r.id === independent)!,
    bound.fixed,
  )!;
  const extent = JSON.parse(
    network.interface.find((p) => p.direction === "output")!.type.slice(6),
  )[1].sourceId;
  assert.notEqual(extent, (bound.extent as any).sourceId);
  assert.equal(
    typeSystem(bound.graph.capture().document, bound.fixed).extent(extent),
    6,
  );
  assert.equal(
    typeSystem(bound.graph.capture().document, bound.fixed).extent(
      (bound.extent as any).sourceId,
    ),
    4,
  );
  await buildPersonal(
    bound.graph.capture(),
    bound.fixed,
    independent,
    esProfile,
    probeDefinitions,
  );
});

test("S04 stored inherited v2 and pad plans retain complete extensions through Personal shared import and reopen", async () => {
  const s = conversionFixture("glsl.vec2", "glsl.vec4"),
    net = s.graph.resolveNetwork(s.network),
    sink = net.nodes[2];
  let second = "";
  s.graph.change("Identity middle", (d) => {
    second = d.add(s.network, sink.type, [250, 0]);
    d.connect(
      s.network,
      { nodeId: sink.id, portKey: "color" },
      { nodeId: second, portKey: "value" },
    );
    d.connect(
      s.network,
      { nodeId: second, portKey: "color" },
      { nodeId: net.nodes[0].id, portKey: "color" },
      true,
    );
  });
  const doc = structuredClone(s.graph.capture().document),
    network = doc.graph.stages.find((s) => s.key === "pixel")!.network;
  for (const e of network.edges.filter(
    (e) => e.to.nodeId !== net.nodes[0].id,
  )) {
    e.adaptation.version = 2;
    e.adaptation.extensions = {
      "test.plan": {
        value: e.adaptation.operation,
        text: "leave ordinary IDs",
      },
    };
  }
  const plans = network.edges
      .filter((e) => e.to.nodeId !== net.nodes[0].id)
      .map((e) => e.adaptation),
    graph = new Graph(doc, s.fixed, s.identity);
  let call = "";
  graph.change("Group", (d) => {
    call = d.encapsulate(
      s.network,
      network.nodes.filter((n) => n.id !== net.nodes[0].id).map((n) => n.id),
    );
  });
  const root = callResource(
      graph.resolveNetwork(s.network).nodes.find((n) => n.id === call)!,
      s.fixed,
    )!,
    asset = await readPersonal(
      JSON.stringify(
        await buildPersonal(
          graph.capture(),
          s.fixed,
          root,
          esProfile,
          probeDefinitions,
        ),
      ),
      s.fixed,
      esProfile,
      probeDefinitions,
    );
  const target = conversionFixture("glsl.vec2", "glsl.vec4");
  for (let i = 0; i < 2; i++)
    target.graph.change("Shared import", (d) =>
      d.insertLibrary(
        target.network,
        packagePacket(asset, target.graph.capture().document, target.fixed),
        asset.contentHash,
      ),
    );
  const read = readDocument(writeDocument(target.graph.capture().document));
  assert.equal(read.status, "editable");
  if (read.status !== "editable") throw Error("read");
  const reopened = new Graph(read.document, target.fixed, target.identity),
    found = reopened
      .capture()
      .document.graph.resources.flatMap(
        (r) =>
          asNetwork(r, target.fixed)?.network.edges.map((e) => e.adaptation) ??
          [],
      );
  for (const plan of plans)
    assert.ok(found.some((p) => JSON.stringify(p) === JSON.stringify(plan)));
  assert.equal(
    compile(reopened.capture(), target.fixed, esProfile).status,
    "success",
  );
});

test("S04 shipped basic Library snapshot compiles after semantic fork and Personal roundtrip", async () => {
  const s = currentSetup();
  valid(s);
  const original = structuredClone(s.fixed.resourceByModel("network")!.library);
  let call = "";
  s.graph.change("Builtin", (d) => {
    call = d.createSubgraph(s.network, "Builtin", "requested");
  });
  const id = callResource(
      s.graph.resolveNetwork(s.network).nodes.find((n) => n.id === call)!,
      s.fixed,
    )!,
    data = asNetwork(
      s.graph.capture().document.graph.resources.find((r) => r.id === id)!,
      s.fixed,
    )!;
  s.graph.change("Builtin output", (d) =>
    d.interface(data.network.id, [
      {
        key: "color",
        name: "Color",
        direction: "output",
        type: "glsl.vec4",
        defaultValue: [0, 0, 0, 1],
      },
    ]),
  );
  s.graph.change("Wire builtin", (d) => {
    const float = data.network.nodes.find((n) => n.type.typeId === "float")!;
    d.connect(
      data.network.id,
      { nodeId: float.id, portKey: "value" },
      {
        nodeId: data.network.nodes.find(
          (n) => n.type.typeId === "network-output",
        )!.id,
        portKey: "color",
      },
      true,
    );
  });
  const root = callResource(
    s.graph.resolveNetwork(s.network).nodes.find((n) => n.id === call)!,
    s.fixed,
  )!;
  assert.notEqual(root, id);
  const asset = await buildPersonal(
    s.graph.capture(),
    s.fixed,
    root,
    esProfile,
    probeDefinitions,
  );
  assert.deepEqual(
    await readPersonal(
      JSON.stringify(asset),
      s.fixed,
      esProfile,
      probeDefinitions,
    ),
    asset,
  );
  assert.deepEqual(s.fixed.resourceByModel("network")!.library, original);
});
