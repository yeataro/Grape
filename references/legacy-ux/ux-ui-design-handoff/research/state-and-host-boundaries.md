# UX/UI handoff notes: state and Host boundaries

Read-only extraction, 2026-10-02. Source: `C:/Users/user/Dropbox/Codex/Grape/`, accepted IH-005. No source changes, tests, Git operations, TD operations, browser operations, or Legacy source inspection were performed for these notes. This is a design input, not an Architecture Change or a new product decision.

## Authority and reading rule

The root [acceptance record](C:/Users/user/Dropbox/Codex/Grape/HANDOFF_ACCEPTANCE.json) accepts IH-005; frozen review-pending wording is historical. [Implementation state snapshot at initial inspection](C:/Users/user/Dropbox/Codex/Grape/implementation-state.json) was `not-started` when this evidence note was first captured, without authorized/active/completed slices or production evidence. This note does not track subsequent implementation progress; use that repository’s mutable state for current status. Accepted architecture does not mean implemented UI.

Read the architecture → current accepted product decision → acceptance mapping before borrowing Legacy phrasing. In particular, Legacy “save with Host / unapplied browser draft” does not move canonical ownership back to the Host. Legacy LC-UI-100 unified chronology is explicitly deferred by DEC-GRAPE-001, not a requirement to reinstate a global Undo coordinator.

Sources used below:

- **L**: [05_DATA_AND_LIFECYCLE.md](C:/Users/user/Dropbox/Codex/Grape/handoff/05_DATA_AND_LIFECYCLE.md).
- **H**: [06_HOST_INTEGRATION.md](C:/Users/user/Dropbox/Codex/Grape/handoff/06_HOST_INTEGRATION.md).
- **D**: [07_DEPLOYMENT_MODEL.md](C:/Users/user/Dropbox/Codex/Grape/handoff/07_DEPLOYMENT_MODEL.md).
- **A**: [09_ACCEPTANCE_AND_CONFORMANCE.md](C:/Users/user/Dropbox/Codex/Grape/handoff/09_ACCEPTANCE_AND_CONFORMANCE.md), individual AT IDs below.
- **CI**: [capabilities.json](C:/Users/user/Dropbox/Codex/Grape/handoff/compatibility/capabilities.json), lookup `capabilities[].id`. Legacy behavior evidence, not canonical state authority.
- **AI**: [acceptance-index.json](C:/Users/user/Dropbox/Codex/Grape/handoff/data/acceptance-index.json), lookup `entries[].capabilityId`; **CM**: [capability-coverage.json](C:/Users/user/Dropbox/Codex/Grape/handoff/data/capability-coverage.json), same lookup. Production acceptance is not executed; a `Covered` architecture disposition does not promise a shipped feature.

## 1. Distinctions the visual design must preserve

The “screen implication” column identifies required information/interaction distinctions. It does not prescribe literal button names, colors, permanent screen placement, or a new component hierarchy.

