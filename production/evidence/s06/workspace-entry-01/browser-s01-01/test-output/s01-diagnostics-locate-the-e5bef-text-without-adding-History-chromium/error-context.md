# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s01.spec.ts >> diagnostics locate the affected node through the active Context without adding History
- Location: ..\..\..\production\tests\browser\s01.spec.ts:341:1

# Error details

```
Error: locator.click: Error: strict mode violation: locator('.node h3').filter({ hasText: /^Compose$/ }) resolved to 2 elements:
    1) <h3>Compose</h3> aka getByRole('heading', { name: 'Compose' })
    2) <h3>Compose</h3> aka locator('article').filter({ hasText: 'ComposeR / X · glsl.floatG /' }).locator('h3')

Call log:
  - waiting for locator('.node h3').filter({ hasText: /^Compose$/ })

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
                - button "Image output input color" [active] [ref=e65] [cursor=pointer]:
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
        - paragraph [ref=e151]: Compose
        - button "Rename node" [ref=e152] [cursor=pointer]
        - generic [ref=e153]:
          - generic [ref=e155]:
            - generic [ref=e156]: Shape
            - combobox "Shape" [ref=e157]:
              - option "vec2"
              - option "vec3"
              - option "RGBA (vec4)" [selected]
          - generic [ref=e159]:
            - generic [ref=e160]: R / X
            - textbox "R / X" [ref=e161]: "0"
            - alert [ref=e162]: Connected input — local value retained.
          - generic [ref=e164]:
            - generic [ref=e165]: G / Y
            - textbox "G / Y" [ref=e166]: "0"
            - alert
          - generic [ref=e168]:
            - generic [ref=e169]: B / Z
            - textbox "B / Z" [ref=e170]: "0"
            - alert
          - generic [ref=e172]:
            - generic [ref=e173]: A / W
            - textbox "A / W" [ref=e174]: "1"
            - alert
        - generic [ref=e176]:
          - text: From Multiply
          - button "Disconnect" [ref=e177] [cursor=pointer]
  - generic [ref=e179]:
    - heading "Shader output" [level=2] [ref=e180]
    - paragraph [ref=e181]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics"
  - contentinfo [ref=e182]:
    - generic [ref=e183]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e184]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
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
  342 |   page,
  343 | }) => {
  344 |   await fullFlow(page);
  345 |   await page
  346 |     .locator(".node h3")
  347 |     .filter({ hasText: /^Compose$/ })
> 348 |     .click();
      |      ^ Error: locator.click: Error: strict mode violation: locator('.node h3').filter({ hasText: /^Compose$/ }) resolved to 2 elements:
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
  431 |     .filter({ has: page.locator("h3", { hasText: /^Float$/ }) });
  432 |   await float.focus();
  433 |   await float.press("Enter");
  434 |   await expect(
  435 |     page.getByRole("textbox", { name: "Value", exact: true }),
  436 |   ).toHaveValue("0.25");
  437 |   await expect(float).toBeFocused();
  438 |   const canvas = page.locator(".canvas");
  439 |   await canvas.hover({ position: { x: 50, y: 350 } });
  440 |   await page.mouse.wheel(0, -123);
  441 |   await expect(canvas).not.toHaveAttribute("data-zoom", "1");
  442 |   const distance = await page.evaluate(() => {
  443 |     const path = document.querySelector<SVGPathElement>(".wires path")!,
  444 |       point = path.getPointAtLength(0);
  445 |     const screen = new DOMPoint(point.x, point.y).matrixTransform(
  446 |       path.getScreenCTM()!,
  447 |     );
  448 |     const socket = document
```