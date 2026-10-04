# LIVE-003 — experimental settings, overlays and runtime status

Date: 2026-10-02. Same disposable graph and browser configuration as LIVE-002. Actual UI, DOM read-only measurements; no legacy implementation reading or rewrite repository writes. This is an observation record, not a complete behavior qualification.

## O03-01 — experimental settings

Opened Experimental features. Reset defaults was disabled. Recorded 29 settings plus two numeric duration controls in `experimental-controls-observation.json`; changed none. The dialog says preferences apply immediately and are saved only in this browser. Reset-disabled is evidence of **UI-indicated default** (medium confidence), not fresh-profile default verification. Current values and settings' descriptions are preserved, not rewritten into a new configuration API.

The important scope distinction: hiding a collapse triangle, toolbar background or trash gesture does not remove collapse, command access or deletion capabilities. See DESIGN_PREMISES for the owner's classification rule.

## O03-02 — runtime preview takeover

The Preview area showed `Taken over by another page` with `Another browser has taken control. Connect again to take control here.` Help explained a shared legacy preview connection, explicit Connect/take-control, stop/release, and no automatic reclaim when returning to a tab or editing a Shader. We did not reclaim the connection or interfere with the other page.

This proves the takeover state and visible recovery entry exist; it does not independently test the complete two-client arbitration protocol. It is unrelated to changing canonical Graph ownership. Also distinguish this **remote view connection** from the temporary **Preview graph node** that overrides shader primary output.

## O03-03 — numeric drag remains unverified

Voronoi Inspector Scale at 5: input type number, step any, HTML min/max empty, bounds x1086.078/y417/w175.922/h24 at this viewport. Tooltip advertises horizontal drag, Ctrl×10, Shift÷10, Ctrl+Shift÷100, middle/Alt-right/long-press Value Ladder, release applies, Escape cancels, right-click presets. A tool drag from (1120,429) to (1180,429) left both node and Inspector value at 5. No product bug is asserted; the tool's gesture path has not established a successful numeric drag. Text entry/Enter and text/Escape were separately observed in LIVE-002.

HTML min/max absence is **not** proof that there are no application-level constraints. Likewise an advertised gesture is not evidence of touch/device performance.

## O03-04 — nonmodal custom-parameter editor

OP Parameter → Customize Parameters opened a window titled Customize Parameters, target `/project1/PBR_MAT_Graph3`. Measured native DIALOG element, aria-modal=false, position fixed, x420/y90/w440/h540. Header cursor was move. Resize affordances were visible in the screenshot. **Movement and resizing have not yet been directly exercised.** This is distinct from the Canvas-contained floating Inspector.

It showed Pages and Parameters lists, New page, Remove empty page disabled for the nonempty page, Rename Page, reorder handles, Remove control, dedicated Undo/Redo initially disabled. Help invited dragging Uniform, Spec Constant or 2D Sampler from Sources; Samplers create TOP path controls. Opening the window does not establish that any of those mutations have been tested.

Selecting Roughness displayed:

| Field | Visible value/state |
|---|---|
| Parameter identity | Uroughness (read-only status) |
| Label | Roughness (textbox) |
| Style / Size | Float / 1 (read-only status) |
| Default | 1 |
| Range Min / Range Max | 0 / 1 |
| Minimum / Maximum | 0 / 1 |
| Clamp Min / Clamp Max | unchecked / unchecked |

No field was changed. Closed via the window close button. Thus **range versus limit/clamp configuration already exists in this Host custom-parameter surface**; this does not prove equivalent generic Node numeric Widget behavior. Commit timing, Host history, page/reorder persistence and close-with-draft behavior remain unverified. Accessible names `action.close` and `controls.page` appeared untranslated; visible close icon/Page placeholder were present. Record as polish candidates, not deliberate design requirements.

## O03-05 — export task dialog

Export graph opened `Export Shader graph`, centered at x410/y171.609/w460/h376.781; native DIALOG, computed background #1d1b26, radius10px. aria-modal was absent; native modal behavior/focus trapping was **not** inferred merely from that attribute. Owner describes this as the export popup/modal class; focus/inertness needs a direct sequence before it is counted as tested.

Visible context: Pixel. Help states the image shows all nodes at this graph level, embedded data contains the full Shader including Subgraphs, Import restores it, and external TOP textures remain references. Actions:

- PNG · Download diagram with graph data
- JSON · Download graph data
- JSON · Save to TD project folder
- Close

Opened and closed only; no file was exported and no project-folder write occurred. Do not confuse legacy target format/TD filesystem access with the rewrite's canonical grape.document 2.0 or portable persistence capability.

## Design implications, not added architecture

Record each overlay's target, scope, placement constraints, background interaction, focus, draft/commit, close/cancel, state retention and failure behavior independently. Canvas float, tool/configuration window, export task dialog and Toolbar Panel can share Widget/Style vocabulary without becoming one authority or one lifetime. Selection quickbars are contextual action entries, not the same concept as a Toolbar Panel. The exact composition remains a reference except where the owner or accepted contract requires a UX effect.
