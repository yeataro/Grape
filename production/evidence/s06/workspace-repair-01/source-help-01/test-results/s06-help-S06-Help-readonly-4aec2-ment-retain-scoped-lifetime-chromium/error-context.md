# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-help.spec.ts >> S06 Help readonly interaction and remounted document retain scoped lifetime
- Location: ..\..\..\production\tests\browser\s06-help.spec.ts:97:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog', { name: 'Keyboard shortcuts' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Keyboard shortcuts' })

```

```yaml
- banner:
  - text: Grape SHADER WORKSPACE
  - navigation "Document actions":
    - button "New document"
    - button "Save"
    - button "Open saved"
    - button "Export JSON"
    - button "Export PNG"
    - button "Open file"
    - button "Generate GLSL"
    - button "Second Canvas"
    - button "Lock editing"
    - group: More actions
  - text: Unsaved changes Host-free
- status: Export started. Saved status is unchanged.
- button "Undo" [disabled]
- button "Redo" [disabled]
- button "Delete selected"
- alert
- main:
  - text: Canvas 1
  - img
  - group "Image output":
    - heading "Image output" [level=3]
    - button "Image output input color": color
    - text: vec4
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
  - complementary:
    - heading "Inspector" [level=2]
    - paragraph: Select a node to inspect its parameters.
- heading "Shader output" [level=2]
- paragraph: Generate to inspect shader output.
- list "Diagnostics":
  - listitem:
    - text: "INPUT_REQUIRED: Connect the required input."
    - button "Locate node"
