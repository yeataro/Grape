# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-debug-hover.spec.ts >> S06 debug target follows nested occurrence and independent Canvas navigation
- Location: ..\..\..\production\tests\browser\s06-debug-hover.spec.ts:482:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Float output value', exact: true })
    - locator resolved to <button class="port" type="button" data-port="value" data-direction="output" aria-label="Float output value" data-node-id="8168b966-b73a-465b-81dd-c9902c3ed53c">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button class="port" type="button" data-port="a" data-direction="input" aria-label="Multiply input a" data-node-id="373726bb-c510-439f-b234-cc997111fe28">…</button> from <article class="node" tabindex="0" role="group" aria-description="" data-role="operation" aria-label="Multiply" data-node="373726bb-c510-439f-b234-cc997111fe28">…</article> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button class="port" type="button" data-port="a" data-direction="input" aria-label="Multiply input a" data-node-id="373726bb-c510-439f-b234-cc997111fe28">…</button> from <article class="node" tabindex="0" role="group" aria-description="" data-role="operation" aria-label="Multiply" data-node="373726bb-c510-439f-b234-cc997111fe28">…</article> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    57 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <button class="port" type="button" data-port="a" data-direction="input" aria-label="Multiply input a" data-node-id="373726bb-c510-439f-b234-cc997111fe28">…</button> from <article class="node" tabindex="0" role="group" aria-description="" data-role="operation" aria-label="Multiply" data-node="373726bb-c510-439f-b234-cc997111fe28">…</article> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - text: Grape
      - generic [ref=e9]: SHADER WORKSPACE
      - generic "No candidate identity injected" [ref=e10]: Development · unversioned
      - button "本輪更新" [ref=e11] [cursor=pointer]
    - navigation "Document actions" [ref=e12]:
      - button "Save" [ref=e13] [cursor=pointer]
      - button "Generate GLSL" [ref=e16] [cursor=pointer]
    - generic [ref=e19]:
      - generic [ref=e20]: Unsaved changes
      - generic [ref=e21]: Host-free
  - generic [ref=e23]:
    - button "Undo" [ref=e24] [cursor=pointer]
    - button "Redo" [disabled] [ref=e27]
    - button "Delete selected" [ref=e30] [cursor=pointer]
    - alert
  - main [ref=e31]:
    - generic [ref=e33]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [active] [ref=e34]:
        - generic:
          - generic:
            - generic:
              - group "Image output" [ref=e35]:
                - heading "Image output" [level=3] [ref=e36]
                - generic [ref=e37]:
                  - button "Image output input color" [ref=e38] [cursor=pointer]
                  - generic [ref=e39]: color
                  - generic [ref=e40]: vec4
              - group "Float" [ref=e41]:
                - heading "Float" [level=3] [ref=e42]
                - generic [ref=e43]:
                  - button "Float output value" [ref=e44] [cursor=pointer]
                  - generic [ref=e45]: value
                  - generic [ref=e46]: float
              - group "Multiply" [ref=e47]:
                - heading "Multiply" [level=3] [ref=e48]
                - generic [ref=e49]:
                  - button "Multiply input a" [ref=e50] [cursor=pointer]
                  - generic [ref=e51]: a
                  - generic [ref=e52]: float
                  - generic "Current local value; edit in Inspector" [ref=e53]: "1"
                - generic [ref=e54]:
                  - button "Multiply input b" [ref=e55] [cursor=pointer]
                  - generic [ref=e56]: b
                  - generic [ref=e57]: float
                  - generic "Current local value; edit in Inspector" [ref=e58]: "2"
                - generic [ref=e59]:
                  - button "Multiply output result" [ref=e60] [cursor=pointer]
                  - generic [ref=e61]: result
                  - generic [ref=e62]: float
              - group "Compose" [ref=e63]:
                - heading "Compose" [level=3] [ref=e64]
                - generic [ref=e65]:
                  - button "Compose input x" [ref=e66] [cursor=pointer]
                  - generic [ref=e67]: x
                  - generic [ref=e68]: float
                  - generic "Current local value; edit in Inspector" [ref=e69]: "0"
                - generic [ref=e70]:
                  - button "Compose input y" [ref=e71] [cursor=pointer]
                  - generic [ref=e72]: "y"
                  - generic [ref=e73]: float
                  - generic "Current local value; edit in Inspector" [ref=e74]: "0"
                - generic [ref=e75]:
                  - button "Compose input z" [ref=e76] [cursor=pointer]
                  - generic [ref=e77]: z
                  - generic [ref=e78]: float
                  - generic "Current local value; edit in Inspector" [ref=e79]: "0"
                - generic [ref=e80]:
                  - button "Compose input w" [ref=e81] [cursor=pointer]
                  - generic [ref=e82]: w
                  - generic [ref=e83]: float
                  - generic "Current local value; edit in Inspector" [ref=e84]: "1"
                - generic [ref=e85]:
                  - button "Compose output result" [ref=e86] [cursor=pointer]
                  - generic [ref=e87]: result
                  - generic [ref=e88]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e89]:
          - button "New subgraph" [ref=e90] [cursor=pointer]
          - button "Library subgraph" [ref=e91] [cursor=pointer]
          - button "Encapsulate" [ref=e92] [cursor=pointer]
          - button "Make independent" [ref=e93] [cursor=pointer]
          - button "Enter subgraph" [ref=e94] [cursor=pointer]
          - button "Arrange nodes" [ref=e95] [cursor=pointer]
          - button "Frame selection" [ref=e96] [cursor=pointer]
          - group [ref=e97]:
            - generic "Local clipboard" [ref=e98] [cursor=pointer]
          - group [ref=e99]:
            - generic "Structures" [ref=e100] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e101]:
          - button "Vertex" [ref=e102] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e103] [cursor=pointer]
        - generic [ref=e104]:
          - button "Add Node" [ref=e105] [cursor=pointer]
          - button "Browse nodes" [ref=e108] [cursor=pointer]
          - button "Up" [disabled] [ref=e111]
          - button "Shortcuts" [ref=e114] [cursor=pointer]
    - complementary [ref=e117]:
      - generic [ref=e118]:
        - heading "Inspector" [level=2] [ref=e119]
        - paragraph [ref=e120]: Compose
        - button "Rename node" [ref=e121] [cursor=pointer]
        - generic [ref=e122]:
          - generic [ref=e124]:
            - generic [ref=e125]: Shape
            - combobox "Shape" [ref=e126]:
              - option "vec2"
              - option "vec3"
              - option "RGBA (vec4)" [selected]
          - generic [ref=e128]:
            - generic [ref=e129]: R / X
            - textbox "R / X" [ref=e130]: "0"
            - alert
          - generic [ref=e132]:
            - generic [ref=e133]: G / Y
            - textbox "G / Y" [ref=e134]: "0"
            - alert
          - generic [ref=e136]:
            - generic [ref=e137]: B / Z
            - textbox "B / Z" [ref=e138]: "0"
            - alert
          - generic [ref=e140]:
            - generic [ref=e141]: A / W
            - textbox "A / W" [ref=e142]: "1"
            - alert
  - contentinfo [ref=e143]:
    - button "Project actions" [ref=e144] [cursor=pointer]
    - status [ref=e145]:
      - button "Read full application status" [disabled] [ref=e146]
    - button "Shader output" [ref=e147] [cursor=pointer]
    - generic [ref=e148]:
      - button "Experimental features" [ref=e150] [cursor=pointer]
      - generic [ref=e151]: Port · y · Committed · disconnected
      - button "Read object details" [ref=e152] [cursor=pointer]
    - button "Hints" [ref=e153] [cursor=pointer]
