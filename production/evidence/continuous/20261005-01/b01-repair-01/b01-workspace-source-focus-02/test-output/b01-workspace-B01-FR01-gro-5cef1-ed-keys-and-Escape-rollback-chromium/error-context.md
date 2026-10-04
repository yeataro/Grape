# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: b01-workspace.spec.ts >> B01 FR01 group separator retains native focus through repeated keys and Escape rollback
- Location: ..\..\production\tests\browser\b01-workspace.spec.ts:475:1

# Error details

```
Error: expect(received).toBeCloseTo(expected, precision)

Expected: 419.5
Received: 416.50000000000006

Expected precision:    4
Expected difference: < 0.00005
Received difference:   2.999999999999943
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
    - generic [ref=e32]:
      - generic [ref=e33]:
        - tablist "canvas-1 panels" [ref=e34]:
          - tab "Canvas · canvas-1" [selected] [ref=e35] [cursor=pointer]
          - generic [ref=e36]:
            - button "Collapse active panel in canvas-1" [ref=e37] [cursor=pointer]: ▾
            - button "Panel options in canvas-1" [ref=e38] [cursor=pointer]: ⋯
        - generic "Shader graph canvas" [ref=e41]:
          - generic:
            - generic:
              - generic:
                - group "Image output" [ref=e42]:
                  - heading "Image output" [level=3] [ref=e43]
                  - generic [ref=e44]:
                    - button "Image output input color" [ref=e45] [cursor=pointer]
                    - generic [ref=e46]: color
                    - generic [ref=e47]: vec4
                    - generic "Current local value; edit in Inspector" [ref=e48]: "[0,0,0,0]"
                - group "Float" [ref=e49]:
                  - heading "Float" [level=3] [ref=e50]
                  - generic [ref=e51]:
                    - button "Float output value" [ref=e52] [cursor=pointer]
                    - generic [ref=e53]: value
                    - generic [ref=e54]: float
          - generic:
            - button "Untitled shader / pixel" [disabled]
          - generic [ref=e55]:
            - button "New subgraph" [ref=e56] [cursor=pointer]
            - button "Library subgraph" [ref=e57] [cursor=pointer]
            - button "Encapsulate" [ref=e58] [cursor=pointer]
            - button "Make independent" [ref=e59] [cursor=pointer]
            - button "Enter subgraph" [ref=e60] [cursor=pointer]
            - button "Arrange nodes" [ref=e61] [cursor=pointer]
            - button "Frame selection" [ref=e62] [cursor=pointer]
            - group [ref=e63]:
              - generic "Local clipboard" [ref=e64] [cursor=pointer]
            - group [ref=e65]:
              - generic "Structures" [ref=e66] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=e67]:
            - button "Vertex" [ref=e68] [cursor=pointer]
            - button "Pixel" [pressed] [ref=e69] [cursor=pointer]
          - generic [ref=e70]:
            - button "Add Node" [ref=e71] [cursor=pointer]
            - button "Browse nodes" [ref=e74] [cursor=pointer]
            - button "Up" [disabled] [ref=e77]
            - button "Shortcuts" [ref=e80] [cursor=pointer]
      - separator "Resize canvas-1 and canvas-2" [active] [ref=e83]
      - generic [ref=e84]:
        - tablist "canvas-2 panels" [ref=e85]:
          - tab "Canvas · canvas-2" [selected] [ref=e86] [cursor=pointer]
          - generic [ref=e87]:
            - button "Collapse active panel in canvas-2" [ref=e88] [cursor=pointer]: ▾
            - button "Panel options in canvas-2" [ref=e89] [cursor=pointer]: ⋯
        - generic "Shader graph canvas" [ref=e92]:
          - generic:
            - generic:
              - generic:
                - group "Image output" [ref=e93]:
                  - heading "Image output" [level=3] [ref=e94]
                  - generic [ref=e95]:
                    - button "Image output input color" [ref=e96] [cursor=pointer]
                    - generic [ref=e97]: color
                    - generic [ref=e98]: vec4
                    - generic "Current local value; edit in Inspector" [ref=e99]: "[0,0,0,0]"
                - group "Float" [ref=e100]:
                  - heading "Float" [level=3] [ref=e101]
                  - generic [ref=e102]:
                    - button "Float output value" [ref=e103] [cursor=pointer]
                    - generic [ref=e104]: value
                    - generic [ref=e105]: float
          - generic:
            - button "Untitled shader / pixel" [disabled]
          - generic [ref=e106]:
            - button "New subgraph" [ref=e107] [cursor=pointer]
            - button "Library subgraph" [ref=e108] [cursor=pointer]
            - button "Encapsulate" [ref=e109] [cursor=pointer]
            - button "Make independent" [ref=e110] [cursor=pointer]
            - button "Enter subgraph" [ref=e111] [cursor=pointer]
            - button "Arrange nodes" [ref=e112] [cursor=pointer]
            - button "Frame selection" [ref=e113] [cursor=pointer]
            - group [ref=e114]:
              - generic "Local clipboard" [ref=e115] [cursor=pointer]
            - group [ref=e116]:
              - generic "Structures" [ref=e117] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=e118]:
            - button "Vertex" [ref=e119] [cursor=pointer]
            - button "Pixel" [pressed] [ref=e120] [cursor=pointer]
          - generic [ref=e121]:
            - button "Add Node" [ref=e122] [cursor=pointer]
            - button "Browse nodes" [ref=e125] [cursor=pointer]
            - button "Up" [disabled] [ref=e128]
            - button "Shortcuts" [ref=e131] [cursor=pointer]
    - complementary [ref=e134]:
      - generic [ref=e135]:
        - tablist "inspector panels" [ref=e136]:
          - tab "Inspector · inspector" [selected] [ref=e137] [cursor=pointer]
          - generic [ref=e138]:
            - button "Collapse active panel in inspector" [ref=e139] [cursor=pointer]: ▾
            - button "Panel options in inspector" [ref=e140] [cursor=pointer]: ⋯
        - generic [ref=e143]:
          - heading "Inspector" [level=2] [ref=e144]
          - paragraph [ref=e145]: Select a node to inspect its parameters.
    - separator "right sidebar width" [ref=e146]
  - contentinfo [ref=e147]:
    - button "Project actions" [ref=e148] [cursor=pointer]
    - status [ref=e149]:
      - button "Read full application status" [ref=e150] [cursor=pointer]: Current layout exported.
    - button "Shader output" [ref=e151] [cursor=pointer]
    - button "Panels" [ref=e152] [cursor=pointer]
    - button "Hints" [ref=e153] [cursor=pointer]
```

