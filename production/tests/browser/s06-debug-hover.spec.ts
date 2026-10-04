import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createNode } from "./create-node.ts";
import { clickAction } from "../fixtures/public-actions.ts";
const out = process.env.GRAPE_EVIDENCE_DIR!;
const save = (name: string, data: unknown) =>
  fs.writeFileSync(
    path.join(out, name + ".json"),
    JSON.stringify(data, null, 2) + "\n",
  );
const dialog = (p: Page) =>
  p.getByRole("dialog", { name: "Object information", exact: true });
const checkbox = (p: Page) =>
  p.getByRole("checkbox", {
    name: "Show object information instead of normal hover hints",
  });
async function enable(p: Page) {
  await p.getByText("Experimental features", { exact: true }).click();
  await checkbox(p).check();
  await p.keyboard.press("Escape");
}
async function documentJSON(p: Page) {
  const wait = p.waitForEvent("download");
  await clickAction(p, "Export JSON");
  return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8"));
}
async function read(p: Page) {
  // Read the settled public hover hint before following its explicit action.
  await p.waitForTimeout(180);
  await p
    .getByRole("button", { name: "Read object details", exact: true })
    .click();
  await expect(dialog(p)).toBeVisible();
  return dialog(p).getByRole("region").innerText();
}
async function close(p: Page) {
  await p.keyboard.press("Escape");
  await expect(dialog(p)).not.toBeVisible();
  await expect(
    p.getByRole("button", { name: "Read object details", exact: true }),
  ).toBeFocused();
}
async function fixture(p: Page) {
  await createNode(p, "Color RGBA");
  const c = p.locator(".canvas").last(),
    n = c.locator("article.node").filter({
      has: p.getByRole("heading", { name: "Color RGBA", exact: true }),
    });
  await n.locator('[data-direction="output"]').click();
  await c.locator('[data-direction="input"][data-port="color"]').click();
  return { c, n };
}
test.beforeEach(async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await page.goto("/");
});

test("S06 normal debug normal checkbox preserves graph history selection and covers built-in objects", async ({
  page,
}) => {
  const { c, n } = await fixture(page),
    before = await documentJSON(page),
    selection = await c.getAttribute("data-selection");
  await n.getByRole("heading").hover();
  await expect(page.locator(".hover-summary")).toBeEmpty();
  await enable(page);
  const records = [];
  for (const [kind, target] of [
    ["Node", n.getByRole("heading")],
    ["Port", n.locator('[data-direction="output"]')],
    ["Edge", c.locator(".wires path")],
    ["Panel", page.locator(".inspector h2")],
    [
      "UI control",
      page.getByRole("button", { name: "Generate GLSL", exact: true }),
    ],
  ] as const) {
    await target.hover();
    await expect(page.locator(".hover-summary")).toContainText(kind);
    const details = await read(page);
    expect(details).toContain(kind + ":");
    expect(details).not.toMatch(
      /editToken|generation|TargetLease|MountTicket|"lease"/,
    );
    if (kind === "UI control") expect(details).toContain("未提供");
    records.push({ kind, details });
    await close(page);
  }
  expect(await c.getAttribute("data-selection")).toBe(selection);
  expect(await documentJSON(page)).toEqual(before);
  await n.getByRole("heading").click();
  const value = page.getByRole("textbox", { name: "R", exact: true });
  await value.hover();
  const widget = await read(page);
  expect(widget).toContain("Parameter Widget");
  expect(widget).toContain('"committed"');
  records.push({ kind: "Parameter Widget", details: widget });
  await close(page);
  await page.getByText("Experimental features", { exact: true }).click();
  await checkbox(page).uncheck();
  await page.keyboard.press("Escape");
  await n.getByRole("heading").hover();
  await expect(page.locator(".hover-summary")).toBeEmpty();
  expect(await documentJSON(page)).toEqual(before);
  await clickAction(page, "Undo");
  expect(
    (await documentJSON(page)).graph.stages.find((s: any) => s.key === "pixel")
      .network.edges,
  ).toHaveLength(0);
  await clickAction(page, "Redo");
  expect(await documentJSON(page)).toEqual(before);
  save("built-in-objects", records);
  await page.screenshot({ path: path.join(out, "normal-restored.png") });
});

