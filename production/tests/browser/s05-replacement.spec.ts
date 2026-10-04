import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { flow } from "../fixtures/setup.ts";
import {
  exportDocument,
  openValidFile,
  reviewFile,
} from "../fixtures/s05-delivered-flows.ts";
import {
  replacementFlow,
  replacementUIState,
  originalBytes,
} from "../fixtures/s05-replacement-flows.ts";

const evidence = process.env.GRAPE_EVIDENCE_DIR!;
const sample = await fs.readFile(
  new URL(
    "../../evidence/s05/repair-02/samples/legacy-owner.grape.json",
    import.meta.url,
  ),
);
test.beforeEach(async ({ page }) => {
  page.on("dialog", (d) => void d.accept());
  await page.goto("/");
});
for (const mode of ["default", "upgraded", "matching"] as const)
  test(`S05 Replace destination ${mode}: eligibility, recovery and exact content`, async ({
    page,
  }) => {
    const result = await replacementFlow(page, mode, sample);
    await fs.writeFile(
      `${evidence}/replacement-${mode}.json`,
      JSON.stringify(result, null, 2),
    );
    await page.screenshot({
      path: `${evidence}/replacement-${mode}.png`,
      fullPage: true,
    });
  });
test("S05 Replace separates kind-only mismatch, preserves original and rechecks stale review", async ({
  page,
}) => {
  await openValidFile(page, "legacy-owner.grape.json", sample);
  const before = await exportDocument(page),
    beforeUI = await replacementUIState(page);
  const other = structuredClone(flow().graph.capture().document);
  other.graph.modules = structuredClone(before.graph.modules);
  assert.notDeepEqual(other.graph.kind, before.graph.kind);
  const bytes = Buffer.from(JSON.stringify(other));
  const review = await reviewFile(page, "other-profile.grape.json", bytes);
  assert.match(review.message!, /DOCUMENT_VALID/);
  await expect(
    page.getByRole("button", {
      name: "Accept replacement (one Undo)",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(page.locator("#replacement-message")).toContainText(
    "different module versions or output profile",
  );
  assert.deepEqual(await originalBytes(page), bytes);
  assert.deepEqual(await replacementUIState(page), beforeUI);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  assert.deepEqual(await exportDocument(page), before);
  await reviewFile(page, "legacy-owner.grape.json", sample);
  await expect(
    page.getByRole("button", {
      name: "Accept replacement (one Undo)",
      exact: true,
    }),
  ).toBeEnabled();
  // A second view issues an existing public command while the first view reviews.
  await page
    .getByRole("button", { name: "New subgraph", exact: true })
    .evaluate((b: HTMLButtonElement) => b.click());
  await expect(
    page.getByRole("button", {
      name: "Accept replacement (one Undo)",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(page.locator("#replacement-message")).toContainText(
    "IMPORT_STALE",
  );
  const staleUI = await replacementUIState(page);
  assert.deepEqual(await originalBytes(page), sample);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  const afterStale = await exportDocument(page);
  await reviewFile(page, "invalid.json", Buffer.from("{broken"));
  await expect(
    page.getByRole("button", {
      name: "Accept replacement (one Undo)",
      exact: true,
    }),
  ).not.toBeVisible();
  assert.deepEqual(await originalBytes(page), Buffer.from("{broken"));
  await page.getByRole("button", { name: "Close", exact: true }).click();
  assert.deepEqual(await exportDocument(page), afterStale);
  assert.deepEqual(await replacementUIState(page), staleUI);
  await fs.writeFile(
    `${evidence}/replacement-kind-stale-invalid.json`,
    JSON.stringify(
      { before, beforeUI, other, review, afterStale, staleUI },
      null,
      2,
    ),
  );
});