```

# Test source

```ts
  393 |     text: el.textContent,
  394 |   }));
  395 |   expect(facts.scrollWidth).toBeLessThanOrEqual(facts.width + 1);
  396 |   expect(facts.text).toContain('"committed"');
  397 |   await page.screenshot({ path: path.join(out, "debug-details-narrow.png") });
  398 |   await page.keyboard.press("Escape");
  399 |   await expect(n).toBeFocused();
  400 |   await page.setViewportSize({ width: 1440, height: 1000 });
  401 |   expect(await n.boundingBox()).toEqual(geometry);
  402 |   expect(await documentJSON(page)).toEqual(before);
  403 |   save("keyboard-long-details", facts);
  404 | });
  405 | 
  406 | test("S06 another field draft cannot mask active composition when reading details", async ({
  407 |   page,
  408 | }) => {
  409 |   await enable(page);
  410 |   await createNode(page, "Multiply");
  411 |   await page
  412 |     .locator(".canvas")
  413 |     .last()
  414 |     .getByRole("heading", { name: "Multiply", exact: true })
  415 |     .click();
  416 |   const a = page.getByRole("textbox", { name: "A", exact: true }),
  417 |     b = page.getByRole("textbox", { name: "B", exact: true });
  418 |   await a.fill("7.25");
  419 |   await b.fill("2.5");
  420 |   await b.dispatchEvent("compositionstart");
  421 |   await b.hover();
  422 |   await page.keyboard.press("F2");
  423 |   await expect(dialog(page)).not.toBeVisible();
  424 |   await expect(b).toBeFocused();
  425 |   await expect(a).toHaveValue("7.25");
  426 |   await expect(b).toHaveValue("2.5");
  427 |   await expect(page.locator(".experimental-issue")).toContainText(
  428 |     "composition",
  429 |   );
  430 |   await b.dispatchEvent("compositionend");
  431 |   await b.press("Escape");
  432 |   await a.press("Escape");
  433 |   save("multi-field-composition", {
  434 |     method:
  435 |       "Real focused draft fields with synthetic composition events; no physical IME qualification",
  436 |     modalOpened: false,
  437 |     draftsRetained: true,
  438 |   });
  439 | });
  440 | 
  441 | test("S06 saving blocks preference changes without discarding current document", async ({
  442 |   page,
  443 | }) => {
  444 |   await enable(page);
  445 |   await fixture(page);
  446 |   const before = await documentJSON(page);
  447 |   await page.getByText("Experimental features", { exact: true }).click();
  448 |   await page.evaluate(() => {
  449 |     const descriptor = Object.getOwnPropertyDescriptor(
  450 |       IDBTransaction.prototype,
  451 |       "oncomplete",
  452 |     )!;
  453 |     Object.defineProperty(IDBTransaction.prototype, "oncomplete", {
  454 |       ...descriptor,
  455 |       set(handler) {
  456 |         descriptor.set!.call(
  457 |           this,
  458 |           function (this: IDBTransaction, event: Event) {
  459 |             (window as any).releaseSave = () => handler.call(this, event);
  460 |           },
  461 |         );
  462 |       },
  463 |     });
  464 |   });
  465 |   await clickAction(page, "Save");
  466 |   await expect(page.locator("#save-state")).toHaveText("Saving…");
  467 |   await checkbox(page).click();
  468 |   await expect(checkbox(page)).toBeChecked();
  469 |   await expect(page.locator(".experimental-issue")).toContainText("operation");
  470 |   await page.waitForFunction(
  471 |     () => typeof (window as any).releaseSave === "function",
  472 |   );
  473 |   await page.evaluate(() => (window as any).releaseSave());
  474 |   await expect(page.locator("#save-state")).not.toHaveText("Saving…");
  475 |   expect(await documentJSON(page)).toEqual(before);
  476 |   save("busy-guard", {
  477 |     delayedStorage: "Injected acknowledgement only",
  478 |     preferenceUnchanged: true,
  479 |     documentUnchanged: true,
  480 |   });
  481 | });
  482 | test("S06 debug target follows nested occurrence and independent Canvas navigation", async ({
  483 |   page,
  484 | }) => {
  485 |   await enable(page);
  486 |   for (const name of ["Float", "Multiply", "Compose"])
  487 |     await createNode(page, name);
  488 |   for (const [a, b] of [
  489 |     ["Float output value", "Multiply input a"],
  490 |     ["Multiply output result", "Compose input x"],
  491 |     ["Compose output result", "Image output input color"],
  492 |   ]) {
> 493 |     await page.getByRole("button", { name: a, exact: true }).click();
      |                                                              ^ Error: locator.click: Test timeout of 30000ms exceeded.
  494 |     await page.getByRole("button", { name: b, exact: true }).click();
  495 |   }
  496 |   const first = page.locator(".canvas").first();
  497 |   await first.getByRole("heading", { name: "Multiply", exact: true }).click();
  498 |   await clickAction(page, "Encapsulate");
  499 |   await page.getByText("Local clipboard", { exact: true }).click();
  500 |   await page
  501 |     .getByRole("button", { name: "Copy selection", exact: true })
  502 |     .click();
  503 |   await page
  504 |     .getByRole("button", { name: "Paste selection", exact: true })
  505 |     .click();
  506 |   await clickAction(page, "Second Canvas");
  507 |   const second = page.locator(".canvas").nth(1);
  508 |   await first.locator('article[aria-label="Subgraph"] h3').click();
  509 |   await first
  510 |     .getByRole("button", { name: "Enter subgraph", exact: true })
  511 |     .click();
  512 |   await second.locator('article[aria-label="Subgraph 2"] h3').click();
  513 |   await second
  514 |     .getByRole("button", { name: "Enter subgraph", exact: true })
  515 |     .click();
  516 |   const before = await documentJSON(page),
  517 |     records = [];
  518 |   for (const c of [first, second]) {
  519 |     await c.getByRole("heading", { name: "Multiply", exact: true }).hover();
  520 |     const text = await read(page);
  521 |     expect(text).toContain('"occurrence"');
  522 |     records.push(text);
  523 |     await close(page);
  524 |   }
  525 |   expect(records[0]).not.toEqual(records[1]);
  526 |   await first.getByRole("button", { name: "Up", exact: true }).click();
  527 |   await expect(first).toHaveAttribute("data-path", "");
  528 |   await expect(second).toHaveAttribute("data-path", /.+/);
  529 |   await expect(dialog(page)).not.toBeVisible();
  530 |   expect(await documentJSON(page)).toEqual(before);
  531 |   save("nested-occurrences", records);
  532 | });
  533 | 
```