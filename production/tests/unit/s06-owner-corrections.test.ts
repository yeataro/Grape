import test from "node:test";
import assert from "node:assert/strict";
import { currentSetup, conversionFixture } from "../fixtures/s04.ts";
import { setup, MemoryStorage } from "../fixtures/setup.ts";
import { Graph } from "../../src/model/graph.ts";
import { compile } from "../../src/generation/compiler.ts";
import { esProfile, imageKind } from "../../src/modules/image.ts";
import {
  currentImageKind,
  currentOutput,
} from "../../src/modules/image-current.ts";
import {
  zeroOutputModule,
  zeroGraphKinds,
  zeroImageKind,
  zeroSources,
  zeroSourceRef,
  zeroOutput,
} from "../../src/modules/image-zero.ts";
import { EditorApplication } from "../../src/application/editor.ts";
import { writeDocument, readDocument } from "../../src/persistence/codec.ts";
import { equal } from "../../src/sdk/kernel.ts";
import { wireCurve } from "../../src/features/wire-geometry.ts";
function add(s: ReturnType<typeof currentSetup>) {
  s.definitions.register(zeroOutputModule);
  s.definitions.register(zeroGraphKinds);
  s.definitions.registerKind(zeroImageKind);
  s.definitions.register(zeroSources);
  return s.definitions.pin(s.definitions.pins());
}
function app(s: ReturnType<typeof currentSetup>) {
  return new EditorApplication(
    s.definitions,
    s.identity,
    zeroImageKind.ref,
    esProfile,
    new MemoryStorage(),
    { download: async () => {} },
  );
}
test("OC01 zero ImageOutput is additive and empty new document compiles and roundtrips", () => {
  const s = currentSetup(),
    fixed = add(s),
    g = Graph.create(zeroImageKind.ref, fixed, s.identity),
    before = g.capture();
  assert.equal(compile(before, fixed, esProfile).status, "success");
  const n = before.document.graph.stages.find((s) => s.key === "pixel")!.network
    .nodes[0];
  assert.deepEqual(n.inputValues.color, [0, 0, 0, 0]);
  assert.deepEqual(zeroOutput.boundaryOutputs!({}, n.ports), [
    { key: "color", type: "glsl.vec4", required: true },
  ]);
  assert.deepEqual(g.capture(), before);
  const read = readDocument(writeDocument(before.document, fixed));
  assert.equal(read.status, "editable");
  if (read.status === "editable") {
    const reopened = new Graph(read.document, fixed, s.identity);
    assert.equal(
      compile(reopened.capture(), fixed, esProfile).status,
      "success",
    );
    assert.deepEqual(reopened.capture().document, before.document);
  }
});
test("OC01 old exact ImageOutput pins retain required inputs and missing definitions never fall forward", () => {
  for (const s of [setup(), currentSetup()]) {
    const before = s.graph.capture();
    assert(
      compile(before, s.fixed, esProfile).diagnostics.some(
        (d) => d.code === "INPUT_REQUIRED",
      ),
    );
    add(s as ReturnType<typeof currentSetup>);
    assert.deepEqual(s.graph.capture(), before);
    assert(
      compile(
        before,
        s.definitions.pin(s.definitions.pins()),
        esProfile,
      ).diagnostics.some((d) => d.code === "INPUT_REQUIRED"),
    );
    const pins = before.document.graph.modules.filter(
      (p) => p.moduleId !== before.document.graph.kind.moduleId,
    );
    assert.equal(
      s.definitions.pin(pins).kind(before.document.graph.kind),
      undefined,
    );
  }
});
test("OC01 explicit exact kind upgrade preserves IDs edges plans inactive evidence and makes new lifetime", () => {
  for (const from of ["glsl.float", "glsl.vec2", "glsl.vec3", "glsl.vec4"]) {
    const s = conversionFixture(from, "glsl.vec4");
    add(s);
    const a = app(s),
      raw = writeDocument(s.graph.capture().document, s.fixed);
    a.openText(raw);
    const before = a.snapshot,
      old = context(a),
      src = structuredClone(before.document);
    a.upgradeGraphKind(zeroImageKind.ref);
    assert.notEqual(a.snapshot.loadId, before.loadId);
    assert.throws(() => old.capture());
    assert.equal(a.canUndo, false);
    assert.equal(a.generate().status, "success");
    const after = a.snapshot.document;
    assert.deepEqual(
      after.graph.stages.flatMap((s) => s.network.edges),
      src.graph.stages.flatMap((s) => s.network.edges),
    );
    assert.deepEqual(
      after.graph.stages.flatMap((s) => s.network.nodes.map((n) => n.id)),
      src.graph.stages.flatMap((s) => s.network.nodes.map((n) => n.id)),
    );
    assert.deepEqual(after.graph.losses, src.graph.losses);
    assert.deepEqual(after.graph.recovery, src.graph.recovery);
    assert.deepEqual(before.document, src);
    assert.equal(a.dirty, true);
    const current = a.snapshot;
    a.upgradeGraphKind(zeroImageKind.ref);
    assert.deepEqual(a.snapshot, current);
  }
});
function context(a: EditorApplication) {
  return a.context();
}
test("OC01 upgrade missing destination readonly busy malformed source and owner throws reject atomically", () => {
  const s = currentSetup();
  add(s);
  const a = app(s);
  a.openText(writeDocument(s.graph.capture().document, s.fixed));
  const before = a.snapshot;
  a.setReadonly(true);
  assert.throws(
    () => a.upgradeGraphKind(zeroImageKind.ref),
    /UPGRADE_UNAVAILABLE/,
  );
  assert.deepEqual(a.snapshot, before);
  a.setReadonly(false);
  assert.throws(
    () => a.upgradeGraphKind({ ...zeroImageKind.ref, fingerprint: "missing" }),
    /UPGRADE_OWNER_MISSING/,
  );
  assert.deepEqual(a.snapshot, before);
  const broken = structuredClone(before.document);
  broken.graph.stages.find((s) => s.key === "pixel")!.network.nodes = [];
  a.openText(JSON.stringify(broken));
  const b = a.snapshot;
  assert.throws(
    () => a.upgradeGraphKind(zeroImageKind.ref),
    /UPGRADE_BOUNDARY/,
  );
  assert.deepEqual(a.snapshot, b);
});
test("OC01 new source owner delegates exact image descriptor admission without relaxing old owner", () => {
  const s = currentSetup(),
    fixed = add(s),
    g = Graph.create(zeroImageKind.ref, fixed, s.identity);
  g.change("Numeric source", (d) =>
    d.createSource("Constant", "glsl.float", 0.2),
  );
  assert(equal(g.capture().document.graph.resources[0].type, zeroSourceRef));
  assert.equal(compile(g.capture(), fixed, esProfile).status, "success");
  const policy = zeroSources.resources![0].sourcePolicy!,
    ctx = {
      phase: "construction" as const,
      graphKind: zeroImageKind.ref,
      resources: [],
      types: fixed.types,
    };
  const invalid = policy.validate(
    {
      name: "Bad",
      type: "glsl.float",
      value: 1,
      clipboard: true,
      binding: { kind: "native-array", path: "x".repeat(4097) },
    },
    ctx,
  );
  assert(invalid.some((x) => x.severity === "error"));
  assert(
    !policy
      .validate(
        {
          name: "Uniform",
          type: "glsl.vec4",
          value: [1, 2, 3, 4],
          clipboard: true,
          binding: { kind: "uniform" },
        },
        ctx,
      )
      .some((x) => x.severity === "error"),
  );
});
test("OC08 shared wire geometry has horizontal endpoints and distance-aware controls for both directions", () => {
  for (const [a, b, d] of [
    [[0, 0], [100, 50], 1],
    [[500, 60], [50, 0], 1],
    [[0, 0], [0, 200], -1],
  ] as const) {
    const nums = wireCurve(a, b, d)
      .match(/-?\d+(?:\.\d+)?/g)!
      .map(Number);
    assert.deepEqual(nums.slice(0, 2), a);
    assert.deepEqual(nums.slice(-2), b);
    assert.equal(nums[3], a[1]);
    assert.equal(nums[5], b[1]);
    assert(Math.abs(nums[2] - a[0]) >= 24);
  }
});

