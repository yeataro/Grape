# Grape UX/UI design handoff — working material

Status: UX/UI design handoff draft v0.3, offline atlas `ATLAS-005`, with bounded live evidence; not full visual/interaction qualification. Updated 2026-10-03: adds the Canvas behavior specification, acceptance index and five illustrated artboards. Prior Group / node arrangement / Link / color material is retained. This is not the rewritten product.

This workspace is independent of `C:/Users/user/Dropbox/Codex/Grape/`. That repository is strictly read-only for this task. Nothing here changes IH-005, authorizes a production slice, or acts as a new architecture baseline.

The objective is to preserve the functionality and visual quality of the running feature-preview product in the rewritten product. Current implementation progress is not the design scope: this material targets the full planned product, including late-stage visual application and missing interaction details.

## Sources and precedence

1. Accepted IH-005 contracts and adopted Product Decisions constrain ownership, editing authority, lifecycle and integration.
2. The actual running legacy editor supplies observed appearance and interaction evidence. Legacy DOM/classes are evidence locators, not recommended production structure.
3. Existing screenshots and earlier behavior records are secondary evidence; they cannot establish an unobserved interaction.
4. New design proposals, including optional color/style profiles, must be labeled separately from observed current behavior and accepted requirements. The compact color design is owner-accepted and shipped in Function Preview0.8.273. Bounded product tests are separately recorded; CEF/device qualification and rewrite acceptance remain open.

Important: the frozen UI_SPEC is a **first-slice specification**, not a complete final-product visual target. Its schematic illustrations must not replace the actual product as the fidelity reference. Some historical Mixed-History wording also remains there; DEC-GRAPE-001 governs the new product's domain-separated Undo.

## CANVAS-005：畫布操作補齊（2026-10-03）

