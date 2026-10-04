# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05.spec.ts >> S05 AT04 AT05 real mode command reports precise loss and Undo restores entire graph; rejected activation leaves UI and history unchanged
- Location: tests\browser\s05.spec.ts:6:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.canvas').first().getByRole('heading', { name: 'Shared arithmetic', exact: true }).first()
    - locator resolved to <h3>Shared arithmetic</h3>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <h3>Shared arithmetic</h3> from <article class="node" tabindex="0" role="group" data-node="id-35" aria-description="" aria-label="Subgraph">…</article> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <h3>Shared arithmetic</h3> from <article class="node" tabindex="0" role="group" data-node="id-35" aria-description="" aria-label="Subgraph">…</article> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    57 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <h3>Shared arithmetic</h3> from <article class="node" tabindex="0" role="group" data-node="id-35" aria-description="" aria-label="Subgraph">…</article> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling

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
      - button "Upgrade subgraph owners" [ref=e9] [cursor=pointer]
      - button "Save" [ref=e10] [cursor=pointer]
      - button "Open saved" [ref=e11] [cursor=pointer]
      - button "Export JSON" [ref=e12] [cursor=pointer]
      - button "Export PNG" [ref=e13] [cursor=pointer]
      - button "Open file" [ref=e14] [cursor=pointer]
      - button "Generate GLSL" [ref=e15] [cursor=pointer]
      - button "Second Canvas" [ref=e16] [cursor=pointer]
      - button "Lock editing" [ref=e17] [cursor=pointer]
      - button "Personal Library" [ref=e18] [cursor=pointer]
    - generic [ref=e19]:
      - generic [ref=e20]: Unsaved changes
      - generic [ref=e21]: Host-free
  - status [ref=e22]
  - generic [ref=e24]:
    - button "Add Float" [ref=e25] [cursor=pointer]
    - button "Add Multiply" [ref=e26] [cursor=pointer]
    - button "Add Compose" [ref=e27] [cursor=pointer]
    - button "Add Array repeat" [ref=e28] [cursor=pointer]
    - button "Add Vertex position" [ref=e29] [cursor=pointer]
    - button "Add Constant input" [ref=e30] [cursor=pointer]
    - button "Add Add" [ref=e31] [cursor=pointer]
    - button "Add Array length" [ref=e32] [cursor=pointer]
    - button "Add Pixel depth and pair" [ref=e33] [cursor=pointer]
    - button "Undo" [disabled] [ref=e34]
    - button "Redo" [disabled] [ref=e35]
    - button "Delete selected" [ref=e36] [cursor=pointer]
    - alert
  - main [ref=e37]:
    - generic [ref=e39]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e40]:
        - generic:
          - generic:
            - group "Image output" [ref=e46]:
              - heading "Image output" [level=3] [ref=e47]
              - generic [ref=e48]:
                - button "Image output input color" [ref=e49] [cursor=pointer]:
                  - generic [ref=e50]: ●
                  - generic [ref=e51]: color
                - generic [ref=e52]: vec4
            - group "Shared arithmetic" [ref=e53]:
              - heading "Shared arithmetic" [level=3] [ref=e54]
              - generic [ref=e55]:
                - button "Shared arithmetic input X" [ref=e56] [cursor=pointer]:
                  - generic [ref=e57]: ●
                  - generic [ref=e58]: X
                - generic [ref=e59]: float
              - generic [ref=e60]:
                - button "Shared arithmetic output Y" [ref=e61] [cursor=pointer]:
                  - generic [ref=e62]: "Y"
                  - generic [ref=e63]: ●
                - generic [ref=e64]: float
              - generic [ref=e65]:
                - button "Shared arithmetic output Twice" [ref=e66] [cursor=pointer]:
                  - generic [ref=e67]: Twice
                  - generic [ref=e68]: ●
                - generic [ref=e69]: float
            - group "Compose" [ref=e70]:
              - heading "Compose" [level=3] [ref=e71]
              - generic [ref=e72]:
                - button "Compose input x" [ref=e73] [cursor=pointer]:
                  - generic [ref=e74]: ●
                  - generic [ref=e75]: x
                - generic [ref=e76]: float
              - generic [ref=e77]:
                - button "Compose input y" [ref=e78] [cursor=pointer]:
                  - generic [ref=e79]: ●
                  - generic [ref=e80]: "y"
                - generic [ref=e81]: float
              - generic [ref=e82]:
                - button "Compose input z" [ref=e83] [cursor=pointer]:
                  - generic [ref=e84]: ●
                  - generic [ref=e85]: z
                - generic [ref=e86]: float
              - generic [ref=e87]:
                - button "Compose input w" [ref=e88] [cursor=pointer]:
                  - generic [ref=e89]: ●
                  - generic [ref=e90]: w
                - generic [ref=e91]: float
              - generic [ref=e92]:
                - button "Compose output result" [ref=e93] [cursor=pointer]:
                  - generic [ref=e94]: result
                  - generic [ref=e95]: ●
                - generic [ref=e96]: vec4
            - group "Subgraph" [ref=e97]:
              - heading "Shared arithmetic" [level=3] [ref=e98]
              - generic [ref=e100]:
                - button "Subgraph input X" [ref=e101] [cursor=pointer]:
                  - generic [ref=e102]: ●
                  - generic [ref=e103]: X
                - generic [ref=e104]: float
              - generic [ref=e105]:
                - button "Subgraph output Y" [ref=e106] [cursor=pointer]:
                  - generic [ref=e107]: "Y"
                  - generic [ref=e108]: ●
                - generic [ref=e109]: float
              - generic [ref=e110]:
                - button "Subgraph output Twice" [ref=e111] [cursor=pointer]:
                  - generic [ref=e112]: Twice
                  - generic [ref=e113]: ●
                - generic [ref=e114]: float
            - group "Constant input" [ref=e115]:
              - heading "Constant input" [level=3] [ref=e116]
              - generic [ref=e117]:
                - button "Constant input input value" [ref=e118] [cursor=pointer]:
                  - generic [ref=e119]: ●
                  - generic [ref=e120]: value
                - generic [ref=e121]: float
              - generic [ref=e122]:
                - button "Constant input output value" [ref=e123] [cursor=pointer]:
                  - generic [ref=e124]: value
                  - generic [ref=e125]: ●
                - generic [ref=e126]: float
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e127]:
          - button "New subgraph" [ref=e128] [cursor=pointer]
          - button "Library subgraph" [ref=e129] [cursor=pointer]
          - button "Encapsulate" [ref=e130] [cursor=pointer]
          - button "Make independent" [ref=e131] [cursor=pointer]
          - button "Enter subgraph" [ref=e132] [cursor=pointer]
          - button "Up" [ref=e133] [cursor=pointer]
          - button "Arrange nodes" [ref=e134] [cursor=pointer]
          - button "Frame selection" [ref=e135] [cursor=pointer]
          - group [ref=e136]:
            - generic "Local clipboard" [ref=e137]
          - group [ref=e138]:
            - generic "Structures" [ref=e139]
            - option "New structure" [selected]
    - complementary [ref=e140]:
      - generic [ref=e141]:
        - heading "Inspector" [level=2] [ref=e142]
        - paragraph [ref=e143]: Select a node to inspect its parameters.
  - generic [ref=e145]:
    - heading "Shader output" [level=2] [ref=e146]
    - paragraph [ref=e147]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics"
  - contentinfo [ref=e148]:
    - generic [ref=e149]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e150]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import fs from "node:fs/promises";
  3  | const evidence=process.env.GRAPE_EVIDENCE_DIR!;
  4  | async function exported(page:any){const event=page.waitForEvent("download");await page.getByRole("button",{name:"Export JSON",exact:true}).click();return JSON.parse(await fs.readFile((await(await event).path())!,"utf8"));}
  5  | async function openFixture(page:any,document:any){page.on("dialog",(d:any)=>d.accept());await page.getByLabel("Open document file").setInputFiles({name:"case.grape.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(document))});await page.getByRole("button",{name:"Open in new session",exact:true}).click();}
  6  | test("S05 AT04 AT05 real mode command reports precise loss and Undo restores entire graph; rejected activation leaves UI and history unchanged",async({page})=>{
  7  |  await page.goto("/");const records=[];for(const internal of [false,true]){
  8  |  const doc=await page.evaluate(async(internal)=>{const {functionFixture}=await import("/tests/fixtures/s05.ts"),{functionOperationRef}=await import("/src/modules/function-operations.ts");const s=functionFixture(),network=internal?s.body:s.network;s.graph.change("Constant consumer",d=>{const receiver=d.add(network,functionOperationRef("constant-input"),[0,250]);d.connect(network,internal?{nodeId:s.definition().data.network.nodes[0].id,portKey:"x"}:{nodeId:s.call,portKey:"y"},{nodeId:receiver,portKey:"value"});});return s.graph.capture().document;},internal);
> 9  |  await openFixture(page,doc);const canvas=page.locator('.canvas').first();await canvas.getByRole("heading",{name:"Shared arithmetic",exact:true}).first().click();await canvas.getByRole("button",{name:"Enter subgraph",exact:true}).click();await canvas.getByText("Subgraph interface",{exact:true}).click();const before=await exported(page);await canvas.getByLabel("Subgraph emission mode").selectOption("function");const after=await exported(page);
     |                                                                                                                                                           ^ Error: locator.click: Test timeout of 30000ms exceeded.
  10 |  if(internal){expect(after.graph).toEqual(before.graph);await expect(canvas.getByLabel("Subgraph emission mode")).toHaveValue("expand");await expect(canvas.locator('.canvas-notice')).toContainText("CONSTANT_REQUIRED");await expect(page.getByRole("button",{name:"Undo",exact:true})).toBeDisabled();}else{expect(after.graph.losses.at(-1).code).toBe("FUNCTION_CONSTANT_DETACHED");await expect(canvas.locator('.canvas-notice')).toContainText("Receiver");await page.getByRole("button",{name:"Generate GLSL",exact:true}).click();await expect(page.getByRole("list",{name:"Diagnostics"})).toContainText("INPUT_REQUIRED");await page.getByRole("button",{name:"Undo",exact:true}).click();expect((await exported(page)).graph).toEqual(before.graph);await page.getByRole("button",{name:"Redo",exact:true}).click();expect((await exported(page)).graph).toEqual(after.graph);}
  11 |  records.push({internal,before,after});}
  12 |  await fs.writeFile(evidence+"/s05-ui-constant-transactions.json",JSON.stringify(records,null,2));
  13 | });
  14 | test("S05 AT07 legacy mode UI requires explicit owner upgrade preserving original data",async({page})=>{
  15 |  await page.goto("/");const doc=await page.evaluate(async()=>{const {currentSetup}=await import("/tests/fixtures/s04.ts");const s=currentSetup();s.graph.change("Legacy",d=>d.createSubgraph(s.network));return s.graph.capture().document;});await openFixture(page,doc);let canvas=page.locator('.canvas').first();await canvas.getByRole("heading",{name:"Subgraph",exact:true}).click();await canvas.getByRole("button",{name:"Enter subgraph",exact:true}).click();await canvas.getByText("Subgraph interface",{exact:true}).click();await expect(canvas.getByLabel("Subgraph emission mode")).toBeDisabled();const before=await exported(page);await page.getByRole("button",{name:"Upgrade subgraph owners",exact:true}).click();canvas=page.locator('.canvas').first();await canvas.getByRole("heading",{name:"Subgraph",exact:true}).click();await canvas.getByRole("button",{name:"Enter subgraph",exact:true}).click();await canvas.getByText("Subgraph interface",{exact:true}).click();await expect(canvas.getByLabel("Subgraph emission mode")).toBeEnabled();const after=await exported(page);expect(after.graph.resources[0].data.network).toEqual(before.graph.resources[0].data.network);expect(after.graph.resources[0].data.emissionMode).toBe("expand");await fs.writeFile(evidence+"/s05-ui-explicit-upgrade.json",JSON.stringify({before,after},null,2));
  16 | });
  17 | test("S05 AT03 AT08 WebGL2 fixed shape nominal effects unconsumed nested effects and independent stage helpers",async({page,browser})=>{
  18 |  await page.goto("/");const rows=await page.evaluate(async()=>{
  19 |  const {shapeFixture,effectFixture,stageFixture}=await import("/tests/fixtures/s05.ts"),{executeGL}=await import("/tests/fixtures/s05-webgl.ts"),{compile}=await import("/src/generation/compiler.ts");const rows=[];
  20 |  for(const kind of ["array","nominal"] as const){const s=shapeFixture(kind);s.graph.change("Shape function",d=>d.emissionMode(s.body,"function",s.profile));rows.push({kind,...executeGL(compile(s.graph.capture(),s.fixed,s.profile)),expected:kind==="array"?[255,255,255,255]:[89,89,89,89]});}
  21 |  for(const [kind,discard,unconsumed,nested] of [["effect-pair",false,false,false],["discard",true,false,false],["unconsumed-effects",true,true,false],["nested-unconsumed-effects",true,true,true]] as const){const s=effectFixture(discard,unconsumed,nested);rows.push({kind,...executeGL(compile(s.graph.capture(),s.fixed,s.profile)),expected:discard?[0,0,0,0]:[51,102,0,255]});}
  22 |  const s=stageFixture();rows.push({kind:"vertex-pixel",...executeGL(compile(s.graph.capture(),s.fixed,s.profile)),expected:[51,102,153,255]});return rows;
  23 |  });for(const row of rows)row.pixels.forEach((v,i)=>expect(Math.abs(v-row.expected[i]),row.kind).toBeLessThanOrEqual(1));await fs.writeFile(evidence+"/s05-webgl-shape-effects-stage.json",JSON.stringify({browser:browser.version(),rows},null,2));
  24 | });
  25 | test("S05 AT02 AT03 real WebGL2 distinct shared and nested caller values and Uniform parameters",async({page,browser})=>{
  26 |  await page.goto("/");const result=await page.evaluate(async()=>{
  27 |   const {functionFixture}=await import("/tests/fixtures/s05.ts"),{executeGL}=await import("/tests/fixtures/s05-webgl.ts"),{compile}=await import("/src/generation/compiler.ts"),{asNetwork}=await import("/src/sdk/networks.ts"),{functionOperationRef}=await import("/src/modules/function-operations.ts");const rows=[];
  28 |   for(const kind of ["expanded","shared","nested","uniform"]){const s=functionFixture();let uniform="";if(kind!=="expanded")s.graph.change("Function",d=>d.emissionMode(s.body,"function",s.profile));
  29 |    if(kind==="nested"){s.graph.change("Nest",d=>d.encapsulate(s.network,[s.call,s.second]));const r=s.graph.capture().document.graph.resources.find(r=>asNetwork(r,s.fixed)?.network.nodes.some(n=>n.id===s.call))!;s.graph.change("Outer",d=>d.emissionMode(asNetwork(r,s.fixed)!.network.id,"function",s.profile));}
  30 |    if(kind==="uniform")s.graph.change("Uniform",d=>{uniform=d.createSource("gain","glsl.float",0.4,true,{kind:"uniform"});const source=d.addReferenceNode(s.network,"source",uniform,undefined,functionOperationRef("source"));d.connect(s.network,{nodeId:source,portKey:"value"},{nodeId:s.call,portKey:"x"});});
  31 |    const before=JSON.stringify(s.graph.capture()),out=compile(s.graph.capture(),s.fixed,s.profile);rows.push({kind,...executeGL(out),expected:kind==="uniform"?[102,204,153,255]:[51,102,153,255],unchanged:JSON.stringify(s.graph.capture())===before});
  32 |    if(uniform)rows.push({kind:"uniform-live-value",...executeGL(out,{[uniform]:0.1}),expected:[26,51,153,255],unchanged:JSON.stringify(s.graph.capture())===before});
  33 |   }return rows;
  34 |  });for(const row of result){expect(row.unchanged).toBe(true);row.pixels.forEach((v,i)=>expect(Math.abs(v-row.expected[i])).toBeLessThanOrEqual(1));}await fs.writeFile(evidence+"/s05-webgl-functions.json",JSON.stringify({browser:browser.version(),rows:result},null,2));
  35 | });
  36 | test("S05 mode UI persists shared choice and Make independent and Undo through real commands",async({page})=>{
  37 |  await page.goto("/");const canvas=page.locator('.canvas').first();await canvas.getByRole("button",{name:"New subgraph",exact:true}).click();await canvas.getByRole("button",{name:"Enter subgraph",exact:true}).click();await canvas.getByText("Subgraph interface",{exact:true}).click();const selector=canvas.getByLabel("Subgraph emission mode");await expect(selector).toHaveValue("expand");await selector.selectOption("function");await expect(selector).toHaveValue("function");const changed=await exported(page);await page.getByRole("button",{name:"Undo",exact:true}).click();await expect(selector).toHaveValue("expand");await page.getByRole("button",{name:"Redo",exact:true}).click();expect((await exported(page)).graph).toEqual(changed.graph);await canvas.getByRole("button",{name:"Up",exact:true}).click();await canvas.getByRole("heading",{name:"Subgraph",exact:true}).click();await canvas.getByRole("button",{name:"Make independent",exact:true}).click();const independent=await exported(page);expect(independent.graph.resources.length).toBe(changed.graph.resources.length+1);await canvas.getByRole("button",{name:"Enter subgraph",exact:true}).click();await expect(selector).toHaveValue("function");await canvas.getByText("Subgraph interface",{exact:true}).click();await selector.selectOption("expand");const separated=await exported(page);expect(separated.graph.resources.filter((r:any)=>r.data.emissionMode==="function")).toHaveLength(1);await page.screenshot({path:evidence+"/s05-mode-ui.png"});await fs.writeFile(evidence+"/s05-mode-ui.json",JSON.stringify({changed,independent,separated},null,2));
  38 | });
  39 | for(const host of ["127.0.0.1","192.168.1.105","100.83.88.97"])test(`S05 served HTTP ${host} boots with secure IDs and exact Personal digest`,async({page,browser})=>{
  40 |  await page.goto(`http://${host}:4195`);await expect(page.locator('.canvas').first()).toBeVisible();const result=await page.evaluate(async()=>{
  41 |   const {browserIdentity}=await import("/src/adapters/browser/identity.ts"),{sha256Digest}=await import("/src/application/digest.ts"),{functionFixture}=await import("/tests/fixtures/s05.ts"),{buildPersonal,readPersonal}=await import("/src/application/personal.ts"),{probeDefinitions}=await import("/src/modules/package-probe.ts");const s=functionFixture();s.graph.change("Mode",d=>d.emissionMode(s.body,"function",s.profile));const asset=await buildPersonal(s.graph.capture(),s.fixed,s.definition().resource.id,s.profile,probeDefinitions),reread=await readPersonal(JSON.stringify(asset),s.fixed,s.profile,probeDefinitions);const tampered=structuredClone(asset);tampered.name+=" altered";let rejected=false;try{await readPersonal(JSON.stringify(tampered),s.fixed,s.profile,probeDefinitions);}catch{rejected=true;}return{secure:isSecureContext,randomUUID:typeof crypto.randomUUID,subtle:typeof crypto.subtle,ids:Array.from({length:50},()=>browserIdentity().next()),hash:sha256Digest(new TextEncoder().encode("abc")),packageHash:asset.contentHash,roundtrip:reread.contentHash===asset.contentHash,rejected};
  42 |  });expect(result.hash).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");expect(new Set(result.ids).size).toBe(50);expect(result.roundtrip).toBe(true);expect(result.rejected).toBe(true);if(host!=="127.0.0.1"){expect(result.secure).toBe(false);expect(result.subtle).toBe("undefined");}
  43 |  const canvas=page.locator('.canvas').first();await page.getByRole("button",{name:"Add Float",exact:true}).click();await canvas.getByRole("button",{name:"Float output value",exact:true}).click();await canvas.getByRole("button",{name:"Image output input color",exact:true}).click();await canvas.getByRole("button",{name:"New subgraph",exact:true}).click();await canvas.getByRole("button",{name:"Enter subgraph",exact:true}).click();await canvas.getByText("Subgraph interface",{exact:true}).click();await canvas.getByRole("button",{name:"Add interface port",exact:true}).click();await canvas.getByRole("button",{name:"Apply interface",exact:true}).click();await canvas.getByText("Subgraph interface",{exact:true}).click();await canvas.getByLabel("Subgraph emission mode").selectOption("function");await canvas.getByRole("button",{name:"Up",exact:true}).click();await canvas.getByRole("heading",{name:"Subgraph",exact:true}).click();await page.getByRole("button",{name:"Personal Library",exact:true}).click();await page.getByRole("button",{name:"Save selected subgraph",exact:true}).click();await expect(page.locator('dialog[open] [role="status"]')).toContainText("Saved");const download=page.waitForEvent("download");await page.getByRole("button",{name:"Export Subgraph",exact:true}).click();const packageText=await fs.readFile((await(await download).path())!,"utf8");await page.getByLabel("Import Personal package").setInputFiles({name:"same.sgrape-function.json",mimeType:"application/json",buffer:Buffer.from(packageText)});await expect(page.locator('[data-personal-file]')).toHaveCount(1);await page.getByRole("button",{name:"Insert Subgraph",exact:true}).click();const beforeSave=await exported(page);await page.getByRole("button",{name:"Save",exact:true}).click();await expect(page.locator('#save-state')).toHaveText("Saved");await page.reload();page.on("dialog",d=>d.accept());await page.getByRole("button",{name:"Open saved",exact:true}).click();await page.locator('#saved-list button').first().click();const afterOpen=await exported(page);expect(afterOpen.graph).toEqual(beforeSave.graph);await page.getByRole("button",{name:"Personal Library",exact:true}).click();await expect(page.locator('[data-personal-file]')).toHaveCount(1);await fs.writeFile(evidence+`/s05-origin-${host}.json`,JSON.stringify({browser:browser.version(),origin:host,sameMachine:true,secondDevice:false,...result},null,2));
  44 | });
  45 | 
```