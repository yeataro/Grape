# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05-escape-focus.spec.ts >> S05 natural Escape cancels wrapper after Export drag with no History entry
- Location: ..\..\..\production\tests\browser\s05-escape-focus.spec.ts:8:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForEvent: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for event "download"
============================================================
```

# Page snapshot

```yaml
- iframe [active] [ref=e1]:
  - generic [ref=f1e2]:
    - banner [ref=f1e3]:
      - generic [ref=f1e4]:
        - text: Grape
        - generic [ref=f1e9]: SHADER WORKSPACE
        - generic "No candidate identity injected" [ref=f1e10]: Development · unversioned
        - button "本輪更新" [ref=f1e11] [cursor=pointer]
      - navigation "Document actions" [ref=f1e12]:
        - button "Save" [ref=f1e13] [cursor=pointer]
        - button "Generate GLSL" [ref=f1e16] [cursor=pointer]
      - generic [ref=f1e19]:
        - generic [ref=f1e20]: Unsaved changes
        - generic [ref=f1e21]: Host-free
    - generic [ref=f1e23]:
      - button "Undo" [disabled] [ref=f1e24]
      - button "Redo" [disabled] [ref=f1e27]
      - button "Delete selected" [ref=f1e30] [cursor=pointer]
      - alert
    - main [ref=f1e31]:
      - generic [ref=f1e33]:
        - generic: Canvas 1
        - generic "Shader graph canvas" [ref=f1e34]:
          - group "Image output" [ref=f1e35]:
            - heading "Image output" [level=3] [ref=f1e36]
            - generic [ref=f1e37]:
              - button "Image output input color" [ref=f1e38] [cursor=pointer]
              - generic [ref=f1e39]: color
              - generic [ref=f1e40]: vec4
          - generic:
            - button "Untitled shader / pixel" [disabled]
          - generic [ref=f1e41]:
            - button "New subgraph" [ref=f1e42] [cursor=pointer]
            - button "Library subgraph" [ref=f1e43] [cursor=pointer]
            - button "Encapsulate" [ref=f1e44] [cursor=pointer]
            - button "Make independent" [ref=f1e45] [cursor=pointer]
            - button "Enter subgraph" [ref=f1e46] [cursor=pointer]
            - button "Arrange nodes" [ref=f1e47] [cursor=pointer]
            - button "Frame selection" [ref=f1e48] [cursor=pointer]
            - group [ref=f1e49]:
              - generic "Local clipboard" [ref=f1e50] [cursor=pointer]
            - group [ref=f1e51]:
              - generic "Structures" [ref=f1e52] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=f1e53]:
            - button "Vertex" [ref=f1e54] [cursor=pointer]
            - button "Pixel" [pressed] [ref=f1e55] [cursor=pointer]
          - generic [ref=f1e56]:
            - button "Add Node" [ref=f1e57] [cursor=pointer]
            - button "Browse nodes" [ref=f1e60] [cursor=pointer]
            - button "Up" [disabled] [ref=f1e63]
            - button "Shortcuts" [ref=f1e66] [cursor=pointer]
      - complementary [ref=f1e69]:
        - generic [ref=f1e70]:
          - heading "Inspector" [level=2] [ref=f1e71]
          - paragraph [ref=f1e72]: Select a node to inspect its parameters.
    - contentinfo [ref=f1e73]:
      - button "Project actions" [ref=f1e74] [cursor=pointer]
      - status [ref=f1e75]:
        - button "Read full application status" [disabled] [ref=f1e76]
      - button "Shader output" [ref=f1e77] [cursor=pointer]
      - generic [ref=f1e78]:
        - button "Experimental features" [ref=f1e80] [cursor=pointer]
        - button "Read object details" [disabled] [ref=f1e81]
      - button "Hints" [ref=f1e82] [cursor=pointer]
