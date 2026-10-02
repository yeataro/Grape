import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { checker, sources } from "../../tools/boundaries.mjs";
test("production ownership manifest covers every source and rejects mutation/platform/extension violations", async () => {
  const manifest = JSON.parse(
    fs.readFileSync(
      new URL("../../conformance/ownership.json", import.meta.url),
      "utf8",
    ),
  );
  const tool = await checker();
  try {
    const actual = sources(manifest);
    assert.equal(tool.checkProduction(manifest, actual).status, "PASS");
    const leak = {
      ...actual,
      "src/generation/compiler.ts":
        actual["src/generation/compiler.ts"] +
        '\nimport { Graph } from "../model/graph.ts";\n',
    };
    assert.equal(tool.checkProduction(manifest, leak).status, "FAIL");
    const native = {
      ...actual,
      "src/model/graph.ts":
        actual["src/model/graph.ts"] + "\nconsole.log(window.location);\n",
    };
    assert.equal(tool.checkProduction(manifest, native).status, "FAIL");
    assert.equal(
      tool.checkProduction(manifest, actual, {
        extensionOwner: "feature-controls",
        changedFiles: ["src/features/controls.ts", "apps/web/main.ts"],
      }).status,
      "PASS",
    );
    assert.equal(
      tool.checkProduction(manifest, actual, {
        extensionOwner: "feature-controls",
        changedFiles: ["src/ui/mount.ts"],
      }).status,
      "FAIL",
    );
    for (const [file, text] of Object.entries(actual)) {
      assert(
        !/from\s*['"][^'"]*(executable-reference|qualification)\//.test(text),
        file,
      );
      if (file.startsWith("src/ui/"))
        assert(!/from\s*['"][^'"]*features\//.test(text), file);
    }
  } finally {
    tool.dispose();
  }
});
