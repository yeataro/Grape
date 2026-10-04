# UI evidence scope — read-only handoff review

Date: 2026-10-02. Scope: final UX/UI design reconciliation, **not implementation progress or a new architecture review**.

The initial pass read documents only under `C:/Users/user/Dropbox/Codex/Grape/handoff/`. It did not write there, run tests/install/git, inspect application implementation, operate TD/browser, or observe the live product. The later evidence reconciliation below reads the external LIVE-001/LIVE-002 records and DESIGN_PREMISES, and updates only this note and the external interaction tracker. This reviewing agent still performed no live operations or source inspection. Document statements remain document evidence; actual observations are attributed to the live observer and exact record.

## Main finding

The existing package distinguishes its evidence correctly, but it is not a complete final-product visual/interaction specification. `UI_SPEC.md` is expressly a **first-slice specification**: root Canvas, Inspector, basic document/generation/save actions. It defers much of the full workspace while preserving those capabilities for later reconciliation. Its schematics must not become the final product's visual reference by default. Conversely, the five legacy screenshots establish visible historical states, not live interaction behavior. The missing bridge is a versioned observation record of the **actual product**, covering the full UI scope and state transitions, then compared with the already adopted architecture and behavior contracts. [S1, S2, S3]

“First slice may omit this” must not be treated as “final product may omit this.” Whether any slice is implemented today does not settle the final design question.

## Source map

All following source paths are read-only inputs. Line anchors identify the relevant starting passage.

- **S1 — UI scope and evidence classes:** [UI_SPEC.md:3](C:/Users/user/Dropbox/Codex/Grape/handoff/ui-reference/UI_SPEC.md:3), [S/B/P/R table:7](C:/Users/user/Dropbox/Codex/Grape/handoff/ui-reference/UI_SPEC.md:7), [deferred first-slice UI:30](C:/Users/user/Dropbox/Codex/Grape/handoff/ui-reference/UI_SPEC.md:30).
- **S2 — canonical visual locator and checklist:** [SCREEN_INDEX.md:3](C:/Users/user/Dropbox/Codex/Grape/handoff/ui-reference/SCREEN_INDEX.md:3), [first-slice view checklist:17](C:/Users/user/Dropbox/Codex/Grape/handoff/ui-reference/SCREEN_INDEX.md:17).
- **S3 — legacy supplement and limitations:** [legacy screenshots README:3](C:/Users/user/Dropbox/Codex/Grape/handoff/ui-reference/legacy-screenshots/README.md:3), [uncovered states:45](C:/Users/user/Dropbox/Codex/Grape/handoff/ui-reference/legacy-screenshots/README.md:45), [manifest.json](C:/Users/user/Dropbox/Codex/Grape/handoff/ui-reference/legacy-screenshots/manifest.json).
- **S4 — schematic QA, not product QA:** [VISUAL_QA.md:3](C:/Users/user/Dropbox/Codex/Grape/handoff/ui-reference/VISUAL_QA.md:3).
- **S5 — full workspace scope:** [08_IMPLEMENTATION_PLAN.md:288](C:/Users/user/Dropbox/Codex/Grape/handoff/08_IMPLEMENTATION_PLAN.md:288), [S01 real UI evidence:113](C:/Users/user/Dropbox/Codex/Grape/handoff/08_IMPLEMENTATION_PLAN.md:113), [shared renderer prerequisite:585](C:/Users/user/Dropbox/Codex/Grape/handoff/08_IMPLEMENTATION_PLAN.md:585).
- **S6 — behavioral acceptance:** [09_ACCEPTANCE_AND_CONFORMANCE.md:65](C:/Users/user/Dropbox/Codex/Grape/handoff/09_ACCEPTANCE_AND_CONFORMANCE.md:65), [S06:133](C:/Users/user/Dropbox/Codex/Grape/handoff/09_ACCEPTANCE_AND_CONFORMANCE.md:133), [S08:158](C:/Users/user/Dropbox/Codex/Grape/handoff/09_ACCEPTANCE_AND_CONFORMANCE.md:158), [S10:204](C:/Users/user/Dropbox/Codex/Grape/handoff/09_ACCEPTANCE_AND_CONFORMANCE.md:204).
- **S7 — evidence/Gate boundaries:** [10_KNOWN_GATES.md:7](C:/Users/user/Dropbox/Codex/Grape/handoff/10_KNOWN_GATES.md:7), [UI UNKNOWNs:285](C:/Users/user/Dropbox/Codex/Grape/handoff/10_KNOWN_GATES.md:285), [UI conformance:731](C:/Users/user/Dropbox/Codex/Grape/handoff/10_KNOWN_GATES.md:731), [Panel/Widget runtime evidence:759](C:/Users/user/Dropbox/Codex/Grape/handoff/10_KNOWN_GATES.md:759).
- **S8 — formal localization contract:** [15_LOCALIZATION_CONTRACT.md:7](C:/Users/user/Dropbox/Codex/Grape/handoff/15_LOCALIZATION_CONTRACT.md:7), [all visible text positions:31](C:/Users/user/Dropbox/Codex/Grape/handoff/15_LOCALIZATION_CONTRACT.md:31), [fallback/limits:66](C:/Users/user/Dropbox/Codex/Grape/handoff/15_LOCALIZATION_CONTRACT.md:66), [locale vs user content:76](C:/Users/user/Dropbox/Codex/Grape/handoff/15_LOCALIZATION_CONTRACT.md:76).
- **S9 — adopted domain-separated Undo:** [08_IMPLEMENTATION_PLAN.md:409](C:/Users/user/Dropbox/Codex/Grape/handoff/08_IMPLEMENTATION_PLAN.md:409), [09_ACCEPTANCE_AND_CONFORMANCE.md:173](C:/Users/user/Dropbox/Codex/Grape/handoff/09_ACCEPTANCE_AND_CONFORMANCE.md:173), [G-MIXED-HISTORY:719](C:/Users/user/Dropbox/Codex/Grape/handoff/10_KNOWN_GATES.md:719).
- **S10 — Host/Viewer observation scope:** [08_IMPLEMENTATION_PLAN.md:328](C:/Users/user/Dropbox/Codex/Grape/handoff/08_IMPLEMENTATION_PLAN.md:328), [S10 remote Preview:452](C:/Users/user/Dropbox/Codex/Grape/handoff/08_IMPLEMENTATION_PLAN.md:452), [native window ambiguity:525](C:/Users/user/Dropbox/Codex/Grape/handoff/10_KNOWN_GATES.md:525), [Viewer Undo/persistence:565](C:/Users/user/Dropbox/Codex/Grape/handoff/10_KNOWN_GATES.md:565).

