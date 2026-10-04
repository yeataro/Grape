# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-owner-config.spec.ts >> OC05 host composition config false rejects existing edge without model or History changes
- Location: ..\..\..\production\tests\browser\s06-owner-config.spec.ts:2:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.canvas').locator('.canvas-notice')
Expected substring: "INPUT_CONNECTED"
Received string:    "INPUT_OCCUPIED: INPUT_OCCUPIED"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('.canvas').locator('.canvas-notice')
    14 × locator resolved to <div role="status" class="canvas-notice">…</div>
       - unexpected value "INPUT_OCCUPIED: INPUT_OCCUPIED"

```

```yaml
- status:
  - button "Read full Canvas status": "INPUT_OCCUPIED: INPUT_OCCUPIED"
```

# Test source

```ts
  1 | import{test,expect}from '@playwright/test';import fs from 'node:fs';import path from 'node:path';import{createNode}from './create-node.ts';import{clickAction}from '../fixtures/public-actions.ts';
> 2 | test('OC05 host composition config false rejects existing edge without model or History changes',async({page})=>{await page.route('**/apps/web/main.ts*',async route=>{const response=await route.fetch(),text=await response.text();const changed=text.replace('canvasType,','createCanvasType, canvasType,').replace('workspace.register(canvasType);','workspace.register(createCanvasType({ replaceConnections: false }));');expect(changed).not.toBe(text);await route.fulfill({response,body:changed})});await page.goto('/');await createNode(page,'Color RGBA');await createNode(page,'Vector 3');const c=page.locator('.canvas'),outs=c.locator('[data-direction=output]'),input=c.locator('[data-port=color]');const doc=async()=>{const wait=page.waitForEvent('download');await clickAction(page,'Export JSON');return JSON.parse(fs.readFileSync((await(await wait).path())!,'utf8'))};await outs.nth(0).click();await input.click();const before=await doc();await outs.nth(1).click();await input.click();await expect(c.locator('.canvas-notice')).toContainText('INPUT_CONNECTED');expect(await doc()).toEqual(before);await clickAction(page,'Undo');expect((await doc()).graph.stages.find((s:any)=>s.key==='pixel').network.edges).toHaveLength(0);await clickAction(page,'Redo');expect(await doc()).toEqual(before);fs.writeFileSync(path.join(process.env.GRAPE_EVIDENCE_DIR!,'config-false.json'),JSON.stringify({classification:'Source-only public host composition fixture; no model mutation bypass',before},null,2))});
    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ^ Error: expect(locator).toContainText(expected) failed
  3 | 
```