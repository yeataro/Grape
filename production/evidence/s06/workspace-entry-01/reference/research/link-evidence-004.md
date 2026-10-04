# LINK-EVIDENCE-004 — Link 與接孔箭頭

Date: 2026-10-02. Source version: Function Preview 0.8.273 / commit `e005f08`. Read-only source inspection plus a bounded live observation. This record is self-contained behavior evidence for the design atlas, not a new architecture contract.

## Evidence and precedence

Legacy source root (provenance only): `C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape`. Files are not needed to read this design handoff. No product source was changed in this design round.

| Source | Evidence extracted |
|---|---|
| `src/editor/style.css:2065–2090` | Link normal `#8e8e9699`, width1, dash4/5, non-scaling-stroke; hover65%/1.5; selected2px; mid-direction triangle; arrow20×22, icon16×16/2.5, opacity.6→1. |
| `src/editor/style.css:2170–2178` | Input-arrow hover reversal; hover-reveal mode. |
| `src/editor/graph_ui.js:2` | Current defaults: wireQuickActions true, frameWireEndpoint true, linkArrowDisplay always, reverseInputLinkArrowOnHover true. Default-enabled experimental features are required preservation baseline per owner; not optional merely because labeled experimental. |
| `src/editor/graph_ui.js:2773–2840` | Direct peer collection, single/all Frame, peer menu lifecycle, old graph guard, arrow placement and deduped collapsed-side collection; type paint; show/hide mode. |
| `src/editor/graph_ui.js:1357,2430–2450,2873` | Edge arrow keys, command guards, distinction from configurable right-click endpoint framing. |
| `docs/ui/WIRE_LINK.md` | Wire/Link style persistence, non-recursive conversions, keyboard/navigation and historic changes. §0.8.210 supersedes the older arrows-only-when-lines-hidden presentation. §0.8.228 documents plain ←/→. |

References to existing browser test files in that document are supporting locators only. They were **not rerun in this design round** and are not counted as new PASS evidence.

## Preserved UX

1. Wire is a type-colored curve. Link is a pale, straight dashed relation with a small flow-direction triangle; it represents the same real connection. Display style conversion does not change shader computation.
2. Per-port arrows are navigation controls. Left-click selects and Frames every direct Link peer represented by the arrow, excluding ordinary Wires and recursive ancestry. Right-click gives a deduplicated peer list and All to Wire. A collapsed node aggregates the appropriate side; mixed actual types can use a gradient arrow.
3. With current `always` default, arrows are visible even when Link lines show. The line uses arrow centers. Optional hover mode keeps port endpoints fixed rather than moving them when the arrow appears. When Link lines hide, every mode retains arrows. Input arrow reversal on hover does not change data flow.
4. Selected Edge ← selects sources, → destinations, deduplicated and Framed. Direction means endpoints, not screen coordinates. Text/dialog/gesture/modifier guards prevent stealing other operations.
5. X / Show Link lines is view preference, with hidden hit targets; arrows and relation persist. Wire/Link style is saved with graph and undoable. Navigation is not a model edit.
6. Edge toolbar and context menu, node Convert wires submenu, and arrow peer menu are alternative entrances with different explicitly bounded targets. All-to-Wire applies only to represented links; source-to-all-Link means the same output port; bulk node conversions are immediate incident edges, not recursive.
7. Read-only navigation remains usable. Mutation entries disable in read-only context; detached arrows/old menus must not modify a replacement graph.

## Bounded live observation in this round

- Opened the owner-authorized disposable `/shader/e94964260f2f4a3bb498c02992c17406/` target; UI displayed 0.8.273, `/project1/PBR_MAT_Graph3`, Pixel, four nodes,41% zoom.
- Right-clicked an existing Wire. Menu exposed Wire/Link, source←, destination→, Source→all Link, Disconnect and Float Parameter.
- Converted that Wire to Link through its menu. DOM then contained two visible `.link-port-navigation` controls with a16×16 SVG `M2 8h11M8 3l5 5-5 5` arrow. Tooltips described click-to-select/Frame all peers and right-click-to-choose. Link lines were visible; arrows were nevertheless present, confirming current Always presentation.
- A peer-menu read after right-click timed out; a later menu snapshot was empty. **Do not count actual peer-menu selection as live verified.** That behavior is source-backed above.
- Examined the rendered diagram, briefly switched to100% through the product zoom menu, then restored the temporary style edit with Ctrl+Z and framed Home. Visible arrows disappeared and zoom returned41%; no forced Host Apply/reload. This is visible restoration, not byte-for-byte document equality or a Host publication qualification.
- Preview reported another-page ownership. No attempt to take over Preview.

## Atlas evidence boundary

`LINK-01` redraw uses exact named Link/arrow visual tokens but simplified coordinates. Its clickable selection/menu/line-hiding is **local diagram state only**. It does not simulate Frame motion, all keyboard guards, save, Undo, stale Graph behavior or TD publication.

Sockets in this redraw follow the owner-directed **connected solid / unconnected hollow** revision, not a claim that the legacy direction-based socket code has been updated.

`LINK-02` preserves the full interaction protocol for a future implementer. The old standalone Structure-gradient comparison is replaced with Link+arrow emphasis; real structural/mixed-type color semantics elsewhere remain recorded.

Validation commands and executed results are in `atlas/verification.json`. Runtime touch/pen, device-specific context menus and complete navigation regressions remain outside this round.
