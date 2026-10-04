# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05.spec.ts >> S05 served HTTP 127.0.0.1 boots with secure IDs and exact Personal digest
- Location: tests\browser\s05.spec.ts:27:64

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.selectOption: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.canvas').first().getByLabel('Subgraph emission mode')
    - locator resolved to <select aria-label="Subgraph emission mode">…</select>
  - attempting select option action
    2 × waiting for element to be visible and enabled
      - element is not visible
    - retrying select option action
    - waiting 20ms
    2 × waiting for element to be visible and enabled
      - element is not visible
    - retrying select option action
      - waiting 100ms
    59 × waiting for element to be visible and enabled
       - element is not visible
     - retrying select option action
       - waiting 500ms

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
    - button "Undo" [ref=e34] [cursor=pointer]
    - button "Redo" [disabled] [ref=e35]
    - button "Delete selected" [ref=e36] [cursor=pointer]
    - alert
  - main [ref=e37]:
    - generic [ref=e39]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e40]:
        - generic:
          - generic:
            - group "Inputs" [ref=e41]:
              - heading "Inputs" [level=3] [ref=e42]
              - button "Create input port from selection" [ref=e43] [cursor=pointer]
              - generic [ref=e44]:
                - button "Inputs output Value" [ref=e45] [cursor=pointer]:
                  - generic [ref=e46]: Value
                  - generic [ref=e47]: ●
                - generic [ref=e48]: vec4
              - generic [ref=e49]:
                - button "Inputs output Port 3" [ref=e50] [cursor=pointer]:
                  - generic [ref=e51]: Port 3
                  - generic [ref=e52]: ●
                - generic [ref=e53]: float
            - group "Outputs" [ref=e54]:
              - heading "Outputs" [level=3] [ref=e55]
              - button "Create output port from selection" [ref=e56] [cursor=pointer]
              - generic [ref=e57]:
                - button "Outputs input Value" [ref=e58] [cursor=pointer]:
                  - generic [ref=e59]: ●
                  - generic [ref=e60]: Value
                - generic [ref=e61]: vec4
        - generic:
          - button "Untitled shader / pixel" [ref=e62] [cursor=pointer]
          - button "Subgraph" [disabled]
        - generic [ref=e63]:
          - button "New subgraph" [ref=e64] [cursor=pointer]
          - button "Library subgraph" [ref=e65] [cursor=pointer]
          - button "Encapsulate" [ref=e66] [cursor=pointer]
          - button "Make independent" [ref=e67] [cursor=pointer]
          - button "Enter subgraph" [ref=e68] [cursor=pointer]
          - button "Up" [ref=e69] [cursor=pointer]
          - button "Arrange nodes" [ref=e70] [cursor=pointer]
          - button "Frame selection" [ref=e71] [cursor=pointer]
          - group [ref=e72]:
            - generic "Subgraph interface" [ref=e73]
            - option "Expand" [selected]
            - option "Function"
            - option "glsl.float"
            - option "glsl.vec2"
            - option "glsl.vec3"
            - option "glsl.vec4" [selected]
            - option "glsl.mat2"
            - option "glsl.mat2x3"
            - option "glsl.mat2x4"
            - option "glsl.mat3x2"
            - option "glsl.mat3"
            - option "glsl.mat3x4"
            - option "glsl.mat4x2"
            - option "glsl.mat4x3"
            - option "glsl.mat4"
            - option "input" [selected]
            - option "output"
            - option "glsl.float"
            - option "glsl.vec2"
            - option "glsl.vec3"
            - option "glsl.vec4" [selected]
            - option "glsl.mat2"
            - option "glsl.mat2x3"
            - option "glsl.mat2x4"
            - option "glsl.mat3x2"
            - option "glsl.mat3"
            - option "glsl.mat3x4"
            - option "glsl.mat4x2"
            - option "glsl.mat4x3"
            - option "glsl.mat4"
            - option "input"
            - option "output" [selected]
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
            - option "input" [selected]
            - option "output"
            - option "input" [selected]
            - option "output"
          - group [ref=e74]:
            - generic "Local clipboard" [ref=e75]
          - group [ref=e76]:
            - generic "Structures" [ref=e77]
            - option "New structure" [selected]
    - complementary [ref=e78]:
      - generic [ref=e79]:
        - heading "Inspector" [level=2] [ref=e80]
        - paragraph [ref=e81]: Select a node to inspect its parameters.
  - generic [ref=e83]:
    - heading "Shader output" [level=2] [ref=e84]
    - paragraph [ref=e85]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics"
  - contentinfo [ref=e86]:
    - generic [ref=e87]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e88]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import fs from "node:fs/promises";
  3  | const evidence=process.env.GRAPE_EVIDENCE_DIR!;
  4  | async function exported(page:any){const event=page.waitForEvent("download");await page.getByRole("button",{name:"Export JSON",exact:true}).click();return JSON.parse(await fs.readFile((await(await event).path())!,"utf8"));}
  5  | test("S05 AT03 AT08 WebGL2 fixed shape nominal effects unconsumed nested effects and independent stage helpers",async({page,browser})=>{
  6  |  await page.goto("/");const rows=await page.evaluate(async()=>{
  7  |  const {shapeFixture,effectFixture,stageFixture}=await import("/tests/fixtures/s05.ts"),{executeGL}=await import("/tests/fixtures/s05-webgl.ts"),{compile}=await import("/src/generation/compiler.ts");const rows=[];
  8  |  for(const kind of ["array","nominal"] as const){const s=shapeFixture(kind);s.graph.change("Shape function",d=>d.emissionMode(s.body,"function",s.profile));rows.push({kind,...executeGL(compile(s.graph.capture(),s.fixed,s.profile)),expected:kind==="array"?[255,255,255,255]:[89,89,89,89]});}
  9  |  for(const [kind,discard,unconsumed,nested] of [["effect-pair",false,false,false],["discard",true,false,false],["unconsumed-effects",true,true,false],["nested-unconsumed-effects",true,true,true]] as const){const s=effectFixture(discard,unconsumed,nested);rows.push({kind,...executeGL(compile(s.graph.capture(),s.fixed,s.profile)),expected:discard?[0,0,0,0]:[51,102,0,255]});}
  10 |  const s=stageFixture();rows.push({kind:"vertex-pixel",...executeGL(compile(s.graph.capture(),s.fixed,s.profile)),expected:[51,102,153,255]});return rows;
  11 |  });for(const row of rows)row.pixels.forEach((v,i)=>expect(Math.abs(v-row.expected[i]),row.kind).toBeLessThanOrEqual(1));await fs.writeFile(evidence+"/s05-webgl-shape-effects-stage.json",JSON.stringify({browser:browser.version(),rows},null,2));
  12 | });
  13 | test("S05 AT02 AT03 real WebGL2 distinct shared and nested caller values and Uniform parameters",async({page,browser})=>{
  14 |  await page.goto("/");const result=await page.evaluate(async()=>{
  15 |   const {functionFixture}=await import("/tests/fixtures/s05.ts"),{executeGL}=await import("/tests/fixtures/s05-webgl.ts"),{compile}=await import("/src/generation/compiler.ts"),{asNetwork}=await import("/src/sdk/networks.ts"),{functionOperationRef}=await import("/src/modules/function-operations.ts");const rows=[];
  16 |   for(const kind of ["expanded","shared","nested","uniform"]){const s=functionFixture();let uniform="";if(kind!=="expanded")s.graph.change("Function",d=>d.emissionMode(s.body,"function",s.profile));
  17 |    if(kind==="nested"){s.graph.change("Nest",d=>d.encapsulate(s.network,[s.call,s.second]));const r=s.graph.capture().document.graph.resources.find(r=>asNetwork(r,s.fixed)?.network.nodes.some(n=>n.id===s.call))!;s.graph.change("Outer",d=>d.emissionMode(asNetwork(r,s.fixed)!.network.id,"function",s.profile));}
  18 |    if(kind==="uniform")s.graph.change("Uniform",d=>{uniform=d.createSource("gain","glsl.float",0.4,true,{kind:"uniform"});const source=d.addReferenceNode(s.network,"source",uniform,undefined,functionOperationRef("source"));d.connect(s.network,{nodeId:source,portKey:"value"},{nodeId:s.call,portKey:"x"});});
  19 |    const before=JSON.stringify(s.graph.capture()),out=compile(s.graph.capture(),s.fixed,s.profile);rows.push({kind,...executeGL(out),expected:kind==="uniform"?[102,204,153,255]:[51,102,153,255],unchanged:JSON.stringify(s.graph.capture())===before});
  20 |    if(uniform)rows.push({kind:"uniform-live-value",...executeGL(out,{[uniform]:0.1}),expected:[26,51,153,255],unchanged:JSON.stringify(s.graph.capture())===before});
  21 |   }return rows;
  22 |  });for(const row of result){expect(row.unchanged).toBe(true);row.pixels.forEach((v,i)=>expect(Math.abs(v-row.expected[i])).toBeLessThanOrEqual(1));}await fs.writeFile(evidence+"/s05-webgl-functions.json",JSON.stringify({browser:browser.version(),rows:result},null,2));
  23 | });
  24 | test("S05 mode UI persists shared choice and Make independent and Undo through real commands",async({page})=>{
  25 |  await page.goto("/");const canvas=page.locator('.canvas').first();await canvas.getByRole("button",{name:"New subgraph",exact:true}).click();await canvas.getByRole("button",{name:"Enter subgraph",exact:true}).click();await canvas.getByText("Subgraph interface",{exact:true}).click();const selector=canvas.getByLabel("Subgraph emission mode");await expect(selector).toHaveValue("expand");await selector.selectOption("function");await expect(selector).toHaveValue("function");const changed=await exported(page);await page.getByRole("button",{name:"Undo",exact:true}).click();await expect(selector).toHaveValue("expand");await page.getByRole("button",{name:"Redo",exact:true}).click();expect((await exported(page)).graph).toEqual(changed.graph);await canvas.getByRole("button",{name:"Up",exact:true}).click();await canvas.getByRole("heading",{name:"Subgraph",exact:true}).click();await canvas.getByRole("button",{name:"Make independent",exact:true}).click();const independent=await exported(page);expect(independent.graph.resources.length).toBe(changed.graph.resources.length+1);await canvas.getByRole("button",{name:"Enter subgraph",exact:true}).click();await expect(selector).toHaveValue("function");await selector.selectOption("expand");const separated=await exported(page);expect(separated.graph.resources.filter((r:any)=>r.data.emissionMode==="function")).toHaveLength(1);await page.screenshot({path:evidence+"/s05-mode-ui.png"});await fs.writeFile(evidence+"/s05-mode-ui.json",JSON.stringify({changed,independent,separated},null,2));
  26 | });
  27 | for(const host of ["127.0.0.1","192.168.1.105","100.83.88.97"])test(`S05 served HTTP ${host} boots with secure IDs and exact Personal digest`,async({page,browser})=>{
  28 |  await page.goto(`http://${host}:4195`);await expect(page.locator('.canvas').first()).toBeVisible();const result=await page.evaluate(async()=>{
  29 |   const {browserIdentity}=await import("/src/adapters/browser/identity.ts"),{sha256Digest}=await import("/src/application/digest.ts"),{functionFixture}=await import("/tests/fixtures/s05.ts"),{buildPersonal,readPersonal}=await import("/src/application/personal.ts"),{probeDefinitions}=await import("/src/modules/package-probe.ts");const s=functionFixture();s.graph.change("Mode",d=>d.emissionMode(s.body,"function",s.profile));const asset=await buildPersonal(s.graph.capture(),s.fixed,s.definition().resource.id,s.profile,probeDefinitions),reread=await readPersonal(JSON.stringify(asset),s.fixed,s.profile,probeDefinitions);const tampered=structuredClone(asset);tampered.name+=" altered";let rejected=false;try{await readPersonal(JSON.stringify(tampered),s.fixed,s.profile,probeDefinitions);}catch{rejected=true;}return{secure:isSecureContext,randomUUID:typeof crypto.randomUUID,subtle:typeof crypto.subtle,ids:Array.from({length:50},()=>browserIdentity().next()),hash:sha256Digest(new TextEncoder().encode("abc")),packageHash:asset.contentHash,roundtrip:reread.contentHash===asset.contentHash,rejected};
  30 |  });expect(result.hash).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");expect(new Set(result.ids).size).toBe(50);expect(result.roundtrip).toBe(true);expect(result.rejected).toBe(true);if(host!=="127.0.0.1"){expect(result.secure).toBe(false);expect(result.subtle).toBe("undefined");}
> 31 |  const canvas=page.locator('.canvas').first();await page.getByRole("button",{name:"Add Float",exact:true}).click();await canvas.getByRole("button",{name:"Float output value",exact:true}).click();await canvas.getByRole("button",{name:"Image output input color",exact:true}).click();await canvas.getByRole("button",{name:"New subgraph",exact:true}).click();await canvas.getByRole("button",{name:"Enter subgraph",exact:true}).click();await canvas.getByText("Subgraph interface",{exact:true}).click();await canvas.getByRole("button",{name:"Add interface port",exact:true}).click();await canvas.getByRole("button",{name:"Apply interface",exact:true}).click();await canvas.getByLabel("Subgraph emission mode").selectOption("function");await canvas.getByRole("button",{name:"Up",exact:true}).click();await canvas.getByRole("heading",{name:"Subgraph",exact:true}).click();await page.getByRole("button",{name:"Personal Library",exact:true}).click();await page.getByRole("button",{name:"Save selected subgraph",exact:true}).click();await expect(page.locator('dialog[open] [role="status"]')).toContainText("Saved");const download=page.waitForEvent("download");await page.getByRole("button",{name:"Export Subgraph",exact:true}).click();const packageText=await fs.readFile((await(await download).path())!,"utf8");await page.getByLabel("Import Personal package").setInputFiles({name:"same.sgrape-function.json",mimeType:"application/json",buffer:Buffer.from(packageText)});await expect(page.locator('[data-personal-file]')).toHaveCount(1);await page.getByRole("button",{name:"Insert Subgraph",exact:true}).click();const beforeSave=await exported(page);await page.getByRole("button",{name:"Save",exact:true}).click();await expect(page.locator('#save-state')).toHaveText("Saved");await page.reload();page.on("dialog",d=>d.accept());await page.getByRole("button",{name:"Open saved",exact:true}).click();await page.locator('#saved-list button').first().click();const afterOpen=await exported(page);expect(afterOpen.graph).toEqual(beforeSave.graph);await page.getByRole("button",{name:"Personal Library",exact:true}).click();await expect(page.locator('[data-personal-file]')).toHaveCount(1);await fs.writeFile(evidence+`/s05-origin-${host}.json`,JSON.stringify({browser:browser.version(),origin:host,sameMachine:true,secondDevice:false,...result},null,2));
     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ^ Error: locator.selectOption: Test timeout of 30000ms exceeded.
  32 | });
  33 | 
```