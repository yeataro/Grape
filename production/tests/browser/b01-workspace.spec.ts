import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createNode } from "./create-node.ts";
import { clickAction } from "../fixtures/public-actions.ts";
const evidence = process.env.GRAPE_EVIDENCE_DIR!;
const save = (name: string, value: unknown) =>
  fs.writeFileSync(
    path.join(evidence, name + ".json"),
    JSON.stringify(value, null, 2) + "\n",
  );
async function download(p: Page, action: string) {
  const pending = p.waitForEvent("download");
  await clickAction(p, action);
  return JSON.parse(fs.readFileSync((await (await pending).path())!, "utf8"));
}
async function options(p: Page, pane: string) {
  if (
    await p
      .getByRole("dialog", { name: "Panel options", exact: true })
      .isVisible()
  )
    await p.keyboard.press("Escape");
  await p
    .getByRole("button", { name: "Panel options in " + pane, exact: true })
    .click();
  return p.getByRole("dialog", { name: "Panel options", exact: true });
}
async function option(p: Page, pane: string, label: string) {
  const menu = await options(p, pane);
  await menu.getByRole("button", { name: label, exact: true }).click();
}
async function importLayout(p: Page, value: any) {
  const chooser = p.waitForEvent("filechooser");
  await clickAction(p, "Import current layout");
  await (
    await chooser
  ).setFiles({
    name: "current-layout.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(value)),
  });
}
async function setup(p: Page) {
  await p.goto("/");
  await createNode(p, "Float");
  await expect(p.locator("#canvas-1 .node.selected")).toHaveCount(1);
}
const field = (p: Page, id = "inspector") =>
  p
    .locator("#panel-" + id)
    .getByRole("textbox", { name: "Value", exact: true });
