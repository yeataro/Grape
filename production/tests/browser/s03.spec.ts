import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
const evidence = process.env.GRAPE_EVIDENCE_DIR!;
async function flow(page: any) {
  for (const name of ["Float", "Multiply", "Compose"])
    await page
      .getByRole("button", { name: "Add " + name, exact: true })
      .click();
  let edgeCount = 0;
  for (const [a, b] of [
    ["Float output value", "Multiply input a"],
    ["Multiply output result", "Compose input x"],
    ["Compose output result", "Image output input color"],
  ]) {
    await page.getByRole("button", { name: a, exact: true }).click();
    await page.getByRole("button", { name: b, exact: true }).click();
    await expect(page.locator(".wires [data-edge]")).toHaveCount(++edgeCount);
  }
}
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    (window as any).__s03Events = [];
    for (const type of ["pointerdown", "pointerup", "click"])
      document.addEventListener(
        type,
        (event) => {
          const target = event.target as HTMLElement;
          (window as any).__s03Events.push({
            type,
            tag: target.tagName,
            port:
              target.closest<HTMLElement>("[data-port]")?.dataset.port ?? null,
            connected: target.isConnected,
          });
        },
        true,
      );
  });
});
test.afterEach(async ({ page }, info) => {
  if (!page.isClosed())
    await info.attach("dom-pointer-events", {
      body: JSON.stringify(
        await page.evaluate(() => (window as any).__s03Events),
      ),
      contentType: "application/json",
    });
});
test("AT-S03-01/02 real nested Canvas, Inspector, interface reorder/remove and Undo", async ({
  page,
}) => {
  await flow(page);
  await page
    .locator(".node h3")
    .filter({ hasText: /^Multiply$/ })
    .click();
  await page.getByRole("button", { name: "Encapsulate", exact: true }).click();
  await expect(
    page.locator(".node h3").filter({ hasText: /^Subgraph$/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  await expect(page.locator(".canvas")).toHaveAttribute("data-path", /.+/);
  await expect(page.locator(".canvas-breadcrumb")).toContainText("Subgraph");
  await page
    .locator(".node h3")
    .filter({ hasText: /^Multiply$/ })
    .click();
  const field = page.locator('[data-parameter="b"]');
  await field.fill("7");
  await field.press("Enter");
  await expect(field).toHaveValue("7");
  await page.getByText("Subgraph interface", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Port name 1", exact: true })
    .fill("Renamed input");
  await page
    .getByRole("button", { name: "Move port up 2", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply interface", exact: true })
    .click();
  await page.getByRole("button", { name: "Up", exact: true }).click();
  await page
    .getByRole("button", { name: "Generate GLSL", exact: true })
    .click();
  await expect(page.getByLabel("Generated GLSL")).toContainText("* 7.0");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page
    .locator(".node h3")
    .filter({ hasText: /^Subgraph$/ })
    .click();
  await page
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  await expect(page.locator(".canvas")).toHaveAttribute("data-path", /.+/);
  await page.screenshot({ path: evidence + "/s03-nested.png", fullPage: true });
});
test("AT-S03-03 browser clipboard success, injected late rejection and Unicode text preserved", async ({
  page,
}) => {
  await flow(page);
  await page
    .locator(".node h3")
    .filter({ hasText: /^Multiply$/ })
    .click();
  await page.getByRole("button", { name: "Encapsulate", exact: true }).click();
  await page.getByText("Local clipboard", { exact: true }).click();
  await page
    .getByRole("button", { name: "Copy selection", exact: true })
    .click();
  const input = page.getByRole("textbox", { name: "Local clipboard text" });
  const packet = JSON.parse(await input.inputValue());
  packet.network.nodes[0].extensions["test.note"] = "\u540c\u540d\ud83c\udf47";
  await input.fill(JSON.stringify(packet));
  await page
    .getByRole("button", { name: "Paste selection", exact: true })
    .click();
  await expect(page.locator(".node")).toHaveCount(5);
  await page
    .getByRole("button", { name: "Copy selection", exact: true })
    .click();
  expect(await input.inputValue()).toContain("\u540c\u540d\ud83c\udf47");
  const before = await page.locator(".canvas").getAttribute("data-revision");
  packet.network.nodes[0].references.push({
    slot: "bad",
    kind: "resource",
    targetId: "absent",
  });
  await input.fill(JSON.stringify(packet));
  await page
    .getByRole("button", { name: "Paste selection", exact: true })
    .click();
  await expect(page.locator(".canvas-notice")).toContainText(
    "DEPENDENCY_MISSING",
  );
  await expect(page.locator(".canvas")).toHaveAttribute(
    "data-revision",
    before!,
  );
  await expect(page.locator(".node")).toHaveCount(5);
  await page.screenshot({
    path: evidence + "/s03-clipboard-rollback.png",
    fullPage: true,
  });
});
test("AT-S03-04 nested IME/cancel/focus and navigation cleanup use the real Inspector", async ({
  page,
}) => {
  await page.getByRole("button", { name: "New subgraph", exact: true }).click();
  await page
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  await page.getByRole("button", { name: "Add Float", exact: true }).click();
  const field = page.getByRole("textbox", { name: "Value", exact: true });
  await field.fill("0.75");
  await field.dispatchEvent("compositionstart");
  await field.press("Enter");
  await expect(field).toHaveAttribute("data-composing", "true");
  await field.dispatchEvent("compositionend");
  await field.press("Escape");
  await expect(field).toHaveValue("0.25");
  await field.fill("0.5");
  await field.press("Enter");
  await expect(field).toHaveValue("0.5");
  await field.fill("0.9");
  await page.getByRole("button", { name: "Up", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Value", exact: true }),
  ).toHaveCount(0);
  await page
    .locator(".node h3")
    .filter({ hasText: /^Subgraph$/ })
    .click();
  await page
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  await page
    .locator(".node h3")
    .filter({ hasText: /^Float$/ })
    .click();
  await expect(field).toHaveValue("0.5");
  await page.screenshot({
    path: evidence + "/s03-inspector-lifetime.png",
    fullPage: true,
  });
});
test("S03 structure authoring draft cancel, reorder and stale confirmation", async ({
  page,
}) => {
  await page.getByText("Structures", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Structure name", exact: true })
    .fill("Pair");
  await page
    .getByRole("button", { name: "Add structure field", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply structure", exact: true })
    .click();
  await page.getByText("Structures", { exact: true }).click();
  await page
    .getByRole("combobox", { name: "Structure definition" })
    .selectOption({ label: "Pair" });
  await page
    .getByRole("button", { name: "Add structure node", exact: true })
    .click();
  await expect(
    page.locator(".node h3").filter({ hasText: /^Structure$/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete structure", exact: true })
    .click();
  await expect(page.locator(".canvas-notice")).toContainText("STALE_PROPOSAL");
  await page
    .getByRole("button", { name: "Cancel structure", exact: true })
    .click();
  await page.screenshot({
    path: evidence + "/s03-structure.png",
    fullPage: true,
  });
});

test("AT-S03-01 two Canvas occurrences share parameters and keep independent navigation", async ({
  page,
}) => {
  await flow(page);
  await page
    .locator(".node h3")
    .filter({ hasText: /^Multiply$/ })
    .click();
  await page.getByRole("button", { name: "Encapsulate", exact: true }).click();
  await page.getByText("Local clipboard", { exact: true }).click();
  await page
    .getByRole("button", { name: "Copy selection", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Paste selection", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Second Canvas", exact: true })
    .click();
  const first = page.locator(".canvas").nth(0),
    second = page.locator(".canvas").nth(1);
  await first.locator('.node[aria-label="Subgraph"] h3').click();
  await first
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  await expect(second).toHaveAttribute("data-path", "");
  await second.locator('.node[aria-label="Subgraph 2"] h3').click();
  await second
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  expect(await first.getAttribute("data-network")).toBe(
    await second.getAttribute("data-network"),
  );
  expect(await first.getAttribute("data-path")).not.toBe(
    await second.getAttribute("data-path"),
  );
  await first
    .locator(".node h3")
    .filter({ hasText: /^Multiply$/ })
    .click();
  let input = page.locator('[data-parameter="b"]');
  await input.fill("4");
  await input.press("Enter");
  await second
    .locator(".node h3")
    .filter({ hasText: /^Multiply$/ })
    .click();
  await expect(input).toHaveValue("4");
  const firstSelection = await first.getAttribute("data-selection");
  await second
    .locator(".node h3")
    .filter({ hasText: /^Inputs$/ })
    .click();
  await expect(first).toHaveAttribute("data-selection", firstSelection!);
  await second.hover({ position: { x: 30, y: 350 } });
  await page.mouse.wheel(0, -100);
  await expect(second).not.toHaveAttribute("data-zoom", "1");
  await expect(first).toHaveAttribute("data-zoom", "1");
  await first.getByRole("button", { name: "Up", exact: true }).click();
  await expect(first).toHaveAttribute("data-path", "");
  await expect(second).toHaveAttribute("data-path", /.+/);
  await page.screenshot({
    path: evidence + "/s03-two-occurrences.png",
    fullPage: true,
  });
});
test("AT-S03-01/04 real library first edit, position-only layout, spare output and nested deletion", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Library subgraph", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  const canvas = page.locator(".canvas"),
    id = await canvas.getAttribute("data-definition");
  await page
    .getByRole("button", { name: "Arrange nodes", exact: true })
    .click();
  await expect(canvas).toHaveAttribute("data-definition", id!);
  await expect(canvas).toHaveAttribute("data-definition-kind", "library");
  await page
    .locator(".node h3")
    .filter({ hasText: /^Float$/ })
    .click();
  const field = page.getByRole("textbox", { name: "Value", exact: true });
  await field.fill("0.6");
  await field.press("Enter");
  await expect(canvas).toHaveAttribute("data-definition-kind", "local");
  expect(await canvas.getAttribute("data-definition")).not.toBe(id);
  await expect(field).toHaveValue("0.6");
  const from = await page
      .getByRole("button", { name: "Float output value", exact: true })
      .boundingBox(),
    to = await page
      .getByRole("button", {
        name: "Create output port from selection",
        exact: true,
      })
      .boundingBox();
  await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2);
  await page.mouse.down();
  await page.mouse.move(to!.x + to!.width / 2, to!.y + to!.height / 2, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(
    page.getByRole("button", {
      name: "Outputs input Float value",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .locator(".node h3")
    .filter({ hasText: /^Float$/ })
    .click();
  await page
    .getByRole("button", { name: "Delete selected", exact: true })
    .click();
  await expect(
    page.locator(".node h3").filter({ hasText: /^Float$/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.locator(".node h3").filter({ hasText: /^Float$/ }),
  ).toBeVisible();
  await page.screenshot({
    path: evidence + "/s03-library.png",
    fullPage: true,
  });
});
for (const unit of ["x", "\u4e2d", "\ud83c\udf47"])
  test(
    "G-LU-DATA-004 browser local clipboard UTF-8 budget " + unit,
    async ({ page }) => {
      await flow(page);
      await page
        .locator(".node h3")
        .filter({ hasText: /^Float$/ })
        .click();
      await page.getByText("Local clipboard", { exact: true }).click();
      await page
        .getByRole("button", { name: "Copy selection", exact: true })
        .click();
      const input = page.getByRole("textbox", { name: "Local clipboard text" }),
        packet = JSON.parse(await input.inputValue());
      packet.network.nodes[0].extensions["test.notes"] = "";
      const base = Buffer.byteLength(JSON.stringify(packet)),
        width = Buffer.byteLength(unit),
        count = Math.floor((512000 - base) / width);
      packet.network.nodes[0].extensions["test.notes"] =
        unit.repeat(count) + "x".repeat((512000 - base) % width);
      const exact = JSON.stringify(packet);
      expect(Buffer.byteLength(exact)).toBe(512000);
      await input.fill(exact);
      await page
        .getByRole("button", { name: "Paste selection", exact: true })
        .click();
      await expect(page.locator(".node")).toHaveCount(5);
      const before = await page
        .locator(".canvas")
        .getAttribute("data-revision");
      packet.network.nodes[0].extensions["test.notes"] += "x";
      await input.fill(JSON.stringify(packet));
      await page
        .getByRole("button", { name: "Paste selection", exact: true })
        .click();
      await expect(page.locator(".canvas-notice")).toContainText(
        "CLIPBOARD_SIZE",
      );
      await expect(page.locator(".canvas")).toHaveAttribute(
        "data-revision",
        before!,
      );
    },
  );

test("AT-S03-04 nested Inspector field removal cancels a focused draft and Undo mounts fresh controls", async ({
  page,
}) => {
  await page.getByRole("button", { name: "New subgraph", exact: true }).click();
  await page
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  await page.getByText("Structures", { exact: true }).click();
  await page
    .getByRole("button", { name: "Add structure field", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply structure", exact: true })
    .click();
  await page.getByText("Structures", { exact: true }).click();
  await page
    .getByRole("combobox", { name: "Structure definition" })
    .selectOption({ label: "Structure" });
  await page
    .getByRole("button", { name: "Add structure node", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Cancel structure", exact: true })
    .click();
  const original = page.locator("[data-parameter]").first();
  await original.fill("0.9");
  const key = await original.getAttribute("data-parameter");
  await page.getByText("Structures", { exact: true }).click();
  await page
    .getByRole("button", { name: "Remove field 1", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply structure", exact: true })
    .click();
  await expect(page.locator('[data-parameter="' + key + '"]')).toHaveCount(0);
  await expect(page.locator("[data-parameter]")).toHaveCount(1);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page
    .locator(".node h3")
    .filter({ hasText: /^Structure$/ })
    .click();
  await expect(page.locator('[data-parameter="' + key + '"]')).toHaveValue("0");
  await page.screenshot({
    path: evidence + "/s03-port-mutation.png",
    fullPage: true,
  });
});
test("AT-S03-03 visible frames move with encapsulation and Undo", async ({
  page,
}) => {
  await flow(page);
  await page
    .locator(".node h3")
    .filter({ hasText: /^Multiply$/ })
    .click();
  await page
    .getByRole("button", { name: "Frame selection", exact: true })
    .click();
  await expect(page.locator(".canvas-frame")).toHaveCount(1);
  await page.getByRole("button", { name: "Encapsulate", exact: true }).click();
  await expect(page.locator(".canvas-frame")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  await expect(page.locator(".canvas-frame")).toHaveCount(1);
  await page.screenshot({ path: evidence + "/s03-frame.png", fullPage: true });
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".canvas")).toHaveAttribute("data-path", "");
  await expect(page.locator(".canvas-frame")).toHaveCount(1);
});

async function exportedGraph(page: any) {
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  return JSON.parse(await fs.readFile((await (await event).path())!, "utf8"));
}

test("S03 Make independent and nested interface removal preserve other callers and Undo", async ({
  page,
}) => {
  await flow(page);
  await page
    .locator(".node h3")
    .filter({ hasText: /^Multiply$/ })
    .click();
  await page.getByRole("button", { name: "Encapsulate", exact: true }).click();
  await page.getByText("Local clipboard", { exact: true }).click();
  await page
    .getByRole("button", { name: "Copy selection", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Paste selection", exact: true })
    .click();
  const before = await exportedGraph(page);
  await page
    .getByRole("button", { name: "Make independent", exact: true })
    .click();
  const independent = await exportedGraph(page);
  expect(independent.graph.resources).toHaveLength(2);
  const callers = independent.graph.stages
    .find((s: any) => s.key === "pixel")
    .network.nodes.filter((n: any) => n.type.typeId === "call");
  expect(new Set(callers.map((n: any) => n.state.definition)).size).toBe(2);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await exportedGraph(page)).toEqual(before);
  await page
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  await page.getByText("Subgraph interface", { exact: true }).click();
  await page
    .getByRole("button", { name: "Remove port 1", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply interface", exact: true })
    .click();
  const removed = await exportedGraph(page);
  expect(removed.graph.losses.some((l: any) => l.payload.kind === "edge")).toBe(
    true,
  );
  const root = removed.graph.stages.find((s: any) => s.key === "pixel").network;
  for (const n of root.nodes.filter((n: any) => n.type.typeId === "call"))
    expect(n.ports.filter((p: any) => p.direction === "input")).toHaveLength(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await exportedGraph(page)).toEqual(before);
  await page.screenshot({
    path: evidence + "/s03-independent-removal.png",
    fullPage: true,
  });
});

test("S03 Structure Help is read-only and composite defaults and Escape retain saved values", async ({
  page,
}) => {
  await page.getByText("Structures", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Structure name", exact: true })
    .fill("Help type");
  await page
    .getByRole("textbox", { name: "Structure description", exact: true })
    .fill("Helpful description");
  await page
    .getByRole("button", { name: "Apply structure", exact: true })
    .click();
  await page.getByText("Structures", { exact: true }).click();
  await page
    .getByRole("combobox", { name: "Structure definition", exact: true })
    .selectOption({ label: "Help type" });
  await page
    .getByRole("button", { name: "Add structure node", exact: true })
    .click();
  const before = await exportedGraph(page);
  await page
    .getByRole("button", { name: "Structure Help", exact: true })
    .click();
  await expect(page.locator(".structure-help")).toContainText(
    "Helpful description",
  );
  await expect(page.locator(".structure-help")).toContainText(
    "value: glsl.float",
  );
  await expect(page.locator(".structure-help")).not.toContainText("Uses (0)");
  expect(await exportedGraph(page)).toEqual(before);
  await page
    .getByRole("button", { name: "Cancel structure", exact: true })
    .click();
  await page.getByRole("button", { name: "New subgraph", exact: true }).click();
  await page
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  const saved = await exportedGraph(page);
  await page.getByText("Subgraph interface", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Subgraph name", exact: true })
    .fill("Cancelled");
  await page
    .getByRole("textbox", { name: "Subgraph name", exact: true })
    .press("Escape");
  expect(await exportedGraph(page)).toEqual(saved);
  await page.getByText("Subgraph interface", { exact: true }).click();
  const structure = saved.graph.resources.find(
    (r: any) => r.data.name === "Help type",
  );
  await page
    .getByRole("combobox", { name: "Port type 1", exact: true })
    .selectOption("struct@" + structure.id);
  await expect(
    page.getByRole("textbox", { name: "Port default 1", exact: true }),
  ).toHaveAttribute("readonly", "");
  await page
    .getByRole("button", { name: "Cancel interface", exact: true })
    .click();
  expect(await exportedGraph(page)).toEqual(saved);
  await page.screenshot({
    path: evidence + "/s03-help-composite.png",
    fullPage: true,
  });
});

test("G-LU-DATA-001 browser bad edge, capacity, stage and source rejection rolls back the complete transaction", async ({
  page,
}) => {
  await flow(page);
  await page
    .locator(".node h3")
    .filter({ hasText: /^Multiply$/ })
    .click();
  await page.getByRole("button", { name: "Encapsulate", exact: true }).click();
  await page.getByText("Local clipboard", { exact: true }).click();
  await page
    .getByRole("button", { name: "Copy selection", exact: true })
    .click();
  const text = page.getByRole("textbox", {
      name: "Local clipboard text",
      exact: true,
    }),
    packet = JSON.parse(await text.inputValue()),
    before = await exportedGraph(page);
  for (const kind of ["edge", "capacity", "stage", "source"]) {
    const p = structuredClone(packet);
    p.graphId = "cross-" + kind;
    const def = p.resources.find((r: any) => r.data.network),
      network = def.data.network;
    if (kind === "edge") network.edges[0].from.nodeId = "missing";
    if (kind === "capacity") {
      const node = network.nodes.find((n: any) => n.type.typeId === "multiply");
      while (network.nodes.length <= 256)
        network.nodes.push({
          ...structuredClone(node),
          id: "extra-" + network.nodes.length,
        });
    }
    if (kind === "stage") {
      network.nodes.find((n: any) => n.type.typeId === "multiply").type.typeId =
        "vertex-output";
    }
    if (kind === "source") {
      const r = {
        id: "private-source",
        type: { ...def.type, typeId: "source-definition" },
        data: {
          name: "Private",
          type: "glsl.float",
          value: 1,
          clipboard: false,
        },
        references: [],
        referencesComplete: true,
        extensions: {},
      };
      p.resources.push(r);
      p.network.nodes[0].references.push({
        slot: "private",
        kind: "resource",
        targetId: r.id,
      });
    }
    await text.fill(JSON.stringify(p));
    await page
      .getByRole("button", { name: "Paste selection", exact: true })
      .click();
    await expect(page.locator(".canvas-notice")).not.toHaveText("");
    expect(await exportedGraph(page)).toEqual(before);
  }
  await page.screenshot({
    path: evidence + "/s03-transaction-negatives.png",
    fullPage: true,
  });
});
test("S03 shared name and matrix defaults update both callers with one Undo", async ({
  page,
}) => {
  await flow(page);
  await page
    .locator(".node h3")
    .filter({ hasText: /^Multiply$/ })
    .click();
  await page.getByRole("button", { name: "Encapsulate", exact: true }).click();
  await page.getByText("Local clipboard", { exact: true }).click();
  await page
    .getByRole("button", { name: "Copy selection", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Paste selection", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  await page.getByText("Subgraph interface", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Subgraph name", exact: true })
    .fill("Shared matrix");
  await page
    .getByRole("combobox", { name: "Port type 1", exact: true })
    .selectOption("glsl.mat2");
  await page
    .getByRole("textbox", { name: "Port default 1", exact: true })
    .fill("[[1,2],[3,4]]");
  await page
    .getByRole("button", { name: "Apply interface", exact: true })
    .click();
  await page.getByRole("button", { name: "Up", exact: true }).click();
  await expect(
    page.locator(".node h3").filter({ hasText: /^Shared matrix$/ }),
  ).toHaveCount(2);
  const doc = await exportedGraph(page),
    calls = doc.graph.stages
      .find((s: any) => s.key === "pixel")
      .network.nodes.filter((n: any) => n.type.typeId === "call");
  expect(calls.map((n: any) => n.name).sort()).toEqual([
    "Subgraph",
    "Subgraph 2",
  ]);
  for (const call of calls)
    expect(Object.values(call.inputValues)).toContainEqual([
      [1, 2],
      [3, 4],
    ]);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.locator(".node h3").filter({ hasText: /^Subgraph$/ }),
  ).toHaveCount(2);
  await page.screenshot({
    path: evidence + "/s03-shared-matrix.png",
    fullPage: true,
  });
});
test("S03 clickable breadcrumbs discard stale interface drafts and selected ports", async ({
  page,
}) => {
  await page.getByRole("button", { name: "New subgraph", exact: true }).click();
  await page
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  await page.getByRole("button", { name: "New subgraph", exact: true }).click();
  await page
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  await expect(page.locator(".canvas-breadcrumb [data-depth]")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Inputs output Value", exact: true })
    .click();
  await page.getByText("Subgraph interface", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Subgraph name", exact: true })
    .fill("Discarded draft");
  await page.locator('.canvas-breadcrumb [data-depth="0"]').click();
  await expect(page.locator(".canvas")).toHaveAttribute("data-path", "");
  await expect(
    page.getByRole("button", { name: "Apply interface", exact: true }),
  ).not.toBeVisible();
  await page
    .getByRole("button", { name: "Image output input color", exact: true })
    .click();
  await expect(page.locator(".canvas-notice")).not.toContainText("EDGE_");
  await page.screenshot({
    path: evidence + "/s03-breadcrumb.png",
    fullPage: true,
  });
});
test("S03 direction-specific Add16 controls preserve draft and allow output creation", async ({
  page,
}) => {
  await page.getByRole("button", { name: "New subgraph", exact: true }).click();
  await page
    .getByRole("button", { name: "Enter subgraph", exact: true })
    .click();
  await page.getByText("Subgraph interface", { exact: true }).click();
  for (let i = 0; i < 15; i++)
    await page
      .getByRole("button", { name: "Add interface port", exact: true })
      .click();
  await expect(
    page.getByRole("button", { name: "Add interface port", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("combobox", { name: "New port direction", exact: true })
    .selectOption("output");
  await expect(
    page.getByRole("button", { name: "Add interface port", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Add interface port", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply interface", exact: true })
    .click();
  await expect(page.locator(".canvas-notice")).toHaveText("");
  const doc = await exportedGraph(page),
    network = doc.graph.resources.find((r: any) => r.data.network).data;
  expect(
    network.interface.filter((p: any) => p.direction === "input"),
  ).toHaveLength(16);
  expect(
    network.interface.filter((p: any) => p.direction === "output"),
  ).toHaveLength(2);
});
test("S03 Structure description and fixed array controls keep field identity across cancel/reorder", async ({
  page,
}) => {
  await page.getByText("Structures", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Structure name", exact: true })
    .fill("ArrayPair");
  await page
    .getByRole("textbox", { name: "Structure description", exact: true })
    .fill("Array description \u4e2d\ud83c\udf47");
  await page
    .getByRole("button", { name: "Add structure field", exact: true })
    .click();
  await page
    .getByRole("checkbox", { name: "Field array 2", exact: true })
    .check();
  await page
    .getByRole("spinbutton", { name: "Field array length 2", exact: true })
    .fill("3");
  await page
    .getByRole("button", { name: "Apply structure", exact: true })
    .click();
  const first = (await exportedGraph(page)).graph.resources.find(
    (r: any) => r.data.name === "ArrayPair",
  ).data;
  expect(first.description).toContain("Array description");
  expect(first.fields[1].type).toBe('array@["glsl.float",3]');
  await page.getByText("Structures", { exact: true }).click();
  await page
    .getByRole("combobox", { name: "Structure definition", exact: true })
    .selectOption({ label: "ArrayPair" });
  await page
    .getByRole("button", { name: "Move field up 2", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Cancel structure", exact: true })
    .click();
  expect(
    (await exportedGraph(page)).graph.resources.find(
      (r: any) => r.data.name === "ArrayPair",
    ).data.fields,
  ).toEqual(first.fields);
  await page.getByText("Structures", { exact: true }).click();
  await page
    .getByRole("button", { name: "Move field up 2", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply structure", exact: true })
    .click();
  expect(
    (await exportedGraph(page)).graph.resources
      .find((r: any) => r.data.name === "ArrayPair")
      .data.fields.map((f: any) => f.id),
  ).toEqual(first.fields.map((f: any) => f.id).reverse());
  await page.screenshot({
    path: evidence + "/s03-structure-arrays.png",
    fullPage: true,
  });
});
test("S03 browser cross-Graph paste imports independent closure and Undo removes it", async ({
  page,
}) => {
  await flow(page);
  await page
    .locator(".node h3")
    .filter({ hasText: /^Multiply$/ })
    .click();
  await page.getByRole("button", { name: "Encapsulate", exact: true }).click();
  await page.getByText("Local clipboard", { exact: true }).click();
  await page
    .getByRole("button", { name: "Copy selection", exact: true })
    .click();
  const packet = JSON.parse(
    await page
      .getByRole("textbox", { name: "Local clipboard text" })
      .inputValue(),
  );
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "New document", exact: true }).click();
  await flow(page);
  await page.getByText("Local clipboard", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Local clipboard text" })
    .fill(JSON.stringify(packet));
  await page
    .getByRole("button", { name: "Paste selection", exact: true })
    .click();
  await expect(page.locator(".node")).toHaveCount(5);
  const imported = await exportedGraph(page);
  expect(imported.graph.id).not.toBe(packet.graphId);
  expect(imported.graph.resources).toHaveLength(packet.resources.length);
  expect(
    imported.graph.resources.every(
      (r: any) => !packet.resources.some((old: any) => old.id === r.id),
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".node")).toHaveCount(4);
  expect((await exportedGraph(page)).graph.resources).toHaveLength(0);
});
