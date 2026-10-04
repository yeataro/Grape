# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-owner-corrections.spec.ts >> OC03 physical output drop single click commits captured graph coordinate under pan zoom and moved menu
- Location: ..\..\..\production\tests\browser\s06-owner-corrections.spec.ts:6:1

# Error details

```
Error: expect(received).toBeCloseTo(expected, precision)

Expected: 571.7537613013579
Received: 571.7562020210858

Expected precision:    4
Expected difference: < 0.00005
Received difference:   0.0024407197278151216
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
    - generic [ref=e33]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e34]:
        - generic:
          - generic:
            - img:
              - generic "Edge 3f672899-bc55-40fd-af0c-edcb6ed0bf0e" [ref=e35]
            - generic:
              - group "Image output" [ref=e36]:
                - heading "Image output" [level=3] [ref=e37]
                - generic [ref=e38]:
                  - button "Image output input color" [ref=e39] [cursor=pointer]
                  - generic [ref=e40]: color
                  - generic [ref=e41]: vec4
                  - generic "Current local value; edit in Inspector" [ref=e42]: "[0,0,0,0]"
              - group "Color RGBA" [ref=e43]:
                - heading "Color RGBA" [level=3] [ref=e44]
                - generic [ref=e45]:
                  - button "Color RGBA output out" [ref=e46] [cursor=pointer]
                  - generic [ref=e47]: out
                  - generic [ref=e48]: vec4
              - group "Multiply" [ref=e49]:
                - heading "Multiply" [level=3] [ref=e50]
                - generic [ref=e51]:
                  - button "Multiply input a" [ref=e52] [cursor=pointer]
                  - generic [ref=e53]: a
                  - generic [ref=e54]: float
                - generic [ref=e55]:
                  - button "Multiply input b" [ref=e56] [cursor=pointer]
                  - generic [ref=e57]: b
                  - generic [ref=e58]: float
                  - generic "Current local value; edit in Inspector" [ref=e59]: "2"
                - generic [ref=e60]:
                  - button "Multiply output result" [ref=e61] [cursor=pointer]
                  - generic [ref=e62]: result
                  - generic [ref=e63]: float
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e64]:
          - button "New subgraph" [ref=e65] [cursor=pointer]
          - button "Library subgraph" [ref=e66] [cursor=pointer]
          - button "Encapsulate" [ref=e67] [cursor=pointer]
          - button "Make independent" [ref=e68] [cursor=pointer]
          - button "Enter subgraph" [ref=e69] [cursor=pointer]
          - button "Arrange nodes" [ref=e70] [cursor=pointer]
          - button "Frame selection" [ref=e71] [cursor=pointer]
          - group [ref=e72]:
            - generic "Local clipboard" [ref=e73] [cursor=pointer]
          - group [ref=e74]:
            - generic "Structures" [ref=e75] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e76]:
          - button "Vertex" [ref=e77] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e78] [cursor=pointer]
        - generic [ref=e79]:
          - button "Add Node" [ref=e80] [cursor=pointer]
          - button "Browse nodes" [ref=e83] [cursor=pointer]
          - button "Up" [disabled] [ref=e86]
          - button "Shortcuts" [ref=e89] [cursor=pointer]
    - complementary [ref=e92]:
      - generic [ref=e93]:
        - heading "Inspector" [level=2] [ref=e94]
        - paragraph [ref=e95]: Multiply
        - button "Rename node" [ref=e96] [cursor=pointer]
        - generic [ref=e97]:
          - generic [ref=e99]:
            - generic [ref=e100]: A
            - textbox "A" [ref=e101]: "1"
            - alert [ref=e102]: Connected input — local value retained.
          - generic [ref=e104]:
            - generic [ref=e105]: B
            - textbox "B" [ref=e106]: "2"
            - alert
        - generic [ref=e108]:
          - text: From Color RGBA
          - button "Disconnect" [ref=e109] [cursor=pointer]
  - contentinfo [ref=e110]:
    - button "Project actions" [active] [ref=e111] [cursor=pointer]
    - status [ref=e112]:
      - button "Read full application status" [ref=e113] [cursor=pointer]: Export started. Saved status is unchanged.
    - button "Shader output" [ref=e114] [cursor=pointer]
    - button "Hints" [ref=e115] [cursor=pointer]
```

# Test source

