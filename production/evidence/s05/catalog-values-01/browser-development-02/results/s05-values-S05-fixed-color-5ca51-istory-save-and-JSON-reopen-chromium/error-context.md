# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05-values.spec.ts >> S05 fixed color pixel: public create edit connect history save and JSON reopen
- Location: tests\browser\s05-values.spec.ts:70:5

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('#message')
Expected substring: "Generated successfully"
Received string:    ""
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('#message')
    14 × locator resolved to <div id="message" role="status"></div>
       - unexpected value ""

```

```yaml
- status
```

# Test source

```ts
  42  |           }
  43  |     return rows;
  44  |   });
  45  |   for (const row of rows) {
  46  |     expect(row.unchanged).toBe(true);
  47  |     if (row.stage === "pixel")
  48  |       row.expected.forEach((v, i) =>
  49  |         expect(
  50  |           Math.abs(row.result.pixels[i] - Math.round(v * 255)),
  51  |         ).toBeLessThanOrEqual(1),
  52  |       );
  53  |     else {
  54  |       expect(row.result.error).toBe(0);
  55  |       expect(row.result.linked).toBe(true);
  56  |       row.expected.forEach((v, i) =>
  57  |         expect(Math.abs(row.result.position[i] - v)).toBeLessThan(1e-6),
  58  |       );
  59  |     }
  60  |   }
  61  |   expect(rows).toHaveLength(64);
  62  |   await fs.writeFile(
  63  |     evidence + "/fixed-value-numerical-matrix.json",
  64  |     JSON.stringify({ browser: browser.version(), rows }, null, 2),
  65  |     { flag: "wx" },
  66  |   );
  67  | });
  68  | for (const item of valueCases)
  69  |   for (const stage of ["pixel", "vertex"] as const)
  70  |     test(`S05 fixed ${item.key} ${stage}: public create edit connect history save and JSON reopen`, async ({
  71  |       page,
  72  |     }) => {
  73  |       page.on("dialog", (d) => void d.accept());
  74  |       await page.goto("/");
  75  |       if (stage === "vertex") {
  76  |         const s = valueFixture(item.key, "vertex", "root", false, true);
  77  |         await openValidFile(
  78  |           page,
  79  |           "vertex-workspace.grape.json",
  80  |           Buffer.from(JSON.stringify(s.graph.capture().document)),
  81  |         );
  82  |       }
  83  |       const canvas = page.locator(".canvas").first();
  84  |       await page
  85  |         .getByRole("button", { name: "Add " + item.button, exact: true })
  86  |         .click();
  87  |       await canvas
  88  |         .getByRole("heading", { name: item.label, exact: true })
  89  |         .last()
  90  |         .click();
  91  |       const initial =
  92  |           typeof item.initial === "number" ? [item.initial] : item.initial,
  93  |         edited = typeof item.edited === "number" ? [item.edited] : item.edited;
  94  |       for (let i = 0; i < item.components.length; i++) {
  95  |         const input = page.getByRole("textbox", {
  96  |           name: item.components[i],
  97  |           exact: true,
  98  |         });
  99  |         await expect(input).toHaveValue(String(initial[i]));
  100 |         await input.fill(String(edited[i]));
  101 |         await input.press("Enter");
  102 |         await expect(input).toHaveValue(String(edited[i]));
  103 |       }
  104 |       await page.getByRole("button", { name: "Undo", exact: true }).click();
  105 |       await expect(
  106 |         page.getByRole("textbox", {
  107 |           name: item.components.at(-1)!,
  108 |           exact: true,
  109 |         }),
  110 |       ).toHaveValue(String(initial.at(-1)));
  111 |       await page.getByRole("button", { name: "Redo", exact: true }).click();
  112 |       await expect(
  113 |         page.getByRole("textbox", {
  114 |           name: item.components.at(-1)!,
  115 |           exact: true,
  116 |         }),
  117 |       ).toHaveValue(String(edited.at(-1)));
  118 |       const first = page.getByRole("textbox", {
  119 |         name: item.components[0],
  120 |         exact: true,
  121 |       });
  122 |       await first.fill("Infinity");
  123 |       await first.press("Enter");
  124 |       await expect(first).toHaveAttribute("aria-invalid", "true");
  125 |       await first.press("Escape");
  126 |       await expect(first).toHaveValue(String(edited[0]));
  127 |       await canvas
  128 |         .getByRole("button", { name: item.label + " output out", exact: true })
  129 |         .click();
  130 |       await canvas
  131 |         .getByRole("button", {
  132 |           name:
  133 |             stage === "pixel"
  134 |               ? "Image output input color"
  135 |               : "Position input Value",
  136 |           exact: true,
  137 |         })
  138 |         .click();
  139 |       await page
  140 |         .getByRole("button", { name: "Generate GLSL", exact: true })
  141 |         .click();
> 142 |       await expect(page.locator("#message")).toContainText(
      |                                              ^ Error: expect(locator).toContainText(expected) failed
  143 |         "Generated successfully",
  144 |       );
  145 |       const document = await exportDocument(page),
  146 |         node = document.graph.stages
  147 |           .find((x: any) => x.key === stage)
  148 |           .network.nodes.find(
  149 |             (x: any) =>
  150 |               x.type.moduleId === "grape.nodes.fixed-values" &&
  151 |               x.type.typeId === item.key,
  152 |           );
  153 |       expect(node.state.value).toEqual(item.edited);
  154 |       expect(node.ports).toEqual([
  155 |         { key: "out", direction: "output", type: item.type },
  156 |       ]);
  157 |       await saveReopen(page);
  158 |       await openValidFile(
  159 |         page,
  160 |         item.key + ".grape.json",
  161 |         Buffer.from(JSON.stringify(document)),
  162 |       );
  163 |       expect(await exportDocument(page)).toEqual(document);
  164 |       await page.screenshot({
  165 |         path: evidence + `/fixed-${item.key}-${stage}.png`,
  166 |         fullPage: true,
  167 |       });
  168 |       await fs.writeFile(
  169 |         evidence + `/fixed-${item.key}-${stage}.json`,
  170 |         JSON.stringify(
  171 |           {
  172 |             leaf: item.key,
  173 |             stage,
  174 |             document,
  175 |             operations: [
  176 |               "public create",
  177 |               "every component edit",
  178 |               "one-component Undo/Redo",
  179 |               "nonfinite rejection and Escape",
  180 |               "fixed out connection",
  181 |               "Generate",
  182 |               "save/reopen",
  183 |               "JSON export/file review/new session",
  184 |             ],
  185 |           },
  186 |           null,
  187 |           2,
  188 |         ),
  189 |         { flag: "wx" },
  190 |       );
  191 |     });
  192 | 
```