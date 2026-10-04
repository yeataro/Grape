# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s01.spec.ts >> N1 browser: middle/right movement cannot edit nodes; primary drag still groups into one Undo
- Location: ..\..\..\production\tests\browser\s01.spec.ts:535:1

# Error details

```
Error: locator.getAttribute: Error: strict mode violation: locator('.node').filter({ has: locator('h3').filter({ hasText: /^Float$/ }) }) resolved to 2 elements:
    1) <article tabindex="0" role="group" aria-label="Float" class="node selected" aria-description="Selected" data-node="f1de1a29-ad4d-44d6-9600-eb769be9350b">…</article> aka getByRole('group', { name: 'Float' })
    2) <article hidden="" class="node creation-preview">…</article> aka getByText('FloatValue · glsl.float')

Call log:
  - waiting for locator('.node').filter({ has: locator('h3').filter({ hasText: /^Float$/ }) })

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
      - generic [ref=e44]: Saved
      - generic [ref=e45]: Host-free
  - status [ref=e46]: Saved to this browser.
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
            - group "Image output" [ref=e60]:
              - heading "Image output" [level=3] [ref=e61]
              - generic [ref=e62]:
                - button "Image output input color" [ref=e63] [cursor=pointer]:
                  - generic [ref=e65]: color
                - generic [ref=e66]: vec4
            - group "Float" [ref=e67]:
              - heading "Float" [level=3] [ref=e68]
              - generic [ref=e69]:
                - button "Float output value" [ref=e70] [cursor=pointer]:
                  - generic [ref=e71]: value
                - generic [ref=e73]: float
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e74]:
          - button "New subgraph" [ref=e75] [cursor=pointer]
          - button "Library subgraph" [ref=e76] [cursor=pointer]
          - button "Encapsulate" [ref=e77] [cursor=pointer]
          - button "Make independent" [ref=e78] [cursor=pointer]
          - button "Enter subgraph" [ref=e79] [cursor=pointer]
          - button "Arrange nodes" [ref=e80] [cursor=pointer]
          - button "Frame selection" [ref=e81] [cursor=pointer]
          - group [ref=e82]:
            - generic "Local clipboard" [ref=e83] [cursor=pointer]
          - group [ref=e84]:
            - generic "Structures" [ref=e85] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e86]:
          - button "Vertex" [ref=e87] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e88] [cursor=pointer]
        - generic [ref=e89]:
          - button "Add Node" [ref=e90] [cursor=pointer]
          - button "Browse nodes" [ref=e93] [cursor=pointer]
          - button "Up" [disabled] [ref=e96]
          - button "Shortcuts" [ref=e99] [cursor=pointer]
    - complementary [ref=e102]:
      - generic [ref=e103]:
        - heading "Inspector" [level=2] [ref=e104]
        - paragraph [ref=e105]: Float
        - button "Rename node" [ref=e106] [cursor=pointer]
        - generic [ref=e109]:
          - generic [ref=e110]: Value
          - textbox "Value" [ref=e111]: "0.25"
          - alert
  - generic [ref=e113]:
    - heading "Shader output" [level=2] [ref=e114]
    - paragraph [ref=e115]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e116]:
      - listitem [ref=e117]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e118] [cursor=pointer]
  - contentinfo [ref=e119]:
    - generic [ref=e120]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e121]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
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
  466 |     .click();
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
> 544 |   const position = await card.getAttribute("style"),
      |                               ^ Error: locator.getAttribute: Error: strict mode violation: locator('.node').filter({ has: locator('h3').filter({ hasText: /^Float$/ }) }) resolved to 2 elements:
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
  567 |   await page.getByRole("button", { name: "Undo", exact: true }).click();
  568 |   await expect(card).toHaveAttribute("style", position!);
  569 |   await expect(page.locator("#save-state")).toHaveText("Saved");
  570 | });
  571 | 
```