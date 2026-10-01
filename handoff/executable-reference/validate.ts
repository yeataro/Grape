import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const evidence = join(root, "evidence");
mkdirSync(evidence, { recursive: true });
function run(name: string, args: string[], input?: string) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: "utf8",
    input,
    maxBuffer: 16 * 1024 * 1024,
  });
  const output =
    result.stdout + result.stderr + (result.error ? String(result.error) : "");
  writeFileSync(join(evidence, `final-${name}.txt`), output);
  return { exitCode: result.status, output };
}
const typecheck = run("typecheck", [
  "node_modules/typescript/bin/tsc",
  "--pretty",
  "false",
]);
const tests = run("tests", [
  "--test",
  "--test-reporter=tap",
  ...readdirSync(join(root, "tests"))
    .filter((n) => n.endsWith(".test.ts"))
    .sort()
    .map((n) => `tests/${n}`),
]);
const demo = run("demo", ["demo.ts"]);
const doc = readFileSync(join(root, "CORE_API_CONTRACTS.md"), "utf8");
const sample = doc.match(/## 9\.[\s\S]*?```ts\r?\n([\s\S]*?)```/)?.[1];
const documentation = sample
  ? run("documentation", ["--input-type=module-typescript"], sample)
  : { exitCode: 1, output: "Missing documentation sample" };
const counts = Object.fromEntries(
  ["tests", "pass", "fail", "skipped", "cancelled", "todo"].map((key) => [
    key,
    Number(tests.output.match(new RegExp(`^# ${key} (\\d+)`, "m"))?.[1] ?? -1),
  ]),
);
const files = [
  ...readdirSync(root).filter(
    (n) =>
      n.endsWith(".ts") ||
      n.endsWith(".md") ||
      ["package.json", "package-lock.json", "tsconfig.json"].includes(n),
  ),
  ...readdirSync(join(root, "tests"))
    .filter((n) => n.endsWith(".ts"))
    .map((n) => `tests/${n}`),
].sort();
const hashes = Object.fromEntries(
  files.map((name) => [
    name,
    createHash("sha256")
      .update(readFileSync(join(root, name)))
      .digest("hex"),
  ]),
);
const passed =
  [typecheck, tests, demo, documentation].every((r) => r.exitCode === 0) &&
  counts.fail === 0 &&
  counts.skipped === 0 &&
  counts.tests > 0;
const report = {
  status: passed ? "passed" : "failed",
  completedAt: new Date().toISOString(),
  runtime: process.version,
  platform: process.platform,
  scope:
    "Four core contracts and the bounded independent TypeScript architecture prototype; not a product certification",
  commands: {
    typecheck: typecheck.exitCode,
    tests: tests.exitCode,
    demo: demo.exitCode,
    documentationExample: documentation.exitCode,
  },
  counts,
  hashes,
};
writeFileSync(
  join(evidence, "FINAL_RESULTS.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    { status: report.status, commands: report.commands, counts, evidence },
    null,
    2,
  ),
);
if (!passed) {
  console.error(
    typecheck.output,
    tests.output.slice(-12000),
    demo.output,
    documentation.output,
  );
  process.exitCode = 1;
}
