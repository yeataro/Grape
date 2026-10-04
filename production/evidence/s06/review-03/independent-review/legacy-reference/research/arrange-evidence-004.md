# Node arrangement — evidence 004

Date: 2026-10-02. Read-only source inspection of Legacy commit **e005f08** (`git rev-parse --short HEAD` checked during this review). Source root: `C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape`. No writes to that repository, to the new Grape repository, or to a running product were performed for this chapter.

This record is self-contained: the behavior facts below are the handoff evidence; source paths and line ranges make them traceable. Readers do not need access to the original repository to understand the chapter. The source files are not redistributed here. The chapter is a visual explanation, not production layout code or a new architecture requirement.

## E1 — Capability and scope

- `src/editor/selection_ui.js:72–84` lists exactly 11 commands: auto from sources; auto from outputs; align left, horizontal centers, right, top, vertical centers, bottom; equal horizontal gaps; equal vertical gaps; grid.
- `selection_ui.js:91` resolves selected nodes only from `current().nodes`; a selected edge suppresses node selection for these actions.
- `selection_ui.js:365–370` rejects mutation-blocked state, stale arrange context, fewer than two nodes, or an unknown action. All arrangement inputs use `nodeLayoutBounds`.
- `src/editor/app.js:827–829` uses rendered card width/height when available. Width falls back to a positive saved width or 190; height falls back to 180. X/Y come from node UI position. Consequently the formula accounts for currently rendered/collapsed dimensions; it does not substitute one universal card size.
- `selection_ui.js:392` changes only matched node UI X/Y, rounded to 0.001, inside `change(..., {localize:false, layout:true})`. Unselected nodes do not receive positions.

## E2 — Entry and guards

- `selection_ui.js:106–143`: the selection toolbar moves the existing edit and selected-node control groups between containers. It is not a duplicated command implementation. Arrange is hidden below two selected nodes and disabled while mutation is blocked.
- `selection_ui.js:162–175`: the floating toolbar is horizontally centered on selection and clamped to canvas limits; it prefers 12 UI px above the selection/titles, then 12 below, then a clamped location. Note titles and Router handles may affect placement, but are not selection bounds themselves.
- `selection_ui.js:394–413`: Arrange menu order matches E1; separators precede left, top and equal horizontal gaps. Equal-gap items are disabled below three selected nodes. The menu captures owner graph, current graph level and selected identities. `103–104, 139` reject or close stale context. It focuses the first enabled command and restores focus to Arrange after action.
- `src/editor/graph_ui.js:2932–2951`: the graph context menu has an Arrange submenu backed by the same `ARRANGE_ACTIONS` and `arrangeSelection` calls. It checks captured context and disables equal-gap actions below three selections.
- `src/editor/shortcuts_ui.js:19–20`, `graph_ui.js:2461–2465`: plain **L** selects source-first auto; **Shift+L** selects output-first auto. Control/Command and Alt are excluded, key repeats ignored, and mutation block / two-node requirement apply.
- `graph_ui.js:2438` defines graph command readiness excluding composition, contenteditable, active numeric/placement/wire/drag/resize/touch gestures and open dialogs/popovers. `docs/ui/WORKSPACE_LAYOUT.md:96` documents the editable-field and graph-scope guards, the browser's Ctrl/Command+L, and one Undo operation.
- `WORKSPACE_LAYOUT.md:98` distinguishes Frame / F (view-only, preserving graph, history and dirty state) from node arrangement. Frame can work on one selection and in read-only mode. This chapter must not merge framing with arrangement or with workspace panes.

## E3 — Automatic arrangement rules

