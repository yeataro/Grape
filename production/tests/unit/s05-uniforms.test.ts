import test from "node:test";
import assert from "node:assert/strict";
import {
  linkedUniformFixture,
  uniformCases,
  uniformModes,
} from "../fixtures/s05-uniforms.ts";
import { stageFixture } from "../fixtures/s05.ts";
import { compile } from "../../src/generation/compiler.ts";
import { functionOperations } from "../../src/modules/function-operations.ts";
import { Graph } from "../../src/model/graph.ts";
import { nodeRef } from "../../src/modules/nodes.ts";
import type { ModuleContribution } from "../../src/sdk/editing.ts";

test("S05-FR-001 complete program preserves distinct and reversed shared Uniform identity in all emission modes", () => {
  for (const kind of uniformCases)
    for (const mode of uniformModes) {
      const s = linkedUniformFixture(kind, mode),
        before = s.graph.capture(),
        out = compile(before, s.fixed, s.profile);
      assert.equal(out.status, "success", JSON.stringify(out.diagnostics));
      assert.deepEqual(s.graph.capture(), before);
      const bindings = out.bindingSchema as any[];
      assert.equal(bindings.length, kind === "shared-reversed" ? 4 : 2);
      const symbols = new Map();
      for (const b of bindings) {
        if (symbols.has(b.resourceId))
          assert.equal(b.symbol, symbols.get(b.resourceId));
        symbols.set(b.resourceId, b.symbol);
      }
      assert.equal(new Set(symbols.values()).size, 2);
      if (kind === "shared-reversed") {
        assert.deepEqual(
          bindings.slice(0, 2).map((b) => b.resourceId),
          s.ids,
        );
        assert.deepEqual(
          bindings.slice(2).map((b) => b.resourceId),
          [...s.ids].reverse(),
        );
      }
    }
});
for (const scope of ["same-stage", "cross-stage"])
  for (const conflict of ["type", "default"]) {
    test(`S05-FR-001 ${scope} same resource ${conflict} conflict fails without artifacts or Graph changes`, () => {
      const s = stageFixture();
      let id = "";
      s.graph.change("Resource", (d) => {
        id = d.createSource("shared", "glsl.float", 0.25, true, {
          kind: "uniform",
        });
      });
      const pin = {
          moduleId: "test.uniform-conflict",
          version: "1.0.0",
          fingerprint: "test-uniform-conflict-v1",
        },
        source = functionOperations.nodes.find(
          (n) => n.modelRole === "source",
        )!;
      const module: ModuleContribution = {
        manifest: pin,
        presentation: {
          owner: { ...pin, namespace: pin.moduleId, catalogVersion: 1 },
          defaultLocale: "en",
        },
        nodes: [0, 1].map((index) => ({
          ...source,
          ref: { ...pin, typeId: String(index) },
          presentation: {
            label: {
              owner: { ...pin, namespace: pin.moduleId, catalogVersion: 1 },
              key: "source" + index,
              fallback: "Uniform test",
            },
          },
          emit: (_state, _inputs, c) => {
            const type =
                index === 1 && conflict === "type" ? "glsl.vec2" : "glsl.float",
              value =
                type === "glsl.vec2"
                  ? [0.25, 0.5]
                  : index === 1 && conflict === "default"
                    ? 0.5
                    : 0.25;
            const u = c!.uniform!(id, type, value);
            return {
              outputs: {
                value: {
                  type: "glsl.float",
                  code: type === "glsl.vec2" ? u.code + ".x" : u.code,
                  constant: false,
                },
              },
            };
          },
        })),
      };
      s.definitions.register(module);
      const fixed = s.definitions.pin(s.definitions.pins()),
        doc = structuredClone(s.graph.capture().document);
      doc.graph.modules.push(pin);
      const graph = new Graph(doc, fixed, s.identity);
      graph.change("Request conflicting binding", (d) => {
        let compose = "";
        if (scope === "same-stage")
          compose = d.add(s.network, nodeRef("compose"), [0, 0]);
        for (const index of [0, 1]) {
          const stage = doc.graph.stages[scope === "same-stage" ? 1 : index],
            node = d.addReferenceNode(
              stage.network.id,
              "source",
              id,
              undefined,
              { ...pin, typeId: String(index) },
            );
          const call = stage.network.nodes.find(
            (n) => fixed.node(n.type)?.modelRole === "call",
          )!;
          d.connect(
            stage.network.id,
            { nodeId: node, portKey: "value" },
            scope === "same-stage"
              ? { nodeId: compose, portKey: index === 0 ? "x" : "y" }
              : { nodeId: call.id, portKey: "value" },
            true,
          );
        }
        if (compose) {
          const stage = doc.graph.stages[1],
            call = stage.network.nodes.find(
              (n) => fixed.node(n.type)?.modelRole === "call",
            )!;
          d.connect(
            s.network,
            { nodeId: compose, portKey: "result" },
            { nodeId: call.id, portKey: "value" },
            true,
          );
        }
      });
      const before = graph.capture(),
        out = compile(before, fixed, s.profile);
      assert.equal(out.status, "failed");
      assert.deepEqual(out.artifacts, []);
      assert.ok(
        out.diagnostics.some((d) => d.code === "UNIFORM_CONFLICT"),
        JSON.stringify(out.diagnostics),
      );
      assert.deepEqual(graph.capture(), before);
    });
  }
