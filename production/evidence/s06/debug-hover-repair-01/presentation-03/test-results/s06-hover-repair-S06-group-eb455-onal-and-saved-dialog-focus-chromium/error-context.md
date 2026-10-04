# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-hover-repair.spec.ts >> S06 grouped project actions preserve nested Personal and saved-dialog focus
- Location: ..\..\..\production\tests\browser\s06-hover-repair.spec.ts:93:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('dialog', { name: 'Personal Library', exact: true }).getByRole('searchbox')

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
    - button "Undo" [disabled] [ref=e24]
    - button "Redo" [disabled] [ref=e27]
    - button "Delete selected" [ref=e30] [cursor=pointer]
    - alert
  - main [ref=e31]:
    - generic [ref=e33]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e34]:
        - group "Image output" [ref=e35]:
          - heading "Image output" [level=3] [ref=e36]
          - generic [ref=e37]:
            - button "Image output input color" [ref=e38] [cursor=pointer]
            - generic [ref=e39]: color
            - generic [ref=e40]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e41]:
          - button "New subgraph" [ref=e42] [cursor=pointer]
          - button "Library subgraph" [ref=e43] [cursor=pointer]
          - button "Encapsulate" [ref=e44] [cursor=pointer]
          - button "Make independent" [ref=e45] [cursor=pointer]
          - button "Enter subgraph" [ref=e46] [cursor=pointer]
          - button "Arrange nodes" [ref=e47] [cursor=pointer]
          - button "Frame selection" [ref=e48] [cursor=pointer]
          - group [ref=e49]:
            - generic "Local clipboard" [ref=e50] [cursor=pointer]
          - group [ref=e51]:
            - generic "Structures" [ref=e52] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e53]:
          - button "Vertex" [ref=e54] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e55] [cursor=pointer]
        - generic [ref=e56]:
          - button "Add Node" [ref=e57] [cursor=pointer]
          - button "Browse nodes" [ref=e60] [cursor=pointer]
          - button "Up" [disabled] [ref=e63]
          - button "Shortcuts" [ref=e66] [cursor=pointer]
    - complementary [ref=e69]:
      - generic [ref=e70]:
        - heading "Inspector" [level=2] [ref=e71]
        - paragraph [ref=e72]: Select a node to inspect its parameters.
  - contentinfo [ref=e73]:
    - button "Project actions" [expanded] [ref=e74] [cursor=pointer]
    - status [ref=e75]:
      - button "Read full application status" [disabled] [ref=e76]
    - button "Shader output" [ref=e77] [cursor=pointer]
    - generic [ref=e78]:
      - button "Experimental features" [ref=e80] [cursor=pointer]
      - button "Read object details" [disabled] [ref=e81]
    - button "Hints" [ref=e82] [cursor=pointer]
  - dialog [ref=e83]:
    - heading "Personal Library" [level=2] [ref=e84]
    - paragraph [ref=e85]: Saved in this browser. Export a package to keep a file copy. Select a subgraph to save it.
    - searchbox "Search Personal Library" [active] [ref=e86]
    - status [ref=e87]: 0 saved subgraphs
    - button "Save selected subgraph" [ref=e88] [cursor=pointer]
    - button "Export selected subgraph" [ref=e89] [cursor=pointer]
    - button "Import Personal package" [ref=e90]
    - button "Refresh Personal" [ref=e91] [cursor=pointer]
    - button "Close Personal" [ref=e92] [cursor=pointer]
    - button "Close Personal details" [ref=e93] [cursor=pointer]
  - menu "Project actions" [ref=e94]:
    - heading "Project actions" [level=2] [ref=e95]
    - generic [ref=e96]:
      - menuitem "New document" [ref=e97] [cursor=pointer]
      - menuitem "Upgrade subgraph owners" [ref=e100] [cursor=pointer]
      - menuitem "Open saved" [ref=e101] [cursor=pointer]
      - menuitem "Export JSON" [ref=e104] [cursor=pointer]
      - menuitem "Export PNG" [ref=e107] [cursor=pointer]
      - menuitem "Open file" [ref=e110] [cursor=pointer]
      - menuitem "Second Canvas" [ref=e113] [cursor=pointer]
      - menuitem "Lock editing" [ref=e116] [cursor=pointer]
      - menuitem "Personal Library" [ref=e119] [cursor=pointer]
    - button "Close project actions" [ref=e120] [cursor=pointer]
