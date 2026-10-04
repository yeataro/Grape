# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05-delivered.spec.ts >> S05-OWNER-001 delivered public flow shared-expand.grape.json
- Location: ..\..\..\production\tests\browser\s05-delivered.spec.ts:44:3

# Error details

```
Error: Command failed: C:\Program Files\nodejs\node.exe --experimental-transform-types tools/s05-samples.ts C:\Users\user\source\Grape\production\evidence\s06\workspace-entry-01\browser-affected-01\delivered-samples
node:internal/modules/cjs/loader:1450
  throw err;
  ^

Error: Cannot find module 'C:\Users\user\source\Grape\.verification\s06-workspace-entry-01\runtime\tools\s05-samples.ts'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1447:15)
    at defaultResolveImpl (node:internal/modules/cjs/loader:1058:19)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1063:22)
    at Module._load (node:internal/modules/cjs/loader:1233:25)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:245:24)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v25.5.0

```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import fs from "node:fs";
  3   | import path from "node:path";
  4   | import { execFileSync } from "node:child_process";
  5   | import { createHash } from "node:crypto";
  6   | import {
  7   |   deliveredNames,
  8   |   deliveredFlow,
  9   |   exportDocument,
  10  |   openValidFile,
  11  |   reviewFile,
  12  |   saveReopen,
  13  | } from "../fixtures/s05-delivered-flows.ts";
  14  | const evidence = process.env.GRAPE_EVIDENCE_DIR!;
  15  | const samples = path.join(evidence, "delivered-samples");
  16  | test.beforeAll(() => {
  17  |   if (!fs.existsSync(samples)) {
> 18  |     const log = execFileSync(
      |                 ^ Error: Command failed: C:\Program Files\nodejs\node.exe --experimental-transform-types tools/s05-samples.ts C:\Users\user\source\Grape\production\evidence\s06\workspace-entry-01\browser-affected-01\delivered-samples
  19  |       process.execPath,
  20  |       ["--experimental-transform-types", "tools/s05-samples.ts", samples],
  21  |       { encoding: "utf8" },
  22  |     );
  23  |     fs.writeFileSync(path.join(evidence, "sample-producer.log"), log, {
  24  |       flag: "wx",
  25  |     });
  26  |   }
  27  |   const entries = JSON.parse(
  28  |     fs.readFileSync(path.join(samples, "manifest.json"), "utf8"),
  29  |   ).entries;
  30  |   expect(entries.map((r: any) => r.file).sort()).toEqual(
  31  |     [...deliveredNames].sort(),
  32  |   );
  33  |   for (const row of entries)
  34  |     expect(
  35  |       createHash("sha256")
  36  |         .update(fs.readFileSync(path.join(samples, row.file)))
  37  |         .digest("hex"),
  38  |     ).toBe(row.sha256);
  39  | });
  40  | test.beforeEach(({ page }) => {
  41  |   page.on("dialog", (d) => d.accept());
  42  | });
  43  | for (const name of deliveredNames)
  44  |   test(`S05-OWNER-001 delivered public flow ${name}`, async ({
  45  |     page,
  46  |     browser,
  47  |   }) => {
  48  |     await page.goto("/");
  49  |     const result = await deliveredFlow(
  50  |       page,
  51  |       name,
  52  |       fs.readFileSync(path.join(samples, name)),
  53  |       fs.readFileSync(path.join(samples, "shared-expand.grape.json")),
  54  |     );
  55  |     await fs.promises.writeFile(
  56  |       path.join(evidence, "delivered-" + name),
  57  |       JSON.stringify({ browser: browser.version(), ...result }, null, 2),
  58  |       { flag: "wx" },
  59  |     );
  60  |   });
  61  | test("S05-OWNER-001 exact owner and malformed admission stay strict; original error draft opens only explicitly", async ({
  62  |   page,
  63  | }) => {
  64  |   await page.goto("/");
  65  |   const valid = fs.readFileSync(
  66  |     path.join(samples, "shared-function.grape.json"),
  67  |   );
  68  |   await openValidFile(page, "valid.grape.json", valid);
  69  |   const before = await exportDocument(page),
  70  |     records = [];
  71  |   for (const kind of [
  72  |     "duplicate-pin",
  73  |     "undeclared-pin",
  74  |     "missing-owner",
  75  |     "missing-mode",
  76  |     "unknown-mode",
  77  |     "missing-dependency",
  78  |   ]) {
  79  |     const doc = JSON.parse(valid.toString()),
  80  |       resource = doc.graph.resources.find((r: any) => r.data.emissionMode);
  81  |     if (kind === "duplicate-pin")
  82  |       doc.graph.modules.push({ ...doc.graph.modules[0] });
  83  |     if (kind === "undeclared-pin" || kind === "missing-owner") {
  84  |       resource.type.fingerprint = "unavailable-exact-owner";
  85  |       if (kind === "missing-owner") {
  86  |         const { typeId, ...pin } = resource.type;
  87  |         doc.graph.modules.push(pin);
  88  |       }
  89  |     }
  90  |     if (kind === "missing-mode") delete resource.data.emissionMode;
  91  |     if (kind === "unknown-mode") resource.data.emissionMode = "guess";
  92  |     if (kind === "missing-dependency") doc.graph.resources = [];
  93  |     const raw = Buffer.from(JSON.stringify(doc)),
  94  |       review = await reviewFile(page, kind + ".json", raw);
  95  |     expect(review.details.candidate).toBeNull();
  96  |     await expect(
  97  |       page.getByRole("button", {
  98  |         name: "Accept replacement (one Undo)",
  99  |         exact: true,
  100 |       }),
  101 |     ).not.toBeVisible();
  102 |     if (["duplicate-pin", "undeclared-pin"].includes(kind))
  103 |       await expect(
  104 |         page.getByRole("button", { name: "Open in new session", exact: true }),
  105 |       ).not.toBeVisible();
  106 |     if (kind.includes("mode"))
  107 |       expect(JSON.stringify(review)).toContain("NETWORK_EMISSION_MODE");
  108 |     if (kind === "missing-owner")
  109 |       expect(JSON.stringify(review)).toContain("MISSING_MODULE");
  110 |     const download = page.waitForEvent("download");
  111 |     await page
  112 |       .getByRole("button", { name: "Export original", exact: true })
  113 |       .click();
  114 |     expect(fs.readFileSync((await (await download).path())!)).toEqual(raw);
  115 |     await page.getByRole("button", { name: "Close", exact: true }).click();
  116 |     expect(await exportDocument(page)).toEqual(before);
  117 |     await expect(
  118 |       page.getByRole("button", { name: "Undo", exact: true }),
```