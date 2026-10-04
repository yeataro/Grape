# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-connection-view.spec.ts >> S06 selection geometry remains fixed at zoom 1
- Location: ..\..\..\production\tests\browser\s06-connection-view.spec.ts:104:3

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 4
+ Received  + 4

  Array [
    Object {
      "height": 79,
      "name": "Image output",
      "width": 190,
-     "x": 716.3380126953125,
-     "y": 414.11407470703125,
+     "x": 650.3380126953125,
+     "y": 322.11407470703125,
    },
    Object {
      "height": 79,
      "name": "Color RGBA",
      "width": 190,
-     "x": 114.3380355834961,
-     "y": 330.11407470703125,
+     "x": 48.338035583496094,
+     "y": 238.11407470703125,
    },
  ]
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
      - generic "Shader graph canvas" [active] [ref=e34]:
        - generic:
          - generic:
            - img:
              - generic "Edge b28e907d-eec4-40ba-8dd0-a9eaabde5e68" [ref=e35]
            - generic:
              - group "Image output" [ref=e36]:
                - heading "Image output" [level=3] [ref=e37]
                - generic [ref=e38]:
                  - button "Image output input color" [ref=e39] [cursor=pointer]
                  - generic [ref=e40]: color
                  - generic [ref=e41]: vec4
              - group "Color RGBA" [ref=e42]:
                - heading "Color RGBA" [level=3] [ref=e43]
                - generic [ref=e44]:
                  - button "Color RGBA output out" [ref=e45] [cursor=pointer]
                  - generic [ref=e46]: out
                  - generic [ref=e47]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e48]:
          - button "New subgraph" [ref=e49] [cursor=pointer]
          - button "Library subgraph" [ref=e50] [cursor=pointer]
          - button "Encapsulate" [ref=e51] [cursor=pointer]
          - button "Make independent" [ref=e52] [cursor=pointer]
          - button "Enter subgraph" [ref=e53] [cursor=pointer]
          - button "Arrange nodes" [ref=e54] [cursor=pointer]
          - button "Frame selection" [ref=e55] [cursor=pointer]
          - group [ref=e56]:
            - generic "Local clipboard" [ref=e57] [cursor=pointer]
          - group [ref=e58]:
            - generic "Structures" [ref=e59] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e60]:
          - button "Vertex" [ref=e61] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e62] [cursor=pointer]
        - generic [ref=e63]:
          - button "Add Node" [ref=e64] [cursor=pointer]
          - button "Browse nodes" [ref=e67] [cursor=pointer]
          - button "Up" [disabled] [ref=e70]
          - button "Shortcuts" [ref=e73] [cursor=pointer]
    - complementary [ref=e76]:
      - generic [ref=e77]:
        - heading "Inspector" [level=2] [ref=e78]
        - paragraph [ref=e79]: Select a node to inspect its parameters.
  - contentinfo [ref=e80]:
    - button "Project actions" [ref=e81] [cursor=pointer]
    - status [ref=e82]:
      - button "Read full application status" [ref=e83] [cursor=pointer]: Export started. Saved status is unchanged.
    - button "Shader output" [ref=e84] [cursor=pointer]
    - generic [ref=e85]:
      - button "Experimental features" [ref=e87] [cursor=pointer]
      - button "Read object details" [disabled] [ref=e88]
    - button "Hints" [ref=e89] [cursor=pointer]
```

# Test source

```ts
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
  120 |     await c.getByRole("heading", { name: "Color RGBA", exact: true }).click();
  121 |     const selected = await geometry(c);
  122 |     await expect(c).not.toHaveAttribute("data-selection", "");
  123 |     await page.screenshot({
  124 |       path: path.join(process.env.GRAPE_EVIDENCE_DIR!, `selection-${zoom}.png`),
  125 |     });
  126 |     await page.mouse.click(r.x + 20, r.y + 150);
  127 |     const restored = await geometry(c);
  128 |     output(`selection-${zoom}`, { unselected, selected, restored });
> 129 |     expect(selected.nodes).toEqual(unselected.nodes);
      |                            ^ Error: expect(received).toEqual(expected) // deep equality
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
  221 |     output(`wire-${direction}`, { first, zoomed });
  222 |     await page.screenshot({
  223 |       path: path.join(process.env.GRAPE_EVIDENCE_DIR!, `wire-${direction}.png`),
  224 |     });
  225 |     await page.keyboard.press("Escape");
  226 |     await expect(c.locator(".connection-preview path")).toHaveCount(0);
  227 |     await expect(c.locator(".canvas-notice")).toBeEmpty();
  228 |     expect(await doc(page)).toEqual(before);
  229 |     expect(await c.locator(".wires path").count()).toBe(1);
```