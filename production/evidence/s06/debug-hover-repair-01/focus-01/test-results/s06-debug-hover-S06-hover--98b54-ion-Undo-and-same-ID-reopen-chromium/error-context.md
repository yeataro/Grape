# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-debug-hover.spec.ts >> S06 hover detail invalidation follows selection stage deletion Undo and same-ID reopen
- Location: ..\..\..\production\tests\browser\s06-debug-hover.spec.ts:168:1

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "661f911a-d7eb-4933-b284-9324e7151d9b"
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
              - generic "Edge a39159c6-8771-4889-908e-b28a5f7b0300" [ref=e35]
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
    - generic [ref=e98]:
      - button "Experimental features" [ref=e100] [cursor=pointer]
      - generic [ref=e101]: Panel · Canvas · UI-only · visible
      - button "Read object details" [expanded] [ref=e102] [cursor=pointer]
      - dialog "Object information" [ref=e103]:
        - heading "Object information" [level=2] [ref=e104]
        - region "Current object data" [active] [ref=e105]: "Panel: Canvas Identity: canvas-1 State: UI-only · visible { \"type\": \"grape.panel.canvas\", \"viewState\": { \"x\": 24, \"y\": 104, \"zoom\": 1 } }"
        - button "Close object details" [ref=e106] [cursor=pointer]
    - button "Hints" [ref=e107] [cursor=pointer]
```

# Test source

```ts
  76  |   ] as const) {
  77  |     await target.hover();
  78  |     await expect(page.locator(".hover-summary")).toContainText(kind);
  79  |     const details = await read(page);
  80  |     expect(details).toContain(kind + ":");
  81  |     expect(details).not.toMatch(
  82  |       /editToken|generation|TargetLease|MountTicket|"lease"/,
  83  |     );
  84  |     if (kind === "UI control") expect(details).toContain("未提供");
  85  |     records.push({ kind, details });
  86  |     await close(page);
  87  |   }
  88  |   expect(await c.getAttribute("data-selection")).toBe(selection);
  89  |   expect(await documentJSON(page)).toEqual(before);
  90  |   await n.getByRole("heading").click();
  91  |   const value = page.getByRole("textbox", { name: "R", exact: true });
  92  |   await value.hover();
  93  |   const widget = await read(page);
  94  |   expect(widget).toContain("Parameter Widget");
  95  |   expect(widget).toContain('"committed"');
  96  |   records.push({ kind: "Parameter Widget", details: widget });
  97  |   await close(page);
  98  |   await page.getByText("Experimental features", { exact: true }).click();
  99  |   await checkbox(page).uncheck();
  100 |   await page.keyboard.press("Escape");
  101 |   await n.getByRole("heading").hover();
  102 |   await expect(page.locator(".hover-summary")).toBeEmpty();
  103 |   expect(await documentJSON(page)).toEqual(before);
  104 |   await clickAction(page, "Undo");
  105 |   expect(
  106 |     (await documentJSON(page)).graph.stages.find((s: any) => s.key === "pixel")
  107 |       .network.edges,
  108 |   ).toHaveLength(0);
  109 |   await clickAction(page, "Redo");
  110 |   expect(await documentJSON(page)).toEqual(before);
  111 |   save("built-in-objects", records);
  112 |   await page.screenshot({ path: path.join(out, "normal-restored.png") });
  113 | });
  114 | 
  115 | test("S06 scalar and vector committed values stay distinct from unfinished drafts and IME guards", async ({
  116 |   page,
  117 | }) => {
  118 |   await enable(page);
  119 |   await createNode(page, "Multiply");
  120 |   const c = page.locator(".canvas").last();
  121 |   await c.getByRole("heading", { name: "Multiply", exact: true }).click();
  122 |   await page.getByText("Experimental features", { exact: true }).click();
  123 |   const input = page.getByRole("textbox", { name: "A", exact: true }),
  124 |     before = await documentJSON(page);
  125 |   await input.fill("7.25");
  126 |   // Refusal is tested through an actual click, not a check() retry that hides rejection.
  127 |   await checkbox(page).click();
  128 |   await expect(checkbox(page)).toBeChecked();
  129 |   await expect(input).toHaveValue("7.25");
  130 |   await expect(input).toBeFocused();
  131 |   await input.dispatchEvent("compositionstart");
  132 |   await checkbox(page).click();
  133 |   await expect(input).toBeFocused();
  134 |   await expect(page.locator(".experimental-issue")).toContainText(
  135 |     "composition",
  136 |   );
  137 |   await input.dispatchEvent("compositionend");
  138 |   await input.hover();
  139 |   const text = await read(page);
  140 |   expect(text).toContain('"value": 1');
  141 |   expect(text).toContain('"text": "7.25"');
  142 |   await close(page);
  143 |   await input.hover();
  144 |   await input.press("Escape");
  145 |   await expect(page.locator(".hover-summary")).toBeEmpty();
  146 |   await expect(input).toHaveValue("1");
  147 |   expect(await documentJSON(page)).toEqual(before);
  148 |   await createNode(page, "Color RGBA");
  149 |   await c.getByRole("heading", { name: "Color RGBA", exact: true }).click();
  150 |   const r = page.getByRole("textbox", { name: "R", exact: true });
  151 |   await r.fill("0.37");
  152 |   await r.hover();
  153 |   const vector = await read(page);
  154 |   expect(vector).toContain('"componentTexts"');
  155 |   expect(vector).toContain('"0.37"');
  156 |   await close(page);
  157 |   await r.hover();
  158 |   await r.press("Escape");
  159 |   await expect(page.locator(".hover-summary")).toBeEmpty();
  160 |   save("drafts", {
  161 |     scalar: text,
  162 |     vector,
  163 |     composition:
  164 |       "Synthetic composition boundary events; actual typing/focus/click refusal. No physical IME qualification.",
  165 |   });
  166 | });
  167 | 
  168 | test("S06 hover detail invalidation follows selection stage deletion Undo and same-ID reopen", async ({
  169 |   page,
  170 | }) => {
  171 |   await enable(page);
  172 |   const { c, n } = await fixture(page),
  173 |     original = await documentJSON(page),
  174 |     id = await n.getAttribute("data-node");
  175 |   await n.getByRole("heading").hover();
> 176 |   expect(await read(page)).toContain(id!);
      |                            ^ Error: expect(received).toContain(expected) // indexOf
  177 |   await close(page);
  178 |   await c.getByRole("button", { name: "Vertex", exact: true }).click();
  179 |   await expect(
  180 |     page.getByRole("button", { name: "Read object details", exact: true }),
  181 |   ).toBeDisabled();
  182 |   await c.getByRole("button", { name: "Pixel", exact: true }).click();
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
```