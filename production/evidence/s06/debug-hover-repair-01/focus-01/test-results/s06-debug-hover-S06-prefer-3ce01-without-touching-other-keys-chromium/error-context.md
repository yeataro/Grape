# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-debug-hover.spec.ts >> S06 preference malformed visibly falls back without touching other keys
- Location: ..\..\..\production\tests\browser\s06-debug-hover.spec.ts:256:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.experimental-issue')
Expected substring: "invalid"
Received string:    ""
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('.experimental-issue')
    14 × locator resolved to <p role="status" class="experimental-issue"></p>
       - unexpected value ""

```

```yaml
- banner:
  - text: Grape SHADER WORKSPACE Development · unversioned
  - button "本輪更新"
  - navigation "Document actions":
    - button "Save"
    - button "Generate GLSL"
  - text: Unsaved changes Host-free
- button "Undo" [disabled]
- button "Redo" [disabled]
- button "Delete selected"
- alert
- main:
  - text: Canvas 1
  - img
  - group "Image output":
    - heading "Image output" [level=3]
    - button "Image output input color"
    - text: color vec4
  - button "Untitled shader / pixel" [disabled]
  - button "New subgraph"
  - button "Library subgraph"
  - button "Encapsulate"
  - button "Make independent"
  - button "Enter subgraph"
  - button "Arrange nodes"
  - button "Frame selection"
  - group: Local clipboard
  - group: Structures
  - button "Vertex"
  - button "Pixel" [pressed]
  - button "Add Node"
  - button "Browse nodes"
  - button "Up" [disabled]
  - button "Shortcuts"
  - img
  - complementary:
    - heading "Inspector" [level=2]
    - paragraph: Select a node to inspect its parameters.
- contentinfo:
  - button "Project actions"
  - status:
    - button "Read full application status" [disabled]
  - button "Shader output"
  - button "Experimental features" [expanded]
  - button "Read object details" [disabled]
  - dialog "Hover preferences":
    - heading "Hover preferences" [level=2]
    - group "Hover information":
      - text: Hover information
      - checkbox "Show object information instead of normal hover hints"
      - text: Show object information instead of normal hover hints
      - status
    - button "Close experimental features"
  - button "Hints"
