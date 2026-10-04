# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-connection-view.spec.ts >> S06 subthreshold port release outside the button leaves no orphan wire or History
- Location: ..\..\..\production\tests\browser\s06-connection-view.spec.ts:393:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.canvas').last().locator('.connection-preview path')
Expected: 0
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('.canvas').last().locator('.connection-preview path')
    14 × locator resolved to 1 element
       - unexpected value "1"

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
  - status [ref=e46]: Export started. Saved status is unchanged.
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
            - group "Color RGBA" [ref=e67]:
              - heading "Color RGBA" [level=3] [ref=e68]
              - generic [ref=e69]:
                - button "Color RGBA output out" [active] [ref=e70] [cursor=pointer]:
                  - generic [ref=e71]: out
                - generic [ref=e73]: vec4
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
        - paragraph [ref=e105]: Color RGBA
        - button "Rename node" [ref=e106] [cursor=pointer]
        - generic [ref=e109]:
          - generic [ref=e110]: Value
          - generic [ref=e111]:
            - text: R
            - textbox "R" [ref=e112]: "0.55"
          - generic [ref=e113]:
            - text: G
            - textbox "G" [ref=e114]: "0.28"
          - generic [ref=e115]:
            - text: B
            - textbox "B" [ref=e116]: "0.9"
          - generic [ref=e117]:
            - text: A
            - textbox "A" [ref=e118]: "1"
          - alert
  - generic [ref=e120]:
    - heading "Shader output" [level=2] [ref=e121]
    - paragraph [ref=e122]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e123]:
      - listitem [ref=e124]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e125] [cursor=pointer]
  - contentinfo [ref=e126]:
    - generic [ref=e127]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e128]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  302 |   const hovered = await rows.nth(1).getAttribute("data-key");
  303 |   await search.press("ArrowDown");
  304 |   expect(
  305 |     await dialog.locator(".catalog-row.current").getAttribute("data-key"),
  306 |   ).not.toBe(hovered);
  307 |   await rows.nth(0).hover();
  308 |   await expect(rows.nth(0)).toHaveClass(/current/);
  309 |   await rows.nth(0).getByRole("button").first().click();
  310 |   await expect(dialog.locator(".catalog-detail")).toBeVisible();
  311 |   await page.screenshot({
  312 |     path: path.join(process.env.GRAPE_EVIDENCE_DIR!, "catalog-hover.png"),
  313 |   });
  314 |   await page.keyboard.press("Escape");
  315 |   expect(await doc(page)).toEqual(before);
  316 | });
  317 | 
  318 | test("S06 public port drag both directions commits once and cancelled held release adds no History", async ({
  319 |   page,
  320 | }) => {
  321 |   const { c, out, input } = await color(page),
  322 |     before = await doc(page);
  323 |   for (const [from, to] of [
  324 |     [out, input],
  325 |     [input, out],
  326 |   ]) {
  327 |     const a = await center(from),
  328 |       b = await center(to);
  329 |     await page.mouse.move(a.x, a.y);
  330 |     await page.mouse.down();
  331 |     await page.mouse.move(b.x, b.y, { steps: 9 });
  332 |     await expect(c.locator(".connection-preview path")).toHaveCount(1);
  333 |     await page.mouse.up();
  334 |     await expect(c.locator(".connection-preview path")).toHaveCount(0);
  335 |     await expect(c.locator(".canvas-notice")).toBeEmpty();
  336 |     const after = await doc(page);
  337 |     expect(
  338 |       after.graph.stages.find((s: any) => s.key === "pixel").network.edges,
  339 |     ).toHaveLength(1);
  340 |     await clickAction(page, "Undo");
  341 |     expect(await doc(page)).toEqual(before);
  342 |     await clickAction(page, "Redo");
  343 |     expect(await doc(page)).toEqual(after);
  344 |     await clickAction(page, "Undo");
  345 |   }
  346 |   const a = await center(out),
  347 |     b = await center(input);
  348 |   await page.mouse.move(a.x, a.y);
  349 |   await page.mouse.down();
  350 |   await page.mouse.move(b.x, b.y, { steps: 7 });
  351 |   await page.keyboard.press("Escape");
  352 |   await page.mouse.up();
  353 |   await expect(c.locator(".connection-preview path")).toHaveCount(0);
  354 |   expect(await doc(page)).toEqual(before);
  355 |   await out.click();
  356 |   await input.click();
  357 |   expect(
  358 |     (await doc(page)).graph.stages.find((s: any) => s.key === "pixel").network
  359 |       .edges,
  360 |   ).toHaveLength(1);
  361 | });
  362 | 
  363 | test("S06 pending connection expires on shared revision and new load without stale endpoint reuse", async ({
  364 |   page,
  365 | }) => {
  366 |   const { c, out, input } = await color(page);
  367 |   await clickAction(page, "Second Canvas");
  368 |   const first = page.locator(".canvas").first(),
  369 |     second = page.locator(".canvas").last(),
  370 |     firstOut = first.locator('[data-direction="output"][data-port="out"]');
  371 |   await firstOut.click();
  372 |   await second
  373 |     .getByRole("heading", { name: "Color RGBA", exact: true })
  374 |     .click();
  375 |   const field = page.getByRole("textbox", { name: "R", exact: true });
  376 |   await field.fill("0.4");
  377 |   await field.press("Enter");
  378 |   await expect(first.locator(".connection-preview path")).toHaveCount(0);
  379 |   await expect(first.locator(".canvas-notice")).toBeEmpty();
  380 |   const changed = await doc(page);
  381 |   await first.locator('[data-direction="input"][data-port="color"]').click();
  382 |   expect(await doc(page)).toEqual(changed);
  383 |   await page.keyboard.press("Escape");
  384 |   await firstOut.click();
  385 |   const old = await first.elementHandle();
  386 |   page.once("dialog", (d) => d.accept());
  387 |   await clickAction(page, "New document");
  388 |   expect(await old!.evaluate((e) => e.isConnected)).toBe(false);
  389 |   await expect(page.locator(".connection-preview path")).toHaveCount(0);
  390 |   await expect(page.locator(".canvas-notice")).toBeEmpty();
  391 | });
  392 | 
  393 | test("S06 subthreshold port release outside the button leaves no orphan wire or History", async ({ page }) => {
  394 |   const { c, out } = await color(page), before = await doc(page);
  395 |   const r = (await out.boundingBox())!;
  396 |   const x = r.x + r.width / 2, y = r.y + 0.5;
  397 |   await page.mouse.move(x, y);
  398 |   await page.mouse.down();
  399 |   await page.mouse.move(x, y - 3, { steps: 2 });
  400 |   await expect(c.locator(".connection-preview path")).toHaveCount(1);
  401 |   await page.mouse.up();
> 402 |   await expect(c.locator(".connection-preview path")).toHaveCount(0);
      |                                                       ^ Error: expect(locator).toHaveCount(expected) failed
  403 |   await expect(c.locator(".canvas-notice")).toBeEmpty();
  404 |   expect(await doc(page)).toEqual(before);
  405 |   await clickAction(page, "Undo");
  406 |   await expect(c.getByRole("heading", { name: "Color RGBA", exact: true })).toHaveCount(0);
  407 | });
  408 | 
```