import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { valueCases, valueFixture } from "../tests/fixtures/s05-values.ts";
import { writeDocument } from "../src/persistence/codec.ts";
const out = process.argv[2];
if (!out || !path.isAbsolute(out))
  throw Error("Explicit absolute new output directory required");
if (fs.existsSync(out)) throw Error("Output already exists");
fs.mkdirSync(out, { recursive: true });
const entries = [];
for (const item of valueCases)
  for (const [stage, mode] of [
    ["pixel", "root"],
    ["vertex", "root"],
    ["pixel", "function"],
  ] as const) {
    const s = valueFixture(item.key, stage, mode);
    const name = `${item.key}-${stage}-${mode}.grape.json`,
      bytes = Buffer.from(writeDocument(s.graph.capture().document));
    fs.writeFileSync(path.join(out, name), bytes, { flag: "wx" });
    entries.push({
      file: name,
      leaf: item.key,
      stage,
      mode,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      bytes: bytes.length,
    });
  }
const bytes = Buffer.from(
  writeDocument(
    valueFixture("float", "vertex", "root", false, true).graph.capture()
      .document,
  ),
);
fs.writeFileSync(path.join(out, "vertex-workspace.grape.json"), bytes, {
  flag: "wx",
});
entries.push({
  file: "vertex-workspace.grape.json",
  leaf: "workspace",
  stage: "vertex",
  mode: "root",
  sha256: createHash("sha256").update(bytes).digest("hex"),
  bytes: bytes.length,
});
fs.writeFileSync(
  path.join(out, "manifest.json"),
  JSON.stringify(
    {
      format: "grape.document 2.1",
      purpose:
        "Four fixed values in pixel, supported vertex and shared Function; final file is a valid vertex authoring workspace",
      entries,
    },
    null,
    2,
  ) + "\n",
  { flag: "wx" },
);
console.log(JSON.stringify({ samples: entries.length, out }));
