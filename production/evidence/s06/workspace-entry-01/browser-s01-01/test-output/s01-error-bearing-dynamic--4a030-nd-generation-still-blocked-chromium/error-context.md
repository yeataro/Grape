# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s01.spec.ts >> error-bearing dynamic document saves and reopens with loss evidence and generation still blocked
- Location: ..\..\..\production\tests\browser\s01.spec.ts:459:1

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
  449 |       .querySelector<HTMLElement>('[aria-label="Float output value"] .socket')!
  450 |       .getBoundingClientRect();
  451 |     return Math.hypot(
  452 |       screen.x - socket.left - socket.width / 2,
  453 |       screen.y - socket.top - socket.height / 2,
  454 |     );
  455 |   });
  456 |   expect(distance).toBeLessThan(2);
  457 | });
  458 | 
  459 | test("error-bearing dynamic document saves and reopens with loss evidence and generation still blocked", async ({
  460 |   page,
  461 | }) => {
  462 |   await fullFlow(page);
  463 |   await page
  464 |     .locator(".node h3")
  465 |     .filter({ hasText: /^Compose$/ })
> 466 |     .click();
      |      ^ Error: locator.click: Error: strict mode violation: locator('.node h3').filter({ hasText: /^Compose$/ }) resolved to 2 elements:
  467 |   await page
  468 |     .getByRole("combobox", { name: "Shape" })
  469 |     .selectOption({ label: "vec2" });
  470 |   await page.getByRole("button", { name: "Save", exact: true }).click();
  471 |   await expect(page.locator("#save-state")).toHaveText("Saved");
  472 |   const download = page.waitForEvent("download");
  473 |   await page.getByRole("button", { name: "Export JSON" }).click();
  474 |   const file = await (await download).path();
  475 |   const fs = await import("node:fs/promises");
  476 |   const doc = JSON.parse(await fs.readFile(file!, "utf8"));
  477 |   expect(doc.graph.losses.some((x: any) => x.payload.kind === "edge")).toBe(
  478 |     true,
  479 |   );
  480 |   expect(
  481 |     doc.graph.losses.some((x: any) => x.payload.kind === "input-value"),
  482 |   ).toBe(true);
  483 |   await page.getByRole("button", { name: "New document", exact: true }).click();
  484 |   await page.getByRole("button", { name: "Open saved", exact: true }).click();
  485 |   page.once("dialog", (dialog) => dialog.accept());
  486 |   await page.locator("#saved-list button").click();
  487 |   await page.getByRole("button", { name: "Generate GLSL" }).click();
  488 |   await expect(
  489 |     page.getByText("Generation blocked", { exact: true }),
  490 |   ).toBeVisible();
  491 |   await expect(page.getByLabel("Diagnostics")).toContainText("INPUT_REQUIRED");
  492 |   const again = page.waitForEvent("download");
  493 |   await page.getByRole("button", { name: "Export JSON" }).click();
  494 |   expect(
  495 |     JSON.parse(await fs.readFile((await (await again).path())!, "utf8")),
  496 |   ).toEqual(doc);
  497 | });
  498 | 
  499 | for (const source of ["Float", "Multiply"] as const) {
  500 |   test(`M1 browser: ${source} 1e21 commits and generates a valid exponent literal`, async ({
  501 |     page,
  502 |   }) => {
  503 |     await fullFlow(page);
  504 |     await page
  505 |       .locator(".node h3")
  506 |       .filter({ hasText: new RegExp("^" + source + "$") })
  507 |       .click();
  508 |     const field = page.getByRole("textbox", {
  509 |       name: source === "Float" ? "Value" : "B",
  510 |       exact: true,
  511 |     });
  512 |     await field.fill("1e21");
  513 |     await field.press("Enter");
  514 |     await expect(field).toHaveValue("1e+21");
  515 |     await page
  516 |       .getByRole("button", { name: "Generate GLSL", exact: true })
  517 |       .click();
  518 |     await expect(
  519 |       page.getByText("Generated successfully · Host-free GLSL"),
  520 |     ).toBeVisible();
  521 |     const code = page.getByLabel("Generated GLSL");
  522 |     await expect(code).toContainText(
  523 |       source === "Float"
  524 |         ? "float n_1_p0 = 1.0e+21;"
  525 |         : "float n_2_p2 = (n_1_p0 * 1.0e+21);",
  526 |     );
  527 |     await expect(code).not.toContainText("1e+21.0");
  528 |     await page.screenshot({
  529 |       path: `${process.env.GRAPE_EVIDENCE_DIR ?? "evidence/s02"}/m1-${source.toLowerCase()}.png`,
  530 |       fullPage: true,
  531 |     });
  532 |   });
  533 | }
  534 | 
  535 | test("N1 browser: middle/right movement cannot edit nodes; primary drag still groups into one Undo", async ({
  536 |   page,
  537 | }) => {
  538 |   await createNode(page, "Float");
  539 |   await page.getByRole("button", { name: "Save", exact: true }).click();
  540 |   await expect(page.locator("#save-state")).toHaveText("Saved");
  541 |   const card = page
  542 |     .locator(".node")
  543 |     .filter({ has: page.locator("h3", { hasText: /^Float$/ }) });
  544 |   const position = await card.getAttribute("style"),
  545 |     revision = await page.locator(".canvas").getAttribute("data-revision");
  546 |   for (const button of ["middle", "right"] as const) {
  547 |     const box = (await card.locator("h3").boundingBox())!;
  548 |     await page.mouse.move(box.x + 50, box.y + 15);
  549 |     await page.mouse.down({ button });
  550 |     await page.mouse.move(box.x + 100, box.y + 50, { steps: 5 });
  551 |     await page.mouse.up({ button });
  552 |     await page.keyboard.press("Escape");
  553 |     await expect(card).toHaveAttribute("style", position!);
  554 |     await expect(page.locator(".canvas")).toHaveAttribute(
  555 |       "data-revision",
  556 |       revision!,
  557 |     );
  558 |     await expect(page.locator("#save-state")).toHaveText("Saved");
  559 |   }
  560 |   const box = (await card.locator("h3").boundingBox())!;
  561 |   await page.mouse.move(box.x + 50, box.y + 15);
  562 |   await page.mouse.down({ button: "left" });
  563 |   await page.mouse.move(box.x + 100, box.y + 50, { steps: 5 });
  564 |   await page.mouse.up({ button: "left" });
  565 |   await expect(card).not.toHaveAttribute("style", position!);
  566 |   await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
```