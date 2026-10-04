import { clickAction } from "../fixtures/public-actions.ts";
import { fileURLToPath } from "node:url";
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  deliveredNames,
  deliveredFlow,
  exportDocument,
  openValidFile,
  reviewFile,
  saveReopen,
} from "../fixtures/s05-delivered-flows.ts";
const evidence = process.env.GRAPE_EVIDENCE_DIR!;
const samples = path.join(evidence, "delivered-samples");
test.beforeAll(() => {
  if (!fs.existsSync(samples)) {
    const log = execFileSync(
      process.execPath,
      [
        "--experimental-transform-types",
        fileURLToPath(new URL("../../tools/s05-samples.ts", import.meta.url)),
        samples,
      ],
      { encoding: "utf8" },
    );
    fs.writeFileSync(path.join(evidence, "sample-producer.log"), log, {
      flag: "wx",
    });
  }
  const entries = JSON.parse(
    fs.readFileSync(path.join(samples, "manifest.json"), "utf8"),
  ).entries;
  expect(entries.map((r: any) => r.file).sort()).toEqual(
    [...deliveredNames].sort(),
  );
  for (const row of entries)
    expect(
      createHash("sha256")
        .update(fs.readFileSync(path.join(samples, row.file)))
        .digest("hex"),
    ).toBe(row.sha256);
});
test.beforeEach(({ page }) => {
  page.on("dialog", (d) => d.accept());
});
for (const name of deliveredNames)
  test(`S05-OWNER-001 delivered public flow ${name}`, async ({
    page,
    browser,
  }) => {
    await page.goto("/");
    const result = await deliveredFlow(
      page,
      name,
      fs.readFileSync(path.join(samples, name)),
      fs.readFileSync(path.join(samples, "shared-expand.grape.json")),
    );
    await fs.promises.writeFile(
      path.join(evidence, "delivered-" + name),
      JSON.stringify({ browser: browser.version(), ...result }, null, 2),
      { flag: "wx" },
    );
  });
test("S05-OWNER-001 exact owner and malformed admission stay strict; original error draft opens only explicitly", async ({
  page,
}) => {
  await page.goto("/");
  const valid = fs.readFileSync(
    path.join(samples, "shared-function.grape.json"),
  );
  await openValidFile(page, "valid.grape.json", valid);
  const before = await exportDocument(page),
    records = [];
  for (const kind of [
    "duplicate-pin",
    "undeclared-pin",
    "missing-owner",
    "missing-mode",
    "unknown-mode",
    "missing-dependency",
  ]) {
    const doc = JSON.parse(valid.toString()),
      resource = doc.graph.resources.find((r: any) => r.data.emissionMode);
    if (kind === "duplicate-pin")
      doc.graph.modules.push({ ...doc.graph.modules[0] });
    if (kind === "undeclared-pin" || kind === "missing-owner") {
      resource.type.fingerprint = "unavailable-exact-owner";
      if (kind === "missing-owner") {
        const { typeId, ...pin } = resource.type;
        doc.graph.modules.push(pin);
      }
    }
    if (kind === "missing-mode") delete resource.data.emissionMode;
    if (kind === "unknown-mode") resource.data.emissionMode = "guess";
    if (kind === "missing-dependency") doc.graph.resources = [];
    const raw = Buffer.from(JSON.stringify(doc)),
      review = await reviewFile(page, kind + ".json", raw);
    expect(review.details.candidate).toBeNull();
    await expect(
      page.getByRole("button", {
        name: "Accept replacement (one Undo)",
        exact: true,
      }),
    ).not.toBeVisible();
    if (["duplicate-pin", "undeclared-pin"].includes(kind))
      await expect(
        page.getByRole("button", { name: "Open in new session", exact: true }),
      ).not.toBeVisible();
    if (kind.includes("mode"))
      expect(JSON.stringify(review)).toContain("NETWORK_EMISSION_MODE");
    if (kind === "missing-owner")
      expect(JSON.stringify(review)).toContain("MISSING_MODULE");
    const download = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Export original", exact: true })
      .click();
    expect(fs.readFileSync((await (await download).path())!)).toEqual(raw);
    await page.getByRole("button", { name: "Close", exact: true }).click();
    expect(await exportDocument(page)).toEqual(before);
    await expect(
      page.getByRole("button", { name: "Undo", exact: true }),
    ).toBeDisabled();
    records.push({ kind, review, graphAndHistoryUnchanged: true });
  }
  const original = fs.readFileSync(
    new URL(
      "../../evidence/s05/repair-01/samples/legacy-owner.grape.json",
      import.meta.url,
    ),
  );
  const review = await reviewFile(page, "original-legacy.grape.json", original);
  expect(review.message).toContain("IMPORT_ERRORS");
  expect(review.details.diagnostics.map((d: any) => d.code)).toEqual([
    "INPUT_REQUIRED",
  ]);
  await expect(
    page.getByRole("button", {
      name: "Accept replacement (one Undo)",
      exact: true,
    }),
  ).not.toBeVisible();
  await page
    .getByRole("button", { name: "Open in new session", exact: true })
    .click();
  expect(await exportDocument(page)).toEqual(JSON.parse(original.toString()));
  await clickAction(page, "Upgrade subgraph owners");
  const upgraded = await exportDocument(page);
  expect(upgraded.graph.resources[0].data.emissionMode).toBe("expand");
  expect(upgraded.graph.resources[0].data.network).toEqual(
    JSON.parse(original.toString()).graph.resources[0].data.network,
  );
  await page
    .getByRole("button", { name: "Generate GLSL", exact: true })
    .click();
  await expect(page.getByRole("list", { name: "Diagnostics" })).toContainText(
    "INPUT_REQUIRED",
  );
  const roundtrip = await saveReopen(page);
  await fs.promises.writeFile(
    path.join(evidence, "delivered-negative-admission.json"),
    JSON.stringify(
      { records, originalReview: review, originalDraftRoundtrip: roundtrip },
      null,
      2,
    ),
    { flag: "wx" },
  );
});
