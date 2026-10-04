# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-status-pointer.spec.ts >> S06 actual 3px uncaptured port release across Canvas Inspector retires wire and ring
- Location: ..\..\..\production\tests\browser\s06-status-pointer.spec.ts:87:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 1
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - text: Grape
      - generic [ref=e9]: SHADER WORKSPACE
    - navigation "Document actions" [ref=e10]:
      - generic [ref=e11]:
        - button "New document" [ref=e12] [cursor=pointer]
        - button "Save" [ref=e15] [cursor=pointer]
        - button "Open saved" [ref=e18] [cursor=pointer]
        - button "Export JSON" [ref=e21] [cursor=pointer]
        - button "Export PNG" [ref=e24] [cursor=pointer]
        - button "Open file" [ref=e27] [cursor=pointer]
      - generic [ref=e30]:
        - button "Generate GLSL" [ref=e31] [cursor=pointer]
        - button "Second Canvas" [ref=e34] [cursor=pointer]
        - button "Lock editing" [ref=e37] [cursor=pointer]
      - group [ref=e40]:
        - generic "More actions" [ref=e41] [cursor=pointer]
    - generic [ref=e43]:
      - generic [ref=e44]: Unsaved changes
      - generic [ref=e45]: Host-free
  - status [ref=e46]: Export started. Saved status is unchanged.
  - generic [ref=e48]:
    - button "Undo" [ref=e49] [cursor=pointer]
    - button "Redo" [disabled] [ref=e52]
    - button "Delete selected" [ref=e55] [cursor=pointer]
    - alert
  - main [ref=e56]:
    - generic [ref=e58]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e59]:
        - generic:
          - generic:
            - group "Image output" [ref=e60]:
              - heading "Image output" [level=3] [ref=e61]
              - generic [ref=e62]:
                - button "Image output input color" [ref=e63] [cursor=pointer]:
                  - generic [ref=e65]: color
                - generic [ref=e66]: vec4
            - group "Color RGBA" [ref=e67]:
              - heading "Color RGBA" [level=3] [ref=e68]
              - generic [ref=e69]:
                - button "Color RGBA output out" [active] [ref=e70] [cursor=pointer]:
                  - generic [ref=e71]: out
                - generic [ref=e73]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e74]:
          - button "New subgraph" [ref=e75] [cursor=pointer]
          - button "Library subgraph" [ref=e76] [cursor=pointer]
          - button "Encapsulate" [ref=e77] [cursor=pointer]
          - button "Make independent" [ref=e78] [cursor=pointer]
          - button "Enter subgraph" [ref=e79] [cursor=pointer]
          - button "Arrange nodes" [ref=e80] [cursor=pointer]
          - button "Frame selection" [ref=e81] [cursor=pointer]
          - group [ref=e82]:
            - generic "Local clipboard" [ref=e83] [cursor=pointer]
          - group [ref=e84]:
            - generic "Structures" [ref=e85] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e86]:
          - button "Vertex" [ref=e87] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e88] [cursor=pointer]
        - generic [ref=e89]:
          - button "Add Node" [ref=e90] [cursor=pointer]
          - button "Browse nodes" [ref=e93] [cursor=pointer]
          - button "Up" [disabled] [ref=e96]
          - button "Shortcuts" [ref=e99] [cursor=pointer]
    - complementary [ref=e102]:
      - generic [ref=e103]:
        - heading "Inspector" [level=2] [ref=e104]
        - paragraph [ref=e105]: Select a node to inspect its parameters.
  - generic [ref=e107]:
    - heading "Shader output" [level=2] [ref=e108]
    - paragraph [ref=e109]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e110]:
      - listitem [ref=e111]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e112] [cursor=pointer]
  - contentinfo [ref=e113]:
    - generic [ref=e114]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e115]: Scroll to zoom · Drag empty space to pan
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
  24  |   await page.addInitScript(() => {
  25  |     (window as any).__statusPointerEvents = [];
  26  |     for (const type of ["pointerdown", "pointermove", "pointerup", "pointercancel", "click", "keydown", "keyup"])
  27  |       document.addEventListener(type, e => { const p = e as PointerEvent, k = e as KeyboardEvent; (window as any).__statusPointerEvents.push({ type, trusted: e.isTrusted, target: (e.target as HTMLElement)?.className, port: (e.target as HTMLElement)?.dataset?.port, pointerId: p.pointerId, buttons: p.buttons, x: p.clientX, y: p.clientY, detail: p.detail, key: k.key }); }, true);
  28  |   });
  29  |   await page.goto("/");
  30  | });
  31  | test.afterEach(async ({ page }, info) => { save(info.title.replace(/[^a-zA-Z0-9]+/g, "-") + "-events", await page.evaluate(() => (window as any).__statusPointerEvents)); });
  32  | 
  33  | for (const width of [620, 1440]) test(`S06 complete persistent loss details have a keyboard read path at ${width}`, async ({ page }) => {
  34  |   await page.setViewportSize({ width, height: 1000 });
  35  |   const fixture = fileURLToPath(new URL(`../../evidence/s06/review-03/independent-review/reviewer-public-03/persistent-loss-readability-${width}-fixture.grape.json`, import.meta.url));
  36  |   await page.getByLabel("Open document file").setInputFiles(fixture);
  37  |   await page.getByRole("button", { name: "Open in new session", exact: true }).click();
  38  |   const c = page.locator(".canvas").first();
  39  |   await c.getByRole("heading", { name: "Shared arithmetic", exact: true }).last().click();
  40  |   await c.getByRole("button", { name: "Enter subgraph", exact: true }).click();
  41  |   await c.getByText("Subgraph interface", { exact: true }).click();
  42  |   const before = await doc(page);
  43  |   await c.getByLabel("Subgraph emission mode").selectOption("function");
  44  |   const after = await doc(page), losses = after.graph.losses.filter((l: any) => l.code === "FUNCTION_CONSTANT_DETACHED");
  45  |   expect(losses).toHaveLength(width === 620 ? 4 : 10);
  46  |   const notice = c.locator(".canvas-notice"), facts = await notice.evaluate(el => ({ text: el.textContent, clientHeight: el.clientHeight, scrollHeight: el.scrollHeight, overflow: getComputedStyle(el).overflow, pointerEvents: getComputedStyle(el).pointerEvents }));
  47  |   save(`loss-${width}-compact`, { facts, losses });
  48  |   await page.screenshot({ path: path.join(evidence, `loss-${width}-compact.png`) });
  49  |   expect(facts.clientHeight).toBeLessThanOrEqual(60);
  50  |   const read = c.getByRole("button", { name: "Read full Canvas status", exact: true });
  51  |   if (!(await read.isVisible())) expect(facts.scrollHeight).toBeLessThanOrEqual(facts.clientHeight);
  52  |   // Reach the actual control using keyboard navigation, without programmatic focus.
  53  |   for (let i = 0; i < 100 && !(await read.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press("Tab");
  54  |   await expect(read).toBeFocused();
  55  |   await page.keyboard.press("Enter");
  56  |   const dialog = page.getByRole("dialog", { name: "Canvas status details", exact: true }), text = dialog.getByRole("region", { name: "Full current Canvas status", exact: true });
  57  |   await expect(dialog).toBeVisible();
  58  |   await expect(text).toBeFocused();
  59  |   for (const loss of losses) { await expect(text).toContainText(loss.payload.edge.id); await expect(text).toContainText(`${loss.payload.edge.to.nodeId}/${loss.payload.edge.to.portKey}`); }
  60  |   const full = await text.innerText();
  61  |   await page.keyboard.press("Control+End");
  62  |   await page.keyboard.press("End");
  63  |   const end = await text.evaluate(el => ({ clientHeight: el.clientHeight, scrollHeight: el.scrollHeight, scrollTop: el.scrollTop, clientWidth: el.clientWidth, scrollWidth: el.scrollWidth }));
  64  |   expect(end.scrollWidth).toBeLessThanOrEqual(end.clientWidth + 1);
  65  |   expect(end.scrollTop + end.clientHeight).toBeGreaterThanOrEqual(end.scrollHeight - 1);
  66  |   save(`loss-${width}-full`, { full, end });
  67  |   await page.screenshot({ path: path.join(evidence, `loss-${width}-full.png`) });
  68  |   await page.keyboard.press("Tab");
  69  |   await expect(dialog.getByRole("button", { name: "Close status details", exact: true })).toBeFocused();
  70  |   await page.keyboard.press("Tab");
  71  |   await expect(text).toBeFocused();
  72  |   await page.keyboard.press("Escape");
  73  |   await expect(dialog).not.toBeVisible();
  74  |   await expect(read).toBeFocused();
  75  |   await clickAction(page, "Save");
  76  |   await expect(notice).toHaveText(facts.text!);
  77  |   await clickAction(page, "Undo");
  78  |   expect((await doc(page)).graph).toEqual(before.graph);
  79  |   await clickAction(page, "Redo");
  80  |   expect((await doc(page)).graph).toEqual(after.graph);
  81  |   await read.click();
  82  |   await expect(text).toHaveText(full);
  83  |   await dialog.getByRole("button", { name: "Close status details", exact: true }).click();
  84  |   expect((await doc(page)).graph).toEqual(after.graph);
  85  | });
  86  | 
  87  | test("S06 actual 3px uncaptured port release across Canvas Inspector retires wire and ring", async ({ page }) => {
  88  |   await page.setViewportSize({ width: 1440, height: 1000 });
  89  |   const { c, out } = await color(page), before = await doc(page), cr = (await c.boundingBox())!;
  90  |   const initial = await center(out.locator(".socket")), delta = cr.x + cr.width - 1.5 - initial.x;
  91  |   await page.mouse.move(cr.x + 20, cr.y + 150); await page.mouse.down();
  92  |   await page.mouse.move(cr.x + 20 + delta, cr.y + 150, { steps: 12 }); await page.mouse.up();
  93  |   const a = await center(out.locator(".socket"));
  94  |   expect(a.x).toBeGreaterThan(cr.x + cr.width - 3); expect(a.x).toBeLessThan(cr.x + cr.width);
  95  |   await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(a.x + 3, a.y, { steps: 6 });
  96  |   const during = await preview(c); await page.mouse.up(); const released = await preview(c);
  97  |   await page.mouse.move(cr.x + 900, a.y, { steps: 5 }); const returned = await preview(c);
  98  |   save("tiny-cross-boundary", { start: a, release: { x: a.x + 3, y: a.y }, canvas: cr, during, released, returned });
  99  |   await page.screenshot({ path: path.join(evidence, "tiny-cross-boundary.png") });
> 100 |   expect(released.paths).toBe(0); expect(released.rings).toBe(0); expect(returned.paths).toBe(0); expect(returned.rings).toBe(0);
      |                          ^ Error: expect(received).toBe(expected) // Object.is equality
  101 |   expect(await doc(page)).toEqual(before);
  102 |   await clickAction(page, "Undo"); await expect(c.getByRole("heading", { name: "Color RGBA", exact: true })).toHaveCount(0);
  103 | });
  104 | 
  105 | for (const key of ["Enter", "Space"]) test(`S06 trusted ${key} socket activation waits for real pointer and preserves keyboard connection`, async ({ page }) => {
  106 |   const { c, out, input } = await color(page), before = await doc(page);
  107 |   await out.click(); await page.keyboard.press("Escape"); await expect(out).toBeFocused();
  108 |   await page.keyboard.press(key);
  109 |   const pending = await preview(c), cr = (await c.boundingBox())!;
  110 |   save(`keyboard-${key}`, { pending, canvas: cr });
  111 |   await expect(c.locator(".canvas-notice")).toContainText("opposite port");
  112 |   if (pending.d) expect(pending.d).not.toMatch(new RegExp(`,0 ${-cr.y}$`));
  113 |   expect(pending.paths).toBe(0);
  114 |   await page.mouse.move(cr.x + 450, cr.y + 180, { steps: 5 });
  115 |   await expect(c.locator(".connection-preview path")).toHaveCount(1);
  116 |   await page.keyboard.press("Escape"); await expect(c.locator(".connection-preview path")).toHaveCount(0);
  117 |   expect(await doc(page)).toEqual(before);
  118 |   await out.click(); await page.keyboard.press("Escape"); await page.keyboard.press(key);
  119 |   for (let i = 0; i < 100 && !(await input.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press("Tab");
  120 |   await expect(input).toBeFocused(); await page.keyboard.press(key);
  121 |   await expect(c.locator(".canvas-notice")).toBeEmpty();
  122 |   const after = await doc(page); expect(after.graph.stages.find((s: any) => s.key === "pixel").network.edges).toHaveLength(1);
  123 |   await clickAction(page, "Undo"); expect(await doc(page)).toEqual(before);
  124 |   await clickAction(page, "Redo"); expect(await doc(page)).toEqual(after);
  125 | });
  126 | 
```