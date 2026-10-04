import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { chromium, expect } from "@playwright/test";
import { valueCases } from "../tests/fixtures/s05-values.ts";
import {
  openValidFile,
  exportDocument,
  saveReopen,
} from "../tests/fixtures/s05-delivered-flows.ts";
const arg = (key: string) => process.argv[process.argv.indexOf(key) + 1];
const manifestFile = arg("--manifest"),
  evidence = process.env.GRAPE_EVIDENCE_DIR!,
  output = arg("--output"),
  scratch = arg("--scratch");
for (const p of [manifestFile, evidence, output, scratch])
  assert.ok(p && path.isAbsolute(p), "Explicit absolute paths required");
assert.equal(path.dirname(output), evidence);
assert.ok(
  !fs.existsSync(evidence) && !fs.existsSync(scratch),
  "Fresh paths required",
);
fs.mkdirSync(evidence, { recursive: true });
fs.mkdirSync(scratch, { recursive: true });
const hash = (b: Buffer) => createHash("sha256").update(b).digest("hex"),
  build = JSON.parse(fs.readFileSync(manifestFile, "utf8")),
  base = path.dirname(manifestFile),
  samples = JSON.parse(
    fs.readFileSync(
      path.join(base, build.samplesDirectory, "manifest.json"),
      "utf8",
    ),
  );
assert.equal(hash(fs.readFileSync(build.archive.file)), build.archive.sha256);
execFileSync("tar", ["-xzf", build.archive.file, "-C", scratch]);
const files = new Map<string, { bytes: Buffer; type: string }>();
for (const r of build.files) {
  const relative = r.file.slice("production/dist/".length),
    bytes = fs.readFileSync(path.join(scratch, relative));
  assert.equal(hash(bytes), r.sha256);
  files.set("/" + relative, {
    bytes,
    type: relative.endsWith(".js")
      ? "text/javascript"
      : relative.endsWith(".css")
        ? "text/css"
        : "text/html",
  });
}
files.set("/", files.get("/index.html")!);
for (const r of samples.entries) {
  const bytes = fs.readFileSync(
    path.join(base, build.samplesDirectory, r.file),
  );
  assert.equal(hash(bytes), r.sha256);
  files.set("/samples/" + r.file, { bytes, type: "application/json" });
}
const server = http.createServer((req, res) => {
  const row = files.get(req.url!);
  if (!row) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.writeHead(200, { "Content-Type": row.type, "Cache-Control": "no-store" });
  res.end(row.bytes);
});
await new Promise<void>((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
const origin = "http://127.0.0.1:" + (server.address() as any).port,
  browser = await chromium.launch(),
  rows = [];
try {
  for (const r of samples.entries) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    try {
      const page = await context.newPage();
      page.on("dialog", (d) => void d.accept());
      await page.goto(origin);
      const response = await page.request.get(origin + "/samples/" + r.file),
        bytes = await response.body();
      assert.equal(response.status(), 200);
      assert.equal(hash(bytes), r.sha256);
      await openValidFile(page, r.file, bytes);
      const item = valueCases.find((x) => x.key === r.leaf),
        canvas = page.locator(".canvas").first();
      const select = async () => {
        if (r.mode === "function") {
          await canvas
            .getByRole("heading", { name: "Subgraph", exact: true })
            .first()
            .click();
          await canvas
            .getByRole("button", { name: "Enter subgraph", exact: true })
            .click();
        }
        if (item)
          await canvas
            .getByRole("heading", { name: item.label, exact: true })
            .click();
      };
      await select();
      if (item) {
        const edited =
          typeof item.edited === "number" ? [item.edited] : item.edited;
        for (let i = 0; i < item.components.length; i++) {
          const input = page.getByRole("textbox", {
            name: item.components[i],
            exact: true,
          });
          await input.fill(String(edited[i]));
          await input.press("Enter");
          await expect(input).toHaveValue(String(edited[i]));
        }
        await page.getByRole("button", { name: "Undo", exact: true }).click();
        await page.getByRole("button", { name: "Redo", exact: true }).click();
      }
      await page
        .getByRole("button", { name: "Generate GLSL", exact: true })
        .click();
      await expect(
        page.getByText("Generated successfully · Host-free GLSL", {
          exact: true,
        }),
      ).toBeVisible();
      const document = await exportDocument(page);
      await saveReopen(page);
      await openValidFile(page, r.file, Buffer.from(JSON.stringify(document)));
      await select();
      await page
        .getByRole("button", { name: "Generate GLSL", exact: true })
        .click();
      await expect(
        page.getByText("Generated successfully · Host-free GLSL", {
          exact: true,
        }),
      ).toBeVisible();
      await page.screenshot({
        path: path.join(evidence, r.file + ".png"),
        fullPage: true,
      });
      const result = {
        sample: r,
        document,
        operations: [
          "public file Review/new session",
          "each component edit where present",
          "Undo/Redo",
          "generation",
          "save/reopen",
          "JSON export/file reopen",
        ],
        status: "PASS",
      };
      fs.writeFileSync(
        path.join(evidence, r.file + ".json"),
        JSON.stringify(result, null, 2) + "\n",
        { flag: "wx" },
      );
      rows.push({ sample: r, status: "PASS" });
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
  await new Promise<void>((resolve) => server.close(() => resolve()));
}
const result = {
  status: "PASS",
  implementationI: build.implementationI,
  buildId: build.buildId,
  archive: build.archive,
  origin,
  browser: browser.version(),
  isolatedContexts: true,
  temporaryListenerClosed: true,
  humanServicesUntouched: [4193, 4194, 4195],
  sameMachine: true,
  secondDevice: false,
  rows,
};
fs.writeFileSync(output, JSON.stringify(result, null, 2) + "\n", {
  flag: "wx",
});
console.log(
  JSON.stringify({
    status: result.status,
    samples: rows.length,
    archive: build.archive,
  }),
);