import { copySelection } from "../../src/model/transfer.ts";
test("OC01 new exact source descriptor closure supports TOP sampler native array construction and cross-load transfer", () => {
  for (const [type, binding] of [
    [
      "glsl.sampler2D",
      { kind: "top", path: "/native", source: "a", origin: "b", slot: 7 },
    ],
    ["glsl.sampler2D", { kind: "sampler", path: "/native" }],
    ['array@["glsl.float",2]', { kind: "native-array", path: "/native" }],
  ] as const) {
    const s = currentSetup(),
      fixed = add(s),
      g = Graph.create(zeroImageKind.ref, fixed, s.identity),
      network = g
        .capture()
        .document.graph.stages.find((s) => s.key === "pixel")!.network.id;
    let node = "";
    g.change("Descriptor", (d) => {
      const id = d.createSource("Descriptor", type, null, true, binding);
      node = d.addReferenceNode(network, "source", id);
    });
    const packet = copySelection(g.capture(), fixed, network, [node]),
      destination = Graph.create(zeroImageKind.ref, fixed, s.identity),
      target = destination
        .capture()
        .document.graph.stages.find((s) => s.key === "pixel")!.network.id;
    destination.change("Transfer", (d) => d.paste(target, packet));
    assert.equal(destination.capture().document.graph.resources.length, 1);
    assert.deepEqual(
      (destination.capture().document.graph.resources[0].data as any).binding,
      binding.kind === "top" ? { ...binding, slot: 0 } : binding,
    );
    const before = destination.capture().document;
    destination.undo();
    assert.equal(destination.capture().document.graph.resources.length, 0);
    destination.redo();
    assert.deepEqual(destination.capture().document, before);
  }
});

