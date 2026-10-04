# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-guards.spec.ts >> S06 Personal search and inspect are readonly, malformed import survives unrelated success, and insert restores one Undo
- Location: ..\..\..\production\tests\browser\s06-guards.spec.ts:101:1

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
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e34]:
        - generic:
          - generic:
            - img:
              - generic "Edge 806f2fd5-1b42-4c83-ba62-29f84d139b8f" [ref=e35]
            - generic:
              - group "Image output" [ref=e36]:
                - heading "Image output" [level=3] [ref=e37]
                - generic [ref=e38]:
                  - button "Image output input color" [ref=e39] [cursor=pointer]
                  - generic [ref=e40]: color
                  - generic [ref=e41]: vec4
              - group "Float" [ref=e42]:
                - heading "Float" [level=3] [ref=e43]
                - generic [ref=e44]:
                  - button "Float output value" [ref=e45] [cursor=pointer]
                  - generic [ref=e46]: value
                  - generic [ref=e47]: float
              - group "Subgraph" [ref=e48]:
                - heading "Subgraph" [level=3] [ref=e49]
                - generic [ref=e50]:
                  - button "Subgraph input Value" [ref=e51] [cursor=pointer]
                  - generic [ref=e52]: Value
                  - generic [ref=e53]: vec4
                  - generic "Current local value; edit in Inspector" [ref=e54]: "[1,1,1,1]"
                - generic [ref=e55]:
                  - button "Subgraph output Value" [ref=e56] [cursor=pointer]
                  - generic [ref=e57]: Value
                  - generic [ref=e58]: vec4
              - group "package-entry" [ref=e59]:
                - heading "Subgraph" [level=3] [ref=e60]
                - generic [ref=e62]:
                  - button "package-entry input Value" [ref=e63] [cursor=pointer]
                  - generic [ref=e64]: Value
                  - generic [ref=e65]: vec4
                  - generic "Current local value; edit in Inspector" [ref=e66]: "[1,1,1,1]"
                - generic [ref=e67]:
                  - button "package-entry output Value" [ref=e68] [cursor=pointer]
                  - generic [ref=e69]: Value
                  - generic [ref=e70]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e71]:
          - button "New subgraph" [ref=e72] [cursor=pointer]
          - button "Library subgraph" [ref=e73] [cursor=pointer]
          - button "Encapsulate" [ref=e74] [cursor=pointer]
          - button "Make independent" [ref=e75] [cursor=pointer]
          - button "Enter subgraph" [ref=e76] [cursor=pointer]
          - button "Arrange nodes" [ref=e77] [cursor=pointer]
          - button "Frame selection" [ref=e78] [cursor=pointer]
          - group [ref=e79]:
            - generic "Local clipboard" [ref=e80] [cursor=pointer]
          - group [ref=e81]:
            - generic "Structures" [ref=e82] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e83]:
          - button "Vertex" [ref=e84] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e85] [cursor=pointer]
        - generic [ref=e86]:
          - button "Add Node" [ref=e87] [cursor=pointer]
          - button "Browse nodes" [ref=e90] [cursor=pointer]
          - button "Up" [disabled] [ref=e93]
          - button "Shortcuts" [ref=e96] [cursor=pointer]
    - complementary [ref=e99]:
      - generic [ref=e100]:
        - heading "Inspector" [level=2] [ref=e101]
        - paragraph [ref=e102]: package-entry
        - button "Rename node" [ref=e103] [cursor=pointer]
        - generic [ref=e106]:
          - generic [ref=e107]: Value
          - textbox "Value" [ref=e108]: "[1,1,1,1]"
          - alert
  - contentinfo [ref=e109]:
    - button "Project actions" [expanded] [ref=e110] [cursor=pointer]
    - alert [ref=e111]:
      - button "Read full application status" [ref=e112] [cursor=pointer]: PERSONAL_FORMAT
    - button "Shader output" [ref=e113] [cursor=pointer]
    - generic [ref=e114]:
      - button "Experimental features" [ref=e116] [cursor=pointer]
      - button "Read object details" [disabled] [ref=e117]
    - button "Hints" [ref=e118] [cursor=pointer]
  - menu "Project actions" [ref=e119]:
    - heading "Project actions" [level=2] [ref=e120]
    - generic [ref=e121]:
      - menuitem "New document" [ref=e122] [cursor=pointer]
      - menuitem "Upgrade subgraph owners" [ref=e125] [cursor=pointer]
      - menuitem "Open saved" [ref=e126] [cursor=pointer]
      - menuitem "Export JSON" [ref=e129] [cursor=pointer]
      - menuitem "Export PNG" [ref=e132] [cursor=pointer]
      - menuitem "Open file" [ref=e135] [cursor=pointer]
      - menuitem "Second Canvas" [ref=e138] [cursor=pointer]
      - menuitem "Lock editing" [ref=e141] [cursor=pointer]
      - menuitem "Personal Library" [active] [ref=e144] [cursor=pointer]
    - button "Close project actions" [ref=e145] [cursor=pointer]
