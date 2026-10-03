# AC-GRAPE-002 Optional subgraph function emission contract amendment

**Authority: Human-approved bounded revision under [DEC-GRAPE-003](DEC-GRAPE-003.md). Status: accepted contract amendment; implementation and current-state registration pending; independent technical review and product verification NOT_EXECUTED. No Slice is authorized or assigned.**

This amendment adds a persistent definition-level emission choice and its qualification, mutation and generation behavior. It supplements IH-005 without changing its frozen files or historical acceptance. Existing ownership, exact module identities, source preservation, stage eligibility, snapshot isolation and domain-separated History remain binding. The Owner approved the behavior; SDK names, algorithms and the private payload spelling remain implementation choices within these requirements.

## Existing seam and bounded addition

IH-005 already gives emitters compilation-owned helper registration and deduplication, and propagates constants according to expression provenance. Reusable definitions already derive their allowed Stage set from their contents; each occurrence must satisfy its actual Stage and profile capabilities. Library snapshots already have graph-owned data and a first-semantic-edit fork path. These responsibilities are reused.

The inspected production code at `aea7418232d9144a6aa32764d044960974b78fa4` has no subgraph emission-mode field or function-definition reuse path: `NetworkData` stores the body/interface/dependencies, and `emitNetwork` lowers the body again per occurrence. Production Multiply propagates a constant flag during emission; that does not establish a complete authoring-time constant-impact service. This amendment requires that behavior where necessary; it does not claim it is already delivered.

| Inherited source | Bounded addition or clarification |
|---|---|
| [01 Product model](../handoff/01_PRODUCT_MODEL.md), work/editing; [03 Responsibility table](../handoff/03_RESPONSIBILITY_AND_DEPENDENCY.md) | A subgraph definition carries the authored mode. Graph, module, Application, Generator and UI retain their existing owners and mutation boundaries. |
| [04 Extension model](../handoff/04_EXTENSION_MODEL.md), sections 2 and 6; [13 Production surface](../handoff/13_PRODUCTION_CONTRACT_SURFACE.md), sections 3 and 4 | The subgraph module owns mode semantics and qualification; ordinary Node modules retain their own operation and constant semantics. No core dispatch by concrete node name. |
| [Workspace contracts](../handoff/executable-reference/WORKSPACE_QUALIFICATION_CONTRACTS.md), reusable definitions and Library fork | A definition's saved emission mode applies to all its occurrences. Make Independent and first Library semantic editing retain their established identity and reference behavior. |
| [Compute contracts](../handoff/executable-reference/COMPUTE_QUALIFICATION_CONTRACTS.md), constant provenance and helper identity | Qualification evaluates the function body with ordinary input parameters lacking compile-time-constant value eligibility; emitted helper/function identity must not depend on caller display names. |
| [02 Architecture spec](../handoff/02_ARCHITECTURE_SPEC.md), sections 3, 5, 6 and 7 | Explicit mode-change reconciliation may detach newly constant-invalid downstream edges in one Graph operation, including its History and diagnostics. Generation remains read-only. |
| [14 Document format](../handoff/14_DOCUMENT_FORMAT.md), sections 2, 2c and 4 | Persist the mode in the subgraph owner's versioned Resource payload and preserve it through supported exchange. No new document-envelope field or active Edge opcode is introduced by this amendment. |
| [08 Implementation plan](../handoff/08_IMPLEMENTATION_PLAN.md), S04 and S05; [09 Acceptance](../handoff/09_ACCEPTANCE_AND_CONFORMANCE.md), S03 through S05 | Exchange and emission have distinct responsibility mappings. DEC-GRAPE-003 records the PM sequencing recommendation and the additional acceptance cases; these mappings neither authorize a Slice nor change historical acceptance. |

