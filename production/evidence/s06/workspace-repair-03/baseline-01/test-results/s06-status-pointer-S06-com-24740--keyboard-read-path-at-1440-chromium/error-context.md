# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-status-pointer.spec.ts >> S06 complete persistent loss details have a keyboard read path at 1440
- Location: ..\..\..\production\tests\browser\s06-status-pointer.spec.ts:33:34

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.canvas').first().getByRole('heading', { name: 'Shared arithmetic', exact: true }).last()

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
    - generic [ref=e43]:
      - generic [ref=e44]: Unsaved changes
      - generic [ref=e45]: Host-free
  - status [ref=e46]
  - generic [ref=e48]:
    - button "Undo" [disabled] [ref=e49]
    - button "Redo" [disabled] [ref=e52]
    - button "Delete selected" [ref=e55] [cursor=pointer]
    - alert
  - main [ref=e56]:
    - generic [ref=e58]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e59]:
        - group "Image output" [ref=e60]:
          - heading "Image output" [level=3] [ref=e61]
          - generic [ref=e62]:
            - button "Image output input color" [ref=e63] [cursor=pointer]:
              - generic [ref=e65]: color
            - generic [ref=e66]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e67]:
          - button "New subgraph" [ref=e68] [cursor=pointer]
          - button "Library subgraph" [ref=e69] [cursor=pointer]
          - button "Encapsulate" [ref=e70] [cursor=pointer]
          - button "Make independent" [ref=e71] [cursor=pointer]
          - button "Enter subgraph" [ref=e72] [cursor=pointer]
          - button "Arrange nodes" [ref=e73] [cursor=pointer]
          - button "Frame selection" [ref=e74] [cursor=pointer]
          - group [ref=e75]:
            - generic "Local clipboard" [ref=e76] [cursor=pointer]
          - group [ref=e77]:
            - generic "Structures" [ref=e78] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e79]:
          - button "Vertex" [ref=e80] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e81] [cursor=pointer]
        - generic [ref=e82]:
          - button "Add Node" [ref=e83] [cursor=pointer]
          - button "Browse nodes" [ref=e86] [cursor=pointer]
          - button "Up" [disabled] [ref=e89]
          - button "Shortcuts" [ref=e92] [cursor=pointer]
    - complementary [ref=e95]:
      - generic [ref=e96]:
        - heading "Inspector" [level=2] [ref=e97]
        - paragraph [ref=e98]: Select a node to inspect its parameters.
  - generic [ref=e100]:
    - heading "Shader output" [level=2] [ref=e101]
    - paragraph [ref=e102]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e103]:
      - listitem [ref=e104]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e105] [cursor=pointer]
  - contentinfo [ref=e106]:
    - generic [ref=e107]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e108]: Scroll to zoom · Drag empty space to pan
  - dialog [ref=e109]:
    - heading "Review document" [level=2] [ref=e110]
    - paragraph [ref=e111]: "valid: DOCUMENT_VALID. The current graph was not replaced. You can export the original source."
    - button "Export original" [ref=e112] [cursor=pointer]
    - button "Close" [ref=e113] [cursor=pointer]
    - paragraph [ref=e114]: Opening in a new session preserves model errors for re-save and starts empty History. Import acceptance requires a valid candidate and the current exact modules.
    - generic "Inspection and proposal" [ref=e115]: "{ \"diagnostics\": [], \"repairs\": [], \"provenance\": { \"format\": \"grape.document\", \"sourceVersion\": { \"major\": 2, \"minor\": 1 }, \"sourceGraphId\": \"id-15\", \"conversion\": \"none\", \"legacyGate\": null }, \"unknownPaths\": [], \"candidate\": { \"format\": \"grape.document\", \"formatVersion\": { \"major\": 2, \"minor\": 1 }, \"graph\": { \"id\": \"id-15\", \"name\": \"Untitled shader\", \"kind\": { \"moduleId\": \"grape.graph-kinds\", \"version\": \"0.2.0\", \"fingerprint\": \"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\", \"kindId\": \"grape.image\" }, \"kindSettings\": {}, \"modules\": [ { \"moduleId\": \"grape.nodes.basic\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\" }, { \"moduleId\": \"grape.nodes.networks\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\" }, { \"moduleId\": \"grape.graph-kinds\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:30d1266c367648c97b57a6cf77eec9d0bf14ac8bdb057fa4eef457539adb98c3\" }, { \"moduleId\": \"grape.resources.extents\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:bcfaaca3ef01c57070e05b26e09bbcacde5d51f6ba0091b8b6aaf3d83efa3c60\" }, { \"moduleId\": \"grape.resources.image-sources\", \"version\": \"0.2.0\", \"fingerprint\": \"sha256:bb0ff902b36d7a07fc104412d0ccb11e4e7efed0106aa3c8595026dbcef8b212\" }, { \"moduleId\": \"grape.nodes.image-output\", \"version\": \"0.2.0\", \"fingerprint\": \"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\" }, { \"moduleId\": \"grape.graph-kinds\", \"version\": \"0.2.0\", \"fingerprint\": \"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\" }, { \"moduleId\": \"grape.resources.function-networks\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:25d291427adb77405f826a636cd2a7c9a5851f0017cb779ced1a13e5a9b0b9e7\" }, { \"moduleId\": \"grape.nodes.function-operations\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\" } ], \"stages\": [ { \"id\": \"id-17\", \"key\": \"vertex\", \"stageKindId\": \"grape.stage.vertex\", \"implementation\": \"profile-default\", \"network\": { \"id\": \"id-16\", \"nodes\": [], \"edges\": [], \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-20\", \"key\": \"pixel\", \"stageKindId\": \"grape.stage.pixel\", \"implementation\": \"network\", \"network\": { \"id\": \"id-18\", \"nodes\": [ { \"id\": \"id-19\", \"name\": \"Image output\", \"type\": { \"moduleId\": \"grape.nodes.image-output\", \"version\": \"0.2.0\", \"fingerprint\": \"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\", \"typeId\": \"image-output\" }, \"state\": {}, \"inputValues\": {}, \"ports\": [ { \"key\": \"color\", \"direction\": \"input\", \"type\": \"glsl.vec4\", \"supply\": \"required\", \"connectionPolicy\": \"numeric\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 650, 180 ], \"extensions\": {} }, { \"id\": \"id-26\", \"name\": \"Shared arithmetic\", \"type\": { \"moduleId\": \"grape.nodes.networks\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\", \"typeId\": \"call\" }, \"state\": { \"definition\": \"id-22\" }, \"inputValues\": { \"x\": 0.2 }, \"ports\": [ { \"key\": \"x\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0.2 }, { \"key\": \"y\", \"direction\": \"output\", \"type\": \"glsl.float\", \"defaultValue\": 0 }, { \"key\": \"twice\", \"direction\": \"output\", \"type\": \"glsl.float\", \"defaultValue\": 0 } ], \"references\": [ { \"slot\": \"definition\", \"kind\": \"resource\", \"targetId\": \"id-22\" } ], \"referencesComplete\": true, \"position\": [ 160, 120 ], \"extensions\": {} }, { \"id\": \"id-32\", \"name\": \"Compose\", \"type\": { \"moduleId\": \"grape.nodes.basic\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\", \"typeId\": \"compose\" }, \"state\": { \"mode\": \"vec4\" }, \"inputValues\": { \"x\": 0, \"y\": 0, \"z\": 0, \"w\": 1 }, \"ports\": [ { \"key\": \"x\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0 }, { \"key\": \"y\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0 }, { \"key\": \"z\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0 }, { \"key\": \"w\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 1 }, { \"key\": \"result\", \"direction\": \"output\", \"type\": \"glsl.vec4\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 600, 100 ], \"extensions\": {} }, { \"id\": \"id-35\", \"name\": \"Subgraph\", \"type\": { \"moduleId\": \"grape.nodes.networks\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\", \"typeId\": \"call\" }, \"state\": { \"definition\": \"id-22\", \"inputOverrides\": [ \"x\" ] }, \"inputValues\": { \"x\": 0.3 }, \"ports\": [ { \"key\": \"x\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0.2 }, { \"key\": \"y\", \"direction\": \"output\", \"type\": \"glsl.float\", \"defaultValue\": 0 }, { \"key\": \"twice\", \"direction\": \"output\", \"type\": \"glsl.float\", \"defaultValue\": 0 } ], \"references\": [ { \"slot\": \"definition\", \"kind\": \"resource\", \"targetId\": \"id-22\" } ], \"referencesComplete\": true, \"position\": [ 200, 140 ], \"extensions\": {} }, { \"id\": \"id-38\", \"name\": \"Constant input\", \"type\": { \"moduleId\": \"grape.nodes.function-operations\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\", \"typeId\": \"constant-input\" }, \"state\": {}, \"inputValues\": {}, \"ports\": [ { \"key\": \"value\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"required\", \"requireConstant\": true }, { \"key\": \"value\", \"direction\": \"output\", \"type\": \"glsl.float\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 120, 250 ], \"extensions\": {} }, { \"id\": \"id-40\", \"name\": \"Constant input 2\", \"type\": { \"moduleId\": \"grape.nodes.function-operations\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\", \"typeId\": \"constant-input\" }, \"state\": {}, \"inputValues\": {}, \"ports\": [ { \"key\": \"value\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"required\", \"requireConstant\": true }, { \"key\": \"value\", \"direction\": \"output\", \"type\": \"glsl.float\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 120, 380 ], \"extensions\": {} }, { \"id\": \"id-42\", \"name\": \"Constant input 3\", \"type\": { \"moduleId\": \"grape.nodes.function-operations\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\", \"typeId\": \"constant-input\" }, \"state\": {}, \"inputValues\": {}, \"ports\": [ { \"key\": \"value\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"required\", \"requireConstant\": true }, { \"key\": \"value\", \"direction\": \"output\", \"type\": \"glsl.float\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 120, 510 ], \"extensions\": {} }, { \"id\": \"id-44\", \"name\": \"Constant input 4\", \"type\": { \"moduleId\": \"grape.nodes.function-operations\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\", \"typeId\": \"constant-input\" }, \"state\": {}, \"inputValues\": {}, \"ports\": [ { \"key\": \"value\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"required\", \"requireConstant\": true }, { \"key\": \"value\", \"direction\": \"output\", \"type\": \"glsl.float\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 120, 640 ], \"extensions\": {} }, { \"id\": \"id-46\", \"name\": \"Constant input 5\", \"type\": { \"moduleId\": \"grape.nodes.function-operations\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\", \"typeId\": \"constant-input\" }, \"state\": {}, \"inputValues\": {}, \"ports\": [ { \"key\": \"value\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"required\", \"requireConstant\": true }, { \"key\": \"value\", \"direction\": \"output\", \"type\": \"glsl.float\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 120, 770 ], \"extensions\": {} }, { \"id\": \"id-48\", \"name\": \"Constant input 6\", \"type\": { \"moduleId\": \"grape.nodes.function-operations\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\", \"typeId\": \"constant-input\" }, \"state\": {}, \"inputValues\": {}, \"ports\": [ { \"key\": \"value\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"required\", \"requireConstant\": true }, { \"key\": \"value\", \"direction\": \"output\", \"type\": \"glsl.float\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 120, 900 ], \"extensions\": {} }, { \"id\": \"id-50\", \"name\": \"Constant input 7\", \"type\": { \"moduleId\": \"grape.nodes.function-operations\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\", \"typeId\": \"constant-input\" }, \"state\": {}, \"inputValues\": {}, \"ports\": [ { \"key\": \"value\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"required\", \"requireConstant\": true }, { \"key\": \"value\", \"direction\": \"output\", \"type\": \"glsl.float\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 120, 1030 ], \"extensions\": {} }, { \"id\": \"id-52\", \"name\": \"Constant input 8\", \"type\": { \"moduleId\": \"grape.nodes.function-operations\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\", \"typeId\": \"constant-input\" }, \"state\": {}, \"inputValues\": {}, \"ports\": [ { \"key\": \"value\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"required\", \"requireConstant\": true }, { \"key\": \"value\", \"direction\": \"output\", \"type\": \"glsl.float\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 120, 1160 ], \"extensions\": {} }, { \"id\": \"id-54\", \"name\": \"Constant input 9\", \"type\": { \"moduleId\": \"grape.nodes.function-operations\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\", \"typeId\": \"constant-input\" }, \"state\": {}, \"inputValues\": {}, \"ports\": [ { \"key\": \"value\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"required\", \"requireConstant\": true }, { \"key\": \"value\", \"direction\": \"output\", \"type\": \"glsl.float\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 120, 1290 ], \"extensions\": {} }, { \"id\": \"id-56\", \"name\": \"Constant input 10\", \"type\": { \"moduleId\": \"grape.nodes.function-operations\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\", \"typeId\": \"constant-input\" }, \"state\": {}, \"inputValues\": {}, \"ports\": [ { \"key\": \"value\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"required\", \"requireConstant\": true }, { \"key\": \"value\", \"direction\": \"output\", \"type\": \"glsl.float\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 120, 1420 ], \"extensions\": {} } ], \"edges\": [ { \"id\": \"id-33\", \"from\": { \"nodeId\": \"id-26\", \"portKey\": \"y\" }, \"to\": { \"nodeId\": \"id-32\", \"portKey\": \"x\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-34\", \"from\": { \"nodeId\": \"id-26\", \"portKey\": \"twice\" }, \"to\": { \"nodeId\": \"id-32\", \"portKey\": \"y\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-36\", \"from\": { \"nodeId\": \"id-35\", \"portKey\": \"twice\" }, \"to\": { \"nodeId\": \"id-32\", \"portKey\": \"z\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-37\", \"from\": { \"nodeId\": \"id-32\", \"portKey\": \"result\" }, \"to\": { \"nodeId\": \"id-19\", \"portKey\": \"color\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.vec4\", \"targetType\": \"glsl.vec4\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-39\", \"from\": { \"nodeId\": \"id-26\", \"portKey\": \"y\" }, \"to\": { \"nodeId\": \"id-38\", \"portKey\": \"value\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-41\", \"from\": { \"nodeId\": \"id-26\", \"portKey\": \"y\" }, \"to\": { \"nodeId\": \"id-40\", \"portKey\": \"value\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-43\", \"from\": { \"nodeId\": \"id-26\", \"portKey\": \"y\" }, \"to\": { \"nodeId\": \"id-42\", \"portKey\": \"value\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-45\", \"from\": { \"nodeId\": \"id-26\", \"portKey\": \"y\" }, \"to\": { \"nodeId\": \"id-44\", \"portKey\": \"value\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-47\", \"from\": { \"nodeId\": \"id-26\", \"portKey\": \"y\" }, \"to\": { \"nodeId\": \"id-46\", \"portKey\": \"value\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-49\", \"from\": { \"nodeId\": \"id-26\", \"portKey\": \"y\" }, \"to\": { \"nodeId\": \"id-48\", \"portKey\": \"value\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-51\", \"from\": { \"nodeId\": \"id-26\", \"portKey\": \"y\" }, \"to\": { \"nodeId\": \"id-50\", \"portKey\": \"value\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-53\", \"from\": { \"nodeId\": \"id-26\", \"portKey\": \"y\" }, \"to\": { \"nodeId\": \"id-52\", \"portKey\": \"value\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-55\", \"from\": { \"nodeId\": \"id-26\", \"portKey\": \"y\" }, \"to\": { \"nodeId\": \"id-54\", \"portKey\": \"value\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-57\", \"from\": { \"nodeId\": \"id-26\", \"portKey\": \"y\" }, \"to\": { \"nodeId\": \"id-56\", \"portKey\": \"value\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} } ], \"extensions\": {} }, \"extensions\": {} } ], \"resources\": [ { \"id\": \"id-22\", \"type\": { \"moduleId\": \"grape.resources.function-networks\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:25d291427adb77405f826a636cd2a7c9a5851f0017cb779ced1a13e5a9b0b9e7\", \"typeId\": \"definition\" }, \"data\": { \"name\": \"Shared arithmetic\", \"local\": true, \"origin\": null, \"network\": { \"id\": \"id-23\", \"nodes\": [ { \"id\": \"id-24\", \"name\": \"Inputs\", \"type\": { \"moduleId\": \"grape.nodes.networks\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\", \"typeId\": \"network-input\" }, \"state\": { \"definition\": \"id-22\" }, \"inputValues\": {}, \"ports\": [ { \"key\": \"x\", \"direction\": \"output\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0.2 } ], \"references\": [ { \"slot\": \"definition\", \"kind\": \"resource\", \"targetId\": \"id-22\" } ], \"referencesComplete\": true, \"position\": [ 0, 0 ], \"extensions\": {} }, { \"id\": \"id-25\", \"name\": \"Outputs\", \"type\": { \"moduleId\": \"grape.nodes.networks\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\", \"typeId\": \"network-output\" }, \"state\": { \"definition\": \"id-22\" }, \"inputValues\": { \"y\": 0, \"twice\": 0 }, \"ports\": [ { \"key\": \"y\", \"direction\": \"input\", \"type\": \"glsl.float\", \"defaultValue\": 0, \"supply\": \"local\" }, { \"key\": \"twice\", \"direction\": \"input\", \"type\": \"glsl.float\", \"defaultValue\": 0, \"supply\": \"local\" } ], \"references\": [ { \"slot\": \"definition\", \"kind\": \"resource\", \"targetId\": \"id-22\" } ], \"referencesComplete\": true, \"position\": [ 600, 0 ], \"extensions\": {} }, { \"id\": \"id-27\", \"name\": \"Add\", \"type\": { \"moduleId\": \"grape.nodes.function-operations\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\", \"typeId\": \"add\" }, \"state\": {}, \"inputValues\": { \"a\": 0, \"b\": 0 }, \"ports\": [ { \"key\": \"a\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0 }, { \"key\": \"b\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0 }, { \"key\": \"value\", \"direction\": \"output\", \"type\": \"glsl.float\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 250, 0 ], \"extensions\": {} } ], \"edges\": [ { \"id\": \"id-28\", \"from\": { \"nodeId\": \"id-24\", \"portKey\": \"x\" }, \"to\": { \"nodeId\": \"id-27\", \"portKey\": \"a\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-29\", \"from\": { \"nodeId\": \"id-24\", \"portKey\": \"x\" }, \"to\": { \"nodeId\": \"id-27\", \"portKey\": \"b\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-30\", \"from\": { \"nodeId\": \"id-24\", \"portKey\": \"x\" }, \"to\": { \"nodeId\": \"id-25\", \"portKey\": \"y\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-31\", \"from\": { \"nodeId\": \"id-27\", \"portKey\": \"value\" }, \"to\": { \"nodeId\": \"id-25\", \"portKey\": \"twice\" }, \"adaptation\": { \"schema\": \"grape.edge-adaptation\", \"version\": 1, \"sourceType\": \"glsl.float\", \"targetType\": \"glsl.float\", \"operation\": \"identity\", \"extensions\": {} }, \"extensions\": {} } ], \"extensions\": {} }, \"interface\": [ { \"key\": \"x\", \"name\": \"X\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0.2 }, { \"key\": \"y\", \"name\": \"Y\", \"direction\": \"output\", \"type\": \"glsl.float\", \"defaultValue\": 0 }, { \"key\": \"twice\", \"name\": \"Twice\", \"direction\": \"output\", \"type\": \"glsl.float\", \"defaultValue\": 0 } ], \"dependencies\": [], \"emissionMode\": \"expand\" }, \"references\": [], \"referencesComplete\": true, \"extensions\": {} } ], \"losses\": [], \"recovery\": [], \"extensions\": {} } } }"
    - generic "Original text (first 12000 characters)" [ref=e116]: "{ \"format\": \"grape.document\", \"formatVersion\": { \"major\": 2, \"minor\": 1 }, \"graph\": { \"id\": \"id-15\", \"name\": \"Untitled shader\", \"kind\": { \"moduleId\": \"grape.graph-kinds\", \"version\": \"0.2.0\", \"fingerprint\": \"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\", \"kindId\": \"grape.image\" }, \"kindSettings\": {}, \"modules\": [ { \"moduleId\": \"grape.nodes.basic\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\" }, { \"moduleId\": \"grape.nodes.networks\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\" }, { \"moduleId\": \"grape.graph-kinds\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:30d1266c367648c97b57a6cf77eec9d0bf14ac8bdb057fa4eef457539adb98c3\" }, { \"moduleId\": \"grape.resources.extents\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:bcfaaca3ef01c57070e05b26e09bbcacde5d51f6ba0091b8b6aaf3d83efa3c60\" }, { \"moduleId\": \"grape.resources.image-sources\", \"version\": \"0.2.0\", \"fingerprint\": \"sha256:bb0ff902b36d7a07fc104412d0ccb11e4e7efed0106aa3c8595026dbcef8b212\" }, { \"moduleId\": \"grape.nodes.image-output\", \"version\": \"0.2.0\", \"fingerprint\": \"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\" }, { \"moduleId\": \"grape.graph-kinds\", \"version\": \"0.2.0\", \"fingerprint\": \"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\" }, { \"moduleId\": \"grape.resources.function-networks\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:25d291427adb77405f826a636cd2a7c9a5851f0017cb779ced1a13e5a9b0b9e7\" }, { \"moduleId\": \"grape.nodes.function-operations\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\" } ], \"stages\": [ { \"id\": \"id-17\", \"key\": \"vertex\", \"stageKindId\": \"grape.stage.vertex\", \"implementation\": \"profile-default\", \"network\": { \"id\": \"id-16\", \"nodes\": [], \"edges\": [], \"extensions\": {} }, \"extensions\": {} }, { \"id\": \"id-20\", \"key\": \"pixel\", \"stageKindId\": \"grape.stage.pixel\", \"implementation\": \"network\", \"network\": { \"id\": \"id-18\", \"nodes\": [ { \"id\": \"id-19\", \"name\": \"Image output\", \"type\": { \"moduleId\": \"grape.nodes.image-output\", \"version\": \"0.2.0\", \"fingerprint\": \"sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93\", \"typeId\": \"image-output\" }, \"state\": {}, \"inputValues\": {}, \"ports\": [ { \"key\": \"color\", \"direction\": \"input\", \"type\": \"glsl.vec4\", \"supply\": \"required\", \"connectionPolicy\": \"numeric\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 650, 180 ], \"extensions\": {} }, { \"id\": \"id-26\", \"name\": \"Shared arithmetic\", \"type\": { \"moduleId\": \"grape.nodes.networks\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\", \"typeId\": \"call\" }, \"state\": { \"definition\": \"id-22\" }, \"inputValues\": { \"x\": 0.2 }, \"ports\": [ { \"key\": \"x\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0.2 }, { \"key\": \"y\", \"direction\": \"output\", \"type\": \"glsl.float\", \"defaultValue\": 0 }, { \"key\": \"twice\", \"direction\": \"output\", \"type\": \"glsl.float\", \"defaultValue\": 0 } ], \"references\": [ { \"slot\": \"definition\", \"kind\": \"resource\", \"targetId\": \"id-22\" } ], \"referencesComplete\": true, \"position\": [ 160, 120 ], \"extensions\": {} }, { \"id\": \"id-32\", \"name\": \"Compose\", \"type\": { \"moduleId\": \"grape.nodes.basic\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292\", \"typeId\": \"compose\" }, \"state\": { \"mode\": \"vec4\" }, \"inputValues\": { \"x\": 0, \"y\": 0, \"z\": 0, \"w\": 1 }, \"ports\": [ { \"key\": \"x\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0 }, { \"key\": \"y\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0 }, { \"key\": \"z\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0 }, { \"key\": \"w\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 1 }, { \"key\": \"result\", \"direction\": \"output\", \"type\": \"glsl.vec4\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 600, 100 ], \"extensions\": {} }, { \"id\": \"id-35\", \"name\": \"Subgraph\", \"type\": { \"moduleId\": \"grape.nodes.networks\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2\", \"typeId\": \"call\" }, \"state\": { \"definition\": \"id-22\", \"inputOverrides\": [ \"x\" ] }, \"inputValues\": { \"x\": 0.3 }, \"ports\": [ { \"key\": \"x\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"local\", \"defaultValue\": 0.2 }, { \"key\": \"y\", \"direction\": \"output\", \"type\": \"glsl.float\", \"defaultValue\": 0 }, { \"key\": \"twice\", \"direction\": \"output\", \"type\": \"glsl.float\", \"defaultValue\": 0 } ], \"references\": [ { \"slot\": \"definition\", \"kind\": \"resource\", \"targetId\": \"id-22\" } ], \"referencesComplete\": true, \"position\": [ 200, 140 ], \"extensions\": {} }, { \"id\": \"id-38\", \"name\": \"Constant input\", \"type\": { \"moduleId\": \"grape.nodes.function-operations\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\", \"typeId\": \"constant-input\" }, \"state\": {}, \"inputValues\": {}, \"ports\": [ { \"key\": \"value\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"required\", \"requireConstant\": true }, { \"key\": \"value\", \"direction\": \"output\", \"type\": \"glsl.float\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 120, 250 ], \"extensions\": {} }, { \"id\": \"id-40\", \"name\": \"Constant input 2\", \"type\": { \"moduleId\": \"grape.nodes.function-operations\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\", \"typeId\": \"constant-input\" }, \"state\": {}, \"inputValues\": {}, \"ports\": [ { \"key\": \"value\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"required\", \"requireConstant\": true }, { \"key\": \"value\", \"direction\": \"output\", \"type\": \"glsl.float\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 120, 380 ], \"extensions\": {} }, { \"id\": \"id-42\", \"name\": \"Constant input 3\", \"type\": { \"moduleId\": \"grape.nodes.function-operations\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\", \"typeId\": \"constant-input\" }, \"state\": {}, \"inputValues\": {}, \"ports\": [ { \"key\": \"value\", \"direction\": \"input\", \"type\": \"glsl.float\", \"supply\": \"required\", \"requireConstant\": true }, { \"key\": \"value\", \"direction\": \"output\", \"type\": \"glsl.float\" } ], \"references\": [], \"referencesComplete\": true, \"position\": [ 120, 510 ], \"extensions\": {} }, { \"id\": \"id-44\", \"name\": \"Constant input 4\", \"type\": { \"moduleId\": \"grape.nodes.function-operations\", \"version\": \"0.1.0\", \"fingerprint\": \"sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01\","
    - status [ref=e117]: This file is valid, but Replace is unavailable because it uses different module versions or output profile. Choose Open in new session to open the file, or Close to keep working here. You can still export the original source.
    - button "Accept replacement (one Undo)" [disabled] [ref=e118]
    - button "Open in new session" [active] [ref=e119] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect, type Page, type Locator } from "@playwright/test";
  2   | import fs from "node:fs";
  3   | import path from "node:path";
  4   | import { fileURLToPath } from "node:url";
  5   | import { createNode } from "./create-node.ts";
  6   | import { clickAction } from "../fixtures/public-actions.ts";
  7   | const evidence = process.env.GRAPE_EVIDENCE_DIR!;
  8   | const save = (name: string, value: unknown) => fs.writeFileSync(path.join(evidence, name + ".json"), JSON.stringify(value, null, 2) + "\n");
  9   | async function doc(page: Page) {
  10  |   const wait = page.waitForEvent("download");
  11  |   await clickAction(page, "Export JSON");
  12  |   return JSON.parse(fs.readFileSync((await (await wait).path())!, "utf8"));
  13  | }
  14  | async function center(l: Locator) { const r = (await l.boundingBox())!; return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }
  15  | async function color(page: Page) {
  16  |   await createNode(page, "Color RGBA");
  17  |   const c = page.locator(".canvas").last();
  18  |   return { c, out: c.locator('[data-direction="output"][data-port="out"]'), input: c.locator('[data-direction="input"][data-port="color"]') };
  19  | }
  20  | async function preview(c: Locator) {
  21  |   return c.evaluate(el => ({ paths: el.querySelectorAll(".connection-preview path").length, rings: el.querySelectorAll(".connection-preview circle").length, d: el.querySelector(".connection-preview path")?.getAttribute("d"), notice: el.querySelector(".canvas-notice")!.textContent }));
  22  | }
  23  | test.beforeEach(async ({ page }) => {
  24  |   await page.addInitScript(() => {
  25  |     (window as any).__statusPointerEvents = [];
  26  |     for (const type of ["pointerdown", "pointermove", "pointerup", "pointercancel", "click", "keydown", "keyup"])
  27  |       document.addEventListener(type, e => { const p = e as PointerEvent, k = e as KeyboardEvent; (window as any).__statusPointerEvents.push({ type, trusted: e.isTrusted, target: (e.target as HTMLElement)?.className, port: (e.target as HTMLElement)?.dataset?.port, pointerId: p.pointerId, buttons: p.buttons, x: p.clientX, y: p.clientY, detail: p.detail, key: k.key }); }, true);
  28  |   });
  29  |   await page.goto("/");
  30  | });
  31  | test.afterEach(async ({ page }, info) => { save(info.title.replace(/[^a-zA-Z0-9]+/g, "-") + "-events", await page.evaluate(() => (window as any).__statusPointerEvents)); });
  32  | 
  33  | for (const width of [620, 1440]) test(`S06 complete persistent loss details have a keyboard read path at ${width}`, async ({ page }) => {
  34  |   await page.setViewportSize({ width, height: 1000 });
  35  |   const fixture = fileURLToPath(new URL(`../../evidence/s06/review-03/independent-review/reviewer-public-03/persistent-loss-readability-${width}-fixture.grape.json`, import.meta.url));
  36  |   await page.getByLabel("Open document file").setInputFiles(fixture);
  37  |   await page.getByRole("button", { name: "Open in new session", exact: true }).click();
  38  |   const c = page.locator(".canvas").first();
> 39  |   await c.getByRole("heading", { name: "Shared arithmetic", exact: true }).last().click();
      |                                                                                   ^ Error: locator.click: Test timeout of 30000ms exceeded.
  40  |   await c.getByRole("button", { name: "Enter subgraph", exact: true }).click();
  41  |   await c.getByText("Subgraph interface", { exact: true }).click();
  42  |   const before = await doc(page);
  43  |   await c.getByLabel("Subgraph emission mode").selectOption("function");
  44  |   const after = await doc(page), losses = after.graph.losses.filter((l: any) => l.code === "FUNCTION_CONSTANT_DETACHED");
  45  |   expect(losses).toHaveLength(width === 620 ? 4 : 10);
  46  |   const notice = c.locator(".canvas-notice"), facts = await notice.evaluate(el => ({ text: el.textContent, clientHeight: el.clientHeight, scrollHeight: el.scrollHeight, overflow: getComputedStyle(el).overflow, pointerEvents: getComputedStyle(el).pointerEvents }));
  47  |   save(`loss-${width}-compact`, { facts, losses });
  48  |   await page.screenshot({ path: path.join(evidence, `loss-${width}-compact.png`) });
  49  |   expect(facts.clientHeight).toBeLessThanOrEqual(60);
  50  |   const read = c.getByRole("button", { name: "Read full Canvas status", exact: true });
  51  |   if (!(await read.isVisible())) expect(facts.scrollHeight).toBeLessThanOrEqual(facts.clientHeight);
  52  |   // Reach the actual control using keyboard navigation, without programmatic focus.
  53  |   for (let i = 0; i < 100 && !(await read.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press("Tab");
  54  |   await expect(read).toBeFocused();
  55  |   await page.keyboard.press("Enter");
  56  |   const dialog = page.getByRole("dialog", { name: "Canvas status details", exact: true }), text = dialog.getByRole("region", { name: "Full current Canvas status", exact: true });
  57  |   await expect(dialog).toBeVisible();
  58  |   await expect(text).toBeFocused();
  59  |   for (const loss of losses) { await expect(text).toContainText(loss.payload.edge.id); await expect(text).toContainText(`${loss.payload.edge.to.nodeId}/${loss.payload.edge.to.portKey}`); }
  60  |   const full = await text.innerText();
  61  |   await page.keyboard.press("Control+End");
  62  |   await page.keyboard.press("End");
  63  |   const end = await text.evaluate(el => ({ clientHeight: el.clientHeight, scrollHeight: el.scrollHeight, scrollTop: el.scrollTop, clientWidth: el.clientWidth, scrollWidth: el.scrollWidth }));
  64  |   expect(end.scrollWidth).toBeLessThanOrEqual(end.clientWidth + 1);
  65  |   expect(end.scrollTop + end.clientHeight).toBeGreaterThanOrEqual(end.scrollHeight - 1);
  66  |   save(`loss-${width}-full`, { full, end });
  67  |   await page.screenshot({ path: path.join(evidence, `loss-${width}-full.png`) });
  68  |   await page.keyboard.press("Tab");
  69  |   await expect(dialog.getByRole("button", { name: "Close status details", exact: true })).toBeFocused();
  70  |   await page.keyboard.press("Tab");
  71  |   await expect(text).toBeFocused();
  72  |   await page.keyboard.press("Escape");
  73  |   await expect(dialog).not.toBeVisible();
  74  |   await expect(read).toBeFocused();
  75  |   await clickAction(page, "Save");
  76  |   await expect(notice).toHaveText(facts.text!);
  77  |   await clickAction(page, "Undo");
  78  |   expect((await doc(page)).graph).toEqual(before.graph);
  79  |   await clickAction(page, "Redo");
  80  |   expect((await doc(page)).graph).toEqual(after.graph);
  81  |   await read.click();
  82  |   await expect(text).toHaveText(full);
  83  |   await dialog.getByRole("button", { name: "Close status details", exact: true }).click();
  84  |   expect((await doc(page)).graph).toEqual(after.graph);
  85  | });
  86  | 
  87  | test("S06 actual 3px uncaptured port release across Canvas Inspector retires wire and ring", async ({ page }) => {
  88  |   await page.setViewportSize({ width: 1440, height: 1000 });
  89  |   const { c, out } = await color(page), before = await doc(page), cr = (await c.boundingBox())!;
  90  |   const initial = await center(out.locator(".socket")), delta = cr.x + cr.width - 1.5 - initial.x;
  91  |   await page.mouse.move(cr.x + 20, cr.y + 150); await page.mouse.down();
  92  |   await page.mouse.move(cr.x + 20 + delta, cr.y + 150, { steps: 12 }); await page.mouse.up();
  93  |   const a = await center(out.locator(".socket"));
  94  |   expect(a.x).toBeGreaterThan(cr.x + cr.width - 3); expect(a.x).toBeLessThan(cr.x + cr.width);
  95  |   await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(a.x + 3, a.y, { steps: 6 });
  96  |   const during = await preview(c); await page.mouse.up(); const released = await preview(c);
  97  |   await page.mouse.move(cr.x + 900, a.y, { steps: 5 }); const returned = await preview(c);
  98  |   save("tiny-cross-boundary", { start: a, release: { x: a.x + 3, y: a.y }, canvas: cr, during, released, returned });
  99  |   await page.screenshot({ path: path.join(evidence, "tiny-cross-boundary.png") });
  100 |   expect(released.paths).toBe(0); expect(released.rings).toBe(0); expect(returned.paths).toBe(0); expect(returned.rings).toBe(0);
  101 |   expect(await doc(page)).toEqual(before);
  102 |   await clickAction(page, "Undo"); await expect(c.getByRole("heading", { name: "Color RGBA", exact: true })).toHaveCount(0);
  103 | });
  104 | 
  105 | for (const key of ["Enter", "Space"]) test(`S06 trusted ${key} socket activation waits for real pointer and preserves keyboard connection`, async ({ page }) => {
  106 |   const { c, out, input } = await color(page), before = await doc(page);
  107 |   await out.click(); await page.keyboard.press("Escape"); await expect(out).toBeFocused();
  108 |   await page.keyboard.press(key);
  109 |   const pending = await preview(c), cr = (await c.boundingBox())!;
  110 |   save(`keyboard-${key}`, { pending, canvas: cr });
  111 |   await expect(c.locator(".canvas-notice")).toContainText("opposite port");
  112 |   if (pending.d) expect(pending.d).not.toMatch(new RegExp(`,0 ${-cr.y}$`));
  113 |   expect(pending.paths).toBe(0);
  114 |   await page.mouse.move(cr.x + 450, cr.y + 180, { steps: 5 });
  115 |   await expect(c.locator(".connection-preview path")).toHaveCount(1);
  116 |   await page.keyboard.press("Escape"); await expect(c.locator(".connection-preview path")).toHaveCount(0);
  117 |   expect(await doc(page)).toEqual(before);
  118 |   await out.click(); await page.keyboard.press("Escape"); await page.keyboard.press(key);
  119 |   for (let i = 0; i < 100 && !(await input.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press("Tab");
  120 |   await expect(input).toBeFocused(); await page.keyboard.press(key);
  121 |   await expect(c.locator(".canvas-notice")).toBeEmpty();
  122 |   const after = await doc(page); expect(after.graph.stages.find((s: any) => s.key === "pixel").network.edges).toHaveLength(1);
  123 |   await clickAction(page, "Undo"); expect(await doc(page)).toEqual(before);
  124 |   await clickAction(page, "Redo"); expect(await doc(page)).toEqual(after);
  125 | });
  126 | 
```