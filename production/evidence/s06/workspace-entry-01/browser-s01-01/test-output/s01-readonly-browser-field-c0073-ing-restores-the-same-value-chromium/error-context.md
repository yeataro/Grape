# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s01.spec.ts >> readonly browser: fields, actions and keyboard cannot edit; unlocking restores the same value
- Location: ..\..\..\production\tests\browser\s01.spec.ts:319:1

# Error details

```
Error: expect(locator).toBeDisabled() failed

Locator: getByRole('button', { name: 'Add Float', exact: true })
Expected: disabled
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeDisabled" with timeout 5000ms
  - waiting for getByRole('button', { name: 'Add Float', exact: true })

```

```yaml
- banner:
  - text: Grape SHADER WORKSPACE
  - navigation "Document actions":
    - button "New document"
    - button "Save"
    - button "Open saved"
    - button "Export JSON"
    - button "Export PNG"
    - button "Open file"
    - button "Generate GLSL"
    - button "Second Canvas"
    - button "Lock editing" [pressed]
    - group: More actions
  - text: Unsaved changes Host-free
- status
- button "Undo" [disabled]
- button "Redo" [disabled]
- button "Delete selected" [disabled]
- alert
- main:
  - text: Canvas 1
  - img
  - group "Image output":
    - heading "Image output" [level=3]
    - button "Image output input color": color
    - text: vec4
  - group "Float":
    - heading "Float" [level=3]
    - button "Float output value": value
    - text: float
  - button "Untitled shader / pixel" [disabled]
  - button "New subgraph"
  - button "Library subgraph"
  - button "Encapsulate"
  - button "Make independent"
  - button "Enter subgraph"
  - button "Arrange nodes"
  - button "Frame selection"
  - group: Local clipboard
  - group: Structures
  - button "Vertex"
  - button "Pixel" [pressed]
  - button "Add Node" [disabled]
  - button "Browse nodes"
  - button "Up" [disabled]
  - button "Shortcuts"
  - complementary:
    - heading "Inspector" [level=2]
    - paragraph: Float
    - button "Rename node"
    - text: Value
    - textbox "Value": "0.25"
    - alert
- heading "Shader output" [level=2]
- paragraph: Generate to inspect shader output.
- list "Diagnostics":
  - listitem:
    - text: "INPUT_REQUIRED: Connect the required input."
    - button "Locate node"
- contentinfo: Click an output port, then an input to connect. Shift-click replaces a connection. Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
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
> 330 |   ).toBeDisabled();
      |     ^ Error: expect(locator).toBeDisabled() failed
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
  410 |   page.once("dialog", (dialog) => dialog.accept());
  411 |   await page.getByRole("button", { name: "New document", exact: true }).click();
  412 |   await expect(page.locator(".view-placeholder")).toContainText(
  413 |     "injected mount failure",
  414 |   );
  415 |   await expect(page.locator(".canvas")).toHaveCount(0);
  416 |   await page.getByRole("button", { name: "Retry view", exact: true }).click();
  417 |   await expect(page.locator(".canvas")).toHaveCount(1);
  418 |   await expect(page.locator(".view-placeholder")).toHaveCount(0);
  419 |   await createNode(page, "Float");
  420 |   await expect(
  421 |     page.getByRole("textbox", { name: "Value", exact: true }),
  422 |   ).toHaveValue("0.25");
  423 | });
  424 | 
  425 | test("keyboard node selection and connection buttons preserve focus; wires meet sockets after fractional zoom", async ({
  426 |   page,
  427 | }) => {
  428 |   await fullFlow(page);
  429 |   const float = page
  430 |     .locator(".node")
```