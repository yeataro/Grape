# Group Frame evidence 004

Date: 2026-10-02. Snapshot: Legacy commit `e005f08` (read-only `git rev-parse --short HEAD` verified). This is a self-contained design evidence record, not an implementation plan.

## Provenance and authority

- Legacy source root: `C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape`.
- `OBSERVED`: the coordinating agent reported the current **Pixel Output** frame title and visible color, rename, remove-frame (keep nodes) and corner-select controls. This chapter author did not operate that live frame; no new gesture PASS is claimed.
- `UI-ADVERTISED`: [LIVE-001](live-observations-001.md), lines 53–63, records the actual opened shortcut dialog. It lists Ctrl+G Frame, Alt+Shift+G Join, Alt+G Detach, Ctrl+Shift+G Subgraph. This proves displayed entries, not execution.
- `SOURCE-DERIVED`: behavior below was read from the snapshot and existing test source. No Legacy product tests were executed in this round.
- `ATLAS ILLUSTRATION`: the interactive drawing is locally rebuilt, with finite sample nodes and in-memory state. It is not a screenshot, a production renderer or proposed architecture. Exact control placement and bounded artboard movement are illustration choices.

## Frame and Subgraph are different

| Fact preserved for review | Exact source locator at e005f08 |
|---|---|
| A Frame is graph-local presentation metadata: id, name, explicit node IDs and optional RGB color. It is not a Shader node and has no sockets. | `src/editor/frames_ui.js:1`; `src/editor/functions_model.js:8–49` (`GraphFrames`) |
| Membership is explicit. A node can be claimed by only one frame in the same graph. Frames reference node IDs, not other frames. Geometric enclosure is not membership. Empty frames are pruned. | `functions_model.js:15–29`; `frames_ui.js:9–11`, `28–54` |
| Subgraph extraction moves eligible selected nodes/internal edges into another graph, creates boundary Input/Output and an outer call node, and rewires crossing edges. Complete frames can accompany their members into the extracted graph. | `src/editor/functions_ui.js:277–307` (`groupSelection`) |
| Frame metadata is checked as not changing compiled TOP/MAT shader output by existing test definitions; no fresh compiler run was made for this handoff. | `tests/unit/test_graph_frames.py:17–35` |

## Membership actions

- **Create:** at least two selected nodes, all currently unframed. New frame uses a unique `Group N` name, default Slate `#7f8797`, then enters rename. Source: `frames_ui.js:23–27`, `56–63`.
- **Join:** among frames represented by selected nodes, choose the unique frame with the greatest count of selected members. A tie, no represented frame, or no incoming member gives no valid target. Selected incoming nodes are removed from other frames and added to that target; no move is implied. Source: `frames_ui.js:38–54`.
- **Detach:** remove selected member IDs from frame membership. Nodes, positions, values and wires remain. One-member frames may survive; empty frames are pruned. Source: `frames_ui.js:28–36`; `functions_model.js:25–29`.
- **Remove frame:** filters only the frame record, preserving members and wires. This differs from selecting its members then Delete, which deletes nodes. Source: `frames_ui.js:178–181`; graph deletion remains an ordinary selection command.
- **Copy/Paste:** include a frame only when every member is part of the copied set; remap frame and member IDs for a clone. Partial selection does not carry an incomplete frame. Source: `functions_model.js:31–34` (`GraphFrames.copy`).
- **Scope:** a frame belongs to its graph/stage/function context; it is not a cross-graph container. Source: `functions_model.js:8–49`; existing scope checks in `tests/unit/test_graph_frames.py:55–64` and `tests/browser/test_group_frames.cjs`.

## Geometry, selection and gestures

- Bounds use the union of currently rendered member card rectangles. Add 24 graph-space px on every side and an additional 28 px above for the title. No stored free frame width/height. Moving, resizing or collapsing member cards changes this union. Source: `frames_ui.js:2`, `12–19`, `236–241`.
- Frame body is behind wires and cards; empty body has `pointer-events:none`. Title receives pointer events. Its right corner is a **select-all-members** entry, not a resize handle. Source: `src/editor/style.css:968–985`, `1630–1633`; `frames_ui.js:265–270`.
- Title select uses all explicit members; modifier Ctrl/Cmd/Shift toggles the full member set. Enter/Space on the focused title also selects; F2 or double-click starts rename. Source: `frames_ui.js:182–201`, `260–265`; `src/editor/graph_ui.js:1406`.
- Title drag selects members first. Modifier selection or blocked mutation prevents movement. Primary pointer drag uses a 3 screen-pixel threshold, accounts for graph zoom × UI scale, snaps based on the first member, and moves all members by one delta. A completed changed drag is one layout change. Source: `frames_ui.js:202–235`.
- Drag cancel restores original positions. Cancellation covers pointer cancel/lost capture, another pointer, blur, resize, wheel, Escape, hidden document, graph-context change or changed zoom. Source: `frames_ui.js:212–234`. These paths were read, not newly exercised on Legacy.
- No distinct Frame `collapsed` state exists in the read/write model or frame rendering. Existing selection Collapse/Expand acts on eligible member nodes. Source: `functions_model.js:15–29`; `frames_ui.js:243–273`; `graph_ui.js:1564–1574`, `2893–2894`; `src/editor/selection_ui.js:129–137`.

## Header, color and configurable entries

