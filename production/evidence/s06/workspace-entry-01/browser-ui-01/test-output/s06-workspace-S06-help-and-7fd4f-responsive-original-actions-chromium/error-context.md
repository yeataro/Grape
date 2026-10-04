# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-workspace.spec.ts >> S06 help and context menu keyboard, readonly browsing and responsive original actions
- Location: ..\..\..\production\tests\browser\s06-workspace.spec.ts:33:1

# Error details

```
Error: locator.click: Error: strict mode violation: locator('.node h3').filter({ hasText: /^Multiply$/ }) resolved to 2 elements:
    1) <h3>Multiply</h3> aka getByRole('heading', { name: 'Multiply' })
    2) <h3>Multiply</h3> aka locator('article').filter({ hasText: 'MultiplyA · glsl.floatB ·' }).locator('h3')

Call log:
  - waiting for locator('.node h3').filter({ hasText: /^Multiply$/ })

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
        - button "Export JSON" [active] [ref=e21] [cursor=pointer]
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
  - status [ref=e46]: Export started. Saved status is unchanged.
  - generic [ref=e48]:
    - button "Undo" [ref=e49] [cursor=pointer]
    - button "Redo" [disabled] [ref=e52]
    - button "Delete selected" [ref=e55] [cursor=pointer]
    - alert
  - main [ref=e56]:
    - generic [ref=e58]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e59]:
        - generic:
          - generic:
            - group "Image output" [ref=e60]:
              - heading "Image output" [level=3] [ref=e61]
              - generic [ref=e62]:
                - button "Image output input color" [ref=e63] [cursor=pointer]:
                  - generic [ref=e65]: color
                - generic [ref=e66]: vec4
            - group "Multiply" [ref=e67]:
              - heading "Multiply" [level=3] [ref=e68]
              - generic [ref=e69]:
                - button "Multiply input a" [ref=e70] [cursor=pointer]:
                  - generic [ref=e72]: a
                - generic [ref=e73]: float
              - generic [ref=e74]:
                - button "Multiply input b" [ref=e75] [cursor=pointer]:
                  - generic [ref=e77]: b
                - generic [ref=e78]: float
              - generic [ref=e79]:
                - button "Multiply output result" [ref=e80] [cursor=pointer]:
                  - generic [ref=e81]: result
                - generic [ref=e83]: float
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e84]:
          - button "New subgraph" [ref=e85] [cursor=pointer]
          - button "Library subgraph" [ref=e86] [cursor=pointer]
          - button "Encapsulate" [ref=e87] [cursor=pointer]
          - button "Make independent" [ref=e88] [cursor=pointer]
          - button "Enter subgraph" [ref=e89] [cursor=pointer]
          - button "Arrange nodes" [ref=e90] [cursor=pointer]
          - button "Frame selection" [ref=e91] [cursor=pointer]
          - group [ref=e92]:
            - generic "Local clipboard" [ref=e93] [cursor=pointer]
          - group [ref=e94]:
            - generic "Structures" [ref=e95] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e96]:
          - button "Vertex" [ref=e97] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e98] [cursor=pointer]
        - generic [ref=e99]:
          - button "Add Node" [ref=e100] [cursor=pointer]
          - button "Browse nodes" [ref=e103] [cursor=pointer]
          - button "Up" [disabled] [ref=e106]
          - button "Shortcuts" [ref=e109] [cursor=pointer]
    - complementary [ref=e112]:
      - generic [ref=e113]:
        - heading "Inspector" [level=2] [ref=e114]
        - paragraph [ref=e115]: Multiply
        - button "Rename node" [ref=e116] [cursor=pointer]
        - generic [ref=e117]:
          - generic [ref=e119]:
            - generic [ref=e120]: A
            - textbox "A" [ref=e121]: "1"
            - alert
          - generic [ref=e123]:
            - generic [ref=e124]: B
            - textbox "B" [ref=e125]: "2"
            - alert
  - generic [ref=e127]:
    - heading "Shader output" [level=2] [ref=e128]
    - paragraph [ref=e129]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e130]:
      - listitem [ref=e131]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e132] [cursor=pointer]
  - contentinfo [ref=e133]:
    - generic [ref=e134]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e135]: Scroll to zoom · Drag empty space to pan
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
  12 |  await dialog.getByLabel('Node port type',{exact:true}).selectOption('glsl.vec3');await expect(dialog.getByRole('button',{name:'Inspect Vector3',exact:true})).toBeVisible();await expect(dialog.getByRole('button',{name:'Inspect Float',exact:true})).toHaveCount(0);
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
> 35 |  await page.locator('.node h3').filter({hasText:/^Multiply$/}).click();await page.keyboard.press('Shift+F10');const menu=page.getByRole('menu');await expect(menu).toBeVisible();await page.keyboard.press('End');await expect(page.getByRole('menuitem',{name:'Keyboard shortcuts'})).toBeFocused();await page.keyboard.press('Escape');await expect(menu).toBeHidden();
     |                                                                ^ Error: locator.click: Error: strict mode violation: locator('.node h3').filter({ hasText: /^Multiply$/ }) resolved to 2 elements:
  36 |  await page.getByRole('button',{name:'Lock editing',exact:true}).click();await expect(page.getByRole('button',{name:'Add Node',exact:true})).toBeDisabled();await page.getByRole('button',{name:'Browse nodes',exact:true}).click();const catalog=page.getByRole('dialog',{name:'Node catalog'});await catalog.getByLabel('Search nodes',{exact:true}).fill('Multiply');await expect(catalog.getByRole('button',{name:'Add Multiply',exact:true})).toBeDisabled();await catalog.getByRole('button',{name:'Inspect Multiply',exact:true}).click();await page.keyboard.press('Escape');
  37 |  await page.setViewportSize({width:620,height:850});await page.getByText('More actions',{exact:true}).click();await expect(page.getByRole('button',{name:'Save',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Undo',exact:true})).toHaveCount(1);await expect(page.getByRole('button',{name:'Vertex',exact:true})).toBeVisible();await page.screenshot({path:path.join(evidence(),'s06-responsive.png')});
  38 |  await page.setViewportSize({width:1440,height:1000});await expect(page.getByRole('button',{name:'Save',exact:true})).toBeVisible();expect(await documentOf(page)).toEqual(before);
  39 | });
  40 | test('S06 compile error survives unrelated successful Save and clears on matching successful Generate',async({page})=>{
  41 |  await page.getByRole('button',{name:'Generate GLSL',exact:true}).click();await expect(page.locator('#message')).toContainText('INPUT_REQUIRED');await page.getByRole('button',{name:'Save',exact:true}).click();await expect(page.locator('#message')).toContainText('INPUT_REQUIRED');await createNode(page,'ColorRGBA');await page.locator('.nodes [data-direction=output]').click();await page.locator('.nodes [data-direction=input]').click();await page.getByRole('button',{name:'Generate GLSL',exact:true}).click();await expect(page.locator('#message')).toHaveText('');
  42 | });
  43 | 
```