| Boundary | Required observable distinction | Concrete screen/state implication | Evidence |
|---|---|---|---|
| Canonical document vs Host artifact | Grape owns the current authored graph, including saveable invalid state; Host may continue its last successfully applied shader. | A visible old preview cannot imply that the current graph succeeded. Show current document validity separately from the executed result/basis. | L §§2/4; H lines 5–11, 31–44; CI LC-HOST-015, LC-UI-076; A AT-S08-01/02 |
| Local input default vs connection | An input can retain a local value while a valid Edge supplies its effective value. | A linked field must identify the actual source; its stored default must not look like a second active value. Source navigation and Disconnect are separate actions. | [01_PRODUCT_MODEL](C:/Users/user/Dropbox/Codex/Grape/handoff/01_PRODUCT_MODEL.md:27); CI LC-UI-045 |
| Graph source default vs Host live value | Defaults are authored data; current values/driver/readability/writability come from the Host. | Inspector/source UI must identify which value is being edited. Unreadable is not zero/default. A stale last value cannot masquerade as current. | H lines 9, 34, 50–54; CI LC-DATA-016, LC-HOST-036; A AT-S09-01 |
| Native control definition vs native value | Page/label/order/range/default changes and current input changes have different permissions and histories. | “Cannot edit this page's structure” must not automatically disable a separately writable value. Show unsupported/externally driven states without pretending the UI can take control. | H lines 50–56; CI LC-HOST-047/050/051/054; A AT-S09-02 |
| Field text draft vs committed model | Partial number text, parse errors, IME and conflicting draft tokens are local editing state. | Keep invalid draft text and its reason available for correction; do not silently submit on Save, target switch, or destructive action. Commit failure must not write a neighboring field. | L lines 28–40, 46–48, 118; A AT-S01-04; CI LC-UI-070/101 |
| Document dirty vs save in flight | Save ACK confirms only the captured content, even if the graph was edited while saving. | Saving A → edit B → ACK A must still show B as unsaved. Save failure and busy are distinguishable from success. | L lines 46–49; A AT-S01-07 |
| Export/download vs durable Save | Export captures the published model, not unfinished field text. Download initiation is not confirmed durable storage. | Do not clear unsaved indication after Download or show it as “saved successfully.” Keep an explicit difference between copying/exporting and confirmed persistence. | L lines 46–48; D line 31; A AT-S01-05/07 |
| Generation vs publication | A generated artifact is neither a saved document nor a Host receipt. | GLSL inspection/generation success must not turn Host Apply status green. Apply can be pending/retained/rejected/superseded/indeterminate independently. | [02_ARCHITECTURE_SPEC](C:/Users/user/Dropbox/Codex/Grape/handoff/02_ARCHITECTURE_SPEC.md:75); H lines 29–44 |
| Observation vs authority | Readback and visible controls do not grant write permission. | Viewing a target can work while editing/native operations are unavailable. Permission/driver explanation must remain attached to the relevant action. | H lines 17–25, 50–56; A conformance Host authority |
| Layout/view state vs authored graph appearance | Selection/zoom/tab/Panel size are view state; node positions, frames, notes and other authored annotations belong to the document. | Moving a Panel and moving a Node are not equivalent “layout changes”: the former must not dirty Graph or enter Graph Undo; the latter must survive graph save/reload. | L lines 40, 95–120; [14_DOCUMENT_FORMAT](C:/Users/user/Dropbox/Codex/Grape/handoff/14_DOCUMENT_FORMAT.md), authored visual data table |

## 2. Publication and connection states are not one success boolean

Provide representable states for this flow: editable document → captured generation → preparing candidate (previous Host result retained) → receipt/readback. These are state requirements, not a mandated wizard.

| Result/state | Meaning visible to a user | Interaction consequence |
|---|---|---|
| `applied` | The identified request reached a confirmed Host commit. | It confirms that artifact/document basis only, not newer work or canonical storage. |
| `retained` / `rejected` | Candidate failed or admission failed; previous confirmable result is retained. | Keep editing available and expose the relevant failure; do not claim new output is running. |
| `superseded` | A later intent replaced this request. | A late success/error must not overwrite status of the newer intent. |
| `indeterminate` | An operation may have committed; result is not known. | Related writes wait for readback/recovery. Timeout must not be displayed as proof that nothing happened; retry cannot silently issue a second Pulse/delete/window action. |
| Disconnected/stale | Document remains available; Host's last-good may still be running. | Retain but mark old observation stale; offline Host must not disable local save/generation. |
| Reconnected/new instance | Matching address/path is insufficient evidence of the old target. | Re-establish target/capabilities/authority and readback before new writes. Do not silently reconnect a different instance. |

Evidence: H lines 17–25, 31–46, 56–66; L lines 81–101. Acceptance: AT-S07/AT-S08, especially AT-S08-01; CI LC-HOST-013/014/015/062. The design may use persistent status, badges or detail views, but cannot collapse “saved”, “generated”, “applied” and “observed current” into one checkmark.

Preview and live control of an existing authorized Target do **not** require a prior Apply from this editor. A missing publication capability is not evidence that all Preview/live actions are forbidden. Preview candidate connection does not disturb the current session before handoff succeeds. MAT/TOP Viewer parameters belong to the selected Viewer; they are not Graph defaults. Source change may Home; resizing the viewer must not reset the user's camera. Hidden/stopped/switched Preview releases pressed input; a late frame/release cannot affect a different session. Sources: H lines 60–66; CI LC-HOST-024/025/027/028/029; A AT-S10-01–04.

## 3. Undo: preserve explicit editing domains

Current accepted behavior is **domain-separated**, not global-most-recent. DEC-GRAPE-001 already supplies the owner decision; no new decision is needed to represent it.

- Graph Undo restores canonical authored data immediately. If an active Binding can propagate it, that is a new conditional Host write. Conflict leaves the Graph Undo committed and Host external value intact; UI must be able to show that divergence.
- Host live/value and native-definition Undo operate only on their owned eligible records, with their own receipts. They do not mutate Graph defaults, Graph dirty state or Graph Undo/Redo.
- Local uncommitted text/IME uses local draft editing semantics. Empty/ineligible history in the focused domain does not search another domain for an action.
- High-frequency Host animation/script/driver observations update readback only; they do not fill Graph History or invalidate Graph Redo.
- A multi-batch slider/pointer gesture can be one Graph Undo entry. Cancel compensates its own operation. A Host cancel/Undo cannot overwrite an external change merely because the visible value happens to be equal again.

