# S06 workspace entry — engineering checkpoint

This is an unfinished integration checkpoint, **not a Human acceptance request or an independently reviewed I/R**. The current metadata commit is `294db471a5e92a576bc39f1e8d67f1d23b940b7f`; product changes are preserved in the working tree and `working-changes-01.patch`.

One required branch remains: connected creation must initialize the exact chosen owner state before Graph plans the connection. The exact un-applied fix is `configured-creation-proposal-02.patch`; the packet's allowed paths omit `production/src/model/graph.ts`. `path-reconciliation-01.json` contains the counterexample and the smallest requested path clarification. This does not request a new product choice or an Architecture Change.

## What can be inspected now

- `visual-preintegration-02/` pairs actual Legacy reference renders with the current workspace, catalog, shortcut dialog and responsive toolbar. The original 83 reference files remain unchanged in `references/`; same-byte reviewer copies are under `reference/`.
- `archive-preintegration-05/workspace-color.grape.json` is a real exported example containing Color RGBA connected to Image output. Values are `[0.25, 0.5, 0.75, 1]`; actual WebGL2 readback was `[64, 128, 191, 255]` in Windows Chromium 151 / ANGLE SwiftShader.
- `build-preintegration-02/candidate-web.tar.gz` contains the tested static build. `build-manifest.json` binds its three exact files and the 138-file source/config/test/tool manifest. It is a preintegration build with no implementation I or submission R.
- `archive-preintegration-05/result.json` records four natural drag Escape cases and the archived public create/edit/connect/generate/numeric/save/reopen/help flow. The temporary loopback listener was closed after the run. Existing Human preview services were not replaced.

## Plain-language walkthrough for the eventual final candidate

1. Open the prepared color example through **Open file → Review document → Open in new session**. Expect a connected Color RGBA and Image output. Select Color RGBA to edit R/G/B/A in Inspector; **Generate GLSL** should succeed. **Save**, then **Open saved**, should restore the same document.
2. Use **Add Node**, or double-click an empty part of Canvas. Search for **Multiply**. The plus button starts a preview; moving it does not create a node. Click empty Canvas to place it, or press Escape to cancel. A successful placement has one Undo step.
3. Use **Browse nodes** to inspect a signature without changing selection or the document. Filter by source or port type. Its plus button or double-click inserts at the viewport's insertion point; dragging a row only inserts when released on valid empty Canvas.
4. Open a port's right-click menu and choose **Create connected node**. Preview wires use the same socket geometry as mounted nodes. Existing simple/fixed-type cases are verified. **Do not treat configured Compose creation as delivered until the pending Graph integration and its final regressions are complete.**
5. Switch **Pixel / Vertex** to navigate the current graph's stages. Enter a subgraph and use **Up** or a breadcrumb to return. Navigation alone adds no graph History entry. Only installed, admitted nodes appear for the current stage and profile.
6. Open **Shortcuts**. Escape returns to its opener; Tab remains inside. On Canvas, H/F frame the graph/selection, Delete removes selection, Ctrl+Z and Ctrl+Shift+Z undo/redo. Text inputs keep their own editing and IME behavior. During a drag, natural Escape restores the starting position without committing that drag.
7. Narrow the window: **More actions** contains the same real document/Library controls, while Undo/Redo and Stage remain reachable. Widening restores the controls without duplicates.
8. Open **Personal Library** for real saved-subgraph search, inspection, import/export and insertion. Readonly mode allows inspection while insertion is disabled. Invalid imports report their error without erasing the current graph; unrelated successful actions do not dismiss that error.

## Reproduce the archived checks

From a disposable working directory, set `GRAPE_EVIDENCE_DIR` to a **fresh absolute S06 path** and run the repository's `production/tools/s06-archive-check.ts` with Node 25.5.0 and `--experimental-transform-types`. Supply absolute `--manifest`, `--output` and fresh `--scratch` paths. `--output` must reside directly in the evidence directory. The helper verifies archive bytes, serves them temporarily on loopback, uses isolated browser contexts, records results and closes its listener. It never uses the Human browser profile.

The latest broad source run passed 130 browser cases. Subsequent visual and keyboard changes passed 24 and 25 affected cases respectively. The final source has 234 passing unit/conformance cases, type/pin/boundary checks, and the unchanged state passed 473 bootstrap checks plus 10 maintenance fixtures. These are engineering checks; they do not supply independent PASS or acceptance.

S06 stays active and incomplete. This first batch does not promise all 99 UI capabilities, all 391 catalog leaves, arbitrary Panel layouts, native Host controls, secondary catalog category/GLSL-name/tag metadata, unified Personal/template catalog scope or physical-device qualification. G-PD-2 remains open. LAN/Tailscale delivery requirements were removed by the Owner; the original denied checks remain NOT_EXECUTED, never PASS.
