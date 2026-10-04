# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05-delivered.spec.ts >> S05-OWNER-001 exact owner and malformed admission stay strict; original error draft opens only explicitly
- Location: production\tests\browser\s05-delivered.spec.ts:67:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('list', { name: 'Diagnostics' })
Expected substring: "INPUT_REQUIRED"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for getByRole('list', { name: 'Diagnostics' })

```

```yaml
- banner:
  - text: Grape SHADER WORKSPACE Development · unversioned
  - button "本輪更新"
  - navigation "Document actions":
    - button "Save"
    - button "Generate GLSL"
  - text: Unsaved changes Host-free
- button "Undo" [disabled]
- button "Redo" [disabled]
- button "Delete selected"
- alert
- main:
  - tablist "canvas-1 panels":
    - tab "Canvas · canvas-1" [selected]
    - button "Collapse active panel in canvas-1": ▾
    - button "Panel options in canvas-1": ⋯
  - img
  - group "Image output":
    - heading "Image output" [level=3]
    - button "Image output input color"
    - text: color vec4
  - group "Subgraph":
    - heading "Subgraph" [level=3]
    - button "Subgraph input Value"
    - text: Value vec4 [1,1,1,1]
    - button "Subgraph output Value"
    - text: Value vec4
  - button "Untitled shader / pixel" [disabled]
  - button "New subgraph"
  - button "Library subgraph"
  - button "Encapsulate"
  - button "Make independent"
  - button "Enter subgraph"
  - button "Arrange nodes"
  - button "Frame selection"
  - group: Local clipboard
  - group: Structures
  - button "Vertex"
  - button "Pixel" [pressed]
  - button "Add Node"
  - button "Browse nodes"
  - button "Up" [disabled]
  - button "Shortcuts"
  - img
  - complementary:
    - tablist "inspector panels":
      - tab "Inspector · inspector" [selected]
      - button "Collapse active panel in inspector": ▾
      - button "Panel options in inspector": ⋯
    - heading "Inspector" [level=2]
    - paragraph: Select a node to inspect its parameters.
  - separator "right sidebar width"
- contentinfo:
  - button "Project actions"
  - alert:
    - button "Read full application status": "INPUT_REQUIRED: Connect the required input."
  - button "Shader output"
  - button "Panels"
  - button "Hints"