- `selection_ui.js:266–275`: only edges whose two endpoints are in the selected set influence topology. Self-edges mark connectivity but are skipped as traversal edges. External nodes are not obstacles or layout participants.
- `277–286`: disconnected connected components get separate vertical bands. Original graph item order supplies deterministic ties.
- `288–289`: the operation starts from the minimum selected X/Y. Horizontal layer gap is `GRID*4`; vertical node gap is `GRID*2`. `src/editor/app.js:42` defines `GRID=24`, so these are **96 and 48 graph-coordinate units**, not fixed screen pixels at every zoom.
- `292–312`: strongly connected components are condensed for ranking. This permits layout of cycles without asserting that their shader semantics are valid.
- `313–320`: output-first ranks the same condensed graph from sinks. Short branches move toward consumers, and sinks of the component share its last layer. Flow remains left-to-right; edges are not reversed.
- `321–347`: layers use real width and height, vertically centered within each component. Two forward/backward ordering sweeps use neighbor and logical port order to reduce crossing. Collapsed nodes retain the logical port order. The code is a heuristic, not a zero-crossing guarantee.
- `349–360`: loose nodes with no connection inside the selected set go on a shelf below connected components, in graph order, with wrapping. When there are connected components, shelf width is at least the connected width or a computed compact width. It is **not a strict two-column shelf**. An entirely unconnected selection uses a square-root-derived shelf width; varied widths can affect actual wrapping.

### Fixed visual fixture

The automatic illustration is bounded to six sample cards and four edges. Both outputs were generated during this review by extracting and executing only the unmodified, pure `autoArrangePositions` function from `e005f08` with `GRID=24`; it did not run the application. The atlas uses the resulting coordinates, not a second automatic-layout engine.

All six fixture items carry the logical input list `[a,b]` and output list `[out]` for the calculation. Edges are A.out→B.a, B.out→C.a, C.out→E.a, D.out→E.b. The SVG only shows the used inputs; labels, role colors and socket styling are reconstructed explanatory UI, not a literal product node definition.

| ID / caption | Width × height | Before X,Y | From sources X,Y | From outputs X,Y |
|---|---|---|---|---|
| A / Source | 150 × 95 | 40,190 | 40,60 | 40,136.5 |
| B / Remap | 170 × 140 | 330,60 | 286,109 | 286,114 |
| C / Multiply | 160 × 105 | 530,260 | 552,126.5 | 552,60 |
| D / Short source | 150 × 95 | 80,390 | 40,203 | 552,213 |
| E / Result | 170 × 165 | 820,95 | 808,96.5 | 808,101.5 |
| F / Note | 150 × 90 | 500,490 | 40,394 | 40,404 |

The only changed **rank** between these fixture modes is D. Several Y coordinates also change because layer heights and vertical centering change. All nodes keep their dimensions and edge identities. The illustration must not claim that only D's position changes.

## E4 — Alignment, equal gaps, grid

- `selection_ui.js:371–375`: alignment uses the selected overall left/right/top/bottom edges. Center alignment uses the overall bounds' center minus half of each card's width/height. The other axis is untouched. There is no extra overlap-prevention step for these six commands.
- `376–382`: equal gaps requires at least three items; sort by current axis then ID. Gap is `max(48, (outer span - sum of sizes)/(count-1))`. The first position stays fixed. When the original span is too small, the far end expands. Gaps are between card edges, not center distances. Both extremes are not guaranteed fixed.
- `383–390`: grid sorts by Y, then X, then ID; column count is `ceil(sqrt(count))`. Each column has its maximum item width; each row uses its maximum height; gaps are 48. It starts at selected minimum X/Y.
- `arrange.js` transcribes these formulas solely for four illustrative cards. Selecting two, three or four limits its scope. Cards outside that subset retain their positions. A local read-only toggle demonstrates disabled mutations. Atlas Reset only resets the illustration, even in that demo mode; it is not a production command.

## E5 — Multiple-selection spacing handles

- `selection_ui.js:177–227`: scale center distances; preserve card sizes; translate the result to hold the opposite outside edge fixed. W/E affects X, N/S affects Y, corners both.
- `198–215`: stop at the first new overlap along the drag path. Already overlapping pairs do not block expansion. Contracting preserves **up to 8 of the previously existing graph-unit gap**; this is not an unconditional new eight-unit gap for every input.
- `228–255`: at least two editable nodes and a visible outline are required. A three-screen-pixel movement threshold precedes the preview. During drag only card styles and wires preview; a changed valid release creates one layout transaction.
- `238, 257–261`: ownership, graph level, selection, node membership, zoom and pan validity are checked; pointer cancellation, lost capture, additional pointer, blur, resize, wheel, visibility loss or Escape cancel the preview.
- `418–420`: eight handle directions are installed. `src/editor/style.css:1012–1025` uses a dashed outline and small square handle marks; coarse pointers enlarge hit areas at `1026`.
- The atlas shows all eight marks but its separate, explicitly illustrative range control simulates only the right handle on three already-separated, same-row cards. Its one-dimensional formula is the exact reduction for this fixed fixture; it does not claim full pointer/cancel/group/viewport coverage or propose a product slider.

