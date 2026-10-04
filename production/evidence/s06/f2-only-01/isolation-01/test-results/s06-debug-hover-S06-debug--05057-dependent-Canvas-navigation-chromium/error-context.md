# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-debug-hover.spec.ts >> S06 debug target follows nested occurrence and independent Canvas navigation
- Location: ..\..\..\production\tests\browser\s06-debug-hover.spec.ts:362:1

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "\"occurrence\""
Received string:    "Panel: Canvas
Identity: canvas-1
State: UI-only · visible·
{
  \"type\": \"grape.panel.canvas\",
  \"viewState\": {
    \"x\": 24,
    \"y\": 104,
    \"zoom\": 1
  }
}"
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
        - generic: Canvas 1
        - generic "Shader graph canvas" [ref=e34]:
          - generic:
            - generic:
              - img:
                - generic "Edge 542b4544-6c97-4134-a0e2-a61c910662db" [ref=e35]
                - generic "Edge 3690c50c-bf3f-4d72-96c9-a2b65de31643" [ref=e36]
              - generic:
                - group "Inputs" [ref=e37]:
                  - heading "Inputs" [level=3] [ref=e38]
                  - button "Create input port from selection" [ref=e39] [cursor=pointer]
                  - generic [ref=e40]:
                    - button "Inputs output Input 1" [ref=e41] [cursor=pointer]
                    - generic [ref=e42]: Input 1
                    - generic [ref=e43]: float
                - group "Outputs" [ref=e44]:
                  - heading "Outputs" [level=3] [ref=e45]
                  - button "Create output port from selection" [ref=e46] [cursor=pointer]
                  - generic [ref=e47]:
                    - button "Outputs input Output 1" [ref=e48] [cursor=pointer]
                    - generic [ref=e49]: Output 1
                    - generic [ref=e50]: float
                - group "Multiply" [ref=e51]:
                  - heading "Multiply" [level=3] [ref=e52]
                  - generic [ref=e53]:
                    - button "Multiply input a" [ref=e54] [cursor=pointer]
                    - generic [ref=e55]: a
                    - generic [ref=e56]: float
                  - generic [ref=e57]:
                    - button "Multiply input b" [ref=e58] [cursor=pointer]
                    - generic [ref=e59]: b
                    - generic [ref=e60]: float
                    - generic "Current local value; edit in Inspector" [ref=e61]: "2"
                  - generic [ref=e62]:
                    - button "Multiply output result" [ref=e63] [cursor=pointer]
                    - generic [ref=e64]: result
                    - generic [ref=e65]: float
          - generic:
            - button "Untitled shader / pixel" [ref=e66] [cursor=pointer]
            - button "Subgraph" [disabled]
          - generic [ref=e67]:
            - button "New subgraph" [ref=e68] [cursor=pointer]
            - button "Library subgraph" [ref=e69] [cursor=pointer]
            - button "Encapsulate" [ref=e70] [cursor=pointer]
            - button "Make independent" [ref=e71] [cursor=pointer]
            - button "Enter subgraph" [ref=e72] [cursor=pointer]
            - button "Arrange nodes" [ref=e73] [cursor=pointer]
            - button "Frame selection" [ref=e74] [cursor=pointer]
            - group [ref=e75]:
              - generic "Subgraph interface" [ref=e76] [cursor=pointer]
              - option "Expand" [selected]
              - option "Function"
              - option "input" [selected]
              - option "output"
            - group [ref=e77]:
              - generic "Local clipboard" [ref=e78] [cursor=pointer]
              - textbox "Local clipboard text" [ref=e79]: "{\"format\":\"grape.clipboard\",\"version\":1,\"graphId\":\"1e463991-a1a0-442f-a731-34ef3052e4bf\",\"loadId\":\"e2b493fb-6438-4981-b7a9-4362e369cab6\",\"modules\":[{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\"},{\"moduleId\":\"grape.nodes.fixed-values\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:0d75d254ae4654e672001bc326252ab9775c87b581b79c15e6e8d44fee59a6ba\"},{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\"},{\"moduleId\":\"grape.resources.extents\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:bcfaaca3ef01c57070e05b26e09bbcacde5d51f6ba0091b8b6aaf3d83efa3c60\"},{\"moduleId\":\"grape.resources.image-sources\",\"version\":\"0.2.0\",\"fingerprint\":\"sha256:bb0ff902b36d7a07fc104412d0ccb11e4e7efed0106aa3c8595026dbcef8b212\"},{\"moduleId\":\"grape.resources.function-networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:25d291427adb77405f826a636cd2a7c9a5851f0017cb779ced1a13e5a9b0b9e7\"},{\"moduleId\":\"grape.nodes.function-operations\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\"},{\"moduleId\":\"grape.graph-kinds\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:30d1266c367648c97b57a6cf77eec9d0bf14ac8bdb057fa4eef457539adb98c3\"},{\"moduleId\":\"grape.nodes.image-output\",\"version\":\"0.2.0\",\"fingerprint\":\"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\"},{\"moduleId\":\"grape.graph-kinds\",\"version\":\"0.2.0\",\"fingerprint\":\"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\"}],\"network\":{\"id\":\"d379dfec-1682-4967-8242-0635c855f9ec\",\"nodes\":[{\"id\":\"4e00934a-987e-48bd-9d72-5b3c9a72dad1\",\"name\":\"Subgraph\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\",\"typeId\":\"call\"},\"state\":{\"definition\":\"ee65f23c-0bdf-4a80-96ba-6e8ab9f8b8e5\"},\"inputValues\":{\"d40f6b7c-5f3a-4b86-abe3-5204d1a3f826\":1},\"ports\":[{\"key\":\"d40f6b7c-5f3a-4b86-abe3-5204d1a3f826\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"1bd40bd0-5ba4-4695-9776-6964eac8aef1\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"references\":[{\"slot\":\"definition\",\"kind\":\"resource\",\"targetId\":\"ee65f23c-0bdf-4a80-96ba-6e8ab9f8b8e5\"}],\"referencesComplete\":true,\"position\":[160,120],\"extensions\":{}}],\"edges\":[],\"extensions\":{}},\"resources\":[{\"id\":\"ee65f23c-0bdf-4a80-96ba-6e8ab9f8b8e5\",\"type\":{\"moduleId\":\"grape.resources.function-networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:25d291427adb77405f826a636cd2a7c9a5851f0017cb779ced1a13e5a9b0b9e7\",\"typeId\":\"definition\"},\"data\":{\"name\":\"Subgraph\",\"local\":true,\"origin\":null,\"network\":{\"id\":\"6975b1ff-f796-4f41-ac96-498d26c2ef65\",\"nodes\":[{\"id\":\"7321f936-9566-41b8-83d7-eeb44f98c569\",\"name\":\"Inputs\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\",\"typeId\":\"network-input\"},\"state\":{\"definition\":\"ee65f23c-0bdf-4a80-96ba-6e8ab9f8b8e5\"},\"inputValues\":{},\"ports\":[{\"key\":\"d40f6b7c-5f3a-4b86-abe3-5204d1a3f826\",\"direction\":\"output\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1}],\"references\":[{\"slot\":\"definition\",\"kind\":\"resource\",\"targetId\":\"ee65f23c-0bdf-4a80-96ba-6e8ab9f8b8e5\"}],\"referencesComplete\":true,\"position\":[0,0],\"extensions\":{}},{\"id\":\"eb3fd124-ad55-4286-9062-1bec7b4a27a7\",\"name\":\"Outputs\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\",\"typeId\":\"network-output\"},\"state\":{\"definition\":\"ee65f23c-0bdf-4a80-96ba-6e8ab9f8b8e5\"},\"inputValues\":{\"1bd40bd0-5ba4-4695-9776-6964eac8aef1\":0},\"ports\":[{\"key\":\"1bd40bd0-5ba4-4695-9776-6964eac8aef1\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":0}],\"references\":[{\"slot\":\"definition\",\"kind\":\"resource\",\"targetId\":\"ee65f23c-0bdf-4a80-96ba-6e8ab9f8b8e5\"}],\"referencesComplete\":true,\"position\":[600,0],\"extensions\":{}},{\"id\":\"8cca8232-069a-4f23-9c7f-f410d51c0535\",\"name\":\"Multiply\",\"type\":{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\",\"typeId\":\"multiply\"},\"state\":{},\"inputValues\":{\"a\":1,\"b\":2},\"ports\":[{\"key\":\"a\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"b\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":2},{\"key\":\"result\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"references\":[],\"referencesComplete\":true,\"position\":[264,96],\"extensions\":{}}],\"edges\":[{\"id\":\"542b4544-6c97-4134-a0e2-a61c910662db\",\"from\":{\"nodeId\":\"7321f936-9566-41b8-83d7-eeb44f98c569\",\"portKey\":\"d40f6b7c-5f3a-4b86-abe3-5204d1a3f826\"},\"to\":{\"nodeId\":\"8cca8232-069a-4f23-9c7f-f410d51c0535\",\"portKey\":\"a\"},\"adaptation\":{\"schema\":\"grape.edge-adaptation\",\"version\":1,\"sourceType\":\"glsl.float\",\"targetType\":\"glsl.float\",\"operation\":\"identity\",\"extensions\":{}},\"extensions\":{}},{\"id\":\"3690c50c-bf3f-4d72-96c9-a2b65de31643\",\"from\":{\"nodeId\":\"8cca8232-069a-4f23-9c7f-f410d51c0535\",\"portKey\":\"result\"},\"to\":{\"nodeId\":\"eb3fd124-ad55-4286-9062-1bec7b4a27a7\",\"portKey\":\"1bd40bd0-5ba4-4695-9776-6964eac8aef1\"},\"adaptation\":{\"schema\":\"grape.edge-adaptation\",\"version\":1,\"sourceType\":\"glsl.float\",\"targetType\":\"glsl.float\",\"operation\":\"identity\",\"extensions\":{}},\"extensions\":{}}],\"extensions\":{}},\"interface\":[{\"key\":\"d40f6b7c-5f3a-4b86-abe3-5204d1a3f826\",\"name\":\"Input 1\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"1bd40bd0-5ba4-4695-9776-6964eac8aef1\",\"name\":\"Output 1\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"dependencies\":[],\"emissionMode\":\"expand\"},\"references\":[],\"referencesComplete\":true,\"extensions\":{}}]}"
              - button "Copy selection" [ref=e80] [cursor=pointer]
              - button "Paste selection" [ref=e81] [cursor=pointer]
            - group [ref=e82]:
              - generic "Structures" [ref=e83] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=e84]:
            - button "Vertex" [ref=e85] [cursor=pointer]
            - button "Pixel" [pressed] [ref=e86] [cursor=pointer]
          - generic [ref=e87]:
            - button "Add Node" [ref=e88] [cursor=pointer]
            - button "Browse nodes" [ref=e91] [cursor=pointer]
            - button "Up" [ref=e94] [cursor=pointer]
            - button "Shortcuts" [ref=e97] [cursor=pointer]
      - generic [ref=e100]:
        - generic: Canvas 2
        - generic "Shader graph canvas" [ref=e101]:
          - generic:
            - generic:
              - img:
                - generic "Edge 542b4544-6c97-4134-a0e2-a61c910662db" [ref=e102]
                - generic "Edge 3690c50c-bf3f-4d72-96c9-a2b65de31643" [ref=e103]
              - generic:
                - group "Inputs" [ref=e104]:
                  - heading "Inputs" [level=3] [ref=e105]
                  - button "Create input port from selection" [ref=e106] [cursor=pointer]
                  - generic [ref=e107]:
                    - button "Inputs output Input 1" [ref=e108] [cursor=pointer]
                    - generic [ref=e109]: Input 1
                    - generic [ref=e110]: float
                - group "Outputs" [ref=e111]:
                  - heading "Outputs" [level=3] [ref=e112]
                  - button "Create output port from selection" [ref=e113] [cursor=pointer]
                  - generic [ref=e114]:
                    - button "Outputs input Output 1" [ref=e115] [cursor=pointer]
                    - generic [ref=e116]: Output 1
                    - generic [ref=e117]: float
                - group "Multiply" [ref=e118]:
                  - heading "Multiply" [level=3] [ref=e119]
                  - generic [ref=e120]:
                    - button "Multiply input a" [ref=e121] [cursor=pointer]
                    - generic [ref=e122]: a
                    - generic [ref=e123]: float
                  - generic [ref=e124]:
                    - button "Multiply input b" [ref=e125] [cursor=pointer]
                    - generic [ref=e126]: b
                    - generic [ref=e127]: float
                    - generic "Current local value; edit in Inspector" [ref=e128]: "2"
                  - generic [ref=e129]:
                    - button "Multiply output result" [ref=e130] [cursor=pointer]
                    - generic [ref=e131]: result
                    - generic [ref=e132]: float
          - generic:
            - button "Untitled shader / pixel" [ref=e133] [cursor=pointer]
            - button "Subgraph" [disabled]
          - generic [ref=e134]:
            - button "New subgraph" [ref=e135] [cursor=pointer]
            - button "Library subgraph" [ref=e136] [cursor=pointer]
            - button "Encapsulate" [ref=e137] [cursor=pointer]
            - button "Make independent" [ref=e138] [cursor=pointer]
            - button "Enter subgraph" [ref=e139] [cursor=pointer]
            - button "Arrange nodes" [ref=e140] [cursor=pointer]
            - button "Frame selection" [ref=e141] [cursor=pointer]
            - group [ref=e142]:
              - generic "Subgraph interface" [ref=e143] [cursor=pointer]
              - option "Expand" [selected]
              - option "Function"
              - option "input" [selected]
              - option "output"
            - group [ref=e144]:
              - generic "Local clipboard" [ref=e145] [cursor=pointer]
            - group [ref=e146]:
              - generic "Structures" [ref=e147] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=e148]:
            - button "Vertex" [ref=e149] [cursor=pointer]
            - button "Pixel" [pressed] [ref=e150] [cursor=pointer]
          - generic [ref=e151]:
            - button "Add Node" [ref=e152] [cursor=pointer]
            - button "Browse nodes" [ref=e155] [cursor=pointer]
            - button "Up" [ref=e158] [cursor=pointer]
            - button "Shortcuts" [ref=e161] [cursor=pointer]
    - complementary [ref=e164]:
      - generic [ref=e165]:
        - heading "Inspector" [level=2] [ref=e166]
        - paragraph [ref=e167]: Select a node to inspect its parameters.
  - contentinfo [ref=e168]:
    - button "Project actions" [ref=e169] [cursor=pointer]
    - status [ref=e170]:
      - button "Read full application status" [ref=e171] [cursor=pointer]: Export started. Saved status is unchanged.
    - button "Shader output" [ref=e172] [cursor=pointer]
    - button "Hints" [ref=e173] [cursor=pointer]
  - dialog "Object information" [ref=e174]:
    - heading "Object information" [level=2] [ref=e175]
    - region "Current object data" [active] [ref=e176]: "Panel: Canvas Identity: canvas-1 State: UI-only · visible { \"type\": \"grape.panel.canvas\", \"viewState\": { \"x\": 24, \"y\": 104, \"zoom\": 1 } }"
    - button "Close object details" [ref=e177] [cursor=pointer]