**Design check:** A mock Ctrl+Z interaction must name the editing domain and show eligible/busy/conflict/no-op behavior. No mockup should promise an ordered combined Graph/native timeline. Pending Host Undo should not falsely make an already completed Graph Undo appear uncommitted.

Evidence: L lines 28–38, 83–85; H line 11; A AT-DEC-GRAPE-001-01–10. AI/CM entry LC-UI-100 retains original qualification `Partial` but effective production disposition `DEFERRED_BY_PRODUCT_DECISION`. G-MIXED-HISTORY is deferred; G-LU-UI-009 stale/lifetime safety is **not** deferred or passed.

## 4. Context, selection, pinning and Panel lifetimes

- Multiple Canvas Contexts can show one Graph with independent selection/primary selection, navigation and camera. Changes to model data appear in both; changing selection need not. Multi-select primary is not simply the first set member. [01_PRODUCT_MODEL](C:/Users/user/Dropbox/Codex/Grape/handoff/01_PRODUCT_MODEL.md:20), CI LC-UI-001, A AT-S01-06.
- Switching Canvas activation must route the correct target to following Inspector/Sources/Help; focusing an Inspector is not a new Canvas activation. A pinned target must not silently follow later Canvas navigation. Missing/stale occurrence is an explicit missing state, not a same-name fallback. [02_ARCHITECTURE_SPEC](C:/Users/user/Dropbox/Codex/Grape/handoff/02_ARCHITECTURE_SPEC.md:116), L lines 108–120, A AT-S06-01.
- Root/nested Inspector uses the same scoped target for spec, value, link state and write. Shared definition occurrences can share model values while keeping distinct navigation leases. A target/type/interface change invalidates a draft token; moving an unrelated node does not. CI LC-UI-042/045; L line 118; A AT-S03-01/04.
- Empty selection, missing definition, lost pinned target, read-only target and unavailable service are different Inspector states. Keep useful readable content in read-only mode; don't invent ports for an unknown definition. CI LC-UI-042; A AT-S02-02.
- Move/hide/remount retains logical Panel/private viewState/Context and Widget field drafts. Unmount cancels an unfinished **Panel pointer gesture**, not every form of editing. Close/retarget with an active originating gesture is guarded; closing a view is not unloading its Graph. L lines 95–128; [17_PANEL_COMMAND_CONTRACT](C:/Users/user/Dropbox/Codex/Grape/handoff/17_PANEL_COMMAND_CONTRACT.md:45).
- Mount/create/restore/update failure gets an owned placeholder and retry path, preserving serializable view state. Retry must not reconstruct/replace the user's Graph. Restoring Layout does not restore old write authority or historical focus. L lines 116–128; A IH-004 direct renderer qualification.

**Concrete design states:** two Canvas selections of the same document; followed Inspector after tab switch; pinned Inspector whose source Canvas navigates elsewhere; pinned target removed; a stale draft after interface change; busy close; hidden Panel reopened with private expansion restored; Panel unavailable/failure/retry. Exact link-group controls or where pinning is exposed are presentation choices constrained by the existing routing contract, not new ownership decisions.

## 5. Load, import, recovery and Reload Applied

| User-visible action | Result that design must communicate | Evidence |
|---|---|---|
| Reopen a document | New model lifetime, retained persistent IDs, empty Graph History; old asynchronous results/handles cannot act on it. | L lines 49, 99; A AT-S01-05 |
| Inspect import candidate | No change to current document/history until explicit valid acceptance; Cancel must also fence delayed results. | L line 50; CI LC-DATA-008/009; A AT-S02-01 |
| Accept reviewed import | One undoable Graph replacement, only while candidate basis is still valid; rejected/stale candidate leaves current content intact. | L line 50; A AT-S02-01 |
| Open missing exact module | Preserve opaque content/interface evidence; represent missing module and blocked generation. Do not silently select a newer/same-name module. | L lines 53–61; A AT-S02-02 |
| Damaged/unsupported file | Protected recovery state with original content available, rather than apparent successful partial load. | CI LC-DATA-004/LC-HOST-018; A AT-S02-01; [14_DOCUMENT_FORMAT](C:/Users/user/Dropbox/Codex/Grape/handoff/14_DOCUMENT_FORMAT.md) recovery policy |
| Reload editor UI | Protect committed work and unfinished fields according to this action's guards; not synonymous with fetching Host-applied graph. | CI LC-UI-070 |
| Reload Applied from Host | Explicit non-undoable confirmation even when clean; Cancel initially focused; unfinished draft/busy guards. Opening confirmation does not itself fetch/change the graph. Accepted successful replacement resets session/history; it is not ordinary undoable import. | CI/CM LC-UI-101; L line 51; A AT-S08-03, AT-DEC-GRAPE-001-10 |

