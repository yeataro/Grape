import { test, expect, type Page, type Locator } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createNode } from "./create-node.ts";
import { clickAction } from "../fixtures/public-actions.ts";
import { requiredOutput } from "../fixtures/required-output.ts";
const save = (n: string, v: unknown) =>
  fs.writeFileSync(
    path.join(process.env.GRAPE_EVIDENCE_DIR!, n + ".json"),
    JSON.stringify(v, null, 2) + "\n",
  );
async function doc(p: Page) {
  const d = p.waitForEvent("download");
  await clickAction(p, "Export JSON");
  return JSON.parse(fs.readFileSync((await (await d).path())!, "utf8"));
}
const net = (d: any) =>
  d.graph.stages.find((s: any) => s.key === "pixel").network;
async function center(l: Locator) {
  const r = (await l.boundingBox())!;
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
}
async function drag(p: Page, a: Locator, b: { x: number; y: number }) {
  const start = await center(a);
  await p.mouse.move(start.x, start.y);
  await p.mouse.down();
  await p.mouse.move(b.x, b.y, { steps: 30 });
  await p.mouse.up();
}
async function blank(c: Locator) {
  const r = (await c.boundingBox())!;
  return { x: r.x + r.width * 0.65, y: r.y + r.height * 0.75 };
}
async function focus(p: Page, t: Locator) {
  for (let i = 0; i < 180; i++) {
    if (await t.evaluate((e) => e === document.activeElement)) return;
    await p.keyboard.press("Shift+Tab");
  }
  throw Error("No trusted Tab target");
}
async function shader(p: Page) {
  await clickAction(p, "Generate GLSL");
  await p.getByRole("button", { name: "Shader output", exact: true }).click();
  const t = await p.locator("#code pre").innerText();
  await p.keyboard.press("Escape");
  return t;
}
async function pixels(p: Page, text: string) {
  return p.evaluate((text) => {
    const gl = document
      .createElement("canvas")
      .getContext("webgl2", { premultipliedAlpha: false, antialias: false })!;
    if (!gl) throw Error("WEBGL2_UNAVAILABLE");
    const program = gl.createProgram()!;
    for (const [key, kind] of [
      ["vertex", gl.VERTEX_SHADER],
      ["pixel", gl.FRAGMENT_SHADER],
    ] as const) {
      const code = text.split("// " + key + "\n")[1].split("// pixel")[0];
      const sh = gl.createShader(kind)!;
      gl.shaderSource(sh, code);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
        throw Error(gl.getShaderInfoLog(sh)!);
      gl.attachShader(program, sh);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw Error(gl.getProgramInfoLog(program)!);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.viewport(0, 0, 1, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const p = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, p);
    return {
      pixel: [...p],
      renderer: gl.getParameter(gl.RENDERER),
      version: gl.getParameter(gl.VERSION),
    };
  }, text);
}
test.beforeEach(async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
});
test("OC01 new empty zero-alpha shader and old exact public import explicit upgrade save reopen", async ({
  page,
}) => {
  const initial = await doc(page);
  expect(initial.graph.kind.version).toBe("0.3.0");
  const compiled = await shader(page),
    result = await pixels(page, compiled);
  expect(result.pixel).toEqual([0, 0, 0, 0]);
  await requiredOutput(page);
  const old = await doc(page);
  expect(old.graph.kind.version).toBe("0.2.0");
  await clickAction(page, "Generate GLSL");
  await expect(page.locator("#message")).toContainText("INPUT_REQUIRED");
  await clickAction(page, "Save");
  await clickAction(page, "Upgrade Image Output");
  const after = await doc(page);
  expect(after.graph.kind.version).toBe("0.3.0");
  expect(net(after).nodes.map((n: any) => n.id)).toEqual(
    net(old).nodes.map((n: any) => n.id),
  );
  expect(net(after).edges).toEqual(net(old).edges);
  expect((await pixels(page, await shader(page))).pixel).toEqual([0, 0, 0, 0]);
  await clickAction(page, "Save");
  await clickAction(page, "Open saved");
  await page.locator("#saved-list button").first().click();
  expect((await doc(page)).graph).toEqual(after.graph);
  save("oc01-zero-upgrade", { initial, old, after, compiled, result });
});
test("OC03 physical output drop single click commits captured graph coordinate under pan zoom and moved menu", async ({
  page,
}) => {
  await createNode(page, "Color RGBA");
  const c = page.locator(".canvas"),
    out = c.locator("[data-direction=output]");
  await c.getByRole("heading", { name: "Color RGBA", exact: true }).click();
  await page.keyboard.press("h");
  const b = await blank(c);
  await page.mouse.move(b.x, b.y);
  await page.mouse.wheel(0, 160);
  const point = await blank(c),
    before = await doc(page),
    expected = await c.evaluate((el, p) => {
      const r = el.getBoundingClientRect(),
        m = new DOMMatrix(
          (el.querySelector(".viewport") as HTMLElement).style.transform,
        );
      return [(p.x - r.left - m.e) / m.a, (p.y - r.top - m.f) / m.d];
    }, point);
  await drag(page, out, point);
  const menu = c.getByRole("dialog", { name: "Node catalog" });
  await expect(menu).toBeVisible();
  const head = await center(menu.locator("header strong"));
  await page.mouse.move(head.x, head.y);
  await page.mouse.down();
  await page.mouse.move(head.x - 90, head.y - 35, { steps: 20 });
  await page.mouse.up();
  await menu.getByLabel("Search nodes", { exact: true }).fill("Multiply");
  const label = menu.getByRole("button", {
    name: "Create Multiply",
    exact: true,
  });
  await label.click();
  await expect(menu).toBeHidden();
  await expect(c.locator(".creation-preview")).toBeHidden();
  const after = await doc(page),
    made = net(after).nodes.find(
      (n: any) => !net(before).nodes.some((x: any) => x.id === n.id),
    );
  expect(Math.abs(made.position[0] - expected[0])).toBeLessThan(0.01);
  expect(Math.abs(made.position[1] - expected[1])).toBeLessThan(0.01);
  expect(net(after).edges).toHaveLength(1);
  await clickAction(page, "Undo");
  expect(await doc(page)).toEqual(before);
  await clickAction(page, "Redo");
  expect(await doc(page)).toEqual(after);
  save("oc03-single-click", { point, expected, before, after });
});
test("OC04 connected input empty release disconnects once; Escape outside readonly and cancel preserve", async ({
  page,
}) => {
  await createNode(page, "Color RGBA");
  const c = page.locator(".canvas"),
    out = c.locator("[data-direction=output]"),
    input = c.locator("[data-port=color]");
  await out.click();
  await input.click();
  const before = await doc(page),
    b = await blank(c);
  await drag(page, input, b);
  await expect(c.getByRole("dialog", { name: "Node catalog" })).toBeHidden();
  const after = await doc(page);
  expect(net(after).edges).toHaveLength(0);
  await clickAction(page, "Undo");
  expect(await doc(page)).toEqual(before);
  await clickAction(page, "Redo");
  expect(await doc(page)).toEqual(after);
  await clickAction(page, "Undo");
  for (const route of ["escape", "outside", "cancel"]) {
    const a = await center(input);
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    await page.mouse.move(b.x, b.y, { steps: 20 });
    if (route === "escape") await page.keyboard.press("Escape");
    if (route === "outside") await page.mouse.move(1430, 10);
    if (route === "cancel")
      await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    await page.mouse.up();
    expect(await doc(page)).toEqual(before);
  }
  await clickAction(page, "Lock editing");
  await drag(page, input, b);
  expect(await doc(page)).toEqual(before);
  await clickAction(page, "Lock editing");
  save("oc04-disconnect", {
    before,
    after,
    synthetic: "cancel uses window blur; other routes trusted mouse/key",
  });
});
test("OC05 default replaces without Shift; ordinary hover purple and target feedback share geometry", async ({
  page,
}) => {
  await createNode(page, "Color RGBA");
  await createNode(page, "Vector 3");
  const c = page.locator(".canvas"),
    outs = c.locator("[data-direction=output]"),
    input = c.locator("[data-port=color]");
  await outs.nth(0).click();
  await input.click();
  const before = await doc(page);
  await outs.nth(1).click();
  const target = await center(input);
  await page.mouse.move(target.x, target.y, { steps: 30 });
  const feedback = await input.evaluate((el) => ({
    body: getComputedStyle(el.querySelector(".socket")!).backgroundColor,
    shadow: getComputedStyle(el.querySelector(".socket")!).boxShadow,
    rect: el.getBoundingClientRect().toJSON(),
    preview: document
      .querySelector(".connection-preview path")
      ?.getAttribute("d"),
  }));
  await input.click();
  const after = await doc(page);
  expect(net(after).edges).toHaveLength(1);
  expect(net(after).edges[0].from.nodeId).not.toBe(
    net(before).edges[0].from.nodeId,
  );
  expect(feedback.shadow).toContain("170, 132, 214");
  expect(await input.evaluate((e) => e.className)).not.toContain("replace");
  await clickAction(page, "Undo");
  expect(await doc(page)).toEqual(before);
  await clickAction(page, "Redo");
  expect(await doc(page)).toEqual(after);
  save("oc05-replace-feedback", {
    before,
    after,
    feedback,
    wire: await c.locator(".wires path").getAttribute("d"),
  });
});
for (const width of [620, 1440, 1920])
  test(`OC02 footer fills viewport ${width} and disclosures preserve graph`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 620 ? 650 : 1000 });
    const before = await doc(page);
    const geometry = await page.evaluate(() => ({
      footer: document
        .querySelector("footer")!
        .getBoundingClientRect()
        .toJSON(),
      main: document.querySelector("main")!.getBoundingClientRect().toJSON(),
      width: innerWidth,
      height: innerHeight,
      scroll: document.documentElement.scrollHeight,
    }));
    expect(geometry.footer.x).toBe(0);
    expect(geometry.footer.width).toBe(width);
    expect(geometry.footer.bottom).toBe(geometry.height);
    expect(geometry.main.bottom).toBe(geometry.footer.y);
    expect(geometry.scroll).toBe(geometry.height);
    await page.screenshot({
      path: path.join(process.env.GRAPE_EVIDENCE_DIR!, `footer-${width}.png`),
    });
    for (const name of ["Shader output", "Hints", "Project actions"]) {
      await page.getByRole("button", { name, exact: true }).click();
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("button", { name, exact: true }),
      ).toBeFocused();
    }
    expect(await doc(page)).toEqual(before);
    save("oc02-footer-" + width, geometry);
  });
