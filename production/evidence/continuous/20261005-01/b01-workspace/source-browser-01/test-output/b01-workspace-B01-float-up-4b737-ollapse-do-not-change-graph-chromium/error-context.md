# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: b01-workspace.spec.ts >> B01 float upper slot dimensions one owner and keyboard collapse do not change graph
- Location: ..\..\..\..\..\tests\browser\b01-workspace.spec.ts:54:1

# Error details

```
Test timeout of 40000ms exceeded.
```

```
Error: locator.click: Test timeout of 40000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Panel options in parameters-1', exact: true })
    - locator resolved to <button type="button" aria-label="Panel options in parameters-1">⋯</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <dialog open="" data-kind="upper-slot" aria-label="Inspector · inspector" class="floating-surface workspace-float">…</dialog> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <dialog open="" data-kind="upper-slot" aria-label="Inspector · inspector" class="floating-surface workspace-float">…</dialog> intercepts pointer events
    - retrying click action
      - waiting 100ms
    76 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <dialog open="" data-kind="upper-slot" aria-label="Inspector · inspector" class="floating-surface workspace-float">…</dialog> intercepts pointer events
     - retrying click action
       - waiting 500ms

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
      - tablist "canvas-1 panels" [ref=e34]:
        - tab "Canvas · canvas-1" [selected] [ref=e35] [cursor=pointer]
        - generic [ref=e36]:
          - button "Collapse active panel in canvas-1" [ref=e37] [cursor=pointer]: ▾
          - button "Panel options in canvas-1" [ref=e38] [cursor=pointer]: ⋯
      - generic "Shader graph canvas" [ref=e41]:
        - generic:
          - generic:
            - generic:
              - group "Image output" [ref=e42]:
                - heading "Image output" [level=3] [ref=e43]
                - generic [ref=e44]:
                  - button "Image output input color" [ref=e45] [cursor=pointer]
                  - generic [ref=e46]: color
                  - generic [ref=e47]: vec4
                  - generic "Current local value; edit in Inspector" [ref=e48]: "[0,0,0,0]"
              - group "Float" [ref=e49]:
                - heading "Float" [level=3] [ref=e50]
                - generic [ref=e51]:
                  - button "Float output value" [ref=e52] [cursor=pointer]
                  - generic [ref=e53]: value
                  - generic [ref=e54]: float
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e55]:
          - button "New subgraph" [ref=e56] [cursor=pointer]
          - button "Library subgraph" [ref=e57] [cursor=pointer]
          - button "Encapsulate" [ref=e58] [cursor=pointer]
          - button "Make independent" [ref=e59] [cursor=pointer]
          - button "Enter subgraph" [ref=e60] [cursor=pointer]
          - button "Arrange nodes" [ref=e61] [cursor=pointer]
          - button "Frame selection" [ref=e62] [cursor=pointer]
          - group [ref=e63]:
            - generic "Local clipboard" [ref=e64] [cursor=pointer]
          - group [ref=e65]:
            - generic "Structures" [ref=e66] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e67]:
          - button "Vertex" [ref=e68] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e69] [cursor=pointer]
        - generic [ref=e70]:
          - button "Add Node" [ref=e71] [cursor=pointer]
          - button "Browse nodes" [ref=e74] [cursor=pointer]
          - button "Up" [disabled] [ref=e77]
          - button "Shortcuts" [ref=e80] [cursor=pointer]
    - complementary [ref=e83]:
      - generic [ref=e84]:
        - tablist "parameters-1 panels" [ref=e85]:
          - tab "Inspector · parameters-1" [selected] [ref=e86] [cursor=pointer]
          - generic [ref=e87]:
            - button "Collapse active panel in parameters-1" [ref=e88] [cursor=pointer]: ▾
            - button "Panel options in parameters-1" [ref=e89] [cursor=pointer]: ⋯
        - generic [ref=e92]:
          - heading "Inspector" [level=2] [ref=e93]
          - paragraph [ref=e94]: Float
          - button "Rename node" [ref=e95] [cursor=pointer]
          - generic [ref=e98]:
            - generic [ref=e99]: Value
            - textbox "Value" [ref=e100]: "0.25"
            - alert
    - separator "right sidebar width" [ref=e101]
    - dialog "Inspector · inspector" [ref=e102]:
      - heading "Inspector · inspector" [level=2] [ref=e103]
      - button "Collapse Parameters" [ref=e104] [cursor=pointer]
      - generic [ref=e105]:
        - separator "Parameters floating width" [active] [ref=e106]
        - generic [ref=e109]:
          - heading "Inspector" [level=2] [ref=e110]
          - paragraph [ref=e111]: Float
          - button "Rename node" [ref=e112] [cursor=pointer]
          - generic [ref=e115]:
            - generic [ref=e116]: Value
            - textbox "Value" [ref=e117]: "0.25"
            - alert
      - button "Return Parameters to dock" [ref=e118] [cursor=pointer]
  - contentinfo [ref=e119]:
    - button "Project actions" [ref=e120] [cursor=pointer]
    - status [ref=e121]:
      - button "Read full application status" [ref=e122] [cursor=pointer]: Export started. Saved status is unchanged.
    - button "Shader output" [ref=e123] [cursor=pointer]
    - button "Hints" [ref=e124] [cursor=pointer]
```

