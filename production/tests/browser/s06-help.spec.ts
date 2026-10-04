import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createNode } from "./create-node.ts";
import { clickAction } from "../fixtures/public-actions.ts";

async function documentOf(page: Page) {
  const wait = page.waitForEvent("download");
  await clickAction(page, "Export JSON");
  return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8"));
}
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    (window as any).helpEvents = [];
    for (const type of [
      "pointerdown",
      "pointerup",
      "pointercancel",
      "click",
      "keydown",
      "focusin",
    ])
      document.addEventListener(
        type,
        (e) => {
          const p = e as PointerEvent;
          (window as any).helpEvents.push({
            type,
            trusted: e.isTrusted,
            target: (e.target as HTMLElement).tagName,
            x: p.clientX,
            y: p.clientY,
            pointerId: p.pointerId,
            key: (e as KeyboardEvent).key,
            open: !!document.querySelector("dialog.shortcut-help[open]"),
          });
        },
        true,
      );
  });
});
test.afterEach(async ({ page }, info) => {
  const out = process.env.GRAPE_EVIDENCE_DIR!;
  if (!path.isAbsolute(out) || !out.includes("s06"))
    throw Error("S06_EVIDENCE_REQUIRED");
  const file = path.join(
    out,
    info.title.replace(/[^a-zA-Z0-9-]/g, "_") + ".json",
  );
  fs.writeFileSync(
    file,
    JSON.stringify(
      {
        title: info.title,
        events: await page.evaluate(() => (window as any).helpEvents),
      },
      null,
      2,
    ) + "\n",
  );
});

for (const [start, end, closes] of [
  ["outside", "inside", false],
  ["inside", "outside", false],
  ["outside", "outside", true],
] as const)
  test(`S06 Help natural ${start}-to-${end} gesture preserves document and History`, async ({
    page,
  }) => {
    await createNode(page, "Multiply");
    const before = await documentOf(page);
    const opener = page.getByRole("button", { name: "Shortcuts", exact: true });
    await opener.click();
    const help = page.getByRole("dialog", { name: "Keyboard shortcuts" }),
      r = (await help.boundingBox())!;
    const points = {
      outside: { x: r.x - 20, y: r.y + 20 },
      inside: { x: r.x + 10, y: r.y + 10 },
    };
    await page.mouse.move(points[start].x, points[start].y);
    await page.mouse.down();
    await page.mouse.move(points[end].x, points[end].y, { steps: 5 });
    await page.mouse.up();
    if (closes) {
      await expect(help).toBeHidden();
      await expect(opener).toBeFocused();
    } else {
      await expect(help).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(opener).toBeFocused();
    }
    expect(await documentOf(page)).toEqual(before);
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Multiply", exact: true }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    expect(await documentOf(page)).toEqual(before);
  });

for (const reason of ["pointercancel", "blur"] as const)
  test(`S06 Help ${reason} disarms incomplete backdrop gesture and allows a new click`, async ({
    page,
  }) => {
    const before = await documentOf(page);
    await page.getByRole("button", { name: "Shortcuts", exact: true }).click();
    const help = page.getByRole("dialog", { name: "Keyboard shortcuts" }),
      r = (await help.boundingBox())!;
    await page.mouse.move(r.x - 20, r.y + 20);
    await page.mouse.down();
    // A synthetic cancellation/blur exercises the lifecycle boundary, not a physical-device claim.
    if (reason === "pointercancel")
      await help.dispatchEvent("pointercancel", {
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true,
      });
    else await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    await page.mouse.up();
    await expect(help).toBeVisible();
    await page.mouse.click(r.x - 20, r.y + 20);
    await expect(help).toBeHidden();
    expect(await documentOf(page)).toEqual(before);
  });

test("S06 Help Escape Close and reopen consume old gestures and restore usable focus", async ({
  page,
}) => {
  const before = await documentOf(page),
    opener = page.getByRole("button", { name: "Shortcuts", exact: true });
  await opener.click();
  const help = page.getByRole("dialog", { name: "Keyboard shortcuts" }),
    r = (await help.boundingBox())!;
  await page.mouse.move(r.x - 20, r.y + 20);
  await page.mouse.down();
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(help).toBeHidden();
  await expect(opener).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(help).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    help.getByRole("button", { name: "Close shortcuts" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(opener).toBeFocused();
  expect(await documentOf(page)).toEqual(before);
});

test("S06 Help keyboard menu returns focus to Canvas and remains independent across two Canvas contexts", async ({
  page,
}) => {
  await clickAction(page, "Second Canvas");
  const canvas = page.locator(".canvas").first(),
    r = (await canvas.boundingBox())!;
  await page.mouse.click(r.x + 300, r.y + 230);
  await page.keyboard.press("Shift+F10");
  await page
    .getByRole("menuitem", { name: "Keyboard shortcuts", exact: true })
    .click();
  const help = canvas.getByRole("dialog", { name: "Keyboard shortcuts" });
  await expect(help).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(canvas).toBeFocused();
  await page
    .locator(".canvas")
    .nth(1)
    .getByRole("button", { name: "Shortcuts", exact: true })
    .click();
  await expect(help).toBeHidden();
  await expect(
    page
      .locator(".canvas")
      .nth(1)
      .getByRole("dialog", { name: "Keyboard shortcuts" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page
      .locator(".canvas")
      .nth(1)
      .getByRole("button", { name: "Shortcuts", exact: true }),
  ).toBeFocused();
});

test("S06 Help readonly interaction and remounted document retain scoped lifetime", async ({
  page,
}) => {
  await clickAction(page, "Lock editing");
  const before = await documentOf(page);
  await page.getByRole("button", { name: "Shortcuts", exact: true }).click();
  const old = await page.locator("dialog.shortcut-help").elementHandle();
  await page.keyboard.press("Escape");
  expect(await documentOf(page)).toEqual(before);
  await clickAction(page, "Lock editing");
  page.once("dialog", (dialog) => dialog.accept());
  await clickAction(page, "New document");
  expect(await old!.evaluate((e) => e.isConnected)).toBe(false);
  await page.getByRole("button", { name: "Shortcuts", exact: true }).click();
  await old!.evaluate((e) => {
    e.dispatchEvent(
      new PointerEvent("pointerdown", {
        clientX: -10,
        clientY: -10,
        button: 0,
        isPrimary: true,
        pointerId: 1,
      }),
    );
    e.dispatchEvent(
      new PointerEvent("click", { clientX: -10, clientY: -10, pointerId: 1 }),
    );
  });
  await expect(
    page.getByRole("dialog", { name: "Keyboard shortcuts" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
});
