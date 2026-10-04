import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { valueCases, valueFixture } from "../fixtures/s05-values.ts";
import {
  exportDocument,
  openValidFile,
  saveReopen,
} from "../fixtures/s05-delivered-flows.ts";
const evidence = process.env.GRAPE_EVIDENCE_DIR!;
test("S05 vector mounted scoped widgets preserve concurrent edits IME readonly and disposal", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { valueFixture } = await import("/tests/fixtures/s05-values.ts"),
      { EditorApplication } = await import("/src/application/editor.ts"),
      { MemoryStorage } = await import("/tests/fixtures/setup.ts"),
      { currentImageKind } = await import("/src/modules/image-current.ts"),
      { WidgetRegistry } = await import("/src/ui/widgets.ts"),
      { vectorWidget } = await import("/src/features/vector-control.ts"),
      { Localization } = await import("/src/localization/service.ts");
    const s = valueFixture("vec3"),
      app = new EditorApplication(
        s.definitions,
        s.identity,
        currentImageKind.ref,
        s.profile,
        new MemoryStorage(),
        { download: async () => {} },
      );
    app.openText(JSON.stringify(s.graph.capture().document));
    const a = app.context(),
      b = app.context();
    a.select([s.leaf]);
    b.select([s.leaf]);
    const fa = app.parameter(a, s.leaf, "value", a.capture().scope),
      fb = app.parameter(b, s.leaf, "value", b.capture().scope),
      registry = new WidgetRegistry(),
      locale = new Localization();
    registry.register(vectorWidget, () => true);
    const slot = registry.open(fa, locale),
      anchor = document.createElement("div");
    document.body.append(anchor);
    slot.mount({ protocol: "grape.dom.v1", target: anchor });
    const inputs = [...anchor.querySelectorAll("input")],
      error = anchor.querySelector("[role=alert]");
    const input = (i, v) => {
        inputs[i].value = v;
        inputs[i].dispatchEvent(new Event("input", { bubbles: true }));
      },
      key = (i, k) =>
        inputs[i].dispatchEvent(
          new KeyboardEvent("keydown", { key: k, bubbles: true }),
        );
    input(0, "0.2");
    fb.commit([1, 0.7, 1], fb.capture().editToken);
    const authoritative = JSON.stringify(app.snapshot);
    key(0, "Enter");
    const stale = {
      error: error.textContent,
      preserved: JSON.stringify(app.snapshot) === authoritative,
      draft: inputs[0].value,
    };
    key(0, "Escape");
    const cancelled = inputs.map((x) => x.value);
    inputs[0].dispatchEvent(
      new CompositionEvent("compositionstart", { bubbles: true }),
    );
    input(0, "0.3");
    key(0, "Enter");
    const imePreserved = JSON.stringify(app.snapshot) === authoritative;
    inputs[0].dispatchEvent(
      new CompositionEvent("compositionend", { bubbles: true }),
    );
    key(0, "Enter");
    const committed = fb.capture().projection.value;
    input(2, "0.4");
    app.setReadonly(true);
    const locked = JSON.stringify(app.snapshot);
    key(2, "Enter");
    const readonly = {
      error: error.textContent,
      preserved: JSON.stringify(app.snapshot) === locked,
      readOnly: inputs.every((x) => x.readOnly),
    };
    app.setReadonly(false);
    key(2, "Escape");
    input(0, "0.9");
    slot.dispose();
    const disposedBefore = JSON.stringify(app.snapshot);
    key(0, "Enter");
    const disposal = {
      preserved: disposedBefore === JSON.stringify(app.snapshot),
      removed: anchor.children.length === 0,
    };
    fb.dispose();
    anchor.remove();
    return { stale, cancelled, imePreserved, committed, readonly, disposal };
  });
  expect(result.stale.error).toContain("STALE_EDIT");
  expect(result.stale.preserved).toBe(true);
  expect(result.stale.draft).toBe("0.2");
  expect(result.cancelled).toEqual(["1", "0.7", "1"]);
  expect(result.imePreserved).toBe(true);
  expect(result.committed).toEqual([0.3, 0.7, 1]);
  expect(result.readonly.preserved).toBe(true);
  expect(result.readonly.readOnly).toBe(true);
  expect(result.readonly.error).toMatch(/READONLY|FIELD_READONLY/);
  expect(result.disposal).toEqual({ preserved: true, removed: true });
  await fs.writeFile(
    evidence + "/vector-lifetime.json",
    JSON.stringify(result, null, 2),
    { flag: "wx" },
  );
});
test("S05 fixed values backend feasibility: all leaves stages modes and components execute", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  const rows = await page.evaluate(async () => {
    const { valueCases, valueFixture } =
        await import("/tests/fixtures/s05-values.ts"),
      { compile } = await import("/src/generation/compiler.ts"),
      { executeGL } = await import("/tests/fixtures/s05-webgl.ts"),
      { executeLinkedUniforms } =
        await import("/tests/fixtures/s05-linked-webgl.ts");
    const rows = [];
    for (const item of valueCases)
      for (const stage of ["pixel", "vertex"])
        for (const mode of ["root", "expand", "function", "nested"])
          for (const edited of [false, true]) {
            const s = valueFixture(item.key, stage, mode, edited),
              before = JSON.stringify(s.graph.capture()),
              out = compile(s.graph.capture(), s.fixed, s.profile);
            const result =
              stage === "pixel" ? executeGL(out) : executeLinkedUniforms(out);
            rows.push({
              leaf: item.key,
              stage,
              mode,
              edited,
              expected: s.expected,
              result,
              unchanged: before === JSON.stringify(s.graph.capture()),
              artifacts: out.artifacts,
            });
          }
    return rows;
  });
  for (const row of rows) {
    expect(row.unchanged).toBe(true);
    if (row.stage === "pixel")
      row.expected.forEach((v, i) =>
        expect(
          Math.abs(row.result.pixels[i] - Math.round(v * 255)),
        ).toBeLessThanOrEqual(1),
      );
    else {
      expect(row.result.error).toBe(0);
      expect(row.result.linked).toBe(true);
      row.expected.forEach((v, i) =>
        expect(Math.abs(row.result.position[i] - v)).toBeLessThan(1e-6),
      );
    }
  }
  expect(rows).toHaveLength(64);
  await fs.writeFile(
    evidence + "/fixed-value-numerical-matrix.json",
    JSON.stringify({ browser: browser.version(), rows }, null, 2),
    { flag: "wx" },
  );
});
for (const item of valueCases)
  for (const stage of ["pixel", "vertex"] as const)
    test(`S05 fixed ${item.key} ${stage}: public create edit connect history save and JSON reopen`, async ({
      page,
    }) => {
      page.on("dialog", (d) => void d.accept());
      await page.goto("/");
      if (stage === "vertex") {
        const s = valueFixture(item.key, "vertex", "root", false, true);
        await openValidFile(
          page,
          "vertex-workspace.grape.json",
          Buffer.from(JSON.stringify(s.graph.capture().document)),
        );
      }
      const canvas = page.locator(".canvas").first();
      await page
        .getByRole("button", { name: "Add " + item.button, exact: true })
        .click();
      await canvas
        .getByRole("heading", { name: item.label, exact: true })
        .last()
        .click();
      const initial =
          typeof item.initial === "number" ? [item.initial] : item.initial,
        edited = typeof item.edited === "number" ? [item.edited] : item.edited;
      for (let i = 0; i < item.components.length; i++) {
        const input = page.getByRole("textbox", {
          name: item.components[i],
          exact: true,
        });
        await expect(input).toHaveValue(String(initial[i]));
        await input.fill(String(edited[i]));
        await input.press("Enter");
        await expect(input).toHaveValue(String(edited[i]));
      }
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await expect(
        page.getByRole("textbox", {
          name: item.components.at(-1)!,
          exact: true,
        }),
      ).toHaveValue(String(initial.at(-1)));
      await page.getByRole("button", { name: "Redo", exact: true }).click();
      await expect(
        page.getByRole("textbox", {
          name: item.components.at(-1)!,
          exact: true,
        }),
      ).toHaveValue(String(edited.at(-1)));
      const first = page.getByRole("textbox", {
        name: item.components[0],
        exact: true,
      });
      await first.fill("Infinity");
      await first.press("Enter");
      await expect(first).toHaveAttribute("aria-invalid", "true");
      await first.press("Escape");
      await expect(first).toHaveValue(String(edited[0]));
      await canvas
        .getByRole("button", { name: item.label + " output out", exact: true })
        .click();
      await canvas
        .getByRole("button", {
          name:
            stage === "pixel"
              ? "Image output input color"
              : "Position input Value",
          exact: true,
        })
        .click();
      await page
        .getByRole("button", { name: "Generate GLSL", exact: true })
        .click();
      await expect(
        page.getByText("Generated successfully · Host-free GLSL", {
          exact: true,
        }),
      ).toBeVisible();
      const document = await exportDocument(page),
        node = document.graph.stages
          .find((x: any) => x.key === stage)
          .network.nodes.find(
            (x: any) =>
              x.type.moduleId === "grape.nodes.fixed-values" &&
              x.type.typeId === item.key,
          );
      expect(node.state.value).toEqual(item.edited);
      expect(node.ports).toEqual([
        { key: "out", direction: "output", type: item.type },
      ]);
      await saveReopen(page);
      await openValidFile(
        page,
        item.key + ".grape.json",
        Buffer.from(JSON.stringify(document)),
      );
      expect(await exportDocument(page)).toEqual(document);
      await page.screenshot({
        path: evidence + `/fixed-${item.key}-${stage}.png`,
        fullPage: true,
      });
      await fs.writeFile(
        evidence + `/fixed-${item.key}-${stage}.json`,
        JSON.stringify(
          {
            leaf: item.key,
            stage,
            document,
            operations: [
              "public create",
              "every component edit",
              "one-component Undo/Redo",
              "nonfinite rejection and Escape",
              "fixed out connection",
              "Generate",
              "save/reopen",
              "JSON export/file review/new session",
            ],
          },
          null,
          2,
        ),
        { flag: "wx" },
      );
    });