- contentinfo: Click an output port, then an input to connect. Shift-click replaces a connection. Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  7   |   const wait = page.waitForEvent("download");
  8   |   await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  9   |   return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8"));
  10  | }
  11  | test.beforeEach(async ({ page }) => {
  12  |   await page.goto("/");
  13  |   await page.evaluate(() => {
  14  |     (window as any).helpEvents = [];
  15  |     for (const type of ["pointerdown", "pointerup", "pointercancel", "click", "keydown", "focusin"])
  16  |       document.addEventListener(type, (e) => {
  17  |         const p = e as PointerEvent;
  18  |         (window as any).helpEvents.push({ type, trusted: e.isTrusted, target: (e.target as HTMLElement).tagName,
  19  |           x: p.clientX, y: p.clientY, pointerId: p.pointerId, key: (e as KeyboardEvent).key,
  20  |           open: !!document.querySelector("dialog.shortcut-help[open]") });
  21  |       }, true);
  22  |   });
  23  | });
  24  | test.afterEach(async ({ page }, info) => {
  25  |   const out = process.env.GRAPE_EVIDENCE_DIR!;
  26  |   if (!path.isAbsolute(out) || !out.includes("s06")) throw Error("S06_EVIDENCE_REQUIRED");
  27  |   const file = path.join(out, info.title.replace(/[^a-zA-Z0-9-]/g, "_") + ".json");
  28  |   fs.writeFileSync(file, JSON.stringify({ title: info.title, events: await page.evaluate(() => (window as any).helpEvents) }, null, 2) + "\n");
  29  | });
  30  | 
  31  | for (const [start, end, closes] of [["outside", "inside", false], ["inside", "outside", false], ["outside", "outside", true]] as const)
  32  |   test(`S06 Help natural ${start}-to-${end} gesture preserves document and History`, async ({ page }) => {
  33  |     await createNode(page, "Multiply");
  34  |     const before = await documentOf(page);
  35  |     const opener = page.getByRole("button", { name: "Shortcuts", exact: true });
  36  |     await opener.click();
  37  |     const help = page.getByRole("dialog", { name: "Keyboard shortcuts" }), r = (await help.boundingBox())!;
  38  |     const points = { outside: { x: r.x - 20, y: r.y + 20 }, inside: { x: r.x + 10, y: r.y + 10 } };
  39  |     await page.mouse.move(points[start].x, points[start].y);
  40  |     await page.mouse.down();
  41  |     await page.mouse.move(points[end].x, points[end].y, { steps: 5 });
  42  |     await page.mouse.up();
  43  |     if (closes) { await expect(help).toBeHidden(); await expect(opener).toBeFocused(); }
  44  |     else { await expect(help).toBeVisible(); await page.keyboard.press("Escape"); await expect(opener).toBeFocused(); }
  45  |     expect(await documentOf(page)).toEqual(before);
  46  |     await page.getByRole("button", { name: "Undo", exact: true }).click();
  47  |     await expect(page.getByRole("heading", { name: "Multiply", exact: true })).toHaveCount(0);
  48  |     await page.getByRole("button", { name: "Redo", exact: true }).click();
  49  |     expect(await documentOf(page)).toEqual(before);
  50  |   });
  51  | 
  52  | for (const reason of ["pointercancel", "blur"] as const)
  53  |   test(`S06 Help ${reason} disarms incomplete backdrop gesture and allows a new click`, async ({ page }) => {
  54  |     const before = await documentOf(page);
  55  |     await page.getByRole("button", { name: "Shortcuts", exact: true }).click();
  56  |     const help = page.getByRole("dialog", { name: "Keyboard shortcuts" }), r = (await help.boundingBox())!;
  57  |     await page.mouse.move(r.x - 20, r.y + 20); await page.mouse.down();
  58  |     // A synthetic cancellation/blur exercises the lifecycle boundary, not a physical-device claim.
  59  |     if (reason === "pointercancel") await help.dispatchEvent("pointercancel", { pointerId: 1, pointerType: "mouse", isPrimary: true });
  60  |     else await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  61  |     await page.mouse.up();
  62  |     await expect(help).toBeVisible();
  63  |     await page.mouse.click(r.x - 20, r.y + 20);
  64  |     await expect(help).toBeHidden();
  65  |     expect(await documentOf(page)).toEqual(before);
  66  |   });
  67  | 
  68  | test("S06 Help Escape Close and reopen consume old gestures and restore usable focus", async ({ page }) => {
  69  |   const before = await documentOf(page), opener = page.getByRole("button", { name: "Shortcuts", exact: true });
  70  |   await opener.click();
  71  |   const help = page.getByRole("dialog", { name: "Keyboard shortcuts" }), r = (await help.boundingBox())!;
  72  |   await page.mouse.move(r.x - 20, r.y + 20); await page.mouse.down();
  73  |   await page.keyboard.press("Escape"); await page.mouse.up();
  74  |   await expect(help).toBeHidden(); await expect(opener).toBeFocused();
  75  |   await page.keyboard.press("Enter"); await expect(help).toBeVisible();
  76  |   await page.keyboard.press("Tab"); await expect(help.getByRole("button", { name: "Close shortcuts" })).toBeFocused();
  77  |   await page.keyboard.press("Enter"); await expect(opener).toBeFocused();
  78  |   expect(await documentOf(page)).toEqual(before);
  79  | });
  80  | 
  81  | test("S06 Help keyboard menu returns focus to Canvas and remains independent across two Canvas contexts", async ({ page }) => {
  82  |   await page.getByRole("button", { name: "Second Canvas", exact: true }).click();
  83  |   const canvas = page.locator(".canvas").first(), r = (await canvas.boundingBox())!;
  84  |   await page.mouse.click(r.x + 300, r.y + 230);
  85  |   await page.keyboard.press("Shift+F10");
  86  |   await page.getByRole("menuitem", { name: "Keyboard shortcuts", exact: true }).click();
  87  |   const help = canvas.getByRole("dialog", { name: "Keyboard shortcuts" });
  88  |   await expect(help).toBeVisible(); await page.keyboard.press("Escape");
  89  |   await expect(canvas).toBeFocused();
  90  |   await page.locator(".canvas").nth(1).getByRole("button", { name: "Shortcuts", exact: true }).click();
  91  |   await expect(help).toBeHidden();
  92  |   await expect(page.locator(".canvas").nth(1).getByRole("dialog", { name: "Keyboard shortcuts" })).toBeVisible();
  93  |   await page.keyboard.press("Escape");
  94  |   await expect(page.locator(".canvas").nth(1).getByRole("button", { name: "Shortcuts", exact: true })).toBeFocused();
  95  | });
  96  | 
  97  | test("S06 Help readonly interaction and remounted document retain scoped lifetime", async ({ page }) => {
  98  |   await page.getByRole("button", { name: "Lock editing", exact: true }).click();
  99  |   const before = await documentOf(page);
  100 |   await page.getByRole("button", { name: "Shortcuts", exact: true }).click();
  101 |   const old = await page.locator("dialog.shortcut-help").elementHandle();
  102 |   await page.keyboard.press("Escape"); expect(await documentOf(page)).toEqual(before);
  103 |   await page.getByRole("button", { name: "Lock editing", exact: true }).click();
  104 |   await page.getByRole("button", { name: "New document", exact: true }).click();
  105 |   await page.getByRole("button", { name: "Shortcuts", exact: true }).click();
  106 |   await old!.evaluate((e) => { e.dispatchEvent(new PointerEvent("pointerdown", { clientX: -10, clientY: -10, button: 0, isPrimary: true, pointerId: 1 })); e.dispatchEvent(new PointerEvent("click", { clientX: -10, clientY: -10, pointerId: 1 })); });
> 107 |   await expect(page.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeVisible();
      |                                                                          ^ Error: expect(locator).toBeVisible() failed
  108 |   await page.keyboard.press("Escape");
  109 | });
  110 | 
```