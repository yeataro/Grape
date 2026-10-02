import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
const evidence = process.env.GRAPE_EVIDENCE_DIR!;
async function exported(page: any) {
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  return JSON.parse(
    await fs.readFile((await (await download).path())!, "utf8"),
  );
}
test("S03 FR01 real WebGL2 compiles supported Structure arrays and ES300 explicitly rejects admitted nested arrays", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { flow } = await import("/tests/fixtures/setup.ts"),
      { compile } = await import("/src/generation/compiler.ts"),
      { esProfile } = await import("/src/modules/image.ts");
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) throw Error("WEBGL2_UNAVAILABLE");
    const rows = [];
    for (const nested of [false, true]) {
      const s = flow(),
        arr = (t: string, n: number) => "array@" + JSON.stringify([t, n]);
      s.graph.change("Structure", (d: any) => {
        const st = d.createStructure("ArrayStruct", [
            {
              id: "a",
              name: "a",
              type: nested
                ? arr(arr("glsl.float", 2), 3)
                : arr("glsl.float", 3),
            },
            { id: "b", name: "b", type: "glsl.float" },
          ]),
          n = d.addReferenceNode(s.network, "structure", st),
          f = d.addReferenceNode(s.network, "field", st, "b");
        d.connect(
          s.network,
          { nodeId: n, portKey: "value" },
          { nodeId: f, portKey: "value" },
        );
        d.connect(
          s.network,
          { nodeId: f, portKey: "field" },
          { nodeId: s.compose, portKey: "y" },
        );
      });
      const before = JSON.stringify(s.graph.capture()),
        out = compile(s.graph.capture(), s.fixed, esProfile),
        shaders = out.artifacts.map((a: any) => {
          const shader = gl.createShader(
            a.key === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER,
          )!;
          gl.shaderSource(shader, a.text);
          gl.compileShader(shader);
          const result = {
            key: a.key,
            compiled: !!gl.getShaderParameter(shader, gl.COMPILE_STATUS),
            log: gl.getShaderInfoLog(shader),
          };
          gl.deleteShader(shader);
          return result;
        });
      rows.push({
        nested,
        graphDiagnostics: s.graph.capture().diagnostics,
        status: out.status,
        diagnostics: out.diagnostics,
        artifacts: out.artifacts,
        shaders,
        unchanged: JSON.stringify(s.graph.capture()) === before,
      });
    }
    return {
      webgl: gl.getParameter(gl.VERSION),
      renderer: gl.getParameter(gl.RENDERER),
      rows,
    };
  });
  expect(result.rows[0].status).toBe("success");
  expect(result.rows[0].shaders).toHaveLength(2);
  expect(result.rows[0].shaders.every((s: any) => s.compiled)).toBe(true);
  expect(result.rows[1].status).toBe("failed");
  expect(result.rows[1].artifacts).toHaveLength(0);
  expect(
    result.rows[1].diagnostics.some((d: any) => d.code === "PROFILE_TYPE"),
  ).toBe(true);
  expect(
    result.rows.every(
      (r: any) => r.unchanged && r.graphDiagnostics.length === 0,
    ),
  ).toBe(true);
  await fs.writeFile(
    evidence + "/repair-webgl2.json",
    JSON.stringify({ browser: browser.version(), ...result }, null, 2),
  );
});
test("S03 EG01 browser clipboard imports TOP declarations with one slot and shows atomic native path rejection", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add Compose", exact: true }).click();
  await page
    .getByRole("button", { name: "Compose output result", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Image output input color", exact: true })
    .click();
  const packets = await page.evaluate(async () => {
    const { flow } = await import("/tests/fixtures/setup.ts"),
      { copySelection } = await import("/src/model/transfer.ts");
    const s = flow();
    let top = "",
      array = "";
    s.graph.change("Native descriptors", (d: any) => {
      top = d.addReferenceNode(
        s.network,
        "source",
        d.createSource("TOP", "glsl.sampler2D", null, true, {
          kind: "top",
          path: "/native",
          source: "source-A",
          origin: "origin-A",
          slot: 9,
        }),
      );
      array = d.addReferenceNode(
        s.network,
        "source",
        d.createSource("Array", 'array@["glsl.float",2]', null, true, {
          kind: "native-array",
          path: "x".repeat(2049),
        }),
      );
    });
    return {
      top: copySelection(s.graph.capture(), s.fixed, s.network, [top]),
      bad: copySelection(s.graph.capture(), s.fixed, s.network, [array]),
    };
  });
  await page.getByText("Local clipboard", { exact: true }).click();
  const text = page.getByRole("textbox", { name: "Local clipboard text" }),
    paste = page.getByRole("button", { name: "Paste selection", exact: true });
  await text.fill(JSON.stringify(packets.top));
  await paste.click();
  await expect(page.locator(".node")).toHaveCount(3);
  await paste.click();
  await expect(page.locator(".node")).toHaveCount(4);
  const after = await exported(page);
  expect(after.graph.resources).toHaveLength(2);
  expect(
    new Set(after.graph.resources.map((r: any) => r.data.binding.slot)).size,
  ).toBe(1);
  expect(new Set(after.graph.resources.map((r: any) => r.id)).size).toBe(2);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".node")).toHaveCount(3);
  const before = await exported(page);
  await text.fill(JSON.stringify(packets.bad));
  await paste.click();
  await expect(page.locator("body")).toContainText("SOURCE_PATH");
  expect(await exported(page)).toEqual(before);
  await expect(
    page.getByRole("button", { name: "Redo", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  expect(await exported(page)).toEqual(after);
  await page.screenshot({
    path: evidence + "/repair-source-clipboard.png",
    fullPage: true,
  });
});
