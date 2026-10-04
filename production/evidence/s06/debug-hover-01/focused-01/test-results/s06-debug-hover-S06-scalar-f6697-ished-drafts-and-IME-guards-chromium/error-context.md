# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-debug-hover.spec.ts >> S06 scalar and vector committed values stay distinct from unfinished drafts and IME guards
- Location: ..\..\..\production\tests\browser\s06-debug-hover.spec.ts:35:1

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  getByRole('textbox', { name: 'A', exact: true })
Expected: focused
Received: inactive
Timeout:  5000ms

Call log:
  - Expect "toBeFocused" with timeout 5000ms
  - waiting for getByRole('textbox', { name: 'A', exact: true })
    14 × locator resolved to <input type="text" aria-label="A" data-draft="true" data-parameter="a" inputmode="decimal" data-composing="false"/>
       - unexpected value "inactive"

```

```yaml
- textbox "A": "7.25"
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import fs from "node:fs"; import path from "node:path";
  3   | import { createNode } from "./create-node.ts"; import { clickAction } from "../fixtures/public-actions.ts";
  4   | const out = process.env.GRAPE_EVIDENCE_DIR!;
  5   | const save = (name: string, data: unknown) => fs.writeFileSync(path.join(out, name + ".json"), JSON.stringify(data, null, 2) + "\n");
  6   | const dialog = (p: Page) => p.getByRole("dialog", { name: "Object information", exact: true });
  7   | const checkbox = (p: Page) => p.getByRole("checkbox", { name: "Show object information instead of normal hover hints" });
  8   | async function enable(p: Page) { await p.getByText("Experimental features", { exact: true }).click(); await checkbox(p).check(); await p.keyboard.press("Escape"); }
  9   | async function documentJSON(p: Page) { const wait = p.waitForEvent("download"); await clickAction(p, "Export JSON"); return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8")); }
  10  | async function read(p: Page) { await p.getByRole("button", { name: "Read object details", exact: true }).click(); await expect(dialog(p)).toBeVisible(); return dialog(p).getByRole("region").innerText(); }
  11  | async function close(p: Page) { await p.keyboard.press("Escape"); await expect(dialog(p)).not.toBeVisible(); await expect(p.getByRole("button", { name: "Read object details", exact: true })).toBeFocused(); }
  12  | async function fixture(p: Page) { await createNode(p, "Color RGBA"); const c = p.locator(".canvas").last(), n = c.locator("article.node").filter({ has: p.getByRole("heading", { name: "Color RGBA", exact: true }) }); await n.locator('[data-direction="output"]').click(); await c.locator('[data-direction="input"][data-port="color"]').click(); return { c, n }; }
  13  | test.beforeEach(async ({ page }) => { page.on("dialog", d => d.accept()); await page.goto("/"); });
  14  | 
  15  | test("S06 normal debug normal checkbox preserves graph history selection and covers built-in objects", async ({ page }) => {
  16  |   const { c, n } = await fixture(page), before = await documentJSON(page), selection = await c.getAttribute("data-selection");
  17  |   await n.getByRole("heading").hover(); await expect(page.locator(".hover-summary")).toBeEmpty();
  18  |   await enable(page); const records = [];
  19  |   for (const [kind, target] of [["Node", n.getByRole("heading")], ["Port", n.locator('[data-direction="output"]')], ["Edge", c.locator(".wires path")], ["Panel", page.locator(".inspector h2")], ["UI control", page.getByRole("button", { name: "Generate GLSL", exact: true })]] as const) {
  20  |     await target.hover(); await expect(page.locator(".hover-summary")).toContainText(kind);
  21  |     const details = await read(page); expect(details).toContain(kind + ":"); expect(details).not.toMatch(/editToken|generation|TargetLease|MountTicket|"lease"/);
  22  |     if (kind === "UI control") expect(details).toContain("未提供");
  23  |     records.push({ kind, details }); await close(page);
  24  |   }
  25  |   expect(await c.getAttribute("data-selection")).toBe(selection); expect(await documentJSON(page)).toEqual(before);
  26  |   await n.getByRole("heading").click(); const value = page.getByRole("textbox", { name: "R", exact: true }); await value.hover();
  27  |   const widget = await read(page); expect(widget).toContain("Parameter Widget"); expect(widget).toContain('"committed"'); records.push({ kind: "Parameter Widget", details: widget }); await close(page);
  28  |   await page.getByText("Experimental features", { exact: true }).click(); await checkbox(page).uncheck(); await page.keyboard.press("Escape");
  29  |   await n.getByRole("heading").hover(); await expect(page.locator(".hover-summary")).toBeEmpty();
  30  |   expect(await documentJSON(page)).toEqual(before); await clickAction(page, "Undo"); expect((await documentJSON(page)).graph.stages.find((s: any) => s.key === "pixel").network.edges).toHaveLength(0);
  31  |   await clickAction(page, "Redo"); expect(await documentJSON(page)).toEqual(before);
  32  |   save("built-in-objects", records); await page.screenshot({ path: path.join(out, "normal-restored.png") });
  33  | });
  34  | 
  35  | test("S06 scalar and vector committed values stay distinct from unfinished drafts and IME guards", async ({ page }) => {
  36  |   await enable(page); await createNode(page, "Multiply"); const c = page.locator(".canvas").last(); await c.getByRole("heading", { name: "Multiply", exact: true }).click();
  37  |   await page.getByText("Experimental features", { exact: true }).click(); const input = page.getByRole("textbox", { name: "A", exact: true }), before = await documentJSON(page);
  38  |   await input.fill("7.25"); await input.hover(); const text = await read(page); expect(text).toContain('"value": 1'); expect(text).toContain('"text": "7.25"'); await close(page);
  39  |   // Refusal is tested through an actual click, not a check() retry that hides rejection.
> 40  |   await page.getByText("Experimental features", { exact: true }).click(); await input.click(); await checkbox(page).click(); await expect(checkbox(page)).toBeChecked(); await expect(input).toHaveValue("7.25"); await expect(input).toBeFocused();
      |                                                                                                                                                                                                                                       ^ Error: expect(locator).toBeFocused() failed
  41  |   await input.dispatchEvent("compositionstart"); await checkbox(page).click(); await expect(input).toBeFocused(); await expect(page.locator(".experimental-issue")).toContainText("composition");
  42  |   await input.dispatchEvent("compositionend"); await input.press("Escape"); await expect(input).toHaveValue("1"); expect(await documentJSON(page)).toEqual(before);
  43  |   await page.getByText("Experimental features", { exact: true }).click(); await createNode(page, "Color RGBA"); await c.getByRole("heading", { name: "Color RGBA", exact: true }).click();
  44  |   const r = page.getByRole("textbox", { name: "R", exact: true }); await r.fill("0.37"); await r.hover(); const vector = await read(page); expect(vector).toContain('"componentTexts"'); expect(vector).toContain('"0.37"'); await close(page); await r.press("Escape");
  45  |   save("drafts", { scalar: text, vector, composition: "Synthetic composition boundary events; actual typing/focus/click refusal. No physical IME qualification." });
  46  | });
  47  | 
  48  | test("S06 hover detail invalidation follows selection stage deletion Undo and same-ID reopen", async ({ page }) => {
  49  |   await enable(page); const { c, n } = await fixture(page), original = await documentJSON(page), id = await n.getAttribute("data-node");
  50  |   await n.getByRole("heading").hover(); expect(await read(page)).toContain(id!); await close(page);
  51  |   await c.getByRole("button", { name: "Vertex", exact: true }).click(); await expect(page.getByRole("button", { name: "Read object details", exact: true })).toBeDisabled();
  52  |   await c.getByRole("button", { name: "Pixel", exact: true }).click(); await n.getByRole("heading").click(); await clickAction(page, "Delete selected"); await expect(n).toHaveCount(0);
  53  |   await expect(page.locator(".hover-summary")).toBeEmpty(); await clickAction(page, "Undo"); await expect(n).toHaveCount(1);
  54  |   const old = await n.elementHandle();
  55  |   await page.getByLabel("Open document file").setInputFiles({ name: "same-id.grape.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(original)) });
  56  |   await page.getByRole("button", { name: "Open in new session", exact: true }).click(); expect(await old!.evaluate(e => e.isConnected)).toBe(false);
  57  |   await expect(page.locator(".hover-summary")).toBeEmpty(); const fresh = page.locator(`article[data-node="${id}"]`); await fresh.getByRole("heading").hover(); expect(await read(page)).toContain(id!); await close(page); expect(await documentJSON(page)).toEqual(original);
  58  |   save("lifetime-public", { id, samePersistentIdDifferentMount: true, stageDeletionUndoReopen: "passed" });
  59  | });
  60  | 
  61  | test("S06 pending connection and held gesture reject preference changes while readonly inspection remains", async ({ page }) => {
  62  |   await enable(page); const { c, n } = await fixture(page), before = await documentJSON(page);
  63  |   await page.getByText("Experimental features", { exact: true }).click(); await n.locator('[data-direction="output"]').click(); await checkbox(page).click(); await expect(checkbox(page)).toBeChecked(); await expect(page.locator(".experimental-issue")).toContainText("connection");
  64  |   await page.keyboard.press("Escape"); await page.getByText("Experimental features", { exact: true }).click();
  65  |   await clickAction(page, "Lock editing"); await n.getByRole("heading").hover(); expect(await read(page)).toContain("Node:"); await close(page); expect(await documentJSON(page)).toEqual(before);
  66  |   await clickAction(page, "Lock editing"); await n.getByRole("heading").click(); const b = (await n.getByRole("heading").boundingBox())!;
  67  |   await page.mouse.move(b.x + 20, b.y + 10); await page.mouse.down(); await page.mouse.move(b.x + 60, b.y + 40, { steps: 5 }); await page.keyboard.press("Escape"); await page.mouse.up(); expect(await documentJSON(page)).toEqual(before);
  68  | });
  69  | 
  70  | for (const bad of ["malformed", "denied"]) test(`S06 preference ${bad} visibly falls back without touching other keys`, async ({ page }) => {
  71  |   await page.addInitScript(mode => { localStorage.setItem("other-app", "retain"); if (mode === "malformed") localStorage.setItem("grape.preferences.hover.v1", "{broken}"); else { const original = Storage.prototype.setItem; Storage.prototype.setItem = function(k, v) { if (k === "grape.preferences.hover.v1") throw new DOMException("Denied", "SecurityError"); return original.call(this, k, v); }; } }, bad);
  72  |   await page.reload(); await page.getByText("Experimental features", { exact: true }).click(); await expect(checkbox(page)).not.toBeChecked();
  73  |   if (bad === "malformed") await expect(page.locator(".experimental-issue")).toContainText("invalid");
  74  |   else { await checkbox(page).click(); await expect(checkbox(page)).not.toBeChecked(); await expect(page.locator(".experimental-issue")).toContainText("could not be saved"); }
  75  |   expect(await page.evaluate(() => localStorage.getItem("other-app"))).toBe("retain"); save("preference-" + bad, { issue: await page.locator(".experimental-issue").innerText(), current: await page.evaluate(() => localStorage.getItem("grape.preferences.hover.v1")) });
  76  | });
  77  | 
  78  | test("S06 diagnostic preference persists separately and rapid hover performs no per-move capture or serialization", async ({ page }) => {
  79  |   await enable(page); await page.reload(); await page.getByText("Experimental features", { exact: true }).click(); await expect(checkbox(page)).toBeChecked(); await page.keyboard.press("Escape");
  80  |   const { c, n } = await fixture(page), before = await documentJSON(page), selection = await c.getAttribute("data-selection");
  81  |   await page.evaluate(() => { const clone = window.structuredClone, stringify = JSON.stringify; (window as any).__hoverCounts = { clone: 0, stringify: 0 }; window.structuredClone = (...args) => { (window as any).__hoverCounts.clone++; return clone(...args); }; JSON.stringify = ((...args: any[]) => { (window as any).__hoverCounts.stringify++; return (stringify as any)(...args); }) as typeof JSON.stringify; });
  82  |   await n.getByRole("heading").hover(); await page.evaluate(() => { (window as any).__hoverCounts = { clone: 0, stringify: 0 }; });
  83  |   const b = (await n.getByRole("heading").boundingBox())!;
  84  |   for (let i = 0; i < 80; i++) await page.mouse.move(b.x + 10 + i % 30, b.y + 10);
  85  |   const counts = await page.evaluate(() => (window as any).__hoverCounts); expect(counts).toEqual({ clone: 0, stringify: 0 }); expect(await c.getAttribute("data-selection")).toBe(selection); expect(await documentJSON(page)).toEqual(before);
  86  |   save("rapid-hover-counts", { moves: 80, counts, methodology: "Browser-wide structuredClone and JSON.stringify counters after entry, actual trusted mouse movement within one current target; instrumentation only in disposable context. This is not a general performance/FPS claim." });
  87  | });
  88  | 
  89  | test("S06 keyboard details and bounded long owner data are readable without selection layout changes", async ({ page }) => {
  90  |   await enable(page); const { c, n } = await fixture(page); await n.getByRole("heading").click();
  91  |   await page.getByRole("button", { name: "Rename node", exact: true }).click(); // beforeEach accepts default; no fabricated long private data
  92  |   const before = await documentJSON(page), geometry = await n.boundingBox(); await n.getByRole("heading").hover();
  93  |   const button = page.getByRole("button", { name: "Read object details", exact: true });
  94  |   // Keyboard entry remains explicit: preserve focus on the reader while pointer chooses the target.
  95  |   for (let i = 0; i < 150 && !(await button.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press("Shift+Tab");
  96  |   await n.getByRole("heading").hover(); await expect(button).toBeFocused(); await page.keyboard.press("Enter"); await expect(dialog(page)).toBeVisible();
  97  |   await page.setViewportSize({ width: 620, height: 380 }); const text = dialog(page).getByRole("region"); await page.keyboard.press("Control+End"); await page.keyboard.press("End");
  98  |   const facts = await text.evaluate(el => ({ width: el.clientWidth, scrollWidth: el.scrollWidth, height: el.clientHeight, scrollHeight: el.scrollHeight, text: el.textContent })); expect(facts.scrollWidth).toBeLessThanOrEqual(facts.width + 1); expect(facts.text).toContain('"committed"');
  99  |   await page.screenshot({ path: path.join(out, "debug-details-narrow.png") }); await close(page); await page.setViewportSize({ width: 1440, height: 1000 }); expect(await n.boundingBox()).toEqual(geometry); expect(await documentJSON(page)).toEqual(before); save("keyboard-long-details", facts);
  100 | });
  101 | 
```