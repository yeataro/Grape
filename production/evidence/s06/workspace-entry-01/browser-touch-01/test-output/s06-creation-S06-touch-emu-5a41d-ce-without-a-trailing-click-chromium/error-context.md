# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-creation.spec.ts >> S06 touch emulation: blank double-tap, row inspect and plus drag insert once without a trailing click
- Location: ..\..\..\production\tests\browser\s06-creation.spec.ts:44:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.nodes .node')
Expected: 2
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('.nodes .node')
    14 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - text: Grape
      - generic [ref=e9]: SHADER WORKSPACE
    - navigation "Document actions" [ref=e10]:
      - generic [ref=e11]:
        - button "New document" [ref=e12] [cursor=pointer]
        - button "Save" [ref=e15] [cursor=pointer]
        - button "Open saved" [ref=e18] [cursor=pointer]
        - button "Export JSON" [ref=e21] [cursor=pointer]
        - button "Export PNG" [ref=e24] [cursor=pointer]
        - button "Open file" [ref=e27] [cursor=pointer]
      - generic [ref=e30]:
        - button "Generate GLSL" [ref=e31] [cursor=pointer]
        - button "Second Canvas" [ref=e34] [cursor=pointer]
        - button "Lock editing" [ref=e37] [cursor=pointer]
      - group [ref=e40]:
        - generic "More actions" [ref=e41] [cursor=pointer]
    - generic [ref=e43]:
      - generic [ref=e44]: Unsaved changes
      - generic [ref=e45]: Host-free
  - status [ref=e46]
  - generic [ref=e48]:
    - button "Undo" [disabled] [ref=e49]
    - button "Redo" [disabled] [ref=e52]
    - button "Delete selected" [ref=e55] [cursor=pointer]
    - alert
  - main [ref=e56]:
    - generic [ref=e58]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e59]:
        - group "Image output" [ref=e60]:
          - heading "Image output" [level=3] [ref=e61]
          - generic [ref=e62]:
            - button "Image output input color" [ref=e63] [cursor=pointer]:
              - generic [ref=e65]: color
            - generic [ref=e66]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e67]:
          - button "New subgraph" [ref=e68] [cursor=pointer]
          - button "Library subgraph" [ref=e69] [cursor=pointer]
          - button "Encapsulate" [ref=e70] [cursor=pointer]
          - button "Make independent" [ref=e71] [cursor=pointer]
          - button "Enter subgraph" [ref=e72] [cursor=pointer]
          - button "Arrange nodes" [ref=e73] [cursor=pointer]
          - button "Frame selection" [ref=e74] [cursor=pointer]
          - group [ref=e75]:
            - generic "Local clipboard" [ref=e76] [cursor=pointer]
          - group [ref=e77]:
            - generic "Structures" [ref=e78] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e79]:
          - button "Vertex" [ref=e80] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e81] [cursor=pointer]
        - generic [ref=e82]:
          - button "Add Node" [ref=e83] [cursor=pointer]
          - button "Browse nodes" [ref=e86] [cursor=pointer]
          - button "Up" [disabled] [ref=e89]
          - button "Shortcuts" [ref=e92] [cursor=pointer]
    - complementary [ref=e95]:
      - generic [ref=e96]:
        - heading "Inspector" [level=2] [ref=e97]
        - paragraph [ref=e98]: Select a node to inspect its parameters.
  - generic [ref=e100]:
    - heading "Shader output" [level=2] [ref=e101]
    - paragraph [ref=e102]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e103]:
      - listitem [ref=e104]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e105] [cursor=pointer]
  - contentinfo [ref=e106]:
    - generic [ref=e107]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e108]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  1  | import {test,expect,type Page} from '@playwright/test';
  2  | import fs from 'node:fs';import path from 'node:path';
  3  | import {createNode} from './create-node.ts';
  4  | import {clickAction} from '../fixtures/public-actions.ts';
  5  | const evidence=process.env.GRAPE_EVIDENCE_DIR!;
  6  | async function doc(page:Page){const wait=page.waitForEvent('download');await clickAction(page,'Export JSON');return JSON.parse(fs.readFileSync((await (await wait).path())!,'utf8'));}
  7  | const network=(d:any)=>d.graph.stages.find((s:any)=>s.key==='pixel').network;
  8  | async function choose(page:Page,label:string,browse=false){await page.getByRole('button',{name:browse?'Browse nodes':'Add Node',exact:true}).click();const catalog=page.getByRole('dialog',{name:'Node catalog'});await catalog.getByLabel('Search nodes',{exact:true}).fill(label);return catalog;}
  9  | test.beforeEach(async({page})=>{await page.goto('/');});
  10 | for(const zoom of [1,1.2])test(`S06 port context preview uses same-key direction and actual socket geometry at zoom ${zoom}`,async({page})=>{
  11 |  await createNode(page,'Float (fixed)');const canvas=page.locator('.canvas');
  12 |  if(zoom!==1){await canvas.hover({position:{x:300,y:300}});await page.mouse.wheel(0,-180);}
  13 |  const before=await doc(page),source=canvas.locator('.nodes [data-direction=output]').first();await source.click({button:'right'});await page.getByRole('menuitem',{name:'Create connected node'}).click();
  14 |  const catalog=page.getByRole('dialog',{name:'Node catalog'});await catalog.getByLabel('Search nodes',{exact:true}).fill('Constant input');await catalog.getByRole('button',{name:'Inspect Constant input',exact:true}).dblclick();
  15 |  await expect(page.locator('.creation-preview')).toBeVisible();expect(await canvas.locator('.nodes .node').count()).toBe(network(before).nodes.length);
  16 |  const r=(await canvas.boundingBox())!,x=r.x+420,y=r.y+350;await page.mouse.move(x,y);
  17 |  const measured=await page.evaluate(()=>{const root=document.querySelector('.canvas')!,preview=document.querySelector('.creation-preview')!,live=root.querySelector('.nodes [data-direction=output] .socket')!,target=preview.querySelector('[data-direction=input] .socket')!,out=preview.querySelector('[data-direction=output] .socket')!;const bounds=(el:Element)=>{const b=el.getBoundingClientRect(),r=root.getBoundingClientRect();return [b.x+b.width/2-r.x,b.y+b.height/2-r.y];};const nums=document.querySelector('.creation-wire path')!.getAttribute('d')!.match(/-?\d+(?:\.\d+)?/g)!.map(Number);return {live:bounds(live),target:bounds(target),other:bounds(out),start:nums.slice(0,2),end:nums.slice(-2),card:[preview.getBoundingClientRect().width,preview.getBoundingClientRect().height]};});
  18 |  expect(measured.start[0]).toBeCloseTo(measured.live[0],4);expect(measured.start[1]).toBeCloseTo(measured.live[1],4);expect(measured.end[0]).toBeCloseTo(measured.target[0],4);expect(measured.end[1]).toBeCloseTo(measured.target[1],4);expect(measured.target).not.toEqual(measured.other);
  19 |  await page.mouse.click(x,y);const after=await doc(page),added=network(after).nodes.find((n:any)=>n.name==='Constant input');expect(network(after).edges.at(-1).to).toEqual({nodeId:added.id,portKey:'value'});expect(added.position.every((v:number)=>v%24===0)).toBe(true);
  20 |  const final=await canvas.locator('.nodes .node[aria-label="Constant input"] [data-direction=input] .socket').evaluate(el=>{const b=el.getBoundingClientRect(),r=el.closest('.canvas')!.getBoundingClientRect();return [b.x+b.width/2-r.x,b.y+b.height/2-r.y];});expect(final[0]).toBeCloseTo(measured.target[0],1);expect(final[1]).toBeCloseTo(measured.target[1],1);
  21 |  await clickAction(page,'Undo');expect(await doc(page)).toEqual(before);await clickAction(page,'Redo');expect(await doc(page)).toEqual(after);fs.writeFileSync(path.join(evidence,`preview-geometry-${zoom}.json`),JSON.stringify({measured,final,before,after},null,2),{flag:'wx'});
  22 | });
  23 | test('S06 source and Project subgraph catalog reuse owner references with one History operation',async({page})=>{
  24 |  await createNode(page,'Float source (new)');let current=await doc(page);expect(current.graph.resources).toHaveLength(1);const id=current.graph.resources[0].id;
  25 |  const catalog=await choose(page,'Source',true);await catalog.getByLabel('Library scope',{exact:true}).selectOption('project');await catalog.getByRole('button',{name:'Inspect Source',exact:true}).click();await expect(catalog.locator('.catalog-detail')).toContainText('Existing source');await catalog.getByRole('button',{name:'Add Source',exact:true}).click();
  26 |  const after=await doc(page);expect(after.graph.resources).toEqual(current.graph.resources);expect(network(after).nodes.filter((n:any)=>n.state.source===id)).toHaveLength(2);await clickAction(page,'Undo');expect(await doc(page)).toEqual(current);
  27 |  await page.getByRole('button',{name:'New subgraph',exact:true}).click();current=await doc(page);const subgraph=current.graph.resources.find((r:any)=>r.data.network),c=await choose(page,'Subgraph',true);await c.getByLabel('Library scope',{exact:true}).selectOption('project');await c.getByRole('button',{name:'Inspect Subgraph',exact:true}).click();await expect(c.locator('.catalog-detail')).toContainText('input value');await c.getByRole('button',{name:'Add Subgraph',exact:true}).click();const copied=await doc(page);expect(copied.graph.resources).toEqual(current.graph.resources);expect(network(copied).nodes.filter((n:any)=>n.state.definition===subgraph.id)).toHaveLength(2);await clickAction(page,'Undo');expect(await doc(page)).toEqual(current);
  28 | });
  29 | test('S06 row drag accepts blank canvas once, rejects controls and other Canvas; browse double-click has one Undo',async({page})=>{
  30 |  const before=await doc(page);let catalog=await choose(page,'Multiply',true),row=catalog.getByRole('button',{name:'Inspect Multiply',exact:true}),from=(await row.boundingBox())!,canvas=(await page.locator('.canvas').boundingBox())!;
  31 |  await page.mouse.move(from.x+30,from.y+12);await page.mouse.down();await page.mouse.move(canvas.x+420,canvas.y+380,{steps:6});await page.mouse.up();await expect(page.locator('.nodes .node')).toHaveCount(2);await clickAction(page,'Undo');expect(await doc(page)).toEqual(before);
  32 |  catalog=await choose(page,'Multiply',true);row=catalog.getByRole('button',{name:'Inspect Multiply',exact:true});from=(await row.boundingBox())!;const control=(await page.getByRole('button',{name:'Vertex',exact:true}).boundingBox())!;await page.mouse.move(from.x+30,from.y+12);await page.mouse.down();await page.mouse.move(control.x+10,control.y+10,{steps:5});await page.mouse.up();expect(await doc(page)).toEqual(before);
  33 |  catalog=await choose(page,'Multiply',true);await catalog.getByRole('button',{name:'Inspect Multiply',exact:true}).dblclick();const created=await doc(page);expect(network(created).nodes.length).toBe(network(before).nodes.length+1);await clickAction(page,'Undo');expect(await doc(page)).toEqual(before);
  34 | });
  35 | test('S06 creator move threshold, clamping, creation point and cancellations are view only',async({page})=>{
  36 |  const before=await doc(page),canvas=page.locator('.canvas'),r=(await canvas.boundingBox())!;await page.mouse.dblclick(r.x+300,r.y+250);const catalog=page.getByRole('dialog',{name:'Node catalog'}),search=catalog.getByLabel('Search nodes',{exact:true});await search.fill('Multiply');const title=catalog.locator('header'),start=(await title.boundingBox())!,original=await catalog.evaluate(e=>[e.style.left,e.style.top]);
  37 |  await page.mouse.move(start.x+50,start.y+10);await page.mouse.down();await page.mouse.move(start.x+51,start.y+11);expect(await catalog.evaluate(e=>[e.style.left,e.style.top])).toEqual(original);await page.mouse.move(start.x+800,start.y+700,{steps:6});await page.mouse.up();const moved=(await catalog.boundingBox())!;expect(moved.x).toBeGreaterThanOrEqual(r.x);expect(moved.x+moved.width).toBeLessThanOrEqual(r.x+r.width+1);await search.press('Enter');const preview=await page.locator('.creation-preview').boundingBox();expect(preview!.x).toBeCloseTo(r.x+300,0);expect(preview!.y).toBeCloseTo(r.y+250,0);await page.keyboard.press('Tab');await expect(page.locator('.creation-preview')).toBeHidden();expect(await doc(page)).toEqual(before);
  38 |  for(const reason of ['resize','blur','outside','right']){const c=await choose(page,'Multiply');await c.getByRole('button',{name:'Add Multiply',exact:true}).click();if(reason==='resize')await page.setViewportSize({width:1400,height:960});if(reason==='blur')await page.evaluate(()=>window.dispatchEvent(new Event('blur')));if(reason==='outside')await page.locator('.brand').click();if(reason==='right')await page.mouse.click(r.x+380,r.y+300,{button:'right'});await expect(page.locator('.creation-preview')).toBeHidden();expect(await doc(page)).toEqual(before);}
  39 | });
  40 | test('S06 keyboard and popup guards preserve field drafts, IME and contextual cancellation',async({page})=>{
  41 |  await createNode(page,'Multiply');await page.getByRole('heading',{name:'Multiply',exact:true}).click();const input=page.locator('[data-parameter="b"]');await input.fill('123');await input.dispatchEvent('compositionstart');await input.dispatchEvent('keydown',{key:'Tab',isComposing:true});await input.dispatchEvent('keydown',{key:'?',isComposing:true});await expect(page.getByRole('dialog',{name:'Node catalog'})).toBeHidden();await expect(page.getByRole('dialog',{name:'Keyboard shortcuts'})).toBeHidden();await input.dispatchEvent('compositionend');await input.press('Escape');
  42 |  const before=await doc(page);await page.getByRole('button',{name:'Shortcuts',exact:true}).click();const help=page.getByRole('dialog',{name:'Keyboard shortcuts'});await page.keyboard.press('Tab');await expect(help.getByRole('button',{name:'Close shortcuts'})).toBeFocused();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Shortcuts',exact:true})).toBeFocused();expect(await doc(page)).toEqual(before);
  43 | });
  44 | test('S06 touch emulation: blank double-tap, row inspect and plus drag insert once without a trailing click',async({browser})=>{
  45 |  const context=await browser.newContext({hasTouch:true,viewport:{width:1440,height:1000}}),page=await context.newPage();
  46 |  try{
  47 |  await page.goto(process.env.GRAPE_BASE_URL??'http://127.0.0.1:4206');const before=await doc(page),r=(await page.locator('.canvas').boundingBox())!;
  48 |  await page.evaluate(()=>{(window as any).touchEvidence=[];for(const type of ['pointerdown','pointerup','click'])document.addEventListener(type,e=>(window as any).touchEvidence.push({type,trusted:e.isTrusted,pointerType:(e as PointerEvent).pointerType,target:(e.target as HTMLElement).tagName}));});
  49 |  await page.touchscreen.tap(r.x+310,r.y+260);await page.touchscreen.tap(r.x+310,r.y+260);const catalog=page.getByRole('dialog',{name:'Node catalog'});await expect(catalog).toBeVisible();await page.keyboard.press('Escape');
  50 |  await choose(page,'Multiply',true);const row=catalog.getByRole('button',{name:'Inspect Multiply',exact:true});await row.tap();await expect(catalog.locator('.catalog-detail')).toBeVisible();expect(await page.locator('.nodes .node').count()).toBe(network(before).nodes.length);
  51 |  const plus=catalog.getByRole('button',{name:'Add Multiply',exact:true}),b=(await plus.boundingBox())!,session=await context.newCDPSession(page);
  52 |  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2}]});
  53 |  await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:r.x+400,y:r.y+370}]});
  54 |  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
