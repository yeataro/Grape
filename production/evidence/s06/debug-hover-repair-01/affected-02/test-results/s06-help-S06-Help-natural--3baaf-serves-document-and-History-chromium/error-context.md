# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-help.spec.ts >> S06 Help natural outside-to-inside gesture preserves document and History
- Location: ..\..\..\production\tests\browser\s06-help.spec.ts:68:3

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
      - generic "Shader graph canvas" [active] [ref=e34]:
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
    - complementary [ref=e85]:
      - generic [ref=e86]:
        - heading "Inspector" [level=2] [ref=e87]
        - paragraph [ref=e88]: Multiply
        - button "Rename node" [ref=e89] [cursor=pointer]
        - generic [ref=e90]:
          - generic [ref=e92]:
            - generic [ref=e93]: A
            - textbox "A" [ref=e94]: "1"
            - alert
          - generic [ref=e96]:
            - generic [ref=e97]: B
            - textbox "B" [ref=e98]: "2"
            - alert
  - contentinfo [ref=e99]:
    - button "Project actions" [ref=e100] [cursor=pointer]
    - status [ref=e101]:
      - button "Read full application status" [disabled] [ref=e102]
    - button "Shader output" [ref=e103] [cursor=pointer]
    - generic [ref=e104]:
      - button "Experimental features" [ref=e106] [cursor=pointer]
      - button "Read object details" [disabled] [ref=e107]
    - button "Hints" [ref=e108] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import fs from "node:fs";
  3   | import path from "node:path";
  4   | import { createNode } from "./create-node.ts";
  5   | 
  6   | async function documentOf(page: Page) {
> 7   |   const wait = page.waitForEvent("download");
      |                     ^ Error: page.waitForEvent: Test timeout of 30000ms exceeded.
  8   |   await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  9   |   return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8"));
  10  | }
  11  | test.beforeEach(async ({ page }) => {
  12  |   await page.goto("/");
  13  |   await page.evaluate(() => {
  14  |     (window as any).helpEvents = [];
  15  |     for (const type of [
  16  |       "pointerdown",
  17  |       "pointerup",
  18  |       "pointercancel",
  19  |       "click",
  20  |       "keydown",
  21  |       "focusin",
  22  |     ])
  23  |       document.addEventListener(
  24  |         type,
  25  |         (e) => {
  26  |           const p = e as PointerEvent;
  27  |           (window as any).helpEvents.push({
  28  |             type,
  29  |             trusted: e.isTrusted,
  30  |             target: (e.target as HTMLElement).tagName,
  31  |             x: p.clientX,
  32  |             y: p.clientY,
  33  |             pointerId: p.pointerId,
  34  |             key: (e as KeyboardEvent).key,
  35  |             open: !!document.querySelector("dialog.shortcut-help[open]"),
  36  |           });
  37  |         },
  38  |         true,
  39  |       );
  40  |   });
  41  | });
  42  | test.afterEach(async ({ page }, info) => {
  43  |   const out = process.env.GRAPE_EVIDENCE_DIR!;
  44  |   if (!path.isAbsolute(out) || !out.includes("s06"))
  45  |     throw Error("S06_EVIDENCE_REQUIRED");
  46  |   const file = path.join(
  47  |     out,
  48  |     info.title.replace(/[^a-zA-Z0-9-]/g, "_") + ".json",
  49  |   );
  50  |   fs.writeFileSync(
  51  |     file,
  52  |     JSON.stringify(
  53  |       {
  54  |         title: info.title,
  55  |         events: await page.evaluate(() => (window as any).helpEvents),
  56  |       },
  57  |       null,
  58  |       2,
  59  |     ) + "\n",
  60  |   );
  61  | });
  62  | 
  63  | for (const [start, end, closes] of [
  64  |   ["outside", "inside", false],
  65  |   ["inside", "outside", false],
  66  |   ["outside", "outside", true],
  67  | ] as const)
  68  |   test(`S06 Help natural ${start}-to-${end} gesture preserves document and History`, async ({
  69  |     page,
  70  |   }) => {
  71  |     await createNode(page, "Multiply");
  72  |     const before = await documentOf(page);
  73  |     const opener = page.getByRole("button", { name: "Shortcuts", exact: true });
  74  |     await opener.click();
  75  |     const help = page.getByRole("dialog", { name: "Keyboard shortcuts" }),
  76  |       r = (await help.boundingBox())!;
  77  |     const points = {
  78  |       outside: { x: r.x - 20, y: r.y + 20 },
  79  |       inside: { x: r.x + 10, y: r.y + 10 },
  80  |     };
  81  |     await page.mouse.move(points[start].x, points[start].y);
  82  |     await page.mouse.down();
  83  |     await page.mouse.move(points[end].x, points[end].y, { steps: 5 });
  84  |     await page.mouse.up();
  85  |     if (closes) {
  86  |       await expect(help).toBeHidden();
  87  |       await expect(opener).toBeFocused();
  88  |     } else {
  89  |       await expect(help).toBeVisible();
  90  |       await page.keyboard.press("Escape");
  91  |       await expect(opener).toBeFocused();
  92  |     }
  93  |     expect(await documentOf(page)).toEqual(before);
  94  |     await page.getByRole("button", { name: "Undo", exact: true }).click();
  95  |     await expect(
  96  |       page.getByRole("heading", { name: "Multiply", exact: true }),
  97  |     ).toHaveCount(0);
  98  |     await page.getByRole("button", { name: "Redo", exact: true }).click();
  99  |     expect(await documentOf(page)).toEqual(before);
  100 |   });
  101 | 
  102 | for (const reason of ["pointercancel", "blur"] as const)
  103 |   test(`S06 Help ${reason} disarms incomplete backdrop gesture and allows a new click`, async ({
  104 |     page,
  105 |   }) => {
  106 |     const before = await documentOf(page);
  107 |     await page.getByRole("button", { name: "Shortcuts", exact: true }).click();
```