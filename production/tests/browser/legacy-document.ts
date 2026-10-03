import { expect, type Page } from "@playwright/test";
/** Re-execute inherited UI contracts against their unchanged exact definitions.
 * The S04 suite separately exercises the new GraphKind and output policy. */
export async function openLegacyDocument(page: Page) {
  await page.evaluate(async () => {
    const { setup } = await import("/tests/fixtures/setup.ts"),
      { BrowserStorage } = await import("/src/adapters/browser/storage.ts");
    const document = structuredClone(setup().graph.capture().document);
    document.formatVersion.minor = 0;
    await new BrowserStorage().write(
      "s04-legacy-fixture",
      JSON.stringify(document),
    );
  });
  await page.getByRole("button", { name: "Open saved", exact: true }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#saved-list button").click();
  await expect(page.locator("#open-dialog")).not.toBeVisible();
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("grape-documents-v2", 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result,
            tx = db.transaction("documents", "readwrite");
          tx.objectStore("documents").delete("s04-legacy-fixture");
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onabort = () => {
            db.close();
            reject(tx.error);
          };
        };
      }),
  );
}
