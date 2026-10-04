# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-owner-corrections.spec.ts >> OC01 new empty zero-alpha shader and old exact public import explicit upgrade save reopen
- Location: ..\..\..\production\tests\browser\s06-owner-corrections.spec.ts:5:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('dialog', { name: 'Review document', exact: true })
Expected substring: "DOCUMENT_VALID"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Review document', exact: true })

```

```yaml
- banner:
  - text: Grape SHADER WORKSPACE Development · unversioned
  - button "本輪更新"
  - navigation "Document actions":
    - button "Save"
    - button "Generate GLSL"
  - text: Unsaved changes Host-free
- button "Undo" [disabled]
- button "Redo" [disabled]
- button "Delete selected"
- alert
- main:
  - text: Canvas 1
  - img
  - group "Image output":
    - heading "Image output" [level=3]
    - button "Image output input color"
    - text: color vec4 [0,0,0,0]
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
  - button "Vertex"
  - button "Pixel" [pressed]
  - button "Add Node"
  - button "Browse nodes"
  - button "Up" [disabled]
  - button "Shortcuts"
  - img
  - complementary:
    - heading "Inspector" [level=2]
    - paragraph: Select a node to inspect its parameters.
- contentinfo:
  - button "Project actions"
  - status:
    - button "Read full application status": Export started. Saved status is unchanged.
  - button "Shader output"
  - button "Hints"
- dialog:
  - heading "Review document" [level=2]
  - paragraph: "blocked: IMPORT_ERRORS. The current graph was not replaced. You can export the original source."
  - button "Export original"
  - button "Close"
  - paragraph: Opening in a new session preserves model errors for re-save and starts empty History. Import acceptance requires a valid candidate and the current exact modules.
  - text: "{ \"diagnostics\": [ { \"code\": \"INPUT_REQUIRED\", \"message\": \"Connect the required input.\", \"severity\": \"error\", \"messageRef\": { \"owner\": { \"moduleId\": \"grape.core\", \"version\": \"0.1.0\", \"fingerprint\": \"core-s01-v1\", \"namespace\": \"grape.core\", \"catalogVersion\": 1 }, \"key\": \"INPUT_REQUIRED\", \"fallback\": \"Connect the required input.\" }, \"subject\": { \"graphId\": \"id-8\", \"stageId\": \"id-13\", \"nodeId\": \"id-12\", \"portKey\": \"color\" } } ], \"repairs\": [], \"provenance\": { \"format\": \"grape.document\", \"sourceVersion\": { \"major\": 2, \"minor\": 1 }, \"sourceGraphId\": \"id-8\", \"conversion\": \"none\", \"legacyGate\": null }, \"unknownPaths\": [], \"candidate\": null } { \"format\": \"grape.document\", \"formatVersion\": { \"major\": 2, \"minor\": 1 }, \"graph\": { \"id\": \"id-8\", \"name\": \"Untitled shader\", \"kind\": { \"moduleId\": \"grape.graph-kinds\", \"version\": \"0.2.0\", \"fingerprint\": \"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\", \"kindId\": \"grape.image\" }, \"kindSettings\": {}, \"modules\": [ { \"moduleId\": \"grape.nodes.basic\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\" }, { \"moduleId\": \"grape.nodes.networks\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\" }, { \"moduleId\": \"grape.graph-kinds\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:30d1266c367648c97b57a6cf77eec9d0bf14ac8bdb057fa4eef457539adb98c3\" }, { \"moduleId\": \"grape.resources.extents\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:bcfaaca3ef01c57070e05b26e09bbcacde5d51f6ba0091b8b6aaf3d83efa3c60\" }, { \"moduleId\": \"grape.resources.image-sources\", \"version\": \"0.2.0\", \"fingerprint\": \"sha256:bb0ff902b36d7a07fc104412d0ccb11e4e7efed0106aa3c8595026dbcef8b212\" }, { \"moduleId\": \"grape.nodes.image-output\", \"version\": \"0.2.0\", \"fingerprint\": \"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\" }, { \"moduleId\": \"grape.graph-kinds\", \"version\": \"0.2.0\", \"fingerprint\": \"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\" } ], \"stages\": [ { \"id\": \"id-10\", \"key\": \"vertex\", \"stageKindId\": \"grape.stage.vertex\", \"implementation\": \"profile-default\", \"network\": { \"id\": \"id-9\", \"nodes\": [], \"edges\": [], \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-13\", \"key\": \"pixel\", \"stageKindId\": \"grape.stage.pixel\", \"implementation\": \"network\", \"network\": { \"id\": \"id-11\", \"nodes\": [ { \"id\": \"id-12\", \"name\": \"Image output\", \"type\": { \"moduleId\": \"grape.nodes.image-output\", \"version\": \"0.2.0\", \"fingerprint\": \"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\", \"typeId\": \"image-output\" }, \"state\": {}, \"inputValues\": {}, \"ports\": [ { \"key\": \"color\", \"direction\": \"input\", \"type\": \"glsl.vec4\", \"supply\": \"required\", \"connectionPolicy\": \"numeric\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 650, 180 ], \"extensions\": {} } ], \"edges\": [], \"extensions\": {} }, \"extensions\": {} } ], \"resources\": [], \"losses\": [], \"recovery\": [], \"extensions\": {} } }"
  - status
  - button "Open in new session"
```

# Test source

```ts
  1 | import{expect,type Page}from '@playwright/test';import path from 'node:path';import{fileURLToPath}from 'node:url';import{clickAction}from './public-actions.ts';
  2 | /** Public import of an unchanged 0.2 exact owner; keeps required-input error fixtures explicit. */
> 3 | export async function requiredOutput(page:Page){await clickAction(page,'Open file');await page.getByLabel('Open document file',{exact:true}).setInputFiles(fileURLToPath(new URL('./required-image-output.grape.json',import.meta.url)));await expect(page.getByRole('dialog',{name:'Review document',exact:true})).toContainText('DOCUMENT_VALID');await page.getByRole('button',{name:'Open in new session',exact:true}).click()}
    |                                                                                                                                                                                                                                                                                                                     ^ Error: expect(locator).toContainText(expected) failed
  4 | 
```