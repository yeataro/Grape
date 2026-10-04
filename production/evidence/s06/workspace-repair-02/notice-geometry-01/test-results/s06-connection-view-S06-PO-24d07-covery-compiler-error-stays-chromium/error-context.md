# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-connection-view.spec.ts >> S06 PORT_TARGET and same-direction refusal remain visible until matching recovery; compiler error stays
- Location: ..\..\..\production\tests\browser\s06-connection-view.spec.ts:136:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('#errors')
Expected substring: "INPUT_REQUIRED"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('#errors')

```

```yaml
- banner:
  - text: Grape SHADER WORKSPACE
  - navigation "Document actions":
    - button "New document"
    - button "Save"
    - button "Open saved"
    - button "Export JSON"
    - button "Export PNG"
    - button "Open file"
    - button "Generate GLSL"
    - button "Second Canvas"
    - button "Lock editing"
    - group: More actions
  - text: Unsaved changes Host-free
- alert: "INPUT_REQUIRED: Connect the required input."
- button "Undo"
- button "Redo" [disabled]
- button "Delete selected"
- alert
- main:
  - text: Canvas 1
  - img
  - group "Image output":
    - heading "Image output" [level=3]
    - button "Image output input color": color
    - text: vec4
  - group "Color RGBA":
    - heading "Color RGBA" [level=3]
    - button "Color RGBA output out": out
    - text: vec4
  - button "Untitled shader / pixel" [disabled]
  - button "New subgraph"
  - button "Library subgraph"
  - button "Encapsulate"
  - button "Make independent"
  - button "Enter subgraph"
  - button "Arrange nodes"
  - button "Frame selection"
  - group: Local clipboard
  - group: Structures
  - button "Vertex"
  - button "Pixel" [pressed]
  - button "Add Node"
  - button "Browse nodes"
  - button "Up" [disabled]
  - button "Shortcuts"
  - img
  - complementary:
    - heading "Inspector" [level=2]
    - paragraph: Color RGBA
    - button "Rename node"
    - text: Value R
    - textbox "R": "0.55"
    - text: G
    - textbox "G": "0.28"
    - text: B
    - textbox "B": "0.9"
    - text: A
    - textbox "A": "1"
    - alert
- heading "Shader output" [level=2]
- paragraph: Generation blocked
- list "Diagnostics":
  - listitem:
    - text: "INPUT_REQUIRED: Connect the required input."
    - button "Locate node"
- contentinfo: Click an output port, then an input to connect. Shift-click replaces a connection. Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
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
> 141 |   await expect(page.locator("#errors")).toContainText("INPUT_REQUIRED");
      |                                         ^ Error: expect(locator).toContainText(expected) failed
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
  162 |   await expect(page.locator("#errors")).toContainText("INPUT_REQUIRED");
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
```