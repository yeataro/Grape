# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-connection-view.spec.ts >> S06 selection geometry remains fixed at zoom 1.2
- Location: ..\..\..\production\tests\browser\s06-connection-view.spec.ts:104:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.canvas').last().getByRole('heading', { name: 'Color RGBA', exact: true })
    - locator resolved to <h3>Color RGBA</h3>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <dialog open="" data-kind="anchored" class="floating-surface" aria-label="Project actions">…</dialog> intercepts pointer events
    - retrying click action
    - waiting 20ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <dialog open="" data-kind="anchored" class="floating-surface" aria-label="Project actions">…</dialog> intercepts pointer events
  2 × retrying click action
      - waiting 100ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button title="Pixel Stage" aria-pressed="true" data-stage-id="d29f25a7-3bc0-448f-9f47-e3b1a4324b7e">Pixel</button> from <div class="stage-switch" data-key="bce81447-3dfb-4d0c-a13e-7def1603a5b8:vertex|d29f25a7-3bc0-448f-9f47-e3b1a4324b7e:pixel">…</div> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <dialog open="" data-kind="anchored" class="floating-surface" aria-label="Project actions">…</dialog> intercepts pointer events
  - retrying click action
    - waiting 500ms
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - banner [ref=f1e3]:
    - generic [ref=f1e4]:
      - text: Grape
      - generic [ref=f1e9]: SHADER WORKSPACE
      - generic "No candidate identity injected" [ref=f1e10]: Development · unversioned
      - button "本輪更新" [ref=f1e11] [cursor=pointer]
    - navigation "Document actions" [ref=f1e12]:
      - button "Save" [ref=f1e13] [cursor=pointer]
      - button "Generate GLSL" [ref=f1e16] [cursor=pointer]
    - generic [ref=f1e19]:
      - generic [ref=f1e20]: Unsaved changes
      - generic [ref=f1e21]: Host-free
  - generic [ref=f1e23]:
    - button "Undo" [disabled] [ref=f1e24]
    - button "Redo" [disabled] [ref=f1e27]
    - button "Delete selected" [ref=f1e30] [cursor=pointer]
    - alert
  - main [ref=f1e31]:
    - generic [ref=f1e33]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=f1e34]:
        - group "Image output" [ref=f1e35]:
          - heading "Image output" [level=3] [ref=f1e36]
          - generic [ref=f1e37]:
            - button "Image output input color" [ref=f1e38] [cursor=pointer]
            - generic [ref=f1e39]: color
            - generic [ref=f1e40]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=f1e41]:
          - button "New subgraph" [ref=f1e42] [cursor=pointer]
          - button "Library subgraph" [ref=f1e43] [cursor=pointer]
          - button "Encapsulate" [ref=f1e44] [cursor=pointer]
          - button "Make independent" [ref=f1e45] [cursor=pointer]
          - button "Enter subgraph" [ref=f1e46] [cursor=pointer]
          - button "Arrange nodes" [ref=f1e47] [cursor=pointer]
          - button "Frame selection" [ref=f1e48] [cursor=pointer]
          - group [ref=f1e49]:
            - generic "Local clipboard" [ref=f1e50] [cursor=pointer]
          - group [ref=f1e51]:
            - generic "Structures" [ref=f1e52] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=f1e53]:
          - button "Vertex" [ref=f1e54] [cursor=pointer]
          - button "Pixel" [pressed] [ref=f1e55] [cursor=pointer]
        - generic [ref=f1e56]:
          - button "Add Node" [ref=f1e57] [cursor=pointer]
          - button "Browse nodes" [ref=f1e60] [cursor=pointer]
          - button "Up" [disabled] [ref=f1e63]
          - button "Shortcuts" [ref=f1e66] [cursor=pointer]
    - complementary [ref=f1e69]:
      - generic [ref=f1e70]:
        - heading "Inspector" [level=2] [ref=f1e71]
        - paragraph [ref=f1e72]: Select a node to inspect its parameters.
  - contentinfo [ref=f1e73]:
    - button "Project actions" [ref=f1e74] [cursor=pointer]
    - status [ref=f1e75]:
      - button "Read full application status" [disabled] [ref=f1e76]
    - button "Shader output" [ref=f1e77] [cursor=pointer]
    - generic [ref=f1e78]:
      - button "Experimental features" [ref=f1e80] [cursor=pointer]
      - button "Read object details" [disabled] [ref=f1e81]
    - button "Hints" [ref=f1e82] [cursor=pointer]
```

# Test source

```ts
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
  68  |     await out.click();
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
> 120 |     await c.getByRole("heading", { name: "Color RGBA", exact: true }).click();
      |                                                                       ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  169 |   await input.click();
  170 |   await expect(c.locator(".canvas-notice")).toBeEmpty();
  171 | });
  172 | 
  173 | for (const direction of ["output", "input"] as const)
  174 |   test(`S06 temporary ${direction} wire follows pointer and zoom without touching real edges`, async ({
  175 |     page,
  176 |   }) => {
  177 |     const { c, out, input } = await color(page);
  178 |     await out.click();
  179 |     await input.click();
  180 |     const before = await doc(page),
  181 |       real = await c.locator(".wires").innerHTML();
  182 |     const r = (await c.boundingBox())!;
  183 |     await page.mouse.move(r.x + 330, r.y + 150);
  184 |     await page.mouse.down();
  185 |     await page.mouse.move(r.x + 360, r.y + 180, { steps: 4 });
  186 |     await page.mouse.up();
  187 |     const start = direction === "output" ? out : input;
  188 |     await start.click();
  189 |     await page.mouse.move(r.x + 450, r.y + 190, { steps: 6 });
  190 |     const capture = async () =>
  191 |       c.evaluate((el, dir) => {
  192 |         const svg = el.querySelector(".connection-preview")!,
  193 |           p = svg.querySelector("path")!,
  194 |           ring = svg.querySelector("circle")!,
  195 |           socket = el.querySelector(`[data-direction="${dir}"] .socket`)!,
  196 |           s = socket.getBoundingClientRect(),
  197 |           r = el.getBoundingClientRect();
  198 |         return {
  199 |           d: p.getAttribute("d"),
  200 |           stroke: getComputedStyle(p).stroke,
  201 |           dash: getComputedStyle(p).strokeDasharray,
  202 |           pointerEvents: getComputedStyle(svg).pointerEvents,
  203 |           origin: [
  204 |             Number(ring.getAttribute("cx")),
  205 |             Number(ring.getAttribute("cy")),
  206 |           ],
  207 |           socket: [s.left + s.width / 2 - r.left, s.top + s.height / 2 - r.top],
  208 |           realEdges: el.querySelectorAll(".wires path").length,
  209 |         };
  210 |       }, direction);
  211 |     const first = await capture();
  212 |     expect(first.d).toContain("C");
  213 |     expect(first.dash).not.toBe("none");
  214 |     expect(first.pointerEvents).toBe("none");
  215 |     expect(first.realEdges).toBe(1);
  216 |     expect(first.origin).toEqual(first.socket);
  217 |     await page.mouse.wheel(0, -120);
  218 |     const zoomed = await capture();
  219 |     expect(zoomed.origin).toEqual(zoomed.socket);
  220 |     expect(zoomed.origin).not.toEqual(first.origin);
```