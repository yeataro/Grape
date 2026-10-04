# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-debug-hover.spec.ts >> S06 saving blocks preference changes without discarding current document
- Location: ..\..\..\production\tests\browser\s06-debug-hover.spec.ts:439:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('checkbox', { name: 'Show object information instead of normal hover hints' })

```

# Page snapshot

```yaml
- generic [ref=f2e2]:
  - banner [ref=f2e3]:
    - generic [ref=f2e4]:
      - text: Grape
      - generic [ref=f2e9]: SHADER WORKSPACE
      - generic "No candidate identity injected" [ref=f2e10]: Development · unversioned
      - button "本輪更新" [ref=f2e11] [cursor=pointer]
    - navigation "Document actions" [ref=f2e12]:
      - button "Save" [ref=f2e13] [cursor=pointer]
      - button "Generate GLSL" [ref=f2e16] [cursor=pointer]
    - generic [ref=f2e19]:
      - generic [ref=f2e20]: Unsaved changes
      - generic [ref=f2e21]: Host-free
  - generic [ref=f2e23]:
    - button "Undo" [disabled] [ref=f2e24]
    - button "Redo" [disabled] [ref=f2e27]
    - button "Delete selected" [ref=f2e30] [cursor=pointer]
    - alert
  - main [ref=f2e31]:
    - generic [ref=f2e33]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=f2e34]:
        - group "Image output" [ref=f2e35]:
          - heading "Image output" [level=3] [ref=f2e36]
          - generic [ref=f2e37]:
            - button "Image output input color" [ref=f2e38] [cursor=pointer]
            - generic [ref=f2e39]: color
            - generic [ref=f2e40]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=f2e41]:
          - button "New subgraph" [ref=f2e42] [cursor=pointer]
          - button "Library subgraph" [ref=f2e43] [cursor=pointer]
          - button "Encapsulate" [ref=f2e44] [cursor=pointer]
          - button "Make independent" [ref=f2e45] [cursor=pointer]
          - button "Enter subgraph" [ref=f2e46] [cursor=pointer]
          - button "Arrange nodes" [ref=f2e47] [cursor=pointer]
          - button "Frame selection" [ref=f2e48] [cursor=pointer]
          - group [ref=f2e49]:
            - generic "Local clipboard" [ref=f2e50] [cursor=pointer]
          - group [ref=f2e51]:
            - generic "Structures" [ref=f2e52] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=f2e53]:
          - button "Vertex" [ref=f2e54] [cursor=pointer]
          - button "Pixel" [pressed] [ref=f2e55] [cursor=pointer]
        - generic [ref=f2e56]:
          - button "Add Node" [ref=f2e57] [cursor=pointer]
          - button "Browse nodes" [ref=f2e60] [cursor=pointer]
          - button "Up" [disabled] [ref=f2e63]
          - button "Shortcuts" [ref=f2e66] [cursor=pointer]
    - complementary [ref=f2e69]:
      - generic [ref=f2e70]:
        - heading "Inspector" [level=2] [ref=f2e71]
        - paragraph [ref=f2e72]: Select a node to inspect its parameters.
  - contentinfo [ref=f2e73]:
    - button "Project actions" [ref=f2e74] [cursor=pointer]
    - status [ref=f2e75]:
      - button "Read full application status" [disabled] [ref=f2e76]
    - button "Shader output" [ref=f2e77] [cursor=pointer]
    - generic [ref=f2e78]:
      - button "Experimental features" [ref=f2e80] [cursor=pointer]
      - button "Read object details" [disabled] [ref=f2e81]
    - button "Hints" [ref=f2e82] [cursor=pointer]
