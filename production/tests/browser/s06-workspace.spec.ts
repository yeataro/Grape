import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createNode } from "./create-node.ts";
const evidence = () => {
  const out = process.env.GRAPE_EVIDENCE_DIR!;
  if (!path.isAbsolute(out) || !out.includes("s06"))
    throw Error("S06_EVIDENCE_REQUIRED");
  return out;
};
async function documentOf(page: Page) {
  const wait = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8"));
}
test.beforeEach(async ({ page }) => {
  await page.goto("/");
});
test("S06 catalog literal normalized search, source/type filters, inspect and native text do not edit", async ({
  page,
}) => {
  const before = await documentOf(page);
  await page.getByRole("button", { name: "Browse nodes", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Node catalog" }),
    search = dialog.getByLabel("Search nodes", { exact: true });
  await search.fill("ＭＵＬＴＩＰＬＹ");
  await expect(
    dialog.getByRole("button", { name: "Inspect Multiply", exact: true }),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "Inspect Multiply", exact: true })
    .click();
  await expect(dialog.locator(".catalog-detail")).toContainText(
    "input a: glsl.float",
  );
  await search.fill("[.*");
  await expect(dialog).toContainText("No matching nodes");
  await search.fill("");
  await dialog
    .getByLabel("Node source", { exact: true })
    .selectOption("grape.nodes.fixed-values");
  await expect(
    dialog.getByRole("button", { name: "Inspect Float", exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Inspect Multiply", exact: true }),
  ).toHaveCount(0);
  await dialog
    .getByLabel("Node port type", { exact: true })
    .selectOption("glsl.vec3");
  await expect(
    dialog.getByRole("button", { name: "Inspect Vector 3", exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Inspect Float", exact: true }),
  ).toHaveCount(0);
  await search.fill("typed");
  await search.press("Control+z");
  await page.keyboard.press("Escape");
  expect(await documentOf(page)).toEqual(before);
  await page.screenshot({
    path: path.join(evidence(), "s06-catalog-inspection.png"),
  });
});
test("S06 blank double-click and Tab create previews; movement is independent, cancel and stage change add no History", async ({
  page,
}) => {
  const canvas = page.locator(".canvas"),
    rect = (await canvas.boundingBox())!,
    before = await documentOf(page);
  await page.mouse.dblclick(rect.x + 260, rect.y + 250);
  const dialog = page.getByRole("dialog", { name: "Node catalog" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Search nodes", { exact: true }).fill("Multiply");
  const title = dialog.locator("header"),
    box = (await title.boundingBox())!,
    position = await dialog.evaluate((e) => [e.style.left, e.style.top]);
  await page.mouse.move(box.x + 55, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + 120, box.y + 55, { steps: 5 });
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(dialog).toBeHidden();
  expect(await documentOf(page)).toEqual(before);
  await page.mouse.click(rect.x + 240, rect.y + 240);
  await page.keyboard.press("Tab");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Search nodes", { exact: true }).fill("Multiply");
  await page.keyboard.press("Enter");
  await expect(page.locator(".creation-preview")).toBeVisible();
  await expect(canvas.locator(".nodes .node")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator(".creation-preview")).toBeHidden();
  await page.getByRole("button", { name: "Add Node", exact: true }).click();
  await page.getByRole("button", { name: "Vertex", exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(await documentOf(page)).toEqual(before);
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
  expect(position.length).toBe(2);
});
test("S06 wired creation is preview-only until snap placement and one Undo restores occupied input", async ({
  page,
}) => {
  await createNode(page, "Float (fixed)");
  const output = page.getByRole("button", {
      name: "Float output Value",
      exact: true,
    }),
    input = page.getByRole("button", {
      name: "Image Output input Color",
      exact: true,
    });
  // Locate semantic ports independently of current localized labels.
  const source = page
    .locator(".nodes .node")
    .filter({ has: page.getByRole("heading", { name: "Float", exact: true }) })
    .locator("[data-direction=output]");
  const destination = page
    .locator(".nodes [data-direction=input]")
    .filter({ hasText: "color" })
    .first();
  await source.click();
  await destination.click();
  const before = await documentOf(page),
    canvas = page.locator(".canvas"),
    r = (await canvas.boundingBox())!,
    start = (await destination.boundingBox())!;
  await page.mouse.move(start.x + 3, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(r.x + 350, r.y + 320, { steps: 6 });
  await page.mouse.up();
  const catalog = page.getByRole("dialog", { name: "Node catalog" });
  await expect(catalog).toBeVisible();
  await catalog.getByLabel("Search nodes", { exact: true }).fill("Color RGBA");
  await page.keyboard.press("Enter");
  await expect(page.locator(".creation-wire")).toBeVisible();
  expect(await canvas.locator(".nodes .node").count()).toBe(2);
  await page.mouse.move(r.x + 355, r.y + 315);
  await page.mouse.click(r.x + 355, r.y + 315);
  const after = await documentOf(page),
    network = after.graph.stages.find((s: any) => s.key === "pixel").network;
  expect(network.nodes.length).toBe(3);
  expect(network.edges.length).toBe(1);
  const added = network.nodes.find((n: any) => n.name === "Color RGBA");
  expect(added.position.every((n: number) => n % 24 === 0)).toBe(true);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await documentOf(page)).toEqual(before);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  expect(await documentOf(page)).toEqual(after);
  await page
    .getByRole("button", { name: "Generate GLSL", exact: true })
    .click();
  await expect(page.getByLabel("Generated GLSL")).toContainText("vec4");
  await page.screenshot({
    path: path.join(evidence(), "s06-wired-placement.png"),
  });
});
test("S06 help and context menu keyboard, readonly browsing and responsive original actions", async ({
  page,
}) => {
  await createNode(page, "Multiply");
  const before = await documentOf(page);
  await page.getByRole("button", { name: "Shortcuts", exact: true }).click();
  const help = page.getByRole("dialog", { name: "Keyboard shortcuts" });
  await expect(help).toBeVisible();
  await page.keyboard.press("Delete");
  await page.keyboard.press("Control+z");
  await expect(help).toBeVisible();
  await page.keyboard.press("Escape");
  expect(await documentOf(page)).toEqual(before);
  await page
    .locator(".node h3")
    .filter({ hasText: /^Multiply$/ })
    .click();
  await page.keyboard.press("Shift+F10");
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await page.keyboard.press("End");
  await expect(
    page.getByRole("menuitem", { name: "Keyboard shortcuts" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await page.getByRole("button", { name: "Lock editing", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Add Node", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Browse nodes", exact: true }).click();
  const catalog = page.getByRole("dialog", { name: "Node catalog" });
  await catalog.getByLabel("Search nodes", { exact: true }).fill("Multiply");
  await expect(
    catalog.getByRole("button", { name: "Add Multiply", exact: true }),
  ).toBeDisabled();
  await catalog
    .getByRole("button", { name: "Inspect Multiply", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 620, height: 850 });
  await page.getByText("More actions", { exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Save", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Vertex", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: path.join(evidence(), "s06-responsive.png") });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(
    page.getByRole("button", { name: "Save", exact: true }),
  ).toBeVisible();
  expect(await documentOf(page)).toEqual(before);
});
test("S06 compile error survives unrelated successful Save and clears on matching successful Generate", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Generate GLSL", exact: true })
    .click();
  await expect(page.locator("#message")).toContainText("INPUT_REQUIRED");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#message")).toContainText("INPUT_REQUIRED");
  await createNode(page, "Color RGBA");
  await page.locator(".nodes [data-direction=output]").click();
  await page.locator(".nodes [data-direction=input]").click();
  await page
    .getByRole("button", { name: "Generate GLSL", exact: true })
    .click();
  await expect(page.locator("#message")).toHaveText("");
});
