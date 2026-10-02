import fs from "node:fs";
import crypto from "node:crypto";
const entries = ["src/modules/nodes.ts", "src/modules/image.ts"];
const report = [];
for (const file of entries) {
  const path = new URL("../" + file, import.meta.url),
    source = fs.readFileSync(path, "utf8");
  // A source-unit fingerprint excludes only the literal digest being calculated.
  const normalized = source.replace(/sha256:[a-f0-9]{64}/g, "sha256:<self>");
  const fingerprint =
    "sha256:" + crypto.createHash("sha256").update(normalized).digest("hex");
  const declared = source.match(/sha256:[a-f0-9]{64}/g) ?? [];
  if (process.argv.includes("--write"))
    fs.writeFileSync(path, source.replace(/sha256:[a-f0-9]{64}/g, fingerprint));
  else if (!declared.length || declared.some((value) => value !== fingerprint))
    throw Error("MODULE_FINGERPRINT_MISMATCH: " + file);
  report.push({ file, fingerprint });
}
console.log(
  JSON.stringify(
    {
      status: "PASS",
      algorithm:
        "sha256 source UTF-8 with digest literals normalized to sha256:<self>",
      modules: report,
    },
    null,
    2,
  ),
);
