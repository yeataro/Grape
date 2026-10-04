# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05.spec.ts >> S05 AT04 AT05 real mode command reports precise loss and Undo restores entire graph; rejected activation leaves UI and history unchanged
- Location: tests\browser\s05.spec.ts:24:1

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
      - generic [ref=e5]: ●
      - text: Grape
      - generic [ref=e6]: SHADER WORKSPACE
    - navigation "Document actions" [ref=e7]:
      - button "New document" [ref=e8] [cursor=pointer]
      - button "Upgrade subgraph owners" [ref=e9] [cursor=pointer]
      - button "Save" [ref=e10] [cursor=pointer]
      - button "Open saved" [ref=e11] [cursor=pointer]
      - button "Export JSON" [active] [ref=e12] [cursor=pointer]
      - button "Export PNG" [ref=e13] [cursor=pointer]
      - button "Open file" [ref=e14] [cursor=pointer]
      - button "Generate GLSL" [ref=e15] [cursor=pointer]
      - button "Second Canvas" [ref=e16] [cursor=pointer]
      - button "Lock editing" [ref=e17] [cursor=pointer]
      - button "Personal Library" [ref=e18] [cursor=pointer]
    - generic [ref=e19]:
      - generic [ref=e20]: Unsaved changes
      - generic [ref=e21]: Host-free
  - status [ref=e22]: $.graph.losses[0].extensions
  - generic [ref=e24]:
    - button "Add Float" [ref=e25] [cursor=pointer]
    - button "Add Multiply" [ref=e26] [cursor=pointer]
    - button "Add Compose" [ref=e27] [cursor=pointer]
    - button "Add Array repeat" [ref=e28] [cursor=pointer]
    - button "Add Vertex position" [ref=e29] [cursor=pointer]
    - button "Add Constant input" [ref=e30] [cursor=pointer]
    - button "Add Add" [ref=e31] [cursor=pointer]
    - button "Add Array length" [ref=e32] [cursor=pointer]
    - button "Add Pixel depth and pair" [ref=e33] [cursor=pointer]
    - button "Undo" [ref=e34] [cursor=pointer]
    - button "Redo" [disabled] [ref=e35]
    - button "Delete selected" [ref=e36] [cursor=pointer]
    - alert
  - main [ref=e37]:
    - generic [ref=e39]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e40]:
        - generic:
          - generic:
            - group "Inputs" [ref=e44]:
              - heading "Inputs" [level=3] [ref=e45]
              - button "Create input port from selection" [ref=e46] [cursor=pointer]
              - generic [ref=e47]:
                - button "Inputs output X" [ref=e48] [cursor=pointer]:
                  - generic [ref=e49]: X
                  - generic [ref=e50]: ●
                - generic [ref=e51]: float
            - group "Outputs" [ref=e52]:
              - heading "Outputs" [level=3] [ref=e53]
              - button "Create output port from selection" [ref=e54] [cursor=pointer]
              - generic [ref=e55]:
                - button "Outputs input Y" [ref=e56] [cursor=pointer]:
                  - generic [ref=e57]: ●
                  - generic [ref=e58]: "Y"
                - generic [ref=e59]: float
              - generic [ref=e60]:
                - button "Outputs input Twice" [ref=e61] [cursor=pointer]:
                  - generic [ref=e62]: ●
                  - generic [ref=e63]: Twice
                - generic [ref=e64]: float
            - group "Add" [ref=e65]:
              - heading "Add" [level=3] [ref=e66]
              - generic [ref=e67]:
                - button "Add input a" [ref=e68] [cursor=pointer]:
                  - generic [ref=e69]: ●
                  - generic [ref=e70]: a
                - generic [ref=e71]: float
              - generic [ref=e72]:
                - button "Add input b" [ref=e73] [cursor=pointer]:
                  - generic [ref=e74]: ●
                  - generic [ref=e75]: b
                - generic [ref=e76]: float
              - generic [ref=e77]:
                - button "Add output value" [ref=e78] [cursor=pointer]:
                  - generic [ref=e79]: value
                  - generic [ref=e80]: ●
                - generic [ref=e81]: float
        - generic:
          - button "Untitled shader / pixel" [ref=e82] [cursor=pointer]
          - button "Shared arithmetic" [disabled]
        - status: Function mode of definition id-22 makes this receiving input nonconstant. Receiver id-38/value; edge id-39.
        - generic [ref=e83]:
          - button "New subgraph" [ref=e84] [cursor=pointer]
          - button "Library subgraph" [ref=e85] [cursor=pointer]
          - button "Encapsulate" [ref=e86] [cursor=pointer]
          - button "Make independent" [ref=e87] [cursor=pointer]
          - button "Enter subgraph" [ref=e88] [cursor=pointer]
          - button "Up" [ref=e89] [cursor=pointer]
          - button "Arrange nodes" [ref=e90] [cursor=pointer]
          - button "Frame selection" [ref=e91] [cursor=pointer]
          - group [ref=e92]:
            - generic "Subgraph interface" [ref=e93]
            - textbox "Subgraph name" [ref=e94]: Shared arithmetic
            - combobox "Subgraph emission mode" [ref=e95]:
              - option "Expand"
              - option "Function" [selected]
            - text: Shared by all references. Use Make independent for a separate choice.
            - generic [ref=e96]:
              - generic [ref=e97]:
                - textbox "Port name 1" [ref=e98]: X
                - combobox "Port type 1" [ref=e99]:
                  - option "glsl.float" [selected]
                  - option "glsl.vec2"
                  - option "glsl.vec3"
                  - option "glsl.vec4"
                  - option "glsl.mat2"
                  - option "glsl.mat2x3"
                  - option "glsl.mat2x4"
                  - option "glsl.mat3x2"
                  - option "glsl.mat3"
                  - option "glsl.mat3x4"
                  - option "glsl.mat4x2"
                  - option "glsl.mat4x3"
                  - option "glsl.mat4"
                - textbox "Port default 1" [ref=e100]: "0.2"
                - combobox "Port direction 1" [ref=e101]:
                  - option "input" [selected]
                  - option "output"
                - button "Move port up 1" [disabled] [ref=e102]
                - button "Remove port 1" [ref=e103] [cursor=pointer]
              - generic [ref=e104]:
                - textbox "Port name 2" [ref=e105]: "Y"
                - combobox "Port type 2" [ref=e106]:
                  - option "glsl.float" [selected]
                  - option "glsl.vec2"
                  - option "glsl.vec3"
                  - option "glsl.vec4"
                  - option "glsl.mat2"
                  - option "glsl.mat2x3"
                  - option "glsl.mat2x4"
                  - option "glsl.mat3x2"
                  - option "glsl.mat3"
                  - option "glsl.mat3x4"
                  - option "glsl.mat4x2"
                  - option "glsl.mat4x3"
                  - option "glsl.mat4"
                - textbox "Port default 2" [ref=e107]: "0"
                - combobox "Port direction 2" [ref=e108]:
                  - option "input"
                  - option "output" [selected]
                - button "Move port up 2" [ref=e109] [cursor=pointer]
                - button "Remove port 2" [ref=e110] [cursor=pointer]
              - generic [ref=e111]:
                - textbox "Port name 3" [ref=e112]: Twice
                - combobox "Port type 3" [ref=e113]:
                  - option "glsl.float" [selected]
                  - option "glsl.vec2"
                  - option "glsl.vec3"
                  - option "glsl.vec4"
                  - option "glsl.mat2"
                  - option "glsl.mat2x3"
                  - option "glsl.mat2x4"
                  - option "glsl.mat3x2"
                  - option "glsl.mat3"
                  - option "glsl.mat3x4"
                  - option "glsl.mat4x2"
                  - option "glsl.mat4x3"
                  - option "glsl.mat4"
                - textbox "Port default 3" [ref=e114]: "0"
                - combobox "Port direction 3" [ref=e115]:
                  - option "input"
                  - option "output" [selected]
                - button "Move port up 3" [ref=e116] [cursor=pointer]
                - button "Remove port 3" [ref=e117] [cursor=pointer]
            - combobox "New port direction" [ref=e118]:
              - option "input" [selected]
              - option "output"
            - button "Add interface port" [ref=e119] [cursor=pointer]
            - button "Apply interface" [ref=e120] [cursor=pointer]
            - button "Cancel interface" [ref=e121] [cursor=pointer]
          - group [ref=e122]:
            - generic "Local clipboard" [ref=e123]
          - group [ref=e124]:
            - generic "Structures" [ref=e125]
            - option "New structure" [selected]
    - complementary [ref=e126]:
      - generic [ref=e127]:
        - heading "Inspector" [level=2] [ref=e128]
        - paragraph [ref=e129]: Select a node to inspect its parameters.
  - generic [ref=e131]:
    - heading "Shader output" [level=2] [ref=e132]
    - paragraph [ref=e133]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e134]:
      - listitem [ref=e135]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e136] [cursor=pointer]
      - listitem [ref=e137]: "FUNCTION_CONSTANT_DETACHED: Function mode of definition id-22 makes this receiving input nonconstant."
      - listitem [ref=e138]: "CONSTANT_REQUIRED: This input requires a compile-time constant; ordinary function parameters and function results are runtime values."
      - listitem [ref=e139]: "FUNCTION_CONSTANT_DETACHED: Function mode of definition id-22 makes this receiving input nonconstant."
  - contentinfo [ref=e140]:
    - generic [ref=e141]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e142]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import fs from "node:fs/promises";
  3   | const evidence = process.env.GRAPE_EVIDENCE_DIR!;
  4   | test.beforeEach(async ({ page }) => {
  5   |   page.on("dialog", (d) => d.accept());
  6   | });
  7   | async function exported(page: any) {
> 8   |   const event = page.waitForEvent("download");
      |                      ^ Error: page.waitForEvent: Test timeout of 30000ms exceeded.
  9   |   await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  10  |   return JSON.parse(await fs.readFile((await (await event).path())!, "utf8"));
  11  | }
  12  | async function openFixture(page: any, document: any) {
  13  |   await page
  14  |     .getByLabel("Open document file")
  15  |     .setInputFiles({
  16  |       name: "case.grape.json",
  17  |       mimeType: "application/json",
  18  |       buffer: Buffer.from(JSON.stringify(document)),
  19  |     });
  20  |   await page
  21  |     .getByRole("button", { name: "Open in new session", exact: true })
  22  |     .click();
  23  | }
  24  | test("S05 AT04 AT05 real mode command reports precise loss and Undo restores entire graph; rejected activation leaves UI and history unchanged", async ({
  25  |   page,
  26  | }) => {
  27  |   await page.goto("/");
  28  |   const records = [];
  29  |   for (const internal of [false, true]) {
  30  |     const doc = await page.evaluate(async (internal) => {
  31  |       const { functionFixture } = await import("/tests/fixtures/s05.ts"),
  32  |         { functionOperationRef } =
  33  |           await import("/src/modules/function-operations.ts");
  34  |       const s = functionFixture(),
  35  |         network = internal ? s.body : s.network;
  36  |       s.graph.change("Constant consumer", (d) => {
  37  |         const receiver = d.add(
  38  |           network,
  39  |           functionOperationRef("constant-input"),
  40  |           [0, 250],
  41  |         );
  42  |         d.connect(
  43  |           network,
  44  |           internal
  45  |             ? { nodeId: s.definition().data.network.nodes[0].id, portKey: "x" }
  46  |             : { nodeId: s.call, portKey: "y" },
  47  |           { nodeId: receiver, portKey: "value" },
  48  |         );
  49  |       });
  50  |       return s.graph.capture().document;
  51  |     }, internal);
  52  |     await openFixture(page, doc);
  53  |     const canvas = page.locator(".canvas").first();
  54  |     await canvas
  55  |       .getByRole("heading", { name: "Shared arithmetic", exact: true })
  56  |       .last()
  57  |       .click();
  58  |     await canvas
  59  |       .getByRole("button", { name: "Enter subgraph", exact: true })
  60  |       .click();
  61  |     await canvas.getByText("Subgraph interface", { exact: true }).click();
  62  |     const before = await exported(page);
  63  |     await canvas.getByLabel("Subgraph emission mode").selectOption("function");
  64  |     const after = await exported(page);
  65  |     if (internal) {
  66  |       expect(after.graph).toEqual(before.graph);
  67  |       await expect(canvas.getByLabel("Subgraph emission mode")).toHaveValue(
  68  |         "expand",
  69  |       );
  70  |       await expect(canvas.locator(".canvas-notice")).toContainText(
  71  |         "CONSTANT_REQUIRED",
  72  |       );
  73  |       await expect(
  74  |         page.getByRole("button", { name: "Undo", exact: true }),
  75  |       ).toBeDisabled();
  76  |     } else {
  77  |       expect(after.graph.losses.at(-1).code).toBe("FUNCTION_CONSTANT_DETACHED");
  78  |       await expect(canvas.locator(".canvas-notice")).toContainText("Receiver");
  79  |       await page
  80  |         .getByRole("button", { name: "Generate GLSL", exact: true })
  81  |         .click();
  82  |       await expect(
  83  |         page.getByRole("list", { name: "Diagnostics" }),
  84  |       ).toContainText("INPUT_REQUIRED");
  85  |       await page.getByRole("button", { name: "Undo", exact: true }).click();
  86  |       expect((await exported(page)).graph).toEqual(before.graph);
  87  |       await page.getByRole("button", { name: "Redo", exact: true }).click();
  88  |       expect((await exported(page)).graph).toEqual(after.graph);
  89  |     }
  90  |     records.push({ internal, before, after });
  91  |   }
  92  |   await fs.writeFile(
  93  |     evidence + "/s05-ui-constant-transactions.json",
  94  |     JSON.stringify(records, null, 2),
  95  |   );
  96  | });
  97  | test("S05 AT07 legacy mode UI requires explicit owner upgrade preserving original data", async ({
  98  |   page,
  99  | }) => {
  100 |   await page.goto("/");
  101 |   const doc = await page.evaluate(async () => {
  102 |     const { currentSetup } = await import("/tests/fixtures/s04.ts");
  103 |     const s = currentSetup();
  104 |     s.graph.change("Legacy", (d) => d.createSubgraph(s.network));
  105 |     return s.graph.capture().document;
  106 |   });
  107 |   await openFixture(page, doc);
  108 |   let canvas = page.locator(".canvas").first();
```