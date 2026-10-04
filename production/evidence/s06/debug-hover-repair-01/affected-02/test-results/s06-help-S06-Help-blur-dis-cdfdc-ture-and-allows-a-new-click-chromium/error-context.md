# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-help.spec.ts >> S06 Help blur disarms incomplete backdrop gesture and allows a new click
- Location: ..\..\..\production\tests\browser\s06-help.spec.ts:103:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForEvent: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for event "download"
============================================================
```

# Page snapshot

```yaml
- generic [ref=f2e2]:
  - banner [ref=f2e3]:
    - generic [ref=f2e4]:
      - text: Grape
      - generic [ref=f2e9]: SHADER WORKSPACE
      - generic "No candidate identity injected" [ref=f2e10]: Development · unversioned
      - button "本輪更新" [ref=f2e11] [cursor=pointer]
    - navigation "Document actions" [ref=f2e12]:
      - button "Save" [ref=f2e13] [cursor=pointer]
      - button "Generate GLSL" [ref=f2e16] [cursor=pointer]
    - generic [ref=f2e19]:
      - generic [ref=f2e20]: Unsaved changes
      - generic [ref=f2e21]: Host-free
  - generic [ref=f2e23]:
    - button "Undo" [disabled] [ref=f2e24]
    - button "Redo" [disabled] [ref=f2e27]
    - button "Delete selected" [ref=f2e30] [cursor=pointer]
    - alert
  - main [ref=f2e31]:
    - generic [ref=f2e33]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=f2e34]:
        - group "Image output" [ref=f2e35]:
          - heading "Image output" [level=3] [ref=f2e36]
          - generic [ref=f2e37]:
            - button "Image output input color" [ref=f2e38] [cursor=pointer]
            - generic [ref=f2e39]: color
            - generic [ref=f2e40]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=f2e41]:
          - button "New subgraph" [ref=f2e42] [cursor=pointer]
          - button "Library subgraph" [ref=f2e43] [cursor=pointer]
          - button "Encapsulate" [ref=f2e44] [cursor=pointer]
          - button "Make independent" [ref=f2e45] [cursor=pointer]
          - button "Enter subgraph" [ref=f2e46] [cursor=pointer]
          - button "Arrange nodes" [ref=f2e47] [cursor=pointer]
          - button "Frame selection" [ref=f2e48] [cursor=pointer]
          - group [ref=f2e49]:
            - generic "Local clipboard" [ref=f2e50] [cursor=pointer]
          - group [ref=f2e51]:
            - generic "Structures" [ref=f2e52] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=f2e53]:
          - button "Vertex" [ref=f2e54] [cursor=pointer]
          - button "Pixel" [pressed] [ref=f2e55] [cursor=pointer]
        - generic [ref=f2e56]:
          - button "Add Node" [ref=f2e57] [cursor=pointer]
          - button "Browse nodes" [ref=f2e60] [cursor=pointer]
          - button "Up" [disabled] [ref=f2e63]
          - button "Shortcuts" [ref=f2e66] [cursor=pointer]
    - complementary [ref=f2e69]:
      - generic [ref=f2e70]:
        - heading "Inspector" [level=2] [ref=f2e71]
        - paragraph [ref=f2e72]: Select a node to inspect its parameters.
  - contentinfo [ref=f2e73]:
    - button "Project actions" [ref=f2e74] [cursor=pointer]
    - status [ref=f2e75]:
      - button "Read full application status" [disabled] [ref=f2e76]
    - button "Shader output" [ref=f2e77] [cursor=pointer]
    - generic [ref=f2e78]:
      - button "Experimental features" [ref=f2e80] [cursor=pointer]
      - button "Read object details" [disabled] [ref=f2e81]
    - button "Hints" [ref=f2e82] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import fs from "node:fs";
  3   | import path from "node:path";
  4   | import { createNode } from "./create-node.ts";
  5   | import { clickAction } from "../fixtures/public-actions.ts";
  6   | 
