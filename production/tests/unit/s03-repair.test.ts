import { test } from "node:test";
import assert from "node:assert/strict";
import { flow } from "../fixtures/setup.ts";
import { customTransferFixture } from "../fixtures/custom-transfer.ts";
import { Graph } from "../../src/model/graph.ts";
import { copySelection } from "../../src/model/transfer.ts";
import { asNetwork } from "../../src/sdk/networks.ts";
import { compile } from "../../src/generation/compiler.ts";
import { esProfile } from "../../src/modules/image.ts";
import { writeDocument, readDocument } from "../../src/persistence/codec.ts";
const array = (type: string, n: any) => "array@" + JSON.stringify([type, n]);
function atomic(s: any, operation: () => void, error: RegExp) {
  s.graph.change("Redo control", (d: any) =>
    d.move(s.network, s.float, [17, 23]),
  );
  s.graph.undo();
  const before = s.graph.capture(),
    history = s.graph.historyLength;
  let published = 0;
  const off = s.graph.subscribe(() => published++);
  assert.throws(operation, error);
  assert.deepEqual(s.graph.capture(), before);
  assert.equal(s.graph.historyLength, history);
  assert.equal(s.graph.canRedo, true);
  assert.equal(published, 0);
  off();
}
function sourceFixture(type: string, value: any, binding?: any) {
  const s = flow();
  let source = "",
    node = "";
  s.graph.change("Source", (d) => {
    source = d.createSource("Authored", type, value, true, binding);
    node = d.addReferenceNode(s.network, "source", source);
  });
  return {
    ...s,
    source,
    node,
    packet: copySelection(s.graph.capture(), s.fixed, s.network, [node]),
  };
}
function cross(s: any, packet = s.packet) {
  return { ...structuredClone(packet), graphId: "cross-graph" };
}
test("S03 FR01 admitted nested Structure arrays fail ES300 profile without artifacts; one dimension succeeds", () => {
  for (const nested of [false, true]) {
    const s = flow();
    const type = nested
      ? array(array("glsl.float", 2), 3)
      : array("glsl.float", 3);
    s.graph.change("Structure", (d) => {
      const id = d.createStructure("Nested", [
          { id: "a", name: "a", type },
          { id: "b", name: "b", type: "glsl.float" },
        ]),
        n = d.addReferenceNode(s.network, "structure", id),
        f = d.addReferenceNode(s.network, "field", id, "b");
      d.connect(
        s.network,
        { nodeId: n, portKey: "value" },
        { nodeId: f, portKey: "value" },
      );
      d.connect(
        s.network,
        { nodeId: f, portKey: "field" },
        { nodeId: s.compose, portKey: "y" },
      );
    });
    const before = s.graph.capture();
    assert.deepEqual(before.diagnostics, []);
    const out = compile(before, s.fixed, esProfile);
    assert.equal(out.status, nested ? "failed" : "success");
    if (nested) {
      assert.equal(out.artifacts.length, 0);
      assert(out.diagnostics.some((d) => d.code === "PROFILE_TYPE"));
    }
    assert.deepEqual(s.graph.capture(), before);
  }
});
for (const cloneChild of [false, true])
  test(`S03 FR02 independence remaps mixed parent and ${cloneChild ? "cloned" : "shared"} child owner references with Undo/Redo`, () => {
    const s = customTransferFixture();
    let childCall = "";
    s.graph.change("Child", (d) => {
      childCall = d.createSubgraph(s.network, "Child");
    });
    const doc = structuredClone(s.graph.capture().document),
      call = doc.graph.stages
        .find((x) => x.network.id === s.network)!
        .network.nodes.find((n) => n.id === childCall)!;
    const childResource = doc.graph.resources.find(
        (r) => r.id === (call.state as any).definition,
      )!,
      child = asNetwork(childResource, s.fixed)!;
    const b = doc.graph.resources.find((r) => r.id === s.b)!;
    // Explicit child node reference needs the child resource in the closure. In the cloned variant the parent call already supplies it.
    if (!cloneChild)
      b.references.push({
        slot: "child-definition",
        kind: "resource",
        targetId: childResource.id,
      });
    b.references.push({
      slot: "child-node",
      kind: "node",
      networkId: child.network.id,
      targetId: child.network.nodes[0].id,
    });
    if (cloneChild) child.dependencies.push(s.b);
    let seq = 0;
    const graph = new Graph(doc, s.fixed, { next: () => `repair-${++seq}` });
    let parent = "";
    graph.change("Group", (d) => {
      parent = d.encapsulate(s.network, [...s.selection, childCall]);
    });
    const before = graph.capture().document;
    assert.doesNotThrow(() =>
      copySelection(graph.capture(), s.fixed, s.network, [parent]),
    );
    graph.change("Independent", (d) => d.makeIndependent(s.network, parent));
    const after = graph.capture();
    assert.deepEqual(after.diagnostics, []);
    const caller = after.document.graph.stages
        .find((x) => x.network.id === s.network)!
        .network.nodes.find((n) => n.id === parent)!,
      p = asNetwork(
        after.document.graph.resources.find(
          (r) => r.id === (caller.state as any).definition,
        )!,
        s.fixed,
      )!;
    const owner = p.network.nodes.find((n) => n.type.typeId === "owner")!,
      newB = after.document.graph.resources.find(
        (r) =>
          r.id ===
          owner.references.find((r) => r.slot === "declared-root")!.targetId,
      )!;
    const nodeRef = newB.references.find((r) => r.slot === "child-node")!;
    assert.notEqual(newB.id, s.b);
    assert.equal(newB.references[0].networkId, p.network.id);
    assert.equal(nodeRef.networkId === child.network.id, !cloneChild);
    assert.equal(nodeRef.targetId === child.network.nodes[0].id, !cloneChild);
    graph.undo();
    assert.deepEqual(graph.capture().document, before);
    graph.redo();
    assert.deepEqual(graph.capture().document, after.document);
  });
