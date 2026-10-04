# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05-escape-focus.spec.ts >> S05 natural Escape cancels wrapper without Export drag with no History entry
- Location: tests\browser\s05-escape-focus.spec.ts:8:5

# Error details

```
TypeError: Cannot read properties of undefined (reading 'evaluate')
```

# Page snapshot

```yaml
- iframe [active] [ref=e1]:
  - generic [ref=f1e2]:
    - banner [ref=f1e3]:
      - generic [ref=f1e4]:
        - text: Grape
        - generic [ref=f1e9]: SHADER WORKSPACE
      - navigation "Document actions" [ref=f1e10]:
        - generic [ref=f1e11]:
          - button "New document" [ref=f1e12] [cursor=pointer]
          - button "Save" [ref=f1e15] [cursor=pointer]
          - button "Open saved" [ref=f1e18] [cursor=pointer]
          - button "Export JSON" [ref=f1e21] [cursor=pointer]
          - button "Export PNG" [ref=f1e24] [cursor=pointer]
          - button "Open file" [ref=f1e27] [cursor=pointer]
        - generic [ref=f1e30]:
          - button "Generate GLSL" [ref=f1e31] [cursor=pointer]
          - button "Second Canvas" [ref=f1e34] [cursor=pointer]
          - button "Lock editing" [ref=f1e37] [cursor=pointer]
        - group [ref=f1e40]:
          - generic "More actions" [ref=f1e41] [cursor=pointer]
      - generic [ref=f1e43]:
        - generic [ref=f1e44]: Unsaved changes
        - generic [ref=f1e45]: Host-free
    - status [ref=f1e46]
    - generic [ref=f1e48]:
      - button "Undo" [disabled] [ref=f1e49]
      - button "Redo" [disabled] [ref=f1e52]
      - button "Delete selected" [ref=f1e55] [cursor=pointer]
      - alert
    - main [ref=f1e56]:
      - generic [ref=f1e58]:
        - generic: Canvas 1
        - generic "Shader graph canvas" [ref=f1e59]:
          - generic:
            - generic:
              - group "Image output" [ref=f1e63]:
                - heading "Image output" [level=3] [ref=f1e64]
                - generic [ref=f1e65]:
                  - button "Image output input color" [ref=f1e66] [cursor=pointer]:
                    - generic [ref=f1e68]: color
                  - generic [ref=f1e69]: vec4
              - group "Float" [ref=f1e70]:
                - heading "Float" [level=3] [ref=f1e71]
                - generic [ref=f1e72]:
                  - button "Float output value" [ref=f1e73] [cursor=pointer]:
                    - generic [ref=f1e74]: value
                  - generic [ref=f1e76]: float
              - group "Multiply" [ref=f1e77]:
                - heading "Multiply" [level=3] [ref=f1e78]
                - generic [ref=f1e79]:
                  - button "Multiply input a" [ref=f1e80] [cursor=pointer]:
                    - generic [ref=f1e82]: a
                  - generic [ref=f1e83]: float
                - generic [ref=f1e84]:
                  - button "Multiply input b" [ref=f1e85] [cursor=pointer]:
                    - generic [ref=f1e87]: b
                  - generic [ref=f1e88]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e89]: "2"
                - generic [ref=f1e90]:
                  - button "Multiply output result" [ref=f1e91] [cursor=pointer]:
                    - generic [ref=f1e92]: result
                  - generic [ref=f1e94]: float
              - group "Compose" [ref=f1e95]:
                - heading "Compose" [level=3] [ref=f1e96]
                - generic [ref=f1e97]:
                  - button "Compose input x" [ref=f1e98] [cursor=pointer]:
                    - generic [ref=f1e100]: x
                  - generic [ref=f1e101]: float
                - generic [ref=f1e102]:
                  - button "Compose input y" [ref=f1e103] [cursor=pointer]:
                    - generic [ref=f1e105]: "y"
                  - generic [ref=f1e106]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e107]: "0"
                - generic [ref=f1e108]:
                  - button "Compose input z" [ref=f1e109] [cursor=pointer]:
                    - generic [ref=f1e111]: z
                  - generic [ref=f1e112]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e113]: "0"
                - generic [ref=f1e114]:
                  - button "Compose input w" [ref=f1e115] [cursor=pointer]:
                    - generic [ref=f1e117]: w
                  - generic [ref=f1e118]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e119]: "1"
                - generic [ref=f1e120]:
                  - button "Compose output result" [ref=f1e121] [cursor=pointer]:
                    - generic [ref=f1e122]: result
                  - generic [ref=f1e124]: vec4
              - group "Unused Multiply 0" [ref=f1e125]:
                - heading "Unused Multiply 0" [level=3] [ref=f1e126]
                - generic [ref=f1e127]:
                  - button "Unused Multiply 0 input a" [ref=f1e128] [cursor=pointer]:
                    - generic [ref=f1e130]: a
                  - generic [ref=f1e131]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e132]: "1"
                - generic [ref=f1e133]:
                  - button "Unused Multiply 0 input b" [ref=f1e134] [cursor=pointer]:
                    - generic [ref=f1e136]: b
                  - generic [ref=f1e137]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e138]: "2"
                - generic [ref=f1e139]:
                  - button "Unused Multiply 0 output result" [ref=f1e140] [cursor=pointer]:
                    - generic [ref=f1e141]: result
                  - generic [ref=f1e143]: float
              - group "Unused Multiply 1" [ref=f1e144]:
                - heading "Unused Multiply 1" [level=3] [ref=f1e145]
                - generic [ref=f1e146]:
                  - button "Unused Multiply 1 input a" [ref=f1e147] [cursor=pointer]:
                    - generic [ref=f1e149]: a
                  - generic [ref=f1e150]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e151]: "1"
                - generic [ref=f1e152]:
                  - button "Unused Multiply 1 input b" [ref=f1e153] [cursor=pointer]:
                    - generic [ref=f1e155]: b
                  - generic [ref=f1e156]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e157]: "2"
                - generic [ref=f1e158]:
                  - button "Unused Multiply 1 output result" [ref=f1e159] [cursor=pointer]:
                    - generic [ref=f1e160]: result
                  - generic [ref=f1e162]: float
              - group "Unused Multiply 2" [ref=f1e163]:
                - heading "Unused Multiply 2" [level=3] [ref=f1e164]
                - generic [ref=f1e165]:
                  - button "Unused Multiply 2 input a" [ref=f1e166] [cursor=pointer]:
                    - generic [ref=f1e168]: a
                  - generic [ref=f1e169]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e170]: "1"
                - generic [ref=f1e171]:
                  - button "Unused Multiply 2 input b" [ref=f1e172] [cursor=pointer]:
                    - generic [ref=f1e174]: b
                  - generic [ref=f1e175]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e176]: "2"
                - generic [ref=f1e177]:
                  - button "Unused Multiply 2 output result" [ref=f1e178] [cursor=pointer]:
                    - generic [ref=f1e179]: result
                  - generic [ref=f1e181]: float
              - group "Unused Multiply 3" [ref=f1e182]:
                - heading "Unused Multiply 3" [level=3] [ref=f1e183]
                - generic [ref=f1e184]:
                  - button "Unused Multiply 3 input a" [ref=f1e185] [cursor=pointer]:
                    - generic [ref=f1e187]: a
                  - generic [ref=f1e188]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e189]: "1"
                - generic [ref=f1e190]:
                  - button "Unused Multiply 3 input b" [ref=f1e191] [cursor=pointer]:
                    - generic [ref=f1e193]: b
                  - generic [ref=f1e194]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e195]: "2"
                - generic [ref=f1e196]:
                  - button "Unused Multiply 3 output result" [ref=f1e197] [cursor=pointer]:
                    - generic [ref=f1e198]: result
                  - generic [ref=f1e200]: float
              - group "Unused Multiply 4" [ref=f1e201]:
                - heading "Unused Multiply 4" [level=3] [ref=f1e202]
                - generic [ref=f1e203]:
                  - button "Unused Multiply 4 input a" [ref=f1e204] [cursor=pointer]:
                    - generic [ref=f1e206]: a
                  - generic [ref=f1e207]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e208]: "1"
                - generic [ref=f1e209]:
                  - button "Unused Multiply 4 input b" [ref=f1e210] [cursor=pointer]:
                    - generic [ref=f1e212]: b
                  - generic [ref=f1e213]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e214]: "2"
                - generic [ref=f1e215]:
                  - button "Unused Multiply 4 output result" [ref=f1e216] [cursor=pointer]:
                    - generic [ref=f1e217]: result
                  - generic [ref=f1e219]: float
              - group "Unused Multiply 5" [ref=f1e220]:
                - heading "Unused Multiply 5" [level=3] [ref=f1e221]
                - generic [ref=f1e222]:
                  - button "Unused Multiply 5 input a" [ref=f1e223] [cursor=pointer]:
                    - generic [ref=f1e225]: a
                  - generic [ref=f1e226]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e227]: "1"
                - generic [ref=f1e228]:
                  - button "Unused Multiply 5 input b" [ref=f1e229] [cursor=pointer]:
                    - generic [ref=f1e231]: b
                  - generic [ref=f1e232]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e233]: "2"
                - generic [ref=f1e234]:
                  - button "Unused Multiply 5 output result" [ref=f1e235] [cursor=pointer]:
                    - generic [ref=f1e236]: result
                  - generic [ref=f1e238]: float
              - group "Unused Multiply 6" [ref=f1e239]:
                - heading "Unused Multiply 6" [level=3] [ref=f1e240]
                - generic [ref=f1e241]:
                  - button "Unused Multiply 6 input a" [ref=f1e242] [cursor=pointer]:
                    - generic [ref=f1e244]: a
                  - generic [ref=f1e245]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e246]: "1"
                - generic [ref=f1e247]:
                  - button "Unused Multiply 6 input b" [ref=f1e248] [cursor=pointer]:
                    - generic [ref=f1e250]: b
                  - generic [ref=f1e251]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e252]: "2"
                - generic [ref=f1e253]:
                  - button "Unused Multiply 6 output result" [ref=f1e254] [cursor=pointer]:
                    - generic [ref=f1e255]: result
                  - generic [ref=f1e257]: float
              - group "Unused Multiply 7" [ref=f1e258]:
                - heading "Unused Multiply 7" [level=3] [ref=f1e259]
                - generic [ref=f1e260]:
                  - button "Unused Multiply 7 input a" [ref=f1e261] [cursor=pointer]:
                    - generic [ref=f1e263]: a
                  - generic [ref=f1e264]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e265]: "1"
                - generic [ref=f1e266]:
                  - button "Unused Multiply 7 input b" [ref=f1e267] [cursor=pointer]:
                    - generic [ref=f1e269]: b
                  - generic [ref=f1e270]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e271]: "2"
                - generic [ref=f1e272]:
                  - button "Unused Multiply 7 output result" [ref=f1e273] [cursor=pointer]:
                    - generic [ref=f1e274]: result
                  - generic [ref=f1e276]: float
              - group "Unused Multiply 8" [ref=f1e277]:
                - heading "Unused Multiply 8" [level=3] [ref=f1e278]
                - generic [ref=f1e279]:
                  - button "Unused Multiply 8 input a" [ref=f1e280] [cursor=pointer]:
                    - generic [ref=f1e282]: a
                  - generic [ref=f1e283]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e284]: "1"
                - generic [ref=f1e285]:
                  - button "Unused Multiply 8 input b" [ref=f1e286] [cursor=pointer]:
                    - generic [ref=f1e288]: b
                  - generic [ref=f1e289]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e290]: "2"
                - generic [ref=f1e291]:
                  - button "Unused Multiply 8 output result" [ref=f1e292] [cursor=pointer]:
                    - generic [ref=f1e293]: result
                  - generic [ref=f1e295]: float
              - group "Unused Multiply 9" [ref=f1e296]:
                - heading "Unused Multiply 9" [level=3] [ref=f1e297]
                - generic [ref=f1e298]:
                  - button "Unused Multiply 9 input a" [ref=f1e299] [cursor=pointer]:
                    - generic [ref=f1e301]: a
                  - generic [ref=f1e302]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e303]: "1"
                - generic [ref=f1e304]:
                  - button "Unused Multiply 9 input b" [ref=f1e305] [cursor=pointer]:
                    - generic [ref=f1e307]: b
                  - generic [ref=f1e308]: float
                  - generic "Current local value; edit in Inspector" [ref=f1e309]: "2"
                - generic [ref=f1e310]:
                  - button "Unused Multiply 9 output result" [ref=f1e311] [cursor=pointer]:
                    - generic [ref=f1e312]: result
                  - generic [ref=f1e314]: float
          - generic:
            - button "Untitled shader / pixel" [disabled]
          - generic [ref=f1e315]:
            - button "New subgraph" [ref=f1e316] [cursor=pointer]
            - button "Library subgraph" [ref=f1e317] [cursor=pointer]
            - button "Encapsulate" [ref=f1e318] [cursor=pointer]
            - button "Make independent" [ref=f1e319] [cursor=pointer]
            - button "Enter subgraph" [ref=f1e320] [cursor=pointer]
            - button "Arrange nodes" [ref=f1e321] [cursor=pointer]
            - button "Frame selection" [ref=f1e322] [cursor=pointer]
            - group [ref=f1e323]:
              - generic "Local clipboard" [ref=f1e324] [cursor=pointer]
            - group [ref=f1e325]:
              - generic "Structures" [ref=f1e326] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=f1e327]:
            - button "Vertex" [ref=f1e328] [cursor=pointer]
            - button "Pixel" [pressed] [ref=f1e329] [cursor=pointer]
          - generic [ref=f1e330]:
            - button "Add Node" [ref=f1e331] [cursor=pointer]
            - button "Browse nodes" [ref=f1e334] [cursor=pointer]
            - button "Up" [disabled] [ref=f1e337]
            - button "Shortcuts" [ref=f1e340] [cursor=pointer]
      - complementary [ref=f1e343]:
        - generic [ref=f1e344]:
          - heading "Inspector" [level=2] [ref=f1e345]
          - paragraph [ref=f1e346]: Select a node to inspect its parameters.
    - generic [ref=f1e348]:
      - heading "Shader output" [level=2] [ref=f1e349]
      - paragraph [ref=f1e350]: Generate to inspect shader output.
      - generic "Generated GLSL"
      - list "Diagnostics"
    - contentinfo [ref=f1e351]:
      - generic [ref=f1e352]: Click an output port, then an input to connect. Shift-click replaces a connection.
      - generic [ref=f1e353]: Scroll to zoom · Drag empty space to pan
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
> 41  |   await frame.evaluate(() => {
      |               ^ TypeError: Cannot read properties of undefined (reading 'evaluate')
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
  82  |     const downloaded = page.waitForEvent("download");
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
```