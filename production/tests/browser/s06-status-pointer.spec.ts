import { requiredOutput } from "../fixtures/required-output.ts";
import { test, expect, type Page, type Locator } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createNode } from "./create-node.ts";
import { clickAction } from "../fixtures/public-actions.ts";
const evidence = process.env.GRAPE_EVIDENCE_DIR!;
const save = (name: string, value: unknown) =>
  fs.writeFileSync(
    path.join(evidence, name + ".json"),
    JSON.stringify(value, null, 2) + "\n",
  );
async function doc(page: Page) {
  const wait = page.waitForEvent("download");
  await clickAction(page, "Export JSON");
  return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8"));
}
async function center(l: Locator) {
  const r = (await l.boundingBox())!;
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
}
async function color(page: Page) {
  await createNode(page, "Color RGBA");
  const c = page.locator(".canvas").last();
  return {
    c,
    out: c.locator('[data-direction="output"][data-port="out"]'),
    input: c.locator('[data-direction="input"][data-port="color"]'),
  };
}
async function preview(c: Locator) {
  return c.evaluate((el) => ({
    paths: el.querySelectorAll(".connection-preview path").length,
    rings: el.querySelectorAll(".connection-preview circle").length,
    d: el.querySelector(".connection-preview path")?.getAttribute("d"),
    notice: el.querySelector(".canvas-notice")!.textContent,
  }));
}
test.beforeEach(async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await page.addInitScript(() => {
    (window as any).__statusPointerEvents = [];
    for (const type of [
      "pointerdown",
      "pointermove",
      "pointerup",
      "pointercancel",
      "click",
      "keydown",
      "keyup",
    ])
      document.addEventListener(
        type,
        (e) => {
          const p = e as PointerEvent,
            k = e as KeyboardEvent;
          (window as any).__statusPointerEvents.push({
            type,
            trusted: e.isTrusted,
            target: (e.target as HTMLElement)?.className,
            port: (e.target as HTMLElement)?.dataset?.port,
            pointerId: p.pointerId,
            buttons: p.buttons,
            x: p.clientX,
            y: p.clientY,
            detail: p.detail,
            key: k.key,
          });
        },
        true,
      );
  });
  await page.goto("/");
});
test.afterEach(async ({ page }, info) => {
  save(
    info.title.replace(/[^a-zA-Z0-9]+/g, "-") + "-events",
    await page.evaluate(() => (window as any).__statusPointerEvents),
  );
});