test("OC10 F2 captures once before modal with live keyboard focus over different hovered target", async ({
  page,
}) => {
  await createNode(page, "Color RGBA");
  await createNode(page, "Multiply");
  const n = page
      .locator(".node")
      .filter({
        has: page.getByRole("heading", { name: "Color RGBA", exact: true }),
      }),
    other = page.getByRole("heading", { name: "Multiply", exact: true });
  await focus(page, n);
  await other.hover();
  const before = await doc(page);
  await focus(page, n);
  await other.hover();
  await page.keyboard.press("F2");
  const d = page.getByRole("dialog", {
    name: "Object information",
    exact: true,
  });
  await expect(d).toContainText("Node: Color RGBA");
  await expect(d).not.toContainText("Panel: Canvas");
  const text = await d.innerText();
  await page.mouse.move(10, 10, { steps: 30 });
  expect(await d.innerText()).toEqual(text);
  await page.keyboard.press("Escape");
  await expect(n).toBeFocused();
  expect(await doc(page)).toEqual(before);
  save("oc10-target-captured", {
    text,
    policy: "live keyboard focus, no global hover target",
  });
});

test("OC01 new exact output connected float vector2 vector3 RGBA render numerical conversion results", async ({
  page,
}) => {
  const rows = [];
  for (const name of ["Float (fixed)", "Vector 2", "Vector 3", "Color RGBA"]) {
    await page.goto("/");
    await createNode(page, name);
    const c = page.locator(".canvas");
    await c.locator("[data-direction=output]").click();
    await c.locator("[data-port=color]").click();
    const d = await doc(page),
      node = net(d).nodes.find(
        (n: any) => n.type.moduleId === "grape.nodes.fixed-values",
      ),
      v = node.state.value,
      expected =
        typeof v === "number"
          ? [v, v, v, v]
          : v.length === 2
            ? [...v, 0, 1]
            : v.length === 3
              ? [...v, 1]
              : v,
      code = await shader(page),
      result = await pixels(page, code);
    result.pixel.forEach((v, i) =>
      expect(
        Math.abs(v - Math.round(Math.max(0, Math.min(1, expected[i])) * 255)),
      ).toBeLessThanOrEqual(1),
    );
    fs.writeFileSync(
      path.join(
        process.env.GRAPE_EVIDENCE_DIR!,
        `sample-${node.type.typeId}.grape.json`,
      ),
      JSON.stringify(d, null, 2) + "\n",
    );
    rows.push({ name, expected, code, ...result });
  }
  save("oc01-conversions", rows);
});
test("OC03 cancelled catalog stale revision and readonly wired route leave no partial content", async ({
  page,
}) => {
  await createNode(page, "Color RGBA");
  const c = page.locator(".canvas"),
    out = c.locator("[data-direction=output]"),
    before = await doc(page),
    b = await blank(c);
  await drag(page, out, b);
  await expect(c.getByRole("dialog", { name: "Node catalog" })).toBeVisible();
  await page.keyboard.press("Escape");
  expect(await doc(page)).toEqual(before);
  await drag(page, out, b);
  await clickAction(page, "Undo");
  await expect(c.getByRole("dialog", { name: "Node catalog" })).toBeHidden();
  await clickAction(page, "Redo");
  expect(await doc(page)).toEqual(before);
  await clickAction(page, "Lock editing");
  await drag(page, out, b);
  await expect(c.getByRole("dialog", { name: "Node catalog" })).toBeHidden();
  expect(await doc(page)).toEqual(before);
  await clickAction(page, "Lock editing");
  save("oc03-cancel-stale-readonly", { before, after: await doc(page) });
});
