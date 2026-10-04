import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { uniformCases, uniformModes } from "../fixtures/s05-uniforms.ts";
test("S05-FR-001 exact preserved reviewer document links distinct vertex and pixel resources", async ({
  page,
  browser,
}) => {
  const original = JSON.parse(
    await fs.readFile(
      "tests/fixtures/s05-review-crossstage.json",
      "utf8",
    ),
  );
  await page.goto("/");
  const result = await page.evaluate(async (document) => {
    const { functionSetup } = await import("/tests/fixtures/s05.ts"),
      { Graph } = await import("/src/model/graph.ts"),
      { compile } = await import("/src/generation/compiler.ts"),
      { functionProfile } = await import("/src/modules/function-operations.ts"),
      { executeLinkedUniforms } =
        await import("/tests/fixtures/s05-linked-webgl.ts");
    const s = functionSetup(),
      graph = new Graph(document, s.fixed, s.identity),
      before = JSON.stringify(graph.capture()),
      out = compile(graph.capture(), s.fixed, functionProfile);
    return {
      ...executeLinkedUniforms(out),
      unchanged: before === JSON.stringify(graph.capture()),
    };
  }, original.document);
  expect(result.linked).toBe(true);
  expect(result.error).toBe(0);
  expect(result.active).toHaveLength(2);
  expect(result.position).toEqual([0.25, 0.25, 0.25, 0.25]);
  expect(result.unchanged).toBe(true);
  expect(result.readback.map((b) => b.actual)).toEqual([0.25, 0.75]);
  expect(new Set(result.readback.map((b) => b.symbol)).size).toBe(2);
  await fs.writeFile(
    process.env.GRAPE_EVIDENCE_DIR +
      "/original-review-counterexample-replay.json",
    JSON.stringify(
      {
        browser: browser.version(),
        source:
          "production/evidence/s05/review-01/independent-review/cross-stage-uniform-01.json",
        originalResources: original.resources,
        result,
      },
      null,
      2,
    ),
    { flag: "wx" },
  );
});
for (const kind of uniformCases)
  for (const mode of uniformModes) {
    test(`S05-FR-001 actual linked Uniform identity ${kind} ${mode}`, async ({
      page,
      browser,
    }) => {
      await page.goto("/");
      const result = await page.evaluate(
        async ({ kind, mode }) => {
          const { linkedUniformFixture } =
              await import("/tests/fixtures/s05-uniforms.ts"),
            { executeLinkedUniforms } =
              await import("/tests/fixtures/s05-linked-webgl.ts"),
            { compile } = await import("/src/generation/compiler.ts");
          const s = linkedUniformFixture(kind, mode),
            before = JSON.stringify(s.graph.capture()),
            out = compile(s.graph.capture(), s.fixed, s.profile);
          return {
            ids: s.ids,
            expectedPosition: s.expectedPosition,
            defaultResult: executeLinkedUniforms(out),
            overrideResult: executeLinkedUniforms(out, { [s.ids[0]]: 0.125 }),
            unchanged: before === JSON.stringify(s.graph.capture()),
            document: s.graph.capture().document,
          };
        },
        { kind, mode },
      );
      expect(result.unchanged).toBe(true);
      for (const [changed, row] of [
        [false, result.defaultResult],
        [true, result.overrideResult],
      ] as const) {
        expect(row.linked).toBe(true);
        expect(row.error).toBe(0);
        expect(row.active).toHaveLength(2);
        const symbols = new Map<string, string>();
        for (const b of row.readback) {
          const expected =
            b.resourceId === result.ids[0]
              ? changed
                ? 0.125
                : 0.25
              : kind === "distinct-types"
                ? [0.75, 0.5]
                : 0.75;
          expect(b.actual).toEqual(expected);
          if (symbols.has(b.resourceId))
            expect(b.symbol).toBe(symbols.get(b.resourceId));
          symbols.set(b.resourceId, b.symbol);
        }
        expect(new Set(symbols.values()).size).toBe(2);
        expect(row.readback).toHaveLength(kind === "shared-reversed" ? 4 : 2);
        expect(row.position).toEqual(
          changed
            ? kind === "shared-reversed"
              ? [0.875, 0.875, 0.875, 0.875]
              : [0.125, 0.125, 0.125, 0.125]
            : result.expectedPosition,
        );
      }
      await fs.writeFile(
        process.env.GRAPE_EVIDENCE_DIR + `/uniform-${kind}-${mode}.json`,
        JSON.stringify(
          { browser: browser.version(), kind, mode, ...result },
          null,
          2,
        ),
        { flag: "wx" },
      );
    });
  }
