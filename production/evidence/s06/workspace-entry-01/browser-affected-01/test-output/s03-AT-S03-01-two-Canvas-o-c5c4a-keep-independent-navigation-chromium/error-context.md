# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s03.spec.ts >> AT-S03-01 two Canvas occurrences share parameters and keep independent navigation
- Location: ..\..\..\production\tests\browser\s03.spec.ts:225:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.canvas').nth(1).locator('.node h3').filter({ hasText: /^Inputs$/ })
    - locator resolved to <h3>Inputs</h3>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button title="Pixel Stage" aria-pressed="true" data-stage-id="54b47610-82c6-46ad-9e49-021c813bb2fb">Pixel</button> from <div class="stage-switch" data-key="9bd46bba-1c44-4c40-a9ba-c22608130517:vertex|54b47610-82c6-46ad-9e49-021c813bb2fb:pixel">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button title="Pixel Stage" aria-pressed="true" data-stage-id="54b47610-82c6-46ad-9e49-021c813bb2fb">Pixel</button> from <div class="stage-switch" data-key="9bd46bba-1c44-4c40-a9ba-c22608130517:vertex|54b47610-82c6-46ad-9e49-021c813bb2fb:pixel">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    56 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <button title="Pixel Stage" aria-pressed="true" data-stage-id="54b47610-82c6-46ad-9e49-021c813bb2fb">Pixel</button> from <div class="stage-switch" data-key="9bd46bba-1c44-4c40-a9ba-c22608130517:vertex|54b47610-82c6-46ad-9e49-021c813bb2fb:pixel">…</div> subtree intercepts pointer events
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
        - button "Open saved" [ref=e18] [cursor=pointer]
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
    - button "Undo" [ref=e49] [cursor=pointer]
    - button "Redo" [disabled] [ref=e52]
    - button "Delete selected" [ref=e55] [cursor=pointer]
    - alert
  - main [ref=e56]:
    - generic [ref=e57]:
      - generic [ref=e58]:
        - generic: Canvas 1
        - generic "Shader graph canvas" [ref=e59]:
          - generic:
            - generic:
              - group "Inputs" [ref=e62]:
                - heading "Inputs" [level=3] [ref=e63]
                - button "Create input port from selection" [ref=e64] [cursor=pointer]
                - generic [ref=e65]:
                  - button "Inputs output Input 1" [ref=e66] [cursor=pointer]:
                    - generic [ref=e67]: Input 1
                  - generic [ref=e69]: float
              - group "Outputs" [ref=e70]:
                - heading "Outputs" [level=3] [ref=e71]
                - button "Create output port from selection" [ref=e72] [cursor=pointer]
                - generic [ref=e73]:
                  - button "Outputs input Output 1" [ref=e74] [cursor=pointer]:
                    - generic [ref=e76]: Output 1
                  - generic [ref=e77]: float
              - group "Multiply" [ref=e78]:
                - heading "Multiply" [level=3] [ref=e79]
                - generic [ref=e80]:
                  - button "Multiply input a" [ref=e81] [cursor=pointer]:
                    - generic [ref=e83]: a
                  - generic [ref=e84]: float
                - generic [ref=e85]:
                  - button "Multiply input b" [ref=e86] [cursor=pointer]:
                    - generic [ref=e88]: b
                  - generic [ref=e89]: float
                - generic [ref=e90]:
                  - button "Multiply output result" [ref=e91] [cursor=pointer]:
                    - generic [ref=e92]: result
                  - generic [ref=e94]: float
          - generic:
            - button "Untitled shader / pixel" [ref=e95] [cursor=pointer]
            - button "Subgraph" [disabled]
          - generic [ref=e96]:
            - button "New subgraph" [ref=e97] [cursor=pointer]
            - button "Library subgraph" [ref=e98] [cursor=pointer]
            - button "Encapsulate" [ref=e99] [cursor=pointer]
            - button "Make independent" [ref=e100] [cursor=pointer]
            - button "Enter subgraph" [ref=e101] [cursor=pointer]
            - button "Arrange nodes" [ref=e102] [cursor=pointer]
            - button "Frame selection" [ref=e103] [cursor=pointer]
            - group [ref=e104]:
              - generic "Subgraph interface" [ref=e105] [cursor=pointer]
              - option "Expand" [selected]
              - option "Function"
              - option "input" [selected]
              - option "output"
            - group [ref=e106]:
              - generic "Local clipboard" [ref=e107] [cursor=pointer]
              - textbox "Local clipboard text" [ref=e108]: "{\"format\":\"grape.clipboard\",\"version\":1,\"graphId\":\"604dcabf-02db-4080-a950-658a3abb5e9f\",\"loadId\":\"dd29bff3-7df5-4d52-814e-253c986a6033\",\"modules\":[{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\"},{\"moduleId\":\"grape.nodes.fixed-values\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:0d75d254ae4654e672001bc326252ab9775c87b581b79c15e6e8d44fee59a6ba\"},{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\"},{\"moduleId\":\"grape.resources.extents\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:bcfaaca3ef01c57070e05b26e09bbcacde5d51f6ba0091b8b6aaf3d83efa3c60\"},{\"moduleId\":\"grape.resources.image-sources\",\"version\":\"0.2.0\",\"fingerprint\":\"sha256:bb0ff902b36d7a07fc104412d0ccb11e4e7efed0106aa3c8595026dbcef8b212\"},{\"moduleId\":\"grape.resources.function-networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:25d291427adb77405f826a636cd2a7c9a5851f0017cb779ced1a13e5a9b0b9e7\"},{\"moduleId\":\"grape.nodes.function-operations\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\"},{\"moduleId\":\"grape.graph-kinds\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:30d1266c367648c97b57a6cf77eec9d0bf14ac8bdb057fa4eef457539adb98c3\"},{\"moduleId\":\"grape.nodes.image-output\",\"version\":\"0.2.0\",\"fingerprint\":\"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\"},{\"moduleId\":\"grape.graph-kinds\",\"version\":\"0.2.0\",\"fingerprint\":\"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\"}],\"network\":{\"id\":\"722b0629-13cb-48b5-b100-9b74dee18d2f\",\"nodes\":[{\"id\":\"1e809ec7-ee53-4c30-a6e3-d117cc4145b6\",\"name\":\"Subgraph\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\",\"typeId\":\"call\"},\"state\":{\"definition\":\"ed4cb57d-e9fd-4ffd-a51c-fecc522c529a\"},\"inputValues\":{\"1e875858-535a-4ba4-b1f8-75f527e03b48\":1},\"ports\":[{\"key\":\"1e875858-535a-4ba4-b1f8-75f527e03b48\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"e0ffe143-1cc0-484b-8a3e-1d7f3c4b48e2\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"references\":[{\"slot\":\"definition\",\"kind\":\"resource\",\"targetId\":\"ed4cb57d-e9fd-4ffd-a51c-fecc522c529a\"}],\"referencesComplete\":true,\"position\":[160,120],\"extensions\":{}}],\"edges\":[],\"extensions\":{}},\"resources\":[{\"id\":\"ed4cb57d-e9fd-4ffd-a51c-fecc522c529a\",\"type\":{\"moduleId\":\"grape.resources.function-networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:25d291427adb77405f826a636cd2a7c9a5851f0017cb779ced1a13e5a9b0b9e7\",\"typeId\":\"definition\"},\"data\":{\"name\":\"Subgraph\",\"local\":true,\"origin\":null,\"network\":{\"id\":\"32c179e3-520b-4aae-8046-bd131b0414b3\",\"nodes\":[{\"id\":\"3c258b80-8491-4e44-9abe-6c6dd6671e02\",\"name\":\"Inputs\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\",\"typeId\":\"network-input\"},\"state\":{\"definition\":\"ed4cb57d-e9fd-4ffd-a51c-fecc522c529a\"},\"inputValues\":{},\"ports\":[{\"key\":\"1e875858-535a-4ba4-b1f8-75f527e03b48\",\"direction\":\"output\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1}],\"references\":[{\"slot\":\"definition\",\"kind\":\"resource\",\"targetId\":\"ed4cb57d-e9fd-4ffd-a51c-fecc522c529a\"}],\"referencesComplete\":true,\"position\":[0,0],\"extensions\":{}},{\"id\":\"ba7584d0-b5cb-42a0-aeef-26d78d0e4a4d\",\"name\":\"Outputs\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\",\"typeId\":\"network-output\"},\"state\":{\"definition\":\"ed4cb57d-e9fd-4ffd-a51c-fecc522c529a\"},\"inputValues\":{\"e0ffe143-1cc0-484b-8a3e-1d7f3c4b48e2\":0},\"ports\":[{\"key\":\"e0ffe143-1cc0-484b-8a3e-1d7f3c4b48e2\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":0}],\"references\":[{\"slot\":\"definition\",\"kind\":\"resource\",\"targetId\":\"ed4cb57d-e9fd-4ffd-a51c-fecc522c529a\"}],\"referencesComplete\":true,\"position\":[600,0],\"extensions\":{}},{\"id\":\"dee33c1a-3f5d-4901-b919-7b6360bc5f5c\",\"name\":\"Multiply\",\"type\":{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\",\"typeId\":\"multiply\"},\"state\":{},\"inputValues\":{\"a\":1,\"b\":2},\"ports\":[{\"key\":\"a\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"b\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":2},{\"key\":\"result\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"references\":[],\"referencesComplete\":true,\"position\":[240,96],\"extensions\":{}}],\"edges\":[{\"id\":\"0a709eea-f15c-4393-abe9-acde7c6e0e40\",\"from\":{\"nodeId\":\"3c258b80-8491-4e44-9abe-6c6dd6671e02\",\"portKey\":\"1e875858-535a-4ba4-b1f8-75f527e03b48\"},\"to\":{\"nodeId\":\"dee33c1a-3f5d-4901-b919-7b6360bc5f5c\",\"portKey\":\"a\"},\"adaptation\":{\"schema\":\"grape.edge-adaptation\",\"version\":1,\"sourceType\":\"glsl.float\",\"targetType\":\"glsl.float\",\"operation\":\"identity\",\"extensions\":{}},\"extensions\":{}},{\"id\":\"a187d569-b771-4238-9df9-fa49671cca8a\",\"from\":{\"nodeId\":\"dee33c1a-3f5d-4901-b919-7b6360bc5f5c\",\"portKey\":\"result\"},\"to\":{\"nodeId\":\"ba7584d0-b5cb-42a0-aeef-26d78d0e4a4d\",\"portKey\":\"e0ffe143-1cc0-484b-8a3e-1d7f3c4b48e2\"},\"adaptation\":{\"schema\":\"grape.edge-adaptation\",\"version\":1,\"sourceType\":\"glsl.float\",\"targetType\":\"glsl.float\",\"operation\":\"identity\",\"extensions\":{}},\"extensions\":{}}],\"extensions\":{}},\"interface\":[{\"key\":\"1e875858-535a-4ba4-b1f8-75f527e03b48\",\"name\":\"Input 1\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"e0ffe143-1cc0-484b-8a3e-1d7f3c4b48e2\",\"name\":\"Output 1\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"dependencies\":[],\"emissionMode\":\"expand\"},\"references\":[],\"referencesComplete\":true,\"extensions\":{}}]}"
              - button "Copy selection" [ref=e109] [cursor=pointer]
              - button "Paste selection" [ref=e110] [cursor=pointer]
            - group [ref=e111]:
              - generic "Structures" [ref=e112] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=e113]:
            - button "Vertex" [ref=e114] [cursor=pointer]
            - button "Pixel" [pressed] [ref=e115] [cursor=pointer]
          - generic [ref=e116]:
            - button "Add Node" [ref=e117] [cursor=pointer]
            - button "Browse nodes" [ref=e120] [cursor=pointer]
            - button "Up" [ref=e123] [cursor=pointer]
            - button "Shortcuts" [ref=e126] [cursor=pointer]
      - generic [ref=e129]:
        - generic: Canvas 2
        - generic "Shader graph canvas" [active] [ref=e130]:
          - generic:
            - generic:
              - group "Inputs" [ref=e133]:
                - heading "Inputs" [level=3] [ref=e134]
                - button "Create input port from selection" [ref=e135] [cursor=pointer]
                - generic [ref=e136]:
                  - button "Inputs output Input 1" [ref=e137] [cursor=pointer]:
                    - generic [ref=e138]: Input 1
                  - generic [ref=e140]: float
              - group "Outputs" [ref=e141]:
                - heading "Outputs" [level=3] [ref=e142]
                - button "Create output port from selection" [ref=e143] [cursor=pointer]
                - generic [ref=e144]:
                  - button "Outputs input Output 1" [ref=e145] [cursor=pointer]:
                    - generic [ref=e147]: Output 1
                  - generic [ref=e148]: float
              - group "Multiply" [ref=e149]:
                - heading "Multiply" [level=3] [ref=e150]
                - generic [ref=e151]:
                  - button "Multiply input a" [ref=e152] [cursor=pointer]:
                    - generic [ref=e154]: a
                  - generic [ref=e155]: float
                - generic [ref=e156]:
                  - button "Multiply input b" [ref=e157] [cursor=pointer]:
                    - generic [ref=e159]: b
                  - generic [ref=e160]: float
                - generic [ref=e161]:
                  - button "Multiply output result" [ref=e162] [cursor=pointer]:
                    - generic [ref=e163]: result
                  - generic [ref=e165]: float
          - generic:
            - button "Untitled shader / pixel" [ref=e166] [cursor=pointer]
            - button "Subgraph" [disabled]
          - generic [ref=e167]:
            - button "New subgraph" [ref=e168] [cursor=pointer]
            - button "Library subgraph" [ref=e169] [cursor=pointer]
            - button "Encapsulate" [ref=e170] [cursor=pointer]
            - button "Make independent" [ref=e171] [cursor=pointer]
            - button "Enter subgraph" [ref=e172] [cursor=pointer]
            - button "Arrange nodes" [ref=e173] [cursor=pointer]
            - button "Frame selection" [ref=e174] [cursor=pointer]
            - group [ref=e175]:
              - generic "Subgraph interface" [ref=e176] [cursor=pointer]
              - option "Expand" [selected]
              - option "Function"
              - option "input" [selected]
              - option "output"
            - group [ref=e177]:
              - generic "Local clipboard" [ref=e178] [cursor=pointer]
            - group [ref=e179]:
              - generic "Structures" [ref=e180] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=e181]:
            - button "Vertex" [ref=e182] [cursor=pointer]
            - button "Pixel" [pressed] [ref=e183] [cursor=pointer]
          - generic [ref=e184]:
            - button "Add Node" [ref=e185] [cursor=pointer]
            - button "Browse nodes" [ref=e188] [cursor=pointer]
            - button "Up" [ref=e191] [cursor=pointer]
            - button "Shortcuts" [ref=e194] [cursor=pointer]
    - complementary [ref=e197]:
      - generic [ref=e198]:
        - heading "Inspector" [level=2] [ref=e199]
        - paragraph [ref=e200]: Multiply
        - button "Rename node" [ref=e201] [cursor=pointer]
        - generic [ref=e202]:
          - generic [ref=e204]:
            - generic [ref=e205]: A
            - textbox "A" [ref=e206]: "1"
            - alert [ref=e207]: Connected input — local value retained.
          - generic [ref=e209]:
            - generic [ref=e210]: B
            - textbox "B" [ref=e211]: "4"
            - alert
        - generic [ref=e213]:
          - text: From Inputs
          - button "Disconnect" [ref=e214] [cursor=pointer]
  - generic [ref=e216]:
    - heading "Shader output" [level=2] [ref=e217]
    - paragraph [ref=e218]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics"
  - contentinfo [ref=e219]:
    - generic [ref=e220]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e221]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  177 |     .getByRole("button", { name: "Enter subgraph", exact: true })
  178 |     .click();
  179 |   await page
  180 |     .locator(".node h3")
  181 |     .filter({ hasText: /^Float$/ })
  182 |     .click();
  183 |   await expect(field).toHaveValue("0.5");
  184 |   await page.screenshot({
  185 |     path: evidence + "/s03-inspector-lifetime.png",
  186 |     fullPage: true,
  187 |   });
  188 | });
  189 | test("S03 structure authoring draft cancel, reorder and stale confirmation", async ({
  190 |   page,
  191 | }) => {
  192 |   await page.getByText("Structures", { exact: true }).click();
  193 |   await page
  194 |     .getByRole("textbox", { name: "Structure name", exact: true })
  195 |     .fill("Pair");
  196 |   await page
  197 |     .getByRole("button", { name: "Add structure field", exact: true })
  198 |     .click();
  199 |   await page
  200 |     .getByRole("button", { name: "Apply structure", exact: true })
  201 |     .click();
  202 |   await page.getByText("Structures", { exact: true }).click();
  203 |   await page
  204 |     .getByRole("combobox", { name: "Structure definition" })
  205 |     .selectOption({ label: "Pair" });
  206 |   await page
  207 |     .getByRole("button", { name: "Add structure node", exact: true })
  208 |     .click();
  209 |   await expect(
  210 |     page.locator(".node h3").filter({ hasText: /^Structure$/ }),
  211 |   ).toBeVisible();
  212 |   await page
  213 |     .getByRole("button", { name: "Delete structure", exact: true })
  214 |     .click();
  215 |   await expect(page.locator(".canvas-notice")).toContainText("STALE_PROPOSAL");
  216 |   await page
  217 |     .getByRole("button", { name: "Cancel structure", exact: true })
  218 |     .click();
  219 |   await page.screenshot({
  220 |     path: evidence + "/s03-structure.png",
  221 |     fullPage: true,
  222 |   });
  223 | });
  224 | 
  225 | test("AT-S03-01 two Canvas occurrences share parameters and keep independent navigation", async ({
  226 |   page,
  227 | }) => {
  228 |   await flow(page);
  229 |   await page
  230 |     .locator(".node h3")
  231 |     .filter({ hasText: /^Multiply$/ })
  232 |     .click();
  233 |   await page.getByRole("button", { name: "Encapsulate", exact: true }).click();
  234 |   await page.getByText("Local clipboard", { exact: true }).click();
  235 |   await page
  236 |     .getByRole("button", { name: "Copy selection", exact: true })
  237 |     .click();
  238 |   await page
  239 |     .getByRole("button", { name: "Paste selection", exact: true })
  240 |     .click();
  241 |   await page
  242 |     .getByRole("button", { name: "Second Canvas", exact: true })
  243 |     .click();
  244 |   const first = page.locator(".canvas").nth(0),
  245 |     second = page.locator(".canvas").nth(1);
  246 |   await first.locator('.node[aria-label="Subgraph"] h3').click();
  247 |   await first
  248 |     .getByRole("button", { name: "Enter subgraph", exact: true })
  249 |     .click();
  250 |   await expect(second).toHaveAttribute("data-path", "");
  251 |   await second.locator('.node[aria-label="Subgraph 2"] h3').click();
  252 |   await second
  253 |     .getByRole("button", { name: "Enter subgraph", exact: true })
  254 |     .click();
  255 |   expect(await first.getAttribute("data-network")).toBe(
  256 |     await second.getAttribute("data-network"),
  257 |   );
  258 |   expect(await first.getAttribute("data-path")).not.toBe(
  259 |     await second.getAttribute("data-path"),
  260 |   );
  261 |   await first
  262 |     .locator(".node h3")
  263 |     .filter({ hasText: /^Multiply$/ })
  264 |     .click();
  265 |   let input = page.locator('[data-parameter="b"]');
  266 |   await input.fill("4");
  267 |   await input.press("Enter");
  268 |   await second
  269 |     .locator(".node h3")
  270 |     .filter({ hasText: /^Multiply$/ })
  271 |     .click();
  272 |   await expect(input).toHaveValue("4");
  273 |   const firstSelection = await first.getAttribute("data-selection");
  274 |   await second
  275 |     .locator(".node h3")
  276 |     .filter({ hasText: /^Inputs$/ })
> 277 |     .click();
      |      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  278 |   await expect(first).toHaveAttribute("data-selection", firstSelection!);
  279 |   await second.hover({ position: { x: 30, y: 350 } });
  280 |   await page.mouse.wheel(0, -100);
  281 |   await expect(second).not.toHaveAttribute("data-zoom", "1");
  282 |   await expect(first).toHaveAttribute("data-zoom", "1");
  283 |   await first.getByRole("button", { name: "Up", exact: true }).click();
  284 |   await expect(first).toHaveAttribute("data-path", "");
  285 |   await expect(second).toHaveAttribute("data-path", /.+/);
  286 |   await page.screenshot({
  287 |     path: evidence + "/s03-two-occurrences.png",
  288 |     fullPage: true,
  289 |   });
  290 | });
  291 | test("AT-S03-01/04 real library first edit, position-only layout, spare output and nested deletion", async ({
  292 |   page,
  293 | }) => {
  294 |   await page
  295 |     .getByRole("button", { name: "Library subgraph", exact: true })
  296 |     .click();
  297 |   await page
  298 |     .getByRole("button", { name: "Enter subgraph", exact: true })
  299 |     .click();
  300 |   const canvas = page.locator(".canvas"),
  301 |     id = await canvas.getAttribute("data-definition");
  302 |   await page
  303 |     .getByRole("button", { name: "Arrange nodes", exact: true })
  304 |     .click();
  305 |   await expect(canvas).toHaveAttribute("data-definition", id!);
  306 |   await expect(canvas).toHaveAttribute("data-definition-kind", "library");
  307 |   await page
  308 |     .locator(".node h3")
  309 |     .filter({ hasText: /^Float$/ })
  310 |     .click();
  311 |   const field = page.getByRole("textbox", { name: "Value", exact: true });
  312 |   await field.fill("0.6");
  313 |   await field.press("Enter");
  314 |   await expect(canvas).toHaveAttribute("data-definition-kind", "local");
  315 |   expect(await canvas.getAttribute("data-definition")).not.toBe(id);
  316 |   await expect(field).toHaveValue("0.6");
  317 |   const from = await page
  318 |       .getByRole("button", { name: "Float output value", exact: true })
  319 |       .boundingBox(),
  320 |     to = await page
  321 |       .getByRole("button", {
  322 |         name: "Create output port from selection",
  323 |         exact: true,
  324 |       })
  325 |       .boundingBox();
  326 |   await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2);
  327 |   await page.mouse.down();
  328 |   await page.mouse.move(to!.x + to!.width / 2, to!.y + to!.height / 2, {
  329 |     steps: 8,
  330 |   });
  331 |   await page.mouse.up();
  332 |   await expect(
  333 |     page.getByRole("button", {
  334 |       name: "Outputs input Float value",
  335 |       exact: true,
  336 |     }),
  337 |   ).toBeVisible();
  338 |   await page
  339 |     .locator(".node h3")
  340 |     .filter({ hasText: /^Float$/ })
  341 |     .click();
  342 |   await page
  343 |     .getByRole("button", { name: "Delete selected", exact: true })
  344 |     .click();
  345 |   await expect(
  346 |     page.locator(".node h3").filter({ hasText: /^Float$/ }),
  347 |   ).toHaveCount(0);
  348 |   await page.getByRole("button", { name: "Undo", exact: true }).click();
  349 |   await expect(
  350 |     page.locator(".node h3").filter({ hasText: /^Float$/ }),
  351 |   ).toBeVisible();
  352 |   await page.screenshot({
  353 |     path: evidence + "/s03-library.png",
  354 |     fullPage: true,
  355 |   });
  356 | });
  357 | for (const unit of ["x", "\u4e2d", "\ud83c\udf47"])
  358 |   test(
  359 |     "G-LU-DATA-004 browser local clipboard UTF-8 budget " + unit,
  360 |     async ({ page }) => {
  361 |       await flow(page);
  362 |       await page
  363 |         .locator(".node h3")
  364 |         .filter({ hasText: /^Float$/ })
  365 |         .click();
  366 |       await page.getByText("Local clipboard", { exact: true }).click();
  367 |       await page
  368 |         .getByRole("button", { name: "Copy selection", exact: true })
  369 |         .click();
  370 |       const input = page.getByRole("textbox", { name: "Local clipboard text" }),
  371 |         packet = JSON.parse(await input.inputValue());
  372 |       packet.network.nodes[0].extensions["test.notes"] = "";
  373 |       const base = Buffer.byteLength(JSON.stringify(packet)),
  374 |         width = Buffer.byteLength(unit),
  375 |         count = Math.floor((512000 - base) / width);
  376 |       packet.network.nodes[0].extensions["test.notes"] =
  377 |         unit.repeat(count) + "x".repeat((512000 - base) % width);
```