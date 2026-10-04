# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s01.spec.ts >> AT-S01-01 browser: user creates connected shader, edits and sees generated GLSL
- Location: tests\browser\s01.spec.ts:31:1

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Open saved', exact: true })

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
    - button "Undo" [disabled] [ref=e24]
    - button "Redo" [disabled] [ref=e27]
    - button "Delete selected" [ref=e30] [cursor=pointer]
    - alert
  - main [ref=e31]:
    - generic [ref=e33]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e34]:
        - group "Image output" [ref=e35]:
          - heading "Image output" [level=3] [ref=e36]
          - generic [ref=e37]:
            - button "Image output input color" [ref=e38] [cursor=pointer]
            - generic [ref=e39]: color
            - generic [ref=e40]: vec4
            - generic "Current local value; edit in Inspector" [ref=e41]: "[0,0,0,0]"
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e42]:
          - button "New subgraph" [ref=e43] [cursor=pointer]
          - button "Library subgraph" [ref=e44] [cursor=pointer]
          - button "Encapsulate" [ref=e45] [cursor=pointer]
          - button "Make independent" [ref=e46] [cursor=pointer]
          - button "Enter subgraph" [ref=e47] [cursor=pointer]
          - button "Arrange nodes" [ref=e48] [cursor=pointer]
          - button "Frame selection" [ref=e49] [cursor=pointer]
          - group [ref=e50]:
            - generic "Local clipboard" [ref=e51] [cursor=pointer]
          - group [ref=e52]:
            - generic "Structures" [ref=e53] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e54]:
          - button "Vertex" [ref=e55] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e56] [cursor=pointer]
        - generic [ref=e57]:
          - button "Add Node" [ref=e58] [cursor=pointer]
          - button "Browse nodes" [ref=e61] [cursor=pointer]
          - button "Up" [disabled] [ref=e64]
          - button "Shortcuts" [ref=e67] [cursor=pointer]
    - complementary [ref=e70]:
      - generic [ref=e71]:
        - heading "Inspector" [level=2] [ref=e72]
        - paragraph [ref=e73]: Select a node to inspect its parameters.
  - contentinfo [ref=e74]:
    - button "Project actions" [ref=e75] [cursor=pointer]
    - status [ref=e76]:
      - button "Read full application status" [disabled] [ref=e77]
    - button "Shader output" [ref=e78] [cursor=pointer]
    - button "Hints" [ref=e79] [cursor=pointer]
```

# Test source

```ts
  1  | import { expect, type Page } from "@playwright/test";
  2  | /** Re-execute inherited UI contracts against their unchanged exact definitions.
  3  |  * The S04 suite separately exercises the new GraphKind and output policy. */
  4  | export async function openLegacyDocument(page: Page) {
  5  |   await page.evaluate(async () => {
  6  |     const { setup } = await import("/tests/fixtures/setup.ts"),
  7  |       { BrowserStorage } = await import("/src/adapters/browser/storage.ts");
  8  |     const document = structuredClone(setup().graph.capture().document);
  9  |     document.formatVersion.minor = 0;
  10 |     await new BrowserStorage().write(
  11 |       "s04-legacy-fixture",
  12 |       JSON.stringify(document),
  13 |     );
  14 |   });
> 15 |   await page.getByRole("button", { name: "Open saved", exact: true }).click();
     |                                                                       ^ Error: locator.click: Test timeout of 30000ms exceeded.
  16 |   page.once("dialog", (dialog) => dialog.accept());
  17 |   await page.locator("#saved-list button").click();
  18 |   await expect(page.locator("#open-dialog")).not.toBeVisible();
  19 |   await page.evaluate(
  20 |     () =>
  21 |       new Promise<void>((resolve, reject) => {
  22 |         const request = indexedDB.open("grape-documents-v2", 1);
  23 |         request.onerror = () => reject(request.error);
  24 |         request.onsuccess = () => {
  25 |           const db = request.result,
  26 |             tx = db.transaction("documents", "readwrite");
  27 |           tx.objectStore("documents").delete("s04-legacy-fixture");
  28 |           tx.oncomplete = () => {
  29 |             db.close();
  30 |             resolve();
  31 |           };
  32 |           tx.onabort = () => {
  33 |             db.close();
  34 |             reject(tx.error);
  35 |           };
  36 |         };
  37 |       }),
  38 |   );
  39 | }
  40 | 
```