import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
const evidence = process.env.GRAPE_EVIDENCE_DIR!;
test.beforeEach(async ({ page }) => {
  page.on("dialog", (d) => d.accept());
});
async function exported(page: any) {
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  return JSON.parse(await fs.readFile((await (await event).path())!, "utf8"));
}
async function openFixture(page: any, document: any) {
  await page.getByLabel("Open document file").setInputFiles({
    name: "case.grape.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(document)),
  });
  await page
    .getByRole("button", { name: "Open in new session", exact: true })
    .click();
}
test("S05 AT04 AT05 real mode command reports precise loss and Undo restores entire graph; rejected activation leaves UI and history unchanged", async ({
  page,
}) => {
  await page.goto("/");
  const records = [];
  for (const internal of [false, true]) {
    const doc = await page.evaluate(async (internal) => {
      const { functionFixture } = await import("/tests/fixtures/s05.ts"),
        { functionOperationRef } =
          await import("/src/modules/function-operations.ts");
      const s = functionFixture(),
        network = internal ? s.body : s.network;
      s.graph.change("Constant consumer", (d) => {
        const receiver = d.add(
          network,
          functionOperationRef("constant-input"),
          [0, 250],
        );
        d.connect(
          network,
          internal
            ? { nodeId: s.definition().data.network.nodes[0].id, portKey: "x" }
            : { nodeId: s.call, portKey: "y" },
          { nodeId: receiver, portKey: "value" },
        );
      });
      return s.graph.capture().document;
    }, internal);
    await openFixture(page, doc);
    const canvas = page.locator(".canvas").first();
    await canvas
      .getByRole("heading", { name: "Shared arithmetic", exact: true })
      .last()
      .click();
    await canvas
      .getByRole("button", { name: "Enter subgraph", exact: true })
      .click();
    await canvas.getByText("Subgraph interface", { exact: true }).click();
    const before = await exported(page);
    await canvas.getByLabel("Subgraph emission mode").selectOption("function");
    const after = await exported(page);
    if (internal) {
      expect(after.graph).toEqual(before.graph);
      await expect(canvas.getByLabel("Subgraph emission mode")).toHaveValue(
        "expand",
      );
      await expect(canvas.locator(".canvas-notice")).toContainText(
        "CONSTANT_REQUIRED",
      );
      await expect(
        page.getByRole("button", { name: "Undo", exact: true }),
      ).toBeDisabled();
    } else {
      expect(after.graph.losses.at(-1).code).toBe("FUNCTION_CONSTANT_DETACHED");
      await expect(canvas.locator(".canvas-notice")).toContainText("Receiver");
      await page
        .getByRole("button", { name: "Generate GLSL", exact: true })
        .click();
      await expect(
        page.getByRole("list", { name: "Diagnostics" }),
      ).toContainText("INPUT_REQUIRED");
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      expect((await exported(page)).graph).toEqual(before.graph);
      await page.getByRole("button", { name: "Redo", exact: true }).click();
      expect((await exported(page)).graph).toEqual(after.graph);
    }
    records.push({ internal, before, after });
  }
  await fs.writeFile(
    evidence + "/s05-ui-constant-transactions.json",
    JSON.stringify(records, null, 2),
  );
});
test("S05 AT07 legacy mode UI requires explicit owner upgrade preserving original data", async ({
  page,
}) => {
  await page.goto("/");
  const doc = await page.evaluate(async () => {
    const { currentSetup } = await import("/tests/fixtures/s04.ts");
    const s = currentSetup();
    s.graph.change("Legacy", (d) => d.createSubgraph(s.network));
    return s.graph.capture().document;
  });
  await openFixture(page, doc);
  let canvas = page.locator(".canvas").first();
  await canvas.getByRole("heading", { name: "Subgraph", exact: true }).click();
  await canvas
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  await canvas.getByText("Subgraph interface", { exact: true }).click();
  await expect(canvas.getByLabel("Subgraph emission mode")).toBeDisabled();
  const before = await exported(page);
  await page
    .getByRole("button", { name: "Upgrade subgraph owners", exact: true })
    .click();
  canvas = page.locator(".canvas").first();
  await canvas.getByRole("heading", { name: "Subgraph", exact: true }).click();
  await canvas
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  await canvas.getByText("Subgraph interface", { exact: true }).click();
  await expect(canvas.getByLabel("Subgraph emission mode")).toBeEnabled();
  const after = await exported(page);
  expect(after.graph.resources[0].data.network).toEqual(
    before.graph.resources[0].data.network,
  );
  expect(after.graph.resources[0].data.emissionMode).toBe("expand");
  await fs.writeFile(
    evidence + "/s05-ui-explicit-upgrade.json",
    JSON.stringify({ before, after }, null, 2),
  );
});
test("S05 AT03 AT08 WebGL2 fixed shape nominal effects unconsumed nested effects and independent stage helpers", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  const rows = await page.evaluate(async () => {
    const { shapeFixture, effectFixture, stageFixture } =
        await import("/tests/fixtures/s05.ts"),
      { executeGL } = await import("/tests/fixtures/s05-webgl.ts"),
      { compile } = await import("/src/generation/compiler.ts");
    const rows = [];
    for (const kind of ["array", "nominal"] as const) {
      const s = shapeFixture(kind);
      s.graph.change("Shape function", (d) =>
        d.emissionMode(s.body, "function", s.profile),
      );
      rows.push({
        kind,
        ...executeGL(compile(s.graph.capture(), s.fixed, s.profile)),
        expected: kind === "array" ? [191, 191, 191, 191] : [89, 89, 89, 89],
      });
    }
    for (const [kind, discard, unconsumed, nested] of [
      ["effect-pair", false, false, false],
      ["discard", true, false, false],
      ["unconsumed-effects", true, true, false],
      ["nested-unconsumed-effects", true, true, true],
    ] as const) {
      const s = effectFixture(discard, unconsumed, nested);
      rows.push({
        kind,
        ...executeGL(compile(s.graph.capture(), s.fixed, s.profile)),
        expected: discard ? [0, 0, 0, 0] : [51, 102, 0, 255],
      });
    }
    for (const probe of [0.1, 0.3]) {
      const depth = effectFixture();
      rows.push({
        kind: "depth-probe-" + probe,
        ...executeGL(
          compile(depth.graph.capture(), depth.fixed, depth.profile),
          {},
          probe,
        ),
        expected: probe === 0.1 ? [255, 0, 0, 255] : [51, 102, 0, 255],
      });
    }
    const s = stageFixture();
    rows.push({
      kind: "vertex-pixel",
      ...executeGL(compile(s.graph.capture(), s.fixed, s.profile)),
      expected: [51, 102, 153, 255],
    });
    return rows;
  });
  for (const row of rows)
    row.pixels.forEach((v, i) =>
      expect(Math.abs(v - row.expected[i]), row.kind).toBeLessThanOrEqual(1),
    );
  await fs.writeFile(
    evidence + "/s05-webgl-shape-effects-stage.json",
    JSON.stringify({ browser: browser.version(), rows }, null, 2),
  );
});
test("S05 AT02 AT03 real WebGL2 distinct shared and nested caller values and Uniform parameters", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { functionFixture } = await import("/tests/fixtures/s05.ts"),
      { executeGL } = await import("/tests/fixtures/s05-webgl.ts"),
      { compile } = await import("/src/generation/compiler.ts"),
      { asNetwork } = await import("/src/sdk/networks.ts"),
      { functionOperationRef } =
        await import("/src/modules/function-operations.ts");
    const rows = [];
    for (const kind of ["expanded", "shared", "nested", "uniform"]) {
      const s = functionFixture();
      let uniform = "";
      if (kind !== "expanded")
        s.graph.change("Function", (d) =>
          d.emissionMode(s.body, "function", s.profile),
        );
      if (kind === "nested") {
        s.graph.change("Nest", (d) =>
          d.encapsulate(s.network, [s.call, s.second]),
        );
        const r = s.graph
          .capture()
          .document.graph.resources.find((r) =>
            asNetwork(r, s.fixed)?.network.nodes.some((n) => n.id === s.call),
          )!;
        s.graph.change("Outer", (d) =>
          d.emissionMode(
            asNetwork(r, s.fixed)!.network.id,
            "function",
            s.profile,
          ),
        );
      }
      if (kind === "uniform")
        s.graph.change("Uniform", (d) => {
          uniform = d.createSource("gain", "glsl.float", 0.4, true, {
            kind: "uniform",
          });
          const source = d.addReferenceNode(
            s.network,
            "source",
            uniform,
            undefined,
            functionOperationRef("source"),
          );
          d.connect(
            s.network,
            { nodeId: source, portKey: "value" },
            { nodeId: s.call, portKey: "x" },
          );
        });
      const before = JSON.stringify(s.graph.capture()),
        out = compile(s.graph.capture(), s.fixed, s.profile);
      rows.push({
        kind,
        ...executeGL(out),
        expected:
          kind === "uniform" ? [102, 204, 153, 255] : [51, 102, 153, 255],
        unchanged: JSON.stringify(s.graph.capture()) === before,
      });
      if (uniform)
        rows.push({
          kind: "uniform-live-value",
          ...executeGL(out, { [uniform]: 0.1 }),
          expected: [26, 51, 153, 255],
          unchanged: JSON.stringify(s.graph.capture()) === before,
        });
    }
    return rows;
  });
  for (const row of result) {
    expect(row.unchanged).toBe(true);
    row.pixels.forEach((v, i) =>
      expect(Math.abs(v - row.expected[i])).toBeLessThanOrEqual(1),
    );
  }
  await fs.writeFile(
    evidence + "/s05-webgl-functions.json",
    JSON.stringify({ browser: browser.version(), rows: result }, null, 2),
  );
});
test("S05 mode UI persists shared choice and Make independent and Undo through real commands", async ({
  page,
}) => {
  await page.goto("/");
  const canvas = page.locator(".canvas").first();
  await canvas
    .getByRole("button", { name: "New subgraph", exact: true })
    .click();
  await canvas
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  await canvas.getByText("Subgraph interface", { exact: true }).click();
  const selector = canvas.getByLabel("Subgraph emission mode");
  await expect(selector).toHaveValue("expand");
  await selector.selectOption("function");
  await expect(selector).toHaveValue("function");
  const changed = await exported(page);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(selector).toHaveValue("expand");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  expect((await exported(page)).graph).toEqual(changed.graph);
  await canvas.getByRole("button", { name: "Up", exact: true }).click();
  await canvas.getByRole("heading", { name: "Subgraph", exact: true }).click();
  await canvas
    .getByRole("button", { name: "Make independent", exact: true })
    .click();
  const independent = await exported(page);
  expect(independent.graph.resources.length).toBe(
    changed.graph.resources.length + 1,
  );
  await canvas
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  await expect(selector).toHaveValue("function");
  await canvas.getByText("Subgraph interface", { exact: true }).click();
  await selector.selectOption("expand");
  const separated = await exported(page);
  expect(
    separated.graph.resources.filter(
      (r: any) => r.data.emissionMode === "function",
    ),
  ).toHaveLength(1);
  await page.screenshot({ path: evidence + "/s05-mode-ui.png" });
  await fs.writeFile(
    evidence + "/s05-mode-ui.json",
    JSON.stringify({ changed, independent, separated }, null, 2),
  );
});
for (const host of ["127.0.0.1", "192.168.1.105", "100.83.88.97"])
  test(`S05 served HTTP ${host} boots with secure IDs and exact Personal digest`, async ({
    page,
    browser,
  }) => {
    await page.goto(`http://${host}:4195`);
    await expect(page.locator(".canvas").first()).toBeVisible();
    const result = await page.evaluate(async () => {
      const { browserIdentity } =
          await import("/src/adapters/browser/identity.ts"),
        { sha256Digest } = await import("/src/application/digest.ts"),
        { functionFixture } = await import("/tests/fixtures/s05.ts"),
        { buildPersonal, readPersonal } =
          await import("/src/application/personal.ts"),
        { probeDefinitions } = await import("/src/modules/package-probe.ts");
      const s = functionFixture();
      s.graph.change("Mode", (d) =>
        d.emissionMode(s.body, "function", s.profile),
      );
      const asset = await buildPersonal(
          s.graph.capture(),
          s.fixed,
          s.definition().resource.id,
          s.profile,
          probeDefinitions,
        ),
        reread = await readPersonal(
          JSON.stringify(asset),
          s.fixed,
          s.profile,
          probeDefinitions,
        );
      const tampered = structuredClone(asset);
      tampered.name += " altered";
      let rejected = false;
      try {
        await readPersonal(
          JSON.stringify(tampered),
          s.fixed,
          s.profile,
          probeDefinitions,
        );
      } catch {
        rejected = true;
      }
      return {
        secure: isSecureContext,
        randomUUID: typeof crypto.randomUUID,
        subtle: typeof crypto.subtle,
        ids: Array.from({ length: 50 }, () => browserIdentity().next()),
        hash: sha256Digest(new TextEncoder().encode("abc")),
        packageHash: asset.contentHash,
        roundtrip: reread.contentHash === asset.contentHash,
        rejected,
      };
    });
    expect(result.hash).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    expect(new Set(result.ids).size).toBe(50);
    expect(result.roundtrip).toBe(true);
    expect(result.rejected).toBe(true);
    if (host !== "127.0.0.1") {
      expect(result.secure).toBe(false);
      expect(result.subtle).toBe("undefined");
    }
    const canvas = page.locator(".canvas").first();
    await page.getByRole("button", { name: "Add Float", exact: true }).click();
    await canvas
      .getByRole("button", { name: "Float output value", exact: true })
      .click();
    await canvas
      .getByRole("button", { name: "Image output input color", exact: true })
      .click();
    await canvas
      .getByRole("button", { name: "New subgraph", exact: true })
      .click();
    await canvas
      .getByRole("button", { name: "Enter subgraph", exact: true })
      .click();
    await canvas.getByText("Subgraph interface", { exact: true }).click();
    await canvas
      .getByRole("button", { name: "Add interface port", exact: true })
      .click();
    await canvas
      .getByRole("button", { name: "Apply interface", exact: true })
      .click();
    await canvas.getByText("Subgraph interface", { exact: true }).click();
    await canvas.getByLabel("Subgraph emission mode").selectOption("function");
    await canvas.getByRole("button", { name: "Up", exact: true }).click();
    await canvas
      .getByRole("heading", { name: "Subgraph", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Personal Library", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Save selected subgraph", exact: true })
      .click();
    await expect(page.locator('dialog[open] [role="status"]')).toContainText(
      "Saved",
    );
    const download = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Export Subgraph", exact: true })
      .click();
    const packageText = await fs.readFile(
      (await (await download).path())!,
      "utf8",
    );
    await page.getByLabel("Import Personal package").setInputFiles({
      name: "same.sgrape-function.json",
      mimeType: "application/json",
      buffer: Buffer.from(packageText),
    });
    await expect(page.locator("[data-personal-file]")).toHaveCount(1);
    await page
      .getByRole("button", { name: "Insert Subgraph", exact: true })
      .click();
    const beforeSave = await exported(page);
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.locator("#save-state")).toHaveText("Saved");
    await page.reload();
    await page.getByRole("button", { name: "Open saved", exact: true }).click();
    await page.locator("#saved-list button").first().click();
    const afterOpen = await exported(page);
    expect(afterOpen.graph).toEqual(beforeSave.graph);
    await page
      .getByRole("button", { name: "Personal Library", exact: true })
      .click();
    await expect(page.locator("[data-personal-file]")).toHaveCount(1);
    await fs.writeFile(
      evidence + `/s05-origin-${host}.json`,
      JSON.stringify(
        {
          browser: browser.version(),
          origin: host,
          sameMachine: true,
          secondDevice: false,
          ...result,
        },
        null,
        2,
      ),
    );
  });