test("S03 FR02 incomplete shared-child node address rejects independence atomically", () => {
  const s = customTransferFixture();
  let call = "";
  s.graph.change("Group", (d) => {
    call = d.encapsulate(s.network, s.selection);
  });
  const doc = structuredClone(s.graph.capture().document);
  doc.graph.resources
    .find((r) => r.id === s.b)!
    .references.push({
      slot: "escape",
      kind: "node",
      networkId: "missing",
      targetId: "missing",
    });
  let i = 0;
  const graph = new Graph(doc, s.fixed, { next: () => `missing-${++i}` });
  const before = graph.capture();
  assert.throws(
    () =>
      graph.change("Independent", (d) => d.makeIndependent(s.network, call)),
    /REFERENCE_ESCAPE/,
  );
  assert.deepEqual(graph.capture(), before);
});
test("S03 FR03 editing inner Structure validates dependent depth16 and preserves Redo on depth17 rejection", () => {
  const s = flow();
  let inner = "",
    prior = "",
    leaf = "";
  s.graph.change("Depth16", (d) => {
    for (let i = 0; i < 16; i++) {
      prior = d.createStructure("D" + i, [
        { id: "v", name: "v", type: prior ? "struct@" + prior : "glsl.float" },
      ]);
      if (!i) inner = prior;
    }
    leaf = d.createStructure("Leaf", [
      { id: "v", name: "v", type: "glsl.float" },
    ]);
  });
  atomic(
    s,
    () =>
      s.graph.change("Depth17", (d) =>
        d.editStructure(inner, {
          name: "D0",
          fields: [{ id: "v", name: "v", type: "struct@" + leaf }],
        }),
      ),
    /STRUCTURE_DEPTH/,
  );
  s.graph.change("Legal rename", (d) =>
    d.editStructure(inner, {
      name: "Renamed",
      fields: [{ id: "v", name: "v", type: "glsl.float" }],
    }),
  );
  assert.deepEqual(s.graph.capture().diagnostics, []);
});
test("S03 FR03 affected dependent expansion and vector component budgets reject atomically", () => {
  const s = flow();
  let inner = "";
  s.graph.change("At budget", (d) => {
    inner = d.createStructure("Inner", [
      { id: "v", name: "v", type: array("glsl.float", 64) },
    ]);
    d.createStructure("Outer", [
      { id: "v", name: "v", type: array("struct@" + inner, 1024) },
    ]);
  });
  atomic(
    s,
    () =>
      s.graph.change("Over budget", (d) =>
        d.editStructure(inner, {
          name: "Inner",
          fields: [{ id: "v", name: "v", type: array("glsl.vec2", 64) }],
        }),
      ),
    /STRUCTURE_EXPANSION/,
  );
});
for (const length of [2048, 2049, 4096])
  test(`S03 EG01 native array constructor${length}, clipboard2048 boundary and same-load reuse`, () => {
    const s = sourceFixture(array("glsl.float", 2), null, {
      kind: "native-array",
      path: "x".repeat(length),
    });
    s.graph.change("Same-load", (d) => d.paste(s.network, s.packet));
    assert.equal(s.graph.capture().document.graph.resources.length, 1);
    if (length > 2048) {
      atomic(
        s,
        () => s.graph.change("Cross", (d) => d.paste(s.network, cross(s))),
        /SOURCE_PATH/,
      );
      let i = 0;
      const reopened = new Graph(s.graph.capture().document, s.fixed, {
        next: () => `reopened-${++i}`,
      });
      const before = reopened.capture();
      assert.throws(
        () => reopened.change("Reopened", (d) => d.paste(s.network, s.packet)),
        /SOURCE_PATH/,
      );
      assert.deepEqual(reopened.capture(), before);
    } else {
      s.graph.change("Cross", (d) => d.paste(s.network, cross(s)));
      assert.equal(s.graph.capture().document.graph.resources.length, 2);
    }
  });
