# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s03.spec.ts >> AT-S03-03 browser clipboard success, injected late rejection and Unicode text preserved
- Location: tests\browser\s03.spec.ts:6:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Copy selection', exact: true })

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
    - button "Undo" [ref=e26] [cursor=pointer]
    - button "Redo" [disabled] [ref=e27]
    - button "Delete selected" [ref=e28] [cursor=pointer]
    - alert
  - main [ref=e29]:
    - generic [ref=e31]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e32]:
        - generic:
          - generic:
            - group "Image output" [ref=e36]:
              - heading "Image output" [level=3] [ref=e37]
              - generic [ref=e38]:
                - button "Image output input color" [ref=e39] [cursor=pointer]:
                  - generic [ref=e40]: ●
                  - generic [ref=e41]: color
                - generic [ref=e42]: vec4
            - group "Float" [ref=e43]:
              - heading "Float" [level=3] [ref=e44]
              - generic [ref=e45]:
                - button "Float output value" [ref=e46] [cursor=pointer]:
                  - generic [ref=e47]: value
                  - generic [ref=e48]: ●
                - generic [ref=e49]: float
            - group "Compose" [ref=e50]:
              - heading "Compose" [level=3] [ref=e51]
              - generic [ref=e52]:
                - button "Compose input x" [ref=e53] [cursor=pointer]:
                  - generic [ref=e54]: ●
                  - generic [ref=e55]: x
                - generic [ref=e56]: float
              - generic [ref=e57]:
                - button "Compose input y" [ref=e58] [cursor=pointer]:
                  - generic [ref=e59]: ●
                  - generic [ref=e60]: "y"
                - generic [ref=e61]: float
              - generic [ref=e62]:
                - button "Compose input z" [ref=e63] [cursor=pointer]:
                  - generic [ref=e64]: ●
                  - generic [ref=e65]: z
                - generic [ref=e66]: float
              - generic [ref=e67]:
                - button "Compose input w" [ref=e68] [cursor=pointer]:
                  - generic [ref=e69]: ●
                  - generic [ref=e70]: w
                - generic [ref=e71]: float
              - generic [ref=e72]:
                - button "Compose output result" [ref=e73] [cursor=pointer]:
                  - generic [ref=e74]: result
                  - generic [ref=e75]: ●
                - generic [ref=e76]: vec4
            - group "Subgraph" [ref=e77]:
              - heading "Subgraph" [level=3] [ref=e78]
              - generic [ref=e79]:
                - button "Subgraph input 1aa54a8c-14c3-4a36-9e92-db806db050ba" [ref=e80] [cursor=pointer]:
                  - generic [ref=e81]: ●
                  - generic [ref=e82]: 1aa54a8c-14c3-4a36-9e92-db806db050ba
                - generic [ref=e83]: float
              - generic [ref=e84]:
                - button "Subgraph output a658b223-836c-42b6-8a65-b3a290d019f7" [ref=e85] [cursor=pointer]:
                  - generic [ref=e86]: a658b223-836c-42b6-8a65-b3a290d019f7
                  - generic [ref=e87]: ●
                - generic [ref=e88]: float
        - generic: Untitled shader / pixel
        - generic [ref=e89]:
          - button "New subgraph" [ref=e90] [cursor=pointer]
          - button "Library subgraph" [ref=e91] [cursor=pointer]
          - button "Encapsulate" [ref=e92] [cursor=pointer]
          - button "Make independent" [ref=e93] [cursor=pointer]
          - button "Enter subgraph" [ref=e94] [cursor=pointer]
          - button "Up" [ref=e95] [cursor=pointer]
          - group [ref=e96]:
            - generic "Local clipboard" [active] [ref=e97]
          - group [ref=e98]:
            - generic "Structures" [ref=e99]
            - option "New structure" [selected]
    - complementary [ref=e100]:
      - generic [ref=e101]:
        - heading "Inspector" [level=2] [ref=e102]
        - paragraph [ref=e103]: Select a node to inspect its parameters.
  - generic [ref=e105]:
    - heading "Shader output" [level=2] [ref=e106]
    - paragraph [ref=e107]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics"
  - contentinfo [ref=e108]:
    - generic [ref=e109]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e110]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  1 | import {test,expect} from "@playwright/test";
  2 | const evidence=process.env.GRAPE_EVIDENCE_DIR!;
  3 | async function flow(page:any){for(const name of ["Float","Multiply","Compose"])await page.getByRole("button",{name:"Add "+name,exact:true}).click();for(const [a,b] of [["Float output value","Multiply input a"],["Multiply output result","Compose input x"],["Compose output result","Image output input color"]]){await page.getByRole("button",{name:a,exact:true}).click();await page.getByRole("button",{name:b,exact:true}).click();}}
  4 | test.beforeEach(async({page})=>{await page.goto("/");});
  5 | test("AT-S03-01/02 real nested Canvas, Inspector, interface reorder/remove and Undo",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^Subgraph$/})).toBeVisible();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await expect(page.locator(".canvas")).toHaveAttribute("data-path",/.+/);await expect(page.locator(".canvas-breadcrumb")).toContainText("Subgraph");await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();const field=page.locator('[data-parameter="b"]');await field.fill("7");await field.press("Enter");await expect(field).toHaveValue("7");await page.getByText("Subgraph interface",{exact:true}).click();await page.getByRole("textbox",{name:"Port name 1",exact:true}).fill("Renamed input");await page.getByRole("button",{name:"Move port up 2",exact:true}).click();await page.getByRole("button",{name:"Apply interface",exact:true}).click();await page.getByRole("button",{name:"Up",exact:true}).click();await page.getByRole("button",{name:"Generate GLSL",exact:true}).click();await expect(page.getByLabel("Generated GLSL")).toContainText("* 7.0");await page.getByRole("button",{name:"Undo",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.screenshot({path:evidence+"/s03-nested.png",fullPage:true});});
