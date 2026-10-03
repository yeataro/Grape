# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s03.spec.ts >> S03 Structure Help is read-only and composite defaults and Escape retain saved values
- Location: tests\browser\s03.spec.ts:36:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Structure instance', exact: true })

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
        - group "Image output" [ref=e33]:
          - heading "Image output" [level=3] [ref=e34]
          - generic [ref=e35]:
            - button "Image output input color" [ref=e36] [cursor=pointer]:
              - generic [ref=e37]: ●
              - generic [ref=e38]: color
            - generic [ref=e39]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
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
          - group [ref=e51]:
            - generic "Structures" [active] [ref=e52]
            - combobox "Structure definition" [ref=e53]:
              - option "New structure"
              - option "Help type" [selected]
            - textbox "Structure name" [ref=e54]: Help type
            - textbox "Structure description" [ref=e55]: Helpful description
            - generic [ref=e57]:
              - textbox "Field name 1" [ref=e58]: value
              - combobox "Field type 1" [ref=e59]:
                - option "glsl.float" [selected]
                - option "glsl.vec2"
                - option "glsl.vec3"
                - option "glsl.vec4"
                - option "glsl.mat2"
                - option "glsl.mat2x3"
                - option "glsl.mat2x4"
                - option "glsl.mat3x2"
                - option "glsl.mat3"
                - option "glsl.mat3x4"
                - option "glsl.mat4x2"
                - option "glsl.mat4x3"
                - option "glsl.mat4"
                - option "struct@10903b01-c6cc-4a2a-841b-56bd88b254e6"
              - checkbox "Field array 1" [ref=e60]
              - button "Move field up 1" [disabled] [ref=e61]
              - button "Remove field 1" [ref=e62] [cursor=pointer]
            - button "Add structure field" [ref=e63] [cursor=pointer]
            - button "Apply structure" [ref=e64] [cursor=pointer]
            - button "Cancel structure" [ref=e65] [cursor=pointer]
            - button "Delete structure" [ref=e66] [cursor=pointer]
            - button "Add structure node" [ref=e67] [cursor=pointer]
            - combobox "Structure field" [ref=e68]:
              - option "value" [selected]
            - button "Add field node" [ref=e69] [cursor=pointer]
            - button "Structure Help" [ref=e70] [cursor=pointer]
    - complementary [ref=e71]:
      - generic [ref=e72]:
        - heading "Inspector" [level=2] [ref=e73]
        - paragraph [ref=e74]: Select a node to inspect its parameters.
  - generic [ref=e76]:
    - heading "Shader output" [level=2] [ref=e77]
    - paragraph [ref=e78]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e79]:
      - listitem [ref=e80]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e81] [cursor=pointer]
  - contentinfo [ref=e82]:
    - generic [ref=e83]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e84]: Scroll to zoom · Drag empty space to pan
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
  12 | test("AT-S03-01 two Canvas occurrences share parameters and keep independent navigation",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await page.getByText("Local clipboard",{exact:true}).click();await page.getByRole("button",{name:"Copy selection",exact:true}).click();await page.getByRole("button",{name:"Paste selection",exact:true}).click();await page.getByRole("button",{name:"Second Canvas",exact:true}).click();const first=page.locator(".canvas").nth(0),second=page.locator(".canvas").nth(1);await first.locator('.node[aria-label="Subgraph"] h3').click();await first.getByRole("button",{name:"Enter subgraph",exact:true}).click();await expect(second).toHaveAttribute("data-path","");await second.locator('.node[aria-label="Subgraph 2"] h3').click();await second.getByRole("button",{name:"Enter subgraph",exact:true}).click();expect(await first.getAttribute("data-network")).toBe(await second.getAttribute("data-network"));expect(await first.getAttribute("data-path")).not.toBe(await second.getAttribute("data-path"));await first.locator(".node h3").filter({hasText:/^Multiply$/}).click();let input=page.locator('[data-parameter="b"]');await input.fill("4");await input.press("Enter");await second.locator(".node h3").filter({hasText:/^Multiply$/}).click();await expect(input).toHaveValue("4");const firstSelection=await first.getAttribute("data-selection");await second.locator(".node h3").filter({hasText:/^Inputs$/}).click();await expect(first).toHaveAttribute("data-selection",firstSelection!);await second.hover({position:{x:30,y:350}});await page.mouse.wheel(0,-100);await expect(second).not.toHaveAttribute("data-zoom","1");await expect(first).toHaveAttribute("data-zoom","1");await first.getByRole("button",{name:"Up",exact:true}).click();await expect(first).toHaveAttribute("data-path","");await expect(second).toHaveAttribute("data-path",/.+/);await page.screenshot({path:evidence+"/s03-two-occurrences.png",fullPage:true});});
  13 | test("AT-S03-01/04 real library first edit, position-only layout, spare output and nested deletion",async({page})=>{await page.getByRole("button",{name:"Library subgraph",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();const canvas=page.locator(".canvas"),id=await canvas.getAttribute("data-definition");await page.getByRole("button",{name:"Arrange nodes",exact:true}).click();await expect(canvas).toHaveAttribute("data-definition",id!);await expect(canvas).toHaveAttribute("data-definition-kind","library");await page.locator(".node h3").filter({hasText:/^Float$/}).click();const field=page.getByRole("textbox",{name:"Value",exact:true});await field.fill("0.6");await field.press("Enter");await expect(canvas).toHaveAttribute("data-definition-kind","local");expect(await canvas.getAttribute("data-definition")).not.toBe(id);await expect(field).toHaveValue("0.6");const from=await page.getByRole("button",{name:"Float output value",exact:true}).boundingBox(),to=await page.getByRole("button",{name:"Create output port from selection",exact:true}).boundingBox();await page.mouse.move(from!.x+from!.width/2,from!.y+from!.height/2);await page.mouse.down();await page.mouse.move(to!.x+to!.width/2,to!.y+to!.height/2,{steps:8});await page.mouse.up();await expect(page.getByRole("button",{name:"Outputs input Float value",exact:true})).toBeVisible();await page.locator(".node h3").filter({hasText:/^Float$/}).click();await page.getByRole("button",{name:"Delete selected",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^Float$/})).toHaveCount(0);await page.getByRole("button",{name:"Undo",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^Float$/})).toBeVisible();await page.screenshot({path:evidence+"/s03-library.png",fullPage:true});});
  14 | for(const unit of ["x","\u4e2d","\ud83c\udf47"])test("G-LU-DATA-004 browser local clipboard UTF-8 budget "+unit,async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Float$/}).click();await page.getByText("Local clipboard",{exact:true}).click();await page.getByRole("button",{name:"Copy selection",exact:true}).click();const input=page.getByRole("textbox",{name:"Local clipboard text"}),packet=JSON.parse(await input.inputValue());packet.network.nodes[0].extensions["test.notes"]="";const base=Buffer.byteLength(JSON.stringify(packet)),width=Buffer.byteLength(unit),count=Math.floor((512000-base)/width);packet.network.nodes[0].extensions["test.notes"]=unit.repeat(count)+"x".repeat((512000-base)%width);const exact=JSON.stringify(packet);expect(Buffer.byteLength(exact)).toBe(512000);await input.fill(exact);await page.getByRole("button",{name:"Paste selection",exact:true}).click();await expect(page.locator(".node")).toHaveCount(5);const before=await page.locator(".canvas").getAttribute("data-revision");packet.network.nodes[0].extensions["test.notes"]+="x";await input.fill(JSON.stringify(packet));await page.getByRole("button",{name:"Paste selection",exact:true}).click();await expect(page.locator(".canvas-notice")).toContainText("CLIPBOARD_SIZE");await expect(page.locator(".canvas")).toHaveAttribute("data-revision",before!);});
  15 | 
  16 | 
  17 | test("AT-S03-04 nested Inspector field removal cancels a focused draft and Undo mounts fresh controls",async({page})=>{await page.getByRole("button",{name:"New subgraph",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.getByText("Structures",{exact:true}).click();await page.getByRole("button",{name:"Add structure field",exact:true}).click();await page.getByRole("button",{name:"Apply structure",exact:true}).click();await page.getByText("Structures",{exact:true}).click();await page.getByRole("combobox",{name:"Structure definition"}).selectOption({label:"Structure"});await page.getByRole("button",{name:"Add structure node",exact:true}).click();await page.getByRole("button",{name:"Cancel structure",exact:true}).click();const original=page.locator('[data-parameter]').first();await original.fill("0.9");const key=await original.getAttribute("data-parameter");await page.getByText("Structures",{exact:true}).click();await page.getByRole("button",{name:"Remove field 1",exact:true}).click();await page.getByRole("button",{name:"Apply structure",exact:true}).click();await expect(page.locator('[data-parameter="'+key+'"]')).toHaveCount(0);await expect(page.locator('[data-parameter]')).toHaveCount(1);await page.getByRole("button",{name:"Undo",exact:true}).click();await page.locator(".node h3").filter({hasText:/^Structure$/}).click();await expect(page.locator('[data-parameter="'+key+'"]')).toHaveValue("0");await page.screenshot({path:evidence+"/s03-port-mutation.png",fullPage:true});});
  18 | test("AT-S03-03 visible frames move with encapsulation and Undo",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Frame selection",exact:true}).click();await expect(page.locator(".canvas-frame")).toHaveCount(1);await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await expect(page.locator(".canvas-frame")).toHaveCount(0);await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await expect(page.locator(".canvas-frame")).toHaveCount(1);await page.screenshot({path:evidence+"/s03-frame.png",fullPage:true});await page.getByRole("button",{name:"Undo",exact:true}).click();await expect(page.locator(".canvas")).toHaveAttribute("data-path","");await expect(page.locator(".canvas-frame")).toHaveCount(1);});
  19 | 
  20 | async function exportedGraph(page:any){const event=page.waitForEvent("download");await page.getByRole("button",{name:"Export JSON",exact:true}).click();return JSON.parse(await fs.readFile((await (await event).path())!,"utf8"));}
  21 | 
  22 | test("S03 Make independent and nested interface removal preserve other callers and Undo",async({page})=>{
  23 |   await flow(page);await page.locator('.node h3').filter({hasText:/^Multiply$/}).click();await page.getByRole('button',{name:'Encapsulate',exact:true}).click();
  24 |   await page.getByText('Local clipboard',{exact:true}).click();await page.getByRole('button',{name:'Copy selection',exact:true}).click();await page.getByRole('button',{name:'Paste selection',exact:true}).click();
  25 |   const before=await exportedGraph(page);await page.getByRole('button',{name:'Make independent',exact:true}).click();
  26 |   const independent=await exportedGraph(page);expect(independent.graph.resources).toHaveLength(2);
  27 |   const callers=independent.graph.stages.find((s:any)=>s.key==='pixel').network.nodes.filter((n:any)=>n.type.typeId==='call');expect(new Set(callers.map((n:any)=>n.state.definition)).size).toBe(2);
  28 |   await page.getByRole('button',{name:'Undo',exact:true}).click();expect(await exportedGraph(page)).toEqual(before);
  29 |   await page.getByRole('button',{name:'Enter subgraph',exact:true}).click();await page.getByText('Subgraph interface',{exact:true}).click();await page.getByRole('button',{name:'Remove port 1',exact:true}).click();await page.getByRole('button',{name:'Apply interface',exact:true}).click();
  30 |   const removed=await exportedGraph(page);expect(removed.graph.losses.some((l:any)=>l.payload.kind==='edge')).toBe(true);
  31 |   const root=removed.graph.stages.find((s:any)=>s.key==='pixel').network;for(const n of root.nodes.filter((n:any)=>n.type.typeId==='call'))expect(n.ports.filter((p:any)=>p.direction==='input')).toHaveLength(0);
  32 |   await page.getByRole('button',{name:'Undo',exact:true}).click();expect(await exportedGraph(page)).toEqual(before);
  33 |   await page.screenshot({path:evidence+'/s03-independent-removal.png',fullPage:true});
  34 | });
  35 | 
  36 | test("S03 Structure Help is read-only and composite defaults and Escape retain saved values",async({page})=>{
  37 |   await page.getByText('Structures',{exact:true}).click();await page.getByRole('textbox',{name:'Structure name',exact:true}).fill('Help type');await page.getByRole('textbox',{name:'Structure description',exact:true}).fill('Helpful description');await page.getByRole('button',{name:'Apply structure',exact:true}).click();
> 38 |   await page.getByText('Structures',{exact:true}).click();await page.getByRole('combobox',{name:'Structure definition',exact:true}).selectOption({label:'Help type'});await page.getByRole('button',{name:'Structure instance',exact:true}).click();
     |                                                                                                                                                                                                                                             ^ Error: locator.click: Test timeout of 30000ms exceeded.
  39 |   const before=await exportedGraph(page);await page.getByRole('button',{name:'Structure Help',exact:true}).click();await expect(page.locator('.structure-help')).toContainText('Helpful description');await expect(page.locator('.structure-help')).toContainText('value: glsl.float');await expect(page.locator('.structure-help')).not.toContainText('Uses (0)');expect(await exportedGraph(page)).toEqual(before);
  40 |   await page.getByRole('button',{name:'Cancel structure',exact:true}).click();await page.getByRole('button',{name:'New subgraph',exact:true}).click();await page.getByRole('button',{name:'Enter subgraph',exact:true}).click();
  41 |   const saved=await exportedGraph(page);await page.getByText('Subgraph interface',{exact:true}).click();await page.getByRole('textbox',{name:'Subgraph name',exact:true}).fill('Cancelled');await page.getByRole('textbox',{name:'Subgraph name',exact:true}).press('Escape');expect(await exportedGraph(page)).toEqual(saved);
  42 |   await page.getByText('Subgraph interface',{exact:true}).click();const structure=saved.graph.resources.find((r:any)=>r.data.name==='Help type');await page.getByRole('combobox',{name:'Port type 1',exact:true}).selectOption('struct@'+structure.id);await expect(page.getByRole('textbox',{name:'Port default 1',exact:true})).toHaveAttribute('readonly','');await page.getByRole('button',{name:'Cancel interface',exact:true}).click();expect(await exportedGraph(page)).toEqual(saved);
  43 |   await page.screenshot({path:evidence+'/s03-help-composite.png',fullPage:true});
  44 | });
  45 | 
  46 | test("G-LU-DATA-001 browser bad edge, capacity, stage and source rejection rolls back the complete transaction",async({page})=>{
  47 |   await flow(page);await page.locator('.node h3').filter({hasText:/^Multiply$/}).click();await page.getByRole('button',{name:'Encapsulate',exact:true}).click();await page.getByText('Local clipboard',{exact:true}).click();await page.getByRole('button',{name:'Copy selection',exact:true}).click();
  48 |   const text=page.getByRole('textbox',{name:'Local clipboard text',exact:true}),packet=JSON.parse(await text.inputValue()),before=await exportedGraph(page);
  49 |   for(const kind of ['edge','capacity','stage','source']){
  50 |     const p=structuredClone(packet);p.graphId='cross-'+kind;const def=p.resources.find((r:any)=>r.data.network),network=def.data.network;
  51 |     if(kind==='edge')network.edges[0].from.nodeId='missing';
  52 |     if(kind==='capacity'){const node=network.nodes.find((n:any)=>n.type.typeId==='multiply');while(network.nodes.length<=256)network.nodes.push({...structuredClone(node),id:'extra-'+network.nodes.length});}
  53 |     if(kind==='stage'){network.nodes.find((n:any)=>n.type.typeId==='multiply').type.typeId='vertex-output';}
  54 |     if(kind==='source'){const r={id:'private-source',type:{...def.type,typeId:'source-definition'},data:{name:'Private',type:'glsl.float',value:1,clipboard:false},references:[],referencesComplete:true,extensions:{}};p.resources.push(r);p.network.nodes[0].references.push({slot:'private',kind:'resource',targetId:r.id});}
  55 |     await text.fill(JSON.stringify(p));await page.getByRole('button',{name:'Paste selection',exact:true}).click();await expect(page.locator('.canvas-notice')).not.toHaveText('');expect(await exportedGraph(page)).toEqual(before);
  56 |   }
  57 |   await page.screenshot({path:evidence+'/s03-transaction-negatives.png',fullPage:true});
  58 | });
  59 | test("S03 shared name and matrix defaults update both callers with one Undo",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await page.getByText("Local clipboard",{exact:true}).click();await page.getByRole("button",{name:"Copy selection",exact:true}).click();await page.getByRole("button",{name:"Paste selection",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.getByText("Subgraph interface",{exact:true}).click();await page.getByRole("textbox",{name:"Subgraph name",exact:true}).fill("Shared matrix");await page.getByRole("combobox",{name:"Port type 1",exact:true}).selectOption("glsl.mat2");await page.getByRole("textbox",{name:"Port default 1",exact:true}).fill("[[1,2],[3,4]]");await page.getByRole("button",{name:"Apply interface",exact:true}).click();await page.getByRole("button",{name:"Up",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^Shared matrix$/})).toHaveCount(2);const doc=await exportedGraph(page),calls=doc.graph.stages.find((s:any)=>s.key==="pixel").network.nodes.filter((n:any)=>n.type.typeId==="call");expect(calls.map((n:any)=>n.name).sort()).toEqual(["Subgraph","Subgraph 2"]);for(const call of calls)expect(Object.values(call.inputValues)).toContainEqual([[1,2],[3,4]]);await page.getByRole("button",{name:"Undo",exact:true}).click();await expect(page.locator(".node h3").filter({hasText:/^Subgraph$/})).toHaveCount(2);await page.screenshot({path:evidence+"/s03-shared-matrix.png",fullPage:true});});
  60 | test("S03 clickable breadcrumbs discard stale interface drafts and selected ports",async({page})=>{await page.getByRole("button",{name:"New subgraph",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.getByRole("button",{name:"New subgraph",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await expect(page.locator('.canvas-breadcrumb [data-depth]')).toHaveCount(3);await page.getByRole("button",{name:"Inputs output Value",exact:true}).click();await page.getByText("Subgraph interface",{exact:true}).click();await page.getByRole("textbox",{name:"Subgraph name",exact:true}).fill("Discarded draft");await page.locator('.canvas-breadcrumb [data-depth="0"]').click();await expect(page.locator(".canvas")).toHaveAttribute("data-path","");await expect(page.getByRole("button",{name:"Apply interface",exact:true})).not.toBeVisible();await page.getByRole("button",{name:"Image output input color",exact:true}).click();await expect(page.locator(".canvas-notice")).not.toContainText("EDGE_");await page.screenshot({path:evidence+"/s03-breadcrumb.png",fullPage:true});});
  61 | test("S03 direction-specific Add16 controls preserve draft and allow output creation",async({page})=>{await page.getByRole("button",{name:"New subgraph",exact:true}).click();await page.getByRole("button",{name:"Enter subgraph",exact:true}).click();await page.getByText("Subgraph interface",{exact:true}).click();for(let i=0;i<15;i++)await page.getByRole("button",{name:"Add interface port",exact:true}).click();await expect(page.getByRole("button",{name:"Add interface port",exact:true})).toBeDisabled();await page.getByRole("combobox",{name:"New port direction",exact:true}).selectOption("output");await expect(page.getByRole("button",{name:"Add interface port",exact:true})).toBeEnabled();await page.getByRole("button",{name:"Add interface port",exact:true}).click();await page.getByRole("button",{name:"Apply interface",exact:true}).click();await expect(page.locator('.canvas-notice')).toHaveText("");const doc=await exportedGraph(page),network=doc.graph.resources.find((r:any)=>r.data.network).data;expect(network.interface.filter((p:any)=>p.direction==="input")).toHaveLength(16);expect(network.interface.filter((p:any)=>p.direction==="output")).toHaveLength(2);});
  62 | test("S03 Structure description and fixed array controls keep field identity across cancel/reorder",async({page})=>{await page.getByText("Structures",{exact:true}).click();await page.getByRole("textbox",{name:"Structure name",exact:true}).fill("ArrayPair");await page.getByRole("textbox",{name:"Structure description",exact:true}).fill("Array description \u4e2d\ud83c\udf47");await page.getByRole("button",{name:"Add structure field",exact:true}).click();await page.getByRole("checkbox",{name:"Field array 2",exact:true}).check();await page.getByRole("spinbutton",{name:"Field array length 2",exact:true}).fill("3");await page.getByRole("button",{name:"Apply structure",exact:true}).click();const first=(await exportedGraph(page)).graph.resources.find((r:any)=>r.data.name==="ArrayPair").data;expect(first.description).toContain("Array description");expect(first.fields[1].type).toBe('array@["glsl.float",3]');await page.getByText("Structures",{exact:true}).click();await page.getByRole("combobox",{name:"Structure definition",exact:true}).selectOption({label:"ArrayPair"});await page.getByRole("button",{name:"Move field up 2",exact:true}).click();await page.getByRole("button",{name:"Cancel structure",exact:true}).click();expect((await exportedGraph(page)).graph.resources.find((r:any)=>r.data.name==="ArrayPair").data.fields).toEqual(first.fields);await page.getByText("Structures",{exact:true}).click();await page.getByRole("button",{name:"Move field up 2",exact:true}).click();await page.getByRole("button",{name:"Apply structure",exact:true}).click();expect((await exportedGraph(page)).graph.resources.find((r:any)=>r.data.name==="ArrayPair").data.fields.map((f:any)=>f.id)).toEqual(first.fields.map((f:any)=>f.id).reverse());await page.screenshot({path:evidence+"/s03-structure-arrays.png",fullPage:true});});
  63 | test("S03 browser cross-Graph paste imports independent closure and Undo removes it",async({page})=>{await flow(page);await page.locator(".node h3").filter({hasText:/^Multiply$/}).click();await page.getByRole("button",{name:"Encapsulate",exact:true}).click();await page.getByText("Local clipboard",{exact:true}).click();await page.getByRole("button",{name:"Copy selection",exact:true}).click();const packet=JSON.parse(await page.getByRole("textbox",{name:"Local clipboard text"}).inputValue());page.once("dialog",d=>d.accept());await page.getByRole("button",{name:"New document",exact:true}).click();await flow(page);await page.getByText("Local clipboard",{exact:true}).click();await page.getByRole("textbox",{name:"Local clipboard text"}).fill(JSON.stringify(packet));await page.getByRole("button",{name:"Paste selection",exact:true}).click();await expect(page.locator(".node")).toHaveCount(5);const imported=await exportedGraph(page);expect(imported.graph.id).not.toBe(packet.graphId);expect(imported.graph.resources).toHaveLength(packet.resources.length);expect(imported.graph.resources.every((r:any)=>!packet.resources.some((old:any)=>old.id===r.id))).toBe(true);await page.getByRole("button",{name:"Undo",exact:true}).click();await expect(page.locator(".node")).toHaveCount(4);expect((await exportedGraph(page)).graph.resources).toHaveLength(0);});
  64 | 
```