# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s01.spec.ts >> AT-S01-06 browser: two Canvas contexts keep independent selections and camera while sharing edits
- Location: ..\..\..\production\tests\browser\s01.spec.ts:185:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('#canvas-1 .node')
Expected: 2
Received: 3
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('#canvas-1 .node')
    14 × locator resolved to 3 elements
       - unexpected value "3"

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
    - button "Redo" [disabled] [ref=e52]
    - button "Delete selected" [active] [ref=e55] [cursor=pointer]
    - alert
  - main [ref=e56]:
    - generic [ref=e57]:
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
              - group "Multiply" [ref=e67]:
                - heading "Multiply" [level=3] [ref=e68]
                - generic [ref=e69]:
                  - button "Multiply input a" [ref=e70] [cursor=pointer]:
                    - generic [ref=e72]: a
                  - generic [ref=e73]: float
                - generic [ref=e74]:
                  - button "Multiply input b" [ref=e75] [cursor=pointer]:
                    - generic [ref=e77]: b
                  - generic [ref=e78]: float
                - generic [ref=e79]:
                  - button "Multiply output result" [ref=e80] [cursor=pointer]:
                    - generic [ref=e81]: result
                  - generic [ref=e83]: float
          - generic:
            - button "Untitled shader / pixel" [disabled]
          - generic [ref=e84]:
            - button "New subgraph" [ref=e85] [cursor=pointer]
            - button "Library subgraph" [ref=e86] [cursor=pointer]
            - button "Encapsulate" [ref=e87] [cursor=pointer]
            - button "Make independent" [ref=e88] [cursor=pointer]
            - button "Enter subgraph" [ref=e89] [cursor=pointer]
            - button "Arrange nodes" [ref=e90] [cursor=pointer]
            - button "Frame selection" [ref=e91] [cursor=pointer]
            - group [ref=e92]:
              - generic "Local clipboard" [ref=e93] [cursor=pointer]
            - group [ref=e94]:
              - generic "Structures" [ref=e95] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=e96]:
            - button "Vertex" [ref=e97] [cursor=pointer]
            - button "Pixel" [pressed] [ref=e98] [cursor=pointer]
          - generic [ref=e99]:
            - button "Add Node" [ref=e100] [cursor=pointer]
            - button "Browse nodes" [ref=e103] [cursor=pointer]
            - button "Up" [disabled] [ref=e106]
            - button "Shortcuts" [ref=e109] [cursor=pointer]
      - generic [ref=e112]:
        - generic: Canvas 2
        - generic "Shader graph canvas" [ref=e113]:
          - generic:
            - generic:
              - group "Image output" [ref=e114]:
                - heading "Image output" [level=3] [ref=e115]
                - generic [ref=e116]:
                  - button "Image output input color" [ref=e117] [cursor=pointer]:
                    - generic [ref=e119]: color
                  - generic [ref=e120]: vec4
              - group "Multiply" [ref=e121]:
                - heading "Multiply" [level=3] [ref=e122]
                - generic [ref=e123]:
                  - button "Multiply input a" [ref=e124] [cursor=pointer]:
                    - generic [ref=e126]: a
                  - generic [ref=e127]: float
                - generic [ref=e128]:
                  - button "Multiply input b" [ref=e129] [cursor=pointer]:
                    - generic [ref=e131]: b
                  - generic [ref=e132]: float
                - generic [ref=e133]:
                  - button "Multiply output result" [ref=e134] [cursor=pointer]:
                    - generic [ref=e135]: result
                  - generic [ref=e137]: float
          - generic:
            - button "Untitled shader / pixel" [disabled]
          - generic [ref=e138]:
            - button "New subgraph" [ref=e139] [cursor=pointer]
            - button "Library subgraph" [ref=e140] [cursor=pointer]
            - button "Encapsulate" [ref=e141] [cursor=pointer]
            - button "Make independent" [ref=e142] [cursor=pointer]
            - button "Enter subgraph" [ref=e143] [cursor=pointer]
            - button "Arrange nodes" [ref=e144] [cursor=pointer]
            - button "Frame selection" [ref=e145] [cursor=pointer]
            - group [ref=e146]:
              - generic "Local clipboard" [ref=e147] [cursor=pointer]
            - group [ref=e148]:
              - generic "Structures" [ref=e149] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=e150]:
            - button "Vertex" [ref=e151] [cursor=pointer]
            - button "Pixel" [pressed] [ref=e152] [cursor=pointer]
          - generic [ref=e153]:
            - button "Add Node" [ref=e154] [cursor=pointer]
            - button "Browse nodes" [ref=e157] [cursor=pointer]
            - button "Up" [disabled] [ref=e160]
            - button "Shortcuts" [ref=e163] [cursor=pointer]
    - complementary [ref=e166]:
      - generic [ref=e167]:
        - heading "Inspector" [level=2] [ref=e168]
        - paragraph [ref=e169]: Select a node to inspect its parameters.
  - generic [ref=e171]:
    - heading "Shader output" [level=2] [ref=e172]
    - paragraph [ref=e173]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e174]:
      - listitem [ref=e175]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e176] [cursor=pointer]
  - contentinfo [ref=e177]:
    - generic [ref=e178]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e179]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
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
> 241 |   await expect(page.locator("#canvas-1 .node")).toHaveCount(2);
      |                                                 ^ Error: expect(locator).toHaveCount(expected) failed
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
  267 |   await expect(
  268 |     page.getByRole("button", { name: "Save", exact: true }),
  269 |   ).toBeDisabled();
  270 |   await page.getByRole("textbox", { name: "Value", exact: true }).fill("0.6");
  271 |   await page
  272 |     .getByRole("textbox", { name: "Value", exact: true })
  273 |     .press("Enter");
  274 |   await page.waitForFunction(
  275 |     () => typeof (window as any).releaseSave === "function",
  276 |   );
  277 |   await page.evaluate(() => (window as any).releaseSave());
  278 |   await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
  279 |   await page.evaluate(() => {
  280 |     IDBObjectStore.prototype.put = function () {
  281 |       throw new DOMException("Storage denied", "QuotaExceededError");
  282 |     };
  283 |   });
  284 |   await page.getByRole("button", { name: "Save", exact: true }).click();
  285 |   await expect(page.locator("#message")).toContainText("Storage denied");
  286 |   await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
  287 |   const download = page.waitForEvent("download");
  288 |   await page.getByRole("button", { name: "Export JSON" }).click();
  289 |   await (await download).cancel();
  290 |   await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
  291 | });
  292 | test("recovery browser: future structural document stays read-only and original can be exported", async ({
  293 |   page,
  294 | }) => {
  295 |   const raw = JSON.stringify({
  296 |     format: "grape.document",
  297 |     formatVersion: { major: 3, minor: 0 },
  298 |     graph: { future: true },
  299 |   });
  300 |   await page.getByLabel("Open document file", { exact: true }).setInputFiles({
  301 |     name: "future.grape.json",
  302 |     mimeType: "application/json",
  303 |     buffer: Buffer.from(raw),
  304 |   });
  305 |   await expect(page.locator("#recovery")).toBeVisible();
  306 |   await expect(page.locator("#recovery-message")).toContainText(
  307 |     "UNSUPPORTED_VERSION",
  308 |   );
  309 |   await expect(page.locator(".node")).toHaveCount(1);
  310 |   const next = page.waitForEvent("download");
  311 |   await page
  312 |     .getByRole("button", { name: "Export original", exact: true })
  313 |     .click();
  314 |   const file = await (await next).path();
  315 |   const fs = await import("node:fs/promises");
  316 |   expect(await fs.readFile(file!, "utf8")).toBe(raw);
  317 | });
  318 | 
  319 | test("readonly browser: fields, actions and keyboard cannot edit; unlocking restores the same value", async ({
  320 |   page,
  321 | }) => {
  322 |   await createNode(page, "Float");
  323 |   const field = page.getByRole("textbox", { name: "Value", exact: true }),
  324 |     canvas = page.locator(".canvas");
  325 |   const revision = await canvas.getAttribute("data-revision");
  326 |   await page.getByRole("button", { name: "Lock editing", exact: true }).click();
  327 |   await expect(field).toHaveAttribute("readonly", "");
  328 |   await expect(
  329 |     page.getByRole("button", { name: "Add Float", exact: true }),
  330 |   ).toBeDisabled();
  331 |   await canvas.focus();
  332 |   await canvas.press("Control+z");
  333 |   await canvas.press("Delete");
  334 |   await expect(canvas).toHaveAttribute("data-revision", revision!);
  335 |   await expect(page.locator(".node")).toHaveCount(2);
  336 |   await page.getByRole("button", { name: "Lock editing", exact: true }).click();
  337 |   await expect(field).not.toHaveAttribute("readonly", "");
  338 |   await expect(field).toHaveValue("0.25");
  339 | });
  340 | 
  341 | test("diagnostics locate the affected node through the active Context without adding History", async ({
```