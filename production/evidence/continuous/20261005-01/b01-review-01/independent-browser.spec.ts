import {test,expect} from '../../production/node_modules/@playwright/test/index.mjs';
import fs from 'node:fs';import path from 'node:path';
import {clickAction} from '../../production/tests/fixtures/public-actions.ts';
import {createNode} from '../../production/tests/browser/create-node.ts';
const dir=path.dirname(new URL(import.meta.url).pathname.replace(/^\/(C:)/,'$1'));
const save=(name,data)=>fs.writeFileSync(path.join(dir,name+'.json'),JSON.stringify(data,null,2)+'\n');
async function download(p,name){const d=p.waitForEvent('download');await clickAction(p,name);return JSON.parse(fs.readFileSync((await (await d).path())!,'utf8'));}
for(const [build,port] of [['source',4237],['archive',4238]] as const){
 test(build+' adjacent-group keyboard resize retains native focus and Escape restores pair',async({page:p})=>{
  await p.goto('http://127.0.0.1:'+port);await clickAction(p,'Second Canvas');
  const divider=p.getByRole('separator',{name:'Resize canvas-1 and canvas-2',exact:true});const before=await download(p,'Export current layout');
  await divider.click();await p.keyboard.press('ArrowDown');const afterOne=await divider.getAttribute('aria-valuenow');const focus=await p.evaluate(()=>({tag:document.activeElement?.tagName,role:document.activeElement?.getAttribute('role'),label:document.activeElement?.getAttribute('aria-label')}));await p.keyboard.press('ArrowDown');const afterTwo=await divider.getAttribute('aria-valuenow');await p.keyboard.press('Escape');const after=await download(p,'Export current layout');
  save(build+'-pair-keyboard',{before,afterOne,focus,afterTwo,after});await p.screenshot({path:path.join(dir,build+'-pair-keyboard.png')});
  expect(focus.label).toBe('Resize canvas-1 and canvas-2');expect(Number(afterTwo)).toBeCloseTo(Number(afterOne)+8,0);expect(after.panes).toEqual(before.panes);
 });
 test(build+' adjacent-group native pointer drag changes weights and does not cancel itself',async({page:p})=>{
  await p.goto('http://127.0.0.1:'+port);await clickAction(p,'Second Canvas');const before=await download(p,'Export current layout');const d=p.getByRole('separator',{name:'Resize canvas-1 and canvas-2',exact:true});const b=(await d.boundingBox())!;
  await p.mouse.move(b.x+b.width/2,b.y+b.height/2);await p.mouse.down();await p.mouse.move(b.x+b.width/2,b.y+b.height/2+70,{steps:7});await p.mouse.up();const after=await download(p,'Export current layout');save(build+'-pair-pointer',{before,after});expect(after.panes.find(x=>x.id==='canvas-1').weight).toBeGreaterThan(before.panes.find(x=>x.id==='canvas-1').weight);
 });
 test(build+' natural Escape after real pane reorder preserves Graph and native focus',async({page:p})=>{
  await p.goto('http://127.0.0.1:'+port);await createNode(p,'Float');await clickAction(p,'Second Canvas');await p.getByRole('button',{name:'Panel options in canvas-2',exact:true}).click();const menu=p.getByRole('dialog',{name:'Panel options',exact:true});await menu.getByRole('button',{name:'Move group earlier',exact:true}).click();
  const before=await download(p,'Export JSON');const node=p.locator('#canvas-1 .node h3').filter({hasText:'Float'}).first();const b=(await node.boundingBox())!;await p.mouse.move(b.x+20,b.y+10);await p.mouse.down();await p.mouse.move(b.x+65,b.y+40,{steps:7});const focus=await p.evaluate(()=>({tag:document.activeElement?.tagName,classes:document.activeElement?.className}));await p.keyboard.press('Escape');await p.mouse.up();const after=await download(p,'Export JSON');save(build+'-reorder-escape',{before,after,focus});expect(after).toEqual(before);
 });
}
