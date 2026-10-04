import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createNode } from "./create-node.ts";
import { clickAction } from "../fixtures/public-actions.ts";
const out = process.env.GRAPE_EVIDENCE_DIR!;
for (const mode of [
  "absent",
  "disposed",
  "failed-construction",
  "consumed-key",
])
  test(
    "S06 optional inspection " +
      mode +
      " preserves normal public editing save ACK generation Undo Redo",
    async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      if (mode === "failed-construction")
        await page.route("**/src/ui/hover.ts", async (r) => {
          const response = await r.fetch(),
            text = await response.text();
          expect(text).toContain("new MutationObserver(");
          await r.fulfill({
            response,
            body: text.replace(
              "new MutationObserver(",
              'new (class { constructor() { throw Error("injected optional helper initialization fault"); } })(',
            ),
          });
        });
      else if (mode === "consumed-key")
        await page.addInitScript(() =>
          document.addEventListener(
            "keydown",
            (e) => {
              if (e.key === "F2") e.preventDefault();
            },
            true,
          ),
        );
      else
        await page.route("**/apps/web/main.ts", async (r) => {
          const response = await r.fetch(),
            text = await response.text();
          const pattern = /const hover = mountHover\([\s\S]*?\);/;
          expect(text).toMatch(pattern);
          await r.fulfill({
            response,
            body: text.replace(
              pattern,
              mode === "absent"
                ? "const hover = {invalidate() {}, dispose() {}};"
                : (m) => m + "\nhover.dispose();",
            ),
          });
        });
      await page.goto("/");
      await createNode(page, "Color RGBA");
      const node = page.locator("article").filter({
        has: page.getByRole("heading", { name: "Color RGBA", exact: true }),
      });
      await node.getByRole("heading").click();
      const r = page.getByRole("textbox", { name: "R", exact: true });
      await r.fill("0.25");
      await r.press("Enter");
      await node.locator('[data-direction="output"]').click();
      await page
        .locator('.canvas [data-direction="input"][data-port="color"]')
        .click();
      const exported = async () => {
        const d = page.waitForEvent("download");
        await clickAction(page, "Export JSON");
        return JSON.parse(fs.readFileSync((await (await d).path())!, "utf8"));
      };
      const before = await exported();
      await clickAction(page, "Generate GLSL");
      await page
        .getByRole("button", { name: "Shader output", exact: true })
        .click();
      await expect(page.locator("#code")).toContainText("void main");
      await page.keyboard.press("Escape");
      await clickAction(page, "Save");
      await expect(page.locator("#save-state")).toHaveText("Saved");
      await page.keyboard.press("F2");
      await expect(
        page.getByRole("dialog", { name: "Object information", exact: true }),
      ).not.toBeVisible();
      await clickAction(page, "Undo");
      await clickAction(page, "Redo");
      expect(await exported()).toEqual(before);
      expect(errors).toEqual([]);
      fs.writeFileSync(
        path.join(out, "isolation-" + mode + ".json"),
        JSON.stringify(
          {
            mode,
            method:
              "Disposable Vite-response adaptation at optional presentation seam only; no model hydration or injected Graph. Actual public create/edit/connect/generate/save/Undo/Redo/export.",
            errors,
            preserved: true,
          },
          null,
          2,
        ),
      );
    },
  );
