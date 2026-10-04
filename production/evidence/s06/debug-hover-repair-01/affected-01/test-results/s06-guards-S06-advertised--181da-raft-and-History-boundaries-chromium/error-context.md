# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-guards.spec.ts >> S06 advertised view and edit shortcuts preserve gesture, draft and History boundaries
- Location: ..\..\..\production\tests\browser\s06-guards.spec.ts:14:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "transform: translate(358px, 64.25px) scale(1.5);"
Received: "transform: translate(-24.5455px, 72.161px) scale(1.3447);"
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
              - group "Multiply" [ref=e41]:
                - heading "Multiply" [level=3] [ref=e42]
                - generic [ref=e43]:
                  - button "Multiply input a" [ref=e44] [cursor=pointer]
                  - generic [ref=e45]: a
                  - generic [ref=e46]: float
                  - generic "Current local value; edit in Inspector" [ref=e47]: "1"
                - generic [ref=e48]:
                  - button "Multiply input b" [ref=e49] [cursor=pointer]
                  - generic [ref=e50]: b
                  - generic [ref=e51]: float
                  - generic "Current local value; edit in Inspector" [ref=e52]: "2"
                - generic [ref=e53]:
                  - button "Multiply output result" [ref=e54] [cursor=pointer]
                  - generic [ref=e55]: result
                  - generic [ref=e56]: float
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e57]:
          - button "New subgraph" [ref=e58] [cursor=pointer]
          - button "Library subgraph" [ref=e59] [cursor=pointer]
          - button "Encapsulate" [ref=e60] [cursor=pointer]
          - button "Make independent" [ref=e61] [cursor=pointer]
          - button "Enter subgraph" [ref=e62] [cursor=pointer]
          - button "Arrange nodes" [ref=e63] [cursor=pointer]
          - button "Frame selection" [ref=e64] [cursor=pointer]
          - group [ref=e65]:
            - generic "Local clipboard" [ref=e66] [cursor=pointer]
          - group [ref=e67]:
            - generic "Structures" [ref=e68] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e69]:
          - button "Vertex" [ref=e70] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e71] [cursor=pointer]
        - generic [ref=e72]:
          - button "Add Node" [ref=e73] [cursor=pointer]
          - button "Browse nodes" [ref=e76] [cursor=pointer]
          - button "Up" [disabled] [ref=e79]
          - button "Shortcuts" [ref=e82] [cursor=pointer]
        - dialog "Keyboard shortcuts" [ref=e85]:
          - heading "Keyboard shortcuts" [level=2] [ref=e86]
          - generic [ref=e87]:
            - generic [ref=e88]: Tab
            - generic [ref=e89]: Create node at canvas center
            - generic [ref=e90]: Double-click blank canvas
            - generic [ref=e91]: Create node at pointer
            - generic [ref=e92]: ↑ / ↓ / Enter
            - generic [ref=e93]: Choose a creation result
            - generic [ref=e94]: Escape
            - generic [ref=e95]: Cancel placement, menu or active drag
            - generic [ref=e96]: Ctrl+Z / Ctrl+Shift+Z
            - generic [ref=e97]: Undo / Redo graph edit
            - generic [ref=e98]: Delete / Backspace
            - generic [ref=e99]: Delete selected nodes
            - generic [ref=e100]: H / F
            - generic [ref=e101]: Frame graph / selected nodes
            - generic [ref=e102]: Shift+F10
            - generic [ref=e103]: Open canvas or node menu
            - generic [ref=e104]: "?"
            - generic [ref=e105]: Keyboard shortcuts
          - button "Close shortcuts" [active] [ref=e106] [cursor=pointer]
    - complementary [ref=e107]:
      - generic [ref=e108]:
        - heading "Inspector" [level=2] [ref=e109]
        - paragraph [ref=e110]: Multiply
        - button "Rename node" [ref=e111] [cursor=pointer]
        - generic [ref=e112]:
          - generic [ref=e114]:
            - generic [ref=e115]: A
            - textbox "A" [ref=e116]: "1"
            - alert
          - generic [ref=e118]:
            - generic [ref=e119]: B
            - textbox "B" [ref=e120]: "2"
            - alert
  - contentinfo [ref=e121]:
    - button "Project actions" [ref=e122] [cursor=pointer]
    - status [ref=e123]:
      - button "Read full application status" [ref=e124] [cursor=pointer]: Export started. Saved status is unchanged.
    - button "Shader output" [ref=e125] [cursor=pointer]
    - generic [ref=e126]:
      - button "Experimental features" [ref=e128] [cursor=pointer]
      - button "Read object details" [disabled] [ref=e129]
    - button "Hints" [ref=e130] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import fs from "node:fs";
  3   | import path from "node:path";
  4   | import { createNode } from "./create-node.ts";
  5   | import { clickAction } from "../fixtures/public-actions.ts";
  6   | async function doc(page: Page) {
  7   |   const wait = page.waitForEvent("download");
  8   |   await clickAction(page, "Export JSON");
  9   |   return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8"));
  10  | }
  11  | test.beforeEach(async ({ page }) => {
  12  |   await page.goto("/");
  13  | });
  14  | test("S06 advertised view and edit shortcuts preserve gesture, draft and History boundaries", async ({
  15  |   page,
  16  | }) => {
  17  |   await createNode(page, "Multiply");
  18  |   const before = await doc(page),
  19  |     canvas = page.locator(".canvas"),
  20  |     heading = page.getByRole("heading", { name: "Multiply", exact: true });
  21  |   await heading.click();
  22  |   await page.keyboard.press("h");
  23  |   expect(await doc(page)).toEqual(before);
  24  |   await heading.click();
  25  |   await page.keyboard.press("f");
  26  |   expect(await doc(page)).toEqual(before);
  27  |   await heading.click();
  28  |   const r = (await heading.boundingBox())!;
  29  |   await page.mouse.move(r.x + 60, r.y + 14);
  30  |   await page.mouse.down();
  31  |   await page.mouse.move(r.x + 100, r.y + 30, { steps: 4 });
  32  |   const view = await canvas.locator(".viewport").getAttribute("style");
  33  |   await page.keyboard.press("h");
  34  |   await page.keyboard.press("?");
  35  |   await page.keyboard.press("Tab");
> 36  |   expect(await canvas.locator(".viewport").getAttribute("style")).toBe(view);
      |                                                                   ^ Error: expect(received).toBe(expected) // Object.is equality
  37  |   await expect(page.getByRole("dialog", { name: "Node catalog" })).toBeHidden();
  38  |   await expect(
  39  |     page.getByRole("dialog", { name: "Keyboard shortcuts" }),
  40  |   ).toBeHidden();
  41  |   await page.keyboard.press("Escape");
  42  |   await page.mouse.up();
  43  |   expect(await doc(page)).toEqual(before);
  44  |   await heading.click();
  45  |   await page.keyboard.press("Delete");
  46  |   expect(
  47  |     (await doc(page)).graph.stages.find((s: any) => s.key === "pixel").network
  48  |       .nodes,
  49  |   ).toHaveLength(1);
  50  |   await page.keyboard.press("Control+z");
  51  |   expect(await doc(page)).toEqual(before);
  52  |   await page.keyboard.press("Control+Shift+z");
  53  |   expect(
  54  |     (await doc(page)).graph.stages.find((s: any) => s.key === "pixel").network
  55  |       .nodes,
  56  |   ).toHaveLength(1);
  57  | });
  58  | test("S06 Canvas connection failure persists across movement and unrelated successful actions until matching recovery", async ({
  59  |   page,
  60  | }) => {
  61  |   await createNode(page, "Float");
  62  |   await createNode(page, "Multiply");
  63  |   const outputs = page.locator(".nodes [data-direction=output]");
  64  |   await outputs.nth(0).click();
  65  |   await outputs.nth(1).click();
  66  |   await expect(page.locator(".canvas-notice")).toContainText("PORT_DIRECTION");
  67  |   const before = await doc(page),
  68  |     r = (await page.locator(".canvas").boundingBox())!;
  69  |   await page.mouse.move(r.x + 450, r.y + 400, { steps: 5 });
  70  |   await clickAction(page, "Save");
  71  |   await expect(page.locator(".canvas-notice")).toContainText("PORT_DIRECTION");
  72  |   expect(await doc(page)).toEqual(before);
  73  |   await outputs.first().click();
  74  |   await page.locator(".nodes [data-direction=input]").first().click();
  75  |   await expect(page.locator(".canvas-notice")).not.toContainText(
  76  |     "PORT_DIRECTION",
  77  |   );
  78  | });
  79  | test("S06 category collapse survives query changes and whitespace uses the tree without a Graph edit", async ({
  80  |   page,
  81  | }) => {
  82  |   const before = await doc(page);
  83  |   await page.getByRole("button", { name: "Browse nodes", exact: true }).click();
  84  |   const catalog = page.getByRole("dialog", { name: "Node catalog" }),
  85  |     search = catalog.getByLabel("Search nodes", { exact: true }),
  86  |     group = catalog.locator(".catalog-list details").first();
  87  |   const label = await group.locator(":scope > summary").textContent();
  88  |   await group.locator(":scope > summary").click();
  89  |   await expect(group).not.toHaveAttribute("open");
  90  |   await search.fill("Multiply");
  91  |   await expect(
  92  |     catalog.getByRole("button", { name: "Inspect Multiply", exact: true }),
  93  |   ).toBeVisible();
  94  |   await search.fill("   ");
  95  |   const restored = catalog.locator(".catalog-list details").first();
  96  |   await expect(restored.locator(":scope > summary")).toHaveText(label!);
  97  |   await expect(restored).not.toHaveAttribute("open");
  98  |   await page.keyboard.press("Escape");
  99  |   expect(await doc(page)).toEqual(before);
  100 | });
  101 | test("S06 Personal search and inspect are readonly, malformed import survives unrelated success, and insert restores one Undo", async ({
  102 |   page,
  103 | }) => {
  104 |   await createNode(page, "Float");
  105 |   await page.locator(".nodes [data-direction=output]").click();
  106 |   await page.locator(".nodes [data-direction=input]").click();
  107 |   await page.getByRole("button", { name: "New subgraph", exact: true }).click();
  108 |   await clickAction(page, "Personal Library");
  109 |   const dialog = page.locator("dialog[open]");
  110 |   await page
  111 |     .getByRole("button", { name: "Save selected subgraph", exact: true })
  112 |     .click();
  113 |   await expect(dialog.locator("[role=status]")).toContainText("Saved");
  114 |   const search = dialog.getByLabel("Search Personal Library");
  115 |   await search.fill("ＳＵＢＧＲＡＰＨ");
  116 |   await expect(
  117 |     dialog.getByRole("button", { name: "Inspect Subgraph", exact: true }),
  118 |   ).toBeVisible();
  119 |   await search.fill("missing");
  120 |   await expect(dialog.locator("[data-personal-file]:visible")).toHaveCount(0);
  121 |   await search.fill("Subgraph");
  122 |   await dialog
  123 |     .getByRole("button", { name: "Inspect Subgraph", exact: true })
  124 |     .click();
  125 |   await expect(dialog.locator("pre")).toContainText("input Value: glsl.vec4");
  126 |   await dialog.getByLabel("Import Personal package").setInputFiles({
  127 |     name: "bad.json",
  128 |     mimeType: "application/json",
  129 |     buffer: Buffer.from('{"bad":true}'),
  130 |   });
  131 |   await expect(page.locator("#message")).toContainText("PERSONAL_FORMAT");
  132 |   await dialog
  133 |     .getByRole("button", { name: "Refresh Personal", exact: true })
  134 |     .click();
  135 |   await expect(page.locator("#message")).toContainText("PERSONAL_FORMAT");
  136 |   await dialog
```