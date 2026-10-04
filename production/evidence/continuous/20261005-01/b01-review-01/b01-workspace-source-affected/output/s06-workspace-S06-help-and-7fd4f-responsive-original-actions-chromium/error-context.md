# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-workspace.spec.ts >> S06 help and context menu keyboard, readonly browsing and responsive original actions
- Location: ..\..\production\tests\browser\s06-workspace.spec.ts:144:1

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
      - generic "Implementation dc653519515e167c75d967930defafcf19422197" [ref=e9]: S06-debug-dc65351
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
    - button "Delete selected" [disabled] [ref=e29]
    - alert
  - main [ref=e30]:
    - generic [ref=e32]:
      - tablist "canvas-1 panels" [ref=e33]:
        - tab "Canvas · canvas-1" [selected] [ref=e34] [cursor=pointer]
        - generic [ref=e35]:
          - button "Collapse active panel in canvas-1" [ref=e36] [cursor=pointer]: ▾
          - button "Panel options in canvas-1" [ref=e37] [cursor=pointer]: ⋯
      - generic "Shader graph canvas" [ref=e40]:
        - generic:
          - generic:
            - generic:
              - group "Image output" [ref=e41]:
                - heading "Image output" [level=3] [ref=e42]
                - generic [ref=e43]:
                  - button "Image output input color" [ref=e44] [cursor=pointer]
                  - generic [ref=e45]: color
                  - generic [ref=e46]: vec4
                  - generic "Current local value; edit in Inspector" [ref=e47]: "[0,0,0,0]"
              - group "Multiply" [ref=e48]:
                - heading "Multiply" [level=3] [ref=e49]
                - generic [ref=e50]:
                  - button "Multiply input a" [ref=e51] [cursor=pointer]
                  - generic [ref=e52]: a
                  - generic [ref=e53]: float
                  - generic "Current local value; edit in Inspector" [ref=e54]: "1"
                - generic [ref=e55]:
                  - button "Multiply input b" [ref=e56] [cursor=pointer]
                  - generic [ref=e57]: b
                  - generic [ref=e58]: float
                  - generic "Current local value; edit in Inspector" [ref=e59]: "2"
                - generic [ref=e60]:
                  - button "Multiply output result" [ref=e61] [cursor=pointer]
                  - generic [ref=e62]: result
                  - generic [ref=e63]: float
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e64]:
          - button "New subgraph" [ref=e65] [cursor=pointer]
          - button "Library subgraph" [ref=e66] [cursor=pointer]
          - button "Encapsulate" [ref=e67] [cursor=pointer]
          - button "Make independent" [ref=e68] [cursor=pointer]
          - button "Enter subgraph" [ref=e69] [cursor=pointer]
          - button "Arrange nodes" [ref=e70] [cursor=pointer]
          - button "Frame selection" [ref=e71] [cursor=pointer]
          - group [ref=e72]:
            - generic "Local clipboard" [ref=e73] [cursor=pointer]
          - group [ref=e74]:
            - generic "Structures" [ref=e75] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e76]:
          - button "Vertex" [ref=e77] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e78] [cursor=pointer]
        - generic [ref=e79]:
          - button "Add Node" [disabled] [ref=e80]
          - button "Browse nodes" [ref=e83] [cursor=pointer]
          - button "Up" [disabled] [ref=e86]
          - button "Shortcuts" [ref=e89] [cursor=pointer]
  - contentinfo [ref=e92]:
    - button "Project actions" [expanded] [ref=e93] [cursor=pointer]
    - status [ref=e94]:
      - button "Read full application status" [ref=e95] [cursor=pointer]: Export started. Saved status is unchanged.
    - button "Shader output" [ref=e96] [cursor=pointer]
    - button "Panels" [ref=e97] [cursor=pointer]
    - button "Hints" [ref=e98] [cursor=pointer]
  - menu "Project actions" [ref=e99]:
    - heading "Project actions" [level=2] [ref=e100]
    - generic [ref=e101]:
      - group "Documents and library" [ref=e102]:
        - menuitem "New document" [active] [ref=e103] [cursor=pointer]
        - menuitem "Upgrade subgraph owners" [ref=e106] [cursor=pointer]
        - menuitem "Upgrade Image Output" [ref=e107] [cursor=pointer]
        - menuitem "Open saved" [ref=e108] [cursor=pointer]
        - menuitem "Export JSON" [ref=e111] [cursor=pointer]
        - menuitem "Export PNG" [ref=e114] [cursor=pointer]
        - menuitem "Open file" [ref=e117] [cursor=pointer]
        - menuitem "Personal Library" [ref=e120] [cursor=pointer]
      - group "Workspace" [ref=e121]:
        - menuitem "Second Canvas" [ref=e122] [cursor=pointer]
        - menuitemcheckbox "Lock editing" [checked] [ref=e125] [cursor=pointer]
        - menuitem "Add Parameters" [ref=e128] [cursor=pointer]
        - menuitem "Save current layout" [ref=e129] [cursor=pointer]
        - menuitem "Restore current layout" [ref=e130] [cursor=pointer]
        - menuitem "Export current layout" [ref=e131] [cursor=pointer]
        - menuitem "Import current layout" [ref=e132] [cursor=pointer]
        - menuitem "Show hidden panels" [ref=e133] [cursor=pointer]
    - button "Close project actions" [ref=e134] [cursor=pointer]
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