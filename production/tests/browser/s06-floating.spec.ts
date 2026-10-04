import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
// Public presentation primitive on disposable DOM; not a physical-device qualification.
test("S06 shared floating consumers bound alignments focus semantics and disposal independently", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const url = "/src/ui/floating.ts",
      { floatingSurface } = await import(url);
    const fixture = document.createElement("div");
    document.body.append(fixture);
    const consumers = ["start", "end", "modal"].map((kind, i) => {
      const trigger = document.createElement("button"),
        content = document.createElement("div");
      trigger.textContent = "Fixture " + kind;
      Object.assign(trigger.style, {
        position: "fixed",
        left: i * 190 + 20 + "px",
        bottom: "90px",
        zIndex: "1000",
      });
      fixture.append(trigger);
      content.tabIndex = 0;
      content.textContent = "Read-only " + kind;
      const view = floatingSurface({
        host: fixture,
        trigger,
        content,
        title: kind + " fixture",
        closeLabel: "Close " + kind,
        kind: kind === "modal" ? "modal" : "anchored",
        align: kind === "end" ? "end" : "start",
        width: 320,
        maxHeight: 220,
        dismissOutside: false,
      });
      trigger.onclick = () => view.toggle();
      return { view, trigger };
    });
    (window as any).__floatingFixture = {
      consumers,
      dispose: () => {
        consumers.forEach((c) => c.view.dispose());
        fixture.remove();
      },
    };
  });
  await page
    .getByRole("button", { name: "Fixture start", exact: true })
    .click();
  await page.getByRole("button", { name: "Fixture end", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "start fixture", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Fixture end", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("dialog", { name: "start fixture", exact: true }),
  ).toBeVisible();
  const records = [];
  for (const width of [1440, 620]) {
    await page.setViewportSize({ width, height: 380 });
    await expect
      .poll(async () => {
        const current = (await page
          .getByRole("dialog", { name: "start fixture", exact: true })
          .boundingBox())!;
        return current.y + current.height;
      })
      .toBeLessThanOrEqual(372);
    const box = await page
      .getByRole("dialog", { name: "start fixture", exact: true })
      .boundingBox();
    const trigger = await page
      .getByRole("button", { name: "Fixture start", exact: true })
      .boundingBox();
    expect(box!.x).toBe(
      Math.max(8, Math.min(trigger!.x, width - box!.width - 8)),
    );
    expect(box!.x).toBeGreaterThanOrEqual(8);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width - 8);
    expect(box!.y + box!.height).toBeLessThanOrEqual(372);
    records.push(box);
  }
  await page
    .getByRole("button", { name: "Fixture modal", exact: true })
    .click();
  const modal = page.getByRole("dialog", {
    name: "modal fixture",
    exact: true,
  });
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    expect(
      await modal.evaluate((e) => e.contains(document.activeElement)),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Fixture modal", exact: true }),
  ).toBeFocused();
  await page.evaluate(() =>
    (window as any).__floatingFixture.consumers[1].view.dispose(),
  );
  await expect(
    page.getByRole("dialog", { name: "start fixture", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("dialog", { name: "start fixture", exact: true })
    .getByRole("button", { name: "Close start" })
    .click();
  await page
    .getByRole("button", { name: "Fixture start", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "start fixture", exact: true }),
  ).toBeVisible();
  await page.evaluate(() => (window as any).__floatingFixture.dispose());
  const late = await page.evaluate(() =>
    (window as any).__floatingFixture.consumers.map((c: any) => c.view.open()),
  );
  expect(late).toEqual([false, false, false]);
  await expect(page.locator("dialog[aria-label$='fixture']")).toHaveCount(0);
  fs.writeFileSync(
    path.join(process.env.GRAPE_EVIDENCE_DIR!, "floating-lifetime.json"),
    JSON.stringify(
      {
        records,
        late,
        method:
          "Multiple real shared consumers; trusted open/Escape/Tab plus explicit synthetic disposal boundary",
      },
      null,
      2,
    ),
  );
});

test("S06 scoped floating presentation is revoked independently across remounts", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { PresentationSession } = await import("/src/ui/mount.ts");
    const host = document.createElement("section");
    document.querySelector("main")!.append(host);
    const all: any[] = [];
    const view = {
      kind: "panel",
      capture: () => ({}),
      subscribe: () => () => {},
      dispose: () => {},
      mount: (m: any) => {
        const trigger = document.createElement("button"),
          content = document.createElement("div");
        trigger.textContent = "Owned trigger";
        content.textContent = "Owned content";
        host.append(trigger);
        m.scope.own(() => trigger.remove());
        const options = {
          host,
          trigger,
          content,
          title: "Owned surface",
          closeLabel: "Close owned",
          kind: "anchored",
          width: 280,
          maxHeight: 180,
        };
        const floating = m.floating(options);
        all.push({
          floating,
          lateCreate: () =>
            m.floating({ ...options, content: document.createElement("div") }),
        });
        return { update: () => {} };
      },
    };
    const s = new PresentationSession(view, {
      locale: "en",
      subscribe: () => () => {},
      resolve: (r: any) => ({ text: r.fallback }),
    });
    s.mount({ protocol: "grape.dom.v1", target: host });
    const opened = all[0].floating.open();
    s.unmount();
    const old = all[0].floating.open(),
      late = all[0].lateCreate().open();
    s.mount({ protocol: "grape.dom.v1", target: host });
    const fresh = all[1].floating.open();
    all[0].floating.close();
    const independent = all[1].floating.isOpen();
    s.dispose();
    const after = all[1].floating.open(),
      remaining = host.querySelectorAll("dialog").length;
    host.remove();
    return { opened, old, late, fresh, independent, after, remaining };
  });
  expect(result).toEqual({
    opened: true,
    old: false,
    late: false,
    fresh: true,
    independent: true,
    after: false,
    remaining: 0,
  });
  fs.writeFileSync(
    path.join(process.env.GRAPE_EVIDENCE_DIR!, "floating-mount-lifetime.json"),
    JSON.stringify(
      {
        method:
          "Synthetic public PresentationSession lifecycle fixture; no model injection",
        result,
      },
      null,
      2,
    ),
  );
});
