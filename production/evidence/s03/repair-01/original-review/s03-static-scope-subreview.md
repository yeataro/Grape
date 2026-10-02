# S03 static scope subreview

Reviewer task: `/root/s03_fresh_review_01/s03_static_scope`.
Candidate inspected read-only: `C:/Users/user/source/Grape/.verification/s03-review-01`, HEAD `7c6c6ce4e037651054e2203745ef9a4abe19b02e`; implementation I `5a2dec1772735ce259912a0c26a9e3dc8fd2a20a`.
This report is independent technical review input, not acceptance or a Gate decision. No candidate files were changed. Node probes used v25.5.0 with `--experimental-transform-types --input-type=module`, importing production fixtures/API and writing only stdout. Parent reviewer independently reproduced the two counterexamples, including a WebGL2 shader check for the first.

## Findings

### P2: Nested array generation reports success for an invalid profile artifact

`production/src/generation/compiler.ts:103-108` constructs the element type first and appends the outer extent, reversing the dimensions of a nonsquare nested array. Lines 148-151 validate only scalar leaves with the profile. `production/src/modules/image.ts:141` emits GLSL ES 300.

Repro: on `flow()`, create Structure `Nested` with fields `{id:'a',name:'a',type:'array@'+JSON.stringify(['array@'+JSON.stringify(['glsl.float',2]),3])}` and `{id:'b',name:'b',type:'glsl.float'}`. Add its Structure node and Field(b), connect Structure.value -> Field.value and Field.field -> existing Compose.y. `compile(snapshot,fixed,esProfile)` returns `success`, no diagnostics. Its shader contains `float[2][3] f0` and `float[2][3](float[2](0.0,0.0), float[2](0.0,0.0), float[2](0.0,0.0))`: the semantic value has outer length 3, while emitted dimensions are 2 then 3; arrays of arrays also require a profile other than ES 300 or an explicit supported lowering.

In-scope: `handoff/08_IMPLEMENTATION_PLAN.md:171` maps LC-NODE-368; `handoff/data/capability-coverage.json:96332-96338` allows up to eight array dimensions and sets recursive-type boundaries. `handoff/13_PRODUCTION_CONTRACT_SURFACE.md:88` requires profile/type admission before render. `production/evidence/s03/coverage-01.json:725` explicitly claims fixed/nested array validation; line 784 claims nested/nominal generation. S05 catalog exclusions do not remove this implemented S03 Structure path. Correct unsupported-profile rejection is permissible; successful invalid output is not.

### P2: Editing a dependency bypasses the Structure nesting bound

`production/src/model/graph.ts:1382` validates only the edited definition's descendants. `editStructure` calls that at line 1397. Whole-graph validation at lines 936-944 only resolves field types and does not enforce dependent roots' depth.

Repro: create D0 with float field; create D1 through D15 with one field of type `struct@` the preceding definition. Create Leaf with float field. Edit D0's field to `struct@Leaf`. The transaction succeeds with no diagnostics, leaving D15 at depth 17; compiling the ordinary flow also returns success. This must be rejected atomically or otherwise satisfy the accepted explicit rejection rule; an unused dependent does not erase the graph-owned type contract.

Contract: LC-DATA-048 at `handoff/data/capability-coverage.json:8944` rejects depth >16; LC-NODE-368 at line 96338 likewise rejects nesting >16. Coverage line 593 claims depth/expansion validation. Existing direct creation tests only exercise adding a too-deep root, not increasing an already referenced child's depth.

### Scope/evidence gap: native clipboard model branches have no supported deferral binding

`production/evidence/s03/submission-02.json:61` excludes LC-DATA-045/062 TOP/sampler slot integration and native path-string 2048/constructor4096 branches as native integration scope. Both IDs map only to S03 in `handoff/data/slices.json`; neither has a later mapped slice. Their accepted entries classify them Portable and explicitly state they do not require a particular host (`capability-coverage.json:8324-8328`, `11513-11517`). The branch-specific model oracles include TOP-slot source/origin reuse at line 8363, spec constant IDs at 8329, and clipboard path bound versus constructor bound at 11515. These model-level identity/admission tests do not require physical TD execution.

