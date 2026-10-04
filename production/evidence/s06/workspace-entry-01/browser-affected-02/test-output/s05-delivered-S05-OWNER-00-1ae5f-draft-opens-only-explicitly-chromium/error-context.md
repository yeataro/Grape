# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05-delivered.spec.ts >> S05-OWNER-001 exact owner and malformed admission stay strict; original error draft opens only explicitly
- Location: ..\..\..\production\tests\browser\s05-delivered.spec.ts:62:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Upgrade subgraph owners', exact: true })

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
        - button "Open saved" [ref=e18] [cursor=pointer]
        - button "Export JSON" [active] [ref=e21] [cursor=pointer]
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
  - status [ref=e46]: Export started. Saved status is unchanged.
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
            - group "Image output" [ref=e60]:
              - heading "Image output" [level=3] [ref=e61]
              - generic [ref=e62]:
                - button "Image output input color" [ref=e63] [cursor=pointer]:
                  - generic [ref=e65]: color
                - generic [ref=e66]: vec4
            - group "Subgraph" [ref=e67]:
              - heading "Subgraph" [level=3] [ref=e68]
              - generic [ref=e69]:
                - button "Subgraph input Value" [ref=e70] [cursor=pointer]:
                  - generic [ref=e72]: Value
                - generic [ref=e73]: vec4
              - generic [ref=e74]:
                - button "Subgraph output Value" [ref=e75] [cursor=pointer]:
                  - generic [ref=e76]: Value
                - generic [ref=e78]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e79]:
          - button "New subgraph" [ref=e80] [cursor=pointer]
          - button "Library subgraph" [ref=e81] [cursor=pointer]
          - button "Encapsulate" [ref=e82] [cursor=pointer]
          - button "Make independent" [ref=e83] [cursor=pointer]
          - button "Enter subgraph" [ref=e84] [cursor=pointer]
          - button "Arrange nodes" [ref=e85] [cursor=pointer]
          - button "Frame selection" [ref=e86] [cursor=pointer]
          - group [ref=e87]:
            - generic "Local clipboard" [ref=e88] [cursor=pointer]
          - group [ref=e89]:
            - generic "Structures" [ref=e90] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e91]:
          - button "Vertex" [ref=e92] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e93] [cursor=pointer]
        - generic [ref=e94]:
          - button "Add Node" [ref=e95] [cursor=pointer]
          - button "Browse nodes" [ref=e98] [cursor=pointer]
          - button "Up" [disabled] [ref=e101]
          - button "Shortcuts" [ref=e104] [cursor=pointer]
    - complementary [ref=e107]:
      - generic [ref=e108]:
        - heading "Inspector" [level=2] [ref=e109]
        - paragraph [ref=e110]: Select a node to inspect its parameters.
  - generic [ref=e112]:
    - heading "Shader output" [level=2] [ref=e113]
    - paragraph [ref=e114]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e115]:
      - listitem [ref=e116]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e117] [cursor=pointer]
  - contentinfo [ref=e118]:
    - generic [ref=e119]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e120]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  43  | });
  44  | for (const name of deliveredNames)
  45  |   test(`S05-OWNER-001 delivered public flow ${name}`, async ({
  46  |     page,
  47  |     browser,
  48  |   }) => {
  49  |     await page.goto("/");
  50  |     const result = await deliveredFlow(
  51  |       page,
  52  |       name,
  53  |       fs.readFileSync(path.join(samples, name)),
  54  |       fs.readFileSync(path.join(samples, "shared-expand.grape.json")),
  55  |     );
  56  |     await fs.promises.writeFile(
  57  |       path.join(evidence, "delivered-" + name),
  58  |       JSON.stringify({ browser: browser.version(), ...result }, null, 2),
  59  |       { flag: "wx" },
  60  |     );
  61  |   });
  62  | test("S05-OWNER-001 exact owner and malformed admission stay strict; original error draft opens only explicitly", async ({
  63  |   page,
  64  | }) => {
  65  |   await page.goto("/");
  66  |   const valid = fs.readFileSync(
  67  |     path.join(samples, "shared-function.grape.json"),
  68  |   );
  69  |   await openValidFile(page, "valid.grape.json", valid);
  70  |   const before = await exportDocument(page),
  71  |     records = [];
  72  |   for (const kind of [
  73  |     "duplicate-pin",
  74  |     "undeclared-pin",
  75  |     "missing-owner",
  76  |     "missing-mode",
  77  |     "unknown-mode",
  78  |     "missing-dependency",
  79  |   ]) {
  80  |     const doc = JSON.parse(valid.toString()),
  81  |       resource = doc.graph.resources.find((r: any) => r.data.emissionMode);
  82  |     if (kind === "duplicate-pin")
  83  |       doc.graph.modules.push({ ...doc.graph.modules[0] });
  84  |     if (kind === "undeclared-pin" || kind === "missing-owner") {
  85  |       resource.type.fingerprint = "unavailable-exact-owner";
  86  |       if (kind === "missing-owner") {
  87  |         const { typeId, ...pin } = resource.type;
  88  |         doc.graph.modules.push(pin);
  89  |       }
  90  |     }
  91  |     if (kind === "missing-mode") delete resource.data.emissionMode;
  92  |     if (kind === "unknown-mode") resource.data.emissionMode = "guess";
  93  |     if (kind === "missing-dependency") doc.graph.resources = [];
  94  |     const raw = Buffer.from(JSON.stringify(doc)),
  95  |       review = await reviewFile(page, kind + ".json", raw);
  96  |     expect(review.details.candidate).toBeNull();
  97  |     await expect(
  98  |       page.getByRole("button", {
  99  |         name: "Accept replacement (one Undo)",
  100 |         exact: true,
  101 |       }),
  102 |     ).not.toBeVisible();
  103 |     if (["duplicate-pin", "undeclared-pin"].includes(kind))
  104 |       await expect(
  105 |         page.getByRole("button", { name: "Open in new session", exact: true }),
  106 |       ).not.toBeVisible();
  107 |     if (kind.includes("mode"))
  108 |       expect(JSON.stringify(review)).toContain("NETWORK_EMISSION_MODE");
  109 |     if (kind === "missing-owner")
  110 |       expect(JSON.stringify(review)).toContain("MISSING_MODULE");
  111 |     const download = page.waitForEvent("download");
  112 |     await page
  113 |       .getByRole("button", { name: "Export original", exact: true })
  114 |       .click();
  115 |     expect(fs.readFileSync((await (await download).path())!)).toEqual(raw);
  116 |     await page.getByRole("button", { name: "Close", exact: true }).click();
  117 |     expect(await exportDocument(page)).toEqual(before);
  118 |     await expect(
  119 |       page.getByRole("button", { name: "Undo", exact: true }),
  120 |     ).toBeDisabled();
  121 |     records.push({ kind, review, graphAndHistoryUnchanged: true });
  122 |   }
  123 |   const original = fs.readFileSync(
  124 |     new URL("../../evidence/s05/repair-01/samples/legacy-owner.grape.json", import.meta.url),
  125 |   );
  126 |   const review = await reviewFile(page, "original-legacy.grape.json", original);
  127 |   expect(review.message).toContain("IMPORT_ERRORS");
  128 |   expect(review.details.diagnostics.map((d: any) => d.code)).toEqual([
  129 |     "INPUT_REQUIRED",
  130 |   ]);
  131 |   await expect(
  132 |     page.getByRole("button", {
  133 |       name: "Accept replacement (one Undo)",
  134 |       exact: true,
  135 |     }),
  136 |   ).not.toBeVisible();
  137 |   await page
  138 |     .getByRole("button", { name: "Open in new session", exact: true })
  139 |     .click();
  140 |   expect(await exportDocument(page)).toEqual(JSON.parse(original.toString()));
  141 |   await page
  142 |     .getByRole("button", { name: "Upgrade subgraph owners", exact: true })
> 143 |     .click();
      |      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  144 |   const upgraded = await exportDocument(page);
  145 |   expect(upgraded.graph.resources[0].data.emissionMode).toBe("expand");
  146 |   expect(upgraded.graph.resources[0].data.network).toEqual(
  147 |     JSON.parse(original.toString()).graph.resources[0].data.network,
  148 |   );
  149 |   await page
  150 |     .getByRole("button", { name: "Generate GLSL", exact: true })
  151 |     .click();
  152 |   await expect(page.getByRole("list", { name: "Diagnostics" })).toContainText(
  153 |     "INPUT_REQUIRED",
  154 |   );
  155 |   const roundtrip = await saveReopen(page);
  156 |   await fs.promises.writeFile(
  157 |     path.join(evidence, "delivered-negative-admission.json"),
  158 |     JSON.stringify(
  159 |       { records, originalReview: review, originalDraftRoundtrip: roundtrip },
  160 |       null,
  161 |       2,
  162 |     ),
  163 |     { flag: "wx" },
  164 |   );
  165 | });
  166 | 
```