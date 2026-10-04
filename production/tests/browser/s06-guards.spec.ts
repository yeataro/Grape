import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createNode } from "./create-node.ts";
import { clickAction } from "../fixtures/public-actions.ts";
async function doc(page: Page) {
  const wait = page.waitForEvent("download");
  await clickAction(page, "Export JSON");
  return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8"));
}
test.beforeEach(async ({ page }) => {
  await page.goto("/");
});
test("S06 advertised view and edit shortcuts preserve gesture, draft and History boundaries", async ({
  page,
}) => {
  await createNode(page, "Multiply");
  const before = await doc(page),
    canvas = page.locator(".canvas"),
    heading = page.getByRole("heading", { name: "Multiply", exact: true });
  await heading.click();
  await page.keyboard.press("h");
  expect(await doc(page)).toEqual(before);
  await heading.click();
  await page.keyboard.press("f");
  expect(await doc(page)).toEqual(before);
  await heading.click();
  const r = (await heading.boundingBox())!;
  await page.mouse.move(r.x + 60, r.y + 14);
  await page.mouse.down();
  await page.mouse.move(r.x + 100, r.y + 30, { steps: 4 });
  const view = await canvas.locator(".viewport").getAttribute("style");
  await page.keyboard.press("h");
  await page.keyboard.press("?");
  await page.keyboard.press("Tab");
  expect(await canvas.locator(".viewport").getAttribute("style")).toBe(view);
  await expect(page.getByRole("dialog", { name: "Node catalog" })).toBeHidden();
  await expect(
    page.getByRole("dialog", { name: "Keyboard shortcuts" }),
  ).toBeHidden();
  await page.keyboard.press("Escape");
  await page.mouse.up();
  expect(await doc(page)).toEqual(before);
  await heading.click();
  await page.keyboard.press("Delete");
  expect(
    (await doc(page)).graph.stages.find((s: any) => s.key === "pixel").network
      .nodes,
  ).toHaveLength(1);
  await page.keyboard.press("Control+z");
  expect(await doc(page)).toEqual(before);
  await page.keyboard.press("Control+Shift+z");
  expect(
    (await doc(page)).graph.stages.find((s: any) => s.key === "pixel").network
      .nodes,
  ).toHaveLength(1);
});
test("S06 Canvas connection failure persists across movement and unrelated successful actions until matching recovery", async ({
  page,
}) => {
  await createNode(page, "Float");
  await createNode(page, "Multiply");
  const outputs = page.locator(".nodes [data-direction=output]");
  await outputs.nth(0).click();
  await outputs.nth(1).click();
  await expect(page.locator(".canvas-notice")).toContainText("PORT_DIRECTION");
  const before = await doc(page),
    r = (await page.locator(".canvas").boundingBox())!;
  await page.mouse.move(r.x + 450, r.y + 400, { steps: 5 });
  await clickAction(page, "Save");
  await expect(page.locator(".canvas-notice")).toContainText("PORT_DIRECTION");
  expect(await doc(page)).toEqual(before);
  await outputs.first().click();
  await page.locator(".nodes [data-direction=input]").first().click();
  await expect(page.locator(".canvas-notice")).not.toContainText(
    "PORT_DIRECTION",
  );
});
test("S06 category collapse survives query changes and whitespace uses the tree without a Graph edit", async ({
  page,
}) => {
  const before = await doc(page);
  await page.getByRole("button", { name: "Browse nodes", exact: true }).click();
  const catalog = page.getByRole("dialog", { name: "Node catalog" }),
    search = catalog.getByLabel("Search nodes", { exact: true }),
    group = catalog.locator(".catalog-list details").first();
  const label = await group.locator(":scope > summary").textContent();
  await group.locator(":scope > summary").click();
  await expect(group).not.toHaveAttribute("open");
  await search.fill("Multiply");
  await expect(
    catalog.getByRole("button", { name: "Inspect Multiply", exact: true }),
  ).toBeVisible();
  await search.fill("   ");
  const restored = catalog.locator(".catalog-list details").first();
  await expect(restored.locator(":scope > summary")).toHaveText(label!);
  await expect(restored).not.toHaveAttribute("open");
  await page.keyboard.press("Escape");
  expect(await doc(page)).toEqual(before);
});
test("S06 Personal search and inspect are readonly, malformed import survives unrelated success, and insert restores one Undo", async ({
  page,
}) => {
  await createNode(page, "Float");
  await page.locator(".nodes [data-direction=output]").click();
  await page.locator(".nodes [data-direction=input]").click();
  await page.getByRole("button", { name: "New subgraph", exact: true }).click();
  await clickAction(page, "Personal Library");
  const dialog = page.locator("dialog[open]");
  await page
    .getByRole("button", { name: "Save selected subgraph", exact: true })
    .click();
  await expect(dialog.locator("[role=status]")).toContainText("Saved");
  const search = dialog.getByLabel("Search Personal Library");
  await search.fill("ＳＵＢＧＲＡＰＨ");
  await expect(
    dialog.getByRole("button", { name: "Inspect Subgraph", exact: true }),
  ).toBeVisible();
  await search.fill("missing");
  await expect(dialog.locator("[data-personal-file]:visible")).toHaveCount(0);
  await search.fill("Subgraph");
  await dialog
    .getByRole("button", { name: "Inspect Subgraph", exact: true })
    .click();
  await expect(dialog.locator("pre")).toContainText("input Value: glsl.vec4");
  await dialog.getByLabel("Import Personal package").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"bad":true}'),
  });
  await expect(page.locator("#message")).toContainText("PERSONAL_FORMAT");
  await dialog
    .getByRole("button", { name: "Refresh Personal", exact: true })
    .click();
  await expect(page.locator("#message")).toContainText("PERSONAL_FORMAT");
  await dialog
    .getByRole("button", { name: "Close Personal", exact: true })
    .click();
  const before = await doc(page);
  await clickAction(page, "Lock editing");
  await clickAction(page, "Personal Library");
  await expect(
    dialog.getByRole("button", { name: "Insert Subgraph", exact: true }),
  ).toBeDisabled();
  await dialog
    .getByRole("button", { name: "Inspect Subgraph", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Close Personal", exact: true })
    .click();
  expect(await doc(page)).toEqual(before);
  await clickAction(page, "Lock editing");
  await clickAction(page, "Personal Library");
  await dialog
    .getByRole("button", { name: "Insert Subgraph", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  const after = await doc(page);
  await clickAction(page, "Undo");
  expect(await doc(page)).toEqual(before);
  await clickAction(page, "Redo");
  expect(await doc(page)).toEqual(after);
  fs.writeFileSync(
    path.join(process.env.GRAPE_EVIDENCE_DIR!, "personal-search-history.json"),
    JSON.stringify({ before, after }, null, 2),
    { flag: "wx" },
  );
});
test("S06 pending touch menu cancels on blur and second touch, while a completed blank hold is view only", async ({
  browser,
}) => {
  const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 1440, height: 1000 },
    }),
    page = await context.newPage();
  try {
    await page.goto(process.env.GRAPE_BASE_URL ?? "http://127.0.0.1:4206");
    const before = await doc(page),
      r = (await page.locator(".canvas").boundingBox())!,
      cdp = await context.newCDPSession(page),
      first = { x: r.x + 450, y: r.y + 350, id: 0 },
      second = { x: r.x + 500, y: r.y + 400, id: 1 };
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [first],
    });
    await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    await page.waitForTimeout(650);
    await expect(page.getByRole("menu")).toBeHidden();
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [first],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [first, second],
    });
    await page.waitForTimeout(650);
    await expect(page.getByRole("menu")).toBeHidden();
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [first],
    });
    await expect(page.getByRole("menu")).toBeVisible();
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await page.keyboard.press("Escape");
    expect(await doc(page)).toEqual(before);
  } finally {
    await context.close();
  }
});
test("S06 native field context menu remains unprevented and touch hold never opens an object menu from a control", async ({
  page,
  browser,
}) => {
  await page.getByRole("button", { name: "New subgraph", exact: true }).click();
  await page
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  const name = page.getByLabel("Subgraph name", { exact: true });
  const prevented = await name.evaluate((el) => {
    const event = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });
    el.dispatchEvent(event);
    return event.defaultPrevented;
  });
  expect(prevented).toBe(false);
  await expect(page.getByRole("menu")).toBeHidden();
  const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 1440, height: 1000 },
    }),
    touch = await context.newPage();
  try {
    await touch.goto(process.env.GRAPE_BASE_URL ?? "http://127.0.0.1:4206");
    const b = (await touch
        .getByRole("button", { name: "Add Node", exact: true })
        .boundingBox())!,
      cdp = await context.newCDPSession(touch);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: b.x + b.width / 2, y: b.y + b.height / 2 }],
    });
    await touch.waitForTimeout(650);
    await expect(touch.getByRole("menu")).toBeHidden();
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
  } finally {
    await context.close();
  }
});
test("S06 Personal late insertion and refresh results cannot close or overwrite a reopened dialog", async ({
  page,
}) => {
  await page.evaluate(async () => {
    const { mountPersonal } = await import("/apps/web/personal.ts"),
      host = document.createElement("aside");
    host.id = "personal-lifetime-fixture";
    document.body.append(host);
    const scope = { contextId: "fixture", loadId: "fixture" },
      context = { capture: () => ({ scope }) },
      gates: any = { insert: null, list: null, reports: [] };
    (window as any).personalGates = gates;
    const items = [
      {
        name: "fixture.json",
        asset: {
          name: "Fixture",
          entry: "r",
          resources: [{ id: "r", data: { interface: [] } }],
          stageKindIds: ["grape.stage.pixel"],
        },
      },
    ];
    const app: any = {
      readonly: false,
      busy: false,
      subscribe: () => () => {},
      insertPersonal: () =>
        new Promise((resolve) => {
          gates.insert = resolve;
        }),
    };
    const library: any = {
      list: () =>
        gates.delayList
          ? new Promise((resolve) => {
              gates.list = resolve;
            })
          : Promise.resolve({ items, issues: [] }),
    };
    mountPersonal(
      host,
      app,
      () => context as any,
      library,
      (error, operation) =>
        gates.reports.push({ error: String(error), operation }),
    );
  });
  const host = page.locator("#personal-lifetime-fixture"),
    open = host.getByRole("button", { name: "Personal Library", exact: true }),
    dialog = host.locator("dialog");
  await open.click();
  await dialog
    .getByRole("button", { name: "Insert Fixture", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Close Personal", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await open.click();
  await expect(dialog).toBeVisible();
  await page.evaluate(() => (window as any).personalGates.insert());
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("[role=status]")).toHaveText("1 saved subgraphs");
  await page.evaluate(() => ((window as any).personalGates.delayList = true));
  await dialog
    .getByRole("button", { name: "Refresh Personal", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Close Personal", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await page.evaluate(() => ((window as any).personalGates.delayList = false));
  await open.click();
  await page.evaluate(() =>
    (window as any).personalGates.list({
      items: [],
      issues: [{ name: "old", code: "STALE_TEST" }],
    }),
  );
  await expect(dialog.locator("[role=status]")).toHaveText("1 saved subgraphs");
  await expect(
    dialog.getByRole("button", { name: "Insert Fixture", exact: true }),
  ).toBeVisible();
});
test("S06 competing touch cancels a primary node drag without a committed History entry", async ({
  browser,
}) => {
  const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 1440, height: 1000 },
    }),
    page = await context.newPage();
  try {
    await page.goto(process.env.GRAPE_BASE_URL ?? "http://127.0.0.1:4206");
    await createNode(page, "Multiply");
    const before = await doc(page),
      header = (await page
        .getByRole("heading", { name: "Multiply", exact: true })
        .boundingBox())!,
      canvas = (await page.locator(".canvas").boundingBox())!,
      cdp = await context.newCDPSession(page),
      a = { id: 0, x: header.x + 70, y: header.y + 16 },
      b = { id: 1, x: canvas.x + 700, y: canvas.y + 400 };
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [a],
    });
    a.x += 70;
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [a],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [a, b],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [a],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    expect(await doc(page)).toEqual(before);
    await clickAction(page, "Undo");
    expect(
      (await doc(page)).graph.stages.find((s: any) => s.key === "pixel").network
        .nodes,
    ).toHaveLength(1);
  } finally {
    await context.close();
  }
});
