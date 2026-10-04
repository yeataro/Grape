# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-workspace.spec.ts >> S06 catalog literal normalized search, source/type filters, inspect and native text do not edit
- Location: ..\..\production\tests\browser\s06-workspace.spec.ts:21:1

# Error details

```
Error: S06_EVIDENCE_REQUIRED
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - text: Grape
      - generic [ref=e9]: SHADER WORKSPACE
      - generic "Implementation dc653519515e167c75d967930defafcf19422197" [ref=e10]: S06-debug-dc65351
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
      - tablist "canvas-1 panels" [ref=e34]:
        - tab "Canvas · canvas-1" [selected] [ref=e35] [cursor=pointer]
        - generic [ref=e36]:
          - button "Collapse active panel in canvas-1" [ref=e37] [cursor=pointer]: ▾
          - button "Panel options in canvas-1" [ref=e38] [cursor=pointer]: ⋯
      - generic "Shader graph canvas" [ref=e41]:
        - group "Image output" [ref=e42]:
          - heading "Image output" [level=3] [ref=e43]
          - generic [ref=e44]:
            - button "Image output input color" [ref=e45] [cursor=pointer]
            - generic [ref=e46]: color
            - generic [ref=e47]: vec4
            - generic "Current local value; edit in Inspector" [ref=e48]: "[0,0,0,0]"
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e49]:
          - button "New subgraph" [ref=e50] [cursor=pointer]
          - button "Library subgraph" [ref=e51] [cursor=pointer]
          - button "Encapsulate" [ref=e52] [cursor=pointer]
          - button "Make independent" [ref=e53] [cursor=pointer]
          - button "Enter subgraph" [ref=e54] [cursor=pointer]
          - button "Arrange nodes" [ref=e55] [cursor=pointer]
          - button "Frame selection" [ref=e56] [cursor=pointer]
          - group [ref=e57]:
            - generic "Local clipboard" [ref=e58] [cursor=pointer]
          - group [ref=e59]:
            - generic "Structures" [ref=e60] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e61]:
          - button "Vertex" [ref=e62] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e63] [cursor=pointer]
        - generic [ref=e64]:
          - button "Add Node" [ref=e65] [cursor=pointer]
          - button "Browse nodes" [ref=e68] [cursor=pointer]
          - button "Up" [disabled] [ref=e71]
          - button "Shortcuts" [ref=e74] [cursor=pointer]
    - complementary [ref=e77]:
      - generic [ref=e78]:
        - tablist "inspector panels" [ref=e79]:
          - tab "Inspector · inspector" [selected] [ref=e80] [cursor=pointer]
          - generic [ref=e81]:
            - button "Collapse active panel in inspector" [ref=e82] [cursor=pointer]: ▾
            - button "Panel options in inspector" [ref=e83] [cursor=pointer]: ⋯
        - generic [ref=e86]:
          - heading "Inspector" [level=2] [ref=e87]
          - paragraph [ref=e88]: Select a node to inspect its parameters.
    - separator "right sidebar width" [ref=e89]
  - contentinfo [ref=e90]:
    - button "Project actions" [active] [ref=e91] [cursor=pointer]
    - status [ref=e92]:
      - button "Read full application status" [ref=e93] [cursor=pointer]: Export started. Saved status is unchanged.
    - button "Shader output" [ref=e94] [cursor=pointer]
    - button "Panels" [ref=e95] [cursor=pointer]
    - button "Hints" [ref=e96] [cursor=pointer]
```

# Test source

