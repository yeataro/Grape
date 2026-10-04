# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05-escape-focus.spec.ts >> S05 natural Escape cancels direct without Export drag with no History entry
- Location: ..\runtime\production\tests\browser\s05-escape-focus.spec.ts:8:5

# Error details

```
Error: ENOENT: no such file or directory, open 'C:\Users\user\.codex\worktrees\s06-debug-hover-review-01\Grape\.verification\s06-debug-hover-review-01\runtime\production\evidence\s05\drag-performance-01\fixture-14-Multiply.json'
```

# Test source

```ts
  1  | import fs from "node:fs";
  2  | import path from "node:path";
  3  | import { test } from "@playwright/test";
  4  | import { naturalEscapeFlow } from "./s05-escape-flow.ts";
  5  | 
  6  | for (const wrapper of [false, true])
  7  |   for (const exportFirst of [false, true])
  8  |     test(`S05 natural Escape cancels ${wrapper ? "wrapper" : "direct"} ${exportFirst ? "after Export" : "without Export"} drag with no History entry`, async ({
  9  |       page,
  10 |       baseURL,
  11 |     }) => {
  12 |       const evidence = process.env.GRAPE_EVIDENCE_DIR!;
  13 |       if (!evidence || !path.isAbsolute(evidence))
  14 |         throw Error("Absolute fresh evidence path required");
> 15 |       const fixture = fs.readFileSync(
     |                          ^ Error: ENOENT: no such file or directory, open 'C:\Users\user\.codex\worktrees\s06-debug-hover-review-01\Grape\.verification\s06-debug-hover-review-01\runtime\production\evidence\s05\drag-performance-01\fixture-14-Multiply.json'
  16 |         new URL(
  17 |           "../../evidence/s05/drag-performance-01/fixture-14-Multiply.json",
  18 |           import.meta.url,
  19 |         ),
  20 |       );
  21 |       await naturalEscapeFlow(
  22 |         page,
  23 |         baseURL!,
  24 |         wrapper,
  25 |         exportFirst,
  26 |         fixture,
  27 |         path.join(
  28 |           evidence,
  29 |           `escape-${wrapper ? "wrapper" : "direct"}-${exportFirst ? "export" : "no-export"}.json`,
  30 |         ),
  31 |       );
  32 |     });
  33 | 
```