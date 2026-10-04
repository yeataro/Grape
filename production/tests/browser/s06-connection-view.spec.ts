import { test, expect, type Page, type Locator } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createNode } from "./create-node.ts";
import { clickAction } from "../fixtures/public-actions.ts";
const output = (name: string, data: unknown) =>
  fs.writeFileSync(
    path.join(process.env.GRAPE_EVIDENCE_DIR!, name + ".json"),
    JSON.stringify(data, null, 2) + "\n",
  );
async function doc(page: Page) {
  const wait = page.waitForEvent("download");
  await clickAction(page, "Export JSON");
  return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8"));
}
async function center(l: Locator) {
  const r = (await l.boundingBox())!;
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
}
async function color(page: Page) {
  await createNode(page, "Color RGBA");
  const c = page.locator(".canvas").last();
  await c.getByRole("heading", { name: "Color RGBA", exact: true }).click();
  await page.keyboard.press("h");
  return {
    c,
    out: c.locator('[data-direction="output"][data-port="out"]'),
    input: c.locator('[data-direction="input"][data-port="color"]'),
  };
}
async function geometry(c: Locator) {
  return c.evaluate((el) => {
    const rect = (e: Element) => {
      const r = e.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    const n = el.querySelector<HTMLElement>(".canvas-notice")!;
    return {
      canvas: rect(el),
      notice: {
        ...rect(n),
        text: n.textContent,
        pointerEvents: getComputedStyle(n).pointerEvents,
      },
      nodes: [...el.querySelectorAll(".node")].map((e) => ({
        name: e.querySelector("h3")!.textContent,
        ...rect(e),
      })),
      sockets: [...el.querySelectorAll(".socket")].map(rect),
      wires: [...el.querySelectorAll(".wires path")].map((e) => ({
        d: e.getAttribute("d"),
        ...rect(e),
      })),
    };
  });
}
test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

for (const width of [1280, 1440, 620])
  test(`S06 connection notice compact geometry ${width} and successful inverse routes one Undo`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 1280 ? 720 : 1000 });
    const { c, out, input } = await color(page),
      before = await doc(page);
    await out.click();
    const g = await geometry(c);
    output(`notice-${width}`, g);
    await page.screenshot({
      path: path.join(process.env.GRAPE_EVIDENCE_DIR!, `notice-${width}.png`),
    });
    expect(g.notice.height).toBeLessThan(65);
    expect(g.notice.pointerEvents).toBe("none");
    for (const n of g.nodes)
      expect(
        n.x + n.width / 2 >= g.notice.x &&
          n.x + n.width / 2 <= g.notice.x + g.notice.width &&
          n.y + n.height / 2 >= g.notice.y &&
          n.y + n.height / 2 <= g.notice.y + g.notice.height,
      ).toBe(false);
    await input.click();
    await expect(c.locator(".canvas-notice")).toBeEmpty();
    const after = await doc(page);
    expect(
      after.graph.stages.find((s: any) => s.key === "pixel").network.edges,
    ).toHaveLength(1);
    await clickAction(page, "Undo");
    expect(await doc(page)).toEqual(before);
    await clickAction(page, "Redo");
    expect(await doc(page)).toEqual(after);
    await clickAction(page, "Undo");
    await input.click();
    await out.click();
    await expect(c.locator(".canvas-notice")).toBeEmpty();
    expect(
      (await doc(page)).graph.stages.find((s: any) => s.key === "pixel").network
        .edges,
    ).toHaveLength(1);
  });