## What is normative, illustrative, or evidence-only?

| Material | Authority actually stated | Appropriate use in final design reconciliation | Cannot establish |
|---|---|---|---|
| `UI_SPEC.md` S — Structural | Ownership, identity, routing, Graph/Context/Panel relationships | Preserve these constraints regardless of the eventual rendering/layout | Exact visual resemblance, actual live behavior, production readiness |
| `UI_SPEC.md` B — Behavioral | Observable outcome and failure/transition requirements, often linked to LC IDs | Observe corresponding product interactions and trace preserved intent; report a conflict if the requirement and observed behavior differ | That the original product or new product already passes every case |
| `UI_SPEC.md` P — Visual preference | Existing appearance/configuration preferences should be preserved preferentially | Compare actual product density, styling and defaults; distinguish aesthetic choice from a preference's save/reset behavior | Permission to erase preference persistence because a theme changes |
| `UI_SPEC.md` R — Replaceable | Schematic layout, icon/token/exact geometry not promised by this first slice | Leave dimensions visibly provisional until actual-product comparison and owner design reconciliation | Permission to silently turn a first-slice mockup into the final UX or override S/B |
| `workspace-schematic.svg`, `states-schematic.svg`, their rendered PNGs | Handoff schematics only; UIR-01–04 conceptual relationships | Explain model/UI relations and states | Legacy screenshots, final visual specification, live event/focus/IME behavior |
| `VISUAL_QA.md` / `RENDER_RECORD.json` | Recorded static readability inspection at 1280×760 and 1280×690, one recorded headless Edge/tool/scale environment | Establish that the two artifacts were readable in those conditions | Product DOM usability, responsiveness, device support, screen-reader behavior, TD preview correctness |
| LUI-01–05 original JPEGs / manifest | User-supplied historical desktop visual evidence only; no transformations; only LUI-01 has an explicit visible version (0.8.271 DEV) | Supplement actual-product observation with historical appearance/context | Current version defaults; any before/after behavior; saved layouts; freshness of preview; cause of TD errors |
| `08` / `09` / `10` | Product scope, acceptance requirements and unresolved evidence/decisions; not completion status | Ensure final design review covers all relevant interactions rather than just the first picture | A screenshot or a successful prototype proving product acceptance |
| `15_LOCALIZATION_CONTRACT.md` | Adopted feature-owned text/presentation and fallback contract | Preserve localization ownership and validate its visible consequences in actual UI | Completed translations, all fonts/IME, RTL, full number/date/plural formatting |

UI_SPEC already fixes a few precise values: matrix dark/light colors, line hit-area behavior, Overview thresholds/caption rules and narrow-layout breakpoint. These are explicitly attributed behavioral rules, unlike the schematic palette. Do not extract a replacement palette from the schematic or promote JPEG color measurements to exact specifications. [UI_SPEC §5:65](C:/Users/user/Dropbox/Codex/Grape/handoff/ui-reference/UI_SPEC.md:65), [§9:118](C:/Users/user/Dropbox/Codex/Grape/handoff/ui-reference/UI_SPEC.md:118).

## Existing visual coverage, without inference from screenshots

The supplement's own descriptions—not a new image analysis in this pass—say:

- **LUI-01:** English MAT Vertex, Sources, selected Vertex Output, docked Parameter, Material Preview and Help.
- **LUI-02:** TOP Pixel, Japanese/English text, categories, selected Replace, numerical/color OP Parameters, Output Preview.
- **LUI-03:** `view` search, selected Facing, floating Parameter and Material Preview with docked OP Parameter/Help.
- **LUI-04:** MAT graph overview at 29%; it explicitly does **not** establish whether the experimental Overview preference is on.
- **LUI-05:** Voronoi details at 112%, floating Parameter/Preview and hidden sidebars; visible TD-unresponsive status does **not** establish cause or preview freshness.

