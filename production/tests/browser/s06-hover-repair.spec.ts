import { test, expect, type Page, type Locator } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createNode } from "./create-node.ts";
import { clickAction } from "../fixtures/public-actions.ts";
const out = process.env.GRAPE_EVIDENCE_DIR!;
const save = (name: string, value: unknown) =>
  fs.writeFileSync(
    path.join(out, name + ".json"),
    JSON.stringify(value, null, 2),
  );
async function enable(p: Page) {
  await p
    .getByRole("button", { name: "Experimental features", exact: true })
    .click();
  await p
    .getByRole("checkbox", {
      name: "Show object information instead of normal hover hints",
    })
    .check();
  await p.keyboard.press("Escape");
}
async function exported(p: Page) {
  const wait = p.waitForEvent("download");
  await clickAction(p, "Export JSON");
  return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8"));
}
async function fixture(p: Page) {
  await p.goto("/");
  await createNode(p, "Color RGBA");
  const node = p.locator(".node").filter({
    has: p.getByRole("heading", { name: "Color RGBA", exact: true }),
  });
  await node.getByRole("heading").click();
  return node;
}
async function keyboardFocus(p: Page, target: Locator) {
  for (let i = 0; i < 160; i++) {
    if (await target.evaluate((e) => e === document.activeElement)) return;
    await p.keyboard.press("Shift+Tab");
  }
  throw Error("Target unreachable by trusted Tab");
}
for (const width of [1440, 1920])
  for (const kind of ["Node", "Port", "Parameter Widget"]) {
    test(`S06 repair continuous 80-step ${kind} details ${width}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      const node = await fixture(page),
        before = await exported(page);
      await enable(page);
      const target =
        kind === "Node"
          ? node.getByRole("heading")
          : kind === "Port"
            ? node.locator("[data-port]").first()
            : page.getByRole("textbox", { name: "R", exact: true });
      await target.hover();
      await expect(page.locator(".hover-summary")).toContainText(kind);
      const read = page.getByRole("button", {
          name: "Read object details",
          exact: true,
        }),
        to = (await read.boundingBox())!;
      await page.evaluate(() => {
        (window as any).__travel = [];
        for (const type of [
          "pointerover",
          "pointermove",
          "pointerdown",
          "pointerup",
          "click",
        ])
          document.addEventListener(
            type,
            (e) => {
              const p = e as PointerEvent;
              (window as any).__travel.push({
                type,
                trusted: e.isTrusted,
                x: p.clientX,
                y: p.clientY,
                target: (e.target as Element).tagName,
              });
            },
            true,
          );
      });
      await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, {
        steps: 80,
      });
      await page.mouse.down();
      await page.mouse.up();
      const dialog = page.getByRole("dialog", {
        name: "Object information",
        exact: true,
      });
      await expect(dialog).toBeVisible();
      const text = await dialog.getByRole("region").innerText();
      expect(text.startsWith(kind + ":")).toBeTruthy();
      await page.screenshot({
        path: path.join(
          out,
          `continuous-${width}-${kind.replaceAll(" ", "-")}.png`,
        ),
      });
      save(`continuous-${width}-${kind.replaceAll(" ", "-")}`, {
        text,
        events: await page.evaluate(() => (window as any).__travel),
      });
      await page.keyboard.press("Escape");
      await expect(read).toBeFocused();
      expect(await exported(page)).toEqual(before);
    });
  }
for (const focusKind of ["control", "node", "port"])
  for (const hoverKind of ["node", "panel", "control"]) {
    test(`S06 repair F2 focused ${focusKind} versus hovered ${hoverKind}`, async ({
      page,
    }) => {
      const node = await fixture(page);
      await enable(page);
      const focus =
        focusKind === "control"
          ? page.getByRole("button", { name: "Generate GLSL", exact: true })
          : focusKind === "node"
            ? node
            : node.locator("[data-port]").first();
      await keyboardFocus(page, focus);
      const identity =
        (await focus.getAttribute("data-node")) ??
        (await focus.getAttribute("data-node-id"));
      const other =
        hoverKind === "node"
          ? page.getByRole("heading", { name: "Image output", exact: true })
          : hoverKind === "panel"
            ? page.locator(".inspector h2")
            : page.getByRole("button", { name: "Save", exact: true });
      await other.hover();
      await expect(focus).toBeFocused();
      await page.keyboard.press("F2");
      const dialog = page.getByRole("dialog", {
        name: "Object information",
        exact: true,
      });
      await expect(dialog).toBeVisible();
      const text = await dialog.getByRole("region").innerText();
      expect(text).toContain(
        focusKind === "control"
          ? "UI control: Generate GLSL"
          : focusKind === "node"
            ? "Node: Color RGBA"
            : "Port:",
      );
      if (identity) expect(text).toContain(identity);
      await page.keyboard.press("Escape");
      await expect(focus).toBeFocused();
      save(`f2-${focusKind}-${hoverKind}`, {
        identity,
        text,
        method:
          "Trusted Tab to live focus, incidental hover, trusted F2/Escape",
      });
    });
  }
test("S06 repair compact disclosures share presentation without model changes", async ({
  page,
}) => {
  await page.goto("/");
  const before = await exported(page);
  await expect(page.locator("#code")).not.toBeVisible();
  for (const name of [
    "Project actions",
    "Shader output",
    "Hints",
    "Experimental features",
  ]) {
    const button = page.getByRole("button", { name, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute("aria-expanded", "false");
  }
  await page
    .getByRole("button", { name: "Generate GLSL", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Shader output", exact: true })
    .click();
  await expect(
    page.getByRole("list", { name: "Diagnostics", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Locate node", exact: true }).first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Close shader output", exact: true })
    .click();
  expect(await exported(page)).toEqual(before);
});
test("S06 grouped project actions preserve nested Personal and saved-dialog focus", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Project actions",
    exact: true,
  });
  await trigger.click();
  const menu = page.getByRole("menu", { name: "Project actions", exact: true });
  await expect(menu).toBeVisible();
  await page.keyboard.press("End");
  expect(await menu.evaluate((e) => e.contains(document.activeElement))).toBe(
    true,
  );
  await page.keyboard.press("Home");
  await expect(menu.getByRole("menuitem").first()).toBeFocused();
  const personal = page.getByRole("menuitem", {
    name: "Personal Library",
    exact: true,
  });
  await personal.click();
  const dialog = page.getByRole("dialog").filter({
    has: page.getByRole("heading", { name: "Personal Library", exact: true }),
  });
  await dialog.getByRole("searchbox").fill("unavailable-entry");
  await dialog
    .getByRole("button", { name: "Close Personal", exact: true })
    .click();
  await expect(personal).toBeVisible();
  await expect(personal).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  const open = page.getByRole("menuitem", { name: "Open saved", exact: true });
  await open.click();
  await page.locator("#cancel-open").click();
  await expect(open).toBeVisible();
  await expect(open).toBeFocused();
  const lock = page.getByRole("menuitemcheckbox", {
    name: "Lock editing",
    exact: true,
  });
  await expect(lock).not.toBeChecked();
  await lock.click();
  await trigger.click();
  await expect(lock).toBeChecked();
  await lock.click();
  await trigger.click();
  await expect(lock).not.toBeChecked();
});

test("S06 output diagnostics locate current nodes and reject stale detached actions", async ({
  page,
}) => {
  await page.goto("/");
  const before = await exported(page),
    c = page.locator(".canvas");
  await clickAction(page, "Generate GLSL");
  await page
    .getByRole("button", { name: "Read full application status" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Application status details" }),
  ).toContainText("INPUT_REQUIRED");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Shader output", exact: true })
    .click();
  const locate = page
    .locator("#code")
    .getByRole("button", { name: "Locate node", exact: true })
    .first();
  await expect(locate).toBeVisible();
  await locate.click();
  await expect(c).not.toHaveAttribute("data-selection", "");
  await locate.evaluate((e) => ((window as any).__oldLocate = e));
  await page.keyboard.press("Escape");
  const b = (await c.boundingBox())!;
  await page.mouse.click(b.x + 20, b.y + 180);
  await expect(c).toHaveAttribute("data-selection", "");
  const stale = await page.evaluate(() => {
    const old = (window as any).__oldLocate;
    old.click();
    return {
      connected: old.isConnected,
      selection: document
        .querySelector(".canvas")!
        .getAttribute("data-selection"),
    };
  });
  expect(stale).toEqual({ connected: false, selection: "" });
  await page.getByRole("button", { name: "Vertex", exact: true }).click();
  await page
    .getByRole("button", { name: "Shader output", exact: true })
    .click();
  await expect(
    page
      .locator("#code")
      .getByRole("button", { name: "Locate node", exact: true }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  expect(await exported(page)).toEqual(before);
  save("current-diagnostic-locate", {
    stale,
    method:
      "Trusted current Locate plus explicitly synthetic detached old-button callback; stage mismatch has no Locate. Export/History unchanged.",
  });
});
