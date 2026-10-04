import fs from "node:fs";
import path from "node:path";
import { test } from "@playwright/test";
import { naturalEscapeFlow } from "./s05-escape-flow.ts";

for (const wrapper of [false, true])
  for (const exportFirst of [false, true])
    test(`S05 natural Escape cancels ${wrapper ? "wrapper" : "direct"} ${exportFirst ? "after Export" : "without Export"} drag with no History entry`, async ({
      page,
      baseURL,
    }) => {
      const evidence = process.env.GRAPE_EVIDENCE_DIR!;
      if (!evidence || !path.isAbsolute(evidence))
        throw Error("Absolute fresh evidence path required");
      const fixture = fs.readFileSync(
        new URL(
          "../../evidence/s05/drag-performance-01/fixture-14-Multiply.json",
          import.meta.url,
        ),
      );
      await naturalEscapeFlow(
        page,
        baseURL!,
        wrapper,
        exportFirst,
        fixture,
        path.join(
          evidence,
          `escape-${wrapper ? "wrapper" : "direct"}-${exportFirst ? "export" : "no-export"}.json`,
        ),
      );
    });
