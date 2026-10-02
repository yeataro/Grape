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
Expected: 2
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('.node')
    14 × locator resolved to 1 element
       - unexpected value "1"

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
    - generic [ref=e17]:
      - generic [ref=e18]: Unsaved changes
      - generic [ref=e19]: Host-free
  - status [ref=e20]
  - generic [ref=e22]:
    - button "Add Float" [ref=e23] [cursor=pointer]
    - button "Add Multiply" [ref=e24] [cursor=pointer]
    - button "Add Compose" [ref=e25] [cursor=pointer]
    - button "Undo" [disabled] [ref=e26]
    - button "Redo" [disabled] [ref=e27]
    - button "Delete selected" [ref=e28] [cursor=pointer]
    - alert
  - main [ref=e29]:
    - generic [ref=e31]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e32]:
        - group "Image output" [ref=e33]:
          - heading "Image output" [level=3] [ref=e34]
          - generic [ref=e35]:
            - button "Image output input color" [ref=e36] [cursor=pointer]:
              - generic [ref=e37]: ●
              - generic [ref=e38]: color
            - generic [ref=e39]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - status: "IMPORT_ERRORS: IMPORT_ERRORS"
        - generic [ref=e40]:
          - button "New subgraph" [ref=e41] [cursor=pointer]
          - button "Library subgraph" [ref=e42] [cursor=pointer]
          - button "Encapsulate" [ref=e43] [cursor=pointer]
          - button "Make independent" [ref=e44] [cursor=pointer]
          - button "Enter subgraph" [ref=e45] [cursor=pointer]
          - button "Up" [ref=e46] [cursor=pointer]
          - button "Arrange nodes" [ref=e47] [cursor=pointer]
          - button "Frame selection" [ref=e48] [cursor=pointer]
          - group [ref=e49]:
            - generic "Local clipboard" [ref=e50]
            - textbox "Local clipboard text" [ref=e51]: "{\"format\":\"grape.clipboard\",\"version\":1,\"graphId\":\"id-1\",\"loadId\":\"id-7\",\"modules\":[{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\"},{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:7530ff6a1d97d8d85d9ecd3d9757921990d63b623b2f5a2423b79a6faf9d87db\"},{\"moduleId\":\"grape.graph-kinds\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:30d1266c367648c97b57a6cf77eec9d0bf14ac8bdb057fa4eef457539adb98c3\"}],\"network\":{\"id\":\"id-4\",\"nodes\":[{\"id\":\"id-15\",\"name\":\"Source\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:7530ff6a1d97d8d85d9ecd3d9757921990d63b623b2f5a2423b79a6faf9d87db\",\"typeId\":\"source\"},\"state\":{\"source\":\"id-14\"},\"inputValues\":{},\"ports\":[{\"key\":\"value\",\"direction\":\"output\",\"type\":\"glsl.sampler2D\"}],\"references\":[{\"slot\":\"source\",\"kind\":\"resource\",\"targetId\":\"id-14\"}],\"referencesComplete\":true,\"position\":[200,140],\"extensions\":{}}],\"edges\":[],\"extensions\":{}},\"resources\":[{\"id\":\"id-14\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:7530ff6a1d97d8d85d9ecd3d9757921990d63b623b2f5a2423b79a6faf9d87db\",\"typeId\":\"source-definition\"},\"data\":{\"name\":\"TOP\",\"type\":\"glsl.sampler2D\",\"value\":null,\"clipboard\":true,\"binding\":{\"kind\":\"top\",\"path\":\"/native\",\"source\":\"source-A\",\"origin\":\"origin-A\",\"slot\":9}},\"references\":[],\"referencesComplete\":true,\"extensions\":{}}]}"
            - button "Copy selection" [ref=e52] [cursor=pointer]
            - button "Paste selection" [active] [ref=e53] [cursor=pointer]
          - group [ref=e54]:
            - generic "Structures" [ref=e55]
            - option "New structure" [selected]
    - complementary [ref=e56]:
      - generic [ref=e57]:
        - heading "Inspector" [level=2] [ref=e58]
        - paragraph [ref=e59]: Select a node to inspect its parameters.
  - generic [ref=e61]:
    - heading "Shader output" [level=2] [ref=e62]
    - paragraph [ref=e63]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e64]:
      - listitem [ref=e65]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e66] [cursor=pointer]
  - contentinfo [ref=e67]:
    - generic [ref=e68]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e69]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  41  |           { nodeId: n, portKey: "value" },
  42  |           { nodeId: f, portKey: "value" },
  43  |         );
  44  |         d.connect(
  45  |           s.network,
  46  |           { nodeId: f, portKey: "field" },
  47  |           { nodeId: s.compose, portKey: "y" },
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
  104 |   const packets = await page.evaluate(async () => {
  105 |     const { flow } = await import("/tests/fixtures/setup.ts"),
  106 |       { copySelection } = await import("/src/model/transfer.ts");
  107 |     const s = flow();
  108 |     let top = "",
  109 |       array = "";
  110 |     s.graph.change("Native descriptors", (d: any) => {
  111 |       top = d.addReferenceNode(
  112 |         s.network,
  113 |         "source",
  114 |         d.createSource("TOP", "glsl.sampler2D", null, true, {
  115 |           kind: "top",
  116 |           path: "/native",
  117 |           source: "source-A",
  118 |           origin: "origin-A",
  119 |           slot: 9,
  120 |         }),
  121 |       );
  122 |       array = d.addReferenceNode(
  123 |         s.network,
  124 |         "source",
  125 |         d.createSource("Array", 'array@["glsl.float",2]', null, true, {
  126 |           kind: "native-array",
  127 |           path: "x".repeat(2049),
  128 |         }),
  129 |       );
  130 |     });
  131 |     return {
  132 |       top: copySelection(s.graph.capture(), s.fixed, s.network, [top]),
  133 |       bad: copySelection(s.graph.capture(), s.fixed, s.network, [array]),
  134 |     };
  135 |   });
  136 |   await page.getByText("Local clipboard", { exact: true }).click();
  137 |   const text = page.getByRole("textbox", { name: "Local clipboard text" }),
  138 |     paste = page.getByRole("button", { name: "Paste selection", exact: true });
  139 |   await text.fill(JSON.stringify(packets.top));
  140 |   await paste.click();
> 141 |   await expect(page.locator(".node")).toHaveCount(2);
      |                                       ^ Error: expect(locator).toHaveCount(expected) failed
  142 |   await paste.click();
  143 |   await expect(page.locator(".node")).toHaveCount(3);
  144 |   const after = await exported(page);
  145 |   expect(after.graph.resources).toHaveLength(2);
  146 |   expect(
  147 |     new Set(after.graph.resources.map((r: any) => r.data.binding.slot)).size,
  148 |   ).toBe(1);
  149 |   expect(new Set(after.graph.resources.map((r: any) => r.id)).size).toBe(2);
  150 |   await page.getByRole("button", { name: "Undo", exact: true }).click();
  151 |   await expect(page.locator(".node")).toHaveCount(2);
  152 |   const before = await exported(page);
  153 |   await text.fill(JSON.stringify(packets.bad));
  154 |   await paste.click();
  155 |   await expect(page.locator("body")).toContainText("SOURCE_PATH");
  156 |   expect(await exported(page)).toEqual(before);
  157 |   await expect(
  158 |     page.getByRole("button", { name: "Redo", exact: true }),
  159 |   ).toBeEnabled();
  160 |   await page.getByRole("button", { name: "Redo", exact: true }).click();
  161 |   expect(await exported(page)).toEqual(after);
  162 |   await page.screenshot({
  163 |     path: evidence + "/repair-source-clipboard.png",
  164 |     fullPage: true,
  165 |   });
  166 | });
  167 | 
```