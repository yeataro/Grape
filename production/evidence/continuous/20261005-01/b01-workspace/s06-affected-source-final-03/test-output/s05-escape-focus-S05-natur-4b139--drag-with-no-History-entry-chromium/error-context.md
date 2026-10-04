# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05-escape-focus.spec.ts >> S05 natural Escape cancels direct after Export drag with no History entry
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
      - tablist "canvas-1 panels" [ref=e34]:
        - tab "Canvas · canvas-1" [selected] [ref=e35] [cursor=pointer]
        - generic [ref=e36]:
          - button "Collapse active panel in canvas-1" [ref=e37] [cursor=pointer]: ▾
          - button "Panel options in canvas-1" [ref=e38] [cursor=pointer]: ⋯
      - generic "Shader graph canvas" [ref=e41]:
        - generic:
          - generic:
            - img:
              - generic "Edge 166b3e13-1ebf-4599-8128-0abea80b72c1" [ref=e42]
              - generic "Edge 94c35881-d237-4dc3-b603-22f3b0e01cb3" [ref=e43]
              - generic "Edge a4d59b58-a214-4957-b08f-096fbaf220e2" [ref=e44]
            - generic:
              - group "Image output" [ref=e45]:
                - heading "Image output" [level=3] [ref=e46]
                - generic [ref=e47]:
                  - button "Image output input color" [ref=e48] [cursor=pointer]
                  - generic [ref=e49]: color
                  - generic [ref=e50]: vec4
              - group "Float" [ref=e51]:
                - heading "Float" [level=3] [ref=e52]
                - generic [ref=e53]:
                  - button "Float output value" [ref=e54] [cursor=pointer]
                  - generic [ref=e55]: value
                  - generic [ref=e56]: float
              - group "Multiply" [ref=e57]:
                - heading "Multiply" [level=3] [ref=e58]
                - generic [ref=e59]:
                  - button "Multiply input a" [ref=e60] [cursor=pointer]
                  - generic [ref=e61]: a
                  - generic [ref=e62]: float
                - generic [ref=e63]:
                  - button "Multiply input b" [ref=e64] [cursor=pointer]
                  - generic [ref=e65]: b
                  - generic [ref=e66]: float
                  - generic "Current local value; edit in Inspector" [ref=e67]: "2"
                - generic [ref=e68]:
                  - button "Multiply output result" [ref=e69] [cursor=pointer]
                  - generic [ref=e70]: result
                  - generic [ref=e71]: float
              - group "Compose" [ref=e72]:
                - heading "Compose" [level=3] [ref=e73]
                - generic [ref=e74]:
                  - button "Compose input x" [ref=e75] [cursor=pointer]
                  - generic [ref=e76]: x
                  - generic [ref=e77]: float
                - generic [ref=e78]:
                  - button "Compose input y" [ref=e79] [cursor=pointer]
                  - generic [ref=e80]: "y"
                  - generic [ref=e81]: float
                  - generic "Current local value; edit in Inspector" [ref=e82]: "0"
                - generic [ref=e83]:
                  - button "Compose input z" [ref=e84] [cursor=pointer]
                  - generic [ref=e85]: z
                  - generic [ref=e86]: float
                  - generic "Current local value; edit in Inspector" [ref=e87]: "0"
                - generic [ref=e88]:
                  - button "Compose input w" [ref=e89] [cursor=pointer]
                  - generic [ref=e90]: w
                  - generic [ref=e91]: float
                  - generic "Current local value; edit in Inspector" [ref=e92]: "1"
                - generic [ref=e93]:
                  - button "Compose output result" [ref=e94] [cursor=pointer]
                  - generic [ref=e95]: result
                  - generic [ref=e96]: vec4
              - group "Unused Multiply 0" [ref=e97]:
                - heading "Unused Multiply 0" [level=3] [ref=e98]
                - generic [ref=e99]:
                  - button "Unused Multiply 0 input a" [ref=e100] [cursor=pointer]
                  - generic [ref=e101]: a
                  - generic [ref=e102]: float
                  - generic "Current local value; edit in Inspector" [ref=e103]: "1"
                - generic [ref=e104]:
                  - button "Unused Multiply 0 input b" [ref=e105] [cursor=pointer]
                  - generic [ref=e106]: b
                  - generic [ref=e107]: float
                  - generic "Current local value; edit in Inspector" [ref=e108]: "2"
                - generic [ref=e109]:
                  - button "Unused Multiply 0 output result" [ref=e110] [cursor=pointer]
                  - generic [ref=e111]: result
                  - generic [ref=e112]: float
              - group "Unused Multiply 1" [ref=e113]:
                - heading "Unused Multiply 1" [level=3] [ref=e114]
                - generic [ref=e115]:
                  - button "Unused Multiply 1 input a" [ref=e116] [cursor=pointer]
                  - generic [ref=e117]: a
                  - generic [ref=e118]: float
                  - generic "Current local value; edit in Inspector" [ref=e119]: "1"
                - generic [ref=e120]:
                  - button "Unused Multiply 1 input b" [ref=e121] [cursor=pointer]
                  - generic [ref=e122]: b
                  - generic [ref=e123]: float
                  - generic "Current local value; edit in Inspector" [ref=e124]: "2"
                - generic [ref=e125]:
                  - button "Unused Multiply 1 output result" [ref=e126] [cursor=pointer]
                  - generic [ref=e127]: result
                  - generic [ref=e128]: float
              - group "Unused Multiply 2" [ref=e129]:
                - heading "Unused Multiply 2" [level=3] [ref=e130]
                - generic [ref=e131]:
                  - button "Unused Multiply 2 input a" [ref=e132] [cursor=pointer]
                  - generic [ref=e133]: a
                  - generic [ref=e134]: float
                  - generic "Current local value; edit in Inspector" [ref=e135]: "1"
                - generic [ref=e136]:
                  - button "Unused Multiply 2 input b" [ref=e137] [cursor=pointer]
                  - generic [ref=e138]: b
                  - generic [ref=e139]: float
                  - generic "Current local value; edit in Inspector" [ref=e140]: "2"
                - generic [ref=e141]:
                  - button "Unused Multiply 2 output result" [ref=e142] [cursor=pointer]
                  - generic [ref=e143]: result
                  - generic [ref=e144]: float
              - group "Unused Multiply 3" [ref=e145]:
                - heading "Unused Multiply 3" [level=3] [ref=e146]
                - generic [ref=e147]:
                  - button "Unused Multiply 3 input a" [ref=e148] [cursor=pointer]
                  - generic [ref=e149]: a
                  - generic [ref=e150]: float
                  - generic "Current local value; edit in Inspector" [ref=e151]: "1"
                - generic [ref=e152]:
                  - button "Unused Multiply 3 input b" [ref=e153] [cursor=pointer]
                  - generic [ref=e154]: b
                  - generic [ref=e155]: float
                  - generic "Current local value; edit in Inspector" [ref=e156]: "2"
                - generic [ref=e157]:
                  - button "Unused Multiply 3 output result" [ref=e158] [cursor=pointer]
                  - generic [ref=e159]: result
                  - generic [ref=e160]: float
              - group "Unused Multiply 4" [ref=e161]:
                - heading "Unused Multiply 4" [level=3] [ref=e162]
                - generic [ref=e163]:
                  - button "Unused Multiply 4 input a" [ref=e164] [cursor=pointer]
                  - generic [ref=e165]: a
                  - generic [ref=e166]: float
                  - generic "Current local value; edit in Inspector" [ref=e167]: "1"
                - generic [ref=e168]:
                  - button "Unused Multiply 4 input b" [ref=e169] [cursor=pointer]
                  - generic [ref=e170]: b
                  - generic [ref=e171]: float
                  - generic "Current local value; edit in Inspector" [ref=e172]: "2"
                - generic [ref=e173]:
                  - button "Unused Multiply 4 output result" [ref=e174] [cursor=pointer]
                  - generic [ref=e175]: result
                  - generic [ref=e176]: float
              - group "Unused Multiply 5" [ref=e177]:
                - heading "Unused Multiply 5" [level=3] [ref=e178]
                - generic [ref=e179]:
                  - button "Unused Multiply 5 input a" [ref=e180] [cursor=pointer]
                  - generic [ref=e181]: a
                  - generic [ref=e182]: float
                  - generic "Current local value; edit in Inspector" [ref=e183]: "1"
                - generic [ref=e184]:
                  - button "Unused Multiply 5 input b" [ref=e185] [cursor=pointer]
                  - generic [ref=e186]: b
                  - generic [ref=e187]: float
                  - generic "Current local value; edit in Inspector" [ref=e188]: "2"
                - generic [ref=e189]:
                  - button "Unused Multiply 5 output result" [ref=e190] [cursor=pointer]
                  - generic [ref=e191]: result
                  - generic [ref=e192]: float
              - group "Unused Multiply 6" [ref=e193]:
                - heading "Unused Multiply 6" [level=3] [ref=e194]
                - generic [ref=e195]:
                  - button "Unused Multiply 6 input a" [ref=e196] [cursor=pointer]
                  - generic [ref=e197]: a
                  - generic [ref=e198]: float
                  - generic "Current local value; edit in Inspector" [ref=e199]: "1"
                - generic [ref=e200]:
                  - button "Unused Multiply 6 input b" [ref=e201] [cursor=pointer]
                  - generic [ref=e202]: b
                  - generic [ref=e203]: float
                  - generic "Current local value; edit in Inspector" [ref=e204]: "2"
                - generic [ref=e205]:
                  - button "Unused Multiply 6 output result" [ref=e206] [cursor=pointer]
                  - generic [ref=e207]: result
                  - generic [ref=e208]: float
              - group "Unused Multiply 7" [ref=e209]:
                - heading "Unused Multiply 7" [level=3] [ref=e210]
                - generic [ref=e211]:
                  - button "Unused Multiply 7 input a" [ref=e212] [cursor=pointer]
                  - generic [ref=e213]: a
                  - generic [ref=e214]: float
                  - generic "Current local value; edit in Inspector" [ref=e215]: "1"
                - generic [ref=e216]:
                  - button "Unused Multiply 7 input b" [ref=e217] [cursor=pointer]
                  - generic [ref=e218]: b
                  - generic [ref=e219]: float
                  - generic "Current local value; edit in Inspector" [ref=e220]: "2"
                - generic [ref=e221]:
                  - button "Unused Multiply 7 output result" [ref=e222] [cursor=pointer]
                  - generic [ref=e223]: result
                  - generic [ref=e224]: float
              - group "Unused Multiply 8" [ref=e225]:
                - heading "Unused Multiply 8" [level=3] [ref=e226]
                - generic [ref=e227]:
                  - button "Unused Multiply 8 input a" [ref=e228] [cursor=pointer]
                  - generic [ref=e229]: a
                  - generic [ref=e230]: float
                  - generic "Current local value; edit in Inspector" [ref=e231]: "1"
                - generic [ref=e232]:
                  - button "Unused Multiply 8 input b" [ref=e233] [cursor=pointer]
                  - generic [ref=e234]: b
                  - generic [ref=e235]: float
                  - generic "Current local value; edit in Inspector" [ref=e236]: "2"
                - generic [ref=e237]:
                  - button "Unused Multiply 8 output result" [ref=e238] [cursor=pointer]
                  - generic [ref=e239]: result
                  - generic [ref=e240]: float
              - group "Unused Multiply 9" [ref=e241]:
                - heading "Unused Multiply 9" [level=3] [ref=e242]
                - generic [ref=e243]:
                  - button "Unused Multiply 9 input a" [ref=e244] [cursor=pointer]
                  - generic [ref=e245]: a
                  - generic [ref=e246]: float
                  - generic "Current local value; edit in Inspector" [ref=e247]: "1"
                - generic [ref=e248]:
                  - button "Unused Multiply 9 input b" [ref=e249] [cursor=pointer]
                  - generic [ref=e250]: b
                  - generic [ref=e251]: float
                  - generic "Current local value; edit in Inspector" [ref=e252]: "2"
                - generic [ref=e253]:
                  - button "Unused Multiply 9 output result" [ref=e254] [cursor=pointer]
                  - generic [ref=e255]: result
                  - generic [ref=e256]: float
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e257]:
          - button "New subgraph" [ref=e258] [cursor=pointer]
          - button "Library subgraph" [ref=e259] [cursor=pointer]
          - button "Encapsulate" [ref=e260] [cursor=pointer]
          - button "Make independent" [ref=e261] [cursor=pointer]
          - button "Enter subgraph" [ref=e262] [cursor=pointer]
          - button "Arrange nodes" [ref=e263] [cursor=pointer]
          - button "Frame selection" [ref=e264] [cursor=pointer]
          - group [ref=e265]:
            - generic "Local clipboard" [ref=e266] [cursor=pointer]
          - group [ref=e267]:
            - generic "Structures" [ref=e268] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e269]:
          - button "Vertex" [ref=e270] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e271] [cursor=pointer]
        - generic [ref=e272]:
          - button "Add Node" [ref=e273] [cursor=pointer]
          - button "Browse nodes" [ref=e276] [cursor=pointer]
          - button "Up" [disabled] [ref=e279]
          - button "Shortcuts" [ref=e282] [cursor=pointer]
    - complementary [ref=e285]:
      - generic [ref=e286]:
        - tablist "inspector panels" [ref=e287]:
          - tab "Inspector · inspector" [selected] [ref=e288] [cursor=pointer]
          - generic [ref=e289]:
            - button "Collapse active panel in inspector" [ref=e290] [cursor=pointer]: ▾
            - button "Panel options in inspector" [ref=e291] [cursor=pointer]: ⋯
        - generic [ref=e294]:
          - heading "Inspector" [level=2] [ref=e295]
          - paragraph [ref=e296]: Multiply
          - button "Rename node" [ref=e297] [cursor=pointer]
          - generic [ref=e298]:
            - generic [ref=e300]:
              - generic [ref=e301]: A
              - textbox "A" [ref=e302]: "1"
              - alert [ref=e303]: Connected input — local value retained.
            - generic [ref=e305]:
              - generic [ref=e306]: B
              - textbox "B" [ref=e307]: "2"
              - alert
          - generic [ref=e309]:
            - text: From Float
            - button "Disconnect" [ref=e310] [cursor=pointer]
    - separator "right sidebar width" [ref=e311]
  - contentinfo [ref=e312]:
    - button "Project actions" [ref=e313] [cursor=pointer]
    - status [ref=e314]:
      - button "Read full application status" [ref=e315] [cursor=pointer]: Export started. Saved status is unchanged.
    - button "Shader output" [ref=e316] [cursor=pointer]
    - button "Panels" [ref=e317] [cursor=pointer]
    - button "Hints" [ref=e318] [cursor=pointer]
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