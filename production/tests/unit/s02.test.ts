import { test } from "node:test";
import assert from "node:assert/strict";
import { application, flow } from "../fixtures/setup.ts";
import {
  readDocument,
  writeDocument,
  DOCUMENT_MAX_BYTES,
} from "../../src/persistence/codec.ts";
import { inspectDocument } from "../../src/application/inspection.ts";
import { Graph } from "../../src/model/graph.ts";
import { basicNodes } from "../../src/modules/nodes.ts";
import type { ModuleContribution } from "../../src/sdk/editing.ts";

const input = () => structuredClone(flow().graph.capture().document);
test("AT-S02-01: detached inspection/cancel/raw retention and one atomic replacement with Context continuity and Undo/Redo", () => {
  const s = application(),
    doc = input();
  doc.graph.name = "Imported";
  const raw = JSON.stringify(doc),
    base = s.app.snapshot,
    context = s.context;
  const cancelled = s.app.inspectText(raw);
  assert.equal(cancelled.status, "valid");
  assert.equal(cancelled.raw, raw);
  assert.deepEqual(s.app.snapshot, base);
  assert.throws(() => {
    cancelled.candidate!.graph.name = "tamper";
  });
  s.app.cancelReview(cancelled);
  assert.throws(() => s.app.acceptReview(cancelled), /REVIEW_CLOSED/);
  assert.equal(s.app.canUndo, false);
  const review = s.app.inspectText(raw);
  s.app.acceptReview(review);
  assert.equal(s.app.snapshot.loadId, base.loadId);
  assert.equal(s.app.snapshot.document.graph.id, base.document.graph.id);
  assert.equal(s.app.context(context.id), context);
  assert.equal(context.network().nodes.length, 4);
  assert.equal(s.app.snapshot.revision, base.revision + 1);
  assert.equal(s.app.snapshot.document.graph.name, "Imported");
  const execute = (commandId: string) =>
    s.app.execute({ panelId: "test", typeId: "test" }, s.target(), {
      commandId,
      args: {},
    });
  assert.throws(() => s.app.acceptReview(review), /REVIEW_CLOSED/);
  execute("grape.undo");
  assert.deepEqual(s.app.snapshot.document, base.document);
  assert.equal(s.app.canUndo, false);
  execute("grape.redo");
  assert.equal(s.app.snapshot.document.graph.name, "Imported");
  assert.deepEqual(JSON.parse(raw), doc);
});
test("AT-S02-01: base revision, content, lifetime, readonly, busy and fabricated review fences", () => {
  for (const mode of ["edit", "aba", "load", "readonly", "forged"] as const) {
    const s = application(),
      review = s.app.inspectText(JSON.stringify(input()));
    if (mode === "edit" || mode === "aba") s.add("float");
    if (mode === "aba")
      s.app.execute({ panelId: "test", typeId: "test" }, s.target(), {
        commandId: "grape.undo",
        args: {},
      });
    if (mode === "load") s.app.newDocument();
    if (mode === "readonly") s.app.setReadonly(true);
    const before = s.app.snapshot;
    assert.throws(
      () =>
        s.app.acceptReview(
          mode === "forged" ? structuredClone(review) : review,
        ),
      /IMPORT_STALE|IMPORT_READONLY|REVIEW_CLOSED/,
    );
    assert.deepEqual(s.app.snapshot, before);
  }
  const s = application(),
    id = s.add("float"),
    review = s.app.inspectText(JSON.stringify(input()));
  s.app.grant("move", ["grape.node.move"]);
  const gesture = s.app.beginGesture(
    { panelId: "move", typeId: "move" },
    s.target(),
    { commandId: "grape.node.move", args: { ids: [id] } },
  );
  assert.throws(() => s.app.acceptReview(review), /HISTORY_BUSY/);
  gesture.cancel();
  s.app.acceptReview(review);
});
test("AT-S02-01: invalid/future/duplicate IDs/unknown structure have explicit outcomes and never publish", () => {
  const s = application(),
    base = s.app.snapshot;
  const cases: [string, string, string][] = [
    ["{broken", "rejected", "JSON_KEY"],
  ];
  for (const [mutate, status, reason] of [
    [
      (d: any) => (d.formatVersion.major = 999),
      "recovery-readonly",
      "UNSUPPORTED_VERSION",
    ],
    [
      (d: any) => (d.formatVersion.major = 1),
      "recovery-readonly",
      "UNSUPPORTED_VERSION",
    ],
    [
      (d: any) =>
        d.graph.stages[1].network.nodes.push(
          d.graph.stages[1].network.nodes[0],
        ),
      "rejected",
      "DUPLICATE_IDENTITY",
    ],
    [
      (d: any) => (d.graph.future = { x: 1 }),
      "recovery-readonly",
      "UNKNOWN_STRUCTURE",
    ],
    [
      (d: any) => {
        d.graph.future = 1;
        delete d.graph.id;
      },
      "rejected",
      "REQUIRED",
    ],
  ] as const) {
    const doc = input();
    mutate(doc);
    cases.push([JSON.stringify(doc), status, reason]);
  }
  for (const [raw, status, reason] of cases) {
    const review = s.app.inspectText(raw);
    assert.equal(review.status, status);
    assert.equal(review.reason, reason);
    assert.equal(review.raw, raw);
    assert.equal(review.candidate, null);
    assert.throws(() => s.app.acceptReview(review), /IMPORT_ERRORS/);
    s.app.cancelReview(review);
    assert.deepEqual(s.app.snapshot, base);
  }
});
test("AT-S02-01: only explicit layout repair yields a candidate; unknown endpoints/references are never guessed", () => {
  const s = application(),
    doc = input() as any;
  doc.graph.stages[1].network.nodes[1].position = ["bad", 40];
  const raw = JSON.stringify(doc),
    review = s.app.inspectText(raw);
  assert.equal(review.status, "repairable");
  assert.equal(review.repairs.length, 1);
  assert.deepEqual(review.repairs[0].before, ["bad", 40]);
  assert.deepEqual(
    review.candidate!.graph.stages[1].network.nodes[1].position,
    [48, 96],
  );
  assert.equal(review.raw, raw);
  s.app.acceptReview(review);
  for (const change of [
    (d: any) => (d.graph.stages[1].network.edges[0].from.nodeId = "unknown"),
    (d: any) =>
      (d.graph.stages[1].network.nodes[1].references = [
        { slot: "opaque-ref", kind: "node", targetId: "unknown" },
      ]),
    (d: any) => {
      const e = d.graph.stages[1].network.edges[0];
      e.from.nodeId = e.to.nodeId;
      e.from.portKey = "result";
    },
  ]) {
    const bad = input();
    change(bad);
    const result = s.app.inspectText(JSON.stringify(bad));
    assert.equal(result.status, "blocked");
    assert.equal(result.candidate, null);
    assert(
      result.diagnostics.some((d) =>
        ["EDGE_INVALID", "REFERENCE_MISSING", "CYCLE"].includes(d.code),
      ),
    );
  }
});
test("AT-S02-01: mismatched exact pins cannot replace the destination; failed replacement is atomic", () => {
  const s = application(),
    doc = input();
  doc.graph.modules.reverse();
  const r = s.app.inspectText(JSON.stringify(doc)),
    before = s.app.snapshot;
  assert.equal(r.status, "valid");
  assert.throws(() => s.app.acceptReview(r), /IMPORT_DEFINITIONS/);
  assert.deepEqual(s.app.snapshot, before);
  assert.equal(s.app.canUndo, false);
});
test("AT-S02-02: missing exact module survives move/rename/save/reopen; exact restoration invokes codec and never substitutes latest", () => {
  const s = application(),
    source = flow(),
    doc = structuredClone(source.graph.capture().document);
  const node = doc.graph.stages[1].network.nodes.find(
    (n) => n.id === source.float,
  )!;
  const pin = {
    moduleId: "test.opaque",
    version: "1.0",
    fingerprint: "exact-v1",
  };
  let validations = 0;
  const module = (version: string, fingerprint: string): ModuleContribution => {
    const ref = { moduleId: pin.moduleId, version, fingerprint };
    const def = basicNodes.nodes.find(
      (n) => n.ref.typeId === node.type.typeId,
    )!;
    return {
      manifest: ref,
      presentation: {
        ...basicNodes.presentation,
        owner: { ...ref, namespace: ref.moduleId, catalogVersion: 1 },
      },
      nodes: [
        {
          ...def,
          ref: { ...def.ref, ...ref },
          presentation: {
            ...def.presentation,
            label: {
              ...def.presentation.label,
              owner: { ...ref, namespace: ref.moduleId, catalogVersion: 1 },
            },
          },
          stateCodec: {
            schemaVersion: 1,
            validate: (state) => {
              validations++;
              assert.deepEqual(state, node.state);
              return [];
            },
          },
        },
      ],
    };
  };
  node.state = {
    value: 0.25,
    opaque: {
      revision: "archive",
      cjk: "中文",
      nonBMP: "🍇",
      notAReference: source.float,
    },
  };
  const v1 = module("1.0", "exact-v1"),
    v2 = module("2.0", "latest-v2");
  node.type = { ...node.type, ...pin };
  doc.graph.modules.push(pin);
  node.extensions["test.notes"] = { keep: true };
  doc.graph.resources.push({
    id: "resource",
    type: { ...pin, typeId: "opaque-resource" },
    data: { archive: ["untouched"] },
    references: [],
    referencesComplete: false,
    extensions: {},
  });
  s.definitions.register(v2);
  const raw = writeDocument(doc),
    r = s.app.inspectText(raw),
    before = s.app.snapshot;
  assert.equal(r.status, "blocked");
  assert.equal(r.candidate, null);
  assert.equal(validations, 0);
  assert.deepEqual(s.app.snapshot, before);
  assert.throws(() => s.app.acceptReview(r), /IMPORT_ERRORS/);
  s.app.openReviewed(r);
  assert.notEqual(s.app.snapshot.loadId, before.loadId);
  assert.equal(s.app.canUndo, false);
  assert.equal(s.app.generate().status, "failed");
  const fixed = s.definitions.pin(doc.graph.modules),
    g = new Graph(s.app.snapshot.document, fixed, s.identity);
  g.change("Move and rename opaque node", (d) => {
    d.move(source.network, source.float, [22, 33]);
    d.rename(source.network, source.float, "Opaque saved");
  });
  const saved = writeDocument(g.capture().document),
    read = readDocument(saved);
  assert.equal(read.status, "editable");
  const expected = structuredClone(node);
  expected.position = [22, 33];
  expected.name = "Opaque saved";
  assert.deepEqual(
    JSON.parse(saved).graph.stages[1].network.nodes.find(
      (n: any) => n.id === source.float,
    ),
    expected,
  );
  assert.deepEqual(JSON.parse(saved).graph.resources, doc.graph.resources);
  // Register the exact resource owner at the same atomic module boundary.
  const complete = {
    ...v1,
    resources: [
      {
        ref: { ...pin, typeId: "opaque-resource" },
        codec: { schemaVersion: 1, validate: () => [] },
      },
    ],
  };
  s.definitions.register(complete);
  assert.equal(
    g.capture().diagnostics.some((d) => d.code === "MISSING_MODULE"),
    true,
  );
  s.app.openText(saved);
  assert(validations > 0);
  assert.equal(s.app.generate().status, "success");
  assert.deepEqual(
    JSON.parse(s.app.exportText()).graph.resources,
    doc.graph.resources,
  );
});
test("AT-S02-03 boundary: foreign/legacy input is retained with explicit unresolved Gate, never implicit conversion or archive execution", () => {
  const s = application();
  for (const revision of [
    undefined,
    "known-but-unmapped",
    "unknown",
    null,
    12,
  ]) {
    const raw = JSON.stringify({
      format: "td-sgrape",
      definitionUuid: "known-uuid",
      revisionHash: revision,
      archive: { code: "throw new Error('must not execute')" },
    });
    const r = s.app.inspectText(raw);
    assert.equal(r.status, "foreign");
    assert.equal(r.reason, "IMPORT_CONVERTER_REQUIRED");
    assert.equal(r.provenance.legacyGate, "G-VERSION-COMPAT");
    assert.equal(r.provenance.conversion, "none");
    assert.equal(r.raw, raw);
    assert.equal(r.candidate, null);
  }
});
test("AT-S02-04: ASCII/CJK/non-BMP UTF-8 exact byte budget produces deterministic results without truncation", () => {
  const s = application();
  for (const character of ["a", "中", "🍇"]) {
    const doc = input();
    doc.graph.extensions["test.text"] = "";
    const baseline = JSON.stringify(doc),
      remaining =
        DOCUMENT_MAX_BYTES - new TextEncoder().encode(baseline).length;
    const width = new TextEncoder().encode(character).length;
    doc.graph.extensions["test.text"] =
      character.repeat(Math.floor(remaining / width)) +
      "x".repeat(remaining % width);
    const raw = JSON.stringify(doc);
    assert.equal(new TextEncoder().encode(raw).length, DOCUMENT_MAX_BYTES);
    assert.equal(s.app.inspectText(raw).status, "valid");
    const rejected = s.app.inspectText(raw + " ");
    assert.equal(rejected.reason, "DOCUMENT_SIZE");
    assert.equal(rejected.raw, raw + " ");
  }
});
test("AT-S02-04: network budgets, duplicate JSON keys, unknown nested structure and opaque fields are independently checked", () => {
  const s = application(),
    doc = input();
  for (let i = 0; i < 253; i++)
    doc.graph.stages[1].network.nodes.push({
      ...structuredClone(doc.graph.stages[1].network.nodes[1]),
      id: "extra-" + i,
      name: "Extra " + i,
    });
  const r = s.app.inspectText(JSON.stringify(doc));
  assert.equal(r.reason, "NETWORK_SIZE");
  assert.throws(() => s.app.openReviewed(r), /IMPORT_NOT_LOADABLE/);
  assert.equal(
    s.app.inspectText('{"a":1,"\\u0061":2}').reason,
    "DUPLICATE_JSON_KEY",
  );
  const future = input() as any;
  future.graph.stages[1].network.edges[0].adaptation.extra = { preserve: 1 };
  assert.equal(
    s.app.inspectText(JSON.stringify(future)).status,
    "recovery-readonly",
  );
  const opaque = input();
  opaque.graph.extensions["test.archive"] = {
    arbitrary: [1, "中", "🍇"],
    code: "do not execute",
  };
  const inspected = inspectDocument(JSON.stringify(opaque), s.definitions);
  assert.equal(inspected.status, "valid");
  assert.deepEqual(inspected.candidate, opaque);
});
