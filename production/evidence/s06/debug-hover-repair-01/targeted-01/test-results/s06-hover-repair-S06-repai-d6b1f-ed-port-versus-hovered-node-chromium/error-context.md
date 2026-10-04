# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-hover-repair.spec.ts >> S06 repair F2 focused port versus hovered node
- Location: ..\..\..\production\tests\browser\s06-hover-repair.spec.ts:59:3

# Error details

```
Error: Target unreachable by trusted Tab
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
        - dialog "Node catalog" [ref=e59]:
          - generic [ref=e60]:
            - strong [ref=e61]: Create node
            - button "Close node catalog" [ref=e62] [cursor=pointer]
          - searchbox "Search nodes" [ref=e65]
          - generic [ref=e66]:
            - combobox "Library scope" [ref=e67]:
              - option "All installed and project" [selected]
              - option "Built-in"
              - option "Project"
            - combobox "Node source" [ref=e68]:
              - option "All installed sources" [selected]
              - option "grape.nodes.basic"
              - option "grape.nodes.fixed-values"
              - option "grape.nodes.function-operations"
              - option "grape.nodes.networks"
              - option "grape.resources.extents"
            - combobox "Node port type" [ref=e69]:
              - option "All port types" [selected]
              - option "array@[\"glsl.float\",2]"
              - option "glsl.float"
              - option "glsl.vec2"
              - option "glsl.vec3"
              - option "glsl.vec4"
          - generic [ref=e70]:
            - group [ref=e71]:
              - generic "Nodes" [ref=e72] [cursor=pointer]
              - generic [ref=e73]:
                - button "Inspect Add" [ref=e74] [cursor=pointer]:
                  - text: Add
                  - generic [ref=e75]: grape.nodes.function-operations
                - button "Add Add" [ref=e76] [cursor=pointer]
              - generic [ref=e79]:
                - button "Inspect Array length" [ref=e80] [cursor=pointer]:
                  - text: Array length
                  - generic [ref=e81]: grape.nodes.function-operations
                - button "Add Array length" [ref=e82] [cursor=pointer]
              - generic [ref=e85]:
                - button "Inspect Array repeat" [ref=e86] [cursor=pointer]:
                  - text: Array repeat
                  - generic [ref=e87]: grape.resources.extents
                - button "Add Array repeat" [ref=e88] [cursor=pointer]
              - generic [ref=e91]:
                - button "Inspect Color RGBA" [ref=e92] [cursor=pointer]:
                  - text: Color RGBA
                  - generic [ref=e93]: grape.nodes.fixed-values
                - button "Add Color RGBA" [ref=e94] [cursor=pointer]
              - generic [ref=e97]:
                - button "Inspect Compose" [ref=e98] [cursor=pointer]:
                  - text: Compose
                  - generic [ref=e99]: grape.nodes.basic
                - button "Add Compose" [ref=e100] [cursor=pointer]
              - generic [ref=e103]:
                - button "Inspect Constant input" [ref=e104] [cursor=pointer]:
                  - text: Constant input
                  - generic [ref=e105]: grape.nodes.function-operations
                - button "Add Constant input" [ref=e106] [cursor=pointer]
              - generic [ref=e109]:
                - button "Inspect Float" [ref=e110] [cursor=pointer]:
                  - text: Float
                  - generic [ref=e111]: grape.nodes.basic
                - button "Add Float" [ref=e112] [cursor=pointer]
              - generic [ref=e115]:
                - button "Inspect Float" [ref=e116] [cursor=pointer]:
                  - text: Float
                  - generic [ref=e117]: grape.nodes.fixed-values
                - button "Add Float" [ref=e118] [cursor=pointer]
              - generic [ref=e121]:
                - button "Inspect Multiply" [ref=e122] [cursor=pointer]:
                  - text: Multiply
                  - generic [ref=e123]: grape.nodes.basic
                - button "Add Multiply" [ref=e124] [cursor=pointer]
              - generic [ref=e127]:
                - button "Inspect Pixel depth and pair" [ref=e128] [cursor=pointer]:
                  - text: Pixel depth and pair
                  - generic [ref=e129]: grape.nodes.function-operations
                - button "Add Pixel depth and pair" [ref=e130] [cursor=pointer]
              - generic [ref=e133]:
                - button "Inspect Vector 2" [ref=e134] [cursor=pointer]:
                  - text: Vector 2
                  - generic [ref=e135]: grape.nodes.fixed-values
                - button "Add Vector 2" [ref=e136] [cursor=pointer]
              - generic [ref=e139]:
                - button "Inspect Vector 3" [ref=e140] [cursor=pointer]:
                  - text: Vector 3
                  - generic [ref=e141]: grape.nodes.fixed-values
                - button "Add Vector 3" [ref=e142] [cursor=pointer]
            - group [ref=e145]:
              - generic "Sources" [ref=e146] [cursor=pointer]
              - generic [ref=e147]:
                - button "Inspect Float source (new)" [ref=e148] [cursor=pointer]:
                  - text: Float source (new)
                  - generic [ref=e149]: New source · grape.nodes.networks
                - button "Add Float source (new)" [ref=e150] [cursor=pointer]
        - generic [ref=e153]:
          - button "Vertex" [ref=e154] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e155] [cursor=pointer]
        - generic [ref=e156]:
          - button "Add Node" [ref=e157] [cursor=pointer]
          - button "Browse nodes" [ref=e160] [cursor=pointer]
          - button "Up" [disabled] [ref=e163]
          - button "Shortcuts" [ref=e166] [cursor=pointer]
    - complementary [ref=e169]:
      - generic [ref=e170]:
        - heading "Inspector" [level=2] [ref=e171]
        - paragraph [ref=e172]: Color RGBA
        - button "Rename node" [ref=e173] [cursor=pointer]
        - generic [ref=e176]:
          - generic [ref=e177]: Value
          - generic [ref=e178]:
            - text: R
            - textbox "R" [ref=e179]: "0.55"
          - generic [ref=e180]:
            - text: G
            - textbox "G" [ref=e181]: "0.28"
          - generic [ref=e182]:
            - text: B
            - textbox "B" [ref=e183]: "0.9"
          - generic [ref=e184]:
            - text: A
            - textbox "A" [ref=e185]: "1"
          - alert
  - contentinfo [ref=e186]:
    - button "Project actions" [active] [ref=e187] [cursor=pointer]
    - status [ref=e188]:
      - button "Read full application status" [disabled] [ref=e189]
    - button "Shader output" [ref=e190] [cursor=pointer]
    - generic [ref=e191]:
      - button "Experimental features" [ref=e193] [cursor=pointer]
      - generic [ref=e194]: UI control · Project actions · UI-only · available
      - button "Read object details" [ref=e195] [cursor=pointer]
    - button "Hints" [ref=e196] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect, type Page, type Locator } from "@playwright/test";
  2  | import fs from "node:fs";
  3  | import path from "node:path";
  4  | import { createNode } from "./create-node.ts";
  5  | import { clickAction } from "../fixtures/public-actions.ts";
  6  | const out = process.env.GRAPE_EVIDENCE_DIR!;
  7  | const save = (name: string, value: unknown) => fs.writeFileSync(path.join(out, name + ".json"), JSON.stringify(value, null, 2));
  8  | async function enable(p: Page) {
  9  |   await p.getByRole("button", { name: "Experimental features", exact: true }).click();
  10 |   await p.getByRole("checkbox", { name: "Show object information instead of normal hover hints" }).check();
  11 |   await p.keyboard.press("Escape");
  12 | }
  13 | async function exported(p: Page) {
  14 |   const wait = p.waitForEvent("download"); await clickAction(p, "Export JSON");
  15 |   return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8"));
  16 | }
  17 | async function fixture(p: Page) {
  18 |   await p.goto("/"); await createNode(p, "Color RGBA");
  19 |   const node = p.locator(".node").filter({has: p.getByRole("heading", {name:"Color RGBA", exact:true})});
  20 |   await node.getByRole("heading").click();
  21 |   return node;
  22 | }
  23 | async function keyboardFocus(p: Page, target: Locator) {
  24 |   for (let i = 0; i < 160; i++) {
  25 |     if (await target.evaluate(e => e === document.activeElement)) return;
  26 |     await p.keyboard.press("Tab");
  27 |   }
> 28 |   throw Error("Target unreachable by trusted Tab");
     |         ^ Error: Target unreachable by trusted Tab
  29 | }
  30 | for (const width of [1440, 1920]) for (const kind of ["Node", "Port", "Parameter Widget"]) {
  31 |   test(`S06 repair continuous 80-step ${kind} details ${width}`, async ({page}) => {
  32 |     await page.setViewportSize({width,height:1000});
  33 |     const node = await fixture(page), before = await exported(page);
  34 |     await enable(page);
  35 |     const target = kind === "Node" ? node.getByRole("heading") : kind === "Port" ? node.locator("[data-port]").first() : page.getByRole("textbox", {name:"R", exact:true});
  36 |     await target.hover();
  37 |     await expect(page.locator(".hover-summary")).toContainText(kind);
  38 |     const read = page.getByRole("button", {name:"Read object details",exact:true}), to = (await read.boundingBox())!;
  39 |     await page.evaluate(() => {
  40 |       (window as any).__travel = [];
  41 |       for (const type of ["pointerover", "pointermove", "pointerdown", "pointerup", "click"]) document.addEventListener(type, e => {
  42 |         const p = e as PointerEvent;
  43 |         (window as any).__travel.push({type, trusted:e.isTrusted,x:p.clientX,y:p.clientY,target:(e.target as Element).tagName});
  44 |       }, true);
  45 |     });
  46 |     await page.mouse.move(to.x+to.width/2, to.y+to.height/2, {steps:80});
  47 |     await page.mouse.down(); await page.mouse.up();
  48 |     const dialog = page.getByRole("dialog", {name:"Object information",exact:true});
  49 |     await expect(dialog).toBeVisible();
  50 |     const text = await dialog.getByRole("region").innerText();
  51 |     expect(text.startsWith(kind+":")).toBeTruthy();
  52 |     await page.screenshot({path:path.join(out, `continuous-${width}-${kind.replaceAll(" ","-")}.png`)});
  53 |     save(`continuous-${width}-${kind.replaceAll(" ","-")}`, {text,events:await page.evaluate(() => (window as any).__travel)});
  54 |     await page.keyboard.press("Escape"); await expect(read).toBeFocused();
  55 |     expect(await exported(page)).toEqual(before);
  56 |   });
  57 | }
  58 | for (const focusKind of ["control", "node", "port"]) for (const hoverKind of ["node", "panel", "control"]) {
  59 |   test(`S06 repair F2 focused ${focusKind} versus hovered ${hoverKind}`, async ({page}) => {
  60 |     const node = await fixture(page); await enable(page);
  61 |     const focus = focusKind === "control" ? page.getByRole("button", {name:"Generate GLSL",exact:true}) : focusKind === "node" ? node : node.locator("[data-port]").first();
  62 |     await keyboardFocus(page, focus);
  63 |     const identity = await focus.getAttribute("data-node") ?? await focus.getAttribute("data-node-id");
  64 |     const other = hoverKind === "node" ? page.getByRole("heading", {name:"Image output",exact:true}) : hoverKind === "panel" ? page.locator(".inspector h2") : page.getByRole("button", {name:"Save locally",exact:true});
  65 |     await other.hover();
  66 |     await expect(focus).toBeFocused();
  67 |     await page.keyboard.press("F2");
  68 |     const dialog = page.getByRole("dialog", {name:"Object information",exact:true});
  69 |     await expect(dialog).toBeVisible();
  70 |     const text = await dialog.getByRole("region").innerText();
  71 |     expect(text).toContain(focusKind === "control" ? "UI control: Generate GLSL" : focusKind === "node" ? "Node: Color RGBA" : "Port:");
  72 |     if (identity) expect(text).toContain(identity);
  73 |     await page.keyboard.press("Escape"); await expect(focus).toBeFocused();
  74 |     save(`f2-${focusKind}-${hoverKind}`, {identity,text,method:"Trusted Tab to live focus, incidental hover, trusted F2/Escape"});
  75 |   });
  76 | }
  77 | test("S06 repair compact disclosures share presentation without model changes", async ({page}) => {
  78 |   await page.goto("/"); const before = await exported(page);
  79 |   await expect(page.locator("#code")).not.toBeVisible();
  80 |   for (const name of ["Project actions", "Shader output", "Hints", "Experimental features"]) {
  81 |     const button = page.getByRole("button", {name,exact:true}); await button.click();
  82 |     await expect(button).toHaveAttribute("aria-expanded","true");
  83 |     await page.keyboard.press("Escape"); await expect(button).toBeFocused();
  84 |     await expect(button).toHaveAttribute("aria-expanded","false");
  85 |   }
  86 |   await page.getByRole("button", {name:"Generate GLSL",exact:true}).click();
  87 |   await expect(page.getByRole("list", {name:"Diagnostics",exact:true})).toBeVisible();
  88 |   await expect(page.getByRole("button", {name:"Locate node",exact:true}).first()).toBeVisible();
  89 |   await page.getByRole("button", {name:"Close shader output",exact:true}).click();
  90 |   expect(await exported(page)).toEqual(before);
  91 | });
  92 | 
```