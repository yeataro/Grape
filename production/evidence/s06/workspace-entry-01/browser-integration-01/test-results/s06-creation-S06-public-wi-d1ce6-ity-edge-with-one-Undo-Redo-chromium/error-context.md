# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-creation.spec.ts >> S06 public wired Compose vec2 preview matches actual schema and identity edge with one Undo/Redo
- Location: ..\..\..\production\tests\browser\s06-creation.spec.ts:29:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Subgraph input value', exact: true })

```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - banner [ref=f1e3]:
    - generic [ref=f1e4]:
      - text: Grape
      - generic [ref=f1e9]: SHADER WORKSPACE
    - navigation "Document actions" [ref=f1e10]:
      - generic [ref=f1e11]:
        - button "New document" [ref=f1e12] [cursor=pointer]
        - button "Save" [ref=f1e15] [cursor=pointer]
        - button "Open saved" [ref=f1e18] [cursor=pointer]
        - button "Export JSON" [ref=f1e21] [cursor=pointer]
        - button "Export PNG" [ref=f1e24] [cursor=pointer]
        - button "Open file" [ref=f1e27] [cursor=pointer]
      - generic [ref=f1e30]:
        - button "Generate GLSL" [ref=f1e31] [cursor=pointer]
        - button "Second Canvas" [ref=f1e34] [cursor=pointer]
        - button "Lock editing" [ref=f1e37] [cursor=pointer]
      - group [ref=f1e40]:
        - generic "More actions" [ref=f1e41] [cursor=pointer]
    - generic [ref=f1e43]:
      - generic [ref=f1e44]: Unsaved changes
      - generic [ref=f1e45]: Host-free
  - status [ref=f1e46]
  - generic [ref=f1e48]:
    - button "Undo" [disabled] [ref=f1e49]
    - button "Redo" [disabled] [ref=f1e52]
    - button "Delete selected" [ref=f1e55] [cursor=pointer]
    - alert
  - main [ref=f1e56]:
    - generic [ref=f1e58]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=f1e59]:
        - group "Image output" [ref=f1e60]:
          - heading "Image output" [level=3] [ref=f1e61]
          - generic [ref=f1e62]:
            - button "Image output input color" [ref=f1e63] [cursor=pointer]:
              - generic [ref=f1e65]: color
            - generic [ref=f1e66]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=f1e67]:
          - button "New subgraph" [ref=f1e68] [cursor=pointer]
          - button "Library subgraph" [ref=f1e69] [cursor=pointer]
          - button "Encapsulate" [ref=f1e70] [cursor=pointer]
          - button "Make independent" [ref=f1e71] [cursor=pointer]
          - button "Enter subgraph" [ref=f1e72] [cursor=pointer]
          - button "Arrange nodes" [ref=f1e73] [cursor=pointer]
          - button "Frame selection" [ref=f1e74] [cursor=pointer]
          - group [ref=f1e75]:
            - generic "Local clipboard" [ref=f1e76] [cursor=pointer]
          - group [ref=f1e77]:
            - generic "Structures" [ref=f1e78] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=f1e79]:
          - button "Vertex" [ref=f1e80] [cursor=pointer]
          - button "Pixel" [pressed] [ref=f1e81] [cursor=pointer]
        - generic [ref=f1e82]:
          - button "Add Node" [ref=f1e83] [cursor=pointer]
          - button "Browse nodes" [ref=f1e86] [cursor=pointer]
          - button "Up" [disabled] [ref=f1e89]
          - button "Shortcuts" [ref=f1e92] [cursor=pointer]
    - complementary [ref=f1e95]:
      - generic [ref=f1e96]:
        - heading "Inspector" [level=2] [ref=f1e97]
        - paragraph [ref=f1e98]: Select a node to inspect its parameters.
  - generic [ref=f1e100]:
    - heading "Shader output" [level=2] [ref=f1e101]
    - paragraph [ref=f1e102]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=f1e103]:
      - listitem [ref=f1e104]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=f1e105] [cursor=pointer]
  - contentinfo [ref=f1e106]:
    - generic [ref=f1e107]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=f1e108]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import fs from "node:fs";
  3   | import path from "node:path";
  4   | import { createNode } from "./create-node.ts";
  5   | import { clickAction } from "../fixtures/public-actions.ts";
  6   | const evidence = process.env.GRAPE_EVIDENCE_DIR!;
  7   | async function doc(page: Page) {
  8   |   const wait = page.waitForEvent("download");
  9   |   await clickAction(page, "Export JSON");
  10  |   return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8"));
  11  | }
  12  | const network = (d: any) =>
  13  |   d.graph.stages.find((s: any) => s.key === "pixel").network;
  14  | async function choose(page: Page, label: string, browse = false) {
  15  |   await page
  16  |     .getByRole("button", {
  17  |       name: browse ? "Browse nodes" : "Add Node",
  18  |       exact: true,
  19  |     })
  20  |     .click();
  21  |   const catalog = page.getByRole("dialog", { name: "Node catalog" });
  22  |   await catalog.getByLabel("Search nodes", { exact: true }).fill(label);
  23  |   return catalog;
  24  | }
  25  | test.beforeEach(async ({ page }) => {
  26  |   await page.goto("/");
  27  | });
  28  | 
  29  | test("S06 public wired Compose vec2 preview matches actual schema and identity edge with one Undo/Redo", async ({
  30  |   page,
  31  | }) => {
  32  |   await page.getByRole("button", { name: "New subgraph", exact: true }).click();
  33  |   await page
  34  |     .getByRole("button", { name: "Enter subgraph", exact: true })
  35  |     .click();
  36  |   await page.getByText("Subgraph interface", { exact: true }).click();
  37  |   await page
  38  |     .getByLabel("Port type 1", { exact: true })
  39  |     .selectOption("glsl.vec2");
  40  |   await page
  41  |     .getByLabel("Port type 2", { exact: true })
  42  |     .selectOption("glsl.vec2");
  43  |   await page
  44  |     .getByRole("button", { name: "Apply interface", exact: true })
  45  |     .click();
  46  |   await page.getByRole("button", { name: "Up", exact: true }).click();
  47  |   const before = await doc(page);
  48  |   await page
  49  |     .getByRole("button", { name: "Subgraph input value", exact: true })
> 50  |     .click({ button: "right" });
      |      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  51  |   await page.getByRole("menuitem", { name: "Create connected node" }).click();
  52  |   const catalog = page.getByRole("dialog", { name: "Node catalog" });
  53  |   await catalog.getByLabel("Search nodes", { exact: true }).fill("Compose");
  54  |   await catalog
  55  |     .getByRole("button", { name: "Inspect Compose", exact: true })
  56  |     .dblclick();
  57  |   const preview = page.locator(".creation-preview");
  58  |   await expect(preview.locator('[data-direction="output"]')).toContainText(
  59  |     "vec2",
  60  |   );
  61  |   expect(await page.locator(".nodes .node").count()).toBe(
  62  |     network(before).nodes.length,
  63  |   );
  64  |   await page.screenshot({
  65  |     path: path.join(evidence, "configured-compose-preview.png"),
  66  |   });
  67  |   const r = (await page.locator(".canvas").boundingBox())!;
  68  |   await page.mouse.click(r.x + 450, r.y + 350);
  69  |   const after = await doc(page),
  70  |     added = network(after).nodes.find((n: any) => n.type.typeId === "compose");
  71  |   expect(added.state.mode).toBe("vec2");
  72  |   expect(
  73  |     added.ports
  74  |       .filter((p: any) => p.direction === "input")
  75  |       .map((p: any) => p.key),
  76  |   ).toEqual(["x", "y"]);
  77  |   expect(added.ports.find((p: any) => p.direction === "output").type).toBe(
  78  |     "glsl.vec2",
  79  |   );
  80  |   const edge = network(after).edges.find(
  81  |     (e: any) => e.from.nodeId === added.id,
  82  |   );
  83  |   expect(edge.adaptation.operation).toBe("identity");
  84  |   expect(edge.to.portKey).toBe("value");
  85  |   await clickAction(page, "Undo");
  86  |   expect(await doc(page)).toEqual(before);
  87  |   await clickAction(page, "Redo");
  88  |   expect(await doc(page)).toEqual(after);
  89  |   await page.screenshot({
  90  |     path: path.join(evidence, "configured-compose-created.png"),
  91  |   });
  92  |   fs.writeFileSync(
  93  |     path.join(evidence, "configured-compose-public.json"),
  94  |     JSON.stringify({ before, after, edge, oneUndoRedo: true }, null, 2),
  95  |     { flag: "wx" },
  96  |   );
  97  | });
  98  | for (const zoom of [1, 1.2])
  99  |   test(`S06 port context preview uses same-key direction and actual socket geometry at zoom ${zoom}`, async ({
  100 |     page,
  101 |   }) => {
  102 |     await createNode(page, "Float (fixed)");
  103 |     const canvas = page.locator(".canvas");
  104 |     if (zoom !== 1) {
  105 |       await canvas.hover({ position: { x: 300, y: 300 } });
  106 |       await page.mouse.wheel(0, -180);
  107 |     }
  108 |     const before = await doc(page),
  109 |       source = canvas.locator(".nodes [data-direction=output]").first();
  110 |     await source.click({ button: "right" });
  111 |     await page.getByRole("menuitem", { name: "Create connected node" }).click();
  112 |     const catalog = page.getByRole("dialog", { name: "Node catalog" });
  113 |     await catalog
  114 |       .getByLabel("Search nodes", { exact: true })
  115 |       .fill("Constant input");
  116 |     await catalog
  117 |       .getByRole("button", { name: "Inspect Constant input", exact: true })
  118 |       .dblclick();
  119 |     await expect(page.locator(".creation-preview")).toBeVisible();
  120 |     expect(await canvas.locator(".nodes .node").count()).toBe(
  121 |       network(before).nodes.length,
  122 |     );
  123 |     const r = (await canvas.boundingBox())!,
  124 |       x = r.x + 420,
  125 |       y = r.y + 350;
  126 |     await page.mouse.move(x, y);
  127 |     const measured = await page.evaluate(() => {
  128 |       const root = document.querySelector(".canvas")!,
  129 |         preview = document.querySelector(".creation-preview")!,
  130 |         live = root.querySelector(".nodes [data-direction=output] .socket")!,
  131 |         target = preview.querySelector("[data-direction=input] .socket")!,
  132 |         out = preview.querySelector("[data-direction=output] .socket")!;
  133 |       const bounds = (el: Element) => {
  134 |         const b = el.getBoundingClientRect(),
  135 |           r = root.getBoundingClientRect();
  136 |         return [b.x + b.width / 2 - r.x, b.y + b.height / 2 - r.y];
  137 |       };
  138 |       const nums = document
  139 |         .querySelector(".creation-wire path")!
  140 |         .getAttribute("d")!
  141 |         .match(/-?\d+(?:\.\d+)?/g)!
  142 |         .map(Number);
  143 |       return {
  144 |         live: bounds(live),
  145 |         target: bounds(target),
  146 |         other: bounds(out),
  147 |         start: nums.slice(0, 2),
  148 |         end: nums.slice(-2),
  149 |         card: [
  150 |           preview.getBoundingClientRect().width,
```