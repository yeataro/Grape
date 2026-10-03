# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s02.spec.ts >> AT-S02-04 browser: real Canvas PNG preview/export/reimport, malformed CRC and missing metadata
- Location: tests\browser\s02.spec.ts:202:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForEvent: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for event "download"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]: ●
      - text: Grape
      - generic [ref=e6]: SHADER WORKSPACE
    - navigation "Document actions" [ref=e7]:
      - button "New document" [ref=e8] [cursor=pointer]
      - button "Save" [ref=e9] [cursor=pointer]
      - button "Open saved" [ref=e10] [cursor=pointer]
      - button "Export JSON" [ref=e11] [cursor=pointer]
      - button "Export PNG" [ref=e12] [cursor=pointer]
      - button "Open file" [ref=e13] [cursor=pointer]
      - button "Generate GLSL" [ref=e14] [cursor=pointer]
      - button "Second Canvas" [ref=e15] [cursor=pointer]
      - button "Lock editing" [ref=e16] [cursor=pointer]
      - button "Personal Library" [ref=e17] [cursor=pointer]
    - generic [ref=e18]:
      - generic [ref=e19]: Unsaved changes
      - generic [ref=e20]: Host-free
  - status [ref=e21]
  - generic [ref=e23]:
    - button "Add Float" [ref=e24] [cursor=pointer]
    - button "Add Multiply" [ref=e25] [cursor=pointer]
    - button "Add Compose" [ref=e26] [cursor=pointer]
    - button "Add Array repeat" [ref=e27] [cursor=pointer]
    - button "Undo" [disabled] [ref=e28]
    - button "Redo" [disabled] [ref=e29]
    - button "Delete selected" [ref=e30] [cursor=pointer]
    - alert
  - main [ref=e31]:
    - generic [ref=e33]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e34]:
        - group "Image output" [ref=e35]:
          - heading "Image output" [level=3] [ref=e36]
          - generic [ref=e37]:
            - button "Image output input color" [ref=e38] [cursor=pointer]:
              - generic [ref=e39]: ●
              - generic [ref=e40]: color
            - generic [ref=e41]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e42]:
          - button "New subgraph" [ref=e43] [cursor=pointer]
          - button "Library subgraph" [ref=e44] [cursor=pointer]
          - button "Encapsulate" [ref=e45] [cursor=pointer]
          - button "Make independent" [ref=e46] [cursor=pointer]
          - button "Enter subgraph" [ref=e47] [cursor=pointer]
          - button "Up" [ref=e48] [cursor=pointer]
          - button "Arrange nodes" [ref=e49] [cursor=pointer]
          - button "Frame selection" [ref=e50] [cursor=pointer]
          - group [ref=e51]:
            - generic "Local clipboard" [ref=e52]
          - group [ref=e53]:
            - generic "Structures" [ref=e54]
            - option "New structure" [selected]
    - complementary [ref=e55]:
      - generic [ref=e56]:
        - heading "Inspector" [level=2] [ref=e57]
        - paragraph [ref=e58]: Select a node to inspect its parameters.
  - generic [ref=e60]:
    - heading "Shader output" [level=2] [ref=e61]
    - paragraph [ref=e62]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e63]:
      - listitem [ref=e64]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e65] [cursor=pointer]
  - contentinfo [ref=e66]:
    - generic [ref=e67]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e68]: Scroll to zoom · Drag empty space to pan
  - dialog [ref=e69]:
    - heading "Review document" [level=2] [ref=e70]
    - paragraph [ref=e71]: IMPORT_DEFINITIONS
    - button "Export original" [ref=e72] [cursor=pointer]
    - button "Close" [ref=e73] [cursor=pointer]
    - paragraph [ref=e74]: Opening in a new session preserves model errors for re-save and starts empty History. Import acceptance requires a valid candidate and the current exact modules.
    - generic "Inspection and proposal" [ref=e75]: "{ \"diagnostics\": [], \"repairs\": [], \"provenance\": { \"format\": \"grape.document\", \"sourceVersion\": { \"major\": 2, \"minor\": 1 }, \"sourceGraphId\": \"id-1\", \"conversion\": \"none\", \"legacyGate\": null }, \"unknownPaths\": [], \"candidate\": { \"format\": \"grape.document\", \"formatVersion\": { \"major\": 2, \"minor\": 1 }, \"graph\": { \"id\": \"id-1\", \"name\": \"Untitled shader\", \"kind\": { \"moduleId\": \"grape.graph-kinds\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:30d1266c367648c97b57a6cf77eec9d0bf14ac8bdb057fa4eef457539adb98c3\", \"kindId\": \"grape.image\" }, \"kindSettings\": {}, \"modules\": [ { \"moduleId\": \"grape.nodes.basic\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\" }, { \"moduleId\": \"grape.nodes.networks\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\" }, { \"moduleId\": \"grape.graph-kinds\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:30d1266c367648c97b57a6cf77eec9d0bf14ac8bdb057fa4eef457539adb98c3\" } ], \"stages\": [ { \"id\": \"id-3\", \"key\": \"vertex\", \"stageKindId\": \"grape.stage.vertex\", \"implementation\": \"profile-default\", \"network\": { \"id\": \"id-2\", \"nodes\": [], \"edges\": [], \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-6\", \"key\": \"pixel\", \"stageKindId\": \"grape.stage.pixel\", \"implementation\": \"network\", \"network\": { \"id\": \"id-4\", \"nodes\": [ { \"id\": \"id-5\", \"name\": \"Image output\", \"type\": { \"moduleId\": \"grape.nodes.basic\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\", \"typeId\": \"image-output\" }, \"state\": {}, \"inputValues\": {}, \"ports\": [ { \"key\": \"color\", \"direction\": \"input\", \"type\": \"glsl.vec4\", \"supply\": \"required\", \"connectionPolicy\": \"exact\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 650, 180 ], \"extensions\": {} }, { \"id\": \"id-8\", \"name\": \"Float\", \"type\": { \"moduleId\": \"grape.nodes.basic\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\", \"typeId\": \"float\" }, \"state\": { \"value\": 0.25 }, \"inputValues\": {}, \"ports\": [ { \"key\": \"value\", \"direction\": \"output\", \"type\": \"glsl.float\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 0, 0 ], \"extensions\": {} }, { \"id\": \"id-9\", \"name\": \"Multiply\", \"type\": { \"moduleId\": \"grape.nodes.basic\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\", \"typeId\": \"multiply\" }, \"state\": {}, \"inputValues\": { \"a\": 1, \"b\": 2 }, \"ports\": [ { \"key\": \"a\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 1 }, { \"key\": \"b\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 2 }, { \"key\": \"result\", \"direction\": \"output\", \"type\": \"glsl.float\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 200, 0 ], \"extensions\": {} }, { \"id\": \"id-10\", \"name\": \"Compose\", \"type\": { \"moduleId\": \"grape.nodes.basic\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\", \"typeId\": \"compose\" }, \"state\": { \"mode\": \"vec4\" }, \"inputValues\": { \"x\": 0, \"y\": 0, \"z\": 0, \"w\": 1 }, \"ports\": [ { \"key\": \"x\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0 }, { \"key\": \"y\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0 }, { \"key\": \"z\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0 }, { \"key\": \"w\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 1 }, { \"key\": \"result\", \"direction\": \"output\", \"type\": \"glsl.vec4\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 400, 0 ], \"extensions\": {} } ], \"edges\": [ { \"id\": \"id-11\", \"from\": { \"nodeId\": \"id-8\", \"portKey\": \"value\" }, \"to\": { \"nodeId\": \"id-9\", \"portKey\": \"a\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-12\", \"from\": { \"nodeId\": \"id-9\", \"portKey\": \"result\" }, \"to\": { \"nodeId\": \"id-10\", \"portKey\": \"x\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-13\", \"from\": { \"nodeId\": \"id-10\", \"portKey\": \"result\" }, \"to\": { \"nodeId\": \"id-5\", \"portKey\": \"color\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.vec4\", \"targetType\": \"glsl.vec4\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} } ], \"extensions\": {} }, \"extensions\": {} } ], \"resources\": [], \"losses\": [], \"recovery\": [], \"extensions\": { \"test.notes\": { \"cjk\": \"中文\", \"nonBMP\": \"🍇\" } } } } }"
    - generic "Original text (first 12000 characters)" [ref=e76]: "{\"format\":\"grape.document\",\"formatVersion\":{\"major\":2,\"minor\":1},\"graph\":{\"id\":\"id-1\",\"name\":\"Untitled shader\",\"kind\":{\"moduleId\":\"grape.graph-kinds\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:30d1266c367648c97b57a6cf77eec9d0bf14ac8bdb057fa4eef457539adb98c3\",\"kindId\":\"grape.image\"},\"kindSettings\":{},\"modules\":[{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\"},{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\"},{\"moduleId\":\"grape.graph-kinds\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:30d1266c367648c97b57a6cf77eec9d0bf14ac8bdb057fa4eef457539adb98c3\"}],\"stages\":[{\"id\":\"id-3\",\"key\":\"vertex\",\"stageKindId\":\"grape.stage.vertex\",\"implementation\":\"profile-default\",\"network\":{\"id\":\"id-2\",\"nodes\":[],\"edges\":[],\"extensions\":{}},\"extensions\":{}},{\"id\":\"id-6\",\"key\":\"pixel\",\"stageKindId\":\"grape.stage.pixel\",\"implementation\":\"network\",\"network\":{\"id\":\"id-4\",\"nodes\":[{\"id\":\"id-5\",\"name\":\"Image output\",\"type\":{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\",\"typeId\":\"image-output\"},\"state\":{},\"inputValues\":{},\"ports\":[{\"key\":\"color\",\"direction\":\"input\",\"type\":\"glsl.vec4\",\"supply\":\"required\",\"connectionPolicy\":\"exact\"}],\"references\":[],\"referencesComplete\":true,\"position\":[650,180],\"extensions\":{}},{\"id\":\"id-8\",\"name\":\"Float\",\"type\":{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\",\"typeId\":\"float\"},\"state\":{\"value\":0.25},\"inputValues\":{},\"ports\":[{\"key\":\"value\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"references\":[],\"referencesComplete\":true,\"position\":[0,0],\"extensions\":{}},{\"id\":\"id-9\",\"name\":\"Multiply\",\"type\":{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\",\"typeId\":\"multiply\"},\"state\":{},\"inputValues\":{\"a\":1,\"b\":2},\"ports\":[{\"key\":\"a\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"b\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":2},{\"key\":\"result\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"references\":[],\"referencesComplete\":true,\"position\":[200,0],\"extensions\":{}},{\"id\":\"id-10\",\"name\":\"Compose\",\"type\":{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\",\"typeId\":\"compose\"},\"state\":{\"mode\":\"vec4\"},\"inputValues\":{\"x\":0,\"y\":0,\"z\":0,\"w\":1},\"ports\":[{\"key\":\"x\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":0},{\"key\":\"y\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":0},{\"key\":\"z\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":0},{\"key\":\"w\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"result\",\"direction\":\"output\",\"type\":\"glsl.vec4\"}],\"references\":[],\"referencesComplete\":true,\"position\":[400,0],\"extensions\":{}}],\"edges\":[{\"id\":\"id-11\",\"from\":{\"nodeId\":\"id-8\",\"portKey\":\"value\"},\"to\":{\"nodeId\":\"id-9\",\"portKey\":\"a\"},\"adaptation\":{\"schema\":\"grape.edge-adaptation\",\"version\":1,\"sourceType\":\"glsl.float\",\"targetType\":\"glsl.float\",\"operation\":\"identity\",\"extensions\":{}},\"extensions\":{}},{\"id\":\"id-12\",\"from\":{\"nodeId\":\"id-9\",\"portKey\":\"result\"},\"to\":{\"nodeId\":\"id-10\",\"portKey\":\"x\"},\"adaptation\":{\"schema\":\"grape.edge-adaptation\",\"version\":1,\"sourceType\":\"glsl.float\",\"targetType\":\"glsl.float\",\"operation\":\"identity\",\"extensions\":{}},\"extensions\":{}},{\"id\":\"id-13\",\"from\":{\"nodeId\":\"id-10\",\"portKey\":\"result\"},\"to\":{\"nodeId\":\"id-5\",\"portKey\":\"color\"},\"adaptation\":{\"schema\":\"grape.edge-adaptation\",\"version\":1,\"sourceType\":\"glsl.vec4\",\"targetType\":\"glsl.vec4\",\"operation\":\"identity\",\"extensions\":{}},\"extensions\":{}}],\"extensions\":{}},\"extensions\":{}}],\"resources\":[],\"losses\":[],\"recovery\":[],\"extensions\":{\"test.notes\":{\"cjk\":\"中文\",\"nonBMP\":\"🍇\"}}}}"
    - button "Accept replacement (one Undo)" [active] [ref=e77] [cursor=pointer]
    - button "Open in new session" [ref=e78] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import fs from "node:fs/promises";
  3   | import { flow } from "../fixtures/setup.ts";
  4   | import { unwrapPNG } from "../../src/persistence/png.ts";
  5   | const fixture = () => structuredClone(flow().graph.capture().document);
  6   | async function choose(page: Page, doc: unknown, name = "source.grape.json") {
  7   |   await page
  8   |     .getByLabel("Open document file", { exact: true })
  9   |     .setInputFiles({
  10  |       name,
  11  |       mimeType: "application/json",
  12  |       buffer: Buffer.from(JSON.stringify(doc)),
  13  |     });
  14  |   await expect(page.locator("#recovery")).toBeVisible();
  15  | }
  16  | async function exported(page: Page, button = "Export JSON") {
> 17  |   const event = page.waitForEvent("download");
      |                      ^ Error: page.waitForEvent: Test timeout of 30000ms exceeded.
  18  |   await page.getByRole("button", { name: button, exact: true }).click();
  19  |   const download = await event;
  20  |   return fs.readFile((await download.path())!);
  21  | }
  22  | test.beforeEach(async ({ page }) => {
  23  |   await page.goto("/");
  24  | });
  25  | test("AT-S02-01 browser: review/cancel, repair proposal and explicit one-Undo atomic acceptance", async ({
  26  |   page,
  27  | }) => {
  28  |   const errors: string[] = [];
  29  |   page.on("pageerror", (e) => errors.push(e.message));
  30  |   const before = await exported(page),
  31  |     revision = await page.locator(".canvas").getAttribute("data-revision");
  32  |   const doc = fixture();
  33  |   doc.graph.name = "Reviewed import";
  34  |   await choose(page, doc);
  35  |   await expect(page.locator("#recovery-message")).toContainText(
  36  |     "valid: DOCUMENT_VALID",
  37  |   );
  38  |   await expect(page.locator(".node")).toHaveCount(1);
  39  |   expect(await exported(page, "Export original")).toEqual(
  40  |     Buffer.from(JSON.stringify(doc)),
  41  |   );
  42  |   await page.getByRole("button", { name: "Close", exact: true }).click();
  43  |   expect(await exported(page)).toEqual(before);
  44  |   expect(await page.locator(".canvas").getAttribute("data-revision")).toBe(
  45  |     revision,
  46  |   );
  47  |   const damaged = structuredClone(doc) as any;
  48  |   damaged.graph.stages[1].network.nodes[1].position = ["bad", 7];
  49  |   await choose(page, damaged);
  50  |   await expect(page.locator("#recovery-message")).toContainText("repairable");
  51  |   await expect(page.getByLabel("Inspection and proposal")).toContainText(
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
  92  |     .getByRole("button", { name: "Add Float", exact: true })
  93  |     .evaluate((button: HTMLButtonElement) => button.click());
  94  |   await page
  95  |     .getByRole("button", { name: "Accept replacement (one Undo)" })
  96  |     .click();
  97  |   await expect(page.locator("#recovery-message")).toContainText("IMPORT_STALE");
  98  |   await expect(page.locator(".node")).toHaveCount(2);
  99  | });
  100 | test("AT-S02-01 browser: duplicate IDs, unknown structure and future input never expose acceptance", async ({
  101 |   page,
  102 | }) => {
  103 |   for (const mutate of [
  104 |     (d: any) => (d.formatVersion.major = 3),
  105 |     (d: any) =>
  106 |       d.graph.stages[1].network.nodes.push(d.graph.stages[1].network.nodes[0]),
  107 |     (d: any) => (d.graph.future = { preserve: "全部🍇" }),
  108 |   ]) {
  109 |     const doc = fixture();
  110 |     mutate(doc);
  111 |     await choose(page, doc);
  112 |     await expect(
  113 |       page.getByRole("button", { name: "Accept replacement (one Undo)" }),
  114 |     ).not.toBeVisible();
  115 |     await expect(
  116 |       page.getByRole("button", { name: "Open in new session" }),
  117 |     ).not.toBeVisible();
```