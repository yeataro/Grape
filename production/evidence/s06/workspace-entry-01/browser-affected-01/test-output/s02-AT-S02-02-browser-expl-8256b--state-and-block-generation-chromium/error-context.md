# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s02.spec.ts >> AT-S02-02 browser: explicit missing-module load, move/rename, save/reopen preserve opaque state and block generation
- Location: ..\..\..\production\tests\browser\s02.spec.ts:127:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.node h3').filter({ hasText: /^Float$/ })
    - locator resolved to <h3>Float</h3>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button title="Pixel Stage" aria-pressed="true" data-stage-id="id-6">Pixel</button> from <div class="stage-switch" data-key="id-3:vertex|id-6:pixel">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button title="Pixel Stage" aria-pressed="true" data-stage-id="id-6">Pixel</button> from <div class="stage-switch" data-key="id-3:vertex|id-6:pixel">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    57 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <button title="Pixel Stage" aria-pressed="true" data-stage-id="id-6">Pixel</button> from <div class="stage-switch" data-key="id-3:vertex|id-6:pixel">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - text: Grape
      - generic [ref=e9]: SHADER WORKSPACE
    - navigation "Document actions" [ref=e10]:
      - generic [ref=e11]:
        - button "New document" [ref=e12] [cursor=pointer]
        - button "Save" [ref=e15] [cursor=pointer]
        - button "Open saved" [active] [ref=e18] [cursor=pointer]
        - button "Export JSON" [ref=e21] [cursor=pointer]
        - button "Export PNG" [ref=e24] [cursor=pointer]
        - button "Open file" [ref=e27] [cursor=pointer]
      - generic [ref=e30]:
        - button "Generate GLSL" [ref=e31] [cursor=pointer]
        - button "Second Canvas" [ref=e34] [cursor=pointer]
        - button "Lock editing" [ref=e37] [cursor=pointer]
      - group [ref=e40]:
        - generic "More actions" [ref=e41] [cursor=pointer]
    - generic [ref=e43]:
      - generic [ref=e44]: Unsaved changes
      - generic [ref=e45]: Host-free
  - status [ref=e46]
  - generic [ref=e48]:
    - button "Undo" [disabled] [ref=e49]
    - button "Redo" [disabled] [ref=e52]
    - button "Delete selected" [ref=e55] [cursor=pointer]
    - alert
  - main [ref=e56]:
    - generic [ref=e58]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e59]:
        - generic:
          - generic:
            - group "Image output" [ref=e62]:
              - heading "Image output" [level=3] [ref=e63]
              - generic [ref=e64]:
                - button "Image output input color" [ref=e65] [cursor=pointer]:
                  - generic [ref=e67]: color
                - generic [ref=e68]: vec4
            - group "Float" [ref=e69]:
              - heading "Float" [level=3] [ref=e70]
              - generic [ref=e71]:
                - button "Float output value" [ref=e72] [cursor=pointer]:
                  - generic [ref=e73]: value
                - generic [ref=e75]: float
            - group "Multiply" [ref=e76]:
              - heading "Multiply" [level=3] [ref=e77]
              - generic [ref=e78]:
                - button "Multiply input a" [ref=e79] [cursor=pointer]:
                  - generic [ref=e81]: a
                - generic [ref=e82]: float
              - generic [ref=e83]:
                - button "Multiply input b" [ref=e84] [cursor=pointer]:
                  - generic [ref=e86]: b
                - generic [ref=e87]: float
              - generic [ref=e88]:
                - button "Multiply output result" [ref=e89] [cursor=pointer]:
                  - generic [ref=e90]: result
                - generic [ref=e92]: float
            - group "Compose" [ref=e93]:
              - heading "Compose" [level=3] [ref=e94]
              - generic [ref=e95]:
                - button "Compose input x" [ref=e96] [cursor=pointer]:
                  - generic [ref=e98]: x
                - generic [ref=e99]: float
              - generic [ref=e100]:
                - button "Compose input y" [ref=e101] [cursor=pointer]:
                  - generic [ref=e103]: "y"
                - generic [ref=e104]: float
              - generic [ref=e105]:
                - button "Compose input z" [ref=e106] [cursor=pointer]:
                  - generic [ref=e108]: z
                - generic [ref=e109]: float
              - generic [ref=e110]:
                - button "Compose input w" [ref=e111] [cursor=pointer]:
                  - generic [ref=e113]: w
                - generic [ref=e114]: float
              - generic [ref=e115]:
                - button "Compose output result" [ref=e116] [cursor=pointer]:
                  - generic [ref=e117]: result
                - generic [ref=e119]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e120]:
          - button "New subgraph" [ref=e121] [cursor=pointer]
          - button "Library subgraph" [ref=e122] [cursor=pointer]
          - button "Encapsulate" [ref=e123] [cursor=pointer]
          - button "Make independent" [ref=e124] [cursor=pointer]
          - button "Enter subgraph" [ref=e125] [cursor=pointer]
          - button "Arrange nodes" [ref=e126] [cursor=pointer]
          - button "Frame selection" [ref=e127] [cursor=pointer]
          - group [ref=e128]:
            - generic "Local clipboard" [ref=e129] [cursor=pointer]
          - group [ref=e130]:
            - generic "Structures" [ref=e131] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e132]:
          - button "Vertex" [ref=e133] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e134] [cursor=pointer]
        - generic [ref=e135]:
          - button "Add Node" [ref=e136] [cursor=pointer]
          - button "Browse nodes" [ref=e139] [cursor=pointer]
          - button "Up" [disabled] [ref=e142]
          - button "Shortcuts" [ref=e145] [cursor=pointer]
    - complementary [ref=e148]:
      - generic [ref=e149]:
        - heading "Inspector" [level=2] [ref=e150]
        - paragraph [ref=e151]: Select a node to inspect its parameters.
  - generic [ref=e153]:
    - heading "Shader output" [level=2] [ref=e154]
    - paragraph [ref=e155]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e156]:
      - listitem [ref=e157]: "MISSING_MODULE: Exact module is unavailable."
      - listitem [ref=e158]:
        - text: "NODE_MISSING: Exact node definition is unavailable."
        - button "Locate node" [ref=e159] [cursor=pointer]
  - contentinfo [ref=e160]:
    - generic [ref=e161]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e162]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  52  |     "Replace malformed authored position",
  53  |   );
  54  |   await page
  55  |     .getByRole("button", { name: "Accept replacement (one Undo)", exact: true })
  56  |     .click();
  57  |   await expect(page.locator("#recovery")).not.toBeVisible();
  58  |   await expect(page.locator(".node")).toHaveCount(4);
  59  |   await page.getByRole("button", { name: "Generate GLSL" }).click();
  60  |   await expect(
  61  |     page.getByText("Generated successfully · Host-free GLSL"),
  62  |   ).toBeVisible();
  63  |   const accepted = JSON.parse((await exported(page)).toString());
  64  |   expect(accepted.graph.id).toBe(JSON.parse(before.toString()).graph.id);
  65  |   expect(accepted.graph.stages[1].network.nodes[1].position).toEqual([48, 96]);
  66  |   await page.getByRole("button", { name: "Undo", exact: true }).click();
  67  |   expect(await exported(page)).toEqual(before);
  68  |   await expect(
  69  |     page.getByRole("button", { name: "Undo", exact: true }),
  70  |   ).toBeDisabled();
  71  |   await page.getByRole("button", { name: "Redo", exact: true }).click();
  72  |   await expect(page.locator(".node")).toHaveCount(4);
  73  |   expect(errors).toEqual([]);
  74  |   await page.screenshot({
  75  |     path: `${process.env.GRAPE_EVIDENCE_DIR ?? "evidence/s02"}/review-accepted.png`,
  76  |     fullPage: true,
  77  |   });
  78  | });
  79  | test("AT-S02-01 browser: readonly and intervening edit fence publication", async ({
  80  |   page,
  81  | }) => {
  82  |   await page.getByRole("button", { name: "Lock editing" }).click();
  83  |   await choose(page, fixture());
  84  |   await expect(
  85  |     page.getByRole("button", { name: "Accept replacement (one Undo)" }),
  86  |   ).toBeDisabled();
  87  |   await page.getByRole("button", { name: "Close", exact: true }).click();
  88  |   await page.getByRole("button", { name: "Lock editing" }).click();
  89  |   await choose(page, fixture());
  90  |   // Simulate a command from another view while the modal review owns focus.
  91  |   await page
  92  |     .getByRole("button", { name: "New subgraph", exact: true })
  93  |     .evaluate((button: HTMLButtonElement) => button.click());
  94  |   await expect(
  95  |     page.getByRole("button", { name: "Accept replacement (one Undo)" }),
  96  |   ).toBeDisabled();
  97  |   await expect(page.locator("#replacement-message")).toContainText(
  98  |     "IMPORT_STALE",
  99  |   );
  100 |   await expect(page.locator(".node")).toHaveCount(2);
  101 | });
  102 | test("AT-S02-01 browser: duplicate IDs, unknown structure and future input never expose acceptance", async ({
  103 |   page,
  104 | }) => {
  105 |   for (const mutate of [
  106 |     (d: any) => (d.formatVersion.major = 3),
  107 |     (d: any) =>
  108 |       d.graph.stages[1].network.nodes.push(d.graph.stages[1].network.nodes[0]),
  109 |     (d: any) => (d.graph.future = { preserve: "全部🍇" }),
  110 |   ]) {
  111 |     const doc = fixture();
  112 |     mutate(doc);
  113 |     await choose(page, doc);
  114 |     await expect(
  115 |       page.getByRole("button", { name: "Accept replacement (one Undo)" }),
  116 |     ).not.toBeVisible();
  117 |     await expect(
  118 |       page.getByRole("button", { name: "Open in new session" }),
  119 |     ).not.toBeVisible();
  120 |     expect(await exported(page, "Export original")).toEqual(
  121 |       Buffer.from(JSON.stringify(doc)),
  122 |     );
  123 |     await page.getByRole("button", { name: "Close", exact: true }).click();
  124 |     await expect(page.locator(".node")).toHaveCount(1);
  125 |   }
  126 | });
  127 | test("AT-S02-02 browser: explicit missing-module load, move/rename, save/reopen preserve opaque state and block generation", async ({
  128 |   page,
  129 | }) => {
  130 |   const doc = fixture(),
  131 |     node = doc.graph.stages[1].network.nodes[1];
  132 |   node.type.fingerprint = "missing-exact";
  133 |   doc.graph.modules.push({
  134 |     moduleId: node.type.moduleId,
  135 |     version: node.type.version,
  136 |     fingerprint: node.type.fingerprint,
  137 |   });
  138 |   node.state = { opaque: { text: "未知🍇", archive: [1, 2] }, value: 0.25 };
  139 |   await choose(page, doc);
  140 |   await expect(page.locator("#recovery-message")).toContainText(
  141 |     "blocked: IMPORT_ERRORS",
  142 |   );
  143 |   await expect(page.getByLabel("Inspection and proposal")).toContainText(
  144 |     "MISSING_MODULE",
  145 |   );
  146 |   page.once("dialog", (dialog) => dialog.accept());
  147 |   await page.getByRole("button", { name: "Open in new session" }).click();
  148 |   await expect(page.locator(".node")).toHaveCount(4);
  149 |   await page
  150 |     .locator(".node h3")
  151 |     .filter({ hasText: /^Float$/ })
> 152 |     .click();
      |      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  153 |   page.once("dialog", (dialog) => dialog.accept("Preserved missing"));
  154 |   await page.getByRole("button", { name: "Rename node" }).click();
  155 |   const heading = page
  156 |       .locator(".node h3")
  157 |       .filter({ hasText: /^Preserved missing$/ }),
  158 |     box = await heading.boundingBox();
  159 |   await page.mouse.move(box!.x + 20, box!.y + 10);
  160 |   await page.mouse.down();
  161 |   await page.mouse.move(box!.x + 80, box!.y + 60, { steps: 5 });
  162 |   await page.mouse.up();
  163 |   await page.getByRole("button", { name: "Generate GLSL" }).click();
  164 |   await expect(
  165 |     page.getByText("Generation blocked", { exact: true }),
  166 |   ).toBeVisible();
  167 |   const saved = JSON.parse((await exported(page)).toString()),
  168 |     savedNode = saved.graph.stages[1].network.nodes.find(
  169 |       (n: any) => n.id === node.id,
  170 |     );
  171 |   expect(savedNode.state).toEqual(node.state);
  172 |   expect(savedNode.ports).toEqual(node.ports);
  173 |   expect(savedNode.type).toEqual(node.type);
  174 |   expect(savedNode.position).not.toEqual(node.position);
  175 |   await page.getByRole("button", { name: "Save", exact: true }).click();
  176 |   await expect(page.locator("#save-state")).toHaveText("Saved");
  177 |   await page.getByRole("button", { name: "Open saved", exact: true }).click();
  178 |   await page.locator("#saved-list button").click();
  179 |   expect(JSON.parse((await exported(page)).toString())).toEqual(saved);
  180 | });
  181 | test("AT-S02-03 boundary browser: unmapped legacy remains explicit with provenance and original export", async ({
  182 |   page,
  183 | }) => {
  184 |   const legacy = {
  185 |     format: "td-sgrape",
  186 |     definitionUuid: "known-uuid",
  187 |     revisionHash: "unmapped",
  188 |     archive: { opaque: "保留" },
  189 |   };
  190 |   await choose(page, legacy);
  191 |   await expect(page.locator("#recovery-message")).toContainText(
  192 |     "IMPORT_CONVERTER_REQUIRED",
  193 |   );
  194 |   await expect(page.getByLabel("Inspection and proposal")).toContainText(
  195 |     "G-VERSION-COMPAT",
  196 |   );
  197 |   await expect(
  198 |     page.getByRole("button", { name: "Accept replacement (one Undo)" }),
  199 |   ).not.toBeVisible();
  200 |   expect(await exported(page, "Export original")).toEqual(
  201 |     Buffer.from(JSON.stringify(legacy)),
  202 |   );
  203 | });
  204 | test("AT-S02-04 browser: real Canvas PNG preview/export/reimport, malformed CRC and missing metadata", async ({
  205 |   page,
  206 | }) => {
  207 |   const doc = fixture();
  208 |   doc.graph.extensions["test.notes"] = { cjk: "中文", nonBMP: "🍇" };
  209 |   await choose(page, doc);
  210 |   await page
  211 |     .getByRole("button", { name: "Accept replacement (one Undo)" })
  212 |     .click();
  213 |   const json = JSON.parse((await exported(page)).toString());
  214 |   await page.getByRole("button", { name: "Export PNG", exact: true }).click();
  215 |   await expect(
  216 |     page.getByRole("button", { name: "Download PNG" }),
  217 |   ).toBeEnabled();
  218 |   const image = page.getByRole("img", { name: "Preview PNG export" });
  219 |   expect(
  220 |     await image.evaluate((img: HTMLImageElement) => img.naturalWidth),
  221 |   ).toBeGreaterThanOrEqual(640);
  222 |   const png = await exported(page, "Download PNG");
  223 |   expect(JSON.parse(unwrapPNG(png))).toEqual(json);
  224 |   await page.screenshot({
  225 |     path: `${process.env.GRAPE_EVIDENCE_DIR ?? "evidence/s02"}/png-preview.png`,
  226 |   });
  227 |   await page.getByRole("button", { name: "Cancel", exact: true }).click();
  228 |   await page.getByLabel("Open document file", { exact: true }).setInputFiles({
  229 |     name: "roundtrip.png",
  230 |     mimeType: "image/png",
  231 |     buffer: png,
  232 |   });
  233 |   await expect(page.locator("#recovery-message")).toContainText(
  234 |     "valid: DOCUMENT_VALID",
  235 |   );
  236 |   expect(await exported(page, "Export original")).toEqual(png);
  237 |   await page.getByRole("button", { name: "Close", exact: true }).click();
  238 |   const bad = Buffer.from(png);
  239 |   bad[29] ^= 1;
  240 |   await page
  241 |     .getByLabel("Open document file", { exact: true })
  242 |     .setInputFiles({ name: "bad.png", mimeType: "image/png", buffer: bad });
  243 |   await expect(page.locator("#recovery-message")).toContainText("PNG_CRC");
  244 |   expect(await exported(page, "Export original")).toEqual(bad);
  245 |   await page.getByRole("button", { name: "Close", exact: true }).click();
  246 |   const bare = await page.evaluate(() => {
  247 |     const c = document.createElement("canvas");
  248 |     return c.toDataURL("image/png").split(",")[1];
  249 |   });
  250 |   await page.getByLabel("Open document file", { exact: true }).setInputFiles({
  251 |     name: "bare.png",
  252 |     mimeType: "image/png",
```