test("S03 EG01 native array constructor4097 rejects atomically", () => {
  const s = flow();
  atomic(
    s,
    () =>
      s.graph.change("Too long", (d) =>
        d.createSource("Path", array("glsl.float", 2), null, true, {
          kind: "native-array",
          path: "x".repeat(4097),
        }),
      ),
    /SOURCE_PATH/,
  );
});
for (const length of [2048, 2049])
  test(`S03 EG01 sampler clipboard path${length} admission`, () => {
    const s = sourceFixture("glsl.sampler2D", null, {
      kind: "sampler",
      path: "x".repeat(length),
    });
    if (length === 2048) {
      s.graph.change("Cross", (d) => d.paste(s.network, cross(s)));
      assert.equal(s.graph.capture().document.graph.resources.length, 2);
    } else
      atomic(
        s,
        () => s.graph.change("Cross", (d) => d.paste(s.network, cross(s))),
        /SOURCE_PATH/,
      );
  });
test("S03 EG01 native arrays admit float/vec2/vec3/vec4 and remap symbolic length closure", () => {
  for (const type of ["glsl.float", "glsl.vec2", "glsl.vec3", "glsl.vec4"]) {
    const s = sourceFixture(array(type, 2), null, {
      kind: "native-array",
      path: "/native",
    });
    s.graph.change("Cross", (d) => d.paste(s.network, cross(s)));
    assert.deepEqual(s.graph.capture().diagnostics, []);
  }
  const s = flow();
  let node = "",
    length = "";
  s.graph.change("Symbolic", (d) => {
    length = d.createSource("Length", "glsl.int", 2, true, {
      kind: "specialization",
      constantId: 0,
    });
    const id = d.createSource(
      "Array",
      array("glsl.vec4", { sourceId: length }),
      null,
      true,
      { kind: "native-array", path: "/native" },
    );
    node = d.addReferenceNode(s.network, "source", id);
  });
  const packet = copySelection(s.graph.capture(), s.fixed, s.network, [node]);
  assert.equal(packet.resources.length, 2);
  s.graph.change("Cross", (d) =>
    d.paste(s.network, { ...packet, graphId: "other" }),
  );
  const sources = s.graph.capture().document.graph.resources;
  const copied = sources.find(
    (r) =>
      r.id !== length && (r.data as any).binding?.kind === "specialization",
  )!;
  assert.equal((copied.data as any).binding.constantId, 1);
  assert(
    sources.some(
      (r) =>
        (r.data as any).type === array("glsl.vec4", { sourceId: copied.id }),
    ),
  );
  atomic(
    s,
    () =>
      s.graph.change("Missing length", (d) =>
        d.paste(s.network, {
          ...packet,
          graphId: "other",
          resources: packet.resources.filter((r) => r.id !== length),
        }),
      ),
    /DEPENDENCY_MISSING/,
  );
});
test("S03 EG01 native arrays reject matrix/nested/expressions and invalid length owner types", () => {
  for (const type of [
    array("glsl.mat2", 2),
    array(array("glsl.float", 2), 2),
    array("glsl.float", "2 + 2"),
  ]) {
    const s = flow();
    atomic(
      s,
      () =>
        s.graph.change("Bad type", (d) =>
          d.createSource("Bad", type, null, true, {
            kind: "native-array",
            path: "/x",
          }),
        ),
      /SOURCE_NATIVE_ARRAY_TYPE|TYPE_TOKEN|ARRAY_EXTENT/,
    );
  }
  const s = flow();
  let id = "";
  s.graph.change("Float length", (d) => {
    id = d.createSource("L", "glsl.float", 2);
  });
  atomic(
    s,
    () =>
      s.graph.change("Bad length", (d) =>
        d.createSource(
          "Bad",
          array("glsl.float", { sourceId: id }),
          null,
          true,
          { kind: "native-array", path: "/x" },
        ),
      ),
    /SOURCE_NATIVE_ARRAY_TYPE/,
  );
});
test("S03 EG01 TOP declarations clone while source+origin slots reuse, defaults persist, and Undo/Redo/save preserve identity", () => {
  const s = sourceFixture("glsl.sampler2D", null, {
    kind: "top",
    path: "/current",
    source: "source-A",
    origin: "origin-A",
    slot: 7,
  });
  const packet = cross(s);
  (packet.resources[0].data as any).binding.path = "/stale";
  const before = s.graph.capture().document;
  s.graph.change("Paste1", (d) => d.paste(s.network, packet));
  const first = s.graph.capture().document;
  s.graph.change("Paste2", (d) => d.paste(s.network, packet));
  const after = s.graph.capture().document;
  assert.equal(new Set(after.graph.resources.map((r) => r.id)).size, 3);
  for (const r of after.graph.resources) {
    assert.equal((r.data as any).binding.slot, 7);
    assert.equal((r.data as any).binding.path, "/current");
  }
  s.graph.undo();
  assert.deepEqual(s.graph.capture().document, first);
  s.graph.undo();
  assert.deepEqual(s.graph.capture().document, before);
  s.graph.redo();
  s.graph.redo();
  assert.deepEqual(s.graph.capture().document, after);
  assert.equal(
    readDocument(writeDocument(s.graph.capture().document), s.fixed.module)
      .status,
    "editable",
  );
  for (const key of ["source", "origin"]) {
    const other = cross(s);
    (other.resources[0].data as any).binding[key] += "-other";
    s.graph.change("Distinct identity", (d) => d.paste(s.network, other));
  }
  assert.deepEqual(
    new Set(
      s.graph
        .capture()
        .document.graph.resources.map((r) => (r.data as any).binding.slot),
    ),
    new Set([7, 0, 1]),
  );
});
test("S03 EG01 specialization import allocates minimal vacant ID0,2 ->1", () => {
  const s = sourceFixture("glsl.int", 3, {
    kind: "specialization",
    constantId: 0,
  });
  s.graph.change("Occupied2", (d) =>
    d.createSource("Other", "glsl.int", 9, true, {
      kind: "specialization",
      constantId: 2,
    }),
  );
  s.graph.change("Cross", (d) => d.paste(s.network, cross(s)));
  assert.deepEqual(
    s.graph
      .capture()
      .document.graph.resources.map((r) => (r.data as any).binding.constantId),
    [0, 2, 1],
  );
});
test("S03 EG01 unsupported target, unavailable owner and throwing owner reject without publication", () => {
  const s = sourceFixture("glsl.sampler2D", null, {
    kind: "top",
    path: "/x",
    source: "S",
    origin: "O",
    slot: 0,
  });
  for (const mode of ["target", "missing", "throws"]) {
    const fixed = {
      ...s.fixed,
      resource: (ref: any) => {
        const def = s.fixed.resource(ref);
        if (def?.model !== "source") return def;
        return {
          ...def,
          sourcePolicy:
            mode === "missing"
              ? undefined
              : mode === "throws"
                ? {
                    ...def.sourcePolicy!,
                    prepareTransfer: () => {
                      throw Error("OWNER_PREPARE_THROW");
                    },
                  }
                : def.sourcePolicy,
        };
      },
    };
    const doc = structuredClone(s.graph.capture().document);
    if (mode === "target") doc.graph.kind.kindId = "grape.unsupported";
    let i = 0;
    const graph = new Graph(doc, fixed, { next: () => `${mode}-${++i}` });
    const before = graph.capture(),
      history = graph.historyLength;
    let events = 0;
    graph.subscribe(() => events++);
    assert.throws(
      () => graph.change("Cross", (d) => d.paste(s.network, cross(s))),
      mode === "target"
        ? /SOURCE_TARGET_UNSUPPORTED/
        : mode === "missing"
          ? /SOURCE_PROVIDER_UNAVAILABLE/
          : /OWNER_PREPARE_THROW/,
    );
    assert.deepEqual(graph.capture(), before);
    assert.equal(graph.historyLength, history);
    assert.equal(events, 0);
  }
  const compiled = compile(s.graph.capture(), s.fixed, esProfile);
  assert.equal(compiled.status, "failed");
  assert.equal(compiled.artifacts.length, 0);
  assert(compiled.diagnostics.some((d) => d.code === "PROFILE_TYPE"));
});

