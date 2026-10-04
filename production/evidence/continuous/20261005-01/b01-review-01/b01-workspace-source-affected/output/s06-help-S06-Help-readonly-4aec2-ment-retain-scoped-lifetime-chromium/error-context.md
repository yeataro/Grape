# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-help.spec.ts >> S06 Help readonly interaction and remounted document retain scoped lifetime
- Location: ..\..\production\tests\browser\s06-help.spec.ts:189:1

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
          - button "Shortcuts" [active] [ref=e74] [cursor=pointer]
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
    - button "Project actions" [ref=e91] [cursor=pointer]
    - status [ref=e92]:
      - button "Read full application status" [ref=e93] [cursor=pointer]: Export started. Saved status is unchanged.
    - button "Shader output" [ref=e94] [cursor=pointer]
    - button "Panels" [ref=e95] [cursor=pointer]
    - button "Hints" [ref=e96] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import fs from "node:fs";
  3   | import path from "node:path";
  4   | import { createNode } from "./create-node.ts";
  5   | import { clickAction } from "../fixtures/public-actions.ts";
  6   | 
  7   | async function documentOf(page: Page) {
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
> 46  |     throw Error("S06_EVIDENCE_REQUIRED");
      |           ^ Error: S06_EVIDENCE_REQUIRED
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
  108 |     await page.getByRole("button", { name: "Shortcuts", exact: true }).click();
  109 |     const help = page.getByRole("dialog", { name: "Keyboard shortcuts" }),
  110 |       r = (await help.boundingBox())!;
  111 |     await page.mouse.move(r.x - 20, r.y + 20);
  112 |     await page.mouse.down();
  113 |     // A synthetic cancellation/blur exercises the lifecycle boundary, not a physical-device claim.
  114 |     if (reason === "pointercancel")
  115 |       await help.dispatchEvent("pointercancel", {
  116 |         pointerId: 1,
  117 |         pointerType: "mouse",
  118 |         isPrimary: true,
  119 |       });
  120 |     else await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  121 |     await page.mouse.up();
  122 |     await expect(help).toBeVisible();
  123 |     await page.mouse.click(r.x - 20, r.y + 20);
  124 |     await expect(help).toBeHidden();
  125 |     expect(await documentOf(page)).toEqual(before);
  126 |   });
  127 | 
  128 | test("S06 Help Escape Close and reopen consume old gestures and restore usable focus", async ({
  129 |   page,
  130 | }) => {
  131 |   const before = await documentOf(page),
  132 |     opener = page.getByRole("button", { name: "Shortcuts", exact: true });
  133 |   await opener.click();
  134 |   const help = page.getByRole("dialog", { name: "Keyboard shortcuts" }),
  135 |     r = (await help.boundingBox())!;
  136 |   await page.mouse.move(r.x - 20, r.y + 20);
  137 |   await page.mouse.down();
  138 |   await page.keyboard.press("Escape");
  139 |   await page.mouse.up();
  140 |   await expect(help).toBeHidden();
  141 |   await expect(opener).toBeFocused();
  142 |   await page.keyboard.press("Enter");
  143 |   await expect(help).toBeVisible();
  144 |   await page.keyboard.press("Tab");
  145 |   await expect(
  146 |     help.getByRole("button", { name: "Close shortcuts" }),
```