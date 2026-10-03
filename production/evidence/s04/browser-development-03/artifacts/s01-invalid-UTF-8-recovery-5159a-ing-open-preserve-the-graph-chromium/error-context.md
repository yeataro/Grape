# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s01.spec.ts >> invalid UTF-8 recovery retains original bytes; closing recovery and cancelling open preserve the graph
- Location: tests\browser\s01.spec.ts:360:1

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
      - button "Generate GLSL" [ref=e14] [cursor=pointer]
      - button "Second Canvas" [ref=e15] [cursor=pointer]
      - button "Lock editing" [ref=e16] [cursor=pointer]
      - button "Personal Library" [ref=e17] [cursor=pointer]
    - generic [ref=e18]:
      - generic [ref=e19]: Unsaved changes
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
        - group "Image output" [ref=e35]:
          - heading "Image output" [level=3] [ref=e36]
          - generic [ref=e37]:
            - button "Image output input color" [ref=e38] [cursor=pointer]:
              - generic [ref=e39]: ●
              - generic [ref=e40]: color
            - generic [ref=e41]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e42]:
          - button "New subgraph" [ref=e43] [cursor=pointer]
          - button "Library subgraph" [ref=e44] [cursor=pointer]
          - button "Encapsulate" [ref=e45] [cursor=pointer]
          - button "Make independent" [ref=e46] [cursor=pointer]
          - button "Enter subgraph" [ref=e47] [cursor=pointer]
          - button "Up" [ref=e48] [cursor=pointer]
          - button "Arrange nodes" [ref=e49] [cursor=pointer]
          - button "Frame selection" [ref=e50] [cursor=pointer]
          - group [ref=e51]:
            - generic "Local clipboard" [ref=e52]
          - group [ref=e53]:
            - generic "Structures" [ref=e54]
            - option "New structure" [selected]
    - complementary [ref=e55]:
      - generic [ref=e56]:
        - heading "Inspector" [level=2] [ref=e57]
        - paragraph [ref=e58]: Select a node to inspect its parameters.
  - generic [ref=e60]:
    - heading "Shader output" [level=2] [ref=e61]
    - paragraph [ref=e62]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e63]:
      - listitem [ref=e64]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e65] [cursor=pointer]
  - contentinfo [ref=e66]:
    - generic [ref=e67]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e68]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
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
  326 |   await canvas.focus();
  327 |   await canvas.press("Control+z");
  328 |   await canvas.press("Delete");
  329 |   await expect(canvas).toHaveAttribute("data-revision", revision!);
  330 |   await expect(page.locator(".node")).toHaveCount(2);
  331 |   await page.getByRole("button", { name: "Lock editing", exact: true }).click();
  332 |   await expect(field).not.toHaveAttribute("readonly", "");
  333 |   await expect(field).toHaveValue("0.25");
  334 | });
  335 | 
  336 | test("diagnostics locate the affected node through the active Context without adding History", async ({
  337 |   page,
  338 | }) => {
  339 |   await fullFlow(page);
  340 |   await page
  341 |     .locator(".node h3")
  342 |     .filter({ hasText: /^Compose$/ })
  343 |     .click();
  344 |   await page
  345 |     .getByRole("combobox", { name: "Shape" })
  346 |     .selectOption({ label: "vec2" });
  347 |   const revision = await page.locator(".canvas").getAttribute("data-revision");
  348 |   await page
  349 |     .getByLabel("Diagnostics")
  350 |     .getByRole("button", { name: "Locate node" })
  351 |     .first()
  352 |     .click();
  353 |   await expect(page.locator(".inspector > p")).toHaveText("Image output");
  354 |   await expect(page.locator(".canvas")).toHaveAttribute(
  355 |     "data-revision",
  356 |     revision!,
  357 |   );
  358 | });
  359 | 
  360 | test("invalid UTF-8 recovery retains original bytes; closing recovery and cancelling open preserve the graph", async ({
  361 |   page,
  362 | }) => {
  363 |   const buffer = Buffer.from([0xff, 0xc0, 0xaf, 0x00, 0x7b]);
  364 |   const revision = await page.locator(".canvas").getAttribute("data-revision");
> 365 |   await page.locator("input[type=file]").setInputFiles({
      |   ^ Error: locator.setInputFiles: Error: strict mode violation: locator('input[type=file]') resolved to 2 elements:
  366 |     name: "invalid.grape.json",
  367 |     mimeType: "application/json",
  368 |     buffer,
  369 |   });
  370 |   await expect(page.locator("#recovery-message")).toContainText("INVALID_UTF8");
  371 |   const next = page.waitForEvent("download");
  372 |   await page
  373 |     .getByRole("button", { name: "Export original", exact: true })
  374 |     .click();
  375 |   const fs = await import("node:fs/promises");
  376 |   expect(await fs.readFile((await (await next).path())!)).toEqual(buffer);
  377 |   await page.getByRole("button", { name: "Close", exact: true }).click();
  378 |   await page.getByRole("button", { name: "Open saved", exact: true }).click();
  379 |   await page.getByRole("button", { name: "Cancel", exact: true }).click();
  380 |   await expect(page.locator(".canvas")).toHaveAttribute(
  381 |     "data-revision",
  382 |     revision!,
  383 |   );
  384 | });
  385 | 
  386 | test("view failure shows shared retry placeholder and releases the failed mount", async ({
  387 |   page,
  388 | }) => {
  389 |   await page.evaluate(() => {
  390 |     const append = Element.prototype.append;
  391 |     let fail = true;
  392 |     Element.prototype.append = function (...nodes) {
  393 |       if (
  394 |         fail &&
  395 |         nodes.some(
  396 |           (n) => n instanceof HTMLElement && n.classList.contains("viewport"),
  397 |         )
  398 |       ) {
  399 |         fail = false;
  400 |         throw Error("injected mount failure");
  401 |       }
  402 |       return append.apply(this, nodes);
  403 |     };
  404 |   });
  405 |   page.once("dialog", (dialog) => dialog.accept());
  406 |   await page.getByRole("button", { name: "New document", exact: true }).click();
  407 |   await expect(page.locator(".view-placeholder")).toContainText(
  408 |     "injected mount failure",
  409 |   );
  410 |   await expect(page.locator(".canvas")).toHaveCount(0);
  411 |   await page.getByRole("button", { name: "Retry view", exact: true }).click();
  412 |   await expect(page.locator(".canvas")).toHaveCount(1);
  413 |   await expect(page.locator(".view-placeholder")).toHaveCount(0);
  414 |   await page.getByRole("button", { name: "Add Float", exact: true }).click();
  415 |   await expect(
  416 |     page.getByRole("textbox", { name: "Value", exact: true }),
  417 |   ).toHaveValue("0.25");
  418 | });
  419 | 
  420 | test("keyboard node selection and connection buttons preserve focus; wires meet sockets after fractional zoom", async ({
  421 |   page,
  422 | }) => {
  423 |   await fullFlow(page);
  424 |   const float = page
  425 |     .locator(".node")
  426 |     .filter({ has: page.locator("h3", { hasText: /^Float$/ }) });
  427 |   await float.focus();
  428 |   await float.press("Enter");
  429 |   await expect(
  430 |     page.getByRole("textbox", { name: "Value", exact: true }),
  431 |   ).toHaveValue("0.25");
  432 |   await expect(float).toBeFocused();
  433 |   const canvas = page.locator(".canvas");
  434 |   await canvas.hover({ position: { x: 50, y: 350 } });
  435 |   await page.mouse.wheel(0, -123);
  436 |   await expect(canvas).not.toHaveAttribute("data-zoom", "1");
  437 |   const distance = await page.evaluate(() => {
  438 |     const path = document.querySelector<SVGPathElement>(".wires path")!,
  439 |       point = path.getPointAtLength(0);
  440 |     const screen = new DOMPoint(point.x, point.y).matrixTransform(
  441 |       path.getScreenCTM()!,
  442 |     );
  443 |     const socket = document
  444 |       .querySelector<HTMLElement>('[aria-label="Float output value"] .socket')!
  445 |       .getBoundingClientRect();
  446 |     return Math.hypot(
  447 |       screen.x - socket.left - socket.width / 2,
  448 |       screen.y - socket.top - socket.height / 2,
  449 |     );
  450 |   });
  451 |   expect(distance).toBeLessThan(2);
  452 | });
  453 | 
  454 | test("error-bearing dynamic document saves and reopens with loss evidence and generation still blocked", async ({
  455 |   page,
  456 | }) => {
  457 |   await fullFlow(page);
  458 |   await page
  459 |     .locator(".node h3")
  460 |     .filter({ hasText: /^Compose$/ })
  461 |     .click();
  462 |   await page
  463 |     .getByRole("combobox", { name: "Shape" })
  464 |     .selectOption({ label: "vec2" });
  465 |   await page.getByRole("button", { name: "Save", exact: true }).click();
```