test("S06 scalar and vector committed values stay distinct from unfinished drafts and IME guards", async ({
  page,
}) => {
  await enable(page);
  await createNode(page, "Multiply");
  const c = page.locator(".canvas").last();
  await c.getByRole("heading", { name: "Multiply", exact: true }).click();
  await page.getByText("Experimental features", { exact: true }).click();
  const input = page.getByRole("textbox", { name: "A", exact: true }),
    before = await documentJSON(page);
  await input.fill("7.25");
  // Refusal is tested through an actual click, not a check() retry that hides rejection.
  await checkbox(page).click();
  await expect(checkbox(page)).toBeChecked();
  await expect(input).toHaveValue("7.25");
  await expect(input).toBeFocused();
  await input.dispatchEvent("compositionstart");
  await checkbox(page).click();
  await expect(input).toBeFocused();
  await expect(page.locator(".experimental-issue")).toContainText(
    "composition",
  );
  await input.dispatchEvent("compositionend");
  await input.hover();
  const text = await read(page);
  expect(text).toContain('"value": 1');
  expect(text).toContain('"text": "7.25"');
  await close(page);
  await input.hover();
  await input.press("Escape");
  await expect(page.locator(".hover-summary")).toBeEmpty();
  await expect(input).toHaveValue("1");
  expect(await documentJSON(page)).toEqual(before);
  await createNode(page, "Color RGBA");
  await c.getByRole("heading", { name: "Color RGBA", exact: true }).click();
  const r = page.getByRole("textbox", { name: "R", exact: true });
  await r.fill("0.37");
  await r.hover();
  const vector = await read(page);
  expect(vector).toContain('"componentTexts"');
  expect(vector).toContain('"0.37"');
  await close(page);
  await r.hover();
  await r.press("Escape");
  await expect(page.locator(".hover-summary")).toBeEmpty();
  save("drafts", {
    scalar: text,
    vector,
    composition:
      "Synthetic composition boundary events; actual typing/focus/click refusal. No physical IME qualification.",
  });
});

