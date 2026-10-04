# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05-replacement.spec.ts >> S05 Replace destination default: eligibility, recovery and exact content
- Location: production\tests\browser\s05-replacement.spec.ts:28:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  getByText('Generated successfully · Host-free GLSL')
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Generated successfully · Host-free GLSL')
    14 × locator resolved to <p>Generated successfully · Host-free GLSL</p>
       - unexpected value "hidden"

```

```yaml
- banner:
  - text: Grape SHADER WORKSPACE Development · unversioned
  - button "本輪更新"
  - navigation "Document actions":
    - button "Save"
    - button "Generate GLSL"
  - text: Unsaved changes Host-free
- button "Undo" [disabled]
- button "Redo" [disabled]
- button "Delete selected"
- alert
- main:
  - tablist "canvas-1 panels":
    - tab "Canvas · canvas-1" [selected]
    - button "Collapse active panel in canvas-1": ▾
    - button "Panel options in canvas-1": ⋯
  - img
  - group "Image output":
    - heading "Image output" [level=3]
    - button "Image output input color"
    - text: color vec4
  - group "Subgraph":
    - heading "Subgraph" [level=3]
    - button "Subgraph input Value"
    - text: Value vec4 [1,1,1,1]
    - button "Subgraph output Value"
    - text: Value vec4
  - button "Untitled shader / pixel" [disabled]
  - button "New subgraph"
  - button "Library subgraph"
  - button "Encapsulate"
  - button "Make independent"
  - button "Enter subgraph"
  - button "Arrange nodes"
  - button "Frame selection"
  - group: Local clipboard
  - group: Structures
  - button "Vertex"
  - button "Pixel" [pressed]
  - button "Add Node"
  - button "Browse nodes"
  - button "Up" [disabled]
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
  - status:
    - button "Read full application status": Export started. Saved status is unchanged.
  - button "Shader output"
  - button "Panels"
  - button "Hints"
