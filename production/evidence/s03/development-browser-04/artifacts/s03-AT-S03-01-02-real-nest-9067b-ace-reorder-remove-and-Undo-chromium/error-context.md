# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s03.spec.ts >> AT-S03-01/02 real nested Canvas, Inspector, interface reorder/remove and Undo
- Location: tests\browser\s03.spec.ts:5:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('textbox', { name: 'Port name 1', exact: true })

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
            - group "Inputs" [ref=e33]:
              - heading "Inputs" [level=3] [ref=e34]
              - button "Create input port from selection" [ref=e35] [cursor=pointer]
            - group "Outputs" [ref=e36]:
              - heading "Outputs" [level=3] [ref=e37]
              - button "Create output port from selection" [ref=e38] [cursor=pointer]
            - group "Multiply" [ref=e39]:
              - heading "Multiply" [level=3] [ref=e40]
              - generic [ref=e41]:
                - button "Multiply input a" [ref=e42] [cursor=pointer]:
                  - generic [ref=e43]: ●
                  - generic [ref=e44]: a
                - generic [ref=e45]: float
              - generic [ref=e46]:
                - button "Multiply input b" [ref=e47] [cursor=pointer]:
                  - generic [ref=e48]: ●
                  - generic [ref=e49]: b
                - generic [ref=e50]: float
              - generic [ref=e51]:
                - button "Multiply output result" [ref=e52] [cursor=pointer]:
                  - generic [ref=e53]: result
                  - generic [ref=e54]: ●
                - generic [ref=e55]: float
        - generic: Untitled shader / pixel / Subgraph / 969e45b4-5d57-4a2d-9b41-b430dd49c9ce
        - generic [ref=e56]:
          - button "New subgraph" [ref=e57] [cursor=pointer]
          - button "Library subgraph" [ref=e58] [cursor=pointer]
          - button "Encapsulate" [ref=e59] [cursor=pointer]
          - button "Make independent" [ref=e60] [cursor=pointer]
          - button "Enter subgraph" [ref=e61] [cursor=pointer]
          - button "Up" [ref=e62] [cursor=pointer]
          - button "Arrange nodes" [ref=e63] [cursor=pointer]
          - button "Frame selection" [ref=e64] [cursor=pointer]
          - group [ref=e65]:
            - generic "Subgraph interface" [active] [ref=e66]
            - button "Add interface port" [ref=e67] [cursor=pointer]
            - button "Apply interface" [ref=e68] [cursor=pointer]
            - button "Cancel interface" [ref=e69] [cursor=pointer]
          - group [ref=e70]:
            - generic "Local clipboard" [ref=e71]
          - group [ref=e72]:
            - generic "Structures" [ref=e73]
            - option "New structure" [selected]
    - complementary [ref=e74]:
      - generic [ref=e75]:
        - heading "Inspector" [level=2] [ref=e76]
        - paragraph [ref=e77]: Multiply
        - button "Rename node" [ref=e78] [cursor=pointer]
        - generic [ref=e79]:
          - generic [ref=e81]:
            - generic [ref=e82]: A
            - textbox "A" [ref=e83]: "1"
            - alert
          - generic [ref=e85]:
            - generic [ref=e86]: B
            - textbox "B" [ref=e87]: "7"
            - alert
  - generic [ref=e89]:
    - heading "Shader output" [level=2] [ref=e90]
    - paragraph [ref=e91]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e92]:
      - listitem [ref=e93]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e94] [cursor=pointer]
  - contentinfo [ref=e95]:
    - generic [ref=e96]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e97]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  1  | import {test,expect} from "@playwright/test";
  2  | const evidence=process.env.GRAPE_EVIDENCE_DIR!;
  3  | async function flow(page:any){for(const name of ["Float","Multiply","Compose"])await page.getByRole("button",{name:"Add "+name,exact:true}).click();for(const [a,b] of [["Float output value","Multiply input a"],["Multiply output result","Compose input x"],["Compose output result","Image output input color"]]){await page.getByRole("button",{name:a,exact:true}).click();await page.getByRole("button",{name:b,exact:true}).click();}}
  4  | test.beforeEach(async({page})=>{await page.goto("/");});
