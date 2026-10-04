import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { expect, type Page } from "@playwright/test";

export const deliveredNames = [
  "shared-expand.grape.json",
  "shared-function.grape.json",
  "shared-function.personal.json",
  "nested-function.grape.json",
  "uniform-function.grape.json",
  "constant-detach.grape.json",
  "activation-rejected.grape.json",
  "shape-array.grape.json",
  "shape-nominal.grape.json",
  "pixel-effects.grape.json",
  "vertex-pixel.grape.json",
  "legacy-owner.grape.json",
  "cross-stage-uniform-distinct.grape.json",
  "cross-stage-uniform-shared-reversed.grape.json",
] as const;
export async function exportDocument(page: Page) {
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  return JSON.parse(
    await fs.readFile((await (await download).path())!, "utf8"),
  );
}
export async function reviewFile(page: Page, name: string, bytes: Buffer) {
  await page.getByLabel("Open document file").setInputFiles({
    name,
    mimeType: "application/json",
    buffer: bytes,
  });
  await expect(page.locator("#recovery-message")).not.toContainText(
    "READING_INPUT",
  );
  await expect(page.locator("#recovery pre").first()).not.toBeEmpty();
  return {
    message: await page.locator("#recovery-message").textContent(),
    details: JSON.parse(
      (await page.locator("#recovery pre").first().textContent())!,
    ),
  };
}
export async function openValidFile(page: Page, name: string, bytes: Buffer) {
  const review = await reviewFile(page, name, bytes);
  assert.match(review.message!, /DOCUMENT_VALID/);
  assert.ok(review.details.candidate);
  assert.equal(
    review.details.diagnostics.some((d: any) => d.severity === "error"),
    false,
  );
  await page
    .getByRole("button", { name: "Open in new session", exact: true })
    .click();
  await expect(page.locator("#recovery")).not.toBeVisible();
  assert.deepEqual(await exportDocument(page), JSON.parse(bytes.toString()));
  return review;
}
async function enter(page: Page, name: string, last = false) {
  const canvas = page.locator(".canvas").first();
  const headings = canvas.getByRole("heading", { name, exact: true });
  await (last ? headings.last() : headings.first()).click();
  await canvas
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  await canvas.getByText("Subgraph interface", { exact: true }).click();
  return canvas;
}
export async function saveReopen(page: Page) {
  const before = await exportDocument(page);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#save-state")).toHaveText("Saved");
  await page.reload();
  await page.getByRole("button", { name: "Open saved", exact: true }).click();
  await page.locator("#saved-list button").first().click();
  const after = await exportDocument(page);
  assert.deepEqual(after, before);
  return { before, after };
}
/** Uses only visible controls, file inputs and exported bytes; usable on an archive. */
export async function deliveredFlow(
  page: Page,
  name: string,
  bytes: Buffer,
  validSeed: Buffer,
) {
  const actions: string[] = [];
  let review: unknown,
    upgrade: unknown = null;
  if (name.endsWith(".personal.json")) {
    review = await openValidFile(page, "seed.grape.json", validSeed);
    await page
      .getByRole("button", { name: "Personal Library", exact: true })
      .click();
    await page
      .getByLabel("Import Personal package")
      .setInputFiles({ name, mimeType: "application/json", buffer: bytes });
    await expect(page.locator("[data-personal-file]")).toHaveCount(1);
    const download = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Export Shared arithmetic", exact: true })
      .click();
    const exported = await fs.readFile(
      (await (await download).path())!,
      "utf8",
    );
    assert.deepEqual(JSON.parse(exported), JSON.parse(bytes.toString()));
    await page
      .getByRole("button", { name: "Insert Shared arithmetic", exact: true })
      .click();
    const canvas = await enter(page, "Shared arithmetic", true);
    await expect(canvas.getByLabel("Subgraph emission mode")).toHaveValue(
      "function",
    );
    await canvas.getByLabel("Subgraph emission mode").selectOption("expand");
    actions.push(
      "public Personal import/export/insert",
      "retained function then localized Expand",
    );
  } else {
    review = await openValidFile(page, name, bytes);
    if (name === "legacy-owner.grape.json") {
      const before = await exportDocument(page);
      let canvas = await enter(page, "Subgraph");
      await expect(canvas.getByLabel("Subgraph emission mode")).toBeDisabled();
      await page
        .getByRole("button", { name: "Upgrade subgraph owners", exact: true })
        .click();
      const after = await exportDocument(page);
      const expected = structuredClone(before);
      expected.graph.resources.forEach((r: any) => {
        const actual = after.graph.resources.find((a: any) => a.id === r.id);
        assert.equal(actual.data.emissionMode, "expand");
        r.type = actual.type;
        r.data.emissionMode = "expand";
      });
      assert.ok(after.graph.modules.length > before.graph.modules.length);
      for (const pin of before.graph.modules)
        assert.ok(
          after.graph.modules.some(
            (p: any) => JSON.stringify(p) === JSON.stringify(pin),
          ),
        );
      expected.graph.modules = after.graph.modules;
      assert.deepEqual(after, expected);
      canvas = await enter(page, "Subgraph");
      await expect(canvas.getByLabel("Subgraph emission mode")).toBeEnabled();
      await expect(canvas.getByLabel("Subgraph emission mode")).toHaveValue(
        "expand",
      );
      upgrade = {
        before,
        after,
        preservedBodyInterfaceOriginDependenciesReferencesAndOldPins: true,
      };
      actions.push(
        "explicit old owner upgrade",
        "Expand with full authored-data preservation",
      );
    } else if (
      [
        "shared-expand.grape.json",
        "constant-detach.grape.json",
        "activation-rejected.grape.json",
      ].includes(name)
    ) {
      const before = await exportDocument(page),
        canvas = await enter(page, "Shared arithmetic");
      await canvas
        .getByLabel("Subgraph emission mode")
        .selectOption("function");
      if (name === "activation-rejected.grape.json") {
        await expect(canvas.locator(".canvas-notice")).toContainText(
          "CONSTANT_REQUIRED",
        );
        await expect(canvas.getByLabel("Subgraph emission mode")).toHaveValue(
          "expand",
        );
        assert.deepEqual(await exportDocument(page), before);
        await expect(
          page.getByRole("button", { name: "Undo", exact: true }),
        ).toBeDisabled();
        actions.push("invalid activation rejected atomically");
      } else {
        const changed = await exportDocument(page);
        if (name === "constant-detach.grape.json") {
          assert.equal(
            changed.graph.losses.at(-1).code,
            "FUNCTION_CONSTANT_DETACHED",
          );
          await expect(canvas.locator(".canvas-notice")).toContainText(
            "Receiver",
          );
        }
        await page.getByRole("button", { name: "Undo", exact: true }).click();
        assert.deepEqual((await exportDocument(page)).graph, before.graph);
        await page.getByRole("button", { name: "Redo", exact: true }).click();
        assert.deepEqual((await exportDocument(page)).graph, changed.graph);
        actions.push(
          name === "constant-detach.grape.json"
            ? "atomic detach/loss and Undo/Redo"
            : "shared mode change and Undo/Redo",
        );
      }
    } else if (name === "shared-function.grape.json") {
      const before = await exportDocument(page),
        canvas = page.locator(".canvas").first();
      await canvas
        .getByRole("heading", { name: "Shared arithmetic", exact: true })
        .first()
        .click();
      await canvas
        .getByRole("button", { name: "Make independent", exact: true })
        .click();
      assert.equal(
        (await exportDocument(page)).graph.resources.length,
        before.graph.resources.length + 1,
      );
      await canvas
        .getByRole("button", { name: "Enter subgraph", exact: true })
        .click();
      await canvas.getByText("Subgraph interface", { exact: true }).click();
      await expect(canvas.getByLabel("Subgraph emission mode")).toHaveValue(
        "function",
      );
      await canvas.getByLabel("Subgraph emission mode").selectOption("expand");
      const after = await exportDocument(page);
      for (const r of before.graph.resources)
        assert.deepEqual(
          after.graph.resources.find((a: any) => a.id === r.id),
          r,
        );
      actions.push(
        "Make independent retains mode then diverges without changing shared original",
      );
    }
  }
  await page
    .getByRole("button", { name: "Generate GLSL", exact: true })
    .click();
  const expectedError = name === "constant-detach.grape.json";
  if (expectedError)
    await expect(page.getByRole("list", { name: "Diagnostics" })).toContainText(
      "INPUT_REQUIRED",
    );
  else
    await expect(page.getByLabel("Generated GLSL")).toContainText(
      "#version 300 es",
    );
  const roundtrip = await saveReopen(page);
  actions.push(
    expectedError
      ? "expected INPUT_REQUIRED only after deliberate mode detach"
      : "successful GLSL generation",
    "save/reopen exact document",
  );
  return {
    name,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    bytes: bytes.length,
    review,
    actions,
    upgrade,
    roundtrip,
  };
}
