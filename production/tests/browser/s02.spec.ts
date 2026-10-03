import { openLegacyDocument } from "./legacy-document.ts";
import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs/promises";
import { flow } from "../fixtures/setup.ts";
import { unwrapPNG } from "../../src/persistence/png.ts";
const fixture = () => structuredClone(flow().graph.capture().document);
async function choose(page: Page, doc: unknown, name = "source.grape.json") {
  await page.getByLabel("Open document file", { exact: true }).setInputFiles({
    name,
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(doc)),
  });
  await expect(page.locator("#recovery")).toBeVisible();
}
async function exported(page: Page, button = "Export JSON") {
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: button, exact: true }).click();
  const download = await event;
  return fs.readFile((await download.path())!);
}
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await openLegacyDocument(page);
});
test("AT-S02-01 browser: review/cancel, repair proposal and explicit one-Undo atomic acceptance", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const before = await exported(page),
    revision = await page.locator(".canvas").getAttribute("data-revision");
  const doc = fixture();
  doc.graph.name = "Reviewed import";
  await choose(page, doc);
  await expect(page.locator("#recovery-message")).toContainText(
    "valid: DOCUMENT_VALID",
  );
  await expect(page.locator(".node")).toHaveCount(1);
  expect(await exported(page, "Export original")).toEqual(
    Buffer.from(JSON.stringify(doc)),
  );
  await page.getByRole("button", { name: "Close", exact: true }).click();
  expect(await exported(page)).toEqual(before);
  expect(await page.locator(".canvas").getAttribute("data-revision")).toBe(
    revision,
  );
  const damaged = structuredClone(doc) as any;
  damaged.graph.stages[1].network.nodes[1].position = ["bad", 7];
  await choose(page, damaged);
  await expect(page.locator("#recovery-message")).toContainText("repairable");
  await expect(page.getByLabel("Inspection and proposal")).toContainText(
    "Replace malformed authored position",
  );
  await page
    .getByRole("button", { name: "Accept replacement (one Undo)", exact: true })
    .click();
  await expect(page.locator("#recovery")).not.toBeVisible();
  await expect(page.locator(".node")).toHaveCount(4);
  await page.getByRole("button", { name: "Generate GLSL" }).click();
  await expect(
    page.getByText("Generated successfully · Host-free GLSL"),
  ).toBeVisible();
  const accepted = JSON.parse((await exported(page)).toString());
  expect(accepted.graph.id).toBe(JSON.parse(before.toString()).graph.id);
  expect(accepted.graph.stages[1].network.nodes[1].position).toEqual([48, 96]);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await exported(page)).toEqual(before);
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(page.locator(".node")).toHaveCount(4);
  expect(errors).toEqual([]);
  await page.screenshot({
    path: `${process.env.GRAPE_EVIDENCE_DIR ?? "evidence/s02"}/review-accepted.png`,
    fullPage: true,
  });
});
test("AT-S02-01 browser: readonly and intervening edit fence publication", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Lock editing" }).click();
  await choose(page, fixture());
  await expect(
    page.getByRole("button", { name: "Accept replacement (one Undo)" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Lock editing" }).click();
  await choose(page, fixture());
  // Simulate a command from another view while the modal review owns focus.
  await page
    .getByRole("button", { name: "Add Float", exact: true })
    .evaluate((button: HTMLButtonElement) => button.click());
  await page
    .getByRole("button", { name: "Accept replacement (one Undo)" })
    .click();
  await expect(page.locator("#recovery-message")).toContainText("IMPORT_STALE");
  await expect(page.locator(".node")).toHaveCount(2);
});
test("AT-S02-01 browser: duplicate IDs, unknown structure and future input never expose acceptance", async ({
  page,
}) => {
  for (const mutate of [
    (d: any) => (d.formatVersion.major = 3),
    (d: any) =>
      d.graph.stages[1].network.nodes.push(d.graph.stages[1].network.nodes[0]),
    (d: any) => (d.graph.future = { preserve: "全部🍇" }),
  ]) {
    const doc = fixture();
    mutate(doc);
    await choose(page, doc);
    await expect(
      page.getByRole("button", { name: "Accept replacement (one Undo)" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Open in new session" }),
    ).not.toBeVisible();
    expect(await exported(page, "Export original")).toEqual(
      Buffer.from(JSON.stringify(doc)),
    );
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await expect(page.locator(".node")).toHaveCount(1);
  }
});
test("AT-S02-02 browser: explicit missing-module load, move/rename, save/reopen preserve opaque state and block generation", async ({
  page,
}) => {
  const doc = fixture(),
    node = doc.graph.stages[1].network.nodes[1];
  node.type.fingerprint = "missing-exact";
  doc.graph.modules.push({
    moduleId: node.type.moduleId,
    version: node.type.version,
    fingerprint: node.type.fingerprint,
  });
  node.state = { opaque: { text: "未知🍇", archive: [1, 2] }, value: 0.25 };
  await choose(page, doc);
  await expect(page.locator("#recovery-message")).toContainText(
    "blocked: IMPORT_ERRORS",
  );
  await expect(page.getByLabel("Inspection and proposal")).toContainText(
    "MISSING_MODULE",
  );
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Open in new session" }).click();
  await expect(page.locator(".node")).toHaveCount(4);
  await page
    .locator(".node h3")
    .filter({ hasText: /^Float$/ })
    .click();
  page.once("dialog", (dialog) => dialog.accept("Preserved missing"));
  await page.getByRole("button", { name: "Rename node" }).click();
  const heading = page
      .locator(".node h3")
      .filter({ hasText: /^Preserved missing$/ }),
    box = await heading.boundingBox();
  await page.mouse.move(box!.x + 20, box!.y + 10);
  await page.mouse.down();
  await page.mouse.move(box!.x + 80, box!.y + 60, { steps: 5 });
  await page.mouse.up();
  await page.getByRole("button", { name: "Generate GLSL" }).click();
  await expect(
    page.getByText("Generation blocked", { exact: true }),
  ).toBeVisible();
  const saved = JSON.parse((await exported(page)).toString()),
    savedNode = saved.graph.stages[1].network.nodes.find(
      (n: any) => n.id === node.id,
    );
  expect(savedNode.state).toEqual(node.state);
  expect(savedNode.ports).toEqual(node.ports);
  expect(savedNode.type).toEqual(node.type);
  expect(savedNode.position).not.toEqual(node.position);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#save-state")).toHaveText("Saved");
  await page.getByRole("button", { name: "Open saved", exact: true }).click();
  await page.locator("#saved-list button").click();
  expect(JSON.parse((await exported(page)).toString())).toEqual(saved);
});
test("AT-S02-03 boundary browser: unmapped legacy remains explicit with provenance and original export", async ({
  page,
}) => {
  const legacy = {
    format: "td-sgrape",
    definitionUuid: "known-uuid",
    revisionHash: "unmapped",
    archive: { opaque: "保留" },
  };
  await choose(page, legacy);
  await expect(page.locator("#recovery-message")).toContainText(
    "IMPORT_CONVERTER_REQUIRED",
  );
  await expect(page.getByLabel("Inspection and proposal")).toContainText(
    "G-VERSION-COMPAT",
  );
  await expect(
    page.getByRole("button", { name: "Accept replacement (one Undo)" }),
  ).not.toBeVisible();
  expect(await exported(page, "Export original")).toEqual(
    Buffer.from(JSON.stringify(legacy)),
  );
});
test("AT-S02-04 browser: real Canvas PNG preview/export/reimport, malformed CRC and missing metadata", async ({
  page,
}) => {
  const doc = fixture();
  doc.graph.extensions["test.notes"] = { cjk: "中文", nonBMP: "🍇" };
  await choose(page, doc);
  await page
    .getByRole("button", { name: "Accept replacement (one Undo)" })
    .click();
  const json = JSON.parse((await exported(page)).toString());
  await page.getByRole("button", { name: "Export PNG", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeEnabled();
  const image = page.getByRole("img", { name: "Preview PNG export" });
  expect(
    await image.evaluate((img: HTMLImageElement) => img.naturalWidth),
  ).toBeGreaterThanOrEqual(640);
  const png = await exported(page, "Download PNG");
  expect(JSON.parse(unwrapPNG(png))).toEqual(json);
  await page.screenshot({
    path: `${process.env.GRAPE_EVIDENCE_DIR ?? "evidence/s02"}/png-preview.png`,
  });
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByLabel("Open document file", { exact: true }).setInputFiles({
    name: "roundtrip.png",
    mimeType: "image/png",
    buffer: png,
  });
  await expect(page.locator("#recovery-message")).toContainText(
    "valid: DOCUMENT_VALID",
  );
  expect(await exported(page, "Export original")).toEqual(png);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  const bad = Buffer.from(png);
  bad[29] ^= 1;
  await page
    .getByLabel("Open document file", { exact: true })
    .setInputFiles({ name: "bad.png", mimeType: "image/png", buffer: bad });
  await expect(page.locator("#recovery-message")).toContainText("PNG_CRC");
  expect(await exported(page, "Export original")).toEqual(bad);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  const bare = await page.evaluate(() => {
    const c = document.createElement("canvas");
    return c.toDataURL("image/png").split(",")[1];
  });
  await page.getByLabel("Open document file", { exact: true }).setInputFiles({
    name: "bare.png",
    mimeType: "image/png",
    buffer: Buffer.from(bare, "base64"),
  });
  await expect(page.locator("#recovery-message")).toContainText(
    "PNG_METADATA_MISSING",
  );
});
test("AT-S02-01 browser: cancel during delayed file read fences the late review", async ({
  page,
}) => {
  await page.evaluate(() => {
    const read = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = async function () {
      await new Promise((r) => setTimeout(r, 700));
      return read.call(this);
    };
  });
  await page.getByLabel("Open document file", { exact: true }).setInputFiles({
    name: "delayed.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(fixture())),
  });
  await expect(page.locator("#recovery-message")).toContainText(
    "READING_INPUT",
  );
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.waitForTimeout(900);
  await expect(page.locator("#recovery")).not.toBeVisible();
  await expect(page.locator(".node")).toHaveCount(1);
});

test("M1 browser: boundary missing-module rename rejects save, retains prior ACK, then saves and reopens without opaque loss", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const doc = fixture(),
    node = doc.graph.stages[1].network.nodes[1];
  node.type.fingerprint = "missing-boundary";
  doc.graph.modules.push({
    moduleId: node.type.moduleId,
    version: node.type.version,
    fingerprint: node.type.fingerprint,
  });
  node.state = { privateData: "", unicode: "中文🍇" };
  node.state.privateData = "x".repeat(
    512000 - Buffer.byteLength(JSON.stringify(doc)),
  );
  expect(Buffer.byteLength(JSON.stringify(doc))).toBe(512000);
  await choose(page, doc);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Open in new session" }).click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#save-state")).toHaveText("Saved");
  async function stored() {
    return page.evaluate(async (key) => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open("grape-documents-v2", 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      try {
        return await new Promise<string>((resolve, reject) => {
          const request = db
            .transaction("documents")
            .objectStore("documents")
            .get(key);
          request.onsuccess = () => resolve(request.result.text);
          request.onerror = () => reject(request.error);
        });
      } finally {
        db.close();
      }
    }, doc.graph.id);
  }
  const prior = await stored();
  expect(JSON.parse(prior)).toEqual(doc);
  await page
    .locator(".node h3")
    .filter({ hasText: /^Float$/ })
    .click();
  page.once("dialog", (dialog) => dialog.accept("Boundary renamed longer"));
  await page.getByRole("button", { name: "Rename node" }).click();
  const revision = await page.locator(".canvas").getAttribute("data-revision");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#message")).toContainText("DOCUMENT_SIZE");
  await expect(page.locator("#save-state")).toHaveText("Unsaved changes");
  expect(await stored()).toBe(prior);
  expect(await page.locator(".canvas").getAttribute("data-revision")).toBe(
    revision,
  );
  await expect(
    page.locator(".node h3").filter({ hasText: /^Boundary renamed longer$/ }),
  ).toBeVisible();
  await page.screenshot({
    path: `${process.env.GRAPE_EVIDENCE_DIR ?? "evidence/s02"}/save-limit-rejected.png`,
    fullPage: true,
  });
  page.once("dialog", (dialog) => dialog.accept("X"));
  await page.getByRole("button", { name: "Rename node" }).click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#save-state")).toHaveText("Saved");
  const saved = await stored();
  expect(Buffer.byteLength(saved)).toBeLessThanOrEqual(512000);
  await page.getByRole("button", { name: "Open saved", exact: true }).click();
  await page.locator("#saved-list button").click();
  const reopened = JSON.parse((await exported(page)).toString());
  expect(reopened).toEqual(JSON.parse(saved));
  expect(reopened.graph.stages[1].network.nodes[1]).toEqual({
    ...node,
    name: "X",
  });
  await expect(page.locator("#save-state")).toHaveText("Saved");
  expect(errors).toEqual([]);
});
