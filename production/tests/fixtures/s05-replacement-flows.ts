import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { expect, type Page } from "@playwright/test";
import {
  exportDocument,
  reviewFile,
  openValidFile,
  saveReopen,
} from "./s05-delivered-flows.ts";

export async function replacementUIState(page: Page) {
  return {
    undo: await page
      .getByRole("button", { name: "Undo", exact: true })
      .isEnabled(),
    redo: await page
      .getByRole("button", { name: "Redo", exact: true })
      .isEnabled(),
    dirty: await page.locator("#save-state").textContent(),
    canvases: await page
      .locator(".canvas")
      .evaluateAll((nodes) =>
        nodes.map((n) => ({ ...(n as HTMLElement).dataset })),
      ),
  };
}
export async function originalBytes(page: Page) {
  const event = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export original", exact: true })
    .click();
  return fs.readFile((await (await event).path())!);
}
/** Public archived UI only; lifecycle IDs not exposed by the shell are asserted at Application level separately. */
export async function replacementFlow(
  page: Page,
  mode: "default" | "upgraded" | "matching",
  bytes: Buffer,
) {
  if (mode !== "default") {
    await openValidFile(page, "legacy-owner.grape.json", bytes);
    if (mode === "upgraded")
      await page
        .getByRole("button", { name: "Upgrade subgraph owners", exact: true })
        .click();
    else
      await page
        .getByRole("button", { name: "Add Float", exact: true })
        .click();
  }
  await page
    .getByRole("button", { name: "Second Canvas", exact: true })
    .click();
  const before = await exportDocument(page),
    beforeUI = await replacementUIState(page);
  const review = await reviewFile(page, "legacy-owner.grape.json", bytes);
  assert.match(review.message!, /DOCUMENT_VALID/);
  assert.ok(review.details.candidate);
  const accept = page.getByRole("button", {
    name: "Accept replacement (one Undo)",
    exact: true,
  });
  if (mode !== "matching") {
    await expect(accept).toBeDisabled();
    await expect(page.locator("#replacement-message")).toContainText(
      "different module versions or output profile",
    );
    assert.deepEqual(await originalBytes(page), bytes);
    assert.deepEqual(await replacementUIState(page), beforeUI);
    await page.getByRole("button", { name: "Close", exact: true }).click();
    assert.deepEqual(await exportDocument(page), before);
    await reviewFile(page, "legacy-owner.grape.json", bytes);
    await expect(accept).toBeDisabled();
    await page
      .getByRole("button", { name: "Open in new session", exact: true })
      .click();
    await expect(page.locator("#recovery")).not.toBeVisible();
    assert.deepEqual(await exportDocument(page), JSON.parse(bytes.toString()));
    await page
      .getByRole("button", { name: "Upgrade subgraph owners", exact: true })
      .click();
    const upgraded = await exportDocument(page);
    assert.equal(upgraded.graph.resources[0].data.emissionMode, "expand");
    assert.deepEqual(
      upgraded.graph.resources[0].data.network,
      JSON.parse(bytes.toString()).graph.resources[0].data.network,
    );
    await page
      .getByRole("button", { name: "Generate GLSL", exact: true })
      .click();
    await expect(
      page.getByText("Generated successfully · Host-free GLSL"),
    ).toBeVisible();
    return {
      mode,
      before,
      beforeUI,
      review,
      originalBytesExact: true,
      refusalAtomic: true,
      recovery: "Close/retry/new-session/explicit-upgrade/generate/save-reopen",
      roundtrip: await saveReopen(page),
    };
  }
  await expect(accept).toBeEnabled();
  await expect(page.locator("#replacement-message")).toContainText(
    "Replace is available",
  );
  await accept.click();
  await expect(page.locator("#recovery")).not.toBeVisible();
  const accepted = await exportDocument(page),
    expected = JSON.parse(bytes.toString());
  expected.graph.id = before.graph.id;
  assert.deepEqual(accepted, expected);
  const afterUI = await replacementUIState(page);
  assert.deepEqual(
    afterUI.canvases.map((c) => c.panel),
    beforeUI.canvases.map((c) => c.panel),
  );
  assert.equal(
    Number(afterUI.canvases[0].revision),
    Number(beforeUI.canvases[0].revision) + 1,
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  assert.deepEqual(await exportDocument(page), before);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  assert.deepEqual(await exportDocument(page), accepted);
  return {
    mode,
    before,
    beforeUI,
    review,
    accepted,
    afterUI,
    oneUndoRedo: true,
  };
}
