# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-debug-hover.spec.ts >> S06 pending connection and held gesture reject preference changes while readonly inspection remains
- Location: ..\..\..\production\tests\browser\s06-debug-hover.spec.ts:62:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.dispatchEvent: Test timeout of 30000ms exceeded.
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
    - navigation "Document actions" [ref=e10]:
      - generic [ref=e11]:
        - button "New document" [ref=e12] [cursor=pointer]
        - button "Save" [ref=e15] [cursor=pointer]
        - button "Open saved" [ref=e18] [cursor=pointer]
        - button "Export JSON" [ref=e21] [cursor=pointer]
        - button "Export PNG" [ref=e24] [cursor=pointer]
        - button "Open file" [ref=e27] [cursor=pointer]
      - generic [ref=e30]:
        - button "Generate GLSL" [ref=e31] [cursor=pointer]
        - button "Second Canvas" [ref=e34] [cursor=pointer]
        - button "Lock editing" [ref=e37] [cursor=pointer]
      - group [ref=e40]:
        - generic "More actions" [ref=e41] [cursor=pointer]
    - generic [ref=e43]:
      - generic [ref=e44]: Unsaved changes
      - generic [ref=e45]: Host-free
  - generic [ref=e47]:
    - button "Undo" [disabled] [ref=e48]
    - button "Redo" [disabled] [ref=e51]
    - button "Delete selected" [disabled] [ref=e54]
    - alert
  - main [ref=e55]:
    - generic [ref=e57]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [active] [ref=e58]:
        - generic:
          - generic:
            - img:
              - generic "Edge 6aeb7233-5a40-4f0d-ab05-005009abc4ec" [ref=e59]
            - generic:
              - group "Image output" [ref=e60]:
                - heading "Image output" [level=3] [ref=e61]
                - generic [ref=e62]:
                  - button "Image output input color" [ref=e63] [cursor=pointer]:
                    - generic [ref=e65]: color
                  - generic [ref=e66]: vec4
              - group "Color RGBA" [ref=e67]:
                - heading "Color RGBA" [level=3] [ref=e68]
                - generic [ref=e69]:
                  - button "Color RGBA output out" [ref=e70] [cursor=pointer]:
                    - generic [ref=e71]: out
                  - generic [ref=e73]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e74]:
          - button "New subgraph" [ref=e75] [cursor=pointer]
          - button "Library subgraph" [ref=e76] [cursor=pointer]
          - button "Encapsulate" [ref=e77] [cursor=pointer]
          - button "Make independent" [ref=e78] [cursor=pointer]
          - button "Enter subgraph" [ref=e79] [cursor=pointer]
          - button "Arrange nodes" [ref=e80] [cursor=pointer]
          - button "Frame selection" [ref=e81] [cursor=pointer]
          - group [ref=e82]:
            - generic "Local clipboard" [ref=e83] [cursor=pointer]
          - group [ref=e84]:
            - generic "Structures" [ref=e85] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e86]:
          - button "Vertex" [ref=e87] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e88] [cursor=pointer]
        - generic [ref=e89]:
          - button "Add Node" [disabled] [ref=e90]
          - button "Browse nodes" [ref=e93] [cursor=pointer]
          - button "Up" [disabled] [ref=e96]
          - button "Shortcuts" [ref=e99] [cursor=pointer]
    - complementary [ref=e102]:
      - generic [ref=e103]:
        - heading "Inspector" [level=2] [ref=e104]
        - paragraph [ref=e105]: Color RGBA
        - button "Rename node" [ref=e106] [cursor=pointer]
        - generic [ref=e109]:
          - generic [ref=e110]: Value
          - generic [ref=e111]:
            - text: R
            - textbox "R" [ref=e112]: "0.55"
          - generic [ref=e113]:
            - text: G
            - textbox "G" [ref=e114]: "0.28"
          - generic [ref=e115]:
            - text: B
            - textbox "B" [ref=e116]: "0.9"
          - generic [ref=e117]:
            - text: A
            - textbox "A" [ref=e118]: "1"
          - alert
  - generic [ref=e120]:
    - heading "Shader output" [level=2] [ref=e121]
    - paragraph [ref=e122]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics"
  - contentinfo [ref=e123]:
    - generic [ref=e124]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e125]: Scroll to zoom · Drag empty space to pan
    - generic [ref=e126]:
      - group [ref=e127]:
        - generic "Experimental features" [ref=e128] [cursor=pointer]
      - button "Read object details" [disabled] [ref=e129]
  - status [ref=e130]:
    - button "Read full application status" [ref=e131] [cursor=pointer]: Export started. Saved status is unchanged.
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import fs from "node:fs"; import path from "node:path";
  3   | import { createNode } from "./create-node.ts"; import { clickAction } from "../fixtures/public-actions.ts";
  4   | const out = process.env.GRAPE_EVIDENCE_DIR!;
  5   | const save = (name: string, data: unknown) => fs.writeFileSync(path.join(out, name + ".json"), JSON.stringify(data, null, 2) + "\n");
  6   | const dialog = (p: Page) => p.getByRole("dialog", { name: "Object information", exact: true });
  7   | const checkbox = (p: Page) => p.getByRole("checkbox", { name: "Show object information instead of normal hover hints" });
  8   | async function enable(p: Page) { await p.getByText("Experimental features", { exact: true }).click(); await checkbox(p).check(); await p.keyboard.press("Escape"); }
  9   | async function documentJSON(p: Page) { const wait = p.waitForEvent("download"); await clickAction(p, "Export JSON"); return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8")); }
  10  | async function read(p: Page) { await p.getByRole("button", { name: "Read object details", exact: true }).click(); await expect(dialog(p)).toBeVisible(); return dialog(p).getByRole("region").innerText(); }
  11  | async function close(p: Page) { await p.keyboard.press("Escape"); await expect(dialog(p)).not.toBeVisible(); await expect(p.getByRole("button", { name: "Read object details", exact: true })).toBeFocused(); }
  12  | async function fixture(p: Page) { await createNode(p, "Color RGBA"); const c = p.locator(".canvas").last(), n = c.locator("article.node").filter({ has: p.getByRole("heading", { name: "Color RGBA", exact: true }) }); await n.locator('[data-direction="output"]').click(); await c.locator('[data-direction="input"][data-port="color"]').click(); return { c, n }; }
  13  | test.beforeEach(async ({ page }) => { page.on("dialog", d => d.accept()); await page.goto("/"); });
  14  | 
  15  | test("S06 normal debug normal checkbox preserves graph history selection and covers built-in objects", async ({ page }) => {
  16  |   const { c, n } = await fixture(page), before = await documentJSON(page), selection = await c.getAttribute("data-selection");
  17  |   await n.getByRole("heading").hover(); await expect(page.locator(".hover-summary")).toBeEmpty();
  18  |   await enable(page); const records = [];
  19  |   for (const [kind, target] of [["Node", n.getByRole("heading")], ["Port", n.locator('[data-direction="output"]')], ["Edge", c.locator(".wires path")], ["Panel", page.locator(".inspector h2")], ["UI control", page.getByRole("button", { name: "Generate GLSL", exact: true })]] as const) {
  20  |     await target.hover(); await expect(page.locator(".hover-summary")).toContainText(kind);
  21  |     const details = await read(page); expect(details).toContain(kind + ":"); expect(details).not.toMatch(/editToken|generation|TargetLease|MountTicket|"lease"/);
  22  |     if (kind === "UI control") expect(details).toContain("未提供");
  23  |     records.push({ kind, details }); await close(page);
  24  |   }
  25  |   expect(await c.getAttribute("data-selection")).toBe(selection); expect(await documentJSON(page)).toEqual(before);
  26  |   await n.getByRole("heading").click(); const value = page.getByRole("textbox", { name: "R", exact: true }); await value.hover();
  27  |   const widget = await read(page); expect(widget).toContain("Parameter Widget"); expect(widget).toContain('"committed"'); records.push({ kind: "Parameter Widget", details: widget }); await close(page);
  28  |   await page.getByText("Experimental features", { exact: true }).click(); await checkbox(page).uncheck(); await page.keyboard.press("Escape");
  29  |   await n.getByRole("heading").hover(); await expect(page.locator(".hover-summary")).toBeEmpty();
  30  |   expect(await documentJSON(page)).toEqual(before); await clickAction(page, "Undo"); expect((await documentJSON(page)).graph.stages.find((s: any) => s.key === "pixel").network.edges).toHaveLength(0);
  31  |   await clickAction(page, "Redo"); expect(await documentJSON(page)).toEqual(before);
  32  |   save("built-in-objects", records); await page.screenshot({ path: path.join(out, "normal-restored.png") });
  33  | });
  34  | 
  35  | test("S06 scalar and vector committed values stay distinct from unfinished drafts and IME guards", async ({ page }) => {
  36  |   await enable(page); await createNode(page, "Multiply"); const c = page.locator(".canvas").last(); await c.getByRole("heading", { name: "Multiply", exact: true }).click();
  37  |   await page.getByText("Experimental features", { exact: true }).click(); const input = page.getByRole("textbox", { name: "A", exact: true }), before = await documentJSON(page);
  38  |   await input.fill("7.25");
  39  |   // Refusal is tested through an actual click, not a check() retry that hides rejection.
  40  |   await checkbox(page).click(); await expect(checkbox(page)).toBeChecked(); await expect(input).toHaveValue("7.25"); await expect(input).toBeFocused();
  41  |   await input.dispatchEvent("compositionstart"); await checkbox(page).click(); await expect(input).toBeFocused(); await expect(page.locator(".experimental-issue")).toContainText("composition");
  42  |   await input.dispatchEvent("compositionend"); await input.hover(); const text = await read(page); expect(text).toContain('"value": 1'); expect(text).toContain('"text": "7.25"'); await close(page);
  43  |   await input.press("Escape"); await expect(input).toHaveValue("1"); expect(await documentJSON(page)).toEqual(before);
  44  |   await createNode(page, "Color RGBA"); await c.getByRole("heading", { name: "Color RGBA", exact: true }).click();
  45  |   const r = page.getByRole("textbox", { name: "R", exact: true }); await r.fill("0.37"); await r.hover(); const vector = await read(page); expect(vector).toContain('"componentTexts"'); expect(vector).toContain('"0.37"'); await close(page); await r.press("Escape");
  46  |   save("drafts", { scalar: text, vector, composition: "Synthetic composition boundary events; actual typing/focus/click refusal. No physical IME qualification." });
  47  | });
  48  | 
  49  | test("S06 hover detail invalidation follows selection stage deletion Undo and same-ID reopen", async ({ page }) => {
  50  |   await enable(page); const { c, n } = await fixture(page), original = await documentJSON(page), id = await n.getAttribute("data-node");
  51  |   await n.getByRole("heading").hover(); expect(await read(page)).toContain(id!); await close(page);
  52  |   await c.getByRole("button", { name: "Vertex", exact: true }).click(); await expect(page.getByRole("button", { name: "Read object details", exact: true })).toBeDisabled();
  53  |   await c.getByRole("button", { name: "Pixel", exact: true }).click(); await n.getByRole("heading").click(); await clickAction(page, "Delete selected"); await expect(n).toHaveCount(0);
  54  |   await expect(page.locator(".hover-summary")).toBeEmpty(); await clickAction(page, "Undo"); await expect(n).toHaveCount(1);
  55  |   const old = await n.elementHandle();
  56  |   await page.getByLabel("Open document file").setInputFiles({ name: "same-id.grape.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(original)) });
  57  |   await page.getByRole("button", { name: "Open in new session", exact: true }).click(); expect(await old!.evaluate(e => e.isConnected)).toBe(false);
  58  |   await expect(dialog(page)).not.toBeVisible(); await expect(page.locator(".hover-summary")).not.toContainText("Color RGBA"); const fresh = page.locator(`article[data-node="${id}"]`); await fresh.getByRole("heading").hover(); expect(await read(page)).toContain(id!); await close(page); expect(await documentJSON(page)).toEqual(original);
  59  |   save("lifetime-public", { id, samePersistentIdDifferentMount: true, stageDeletionUndoReopen: "passed" });
  60  | });
  61  | 
  62  | test("S06 pending connection and held gesture reject preference changes while readonly inspection remains", async ({ page }) => {
  63  |   await enable(page); const { c, n } = await fixture(page), before = await documentJSON(page);
  64  |   await page.getByText("Experimental features", { exact: true }).click(); await n.locator('[data-direction="output"]').click(); await checkbox(page).click(); await expect(checkbox(page)).toBeChecked(); await expect(page.locator(".experimental-issue")).toContainText("connection");
  65  |   await page.keyboard.press("Escape"); await page.getByText("Experimental features", { exact: true }).click();
  66  |   await clickAction(page, "Lock editing"); await n.getByRole("heading").hover(); expect(await read(page)).toContain("Node:"); await close(page); expect(await documentJSON(page)).toEqual(before);
  67  |   await n.getByRole("heading").click(); await page.getByRole("textbox", { name: "R", exact: true }).hover(); expect(await read(page)).toContain("Read-only"); await close(page);
  68  |   await clickAction(page, "Lock editing"); await n.getByRole("heading").click(); const b = (await n.getByRole("heading").boundingBox())!;
  69  |   await page.mouse.move(b.x + 20, b.y + 10); await page.mouse.down(); await page.mouse.move(b.x + 60, b.y + 40, { steps: 5 });
> 70  |   await checkbox(page).dispatchEvent("click"); await expect(checkbox(page)).toBeChecked(); // synthetic concurrent UI event while real mouse gesture is held
      |                        ^ Error: locator.dispatchEvent: Test timeout of 30000ms exceeded.
  71  |   await page.keyboard.press("Escape"); await page.mouse.up(); expect(await documentJSON(page)).toEqual(before);
  72  |   save("gesture-preference-guard", { actualMouseDrag: true, concurrentCheckbox: "Synthetic click while held; no second physical pointer claim", naturalEscape: true });
  73  | });
  74  | 
  75  | for (const bad of ["malformed", "denied", "read-denied"]) test(`S06 preference ${bad} visibly falls back without touching other keys`, async ({ page }) => {
  76  |   await page.addInitScript(mode => { localStorage.setItem("other-app", "retain"); if (mode === "malformed") localStorage.setItem("grape.preferences.hover.v1", "{broken}"); else if (mode === "read-denied") { const original = Storage.prototype.getItem; Storage.prototype.getItem = function(k) { if (k === "grape.preferences.hover.v1") throw new DOMException("Denied", "SecurityError"); return original.call(this, k); }; } else { const original = Storage.prototype.setItem; Storage.prototype.setItem = function(k, v) { if (k === "grape.preferences.hover.v1") throw new DOMException("Denied", "SecurityError"); return original.call(this, k, v); }; } }, bad);
  77  |   await page.reload(); await page.getByText("Experimental features", { exact: true }).click(); await expect(checkbox(page)).not.toBeChecked();
  78  |   if (bad === "malformed") await expect(page.locator(".experimental-issue")).toContainText("invalid");
  79  |   else if (bad === "denied") { await checkbox(page).click(); await expect(checkbox(page)).not.toBeChecked(); await expect(page.locator(".experimental-issue")).toContainText("could not be saved"); }
  80  |   else await expect(page.locator(".experimental-issue")).toContainText("unavailable");
  81  |   expect(await page.evaluate(() => localStorage.getItem("other-app"))).toBe("retain"); save("preference-" + bad, { issue: await page.locator(".experimental-issue").innerText(), current: await page.evaluate(() => { try { return localStorage.getItem("grape.preferences.hover.v1"); } catch { return "storage unavailable"; } }) });
  82  | });
  83  | 
  84  | test("S06 diagnostic preference persists separately and rapid hover performs no per-move capture or serialization", async ({ page }) => {
  85  |   await enable(page); await page.reload(); await page.getByText("Experimental features", { exact: true }).click(); await expect(checkbox(page)).toBeChecked(); await page.keyboard.press("Escape");
  86  |   const { c, n } = await fixture(page), before = await documentJSON(page), selection = await c.getAttribute("data-selection");
  87  |   await page.evaluate(() => { const clone = window.structuredClone, stringify = JSON.stringify; (window as any).__hoverCounts = { clone: 0, stringify: 0 }; window.structuredClone = (...args) => { (window as any).__hoverCounts.clone++; return clone(...args); }; JSON.stringify = ((...args: any[]) => { (window as any).__hoverCounts.stringify++; return (stringify as any)(...args); }) as typeof JSON.stringify; });
  88  |   await n.getByRole("heading").hover(); await page.evaluate(() => { (window as any).__hoverCounts = { clone: 0, stringify: 0 }; });
  89  |   const b = (await n.getByRole("heading").boundingBox())!;
  90  |   for (let i = 0; i < 80; i++) await page.mouse.move(b.x + 10 + i % 30, b.y + 10);
  91  |   const counts = await page.evaluate(() => (window as any).__hoverCounts); expect(counts).toEqual({ clone: 0, stringify: 0 }); expect(await c.getAttribute("data-selection")).toBe(selection); expect(await documentJSON(page)).toEqual(before);
  92  |   save("rapid-hover-counts", { moves: 80, counts, methodology: "Browser-wide structuredClone and JSON.stringify counters after entry, actual trusted mouse movement within one current target; instrumentation only in disposable context. This is not a general performance/FPS claim." });
  93  | });
  94  | 
  95  | test("S06 keyboard details and bounded long owner data are readable without selection layout changes", async ({ page }) => {
  96  |   await enable(page); const { c, n } = await fixture(page); await n.getByRole("heading").click();
  97  |   const before = await documentJSON(page), geometry = await n.boundingBox(); await n.getByRole("heading").hover();
  98  |   const button = page.getByRole("button", { name: "Read object details", exact: true });
  99  |   // Pure keyboard target navigation and the explicit reader shortcut, without focus injection.
  100 |   for (let i = 0; i < 150 && !(await n.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press("Shift+Tab");
  101 |   await expect(n).toBeFocused(); await page.keyboard.press("F2"); await expect(dialog(page)).toBeVisible();
  102 |   await page.setViewportSize({ width: 620, height: 380 }); const text = dialog(page).getByRole("region"); await page.keyboard.press("Control+End"); await page.keyboard.press("End");
  103 |   await expect.poll(() => text.evaluate(el => el.scrollHeight - el.clientHeight - el.scrollTop)).toBeLessThanOrEqual(1);
  104 |   const facts = await text.evaluate(el => ({ width: el.clientWidth, scrollWidth: el.scrollWidth, height: el.clientHeight, scrollHeight: el.scrollHeight, text: el.textContent })); expect(facts.scrollWidth).toBeLessThanOrEqual(facts.width + 1); expect(facts.text).toContain('"committed"');
  105 |   await page.screenshot({ path: path.join(out, "debug-details-narrow.png") }); await page.keyboard.press("Escape"); await expect(n).toBeFocused(); await page.setViewportSize({ width: 1440, height: 1000 }); expect(await n.boundingBox()).toEqual(geometry); expect(await documentJSON(page)).toEqual(before); save("keyboard-long-details", facts);
  106 | });
  107 | 
```