# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s01.spec.ts >> error-bearing dynamic document saves and reopens with loss evidence and generation still blocked
- Location: tests\browser\s01.spec.ts:454:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
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
      - button "Export JSON" [active] [ref=e11] [cursor=pointer]
      - button "Export PNG" [ref=e12] [cursor=pointer]
      - button "Open file" [ref=e13] [cursor=pointer]
      - button "Generate GLSL" [ref=e14] [cursor=pointer]
      - button "Second Canvas" [ref=e15] [cursor=pointer]
      - button "Lock editing" [ref=e16] [cursor=pointer]
      - button "Personal Library" [ref=e17] [cursor=pointer]
    - generic [ref=e18]:
      - generic [ref=e19]: Saved
      - generic [ref=e20]: Host-free
  - status [ref=e21]: Export started. Saved status is unchanged.
  - generic [ref=e23]:
    - button "Add Float" [ref=e24] [cursor=pointer]
    - button "Add Multiply" [ref=e25] [cursor=pointer]
    - button "Add Compose" [ref=e26] [cursor=pointer]
    - button "Add Array repeat" [ref=e27] [cursor=pointer]
    - button "Undo" [ref=e28] [cursor=pointer]
    - button "Redo" [disabled] [ref=e29]
    - button "Delete selected" [ref=e30] [cursor=pointer]
    - alert
  - main [ref=e31]:
    - generic [ref=e33]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e34]:
        - generic:
          - generic:
            - group "Image output" [ref=e37]:
              - heading "Image output" [level=3] [ref=e38]
              - generic [ref=e39]:
                - button "Image output input color" [ref=e40] [cursor=pointer]:
                  - generic [ref=e41]: ●
                  - generic [ref=e42]: color
                - generic [ref=e43]: vec4
            - group "Float" [ref=e44]:
              - heading "Float" [level=3] [ref=e45]
              - generic [ref=e46]:
                - button "Float output value" [ref=e47] [cursor=pointer]:
                  - generic [ref=e48]: value
                  - generic [ref=e49]: ●
                - generic [ref=e50]: float
            - group "Multiply" [ref=e51]:
              - heading "Multiply" [level=3] [ref=e52]
              - generic [ref=e53]:
                - button "Multiply input a" [ref=e54] [cursor=pointer]:
                  - generic [ref=e55]: ●
                  - generic [ref=e56]: a
                - generic [ref=e57]: float
              - generic [ref=e58]:
                - button "Multiply input b" [ref=e59] [cursor=pointer]:
                  - generic [ref=e60]: ●
                  - generic [ref=e61]: b
                - generic [ref=e62]: float
              - generic [ref=e63]:
                - button "Multiply output result" [ref=e64] [cursor=pointer]:
                  - generic [ref=e65]: result
                  - generic [ref=e66]: ●
                - generic [ref=e67]: float
            - group "Compose" [ref=e68]:
              - heading "Compose" [level=3] [ref=e69]
              - generic [ref=e70]:
                - button "Compose input x" [ref=e71] [cursor=pointer]:
                  - generic [ref=e72]: ●
                  - generic [ref=e73]: x
                - generic [ref=e74]: float
              - generic [ref=e75]:
                - button "Compose input y" [ref=e76] [cursor=pointer]:
                  - generic [ref=e77]: ●
                  - generic [ref=e78]: "y"
                - generic [ref=e79]: float
              - generic [ref=e80]:
                - button "Compose output result" [ref=e81] [cursor=pointer]:
                  - generic [ref=e82]: result
                  - generic [ref=e83]: ●
                - generic [ref=e84]: vec2
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e85]:
          - button "New subgraph" [ref=e86] [cursor=pointer]
          - button "Library subgraph" [ref=e87] [cursor=pointer]
          - button "Encapsulate" [ref=e88] [cursor=pointer]
          - button "Make independent" [ref=e89] [cursor=pointer]
          - button "Enter subgraph" [ref=e90] [cursor=pointer]
          - button "Up" [ref=e91] [cursor=pointer]
          - button "Arrange nodes" [ref=e92] [cursor=pointer]
          - button "Frame selection" [ref=e93] [cursor=pointer]
          - group [ref=e94]:
            - generic "Local clipboard" [ref=e95]
          - group [ref=e96]:
            - generic "Structures" [ref=e97]
            - option "New structure" [selected]
    - complementary [ref=e98]:
      - generic [ref=e99]:
        - heading "Inspector" [level=2] [ref=e100]
        - paragraph [ref=e101]: Compose
        - button "Rename node" [ref=e102] [cursor=pointer]
        - generic [ref=e103]:
          - generic [ref=e105]:
            - generic [ref=e106]: Shape
            - combobox "Shape" [ref=e107]:
              - option "vec2" [selected]
              - option "vec3"
              - option "RGBA (vec4)"
          - generic [ref=e109]:
            - generic [ref=e110]: R / X
            - textbox "R / X" [ref=e111]: "0"
            - alert [ref=e112]: Connected input — local value retained.
          - generic [ref=e114]:
            - generic [ref=e115]: G / Y
            - textbox "G / Y" [ref=e116]: "0"
            - alert
        - generic [ref=e118]:
          - text: From Multiply
          - button "Disconnect" [ref=e119] [cursor=pointer]
  - generic [ref=e121]:
    - heading "Shader output" [level=2] [ref=e122]
    - paragraph [ref=e123]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e124]:
      - listitem [ref=e125]: "INPUT_REMOVED: Interface change removed authored data."
      - listitem [ref=e126]: "INPUT_REMOVED: Interface change removed authored data."
  - contentinfo [ref=e127]:
    - generic [ref=e128]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e129]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
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
  466 |   await expect(page.locator("#save-state")).toHaveText("Saved");
  467 |   const download = page.waitForEvent("download");
  468 |   await page.getByRole("button", { name: "Export JSON" }).click();
  469 |   const file = await (await download).path();
  470 |   const fs = await import("node:fs/promises");
  471 |   const doc = JSON.parse(await fs.readFile(file!, "utf8"));
