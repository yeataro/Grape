# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05.spec.ts >> S05 AT07 legacy mode UI requires explicit owner upgrade preserving original data
- Location: ..\..\..\production\tests\browser\s05.spec.ts:96:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Upgrade subgraph owners', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - text: Grape
      - generic [ref=e9]: SHADER WORKSPACE
    - navigation "Document actions" [ref=e10]:
      - generic [ref=e11]:
        - button "New document" [ref=e12] [cursor=pointer]
        - button "Save" [ref=e15] [cursor=pointer]
        - button "Open saved" [ref=e18] [cursor=pointer]
        - button "Export JSON" [active] [ref=e21] [cursor=pointer]
        - button "Export PNG" [ref=e24] [cursor=pointer]
        - button "Open file" [ref=e27] [cursor=pointer]
      - generic [ref=e30]:
        - button "Generate GLSL" [ref=e31] [cursor=pointer]
        - button "Second Canvas" [ref=e34] [cursor=pointer]
        - button "Lock editing" [ref=e37] [cursor=pointer]
      - group [ref=e40]:
        - generic "More actions" [ref=e41] [cursor=pointer]
    - generic [ref=e43]:
      - generic [ref=e44]: Unsaved changes
      - generic [ref=e45]: Host-free
  - status [ref=e46]: Export started. Saved status is unchanged.
  - generic [ref=e48]:
    - button "Undo" [disabled] [ref=e49]
    - button "Redo" [disabled] [ref=e52]
    - button "Delete selected" [ref=e55] [cursor=pointer]
    - alert
  - main [ref=e56]:
    - generic [ref=e58]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e59]:
        - generic:
          - generic:
            - group "Inputs" [ref=e60]:
              - heading "Inputs" [level=3] [ref=e61]
              - button "Create input port from selection" [ref=e62] [cursor=pointer]
              - generic [ref=e63]:
                - button "Inputs output Value" [ref=e64] [cursor=pointer]:
                  - generic [ref=e65]: Value
                - generic [ref=e67]: vec4
            - group "Outputs" [ref=e68]:
              - heading "Outputs" [level=3] [ref=e69]
              - button "Create output port from selection" [ref=e70] [cursor=pointer]
              - generic [ref=e71]:
                - button "Outputs input Value" [ref=e72] [cursor=pointer]:
                  - generic [ref=e74]: Value
                - generic [ref=e75]: vec4
        - generic:
          - button "Untitled shader / pixel" [ref=e76] [cursor=pointer]
          - button "Subgraph" [disabled]
        - generic [ref=e77]:
          - button "New subgraph" [ref=e78] [cursor=pointer]
          - button "Library subgraph" [ref=e79] [cursor=pointer]
          - button "Encapsulate" [ref=e80] [cursor=pointer]
          - button "Make independent" [ref=e81] [cursor=pointer]
          - button "Enter subgraph" [ref=e82] [cursor=pointer]
          - button "Arrange nodes" [ref=e83] [cursor=pointer]
          - button "Frame selection" [ref=e84] [cursor=pointer]
          - group [ref=e85]:
            - generic "Subgraph interface" [ref=e86] [cursor=pointer]
            - textbox "Subgraph name" [ref=e87]: Subgraph
            - combobox "Subgraph emission mode" [disabled] [ref=e88]:
              - option "Expand" [selected]
              - option "Function"
            - text: Use Upgrade subgraph owners to enable this mode.
            - generic [ref=e89]:
              - generic [ref=e90]:
                - textbox "Port name 1" [ref=e91]: Value
                - combobox "Port type 1" [ref=e92]:
                  - option "glsl.float"
                  - option "glsl.vec2"
                  - option "glsl.vec3"
                  - option "glsl.vec4" [selected]
                  - option "glsl.mat2"
                  - option "glsl.mat2x3"
                  - option "glsl.mat2x4"
                  - option "glsl.mat3x2"
                  - option "glsl.mat3"
                  - option "glsl.mat3x4"
                  - option "glsl.mat4x2"
                  - option "glsl.mat4x3"
                  - option "glsl.mat4"
                - textbox "Port default 1" [ref=e93]: "[1,1,1,1]"
                - combobox "Port direction 1" [ref=e94]:
                  - option "input" [selected]
                  - option "output"
                - button "Move port up 1" [disabled] [ref=e95]
                - button "Remove port 1" [ref=e96] [cursor=pointer]
              - generic [ref=e97]:
                - textbox "Port name 2" [ref=e98]: Value
                - combobox "Port type 2" [ref=e99]:
                  - option "glsl.float"
                  - option "glsl.vec2"
                  - option "glsl.vec3"
                  - option "glsl.vec4" [selected]
                  - option "glsl.mat2"
                  - option "glsl.mat2x3"
                  - option "glsl.mat2x4"
                  - option "glsl.mat3x2"
                  - option "glsl.mat3"
                  - option "glsl.mat3x4"
                  - option "glsl.mat4x2"
                  - option "glsl.mat4x3"
                  - option "glsl.mat4"
                - textbox "Port default 2" [ref=e100]: "[0,0,0,1]"
                - combobox "Port direction 2" [ref=e101]:
                  - option "input"
                  - option "output" [selected]
                - button "Move port up 2" [ref=e102] [cursor=pointer]
                - button "Remove port 2" [ref=e103] [cursor=pointer]
            - combobox "New port direction" [ref=e104]:
              - option "input" [selected]
              - option "output"
            - button "Add interface port" [ref=e105] [cursor=pointer]
            - button "Apply interface" [ref=e106] [cursor=pointer]
            - button "Cancel interface" [ref=e107] [cursor=pointer]
          - group [ref=e108]:
            - generic "Local clipboard" [ref=e109] [cursor=pointer]
          - group [ref=e110]:
            - generic "Structures" [ref=e111] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e112]:
          - button "Vertex" [ref=e113] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e114] [cursor=pointer]
        - generic [ref=e115]:
          - button "Add Node" [ref=e116] [cursor=pointer]
          - button "Browse nodes" [ref=e119] [cursor=pointer]
          - button "Up" [ref=e122] [cursor=pointer]
          - button "Shortcuts" [ref=e125] [cursor=pointer]
    - complementary [ref=e128]:
      - generic [ref=e129]:
        - heading "Inspector" [level=2] [ref=e130]
        - paragraph [ref=e131]: Select a node to inspect its parameters.
  - generic [ref=e133]:
    - heading "Shader output" [level=2] [ref=e134]
    - paragraph [ref=e135]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e136]:
      - listitem [ref=e137]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e138] [cursor=pointer]
  - contentinfo [ref=e139]:
    - generic [ref=e140]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e141]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  17  |     buffer: Buffer.from(JSON.stringify(document)),
  18  |   });
  19  |   await page
  20  |     .getByRole("button", { name: "Open in new session", exact: true })
  21  |     .click();
  22  | }
  23  | test("S05 AT04 AT05 real mode command reports precise loss and Undo restores entire graph; rejected activation leaves UI and history unchanged", async ({
  24  |   page,
  25  | }) => {
  26  |   await page.goto("/");
  27  |   const records = [];
  28  |   for (const internal of [false, true]) {
  29  |     const doc = await page.evaluate(async (internal) => {
  30  |       const { functionFixture } = await import("/tests/fixtures/s05.ts"),
  31  |         { functionOperationRef } =
  32  |           await import("/src/modules/function-operations.ts");
  33  |       const s = functionFixture(),
  34  |         network = internal ? s.body : s.network;
  35  |       s.graph.change("Constant consumer", (d) => {
  36  |         const receiver = d.add(
  37  |           network,
  38  |           functionOperationRef("constant-input"),
  39  |           [0, 250],
  40  |         );
  41  |         d.connect(
  42  |           network,
  43  |           internal
  44  |             ? { nodeId: s.definition().data.network.nodes[0].id, portKey: "x" }
  45  |             : { nodeId: s.call, portKey: "y" },
  46  |           { nodeId: receiver, portKey: "value" },
  47  |         );
  48  |       });
  49  |       return s.graph.capture().document;
  50  |     }, internal);
  51  |     await openFixture(page, doc);
  52  |     const canvas = page.locator(".canvas").first();
  53  |     await canvas
  54  |       .getByRole("heading", { name: "Shared arithmetic", exact: true })
  55  |       .last()
  56  |       .click();
  57  |     await canvas
  58  |       .getByRole("button", { name: "Enter subgraph", exact: true })
  59  |       .click();
  60  |     await canvas.getByText("Subgraph interface", { exact: true }).click();
  61  |     const before = await exported(page);
  62  |     await canvas.getByLabel("Subgraph emission mode").selectOption("function");
  63  |     const after = await exported(page);
  64  |     if (internal) {
  65  |       expect(after.graph).toEqual(before.graph);
  66  |       await expect(canvas.getByLabel("Subgraph emission mode")).toHaveValue(
  67  |         "expand",
  68  |       );
  69  |       await expect(canvas.locator(".canvas-notice")).toContainText(
  70  |         "CONSTANT_REQUIRED",
  71  |       );
  72  |       await expect(
  73  |         page.getByRole("button", { name: "Undo", exact: true }),
  74  |       ).toBeDisabled();
  75  |     } else {
  76  |       expect(after.graph.losses.at(-1).code).toBe("FUNCTION_CONSTANT_DETACHED");
  77  |       await expect(canvas.locator(".canvas-notice")).toContainText("Receiver");
  78  |       await page
  79  |         .getByRole("button", { name: "Generate GLSL", exact: true })
  80  |         .click();
  81  |       await expect(
  82  |         page.getByRole("list", { name: "Diagnostics" }),
  83  |       ).toContainText("INPUT_REQUIRED");
  84  |       await page.getByRole("button", { name: "Undo", exact: true }).click();
  85  |       expect((await exported(page)).graph).toEqual(before.graph);
  86  |       await page.getByRole("button", { name: "Redo", exact: true }).click();
  87  |       expect((await exported(page)).graph).toEqual(after.graph);
  88  |     }
  89  |     records.push({ internal, before, after });
  90  |   }
  91  |   await fs.writeFile(
  92  |     evidence + "/s05-ui-constant-transactions.json",
  93  |     JSON.stringify(records, null, 2),
  94  |   );
  95  | });
  96  | test("S05 AT07 legacy mode UI requires explicit owner upgrade preserving original data", async ({
  97  |   page,
  98  | }) => {
  99  |   await page.goto("/");
  100 |   const doc = await page.evaluate(async () => {
  101 |     const { currentSetup } = await import("/tests/fixtures/s04.ts");
  102 |     const s = currentSetup();
  103 |     s.graph.change("Legacy", (d) => d.createSubgraph(s.network));
  104 |     return s.graph.capture().document;
  105 |   });
  106 |   await openFixture(page, doc);
  107 |   let canvas = page.locator(".canvas").first();
  108 |   await canvas.getByRole("heading", { name: "Subgraph", exact: true }).click();
  109 |   await canvas
  110 |     .getByRole("button", { name: "Enter subgraph", exact: true })
  111 |     .click();
  112 |   await canvas.getByText("Subgraph interface", { exact: true }).click();
  113 |   await expect(canvas.getByLabel("Subgraph emission mode")).toBeDisabled();
  114 |   const before = await exported(page);
  115 |   await page
  116 |     .getByRole("button", { name: "Upgrade subgraph owners", exact: true })
> 117 |     .click();
      |      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  118 |   canvas = page.locator(".canvas").first();
  119 |   await canvas.getByRole("heading", { name: "Subgraph", exact: true }).click();
  120 |   await canvas
  121 |     .getByRole("button", { name: "Enter subgraph", exact: true })
  122 |     .click();
  123 |   await canvas.getByText("Subgraph interface", { exact: true }).click();
  124 |   await expect(canvas.getByLabel("Subgraph emission mode")).toBeEnabled();
  125 |   const after = await exported(page);
  126 |   expect(after.graph.resources[0].data.network).toEqual(
  127 |     before.graph.resources[0].data.network,
  128 |   );
  129 |   expect(after.graph.resources[0].data.emissionMode).toBe("expand");
  130 |   await fs.writeFile(
  131 |     evidence + "/s05-ui-explicit-upgrade.json",
  132 |     JSON.stringify({ before, after }, null, 2),
  133 |   );
  134 | });
  135 | test("S05 AT03 AT08 WebGL2 fixed shape nominal effects unconsumed nested effects and independent stage helpers", async ({
  136 |   page,
  137 |   browser,
  138 | }) => {
  139 |   await page.goto("/");
  140 |   const rows = await page.evaluate(async () => {
  141 |     const { shapeFixture, effectFixture, stageFixture } =
  142 |         await import("/tests/fixtures/s05.ts"),
  143 |       { executeGL } = await import("/tests/fixtures/s05-webgl.ts"),
  144 |       { compile } = await import("/src/generation/compiler.ts");
  145 |     const rows = [];
  146 |     for (const kind of ["array", "nominal"] as const) {
  147 |       const s = shapeFixture(kind);
  148 |       s.graph.change("Shape function", (d) =>
  149 |         d.emissionMode(s.body, "function", s.profile),
  150 |       );
  151 |       rows.push({
  152 |         kind,
  153 |         ...executeGL(compile(s.graph.capture(), s.fixed, s.profile)),
  154 |         expected: kind === "array" ? [191, 191, 191, 191] : [89, 89, 89, 89],
  155 |       });
  156 |     }
  157 |     for (const [kind, discard, unconsumed, nested] of [
  158 |       ["effect-pair", false, false, false],
  159 |       ["discard", true, false, false],
  160 |       ["unconsumed-effects", true, true, false],
  161 |       ["nested-unconsumed-effects", true, true, true],
  162 |     ] as const) {
  163 |       const s = effectFixture(discard, unconsumed, nested);
  164 |       rows.push({
  165 |         kind,
  166 |         ...executeGL(compile(s.graph.capture(), s.fixed, s.profile)),
  167 |         expected: discard ? [0, 0, 0, 0] : [51, 102, 0, 255],
  168 |       });
  169 |     }
  170 |     for (const probe of [0.1, 0.3]) {
  171 |       const depth = effectFixture();
  172 |       rows.push({
  173 |         kind: "depth-probe-" + probe,
  174 |         ...executeGL(
  175 |           compile(depth.graph.capture(), depth.fixed, depth.profile),
  176 |           {},
  177 |           probe,
  178 |         ),
  179 |         expected: probe === 0.1 ? [255, 0, 0, 255] : [51, 102, 0, 255],
  180 |       });
  181 |     }
  182 |     const s = stageFixture();
  183 |     rows.push({
  184 |       kind: "vertex-pixel",
  185 |       ...executeGL(compile(s.graph.capture(), s.fixed, s.profile)),
  186 |       expected: [51, 102, 153, 255],
  187 |     });
  188 |     return rows;
  189 |   });
  190 |   for (const row of rows)
  191 |     row.pixels.forEach((v, i) =>
  192 |       expect(Math.abs(v - row.expected[i]), row.kind).toBeLessThanOrEqual(1),
  193 |     );
  194 |   await fs.writeFile(
  195 |     evidence + "/s05-webgl-shape-effects-stage.json",
  196 |     JSON.stringify({ browser: browser.version(), rows }, null, 2),
  197 |   );
  198 | });
  199 | test("S05 AT02 AT03 real WebGL2 distinct shared and nested caller values and Uniform parameters", async ({
  200 |   page,
  201 |   browser,
  202 | }) => {
  203 |   await page.goto("/");
  204 |   const result = await page.evaluate(async () => {
  205 |     const { functionFixture } = await import("/tests/fixtures/s05.ts"),
  206 |       { executeGL } = await import("/tests/fixtures/s05-webgl.ts"),
  207 |       { compile } = await import("/src/generation/compiler.ts"),
  208 |       { asNetwork } = await import("/src/sdk/networks.ts"),
  209 |       { functionOperationRef } =
  210 |         await import("/src/modules/function-operations.ts");
  211 |     const rows = [];
  212 |     for (const kind of ["expanded", "shared", "nested", "uniform"]) {
  213 |       const s = functionFixture();
  214 |       let uniform = "";
  215 |       if (kind !== "expanded")
  216 |         s.graph.change("Function", (d) =>
  217 |           d.emissionMode(s.body, "function", s.profile),
```