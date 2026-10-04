# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-status-pointer.spec.ts >> S06 complete persistent loss details have a keyboard read path at 620
- Location: ..\..\..\production\tests\browser\s06-status-pointer.spec.ts:34:34

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 60
Received:    85
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]: Grape
    - navigation "Document actions" [ref=e9]:
      - generic [ref=e10]:
        - button "Generate GLSL" [ref=e11] [cursor=pointer]
        - button "Second Canvas" [ref=e14] [cursor=pointer]
        - button "Lock editing" [ref=e17] [cursor=pointer]
      - group [ref=e20]:
        - generic "More actions" [ref=e21] [cursor=pointer]
        - generic [ref=e23]:
          - generic [ref=e24]:
            - button "New document" [ref=e25] [cursor=pointer]
            - button "Save" [ref=e28] [cursor=pointer]
            - button "Open saved" [ref=e31] [cursor=pointer]
            - button "Export JSON" [active] [ref=e34] [cursor=pointer]
            - button "Export PNG" [ref=e37] [cursor=pointer]
            - button "Open file" [ref=e40] [cursor=pointer]
          - generic [ref=e43]:
            - button "Upgrade subgraph owners" [ref=e44] [cursor=pointer]
            - button "Personal Library" [ref=e45] [cursor=pointer]
    - generic [ref=e46]:
      - generic [ref=e47]: Unsaved changes
      - generic [ref=e48]: Host-free
  - status [ref=e49]: Export started. Saved status is unchanged.
  - generic [ref=e51]:
    - button "Undo" [ref=e52] [cursor=pointer]
    - button "Redo" [disabled] [ref=e55]
    - button "Delete selected" [ref=e58] [cursor=pointer]
    - alert
  - main [ref=e59]:
    - generic [ref=e61]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e62]:
        - generic:
          - generic:
            - group "Inputs" [ref=e66]:
              - heading "Inputs" [level=3] [ref=e67]
              - button "Create input port from selection" [ref=e68] [cursor=pointer]
              - generic [ref=e69]:
                - button "Inputs output X" [ref=e70] [cursor=pointer]:
                  - generic [ref=e71]: X
                - generic [ref=e73]: float
            - group "Outputs" [ref=e74]:
              - heading "Outputs" [level=3] [ref=e75]
              - button "Create output port from selection" [ref=e76] [cursor=pointer]
              - generic [ref=e77]:
                - button "Outputs input Y" [ref=e78] [cursor=pointer]:
                  - generic [ref=e80]: "Y"
                - generic [ref=e81]: float
              - generic [ref=e82]:
                - button "Outputs input Twice" [ref=e83] [cursor=pointer]:
                  - generic [ref=e85]: Twice
                - generic [ref=e86]: float
            - group "Add" [ref=e87]:
              - heading "Add" [level=3] [ref=e88]
              - generic [ref=e89]:
                - button "Add input a" [ref=e90] [cursor=pointer]:
                  - generic [ref=e92]: a
                - generic [ref=e93]: float
              - generic [ref=e94]:
                - button "Add input b" [ref=e95] [cursor=pointer]:
                  - generic [ref=e97]: b
                - generic [ref=e98]: float
              - generic [ref=e99]:
                - button "Add output value" [ref=e100] [cursor=pointer]:
                  - generic [ref=e101]: value
                - generic [ref=e103]: float
        - generic:
          - button "Untitled shader / pixel" [ref=e104] [cursor=pointer]
          - button "Shared arithmetic" [disabled]
        - status: Function mode of definition id-22 makes this receiving input nonconstant. Receiver id-38/value; edge id-39. Function mode of definition id-22 makes this receiving input nonconstant. Receiver id-40/value; edge id-41. Function mode of definition id-22 makes this receiving input nonconstant. Receiver id-42/value; edge id-43. Function mode of definition id-22 makes this receiving input nonconstant. Receiver id-44/value; edge id-45.
        - generic [ref=e105]:
          - button "New subgraph" [ref=e106] [cursor=pointer]
          - button "Library subgraph" [ref=e107] [cursor=pointer]
          - button "Encapsulate" [ref=e108] [cursor=pointer]
          - button "Make independent" [ref=e109] [cursor=pointer]
          - button "Enter subgraph" [ref=e110] [cursor=pointer]
          - button "Arrange nodes" [ref=e111] [cursor=pointer]
          - button "Frame selection" [ref=e112] [cursor=pointer]
          - group [ref=e113]:
            - generic "Subgraph interface" [ref=e114] [cursor=pointer]
            - textbox "Subgraph name" [ref=e115]: Shared arithmetic
            - combobox "Subgraph emission mode" [ref=e116]:
              - option "Expand"
              - option "Function" [selected]
            - text: Shared by all references. Use Make independent for a separate choice.
            - generic [ref=e117]:
              - generic [ref=e118]:
                - textbox "Port name 1" [ref=e119]: X
                - combobox "Port type 1" [ref=e120]:
                  - option "glsl.float" [selected]
                  - option "glsl.vec2"
                  - option "glsl.vec3"
                  - option "glsl.vec4"
                  - option "glsl.mat2"
                  - option "glsl.mat2x3"
                  - option "glsl.mat2x4"
                  - option "glsl.mat3x2"
                  - option "glsl.mat3"
                  - option "glsl.mat3x4"
                  - option "glsl.mat4x2"
                  - option "glsl.mat4x3"
                  - option "glsl.mat4"
                - textbox "Port default 1" [ref=e121]: "0.2"
                - combobox "Port direction 1" [ref=e122]:
                  - option "input" [selected]
                  - option "output"
                - button "Move port up 1" [disabled] [ref=e123]
                - button "Remove port 1" [ref=e124] [cursor=pointer]
              - generic [ref=e125]:
                - textbox "Port name 2" [ref=e126]: "Y"
                - combobox "Port type 2" [ref=e127]:
                  - option "glsl.float" [selected]
                  - option "glsl.vec2"
                  - option "glsl.vec3"
                  - option "glsl.vec4"
                  - option "glsl.mat2"
                  - option "glsl.mat2x3"
                  - option "glsl.mat2x4"
                  - option "glsl.mat3x2"
                  - option "glsl.mat3"
                  - option "glsl.mat3x4"
                  - option "glsl.mat4x2"
                  - option "glsl.mat4x3"
                  - option "glsl.mat4"
                - textbox "Port default 2" [ref=e128]: "0"
                - combobox "Port direction 2" [ref=e129]:
                  - option "input"
                  - option "output" [selected]
                - button "Move port up 2" [ref=e130] [cursor=pointer]
                - button "Remove port 2" [ref=e131] [cursor=pointer]
              - generic [ref=e132]:
                - textbox "Port name 3" [ref=e133]: Twice
                - combobox "Port type 3" [ref=e134]:
                  - option "glsl.float" [selected]
                  - option "glsl.vec2"
                  - option "glsl.vec3"
                  - option "glsl.vec4"
                  - option "glsl.mat2"
                  - option "glsl.mat2x3"
                  - option "glsl.mat2x4"
                  - option "glsl.mat3x2"
                  - option "glsl.mat3"
                  - option "glsl.mat3x4"
                  - option "glsl.mat4x2"
                  - option "glsl.mat4x3"
                  - option "glsl.mat4"
                - textbox "Port default 3" [ref=e135]: "0"
                - combobox "Port direction 3" [ref=e136]:
                  - option "input"
                  - option "output" [selected]
                - button "Move port up 3" [ref=e137] [cursor=pointer]
                - button "Remove port 3" [ref=e138] [cursor=pointer]
            - combobox "New port direction" [ref=e139]:
              - option "input" [selected]
              - option "output"
            - button "Add interface port" [ref=e140] [cursor=pointer]
            - button "Apply interface" [ref=e141] [cursor=pointer]
            - button "Cancel interface" [ref=e142] [cursor=pointer]
          - group [ref=e143]:
            - generic "Local clipboard" [ref=e144] [cursor=pointer]
          - group [ref=e145]:
            - generic "Structures" [ref=e146] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e147]:
          - button "Vertex" [ref=e148] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e149] [cursor=pointer]
        - generic [ref=e150]:
          - button "Add Node" [ref=e151] [cursor=pointer]
          - button "Browse nodes" [ref=e154] [cursor=pointer]
          - button "Up" [ref=e157] [cursor=pointer]
          - button "Shortcuts" [ref=e160] [cursor=pointer]
    - complementary [ref=e163]:
      - generic [ref=e164]:
        - heading "Inspector" [level=2] [ref=e165]
        - paragraph [ref=e166]: Select a node to inspect its parameters.
  - generic [ref=e168]:
    - heading "Shader output" [level=2] [ref=e169]
    - paragraph [ref=e170]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e171]:
      - listitem [ref=e172]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e173] [cursor=pointer]
      - listitem [ref=e174]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e175] [cursor=pointer]
      - listitem [ref=e176]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e177] [cursor=pointer]
      - listitem [ref=e178]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e179] [cursor=pointer]
      - listitem [ref=e180]: "FUNCTION_CONSTANT_DETACHED: Function mode of definition id-22 makes this receiving input nonconstant."
      - listitem [ref=e181]: "FUNCTION_CONSTANT_DETACHED: Function mode of definition id-22 makes this receiving input nonconstant."
      - listitem [ref=e182]: "FUNCTION_CONSTANT_DETACHED: Function mode of definition id-22 makes this receiving input nonconstant."
      - listitem [ref=e183]: "FUNCTION_CONSTANT_DETACHED: Function mode of definition id-22 makes this receiving input nonconstant."
      - listitem [ref=e184]: "CONSTANT_REQUIRED: This input requires a compile-time constant; ordinary function parameters and function results are runtime values."
      - listitem [ref=e185]: "CONSTANT_REQUIRED: This input requires a compile-time constant; ordinary function parameters and function results are runtime values."
      - listitem [ref=e186]: "CONSTANT_REQUIRED: This input requires a compile-time constant; ordinary function parameters and function results are runtime values."
      - listitem [ref=e187]: "CONSTANT_REQUIRED: This input requires a compile-time constant; ordinary function parameters and function results are runtime values."
      - listitem [ref=e188]: "FUNCTION_CONSTANT_DETACHED: Function mode of definition id-22 makes this receiving input nonconstant."
      - listitem [ref=e189]: "FUNCTION_CONSTANT_DETACHED: Function mode of definition id-22 makes this receiving input nonconstant."
      - listitem [ref=e190]: "FUNCTION_CONSTANT_DETACHED: Function mode of definition id-22 makes this receiving input nonconstant."
      - listitem [ref=e191]: "FUNCTION_CONSTANT_DETACHED: Function mode of definition id-22 makes this receiving input nonconstant."
  - contentinfo [ref=e192]:
    - generic [ref=e193]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e194]: Scroll to zoom · Drag empty space to pan
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
> 52  |   if (!(await read.isVisible())) expect(facts.scrollHeight).toBeLessThanOrEqual(facts.clientHeight);
      |                                                             ^ Error: expect(received).toBeLessThanOrEqual(expected)
  53  |   // Reach the actual control using keyboard navigation, without programmatic focus.
  54  |   for (let i = 0; i < 100 && !(await read.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press("Tab");
  55  |   await expect(read).toBeFocused();
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