```

# Test source

```ts
  365 |     exact: true,
  366 |   });
  367 |   // Pure keyboard target navigation and the explicit reader shortcut, without focus injection.
  368 |   for (
  369 |     let i = 0;
  370 |     i < 150 && !(await n.evaluate((el) => el === document.activeElement));
  371 |     i++
  372 |   )
  373 |     await page.keyboard.press("Shift+Tab");
  374 |   await expect(n).toBeFocused();
  375 |   await page.keyboard.press("F2");
  376 |   await expect(dialog(page)).toBeVisible();
  377 |   await page.setViewportSize({ width: 620, height: 380 });
  378 |   const text = dialog(page).getByRole("region");
  379 |   await page.keyboard.press("Control+End");
  380 |   await page.keyboard.press("End");
  381 |   await expect
  382 |     .poll(() =>
  383 |       text.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop),
  384 |     )
  385 |     .toBeLessThanOrEqual(1);
  386 |   const facts = await text.evaluate((el) => ({
  387 |     width: el.clientWidth,
  388 |     scrollWidth: el.scrollWidth,
  389 |     height: el.clientHeight,
  390 |     scrollHeight: el.scrollHeight,
  391 |     text: el.textContent,
  392 |   }));
  393 |   expect(facts.scrollWidth).toBeLessThanOrEqual(facts.width + 1);
  394 |   expect(facts.text).toContain('"committed"');
  395 |   await page.screenshot({ path: path.join(out, "debug-details-narrow.png") });
  396 |   await page.keyboard.press("Escape");
  397 |   await expect(n).toBeFocused();
  398 |   await page.setViewportSize({ width: 1440, height: 1000 });
  399 |   expect(await n.boundingBox()).toEqual(geometry);
  400 |   expect(await documentJSON(page)).toEqual(before);
  401 |   save("keyboard-long-details", facts);
  402 | });
  403 | 
  404 | test("S06 another field draft cannot mask active composition when reading details", async ({
  405 |   page,
  406 | }) => {
  407 |   await enable(page);
  408 |   await createNode(page, "Multiply");
  409 |   await page
  410 |     .locator(".canvas")
  411 |     .last()
  412 |     .getByRole("heading", { name: "Multiply", exact: true })
  413 |     .click();
  414 |   const a = page.getByRole("textbox", { name: "A", exact: true }),
  415 |     b = page.getByRole("textbox", { name: "B", exact: true });
  416 |   await a.fill("7.25");
  417 |   await b.fill("2.5");
  418 |   await b.dispatchEvent("compositionstart");
  419 |   await b.hover();
  420 |   await page.keyboard.press("F2");
  421 |   await expect(dialog(page)).not.toBeVisible();
  422 |   await expect(b).toBeFocused();
  423 |   await expect(a).toHaveValue("7.25");
  424 |   await expect(b).toHaveValue("2.5");
  425 |   await expect(page.locator(".experimental-issue")).toContainText(
  426 |     "composition",
  427 |   );
  428 |   await b.dispatchEvent("compositionend");
  429 |   await b.press("Escape");
  430 |   await a.press("Escape");
  431 |   save("multi-field-composition", {
  432 |     method:
  433 |       "Real focused draft fields with synthetic composition events; no physical IME qualification",
  434 |     modalOpened: false,
  435 |     draftsRetained: true,
  436 |   });
  437 | });
  438 | 
  439 | test("S06 saving blocks preference changes without discarding current document", async ({
  440 |   page,
  441 | }) => {
  442 |   await enable(page);
  443 |   await fixture(page);
  444 |   const before = await documentJSON(page);
  445 |   await page.getByText("Experimental features", { exact: true }).click();
  446 |   await page.evaluate(() => {
  447 |     const descriptor = Object.getOwnPropertyDescriptor(
  448 |       IDBTransaction.prototype,
  449 |       "oncomplete",
  450 |     )!;
  451 |     Object.defineProperty(IDBTransaction.prototype, "oncomplete", {
  452 |       ...descriptor,
  453 |       set(handler) {
  454 |         descriptor.set!.call(
  455 |           this,
  456 |           function (this: IDBTransaction, event: Event) {
  457 |             (window as any).releaseSave = () => handler.call(this, event);
  458 |           },
  459 |         );
  460 |       },
  461 |     });
  462 |   });
  463 |   await clickAction(page, "Save");
  464 |   await expect(page.locator("#save-state")).toHaveText("Saving…");
> 465 |   await checkbox(page).click();
      |                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  466 |   await expect(checkbox(page)).toBeChecked();
  467 |   await expect(page.locator(".experimental-issue")).toContainText("operation");
  468 |   await page.waitForFunction(
  469 |     () => typeof (window as any).releaseSave === "function",
  470 |   );
  471 |   await page.evaluate(() => (window as any).releaseSave());
  472 |   await expect(page.locator("#save-state")).not.toHaveText("Saving…");
  473 |   expect(await documentJSON(page)).toEqual(before);
  474 |   save("busy-guard", {
  475 |     delayedStorage: "Injected acknowledgement only",
  476 |     preferenceUnchanged: true,
  477 |     documentUnchanged: true,
  478 |   });
  479 | });
  480 | test("S06 debug target follows nested occurrence and independent Canvas navigation", async ({
  481 |   page,
  482 | }) => {
  483 |   await enable(page);
  484 |   for (const name of ["Float", "Multiply", "Compose"])
  485 |     await createNode(page, name);
  486 |   for (const [a, b] of [
  487 |     ["Float output value", "Multiply input a"],
  488 |     ["Multiply output result", "Compose input x"],
  489 |     ["Compose output result", "Image output input color"],
  490 |   ]) {
  491 |     await page.getByRole("button", { name: a, exact: true }).click();
  492 |     await page.getByRole("button", { name: b, exact: true }).click();
  493 |   }
  494 |   const first = page.locator(".canvas").first();
  495 |   await first.getByRole("heading", { name: "Multiply", exact: true }).click();
  496 |   await clickAction(page, "Encapsulate");
  497 |   await page.getByText("Local clipboard", { exact: true }).click();
  498 |   await page
  499 |     .getByRole("button", { name: "Copy selection", exact: true })
  500 |     .click();
  501 |   await page
  502 |     .getByRole("button", { name: "Paste selection", exact: true })
  503 |     .click();
  504 |   await clickAction(page, "Second Canvas");
  505 |   const second = page.locator(".canvas").nth(1);
  506 |   await first.locator('article[aria-label="Subgraph"] h3').click();
  507 |   await first
  508 |     .getByRole("button", { name: "Enter subgraph", exact: true })
  509 |     .click();
  510 |   await second.locator('article[aria-label="Subgraph 2"] h3').click();
  511 |   await second
  512 |     .getByRole("button", { name: "Enter subgraph", exact: true })
  513 |     .click();
  514 |   const before = await documentJSON(page),
  515 |     records = [];
  516 |   for (const c of [first, second]) {
  517 |     await c.getByRole("heading", { name: "Multiply", exact: true }).hover();
  518 |     const text = await read(page);
  519 |     expect(text).toContain('"occurrence"');
  520 |     records.push(text);
  521 |     await close(page);
  522 |   }
  523 |   expect(records[0]).not.toEqual(records[1]);
  524 |   await first.getByRole("button", { name: "Up", exact: true }).click();
  525 |   await expect(first).toHaveAttribute("data-path", "");
  526 |   await expect(second).toHaveAttribute("data-path", /.+/);
  527 |   await expect(dialog(page)).not.toBeVisible();
  528 |   expect(await documentJSON(page)).toEqual(before);
  529 |   save("nested-occurrences", records);
  530 | });
  531 | 
```