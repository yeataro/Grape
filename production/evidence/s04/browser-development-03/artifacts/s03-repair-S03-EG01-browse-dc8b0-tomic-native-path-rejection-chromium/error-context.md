# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s03-repair.spec.ts >> S03 EG01 browser clipboard imports TOP declarations with one slot and shows atomic native path rejection
- Location: tests\browser\s03-repair.spec.ts:100:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.node')
Expected: 3
Received: 2
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('.node')
    14 × locator resolved to 2 elements
       - unexpected value "2"

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
    - button "Undo" [ref=e28] [cursor=pointer]
    - button "Redo" [disabled] [ref=e29]
    - button "Delete selected" [ref=e30] [cursor=pointer]
    - alert
  - main [ref=e31]:
    - generic [ref=e33]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e34]:
        - generic:
          - generic:
            - group "Image output" [ref=e36]:
              - heading "Image output" [level=3] [ref=e37]
              - generic [ref=e38]:
                - button "Image output input color" [ref=e39] [cursor=pointer]:
                  - generic [ref=e40]: ●
                  - generic [ref=e41]: color
                - generic [ref=e42]: vec4
            - group "Compose" [ref=e43]:
              - heading "Compose" [level=3] [ref=e44]
              - generic [ref=e45]:
                - button "Compose input x" [ref=e46] [cursor=pointer]:
                  - generic [ref=e47]: ●
                  - generic [ref=e48]: x
                - generic [ref=e49]: float
              - generic [ref=e50]:
                - button "Compose input y" [ref=e51] [cursor=pointer]:
                  - generic [ref=e52]: ●
                  - generic [ref=e53]: "y"
                - generic [ref=e54]: float
              - generic [ref=e55]:
                - button "Compose input z" [ref=e56] [cursor=pointer]:
                  - generic [ref=e57]: ●
                  - generic [ref=e58]: z
                - generic [ref=e59]: float
              - generic [ref=e60]:
                - button "Compose input w" [ref=e61] [cursor=pointer]:
                  - generic [ref=e62]: ●
                  - generic [ref=e63]: w
                - generic [ref=e64]: float
              - generic [ref=e65]:
                - button "Compose output result" [ref=e66] [cursor=pointer]:
                  - generic [ref=e67]: result
                  - generic [ref=e68]: ●
                - generic [ref=e69]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - status: "SOURCE_TARGET_UNSUPPORTED: SOURCE_TARGET_UNSUPPORTED"
        - generic [ref=e70]:
          - button "New subgraph" [ref=e71] [cursor=pointer]
          - button "Library subgraph" [ref=e72] [cursor=pointer]
          - button "Encapsulate" [ref=e73] [cursor=pointer]
          - button "Make independent" [ref=e74] [cursor=pointer]
          - button "Enter subgraph" [ref=e75] [cursor=pointer]
          - button "Up" [ref=e76] [cursor=pointer]
          - button "Arrange nodes" [ref=e77] [cursor=pointer]
          - button "Frame selection" [ref=e78] [cursor=pointer]
          - group [ref=e79]:
            - generic "Local clipboard" [ref=e80]
            - textbox "Local clipboard text" [ref=e81]: "{\"format\":\"grape.clipboard\",\"version\":1,\"graphId\":\"id-1\",\"loadId\":\"id-7\",\"modules\":[{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\"},{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\"},{\"moduleId\":\"grape.graph-kinds\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:30d1266c367648c97b57a6cf77eec9d0bf14ac8bdb057fa4eef457539adb98c3\"}],\"network\":{\"id\":\"id-4\",\"nodes\":[{\"id\":\"id-15\",\"name\":\"Source\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\",\"typeId\":\"source\"},\"state\":{\"source\":\"id-14\"},\"inputValues\":{},\"ports\":[{\"key\":\"value\",\"direction\":\"output\",\"type\":\"glsl.sampler2D\"}],\"references\":[{\"slot\":\"source\",\"kind\":\"resource\",\"targetId\":\"id-14\"}],\"referencesComplete\":true,\"position\":[200,140],\"extensions\":{}}],\"edges\":[],\"extensions\":{}},\"resources\":[{\"id\":\"id-14\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\",\"typeId\":\"source-definition\"},\"data\":{\"name\":\"TOP\",\"type\":\"glsl.sampler2D\",\"value\":null,\"clipboard\":true,\"binding\":{\"kind\":\"top\",\"path\":\"/native\",\"source\":\"source-A\",\"origin\":\"origin-A\",\"slot\":9}},\"references\":[],\"referencesComplete\":true,\"extensions\":{}}]}"
            - button "Copy selection" [ref=e82] [cursor=pointer]
            - button "Paste selection" [active] [ref=e83] [cursor=pointer]
          - group [ref=e84]:
            - generic "Structures" [ref=e85]
            - option "New structure" [selected]
    - complementary [ref=e86]:
      - generic [ref=e87]:
        - heading "Inspector" [level=2] [ref=e88]
        - paragraph [ref=e89]: Compose
        - button "Rename node" [ref=e90] [cursor=pointer]
        - generic [ref=e91]:
          - generic [ref=e93]:
            - generic [ref=e94]: Shape
            - combobox "Shape" [ref=e95]:
              - option "vec2"
              - option "vec3"
              - option "RGBA (vec4)" [selected]
          - generic [ref=e97]:
            - generic [ref=e98]: R / X
            - textbox "R / X" [ref=e99]: "0"
            - alert
          - generic [ref=e101]:
            - generic [ref=e102]: G / Y
            - textbox "G / Y" [ref=e103]: "0"
            - alert
          - generic [ref=e105]:
            - generic [ref=e106]: B / Z
            - textbox "B / Z" [ref=e107]: "0"
            - alert
          - generic [ref=e109]:
            - generic [ref=e110]: A / W
            - textbox "A / W" [ref=e111]: "1"
            - alert
  - generic [ref=e113]:
    - heading "Shader output" [level=2] [ref=e114]
    - paragraph [ref=e115]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics"
  - contentinfo [ref=e116]:
    - generic [ref=e117]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e118]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  48  |         );
  49  |       });
  50  |       const before = JSON.stringify(s.graph.capture()),
  51  |         out = compile(s.graph.capture(), s.fixed, esProfile),
  52  |         shaders = out.artifacts.map((a: any) => {
  53  |           const shader = gl.createShader(
  54  |             a.key === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER,
  55  |           )!;
  56  |           gl.shaderSource(shader, a.text);
  57  |           gl.compileShader(shader);
  58  |           const result = {
  59  |             key: a.key,
  60  |             compiled: !!gl.getShaderParameter(shader, gl.COMPILE_STATUS),
  61  |             log: gl.getShaderInfoLog(shader),
  62  |           };
  63  |           gl.deleteShader(shader);
  64  |           return result;
  65  |         });
  66  |       rows.push({
  67  |         nested,
  68  |         graphDiagnostics: s.graph.capture().diagnostics,
  69  |         status: out.status,
  70  |         diagnostics: out.diagnostics,
  71  |         artifacts: out.artifacts,
  72  |         shaders,
  73  |         unchanged: JSON.stringify(s.graph.capture()) === before,
  74  |       });
  75  |     }
  76  |     return {
  77  |       webgl: gl.getParameter(gl.VERSION),
  78  |       renderer: gl.getParameter(gl.RENDERER),
  79  |       rows,
  80  |     };
  81  |   });
  82  |   expect(result.rows[0].status).toBe("success");
  83  |   expect(result.rows[0].shaders).toHaveLength(2);
  84  |   expect(result.rows[0].shaders.every((s: any) => s.compiled)).toBe(true);
  85  |   expect(result.rows[1].status).toBe("failed");
  86  |   expect(result.rows[1].artifacts).toHaveLength(0);
  87  |   expect(
  88  |     result.rows[1].diagnostics.some((d: any) => d.code === "PROFILE_TYPE"),
  89  |   ).toBe(true);
  90  |   expect(
  91  |     result.rows.every(
  92  |       (r: any) => r.unchanged && r.graphDiagnostics.length === 0,
  93  |     ),
  94  |   ).toBe(true);
  95  |   await fs.writeFile(
  96  |     evidence + "/repair-webgl2.json",
  97  |     JSON.stringify({ browser: browser.version(), ...result }, null, 2),
  98  |   );
  99  | });
  100 | test("S03 EG01 browser clipboard imports TOP declarations with one slot and shows atomic native path rejection", async ({
  101 |   page,
  102 | }) => {
  103 |   await page.goto("/");
  104 |   await page.getByRole("button", { name: "Add Compose", exact: true }).click();
  105 |   await page
  106 |     .getByRole("button", { name: "Compose output result", exact: true })
  107 |     .click();
  108 |   await page
  109 |     .getByRole("button", { name: "Image output input color", exact: true })
  110 |     .click();
  111 |   const packets = await page.evaluate(async () => {
  112 |     const { flow } = await import("/tests/fixtures/setup.ts"),
  113 |       { copySelection } = await import("/src/model/transfer.ts");
  114 |     const s = flow();
  115 |     let top = "",
  116 |       array = "";
  117 |     s.graph.change("Native descriptors", (d: any) => {
  118 |       top = d.addReferenceNode(
  119 |         s.network,
  120 |         "source",
  121 |         d.createSource("TOP", "glsl.sampler2D", null, true, {
  122 |           kind: "top",
  123 |           path: "/native",
  124 |           source: "source-A",
  125 |           origin: "origin-A",
  126 |           slot: 9,
  127 |         }),
  128 |       );
  129 |       array = d.addReferenceNode(
  130 |         s.network,
  131 |         "source",
  132 |         d.createSource("Array", 'array@["glsl.float",2]', null, true, {
  133 |           kind: "native-array",
  134 |           path: "x".repeat(2049),
  135 |         }),
  136 |       );
  137 |     });
  138 |     return {
  139 |       top: copySelection(s.graph.capture(), s.fixed, s.network, [top]),
  140 |       bad: copySelection(s.graph.capture(), s.fixed, s.network, [array]),
  141 |     };
  142 |   });
  143 |   await page.getByText("Local clipboard", { exact: true }).click();
  144 |   const text = page.getByRole("textbox", { name: "Local clipboard text" }),
  145 |     paste = page.getByRole("button", { name: "Paste selection", exact: true });
  146 |   await text.fill(JSON.stringify(packets.top));
  147 |   await paste.click();
> 148 |   await expect(page.locator(".node")).toHaveCount(3);
      |                                       ^ Error: expect(locator).toHaveCount(expected) failed
  149 |   await paste.click();
  150 |   await expect(page.locator(".node")).toHaveCount(4);
  151 |   const after = await exported(page);
  152 |   expect(after.graph.resources).toHaveLength(2);
  153 |   expect(
  154 |     new Set(after.graph.resources.map((r: any) => r.data.binding.slot)).size,
  155 |   ).toBe(1);
  156 |   expect(new Set(after.graph.resources.map((r: any) => r.id)).size).toBe(2);
  157 |   await page.getByRole("button", { name: "Undo", exact: true }).click();
  158 |   await expect(page.locator(".node")).toHaveCount(3);
  159 |   const before = await exported(page);
  160 |   await text.fill(JSON.stringify(packets.bad));
  161 |   await paste.click();
  162 |   await expect(page.locator("body")).toContainText("SOURCE_PATH");
  163 |   expect(await exported(page)).toEqual(before);
  164 |   await expect(
  165 |     page.getByRole("button", { name: "Redo", exact: true }),
  166 |   ).toBeEnabled();
  167 |   await page.getByRole("button", { name: "Redo", exact: true }).click();
  168 |   expect(await exported(page)).toEqual(after);
  169 |   await page.screenshot({
  170 |     path: evidence + "/repair-source-clipboard.png",
  171 |     fullPage: true,
  172 |   });
  173 | });
  174 | 
```