test("S06 hover detail invalidation follows selection stage deletion Undo and same-ID reopen", async ({
  page,
}) => {
  await enable(page);
  const { c, n } = await fixture(page),
    original = await documentJSON(page),
    id = await n.getAttribute("data-node");
  await n.getByRole("heading").hover();
  expect(await read(page)).toContain(id!);
  await close(page);
  await c.getByRole("button", { name: "Vertex", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Read object details", exact: true }),
  ).toBeDisabled();
  await c.getByRole("button", { name: "Pixel", exact: true }).click();
  await n.getByRole("heading").click();
  await clickAction(page, "Delete selected");
  await expect(n).toHaveCount(0);
  await expect(page.locator(".hover-summary")).toBeEmpty();
  await clickAction(page, "Undo");
  await expect(n).toHaveCount(1);
  const old = await n.elementHandle();
  await page.getByLabel("Open document file").setInputFiles({
    name: "same-id.grape.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(original)),
  });
  await page
    .getByRole("button", { name: "Open in new session", exact: true })
    .click();
  expect(await old!.evaluate((e) => e.isConnected)).toBe(false);
  await expect(dialog(page)).not.toBeVisible();
  await expect(page.locator(".hover-summary")).not.toContainText("Color RGBA");
  const fresh = page.locator(`article[data-node="${id}"]`);
  await fresh.getByRole("heading").hover();
  expect(await read(page)).toContain(id!);
  await close(page);
  expect(await documentJSON(page)).toEqual(original);
  save("lifetime-public", {
    id,
    samePersistentIdDifferentMount: true,
    stageDeletionUndoReopen: "passed",
  });
});

test("S06 pending connection and held gesture reject preference changes while readonly inspection remains", async ({
  page,
}) => {
  await enable(page);
  const { c, n } = await fixture(page),
    before = await documentJSON(page);
  await page.getByText("Experimental features", { exact: true }).click();
  await n.locator('[data-direction="output"]').click();
  await checkbox(page).click();
  await expect(checkbox(page)).toBeChecked();
  await expect(page.locator(".experimental-issue")).toContainText("connection");
  await page.keyboard.press("Escape");
  await page.getByText("Experimental features", { exact: true }).click();
  await clickAction(page, "Lock editing");
  await n.getByRole("heading").hover();
  expect(await read(page)).toContain("Node:");
  await close(page);
  expect(await documentJSON(page)).toEqual(before);
  await n.getByRole("heading").click();
  await page.getByRole("textbox", { name: "R", exact: true }).hover();
  expect(await read(page)).toContain("Read-only");
  await close(page);
  await clickAction(page, "Lock editing");
  await page.getByText("Experimental features", { exact: true }).click();
  await n.getByRole("heading").click();
  const b = (await n.getByRole("heading").boundingBox())!;
  await page.mouse.move(b.x + 20, b.y + 10);
  await page.mouse.down();
  await page.mouse.move(b.x + 60, b.y + 40, { steps: 5 });
  await checkbox(page).dispatchEvent("click");
  await expect(checkbox(page)).toBeChecked(); // synthetic concurrent UI event while real mouse gesture is held
  await page.keyboard.press("Escape");
  await page.mouse.up();
  expect(await documentJSON(page)).toEqual(before);
  save("gesture-preference-guard", {
    actualMouseDrag: true,
    concurrentCheckbox:
      "Synthetic click while held; no second physical pointer claim",
    naturalEscape: true,
  });
});

for (const bad of ["malformed", "denied", "read-denied"])
  test(`S06 preference ${bad} visibly falls back without touching other keys`, async ({
    page,
  }) => {
    await page.addInitScript((mode) => {
      localStorage.setItem("other-app", "retain");
      if (mode === "malformed")
        localStorage.setItem("grape.preferences.hover.v1", "{broken}");
      else if (mode === "read-denied") {
        const original = Storage.prototype.getItem;
        Storage.prototype.getItem = function (k) {
          if (k === "grape.preferences.hover.v1")
            throw new DOMException("Denied", "SecurityError");
          return original.call(this, k);
        };
      } else {
        const original = Storage.prototype.setItem;
        Storage.prototype.setItem = function (k, v) {
          if (k === "grape.preferences.hover.v1")
            throw new DOMException("Denied", "SecurityError");
          return original.call(this, k, v);
        };
      }
    }, bad);
    await page.reload();
    await page.getByText("Experimental features", { exact: true }).click();
    await expect(checkbox(page)).not.toBeChecked();
    if (bad === "malformed")
      await expect(page.locator(".experimental-issue")).toContainText(
        "invalid",
      );
    else if (bad === "denied") {
      await checkbox(page).click();
      await expect(checkbox(page)).not.toBeChecked();
      await expect(page.locator(".experimental-issue")).toContainText(
        "could not be saved",
      );
    } else
      await expect(page.locator(".experimental-issue")).toContainText(
        "unavailable",
      );
    expect(await page.evaluate(() => localStorage.getItem("other-app"))).toBe(
      "retain",
    );
    save("preference-" + bad, {
      issue: await page.locator(".experimental-issue").innerText(),
      current: await page.evaluate(() => {
        try {
          return localStorage.getItem("grape.preferences.hover.v1");
        } catch {
          return "storage unavailable";
        }
      }),
    });
  });

test("S06 diagnostic preference persists separately and rapid hover performs no per-move capture or serialization", async ({
  page,
}) => {
  await enable(page);
  await page.reload();
  await page.getByText("Experimental features", { exact: true }).click();
  await expect(checkbox(page)).toBeChecked();
  await page.keyboard.press("Escape");
  const { c, n } = await fixture(page),
    before = await documentJSON(page),
    selection = await c.getAttribute("data-selection");
  await page.evaluate(() => {
    const clone = window.structuredClone,
      stringify = JSON.stringify;
    (window as any).__hoverCounts = { clone: 0, stringify: 0 };
    window.structuredClone = (...args) => {
      (window as any).__hoverCounts.clone++;
      return clone(...args);
    };
    JSON.stringify = ((...args: any[]) => {
      (window as any).__hoverCounts.stringify++;
      return (stringify as any)(...args);
    }) as typeof JSON.stringify;
  });
  await n.getByRole("heading").hover();
  await page.evaluate(() => {
    (window as any).__hoverCounts = { clone: 0, stringify: 0 };
  });
  const b = (await n.getByRole("heading").boundingBox())!;
  for (let i = 0; i < 80; i++)
    await page.mouse.move(b.x + 10 + (i % 30), b.y + 10);
  const counts = await page.evaluate(() => (window as any).__hoverCounts);
  expect(counts).toEqual({ clone: 0, stringify: 0 });
  expect(await c.getAttribute("data-selection")).toBe(selection);
  expect(await documentJSON(page)).toEqual(before);
  save("rapid-hover-counts", {
    moves: 80,
    counts,
    methodology:
      "Browser-wide structuredClone and JSON.stringify counters after entry, actual trusted mouse movement within one current target; instrumentation only in disposable context. This is not a general performance/FPS claim.",
  });
});

test("S06 keyboard details and bounded long owner data are readable without selection layout changes", async ({
  page,
}) => {
  await enable(page);
  const { c, n } = await fixture(page);
  await n.getByRole("heading").click();
  const before = await documentJSON(page),
    geometry = await n.boundingBox();
  await n.getByRole("heading").hover();
  const button = page.getByRole("button", {
    name: "Read object details",
    exact: true,
  });
  // Pure keyboard target navigation and the explicit reader shortcut, without focus injection.
  for (
    let i = 0;
    i < 150 && !(await n.evaluate((el) => el === document.activeElement));
    i++
  )
    await page.keyboard.press("Shift+Tab");
  await expect(n).toBeFocused();
  await page.keyboard.press("F2");
  await expect(dialog(page)).toBeVisible();
  await page.setViewportSize({ width: 620, height: 380 });
  const text = dialog(page).getByRole("region");
  await page.keyboard.press("Control+End");
  await page.keyboard.press("End");
  await expect
    .poll(() =>
      text.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop),
    )
    .toBeLessThanOrEqual(1);
  const facts = await text.evaluate((el) => ({
    width: el.clientWidth,
    scrollWidth: el.scrollWidth,
    height: el.clientHeight,
    scrollHeight: el.scrollHeight,
    text: el.textContent,
  }));
  expect(facts.scrollWidth).toBeLessThanOrEqual(facts.width + 1);
  expect(facts.text).toContain('"committed"');
  await page.screenshot({ path: path.join(out, "debug-details-narrow.png") });
  await page.keyboard.press("Escape");
  await expect(n).toBeFocused();
  await page.setViewportSize({ width: 1440, height: 1000 });
  expect(await n.boundingBox()).toEqual(geometry);
  expect(await documentJSON(page)).toEqual(before);
  save("keyboard-long-details", facts);
});

