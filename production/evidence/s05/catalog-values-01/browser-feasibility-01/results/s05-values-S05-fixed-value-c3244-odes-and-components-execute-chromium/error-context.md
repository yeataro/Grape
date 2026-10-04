# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05-values.spec.ts >> S05 fixed values backend feasibility: all leaves stages modes and components execute
- Location: tests\browser\s05-values.spec.ts:10:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: undefined
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]: ●
      - text: Grape
      - generic [ref=e6]: SHADER WORKSPACE
    - navigation "Document actions" [ref=e7]:
      - button "New document" [ref=e8] [cursor=pointer]
      - button "Upgrade subgraph owners" [ref=e9] [cursor=pointer]
      - button "Save" [ref=e10] [cursor=pointer]
      - button "Open saved" [ref=e11] [cursor=pointer]
      - button "Export JSON" [ref=e12] [cursor=pointer]
      - button "Export PNG" [ref=e13] [cursor=pointer]
      - button "Open file" [ref=e14] [cursor=pointer]
      - button "Generate GLSL" [ref=e15] [cursor=pointer]
      - button "Second Canvas" [ref=e16] [cursor=pointer]
      - button "Lock editing" [ref=e17] [cursor=pointer]
      - button "Personal Library" [ref=e18] [cursor=pointer]
    - generic [ref=e19]:
      - generic [ref=e20]: Unsaved changes
      - generic [ref=e21]: Host-free
  - status [ref=e22]
  - generic [ref=e24]:
    - button "Add Float" [ref=e25] [cursor=pointer]
    - button "Add Multiply" [ref=e26] [cursor=pointer]
    - button "Add Compose" [ref=e27] [cursor=pointer]
    - button "Add Float (fixed)" [ref=e28] [cursor=pointer]
    - button "Add Vector 2" [ref=e29] [cursor=pointer]
    - button "Add Vector 3" [ref=e30] [cursor=pointer]
    - button "Add Color RGBA" [ref=e31] [cursor=pointer]
    - button "Add Array repeat" [ref=e32] [cursor=pointer]
    - button "Add Vertex position" [ref=e33] [cursor=pointer]
    - button "Add Constant input" [ref=e34] [cursor=pointer]
    - button "Add Add" [ref=e35] [cursor=pointer]
    - button "Add Array length" [ref=e36] [cursor=pointer]
    - button "Add Pixel depth and pair" [ref=e37] [cursor=pointer]
    - button "Undo" [disabled] [ref=e38]
    - button "Redo" [disabled] [ref=e39]
    - button "Delete selected" [ref=e40] [cursor=pointer]
    - alert
  - main [ref=e41]:
    - generic [ref=e43]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e44]:
        - group "Image output" [ref=e45]:
          - heading "Image output" [level=3] [ref=e46]
          - generic [ref=e47]:
            - button "Image output input color" [ref=e48] [cursor=pointer]:
              - generic [ref=e49]: ●
              - generic [ref=e50]: color
            - generic [ref=e51]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e52]:
          - button "New subgraph" [ref=e53] [cursor=pointer]
          - button "Library subgraph" [ref=e54] [cursor=pointer]
          - button "Encapsulate" [ref=e55] [cursor=pointer]
          - button "Make independent" [ref=e56] [cursor=pointer]
          - button "Enter subgraph" [ref=e57] [cursor=pointer]
          - button "Up" [ref=e58] [cursor=pointer]
          - button "Arrange nodes" [ref=e59] [cursor=pointer]
          - button "Frame selection" [ref=e60] [cursor=pointer]
          - group [ref=e61]:
            - generic "Local clipboard" [ref=e62]
          - group [ref=e63]:
            - generic "Structures" [ref=e64]
            - option "New structure" [selected]
    - complementary [ref=e65]:
      - generic [ref=e66]:
        - heading "Inspector" [level=2] [ref=e67]
        - paragraph [ref=e68]: Select a node to inspect its parameters.
  - generic [ref=e70]:
    - heading "Shader output" [level=2] [ref=e71]
    - paragraph [ref=e72]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e73]:
      - listitem [ref=e74]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e75] [cursor=pointer]
  - contentinfo [ref=e76]:
    - generic [ref=e77]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e78]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import fs from "node:fs/promises";
  3   | import { valueCases, valueFixture } from "../fixtures/s05-values.ts";
  4   | import {
  5   |   exportDocument,
  6   |   openValidFile,
  7   |   saveReopen,
  8   | } from "../fixtures/s05-delivered-flows.ts";
  9   | const evidence = process.env.GRAPE_EVIDENCE_DIR!;
  10  | test("S05 fixed values backend feasibility: all leaves stages modes and components execute", async ({
  11  |   page,
  12  |   browser,
  13  | }) => {
  14  |   await page.goto("/");
  15  |   const rows = await page.evaluate(async () => {
  16  |     const { valueCases, valueFixture } =
  17  |         await import("/tests/fixtures/s05-values.ts"),
  18  |       { compile } = await import("/src/generation/compiler.ts"),
  19  |       { executeGL } = await import("/tests/fixtures/s05-webgl.ts"),
  20  |       { executeLinkedUniforms } =
  21  |         await import("/tests/fixtures/s05-linked-webgl.ts");
  22  |     const rows = [];
  23  |     for (const item of valueCases)
  24  |       for (const stage of ["pixel", "vertex"])
  25  |         for (const mode of ["root", "expand", "function", "nested"])
  26  |           for (const edited of [false, true]) {
  27  |             const s = valueFixture(item.key, stage, mode, edited),
  28  |               before = JSON.stringify(s.graph.capture()),
  29  |               out = compile(s.graph.capture(), s.fixed, s.profile);
  30  |             const result =
  31  |               stage === "pixel" ? executeGL(out) : executeLinkedUniforms(out);
  32  |             rows.push({
  33  |               leaf: item.key,
  34  |               stage,
  35  |               mode,
  36  |               edited,
  37  |               expected: s.expected,
  38  |               result,
  39  |               unchanged: before === JSON.stringify(s.graph.capture()),
  40  |               artifacts: out.artifacts,
  41  |             });
  42  |           }
  43  |     return rows;
  44  |   });
  45  |   for (const row of rows) {
  46  |     expect(row.unchanged).toBe(true);
> 47  |     expect(row.result.error).toBe(0);
      |                              ^ Error: expect(received).toBe(expected) // Object.is equality
  48  |     if (row.stage === "pixel")
  49  |       row.expected.forEach((v, i) =>
  50  |         expect(
  51  |           Math.abs(row.result.pixels[i] - Math.round(v * 255)),
  52  |         ).toBeLessThanOrEqual(1),
  53  |       );
  54  |     else {
  55  |       expect(row.result.linked).toBe(true);
  56  |       row.expected.forEach((v, i) =>
  57  |         expect(Math.abs(row.result.position[i] - v)).toBeLessThan(1e-6),
  58  |       );
  59  |     }
  60  |   }
  61  |   expect(rows).toHaveLength(64);
  62  |   await fs.writeFile(
  63  |     evidence + "/fixed-value-numerical-matrix.json",
  64  |     JSON.stringify({ browser: browser.version(), rows }, null, 2),
  65  |     { flag: "wx" },
  66  |   );
  67  | });
  68  | for (const item of valueCases)
  69  |   for (const stage of ["pixel", "vertex"] as const)
  70  |     test(`S05 fixed ${item.key} ${stage}: public create edit connect history save and JSON reopen`, async ({
  71  |       page,
  72  |     }) => {
  73  |       page.on("dialog", (d) => void d.accept());
  74  |       await page.goto("/");
  75  |       if (stage === "vertex") {
  76  |         const s = valueFixture(item.key, "vertex", "root", false, true);
  77  |         await openValidFile(
  78  |           page,
  79  |           "vertex-workspace.grape.json",
  80  |           Buffer.from(JSON.stringify(s.graph.capture().document)),
  81  |         );
  82  |       }
  83  |       const canvas = page.locator(".canvas").first();
  84  |       await page
  85  |         .getByRole("button", { name: "Add " + item.button, exact: true })
  86  |         .click();
  87  |       await canvas
  88  |         .getByRole("heading", { name: item.label, exact: true })
  89  |         .last()
  90  |         .click();
  91  |       const initial =
  92  |           typeof item.initial === "number" ? [item.initial] : item.initial,
  93  |         edited = typeof item.edited === "number" ? [item.edited] : item.edited;
  94  |       for (let i = 0; i < item.components.length; i++) {
  95  |         const input = page.getByRole("textbox", {
  96  |           name: item.components[i],
  97  |           exact: true,
  98  |         });
  99  |         await expect(input).toHaveValue(String(initial[i]));
  100 |         await input.fill(String(edited[i]));
  101 |         await input.press("Enter");
  102 |         await expect(input).toHaveValue(String(edited[i]));
  103 |       }
  104 |       await page.getByRole("button", { name: "Undo", exact: true }).click();
  105 |       await expect(
  106 |         page.getByRole("textbox", {
  107 |           name: item.components.at(-1)!,
  108 |           exact: true,
  109 |         }),
  110 |       ).toHaveValue(String(initial.at(-1)));
  111 |       await page.getByRole("button", { name: "Redo", exact: true }).click();
  112 |       await expect(
  113 |         page.getByRole("textbox", {
  114 |           name: item.components.at(-1)!,
  115 |           exact: true,
  116 |         }),
  117 |       ).toHaveValue(String(edited.at(-1)));
  118 |       const first = page.getByRole("textbox", {
  119 |         name: item.components[0],
  120 |         exact: true,
  121 |       });
  122 |       await first.fill("Infinity");
  123 |       await first.press("Enter");
  124 |       await expect(first).toHaveAttribute("aria-invalid", "true");
  125 |       await first.press("Escape");
  126 |       await expect(first).toHaveValue(String(edited[0]));
  127 |       await canvas
  128 |         .getByRole("button", { name: item.label + " output out", exact: true })
  129 |         .click();
  130 |       await canvas
  131 |         .getByRole("button", {
  132 |           name:
  133 |             stage === "pixel"
  134 |               ? "Image output input color"
  135 |               : "Position input Value",
  136 |           exact: true,
  137 |         })
  138 |         .click();
  139 |       await page
  140 |         .getByRole("button", { name: "Generate GLSL", exact: true })
  141 |         .click();
  142 |       await expect(page.locator("#status")).toContainText(
  143 |         "Generated successfully",
  144 |       );
  145 |       const document = await exportDocument(page),
  146 |         node = document.graph.stages
  147 |           .find((x: any) => x.key === stage)
```