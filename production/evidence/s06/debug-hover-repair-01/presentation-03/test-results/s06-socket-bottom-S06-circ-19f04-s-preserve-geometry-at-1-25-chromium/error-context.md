# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-socket-bottom.spec.ts >> S06 circle-only type-colored socket states preserve geometry at 1.25
- Location: ..\..\..\production\tests\browser\s06-socket-bottom.spec.ts:14:35

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 76
+ Received  + 76

@@ -1,380 +1,380 @@
  Array [
    Object {
      "box": Array [
-       835,
-       332.5,
+       406,
+       78.5,
        237.5,
        98.75,
      ],
      "class": "node",
      "tag": "ARTICLE",
    },
    Object {
      "box": Array [
-       836.25,
-       333.75,
+       407.25,
+       79.75,
        235,
        51.25,
      ],
      "class": "",
      "tag": "H3",
    },
    Object {
      "box": Array [
-       829.38,
-       405,
+       400.38,
+       151,
        13.75,
        13.75,
      ],
      "class": "socket",
      "tag": "SPAN",
    },
    Object {
      "box": Array [
-       852.5,
-       403.13,
+       423.5,
+       149.13,
        32.46,
        17.5,
      ],
      "class": "port-label",
      "tag": "SPAN",
    },
    Object {
      "box": Array [
-       892.46,
-       405,
+       463.46,
+       151,
        26.11,
        13.75,
      ],
      "class": "",
      "tag": "SMALL",
    },
    Object {
      "box": Array [
-       82.5,
-       227.5,
+       -346.5,
+       -26.5,
        237.5,
        98.75,
      ],
      "class": "node",
      "tag": "ARTICLE",
    },
    Object {
      "box": Array [
-       83.75,
-       228.75,
+       -345.25,
+       -25.25,
        235,
        51.25,
      ],
      "class": "",
      "tag": "H3",
    },
    Object {
      "box": Array [
-       311.88,
-       300,
+       -117.12,
+       46,
        13.75,
        13.75,
      ],
      "class": "socket",
      "tag": "SPAN",
    },
    Object {
      "box": Array [
-       251.17,
-       298.13,
+       -177.83,
+       44.13,
        21.19,
        17.5,
      ],
      "class": "port-label",
      "tag": "SPAN",
    },
    Object {
      "box": Array [
-       279.86,
-       300,
+       -149.14,
+       46,
        23.89,
        13.75,
      ],
      "class": "",
      "tag": "SMALL",
    },
    Object {
      "box": Array [
-       352.5,
-       227.5,
+       -76.5,
+       -26.5,
        237.5,
        98.75,
      ],
      "class": "node",
      "tag": "ARTICLE",
    },
    Object {
      "box": Array [
-       353.75,
-       228.75,
+       -75.25,
+       -25.25,
        235,
        51.25,
      ],
      "class": "",
      "tag": "H3",
    },
    Object {
      "box": Array [
-       581.88,
-       300,
+       152.88,
+       46,
        13.75,
        13.75,
      ],
      "class": "socket",
      "tag": "SPAN",
    },
    Object {
      "box": Array [
-       519.38,
-       298.13,
+       90.38,
+       44.13,
        21.19,
        17.5,
      ],
      "class": "port-label",
      "tag": "SPAN",
    },
    Object {
      "box": Array [
-       548.07,
-       300,
+       119.07,
+       46,
        25.68,
        13.75,
      ],
      "class": "",
      "tag": "SMALL",
    },
    Object {
      "box": Array [
-       652.5,
-       227.5,
+       223.5,
+       -26.5,
        237.5,
        98.75,
      ],
      "class": "node",
      "tag": "ARTICLE",
    },
    Object {
      "box": Array [
-       653.75,
-       228.75,
+       224.75,
+       -25.25,
        235,
        51.25,
      ],
      "class": "",
      "tag": "H3",
    },
    Object {
      "box": Array [
-       881.88,
-       300,
+       452.88,
+       46,
        13.75,
        13.75,
      ],
      "class": "socket",
      "tag": "SPAN",
    },
    Object {
      "box": Array [
-       819.02,
-       298.13,
+       390.02,
+       44.13,
        21.19,
        17.5,
      ],
      "class": "port-label",
      "tag": "SPAN",
    },
    Object {
      "box": Array [
-       847.71,
-       300,
+       418.71,
+       46,
        26.04,
        13.75,
      ],
      "class": "",
      "tag": "SMALL",
    },
    Object {
      "box": Array [
-       82.5,
-       497.5,
+       -346.5,
+       243.5,
        237.5,
        98.75,
      ],
      "class": "node",
      "tag": "ARTICLE",
    },
    Object {
      "box": Array [
-       83.75,
-       498.75,
+       -345.25,
+       244.75,
        235,
        51.25,
      ],
      "class": "",
      "tag": "H3",
    },
    Object {
      "box": Array [
-       311.88,
-       570,
+       -117.12,
+       316,
        13.75,
        13.75,
      ],
      "class": "socket",
      "tag": "SPAN",
    },
    Object {
      "box": Array [
-       248.95,
-       568.13,
+       -180.05,
+       314.13,
        21.19,
        17.5,
      ],
      "class": "port-label",
      "tag": "SPAN",
    },
    Object {
      "box": Array [
-       277.64,
-       570,
+       -151.36,
+       316,
        26.11,
        13.75,
      ],
      "class": "",
      "tag": "SMALL",
    },
    Object {
      "box": Array [
-       352.5,
-       497.5,
+       -76.5,
+       243.5,
        237.5,
        171.25,
      ],
      "class": "node selected",
      "tag": "ARTICLE",
    },
    Object {
      "box": Array [
-       353.75,
-       498.75,
+       -75.25,
+       244.75,
        235,
        51.25,
      ],
      "class": "",
      "tag": "H3",
    },
    Object {
      "box": Array [
-       346.88,
-       570,
+       -82.12,
+       316,
        13.75,
        13.75,
      ],
      "class": "socket",
      "tag": "SPAN",
    },
    Object {
      "box": Array [
-       370,
-       568.13,
+       -59,
+       314.13,
        7.75,
        17.5,
      ],
      "class": "port-label",
      "tag": "SPAN",
    },
    Object {
      "box": Array [
-       385.25,
-       570,
+       -43.75,
+       316,
        23.89,
        13.75,
      ],
      "class": "",
      "tag": "SMALL",
    },
    Object {
      "box": Array [
-       416.64,
-       561.88,
+       -12.36,
+       307.88,
        157.11,
        30,
      ],
      "class": "node-value",
      "tag": "SPAN",
    },
    Object {
      "box": Array [
-       346.88,
-       606.25,
+       -82.12,
+       352.25,
        13.75,
        13.75,
      ],
      "class": "socket",
      "tag": "SPAN",
    },
    Object {
      "box": Array [
-       370,
-       604.38,
+       -59,
+       350.38,
        8.54,
        17.5,
      ],
      "class": "port-label",
      "tag": "SPAN",
    },
    Object {
      "box": Array [
-       386.04,
-       606.25,
+       -42.96,
+       352.25,
        23.89,
        13.75,
      ],
      "class": "",
      "tag": "SMALL",
    },
    Object {
      "box": Array [
-       417.42,
-       598.13,
+       -11.58,
+       344.13,
        156.33,
        30,
      ],
      "class": "node-value",
      "tag": "SPAN",
    },
    Object {
      "box": Array [
-       581.88,
-       642.5,
+       152.88,
+       388.5,
        13.75,
        13.75,
      ],
      "class": "socket",
      "tag": "SPAN",
    },
    Object {
      "box": Array [
-       506.04,
-       640.63,
+       77.04,
+       386.63,
        36.33,
        17.5,
      ],
      "class": "port-label",
      "tag": "SPAN",
    },
    Object {
      "box": Array [
-       549.86,
-       642.5,
+       120.86,
+       388.5,
        23.89,
        13.75,
      ],
      "class": "",
      "tag": "SMALL",
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
              - group "Float" [ref=e41]:
                - heading "Float" [level=3] [ref=e42]
                - generic [ref=e43]:
                  - button "Float output out" [ref=e44] [cursor=pointer]
                  - generic [ref=e45]: out
                  - generic [ref=e46]: float
              - group "Vector 2" [ref=e47]:
                - heading "Vector 2" [level=3] [ref=e48]
                - generic [ref=e49]:
                  - button "Vector 2 output out" [ref=e50] [cursor=pointer]
                  - generic [ref=e51]: out
                  - generic [ref=e52]: vec2
              - group "Vector 3" [ref=e53]:
                - heading "Vector 3" [level=3] [ref=e54]
                - generic [ref=e55]:
                  - button "Vector 3 output out" [ref=e56] [cursor=pointer]
                  - generic [ref=e57]: out
                  - generic [ref=e58]: vec3
              - group "Color RGBA" [ref=e59]:
                - heading "Color RGBA" [level=3] [ref=e60]
                - generic [ref=e61]:
                  - button "Color RGBA output out" [ref=e62] [cursor=pointer]
                  - generic [ref=e63]: out
                  - generic [ref=e64]: vec4
              - group "Multiply" [ref=e65]:
                - heading "Multiply" [level=3] [ref=e66]
                - generic [ref=e67]:
                  - button "Multiply input a" [ref=e68] [cursor=pointer]
                  - generic [ref=e69]: a
                  - generic [ref=e70]: float
                  - generic "Current local value; edit in Inspector" [ref=e71]: "1"
                - generic [ref=e72]:
                  - button "Multiply input b" [ref=e73] [cursor=pointer]
                  - generic [ref=e74]: b
                  - generic [ref=e75]: float
                  - generic "Current local value; edit in Inspector" [ref=e76]: "2"
                - generic [ref=e77]:
                  - button "Multiply output result" [ref=e78] [cursor=pointer]
                  - generic [ref=e79]: result
                  - generic [ref=e80]: float
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e81]:
          - button "New subgraph" [ref=e82] [cursor=pointer]
          - button "Library subgraph" [ref=e83] [cursor=pointer]
          - button "Encapsulate" [ref=e84] [cursor=pointer]
          - button "Make independent" [ref=e85] [cursor=pointer]
          - button "Enter subgraph" [ref=e86] [cursor=pointer]
          - button "Arrange nodes" [ref=e87] [cursor=pointer]
          - button "Frame selection" [ref=e88] [cursor=pointer]
          - group [ref=e89]:
            - generic "Local clipboard" [ref=e90] [cursor=pointer]
          - group [ref=e91]:
            - generic "Structures" [ref=e92] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e93]:
          - button "Vertex" [ref=e94] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e95] [cursor=pointer]
        - generic [ref=e96]:
          - button "Add Node" [ref=e97] [cursor=pointer]
          - button "Browse nodes" [ref=e100] [cursor=pointer]
          - button "Up" [disabled] [ref=e103]
          - button "Shortcuts" [ref=e106] [cursor=pointer]
    - complementary [ref=e109]:
      - generic [ref=e110]:
        - heading "Inspector" [level=2] [ref=e111]
        - paragraph [ref=e112]: Multiply
        - button "Rename node" [ref=e113] [cursor=pointer]
        - generic [ref=e114]:
          - generic [ref=e116]:
            - generic [ref=e117]: A
            - textbox "A" [ref=e118]: "1"
            - alert
          - generic [ref=e120]:
            - generic [ref=e121]: B
            - textbox "B" [ref=e122]: "2"
            - alert
  - contentinfo [ref=e123]:
    - button "Project actions" [expanded] [ref=e124] [cursor=pointer]
    - status [ref=e125]:
      - button "Read full application status" [ref=e126] [cursor=pointer]: Export started. Saved status is unchanged.
    - button "Shader output" [ref=e127] [cursor=pointer]
    - generic [ref=e128]:
      - button "Experimental features" [ref=e130] [cursor=pointer]
      - button "Read object details" [disabled] [ref=e131]
    - button "Hints" [ref=e132] [cursor=pointer]
  - menu "Project actions" [ref=e133]:
    - heading "Project actions" [level=2] [ref=e134]
    - generic [ref=e135]:
      - menuitem "New document" [ref=e136] [cursor=pointer]
      - menuitem "Upgrade subgraph owners" [ref=e139] [cursor=pointer]
      - menuitem "Open saved" [ref=e140] [cursor=pointer]
      - menuitem "Export JSON" [active] [ref=e143] [cursor=pointer]
      - menuitem "Export PNG" [ref=e146] [cursor=pointer]
      - menuitem "Open file" [ref=e149] [cursor=pointer]
      - menuitem "Second Canvas" [ref=e152] [cursor=pointer]
      - menuitem "Lock editing" [ref=e155] [cursor=pointer]
      - menuitem "Personal Library" [ref=e158] [cursor=pointer]
    - button "Close project actions" [ref=e159] [cursor=pointer]
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
> 24 |     expect(style.fill).toBe(style.border); expect(await geometry(c)).toEqual(idle);
     |                                                                      ^ Error: expect(received).toEqual(expected) // deep equality
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
  51 |     const popup=page.locator(".floating-surface[open]").last();await expect(popup).toBeVisible();
  52 |     const b=(await popup.boundingBox())!;expect(b.x).toBeGreaterThanOrEqual(0);expect(b.y).toBeGreaterThanOrEqual(0);expect(b.x+b.width).toBeLessThanOrEqual(width!);expect(b.y+b.height).toBeLessThanOrEqual(height!);
  53 |     await page.screenshot({path:path.join(out,`bottom-${width}-${height}-${name.replaceAll(" ","-")}.png`)});
  54 |     await page.keyboard.press("Escape");await expect(trigger).toBeFocused();records.push({name,b});
  55 |   }
  56 |   expect(await doc(page)).toEqual(before);save(`bottom-${width}-${height}`,records);
  57 | });
  58 | 
```