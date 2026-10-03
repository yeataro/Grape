# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s01.spec.ts >> AT-S01-06 browser: two Canvas contexts keep independent selections and camera while sharing edits
- Location: tests\browser\s01.spec.ts:180:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#canvas-2 .node h3').filter({ hasText: /^Float$/ })
    - locator resolved to <h3>Float</h3>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button disabled data-depth="0">Untitled shader / pixel</button> from <div class="canvas-breadcrumb">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button disabled data-depth="0">Untitled shader / pixel</button> from <div class="canvas-breadcrumb">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    56 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <button disabled data-depth="0">Untitled shader / pixel</button> from <div class="canvas-breadcrumb">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

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
      - button "Generate GLSL" [ref=e14] [cursor=pointer]
      - button "Second Canvas" [ref=e15] [cursor=pointer]
      - button "Lock editing" [ref=e16] [cursor=pointer]
    - generic [ref=e17]:
      - generic [ref=e18]: Unsaved changes
      - generic [ref=e19]: Host-free
  - status [ref=e20]
  - generic [ref=e22]:
    - button "Add Float" [ref=e23] [cursor=pointer]
    - button "Add Multiply" [ref=e24] [cursor=pointer]
    - button "Add Compose" [ref=e25] [cursor=pointer]
    - button "Undo" [ref=e26] [cursor=pointer]
    - button "Redo" [disabled] [ref=e27]
    - button "Delete selected" [ref=e28] [cursor=pointer]
    - alert
  - main [ref=e29]:
    - generic [ref=e30]:
      - generic [ref=e31]:
        - generic: Canvas 1
        - generic "Shader graph canvas" [ref=e32]:
          - generic:
            - generic:
              - group "Image output" [ref=e33]:
                - heading "Image output" [level=3] [ref=e34]
                - generic [ref=e35]:
                  - button "Image output input color" [ref=e36] [cursor=pointer]:
                    - generic [ref=e37]: ●
                    - generic [ref=e38]: color
                  - generic [ref=e39]: vec4
              - group "Float" [ref=e40]:
                - heading "Float" [level=3] [ref=e41]
                - generic [ref=e42]:
                  - button "Float output value" [ref=e43] [cursor=pointer]:
                    - generic [ref=e44]: value
                    - generic [ref=e45]: ●
                  - generic [ref=e46]: float
              - group "Multiply" [ref=e47]:
                - heading "Multiply" [level=3] [ref=e48]
                - generic [ref=e49]:
                  - button "Multiply input a" [ref=e50] [cursor=pointer]:
                    - generic [ref=e51]: ●
                    - generic [ref=e52]: a
                  - generic [ref=e53]: float
                - generic [ref=e54]:
                  - button "Multiply input b" [ref=e55] [cursor=pointer]:
                    - generic [ref=e56]: ●
                    - generic [ref=e57]: b
                  - generic [ref=e58]: float
                - generic [ref=e59]:
                  - button "Multiply output result" [ref=e60] [cursor=pointer]:
                    - generic [ref=e61]: result
                    - generic [ref=e62]: ●
                  - generic [ref=e63]: float
          - button "Untitled shader / pixel" [disabled] [ref=e65]
          - generic [ref=e66]:
            - button "New subgraph" [ref=e67] [cursor=pointer]
            - button "Library subgraph" [ref=e68] [cursor=pointer]
            - button "Encapsulate" [ref=e69] [cursor=pointer]
            - button "Make independent" [ref=e70] [cursor=pointer]
            - button "Enter subgraph" [ref=e71] [cursor=pointer]
            - button "Up" [ref=e72] [cursor=pointer]
            - button "Arrange nodes" [ref=e73] [cursor=pointer]
            - button "Frame selection" [ref=e74] [cursor=pointer]
            - group [ref=e75]:
              - generic "Local clipboard" [ref=e76]
            - group [ref=e77]:
              - generic "Structures" [ref=e78]
              - option "New structure" [selected]
      - generic [ref=e79]:
        - generic: Canvas 2
        - generic "Shader graph canvas" [ref=e80]:
          - generic:
            - generic:
              - group "Image output" [ref=e81]:
                - heading "Image output" [level=3] [ref=e82]
                - generic [ref=e83]:
                  - button "Image output input color" [ref=e84] [cursor=pointer]:
                    - generic [ref=e85]: ●
                    - generic [ref=e86]: color
                  - generic [ref=e87]: vec4
              - group "Float" [ref=e88]:
                - heading "Float" [level=3] [ref=e89]
                - generic [ref=e90]:
                  - button "Float output value" [ref=e91] [cursor=pointer]:
                    - generic [ref=e92]: value
                    - generic [ref=e93]: ●
                  - generic [ref=e94]: float
              - group "Multiply" [ref=e95]:
                - heading "Multiply" [level=3] [ref=e96]
                - generic [ref=e97]:
                  - button "Multiply input a" [ref=e98] [cursor=pointer]:
                    - generic [ref=e99]: ●
                    - generic [ref=e100]: a
                  - generic [ref=e101]: float
                - generic [ref=e102]:
                  - button "Multiply input b" [ref=e103] [cursor=pointer]:
                    - generic [ref=e104]: ●
                    - generic [ref=e105]: b
                  - generic [ref=e106]: float
                - generic [ref=e107]:
                  - button "Multiply output result" [ref=e108] [cursor=pointer]:
                    - generic [ref=e109]: result
                    - generic [ref=e110]: ●
                  - generic [ref=e111]: float
          - button "Untitled shader / pixel" [disabled] [ref=e113]
          - generic [ref=e114]:
            - button "New subgraph" [ref=e115] [cursor=pointer]
            - button "Library subgraph" [ref=e116] [cursor=pointer]
            - button "Encapsulate" [ref=e117] [cursor=pointer]
            - button "Make independent" [ref=e118] [cursor=pointer]
            - button "Enter subgraph" [ref=e119] [cursor=pointer]
            - button "Up" [ref=e120] [cursor=pointer]
            - button "Arrange nodes" [ref=e121] [cursor=pointer]
            - button "Frame selection" [ref=e122] [cursor=pointer]
            - group [ref=e123]:
              - generic "Local clipboard" [ref=e124]
            - group [ref=e125]:
              - generic "Structures" [ref=e126]
              - option "New structure" [selected]
    - complementary [ref=e127]:
      - generic [ref=e128]:
        - heading "Inspector" [level=2] [ref=e129]
        - paragraph [ref=e130]: Float
        - button "Rename node" [ref=e131] [cursor=pointer]
        - generic [ref=e134]:
          - generic [ref=e135]: Value
          - textbox "Value" [active] [ref=e136]: "0.9"
          - alert
  - generic [ref=e138]:
    - heading "Shader output" [level=2] [ref=e139]
    - paragraph [ref=e140]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e141]:
      - listitem [ref=e142]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e143] [cursor=pointer]
  - contentinfo [ref=e144]:
    - generic [ref=e145]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e146]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
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
> 225 |     .click();
      |      ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  236 |   await expect(page.locator("#canvas-1 .node")).toHaveCount(2);
  237 |   await expect(page.locator("#canvas-2 .node")).toHaveCount(2);
  238 | });
  239 | test("AT-S01-07 browser: delayed storage completion cannot clear a newer edit; rejection and export preserve dirty", async ({
  240 |   page,
  241 | }) => {
  242 |   await page.getByRole("button", { name: "Add Float", exact: true }).click();
  243 |   await page.evaluate(() => {
  244 |     const descriptor = Object.getOwnPropertyDescriptor(
  245 |       IDBTransaction.prototype,
  246 |       "oncomplete",
  247 |     )!;
  248 |     Object.defineProperty(IDBTransaction.prototype, "oncomplete", {
  249 |       ...descriptor,
  250 |       set(handler) {
  251 |         descriptor.set!.call(
  252 |           this,
  253 |           function (this: IDBTransaction, event: Event) {
  254 |             (window as any).releaseSave = () => handler.call(this, event);
  255 |           },
  256 |         );
  257 |       },
  258 |     });
  259 |   });
  260 |   await page.getByRole("button", { name: "Save", exact: true }).click();
  261 |   await expect(page.locator("#save-state")).toHaveText("Saving…");
  262 |   await expect(
  263 |     page.getByRole("button", { name: "Save", exact: true }),
  264 |   ).toBeDisabled();
  265 |   await page.getByRole("textbox", { name: "Value", exact: true }).fill("0.6");
  266 |   await page
  267 |     .getByRole("textbox", { name: "Value", exact: true })
  268 |     .press("Enter");
  269 |   await page.waitForFunction(
  270 |     () => typeof (window as any).releaseSave === "function",
  271 |   );
  272 |   await page.evaluate(() => (window as any).releaseSave());
  273 |   await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
  274 |   await page.evaluate(() => {
  275 |     IDBObjectStore.prototype.put = function () {
  276 |       throw new DOMException("Storage denied", "QuotaExceededError");
  277 |     };
  278 |   });
  279 |   await page.getByRole("button", { name: "Save", exact: true }).click();
  280 |   await expect(page.locator("#message")).toContainText("Storage denied");
  281 |   await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
  282 |   const download = page.waitForEvent("download");
  283 |   await page.getByRole("button", { name: "Export JSON" }).click();
  284 |   await (await download).cancel();
  285 |   await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
  286 | });
  287 | test("recovery browser: future structural document stays read-only and original can be exported", async ({
  288 |   page,
  289 | }) => {
  290 |   const raw = JSON.stringify({
  291 |     format: "grape.document",
  292 |     formatVersion: { major: 3, minor: 0 },
  293 |     graph: { future: true },
  294 |   });
  295 |   await page.locator("input[type=file]").setInputFiles({
  296 |     name: "future.grape.json",
  297 |     mimeType: "application/json",
  298 |     buffer: Buffer.from(raw),
  299 |   });
  300 |   await expect(page.locator("#recovery")).toBeVisible();
  301 |   await expect(page.locator("#recovery-message")).toContainText(
  302 |     "UNSUPPORTED_VERSION",
  303 |   );
  304 |   await expect(page.locator(".node")).toHaveCount(1);
  305 |   const next = page.waitForEvent("download");
  306 |   await page
  307 |     .getByRole("button", { name: "Export original", exact: true })
  308 |     .click();
  309 |   const file = await (await next).path();
  310 |   const fs = await import("node:fs/promises");
  311 |   expect(await fs.readFile(file!, "utf8")).toBe(raw);
  312 | });
  313 | 
  314 | test("readonly browser: fields, actions and keyboard cannot edit; unlocking restores the same value", async ({
  315 |   page,
  316 | }) => {
  317 |   await page.getByRole("button", { name: "Add Float", exact: true }).click();
  318 |   const field = page.getByRole("textbox", { name: "Value", exact: true }),
  319 |     canvas = page.locator(".canvas");
  320 |   const revision = await canvas.getAttribute("data-revision");
  321 |   await page.getByRole("button", { name: "Lock editing", exact: true }).click();
  322 |   await expect(field).toHaveAttribute("readonly", "");
  323 |   await expect(
  324 |     page.getByRole("button", { name: "Add Float", exact: true }),
  325 |   ).toBeDisabled();
```