- Title has name, color dot, rename pencil and remove ×. These visible control purposes also have the coordinator's observation. Title height 28 px; controls 22 px with 15 px icon; color dot 14 px. Source: `frames_ui.js:250–270`; `style.css:975–985`.
- Rename has an 80-character bound, nonempty trimmed text and no control characters. Enter (outside composition)/blur commits; Escape cancels. Source: `frames_ui.js:64–75`, `191–201`.
- Frame color is RGB `#RRGGBB`; presets + shared custom RGB color picker. Changing it does not recolor members. The presets at this snapshot are Slate #7f8797, Gray #9a9390, Red #aa7a79, Orange #bb8c69, Sand #b6a270, Olive #94a574, Green #75a28a, Teal #72a6a5, Blue #759bb5, Navy #485f8d, Violet #9285ad, Rose #ad83a2. Source: `frames_ui.js:2–7`, `64–177`.
- Read-only/blocked mutation gates create, membership edits, move, rename, color and removal; selection can remain available. Source: `frames_ui.js:23–75`, `178–204`, `250–269`.
- Source defaults `groupCornerSelect:true`, `selectionCollapseTools:true`, `hideGroupedSelectionBounds:false` describe code defaults only; they are not a report of the current user's browser preferences or a new-product default decision. Source: `graph_ui.js:2`.
- Turning corner selection off hides that entry; title selection remains. Hiding grouped selection bounds suppresses the separate multi-selection outline only when selection exactly matches a complete frame; it does not hide the frame. Source: `frames_ui.js:268–269`; `style.css:1632–1633`; `selection_ui.js:148–159`.
- Toolbar mode moves/hides entries, while action eligibility is still based on selection/membership. Context menu and shortcuts provide entries too. Source: `selection_ui.js:106–145`; `graph_ui.js:2893–2916`; `src/editor/shortcuts_ui.js:15–17`.

## Existing test evidence, not a new PASS

The following files were read, not run:

- `tests/browser/test_group_frames.cjs`: create/no shader node, layout Undo, rename/color, drag/cancel, touch and body pan, bounds, remove-keep-nodes, one/zero member, readonly, clipboard, subgraph and stage scope.
- `tests/browser/test_group_membership.cjs`: unique largest selected-members destination, tie/no-op, membership transfer, position retention and shortcut guards.
- `tests/browser/test_note_group_geometry.cjs`: corner click/keyboard/touch, readonly selection, settings toggle and non-resize semantics.
- `tests/unit/test_graph_frames.py`: portable metadata, validation, exclusive membership, context scope and shader invariance.

## Atlas scope and gaps

`groups.html` offers one frame, three sample nodes, explicit Join/Detach, selection, title movement, member collapse, rename/preset color, remove-keep-nodes, readonly illustration and local Undo. It has no network, Host, document storage, real graph, API, clipboard or compiler calls.

Sample C is deliberately located inside the visible frame while excluded from its member list. The local helper buttons and status readout explain that distinction; they are not proposed product toolbars. The chapter uses the atlas owner's connected-solid/unconnected-hollow socket direction, which differs from Legacy's output-direction fill. Node appearance is a small reconstruction, not a second node-design specification.

The finite drawing clamps movement within its artboard and omits product grid snapping, pan/zoom, multiple frames, full pointer cancellation and real history integration. It does not validate the source-derived tie rule or context fencing by itself. Pending live checks: all zoom/UI-scale/touch/pen geometry; overlapping frames; label truncation; palette edge placement; full cancel/focus sequences; clipboard and subgraph round trips; actual experimental settings. No automatic drag-in membership, nested frames, cross-stage frame or independent Frame collapse is inferred.

This chapter preserves the distinction between capability, configurable entry and visual style. It prescribes no production component boundaries, data APIs, storage ownership or command architecture.

## Executed pure Node artifact check

On 2026-10-02, `node atlas/check-groups.cjs` returned **PASS — 46 assertions**. This current helper uses only Node built-ins (`fs`, `path`, `vm`, `assert`), parses the actual `groups.html` element/attribute fixture into minimal DOM doubles, and executes the actual `groups.js` inside a VM context. It does not launch or control a browser.

The assertions cover initialization; explicit membership versus computed SVG-coordinate enclosure; member selection/movement/local Undo; Join/Detach; single-member survival and empty-frame removal; new frame creation; member collapse and SVG bounds; rename Enter/blur/Escape and invalid empty name; twelve color presets; frame removal retaining nodes/wire; corner visibility; readonly selection and mutation guards; drag threshold, multiple previews with one local edit, cancellation by Escape/blur; modifier keyboard selection; reinitialization; five artboard IDs and five evidence paths.

This is executable **artifact logic evidence**, not a rendering or product qualification. The DOM double has no CSS/layout engine, screen hit testing or browser-native event propagation. Its SVG screen transform is an identity double. It does not validate visual geometry, responsive layout, actual keyboard focus handling, pointer capture across browser windows, device touch/pen or full Legacy gesture behavior. No Legacy, Host, network or storage operation occurs.

## Earlier headless provenance — not accepted UI qualification

Before the coordinator clarified the required browser-control route, the earlier helper used headless Edge against local HTML and returned 29 assertions with zero page errors; desktop 1280 px and mobile 390 px captures were visually read. Those observations remain recorded only for precise provenance. They are **not accepted CUA UI qualification, fresh Legacy PASS or product gesture verification** and are not included in the current 46-assertion count. No further browser automation followed the clarification.

That earlier helper has now been replaced in place by the pure Node check above. Current validation does not claim accepted browser QA or visual acceptance from the earlier screenshots. Any future approved CUA observation must be recorded separately.
