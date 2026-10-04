# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s05.spec.ts >> S05 mode UI persists shared choice and Make independent and Undo through real commands
- Location: tests\browser\s05.spec.ts:15:1

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  locator('.canvas').first().getByLabel('Subgraph emission mode')
Expected: "function"
Received: "expand"
Timeout:  5000ms

Call log:
  - Expect "toHaveValue" with timeout 5000ms
  - waiting for locator('.canvas').first().getByLabel('Subgraph emission mode')
    14 × locator resolved to <select disabled aria-label="Subgraph emission mode">…</select>
       - unexpected value "expand"

```

```yaml
- banner:
  - text: ● Grape SHADER WORKSPACE
  - navigation "Document actions":
    - button "New document"
    - button "Upgrade subgraph owners"
    - button "Save"
    - button "Open saved"
    - button "Export JSON"
    - button "Export PNG"
    - button "Open file"
    - button "Generate GLSL"
    - button "Second Canvas"
    - button "Lock editing"
    - button "Personal Library"
  - text: Unsaved changes Host-free
- status
- button "Add Float"
- button "Add Multiply"
- button "Add Compose"
- button "Add Array repeat"
- button "Add Constant input"
- button "Add Add"
- button "Add Array length"
- button "Add Pixel depth and pair"
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
  - group "Subgraph":
    - heading "Subgraph" [level=3]
    - button "Subgraph input Value": ● Value
    - text: vec4
    - button "Subgraph output Value": Value ●
    - text: vec4
  - button "Untitled shader / pixel" [disabled]
  - status: "OCCURRENCE_MISSING: OCCURRENCE_MISSING"
  - button "New subgraph"
  - button "Library subgraph"
  - button "Encapsulate"
  - button "Make independent"
  - button "Enter subgraph"
  - button "Up"
  - button "Arrange nodes"
  - button "Frame selection"
  - group: Local clipboard
  - group: Structures
  - complementary:
    - heading "Inspector" [level=2]
    - paragraph: Select a node to inspect its parameters.
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
  1  | import { test, expect } from "@playwright/test";
  2  | import fs from "node:fs/promises";
  3  | const evidence=process.env.GRAPE_EVIDENCE_DIR!;
  4  | test("S05 AT02 AT03 real WebGL2 distinct shared and nested caller values and Uniform parameters",async({page,browser})=>{
  5  |  await page.goto("/");const result=await page.evaluate(async()=>{
  6  |   const {functionFixture}=await import("/tests/fixtures/s05.ts"),{executeGL}=await import("/tests/fixtures/s05-webgl.ts"),{compile}=await import("/src/generation/compiler.ts"),{asNetwork}=await import("/src/sdk/networks.ts"),{functionOperationRef}=await import("/src/modules/function-operations.ts");const rows=[];
  7  |   for(const kind of ["expanded","shared","nested","uniform"]){const s=functionFixture();let uniform="";if(kind!=="expanded")s.graph.change("Function",d=>d.emissionMode(s.body,"function",s.profile));
  8  |    if(kind==="nested"){s.graph.change("Nest",d=>d.encapsulate(s.network,[s.call,s.second]));const r=s.graph.capture().document.graph.resources.find(r=>asNetwork(r,s.fixed)?.network.nodes.some(n=>n.id===s.call))!;s.graph.change("Outer",d=>d.emissionMode(asNetwork(r,s.fixed)!.network.id,"function",s.profile));}
  9  |    if(kind==="uniform")s.graph.change("Uniform",d=>{uniform=d.createSource("gain","glsl.float",0.4,true,{kind:"uniform"});const source=d.addReferenceNode(s.network,"source",uniform,undefined,functionOperationRef("source"));d.connect(s.network,{nodeId:source,portKey:"value"},{nodeId:s.call,portKey:"x"});});
  10 |    const before=JSON.stringify(s.graph.capture()),out=compile(s.graph.capture(),s.fixed,s.profile);rows.push({kind,...executeGL(out),expected:kind==="uniform"?[102,204,153,255]:[51,102,153,255],unchanged:JSON.stringify(s.graph.capture())===before});
  11 |    if(uniform)rows.push({kind:"uniform-live-value",...executeGL(out,{[uniform]:0.1}),expected:[26,51,153,255],unchanged:JSON.stringify(s.graph.capture())===before});
  12 |   }return rows;
  13 |  });for(const row of result){expect(row.unchanged).toBe(true);row.pixels.forEach((v,i)=>expect(Math.abs(v-row.expected[i])).toBeLessThanOrEqual(1));}await fs.writeFile(evidence+"/s05-webgl-functions.json",JSON.stringify({browser:browser.version(),rows:result},null,2));
  14 | });
  15 | test("S05 mode UI persists shared choice and Make independent and Undo through real commands",async({page})=>{
> 16 |  await page.goto("/");const canvas=page.locator('.canvas').first();await canvas.getByRole("button",{name:"New subgraph",exact:true}).click();await canvas.getByRole("button",{name:"Enter subgraph",exact:true}).click();await canvas.getByText("Subgraph interface",{exact:true}).click();const selector=canvas.getByLabel("Subgraph emission mode");await expect(selector).toHaveValue("expand");await selector.selectOption("function");await expect(selector).toHaveValue("function");await canvas.getByRole("button",{name:"Up",exact:true}).click();await canvas.getByRole("button",{name:"Enter subgraph",exact:true}).click();await expect(selector).toHaveValue("function");await page.screenshot({path:evidence+"/s05-mode-ui.png"});
     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              ^ Error: expect(locator).toHaveValue(expected) failed
  17 | });
  18 | for(const host of ["127.0.0.1","192.168.1.105","100.83.88.97"])test(`S05 served HTTP ${host} boots with secure IDs and exact Personal digest`,async({page,browser})=>{
  19 |  await page.goto(`http://${host}:4195`);await expect(page.locator('.canvas').first()).toBeVisible();const result=await page.evaluate(async()=>{
  20 |   const {browserIdentity}=await import("/src/adapters/browser/identity.ts"),{sha256Digest}=await import("/src/application/digest.ts"),{functionFixture}=await import("/tests/fixtures/s05.ts"),{buildPersonal,readPersonal}=await import("/src/application/personal.ts"),{probeDefinitions}=await import("/src/modules/package-probe.ts");const s=functionFixture();s.graph.change("Mode",d=>d.emissionMode(s.body,"function",s.profile));const asset=await buildPersonal(s.graph.capture(),s.fixed,s.definition().resource.id,s.profile,probeDefinitions),reread=await readPersonal(JSON.stringify(asset),s.fixed,s.profile,probeDefinitions);const tampered=structuredClone(asset);tampered.name+=" altered";let rejected=false;try{await readPersonal(JSON.stringify(tampered),s.fixed,s.profile,probeDefinitions);}catch{rejected=true;}return{secure:isSecureContext,randomUUID:typeof crypto.randomUUID,subtle:typeof crypto.subtle,ids:Array.from({length:50},()=>browserIdentity().next()),hash:sha256Digest(new TextEncoder().encode("abc")),packageHash:asset.contentHash,roundtrip:reread.contentHash===asset.contentHash,rejected};
  21 |  });expect(result.hash).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");expect(new Set(result.ids).size).toBe(50);expect(result.roundtrip).toBe(true);expect(result.rejected).toBe(true);if(host!=="127.0.0.1"){expect(result.secure).toBe(false);expect(result.subtle).toBe("undefined");}
  22 |  const canvas=page.locator('.canvas').first();await canvas.getByRole("button",{name:"New subgraph",exact:true}).click();await canvas.getByRole("button",{name:"Enter subgraph",exact:true}).click();await canvas.getByText("Subgraph interface",{exact:true}).click();await canvas.getByRole("button",{name:"Add interface port",exact:true}).click();await canvas.getByRole("button",{name:"Apply interface",exact:true}).click();await fs.writeFile(evidence+`/s05-origin-${host}.json`,JSON.stringify({browser:browser.version(),origin:host,sameMachine:true,secondDevice:false,...result},null,2));
  23 | });
  24 | 
```