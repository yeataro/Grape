# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s04.spec.ts >> S04 DEC002 actual Canvas four shapes to current ImageOutput and edge identity Undo Redo
- Location: ..\..\..\..\..\tests\browser\s04.spec.ts:309:1

# Error details

```
Test timeout of 40000ms exceeded.
```

```
Error: page.waitForEvent: Test timeout of 40000ms exceeded.
=========================== logs ===========================
waiting for event "download"
============================================================
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
      - button "Generate GLSL" [active] [ref=e16] [cursor=pointer]
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
              - generic "Edge fcebfbf3-3122-4635-84f1-a935dba2e502" [ref=e42]
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
    - complementary [ref=e83]:
      - generic [ref=e84]:
        - tablist "inspector panels" [ref=e85]:
          - tab "Inspector · inspector" [selected] [ref=e86] [cursor=pointer]
          - generic [ref=e87]:
            - button "Collapse active panel in inspector" [ref=e88] [cursor=pointer]: ▾
            - button "Panel options in inspector" [ref=e89] [cursor=pointer]: ⋯
        - generic [ref=e92]:
          - heading "Inspector" [level=2] [ref=e93]
          - paragraph [ref=e94]: Float
          - button "Rename node" [ref=e95] [cursor=pointer]
          - generic [ref=e98]:
            - generic [ref=e99]: Value
            - textbox "Value" [ref=e100]: "0.25"
            - alert
    - separator "right sidebar width" [ref=e101]
  - contentinfo [ref=e102]:
    - button "Project actions" [ref=e103] [cursor=pointer]
    - status [ref=e104]:
      - button "Read full application status" [disabled] [ref=e105]
    - button "Shader output" [ref=e106] [cursor=pointer]
    - button "Panels" [ref=e107] [cursor=pointer]
    - button "Hints" [ref=e108] [cursor=pointer]
```

# Test source

```ts
  205 |     expect(
  206 |       row.shaders.every((s) => s.compiled),
  207 |       JSON.stringify(row.shaders),
  208 |     ).toBe(true);
  209 |   }
  210 |   await fs.writeFile(
  211 |     evidence + "/s04-personal-webgl.json",
  212 |     JSON.stringify({ browser: browser.version(), ...result }, null, 2),
  213 |   );
  214 | });
  215 | test("S04 actual IndexedDB collision concurrency relist quotas and failure isolation", async ({
  216 |   page,
  217 | }) => {
  218 |   await page.goto("/");
  219 |   const result = await page.evaluate(async () => {
  220 |     const { BrowserLibraryStore } =
  221 |         await import("/src/adapters/browser/library.ts"),
  222 |       { PersonalLibrary, buildPersonal } =
  223 |         await import("/src/application/personal.ts"),
  224 |       { arrayFixture } = await import("/tests/fixtures/s04.ts"),
  225 |       { probeDefinitions } = await import("/src/modules/package-probe.ts"),
  226 |       { esProfile } = await import("/src/modules/image.ts");
  227 |     const store = new BrowserLibraryStore("s04-test-" + crypto.randomUUID()),
  228 |       s = arrayFixture("literal"),
  229 |       asset = await buildPersonal(
  230 |         s.graph.capture(),
  231 |         s.fixed,
  232 |         s.id,
  233 |         esProfile,
  234 |         probeDefinitions,
  235 |       ),
  236 |       lib = new PersonalLibrary(store, s.fixed, esProfile, probeDefinitions);
  237 |     await store.publish("Portable_array.sgrape-function.json", "broken");
  238 |     const saved = await lib.save(asset),
  239 |       same = await lib.save(asset),
  240 |       listed = await lib.list();
  241 |     const race = await Promise.all([
  242 |       store.publish("Race.sgrape-function.json", "a"),
  243 |       store.publish("race.sgrape-function.json", "b"),
  244 |     ]);
  245 |     for (let i = (await store.list()).length; i < 64; i++)
  246 |       await store.publish("invalid" + i + ".sgrape-function.json", "bad");
  247 |     const before = JSON.stringify(await store.list());
  248 |     let count = "";
  249 |     try {
  250 |       await store.publish("overflow.sgrape-function.json", "bad");
  251 |     } catch (e) {
  252 |       count = (e as Error).name;
  253 |     }
  254 |     const fullReuse = await lib.save(asset),
  255 |       unchanged = JSON.stringify(await store.list()) === before;
  256 |     const total = new BrowserLibraryStore("s04-total-" + crypto.randomUUID());
  257 |     for (let i = 0; i < 15; i++)
  258 |       await total.publish(i + ".sgrape-function.json", "x".repeat(256000));
  259 |     await total.publish("15.sgrape-function.json", "x".repeat(160000));
  260 |     let budget = "",
  261 |       single = "";
  262 |     try {
  263 |       await total.publish("16.sgrape-function.json", "x");
  264 |     } catch (e) {
  265 |       budget = (e as Error).name;
  266 |     }
  267 |     try {
  268 |       await total.publish("17.sgrape-function.json", "x".repeat(256001));
  269 |     } catch (e) {
  270 |       single = (e as Error).name;
  271 |     }
  272 |     return {
  273 |       saved,
  274 |       same,
  275 |       listed: listed.items.map((x) => x.name),
  276 |       issues: listed.issues,
  277 |       race,
  278 |       count,
  279 |       fullReuse,
  280 |       unchanged,
  281 |       budget,
  282 |       single,
  283 |       totalBytes: (await total.list()).reduce(
  284 |         (n, f) => n + new TextEncoder().encode(f.text).length,
  285 |         0,
  286 |       ),
  287 |     };
  288 |   });
  289 |   expect(result.saved.name).toBe("Portable_array_2.sgrape-function.json");
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
> 305 |   const event = page.waitForEvent("download");
      |                      ^ Error: page.waitForEvent: Test timeout of 40000ms exceeded.
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
  390 |   await expect(page.locator("dialog[open]")).toHaveCount(0);
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
```