```ts
  1   | import { requiredOutput } from "../fixtures/required-output.ts";
  2   | import { test, expect, type Page } from "@playwright/test";
  3   | import fs from "node:fs";
  4   | import path from "node:path";
  5   | import { createNode } from "./create-node.ts";
  6   | import { clickAction } from "../fixtures/public-actions.ts";
  7   | const evidence = () => {
  8   |   const out = process.env.GRAPE_EVIDENCE_DIR!;
  9   |   if (!path.isAbsolute(out) || !out.includes("s06"))
> 10  |     throw Error("S06_EVIDENCE_REQUIRED");
      |           ^ Error: S06_EVIDENCE_REQUIRED
  11  |   return out;
  12  | };
  13  | async function documentOf(page: Page) {
  14  |   const wait = page.waitForEvent("download");
  15  |   await clickAction(page, "Export JSON");
  16  |   return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8"));
  17  | }
  18  | test.beforeEach(async ({ page }) => {
  19  |   await page.goto("/");
  20  | });
  21  | test("S06 catalog literal normalized search, source/type filters, inspect and native text do not edit", async ({
  22  |   page,
  23  | }) => {
  24  |   const before = await documentOf(page);
  25  |   await page.getByRole("button", { name: "Browse nodes", exact: true }).click();
  26  |   const dialog = page.getByRole("dialog", { name: "Node catalog" }),
  27  |     search = dialog.getByLabel("Search nodes", { exact: true });
  28  |   await search.fill("ＭＵＬＴＩＰＬＹ");
  29  |   await expect(
  30  |     dialog.getByRole("button", { name: "Inspect Multiply", exact: true }),
  31  |   ).toBeVisible();
  32  |   await dialog
  33  |     .getByRole("button", { name: "Inspect Multiply", exact: true })
  34  |     .click();
  35  |   await expect(dialog.locator(".catalog-detail")).toContainText(
  36  |     "input a: glsl.float",
  37  |   );
  38  |   await search.fill("[.*");
  39  |   await expect(dialog).toContainText("No matching nodes");
  40  |   await search.fill("");
  41  |   await dialog
  42  |     .getByLabel("Node source", { exact: true })
  43  |     .selectOption("grape.nodes.fixed-values");
  44  |   await expect(
  45  |     dialog.getByRole("button", { name: "Inspect Float", exact: true }),
  46  |   ).toBeVisible();
  47  |   await expect(
  48  |     dialog.getByRole("button", { name: "Inspect Multiply", exact: true }),
  49  |   ).toHaveCount(0);
  50  |   await dialog
  51  |     .getByLabel("Node port type", { exact: true })
  52  |     .selectOption("glsl.vec3");
  53  |   await expect(
  54  |     dialog.getByRole("button", { name: "Inspect Vector 3", exact: true }),
  55  |   ).toBeVisible();
  56  |   await expect(
  57  |     dialog.getByRole("button", { name: "Inspect Float", exact: true }),
  58  |   ).toHaveCount(0);
  59  |   await search.fill("typed");
  60  |   await search.press("Control+z");
  61  |   await page.keyboard.press("Escape");
  62  |   expect(await documentOf(page)).toEqual(before);
  63  |   await page.screenshot({
  64  |     path: path.join(evidence(), "s06-catalog-inspection.png"),
  65  |   });
  66  | });
  67  | test("S06 blank double-click and Tab create previews; movement is independent, cancel and stage change add no History", async ({
  68  |   page,
  69  | }) => {
  70  |   const canvas = page.locator(".canvas"),
  71  |     rect = (await canvas.boundingBox())!,
  72  |     before = await documentOf(page);
  73  |   await page.mouse.dblclick(rect.x + 260, rect.y + 250);
  74  |   const dialog = page.getByRole("dialog", { name: "Node catalog" });
  75  |   await expect(dialog).toBeVisible();
  76  |   await dialog.getByLabel("Search nodes", { exact: true }).fill("Multiply");
  77  |   const title = dialog.locator("header"),
  78  |     box = (await title.boundingBox())!,
  79  |     position = await dialog.evaluate((e) => [e.style.left, e.style.top]);
  80  |   await page.mouse.move(box.x + 55, box.y + 10);
  81  |   await page.mouse.down();
  82  |   await page.mouse.move(box.x + 120, box.y + 55, { steps: 5 });
  83  |   await page.keyboard.press("Escape");
  84  |   await page.mouse.up();
  85  |   await expect(dialog).toBeHidden();
  86  |   expect(await documentOf(page)).toEqual(before);
  87  |   await page.mouse.click(rect.x + 240, rect.y + 240);
  88  |   await page.keyboard.press("Tab");
  89  |   await expect(dialog).toBeVisible();
  90  |   await dialog.getByLabel("Search nodes", { exact: true }).fill("Multiply");
  91  |   await page.keyboard.press("Enter");
  92  |   await expect(page.locator(".creation-preview")).toBeVisible();
  93  |   await expect(canvas.locator(".nodes .node")).toHaveCount(1);
  94  |   await page.keyboard.press("Escape");
  95  |   await expect(page.locator(".creation-preview")).toBeHidden();
  96  |   await page.getByRole("button", { name: "Add Node", exact: true }).click();
  97  |   await page.getByRole("button", { name: "Vertex", exact: true }).click();
  98  |   await expect(dialog).toBeHidden();
  99  |   expect(await documentOf(page)).toEqual(before);
  100 |   await expect(
  101 |     page.getByRole("button", { name: "Undo", exact: true }),
  102 |   ).toBeDisabled();
  103 |   expect(position.length).toBe(2);
  104 | });
  105 | test("S06 connected input blank drop disconnects once and Undo restores occupied input", async ({
  106 |   page,
  107 | }) => {
  108 |   await createNode(page, "Float (fixed)");
  109 |   const source = page
  110 |       .locator(".nodes .node")
```