# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-debug-hover.spec.ts >> S06 debug target follows nested occurrence and independent Canvas navigation
- Location: ..\..\..\production\tests\browser\s06-debug-hover.spec.ts:47:1

# Error details

```
ReferenceError: documentJSON is not defined
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - text: Grape
      - generic [ref=e9]: SHADER WORKSPACE
      - generic "No candidate identity injected" [ref=e10]: Development · unversioned
      - button "本輪更新" [ref=e11] [cursor=pointer]
    - navigation "Document actions" [ref=e12]:
      - button "Save" [ref=e13] [cursor=pointer]
      - button "Generate GLSL" [ref=e16] [cursor=pointer]
    - generic [ref=e19]:
      - generic [ref=e20]: Unsaved changes
      - generic [ref=e21]: Host-free
  - generic [ref=e23]:
    - button "Undo" [ref=e24] [cursor=pointer]
    - button "Redo" [disabled] [ref=e27]
    - button "Delete selected" [ref=e30] [cursor=pointer]
    - alert
  - main [ref=e31]:
    - generic [ref=e32]:
      - generic [ref=e33]:
        - generic: Canvas 1
        - generic "Shader graph canvas" [ref=e34]:
          - generic:
            - generic:
              - img:
                - generic "Edge a1ff207d-4a9f-461f-8d7d-9bac60062811" [ref=e35]
                - generic "Edge 67dcd9a2-c2ec-4c88-b98e-2d7e3fc79d5c" [ref=e36]
                - generic "Edge c064b390-2e43-4365-8515-940ffe7189bd" [ref=e37]
              - generic:
                - group "Image output" [ref=e38]:
                  - heading "Image output" [level=3] [ref=e39]
                  - generic [ref=e40]:
                    - button "Image output input color" [ref=e41] [cursor=pointer]
                    - generic [ref=e42]: color
                    - generic [ref=e43]: vec4
                - group "Float" [ref=e44]:
                  - heading "Float" [level=3] [ref=e45]
                  - generic [ref=e46]:
                    - button "Float output value" [ref=e47] [cursor=pointer]
                    - generic [ref=e48]: value
                    - generic [ref=e49]: float
                - group "Compose" [ref=e50]:
                  - heading "Compose" [level=3] [ref=e51]
                  - generic [ref=e52]:
                    - button "Compose input x" [ref=e53] [cursor=pointer]
                    - generic [ref=e54]: x
                    - generic [ref=e55]: float
                  - generic [ref=e56]:
                    - button "Compose input y" [ref=e57] [cursor=pointer]
                    - generic [ref=e58]: "y"
                    - generic [ref=e59]: float
                    - generic "Current local value; edit in Inspector" [ref=e60]: "0"
                  - generic [ref=e61]:
                    - button "Compose input z" [ref=e62] [cursor=pointer]
                    - generic [ref=e63]: z
                    - generic [ref=e64]: float
                    - generic "Current local value; edit in Inspector" [ref=e65]: "0"
                  - generic [ref=e66]:
                    - button "Compose input w" [ref=e67] [cursor=pointer]
                    - generic [ref=e68]: w
                    - generic [ref=e69]: float
                    - generic "Current local value; edit in Inspector" [ref=e70]: "1"
                  - generic [ref=e71]:
                    - button "Compose output result" [ref=e72] [cursor=pointer]
                    - generic [ref=e73]: result
                    - generic [ref=e74]: vec4
                - group "Subgraph" [ref=e75]:
                  - heading "Subgraph" [level=3] [ref=e76]
                  - generic [ref=e77]:
                    - button "Subgraph input Input 1" [ref=e78] [cursor=pointer]
                    - generic [ref=e79]: Input 1
                    - generic [ref=e80]: float
                  - generic [ref=e81]:
                    - button "Subgraph output Output 1" [ref=e82] [cursor=pointer]
                    - generic [ref=e83]: Output 1
                    - generic [ref=e84]: float
                - group "Subgraph 2" [ref=e85]:
                  - heading "Subgraph" [level=3] [ref=e86]
                  - generic [ref=e88]:
                    - button "Subgraph 2 input Input 1" [ref=e89] [cursor=pointer]
                    - generic [ref=e90]: Input 1
                    - generic [ref=e91]: float
                    - generic "Current local value; edit in Inspector" [ref=e92]: "1"
                  - generic [ref=e93]:
                    - button "Subgraph 2 output Output 1" [ref=e94] [cursor=pointer]
                    - generic [ref=e95]: Output 1
                    - generic [ref=e96]: float
          - generic:
            - button "Untitled shader / pixel" [disabled]
          - generic [ref=e97]:
            - button "New subgraph" [ref=e98] [cursor=pointer]
            - button "Library subgraph" [ref=e99] [cursor=pointer]
            - button "Encapsulate" [ref=e100] [cursor=pointer]
            - button "Make independent" [ref=e101] [cursor=pointer]
            - button "Enter subgraph" [ref=e102] [cursor=pointer]
            - button "Arrange nodes" [ref=e103] [cursor=pointer]
            - button "Frame selection" [ref=e104] [cursor=pointer]
            - group [ref=e105]:
              - generic "Local clipboard" [ref=e106] [cursor=pointer]
              - textbox "Local clipboard text" [ref=e107]: "{\"format\":\"grape.clipboard\",\"version\":1,\"graphId\":\"47ca50d9-9a3e-4cd6-8cf5-60052f93e596\",\"loadId\":\"85b9ff4a-b731-4605-a461-f8d93cb0b5b1\",\"modules\":[{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\"},{\"moduleId\":\"grape.nodes.fixed-values\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:0d75d254ae4654e672001bc326252ab9775c87b581b79c15e6e8d44fee59a6ba\"},{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\"},{\"moduleId\":\"grape.resources.extents\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:bcfaaca3ef01c57070e05b26e09bbcacde5d51f6ba0091b8b6aaf3d83efa3c60\"},{\"moduleId\":\"grape.resources.image-sources\",\"version\":\"0.2.0\",\"fingerprint\":\"sha256:bb0ff902b36d7a07fc104412d0ccb11e4e7efed0106aa3c8595026dbcef8b212\"},{\"moduleId\":\"grape.resources.function-networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:25d291427adb77405f826a636cd2a7c9a5851f0017cb779ced1a13e5a9b0b9e7\"},{\"moduleId\":\"grape.nodes.function-operations\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\"},{\"moduleId\":\"grape.graph-kinds\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:30d1266c367648c97b57a6cf77eec9d0bf14ac8bdb057fa4eef457539adb98c3\"},{\"moduleId\":\"grape.nodes.image-output\",\"version\":\"0.2.0\",\"fingerprint\":\"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\"},{\"moduleId\":\"grape.graph-kinds\",\"version\":\"0.2.0\",\"fingerprint\":\"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\"}],\"network\":{\"id\":\"40209027-ad9a-43ea-874b-b459ace2fb2d\",\"nodes\":[{\"id\":\"77e30dc9-0047-447a-af19-fadde5dcee49\",\"name\":\"Subgraph\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\",\"typeId\":\"call\"},\"state\":{\"definition\":\"f8dd12ea-01df-4eea-8bce-99f5ed792234\"},\"inputValues\":{\"27ab3db0-22b5-4dee-8338-b937b95268b0\":1},\"ports\":[{\"key\":\"27ab3db0-22b5-4dee-8338-b937b95268b0\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"2716fb6d-fff0-448e-99f2-8a66629794cb\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"references\":[{\"slot\":\"definition\",\"kind\":\"resource\",\"targetId\":\"f8dd12ea-01df-4eea-8bce-99f5ed792234\"}],\"referencesComplete\":true,\"position\":[160,120],\"extensions\":{}}],\"edges\":[],\"extensions\":{}},\"resources\":[{\"id\":\"f8dd12ea-01df-4eea-8bce-99f5ed792234\",\"type\":{\"moduleId\":\"grape.resources.function-networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:25d291427adb77405f826a636cd2a7c9a5851f0017cb779ced1a13e5a9b0b9e7\",\"typeId\":\"definition\"},\"data\":{\"name\":\"Subgraph\",\"local\":true,\"origin\":null,\"network\":{\"id\":\"ba604bec-f2c3-4826-a17b-299dd4a7fbfc\",\"nodes\":[{\"id\":\"fb3f5375-0679-4ad1-b68b-64c51c20f880\",\"name\":\"Inputs\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\",\"typeId\":\"network-input\"},\"state\":{\"definition\":\"f8dd12ea-01df-4eea-8bce-99f5ed792234\"},\"inputValues\":{},\"ports\":[{\"key\":\"27ab3db0-22b5-4dee-8338-b937b95268b0\",\"direction\":\"output\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1}],\"references\":[{\"slot\":\"definition\",\"kind\":\"resource\",\"targetId\":\"f8dd12ea-01df-4eea-8bce-99f5ed792234\"}],\"referencesComplete\":true,\"position\":[0,0],\"extensions\":{}},{\"id\":\"8a1851e4-2dac-4f14-a884-d1759bd881fb\",\"name\":\"Outputs\",\"type\":{\"moduleId\":\"grape.nodes.networks\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\",\"typeId\":\"network-output\"},\"state\":{\"definition\":\"f8dd12ea-01df-4eea-8bce-99f5ed792234\"},\"inputValues\":{\"2716fb6d-fff0-448e-99f2-8a66629794cb\":0},\"ports\":[{\"key\":\"2716fb6d-fff0-448e-99f2-8a66629794cb\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":0}],\"references\":[{\"slot\":\"definition\",\"kind\":\"resource\",\"targetId\":\"f8dd12ea-01df-4eea-8bce-99f5ed792234\"}],\"referencesComplete\":true,\"position\":[600,0],\"extensions\":{}},{\"id\":\"268c816a-e66b-4069-a4b5-f3347993f1f5\",\"name\":\"Multiply\",\"type\":{\"moduleId\":\"grape.nodes.basic\",\"version\":\"0.1.0\",\"fingerprint\":\"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\",\"typeId\":\"multiply\"},\"state\":{},\"inputValues\":{\"a\":1,\"b\":2},\"ports\":[{\"key\":\"a\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"b\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":2},{\"key\":\"result\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"references\":[],\"referencesComplete\":true,\"position\":[264,96],\"extensions\":{}}],\"edges\":[{\"id\":\"393f63f8-95ad-4e4a-8982-434bf9f9682d\",\"from\":{\"nodeId\":\"fb3f5375-0679-4ad1-b68b-64c51c20f880\",\"portKey\":\"27ab3db0-22b5-4dee-8338-b937b95268b0\"},\"to\":{\"nodeId\":\"268c816a-e66b-4069-a4b5-f3347993f1f5\",\"portKey\":\"a\"},\"adaptation\":{\"schema\":\"grape.edge-adaptation\",\"version\":1,\"sourceType\":\"glsl.float\",\"targetType\":\"glsl.float\",\"operation\":\"identity\",\"extensions\":{}},\"extensions\":{}},{\"id\":\"b4ac5488-1bd8-4a65-a8ad-fb41875726d1\",\"from\":{\"nodeId\":\"268c816a-e66b-4069-a4b5-f3347993f1f5\",\"portKey\":\"result\"},\"to\":{\"nodeId\":\"8a1851e4-2dac-4f14-a884-d1759bd881fb\",\"portKey\":\"2716fb6d-fff0-448e-99f2-8a66629794cb\"},\"adaptation\":{\"schema\":\"grape.edge-adaptation\",\"version\":1,\"sourceType\":\"glsl.float\",\"targetType\":\"glsl.float\",\"operation\":\"identity\",\"extensions\":{}},\"extensions\":{}}],\"extensions\":{}},\"interface\":[{\"key\":\"27ab3db0-22b5-4dee-8338-b937b95268b0\",\"name\":\"Input 1\",\"direction\":\"input\",\"type\":\"glsl.float\",\"supply\":\"local\",\"defaultValue\":1},{\"key\":\"2716fb6d-fff0-448e-99f2-8a66629794cb\",\"name\":\"Output 1\",\"direction\":\"output\",\"type\":\"glsl.float\"}],\"dependencies\":[],\"emissionMode\":\"expand\"},\"references\":[],\"referencesComplete\":true,\"extensions\":{}}]}"
              - button "Copy selection" [ref=e108] [cursor=pointer]
              - button "Paste selection" [ref=e109] [cursor=pointer]
            - group [ref=e110]:
              - generic "Structures" [ref=e111] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=e112]:
            - button "Vertex" [ref=e113] [cursor=pointer]
            - button "Pixel" [pressed] [ref=e114] [cursor=pointer]
          - generic [ref=e115]:
            - button "Add Node" [ref=e116] [cursor=pointer]
            - button "Browse nodes" [ref=e119] [cursor=pointer]
            - button "Up" [disabled] [ref=e122]
            - button "Shortcuts" [ref=e125] [cursor=pointer]
      - generic [ref=e128]:
        - generic: Canvas 2
        - generic "Shader graph canvas" [ref=e129]:
          - generic:
            - generic:
              - img:
                - generic "Edge 393f63f8-95ad-4e4a-8982-434bf9f9682d" [ref=e130]
                - generic "Edge b4ac5488-1bd8-4a65-a8ad-fb41875726d1" [ref=e131]
              - generic:
                - group "Inputs" [ref=e132]:
                  - heading "Inputs" [level=3] [ref=e133]
                  - button "Create input port from selection" [ref=e134] [cursor=pointer]
                  - generic [ref=e135]:
                    - button "Inputs output Input 1" [ref=e136] [cursor=pointer]
                    - generic [ref=e137]: Input 1
                    - generic [ref=e138]: float
                - group "Outputs" [ref=e139]:
                  - heading "Outputs" [level=3] [ref=e140]
                  - button "Create output port from selection" [ref=e141] [cursor=pointer]
                  - generic [ref=e142]:
                    - button "Outputs input Output 1" [ref=e143] [cursor=pointer]
                    - generic [ref=e144]: Output 1
                    - generic [ref=e145]: float
                - group "Multiply" [ref=e146]:
                  - heading "Multiply" [level=3] [ref=e147]
                  - generic [ref=e148]:
                    - button "Multiply input a" [ref=e149] [cursor=pointer]
                    - generic [ref=e150]: a
                    - generic [ref=e151]: float
                  - generic [ref=e152]:
                    - button "Multiply input b" [ref=e153] [cursor=pointer]
                    - generic [ref=e154]: b
                    - generic [ref=e155]: float
                    - generic "Current local value; edit in Inspector" [ref=e156]: "2"
                  - generic [ref=e157]:
                    - button "Multiply output result" [ref=e158] [cursor=pointer]
                    - generic [ref=e159]: result
                    - generic [ref=e160]: float
          - generic:
            - button "Untitled shader / pixel" [ref=e161] [cursor=pointer]
            - button "Subgraph" [disabled]
          - generic [ref=e162]:
            - button "New subgraph" [ref=e163] [cursor=pointer]
            - button "Library subgraph" [ref=e164] [cursor=pointer]
            - button "Encapsulate" [ref=e165] [cursor=pointer]
            - button "Make independent" [ref=e166] [cursor=pointer]
            - button "Enter subgraph" [ref=e167] [cursor=pointer]
            - button "Arrange nodes" [ref=e168] [cursor=pointer]
            - button "Frame selection" [ref=e169] [cursor=pointer]
            - group [ref=e170]:
              - generic "Subgraph interface" [ref=e171] [cursor=pointer]
              - option "Expand" [selected]
              - option "Function"
              - option "input" [selected]
              - option "output"
            - group [ref=e172]:
              - generic "Local clipboard" [ref=e173] [cursor=pointer]
            - group [ref=e174]:
              - generic "Structures" [ref=e175] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=e176]:
            - button "Vertex" [ref=e177] [cursor=pointer]
            - button "Pixel" [pressed] [ref=e178] [cursor=pointer]
          - generic [ref=e179]:
            - button "Add Node" [ref=e180] [cursor=pointer]
            - button "Browse nodes" [ref=e183] [cursor=pointer]
            - button "Up" [ref=e186] [cursor=pointer]
            - button "Shortcuts" [ref=e189] [cursor=pointer]
    - complementary [ref=e192]:
      - generic [ref=e193]:
        - heading "Inspector" [level=2] [ref=e194]
        - paragraph [ref=e195]: Select a node to inspect its parameters.
  - contentinfo [ref=e196]:
    - button "Project actions" [ref=e197] [cursor=pointer]
    - status [ref=e198]:
      - button "Read full application status" [ref=e199] [cursor=pointer]: Export started. Saved status is unchanged.
    - button "Shader output" [ref=e200] [cursor=pointer]
    - button "Hints" [ref=e201] [cursor=pointer]
```

