import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
for (const width of [620, 1440])
  test(`S06 brand identity and updates stay in one header at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    const brand = page.locator("header .brand"),
      button = brand.getByRole("button", { name: "本輪更新", exact: true });
    await expect(page.locator("#app > header")).toHaveCount(1);
    await expect(button).toBeVisible();
    const identity = await brand.locator(".build-identity").innerText();
    expect(identity).toMatch(
      /^(Development · unversioned|S06-debug-[a-f0-9]{7})$/,
    );
    const box = (await button.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    await button.click();
    const dialog = page.getByRole("dialog", { name: "本輪更新", exact: true });
    await expect(dialog).toContainText(identity);
    await page.screenshot({
      path: path.join(
        process.env.GRAPE_EVIDENCE_DIR!,
        `brand-updates-${width}.png`,
      ),
    });
    await page.keyboard.press("Escape");
    await expect(button).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "關閉本輪更新" }).click();
    await expect(button).toBeFocused();
    await page.screenshot({
      path: path.join(
        process.env.GRAPE_EVIDENCE_DIR!,
        `brand-header-${width}.png`,
      ),
    });
    fs.writeFileSync(
      path.join(process.env.GRAPE_EVIDENCE_DIR!, `brand-${width}.json`),
      JSON.stringify(
        { identity, width, button: box, headers: 1, keyboardAndClose: true },
        null,
        2,
      ),
    );
  });