No screenshot proves that Default or Minimal was selected, floating-state persistence worked, a node was dynamically reconfigured, a gesture succeeded, or an Undo restored anything. The supplement explicitly lacks empty/multi-selection states, expanded menus, rejected connection/missing module states, drafts/errors, subgraph navigation, mobile/touch and before/after transitions. [S3]

## Actual-product observation checklist for final design reconciliation

**Every row was NOT OBSERVED in the initial document-only pass.** Later LIVE-002 partial evidence is mapped below and in the interaction tracker; do not read this original checklist as a current claim that nothing has been observed. These are observation targets, not new requirements, redesign proposals, implementation tasks or claims that the corresponding feature is missing. Preserve the exact live build and conditions. Use still images as supporting frames of an interaction record, not the source of inferred behavior.

| Scope to observe | Necessary live sequence / conditions | Evidence sought and existing constraint |
|---|---|---|
| Full desktop workspace anatomy | Open the real product with a representative MAT and TOP; identify title/header, upper/lower bars, browser, Canvas, Inspector, OP Parameter, Help, code and preview entry points | Actual panel names, hierarchy, defaults, command discoverability and information density; first-slice anatomy alone is insufficient. LC-UI-060; S1/S5 |
| Default, Minimal, saved and floating layouts | Switch named built-ins; float/dock, collapse/reveal, resize; save/reload the layout under an explicitly safe observation setup | Which state persists vs is temporary; whether restoring one layout closes/reopens floating views; no assumption that LUI-05 depicts Minimal. AT-S06-01; G-LU-UI-002; S1/S3/S7 |
| Canvas focus, selection and navigation | Empty click; single/add/toggle selection; primary selection; marquee completion/cancel; pan, cursor-anchored zoom, Home/Frame; readonly navigation | Visible primary vs selected set, focus destination, threshold/cancel behavior, screen/graph coordinate consistency. LC-UI-001/002/008/019; G-LU-UI-004 |
| Multiple contexts, tabs and routing | Where supported, independently select/pan in two views; activate each; move/close view; inspect linked/unlinked or pinned parameter targets | Model sharing vs camera/selection independence and Inspector retarget/empty-state handling. AT-S01-06, AT-S06-01. If legacy has no such public interaction, record that fact rather than manufacture observed legacy support |
| Add Node/browser/library/search | Open unfiltered and filtered menus, search by displayed/technical name and source; browse categories/library; add via menu and drag-to-empty | Real hierarchy, ranking, keyboard behavior, filtering, disabled/missing items, source distinctions and creation placement. S06 + LC-UI-026; screenshots only show one query, not menu behavior |
| Node appearance and controls | Fixed, source, output, subgraph and dynamic nodes; collapsed/expanded states; long names; selected/error simultaneously; body controls and title controls | Actual caption/type/name relationships, density, colors, handles, focus boundaries and variations. Preserve S/B; do not substitute schematic dimensions. UI_SPEC §3–5 |
| Ports, wires and Links | Valid connection; occupied input; invalid direction/type/cycle; drag end on empty space; Wire/Link toggle; source/target navigation | Rejection vs replacement vs disconnect and visible feedback; plain text vs gradient; socket alignment and precedence over line hit-area. AT-S01-02; LC-UI-025/026/027/031/058 |
| Dynamic interface changes | Change a dynamic mode with live connections and Inspector fields present; undo/redo; switch away and back | Ports, fields, link state, loss/diagnostic indicators and stale controls must remain coherent; document the exact UI transitions. AT-S01-03; G-EXTENSION-WIDGET-SCOPE |
| Inspector field editing | Scalar/bool/menu/color/vector/matrix; unconnected vs connected; component-level controls; readonly/missing widget; active text while another update occurs | Actual commit/cancel/clamp/validation, focused draft preservation, section separators, labels, control sizing and connected-source navigation. LC-UI-042–047/058/093; AT-S01-04 |
| Numeric gestures and text/IME | Real mouse/pen/touch where available; scrubbing/ladder; threshold; Enter/Escape/blur; IME composition; context/menu activation while field draft exists | Exact event-to-commit boundary, one-gesture Undo, text shortcut isolation, cancel/release behavior. G-LU-UI-001/003; AT-S06-02/04 |
| Nested/subgraph navigation | Enter shared and nested subgraphs; edit/query the selected node; navigate out/back; repeat through another occurrence | Breadcrumb/target clarity, scoped Inspector spec/value/link/write consistency, preserved view state and stale target behavior. S03; G-EXTENSION-WIDGET-SCOPE. Do not infer clone/ownership semantics from repeated pictures |
| Frames, notes, clipboard and custom names | Group/ungroup, rename/comment, copy/paste and rejection path, selection toolbar, preference toggles | Real discoverability, selection consequences and persistence behavior; separate decorative metadata from document actions. S06 scope |
| Code, diagnostics and status | Generate success; invalid graph; old successful artifact retained; locate error; change graph/context while code request is pending | Current graph/stage identity, error persistence, warning/error presentation, last-good vs current status, stale response handling. AT-S08-01/04; LC-UI-076/077/091/099; G-LU-UI-007 |
| Save, export, reload and dirty state | Safe disposable graph: save acknowledgment, edit during save, JSON/PNG export, import review/cancel, document reload vs Host Reload Applied | Distinct status meanings, exact confirmation/draft behavior, no accidental half-replacement; preserve original data during failures. AT-S01-05/07, AT-S02-04, AT-S08-03; G-LU-UI-008 |
| Undo domain and focus cues | Inspect current legacy graph/native/live chronology as legacy evidence; separately reconcile the adopted domain-separated design with Canvas/Inspector/live controls/drafts/no domain | Do not copy legacy unified chronology into the new design. Capture the visible cues needed to understand the adopted domains without defining a coordinator. DEC-GRAPE-001; S9 |
| Host association and native controls | Identify actual target, disconnect/reconnect, inspect unavailable/permission/error states; record native window entries separately from embedded controls | Low-friction correct target association, retained Graph usability and honest runtime state. Host-hosted location is historical context, not canonical ownership. G-PD-3/4A/4B; S10 |
| Remote Preview and Viewer | MAT/TOP switch, automatic Home, normalized drag/pan/zoom, resize, acquire/stop, focus loss, failed candidate switch, late frame; viewer parameter sections | No initial jump, correct target, capture cleanup, readable section layout; real live image vs cached image; viewer Undo/persistence is separately evidenced. AT-S10-01–04; G-LU-HOST-006 |
| Language and long text | Switch available locales in shell, menus, Node/Panel labels/help/actions/diagnostics; long CJK button/name; missing translation fallback; user-authored text | No model/selection/value change, stable menu values, reflow/ellipsis/full-name access, no overlap; feature-owned texts and fallback stay separate from user text. UI_SPEC §4; localization §§1/4/5 |
| Responsive and input/device variance | Resize across the stated ≤800px boundary, restore desktop; open/close overlays, add node, toggle header; fractional content zoom; real keyboard/Fullscreen/color picker/clipboard permissions | Desktop preferences survive temporary narrow layout; coordinates/Context stay correct; record platform/device/build/scale. LC-UI-066, G-LU-UI-001, AT-S06-04. Desktop mockup cannot settle mobile design |
| Keyboard/accessibility and extension lifecycle | Focus order/visible focus/labels; close veto; move/hide/remount ordinary Panel; read-only and editing widgets; placeholder/retry if applicable | Discoverability and state continuity, cleanup of events/drafts/gestures, accessible unavailable/error state. G-UI-CONFORMANCE, G-EXTENSION-PANEL; no screen-reader evidence presently established by these refs |

