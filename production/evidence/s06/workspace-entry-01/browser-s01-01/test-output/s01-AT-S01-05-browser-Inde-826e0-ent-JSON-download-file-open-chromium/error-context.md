# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s01.spec.ts >> AT-S01-05 browser: IndexedDB ACK save/reopen and independent JSON download/file open
- Location: ..\..\..\production\tests\browser\s01.spec.ts:86:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.node')
Expected: 4
Received: 5
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('.node')
    - locator resolved to 2 elements
    - unexpected value "2"
    13 × locator resolved to 5 elements
       - unexpected value "5"

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
        - button "Open saved" [active] [ref=e18] [cursor=pointer]
        - button "Export JSON" [ref=e21] [cursor=pointer]
        - button "Export PNG" [ref=e24] [cursor=pointer]
        - button "Open file" [ref=e27] [cursor=pointer]
      - generic [ref=e30]:
        - button "Generate GLSL" [ref=e31] [cursor=pointer]
        - button "Second Canvas" [ref=e34] [cursor=pointer]
        - button "Lock editing" [ref=e37] [cursor=pointer]
      - group [ref=e40]:
        - generic "More actions" [ref=e41] [cursor=pointer]
    - generic [ref=e43]:
      - generic [ref=e44]: Saved
      - generic [ref=e45]: Host-free
  - status [ref=e46]
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
            - group "Image output" [ref=e62]:
              - heading "Image output" [level=3] [ref=e63]
              - generic [ref=e64]:
                - button "Image output input color" [ref=e65] [cursor=pointer]:
                  - generic [ref=e67]: color
                - generic [ref=e68]: vec4
            - group "Float" [ref=e69]:
              - heading "Float" [level=3] [ref=e70]
              - generic [ref=e71]:
                - button "Float output value" [ref=e72] [cursor=pointer]:
                  - generic [ref=e73]: value
                - generic [ref=e75]: float
            - group "Multiply" [ref=e76]:
              - heading "Multiply" [level=3] [ref=e77]
              - generic [ref=e78]:
                - button "Multiply input a" [ref=e79] [cursor=pointer]:
                  - generic [ref=e81]: a
                - generic [ref=e82]: float
              - generic [ref=e83]:
                - button "Multiply input b" [ref=e84] [cursor=pointer]:
                  - generic [ref=e86]: b
                - generic [ref=e87]: float
              - generic [ref=e88]:
                - button "Multiply output result" [ref=e89] [cursor=pointer]:
                  - generic [ref=e90]: result
                - generic [ref=e92]: float
            - group "Compose" [ref=e93]:
              - heading "Compose" [level=3] [ref=e94]
              - generic [ref=e95]:
                - button "Compose input x" [ref=e96] [cursor=pointer]:
                  - generic [ref=e98]: x
                - generic [ref=e99]: float
              - generic [ref=e100]:
                - button "Compose input y" [ref=e101] [cursor=pointer]:
                  - generic [ref=e103]: "y"
                - generic [ref=e104]: float
              - generic [ref=e105]:
                - button "Compose input z" [ref=e106] [cursor=pointer]:
                  - generic [ref=e108]: z
                - generic [ref=e109]: float
              - generic [ref=e110]:
                - button "Compose input w" [ref=e111] [cursor=pointer]:
                  - generic [ref=e113]: w
                - generic [ref=e114]: float
              - generic [ref=e115]:
                - button "Compose output result" [ref=e116] [cursor=pointer]:
                  - generic [ref=e117]: result
                - generic [ref=e119]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e120]:
          - button "New subgraph" [ref=e121] [cursor=pointer]
          - button "Library subgraph" [ref=e122] [cursor=pointer]
          - button "Encapsulate" [ref=e123] [cursor=pointer]
          - button "Make independent" [ref=e124] [cursor=pointer]
          - button "Enter subgraph" [ref=e125] [cursor=pointer]
          - button "Arrange nodes" [ref=e126] [cursor=pointer]
          - button "Frame selection" [ref=e127] [cursor=pointer]
          - group [ref=e128]:
            - generic "Local clipboard" [ref=e129] [cursor=pointer]
          - group [ref=e130]:
            - generic "Structures" [ref=e131] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e132]:
          - button "Vertex" [ref=e133] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e134] [cursor=pointer]
        - generic [ref=e135]:
          - button "Add Node" [ref=e136] [cursor=pointer]
          - button "Browse nodes" [ref=e139] [cursor=pointer]
          - button "Up" [disabled] [ref=e142]
          - button "Shortcuts" [ref=e145] [cursor=pointer]
    - complementary [ref=e148]:
      - generic [ref=e149]:
        - heading "Inspector" [level=2] [ref=e150]
        - paragraph [ref=e151]: Select a node to inspect its parameters.
  - generic [ref=e153]:
    - heading "Shader output" [level=2] [ref=e154]
    - paragraph [ref=e155]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics"
  - contentinfo [ref=e156]:
    - generic [ref=e157]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e158]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  1   | import { createNode } from "./create-node.ts";
  2   | import { openLegacyDocument } from "./legacy-document.ts";
  3   | import { test, expect } from "@playwright/test";
  4   | async function fullFlow(page: any) {
  5   |   await createNode(page, "Float");
  6   |   await createNode(page, "Multiply");
  7   |   await createNode(page, "Compose");
  8   |   await page
  9   |     .getByRole("button", { name: "Float output value", exact: true })
  10  |     .click();
  11  |   await page
  12  |     .getByRole("button", { name: "Multiply input a", exact: true })
  13  |     .click();
  14  |   await page
  15  |     .getByRole("button", { name: "Multiply output result", exact: true })
  16  |     .click();
  17  |   await page
  18  |     .getByRole("button", { name: "Compose input x", exact: true })
  19  |     .click();
  20  |   await page
  21  |     .getByRole("button", { name: "Compose output result", exact: true })
  22  |     .click();
  23  |   await page
  24  |     .getByRole("button", { name: "Image output input color", exact: true })
  25  |     .click();
  26  | }
  27  | test.beforeEach(async ({ page }) => {
  28  |   await page.goto("/");
  29  |   await openLegacyDocument(page);
  30  | });
  31  | test("AT-S01-01 browser: user creates connected shader, edits and sees generated GLSL", async ({
  32  |   page,
  33  | }) => {
  34  |   const errors: string[] = [];
  35  |   page.on("pageerror", (e) => errors.push(e.message));
  36  |   await fullFlow(page);
  37  |   await page.getByRole("button", { name: "Generate GLSL" }).click();
  38  |   await expect(
  39  |     page.getByText("Generated successfully · Host-free GLSL"),
  40  |   ).toBeVisible();
  41  |   await expect(page.getByLabel("Generated GLSL")).toContainText("* 2.0");
  42  |   await page
  43  |     .locator(".node h3")
  44  |     .filter({ hasText: /^Float$/ })
  45  |     .click();
  46  |   const input = page.getByRole("textbox", { name: "Value", exact: true });
  47  |   await input.fill("0.5");
  48  |   await input.press("Enter");
  49  |   await expect(input).toHaveValue("0.5");
  50  |   await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
  51  |   expect(errors).toEqual([]);
  52  |   await page.screenshot({
  53  |     path: `${process.env.GRAPE_EVIDENCE_DIR ?? "evidence/s02"}/s01-workspace.png`,
  54  |     fullPage: true,
  55  |   });
  56  | });
  57  | test("AT-S01-03 browser: dynamic shape errors are visible, Undo restores and Redo repeats", async ({
  58  |   page,
  59  | }) => {
  60  |   await fullFlow(page);
  61  |   await page
  62  |     .locator(".node h3")
  63  |     .filter({ hasText: /^Compose$/ })
  64  |     .click();
  65  |   await page
  66  |     .getByRole("combobox", { name: "Shape" })
  67  |     .selectOption({ label: "vec2" });
  68  |   await page.getByRole("button", { name: "Generate GLSL" }).click();
  69  |   await expect(
  70  |     page.getByText("Generation blocked", { exact: true }),
  71  |   ).toBeVisible();
  72  |   await expect(page.getByLabel("Diagnostics")).toContainText("INPUT_REQUIRED");
  73  |   await page.getByRole("button", { name: "Undo", exact: true }).click();
  74  |   await expect(page.getByRole("combobox", { name: "Shape" })).toHaveValue(
  75  |     "RGBA (vec4)",
  76  |   );
  77  |   await page.getByRole("button", { name: "Generate GLSL" }).click();
  78  |   await expect(
  79  |     page.getByText("Generated successfully · Host-free GLSL"),
  80  |   ).toBeVisible();
  81  |   await page.getByRole("button", { name: "Redo", exact: true }).click();
  82  |   await expect(page.getByRole("combobox", { name: "Shape" })).toHaveValue(
  83  |     "vec2",
  84  |   );
  85  | });
  86  | test("AT-S01-05 browser: IndexedDB ACK save/reopen and independent JSON download/file open", async ({
  87  |   page,
  88  | }) => {
  89  |   await fullFlow(page);
  90  |   await page.getByRole("button", { name: "Save", exact: true }).click();
  91  |   await expect(page.locator("#save-state")).toHaveText("Saved");
  92  |   const downloadPromise = page.waitForEvent("download");
  93  |   await page.getByRole("button", { name: "Export JSON" }).click();
  94  |   const download = await downloadPromise;
  95  |   const file = await download.path();
  96  |   await page.getByRole("button", { name: "New document", exact: true }).click();
  97  |   await page.getByRole("button", { name: "Open saved", exact: true }).click();
  98  |   page.once("dialog", (dialog) => dialog.accept());
  99  |   await page.locator("#saved-list button").click();
> 100 |   await expect(page.locator(".node")).toHaveCount(4);
      |                                       ^ Error: expect(locator).toHaveCount(expected) failed
  101 |   await page.getByRole("button", { name: "Generate GLSL" }).click();
  102 |   await expect(
  103 |     page.getByText("Generated successfully · Host-free GLSL"),
  104 |   ).toBeVisible();
  105 |   await expect(
  106 |     page.getByRole("button", { name: "Undo", exact: true }),
  107 |   ).toBeDisabled();
  108 |   await page
  109 |     .getByLabel("Open document file", { exact: true })
  110 |     .setInputFiles(file!);
  111 |   await page
  112 |     .getByRole("button", { name: "Open in new session", exact: true })
  113 |     .click();
  114 |   await expect(page.locator(".node")).toHaveCount(4);
  115 |   await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
  116 | });
  117 | 
  118 | test("AT-S01-02 browser: occupied and incompatible connections preserve wires and revision", async ({
  119 |   page,
  120 | }) => {
  121 |   await fullFlow(page);
  122 |   const canvas = page.locator(".canvas").first(),
  123 |     revision = await canvas.getAttribute("data-revision"),
  124 |     edges = await page.locator("[data-edge]").count();
  125 |   await page
  126 |     .getByRole("button", { name: "Float output value", exact: true })
  127 |     .click();
  128 |   await page
  129 |     .getByRole("button", { name: "Multiply input a", exact: true })
  130 |     .click();
  131 |   await expect(page.locator(".canvas-notice")).toContainText("INPUT_OCCUPIED");
  132 |   expect(await canvas.getAttribute("data-revision")).toBe(revision);
  133 |   expect(await page.locator("[data-edge]").count()).toBe(edges);
  134 |   await page
  135 |     .getByRole("button", { name: "Float output value", exact: true })
  136 |     .click();
  137 |   await page
  138 |     .getByRole("button", { name: "Image output input color", exact: true })
  139 |     .click({ modifiers: ["Shift"] });
  140 |   await expect(page.locator(".canvas-notice")).toContainText("TYPE_ADAPTATION");
  141 |   expect(await canvas.getAttribute("data-revision")).toBe(revision);
  142 | });
  143 | test("AT-S01-04 browser: draft cancel, IME guard, keyboard commit, pointer gesture Undo and cancel", async ({
  144 |   page,
  145 | }) => {
  146 |   await createNode(page, "Float");
  147 |   const input = page.getByRole("textbox", { name: "Value", exact: true }),
  148 |     canvas = page.locator(".canvas");
  149 |   const before = await canvas.getAttribute("data-revision");
  150 |   await input.fill("0.");
  151 |   await expect(canvas).toHaveAttribute("data-revision", before!);
  152 |   await input.press("Escape");
  153 |   await expect(input).toHaveValue("0.25");
  154 |   await input.dispatchEvent("compositionstart", { data: "1" });
  155 |   await input.fill("0.8");
  156 |   await input.press("Enter");
  157 |   await expect(canvas).toHaveAttribute("data-revision", before!);
  158 |   await input.dispatchEvent("compositionend", { data: "0.8" });
  159 |   await input.press("Enter");
  160 |   await expect(input).toHaveValue("0.8");
  161 |   await input.press("Control+z");
  162 |   await expect(input).toHaveValue("0.25");
  163 |   const card = page
  164 |       .locator(".node")
  165 |       .filter({ has: page.locator("h3", { hasText: /^Float$/ }) }),
  166 |     position = await card.getAttribute("style");
  167 |   const title = card.locator("h3"),
  168 |     box = await title.boundingBox();
  169 |   await page.mouse.move(box!.x + 60, box!.y + 15);
  170 |   await page.mouse.down();
  171 |   await page.mouse.move(box!.x + 90, box!.y + 45, { steps: 4 });
  172 |   await page.mouse.move(box!.x + 120, box!.y + 55, { steps: 4 });
  173 |   await page.mouse.up();
  174 |   expect(await card.getAttribute("style")).not.toBe(position);
  175 |   await page.getByRole("button", { name: "Undo", exact: true }).click();
  176 |   await expect(card).toHaveAttribute("style", position!);
  177 |   const again = await title.boundingBox();
  178 |   await page.mouse.move(again!.x + 60, again!.y + 15);
  179 |   await page.mouse.down();
  180 |   await page.mouse.move(again!.x + 140, again!.y + 70, { steps: 4 });
  181 |   await canvas.dispatchEvent("pointercancel", { pointerId: 1 });
  182 |   await page.mouse.up();
  183 |   await expect(card).toHaveAttribute("style", position!);
  184 | });
  185 | test("AT-S01-06 browser: two Canvas contexts keep independent selections and camera while sharing edits", async ({
  186 |   page,
  187 | }) => {
  188 |   await createNode(page, "Float");
  189 |   await createNode(page, "Multiply");
  190 |   await page
  191 |     .locator("#canvas-1 .node h3")
  192 |     .filter({ hasText: /^Float$/ })
  193 |     .click();
  194 |   const selection = await page
  195 |     .locator("#canvas-1 .canvas")
  196 |     .getAttribute("data-selection");
  197 |   await page
  198 |     .getByRole("button", { name: "Second Canvas", exact: true })
  199 |     .click();
  200 |   await page
```