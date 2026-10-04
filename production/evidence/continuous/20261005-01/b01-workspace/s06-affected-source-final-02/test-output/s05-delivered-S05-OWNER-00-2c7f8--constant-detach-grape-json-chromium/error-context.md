# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05-delivered.spec.ts >> S05-OWNER-001 delivered public flow constant-detach.grape.json
- Location: production\tests\browser\s05-delivered.spec.ts:50:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('list', { name: 'Diagnostics' })
Expected substring: "INPUT_REQUIRED"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for getByRole('list', { name: 'Diagnostics' })

```

```yaml
- banner:
  - text: Grape SHADER WORKSPACE Development · unversioned
  - button "本輪更新"
  - navigation "Document actions":
    - button "Save"
    - button "Generate GLSL"
  - text: Unsaved changes Host-free
- button "Undo"
- button "Redo" [disabled]
- button "Delete selected"
- alert
- main:
  - tablist "canvas-1 panels":
    - tab "Canvas · canvas-1" [selected]
    - button "Collapse active panel in canvas-1": ▾
    - button "Panel options in canvas-1": ⋯
  - img
  - group "Inputs":
    - heading "Inputs" [level=3]
    - button "Create input port from selection"
    - button "Inputs output X"
    - text: X float
  - group "Outputs":
    - heading "Outputs" [level=3]
    - button "Create output port from selection"
    - button "Outputs input Y"
    - text: Y float
    - button "Outputs input Twice"
    - text: Twice float
  - group "Add":
    - heading "Add" [level=3]
    - button "Add input a"
    - text: a float
    - button "Add input b"
    - text: b float
    - button "Add output value"
    - text: value float
  - button "Untitled shader / pixel"
  - button "Shared arithmetic" [disabled]
  - status:
    - button "Read full Canvas status": Function mode of definition id-22 makes this receiving input nonconstant. Receiver id-38/value; edge id-39.
  - button "New subgraph"
  - button "Library subgraph"
  - button "Encapsulate"
  - button "Make independent"
  - button "Enter subgraph"
  - button "Arrange nodes"
  - button "Frame selection"
  - group: Subgraph interface
  - group: Local clipboard
  - group: Structures
  - button "Vertex"
  - button "Pixel" [pressed]
  - button "Add Node"
  - button "Browse nodes"
  - button "Up"
  - button "Shortcuts"
  - img
  - complementary:
    - tablist "inspector panels":
      - tab "Inspector · inspector" [selected]
      - button "Collapse active panel in inspector": ▾
      - button "Panel options in inspector": ⋯
    - heading "Inspector" [level=2]
    - paragraph: Select a node to inspect its parameters.
  - separator "right sidebar width"
- contentinfo:
  - button "Project actions"
  - alert:
    - button "Read full application status": "INPUT_REQUIRED: Connect the required input. · FUNCTION_CONSTANT_DETACHED: Function mode of definition id-22 makes this receiving input nonconstant. · CONSTANT_REQUIRED: This input requires a compile-time constant; ordinary function parameters and function results are runtime values. · FUNCTION_CONSTANT_DETACHED: Function mode of definition id-22 makes this receiving input nonconstant. · CONSTANT_REQUIRED: This input requires a compile-time constant; ordinary function parameters and function results are runtime values."
  - button "Shader output"
  - button "Panels"
  - button "Hints"
