# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s03.spec.ts >> AT-S03-03 browser clipboard success, injected late rejection and Unicode text preserved
- Location: tests\browser\s03.spec.ts:6:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.canvas-notice')
Expected substring: "DEPENDENCY_MISSING"
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
  - group "Float":
    - heading "Float" [level=3]
    - button "Float output value": value ●
    - text: float
  - group "Compose":
    - heading "Compose" [level=3]
    - button "Compose input x": ● x
    - text: float
    - button "Compose input y": ● y
    - text: float
    - button "Compose input z": ● z
    - text: float
    - button "Compose input w": ● w
    - text: float
    - button "Compose output result": result ●
    - text: vec4
  - group "Subgraph":
    - heading "Subgraph" [level=3]
    - button "Subgraph input b820af86-8046-44c4-90bb-a6c65fd84d6b": ● b820af86-8046-44c4-90bb-a6c65fd84d6b
    - text: float
    - button "Subgraph output bec4d089-109d-4c61-bf6a-12a9ffea1a70": bec4d089-109d-4c61-bf6a-12a9ffea1a70 ●
    - text: float
  - group "Subgraph 2":
    - heading "Subgraph 2" [level=3]
    - button "Subgraph 2 input b820af86-8046-44c4-90bb-a6c65fd84d6b": ● b820af86-8046-44c4-90bb-a6c65fd84d6b
    - text: float
    - button "Subgraph 2 output bec4d089-109d-4c61-bf6a-12a9ffea1a70": bec4d089-109d-4c61-bf6a-12a9ffea1a70 ●
    - text: float
  - text: Untitled shader / pixel
  - button "New subgraph"
  - button "Library subgraph"
  - button "Encapsulate"
  - button "Make independent"
  - button "Enter subgraph"
  - button "Up"
  - group:
    - text: Local clipboard
    - textbox "Local clipboard text": "{\"format\":\"grape.clipboard\",\"version\":1,\"graphId\":\"1a73008a-1297-4dc1-8a62-025e0d34d39e\",\"loadId\":\"ee5ba0e2-1167-4587-b659-b4a7b95647f6\",\"modules\":[{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\"},{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:7b5885252173530dbae756a4ffabccc9a672e310f5c369126f08763e43a10a5f\"},{\"moduleId\":\"grape.graph-kinds\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:77da81b7a03c4a0d13dc526155fc03fe56b3abff48777dcb026194469af3f224\"}],\"network\":{\"id\":\"58503a05-3ad4-4f8a-94c3-fb09a5823daa\",\"nodes\":[{\"id\":\"8a64f441-5b0d-4368-bb3a-04074566b385\",\"name\":\"Subgraph\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:7b5885252173530dbae756a4ffabccc9a672e310f5c369126f08763e43a10a5f\",\"typeId\":\"call\"},\"state\":{\"definition\":\"0b3d620b-f71b-49d7-b16e-38af38789003\"},\"inputValues\":{\"b820af86-8046-44c4-90bb-a6c65fd84d6b\":1},\"ports\":[{\"key\":\"b820af86-8046-44c4-90bb-a6c65fd84d6b\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"bec4d089-109d-4c61-bf6a-12a9ffea1a70\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"references\":[{\"slot\":\"definition\",\"kind\":\"resource\",\"targetId\":\"0b3d620b-f71b-49d7-b16e-38af38789003\"},{\"slot\":\"bad\",\"kind\":\"resource\",\"targetId\":\"absent\"}],\"referencesComplete\":true,\"position\":[160,120],\"extensions\":{\"test.note\":\"共有🍇\"}}],\"edges\":[],\"extensions\":{}},\"resources\":[{\"id\":\"0b3d620b-f71b-49d7-b16e-38af38789003\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:7b5885252173530dbae756a4ffabccc9a672e310f5c369126f08763e43a10a5f\",\"typeId\":\"definition\"},\"data\":{\"name\":\"Subgraph\",\"local\":true,\"origin\":null,\"network\":{\"id\":\"546a0df3-df34-48b9-ae8c-960ed13a9777\",\"nodes\":[{\"id\":\"5780641b-ae4f-4691-ad06-bd1e414ed566\",\"name\":\"network-input\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:7b5885252173530dbae756a4ffabccc9a672e310f5c369126f08763e43a10a5f\",\"typeId\":\"network-input\"},\"state\":{\"definition\":\"0b3d620b-f71b-49d7-b16e-38af38789003\"},\"inputValues\":{},\"ports\":[{\"key\":\"b820af86-8046-44c4-90bb-a6c65fd84d6b\",\"direction\":\"output\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1}],\"references\":[{\"slot\":\"definition\",\"kind\":\"resource\",\"targetId\":\"0b3d620b-f71b-49d7-b16e-38af38789003\"}],\"referencesComplete\":true,\"position\":[0,0],\"extensions\":{}},{\"id\":\"6208e6de-67af-47a7-9a2a-9427ed7b8c92\",\"name\":\"network-output\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:7b5885252173530dbae756a4ffabccc9a672e310f5c369126f08763e43a10a5f\",\"typeId\":\"network-output\"},\"state\":{\"definition\":\"0b3d620b-f71b-49d7-b16e-38af38789003\"},\"inputValues\":{},\"ports\":[{\"key\":\"bec4d089-109d-4c61-bf6a-12a9ffea1a70\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"required\"}],\"references\":[{\"slot\":\"definition\",\"kind\":\"resource\",\"targetId\":\"0b3d620b-f71b-49d7-b16e-38af38789003\"}],\"referencesComplete\":true,\"position\":[600,0],\"extensions\":{}},{\"id\":\"6a5db0ca-f46f-484d-bbcc-92e48680b90d\",\"name\":\"Multiply\",\"type\":{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\",\"typeId\":\"multiply\"},\"state\":{},\"inputValues\":{\"a\":1,\"b\":2},\"ports\":[{\"key\":\"a\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"b\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":2},{\"key\":\"result\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"references\":[],\"referencesComplete\":true,\"position\":[245,85],\"extensions\":{}}],\"edges\":[{\"id\":\"672d361a-4d79-4b2c-9c34-8bbec300ff11\",\"from\":{\"nodeId\":\"5780641b-ae4f-4691-ad06-bd1e414ed566\",\"portKey\":\"b820af86-8046-44c4-90bb-a6c65fd84d6b\"},\"to\":{\"nodeId\":\"6a5db0ca-f46f-484d-bbcc-92e48680b90d\",\"portKey\":\"a\"},\"adaptation\":{\"schema\":\"grape.edge-adaptation\",\"version\":1,\"sourceType\":\"glsl.float\",\"targetType\":\"glsl.float\",\"operation\":\"identity\",\"extensions\":{}},\"extensions\":{}},{\"id\":\"89668874-482a-4870-a54e-aa2c0a6aca57\",\"from\":{\"nodeId\":\"6a5db0ca-f46f-484d-bbcc-92e48680b90d\",\"portKey\":\"result\"},\"to\":{\"nodeId\":\"6208e6de-67af-47a7-9a2a-9427ed7b8c92\",\"portKey\":\"bec4d089-109d-4c61-bf6a-12a9ffea1a70\"},\"adaptation\":{\"schema\":\"grape.edge-adaptation\",\"version\":1,\"sourceType\":\"glsl.float\",\"targetType\":\"glsl.float\",\"operation\":\"identity\",\"extensions\":{}},\"extensions\":{}}],\"extensions\":{}},\"interface\":[{\"key\":\"b820af86-8046-44c4-90bb-a6c65fd84d6b\",\"name\":\"Input 1\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"bec4d089-109d-4c61-bf6a-12a9ffea1a70\",\"name\":\"Output 1\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"dependencies\":[]},\"references\":[],\"referencesComplete\":true,\"extensions\":{}}]}"
    - button "Copy selection"
    - button "Paste selection"
  - group: Structures
  - complementary:
    - heading "Inspector" [level=2]
    - paragraph: Subgraph 2
    - button "Rename node"
    - text: b820af86-8046-44c4-90bb-a6c65fd84d6b
    - textbox "b820af86-8046-44c4-90bb-a6c65fd84d6b": "1"
    - alert
