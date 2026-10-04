# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-f2-isolation.spec.ts >> S06 optional inspection absent preserves normal public editing save ACK generation Undo Redo
- Location: ..\..\..\production\tests\browser\s06-f2-isolation.spec.ts:8:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('article').filter({ has: getByRole('heading', { name: 'Color RGBA', exact: true }) }).locator('[data-port="color"]')

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
              - group "Color RGBA" [ref=e41]:
                - heading "Color RGBA" [level=3] [ref=e42]
                - generic [ref=e43]:
                  - button "Color RGBA output out" [ref=e44] [cursor=pointer]
                  - generic [ref=e45]: out
                  - generic [ref=e46]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
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
        - paragraph [ref=e78]: Color RGBA
        - button "Rename node" [ref=e79] [cursor=pointer]
        - generic [ref=e82]:
          - generic [ref=e83]: Value
          - generic [ref=e84]:
            - text: R
            - textbox "R" [active] [ref=e85]: "0.25"
          - generic [ref=e86]:
            - text: G
            - textbox "G" [ref=e87]: "0.28"
          - generic [ref=e88]:
            - text: B
            - textbox "B" [ref=e89]: "0.9"
          - generic [ref=e90]:
            - text: A
            - textbox "A" [ref=e91]: "1"
          - alert
  - contentinfo [ref=e92]:
    - button "Project actions" [ref=e93] [cursor=pointer]
    - status [ref=e94]:
      - button "Read full application status" [disabled] [ref=e95]
    - button "Shader output" [ref=e96] [cursor=pointer]
    - button "Hints" [ref=e97] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import fs from "node:fs";
  3   | import path from "node:path";
  4   | import { createNode } from "./create-node.ts";
  5   | import { clickAction } from "../fixtures/public-actions.ts";
  6   | const out = process.env.GRAPE_EVIDENCE_DIR!;
  7   | for (const mode of ["absent", "disposed", "failed-construction"])
  8   |   test(
  9   |     "S06 optional inspection " +
  10  |       mode +
  11  |       " preserves normal public editing save ACK generation Undo Redo",
  12  |     async ({ page }) => {
  13  |       const errors: string[] = [];
  14  |       page.on("pageerror", (e) => errors.push(e.message));
  15  |       if (mode === "failed-construction")
  16  |         await page.route("**/src/ui/hover.ts", async (r) => {
  17  |           const response = await r.fetch(),
  18  |             text = await response.text();
  19  |           expect(text).toContain("new MutationObserver(");
  20  |           await r.fulfill({
  21  |             response,
  22  |             body: text.replace(
  23  |               "new MutationObserver(",
  24  |               'new (class { constructor() { throw Error("injected optional helper initialization fault"); } })(',
  25  |             ),
  26  |           });
  27  |         });
  28  |       else
  29  |         await page.route("**/apps/web/main.ts", async (r) => {
  30  |           const response = await r.fetch(),
  31  |             text = await response.text();
  32  |           const pattern = /const hover = mountHover\([\s\S]*?\);/;
  33  |           expect(text).toMatch(pattern);
  34  |           await r.fulfill({
  35  |             response,
  36  |             body: text.replace(
  37  |               pattern,
  38  |               mode === "absent"
  39  |                 ? "const hover = {invalidate() {}, dispose() {}};"
  40  |                 : (m) => m + "\nhover.dispose();",
  41  |             ),
  42  |           });
  43  |         });
  44  |       await page.goto("/");
  45  |       await createNode(page, "Color RGBA");
  46  |       const node = page
  47  |         .locator("article")
  48  |         .filter({
  49  |           has: page.getByRole("heading", { name: "Color RGBA", exact: true }),
  50  |         });
  51  |       await node.getByRole("heading").click();
  52  |       const r = page.getByRole("textbox", { name: "R", exact: true });
  53  |       await r.fill("0.25");
  54  |       await r.press("Enter");
> 55  |       await node.locator('[data-port="color"]').click();
      |                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
  56  |       await page
  57  |         .locator('.canvas [data-direction="input"][data-port="color"]')
  58  |         .click();
  59  |       const exported = async () => {
  60  |         const d = page.waitForEvent("download");
  61  |         await clickAction(page, "Export JSON");
  62  |         return JSON.parse(fs.readFileSync((await (await d).path())!, "utf8"));
  63  |       };
  64  |       const before = await exported();
  65  |       await clickAction(page, "Generate GLSL");
  66  |       await page
  67  |         .getByRole("button", { name: "Shader output", exact: true })
  68  |         .click();
  69  |       await expect(page.locator("#code")).toContainText("void main");
  70  |       await page.keyboard.press("Escape");
  71  |       await clickAction(page, "Save");
  72  |       await expect(page.locator("#save-state")).toHaveText("Saved");
  73  |       await page.keyboard.press("F2");
  74  |       await expect(
  75  |         page.getByRole("dialog", { name: "Object information", exact: true }),
  76  |       ).not.toBeVisible();
  77  |       await clickAction(page, "Undo");
  78  |       await clickAction(page, "Redo");
  79  |       expect(await exported()).toEqual(before);
  80  |       expect(errors).toEqual([]);
  81  |       fs.writeFileSync(
  82  |         path.join(out, "isolation-" + mode + ".json"),
  83  |         JSON.stringify(
  84  |           {
  85  |             mode,
  86  |             method:
  87  |               "Disposable Vite-response adaptation at optional presentation seam only; no model hydration or injected Graph. Actual public create/edit/connect/generate/save/Undo/Redo/export.",
  88  |             errors,
  89  |             preserved: true,
  90  |           },
  91  |           null,
  92  |           2,
  93  |         ),
  94  |       );
  95  |     },
  96  |   );
  97  | test("S06 readonly owner fault registration serialization invalidation and multi-instance disposal stay local", async ({
  98  |   page,
  99  | }) => {
  100 |   await page.goto("/");
  101 |   const result = await page.evaluate(async () => {
  102 |     const moduleURL = "/src/ui/hover.ts",
  103 |       mountURL = "/src/ui/mount.ts";
  104 |     const { hoverOwner, mountHover, invalidateHover } = await import(moduleURL),
  105 |       { PresentationSession } = await import(mountURL);
  106 |     const root = document.createElement("section");
  107 |     document.body.append(root);
  108 |     const root2 = document.createElement("section");
  109 |     document.body.append(root2);
  110 |     const helper = mountHover(root, () => false),
  111 |       helper2 = mountHover(root2, () => false);
  112 |     let reads = 0,
  113 |       events = 0,
  114 |       mode = "normal",
  115 |       notify = () => {},
  116 |       late = () => {},
  117 |       data: any = { name: "first" },
  118 |       sequence = 0;
  119 |     const session = new PresentationSession(
  120 |       {
  121 |         kind: "panel",
  122 |         capture: () => ({ revision: sequence++ }),
  123 |         subscribe: (fn: any) => {
  124 |           notify = fn;
  125 |           return () => {};
  126 |         },
  127 |         dispose: () => {},
  128 |         mount: (m: any) => {
  129 |           const button = document.createElement("button");
  130 |           button.textContent = "Fault fixture";
  131 |           m.surface.target.append(button);
  132 |           m.scope.own(() => button.remove());
  133 |           button.onclick = m.scope.event(() => events++);
  134 |           m.hover(null).set(null, () => {
  135 |             throw Error("invalid registration must stay inert");
  136 |           });
  137 |           const binding = m.hover(root, () => {
  138 |             if (mode === "guard") throw Error("guard");
  139 |             return null;
  140 |           });
  141 |           late = () =>
  142 |             binding.set(button, () => ({
  143 |               kind: "Node",
  144 |               name: "STALE",
  145 |               identity: "same-id",
  146 |               state: "revoked",
  147 |             }));
  148 |           return {
  149 |             update: () => {
  150 |               binding.set(null, () => {});
  151 |               binding.set(button, () => {
  152 |                 reads++;
  153 |                 if (mode === "read") throw Error("read");
  154 |                 if (mode === "serial")
  155 |                   return {
```