An observation record should carry: live product/build identity, graph kind and representative fixture, locale/theme/viewport/zoom/device, starting state, exact action, observed result, visible before/after evidence, relevant LC/AT/Gate IDs, and an explicit distinction between **observed**, **documented but not exercised**, and **not observable in the available environment**. Record surprises as discrepancies; do not redesign them away or call them intentional solely because they occurred once.

## Concrete mismatches and ambiguities to preserve for reconciliation

| Finding | Evidence | Interpretation / boundary |
|---|---|---|
| **Stale mixed-history wording in UI_SPEC** | [UI_SPEC:47](C:/Users/user/Dropbox/Codex/Grape/handoff/ui-reference/UI_SPEC.md:47) still says LC-UI-100 has an MRDP gate; [UI_SPEC:112](C:/Users/user/Dropbox/Codex/Grape/handoff/ui-reference/UI_SPEC.md:112) says the Host slice should separately define chronology. Updated 08/09/10 explicitly defer coordinated chronology under DEC-GRAPE-001. [S9] | A real documentation inconsistency, not a request to restore legacy unified Undo. Final design reconciliation should use the already adopted domain-separated behavior and retain stale wording as a flagged source discrepancy. No source edited here |
| **First-slice visual spec vs final-product design** | UI_SPEC:3/30 intentionally defers catalog/library/free layout/preview/OP Parameter/notes/advanced interactions; S06 and S10 preserve broad full-product scope. [S1/S5/S10] | Deliberate scope boundary, not evidence those behaviors can be dropped. The final design handoff must not stop at UIR-01–04 |
| **Historical supplement wording appears current if read alone** | Screenshot README:11 says SCREEN_INDEX remains unchanged and only indexes UIR, and that multilingual supplement was not written back. SCREEN_INDEX:5 explicitly explains this as IH-001 history; `15_LOCALIZATION_CONTRACT.md` now defines i18n. [S2/S3/S8] | Already qualified historical wording, not proof that current locator or i18n contract is absent. Read canonical index plus current localization contract; do not overwrite original evidence |
| **Panel-extension timing could be misread** | S06 [08:306](C:/Users/user/Dropbox/Codex/Grape/handoff/08_IMPLEMENTATION_PLAN.md:306) says arbitrary external panels have a separate Gate; [08:585](C:/Users/user/Dropbox/Codex/Grape/handoff/08_IMPLEMENTATION_PLAN.md:585) requires the same public view/mount seam from the first Canvas/Inspector. | The latter clarifies contract timing: no built-in-only hardwiring first. Runtime/device qualification remains a separate evidence question; this is not a reason to invent new UI architecture |
| **Exact look remains intentionally underspecified** | UI_SPEC §5/8 marks most palette/font/spacing as unqualified; LUI capture dates/versions mostly unverified; VISUAL_QA only checks two schematic viewports. [S1/S3/S4] | The current package cannot uniquely define final visual density, typographic hierarchy, button wrapping, menu geometry or control spacing. Actual-product observation and explicit design classification are needed, not pixel guesses from JPGs |
| **“Preview” is not one proven capability merely because the word is reused** | S10 defines remote Viewer/capture/lease interaction and LC-HOST-023–035. [S10] | Its contract cannot by itself establish behavior of any separately named shader/computation Preview node found in a later live build. Record a distinct observed capability/version if encountered; do not conflate them |
| **Documented behavior can still have unresolved legacy intent** | G-LU-UI-004 marquee cancel; G-LU-UI-005/G-PD-2 named-preset retention; G-LU-HOST-004 native-window visibility/remote action scope. [S7/S10] | Observation can show what happens, but cannot alone decide the intended retention or remote-control policy. Preserve the existing question and evidence rather than silently normalize behavior |