test("S03 EG01 numeric uniform scalar/vector/matrix transfer remains independent and generation is explicit unavailable", () => {
  for (const [type, value] of [
    ["glsl.float", 2],
    ["glsl.vec2", [1, 2]],
    [
      "glsl.mat2",
      [
        [1, 0],
        [0, 1],
      ],
    ],
  ] as const) {
    const s = sourceFixture(type, value, { kind: "uniform" });
    s.graph.change("Cross", (d) => d.paste(s.network, cross(s)));
    const values = s.graph.capture().document.graph.resources;
    assert.equal(values.length, 2);
    assert.notEqual(values[0].id, values[1].id);
    assert.deepEqual((values[1].data as any).value, value);
  }
  const s = sourceFixture("glsl.float", 2, { kind: "uniform" });
  s.graph.change("Connect", (d) =>
    d.connect(
      s.network,
      { nodeId: s.node, portKey: "value" },
      { nodeId: s.compose, portKey: "y" },
    ),
  );
  const result = compile(s.graph.capture(), s.fixed, esProfile);
  assert.equal(result.status, "failed");
  assert.equal(result.artifacts.length, 0);
  assert(
    result.diagnostics.some((d) => d.code === "SOURCE_RUNTIME_UNAVAILABLE"),
  );
});

test("S03 FR03 registered resource types cannot become Structure fields", () => {
  const s = flow();
  atomic(
    s,
    () =>
      s.graph.change("Resource field", (d) =>
        d.createStructure("Resource", [
          { id: "r", name: "r", type: "glsl.sampler2D" },
        ]),
      ),
    /STRUCTURE_TYPE/,
  );
});
test("S03 EG01 exact provider/target ownership and imported descriptor failures stay atomic", () => {
  const s = sourceFixture("glsl.sampler2D", null, {
    kind: "top",
    path: "/x",
    source: "S",
    origin: "O",
    slot: 0,
  });
  const data = s.packet.resources[0].data,
    policy = s.fixed.resource(s.packet.resources[0].type)!.sourcePolicy!;
  assert(
    policy
      .validate(data, {
        phase: "clipboard",
        graphKind: {
          ...s.graph.capture().document.graph.kind,
          fingerprint: "wrong",
        },
        resources: [],
        types: s.fixed.types,
      })
      .some((i) => i.code === "SOURCE_TARGET_UNSUPPORTED"),
  );
  const bad = cross(s);
  bad.resources[0].type.fingerprint = "wrong";
  atomic(
    s,
    () =>
      s.graph.change("Missing exact provider", (d) => d.paste(s.network, bad)),
    /RESOURCE_STATE/,
  );
  const loaded = readDocument(
    writeDocument(s.graph.capture().document),
    () => false,
  );
  assert.equal(loaded.status, "editable");
  if (loaded.status === "editable") {
    assert.equal(loaded.generationBlockedByMissingModules, true);
    assert.deepEqual(
      loaded.document.graph.resources,
      s.graph.capture().document.graph.resources,
    );
  }
});
