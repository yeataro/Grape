# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-guards.spec.ts >> S06 category collapse survives query changes and whitespace uses the tree without a Graph edit
- Location: ..\..\..\production\tests\browser\s06-guards.spec.ts:14:1

# Error details

```
Error: expect(locator).not.toHaveAttribute() failed

Locator: getByRole('dialog', { name: 'Node catalog' }).locator('details').filter({ has: getByRole('dialog', { name: 'Node catalog' }).locator('summary').filter({ hasText: 'Nodes' }) }).first()
Expected: not have attribute
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "not toHaveAttribute" with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Node catalog' }).locator('details').filter({ has: getByRole('dialog', { name: 'Node catalog' }).locator('summary').filter({ hasText: 'Nodes' }) }).first()

```

```yaml
- banner:
  - text: Grape SHADER WORKSPACE
  - navigation "Document actions":
    - button "New document"
    - button "Save"
    - button "Open saved"
    - button "Export JSON"
    - button "Export PNG"
    - button "Open file"
    - button "Generate GLSL"
    - button "Second Canvas"
    - button "Lock editing"
    - group: More actions
  - text: Unsaved changes Host-free
- status: Export started. Saved status is unchanged.
- button "Undo" [disabled]
- button "Redo" [disabled]
- button "Delete selected"
- alert
- main:
  - text: Canvas 1
  - img
  - group "Image output":
    - heading "Image output" [level=3]
    - button "Image output input color": color
    - text: vec4
  - button "Untitled shader / pixel" [disabled]
  - button "New subgraph"
  - button "Library subgraph"
  - button "Encapsulate"
  - button "Make independent"
  - button "Enter subgraph"
  - button "Arrange nodes"
  - button "Frame selection"
  - group: Local clipboard
  - group: Structures
  - dialog "Node catalog":
    - strong: Node browser
    - button "Close node catalog"
    - searchbox "Search nodes"
    - combobox "Library scope":
      - option "All installed and project" [selected]
      - option "Built-in"
      - option "Project"
    - combobox "Node source":
      - option "All installed sources" [selected]
      - option "grape.nodes.basic"
      - option "grape.nodes.fixed-values"
      - option "grape.nodes.function-operations"
      - option "grape.nodes.networks"
      - option "grape.resources.extents"
    - combobox "Node port type":
      - option "All port types" [selected]
      - option "array@[\"glsl.float\",2]"
      - option "glsl.float"
      - option "glsl.vec2"
      - option "glsl.vec3"
      - option "glsl.vec4"
    - group:
      - text: Nodes
      - button "Inspect Add": Add grape.nodes.function-operations
      - button "Add Add"
      - button "Inspect Array length": Array length grape.nodes.function-operations
      - button "Add Array length"
      - button "Inspect Array repeat": Array repeat grape.resources.extents
      - button "Add Array repeat"
      - button "Inspect Color RGBA": Color RGBA grape.nodes.fixed-values
      - button "Add Color RGBA"
      - button "Inspect Compose": Compose grape.nodes.basic
      - button "Add Compose"
      - button "Inspect Constant input": Constant input grape.nodes.function-operations
      - button "Add Constant input"
      - button "Inspect Float": Float grape.nodes.basic
      - button "Add Float"
      - button "Inspect Float": Float grape.nodes.fixed-values
      - button "Add Float"
      - button "Inspect Multiply": Multiply grape.nodes.basic
      - button "Add Multiply"
      - button "Inspect Pixel depth and pair": Pixel depth and pair grape.nodes.function-operations
      - button "Add Pixel depth and pair"
      - button "Inspect Vector 2": Vector 2 grape.nodes.fixed-values
      - button "Add Vector 2"
      - button "Inspect Vector 3": Vector 3 grape.nodes.fixed-values
      - button "Add Vector 3"
    - group:
      - text: Sources
      - button "Inspect Float source (new)": Float source (new) New source · grape.nodes.networks
      - button "Add Float source (new)"
  - button "Vertex"
  - button "Pixel" [pressed]
  - button "Add Node"
  - button "Browse nodes"
  - button "Up" [disabled]
  - button "Shortcuts"
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
  1  | import {test,expect,type Page} from '@playwright/test';
  2  | import fs from 'node:fs';import path from 'node:path';
  3  | import {createNode} from './create-node.ts';
  4  | import {clickAction} from '../fixtures/public-actions.ts';
  5  | async function doc(page:Page){const wait=page.waitForEvent('download');await clickAction(page,'Export JSON');return JSON.parse(fs.readFileSync((await (await wait).path())!,'utf8'));}
  6  | test.beforeEach(async({page})=>{await page.goto('/');});
  7  | test('S06 Canvas connection failure persists across movement and unrelated successful actions until matching recovery',async({page})=>{
  8  |  await createNode(page,'Float');await createNode(page,'Multiply');
  9  |  const outputs=page.locator('.nodes [data-direction=output]');await outputs.nth(0).click();await outputs.nth(1).click();
  10 |  await expect(page.locator('.canvas-notice')).toContainText('PORT_DIRECTION');const before=await doc(page),r=(await page.locator('.canvas').boundingBox())!;
  11 |  await page.mouse.move(r.x+450,r.y+400,{steps:5});await clickAction(page,'Save');await expect(page.locator('.canvas-notice')).toContainText('PORT_DIRECTION');expect(await doc(page)).toEqual(before);
  12 |  await outputs.first().click();await page.locator('.nodes [data-direction=input]').first().click();await expect(page.locator('.canvas-notice')).not.toContainText('PORT_DIRECTION');
  13 | });
  14 | test('S06 category collapse survives query changes and whitespace uses the tree without a Graph edit',async({page})=>{
  15 |  const before=await doc(page);await page.getByRole('button',{name:'Browse nodes',exact:true}).click();const catalog=page.getByRole('dialog',{name:'Node catalog'}),search=catalog.getByLabel('Search nodes',{exact:true}),group=catalog.locator('.catalog-list details').first();
  16 |  const label=await group.locator(':scope > summary').textContent();await group.locator(':scope > summary').click();await expect(group).not.toHaveAttribute('open');
  17 |  await search.fill('Multiply');await expect(catalog.getByRole('button',{name:'Inspect Multiply',exact:true})).toBeVisible();await search.fill('   ');
> 18 |  const restored=catalog.locator('details').filter({has:catalog.locator('summary').filter({hasText:label!})}).first();await expect(restored).not.toHaveAttribute('open');await page.keyboard.press('Escape');expect(await doc(page)).toEqual(before);
     |                                                                                                                                                 ^ Error: expect(locator).not.toHaveAttribute() failed
  19 | });
  20 | test('S06 Personal search and inspect are readonly, malformed import survives unrelated success, and insert restores one Undo',async({page})=>{
  21 |  await page.getByRole('button',{name:'New subgraph',exact:true}).click();await clickAction(page,'Personal Library');const dialog=page.locator('dialog[open]');
  22 |  await page.getByRole('button',{name:'Save selected subgraph',exact:true}).click();await expect(dialog.locator('[role=status]')).toContainText('Saved');
  23 |  const search=dialog.getByLabel('Search Personal Library');await search.fill('ＳＵＢＧＲＡＰＨ');await expect(dialog.getByRole('button',{name:'Inspect Subgraph',exact:true})).toBeVisible();await search.fill('missing');await expect(dialog.locator('[data-personal-file]:visible')).toHaveCount(0);await search.fill('Subgraph');await dialog.getByRole('button',{name:'Inspect Subgraph',exact:true}).click();await expect(dialog.locator('pre')).toContainText('input Value: glsl.vec4');
  24 |  await dialog.getByLabel('Import Personal package').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"bad":true}')});await expect(page.locator('#message')).toContainText('PERSONAL_FORMAT');await dialog.getByRole('button',{name:'Refresh Personal',exact:true}).click();await expect(page.locator('#message')).toContainText('PERSONAL_FORMAT');
  25 |  await dialog.getByRole('button',{name:'Close Personal',exact:true}).click();const before=await doc(page);await clickAction(page,'Lock editing');await clickAction(page,'Personal Library');await expect(dialog.getByRole('button',{name:'Insert Subgraph',exact:true})).toBeDisabled();await dialog.getByRole('button',{name:'Inspect Subgraph',exact:true}).click();await dialog.getByRole('button',{name:'Close Personal',exact:true}).click();expect(await doc(page)).toEqual(before);
  26 |  await clickAction(page,'Enable editing');await clickAction(page,'Personal Library');await dialog.getByRole('button',{name:'Insert Subgraph',exact:true}).click();await expect(dialog).toHaveCount(0);const after=await doc(page);await clickAction(page,'Undo');expect(await doc(page)).toEqual(before);await clickAction(page,'Redo');expect(await doc(page)).toEqual(after);
  27 |  fs.writeFileSync(path.join(process.env.GRAPE_EVIDENCE_DIR!,'personal-search-history.json'),JSON.stringify({before,after},null,2),{flag:'wx'});
  28 | });
  29 | test('S06 native field context menu remains unprevented and touch hold never opens an object menu from a control',async({page,browser})=>{
  30 |  await page.getByRole('button',{name:'New subgraph',exact:true}).click();await page.getByRole('button',{name:'Enter subgraph',exact:true}).click();const name=page.getByLabel('Subgraph name',{exact:true});
  31 |  const prevented=await name.evaluate(el=>{const event=new MouseEvent('contextmenu',{bubbles:true,cancelable:true});el.dispatchEvent(event);return event.defaultPrevented;});expect(prevented).toBe(false);await expect(page.getByRole('menu')).toBeHidden();
  32 |  const context=await browser.newContext({hasTouch:true,viewport:{width:1440,height:1000}}),touch=await context.newPage();try{await touch.goto(process.env.GRAPE_BASE_URL??'http://127.0.0.1:4206');const b=(await touch.getByRole('button',{name:'Add Node',exact:true}).boundingBox())!,cdp=await context.newCDPSession(touch);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2}]});await touch.waitForTimeout(650);await expect(touch.getByRole('menu')).toBeHidden();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}finally{await context.close();}
  33 | });
  34 | 
```