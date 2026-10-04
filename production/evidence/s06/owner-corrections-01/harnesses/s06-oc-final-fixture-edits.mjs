import fs from 'node:fs';import assert from 'node:assert/strict';
let p='production/tests/unit/s06-owner-corrections.test.ts',s=fs.readFileSync(p,'utf8');s=s.replace('assert.deepEqual((destination.capture().document.graph.resources[0].data as any).binding,binding);','assert.deepEqual((destination.capture().document.graph.resources[0].data as any).binding,binding.kind==="top"?{...binding,slot:0}:binding);');fs.writeFileSync(p,s);
p='production/tests/browser/s06-hover-repair.spec.ts';s=fs.readFileSync(p,'utf8');const marker='test("S06 repair compact disclosures share presentation without model changes"';const i=s.indexOf(marker);assert(i>=0);s=s.slice(0,i)+s.slice(i).replace('await page.goto("/");','await page.goto("/");\n  await requiredOutput(page);');fs.writeFileSync(p,s);
p='production/tests/browser/s06-workspace.spec.ts';s=fs.readFileSync(p,'utf8');const start=s.indexOf('test("S06 wired creation is preview-only'),end=s.indexOf('test("S06 help and context menu',start);assert(start>=0&&end>start);s=s.slice(0,start)+`test("S06 connected input blank drop disconnects once and Undo restores occupied input", async ({ page }) => {
  await createNode(page,"Float (fixed)");
  const source=page.locator('.nodes .node').filter({has:page.getByRole('heading',{name:'Float',exact:true})}).locator('[data-direction=output]'),destination=page.locator('.nodes [data-direction=input][data-port="color"]').first();
  await source.click();await destination.click();const before=await documentOf(page),canvas=page.locator('.canvas'),r=(await canvas.boundingBox())!,start=(await destination.boundingBox())!;
  await page.mouse.move(start.x+start.width/2,start.y+start.height/2);await page.mouse.down();await page.mouse.move(r.x+350,r.y+320,{steps:6});await page.mouse.up();
  await expect(page.getByRole('dialog',{name:'Node catalog'})).toHaveCount(0);const after=await documentOf(page),network=after.graph.stages.find((s:any)=>s.key==='pixel').network;
  expect(network.nodes.length).toBe(2);expect(network.edges.length).toBe(0);
  await page.getByRole('button',{name:'Undo',exact:true}).click();expect(await documentOf(page)).toEqual(before);
  await page.getByRole('button',{name:'Redo',exact:true}).click();expect(await documentOf(page)).toEqual(after);
  await page.screenshot({path:path.join(evidence(),'s06-input-disconnection.png')});
});

`+s.slice(end);fs.writeFileSync(p,s);
