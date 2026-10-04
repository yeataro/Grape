import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { naturalEscapeFlow } from "../tests/browser/s05-escape-flow.ts";
import { createNode } from "../tests/browser/create-node.ts";
import { clickAction } from "../tests/fixtures/public-actions.ts";
const arg = (name: string) => process.argv[process.argv.indexOf(name) + 1];
const manifestFile = arg("--manifest"),
  output = arg("--output"),
  scratch = arg("--scratch"),
  evidence = process.env.GRAPE_EVIDENCE_DIR!;
for (const p of [manifestFile, output, scratch, evidence])
  assert(
    p && path.isAbsolute(p) && p.includes("s06"),
    "EXPLICIT_ABSOLUTE_S06_PATH_REQUIRED",
  );
assert.equal(path.resolve(path.dirname(output)), path.resolve(evidence));
assert(
  !fs.existsSync(evidence) && !fs.existsSync(scratch),
  "FRESH_PATHS_REQUIRED",
);
fs.mkdirSync(evidence, { recursive: true });
fs.mkdirSync(scratch, { recursive: true });
const repo = fileURLToPath(new URL("../../", import.meta.url)),
  hash = (b: Buffer) => createHash("sha256").update(b).digest("hex"),
  manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8")),
  archive = path.resolve(repo, manifest.archive.file);