> 6 | test("AT-S03-03 browser clipboard success, injected late rejection and Unicode text preserved",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await page.getByText("Local clipboard",{exact:true}).click();await page.getByRole("button",{name:"Copy selection",exact:true}).click();const input=page.getByRole("textbox",{name:"Local clipboard text"});const packet=JSON.parse(await input.inputValue());packet.network.nodes[0].extensions["test.note"]="共有🍇";await input.fill(JSON.stringify(packet));await page.getByRole("button",{name:"Paste selection",exact:true}).click();await expect(page.locator(".node")).toHaveCount(5);await page.getByRole("button",{name:"Copy selection",exact:true}).click();expect(await input.inputValue()).toContain("共有🍇");const before=await page.locator(".canvas").getAttribute("data-revision");packet.network.nodes[0].references.push({slot:"bad",kind:"resource",targetId:"absent"});await input.fill(JSON.stringify(packet));await page.getByRole("button",{name:"Paste selection",exact:true}).click();await expect(page.locator(".canvas-notice")).toContainText("DEPENDENCY_MISSING");await expect(page.locator(".canvas")).toHaveAttribute("data-revision",before!);await expect(page.locator(".node")).toHaveCount(5);await page.screenshot({path:evidence+"/s03-clipboard-rollback.png",fullPage:true});});
    |                                                                                                                                                                                                                                                                                                                                                                                                             ^ Error: locator.click: Test timeout of 30000ms exceeded.
  7 | test("AT-S03-04 nested IME/cancel/focus and navigation cleanup use the real Inspector",async({page})=>{await page.getByRole("button",{name:"New subgraph",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.getByRole("button",{name:"Add Float",exact:true}).click();const field=page.getByRole("textbox",{name:"Value",exact:true});await field.fill("0.75");await field.dispatchEvent("compositionstart");await field.press("Enter");await expect(field).toHaveAttribute("data-composing","true");await field.dispatchEvent("compositionend");await field.press("Escape");await expect(field).toHaveValue("0.25");await field.fill("0.5");await field.press("Enter");await expect(field).toHaveValue("0.5");await field.fill("0.9");await page.getByRole("button",{name:"Up",exact:true}).click();await expect(page.getByRole("textbox",{name:"Value",exact:true})).toHaveCount(0);await page.locator(".node h3").filter({hasText:/^Subgraph$/}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.locator(".node h3").filter({hasText:/^Float$/}).click();await expect(field).toHaveValue("0.5");await page.screenshot({path:evidence+"/s03-inspector-lifetime.png",fullPage:true});});
  8 | test("S03 structure authoring draft cancel, reorder and stale confirmation",async({page})=>{await page.getByText("Structures",{exact:true}).click();await page.getByRole("textbox",{name:"Structure name",exact:true}).fill("Pair");await page.getByRole("button",{name:"Add structure field",exact:true}).click();await page.getByRole("button",{name:"Apply structure",exact:true}).click();await page.getByText("Structures",{exact:true}).click();await page.getByRole("combobox",{name:"Structure definition"}).selectOption({label:"Pair"});await page.getByRole("button",{name:"Add structure node",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^structure$/})).toBeVisible();await page.getByRole("button",{name:"Delete structure",exact:true}).click();await expect(page.locator(".canvas-notice")).toContainText("STALE_PROPOSAL");await page.getByRole("button",{name:"Cancel structure",exact:true}).click();await page.screenshot({path:evidence+"/s03-structure.png",fullPage:true});});
  9 | 
```