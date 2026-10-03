import type { LibraryStore, LibraryFile } from "../../sdk/library.ts";
import { demand } from "../../sdk/kernel.ts";
/** IndexedDB transactions provide collection-level create-if-absent and quotas.
 * This is browser-origin storage, not native filesystem directory access. */
export class BrowserLibraryStore implements LibraryStore {
  readonly scope = "grape.personal.browser-origin.v1";
  constructor(private readonly database = "grape-personal-v1") {}
  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.database, 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore("files", { keyPath: "key" });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(Error("PERSONAL_STORAGE_BLOCKED"));
    });
  }
  async list(): Promise<LibraryFile[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readonly"),
        request = tx.objectStore("files").getAll();
      tx.oncomplete = () => {
        db.close();
        resolve(
          request.result.map(
            ({ name, text }: { name: string; text: string }) => ({
              name,
              text,
              kind: "file",
              scope: this.scope,
            }),
          ),
        );
      };
      tx.onabort = () => {
        db.close();
        reject(tx.error ?? Error("PERSONAL_STORAGE_ABORTED"));
      };
    });
  }
  async publish(name: string, text: string): Promise<"created" | "exists"> {
    demand(
      !/[\\/]/.test(name) &&
        name.toLowerCase().endsWith(".sgrape-function.json"),
      "PERSONAL_SCOPE",
    );
    const size = new TextEncoder().encode(text).length;
    demand(size <= 256000, "PERSONAL_SIZE");
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readwrite"),
        store = tx.objectStore("files"),
        request = store.getAll();
      let result: "created" | "exists" = "exists",
        problem: unknown;
      request.onsuccess = () => {
        try {
          const records = request.result as {
            key: string;
            name: string;
            text: string;
          }[];
          if (records.some((r) => r.key === name.toLowerCase())) return;
          demand(records.length < 64, "PERSONAL_FILE_LIMIT");
          demand(
            records.reduce(
              (n, r) => n + new TextEncoder().encode(r.text).length,
              0,
            ) +
              size <=
              4000000,
            "PERSONAL_TOTAL_SIZE",
          );
          store.add({ key: name.toLowerCase(), name, text });
          result = "created";
        } catch (e) {
          problem = e;
          tx.abort();
        }
      };
      tx.oncomplete = () => {
        db.close();
        resolve(result);
      };
      tx.onabort = () => {
        db.close();
        reject(problem ?? tx.error ?? Error("PERSONAL_STORAGE_ABORTED"));
      };
    });
  }
}