# Test source

```ts
  398 |     e.dispatchEvent(new Event("input", { bubbles: true }));
  399 |     e.dispatchEvent(
  400 |       new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
  401 |     );
  402 |   });
  403 |   expect(await download(p, "Export JSON")).toEqual(before);
  404 |   await field(p).dispatchEvent("compositionend", { data: "" });
  405 |   await field(p).press("Escape");
  406 |   await option(p, "pane-1", "Close panel");
  407 |   await old!.evaluate((e) =>
  408 |     e.dispatchEvent(new Event("change", { bubbles: true })),
  409 |   );
  410 |   expect(await download(p, "Export JSON")).toEqual(before);
  411 |   save("synthetic-composition-lifetime", {
  412 |     synthetic: true,
  413 |     physicalIME: false,
  414 |     oldDetachedCallbackNoModelChange: true,
  415 |   });
  416 | });
  417 | test("B01 readonly presentation placement remains available and F2 is Panel scoped after moves", async ({
  418 |   page: p,
  419 | }) => {
  420 |   await setup(p);
  421 |   await clickAction(p, "Lock editing");
  422 |   const before = await download(p, "Export JSON");
  423 |   await option(p, "inspector", "Float Parameters");
  424 |   await expect(field(p)).toHaveAttribute("readonly", "");
  425 |   await field(p).click();
  426 |   await p.keyboard.press("F2");
  427 |   await expect(
  428 |     p.getByRole("dialog", { name: "Object information", exact: true }),
  429 |   ).toBeVisible();
  430 |   await expect(
  431 |     p.getByRole("dialog", { name: "Object information", exact: true }),
  432 |   ).toContainText("Value");
  433 |   await p.keyboard.press("Escape");
  434 |   await p
  435 |     .getByRole("button", { name: "Return Parameters to dock", exact: true })
  436 |     .click();
  437 |   expect(await download(p, "Export JSON")).toEqual(before);
  438 | });
  439 | 
  440 | test("B01 float resize superseded by keyboard dock cleans old controls and narrow hide revokes field callbacks", async ({
  441 |   page: p,
  442 | }) => {
  443 |   await setup(p);
  444 |   const before = await download(p, "Export JSON");
  445 |   const errors: string[] = [];
  446 |   p.on("pageerror", (e) => errors.push(e.message));
  447 |   await option(p, "inspector", "Float Parameters");
  448 |   const divider = p.getByRole("separator", {
  449 |     name: "Parameters floating width",
  450 |     exact: true,
  451 |   });
  452 |   await divider.click();
  453 |   await p.keyboard.press("ArrowLeft");
  454 |   await p.keyboard.press("p");
  455 |   await expect(
  456 |     p.getByRole("button", { name: "Return Parameters to dock", exact: true }),
  457 |   ).toHaveCount(0);
  458 |   await expect(field(p)).toBeVisible();
  459 |   const old = await field(p).elementHandle();
  460 |   await p.setViewportSize({ width: 620, height: 800 });
  461 |   await expect(field(p)).toBeHidden();
  462 |   await old!.evaluate((e) => {
  463 |     (e as HTMLInputElement).value = "999";
  464 |     e.dispatchEvent(new Event("input", { bubbles: true }));
  465 |     e.dispatchEvent(
  466 |       new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
  467 |     );
  468 |   });
  469 |   await p.setViewportSize({ width: 1440, height: 1000 });
  470 |   await expect(field(p)).toBeVisible();
  471 |   expect(await download(p, "Export JSON")).toEqual(before);
  472 |   expect(errors).toEqual([]);
  473 | });
  474 | 
  475 | test("B01 FR01 group separator retains native focus through repeated keys and Escape rollback", async ({
  476 |   page: p,
  477 | }) => {
  478 |   await setup(p);
  479 |   await clickAction(p, "Second Canvas");
  480 |   const document = await download(p, "Export JSON"),
  481 |     layout = await download(p, "Export current layout");
  482 |   const divider = p.getByRole("separator", {
  483 |     name: "Resize canvas-1 and canvas-2",
  484 |     exact: true,
  485 |   });
  486 |   const original = await divider.elementHandle();
  487 |   const observations: unknown[] = [];
  488 |   await divider.click();
  489 |   const start = Number(await divider.getAttribute("aria-valuenow"));
  490 |   for (const [key, delta] of [
  491 |     ["ArrowDown", 8],
  492 |     ["ArrowDown", 16],
  493 |     ["Shift+ArrowDown", 48],
  494 |     ["ArrowUp", 40],
  495 |   ] as const) {
  496 |     await p.keyboard.press(key);
  497 |     await expect(divider).toBeFocused();
> 498 |     expect(Number(await divider.getAttribute("aria-valuenow"))).toBeCloseTo(
      |                                                                 ^ Error: expect(received).toBeCloseTo(expected, precision)
  499 |       start + delta,
  500 |       4,
  501 |     );
  502 |     expect(
  503 |       await original!.evaluate(
  504 |         (e) => e.isConnected && e === document.activeElement,
  505 |       ),
  506 |     ).toBe(true);
  507 |     observations.push({
  508 |       key,
  509 |       value: await divider.getAttribute("aria-valuenow"),
  510 |       focused: true,
  511 |     });
  512 |   }
  513 |   for (const key of ["Home", "End"]) {
  514 |     await p.keyboard.press(key);
  515 |     await expect(divider).toBeFocused();
  516 |     expect(Number(await divider.getAttribute("aria-valuenow"))).toBeCloseTo(
  517 |       Number(
  518 |         await divider.getAttribute(
  519 |           key === "Home" ? "aria-valuemin" : "aria-valuemax",
  520 |         ),
  521 |       ),
  522 |       4,
  523 |     );
  524 |     observations.push({
  525 |       key,
  526 |       value: await divider.getAttribute("aria-valuenow"),
  527 |       focused: true,
  528 |     });
  529 |   }
  530 |   await p.keyboard.press("Escape");
  531 |   await expect(divider).toBeFocused();
  532 |   expect(Number(await divider.getAttribute("aria-valuenow"))).toBeCloseTo(
  533 |     start,
  534 |     4,
  535 |   );
  536 |   expect(await download(p, "Export current layout")).toEqual(layout);
  537 |   expect(await download(p, "Export JSON")).toEqual(document);
  538 |   save("fr01-keyboard", {
  539 |     observations,
  540 |     start,
  541 |     rollback: true,
  542 |     syntheticFocus: false,
  543 |   });
  544 |   await p.screenshot({ path: path.join(evidence, "fr01-keyboard.png") });
  545 | });
  546 | 
  547 | test("B01 FR01 group separator trusted drag commits and Escape cancels without losing capture", async ({
  548 |   page: p,
  549 | }) => {
  550 |   await setup(p);
  551 |   await clickAction(p, "Second Canvas");
  552 |   const before = await download(p, "Export JSON"),
  553 |     initial = await download(p, "Export current layout");
  554 |   const divider = p.getByRole("separator", {
  555 |     name: "Resize canvas-1 and canvas-2",
  556 |     exact: true,
  557 |   });
  558 |   const trace: unknown[] = [];
  559 |   const start = Number(await divider.getAttribute("aria-valuenow"));
  560 |   let box = (await divider.boundingBox())!;
  561 |   await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  562 |   await p.mouse.down();
  563 |   for (const dy of [10, 30, 50, 70]) {
  564 |     await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + dy, {
  565 |       steps: 5,
  566 |     });
  567 |     expect(Number(await divider.getAttribute("aria-valuenow"))).toBeCloseTo(
  568 |       start + dy,
  569 |       2,
  570 |     );
  571 |     await expect(divider).toBeFocused();
  572 |     trace.push({ dy, value: await divider.getAttribute("aria-valuenow") });
  573 |   }
  574 |   await p.mouse.up();
  575 |   const committed = await download(p, "Export current layout");
  576 |   expect(
  577 |     committed.panes.find((x: any) => x.id === "canvas-1").weight,
  578 |   ).toBeGreaterThan(1);
  579 |   box = (await divider.boundingBox())!;
  580 |   await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  581 |   await p.mouse.down();
  582 |   await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 45, {
  583 |     steps: 12,
  584 |   });
  585 |   await p.keyboard.press("Escape");
  586 |   await p.mouse.up();
  587 |   expect(await download(p, "Export current layout")).toEqual(committed);
  588 |   await divider.dblclick();
  589 |   expect(await download(p, "Export current layout")).toEqual(initial);
  590 |   expect(await download(p, "Export JSON")).toEqual(before);
  591 |   save("fr01-pointer", {
  592 |     trace,
  593 |     initial,
  594 |     committed,
  595 |     cancelled: true,
  596 |     trustedPlaywrightMouse: true,
  597 |   });
  598 | });
```