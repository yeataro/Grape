# AC-GRAPE-001 Float vector Edge adaptation contract amendment

**Authority: Human-approved bounded contract revision under [DEC-GRAPE-002](DEC-GRAPE-002.md). Status: documented semantic amendment; implementation adoption pending; independent technical review and product verification NOT_EXECUTED.**

The Owner approved the conversion table and the listed versioned persistence, validation, generation, Image Output and acceptance changes. The PM specifies their exact wire representation below within that scope; the Owner did not select the operation spelling or an implementation algorithm. This record is not an implementation submission, a technical PASS or Slice authorization.

This external amendment applies to IH-005 [14 Production document format](../handoff/14_DOCUMENT_FORMAT.md), sections 1, 2a, 2c and 3, only where identified below. IH-005 bytes, its index, its acceptance and historical tests remain unchanged. All other obligations are inherited.

## Demonstrated limitation and required result

At work revision `04834e2d0c11656f9d06a3e9ab82350f6edede33`, TypeEnvironment rejects float vec2 to float vec3/vec4. The v1 Edge codec has no operation representing their fixed fills; its unknown-operation fence cannot be bypassed by changing the UI. Image Output separately requests exact input admission.

Required results are `vec3(v, 0.0)` for vec2 to vec3 and `vec4(v, 0.0, 1.0)` for vec2 to vec4. Existing vec3 to vec4 remains `vec4(v, 1.0)`. The source output stays unchanged. The full float conversion table and receiving-port scope are fixed by DEC-GRAPE-002.

## Versioned wire amendment

The amended writer uses `grape.document` **2.1** (`formatVersion: {major: 2, minor: 1}`). This is the additive document-version increase required by IH-005 section 2c. The current production writer remains 2.0 until an authorized implementation adopts this amendment.

Keep `grape.edge-adaptation` **version 1 immutable**. Introduce **version 2**, using the same six required fields: `schema`, `version`, `sourceType`, `targetType`, `operation`, `extensions`. It preserves the five version-1 operations and their exact meanings, and adds only the following operation:

| Operation | Admitted resolved types | Exact result |
|---|---|---|
| `pad-vector` | `glsl.vec2` to `glsl.vec3` | Preserve x and y, append `0.0`. |
| `pad-vector` | `glsl.vec2` to `glsl.vec4` | Preserve x and y, append `0.0`, then `1.0`. |

`pad-vector` is invalid for every other source/target combination. No bool, integer-vector, matrix, array, struct, arbitrary width, caller-selected fill, semantic label or expression parameter is added. Version 1 does not admit `pad-vector`.

The new record for vec2 to vec4 is:

```json
{
  "schema": "grape.edge-adaptation",
  "version": 2,
  "sourceType": "glsl.vec2",
  "targetType": "glsl.vec4",
  "operation": "pad-vector",
  "extensions": {}
}
```

For vec2 to vec3, only `targetType` changes to `glsl.vec3`. Existing identity, broadcast, take-leading, append-alpha-one and numeric-cast retain their IH-005 meanings. In particular, `append-alpha-one` still means float vec3 to float vec4 only; it cannot be repurposed for vec2.

New plans use version 2 for `pad-vector`; the existing five operations continue to be created as version 1. Version-2 records using an inherited operation are also readable with that operation's unchanged meaning. Serialization preserves a stored, admitted plan's version and operation rather than normalizing it from UI preferences. Validation must dispatch by supported codec version and operation meaning, not compare a loaded record blindly to the default version of a newly created plan.

The document 2.1 envelope permits both supported Edge codec versions, including recursively inside typed loss/recovery evidence. A version-2 plan must not be emitted under a 2.0 envelope. The existing unknown-core-version and unknown-operation recovery behavior remains required for readers that do not support it.

## Read and write compatibility

