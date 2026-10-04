# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-socket-bottom.spec.ts >> S06 circle-only type-colored socket states preserve geometry at 1
- Location: ..\..\..\production\tests\browser\s06-socket-bottom.spec.ts:14:35

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.canvas').last().getByRole('dialog', { name: 'Node catalog' }).getByRole('button', { name: 'Add Multiply', exact: true })

```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - banner [ref=f1e3]:
    - generic [ref=f1e4]:
      - text: Grape
      - generic [ref=f1e9]: SHADER WORKSPACE
      - generic "No candidate identity injected" [ref=f1e10]: Development · unversioned
      - button "本輪更新" [ref=f1e11] [cursor=pointer]
    - navigation "Document actions" [ref=f1e12]:
      - button "Save" [ref=f1e13] [cursor=pointer]
      - button "Generate GLSL" [ref=f1e16] [cursor=pointer]
    - generic [ref=f1e19]:
      - generic [ref=f1e20]: Unsaved changes
      - generic [ref=f1e21]: Host-free
  - generic [ref=f1e23]:
    - button "Undo" [disabled] [ref=f1e24]
    - button "Redo" [disabled] [ref=f1e27]
    - button "Delete selected" [ref=f1e30] [cursor=pointer]
    - alert
  - main [ref=f1e31]:
    - generic [ref=f1e33]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=f1e34]:
        - group "Image output" [ref=f1e35]:
          - heading "Image output" [level=3] [ref=f1e36]
          - generic [ref=f1e37]:
            - button "Image output input color" [ref=f1e38] [cursor=pointer]
            - generic [ref=f1e39]: color
            - generic [ref=f1e40]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=f1e41]:
          - button "New subgraph" [ref=f1e42] [cursor=pointer]
          - button "Library subgraph" [ref=f1e43] [cursor=pointer]
          - button "Encapsulate" [ref=f1e44] [cursor=pointer]
          - button "Make independent" [ref=f1e45] [cursor=pointer]
          - button "Enter subgraph" [ref=f1e46] [cursor=pointer]
          - button "Arrange nodes" [ref=f1e47] [cursor=pointer]
          - button "Frame selection" [ref=f1e48] [cursor=pointer]
          - group [ref=f1e49]:
            - generic "Local clipboard" [ref=f1e50] [cursor=pointer]
          - group [ref=f1e51]:
            - generic "Structures" [ref=f1e52] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=f1e53]:
          - button "Vertex" [ref=f1e54] [cursor=pointer]
          - button "Pixel" [pressed] [ref=f1e55] [cursor=pointer]
        - generic [ref=f1e56]:
          - button "Add Node" [ref=f1e57] [cursor=pointer]
          - button "Browse nodes" [ref=f1e60] [cursor=pointer]
          - button "Up" [disabled] [ref=f1e63]
          - button "Shortcuts" [ref=f1e66] [cursor=pointer]
    - complementary [ref=f1e69]:
      - generic [ref=f1e70]:
        - heading "Inspector" [level=2] [ref=f1e71]
        - paragraph [ref=f1e72]: Select a node to inspect its parameters.
  - contentinfo [ref=f1e73]:
    - button "Project actions" [ref=f1e74] [cursor=pointer]
    - status [ref=f1e75]:
      - button "Read full application status" [disabled] [ref=f1e76]
    - button "Shader output" [ref=f1e77] [cursor=pointer]
    - generic [ref=f1e78]:
      - button "Experimental features" [ref=f1e80] [cursor=pointer]
      - button "Read object details" [disabled] [ref=f1e81]
    - button "Hints" [ref=f1e82] [cursor=pointer]
```

# Test source

```ts
  1  | import { expect, type Page } from "@playwright/test";
  2  | /** Shared public authoring path replacing the retired per-definition toolbar buttons. */
  3  | export async function createNode(page: Page, name: string) {
  4  |   const canvas = page.locator(".canvas").last();
  5  |   const count = await canvas.locator(".nodes .node").count();
  6  |   await canvas.getByRole("button", { name: "Add Node", exact: true }).click();
  7  |   const browser = canvas.getByRole("dialog", { name: "Node catalog" }),
  8  |     fixed = name === "Float (fixed)",
  9  |     label = fixed ? "Float" : name;
  10 |   await browser.getByLabel("Search nodes", { exact: true }).fill(label);
  11 |   if (label === "Float")
  12 |     await browser
  13 |       .getByLabel("Node source", { exact: true })
  14 |       .selectOption(fixed ? "grape.nodes.fixed-values" : "grape.nodes.basic");
  15 |   await browser
  16 |     .getByRole("button", { name: "Add " + label, exact: true })
> 17 |     .click();
     |      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  18 |   const point = await canvas.evaluate((el, n) => {
  19 |     const r = el.getBoundingClientRect(),
  20 |       v = el.querySelector<HTMLElement>(".viewport")!,
  21 |       m = new DOMMatrix(getComputedStyle(v).transform);
  22 |     return {
  23 |       x: r.left + m.e + (40 + ((n - 1) % 3) * 235) * m.a,
  24 |       y: r.top + m.f + (85 + Math.floor((n - 1) / 3) * 225) * m.d,
  25 |     };
  26 |   }, count);
  27 |   await page.mouse.move(point.x, point.y);
  28 |   await page.mouse.click(point.x, point.y);
  29 |   await expect(canvas.locator(".nodes .node")).toHaveCount(count + 1);
  30 | }
  31 | 
```