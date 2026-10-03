# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s03.spec.ts >> S03 browser cross-Graph paste imports independent closure and Undo removes it
- Location: tests\browser\s03.spec.ts:25:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#new')

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
                - button "Subgraph input Input 1" [ref=e80] [cursor=pointer]:
                  - generic [ref=e81]: ●
                  - generic [ref=e82]: Input 1
                - generic [ref=e83]: float
              - generic [ref=e84]:
                - button "Subgraph output Output 1" [ref=e85] [cursor=pointer]:
                  - generic [ref=e86]: Output 1
                  - generic [ref=e87]: ●
                - generic [ref=e88]: float
        - button "Untitled shader / pixel" [disabled] [ref=e90]
        - generic [ref=e91]:
          - button "New subgraph" [ref=e92] [cursor=pointer]
          - button "Library subgraph" [ref=e93] [cursor=pointer]
          - button "Encapsulate" [ref=e94] [cursor=pointer]
          - button "Make independent" [ref=e95] [cursor=pointer]
          - button "Enter subgraph" [ref=e96] [cursor=pointer]
          - button "Up" [ref=e97] [cursor=pointer]
          - button "Arrange nodes" [ref=e98] [cursor=pointer]
          - button "Frame selection" [ref=e99] [cursor=pointer]
          - group [ref=e100]:
            - generic "Local clipboard" [ref=e101]
            - textbox "Local clipboard text" [ref=e102]: "{\"format\":\"grape.clipboard\",\"version\":1,\"graphId\":\"f28add58-1a76-4672-83d8-1af46da7f241\",\"loadId\":\"5ecaa69a-fc07-4f0d-8d6d-55895fe650d6\",\"modules\":[{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\"},{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:2bcd59a5a5c3cfb070e03743ff670fdcc884e5d95cb46c5fed5ce3f05fec6552\"},{\"moduleId\":\"grape.graph-kinds\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:c45ab10fe98be6b907e3dc7a85428b618b6c04b966149e4424ad08e374e21cad\"}],\"network\":{\"id\":\"98693295-ade8-4ae0-ba77-5ba31eac98cb\",\"nodes\":[{\"id\":\"c407ab69-a637-493a-8383-a16c680d0d5e\",\"name\":\"Subgraph\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:2bcd59a5a5c3cfb070e03743ff670fdcc884e5d95cb46c5fed5ce3f05fec6552\",\"typeId\":\"call\"},\"state\":{\"definition\":\"6e02cc78-3712-46e2-a19b-033ae6cb6983\"},\"inputValues\":{\"1768b5b5-6d2a-470f-8077-494cbe62b247\":1},\"ports\":[{\"key\":\"1768b5b5-6d2a-470f-8077-494cbe62b247\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"bf232a07-b8a7-4f84-a704-39ffccf945b7\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"references\":[{\"slot\":\"definition\",\"kind\":\"resource\",\"targetId\":\"6e02cc78-3712-46e2-a19b-033ae6cb6983\"}],\"referencesComplete\":true,\"position\":[160,120],\"extensions\":{}}],\"edges\":[],\"extensions\":{}},\"resources\":[{\"id\":\"6e02cc78-3712-46e2-a19b-033ae6cb6983\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:2bcd59a5a5c3cfb070e03743ff670fdcc884e5d95cb46c5fed5ce3f05fec6552\",\"typeId\":\"definition\"},\"data\":{\"name\":\"Subgraph\",\"local\":true,\"origin\":null,\"network\":{\"id\":\"a607d60a-9adb-48d8-a8ff-14cd38238eda\",\"nodes\":[{\"id\":\"ca5f46e6-4764-441c-9f50-c13b0d558d1c\",\"name\":\"Inputs\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:2bcd59a5a5c3cfb070e03743ff670fdcc884e5d95cb46c5fed5ce3f05fec6552\",\"typeId\":\"network-input\"},\"state\":{\"definition\":\"6e02cc78-3712-46e2-a19b-033ae6cb6983\"},\"inputValues\":{},\"ports\":[{\"key\":\"1768b5b5-6d2a-470f-8077-494cbe62b247\",\"direction\":\"output\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1}],\"references\":[{\"slot\":\"definition\",\"kind\":\"resource\",\"targetId\":\"6e02cc78-3712-46e2-a19b-033ae6cb6983\"}],\"referencesComplete\":true,\"position\":[0,0],\"extensions\":{}},{\"id\":\"73951b8a-dd6e-49cf-bc41-9d73666d9f4c\",\"name\":\"Outputs\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:2bcd59a5a5c3cfb070e03743ff670fdcc884e5d95cb46c5fed5ce3f05fec6552\",\"typeId\":\"network-output\"},\"state\":{\"definition\":\"6e02cc78-3712-46e2-a19b-033ae6cb6983\"},\"inputValues\":{\"bf232a07-b8a7-4f84-a704-39ffccf945b7\":0},\"ports\":[{\"key\":\"bf232a07-b8a7-4f84-a704-39ffccf945b7\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":0}],\"references\":[{\"slot\":\"definition\",\"kind\":\"resource\",\"targetId\":\"6e02cc78-3712-46e2-a19b-033ae6cb6983\"}],\"referencesComplete\":true,\"position\":[600,0],\"extensions\":{}},{\"id\":\"cccf9f89-e411-4715-92a0-7ea95cde7a14\",\"name\":\"Multiply\",\"type\":{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\",\"typeId\":\"multiply\"},\"state\":{},\"inputValues\":{\"a\":1,\"b\":2},\"ports\":[{\"key\":\"a\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"b\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":2},{\"key\":\"result\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"references\":[],\"referencesComplete\":true,\"position\":[245,85],\"extensions\":{}}],\"edges\":[{\"id\":\"ffc830a2-7103-4e29-9a34-716ee28adf75\",\"from\":{\"nodeId\":\"ca5f46e6-4764-441c-9f50-c13b0d558d1c\",\"portKey\":\"1768b5b5-6d2a-470f-8077-494cbe62b247\"},\"to\":{\"nodeId\":\"cccf9f89-e411-4715-92a0-7ea95cde7a14\",\"portKey\":\"a\"},\"adaptation\":{\"schema\":\"grape.edge-adaptation\",\"version\":1,\"sourceType\":\"glsl.float\",\"targetType\":\"glsl.float\",\"operation\":\"identity\",\"extensions\":{}},\"extensions\":{}},{\"id\":\"49350610-1368-4e4d-9f29-eee1c009f6d0\",\"from\":{\"nodeId\":\"cccf9f89-e411-4715-92a0-7ea95cde7a14\",\"portKey\":\"result\"},\"to\":{\"nodeId\":\"73951b8a-dd6e-49cf-bc41-9d73666d9f4c\",\"portKey\":\"bf232a07-b8a7-4f84-a704-39ffccf945b7\"},\"adaptation\":{\"schema\":\"grape.edge-adaptation\",\"version\":1,\"sourceType\":\"glsl.float\",\"targetType\":\"glsl.float\",\"operation\":\"identity\",\"extensions\":{}},\"extensions\":{}}],\"extensions\":{}},\"interface\":[{\"key\":\"1768b5b5-6d2a-470f-8077-494cbe62b247\",\"name\":\"Input 1\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"bf232a07-b8a7-4f84-a704-39ffccf945b7\",\"name\":\"Output 1\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"dependencies\":[]},\"references\":[],\"referencesComplete\":true,\"extensions\":{}}]}"
            - button "Copy selection" [active] [ref=e103] [cursor=pointer]
            - button "Paste selection" [ref=e104] [cursor=pointer]
          - group [ref=e105]:
            - generic "Structures" [ref=e106]
            - option "New structure" [selected]
    - complementary [ref=e107]:
      - generic [ref=e108]:
        - heading "Inspector" [level=2] [ref=e109]
        - paragraph [ref=e110]: Subgraph
        - button "Rename node" [ref=e111] [cursor=pointer]
        - generic [ref=e114]:
          - generic [ref=e115]: Input 1
          - textbox "Input 1" [ref=e116]: "1"
          - alert [ref=e117]: Connected input — local value retained.
        - generic [ref=e119]:
          - text: From Float
          - button "Disconnect" [ref=e120] [cursor=pointer]
  - generic [ref=e122]:
    - heading "Shader output" [level=2] [ref=e123]
    - paragraph [ref=e124]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics"
  - contentinfo [ref=e125]:
    - generic [ref=e126]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e127]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  1  | import {test,expect} from "@playwright/test";
  2  | import fs from "node:fs/promises";
  3  | const evidence=process.env.GRAPE_EVIDENCE_DIR!;
  4  | async function flow(page:any){for(const name of ["Float","Multiply","Compose"])await page.getByRole("button",{name:"Add "+name,exact:true}).click();let edgeCount=0;for(const [a,b] of [["Float output value","Multiply input a"],["Multiply output result","Compose input x"],["Compose output result","Image output input color"]]){await page.getByRole("button",{name:a,exact:true}).click();await page.getByRole("button",{name:b,exact:true}).click();await expect(page.locator(".wires [data-edge]")).toHaveCount(++edgeCount);}}
  5  | test.beforeEach(async({page})=>{await page.goto("/");await page.evaluate(()=>{(window as any).__s03Events=[];for(const type of ["pointerdown","pointerup","click"])document.addEventListener(type,event=>{const target=event.target as HTMLElement;(window as any).__s03Events.push({type,tag:target.tagName,port:target.closest<HTMLElement>("[data-port]")?.dataset.port??null,connected:target.isConnected});},true);});});
  6  | test.afterEach(async({page},info)=>{if(!page.isClosed())await info.attach("dom-pointer-events",{body:JSON.stringify(await page.evaluate(()=>(window as any).__s03Events)),contentType:"application/json"});});
  7  | test("AT-S03-01/02 real nested Canvas, Inspector, interface reorder/remove and Undo",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^Subgraph$/})).toBeVisible();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await expect(page.locator(".canvas")).toHaveAttribute("data-path",/.+/);await expect(page.locator(".canvas-breadcrumb")).toContainText("Subgraph");await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();const field=page.locator('[data-parameter="b"]');await field.fill("7");await field.press("Enter");await expect(field).toHaveValue("7");await page.getByText("Subgraph interface",{exact:true}).click();await page.getByRole("textbox",{name:"Port name 1",exact:true}).fill("Renamed input");await page.getByRole("button",{name:"Move port up 2",exact:true}).click();await page.getByRole("button",{name:"Apply interface",exact:true}).click();await page.getByRole("button",{name:"Up",exact:true}).click();await page.getByRole("button",{name:"Generate GLSL",exact:true}).click();await expect(page.getByLabel("Generated GLSL")).toContainText("* 7.0");await page.getByRole("button",{name:"Undo",exact:true}).click();await page.locator(".node h3").filter({hasText:/^Subgraph$/}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await expect(page.locator(".canvas")).toHaveAttribute("data-path",/.+/);await page.screenshot({path:evidence+"/s03-nested.png",fullPage:true});});
  8  | test("AT-S03-03 browser clipboard success, injected late rejection and Unicode text preserved",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await page.getByText("Local clipboard",{exact:true}).click();await page.getByRole("button",{name:"Copy selection",exact:true}).click();const input=page.getByRole("textbox",{name:"Local clipboard text"});const packet=JSON.parse(await input.inputValue());packet.network.nodes[0].extensions["test.note"]="\u540c\u540d\ud83c\udf47";await input.fill(JSON.stringify(packet));await page.getByRole("button",{name:"Paste selection",exact:true}).click();await expect(page.locator(".node")).toHaveCount(5);await page.getByRole("button",{name:"Copy selection",exact:true}).click();expect(await input.inputValue()).toContain("\u540c\u540d\ud83c\udf47");const before=await page.locator(".canvas").getAttribute("data-revision");packet.network.nodes[0].references.push({slot:"bad",kind:"resource",targetId:"absent"});await input.fill(JSON.stringify(packet));await page.getByRole("button",{name:"Paste selection",exact:true}).click();await expect(page.locator(".canvas-notice")).toContainText("DEPENDENCY_MISSING");await expect(page.locator(".canvas")).toHaveAttribute("data-revision",before!);await expect(page.locator(".node")).toHaveCount(5);await page.screenshot({path:evidence+"/s03-clipboard-rollback.png",fullPage:true});});
  9  | test("AT-S03-04 nested IME/cancel/focus and navigation cleanup use the real Inspector",async({page})=>{await page.getByRole("button",{name:"New subgraph",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.getByRole("button",{name:"Add Float",exact:true}).click();const field=page.getByRole("textbox",{name:"Value",exact:true});await field.fill("0.75");await field.dispatchEvent("compositionstart");await field.press("Enter");await expect(field).toHaveAttribute("data-composing","true");await field.dispatchEvent("compositionend");await field.press("Escape");await expect(field).toHaveValue("0.25");await field.fill("0.5");await field.press("Enter");await expect(field).toHaveValue("0.5");await field.fill("0.9");await page.getByRole("button",{name:"Up",exact:true}).click();await expect(page.getByRole("textbox",{name:"Value",exact:true})).toHaveCount(0);await page.locator(".node h3").filter({hasText:/^Subgraph$/}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.locator(".node h3").filter({hasText:/^Float$/}).click();await expect(field).toHaveValue("0.5");await page.screenshot({path:evidence+"/s03-inspector-lifetime.png",fullPage:true});});
  10 | test("S03 structure authoring draft cancel, reorder and stale confirmation",async({page})=>{await page.getByText("Structures",{exact:true}).click();await page.getByRole("textbox",{name:"Structure name",exact:true}).fill("Pair");await page.getByRole("button",{name:"Add structure field",exact:true}).click();await page.getByRole("button",{name:"Apply structure",exact:true}).click();await page.getByText("Structures",{exact:true}).click();await page.getByRole("combobox",{name:"Structure definition"}).selectOption({label:"Pair"});await page.getByRole("button",{name:"Add structure node",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^Structure$/})).toBeVisible();await page.getByRole("button",{name:"Delete structure",exact:true}).click();await expect(page.locator(".canvas-notice")).toContainText("STALE_PROPOSAL");await page.getByRole("button",{name:"Cancel structure",exact:true}).click();await page.screenshot({path:evidence+"/s03-structure.png",fullPage:true});});
  11 | 
  12 | test("AT-S03-01 two Canvas occurrences share parameters and keep independent navigation",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await page.getByText("Local clipboard",{exact:true}).click();await page.getByRole("button",{name:"Copy selection",exact:true}).click();await page.getByRole("button",{name:"Paste selection",exact:true}).click();await page.getByRole("button",{name:"Second Canvas",exact:true}).click();const first=page.locator(".canvas").nth(0),second=page.locator(".canvas").nth(1);await first.locator('.node[aria-label="Subgraph"] h3').click();await first.getByRole("button",{name:"Enter subgraph",exact:true}).click();await expect(second).toHaveAttribute("data-path","");await second.locator('.node[aria-label="Subgraph 2"] h3').click();await second.getByRole("button",{name:"Enter subgraph",exact:true}).click();expect(await first.getAttribute("data-network")).toBe(await second.getAttribute("data-network"));expect(await first.getAttribute("data-path")).not.toBe(await second.getAttribute("data-path"));await first.locator(".node h3").filter({hasText:/^Multiply$/}).click();let input=page.locator('[data-parameter="b"]');await input.fill("4");await input.press("Enter");await second.locator(".node h3").filter({hasText:/^Multiply$/}).click();await expect(input).toHaveValue("4");await first.getByRole("button",{name:"Up",exact:true}).click();await expect(first).toHaveAttribute("data-path","");await expect(second).toHaveAttribute("data-path",/.+/);await page.screenshot({path:evidence+"/s03-two-occurrences.png",fullPage:true});});
  13 | test("AT-S03-01/04 real library first edit, position-only layout, spare output and nested deletion",async({page})=>{await page.getByRole("button",{name:"Library subgraph",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();const canvas=page.locator(".canvas"),id=await canvas.getAttribute("data-definition");await page.getByRole("button",{name:"Arrange nodes",exact:true}).click();await expect(canvas).toHaveAttribute("data-definition",id!);await expect(canvas).toHaveAttribute("data-definition-kind","library");await page.locator(".node h3").filter({hasText:/^Float$/}).click();const field=page.getByRole("textbox",{name:"Value",exact:true});await field.fill("0.6");await field.press("Enter");await expect(canvas).toHaveAttribute("data-definition-kind","local");expect(await canvas.getAttribute("data-definition")).not.toBe(id);await expect(field).toHaveValue("0.6");const from=await page.getByRole("button",{name:"Float output value",exact:true}).boundingBox(),to=await page.getByRole("button",{name:"Create output port from selection",exact:true}).boundingBox();await page.mouse.move(from!.x+from!.width/2,from!.y+from!.height/2);await page.mouse.down();await page.mouse.move(to!.x+to!.width/2,to!.y+to!.height/2,{steps:8});await page.mouse.up();await expect(page.getByRole("button",{name:"Outputs input Float value",exact:true})).toBeVisible();await page.locator(".node h3").filter({hasText:/^Float$/}).click();await page.getByRole("button",{name:"Delete selected",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^Float$/})).toHaveCount(0);await page.getByRole("button",{name:"Undo",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^Float$/})).toBeVisible();await page.screenshot({path:evidence+"/s03-library.png",fullPage:true});});
  14 | for(const unit of ["x","\u4e2d","\ud83c\udf47"])test("G-LU-DATA-004 browser local clipboard UTF-8 budget "+unit,async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Float$/}).click();await page.getByText("Local clipboard",{exact:true}).click();await page.getByRole("button",{name:"Copy selection",exact:true}).click();const input=page.getByRole("textbox",{name:"Local clipboard text"}),packet=JSON.parse(await input.inputValue());packet.network.nodes[0].extensions["test.notes"]="";const base=Buffer.byteLength(JSON.stringify(packet)),width=Buffer.byteLength(unit),count=Math.floor((512000-base)/width);packet.network.nodes[0].extensions["test.notes"]=unit.repeat(count)+"x".repeat((512000-base)%width);const exact=JSON.stringify(packet);expect(Buffer.byteLength(exact)).toBe(512000);await input.fill(exact);await page.getByRole("button",{name:"Paste selection",exact:true}).click();await expect(page.locator(".node")).toHaveCount(5);const before=await page.locator(".canvas").getAttribute("data-revision");packet.network.nodes[0].extensions["test.notes"]+="x";await input.fill(JSON.stringify(packet));await page.getByRole("button",{name:"Paste selection",exact:true}).click();await expect(page.locator(".canvas-notice")).toContainText("CLIPBOARD_SIZE");await expect(page.locator(".canvas")).toHaveAttribute("data-revision",before!);});
  15 | 
  16 | 
  17 | test("AT-S03-04 nested Inspector field removal cancels a focused draft and Undo mounts fresh controls",async({page})=>{await page.getByRole("button",{name:"New subgraph",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.getByText("Structures",{exact:true}).click();await page.getByRole("button",{name:"Add structure field",exact:true}).click();await page.getByRole("button",{name:"Apply structure",exact:true}).click();await page.getByText("Structures",{exact:true}).click();await page.getByRole("combobox",{name:"Structure definition"}).selectOption({label:"Structure"});await page.getByRole("button",{name:"Add structure node",exact:true}).click();await page.getByRole("button",{name:"Cancel structure",exact:true}).click();const original=page.locator('[data-parameter]').first();await original.fill("0.9");const key=await original.getAttribute("data-parameter");await page.getByText("Structures",{exact:true}).click();await page.getByRole("button",{name:"Remove field 1",exact:true}).click();await page.getByRole("button",{name:"Apply structure",exact:true}).click();await expect(page.locator('[data-parameter="'+key+'"]')).toHaveCount(0);await expect(page.locator('[data-parameter]')).toHaveCount(1);await page.getByRole("button",{name:"Undo",exact:true}).click();await page.locator(".node h3").filter({hasText:/^Structure$/}).click();await expect(page.locator('[data-parameter="'+key+'"]')).toHaveValue("0");await page.screenshot({path:evidence+"/s03-port-mutation.png",fullPage:true});});
  18 | test("AT-S03-03 visible frames move with encapsulation and Undo",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Frame selection",exact:true}).click();await expect(page.locator(".canvas-frame")).toHaveCount(1);await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await expect(page.locator(".canvas-frame")).toHaveCount(0);await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await expect(page.locator(".canvas-frame")).toHaveCount(1);await page.screenshot({path:evidence+"/s03-frame.png",fullPage:true});await page.getByRole("button",{name:"Undo",exact:true}).click();await expect(page.locator(".canvas")).toHaveAttribute("data-path","");await expect(page.locator(".canvas-frame")).toHaveCount(1);});
  19 | 
  20 | async function exportedGraph(page:any){const event=page.waitForEvent("download");await page.getByRole("button",{name:"Export JSON",exact:true}).click();return JSON.parse(await fs.readFile((await (await event).path())!,"utf8"));}
  21 | test("S03 shared name and matrix defaults update both callers with one Undo",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await page.getByText("Local clipboard",{exact:true}).click();await page.getByRole("button",{name:"Copy selection",exact:true}).click();await page.getByRole("button",{name:"Paste selection",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.getByText("Subgraph interface",{exact:true}).click();await page.getByRole("textbox",{name:"Subgraph name",exact:true}).fill("Shared matrix");await page.getByRole("combobox",{name:"Port type 1",exact:true}).selectOption("glsl.mat2");await page.getByRole("textbox",{name:"Port default 1",exact:true}).fill("[[1,2],[3,4]]");await page.getByRole("button",{name:"Apply interface",exact:true}).click();await page.getByRole("button",{name:"Up",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^Shared matrix$/})).toHaveCount(2);const doc=await exportedGraph(page),calls=doc.graph.stages.find((s:any)=>s.key==="pixel").network.nodes.filter((n:any)=>n.type.typeId==="call");expect(calls.map((n:any)=>n.name).sort()).toEqual(["Subgraph","Subgraph 2"]);for(const call of calls)expect(Object.values(call.inputValues)).toContainEqual([[1,2],[3,4]]);await page.getByRole("button",{name:"Undo",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^Subgraph$/})).toHaveCount(2);await page.screenshot({path:evidence+"/s03-shared-matrix.png",fullPage:true});});
  22 | test("S03 clickable breadcrumbs discard stale interface drafts and selected ports",async({page})=>{await page.getByRole("button",{name:"New subgraph",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.getByRole("button",{name:"New subgraph",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await expect(page.locator('.canvas-breadcrumb [data-depth]')).toHaveCount(3);await page.getByRole("button",{name:"Inputs output Value",exact:true}).click();await page.getByText("Subgraph interface",{exact:true}).click();await page.getByRole("textbox",{name:"Subgraph name",exact:true}).fill("Discarded draft");await page.locator('.canvas-breadcrumb [data-depth="0"]').click();await expect(page.locator(".canvas")).toHaveAttribute("data-path","");await expect(page.getByRole("button",{name:"Apply interface",exact:true})).not.toBeVisible();await page.getByRole("button",{name:"Image output input color",exact:true}).click();await expect(page.locator(".canvas-notice")).not.toContainText("EDGE_");await page.screenshot({path:evidence+"/s03-breadcrumb.png",fullPage:true});});
  23 | test("S03 direction-specific Add16 controls preserve draft and allow output creation",async({page})=>{await page.getByRole("button",{name:"New subgraph",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.getByText("Subgraph interface",{exact:true}).click();for(let i=0;i<15;i++)await page.getByRole("button",{name:"Add interface port",exact:true}).click();await expect(page.getByRole("button",{name:"Add interface port",exact:true})).toBeDisabled();await page.getByRole("combobox",{name:"New port direction",exact:true}).selectOption("output");await expect(page.getByRole("button",{name:"Add interface port",exact:true})).toBeEnabled();await page.getByRole("button",{name:"Add interface port",exact:true}).click();await page.getByRole("button",{name:"Apply interface",exact:true}).click();await expect(page.locator('.canvas-notice')).toHaveText("");const doc=await exportedGraph(page),network=doc.graph.resources.find((r:any)=>r.data.network).data;expect(network.interface.filter((p:any)=>p.direction==="input")).toHaveLength(16);expect(network.interface.filter((p:any)=>p.direction==="output")).toHaveLength(2);});
  24 | test("S03 Structure description and fixed array controls keep field identity across cancel/reorder",async({page})=>{await page.getByText("Structures",{exact:true}).click();await page.getByRole("textbox",{name:"Structure name",exact:true}).fill("ArrayPair");await page.getByRole("textbox",{name:"Structure description",exact:true}).fill("Array description \u4e2d\ud83c\udf47");await page.getByRole("button",{name:"Add structure field",exact:true}).click();await page.getByRole("checkbox",{name:"Field array 2",exact:true}).check();await page.getByRole("spinbutton",{name:"Field array length 2",exact:true}).fill("3");await page.getByRole("button",{name:"Apply structure",exact:true}).click();const first=(await exportedGraph(page)).graph.resources.find((r:any)=>r.data.name==="ArrayPair").data;expect(first.description).toContain("Array description");expect(first.fields[1].type).toBe('array@["glsl.float",3]');await page.getByText("Structures",{exact:true}).click();await page.getByRole("combobox",{name:"Structure definition",exact:true}).selectOption({label:"ArrayPair"});await page.getByRole("button",{name:"Move field up 2",exact:true}).click();await page.getByRole("button",{name:"Cancel structure",exact:true}).click();expect((await exportedGraph(page)).graph.resources.find((r:any)=>r.data.name==="ArrayPair").data.fields).toEqual(first.fields);await page.getByText("Structures",{exact:true}).click();await page.getByRole("button",{name:"Move field up 2",exact:true}).click();await page.getByRole("button",{name:"Apply structure",exact:true}).click();expect((await exportedGraph(page)).graph.resources.find((r:any)=>r.data.name==="ArrayPair").data.fields.map((f:any)=>f.id)).toEqual(first.fields.map((f:any)=>f.id).reverse());await page.screenshot({path:evidence+"/s03-structure-arrays.png",fullPage:true});});
> 25 | test("S03 browser cross-Graph paste imports independent closure and Undo removes it",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await page.getByText("Local clipboard",{exact:true}).click();await page.getByRole("button",{name:"Copy selection",exact:true}).click();const packet=JSON.parse(await page.getByRole("textbox",{name:"Local clipboard text"}).inputValue());page.once("dialog",d=>d.accept());await page.locator("#new").click();await flow(page);await page.getByText("Local clipboard",{exact:true}).click();await page.getByRole("textbox",{name:"Local clipboard text"}).fill(JSON.stringify(packet));await page.getByRole("button",{name:"Paste selection",exact:true}).click();await expect(page.locator(".node")).toHaveCount(5);const imported=await exportedGraph(page);expect(imported.graph.id).not.toBe(packet.graphId);expect(imported.graph.resources).toHaveLength(packet.resources.length);expect(imported.graph.resources.every((r:any)=>!packet.resources.some((old:any)=>old.id===r.id))).toBe(true);await page.getByRole("button",{name:"Undo",exact:true}).click();await expect(page.locator(".node")).toHaveCount(4);expect((await exportedGraph(page)).graph.resources).toHaveLength(0);});
     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ^ Error: locator.click: Test timeout of 30000ms exceeded.
  26 | 
```