# Test source

```ts
  3   | import path from "node:path";
  4   | import { createNode } from "./create-node.ts";
  5   | import { clickAction } from "../fixtures/public-actions.ts";
  6   | const out=process.env.GRAPE_EVIDENCE_DIR!;
  7   | const save=(n:string,v:unknown)=>fs.writeFileSync(path.join(out,n+'.json'),JSON.stringify(v,null,2)+'\n');
  8   | const dialog=(p:Page)=>p.getByRole('dialog',{name:'Object information',exact:true});
  9   | async function doc(p:Page){const d=p.waitForEvent('download');await clickAction(p,'Export JSON');return JSON.parse(fs.readFileSync((await(await d).path())!,'utf8'));}
  10  | async function focus(p:Page,t:Locator){for(let i=0;i<180;i++){if(await t.evaluate(e=>e===document.activeElement))return;await p.keyboard.press('Shift+Tab');}throw Error('Trusted Tab target unavailable');}
  11  | async function read(p:Page,t:Locator){await focus(p,t);await p.keyboard.press('F2');await expect(dialog(p)).toBeVisible();return dialog(p).getByRole('region').innerText();}
  12  | async function close(p:Page,t:Locator){await p.keyboard.press('Escape');await expect(dialog(p)).not.toBeVisible();await expect(t).toBeFocused();}
  13  | async function fixture(p:Page){await createNode(p,'Color RGBA');const c=p.locator('.canvas').last(),n=c.locator('article.node').filter({has:p.getByRole('heading',{name:'Color RGBA',exact:true})});await n.locator('[data-direction="output"]').click();await c.locator('[data-direction="input"][data-port="color"]').click();return{c,n};}
  14  | test.beforeEach(async({page})=>{page.on('dialog',d=>d.accept());await page.goto('/');});
  15  | test('S06 F2-only all built-in readonly kinds and ordinary hints preserve document selection History Redo',async({page})=>{
  16  |  const {c,n}=await fixture(page),before=await doc(page),selection=await c.getAttribute('data-selection'),records=[];
  17  |  await expect(page.getByRole('button',{name:'Read object details',exact:true})).toHaveCount(0);await expect(page.getByRole('checkbox',{name:/Show object information/})).toHaveCount(0);await expect(page.getByRole('button',{name:'Experimental features',exact:true})).toHaveCount(0);
  18  |  await expect(c.getByRole('button',{name:'Add Node',exact:true})).toHaveAttribute('title',/Tab/);
  19  |  for(const[k,t]of [['Node',n],['Port',n.locator('[data-direction="output"]')],['Edge',c.locator('.wires path').first()],['Panel',c],['UI control',page.getByRole('button',{name:'Generate GLSL',exact:true})]]as const){const text=await read(page,t);expect(text).toContain(k+':');expect(text).not.toMatch(/editToken|TargetLease|MountTicket|"lease"/);if(k==='UI control')expect(text).toContain('未提供');records.push({kind:k,text});await close(page,t);}
  20  |  expect(await c.getAttribute('data-selection')).toBe(selection);expect(await doc(page)).toEqual(before);
  21  |  await n.getByRole('heading').click();const r=page.getByRole('textbox',{name:'R',exact:true});const text=await read(page,r);expect(text).toContain('Parameter Widget:');expect(text).toContain('"committed"');await close(page,r);
  22  |  await clickAction(page,'Undo');const undone=await doc(page);await read(page,n);await close(page,n);await clickAction(page,'Redo');expect(await doc(page)).toEqual(before);expect(undone.graph.stages.find((s:any)=>s.key==='pixel').network.edges).toHaveLength(0);save('f2-kinds',records);
  23  | });
  24  | for(const stored of ['true','false','{broken}','denied'])test('S06 F2 ignores obsolete preference '+stored,async({page})=>{
  25  |  await page.addInitScript(value=>{localStorage.setItem('other-app','retain');localStorage.setItem('grape.preferences.hover.v1',value);(window as any).__preferenceCalls=[];for(const method of ['getItem','setItem','removeItem']as const){const original=Storage.prototype[method];(Storage.prototype as any)[method]=function(k:string,...args:any[]){if(k==='grape.preferences.hover.v1'){(window as any).__preferenceCalls.push(method);if(value==='denied')throw new DOMException('Denied','SecurityError');}return(original as any).call(this,k,...args);};}},stored);await page.reload();const button=page.getByRole('button',{name:'Generate GLSL',exact:true});expect(await read(page,button)).toContain('UI control: Generate GLSL');await close(page,button);expect(await page.evaluate(()=>(window as any).__preferenceCalls)).toEqual([]);expect(await page.evaluate(()=>localStorage.getItem('other-app'))).toBe('retain');save('ignored-pref-'+stored.replace(/\W/g,''),{stored,inspectionStorageCalls:0});
  26  | });
  27  | test('S06 F2 scalar vector draft and multifield IME guards preserve current text',async({page})=>{
  28  |  await createNode(page,'Multiply');await page.getByRole('heading',{name:'Multiply',exact:true}).click();const before=await doc(page),a=page.getByRole('textbox',{name:'A',exact:true}),b=page.getByRole('textbox',{name:'B',exact:true});await a.fill('7.25');await b.fill('2.5');await b.dispatchEvent('compositionstart');await page.keyboard.press('F2');await expect(dialog(page)).not.toBeVisible();await expect(b).toBeFocused();await expect(a).toHaveValue('7.25');await b.dispatchEvent('compositionend');const scalar=await read(page,a);expect(scalar).toContain('"text": "7.25"');expect(scalar).toContain('"value": 1');await close(page,a);await a.press('Escape');await b.press('Escape');expect(await doc(page)).toEqual(before);
  29  |  await createNode(page,'Color RGBA');await page.getByRole('heading',{name:'Color RGBA',exact:true}).click();const r=page.getByRole('textbox',{name:'R',exact:true});await r.fill('0.37');const vector=await read(page,r);expect(vector).toContain('"componentTexts"');expect(vector).toContain('0.37');await close(page,r);await r.press('Escape');save('f2-drafts',{scalar,vector,IME:'Synthetic composition boundary; actual typing/keyboard/focus. Not physical IME qualification.'});
  30  | });
  31  | test('S06 F2 stage deletion Undo same-ID document reopen discards old target',async({page})=>{
  32  |  const{c,n}=await fixture(page),original=await doc(page),id=await n.getAttribute('data-node');expect(await read(page,n)).toContain(id!);await close(page,n);await c.getByRole('button',{name:'Vertex',exact:true}).click();await expect(n).toHaveCount(0);await page.keyboard.press('F2');await expect(dialog(page)).not.toContainText(id!);if(await dialog(page).isVisible())await page.keyboard.press('Escape');await c.getByRole('button',{name:'Pixel',exact:true}).click();await n.getByRole('heading').click();await clickAction(page,'Delete selected');await expect(n).toHaveCount(0);await clickAction(page,'Undo');const old=await n.elementHandle();await page.getByLabel('Open document file').setInputFiles({name:'same-id.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(original))});await page.getByRole('button',{name:'Open in new session',exact:true}).click();expect(await old!.evaluate(e=>e.isConnected)).toBe(false);const fresh=page.locator('article[data-node="'+id+'"]');expect(await read(page,fresh)).toContain(id!);await close(page,fresh);expect(await doc(page)).toEqual(original);save('f2-public-lifetime',{id,newLoad:true,oldElementDisconnected:true});
  33  | });
  34  | test('S06 F2 pending wire held drag readonly and natural Escape remain guarded',async({page})=>{
  35  |  const{n}=await fixture(page),before=await doc(page);await n.locator('[data-direction="output"]').click();await page.keyboard.press('F2');await expect(dialog(page)).not.toBeVisible();await page.keyboard.press('Escape');await clickAction(page,'Lock editing');expect(await read(page,n)).toContain('Node:');await close(page,n);await n.getByRole('heading').click();const r=page.getByRole('textbox',{name:'R',exact:true});expect(await read(page,r)).toContain('Read-only');await close(page,r);await clickAction(page,'Lock editing');const b=(await n.getByRole('heading').boundingBox())!;await page.mouse.move(b.x+20,b.y+10);await page.mouse.down();await page.mouse.move(b.x+60,b.y+40,{steps:5});await page.keyboard.press('F2');await expect(dialog(page)).not.toBeVisible();await page.keyboard.press('Escape');await page.mouse.up();expect(await doc(page)).toEqual(before);save('f2-gesture',{pendingBlocked:true,heldMouseBlocked:true,readonlyReadable:true,naturalEscape:true});
  36  | });
  37  | test('S06 F2 no inspection serialization or clone during 80 trusted pointer moves or focus navigation',async({page})=>{
  38  |  const{n}=await fixture(page);await focus(page,n);await page.evaluate(()=>{const c=structuredClone,s=JSON.stringify;(window as any).__counts={clone:0,stringify:0};window.structuredClone=(...a)=>{(window as any).__counts.clone++;return c(...a);};JSON.stringify=((...a:any[])=>{(window as any).__counts.stringify++;return(s as any)(...a);})as typeof JSON.stringify;});const b=(await n.boundingBox())!;for(let i=0;i<80;i++)await page.mouse.move(b.x+20+i%50,b.y+15);expect(await page.evaluate(()=>(window as any).__counts)).toEqual({clone:0,stringify:0});await page.keyboard.press('F2');await expect(dialog(page)).toBeVisible();const counts=await page.evaluate(()=>(window as any).__counts);expect(counts.stringify).toBe(1);save('f2-on-demand-counts',{moves:80,before:{clone:0,stringify:0},after:counts,limits:'Instrumented disposable browser, not universal performance guarantee.'});
  39  | });
  40  | test('S06 F2 complete long data narrow keyboard close and unchanged geometry',async({page})=>{
  41  |  const{n}=await fixture(page),before=await doc(page),bounds=await n.boundingBox();await read(page,n);await page.setViewportSize({width:620,height:380});const text=dialog(page).getByRole('region');await page.keyboard.press('Control+End');await page.keyboard.press('End');await expect.poll(()=>text.evaluate(e=>e.scrollHeight-e.clientHeight-e.scrollTop)).toBeLessThanOrEqual(1);const facts=await text.evaluate(e=>({width:e.clientWidth,scrollWidth:e.scrollWidth,height:e.clientHeight,scrollHeight:e.scrollHeight,text:e.textContent}));expect(facts.scrollWidth).toBeLessThanOrEqual(facts.width+1);await page.screenshot({path:path.join(out,'f2-narrow.png')});await close(page,n);await page.setViewportSize({width:1440,height:1000});expect(await n.boundingBox()).toEqual(bounds);expect(await doc(page)).toEqual(before);save('f2-long-data',facts);
  42  | });
  43  | test('S06 F2 busy Save acknowledgement does not intercept or corrupt save',async({page})=>{
  44  |  await fixture(page);const before=await doc(page);await page.evaluate(()=>{const d=Object.getOwnPropertyDescriptor(IDBTransaction.prototype,'oncomplete')!;Object.defineProperty(IDBTransaction.prototype,'oncomplete',{...d,set(handler){d.set!.call(this,function(this:IDBTransaction,event:Event){(window as any).releaseSave=()=>handler.call(this,event);});}});});await clickAction(page,'Save');await expect(page.locator('#save-state')).toHaveText('Saving…');await page.keyboard.press('F2');await expect(dialog(page)).not.toBeVisible();await page.waitForFunction(()=>typeof(window as any).releaseSave==='function');await page.evaluate(()=>(window as any).releaseSave());await expect(page.locator('#save-state')).not.toHaveText('Saving…');expect(await doc(page)).toEqual(before);save('f2-save-ack',{injectedStorageDelay:true,F2Blocked:true,saveCompleted:true});
  45  | });
  46  | 
  47  | test("S06 debug target follows nested occurrence and independent Canvas navigation", async ({
  48  |   page,
  49  | }) => {
  50  | 
  51  |   for (const name of ["Float", "Multiply", "Compose"])
  52  |     await createNode(page, name);
  53  |   // Keep this multi-port fixture clear of the existing output before connecting.
  54  |   const composeBox = (await page
  55  |     .getByRole("heading", { name: "Compose", exact: true })
  56  |     .boundingBox())!;
  57  |   await page.mouse.move(composeBox.x + 40, composeBox.y + 10);
  58  |   await page.mouse.down();
  59  |   await page.mouse.move(composeBox.x + 40, composeBox.y + 235, { steps: 10 });
  60  |   await page.mouse.up();
  61  |   for (const [a, b] of [
  62  |     ["Float output value", "Multiply input a"],
  63  |     ["Multiply output result", "Compose input x"],
  64  |     ["Compose output result", "Image output input color"],
  65  |   ]) {
  66  |     await page.getByRole("button", { name: a, exact: true }).click();
  67  |     await page.getByRole("button", { name: b, exact: true }).click();
  68  |   }
  69  |   const first = page.locator(".canvas").first();
  70  |   await first.getByRole("heading", { name: "Multiply", exact: true }).click();
  71  |   await clickAction(page, "Encapsulate");
  72  |   await page.getByText("Local clipboard", { exact: true }).click();
  73  |   await page
  74  |     .getByRole("button", { name: "Copy selection", exact: true })
  75  |     .click();
  76  |   await page
  77  |     .getByRole("button", { name: "Paste selection", exact: true })
  78  |     .click();
  79  |   await clickAction(page, "Second Canvas");
  80  |   const second = page.locator(".canvas").nth(1);
  81  |   await first.locator('article[aria-label="Subgraph"] h3').click();
  82  |   await first
  83  |     .getByRole("button", { name: "Enter subgraph", exact: true })
  84  |     .click();
  85  |   await second.locator('article[aria-label="Subgraph 2"] h3').click();
  86  |   await second
  87  |     .getByRole("button", { name: "Enter subgraph", exact: true })
  88  |     .click();
  89  |   const before = await doc(page),
  90  |     records = [];
  91  |   for (const c of [first, second]) {
  92  |     const target = c.locator("article").filter({has: page.getByRole("heading", {name:"Multiply",exact:true})});
  93  |     const text = await read(page,target);
  94  |     expect(text).toContain('"occurrence"');
  95  |     records.push(text);
  96  |     await close(page,target);
  97  |   }
  98  |   expect(records[0]).not.toEqual(records[1]);
  99  |   await first.getByRole("button", { name: "Up", exact: true }).click();
  100 |   await expect(first).toHaveAttribute("data-path", "");
  101 |   await expect(second).toHaveAttribute("data-path", /.+/);
  102 |   await expect(dialog(page)).not.toBeVisible();
> 103 |   expect(await documentJSON(page)).toEqual(before);
      |          ^ ReferenceError: documentJSON is not defined
  104 |   save("nested-occurrences", records);
  105 | });
  106 | 
```