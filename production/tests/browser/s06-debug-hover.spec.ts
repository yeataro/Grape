import { test, expect, type Page, type Locator } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createNode } from "./create-node.ts";
import { clickAction } from "../fixtures/public-actions.ts";
const out = process.env.GRAPE_EVIDENCE_DIR!;
const save = (n: string, v: unknown) =>
  fs.writeFileSync(
    path.join(out, n + ".json"),
    JSON.stringify(v, null, 2) + "\n",
  );
const dialog = (p: Page) =>
  p.getByRole("dialog", { name: "Object information", exact: true });
async function doc(p: Page) {
  const d = p.waitForEvent("download");
  await clickAction(p, "Export JSON");
  return JSON.parse(fs.readFileSync((await (await d).path())!, "utf8"));
}
async function focus(p: Page, t: Locator) {
  for (let i = 0; i < 180; i++) {
    if (await t.evaluate((e) => e === document.activeElement)) return;
    await p.keyboard.press("Shift+Tab");
  }
  throw Error("Trusted Tab target unavailable");
}
async function read(p: Page, t: Locator) {
  await focus(p, t);
  await p.keyboard.press("F2");
  await expect(dialog(p)).toBeVisible();
  return dialog(p).getByRole("region").innerText();
}
async function close(p: Page, t: Locator) {
  await p.keyboard.press("Escape");
  await expect(dialog(p)).not.toBeVisible();
  await expect(t).toBeFocused();
}
async function fixture(p: Page) {
  await createNode(p, "Color RGBA");
  const c = p.locator(".canvas").last(),
    n = c
      .locator("article.node")
      .filter({
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
test("S06 F2-only all built-in readonly kinds and ordinary hints preserve document selection History Redo", async ({
  page,
}) => {
  const { c, n } = await fixture(page),
    before = await doc(page),
    selection = await c.getAttribute("data-selection"),
    records = [];
  await expect(
    page.getByRole("button", { name: "Read object details", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("checkbox", { name: /Show object information/ }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Experimental features", exact: true }),
  ).toHaveCount(0);
  await expect(
    c.getByRole("button", { name: "Add Node", exact: true }),
  ).toHaveAttribute("title", /Tab/);
  for (const [k, t] of [
    ["Node", n],
    ["Port", n.locator('[data-direction="output"]')],
    ["Edge", c.locator(".wires path").first()],
    ["Panel", c],
    [
      "UI control",
      page.getByRole("button", { name: "Generate GLSL", exact: true }),
    ],
  ] as const) {
    const text = await read(page, t);
    expect(text).toContain(k + ":");
    expect(text).not.toMatch(/editToken|TargetLease|MountTicket|"lease"/);
    if (k === "UI control") expect(text).toContain("未提供");
    records.push({ kind: k, text });
    await close(page, t);
  }
  expect(await c.getAttribute("data-selection")).toBe(selection);
  expect(await doc(page)).toEqual(before);
  await n.getByRole("heading").click();
  const r = page.getByRole("textbox", { name: "R", exact: true });
  const text = await read(page, r);
  expect(text).toContain("Parameter Widget:");
  expect(text).toContain('"committed"');
  await close(page, r);
  await clickAction(page, "Undo");
  const undone = await doc(page);
  await read(page, n);
  await close(page, n);
  await clickAction(page, "Redo");
  expect(await doc(page)).toEqual(before);
  expect(
    undone.graph.stages.find((s: any) => s.key === "pixel").network.edges,
  ).toHaveLength(0);
  save("f2-kinds", records);
});
for (const stored of ["true", "false", "{broken}", "denied"])
  test("S06 F2 ignores obsolete preference " + stored, async ({ page }) => {
    await page.addInitScript((value) => {
      localStorage.setItem("other-app", "retain");
      localStorage.setItem("grape.preferences.hover.v1", value);
      (window as any).__preferenceCalls = [];
      for (const method of ["getItem", "setItem", "removeItem"] as const) {
        const original = Storage.prototype[method];
        (Storage.prototype as any)[method] = function (
          k: string,
          ...args: any[]
        ) {
          if (k === "grape.preferences.hover.v1") {
            (window as any).__preferenceCalls.push(method);
            if (value === "denied")
              throw new DOMException("Denied", "SecurityError");
          }
          return (original as any).call(this, k, ...args);
        };
      }
    }, stored);
    await page.reload();
    const button = page.getByRole("button", {
      name: "Generate GLSL",
      exact: true,
    });
    expect(await read(page, button)).toContain("UI control: Generate GLSL");
    await close(page, button);
    expect(
      await page.evaluate(() => (window as any).__preferenceCalls),
    ).toEqual([]);
    expect(await page.evaluate(() => localStorage.getItem("other-app"))).toBe(
      "retain",
    );
    save("ignored-pref-" + stored.replace(/\W/g, ""), {
      stored,
      inspectionStorageCalls: 0,
    });
  });
test("S06 F2 scalar vector draft and multifield IME guards preserve current text", async ({
  page,
}) => {
  await createNode(page, "Multiply");
  await page.getByRole("heading", { name: "Multiply", exact: true }).click();
  const before = await doc(page),
    a = page.getByRole("textbox", { name: "A", exact: true }),
    b = page.getByRole("textbox", { name: "B", exact: true });
  await a.fill("7.25");
  await b.fill("2.5");
  await b.dispatchEvent("compositionstart");
  await page.keyboard.press("F2");
  await expect(dialog(page)).not.toBeVisible();
  await expect(b).toBeFocused();
  await expect(a).toHaveValue("7.25");
  await b.dispatchEvent("compositionend");
  const scalar = await read(page, a);
  expect(scalar).toContain('"text": "7.25"');
  expect(scalar).toContain('"value": 1');
  await close(page, a);
  await a.press("Escape");
  await b.press("Escape");
  expect(await doc(page)).toEqual(before);
  await createNode(page, "Color RGBA");
  await page.getByRole("heading", { name: "Color RGBA", exact: true }).click();
  const r = page.getByRole("textbox", { name: "R", exact: true });
  await r.fill("0.37");
  const vector = await read(page, r);
  expect(vector).toContain('"componentTexts"');
  expect(vector).toContain("0.37");
  await close(page, r);
  await r.press("Escape");
  save("f2-drafts", {
    scalar,
    vector,
    IME: "Synthetic composition boundary; actual typing/keyboard/focus. Not physical IME qualification.",
  });
});
test("S06 F2 stage deletion Undo same-ID document reopen discards old target", async ({
  page,
}) => {
  const { c, n } = await fixture(page),
    original = await doc(page),
    id = await n.getAttribute("data-node");
  expect(await read(page, n)).toContain(id!);
  await close(page, n);
  await c.getByRole("button", { name: "Vertex", exact: true }).click();
  await expect(n).toHaveCount(0);
  await page.keyboard.press("F2");
  await expect(dialog(page)).not.toContainText(id!);
  if (await dialog(page).isVisible()) await page.keyboard.press("Escape");
  await c.getByRole("button", { name: "Pixel", exact: true }).click();
  await n.getByRole("heading").click();
  await clickAction(page, "Delete selected");
  await expect(n).toHaveCount(0);
  await clickAction(page, "Undo");
  const old = await n.elementHandle();
  await page
    .getByLabel("Open document file")
    .setInputFiles({
      name: "same-id.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(original)),
    });
  await page
    .getByRole("button", { name: "Open in new session", exact: true })
    .click();
  expect(await old!.evaluate((e) => e.isConnected)).toBe(false);
  const fresh = page.locator('article[data-node="' + id + '"]');
  expect(await read(page, fresh)).toContain(id!);
  await close(page, fresh);
  expect(await doc(page)).toEqual(original);
  save("f2-public-lifetime", {
    id,
    newLoad: true,
    oldElementDisconnected: true,
  });
});
test("S06 F2 pending wire held drag readonly and natural Escape remain guarded", async ({
  page,
}) => {
  const { n } = await fixture(page),
    before = await doc(page);
  await n.locator('[data-direction="output"]').click();
  await page.keyboard.press("F2");
  await expect(dialog(page)).not.toBeVisible();
  await page.keyboard.press("Escape");
  await clickAction(page, "Lock editing");
  expect(await read(page, n)).toContain("Node:");
  await close(page, n);
  await n.getByRole("heading").click();
  const r = page.getByRole("textbox", { name: "R", exact: true });
  expect(await read(page, r)).toContain("Read-only");
  await close(page, r);
  await clickAction(page, "Lock editing");
  const b = (await n.getByRole("heading").boundingBox())!;
  await page.mouse.move(b.x + 20, b.y + 10);
  await page.mouse.down();
  await page.mouse.move(b.x + 60, b.y + 40, { steps: 5 });
  await page.keyboard.press("F2");
  await expect(dialog(page)).not.toBeVisible();
  await page.keyboard.press("Escape");
  await page.mouse.up();
  expect(await doc(page)).toEqual(before);
  save("f2-gesture", {
    pendingBlocked: true,
    heldMouseBlocked: true,
    readonlyReadable: true,
    naturalEscape: true,
  });
});
test("S06 F2 no inspection serialization or clone during 80 trusted pointer moves or focus navigation", async ({
  page,
}) => {
  const { n } = await fixture(page);
  await focus(page, n);
  await page.evaluate(() => {
    const c = structuredClone,
      s = JSON.stringify;
    (window as any).__counts = { clone: 0, stringify: 0 };
    window.structuredClone = (...a) => {
      (window as any).__counts.clone++;
      return c(...a);
    };
    JSON.stringify = ((...a: any[]) => {
      (window as any).__counts.stringify++;
      return (s as any)(...a);
    }) as typeof JSON.stringify;
  });
  const b = (await n.boundingBox())!;
  for (let i = 0; i < 80; i++)
    await page.mouse.move(b.x + 20 + (i % 50), b.y + 15);
  expect(await page.evaluate(() => (window as any).__counts)).toEqual({
    clone: 0,
    stringify: 0,
  });
  await page.keyboard.press("F2");
  await expect(dialog(page)).toBeVisible();
  const counts = await page.evaluate(() => (window as any).__counts);
  expect(counts.stringify).toBe(1);
  save("f2-on-demand-counts", {
    moves: 80,
    before: { clone: 0, stringify: 0 },
    after: counts,
    limits:
      "Instrumented disposable browser, not universal performance guarantee.",
  });
});
test("S06 F2 complete long data narrow keyboard close and unchanged geometry", async ({
  page,
}) => {
  const { n } = await fixture(page),
    before = await doc(page),
    bounds = await n.boundingBox();
  await read(page, n);
  await page.setViewportSize({ width: 620, height: 380 });
  const text = dialog(page).getByRole("region");
  await page.keyboard.press("Control+End");
  await page.keyboard.press("End");
  await expect
    .poll(() =>
      text.evaluate((e) => e.scrollHeight - e.clientHeight - e.scrollTop),
    )
    .toBeLessThanOrEqual(1);
  const facts = await text.evaluate((e) => ({
    width: e.clientWidth,
    scrollWidth: e.scrollWidth,
    height: e.clientHeight,
    scrollHeight: e.scrollHeight,
    text: e.textContent,
  }));
  expect(facts.scrollWidth).toBeLessThanOrEqual(facts.width + 1);
  await page.screenshot({ path: path.join(out, "f2-narrow.png") });
  await close(page, n);
  await page.setViewportSize({ width: 1440, height: 1000 });
  expect(await n.boundingBox()).toEqual(bounds);
  expect(await doc(page)).toEqual(before);
  save("f2-long-data", facts);
});
test("S06 F2 busy Save acknowledgement does not intercept or corrupt save", async ({
  page,
}) => {
  await fixture(page);
  const before = await doc(page);
  await page.evaluate(() => {
    const d = Object.getOwnPropertyDescriptor(
      IDBTransaction.prototype,
      "oncomplete",
    )!;
    Object.defineProperty(IDBTransaction.prototype, "oncomplete", {
      ...d,
      set(handler) {
        d.set!.call(this, function (this: IDBTransaction, event: Event) {
          (window as any).releaseSave = () => handler.call(this, event);
        });
      },
    });
  });
  await clickAction(page, "Save");
  await expect(page.locator("#save-state")).toHaveText("Saving…");
  await page.keyboard.press("F2");
  await expect(dialog(page)).not.toBeVisible();
  await page.waitForFunction(
    () => typeof (window as any).releaseSave === "function",
  );
  await page.evaluate(() => (window as any).releaseSave());
  await expect(page.locator("#save-state")).not.toHaveText("Saving…");
  expect(await doc(page)).toEqual(before);
  save("f2-save-ack", {
    injectedStorageDelay: true,
    F2Blocked: true,
    saveCompleted: true,
  });
});

test("S06 debug target follows nested occurrence and independent Canvas navigation", async ({
  page,
}) => {
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
  const before = await doc(page),
    records = [];
  for (const c of [first, second]) {
    const target = c
      .locator("article")
      .filter({
        has: page.getByRole("heading", { name: "Multiply", exact: true }),
      });
    const text = await read(page, target);
    expect(text).toContain('"occurrence"');
    records.push(text);
    await close(page, target);
  }
  expect(records[0]).not.toEqual(records[1]);
  await first.getByRole("button", { name: "Up", exact: true }).click();
  await expect(first).toHaveAttribute("data-path", "");
  await expect(second).toHaveAttribute("data-path", /.+/);
  await expect(dialog(page)).not.toBeVisible();
  expect(await doc(page)).toEqual(before);
  save("nested-occurrences", records);
});