for (const item of valueCases)
  test(`S05 fixed ${item.key}: shared Function nested Inspector edits persist across both Canvas occurrences`, async ({
    page,
  }) => {
    page.on("dialog", (d) => void d.accept());
    await page.goto("/");
    const s = valueFixture(item.key, "pixel", "function");
    await openValidFile(
      page,
      item.key + "-function.grape.json",
      Buffer.from(JSON.stringify(s.graph.capture().document)),
    );
    const enter = async (canvas) => {
      await canvas
        .getByRole("heading", { name: "Subgraph", exact: true })
        .first()
        .click();
      await canvas
        .getByRole("button", { name: "Enter subgraph", exact: true })
        .click();
      await canvas
        .getByRole("heading", { name: item.label, exact: true })
        .click();
    };
    await enter(page.locator(".canvas").first());
    const v = typeof item.edited === "number" ? [item.edited] : item.edited;
    for (let i = 0; i < item.components.length; i++) {
      const input = page.getByRole("textbox", {
        name: item.components[i],
        exact: true,
      });
      await input.fill(String(v[i]));
      await input.press("Enter");
    }
    await page
      .getByRole("button", { name: "Second Canvas", exact: true })
      .click();
    await enter(page.locator(".canvas").nth(1));
    for (let i = 0; i < item.components.length; i++)
      await expect(
        page.getByRole("textbox", { name: item.components[i], exact: true }),
      ).toHaveValue(String(v[i]));
    const changed = await exportDocument(page);
    expect(
      changed.graph.resources
        .find((r: any) => r.data?.network?.id === s.bodies[0])
        .data.network.nodes.find((n: any) => n.id === s.leaf).state.value,
    ).toEqual(item.edited);
    await saveReopen(page);
    await page
      .getByRole("button", { name: "Generate GLSL", exact: true })
      .click();
    await expect(
      page.getByText("Generated successfully · Host-free GLSL", {
        exact: true,
      }),
    ).toBeVisible();
    await fs.writeFile(
      evidence + `/fixed-${item.key}-shared.json`,
      JSON.stringify(
        { document: changed, sharedContexts: true, saved: true },
        null,
        2,
      ),
      { flag: "wx" },
    );
  });
