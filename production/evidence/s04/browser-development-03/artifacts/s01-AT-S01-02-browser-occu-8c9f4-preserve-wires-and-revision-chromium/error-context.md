# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s01.spec.ts >> AT-S01-02 browser: occupied and incompatible connections preserve wires and revision
- Location: tests\browser\s01.spec.ts:113:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.canvas-notice')
Expected substring: "TYPE_ADAPTATION"
Received string:    ""
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('.canvas-notice')
    14 × locator resolved to <div role="status" class="canvas-notice"></div>
       - unexpected value ""

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
    - button "Compose input z": ● z
    - text: float
    - button "Compose input w": ● w
    - text: float
    - button "Compose output result": result ●
    - text: vec4
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
      - option "vec2"
      - option "vec3"
      - option "RGBA (vec4)" [selected]
    - text: R / X
    - textbox "R / X": "0"
    - alert: Connected input — local value retained.
    - text: G / Y
    - textbox "G / Y": "0"
    - alert
    - text: B / Z
    - textbox "B / Z": "0"
    - alert
    - text: A / W
    - textbox "A / W": "1"
    - alert
    - text: From Multiply
    - button "Disconnect"
- heading "Shader output" [level=2]
- paragraph: Generate to inspect shader output.
- list "Diagnostics"
- contentinfo: Click an output port, then an input to connect. Shift-click replaces a connection. Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
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
> 135 |   await expect(page.locator(".canvas-notice")).toContainText("TYPE_ADAPTATION");
      |                                                ^ Error: expect(locator).toContainText(expected) failed
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
  206 |   await expect(second).not.toHaveAttribute("data-zoom", "1");
  207 |   await expect(page.locator("#canvas-1 .canvas")).toHaveAttribute(
  208 |     "data-zoom",
  209 |     "1",
  210 |   );
  211 |   await page
  212 |     .locator("#canvas-1 .node h3")
  213 |     .filter({ hasText: /^Float$/ })
  214 |     .click();
  215 |   await page.getByRole("textbox", { name: "Value", exact: true }).fill("0.9");
  216 |   await page
  217 |     .getByRole("textbox", { name: "Value", exact: true })
  218 |     .press("Enter");
  219 |   expect(
  220 |     await page.locator("#canvas-1 .canvas").getAttribute("data-revision"),
  221 |   ).toBe(await second.getAttribute("data-revision"));
  222 |   await page
  223 |     .locator("#canvas-2 .node h3")
  224 |     .filter({ hasText: /^Float$/ })
  225 |     .click();
  226 |   await expect(
  227 |     page.getByRole("textbox", { name: "Value", exact: true }),
  228 |   ).toHaveValue("0.9");
  229 |   await page
  230 |     .getByRole("button", { name: "Delete selected", exact: true })
  231 |     .click();
  232 |   await expect(page.locator("#canvas-1 .canvas")).toHaveAttribute(
  233 |     "data-selection",
  234 |     "",
  235 |   );
```