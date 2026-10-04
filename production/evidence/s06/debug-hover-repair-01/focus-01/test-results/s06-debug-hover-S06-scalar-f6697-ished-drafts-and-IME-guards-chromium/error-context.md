# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-debug-hover.spec.ts >> S06 scalar and vector committed values stay distinct from unfinished drafts and IME guards
- Location: ..\..\..\production\tests\browser\s06-debug-hover.spec.ts:115:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('checkbox', { name: 'Show object information instead of normal hover hints' })

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
            - generic:
              - group "Image output" [ref=e35]:
                - heading "Image output" [level=3] [ref=e36]
                - generic [ref=e37]:
                  - button "Image output input color" [ref=e38] [cursor=pointer]
                  - generic [ref=e39]: color
                  - generic [ref=e40]: vec4
              - group "Multiply" [ref=e41]:
                - heading "Multiply" [level=3] [ref=e42]
                - generic [ref=e43]:
                  - button "Multiply input a" [ref=e44] [cursor=pointer]
                  - generic [ref=e45]: a
                  - generic [ref=e46]: float
                  - generic "Current local value; edit in Inspector" [ref=e47]: "1"
                - generic [ref=e48]:
                  - button "Multiply input b" [ref=e49] [cursor=pointer]
                  - generic [ref=e50]: b
                  - generic [ref=e51]: float
                  - generic "Current local value; edit in Inspector" [ref=e52]: "2"
                - generic [ref=e53]:
                  - button "Multiply output result" [ref=e54] [cursor=pointer]
                  - generic [ref=e55]: result
                  - generic [ref=e56]: float
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e57]:
          - button "New subgraph" [ref=e58] [cursor=pointer]
          - button "Library subgraph" [ref=e59] [cursor=pointer]
          - button "Encapsulate" [ref=e60] [cursor=pointer]
          - button "Make independent" [ref=e61] [cursor=pointer]
          - button "Enter subgraph" [ref=e62] [cursor=pointer]
          - button "Arrange nodes" [ref=e63] [cursor=pointer]
          - button "Frame selection" [ref=e64] [cursor=pointer]
          - group [ref=e65]:
            - generic "Local clipboard" [ref=e66] [cursor=pointer]
          - group [ref=e67]:
            - generic "Structures" [ref=e68] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e69]:
          - button "Vertex" [ref=e70] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e71] [cursor=pointer]
        - generic [ref=e72]:
          - button "Add Node" [ref=e73] [cursor=pointer]
          - button "Browse nodes" [ref=e76] [cursor=pointer]
          - button "Up" [disabled] [ref=e79]
          - button "Shortcuts" [ref=e82] [cursor=pointer]
    - complementary [ref=e85]:
      - generic [ref=e86]:
        - heading "Inspector" [level=2] [ref=e87]
        - paragraph [ref=e88]: Multiply
        - button "Rename node" [ref=e89] [cursor=pointer]
        - generic [ref=e90]:
          - generic [ref=e92]:
            - generic [ref=e93]: A
            - textbox "A" [active] [ref=e94]: "7.25"
            - button "Cancel edit" [ref=e95] [cursor=pointer]
            - alert
          - generic [ref=e97]:
            - generic [ref=e98]: B
            - textbox "B" [ref=e99]: "2"
            - alert
  - contentinfo [ref=e100]:
    - button "Project actions" [ref=e101] [cursor=pointer]
    - status [ref=e102]:
      - button "Read full application status" [ref=e103] [cursor=pointer]: Export started. Saved status is unchanged.
    - button "Shader output" [ref=e104] [cursor=pointer]
    - generic [ref=e105]:
      - button "Experimental features" [ref=e107] [cursor=pointer]
      - button "Read object details" [disabled] [ref=e108]
    - button "Hints" [ref=e109] [cursor=pointer]
```

# Test source

```ts
  27  | }
  28  | async function read(p: Page) {
  29  |   await p
  30  |     .getByRole("button", { name: "Read object details", exact: true })
  31  |     .click();
  32  |   await expect(dialog(p)).toBeVisible();
  33  |   return dialog(p).getByRole("region").innerText();
  34  | }
  35  | async function close(p: Page) {
  36  |   await p.keyboard.press("Escape");
  37  |   await expect(dialog(p)).not.toBeVisible();
  38  |   await expect(
  39  |     p.getByRole("button", { name: "Read object details", exact: true }),
  40  |   ).toBeFocused();
  41  | }
  42  | async function fixture(p: Page) {
  43  |   await createNode(p, "Color RGBA");
  44  |   const c = p.locator(".canvas").last(),
  45  |     n = c.locator("article.node").filter({
  46  |       has: p.getByRole("heading", { name: "Color RGBA", exact: true }),
  47  |     });
  48  |   await n.locator('[data-direction="output"]').click();
  49  |   await c.locator('[data-direction="input"][data-port="color"]').click();
  50  |   return { c, n };
  51  | }
  52  | test.beforeEach(async ({ page }) => {
  53  |   page.on("dialog", (d) => d.accept());
  54  |   await page.goto("/");
  55  | });
  56  | 
  57  | test("S06 normal debug normal checkbox preserves graph history selection and covers built-in objects", async ({
  58  |   page,
  59  | }) => {
  60  |   const { c, n } = await fixture(page),
  61  |     before = await documentJSON(page),
  62  |     selection = await c.getAttribute("data-selection");
  63  |   await n.getByRole("heading").hover();
  64  |   await expect(page.locator(".hover-summary")).toBeEmpty();
  65  |   await enable(page);
  66  |   const records = [];
  67  |   for (const [kind, target] of [
  68  |     ["Node", n.getByRole("heading")],
  69  |     ["Port", n.locator('[data-direction="output"]')],
  70  |     ["Edge", c.locator(".wires path")],
  71  |     ["Panel", page.locator(".inspector h2")],
  72  |     [
  73  |       "UI control",
  74  |       page.getByRole("button", { name: "Generate GLSL", exact: true }),
  75  |     ],
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
> 127 |   await checkbox(page).click();
      |                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  176 |   expect(await read(page)).toContain(id!);
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
```