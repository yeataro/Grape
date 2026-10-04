# B01 workspace candidate

Build **S06-debug-dc65351**, implementation **dc653519515e167c75d967930defafcf19422197**.
This bounded candidate is ready for independent review. S06 remains active and unaccepted.

## Try the workspace

- Start the exact archive using the recorded loopback helper/config. The temporary verification address is not a permanent Human service; Coordinator owns later deployment.
- In **Project actions**, choose **Second Canvas**, then **Add Parameters**. Click a node in the first Canvas: both Parameters follow it. Each Canvas keeps its own selection, Stage, nested navigation and camera. Parameter edits change the shared graph and shared Undo history.
- Use each pane's **Panel options** (ellipsis), or **Panels → Settings**, to set Link group and Source. Group 0 follows the most recently explicitly activated Canvas; a positive group has no fallback outside its group. Fixed Canvas routes show a missing source if it closes. Parameters interaction does not activate a Canvas.
- Drag a Tab to another group, or use Move/Split/order commands. Hide retains its provider; Close removes it. Draft text survives placement. Close/retarget with a guarded draft refuses without losing it: cancel or commit the draft first.
- Drag dividers or use arrows (8), Shift+arrows (32), Home/End, Escape rollback and double-click reset. Narrow overlays clamp display without replacing desktop preferred widths; **Panels → Show** opens a side overlay.
- Parameters supports **Float Parameters** at the upper right; collapse, resize, press P outside text/IME, or **Return Parameters to dock**. Floating another Parameters returns the prior one to its dock.
- **Save current layout**, **Restore current layout**, **Export current layout** and **Import current layout** operate on one layout. Graph Save/dirty/Undo/Redo remain separate. After restore, explicitly activate a Canvas; prior live activation and leases are intentionally not revived.
- Example pair: [document](samples/workspace.grape.json) and [layout](samples/current-layout.json). Open document → Review → Open in new session, then Import current layout. They share exact graph identity. A layout for another graph retains an unavailable-target placeholder instead of guessing.
- F2 reads the keyboard target once. Help, compact status/details, Shader output, Locate and typed circle sockets remain available.

## Scope and limits

Windows Chromium 151 headless/SwiftShader portable profile. Tests include trusted mouse/keyboard; synthetic composition/lifecycle cases are labelled and are not physical touch/IME qualification. No native Host, arbitrary external Panel, whole catalogue/S06 qualification, named-preset retention, free-floating docking, OC11 stacking or deferred general placement changes. G-PD-2 remains open only for named presets. Historical LAN/Tailscale checks remain not executed; Owner removed that delivery obligation. No Human acceptance, main merge or release is claimed.

The [coverage map](coverage-01.json), [changed-path impact](change-impact-01.json), [checks](checks-01.json) and [submission](submission-01.json) bind the delivered scope and actual evidence. B00's original PASS remains at its original I/R; it does not qualify this new source.

## Reproduce

Use Node 25.5.0 and locked production dependencies. Run root bootstrap/current-state/10 fixtures, then production typecheck/conformance/test/build as recorded in checks. Browser runs require a fresh absolute `GRAPE_EVIDENCE_DIR` and explicit `--output`; use `production/tools/b01-playwright.config.ts` with source or verified archive URL and a disposable cwd/profile. Never reuse Human browser storage or old evidence paths.

`build-01/candidate-web.tar.gz` contains three compiled files; `build-manifest-01.json` binds every byte. `archive-extraction-01.json` records extraction verification. `archive-visual-01` contains direct/wrapped 1440/620 views and actual build identity. Current-layout persistence uses the single key `grape.workspace.current.v1` and does not change unrelated storage keys.
