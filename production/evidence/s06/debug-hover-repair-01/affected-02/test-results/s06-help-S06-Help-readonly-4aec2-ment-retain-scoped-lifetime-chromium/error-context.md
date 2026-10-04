# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-help.spec.ts >> S06 Help readonly interaction and remounted document retain scoped lifetime
- Location: ..\..\..\production\tests\browser\s06-help.spec.ts:189:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'New document', exact: true })

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
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e41]:
          - button "New subgraph" [ref=e42] [cursor=pointer]
          - button "Library subgraph" [ref=e43] [cursor=pointer]
          - button "Encapsulate" [ref=e44] [cursor=pointer]
          - button "Make independent" [ref=e45] [cursor=pointer]
          - button "Enter subgraph" [ref=e46] [cursor=pointer]
          - button "Arrange nodes" [ref=e47] [cursor=pointer]
          - button "Frame selection" [ref=e48] [cursor=pointer]
          - group [ref=e49]:
            - generic "Local clipboard" [ref=e50] [cursor=pointer]
          - group [ref=e51]:
            - generic "Structures" [ref=e52] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e53]:
          - button "Vertex" [ref=e54] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e55] [cursor=pointer]
        - generic [ref=e56]:
          - button "Add Node" [ref=e57] [cursor=pointer]
          - button "Browse nodes" [ref=e60] [cursor=pointer]
          - button "Up" [disabled] [ref=e63]
          - button "Shortcuts" [ref=e66] [cursor=pointer]
    - complementary [ref=e69]:
      - generic [ref=e70]:
        - heading "Inspector" [level=2] [ref=e71]
        - paragraph [ref=e72]: Select a node to inspect its parameters.
  - contentinfo [ref=e73]:
    - button "Project actions" [active] [ref=e74] [cursor=pointer]
    - status [ref=e75]:
      - button "Read full application status" [ref=e76] [cursor=pointer]: Export started. Saved status is unchanged.
    - button "Shader output" [ref=e77] [cursor=pointer]
    - generic [ref=e78]:
      - button "Experimental features" [ref=e80] [cursor=pointer]
      - button "Read object details" [disabled] [ref=e81]
    - button "Hints" [ref=e82] [cursor=pointer]
