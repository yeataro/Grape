# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-owner-corrections.spec.ts >> OC01 new empty zero-alpha shader and old exact public import explicit upgrade save reopen
- Location: ..\..\..\production\tests\browser\s06-owner-corrections.spec.ts:5:1

# Error details

```
Error: locator.setInputFiles: Error: strict mode violation: locator('input[type=file]') resolved to 2 elements:
    1) <input hidden="" type="file" aria-label="Open document file" accept=".json,.grape.json,.png,application/json,image/png"/> aka getByLabel('Open document file')
    2) <input type="file" accept=".json,.sgrape-function.json" aria-label="Import Personal package"/> aka getByLabel('Import Personal package')

Call log:
  - waiting for locator('input[type=file]')

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
    - button "Undo" [disabled] [ref=e24]
    - button "Redo" [disabled] [ref=e27]
    - button "Delete selected" [ref=e30] [cursor=pointer]
    - alert
  - main [ref=e31]:
    - generic [ref=e33]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e34]:
        - group "Image output" [ref=e35]:
          - heading "Image output" [level=3] [ref=e36]
          - generic [ref=e37]:
            - button "Image output input color" [ref=e38] [cursor=pointer]
            - generic [ref=e39]: color
            - generic [ref=e40]: vec4
            - generic "Current local value; edit in Inspector" [ref=e41]: "[0,0,0,0]"
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e42]:
          - button "New subgraph" [ref=e43] [cursor=pointer]
          - button "Library subgraph" [ref=e44] [cursor=pointer]
          - button "Encapsulate" [ref=e45] [cursor=pointer]
          - button "Make independent" [ref=e46] [cursor=pointer]
          - button "Enter subgraph" [ref=e47] [cursor=pointer]
          - button "Arrange nodes" [ref=e48] [cursor=pointer]
          - button "Frame selection" [ref=e49] [cursor=pointer]
          - group [ref=e50]:
            - generic "Local clipboard" [ref=e51] [cursor=pointer]
          - group [ref=e52]:
            - generic "Structures" [ref=e53] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e54]:
          - button "Vertex" [ref=e55] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e56] [cursor=pointer]
        - generic [ref=e57]:
          - button "Add Node" [ref=e58] [cursor=pointer]
          - button "Browse nodes" [ref=e61] [cursor=pointer]
          - button "Up" [disabled] [ref=e64]
          - button "Shortcuts" [ref=e67] [cursor=pointer]
    - complementary [ref=e70]:
      - generic [ref=e71]:
        - heading "Inspector" [level=2] [ref=e72]
        - paragraph [ref=e73]: Select a node to inspect its parameters.
  - contentinfo [ref=e74]:
    - button "Project actions" [active] [ref=e75] [cursor=pointer]
    - status [ref=e76]:
      - button "Read full application status" [ref=e77] [cursor=pointer]: Export started. Saved status is unchanged.
    - button "Shader output" [ref=e78] [cursor=pointer]
    - button "Hints" [ref=e79] [cursor=pointer]
```

# Test source

```ts
  1 | import{expect,type Page}from '@playwright/test';import path from 'node:path';import{fileURLToPath}from 'node:url';import{clickAction}from './public-actions.ts';
  2 | /** Public import of an unchanged 0.2 exact owner; keeps required-input error fixtures explicit. */
> 3 | export async function requiredOutput(page:Page){await clickAction(page,'Open file');await page.locator('input[type=file]').setInputFiles(fileURLToPath(new URL('./required-image-output.grape.json',import.meta.url)));await expect(page.getByRole('dialog',{name:'Review document',exact:true})).toContainText('DOCUMENT_VALID');await page.getByRole('button',{name:'Open in new session',exact:true}).click()}
    |                                                                                     ^ Error: locator.setInputFiles: Error: strict mode violation: locator('input[type=file]') resolved to 2 elements:
  4 | 
```