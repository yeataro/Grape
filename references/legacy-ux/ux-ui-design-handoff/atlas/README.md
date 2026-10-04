本次增補：**ATLAS-005 / CANVAS-005**（2026-10-03）。[畫布圖解](index.html#canvas-operations)／[完整操作規格](../design/CANVAS_INTERACTION_SPEC.md)／[驗收與OPEN](../design/CANVAS_ACCEPTANCE.json)。五張靜態圖解不模擬runtime；七組實機觀察另附。以下ATLAS-004章節保留為歷史與其他能力入口。

# Grape UI / UX Design Atlas

Open **[index.html](index.html)**. This is `ATLAS-004`, an offline human-review reference for Legacy visual and interaction intent. No server, package installation or product connection is needed. The Dropbox Grape rewrite repository remains strictly read-only.

## Read this round

1. [Link + arrows](index.html#links): pale lines, direct-peer navigation, visibility, menus and keyboard shortcuts.
2. [Group](index.html#groups): explicit membership, selection, movement, bounds, styling, member collapse and removing the frame while keeping the graph.
3. [Node arrangement](index.html#arrange):11 commands, selected scope, source/result order, equal edge gaps and spacing controls. **Layout here means node arrangement, not panes.**
4. [Color](index.html#color): the approved compact design, now aligned with Function Preview0.8.273 Uniform/constant behavior.
5. [Review notes](index.html#review): new rows for each chapter; download identifies ATLAS-004.

Existing whole-workspace, Node, socket, numeric-field, Panel, overlay, grid, Scroller and localization references remain available. [Change log](../design/ATLAS_004_CHANGELOG.md) explains what was added and which old statements were superseded.

## Interpret the material

- **Reference redraw:** backed by named live observations or bounded source review. Source files are evidence locators, not recommended production modules.
- **Owner-required:** preserve Node appearance, the exact three-circle product mark, reliable product-owned color editing and Uniform Source simplification. Required/default-enabled experiments remain distinguishable from optional display variants.
- **Owner-directed socket revision:** unconnected hollow, connected solid, in both directions. Do not infer that the Legacy socket code was changed.
- **Local illustration:** only this page's memory changes. Helper controls, local Undo and target-mode selectors are review scaffolding, not new production toolbar designs. No Graph, TD, Host receipt, History or settings are written.
- **Product evidence:** prior0.8.273 results are separately identified. Passing a local diagram test is not product/runtime qualification.

HTML/CSS/SVG structure is presentation scaffolding. The rewrite uses its accepted Panel/Widget/command/ownership contracts. Capability and target semantics are the intent; current menu/toolbar placement is a configurable reference. This atlas does not alter IH-005,618-capability inventory or slice authorization.

## Color policy

H/S/V/R/G/B remain six synchronized rows. R/G/B are normalized values, not255. RGB omits A and uses `#RRGGBB`; RGBA shows A and `#RRGGBBAA`, includingFF. Six-digit paste into RGBA preserves A. The100×100 current swatch,44-color11×4 grid, six saved slots and square/circle/triangle planes retain the approved compact composition.

Uniform is live: outside accepts; ×/Escape attempts restoration of the opening value under the real target's authority/conflict rules. Non-live color is draft: Apply commits; outside/×/Escape cancels. The central swatches/plane/eyedropper trio stays centered; Apply appears only for non-live targets. The atlas simulates local values only and cannot execute Host CAS.

[COLOR_PICKER_SPEC.md](COLOR_PICKER_SPEC.md) is the detailed design contract. [Prior implementation evidence](../research/color-implementation-004.md) explains shipped0.8.273 results and unqualified CEF/device/eyedropper/color-management scope. Screen capture is not performed by the atlas.

## Build and check

From this directory, Python3.12+ and Node.js:

```text
python build.py
python check.py
node check-atlas.cjs
node check-fields.cjs
node check-links.cjs
node check-groups.cjs
node check-arrange.cjs
node check-color.cjs
```

The artifact is generated from `shell.html`, root CSS/JS and independently scoped fragments in `parts/`. `index.html` embeds CSS/JS. Keep the relative images, evidence and documents with it. No product source is imported by these drawings.

Actual results and limitations are in [verification.json](verification.json). These checks concern static integrity and finite local illustration logic. CUA cannot inspect this `file:` page under its URL policy; current integrated browser visual QA remains unavailable. Human review is required. Earlier helper-render reports are identified by their actual method and excluded from accepted integrated browser evidence.

## Indexes and limits

- [atlas-manifest.json](atlas-manifest.json): artboards, source references, boundaries.
- [evidence.json](evidence.json): earlier DOM style and grid samples.
- [Interaction coverage](../design/INTERACTION_COVERAGE.json): original bounded observations plus ATLAS-004 supplements; no automatic promotion to full product PASS.
- [Original screenshots](../visual-reference/index.html): unchanged owner-supplied historical visual anchors.
- [UX/UI report](../design/UX_UI_REPORT.md): behavior taxonomy, design reasons and remaining evidence gaps.

No complete editor simulation, shader generation, production History, durable settings or new color-management promise. Source-backed rules are more complete than the intentionally small demos. Real touch/pen/IME, accessibility, CEF/Safari/iPad, full workspace roundtrip and other unobserved sequences remain unqualified.

Review notes are memory-only until downloaded. Reload loses unexported notes. Human acceptance does not happen automatically when a check passes.
