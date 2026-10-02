import { test, expect } from "@playwright/test";
async function fullFlow(page: any) {
  await page.getByRole("button", { name: "Add Float", exact: true }).click();
  await page.getByRole("button", { name: "Add Multiply", exact: true }).click();
  await page.getByRole("button", { name: "Add Compose", exact: true }).click();
  await page
    .getByRole("button", { name: "Float output value", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Multiply input a", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Multiply output result", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Compose input x", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Compose output result", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Image output input color", exact: true })
    .click();
}
test.beforeEach(async ({ page }) => {
  await page.goto("/");
});
test("AT-S01-01 browser: user creates connected shader, edits and sees generated GLSL", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await fullFlow(page);
  await page.getByRole("button", { name: "Generate GLSL" }).click();
  await expect(
    page.getByText("Generated successfully · Host-free GLSL"),
  ).toBeVisible();
  await expect(page.getByLabel("Generated GLSL")).toContainText("* 2.0");
  await page
    .locator(".node h3")
    .filter({ hasText: /^Float$/ })
    .click();
  const input = page.getByRole("textbox", { name: "Value", exact: true });
  await input.fill("0.5");
  await input.press("Enter");
  await expect(input).toHaveValue("0.5");
  await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
  expect(errors).toEqual([]);
  await page.screenshot({ path: "evidence/s01-workspace.png", fullPage: true });
});
test("AT-S01-03 browser: dynamic shape errors are visible, Undo restores and Redo repeats", async ({
  page,
}) => {
  await fullFlow(page);
  await page
    .locator(".node h3")
    .filter({ hasText: /^Compose$/ })
    .click();
  await page
    .getByRole("combobox", { name: "Shape" })
    .selectOption({ label: "vec2" });
  await page.getByRole("button", { name: "Generate GLSL" }).click();
  await expect(
    page.getByText("Generation blocked", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Diagnostics")).toContainText("INPUT_REQUIRED");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Shape" })).toHaveValue(
    "RGBA (vec4)",
  );
  await page.getByRole("button", { name: "Generate GLSL" }).click();
  await expect(
    page.getByText("Generated successfully · Host-free GLSL"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Shape" })).toHaveValue(
    "vec2",
  );
});
test("AT-S01-05 browser: IndexedDB ACK save/reopen and independent JSON download/file open", async ({
  page,
}) => {
  await fullFlow(page);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#save-state")).toHaveText("Saved");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const download = await downloadPromise;
  const file = await download.path();
  await page.getByRole("button", { name: "New document", exact: true }).click();
  await page.getByRole("button", { name: "Open saved", exact: true }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#saved-list button").click();
  await expect(page.locator(".node")).toHaveCount(4);
  await page.getByRole("button", { name: "Generate GLSL" }).click();
  await expect(
    page.getByText("Generated successfully · Host-free GLSL"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
  await page.locator("input[type=file]").setInputFiles(file!);
  await expect(page.locator(".node")).toHaveCount(4);
  await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
});

test("AT-S01-02 browser: occupied and incompatible connections preserve wires and revision", async ({
  page,
}) => {
  await fullFlow(page);
  const canvas = page.locator(".canvas").first(),
    revision = await canvas.getAttribute("data-revision"),
    edges = await page.locator("[data-edge]").count();
  await page
    .getByRole("button", { name: "Float output value", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Multiply input a", exact: true })
    .click();
  await expect(page.locator(".canvas-notice")).toContainText("INPUT_OCCUPIED");
  expect(await canvas.getAttribute("data-revision")).toBe(revision);
  expect(await page.locator("[data-edge]").count()).toBe(edges);
  await page
    .getByRole("button", { name: "Float output value", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Image output input color", exact: true })
    .click({ modifiers: ["Shift"] });
  await expect(page.locator(".canvas-notice")).toContainText("TYPE_ADAPTATION");
  expect(await canvas.getAttribute("data-revision")).toBe(revision);
});
test("AT-S01-04 browser: draft cancel, IME guard, keyboard commit, pointer gesture Undo and cancel", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Add Float", exact: true }).click();
  const input = page.getByRole("textbox", { name: "Value", exact: true }),
    canvas = page.locator(".canvas");
  const before = await canvas.getAttribute("data-revision");
  await input.fill("0.");
  await expect(canvas).toHaveAttribute("data-revision", before!);
  await input.press("Escape");
  await expect(input).toHaveValue("0.25");
  await input.dispatchEvent("compositionstart", { data: "1" });
  await input.fill("0.8");
  await input.press("Enter");
  await expect(canvas).toHaveAttribute("data-revision", before!);
  await input.dispatchEvent("compositionend", { data: "0.8" });
  await input.press("Enter");
  await expect(input).toHaveValue("0.8");
  await input.press("Control+z");
  await expect(input).toHaveValue("0.25");
  const card = page
      .locator(".node")
      .filter({ has: page.locator("h3", { hasText: /^Float$/ }) }),
    position = await card.getAttribute("style");
  const title = card.locator("h3"),
    box = await title.boundingBox();
  await page.mouse.move(box!.x + 60, box!.y + 15);
  await page.mouse.down();
  await page.mouse.move(box!.x + 90, box!.y + 45, { steps: 4 });
  await page.mouse.move(box!.x + 120, box!.y + 55, { steps: 4 });
  await page.mouse.up();
  expect(await card.getAttribute("style")).not.toBe(position);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(card).toHaveAttribute("style", position!);
  const again = await title.boundingBox();
  await page.mouse.move(again!.x + 60, again!.y + 15);
  await page.mouse.down();
  await page.mouse.move(again!.x + 140, again!.y + 70, { steps: 4 });
  await canvas.dispatchEvent("pointercancel", { pointerId: 1 });
  await page.mouse.up();
  await expect(card).toHaveAttribute("style", position!);
});
test("AT-S01-06 browser: two Canvas contexts keep independent selections and camera while sharing edits", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Add Float", exact: true }).click();
  await page.getByRole("button", { name: "Add Multiply", exact: true }).click();
  await page
    .locator("#canvas-1 .node h3")
    .filter({ hasText: /^Float$/ })
    .click();
  const selection = await page
    .locator("#canvas-1 .canvas")
    .getAttribute("data-selection");
  await page
    .getByRole("button", { name: "Second Canvas", exact: true })
    .click();
  await page
    .locator("#canvas-2 .node h3")
    .filter({ hasText: /^Multiply$/ })
    .click();
  await expect(page.locator("#canvas-1 .canvas")).toHaveAttribute(
    "data-selection",
    selection!,
  );
  const second = page.locator("#canvas-2 .canvas");
  await second.hover({ position: { x: 30, y: 350 } });
  await page.mouse.wheel(0, -200);
  await expect(second).not.toHaveAttribute("data-zoom", "1");
  await expect(page.locator("#canvas-1 .canvas")).toHaveAttribute(
    "data-zoom",
    "1",
  );
  await page
    .locator("#canvas-1 .node h3")
    .filter({ hasText: /^Float$/ })
    .click();
  await page.getByRole("textbox", { name: "Value", exact: true }).fill("0.9");
  await page
    .getByRole("textbox", { name: "Value", exact: true })
    .press("Enter");
  expect(
    await page.locator("#canvas-1 .canvas").getAttribute("data-revision"),
  ).toBe(await second.getAttribute("data-revision"));
  await page
    .locator("#canvas-2 .node h3")
    .filter({ hasText: /^Float$/ })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Value", exact: true }),
  ).toHaveValue("0.9");
  await page
    .getByRole("button", { name: "Delete selected", exact: true })
    .click();
  await expect(page.locator("#canvas-1 .canvas")).toHaveAttribute(
    "data-selection",
    "",
  );
  await expect(page.locator("#canvas-1 .node")).toHaveCount(2);
  await expect(page.locator("#canvas-2 .node")).toHaveCount(2);
});
test("AT-S01-07 browser: delayed storage completion cannot clear a newer edit; rejection and export preserve dirty", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Add Float", exact: true }).click();
  await page.evaluate(() => {
    const descriptor = Object.getOwnPropertyDescriptor(
      IDBTransaction.prototype,
      "oncomplete",
    )!;
    Object.defineProperty(IDBTransaction.prototype, "oncomplete", {
      ...descriptor,
      set(handler) {
        descriptor.set!.call(
          this,
          function (this: IDBTransaction, event: Event) {
            (window as any).releaseSave = () => handler.call(this, event);
          },
        );
      },
    });
  });
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#save-state")).toHaveText("Saving…");
  await expect(
    page.getByRole("button", { name: "Save", exact: true }),
  ).toBeDisabled();
  await page.getByRole("textbox", { name: "Value", exact: true }).fill("0.6");
  await page
    .getByRole("textbox", { name: "Value", exact: true })
    .press("Enter");
  await page.waitForFunction(
    () => typeof (window as any).releaseSave === "function",
  );
  await page.evaluate(() => (window as any).releaseSave());
  await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
  await page.evaluate(() => {
    IDBObjectStore.prototype.put = function () {
      throw new DOMException("Storage denied", "QuotaExceededError");
    };
  });
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#message")).toContainText("Storage denied");
  await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  await (await download).cancel();
  await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
});
test("recovery browser: future structural document stays read-only and original can be exported", async ({
  page,
}) => {
  const raw = JSON.stringify({
    format: "grape.document",
    formatVersion: { major: 3, minor: 0 },
    graph: { future: true },
  });
  await page.locator("input[type=file]").setInputFiles({
    name: "future.grape.json",
    mimeType: "application/json",
    buffer: Buffer.from(raw),
  });
  await expect(page.locator("#recovery")).toBeVisible();
  await expect(page.locator("#recovery-message")).toContainText(
    "UNSUPPORTED_VERSION",
  );
  await expect(page.locator(".node")).toHaveCount(1);
  const next = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export original", exact: true })
    .click();
  const file = await (await next).path();
  const fs = await import("node:fs/promises");
  expect(await fs.readFile(file!, "utf8")).toBe(raw);
});

test("readonly browser: fields, actions and keyboard cannot edit; unlocking restores the same value", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Add Float", exact: true }).click();
  const field = page.getByRole("textbox", { name: "Value", exact: true }),
    canvas = page.locator(".canvas");
  const revision = await canvas.getAttribute("data-revision");
  await page.getByRole("button", { name: "Lock editing", exact: true }).click();
  await expect(field).toHaveAttribute("readonly", "");
  await expect(
    page.getByRole("button", { name: "Add Float", exact: true }),
  ).toBeDisabled();
  await canvas.focus();
  await canvas.press("Control+z");
  await canvas.press("Delete");
  await expect(canvas).toHaveAttribute("data-revision", revision!);
  await expect(page.locator(".node")).toHaveCount(2);
  await page.getByRole("button", { name: "Lock editing", exact: true }).click();
  await expect(field).not.toHaveAttribute("readonly", "");
  await expect(field).toHaveValue("0.25");
});

test("diagnostics locate the affected node through the active Context without adding History", async ({
  page,
}) => {
  await fullFlow(page);
  await page
    .locator(".node h3")
    .filter({ hasText: /^Compose$/ })
    .click();
  await page
    .getByRole("combobox", { name: "Shape" })
    .selectOption({ label: "vec2" });
  const revision = await page.locator(".canvas").getAttribute("data-revision");
  await page
    .getByLabel("Diagnostics")
    .getByRole("button", { name: "Locate node" })
    .first()
    .click();
  await expect(page.locator(".inspector > p")).toHaveText("Image output");
  await expect(page.locator(".canvas")).toHaveAttribute(
    "data-revision",
    revision!,
  );
});

test("invalid UTF-8 recovery retains original bytes; closing recovery and cancelling open preserve the graph", async ({
  page,
}) => {
  const buffer = Buffer.from([0xff, 0xc0, 0xaf, 0x00, 0x7b]);
  const revision = await page.locator(".canvas").getAttribute("data-revision");
  await page.locator("input[type=file]").setInputFiles({
    name: "invalid.grape.json",
    mimeType: "application/json",
    buffer,
  });
  await expect(page.locator("#recovery-message")).toContainText("INVALID_UTF8");
  const next = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export original", exact: true })
    .click();
  const fs = await import("node:fs/promises");
  expect(await fs.readFile((await (await next).path())!)).toEqual(buffer);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Open saved", exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator(".canvas")).toHaveAttribute(
    "data-revision",
    revision!,
  );
});

test("view failure shows shared retry placeholder and releases the failed mount", async ({
  page,
}) => {
  await page.evaluate(() => {
    const append = Element.prototype.append;
    let fail = true;
    Element.prototype.append = function (...nodes) {
      if (
        fail &&
        nodes.some(
          (n) => n instanceof HTMLElement && n.classList.contains("viewport"),
        )
      ) {
        fail = false;
        throw Error("injected mount failure");
      }
      return append.apply(this, nodes);
    };
  });
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "New document", exact: true }).click();
  await expect(page.locator(".view-placeholder")).toContainText(
    "injected mount failure",
  );
  await expect(page.locator(".canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "Retry view", exact: true }).click();
  await expect(page.locator(".canvas")).toHaveCount(1);
  await expect(page.locator(".view-placeholder")).toHaveCount(0);
  await page.getByRole("button", { name: "Add Float", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Value", exact: true }),
  ).toHaveValue("0.25");
});

test("keyboard node selection and connection buttons preserve focus; wires meet sockets after fractional zoom", async ({
  page,
}) => {
  await fullFlow(page);
  const float = page
    .locator(".node")
    .filter({ has: page.locator("h3", { hasText: /^Float$/ }) });
  await float.focus();
  await float.press("Enter");
  await expect(
    page.getByRole("textbox", { name: "Value", exact: true }),
  ).toHaveValue("0.25");
  await expect(float).toBeFocused();
  const canvas = page.locator(".canvas");
  await canvas.hover({ position: { x: 50, y: 350 } });
  await page.mouse.wheel(0, -123);
  await expect(canvas).not.toHaveAttribute("data-zoom", "1");
  const distance = await page.evaluate(() => {
    const path = document.querySelector<SVGPathElement>(".wires path")!,
      point = path.getPointAtLength(0);
    const screen = new DOMPoint(point.x, point.y).matrixTransform(
      path.getScreenCTM()!,
    );
    const socket = document
      .querySelector<HTMLElement>('[aria-label="Float output value"] .socket')!
      .getBoundingClientRect();
    return Math.hypot(
      screen.x - socket.left - socket.width / 2,
      screen.y - socket.top - socket.height / 2,
    );
  });
  expect(distance).toBeLessThan(2);
});

test("error-bearing dynamic document saves and reopens with loss evidence and generation still blocked", async ({
  page,
}) => {
  await fullFlow(page);
  await page
    .locator(".node h3")
    .filter({ hasText: /^Compose$/ })
    .click();
  await page
    .getByRole("combobox", { name: "Shape" })
    .selectOption({ label: "vec2" });
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#save-state")).toHaveText("Saved");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const file = await (await download).path();
  const fs = await import("node:fs/promises");
  const doc = JSON.parse(await fs.readFile(file!, "utf8"));
  expect(doc.graph.losses.some((x: any) => x.payload.kind === "edge")).toBe(
    true,
  );
  expect(
    doc.graph.losses.some((x: any) => x.payload.kind === "input-value"),
  ).toBe(true);
  await page.getByRole("button", { name: "New document", exact: true }).click();
  await page.getByRole("button", { name: "Open saved", exact: true }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#saved-list button").click();
  await page.getByRole("button", { name: "Generate GLSL" }).click();
  await expect(
    page.getByText("Generation blocked", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Diagnostics")).toContainText("INPUT_REQUIRED");
  const again = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  expect(
    JSON.parse(await fs.readFile((await (await again).path())!, "utf8")),
  ).toEqual(doc);
});