for (const zoom of [1, 1.2])
  test(`S06 selection geometry remains fixed at zoom ${zoom}`, async ({
    page,
  }) => {
    const { c, out, input } = await color(page);
    await out.click();
    await input.click();
    await c.hover({ position: { x: 330, y: 150 } });
    await page.mouse.wheel(
      0,
      -Math.log(zoom / Number(await c.getAttribute("data-zoom"))) * 1000,
    );
    const r = (await c.boundingBox())!;
    await page.mouse.click(r.x + 20, r.y + 150);
    await expect(c).toHaveAttribute("data-selection", "");
    const before = await doc(page),
      unselected = await geometry(c);
    await c.getByRole("heading", { name: "Color RGBA", exact: true }).click();
    const selected = await geometry(c);
    await expect(c).not.toHaveAttribute("data-selection", "");
    await page.screenshot({
      path: path.join(process.env.GRAPE_EVIDENCE_DIR!, `selection-${zoom}.png`),
    });
    await page.mouse.click(r.x + 20, r.y + 150);
    const restored = await geometry(c);
    output(`selection-${zoom}`, { unselected, selected, restored });
    expect(selected.nodes).toEqual(unselected.nodes);
    expect(selected.sockets).toEqual(unselected.sockets);
    expect(selected.wires).toEqual(unselected.wires);
    expect(restored.nodes).toEqual(unselected.nodes);
    expect(await doc(page)).toEqual(before);
  });

test("S06 PORT_TARGET and same-direction refusal remain visible until matching recovery; compiler error stays", async ({
  page,
}) => {
  const { c, out, input } = await color(page);
  await clickAction(page, "Generate GLSL");
  await expect(page.locator("#message")).toContainText("INPUT_REQUIRED");
  const before = await doc(page);
  const a = await center(out),
    b = await center(
      c.getByRole("heading", { name: "Image output", exact: true }),
    );
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 8 });
  await page.mouse.up();
  await expect(c.locator(".canvas-notice")).toContainText("PORT_TARGET");
  output("port-target", await geometry(c));
  expect(await doc(page)).toEqual(before);
  await clickAction(page, "Save");
  await expect(c.locator(".canvas-notice")).toContainText("PORT_TARGET");
  await out.click();
  await page.keyboard.press("Escape");
  await expect(c.locator(".canvas-notice")).toContainText("PORT_TARGET");
  await out.click();
  await input.click();
  await expect(c.locator(".canvas-notice")).toBeEmpty();
  await expect(page.locator("#message")).toContainText("INPUT_REQUIRED");
  await clickAction(page, "Undo");
  expect(await doc(page)).toEqual(before);
  await out.click();
  await out.click();
  await expect(c.locator(".canvas-notice")).toContainText("PORT_DIRECTION");
  await out.click();
  await input.click();
  await expect(c.locator(".canvas-notice")).toBeEmpty();
});

for (const direction of ["output", "input"] as const)
  test(`S06 temporary ${direction} wire follows pointer and zoom without touching real edges`, async ({
    page,
  }) => {
    const { c, out, input } = await color(page);
    await out.click();
    await input.click();
    const before = await doc(page),
      real = await c.locator(".wires").innerHTML();
    const r = (await c.boundingBox())!;
    await page.mouse.move(r.x + 330, r.y + 150);
    await page.mouse.down();
    await page.mouse.move(r.x + 360, r.y + 180, { steps: 4 });
    await page.mouse.up();
    const start = direction === "output" ? out : input;
    await start.click();
    await page.mouse.move(r.x + 450, r.y + 190, { steps: 6 });
    const capture = async () =>
      c.evaluate((el, dir) => {
        const svg = el.querySelector(".connection-preview")!,
          p = svg.querySelector("path")!,
          ring = svg.querySelector("circle")!,
          socket = el.querySelector(`[data-direction="${dir}"] .socket`)!,
          s = socket.getBoundingClientRect(),
          r = el.getBoundingClientRect();
        return {
          d: p.getAttribute("d"),
          stroke: getComputedStyle(p).stroke,
          dash: getComputedStyle(p).strokeDasharray,
          pointerEvents: getComputedStyle(svg).pointerEvents,
          origin: [
            Number(ring.getAttribute("cx")),
            Number(ring.getAttribute("cy")),
          ],
          socket: [s.left + s.width / 2 - r.left, s.top + s.height / 2 - r.top],
          realEdges: el.querySelectorAll(".wires path").length,
        };
      }, direction);
    const first = await capture();
    expect(first.d).toContain("C");
    expect(first.dash).not.toBe("none");
    expect(first.pointerEvents).toBe("none");
    expect(first.realEdges).toBe(1);
    expect(first.origin).toEqual(first.socket);
    await page.mouse.wheel(0, -120);
    const zoomed = await capture();
    expect(zoomed.origin).toEqual(zoomed.socket);
    expect(zoomed.origin).not.toEqual(first.origin);
    output(`wire-${direction}`, { first, zoomed });
    await page.screenshot({
      path: path.join(process.env.GRAPE_EVIDENCE_DIR!, `wire-${direction}.png`),
    });
    await page.keyboard.press("Escape");
    await expect(c.locator(".connection-preview path")).toHaveCount(0);
    await expect(c.locator(".canvas-notice")).toBeEmpty();
    expect(await doc(page)).toEqual(before);
    expect(await c.locator(".wires path").count()).toBe(1);
    expect(real).toContain("data-edge");
  });