> 5  | test("AT-S03-01/02 real nested Canvas, Inspector, interface reorder/remove and Undo",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^Subgraph$/})).toBeVisible();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await expect(page.locator(".canvas")).toHaveAttribute("data-path",/.+/);await expect(page.locator(".canvas-breadcrumb")).toContainText("Subgraph");await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();const field=page.locator('[data-parameter="b"]');await field.fill("7");await field.press("Enter");await expect(field).toHaveValue("7");await page.getByText("Subgraph interface",{exact:true}).click();await page.getByRole("textbox",{name:"Port name 1",exact:true}).fill("Renamed input");await page.getByRole("button",{name:"Move port up 2",exact:true}).click();await page.getByRole("button",{name:"Apply interface",exact:true}).click();await page.getByRole("button",{name:"Up",exact:true}).click();await page.getByRole("button",{name:"Generate GLSL",exact:true}).click();await expect(page.getByLabel("Generated GLSL")).toContainText("* 7.0");await page.getByRole("button",{name:"Undo",exact:true}).click();await page.locator(".node h3").filter({hasText:/^Subgraph$/}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await expect(page.locator(".canvas")).toHaveAttribute("data-path",/.+/);await page.screenshot({path:evidence+"/s03-nested.png",fullPage:true});});
     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  6  | test("AT-S03-03 browser clipboard success, injected late rejection and Unicode text preserved",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await page.getByText("Local clipboard",{exact:true}).click();await page.getByRole("button",{name:"Copy selection",exact:true}).click();const input=page.getByRole("textbox",{name:"Local clipboard text"});const packet=JSON.parse(await input.inputValue());packet.network.nodes[0].extensions["test.note"]="\u540c\u540d\ud83c\udf47";await input.fill(JSON.stringify(packet));await page.getByRole("button",{name:"Paste selection",exact:true}).click();await expect(page.locator(".node")).toHaveCount(5);await page.getByRole("button",{name:"Copy selection",exact:true}).click();expect(await input.inputValue()).toContain("\u540c\u540d\ud83c\udf47");const before=await page.locator(".canvas").getAttribute("data-revision");packet.network.nodes[0].references.push({slot:"bad",kind:"resource",targetId:"absent"});await input.fill(JSON.stringify(packet));await page.getByRole("button",{name:"Paste selection",exact:true}).click();await expect(page.locator(".canvas-notice")).toContainText("DEPENDENCY_MISSING");await expect(page.locator(".canvas")).toHaveAttribute("data-revision",before!);await expect(page.locator(".node")).toHaveCount(5);await page.screenshot({path:evidence+"/s03-clipboard-rollback.png",fullPage:true});});
  7  | test("AT-S03-04 nested IME/cancel/focus and navigation cleanup use the real Inspector",async({page})=>{await page.getByRole("button",{name:"New subgraph",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.getByRole("button",{name:"Add Float",exact:true}).click();const field=page.getByRole("textbox",{name:"Value",exact:true});await field.fill("0.75");await field.dispatchEvent("compositionstart");await field.press("Enter");await expect(field).toHaveAttribute("data-composing","true");await field.dispatchEvent("compositionend");await field.press("Escape");await expect(field).toHaveValue("0.25");await field.fill("0.5");await field.press("Enter");await expect(field).toHaveValue("0.5");await field.fill("0.9");await page.getByRole("button",{name:"Up",exact:true}).click();await expect(page.getByRole("textbox",{name:"Value",exact:true})).toHaveCount(0);await page.locator(".node h3").filter({hasText:/^Subgraph$/}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.locator(".node h3").filter({hasText:/^Float$/}).click();await expect(field).toHaveValue("0.5");await page.screenshot({path:evidence+"/s03-inspector-lifetime.png",fullPage:true});});
  8  | test("S03 structure authoring draft cancel, reorder and stale confirmation",async({page})=>{await page.getByText("Structures",{exact:true}).click();await page.getByRole("textbox",{name:"Structure name",exact:true}).fill("Pair");await page.getByRole("button",{name:"Add structure field",exact:true}).click();await page.getByRole("button",{name:"Apply structure",exact:true}).click();await page.getByText("Structures",{exact:true}).click();await page.getByRole("combobox",{name:"Structure definition"}).selectOption({label:"Pair"});await page.getByRole("button",{name:"Add structure node",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^Structure$/})).toBeVisible();await page.getByRole("button",{name:"Delete structure",exact:true}).click();await expect(page.locator(".canvas-notice")).toContainText("STALE_PROPOSAL");await page.getByRole("button",{name:"Cancel structure",exact:true}).click();await page.screenshot({path:evidence+"/s03-structure.png",fullPage:true});});
  9  | 
  10 | test("AT-S03-01 two Canvas occurrences share parameters and keep independent navigation",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await page.getByText("Local clipboard",{exact:true}).click();await page.getByRole("button",{name:"Copy selection",exact:true}).click();await page.getByRole("button",{name:"Paste selection",exact:true}).click();await page.getByRole("button",{name:"Second Canvas",exact:true}).click();const first=page.locator(".canvas").nth(0),second=page.locator(".canvas").nth(1);await first.locator(".node h3").filter({hasText:/^Subgraph$/}).click();await first.getByRole("button",{name:"Enter subgraph",exact:true}).click();await expect(second).toHaveAttribute("data-path","");await second.locator(".node h3").filter({hasText:/^Subgraph 2$/}).click();await second.getByRole("button",{name:"Enter subgraph",exact:true}).click();expect(await first.getAttribute("data-network")).toBe(await second.getAttribute("data-network"));expect(await first.getAttribute("data-path")).not.toBe(await second.getAttribute("data-path"));await first.locator(".node h3").filter({hasText:/^Multiply$/}).click();let input=page.locator('[data-parameter="b"]');await input.fill("4");await input.press("Enter");await second.locator(".node h3").filter({hasText:/^Multiply$/}).click();await expect(input).toHaveValue("4");await first.getByRole("button",{name:"Up",exact:true}).click();await expect(first).toHaveAttribute("data-path","");await expect(second).toHaveAttribute("data-path",/.+/);await page.screenshot({path:evidence+"/s03-two-occurrences.png",fullPage:true});});
  11 | test("AT-S03-01/04 real library first edit, position-only layout, spare output and nested deletion",async({page})=>{await page.getByRole("button",{name:"Library subgraph",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();const canvas=page.locator(".canvas"),id=await canvas.getAttribute("data-definition");await page.getByRole("button",{name:"Arrange nodes",exact:true}).click();await expect(canvas).toHaveAttribute("data-definition",id!);await expect(canvas).toHaveAttribute("data-definition-kind","library");await page.locator(".node h3").filter({hasText:/^Float$/}).click();const field=page.getByRole("textbox",{name:"Value",exact:true});await field.fill("0.6");await field.press("Enter");await expect(canvas).toHaveAttribute("data-definition-kind","local");expect(await canvas.getAttribute("data-definition")).not.toBe(id);await expect(field).toHaveValue("0.6");const from=await page.getByRole("button",{name:"Float output value",exact:true}).boundingBox(),to=await page.getByRole("button",{name:"Create output port from selection",exact:true}).boundingBox();await page.mouse.move(from!.x+from!.width/2,from!.y+from!.height/2);await page.mouse.down();await page.mouse.move(to!.x+to!.width/2,to!.y+to!.height/2,{steps:8});await page.mouse.up();await expect(page.getByRole("button",{name:"Outputs input Float value",exact:true})).toBeVisible();await page.locator(".node h3").filter({hasText:/^Float$/}).click();await page.getByRole("button",{name:"Delete selected",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^Float$/})).toHaveCount(0);await page.getByRole("button",{name:"Undo",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^Float$/})).toBeVisible();await page.screenshot({path:evidence+"/s03-library.png",fullPage:true});});
  12 | for(const unit of ["x","\u4e2d","\ud83c\udf47"])test("G-LU-DATA-004 browser local clipboard UTF-8 budget "+unit,async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Float$/}).click();await page.getByText("Local clipboard",{exact:true}).click();await page.getByRole("button",{name:"Copy selection",exact:true}).click();const input=page.getByRole("textbox",{name:"Local clipboard text"}),packet=JSON.parse(await input.inputValue());packet.network.nodes[0].extensions["test.notes"]="";const base=Buffer.byteLength(JSON.stringify(packet)),width=Buffer.byteLength(unit),count=Math.floor((512000-base)/width);packet.network.nodes[0].extensions["test.notes"]=unit.repeat(count)+"x".repeat((512000-base)%width);const exact=JSON.stringify(packet);expect(Buffer.byteLength(exact)).toBe(512000);await input.fill(exact);await page.getByRole("button",{name:"Paste selection",exact:true}).click();await expect(page.locator(".node")).toHaveCount(5);const before=await page.locator(".canvas").getAttribute("data-revision");packet.network.nodes[0].extensions["test.notes"]+="x";await input.fill(JSON.stringify(packet));await page.getByRole("button",{name:"Paste selection",exact:true}).click();await expect(page.locator(".canvas-notice")).toContainText("CLIPBOARD_SIZE");await expect(page.locator(".canvas")).toHaveAttribute("data-revision",before!);});
  13 | 
  14 | 
  15 | test("AT-S03-04 nested Inspector field removal cancels a focused draft and Undo mounts fresh controls",async({page})=>{await page.getByRole("button",{name:"New subgraph",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.getByText("Structures",{exact:true}).click();await page.getByRole("button",{name:"Add structure field",exact:true}).click();await page.getByRole("button",{name:"Apply structure",exact:true}).click();await page.getByText("Structures",{exact:true}).click();await page.getByRole("combobox",{name:"Structure definition"}).selectOption({label:"Structure"});await page.getByRole("button",{name:"Add structure node",exact:true}).click();await page.getByRole("button",{name:"Cancel structure",exact:true}).click();const original=page.locator('[data-parameter]').first();await original.fill("0.9");const key=await original.getAttribute("data-parameter");await page.getByText("Structures",{exact:true}).click();await page.getByRole("button",{name:"Remove field 1",exact:true}).click();await page.getByRole("button",{name:"Apply structure",exact:true}).click();await expect(page.locator('[data-parameter="'+key+'"]')).toHaveCount(0);await expect(page.locator('[data-parameter]')).toHaveCount(1);await page.getByRole("button",{name:"Undo",exact:true}).click();await page.locator(".node h3").filter({hasText:/^Structure$/}).click();await expect(page.locator('[data-parameter="'+key+'"]')).toHaveValue("0");await page.screenshot({path:evidence+"/s03-port-mutation.png",fullPage:true});});
  16 | test("AT-S03-03 visible frames move with encapsulation and Undo",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Frame selection",exact:true}).click();await expect(page.locator(".canvas-frame")).toHaveCount(1);await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await expect(page.locator(".canvas-frame")).toHaveCount(0);await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await expect(page.locator(".canvas-frame")).toHaveCount(1);await page.screenshot({path:evidence+"/s03-frame.png",fullPage:true});await page.getByRole("button",{name:"Undo",exact:true}).click();await expect(page.locator(".canvas")).toHaveAttribute("data-path","");await expect(page.locator(".canvas-frame")).toHaveCount(1);});
  17 | 
```