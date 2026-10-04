# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s01.spec.ts >> AT-S01-04 browser: draft cancel, IME guard, keyboard commit, pointer gesture Undo and cancel
- Location: ..\..\..\production\tests\browser\s01.spec.ts:143:1

# Error details

```
Error: locator.getAttribute: Error: strict mode violation: locator('.node').filter({ has: locator('h3').filter({ hasText: /^Float$/ }) }) resolved to 2 elements:
    1) <article tabindex="0" role="group" aria-label="Float" class="node selected" aria-description="Selected" data-node="ae92ea1f-b285-4cb6-be26-8e92b5dc9416">…</article> aka getByRole('group', { name: 'Float' })
    2) <article hidden="" class="node creation-preview">…</article> aka getByText('FloatValue · glsl.float')

Call log:
  - waiting for locator('.node').filter({ has: locator('h3').filter({ hasText: /^Float$/ }) })

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
      - generic [ref=e44]: Unsaved changes
      - generic [ref=e45]: Host-free
  - status [ref=e46]
  - generic [ref=e48]:
    - button "Undo" [ref=e49] [cursor=pointer]
    - button "Redo" [ref=e52] [cursor=pointer]
    - button "Delete selected" [ref=e55] [cursor=pointer]
    - alert
  - main [ref=e56]:
    - generic [ref=e58]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e59]:
        - generic:
          - generic:
            - group "Image output" [ref=e60]:
              - heading "Image output" [level=3] [ref=e61]
              - generic [ref=e62]:
                - button "Image output input color" [ref=e63] [cursor=pointer]:
                  - generic [ref=e65]: color
                - generic [ref=e66]: vec4
            - group "Float" [ref=e67]:
              - heading "Float" [level=3] [ref=e68]
              - generic [ref=e69]:
                - button "Float output value" [ref=e70] [cursor=pointer]:
                  - generic [ref=e71]: value
                - generic [ref=e73]: float
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e74]:
          - button "New subgraph" [ref=e75] [cursor=pointer]
          - button "Library subgraph" [ref=e76] [cursor=pointer]
          - button "Encapsulate" [ref=e77] [cursor=pointer]
          - button "Make independent" [ref=e78] [cursor=pointer]
          - button "Enter subgraph" [ref=e79] [cursor=pointer]
          - button "Arrange nodes" [ref=e80] [cursor=pointer]
          - button "Frame selection" [ref=e81] [cursor=pointer]
          - group [ref=e82]:
            - generic "Local clipboard" [ref=e83] [cursor=pointer]
          - group [ref=e84]:
            - generic "Structures" [ref=e85] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e86]:
          - button "Vertex" [ref=e87] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e88] [cursor=pointer]
        - generic [ref=e89]:
          - button "Add Node" [ref=e90] [cursor=pointer]
          - button "Browse nodes" [ref=e93] [cursor=pointer]
          - button "Up" [disabled] [ref=e96]
          - button "Shortcuts" [ref=e99] [cursor=pointer]
    - complementary [ref=e102]:
      - generic [ref=e103]:
        - heading "Inspector" [level=2] [ref=e104]
        - paragraph [ref=e105]: Float
        - button "Rename node" [ref=e106] [cursor=pointer]
        - generic [ref=e109]:
          - generic [ref=e110]: Value
          - textbox "Value" [active] [ref=e111]: "0.25"
          - alert
  - generic [ref=e113]:
    - heading "Shader output" [level=2] [ref=e114]
    - paragraph [ref=e115]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e116]:
      - listitem [ref=e117]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e118] [cursor=pointer]
  - contentinfo [ref=e119]:
    - generic [ref=e120]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e121]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
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
  100 |   await expect(page.locator(".node")).toHaveCount(4);
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
> 166 |     position = await card.getAttribute("style");
      |                           ^ Error: locator.getAttribute: Error: strict mode violation: locator('.node').filter({ has: locator('h3').filter({ hasText: /^Float$/ }) }) resolved to 2 elements:
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
  201 |     .locator("#canvas-2 .node h3")
  202 |     .filter({ hasText: /^Multiply$/ })
  203 |     .click();
  204 |   await expect(page.locator("#canvas-1 .canvas")).toHaveAttribute(
  205 |     "data-selection",
  206 |     selection!,
  207 |   );
  208 |   const second = page.locator("#canvas-2 .canvas");
  209 |   await second.hover({ position: { x: 30, y: 350 } });
  210 |   await page.mouse.wheel(0, -200);
  211 |   await expect(second).not.toHaveAttribute("data-zoom", "1");
  212 |   await expect(page.locator("#canvas-1 .canvas")).toHaveAttribute(
  213 |     "data-zoom",
  214 |     "1",
  215 |   );
  216 |   await page
  217 |     .locator("#canvas-1 .node h3")
  218 |     .filter({ hasText: /^Float$/ })
  219 |     .click();
  220 |   await page.getByRole("textbox", { name: "Value", exact: true }).fill("0.9");
  221 |   await page
  222 |     .getByRole("textbox", { name: "Value", exact: true })
  223 |     .press("Enter");
  224 |   expect(
  225 |     await page.locator("#canvas-1 .canvas").getAttribute("data-revision"),
  226 |   ).toBe(await second.getAttribute("data-revision"));
  227 |   await page
  228 |     .locator("#canvas-2 .node h3")
  229 |     .filter({ hasText: /^Float$/ })
  230 |     .click();
  231 |   await expect(
  232 |     page.getByRole("textbox", { name: "Value", exact: true }),
  233 |   ).toHaveValue("0.9");
  234 |   await page
  235 |     .getByRole("button", { name: "Delete selected", exact: true })
  236 |     .click();
  237 |   await expect(page.locator("#canvas-1 .canvas")).toHaveAttribute(
  238 |     "data-selection",
  239 |     "",
  240 |   );
  241 |   await expect(page.locator("#canvas-1 .node")).toHaveCount(2);
  242 |   await expect(page.locator("#canvas-2 .node")).toHaveCount(2);
  243 | });
  244 | test("AT-S01-07 browser: delayed storage completion cannot clear a newer edit; rejection and export preserve dirty", async ({
  245 |   page,
  246 | }) => {
  247 |   await createNode(page, "Float");
  248 |   await page.evaluate(() => {
  249 |     const descriptor = Object.getOwnPropertyDescriptor(
  250 |       IDBTransaction.prototype,
  251 |       "oncomplete",
  252 |     )!;
  253 |     Object.defineProperty(IDBTransaction.prototype, "oncomplete", {
  254 |       ...descriptor,
  255 |       set(handler) {
  256 |         descriptor.set!.call(
  257 |           this,
  258 |           function (this: IDBTransaction, event: Event) {
  259 |             (window as any).releaseSave = () => handler.call(this, event);
  260 |           },
  261 |         );
  262 |       },
  263 |     });
  264 |   });
  265 |   await page.getByRole("button", { name: "Save", exact: true }).click();
  266 |   await expect(page.locator("#save-state")).toHaveText("Saving…");
```