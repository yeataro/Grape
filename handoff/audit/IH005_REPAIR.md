# IH-005 — targeted blind-review repair

**READY FOR TARGETED RE-REVIEW is the submission status, not independent acceptance.** No S01 or repository bootstrap bundle was started. Immediate parent IH-004 remains immutable. The independent report is [copied evidence](../provenance/blind-review-IH-004/HANDOFF_FINAL_INDEPENDENT_REVIEW.md), not instructions automatically adopted.

## Disposition

| Finding | Verification and result | Current canonical locator |
|---|---|---|
| IHR4-B01 | Substantive: broad Json plus structural unknown fencing permitted incompatible wire interpretations. Adopted exact versioned records and runtime mapping. | [14](../14_DOCUMENT_FORMAT.md), `contracts/document-format.ts`, DW tests |
| IHR4-M01 | Original coordinator gap was valid for the older scope; subsequent accepted owner decision **DEC-GRAPE-001** removes coordinated chronology from current scope. No coordinator designed. | [decision evidence](../provenance/product-decisions/README.md), 08–12, current data indices |
| Editable Panel command path | Public wording had no matching controlled service. Added optional Panel-instance/current-event command capability with Application execution authority. | [17](../17_PANEL_COMMAND_CONTRACT.md), [example](../examples/editable-panel/README.md), PC tests |
| IHR4-N01 | Current-state instructions still referenced old revision. Operational entry/template/checker/ledger now agree on IH-005. | 00 / START_HERE / 08 / implementation-state / state tests |

## AC-IH005-01 — exact preservation wire semantics

**Before:** Edge adaptation, loss and recovery could be arbitrary Json even though unknown structural fields blocked editing. Independent implementations could save mutually unreadable records while each followed ownership rules.

**After:** `grape.document 2.0`; core-owned `grape.edge-adaptation@1`, `grape.loss@1`, `grape.recovery@1`; exact required fields, operation meanings, tagged inactive preservation payloads, exact module owner/codec identities and recursive validation. A runtime plan maps explicitly into the canonical record. Reference runtime fields do not acquire wire identity by accident. Module validators receive no mutable Graph.

This is a major technical format revision because the existing version policy forbids changing required interpretation under the same version. Old 1.0 is retained read-only pending an explicit reviewed converter. Internal S01 save/reload is 2.0. The separate owner decision about when to promise long-term external format support remains at its existing Gate; it does not block internal S01.

Unknown structural subfields/tag/version → recovery-readonly with original source; malformed known required shape/type → rejected; declared opaque module data or inert namespaced extensions → preserved. Semantic invalidity remains distinct from decoding: editable structure does not authorize generation. Loss/recovery records never reactivate edges or values on load; explicit repair is an ordinary Graph operation.

Affected invariant obligations, **unchanged in meaning**: INV-004/010/011/015/017/021. Exact shape in [14](../14_DOCUMENT_FORMAT.md); mapping and codec responsibility there and in the contract ledger. No ownership moved to Host or Persistence.

## AC-IH005-02 — scoped editable Panel authority

**Before:** PanelServices was described as offering commands, while it only provided read/routing services. An implementer would have to invent editing authority.

**After:** `PanelType.commandIds` requests; Application authorizes; Workspace derives exact Panel instance/target lease/origin; generic renderer binds the current mounted event and exposes optional `PanelMountContext.commands`. A feature submits only an intent and current lease, never arbitrary origin/Graph/Context. Application executes existing command/Operation semantics. Read-only Panels receive no authority. No central feature switch or Graph/History core change.

Unmount ends the pointer-event route and cancels only that unfinished application-owned Panel gesture; completed edits, Panel identity/viewState and Widget field drafts remain. Close/retarget guards run before teardown. Cleanup-triggered model publications must finish routing before the workspace action returns. Mount failure cannot leave an orphan Operation or usable stale lease.

Affected obligations: INV-001/002/003/005/007/008/009/019/020, retained. New declarations are renameable SDK shapes with fixed authority/lifecycle semantics; no new general command framework. Detailed contract: [17](../17_PANEL_COMMAND_CONTRACT.md).

## Product scope, not a replacement architecture

DEC-GRAPE-001 is copied byte-for-byte. G-MIXED-HISTORY, LC-UI-100 and original AT-S09-03 are `DEFERRED_BY_PRODUCT_DECISION`, never PASS/Covered. Frozen CQ source disposition remains Partial. Domain-separated Undo remains required; ten AT-DEC-GRAPE-001 cases are planned **REQUIRED_NOT_EXECUTED**. This repair runs consistency tests of those requirements, not production Undo acceptance.

Graph Undo commits canonical state, then active Binding may attempt a new conditional live write with applicable basis/authority. Conflict does not roll back Graph Undo. Observations (including high-frequency drivers or TD Undo) update runtime state only. Publication is not a default replay workaround. LU-UI-009, receipt/load/epoch/incarnation fences, CAS, indeterminate/readback and LC-UI-101 remain mandatory. S08/S09 no longer require the coordinator.

The empty not-started current-state template remains empty. IH-005 inherits this accepted policy; no fabricated project baseline or completed slice was registered. Historical decision `registration` and old state-patch remain evidence only, explained in their local README.

## Counterexamples encountered, not hidden

1. Initial wire bridge lacked reference-only boundary reconstruction (four PROFILE_BOUNDARY failures). Fixed the bounded adapter using exact fixture kind metadata; never weakened the production record or frozen Graph. Dynamic removed-value preservation explicitly captures prior port metadata rather than guessing missing data.
2. Adversarial nested recovery Node had `direction: ["input"]`; string coercion admitted it. Strict enum type checks and DW13 now reject malformed preserved records.
3. PC13 first failed: hide cancelled an Operation, but workspace had routed before shell cleanup and left an old lease valid. Pending cleanup-induced model/routing updates are now drained before return, including the second Panel observing the same Context. The invariant was retained and implementation corrected.

## Evidence and boundaries

Direct wire cases: DF01–DF17, DW01–DW13. Direct Panel cases: PC01–PC13. Scope/Decision/current-state: PD01–PD09 plus existing locator tests. Full counts, commands and logs are in [IH005_VALIDATION.json](IH005_VALIDATION.json) and [RUN_HANDOFF.json](evidence/RUN_HANDOFF.json). Use the final executed report, not historical counts, to judge results.

The new wire bridge, command executor fixture, fake mount surface and repaired reference workspace are **executable specification, not production foundation**. True TD/native/GPU/browser/IME/device/TOE/TOX evidence stays at existing Gates. No change to IR-001/AC-002/CQ-001/MRDP-001 or their copied protected evidence. All previous frozen revision hashes are separately checked before submission.

For S01 there is no remaining architecture choice that an implementer must invent, and no missing external evidence that blocks its host-free implementation once separately authorized. Implementation engineering choices and future runtime/product Gates remain. This statement is a repairer's review conclusion, **not authorization or final acceptance**.