```

# Test source

```ts
  183 |   await n.getByRole("heading").click();
  184 |   await clickAction(page, "Delete selected");
  185 |   await expect(n).toHaveCount(0);
  186 |   await expect(page.locator(".hover-summary")).toBeEmpty();
  187 |   await clickAction(page, "Undo");
  188 |   await expect(n).toHaveCount(1);
  189 |   const old = await n.elementHandle();
  190 |   await page.getByLabel("Open document file").setInputFiles({
  191 |     name: "same-id.grape.json",
  192 |     mimeType: "application/json",
  193 |     buffer: Buffer.from(JSON.stringify(original)),
  194 |   });
  195 |   await page
  196 |     .getByRole("button", { name: "Open in new session", exact: true })
  197 |     .click();
  198 |   expect(await old!.evaluate((e) => e.isConnected)).toBe(false);
  199 |   await expect(dialog(page)).not.toBeVisible();
  200 |   await expect(page.locator(".hover-summary")).not.toContainText("Color RGBA");
  201 |   const fresh = page.locator(`article[data-node="${id}"]`);
  202 |   await fresh.getByRole("heading").hover();
  203 |   expect(await read(page)).toContain(id!);
  204 |   await close(page);
  205 |   expect(await documentJSON(page)).toEqual(original);
  206 |   save("lifetime-public", {
  207 |     id,
  208 |     samePersistentIdDifferentMount: true,
  209 |     stageDeletionUndoReopen: "passed",
  210 |   });
  211 | });
  212 | 
  213 | test("S06 pending connection and held gesture reject preference changes while readonly inspection remains", async ({
  214 |   page,
  215 | }) => {
  216 |   await enable(page);
  217 |   const { c, n } = await fixture(page),
  218 |     before = await documentJSON(page);
  219 |   await page.getByText("Experimental features", { exact: true }).click();
  220 |   await n.locator('[data-direction="output"]').click();
  221 |   await checkbox(page).click();
  222 |   await expect(checkbox(page)).toBeChecked();
  223 |   await expect(page.locator(".experimental-issue")).toContainText("connection");
  224 |   await page.keyboard.press("Escape");
  225 |   await page.getByText("Experimental features", { exact: true }).click();
  226 |   await clickAction(page, "Lock editing");
  227 |   await n.getByRole("heading").hover();
  228 |   expect(await read(page)).toContain("Node:");
  229 |   await close(page);
  230 |   expect(await documentJSON(page)).toEqual(before);
  231 |   await n.getByRole("heading").click();
  232 |   await page.getByRole("textbox", { name: "R", exact: true }).hover();
  233 |   expect(await read(page)).toContain("Read-only");
  234 |   await close(page);
  235 |   await clickAction(page, "Lock editing");
  236 |   await page.getByText("Experimental features", { exact: true }).click();
  237 |   await n.getByRole("heading").click();
  238 |   const b = (await n.getByRole("heading").boundingBox())!;
  239 |   await page.mouse.move(b.x + 20, b.y + 10);
  240 |   await page.mouse.down();
  241 |   await page.mouse.move(b.x + 60, b.y + 40, { steps: 5 });
  242 |   await checkbox(page).dispatchEvent("click");
  243 |   await expect(checkbox(page)).toBeChecked(); // synthetic concurrent UI event while real mouse gesture is held
  244 |   await page.keyboard.press("Escape");
  245 |   await page.mouse.up();
  246 |   expect(await documentJSON(page)).toEqual(before);
  247 |   save("gesture-preference-guard", {
  248 |     actualMouseDrag: true,
  249 |     concurrentCheckbox:
  250 |       "Synthetic click while held; no second physical pointer claim",
  251 |     naturalEscape: true,
  252 |   });
  253 | });
  254 | 
  255 | for (const bad of ["malformed", "denied", "read-denied"])
  256 |   test(`S06 preference ${bad} visibly falls back without touching other keys`, async ({
  257 |     page,
  258 |   }) => {
  259 |     await page.addInitScript((mode) => {
  260 |       localStorage.setItem("other-app", "retain");
  261 |       if (mode === "malformed")
  262 |         localStorage.setItem("grape.preferences.hover.v1", "{broken}");
  263 |       else if (mode === "read-denied") {
  264 |         const original = Storage.prototype.getItem;
  265 |         Storage.prototype.getItem = function (k) {
  266 |           if (k === "grape.preferences.hover.v1")
  267 |             throw new DOMException("Denied", "SecurityError");
  268 |           return original.call(this, k);
  269 |         };
  270 |       } else {
  271 |         const original = Storage.prototype.setItem;
  272 |         Storage.prototype.setItem = function (k, v) {
  273 |           if (k === "grape.preferences.hover.v1")
  274 |             throw new DOMException("Denied", "SecurityError");
  275 |           return original.call(this, k, v);
  276 |         };
  277 |       }
  278 |     }, bad);
  279 |     await page.reload();
  280 |     await page.getByText("Experimental features", { exact: true }).click();
  281 |     await expect(checkbox(page)).not.toBeChecked();
  282 |     if (bad === "malformed")
> 283 |       await expect(page.locator(".experimental-issue")).toContainText(
      |                                                         ^ Error: expect(locator).toContainText(expected) failed
  284 |         "invalid",
  285 |       );
  286 |     else if (bad === "denied") {
  287 |       await checkbox(page).click();
  288 |       await expect(checkbox(page)).not.toBeChecked();
  289 |       await expect(page.locator(".experimental-issue")).toContainText(
  290 |         "could not be saved",
  291 |       );
  292 |     } else
  293 |       await expect(page.locator(".experimental-issue")).toContainText(
  294 |         "unavailable",
  295 |       );
  296 |     expect(await page.evaluate(() => localStorage.getItem("other-app"))).toBe(
  297 |       "retain",
  298 |     );
  299 |     save("preference-" + bad, {
  300 |       issue: await page.locator(".experimental-issue").innerText(),
  301 |       current: await page.evaluate(() => {
  302 |         try {
  303 |           return localStorage.getItem("grape.preferences.hover.v1");
  304 |         } catch {
  305 |           return "storage unavailable";
  306 |         }
  307 |       }),
  308 |     });
  309 |   });
  310 | 
  311 | test("S06 diagnostic preference persists separately and rapid hover performs no per-move capture or serialization", async ({
  312 |   page,
  313 | }) => {
  314 |   await enable(page);
  315 |   await page.reload();
  316 |   await page.getByText("Experimental features", { exact: true }).click();
  317 |   await expect(checkbox(page)).toBeChecked();
  318 |   await page.keyboard.press("Escape");
  319 |   const { c, n } = await fixture(page),
  320 |     before = await documentJSON(page),
  321 |     selection = await c.getAttribute("data-selection");
  322 |   await page.evaluate(() => {
  323 |     const clone = window.structuredClone,
  324 |       stringify = JSON.stringify;
  325 |     (window as any).__hoverCounts = { clone: 0, stringify: 0 };
  326 |     window.structuredClone = (...args) => {
  327 |       (window as any).__hoverCounts.clone++;
  328 |       return clone(...args);
  329 |     };
  330 |     JSON.stringify = ((...args: any[]) => {
  331 |       (window as any).__hoverCounts.stringify++;
  332 |       return (stringify as any)(...args);
  333 |     }) as typeof JSON.stringify;
  334 |   });
  335 |   await n.getByRole("heading").hover();
  336 |   await page.evaluate(() => {
  337 |     (window as any).__hoverCounts = { clone: 0, stringify: 0 };
  338 |   });
  339 |   const b = (await n.getByRole("heading").boundingBox())!;
  340 |   for (let i = 0; i < 80; i++)
  341 |     await page.mouse.move(b.x + 10 + (i % 30), b.y + 10);
  342 |   const counts = await page.evaluate(() => (window as any).__hoverCounts);
  343 |   expect(counts).toEqual({ clone: 0, stringify: 0 });
  344 |   expect(await c.getAttribute("data-selection")).toBe(selection);
  345 |   expect(await documentJSON(page)).toEqual(before);
  346 |   save("rapid-hover-counts", {
  347 |     moves: 80,
  348 |     counts,
  349 |     methodology:
  350 |       "Browser-wide structuredClone and JSON.stringify counters after entry, actual trusted mouse movement within one current target; instrumentation only in disposable context. This is not a general performance/FPS claim.",
  351 |   });
  352 | });
  353 | 
  354 | test("S06 keyboard details and bounded long owner data are readable without selection layout changes", async ({
  355 |   page,
  356 | }) => {
  357 |   await enable(page);
  358 |   const { c, n } = await fixture(page);
  359 |   await n.getByRole("heading").click();
  360 |   const before = await documentJSON(page),
  361 |     geometry = await n.boundingBox();
  362 |   await n.getByRole("heading").hover();
  363 |   const button = page.getByRole("button", {
  364 |     name: "Read object details",
  365 |     exact: true,
  366 |   });
  367 |   // Pure keyboard target navigation and the explicit reader shortcut, without focus injection.
  368 |   for (
  369 |     let i = 0;
  370 |     i < 150 && !(await n.evaluate((el) => el === document.activeElement));
  371 |     i++
  372 |   )
  373 |     await page.keyboard.press("Shift+Tab");
  374 |   await expect(n).toBeFocused();
  375 |   await page.keyboard.press("F2");
  376 |   await expect(dialog(page)).toBeVisible();
  377 |   await page.setViewportSize({ width: 620, height: 380 });
  378 |   const text = dialog(page).getByRole("region");
  379 |   await page.keyboard.press("Control+End");
  380 |   await page.keyboard.press("End");
  381 |   await expect
  382 |     .poll(() =>
  383 |       text.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop),
```