```

# Test source

```ts
  1   | import fs from "node:fs";
  2   | import path from "node:path";
  3   | import { expect, type Page } from "@playwright/test";
  4   | 
  5   | /** Public, natural event path. Never refocus Canvas from the test. */
  6   | export async function naturalEscapeFlow(
  7   |   page: Page,
  8   |   origin: string,
  9   |   wrapper: boolean,
  10  |   exportFirst: boolean,
  11  |   fixture: Buffer,
  12  |   output: string,
  13  | ) {
  14  |   page.on("dialog", (dialog) => void dialog.accept());
  15  |   const errors: string[] = [];
  16  |   page.on("pageerror", (error) => errors.push(error.message));
  17  |   const wrapperURL = origin + "/escape-wrapper.html";
  18  |   if (wrapper)
  19  |     await page.route(wrapperURL, (route) =>
  20  |       route.fulfill({
  21  |         contentType: "text/html",
  22  |         body: '<!doctype html><title>Isolated Canvas wrapper</title><iframe src="/" style="position:fixed;inset:0;width:100%;height:100%;border:0"></iframe>',
  23  |       }),
  24  |     );
  25  |   await page.goto(wrapper ? wrapperURL : origin);
  26  |   const app = wrapper ? page.frameLocator("iframe") : page;
  27  |   await app.getByLabel("Open document file", { exact: true }).setInputFiles({
  28  |     name: "fixture-14-Multiply.json",
  29  |     mimeType: "application/json",
  30  |     buffer: fixture,
  31  |   });
  32  |   await app
  33  |     .getByRole("button", { name: "Open in new session", exact: true })
  34  |     .click();
  35  |   await expect(app.locator("#recovery")).toBeHidden();
  36  |   const frame = wrapper
  37  |     ? page
  38  |         .frames()
  39  |         .find((f) => f !== page.mainFrame() && f.url() === origin + "/")!
  40  |     : page.mainFrame();
  41  |   await frame.evaluate(() => {
  42  |     const describe = (el: any) => ({
  43  |       tag: el?.tagName,
  44  |       className: el?.className,
  45  |       node: el?.dataset?.node,
  46  |     });
  47  |     (globalThis as any).__escapeTrace = [];
  48  |     for (const type of [
  49  |       "pointerdown",
  50  |       "pointerup",
  51  |       "mousedown",
  52  |       "mouseup",
  53  |       "keydown",
  54  |       "focusin",
  55  |       "focusout",
  56  |     ])
  57  |       document.addEventListener(
  58  |         type,
  59  |         (event: any) => {
  60  |           (globalThis as any).__escapeTrace.push({
  61  |             type,
  62  |             key: event.key,
  63  |             target: describe(event.target),
  64  |             active: describe(document.activeElement),
  65  |             path: event.composedPath().slice(0, 6).map(describe),
  66  |             time: performance.now(),
  67  |           });
  68  |         },
  69  |         true,
  70  |       );
  71  |   });
  72  |   const title = app
  73  |     .locator(".canvas")
  74  |     .first()
  75  |     .getByRole("heading", { name: "Multiply", exact: true });
  76  |   const position = () =>
  77  |     title.evaluate((el) => {
  78  |       const card = el.closest<HTMLElement>(".node")!;
  79  |       return [parseFloat(card.style.left), parseFloat(card.style.top)];
  80  |     });
  81  |   const exportDocument = async () => {
> 82  |     const downloaded = page.waitForEvent("download");
      |                             ^ Error: page.waitForEvent: Test timeout of 30000ms exceeded.
  83  |     const exportButton = app.getByRole("button", { name: "Export JSON", exact: true });
  84  |     if (!(await exportButton.isVisible())) await app.getByRole("button", { name: "Project actions", exact: true }).click();
  85  |     await exportButton.click();
  86  |     return JSON.parse(
  87  |       fs.readFileSync((await (await downloaded).path())!, "utf8"),
  88  |     );
  89  |   };
  90  |   const drag = async (dx: number, dy: number) => {
  91  |     const box = (await title.boundingBox())!;
  92  |     const x = box.x + box.width / 2,
  93  |       y = box.y + box.height / 2;
  94  |     await page.mouse.move(x, y);
  95  |     await page.mouse.down();
  96  |     await page.mouse.move(x + dx, y + dy, { steps: 8 });
  97  |   };
  98  |   await title.click();
  99  |   if (exportFirst) await exportDocument();
  100 |   const initial = await position();
  101 |   await drag(100, 60);
  102 |   await page.mouse.up();
  103 |   const committed = await position();
  104 |   expect(committed).toEqual([initial[0] + 100, initial[1] + 60]);
  105 |   if (exportFirst) await exportDocument();
  106 |   await app.getByRole("button", { name: "Undo", exact: true }).click();
  107 |   expect(await position()).toEqual(initial);
  108 |   if (exportFirst) await exportDocument();
  109 |   await app.getByRole("button", { name: "Redo", exact: true }).click();
  110 |   if (exportFirst) await exportDocument();
  111 |   const beforeEscape = await position();
  112 |   await drag(70, 30);
  113 |   const during = await position();
  114 |   const active = await frame.evaluate(() => ({
  115 |     tag: document.activeElement?.tagName,
  116 |     className: document.activeElement?.className,
  117 |   }));
  118 |   await page.keyboard.press("Escape");
  119 |   const afterEscape = await position();
  120 |   const boxAfterEscape = (await title.boundingBox())!;
  121 |   await page.mouse.move(
  122 |     boxAfterEscape.x + boxAfterEscape.width / 2 + 90,
  123 |     boxAfterEscape.y + boxAfterEscape.height / 2 + 40,
  124 |   );
  125 |   const afterHeldMove = await position();
  126 |   await page.mouse.up();
  127 |   const afterPointerUp = await position();
  128 |   const trace = await frame.evaluate(() => (globalThis as any).__escapeTrace);
  129 |   const result: any = {
  130 |     wrapper,
  131 |     exportFirst,
  132 |     initial,
  133 |     committed,
  134 |     beforeEscape,
  135 |     during,
  136 |     active,
  137 |     afterEscape,
  138 |     afterHeldMove,
  139 |     afterPointerUp,
  140 |     trace,
  141 |     errors,
  142 |   };
  143 |   fs.mkdirSync(path.dirname(output), { recursive: true });
  144 |   fs.writeFileSync(output, JSON.stringify(result, null, 2) + "\n", {
  145 |     flag: "wx",
  146 |   });
  147 |   await page.screenshot({ path: output + ".png", fullPage: true });
  148 |   expect(afterEscape).toEqual(beforeEscape);
  149 |   expect(afterHeldMove).toEqual(beforeEscape);
  150 |   expect(afterPointerUp).toEqual(beforeEscape);
  151 |   expect(
  152 |     trace
  153 |       .filter((e: any) => e.type === "keydown" && e.key === "Escape")
  154 |       .at(-1)
  155 |       .path.some((e: any) => e.className?.split?.(" ").includes("canvas")),
  156 |   ).toBe(true);
  157 |   // Cancel must not insert a History entry: Undo reaches the first drag's start.
  158 |   await app.getByRole("button", { name: "Undo", exact: true }).click();
  159 |   expect(await position()).toEqual(initial);
  160 |   await expect(
  161 |     app.getByRole("button", { name: "Undo", exact: true }),
  162 |   ).toBeDisabled();
  163 |   await app.getByRole("button", { name: "Redo", exact: true }).click();
  164 |   expect(await position()).toEqual(committed);
  165 |   const document = await exportDocument();
  166 |   expect(
  167 |     document.graph.stages
  168 |       .flatMap((s: any) => s.network.nodes)
  169 |       .find((n: any) => n.name === "Multiply").position,
  170 |   ).toEqual(committed);
  171 |   expect(errors).toEqual([]);
  172 |   fs.writeFileSync(
  173 |     output + ".verified.json",
  174 |     JSON.stringify(
  175 |       {
  176 |         status: "PASS",
  177 |         naturalKeyboard: true,
  178 |         noTestRefocus: true,
  179 |         cancelHasNoHistoryEntry: true,
  180 |         document,
  181 |       },
  182 |       null,
```