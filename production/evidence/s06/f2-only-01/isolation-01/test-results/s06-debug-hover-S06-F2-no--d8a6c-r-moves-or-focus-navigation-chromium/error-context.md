# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-debug-hover.spec.ts >> S06 F2 no inspection serialization or clone during 80 trusted pointer moves or focus navigation
- Location: ..\..\..\production\tests\browser\s06-debug-hover.spec.ts:258:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 1
Received: 2
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
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e34]:
        - generic:
          - generic:
            - img:
              - generic "Edge 304415dd-00c2-462e-ba96-5c4889a09d3d" [ref=e35]
            - generic:
              - group "Image output" [ref=e36]:
                - heading "Image output" [level=3] [ref=e37]
                - generic [ref=e38]:
                  - button "Image output input color" [ref=e39] [cursor=pointer]
                  - generic [ref=e40]: color
                  - generic [ref=e41]: vec4
              - group "Color RGBA" [ref=e42]:
                - heading "Color RGBA" [level=3] [ref=e43]
                - generic [ref=e44]:
                  - button "Color RGBA output out" [ref=e45] [cursor=pointer]
                  - generic [ref=e46]: out
                  - generic [ref=e47]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e48]:
          - button "New subgraph" [ref=e49] [cursor=pointer]
          - button "Library subgraph" [ref=e50] [cursor=pointer]
          - button "Encapsulate" [ref=e51] [cursor=pointer]
          - button "Make independent" [ref=e52] [cursor=pointer]
          - button "Enter subgraph" [ref=e53] [cursor=pointer]
          - button "Arrange nodes" [ref=e54] [cursor=pointer]
          - button "Frame selection" [ref=e55] [cursor=pointer]
          - group [ref=e56]:
            - generic "Local clipboard" [ref=e57] [cursor=pointer]
          - group [ref=e58]:
            - generic "Structures" [ref=e59] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e60]:
          - button "Vertex" [ref=e61] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e62] [cursor=pointer]
        - generic [ref=e63]:
          - button "Add Node" [ref=e64] [cursor=pointer]
          - button "Browse nodes" [ref=e67] [cursor=pointer]
          - button "Up" [disabled] [ref=e70]
          - button "Shortcuts" [ref=e73] [cursor=pointer]
    - complementary [ref=e76]:
      - generic [ref=e77]:
        - heading "Inspector" [level=2] [ref=e78]
        - paragraph [ref=e79]: Color RGBA
        - button "Rename node" [ref=e80] [cursor=pointer]
        - generic [ref=e83]:
          - generic [ref=e84]: Value
          - generic [ref=e85]:
            - text: R
            - textbox "R" [ref=e86]: "0.55"
          - generic [ref=e87]:
            - text: G
            - textbox "G" [ref=e88]: "0.28"
          - generic [ref=e89]:
            - text: B
            - textbox "B" [ref=e90]: "0.9"
          - generic [ref=e91]:
            - text: A
            - textbox "A" [ref=e92]: "1"
          - alert
  - contentinfo [ref=e93]:
    - button "Project actions" [ref=e94] [cursor=pointer]
    - status [ref=e95]:
      - button "Read full application status" [disabled] [ref=e96]
    - button "Shader output" [ref=e97] [cursor=pointer]
    - button "Hints" [ref=e98] [cursor=pointer]
  - dialog "Object information" [ref=e99]:
    - heading "Object information" [level=2] [ref=e100]
    - region "Current object data" [active] [ref=e101]: "Panel: Canvas Identity: canvas-1 State: UI-only · visible { \"type\": \"grape.panel.canvas\", \"viewState\": { \"x\": 24, \"y\": 104, \"zoom\": 1 } }"
    - button "Close object details" [ref=e102] [cursor=pointer]
