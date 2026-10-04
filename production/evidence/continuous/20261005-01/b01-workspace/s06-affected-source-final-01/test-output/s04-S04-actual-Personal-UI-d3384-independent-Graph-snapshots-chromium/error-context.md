# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s04.spec.ts >> S04 actual Personal UI saves relists imports downloads and inserts independent Graph snapshots
- Location: ..\..\..\..\..\tests\browser\s04.spec.ts:357:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('dialog[open]')
Expected: 0
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('dialog[open]')
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
      - tablist "canvas-1 panels" [ref=e34]:
        - tab "Canvas · canvas-1" [selected] [ref=e35] [cursor=pointer]
        - generic [ref=e36]:
          - button "Collapse active panel in canvas-1" [ref=e37] [cursor=pointer]: ▾
          - button "Panel options in canvas-1" [ref=e38] [cursor=pointer]: ⋯
      - generic "Shader graph canvas" [ref=e41]:
        - generic:
          - generic:
            - img:
              - generic "Edge eb122fec-3784-4bbe-9abc-3e6c0c1528b9" [ref=e42]
            - generic:
              - group "Image output" [ref=e43]:
                - heading "Image output" [level=3] [ref=e44]
                - generic [ref=e45]:
                  - button "Image output input color" [ref=e46] [cursor=pointer]
                  - generic [ref=e47]: color
                  - generic [ref=e48]: vec4
              - group "Float" [ref=e49]:
                - heading "Float" [level=3] [ref=e50]
                - generic [ref=e51]:
                  - button "Float output value" [ref=e52] [cursor=pointer]
                  - generic [ref=e53]: value
                  - generic [ref=e54]: float
              - group "Subgraph" [ref=e55]:
                - heading "Subgraph" [level=3] [ref=e56]
                - generic [ref=e57]:
                  - button "Subgraph input Value" [ref=e58] [cursor=pointer]
                  - generic [ref=e59]: Value
                  - generic [ref=e60]: vec4
                  - generic "Current local value; edit in Inspector" [ref=e61]: "[1,1,1,1]"
                - generic [ref=e62]:
                  - button "Subgraph output Value" [ref=e63] [cursor=pointer]
                  - generic [ref=e64]: Value
                  - generic [ref=e65]: vec4
              - group "package-entry" [ref=e66]:
                - heading "Subgraph" [level=3] [ref=e67]
                - generic [ref=e69]:
                  - button "package-entry input Value" [ref=e70] [cursor=pointer]
                  - generic [ref=e71]: Value
                  - generic [ref=e72]: vec4
                  - generic "Current local value; edit in Inspector" [ref=e73]: "[1,1,1,1]"
                - generic [ref=e74]:
                  - button "package-entry output Value" [ref=e75] [cursor=pointer]
                  - generic [ref=e76]: Value
                  - generic [ref=e77]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e78]:
          - button "New subgraph" [ref=e79] [cursor=pointer]
          - button "Library subgraph" [ref=e80] [cursor=pointer]
          - button "Encapsulate" [ref=e81] [cursor=pointer]
          - button "Make independent" [ref=e82] [cursor=pointer]
          - button "Enter subgraph" [ref=e83] [cursor=pointer]
          - button "Arrange nodes" [ref=e84] [cursor=pointer]
          - button "Frame selection" [ref=e85] [cursor=pointer]
          - group [ref=e86]:
            - generic "Local clipboard" [ref=e87] [cursor=pointer]
          - group [ref=e88]:
            - generic "Structures" [ref=e89] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e90]:
          - button "Vertex" [ref=e91] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e92] [cursor=pointer]
        - generic [ref=e93]:
          - button "Add Node" [ref=e94] [cursor=pointer]
          - button "Browse nodes" [ref=e97] [cursor=pointer]
          - button "Up" [disabled] [ref=e100]
          - button "Shortcuts" [ref=e103] [cursor=pointer]
    - complementary [ref=e106]:
      - generic [ref=e107]:
        - tablist "inspector panels" [ref=e108]:
          - tab "Inspector · inspector" [selected] [ref=e109] [cursor=pointer]
          - generic [ref=e110]:
            - button "Collapse active panel in inspector" [ref=e111] [cursor=pointer]: ▾
            - button "Panel options in inspector" [ref=e112] [cursor=pointer]: ⋯
        - generic [ref=e115]:
          - heading "Inspector" [level=2] [ref=e116]
          - paragraph [ref=e117]: package-entry
          - button "Rename node" [ref=e118] [cursor=pointer]
          - generic [ref=e121]:
            - generic [ref=e122]: Value
            - textbox "Value" [ref=e123]: "[1,1,1,1]"
            - alert
    - separator "right sidebar width" [ref=e124]
  - contentinfo [ref=e125]:
    - button "Project actions" [expanded] [ref=e126] [cursor=pointer]
    - status [ref=e127]:
      - button "Read full application status" [disabled] [ref=e128]
    - button "Shader output" [ref=e129] [cursor=pointer]
    - button "Panels" [ref=e130] [cursor=pointer]
    - button "Hints" [ref=e131] [cursor=pointer]
  - menu "Project actions" [ref=e132]:
    - heading "Project actions" [level=2] [ref=e133]
    - generic [ref=e134]:
      - group "Documents and library" [ref=e135]:
        - menuitem "New document" [ref=e136] [cursor=pointer]
        - menuitem "Upgrade subgraph owners" [ref=e139] [cursor=pointer]
        - menuitem "Upgrade Image Output" [ref=e140] [cursor=pointer]
        - menuitem "Open saved" [ref=e141] [cursor=pointer]
        - menuitem "Export JSON" [ref=e144] [cursor=pointer]
        - menuitem "Export PNG" [ref=e147] [cursor=pointer]
        - menuitem "Open file" [ref=e150] [cursor=pointer]
        - menuitem "Personal Library" [active] [ref=e153] [cursor=pointer]
      - group "Workspace" [ref=e154]:
        - menuitem "Second Canvas" [ref=e155] [cursor=pointer]
        - menuitemcheckbox "Lock editing" [ref=e158] [cursor=pointer]
        - menuitem "Add Parameters" [ref=e161] [cursor=pointer]
        - menuitem "Save current layout" [ref=e162] [cursor=pointer]
        - menuitem "Restore current layout" [ref=e163] [cursor=pointer]
        - menuitem "Export current layout" [ref=e164] [cursor=pointer]
        - menuitem "Import current layout" [ref=e165] [cursor=pointer]
        - menuitem "Show hidden panels" [ref=e166] [cursor=pointer]
    - button "Close project actions" [ref=e167] [cursor=pointer]
