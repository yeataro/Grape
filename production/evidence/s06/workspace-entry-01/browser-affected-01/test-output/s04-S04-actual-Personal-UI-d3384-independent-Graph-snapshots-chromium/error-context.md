# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s04.spec.ts >> S04 actual Personal UI saves relists imports downloads and inserts independent Graph snapshots
- Location: ..\..\..\production\tests\browser\s04.spec.ts:356:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Personal Library', exact: true })

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
            - group "Image output" [ref=e61]:
              - heading "Image output" [level=3] [ref=e62]
              - generic [ref=e63]:
                - button "Image output input color" [ref=e64] [cursor=pointer]:
                  - generic [ref=e66]: color
                - generic [ref=e67]: vec4
            - group "Float" [ref=e68]:
              - heading "Float" [level=3] [ref=e69]
              - generic [ref=e70]:
                - button "Float output value" [ref=e71] [cursor=pointer]:
                  - generic [ref=e72]: value
                - generic [ref=e74]: float
            - group "Subgraph" [ref=e75]:
              - heading "Subgraph" [level=3] [ref=e76]
              - generic [ref=e77]:
                - button "Subgraph input Value" [ref=e78] [cursor=pointer]:
                  - generic [ref=e80]: Value
                - generic [ref=e81]: vec4
              - generic [ref=e82]:
                - button "Subgraph output Value" [ref=e83] [cursor=pointer]:
                  - generic [ref=e84]: Value
                - generic [ref=e86]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e87]:
          - button "New subgraph" [active] [ref=e88] [cursor=pointer]
          - button "Library subgraph" [ref=e89] [cursor=pointer]
          - button "Encapsulate" [ref=e90] [cursor=pointer]
          - button "Make independent" [ref=e91] [cursor=pointer]
          - button "Enter subgraph" [ref=e92] [cursor=pointer]
          - button "Arrange nodes" [ref=e93] [cursor=pointer]
          - button "Frame selection" [ref=e94] [cursor=pointer]
          - group [ref=e95]:
            - generic "Local clipboard" [ref=e96] [cursor=pointer]
          - group [ref=e97]:
            - generic "Structures" [ref=e98] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e99]:
          - button "Vertex" [ref=e100] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e101] [cursor=pointer]
        - generic [ref=e102]:
          - button "Add Node" [ref=e103] [cursor=pointer]
          - button "Browse nodes" [ref=e106] [cursor=pointer]
          - button "Up" [disabled] [ref=e109]
          - button "Shortcuts" [ref=e112] [cursor=pointer]
    - complementary [ref=e115]:
      - generic [ref=e116]:
        - heading "Inspector" [level=2] [ref=e117]
        - paragraph [ref=e118]: Subgraph
        - button "Rename node" [ref=e119] [cursor=pointer]
        - generic [ref=e122]:
          - generic [ref=e123]: Value
          - textbox "Value" [ref=e124]: "[1,1,1,1]"
          - alert
  - generic [ref=e126]:
    - heading "Shader output" [level=2] [ref=e127]
    - paragraph [ref=e128]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics"
  - contentinfo [ref=e129]:
    - generic [ref=e130]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e131]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  270 |     }
  271 |     return {
  272 |       saved,
  273 |       same,
  274 |       listed: listed.items.map((x) => x.name),
  275 |       issues: listed.issues,
  276 |       race,
  277 |       count,
  278 |       fullReuse,
  279 |       unchanged,
  280 |       budget,
  281 |       single,
  282 |       totalBytes: (await total.list()).reduce(
  283 |         (n, f) => n + new TextEncoder().encode(f.text).length,
  284 |         0,
  285 |       ),
  286 |     };
  287 |   });
  288 |   expect(result.saved.name).toBe("Portable_array_2.sgrape-function.json");
  289 |   expect(result.same.reused).toBe(true);
  290 |   expect(result.race.sort()).toEqual(["created", "exists"]);
  291 |   expect(result.count).toBe("PERSONAL_FILE_LIMIT");
  292 |   expect(result.budget).toBe("PERSONAL_TOTAL_SIZE");
  293 |   expect(result.single).toBe("PERSONAL_SIZE");
  294 |   expect(result.totalBytes).toBe(4000000);
  295 |   expect(result.fullReuse.reused && result.unchanged).toBe(true);
  296 |   expect(result.issues).toHaveLength(1);
  297 |   await fs.writeFile(
  298 |     evidence + "/s04-provider.json",
  299 |     JSON.stringify(result, null, 2),
  300 |   );
  301 | });
  302 | 
  303 | async function exported(page: any) {
  304 |   const event = page.waitForEvent("download");
  305 |   await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  306 |   return JSON.parse(await fs.readFile((await (await event).path())!, "utf8"));
  307 | }
  308 | test("S04 DEC002 actual Canvas four shapes to current ImageOutput and edge identity Undo Redo", async ({
  309 |   page,
  310 | }) => {
  311 |   const rows = [];
  312 |   for (const shape of ["float", "vec2", "vec3", "vec4"]) {
  313 |     await page.goto("/");
  314 |     const name = shape === "float" ? "Float" : "Compose";
  315 |     await createNode(page, name);
  316 |     if (shape === "vec2" || shape === "vec3")
  317 |       await page.locator('[data-parameter="mode"]').selectOption(shape);
  318 |     await page
  319 |       .getByRole("button", {
  320 |         name: name + " output " + (shape === "float" ? "value" : "result"),
  321 |         exact: true,
  322 |       })
  323 |       .click();
  324 |     await page
  325 |       .getByRole("button", { name: "Image output input color", exact: true })
  326 |       .click();
  327 |     await expect(page.locator(".wires [data-edge]")).toHaveCount(1);
  328 |     const edge = await page
  329 |       .locator(".wires [data-edge]")
  330 |       .getAttribute("data-edge");
  331 |     await page
  332 |       .getByRole("button", { name: "Generate GLSL", exact: true })
  333 |       .click();
  334 |     await expect(page.getByLabel("Generated GLSL")).toContainText("fragColor");
  335 |     const document = await exported(page);
  336 |     expect(document.formatVersion).toEqual({ major: 2, minor: 1 });
  337 |     const plan = document.graph.stages.find((s: any) => s.key === "pixel")
  338 |       .network.edges[0].adaptation;
  339 |     await page.getByRole("button", { name: "Undo", exact: true }).click();
  340 |     await expect(page.locator(".wires [data-edge]")).toHaveCount(0);
  341 |     await page.getByRole("button", { name: "Redo", exact: true }).click();
  342 |     await expect(page.locator(".wires [data-edge]")).toHaveAttribute(
  343 |       "data-edge",
  344 |       edge!,
  345 |     );
  346 |     const redo = await exported(page);
  347 |     expect(redo.graph).toEqual(document.graph);
  348 |     rows.push({ shape, edge, plan, document });
  349 |   }
  350 |   await page.screenshot({ path: evidence + "/s04-canvas.png", fullPage: true });
  351 |   await fs.writeFile(
  352 |     evidence + "/s04-canvas-four.json",
  353 |     JSON.stringify(rows, null, 2),
  354 |   );
  355 | });
  356 | test("S04 actual Personal UI saves relists imports downloads and inserts independent Graph snapshots", async ({
  357 |   page,
  358 | }) => {
  359 |   await page.goto("/");
  360 |   await createNode(page, "Float");
  361 |   await page
  362 |     .getByRole("button", { name: "Float output value", exact: true })
  363 |     .click();
  364 |   await page
  365 |     .getByRole("button", { name: "Image output input color", exact: true })
  366 |     .click();
  367 |   await page.getByRole("button", { name: "New subgraph", exact: true }).click();
  368 |   await page
  369 |     .getByRole("button", { name: "Personal Library", exact: true })
> 370 |     .click();
      |      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  371 |   await page
  372 |     .getByRole("button", { name: "Save selected subgraph", exact: true })
  373 |     .click();
  374 |   await expect(page.locator('dialog[open] [role="status"]')).toContainText(
  375 |     "Saved",
  376 |   );
  377 |   const download = page.waitForEvent("download");
  378 |   await page
  379 |     .getByRole("button", { name: "Export Subgraph", exact: true })
  380 |     .click();
  381 |   const text = await fs.readFile((await (await download).path())!, "utf8");
  382 |   await page
  383 |     .getByLabel("Import Personal package")
  384 |     .setInputFiles({
  385 |       name: "again.sgrape-function.json",
  386 |       mimeType: "application/json",
  387 |       buffer: Buffer.from(text),
  388 |     });
  389 |   await expect(page.locator("[data-personal-file]")).toHaveCount(1);
  390 |   await page
  391 |     .getByRole("button", { name: "Insert Subgraph", exact: true })
  392 |     .click();
  393 |   await expect(page.locator("dialog[open]")).toHaveCount(0);
  394 |   const once = await exported(page);
  395 |   await page
  396 |     .getByRole("button", { name: "Personal Library", exact: true })
  397 |     .click();
  398 |   await page
  399 |     .getByRole("button", { name: "Insert Subgraph", exact: true })
  400 |     .click();
  401 |   const twice = await exported(page);
  402 |   expect(twice.graph.resources).toEqual(once.graph.resources);
  403 |   await page
  404 |     .getByRole("button", { name: "Make independent", exact: true })
  405 |     .click();
  406 |   const independent = await exported(page);
  407 |   expect(independent.graph.resources.length).toBe(
  408 |     twice.graph.resources.length + 1,
  409 |   );
  410 |   await page.getByRole("button", { name: "Undo", exact: true }).click();
  411 |   expect((await exported(page)).graph).toEqual(twice.graph);
  412 |   await page
  413 |     .getByRole("button", { name: "Personal Library", exact: true })
  414 |     .click();
  415 |   await page
  416 |     .getByLabel("Import Personal package")
  417 |     .setInputFiles({
  418 |       name: "bad.sgrape-function.json",
  419 |       mimeType: "application/json",
  420 |       buffer: Buffer.from('{"bad":true}'),
  421 |     });
  422 |   await expect(page.locator('dialog[open] [role="status"]')).toContainText(
  423 |     "PERSONAL_FORMAT",
  424 |   );
  425 |   await expect(page.locator("[data-personal-file]")).toHaveCount(1);
  426 |   await page
  427 |     .getByRole("button", { name: "Close Personal", exact: true })
  428 |     .click();
  429 |   expect((await exported(page)).graph).toEqual(twice.graph);
  430 |   await page.reload();
  431 |   await page
  432 |     .getByRole("button", { name: "Personal Library", exact: true })
  433 |     .click();
  434 |   await expect(page.locator("[data-personal-file]")).toHaveCount(1);
  435 |   await page.screenshot({
  436 |     path: evidence + "/s04-personal-ui.png",
  437 |     fullPage: true,
  438 |   });
  439 |   await fs.writeFile(
  440 |     evidence + "/s04-personal-ui.json",
  441 |     JSON.stringify(
  442 |       { asset: JSON.parse(text), once, twice, independent },
  443 |       null,
  444 |       2,
  445 |     ),
  446 |   );
  447 | });
  448 | 
  449 | test("S04 DEC004 browser hash-valid missing dependency scope cycle and module candidates reject atomically", async ({
  450 |   page,
  451 | }) => {
  452 |   await page.goto("/");
  453 |   const result = await page.evaluate(async () => {
  454 |     const { arrayFixture, nestedArrayFixture, currentSetup } =
  455 |         await import("/tests/fixtures/s04.ts"),
  456 |       { buildPersonal } = await import("/src/application/personal.ts"),
  457 |       { probeDefinitions } = await import("/src/modules/package-probe.ts"),
  458 |       { esProfile } = await import("/src/modules/image.ts"),
  459 |       { currentImageKind } = await import("/src/modules/image-current.ts"),
  460 |       { EditorApplication } = await import("/src/application/editor.ts"),
  461 |       { MemoryStorage } = await import("/tests/fixtures/setup.ts");
  462 |     const source = arrayFixture("source"),
  463 |       input = arrayFixture("input"),
  464 |       nested = nestedArrayFixture(),
  465 |       fixtures = [source, input, nested],
  466 |       assets = await Promise.all(
  467 |         fixtures.map((s) =>
  468 |           buildPersonal(
  469 |             s.graph.capture(),
  470 |             s.fixed,
```