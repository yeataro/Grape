# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-socket-bottom.spec.ts >> S06 circle-only type-colored socket states preserve geometry at 1.25
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
              - group "Float" [ref=e41]:
                - heading "Float" [level=3] [ref=e42]
                - generic [ref=e43]:
                  - button "Float output out" [ref=e44] [cursor=pointer]
                  - generic [ref=e45]: out
                  - generic [ref=e46]: float
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e47]:
          - button "New subgraph" [ref=e48] [cursor=pointer]
          - button "Library subgraph" [ref=e49] [cursor=pointer]
          - button "Encapsulate" [ref=e50] [cursor=pointer]
          - button "Make independent" [ref=e51] [cursor=pointer]
          - button "Enter subgraph" [ref=e52] [cursor=pointer]
          - button "Arrange nodes" [ref=e53] [cursor=pointer]
          - button "Frame selection" [ref=e54] [cursor=pointer]
          - group [ref=e55]:
            - generic "Local clipboard" [ref=e56] [cursor=pointer]
          - group [ref=e57]:
            - generic "Structures" [ref=e58] [cursor=pointer]
            - option "New structure" [selected]
        - dialog "Node catalog" [ref=e59]:
          - generic [ref=e60]:
            - strong [ref=e61]: Create node
            - button "Close node catalog" [ref=e62] [cursor=pointer]
          - searchbox "Search nodes" [active] [ref=e65]: Vector2
          - generic [ref=e66]:
            - combobox "Library scope" [ref=e67]:
              - option "All installed and project" [selected]
              - option "Built-in"
              - option "Project"
            - combobox "Node source" [ref=e68]:
              - option "All installed sources"
              - option "grape.nodes.basic"
              - option "grape.nodes.fixed-values" [selected]
              - option "grape.nodes.function-operations"
              - option "grape.nodes.networks"
              - option "grape.resources.extents"
            - combobox "Node port type" [ref=e69]:
              - option "All port types" [selected]
              - option "array@[\"glsl.float\",2]"
              - option "glsl.float"
              - option "glsl.vec2"
              - option "glsl.vec3"
              - option "glsl.vec4"
          - generic [ref=e70]: No matching nodes in this stage and profile.
        - generic [ref=e71]:
          - button "Vertex" [ref=e72] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e73] [cursor=pointer]
        - generic [ref=e74]:
          - button "Add Node" [ref=e75] [cursor=pointer]
          - button "Browse nodes" [ref=e78] [cursor=pointer]
          - button "Up" [disabled] [ref=e81]
          - button "Shortcuts" [ref=e84] [cursor=pointer]
    - complementary [ref=e87]:
      - generic [ref=e88]:
        - heading "Inspector" [level=2] [ref=e89]
        - paragraph [ref=e90]: Float
        - button "Rename node" [ref=e91] [cursor=pointer]
        - generic [ref=e94]:
          - generic [ref=e95]: Value
          - textbox "Value" [ref=e96]: "0.5"
          - alert
  - contentinfo [ref=e97]:
    - button "Project actions" [ref=e98] [cursor=pointer]
    - status [ref=e99]:
      - button "Read full application status" [disabled] [ref=e100]
    - button "Shader output" [ref=e101] [cursor=pointer]
    - generic [ref=e102]:
      - button "Experimental features" [ref=e104] [cursor=pointer]
      - button "Read object details" [disabled] [ref=e105]
    - button "Hints" [ref=e106] [cursor=pointer]
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