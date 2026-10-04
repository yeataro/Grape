import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  functionFixture,
  functionSetup,
  shapeFixture,
  stageFixture,
  effectFixture,
} from "../fixtures/s05.ts";
import {
  arrayFixture,
  currentSetup,
  nestedArrayFixture,
} from "../fixtures/s04.ts";
import { MemoryStorage } from "../fixtures/setup.ts";
import {
  functionNetworks,
  functionNetworkRef,
} from "../../src/modules/function-networks.ts";
import {
  functionOperations,
  functionOperationRef,
  functionProfile,
} from "../../src/modules/function-operations.ts";
import { compile } from "../../src/generation/compiler.ts";
import { asNetwork, callResource } from "../../src/sdk/networks.ts";
import { Graph } from "../../src/model/graph.ts";
import { EditorApplication } from "../../src/application/editor.ts";
import { currentImageKind } from "../../src/modules/image-current.ts";
import { esProfile } from "../../src/modules/image.ts";
import { nodeRef } from "../../src/modules/nodes.ts";
import { networkRef } from "../../src/modules/networks.ts";
import { readDocument, writeDocument } from "../../src/persistence/codec.ts";
import {
  buildPersonal,
  readPersonal,
  packagePacket,
} from "../../src/application/personal.ts";
import { probeDefinitions } from "../../src/modules/package-probe.ts";
import { sha256Digest } from "../../src/application/digest.ts";
import { browserIdentity } from "../../src/adapters/browser/identity.ts";
const mode = (
  s: ReturnType<typeof functionFixture>,
  value: "expand" | "function",
) => s.graph.change("Mode", (d) => d.emissionMode(s.body, value, s.profile));
const result = (s: ReturnType<typeof functionFixture>) =>
  compile(s.graph.capture(), s.fixed, s.profile);
