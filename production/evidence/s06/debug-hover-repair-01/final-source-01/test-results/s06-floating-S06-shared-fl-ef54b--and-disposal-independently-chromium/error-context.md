# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-floating.spec.ts >> S06 shared floating consumers bound alignments focus semantics and disposal independently
- Location: ..\..\..\production\tests\browser\s06-floating.spec.ts:5:1

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 372
Received:    869
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - text: Grape
        - generic [ref=e9]: SHADER WORKSPACE
        - generic "No candidate identity injected" [ref=e10]: Development · unversioned
        - button "本輪更新" [ref=e11] [cursor=pointer]
      - navigation "Document actions" [ref=e12]:
        - button "Save" [ref=e13] [cursor=pointer]
        - button "Generate GLSL" [ref=e16] [cursor=pointer]
      - generic [ref=e19]:
        - generic [ref=e20]: Unsaved changes
        - generic [ref=e21]: Host-free
    - generic [ref=e23]:
      - button "Undo" [disabled] [ref=e24]
      - button "Redo" [disabled] [ref=e27]
      - button "Delete selected" [ref=e30] [cursor=pointer]
      - alert
    - main [ref=e31]:
      - generic [ref=e33]:
        - generic: Canvas 1
        - generic "Shader graph canvas" [ref=e34]:
          - group "Image output" [ref=e35]:
            - heading "Image output" [level=3] [ref=e36]
            - generic [ref=e37]:
              - button "Image output input color" [ref=e38] [cursor=pointer]
              - generic [ref=e39]: color
              - generic [ref=e40]: vec4
          - generic:
            - button "Untitled shader / pixel" [disabled]
          - generic [ref=e41]:
            - button "New subgraph" [ref=e42] [cursor=pointer]
            - button "Library subgraph" [ref=e43] [cursor=pointer]
            - button "Encapsulate" [ref=e44] [cursor=pointer]
            - button "Make independent" [ref=e45] [cursor=pointer]
            - button "Enter subgraph" [ref=e46] [cursor=pointer]
            - button "Arrange nodes" [ref=e47] [cursor=pointer]
            - button "Frame selection" [ref=e48] [cursor=pointer]
            - group [ref=e49]:
              - generic "Local clipboard" [ref=e50] [cursor=pointer]
            - group [ref=e51]:
              - generic "Structures" [ref=e52] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=e53]:
            - button "Vertex" [ref=e54] [cursor=pointer]
            - button "Pixel" [pressed] [ref=e55] [cursor=pointer]
          - generic [ref=e56]:
            - button "Add Node" [ref=e57] [cursor=pointer]
            - button "Browse nodes" [ref=e60] [cursor=pointer]
            - button "Up" [disabled] [ref=e63]
            - button "Shortcuts" [ref=e66] [cursor=pointer]
      - complementary [ref=e69]:
        - generic [ref=e70]:
          - heading "Inspector" [level=2] [ref=e71]
          - paragraph [ref=e72]: Select a node to inspect its parameters.
    - contentinfo [ref=e73]:
      - button "Project actions" [ref=e74] [cursor=pointer]
      - status [ref=e75]:
        - button "Read full application status" [disabled] [ref=e76]
      - button "Shader output" [ref=e77] [cursor=pointer]
      - generic [ref=e78]:
        - button "Experimental features" [ref=e80] [cursor=pointer]
        - button "Read object details" [disabled] [ref=e81]
      - button "Hints" [ref=e82] [cursor=pointer]
  - generic:
    - button "Fixture start" [expanded] [ref=e83] [cursor=pointer]
    - dialog "start fixture" [ref=e84]:
      - heading "start fixture" [level=2] [ref=e85]
      - generic [ref=e86]: Read-only start
      - button "Close start" [ref=e87] [cursor=pointer]
    - button "Fixture end" [active] [ref=e88] [cursor=pointer]
    - button "Fixture modal" [ref=e89] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import fs from "node:fs";
  3   | import path from "node:path";
  4   | // Public presentation primitive on disposable DOM; not a physical-device qualification.
  5   | test("S06 shared floating consumers bound alignments focus semantics and disposal independently", async ({
  6   |   page,
  7   | }) => {
  8   |   await page.goto("/");
  9   |   await page.evaluate(async () => {
  10  |     const url = "/src/ui/floating.ts",
  11  |       { floatingSurface } = await import(url);
  12  |     const fixture = document.createElement("div");
  13  |     document.body.append(fixture);
  14  |     const consumers = ["start", "end", "modal"].map((kind, i) => {
  15  |       const trigger = document.createElement("button"),
  16  |         content = document.createElement("div");
  17  |       trigger.textContent = "Fixture " + kind;
  18  |       Object.assign(trigger.style, {
  19  |         position: "fixed",
  20  |         left: i * 190 + 20 + "px",
  21  |         bottom: "90px",
  22  |         zIndex: "1000",
  23  |       });
  24  |       fixture.append(trigger);
  25  |       content.tabIndex = 0;
  26  |       content.textContent = "Read-only " + kind;
  27  |       const view = floatingSurface({
  28  |         host: fixture,
  29  |         trigger,
  30  |         content,
  31  |         title: kind + " fixture",
  32  |         closeLabel: "Close " + kind,
  33  |         kind: kind === "modal" ? "modal" : "anchored",
  34  |         align: kind === "end" ? "end" : "start",
  35  |         width: 320,
  36  |         maxHeight: 220,
  37  |         dismissOutside: false,
  38  |       });
  39  |       trigger.onclick = () => view.toggle();
  40  |       return { view, trigger };
  41  |     });
  42  |     (window as any).__floatingFixture = {
  43  |       consumers,
  44  |       dispose: () => {
  45  |         consumers.forEach((c) => c.view.dispose());
  46  |         fixture.remove();
  47  |       },
  48  |     };
  49  |   });
  50  |   await page
  51  |     .getByRole("button", { name: "Fixture start", exact: true })
  52  |     .click();
  53  |   await page.getByRole("button", { name: "Fixture end", exact: true }).click();
  54  |   await expect(
  55  |     page.getByRole("dialog", { name: "start fixture", exact: true }),
  56  |   ).toBeVisible();
  57  |   await page.keyboard.press("Escape");
  58  |   await expect(
  59  |     page.getByRole("button", { name: "Fixture end", exact: true }),
  60  |   ).toBeFocused();
  61  |   await expect(
  62  |     page.getByRole("dialog", { name: "start fixture", exact: true }),
  63  |   ).toBeVisible();
  64  |   const records = [];
  65  |   for (const width of [1440, 620]) {
  66  |     await page.setViewportSize({ width, height: 380 });
  67  |     const box = await page
  68  |       .getByRole("dialog", { name: "start fixture", exact: true })
  69  |       .boundingBox();
  70  |     const trigger = await page
  71  |       .getByRole("button", { name: "Fixture start", exact: true })
  72  |       .boundingBox();
  73  |     expect(box!.x).toBe(
  74  |       Math.max(8, Math.min(trigger!.x, width - box!.width - 8)),
  75  |     );
  76  |     expect(box!.x).toBeGreaterThanOrEqual(8);
  77  |     expect(box!.x + box!.width).toBeLessThanOrEqual(width - 8);
> 78  |     expect(box!.y + box!.height).toBeLessThanOrEqual(372);
      |                                  ^ Error: expect(received).toBeLessThanOrEqual(expected)
  79  |     records.push(box);
  80  |   }
  81  |   await page
  82  |     .getByRole("button", { name: "Fixture modal", exact: true })
  83  |     .click();
  84  |   const modal = page.getByRole("dialog", {
  85  |     name: "modal fixture",
  86  |     exact: true,
  87  |   });
  88  |   for (let i = 0; i < 5; i++) {
  89  |     await page.keyboard.press("Tab");
  90  |     expect(
  91  |       await modal.evaluate((e) => e.contains(document.activeElement)),
  92  |     ).toBe(true);
  93  |   }
  94  |   await page.keyboard.press("Escape");
  95  |   await expect(
  96  |     page.getByRole("button", { name: "Fixture modal", exact: true }),
  97  |   ).toBeFocused();
  98  |   await page.evaluate(() =>
  99  |     (window as any).__floatingFixture.consumers[1].view.dispose(),
  100 |   );
  101 |   await expect(
  102 |     page.getByRole("dialog", { name: "start fixture", exact: true }),
  103 |   ).toBeVisible();
  104 |   await page
  105 |     .getByRole("dialog", { name: "start fixture", exact: true })
  106 |     .getByRole("button", { name: "Close start" })
  107 |     .click();
  108 |   await page
  109 |     .getByRole("button", { name: "Fixture start", exact: true })
  110 |     .click();
  111 |   await expect(
  112 |     page.getByRole("dialog", { name: "start fixture", exact: true }),
  113 |   ).toBeVisible();
  114 |   await page.evaluate(() => (window as any).__floatingFixture.dispose());
  115 |   const late = await page.evaluate(() =>
  116 |     (window as any).__floatingFixture.consumers.map((c: any) => c.view.open()),
  117 |   );
  118 |   expect(late).toEqual([false, false, false]);
  119 |   await expect(page.locator("dialog[aria-label$='fixture']")).toHaveCount(0);
  120 |   fs.writeFileSync(
  121 |     path.join(process.env.GRAPE_EVIDENCE_DIR!, "floating-lifetime.json"),
  122 |     JSON.stringify(
  123 |       {
  124 |         records,
  125 |         late,
  126 |         method:
  127 |           "Multiple real shared consumers; trusted open/Escape/Tab plus explicit synthetic disposal boundary",
  128 |       },
  129 |       null,
  130 |       2,
  131 |     ),
  132 |   );
  133 | });
  134 | 
  135 | test("S06 scoped floating presentation is revoked independently across remounts", async ({
  136 |   page,
  137 | }) => {
  138 |   await page.goto("/");
  139 |   const result = await page.evaluate(async () => {
  140 |     const { PresentationSession } = await import("/src/ui/mount.ts");
  141 |     const host = document.createElement("section");
  142 |     document.querySelector("main")!.append(host);
  143 |     const all: any[] = [];
  144 |     const view = {
  145 |       kind: "panel",
  146 |       capture: () => ({}),
  147 |       subscribe: () => () => {},
  148 |       dispose: () => {},
  149 |       mount: (m: any) => {
  150 |         const trigger = document.createElement("button"),
  151 |           content = document.createElement("div");
  152 |         trigger.textContent = "Owned trigger";
  153 |         content.textContent = "Owned content";
  154 |         host.append(trigger);
  155 |         m.scope.own(() => trigger.remove());
  156 |         const options = {
  157 |           host,
  158 |           trigger,
  159 |           content,
  160 |           title: "Owned surface",
  161 |           closeLabel: "Close owned",
  162 |           kind: "anchored",
  163 |           width: 280,
  164 |           maxHeight: 180,
  165 |         };
  166 |         const floating = m.floating(options);
  167 |         all.push({
  168 |           floating,
  169 |           lateCreate: () =>
  170 |             m.floating({ ...options, content: document.createElement("div") }),
  171 |         });
  172 |         return { update: () => {} };
  173 |       },
  174 |     };
  175 |     const s = new PresentationSession(view, {
  176 |       locale: "en",
  177 |       subscribe: () => () => {},
  178 |       resolve: (r: any) => ({ text: r.fallback }),
```