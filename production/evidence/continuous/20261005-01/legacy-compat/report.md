# S02 Legacy compatibility residual scout — source 9357e21

Status: READ_ONLY_DIAGNOSIS_AND_BATCH_INPUTS. This is neither implementation nor Fresh Review, and grants no activation, technical PASS, Human acceptance, publication or Gate closure.

## Binding and result

- Source: 9357e2152f0d1150d31cae7d7c25085af203d288. All product, state and accepted-source observations below use Git blobs at that commit; concurrent B01 changes are excluded.
- Packet: CONTINUOUS-LEGACY-COMPAT-SCOUT-01, 2920 bytes, SHA-256 17d4e129aa83c11b6c90a2ccea458c031b50a1652d44f7b7b4866cf143a408f1. Run GRAPE-CONTINUOUS-20261005-01; checkpoint 9003c00b214ac29cafcb6cc22ac10693ac92a0bf.
- Original Implementer remains sole product/state writer. This scout writes only this report and report.json.
- Finding: the residual is real, but no necessary accepted-contract contradiction was established. The current blockers are missing exact historical input/catalog/oracle data, absent TD-Grape conversion, missing required catalog/profile/resource support for the one fully embedded graph, and uncollected runtime evidence. Classification A is preserved as the historical bounded-acceptance disposition; it is not a new Architecture Change classification.
- No present Human product question is established. Keeping the recorded known-UUID/unknown-revision success intent through an explicit pinned converter is ordinary engineering within the run after its fixture dependencies close. Cancelling that success intent, silently substituting latest, or weakening exact-pin/Graph ownership would require the existing decision procedure.

## What the original Class A record actually establishes

S02 was accepted only at I e23a997f53a17f3e00bf7f83de489cfaeb367251 / R 45c08a5b27beb9c57797975cea8007c35640e16c for AT-S02-01, AT-S02-02 and AT-S02-04 within its recorded environment. AT-S02-03 remains NOT DELIVERED / BLOCKED and G-VERSION-COMPAT remains unresolved. The original checkpoint explicitly says no approved revision-to-pin mappings or conversion/golden oracles existed; this was not a demonstrated impossible converter.

The accepted independent record is owner-reported. It explicitly says originalReviewerReportAttached=false, reviewerIdentity=null and reviewCompletedAt=null. Therefore an exact original reviewer-authored “Class A counterexample” cannot be recovered from that record. M1 (save/read budget mismatch) and M2 (authoritative replacement validation) are the actual named S02 technical findings, closed at the accepted revision; neither is a Legacy semantic contradiction. Do not reconstruct an absent reviewer report or attribute the older IR failures below to that reviewer.

The frozen earlier independent review also classifies G-VERSION-COMPAT as NON-ISSUE for architecture: exact pins and converter boundaries are already defined; the Legacy oracle is incomplete. This supports scoped diagnosis, not Gate closure.

## Recovered immutable counterexamples and exact fixture locators

The machine report includes the exact preserved assertion objects and failure excerpts, with JSON pointers into handoff/compatibility/capabilities.json. These are historical records, not tests executed by this scout.

### Revision/provenance success behavior that must not be replaced by blanket rejection

Historical source locator tests/unit/test_catalog_contract.py, captured in the frozen audit traces:

| Case / historical lines | Preserved assertion / implication |
|---|---|
| known history, 22-32 | hasUnresolved=false; every entry compatible_history; compile_graph(graph)==normal; original graph unchanged. The catalog contract separately asserts 19 history rows, but their actual revisions/mapping records are not included in these traces. |
| unused functions + duplicate local IDs, 34-41 | Provenance includes the unresolved multiply inside its function scope; original graph unchanged. Root ID-only matching is insufficient. |
| unknown revision/archive, 43-52 | color reports unresolved_revision; hasUnresolved=true; original graph unchanged; compiled pixel contains no #error. The graph archive never becomes emitter authority. This is a concrete counterexample to “unknown revision always means compile rejection.” |
| missing/malformed revision or definition, 54-63 | unversioned, unresolved_revision and unresolved_definition are distinct classifications. The assertion capture does not contain every test input literal; do not guess them or conflate null/numeric/missing values. |
| import review, 65-71 | inspect_document status valid despite definitionReview.hasUnresolved; candidate equals graph. A provenance warning alone is not a hard generation error. |
| unsupported emitter/version/duplicate catalog, 73-84 | GraphError; catalog input remains unchanged. This is definition/catalog validation, not permission to reject every unknown document revision. |
| changed historical semantics, 86-89 | Raises GraphError matching Historical behavior. History aliases cannot claim changed semantics equal current emitter. |

