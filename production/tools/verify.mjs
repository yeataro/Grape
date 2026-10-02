import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import "./runtime.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
fs.mkdirSync("evidence", { recursive: true });
const commands = [];
fs.writeFileSync(
  "evidence/verification.json",
  JSON.stringify(
    { status: "running", accepted: false, startedAt: new Date().toISOString() },
    null,
    2,
  ) + "\n",
);
function run(id, command, args, cwd = root) {
  console.log("Checking " + id + "…");
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: process.env,
    timeout: 180000,
    maxBuffer: 16 * 1024 * 1024,
  });
  const output =
    (result.stdout ?? "") +
    (result.stderr ?? "") +
    (result.error ? String(result.error) : "");
  fs.writeFileSync("evidence/" + id + ".log", output);
  commands.push({
    id,
    command: [command, ...args],
    cwd,
    exitCode: result.status,
    log: id + ".log",
  });
  console.log(id + ": " + (result.status === 0 ? "PASS" : "FAIL"));
  if (result.status !== 0) {
    console.error(output);
    fs.writeFileSync(
      "evidence/verification.json",
      JSON.stringify(
        { status: "failed", accepted: false, failedCheck: id, commands },
        null,
        2,
      ) + "\n",
    );
    throw Error(id + " failed");
  }
  return result.stdout;
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
  "evidence/s01-web.tar.gz",
  "-C",
  "dist",
  ".",
]);
const { chromium } = await import("@playwright/test");
const browser = await chromium.launch({ headless: true });
const browserVersion = browser.version();
await browser.close();
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
function filesUnder(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? filesUnder(path.join(dir, e.name))
        : [path.join(dir, e.name)],
    );
}
const paths = ["src", "apps", "tests", "tools"]
  .flatMap(filesUnder)
  .concat([
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "playwright.config.ts",
    "index.html",
    "conformance/ownership.json",
    ".node-version",
    ".npmrc",
  ])
  .sort();
const files = paths.map((file) => ({
  file,
  sha256: hash(fs.readFileSync(file)),
}));
const sourceSetSha256 = hash(JSON.stringify(files));
const revision = spawnSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).stdout.trim();
const gitStatus = spawnSync("git", ["status", "--porcelain"], {
  encoding: "utf8",
}).stdout;
const report = JSON.parse(
  fs.readFileSync("evidence/browser-results.json", "utf8"),
);
const record = {
  schemaVersion: 1,
  recordKind: "unreviewed-s01-implementation-evidence",
  handoffRevision: "IH-005",
  status: "checks-passed-awaiting-review",
  accepted: false,
  reviewedBy: null,
  completedSlices: [],
  recordedAt: new Date().toISOString(),
  implementationRevision: revision,
  sourceSetSha256,
  files,
  runtime: {
    node: process.version,
    nodeExecutable: process.execPath,
    platform: process.platform,
    architecture: process.arch,
    osRelease: os.release(),
    chromium: browserVersion,
    playwright: JSON.parse(
      fs.readFileSync("node_modules/@playwright/test/package.json", "utf8"),
    ).version,
    headless: true,
    viewport: { width: 1440, height: 1000 },
  },
  browserSummary: report.stats,
  commands,
  build: {
    artifact: "s01-web.tar.gz",
    sha256: hash(fs.readFileSync("evidence/s01-web.tar.gz")),
    files: filesUnder("dist")
      .sort()
      .map((file) => ({ file, sha256: hash(fs.readFileSync(file)) })),
  },
  dirtyWorkingTreeAtCapture: gitStatus,
  limits: [
    "No Human Owner or independent acceptance is recorded.",
    "No GPU/Host execution, physical device, Safari, native OS IME, S02+, or mixed History qualification.",
    "Scope and residual Gates are described in REVIEW.md and conformance/CONTRACT_MAP.md.",
  ],
};
fs.writeFileSync(
  "evidence/verification.json",
  JSON.stringify(record, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    { status: record.status, revision, sourceSetSha256, browser: report.stats },
    null,
    2,
  ),
);
