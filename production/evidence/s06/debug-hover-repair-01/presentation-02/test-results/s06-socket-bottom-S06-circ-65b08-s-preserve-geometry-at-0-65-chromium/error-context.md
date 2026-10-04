# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-socket-bottom.spec.ts >> S06 circle-only type-colored socket states preserve geometry at 0.65
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
              - group "Vector 2" [ref=e47]:
                - heading "Vector 2" [level=3] [ref=e48]
                - generic [ref=e49]:
                  - button "Vector 2 output out" [ref=e50] [cursor=pointer]
                  - generic [ref=e51]: out
                  - generic [ref=e52]: vec2
              - group "Vector 3" [ref=e53]:
                - heading "Vector 3" [level=3] [ref=e54]
                - generic [ref=e55]:
                  - button "Vector 3 output out" [ref=e56] [cursor=pointer]
                  - generic [ref=e57]: out
                  - generic [ref=e58]: vec3
              - group "Color RGBA" [ref=e59]:
                - heading "Color RGBA" [level=3] [ref=e60]
                - generic [ref=e61]:
                  - button "Color RGBA output out" [ref=e62] [cursor=pointer]
                  - generic [ref=e63]: out
                  - generic [ref=e64]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e65]:
          - button "New subgraph" [ref=e66] [cursor=pointer]
          - button "Library subgraph" [ref=e67] [cursor=pointer]
          - button "Encapsulate" [ref=e68] [cursor=pointer]
          - button "Make independent" [ref=e69] [cursor=pointer]
          - button "Enter subgraph" [ref=e70] [cursor=pointer]
          - button "Arrange nodes" [ref=e71] [cursor=pointer]
          - button "Frame selection" [ref=e72] [cursor=pointer]
          - group [ref=e73]:
            - generic "Local clipboard" [ref=e74] [cursor=pointer]
          - group [ref=e75]:
            - generic "Structures" [ref=e76] [cursor=pointer]
            - option "New structure" [selected]
        - dialog "Node catalog" [ref=e77]:
          - generic [ref=e78]:
            - strong [ref=e79]: Create node
            - button "Close node catalog" [ref=e80] [cursor=pointer]
          - searchbox "Search nodes" [active] [ref=e83]: Multiply
          - generic [ref=e84]:
            - combobox "Library scope" [ref=e85]:
              - option "All installed and project" [selected]
              - option "Built-in"
              - option "Project"
            - combobox "Node source" [ref=e86]:
              - option "All installed sources"
              - option "grape.nodes.basic"
              - option "grape.nodes.fixed-values" [selected]
              - option "grape.nodes.function-operations"
              - option "grape.nodes.networks"
              - option "grape.resources.extents"
            - combobox "Node port type" [ref=e87]:
              - option "All port types" [selected]
              - option "array@[\"glsl.float\",2]"
              - option "glsl.float"
              - option "glsl.vec2"
              - option "glsl.vec3"
              - option "glsl.vec4"
          - generic [ref=e88]: No matching nodes in this stage and profile.
        - generic [ref=e89]:
          - button "Vertex" [ref=e90] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e91] [cursor=pointer]
        - generic [ref=e92]:
          - button "Add Node" [ref=e93] [cursor=pointer]
          - button "Browse nodes" [ref=e96] [cursor=pointer]
          - button "Up" [disabled] [ref=e99]
          - button "Shortcuts" [ref=e102] [cursor=pointer]
    - complementary [ref=e105]:
      - generic [ref=e106]:
        - heading "Inspector" [level=2] [ref=e107]
        - paragraph [ref=e108]: Color RGBA
        - button "Rename node" [ref=e109] [cursor=pointer]
        - generic [ref=e112]:
          - generic [ref=e113]: Value
          - generic [ref=e114]:
            - text: R
            - textbox "R" [ref=e115]: "0.55"
          - generic [ref=e116]:
            - text: G
            - textbox "G" [ref=e117]: "0.28"
          - generic [ref=e118]:
            - text: B
            - textbox "B" [ref=e119]: "0.9"
          - generic [ref=e120]:
            - text: A
            - textbox "A" [ref=e121]: "1"
          - alert
  - contentinfo [ref=e122]:
    - button "Project actions" [ref=e123] [cursor=pointer]
    - status [ref=e124]:
      - button "Read full application status" [disabled] [ref=e125]
    - button "Shader output" [ref=e126] [cursor=pointer]
    - generic [ref=e127]:
      - button "Experimental features" [ref=e129] [cursor=pointer]
      - button "Read object details" [disabled] [ref=e130]
    - button "Hints" [ref=e131] [cursor=pointer]
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