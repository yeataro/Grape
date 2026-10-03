# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s03.spec.ts >> S03 structure authoring draft cancel, reorder and stale confirmation
- Location: tests\browser\s03.spec.ts:8:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.canvas-notice')
Expected substring: "STALE_PROPOSAL"
Received string:    ""
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('.canvas-notice')
    14 × locator resolved to <div role="status" class="canvas-notice"></div>
       - unexpected value ""

```

```yaml
- banner:
  - text: ● Grape SHADER WORKSPACE
  - navigation "Document actions":
    - button "New document"
    - button "Save"
    - button "Open saved"
    - button "Export JSON"
    - button "Export PNG"
    - button "Open file"
    - button "Generate GLSL"
    - button "Second Canvas"
    - button "Lock editing"
  - text: Unsaved changes Host-free
- status
- button "Add Float"
- button "Add Multiply"
- button "Add Compose"
- button "Undo"
- button "Redo" [disabled]
- button "Delete selected"
- alert
- main:
  - text: Canvas 1
  - img
  - group "Image output":
    - heading "Image output" [level=3]
    - button "Image output input color": ● color
    - text: vec4
  - group "structure":
    - heading "structure" [level=3]
    - button "structure input field-c6955e61-b535-4c63-b03f-0ada43ca1a96": ● field-c6955e61-b535-4c63-b03f-0ada43ca1a96
    - text: float
    - button "structure input field-186317de-c58b-4b0d-9a64-9da190cdc36a": ● field-186317de-c58b-4b0d-9a64-9da190cdc36a
    - text: float
    - button "structure output value": value ●
    - text: struct@31bb90d6-a19d-4d2f-a980-ef4d737010ee
  - text: Untitled shader / pixel
  - button "New subgraph"
  - button "Library subgraph"
  - button "Encapsulate"
  - button "Make independent"
  - button "Enter subgraph"
  - button "Up"
  - group: Local clipboard
  - group:
    - text: Structures
    - combobox "Structure definition":
      - option "New structure"
      - option "Pair" [selected]
    - textbox "Structure name": Pair
    - textbox "Field name 1": value
    - textbox "Field type 1": glsl.float
    - button "Move field up 1"
    - button "Remove field 1"
    - textbox "Field name 2": field2
    - textbox "Field type 2": glsl.float
    - button "Move field up 2"
    - button "Remove field 2"
    - button "Add structure field"
    - button "Apply structure"
    - button "Cancel structure"
    - button "Delete structure"
    - button "Add structure node"
  - complementary:
    - heading "Inspector" [level=2]
    - paragraph: structure
    - button "Rename node"
    - text: field-c6955e61-b535-4c63-b03f-0ada43ca1a96
    - textbox "field-c6955e61-b535-4c63-b03f-0ada43ca1a96": "0"
    - alert
    - text: field-186317de-c58b-4b0d-9a64-9da190cdc36a
    - textbox "field-186317de-c58b-4b0d-9a64-9da190cdc36a": "0"
    - alert
- heading "Shader output" [level=2]
- paragraph: Generate to inspect shader output.
- list "Diagnostics":
  - listitem:
    - text: "INPUT_REQUIRED: Connect the required input."
    - button "Locate node"