## Existing evidence gaps relevant to UI, without declaring new Gates

- **G-LU-UI-001 / G-UI-CONFORMANCE:** real iPad/Safari, native keyboard/Fullscreen/color picker, fractional zoom, focus/IME/cancel and device interactions remain a matrix of evidence; no static rendering substitutes for it.
- **G-LU-UI-002 / 006:** historical browser assertions/defaults may differ from the recorded 0.8.271 UI and Vector/Replace split. A live observation must record exact build and options, not select whichever old test or screenshot looks authoritative.
- **G-LU-UI-003 / 004:** full readonly/busy/IME action isolation and marquee-cancel behavior require explicit transitions. These are hidden by normal-state screenshots.
- **G-LU-UI-005 / G-PD-2:** named presets above the legacy boundary concern user data/retention intent; the screenshot supplement says nothing about it.
- **G-LU-UI-007 / 008 / 009:** late code reply, reload/draft cleanup and native/live lifetime races require controlled sequences. Ordinary live browsing cannot prove absence of races, and no such experiment was run in this pass.
- **G-EXTENSION-PANEL / G-EXTENSION-WIDGET-SCOPE:** public composition/scoped-target contracts are already accepted in the package's contract scope; actual renderer/focus/IME/cleanup/accessibility remains a separate qualification. Do not reopen ownership on the strength of a visual mismatch.
- **G-LU-HOST-006 / G-LU-AUDIT-001 / 002:** viewer control Undo/save/reload, embedded TOE/TOX differences, and real TD/GPU/browser/platform support remain scoped evidence limitations. An image visible beside “TD not responding” resolves none of them.

The reconciliation output should preserve adopted architecture, preserve actual observed product intent, classify any visual preference separately, and explicitly mark unresolved policy/evidence. It should not inherit legacy Host ownership, guess behavior from screenshots, reinterpret documentation-only QA as runtime validation, or use present implementation progress to decide the final design.

## Later live evidence reconciliation — revision 2

Sources: [LIVE-002](live-observations-002.md), [LIVE-001](live-observations-001.md), [DESIGN_PREMISES](../design/DESIGN_PREMISES.md), [INTERACTION_COVERAGE](../design/INTERACTION_COVERAGE.json). This subsection is evidence indexing, not a new LC inventory, architecture decision or implementation-progress report.

LIVE-002 was recorded by the authorized live observer on the disposable `/project1/PBR_MAT_Graph3`, TD-Grape 0.8.272 DEV / Pixel, 1280×720, English/dark/Cool/standard/UI scale 1. Japanese and 760×900 were temporary and restored. Initial 36 nodes/r432 describe the initial state; save revisions are not compilation counts. Browser screenshots were displayed during the session but **no portable screenshot files were saved**.

Observation granularity is now explicit:

- **Inspected current state:** control/options/value/geometry seen, without proving advertised effect.
- **Observed transition:** a bounded before/action/after sequence actually witnessed.
- **Unattributed after-state:** state/status seen later without established trigger/timing.
- **Advertised:** help/shortcut/caption promises; remains separate from the actual transition.
- **Contract-required / owner-required:** normative requirement, independent of whether the old product exhibited or was tested against it.
- **Unverified required sequence:** missing any part of the broad planned sequence; partial observed subclaims cannot promote it to PASS.

