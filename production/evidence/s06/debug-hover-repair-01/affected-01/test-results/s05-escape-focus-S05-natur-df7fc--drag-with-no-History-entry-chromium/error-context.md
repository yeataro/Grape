# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05-escape-focus.spec.ts >> S05 natural Escape cancels direct without Export drag with no History entry
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
              - generic "Edge 166b3e13-1ebf-4599-8128-0abea80b72c1" [ref=e35]
              - generic "Edge 94c35881-d237-4dc3-b603-22f3b0e01cb3" [ref=e36]
              - generic "Edge a4d59b58-a214-4957-b08f-096fbaf220e2" [ref=e37]
            - generic:
              - group "Image output" [ref=e38]:
                - heading "Image output" [level=3] [ref=e39]
                - generic [ref=e40]:
                  - button "Image output input color" [ref=e41] [cursor=pointer]
                  - generic [ref=e42]: color
                  - generic [ref=e43]: vec4
              - group "Float" [ref=e44]:
                - heading "Float" [level=3] [ref=e45]
                - generic [ref=e46]:
                  - button "Float output value" [ref=e47] [cursor=pointer]
                  - generic [ref=e48]: value
                  - generic [ref=e49]: float
              - group "Multiply" [ref=e50]:
                - heading "Multiply" [level=3] [ref=e51]
                - generic [ref=e52]:
                  - button "Multiply input a" [ref=e53] [cursor=pointer]
                  - generic [ref=e54]: a
                  - generic [ref=e55]: float
                - generic [ref=e56]:
                  - button "Multiply input b" [ref=e57] [cursor=pointer]
                  - generic [ref=e58]: b
                  - generic [ref=e59]: float
                  - generic "Current local value; edit in Inspector" [ref=e60]: "2"
                - generic [ref=e61]:
                  - button "Multiply output result" [ref=e62] [cursor=pointer]
                  - generic [ref=e63]: result
                  - generic [ref=e64]: float
              - group "Compose" [ref=e65]:
                - heading "Compose" [level=3] [ref=e66]
                - generic [ref=e67]:
                  - button "Compose input x" [ref=e68] [cursor=pointer]
                  - generic [ref=e69]: x
                  - generic [ref=e70]: float
                - generic [ref=e71]:
                  - button "Compose input y" [ref=e72] [cursor=pointer]
                  - generic [ref=e73]: "y"
                  - generic [ref=e74]: float
                  - generic "Current local value; edit in Inspector" [ref=e75]: "0"
                - generic [ref=e76]:
                  - button "Compose input z" [ref=e77] [cursor=pointer]
                  - generic [ref=e78]: z
                  - generic [ref=e79]: float
                  - generic "Current local value; edit in Inspector" [ref=e80]: "0"
                - generic [ref=e81]:
                  - button "Compose input w" [ref=e82] [cursor=pointer]
                  - generic [ref=e83]: w
                  - generic [ref=e84]: float
                  - generic "Current local value; edit in Inspector" [ref=e85]: "1"
                - generic [ref=e86]:
                  - button "Compose output result" [ref=e87] [cursor=pointer]
                  - generic [ref=e88]: result
                  - generic [ref=e89]: vec4
              - group "Unused Multiply 0" [ref=e90]:
                - heading "Unused Multiply 0" [level=3] [ref=e91]
                - generic [ref=e92]:
                  - button "Unused Multiply 0 input a" [ref=e93] [cursor=pointer]
                  - generic [ref=e94]: a
                  - generic [ref=e95]: float
                  - generic "Current local value; edit in Inspector" [ref=e96]: "1"
                - generic [ref=e97]:
                  - button "Unused Multiply 0 input b" [ref=e98] [cursor=pointer]
                  - generic [ref=e99]: b
                  - generic [ref=e100]: float
                  - generic "Current local value; edit in Inspector" [ref=e101]: "2"
                - generic [ref=e102]:
                  - button "Unused Multiply 0 output result" [ref=e103] [cursor=pointer]
                  - generic [ref=e104]: result
                  - generic [ref=e105]: float
              - group "Unused Multiply 1" [ref=e106]:
                - heading "Unused Multiply 1" [level=3] [ref=e107]
                - generic [ref=e108]:
                  - button "Unused Multiply 1 input a" [ref=e109] [cursor=pointer]
                  - generic [ref=e110]: a
                  - generic [ref=e111]: float
                  - generic "Current local value; edit in Inspector" [ref=e112]: "1"
                - generic [ref=e113]:
                  - button "Unused Multiply 1 input b" [ref=e114] [cursor=pointer]
                  - generic [ref=e115]: b
                  - generic [ref=e116]: float
                  - generic "Current local value; edit in Inspector" [ref=e117]: "2"
                - generic [ref=e118]:
                  - button "Unused Multiply 1 output result" [ref=e119] [cursor=pointer]
                  - generic [ref=e120]: result
                  - generic [ref=e121]: float
              - group "Unused Multiply 2" [ref=e122]:
                - heading "Unused Multiply 2" [level=3] [ref=e123]
                - generic [ref=e124]:
                  - button "Unused Multiply 2 input a" [ref=e125] [cursor=pointer]
                  - generic [ref=e126]: a
                  - generic [ref=e127]: float
                  - generic "Current local value; edit in Inspector" [ref=e128]: "1"
                - generic [ref=e129]:
                  - button "Unused Multiply 2 input b" [ref=e130] [cursor=pointer]
                  - generic [ref=e131]: b
                  - generic [ref=e132]: float
                  - generic "Current local value; edit in Inspector" [ref=e133]: "2"
                - generic [ref=e134]:
                  - button "Unused Multiply 2 output result" [ref=e135] [cursor=pointer]
                  - generic [ref=e136]: result
                  - generic [ref=e137]: float
              - group "Unused Multiply 3" [ref=e138]:
                - heading "Unused Multiply 3" [level=3] [ref=e139]
                - generic [ref=e140]:
                  - button "Unused Multiply 3 input a" [ref=e141] [cursor=pointer]
                  - generic [ref=e142]: a
                  - generic [ref=e143]: float
                  - generic "Current local value; edit in Inspector" [ref=e144]: "1"
                - generic [ref=e145]:
                  - button "Unused Multiply 3 input b" [ref=e146] [cursor=pointer]
                  - generic [ref=e147]: b
                  - generic [ref=e148]: float
                  - generic "Current local value; edit in Inspector" [ref=e149]: "2"
                - generic [ref=e150]:
                  - button "Unused Multiply 3 output result" [ref=e151] [cursor=pointer]
                  - generic [ref=e152]: result
                  - generic [ref=e153]: float
              - group "Unused Multiply 4" [ref=e154]:
                - heading "Unused Multiply 4" [level=3] [ref=e155]
                - generic [ref=e156]:
                  - button "Unused Multiply 4 input a" [ref=e157] [cursor=pointer]
                  - generic [ref=e158]: a
                  - generic [ref=e159]: float
                  - generic "Current local value; edit in Inspector" [ref=e160]: "1"
                - generic [ref=e161]:
                  - button "Unused Multiply 4 input b" [ref=e162] [cursor=pointer]
                  - generic [ref=e163]: b
                  - generic [ref=e164]: float
                  - generic "Current local value; edit in Inspector" [ref=e165]: "2"
                - generic [ref=e166]:
                  - button "Unused Multiply 4 output result" [ref=e167] [cursor=pointer]
                  - generic [ref=e168]: result
                  - generic [ref=e169]: float
              - group "Unused Multiply 5" [ref=e170]:
                - heading "Unused Multiply 5" [level=3] [ref=e171]
                - generic [ref=e172]:
                  - button "Unused Multiply 5 input a" [ref=e173] [cursor=pointer]
                  - generic [ref=e174]: a
                  - generic [ref=e175]: float
                  - generic "Current local value; edit in Inspector" [ref=e176]: "1"
                - generic [ref=e177]:
                  - button "Unused Multiply 5 input b" [ref=e178] [cursor=pointer]
                  - generic [ref=e179]: b
                  - generic [ref=e180]: float
                  - generic "Current local value; edit in Inspector" [ref=e181]: "2"
                - generic [ref=e182]:
                  - button "Unused Multiply 5 output result" [ref=e183] [cursor=pointer]
                  - generic [ref=e184]: result
                  - generic [ref=e185]: float
              - group "Unused Multiply 6" [ref=e186]:
                - heading "Unused Multiply 6" [level=3] [ref=e187]
                - generic [ref=e188]:
                  - button "Unused Multiply 6 input a" [ref=e189] [cursor=pointer]
                  - generic [ref=e190]: a
                  - generic [ref=e191]: float
                  - generic "Current local value; edit in Inspector" [ref=e192]: "1"
                - generic [ref=e193]:
                  - button "Unused Multiply 6 input b" [ref=e194] [cursor=pointer]
                  - generic [ref=e195]: b
                  - generic [ref=e196]: float
                  - generic "Current local value; edit in Inspector" [ref=e197]: "2"
                - generic [ref=e198]:
                  - button "Unused Multiply 6 output result" [ref=e199] [cursor=pointer]
                  - generic [ref=e200]: result
                  - generic [ref=e201]: float
              - group "Unused Multiply 7" [ref=e202]:
                - heading "Unused Multiply 7" [level=3] [ref=e203]
                - generic [ref=e204]:
                  - button "Unused Multiply 7 input a" [ref=e205] [cursor=pointer]
                  - generic [ref=e206]: a
                  - generic [ref=e207]: float
                  - generic "Current local value; edit in Inspector" [ref=e208]: "1"
                - generic [ref=e209]:
                  - button "Unused Multiply 7 input b" [ref=e210] [cursor=pointer]
                  - generic [ref=e211]: b
                  - generic [ref=e212]: float
                  - generic "Current local value; edit in Inspector" [ref=e213]: "2"
                - generic [ref=e214]:
                  - button "Unused Multiply 7 output result" [ref=e215] [cursor=pointer]
                  - generic [ref=e216]: result
                  - generic [ref=e217]: float
              - group "Unused Multiply 8" [ref=e218]:
                - heading "Unused Multiply 8" [level=3] [ref=e219]
                - generic [ref=e220]:
                  - button "Unused Multiply 8 input a" [ref=e221] [cursor=pointer]
                  - generic [ref=e222]: a
                  - generic [ref=e223]: float
                  - generic "Current local value; edit in Inspector" [ref=e224]: "1"
                - generic [ref=e225]:
                  - button "Unused Multiply 8 input b" [ref=e226] [cursor=pointer]
                  - generic [ref=e227]: b
                  - generic [ref=e228]: float
                  - generic "Current local value; edit in Inspector" [ref=e229]: "2"
                - generic [ref=e230]:
                  - button "Unused Multiply 8 output result" [ref=e231] [cursor=pointer]
                  - generic [ref=e232]: result
                  - generic [ref=e233]: float
              - group "Unused Multiply 9" [ref=e234]:
                - heading "Unused Multiply 9" [level=3] [ref=e235]
                - generic [ref=e236]:
                  - button "Unused Multiply 9 input a" [ref=e237] [cursor=pointer]
                  - generic [ref=e238]: a
                  - generic [ref=e239]: float
                  - generic "Current local value; edit in Inspector" [ref=e240]: "1"
                - generic [ref=e241]:
                  - button "Unused Multiply 9 input b" [ref=e242] [cursor=pointer]
                  - generic [ref=e243]: b
                  - generic [ref=e244]: float
                  - generic "Current local value; edit in Inspector" [ref=e245]: "2"
                - generic [ref=e246]:
                  - button "Unused Multiply 9 output result" [ref=e247] [cursor=pointer]
                  - generic [ref=e248]: result
                  - generic [ref=e249]: float
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e250]:
          - button "New subgraph" [ref=e251] [cursor=pointer]
          - button "Library subgraph" [ref=e252] [cursor=pointer]
          - button "Encapsulate" [ref=e253] [cursor=pointer]
          - button "Make independent" [ref=e254] [cursor=pointer]
          - button "Enter subgraph" [ref=e255] [cursor=pointer]
          - button "Arrange nodes" [ref=e256] [cursor=pointer]
          - button "Frame selection" [ref=e257] [cursor=pointer]
          - group [ref=e258]:
            - generic "Local clipboard" [ref=e259] [cursor=pointer]
          - group [ref=e260]:
            - generic "Structures" [ref=e261] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e262]:
          - button "Vertex" [ref=e263] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e264] [cursor=pointer]
        - generic [ref=e265]:
          - button "Add Node" [ref=e266] [cursor=pointer]
          - button "Browse nodes" [ref=e269] [cursor=pointer]
          - button "Up" [disabled] [ref=e272]
          - button "Shortcuts" [ref=e275] [cursor=pointer]
    - complementary [ref=e278]:
      - generic [ref=e279]:
        - heading "Inspector" [level=2] [ref=e280]
        - paragraph [ref=e281]: Multiply
        - button "Rename node" [ref=e282] [cursor=pointer]
        - generic [ref=e283]:
          - generic [ref=e285]:
            - generic [ref=e286]: A
            - textbox "A" [ref=e287]: "1"
            - alert [ref=e288]: Connected input — local value retained.
          - generic [ref=e290]:
            - generic [ref=e291]: B
            - textbox "B" [ref=e292]: "2"
            - alert
        - generic [ref=e294]:
          - text: From Float
          - button "Disconnect" [ref=e295] [cursor=pointer]
  - contentinfo [ref=e296]:
    - button "Project actions" [ref=e297] [cursor=pointer]
    - status [ref=e298]:
      - button "Read full application status" [disabled] [ref=e299]
    - button "Shader output" [ref=e300] [cursor=pointer]
    - generic [ref=e301]:
      - button "Experimental features" [ref=e303] [cursor=pointer]
      - button "Read object details" [disabled] [ref=e304]
    - button "Hints" [ref=e305] [cursor=pointer]
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