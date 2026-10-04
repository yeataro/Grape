# LIVE-004 — contextual actions, node search and source tags

Date: 2026-10-02. Same disposable graph, 1280 × 720, dark/Cool/standard. Actual UI observations; no product source inspection. This record adds bounded successful sequences, not full UX regression.

## O04-01 — collapse / expand

After Home made targets visible, selected Voronoi by its title and pressed Collapse selected nodes in the selection toolbar. Observed `node collapsed selected`, no individual `.port` elements on that collapsed card, and the action changed to Expand selected nodes. Pressing Expand restored the expanded node. Collapsed height was 24.308 screen px at approximately 57% zoom; this is **not** the logical card height or a proposed minimum hit target.

An earlier attempt while the title was outside the visible canvas did not establish the intended result. Only the grounded visible-target retry above is evidence. No change to connections or node values was intentionally made during collapse/expand; no model serialization comparison was taken.

## O04-02 — connection action surface

Clicked the visible wire hit area for Vertex Inputs.world → Voronoi.Vector. Selection toolbar was replaced by Connection quick actions: Wire / Link, Select source, Select destination, Disconnect wire. Wire was initially pressed. Clicking Link changed the displayed path to `wire-link selected`, stroke dash array 4px,5px; the same from/to attributes remained. Clicking Wire restored that style. Select destination selected the Voronoi node and showed its selection toolbar. This demonstrates a shared semantic connection with presentation variants and a contextual endpoint-navigation entry; not two different graph relations.

No disconnect or source-navigation click was performed through this toolbar in this sequence. Source navigation from connected Inspector rows was independently exercised in O02-03. Endpoint framing animation is advertised and seen in the UI; exact trajectory/duration has not been performance-qualified.

## O04-03 — canvas Create node search

Tab with canvas focus opened Create node. It contained Search available nodes, Source filter (All sources, GLSL, TouchDesigner, Editor, Personal, This Shader), Port type filter and category column, result list, and a detail area with title/source/category/signature/help/aliases. Empty query with All types showed Preview first, then Router, Math, Switch, Scalar. Empty query with vec3 also showed Preview first.

With vec3 filter and query Fresnel, results included Fresnel, Facing, Rim Light and View Direction with `Editor · Subgraph` source labels; detail for View Direction included signature and explanatory help. This supports relevance/alias-aware discovery, not a promise of a particular hidden ranking algorithm. Closed without adding a node. Sidebar Add Node addition was separately exercised in LIVE-002.

## O04-04 — Sources hierarchy and expanded entries

Opened Sources → Custom Uniforms → Values. Source headings show colored type/family counts with explanatory title text, not bare unexplained numerals. Expanded Uniform entries show name, Add reference to graph, Source actions, output type and current numeric/color controls; help explicitly says TD supplies a value shared by references. This is **legacy runtime wording**, not the new canonical/default authority rule.

Color entries showed R/G/B fields and color swatch, with Expand or collapse component values. We did not edit their values or exercise Add reference here. Source pseudo-node simplification remains an owner-undecided presentation choice; tags and discoverable source identity are positively preferred references.

Rendered source-count badge samples (10px text, 4px radius):

| Meaning | Background | Foreground |
|---|---|---|
| Attribute | #565141 | #eee6cf |
| Runtime Info | #62414f | #f5dde7 |
| Compile-time Info | #526d91 | #e3ecfa |
| Uniforms | #2a5e6b | #d0edef |

Only elements with nonzero rendered bounds were retained. Badges identify source category; do not substitute these colors for connection data-type colors. Machine-readable additions: `source-tags.tokens.json`.

## End state

Returned Show Custom Names to its earlier unpressed state and used Home. Browser viewport override is reset, language English. No transient Preview node remains. Four test nodes and existing frame remain in disposable graph. The Material Preview connection was not reclaimed from the other page. The browser tab is retained for later evidence gathering; no claim is made that private UI preferences or graph content were restored to the initial disposable fixture.