```

# Test source

```ts
  58  |       fs.readFileSync(path.join(samples, name)),
  59  |       fs.readFileSync(path.join(samples, "shared-expand.grape.json")),
  60  |     );
  61  |     await fs.promises.writeFile(
  62  |       path.join(evidence, "delivered-" + name),
  63  |       JSON.stringify({ browser: browser.version(), ...result }, null, 2),
  64  |       { flag: "wx" },
  65  |     );
  66  |   });
  67  | test("S05-OWNER-001 exact owner and malformed admission stay strict; original error draft opens only explicitly", async ({
  68  |   page,
  69  | }) => {
  70  |   await page.goto("/");
  71  |   const valid = fs.readFileSync(
  72  |     path.join(samples, "shared-function.grape.json"),
  73  |   );
  74  |   await openValidFile(page, "valid.grape.json", valid);
  75  |   const before = await exportDocument(page),
  76  |     records = [];
  77  |   for (const kind of [
  78  |     "duplicate-pin",
  79  |     "undeclared-pin",
  80  |     "missing-owner",
  81  |     "missing-mode",
  82  |     "unknown-mode",
  83  |     "missing-dependency",
  84  |   ]) {
  85  |     const doc = JSON.parse(valid.toString()),
  86  |       resource = doc.graph.resources.find((r: any) => r.data.emissionMode);
  87  |     if (kind === "duplicate-pin")
  88  |       doc.graph.modules.push({ ...doc.graph.modules[0] });
  89  |     if (kind === "undeclared-pin" || kind === "missing-owner") {
  90  |       resource.type.fingerprint = "unavailable-exact-owner";
  91  |       if (kind === "missing-owner") {
  92  |         const { typeId, ...pin } = resource.type;
  93  |         doc.graph.modules.push(pin);
  94  |       }
  95  |     }
  96  |     if (kind === "missing-mode") delete resource.data.emissionMode;
  97  |     if (kind === "unknown-mode") resource.data.emissionMode = "guess";
  98  |     if (kind === "missing-dependency") doc.graph.resources = [];
  99  |     const raw = Buffer.from(JSON.stringify(doc)),
  100 |       review = await reviewFile(page, kind + ".json", raw);
  101 |     expect(review.details.candidate).toBeNull();
  102 |     await expect(
  103 |       page.getByRole("button", {
  104 |         name: "Accept replacement (one Undo)",
  105 |         exact: true,
  106 |       }),
  107 |     ).not.toBeVisible();
  108 |     if (["duplicate-pin", "undeclared-pin"].includes(kind))
  109 |       await expect(
  110 |         page.getByRole("button", { name: "Open in new session", exact: true }),
  111 |       ).not.toBeVisible();
  112 |     if (kind.includes("mode"))
  113 |       expect(JSON.stringify(review)).toContain("NETWORK_EMISSION_MODE");
  114 |     if (kind === "missing-owner")
  115 |       expect(JSON.stringify(review)).toContain("MISSING_MODULE");
  116 |     const download = page.waitForEvent("download");
  117 |     await page
  118 |       .getByRole("button", { name: "Export original", exact: true })
  119 |       .click();
  120 |     expect(fs.readFileSync((await (await download).path())!)).toEqual(raw);
  121 |     await page.getByRole("button", { name: "Close", exact: true }).click();
  122 |     expect(await exportDocument(page)).toEqual(before);
  123 |     await expect(
  124 |       page.getByRole("button", { name: "Undo", exact: true }),
  125 |     ).toBeDisabled();
  126 |     records.push({ kind, review, graphAndHistoryUnchanged: true });
  127 |   }
  128 |   const original = fs.readFileSync(
  129 |     new URL(
  130 |       "../../evidence/s05/repair-01/samples/legacy-owner.grape.json",
  131 |       import.meta.url,
  132 |     ),
  133 |   );
  134 |   const review = await reviewFile(page, "original-legacy.grape.json", original);
  135 |   expect(review.message).toContain("IMPORT_ERRORS");
  136 |   expect(review.details.diagnostics.map((d: any) => d.code)).toEqual([
  137 |     "INPUT_REQUIRED",
  138 |   ]);
  139 |   await expect(
  140 |     page.getByRole("button", {
  141 |       name: "Accept replacement (one Undo)",
  142 |       exact: true,
  143 |     }),
  144 |   ).not.toBeVisible();
  145 |   await page
  146 |     .getByRole("button", { name: "Open in new session", exact: true })
  147 |     .click();
  148 |   expect(await exportDocument(page)).toEqual(JSON.parse(original.toString()));
  149 |   await clickAction(page, "Upgrade subgraph owners");
  150 |   const upgraded = await exportDocument(page);
  151 |   expect(upgraded.graph.resources[0].data.emissionMode).toBe("expand");
  152 |   expect(upgraded.graph.resources[0].data.network).toEqual(
  153 |     JSON.parse(original.toString()).graph.resources[0].data.network,
  154 |   );
  155 |   await page
  156 |     .getByRole("button", { name: "Generate GLSL", exact: true })
  157 |     .click();
> 158 |   await expect(page.getByRole("list", { name: "Diagnostics" })).toContainText(
      |                                                                 ^ Error: expect(locator).toContainText(expected) failed
  159 |     "INPUT_REQUIRED",
  160 |   );
  161 |   const roundtrip = await saveReopen(page);
  162 |   await fs.promises.writeFile(
  163 |     path.join(evidence, "delivered-negative-admission.json"),
  164 |     JSON.stringify(
  165 |       { records, originalReview: review, originalDraftRoundtrip: roundtrip },
  166 |       null,
  167 |       2,
  168 |     ),
  169 |     { flag: "wx" },
  170 |   );
  171 | });
  172 | 
```