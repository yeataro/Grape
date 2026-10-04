# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-debug-hover.spec.ts >> S06 F2-only all built-in readonly kinds and ordinary hints preserve document selection History Redo
- Location: ..\..\..\production\tests\browser\s06-debug-hover.spec.ts:53:1

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "Node:"
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
              - generic "Edge 0bd143c3-f6f9-4f0a-838e-02e238b182f3" [ref=e35]
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
  1   | import { test, expect, type Page, type Locator } from "@playwright/test";
  2   | import fs from "node:fs";
  3   | import path from "node:path";
  4   | import { createNode } from "./create-node.ts";
  5   | import { clickAction } from "../fixtures/public-actions.ts";
  6   | const out = process.env.GRAPE_EVIDENCE_DIR!;
  7   | const save = (n: string, v: unknown) =>
  8   |   fs.writeFileSync(
  9   |     path.join(out, n + ".json"),
  10  |     JSON.stringify(v, null, 2) + "\n",
  11  |   );
  12  | const dialog = (p: Page) =>
  13  |   p.getByRole("dialog", { name: "Object information", exact: true });
  14  | async function doc(p: Page) {
  15  |   const d = p.waitForEvent("download");
  16  |   await clickAction(p, "Export JSON");
  17  |   return JSON.parse(fs.readFileSync((await (await d).path())!, "utf8"));
  18  | }
  19  | async function focus(p: Page, t: Locator) {
  20  |   for (let i = 0; i < 180; i++) {
  21  |     if (await t.evaluate((e) => e === document.activeElement)) return;
  22  |     await p.keyboard.press("Shift+Tab");
  23  |   }
  24  |   throw Error("Trusted Tab target unavailable");
  25  | }
  26  | async function read(p: Page, t: Locator) {
  27  |   await focus(p, t);
  28  |   await p.keyboard.press("F2");
  29  |   await expect(dialog(p)).toBeVisible();
  30  |   return dialog(p).getByRole("region").innerText();
  31  | }
  32  | async function close(p: Page, t: Locator) {
  33  |   await p.keyboard.press("Escape");
  34  |   await expect(dialog(p)).not.toBeVisible();
  35  |   await expect(t).toBeFocused();
  36  | }
  37  | async function fixture(p: Page) {
  38  |   await createNode(p, "Color RGBA");
  39  |   const c = p.locator(".canvas").last(),
  40  |     n = c
  41  |       .locator("article.node")
  42  |       .filter({
  43  |         has: p.getByRole("heading", { name: "Color RGBA", exact: true }),
  44  |       });
  45  |   await n.locator('[data-direction="output"]').click();
  46  |   await c.locator('[data-direction="input"][data-port="color"]').click();
  47  |   return { c, n };
  48  | }
  49  | test.beforeEach(async ({ page }) => {
  50  |   page.on("dialog", (d) => d.accept());
  51  |   await page.goto("/");
  52  | });
  53  | test("S06 F2-only all built-in readonly kinds and ordinary hints preserve document selection History Redo", async ({
  54  |   page,
  55  | }) => {
  56  |   const { c, n } = await fixture(page),
  57  |     before = await doc(page),
  58  |     selection = await c.getAttribute("data-selection"),
  59  |     records = [];
  60  |   await expect(
  61  |     page.getByRole("button", { name: "Read object details", exact: true }),
  62  |   ).toHaveCount(0);
  63  |   await expect(
  64  |     page.getByRole("checkbox", { name: /Show object information/ }),
  65  |   ).toHaveCount(0);
  66  |   await expect(
  67  |     page.getByRole("button", { name: "Experimental features", exact: true }),
  68  |   ).toHaveCount(0);
  69  |   await expect(
  70  |     c.getByRole("button", { name: "Add Node", exact: true }),
  71  |   ).toHaveAttribute("title", /Tab/);
  72  |   for (const [k, t] of [
  73  |     ["Node", n],
  74  |     ["Port", n.locator('[data-direction="output"]')],
  75  |     ["Edge", c.locator(".wires path").first()],
  76  |     ["Panel", c],
  77  |     [
  78  |       "UI control",
  79  |       page.getByRole("button", { name: "Generate GLSL", exact: true }),
  80  |     ],
  81  |   ] as const) {
  82  |     const text = await read(page, t);
> 83  |     expect(text).toContain(k + ":");
      |                  ^ Error: expect(received).toContain(expected) // indexOf
  84  |     expect(text).not.toMatch(/editToken|TargetLease|MountTicket|"lease"/);
  85  |     if (k === "UI control") expect(text).toContain("未提供");
  86  |     records.push({ kind: k, text });
  87  |     await close(page, t);
  88  |   }
  89  |   expect(await c.getAttribute("data-selection")).toBe(selection);
  90  |   expect(await doc(page)).toEqual(before);
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
```