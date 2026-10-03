import { readDocument as oldRead } from "../fixtures/reader-2.0/persistence/codec.ts";
import { copySelection } from "../../src/model/transfer.ts";
import { currentSourceRef } from "../../src/modules/sources-current.ts";
import { currentOutput } from "../../src/modules/image-current.ts";
import { conversionFixture } from "../fixtures/s04.ts";
import { EditorApplication } from "../../src/application/editor.ts";
import { MemoryStorage } from "../fixtures/setup.ts";
import { PersonalLibrary } from "../../src/application/personal.ts";
import {
  currentSetup,
  arrayFixture,
  nestedArrayFixture,
} from "../fixtures/s04.ts";
import { currentSources } from "../../src/modules/sources-current.ts";
import { probeDefinitions } from "../../src/modules/package-probe.ts";
import test from "node:test";
import assert from "node:assert/strict";
import { setup } from "../fixtures/setup.ts";
import {
  extentModule,
  extentRef,
  arrayRepeatRef,
} from "../../src/modules/extents.ts";
import {
  currentOutputModule,
  currentGraphKinds,
  currentImageKind,
} from "../../src/modules/image-current.ts";
import { Graph } from "../../src/model/graph.ts";
import {
  buildPersonal,
  readPersonal,
  packagePacket,
  qualifyPackage,
  personalFilename,
} from "../../src/application/personal.ts";
import { esProfile } from "../../src/modules/image.ts";
import { nodeRef } from "../../src/modules/nodes.ts";
import { asNetwork, typeSystem, callResource } from "../../src/sdk/networks.ts";
import { TypeEnvironment } from "../../src/definitions/types.ts";
import { compile } from "../../src/generation/compiler.ts";
import { readDocument, writeDocument } from "../../src/persistence/codec.ts";
import { upgradeDocument } from "../../src/application/document-upgrade.ts";