for (const width of [620, 1440])
  test(`S06 complete persistent loss details have a keyboard read path at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const fixture = fileURLToPath(
      new URL(
        `../../evidence/s06/review-03/independent-review/reviewer-public-03/persistent-loss-readability-${width}-fixture.grape.json`,
        import.meta.url,
      ),
    );
    await page.getByLabel("Open document file").setInputFiles(fixture);
    await page
      .getByRole("button", { name: "Open in new session", exact: true })
      .click();
    const c = page.locator(".canvas").first();
    await c
      .getByRole("heading", { name: "Shared arithmetic", exact: true })
      .last()
      .click();
    await c
      .getByRole("button", { name: "Enter subgraph", exact: true })
      .click();
    await c.getByText("Subgraph interface", { exact: true }).click();
    const before = await doc(page);
    await c.getByLabel("Subgraph emission mode").selectOption("function");
    const after = await doc(page),
      losses = after.graph.losses.filter(
        (l: any) => l.code === "FUNCTION_CONSTANT_DETACHED",
      );
    expect(losses).toHaveLength(width === 620 ? 4 : 10);
    const notice = c.locator(".canvas-notice"),
      facts = await notice.evaluate((el) => ({
        text: el.textContent,
        clientHeight: el.clientHeight,
        scrollHeight: el.scrollHeight,
        overflow: getComputedStyle(el).overflow,
        pointerEvents: getComputedStyle(el).pointerEvents,
      }));
    save(`loss-${width}-compact`, { facts, losses });
    await page.screenshot({
      path: path.join(evidence, `loss-${width}-compact.png`),
    });
    expect(facts.clientHeight).toBeLessThanOrEqual(60);
    const read = c.getByRole("button", {
      name: "Read full Canvas status",
      exact: true,
    });
    if (!(await read.isVisible()))
      expect(facts.scrollHeight).toBeLessThanOrEqual(facts.clientHeight);
    // Reach the actual control using keyboard navigation, without programmatic focus.
    for (
      let i = 0;
      i < 100 && !(await read.evaluate((el) => el === document.activeElement));
      i++
    )
      await page.keyboard.press("Shift+Tab");
    await expect(read).toBeFocused();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", {
        name: "Canvas status details",
        exact: true,
      }),
      text = dialog.getByRole("region", {
        name: "Full current Canvas status",
        exact: true,
      });
    await expect(dialog).toBeVisible();
    await expect(text).toBeFocused();
    for (const loss of losses) {
      await expect(text).toContainText(loss.payload.edge.id);
      await expect(text).toContainText(
        `${loss.payload.edge.to.nodeId}/${loss.payload.edge.to.portKey}`,
      );
    }
    const full = await text.innerText();
    if (width === 1440) await page.setViewportSize({ width: 620, height: 380 });
    await page.keyboard.press("Control+End");
    await page.keyboard.press("End");
    await expect
      .poll(() =>
        text.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop),
      )
      .toBeLessThanOrEqual(1);
    const end = await text.evaluate((el) => ({
      clientHeight: el.clientHeight,
      scrollHeight: el.scrollHeight,
      scrollTop: el.scrollTop,
      clientWidth: el.clientWidth,
      scrollWidth: el.scrollWidth,
    }));
    expect(end.scrollWidth).toBeLessThanOrEqual(end.clientWidth + 1);
    expect(end.scrollTop + end.clientHeight).toBeGreaterThanOrEqual(
      end.scrollHeight - 1,
    );
    save(`loss-${width}-full`, { full, end });
    await page.screenshot({
      path: path.join(evidence, `loss-${width}-full.png`),
    });
    await page.keyboard.press("Tab");
    await expect(
      dialog.getByRole("button", { name: "Close status details", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(text).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(read).toBeFocused();
    if (width === 1440) await page.setViewportSize({ width, height: 1000 });
    await clickAction(page, "Save");
    await expect(notice).toHaveText(facts.text!);
    await clickAction(page, "Undo");
    expect((await doc(page)).graph).toEqual(before.graph);
    await clickAction(page, "Redo");
    expect((await doc(page)).graph).toEqual(after.graph);
    await read.click();
    await expect(text).toHaveText(full);
    await dialog
      .getByRole("button", { name: "Close status details", exact: true })
      .click();
    expect((await doc(page)).graph).toEqual(after.graph);
  });

test("S06 bottom application error summary opens complete current text without clearing or History", async ({
  page,
}) => {
  await requiredOutput(page);
  const { c, out, input } = await color(page),
    before = await doc(page);
  await clickAction(page, "Generate GLSL");
  const summary = page.getByRole("button", {
    name: "Read full application status",
    exact: true,
  });
  await expect(summary).toContainText("INPUT_REQUIRED");
  const full = await summary.innerText();
  const bottom = await summary.evaluate((el) => {
    const r = el.getBoundingClientRect(),
      footer = document.querySelector("footer")!.getBoundingClientRect();
    return {
      y: r.y,
      height: r.height,
      footerBottom: footer.bottom,
      whiteSpace: getComputedStyle(el).whiteSpace,
    };
  });
  expect(bottom.y + bottom.height).toBeLessThanOrEqual(bottom.footerBottom);
  expect(bottom.height).toBeLessThanOrEqual(32);
  expect(bottom.whiteSpace).toBe("nowrap");
  await summary.click();
  const popup = page.getByRole("dialog", {
      name: "Application status details",
      exact: true,
    }),
    text = popup.getByRole("region", {
      name: "Full current application status",
      exact: true,
    });
  await expect(text).toHaveText(full);
  await expect(text).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(summary).toBeFocused();
  await expect(summary).toHaveText(full);
  await page.keyboard.press("Space");
  await expect(popup).toBeVisible();
  await popup
    .getByRole("button", { name: "Close status details", exact: true })
    .click();
  await expect(summary).toHaveText(full);
  await clickAction(page, "Save");
  await expect(summary).toHaveText(full);
  expect(await doc(page)).toEqual(before);
  await out.click();
  await input.click();
  await expect(summary).toHaveText(full);
  await clickAction(page, "Generate GLSL");
  await expect(summary).not.toContainText("INPUT_REQUIRED");
  save("application-current-status", { full, bottom });
  await page.screenshot({
    path: path.join(evidence, "application-bottom-status.png"),
  });
  await clickAction(page, "Undo");
  expect(await doc(page)).toEqual(before);
});

test("S06 synthetic outside pointercancel is pointer-specific; click pending survives unpressed motion", async ({
  page,
}) => {
  const { c, out } = await color(page),
    before = await doc(page),
    a = await center(out);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(a.x + 2, a.y, { steps: 2 });
  const id = await page.evaluate(
    () =>
      (window as any).__statusPointerEvents
        .filter((e: any) => e.type === "pointerdown")
        .at(-1).pointerId,
  );
  await page.evaluate(
    (id) =>
      document.dispatchEvent(
        new PointerEvent("pointercancel", {
          pointerId: id + 1,
          isPrimary: false,
        }),
      ),
    id,
  );
  await expect(c.locator(".connection-preview path")).toHaveCount(1);
  await page.evaluate(
    (id) =>
      document.dispatchEvent(
        new PointerEvent("pointercancel", { pointerId: id, isPrimary: true }),
      ),
    id,
  );
  await page.mouse.up();
  await expect(c.locator(".connection-preview path")).toHaveCount(0);
  await out.click();
  await page.mouse.move(a.x + 80, a.y - 40);
  await expect(c.locator(".connection-preview path")).toHaveCount(1);
  await page.mouse.move(1435, 80);
  await expect(c.locator(".connection-preview path")).toHaveCount(0);
  await page.mouse.move(a.x + 80, a.y - 40);
  await expect(c.locator(".connection-preview path")).toHaveCount(1);
  await page.keyboard.press("Escape");
  expect(await doc(page)).toEqual(before);
  save("synthetic-pointer-cancel", {
    classification:
      "Synthetic lifecycle boundary; not physical-device evidence",
    matchingPointer: id,
  });
});

test("S06 delayed matching storage recovery retires open error details with usable focus", async ({
  page,
}) => {
  await color(page);
  await page.evaluate(() => {
    (window as any).__originalPut = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function () {
      throw new DOMException("Delayed status fixture", "QuotaExceededError");
    };
  });
  await clickAction(page, "Save");
  await expect(page.locator("#message")).toContainText(
    "Delayed status fixture",
  );
  await page.evaluate(() => {
    IDBObjectStore.prototype.put = (window as any).__originalPut;
    const descriptor = Object.getOwnPropertyDescriptor(
      IDBTransaction.prototype,
      "oncomplete",
    )!;
    Object.defineProperty(IDBTransaction.prototype, "oncomplete", {
      ...descriptor,
      set(handler) {
        descriptor.set!.call(
          this,
          function (this: IDBTransaction, event: Event) {
            (window as any).__releaseStatusSave = () =>
              handler.call(this, event);
          },
        );
      },
    });
  });
  await clickAction(page, "Save");
  await expect(page.locator("#save-state")).toHaveText("Saving…");
  await page.locator("#message").click();
  const popup = page.getByRole("dialog", {
    name: "Application status details",
    exact: true,
  });
  await expect(popup).toBeVisible();
  await page.waitForFunction(
    () => typeof (window as any).__releaseStatusSave === "function",
  );
  await page.evaluate(() => (window as any).__releaseStatusSave());
  await expect(popup).not.toBeVisible();
  await expect(page.locator("#message")).toBeEmpty();
  expect(
    await page.evaluate(() => {
      const a = document.activeElement as HTMLButtonElement;
      return (
        a.tagName === "BUTTON" &&
        a.isConnected &&
        !a.disabled &&
        a.getClientRects().length > 0
      );
    }),
  ).toBe(true);
  save("delayed-status-recovery", {
    classification:
      "Browser IDB callback fault/delay injection; matching public Save and popup operations",
    result: "popup closed on matching recovery, enabled visible focus target",
  });
});

test("S06 actual 3px uncaptured port release across Canvas Inspector retires wire and ring", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const { c, out } = await color(page),
    before = await doc(page),
    cr = (await c.boundingBox())!;
  const initial = await center(out.locator(".socket")),
    delta = cr.x + cr.width - 1.5 - initial.x;
  await page.mouse.move(cr.x + 20, cr.y + 150);
  await page.mouse.down();
  await page.mouse.move(cr.x + 20 + delta, cr.y + 150, { steps: 12 });
  await page.mouse.up();
  const a = await center(out.locator(".socket"));
  expect(a.x).toBeGreaterThan(cr.x + cr.width - 3);
  expect(a.x).toBeLessThan(cr.x + cr.width);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(a.x + 3, a.y, { steps: 6 });
  const during = await preview(c);
  await page.mouse.up();
  const released = await preview(c);
  await page.mouse.move(cr.x + 900, a.y, { steps: 5 });
  const returned = await preview(c);
  save("tiny-cross-boundary", {
    start: a,
    release: { x: a.x + 3, y: a.y },
    canvas: cr,
    during,
    released,
    returned,
  });
  await page.screenshot({
    path: path.join(evidence, "tiny-cross-boundary.png"),
  });
  expect(released.paths).toBe(0);
  expect(released.rings).toBe(0);
  expect(returned.paths).toBe(0);
  expect(returned.rings).toBe(0);
  expect(await doc(page)).toEqual(before);
  await clickAction(page, "Undo");
  await expect(
    c.getByRole("heading", { name: "Color RGBA", exact: true }),
  ).toHaveCount(0);
});

for (const key of ["Enter", "Space"])
  test(`S06 trusted ${key} socket activation waits for real pointer and preserves keyboard connection`, async ({
    page,
  }) => {
    const { c, out, input } = await color(page),
      before = await doc(page);
    await out.click();
    await page.keyboard.press("Escape");
    await expect(out).toBeFocused();
    await page.keyboard.press(key);
    const pending = await preview(c),
      cr = (await c.boundingBox())!;
    save(`keyboard-${key}`, { pending, canvas: cr });
    await expect(c.locator(".canvas-notice")).toContainText("opposite port");
    if (pending.d) expect(pending.d).not.toMatch(new RegExp(`,0 ${-cr.y}$`));
    expect(pending.paths).toBe(0);
    await page.mouse.move(cr.x + 450, cr.y + 180, { steps: 5 });
    await expect(c.locator(".connection-preview path")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(c.locator(".connection-preview path")).toHaveCount(0);
    expect(await doc(page)).toEqual(before);
    await out.click();
    await page.keyboard.press("Escape");
    await page.keyboard.press(key);
    for (
      let i = 0;
      i < 100 && !(await input.evaluate((el) => el === document.activeElement));
      i++
    )
      await page.keyboard.press("Shift+Tab");
    await expect(input).toBeFocused();
    await page.keyboard.press(key);
    await expect(c.locator(".canvas-notice")).toBeEmpty();
    const after = await doc(page);
    expect(
      after.graph.stages.find((s: any) => s.key === "pixel").network.edges,
    ).toHaveLength(1);
    await clickAction(page, "Undo");
    expect(await doc(page)).toEqual(before);
    await clickAction(page, "Redo");
    expect(await doc(page)).toEqual(after);
  });

test("S06 selection changes no body content field socket or wire geometry across pan and zoom", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await createNode(page, "Color RGBA");
  await createNode(page, "Multiply");
  await createNode(page, "Float (fixed)");
  const c = page.locator(".canvas").last(),
    card = (name: string) =>
      c
        .locator("article.node")
        .filter({ has: page.getByRole("heading", { name, exact: true }) });
  await card("Color RGBA").locator('[data-direction="output"]').click();
  await card("Image output").locator('[data-direction="input"]').click();
  const priorEdge = await doc(page);
  await card("Float").locator('[data-direction="output"]').click();
  await card("Multiply").locator('[data-direction="input"]').first().click();
  const connected = await doc(page);
  await card("Multiply").getByRole("heading").click();
  await page.keyboard.press("h");
  const measure = () =>
    c.evaluate((el) => {
      const box = (e: Element) => {
        const r = e.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      };
      return {
        revision: (el as HTMLElement).dataset.revision,
        transform: (el.querySelector(".viewport") as HTMLElement).style
          .transform,
        nodes: [...el.querySelectorAll("article.node")].map((e) => ({
          id: (e as HTMLElement).dataset.node,
          body: box(e),
          content: [
            ...e.querySelectorAll("h3,small,.port-row,.node-value,button,span"),
          ].map((x) => ({
            tag: x.tagName,
            text: x.textContent,
            class: x.className,
            box: box(x),
          })),
        })),
        sockets: [...el.querySelectorAll(".socket")].map(box),
        wires: [...el.querySelectorAll(".wires path")].map((e) => ({
          d: e.getAttribute("d"),
          box: box(e),
        })),
      };
    });
  const records = [];
  for (const zoom of [0.65, 1, 1.25]) {
    await c.hover({ position: { x: 350, y: 170 } });
    await page.mouse.wheel(
      0,
      -Math.log(zoom / Number(await c.getAttribute("data-zoom"))) * 1000,
    );
    await expect
      .poll(async () => Number(await c.getAttribute("data-zoom")))
      .toBeCloseTo(zoom, 3);
    const cr = (await c.boundingBox())!;
    await page.mouse.move(cr.x + 24, cr.y + 200);
    await page.mouse.down();
    await page.mouse.move(cr.x + 44, cr.y + 216, { steps: 4 });
    await page.mouse.up();
    await expect(c).toHaveAttribute("data-selection", "");
    const baseline = await measure();
    expect(baseline.wires).toHaveLength(2);
    await page.screenshot({
      path: path.join(evidence, `geometry-${zoom}-unselected.png`),
    });
    const transitions = [];
    for (const name of ["Color RGBA", "Multiply", "Float"]) {
      const n = card(name),
        id = (await n.getAttribute("data-node"))!;
      await n.getByRole("heading").click();
      await expect(c).toHaveAttribute("data-selection", id);
      const pointer = await measure();
      expect(pointer).toEqual(baseline);
      await n.getByRole("heading").click({ modifiers: ["Shift"] });
      await expect(c).toHaveAttribute("data-selection", "");
      expect(await measure()).toEqual(baseline);
      for (const key of ["Enter", "Space"]) {
        for (
          let i = 0;
          i < 100 && !(await n.evaluate((el) => el === document.activeElement));
          i++
        )
          await page.keyboard.press("Shift+Tab");
        await expect(n).toBeFocused();
        await page.keyboard.press(key);
        await expect(c).toHaveAttribute("data-selection", id);
        const keyboard = await measure();
        expect(keyboard).toEqual(baseline);
        transitions.push({ name, key, pointer, keyboard });
        if (name === "Multiply" && key === "Enter")
          await page.screenshot({
            path: path.join(evidence, `geometry-${zoom}-selected.png`),
          });
        // Selecting another article by keyboard deselects this one without moving either card.
        const other = card(name === "Multiply" ? "Float" : "Multiply"),
          otherId = (await other.getAttribute("data-node"))!;
        for (
          let i = 0;
          i < 100 &&
          !(await other.evaluate((el) => el === document.activeElement));
          i++
        )
          await page.keyboard.press("Shift+Tab");
        await expect(other).toBeFocused();
        await page.keyboard.press(key);
        await expect(c).toHaveAttribute("data-selection", otherId);
        expect(await measure()).toEqual(baseline);
        await other.getByRole("heading").click({ modifiers: ["Shift"] });
        await expect(c).toHaveAttribute("data-selection", "");
        expect(await measure()).toEqual(baseline);
      }
    }
    records.push({ zoom, baseline, transitions });
    expect(await doc(page)).toEqual(connected);
  }
  save("selection-geometry-current", {
    note: "Trusted pointer, Shift toggle and keyboard Enter/Space; camera changes only before each baseline. Node local-value spans are included; Inspector fields intentionally follow selection and are not a node-layout invariant.",
    records,
  });
  await clickAction(page, "Undo");
  expect(await doc(page)).toEqual(priorEdge);
  await clickAction(page, "Redo");
  expect(await doc(page)).toEqual(connected);
});
