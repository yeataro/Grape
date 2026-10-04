import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  functionFixture,
  shapeFixture,
  stageFixture,
  effectFixture,
} from "../tests/fixtures/s05.ts";
import { currentSetup } from "../tests/fixtures/s04.ts";
import {
  functionOperationRef,
  functionProfile,
} from "../src/modules/function-operations.ts";
import { writeDocument, readDocument } from "../src/persistence/codec.ts";
import { compile } from "../src/generation/compiler.ts";
import { asNetwork } from "../src/sdk/networks.ts";
import { buildPersonal, readPersonal } from "../src/application/personal.ts";
import { probeDefinitions } from "../src/modules/package-probe.ts";
import { linkedUniformFixture } from "../tests/fixtures/s05-uniforms.ts";

const destination = process.argv[2];
if (!destination || fs.existsSync(destination))
  throw Error("FRESH_SAMPLE_DIRECTORY_REQUIRED");
fs.mkdirSync(destination, { recursive: true });
const entries: object[] = [];
function save(name: string, bytes: string, extra: object) {
  fs.writeFileSync(path.join(destination, name), bytes, { flag: "wx" });
  entries.push({
    file: name,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    bytes: Buffer.byteLength(bytes),
    ...extra,
  });
}
function document(
  name: string,
  s: ReturnType<typeof functionFixture> | ReturnType<typeof currentSetup>,
  purpose: string,
) {
  const doc = s.graph.capture().document;
  const bytes = writeDocument(doc);
  if (readDocument(bytes).status !== "editable") throw Error("SAMPLE_READBACK");
  const result = compile(s.graph.capture(), s.fixed, functionProfile);
  save(name + ".grape.json", bytes, {
    kind: "document",
    purpose,
    generation: result.status,
    diagnostics: result.diagnostics,
  });
}
for (const kind of [
  "shared-expand",
  "shared-function",
  "nested-function",
  "uniform-function",
  "constant-detach",
  "activation-rejected",
] as const) {
  const s = functionFixture();
  s.graph.change("Readable sample layout", (d) => {
    d.move(s.network, s.call, [30, 30]);
    d.move(s.network, s.second, [30, 300]);
    d.move(s.network, s.compose, [300, 30]);
    d.move(
      s.network,
      s.graph
        .capture()
        .document.graph.stages.find((st) => st.network.id === s.network)!
        .network.nodes[0].id,
      [550, 30],
    );
  });
  if (kind.endsWith("function"))
    s.graph.change("Function", (d) =>
      d.emissionMode(s.body, "function", s.profile),
    );
  if (kind === "nested-function") {
    s.graph.change("Nest calls", (d) =>
      d.encapsulate(s.network, [s.call, s.second]),
    );
    const r = s.graph
      .capture()
      .document.graph.resources.find((r) =>
        asNetwork(r, s.fixed)?.network.nodes.some((n) => n.id === s.call),
      )!;
    s.graph.change("Outer function", (d) =>
      d.emissionMode(asNetwork(r, s.fixed)!.network.id, "function", s.profile),
    );
  }
  if (kind === "uniform-function")
    s.graph.change("Uniform", (d) => {
      const resource = d.createSource("gain", "glsl.float", 0.4, true, {
        kind: "uniform",
      });
      const node = d.addReferenceNode(
        s.network,
        "source",
        resource,
        undefined,
        functionOperationRef("source"),
      );
      d.connect(
        s.network,
        { nodeId: node, portKey: "value" },
        { nodeId: s.call, portKey: "x" },
      );
    });
  if (kind === "constant-detach" || kind === "activation-rejected")
    s.graph.change("Constant consumer", (d) => {
      const internal = kind === "activation-rejected",
        network = internal ? s.body : s.network;
      const receiver = d.add(
        network,
        functionOperationRef("constant-input"),
        [300, 320],
      );
      d.connect(
        network,
        {
          nodeId: internal ? s.definition().data.network.nodes[0].id : s.call,
          portKey: internal ? "x" : "y",
        },
        { nodeId: receiver, portKey: "value" },
      );
    });
  document(kind, s, kind);
  if (kind === "shared-function") {
    const asset = await buildPersonal(
      s.graph.capture(),
      s.fixed,
      s.definition().resource.id,
      s.profile,
      probeDefinitions,
    );
    const bytes = JSON.stringify(asset, null, 2) + "\n";
    await readPersonal(bytes, s.fixed, s.profile, probeDefinitions);
    save("shared-function.personal.json", bytes, {
      kind: "Personal",
      contentHash: asset.contentHash,
      purpose:
        "Import through Personal files, select and insert; function mode and exact dependency closure retained.",
    });
  }
}
for (const kind of ["array", "nominal"] as const) {
  const s = shapeFixture(kind);
  s.graph.change("Function", (d) =>
    d.emissionMode(s.body, "function", s.profile),
  );
  document(
    "shape-" + kind,
    s as ReturnType<typeof functionFixture>,
    "Fixed shape/nominal function parameter; numeric shader results are in browser evidence.",
  );
}
document(
  "pixel-effects",
  effectFixture() as ReturnType<typeof functionFixture>,
  "Two outputs, one depth/discard evaluation per caller.",
);
document(
  "vertex-pixel",
  stageFixture() as ReturnType<typeof functionFixture>,
  "Same function definition in independent vertex and pixel shaders.",
);
const old = currentSetup();
old.graph.change("Legacy", (d) => d.createSubgraph(old.network));
document(
  "legacy-owner",
  old,
  "Use explicit Upgrade subgraph owners; no silent old owner migration.",
);
for (const kind of ["distinct", "shared-reversed"] as const) {
  document(
    "cross-stage-uniform-" + kind,
    linkedUniformFixture(kind, "function") as ReturnType<
      typeof functionFixture
    >,
    "Program-wide Uniform identity regression. Actual vertex transform feedback and active Uniform readback are in repair browser evidence; UI generation alone is not a numeric oracle.",
  );
}
fs.writeFileSync(
  path.join(destination, "manifest.json"),
  JSON.stringify(
    { generator: "production/tools/s05-samples.ts", entries },
    null,
    2,
  ) + "\n",
  { flag: "wx" },
);
console.log(JSON.stringify({ samples: entries.length, entries }, null, 2));