test("S06 connection cancellation stale scope readonly and two Canvas status stay independent", async ({
  page,
}) => {
  const { c, out, input } = await color(page),
    before = await doc(page);
  for (const reason of ["escape", "blur", "pointercancel", "help", "catalog"]) {
    await out.click();
    await page.mouse.move(
      (await center(out)).x + 50,
      (await center(out)).y - 50,
    );
    if (reason === "escape") await page.keyboard.press("Escape");
    if (reason === "blur")
      await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    if (reason === "pointercancel")
      await c.dispatchEvent("pointercancel", { pointerId: 1, isPrimary: true });
    if (reason === "help") {
      await c.getByRole("button", { name: "Shortcuts", exact: true }).click();
      await page.keyboard.press("Escape");
    }
    if (reason === "catalog") {
      await c.getByRole("button", { name: "Add Node", exact: true }).click();
      await page.keyboard.press("Escape");
    }
    await expect(c.locator(".connection-preview path")).toHaveCount(0);
    await expect(c.locator(".canvas-notice")).toBeEmpty();
    expect(await doc(page)).toEqual(before);
  }
  await out.click();
  await c.getByRole("button", { name: "Vertex", exact: true }).click();
  await expect(c.locator(".connection-preview path")).toHaveCount(0);
  await expect(c.locator(".canvas-notice")).toBeEmpty();
  await c.getByRole("button", { name: "Pixel", exact: true }).click();
  await clickAction(page, "Lock editing");
  await out.click();
  await input.click();
  await expect(c.locator(".connection-preview path")).toHaveCount(0);
  expect(await doc(page)).toEqual(before);
  await clickAction(page, "Lock editing");
  await clickAction(page, "Second Canvas");
  const first = page.locator(".canvas").first(),
    second = page.locator(".canvas").last();
  const firstOut = first.locator('[data-direction="output"][data-port="out"]');
  await firstOut.click();
  await expect(first.locator(".canvas-notice")).toContainText("opposite port");
  await expect(second.locator(".canvas-notice")).toBeEmpty();
  await second
    .getByRole("heading", { name: "Color RGBA", exact: true })
    .click();
  await firstOut.click();
  await page.keyboard.press("Escape");
  await expect(first.locator(".canvas-notice")).not.toContainText(
    "opposite port",
  );
  expect(await doc(page)).toEqual(before);
});

