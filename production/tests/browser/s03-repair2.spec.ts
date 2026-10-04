import { createNode } from "./create-node.ts";
import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
const evidence = process.env.GRAPE_EVIDENCE_DIR!;
async function exported(page: any) {
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  return JSON.parse(await fs.readFile((await (await event).path())!, "utf8"));
}
for (const element of ["glsl.float", "glsl.vec2"])
  test(`S03 EG01 round2 browser rejects inline ${element} array cross-Graph and retains Redo`, async ({
    page,
  }) => {
    await page.goto("/");
    await createNode(page, "Compose");
    await page
      .getByRole("button", { name: "Compose output result", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Image output input color", exact: true })
      .click();
    await createNode(page, "Float");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    const packet = await page.evaluate(async (element) => {
      const { flow } = await import("/tests/fixtures/setup.ts"),
        { copySelection } = await import("/src/model/transfer.ts");
      const s = flow();
      let node = "";
      s.graph.change("Inline array", (d: any) => {
        const id = d.createSource(
          "Inline",
          "array@" + JSON.stringify([element, 2]),
          element === "glsl.float"
            ? [1, 2]
            : [
                [1, 2],
                [3, 4],
              ],
        );
        node = d.addReferenceNode(s.network, "source", id);
      });
      return copySelection(s.graph.capture(), s.fixed, s.network, [node]);
    }, element);
    const before = await exported(page),
      revision = await page.locator(".canvas").getAttribute("data-revision");
    expect(before.graph.id).not.toBe(packet.graphId);
    await page.getByText("Local clipboard", { exact: true }).click();
    await page
      .getByRole("textbox", { name: "Local clipboard text" })
      .fill(JSON.stringify(packet));
    await page
      .getByRole("button", { name: "Paste selection", exact: true })
      .click();
    await expect(page.locator("body")).toContainText("SOURCE_CLIPBOARD_DENIED");
    expect(await exported(page)).toEqual(before);
    expect(await page.locator(".canvas").getAttribute("data-revision")).toBe(
      revision,
    );
    await expect(
      page.getByRole("button", { name: "Redo", exact: true }),
    ).toBeEnabled();
    await page.screenshot({
      path: evidence + "/repair2-inline-" + element + ".png",
      fullPage: true,
    });
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(page.locator(".node")).toHaveCount(3);
  });
