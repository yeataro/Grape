# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s02.spec.ts >> M1 browser: boundary missing-module rename rejects save, retains prior ACK, then saves and reopens without opaque loss
- Location: ..\..\..\production\tests\browser\s02.spec.ts:283:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.node h3').filter({ hasText: /^Float$/ })
    - locator resolved to <h3>Float</h3>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button title="Pixel Stage" aria-pressed="true" data-stage-id="id-6">Pixel</button> from <div class="stage-switch" data-key="id-3:vertex|id-6:pixel">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button title="Pixel Stage" aria-pressed="true" data-stage-id="id-6">Pixel</button> from <div class="stage-switch" data-key="id-3:vertex|id-6:pixel">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    12 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <button title="Pixel Stage" aria-pressed="true" data-stage-id="id-6">Pixel</button> from <div class="stage-switch" data-key="id-3:vertex|id-6:pixel">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - banner [ref=f1e3]:
    - generic [ref=f1e4]:
      - text: Grape
      - generic [ref=f1e9]: SHADER WORKSPACE
    - navigation "Document actions" [ref=f1e10]:
      - generic [ref=f1e11]:
        - button "New document" [ref=f1e12] [cursor=pointer]
        - button "Save" [ref=f1e15] [cursor=pointer]
        - button "Open saved" [ref=f1e18] [cursor=pointer]
        - button "Export JSON" [ref=f1e21] [cursor=pointer]
        - button "Export PNG" [ref=f1e24] [cursor=pointer]
        - button "Open file" [ref=f1e27] [cursor=pointer]
      - generic [ref=f1e30]:
        - button "Generate GLSL" [ref=f1e31] [cursor=pointer]
        - button "Second Canvas" [ref=f1e34] [cursor=pointer]
        - button "Lock editing" [ref=f1e37] [cursor=pointer]
      - group [ref=f1e40]:
        - generic "More actions" [ref=f1e41] [cursor=pointer]
    - generic [ref=f1e43]:
      - generic [ref=f1e44]: Unsaved changes
      - generic [ref=f1e45]: Host-free
  - status [ref=f1e46]
  - generic [ref=f1e48]:
    - button "Undo" [disabled] [ref=f1e49]
    - button "Redo" [disabled] [ref=f1e52]
    - button "Delete selected" [ref=f1e55] [cursor=pointer]
    - alert
  - main [ref=f1e56]:
    - generic [ref=f1e58]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=f1e59]:
        - group "Image output" [ref=f1e60]:
          - heading "Image output" [level=3] [ref=f1e61]
          - generic [ref=f1e62]:
            - button "Image output input color" [ref=f1e63] [cursor=pointer]:
              - generic [ref=f1e65]: color
            - generic [ref=f1e66]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=f1e67]:
          - button "New subgraph" [ref=f1e68] [cursor=pointer]
          - button "Library subgraph" [ref=f1e69] [cursor=pointer]
          - button "Encapsulate" [ref=f1e70] [cursor=pointer]
          - button "Make independent" [ref=f1e71] [cursor=pointer]
          - button "Enter subgraph" [ref=f1e72] [cursor=pointer]
          - button "Arrange nodes" [ref=f1e73] [cursor=pointer]
          - button "Frame selection" [ref=f1e74] [cursor=pointer]
          - group [ref=f1e75]:
            - generic "Local clipboard" [ref=f1e76] [cursor=pointer]
          - group [ref=f1e77]:
            - generic "Structures" [ref=f1e78] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=f1e79]:
          - button "Vertex" [ref=f1e80] [cursor=pointer]
          - button "Pixel" [pressed] [ref=f1e81] [cursor=pointer]
        - generic [ref=f1e82]:
          - button "Add Node" [ref=f1e83] [cursor=pointer]
          - button "Browse nodes" [ref=f1e86] [cursor=pointer]
          - button "Up" [disabled] [ref=f1e89]
          - button "Shortcuts" [ref=f1e92] [cursor=pointer]
    - complementary [ref=f1e95]:
      - generic [ref=f1e96]:
        - heading "Inspector" [level=2] [ref=f1e97]
        - paragraph [ref=f1e98]: Select a node to inspect its parameters.
  - generic [ref=f1e100]:
    - heading "Shader output" [level=2] [ref=f1e101]
    - paragraph [ref=f1e102]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=f1e103]:
      - listitem [ref=f1e104]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=f1e105] [cursor=pointer]
  - contentinfo [ref=f1e106]:
    - generic [ref=f1e107]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=f1e108]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  232 |   });
  233 |   await expect(page.locator("#recovery-message")).toContainText(
  234 |     "valid: DOCUMENT_VALID",
  235 |   );
  236 |   expect(await exported(page, "Export original")).toEqual(png);
  237 |   await page.getByRole("button", { name: "Close", exact: true }).click();
  238 |   const bad = Buffer.from(png);
  239 |   bad[29] ^= 1;
  240 |   await page
  241 |     .getByLabel("Open document file", { exact: true })
  242 |     .setInputFiles({ name: "bad.png", mimeType: "image/png", buffer: bad });
  243 |   await expect(page.locator("#recovery-message")).toContainText("PNG_CRC");
  244 |   expect(await exported(page, "Export original")).toEqual(bad);
  245 |   await page.getByRole("button", { name: "Close", exact: true }).click();
  246 |   const bare = await page.evaluate(() => {
  247 |     const c = document.createElement("canvas");
  248 |     return c.toDataURL("image/png").split(",")[1];
  249 |   });
  250 |   await page.getByLabel("Open document file", { exact: true }).setInputFiles({
  251 |     name: "bare.png",
  252 |     mimeType: "image/png",
  253 |     buffer: Buffer.from(bare, "base64"),
  254 |   });
  255 |   await expect(page.locator("#recovery-message")).toContainText(
  256 |     "PNG_METADATA_MISSING",
  257 |   );
  258 | });
  259 | test("AT-S02-01 browser: cancel during delayed file read fences the late review", async ({
  260 |   page,
  261 | }) => {
  262 |   await page.evaluate(() => {
  263 |     const read = File.prototype.arrayBuffer;
  264 |     File.prototype.arrayBuffer = async function () {
  265 |       await new Promise((r) => setTimeout(r, 700));
  266 |       return read.call(this);
  267 |     };
  268 |   });
  269 |   await page.getByLabel("Open document file", { exact: true }).setInputFiles({
  270 |     name: "delayed.json",
  271 |     mimeType: "application/json",
  272 |     buffer: Buffer.from(JSON.stringify(fixture())),
  273 |   });
  274 |   await expect(page.locator("#recovery-message")).toContainText(
  275 |     "READING_INPUT",
  276 |   );
  277 |   await page.getByRole("button", { name: "Close", exact: true }).click();
  278 |   await page.waitForTimeout(900);
  279 |   await expect(page.locator("#recovery")).not.toBeVisible();
  280 |   await expect(page.locator(".node")).toHaveCount(1);
  281 | });
  282 | 
  283 | test("M1 browser: boundary missing-module rename rejects save, retains prior ACK, then saves and reopens without opaque loss", async ({
  284 |   page,
  285 | }) => {
  286 |   const errors: string[] = [];
  287 |   page.on("pageerror", (e) => errors.push(e.message));
  288 |   const doc = fixture(),
  289 |     node = doc.graph.stages[1].network.nodes[1];
  290 |   node.type.fingerprint = "missing-boundary";
  291 |   doc.graph.modules.push({
  292 |     moduleId: node.type.moduleId,
  293 |     version: node.type.version,
  294 |     fingerprint: node.type.fingerprint,
  295 |   });
  296 |   node.state = { privateData: "", unicode: "中文🍇" };
  297 |   node.state.privateData = "x".repeat(
  298 |     512000 - Buffer.byteLength(JSON.stringify(doc)),
  299 |   );
  300 |   expect(Buffer.byteLength(JSON.stringify(doc))).toBe(512000);
  301 |   await choose(page, doc);
  302 |   page.once("dialog", (dialog) => dialog.accept());
  303 |   await page.getByRole("button", { name: "Open in new session" }).click();
  304 |   await page.getByRole("button", { name: "Save", exact: true }).click();
  305 |   await expect(page.locator("#save-state")).toHaveText("Saved");
  306 |   async function stored() {
  307 |     return page.evaluate(async (key) => {
  308 |       const db = await new Promise<IDBDatabase>((resolve, reject) => {
  309 |         const request = indexedDB.open("grape-documents-v2", 1);
  310 |         request.onsuccess = () => resolve(request.result);
  311 |         request.onerror = () => reject(request.error);
  312 |       });
  313 |       try {
  314 |         return await new Promise<string>((resolve, reject) => {
  315 |           const request = db
  316 |             .transaction("documents")
  317 |             .objectStore("documents")
  318 |             .get(key);
  319 |           request.onsuccess = () => resolve(request.result.text);
  320 |           request.onerror = () => reject(request.error);
  321 |         });
  322 |       } finally {
  323 |         db.close();
  324 |       }
  325 |     }, doc.graph.id);
  326 |   }
  327 |   const prior = await stored();
  328 |   expect(JSON.parse(prior)).toEqual(doc);
  329 |   await page
  330 |     .locator(".node h3")
  331 |     .filter({ hasText: /^Float$/ })
> 332 |     .click();
      |      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  333 |   page.once("dialog", (dialog) => dialog.accept("Boundary renamed longer"));
  334 |   await page.getByRole("button", { name: "Rename node" }).click();
  335 |   const revision = await page.locator(".canvas").getAttribute("data-revision");
  336 |   await page.getByRole("button", { name: "Save", exact: true }).click();
  337 |   await expect(page.locator("#message")).toContainText("DOCUMENT_SIZE");
  338 |   await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
  339 |   expect(await stored()).toBe(prior);
  340 |   expect(await page.locator(".canvas").getAttribute("data-revision")).toBe(
  341 |     revision,
  342 |   );
  343 |   await expect(
  344 |     page.locator(".node h3").filter({ hasText: /^Boundary renamed longer$/ }),
  345 |   ).toBeVisible();
  346 |   await page.screenshot({
  347 |     path: `${process.env.GRAPE_EVIDENCE_DIR ?? "evidence/s02"}/save-limit-rejected.png`,
  348 |     fullPage: true,
  349 |   });
  350 |   page.once("dialog", (dialog) => dialog.accept("X"));
  351 |   await page.getByRole("button", { name: "Rename node" }).click();
  352 |   await page.getByRole("button", { name: "Save", exact: true }).click();
  353 |   await expect(page.locator("#save-state")).toHaveText("Saved");
  354 |   const saved = await stored();
  355 |   expect(Buffer.byteLength(saved)).toBeLessThanOrEqual(512000);
  356 |   await page.getByRole("button", { name: "Open saved", exact: true }).click();
  357 |   await page.locator("#saved-list button").click();
  358 |   const reopened = JSON.parse((await exported(page)).toString());
  359 |   expect(reopened).toEqual(JSON.parse(saved));
  360 |   expect(reopened.graph.stages[1].network.nodes[1]).toEqual({
  361 |     ...node,
  362 |     name: "X",
  363 |   });
  364 |   await expect(page.locator("#save-state")).toHaveText("Saved");
  365 |   expect(errors).toEqual([]);
  366 | });
  367 | 
```