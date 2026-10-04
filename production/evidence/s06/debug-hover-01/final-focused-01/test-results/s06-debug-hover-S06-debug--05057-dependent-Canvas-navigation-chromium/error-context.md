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
  - waiting for locator('.canvas').nth(1).locator('article[aria-label="Subgraph 2"] h3')

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
      - generic [ref=e13]:
        - button "New document" [ref=e14] [cursor=pointer]
        - button "Save" [ref=e17] [cursor=pointer]
        - button "Open saved" [ref=e20] [cursor=pointer]
        - button "Export JSON" [ref=e23] [cursor=pointer]
        - button "Export PNG" [ref=e26] [cursor=pointer]
        - button "Open file" [ref=e29] [cursor=pointer]
      - generic [ref=e32]:
        - button "Generate GLSL" [ref=e33] [cursor=pointer]
        - button "Second Canvas" [ref=e36] [cursor=pointer]
        - button "Lock editing" [ref=e39] [cursor=pointer]
      - group [ref=e42]:
        - generic "More actions" [ref=e43] [cursor=pointer]
    - generic [ref=e45]:
      - generic [ref=e46]: Unsaved changes
      - generic [ref=e47]: Host-free
  - generic [ref=e49]:
    - button "Undo" [ref=e50] [cursor=pointer]
    - button "Redo" [disabled] [ref=e53]
    - button "Delete selected" [ref=e56] [cursor=pointer]
    - alert
  - main [ref=e57]:
    - generic [ref=e58]:
      - generic [ref=e59]:
        - generic: Canvas 1
        - generic "Shader graph canvas" [ref=e60]:
          - generic:
            - generic:
              - generic:
                - group "Inputs" [ref=e61]:
                  - heading "Inputs" [level=3] [ref=e62]
                  - button "Create input port from selection" [ref=e63] [cursor=pointer]
                - group "Outputs" [ref=e64]:
                  - heading "Outputs" [level=3] [ref=e65]
                  - button "Create output port from selection" [ref=e66] [cursor=pointer]
                - group "Multiply" [ref=e67]:
                  - heading "Multiply" [level=3] [ref=e68]
                  - generic [ref=e69]:
                    - button "Multiply input a" [ref=e70] [cursor=pointer]:
                      - generic [ref=e72]: a
                    - generic [ref=e73]: float
                    - generic "Current local value; edit in Inspector" [ref=e74]: "1"
                  - generic [ref=e75]:
                    - button "Multiply input b" [ref=e76] [cursor=pointer]:
                      - generic [ref=e78]: b
                    - generic [ref=e79]: float
                    - generic "Current local value; edit in Inspector" [ref=e80]: "2"
                  - generic [ref=e81]:
                    - button "Multiply output result" [ref=e82] [cursor=pointer]:
                      - generic [ref=e83]: result
                    - generic [ref=e85]: float
          - generic:
            - button "Untitled shader / pixel" [ref=e86] [cursor=pointer]
            - button "Subgraph" [disabled]
          - generic [ref=e87]:
            - button "New subgraph" [ref=e88] [cursor=pointer]
            - button "Library subgraph" [ref=e89] [cursor=pointer]
            - button "Encapsulate" [ref=e90] [cursor=pointer]
            - button "Make independent" [ref=e91] [cursor=pointer]
            - button "Enter subgraph" [active] [ref=e92] [cursor=pointer]
            - button "Arrange nodes" [ref=e93] [cursor=pointer]
            - button "Frame selection" [ref=e94] [cursor=pointer]
            - group [ref=e95]:
              - generic "Subgraph interface" [ref=e96] [cursor=pointer]
              - option "Expand" [selected]
              - option "Function"
              - option "input" [selected]
              - option "output"
            - group [ref=e97]:
              - generic "Local clipboard" [ref=e98] [cursor=pointer]
              - textbox "Local clipboard text" [ref=e99]: "{\"format\":\"grape.clipboard\",\"version\":1,\"graphId\":\"454539c4-bba1-4b00-b452-221e141b45dd\",\"loadId\":\"c58210f5-da1f-4b32-ba35-0519d4e0e291\",\"modules\":[{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\"},{\"moduleId\":\"grape.nodes.fixed-values\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:0d75d254ae4654e672001bc326252ab9775c87b581b79c15e6e8d44fee59a6ba\"},{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\"},{\"moduleId\":\"grape.resources.extents\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:bcfaaca3ef01c57070e05b26e09bbcacde5d51f6ba0091b8b6aaf3d83efa3c60\"},{\"moduleId\":\"grape.resources.image-sources\",\"version\":\"0.2.0\",\"fingerprint\":\"sha256:bb0ff902b36d7a07fc104412d0ccb11e4e7efed0106aa3c8595026dbcef8b212\"},{\"moduleId\":\"grape.resources.function-networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:25d291427adb77405f826a636cd2a7c9a5851f0017cb779ced1a13e5a9b0b9e7\"},{\"moduleId\":\"grape.nodes.function-operations\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\"},{\"moduleId\":\"grape.graph-kinds\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:30d1266c367648c97b57a6cf77eec9d0bf14ac8bdb057fa4eef457539adb98c3\"},{\"moduleId\":\"grape.nodes.image-output\",\"version\":\"0.2.0\",\"fingerprint\":\"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\"},{\"moduleId\":\"grape.graph-kinds\",\"version\":\"0.2.0\",\"fingerprint\":\"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\"}],\"network\":{\"id\":\"516fd275-d363-47f5-a9b7-9623d3fbcb86\",\"nodes\":[{\"id\":\"42420f6e-4fce-473d-ab15-879045370b69\",\"name\":\"Subgraph\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\",\"typeId\":\"call\"},\"state\":{\"definition\":\"72091c5c-d17d-4f0e-be28-f5aa38459806\"},\"inputValues\":{},\"ports\":[],\"references\":[{\"slot\":\"definition\",\"kind\":\"resource\",\"targetId\":\"72091c5c-d17d-4f0e-be28-f5aa38459806\"}],\"referencesComplete\":true,\"position\":[160,120],\"extensions\":{}}],\"edges\":[],\"extensions\":{}},\"resources\":[{\"id\":\"72091c5c-d17d-4f0e-be28-f5aa38459806\",\"type\":{\"moduleId\":\"grape.resources.function-networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:25d291427adb77405f826a636cd2a7c9a5851f0017cb779ced1a13e5a9b0b9e7\",\"typeId\":\"definition\"},\"data\":{\"name\":\"Subgraph\",\"local\":true,\"origin\":null,\"network\":{\"id\":\"bcf75f34-b7d5-44c5-81e8-80af5d59e859\",\"nodes\":[{\"id\":\"7239afb4-aba9-41d6-92af-4271280bcffc\",\"name\":\"Inputs\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\",\"typeId\":\"network-input\"},\"state\":{\"definition\":\"72091c5c-d17d-4f0e-be28-f5aa38459806\"},\"inputValues\":{},\"ports\":[],\"references\":[{\"slot\":\"definition\",\"kind\":\"resource\",\"targetId\":\"72091c5c-d17d-4f0e-be28-f5aa38459806\"}],\"referencesComplete\":true,\"position\":[0,0],\"extensions\":{}},{\"id\":\"996e32ca-7d25-4f01-98c1-d6661a66dd20\",\"name\":\"Outputs\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\",\"typeId\":\"network-output\"},\"state\":{\"definition\":\"72091c5c-d17d-4f0e-be28-f5aa38459806\"},\"inputValues\":{},\"ports\":[],\"references\":[{\"slot\":\"definition\",\"kind\":\"resource\",\"targetId\":\"72091c5c-d17d-4f0e-be28-f5aa38459806\"}],\"referencesComplete\":true,\"position\":[600,0],\"extensions\":{}},{\"id\":\"e86f0c63-4862-4a4f-a3db-cd6a0db3ca23\",\"name\":\"Multiply\",\"type\":{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\",\"typeId\":\"multiply\"},\"state\":{},\"inputValues\":{\"a\":1,\"b\":2},\"ports\":[{\"key\":\"a\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"b\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":2},{\"key\":\"result\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"references\":[],\"referencesComplete\":true,\"position\":[48,96],\"extensions\":{}}],\"edges\":[],\"extensions\":{}},\"interface\":[],\"dependencies\":[],\"emissionMode\":\"expand\"},\"references\":[],\"referencesComplete\":true,\"extensions\":{}}]}"
              - button "Copy selection" [ref=e100] [cursor=pointer]
              - button "Paste selection" [ref=e101] [cursor=pointer]
            - group [ref=e102]:
              - generic "Structures" [ref=e103] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=e104]:
            - button "Vertex" [ref=e105] [cursor=pointer]
            - button "Pixel" [pressed] [ref=e106] [cursor=pointer]
          - generic [ref=e107]:
            - button "Add Node" [ref=e108] [cursor=pointer]
            - button "Browse nodes" [ref=e111] [cursor=pointer]
            - button "Up" [ref=e114] [cursor=pointer]
            - button "Shortcuts" [ref=e117] [cursor=pointer]
      - generic [ref=e120]:
        - generic: Canvas 2
        - generic "Shader graph canvas" [ref=e121]:
          - generic:
            - generic:
              - generic:
                - group "Image output" [ref=e122]:
                  - heading "Image output" [level=3] [ref=e123]
                  - generic [ref=e124]:
                    - button "Image output input color" [ref=e125] [cursor=pointer]:
                      - generic [ref=e127]: color
                    - generic [ref=e128]: vec4
                - group "Subgraph" [ref=e129]:
                  - heading "Subgraph" [level=3] [ref=e130]
          - generic:
            - button "Untitled shader / pixel" [disabled]
          - generic [ref=e131]:
            - button "New subgraph" [ref=e132] [cursor=pointer]
            - button "Library subgraph" [ref=e133] [cursor=pointer]
            - button "Encapsulate" [ref=e134] [cursor=pointer]
            - button "Make independent" [ref=e135] [cursor=pointer]
            - button "Enter subgraph" [ref=e136] [cursor=pointer]
            - button "Arrange nodes" [ref=e137] [cursor=pointer]
            - button "Frame selection" [ref=e138] [cursor=pointer]
            - group [ref=e139]:
              - generic "Local clipboard" [ref=e140] [cursor=pointer]
            - group [ref=e141]:
              - generic "Structures" [ref=e142] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=e143]:
            - button "Vertex" [ref=e144] [cursor=pointer]
            - button "Pixel" [pressed] [ref=e145] [cursor=pointer]
          - generic [ref=e146]:
            - button "Add Node" [ref=e147] [cursor=pointer]
            - button "Browse nodes" [ref=e150] [cursor=pointer]
            - button "Up" [disabled] [ref=e153]
            - button "Shortcuts" [ref=e156] [cursor=pointer]
    - complementary [ref=e159]:
      - generic [ref=e160]:
        - heading "Inspector" [level=2] [ref=e161]
        - paragraph [ref=e162]: Select a node to inspect its parameters.
  - generic [ref=e164]:
    - heading "Shader output" [level=2] [ref=e165]
    - paragraph [ref=e166]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e167]:
      - listitem [ref=e168]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e169] [cursor=pointer]
  - contentinfo [ref=e170]:
    - generic [ref=e171]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e172]: Scroll to zoom · Drag empty space to pan
    - generic [ref=e173]:
      - group [ref=e174]:
        - generic "Experimental features" [ref=e175] [cursor=pointer]
      - button "Read object details" [disabled] [ref=e176]
  - status [ref=e177]:
    - button "Read full application status" [disabled] [ref=e178]
