import { mkdir, writeFile, readFile, rename, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import type { StorageAdapter } from "./contracts.ts";

// Adapter-specific I/O. Graph only knows StorageAdapter's promise contract.
export class FileStorage implements StorageAdapter {
  readonly path: string;
  constructor(path: string) {
    this.path = resolve(path);
  }
  async write(text: string): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    const temporary = this.path + "." + randomUUID() + ".tmp";
    try {
      await writeFile(temporary, text, { encoding: "utf8", flag: "wx" });
      await rename(temporary, this.path);
    } catch (error) {
      await unlink(temporary).catch(() => {});
      throw error;
    }
  }
  read(): Promise<string> {
    return readFile(this.path, "utf8");
  }
}
