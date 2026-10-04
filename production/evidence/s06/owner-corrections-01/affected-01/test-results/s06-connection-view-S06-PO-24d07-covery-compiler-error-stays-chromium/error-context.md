# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-connection-view.spec.ts >> S06 PORT_TARGET and same-direction refusal remain visible until matching recovery; compiler error stays
- Location: ..\..\..\production\tests\browser\s06-connection-view.spec.ts:137:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.canvas').last().getByRole('dialog', { name: 'Node catalog' }).getByRole('button', { name: 'Add Color RGBA', exact: true })

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
        - dialog "Node catalog" [ref=e53]:
          - generic [ref=e54]:
            - strong [ref=e55]: Create node
            - button "Close node catalog" [ref=e56] [cursor=pointer]
          - searchbox "Search nodes" [active] [ref=e59]: Color RGBA
          - generic [ref=e60]:
            - combobox "Library scope" [ref=e61]:
              - option "All installed and project" [selected]
              - option "Built-in"
              - option "Project"
            - combobox "Node source" [ref=e62]:
              - option "All installed sources" [selected]
              - option "grape.nodes.basic"
              - option "grape.nodes.networks"
              - option "grape.resources.extents"
            - combobox "Node port type" [ref=e63]:
              - option "All port types" [selected]
              - option "array@[\"glsl.float\",2]"
              - option "glsl.float"
              - option "glsl.vec4"
          - generic [ref=e64]: No matching nodes in this stage and profile.
        - generic [ref=e65]:
          - button "Vertex" [ref=e66] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e67] [cursor=pointer]
        - generic [ref=e68]:
          - button "Add Node" [ref=e69] [cursor=pointer]
          - button "Browse nodes" [ref=e72] [cursor=pointer]
          - button "Up" [disabled] [ref=e75]
          - button "Shortcuts" [ref=e78] [cursor=pointer]
    - complementary [ref=e81]:
      - generic [ref=e82]:
        - heading "Inspector" [level=2] [ref=e83]
        - paragraph [ref=e84]: Select a node to inspect its parameters.
  - contentinfo [ref=e85]:
    - button "Project actions" [ref=e86] [cursor=pointer]
    - status [ref=e87]:
      - button "Read full application status" [disabled] [ref=e88]
    - button "Shader output" [ref=e89] [cursor=pointer]
    - button "Hints" [ref=e90] [cursor=pointer]
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
  11 |   await browser.getByLabel("Node source", { exact: true }).selectOption("");
  12 |   if (label === "Float")
  13 |     await browser
  14 |       .getByLabel("Node source", { exact: true })
  15 |       .selectOption(fixed ? "grape.nodes.fixed-values" : "grape.nodes.basic");
  16 |   await browser
  17 |     .getByRole("button", { name: "Add " + label, exact: true })
> 18 |     .click();
     |      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  19 |   const point = await canvas.evaluate((el, n) => {
  20 |     const r = el.getBoundingClientRect(),
  21 |       v = el.querySelector<HTMLElement>(".viewport")!,
  22 |       m = new DOMMatrix(getComputedStyle(v).transform);
  23 |     return {
  24 |       x: r.left + m.e + (40 + ((n - 1) % 3) * 235) * m.a,
  25 |       y: r.top + m.f + (85 + Math.floor((n - 1) / 3) * 225) * m.d,
  26 |     };
  27 |   }, count);
  28 |   await page.mouse.move(point.x, point.y);
  29 |   await page.mouse.click(point.x, point.y);
  30 |   await expect(canvas.locator(".nodes .node")).toHaveCount(count + 1);
  31 | }
  32 | 
```