test("S06 another field draft cannot mask active composition when reading details", async ({
  page,
}) => {
  await enable(page);
  await createNode(page, "Multiply");
  await page
    .locator(".canvas")
    .last()
    .getByRole("heading", { name: "Multiply", exact: true })
    .click();
  const a = page.getByRole("textbox", { name: "A", exact: true }),
    b = page.getByRole("textbox", { name: "B", exact: true });
  await a.fill("7.25");
  await b.fill("2.5");
  await b.dispatchEvent("compositionstart");
  await b.hover();
  await page.keyboard.press("F2");
  await expect(dialog(page)).not.toBeVisible();
  await expect(b).toBeFocused();
  await expect(a).toHaveValue("7.25");
  await expect(b).toHaveValue("2.5");
  await expect(page.locator(".experimental-issue")).toContainText(
    "composition",
  );
  await b.dispatchEvent("compositionend");
  await b.press("Escape");
  await a.press("Escape");
  save("multi-field-composition", {
    method:
      "Real focused draft fields with synthetic composition events; no physical IME qualification",
    modalOpened: false,
    draftsRetained: true,
  });
});

test("S06 saving blocks preference changes without discarding current document", async ({
  page,
}) => {
  await enable(page);
  await fixture(page);
  const before = await documentJSON(page);
  await page.getByText("Experimental features", { exact: true }).click();
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
  await clickAction(page, "Save");
  await expect(page.locator("#save-state")).toHaveText("Saving…");
  await checkbox(page).click();
  await expect(checkbox(page)).toBeChecked();
  await expect(page.locator(".experimental-issue")).toContainText("operation");
  await page.waitForFunction(
    () => typeof (window as any).releaseSave === "function",
  );
  await page.evaluate(() => (window as any).releaseSave());
  await expect(page.locator("#save-state")).not.toHaveText("Saving…");
  expect(await documentJSON(page)).toEqual(before);
  save("busy-guard", {
    delayedStorage: "Injected acknowledgement only",
    preferenceUnchanged: true,
    documentUnchanged: true,
  });
});
test("S06 debug target follows nested occurrence and independent Canvas navigation", async ({
  page,
}) => {
  await enable(page);
  for (const name of ["Float", "Multiply", "Compose"])
    await createNode(page, name);
  // Keep this multi-port fixture clear of the existing output before connecting.
  const composeBox = (await page
    .getByRole("heading", { name: "Compose", exact: true })
    .boundingBox())!;
  await page.mouse.move(composeBox.x + 40, composeBox.y + 10);
  await page.mouse.down();
  await page.mouse.move(composeBox.x + 40, composeBox.y + 235, { steps: 10 });
  await page.mouse.up();
  for (const [a, b] of [
    ["Float output value", "Multiply input a"],
    ["Multiply output result", "Compose input x"],
    ["Compose output result", "Image output input color"],
  ]) {
    await page.getByRole("button", { name: a, exact: true }).click();
    await page.getByRole("button", { name: b, exact: true }).click();
  }
  const first = page.locator(".canvas").first();
  await first.getByRole("heading", { name: "Multiply", exact: true }).click();
  await clickAction(page, "Encapsulate");
  await page.getByText("Local clipboard", { exact: true }).click();
  await page
    .getByRole("button", { name: "Copy selection", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Paste selection", exact: true })
    .click();
  await clickAction(page, "Second Canvas");
  const second = page.locator(".canvas").nth(1);
  await first.locator('article[aria-label="Subgraph"] h3').click();
  await first
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  await second.locator('article[aria-label="Subgraph 2"] h3').click();
  await second
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  const before = await documentJSON(page),
    records = [];
  for (const c of [first, second]) {
    await c.getByRole("heading", { name: "Multiply", exact: true }).hover();
    const text = await read(page);
    expect(text).toContain('"occurrence"');
    records.push(text);
    await close(page);
  }
  expect(records[0]).not.toEqual(records[1]);
  await first.getByRole("button", { name: "Up", exact: true }).click();
  await expect(first).toHaveAttribute("data-path", "");
  await expect(second).toHaveAttribute("data-path", /.+/);
  await expect(dialog(page)).not.toBeVisible();
  expect(await documentJSON(page)).toEqual(before);
  save("nested-occurrences", records);
});
