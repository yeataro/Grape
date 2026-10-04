# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-workspace.spec.ts >> S06 wired creation is preview-only until snap placement and one Undo restores occupied input
- Location: ..\..\..\production\tests\browser\s06-workspace.spec.ts:104:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.nodes [data-direction=input]').filter({ hasText: 'color' }).first()

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
              - group "Float" [ref=e41]:
                - heading "Float" [level=3] [ref=e42]
                - generic [ref=e43]:
                  - button "Float output out" [active] [ref=e44] [cursor=pointer]
                  - generic [ref=e45]: out
                  - generic [ref=e46]: float
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - status:
          - button "Read full Canvas status" [disabled]: Choose the opposite port. Hold Shift to replace an existing connection.
        - generic [ref=e47]:
          - button "New subgraph" [ref=e48] [cursor=pointer]
          - button "Library subgraph" [ref=e49] [cursor=pointer]
          - button "Encapsulate" [ref=e50] [cursor=pointer]
          - button "Make independent" [ref=e51] [cursor=pointer]
          - button "Enter subgraph" [ref=e52] [cursor=pointer]
          - button "Arrange nodes" [ref=e53] [cursor=pointer]
          - button "Frame selection" [ref=e54] [cursor=pointer]
          - group [ref=e55]:
            - generic "Local clipboard" [ref=e56] [cursor=pointer]
          - group [ref=e57]:
            - generic "Structures" [ref=e58] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e59]:
          - button "Vertex" [ref=e60] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e61] [cursor=pointer]
        - generic [ref=e62]:
          - button "Add Node" [ref=e63] [cursor=pointer]
          - button "Browse nodes" [ref=e66] [cursor=pointer]
          - button "Up" [disabled] [ref=e69]
          - button "Shortcuts" [ref=e72] [cursor=pointer]
    - complementary [ref=e75]:
      - generic [ref=e76]:
        - heading "Inspector" [level=2] [ref=e77]
        - paragraph [ref=e78]: Float
        - button "Rename node" [ref=e79] [cursor=pointer]
        - generic [ref=e82]:
          - generic [ref=e83]: Value
          - textbox "Value" [ref=e84]: "0.5"
          - alert
  - contentinfo [ref=e85]:
    - button "Project actions" [ref=e86] [cursor=pointer]
    - status [ref=e87]:
      - button "Read full application status" [disabled] [ref=e88]
    - button "Shader output" [ref=e89] [cursor=pointer]
    - generic [ref=e90]:
      - button "Experimental features" [ref=e92] [cursor=pointer]
      - button "Read object details" [disabled] [ref=e93]
    - button "Hints" [ref=e94] [cursor=pointer]
