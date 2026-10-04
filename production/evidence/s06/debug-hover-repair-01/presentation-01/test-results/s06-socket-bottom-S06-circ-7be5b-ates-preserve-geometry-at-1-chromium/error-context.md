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
  - waiting for locator('.canvas').last().getByRole('dialog', { name: 'Node catalog' }).getByRole('button', { name: 'Add Vector2', exact: true })

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