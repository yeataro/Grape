# LIVE-002 — disposable graph interaction observations

Date: 2026-10-02. Product: TD-Grape 0.8.272 DEV. Method: actual product UI actions, accessibility/DOM observations, computed styles and screenshots displayed in the tool session. No legacy source/runtime-store introspection. Screenshots from this session have **not** been saved as portable image files. This record describes observed sequences, not automated product test coverage.

Owner explicitly authorized arbitrary editing of this disposable graph:
`http://127.0.0.1:50997/shader/e94964260f2f4a3bb498c02992c17406/`
Target displayed by product: `/project1/PBR_MAT_Graph3`, `TD-Grape-dev.1.toe`. The preceding valued graph was only observed; the rewrite repository remains read-only. Graph identity/path here are legacy evidence, not proposed new-product ownership.

## Configuration and scope

1280 × 720 CSS-pixel viewport, English, dark / Cool / standard UI scale 1. Canvas zoom was changed through Home/Frame and is recorded per observation; it is not UI scale. Temporary Japanese and 760 × 900 viewport observations were restored to English and the normal viewport. Initial graph had 36 nodes, save revision r432. Revision numbers are save indicators, **not compilation counts**.

## Directly exercised sequences

### O02-01 — temporary Preview and scalar editing

Search `Preview` showed the Preview Editor entry above Math Editor. Add Preview created a selected output-role green node; computed node opacity 0.78. Search Scalar → Add Scalar → enter 0.35 → Enter updated the Inspector to 0.35. The footer briefly showed unapplied changes and then Shader applied without a manual Apply press. Clicking the scalar output displayed `Choose an input · Esc to cancel`; clicking Preview input completed a scalar-colored wire (#c4c1bc, 2.5 CSS px at this view).

Preview help described scalar → (x,x,x,1), vec2 → (x,y,0.5,1), vec3 → (x,y,z,1), vec4 unchanged; temporary/non-saved lifetime and primary-output-only override. These descriptions and the owner's explicit requirement support the intended behavior. This session did **not** independently pixel-compare every conversion or additional buffer. Unconnected node text read `Connect / take control`; retain as observed wording, not automatically as a UX requirement.

### O02-02 — protected stage endpoints

Canvas Ctrl+A selected 38 nodes after additions. Delete removed ordinary nodes and Preview; Vertex Inputs and Color Output remained, with a Pixel Output frame. Inspector cleared. This supports protected endpoint deletion behavior for the exercised Pixel Stage only; it is not a test of every subgraph endpoint rule.

### O02-03 — dynamic interface and connection restoration

Added Voronoi. Initial 3D/F1/Euclidean controls; inputs Vector, Scale 5, Detail 0, Roughness 0.5, Lacunarity 2, Randomness 1; outputs Distance (float), Color (vec4), Position (vec3). Changing Dimensions to 4D added W input/output. Mode choices included F1, F2, Smooth F1, Distance to Edge and N-Sphere Radius. Mode controls are in Inspector; node body exposes current ports and input values.

Connected Vertex Inputs.world → Voronoi.Vector. Connected Voronoi.Color → new Preview.value using the **floating Inspector input socket**. It is a second editing surface for the same connection, not a separate graph edge. The connected row displayed `Voronoi · Color` with a separate Disconnect action. Clicking `Select source · Voronoi · Color` selected/framed Voronoi and changed Inspector target.

Changed feature to Distance to Edge: Color/Position/W outputs disappeared; the Preview connection was removed, while world → Vector remained. No visible compile-error banner appeared in this case. One Undo restored the previous interface and the original Preview connection together. Do not extrapolate this to all invalid connection/error cases.

### O02-04 — floating/docked Inspector and drafts

`Floating Parameter panel · P` moved the selected node Inspector into a floating panel. OP Parameter became available in the right dock. Observed floating panel width 320 CSS px, right inset 12 px, top inset 33 px in its containing region (global bounds depend on toolbar). Closing the float returned the same selected node Inspector to its dock. The float can overlap canvas nodes; interactions must hit the intended visible surface.

Voronoi Scale input: fill 7.25 → Escape restored 5 in both Inspector and node. This verifies cancellation of this text edit, not all slider/ladder transactions. Notes tab exposes Comment with a hint that committed notes appear below this node's GLSL and recompile; Ctrl+Enter commits. No note was committed. Settings tab showed node ID. Inspector subtab Settings remained selected when later switching to Array, until Parameters was clicked.

### O02-05 — localization and long labels

Language Japanese changed shell, Inspector and Help text while technical/user-facing graph identifiers such as Voronoi and Vertex Inputs.world remained. OP Customize Parameters button displayed `カスタムパラメーターを編集` on two lines: measured width 132 px, height 48.375 px; white-space normal, word-break normal, overflow-wrap anywhere, line-height 16.2 px, min-width 0, max-width min(132px,100%). Floating Inspector was 320 px wide; some long field labels used ellipsis.

Footer reported language change without Graph/GLSL changes, but no independent serialized graph diff was taken. Restored English. Evidence supports wrapping/legibility design, not completeness of all locale catalogs or CJK font coverage.

### O02-06 — source creation failure and source-specific controls

Sources showed Common Sources, TD Built In, Attributes, Custom Uniforms, Texture Inputs, Spec Constants, Graph Constants, POP Buffers; TD Names/Common Names, Notes and Minimal controls. Add Custom Uniform opened `New Input · Custom Uniforms` with Uniform / Uniform Array · CHOP / Color kinds.

Entered `bad name` then Create: dialog stayed open and showed `Use a unique, valid GLSL name.` No source was created. The alert had transparent background and white text at 0.85 opacity, not an error-red treatment in this state. This is observed failure feedback, not a recommended validation API or proof of all identifier constraints.

Uniform Array · CHOP changed available type choices to float/vec2/vec3/vec4 and exposed Array length and CHOP path. Help described samples as elements/channels as components and required sufficient samples. Closed without creating. Host-bound resource acquisition remains distinct from source definition in the rewrite.

### O02-07 — typed aggregate display

Added Array. Its parameters showed element type and literal length 4, with help describing int/uint Graph or Spec Constant lengths and zero initialization. Settings exposed Require compile-time constant and a hint that runtime values are rejected, not frozen. The current build did not expose a general table-of-elements editor in this path; do not infer newer array UI from unrelated files.

Selecting TDMatrix produced TDMatrix[4]. The output socket used the low-saturation four-stop gradient; the type label remained plain text. Measured gradient: 135deg, #bc9c85, #b690ac at 33%, #949fc4 at 67%, #83b4a7. Socket border is transparent 2 px. Existing struct-wire SVG gradients in the initial graph had matching 0/33/67/100 stops. Array constant title was #384d73; selected node border #70dc69. These confirm rendered aggregate/selection/constant samples beyond token presence in LIVE-001.

### O02-08 — generated-code inspection

GLSL button opened Generated GLSL dialog containing Vertex and Pixel outputs. During active Preview the displayed Pixel code contained a preview-color override before final primary output. This is observable generated-artifact evidence; do not transplant the code's implementation structure. Dialog closed. No Export/Import/Save TD project operation was performed.

### O02-09 — narrow viewport

At 760 × 900 both sidebars initially hid; Show left/right buttons remained. Canvas was full-width 760 px at x0/y119, height749. Header reflowed to two rows and Apply remained available. Show right sidebar overlaid the full-width canvas: inspector x421, width339, y151, height319.5. Resetting viewport restored left299/right339 and canvas628 widths at 1280 × 720. This is a browser viewport probe, **not** real tablet/touch/pen/IME evidence.

### O02-10 — session ending observation

At a later snapshot the transient Preview node was absent, the graph had four nodes (Vertex Inputs, Color Output, Voronoi, Array), and the footer said `Preview session ended; the formal output has been restored.` No explicit deletion/close action was attributed to this interval. Thus absence and displayed status are observed; the exact lifecycle trigger/timing is **unverified**. Do not infer a disconnect algorithm from this observation.

## Menus inspected but not applied

Layout: current panel visibility, Default layout, Minimal, Save layout, Manage layouts. Menu accessibility name appeared as untranslated `layout.title`; record as a possible polish issue, do not reproduce it as a requirement. No preset/save/restore sequence tested.

Experimental features: see `experimental-controls-observation.json`. Current Reset defaults button was disabled. This is evidence that the UI regards the current set as default-like, **not** an independent fresh-profile factory-default test. No experimental setting was changed. User classification policy is recorded separately in DESIGN_PREMISES.

## Interaction qualification limits

- A coordinate drag attempt did not establish a connection. Later grounded click-source/click-input succeeded. Some earlier queries used uppercase labels where actual port keys were lowercase, and an overlapping float obscured a target. These attempts do not prove a product drag bug; pointer dragging remains unverified.
- No real touch/pen, keyboard-only end-to-end task, screen-reader, browser/platform matrix, reconnect/timeout/failure, shader compile failure, persistent layout roundtrip, or visual pixel fidelity test was completed.
- No private application state was read; DOM selectors identify observation points only.
- The product graph was disposable; these modifications are not new-product implementation or a rewrite repository change.