test("S04 Personal canonical package preserves snapshots, same-version reuse, independent and collision-safe filenames", async () => {
  const s = currentSetup();
  let call = "";
  s.graph.change("Subgraph", (d) => {
    call = d.createSubgraph(s.network);
  });
  const root = callResource(
    s.graph.resolveNetwork(s.network).nodes.find((n) => n.id === call)!,
    s.fixed,
  )!;
  const before = s.graph.capture(),
    asset = await buildPersonal(
      before,
      s.fixed,
      root,
      esProfile,
      probeDefinitions,
    );
  assert.deepEqual(
    await buildPersonal(before, s.fixed, root, esProfile, probeDefinitions),
    asset,
  );
  assert.deepEqual(s.graph.capture(), before);
  assert.equal(
    (
      await readPersonal(
        JSON.stringify(asset, null, 2),
        s.fixed,
        esProfile,
        probeDefinitions,
      )
    ).contentHash,
    asset.contentHash,
  );
  assert.equal(
    qualifyPackage(asset, s.fixed, esProfile, probeDefinitions).length,
    2,
  );
  const target = currentSetup();
  const output = target.graph.resolveNetwork(target.network).nodes[0];
  // A valid destination remains required by the shared atomic admission boundary.
  target.graph.change("valid", (d) => {
    const c = d.add(target.network, nodeRef("compose"), [0, 0]);
    d.connect(
      target.network,
      { nodeId: c, portKey: "result" },
      { nodeId: output.id, portKey: "color" },
    );
  });
  let inserted: string[] = [];
  const packet = packagePacket(
    asset,
    target.graph.capture().document,
    target.fixed,
  );
  target.graph.change("Library", (d) => {
    inserted = d.insertLibrary(target.network, packet, asset.contentHash);
  });
  const once = target.graph.capture();
  target.graph.change("Library again", (d) =>
    d.insertLibrary(target.network, packet, asset.contentHash),
  );
  assert.deepEqual(
    target.graph.capture().document.graph.resources,
    once.document.graph.resources,
  );
  const two = target.graph.capture();
  target.graph.change("Independent", (d) =>
    d.makeIndependent(target.network, inserted[0]),
  );
  assert.equal(
    target.graph.capture().document.graph.resources.length,
    two.document.graph.resources.length + 1,
  );
  target.graph.undo();
  assert.deepEqual(target.graph.capture().document, two.document);
  assert.equal(personalFilename(" CON "), "_CON.sgrape-function.json");
  assert.ok(
    new TextEncoder().encode(
      personalFilename("🍇".repeat(100)).split(".sgrape")[0],
    ).length <= 180,
  );
});
test("S04 DEC002 all16 default float plans, version fences and current ImageOutput compile", () => {
  const types = new TypeEnvironment(),
    shapes = ["glsl.float", "glsl.vec2", "glsl.vec3", "glsl.vec4"];
  for (const a of shapes)
    for (const b of shapes) {
      const from = { key: "a", direction: "output" as const, type: a },
        to = { key: "b", direction: "input" as const, type: b };
      const p = types.adaptation(from, to);
      assert.ok(types.planValid(p, from, to));
      assert.ok(types.planValid({ ...p, version: 2 }, from, to));
      assert.equal(
        p.version,
        a === "glsl.vec2" && (b === "glsl.vec3" || b === "glsl.vec4") ? 2 : 1,
      );
      assert.equal(
        types.planValid({ ...p, version: 99 } as any, from, to),
        false,
      );
      if (p.operation === "pad-vector")
        assert.equal(types.planValid({ ...p, version: 1 }, from, to), false);
      if (a !== b)
        assert.throws(() =>
          types.adaptation(from, { ...to, connectionPolicy: "exact" }),
        );
    }
  const s = currentSetup();
  s.graph.change("Float output", (d) => {
    const f = d.add(s.network, nodeRef("float"), [0, 0]);
    d.parameter(s.network, f, "value", 0.5);
    d.connect(
      s.network,
      { nodeId: f, portKey: "value" },
      {
        nodeId: s.graph.resolveNetwork(s.network).nodes[0].id,
        portKey: "color",
      },
    );
  });
  const result = compile(s.graph.capture(), s.fixed, esProfile);
  assert.equal(result.status, "success");
  assert.match(
    result.artifacts.find((a) => a.key === "pixel")!.text,
    /vec4\(n_/,
  );
});
test("S04 AC001 additive envelope upgrade retains exact pins and inactive evidence, fences v2 under2.0", () => {
  const s = setup(),
    old = structuredClone(s.graph.capture().document);
  old.formatVersion.minor = 0;
  const upgraded = upgradeDocument(old, s.fixed);
  assert.deepEqual(upgraded.graph, old.graph);
  assert.equal(upgraded.formatVersion.minor, 1);
  assert.equal(readDocument(JSON.stringify(old)).status, "editable");
  assert.equal(readDocument(writeDocument(upgraded)).status, "editable");
  assert.throws(() => writeDocument(old), /DOCUMENT_UPGRADE_REQUIRED/);
  const bad = structuredClone(old);
  bad.graph.losses.push({
    schema: "grape.loss",
    version: 1,
    id: "loss",
    code: "TEST",
    reason: "inactive",
    extensions: {},
    payload: {
      kind: "edge",
      networkId: "x",
      edge: {
        id: "e",
        from: { nodeId: "a", portKey: "a" },
        to: { nodeId: "b", portKey: "b" },
        adaptation: {
          schema: "grape.edge-adaptation",
          version: 2,
          sourceType: "glsl.vec2",
          targetType: "glsl.vec4",
          operation: "pad-vector",
          extensions: {},
        },
        extensions: {},
      },
    },
  });
  assert.equal(readDocument(JSON.stringify(bad)).status, "recovery-readonly");
  assert.throws(() => upgradeDocument(bad, s.fixed));
  bad.formatVersion.minor = 1;
  assert.equal(readDocument(JSON.stringify(bad)).status, "editable");
  assert.deepEqual(
    (readDocument(writeDocument(bad)) as any).document.graph.losses,
    bad.graph.losses,
  );
});

for (const mode of ["literal", "source", "direct-source", "input"] as const)
  test(
    "S04 DEC004 " +
      mode +
      " Personal typed closure survives canonical export import save reopen generation",
    async () => {
      const s = arrayFixture(mode),
        before = s.graph.capture();
      const asset = await buildPersonal(
        before,
        s.fixed,
        s.id,
        esProfile,
        probeDefinitions,
      );
      assert.deepEqual(s.graph.capture(), before);
      assert.equal(
        qualifyPackage(asset, s.fixed, esProfile, probeDefinitions).length,
        2,
      );
      const recovered = await readPersonal(
        JSON.stringify(asset),
        s.fixed,
        esProfile,
        probeDefinitions,
      );
      assert.deepEqual(recovered, asset);
      const target = currentSetup();
      let color = "";
      target.graph.change("Valid graph", (d) => {
        color = d.add(target.network, nodeRef("float"), [0, 0]);
        d.connect(
          target.network,
          { nodeId: color, portKey: "value" },
          {
            nodeId: target.graph.resolveNetwork(target.network).nodes[0].id,
            portKey: "color",
          },
        );
      });
      const prior = target.graph.capture();
      let ids: string[] = [];
      target.graph.change("Import", (d) => {
        ids = d.insertLibrary(
          target.network,
          packagePacket(asset, prior.document, target.fixed),
          asset.contentHash,
        );
      });
      const after = target.graph.capture();
      assert.equal(target.graph.historyLength, 2);
      assert.ok(
        after.document.graph.resources.every(
          (r) =>
            !before.document.graph.resources.some((old) => old.id === r.id),
        ),
      );
      const loaded = readDocument(writeDocument(after.document));
      assert.equal(loaded.status, "editable");
      if (loaded.status !== "editable") throw Error("read");
      const reopened = new Graph(
        loaded.document,
        target.fixed,
        target.identity,
      );
      const root = callResource(
        reopened
          .resolveNetwork(target.network)
          .nodes.find((n) => n.id === ids[0])!,
        target.fixed,
      )!;
      const round = await buildPersonal(
        reopened.capture(),
        target.fixed,
        root,
        esProfile,
        probeDefinitions,
      );
      assert.deepEqual(round, asset);
      target.graph.undo();
      assert.deepEqual(target.graph.capture().document, prior.document);
      target.graph.redo();
      assert.deepEqual(target.graph.capture().document, after.document);
    },
  );
test("S04 DEC004 input-bound length uses caller override and rejects conflicting caller sources", () => {
  const s = arrayFixture("input"),
    get = () =>
      typeSystem(s.graph.capture().document, s.fixed).extent(
        (s.extent as { sourceId: string }).sourceId,
      );
  assert.equal(get(), 4);
  s.graph.change("Length six", (d) =>
    d.parameter(s.network, s.call, "length", 6),
  );
  assert.equal(get(), 6);
  const before = s.graph.capture();
  assert.throws(() =>
    s.graph.change("Conflicting caller", (d) =>
      d.addReferenceNode(s.network, "call", s.id),
    ),
  );
  assert.deepEqual(s.graph.capture(), before);
  assert.equal(get(), 6);
});

test("S04 DEC004 nested shared input bindings remap through Personal and remain independent after semantic fork and reinsert", async () => {
  const s = nestedArrayFixture(),
    asset = await buildPersonal(
      s.graph.capture(),
      s.fixed,
      s.root,
      esProfile,
      probeDefinitions,
    );
  const target = currentSetup();
  target.graph.change("Output", (d) => {
    const f = d.add(target.network, nodeRef("float"), [0, 0]);
    d.connect(
      target.network,
      { nodeId: f, portKey: "value" },
      {
        nodeId: target.graph.resolveNetwork(target.network).nodes[0].id,
        portKey: "color",
      },
    );
  });
  const insert = () => {
    let ids: string[] = [];
    target.graph.change("Insert", (d) => {
      ids = d.insertLibrary(
        target.network,
        packagePacket(asset, target.graph.capture().document, target.fixed),
        asset.contentHash,
      );
    });
    return ids[0];
  };
  const one = insert(),
    before = target.graph.capture(),
    r = callResource(
      target.graph
        .resolveNetwork(target.network)
        .nodes.find((n) => n.id === one)!,
      target.fixed,
    )!;
  const n = asNetwork(
    before.document.graph.resources.find((x) => x.id === r)!,
    target.fixed,
  )!;
  target.graph.change("Semantic edit", (d) =>
    d.interface(n.network.id, n.interface, "Forked"),
  );
  const fork = target.graph.capture(),
    two = insert(),
    after = target.graph.capture();
  assert.equal(
    target.graph.resolveNetwork(target.network).nodes.find((n) => n.id === two)!
      .state.definition === r,
    false,
  );
  assert.equal(
    new Set(
      after.document.graph.resources.flatMap((r) =>
        asNetwork(r, target.fixed)
          ? [asNetwork(r, target.fixed)!.network.id]
          : [],
      ),
    ).size,
    after.document.graph.resources.filter((r) => asNetwork(r, target.fixed))
      .length,
  );
  target.graph.undo();
  assert.deepEqual(target.graph.capture().document, fork.document);
  target.graph.redo();
  assert.deepEqual(target.graph.capture().document, after.document);
  const root = callResource(
    target.graph
      .resolveNetwork(target.network)
      .nodes.find((n) => n.id === two)!,
    target.fixed,
  )!;
  assert.deepEqual(
    await buildPersonal(
      target.graph.capture(),
      target.fixed,
      root,
      esProfile,
      probeDefinitions,
    ),
    asset,
  );
});
test("S04 AC001 inactive owner network resources and unknown wrapper versions preserve the version fence", () => {
  const s = currentSetup();
  let c = "";
  s.graph.change("Subgraph", (d) => {
    c = d.createSubgraph(s.network);
  });
  const id = callResource(
    s.graph.resolveNetwork(s.network).nodes.find((n) => n.id === c)!,
    s.fixed,
  )!;
  const resource = structuredClone(
    s.graph.capture().document.graph.resources.find((r) => r.id === id)!,
  );
  asNetwork(resource, s.fixed)!.network.edges[0].adaptation.version = 2;
  for (const kind of ["losses", "recovery"] as const) {
    const doc = structuredClone(s.graph.capture().document);
    doc.formatVersion.minor = 0;
    (doc.graph[kind] as any[]).push({
      schema: kind === "losses" ? "grape.loss" : "grape.recovery",
      version: 1,
      id: "inactive",
      ...(kind === "losses" ? { code: "PRESERVED" } : {}),
      reason: "test",
      extensions: {},
      payload: { kind: "resource", resource },
    });
    assert.throws(() => upgradeDocument(doc, s.fixed), /EDGE_DOCUMENT_VERSION/);
    doc.formatVersion.minor = 1;
    assert.deepEqual(upgradeDocument(doc, s.fixed), doc);
    for (const minor of [0, 1]) {
      doc.formatVersion.minor = minor;
      (doc.graph[kind] as any[])[0] = {
        schema: kind === "losses" ? "grape.loss" : "grape.recovery",
        version: 99,
        id: "future",
      };
      const text = JSON.stringify(doc),
        r = readDocument(text);
      assert.equal(r.status, "recovery-readonly");
      assert.equal((r as any).raw, text);
      (doc.graph[kind] as any[])[0].version = 1;
      assert.equal(readDocument(JSON.stringify(doc)).status, "rejected");
    }
  }
});

async function signed(asset: any) {
  const { contentHash, ...body } = asset;
  const stable = (v: any): string =>
    Array.isArray(v)
      ? "[" + v.map(stable).join(",") + "]"
      : v && typeof v === "object"
        ? "{" +
          Object.keys(v)
            .sort()
            .map((k) => JSON.stringify(k) + ":" + stable(v[k]))
            .join(",") +
          "}"
        : JSON.stringify(v);
  return JSON.stringify({
    ...body,
    contentHash: [
      ...new Uint8Array(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(stable(body)),
        ),
      ),
    ]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join(""),
  });
}
test("S04 DEC004 rejected literal/source/input/nested candidates are atomic through Application with valid checksums", async () => {
  const source = arrayFixture("source"),
    input = arrayFixture("input"),
    nested = nestedArrayFixture();
  const assets = await Promise.all(
    [source, input, nested].map((s) =>
      buildPersonal(
        s.graph.capture(),
        s.fixed,
        "root" in s ? s.root : s.id,
        esProfile,
        probeDefinitions,
      ),
    ),
  );
  const target = currentSetup();
  target.graph.change("Valid", (d) => {
    const f = d.add(target.network, nodeRef("float"), [0, 0]);
    d.connect(
      target.network,
      { nodeId: f, portKey: "value" },
      {
        nodeId: target.graph.resolveNetwork(target.network).nodes[0].id,
        portKey: "color",
      },
    );
  });
  const app = new EditorApplication(
    target.definitions,
    target.identity,
    currentImageKind.ref,
    esProfile,
    new MemoryStorage(),
    { download: async () => {} },
    probeDefinitions,
  );
  app.openText(writeDocument(target.graph.capture().document));
  const context = app.context();
  let notifications = 0;
  app.subscribe(() => notifications++);
  const invalid: any[] = [];
  const mutate = (index: number, f: (a: any) => void) => {
    const a = structuredClone(assets[index]);
    f(a);
    invalid.push(a);
  };
  mutate(0, (a) =>
    a.resources.splice(
      a.resources.findIndex((r: any) => r.type.typeId === "source-definition"),
      1,
    ),
  );
  mutate(0, (a) => {
    const r = a.resources.find(
      (r: any) => r.type.typeId === "source-definition",
    );
    r.data.type = "glsl.float";
  });
  mutate(0, (a) => {
    const r = a.resources.find(
      (r: any) => r.type.typeId === "source-definition",
    );
    r.data.binding = { kind: "uniform" };
  });
  mutate(1, (a) => {
    a.resources.find(
      (r: any) => r.type.typeId === "array-extent",
    ).data.networkId = "wrong-scope";
  });
  mutate(1, (a) => {
    a.resources.find(
      (r: any) => r.type.typeId === "array-extent",
    ).data.portKey = "missing";
  });
  mutate(1, (a) => {
    a.resources.find(
      (r: any) => r.type.typeId === "definition",
    ).data.interface[0].requireConstant = false;
  });
  mutate(2, (a) => {
    a.resources.splice(
      a.resources.findIndex(
        (r: any) => r.type.typeId === "definition" && r.id !== a.entry,
      ),
      1,
    );
  });
  mutate(2, (a) => {
    a.resources.find(
      (r: any) => r.type.typeId === "array-extent",
    ).referencesComplete = false;
  });
  mutate(0, (a) => {
    a.modules = a.modules.filter(
      (p: any) => p.moduleId !== "grape.resources.extents",
    );
  });
  mutate(2, (a) => {
    const child = a.resources.find(
      (r: any) => r.type.typeId === "definition" && r.id !== a.entry,
    );
    child.data.dependencies.push(a.entry);
  });
  const literal = arrayFixture("literal"),
    bad = structuredClone(
      await buildPersonal(
        literal.graph.capture(),
        literal.fixed,
        literal.id,
        esProfile,
        probeDefinitions,
      ),
    );
  (
    bad.resources.find((r) => r.type.typeId === "definition")!.data as any
  ).interface[0].type = 'array@["glsl.float",0]';
  invalid.push(bad);
  for (const asset of invalid) {
    const before = app.snapshot,
      selection = context.capture(),
      undo = app.canUndo,
      redo = app.canRedo,
      n = notifications;
    await assert.rejects(app.insertPersonal(context, await signed(asset)));
    assert.deepEqual(app.snapshot, before);
    assert.deepEqual(context.capture(), selection);
    assert.equal(app.canUndo, undo);
    assert.equal(app.canRedo, redo);
    assert.equal(notifications, n);
  }
  const before = app.snapshot,
    pending = app.insertPersonal(context, JSON.stringify(assets[0]));
  app.newDocument();
  await assert.rejects(pending, /PERSONAL_STALE/);
  assert.notEqual(app.snapshot.loadId, before.loadId);
  assert.equal(app.snapshot.document.graph.resources.length, 0);
});
test("S04 Personal Library per-file isolation, safe names, duplicate-at-capacity and provider failures leave existing assets unchanged", async () => {
  const s = arrayFixture("literal"),
    asset = await buildPersonal(
      s.graph.capture(),
      s.fixed,
      s.id,
      esProfile,
      probeDefinitions,
    ),
    scope = "test",
    records = new Map<string, string>();
  const store = {
    scope,
    list: async () =>
      [...records].map(([name, text]) => ({
        name,
        text,
        kind: "file" as const,
        scope,
      })),
    publish: async (name: string, text: string) => {
      if (
        [...records.keys()].some((k) => k.toLowerCase() === name.toLowerCase())
      )
        return "exists" as const;
      if (records.size >= 64) throw Error("PERSONAL_FILE_LIMIT");
      records.set(name, text);
      return "created" as const;
    },
  };
  const library = new PersonalLibrary(
    store,
    s.fixed,
    esProfile,
    probeDefinitions,
  );
  records.set("Portable_array.sgrape-function.json", "broken");
  const saved = await library.save(asset);
  assert.equal(saved.name, "Portable_array_2.sgrape-function.json");
  assert.equal(records.get("Portable_array.sgrape-function.json"), "broken");
  for (let i = records.size; i < 64; i++)
    records.set("invalid" + i + ".sgrape-function.json", "invalid");
  const before = [...records];
  assert.equal((await library.save(asset)).reused, true);
  assert.deepEqual([...records], before);
  const listed = await library.list();
  assert.equal(listed.items.length, 1);
  assert.equal(listed.issues.length, 63);
  const broken = new PersonalLibrary(
    {
      ...store,
      publish: async () => {
        throw Error("PROVIDER_FAILURE");
      },
    },
    s.fixed,
    esProfile,
    probeDefinitions,
  );
  const changed = JSON.parse(await signed({ ...asset, name: "new asset" }));
  await assert.rejects(broken.save(changed), /PROVIDER_FAILURE/);
  assert.deepEqual([...records], before);
  const unsafe = new PersonalLibrary(
    {
      ...store,
      list: async () => [
        {
          name: "../escape.sgrape-function.json",
          text: JSON.stringify(asset),
          kind: "file" as const,
          scope,
        },
        {
          name: "link.sgrape-function.json",
          text: JSON.stringify(asset),
          kind: "symlink" as const,
          scope,
        },
        {
          name: "foreign.sgrape-function.json",
          text: JSON.stringify(asset),
          kind: "file" as const,
          scope: "other",
        },
      ],
    },
    s.fixed,
    esProfile,
    probeDefinitions,
  );
  assert.deepEqual(
    (await unsafe.list()).issues.map((i) => i.code),
    ["PERSONAL_SCOPE", "PERSONAL_SCOPE", "PERSONAL_SCOPE"],
  );
});