The S02 production boundary fixtures are synthetic, not these originals. Unit test lines 316-338 use format=td-sgrape, definitionUuid=known-uuid, revisionHash in [missing, known-but-unmapped, unknown, null, 12], plus inert archive text. The browser fixture uses revisionHash=unmapped. Their expected IMPORT_CONVERTER_REQUIRED/G-VERSION-COMPAT result only proves safe non-delivery, not compatibility.

### Three exact historical failures supporting LU-NODE-006 / LU-AUDIT-003

1. /audits/nodes/testCoverage/executionRecords/12, portable-01.log 270-281, test_sampler_split.py:68, test_legacy_definition_identity_preserved. Filtered catalog digest actual a30f165cef205baecce1493983f3f1a9f0ef1e0279861d57f906e7f5c8ca3153 differs from baseline catalogHash. The retained expected hash is truncated at e2288db6c76b9e07218; the missing suffix must not be invented.
2. /audits/nodes/testCoverage/executionRecords/13, portable-01.log 282-291, test_top_target.py:12, test_mat_compatibility. legacy_single_buffer_result(actual) differs from expected, including vertex/bindings data. The original diff is reported as 3173 characters and is not expanded in this capture.
3. /audits/nodes/testCoverage/executionRecords/14, portable-01.log 292-303, test_type_contract.py:70, test_existing_graphs_produce_identical_results. Actual digest acf40955ffebb7de32e7a8568e64c1aed30f6ae529749dbacca7e26f840cc255 differs from expected 3bd58f070cb320aef028de2a11f08a7725735db2e5a9126c86fd1e36bc8ef824.

They prove historical byte/hash mismatch. They do not decide pixel equivalence, intended product change, a broken new Grape converter, or a core-contract contradiction. Preserve originals and compare shell/metadata, binding identity and real computation separately; do not overwrite goldens to pass.

### Precisely recoverable Legacy graph data, and what is missing

IR sourceCapture identifies TD-Grape 0.8.271 at 2c5eb64d1d47f49bff1abd167545d42f03e5dd27, with declared working-tree deviations; catalogVersion 0.8.259 is explicitly not the entire product version. No external source tree was opened.

A complete parsed successful saved-state result is embedded at /executionEvidence/independentProbes/18/result/state. It has revision=0 and graph.schemaVersion=1, a sampler declaration texture_main/uTexture/sampler2D/source=builtin:banana, and these nodes:

| Scoped node | definitionUuid | revisionHash |
|---|---|---|
| vertex/position | sgrape.builtin.position | a8f6e28939535762aafc51e037a7955e38820196984d2084ae580e2fe57267ca |
| vertex/deform | sgrape.builtin.deform | e1342e453626ff6e68766c387acd0ba91e2cd49350681e893fd5a478fa85fcd2 |
| vertex/projection | sgrape.builtin.to_clip | e98b9a603c583000dc69373c52f7a30d281d9438fd814692cd3c6b1070be5217 |
| vertex/vertex | sgrape.builtin.vertex_out | 146d1926bb6e08237503bfb773d5eaea21d327edcc0f45e41afb6898a0710e76 |
| pixel/color | sgrape.builtin.color | 248cb1f0646af23e93597f4cb941fccd9fdc65cfb36ce816467635766ccddedc |
| pixel/pixel | sgrape.builtin.pixel_out | b37335e4e2462dfa4c0e1cf4c3308f9d64d317ce0d916c5c596a1884a44e4f65 |

The vertex edges are position.out→deform.position→projection.world→vertex.position; pixel color.out→pixel.color. Color value is the parsed array [0.55,0.28,0.9,1]; positions and all edge endpoint pairs are retained in report.json. This is a recorded inspected result, not the original input byte stream and not one of the absent historical golden graphs. Its JSON.stringify(state) UTF-8 digest is c70f01a6ccae6adb0013a6443dce611660d444d49813ec6dfe17f86fd6690c86; this is a new normalized-data locator, never an original raw-file hash.

Adjacent saved-revision probes /16, /17, /19, /20 preserve outcomes for true, -1, 9007199254740991 and 9007199254740992. They establish envelope integer limits only, not compile equivalence.

Missing closure: original raw Legacy document bytes and format wrapper; full catalog contract/history records for the chosen UUIDs/revisions; precise malformed/unknown test inputs; unknown archive payload and unused-function fixture; the three full original baseline inputs/expected outputs, catalogHash and adapters used for their comparison. Historical paths and line numbers are locators, not packaged executable dependencies. The frozen report's assertions cannot reconstruct arbitrary missing input setup. Obtain a narrowly scoped immutable fixture/oracle export or authorized archived data, not an external live source-code dependency. This scout did not access an external Legacy project, TD, Bridge or service.

## Current converter and exact-definition gaps at the fixed source