> 472 |   expect(doc.graph.losses.some((x: any) => x.payload.kind === "edge")).toBe(
      |                                                                        ^ Error: expect(received).toBe(expected) // Object.is equality
  473 |     true,
  474 |   );
  475 |   expect(
  476 |     doc.graph.losses.some((x: any) => x.payload.kind === "input-value"),
  477 |   ).toBe(true);
  478 |   await page.getByRole("button", { name: "New document", exact: true }).click();
  479 |   await page.getByRole("button", { name: "Open saved", exact: true }).click();
  480 |   page.once("dialog", (dialog) => dialog.accept());
  481 |   await page.locator("#saved-list button").click();
  482 |   await page.getByRole("button", { name: "Generate GLSL" }).click();
  483 |   await expect(
  484 |     page.getByText("Generation blocked", { exact: true }),
  485 |   ).toBeVisible();
  486 |   await expect(page.getByLabel("Diagnostics")).toContainText("INPUT_REQUIRED");
  487 |   const again = page.waitForEvent("download");
  488 |   await page.getByRole("button", { name: "Export JSON" }).click();
  489 |   expect(
  490 |     JSON.parse(await fs.readFile((await (await again).path())!, "utf8")),
  491 |   ).toEqual(doc);
  492 | });
  493 | 
  494 | for (const source of ["Float", "Multiply"] as const) {
  495 |   test(`M1 browser: ${source} 1e21 commits and generates a valid exponent literal`, async ({
  496 |     page,
  497 |   }) => {
  498 |     await fullFlow(page);
  499 |     await page
  500 |       .locator(".node h3")
  501 |       .filter({ hasText: new RegExp("^" + source + "$") })
  502 |       .click();
  503 |     const field = page.getByRole("textbox", {
  504 |       name: source === "Float" ? "Value" : "B",
  505 |       exact: true,
  506 |     });
  507 |     await field.fill("1e21");
  508 |     await field.press("Enter");
  509 |     await expect(field).toHaveValue("1e+21");
  510 |     await page
  511 |       .getByRole("button", { name: "Generate GLSL", exact: true })
  512 |       .click();
  513 |     await expect(
  514 |       page.getByText("Generated successfully · Host-free GLSL"),
  515 |     ).toBeVisible();
  516 |     const code = page.getByLabel("Generated GLSL");
  517 |     await expect(code).toContainText(
  518 |       source === "Float"
  519 |         ? "float n_1_p0 = 1.0e+21;"
  520 |         : "float n_2_p2 = (n_1_p0 * 1.0e+21);",
  521 |     );
  522 |     await expect(code).not.toContainText("1e+21.0");
  523 |     await page.screenshot({
  524 |       path: `${process.env.GRAPE_EVIDENCE_DIR ?? "evidence/s02"}/m1-${source.toLowerCase()}.png`,
  525 |       fullPage: true,
  526 |     });
  527 |   });
  528 | }
  529 | 
  530 | test("N1 browser: middle/right movement cannot edit nodes; primary drag still groups into one Undo", async ({
  531 |   page,
  532 | }) => {
  533 |   await page.getByRole("button", { name: "Add Float", exact: true }).click();
  534 |   await page.getByRole("button", { name: "Save", exact: true }).click();
  535 |   await expect(page.locator("#save-state")).toHaveText("Saved");
  536 |   const card = page
  537 |     .locator(".node")
  538 |     .filter({ has: page.locator("h3", { hasText: /^Float$/ }) });
  539 |   const position = await card.getAttribute("style"),
  540 |     revision = await page.locator(".canvas").getAttribute("data-revision");
  541 |   for (const button of ["middle", "right"] as const) {
  542 |     const box = (await card.locator("h3").boundingBox())!;
  543 |     await page.mouse.move(box.x + 50, box.y + 15);
  544 |     await page.mouse.down({ button });
  545 |     await page.mouse.move(box.x + 100, box.y + 50, { steps: 5 });
  546 |     await page.mouse.up({ button });
  547 |     await page.keyboard.press("Escape");
  548 |     await expect(card).toHaveAttribute("style", position!);
  549 |     await expect(page.locator(".canvas")).toHaveAttribute(
  550 |       "data-revision",
  551 |       revision!,
  552 |     );
  553 |     await expect(page.locator("#save-state")).toHaveText("Saved");
  554 |   }
  555 |   const box = (await card.locator("h3").boundingBox())!;
  556 |   await page.mouse.move(box.x + 50, box.y + 15);
  557 |   await page.mouse.down({ button: "left" });
  558 |   await page.mouse.move(box.x + 100, box.y + 50, { steps: 5 });
  559 |   await page.mouse.up({ button: "left" });
  560 |   await expect(card).not.toHaveAttribute("style", position!);
  561 |   await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
  562 |   await page.getByRole("button", { name: "Undo", exact: true }).click();
  563 |   await expect(card).toHaveAttribute("style", position!);
  564 |   await expect(page.locator("#save-state")).toHaveText("Saved");
  565 | });
  566 | 
```