## E6 — Current defaults are required baseline; alternatives are optional

`src/editor/graph_ui.js:2` defines:

| Setting | Current default | Handoff implication |
|---|---|---|
| `selectionToolbar` | `'all'` | Single and multiple selection floating toolbar is required baseline. |
| `persistentSelectionBounds` | `true` | Visible outline for multiple selection is required baseline, even with toolbar mode off. |
| `hideGroupedSelectionBounds` | `false` | Exact complete Group Frame selection still shows outline by default. |
| `editToolbar` | `true` | Preserve the existing edit tools; container depends on selection-toolbar mode. |
| `selectionCollapseTools` | `true` | Preserve adjacent collapse/expand controls; these are not arrangement formulas. |

`selection_ui.js:110–140` implements `'off'`, `'multiple'`, `'all'`; `151–160` implements persistent versus interactive outlines. With the hide-group option on, an exact complete Group Frame selection hides the outline (and hence its handles); partial/multiple/additional selection uses the usual rule. `locales.json:327–332` documents these settings. Defaults do not override or prove the user's stored current preference. The setting category “Experimental” must not be used to demote currently default-enabled capabilities into optional future work.

Complete Group Frames also contribute to selected visual bounds (`selection_ui.js:93–98`). Automatic/manual layout still uses node bounds (`369`), not a grouped atomic block. Neither group membership nor frame sizing should be inferred as independently rearranged from this outline behavior.

## E7 — History, failure and preservation

- `selection_ui.js:392` performs one `change` call for a command. `src/editor/app.js:287–289` does not record identical graph state. `324–334` snapshots state, restores graph/view on exception, emits the existing edit-failed status, and records a graph change on success.
- `app.js:315–328` recognizes layout-only changes and keeps semantic fields in its comparison. Layout is still graph UI state and can make the document dirty; it is not equivalent to the view-only Frame operation. Do not promise “no save”, “no Host traffic”, or “no Apply scheduling”: `mark()` can schedule the existing application flow.
- `docs/development/TESTING.md:162, 232, 236, 240` contains historical automated reports for auto arrangement, source/output ranking, cycles, port order, stable repeat, actual dimensions, selection scope, Undo/Redo and guards. These are **historical source evidence**, not tests rerun for this handoff.

## Limits and remaining review

The shipped rerunnable check is `node atlas/check-arrange.cjs`: **29 passed** using Node built-ins and a minimal DOM double, with no browser, server, external repository or application access. Source-derived golden coordinates are embedded so the handoff can be checked independently. It executes the actual chapter JavaScript against the DOM double, including selection, Apply, local Undo, guards and spread deltas. It cannot qualify rendering, accessibility, focus or real pointer event behavior.

The part author checked source, fixture outputs, syntax and local bounded illustration behavior; no live product placement or current-window measurement was performed. Local headless Edge/Playwright `setContent` validation passed **26 checks**, with **zero page errors and zero network requests**. Checks covered manifest IDs, all 11 listed commands, both automatic fixture results and Undo, horizontal/vertical equal gaps, selected-subset preservation, actual sizes, three-node distribution guard, read-only state, grid, stable repeat, overflow after sequential arrangements, evidence paths and narrow layout. Eight right-handle deltas from −180 through +220 were compared numerically with the unmodified source function. A separate check with the atlas's actual shared CSS found no document horizontal overflow at 360, 720 and 1400 CSS px; wide diagrams and tables scroll within their own containers. Syntax and JSON parse passed. These checks do not replace the root integrated build or product tests.

The atlas's socket fill follows the separate atlas direction (connected solid / disconnected hollow on either side), not Legacy's previous direction-specific rule. Samples do not claim precise production node definitions, menu dimensions, tab order or touch behavior.

Still requiring real product/owner visual review: menu clipping and focus at varied UI scales, touch handle acquisition, Note/Router title overlap with toolbar, full/partial Group Frame selections, and quality on large heterogeneous graphs. These are validation gaps, not missing proof that the listed source-level capabilities exist. Unselected-node avoidance and globally optimal crossing minimization are not existing promises.
