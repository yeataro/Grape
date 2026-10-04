# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-connection-view.spec.ts >> S06 selection geometry remains fixed at zoom 1
- Location: ..\..\..\production\tests\browser\s06-connection-view.spec.ts:38:28

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('.canvas').last()
Expected: ""
Received: "7a973ac2-ae7c-455a-bd22-c5c316af6a92"
Timeout:  5000ms

Call log:
  - Expect "toHaveAttribute" with timeout 5000ms
  - waiting for locator('.canvas').last()
    14 × locator resolved to <div tabindex="0" data-path="" class="canvas" data-revision="2" data-definition="" data-panel="canvas-1" data-definition-kind="root" data-zoom="1.3446969696969697" aria-label="Shader graph canvas" data-network="fb614d22-e9d5-4ff1-84c3-3c3df19257d3" data-selection="7a973ac2-ae7c-455a-bd22-c5c316af6a92">…</div>
       - unexpected value "7a973ac2-ae7c-455a-bd22-c5c316af6a92"

```

```yaml
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
- status: Choose the opposite port. Hold Shift to replace an existing connection.
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
  40 |   if(zoom===1.2){await c.hover({position:{x:330,y:330}});await page.mouse.wheel(0,-182.3215567939546);}
  41 |   const r=(await c.boundingBox())!; await page.mouse.click(r.x+r.width-15,r.y+r.height-20);
> 42 |   await expect(c).toHaveAttribute("data-selection", "");
     |                   ^ Error: expect(locator).toHaveAttribute(expected) failed
  43 |   const before=await doc(page),unselected=await geometry(c);
  44 |   await c.getByRole("heading",{name:"Color RGBA",exact:true}).click();const selected=await geometry(c);
  45 |   await expect(c).not.toHaveAttribute("data-selection", "");
  46 |   await page.screenshot({path:path.join(process.env.GRAPE_EVIDENCE_DIR!,`selection-${zoom}.png`)});
  47 |   await page.mouse.click(r.x+r.width-15,r.y+r.height-20);const restored=await geometry(c);
  48 |   output(`selection-${zoom}`,{unselected,selected,restored});
  49 |   expect(selected.nodes).toEqual(unselected.nodes);expect(selected.sockets).toEqual(unselected.sockets);expect(selected.wires).toEqual(unselected.wires);
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