```

# Test source

```ts
  3   | import path from "node:path";
  4   | import { createNode } from "./create-node.ts";
  5   | import { clickAction } from "../fixtures/public-actions.ts";
  6   | const out = process.env.GRAPE_EVIDENCE_DIR!;
  7   | const save = (name: string, value: unknown) => fs.writeFileSync(path.join(out, name + ".json"), JSON.stringify(value, null, 2));
  8   | async function enable(p: Page) {
  9   |   await p.getByRole("button", { name: "Experimental features", exact: true }).click();
  10  |   await p.getByRole("checkbox", { name: "Show object information instead of normal hover hints" }).check();
  11  |   await p.keyboard.press("Escape");
  12  | }
  13  | async function exported(p: Page) {
  14  |   const wait = p.waitForEvent("download"); await clickAction(p, "Export JSON");
  15  |   return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8"));
  16  | }
  17  | async function fixture(p: Page) {
  18  |   await p.goto("/"); await createNode(p, "Color RGBA");
  19  |   const node = p.locator(".node").filter({has: p.getByRole("heading", {name:"Color RGBA", exact:true})});
  20  |   await node.getByRole("heading").click();
  21  |   return node;
  22  | }
  23  | async function keyboardFocus(p: Page, target: Locator) {
  24  |   for (let i = 0; i < 160; i++) {
  25  |     if (await target.evaluate(e => e === document.activeElement)) return;
  26  |     await p.keyboard.press("Shift+Tab");
  27  |   }
  28  |   throw Error("Target unreachable by trusted Tab");
  29  | }
  30  | for (const width of [1440, 1920]) for (const kind of ["Node", "Port", "Parameter Widget"]) {
  31  |   test(`S06 repair continuous 80-step ${kind} details ${width}`, async ({page}) => {
  32  |     await page.setViewportSize({width,height:1000});
  33  |     const node = await fixture(page), before = await exported(page);
  34  |     await enable(page);
  35  |     const target = kind === "Node" ? node.getByRole("heading") : kind === "Port" ? node.locator("[data-port]").first() : page.getByRole("textbox", {name:"R", exact:true});
  36  |     await target.hover();
  37  |     await expect(page.locator(".hover-summary")).toContainText(kind);
  38  |     const read = page.getByRole("button", {name:"Read object details",exact:true}), to = (await read.boundingBox())!;
  39  |     await page.evaluate(() => {
  40  |       (window as any).__travel = [];
  41  |       for (const type of ["pointerover", "pointermove", "pointerdown", "pointerup", "click"]) document.addEventListener(type, e => {
  42  |         const p = e as PointerEvent;
  43  |         (window as any).__travel.push({type, trusted:e.isTrusted,x:p.clientX,y:p.clientY,target:(e.target as Element).tagName});
  44  |       }, true);
  45  |     });
  46  |     await page.mouse.move(to.x+to.width/2, to.y+to.height/2, {steps:80});
  47  |     await page.mouse.down(); await page.mouse.up();
  48  |     const dialog = page.getByRole("dialog", {name:"Object information",exact:true});
  49  |     await expect(dialog).toBeVisible();
  50  |     const text = await dialog.getByRole("region").innerText();
  51  |     expect(text.startsWith(kind+":")).toBeTruthy();
  52  |     await page.screenshot({path:path.join(out, `continuous-${width}-${kind.replaceAll(" ","-")}.png`)});
  53  |     save(`continuous-${width}-${kind.replaceAll(" ","-")}`, {text,events:await page.evaluate(() => (window as any).__travel)});
  54  |     await page.keyboard.press("Escape"); await expect(read).toBeFocused();
  55  |     expect(await exported(page)).toEqual(before);
  56  |   });
  57  | }
  58  | for (const focusKind of ["control", "node", "port"]) for (const hoverKind of ["node", "panel", "control"]) {
  59  |   test(`S06 repair F2 focused ${focusKind} versus hovered ${hoverKind}`, async ({page}) => {
  60  |     const node = await fixture(page); await enable(page);
  61  |     const focus = focusKind === "control" ? page.getByRole("button", {name:"Generate GLSL",exact:true}) : focusKind === "node" ? node : node.locator("[data-port]").first();
  62  |     await keyboardFocus(page, focus);
  63  |     const identity = await focus.getAttribute("data-node") ?? await focus.getAttribute("data-node-id");
  64  |     const other = hoverKind === "node" ? page.getByRole("heading", {name:"Image output",exact:true}) : hoverKind === "panel" ? page.locator(".inspector h2") : page.getByRole("button", {name:"Save",exact:true});
  65  |     await other.hover();
  66  |     await expect(focus).toBeFocused();
  67  |     await page.keyboard.press("F2");
  68  |     const dialog = page.getByRole("dialog", {name:"Object information",exact:true});
  69  |     await expect(dialog).toBeVisible();
  70  |     const text = await dialog.getByRole("region").innerText();
  71  |     expect(text).toContain(focusKind === "control" ? "UI control: Generate GLSL" : focusKind === "node" ? "Node: Color RGBA" : "Port:");
  72  |     if (identity) expect(text).toContain(identity);
  73  |     await page.keyboard.press("Escape"); await expect(focus).toBeFocused();
  74  |     save(`f2-${focusKind}-${hoverKind}`, {identity,text,method:"Trusted Tab to live focus, incidental hover, trusted F2/Escape"});
  75  |   });
  76  | }
  77  | test("S06 repair compact disclosures share presentation without model changes", async ({page}) => {
  78  |   await page.goto("/"); const before = await exported(page);
  79  |   await expect(page.locator("#code")).not.toBeVisible();
  80  |   for (const name of ["Project actions", "Shader output", "Hints", "Experimental features"]) {
  81  |     const button = page.getByRole("button", {name,exact:true}); await button.click();
  82  |     await expect(button).toHaveAttribute("aria-expanded","true");
  83  |     await page.keyboard.press("Escape"); await expect(button).toBeFocused();
  84  |     await expect(button).toHaveAttribute("aria-expanded","false");
  85  |   }
  86  |   await page.getByRole("button", {name:"Generate GLSL",exact:true}).click();
  87  |   await page.getByRole("button", {name:"Shader output",exact:true}).click();
  88  |   await expect(page.getByRole("list", {name:"Diagnostics",exact:true})).toBeVisible();
  89  |   await expect(page.getByRole("button", {name:"Locate node",exact:true}).first()).toBeVisible();
  90  |   await page.getByRole("button", {name:"Close shader output",exact:true}).click();
  91  |   expect(await exported(page)).toEqual(before);
  92  | });
  93  | test("S06 grouped project actions preserve nested Personal and saved-dialog focus", async ({page}) => {
  94  |   await page.goto("/");
  95  |   const trigger=page.getByRole("button",{name:"Project actions",exact:true});
  96  |   await trigger.click();
  97  |   const menu=page.getByRole("menu",{name:"Project actions",exact:true});
  98  |   await expect(menu).toBeVisible(); await page.keyboard.press("End");
  99  |   expect(await menu.evaluate(e=>e.contains(document.activeElement))).toBe(true);
  100 |   await page.keyboard.press("Home"); await expect(menu.getByRole("menuitem").first()).toBeFocused();
  101 |   const personal=page.getByRole("menuitem",{name:"Personal Library",exact:true});
  102 |   await personal.click(); const dialog=page.getByRole("dialog",{name:"Personal Library",exact:true});
> 103 |   await dialog.getByRole("searchbox").fill("unavailable-entry");
      |                                       ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  104 |   await dialog.getByRole("button",{name:"Close",exact:true}).click();
  105 |   await expect(personal).toBeVisible();await expect(personal).toBeFocused();
  106 |   await page.keyboard.press("Escape");await expect(trigger).toBeFocused();
  107 |   await trigger.click(); const open=page.getByRole("menuitem",{name:"Open saved",exact:true});
  108 |   await open.click();await page.locator("#cancel-open").click();await expect(open).toBeVisible();await expect(open).toBeFocused();
  109 | });
  110 | 
```