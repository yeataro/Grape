# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-status-pointer.spec.ts >> S06 complete persistent loss details have a keyboard read path at 620
- Location: ..\..\..\production\tests\browser\s06-status-pointer.spec.ts:34:34

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  locator('.canvas').first().getByRole('button', { name: 'Read full Canvas status', exact: true })
Expected: focused
Received: inactive
Timeout:  5000ms

Call log:
  - Expect "toBeFocused" with timeout 5000ms
  - waiting for locator('.canvas').first().getByRole('button', { name: 'Read full Canvas status', exact: true })
    14 × locator resolved to <button type="button" aria-haspopup="dialog" aria-label="Read full Canvas status">Function mode of definition id-22 makes this rece…</button>
       - unexpected value "inactive"

```

```yaml
- button "Read full Canvas status": Function mode of definition id-22 makes this receiving input nonconstant. Receiver id-38/value; edge id-39. Function mode of definition id-22 makes this receiving input nonconstant. Receiver id-40/value; edge id-41. Function mode of definition id-22 makes this receiving input nonconstant. Receiver id-42/value; edge id-43. Function mode of definition id-22 makes this receiving input nonconstant. Receiver id-44/value; edge id-45.
```

# Test source

```ts
  1   | import { test, expect, type Page, type Locator } from "@playwright/test";
  2   | import fs from "node:fs";
  3   | import path from "node:path";
  4   | import { fileURLToPath } from "node:url";
  5   | import { createNode } from "./create-node.ts";
  6   | import { clickAction } from "../fixtures/public-actions.ts";
  7   | const evidence = process.env.GRAPE_EVIDENCE_DIR!;
  8   | const save = (name: string, value: unknown) => fs.writeFileSync(path.join(evidence, name + ".json"), JSON.stringify(value, null, 2) + "\n");
  9   | async function doc(page: Page) {
  10  |   const wait = page.waitForEvent("download");
  11  |   await clickAction(page, "Export JSON");
  12  |   return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8"));
  13  | }
  14  | async function center(l: Locator) { const r = (await l.boundingBox())!; return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }
  15  | async function color(page: Page) {
  16  |   await createNode(page, "Color RGBA");
  17  |   const c = page.locator(".canvas").last();
  18  |   return { c, out: c.locator('[data-direction="output"][data-port="out"]'), input: c.locator('[data-direction="input"][data-port="color"]') };
  19  | }
  20  | async function preview(c: Locator) {
  21  |   return c.evaluate(el => ({ paths: el.querySelectorAll(".connection-preview path").length, rings: el.querySelectorAll(".connection-preview circle").length, d: el.querySelector(".connection-preview path")?.getAttribute("d"), notice: el.querySelector(".canvas-notice")!.textContent }));
  22  | }
  23  | test.beforeEach(async ({ page }) => {
  24  |   page.on("dialog", d => d.accept());
  25  |   await page.addInitScript(() => {
  26  |     (window as any).__statusPointerEvents = [];
  27  |     for (const type of ["pointerdown", "pointermove", "pointerup", "pointercancel", "click", "keydown", "keyup"])
  28  |       document.addEventListener(type, e => { const p = e as PointerEvent, k = e as KeyboardEvent; (window as any).__statusPointerEvents.push({ type, trusted: e.isTrusted, target: (e.target as HTMLElement)?.className, port: (e.target as HTMLElement)?.dataset?.port, pointerId: p.pointerId, buttons: p.buttons, x: p.clientX, y: p.clientY, detail: p.detail, key: k.key }); }, true);
  29  |   });
  30  |   await page.goto("/");
  31  | });
  32  | test.afterEach(async ({ page }, info) => { save(info.title.replace(/[^a-zA-Z0-9]+/g, "-") + "-events", await page.evaluate(() => (window as any).__statusPointerEvents)); });
  33  | 
  34  | for (const width of [620, 1440]) test(`S06 complete persistent loss details have a keyboard read path at ${width}`, async ({ page }) => {
  35  |   await page.setViewportSize({ width, height: 1000 });
  36  |   const fixture = fileURLToPath(new URL(`../../evidence/s06/review-03/independent-review/reviewer-public-03/persistent-loss-readability-${width}-fixture.grape.json`, import.meta.url));
  37  |   await page.getByLabel("Open document file").setInputFiles(fixture);
  38  |   await page.getByRole("button", { name: "Open in new session", exact: true }).click();
  39  |   const c = page.locator(".canvas").first();
  40  |   await c.getByRole("heading", { name: "Shared arithmetic", exact: true }).last().click();
  41  |   await c.getByRole("button", { name: "Enter subgraph", exact: true }).click();
  42  |   await c.getByText("Subgraph interface", { exact: true }).click();
  43  |   const before = await doc(page);
  44  |   await c.getByLabel("Subgraph emission mode").selectOption("function");
  45  |   const after = await doc(page), losses = after.graph.losses.filter((l: any) => l.code === "FUNCTION_CONSTANT_DETACHED");
  46  |   expect(losses).toHaveLength(width === 620 ? 4 : 10);
  47  |   const notice = c.locator(".canvas-notice"), facts = await notice.evaluate(el => ({ text: el.textContent, clientHeight: el.clientHeight, scrollHeight: el.scrollHeight, overflow: getComputedStyle(el).overflow, pointerEvents: getComputedStyle(el).pointerEvents }));
  48  |   save(`loss-${width}-compact`, { facts, losses });
  49  |   await page.screenshot({ path: path.join(evidence, `loss-${width}-compact.png`) });
  50  |   expect(facts.clientHeight).toBeLessThanOrEqual(60);
  51  |   const read = c.getByRole("button", { name: "Read full Canvas status", exact: true });
  52  |   if (!(await read.isVisible())) expect(facts.scrollHeight).toBeLessThanOrEqual(facts.clientHeight);
  53  |   // Reach the actual control using keyboard navigation, without programmatic focus.
  54  |   for (let i = 0; i < 100 && !(await read.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press("Tab");
> 55  |   await expect(read).toBeFocused();
      |                      ^ Error: expect(locator).toBeFocused() failed
  56  |   await page.keyboard.press("Enter");
  57  |   const dialog = page.getByRole("dialog", { name: "Canvas status details", exact: true }), text = dialog.getByRole("region", { name: "Full current Canvas status", exact: true });
  58  |   await expect(dialog).toBeVisible();
  59  |   await expect(text).toBeFocused();
  60  |   for (const loss of losses) { await expect(text).toContainText(loss.payload.edge.id); await expect(text).toContainText(`${loss.payload.edge.to.nodeId}/${loss.payload.edge.to.portKey}`); }
  61  |   const full = await text.innerText();
  62  |   await page.keyboard.press("Control+End");
  63  |   await page.keyboard.press("End");
  64  |   const end = await text.evaluate(el => ({ clientHeight: el.clientHeight, scrollHeight: el.scrollHeight, scrollTop: el.scrollTop, clientWidth: el.clientWidth, scrollWidth: el.scrollWidth }));
  65  |   expect(end.scrollWidth).toBeLessThanOrEqual(end.clientWidth + 1);
  66  |   expect(end.scrollTop + end.clientHeight).toBeGreaterThanOrEqual(end.scrollHeight - 1);
  67  |   save(`loss-${width}-full`, { full, end });
  68  |   await page.screenshot({ path: path.join(evidence, `loss-${width}-full.png`) });
  69  |   await page.keyboard.press("Tab");
  70  |   await expect(dialog.getByRole("button", { name: "Close status details", exact: true })).toBeFocused();
  71  |   await page.keyboard.press("Tab");
  72  |   await expect(text).toBeFocused();
  73  |   await page.keyboard.press("Escape");
  74  |   await expect(dialog).not.toBeVisible();
  75  |   await expect(read).toBeFocused();
  76  |   await clickAction(page, "Save");
  77  |   await expect(notice).toHaveText(facts.text!);
  78  |   await clickAction(page, "Undo");
  79  |   expect((await doc(page)).graph).toEqual(before.graph);
  80  |   await clickAction(page, "Redo");
  81  |   expect((await doc(page)).graph).toEqual(after.graph);
  82  |   await read.click();
  83  |   await expect(text).toHaveText(full);
  84  |   await dialog.getByRole("button", { name: "Close status details", exact: true }).click();
  85  |   expect((await doc(page)).graph).toEqual(after.graph);
  86  | });
  87  | 
  88  | test("S06 actual 3px uncaptured port release across Canvas Inspector retires wire and ring", async ({ page }) => {
  89  |   await page.setViewportSize({ width: 1440, height: 1000 });
  90  |   const { c, out } = await color(page), before = await doc(page), cr = (await c.boundingBox())!;
  91  |   const initial = await center(out.locator(".socket")), delta = cr.x + cr.width - 1.5 - initial.x;
  92  |   await page.mouse.move(cr.x + 20, cr.y + 150); await page.mouse.down();
  93  |   await page.mouse.move(cr.x + 20 + delta, cr.y + 150, { steps: 12 }); await page.mouse.up();
  94  |   const a = await center(out.locator(".socket"));
  95  |   expect(a.x).toBeGreaterThan(cr.x + cr.width - 3); expect(a.x).toBeLessThan(cr.x + cr.width);
  96  |   await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(a.x + 3, a.y, { steps: 6 });
  97  |   const during = await preview(c); await page.mouse.up(); const released = await preview(c);
  98  |   await page.mouse.move(cr.x + 900, a.y, { steps: 5 }); const returned = await preview(c);
  99  |   save("tiny-cross-boundary", { start: a, release: { x: a.x + 3, y: a.y }, canvas: cr, during, released, returned });
  100 |   await page.screenshot({ path: path.join(evidence, "tiny-cross-boundary.png") });
  101 |   expect(released.paths).toBe(0); expect(released.rings).toBe(0); expect(returned.paths).toBe(0); expect(returned.rings).toBe(0);
  102 |   expect(await doc(page)).toEqual(before);
  103 |   await clickAction(page, "Undo"); await expect(c.getByRole("heading", { name: "Color RGBA", exact: true })).toHaveCount(0);
  104 | });
  105 | 
  106 | for (const key of ["Enter", "Space"]) test(`S06 trusted ${key} socket activation waits for real pointer and preserves keyboard connection`, async ({ page }) => {
  107 |   const { c, out, input } = await color(page), before = await doc(page);
  108 |   await out.click(); await page.keyboard.press("Escape"); await expect(out).toBeFocused();
  109 |   await page.keyboard.press(key);
  110 |   const pending = await preview(c), cr = (await c.boundingBox())!;
  111 |   save(`keyboard-${key}`, { pending, canvas: cr });
  112 |   await expect(c.locator(".canvas-notice")).toContainText("opposite port");
  113 |   if (pending.d) expect(pending.d).not.toMatch(new RegExp(`,0 ${-cr.y}$`));
  114 |   expect(pending.paths).toBe(0);
  115 |   await page.mouse.move(cr.x + 450, cr.y + 180, { steps: 5 });
  116 |   await expect(c.locator(".connection-preview path")).toHaveCount(1);
  117 |   await page.keyboard.press("Escape"); await expect(c.locator(".connection-preview path")).toHaveCount(0);
  118 |   expect(await doc(page)).toEqual(before);
  119 |   await out.click(); await page.keyboard.press("Escape"); await page.keyboard.press(key);
  120 |   for (let i = 0; i < 100 && !(await input.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press("Tab");
  121 |   await expect(input).toBeFocused(); await page.keyboard.press(key);
  122 |   await expect(c.locator(".canvas-notice")).toBeEmpty();
  123 |   const after = await doc(page); expect(after.graph.stages.find((s: any) => s.key === "pixel").network.edges).toHaveLength(1);
  124 |   await clickAction(page, "Undo"); expect(await doc(page)).toEqual(before);
  125 |   await clickAction(page, "Redo"); expect(await doc(page)).toEqual(after);
  126 | });
  127 | 
```