```

# Test source

```ts
  26  |     search = dialog.getByLabel("Search nodes", { exact: true });
  27  |   await search.fill("ＭＵＬＴＩＰＬＹ");
  28  |   await expect(
  29  |     dialog.getByRole("button", { name: "Inspect Multiply", exact: true }),
  30  |   ).toBeVisible();
  31  |   await dialog
  32  |     .getByRole("button", { name: "Inspect Multiply", exact: true })
  33  |     .click();
  34  |   await expect(dialog.locator(".catalog-detail")).toContainText(
  35  |     "input a: glsl.float",
  36  |   );
  37  |   await search.fill("[.*");
  38  |   await expect(dialog).toContainText("No matching nodes");
  39  |   await search.fill("");
  40  |   await dialog
  41  |     .getByLabel("Node source", { exact: true })
  42  |     .selectOption("grape.nodes.fixed-values");
  43  |   await expect(
  44  |     dialog.getByRole("button", { name: "Inspect Float", exact: true }),
  45  |   ).toBeVisible();
  46  |   await expect(
  47  |     dialog.getByRole("button", { name: "Inspect Multiply", exact: true }),
  48  |   ).toHaveCount(0);
  49  |   await dialog
  50  |     .getByLabel("Node port type", { exact: true })
  51  |     .selectOption("glsl.vec3");
  52  |   await expect(
  53  |     dialog.getByRole("button", { name: "Inspect Vector 3", exact: true }),
  54  |   ).toBeVisible();
  55  |   await expect(
  56  |     dialog.getByRole("button", { name: "Inspect Float", exact: true }),
  57  |   ).toHaveCount(0);
  58  |   await search.fill("typed");
  59  |   await search.press("Control+z");
  60  |   await page.keyboard.press("Escape");
  61  |   expect(await documentOf(page)).toEqual(before);
  62  |   await page.screenshot({
  63  |     path: path.join(evidence(), "s06-catalog-inspection.png"),
  64  |   });
  65  | });
  66  | test("S06 blank double-click and Tab create previews; movement is independent, cancel and stage change add no History", async ({
  67  |   page,
  68  | }) => {
  69  |   const canvas = page.locator(".canvas"),
  70  |     rect = (await canvas.boundingBox())!,
  71  |     before = await documentOf(page);
  72  |   await page.mouse.dblclick(rect.x + 260, rect.y + 250);
  73  |   const dialog = page.getByRole("dialog", { name: "Node catalog" });
  74  |   await expect(dialog).toBeVisible();
  75  |   await dialog.getByLabel("Search nodes", { exact: true }).fill("Multiply");
  76  |   const title = dialog.locator("header"),
  77  |     box = (await title.boundingBox())!,
  78  |     position = await dialog.evaluate((e) => [e.style.left, e.style.top]);
  79  |   await page.mouse.move(box.x + 55, box.y + 10);
  80  |   await page.mouse.down();
  81  |   await page.mouse.move(box.x + 120, box.y + 55, { steps: 5 });
  82  |   await page.keyboard.press("Escape");
  83  |   await page.mouse.up();
  84  |   await expect(dialog).toBeHidden();
  85  |   expect(await documentOf(page)).toEqual(before);
  86  |   await page.mouse.click(rect.x + 240, rect.y + 240);
  87  |   await page.keyboard.press("Tab");
  88  |   await expect(dialog).toBeVisible();
  89  |   await dialog.getByLabel("Search nodes", { exact: true }).fill("Multiply");
  90  |   await page.keyboard.press("Enter");
  91  |   await expect(page.locator(".creation-preview")).toBeVisible();
  92  |   await expect(canvas.locator(".nodes .node")).toHaveCount(1);
  93  |   await page.keyboard.press("Escape");
  94  |   await expect(page.locator(".creation-preview")).toBeHidden();
  95  |   await page.getByRole("button", { name: "Add Node", exact: true }).click();
  96  |   await page.getByRole("button", { name: "Vertex", exact: true }).click();
  97  |   await expect(dialog).toBeHidden();
  98  |   expect(await documentOf(page)).toEqual(before);
  99  |   await expect(
  100 |     page.getByRole("button", { name: "Undo", exact: true }),
  101 |   ).toBeDisabled();
  102 |   expect(position.length).toBe(2);
  103 | });
  104 | test("S06 wired creation is preview-only until snap placement and one Undo restores occupied input", async ({
  105 |   page,
  106 | }) => {
  107 |   await createNode(page, "Float (fixed)");
  108 |   const output = page.getByRole("button", {
  109 |       name: "Float output Value",
  110 |       exact: true,
  111 |     }),
  112 |     input = page.getByRole("button", {
  113 |       name: "Image Output input Color",
  114 |       exact: true,
  115 |     });
  116 |   // Locate semantic ports independently of current localized labels.
  117 |   const source = page
  118 |     .locator(".nodes .node")
  119 |     .filter({ has: page.getByRole("heading", { name: "Float", exact: true }) })
  120 |     .locator("[data-direction=output]");
  121 |   const destination = page
  122 |     .locator(".nodes [data-direction=input]")
  123 |     .filter({ hasText: "color" })
  124 |     .first();
  125 |   await source.click();
> 126 |   await destination.click();
      |                     ^ Error: locator.click: Test timeout of 30000ms exceeded.
  127 |   const before = await documentOf(page),
  128 |     canvas = page.locator(".canvas"),
  129 |     r = (await canvas.boundingBox())!,
  130 |     start = (await destination.boundingBox())!;
  131 |   await page.mouse.move(start.x + 3, start.y + start.height / 2);
  132 |   await page.mouse.down();
  133 |   await page.mouse.move(r.x + 350, r.y + 320, { steps: 6 });
  134 |   await page.mouse.up();
  135 |   const catalog = page.getByRole("dialog", { name: "Node catalog" });
  136 |   await expect(catalog).toBeVisible();
  137 |   await catalog.getByLabel("Search nodes", { exact: true }).fill("Color RGBA");
  138 |   await page.keyboard.press("Enter");
  139 |   await expect(page.locator(".creation-wire")).toBeVisible();
  140 |   expect(await canvas.locator(".nodes .node").count()).toBe(2);
  141 |   await page.mouse.move(r.x + 355, r.y + 315);
  142 |   await page.mouse.click(r.x + 355, r.y + 315);
  143 |   const after = await documentOf(page),
  144 |     network = after.graph.stages.find((s: any) => s.key === "pixel").network;
  145 |   expect(network.nodes.length).toBe(3);
  146 |   expect(network.edges.length).toBe(1);
  147 |   const added = network.nodes.find((n: any) => n.name === "Color RGBA");
  148 |   expect(added.position.every((n: number) => n % 24 === 0)).toBe(true);
  149 |   await page.getByRole("button", { name: "Undo", exact: true }).click();
  150 |   expect(await documentOf(page)).toEqual(before);
  151 |   await page.getByRole("button", { name: "Redo", exact: true }).click();
  152 |   expect(await documentOf(page)).toEqual(after);
  153 |   await page
  154 |     .getByRole("button", { name: "Generate GLSL", exact: true })
  155 |     .click();
  156 |   await expect(page.getByLabel("Generated GLSL")).toContainText("vec4");
  157 |   await page.screenshot({
  158 |     path: path.join(evidence(), "s06-wired-placement.png"),
  159 |   });
  160 | });
  161 | test("S06 help and context menu keyboard, readonly browsing and responsive original actions", async ({
  162 |   page,
  163 | }) => {
  164 |   await createNode(page, "Multiply");
  165 |   const before = await documentOf(page);
  166 |   await page.getByRole("button", { name: "Shortcuts", exact: true }).click();
  167 |   const help = page.getByRole("dialog", { name: "Keyboard shortcuts" });
  168 |   await expect(help).toBeVisible();
  169 |   await page.keyboard.press("Delete");
  170 |   await page.keyboard.press("Control+z");
  171 |   await expect(help).toBeVisible();
  172 |   await page.keyboard.press("Escape");
  173 |   expect(await documentOf(page)).toEqual(before);
  174 |   await page
  175 |     .locator(".node h3")
  176 |     .filter({ hasText: /^Multiply$/ })
  177 |     .click();
  178 |   await page.keyboard.press("Shift+F10");
  179 |   const menu = page.getByRole("menu");
  180 |   await expect(menu).toBeVisible();
  181 |   await page.keyboard.press("End");
  182 |   await expect(
  183 |     page.getByRole("menuitem", { name: "Keyboard shortcuts" }),
  184 |   ).toBeFocused();
  185 |   await page.keyboard.press("Escape");
  186 |   await expect(menu).toBeHidden();
  187 |   await clickAction(page, "Lock editing");
  188 |   await expect(
  189 |     page.getByRole("button", { name: "Add Node", exact: true }),
  190 |   ).toBeDisabled();
  191 |   await page.getByRole("button", { name: "Browse nodes", exact: true }).click();
  192 |   const catalog = page.getByRole("dialog", { name: "Node catalog" });
  193 |   await catalog.getByLabel("Search nodes", { exact: true }).fill("Multiply");
  194 |   await expect(
  195 |     catalog.getByRole("button", { name: "Add Multiply", exact: true }),
  196 |   ).toBeDisabled();
  197 |   await catalog
  198 |     .getByRole("button", { name: "Inspect Multiply", exact: true })
  199 |     .click();
  200 |   await page.keyboard.press("Escape");
  201 |   await page.setViewportSize({ width: 620, height: 850 });
  202 |   await page
  203 |     .getByRole("button", { name: "Project actions", exact: true })
  204 |     .click();
  205 |   await expect(
  206 |     page.getByRole("button", { name: "Save", exact: true }),
  207 |   ).toBeVisible();
  208 |   await expect(
  209 |     page.getByRole("button", { name: "Undo", exact: true }),
  210 |   ).toHaveCount(1);
  211 |   await expect(
  212 |     page.getByRole("button", { name: "Vertex", exact: true }),
  213 |   ).toBeVisible();
  214 |   await page.screenshot({ path: path.join(evidence(), "s06-responsive.png") });
  215 |   await page.setViewportSize({ width: 1440, height: 1000 });
  216 |   await expect(
  217 |     page.getByRole("button", { name: "Save", exact: true }),
  218 |   ).toBeVisible();
  219 |   expect(await documentOf(page)).toEqual(before);
  220 | });
  221 | test("S06 compile error survives unrelated successful Save and clears on matching successful Generate", async ({
  222 |   page,
  223 | }) => {
  224 |   await page
  225 |     .getByRole("button", { name: "Generate GLSL", exact: true })
  226 |     .click();
```