- readDocument in production/src/persistence/codec.ts returns foreign/IMPORT_CONVERTER_REQUIRED for every non-grape.document format. It reads known 2.0/2.1; unsupported production versions are recovery-readonly, and unknown structural fields are fenced. Writer requires 2.1. No TD-Grape schemaVersion/revision/catalogSnapshot/definitionReview conversion is registered in production/src.
- inspectDocument exposes conversion only none or document-2.0-to-2.1 and legacyGate for foreign input. The only layout proposal repairs malformed current-format positions. document-upgrade.ts validates 2.0 structure and owner-visible network Edge adaptation before an additive 2.1 envelope update. This does not convert Legacy, experimental data, or production 1.0.
- Explicit resource-owner and GraphKind upgrades exist for Grape-owned canonical records (function-networks and Image Output 0.3). They do not resolve TD-Grape definitionUuid/revisionHash or execute an archive.
- tests/browser/legacy-document.ts creates a canonical Grape graph and sets minor=0. production/evidence/s05/repair-02/samples/legacy-owner.grape.json is already grape.document 2.1 with grape.graph-kinds 0.2.0 and older Grape resource owners. Its accepted/reviewed import and replacement behavior is useful regression coverage, not AT-S02-03 Legacy qualification.
- DefinitionSet.node/kind/resource resolve full exact refs from pinned modules. Keep this boundary. The Web composition registers image kinds 0.1/0.2/0.3 and selected modules; no material GraphKind implementation is registered. Current es300 profile is a portable Grape profile, not the historical TD MAT shell/binding oracle.
- Existing color implementation: grape.nodes.fixed-values / 0.1.0 / sha256:0d75d254ae4654e672001bc326252ab9775c87b581b79c15e6e8d44fee59a6ba, typeId=color, fixed glsl.vec4, state.value array, output out. This is a plausible target for the captured connected color node; an explicit semantic mapping with validation is still required, particularly Legacy inputValues/failure semantics. A matching literal alone is not whole-leaf equivalence.
- Existing connected image-output candidate: grape.nodes.image-output / 0.2.0 / sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93, typeId=image-output; grape.graph-kinds 0.2.0 with the same fingerprint, kindId=grape.image. Version 0.1 requires exact vec4; 0.2 retains required input with numeric admission. Version 0.3 sha256:675e4e5aca274cb7de4cd90eca0e3405eec406678e9f4dc90d96c48e422e795f adds zero RGBA default. Do not select 0.3 merely because it is current, nor alter the original output's missing-input semantics silently.
- Existing basic vertex-output accepts vec4, but position/deform/to_clip and historical TD MAT semantics/resources are not supplied by the present registered portable catalog. The whole embedded six-node graph cannot be called converted by dropping its vertex chain or sampler declaration. Disconnected/unused authored data still must survive.

Publication seam to preserve: Application review object + base content/load/revision + readonly/busy guards → Graph.change/Draft.replaceDocument. Graph requires equal ordered module list and GraphKind; it keeps destination graph.id and publishes one History operation. A converted candidate cannot silently replace these fixed definitions. For different pins use the separate explicit new-load route, after adapting its validation to recognize a declared validated conversion: current openReviewed explicitly requires review.read.status=editable, while a Legacy source's original read remains foreign. Do not falsify the source result to pass that guard. One-Undo replacement should be exercised in a deliberately matching exact-definition destination; incompatible destination explains rejection and permits the validated new-session path. Load gets a fresh loadId, empty History and invalidates old contexts/callbacks. This is an application integration change, not evidence that the accepted architecture cannot express conversion.

## Dependency classification

| Gap | Classification / next action | Claim still blocked |
|---|---|---|
| Original Class A report absent | Evidence provenance limit; preserve owner-reported receipt, do not invent original counterexample | Reviewer-authored historical detail beyond recorded receipt |
| catalog history/raw inputs/goldens absent | Immutable fixture/evidence acquisition with exact source and hashes | Specific approved revision mapping and old golden equivalence |
| foreign converter absent | Ordinary S02 implementation after per-case oracle/mapping is fixed | AT-S02-03 product UI conversion |
| TD position/deform/projection/material, Texture/TOP resources absent | Bounded S05 catalog/profile and S02 typed conversion dependencies | Whole six-node MAT fixture; LC-DATA-052/053 |
| native resource bindings/pixels unverified | Integration/evidence dependency in actual required profile | TD/native/GPU equivalence; no portable test substitution |
| unknown revision blanket rejection proposed | Would cancel a recorded success intent; requires Owner decision if pursued | Such a new rejection policy |
| necessary semantics cannot fit Graph/module/converter boundaries | No such concrete counterexample found in this scout; only then preserve minimal case and use AC workflow | Architecture change is not presently justified |

## Minimum fixture closure and proposed bounded follow-up

Recommended order is LC0 → LC1 → LC2, coordinated after the current writer's B01 boundary. These are proposed assignments, not activated batches.