test("B01 public two Canvas and two Parameters share edits but retain selection Stage and camera", async ({
  page: p,
}) => {
  await setup(p);
  await clickAction(p, "Second Canvas");
  await clickAction(p, "Add Parameters");
  await expect(p.locator(".canvas")).toHaveCount(2);
  await expect(p.locator(".inspector")).toHaveCount(2);
  await expect(field(p)).toHaveCount(0);
  await p.locator("#canvas-1 .node.selected h3").click();
  await expect(field(p)).toBeVisible();
  await expect(field(p, "parameters-1")).toBeVisible();
  const before = await download(p, "Export JSON");
  await field(p).fill("0.625");
  await field(p).press("Enter");
  await expect(field(p, "parameters-1")).toHaveValue("0.625");
  await p
    .getByRole("tab", { name: "Inspector · parameters-1", exact: true })
    .click();
  await expect(field(p)).toHaveValue("0.625");
  await p
    .locator("#canvas-2")
    .getByRole("button", { name: "Vertex", exact: true })
    .click();
  await expect(p.locator("#canvas-2 .canvas-breadcrumb")).toContainText(
    "vertex",
  );
  await expect(p.locator("#canvas-1 .canvas-breadcrumb")).toContainText(
    "pixel",
  );
  const camera1 = await p.locator("#canvas-1 .viewport").getAttribute("style");
  await p.locator("#canvas-2 .canvas").hover({ position: { x: 300, y: 150 } });
  await p.mouse.wheel(0, -120);
  await expect(p.locator("#canvas-1 .viewport")).toHaveAttribute(
    "style",
    camera1!,
  );
  const after = await download(p, "Export JSON");
  save("two-contexts", {
    before,
    after,
    camera1,
    secondCamera: await p.locator("#canvas-2 .viewport").getAttribute("style"),
  });
  await p.screenshot({ path: path.join(evidence, "two-contexts.png") });
});
test("B01 public groups fixed follow hide close and Parameters activation have explicit missing state", async ({
  page: p,
}) => {
  await setup(p);
  await clickAction(p, "Second Canvas");
  await clickAction(p, "Add Parameters");
  let menu = await options(p, "parameters-1");
  await menu.getByLabel("Panel link group").fill("2");
  await menu.getByLabel("Panel link group").press("Tab");
  await p.keyboard.press("Escape");
  await expect(
    p.locator('[data-pane="parameters-1"] .workspace-route-status'),
  ).toHaveText("No Canvas source");
  menu = await options(p, "canvas-1");
  await menu.getByLabel("Panel link group").fill("2");
  await menu.getByLabel("Panel link group").press("Tab");
  await p.keyboard.press("Escape");
  await p.getByRole("tab", { name: "Canvas · canvas-1", exact: true }).click();
  await expect(field(p, "parameters-1")).toBeVisible();
  menu = await options(p, "inspector");
  await menu.getByLabel("Panel source").selectOption("canvas-1");
  await p.keyboard.press("Escape");
  await option(p, "canvas-1", "Hide panel");
  await expect(field(p)).toBeVisible();
  await clickAction(p, "Show hidden panels");
  await option(p, "canvas-1", "Close panel");
  await expect(
    p.locator('[data-pane="inspector"] .workspace-route-status'),
  ).toHaveText("No Canvas source");
  await expect(
    p.locator('[data-pane="parameters-1"] .workspace-route-status'),
  ).toHaveText("No Canvas source");
  save("routing-layout", await download(p, "Export current layout"));
});
test("B01 public draft survives move hide collapse float while close and route change veto", async ({
  page: p,
}) => {
  await setup(p);
  const before = await download(p, "Export JSON");
  await field(p).fill("0.");
  await option(p, "inspector", "Close panel");
  await expect(p.locator("#message")).toContainText("PANEL_CLOSE_VETO");
  await expect(field(p)).toHaveValue("0.");
  await option(p, "inspector", "Split to left");
  await expect(field(p)).toHaveValue("0.");
  await option(p, "pane-1", "Float Parameters");
  await expect(field(p)).toHaveValue("0.");
  await p
    .getByRole("button", { name: "Collapse Parameters", exact: true })
    .click();
  await expect(field(p)).not.toBeVisible();
  await p
    .getByRole("button", { name: "Expand Parameters", exact: true })
    .click();
  await expect(field(p)).toHaveValue("0.");
  await p
    .getByRole("button", { name: "Return Parameters to dock", exact: true })
    .click();
  await expect(field(p)).toHaveValue("0.");
  await option(p, "pane-1", "Hide panel");
  await clickAction(p, "Show hidden panels");
  await expect(field(p)).toHaveValue("0.");
  await field(p).press("Escape");
  expect(await download(p, "Export JSON")).toEqual(before);
  await p.screenshot({ path: path.join(evidence, "preserved-draft.png") });
});
test("B01 public current layout roundtrip fresh context mapping and malformed atomic rejection", async ({
  page: p,
}) => {
  await setup(p);
  await clickAction(p, "Second Canvas");
  await clickAction(p, "Add Parameters");
  await p.getByRole("tab", { name: "Canvas · canvas-1", exact: true }).click();
  await option(p, "parameters-1", "Move to inspector");
  const layout = await download(p, "Export current layout"),
    document = await download(p, "Export JSON");
  expect(JSON.stringify(layout)).not.toContain('"loadId"');
  expect(JSON.stringify(layout)).not.toContain('"contextId"');
  await clickAction(p, "Save current layout");
  await clickAction(p, "Restore current layout");
  await expect(p.locator(".canvas")).toHaveCount(2);
  await expect(
    p.locator('[data-pane="inspector"] .workspace-route-status'),
  ).toHaveText("No Canvas source");
  await p.getByRole("tab", { name: "Canvas · canvas-1", exact: true }).click();
  await expect(field(p, "parameters-1")).toBeVisible();
  expect(await download(p, "Export JSON")).toEqual(document);
  const bads = [
    { ...layout, version: 99 },
    { ...layout, panels: [...layout.panels, layout.panels[0]] },
    { ...layout, widths: { left: 1, right: 320 } },
  ];
  for (const bad of bads) {
    await importLayout(p, bad);
    await expect(p.locator("#message")).toContainText(/LAYOUT_/);
    expect(await download(p, "Export current layout")).toEqual(layout);
    expect(await download(p, "Export JSON")).toEqual(document);
  }
  const missing = structuredClone(layout);
  missing.panels.find((r: any) => r.id === "parameters-1").typeId =
    "missing.panel";
  await importLayout(p, missing);
  await expect(p.getByText(/PANEL_UNAVAILABLE/).first()).toBeVisible();
  expect(
    (await download(p, "Export current layout")).panels.find(
      (r: any) => r.id === "parameters-1",
    ).typeId,
  ).toBe("missing.panel");
  save("restored-layout", layout);
});
test("B01 divider keyboard pointer cancel targeted reset preferred width and narrow clamp preserve Graph", async ({
  page: p,
}) => {
  await setup(p);
  const before = await download(p, "Export JSON"),
    divider = p.getByRole("separator", {
      name: "right sidebar width",
      exact: true,
    });
  await divider.click();
  await p.keyboard.press("End");
  expect((await download(p, "Export current layout")).widths.right).toBe(640);
  await divider.click();
  await p.keyboard.press("Home");
  await p.keyboard.press("Shift+ArrowLeft");
  expect(await divider.getAttribute("aria-valuenow")).toBe("332");
  await p.keyboard.press("Escape");
  expect(await divider.getAttribute("aria-valuenow")).toBe("640");
  await p.setViewportSize({ width: 620, height: 800 });
  await p.getByRole("button", { name: "Panels", exact: true }).click();
  await p.getByRole("button", { name: "Show inspector", exact: true }).click();
  await expect(
    p.getByRole("button", { name: "Close right overlay", exact: true }),
  ).toBeVisible();
  await p
    .getByRole("button", { name: "Close right overlay", exact: true })
    .click();
  await p.setViewportSize({ width: 1440, height: 1000 });
  await expect(field(p)).toBeVisible();
  expect((await download(p, "Export current layout")).widths.right).toBe(640);
  await divider.dblclick();
  expect((await download(p, "Export current layout")).widths.right).toBe(320);
  const b = (await divider.boundingBox())!;
  await p.mouse.move(b.x + 3, b.y + 80);
  await p.mouse.down();
  await p.mouse.move(b.x - 90, b.y + 80, { steps: 12 });
  await p.keyboard.press("Escape");
  await p.mouse.up();
  expect((await download(p, "Export current layout")).widths.right).toBe(320);
  expect(await download(p, "Export JSON")).toEqual(before);
});
test("B01 float upper slot dimensions one owner and keyboard collapse do not change graph", async ({
  page: p,
}) => {
  await setup(p);
  await clickAction(p, "Add Parameters");
  const before = await download(p, "Export JSON");
  await option(p, "inspector", "Float Parameters");
  const floating = p.locator(".workspace-float"),
    b = (await floating.boundingBox())!;
  expect(b.x + b.width).toBeCloseTo(1428, 0);
  expect(b.y).toBe(12);
  expect(b.width).toBe(320);
  const resize = p.getByRole("separator", {
    name: "Parameters floating width",
  });
  await resize.click();
  await p.keyboard.press("Home");
  expect((await floating.boundingBox())!.width).toBe(280);
  await p.keyboard.press("Escape");
  expect((await floating.boundingBox())!.width).toBe(320);
  await p.getByRole("button", { name: "Panels", exact: true }).click();
  await p
    .getByRole("button", { name: "Settings parameters-1", exact: true })
    .click();
  await p
    .getByRole("dialog", { name: "Panel options", exact: true })
    .getByRole("button", { name: "Float Parameters", exact: true })
    .click();
  await expect(floating).toHaveCount(1);
  await expect(floating).toHaveAttribute(
    "aria-label",
    "Inspector · parameters-1",
  );
  await expect(field(p)).toBeVisible();
  await p.setViewportSize({ width: 620, height: 700 });
  await p.screenshot({ path: path.join(evidence, "float-narrow.png") });
  await p
    .getByRole("button", { name: "Return Parameters to dock", exact: true })
    .click();
  expect(await download(p, "Export JSON")).toEqual(before);
});
test("B01 current layout storage refusal is visible and never reports saved", async ({
  page: p,
}) => {
  await p.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === "grape.workspace.current.v1")
        throw new DOMException("Denied", "SecurityError");
      return original.call(this, k, v);
    };
  });
  await setup(p);
  const before = await download(p, "Export JSON");
  await clickAction(p, "Save current layout");
  await expect(p.locator("#message")).toContainText("Denied");
  expect(await download(p, "Export JSON")).toEqual(before);
});

