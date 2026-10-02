import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import "./runtime.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
const directory = "evidence/s02";
fs.mkdirSync(directory, { recursive: true });
const git = (...args) => {
  const r = spawnSync("git", args, { encoding: "utf8" });
  if (r.status !== 0) throw Error(r.stderr);
  return r.stdout.trim();
};
const implementationRevision = git("rev-parse", "HEAD");
const sourceRoots = [
  "src",
  "apps",
  "tests",
  "tools",
  "conformance",
  "package.json",
  "package-lock.json",
  "playwright.config.ts",
  "tsconfig.json",
];
if (git("status", "--porcelain", "--", ...sourceRoots))
  throw Error(
    "Commit implementation sources before revision-bound verification.",
  );
const hash = (data) => crypto.createHash("sha256").update(data).digest("hex");
const files = git("ls-files", "--", ...sourceRoots)
  .split("\n")
  .filter(Boolean)
  .sort()
  .map((file) => ({ file, sha256: hash(fs.readFileSync(file)) }));
const commands = [];
const record = {
  schemaVersion: 1,
  recordKind: "unreviewed-s02-implementation-evidence",
  status: "running",
  accepted: false,
  humanAccepted: false,
  reviewedBy: null,
  sliceCompletionEvidence: false,
  handoffRevision: "IH-005",
  sliceId: "S02",
  implementationRevision,
  startingBaseline: "365eef3e3240a25b18eb46cb637774596336228d",
  recordedAt: new Date().toISOString(),
  sourceSetSha256: hash(JSON.stringify(files)),
  files,
  commands,
  acceptanceFamilies: {
    "AT-S02-01": "current-format tests; awaiting independent review",
    "AT-S02-02":
      "browser preservation and portable exact restoration tests; awaiting independent review",
    "AT-S02-03":
      "BLOCKED: no approved legacy revision-to-pin mappings; boundary tests are not compatibility acceptance",
    "AT-S02-04":
      "portable budgets/PNG and real Chromium PNG tests; awaiting independent review",
  },
  unresolvedGates: [
    "G-VERSION-COMPAT",
    "G-LU-NODE-006",
    "G-LU-AUDIT-003",
    "G-LU-DATA-001",
    "G-LU-DATA-002",
    "G-LU-DATA-004",
    "G-HANDOFF-CQ-OWNERSHIP",
  ],
  limitations: [
    "No legacy conversion/upgrade or Texture/TOP-source conversion",
    "No full AT-S02-03 PASS",
    "Desktop Chromium only; no GPU/Host/Safari/physical-device qualification",
    "No later Slice authorized; no accepted S02 evidence or Slice completion",
  ],
};
const save = () =>
  fs.writeFileSync(
    `${directory}/verification.json`,
    JSON.stringify(record, null, 2) + "\n",
  );
save();
function run(id, command, args, cwd = root) {
  const r = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    timeout: 180000,
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, GRAPE_EVIDENCE_DIR: directory },
  });
  fs.writeFileSync(
    `${directory}/${id}.log`,
    (r.stdout ?? "") + (r.stderr ?? "") + (r.error ? String(r.error) : ""),
  );
  commands.push({
    id,
    command: [command, ...args],
    cwd,
    exitCode: r.status,
    log: `${id}.log`,
  });
  console.log(`${id}: ${r.status === 0 ? "PASS" : "FAIL"}`);
  if (r.status !== 0) {
    record.status = "validation-failed-unreviewed";
    save();
    throw Error(`${id} failed; see ${directory}/${id}.log`);
  }
  save();
}
run("build", "npm", ["run", "build"]);
run("unit-conformance", "npm", ["test"]);
run("boundaries", "npm", ["run", "conformance"]);
run("browser", "npm", ["run", "test:browser"]);
run(
  "bootstrap",
  process.execPath,
  ["tools/verify-bootstrap.mjs"],
  path.dirname(root),
);
run(
  "bootstrap-tests",
  process.execPath,
  ["--test", "tools/verify-bootstrap.test.mjs"],
  path.dirname(root),
);
run(
  "current-state",
  process.execPath,
  ["handoff/tools/check-implementation-state.mjs", "--current"],
  path.dirname(root),
);
run("package-web", "tar", [
  "-czf",
  `${directory}/s02-web.tar.gz`,
  "-C",
  "dist",
  ".",
]);
const { chromium } = await import("@playwright/test");
const browser = await chromium.launch();
record.runtime = {
  node: process.version,
  platform: process.platform,
  architecture: process.arch,
  osRelease: os.release(),
  chromium: browser.version(),
  playwright: JSON.parse(
    fs.readFileSync("node_modules/@playwright/test/package.json", "utf8"),
  ).version,
  viewport: { width: 1440, height: 1000 },
  headless: true,
};
await browser.close();
record.browserSummary = JSON.parse(
  fs.readFileSync(`${directory}/browser-results.json`, "utf8"),
).stats;
record.build = {
  artifact: "s02-web.tar.gz",
  sha256: hash(fs.readFileSync(`${directory}/s02-web.tar.gz`)),
};
record.artifacts = fs
  .readdirSync(directory)
  .filter((f) => f !== "verification.json")
  .sort()
  .map((file) => ({
    file,
    sha256: hash(fs.readFileSync(`${directory}/${file}`)),
  }));
record.status =
  "declared-checks-passed-unreviewed-legacy-compatibility-blocked";
save();
console.log(
  JSON.stringify(
    {
      implementationRevision,
      status: record.status,
      browser: record.browserSummary,
    },
    null,
    2,
  ),
);