```

# Test source

```ts
  312 |     width: e.clientWidth,
  313 |     scrollWidth: e.scrollWidth,
  314 |     height: e.clientHeight,
  315 |     scrollHeight: e.scrollHeight,
  316 |     text: e.textContent,
  317 |   }));
  318 |   expect(facts.scrollWidth).toBeLessThanOrEqual(facts.width + 1);
  319 |   await page.screenshot({ path: path.join(out, "f2-narrow.png") });
  320 |   await close(page, n);
  321 |   await page.setViewportSize({ width: 1440, height: 1000 });
  322 |   expect(await n.boundingBox()).toEqual(bounds);
  323 |   expect(await doc(page)).toEqual(before);
  324 |   save("f2-long-data", facts);
  325 | });
  326 | test("S06 F2 busy Save acknowledgement does not intercept or corrupt save", async ({
  327 |   page,
  328 | }) => {
  329 |   await fixture(page);
  330 |   const before = await doc(page);
  331 |   await page.evaluate(() => {
  332 |     const d = Object.getOwnPropertyDescriptor(
  333 |       IDBTransaction.prototype,
  334 |       "oncomplete",
  335 |     )!;
  336 |     Object.defineProperty(IDBTransaction.prototype, "oncomplete", {
  337 |       ...d,
  338 |       set(handler) {
  339 |         d.set!.call(this, function (this: IDBTransaction, event: Event) {
  340 |           (window as any).releaseSave = () => handler.call(this, event);
  341 |         });
  342 |       },
  343 |     });
  344 |   });
  345 |   await clickAction(page, "Save");
  346 |   await expect(page.locator("#save-state")).toHaveText("Saving…");
  347 |   await page.keyboard.press("F2");
  348 |   await expect(dialog(page)).not.toBeVisible();
  349 |   await page.waitForFunction(
  350 |     () => typeof (window as any).releaseSave === "function",
  351 |   );
  352 |   await page.evaluate(() => (window as any).releaseSave());
  353 |   await expect(page.locator("#save-state")).not.toHaveText("Saving…");
  354 |   expect(await doc(page)).toEqual(before);
  355 |   save("f2-save-ack", {
  356 |     injectedStorageDelay: true,
  357 |     F2Blocked: true,
  358 |     saveCompleted: true,
  359 |   });
  360 | });
  361 | 
  362 | test("S06 debug target follows nested occurrence and independent Canvas navigation", async ({
  363 |   page,
  364 | }) => {
  365 |   for (const name of ["Float", "Multiply", "Compose"])
  366 |     await createNode(page, name);
  367 |   // Keep this multi-port fixture clear of the existing output before connecting.
  368 |   const composeBox = (await page
  369 |     .getByRole("heading", { name: "Compose", exact: true })
  370 |     .boundingBox())!;
  371 |   await page.mouse.move(composeBox.x + 40, composeBox.y + 10);
  372 |   await page.mouse.down();
  373 |   await page.mouse.move(composeBox.x + 40, composeBox.y + 235, { steps: 10 });
  374 |   await page.mouse.up();
  375 |   for (const [a, b] of [
  376 |     ["Float output value", "Multiply input a"],
  377 |     ["Multiply output result", "Compose input x"],
  378 |     ["Compose output result", "Image output input color"],
  379 |   ]) {
  380 |     await page.getByRole("button", { name: a, exact: true }).click();
  381 |     await page.getByRole("button", { name: b, exact: true }).click();
  382 |   }
  383 |   const first = page.locator(".canvas").first();
  384 |   await first.getByRole("heading", { name: "Multiply", exact: true }).click();
  385 |   await clickAction(page, "Encapsulate");
  386 |   await page.getByText("Local clipboard", { exact: true }).click();
  387 |   await page
  388 |     .getByRole("button", { name: "Copy selection", exact: true })
  389 |     .click();
  390 |   await page
  391 |     .getByRole("button", { name: "Paste selection", exact: true })
  392 |     .click();
  393 |   await clickAction(page, "Second Canvas");
  394 |   const second = page.locator(".canvas").nth(1);
  395 |   await first.locator('article[aria-label="Subgraph"] h3').click();
  396 |   await first
  397 |     .getByRole("button", { name: "Enter subgraph", exact: true })
  398 |     .click();
  399 |   await second.locator('article[aria-label="Subgraph 2"] h3').click();
  400 |   await second
  401 |     .getByRole("button", { name: "Enter subgraph", exact: true })
  402 |     .click();
  403 |   const before = await doc(page),
  404 |     records = [];
  405 |   for (const c of [first, second]) {
  406 |     const target = c
  407 |       .locator("article")
  408 |       .filter({
  409 |         has: page.getByRole("heading", { name: "Multiply", exact: true }),
  410 |       });
  411 |     const text = await read(page, target);
> 412 |     expect(text).toContain('"occurrence"');
      |                  ^ Error: expect(received).toContain(expected) // indexOf
  413 |     records.push(text);
  414 |     await close(page, target);
  415 |   }
  416 |   expect(records[0]).not.toEqual(records[1]);
  417 |   await first.getByRole("button", { name: "Up", exact: true }).click();
  418 |   await expect(first).toHaveAttribute("data-path", "");
  419 |   await expect(second).toHaveAttribute("data-path", /.+/);
  420 |   await expect(dialog(page)).not.toBeVisible();
  421 |   expect(await doc(page)).toEqual(before);
  422 |   save("nested-occurrences", records);
  423 | });
  424 | 
```