test("S04 AC001 unchanged accepted reader and exact old/new definition boundaries", () => {
  const old = setup(),
    document = structuredClone(old.graph.capture().document);
  document.formatVersion.minor = 0;
  assert.equal(oldRead(JSON.stringify(document)).status, "editable");
  const upgraded = upgradeDocument(document, old.fixed),
    text = writeDocument(upgraded),
    result = oldRead(text);
  assert.equal(result.status, "recovery-readonly");
  assert.equal((result as any).raw, text);
  const graph = new Graph(upgraded, old.fixed, old.identity);
  let f = "";
  graph.change("Float", (d) => {
    f = d.add(old.network, nodeRef("float"), [0, 0]);
  });
  const before = graph.capture();
  assert.throws(
    () =>
      graph.change("Old output exact", (d) =>
        d.connect(
          old.network,
          { nodeId: f, portKey: "value" },
          {
            nodeId: graph.resolveNetwork(old.network).nodes[0].id,
            portKey: "color",
          },
        ),
      ),
    /TYPE_ADAPTATION/,
  );
  assert.deepEqual(graph.capture(), before);
  const current = currentSetup(),
    missingOld = {
      ...current.fixed,
      node: (ref: any) =>
        ref.moduleId === "grape.nodes.basic" && ref.typeId === "image-output"
          ? undefined
          : current.fixed.node(ref),
    };
  const unresolved = new Graph(upgraded, missingOld, old.identity);
  assert.ok(
    unresolved.capture().diagnostics.some((d) => d.severity === "error"),
  );
  assert.notEqual(
    compile(unresolved.capture(), missingOld, esProfile).status,
    "success",
  );
  assert.ok(current.fixed.node(currentOutput.ref));
  assert.equal(
    currentOutput.acceptsInput!(
      { key: "x", direction: "output", type: "custom.float" },
      { key: "color", direction: "input", type: "glsl.vec4" },
    ),
    false,
  );
  const bad = structuredClone(upgraded);
  bad.graph.modules = bad.graph.modules.filter(
    (p) => p.moduleId !== "grape.nodes.basic",
  );
  const loaded = readDocument(JSON.stringify(bad));
  assert.equal(loaded.status, "rejected");
});
test("S04 inherited v2 plans preserve extensions across hydration move clipboard nested and Personal", async () => {
  const s = conversionFixture("glsl.vec2", "glsl.vec4"),
    doc = structuredClone(s.graph.capture().document),
    net = doc.graph.stages.find((x) => x.key === "pixel")!.network;
  net.edges[1].adaptation = {
    ...net.edges[1].adaptation,
    version: 2,
    extensions: { "test.note": "keep identity" },
  };
  const graph = new Graph(doc, s.fixed, s.identity),
    before = graph.capture();
  graph.change("Move", (d) => d.move(s.network, net.nodes[1].id, [50, 50]));
  assert.deepEqual(
    graph.capture().document.graph.stages.find((x) => x.key === "pixel")!
      .network.edges,
    net.edges,
  );
  const read = readDocument(writeDocument(graph.capture().document));
  assert.equal(read.status, "editable");
  if (read.status !== "editable") return;
  assert.deepEqual(
    read.document.graph.stages.find((x) => x.key === "pixel")!.network.edges,
    net.edges,
  );
  let caller = "";
  graph.change("Encapsulate", (d) => {
    caller = d.encapsulate(s.network, [net.nodes[1].id, net.nodes[2].id]);
  });
  const id = callResource(
    graph.resolveNetwork(s.network).nodes.find((n) => n.id === caller)!,
    s.fixed,
  )!;
  const asset = await buildPersonal(
    graph.capture(),
    s.fixed,
    id,
    esProfile,
    probeDefinitions,
  );
  const edges = asset.resources.flatMap(
    (r) => asNetwork(r, s.fixed)?.network.edges ?? [],
  );
  assert.ok(
    edges.some(
      (e) =>
        e.adaptation.operation === "pad-vector" && e.adaptation.version === 2,
    ),
  );
  const packet = copySelection(graph.capture(), s.fixed, s.network, [caller]);
  const target = conversionFixture("glsl.vec2", "glsl.vec4");
  target.graph.change("Paste", (d) =>
    d.paste(target.network, { ...packet, graphId: "other" }),
  );
  assert.equal(
    compile(target.graph.capture(), target.fixed, esProfile).status,
    "success",
  );
  assert.ok(
    target.graph
      .capture()
      .document.graph.resources.flatMap(
        (r) => asNetwork(r, target.fixed)?.network.edges ?? [],
      )
      .some((e) => e.adaptation.operation === "pad-vector"),
  );
  assert.deepEqual(
    before.document.graph.stages.find((x) => x.key === "pixel")!.network.edges,
    net.edges,
  );
});
test("S04 current exact source owner supports new image descriptors without retargeting legacy owner", () => {
  const s = currentSetup();
  let source = "";
  s.graph.change("Descriptor", (d) => {
    source = d.createSource("TOP", "glsl.sampler2D", null, true, {
      kind: "top",
      path: "/test",
      source: "source",
      origin: "origin",
      slot: 0,
    });
  });
  const resource = s.graph
    .capture()
    .document.graph.resources.find((r) => r.id === source)!;
  assert.deepEqual(resource.type, currentSourceRef);
  const types = typeSystem(s.graph.capture().document, s.fixed),
    policy = s.fixed.resource(currentSourceRef)!.sourcePolicy!;
  assert.deepEqual(
    policy.validate(resource.data, {
      phase: "clipboard",
      graphKind: currentImageKind.ref,
      resources: [],
      types,
    }),
    [],
  );
  const unavailable = policy.validate(resource.data, {
    phase: "clipboard",
    graphKind: {
      ...currentImageKind.ref,
      fingerprint: "sha256:" + "9".repeat(64),
    },
    resources: [],
    types,
  });
  assert.ok(unavailable.some((i) => i.code === "SOURCE_TARGET_UNSUPPORTED"));
});

