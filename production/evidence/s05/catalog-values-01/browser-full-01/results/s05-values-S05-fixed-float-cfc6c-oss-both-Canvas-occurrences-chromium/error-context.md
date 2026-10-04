# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05-values.spec.ts >> S05 fixed float: shared Function nested Inspector edits persist across both Canvas occurrences
- Location: tests\browser\s05-values.spec.ts:302:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('.canvas').first().getByRole('heading', { name: 'Subgraph', exact: true }).first()
    - locator resolved to <h3>Subgraph</h3>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <h3>Subgraph</h3> from <article class="node" tabindex="0" role="group" data-node="id-38" aria-description="" aria-label="Subgraph 2">…</article> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <h3>Subgraph</h3> from <article class="node" tabindex="0" role="group" data-node="id-38" aria-description="" aria-label="Subgraph 2">…</article> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    115 × waiting for element to be visible, enabled and stable
        - element is visible, enabled and stable
        - scrolling into view if needed
        - done scrolling
        - <h3>Subgraph</h3> from <article class="node" tabindex="0" role="group" data-node="id-38" aria-description="" aria-label="Subgraph 2">…</article> subtree intercepts pointer events
      - retrying click action
        - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]: ●
      - text: Grape
      - generic [ref=e6]: SHADER WORKSPACE
    - navigation "Document actions" [ref=e7]:
      - button "New document" [ref=e8] [cursor=pointer]
      - button "Upgrade subgraph owners" [ref=e9] [cursor=pointer]
      - button "Save" [ref=e10] [cursor=pointer]
      - button "Open saved" [ref=e11] [cursor=pointer]
      - button "Export JSON" [active] [ref=e12] [cursor=pointer]
      - button "Export PNG" [ref=e13] [cursor=pointer]
      - button "Open file" [ref=e14] [cursor=pointer]
      - button "Generate GLSL" [ref=e15] [cursor=pointer]
      - button "Second Canvas" [ref=e16] [cursor=pointer]
      - button "Lock editing" [ref=e17] [cursor=pointer]
      - button "Personal Library" [ref=e18] [cursor=pointer]
    - generic [ref=e19]:
      - generic [ref=e20]: Unsaved changes
      - generic [ref=e21]: Host-free
  - status [ref=e22]: Export started. Saved status is unchanged.
  - generic [ref=e24]:
    - button "Add Float" [ref=e25] [cursor=pointer]
    - button "Add Multiply" [ref=e26] [cursor=pointer]
    - button "Add Compose" [ref=e27] [cursor=pointer]
    - button "Add Float (fixed)" [ref=e28] [cursor=pointer]
    - button "Add Vector 2" [ref=e29] [cursor=pointer]
    - button "Add Vector 3" [ref=e30] [cursor=pointer]
    - button "Add Color RGBA" [ref=e31] [cursor=pointer]
    - button "Add Array repeat" [ref=e32] [cursor=pointer]
    - button "Add Vertex position" [ref=e33] [cursor=pointer]
    - button "Add Constant input" [ref=e34] [cursor=pointer]
    - button "Add Add" [ref=e35] [cursor=pointer]
    - button "Add Array length" [ref=e36] [cursor=pointer]
    - button "Add Pixel depth and pair" [ref=e37] [cursor=pointer]
    - button "Undo" [disabled] [ref=e38]
    - button "Redo" [disabled] [ref=e39]
    - button "Delete selected" [ref=e40] [cursor=pointer]
    - alert
  - main [ref=e41]:
    - generic [ref=e43]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e44]:
        - generic:
          - generic:
            - group "Image output" [ref=e46]:
              - heading "Image output" [level=3] [ref=e47]
              - generic [ref=e48]:
                - button "Image output input color" [ref=e49] [cursor=pointer]:
                  - generic [ref=e50]: ●
                  - generic [ref=e51]: color
                - generic [ref=e52]: vec4
            - group "Subgraph" [ref=e53]:
              - heading "Subgraph" [level=3] [ref=e54]
              - generic [ref=e55]:
                - button "Subgraph output Output 1" [ref=e56] [cursor=pointer]:
                  - generic [ref=e57]: Output 1
                  - generic [ref=e58]: ●
                - generic [ref=e59]: float
            - group "Subgraph 2" [ref=e60]:
              - heading "Subgraph" [level=3] [ref=e61]
              - generic [ref=e63]:
                - button "Subgraph 2 output Output 1" [ref=e64] [cursor=pointer]:
                  - generic [ref=e65]: Output 1
                  - generic [ref=e66]: ●
                - generic [ref=e67]: float
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e68]:
          - button "New subgraph" [ref=e69] [cursor=pointer]
          - button "Library subgraph" [ref=e70] [cursor=pointer]
          - button "Encapsulate" [ref=e71] [cursor=pointer]
          - button "Make independent" [ref=e72] [cursor=pointer]
          - button "Enter subgraph" [ref=e73] [cursor=pointer]
          - button "Up" [ref=e74] [cursor=pointer]
          - button "Arrange nodes" [ref=e75] [cursor=pointer]
          - button "Frame selection" [ref=e76] [cursor=pointer]
          - group [ref=e77]:
            - generic "Local clipboard" [ref=e78]
          - group [ref=e79]:
            - generic "Structures" [ref=e80]
            - option "New structure" [selected]
    - complementary [ref=e81]:
      - generic [ref=e82]:
        - heading "Inspector" [level=2] [ref=e83]
        - paragraph [ref=e84]: Select a node to inspect its parameters.
  - generic [ref=e86]:
    - heading "Shader output" [level=2] [ref=e87]
    - paragraph [ref=e88]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics"
  - contentinfo [ref=e89]:
    - generic [ref=e90]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e91]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  217 |       await page.getByRole("button", { name: "Redo", exact: true }).click();
  218 |       await expect(
  219 |         page.getByRole("textbox", {
  220 |           name: item.components.at(-1)!,
  221 |           exact: true,
  222 |         }),
  223 |       ).toHaveValue(String(edited.at(-1)));
  224 |       const first = page.getByRole("textbox", {
  225 |         name: item.components[0],
  226 |         exact: true,
  227 |       });
  228 |       await first.fill("Infinity");
  229 |       await first.press("Enter");
  230 |       await expect(first).toHaveAttribute("aria-invalid", "true");
  231 |       await first.press("Escape");
  232 |       await expect(first).toHaveValue(String(edited[0]));
  233 |       await canvas
  234 |         .getByRole("button", { name: item.label + " output out", exact: true })
  235 |         .click();
  236 |       await canvas
  237 |         .getByRole("button", {
  238 |           name:
  239 |             stage === "pixel"
  240 |               ? "Image output input color"
  241 |               : "Position input Value",
  242 |           exact: true,
  243 |         })
  244 |         .click();
  245 |       await page
  246 |         .getByRole("button", { name: "Generate GLSL", exact: true })
  247 |         .click();
  248 |       await expect(
  249 |         page.getByText("Generated successfully · Host-free GLSL", {
  250 |           exact: true,
  251 |         }),
  252 |       ).toBeVisible();
  253 |       const document = await exportDocument(page),
  254 |         node = document.graph.stages
  255 |           .find((x: any) => x.key === stage)
  256 |           .network.nodes.find(
  257 |             (x: any) =>
  258 |               x.type.moduleId === "grape.nodes.fixed-values" &&
  259 |               x.type.typeId === item.key,
  260 |           );
  261 |       expect(node.state.value).toEqual(item.edited);
  262 |       expect(node.ports).toEqual([
  263 |         { key: "out", direction: "output", type: item.type },
  264 |       ]);
  265 |       await saveReopen(page);
  266 |       await openValidFile(
  267 |         page,
  268 |         item.key + ".grape.json",
  269 |         Buffer.from(JSON.stringify(document)),
  270 |       );
  271 |       expect(await exportDocument(page)).toEqual(document);
  272 |       await page.screenshot({
  273 |         path: evidence + `/fixed-${item.key}-${stage}.png`,
  274 |         fullPage: true,
  275 |       });
  276 |       await fs.writeFile(
  277 |         evidence + `/fixed-${item.key}-${stage}.json`,
  278 |         JSON.stringify(
  279 |           {
  280 |             leaf: item.key,
  281 |             stage,
  282 |             document,
  283 |             operations: [
  284 |               "public create",
  285 |               "every component edit",
  286 |               "one-component Undo/Redo",
  287 |               "nonfinite rejection and Escape",
  288 |               "fixed out connection",
  289 |               "Generate",
  290 |               "save/reopen",
  291 |               "JSON export/file review/new session",
  292 |             ],
  293 |           },
  294 |           null,
  295 |           2,
  296 |         ),
  297 |         { flag: "wx" },
  298 |       );
  299 |     });
  300 | 
  301 | for (const item of valueCases)
  302 |   test(`S05 fixed ${item.key}: shared Function nested Inspector edits persist across both Canvas occurrences`, async ({
  303 |     page,
  304 |   }) => {
  305 |     page.on("dialog", (d) => void d.accept());
  306 |     await page.goto("/");
  307 |     const s = valueFixture(item.key, "pixel", "function");
  308 |     await openValidFile(
  309 |       page,
  310 |       item.key + "-function.grape.json",
  311 |       Buffer.from(JSON.stringify(s.graph.capture().document)),
  312 |     );
  313 |     const enter = async (canvas) => {
  314 |       await canvas
  315 |         .getByRole("heading", { name: "Subgraph", exact: true })
  316 |         .first()
> 317 |         .click();
      |          ^ Error: locator.click: Test timeout of 60000ms exceeded.
  318 |       await canvas
  319 |         .getByRole("button", { name: "Enter subgraph", exact: true })
  320 |         .click();
  321 |       await canvas
  322 |         .getByRole("heading", { name: item.label, exact: true })
  323 |         .click();
  324 |     };
  325 |     await enter(page.locator(".canvas").first());
  326 |     const v = typeof item.edited === "number" ? [item.edited] : item.edited;
  327 |     for (let i = 0; i < item.components.length; i++) {
  328 |       const input = page.getByRole("textbox", {
  329 |         name: item.components[i],
  330 |         exact: true,
  331 |       });
  332 |       await input.fill(String(v[i]));
  333 |       await input.press("Enter");
  334 |     }
  335 |     await page
  336 |       .getByRole("button", { name: "Second Canvas", exact: true })
  337 |       .click();
  338 |     await enter(page.locator(".canvas").nth(1));
  339 |     for (let i = 0; i < item.components.length; i++)
  340 |       await expect(
  341 |         page.getByRole("textbox", { name: item.components[i], exact: true }),
  342 |       ).toHaveValue(String(v[i]));
  343 |     const changed = await exportDocument(page);
  344 |     expect(
  345 |       changed.graph.resources
  346 |         .find((r: any) => r.data?.network?.id === s.bodies[0])
  347 |         .data.network.nodes.find((n: any) => n.id === s.leaf).state.value,
  348 |     ).toEqual(item.edited);
  349 |     await saveReopen(page);
  350 |     await page
  351 |       .getByRole("button", { name: "Generate GLSL", exact: true })
  352 |       .click();
  353 |     await expect(
  354 |       page.getByText("Generated successfully · Host-free GLSL", {
  355 |         exact: true,
  356 |       }),
  357 |     ).toBeVisible();
  358 |     await fs.writeFile(
  359 |       evidence + `/fixed-${item.key}-shared.json`,
  360 |       JSON.stringify(
  361 |         { document: changed, sharedContexts: true, saved: true },
  362 |         null,
  363 |         2,
  364 |       ),
  365 |       { flag: "wx" },
  366 |     );
  367 |   });
  368 | 
```