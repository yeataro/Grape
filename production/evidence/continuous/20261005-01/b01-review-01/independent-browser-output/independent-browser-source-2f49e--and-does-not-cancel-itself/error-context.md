# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: independent-browser.spec.ts >> source adjacent-group native pointer drag changes weights and does not cancel itself
- Location: independent-browser.spec.ts:16:2

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 1
Received:   1
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - text: Grape
      - generic [ref=e9]: SHADER WORKSPACE
      - generic "Implementation dc653519515e167c75d967930defafcf19422197" [ref=e10]: S06-debug-dc65351
      - button "本輪更新" [ref=e11] [cursor=pointer]
    - navigation "Document actions" [ref=e12]:
      - button "Save" [ref=e13] [cursor=pointer]
      - button "Generate GLSL" [ref=e16] [cursor=pointer]
    - generic [ref=e19]:
      - generic [ref=e20]: Unsaved changes
      - generic [ref=e21]: Host-free
  - generic [ref=e23]:
    - button "Undo" [disabled] [ref=e24]
    - button "Redo" [disabled] [ref=e27]
    - button "Delete selected" [ref=e30] [cursor=pointer]
    - alert
  - main [ref=e31]:
    - generic [ref=e32]:
      - generic [ref=e33]:
        - tablist "canvas-1 panels" [ref=e34]:
          - tab "Canvas · canvas-1" [selected] [ref=e35] [cursor=pointer]
          - generic [ref=e36]:
            - button "Collapse active panel in canvas-1" [ref=e37] [cursor=pointer]: ▾
            - button "Panel options in canvas-1" [ref=e38] [cursor=pointer]: ⋯
        - generic "Shader graph canvas" [ref=e41]:
          - group "Image output" [ref=e42]:
            - heading "Image output" [level=3] [ref=e43]
            - generic [ref=e44]:
              - button "Image output input color" [ref=e45] [cursor=pointer]
              - generic [ref=e46]: color
              - generic [ref=e47]: vec4
              - generic "Current local value; edit in Inspector" [ref=e48]: "[0,0,0,0]"
          - generic:
            - button "Untitled shader / pixel" [disabled]
          - generic [ref=e49]:
            - button "New subgraph" [ref=e50] [cursor=pointer]
            - button "Library subgraph" [ref=e51] [cursor=pointer]
            - button "Encapsulate" [ref=e52] [cursor=pointer]
            - button "Make independent" [ref=e53] [cursor=pointer]
            - button "Enter subgraph" [ref=e54] [cursor=pointer]
            - button "Arrange nodes" [ref=e55] [cursor=pointer]
            - button "Frame selection" [ref=e56] [cursor=pointer]
            - group [ref=e57]:
              - generic "Local clipboard" [ref=e58] [cursor=pointer]
            - group [ref=e59]:
              - generic "Structures" [ref=e60] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=e61]:
            - button "Vertex" [ref=e62] [cursor=pointer]
            - button "Pixel" [pressed] [ref=e63] [cursor=pointer]
          - generic [ref=e64]:
            - button "Add Node" [ref=e65] [cursor=pointer]
            - button "Browse nodes" [ref=e68] [cursor=pointer]
            - button "Up" [disabled] [ref=e71]
            - button "Shortcuts" [ref=e74] [cursor=pointer]
      - separator "Resize canvas-1 and canvas-2" [ref=e77]
      - generic [ref=e78]:
        - tablist "canvas-2 panels" [ref=e79]:
          - tab "Canvas · canvas-2" [selected] [ref=e80] [cursor=pointer]
          - generic [ref=e81]:
            - button "Collapse active panel in canvas-2" [ref=e82] [cursor=pointer]: ▾
            - button "Panel options in canvas-2" [ref=e83] [cursor=pointer]: ⋯
        - generic "Shader graph canvas" [ref=e86]:
          - group "Image output" [ref=e87]:
            - heading "Image output" [level=3] [ref=e88]
            - generic [ref=e89]:
              - button "Image output input color" [ref=e90] [cursor=pointer]
              - generic [ref=e91]: color
              - generic [ref=e92]: vec4
              - generic "Current local value; edit in Inspector" [ref=e93]: "[0,0,0,0]"
          - generic:
            - button "Untitled shader / pixel" [disabled]
          - generic [ref=e94]:
            - button "New subgraph" [ref=e95] [cursor=pointer]
            - button "Library subgraph" [ref=e96] [cursor=pointer]
            - button "Encapsulate" [ref=e97] [cursor=pointer]
            - button "Make independent" [ref=e98] [cursor=pointer]
            - button "Enter subgraph" [ref=e99] [cursor=pointer]
            - button "Arrange nodes" [ref=e100] [cursor=pointer]
            - button "Frame selection" [ref=e101] [cursor=pointer]
            - group [ref=e102]:
              - generic "Local clipboard" [ref=e103] [cursor=pointer]
            - group [ref=e104]:
              - generic "Structures" [ref=e105] [cursor=pointer]
              - option "New structure" [selected]
          - generic [ref=e106]:
            - button "Vertex" [ref=e107] [cursor=pointer]
            - button "Pixel" [pressed] [ref=e108] [cursor=pointer]
          - generic [ref=e109]:
            - button "Add Node" [ref=e110] [cursor=pointer]
            - button "Browse nodes" [ref=e113] [cursor=pointer]
            - button "Up" [disabled] [ref=e116]
            - button "Shortcuts" [ref=e119] [cursor=pointer]
    - complementary [ref=e122]:
      - generic [ref=e123]:
        - tablist "inspector panels" [ref=e124]:
          - tab "Inspector · inspector" [selected] [ref=e125] [cursor=pointer]
          - generic [ref=e126]:
            - button "Collapse active panel in inspector" [ref=e127] [cursor=pointer]: ▾
            - button "Panel options in inspector" [ref=e128] [cursor=pointer]: ⋯
        - generic [ref=e131]:
          - heading "Inspector" [level=2] [ref=e132]
          - paragraph [ref=e133]: Select a node to inspect its parameters.
    - separator "right sidebar width" [ref=e134]
  - contentinfo [ref=e135]:
    - button "Project actions" [active] [ref=e136] [cursor=pointer]
    - status [ref=e137]:
      - button "Read full application status" [ref=e138] [cursor=pointer]: Current layout exported.
    - button "Shader output" [ref=e139] [cursor=pointer]
    - button "Panels" [ref=e140] [cursor=pointer]
    - button "Hints" [ref=e141] [cursor=pointer]