test("S04 DEC004 required int length input qualifies with an actual constant supply and changed caller defaults regenerate", async () => {
  const s = arrayFixture("input");
  let source = "",
    node = "";
  s.graph.change("Required length", (d) => {
    source = d.createSource("Actual length", "glsl.int", 4);
    node = d.addReferenceNode(s.network, "source", source);
    d.interface(
      s.net().network.id,
      s
        .net()
        .interface.map((p) =>
          p.key === "length" ? { ...p, supply: "required" } : p,
        ),
    );
    d.connect(
      s.network,
      { nodeId: node, portKey: "value" },
      { nodeId: s.call, portKey: "length" },
    );
  });
  const asset = await buildPersonal(
    s.graph.capture(),
    s.fixed,
    s.id,
    esProfile,
    probeDefinitions,
  );
  assert.equal(
    qualifyPackage(asset, s.fixed, esProfile, probeDefinitions).length,
    2,
  );
  const local = arrayFixture("input");
  local.graph.change("Six", (d) =>
    d.parameter(local.network, local.call, "length", 6),
  );
  assert.ok(
    !local.graph
      .capture()
      .diagnostics.some((d) =>
        ["INTERFACE_MISMATCH", "INPUT_VALUE", "MODULE_CALLBACK"].includes(
          d.code,
        ),
      ),
  );
  const data = local.net();
  assert.equal(
    (data.network.nodes[1].ports[0].defaultValue as any[]).length,
    6,
  );
  const loaded = readDocument(writeDocument(local.graph.capture().document));
  assert.equal(loaded.status, "editable");
  if (loaded.status === "editable")
    assert.ok(
      !new Graph(loaded.document, local.fixed, local.identity)
        .capture()
        .diagnostics.some((d) => d.code === "INTERFACE_MISMATCH"),
    );
  await buildPersonal(
    local.graph.capture(),
    local.fixed,
    local.id,
    esProfile,
    probeDefinitions,
  );
});
