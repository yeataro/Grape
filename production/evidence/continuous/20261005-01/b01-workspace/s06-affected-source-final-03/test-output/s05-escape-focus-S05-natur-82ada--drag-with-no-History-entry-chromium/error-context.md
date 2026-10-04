# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05-escape-focus.spec.ts >> S05 natural Escape cancels wrapper without Export drag with no History entry
- Location: ..\..\..\..\..\tests\browser\s05-escape-focus.spec.ts:8:5

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 2
+ Received  + 2

  Array [
-   420,
-   160,
+   490,
+   190,
  ]
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
        - tablist "canvas-1 panels" [ref=f1e34]:
          - tab "Canvas · canvas-1" [selected] [ref=f1e35] [cursor=pointer]
          - generic [ref=f1e36]:
            - button "Collapse active panel in canvas-1" [ref=f1e37] [cursor=pointer]: ▾
            - button "Panel options in canvas-1" [ref=f1e38] [cursor=pointer]: ⋯
        - generic "Shader graph canvas" [ref=f1e41]:
          - generic:
            - generic:
              - img:
                - generic "Edge 166b3e13-1ebf-4599-8128-0abea80b72c1" [ref=f1e42]
                - generic "Edge 94c35881-d237-4dc3-b603-22f3b0e01cb3" [ref=f1e43]
                - generic "Edge a4d59b58-a214-4957-b08f-096fbaf220e2" [ref=f1e44]
              - generic:
                - group "Image output" [ref=f1e45]:
                  - heading "Image output" [level=3] [ref=f1e46]
                  - generic [ref=f1e47]:
                    - button "Image output input color" [ref=f1e48] [cursor=pointer]
                    - generic [ref=f1e49]: color
                    - generic [ref=f1e50]: vec4
                - group "Float" [ref=f1e51]:
                  - heading "Float" [level=3] [ref=f1e52]
                  - generic [ref=f1e53]:
                    - button "Float output value" [ref=f1e54] [cursor=pointer]
                    - generic [ref=f1e55]: value
                    - generic [ref=f1e56]: float
                - group "Multiply" [ref=f1e57]:
                  - heading "Multiply" [level=3] [ref=f1e58]
                  - generic [ref=f1e59]:
                    - button "Multiply input a" [ref=f1e60] [cursor=pointer]
                    - generic [ref=f1e61]: a
                    - generic [ref=f1e62]: float
                  - generic [ref=f1e63]:
                    - button "Multiply input b" [ref=f1e64] [cursor=pointer]
                    - generic [ref=f1e65]: b
                    - generic [ref=f1e66]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e67]: "2"
                  - generic [ref=f1e68]:
                    - button "Multiply output result" [ref=f1e69] [cursor=pointer]
                    - generic [ref=f1e70]: result
                    - generic [ref=f1e71]: float
                - group "Compose" [ref=f1e72]:
                  - heading "Compose" [level=3] [ref=f1e73]
                  - generic [ref=f1e74]:
                    - button "Compose input x" [ref=f1e75] [cursor=pointer]
                    - generic [ref=f1e76]: x
                    - generic [ref=f1e77]: float
                  - generic [ref=f1e78]:
                    - button "Compose input y" [ref=f1e79] [cursor=pointer]
                    - generic [ref=f1e80]: "y"
                    - generic [ref=f1e81]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e82]: "0"
                  - generic [ref=f1e83]:
                    - button "Compose input z" [ref=f1e84] [cursor=pointer]
                    - generic [ref=f1e85]: z
                    - generic [ref=f1e86]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e87]: "0"
                  - generic [ref=f1e88]:
                    - button "Compose input w" [ref=f1e89] [cursor=pointer]
                    - generic [ref=f1e90]: w
                    - generic [ref=f1e91]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e92]: "1"
                  - generic [ref=f1e93]:
                    - button "Compose output result" [ref=f1e94] [cursor=pointer]
                    - generic [ref=f1e95]: result
                    - generic [ref=f1e96]: vec4
                - group "Unused Multiply 0" [ref=f1e97]:
                  - heading "Unused Multiply 0" [level=3] [ref=f1e98]
                  - generic [ref=f1e99]:
                    - button "Unused Multiply 0 input a" [ref=f1e100] [cursor=pointer]
                    - generic [ref=f1e101]: a
                    - generic [ref=f1e102]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e103]: "1"
                  - generic [ref=f1e104]:
                    - button "Unused Multiply 0 input b" [ref=f1e105] [cursor=pointer]
                    - generic [ref=f1e106]: b
                    - generic [ref=f1e107]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e108]: "2"
                  - generic [ref=f1e109]:
                    - button "Unused Multiply 0 output result" [ref=f1e110] [cursor=pointer]
                    - generic [ref=f1e111]: result
                    - generic [ref=f1e112]: float
                - group "Unused Multiply 1" [ref=f1e113]:
                  - heading "Unused Multiply 1" [level=3] [ref=f1e114]
                  - generic [ref=f1e115]:
                    - button "Unused Multiply 1 input a" [ref=f1e116] [cursor=pointer]
                    - generic [ref=f1e117]: a
                    - generic [ref=f1e118]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e119]: "1"
                  - generic [ref=f1e120]:
                    - button "Unused Multiply 1 input b" [ref=f1e121] [cursor=pointer]
                    - generic [ref=f1e122]: b
                    - generic [ref=f1e123]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e124]: "2"
                  - generic [ref=f1e125]:
                    - button "Unused Multiply 1 output result" [ref=f1e126] [cursor=pointer]
                    - generic [ref=f1e127]: result
                    - generic [ref=f1e128]: float
                - group "Unused Multiply 2" [ref=f1e129]:
                  - heading "Unused Multiply 2" [level=3] [ref=f1e130]
                  - generic [ref=f1e131]:
                    - button "Unused Multiply 2 input a" [ref=f1e132] [cursor=pointer]
                    - generic [ref=f1e133]: a
                    - generic [ref=f1e134]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e135]: "1"
                  - generic [ref=f1e136]:
                    - button "Unused Multiply 2 input b" [ref=f1e137] [cursor=pointer]
                    - generic [ref=f1e138]: b
                    - generic [ref=f1e139]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e140]: "2"
                  - generic [ref=f1e141]:
                    - button "Unused Multiply 2 output result" [ref=f1e142] [cursor=pointer]
                    - generic [ref=f1e143]: result
                    - generic [ref=f1e144]: float
                - group "Unused Multiply 3" [ref=f1e145]:
                  - heading "Unused Multiply 3" [level=3] [ref=f1e146]
                  - generic [ref=f1e147]:
                    - button "Unused Multiply 3 input a" [ref=f1e148] [cursor=pointer]
                    - generic [ref=f1e149]: a
                    - generic [ref=f1e150]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e151]: "1"
                  - generic [ref=f1e152]:
                    - button "Unused Multiply 3 input b" [ref=f1e153] [cursor=pointer]
                    - generic [ref=f1e154]: b
                    - generic [ref=f1e155]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e156]: "2"
                  - generic [ref=f1e157]:
                    - button "Unused Multiply 3 output result" [ref=f1e158] [cursor=pointer]
                    - generic [ref=f1e159]: result
                    - generic [ref=f1e160]: float
                - group "Unused Multiply 4" [ref=f1e161]:
                  - heading "Unused Multiply 4" [level=3] [ref=f1e162]
                  - generic [ref=f1e163]:
                    - button "Unused Multiply 4 input a" [ref=f1e164] [cursor=pointer]
                    - generic [ref=f1e165]: a
                    - generic [ref=f1e166]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e167]: "1"
                  - generic [ref=f1e168]:
                    - button "Unused Multiply 4 input b" [ref=f1e169] [cursor=pointer]
                    - generic [ref=f1e170]: b
                    - generic [ref=f1e171]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e172]: "2"
                  - generic [ref=f1e173]:
                    - button "Unused Multiply 4 output result" [ref=f1e174] [cursor=pointer]
                    - generic [ref=f1e175]: result
                    - generic [ref=f1e176]: float
                - group "Unused Multiply 5" [ref=f1e177]:
                  - heading "Unused Multiply 5" [level=3] [ref=f1e178]
                  - generic [ref=f1e179]:
                    - button "Unused Multiply 5 input a" [ref=f1e180] [cursor=pointer]
                    - generic [ref=f1e181]: a
                    - generic [ref=f1e182]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e183]: "1"
                  - generic [ref=f1e184]:
                    - button "Unused Multiply 5 input b" [ref=f1e185] [cursor=pointer]
                    - generic [ref=f1e186]: b
                    - generic [ref=f1e187]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e188]: "2"
                  - generic [ref=f1e189]:
                    - button "Unused Multiply 5 output result" [ref=f1e190] [cursor=pointer]
                    - generic [ref=f1e191]: result
                    - generic [ref=f1e192]: float
                - group "Unused Multiply 6" [ref=f1e193]:
                  - heading "Unused Multiply 6" [level=3] [ref=f1e194]
                  - generic [ref=f1e195]:
                    - button "Unused Multiply 6 input a" [ref=f1e196] [cursor=pointer]
                    - generic [ref=f1e197]: a
                    - generic [ref=f1e198]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e199]: "1"
                  - generic [ref=f1e200]:
                    - button "Unused Multiply 6 input b" [ref=f1e201] [cursor=pointer]
                    - generic [ref=f1e202]: b
                    - generic [ref=f1e203]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e204]: "2"
                  - generic [ref=f1e205]:
                    - button "Unused Multiply 6 output result" [ref=f1e206] [cursor=pointer]
                    - generic [ref=f1e207]: result
                    - generic [ref=f1e208]: float
                - group "Unused Multiply 7" [ref=f1e209]:
                  - heading "Unused Multiply 7" [level=3] [ref=f1e210]
                  - generic [ref=f1e211]:
                    - button "Unused Multiply 7 input a" [ref=f1e212] [cursor=pointer]
                    - generic [ref=f1e213]: a
                    - generic [ref=f1e214]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e215]: "1"
                  - generic [ref=f1e216]:
                    - button "Unused Multiply 7 input b" [ref=f1e217] [cursor=pointer]
                    - generic [ref=f1e218]: b
                    - generic [ref=f1e219]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e220]: "2"
                  - generic [ref=f1e221]:
                    - button "Unused Multiply 7 output result" [ref=f1e222] [cursor=pointer]
                    - generic [ref=f1e223]: result
                    - generic [ref=f1e224]: float
                - group "Unused Multiply 8" [ref=f1e225]:
                  - heading "Unused Multiply 8" [level=3] [ref=f1e226]
                  - generic [ref=f1e227]:
                    - button "Unused Multiply 8 input a" [ref=f1e228] [cursor=pointer]
                    - generic [ref=f1e229]: a
                    - generic [ref=f1e230]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e231]: "1"
                  - generic [ref=f1e232]:
                    - button "Unused Multiply 8 input b" [ref=f1e233] [cursor=pointer]
                    - generic [ref=f1e234]: b
                    - generic [ref=f1e235]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e236]: "2"
                  - generic [ref=f1e237]:
                    - button "Unused Multiply 8 output result" [ref=f1e238] [cursor=pointer]
                    - generic [ref=f1e239]: result
                    - generic [ref=f1e240]: float
                - group "Unused Multiply 9" [ref=f1e241]:
                  - heading "Unused Multiply 9" [level=3] [ref=f1e242]
                  - generic [ref=f1e243]:
                    - button "Unused Multiply 9 input a" [ref=f1e244] [cursor=pointer]
                    - generic [ref=f1e245]: a
                    - generic [ref=f1e246]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e247]: "1"
                  - generic [ref=f1e248]:
                    - button "Unused Multiply 9 input b" [ref=f1e249] [cursor=pointer]
                    - generic [ref=f1e250]: b
                    - generic [ref=f1e251]: float
                    - generic "Current local value; edit in Inspector" [ref=f1e252]: "2"
                  - generic [ref=f1e253]:
                    - button "Unused Multiply 9 output result" [ref=f1e254] [cursor=pointer]
                    - generic [ref=f1e255]: result
                    - generic [ref=f1e256]: float
          - generic:
            - button "Untitled shader / pixel" [disabled]
          - generic [ref=f1e257]:
            - button "New subgraph" [ref=f1e258] [cursor=pointer]
            - button "Library subgraph" [ref=f1e259] [cursor=pointer]
            - button "Encapsulate" [ref=f1e260] [cursor=pointer]
            - button "Make independent" [ref=f1e261] [cursor=pointer]
            - button "Enter subgraph" [ref=f1e262] [cursor=pointer]
            - button "Arrange nodes" [ref=f1e263] [cursor=pointer]
            - button "Frame selection" [ref=f1e264] [cursor=pointer]
            - group [ref=f1e265]:
              - generic "Local clipboard" [ref=f1e266] [cursor=pointer]
            - group [ref=f1e267]:
              - generic "Structures" [ref=f1e268] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=f1e269]:
            - button "Vertex" [ref=f1e270] [cursor=pointer]
            - button "Pixel" [pressed] [ref=f1e271] [cursor=pointer]
          - generic [ref=f1e272]:
            - button "Add Node" [ref=f1e273] [cursor=pointer]
            - button "Browse nodes" [ref=f1e276] [cursor=pointer]
            - button "Up" [disabled] [ref=f1e279]
            - button "Shortcuts" [ref=f1e282] [cursor=pointer]
      - complementary [ref=f1e285]:
        - generic [ref=f1e286]:
          - tablist "inspector panels" [ref=f1e287]:
            - tab "Inspector · inspector" [selected] [ref=f1e288] [cursor=pointer]
            - generic [ref=f1e289]:
              - button "Collapse active panel in inspector" [ref=f1e290] [cursor=pointer]: ▾
              - button "Panel options in inspector" [ref=f1e291] [cursor=pointer]: ⋯
          - generic [ref=f1e294]:
            - heading "Inspector" [level=2] [ref=f1e295]
            - paragraph [ref=f1e296]: Multiply
            - button "Rename node" [ref=f1e297] [cursor=pointer]
            - generic [ref=f1e298]:
              - generic [ref=f1e300]:
                - generic [ref=f1e301]: A
                - textbox "A" [ref=f1e302]: "1"
                - alert [ref=f1e303]: Connected input — local value retained.
              - generic [ref=f1e305]:
                - generic [ref=f1e306]: B
                - textbox "B" [ref=f1e307]: "2"
                - alert
            - generic [ref=f1e309]:
              - text: From Float
              - button "Disconnect" [ref=f1e310] [cursor=pointer]
      - separator "right sidebar width" [ref=f1e311]
    - contentinfo [ref=f1e312]:
      - button "Project actions" [ref=f1e313] [cursor=pointer]
      - status [ref=f1e314]:
        - button "Read full application status" [disabled] [ref=f1e315]
      - button "Shader output" [ref=f1e316] [cursor=pointer]
      - button "Panels" [ref=f1e317] [cursor=pointer]
      - button "Hints" [ref=f1e318] [cursor=pointer]