**LC0: immutable fixture/oracle closure, before positive converter claims.** Package data outside handoff with exact Legacy capture provenance, original-byte SHA-256, parsed shape, catalog record/emitter identity, baseline output/bindings and an explicit expected disposition per input. Use the recoverable embedded state only as a named inspected-result fixture, retaining that limitation. The smallest positive product slice should be an original, fully specified image/TOP graph consisting of connected Color RGBA → pixel output with an explicit supported/default vertex policy and no hidden native dependency. That minimal raw graph is not established by the current embedded MAT-like state; do not manufacture it by deleting the vertex/resource data and call it historical. If it is unavailable, the first complete positive slice must instead implement the full six-node captured graph's dependencies, or obtain an independently provenance-bound minimal input/oracle. No Human product choice is needed merely to acquire the missing evidence.

Required matrix before LC1 is called ready:

1. Current captured known UUID/revision success, exact values/ports/defaults/stage semantics; original remains unchanged.
2. One proven compatible historical revision with its real catalog history row, not a fabricated hash; output semantic comparison and provenance.
3. Known UUID + actual unknown revision + archived payload: explicit source warning and successful supported conversion/generation, archive inert; no implicit latest lookup. The conversion names its fixed destination emitter/owner pin and is reviewable.
4. Missing revision, malformed revision, unresolved definition and unsupported catalog/emitter are separate precise fixtures/dispositions. Keep absent values distinguishable from null/numbers. Do not assign an unsupported permanent compatibility policy from synthetic boundary tests.
5. Unused nested function plus duplicate local node IDs with scoped provenance; candidate must preserve unused content or explicitly remain unsupported for that fixture, without claiming the whole leaf.
6. Unknown document structure/future version, duplicate keys/identities, malformed fields, invalid exact owner and invalid values preserve raw bytes and fence editing; opaque archive/owner fields survive without execution.
7. Save/reopen and same-pin replacement Undo/Redo, plus different-pin explicit load; cancelled/stale/reused review, readonly/busy, changed content with the same display IDs, failed save/ACK and stale callback cases preserve model/History/dirty/lifetime boundaries.

**LC1: one original fixture family through public UI → declared conversion review → cancel/accept or explicit new-session load → generation → save/reopen.** Depends on LC0 mapping record and any needed exact catalog owners. Implement a detached converter with source identity/revision, fixed converter version, transformations, losses and per-node scoped provenance. Keep raw input and inactive archive. If durable provenance has reference semantics, use an exact typed Resource/preservation codec with declared references; only truly inert metadata belongs in extensions. Unknown Legacy fields cannot be silently dropped or relabeled optional. Preserve IDs and order where representable; expose deterministic new Stage/network/Edge IDs and endpoint/adaptation mapping. The new envelope must have actual canonical meanings, not renamed format/kind strings. Generator stays readonly; Graph remains sole authored-state owner; no legacyMode branches across core.

Acceptance evidence must bind fixture/raw/catalog/converter/output hashes, I/R/build/profile, browser entry and generation results, exact dispositions and all above negative cases. Different output text is not automatically failure or success: compare semantics and binding/resource identity against the original oracle, explaining shell/symbol-only changes. Portable analytic/WebGL evidence can support the bounded image case; actual TD evidence remains required for TD claims. Independently review the exact candidate in isolation. Do not promote technical readiness to Human acceptance or resolve G-VERSION-COMPAT globally.

**LC2: remaining fixture families as catalog becomes available.** LC-DATA-052 Texture split must preserve sample node ID, UV and outgoing edges, reuse source references, rollback missing declaration and preserve the MAT opaque-black fallback. LC-DATA-053 TOP normalization must preserve input:0 alias sharing, defaults, stable topInputLegacyId/legacyKeys and UV/output, localize affected external functions/callers, and block proposals that lose edges or still fail compilation. These are typed transformation/catalog/native-evidence tasks; do not squeeze them into the minimal Color slice. The three original golden failures remain separate unresolved output-equivalence work.

When the designated maintainer reactivates S02, first preserve the exact previous completed entry in an immutable reactivation receipt and retain all accepted evidence; then move S02 from completed to active under the registered run. Do not create a second state record or rewrite old PASS/FAIL/Classification A. This scout makes no such state change.

## Limits and audit

No tests, builds, installs, browser runs, runtime connections, commits, pushes or external-project inspections were performed. Conclusions are static source/evidence diagnosis at the fixed commit. A read-only metadata enumeration first exceeded Node's default stdout buffer; it made no file changes and was replaced by narrower bounded reads. All source hashes in report.json are calculated from Git blob bytes, not normalized working-tree text. Original inventory report was checked against its pinned committed byte copy. The only newly authored files are report.md and report.json.

STOP_WRITING
