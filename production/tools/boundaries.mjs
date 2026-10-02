import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export async function checker() {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "grape-boundary-"));
  fs.mkdirSync(path.join(temporary, "tools"));
  fs.mkdirSync(path.join(temporary, "executable-reference/node_modules"), {
    recursive: true,
  });
  // Execute unchanged qualification tools in a disposable copy; never install under handoff/.
  for (const name of [
    "check-boundaries.mjs",
    "check-production-boundaries.mjs",
  ])
    fs.copyFileSync(
      path.join(root, "../handoff/tools", name),
      path.join(temporary, "tools", name),
    );
  fs.symlinkSync(
    path.join(root, "node_modules/typescript"),
    path.join(temporary, "executable-reference/node_modules/typescript"),
    process.platform === "win32" ? "junction" : "dir",
  );
  const { checkProduction } = await import(
    pathToFileURL(path.join(temporary, "tools/check-production-boundaries.mjs"))
      .href
  );
  return {
    checkProduction,
    dispose: () => fs.rmSync(temporary, { recursive: true, force: true }),
  };
}
export function sources(manifest) {
  const files = {};
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw Error("Unreviewed source symlink");
      if (entry.isDirectory()) walk(full);
      else if (/\.[cm]?[jt]sx?$/.test(entry.name))
        files[path.relative(root, full).split(path.sep).join("/")] =
          fs.readFileSync(full, "utf8");
    }
  };
  manifest.roots.forEach((r) => walk(path.join(root, r)));
  return files;
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, "conformance/ownership.json"), "utf8"),
  );
  const tool = await checker();
  try {
    const report = tool.checkProduction(
      manifest,
      sources(manifest),
      manifest.changeSet,
    );
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.status === "PASS" ? 0 : 1;
  } finally {
    tool.dispose();
  }
}
