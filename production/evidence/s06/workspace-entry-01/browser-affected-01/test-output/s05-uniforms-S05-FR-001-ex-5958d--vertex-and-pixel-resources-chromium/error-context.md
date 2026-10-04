# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05-uniforms.spec.ts >> S05-FR-001 exact preserved reviewer document links distinct vertex and pixel resources
- Location: ..\..\..\production\tests\browser\s05-uniforms.spec.ts:4:1

# Error details

```
Error: ENOENT: no such file or directory, open 'C:\Users\user\source\Grape\.verification\s06-workspace-entry-01\runtime\tests\fixtures\s05-review-crossstage.json'
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import fs from "node:fs/promises";
  3   | import { uniformCases, uniformModes } from "../fixtures/s05-uniforms.ts";
  4   | test("S05-FR-001 exact preserved reviewer document links distinct vertex and pixel resources", async ({
  5   |   page,
  6   |   browser,
  7   | }) => {
  8   |   const original = JSON.parse(
> 9   |     await fs.readFile(
      |     ^ Error: ENOENT: no such file or directory, open 'C:\Users\user\source\Grape\.verification\s06-workspace-entry-01\runtime\tests\fixtures\s05-review-crossstage.json'
  10  |       "tests/fixtures/s05-review-crossstage.json",
  11  |       "utf8",
  12  |     ),
  13  |   );
  14  |   await page.goto("/");
  15  |   const result = await page.evaluate(async (document) => {
  16  |     const { functionSetup } = await import("/tests/fixtures/s05.ts"),
  17  |       { Graph } = await import("/src/model/graph.ts"),
  18  |       { compile } = await import("/src/generation/compiler.ts"),
  19  |       { functionProfile } = await import("/src/modules/function-operations.ts"),
  20  |       { executeLinkedUniforms } =
  21  |         await import("/tests/fixtures/s05-linked-webgl.ts");
  22  |     const s = functionSetup(),
  23  |       graph = new Graph(document, s.fixed, s.identity),
  24  |       before = JSON.stringify(graph.capture()),
  25  |       out = compile(graph.capture(), s.fixed, functionProfile);
  26  |     return {
  27  |       ...executeLinkedUniforms(out),
  28  |       unchanged: before === JSON.stringify(graph.capture()),
  29  |     };
  30  |   }, original.document);
  31  |   expect(result.linked).toBe(true);
  32  |   expect(result.error).toBe(0);
  33  |   expect(result.active).toHaveLength(2);
  34  |   expect(result.position).toEqual([0.25, 0.25, 0.25, 0.25]);
  35  |   expect(result.unchanged).toBe(true);
  36  |   expect(result.readback.map((b) => b.actual)).toEqual([0.25, 0.75]);
  37  |   expect(new Set(result.readback.map((b) => b.symbol)).size).toBe(2);
  38  |   await fs.writeFile(
  39  |     process.env.GRAPE_EVIDENCE_DIR +
  40  |       "/original-review-counterexample-replay.json",
  41  |     JSON.stringify(
  42  |       {
  43  |         browser: browser.version(),
  44  |         source:
  45  |           "production/evidence/s05/review-01/independent-review/cross-stage-uniform-01.json",
  46  |         originalResources: original.resources,
  47  |         result,
  48  |       },
  49  |       null,
  50  |       2,
  51  |     ),
  52  |     { flag: "wx" },
  53  |   );
  54  | });
  55  | for (const kind of uniformCases)
  56  |   for (const mode of uniformModes) {
  57  |     test(`S05-FR-001 actual linked Uniform identity ${kind} ${mode}`, async ({
  58  |       page,
  59  |       browser,
  60  |     }) => {
  61  |       await page.goto("/");
  62  |       const result = await page.evaluate(
  63  |         async ({ kind, mode }) => {
  64  |           const { linkedUniformFixture } =
  65  |               await import("/tests/fixtures/s05-uniforms.ts"),
  66  |             { executeLinkedUniforms } =
  67  |               await import("/tests/fixtures/s05-linked-webgl.ts"),
  68  |             { compile } = await import("/src/generation/compiler.ts");
  69  |           const s = linkedUniformFixture(kind, mode),
  70  |             before = JSON.stringify(s.graph.capture()),
  71  |             out = compile(s.graph.capture(), s.fixed, s.profile);
  72  |           return {
  73  |             ids: s.ids,
  74  |             expectedPosition: s.expectedPosition,
  75  |             defaultResult: executeLinkedUniforms(out),
  76  |             overrideResult: executeLinkedUniforms(out, { [s.ids[0]]: 0.125 }),
  77  |             unchanged: before === JSON.stringify(s.graph.capture()),
  78  |             document: s.graph.capture().document,
  79  |           };
  80  |         },
  81  |         { kind, mode },
  82  |       );
  83  |       expect(result.unchanged).toBe(true);
  84  |       for (const [changed, row] of [
  85  |         [false, result.defaultResult],
  86  |         [true, result.overrideResult],
  87  |       ] as const) {
  88  |         expect(row.linked).toBe(true);
  89  |         expect(row.error).toBe(0);
  90  |         expect(row.active).toHaveLength(2);
  91  |         const symbols = new Map<string, string>();
  92  |         for (const b of row.readback) {
  93  |           const expected =
  94  |             b.resourceId === result.ids[0]
  95  |               ? changed
  96  |                 ? 0.125
  97  |                 : 0.25
  98  |               : kind === "distinct-types"
  99  |                 ? [0.75, 0.5]
  100 |                 : 0.75;
  101 |           expect(b.actual).toEqual(expected);
  102 |           if (symbols.has(b.resourceId))
  103 |             expect(b.symbol).toBe(symbols.get(b.resourceId));
  104 |           symbols.set(b.resourceId, b.symbol);
  105 |         }
  106 |         expect(new Set(symbols.values()).size).toBe(2);
  107 |         expect(row.readback).toHaveLength(kind === "shared-reversed" ? 4 : 2);
  108 |         expect(row.position).toEqual(
  109 |           changed
```