import test from "node:test";
import assert from "node:assert/strict";
import {
  valueCases,
  valueFixture,
  valuesSetup,
} from "../fixtures/s05-values.ts";
import {
  fixedValues,
  fixedValueRef,
  FIXED_VALUES_PIN,
} from "../../src/modules/fixed-values.ts";
import { functionOperationRef } from "../../src/modules/function-operations.ts";
import { nodeRef, NODE_PIN } from "../../src/modules/nodes.ts";
import { compile } from "../../src/generation/compiler.ts";
import { Graph } from "../../src/model/graph.ts";
import { writeDocument, readDocument } from "../../src/persistence/codec.ts";
import { asNetwork, typeSystem } from "../../src/sdk/networks.ts";
import { EditorApplication } from "../../src/application/editor.ts";
import { MemoryStorage } from "../fixtures/setup.ts";
import { currentImageKind } from "../../src/modules/image-current.ts";
import {
  buildPersonal,
  readPersonal,
  packagePacket,
} from "../../src/application/personal.ts";
import { probeDefinitions } from "../../src/modules/package-probe.ts";
import { functionFixture } from "../fixtures/s05.ts";
for (const item of valueCases) {
  test(`S05 fixed ${item.key}: literals inside Function stay constant while formal and result are runtime`, () => {
    const old = functionFixture();
    old.definitions.register(fixedValues);
    const fixed = old.definitions.pin(old.definitions.pins()),
      doc = structuredClone(old.graph.capture().document);
    doc.graph.modules = structuredClone(fixed.pins);
    const graph = new Graph(doc, fixed, old.identity);
    let receiver = "",
      leaf = "";
    graph.change("Formal constant use", (d) => {
      receiver = d.add(
        old.body,
        functionOperationRef("constant-input"),
        [0, 0],
      );
      d.connect(
        old.body,
        { nodeId: old.definition().data.network.nodes[0].id, portKey: "x" },
        { nodeId: receiver, portKey: "value" },
      );
      leaf = d.add(old.network, fixedValueRef(item.key), [0, 0]);
      d.connect(
        old.network,
        { nodeId: leaf, portKey: "out" },
        { nodeId: old.call, portKey: "x" },
      );
    });
    const before = graph.capture();
    assert.throws(
      () =>
        graph.change("Function", (d) =>
          d.emissionMode(old.body, "function", old.profile),
        ),
      /FUNCTION_INELIGIBLE|CONSTANT_REQUIRED/,
    );
    assert.deepEqual(graph.capture(), before);
    graph.change("Internal literal", (d) => {
      d.disconnect(
        old.body,
        graph
          .resolveNetwork(old.body)
          .edges.find((e) => e.to.nodeId === receiver)!.id,
      );
      const n = d.add(old.body, fixedValueRef(item.key), [0, 0]);
      d.connect(
        old.body,
        { nodeId: n, portKey: "out" },
        { nodeId: receiver, portKey: "value" },
      );
    });
    graph.change("Function", (d) =>
      d.emissionMode(old.body, "function", old.profile),
    );
    assert.equal(
      compile(graph.capture(), fixed, old.profile).status,
      "success",
    );
    graph.change("Result receiver", (d) => {
      receiver = d.add(
        old.network,
        functionOperationRef("constant-input"),
        [0, 0],
      );
    });
    const after = graph.capture();
    assert.throws(
      () =>
        graph.change("Function result constant", (d) =>
          d.connect(
            old.network,
            { nodeId: old.call, portKey: "y" },
            { nodeId: receiver, portKey: "value" },
          ),
        ),
      /CONSTANT_REQUIRED/,
    );
    assert.deepEqual(graph.capture(), after);
  });
  test(`S05 fixed ${item.key}: defaults fixed schema every stage and mode with pure generation and roundtrip`, () => {
    for (const stage of ["pixel", "vertex"] as const)
      for (const mode of ["root", "expand", "function", "nested"] as const)
        for (const edited of [false, true]) {
          const s = valueFixture(item.key, stage, mode, edited),
            snapshot = s.graph.capture(),
            out = compile(snapshot, s.fixed, s.profile);
          assert.equal(out.status, "success", JSON.stringify(out.diagnostics));
          assert.deepEqual(s.graph.capture(), snapshot);
          const n = (
            mode === "root"
              ? s.graph.resolveNetwork(s.network)
              : asNetwork(
                  snapshot.document.graph.resources.find((r) =>
                    asNetwork(r, s.fixed)?.network.nodes.some(
                      (n) => n.id === s.leaf,
                    ),
                  )!,
                  s.fixed,
                )!.network
          ).nodes.find((n) => n.id === s.leaf)!;
          assert.deepEqual(n.state, {
            value: edited ? item.edited : item.initial,
          });
          assert.deepEqual(n.ports, [
            { key: "out", direction: "output", type: item.type },
          ]);
          const loaded = readDocument(writeDocument(snapshot.document));
          assert.equal(loaded.status, "editable");
          if (loaded.status === "editable")
            assert.deepEqual(
              new Graph(loaded.document, s.fixed, s.identity).capture()
                .document,
              snapshot.document,
            );
        }
  });
  test(`S05 fixed ${item.key}: bad payloads unused errors atomic commands fixed source and constant distinction`, () => {
    const s = valueFixture(item.key),
      node = s.graph
        .resolveNetwork(s.network)
        .nodes.find((n) => n.id === s.leaf)!,
      before = s.graph.capture();
    let events = 0;
    s.graph.subscribe(() => events++);
    for (const value of [
      null,
      "1",
      true,
      [],
      [1],
      [1, 2, 3, 4, 5],
      Infinity,
      NaN,
      1e40,
      ...(item.key === "float"
        ? [[0.5]]
        : [
            0.5,
            [...(item.initial as number[]), 0],
            ...[NaN, Infinity, 1e40, "1", null].map((value) => [
              ...(item.initial as number[]).slice(0, -1),
              value,
            ]),
          ]),
    ]) {
      assert.throws(() =>
        s.graph.change("Invalid", (d) =>
          d.parameter(s.network, s.leaf, "value", value),
        ),
      );
      assert.deepEqual(s.graph.capture(), before);
      assert.equal(events, 0);
    }
    s.graph.change("Constant use", (d) => {
      const receiver = d.add(
        s.network,
        functionOperationRef("constant-input"),
        [300, 200],
      );
      d.connect(
        s.network,
        { nodeId: s.leaf, portKey: "out" },
        { nodeId: receiver, portKey: "value" },
      );
    });
    assert.equal(
      compile(s.graph.capture(), s.fixed, s.profile).status,
      "success",
    );
    assert.equal(
      s.graph.resolveNetwork(s.network).nodes.find((n) => n.id === s.leaf)!
        .ports[0].type,
      item.type,
    );
    assert.equal(
      typeSystem(s.graph.capture().document, s.fixed).extent(s.leaf),
      undefined,
    );
    const doc = structuredClone(s.graph.capture().document),
      n = doc.graph.stages
        .find((st) => st.network.id === s.network)!
        .network.nodes.find((n) => n.id === s.leaf)!;
    n.state = { value: ["bad"] };
    doc.graph.stages.find((st) => st.network.id === s.network)!.network.edges =
      [];
    const bad = new Graph(doc, s.fixed, s.identity),
      badBefore = bad.capture(),
      failed = compile(badBefore, s.fixed, s.profile);
    assert.equal(failed.status, "failed");
    assert.deepEqual(bad.capture(), badBefore);
    assert.ok(badBefore.diagnostics.some((d) => d.code === "FIXED_VALUE"));
    const unsupported = { ...s.profile, capabilities: [] };
    assert.equal(compile(before, s.fixed, unsupported).status, "failed");
    assert.deepEqual(s.fixed.node(nodeRef("float"))!.initialize(), {
      value: 0.25,
    });
    assert.notDeepEqual(FIXED_VALUES_PIN, NODE_PIN);
  });
  test(`S05 fixed ${item.key}: scoped two-context edits one Undo and stale token preserve History`, () => {
    const s = valueFixture(item.key),
      app = new EditorApplication(
        s.definitions,
        s.identity,
        currentImageKind.ref,
        s.profile,
        new MemoryStorage(),
        { download: async () => {} },
      );
    app.openText(writeDocument(s.graph.capture().document));
    app.grant("grape.canvas", ["grape.undo", "grape.redo"]);
    const a = app.context(),
      b = app.context();
    a.select([s.leaf]);
    b.select([s.leaf]);
    const fa = app.parameter(a, s.leaf, "value", a.capture().scope),
      fb = app.parameter(b, s.leaf, "value", b.capture().scope),
      token = fa.capture().editToken,
      before = app.snapshot.document;
    fa.commit(structuredClone(item.edited), token);
    assert.deepEqual(fb.capture().projection.value, item.edited);
    const after = app.snapshot.document;
    assert.throws(
      () => fa.commit(structuredClone(item.initial), token),
      /STALE_EDIT/,
    );
    assert.deepEqual(app.snapshot.document, after);
    app.execute(
      { panelId: "test", typeId: "grape.canvas" },
      { scope: a.capture().scope, object: { kind: "node", id: s.leaf } },
      { commandId: "grape.undo", args: {} },
    );
    assert.deepEqual(app.snapshot.document, before);
    app.execute(
      { panelId: "test", typeId: "grape.canvas" },
      { scope: a.capture().scope, object: { kind: "node", id: s.leaf } },
      { commandId: "grape.redo", args: {} },
    );
    assert.deepEqual(app.snapshot.document, after);
    app.openText(writeDocument(after));
    assert.throws(() => fa.capture());
    fa.dispose();
    fb.dispose();
  });
  test(`S05 fixed ${item.key}: shared Function and Personal owner closure retain exact values`, async () => {
    const s = valueFixture(item.key, "pixel", "function", true),
      resource = s.graph
        .capture()
        .document.graph.resources.find(
          (r) => asNetwork(r, s.fixed)?.network.id === s.bodies[0],
        )!,
      asset = await buildPersonal(
        s.graph.capture(),
        s.fixed,
        resource.id,
        s.profile,
        probeDefinitions,
      ),
      bytes = JSON.stringify(asset),
      read = await readPersonal(bytes, s.fixed, s.profile, probeDefinitions),
      target = valueFixture(item.key);
    target.graph.change("Import", (d) =>
      d.insertLibrary(
        target.network,
        packagePacket(read, target.graph.capture().document, target.fixed),
        asset.contentHash,
      ),
    );
    assert.ok(
      target.graph
        .capture()
        .document.graph.resources.some((r) =>
          asNetwork(r, target.fixed)?.network.nodes.some(
            (n) => n.type.moduleId === FIXED_VALUES_PIN.moduleId,
          ),
        ),
    );
    assert.equal(JSON.stringify(asset), bytes);
    const absent = s.definitions.pin(
        s.fixed.pins.filter((p) => p.moduleId !== FIXED_VALUES_PIN.moduleId),
      ),
      missing = new Graph(s.graph.capture().document, absent, s.identity);
    assert.equal(
      compile(missing.capture(), absent, s.profile).status,
      "failed",
    );
    assert.deepEqual(missing.capture().document, s.graph.capture().document);
  });
}
