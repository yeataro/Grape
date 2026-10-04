# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-connection-view.spec.ts >> S06 selection geometry remains fixed at zoom 1
- Location: ..\..\..\production\tests\browser\s06-connection-view.spec.ts:38:28

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

@@ -5,11 +5,11 @@
      "width": 190,
      "x": 716.3380126953125,
      "y": 448.2535400390625,
    },
    Object {
-     "height": 79,
+     "height": 81,
      "name": "Color RGBA",
      "width": 190,
      "x": 114.3380355834961,
      "y": 364.2535400390625,
    },
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
      - generic "Shader graph canvas" [active] [ref=e59]:
        - generic:
          - generic:
            - group "Image output" [ref=e61]:
              - heading "Image output" [level=3] [ref=e62]
              - generic [ref=e63]:
                - button "Image output input color" [ref=e64] [cursor=pointer]:
                  - generic [ref=e66]: color
                - generic [ref=e67]: vec4
            - group "Color RGBA" [ref=e68]:
              - heading "Color RGBA" [level=3] [ref=e69]
              - generic [ref=e70]:
                - button "Color RGBA output out" [ref=e71] [cursor=pointer]:
                  - generic [ref=e72]: out
                - generic [ref=e74]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - status: Choose the opposite port. Hold Shift to replace an existing connection.
        - generic [ref=e75]:
          - button "New subgraph" [ref=e76] [cursor=pointer]
          - button "Library subgraph" [ref=e77] [cursor=pointer]
          - button "Encapsulate" [ref=e78] [cursor=pointer]
          - button "Make independent" [ref=e79] [cursor=pointer]
          - button "Enter subgraph" [ref=e80] [cursor=pointer]
          - button "Arrange nodes" [ref=e81] [cursor=pointer]
          - button "Frame selection" [ref=e82] [cursor=pointer]
          - group [ref=e83]:
            - generic "Local clipboard" [ref=e84] [cursor=pointer]
          - group [ref=e85]:
            - generic "Structures" [ref=e86] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e87]:
          - button "Vertex" [ref=e88] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e89] [cursor=pointer]
        - generic [ref=e90]:
          - button "Add Node" [ref=e91] [cursor=pointer]
          - button "Browse nodes" [ref=e94] [cursor=pointer]
          - button "Up" [disabled] [ref=e97]
          - button "Shortcuts" [ref=e100] [cursor=pointer]
    - complementary [ref=e103]:
      - generic [ref=e104]:
        - heading "Inspector" [level=2] [ref=e105]
        - paragraph [ref=e106]: Select a node to inspect its parameters.
  - generic [ref=e108]:
    - heading "Shader output" [level=2] [ref=e109]
    - paragraph [ref=e110]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics"
  - contentinfo [ref=e111]:
    - generic [ref=e112]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e113]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  1  | import { test, expect, type Page, type Locator } from "@playwright/test";
  2  | import fs from "node:fs";
  3  | import path from "node:path";
  4  | import { createNode } from "./create-node.ts";
  5  | import { clickAction } from "../fixtures/public-actions.ts";
  6  | const output = (name: string, data: unknown) => fs.writeFileSync(path.join(process.env.GRAPE_EVIDENCE_DIR!, name + ".json"), JSON.stringify(data, null, 2) + "\n");
  7  | async function doc(page: Page) { const wait = page.waitForEvent("download"); await clickAction(page, "Export JSON"); return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8")); }
  8  | async function center(l: Locator) { const r = (await l.boundingBox())!; return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }
  9  | async function color(page: Page) {
  10 |   await createNode(page, "Color RGBA");
  11 |   const c = page.locator(".canvas").last();
  12 |   await c.getByRole("heading", { name: "Color RGBA", exact: true }).click();
  13 |   await page.keyboard.press("h");
  14 |   return { c, out: c.locator('[data-direction="output"][data-port="out"]'), input: c.locator('[data-direction="input"][data-port="color"]') };
  15 | }
  16 | async function geometry(c: Locator) { return c.evaluate((el) => {
  17 |   const rect = (e: Element) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
  18 |   const n = el.querySelector<HTMLElement>(".canvas-notice")!;
  19 |   return { canvas: rect(el), notice: { ...rect(n), text: n.textContent, pointerEvents: getComputedStyle(n).pointerEvents }, nodes: [...el.querySelectorAll(".node")].map(e=>({name:e.querySelector("h3")!.textContent, ...rect(e)})), sockets:[...el.querySelectorAll(".socket")].map(rect), wires:[...el.querySelectorAll(".wires path")].map(e=>({d:e.getAttribute("d"),...rect(e)})) };
  20 | }); }
  21 | test.beforeEach(async ({ page }) => { await page.goto("/"); });
  22 | 
  23 | for (const width of [1280, 1440, 620]) test(`S06 connection notice compact geometry ${width} and successful inverse routes one Undo`, async ({ page }) => {
  24 |   await page.setViewportSize({width,height:width===1280?720:1000});
  25 |   const {c,out,input}=await color(page), before=await doc(page);
  26 |   await out.click(); const g=await geometry(c); output(`notice-${width}`,g);
  27 |   await page.screenshot({path:path.join(process.env.GRAPE_EVIDENCE_DIR!,`notice-${width}.png`)});
  28 |   expect(g.notice.height).toBeLessThan(65); expect(g.notice.pointerEvents).toBe("none");
  29 |   for(const n of g.nodes) expect(n.x+n.width/2>=g.notice.x&&n.x+n.width/2<=g.notice.x+g.notice.width&&n.y+n.height/2>=g.notice.y&&n.y+n.height/2<=g.notice.y+g.notice.height).toBe(false);
  30 |   await input.click(); await expect(c.locator(".canvas-notice")).toBeEmpty();
  31 |   const after=await doc(page); expect(after.graph.stages.find((s:any)=>s.key==="pixel").network.edges).toHaveLength(1);
  32 |   await clickAction(page,"Undo"); expect(await doc(page)).toEqual(before);
  33 |   await clickAction(page,"Redo"); expect(await doc(page)).toEqual(after);
  34 |   await clickAction(page,"Undo"); await input.click(); await out.click(); await expect(c.locator(".canvas-notice")).toBeEmpty();
  35 |   expect((await doc(page)).graph.stages.find((s:any)=>s.key==="pixel").network.edges).toHaveLength(1);
  36 | });
  37 | 
  38 | for(const zoom of [1,1.2]) test(`S06 selection geometry remains fixed at zoom ${zoom}`,async({page})=>{
  39 |   const {c,out,input}=await color(page);await out.click();await input.click();
  40 |   await c.hover({position:{x:330,y:150}});await page.mouse.wheel(0,-Math.log(zoom/Number(await c.getAttribute("data-zoom")))*1000);
  41 |   const r=(await c.boundingBox())!; await page.mouse.click(r.x+20,r.y+150);
  42 |   await expect(c).toHaveAttribute("data-selection", "");
  43 |   const before=await doc(page),unselected=await geometry(c);
  44 |   await c.getByRole("heading",{name:"Color RGBA",exact:true}).click();const selected=await geometry(c);
  45 |   await expect(c).not.toHaveAttribute("data-selection", "");
  46 |   await page.screenshot({path:path.join(process.env.GRAPE_EVIDENCE_DIR!,`selection-${zoom}.png`)});
  47 |   await page.mouse.click(r.x+20,r.y+150);const restored=await geometry(c);
  48 |   output(`selection-${zoom}`,{unselected,selected,restored});
> 49 |   expect(selected.nodes).toEqual(unselected.nodes);expect(selected.sockets).toEqual(unselected.sockets);expect(selected.wires).toEqual(unselected.wires);
     |                          ^ Error: expect(received).toEqual(expected) // deep equality
  50 |   expect(restored.nodes).toEqual(unselected.nodes);expect(await doc(page)).toEqual(before);
  51 | });
  52 | 
  53 | test("S06 PORT_TARGET and same-direction refusal remain visible until matching recovery; compiler error stays",async({page})=>{
  54 |   const {c,out,input}=await color(page);await clickAction(page,"Generate GLSL");
  55 |   await expect(page.locator("#errors")).toContainText("INPUT_REQUIRED");const before=await doc(page);
  56 |   const a=await center(out),b=await center(c.getByRole("heading",{name:"Image output",exact:true}));
  57 |   await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:8});await page.mouse.up();
  58 |   await expect(c.locator(".canvas-notice")).toContainText("PORT_TARGET");output("port-target",await geometry(c));
  59 |   expect(await doc(page)).toEqual(before);await clickAction(page,"Save");await expect(c.locator(".canvas-notice")).toContainText("PORT_TARGET");
  60 |   await out.click();await page.keyboard.press("Escape");await expect(c.locator(".canvas-notice")).toContainText("PORT_TARGET");
  61 |   await out.click();await input.click();await expect(c.locator(".canvas-notice")).toBeEmpty();await expect(page.locator("#errors")).toContainText("INPUT_REQUIRED");
  62 |   await clickAction(page,"Undo");expect(await doc(page)).toEqual(before);
  63 |   await out.click();await out.click();await expect(c.locator(".canvas-notice")).toContainText("PORT_DIRECTION");
  64 |   await out.click();await input.click();await expect(c.locator(".canvas-notice")).toBeEmpty();
  65 | });
  66 | 
```