- heading "Shader output" [level=2]
- paragraph: Generate to inspect shader output.
- list "Diagnostics"
- contentinfo: Click an output port, then an input to connect. Shift-click replaces a connection. Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  1 | import {test,expect} from "@playwright/test";
  2 | const evidence=process.env.GRAPE_EVIDENCE_DIR!;
  3 | async function flow(page:any){for(const name of ["Float","Multiply","Compose"])await page.getByRole("button",{name:"Add "+name,exact:true}).click();for(const [a,b] of [["Float output value","Multiply input a"],["Multiply output result","Compose input x"],["Compose output result","Image output input color"]]){await page.getByRole("button",{name:a,exact:true}).click();await page.getByRole("button",{name:b,exact:true}).click();}}
  4 | test.beforeEach(async({page})=>{await page.goto("/");});
  5 | test("AT-S03-01/02 real nested Canvas, Inspector, interface reorder/remove and Undo",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^Subgraph$/})).toBeVisible();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await expect(page.locator(".canvas")).toHaveAttribute("data-path",/.+/);await expect(page.locator(".canvas-breadcrumb")).toContainText("Subgraph");await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();const field=page.locator('[data-parameter="b"]');await field.fill("7");await field.press("Enter");await expect(field).toHaveValue("7");await page.getByText("Subgraph interface",{exact:true}).click();await page.getByRole("textbox",{name:"Port name 1",exact:true}).fill("Renamed input");await page.getByRole("button",{name:"Move port up 2",exact:true}).click();await page.getByRole("button",{name:"Apply interface",exact:true}).click();await page.getByRole("button",{name:"Up",exact:true}).click();await page.getByRole("button",{name:"Generate GLSL",exact:true}).click();await expect(page.getByLabel("Generated GLSL")).toContainText("* 7.0");await page.getByRole("button",{name:"Undo",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.screenshot({path:evidence+"/s03-nested.png",fullPage:true});});
