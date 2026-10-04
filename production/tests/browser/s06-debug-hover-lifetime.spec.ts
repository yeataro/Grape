import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
// Source-only public mount seam exercise. No private Graph injection; not a physical-device claim.
test("S06 diagnostic mount revoke hide move update and late callback cannot revive old object data", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByText("Experimental features", { exact: true }).click();
  await page
    .getByRole("checkbox", {
      name: "Show object information instead of normal hover hints",
    })
    .check();
  await page.keyboard.press("Escape");
  await page.evaluate(async () => {
    const url = "/src/ui/mount.ts",
      { PresentationSession } = await import(url);
    const surface = document.createElement("section");
    surface.id = "hover-lifetime-fixture";
    document.querySelector("main")!.append(surface);
    let value = "old",
      sequence = 0,
      update: () => void = () => {},
      oldScope: any,
      ticket: any,
      stale: any;
    const view = {
      kind: "panel",
      capture: () => ({ value }),
      subscribe: (f: () => void) => {
        update = f;
        return () => {};
      },
      dispose: () => {},
      mount: (m: any) => {
        const node = document.createElement("button");
        node.textContent = "Lifetime target";
        node.dataset.mount = String(++sequence);
        m.surface.target.append(node);
        m.scope.own(() => node.remove());
        const hover = m.hover(node);
        oldScope ??= m.scope;

        return {
          update: (p: any) => {
            hover.set(node, () => ({
              kind: "Node",
              name: "Lifetime target",
              identity: "same-persistent-id",
              state: "UI-only fixture",
              data: { value: p.value },
            }));
            stale ??= () =>
              hover.set(node, () => ({
                kind: "Node",
                name: "STALE",
                identity: "same-persistent-id",
                state: "revoked",
              }));
          },
        };
      },
    };
    const session = new PresentationSession(view, {
      locale: "en",
      subscribe: () => () => {},
      resolve: (ref: any) => ({ text: ref.fallback }),
    });
    session.mount({ protocol: "grape.dom.v1", target: surface });
    ticket = oldScope.ticket();
    (window as any).__hoverLifetime = {
      session,
      surface,
      initiallyAccepts: () => oldScope.accept(ticket, () => {}),
      rearm: () => {
        ticket = oldScope.ticket();
        return oldScope.accept(ticket, () => {});
      },
      change: () => {
        value = "current";
        update();
      },
      late: () =>
        oldScope.accept(ticket, () => {
          stale();
        }),
      stale: () => stale(),
      move: () => {
        session.unmount();
        document.querySelector("#code")!.append(surface);
        session.mount({ protocol: "grape.dom.v1", target: surface });
      },
    };
  });
  const target = page.getByRole("button", {
      name: "Lifetime target",
      exact: true,
    }),
    details = page.getByRole("dialog", {
      name: "Object information",
      exact: true,
    });
  expect(
    await page.evaluate(() =>
      (window as any).__hoverLifetime.initiallyAccepts(),
    ),
  ).toBe(true);
  await target.hover();
  await expect(page.locator(".hover-summary")).toContainText("Lifetime target");
  await page
    .getByRole("button", { name: "Read object details", exact: true })
    .click();
  await expect(details).toContainText('"old"');
  await page.evaluate(() => (window as any).__hoverLifetime.change());
  await expect(details).not.toBeVisible();
  expect(
    await page.evaluate(() => (window as any).__hoverLifetime.late()),
  ).toBe(false);
  expect(
    await page.evaluate(() => (window as any).__hoverLifetime.rearm()),
  ).toBe(true);
  await page.mouse.move(1, 1);
  await target.hover();
  await expect(page.locator(".hover-summary")).toContainText("Lifetime target");
  await page
    .getByRole("button", { name: "Read object details", exact: true })
    .click();
  await expect(details).toContainText('"current"');
  await page.evaluate(() => {
    (window as any).__hoverLifetime.surface.hidden = true;
  });
  await expect(details).not.toBeVisible();
  await page.evaluate(() => {
    (window as any).__hoverLifetime.surface.hidden = false;
    (window as any).__hoverLifetime.move();
  });
  await page
    .getByRole("button", { name: "Shader output", exact: true })
    .click();
  await expect(target).toHaveAttribute("data-mount", "2");
  expect(
    await page.evaluate(() => (window as any).__hoverLifetime.late()),
  ).toBe(false);
  await page.evaluate(() => (window as any).__hoverLifetime.stale());
  await target.hover();
  await expect(page.locator(".hover-summary")).toContainText("Lifetime target");
  await page
    .getByRole("button", { name: "Read object details", exact: true })
    .click();
  await expect(details).toContainText('"current"');
  await expect(details).not.toContainText("STALE");
  await page.evaluate(() => (window as any).__hoverLifetime.session.dispose());
  await expect(details).not.toBeVisible();
  await expect(target).toHaveCount(0);
  fs.writeFileSync(
    path.join(process.env.GRAPE_EVIDENCE_DIR!, "mount-lifetime.json"),
    JSON.stringify(
      {
        status: "PASS",
        method:
          "Isolated public PresentationSession and optional hover binding fixture; synthetic hide/move/update/dispose and late callback. Same persistent ID, new mount. No private model/controller access.",
        lateAccepted: false,
      },
      null,
      2,
    ) + "\n",
  );
});
