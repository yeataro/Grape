# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-guards.spec.ts >> S06 Personal search and inspect are readonly, malformed import survives unrelated success, and insert restores one Undo
- Location: ..\..\..\production\tests\browser\s06-guards.spec.ts:20:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('dialog[open]')
Expected: 0
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('dialog[open]')
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
        - generic [ref=e44]:
          - button "Upgrade subgraph owners" [ref=e45] [cursor=pointer]
          - dialog [ref=e46]:
            - heading "Personal Library" [level=2] [ref=e47]
            - paragraph [ref=e48]: Saved in this browser. Export a package to keep a file copy. Select a subgraph to save it.
            - searchbox "Search Personal Library" [ref=e49]
            - status [ref=e50]: IMPORT_ERRORS
            - generic [ref=e52]:
              - text: Subgraph — Subgraph.sgrape-function.json
              - button "Inspect Subgraph" [ref=e53] [cursor=pointer]
              - button "Insert Subgraph" [active] [ref=e54] [cursor=pointer]
              - button "Export Subgraph" [ref=e55] [cursor=pointer]
            - button "Save selected subgraph" [ref=e56] [cursor=pointer]
            - button "Export selected subgraph" [ref=e57] [cursor=pointer]
            - button "Import Personal package" [ref=e58]
            - button "Refresh Personal" [ref=e59] [cursor=pointer]
            - button "Close Personal" [ref=e60] [cursor=pointer]
            - button "Close Personal details" [ref=e61] [cursor=pointer]
          - button "Personal Library" [ref=e62] [cursor=pointer]
    - generic [ref=e63]:
      - generic [ref=e64]: Unsaved changes
      - generic [ref=e65]: Host-free
  - alert [ref=e66]: PERSONAL_FORMAT · IMPORT_ERRORS
  - generic [ref=e68]:
    - button "Undo" [ref=e69] [cursor=pointer]
    - button "Redo" [disabled] [ref=e72]
    - button "Delete selected" [ref=e75] [cursor=pointer]
    - alert
  - main [ref=e76]:
    - generic [ref=e78]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e79]:
        - generic:
          - generic:
            - group "Image output" [ref=e80]:
              - heading "Image output" [level=3] [ref=e81]
              - generic [ref=e82]:
                - button "Image output input color" [ref=e83] [cursor=pointer]:
                  - generic [ref=e85]: color
                - generic [ref=e86]: vec4
            - group "Subgraph" [ref=e87]:
              - heading "Subgraph" [level=3] [ref=e88]
              - generic [ref=e89]:
                - button "Subgraph input Value" [ref=e90] [cursor=pointer]:
                  - generic [ref=e92]: Value
                - generic [ref=e93]: vec4
              - generic [ref=e94]:
                - button "Subgraph output Value" [ref=e95] [cursor=pointer]:
                  - generic [ref=e96]: Value
                - generic [ref=e98]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e99]:
          - button "New subgraph" [ref=e100] [cursor=pointer]
          - button "Library subgraph" [ref=e101] [cursor=pointer]
          - button "Encapsulate" [ref=e102] [cursor=pointer]
          - button "Make independent" [ref=e103] [cursor=pointer]
          - button "Enter subgraph" [ref=e104] [cursor=pointer]
          - button "Arrange nodes" [ref=e105] [cursor=pointer]
          - button "Frame selection" [ref=e106] [cursor=pointer]
          - group [ref=e107]:
            - generic "Local clipboard" [ref=e108] [cursor=pointer]
          - group [ref=e109]:
            - generic "Structures" [ref=e110] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e111]:
          - button "Vertex" [ref=e112] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e113] [cursor=pointer]
        - generic [ref=e114]:
          - button "Add Node" [ref=e115] [cursor=pointer]
          - button "Browse nodes" [ref=e118] [cursor=pointer]
          - button "Up" [disabled] [ref=e121]
          - button "Shortcuts" [ref=e124] [cursor=pointer]
    - complementary [ref=e127]:
      - generic [ref=e128]:
        - heading "Inspector" [level=2] [ref=e129]
        - paragraph [ref=e130]: Subgraph
        - button "Rename node" [ref=e131] [cursor=pointer]
        - generic [ref=e134]:
          - generic [ref=e135]: Value
          - textbox "Value" [ref=e136]: "[1,1,1,1]"
          - alert
  - generic [ref=e138]:
    - heading "Shader output" [level=2] [ref=e139]
    - paragraph [ref=e140]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e141]:
      - listitem [ref=e142]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e143] [cursor=pointer]
  - contentinfo [ref=e144]:
    - generic [ref=e145]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e146]: Scroll to zoom · Drag empty space to pan
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
  18 |  const restored=catalog.locator('.catalog-list details').first();await expect(restored.locator(':scope > summary')).toHaveText(label!);await expect(restored).not.toHaveAttribute('open');await page.keyboard.press('Escape');expect(await doc(page)).toEqual(before);
  19 | });
  20 | test('S06 Personal search and inspect are readonly, malformed import survives unrelated success, and insert restores one Undo',async({page})=>{
  21 |  await page.getByRole('button',{name:'New subgraph',exact:true}).click();await clickAction(page,'Personal Library');const dialog=page.locator('dialog[open]');
  22 |  await page.getByRole('button',{name:'Save selected subgraph',exact:true}).click();await expect(dialog.locator('[role=status]')).toContainText('Saved');
  23 |  const search=dialog.getByLabel('Search Personal Library');await search.fill('ＳＵＢＧＲＡＰＨ');await expect(dialog.getByRole('button',{name:'Inspect Subgraph',exact:true})).toBeVisible();await search.fill('missing');await expect(dialog.locator('[data-personal-file]:visible')).toHaveCount(0);await search.fill('Subgraph');await dialog.getByRole('button',{name:'Inspect Subgraph',exact:true}).click();await expect(dialog.locator('pre')).toContainText('input Value: glsl.vec4');
  24 |  await dialog.getByLabel('Import Personal package').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"bad":true}')});await expect(page.locator('#message')).toContainText('PERSONAL_FORMAT');await dialog.getByRole('button',{name:'Refresh Personal',exact:true}).click();await expect(page.locator('#message')).toContainText('PERSONAL_FORMAT');
  25 |  await dialog.getByRole('button',{name:'Close Personal',exact:true}).click();const before=await doc(page);await clickAction(page,'Lock editing');await clickAction(page,'Personal Library');await expect(dialog.getByRole('button',{name:'Insert Subgraph',exact:true})).toBeDisabled();await dialog.getByRole('button',{name:'Inspect Subgraph',exact:true}).click();await dialog.getByRole('button',{name:'Close Personal',exact:true}).click();expect(await doc(page)).toEqual(before);
> 26 |  await clickAction(page,'Lock editing');await clickAction(page,'Personal Library');await dialog.getByRole('button',{name:'Insert Subgraph',exact:true}).click();await expect(dialog).toHaveCount(0);const after=await doc(page);await clickAction(page,'Undo');expect(await doc(page)).toEqual(before);await clickAction(page,'Redo');expect(await doc(page)).toEqual(after);
     |                                                                                                                                                                                      ^ Error: expect(locator).toHaveCount(expected) failed
  27 |  fs.writeFileSync(path.join(process.env.GRAPE_EVIDENCE_DIR!,'personal-search-history.json'),JSON.stringify({before,after},null,2),{flag:'wx'});
  28 | });
  29 | test('S06 native field context menu remains unprevented and touch hold never opens an object menu from a control',async({page,browser})=>{
  30 |  await page.getByRole('button',{name:'New subgraph',exact:true}).click();await page.getByRole('button',{name:'Enter subgraph',exact:true}).click();const name=page.getByLabel('Subgraph name',{exact:true});
  31 |  const prevented=await name.evaluate(el=>{const event=new MouseEvent('contextmenu',{bubbles:true,cancelable:true});el.dispatchEvent(event);return event.defaultPrevented;});expect(prevented).toBe(false);await expect(page.getByRole('menu')).toBeHidden();
  32 |  const context=await browser.newContext({hasTouch:true,viewport:{width:1440,height:1000}}),touch=await context.newPage();try{await touch.goto(process.env.GRAPE_BASE_URL??'http://127.0.0.1:4206');const b=(await touch.getByRole('button',{name:'Add Node',exact:true}).boundingBox())!,cdp=await context.newCDPSession(touch);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2}]});await touch.waitForTimeout(650);await expect(touch.getByRole('menu')).toBeHidden();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}finally{await context.close();}
  33 | });
  34 | 
```