import type { StorageAdapter, DocumentOutput } from "../../sdk/editing.ts";
export class BrowserStorage implements StorageAdapter {
  constructor(private readonly name = "grape-documents-v2") {}
  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const r = indexedDB.open(this.name, 1);
      r.onupgradeneeded = () =>
        r.result.createObjectStore("documents", { keyPath: "key" });
      r.onerror = () => reject(r.error);
      r.onsuccess = () => resolve(r.result);
      r.onblocked = () => reject(Error("STORAGE_BLOCKED"));
    });
  }
  async write(key: string, text: string): Promise<void> {
    const db = await this.open();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction("documents", "readwrite");
        transaction
          .objectStore("documents")
          .put({ key, text, name: JSON.parse(text).graph.name });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () =>
          reject(transaction.error ?? Error("STORAGE_ABORTED"));
      });
    } finally {
      db.close();
    }
  }
  async read(key: string): Promise<string> {
    const db = await this.open();
    try {
      return await new Promise((resolve, reject) => {
        const r = db
          .transaction("documents", "readonly")
          .objectStore("documents")
          .get(key);
        r.onsuccess = () =>
          r.result
            ? resolve(r.result.text)
            : reject(Error("DOCUMENT_NOT_FOUND"));
        r.onerror = () => reject(r.error);
      });
    } finally {
      db.close();
    }
  }
  async list(): Promise<readonly { key: string; name: string }[]> {
    const db = await this.open();
    try {
      return await new Promise((resolve, reject) => {
        const r = db
          .transaction("documents", "readonly")
          .objectStore("documents")
          .getAll();
        r.onsuccess = () =>
          resolve(
            r.result.map(({ key, name }: { key: string; name: string }) => ({
              key,
              name,
            })),
          );
        r.onerror = () => reject(r.error);
      });
    } finally {
      db.close();
    }
  }
}
export async function downloadBytes(
  name: string,
  data: string | ArrayBuffer | Blob,
): Promise<void> {
  const url = URL.createObjectURL(
    new Blob([data], {
      type:
        typeof data === "string"
          ? "application/json"
          : "application/octet-stream",
    }),
  );
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
export const browserOutput: DocumentOutput = {
  download: downloadBytes,
};