| Reader and input | Required outcome |
|---|---|
| Existing unmodified 2.0 reader, document 2.1 | Existing future-version `recovery-readonly`; preserve original source. No interpretation as 2.0. |
| Amended reader, known 2.0 document with v1 plans | Supported structural read, then normal semantic hydration. Existing v1 meanings and exact module references remain intact. |
| Amended reader, known 2.1 document with supported v1/v2 plans | Supported structural read, then normal semantic hydration. |
| Either reader, unsupported future document/core codec/operation | Inherited `recovery-readonly` and original-source preservation, subject to malformed-known-data precedence. |
| Amended reader, known 2.1 structure with a supported operation on invalid endpoint types | Semantic error, never a guessed conversion; inherited hydration/generation boundaries apply. |

The amended writer saves 2.1. Its declared additive 2.0-to-2.1 upgrade changes the envelope version while retaining all existing record meanings, exact pins, IDs, authored data, inactive evidence and opaque data. It does not recompute conversions, reactivate lost edges or replace definitions. This limited upgrade is valid because this amendment adds meanings without redefining existing ones; it is not permission to relabel 1.0, Legacy or experimental documents. Unsupported inputs retain their existing recovery/converter path. No 2.1-to-2.0 downgrade is promised.

Document/core-codec evolution and Node module evolution are separate. Image Output's changed admission belongs to an updated exact Node module identity. A 2.0 envelope upgrade alone cannot replace the old pinned Node definition or silently relax its policy. Existing supported explicit definition-upgrade paths may be used when separately scoped; this amendment does not claim one has been delivered.

These are bounded technical compatibility requirements for the two specified production document versions, not a general promise to support all development-era files or closure of G-VERSION-COMPAT / G-DOCUMENT-STABILITY-COMMITMENT.

## Admission and generation

TypeEnvironment remains the authority for interpreting resolved types and producing/verifying a plan. Receiving ports that admit the DEC-GRAPE-002 float conversion family can use the new operation; exact ports continue to admit identical types only. This does not broaden unrelated numeric policies or infer Node configuration.

An adopted Image Output definition admits the four float-family source shapes into its required vec4 color input. Its declared boundary output remains vec4. Graph ownership and Application command authority, normal connection checks, transactional replacement, interface reconciliation, loss handling and domain-separated History remain unchanged.

Existing candidate checks, final connection, graph validation and hydration must agree on the plan's meaning. Generation consumes the stored admitted plan from its immutable snapshot and independently rejects invalid plans. Equivalent GLSL expressions for the new operation are the two constructors listed above. A temporary variable is not required by this contract; an implementation may use one when justified without changing evaluation semantics. Constant-expression eligibility must not be lost merely by introducing an unnecessary runtime local.

Save/reopen, subgraph expansion or emission, clipboard remapping and authorized package exchange preserve the same plan and endpoint identities through their existing ownership boundaries. No new inference pass, central node registry, UI-specific conversion service or replacement graph model is required by this amendment.

## Validation and adoption

Required outcomes are [AT-DEC-GRAPE-002-01 through 08](DEC-GRAPE-002.md#必要驗收), all **REQUIRED_NOT_EXECUTED**. They include numeric results, actual Image Output interaction, exact-port rejection, generation, both document versions, malformed/unknown data, nested evidence, module identities and scoped exchange. Supporting root integrity checks do not qualify these product behaviors.

Before implementation adoption, the designated maintainer records this file's actual SHA-256 as an `architecture-change` decision reference and DEC-GRAPE-002 as a `product-decision` reference, using the existing current-state schema. Reference statuses and authority must reflect the real Owner-approved scope and any subsequent review, never an invented technical PASS. Bind the authorized implementation baseline and later review packet to the exact amendment files. The PM has not changed current-state registration, accepted evidence, Slice scope or dispatch.

Rejected alternatives: changing the meaning of v1 `append-alpha-one`; putting executable fill information into inert `extensions`; storing the new operation under an unamended 2.0 contract; admitting a wire only in the UI; changing the source Node's output type to make this conversion appear to work. These alternatives do not satisfy the approved behavior and inherited persistence guarantees.

Reconsider this amendment only on a concrete representation, compatibility, profile or ownership counterexample. Preserve the counterexample and use the existing decision process; do not silently expand this float-only table to other types.