test("S06 catalog pointer hover follows row while keyboard selection and Browse inspect remain view only", async ({
  page,
}) => {
  const before = await doc(page);
  await page.getByRole("button", { name: "Browse nodes", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Node catalog" }),
    search = dialog.getByLabel("Search nodes", { exact: true });
  await search.fill("Vector");
  const rows = dialog.locator(".catalog-row");
  expect(await rows.count()).toBeGreaterThan(1);
  await rows.nth(1).hover();
  await expect(rows.nth(1)).toHaveClass(/current/);
  const hovered = await rows.nth(1).getAttribute("data-key");
  await search.press("ArrowDown");
  expect(
    await dialog.locator(".catalog-row.current").getAttribute("data-key"),
  ).not.toBe(hovered);
  await rows.nth(0).hover();
  await expect(rows.nth(0)).toHaveClass(/current/);
  await rows.nth(0).getByRole("button").first().click();
  await expect(dialog.locator(".catalog-detail")).toBeVisible();
  await page.screenshot({
    path: path.join(process.env.GRAPE_EVIDENCE_DIR!, "catalog-hover.png"),
  });
  await page.keyboard.press("Escape");
  expect(await doc(page)).toEqual(before);
});

test("S06 public port drag both directions commits once and cancelled held release adds no History", async ({
  page,
}) => {
  const { c, out, input } = await color(page),
    before = await doc(page);
  for (const [from, to] of [
    [out, input],
    [input, out],
  ]) {
    const a = await center(from),
      b = await center(to);
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    await page.mouse.move(b.x, b.y, { steps: 9 });
    await expect(c.locator(".connection-preview path")).toHaveCount(1);
    await page.mouse.up();
    await expect(c.locator(".connection-preview path")).toHaveCount(0);
    await expect(c.locator(".canvas-notice")).toBeEmpty();
    const after = await doc(page);
    expect(
      after.graph.stages.find((s: any) => s.key === "pixel").network.edges,
    ).toHaveLength(1);
    await clickAction(page, "Undo");
    expect(await doc(page)).toEqual(before);
    await clickAction(page, "Redo");
    expect(await doc(page)).toEqual(after);
    await clickAction(page, "Undo");
  }
  const a = await center(out),
    b = await center(input);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 7 });
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(c.locator(".connection-preview path")).toHaveCount(0);
  expect(await doc(page)).toEqual(before);
  await out.click();
  await input.click();
  expect(
    (await doc(page)).graph.stages.find((s: any) => s.key === "pixel").network
      .edges,
  ).toHaveLength(1);
});

test("S06 pending connection expires on shared revision and new load without stale endpoint reuse", async ({
  page,
}) => {
  const { c, out, input } = await color(page);
  await clickAction(page, "Second Canvas");
  const first = page.locator(".canvas").first(),
    second = page.locator(".canvas").last(),
    firstOut = first.locator('[data-direction="output"][data-port="out"]');
  await firstOut.click();
  await second
    .getByRole("heading", { name: "Color RGBA", exact: true })
    .click();
  const field = page.getByRole("textbox", { name: "R", exact: true });
  await field.fill("0.4");
  await field.press("Enter");
  await expect(first.locator(".connection-preview path")).toHaveCount(0);
  await expect(first.locator(".canvas-notice")).toBeEmpty();
  const changed = await doc(page);
  await first.locator('[data-direction="input"][data-port="color"]').click();
  expect(await doc(page)).toEqual(changed);
  await page.keyboard.press("Escape");
  await firstOut.click();
  const old = await first.elementHandle();
  page.once("dialog", (d) => d.accept());
  await clickAction(page, "New document");
  expect(await old!.evaluate((e) => e.isConnected)).toBe(false);
  await expect(page.locator(".connection-preview path")).toHaveCount(0);
  await expect(page.locator(".canvas-notice")).toBeEmpty();
});

test("S06 subthreshold port release outside the button leaves no orphan wire or History", async ({ page }) => {
  const { c, out } = await color(page), before = await doc(page);
  const r = (await out.boundingBox())!;
  const x = r.x + r.width / 2, y = r.y + 0.5;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y - 3, { steps: 2 });
  await expect(c.locator(".connection-preview path")).toHaveCount(1);
  await page.mouse.up();
  await expect(c.locator(".connection-preview path")).toHaveCount(0);
  await expect(c.locator(".canvas-notice")).toBeEmpty();
  expect(await doc(page)).toEqual(before);
  await clickAction(page, "Undo");
  await expect(c.getByRole("heading", { name: "Color RGBA", exact: true })).toHaveCount(0);
});
