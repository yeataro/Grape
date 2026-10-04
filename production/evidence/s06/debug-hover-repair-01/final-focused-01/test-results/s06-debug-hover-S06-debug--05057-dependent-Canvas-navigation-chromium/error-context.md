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
  - waiting for getByRole('button', { name: 'Image output input color', exact: true })
    - locator resolved to <button class="port" type="button" data-port="color" data-direction="input" aria-label="Image output input color" data-node-id="6d979997-7547-4ef4-a730-f3bd388810fd">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="node-value" title="Current local value; edit in Inspector">1</span> from <article tabindex="0" role="group" aria-label="Compose" class="node selected" data-role="operation" aria-description="Selected" data-node="49875345-1b13-4d87-8ed8-95958559f10c">…</article> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="node-value" title="Current local value; edit in Inspector">1</span> from <article tabindex="0" role="group" aria-label="Compose" class="node selected" data-role="operation" aria-description="Selected" data-node="49875345-1b13-4d87-8ed8-95958559f10c">…</article> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    57 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <span class="node-value" title="Current local value; edit in Inspector">1</span> from <article tabindex="0" role="group" aria-label="Compose" class="node selected" data-role="operation" aria-description="Selected" data-node="49875345-1b13-4d87-8ed8-95958559f10c">…</article> subtree intercepts pointer events
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
      - generic "Shader graph canvas" [ref=e34]:
        - generic:
          - generic:
            - img:
              - generic "Edge e0e972ce-1764-44b4-8748-713493828dd2"
              - generic "Edge a6edfa12-011b-4906-bc73-c575abc3d125" [ref=e35]
            - generic:
              - group "Image output" [ref=e36]:
                - heading "Image output" [level=3] [ref=e37]
                - generic [ref=e38]:
                  - button "Image output input color" [ref=e39] [cursor=pointer]
                  - generic [ref=e40]: color
                  - generic [ref=e41]: vec4
              - group "Float" [ref=e42]:
                - heading "Float" [level=3] [ref=e43]
                - generic [ref=e44]:
                  - button "Float output value" [ref=e45] [cursor=pointer]
                  - generic [ref=e46]: value
                  - generic [ref=e47]: float
              - group "Multiply" [ref=e48]:
                - heading "Multiply" [level=3] [ref=e49]
                - generic [ref=e50]:
                  - button "Multiply input a" [ref=e51] [cursor=pointer]
                  - generic [ref=e52]: a
                  - generic [ref=e53]: float
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
                - generic [ref=e69]:
                  - button "Compose input y" [ref=e70] [cursor=pointer]
                  - generic [ref=e71]: "y"
                  - generic [ref=e72]: float
                  - generic "Current local value; edit in Inspector" [ref=e73]: "0"
                - generic [ref=e74]:
                  - button "Compose input z" [ref=e75] [cursor=pointer]
                  - generic [ref=e76]: z
                  - generic [ref=e77]: float
                  - generic "Current local value; edit in Inspector" [ref=e78]: "0"
                - generic [ref=e79]:
                  - button "Compose input w" [ref=e80] [cursor=pointer]
                  - generic [ref=e81]: w
                  - generic [ref=e82]: float
                  - generic "Current local value; edit in Inspector" [ref=e83]: "1"
                - generic [ref=e84]:
                  - button "Compose output result" [active] [ref=e85] [cursor=pointer]
                  - generic [ref=e86]: result
                  - generic [ref=e87]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - status:
          - button "Read full Canvas status" [disabled]: Choose the opposite port. Hold Shift to replace an existing connection.
        - generic [ref=e88]:
          - button "New subgraph" [ref=e89] [cursor=pointer]
          - button "Library subgraph" [ref=e90] [cursor=pointer]
          - button "Encapsulate" [ref=e91] [cursor=pointer]
          - button "Make independent" [ref=e92] [cursor=pointer]
          - button "Enter subgraph" [ref=e93] [cursor=pointer]
          - button "Arrange nodes" [ref=e94] [cursor=pointer]
          - button "Frame selection" [ref=e95] [cursor=pointer]
          - group [ref=e96]:
            - generic "Local clipboard" [ref=e97] [cursor=pointer]
          - group [ref=e98]:
            - generic "Structures" [ref=e99] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e100]:
          - button "Vertex" [ref=e101] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e102] [cursor=pointer]
        - generic [ref=e103]:
          - button "Add Node" [ref=e104] [cursor=pointer]
          - button "Browse nodes" [ref=e107] [cursor=pointer]
          - button "Up" [disabled] [ref=e110]
          - button "Shortcuts" [ref=e113] [cursor=pointer]
    - complementary [ref=e116]:
      - generic [ref=e117]:
        - heading "Inspector" [level=2] [ref=e118]
        - paragraph [ref=e119]: Compose
        - button "Rename node" [ref=e120] [cursor=pointer]
        - generic [ref=e121]:
          - generic [ref=e123]:
            - generic [ref=e124]: Shape
            - combobox "Shape" [ref=e125]:
              - option "vec2"
              - option "vec3"
              - option "RGBA (vec4)" [selected]
          - generic [ref=e127]:
            - generic [ref=e128]: R / X
            - textbox "R / X" [ref=e129]: "0"
            - alert [ref=e130]: Connected input — local value retained.
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
        - generic [ref=e144]:
          - text: From Multiply
          - button "Disconnect" [ref=e145] [cursor=pointer]
  - contentinfo [ref=e146]:
    - button "Project actions" [ref=e147] [cursor=pointer]
    - status [ref=e148]:
      - button "Read full application status" [disabled] [ref=e149]
    - button "Shader output" [ref=e150] [cursor=pointer]
    - generic [ref=e151]:
      - button "Experimental features" [ref=e153] [cursor=pointer]
      - generic [ref=e154]: Panel · Canvas · UI-only · visible
      - button "Read object details" [ref=e155] [cursor=pointer]
    - button "Hints" [ref=e156] [cursor=pointer]
```

# Test source

```ts
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
  493 |     await page.getByRole("button", { name: a, exact: true }).click();
> 494 |     await page.getByRole("button", { name: b, exact: true }).click();
      |                                                              ^ Error: locator.click: Test timeout of 30000ms exceeded.
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