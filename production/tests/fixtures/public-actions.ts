import type { Page } from "@playwright/test";

/** Follow the same responsive menu path as a user; never force a hidden control. */
export async function clickAction(page: Page, name: string) {
  const button = page
    .getByRole("button", { name, exact: true })
    .or(page.getByRole("menuitem", { name, exact: true }))
    .or(page.getByRole("menuitemcheckbox", { name, exact: true }));
  if (!(await button.isVisible())) {
    const project = page.getByRole("button", {
      name: "Project actions",
      exact: true,
    });
    if (await project.isVisible()) {
      await project.click();
    }
    const menu = page.locator(".action-overflow");
    if (
      (await menu.isVisible()) &&
      !(await menu.evaluate((e) => (e as HTMLDetailsElement).open))
    )
      await menu.locator("summary").click();
  }
  await button.click();
}
