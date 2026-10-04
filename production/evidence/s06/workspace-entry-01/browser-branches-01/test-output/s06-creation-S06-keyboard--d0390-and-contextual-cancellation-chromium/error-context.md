# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-creation.spec.ts >> S06 keyboard and popup guards preserve field drafts, IME and contextual cancellation
- Location: ..\..\..\production\tests\browser\s06-creation.spec.ts:40:1

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  getByRole('dialog', { name: 'Keyboard shortcuts' }).getByRole('button', { name: 'Close shortcuts' })
Expected: focused
Received: inactive
Timeout:  5000ms

Call log:
  - Expect "toBeFocused" with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Keyboard shortcuts' }).getByRole('button', { name: 'Close shortcuts' })
    14 × locator resolved to <button>Close shortcuts</button>
       - unexpected value "inactive"

```

```yaml
- button "Close shortcuts"
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
> 42 |  const before=await doc(page);await page.getByRole('button',{name:'Shortcuts',exact:true}).click();const help=page.getByRole('dialog',{name:'Keyboard shortcuts'});await page.keyboard.press('Tab');await expect(help.getByRole('button',{name:'Close shortcuts'})).toBeFocused();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Shortcuts',exact:true})).toBeFocused();expect(await doc(page)).toEqual(before);
     |                                                                                                                                                                                                                                                                     ^ Error: expect(locator).toBeFocused() failed
  43 | });
  44 | 
```