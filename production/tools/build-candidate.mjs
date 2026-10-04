import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
const [outDir, metadataFile] = process.argv.slice(2);
if (
  !outDir ||
  !metadataFile ||
  !path.isAbsolute(outDir) ||
  !path.isAbsolute(metadataFile)
)
  throw Error("Absolute output and metadata paths required");
const metadata = JSON.parse(fs.readFileSync(metadataFile, "utf8"));
if (
  !/^[a-f0-9]{40}$/.test(metadata.implementationI) ||
  !/^S06-debug-[a-f0-9]{7}$/.test(metadata.buildId) ||
  !metadata.buildId.endsWith(metadata.implementationI.slice(0, 7))
)
  throw Error("Invalid candidate identity");
if (fs.existsSync(outDir)) throw Error("Fresh output directory required");
await build({
  root: path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  build: { outDir, emptyOutDir: false },
  define: { __GRAPE_BUILD__: JSON.stringify(metadata) },
});
