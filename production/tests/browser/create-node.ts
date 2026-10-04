import { expect, type Page } from "@playwright/test";
/** Shared public authoring path replacing the retired per-definition toolbar buttons. */
export async function createNode(page: Page, name: string) {
  const canvas = page.locator(".canvas").last();
  const count = await canvas.locator(".nodes .node").count();
  await canvas.getByRole("button", { name: "Add Node", exact: true }).click();
  const browser = canvas.getByRole("dialog", { name: "Node catalog" }),
    fixed = name === "Float (fixed)",
    label = fixed ? "Float" : name;
  await browser.getByLabel("Search nodes", { exact: true }).fill(label);
  await browser.getByLabel("Node source", { exact: true }).selectOption("");
  if (label === "Float")
    await browser
      .getByLabel("Node source", { exact: true })
      .selectOption(fixed ? "grape.nodes.fixed-values" : "grape.nodes.basic");
  await browser
    .getByRole("button", { name: "Add " + label, exact: true })
    .click();
  const point = await canvas.evaluate((el, n) => {
    const r = el.getBoundingClientRect(),
      v = el.querySelector<HTMLElement>(".viewport")!,
      m = new DOMMatrix(getComputedStyle(v).transform);
    return {
      x: r.left + m.e + (40 + ((n - 1) % 3) * 235) * m.a,
      y: r.top + m.f + (85 + Math.floor((n - 1) / 3) * 225) * m.d,
    };
  }, count);
  await page.mouse.move(point.x, point.y);
  await page.mouse.click(point.x, point.y);
  await expect(canvas.locator(".nodes .node")).toHaveCount(count + 1);
}
