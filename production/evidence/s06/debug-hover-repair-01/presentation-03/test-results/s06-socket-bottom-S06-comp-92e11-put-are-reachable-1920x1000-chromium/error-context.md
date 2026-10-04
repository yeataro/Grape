# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-socket-bottom.spec.ts >> S06 compact bottom actions and complete output are reachable 1920x1000
- Location: ..\..\..\production\tests\browser\s06-socket-bottom.spec.ts:45:76

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.floating-surface[open]').last()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.floating-surface[open]').last()

```

```yaml
- banner:
  - text: Grape SHADER WORKSPACE Development · unversioned
  - button "本輪更新"
  - navigation "Document actions":
    - button "Save"
    - button "Generate GLSL"
  - text: Unsaved changes Host-free
- button "Undo" [disabled]
- button "Redo" [disabled]
- button "Delete selected"
- alert
- main:
  - text: Canvas 1
  - img
  - group "Image output":
    - heading "Image output" [level=3]
    - button "Image output input color"
    - text: color vec4
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
    - paragraph: Select a node to inspect its parameters.
- contentinfo:
  - button "Project actions"
  - status:
    - button "Read full application status" [disabled]
  - button "Shader output"
  - button "Experimental features"
  - button "Read object details" [disabled]
  - button "Hints"
```

# Test source

```ts
  1  | import { test, expect, type Page, type Locator } from "@playwright/test";
  2  | import fs from "node:fs";
  3  | import path from "node:path";
  4  | import { createNode } from "./create-node.ts";
  5  | import { clickAction } from "../fixtures/public-actions.ts";
  6  | const out = process.env.GRAPE_EVIDENCE_DIR!;
  7  | const save = (n:string,v:unknown) => fs.writeFileSync(path.join(out,n+".json"),JSON.stringify(v,null,2));
  8  | async function doc(p:Page) { const w=p.waitForEvent("download"); await clickAction(p,"Export JSON"); return JSON.parse(fs.readFileSync((await (await w).path())!,"utf8")); }
  9  | async function center(l:Locator) { const b=(await l.boundingBox())!;return {x:b.x+b.width/2,y:b.y+b.height/2}; }
  10 | async function geometry(c:Locator) { return c.evaluate(el => {
  11 |   const r=el.getBoundingClientRect();
  12 |   return [...el.querySelectorAll(".node,.node h3,.port-label,.port-row small,.socket,.node-value")].map(e=>{const b=e.getBoundingClientRect();return {tag:e.tagName,class:e.className,box:[b.x-r.x,b.y-r.y,b.width,b.height].map(x=>Math.round(x*100)/100)};});
  13 | }); }
  14 | for (const zoom of [0.65,1,1.25]) test(`S06 circle-only type-colored socket states preserve geometry at ${zoom}`,async({page})=>{
  15 |   await page.setViewportSize({width:1920,height:1100}); await page.goto("/");
  16 |   for(const name of ["Float (fixed)","Vector 2","Vector 3","Color RGBA","Multiply"]) await createNode(page,name);
  17 |   const c=page.locator(".canvas").first();await c.hover({position:{x:30,y:90}});
  18 |   await page.mouse.wheel(0,-Math.log(zoom/Number(await c.getAttribute("data-zoom")))*1000);
  19 |   const before=await doc(page),records=[];
  20 |   for(const n of await c.locator(".node").all()) {
  21 |     const port=n.locator("[data-port]").first(),socket=port.locator(".socket");
  22 |     const idle=await geometry(c); await port.hover();
  23 |     const style=await socket.evaluate(e=>{const s=getComputedStyle(e);return {fill:s.backgroundColor,border:s.borderColor,shadow:s.boxShadow};});
  24 |     expect(style.fill).toBe(style.border); expect(await geometry(c)).toEqual(idle);
  25 |     const point=await center(port);await page.mouse.down();
  26 |     expect(await geometry(c)).toEqual(idle);await page.mouse.up();await page.keyboard.press("Escape");
  27 |     const label=n.locator(".port-label").first(); expect(await port.evaluate(e=>e.textContent)).toBe("");
  28 |     await label.click();await expect(c.locator(".connection-preview path")).toHaveCount(0);
  29 |     expect(await geometry(c)).toEqual(idle);
  30 |     records.push({name:await n.getAttribute("aria-label"),style,point});
  31 |   }
  32 |   const start=c.getByRole("button",{name:"Color RGBA output out",exact:true}),end=c.getByRole("button",{name:"Image output input color",exact:true});
  33 |   await start.click(); await end.hover(); await expect(end).toHaveClass(/wire-target/);
  34 |   const targetStyle=await end.locator(".socket").evaluate(e=>({fill:getComputedStyle(e).backgroundColor,border:getComputedStyle(e).borderColor,shadow:getComputedStyle(e).boxShadow}));
  35 |   expect(targetStyle.fill).toBe(targetStyle.border);
  36 |   const wrong=c.getByRole("button",{name:"Vector 2 output out",exact:true});await wrong.hover();await expect(wrong).not.toHaveClass(/wire-target/);
  37 |   await page.keyboard.press("Escape");expect(await doc(page)).toEqual(before);
  38 |   await start.click();await end.click();await expect(c.locator(".wires path")).toHaveCount(1);
  39 |   const wired=await geometry(c),wire=await c.locator(".wires").innerHTML();await c.getByRole("heading",{name:"Color RGBA",exact:true}).click();
  40 |   expect(await geometry(c)).toEqual(wired);expect(await c.locator(".wires").innerHTML()).toBe(wire);
  41 |   await page.screenshot({path:path.join(out,`socket-${zoom}.png`)});
  42 |   await clickAction(page,"Undo");expect(await doc(page)).toEqual(before);await clickAction(page,"Redo");await expect(c.locator(".wires path")).toHaveCount(1);
  43 |   save(`socket-${zoom}`,{records,targetStyle,geometry:wired,wire,comparison:"Idle/hover/pressed/selection have identical relative content/socket bounds. Type-preserving fill and distinct target ring; negative sibling label and same-direction hit."});
  44 | });
  45 | for(const [width,height] of [[1920,1000],[1440,1000],[620,800],[620,380]]) test(`S06 compact bottom actions and complete output are reachable ${width}x${height}`,async({page})=>{
  46 |   await page.setViewportSize({width:width!,height:height!});await page.goto("/");
  47 |   await expect(page.locator("#code")).not.toBeVisible();
  48 |   const before=await doc(page),records=[];
  49 |   for(const name of ["Project actions","Shader output","Hints","Experimental features"]) {
  50 |     const trigger=page.getByRole("button",{name,exact:true});await trigger.click();
> 51 |     const popup=page.locator(".floating-surface[open]").last();await expect(popup).toBeVisible();
     |                                                                                    ^ Error: expect(locator).toBeVisible() failed
  52 |     const b=(await popup.boundingBox())!;expect(b.x).toBeGreaterThanOrEqual(0);expect(b.y).toBeGreaterThanOrEqual(0);expect(b.x+b.width).toBeLessThanOrEqual(width!);expect(b.y+b.height).toBeLessThanOrEqual(height!);
  53 |     await page.screenshot({path:path.join(out,`bottom-${width}-${height}-${name.replaceAll(" ","-")}.png`)});
  54 |     await page.keyboard.press("Escape");await expect(trigger).toBeFocused();records.push({name,b});
  55 |   }
  56 |   expect(await doc(page)).toEqual(before);save(`bottom-${width}-${height}`,records);
  57 | });
  58 | 
```