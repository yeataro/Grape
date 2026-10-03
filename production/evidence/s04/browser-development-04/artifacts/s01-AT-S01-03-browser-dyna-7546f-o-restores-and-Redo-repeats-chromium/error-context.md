# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s01.spec.ts >> AT-S01-03 browser: dynamic shape errors are visible, Undo restores and Redo repeats
- Location: tests\browser\s01.spec.ts:56:1

# Error details

```
Error: expect(locator).not.toBeVisible() failed

Locator:  locator('#open-dialog')
Expected: not visible
Received: visible
Timeout:  5000ms

Call log:
  - Expect "not toBeVisible" with timeout 5000ms
  - waiting for locator('#open-dialog')
    14 × locator resolved to <dialog open="" id="open-dialog">…</dialog>
       - unexpected value "visible"

```

```yaml
- dialog:
  - heading "Open saved document" [level=2]
  - button "Untitled shader"
  - button "Cancel"
```

# Test source

```ts
  1  | import { expect, type Page } from "@playwright/test";
  2  | /** Re-execute inherited UI contracts against their unchanged exact definitions.
  3  |  * The S04 suite separately exercises the new GraphKind and output policy. */
  4  | export async function openLegacyDocument(page:Page){
  5  |   await page.evaluate(async()=>{
  6  |     const {setup}=await import("/tests/fixtures/setup.ts"),{BrowserStorage}=await import("/src/adapters/browser/storage.ts");
  7  |     const document=structuredClone(setup().graph.capture().document);document.formatVersion.minor=0;
  8  |     await new BrowserStorage().write("s04-legacy-fixture",JSON.stringify(document));
  9  |   });
  10 |   await page.getByRole("button",{name:"Open saved",exact:true}).click();
  11 |   await page.locator("#saved-list button").click();
> 12 |   await expect(page.locator("#open-dialog")).not.toBeVisible();
     |                                                  ^ Error: expect(locator).not.toBeVisible() failed
  13 |   await page.evaluate(()=>new Promise<void>((resolve,reject)=>{
  14 |     const request=indexedDB.open("grape-documents-v2",1);request.onerror=()=>reject(request.error);request.onsuccess=()=>{const db=request.result,tx=db.transaction("documents","readwrite");tx.objectStore("documents").delete("s04-legacy-fixture");tx.oncomplete=()=>{db.close();resolve();};tx.onabort=()=>{db.close();reject(tx.error);};};
  15 |   }));
  16 | }
  17 | 
```