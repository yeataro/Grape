# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05.spec.ts >> S05 served HTTP 192.168.1.105 boots with secure IDs and exact Personal digest
- Location: tests\browser\s05.spec.ts:332:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://192.168.1.105:4317/
Call log:
  - navigating to "http://192.168.1.105:4317/", waiting until "load"

```

# Test source

```ts
  236 |         s.graph.change("Uniform", (d) => {
  237 |           uniform = d.createSource("gain", "glsl.float", 0.4, true, {
  238 |             kind: "uniform",
  239 |           });
  240 |           const source = d.addReferenceNode(
  241 |             s.network,
  242 |             "source",
  243 |             uniform,
  244 |             undefined,
  245 |             functionOperationRef("source"),
  246 |           );
  247 |           d.connect(
  248 |             s.network,
  249 |             { nodeId: source, portKey: "value" },
  250 |             { nodeId: s.call, portKey: "x" },
  251 |           );
  252 |         });
  253 |       const before = JSON.stringify(s.graph.capture()),
  254 |         out = compile(s.graph.capture(), s.fixed, s.profile);
  255 |       rows.push({
  256 |         kind,
  257 |         ...executeGL(out),
  258 |         expected:
  259 |           kind === "uniform" ? [102, 204, 153, 255] : [51, 102, 153, 255],
  260 |         unchanged: JSON.stringify(s.graph.capture()) === before,
  261 |       });
  262 |       if (uniform)
  263 |         rows.push({
  264 |           kind: "uniform-live-value",
  265 |           ...executeGL(out, { [uniform]: 0.1 }),
  266 |           expected: [26, 51, 153, 255],
  267 |           unchanged: JSON.stringify(s.graph.capture()) === before,
  268 |         });
  269 |     }
  270 |     return rows;
  271 |   });
  272 |   for (const row of result) {
  273 |     expect(row.unchanged).toBe(true);
  274 |     row.pixels.forEach((v, i) =>
  275 |       expect(Math.abs(v - row.expected[i])).toBeLessThanOrEqual(1),
  276 |     );
  277 |   }
  278 |   await fs.writeFile(
  279 |     evidence + "/s05-webgl-functions.json",
  280 |     JSON.stringify({ browser: browser.version(), rows: result }, null, 2),
  281 |   );
  282 | });
  283 | test("S05 mode UI persists shared choice and Make independent and Undo through real commands", async ({
  284 |   page,
  285 | }) => {
  286 |   await page.goto("/");
  287 |   const canvas = page.locator(".canvas").first();
  288 |   await canvas
  289 |     .getByRole("button", { name: "New subgraph", exact: true })
  290 |     .click();
  291 |   await canvas
  292 |     .getByRole("button", { name: "Enter subgraph", exact: true })
  293 |     .click();
  294 |   await canvas.getByText("Subgraph interface", { exact: true }).click();
  295 |   const selector = canvas.getByLabel("Subgraph emission mode");
  296 |   await expect(selector).toHaveValue("expand");
  297 |   await selector.selectOption("function");
  298 |   await expect(selector).toHaveValue("function");
  299 |   const changed = await exported(page);
  300 |   await page.getByRole("button", { name: "Undo", exact: true }).click();
  301 |   await expect(selector).toHaveValue("expand");
  302 |   await page.getByRole("button", { name: "Redo", exact: true }).click();
  303 |   expect((await exported(page)).graph).toEqual(changed.graph);
  304 |   await canvas.getByRole("button", { name: "Up", exact: true }).click();
  305 |   await canvas.getByRole("heading", { name: "Subgraph", exact: true }).click();
  306 |   await canvas
  307 |     .getByRole("button", { name: "Make independent", exact: true })
  308 |     .click();
  309 |   const independent = await exported(page);
  310 |   expect(independent.graph.resources.length).toBe(
  311 |     changed.graph.resources.length + 1,
  312 |   );
  313 |   await canvas
  314 |     .getByRole("button", { name: "Enter subgraph", exact: true })
  315 |     .click();
  316 |   await expect(selector).toHaveValue("function");
  317 |   await canvas.getByText("Subgraph interface", { exact: true }).click();
  318 |   await selector.selectOption("expand");
  319 |   const separated = await exported(page);
  320 |   expect(
  321 |     separated.graph.resources.filter(
  322 |       (r: any) => r.data.emissionMode === "function",
  323 |     ),
  324 |   ).toHaveLength(1);
  325 |   await page.screenshot({ path: evidence + "/s05-mode-ui.png" });
  326 |   await fs.writeFile(
  327 |     evidence + "/s05-mode-ui.json",
  328 |     JSON.stringify({ changed, independent, separated }, null, 2),
  329 |   );
  330 | });
  331 | for (const host of ["127.0.0.1", "192.168.1.105", "100.83.88.97"])
  332 |   test(`S05 served HTTP ${host} boots with secure IDs and exact Personal digest`, async ({
  333 |     page,
  334 |     browser,
  335 |   }) => {
> 336 |     await page.goto(
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://192.168.1.105:4317/
  337 |       `http://${host}:${process.env.GRAPE_TEST_HTTP_PORT ?? "4195"}`,
  338 |     );
  339 |     await expect(page.locator(".canvas").first()).toBeVisible();
  340 |     const result = await page.evaluate(async () => {
  341 |       const { browserIdentity } =
  342 |           await import("/src/adapters/browser/identity.ts"),
  343 |         { sha256Digest } = await import("/src/application/digest.ts"),
  344 |         { functionFixture } = await import("/tests/fixtures/s05.ts"),
  345 |         { buildPersonal, readPersonal } =
  346 |           await import("/src/application/personal.ts"),
  347 |         { probeDefinitions } = await import("/src/modules/package-probe.ts");
  348 |       const s = functionFixture();
  349 |       s.graph.change("Mode", (d) =>
  350 |         d.emissionMode(s.body, "function", s.profile),
  351 |       );
  352 |       const asset = await buildPersonal(
  353 |           s.graph.capture(),
  354 |           s.fixed,
  355 |           s.definition().resource.id,
  356 |           s.profile,
  357 |           probeDefinitions,
  358 |         ),
  359 |         reread = await readPersonal(
  360 |           JSON.stringify(asset),
  361 |           s.fixed,
  362 |           s.profile,
  363 |           probeDefinitions,
  364 |         );
  365 |       const tampered = structuredClone(asset);
  366 |       tampered.name += " altered";
  367 |       let rejected = false;
  368 |       try {
  369 |         await readPersonal(
  370 |           JSON.stringify(tampered),
  371 |           s.fixed,
  372 |           s.profile,
  373 |           probeDefinitions,
  374 |         );
  375 |       } catch {
  376 |         rejected = true;
  377 |       }
  378 |       return {
  379 |         secure: isSecureContext,
  380 |         randomUUID: typeof crypto.randomUUID,
  381 |         subtle: typeof crypto.subtle,
  382 |         ids: Array.from({ length: 50 }, () => browserIdentity().next()),
  383 |         hash: sha256Digest(new TextEncoder().encode("abc")),
  384 |         packageHash: asset.contentHash,
  385 |         roundtrip: reread.contentHash === asset.contentHash,
  386 |         rejected,
  387 |       };
  388 |     });
  389 |     expect(result.hash).toBe(
  390 |       "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  391 |     );
  392 |     expect(new Set(result.ids).size).toBe(50);
  393 |     expect(result.roundtrip).toBe(true);
  394 |     expect(result.rejected).toBe(true);
  395 |     if (host !== "127.0.0.1") {
  396 |       expect(result.secure).toBe(false);
  397 |       expect(result.subtle).toBe("undefined");
  398 |     }
  399 |     const canvas = page.locator(".canvas").first();
  400 |     await page.getByRole("button", { name: "Add Float", exact: true }).click();
  401 |     await canvas
  402 |       .getByRole("button", { name: "Float output value", exact: true })
  403 |       .click();
  404 |     await canvas
  405 |       .getByRole("button", { name: "Image output input color", exact: true })
  406 |       .click();
  407 |     await canvas
  408 |       .getByRole("button", { name: "New subgraph", exact: true })
  409 |       .click();
  410 |     await canvas
  411 |       .getByRole("button", { name: "Enter subgraph", exact: true })
  412 |       .click();
  413 |     await canvas.getByText("Subgraph interface", { exact: true }).click();
  414 |     await canvas
  415 |       .getByRole("button", { name: "Add interface port", exact: true })
  416 |       .click();
  417 |     await canvas
  418 |       .getByRole("button", { name: "Apply interface", exact: true })
  419 |       .click();
  420 |     await canvas.getByText("Subgraph interface", { exact: true }).click();
  421 |     await canvas.getByLabel("Subgraph emission mode").selectOption("function");
  422 |     await canvas.getByRole("button", { name: "Up", exact: true }).click();
  423 |     await canvas
  424 |       .getByRole("heading", { name: "Subgraph", exact: true })
  425 |       .click();
  426 |     await page
  427 |       .getByRole("button", { name: "Personal Library", exact: true })
  428 |       .click();
  429 |     await page
  430 |       .getByRole("button", { name: "Save selected subgraph", exact: true })
  431 |       .click();
  432 |     await expect(page.locator('dialog[open] [role="status"]')).toContainText(
  433 |       "Saved",
  434 |     );
  435 |     const download = page.waitForEvent("download");
  436 |     await page
```