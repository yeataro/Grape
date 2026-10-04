import { test, expect, type Page, type Locator } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createNode } from "./create-node.ts";
import { clickAction } from "../fixtures/public-actions.ts";
const out = process.env.GRAPE_EVIDENCE_DIR!;
const save = (n: string, v: unknown) =>
  fs.writeFileSync(path.join(out, n + ".json"), JSON.stringify(v, null, 2));
async function doc(p: Page) {
  const w = p.waitForEvent("download");
  await clickAction(p, "Export JSON");
  return JSON.parse(fs.readFileSync((await (await w).path())!, "utf8"));
}
async function center(l: Locator) {
  const b = (await l.boundingBox())!;
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}
async function geometry(c: Locator) {
  return c.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return [
      ...el.querySelectorAll(
        ".node,.node h3,.port-label,.port-row small,.socket,.node-value",
      ),
    ].map((e) => {
      const b = e.getBoundingClientRect();
      return {
        tag: e.tagName,
        box: [b.x - r.x, b.y - r.y, b.width, b.height].map(
          (x) => Math.round(x * 100) / 100,
        ),
      };
    });
  });
}
for (const zoom of [0.65, 1, 1.25])
  test(`S06 circle-only type-colored socket states preserve geometry at ${zoom}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1100 });
    await page.goto("/");
    for (const name of [
      "Float (fixed)",
      "Vector 2",
      "Vector 3",
      "Color RGBA",
      "Multiply",
    ])
      await createNode(page, name);
    const c = page.locator(".canvas").first();
    await c.hover({ position: { x: 30, y: 90 } });
    await page.mouse.wheel(
      0,
      -Math.log(zoom / Number(await c.getAttribute("data-zoom"))) * 1000,
    );
    // Deliberately center the complete fixture before measuring state-only geometry.
    const offset = await c.evaluate((el) => {
      const r = el.getBoundingClientRect(),
        ns = [...el.querySelectorAll(".node")].map((n) =>
          n.getBoundingClientRect(),
        );
      return {
        x: 40 - Math.min(...ns.map((n) => n.left - r.left)),
        y: 90 - Math.min(...ns.map((n) => n.top - r.top)),
        left: r.left,
        top: r.top,
      };
    });
    await page.mouse.move(offset.left + 10, offset.top + 70);
    await page.mouse.down();
    await page.mouse.move(
      offset.left + 10 + offset.x,
      offset.top + 70 + offset.y,
      { steps: 8 },
    );
    await page.mouse.up();
    const before = await doc(page),
      records = [];
    for (const n of await c.locator(".node").all()) {
      const port = n.locator("[data-port]").first(),
        socket = port.locator(".socket");
      const idle = await geometry(c);
      await port.hover();
      const style = await socket.evaluate((e) => {
        const s = getComputedStyle(e);
        return {
          fill: s.backgroundColor,
          border: s.borderColor,
          shadow: s.boxShadow,
        };
      });
      expect(style.fill).toBe(style.border);
      expect(await geometry(c)).toEqual(idle);
      const point = await center(port);
      await page.mouse.down();
      expect(await geometry(c)).toEqual(idle);
      await page.mouse.up();
      await page.keyboard.press("Escape");
      const label = n.locator(".port-label").first();
      expect(await port.evaluate((e) => e.textContent)).toBe("");
      await label.click();
      await expect(c.locator(".connection-preview path")).toHaveCount(0);
      expect(await geometry(c)).toEqual(idle);
      records.push({ name: await n.getAttribute("aria-label"), style, point });
    }
    const start = c.getByRole("button", {
        name: "Color RGBA output out",
        exact: true,
      }),
      end = c.getByRole("button", {
        name: "Image output input color",
        exact: true,
      });
    // Keyboard focus is reached naturally; Tab on Canvas is the catalog shortcut.
    for (
      let i = 0;
      i < 100 && !(await start.evaluate((e) => e === document.activeElement));
      i++
    )
      await page.keyboard.press("Shift+Tab");
    await expect(start).toBeFocused();
    const focused = await geometry(c);
    await page.keyboard.press("Enter");
    await expect(start).toHaveClass(/wire-origin/);
    expect(await geometry(c)).toEqual(focused);
    await page.keyboard.press("Escape");
    await end.hover();
    const hoverShadow = await end
      .locator(".socket")
      .evaluate((e) => getComputedStyle(e).boxShadow);
    await start.click();
    await end.hover();
    await expect(end).toHaveClass(/wire-target/);
    const targetStyle = await end.locator(".socket").evaluate((e) => ({
      fill: getComputedStyle(e).backgroundColor,
      border: getComputedStyle(e).borderColor,
      shadow: getComputedStyle(e).boxShadow,
    }));
    expect(targetStyle.fill).toBe(targetStyle.border);
    expect(targetStyle.shadow).not.toBe(hoverShadow);
    const wrong = c.getByRole("button", {
      name: "Vector 2 output out",
      exact: true,
    });
    await wrong.hover();
    await expect(wrong).not.toHaveClass(/wire-target/);
    await page.keyboard.press("Escape");
    expect(await doc(page)).toEqual(before);
    await start.click();
    await end.click();
    await expect(c.locator(".wires path")).toHaveCount(1);
    const wired = await geometry(c),
      wire = await c.locator(".wires").innerHTML();
    await c.getByRole("heading", { name: "Color RGBA", exact: true }).click();
    expect(await geometry(c)).toEqual(wired);
    expect(await c.locator(".wires").innerHTML()).toBe(wire);
    await page.screenshot({ path: path.join(out, `socket-${zoom}.png`) });
    await clickAction(page, "Undo");
    expect(await doc(page)).toEqual(before);
    await clickAction(page, "Redo");
    await expect(c.locator(".wires path")).toHaveCount(1);
    save(`socket-${zoom}`, {
      records,
      targetStyle,
      geometry: wired,
      wire,
      comparison:
        "Idle/hover/pressed/selection have identical relative content/socket bounds. Type-preserving fill and distinct target ring; negative sibling label and same-direction hit.",
    });
  });
for (const [width, height] of [
  [1920, 1000],
  [1440, 1000],
  [620, 800],
  [620, 380],
])
  test(`S06 compact bottom actions and complete output are reachable ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: width!, height: height! });
    await page.goto("/");
    await expect(page.locator("#code")).not.toBeVisible();
    const before = await doc(page),
      records = [];
    for (const name of ["Project actions", "Shader output", "Hints"]) {
      const trigger = page.getByRole("button", { name, exact: true });
      await trigger.click();
      const popup = page.locator(".floating-surface[open]").last();
      await expect(popup).toBeVisible();
      const b = (await popup.boundingBox())!,
        t = (await trigger.boundingBox())!;
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.x + b.width).toBeLessThanOrEqual(width!);
      expect(b.y + b.height).toBeLessThanOrEqual(height!);
      if (name === "Project actions")
        expect(
          Math.abs(b.x - Math.max(8, Math.min(t.x, width! - b.width - 8))),
        ).toBeLessThan(1);
      await page.screenshot({
        path: path.join(
          out,
          `bottom-${width}-${height}-${name.replaceAll(" ", "-")}.png`,
        ),
      });
      await page.keyboard.press("Escape");
      await expect(trigger).toBeFocused();
      records.push({ name, b });
    }
    expect(await doc(page)).toEqual(before);
    save(`bottom-${width}-${height}`, records);
  });
