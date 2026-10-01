# IH-003 changes after second independent review

Scope: reconcile Claude's IH-001 review against incoming repaired IH-002; fix residual contract/tooling gaps only. Status: experimental accepted-for-qualification; independent acceptance pending. No S01 or Legacy implementation read. Research sources stay AC-002/IR-001/CQ-001/MRDP-001. Old packages remain unchanged.

## Architecture Changes

| ID / finding | Before | After / reason | Affected invariants | Preserved boundary / evidence |
|---|---|---|---|---|
| AC-IH003-01 / B1,M3,M5 | Normative shapes and closed qualification unions mixed; no open topology/service counterpart | Contract ledger; registered GraphKind/StageKind, namespaced typed capabilities, GLSL stage artifact map, metadata overlay; examples mapped to production surface | INV-012/013/014/015/017, CP-01/02/03 | Graph owns topology; fixed definitions; immutable generation; Host external. qualification public-surface and ledger tests |
| AC-IH003-02 / B2 | Experimental format and TD-named kinds could be copied | grape.document 1.0, exact product kinds, structural validation, unknown read-only recovery, opaque module preservation, explicit version/converter boundary | INV-004/014/017/018/019/021 | Single Graph identity, safe save ACK/new load lifetime; no Host/UI ownership. contracts/document-format.test.ts |
| AC-IH003-03 / M2 + user requirement | No feature-owned label/category/help/localization contract | Module/Node/Panel metadata, namespaced/versioned locale contribution, fallback and UI preference ownership | INV-001/014/015/019/020 | No Graph/History/GLSL mutation; stable diagnostic codes; builtin=extension seam. repair/localization.test.ts |

No invariant waived. These are explicit production-surface additions, not claims that AC-002 already proved them. IH-002 AC-IH002-01/02 Panel/scoped semantics remain adopted and rerun.

## Engineering and documentation changes

- M4: production dependency/public-export/rights manifest checker. Old reference role matrix remains historical; ordinary-extension change set forbids unrelated core edits. No sandbox claim.
- M6: progress schema2 with Decision/AC references and accepted-baseline links. Single external locator unchanged; frozen template remains not-started. No production/current record created.
- m1: S01 needs ACK storage save/reopen plus independent JSON export/reopen. Minimum saved-key selector is sufficient.
- m2: screenshots unchanged; canonical locators retained; full file-index membership/hash verification added.
- m3: 21 mechanisms remain experimental with explicit scope; four confirmed parent principles indexed separately. Engineering AC cannot silently change confirmed ownership/product intent.
- m4/m5: named compact-token ambiguities corrected; production TypeScript stated, toolchain versions recorded at implementation baseline. No broad editorial rewrite.
- G-DOCUMENT-STABILITY-COMMITMENT is the sole added owner-policy Gate. Original 33 UNKNOWN and 8 PDR leaf dispositions unchanged.

## Counterexamples and evidence honesty

1. The initial production checker returned PASS for a core type import from bare `fs` and adapter dynamic import into another owner's private file. These were executed in-memory counterexamples during repair. Bare-builtin classification and dynamic-import boundary checks corrected them; PB18/PB19 preserve direct assertions. This is a tooling failure, not a changed application owner.
2. The initial document draft overrestricted pins to unique moduleId and could execute hidden toJSON. Inspection identified both before final publication; tests now require exact tuple coexistence and zero getter/toJSON invocation. No pre-fix failing test execution is claimed. DF15–17 cover non-enumerable/custom-array/sparse data and authored resource/interface preservation.
3. The first localization fixture referenced a nonexistent NodeType; the model correctly refused. Fixture corrected without weakening a contract. An unsubscribe/dispose notification test was also added.
4. First full regression correctly scanned 31 sources but its inherited test expected IH-002's 25. The failure log is preserved in evidence/second-review-first-regression. The explicit count was updated for the six new declared sources; no dependency policy was relaxed.

Full executed results: [SECOND_REVIEW_VALIDATION.json](SECOND_REVIEW_VALIDATION.json), with full-run logs in evidence/RUN_HANDOFF.json. Qualification does not prove production rendering, translation completeness, semantic hydration codecs or actual TD/GPU/TOE/TOX.
