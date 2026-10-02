# S02 checkpoint contract map — IH-005

This is an implementation checkpoint, **unreviewed, not Human accepted, and not Slice completion evidence**. S02 remains active. S01 remains completed and accepted. No later Slice is authorized. Frozen `handoff/` and accepted S01 evidence are unchanged.

## Baseline and authority

The accepted starting `main` was `365eef3e3240a25b18eb46cb637774596336228d`. Remote `work` at `d44cb8ebc1d00d4a46bb4b08b93b00a6b455e83f` was its ancestor with zero unique commits. Local `work` was also an ancestor. A fast-forward and ordinary push synchronized remote `work` to that exact accepted SHA; `git ls-remote` verified both branches before S02 activation. No reset, force-push, proxy change, or merge was used.

Authority: `handoff/02_ARCHITECTURE_SPEC.md` §§3,6; `05_DATA_AND_LIFECYCLE.md` §2; `08_IMPLEMENTATION_PLAN.md` S02; `09_ACCEPTANCE_AND_CONFORMANCE.md` AT-S02-01…04; `10_KNOWN_GATES.md`; `11_LEGACY_COMPATIBILITY.md`; `13_PRODUCTION_CONTRACT_SURFACE.md`; `14_DOCUMENT_FORMAT.md`; `data/slices.json`; `compatibility/capabilities.json` and `behavior-contracts.md`. WS16/WS17 and DF/DW qualification cases were read as behavioral oracles, not copied as production implementation.

## Acceptance families

| Family | Implemented and exercised | Qualification limit |
| --- | --- | --- |
| AT-S02-01 | Immutable detached inspection, valid/rejected/blocked/repairable/foreign/recovery-readonly results; original bytes; duplicate IDs/keys; unknown structure; explicit position proposal; cancel and late-read cancellation; base load/revision/content and readonly/busy fences; one Graph replacement and Undo/Redo; same Graph/Context identity; exact target pins/kind checked again by Draft. | Repair is restricted to malformed current-format node position → `[48,96]`; no guessed edges/IDs/references or automatic version upgrade. |
| AT-S02-02 | Exact missing definitions preserve state, ports/policies, references, resources, names, positions and inert extensions. Explicit new-session load permits saveable errors; generation is blocked. Move/rename/save/reopen verified in Chromium. Registering the exact module and reloading invokes its codec; same-name later version does not substitute; an already opened Graph's DefinitionSet stays fixed. | Exact restoration is a model/application integration test. The browser bootstrap has its declared built-in modules; this Slice does not add a module installer. |
| AT-S02-03 | Foreign/unmapped inputs retain raw data and expose `IMPORT_CONVERTER_REQUIRED` and `G-VERSION-COMPAT`, with source provenance. | **NOT DELIVERED / BLOCKED** for approved legacy conversion and generated-output compatibility. No approved revision→pin mappings exist in this repository. Negative boundary tests do not pass this acceptance family. |
| AT-S02-04 | Shared UTF-8 byte limits for text/PNG intake; ASCII/CJK/non-BMP exact-limit and over-limit cases; PNG signature/order/CRC/metadata/compression/duplicate/trailing/chunk limits; original bytes; browser Canvas PNG preview/download/reimport. | Desktop Chromium only. No claim about Legacy's escaped compiler-character budget, Host/paste ingress, physical devices, Safari, nested authoring, or legacy golden equivalence. |

## Capability scope

| IDs | Checkpoint behavior / remaining branch |
| --- | --- |
| LC-DATA-002–004, 008–009 | Detached report, explicit repair, raw recovery, cancellation, replacement guards and one Undo. Original preview is bounded to 12000 characters; download is not truncated. Host saved-state protection remains outside this Host-free checkpoint. |
| LC-DATA-006–007 | Browser PNG preview of the first displayed root Canvas, full canonical document embedded; strict portable PNG parsing. PNG is a transport wrapper, not a new canonical graph format. |
| LC-DATA-011–013 | Review/accept guards and inert opaque/archive preservation are present. Legacy snapshot comparison and version upgrade candidates are not delivered without approved mappings. |
| LC-DATA-052–053 | Legacy Texture split and TOP-source normalization are **not delivered**. They depend on legacy formats/modules and reviewable mappings absent from this accepted implementation baseline. No replacement or compatibility claim is made for these branches. |
| LC-DATA-056, 059 | Deterministic intake, finite JSON, exact version integers, duplicates and malformed input rejection. No Host envelope/revision adapter is claimed. |
| LC-NODE-365–366 | Existing S01 portable generation plus Graph diagnostics and explicit declared-reference validation. No expanded shader catalog, native source-map parser, GPU or Host qualification. |
| LC-NODE-370 | Exact module preservation and source identity reporting. Legacy known-UUID/unknown-revision compile-success policy remains gated. No Registry fallback. |

## Public boundaries