```

# Test source

```ts
  142 |         );
  143 |       expected.graph.modules = after.graph.modules;
  144 |       assert.deepEqual(after, expected);
  145 |       canvas = await enter(page, "Subgraph");
  146 |       await expect(canvas.getByLabel("Subgraph emission mode")).toBeEnabled();
  147 |       await expect(canvas.getByLabel("Subgraph emission mode")).toHaveValue(
  148 |         "expand",
  149 |       );
  150 |       upgrade = {
  151 |         before,
  152 |         after,
  153 |         preservedBodyInterfaceOriginDependenciesReferencesAndOldPins: true,
  154 |       };
  155 |       actions.push(
  156 |         "explicit old owner upgrade",
  157 |         "Expand with full authored-data preservation",
  158 |       );
  159 |     } else if (
  160 |       [
  161 |         "shared-expand.grape.json",
  162 |         "constant-detach.grape.json",
  163 |         "activation-rejected.grape.json",
  164 |       ].includes(name)
  165 |     ) {
  166 |       const before = await exportDocument(page),
  167 |         canvas = await enter(page, "Shared arithmetic");
  168 |       await canvas
  169 |         .getByLabel("Subgraph emission mode")
  170 |         .selectOption("function");
  171 |       if (name === "activation-rejected.grape.json") {
  172 |         await expect(canvas.locator(".canvas-notice")).toContainText(
  173 |           "CONSTANT_REQUIRED",
  174 |         );
  175 |         await expect(canvas.getByLabel("Subgraph emission mode")).toHaveValue(
  176 |           "expand",
  177 |         );
  178 |         assert.deepEqual(await exportDocument(page), before);
  179 |         await expect(
  180 |           page.getByRole("button", { name: "Undo", exact: true }),
  181 |         ).toBeDisabled();
  182 |         actions.push("invalid activation rejected atomically");
  183 |       } else {
  184 |         const changed = await exportDocument(page);
  185 |         if (name === "constant-detach.grape.json") {
  186 |           assert.equal(
  187 |             changed.graph.losses.at(-1).code,
  188 |             "FUNCTION_CONSTANT_DETACHED",
  189 |           );
  190 |           await expect(canvas.locator(".canvas-notice")).toContainText(
  191 |             "Receiver",
  192 |           );
  193 |         }
  194 |         await page.getByRole("button", { name: "Undo", exact: true }).click();
  195 |         assert.deepEqual((await exportDocument(page)).graph, before.graph);
  196 |         await page.getByRole("button", { name: "Redo", exact: true }).click();
  197 |         assert.deepEqual((await exportDocument(page)).graph, changed.graph);
  198 |         actions.push(
  199 |           name === "constant-detach.grape.json"
  200 |             ? "atomic detach/loss and Undo/Redo"
  201 |             : "shared mode change and Undo/Redo",
  202 |         );
  203 |       }
  204 |     } else if (name === "shared-function.grape.json") {
  205 |       const before = await exportDocument(page),
  206 |         canvas = page.locator(".canvas").first();
  207 |       await canvas
  208 |         .getByRole("heading", { name: "Shared arithmetic", exact: true })
  209 |         .first()
  210 |         .click();
  211 |       await canvas
  212 |         .getByRole("button", { name: "Make independent", exact: true })
  213 |         .click();
  214 |       assert.equal(
  215 |         (await exportDocument(page)).graph.resources.length,
  216 |         before.graph.resources.length + 1,
  217 |       );
  218 |       await canvas
  219 |         .getByRole("button", { name: "Enter subgraph", exact: true })
  220 |         .click();
  221 |       await canvas.getByText("Subgraph interface", { exact: true }).click();
  222 |       await expect(canvas.getByLabel("Subgraph emission mode")).toHaveValue(
  223 |         "function",
  224 |       );
  225 |       await canvas.getByLabel("Subgraph emission mode").selectOption("expand");
  226 |       const after = await exportDocument(page);
  227 |       for (const r of before.graph.resources)
  228 |         assert.deepEqual(
  229 |           after.graph.resources.find((a: any) => a.id === r.id),
  230 |           r,
  231 |         );
  232 |       actions.push(
  233 |         "Make independent retains mode then diverges without changing shared original",
  234 |       );
  235 |     }
  236 |   }
  237 |   await page
  238 |     .getByRole("button", { name: "Generate GLSL", exact: true })
  239 |     .click();
  240 |   const expectedError = name === "constant-detach.grape.json";
  241 |   if (expectedError)
> 242 |     await expect(page.getByRole("list", { name: "Diagnostics" })).toContainText(
      |                                                                   ^ Error: expect(locator).toContainText(expected) failed
  243 |       "INPUT_REQUIRED",
  244 |     );
  245 |   else
  246 |     await expect(page.getByLabel("Generated GLSL")).toContainText(
  247 |       "#version 300 es",
  248 |     );
  249 |   const roundtrip = await saveReopen(page);
  250 |   actions.push(
  251 |     expectedError
  252 |       ? "expected INPUT_REQUIRED only after deliberate mode detach"
  253 |       : "successful GLSL generation",
  254 |     "save/reopen exact document",
  255 |   );
  256 |   return {
  257 |     name,
  258 |     sha256: createHash("sha256").update(bytes).digest("hex"),
  259 |     bytes: bytes.length,
  260 |     review,
  261 |     actions,
  262 |     upgrade,
  263 |     roundtrip,
  264 |   };
  265 | }
  266 | 
```