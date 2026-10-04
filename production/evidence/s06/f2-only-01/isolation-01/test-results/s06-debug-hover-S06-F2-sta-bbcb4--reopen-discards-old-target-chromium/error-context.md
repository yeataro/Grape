# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-debug-hover.spec.ts >> S06 F2 stage deletion Undo same-ID document reopen discards old target
- Location: ..\..\..\production\tests\browser\s06-debug-hover.spec.ts:185:1

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "35df48e9-42c9-4f85-bfa2-a175f076579e"
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
    - generic [ref=e33]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e34]:
        - generic:
          - generic:
            - img:
              - generic "Edge cdad7723-aa4c-4f98-b63d-2419831103db" [ref=e35]
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
      - button "Read full application status" [ref=e96] [cursor=pointer]: Export started. Saved status is unchanged.
    - button "Shader output" [ref=e97] [cursor=pointer]
    - button "Hints" [ref=e98] [cursor=pointer]
  - dialog "Object information" [ref=e99]:
    - heading "Object information" [level=2] [ref=e100]
    - region "Current object data" [active] [ref=e101]: "Panel: Canvas Identity: canvas-1 State: UI-only · visible { \"type\": \"grape.panel.canvas\", \"viewState\": { \"x\": 24, \"y\": 104, \"zoom\": 1 } }"
    - button "Close object details" [ref=e102] [cursor=pointer]
```

# Test source

```ts
  91  |   await n.getByRole("heading").click();
  92  |   const r = page.getByRole("textbox", { name: "R", exact: true });
  93  |   const text = await read(page, r);
  94  |   expect(text).toContain("Parameter Widget:");
  95  |   expect(text).toContain('"committed"');
  96  |   await close(page, r);
  97  |   await clickAction(page, "Undo");
  98  |   const undone = await doc(page);
  99  |   await read(page, n);
  100 |   await close(page, n);
  101 |   await clickAction(page, "Redo");
  102 |   expect(await doc(page)).toEqual(before);
  103 |   expect(
  104 |     undone.graph.stages.find((s: any) => s.key === "pixel").network.edges,
  105 |   ).toHaveLength(0);
  106 |   save("f2-kinds", records);
  107 | });
  108 | for (const stored of ["true", "false", "{broken}", "denied"])
  109 |   test("S06 F2 ignores obsolete preference " + stored, async ({ page }) => {
  110 |     await page.addInitScript((value) => {
  111 |       localStorage.setItem("other-app", "retain");
  112 |       localStorage.setItem("grape.preferences.hover.v1", value);
  113 |       (window as any).__preferenceCalls = [];
  114 |       for (const method of ["getItem", "setItem", "removeItem"] as const) {
  115 |         const original = Storage.prototype[method];
  116 |         (Storage.prototype as any)[method] = function (
  117 |           k: string,
  118 |           ...args: any[]
  119 |         ) {
  120 |           if (k === "grape.preferences.hover.v1") {
  121 |             (window as any).__preferenceCalls.push(method);
  122 |             if (value === "denied")
  123 |               throw new DOMException("Denied", "SecurityError");
  124 |           }
  125 |           return (original as any).call(this, k, ...args);
  126 |         };
  127 |       }
  128 |     }, stored);
  129 |     await page.reload();
  130 |     const button = page.getByRole("button", {
  131 |       name: "Generate GLSL",
  132 |       exact: true,
  133 |     });
  134 |     expect(await read(page, button)).toContain("UI control: Generate GLSL");
  135 |     await close(page, button);
  136 |     expect(
  137 |       await page.evaluate(() => (window as any).__preferenceCalls),
  138 |     ).toEqual([]);
  139 |     expect(await page.evaluate(() => localStorage.getItem("other-app"))).toBe(
  140 |       "retain",
  141 |     );
  142 |     save("ignored-pref-" + stored.replace(/\W/g, ""), {
  143 |       stored,
  144 |       inspectionStorageCalls: 0,
  145 |     });
  146 |   });
  147 | test("S06 F2 scalar vector draft and multifield IME guards preserve current text", async ({
  148 |   page,
  149 | }) => {
  150 |   await createNode(page, "Multiply");
  151 |   await page.getByRole("heading", { name: "Multiply", exact: true }).click();
  152 |   const before = await doc(page),
  153 |     a = page.getByRole("textbox", { name: "A", exact: true }),
  154 |     b = page.getByRole("textbox", { name: "B", exact: true });
  155 |   await a.fill("7.25");
  156 |   await b.fill("2.5");
  157 |   await b.dispatchEvent("compositionstart");
  158 |   await page.keyboard.press("F2");
  159 |   await expect(dialog(page)).not.toBeVisible();
  160 |   await expect(b).toBeFocused();
  161 |   await expect(a).toHaveValue("7.25");
  162 |   await b.dispatchEvent("compositionend");
  163 |   const scalar = await read(page, a);
  164 |   expect(scalar).toContain('"text": "7.25"');
  165 |   expect(scalar).toContain('"value": 1');
  166 |   await close(page, a);
  167 |   await a.press("Escape");
  168 |   await b.press("Escape");
  169 |   expect(await doc(page)).toEqual(before);
  170 |   await createNode(page, "Color RGBA");
  171 |   await page.getByRole("heading", { name: "Color RGBA", exact: true }).click();
  172 |   const r = page.getByRole("textbox", { name: "R", exact: true });
  173 |   await r.fill("0.37");
  174 |   const vector = await read(page, r);
  175 |   expect(vector).toContain('"componentTexts"');
  176 |   expect(vector).toContain("0.37");
  177 |   await close(page, r);
  178 |   await r.press("Escape");
  179 |   save("f2-drafts", {
  180 |     scalar,
  181 |     vector,
  182 |     IME: "Synthetic composition boundary; actual typing/keyboard/focus. Not physical IME qualification.",
  183 |   });
  184 | });
  185 | test("S06 F2 stage deletion Undo same-ID document reopen discards old target", async ({
  186 |   page,
  187 | }) => {
  188 |   const { c, n } = await fixture(page),
  189 |     original = await doc(page),
  190 |     id = await n.getAttribute("data-node");
> 191 |   expect(await read(page, n)).toContain(id!);
      |                               ^ Error: expect(received).toContain(expected) // indexOf
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
  286 |   expect(counts.stringify).toBe(1);
  287 |   save("f2-on-demand-counts", {
  288 |     moves: 80,
  289 |     before: { clone: 0, stringify: 0 },
  290 |     after: counts,
  291 |     limits:
```