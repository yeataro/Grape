# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-workspace.spec.ts >> S06 catalog literal normalized search, source/type filters, inspect and native text do not edit
- Location: ..\..\..\production\tests\browser\s06-workspace.spec.ts:7:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog', { name: 'Node catalog' }).getByRole('button', { name: 'Inspect Vector3', exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Node catalog' }).getByRole('button', { name: 'Inspect Vector3', exact: true })

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
    - combobox "Node source":
      - option "All installed sources"
      - option "grape.nodes.basic"
      - option "grape.nodes.fixed-values" [selected]
      - option "grape.nodes.function-operations"
      - option "grape.resources.extents"
    - combobox "Node port type":
      - option "All port types"
      - option "array@[\"glsl.float\",2]"
      - option "glsl.float"
      - option "glsl.vec2"
      - option "glsl.vec3" [selected]
      - option "glsl.vec4"
    - group:
      - text: Nodes
      - button "Inspect Vector 3": Vector 3 grape.nodes.fixed-values
      - button "Add Vector 3"
    - strong: Multiply
    - paragraph: "grape.nodes.basic Aliases:"
    - text: "input a: glsl.float input b: glsl.float output result: glsl.float"
    - button "Close details"
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
  4  | const evidence=()=>{const out=process.env.GRAPE_EVIDENCE_DIR!;if(!path.isAbsolute(out)||!out.includes('s06'))throw Error('S06_EVIDENCE_REQUIRED');return out;};
  5  | async function documentOf(page:Page){const wait=page.waitForEvent('download');await page.getByRole('button',{name:'Export JSON',exact:true}).click();return JSON.parse(fs.readFileSync((await (await wait).path())!,'utf8'));}
  6  | test.beforeEach(async({page})=>{await page.goto('/');});
  7  | test('S06 catalog literal normalized search, source/type filters, inspect and native text do not edit',async({page})=>{
  8  |  const before=await documentOf(page);await page.getByRole('button',{name:'Browse nodes',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Node catalog'}),search=dialog.getByLabel('Search nodes',{exact:true});
  9  |  await search.fill('ＭＵＬＴＩＰＬＹ');await expect(dialog.getByRole('button',{name:'Inspect Multiply',exact:true})).toBeVisible();
  10 |  await dialog.getByRole('button',{name:'Inspect Multiply',exact:true}).click();await expect(dialog.locator('.catalog-detail')).toContainText('input a: glsl.float');
  11 |  await search.fill('[.*');await expect(dialog).toContainText('No matching nodes');await search.fill('');await dialog.getByLabel('Node source',{exact:true}).selectOption('grape.nodes.fixed-values');await expect(dialog.getByRole('button',{name:'Inspect Float',exact:true})).toBeVisible();await expect(dialog.getByRole('button',{name:'Inspect Multiply',exact:true})).toHaveCount(0);
> 12 |  await dialog.getByLabel('Node port type',{exact:true}).selectOption('glsl.vec3');await expect(dialog.getByRole('button',{name:'Inspect Vector3',exact:true})).toBeVisible();await expect(dialog.getByRole('button',{name:'Inspect Float',exact:true})).toHaveCount(0);
     |                                                                                                                                                                ^ Error: expect(locator).toBeVisible() failed
  13 |  await search.fill('typed');await search.press('Control+z');await page.keyboard.press('Escape');expect(await documentOf(page)).toEqual(before);
  14 |  await page.screenshot({path:path.join(evidence(),'s06-catalog-inspection.png')});
  15 | });
  16 | test('S06 blank double-click and Tab create previews; movement is independent, cancel and stage change add no History',async({page})=>{
  17 |  const canvas=page.locator('.canvas'),rect=(await canvas.boundingBox())!,before=await documentOf(page);
  18 |  await page.mouse.dblclick(rect.x+260,rect.y+250);const dialog=page.getByRole('dialog',{name:'Node catalog'});await expect(dialog).toBeVisible();await dialog.getByLabel('Search nodes',{exact:true}).fill('Multiply');
  19 |  const title=dialog.locator('header'),box=(await title.boundingBox())!,position=await dialog.evaluate(e=>[e.style.left,e.style.top]);await page.mouse.move(box.x+55,box.y+10);await page.mouse.down();await page.mouse.move(box.x+120,box.y+55,{steps:5});await page.keyboard.press('Escape');await page.mouse.up();await expect(dialog).toBeHidden();expect(await documentOf(page)).toEqual(before);
  20 |  await page.mouse.click(rect.x+240,rect.y+240);await page.keyboard.press('Tab');await expect(dialog).toBeVisible();await dialog.getByLabel('Search nodes',{exact:true}).fill('Multiply');await page.keyboard.press('Enter');await expect(page.locator('.creation-preview')).toBeVisible();await expect(canvas.locator('.nodes .node')).toHaveCount(1);await page.keyboard.press('Escape');await expect(page.locator('.creation-preview')).toBeHidden();
  21 |  await page.getByRole('button',{name:'Add Node',exact:true}).click();await page.getByRole('button',{name:'Vertex',exact:true}).click();await expect(dialog).toBeHidden();expect(await documentOf(page)).toEqual(before);await expect(page.getByRole('button',{name:'Undo',exact:true})).toBeDisabled();
  22 |  expect(position.length).toBe(2);
  23 | });
  24 | test('S06 wired creation is preview-only until snap placement and one Undo restores occupied input',async({page})=>{
  25 |  await createNode(page,'Float (fixed)');const output=page.getByRole('button',{name:'Float output Value',exact:true}),input=page.getByRole('button',{name:'Image Output input Color',exact:true});
  26 |  // Locate semantic ports independently of current localized labels.
  27 |  const source=page.locator('.nodes .node').filter({has:page.getByRole('heading',{name:'Float',exact:true})}).locator('[data-direction=output]');const destination=page.locator('.nodes [data-direction=input]').filter({hasText:'color'}).first();
  28 |  await source.click();await destination.click();const before=await documentOf(page),canvas=page.locator('.canvas'),r=(await canvas.boundingBox())!,start=(await destination.boundingBox())!;
  29 |  await page.mouse.move(start.x+3,start.y+start.height/2);await page.mouse.down();await page.mouse.move(r.x+350,r.y+320,{steps:6});await page.mouse.up();const catalog=page.getByRole('dialog',{name:'Node catalog'});await expect(catalog).toBeVisible();await catalog.getByLabel('Search nodes',{exact:true}).fill('ColorRGBA');await page.keyboard.press('Enter');await expect(page.locator('.creation-wire')).toBeVisible();
  30 |  expect(await canvas.locator('.nodes .node').count()).toBe(2);await page.mouse.move(r.x+355,r.y+315);await page.mouse.click(r.x+355,r.y+315);const after=await documentOf(page),network=after.graph.stages.find((s:any)=>s.key==='pixel').network;expect(network.nodes.length).toBe(3);expect(network.edges.length).toBe(1);const added=network.nodes.find((n:any)=>n.name==='ColorRGBA');expect(added.position.every((n:number)=>n%24===0)).toBe(true);
  31 |  await page.getByRole('button',{name:'Undo',exact:true}).click();expect(await documentOf(page)).toEqual(before);await page.getByRole('button',{name:'Redo',exact:true}).click();expect(await documentOf(page)).toEqual(after);await page.getByRole('button',{name:'Generate GLSL',exact:true}).click();await expect(page.getByLabel('Generated GLSL')).toContainText('vec4');await page.screenshot({path:path.join(evidence(),'s06-wired-placement.png')});
  32 | });
  33 | test('S06 help and context menu keyboard, readonly browsing and responsive original actions',async({page})=>{
  34 |  await createNode(page,'Multiply');const before=await documentOf(page);await page.getByRole('button',{name:'Shortcuts',exact:true}).click();const help=page.getByRole('dialog',{name:'Keyboard shortcuts'});await expect(help).toBeVisible();await page.keyboard.press('Delete');await page.keyboard.press('Control+z');await expect(help).toBeVisible();await page.keyboard.press('Escape');expect(await documentOf(page)).toEqual(before);
  35 |  await page.locator('.node h3').filter({hasText:/^Multiply$/}).click();await page.keyboard.press('Shift+F10');const menu=page.getByRole('menu');await expect(menu).toBeVisible();await page.keyboard.press('End');await expect(page.getByRole('menuitem',{name:'Keyboard shortcuts'})).toBeFocused();await page.keyboard.press('Escape');await expect(menu).toBeHidden();
  36 |  await page.getByRole('button',{name:'Lock editing',exact:true}).click();await expect(page.getByRole('button',{name:'Add Node',exact:true})).toBeDisabled();await page.getByRole('button',{name:'Browse nodes',exact:true}).click();const catalog=page.getByRole('dialog',{name:'Node catalog'});await catalog.getByLabel('Search nodes',{exact:true}).fill('Multiply');await expect(catalog.getByRole('button',{name:'Add Multiply',exact:true})).toBeDisabled();await catalog.getByRole('button',{name:'Inspect Multiply',exact:true}).click();await page.keyboard.press('Escape');
  37 |  await page.setViewportSize({width:620,height:850});await page.getByText('More actions',{exact:true}).click();await expect(page.getByRole('button',{name:'Save',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Undo',exact:true})).toHaveCount(1);await expect(page.getByRole('button',{name:'Vertex',exact:true})).toBeVisible();await page.screenshot({path:path.join(evidence(),'s06-responsive.png')});
  38 |  await page.setViewportSize({width:1440,height:1000});await expect(page.getByRole('button',{name:'Save',exact:true})).toBeVisible();expect(await documentOf(page)).toEqual(before);
  39 | });
  40 | test('S06 compile error survives unrelated successful Save and clears on matching successful Generate',async({page})=>{
  41 |  await page.getByRole('button',{name:'Generate GLSL',exact:true}).click();await expect(page.locator('#message')).toContainText('INPUT_REQUIRED');await page.getByRole('button',{name:'Save',exact:true}).click();await expect(page.locator('#message')).toContainText('INPUT_REQUIRED');await createNode(page,'ColorRGBA');await page.locator('.nodes [data-direction=output]').click();await page.locator('.nodes [data-direction=input]').click();await page.getByRole('button',{name:'Generate GLSL',exact:true}).click();await expect(page.locator('#message')).toHaveText('');
  42 | });
  43 | 
```