```

# Test source

```ts
  1   | import { createNode } from "../browser/create-node.ts";
  2   | import { clickAction } from "./public-actions.ts";
  3   | import assert from "node:assert/strict";
  4   | import fs from "node:fs/promises";
  5   | import { expect, type Page } from "@playwright/test";
  6   | import {
  7   |   exportDocument,
  8   |   reviewFile,
  9   |   openValidFile,
  10  |   saveReopen,
  11  | } from "./s05-delivered-flows.ts";
  12  | 
  13  | export async function replacementUIState(page: Page) {
  14  |   return {
  15  |     undo: await page
  16  |       .getByRole("button", { name: "Undo", exact: true })
  17  |       .isEnabled(),
  18  |     redo: await page
  19  |       .getByRole("button", { name: "Redo", exact: true })
  20  |       .isEnabled(),
  21  |     dirty: await page.locator("#save-state").textContent(),
  22  |     canvases: await page
  23  |       .locator(".canvas")
  24  |       .evaluateAll((nodes) =>
  25  |         nodes.map((n) => ({ ...(n as HTMLElement).dataset })),
  26  |       ),
  27  |   };
  28  | }
  29  | export async function originalBytes(page: Page) {
  30  |   const event = page.waitForEvent("download");
  31  |   await page
  32  |     .getByRole("button", { name: "Export original", exact: true })
  33  |     .click();
  34  |   return fs.readFile((await (await event).path())!);
  35  | }
  36  | /** Public archived UI only; lifecycle IDs not exposed by the shell are asserted at Application level separately. */
  37  | export async function replacementFlow(
  38  |   page: Page,
  39  |   mode: "default" | "upgraded" | "matching",
  40  |   bytes: Buffer,
  41  | ) {
  42  |   if (mode !== "default") {
  43  |     await openValidFile(page, "legacy-owner.grape.json", bytes);
  44  |     if (mode === "upgraded") await clickAction(page, "Upgrade subgraph owners");
  45  |     else await createNode(page, "Float");
  46  |   }
  47  |   await clickAction(page, "Second Canvas");
  48  |   const before = await exportDocument(page),
  49  |     beforeUI = await replacementUIState(page);
  50  |   const review = await reviewFile(page, "legacy-owner.grape.json", bytes);
  51  |   assert.match(review.message!, /DOCUMENT_VALID/);
  52  |   assert.ok(review.details.candidate);
  53  |   const accept = page.getByRole("button", {
  54  |     name: "Accept replacement (one Undo)",
  55  |     exact: true,
  56  |   });
  57  |   if (mode !== "matching") {
  58  |     await expect(accept).toBeDisabled();
  59  |     await expect(page.locator("#replacement-message")).toContainText(
  60  |       "different module versions or output profile",
  61  |     );
  62  |     assert.deepEqual(await originalBytes(page), bytes);
  63  |     assert.deepEqual(await replacementUIState(page), beforeUI);
  64  |     await page.getByRole("button", { name: "Close", exact: true }).click();
  65  |     assert.deepEqual(await exportDocument(page), before);
  66  |     await reviewFile(page, "legacy-owner.grape.json", bytes);
  67  |     await expect(accept).toBeDisabled();
  68  |     await page
  69  |       .getByRole("button", { name: "Open in new session", exact: true })
  70  |       .click();
  71  |     await expect(page.locator("#recovery")).not.toBeVisible();
  72  |     assert.deepEqual(await exportDocument(page), JSON.parse(bytes.toString()));
  73  |     await clickAction(page, "Upgrade subgraph owners");
  74  |     const upgraded = await exportDocument(page);
  75  |     assert.equal(upgraded.graph.resources[0].data.emissionMode, "expand");
  76  |     assert.deepEqual(
  77  |       upgraded.graph.resources[0].data.network,
  78  |       JSON.parse(bytes.toString()).graph.resources[0].data.network,
  79  |     );
  80  |     await page
  81  |       .getByRole("button", { name: "Generate GLSL", exact: true })
  82  |       .click();
  83  |     await expect(
  84  |       page.getByText("Generated successfully · Host-free GLSL"),
> 85  |     ).toBeVisible();
      |       ^ Error: expect(locator).toBeVisible() failed
  86  |     return {
  87  |       mode,
  88  |       before,
  89  |       beforeUI,
  90  |       review,
  91  |       originalBytesExact: true,
  92  |       refusalAtomic: true,
  93  |       recovery: "Close/retry/new-session/explicit-upgrade/generate/save-reopen",
  94  |       roundtrip: await saveReopen(page),
  95  |     };
  96  |   }
  97  |   await expect(accept).toBeEnabled();
  98  |   await expect(page.locator("#replacement-message")).toContainText(
  99  |     "Replace is available",
  100 |   );
  101 |   await accept.click();
  102 |   await expect(page.locator("#recovery")).not.toBeVisible();
  103 |   const accepted = await exportDocument(page),
  104 |     expected = JSON.parse(bytes.toString());
  105 |   expected.graph.id = before.graph.id;
  106 |   assert.deepEqual(accepted, expected);
  107 |   const afterUI = await replacementUIState(page);
  108 |   assert.deepEqual(
  109 |     afterUI.canvases.map((c) => c.panel),
  110 |     beforeUI.canvases.map((c) => c.panel),
  111 |   );
  112 |   assert.equal(
  113 |     Number(afterUI.canvases[0].revision),
  114 |     Number(beforeUI.canvases[0].revision) + 1,
  115 |   );
  116 |   await page.getByRole("button", { name: "Undo", exact: true }).click();
  117 |   assert.deepEqual(await exportDocument(page), before);
  118 |   await page.getByRole("button", { name: "Redo", exact: true }).click();
  119 |   assert.deepEqual(await exportDocument(page), accepted);
  120 |   return {
  121 |     mode,
  122 |     before,
  123 |     beforeUI,
  124 |     review,
  125 |     accepted,
  126 |     afterUI,
  127 |     oneUndoRedo: true,
  128 |   };
  129 | }
  130 | 
```