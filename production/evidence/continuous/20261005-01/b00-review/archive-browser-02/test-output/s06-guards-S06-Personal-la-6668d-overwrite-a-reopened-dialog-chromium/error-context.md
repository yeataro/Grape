# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-guards.spec.ts >> S06 Personal late insertion and refresh results cannot close or overwrite a reopened dialog
- Location: tests\browser\s06-guards.spec.ts:268:1

# Error details

```
Error: page.evaluate: TypeError: Failed to fetch dynamically imported module: http://127.0.0.1:46261/apps/web/personal.ts
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - text: Grape
      - generic [ref=e9]: SHADER WORKSPACE
      - generic "Implementation 30c867945c992d25956a2a32825de34571f7749e" [ref=e10]: S06-debug-30c8679
      - button "本輪更新" [ref=e11] [cursor=pointer]
    - navigation "Document actions" [ref=e12]:
      - button "Save" [ref=e13] [cursor=pointer]
      - button "Generate GLSL" [ref=e16] [cursor=pointer]
    - generic [ref=e19]:
      - generic [ref=e20]: Unsaved changes
      - generic [ref=e21]: Host-free
  - generic [ref=e23]:
    - button "Undo" [disabled] [ref=e24]
    - button "Redo" [disabled] [ref=e27]
    - button "Delete selected" [ref=e30] [cursor=pointer]
    - alert
  - main [ref=e31]:
    - generic [ref=e33]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e34]:
        - group "Image output" [ref=e35]:
          - heading "Image output" [level=3] [ref=e36]
          - generic [ref=e37]:
            - button "Image output input color" [ref=e38] [cursor=pointer]
            - generic [ref=e39]: color
            - generic [ref=e40]: vec4
            - generic "Current local value; edit in Inspector" [ref=e41]: "[0,0,0,0]"
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e42]:
          - button "New subgraph" [ref=e43] [cursor=pointer]
          - button "Library subgraph" [ref=e44] [cursor=pointer]
          - button "Encapsulate" [ref=e45] [cursor=pointer]
          - button "Make independent" [ref=e46] [cursor=pointer]
          - button "Enter subgraph" [ref=e47] [cursor=pointer]
          - button "Arrange nodes" [ref=e48] [cursor=pointer]
          - button "Frame selection" [ref=e49] [cursor=pointer]
          - group [ref=e50]:
            - generic "Local clipboard" [ref=e51] [cursor=pointer]
          - group [ref=e52]:
            - generic "Structures" [ref=e53] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e54]:
          - button "Vertex" [ref=e55] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e56] [cursor=pointer]
        - generic [ref=e57]:
          - button "Add Node" [ref=e58] [cursor=pointer]
          - button "Browse nodes" [ref=e61] [cursor=pointer]
          - button "Up" [disabled] [ref=e64]
          - button "Shortcuts" [ref=e67] [cursor=pointer]
    - complementary [ref=e70]:
      - generic [ref=e71]:
        - heading "Inspector" [level=2] [ref=e72]
        - paragraph [ref=e73]: Select a node to inspect its parameters.
  - contentinfo [ref=e74]:
    - button "Project actions" [ref=e75] [cursor=pointer]
    - status [ref=e76]:
      - button "Read full application status" [disabled] [ref=e77]
    - button "Shader output" [ref=e78] [cursor=pointer]
    - button "Hints" [ref=e79] [cursor=pointer]
```

# Test source

