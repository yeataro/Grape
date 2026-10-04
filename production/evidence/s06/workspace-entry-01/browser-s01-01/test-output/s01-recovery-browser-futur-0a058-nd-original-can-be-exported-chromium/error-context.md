# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s01.spec.ts >> recovery browser: future structural document stays read-only and original can be exported
- Location: ..\..\..\production\tests\browser\s01.spec.ts:292:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.node')
Expected: 1
Received: 2
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('.node')
    14 × locator resolved to 2 elements
       - unexpected value "2"

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
    - button "Undo" [disabled] [ref=e49]
    - button "Redo" [disabled] [ref=e52]
    - button "Delete selected" [ref=e55] [cursor=pointer]
    - alert
  - main [ref=e56]:
    - generic [ref=e58]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e59]:
        - group "Image output" [ref=e60]:
          - heading "Image output" [level=3] [ref=e61]
          - generic [ref=e62]:
            - button "Image output input color" [ref=e63] [cursor=pointer]:
              - generic [ref=e65]: color
            - generic [ref=e66]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e67]:
          - button "New subgraph" [ref=e68] [cursor=pointer]
          - button "Library subgraph" [ref=e69] [cursor=pointer]
          - button "Encapsulate" [ref=e70] [cursor=pointer]
          - button "Make independent" [ref=e71] [cursor=pointer]
          - button "Enter subgraph" [ref=e72] [cursor=pointer]
          - button "Arrange nodes" [ref=e73] [cursor=pointer]
          - button "Frame selection" [ref=e74] [cursor=pointer]
          - group [ref=e75]:
            - generic "Local clipboard" [ref=e76] [cursor=pointer]
          - group [ref=e77]:
            - generic "Structures" [ref=e78] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e79]:
          - button "Vertex" [ref=e80] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e81] [cursor=pointer]
        - generic [ref=e82]:
          - button "Add Node" [ref=e83] [cursor=pointer]
          - button "Browse nodes" [ref=e86] [cursor=pointer]
          - button "Up" [disabled] [ref=e89]
          - button "Shortcuts" [ref=e92] [cursor=pointer]
    - complementary [ref=e95]:
      - generic [ref=e96]:
        - heading "Inspector" [level=2] [ref=e97]
        - paragraph [ref=e98]: Select a node to inspect its parameters.
  - generic [ref=e100]:
    - heading "Shader output" [level=2] [ref=e101]
    - paragraph [ref=e102]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e103]:
      - listitem [ref=e104]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e105] [cursor=pointer]
  - contentinfo [ref=e106]:
    - generic [ref=e107]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e108]: Scroll to zoom · Drag empty space to pan
  - dialog [ref=e109]:
    - heading "Review document" [level=2] [ref=e110]
    - paragraph [ref=e111]: "recovery-readonly: UNSUPPORTED_VERSION. The current graph was not replaced. You can export the original source."
    - button "Export original" [active] [ref=e112] [cursor=pointer]
    - button "Close" [ref=e113] [cursor=pointer]
    - paragraph [ref=e114]: Opening in a new session preserves model errors for re-save and starts empty History. Import acceptance requires a valid candidate and the current exact modules.
    - generic "Inspection and proposal" [ref=e115]: "{ \"diagnostics\": [], \"repairs\": [], \"provenance\": { \"format\": \"grape.document\", \"sourceVersion\": { \"major\": 3, \"minor\": 0 }, \"sourceGraphId\": null, \"conversion\": \"none\", \"legacyGate\": null }, \"unknownPaths\": [ \"$.formatVersion\" ], \"candidate\": null }"
    - generic "Original text (first 12000 characters)" [ref=e116]: "{\"format\":\"grape.document\",\"formatVersion\":{\"major\":3,\"minor\":0},\"graph\":{\"future\":true}}"
    - status
```

# Test source

```ts
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
> 309 |   await expect(page.locator(".node")).toHaveCount(1);
      |                                       ^ Error: expect(locator).toHaveCount(expected) failed
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
  342 |   page,
  343 | }) => {
  344 |   await fullFlow(page);
  345 |   await page
  346 |     .locator(".node h3")
  347 |     .filter({ hasText: /^Compose$/ })
  348 |     .click();
  349 |   await page
  350 |     .getByRole("combobox", { name: "Shape" })
  351 |     .selectOption({ label: "vec2" });
  352 |   const revision = await page.locator(".canvas").getAttribute("data-revision");
  353 |   await page
  354 |     .getByLabel("Diagnostics")
  355 |     .getByRole("button", { name: "Locate node" })
  356 |     .first()
  357 |     .click();
  358 |   await expect(page.locator(".inspector > p")).toHaveText("Image output");
  359 |   await expect(page.locator(".canvas")).toHaveAttribute(
  360 |     "data-revision",
  361 |     revision!,
  362 |   );
  363 | });
  364 | 
  365 | test("invalid UTF-8 recovery retains original bytes; closing recovery and cancelling open preserve the graph", async ({
  366 |   page,
  367 | }) => {
  368 |   const buffer = Buffer.from([0xff, 0xc0, 0xaf, 0x00, 0x7b]);
  369 |   const revision = await page.locator(".canvas").getAttribute("data-revision");
  370 |   await page.getByLabel("Open document file", { exact: true }).setInputFiles({
  371 |     name: "invalid.grape.json",
  372 |     mimeType: "application/json",
  373 |     buffer,
  374 |   });
  375 |   await expect(page.locator("#recovery-message")).toContainText("INVALID_UTF8");
  376 |   const next = page.waitForEvent("download");
  377 |   await page
  378 |     .getByRole("button", { name: "Export original", exact: true })
  379 |     .click();
  380 |   const fs = await import("node:fs/promises");
  381 |   expect(await fs.readFile((await (await next).path())!)).toEqual(buffer);
  382 |   await page.getByRole("button", { name: "Close", exact: true }).click();
  383 |   await page.getByRole("button", { name: "Open saved", exact: true }).click();
  384 |   await page.getByRole("button", { name: "Cancel", exact: true }).click();
  385 |   await expect(page.locator(".canvas")).toHaveAttribute(
  386 |     "data-revision",
  387 |     revision!,
  388 |   );
  389 | });
  390 | 
  391 | test("view failure shows shared retry placeholder and releases the failed mount", async ({
  392 |   page,
  393 | }) => {
  394 |   await page.evaluate(() => {
  395 |     const append = Element.prototype.append;
  396 |     let fail = true;
  397 |     Element.prototype.append = function (...nodes) {
  398 |       if (
  399 |         fail &&
  400 |         nodes.some(
  401 |           (n) => n instanceof HTMLElement && n.classList.contains("viewport"),
  402 |         )
  403 |       ) {
  404 |         fail = false;
  405 |         throw Error("injected mount failure");
  406 |       }
  407 |       return append.apply(this, nodes);
  408 |     };
  409 |   });
```