```

# Test source

```ts
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
  83  |     const exportButton = app.getByRole("menuitem", {
  84  |       name: "Export JSON",
  85  |       exact: true,
  86  |     });
  87  |     if (!(await exportButton.isVisible()))
  88  |       await app
  89  |         .getByRole("button", { name: "Project actions", exact: true })
  90  |         .click();
  91  |     await exportButton.click();
  92  |     return JSON.parse(
  93  |       fs.readFileSync((await (await downloaded).path())!, "utf8"),
  94  |     );
  95  |   };
  96  |   const drag = async (dx: number, dy: number) => {
  97  |     const box = (await title.boundingBox())!;
  98  |     const x = box.x + box.width / 2,
  99  |       y = box.y + box.height / 2;
  100 |     await page.mouse.move(x, y);
  101 |     await page.mouse.down();
  102 |     await page.mouse.move(x + dx, y + dy, { steps: 8 });
  103 |   };
  104 |   await title.click();
  105 |   if (exportFirst) await exportDocument();
  106 |   const initial = await position();
  107 |   await drag(100, 60);
  108 |   await page.mouse.up();
  109 |   const committed = await position();
  110 |   expect(committed).toEqual([initial[0] + 100, initial[1] + 60]);
  111 |   if (exportFirst) await exportDocument();
  112 |   await app.getByRole("button", { name: "Undo", exact: true }).click();
  113 |   expect(await position()).toEqual(initial);
  114 |   if (exportFirst) await exportDocument();
  115 |   await app.getByRole("button", { name: "Redo", exact: true }).click();
  116 |   if (exportFirst) await exportDocument();
  117 |   const beforeEscape = await position();
  118 |   await drag(70, 30);
  119 |   const during = await position();
  120 |   const active = await frame.evaluate(() => ({
  121 |     tag: document.activeElement?.tagName,
  122 |     className: document.activeElement?.className,
  123 |   }));
  124 |   await page.keyboard.press("Escape");
  125 |   const afterEscape = await position();
  126 |   const boxAfterEscape = (await title.boundingBox())!;
  127 |   await page.mouse.move(
  128 |     boxAfterEscape.x + boxAfterEscape.width / 2 + 90,
  129 |     boxAfterEscape.y + boxAfterEscape.height / 2 + 40,
  130 |   );
  131 |   const afterHeldMove = await position();
  132 |   await page.mouse.up();
  133 |   const afterPointerUp = await position();
  134 |   const trace = await frame.evaluate(() => (globalThis as any).__escapeTrace);
  135 |   const result: any = {
  136 |     wrapper,
  137 |     exportFirst,
  138 |     initial,
  139 |     committed,
  140 |     beforeEscape,
  141 |     during,
  142 |     active,
  143 |     afterEscape,
  144 |     afterHeldMove,
  145 |     afterPointerUp,
  146 |     trace,
  147 |     errors,
  148 |   };
  149 |   fs.mkdirSync(path.dirname(output), { recursive: true });
  150 |   fs.writeFileSync(output, JSON.stringify(result, null, 2) + "\n", {
  151 |     flag: "wx",
  152 |   });
  153 |   await page.screenshot({ path: output + ".png", fullPage: true });