```

# Test source

```ts
  1  | import {test,expect} from '../../production/node_modules/@playwright/test/index.mjs';
  2  | import fs from 'node:fs';import path from 'node:path';
  3  | import {clickAction} from '../../production/tests/fixtures/public-actions.ts';
  4  | import {createNode} from '../../production/tests/browser/create-node.ts';
  5  | const dir=path.dirname(new URL(import.meta.url).pathname.replace(/^\/(C:)/,'$1'));
  6  | const save=(name,data)=>fs.writeFileSync(path.join(dir,name+'.json'),JSON.stringify(data,null,2)+'\n');
  7  | async function download(p,name){const d=p.waitForEvent('download');await clickAction(p,name);return JSON.parse(fs.readFileSync((await (await d).path())!,'utf8'));}
  8  | for(const [build,port] of [['source',4237],['archive',4238]] as const){
  9  |  test(build+' adjacent-group keyboard resize retains native focus and Escape restores pair',async({page:p})=>{
  10 |   await p.goto('http://127.0.0.1:'+port);await clickAction(p,'Second Canvas');
  11 |   const divider=p.getByRole('separator',{name:'Resize canvas-1 and canvas-2',exact:true});const before=await download(p,'Export current layout');
  12 |   await divider.click();await p.keyboard.press('ArrowDown');const afterOne=await divider.getAttribute('aria-valuenow');const focus=await p.evaluate(()=>({tag:document.activeElement?.tagName,role:document.activeElement?.getAttribute('role'),label:document.activeElement?.getAttribute('aria-label')}));await p.keyboard.press('ArrowDown');const afterTwo=await divider.getAttribute('aria-valuenow');await p.keyboard.press('Escape');const after=await download(p,'Export current layout');
  13 |   save(build+'-pair-keyboard',{before,afterOne,focus,afterTwo,after});await p.screenshot({path:path.join(dir,build+'-pair-keyboard.png')});
  14 |   expect(focus.label).toBe('Resize canvas-1 and canvas-2');expect(Number(afterTwo)).toBeCloseTo(Number(afterOne)+8,0);expect(after.panes).toEqual(before.panes);
  15 |  });
  16 |  test(build+' adjacent-group native pointer drag changes weights and does not cancel itself',async({page:p})=>{
  17 |   await p.goto('http://127.0.0.1:'+port);await clickAction(p,'Second Canvas');const before=await download(p,'Export current layout');const d=p.getByRole('separator',{name:'Resize canvas-1 and canvas-2',exact:true});const b=(await d.boundingBox())!;
> 18 |   await p.mouse.move(b.x+b.width/2,b.y+b.height/2);await p.mouse.down();await p.mouse.move(b.x+b.width/2,b.y+b.height/2+70,{steps:7});await p.mouse.up();const after=await download(p,'Export current layout');save(build+'-pair-pointer',{before,after});expect(after.panes.find(x=>x.id==='canvas-1').weight).toBeGreaterThan(before.panes.find(x=>x.id==='canvas-1').weight);
     |                                                                                                                                                                                                                                                                                                                 ^ Error: expect(received).toBeGreaterThan(expected)
  19 |  });
  20 |  test(build+' natural Escape after real pane reorder preserves Graph and native focus',async({page:p})=>{
  21 |   await p.goto('http://127.0.0.1:'+port);await createNode(p,'Float');await clickAction(p,'Second Canvas');await p.getByRole('button',{name:'Panel options in canvas-2',exact:true}).click();const menu=p.getByRole('dialog',{name:'Panel options',exact:true});await menu.getByRole('button',{name:'Move group earlier',exact:true}).click();
  22 |   const before=await download(p,'Export JSON');const node=p.locator('#canvas-1 .node h3').filter({hasText:'Float'}).first();const b=(await node.boundingBox())!;await p.mouse.move(b.x+20,b.y+10);await p.mouse.down();await p.mouse.move(b.x+65,b.y+40,{steps:7});const focus=await p.evaluate(()=>({tag:document.activeElement?.tagName,classes:document.activeElement?.className}));await p.keyboard.press('Escape');await p.mouse.up();const after=await download(p,'Export JSON');save(build+'-reorder-escape',{before,after,focus});expect(after).toEqual(before);
  23 |  });
  24 | }
  25 | 
```