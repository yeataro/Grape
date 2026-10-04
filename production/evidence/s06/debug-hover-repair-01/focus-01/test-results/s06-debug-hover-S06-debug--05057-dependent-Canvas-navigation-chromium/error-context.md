# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-debug-hover.spec.ts >> S06 debug target follows nested occurrence and independent Canvas navigation
- Location: ..\..\..\production\tests\browser\s06-debug-hover.spec.ts:480:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Float output value', exact: true })
    - locator resolved to <button class="port" type="button" data-port="value" data-direction="output" aria-label="Float output value" data-node-id="6cb4dd22-9f5f-4683-ace5-339525a71f87">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button class="port" type="button" data-port="a" data-direction="input" aria-label="Multiply input a" data-node-id="08d12d27-2ad3-4c97-8e84-3b8d74ec4128">…</button> from <article class="node" tabindex="0" role="group" aria-description="" data-role="operation" aria-label="Multiply" data-node="08d12d27-2ad3-4c97-8e84-3b8d74ec4128">…</article> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button class="port" type="button" data-port="a" data-direction="input" aria-label="Multiply input a" data-node-id="08d12d27-2ad3-4c97-8e84-3b8d74ec4128">…</button> from <article class="node" tabindex="0" role="group" aria-description="" data-role="operation" aria-label="Multiply" data-node="08d12d27-2ad3-4c97-8e84-3b8d74ec4128">…</article> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    57 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <button class="port" type="button" data-port="a" data-direction="input" aria-label="Multiply input a" data-node-id="08d12d27-2ad3-4c97-8e84-3b8d74ec4128">…</button> from <article class="node" tabindex="0" role="group" aria-description="" data-role="operation" aria-label="Multiply" data-node="08d12d27-2ad3-4c97-8e84-3b8d74ec4128">…</article> subtree intercepts pointer events
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
  465 |   await checkbox(page).click();
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
> 491 |     await page.getByRole("button", { name: a, exact: true }).click();
      |                                                              ^ Error: locator.click: Test timeout of 30000ms exceeded.
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