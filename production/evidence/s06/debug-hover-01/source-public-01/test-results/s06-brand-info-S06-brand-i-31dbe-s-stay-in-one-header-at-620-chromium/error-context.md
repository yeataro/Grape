# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-brand-info.spec.ts >> S06 brand identity and updates stay in one header at 620
- Location: ..\..\..\production\tests\browser\s06-brand-info.spec.ts:5:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('header')
Expected: 1
Received: 2
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('header')
    14 × locator resolved to 2 elements
       - unexpected value "2"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - text: Grape
      - generic "No candidate identity injected" [ref=e9]: Development · unversioned
      - button "本輪更新" [ref=e10] [cursor=pointer]
    - navigation "Document actions" [ref=e11]:
      - generic [ref=e12]:
        - button "Generate GLSL" [ref=e13] [cursor=pointer]
        - button "Second Canvas" [ref=e16] [cursor=pointer]
        - button "Lock editing" [ref=e19] [cursor=pointer]
      - group [ref=e22]:
        - generic "More actions" [ref=e23] [cursor=pointer]
    - generic [ref=e25]:
      - generic [ref=e26]: Unsaved changes
      - generic [ref=e27]: Host-free
  - generic [ref=e29]:
    - button "Undo" [disabled] [ref=e30]
    - button "Redo" [disabled] [ref=e33]
    - button "Delete selected" [ref=e36] [cursor=pointer]
    - alert
  - main [ref=e37]:
    - generic [ref=e39]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e40]:
        - group "Image output" [ref=e41]:
          - heading "Image output" [level=3] [ref=e42]
          - generic [ref=e43]:
            - button "Image output input color" [ref=e44] [cursor=pointer]:
              - generic [ref=e46]: color
            - generic [ref=e47]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e48]:
          - button "New subgraph" [ref=e49] [cursor=pointer]
          - button "Library subgraph" [ref=e50] [cursor=pointer]
          - button "Encapsulate" [ref=e51] [cursor=pointer]
          - button "Make independent" [ref=e52] [cursor=pointer]
          - button "Enter subgraph" [ref=e53] [cursor=pointer]
          - button "Arrange nodes" [ref=e54] [cursor=pointer]
          - button "Frame selection" [ref=e55] [cursor=pointer]
          - group [ref=e56]:
            - generic "Local clipboard" [ref=e57] [cursor=pointer]
          - group [ref=e58]:
            - generic "Structures" [ref=e59] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e60]:
          - button "Vertex" [ref=e61] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e62] [cursor=pointer]
        - generic [ref=e63]:
          - button "Add Node" [ref=e64] [cursor=pointer]
          - button "Browse nodes" [ref=e67] [cursor=pointer]
          - button "Up" [disabled] [ref=e70]
          - button "Shortcuts" [ref=e73] [cursor=pointer]
    - complementary [ref=e76]:
      - generic [ref=e77]:
        - heading "Inspector" [level=2] [ref=e78]
        - paragraph [ref=e79]: Select a node to inspect its parameters.
  - generic [ref=e81]:
    - heading "Shader output" [level=2] [ref=e82]
    - paragraph [ref=e83]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e84]:
      - listitem [ref=e85]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e86] [cursor=pointer]
  - contentinfo [ref=e87]:
    - generic [ref=e88]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e89]: Scroll to zoom · Drag empty space to pan
    - generic [ref=e90]:
      - group [ref=e91]:
        - generic "Experimental features" [ref=e92] [cursor=pointer]
      - button "Read object details" [disabled] [ref=e93]
  - status [ref=e94]:
    - button "Read full application status" [disabled] [ref=e95]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import fs from "node:fs";
  3  | import path from "node:path";
  4  | for (const width of [620, 1440])
  5  |   test(`S06 brand identity and updates stay in one header at ${width}`, async ({
  6  |     page,
  7  |   }) => {
  8  |     await page.setViewportSize({ width, height: 1000 });
  9  |     await page.goto("/");
  10 |     const brand = page.locator("header .brand"),
  11 |       button = brand.getByRole("button", { name: "本輪更新", exact: true });
> 12 |     await expect(page.locator("header")).toHaveCount(1);
     |                                          ^ Error: expect(locator).toHaveCount(expected) failed
  13 |     await expect(button).toBeVisible();
  14 |     const identity = await brand.locator(".build-identity").innerText();
  15 |     expect(identity).toMatch(
  16 |       /^(Development · unversioned|S06-debug-[a-f0-9]{7})$/,
  17 |     );
  18 |     const box = (await button.boundingBox())!;
  19 |     expect(box.x).toBeGreaterThanOrEqual(0);
  20 |     expect(box.x + box.width).toBeLessThanOrEqual(width);
  21 |     await button.click();
  22 |     const dialog = page.getByRole("dialog", { name: "本輪更新", exact: true });
  23 |     await expect(dialog).toContainText(identity);
  24 |     await page.screenshot({
  25 |       path: path.join(
  26 |         process.env.GRAPE_EVIDENCE_DIR!,
  27 |         `brand-updates-${width}.png`,
  28 |       ),
  29 |     });
  30 |     await page.keyboard.press("Escape");
  31 |     await expect(button).toBeFocused();
  32 |     await page.keyboard.press("Enter");
  33 |     await expect(dialog).toBeVisible();
  34 |     await dialog.getByRole("button", { name: "關閉本輪更新" }).click();
  35 |     await expect(button).toBeFocused();
  36 |     await page.screenshot({
  37 |       path: path.join(
  38 |         process.env.GRAPE_EVIDENCE_DIR!,
  39 |         `brand-header-${width}.png`,
  40 |       ),
  41 |     });
  42 |     fs.writeFileSync(
  43 |       path.join(process.env.GRAPE_EVIDENCE_DIR!, `brand-${width}.json`),
  44 |       JSON.stringify(
  45 |         { identity, width, button: box, headers: 1, keyboardAndClose: true },
  46 |         null,
  47 |         2,
  48 |       ),
  49 |     );
  50 |   });
  51 | 
```