```

# Test source

```ts
  57  | });
  58  | test("S06 Canvas connection failure persists across movement and unrelated successful actions until matching recovery", async ({
  59  |   page,
  60  | }) => {
  61  |   await createNode(page, "Float");
  62  |   await createNode(page, "Multiply");
  63  |   const outputs = page.locator(".nodes [data-direction=output]");
  64  |   await outputs.nth(0).click();
  65  |   await outputs.nth(1).click();
  66  |   await expect(page.locator(".canvas-notice")).toContainText("PORT_DIRECTION");
  67  |   const before = await doc(page),
  68  |     r = (await page.locator(".canvas").boundingBox())!;
  69  |   await page.mouse.move(r.x + 450, r.y + 400, { steps: 5 });
  70  |   await clickAction(page, "Save");
  71  |   await expect(page.locator(".canvas-notice")).toContainText("PORT_DIRECTION");
  72  |   expect(await doc(page)).toEqual(before);
  73  |   await outputs.first().click();
  74  |   await page.locator(".nodes [data-direction=input]").first().click();
  75  |   await expect(page.locator(".canvas-notice")).not.toContainText(
  76  |     "PORT_DIRECTION",
  77  |   );
  78  | });
  79  | test("S06 category collapse survives query changes and whitespace uses the tree without a Graph edit", async ({
  80  |   page,
  81  | }) => {
  82  |   const before = await doc(page);
  83  |   await page.getByRole("button", { name: "Browse nodes", exact: true }).click();
  84  |   const catalog = page.getByRole("dialog", { name: "Node catalog" }),
  85  |     search = catalog.getByLabel("Search nodes", { exact: true }),
  86  |     group = catalog.locator(".catalog-list details").first();
  87  |   const label = await group.locator(":scope > summary").textContent();
  88  |   await group.locator(":scope > summary").click();
  89  |   await expect(group).not.toHaveAttribute("open");
  90  |   await search.fill("Multiply");
  91  |   await expect(
  92  |     catalog.getByRole("button", { name: "Inspect Multiply", exact: true }),
  93  |   ).toBeVisible();
  94  |   await search.fill("   ");
  95  |   const restored = catalog.locator(".catalog-list details").first();
  96  |   await expect(restored.locator(":scope > summary")).toHaveText(label!);
  97  |   await expect(restored).not.toHaveAttribute("open");
  98  |   await page.keyboard.press("Escape");
  99  |   expect(await doc(page)).toEqual(before);
  100 | });
  101 | test("S06 Personal search and inspect are readonly, malformed import survives unrelated success, and insert restores one Undo", async ({
  102 |   page,
  103 | }) => {
  104 |   await createNode(page, "Float");
  105 |   await page.locator(".nodes [data-direction=output]").click();
  106 |   await page.locator(".nodes [data-direction=input]").click();
  107 |   await page.getByRole("button", { name: "New subgraph", exact: true }).click();
  108 |   await clickAction(page, "Personal Library");
  109 |   const dialog = page.locator("dialog[open]");
  110 |   await page
  111 |     .getByRole("button", { name: "Save selected subgraph", exact: true })
  112 |     .click();
  113 |   await expect(dialog.locator("[role=status]")).toContainText("Saved");
  114 |   const search = dialog.getByLabel("Search Personal Library");
  115 |   await search.fill("ＳＵＢＧＲＡＰＨ");
  116 |   await expect(
  117 |     dialog.getByRole("button", { name: "Inspect Subgraph", exact: true }),
  118 |   ).toBeVisible();
  119 |   await search.fill("missing");
  120 |   await expect(dialog.locator("[data-personal-file]:visible")).toHaveCount(0);
  121 |   await search.fill("Subgraph");
  122 |   await dialog
  123 |     .getByRole("button", { name: "Inspect Subgraph", exact: true })
  124 |     .click();
  125 |   await expect(dialog.locator("pre")).toContainText("input Value: glsl.vec4");
  126 |   await dialog.getByLabel("Import Personal package").setInputFiles({
  127 |     name: "bad.json",
  128 |     mimeType: "application/json",
  129 |     buffer: Buffer.from('{"bad":true}'),
  130 |   });
  131 |   await expect(page.locator("#message")).toContainText("PERSONAL_FORMAT");
  132 |   await dialog
  133 |     .getByRole("button", { name: "Refresh Personal", exact: true })
  134 |     .click();
  135 |   await expect(page.locator("#message")).toContainText("PERSONAL_FORMAT");
  136 |   await dialog
  137 |     .getByRole("button", { name: "Close Personal", exact: true })
  138 |     .click();
  139 |   const before = await doc(page);
  140 |   await clickAction(page, "Lock editing");
  141 |   await clickAction(page, "Personal Library");
  142 |   await expect(
  143 |     dialog.getByRole("button", { name: "Insert Subgraph", exact: true }),
  144 |   ).toBeDisabled();
  145 |   await dialog
  146 |     .getByRole("button", { name: "Inspect Subgraph", exact: true })
  147 |     .click();
  148 |   await dialog
  149 |     .getByRole("button", { name: "Close Personal", exact: true })
  150 |     .click();
  151 |   expect(await doc(page)).toEqual(before);
  152 |   await clickAction(page, "Lock editing");
  153 |   await clickAction(page, "Personal Library");
  154 |   await dialog
  155 |     .getByRole("button", { name: "Insert Subgraph", exact: true })
  156 |     .click();
> 157 |   await expect(dialog).toHaveCount(0);
      |                        ^ Error: expect(locator).toHaveCount(expected) failed
  158 |   const after = await doc(page);
  159 |   await clickAction(page, "Undo");
  160 |   expect(await doc(page)).toEqual(before);
  161 |   await clickAction(page, "Redo");
  162 |   expect(await doc(page)).toEqual(after);
  163 |   fs.writeFileSync(
  164 |     path.join(process.env.GRAPE_EVIDENCE_DIR!, "personal-search-history.json"),
  165 |     JSON.stringify({ before, after }, null, 2),
  166 |     { flag: "wx" },
  167 |   );
  168 | });
  169 | test("S06 pending touch menu cancels on blur and second touch, while a completed blank hold is view only", async ({
  170 |   browser,
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
```