# Test source

```ts
  1  | import {test,expect,type Page} from "@playwright/test";
  2  | import fs from "node:fs";import path from "node:path";
  3  | import {createNode} from "./create-node.ts";
  4  | import {clickAction} from "../fixtures/public-actions.ts";
  5  | const evidence=process.env.GRAPE_EVIDENCE_DIR!;
  6  | const save=(name:string,value:unknown)=>fs.writeFileSync(path.join(evidence,name+".json"),JSON.stringify(value,null,2)+"\n");
  7  | async function download(p:Page,action:string){const pending=p.waitForEvent("download");await clickAction(p,action);return JSON.parse(fs.readFileSync((await (await pending).path())!,"utf8"));}
> 8  | async function options(p:Page,pane:string){await p.getByRole("button",{name:"Panel options in "+pane,exact:true}).click();return p.getByRole("dialog",{name:"Panel options",exact:true});}
     |                                                                                                                   ^ Error: locator.click: Test timeout of 40000ms exceeded.
  9  | async function option(p:Page,pane:string,label:string){const menu=await options(p,pane);await menu.getByRole("button",{name:label,exact:true}).click();}
  10 | async function importLayout(p:Page,value:any){const chooser=p.waitForEvent("filechooser");await clickAction(p,"Import current layout");await(await chooser).setFiles({name:"current-layout.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(value))});}
  11 | async function setup(p:Page){await p.goto("/");await createNode(p,"Float");await expect(p.locator("#canvas-1 .node.selected")).toHaveCount(1);}
  12 | const field=(p:Page,id="inspector")=>p.locator("#panel-"+id).getByRole("textbox",{name:"Value",exact:true});
  13 | test("B01 public two Canvas and two Parameters share edits but retain selection Stage and camera",async({page:p})=>{
  14 |   await setup(p);await clickAction(p,"Second Canvas");await clickAction(p,"Add Parameters");await expect(p.locator(".canvas")).toHaveCount(2);await expect(p.locator(".inspector")).toHaveCount(2);
  15 |   await expect(field(p)).toHaveCount(0);await p.locator("#canvas-1 .node.selected h3").click();await expect(field(p)).toBeVisible();await expect(field(p,"parameters-1")).toBeVisible();
  16 |   const before=await download(p,"Export JSON");await field(p).fill("0.625");await field(p).press("Enter");await expect(field(p,"parameters-1")).toHaveValue("0.625");
  17 |   await p.getByRole("tab",{name:"Inspector · parameters-1",exact:true}).click();await expect(field(p)).toHaveValue("0.625");
  18 |   await p.locator("#canvas-2").getByRole("button",{name:"Vertex",exact:true}).click();await expect(p.locator("#canvas-2 .canvas-breadcrumb")).toContainText("vertex");await expect(p.locator("#canvas-1 .canvas-breadcrumb")).toContainText("pixel");
  19 |   const camera1=await p.locator("#canvas-1 .viewport").getAttribute("style");await p.locator("#canvas-2 .canvas").hover({position:{x:300,y:150}});await p.mouse.wheel(0,-120);await expect(p.locator("#canvas-1 .viewport")).toHaveAttribute("style",camera1!);
  20 |   const after=await download(p,"Export JSON");save("two-contexts",{before,after,camera1,secondCamera:await p.locator("#canvas-2 .viewport").getAttribute("style")});await p.screenshot({path:path.join(evidence,"two-contexts.png")});
  21 | });
  22 | test("B01 public groups fixed follow hide close and Parameters activation have explicit missing state",async({page:p})=>{
  23 |   await setup(p);await clickAction(p,"Second Canvas");await clickAction(p,"Add Parameters");
  24 |   let menu=await options(p,"parameters-1");await menu.getByLabel("Panel link group").fill("2");await menu.getByLabel("Panel link group").press("Tab");await p.keyboard.press("Escape");await expect(p.locator('[data-pane="parameters-1"] .workspace-route-status')).toHaveText("No Canvas source");
  25 |   menu=await options(p,"canvas-1");await menu.getByLabel("Panel link group").fill("2");await menu.getByLabel("Panel link group").press("Tab");await p.keyboard.press("Escape");await p.getByRole("tab",{name:"Canvas · canvas-1",exact:true}).click();await expect(field(p,"parameters-1")).toBeVisible();
  26 |   menu=await options(p,"inspector");await menu.getByLabel("Panel source").selectOption("canvas-1");await p.keyboard.press("Escape");await option(p,"canvas-1","Hide panel");await expect(field(p)).toBeVisible();
  27 |   await clickAction(p,"Show hidden panels");await option(p,"canvas-1","Close panel");await expect(p.locator('[data-pane="inspector"] .workspace-route-status')).toHaveText("No Canvas source");await expect(p.locator('[data-pane="parameters-1"] .workspace-route-status')).toHaveText("No Canvas source");
  28 |   save("routing-layout",await download(p,"Export current layout"));
  29 | });
  30 | test("B01 public draft survives move hide collapse float while close and route change veto",async({page:p})=>{
  31 |   await setup(p);const before=await download(p,"Export JSON");await field(p).fill("0.");
  32 |   await option(p,"inspector","Close panel");await expect(p.locator("#message")).toContainText("PANEL_CLOSE_VETO");await expect(field(p)).toHaveValue("0.");
  33 |   await option(p,"inspector","Split to left");await expect(field(p)).toHaveValue("0.");await option(p,"pane-1","Float Parameters");await expect(field(p)).toHaveValue("0.");
  34 |   await p.getByRole("button",{name:"Collapse Parameters",exact:true}).click();await expect(field(p)).not.toBeVisible();await p.getByRole("button",{name:"Expand Parameters",exact:true}).click();await expect(field(p)).toHaveValue("0.");
  35 |   await p.getByRole("button",{name:"Return Parameters to dock",exact:true}).click();await expect(field(p)).toHaveValue("0.");await option(p,"pane-1","Hide panel");await clickAction(p,"Show hidden panels");await expect(field(p)).toHaveValue("0.");
  36 |   await field(p).press("Escape");expect(await download(p,"Export JSON")).toEqual(before);await p.screenshot({path:path.join(evidence,"preserved-draft.png")});
  37 | });
  38 | test("B01 public current layout roundtrip fresh context mapping and malformed atomic rejection",async({page:p})=>{
  39 |   await setup(p);await clickAction(p,"Second Canvas");await clickAction(p,"Add Parameters");await p.getByRole("tab",{name:"Canvas · canvas-1",exact:true}).click();
  40 |   await option(p,"parameters-1","Move to inspector");const layout=await download(p,"Export current layout"),document=await download(p,"Export JSON");
  41 |   expect(JSON.stringify(layout)).not.toContain('"loadId"');expect(JSON.stringify(layout)).not.toContain('"contextId"');
  42 |   await clickAction(p,"Save current layout");await clickAction(p,"Restore current layout");await expect(p.locator(".canvas")).toHaveCount(2);await expect(p.locator('[data-pane="inspector"] .workspace-route-status')).toHaveText("No Canvas source");
  43 |   await p.getByRole("tab",{name:"Canvas · canvas-1",exact:true}).click();await expect(field(p,"parameters-1")).toBeVisible();expect(await download(p,"Export JSON")).toEqual(document);
  44 |   const bads=[{...layout,version:99},{...layout,panels:[...layout.panels,layout.panels[0]]},{...layout,widths:{left:1,right:320}}];
  45 |   for(const bad of bads){await importLayout(p,bad);await expect(p.locator("#message")).toContainText(/LAYOUT_/);expect(await download(p,"Export current layout")).toEqual(layout);expect(await download(p,"Export JSON")).toEqual(document);}
  46 |   const missing=structuredClone(layout);missing.panels.find((r:any)=>r.id==="parameters-1").typeId="missing.panel";await importLayout(p,missing);await expect(p.getByText(/PANEL_UNAVAILABLE/).first()).toBeVisible();expect((await download(p,"Export current layout")).panels.find((r:any)=>r.id==="parameters-1").typeId).toBe("missing.panel");save("restored-layout",layout);
  47 | });
  48 | test("B01 divider keyboard pointer cancel targeted reset preferred width and narrow clamp preserve Graph",async({page:p})=>{
  49 |   await setup(p);const before=await download(p,"Export JSON"),divider=p.getByRole("separator",{name:"right sidebar width",exact:true});
  50 |   await divider.click();await p.keyboard.press("End");expect((await download(p,"Export current layout")).widths.right).toBe(640);await divider.click();await p.keyboard.press("Home");await p.keyboard.press("Shift+ArrowLeft");expect(await divider.getAttribute("aria-valuenow")).toBe("332");await p.keyboard.press("Escape");expect(await divider.getAttribute("aria-valuenow")).toBe("640");
  51 |   await p.setViewportSize({width:620,height:800});await expect(p.getByRole("button",{name:"Close right overlay",exact:true})).toBeVisible();await p.getByRole("button",{name:"Close right overlay",exact:true}).click();await p.setViewportSize({width:1440,height:1000});await expect(field(p)).toBeVisible();expect((await download(p,"Export current layout")).widths.right).toBe(640);
  52 |   await divider.dblclick();expect((await download(p,"Export current layout")).widths.right).toBe(320);const b=(await divider.boundingBox())!;await p.mouse.move(b.x+3,b.y+80);await p.mouse.down();await p.mouse.move(b.x-90,b.y+80,{steps:12});await p.keyboard.press("Escape");await p.mouse.up();expect((await download(p,"Export current layout")).widths.right).toBe(320);expect(await download(p,"Export JSON")).toEqual(before);
  53 | });
  54 | test("B01 float upper slot dimensions one owner and keyboard collapse do not change graph",async({page:p})=>{
  55 |   await setup(p);await clickAction(p,"Add Parameters");const before=await download(p,"Export JSON");await option(p,"inspector","Float Parameters");
  56 |   const floating=p.locator(".workspace-float"),b=(await floating.boundingBox())!;expect(b.x+b.width).toBeCloseTo(1428,0);expect(b.y).toBe(12);expect(b.width).toBe(320);
  57 |   const resize=p.getByRole("separator",{name:"Parameters floating width"});await resize.click();await p.keyboard.press("Home");expect((await floating.boundingBox())!.width).toBe(280);await p.keyboard.press("Escape");expect((await floating.boundingBox())!.width).toBe(320);
  58 |   await option(p,"parameters-1","Float Parameters");await expect(floating).toHaveCount(1);await expect(floating).toHaveAttribute("aria-label","Inspector · parameters-1");await expect(field(p)).toBeVisible();
  59 |   await p.setViewportSize({width:620,height:700});await p.screenshot({path:path.join(evidence,"float-narrow.png")});await p.getByRole("button",{name:"Return Parameters to dock",exact:true}).click();expect(await download(p,"Export JSON")).toEqual(before);
  60 | });
  61 | test("B01 current layout storage refusal is visible and never reports saved",async({page:p})=>{
  62 |   await p.addInitScript(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==="grape.workspace.current.v1")throw new DOMException("Denied","SecurityError");return original.call(this,k,v);};});await setup(p);const before=await download(p,"Export JSON");await clickAction(p,"Save current layout");await expect(p.locator("#message")).toContainText("Denied");expect(await download(p,"Export JSON")).toEqual(before);
  63 | });
  64 | 
```