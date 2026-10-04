# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-workspace.spec.ts >> S06 wired creation is preview-only until snap placement and one Undo restores occupied input
- Location: ..\..\..\production\tests\browser\s06-workspace.spec.ts:105:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog', { name: 'Node catalog' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Node catalog' })

```

```yaml
- banner:
  - text: Grape SHADER WORKSPACE Development · unversioned
  - button "本輪更新"
  - navigation "Document actions":
    - button "Save"
    - button "Generate GLSL"
  - text: Unsaved changes Host-free
- button "Undo"
- button "Redo" [disabled]
- button "Delete selected"
- alert
- main:
  - text: Canvas 1
  - img
  - group "Image output":
    - heading "Image output" [level=3]
    - button "Image output input color"
    - text: color vec4 [0,0,0,0]
  - group "Float":
    - heading "Float" [level=3]
    - button "Float output out"
    - text: out float
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
    - paragraph: Float
    - button "Rename node"
    - text: Value
    - textbox "Value": "0.5"
    - alert
- contentinfo:
  - button "Project actions"
  - status:
    - button "Read full application status": Export started. Saved status is unchanged.
  - button "Shader output"
  - button "Hints"
```

# Test source

```ts
  36  |     "input a: glsl.float",
  37  |   );
  38  |   await search.fill("[.*");
  39  |   await expect(dialog).toContainText("No matching nodes");
  40  |   await search.fill("");
  41  |   await dialog
  42  |     .getByLabel("Node source", { exact: true })
  43  |     .selectOption("grape.nodes.fixed-values");
  44  |   await expect(
  45  |     dialog.getByRole("button", { name: "Inspect Float", exact: true }),
  46  |   ).toBeVisible();
  47  |   await expect(
  48  |     dialog.getByRole("button", { name: "Inspect Multiply", exact: true }),
  49  |   ).toHaveCount(0);
  50  |   await dialog
  51  |     .getByLabel("Node port type", { exact: true })
  52  |     .selectOption("glsl.vec3");
  53  |   await expect(
  54  |     dialog.getByRole("button", { name: "Inspect Vector 3", exact: true }),
  55  |   ).toBeVisible();
  56  |   await expect(
  57  |     dialog.getByRole("button", { name: "Inspect Float", exact: true }),
  58  |   ).toHaveCount(0);
  59  |   await search.fill("typed");
  60  |   await search.press("Control+z");
  61  |   await page.keyboard.press("Escape");
  62  |   expect(await documentOf(page)).toEqual(before);
  63  |   await page.screenshot({
  64  |     path: path.join(evidence(), "s06-catalog-inspection.png"),
  65  |   });
  66  | });
  67  | test("S06 blank double-click and Tab create previews; movement is independent, cancel and stage change add no History", async ({
  68  |   page,
  69  | }) => {
  70  |   const canvas = page.locator(".canvas"),
  71  |     rect = (await canvas.boundingBox())!,
  72  |     before = await documentOf(page);
  73  |   await page.mouse.dblclick(rect.x + 260, rect.y + 250);
  74  |   const dialog = page.getByRole("dialog", { name: "Node catalog" });
  75  |   await expect(dialog).toBeVisible();
  76  |   await dialog.getByLabel("Search nodes", { exact: true }).fill("Multiply");
  77  |   const title = dialog.locator("header"),
  78  |     box = (await title.boundingBox())!,
  79  |     position = await dialog.evaluate((e) => [e.style.left, e.style.top]);
  80  |   await page.mouse.move(box.x + 55, box.y + 10);
  81  |   await page.mouse.down();
  82  |   await page.mouse.move(box.x + 120, box.y + 55, { steps: 5 });
  83  |   await page.keyboard.press("Escape");
  84  |   await page.mouse.up();
  85  |   await expect(dialog).toBeHidden();
  86  |   expect(await documentOf(page)).toEqual(before);
  87  |   await page.mouse.click(rect.x + 240, rect.y + 240);
  88  |   await page.keyboard.press("Tab");
  89  |   await expect(dialog).toBeVisible();
  90  |   await dialog.getByLabel("Search nodes", { exact: true }).fill("Multiply");
  91  |   await page.keyboard.press("Enter");
  92  |   await expect(page.locator(".creation-preview")).toBeVisible();
  93  |   await expect(canvas.locator(".nodes .node")).toHaveCount(1);
  94  |   await page.keyboard.press("Escape");
  95  |   await expect(page.locator(".creation-preview")).toBeHidden();
  96  |   await page.getByRole("button", { name: "Add Node", exact: true }).click();
  97  |   await page.getByRole("button", { name: "Vertex", exact: true }).click();
  98  |   await expect(dialog).toBeHidden();
  99  |   expect(await documentOf(page)).toEqual(before);
  100 |   await expect(
  101 |     page.getByRole("button", { name: "Undo", exact: true }),
  102 |   ).toBeDisabled();
  103 |   expect(position.length).toBe(2);
  104 | });
  105 | test("S06 wired creation is preview-only until snap placement and one Undo restores occupied input", async ({
  106 |   page,
  107 | }) => {
  108 |   await createNode(page, "Float (fixed)");
  109 |   const output = page.getByRole("button", {
  110 |       name: "Float output Value",
  111 |       exact: true,
  112 |     }),
  113 |     input = page.getByRole("button", {
  114 |       name: "Image Output input Color",
  115 |       exact: true,
  116 |     });
  117 |   // Locate semantic ports independently of current localized labels.
  118 |   const source = page
  119 |     .locator(".nodes .node")
  120 |     .filter({ has: page.getByRole("heading", { name: "Float", exact: true }) })
  121 |     .locator("[data-direction=output]");
  122 |   const destination = page
  123 |     .locator('.nodes [data-direction=input][data-port="color"]')
  124 |     .first();
  125 |   await source.click();
  126 |   await destination.click();
  127 |   const before = await documentOf(page),
  128 |     canvas = page.locator(".canvas"),
  129 |     r = (await canvas.boundingBox())!,
  130 |     start = (await destination.boundingBox())!;
  131 |   await page.mouse.move(start.x + 3, start.y + start.height / 2);
  132 |   await page.mouse.down();
  133 |   await page.mouse.move(r.x + 350, r.y + 320, { steps: 6 });
  134 |   await page.mouse.up();
  135 |   const catalog = page.getByRole("dialog", { name: "Node catalog" });
> 136 |   await expect(catalog).toBeVisible();
      |                         ^ Error: expect(locator).toBeVisible() failed
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
  224 |   await requiredOutput(page);
  225 |   await page
  226 |     .getByRole("button", { name: "Generate GLSL", exact: true })
  227 |     .click();
  228 |   await expect(page.locator("#message")).toContainText("INPUT_REQUIRED");
  229 |   await page.getByRole("button", { name: "Save", exact: true }).click();
  230 |   await expect(page.locator("#message")).toContainText("INPUT_REQUIRED");
  231 |   await createNode(page, "Color RGBA");
  232 |   await page.locator(".nodes [data-direction=output]").click();
  233 |   await page.locator(".nodes [data-direction=input]").click();
  234 |   await page
  235 |     .getByRole("button", { name: "Generate GLSL", exact: true })
  236 |     .click();
```