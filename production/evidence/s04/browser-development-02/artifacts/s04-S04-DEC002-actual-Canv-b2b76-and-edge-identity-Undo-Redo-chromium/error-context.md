# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s04.spec.ts >> S04 DEC002 actual Canvas four shapes to current ImageOutput and edge identity Undo Redo
- Location: tests\browser\s04.spec.ts:49:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.selectOption: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-parameter="mode"]')

```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - banner [ref=f1e3]:
    - generic [ref=f1e4]:
      - generic [ref=f1e5]: ●
      - text: Grape
      - generic [ref=f1e6]: SHADER WORKSPACE
    - navigation "Document actions" [ref=f1e7]:
      - button "New document" [ref=f1e8] [cursor=pointer]
      - button "Save" [ref=f1e9] [cursor=pointer]
      - button "Open saved" [ref=f1e10] [cursor=pointer]
      - button "Export JSON" [ref=f1e11] [cursor=pointer]
      - button "Export PNG" [ref=f1e12] [cursor=pointer]
      - button "Open file" [ref=f1e13] [cursor=pointer]
      - button "Generate GLSL" [ref=f1e14] [cursor=pointer]
      - button "Second Canvas" [ref=f1e15] [cursor=pointer]
      - button "Lock editing" [ref=f1e16] [cursor=pointer]
      - button "Personal Library" [ref=f1e17] [cursor=pointer]
    - generic [ref=f1e18]:
      - generic [ref=f1e19]: Unsaved changes
      - generic [ref=f1e20]: Host-free
  - status [ref=f1e21]
  - generic [ref=f1e23]:
    - button "Add Float" [ref=f1e24] [cursor=pointer]
    - button "Add Multiply" [active] [ref=f1e25] [cursor=pointer]
    - button "Add Compose" [ref=f1e26] [cursor=pointer]
    - button "Add Array repeat" [ref=f1e27] [cursor=pointer]
    - button "Undo" [ref=f1e28] [cursor=pointer]
    - button "Redo" [disabled] [ref=f1e29]
    - button "Delete selected" [ref=f1e30] [cursor=pointer]
    - alert
  - main [ref=f1e31]:
    - generic [ref=f1e33]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=f1e34]:
        - generic:
          - generic:
            - group "Image output" [ref=f1e35]:
              - heading "Image output" [level=3] [ref=f1e36]
              - generic [ref=f1e37]:
                - button "Image output input color" [ref=f1e38] [cursor=pointer]:
                  - generic [ref=f1e39]: ●
                  - generic [ref=f1e40]: color
                - generic [ref=f1e41]: vec4
            - group "Multiply" [ref=f1e42]:
              - heading "Multiply" [level=3] [ref=f1e43]
              - generic [ref=f1e44]:
                - button "Multiply input a" [ref=f1e45] [cursor=pointer]:
                  - generic [ref=f1e46]: ●
                  - generic [ref=f1e47]: a
                - generic [ref=f1e48]: float
              - generic [ref=f1e49]:
                - button "Multiply input b" [ref=f1e50] [cursor=pointer]:
                  - generic [ref=f1e51]: ●
                  - generic [ref=f1e52]: b
                - generic [ref=f1e53]: float
              - generic [ref=f1e54]:
                - button "Multiply output result" [ref=f1e55] [cursor=pointer]:
                  - generic [ref=f1e56]: result
                  - generic [ref=f1e57]: ●
                - generic [ref=f1e58]: float
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=f1e59]:
          - button "New subgraph" [ref=f1e60] [cursor=pointer]
          - button "Library subgraph" [ref=f1e61] [cursor=pointer]
          - button "Encapsulate" [ref=f1e62] [cursor=pointer]
          - button "Make independent" [ref=f1e63] [cursor=pointer]
          - button "Enter subgraph" [ref=f1e64] [cursor=pointer]
          - button "Up" [ref=f1e65] [cursor=pointer]
          - button "Arrange nodes" [ref=f1e66] [cursor=pointer]
          - button "Frame selection" [ref=f1e67] [cursor=pointer]
          - group [ref=f1e68]:
            - generic "Local clipboard" [ref=f1e69]
          - group [ref=f1e70]:
            - generic "Structures" [ref=f1e71]
            - option "New structure" [selected]
    - complementary [ref=f1e72]:
      - generic [ref=f1e73]:
        - heading "Inspector" [level=2] [ref=f1e74]
        - paragraph [ref=f1e75]: Multiply
        - button "Rename node" [ref=f1e76] [cursor=pointer]
        - generic [ref=f1e77]:
          - generic [ref=f1e79]:
            - generic [ref=f1e80]: A
            - textbox "A" [ref=f1e81]: "1"
            - alert
          - generic [ref=f1e83]:
            - generic [ref=f1e84]: B
            - textbox "B" [ref=f1e85]: "2"
            - alert
  - generic [ref=f1e87]:
    - heading "Shader output" [level=2] [ref=f1e88]
    - paragraph [ref=f1e89]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=f1e90]:
      - listitem [ref=f1e91]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=f1e92] [cursor=pointer]
  - contentinfo [ref=f1e93]:
    - generic [ref=f1e94]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=f1e95]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import fs from "node:fs/promises";
  3  | const evidence=process.env.GRAPE_EVIDENCE_DIR!;
  4  | test("S04 DEC002 all sixteen conversions execute on WebGL2 with correct components",async({page,browser})=>{
  5  |   await page.goto("/");const result=await page.evaluate(async()=>{
  6  |     const {conversionFixture}=await import("/tests/fixtures/s04.ts"),{compile}=await import("/src/generation/compiler.ts"),{esProfile}=await import("/src/modules/image.ts");
  7  |     const canvas=document.createElement("canvas");canvas.width=canvas.height=1;const gl=canvas.getContext("webgl2",{premultipliedAlpha:false,antialias:false})!;if(!gl)throw Error("WEBGL2_UNAVAILABLE");
  8  |     const rows=[];for(const from of ["glsl.float","glsl.vec2","glsl.vec3","glsl.vec4"])for(const to of ["glsl.float","glsl.vec2","glsl.vec3","glsl.vec4"]){
  9  |       const s=conversionFixture(from,to),before=JSON.stringify(s.graph.capture()),out=compile(s.graph.capture(),s.fixed,esProfile);if(out.status!=="success")throw Error(JSON.stringify(out.diagnostics));
  10 |       const program=gl.createProgram()!,shaders=out.artifacts.map(a=>{const sh=gl.createShader(a.key==="vertex"?gl.VERTEX_SHADER:gl.FRAGMENT_SHADER)!;gl.shaderSource(sh,a.text);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh)!);gl.attachShader(program,sh);return sh;});gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program)!);
  11 |       gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.viewport(0,0,1,1);gl.drawArrays(gl.TRIANGLES,0,3);const pixels=new Uint8Array(4);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  12 |       rows.push({from,to,expected:s.expected.map(v=>Math.round(v*255)),pixels:[...pixels],unchanged:JSON.stringify(s.graph.capture())===before,artifacts:out.artifacts});gl.deleteBuffer(buffer);shaders.forEach(sh=>gl.deleteShader(sh));gl.deleteProgram(program);
  13 |     }return {rows,version:gl.getParameter(gl.VERSION),renderer:gl.getParameter(gl.RENDERER)};
  14 |   });
  15 |   for(const row of result.rows){expect(row.unchanged).toBe(true);row.pixels.forEach((v,i)=>expect(Math.abs(v-row.expected[i])).toBeLessThanOrEqual(1));}
  16 |   await fs.writeFile(evidence+"/s04-webgl16.json",JSON.stringify({browser:browser.version(),...result},null,2));
  17 | });
  18 | test("S04 DEC004 actual Personal literal source input nested shaders compile after export import reopen",async({page,browser})=>{
  19 |   await page.goto("/");const result=await page.evaluate(async()=>{
  20 |     const {arrayFixture,nestedArrayFixture,currentSetup}=await import("/tests/fixtures/s04.ts"),{buildPersonal,readPersonal,qualifyPackage,packagePacket}=await import("/src/application/personal.ts"),{probeDefinitions}=await import("/src/modules/package-probe.ts"),{esProfile}=await import("/src/modules/image.ts"),{nodeRef}=await import("/src/modules/nodes.ts"),{Graph}=await import("/src/model/graph.ts"),{callResource}=await import("/src/sdk/networks.ts"),{writeDocument,readDocument}=await import("/src/persistence/codec.ts");
  21 |     const gl=document.createElement("canvas").getContext("webgl2")!;if(!gl)throw Error("WEBGL2_UNAVAILABLE");const rows=[];
  22 |     for(const mode of ["literal","source","direct-source","input","nested"]){
  23 |       const s=mode==="nested"?nestedArrayFixture():arrayFixture(mode as any),root="root" in s?s.root:s.id,asset=await readPersonal(JSON.stringify(await buildPersonal(s.graph.capture(),s.fixed,root,esProfile,probeDefinitions)),s.fixed,esProfile,probeDefinitions);
  24 |       const target=currentSetup();let inserted:string[]=[];target.graph.change("Valid",d=>{const f=d.add(target.network,nodeRef("float"),[0,0]);d.connect(target.network,{nodeId:f,portKey:"value"},{nodeId:target.graph.resolveNetwork(target.network).nodes[0].id,portKey:"color"});});target.graph.change("Import",d=>{inserted=d.insertLibrary(target.network,packagePacket(asset,target.graph.capture().document,target.fixed),asset.contentHash);});
  25 |       const read=readDocument(writeDocument(target.graph.capture().document));if(read.status!=="editable")throw Error("REOPEN");const reopened=new Graph(read.document,target.fixed,target.identity),id=callResource(reopened.resolveNetwork(target.network).nodes.find(n=>n.id===inserted[0])!,target.fixed)!;
  26 |       const round=await buildPersonal(reopened.capture(),target.fixed,id,esProfile,probeDefinitions),compiled=qualifyPackage(round,target.fixed,esProfile,probeDefinitions),shaders=[];
  27 |       for(const c of compiled)for(const a of c.artifacts){const shader=gl.createShader(a.key==="vertex"?gl.VERTEX_SHADER:gl.FRAGMENT_SHADER)!;gl.shaderSource(shader,a.text);gl.compileShader(shader);shaders.push({key:a.key,compiled:!!gl.getShaderParameter(shader,gl.COMPILE_STATUS),log:gl.getShaderInfoLog(shader),text:a.text});gl.deleteShader(shader);}
  28 |       rows.push({mode,hashSame:round.contentHash===asset.contentHash,shaders,resources:round.resources});
  29 |     }return {rows,version:gl.getParameter(gl.VERSION),renderer:gl.getParameter(gl.RENDERER)};
  30 |   });
  31 |   for(const row of result.rows){expect(row.hashSame).toBe(true);expect(row.shaders.every(s=>s.compiled),JSON.stringify(row.shaders)).toBe(true);}
  32 |   await fs.writeFile(evidence+"/s04-personal-webgl.json",JSON.stringify({browser:browser.version(),...result},null,2));
  33 | });
  34 | test("S04 actual IndexedDB collision concurrency relist quotas and failure isolation",async({page})=>{
  35 |   await page.goto("/");const result=await page.evaluate(async()=>{
  36 |     const {BrowserLibraryStore}=await import("/src/adapters/browser/library.ts"),{PersonalLibrary,buildPersonal}=await import("/src/application/personal.ts"),{arrayFixture}=await import("/tests/fixtures/s04.ts"),{probeDefinitions}=await import("/src/modules/package-probe.ts"),{esProfile}=await import("/src/modules/image.ts");
  37 |     const store=new BrowserLibraryStore("s04-test-"+crypto.randomUUID()),s=arrayFixture("literal"),asset=await buildPersonal(s.graph.capture(),s.fixed,s.id,esProfile,probeDefinitions),lib=new PersonalLibrary(store,s.fixed,esProfile,probeDefinitions);
  38 |     await store.publish("Portable_array.sgrape-function.json","broken");const saved=await lib.save(asset),same=await lib.save(asset),listed=await lib.list();
  39 |     const race=await Promise.all([store.publish("Race.sgrape-function.json","a"),store.publish("race.sgrape-function.json","b")]);
  40 |     for(let i=(await store.list()).length;i<64;i++)await store.publish("invalid"+i+".sgrape-function.json","bad");const before=JSON.stringify(await store.list());let count="";try{await store.publish("overflow.sgrape-function.json","bad");}catch(e){count=(e as Error).name;}const fullReuse=await lib.save(asset),unchanged=JSON.stringify(await store.list())===before;
  41 |     const total=new BrowserLibraryStore("s04-total-"+crypto.randomUUID());for(let i=0;i<15;i++)await total.publish(i+".sgrape-function.json","x".repeat(256000));await total.publish("15.sgrape-function.json","x".repeat(160000));let budget="",single="";try{await total.publish("16.sgrape-function.json","x");}catch(e){budget=(e as Error).name;}try{await total.publish("17.sgrape-function.json","x".repeat(256001));}catch(e){single=(e as Error).name;}
  42 |     return {saved,same,listed:listed.items.map(x=>x.name),issues:listed.issues,race,count,fullReuse,unchanged,budget,single,totalBytes:(await total.list()).reduce((n,f)=>n+new TextEncoder().encode(f.text).length,0)};
  43 |   });
  44 |   expect(result.saved.name).toBe("Portable_array_2.sgrape-function.json");expect(result.same.reused).toBe(true);expect(result.race.sort()).toEqual(["created","exists"]);expect(result.count).toBe("PERSONAL_FILE_LIMIT");expect(result.budget).toBe("PERSONAL_TOTAL_SIZE");expect(result.single).toBe("PERSONAL_SIZE");expect(result.totalBytes).toBe(4000000);expect(result.fullReuse.reused&&result.unchanged).toBe(true);expect(result.issues).toHaveLength(1);
  45 |   await fs.writeFile(evidence+"/s04-provider.json",JSON.stringify(result,null,2));
  46 | });
  47 | 
  48 | async function exported(page:any){const event=page.waitForEvent("download");await page.getByRole("button",{name:"Export JSON",exact:true}).click();return JSON.parse(await fs.readFile((await (await event).path())!,"utf8"));}
  49 | test("S04 DEC002 actual Canvas four shapes to current ImageOutput and edge identity Undo Redo",async({page})=>{
  50 |   const rows=[];
  51 |   for(const shape of ["float","vec2","vec3","vec4"]){
  52 |     await page.goto("/");const name=shape==="float"?"Float":shape==="vec4"?"Compose":"Multiply";
  53 |     await page.getByRole("button",{name:"Add "+name,exact:true}).click();
> 54 |     if(shape==="vec2"||shape==="vec3")await page.locator('[data-parameter="mode"]').selectOption(shape);
     |                                                                                     ^ Error: locator.selectOption: Test timeout of 30000ms exceeded.
  55 |     await page.getByRole("button",{name:name+" output "+(shape==="float"?"value":"result"),exact:true}).click();await page.getByRole("button",{name:"Image output input color",exact:true}).click();
  56 |     await expect(page.locator(".wires [data-edge]")).toHaveCount(1);const edge=await page.locator(".wires [data-edge]").getAttribute("data-edge");
  57 |     await page.getByRole("button",{name:"Generate GLSL",exact:true}).click();await expect(page.getByLabel("Generated GLSL")).toContainText("fragColor");
  58 |     const document=await exported(page);expect(document.formatVersion).toEqual({major:2,minor:1});const plan=document.graph.stages.find((s:any)=>s.key==="pixel").network.edges[0].adaptation;
  59 |     await page.getByRole("button",{name:"Undo",exact:true}).click();await expect(page.locator(".wires [data-edge]")).toHaveCount(0);await page.getByRole("button",{name:"Redo",exact:true}).click();await expect(page.locator(".wires [data-edge]")).toHaveAttribute("data-edge",edge!);
  60 |     const redo=await exported(page);expect(redo.graph).toEqual(document.graph);rows.push({shape,edge,plan,document});
  61 |   }
  62 |   await page.screenshot({path:evidence+"/s04-canvas.png",fullPage:true});await fs.writeFile(evidence+"/s04-canvas-four.json",JSON.stringify(rows,null,2));
  63 | });
  64 | test("S04 actual Personal UI saves relists imports downloads and inserts independent Graph snapshots",async({page})=>{
  65 |   await page.goto("/");await page.getByRole("button",{name:"Add Float",exact:true}).click();await page.getByRole("button",{name:"Float output value",exact:true}).click();await page.getByRole("button",{name:"Image output input color",exact:true}).click();
  66 |   await page.getByRole("button",{name:"New subgraph",exact:true}).click();await page.getByRole("button",{name:"Personal Library",exact:true}).click();await page.getByRole("button",{name:"Save selected subgraph",exact:true}).click();await expect(page.locator('dialog[open] [role="status"]')).toContainText("Saved");
  67 |   const download=page.waitForEvent("download");await page.getByRole("button",{name:"Export Subgraph",exact:true}).click();const text=await fs.readFile((await (await download).path())!,"utf8");await page.getByLabel("Import Personal package").setInputFiles({name:"again.sgrape-function.json",mimeType:"application/json",buffer:Buffer.from(text)});await expect(page.locator('[data-personal-file]')).toHaveCount(1);
  68 |   await page.getByRole("button",{name:"Insert Subgraph",exact:true}).click();await expect(page.locator('dialog[open]')).toHaveCount(0);const once=await exported(page);
  69 |   await page.getByRole("button",{name:"Personal Library",exact:true}).click();await page.getByRole("button",{name:"Insert Subgraph",exact:true}).click();const twice=await exported(page);expect(twice.graph.resources).toEqual(once.graph.resources);
  70 |   await page.getByRole("button",{name:"Make independent",exact:true}).click();const independent=await exported(page);expect(independent.graph.resources.length).toBe(twice.graph.resources.length+1);await page.getByRole("button",{name:"Undo",exact:true}).click();expect((await exported(page)).graph).toEqual(twice.graph);
  71 |   await page.getByRole("button",{name:"Personal Library",exact:true}).click();await page.getByLabel("Import Personal package").setInputFiles({name:"bad.sgrape-function.json",mimeType:"application/json",buffer:Buffer.from('{"bad":true}')});await expect(page.locator('dialog[open] [role="status"]')).toContainText("PERSONAL_FORMAT");await expect(page.locator('[data-personal-file]')).toHaveCount(1);await page.getByRole("button",{name:"Close Personal",exact:true}).click();expect((await exported(page)).graph).toEqual(twice.graph);
  72 |   await page.reload();await page.getByRole("button",{name:"Personal Library",exact:true}).click();await expect(page.locator('[data-personal-file]')).toHaveCount(1);await page.screenshot({path:evidence+"/s04-personal-ui.png",fullPage:true});await fs.writeFile(evidence+"/s04-personal-ui.json",JSON.stringify({asset:JSON.parse(text),once,twice,independent},null,2));
  73 | });
  74 | 
```