test("S05 AT03 source/literal shape extents stay fixed; input-bound scalar extent cannot specialize a function", () => {
  for (const kind of ["literal", "source", "input"] as const) {
    const old = arrayFixture(kind),
      original = old.graph.capture().document;
    old.definitions.register(functionNetworks);
    old.definitions.register(functionOperations);
    const app = new EditorApplication(
      old.definitions,
      old.identity,
      currentImageKind.ref,
      functionProfile,
      new MemoryStorage(),
      { download: async () => {} },
      probeDefinitions,
    );
    app.openText(writeDocument(original));
    app.upgradeOwners();
    const fixed = old.definitions.pin(app.snapshot.document.graph.modules),
      graph = new Graph(app.snapshot.document, fixed, old.identity),
      resource = graph
        .capture()
        .document.graph.resources.find((r) => asNetwork(r, fixed))!,
      body = asNetwork(resource, fixed)!.network.id,
      before = graph.capture();
    if (kind === "input") {
      assert.throws(
        () =>
          graph.change("Function", (d) =>
            d.emissionMode(body, "function", functionProfile),
          ),
        /FUNCTION_EXTENT_PARAMETER/,
      );
      assert.deepEqual(graph.capture(), before);
    } else {
      graph.change("Function", (d) =>
        d.emissionMode(body, "function", functionProfile),
      );
      assert.equal(
        (
          graph
            .capture()
            .document.graph.resources.find((r) => r.id === resource.id)!
            .data as any
        ).emissionMode,
        "function",
      );
    }
  }
  const s = shapeFixture("array");
  s.graph.change("Function", (d) =>
    d.emissionMode(s.body, "function", s.profile),
  );
  assert.equal(
    compile(s.graph.capture(), s.fixed, s.profile).status,
    "success",
  );
});
test("S05 AT04 pre-existing malformed constant edge and authored losses are preserved", () => {
  const s = functionFixture();
  let receiver = "";
  s.graph.change("Consumer", (d) => {
    receiver = d.add(s.network, functionOperationRef("constant-input"), [0, 0]);
    d.connect(
      s.network,
      { nodeId: s.call, portKey: "y" },
      { nodeId: receiver, portKey: "value" },
    );
  });
  const doc = structuredClone(s.graph.capture().document),
    network = doc.graph.stages.find(
      (st) => st.network.id === s.network,
    )!.network,
    edge = network.edges.find((e) => e.to.nodeId === receiver)!;
  edge.adaptation.targetType = "glsl.vec3";
  doc.graph.losses.push({
    schema: "grape.loss",
    version: 1,
    id: "old-loss",
    code: "OLD",
    reason: "Previous error",
    payload: {
      kind: "edge",
      networkId: network.id,
      edge: structuredClone(edge),
    },
    extensions: { retained: true },
  });
  const graph = new Graph(doc, s.fixed, s.identity),
    before = graph.capture().document;
  graph.change("Function", (d) =>
    d.emissionMode(s.body, "function", s.profile),
  );
  const after = graph.capture().document;
  assert.deepEqual(after.graph.losses, before.graph.losses);
  assert.deepEqual(
    after.graph.stages
      .find((st) => st.network.id === s.network)!
      .network.edges.find((e) => e.id === edge.id),
    edge,
  );
  assert.ok(graph.capture().diagnostics.some((i) => i.code === "EDGE_INVALID"));
});
test("S05 AT04 AT05 unused shared dependent definitions localize and detach atomically with Redo exact", () => {
  const s = functionFixture();
  let dependent = "";
  s.graph.change("Unused parent", (d) => {
    dependent = d.createSubgraph(s.network, "Unused parent", null, true);
  });
  const parent = s.graph
      .capture()
      .document.graph.resources.find(
        (r) => asNetwork(r, s.fixed)?.name === "Unused parent",
      )!,
    parentBody = asNetwork(parent, s.fixed)!.network.id;
  s.graph.change("Unused callers", (d) => {
    for (let i = 0; i < 2; i++) {
      const call = d.addReferenceNode(
          parentBody,
          "call",
          s.definition().resource.id,
        ),
        add = d.add(parentBody, functionOperationRef("add"), [0, 0]),
        receiver = d.add(
          parentBody,
          functionOperationRef("constant-input"),
          [0, 0],
        );
      d.connect(
        parentBody,
        { nodeId: call, portKey: "y" },
        { nodeId: add, portKey: "a" },
      );
      d.connect(
        parentBody,
        { nodeId: add, portKey: "value" },
        { nodeId: receiver, portKey: "value" },
      );
    }
    d.remove(s.network, dependent);
  });
  const doc = structuredClone(s.graph.capture().document);
  for (const r of doc.graph.resources.filter((r) => asNetwork(r, s.fixed))) {
    (r.data as any).local = false;
    (r.data as any).origin = "immutable-library";
  }
  const graph = new Graph(doc, s.fixed, s.identity),
    before = graph.capture().document;
  let count = 0;
  graph.subscribe(() => count++);
  graph.change("Mode and forks", (d) =>
    d.emissionMode(s.body, "function", s.profile),
  );
  const after = graph.capture().document;
  assert.equal(count, 1);
  assert.equal(
    after.graph.losses.filter((l) => l.code === "FUNCTION_CONSTANT_DETACHED")
      .length,
    2,
  );
  assert.ok(
    after.graph.resources
      .filter((r) => asNetwork(r, s.fixed))
      .every((r) => asNetwork(r, s.fixed)!.local),
  );
  graph.undo();
  assert.deepEqual(graph.capture().document, before);
  graph.redo();
  assert.deepEqual(graph.capture().document, after);
});
test("S05 AT08 multioutput and unconsumed nested effects have one evaluation per occurrence and stage-local helpers", () => {
  const s = effectFixture(true, true, true),
    out = result(s);
  assert.equal(out.status, "success", JSON.stringify(out.diagnostics));
  const code = out.artifacts.find((a) => a.key === "pixel")!.text;
  assert.match(code, /discard/);
  assert.equal((code.match(/gl_FragDepth =/g) || []).length, 1);
  assert.equal((code.match(/void grape_function_/g) || []).length, 2);
  const stage = stageFixture(),
    generated = compile(stage.graph.capture(), stage.fixed, stage.profile);
  assert.equal(
    generated.status,
    "success",
    JSON.stringify(generated.diagnostics),
  );
  for (const artifact of generated.artifacts)
    assert.equal(
      (artifact.text.match(/void grape_function_/g) || []).length,
      1,
    );
});
test("S05 AT08 two live depth writer occurrences reject even when one helper body is deduplicated", () => {
  const s = effectFixture();
  s.graph.change("Second effect occurrence", (d) =>
    d.addReferenceNode(s.network, "call", s.definition().resource.id),
  );
  const before = s.graph.capture(),
    out = result(s);
  assert.equal(out.status, "failed");
  assert.ok(out.diagnostics.some((d) => d.code === "DEPTH_WRITERS"));
  assert.deepEqual(s.graph.capture(), before);
});
test("S05 AT01 definition default shared mode independent and no-op History", () => {
  const s = functionFixture();
  assert.equal((s.definition().resource.data as any).emissionMode, "expand");
  mode(s, "function");
  const before = s.graph.capture();
  mode(s, "function");
  assert.deepEqual(s.graph.capture(), before);
  s.graph.change("Independent", (d) => d.makeIndependent(s.network, s.second));
  const doc = s.graph.capture().document,
    node = doc.graph.stages
      .find((st) => st.network.id === s.network)!
      .network.nodes.find((n) => n.id === s.second)!,
    r = doc.graph.resources.find((r) => r.id === callResource(node, s.fixed))!;
  assert.equal((r.data as any).emissionMode, "function");
  s.graph.change("Separate mode", (d) =>
    d.emissionMode(asNetwork(r, s.fixed)!.network.id, "expand", s.profile),
  );
  assert.equal((s.definition().resource.data as any).emissionMode, "function");
  assert.equal(result(s).status, "success");
});
test("S05 AT02 one helper per definition and distinct caller arguments; nested helpers are dependency ordered", () => {
  const s = functionFixture();
  mode(s, "function");
  let code = result(s).artifacts.find((a) => a.key === "pixel")!.text;
  assert.equal((code.match(/void grape_function_/g) || []).length, 1);
  assert.equal((code.match(/grape_function_0\(/g) || []).length, 3);
  assert.match(code, /grape_function_0\(0.2,/);
  assert.match(code, /grape_function_0\(0.3,/);
  let outer = "";
  s.graph.change("Nested", (d) => {
    outer = d.encapsulate(s.network, [s.call, s.second]);
  });
  const r = s.graph
    .capture()
    .document.graph.resources.find((r) =>
      asNetwork(r, s.fixed)?.network.nodes.some((n) => n.id === s.call),
    )!;
  s.graph.change("Outer function", (d) =>
    d.emissionMode(asNetwork(r, s.fixed)!.network.id, "function", s.profile),
  );
  const out = result(s);
  assert.equal(out.status, "success", JSON.stringify(out.diagnostics));
  code = out.artifacts.find((a) => a.key === "pixel")!.text;
  assert.equal((code.match(/void grape_function_/g) || []).length, 2);
  assert.ok(
    code.indexOf("void grape_function_1") <
      code.indexOf("void grape_function_0"),
  );
});
test("S05 AT03 ordinary inputs are runtime even when all callers pass constants; dead constant uses reject atomically", () => {
  const s = functionFixture();
  let consumer = "";
  s.graph.change("Authored constant use", (d) => {
    consumer = d.add(s.body, functionOperationRef("constant-input"), [0, 0]);
    const input = s.definition().data.network.nodes[0];
    d.connect(
      s.body,
      { nodeId: input.id, portKey: "x" },
      { nodeId: consumer, portKey: "value" },
    );
  });
  const before = s.graph.capture(),
    undo = s.graph.canUndo,
    redo = s.graph.canRedo;
  let events = 0;
  const off = s.graph.subscribe(() => events++);
  assert.throws(
    () => mode(s, "function"),
    /FUNCTION_INELIGIBLE|CONSTANT_REQUIRED/,
  );
  assert.deepEqual(s.graph.capture(), before);
  assert.equal(s.graph.canUndo, undo);
  assert.equal(s.graph.canRedo, redo);
  assert.equal(events, 0);
  off();
  s.graph.change("Internal literal", (d) => {
    const e = s
      .definition()
      .data.network.edges.find((e) => e.to.nodeId === consumer)!;
    d.disconnect(s.body, e.id);
    const n = d.add(s.body, nodeRef("float"), [0, 0]);
    d.connect(
      s.body,
      { nodeId: n, portKey: "value" },
      { nodeId: consumer, portKey: "value" },
    );
  });
  mode(s, "function");
  assert.equal(result(s).status, "success");
});
test("S05 AT03 Uniform parameter binding is runtime; ordinary connection rejects constant receiver without publication", () => {
  const s = functionFixture(false);
  let source = "",
    receiver = "";
  s.graph.change("Uniform", (d) => {
    const id = d.createSource("gain", "glsl.float", 0.4, true, {
      kind: "uniform",
    });
    source = d.addReferenceNode(
      s.network,
      "source",
      id,
      undefined,
      functionOperationRef("source"),
    );
    d.connect(
      s.network,
      { nodeId: source, portKey: "value" },
      { nodeId: s.call, portKey: "x" },
    );
    receiver = d.add(s.network, functionOperationRef("constant-input"), [0, 0]);
  });
  const before = s.graph.capture();
  assert.throws(
    () =>
      s.graph.change("Bad connect", (d) =>
        d.connect(
          s.network,
          { nodeId: source, portKey: "value" },
          { nodeId: receiver, portKey: "value" },
        ),
      ),
    /CONSTANT_REQUIRED/,
  );
  assert.deepEqual(s.graph.capture(), before);
  s.graph.change("Remove unused required", (d) =>
    d.remove(s.network, receiver),
  );
  mode(s, "function");
  const out = result(s);
  assert.equal(out.status, "success", JSON.stringify(out.diagnostics));
  assert.equal(out.bindingSchema.length, 1);
  assert.match(
    out.artifacts.find((a) => a.key === "pixel")!.text,
    /uniform float u_grape_0/,
  );
});
test("S05 AT04 AT05 transitive newly-invalid consumer edges detach once with losses, Undo/Redo and required error", () => {
  const s = functionFixture();
  let add = "",
    consumer = "";
  s.graph.change("Downstream", (d) => {
    add = d.add(s.network, functionOperationRef("add"), [0, 0]);
    consumer = d.add(s.network, functionOperationRef("constant-input"), [0, 0]);
    d.connect(
      s.network,
      { nodeId: s.call, portKey: "y" },
      { nodeId: add, portKey: "a" },
    );
    d.connect(
      s.network,
      { nodeId: add, portKey: "value" },
      { nodeId: consumer, portKey: "value" },
    );
  });
  const before = s.graph.capture().document;
  let events = 0;
  s.graph.subscribe(() => events++);
  mode(s, "function");
  assert.equal(events, 1);
  const after = s.graph.capture().document,
    loss = after.graph.losses.at(-1)!;
  const saved = readDocument(writeDocument(after));
  assert.equal(saved.status, "editable");
  if (saved.status === "editable")
    assert.deepEqual(
      new Graph(saved.document, s.fixed, s.identity).capture().document,
      after,
    );
  assert.equal(loss.code, "FUNCTION_CONSTANT_DETACHED");
  assert.equal(loss.payload.kind, "edge");
  if (loss.payload.kind === "edge")
    assert.equal(loss.payload.edge.to.nodeId, consumer);
  assert.ok(
    after.graph.stages
      .find((st) => st.network.id === s.network)!
      .network.edges.some((e) => e.to.nodeId === add),
  );
  assert.equal(result(s).status, "failed");
  s.graph.undo();
  assert.deepEqual(s.graph.capture().document, before);
  s.graph.redo();
  assert.deepEqual(s.graph.capture().document, after);
  mode(s, "expand");
  assert.equal(
    s.graph.capture().document.graph.losses.length,
    after.graph.losses.length,
  );
  assert.equal(result(s).status, "failed");
});
test("S05 AT06 function Personal roundtrip reuses mode, localizes once and preserves source bytes", async () => {
  const s = functionFixture();
  mode(s, "function");
  const asset = await buildPersonal(
      s.graph.capture(),
      s.fixed,
      s.definition().resource.id,
      s.profile,
      probeDefinitions,
    ),
    bytes = JSON.stringify(asset);
  const imported = await readPersonal(
      bytes,
      s.fixed,
      s.profile,
      probeDefinitions,
    ),
    target = functionFixture();
  let ids: string[] = [];
  target.graph.change("Insert", (d) => {
    ids = d.insertLibrary(
      target.network,
      packagePacket(imported, target.graph.capture().document, target.fixed),
      asset.contentHash,
    );
  });
  const r = target.graph
    .capture()
    .document.graph.resources.find(
      (r) => asNetwork(r, target.fixed)?.local === false,
    )!;
  assert.equal((r.data as any).emissionMode, "function");
  const before = target.graph.capture().document;
  target.graph.change("Local mode", (d) =>
    d.emissionMode(
      asNetwork(r, target.fixed)!.network.id,
      "expand",
      target.profile,
    ),
  );
  assert.equal(JSON.stringify(asset), bytes);
  assert.ok(
    target.graph
      .capture()
      .document.graph.resources.some(
        (x) =>
          asNetwork(x, target.fixed)?.local &&
          (x.data as any).emissionMode === "expand",
      ),
  );
  target.graph.undo();
  assert.deepEqual(target.graph.capture().document, before);
  const read = readDocument(writeDocument(before));
  assert.equal(read.status, "editable");
  if (read.status !== "editable") return;
  const reopened = new Graph(read.document, target.fixed, target.identity);
  assert.equal(
    compile(reopened.capture(), target.fixed, target.profile).status,
    "success",
  );
  const again = await buildPersonal(
    reopened.capture(),
    target.fixed,
    r.id,
    target.profile,
    probeDefinitions,
  );
  assert.equal(again.contentHash, asset.contentHash);
});
test("S05 AT06 DEC004 upgraded literal source input and nested Personal retain selected eligible modes through exchange", async () => {
  for (const kind of ["literal", "source", "input", "nested"] as const) {
    const old = kind === "nested" ? nestedArrayFixture() : arrayFixture(kind);
    old.definitions.register(functionNetworks);
    old.definitions.register(functionOperations);
    const app = new EditorApplication(
      old.definitions,
      old.identity,
      currentImageKind.ref,
      functionProfile,
      new MemoryStorage(),
      { download: async () => {} },
      probeDefinitions,
    );
    app.openText(writeDocument(old.graph.capture().document));
    app.upgradeOwners();
    const fixed = old.definitions.pin(app.snapshot.document.graph.modules),
      graph = new Graph(app.snapshot.document, fixed, old.identity),
      root = kind === "nested" ? (old as any).outer : old.id;
    const rootId =
      typeof root === "string" &&
      graph.capture().document.graph.resources.some((r) => r.id === root)
        ? root
        : graph
            .capture()
            .document.graph.resources.filter((r) => asNetwork(r, fixed))
            .at(-1)!.id;
    const resource = graph
      .capture()
      .document.graph.resources.find((r) => r.id === rootId)!;
    if (kind === "literal" || kind === "source")
      graph.change("Function", (d) =>
        d.emissionMode(
          asNetwork(resource, fixed)!.network.id,
          "function",
          functionProfile,
        ),
      );
    const asset = await buildPersonal(
        graph.capture(),
        fixed,
        rootId,
        functionProfile,
        probeDefinitions,
      ),
      accepted = await readPersonal(
        JSON.stringify(asset),
        fixed,
        functionProfile,
        probeDefinitions,
      ),
      target = functionFixture();
    target.graph.change("Insert", (d) =>
      d.insertLibrary(
        target.network,
        packagePacket(accepted, target.graph.capture().document, target.fixed),
        asset.contentHash,
      ),
    );
    const read = readDocument(writeDocument(target.graph.capture().document));
    assert.equal(read.status, "editable");
    if (read.status !== "editable") continue;
    const reopened = new Graph(read.document, target.fixed, target.identity);
    assert.equal(
      compile(reopened.capture(), target.fixed, functionProfile).status,
      "success",
      kind,
    );
    assert.ok(
      reopened
        .capture()
        .document.graph.resources.filter((r) => asNetwork(r, target.fixed))
        .every((r) =>
          ["expand", "function"].includes((r.data as any).emissionMode),
        ),
    );
  }
});
test("S05 AT07 explicit owner upgrade preserves old pins/body/origin and unknown mode never defaults", () => {
  const old = currentSetup();
  let call = "";
  old.graph.change("Old", (d) => {
    call = d.createSubgraph(old.network);
  });
  const before = old.graph.capture().document;
  old.definitions.register(functionNetworks);
  old.definitions.register(functionOperations);
  const app = new EditorApplication(
    old.definitions,
    old.identity,
    currentImageKind.ref,
    functionProfile,
    new MemoryStorage(),
    { download: async () => {} },
    probeDefinitions,
  );
  app.openText(writeDocument(before));
  assert.equal(
    app.snapshot.document.graph.resources[0].type.typeId,
    "definition",
  );
  assert.deepEqual(app.snapshot.document.graph.modules, before.graph.modules);
  app.upgradeOwners();
  const r = app.snapshot.document.graph.resources[0];
  assert.deepEqual(r.type, functionNetworkRef);
  assert.equal((r.data as any).emissionMode, "expand");
  assert.deepEqual(
    (r.data as any).network,
    (before.graph.resources[0].data as any).network,
  );
  assert.ok(
    app.snapshot.document.graph.modules.some(
      (p) => p.fingerprint === networkRef("definition").fingerprint,
    ),
  );
  for (const bad of [undefined, "automatic"]) {
    const doc = structuredClone(app.snapshot.document);
    if (bad === undefined)
      delete (doc.graph.resources[0].data as any).emissionMode;
    else (doc.graph.resources[0].data as any).emissionMode = bad;
    const graph = new Graph(
      doc,
      old.definitions.pin(doc.graph.modules),
      old.identity,
    );
    assert.equal(
      compile(graph.capture(), graph.definitionSet, functionProfile).status,
      "failed",
    );
    assert.equal(
      (graph.capture().document.graph.resources[0].data as any).emissionMode,
      bad,
    );
  }
  const missing = old.definitions.pin(before.graph.modules),
    opaque = new Graph(app.snapshot.document, missing, old.identity);
  assert.deepEqual(opaque.capture().document.graph.resources[0].data, r.data);
  assert.equal(
    compile(opaque.capture(), missing, functionProfile).status,
    "failed",
  );
});
test("S05 AT09 later invalid edit and load retain function mode; diagnostic names shared definition and related calls", () => {
  const s = functionFixture();
  mode(s, "function");
  let consumer = "";
  s.graph.change("Later required node", (d) => {
    consumer = d.add(s.body, functionOperationRef("constant-input"), [0, 0]);
  });
  const data = s.definition().data,
    input = data.network.nodes[0],
    doc = structuredClone(s.graph.capture().document),
    body = doc.graph.resources.find((r) => r.id === s.definition().resource.id)!
      .data as any;
  const target = body.network.nodes.find((n: any) => n.id === consumer)
    .ports[0];
  body.network.edges.push({
    id: "loaded-invalid-constant",
    from: { nodeId: input.id, portKey: "x" },
    to: { nodeId: consumer, portKey: "value" },
    adaptation: s.fixed.types.adaptation(input.ports[0], target),
    extensions: {},
  });
  const graph = new Graph(doc, s.fixed, s.identity),
    before = graph.capture(),
    out = compile(before, s.fixed, s.profile);
  assert.equal(out.status, "failed");
  assert.deepEqual(graph.capture(), before);
  assert.equal(
    (
      graph
        .capture()
        .document.graph.resources.find(
          (r) => r.id === s.definition().resource.id,
        )!.data as any
    ).emissionMode,
    "function",
  );
  const error = out.diagnostics.find(
    (i) => i.code === "CONSTANT_REQUIRED" && i.subject?.nodeId === consumer,
  )!;
  assert.equal(error.subject?.resourceId, s.definition().resource.id);
  assert.equal(error.related?.length, 2);
});
test("S05 AT10 body/mode/profile changes create fresh artifacts and old snapshot is immutable", () => {
  const s = functionFixture();
  mode(s, "function");
  const snapshot = s.graph.capture(),
    first = compile(snapshot, s.fixed, s.profile);
  mode(s, "expand");
  assert.notDeepEqual(result(s).artifacts, first.artifacts);
  assert.deepEqual(compile(snapshot, s.fixed, s.profile), first);
  assert.equal(compile(snapshot, s.fixed, esProfile).status, "failed");
  mode(s, "function");
  let literal = "";
  s.graph.change("Body edit", (d) => {
    literal = d.add(s.body, nodeRef("float"), [0, 0]);
    d.parameter(s.body, literal, "value", 0.125);
    d.connect(
      s.body,
      { nodeId: literal, portKey: "value" },
      { nodeId: s.add, portKey: "b" },
      true,
    );
  });
  const bodyChanged = result(s);
  assert.equal(bodyChanged.status, "success");
  assert.notDeepEqual(bodyChanged.artifacts, first.artifacts);
  s.graph.change("New dependency", (d) => d.encapsulate(s.body, [literal]));
  const child = s.graph
    .capture()
    .document.graph.resources.find((r) =>
      asNetwork(r, s.fixed)?.network.nodes.some((n) => n.id === literal),
    )!;
  s.graph.change("Dependency mode", (d) =>
    d.emissionMode(
      asNetwork(child, s.fixed)!.network.id,
      "function",
      s.profile,
    ),
  );
  const dependencyChanged = result(s);
  assert.equal(dependencyChanged.status, "success");
  assert.notDeepEqual(dependencyChanged.artifacts, bodyChanged.artifacts);
  assert.deepEqual(compile(snapshot, s.fixed, s.profile), first);
});
test("S05 HTTP provider SHA256 canonical bytes known vectors and secure UUIDv4 fail-closed", () => {
  for (const text of ["", "abc", "中🍇", "a".repeat(1000000)]) {
    const bytes = new TextEncoder().encode(text);
    assert.equal(
      sha256Digest(bytes),
      createHash("sha256").update(bytes).digest("hex"),
    );
  }
  const provider = browserIdentity(),
    ids = new Set(Array.from({ length: 10000 }, () => provider.next()));
  assert.equal(ids.size, 10000);
  for (const id of ids)
    assert.match(
      id,
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  assert.throws(
    () => browserIdentity({} as Crypto).next(),
    /SECURE_ENTROPY_UNAVAILABLE/,
  );
});
