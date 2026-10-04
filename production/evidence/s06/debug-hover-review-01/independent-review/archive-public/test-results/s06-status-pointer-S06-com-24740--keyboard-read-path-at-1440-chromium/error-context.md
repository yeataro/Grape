# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-status-pointer.spec.ts >> S06 complete persistent loss details have a keyboard read path at 1440
- Location: ..\runtime\production\tests\browser\s06-status-pointer.spec.ts:34:34

# Error details

```
Error: ENOENT: no such file or directory, stat 'C:\Users\user\.codex\worktrees\s06-debug-hover-review-01\Grape\.verification\s06-debug-hover-review-01\runtime\production\evidence\s06\review-03\independent-review\reviewer-public-03\persistent-loss-readability-1440-fixture.grape.json'
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - text: Grape
      - generic [ref=e9]: SHADER WORKSPACE
      - generic "Implementation 5df6eaa8a009926c897d6a3542231aa729666a15" [ref=e10]: S06-debug-5df6eaa
      - button "本輪更新" [ref=e11] [cursor=pointer]
    - navigation "Document actions" [ref=e12]:
      - generic [ref=e13]:
        - button "New document" [ref=e14] [cursor=pointer]
        - button "Save" [ref=e17] [cursor=pointer]
        - button "Open saved" [ref=e20] [cursor=pointer]
        - button "Export JSON" [ref=e23] [cursor=pointer]
        - button "Export PNG" [ref=e26] [cursor=pointer]
        - button "Open file" [ref=e29] [cursor=pointer]
      - generic [ref=e32]:
        - button "Generate GLSL" [ref=e33] [cursor=pointer]
        - button "Second Canvas" [ref=e36] [cursor=pointer]
        - button "Lock editing" [ref=e39] [cursor=pointer]
      - group [ref=e42]:
        - generic "More actions" [ref=e43] [cursor=pointer]
    - generic [ref=e45]:
      - generic [ref=e46]: Unsaved changes
      - generic [ref=e47]: Host-free
  - generic [ref=e49]:
    - button "Undo" [disabled] [ref=e50]
    - button "Redo" [disabled] [ref=e53]
    - button "Delete selected" [ref=e56] [cursor=pointer]
    - alert
  - main [ref=e57]:
    - generic [ref=e59]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e60]:
        - group "Image output" [ref=e61]:
          - heading "Image output" [level=3] [ref=e62]
          - generic [ref=e63]:
            - button "Image output input color" [ref=e64] [cursor=pointer]:
              - generic [ref=e66]: color
            - generic [ref=e67]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e68]:
          - button "New subgraph" [ref=e69] [cursor=pointer]
          - button "Library subgraph" [ref=e70] [cursor=pointer]
          - button "Encapsulate" [ref=e71] [cursor=pointer]
          - button "Make independent" [ref=e72] [cursor=pointer]
          - button "Enter subgraph" [ref=e73] [cursor=pointer]
          - button "Arrange nodes" [ref=e74] [cursor=pointer]
          - button "Frame selection" [ref=e75] [cursor=pointer]
          - group [ref=e76]:
            - generic "Local clipboard" [ref=e77] [cursor=pointer]
          - group [ref=e78]:
            - generic "Structures" [ref=e79] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e80]:
          - button "Vertex" [ref=e81] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e82] [cursor=pointer]
        - generic [ref=e83]:
          - button "Add Node" [ref=e84] [cursor=pointer]
          - button "Browse nodes" [ref=e87] [cursor=pointer]
          - button "Up" [disabled] [ref=e90]
          - button "Shortcuts" [ref=e93] [cursor=pointer]
    - complementary [ref=e96]:
      - generic [ref=e97]:
        - heading "Inspector" [level=2] [ref=e98]
        - paragraph [ref=e99]: Select a node to inspect its parameters.
  - generic [ref=e101]:
    - heading "Shader output" [level=2] [ref=e102]
    - paragraph [ref=e103]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e104]:
      - listitem [ref=e105]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e106] [cursor=pointer]
  - contentinfo [ref=e107]:
    - generic [ref=e108]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e109]: Scroll to zoom · Drag empty space to pan
    - generic [ref=e110]:
      - group [ref=e111]:
        - generic "Experimental features" [ref=e112] [cursor=pointer]
      - button "Read object details" [disabled] [ref=e113]
  - status [ref=e114]:
    - button "Read full application status" [disabled] [ref=e115]
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
> 37  |   await page.getByLabel("Open document file").setInputFiles(fixture);
      |   ^ Error: ENOENT: no such file or directory, stat 'C:\Users\user\.codex\worktrees\s06-debug-hover-review-01\Grape\.verification\s06-debug-hover-review-01\runtime\production\evidence\s06\review-03\independent-review\reviewer-public-03\persistent-loss-readability-1440-fixture.grape.json'
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
  54  |   for (let i = 0; i < 100 && !(await read.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press("Shift+Tab");
  55  |   await expect(read).toBeFocused();
  56  |   await page.keyboard.press("Enter");
  57  |   const dialog = page.getByRole("dialog", { name: "Canvas status details", exact: true }), text = dialog.getByRole("region", { name: "Full current Canvas status", exact: true });
  58  |   await expect(dialog).toBeVisible();
  59  |   await expect(text).toBeFocused();
  60  |   for (const loss of losses) { await expect(text).toContainText(loss.payload.edge.id); await expect(text).toContainText(`${loss.payload.edge.to.nodeId}/${loss.payload.edge.to.portKey}`); }
  61  |   const full = await text.innerText();
  62  |   if (width === 1440) await page.setViewportSize({ width: 620, height: 380 });
  63  |   await page.keyboard.press("Control+End");
  64  |   await page.keyboard.press("End");
  65  |   await expect.poll(() => text.evaluate(el => el.scrollHeight - el.clientHeight - el.scrollTop)).toBeLessThanOrEqual(1);
  66  |   const end = await text.evaluate(el => ({ clientHeight: el.clientHeight, scrollHeight: el.scrollHeight, scrollTop: el.scrollTop, clientWidth: el.clientWidth, scrollWidth: el.scrollWidth }));
  67  |   expect(end.scrollWidth).toBeLessThanOrEqual(end.clientWidth + 1);
  68  |   expect(end.scrollTop + end.clientHeight).toBeGreaterThanOrEqual(end.scrollHeight - 1);
  69  |   save(`loss-${width}-full`, { full, end });
  70  |   await page.screenshot({ path: path.join(evidence, `loss-${width}-full.png`) });
  71  |   await page.keyboard.press("Tab");
  72  |   await expect(dialog.getByRole("button", { name: "Close status details", exact: true })).toBeFocused();
  73  |   await page.keyboard.press("Tab");
  74  |   await expect(text).toBeFocused();
  75  |   await page.keyboard.press("Escape");
  76  |   await expect(dialog).not.toBeVisible();
  77  |   await expect(read).toBeFocused();
  78  |   if (width === 1440) await page.setViewportSize({ width, height: 1000 });
  79  |   await clickAction(page, "Save");
  80  |   await expect(notice).toHaveText(facts.text!);
  81  |   await clickAction(page, "Undo");
  82  |   expect((await doc(page)).graph).toEqual(before.graph);
  83  |   await clickAction(page, "Redo");
  84  |   expect((await doc(page)).graph).toEqual(after.graph);
  85  |   await read.click();
  86  |   await expect(text).toHaveText(full);
  87  |   await dialog.getByRole("button", { name: "Close status details", exact: true }).click();
  88  |   expect((await doc(page)).graph).toEqual(after.graph);
  89  | });
  90  | 
  91  | test("S06 bottom application error summary opens complete current text without clearing or History", async ({ page }) => {
  92  |   const { c, out, input } = await color(page), before = await doc(page);
  93  |   await clickAction(page, "Generate GLSL");
  94  |   const summary = page.getByRole("button", { name: "Read full application status", exact: true });
  95  |   await expect(summary).toContainText("INPUT_REQUIRED");
  96  |   const full = await summary.innerText();
  97  |   const bottom = await summary.evaluate(el => {
  98  |     const r = el.getBoundingClientRect(), footer = document.querySelector("footer")!.getBoundingClientRect();
  99  |     return { y: r.y, height: r.height, footerBottom: footer.bottom, whiteSpace: getComputedStyle(el).whiteSpace };
  100 |   });
  101 |   expect(bottom.y).toBeGreaterThanOrEqual(bottom.footerBottom); expect(bottom.height).toBe(32); expect(bottom.whiteSpace).toBe("nowrap");
  102 |   await summary.click();
  103 |   const popup = page.getByRole("dialog", { name: "Application status details", exact: true }), text = popup.getByRole("region", { name: "Full current application status", exact: true });
  104 |   await expect(text).toHaveText(full); await expect(text).toBeFocused();
  105 |   await page.keyboard.press("Escape"); await expect(summary).toBeFocused(); await expect(summary).toHaveText(full);
  106 |   await page.keyboard.press("Space"); await expect(popup).toBeVisible();
  107 |   await popup.getByRole("button", { name: "Close status details", exact: true }).click();
  108 |   await expect(summary).toHaveText(full);
  109 |   await clickAction(page, "Save"); await expect(summary).toHaveText(full);
  110 |   expect(await doc(page)).toEqual(before);
  111 |   await out.click(); await input.click(); await expect(summary).toHaveText(full);
  112 |   await clickAction(page, "Generate GLSL"); await expect(summary).not.toContainText("INPUT_REQUIRED");
  113 |   save("application-current-status", { full, bottom });
  114 |   await page.screenshot({ path: path.join(evidence, "application-bottom-status.png") });
  115 |   await clickAction(page, "Undo"); expect(await doc(page)).toEqual(before);
  116 | });
  117 | 
  118 | test("S06 synthetic outside pointercancel is pointer-specific; click pending survives unpressed motion", async ({ page }) => {
  119 |   const { c, out } = await color(page), before = await doc(page), a = await center(out);
  120 |   await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(a.x + 2, a.y, { steps: 2 });
  121 |   const id = await page.evaluate(() => (window as any).__statusPointerEvents.filter((e: any) => e.type === "pointerdown").at(-1).pointerId);
  122 |   await page.evaluate(id => document.dispatchEvent(new PointerEvent("pointercancel", { pointerId: id + 1, isPrimary: false })), id);
  123 |   await expect(c.locator(".connection-preview path")).toHaveCount(1);
  124 |   await page.evaluate(id => document.dispatchEvent(new PointerEvent("pointercancel", { pointerId: id, isPrimary: true })), id);
  125 |   await page.mouse.up(); await expect(c.locator(".connection-preview path")).toHaveCount(0);
  126 |   await out.click(); await page.mouse.move(a.x + 80, a.y - 40); await expect(c.locator(".connection-preview path")).toHaveCount(1);
  127 |   await page.mouse.move(1435, 80); await expect(c.locator(".connection-preview path")).toHaveCount(0);
  128 |   await page.mouse.move(a.x + 80, a.y - 40); await expect(c.locator(".connection-preview path")).toHaveCount(1);
  129 |   await page.keyboard.press("Escape"); expect(await doc(page)).toEqual(before);
  130 |   save("synthetic-pointer-cancel", { classification: "Synthetic lifecycle boundary; not physical-device evidence", matchingPointer: id });
  131 | });
  132 | 
  133 | test("S06 delayed matching storage recovery retires open error details with usable focus", async ({ page }) => {
  134 |   await color(page);
  135 |   await page.evaluate(() => {
  136 |     (window as any).__originalPut = IDBObjectStore.prototype.put;
  137 |     IDBObjectStore.prototype.put = function () { throw new DOMException("Delayed status fixture", "QuotaExceededError"); };
```