- `inspectDocument` owns immutable report data only. It instantiates a detached validation Graph with an isolated inspection identity; it has no destination Graph handle.
- `EditorApplication.inspectText` binds that report object to the destination snapshot. Forged, closed, stale, readonly or busy requests cannot publish. `acceptReview` dispatches one `Graph.change`; `Draft.replaceDocument` requires the same ordered exact pins and GraphKind, retains destination Graph ID, validates all model errors, and skips interface-edit reconciliation so imported data is not silently normalized.
- A missing-module/error-bearing document cannot pass import acceptance. `openReviewed` is the separately labeled **Open in new session** action: it rechecks the review base, loads preserved data with fresh exact definitions, starts a new load lifetime and empty History. The UI requires the existing discard confirmation if needed. S01 ACK-backed reopen semantics remain intact.
- Contexts survive import; if their old Stage instance disappears, they route to the corresponding slot and advance navigation before observers see the new Graph. Selection is pruned. Ordinary load continues to dispose old Contexts.
- Graph validates explicit active node/resource reference descriptors, resolving node IDs only within the stated/current network. Unknown references produce errors; strings inside opaque data are never searched or rewritten. Loss/recovery data remains inactive.
- No upgrade converter is registered. The review exposes source format/version/Graph ID, exact candidate pins, diagnostics, explicit before/after repairs and raw source. The position repair is not claimed as a version conversion.

## Resource and PNG contract

Intake uses the S02 capability budget: at most **512000 UTF-8 bytes** of JSON, nesting bounded by the existing codec, at most **256 nodes / 1024 edges per network**. These are documented production intake budgets, not a new format identity or eternal support promise. All current-format file and saved-text reads share `readDocument`; PNG extracts text into the same path. Pretty output falls back to compact serialization near the intake boundary. Both paths check the actual emitted UTF-8 bytes; the writer also enforces the same per-network limits as the reader. A failed save returns DOCUMENT_SIZE or NETWORK_SIZE before storage acknowledgement, preserving current edits and the previous saved content. Dirty state compares canonical content with the last acknowledged snapshot independently of serialization limits. No data is truncated.

PNG uses the documented uncompressed UTF-8 `iTXt` keyword `TD-Sgrape`, metadata `format: td-sgrape.graph-png`, `version: 1`, with `graph` carrying the complete `grape.document` 2.0 object. Optional `view` is inert wrapper context and does not own Graph state. No legacy Graph conversion is inferred from this wrapper. Limits: **16 MiB PNG**, **512000+8192 metadata bytes**, **65536 chunks**. CRC and critical ordering are checked without inflating IDAT or compressed text. Owned compressed/alternate-text metadata, duplicate owned chunks, unknown metadata envelope fields, malformed UTF-8 and trailing bytes receive named rejection. Rewrapping replaces the owned chunk and retains other legal chunks.

The export adapter uses measured node boxes and the captured document, bounded to 4096×4096, scale ≤1.5, with a 104px footer and at least a 640×240 content basis. Preview cancellation fences late encoder replies. Download does not acknowledge durable save. The image is a readable projection; its embedded graph is the complete source of reimported authored data.

## Gates and decisions

No new architecture/product/compatibility decision was made. DEC-GRAPE-001 remains inherited. No Gate decision or accepted S02 evidence was added.

**G-VERSION-COMPAT remains unresolved.** `handoff/10_KNOWN_GATES.md:705` requires a per-case success/rejection oracle, conversion and provenance before dependent legacy implementation. The frozen independent reviews explicitly permit current-format work separately (`provenance/final-independent-review-IH-003/HANDOFF_FINAL_INDEPENDENT_REVIEW.md`, S02 row). This checkpoint does not cancel Legacy's known-UUID/unknown-revision success behavior or replace it with a new rejection policy. The unavailable-converter boundary is an implementation limitation, not a compatibility verdict. The Fresh Independent Review of PR #2 resolved the scope question as Classification A, as reported by the Human Owner: this legacy branch may remain explicitly NOT DELIVERED for bounded S02 acceptance. No Human Gate is required for that scope question. No mappings, converter policy or legacy compatibility success are inferred. S02 is still active and unaccepted, pending targeted technical re-review of M1/M2 before any Human acceptance.

G-LU-NODE-006 / G-LU-AUDIT-003 legacy golden differences, G-LU-DATA-001/002/004 residual environments and G-HANDOFF-CQ-OWNERSHIP remain inherited. New Chromium/portable evidence does not close those Gates. No S03+, Personal exchange, Mixed History, Host Reload Applied or public format-stability promise is included.

## PR #2 technical repairs

The previous Fresh Independent Review returned FAIL / NOT_ELIGIBLE_FOR_HUMAN_ACCEPTANCE for M1 (save/reopen resource-limit mismatch) and M2 (incomplete replacement validation). New evidence is under `production/evidence/s02-repair/`; the original checkpoint remains historical.

M1 tests exercise boundary-sized missing-module documents in ASCII/CJK/non-BMP, compact serialization, node/edge count limits and rejected-save ACK isolation. A real Chromium case checks the previous IndexedDB record, visible Unsaved status, unchanged revision after rejection, and subsequent valid save/reopen with opaque state retained.

M2 moves the existing canonical structural rules into a pure SDK contract shared by intake, writer and model. Draft validates the incoming envelope before staging, and Graph validates the final replacement before semantic validation/publication. No model dependency on persistence or UI is introduced. Invalid positions, duplicate recovery identities and unknown structural fields reject atomically; caught failures poison the batch. Exact definitions, kind, load/revision/base checks and one-operation replacement History remain enforced.
