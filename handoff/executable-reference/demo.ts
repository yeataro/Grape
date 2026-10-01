import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { exercise } from "./scenario.ts";
import { FileStorage } from "./storage.ts";

const output = new URL("./demo-output/", import.meta.url);
await mkdir(output, { recursive: true });
const result = await exercise(
  new FileStorage(fileURLToPath(new URL("graph.json", output))),
);
await Promise.all([
  writeFile(new URL("vertex.glsl", output), result.shader.vertex),
  writeFile(new URL("pixel.glsl", output), result.shader.pixel),
  writeFile(new URL("invalid-graph.json", output), result.invalid),
  writeFile(new URL("missing-module-preserved.json", output), result.preserved),
  writeFile(
    new URL("trace.json", output),
    JSON.stringify(
      { steps: result.trace, expectedPixel: result.expectedPixel },
      null,
      2,
    ) + "\n",
  ),
]);
console.log(
  JSON.stringify(
    {
      status: "completed",
      steps: result.trace.length,
      output: fileURLToPath(output),
      expectedPixel: result.expectedPixel,
    },
    null,
    2,
  ),
);