test("OC01 owner migration refuses active gesture and throwing callback; source document remains unchanged", () => {
  const s = currentSetup();
  add(s);
  const a = app(s);
  a.openText(writeDocument(s.graph.capture().document, s.fixed));
  a.grant("test", ["grape.node.move"]);
  const c = a.context(),
    snap = c.capture(),
    id = c.network().nodes[0].id,
    gesture = a.beginGesture(
      { panelId: "test", typeId: "test" },
      { scope: snap.scope, object: null },
      { commandId: "grape.node.move", args: { ids: [id] } },
    ),
    before = a.snapshot;
  assert.throws(
    () => a.upgradeGraphKind(zeroImageKind.ref),
    /UPGRADE_UNAVAILABLE/,
  );
  assert.deepEqual(a.snapshot, before);
  gesture.cancel();
  const pin = {
    moduleId: "test.owner-upgrade",
    version: "1.0.0",
    fingerprint: "sha256:" + "8".repeat(64),
  };
  s.definitions.register({
    manifest: pin,
    presentation: {
      owner: { ...pin, namespace: pin.moduleId, catalogVersion: 1 },
      defaultLocale: "en",
    },
    nodes: [],
  });
  const kind = {
    ...currentImageKind,
    ref: { ...pin, kindId: "grape.image" },
    upgrades: [
      {
        from: currentImageKind.ref,
        upgrade: () => {
          throw Error("OWNER_THROW");
        },
      },
    ],
  };
  s.definitions.registerKind(kind);
  const clean = a.snapshot;
  assert.throws(() => a.upgradeGraphKind(kind.ref), /OWNER_THROW/);
  assert.deepEqual(a.snapshot, clean);
});