Do not broaden Reload Applied's failure promise to “nothing changed anywhere”: fetch-before-result failure retains graph/history, but session/subscription transitions may already have occurred. Late-stage rollback and legacy restored-draft behavior remain G-LU-UI-008. Exact legacy revision→current pin conversion remains a separate Gate; design can provide review/blocked/recovery states without promising a converter that is not qualified.

## 6. Diagnostics and dynamic interfaces

Model, generation, delivery, runtime, storage and UI faults retain distinct origins. Persistent error content must not be erased by an unrelated success toast. A badge is a projection of diagnostics, not another editable truth. Warning does not block generation; current model Error does, even if the erroneous node is unreachable. Host offline is not a model Error. Sources: [02_ARCHITECTURE_SPEC](C:/Users/user/Dropbox/Codex/Grape/handoff/02_ARCHITECTURE_SPEC.md:96), CI LC-UI-076/091, LC-HOST-017; A AT-S05-01/02.

Dynamic interface changes need three distinguishable outcomes: rejected edit with previous model intact; accepted edit that detaches incompatible links with preserved loss/warning; accepted edit that preserves an invalid link with Error under the declared policy. Detached links do not automatically reconnect merely by switching mode back; Undo restores the original operation. Required missing inputs can add an Error separately. Do not invent a single generic red-flash result for all three. Sources: L lines 34–38; [02_ARCHITECTURE_SPEC](C:/Users/user/Dropbox/Codex/Grape/handoff/02_ARCHITECTURE_SPEC.md:55); A AT-S01-02/03.

Error navigation must locate the current Stage/occurrence/node/code line where available; stale diagnostics cannot jump to a newer same-name object. A code/error detail view and retained-output indication are required behaviors, but the exact arrangement is not dictated here. CI LC-UI-076/091.

## 7. Deployment and device clarity

The same local authoring workflow must make sense with no Host. Static Web does not imply local directory access/LAN discovery; Node hosting does not imply its filesystem/window is the user's device; Electron packaging does not grant unrestricted core/renderer authority. Missing Host, denied clipboard, unavailable native window, offline network and uncached application assets are distinguishable reasons, not one generic “offline” switch. D lines 7–33; CI LC-HOST-001/002/061/062; A AT-S12-01–03.

**Design implication:** action availability and explanation must refer to the actual service, target and device. Preserve local document work when an integration service is unavailable. A Host-specific action cannot silently run on a different computer. Offer readable “no target / unavailable / read-only / stale / busy” states without forcing a Host setup flow before S01 authoring. Capability absence is not permission to redesign the model or to claim all three deployment profiles have identical feature availability.

## 8. Required mockup/state coverage and remaining limits

For design review, cover these combinations rather than only the happy-path desktop screenshot:

1. Host-free valid document; saved A with newer unsaved B; download complete without Save ACK.
2. Current invalid graph while last-good Host preview remains visible.
3. Default vs current live value; linked vs local input; readable but not writable; control definition locked but value writable; component unreadable.
4. Apply pending/retained/rejected/superseded/indeterminate; stale/offline/reconnected target; Graph Undo committed with Host divergence.
5. Two Canvas Contexts, following and pinned Inspector, empty/missing/stale selection, dynamic interface invalidation, guarded close, recoverable Panel placeholder.
6. Ordinary reopen vs review/accept import vs Reload Applied confirmation/cancel/fetch failure; missing module and protected raw-file recovery.
7. Persistent diagnostic with unrelated success feedback; current diagnostic navigation; unavailable per-device service.

These are contract-derived state requirements, not proof that production screens exist. AI entries retain `productionAcceptance: not-executed` (LC-UI-100 is specifically deferred); CM profile records retain real-runtime limits. Relevant unresolved gates include G-LU-UI-008, G-LU-UI-009, G-LU-DATA-003, G-LU-HOST-005, UI/Widget/Panel browser qualification and deployment/TD/GPU qualification. Consult [gates.json](C:/Users/user/Dropbox/Codex/Grape/handoff/data/gates.json) by ID; do not silently convert them to PASS through mockups.

No new owner decision is asserted here. In particular, this extraction does not decide transport, renderer technology, exact captions/icons/colors, a new global History model, automatic overwrite policy, or behavior outside the accepted Gate scope.