Authorization (`production/evidence/coordinator/s03/authorization.json:10`) requires complete accepted S03 capability/oracle scope, with no shrink. S03's explicit non-goal is Personal format/symbol policy (`08_IMPLEMENTATION_PLAN.md:189-190`), not these clipboard admission rules. Actual native execution/platform qualification may remain residual, but the submitted blanket deferral does not establish delivery or authorized exclusion of these portable model branches. Reconcile the required scope and provide mapped model evidence or a valid exclusion binding; do not infer full S03 PASS from the numeric inline-array 2049 test. This is an unresolved scope/evidence justification issue, not an automatic requirement for real TD integration or a Human Gate.

S05 residuals for LC-NODE-368/369/374's other catalog nodes/provider types are supported by those IDs' joint S03/S05 mapping and `08_IMPLEMENTATION_PLAN.md:245-278`. That valid deferral does not cover the concrete S03 Structure defects above.

## Capability and acceptance mapping inspected

The frozen S03 set contains exactly 24 IDs and coverage-01.json contains all 24, with no extras or missing IDs. The table identifies the examined branch; 'no separate finding' is bounded static inspection, not whole-leaf acceptance or an inference from passing tests.

| IDs | Inspected implementation/evidence branch | Result |
| --- | --- | --- |
| LC-DATA-027 | New vec4 definition, protected boundaries, oversized editable draft | No separate finding |
| LC-DATA-029 | Semantic local fork, ancestor traversal, shared remap, position-only path | No separate finding |
| LC-DATA-030 | Direct independence and ordinary shared dependencies | Parent reviewer separately reproduced mixed-network owned-resource failure; no PASS inferred here |
| LC-DATA-031 | Selection grouping, crossing-edge dedup, sources excluded, whole frames | No separate finding |
| LC-DATA-032 | Stable interface names/defaults, per-caller overrides, composite display | No separate finding |
| LC-DATA-033 | Type/value reshape, loss records and diagnostics | No separate finding |
| LC-DATA-034 | Reorder/removal, per-direction add limit, preserved oversized drafts | No separate finding |
| LC-DATA-035 | Spare port plus first edge in one transaction | No separate finding |
| LC-DATA-036 | Occurrence navigation, breadcrumbs, cycles and context-local state | No separate finding |
| LC-DATA-037 | Shared name versus instance name and no-op fork behavior | No separate finding |
| LC-DATA-043 | Internal-edge selection clipboard and reachable typed closure | No separate finding |
| LC-DATA-044 | Same-load reuse of current resources and placement | No separate finding; nominal-content conflict rule remains explicit |
| LC-DATA-045 | Cross-Graph remap/nominal closure and identity conflict | Native model residual unsupported as stated; see scope gap |
| LC-DATA-046 | Atomic rejection, strict destination validation, resource/History preservation | No separate finding |
| LC-DATA-047 | Declared type token remap rather than arbitrary string scanning | No separate finding |
| LC-DATA-048 | Structure field/count/name/depth/array validation | Dependency edit depth finding |
| LC-DATA-049 | Detached Structure proposal, stable field keys, stale confirmation | No separate finding |
| LC-DATA-050 | Preserved invalid edges and missing-field diagnostics | No separate finding |
| LC-DATA-051 | Structure usage/deletion guards and read-only Help | No separate finding |
| LC-DATA-058 | Source grouping/add/paste admission versus serialized preservation | No separate finding |
| LC-DATA-062 | Same-load source reuse and restricted cross-load source validation | Native model residual unsupported as stated; see scope gap |
| LC-NODE-368 | Generated nominal structures and nested fixed arrays | Array generation and depth findings |
| LC-NODE-369 | Shared dynamic schema reconciliation for Subgraph/Structure | No separate finding |
| LC-NODE-374 | Read-only nested/field generation and invalid-field rejection | Array generation finding |

AT-S03-01 through AT-S03-04 are all mapped in coverage. Inspected corresponding tests and code for two occurrences/Contexts/library COW, all-caller schema updates/Undo, closure transfer/rollback, and stale nested parameters/layout proposals. No independent browser suite was run by this subreviewer; parent reviewer owns fresh suite/environment execution. No whole S03 PASS is recommended while findings and scope gap remain.