| Source case | What is now evidence | Linked UX entries (principal) | Still not established |
|---|---|---|---|
| **O02-01** | Search/add Preview and Scalar, valid scalar Enter commit, click-output/click-input connection, green 0.78-opacity Preview, automatic Shader applied feedback. Help advertises conversions/lifetime. | UX-MENUS-002, UX-FIELDS-001, UX-CANVAS-005, UX-PREVIEW-005 | Dragging, every GenType conversion/pixel output, singleton relocation, no-save/export, additional buffers and explicit leave/expiry semantics. Advertised conversion text is not a pixel test |
| **O02-02** | Ctrl+A selected 38; Delete removed ordinary nodes/Preview and retained Vertex Inputs, Color Output and Pixel Output frame; Inspector cleared. | UX-CANVAS-001, **UX-NODE-006** | Every stage/subgraph endpoint rule, deletion Undo/Redo, primary/toggle/marquee selection |
| **O02-03** | Voronoi 3D→4D ports; connected Color output through floating Inspector; source-name navigation selected/framed Voronoi; Distance to Edge removed relevant outputs/wire; one Undo restored interface and wire together. | UX-DYNAMIC-001/002, UX-FIELDS-004/006, UX-CANVAS-005, UX-SHELL-005 | Redo, arbitrary type/cycle rejection, saved loss recovery, Disconnect local-value recovery, nested/shared targets, Host/live Undo domains |
| **O02-04** | Inspector float/dock retained selected target; Settings tab persisted on later target; Scale 7.25 Escape returned node/Inspector to 5. Notes/ID controls inspected only. | UX-PANELS-001/002/003, UX-FIELDS-001, UX-NODE-005 | Preset application/persistence, divider/move/remount/draft continuity, note commit/recompile, ladder/drag/IME semantics |
| **O02-05** | English→Japanese→English; visible shell/help/Inspector text changed, technical identifiers remained; Japanese action wrapped on two lines, some field labels ellipsized. | UX-I18N-001/002/003, UX-SOURCES-003 | All catalogs/fallback, actual glyph/font coverage, complete graph serialization invariance; footer assertion alone is not an independent graph diff |
| **O02-06** | Invalid source name prevented creation and kept dialog/error visible; switching to Uniform Array · CHOP changed available controls/types. Source group/current control presentation inspected. | UX-SOURCES-001/**005**, UX-ERROR-002 | Valid creation, duplicate/all-name constraints, resource acquisition/sample validation, all failure styles |
| **O02-07** | Array type/length/settings inspected; TDMatrix[4] rendered gradient socket/plain type text, constant title and selected border. Compile-time/runtime rejection is advertised only. | **UX-FIELDS-008**, UX-NODE-001/002 | Element-table editor beyond this path, valid/invalid length transitions, actual runtime rejection, light theme/allaggregate states |
| **O02-08** | Generated GLSL dialog opened/closed, Vertex/Pixel text visible; active Preview override appeared before primary output. | UX-ERROR-001, UX-PREVIEW-005 | Compile-failure/last-good/stale response semantics, actual GPU output correctness; text is not a new implementation template |
| **O02-09** | 760×900 hid sidebars; right overlay opened; header reflow/Canvas dimensions recorded; desktop dimensions returned at 1280×720. | UX-TOUCH-001, UX-SHELL-001/002 | Real touch/tablet/pen, overlay dismissal, narrow add-node action, stored preference invariance and exact responsive boundary |
| **O02-10** | Later Preview absence and “Preview session ended; the formal output has been restored.” status. | UX-PREVIEW-005 | **Trigger and timing unknown.** Neither explicit leave/TTL/connection loss nor pixel restoration was established; preserve as unattributed after-state |
| **Named menu inspections** | Layout entries seen; `layout.title` untranslated accessibility name; experimental Reset defaults disabled in current preference environment. | UX-MENUS-001/**006**, UX-PANELS-002, UX-I18N-003 | No layout action applied; no factory-default proof. The detailed controls record is now available and linked in revision 3 below; no factory defaults are inferred solely from current values |

The failed coordinate wire-drag attempt in LIVE-002 is **not evidence of a product drag defect**: an overlapping floating panel/incorrect target grounding may have intervened, and later click-source/click-input succeeded. Pointer dragging remains unverified.

At revision 2 the tracker had **65 UX entries in 12 components**, including four explicit additions: protected endpoint deletion, source creation validation, aggregate controls and experimental-default qualification. It maps 42 LIVE-002 evidence records across 32 entries: 26 bounded transition mappings, 13 inspected-state mappings, two advertised-only mappings and one unattributed-after-state mapping. A single O02 case may support several component entries; these are **not** 42 independent test runs. **No complete broad planned sequence is marked verified**; 65 remain unverified. Prior LIVE-001 evidence is retained.

## Owner premise applied without guessing defaults or freezing button locations

[DESIGN_PREMISES §2–3/6](../design/DESIGN_PREMISES.md) supplies the current policy:

1. Experimental capabilities with trustworthy **factory-default enabled** evidence are required. Those with trustworthy **factory-default disabled** evidence are optional candidates. The experimental label does not itself permit omission.
2. Current checkbox state or disabled Reset defaults is only current-state evidence. Until default evidence is available, individual requiredness remains unresolved unless independently required by the owner/contract. Do not reset owner preferences merely to manufacture default evidence.
3. Buttons, toolbar positions and menu group placement are configurable reference composition. Track the capability, target, edit/commit/cancel/feedback separately from where its legacy button lives. A new placement cannot silently delete the ability or its required semantics.
4. Numeric range/step/clamp, widget interaction and visual skin remain distinct. The ordinary text Enter/Escape samples do not establish slider/ladder precision or transaction semantics.
5. Existing accepted decisions, particularly DEC-GRAPE-001 domain-separated Undo, continue to constrain the new product; legacy observed behavior does not reopen the deferred coordinator.

## Highest-value remaining live UX gaps

These are prioritized evidence needs, not a request to reopen architecture or a claim that all require the same runtime setup.

1. **Everyday editing precision and cancellation:** actual numeric scrub/ladder/modifiers, gesture release/Escape/Undo, draft blur/menu interaction and text/IME shortcut isolation. Current help is richer than executed evidence.
2. **Connection UX beyond happy-path clicks:** grounded wire drag, occupied-input replacement, type/cycle rejection, drag-to-empty creation/cancel, Link and component controls. Preserve the failed-attempt caveat.
3. **Workspace composition and persistence:** apply Default/Minimal, named save/restore, divider resize and floating target/draft continuity. Float/dock and a narrow viewport roundtrip do not prove saved layout.
4. **Nested identity and target continuity:** shared subgraph occurrences, scoped Inspector values/links/write, stale selection/path and source Disconnect recovery. Root source-name navigation covers only the root happy path.
5. **Default-enabled experimental scope:** obtain trustworthy version-matched default facts, then observe their effects. The classification rule is settled; individual flags currently are not.
6. **Separate Preview lifecycles:** remote Viewer input/capture/navigation and shader Preview singleton/explicit end/non-persistence/formal-output recovery. Unattributed O02-10 must not fill this gap.
7. **Failure/data preservation:** real compile error/locate/last-good, successful source creation and rejection recovery, cancel/fail import/reload/save, missing-translation fallback. `layout.title` is a discrepancy to reconcile, not reproduce.
8. **Real input environments:** keyboard-only task, focus/screen-reader, touch/pen/IME and permissions. These remain explicit environment evidence limitations; viewport resizing is not substitute evidence.

All additional writes in revisions 2–4 are confined to this external note and `design/INTERACTION_COVERAGE.json`. The rewrite repository remained read-only.

## LIVE-003 final reconciliation — revision 3

Sources: [LIVE-003](live-observations-003.md) and [experimental-controls-observation.json](experimental-controls-observation.json). The latter retains its original evidence ID `LIVE-002-EXPERIMENTAL`; LIVE-003 O03-01 records the detailed inspection. The prior availability gap is closed. Its data is **current controls plus UI-advertised descriptions**, not independent factory-default or effect validation.

No new UX entries were needed. Existing entries now carry the following bounded evidence:

| Case | Direct evidence and owner entries | Explicit boundary |
|---|---|---|
| **O03-01 — settings** | 29 experimental settings and two numeric duration controls inspected; Reset defaults disabled. UX-MENUS-006 plus explicit control-to-component mapping for existing shell/Canvas/node/field/menu owners | **UI-indicated default, medium confidence; not fresh-profile verified.** Each conditional required/optional variant remains distinct from its underlying capability. Preferences applying immediately/browser-only persistence are advertised, not tested. Two displayed duration defaults/ranges are help/attribute claims, not gesture timing measurements |
| **O03-02 — remote takeover** | Remote Preview showed Taken over by another page and a Connect/take-control recovery entry. UX-PREVIEW-001 | Inspected runtime state only. No reclaim or interference with another page, no full two-client arbitration proof. Help's no-auto-reclaim/release semantics remain advertised. This remote Viewer state is separate from the temporary shader Preview node |
| **O03-03 — numeric attempt** | Scale 5; number/step-any/empty HTML min/max inspected. Tool drag left both node and Inspector at 5. UX-FIELDS-001/002/003 | **Numeric dragging is still unvalidated.** Record an attempted action with no successful functional validation, not a product bug. Empty HTML min/max does not rule out application constraints. Modifier/ladder/help claims remain advertised |
| **O03-04 — custom-parameter window** | Customize Parameters opened on the current Host target, Roughness selected, window closed without edits. Geometry/nonmodal attribute/move cursor/resize affordances inspected. UX-SOURCES-003, UX-PANELS-003, UX-I18N-003 | No move/resize, field commit, page/reorder mutation, Host Undo or persistence. Distinct visible Range Min/Max versus Minimum/Maximum and Clamp flags establish the **Host configuration surface**, not equivalent behavior of generic Node widgets. `action.close`/`controls.page` untranslated accessible names are polish discrepancies, not requirements |
| **O03-05 — export task** | Export dialog opened/closed; geometry/style and PNG download/JSON download/JSON TD-folder actions inspected. UX-SHELL-004, UX-MENUS-001 | **No download or project write occurred.** Embedded data/full Shader/Subgraph/resource-reference claims remain advertised. Missing aria-modal alone establishes neither modality nor lack of focus trapping. Legacy output format is not the new product's canonical `grape.document 2.0` |

At revision 3 the tracker preserved **65 entries / 12 components**, with no additional entries this revision. LIVE-003 adds **15 component-evidence mappings**: two observed transition mappings (window/dialog open-close), eight inspected current-state mappings, four advertised-only mappings and one unsuccessful attempt without functional validation. Together LIVE-002/LIVE-003 provide 57 mappings; these are not independent tests. 45 entries now contain an observed claim of some bounded kind. **All 65 broad planned sequences remain unverified, with zero full-sequence PASS.**

All 29 experimental controls and two duration controls are mapped to existing UX owners through `experimentalControlMapping`. Current values are available to the implementer without forcing one entry per toggle. Their source labels/IDs describe observed settings, not newly designed APIs. In particular:

- Hiding a collapse triangle does not remove collapse/expand capability.
- Hiding an edit toolbar/background does not remove commands or define their permanent placement.
- Disabling trash drag is an interaction-variant choice; it does not make deletion optional.
- A selected policy such as spatial arrows, Link-arrow visibility, no view movement or selection-toolbar mode is reference composition unless its effect is independently required.
- Medium-confidence UI default indication is recorded rather than flattened to either “verified factory default” or “no evidence.”

The highest-value gaps listed above remain. O03 adds useful distinctions but does not close numeric gesture performance, saved layout, nested target behavior, real device/focus interaction or full lifecycle/protocol verification. The newly inspected configuration/export overlays also need direct focus/background-interaction/close-with-draft/commit evidence before their interaction model can be declared qualified.

No browser/TD operation or product-source reading was performed by this reconciliation agent. Only the two assigned external files were updated.

## LIVE-004 final evidence batch — revision 4

Sources: [LIVE-004](live-observations-004.md), [rendered source badge tokens](source-tags.tokens.json). Same authorized disposable graph, 1280×720, dark/Cool/standard. No new UX IDs were added. Contextual controls are evidence of available capability entry points; they do not freeze toolbar placement.

| Case | Bounded actual evidence and mapped owners | Not established |
|---|---|---|
| **O04-01 — collapse/expand** | Grounded visible Voronoi title selection after Home; Collapse selected nodes made a collapsed selected card without individual ports; action changed to Expand; Expand restored node. UX-NODE-003/005; geometry sample UX-NODE-001 | Earlier offscreen attempt is excluded as success evidence. 24.308 screen-px height at ~57% Canvas zoom is not logical height/minimum hit target. No model serialization diff, component expansion or optional Overview thresholds |
| **O04-02 — wire actions** | Clicking world→Vector wire opened Connection quick actions. Link applied dashed presentation; Wire restored it; same from/to attributes remained. Select destination selected Voronoi and returned its selection toolbar. UX-CANVAS-007/001 | No Disconnect/source toolbar click, cancel, broad hit-area priority or exact frame-animation timing. Inspector source-name selection is separate O02-03 evidence. This observes presentation variants on the same endpoints, not a second graph relationship |
| **O04-03 — creator/filter** | Canvas Tab opened Create node; inspected Source/type/category/results/detail areas. Empty All types and vec3 queries put Preview first. Fresnel+vec3 showed relevant Editor · Subgraph results with signature/help. Closed without adding. UX-MENUS-003/002 | No creator insertion/placement/keyboard traversal or hidden ranking algorithm qualification. Sidebar add from O02 does not silently validate this distinct creation path |
| **O04-04 — sources** | Expanded Custom Uniforms→Values; source identity, Add reference/actions, type and current controls visible. Color fields/swatch/component affordance inspected; rendered count-badge type/family tags measured. UX-SOURCES-001/002 and UX-FIELDS-005 | No source value change, Add reference, component expansion, count mutation or default/live authority behavior. TD-supplied-value help is legacy advertised runtime wording. Tag colors identify source categories, not port data types |

Source pseudo-node simplification remains an **owner-undecided presentation choice**; identifiable sources and discoverable tags are preferred references. Do not resolve that presentation choice merely because current source entries resemble nodes.

Final tracker totals at revision 4:

| Item | Count / state |
|---|---|
| UX entries / component groups | **65 / 12** |
| Entries containing an observed claim | **47** (bounded state/transition/attempt, not complete acceptance) |
| Entries containing advertised claims | **19** |
| Entries carrying accepted contract requirements | **48** |
| LIVE-002 mapped records | **42** |
| LIVE-003 mapped records | **15** |
| LIVE-004 mapped records | **11**: seven transition mappings, three inspected-state mappings, one advertised-only mapping |
| Combined mapped records | **68**; the same source case may support several entries, so this is not 68 independent tests |
| Experimental control / duration mappings | **29 / 2**, UI-default indication remains medium-confidence, independently fresh-profile unverified |
| Complete broad sequences verified | **0** |
| Broad required sequences still unverified | **65** |

All **O02-01–10, O03-01–05 and O04-01–04** are mapped with source references. This observer's record stops at the stated batch. No additional browser operation is implied by this reconciliation.

The remaining priority is narrower after this batch: collapse/expand and Wire/Link plus destination navigation have bounded success evidence, but numeric gesture/ladder, invalid/replacement/drag-to-empty connections, saved layouts, nested scoped editing, explicit Preview lifetime, failure preservation and real device/focus evidence remain open. Creator search/filter is now observed; creator insertion/placement remains distinct.

End-state evidence is intentionally limited: English and viewport override restored, no transient Preview node, four test nodes/existing frame left in the disposable graph, remote Material Preview not reclaimed, tab retained. No claim is made that initial graph content or all private preferences were restored.