```ts
  171 | }) => {
  172 |   const context = await browser.newContext({
  173 |       hasTouch: true,
  174 |       viewport: { width: 1440, height: 1000 },
  175 |     }),
  176 |     page = await context.newPage();
  177 |   try {
  178 |     await page.goto(process.env.GRAPE_BASE_URL ?? "http://127.0.0.1:4206");
  179 |     const before = await doc(page),
  180 |       r = (await page.locator(".canvas").boundingBox())!,
  181 |       cdp = await context.newCDPSession(page),
  182 |       first = { x: r.x + 450, y: r.y + 350, id: 0 },
  183 |       second = { x: r.x + 500, y: r.y + 400, id: 1 };
  184 |     await cdp.send("Input.dispatchTouchEvent", {
  185 |       type: "touchStart",
  186 |       touchPoints: [first],
  187 |     });
  188 |     await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  189 |     await page.waitForTimeout(650);
  190 |     await expect(page.getByRole("menu")).toBeHidden();
  191 |     await cdp.send("Input.dispatchTouchEvent", {
  192 |       type: "touchEnd",
  193 |       touchPoints: [],
  194 |     });
  195 |     await cdp.send("Input.dispatchTouchEvent", {
  196 |       type: "touchStart",
  197 |       touchPoints: [first],
  198 |     });
  199 |     await cdp.send("Input.dispatchTouchEvent", {
  200 |       type: "touchStart",
  201 |       touchPoints: [first, second],
  202 |     });
  203 |     await page.waitForTimeout(650);
  204 |     await expect(page.getByRole("menu")).toBeHidden();
  205 |     await cdp.send("Input.dispatchTouchEvent", {
  206 |       type: "touchEnd",
  207 |       touchPoints: [],
  208 |     });
  209 |     await cdp.send("Input.dispatchTouchEvent", {
  210 |       type: "touchStart",
  211 |       touchPoints: [first],
  212 |     });
  213 |     await expect(page.getByRole("menu")).toBeVisible();
  214 |     await cdp.send("Input.dispatchTouchEvent", {
  215 |       type: "touchEnd",
  216 |       touchPoints: [],
  217 |     });
  218 |     await page.keyboard.press("Escape");
  219 |     expect(await doc(page)).toEqual(before);
  220 |   } finally {
  221 |     await context.close();
  222 |   }
  223 | });
  224 | test("S06 native field context menu remains unprevented and touch hold never opens an object menu from a control", async ({
  225 |   page,
  226 |   browser,
  227 | }) => {
  228 |   await page.getByRole("button", { name: "New subgraph", exact: true }).click();
  229 |   await page
  230 |     .getByRole("button", { name: "Enter subgraph", exact: true })
  231 |     .click();
  232 |   const name = page.getByLabel("Subgraph name", { exact: true });
  233 |   const prevented = await name.evaluate((el) => {
  234 |     const event = new MouseEvent("contextmenu", {
  235 |       bubbles: true,
  236 |       cancelable: true,
  237 |     });
  238 |     el.dispatchEvent(event);
  239 |     return event.defaultPrevented;
  240 |   });
  241 |   expect(prevented).toBe(false);
  242 |   await expect(page.getByRole("menu")).toBeHidden();
  243 |   const context = await browser.newContext({
  244 |       hasTouch: true,
  245 |       viewport: { width: 1440, height: 1000 },
  246 |     }),
  247 |     touch = await context.newPage();
  248 |   try {
  249 |     await touch.goto(process.env.GRAPE_BASE_URL ?? "http://127.0.0.1:4206");
  250 |     const b = (await touch
  251 |         .getByRole("button", { name: "Add Node", exact: true })
  252 |         .boundingBox())!,
  253 |       cdp = await context.newCDPSession(touch);
  254 |     await cdp.send("Input.dispatchTouchEvent", {
  255 |       type: "touchStart",
  256 |       touchPoints: [{ x: b.x + b.width / 2, y: b.y + b.height / 2 }],
  257 |     });
  258 |     await touch.waitForTimeout(650);
  259 |     await expect(touch.getByRole("menu")).toBeHidden();
  260 |     await cdp.send("Input.dispatchTouchEvent", {
  261 |       type: "touchEnd",
  262 |       touchPoints: [],
  263 |     });
  264 |   } finally {
  265 |     await context.close();
  266 |   }
  267 | });
  268 | test("S06 Personal late insertion and refresh results cannot close or overwrite a reopened dialog", async ({
  269 |   page,
  270 | }) => {
> 271 |   await page.evaluate(async () => {
      |              ^ Error: page.evaluate: TypeError: Failed to fetch dynamically imported module: http://127.0.0.1:46261/apps/web/personal.ts
  272 |     const { mountPersonal } = await import("/apps/web/personal.ts"),
  273 |       host = document.createElement("aside");
  274 |     host.id = "personal-lifetime-fixture";
  275 |     document.body.append(host);
  276 |     const scope = { contextId: "fixture", loadId: "fixture" },
  277 |       context = { capture: () => ({ scope }) },
  278 |       gates: any = { insert: null, list: null, reports: [] };
  279 |     (window as any).personalGates = gates;
  280 |     const items = [
  281 |       {
  282 |         name: "fixture.json",
  283 |         asset: {
  284 |           name: "Fixture",
  285 |           entry: "r",
  286 |           resources: [{ id: "r", data: { interface: [] } }],
  287 |           stageKindIds: ["grape.stage.pixel"],
  288 |         },
  289 |       },
  290 |     ];
  291 |     const app: any = {
  292 |       readonly: false,
  293 |       busy: false,
  294 |       subscribe: () => () => {},
  295 |       insertPersonal: () =>
  296 |         new Promise((resolve) => {
  297 |           gates.insert = resolve;
  298 |         }),
  299 |     };
  300 |     const library: any = {
  301 |       list: () =>
  302 |         gates.delayList
  303 |           ? new Promise((resolve) => {
  304 |               gates.list = resolve;
  305 |             })
  306 |           : Promise.resolve({ items, issues: [] }),
  307 |     };
  308 |     mountPersonal(
  309 |       host,
  310 |       app,
  311 |       () => context as any,
  312 |       library,
  313 |       (error, operation) =>
  314 |         gates.reports.push({ error: String(error), operation }),
  315 |     );
  316 |   });
  317 |   const host = page.locator("#personal-lifetime-fixture"),
  318 |     open = host.getByRole("button", { name: "Personal Library", exact: true }),
  319 |     dialog = host.locator("dialog");
  320 |   await open.click();
  321 |   await dialog
  322 |     .getByRole("button", { name: "Insert Fixture", exact: true })
  323 |     .click();
  324 |   await dialog
  325 |     .getByRole("button", { name: "Close Personal", exact: true })
  326 |     .click();
  327 |   await expect(dialog).not.toBeVisible();
  328 |   await open.click();
  329 |   await expect(dialog).toBeVisible();
  330 |   await page.evaluate(() => (window as any).personalGates.insert());
  331 |   await expect(dialog).toBeVisible();
  332 |   await expect(dialog.locator("[role=status]")).toHaveText("1 saved subgraphs");
  333 |   await page.evaluate(() => ((window as any).personalGates.delayList = true));
  334 |   await dialog
  335 |     .getByRole("button", { name: "Refresh Personal", exact: true })
  336 |     .click();
  337 |   await dialog
  338 |     .getByRole("button", { name: "Close Personal", exact: true })
  339 |     .click();
  340 |   await expect(dialog).not.toBeVisible();
  341 |   await page.evaluate(() => ((window as any).personalGates.delayList = false));
  342 |   await open.click();
  343 |   await page.evaluate(() =>
  344 |     (window as any).personalGates.list({
  345 |       items: [],
  346 |       issues: [{ name: "old", code: "STALE_TEST" }],
  347 |     }),
  348 |   );
  349 |   await expect(dialog.locator("[role=status]")).toHaveText("1 saved subgraphs");
  350 |   await expect(
  351 |     dialog.getByRole("button", { name: "Insert Fixture", exact: true }),
  352 |   ).toBeVisible();
  353 | });
  354 | test("S06 competing touch cancels a primary node drag without a committed History entry", async ({
  355 |   browser,
  356 | }) => {
  357 |   const context = await browser.newContext({
  358 |       hasTouch: true,
  359 |       viewport: { width: 1440, height: 1000 },
  360 |     }),
  361 |     page = await context.newPage();
  362 |   try {
  363 |     await page.goto(process.env.GRAPE_BASE_URL ?? "http://127.0.0.1:4206");
  364 |     await createNode(page, "Multiply");
  365 |     const before = await doc(page),
  366 |       header = (await page
  367 |         .getByRole("heading", { name: "Multiply", exact: true })
  368 |         .boundingBox())!,
  369 |       canvas = (await page.locator(".canvas").boundingBox())!,
  370 |       cdp = await context.newCDPSession(page),
  371 |       a = { id: 0, x: header.x + 70, y: header.y + 16 },
```