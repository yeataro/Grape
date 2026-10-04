# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-connection-view.spec.ts >> S06 connection notice compact geometry 1440 and successful inverse routes one Undo
- Location: ..\..\..\production\tests\browser\s06-connection-view.spec.ts:62:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.canvas').last().locator('[data-direction="output"][data-port="out"]')
    - locator resolved to <button class="port" type="button" data-port="out" data-direction="output" aria-label="Color RGBA output out" data-node-id="17efb72c-ffd9-4337-ac38-7fd1d289dcf5">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button>Upgrade subgraph owners</button> from <dialog open="" data-kind="anchored" class="floating-surface" aria-label="Project actions">…</dialog> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <button>Upgrade subgraph owners</button> from <dialog open="" data-kind="anchored" class="floating-surface" aria-label="Project actions">…</dialog> subtree intercepts pointer events
  2 × retrying click action
      - waiting 100ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="stage-switch" data-key="50d00dcb-0b63-4573-a31d-f0369c64c9b0:vertex|612e72f3-5dad-4e81-a1b3-f8c585b98ca0:pixel">…</div> intercepts pointer events
  14 × retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <button>Upgrade subgraph owners</button> from <dialog open="" data-kind="anchored" class="floating-surface" aria-label="Project actions">…</dialog> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <button>Upgrade subgraph owners</button> from <dialog open="" data-kind="anchored" class="floating-surface" aria-label="Project actions">…</dialog> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="stage-switch" data-key="50d00dcb-0b63-4573-a31d-f0369c64c9b0:vertex|612e72f3-5dad-4e81-a1b3-f8c585b98ca0:pixel">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="stage-switch" data-key="50d00dcb-0b63-4573-a31d-f0369c64c9b0:vertex|612e72f3-5dad-4e81-a1b3-f8c585b98ca0:pixel">…</div> intercepts pointer events
  - retrying click action
    - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - text: Grape
      - generic [ref=e9]: SHADER WORKSPACE
      - generic "No candidate identity injected" [ref=e10]: Development · unversioned
      - button "本輪更新" [ref=e11] [cursor=pointer]
    - navigation "Document actions" [ref=e12]:
      - button "Save" [ref=e13] [cursor=pointer]
      - button "Generate GLSL" [ref=e16] [cursor=pointer]
    - generic [ref=e19]:
      - generic [ref=e20]: Unsaved changes
      - generic [ref=e21]: Host-free
  - generic [ref=e23]:
    - button "Undo" [ref=e24] [cursor=pointer]
    - button "Redo" [disabled] [ref=e27]
    - button "Delete selected" [ref=e30] [cursor=pointer]
    - alert
  - main [ref=e31]:
    - generic [ref=e33]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e34]:
        - generic:
          - generic:
            - generic:
              - group "Image output" [ref=e35]:
                - heading "Image output" [level=3] [ref=e36]
                - generic [ref=e37]:
                  - button "Image output input color" [ref=e38] [cursor=pointer]
                  - generic [ref=e39]: color
                  - generic [ref=e40]: vec4
              - group "Color RGBA" [ref=e41]:
                - heading "Color RGBA" [level=3] [ref=e42]
                - generic [ref=e43]:
                  - button "Color RGBA output out" [ref=e44] [cursor=pointer]
                  - generic [ref=e45]: out
                  - generic [ref=e46]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e47]:
          - button "New subgraph" [ref=e48] [cursor=pointer]
          - button "Library subgraph" [ref=e49] [cursor=pointer]
          - button "Encapsulate" [ref=e50] [cursor=pointer]
          - button "Make independent" [ref=e51] [cursor=pointer]
          - button "Enter subgraph" [ref=e52] [cursor=pointer]
          - button "Arrange nodes" [ref=e53] [cursor=pointer]
          - button "Frame selection" [ref=e54] [cursor=pointer]
          - group [ref=e55]:
            - generic "Local clipboard" [ref=e56] [cursor=pointer]
          - group [ref=e57]:
            - generic "Structures" [ref=e58] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e59]:
          - button "Vertex" [ref=e60] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e61] [cursor=pointer]
        - generic [ref=e62]:
          - button "Add Node" [ref=e63] [cursor=pointer]
          - button "Browse nodes" [ref=e66] [cursor=pointer]
          - button "Up" [disabled] [ref=e69]
          - button "Shortcuts" [ref=e72] [cursor=pointer]
    - complementary [ref=e75]:
      - generic [ref=e76]:
        - heading "Inspector" [level=2] [ref=e77]
        - paragraph [ref=e78]: Color RGBA
        - button "Rename node" [ref=e79] [cursor=pointer]
        - generic [ref=e82]:
          - generic [ref=e83]: Value
          - generic [ref=e84]:
            - text: R
            - textbox "R" [ref=e85]: "0.55"
          - generic [ref=e86]:
            - text: G
            - textbox "G" [ref=e87]: "0.28"
          - generic [ref=e88]:
            - text: B
            - textbox "B" [ref=e89]: "0.9"
          - generic [ref=e90]:
            - text: A
            - textbox "A" [ref=e91]: "1"
          - alert
  - contentinfo [ref=e92]:
    - button "Project actions" [expanded] [ref=e93] [cursor=pointer]
    - status [ref=e94]:
      - button "Read full application status" [ref=e95] [cursor=pointer]: Export started. Saved status is unchanged.
    - button "Shader output" [ref=e96] [cursor=pointer]
    - generic [ref=e97]:
      - button "Experimental features" [ref=e99] [cursor=pointer]
      - button "Read object details" [disabled] [ref=e100]
    - button "Hints" [ref=e101] [cursor=pointer]
  - dialog "Project actions" [ref=e102]:
    - heading "Project actions" [level=2] [ref=e103]
    - generic [ref=e104]:
      - button "New document" [ref=e105] [cursor=pointer]
      - button "Upgrade subgraph owners" [ref=e108] [cursor=pointer]
      - button "Open saved" [ref=e109] [cursor=pointer]
      - button "Export JSON" [active] [ref=e112] [cursor=pointer]
      - button "Export PNG" [ref=e115] [cursor=pointer]
      - button "Open file" [ref=e118] [cursor=pointer]
      - button "Second Canvas" [ref=e121] [cursor=pointer]
      - button "Lock editing" [ref=e124] [cursor=pointer]
      - button "Personal Library" [ref=e127] [cursor=pointer]
    - button "Close project actions" [ref=e128] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect, type Page, type Locator } from "@playwright/test";
  2   | import fs from "node:fs";
  3   | import path from "node:path";
  4   | import { createNode } from "./create-node.ts";
  5   | import { clickAction } from "../fixtures/public-actions.ts";
  6   | const output = (name: string, data: unknown) =>
  7   |   fs.writeFileSync(
  8   |     path.join(process.env.GRAPE_EVIDENCE_DIR!, name + ".json"),
  9   |     JSON.stringify(data, null, 2) + "\n",
  10  |   );
  11  | async function doc(page: Page) {
  12  |   const wait = page.waitForEvent("download");
  13  |   await clickAction(page, "Export JSON");
  14  |   return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8"));
  15  | }
  16  | async function center(l: Locator) {
  17  |   const r = (await l.boundingBox())!;
  18  |   return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  19  | }
  20  | async function color(page: Page) {
  21  |   await createNode(page, "Color RGBA");
  22  |   const c = page.locator(".canvas").last();
  23  |   await c.getByRole("heading", { name: "Color RGBA", exact: true }).click();
  24  |   await page.keyboard.press("h");
  25  |   return {
  26  |     c,
  27  |     out: c.locator('[data-direction="output"][data-port="out"]'),
  28  |     input: c.locator('[data-direction="input"][data-port="color"]'),
  29  |   };
  30  | }
  31  | async function geometry(c: Locator) {
  32  |   return c.evaluate((el) => {
  33  |     const rect = (e: Element) => {
  34  |       const r = e.getBoundingClientRect();
  35  |       return { x: r.x, y: r.y, width: r.width, height: r.height };
  36  |     };
  37  |     const n = el.querySelector<HTMLElement>(".canvas-notice")!;
  38  |     return {
  39  |       canvas: rect(el),
  40  |       notice: {
  41  |         ...rect(n),
  42  |         text: n.textContent,
  43  |         pointerEvents: getComputedStyle(n).pointerEvents,
  44  |       },
  45  |       nodes: [...el.querySelectorAll(".node")].map((e) => ({
  46  |         name: e.querySelector("h3")!.textContent,
  47  |         ...rect(e),
  48  |       })),
  49  |       sockets: [...el.querySelectorAll(".socket")].map(rect),
  50  |       wires: [...el.querySelectorAll(".wires path")].map((e) => ({
  51  |         d: e.getAttribute("d"),
  52  |         ...rect(e),
  53  |       })),
  54  |     };
  55  |   });
  56  | }
  57  | test.beforeEach(async ({ page }) => {
  58  |   await page.goto("/");
  59  | });
  60  | 
  61  | for (const width of [1280, 1440, 620])
  62  |   test(`S06 connection notice compact geometry ${width} and successful inverse routes one Undo`, async ({
  63  |     page,
  64  |   }) => {
  65  |     await page.setViewportSize({ width, height: width === 1280 ? 720 : 1000 });
  66  |     const { c, out, input } = await color(page),
  67  |       before = await doc(page);
> 68  |     await out.click();
      |               ^ Error: locator.click: Test timeout of 30000ms exceeded.
  69  |     const g = await geometry(c);
  70  |     output(`notice-${width}`, g);
  71  |     await page.screenshot({
  72  |       path: path.join(process.env.GRAPE_EVIDENCE_DIR!, `notice-${width}.png`),
  73  |     });
  74  |     expect(g.notice.height).toBeLessThan(65);
  75  |     expect(g.notice.pointerEvents).toBe("none");
  76  |     for (const n of g.nodes)
  77  |       expect(
  78  |         n.x + n.width / 2 >= g.notice.x &&
  79  |           n.x + n.width / 2 <= g.notice.x + g.notice.width &&
  80  |           n.y + n.height / 2 >= g.notice.y &&
  81  |           n.y + n.height / 2 <= g.notice.y + g.notice.height,
  82  |       ).toBe(false);
  83  |     await input.click();
  84  |     await expect(c.locator(".canvas-notice")).toBeEmpty();
  85  |     const after = await doc(page);
  86  |     expect(
  87  |       after.graph.stages.find((s: any) => s.key === "pixel").network.edges,
  88  |     ).toHaveLength(1);
  89  |     await clickAction(page, "Undo");
  90  |     expect(await doc(page)).toEqual(before);
  91  |     await clickAction(page, "Redo");
  92  |     expect(await doc(page)).toEqual(after);
  93  |     await clickAction(page, "Undo");
  94  |     await input.click();
  95  |     await out.click();
  96  |     await expect(c.locator(".canvas-notice")).toBeEmpty();
  97  |     expect(
  98  |       (await doc(page)).graph.stages.find((s: any) => s.key === "pixel").network
  99  |         .edges,
  100 |     ).toHaveLength(1);
  101 |   });
  102 | 
  103 | for (const zoom of [1, 1.2])
  104 |   test(`S06 selection geometry remains fixed at zoom ${zoom}`, async ({
  105 |     page,
  106 |   }) => {
  107 |     const { c, out, input } = await color(page);
  108 |     await out.click();
  109 |     await input.click();
  110 |     await c.hover({ position: { x: 330, y: 150 } });
  111 |     await page.mouse.wheel(
  112 |       0,
  113 |       -Math.log(zoom / Number(await c.getAttribute("data-zoom"))) * 1000,
  114 |     );
  115 |     const r = (await c.boundingBox())!;
  116 |     await page.mouse.click(r.x + 20, r.y + 150);
  117 |     await expect(c).toHaveAttribute("data-selection", "");
  118 |     const before = await doc(page),
  119 |       unselected = await geometry(c);
  120 |     await c.getByRole("heading", { name: "Color RGBA", exact: true }).click();
  121 |     const selected = await geometry(c);
  122 |     await expect(c).not.toHaveAttribute("data-selection", "");
  123 |     await page.screenshot({
  124 |       path: path.join(process.env.GRAPE_EVIDENCE_DIR!, `selection-${zoom}.png`),
  125 |     });
  126 |     await page.mouse.click(r.x + 20, r.y + 150);
  127 |     const restored = await geometry(c);
  128 |     output(`selection-${zoom}`, { unselected, selected, restored });
  129 |     expect(selected.nodes).toEqual(unselected.nodes);
  130 |     expect(selected.sockets).toEqual(unselected.sockets);
  131 |     expect(selected.wires).toEqual(unselected.wires);
  132 |     expect(restored.nodes).toEqual(unselected.nodes);
  133 |     expect(await doc(page)).toEqual(before);
  134 |   });
  135 | 
  136 | test("S06 PORT_TARGET and same-direction refusal remain visible until matching recovery; compiler error stays", async ({
  137 |   page,
  138 | }) => {
  139 |   const { c, out, input } = await color(page);
  140 |   await clickAction(page, "Generate GLSL");
  141 |   await expect(page.locator("#message")).toContainText("INPUT_REQUIRED");
  142 |   const before = await doc(page);
  143 |   const a = await center(out),
  144 |     b = await center(
  145 |       c.getByRole("heading", { name: "Image output", exact: true }),
  146 |     );
  147 |   await page.mouse.move(a.x, a.y);
  148 |   await page.mouse.down();
  149 |   await page.mouse.move(b.x, b.y, { steps: 8 });
  150 |   await page.mouse.up();
  151 |   await expect(c.locator(".canvas-notice")).toContainText("PORT_TARGET");
  152 |   output("port-target", await geometry(c));
  153 |   expect(await doc(page)).toEqual(before);
  154 |   await clickAction(page, "Save");
  155 |   await expect(c.locator(".canvas-notice")).toContainText("PORT_TARGET");
  156 |   await out.click();
  157 |   await page.keyboard.press("Escape");
  158 |   await expect(c.locator(".canvas-notice")).toContainText("PORT_TARGET");
  159 |   await out.click();
  160 |   await input.click();
  161 |   await expect(c.locator(".canvas-notice")).toBeEmpty();
  162 |   await expect(page.locator("#message")).toContainText("INPUT_REQUIRED");
  163 |   await clickAction(page, "Undo");
  164 |   expect(await doc(page)).toEqual(before);
  165 |   await out.click();
  166 |   await out.click();
  167 |   await expect(c.locator(".canvas-notice")).toContainText("PORT_DIRECTION");
  168 |   await out.click();
```