```ts
  1  | import{test,expect,type Page,type Locator}from '@playwright/test';import fs from 'node:fs';import path from 'node:path';import{createNode}from './create-node.ts';import{clickAction}from '../fixtures/public-actions.ts';import{requiredOutput}from '../fixtures/required-output.ts';
  2  | const save=(n:string,v:unknown)=>fs.writeFileSync(path.join(process.env.GRAPE_EVIDENCE_DIR!,n+'.json'),JSON.stringify(v,null,2)+'\n');async function doc(p:Page){const d=p.waitForEvent('download');await clickAction(p,'Export JSON');return JSON.parse(fs.readFileSync((await(await d).path())!,'utf8'))}const net=(d:any)=>d.graph.stages.find((s:any)=>s.key==='pixel').network;async function center(l:Locator){const r=(await l.boundingBox())!;return{x:r.x+r.width/2,y:r.y+r.height/2}}async function drag(p:Page,a:Locator,b:{x:number;y:number}){const start=await center(a);await p.mouse.move(start.x,start.y);await p.mouse.down();await p.mouse.move(b.x,b.y,{steps:30});await p.mouse.up()}async function blank(c:Locator){const r=(await c.boundingBox())!;return{x:r.x+r.width*.65,y:r.y+r.height*.75}}async function focus(p:Page,t:Locator){for(let i=0;i<180;i++){if(await t.evaluate(e=>e===document.activeElement))return;await p.keyboard.press('Shift+Tab')}throw Error('No trusted Tab target')}
  3  | async function shader(p:Page){await clickAction(p,'Generate GLSL');await p.getByRole('button',{name:'Shader output',exact:true}).click();const t=await p.locator('#code pre').innerText();await p.keyboard.press('Escape');return t}async function pixels(p:Page,text:string){return p.evaluate(text=>{const gl=document.createElement('canvas').getContext('webgl2',{premultipliedAlpha:false,antialias:false})!;if(!gl)throw Error('WEBGL2_UNAVAILABLE');const program=gl.createProgram()!;for(const [key,kind]of [['vertex',gl.VERTEX_SHADER],['pixel',gl.FRAGMENT_SHADER]]as const){const code=text.split('// '+key+'\n')[1].split('// pixel')[0];const sh=gl.createShader(kind)!;gl.shaderSource(sh,code);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh)!);gl.attachShader(program,sh)}gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program)!);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.viewport(0,0,1,1);gl.drawArrays(gl.TRIANGLES,0,3);const p=new Uint8Array(4);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,p);return{pixel:[...p],renderer:gl.getParameter(gl.RENDERER),version:gl.getParameter(gl.VERSION)}} ,text)}
  4  | test.beforeEach(async({page})=>{page.on('dialog',d=>d.accept());await page.setViewportSize({width:1440,height:1000});await page.goto('/')});
  5  | test('OC01 new empty zero-alpha shader and old exact public import explicit upgrade save reopen',async({page})=>{const initial=await doc(page);expect(initial.graph.kind.version).toBe('0.3.0');const compiled=await shader(page),result=await pixels(page,compiled);expect(result.pixel).toEqual([0,0,0,0]);await requiredOutput(page);const old=await doc(page);expect(old.graph.kind.version).toBe('0.2.0');await clickAction(page,'Generate GLSL');await expect(page.locator('#message')).toContainText('INPUT_REQUIRED');await clickAction(page,'Save');await clickAction(page,'Upgrade Image Output');const after=await doc(page);expect(after.graph.kind.version).toBe('0.3.0');expect(net(after).nodes.map((n:any)=>n.id)).toEqual(net(old).nodes.map((n:any)=>n.id));expect(net(after).edges).toEqual(net(old).edges);expect((await pixels(page,await shader(page))).pixel).toEqual([0,0,0,0]);await clickAction(page,'Save');await clickAction(page,'Open saved');await page.locator('#saved-list button').first().click();expect((await doc(page)).graph).toEqual(after.graph);save('oc01-zero-upgrade',{initial,old,after,compiled,result});});
> 6  | test('OC03 physical output drop single click commits captured graph coordinate under pan zoom and moved menu',async({page})=>{await createNode(page,'Color RGBA');const c=page.locator('.canvas'),out=c.locator('[data-direction=output]');await c.getByRole('heading',{name:'Color RGBA',exact:true}).click();await page.keyboard.press('h');const b=await blank(c);await page.mouse.move(b.x,b.y);await page.mouse.wheel(0,160);const point=await blank(c),before=await doc(page),expected=await c.evaluate((el,p)=>{const r=el.getBoundingClientRect(),m=new DOMMatrix(getComputedStyle(el.querySelector('.viewport')!).transform);return[(p.x-r.left-m.e)/m.a,(p.y-r.top-m.f)/m.d]},point);await drag(page,out,point);const menu=c.getByRole('dialog',{name:'Node catalog'});await expect(menu).toBeVisible();await menu.getByLabel('Search nodes',{exact:true}).fill('Multiply');const label=menu.getByRole('button',{name:'Create Multiply',exact:true});await label.click();await expect(menu).toBeHidden();await expect(c.locator('.creation-preview')).toBeHidden();const after=await doc(page),made=net(after).nodes.find((n:any)=>!net(before).nodes.some((x:any)=>x.id===n.id));expect(made.position[0]).toBeCloseTo(expected[0],4);expect(made.position[1]).toBeCloseTo(expected[1],4);expect(net(after).edges).toHaveLength(1);await clickAction(page,'Undo');expect(await doc(page)).toEqual(before);await clickAction(page,'Redo');expect(await doc(page)).toEqual(after);save('oc03-single-click',{point,expected,before,after});});
     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      ^ Error: expect(received).toBeCloseTo(expected, precision)
  7  | test('OC04 connected input empty release disconnects once; Escape outside readonly and cancel preserve',async({page})=>{await createNode(page,'Color RGBA');const c=page.locator('.canvas'),out=c.locator('[data-direction=output]'),input=c.locator('[data-port=color]');await out.click();await input.click();const before=await doc(page),b=await blank(c);await drag(page,input,b);await expect(c.getByRole('dialog',{name:'Node catalog'})).toBeHidden();const after=await doc(page);expect(net(after).edges).toHaveLength(0);await clickAction(page,'Undo');expect(await doc(page)).toEqual(before);await clickAction(page,'Redo');expect(await doc(page)).toEqual(after);await clickAction(page,'Undo');for(const route of ['escape','outside','cancel']){const a=await center(input);await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:20});if(route==='escape')await page.keyboard.press('Escape');if(route==='outside')await page.mouse.move(1430,10);if(route==='cancel')await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.mouse.up();expect(await doc(page)).toEqual(before)}await clickAction(page,'Lock editing');await drag(page,input,b);expect(await doc(page)).toEqual(before);await clickAction(page,'Lock editing');save('oc04-disconnect',{before,after,synthetic:'cancel uses window blur; other routes trusted mouse/key'});});
  8  | test('OC05 default replaces without Shift; ordinary hover purple and target feedback share geometry',async({page})=>{await createNode(page,'Color RGBA');await createNode(page,'Vector 3');const c=page.locator('.canvas'),outs=c.locator('[data-direction=output]'),input=c.locator('[data-port=color]');await outs.nth(0).click();await input.click();const before=await doc(page);await outs.nth(1).click();const target=await center(input);await page.mouse.move(target.x,target.y,{steps:30});const feedback=await input.evaluate(el=>({body:getComputedStyle(el.querySelector('.socket')!).backgroundColor,shadow:getComputedStyle(el.querySelector('.socket')!).boxShadow,rect:el.getBoundingClientRect().toJSON(),preview:document.querySelector('.connection-preview path')?.getAttribute('d')}));await input.click();const after=await doc(page);expect(net(after).edges).toHaveLength(1);expect(net(after).edges[0].from.nodeId).not.toBe(net(before).edges[0].from.nodeId);expect(feedback.shadow).toContain('170, 132, 214');expect(await input.evaluate(e=>e.className)).not.toContain('replace');await clickAction(page,'Undo');expect(await doc(page)).toEqual(before);await clickAction(page,'Redo');expect(await doc(page)).toEqual(after);save('oc05-replace-feedback',{before,after,feedback,wire:await c.locator('.wires path').getAttribute('d')});});
  9  | for(const width of [620,1440,1920])test(`OC02 footer fills viewport ${width} and disclosures preserve graph`,async({page})=>{await page.setViewportSize({width,height:width===620?650:1000});const before=await doc(page);const geometry=await page.evaluate(()=>({footer:document.querySelector('footer')!.getBoundingClientRect().toJSON(),main:document.querySelector('main')!.getBoundingClientRect().toJSON(),width:innerWidth,height:innerHeight,scroll:document.documentElement.scrollHeight}));expect(geometry.footer.x).toBe(0);expect(geometry.footer.width).toBe(width);expect(geometry.footer.bottom).toBe(geometry.height);expect(geometry.main.bottom).toBe(geometry.footer.y);expect(geometry.scroll).toBe(geometry.height);await page.screenshot({path:path.join(process.env.GRAPE_EVIDENCE_DIR!,`footer-${width}.png`)});for(const name of ['Shader output','Hints','Project actions']){await page.getByRole('button',{name,exact:true}).click();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name,exact:true})).toBeFocused()}expect(await doc(page)).toEqual(before);save('oc02-footer-'+width,geometry)});
  10 | test('OC10 F2 captures once before modal with live keyboard focus over different hovered target',async({page})=>{await createNode(page,'Color RGBA');await createNode(page,'Multiply');const n=page.locator('.node').filter({has:page.getByRole('heading',{name:'Color RGBA',exact:true})}),other=page.getByRole('heading',{name:'Multiply',exact:true});await focus(page,n);await other.hover();const before=await doc(page);await focus(page,n);await other.hover();await page.keyboard.press('F2');const d=page.getByRole('dialog',{name:'Object information',exact:true});await expect(d).toContainText('Node: Color RGBA');await expect(d).not.toContainText('Panel: Canvas');const text=await d.innerText();await page.mouse.move(10,10,{steps:30});expect(await d.innerText()).toEqual(text);await page.keyboard.press('Escape');await expect(n).toBeFocused();expect(await doc(page)).toEqual(before);save('oc10-target-captured',{text,policy:'live keyboard focus, no global hover target'});});
  11 | 
```