> 7   | async function documentOf(page: Page) {
      |                     ^ Error: page.waitForEvent: Test timeout of 30000ms exceeded.
  8   |   const wait = page.waitForEvent("download");
  9   |   await clickAction(page, "Export JSON");
  10  |   return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8"));
  11  | }
  12  | test.beforeEach(async ({ page }) => {
  13  |   await page.goto("/");
  14  |   await page.evaluate(() => {
  15  |     (window as any).helpEvents = [];
  16  |     for (const type of [
  17  |       "pointerdown",
  18  |       "pointerup",
  19  |       "pointercancel",
  20  |       "click",
  21  |       "keydown",
  22  |       "focusin",
  23  |     ])
  24  |       document.addEventListener(
  25  |         type,
  26  |         (e) => {
  27  |           const p = e as PointerEvent;
  28  |           (window as any).helpEvents.push({
  29  |             type,
  30  |             trusted: e.isTrusted,
  31  |             target: (e.target as HTMLElement).tagName,
  32  |             x: p.clientX,
  33  |             y: p.clientY,
  34  |             pointerId: p.pointerId,
  35  |             key: (e as KeyboardEvent).key,
  36  |             open: !!document.querySelector("dialog.shortcut-help[open]"),
  37  |           });
  38  |         },
  39  |         true,
  40  |       );
  41  |   });
  42  | });
  43  | test.afterEach(async ({ page }, info) => {
  44  |   const out = process.env.GRAPE_EVIDENCE_DIR!;
  45  |   if (!path.isAbsolute(out) || !out.includes("s06"))
  46  |     throw Error("S06_EVIDENCE_REQUIRED");
  47  |   const file = path.join(
  48  |     out,
  49  |     info.title.replace(/[^a-zA-Z0-9-]/g, "_") + ".json",
  50  |   );
  51  |   fs.writeFileSync(
  52  |     file,
  53  |     JSON.stringify(
  54  |       {
  55  |         title: info.title,
  56  |         events: await page.evaluate(() => (window as any).helpEvents),
  57  |       },
  58  |       null,
  59  |       2,
  60  |     ) + "\n",
  61  |   );
  62  | });
  63  | 
  64  | for (const [start, end, closes] of [
  65  |   ["outside", "inside", false],
  66  |   ["inside", "outside", false],
  67  |   ["outside", "outside", true],
  68  | ] as const)
  69  |   test(`S06 Help natural ${start}-to-${end} gesture preserves document and History`, async ({
  70  |     page,
  71  |   }) => {
  72  |     await createNode(page, "Multiply");
  73  |     const before = await documentOf(page);
  74  |     const opener = page.getByRole("button", { name: "Shortcuts", exact: true });
  75  |     await opener.click();
  76  |     const help = page.getByRole("dialog", { name: "Keyboard shortcuts" }),
  77  |       r = (await help.boundingBox())!;
  78  |     const points = {
  79  |       outside: { x: r.x - 20, y: r.y + 20 },
  80  |       inside: { x: r.x + 10, y: r.y + 10 },
  81  |     };
  82  |     await page.mouse.move(points[start].x, points[start].y);
  83  |     await page.mouse.down();
  84  |     await page.mouse.move(points[end].x, points[end].y, { steps: 5 });
  85  |     await page.mouse.up();
  86  |     if (closes) {
  87  |       await expect(help).toBeHidden();
  88  |       await expect(opener).toBeFocused();
  89  |     } else {
  90  |       await expect(help).toBeVisible();
  91  |       await page.keyboard.press("Escape");
  92  |       await expect(opener).toBeFocused();
  93  |     }
  94  |     expect(await documentOf(page)).toEqual(before);
  95  |     await page.getByRole("button", { name: "Undo", exact: true }).click();
  96  |     await expect(
  97  |       page.getByRole("heading", { name: "Multiply", exact: true }),
  98  |     ).toHaveCount(0);
  99  |     await page.getByRole("button", { name: "Redo", exact: true }).click();
  100 |     expect(await documentOf(page)).toEqual(before);
  101 |   });
  102 | 
  103 | for (const reason of ["pointercancel", "blur"] as const)
  104 |   test(`S06 Help ${reason} disarms incomplete backdrop gesture and allows a new click`, async ({
  105 |     page,
  106 |   }) => {
  107 |     const before = await documentOf(page);
```