> 6 | test("AT-S03-03 browser clipboard success, injected late rejection and Unicode text preserved",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await page.getByText("Local clipboard",{exact:true}).click();await page.getByRole("button",{name:"Copy selection",exact:true}).click();const input=page.getByRole("textbox",{name:"Local clipboard text"});const packet=JSON.parse(await input.inputValue());packet.network.nodes[0].extensions["test.note"]="共有🍇";await input.fill(JSON.stringify(packet));await page.getByRole("button",{name:"Paste selection",exact:true}).click();await expect(page.locator(".node")).toHaveCount(5);await page.getByRole("button",{name:"Copy selection",exact:true}).click();expect(await input.inputValue()).toContain("共有🍇");const before=await page.locator(".canvas").getAttribute("data-revision");packet.network.nodes[0].references.push({slot:"bad",kind:"resource",targetId:"absent"});await input.fill(JSON.stringify(packet));await page.getByRole("button",{name:"Paste selection",exact:true}).click();await expect(page.locator(".canvas-notice")).toContainText("DEPENDENCY_MISSING");await expect(page.locator(".canvas")).toHaveAttribute("data-revision",before!);await expect(page.locator(".node")).toHaveCount(5);await page.screenshot({path:evidence+"/s03-clipboard-rollback.png",fullPage:true});});
    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ^ Error: expect(locator).toContainText(expected) failed
  7 | test("AT-S03-04 nested IME/cancel/focus and navigation cleanup use the real Inspector",async({page})=>{await page.getByRole("button",{name:"New subgraph",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.getByRole("button",{name:"Add Float",exact:true}).click();const field=page.getByRole("textbox",{name:"Value",exact:true});await field.fill("0.75");await field.dispatchEvent("compositionstart");await field.press("Enter");await expect(field).toHaveAttribute("data-composing","true");await field.dispatchEvent("compositionend");await field.press("Escape");await expect(field).toHaveValue("0.25");await field.fill("0.5");await field.press("Enter");await expect(field).toHaveValue("0.5");await field.fill("0.9");await page.getByRole("button",{name:"Up",exact:true}).click();await expect(page.getByRole("textbox",{name:"Value",exact:true})).toHaveCount(0);await page.locator(".node h3").filter({hasText:/^Subgraph$/}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.locator(".node h3").filter({hasText:/^Float$/}).click();await expect(field).toHaveValue("0.5");await page.screenshot({path:evidence+"/s03-inspector-lifetime.png",fullPage:true});});
  8 | test("S03 structure authoring draft cancel, reorder and stale confirmation",async({page})=>{await page.getByText("Structures",{exact:true}).click();await page.getByRole("textbox",{name:"Structure name",exact:true}).fill("Pair");await page.getByRole("button",{name:"Add structure field",exact:true}).click();await page.getByRole("button",{name:"Apply structure",exact:true}).click();await page.getByText("Structures",{exact:true}).click();await page.getByRole("combobox",{name:"Structure definition"}).selectOption({label:"Pair"});await page.getByRole("button",{name:"Add structure node",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^structure$/})).toBeVisible();await page.getByRole("button",{name:"Delete structure",exact:true}).click();await expect(page.locator(".canvas-notice")).toContainText("STALE_PROPOSAL");await page.getByRole("button",{name:"Cancel structure",exact:true}).click();await page.screenshot({path:evidence+"/s03-structure.png",fullPage:true});});
  9 | 
```