The [chapter mapping and delivery recommendation](DEC-GRAPE-003.md#章節對應與建議交付順序) is a planning aid, not an additional semantic decision or an issued work packet. It recommends considering payload preservation during S04 and delivering the complete function-mode behavior early in S05. A persistence-only precursor must not expose an operational function-mode switch or claim function-mode exchange conformance before that behavior is available.

## Persistent definition mode

The mode has exactly two meanings: **expand** and **function**. It belongs to the Graph-owned subgraph definition, not to Editor preferences, a generated artifact or an individual call. New definitions default to expand. All occurrences referencing one definition use its mode; Make Independent copies it before subsequent independent edits. This amendment introduces no per-occurrence mode override.

Library/Personal packaging includes the mode with the full definition and dependency closure. Import retains the packaged choice. Editing an imported nonlocal definition's mode uses the existing semantic fork, including affected nonlocal ancestors and reference rewrites, in the same transaction as the mode change. Source Library assets remain unchanged. Existing admission and symbol/resource restrictions still apply to each exchange operation.

Use an updated exact owning module and codec version for the new semantics. A supported explicit upgrade from a known old definition payload supplies expand and preserves the body, interface, dependencies and origin. It must update the relevant exact references through the declared upgrade path, not reinterpret old pins as the new module. In the new payload, mode is required and an unknown or missing mode is invalid; it is not an implicit fallback to expand. An unavailable module preserves opaque data under the existing recovery/generation rules.

Resource data is already an exact-owner payload, so this addition does not itself require a new core document version. DEC-GRAPE-002/AC-GRAPE-001 retain their separate document/Edge version requirements. Implementations must not weaken an existing reader fence or hide mandatory mode semantics in inert extensions. Storage field names and the updated module version are fixed in the authorized implementation's codec contract and evidence, not by inventing a revision in this product decision.

## Qualification at the function boundary

Use the existing node-owned constant-expression rules with a different input boundary. An ordinary formal parameter has no compile-time-constant value eligibility even if a particular caller supplies a literal. Constants authored inside the definition retain eligibility. Type-derived facts, such as a statically sized array's length, are assessed by their existing operation semantics; nonconstant input values do not automatically make every downstream result nonconstant.

Follow declared dependencies and nested definitions with their selected modes. If replacing external input expressions with ordinary function parameters makes an internal `requireConstant` use impossible, explicit activation of function mode fails without publishing a mode change, fork, edge loss or History entry. Report the definition, internal node/port and relevant input dependency. Unsupported types, stages, capabilities and malformed data retain their existing validation rules. Eligibility is not just a port-count or type-name check, and dead-code pruning does not excuse invalid authored content.

This first scope does not specialize a function separately for different caller constants, evaluate arbitrary code on the CPU or rely on later driver inlining to make invalid GLSL legal. A rejected activation leaves expand mode available. The same pure semantic rules inform mode qualification, authoring impact analysis and generation; they must not become incompatible UI and compiler rule sets. This does not mandate a particular analysis API or a full shader compilation on each edit.

An emitted user-function return or out value does not itself establish GLSL constant-expression eligibility at its caller. Subsequent operations may independently produce constant-qualified results where their contracts permit them. Outputs of expanded definitions retain their proven eligibility; merely marking a runtime temporary as constant is insufficient.

## Mode changes and constant-invalid connections

Switching a qualified definition from expand to function is an explicit authored operation. Compute its effects on all occurrences and dependent definitions, including nested and unused definitions, using the same fixed candidate and exact definitions. Propagate changed constant eligibility through intermediate operations to the actual consumers; do not remove every edge immediately leaving the call.

Detach an existing incoming edge at a constant-requiring consumer only when it was constant-valid before this switch and becomes constant-invalid because of it. Preserve the complete edge as typed loss evidence, with its Graph/resource scope, reason and the initiating mode change. Preserve unaffected branches and pre-existing errors. The detach rule is the accepted policy for this specific command, including affected nested consumers; an interface `invalidEdgePolicy: preserve` must not silently substitute a different policy for this command. Other mutations retain their existing detach/preserve rules. New connection admission is not relaxed by this amendment.

The changed definition's own function-boundary qualification is checked before downstream repair. Repair must not delete an internal constant-dependent edge merely to make an otherwise unqualified definition eligible. Losses caused in downstream callers are a separate consequence. Reconcile the resulting candidate under normal authoring rules: retained local/default inputs may become active, required unconnected inputs may leave a saveable error graph, and all resulting diagnostics must reflect the final candidate. Do not manufacture defaults, omit errors or assume detachment guarantees a valid shader. If reconciliation cannot establish a coherent candidate, fail atomically; preserve its diagnostic counterexample rather than publish a partial result.

The mode, any Library fork, reference updates, affected model changes, loss records and diagnostics publish once. Undo/Redo restores that full change. Switching back to expand does not reconnect lost edges. UI receives the completed model change and can query the affected connections and reasons; a new dedicated event type or a specific toast/dialog is not required.

Subsequent ordinary edits can make an already function-mode definition invalid. Preserve the authored mode and error state under existing authoring rules; report the failing location and block generation. Loaded invalid data is likewise preserved under its existing reader rules. Neither path silently chooses expand, performs authoring repair during load/generation or edits a Library source file. An explicit activation check is not a new global requirement that every editable document always be error-free.

## Shared function emission

For each supported immutable generation snapshot, collect functions needed by live calls after inherited full-model validation. Emit one body for each distinct definition implementation and necessary lowering environment within each shader compilation unit, then emit calls with their own arguments. A definition shared through nested calls must not acquire a duplicate body merely because occurrence IDs differ. Stage/profile outputs remain independently complete.

A function's identity must distinguish incompatible bodies, exact dependencies, target/profile semantics and any captured resource/type environment. It must not merge by display name or reuse a symbol with conflicting contents. This does not authorize per-caller constant specialization. The emitter may choose valid return/out representations, but one occurrence must not repeat its computation or side effects simply because multiple outputs are consumed. Separate occurrences are not automatically one shared evaluated value.

Preserve existing stage restrictions, resource bindings, helper dependencies, nominal types, Edge adaptations, statement/effect order and declared numerical behavior. Respect the selected mode of nested definitions. Existing capabilities may supply the mechanism; required shader behavior cannot be bypassed with an unsupported host helper or an implicit fallback. No arbitrary-language backend or universal cross-target node system is added.

Function-body diagnostics identify the shared definition and internal location, with related occurrences where applicable; they must not invent one uniquely responsible caller for a shared body. Invocation diagnostics retain occurrence provenance. A change to mode, body, dependencies or profile invalidates affected generated results under existing snapshot/cache rules. The Generator owns only job-private analysis and generated artifacts; Graph repairs remain Application-authorized transactions.

## Acceptance and adoption

All product outcomes are [AT-DEC-GRAPE-003-01 through 10](DEC-GRAPE-003.md#必要驗收), **REQUIRED_NOT_EXECUTED**. Qualification includes real supported-profile shader compilation and appropriate result checks for the delivered families, as well as persistence and authoring interactions. A smaller source file is evidence of source reduction, not proof of shorter shader compilation or faster GPU execution. No performance threshold or general traversal-cache project is introduced.

The designated maintainer may register DEC-GRAPE-003 as `product-decision` and this record as `architecture-change` with their actual file hashes and attributable Human authority. Their acceptance is semantic authority, not product PASS. An authorized implementation baseline and review packet must bind these exact amendments before adoption. No S03 verdict is rewritten, no S04 packet is amended by this document alone, and no additional Slice is started.

The PM has authored only the external records and navigation/traceability links. Any implementation counterexample that requires changing this behavior returns through the existing decision process; it must not be hidden by silent inlining, dropping preserved options or weakening constant requirements.

Language evidence, checked 2026-10-04: [GLSL 4.60 constant expressions](https://registry.khronos.org/OpenGL/specs/gl/GLSLangSpec.4.60.html#constant-expressions), [array sizes](https://registry.khronos.org/OpenGL/specs/gl/GLSLangSpec.4.60.html#arrays), and [function calling conventions](https://registry.khronos.org/OpenGL/specs/gl/GLSLangSpec.4.60.html#function-calling-conventions). Actual supported profiles still require their own qualification; this reference does not add desktop GLSL support to production.