```

# Test source

```ts
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
  484 |   await createNode(page, "Multiply");
  485 |   const first = page.locator(".canvas").first();
  486 |   await first.getByRole("heading", { name: "Multiply", exact: true }).click();
  487 |   await clickAction(page, "Encapsulate");
  488 |   await page.getByText("Local clipboard", { exact: true }).click();
  489 |   await page
  490 |     .getByRole("button", { name: "Copy selection", exact: true })
  491 |     .click();
  492 |   await page
  493 |     .getByRole("button", { name: "Paste selection", exact: true })
  494 |     .click();
  495 |   await clickAction(page, "Second Canvas");
  496 |   const second = page.locator(".canvas").nth(1);
  497 |   await first.locator('article[aria-label="Subgraph"] h3').click();
  498 |   await first
  499 |     .getByRole("button", { name: "Enter subgraph", exact: true })
  500 |     .click();
> 501 |   await second.locator('article[aria-label="Subgraph 2"] h3').click();
      |                                                               ^ Error: locator.click: Test timeout of 30000ms exceeded.
  502 |   await second
  503 |     .getByRole("button", { name: "Enter subgraph", exact: true })
  504 |     .click();
  505 |   const before = await documentJSON(page),
  506 |     records = [];
  507 |   for (const c of [first, second]) {
  508 |     await c.getByRole("heading", { name: "Multiply", exact: true }).hover();
  509 |     const text = await read(page);
  510 |     expect(text).toContain('"occurrence"');
  511 |     records.push(text);
  512 |     await close(page);
  513 |   }
  514 |   expect(records[0]).not.toEqual(records[1]);
  515 |   await first.getByRole("button", { name: "Up", exact: true }).click();
  516 |   await expect(first).toHaveAttribute("data-path", "");
  517 |   await expect(second).toHaveAttribute("data-path", /.+/);
  518 |   await expect(dialog(page)).not.toBeVisible();
  519 |   expect(await documentJSON(page)).toEqual(before);
  520 |   save("nested-occurrences", records);
  521 | });
  522 | 
```