# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-hover-repair.spec.ts >> S06 repair compact disclosures share presentation without model changes
- Location: ..\..\..\production\tests\browser\s06-hover-repair.spec.ts:84:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  getByRole('list', { name: 'Diagnostics', exact: true })
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('list', { name: 'Diagnostics', exact: true })
    14 × locator resolved to <ul aria-label="Diagnostics"></ul>
       - unexpected value "hidden"

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
    - text: color vec4 [0,0,0,0]
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
    - button "Read full application status": Export started. Saved status is unchanged.
  - button "Shader output" [expanded]
  - button "Hints"
- dialog "Shader output and diagnostics":
  - heading "Shader output and diagnostics" [level=2]
  - heading "Shader output" [level=2]
  - paragraph: Generated successfully · Host-free GLSL
  - text: "// vertex #version 300 es layout(location=0) in vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); } // pixel #version 300 es precision highp float; out vec4 fragColor; void main() { fragColor = vec4(0.0, 0.0, 0.0, 0.0); }"
  - list "Diagnostics"
  - button "Close shader output"
```

# Test source

```ts
  6   | import { clickAction } from "../fixtures/public-actions.ts";
  7   | const out = process.env.GRAPE_EVIDENCE_DIR!;
  8   | const save = (name: string, value: unknown) =>
  9   |   fs.writeFileSync(
  10  |     path.join(out, name + ".json"),
  11  |     JSON.stringify(value, null, 2),
  12  |   );
  13  | async function exported(p: Page) {
  14  |   const wait = p.waitForEvent("download");
  15  |   await clickAction(p, "Export JSON");
  16  |   return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8"));
  17  | }
  18  | async function fixture(p: Page) {
  19  |   await p.goto("/");
  20  |   await createNode(p, "Color RGBA");
  21  |   const node = p.locator(".node").filter({
  22  |     has: p.getByRole("heading", { name: "Color RGBA", exact: true }),
  23  |   });
  24  |   await node.getByRole("heading").click();
  25  |   return node;
  26  | }
  27  | async function keyboardFocus(p: Page, target: Locator) {
  28  |   for (let i = 0; i < 160; i++) {
  29  |     if (await target.evaluate((e) => e === document.activeElement)) return;
  30  |     await p.keyboard.press("Shift+Tab");
  31  |   }
  32  |   throw Error("Target unreachable by trusted Tab");
  33  | }
  34  | // Pointer detail opening was superseded by the Owner F2-only requirement.
  35  | for (const focusKind of ["control", "node", "port"])
  36  |   for (const hoverKind of ["node", "panel", "control"]) {
  37  |     test(`S06 repair F2 focused ${focusKind} versus hovered ${hoverKind}`, async ({
  38  |       page,
  39  |     }) => {
  40  |       const node = await fixture(page);
  41  |       const focus =
  42  |         focusKind === "control"
  43  |           ? page.getByRole("button", { name: "Generate GLSL", exact: true })
  44  |           : focusKind === "node"
  45  |             ? node
  46  |             : node.locator("[data-port]").first();
  47  |       await keyboardFocus(page, focus);
  48  |       const identity =
  49  |         (await focus.getAttribute("data-node")) ??
  50  |         (await focus.getAttribute("data-node-id"));
  51  |       const other =
  52  |         hoverKind === "node"
  53  |           ? page.getByRole("heading", { name: "Image output", exact: true })
  54  |           : hoverKind === "panel"
  55  |             ? page.locator(".inspector h2")
  56  |             : page.getByRole("button", { name: "Save", exact: true });
  57  |       await other.hover();
  58  |       await expect(focus).toBeFocused();
  59  |       await page.keyboard.press("F2");
  60  |       const dialog = page.getByRole("dialog", {
  61  |         name: "Object information",
  62  |         exact: true,
  63  |       });
  64  |       await expect(dialog).toBeVisible();
  65  |       const text = await dialog.getByRole("region").innerText();
  66  |       expect(text).toContain(
  67  |         focusKind === "control"
  68  |           ? "UI control: Generate GLSL"
  69  |           : focusKind === "node"
  70  |             ? "Node: Color RGBA"
  71  |             : "Port:",
  72  |       );
  73  |       if (identity) expect(text).toContain(identity);
  74  |       await page.keyboard.press("Escape");
  75  |       await expect(focus).toBeFocused();
  76  |       save(`f2-${focusKind}-${hoverKind}`, {
  77  |         identity,
  78  |         text,
  79  |         method:
  80  |           "Trusted Tab to live focus, incidental hover, trusted F2/Escape",
  81  |       });
  82  |     });
  83  |   }
  84  | test("S06 repair compact disclosures share presentation without model changes", async ({
  85  |   page,
  86  | }) => {
  87  |   await page.goto("/");
  88  |   const before = await exported(page);
  89  |   await expect(page.locator("#code")).not.toBeVisible();
  90  |   for (const name of ["Project actions", "Shader output", "Hints"]) {
  91  |     const button = page.getByRole("button", { name, exact: true });
  92  |     await button.click();
  93  |     await expect(button).toHaveAttribute("aria-expanded", "true");
  94  |     await page.keyboard.press("Escape");
  95  |     await expect(button).toBeFocused();
  96  |     await expect(button).toHaveAttribute("aria-expanded", "false");
  97  |   }
  98  |   await page
  99  |     .getByRole("button", { name: "Generate GLSL", exact: true })
  100 |     .click();
  101 |   await page
  102 |     .getByRole("button", { name: "Shader output", exact: true })
  103 |     .click();
  104 |   await expect(
  105 |     page.getByRole("list", { name: "Diagnostics", exact: true }),
> 106 |   ).toBeVisible();
      |     ^ Error: expect(locator).toBeVisible() failed
  107 |   await expect(
  108 |     page.getByRole("button", { name: "Locate node", exact: true }).first(),
  109 |   ).toBeVisible();
  110 |   await page
  111 |     .getByRole("button", { name: "Close shader output", exact: true })
  112 |     .click();
  113 |   expect(await exported(page)).toEqual(before);
  114 | });
  115 | test("S06 grouped project actions preserve nested Personal and saved-dialog focus", async ({
  116 |   page,
  117 | }) => {
  118 |   await page.goto("/");
  119 |   const trigger = page.getByRole("button", {
  120 |     name: "Project actions",
  121 |     exact: true,
  122 |   });
  123 |   await trigger.click();
  124 |   const menu = page.getByRole("menu", { name: "Project actions", exact: true });
  125 |   await expect(menu).toBeVisible();
  126 |   await page.keyboard.press("End");
  127 |   expect(await menu.evaluate((e) => e.contains(document.activeElement))).toBe(
  128 |     true,
  129 |   );
  130 |   await page.keyboard.press("Home");
  131 |   await expect(menu.getByRole("menuitem").first()).toBeFocused();
  132 |   const personal = page.getByRole("menuitem", {
  133 |     name: "Personal Library",
  134 |     exact: true,
  135 |   });
  136 |   await personal.click();
  137 |   const dialog = page.getByRole("dialog").filter({
  138 |     has: page.getByRole("heading", { name: "Personal Library", exact: true }),
  139 |   });
  140 |   await dialog.getByRole("searchbox").fill("unavailable-entry");
  141 |   await dialog
  142 |     .getByRole("button", { name: "Close Personal", exact: true })
  143 |     .click();
  144 |   await expect(personal).toBeVisible();
  145 |   await expect(personal).toBeFocused();
  146 |   await page.keyboard.press("Escape");
  147 |   await expect(trigger).toBeFocused();
  148 |   await trigger.click();
  149 |   const open = page.getByRole("menuitem", { name: "Open saved", exact: true });
  150 |   await open.click();
  151 |   await page.locator("#cancel-open").click();
  152 |   await expect(open).toBeVisible();
  153 |   await expect(open).toBeFocused();
  154 |   const lock = page.getByRole("menuitemcheckbox", {
  155 |     name: "Lock editing",
  156 |     exact: true,
  157 |   });
  158 |   await expect(lock).not.toBeChecked();
  159 |   await lock.click();
  160 |   await trigger.click();
  161 |   await expect(lock).toBeChecked();
  162 |   await lock.click();
  163 |   await trigger.click();
  164 |   await expect(lock).not.toBeChecked();
  165 | });
  166 | 
  167 | test("S06 output diagnostics locate current nodes and reject stale detached actions", async ({
  168 |   page,
  169 | }) => {
  170 |   await page.goto("/");
  171 |   await requiredOutput(page);
  172 |   const before = await exported(page),
  173 |     c = page.locator(".canvas");
  174 |   await clickAction(page, "Generate GLSL");
  175 |   await page
  176 |     .getByRole("button", { name: "Read full application status" })
  177 |     .click();
  178 |   await expect(
  179 |     page.getByRole("dialog", { name: "Application status details" }),
  180 |   ).toContainText("INPUT_REQUIRED");
  181 |   await page.keyboard.press("Escape");
  182 |   await page
  183 |     .getByRole("button", { name: "Shader output", exact: true })
  184 |     .click();
  185 |   const locate = page
  186 |     .locator("#code")
  187 |     .getByRole("button", { name: "Locate node", exact: true })
  188 |     .first();
  189 |   await expect(locate).toBeVisible();
  190 |   await locate.click();
  191 |   await expect(c).not.toHaveAttribute("data-selection", "");
  192 |   await locate.evaluate((e) => ((window as any).__oldLocate = e));
  193 |   await page.keyboard.press("Escape");
  194 |   const b = (await c.boundingBox())!;
  195 |   await page.mouse.click(b.x + 20, b.y + 180);
  196 |   await expect(c).toHaveAttribute("data-selection", "");
  197 |   const stale = await page.evaluate(() => {
  198 |     const old = (window as any).__oldLocate;
  199 |     old.click();
  200 |     return {
  201 |       connected: old.isConnected,
  202 |       selection: document
  203 |         .querySelector(".canvas")!
  204 |         .getAttribute("data-selection"),
  205 |     };
  206 |   });
```