- contentinfo: Click an output port, then an input to connect. Shift-click replaces a connection. Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  1 | import {test,expect} from "@playwright/test";
  2 | const evidence=process.env.GRAPE_EVIDENCE_DIR!;
  3 | async function flow(page:any){for(const name of ["Float","Multiply","Compose"])await page.getByRole("button",{name:"Add "+name,exact:true}).click();for(const [a,b] of [["Float output value","Multiply input a"],["Multiply output result","Compose input x"],["Compose output result","Image output input color"]]){await page.getByRole("button",{name:a,exact:true}).click();await page.getByRole("button",{name:b,exact:true}).click();}}
  4 | test.beforeEach(async({page})=>{await page.goto("/");});
  5 | test("AT-S03-01/02 real nested Canvas, Inspector, interface reorder/remove and Undo",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^Subgraph$/})).toBeVisible();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await expect(page.locator(".canvas")).toHaveAttribute("data-path",/.+/);await expect(page.locator(".canvas-breadcrumb")).toContainText("Subgraph");await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();const field=page.locator('[data-parameter="b"]');await field.fill("7");await field.press("Enter");await expect(field).toHaveValue("7");await page.getByText("Subgraph interface",{exact:true}).click();await page.getByRole("textbox",{name:"Port name 1",exact:true}).fill("Renamed input");await page.getByRole("button",{name:"Move port up 2",exact:true}).click();await page.getByRole("button",{name:"Apply interface",exact:true}).click();await page.getByRole("button",{name:"Up",exact:true}).click();await page.getByRole("button",{name:"Generate GLSL",exact:true}).click();await expect(page.getByLabel("Generated GLSL")).toContainText("* 7.0");await page.getByRole("button",{name:"Undo",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.screenshot({path:evidence+"/s03-nested.png",fullPage:true});});
  6 | test("AT-S03-03 browser clipboard success, injected late rejection and Unicode text preserved",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await page.getByText("Local clipboard",{exact:true}).click();await page.getByRole("button",{name:"Copy selection",exact:true}).click();const input=page.getByRole("textbox",{name:"Local clipboard text"});const packet=JSON.parse(await input.inputValue());packet.network.nodes[0].extensions["test.note"]="共有🍇";await input.fill(JSON.stringify(packet));await page.getByRole("button",{name:"Paste selection",exact:true}).click();await expect(page.locator(".node")).toHaveCount(5);await page.getByRole("button",{name:"Copy selection",exact:true}).click();expect(await input.inputValue()).toContain("共有🍇");const before=await page.locator(".canvas").getAttribute("data-revision");packet.network.nodes[0].references.push({slot:"bad",kind:"resource",targetId:"absent"});await input.fill(JSON.stringify(packet));await page.getByRole("button",{name:"Paste selection",exact:true}).click();await expect(page.locator(".canvas-notice")).toContainText("DEPENDENCY_MISSING");await expect(page.locator(".canvas")).toHaveAttribute("data-revision",before!);await expect(page.locator(".node")).toHaveCount(5);await page.screenshot({path:evidence+"/s03-clipboard-rollback.png",fullPage:true});});
  7 | test("AT-S03-04 nested IME/cancel/focus and navigation cleanup use the real Inspector",async({page})=>{await page.getByRole("button",{name:"New subgraph",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.getByRole("button",{name:"Add Float",exact:true}).click();const field=page.getByRole("textbox",{name:"Value",exact:true});await field.fill("0.75");await field.dispatchEvent("compositionstart");await field.press("Enter");await expect(field).toHaveAttribute("data-composing","true");await field.dispatchEvent("compositionend");await field.press("Escape");await expect(field).toHaveValue("0.25");await field.fill("0.5");await field.press("Enter");await expect(field).toHaveValue("0.5");await field.fill("0.9");await page.getByRole("button",{name:"Up",exact:true}).click();await expect(page.getByRole("textbox",{name:"Value",exact:true})).toHaveCount(0);await page.locator(".node h3").filter({hasText:/^Subgraph$/}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.locator(".node h3").filter({hasText:/^Float$/}).click();await expect(field).toHaveValue("0.5");await page.screenshot({path:evidence+"/s03-inspector-lifetime.png",fullPage:true});});
> 8 | test("S03 structure authoring draft cancel, reorder and stale confirmation",async({page})=>{await page.getByText("Structures",{exact:true}).click();await page.getByRole("textbox",{name:"Structure name",exact:true}).fill("Pair");await page.getByRole("button",{name:"Add structure field",exact:true}).click();await page.getByRole("button",{name:"Apply structure",exact:true}).click();await page.getByText("Structures",{exact:true}).click();await page.getByRole("combobox",{name:"Structure definition"}).selectOption({label:"Pair"});await page.getByRole("button",{name:"Add structure node",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^structure$/})).toBeVisible();await page.getByRole("button",{name:"Delete structure",exact:true}).click();await expect(page.locator(".canvas-notice")).toContainText("STALE_PROPOSAL");await page.getByRole("button",{name:"Cancel structure",exact:true}).click();await page.screenshot({path:evidence+"/s03-structure.png",fullPage:true});});
    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               ^ Error: expect(locator).toContainText(expected) failed
  9 | 
```