```

# Test source

```ts
  100 |     expect(await documentOf(page)).toEqual(before);
  101 |   });
  102 | 
  103 | for (const reason of ["pointercancel", "blur"] as const)
  104 |   test(`S06 Help ${reason} disarms incomplete backdrop gesture and allows a new click`, async ({
  105 |     page,
  106 |   }) => {
  107 |     const before = await documentOf(page);
  108 |     await page.getByRole("button", { name: "Shortcuts", exact: true }).click();
  109 |     const help = page.getByRole("dialog", { name: "Keyboard shortcuts" }),
  110 |       r = (await help.boundingBox())!;
  111 |     await page.mouse.move(r.x - 20, r.y + 20);
  112 |     await page.mouse.down();
  113 |     // A synthetic cancellation/blur exercises the lifecycle boundary, not a physical-device claim.
  114 |     if (reason === "pointercancel")
  115 |       await help.dispatchEvent("pointercancel", {
  116 |         pointerId: 1,
  117 |         pointerType: "mouse",
  118 |         isPrimary: true,
  119 |       });
  120 |     else await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  121 |     await page.mouse.up();
  122 |     await expect(help).toBeVisible();
  123 |     await page.mouse.click(r.x - 20, r.y + 20);
  124 |     await expect(help).toBeHidden();
  125 |     expect(await documentOf(page)).toEqual(before);
  126 |   });
  127 | 
  128 | test("S06 Help Escape Close and reopen consume old gestures and restore usable focus", async ({
  129 |   page,
  130 | }) => {
  131 |   const before = await documentOf(page),
  132 |     opener = page.getByRole("button", { name: "Shortcuts", exact: true });
  133 |   await opener.click();
  134 |   const help = page.getByRole("dialog", { name: "Keyboard shortcuts" }),
  135 |     r = (await help.boundingBox())!;
  136 |   await page.mouse.move(r.x - 20, r.y + 20);
  137 |   await page.mouse.down();
  138 |   await page.keyboard.press("Escape");
  139 |   await page.mouse.up();
  140 |   await expect(help).toBeHidden();
  141 |   await expect(opener).toBeFocused();
  142 |   await page.keyboard.press("Enter");
  143 |   await expect(help).toBeVisible();
  144 |   await page.keyboard.press("Tab");
  145 |   await expect(
  146 |     help.getByRole("button", { name: "Close shortcuts" }),
  147 |   ).toBeFocused();
  148 |   await page.keyboard.press("Enter");
  149 |   await expect(opener).toBeFocused();
  150 |   expect(await documentOf(page)).toEqual(before);
  151 | });
  152 | 
  153 | test("S06 Help keyboard menu returns focus to Canvas and remains independent across two Canvas contexts", async ({
  154 |   page,
  155 | }) => {
  156 |   await clickAction(page, "Second Canvas");
  157 |   const canvas = page.locator(".canvas").first(),
  158 |     r = (await canvas.boundingBox())!;
  159 |   await page.mouse.click(r.x + 300, r.y + 230);
  160 |   await page.keyboard.press("Shift+F10");
  161 |   await page
  162 |     .getByRole("menuitem", { name: "Keyboard shortcuts", exact: true })
  163 |     .click();
  164 |   const help = canvas.getByRole("dialog", { name: "Keyboard shortcuts" });
  165 |   await expect(help).toBeVisible();
  166 |   await page.keyboard.press("Escape");
  167 |   await expect(canvas).toBeFocused();
  168 |   await page
  169 |     .locator(".canvas")
  170 |     .nth(1)
  171 |     .getByRole("button", { name: "Shortcuts", exact: true })
  172 |     .click();
  173 |   await expect(help).toBeHidden();
  174 |   await expect(
  175 |     page
  176 |       .locator(".canvas")
  177 |       .nth(1)
  178 |       .getByRole("dialog", { name: "Keyboard shortcuts" }),
  179 |   ).toBeVisible();
  180 |   await page.keyboard.press("Escape");
  181 |   await expect(
  182 |     page
  183 |       .locator(".canvas")
  184 |       .nth(1)
  185 |       .getByRole("button", { name: "Shortcuts", exact: true }),
  186 |   ).toBeFocused();
  187 | });
  188 | 
  189 | test("S06 Help readonly interaction and remounted document retain scoped lifetime", async ({
  190 |   page,
  191 | }) => {
  192 |   await clickAction(page, "Lock editing");
  193 |   const before = await documentOf(page);
  194 |   await page.getByRole("button", { name: "Shortcuts", exact: true }).click();
  195 |   const old = await page.locator("dialog.shortcut-help").elementHandle();
  196 |   await page.keyboard.press("Escape");
  197 |   expect(await documentOf(page)).toEqual(before);
  198 |   await clickAction(page, "Lock editing");
  199 |   page.once("dialog", (dialog) => dialog.accept());
> 200 |   await page.getByRole("button", { name: "New document", exact: true }).click();
      |                                                                         ^ Error: locator.click: Test timeout of 30000ms exceeded.
  201 |   expect(await old!.evaluate((e) => e.isConnected)).toBe(false);
  202 |   await page.getByRole("button", { name: "Shortcuts", exact: true }).click();
  203 |   await old!.evaluate((e) => {
  204 |     e.dispatchEvent(
  205 |       new PointerEvent("pointerdown", {
  206 |         clientX: -10,
  207 |         clientY: -10,
  208 |         button: 0,
  209 |         isPrimary: true,
  210 |         pointerId: 1,
  211 |       }),
  212 |     );
  213 |     e.dispatchEvent(
  214 |       new PointerEvent("click", { clientX: -10, clientY: -10, pointerId: 1 }),
  215 |     );
  216 |   });
  217 |   await expect(
  218 |     page.getByRole("dialog", { name: "Keyboard shortcuts" }),
  219 |   ).toBeVisible();
  220 |   await page.keyboard.press("Escape");
  221 | });
  222 | 
```