先讀 [畫布操作規格](design/CANVAS_INTERACTION_SPEC.md)，配合 [畫布圖解](atlas/index.html#canvas-operations) 與 [20項行為／驗收索引](design/CANVAS_ACCEPTANCE.json)。包含pan、錨定zoom、MMB Dolly、選取／框選、node drag、Home/Frame/Focus、touch與scope、保存及取消差異。七組新實機操作另記於[CANVAS-LIVE-005](research/canvas-live-005.md)。詳見[變更與限制](design/ATLAS_005_CHANGELOG.md)。下方ATLAS-004敘述是前次增補歷史；目前圖册revision為005。

## Reading map

- **[UI / UX Design Atlas](atlas/index.html)**：先看可見設計稿與局部互動，再讀報告。ATLAS-005 增補畫布操作；ATLAS-004 新增 Group、節點排列、Link 導航與精簡 Color 的提交行為；所有圖冊互動只改本地示例。

- [UX/UI design report](design/UX_UI_REPORT.md): capability taxonomy, preserved design and configurable entry points.
- [Design premises](design/DESIGN_PREMISES.md): owner-required Node appearance, experimental-default policy, capabilities versus Widgets/styles, and S13 scope caveat.
- [Compact color behavior](atlas/COLOR_PICKER_SPEC.md): accepted presentation, simultaneous HSV/RGB rows, explicit RGB/RGBA adaptation, HEX rules and remaining runtime boundaries.
- [TD color reference](atlas/assets/td-color-reference.png): owner-supplied screenshot for the 44-color, 11×4 swatch reference.
- [Measured visual reference](index.html): offline searchable palette/metrics and explicitly illustrative specimens, not a replacement Node design.
- [Historical visual gallery](visual-reference/index.html): five owner-supplied full-resolution images, copied unchanged with hashes; not this session's live captures.
- [Interaction coverage](design/INTERACTION_COVERAGE.json): machine-readable observation versus unverified sequence boundaries.
- [Material verification](verification.json): JSON/link/image-integrity checks, with runtime and browser-QA limitations kept explicit.
- [Architecture compatibility](design/ARCHITECTURE_COMPATIBILITY.md): how to carry UX forward without copying legacy ownership.
- `research/extension-boundaries.md`: Panel/Widget/localization contracts and design freedom.
- `research/state-and-host-boundaries.md`: value authority, save/apply/readback, lifecycle and diagnostic distinctions.
- `research/ui-evidence-scope.md`: current evidence gaps and live-product inspection scope.
- `research/live-observations-001.md`: initial actual-product observation session.
- `research/live-observations-002.md`: disposable graph, connections, dynamic interfaces, undo, localization and responsive probe.
- `research/live-observations-003.md`: experimental controls, Host takeover state, custom-parameter window and export dialog.
- `research/live-observations-004.md`: contextual tools, node search, source hierarchy and tags.
- `research/current-dark-cool.tokens.partial.json`: measured subset of currently effective visual values; not a complete theme specification.
- `research/source-tags.tokens.json`: later rendered source-badge colors; separate from data-type colors.
- `research/experimental-controls-observation.json`: 29 settings plus two duration controls, current values and UI-indicated default evidence.

## Output approach

Use Markdown for design rationale and behavioral states; JSON for named colors, dimensions and evidence/status mapping; small standalone HTML/SVG specimens where interaction or visual comparison is useful. A specimen is not a production renderer or a replacement contract. Screenshots support the observations rather than becoming the entire design specification.

Each eventual component entry should identify its states, visible data, action/commit/cancel semantics, localization/long-text behavior, visual tokens, view-state persistence, accepted architecture boundary and evidence. Mark facts as observed, contract-required, historical, proposed or unverified.

## ATLAS-004 additions

Read [this round’s change log](design/ATLAS_004_CHANGELOG.md). The three new chapters explain explicit Group membership,11 node-arrangement commands, and Link/arrow navigation, with interactive bounded diagrams. “Layout” here means node arrangement; workspace panel composition is separate.

Color keeps the accepted100px square swatch,44-color TD palette, six saved slots and six simultaneous HSV/RGB rows. RGB uses six HEX digits without A; RGBA eight with A. The centered swatches/plane/eyedropper trio shares the compact header with × and non-live Apply. Uniform edits are live; outside accepts, ×/Escape restores opening values subject to authority/conflict. Non-live color stays draft until Apply; outside/×/Escape cancels. See [spec](atlas/COLOR_PICKER_SPEC.md) and [prior implementation evidence](research/color-implementation-004.md).

These additions preserve behavior and visual intent, not source module boundaries. Ordinary graph values do not acquire color/clamp semantics merely from being vectors. The atlas itself never writes a Graph, Host, History or preference.

## Current limits

Only dark / Cool / standard size has a measured palette. English/Japanese switching and a 760 × 900 browser viewport were probed; these are not real-device, complete localization, or accessibility qualification. Numeric text commit/cancel, click-to-connect, dynamic interface Undo, floating Inspector input, collapsed nodes and contextual connection actions have bounded evidence. Full numeric scrub/ladder, touch/pen/IME, layout roundtrip, nested/shared occurrences and failure/recovery sequences still need evidence. Earlier observations used0.8.272; this round observed0.8.273. Newer behaviors such as transient Preview must not be silently folded into the older IR-001 inventory.

The owner supplied `/project1/PBR_MAT_Graph3` as a disposable graph and explicitly authorized edits through its product UI. LIVE-002 onward includes such edits. This does not grant write access to the rewrite repository. Its source code, contracts, implementation state and plan were not modified.

This material expresses the final UX reference, not a claim that S13 implements every capability or a change to its scope. Required/default-enabled experiments, optional variants and undecided improvements are separated in DESIGN_PREMISES. Historical images and measured tokens preserve fidelity; none of the HTML specimens authorizes a redesign.

The custom color popup has shipped in the legacy preview, with bounded live/isolated/native TD evidence. This is recorded separately from atlas verification; it is not a rewritten-product acceptance result. CEF native-popup failure remains owner-reported, and real CEF/browser device/screen-eyedropper coverage remains incomplete. The current design task does not modify either product implementation.

The local reference HTML received static structure/link/data checks. Browser visual QA of these artifact pages was not completed: the tool blocked local file URL navigation, and no workaround was attempted. Live product observations used the explicitly authorized HTTP editor URL. Screenshots displayed in that tool session were not archived as image files; the portable gallery contains only the clearly labeled historical user images.
