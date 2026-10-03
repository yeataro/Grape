# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s01.spec.ts >> AT-S01-05 browser: IndexedDB ACK save/reopen and independent JSON download/file open
- Location: tests\browser\s01.spec.ts:83:1

# Error details

```
Error: locator.setInputFiles: Error: strict mode violation: locator('input[type=file]') resolved to 2 elements:
    1) <input type="file" accept=".json,.sgrape-function.json" aria-label="Import Personal package"/> aka getByLabel('Import Personal package')
    2) <input hidden="" type="file" accept=".json,.grape.json,.png,application/json,image/png"/> aka locator('input[type="file"]').nth(1)

Call log:
  - waiting for locator('input[type=file]')

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
      - button "Save" [ref=e9] [cursor=pointer]
      - button "Open saved" [ref=e10] [cursor=pointer]
      - button "Export JSON" [ref=e11] [cursor=pointer]
      - button "Export PNG" [ref=e12] [cursor=pointer]
      - button "Open file" [ref=e13] [cursor=pointer]
      - button "Generate GLSL" [active] [ref=e14] [cursor=pointer]
      - button "Second Canvas" [ref=e15] [cursor=pointer]
      - button "Lock editing" [ref=e16] [cursor=pointer]
      - button "Personal Library" [ref=e17] [cursor=pointer]
    - generic [ref=e18]:
      - generic [ref=e19]: Saved
      - generic [ref=e20]: Host-free
  - status [ref=e21]
  - generic [ref=e23]:
    - button "Add Float" [ref=e24] [cursor=pointer]
    - button "Add Multiply" [ref=e25] [cursor=pointer]
    - button "Add Compose" [ref=e26] [cursor=pointer]
    - button "Add Array repeat" [ref=e27] [cursor=pointer]
    - button "Undo" [disabled] [ref=e28]
    - button "Redo" [disabled] [ref=e29]
    - button "Delete selected" [ref=e30] [cursor=pointer]
    - alert
  - main [ref=e31]:
    - generic [ref=e33]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e34]:
        - generic:
          - generic:
            - group "Image output" [ref=e37]:
              - heading "Image output" [level=3] [ref=e38]
              - generic [ref=e39]:
                - button "Image output input color" [ref=e40] [cursor=pointer]:
                  - generic [ref=e41]: ●
                  - generic [ref=e42]: color
                - generic [ref=e43]: vec4
            - group "Float" [ref=e44]:
              - heading "Float" [level=3] [ref=e45]
              - generic [ref=e46]:
                - button "Float output value" [ref=e47] [cursor=pointer]:
                  - generic [ref=e48]: value
                  - generic [ref=e49]: ●
                - generic [ref=e50]: float
            - group "Multiply" [ref=e51]:
              - heading "Multiply" [level=3] [ref=e52]
              - generic [ref=e53]:
                - button "Multiply input a" [ref=e54] [cursor=pointer]:
                  - generic [ref=e55]: ●
                  - generic [ref=e56]: a
                - generic [ref=e57]: float
              - generic [ref=e58]:
                - button "Multiply input b" [ref=e59] [cursor=pointer]:
                  - generic [ref=e60]: ●
                  - generic [ref=e61]: b
                - generic [ref=e62]: float
              - generic [ref=e63]:
                - button "Multiply output result" [ref=e64] [cursor=pointer]:
                  - generic [ref=e65]: result
                  - generic [ref=e66]: ●
                - generic [ref=e67]: float
            - group "Compose" [ref=e68]:
              - heading "Compose" [level=3] [ref=e69]
              - generic [ref=e70]:
                - button "Compose input x" [ref=e71] [cursor=pointer]:
                  - generic [ref=e72]: ●
                  - generic [ref=e73]: x
                - generic [ref=e74]: float
              - generic [ref=e75]:
                - button "Compose input y" [ref=e76] [cursor=pointer]:
                  - generic [ref=e77]: ●
                  - generic [ref=e78]: "y"
                - generic [ref=e79]: float
              - generic [ref=e80]:
                - button "Compose input z" [ref=e81] [cursor=pointer]:
                  - generic [ref=e82]: ●
                  - generic [ref=e83]: z
                - generic [ref=e84]: float
              - generic [ref=e85]:
                - button "Compose input w" [ref=e86] [cursor=pointer]:
                  - generic [ref=e87]: ●
                  - generic [ref=e88]: w
                - generic [ref=e89]: float
              - generic [ref=e90]:
                - button "Compose output result" [ref=e91] [cursor=pointer]:
                  - generic [ref=e92]: result
                  - generic [ref=e93]: ●
                - generic [ref=e94]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e95]:
          - button "New subgraph" [ref=e96] [cursor=pointer]
          - button "Library subgraph" [ref=e97] [cursor=pointer]
          - button "Encapsulate" [ref=e98] [cursor=pointer]
          - button "Make independent" [ref=e99] [cursor=pointer]
          - button "Enter subgraph" [ref=e100] [cursor=pointer]
          - button "Up" [ref=e101] [cursor=pointer]
          - button "Arrange nodes" [ref=e102] [cursor=pointer]
          - button "Frame selection" [ref=e103] [cursor=pointer]
          - group [ref=e104]:
            - generic "Local clipboard" [ref=e105]
          - group [ref=e106]:
            - generic "Structures" [ref=e107]
            - option "New structure" [selected]
    - complementary [ref=e108]:
      - generic [ref=e109]:
        - heading "Inspector" [level=2] [ref=e110]
        - paragraph [ref=e111]: Select a node to inspect its parameters.
  - generic [ref=e113]:
    - heading "Shader output" [level=2] [ref=e114]
    - paragraph [ref=e115]: Generated successfully · Host-free GLSL
    - generic "Generated GLSL" [ref=e116]: "// vertex #version 300 es layout(location=0) in vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); } // pixel #version 300 es precision highp float; out vec4 fragColor; void main() { const float n_1_p0 = 0.25; const float n_2_p2 = (n_1_p0 * 2.0); const vec4 n_3_p4 = vec4(n_2_p2, 0.0, 0.0, 1.0); fragColor = n_3_p4; }"
    - list "Diagnostics"
  - contentinfo [ref=e117]:
    - generic [ref=e118]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e119]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  5   |   await page.getByRole("button", { name: "Add Compose", exact: true }).click();
  6   |   await page
  7   |     .getByRole("button", { name: "Float output value", exact: true })
  8   |     .click();
  9   |   await page
  10  |     .getByRole("button", { name: "Multiply input a", exact: true })
  11  |     .click();
  12  |   await page
  13  |     .getByRole("button", { name: "Multiply output result", exact: true })
  14  |     .click();
  15  |   await page
  16  |     .getByRole("button", { name: "Compose input x", exact: true })
  17  |     .click();
  18  |   await page
  19  |     .getByRole("button", { name: "Compose output result", exact: true })
  20  |     .click();
  21  |   await page
  22  |     .getByRole("button", { name: "Image output input color", exact: true })
  23  |     .click();
  24  | }
  25  | test.beforeEach(async ({ page }) => {
  26  |   await page.goto("/");
  27  | });
  28  | test("AT-S01-01 browser: user creates connected shader, edits and sees generated GLSL", async ({
  29  |   page,
  30  | }) => {
  31  |   const errors: string[] = [];
  32  |   page.on("pageerror", (e) => errors.push(e.message));
  33  |   await fullFlow(page);
  34  |   await page.getByRole("button", { name: "Generate GLSL" }).click();
  35  |   await expect(
  36  |     page.getByText("Generated successfully · Host-free GLSL"),
  37  |   ).toBeVisible();
  38  |   await expect(page.getByLabel("Generated GLSL")).toContainText("* 2.0");
  39  |   await page
  40  |     .locator(".node h3")
  41  |     .filter({ hasText: /^Float$/ })
  42  |     .click();
  43  |   const input = page.getByRole("textbox", { name: "Value", exact: true });
  44  |   await input.fill("0.5");
  45  |   await input.press("Enter");
  46  |   await expect(input).toHaveValue("0.5");
  47  |   await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
  48  |   expect(errors).toEqual([]);
  49  |   await page.screenshot({
  50  |     path: `${process.env.GRAPE_EVIDENCE_DIR ?? "evidence/s02"}/s01-workspace.png`,
  51  |     fullPage: true,
  52  |   });
  53  | });
  54  | test("AT-S01-03 browser: dynamic shape errors are visible, Undo restores and Redo repeats", async ({
  55  |   page,
  56  | }) => {
  57  |   await fullFlow(page);
  58  |   await page
  59  |     .locator(".node h3")
  60  |     .filter({ hasText: /^Compose$/ })
  61  |     .click();
  62  |   await page
  63  |     .getByRole("combobox", { name: "Shape" })
  64  |     .selectOption({ label: "vec2" });
  65  |   await page.getByRole("button", { name: "Generate GLSL" }).click();
  66  |   await expect(
  67  |     page.getByText("Generation blocked", { exact: true }),
  68  |   ).toBeVisible();
  69  |   await expect(page.getByLabel("Diagnostics")).toContainText("INPUT_REQUIRED");
  70  |   await page.getByRole("button", { name: "Undo", exact: true }).click();
  71  |   await expect(page.getByRole("combobox", { name: "Shape" })).toHaveValue(
  72  |     "RGBA (vec4)",
  73  |   );
  74  |   await page.getByRole("button", { name: "Generate GLSL" }).click();
  75  |   await expect(
  76  |     page.getByText("Generated successfully · Host-free GLSL"),
  77  |   ).toBeVisible();
  78  |   await page.getByRole("button", { name: "Redo", exact: true }).click();
  79  |   await expect(page.getByRole("combobox", { name: "Shape" })).toHaveValue(
  80  |     "vec2",
  81  |   );
  82  | });
  83  | test("AT-S01-05 browser: IndexedDB ACK save/reopen and independent JSON download/file open", async ({
  84  |   page,
  85  | }) => {
  86  |   await fullFlow(page);
  87  |   await page.getByRole("button", { name: "Save", exact: true }).click();
  88  |   await expect(page.locator("#save-state")).toHaveText("Saved");
  89  |   const downloadPromise = page.waitForEvent("download");
  90  |   await page.getByRole("button", { name: "Export JSON" }).click();
  91  |   const download = await downloadPromise;
  92  |   const file = await download.path();
  93  |   await page.getByRole("button", { name: "New document", exact: true }).click();
  94  |   await page.getByRole("button", { name: "Open saved", exact: true }).click();
  95  |   page.once("dialog", (dialog) => dialog.accept());
  96  |   await page.locator("#saved-list button").click();
  97  |   await expect(page.locator(".node")).toHaveCount(4);
  98  |   await page.getByRole("button", { name: "Generate GLSL" }).click();
  99  |   await expect(
  100 |     page.getByText("Generated successfully · Host-free GLSL"),
  101 |   ).toBeVisible();
  102 |   await expect(
  103 |     page.getByRole("button", { name: "Undo", exact: true }),
  104 |   ).toBeDisabled();
> 105 |   await page.locator("input[type=file]").setInputFiles(file!);
      |   ^ Error: locator.setInputFiles: Error: strict mode violation: locator('input[type=file]') resolved to 2 elements:
  106 |   await page
  107 |     .getByRole("button", { name: "Open in new session", exact: true })
  108 |     .click();
  109 |   await expect(page.locator(".node")).toHaveCount(4);
  110 |   await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
  111 | });
  112 | 
  113 | test("AT-S01-02 browser: occupied and incompatible connections preserve wires and revision", async ({
  114 |   page,
  115 | }) => {
  116 |   await fullFlow(page);
  117 |   const canvas = page.locator(".canvas").first(),
  118 |     revision = await canvas.getAttribute("data-revision"),
  119 |     edges = await page.locator("[data-edge]").count();
  120 |   await page
  121 |     .getByRole("button", { name: "Float output value", exact: true })
  122 |     .click();
  123 |   await page
  124 |     .getByRole("button", { name: "Multiply input a", exact: true })
  125 |     .click();
  126 |   await expect(page.locator(".canvas-notice")).toContainText("INPUT_OCCUPIED");
  127 |   expect(await canvas.getAttribute("data-revision")).toBe(revision);
  128 |   expect(await page.locator("[data-edge]").count()).toBe(edges);
  129 |   await page
  130 |     .getByRole("button", { name: "Float output value", exact: true })
  131 |     .click();
  132 |   await page
  133 |     .getByRole("button", { name: "Image output input color", exact: true })
  134 |     .click({ modifiers: ["Shift"] });
  135 |   await expect(page.locator(".canvas-notice")).toContainText("TYPE_ADAPTATION");
  136 |   expect(await canvas.getAttribute("data-revision")).toBe(revision);
  137 | });
  138 | test("AT-S01-04 browser: draft cancel, IME guard, keyboard commit, pointer gesture Undo and cancel", async ({
  139 |   page,
  140 | }) => {
  141 |   await page.getByRole("button", { name: "Add Float", exact: true }).click();
  142 |   const input = page.getByRole("textbox", { name: "Value", exact: true }),
  143 |     canvas = page.locator(".canvas");
  144 |   const before = await canvas.getAttribute("data-revision");
  145 |   await input.fill("0.");
  146 |   await expect(canvas).toHaveAttribute("data-revision", before!);
  147 |   await input.press("Escape");
  148 |   await expect(input).toHaveValue("0.25");
  149 |   await input.dispatchEvent("compositionstart", { data: "1" });
  150 |   await input.fill("0.8");
  151 |   await input.press("Enter");
  152 |   await expect(canvas).toHaveAttribute("data-revision", before!);
  153 |   await input.dispatchEvent("compositionend", { data: "0.8" });
  154 |   await input.press("Enter");
  155 |   await expect(input).toHaveValue("0.8");
  156 |   await input.press("Control+z");
  157 |   await expect(input).toHaveValue("0.25");
  158 |   const card = page
  159 |       .locator(".node")
  160 |       .filter({ has: page.locator("h3", { hasText: /^Float$/ }) }),
  161 |     position = await card.getAttribute("style");
  162 |   const title = card.locator("h3"),
  163 |     box = await title.boundingBox();
  164 |   await page.mouse.move(box!.x + 60, box!.y + 15);
  165 |   await page.mouse.down();
  166 |   await page.mouse.move(box!.x + 90, box!.y + 45, { steps: 4 });
  167 |   await page.mouse.move(box!.x + 120, box!.y + 55, { steps: 4 });
  168 |   await page.mouse.up();
  169 |   expect(await card.getAttribute("style")).not.toBe(position);
  170 |   await page.getByRole("button", { name: "Undo", exact: true }).click();
  171 |   await expect(card).toHaveAttribute("style", position!);
  172 |   const again = await title.boundingBox();
  173 |   await page.mouse.move(again!.x + 60, again!.y + 15);
  174 |   await page.mouse.down();
  175 |   await page.mouse.move(again!.x + 140, again!.y + 70, { steps: 4 });
  176 |   await canvas.dispatchEvent("pointercancel", { pointerId: 1 });
  177 |   await page.mouse.up();
  178 |   await expect(card).toHaveAttribute("style", position!);
  179 | });
  180 | test("AT-S01-06 browser: two Canvas contexts keep independent selections and camera while sharing edits", async ({
  181 |   page,
  182 | }) => {
  183 |   await page.getByRole("button", { name: "Add Float", exact: true }).click();
  184 |   await page.getByRole("button", { name: "Add Multiply", exact: true }).click();
  185 |   await page
  186 |     .locator("#canvas-1 .node h3")
  187 |     .filter({ hasText: /^Float$/ })
  188 |     .click();
  189 |   const selection = await page
  190 |     .locator("#canvas-1 .canvas")
  191 |     .getAttribute("data-selection");
  192 |   await page
  193 |     .getByRole("button", { name: "Second Canvas", exact: true })
  194 |     .click();
  195 |   await page
  196 |     .locator("#canvas-2 .node h3")
  197 |     .filter({ hasText: /^Multiply$/ })
  198 |     .click();
  199 |   await expect(page.locator("#canvas-1 .canvas")).toHaveAttribute(
  200 |     "data-selection",
  201 |     selection!,
  202 |   );
  203 |   const second = page.locator("#canvas-2 .canvas");
  204 |   await second.hover({ position: { x: 30, y: 350 } });
  205 |   await page.mouse.wheel(0, -200);
```