assert.equal(hash(fs.readFileSync(archive)), manifest.archive.sha256);
execFileSync("tar", ["-xzf", archive, "-C", scratch]);
const files = new Map<string, { bytes: Buffer; type: string }>();
for (const row of manifest.files) {
  assert(!row.file.includes("..") && !path.isAbsolute(row.file));
  const bytes = fs.readFileSync(path.join(scratch, row.file));
  assert.equal(bytes.length, row.bytes);
  assert.equal(hash(bytes), row.sha256);
  files.set("/" + row.file, {
    bytes,
    type: row.file.endsWith(".js")
      ? "text/javascript"
      : row.file.endsWith(".css")
        ? "text/css"
        : "text/html",
  });
}
files.set("/", files.get("/index.html")!);
const server = http.createServer((req, res) => {
  const item = files.get(req.url!);
  if (!item) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.writeHead(200, {
    "Content-Type": item.type,
    "Cache-Control": "no-store",
  });
  res.end(item.bytes);
});
await new Promise<void>((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
const origin = "http://127.0.0.1:" + (server.address() as any).port,
  browser = await chromium.launch(),
  rows: any[] = [];
try {
  for (const [url, file] of files) {
    const response = await fetch(origin + url),
      bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(response.status, 200);
    assert.equal(hash(bytes), hash(file.bytes));
  }
  const fixture = fs.readFileSync(
    path.join(
      repo,
      "production/evidence/s05/drag-performance-01/fixture-14-Multiply.json",
    ),
  );
  for (const wrapper of [false, true])
    for (const exported of [false, true]) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
      });
      try {
        await naturalEscapeFlow(
          await context.newPage(),
          origin,
          wrapper,
          exported,
          fixture,
          path.join(evidence, `escape-${wrapper}-${exported}.json`),
        );
        rows.push({
          case: "natural Escape",
          wrapper,
          exported,
          status: "PASS",
        });
      } finally {
        await context.close();
      }
    }
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  try {
    await context.tracing.start({ screenshots: true, snapshots: true });
    const page = await context.newPage();
    page.on("dialog", (d) => void d.accept());
    await page.goto(origin);
    await createNode(page, "Color RGBA");
    for (let i = 0; i < 4; i++) {
      const field = page.getByRole("textbox", {
        name: ["R", "G", "B", "A"][i],
        exact: true,
      });
      await field.fill(String([0.25, 0.5, 0.75, 1][i]));
      await field.press("Enter");
    }
    await page.locator(".nodes [data-direction=output]").click();
    await page.locator(".nodes [data-direction=input]").click();
    await clickAction(page, "Generate GLSL");
    await expect(page.getByLabel("Generated GLSL")).toContainText("0.25");
    const shader = await page.getByLabel("Generated GLSL").innerText();
    fs.writeFileSync(path.join(evidence, "generated-display.glsl"), shader, {
      flag: "wx",
    });
    const artifacts = shader
      .split(/^\/\/ [^\n]+\r?\n/gm)
      .filter((text) => text.startsWith("#version"));
    const fragment = artifacts.find((text) => !text.includes("gl_Position"));
    assert(fragment, "PIXEL_ARTIFACT_REQUIRED");
    const numeric = await page.evaluate((fragment) => {
      const gl = document.createElement("canvas").getContext("webgl2")!;
      if (!gl) throw Error("WEBGL2_UNAVAILABLE");
      const compile = (type: number, source: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, source);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
          throw Error(gl.getShaderInfoLog(s)!);
        return s;
      };
      const program = gl.createProgram()!;
      gl.attachShader(
        program,
        compile(
          gl.VERTEX_SHADER,
          "#version 300 es\nvoid main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.0-1.0,0,1);}",
        ),
      );
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw Error(gl.getProgramInfoLog(program)!);
      gl.useProgram(program);
      gl.viewport(0, 0, 1, 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      const pixel = new Uint8Array(4);
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      const debug = gl.getExtension("WEBGL_debug_renderer_info");
      return {
        pixel: Array.from(pixel),
        version: gl.getParameter(gl.VERSION),
        renderer: debug
          ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)
          : gl.getParameter(gl.RENDERER),
      };
    }, fragment);
    for (let i = 0; i < 4; i++)
      assert(Math.abs(numeric.pixel[i] - [64, 128, 191, 255][i]) <= 1);
    const downloaded = page.waitForEvent("download");
    await clickAction(page, "Export JSON");
    const document = fs.readFileSync((await (await downloaded).path())!);
    fs.writeFileSync(
      path.join(evidence, "workspace-color.grape.json"),
      document,
      { flag: "wx" },
    );
    await clickAction(page, "Save");
    await expect(page.locator("#save-state")).toHaveText("Saved");
    await page.reload();
    await clickAction(page, "Open saved");
    await page.locator("#saved-list button").first().click();
    await clickAction(page, "Generate GLSL");
    await expect(page.getByLabel("Generated GLSL")).toHaveText(shader);
    await page.getByRole("button", { name: "Shortcuts", exact: true }).click();
    await expect(
      page.getByRole("dialog", { name: "Keyboard shortcuts" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await page.screenshot({
      path: path.join(evidence, "archived-workspace.png"),
    });
    rows.push({
      case: "archived public creation/component edit/connect/generate/numeric/save/reopen/help",
      status: "PASS",
      numeric,
      documentSha256: hash(document),
    });
    await context.tracing.stop({
      path: path.join(evidence, "public-flow-trace.zip"),
    });
  } finally {
    await context.close();
  }
} finally {
  await browser.close();
  await new Promise<void>((resolve) => server.close(() => resolve()));
}
fs.writeFileSync(
  output,
  JSON.stringify(
    {
      status: "ARCHIVE_CHECKS_PASSED",
      submissionReady: !!manifest.implementationI,
      implementationI: manifest.implementationI ?? null,
      buildId: manifest.buildId,
      archive: manifest.archive,
      origin,
      browser: browser.version(),
      rows,
      limits: [
        "same-machine Windows Chromium and software renderer only",
        "No LAN/Tailscale checks or physical-device claim",
        "A preintegration archive is not final I/R or acceptance",
      ],
      temporaryListenerClosed: true,
    },
    null,
    2,
  ) + "\n",
  { flag: "wx" },
);
console.log(
  JSON.stringify({
    rows: rows.length,
    archive: manifest.archive,
    temporaryListenerClosed: true,
  }),
);