async function tabTo(p: Page, target: ReturnType<Page["locator"]>) {
  for (let i = 0; i < 180; i++) {
    if (await target.evaluate((e) => e === document.activeElement)) return;
    await p.keyboard.press("Shift+Tab");
  }
  throw Error("Trusted Tab target unavailable");
}
test("B01 public Tab drag groups and orders live Panels; adjacent divider changes only its pair", async ({
  page: p,
}) => {
  await setup(p);
  await clickAction(p, "Second Canvas");
  await clickAction(p, "Add Parameters");
  const before = await download(p, "Export JSON");
  await p
    .getByRole("tab", { name: "Inspector · parameters-1", exact: true })
    .dragTo(p.getByRole("tab", { name: "Inspector · inspector", exact: true }));
  let layout = await download(p, "Export current layout");
  expect(layout.panes.find((x: any) => x.id === "inspector").tabs).toEqual([
    "parameters-1",
    "inspector",
  ]);
  await option(p, "inspector", "Move tab later");
  layout = await download(p, "Export current layout");
  expect(layout.panes.find((x: any) => x.id === "inspector").tabs).toEqual([
    "inspector",
    "parameters-1",
  ]);
  await option(p, "inspector", "Split to right");
  layout = await download(p, "Export current layout");
  const divider = p.getByRole("separator", {
    name: "Resize canvas-1 and canvas-2",
    exact: true,
  });
  await divider.click();
  await p.keyboard.press("Shift+ArrowDown");
  const resized = await download(p, "Export current layout");
  expect(
    resized.panes.find((x: any) => x.id === "canvas-1").weight,
  ).toBeGreaterThan(1);
  expect(resized.panes.filter((x: any) => x.zone === "right")).toEqual(
    layout.panes.filter((x: any) => x.zone === "right").map((x: any) => x),
  );
  await divider.dblclick();
  expect(
    (await download(p, "Export current layout")).panes.find(
      (x: any) => x.id === "canvas-1",
    ).weight,
  ).toBeCloseTo(1, 4);
  expect(await download(p, "Export JSON")).toEqual(before);
});
test("B01 trusted keyboard placement during primary drag cancels the old Operation and drains before return", async ({
  page: p,
}) => {
  await setup(p);
  const before = await download(p, "Export JSON"),
    node = p.locator("#canvas-1 .node.selected h3"),
    b = (await node.boundingBox())!;
  await p.mouse.move(b.x + 20, b.y + 10);
  await p.mouse.down();
  await p.mouse.move(b.x + 80, b.y + 50, { steps: 12 });
  const optionsButton = p.getByRole("button", {
    name: "Panel options in canvas-1",
    exact: true,
  });
  await tabTo(p, optionsButton);
  await p.keyboard.press("Enter");
  const move = p
    .getByRole("dialog", { name: "Panel options", exact: true })
    .getByRole("button", { name: "Split to center", exact: true });
  await tabTo(p, move);
  await p.keyboard.press("Enter");
  await p.mouse.up();
  expect(await download(p, "Export JSON")).toEqual(before);
  await expect(p.locator("#canvas-1 .canvas")).toBeVisible();
});
test("B01 synthetic composition and detached callback retain draft through placement and cannot edit after close", async ({
  page: p,
}) => {
  await setup(p);
  const before = await download(p, "Export JSON");
  await field(p).fill("0.");
  await field(p).dispatchEvent("compositionstart", { data: "x" });
  const old = await field(p).elementHandle();
  await option(p, "inspector", "Split to left");
  await expect(field(p)).toHaveValue("0.");
  await expect(field(p)).toHaveAttribute("data-composing", "true");
  await old!.evaluate((e) => {
    (e as HTMLInputElement).value = "999";
    e.dispatchEvent(new Event("input", { bubbles: true }));
    e.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
  });
  expect(await download(p, "Export JSON")).toEqual(before);
  await field(p).dispatchEvent("compositionend", { data: "" });
  await field(p).press("Escape");
  await option(p, "pane-1", "Close panel");
  await old!.evaluate((e) =>
    e.dispatchEvent(new Event("change", { bubbles: true })),
  );
  expect(await download(p, "Export JSON")).toEqual(before);
  save("synthetic-composition-lifetime", {
    synthetic: true,
    physicalIME: false,
    oldDetachedCallbackNoModelChange: true,
  });
});
test("B01 readonly presentation placement remains available and F2 is Panel scoped after moves", async ({
  page: p,
}) => {
  await setup(p);
  await clickAction(p, "Lock editing");
  const before = await download(p, "Export JSON");
  await option(p, "inspector", "Float Parameters");
  await expect(field(p)).toHaveAttribute("readonly", "");
  await field(p).click();
  await p.keyboard.press("F2");
  await expect(
    p.getByRole("dialog", { name: "Object information", exact: true }),
  ).toBeVisible();
  await expect(
    p.getByRole("dialog", { name: "Object information", exact: true }),
  ).toContainText("Value");
  await p.keyboard.press("Escape");
  await p
    .getByRole("button", { name: "Return Parameters to dock", exact: true })
    .click();
  expect(await download(p, "Export JSON")).toEqual(before);
});

test("B01 float resize superseded by keyboard dock cleans old controls and narrow hide revokes field callbacks", async ({
  page: p,
}) => {
  await setup(p);
  const before = await download(p, "Export JSON");
  const errors: string[] = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await option(p, "inspector", "Float Parameters");
  const divider = p.getByRole("separator", {
    name: "Parameters floating width",
    exact: true,
  });
  await divider.click();
  await p.keyboard.press("ArrowLeft");
  await p.keyboard.press("p");
  await expect(
    p.getByRole("button", { name: "Return Parameters to dock", exact: true }),
  ).toHaveCount(0);
  await expect(field(p)).toBeVisible();
  const old = await field(p).elementHandle();
  await p.setViewportSize({ width: 620, height: 800 });
  await expect(field(p)).toBeHidden();
  await old!.evaluate((e) => {
    (e as HTMLInputElement).value = "999";
    e.dispatchEvent(new Event("input", { bubbles: true }));
    e.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
  });
  await p.setViewportSize({ width: 1440, height: 1000 });
  await expect(field(p)).toBeVisible();
  expect(await download(p, "Export JSON")).toEqual(before);
  expect(errors).toEqual([]);
});
