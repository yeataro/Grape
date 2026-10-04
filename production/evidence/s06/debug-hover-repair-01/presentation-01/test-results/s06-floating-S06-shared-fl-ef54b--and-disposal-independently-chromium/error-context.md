# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-floating.spec.ts >> S06 shared floating consumers bound alignments focus semantics and disposal independently
- Location: ..\..\..\production\tests\browser\s06-floating.spec.ts:5:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - text: Grape
        - generic "No candidate identity injected" [ref=e9]: Development · unversioned
        - button "本輪更新" [ref=e10] [cursor=pointer]
      - navigation "Document actions" [ref=e11]:
        - button "Save" [ref=e12] [cursor=pointer]
        - button "Generate GLSL" [ref=e15] [cursor=pointer]
      - generic [ref=e18]:
        - generic [ref=e19]: Unsaved changes
        - generic [ref=e20]: Host-free
    - generic [ref=e22]:
      - button "Undo" [disabled] [ref=e23]
      - button "Redo" [disabled] [ref=e26]
      - button "Delete selected" [ref=e29] [cursor=pointer]
      - alert
    - main [ref=e30]:
      - generic [ref=e32]:
        - generic: Canvas 1
        - generic "Shader graph canvas" [ref=e33]:
          - group "Image output" [ref=e34]:
            - heading "Image output" [level=3] [ref=e35]
            - generic [ref=e36]:
              - button "Image output input color" [ref=e37] [cursor=pointer]
              - generic [ref=e38]: color
              - generic [ref=e39]: vec4
          - generic:
            - button "Untitled shader / pixel" [disabled]
          - generic [ref=e40]:
            - button "New subgraph" [ref=e41] [cursor=pointer]
            - button "Library subgraph" [ref=e42] [cursor=pointer]
            - button "Encapsulate" [ref=e43] [cursor=pointer]
            - button "Make independent" [ref=e44] [cursor=pointer]
            - button "Enter subgraph" [ref=e45] [cursor=pointer]
            - button "Arrange nodes" [ref=e46] [cursor=pointer]
            - button "Frame selection" [ref=e47] [cursor=pointer]
            - group [ref=e48]:
              - generic "Local clipboard" [ref=e49] [cursor=pointer]
            - group [ref=e50]:
              - generic "Structures" [ref=e51] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=e52]:
            - button "Vertex" [ref=e53] [cursor=pointer]
            - button "Pixel" [pressed] [ref=e54] [cursor=pointer]
          - generic [ref=e55]:
            - button "Add Node" [ref=e56] [cursor=pointer]
            - button "Browse nodes" [ref=e59] [cursor=pointer]
            - button "Up" [disabled] [ref=e62]
            - button "Shortcuts" [ref=e65] [cursor=pointer]
      - complementary [ref=e68]:
        - generic [ref=e69]:
          - heading "Inspector" [level=2] [ref=e70]
          - paragraph [ref=e71]: Select a node to inspect its parameters.
    - contentinfo [ref=e72]:
      - button "Project actions" [ref=e73] [cursor=pointer]
      - status [ref=e74]:
        - button "Read full application status" [disabled] [ref=e75]
      - button "Shader output" [ref=e76] [cursor=pointer]
      - generic [ref=e77]:
        - button "Experimental features" [ref=e79] [cursor=pointer]
        - button "Read object details" [disabled] [ref=e80]
      - button "Hints" [ref=e81] [cursor=pointer]
  - generic:
    - button "Fixture start" [expanded] [ref=e82] [cursor=pointer]
    - dialog "start fixture" [ref=e83]:
      - heading "start fixture" [level=2] [ref=e84]
      - generic [ref=e85]: Read-only start
      - button "Close start" [ref=e86] [cursor=pointer]
    - button "Fixture end" [ref=e87] [cursor=pointer]
    - button "Fixture modal" [expanded] [ref=e88] [cursor=pointer]
    - dialog "modal fixture" [ref=e89]:
      - heading "modal fixture" [level=2] [ref=e90]
      - generic [ref=e91]: Read-only modal
      - button "Close modal" [ref=e92] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import fs from "node:fs";
  3  | import path from "node:path";
  4  | // Public presentation primitive on disposable DOM; not a physical-device qualification.
  5  | test("S06 shared floating consumers bound alignments focus semantics and disposal independently", async ({page}) => {
  6  |   await page.goto("/");
  7  |   await page.evaluate(async () => {
  8  |     const url = "/src/ui/floating.ts", {floatingSurface} = await import(url);
  9  |     const fixture = document.createElement("div"); document.body.append(fixture);
  10 |     const consumers = ["start", "end", "modal"].map((kind, i) => {
  11 |       const trigger = document.createElement("button"), content = document.createElement("div");
  12 |       trigger.textContent = "Fixture " + kind;
  13 |       Object.assign(trigger.style,{position:"fixed",left:(i*190+20)+"px",bottom:"90px",zIndex:"1000"});
  14 |       fixture.append(trigger); content.tabIndex = 0; content.textContent = "Read-only "+kind;
  15 |       const view = floatingSurface({host:fixture, trigger, content, title:kind+" fixture",closeLabel:"Close "+kind,
  16 |         kind:kind === "modal" ? "modal" : "anchored",align:kind === "end" ? "end" : "start",width:320,maxHeight:220,dismissOutside:false});
  17 |       trigger.onclick = () => view.toggle(); return {view,trigger};
  18 |     });
  19 |     (window as any).__floatingFixture = {consumers, dispose: () => { consumers.forEach(c => c.view.dispose()); fixture.remove(); }};
  20 |   });
  21 |   await page.getByRole("button", {name:"Fixture start",exact:true}).click();
  22 |   await page.getByRole("button", {name:"Fixture end",exact:true}).click();
  23 |   await expect(page.getByRole("dialog", {name:"start fixture",exact:true})).toBeVisible();
  24 |   await page.keyboard.press("Escape");
  25 |   await expect(page.getByRole("button", {name:"Fixture end",exact:true})).toBeFocused();
  26 |   await expect(page.getByRole("dialog", {name:"start fixture",exact:true})).toBeVisible();
  27 |   const records = [];
  28 |   for (const width of [1440,620]) {
  29 |     await page.setViewportSize({width,height:380});
  30 |     const box = await page.getByRole("dialog", {name:"start fixture",exact:true}).boundingBox();
  31 |     expect(box!.x).toBeGreaterThanOrEqual(8); expect(box!.x+box!.width).toBeLessThanOrEqual(width-8);
  32 |     expect(box!.y+box!.height).toBeLessThanOrEqual(372); records.push(box);
  33 |   }
  34 |   await page.getByRole("button", {name:"Fixture modal",exact:true}).click();
  35 |   const modal = page.getByRole("dialog", {name:"modal fixture",exact:true});
> 36 |   for (let i=0;i<5;i++) { await page.keyboard.press("Tab"); expect(await modal.evaluate(e => e.contains(document.activeElement))).toBe(true); }
     |                                                                                                                                   ^ Error: expect(received).toBe(expected) // Object.is equality
  37 |   await page.keyboard.press("Escape"); await expect(page.getByRole("button",{name:"Fixture modal",exact:true})).toBeFocused();
  38 |   await page.evaluate(() => (window as any).__floatingFixture.dispose());
  39 |   const late = await page.evaluate(() => (window as any).__floatingFixture.consumers.map((c:any) => c.view.open()));
  40 |   expect(late).toEqual([false,false,false]);
  41 |   await expect(page.locator("dialog[aria-label$='fixture']")).toHaveCount(0);
  42 |   fs.writeFileSync(path.join(process.env.GRAPE_EVIDENCE_DIR!,"floating-lifetime.json"), JSON.stringify({records,late,method:"Multiple real shared consumers; trusted open/Escape/Tab plus explicit synthetic disposal boundary"},null,2));
  43 | });
  44 | 
```