> 55 |  await expect(page.locator('.nodes .node')).toHaveCount(network(before).nodes.length+1);const after=await doc(page);await clickAction(page,'Undo');expect(await doc(page)).toEqual(before);await clickAction(page,'Redo');expect(await doc(page)).toEqual(after);
     |                                             ^ Error: expect(locator).toHaveCount(expected) failed
  56 |  const events=await page.evaluate(()=>(window as any).touchEvidence);expect(events.some((e:any)=>e.pointerType==='touch'&&e.trusted)).toBe(true);fs.writeFileSync(path.join(evidence,'touch-emulation-01.json'),JSON.stringify({limitation:'Chromium trusted touch emulation; no physical device qualification',events,before,after},null,2),{flag:'wx'});
  57 |  }finally{await context.close();}
  58 | });
  59 | test('S06 cross-Canvas drop and intervening shared revision cancel captured palette without mutation',async({page})=>{
  60 |  await clickAction(page,'Second Canvas');const canvases=page.locator('.canvas'),first=canvases.first(),second=canvases.last(),before=await doc(page);await first.getByRole('button',{name:'Browse nodes',exact:true}).click();const catalog=first.getByRole('dialog',{name:'Node catalog'});await catalog.getByLabel('Search nodes',{exact:true}).fill('Multiply');const label=catalog.getByRole('button',{name:'Inspect Multiply',exact:true}),b=(await label.boundingBox())!,r=(await second.boundingBox())!;
  61 |  await page.mouse.move(b.x+35,b.y+10);await page.mouse.down();await page.mouse.move(r.x+330,r.y+300,{steps:7});await page.mouse.up();expect(await doc(page)).toEqual(before);await expect(catalog).toBeHidden();
  62 |  await first.getByRole('button',{name:'Add Node',exact:true}).click();await catalog.getByLabel('Search nodes',{exact:true}).fill('Multiply');await catalog.getByRole('button',{name:'Add Multiply',exact:true}).click();await second.getByRole('button',{name:'New subgraph',exact:true}).click();await expect(first.locator('.creation-preview')).toBeHidden();const changed=await doc(page);expect(network(changed).nodes.filter((n:any)=>n.type.typeId==='multiply')).toHaveLength(0);await clickAction(page,'Undo');expect(await doc(page)).toEqual(before);
  63 | });
  64 | 
```