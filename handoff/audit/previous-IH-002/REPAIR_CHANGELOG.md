# IH-002 Handoff Repair

Status: **READY FOR INDEPENDENT RE-REVIEW**, never self-certified HANDOFF PASS. No S01 or production implementation is authorized by this repair.

## Accepted independent findings

The unchanged [independent review](../provenance/independent-review-IH-001/HANDOFF_INDEPENDENT_REVIEW.md) and [owner brief](../provenance/independent-review-IH-001/OWNER_REVIEW_BRIEF.md) are evidence of IH-001 acceptance failure, not instructions to start implementation. All five findings are accepted with their original scope:

| Finding | Repair obligation | Scope boundary |
|---|---|---|
| B01 | A public, type-independent Panel composition contract joining registration, routing, restore and lifetime; canonical example uses that same contract. | Only blocker to the complete extension handoff; not evidence that Graph ownership is wrong. |
| M01 | One scoped logical parameter target for spec, value, connections, projection and write. | Nested Inspector composition; root S01 previously remained possible. |
| N01 | A discoverable locator for unchanged supplemental screenshots. | No rewriting visual evidence or redesigning UI. |
| N02 | State the actual GLSL profile seam and its stopping line. | No arbitrary-language backend promise or new intermediate representation. |
| N03 | One machine-readable current implementation locator outside frozen research. | Initially not started; no fabricated build, slice completion or accepted implementation evidence. |

IH-001 remains immutable. This directory is a new handoff revision; the four research inputs remain AC-002 / IR-001 / CQ-001 / MRDP-001. The new additive executable contracts are a recorded architecture extension, not a silent edit to those baselines. Parent contents and review hashes are recorded in [HANDOFF_REVISION.json](../HANDOFF_REVISION.json).

## Architecture change AC-IH002-01 — Panel composition and Context notification

**Reason / counterexample.** A Selection Summary Panel could be instantiated by the IH-001 teaching host, but joining workspace routing/restore required a second, unspecified integration step. Direct selection/navigation on the sealed Context had no complete subscription contract. A per-Panel refresh callback would repeat that gap.

**Before.** Panel lifecycle invariants and a six-kind workspace probe existed, alongside a separate PanelTemplateHost. The public combination and notification ordering were absent.

**After.** An additive public workspace composition contract defines generic Panel registration, creation, target resolution, continuing notifications, resolver-based restore, retarget, move, close preflight, dispose and placeholders. An observable Context contract supplies model, selection, navigation and disposal events; modules do not infer them from DOM or private fields. The executable implementation is an architecture reference only.

**Unchanged authority.** Graph and History remain their original owners; Context owns selection/navigation; Layout owns placement; Manager owns routing policy; the Tab owns the Panel instance; the Panel owns its private presentation state. A borrowed Context is not destroyed by closing its consumer Panel. Trusted callbacks remain trusted code, not a security sandbox.

**Affected existing invariants.** INV-005 (operation lifetime), INV-008/009 (notification consistency/order), INV-017 (identity and restore), INV-019 (shared model, independent UI). No existing invariant is waived.

**Production applicability.** This defines the public contract the product must implement. It does not require copying the reference classes or shipping the bounded AC-002 workspace probe. Browser mounting, physical layout and real focus/IME/device behavior still require product evidence.

## Architecture change AC-IH002-02 — Scoped parameter projection

**Reason / counterexample.** The old ParameterWidgets projection resolves root node IDs while the editable parameter can address nested occurrences. A renderer that traverses resources to compensate would duplicate ownership and stale-target rules.

**Before.** Root projection and scoped write were separate surfaces; equal node IDs did not establish equal targets.

**After.** One scoped target lease resolves the current Graph/load/Context/Stage/occurrence/node/parameter, captures spec/value/link/type information and supplies projection and guarded writes. UI has no resource traversal branch. Draft submission verifies the same logical target and its editing basis; navigation, disposal, definition replacement and changed interfaces cannot silently redirect it.

**Unchanged authority.** The lease and field text are presentation/editing state, not canonical values. Every successful write still uses Graph/Operation and existing reconciliation/History. Shared-definition occurrences have separate view identities while retaining the established shared model semantics.

**Affected existing invariants.** INV-004 (scoped port identity), INV-010/011 (interfaces and connections), INV-017 (load identity), INV-019 (Context independence), INV-020 (Parameter mutation boundary). No automatic occurrence copy, second Graph or nested-only UI lookup is introduced.

## Documentation-only repairs

N01 adds reading links to the existing screenshot supplement; original JPEGs and screenshot metadata remain evidence rather than new product rules. N02 limits the interchangeable seam to GLSL profile/shell/capability behavior; a different programming language needs a separate proposal. N03 fixes the location and validation of implementation progress without modifying the sealed coverage/acceptance results.

## Validation record

New direct cases, executed counterexamples, failed attempts and repairs, full regression, unchanged parent/source hashes and review questions are recorded in the [final repair report](FINAL_HANDOFF_AUDIT.md) and [actual run](evidence/RUN_HANDOFF.json). The combined result is282 tests passed,0 skipped;40 directly exercise B01/M01/their composition. A passing test run is repair evidence, not independent acceptance.

The fixed-pin case required an explicit extension to the targeting seam: `ScopedTargetService` owns a retained Context over the same Graph and `PanelServices.context(lease)` exposes its effective scope. Treating provider navigation as pin invalidation was rejected because it would weaken fixed-object behavior. Context/Directory notification reentrancy and queued owned cleanup were qualified together; no Graph/History ownership change or global callback sandbox was introduced.

The original37 executable-reference source/contracts/test files and all143 indexed parent files retain exact hashes. The package-only initial regression failure (22→25 classified source expectation) is preserved in evidence/repair-first-regression; no test was removed to obtain a pass. Remaining runtime Gates and independent review are explicit in the final report.