> 154 |   expect(afterEscape).toEqual(beforeEscape);
      |                       ^ Error: expect(received).toEqual(expected) // deep equality
  155 |   expect(afterHeldMove).toEqual(beforeEscape);
  156 |   expect(afterPointerUp).toEqual(beforeEscape);
  157 |   expect(
  158 |     trace
  159 |       .filter((e: any) => e.type === "keydown" && e.key === "Escape")
  160 |       .at(-1)
  161 |       .path.some((e: any) => e.className?.split?.(" ").includes("canvas")),
  162 |   ).toBe(true);
  163 |   // Cancel must not insert a History entry: Undo reaches the first drag's start.
  164 |   await app.getByRole("button", { name: "Undo", exact: true }).click();
  165 |   expect(await position()).toEqual(initial);
  166 |   await expect(
  167 |     app.getByRole("button", { name: "Undo", exact: true }),
  168 |   ).toBeDisabled();
  169 |   await app.getByRole("button", { name: "Redo", exact: true }).click();
  170 |   expect(await position()).toEqual(committed);
  171 |   const document = await exportDocument();
  172 |   expect(
  173 |     document.graph.stages
  174 |       .flatMap((s: any) => s.network.nodes)
  175 |       .find((n: any) => n.name === "Multiply").position,
  176 |   ).toEqual(committed);
  177 |   expect(errors).toEqual([]);
  178 |   fs.writeFileSync(
  179 |     output + ".verified.json",
  180 |     JSON.stringify(
  181 |       {
  182 |         status: "PASS",
  183 |         naturalKeyboard: true,
  184 |         noTestRefocus: true,
  185 |         cancelHasNoHistoryEntry: true,
  186 |         document,
  187 |       },
  188 |       null,
  189 |       2,
  190 |     ) + "\n",
  191 |     { flag: "wx" },
  192 |   );
  193 | }
  194 | 
```