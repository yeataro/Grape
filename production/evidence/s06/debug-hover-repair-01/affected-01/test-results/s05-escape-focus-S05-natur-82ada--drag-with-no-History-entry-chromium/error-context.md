# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05-escape-focus.spec.ts >> S05 natural Escape cancels wrapper without Export drag with no History entry
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
      - button "Undo" [ref=f1e24] [cursor=pointer]
      - button "Redo" [disabled] [ref=f1e27]
      - button "Delete selected" [ref=f1e30] [cursor=pointer]
      - alert
    - main [ref=f1e31]:
      - generic [ref=f1e33]:
        - generic: Canvas 1
        - generic "Shader graph canvas" [ref=f1e34]:
          - generic:
            - generic:
              - img:
                - generic "Edge 166b3e13-1ebf-4599-8128-0abea80b72c1" [ref=f1e35]
                - generic "Edge 94c35881-d237-4dc3-b603-22f3b0e01cb3" [ref=f1e36]
                - generic "Edge a4d59b58-a214-4957-b08f-096fbaf220e2" [ref=f1e37]
              - generic:
                - group "Image output" [ref=f1e38]:
                  - heading "Image output" [level=3] [ref=f1e39]
                  - generic [ref=f1e40]:
                    - button "Image output input color" [ref=f1e41] [cursor=pointer]
                    - generic [ref=f1e42]: color
                    - generic [ref=f1e43]: vec4
                - group "Float" [ref=f1e44]:
                  - heading "Float" [level=3] [ref=f1e45]
                  - generic [ref=f1e46]:
                    - button "Float output value" [ref=f1e47] [cursor=pointer]
                    - generic [ref=f1e48]: value
                    - generic [ref=f1e49]: float
                - group "Multiply" [ref=f1e50]:
                  - heading "Multiply" [level=3] [ref=f1e51]
                  - generic [ref=f1e52]:
                    - button "Multiply input a" [ref=f1e53] [cursor=pointer]
                    - generic [ref=f1e54]: a
                    - generic [ref=f1e55]: float
                  - generic [ref=f1e56]:
                    - button "Multiply input b" [ref=f1e57] [cursor=pointer]
                    - generic [ref=f1e58]: b
                    - generic [ref=f1e59]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e60]: "2"
                  - generic [ref=f1e61]:
                    - button "Multiply output result" [ref=f1e62] [cursor=pointer]
                    - generic [ref=f1e63]: result
                    - generic [ref=f1e64]: float
                - group "Compose" [ref=f1e65]:
                  - heading "Compose" [level=3] [ref=f1e66]
                  - generic [ref=f1e67]:
                    - button "Compose input x" [ref=f1e68] [cursor=pointer]
                    - generic [ref=f1e69]: x
                    - generic [ref=f1e70]: float
                  - generic [ref=f1e71]:
                    - button "Compose input y" [ref=f1e72] [cursor=pointer]
                    - generic [ref=f1e73]: "y"
                    - generic [ref=f1e74]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e75]: "0"
                  - generic [ref=f1e76]:
                    - button "Compose input z" [ref=f1e77] [cursor=pointer]
                    - generic [ref=f1e78]: z
                    - generic [ref=f1e79]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e80]: "0"
                  - generic [ref=f1e81]:
                    - button "Compose input w" [ref=f1e82] [cursor=pointer]
                    - generic [ref=f1e83]: w
                    - generic [ref=f1e84]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e85]: "1"
                  - generic [ref=f1e86]:
                    - button "Compose output result" [ref=f1e87] [cursor=pointer]
                    - generic [ref=f1e88]: result
                    - generic [ref=f1e89]: vec4
                - group "Unused Multiply 0" [ref=f1e90]:
                  - heading "Unused Multiply 0" [level=3] [ref=f1e91]
                  - generic [ref=f1e92]:
                    - button "Unused Multiply 0 input a" [ref=f1e93] [cursor=pointer]
                    - generic [ref=f1e94]: a
                    - generic [ref=f1e95]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e96]: "1"
                  - generic [ref=f1e97]:
                    - button "Unused Multiply 0 input b" [ref=f1e98] [cursor=pointer]
                    - generic [ref=f1e99]: b
                    - generic [ref=f1e100]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e101]: "2"
                  - generic [ref=f1e102]:
                    - button "Unused Multiply 0 output result" [ref=f1e103] [cursor=pointer]
                    - generic [ref=f1e104]: result
                    - generic [ref=f1e105]: float
                - group "Unused Multiply 1" [ref=f1e106]:
                  - heading "Unused Multiply 1" [level=3] [ref=f1e107]
                  - generic [ref=f1e108]:
                    - button "Unused Multiply 1 input a" [ref=f1e109] [cursor=pointer]
                    - generic [ref=f1e110]: a
                    - generic [ref=f1e111]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e112]: "1"
                  - generic [ref=f1e113]:
                    - button "Unused Multiply 1 input b" [ref=f1e114] [cursor=pointer]
                    - generic [ref=f1e115]: b
                    - generic [ref=f1e116]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e117]: "2"
                  - generic [ref=f1e118]:
                    - button "Unused Multiply 1 output result" [ref=f1e119] [cursor=pointer]
                    - generic [ref=f1e120]: result
                    - generic [ref=f1e121]: float
                - group "Unused Multiply 2" [ref=f1e122]:
                  - heading "Unused Multiply 2" [level=3] [ref=f1e123]
                  - generic [ref=f1e124]:
                    - button "Unused Multiply 2 input a" [ref=f1e125] [cursor=pointer]
                    - generic [ref=f1e126]: a
                    - generic [ref=f1e127]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e128]: "1"
                  - generic [ref=f1e129]:
                    - button "Unused Multiply 2 input b" [ref=f1e130] [cursor=pointer]
                    - generic [ref=f1e131]: b
                    - generic [ref=f1e132]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e133]: "2"
                  - generic [ref=f1e134]:
                    - button "Unused Multiply 2 output result" [ref=f1e135] [cursor=pointer]
                    - generic [ref=f1e136]: result
                    - generic [ref=f1e137]: float
                - group "Unused Multiply 3" [ref=f1e138]:
                  - heading "Unused Multiply 3" [level=3] [ref=f1e139]
                  - generic [ref=f1e140]:
                    - button "Unused Multiply 3 input a" [ref=f1e141] [cursor=pointer]
                    - generic [ref=f1e142]: a
                    - generic [ref=f1e143]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e144]: "1"
                  - generic [ref=f1e145]:
                    - button "Unused Multiply 3 input b" [ref=f1e146] [cursor=pointer]
                    - generic [ref=f1e147]: b
                    - generic [ref=f1e148]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e149]: "2"
                  - generic [ref=f1e150]:
                    - button "Unused Multiply 3 output result" [ref=f1e151] [cursor=pointer]
                    - generic [ref=f1e152]: result
                    - generic [ref=f1e153]: float
                - group "Unused Multiply 4" [ref=f1e154]:
                  - heading "Unused Multiply 4" [level=3] [ref=f1e155]
                  - generic [ref=f1e156]:
                    - button "Unused Multiply 4 input a" [ref=f1e157] [cursor=pointer]
                    - generic [ref=f1e158]: a
                    - generic [ref=f1e159]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e160]: "1"
                  - generic [ref=f1e161]:
                    - button "Unused Multiply 4 input b" [ref=f1e162] [cursor=pointer]
                    - generic [ref=f1e163]: b
                    - generic [ref=f1e164]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e165]: "2"
                  - generic [ref=f1e166]:
                    - button "Unused Multiply 4 output result" [ref=f1e167] [cursor=pointer]
                    - generic [ref=f1e168]: result
                    - generic [ref=f1e169]: float
                - group "Unused Multiply 5" [ref=f1e170]:
                  - heading "Unused Multiply 5" [level=3] [ref=f1e171]
                  - generic [ref=f1e172]:
                    - button "Unused Multiply 5 input a" [ref=f1e173] [cursor=pointer]
                    - generic [ref=f1e174]: a
                    - generic [ref=f1e175]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e176]: "1"
                  - generic [ref=f1e177]:
                    - button "Unused Multiply 5 input b" [ref=f1e178] [cursor=pointer]
                    - generic [ref=f1e179]: b
                    - generic [ref=f1e180]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e181]: "2"
                  - generic [ref=f1e182]:
                    - button "Unused Multiply 5 output result" [ref=f1e183] [cursor=pointer]
                    - generic [ref=f1e184]: result
                    - generic [ref=f1e185]: float
                - group "Unused Multiply 6" [ref=f1e186]:
                  - heading "Unused Multiply 6" [level=3] [ref=f1e187]
                  - generic [ref=f1e188]:
                    - button "Unused Multiply 6 input a" [ref=f1e189] [cursor=pointer]
                    - generic [ref=f1e190]: a
                    - generic [ref=f1e191]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e192]: "1"
                  - generic [ref=f1e193]:
                    - button "Unused Multiply 6 input b" [ref=f1e194] [cursor=pointer]
                    - generic [ref=f1e195]: b
                    - generic [ref=f1e196]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e197]: "2"
                  - generic [ref=f1e198]:
                    - button "Unused Multiply 6 output result" [ref=f1e199] [cursor=pointer]
                    - generic [ref=f1e200]: result
                    - generic [ref=f1e201]: float
                - group "Unused Multiply 7" [ref=f1e202]:
                  - heading "Unused Multiply 7" [level=3] [ref=f1e203]
                  - generic [ref=f1e204]:
                    - button "Unused Multiply 7 input a" [ref=f1e205] [cursor=pointer]
                    - generic [ref=f1e206]: a
                    - generic [ref=f1e207]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e208]: "1"
                  - generic [ref=f1e209]:
                    - button "Unused Multiply 7 input b" [ref=f1e210] [cursor=pointer]
                    - generic [ref=f1e211]: b
                    - generic [ref=f1e212]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e213]: "2"
                  - generic [ref=f1e214]:
                    - button "Unused Multiply 7 output result" [ref=f1e215] [cursor=pointer]
                    - generic [ref=f1e216]: result
                    - generic [ref=f1e217]: float
                - group "Unused Multiply 8" [ref=f1e218]:
                  - heading "Unused Multiply 8" [level=3] [ref=f1e219]
                  - generic [ref=f1e220]:
                    - button "Unused Multiply 8 input a" [ref=f1e221] [cursor=pointer]
                    - generic [ref=f1e222]: a
                    - generic [ref=f1e223]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e224]: "1"
                  - generic [ref=f1e225]:
                    - button "Unused Multiply 8 input b" [ref=f1e226] [cursor=pointer]
                    - generic [ref=f1e227]: b
                    - generic [ref=f1e228]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e229]: "2"
                  - generic [ref=f1e230]:
                    - button "Unused Multiply 8 output result" [ref=f1e231] [cursor=pointer]
                    - generic [ref=f1e232]: result
                    - generic [ref=f1e233]: float
                - group "Unused Multiply 9" [ref=f1e234]:
                  - heading "Unused Multiply 9" [level=3] [ref=f1e235]
                  - generic [ref=f1e236]:
                    - button "Unused Multiply 9 input a" [ref=f1e237] [cursor=pointer]
                    - generic [ref=f1e238]: a
                    - generic [ref=f1e239]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e240]: "1"
                  - generic [ref=f1e241]:
                    - button "Unused Multiply 9 input b" [ref=f1e242] [cursor=pointer]
                    - generic [ref=f1e243]: b
                    - generic [ref=f1e244]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e245]: "2"
                  - generic [ref=f1e246]:
                    - button "Unused Multiply 9 output result" [ref=f1e247] [cursor=pointer]
                    - generic [ref=f1e248]: result
                    - generic [ref=f1e249]: float
          - generic:
            - button "Untitled shader / pixel" [disabled]
          - generic [ref=f1e250]:
            - button "New subgraph" [ref=f1e251] [cursor=pointer]
            - button "Library subgraph" [ref=f1e252] [cursor=pointer]
            - button "Encapsulate" [ref=f1e253] [cursor=pointer]
            - button "Make independent" [ref=f1e254] [cursor=pointer]
            - button "Enter subgraph" [ref=f1e255] [cursor=pointer]
            - button "Arrange nodes" [ref=f1e256] [cursor=pointer]
            - button "Frame selection" [ref=f1e257] [cursor=pointer]
            - group [ref=f1e258]:
              - generic "Local clipboard" [ref=f1e259] [cursor=pointer]
            - group [ref=f1e260]:
              - generic "Structures" [ref=f1e261] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=f1e262]:
            - button "Vertex" [ref=f1e263] [cursor=pointer]
            - button "Pixel" [pressed] [ref=f1e264] [cursor=pointer]
          - generic [ref=f1e265]:
            - button "Add Node" [ref=f1e266] [cursor=pointer]
            - button "Browse nodes" [ref=f1e269] [cursor=pointer]
            - button "Up" [disabled] [ref=f1e272]
            - button "Shortcuts" [ref=f1e275] [cursor=pointer]
      - complementary [ref=f1e278]:
        - generic [ref=f1e279]:
          - heading "Inspector" [level=2] [ref=f1e280]
          - paragraph [ref=f1e281]: Multiply
          - button "Rename node" [ref=f1e282] [cursor=pointer]
          - generic [ref=f1e283]:
            - generic [ref=f1e285]:
              - generic [ref=f1e286]: A
              - textbox "A" [ref=f1e287]: "1"
              - alert [ref=f1e288]: Connected input — local value retained.
            - generic [ref=f1e290]:
              - generic [ref=f1e291]: B
              - textbox "B" [ref=f1e292]: "2"
              - alert
          - generic [ref=f1e294]:
            - text: From Float
            - button "Disconnect" [ref=f1e295] [cursor=pointer]
    - contentinfo [ref=f1e296]:
      - button "Project actions" [ref=f1e297] [cursor=pointer]
      - status [ref=f1e298]:
        - button "Read full application status" [disabled] [ref=f1e299]
      - button "Shader output" [ref=f1e300] [cursor=pointer]
      - generic [ref=f1e301]:
        - button "Experimental features" [ref=f1e303] [cursor=pointer]
        - button "Read object details" [disabled] [ref=f1e304]
      - button "Hints" [ref=f1e305] [cursor=pointer]
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
  83  |     await app.getByRole("button", { name: "Export JSON", exact: true }).click();
  84  |     return JSON.parse(
  85  |       fs.readFileSync((await (await downloaded).path())!, "utf8"),
  86  |     );
  87  |   };
  88  |   const drag = async (dx: number, dy: number) => {
  89  |     const box = (await title.boundingBox())!;
  90  |     const x = box.x + box.width / 2,
  91  |       y = box.y + box.height / 2;
  92  |     await page.mouse.move(x, y);
  93  |     await page.mouse.down();
  94  |     await page.mouse.move(x + dx, y + dy, { steps: 8 });
  95  |   };
  96  |   await title.click();
  97  |   if (exportFirst) await exportDocument();
  98  |   const initial = await position();
  99  |   await drag(100, 60);
  100 |   await page.mouse.up();
  101 |   const committed = await position();
  102 |   expect(committed).toEqual([initial[0] + 100, initial[1] + 60]);
  103 |   if (exportFirst) await exportDocument();
  104 |   await app.getByRole("button", { name: "Undo", exact: true }).click();
  105 |   expect(await position()).toEqual(initial);
  106 |   if (exportFirst) await exportDocument();
  107 |   await app.getByRole("button", { name: "Redo", exact: true }).click();
  108 |   if (exportFirst) await exportDocument();
  109 |   const beforeEscape = await position();
  110 |   await drag(70, 30);
  111 |   const during = await position();
  112 |   const active = await frame.evaluate(() => ({
  113 |     tag: document.activeElement?.tagName,
  114 |     className: document.activeElement?.className,
  115 |   }));
  116 |   await page.keyboard.press("Escape");
  117 |   const afterEscape = await position();
  118 |   const boxAfterEscape = (await title.boundingBox())!;
  119 |   await page.mouse.move(
  120 |     boxAfterEscape.x + boxAfterEscape.width / 2 + 90,
  121 |     boxAfterEscape.y + boxAfterEscape.height / 2 + 40,
  122 |   );
  123 |   const afterHeldMove = await position();
  124 |   await page.mouse.up();
  125 |   const afterPointerUp = await position();
  126 |   const trace = await frame.evaluate(() => (globalThis as any).__escapeTrace);
  127 |   const result: any = {
  128 |     wrapper,
  129 |     exportFirst,
  130 |     initial,
  131 |     committed,
  132 |     beforeEscape,
  133 |     during,
  134 |     active,
  135 |     afterEscape,
  136 |     afterHeldMove,
  137 |     afterPointerUp,
  138 |     trace,
  139 |     errors,
  140 |   };
  141 |   fs.mkdirSync(path.dirname(output), { recursive: true });
  142 |   fs.writeFileSync(output, JSON.stringify(result, null, 2) + "\n", {
  143 |     flag: "wx",
  144 |   });
  145 |   await page.screenshot({ path: output + ".png", fullPage: true });
  146 |   expect(afterEscape).toEqual(beforeEscape);
  147 |   expect(afterHeldMove).toEqual(beforeEscape);
  148 |   expect(afterPointerUp).toEqual(beforeEscape);
  149 |   expect(
  150 |     trace
  151 |       .filter((e: any) => e.type === "keydown" && e.key === "Escape")
  152 |       .at(-1)
  153 |       .path.some((e: any) => e.className?.split?.(" ").includes("canvas")),
  154 |   ).toBe(true);
  155 |   // Cancel must not insert a History entry: Undo reaches the first drag's start.
  156 |   await app.getByRole("button", { name: "Undo", exact: true }).click();
  157 |   expect(await position()).toEqual(initial);
  158 |   await expect(
  159 |     app.getByRole("button", { name: "Undo", exact: true }),
  160 |   ).toBeDisabled();
  161 |   await app.getByRole("button", { name: "Redo", exact: true }).click();
  162 |   expect(await position()).toEqual(committed);
  163 |   const document = await exportDocument();
  164 |   expect(
  165 |     document.graph.stages
  166 |       .flatMap((s: any) => s.network.nodes)
  167 |       .find((n: any) => n.name === "Multiply").position,
  168 |   ).toEqual(committed);
  169 |   expect(errors).toEqual([]);
  170 |   fs.writeFileSync(
  171 |     output + ".verified.json",
  172 |     JSON.stringify(
  173 |       {
  174 |         status: "PASS",
  175 |         naturalKeyboard: true,
  176 |         noTestRefocus: true,
  177 |         cancelHasNoHistoryEntry: true,
  178 |         document,
  179 |       },
  180 |       null,
  181 |       2,
  182 |     ) + "\n",
```