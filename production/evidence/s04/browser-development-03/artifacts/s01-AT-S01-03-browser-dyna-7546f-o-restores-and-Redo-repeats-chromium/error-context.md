# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s01.spec.ts >> AT-S01-03 browser: dynamic shape errors are visible, Undo restores and Redo repeats
- Location: tests\browser\s01.spec.ts:54:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Generation blocked', { exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Generation blocked', { exact: true })

```

```yaml
- banner:
  - text: ● Grape SHADER WORKSPACE
  - navigation "Document actions":
    - button "New document"
    - button "Save"
    - button "Open saved"
    - button "Export JSON"
    - button "Export PNG"
    - button "Open file"
    - button "Generate GLSL"
    - button "Second Canvas"
    - button "Lock editing"
    - button "Personal Library"
  - text: Unsaved changes Host-free
- status
- button "Add Float"
- button "Add Multiply"
- button "Add Compose"
- button "Add Array repeat"
- button "Undo"
- button "Redo" [disabled]
- button "Delete selected"
- alert
- main:
  - text: Canvas 1
  - img
  - group "Image output":
    - heading "Image output" [level=3]
    - button "Image output input color": ● color
    - text: vec4
  - group "Float":
    - heading "Float" [level=3]
    - button "Float output value": value ●
    - text: float
  - group "Multiply":
    - heading "Multiply" [level=3]
    - button "Multiply input a": ● a
    - text: float
    - button "Multiply input b": ● b
    - text: float
    - button "Multiply output result": result ●
    - text: float
  - group "Compose":
    - heading "Compose" [level=3]
    - button "Compose input x": ● x
    - text: float
    - button "Compose input y": ● y
    - text: float
    - button "Compose output result": result ●
    - text: vec2
  - button "Untitled shader / pixel" [disabled]
  - button "New subgraph"
  - button "Library subgraph"
  - button "Encapsulate"
  - button "Make independent"
  - button "Enter subgraph"
  - button "Up"
  - button "Arrange nodes"
  - button "Frame selection"
  - group: Local clipboard
  - group: Structures
  - complementary:
    - heading "Inspector" [level=2]
    - paragraph: Compose
    - button "Rename node"
    - text: Shape
    - combobox "Shape":
      - option "vec2" [selected]
      - option "vec3"
      - option "RGBA (vec4)"
    - text: R / X
    - textbox "R / X": "0"
    - alert: Connected input — local value retained.
    - text: G / Y
    - textbox "G / Y": "0"
    - alert
    - text: From Multiply
    - button "Disconnect"
- heading "Shader output" [level=2]
- paragraph: Generated successfully · Host-free GLSL
- text: "// vertex #version 300 es layout(location=0) in vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); } // pixel #version 300 es precision highp float; out vec4 fragColor; void main() { const float n_1_p0 = 0.25; const float n_2_p2 = (n_1_p0 * 2.0); const vec2 n_3_p2 = vec2(n_2_p2, 0.0); fragColor = vec4(n_3_p2, 0.0, 1.0); }"
- list "Diagnostics":
  - listitem: "INPUT_REMOVED: Interface change removed authored data."
  - listitem: "INPUT_REMOVED: Interface change removed authored data."
- contentinfo: Click an output port, then an input to connect. Shift-click replaces a connection. Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | async function fullFlow(page: any) {
  3   |   await page.getByRole("button", { name: "Add Float", exact: true }).click();
  4   |   await page.getByRole("button", { name: "Add Multiply", exact: true }).click();
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
> 68  |   ).toBeVisible();
      |     ^ Error: expect(locator).toBeVisible() failed
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
  105 |   await page.locator("input[type=file]").setInputFiles(file!);
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
```