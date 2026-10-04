import { expect, type Page } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { clickAction } from "./public-actions.ts";
/** Public import of an unchanged 0.2 exact owner; keeps required-input error fixtures explicit. */
export async function requiredOutput(page: Page) {
  await clickAction(page, "Open file");
  await page
    .getByLabel("Open document file", { exact: true })
    .setInputFiles(
      fileURLToPath(
        new URL("./required-image-output.grape.json", import.meta.url),
      ),
    );
  await expect(page.locator("#recovery")).toContainText("INPUT_REQUIRED");
  page.once("dialog", (d) => void d.accept().catch(() => {}));
  await page
    .getByRole("button", { name: "Open in new session", exact: true })
    .click();
}
