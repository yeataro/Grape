import fs from "node:fs";
import path from "node:path";
import { expect, type Page } from "@playwright/test";

/** Public, natural event path. Never refocus Canvas from the test. */
export async function naturalEscapeFlow(
  page: Page,
  origin: string,
  wrapper: boolean,
  exportFirst: boolean,
  fixture: Buffer,
  output: string,
) {
  page.on("dialog", (dialog) => void dialog.accept());
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const wrapperURL = origin + "/escape-wrapper.html";
  if (wrapper)
    await page.route(wrapperURL, (route) =>
      route.fulfill({
        contentType: "text/html",
        body: '<!doctype html><title>Isolated Canvas wrapper</title><iframe src="/" style="position:fixed;inset:0;width:100%;height:100%;border:0"></iframe>',
      }),
    );
  await page.goto(wrapper ? wrapperURL : origin);
  const app = wrapper ? page.frameLocator("iframe") : page;
  await app.getByLabel("Open document file", { exact: true }).setInputFiles({
    name: "fixture-14-Multiply.json",
    mimeType: "application/json",
    buffer: fixture,
  });
  await app
    .getByRole("button", { name: "Open in new session", exact: true })
    .click();
  await expect(app.locator("#recovery")).toBeHidden();
  const frame = wrapper
    ? page
        .frames()
        .find((f) => f !== page.mainFrame() && f.url() === origin + "/")!
    : page.mainFrame();
  await frame.evaluate(() => {
    const describe = (el: any) => ({
      tag: el?.tagName,
      className: el?.className,
      node: el?.dataset?.node,
    });
    (globalThis as any).__escapeTrace = [];
    for (const type of [
      "pointerdown",
      "pointerup",
      "mousedown",
      "mouseup",
      "keydown",
      "focusin",
      "focusout",
    ])
      document.addEventListener(
        type,
        (event: any) => {
          (globalThis as any).__escapeTrace.push({
            type,
            key: event.key,
            target: describe(event.target),
            active: describe(document.activeElement),
            path: event.composedPath().slice(0, 6).map(describe),
            time: performance.now(),
          });
        },
        true,
      );
  });
  const title = app
    .locator(".canvas")
    .first()
    .getByRole("heading", { name: "Multiply", exact: true });
  const position = () =>
    title.evaluate((el) => {
      const card = el.closest<HTMLElement>(".node")!;
      return [parseFloat(card.style.left), parseFloat(card.style.top)];
    });
  const exportDocument = async () => {
    const downloaded = page.waitForEvent("download");
    const exportButton = app.getByRole("menuitem", {
      name: "Export JSON",
      exact: true,
    });
    if (!(await exportButton.isVisible()))
      await app
        .getByRole("button", { name: "Project actions", exact: true })
        .click();
    await exportButton.click();
    return JSON.parse(
      fs.readFileSync((await (await downloaded).path())!, "utf8"),
    );
  };
  const drag = async (dx: number, dy: number) => {
    const box = (await title.boundingBox())!;
    const x = box.x + box.width / 2,
      y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + dx, y + dy, { steps: 8 });
  };
  await title.click();
  if (exportFirst) await exportDocument();
  const initial = await position();
  await drag(100, 60);
  await page.mouse.up();
  const committed = await position();
  expect(committed).toEqual([initial[0] + 100, initial[1] + 60]);
  if (exportFirst) await exportDocument();
  await app.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await position()).toEqual(initial);
  if (exportFirst) await exportDocument();
  await app.getByRole("button", { name: "Redo", exact: true }).click();
  if (exportFirst) await exportDocument();
  const beforeEscape = await position();
  await drag(70, 30);
  const during = await position();
  const active = await frame.evaluate(() => ({
    tag: document.activeElement?.tagName,
    className: document.activeElement?.className,
  }));
  await page.keyboard.press("Escape");
  const afterEscape = await position();
  const boxAfterEscape = (await title.boundingBox())!;
  await page.mouse.move(
    boxAfterEscape.x + boxAfterEscape.width / 2 + 90,
    boxAfterEscape.y + boxAfterEscape.height / 2 + 40,
  );
  const afterHeldMove = await position();
  await page.mouse.up();
  const afterPointerUp = await position();
  const trace = await frame.evaluate(() => (globalThis as any).__escapeTrace);
  const result: any = {
    wrapper,
    exportFirst,
    initial,
    committed,
    beforeEscape,
    during,
    active,
    afterEscape,
    afterHeldMove,
    afterPointerUp,
    trace,
    errors,
  };
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(result, null, 2) + "\n", {
    flag: "wx",
  });
  await page.screenshot({ path: output + ".png", fullPage: true });
  expect(afterEscape).toEqual(beforeEscape);
  expect(afterHeldMove).toEqual(beforeEscape);
  expect(afterPointerUp).toEqual(beforeEscape);
  expect(
    trace
      .filter((e: any) => e.type === "keydown" && e.key === "Escape")
      .at(-1)
      .path.some((e: any) => e.className?.split?.(" ").includes("canvas")),
  ).toBe(true);
  // Cancel must not insert a History entry: Undo reaches the first drag's start.
  await app.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await position()).toEqual(initial);
  await expect(
    app.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
  await app.getByRole("button", { name: "Redo", exact: true }).click();
  expect(await position()).toEqual(committed);
  const document = await exportDocument();
  expect(
    document.graph.stages
      .flatMap((s: any) => s.network.nodes)
      .find((n: any) => n.name === "Multiply").position,
  ).toEqual(committed);
  expect(errors).toEqual([]);
  fs.writeFileSync(
    output + ".verified.json",
    JSON.stringify(
      {
        status: "PASS",
        naturalKeyboard: true,
        noTestRefocus: true,
        cancelHasNoHistoryEntry: true,
        document,
      },
      null,
      2,
    ) + "\n",
    { flag: "wx" },
  );
}