test("S06 readonly owner fault registration serialization invalidation and multi-instance disposal stay local", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const moduleURL = "/src/ui/hover.ts",
      mountURL = "/src/ui/mount.ts";
    const { hoverOwner, mountHover, invalidateHover } = await import(moduleURL),
      { PresentationSession } = await import(mountURL);
    const root = document.createElement("section");
    document.body.append(root);
    const root2 = document.createElement("section");
    document.body.append(root2);
    const helper = mountHover(root, () => false),
      helper2 = mountHover(root2, () => false);
    let reads = 0,
      events = 0,
      mode = "normal",
      notify = () => {},
      late = () => {},
      data: any = { name: "first" },
      sequence = 0;
    const session = new PresentationSession(
      {
        kind: "panel",
        capture: () => ({ revision: sequence++ }),
        subscribe: (fn: any) => {
          notify = fn;
          return () => {};
        },
        dispose: () => {},
        mount: (m: any) => {
          const button = document.createElement("button");
          button.textContent = "Fault fixture";
          button.dataset.fixture = "reader";
          m.surface.target.append(button);
          m.scope.own(() => button.remove());
          button.onclick = m.scope.event(() => events++);
          m.hover(null).set(null, () => {
            throw Error("invalid registration must stay inert");
          });
          const binding = m.hover(root, () => {
            if (mode === "guard") throw Error("guard");
            return null;
          });
          late = () =>
            binding.set(button, () => ({
              kind: "Node",
              name: "STALE",
              identity: "same-id",
              state: "revoked",
            }));
          return {
            update: () => {
              binding.set(null, () => {});
              binding.set(button, () => {
                reads++;
                if (mode === "read") throw Error("read");
                if (mode === "serial")
                  return {
                    kind: "Node",
                    name: "serial",
                    identity: "same-id",
                    state: "test",
                    data: {
                      toJSON() {
                        invalidateHover(root);
                        return {};
                      },
                    },
                  };
                return {
                  kind: "Node",
                  name: data.name,
                  identity: "same-id",
                  state: "readonly fixture",
                  data,
                };
              });
            },
          };
        },
      },
      {
        locale: "en",
        subscribe: () => () => {},
        resolve: (r: any) => ({ text: r.fallback }),
      },
    );
    session.mount({ protocol: "grape.dom.v1", target: root });
    const button = () =>
        root.querySelector<HTMLButtonElement>("button[data-fixture]")!,
      press = () => {
        button().focus();
        button().dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "F2",
            bubbles: true,
            cancelable: true,
          }),
        );
      },
      opened = () => !!root.querySelector("dialog[open]");
    for (let i = 0; i < 80; i++) {
      button().dispatchEvent(
        new PointerEvent("pointerover", { bubbles: true }),
      );
      button().dispatchEvent(
        new PointerEvent("pointermove", { bubbles: true }),
      );
    }
    button().focus();
    const before = reads;
    press();
    const normal = opened();
    helper.invalidate();
    mode = "read";
    press();
    const unavailable = root.textContent!.includes("Unavailable");
    helper.invalidate();
    mode = "guard";
    press();
    const guardBlocked = !opened();
    mode = "serial";
    press();
    const serialBlocked = !opened();
    mode = "normal";
    press();
    data = { name: "second" };
    notify();
    const refreshClosed = !opened();
    press();
    const fresh = root.textContent!.includes("second");
    helper.invalidate();
    session.unmount();
    late();
    session.mount({ protocol: "grape.dom.v1", target: root });
    press();
    const noStale = !root.textContent!.includes("STALE");
    helper.dispose();
    button().click();
    notify();
    const alive = session.status === "mounted" && events === 1;
    session.dispose();
    late();
    const secondButton = document.createElement("button");
    secondButton.textContent = "Independent helper";
    root2.append(secondButton);
    secondButton.focus();
    secondButton.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "F2",
        bubbles: true,
        cancelable: true,
      }),
    );
    const independent = !!root2.querySelector("dialog[open]");
    helper2.dispose();
    root.remove();
    root2.remove();
    return {
      before,
      normal,
      unavailable,
      guardBlocked,
      serialBlocked,
      refreshClosed,
      fresh,
      noStale,
      alive,
      reads,
      independent,
      events,
    };
  });
  expect(result).toMatchObject({
    before: 0,
    normal: true,
    unavailable: true,
    guardBlocked: true,
    serialBlocked: true,
    refreshClosed: true,
    fresh: true,
    noStale: true,
    alive: true,
    events: 1,
    independent: true,
  });
  fs.writeFileSync(
    path.join(out, "owner-faults.json"),
    JSON.stringify(
      {
        result,
        method:
          "Synthetic public PresentationSession/mount owner fixtures, fault injection and lifecycle. Not physical pointer/IME evidence.",
      },
      null,
      2,
    ),
  );
});
