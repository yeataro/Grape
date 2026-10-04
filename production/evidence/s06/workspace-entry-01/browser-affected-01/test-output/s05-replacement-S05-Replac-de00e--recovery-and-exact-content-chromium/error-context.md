# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05-replacement.spec.ts >> S05 Replace destination matching: eligibility, recovery and exact content
- Location: ..\..\..\production\tests\browser\s05-replacement.spec.ts:28:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Add Float', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - text: Grape
      - generic [ref=e9]: SHADER WORKSPACE
    - navigation "Document actions" [ref=e10]:
      - generic [ref=e11]:
        - button "New document" [ref=e12] [cursor=pointer]
        - button "Save" [ref=e15] [cursor=pointer]
        - button "Open saved" [ref=e18] [cursor=pointer]
        - button "Export JSON" [active] [ref=e21] [cursor=pointer]
        - button "Export PNG" [ref=e24] [cursor=pointer]
        - button "Open file" [ref=e27] [cursor=pointer]
      - generic [ref=e30]:
        - button "Generate GLSL" [ref=e31] [cursor=pointer]
        - button "Second Canvas" [ref=e34] [cursor=pointer]
        - button "Lock editing" [ref=e37] [cursor=pointer]
      - group [ref=e40]:
        - generic "More actions" [ref=e41] [cursor=pointer]
    - generic [ref=e43]:
      - generic [ref=e44]: Unsaved changes
      - generic [ref=e45]: Host-free
  - status [ref=e46]: Export started. Saved status is unchanged.
  - generic [ref=e48]:
    - button "Undo" [disabled] [ref=e49]
    - button "Redo" [disabled] [ref=e52]
    - button "Delete selected" [ref=e55] [cursor=pointer]
    - alert
  - main [ref=e56]:
    - generic [ref=e58]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e59]:
        - generic:
          - generic:
            - group "Image output" [ref=e61]:
              - heading "Image output" [level=3] [ref=e62]
              - generic [ref=e63]:
                - button "Image output input color" [ref=e64] [cursor=pointer]:
                  - generic [ref=e66]: color
                - generic [ref=e67]: vec4
            - group "Subgraph" [ref=e68]:
              - heading "Subgraph" [level=3] [ref=e69]
              - generic [ref=e70]:
                - button "Subgraph input Value" [ref=e71] [cursor=pointer]:
                  - generic [ref=e73]: Value
                - generic [ref=e74]: vec4
              - generic [ref=e75]:
                - button "Subgraph output Value" [ref=e76] [cursor=pointer]:
                  - generic [ref=e77]: Value
                - generic [ref=e79]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e80]:
          - button "New subgraph" [ref=e81] [cursor=pointer]
          - button "Library subgraph" [ref=e82] [cursor=pointer]
          - button "Encapsulate" [ref=e83] [cursor=pointer]
          - button "Make independent" [ref=e84] [cursor=pointer]
          - button "Enter subgraph" [ref=e85] [cursor=pointer]
          - button "Arrange nodes" [ref=e86] [cursor=pointer]
          - button "Frame selection" [ref=e87] [cursor=pointer]
          - group [ref=e88]:
            - generic "Local clipboard" [ref=e89] [cursor=pointer]
          - group [ref=e90]:
            - generic "Structures" [ref=e91] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e92]:
          - button "Vertex" [ref=e93] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e94] [cursor=pointer]
        - generic [ref=e95]:
          - button "Add Node" [ref=e96] [cursor=pointer]
          - button "Browse nodes" [ref=e99] [cursor=pointer]
          - button "Up" [disabled] [ref=e102]
          - button "Shortcuts" [ref=e105] [cursor=pointer]
    - complementary [ref=e108]:
      - generic [ref=e109]:
        - heading "Inspector" [level=2] [ref=e110]
        - paragraph [ref=e111]: Select a node to inspect its parameters.
  - generic [ref=e113]:
    - heading "Shader output" [level=2] [ref=e114]
    - paragraph [ref=e115]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics"
  - contentinfo [ref=e116]:
    - generic [ref=e117]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e118]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  1   | import assert from "node:assert/strict";
  2   | import fs from "node:fs/promises";
  3   | import { expect, type Page } from "@playwright/test";
  4   | import {
  5   |   exportDocument,
  6   |   reviewFile,
  7   |   openValidFile,
  8   |   saveReopen,
  9   | } from "./s05-delivered-flows.ts";
  10  | 
  11  | export async function replacementUIState(page: Page) {
  12  |   return {
  13  |     undo: await page
  14  |       .getByRole("button", { name: "Undo", exact: true })
  15  |       .isEnabled(),
  16  |     redo: await page
  17  |       .getByRole("button", { name: "Redo", exact: true })
  18  |       .isEnabled(),
  19  |     dirty: await page.locator("#save-state").textContent(),
  20  |     canvases: await page
  21  |       .locator(".canvas")
  22  |       .evaluateAll((nodes) =>
  23  |         nodes.map((n) => ({ ...(n as HTMLElement).dataset })),
  24  |       ),
  25  |   };
  26  | }
  27  | export async function originalBytes(page: Page) {
  28  |   const event = page.waitForEvent("download");
  29  |   await page
  30  |     .getByRole("button", { name: "Export original", exact: true })
  31  |     .click();
  32  |   return fs.readFile((await (await event).path())!);
  33  | }
  34  | /** Public archived UI only; lifecycle IDs not exposed by the shell are asserted at Application level separately. */
  35  | export async function replacementFlow(
  36  |   page: Page,
  37  |   mode: "default" | "upgraded" | "matching",
  38  |   bytes: Buffer,
  39  | ) {
  40  |   if (mode !== "default") {
  41  |     await openValidFile(page, "legacy-owner.grape.json", bytes);
  42  |     if (mode === "upgraded")
  43  |       await page
  44  |         .getByRole("button", { name: "Upgrade subgraph owners", exact: true })
  45  |         .click();
  46  |     else
  47  |       await page
  48  |         .getByRole("button", { name: "Add Float", exact: true })
> 49  |         .click();
      |          ^ Error: locator.click: Test timeout of 30000ms exceeded.
  50  |   }
  51  |   await page
  52  |     .getByRole("button", { name: "Second Canvas", exact: true })
  53  |     .click();
  54  |   const before = await exportDocument(page),
  55  |     beforeUI = await replacementUIState(page);
  56  |   const review = await reviewFile(page, "legacy-owner.grape.json", bytes);
  57  |   assert.match(review.message!, /DOCUMENT_VALID/);
  58  |   assert.ok(review.details.candidate);
  59  |   const accept = page.getByRole("button", {
  60  |     name: "Accept replacement (one Undo)",
  61  |     exact: true,
  62  |   });
  63  |   if (mode !== "matching") {
  64  |     await expect(accept).toBeDisabled();
  65  |     await expect(page.locator("#replacement-message")).toContainText(
  66  |       "different module versions or output profile",
  67  |     );
  68  |     assert.deepEqual(await originalBytes(page), bytes);
  69  |     assert.deepEqual(await replacementUIState(page), beforeUI);
  70  |     await page.getByRole("button", { name: "Close", exact: true }).click();
  71  |     assert.deepEqual(await exportDocument(page), before);
  72  |     await reviewFile(page, "legacy-owner.grape.json", bytes);
  73  |     await expect(accept).toBeDisabled();
  74  |     await page
  75  |       .getByRole("button", { name: "Open in new session", exact: true })
  76  |       .click();
  77  |     await expect(page.locator("#recovery")).not.toBeVisible();
  78  |     assert.deepEqual(await exportDocument(page), JSON.parse(bytes.toString()));
  79  |     await page
  80  |       .getByRole("button", { name: "Upgrade subgraph owners", exact: true })
  81  |       .click();
  82  |     const upgraded = await exportDocument(page);
  83  |     assert.equal(upgraded.graph.resources[0].data.emissionMode, "expand");
  84  |     assert.deepEqual(
  85  |       upgraded.graph.resources[0].data.network,
  86  |       JSON.parse(bytes.toString()).graph.resources[0].data.network,
  87  |     );
  88  |     await page
  89  |       .getByRole("button", { name: "Generate GLSL", exact: true })
  90  |       .click();
  91  |     await expect(
  92  |       page.getByText("Generated successfully · Host-free GLSL"),
  93  |     ).toBeVisible();
  94  |     return {
  95  |       mode,
  96  |       before,
  97  |       beforeUI,
  98  |       review,
  99  |       originalBytesExact: true,
  100 |       refusalAtomic: true,
  101 |       recovery: "Close/retry/new-session/explicit-upgrade/generate/save-reopen",
  102 |       roundtrip: await saveReopen(page),
  103 |     };
  104 |   }
  105 |   await expect(accept).toBeEnabled();
  106 |   await expect(page.locator("#replacement-message")).toContainText(
  107 |     "Replace is available",
  108 |   );
  109 |   await accept.click();
  110 |   await expect(page.locator("#recovery")).not.toBeVisible();
  111 |   const accepted = await exportDocument(page),
  112 |     expected = JSON.parse(bytes.toString());
  113 |   expected.graph.id = before.graph.id;
  114 |   assert.deepEqual(accepted, expected);
  115 |   const afterUI = await replacementUIState(page);
  116 |   assert.deepEqual(
  117 |     afterUI.canvases.map((c) => c.panel),
  118 |     beforeUI.canvases.map((c) => c.panel),
  119 |   );
  120 |   assert.equal(
  121 |     Number(afterUI.canvases[0].revision),
  122 |     Number(beforeUI.canvases[0].revision) + 1,
  123 |   );
  124 |   await page.getByRole("button", { name: "Undo", exact: true }).click();
  125 |   assert.deepEqual(await exportDocument(page), before);
  126 |   await page.getByRole("button", { name: "Redo", exact: true }).click();
  127 |   assert.deepEqual(await exportDocument(page), accepted);
  128 |   return {
  129 |     mode,
  130 |     before,
  131 |     beforeUI,
  132 |     review,
  133 |     accepted,
  134 |     afterUI,
  135 |     oneUndoRedo: true,
  136 |   };
  137 | }
  138 | 
```