```

# Test source

```ts
  290 |   expect(result.same.reused).toBe(true);
  291 |   expect(result.race.sort()).toEqual(["created", "exists"]);
  292 |   expect(result.count).toBe("PERSONAL_FILE_LIMIT");
  293 |   expect(result.budget).toBe("PERSONAL_TOTAL_SIZE");
  294 |   expect(result.single).toBe("PERSONAL_SIZE");
  295 |   expect(result.totalBytes).toBe(4000000);
  296 |   expect(result.fullReuse.reused && result.unchanged).toBe(true);
  297 |   expect(result.issues).toHaveLength(1);
  298 |   await fs.writeFile(
  299 |     evidence + "/s04-provider.json",
  300 |     JSON.stringify(result, null, 2),
  301 |   );
  302 | });
  303 | 
  304 | async function exported(page: any) {
  305 |   const event = page.waitForEvent("download");
  306 |   await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  307 |   return JSON.parse(await fs.readFile((await (await event).path())!, "utf8"));
  308 | }
  309 | test("S04 DEC002 actual Canvas four shapes to current ImageOutput and edge identity Undo Redo", async ({
  310 |   page,
  311 | }) => {
  312 |   const rows = [];
  313 |   for (const shape of ["float", "vec2", "vec3", "vec4"]) {
  314 |     await page.goto("/");
  315 |     const name = shape === "float" ? "Float" : "Compose";
  316 |     await createNode(page, name);
  317 |     if (shape === "vec2" || shape === "vec3")
  318 |       await page.locator('[data-parameter="mode"]').selectOption(shape);
  319 |     await page
  320 |       .getByRole("button", {
  321 |         name: name + " output " + (shape === "float" ? "value" : "result"),
  322 |         exact: true,
  323 |       })
  324 |       .click();
  325 |     await page
  326 |       .getByRole("button", { name: "Image output input color", exact: true })
  327 |       .click();
  328 |     await expect(page.locator(".wires [data-edge]")).toHaveCount(1);
  329 |     const edge = await page
  330 |       .locator(".wires [data-edge]")
  331 |       .getAttribute("data-edge");
  332 |     await page
  333 |       .getByRole("button", { name: "Generate GLSL", exact: true })
  334 |       .click();
  335 |     await expect(page.getByLabel("Generated GLSL")).toContainText("fragColor");
  336 |     const document = await exported(page);
  337 |     expect(document.formatVersion).toEqual({ major: 2, minor: 1 });
  338 |     const plan = document.graph.stages.find((s: any) => s.key === "pixel")
  339 |       .network.edges[0].adaptation;
  340 |     await page.getByRole("button", { name: "Undo", exact: true }).click();
  341 |     await expect(page.locator(".wires [data-edge]")).toHaveCount(0);
  342 |     await page.getByRole("button", { name: "Redo", exact: true }).click();
  343 |     await expect(page.locator(".wires [data-edge]")).toHaveAttribute(
  344 |       "data-edge",
  345 |       edge!,
  346 |     );
  347 |     const redo = await exported(page);
  348 |     expect(redo.graph).toEqual(document.graph);
  349 |     rows.push({ shape, edge, plan, document });
  350 |   }
  351 |   await page.screenshot({ path: evidence + "/s04-canvas.png", fullPage: true });
  352 |   await fs.writeFile(
  353 |     evidence + "/s04-canvas-four.json",
  354 |     JSON.stringify(rows, null, 2),
  355 |   );
  356 | });
  357 | test("S04 actual Personal UI saves relists imports downloads and inserts independent Graph snapshots", async ({
  358 |   page,
  359 | }) => {
  360 |   await page.goto("/");
  361 |   await createNode(page, "Float");
  362 |   await page
  363 |     .getByRole("button", { name: "Float output value", exact: true })
  364 |     .click();
  365 |   await page
  366 |     .getByRole("button", { name: "Image output input color", exact: true })
  367 |     .click();
  368 |   await page.getByRole("button", { name: "New subgraph", exact: true }).click();
  369 |   await clickAction(page, "Personal Library");
  370 |   await page
  371 |     .getByRole("button", { name: "Save selected subgraph", exact: true })
  372 |     .click();
  373 |   await expect(page.locator('dialog[open] [role="status"]')).toContainText(
  374 |     "Saved",
  375 |   );
  376 |   const download = page.waitForEvent("download");
  377 |   await page
  378 |     .getByRole("button", { name: "Export Subgraph", exact: true })
  379 |     .click();
  380 |   const text = await fs.readFile((await (await download).path())!, "utf8");
  381 |   await page.getByLabel("Import Personal package").setInputFiles({
  382 |     name: "again.sgrape-function.json",
  383 |     mimeType: "application/json",
  384 |     buffer: Buffer.from(text),
  385 |   });
  386 |   await expect(page.locator("[data-personal-file]")).toHaveCount(1);
  387 |   await page
  388 |     .getByRole("button", { name: "Insert Subgraph", exact: true })
  389 |     .click();
> 390 |   await expect(page.locator("dialog[open]")).toHaveCount(0);
      |                                              ^ Error: expect(locator).toHaveCount(expected) failed
  391 |   const once = await exported(page);
  392 |   await clickAction(page, "Personal Library");
  393 |   await page
  394 |     .getByRole("button", { name: "Insert Subgraph", exact: true })
  395 |     .click();
  396 |   const twice = await exported(page);
  397 |   expect(twice.graph.resources).toEqual(once.graph.resources);
  398 |   await page
  399 |     .getByRole("button", { name: "Make independent", exact: true })
  400 |     .click();
  401 |   const independent = await exported(page);
  402 |   expect(independent.graph.resources.length).toBe(
  403 |     twice.graph.resources.length + 1,
  404 |   );
  405 |   await page.getByRole("button", { name: "Undo", exact: true }).click();
  406 |   expect((await exported(page)).graph).toEqual(twice.graph);
  407 |   await clickAction(page, "Personal Library");
  408 |   await page.getByLabel("Import Personal package").setInputFiles({
  409 |     name: "bad.sgrape-function.json",
  410 |     mimeType: "application/json",
  411 |     buffer: Buffer.from('{"bad":true}'),
  412 |   });
  413 |   await expect(page.locator('dialog[open] [role="status"]')).toContainText(
  414 |     "PERSONAL_FORMAT",
  415 |   );
  416 |   await expect(page.locator("[data-personal-file]")).toHaveCount(1);
  417 |   await page
  418 |     .getByRole("button", { name: "Close Personal", exact: true })
  419 |     .click();
  420 |   expect((await exported(page)).graph).toEqual(twice.graph);
  421 |   await page.reload();
  422 |   await clickAction(page, "Personal Library");
  423 |   await expect(page.locator("[data-personal-file]")).toHaveCount(1);
  424 |   await page.screenshot({
  425 |     path: evidence + "/s04-personal-ui.png",
  426 |     fullPage: true,
  427 |   });
  428 |   await fs.writeFile(
  429 |     evidence + "/s04-personal-ui.json",
  430 |     JSON.stringify(
  431 |       { asset: JSON.parse(text), once, twice, independent },
  432 |       null,
  433 |       2,
  434 |     ),
  435 |   );
  436 | });
  437 | 
  438 | test("S04 DEC004 browser hash-valid missing dependency scope cycle and module candidates reject atomically", async ({
  439 |   page,
  440 | }) => {
  441 |   await page.goto("/");
  442 |   const result = await page.evaluate(async () => {
  443 |     const { arrayFixture, nestedArrayFixture, currentSetup } =
  444 |         await import("/tests/fixtures/s04.ts"),
  445 |       { buildPersonal } = await import("/src/application/personal.ts"),
  446 |       { probeDefinitions } = await import("/src/modules/package-probe.ts"),
  447 |       { esProfile } = await import("/src/modules/image.ts"),
  448 |       { currentImageKind } = await import("/src/modules/image-current.ts"),
  449 |       { EditorApplication } = await import("/src/application/editor.ts"),
  450 |       { MemoryStorage } = await import("/tests/fixtures/setup.ts");
  451 |     const source = arrayFixture("source"),
  452 |       input = arrayFixture("input"),
  453 |       nested = nestedArrayFixture(),
  454 |       fixtures = [source, input, nested],
  455 |       assets = await Promise.all(
  456 |         fixtures.map((s) =>
  457 |           buildPersonal(
  458 |             s.graph.capture(),
  459 |             s.fixed,
  460 |             "root" in s ? s.root : s.id,
  461 |             esProfile,
  462 |             probeDefinitions,
  463 |           ),
  464 |         ),
  465 |       );
  466 |     const s = currentSetup(),
  467 |       app = new EditorApplication(
  468 |         s.definitions,
  469 |         s.identity,
  470 |         currentImageKind.ref,
  471 |         esProfile,
  472 |         new MemoryStorage(),
  473 |         { download: async () => {} },
  474 |         probeDefinitions,
  475 |       );
  476 |     app.newDocument();
  477 |     const context = app.context();
  478 |     let events = 0;
  479 |     app.subscribe(() => events++);
  480 |     const stable = (v: any): string =>
  481 |       Array.isArray(v)
  482 |         ? "[" + v.map(stable).join(",") + "]"
  483 |         : v && typeof v === "object"
  484 |           ? "{" +
  485 |             Object.keys(v)
  486 |               .sort()
  487 |               .map((k) => JSON.stringify(k) + ":" + stable(v[k]))
  488 |               .join(",") +
  489 |             "}"
  490 |           : JSON.stringify(v);
```