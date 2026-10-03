# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s02.spec.ts >> AT-S02-01 browser: review/cancel, repair proposal and explicit one-Undo atomic acceptance
- Location: tests\browser\s02.spec.ts:25:1

# Error details

```
Error: expect(locator).not.toBeVisible() failed

Locator:  locator('#recovery')
Expected: not visible
Received: visible
Timeout:  5000ms

Call log:
  - Expect "not toBeVisible" with timeout 5000ms
  - waiting for locator('#recovery')
    14 × locator resolved to <dialog open="" id="recovery">…</dialog>
       - unexpected value "visible"

```

```yaml
- dialog:
  - heading "Review document" [level=2]
  - paragraph: IMPORT_DEFINITIONS
  - button "Export original"
  - button "Close"
  - paragraph: Opening in a new session preserves model errors for re-save and starts empty History. Import acceptance requires a valid candidate and the current exact modules.
  - text: "{ \"diagnostics\": [], \"repairs\": [ { \"path\": \"graph.stages[1].network.nodes[1].position\", \"before\": [ \"bad\", 7 ], \"after\": [ 48, 96 ], \"reason\": \"Replace malformed authored position with [48, 96]; original retained for export.\" } ], \"provenance\": { \"format\": \"grape.document\", \"sourceVersion\": { \"major\": 2, \"minor\": 1 }, \"sourceGraphId\": \"id-1\", \"conversion\": \"none\", \"legacyGate\": null }, \"unknownPaths\": [], \"candidate\": { \"format\": \"grape.document\", \"formatVersion\": { \"major\": 2, \"minor\": 1 }, \"graph\": { \"id\": \"id-1\", \"name\": \"Reviewed import\", \"kind\": { \"moduleId\": \"grape.graph-kinds\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:30d1266c367648c97b57a6cf77eec9d0bf14ac8bdb057fa4eef457539adb98c3\", \"kindId\": \"grape.image\" }, \"kindSettings\": {}, \"modules\": [ { \"moduleId\": \"grape.nodes.basic\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\" }, { \"moduleId\": \"grape.nodes.networks\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\" }, { \"moduleId\": \"grape.graph-kinds\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:30d1266c367648c97b57a6cf77eec9d0bf14ac8bdb057fa4eef457539adb98c3\" } ], \"stages\": [ { \"id\": \"id-3\", \"key\": \"vertex\", \"stageKindId\": \"grape.stage.vertex\", \"implementation\": \"profile-default\", \"network\": { \"id\": \"id-2\", \"nodes\": [], \"edges\": [], \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-6\", \"key\": \"pixel\", \"stageKindId\": \"grape.stage.pixel\", \"implementation\": \"network\", \"network\": { \"id\": \"id-4\", \"nodes\": [ { \"id\": \"id-5\", \"name\": \"Image output\", \"type\": { \"moduleId\": \"grape.nodes.basic\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\", \"typeId\": \"image-output\" }, \"state\": {}, \"inputValues\": {}, \"ports\": [ { \"key\": \"color\", \"direction\": \"input\", \"type\": \"glsl.vec4\", \"supply\": \"required\", \"connectionPolicy\": \"exact\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 650, 180 ], \"extensions\": {} }, { \"id\": \"id-8\", \"name\": \"Float\", \"type\": { \"moduleId\": \"grape.nodes.basic\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\", \"typeId\": \"float\" }, \"state\": { \"value\": 0.25 }, \"inputValues\": {}, \"ports\": [ { \"key\": \"value\", \"direction\": \"output\", \"type\": \"glsl.float\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 48, 96 ], \"extensions\": {} }, { \"id\": \"id-9\", \"name\": \"Multiply\", \"type\": { \"moduleId\": \"grape.nodes.basic\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\", \"typeId\": \"multiply\" }, \"state\": {}, \"inputValues\": { \"a\": 1, \"b\": 2 }, \"ports\": [ { \"key\": \"a\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 1 }, { \"key\": \"b\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 2 }, { \"key\": \"result\", \"direction\": \"output\", \"type\": \"glsl.float\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 200, 0 ], \"extensions\": {} }, { \"id\": \"id-10\", \"name\": \"Compose\", \"type\": { \"moduleId\": \"grape.nodes.basic\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\", \"typeId\": \"compose\" }, \"state\": { \"mode\": \"vec4\" }, \"inputValues\": { \"x\": 0, \"y\": 0, \"z\": 0, \"w\": 1 }, \"ports\": [ { \"key\": \"x\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0 }, { \"key\": \"y\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0 }, { \"key\": \"z\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0 }, { \"key\": \"w\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 1 }, { \"key\": \"result\", \"direction\": \"output\", \"type\": \"glsl.vec4\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 400, 0 ], \"extensions\": {} } ], \"edges\": [ { \"id\": \"id-11\", \"from\": { \"nodeId\": \"id-8\", \"portKey\": \"value\" }, \"to\": { \"nodeId\": \"id-9\", \"portKey\": \"a\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-12\", \"from\": { \"nodeId\": \"id-9\", \"portKey\": \"result\" }, \"to\": { \"nodeId\": \"id-10\", \"portKey\": \"x\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-13\", \"from\": { \"nodeId\": \"id-10\", \"portKey\": \"result\" }, \"to\": { \"nodeId\": \"id-5\", \"portKey\": \"color\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.vec4\", \"targetType\": \"glsl.vec4\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} } ], \"extensions\": {} }, \"extensions\": {} } ], \"resources\": [], \"losses\": [], \"recovery\": [], \"extensions\": {} } } } {\"format\":\"grape.document\",\"formatVersion\":{\"major\":2,\"minor\":1},\"graph\":{\"id\":\"id-1\",\"name\":\"Reviewed import\",\"kind\":{\"moduleId\":\"grape.graph-kinds\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:30d1266c367648c97b57a6cf77eec9d0bf14ac8bdb057fa4eef457539adb98c3\",\"kindId\":\"grape.image\"},\"kindSettings\":{},\"modules\":[{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\"},{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\"},{\"moduleId\":\"grape.graph-kinds\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:30d1266c367648c97b57a6cf77eec9d0bf14ac8bdb057fa4eef457539adb98c3\"}],\"stages\":[{\"id\":\"id-3\",\"key\":\"vertex\",\"stageKindId\":\"grape.stage.vertex\",\"implementation\":\"profile-default\",\"network\":{\"id\":\"id-2\",\"nodes\":[],\"edges\":[],\"extensions\":{}},\"extensions\":{}},{\"id\":\"id-6\",\"key\":\"pixel\",\"stageKindId\":\"grape.stage.pixel\",\"implementation\":\"network\",\"network\":{\"id\":\"id-4\",\"nodes\":[{\"id\":\"id-5\",\"name\":\"Image output\",\"type\":{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\",\"typeId\":\"image-output\"},\"state\":{},\"inputValues\":{},\"ports\":[{\"key\":\"color\",\"direction\":\"input\",\"type\":\"glsl.vec4\",\"supply\":\"required\",\"connectionPolicy\":\"exact\"}],\"references\":[],\"referencesComplete\":true,\"position\":[650,180],\"extensions\":{}},{\"id\":\"id-8\",\"name\":\"Float\",\"type\":{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\",\"typeId\":\"float\"},\"state\":{\"value\":0.25},\"inputValues\":{},\"ports\":[{\"key\":\"value\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"references\":[],\"referencesComplete\":true,\"position\":[\"bad\",7],\"extensions\":{}},{\"id\":\"id-9\",\"name\":\"Multiply\",\"type\":{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\",\"typeId\":\"multiply\"},\"state\":{},\"inputValues\":{\"a\":1,\"b\":2},\"ports\":[{\"key\":\"a\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"b\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":2},{\"key\":\"result\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"references\":[],\"referencesComplete\":true,\"position\":[200,0],\"extensions\":{}},{\"id\":\"id-10\",\"name\":\"Compose\",\"type\":{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\",\"typeId\":\"compose\"},\"state\":{\"mode\":\"vec4\"},\"inputValues\":{\"x\":0,\"y\":0,\"z\":0,\"w\":1},\"ports\":[{\"key\":\"x\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":0},{\"key\":\"y\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":0},{\"key\":\"z\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":0},{\"key\":\"w\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"result\",\"direction\":\"output\",\"type\":\"glsl.vec4\"}],\"references\":[],\"referencesComplete\":true,\"position\":[400,0],\"extensions\":{}}],\"edges\":[{\"id\":\"id-11\",\"from\":{\"nodeId\":\"id-8\",\"portKey\":\"value\"},\"to\":{\"nodeId\":\"id-9\",\"portKey\":\"a\"},\"adaptation\":{\"schema\":\"grape.edge-adaptation\",\"version\":1,\"sourceType\":\"glsl.float\",\"targetType\":\"glsl.float\",\"operation\":\"identity\",\"extensions\":{}},\"extensions\":{}},{\"id\":\"id-12\",\"from\":{\"nodeId\":\"id-9\",\"portKey\":\"result\"},\"to\":{\"nodeId\":\"id-10\",\"portKey\":\"x\"},\"adaptation\":{\"schema\":\"grape.edge-adaptation\",\"version\":1,\"sourceType\":\"glsl.float\",\"targetType\":\"glsl.float\",\"operation\":\"identity\",\"extensions\":{}},\"extensions\":{}},{\"id\":\"id-13\",\"from\":{\"nodeId\":\"id-10\",\"portKey\":\"result\"},\"to\":{\"nodeId\":\"id-5\",\"portKey\":\"color\"},\"adaptation\":{\"schema\":\"grape.edge-adaptation\",\"version\":1,\"sourceType\":\"glsl.vec4\",\"targetType\":\"glsl.vec4\",\"operation\":\"identity\",\"extensions\":{}},\"extensions\":{}}],\"extensions\":{}},\"extensions\":{}}],\"resources\":[],\"losses\":[],\"recovery\":[],\"extensions\":{}}}"
  - button "Accept replacement (one Undo)"
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
  17  |   const event = page.waitForEvent("download");
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
> 57  |   await expect(page.locator("#recovery")).not.toBeVisible();
      |                                               ^ Error: expect(locator).not.toBeVisible() failed
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
  118 |     expect(await exported(page, "Export original")).toEqual(
  119 |       Buffer.from(JSON.stringify(doc)),
  120 |     );
  121 |     await page.getByRole("button", { name: "Close", exact: true }).click();
  122 |     await expect(page.locator(".node")).toHaveCount(1);
  123 |   }
  124 | });
  125 | test("AT-S02-02 browser: explicit missing-module load, move/rename, save/reopen preserve opaque state and block generation", async ({
  126 |   page,
  127 | }) => {
  128 |   const doc = fixture(),
  129 |     node = doc.graph.stages[1].network.nodes[1];
  130 |   node.type.fingerprint = "missing-exact";
  131 |   doc.graph.modules.push({
  132 |     moduleId: node.type.moduleId,
  133 |     version: node.type.version,
  134 |     fingerprint: node.type.fingerprint,
  135 |   });
  136 |   node.state = { opaque: { text: "未知🍇", archive: [1, 2] }, value: 0.25 };
  137 |   await choose(page, doc);
  138 |   await expect(page.locator("#recovery-message")).toContainText(
  139 |     "blocked: IMPORT_ERRORS",
  140 |   );
  141 |   await expect(page.getByLabel("Inspection and proposal")).toContainText(
  142 |     "MISSING_MODULE",
  143 |   );
  144 |   page.once("dialog", (dialog) => dialog.accept());
  145 |   await page.getByRole("button", { name: "Open in new session" }).click();
  146 |   await expect(page.locator(".node")).toHaveCount(4);
  147 |   await page
  148 |     .locator(".node h3")
  149 |     .filter({ hasText: /^Float$/ })
  150 |     .click();
  151 |   page.once("dialog", (dialog) => dialog.accept("Preserved missing"));
  152 |   await page.getByRole("button", { name: "Rename node" }).click();
  153 |   const heading = page
  154 |       .locator(".node h3")
  155 |       .filter({ hasText: /^Preserved missing$/ }),
  156 |     box = await heading.boundingBox();
  157 |   await page.mouse.move(box!.x + 20, box!.y + 10);
```