```

# Test source

```ts
  186 |   page,
  187 | }) => {
  188 |   const { c, n } = await fixture(page),
  189 |     original = await doc(page),
  190 |     id = await n.getAttribute("data-node");
  191 |   expect(await read(page, n)).toContain(id!);
  192 |   await close(page, n);
  193 |   await c.getByRole("button", { name: "Vertex", exact: true }).click();
  194 |   await expect(n).toHaveCount(0);
  195 |   await page.keyboard.press("F2");
  196 |   await expect(dialog(page)).not.toContainText(id!);
  197 |   if (await dialog(page).isVisible()) await page.keyboard.press("Escape");
  198 |   await c.getByRole("button", { name: "Pixel", exact: true }).click();
  199 |   await n.getByRole("heading").click();
  200 |   await clickAction(page, "Delete selected");
  201 |   await expect(n).toHaveCount(0);
  202 |   await clickAction(page, "Undo");
  203 |   const old = await n.elementHandle();
  204 |   await page
  205 |     .getByLabel("Open document file")
  206 |     .setInputFiles({
  207 |       name: "same-id.json",
  208 |       mimeType: "application/json",
  209 |       buffer: Buffer.from(JSON.stringify(original)),
  210 |     });
  211 |   await page
  212 |     .getByRole("button", { name: "Open in new session", exact: true })
  213 |     .click();
  214 |   expect(await old!.evaluate((e) => e.isConnected)).toBe(false);
  215 |   const fresh = page.locator('article[data-node="' + id + '"]');
  216 |   expect(await read(page, fresh)).toContain(id!);
  217 |   await close(page, fresh);
  218 |   expect(await doc(page)).toEqual(original);
  219 |   save("f2-public-lifetime", {
  220 |     id,
  221 |     newLoad: true,
  222 |     oldElementDisconnected: true,
  223 |   });
  224 | });
  225 | test("S06 F2 pending wire held drag readonly and natural Escape remain guarded", async ({
  226 |   page,
  227 | }) => {
  228 |   const { n } = await fixture(page),
  229 |     before = await doc(page);
  230 |   await n.locator('[data-direction="output"]').click();
  231 |   await page.keyboard.press("F2");
  232 |   await expect(dialog(page)).not.toBeVisible();
  233 |   await page.keyboard.press("Escape");
  234 |   await clickAction(page, "Lock editing");
  235 |   expect(await read(page, n)).toContain("Node:");
  236 |   await close(page, n);
  237 |   await n.getByRole("heading").click();
  238 |   const r = page.getByRole("textbox", { name: "R", exact: true });
  239 |   expect(await read(page, r)).toContain("Read-only");
  240 |   await close(page, r);
  241 |   await clickAction(page, "Lock editing");
  242 |   const b = (await n.getByRole("heading").boundingBox())!;
  243 |   await page.mouse.move(b.x + 20, b.y + 10);
  244 |   await page.mouse.down();
  245 |   await page.mouse.move(b.x + 60, b.y + 40, { steps: 5 });
  246 |   await page.keyboard.press("F2");
  247 |   await expect(dialog(page)).not.toBeVisible();
  248 |   await page.keyboard.press("Escape");
  249 |   await page.mouse.up();
  250 |   expect(await doc(page)).toEqual(before);
  251 |   save("f2-gesture", {
  252 |     pendingBlocked: true,
  253 |     heldMouseBlocked: true,
  254 |     readonlyReadable: true,
  255 |     naturalEscape: true,
  256 |   });
  257 | });
  258 | test("S06 F2 no inspection serialization or clone during 80 trusted pointer moves or focus navigation", async ({
  259 |   page,
  260 | }) => {
  261 |   const { n } = await fixture(page);
  262 |   await focus(page, n);
  263 |   await page.evaluate(() => {
  264 |     const c = structuredClone,
  265 |       s = JSON.stringify;
  266 |     (window as any).__counts = { clone: 0, stringify: 0 };
  267 |     window.structuredClone = (...a) => {
  268 |       (window as any).__counts.clone++;
  269 |       return c(...a);
  270 |     };
  271 |     JSON.stringify = ((...a: any[]) => {
  272 |       (window as any).__counts.stringify++;
  273 |       return (s as any)(...a);
  274 |     }) as typeof JSON.stringify;
  275 |   });
  276 |   const b = (await n.boundingBox())!;
  277 |   for (let i = 0; i < 80; i++)
  278 |     await page.mouse.move(b.x + 20 + (i % 50), b.y + 15);
  279 |   expect(await page.evaluate(() => (window as any).__counts)).toEqual({
  280 |     clone: 0,
  281 |     stringify: 0,
  282 |   });
  283 |   await page.keyboard.press("F2");
  284 |   await expect(dialog(page)).toBeVisible();
  285 |   const counts = await page.evaluate(() => (window as any).__counts);
> 286 |   expect(counts.stringify).toBe(1);
      |                            ^ Error: expect(received).toBe(expected) // Object.is equality
  287 |   save("f2-on-demand-counts", {
  288 |     moves: 80,
  289 |     before: { clone: 0, stringify: 0 },
  290 |     after: counts,
  291 |     limits:
  292 |       "Instrumented disposable browser, not universal performance guarantee.",
  293 |   });
  294 | });
  295 | test("S06 F2 complete long data narrow keyboard close and unchanged geometry", async ({
  296 |   page,
  297 | }) => {
  298 |   const { n } = await fixture(page),
  299 |     before = await doc(page),
  300 |     bounds = await n.boundingBox();
  301 |   await read(page, n);
  302 |   await page.setViewportSize({ width: 620, height: 380 });
  303 |   const text = dialog(page).getByRole("region");
  304 |   await page.keyboard.press("Control+End");
  305 |   await page.keyboard.press("End");
  306 |   await expect
  307 |     .poll(() =>
  308 |       text.evaluate((e) => e.scrollHeight - e.clientHeight - e.scrollTop),
  309 |     )
  310 |     .toBeLessThanOrEqual(1);
  311 |   const facts = await text.evaluate((e) => ({
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
```