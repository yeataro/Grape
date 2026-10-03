# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s02.spec.ts >> AT-S02-01 browser: cancel during delayed file read fences the late review
- Location: tests\browser\s02.spec.ts:261:1

# Error details

```
Error: locator.setInputFiles: Error: strict mode violation: locator('input[type=file]') resolved to 2 elements:
    1) <input type="file" accept=".json,.sgrape-function.json" aria-label="Import Personal package"/> aka getByLabel('Import Personal package')
    2) <input hidden="" type="file" accept=".json,.grape.json,.png,application/json,image/png"/> aka locator('input[type="file"]').nth(1)

Call log:
  - waiting for locator('input[type=file]')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]: ●
      - text: Grape
      - generic [ref=e6]: SHADER WORKSPACE
    - navigation "Document actions" [ref=e7]:
      - button "New document" [ref=e8] [cursor=pointer]
      - button "Save" [ref=e9] [cursor=pointer]
      - button "Open saved" [ref=e10] [cursor=pointer]
      - button "Export JSON" [ref=e11] [cursor=pointer]
      - button "Export PNG" [ref=e12] [cursor=pointer]
      - button "Open file" [ref=e13] [cursor=pointer]
      - button "Generate GLSL" [ref=e14] [cursor=pointer]
      - button "Second Canvas" [ref=e15] [cursor=pointer]
      - button "Lock editing" [ref=e16] [cursor=pointer]
      - button "Personal Library" [ref=e17] [cursor=pointer]
    - generic [ref=e18]:
      - generic [ref=e19]: Unsaved changes
      - generic [ref=e20]: Host-free
  - status [ref=e21]
  - generic [ref=e23]:
    - button "Add Float" [ref=e24] [cursor=pointer]
    - button "Add Multiply" [ref=e25] [cursor=pointer]
    - button "Add Compose" [ref=e26] [cursor=pointer]
    - button "Add Array repeat" [ref=e27] [cursor=pointer]
    - button "Undo" [disabled] [ref=e28]
    - button "Redo" [disabled] [ref=e29]
    - button "Delete selected" [ref=e30] [cursor=pointer]
    - alert
  - main [ref=e31]:
    - generic [ref=e33]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e34]:
        - group "Image output" [ref=e35]:
          - heading "Image output" [level=3] [ref=e36]
          - generic [ref=e37]:
            - button "Image output input color" [ref=e38] [cursor=pointer]:
              - generic [ref=e39]: ●
              - generic [ref=e40]: color
            - generic [ref=e41]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e42]:
          - button "New subgraph" [ref=e43] [cursor=pointer]
          - button "Library subgraph" [ref=e44] [cursor=pointer]
          - button "Encapsulate" [ref=e45] [cursor=pointer]
          - button "Make independent" [ref=e46] [cursor=pointer]
          - button "Enter subgraph" [ref=e47] [cursor=pointer]
          - button "Up" [ref=e48] [cursor=pointer]
          - button "Arrange nodes" [ref=e49] [cursor=pointer]
          - button "Frame selection" [ref=e50] [cursor=pointer]
          - group [ref=e51]:
            - generic "Local clipboard" [ref=e52]
          - group [ref=e53]:
            - generic "Structures" [ref=e54]
            - option "New structure" [selected]
    - complementary [ref=e55]:
      - generic [ref=e56]:
        - heading "Inspector" [level=2] [ref=e57]
        - paragraph [ref=e58]: Select a node to inspect its parameters.
  - generic [ref=e60]:
    - heading "Shader output" [level=2] [ref=e61]
    - paragraph [ref=e62]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e63]:
      - listitem [ref=e64]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e65] [cursor=pointer]
  - contentinfo [ref=e66]:
    - generic [ref=e67]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e68]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  171 |   expect(savedNode.type).toEqual(node.type);
  172 |   expect(savedNode.position).not.toEqual(node.position);
  173 |   await page.getByRole("button", { name: "Save", exact: true }).click();
  174 |   await expect(page.locator("#save-state")).toHaveText("Saved");
  175 |   await page.getByRole("button", { name: "Open saved", exact: true }).click();
  176 |   await page.locator("#saved-list button").click();
  177 |   expect(JSON.parse((await exported(page)).toString())).toEqual(saved);
  178 | });
  179 | test("AT-S02-03 boundary browser: unmapped legacy remains explicit with provenance and original export", async ({
  180 |   page,
  181 | }) => {
  182 |   const legacy = {
  183 |     format: "td-sgrape",
  184 |     definitionUuid: "known-uuid",
  185 |     revisionHash: "unmapped",
  186 |     archive: { opaque: "保留" },
  187 |   };
  188 |   await choose(page, legacy);
  189 |   await expect(page.locator("#recovery-message")).toContainText(
  190 |     "IMPORT_CONVERTER_REQUIRED",
  191 |   );
  192 |   await expect(page.getByLabel("Inspection and proposal")).toContainText(
  193 |     "G-VERSION-COMPAT",
  194 |   );
  195 |   await expect(
  196 |     page.getByRole("button", { name: "Accept replacement (one Undo)" }),
  197 |   ).not.toBeVisible();
  198 |   expect(await exported(page, "Export original")).toEqual(
  199 |     Buffer.from(JSON.stringify(legacy)),
  200 |   );
  201 | });
  202 | test("AT-S02-04 browser: real Canvas PNG preview/export/reimport, malformed CRC and missing metadata", async ({
  203 |   page,
  204 | }) => {
  205 |   const doc = fixture();
  206 |   doc.graph.extensions["test.notes"] = { cjk: "中文", nonBMP: "🍇" };
  207 |   await choose(page, doc);
  208 |   await page
  209 |     .getByRole("button", { name: "Accept replacement (one Undo)" })
  210 |     .click();
  211 |   const json = JSON.parse((await exported(page)).toString());
  212 |   await page.getByRole("button", { name: "Export PNG", exact: true }).click();
  213 |   await expect(
  214 |     page.getByRole("button", { name: "Download PNG" }),
  215 |   ).toBeEnabled();
  216 |   const image = page.getByRole("img", { name: "Preview PNG export" });
  217 |   expect(
  218 |     await image.evaluate((img: HTMLImageElement) => img.naturalWidth),
  219 |   ).toBeGreaterThanOrEqual(640);
  220 |   const png = await exported(page, "Download PNG");
  221 |   expect(JSON.parse(unwrapPNG(png))).toEqual(json);
  222 |   await page.screenshot({
  223 |     path: `${process.env.GRAPE_EVIDENCE_DIR ?? "evidence/s02"}/png-preview.png`,
  224 |   });
  225 |   await page.getByRole("button", { name: "Cancel", exact: true }).click();
  226 |   await page
  227 |     .locator("input[type=file]")
  228 |     .setInputFiles({
  229 |       name: "roundtrip.png",
  230 |       mimeType: "image/png",
  231 |       buffer: png,
  232 |     });
  233 |   await expect(page.locator("#recovery-message")).toContainText(
  234 |     "valid: DOCUMENT_VALID",
  235 |   );
  236 |   expect(await exported(page, "Export original")).toEqual(png);
  237 |   await page.getByRole("button", { name: "Close", exact: true }).click();
  238 |   const bad = Buffer.from(png);
  239 |   bad[29] ^= 1;
  240 |   await page
  241 |     .locator("input[type=file]")
  242 |     .setInputFiles({ name: "bad.png", mimeType: "image/png", buffer: bad });
  243 |   await expect(page.locator("#recovery-message")).toContainText("PNG_CRC");
  244 |   expect(await exported(page, "Export original")).toEqual(bad);
  245 |   await page.getByRole("button", { name: "Close", exact: true }).click();
  246 |   const bare = await page.evaluate(() => {
  247 |     const c = document.createElement("canvas");
  248 |     return c.toDataURL("image/png").split(",")[1];
  249 |   });
  250 |   await page
  251 |     .locator("input[type=file]")
  252 |     .setInputFiles({
  253 |       name: "bare.png",
  254 |       mimeType: "image/png",
  255 |       buffer: Buffer.from(bare, "base64"),
  256 |     });
  257 |   await expect(page.locator("#recovery-message")).toContainText(
  258 |     "PNG_METADATA_MISSING",
  259 |   );
  260 | });
  261 | test("AT-S02-01 browser: cancel during delayed file read fences the late review", async ({
  262 |   page,
  263 | }) => {
  264 |   await page.evaluate(() => {
  265 |     const read = File.prototype.arrayBuffer;
  266 |     File.prototype.arrayBuffer = async function () {
  267 |       await new Promise((r) => setTimeout(r, 700));
  268 |       return read.call(this);
  269 |     };
  270 |   });
> 271 |   await page
      |   ^ Error: locator.setInputFiles: Error: strict mode violation: locator('input[type=file]') resolved to 2 elements:
  272 |     .locator("input[type=file]")
  273 |     .setInputFiles({
  274 |       name: "delayed.json",
  275 |       mimeType: "application/json",
  276 |       buffer: Buffer.from(JSON.stringify(fixture())),
  277 |     });
  278 |   await expect(page.locator("#recovery-message")).toContainText(
  279 |     "READING_INPUT",
  280 |   );
  281 |   await page.getByRole("button", { name: "Close", exact: true }).click();
  282 |   await page.waitForTimeout(900);
  283 |   await expect(page.locator("#recovery")).not.toBeVisible();
  284 |   await expect(page.locator(".node")).toHaveCount(1);
  285 | });
  286 | 
  287 | test("M1 browser: boundary missing-module rename rejects save, retains prior ACK, then saves and reopens without opaque loss", async ({
  288 |   page,
  289 | }) => {
  290 |   const errors: string[] = [];
  291 |   page.on("pageerror", (e) => errors.push(e.message));
  292 |   const doc = fixture(),
  293 |     node = doc.graph.stages[1].network.nodes[1];
  294 |   node.type.fingerprint = "missing-boundary";
  295 |   doc.graph.modules.push({
  296 |     moduleId: node.type.moduleId,
  297 |     version: node.type.version,
  298 |     fingerprint: node.type.fingerprint,
  299 |   });
  300 |   node.state = { privateData: "", unicode: "中文🍇" };
  301 |   node.state.privateData = "x".repeat(
  302 |     512000 - Buffer.byteLength(JSON.stringify(doc)),
  303 |   );
  304 |   expect(Buffer.byteLength(JSON.stringify(doc))).toBe(512000);
  305 |   await choose(page, doc);
  306 |   page.once("dialog", (dialog) => dialog.accept());
  307 |   await page.getByRole("button", { name: "Open in new session" }).click();
  308 |   await page.getByRole("button", { name: "Save", exact: true }).click();
  309 |   await expect(page.locator("#save-state")).toHaveText("Saved");
  310 |   async function stored() {
  311 |     return page.evaluate(async (key) => {
  312 |       const db = await new Promise<IDBDatabase>((resolve, reject) => {
  313 |         const request = indexedDB.open("grape-documents-v2", 1);
  314 |         request.onsuccess = () => resolve(request.result);
  315 |         request.onerror = () => reject(request.error);
  316 |       });
  317 |       try {
  318 |         return await new Promise<string>((resolve, reject) => {
  319 |           const request = db
  320 |             .transaction("documents")
  321 |             .objectStore("documents")
  322 |             .get(key);
  323 |           request.onsuccess = () => resolve(request.result.text);
  324 |           request.onerror = () => reject(request.error);
  325 |         });
  326 |       } finally {
  327 |         db.close();
  328 |       }
  329 |     }, doc.graph.id);
  330 |   }
  331 |   const prior = await stored();
  332 |   expect(JSON.parse(prior)).toEqual(doc);
  333 |   await page
  334 |     .locator(".node h3")
  335 |     .filter({ hasText: /^Float$/ })
  336 |     .click();
  337 |   page.once("dialog", (dialog) => dialog.accept("Boundary renamed longer"));
  338 |   await page.getByRole("button", { name: "Rename node" }).click();
  339 |   const revision = await page.locator(".canvas").getAttribute("data-revision");
  340 |   await page.getByRole("button", { name: "Save", exact: true }).click();
  341 |   await expect(page.locator("#message")).toContainText("DOCUMENT_SIZE");
  342 |   await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
  343 |   expect(await stored()).toBe(prior);
  344 |   expect(await page.locator(".canvas").getAttribute("data-revision")).toBe(
  345 |     revision,
  346 |   );
  347 |   await expect(
  348 |     page.locator(".node h3").filter({ hasText: /^Boundary renamed longer$/ }),
  349 |   ).toBeVisible();
  350 |   await page.screenshot({
  351 |     path: `${process.env.GRAPE_EVIDENCE_DIR ?? "evidence/s02"}/save-limit-rejected.png`,
  352 |     fullPage: true,
  353 |   });
  354 |   page.once("dialog", (dialog) => dialog.accept("X"));
  355 |   await page.getByRole("button", { name: "Rename node" }).click();
  356 |   await page.getByRole("button", { name: "Save", exact: true }).click();
  357 |   await expect(page.locator("#save-state")).toHaveText("Saved");
  358 |   const saved = await stored();
  359 |   expect(Buffer.byteLength(saved)).toBeLessThanOrEqual(512000);
  360 |   await page.getByRole("button", { name: "Open saved", exact: true }).click();
  361 |   await page.locator("#saved-list button").click();
  362 |   const reopened = JSON.parse((await exported(page)).toString());
  363 |   expect(reopened).toEqual(JSON.parse(saved));
  364 |   expect(reopened.graph.stages[1].network.nodes[1]).toEqual({
  365 |     ...node,
  366 |     name: "X",
  367 |   });
  368 |   await expect(page.locator("#save-state")).toHaveText("Saved");
  369 |   expect(errors).toEqual([]);
  370 | });
  371 | 
```