# S01 repair evidence — awaiting targeted re-review

This is an Implementer submission, **not accepted evidence or a completed slice**. Root state keeps S01 active, `completedSlices` empty, and `acceptedEvidence` empty. The independent review returned FAIL; this submission repairs M1 and N1 and awaits targeted re-review. No later slice or mixed History was started. Nothing was merged.

## Result and reproduction

The production entry provides the IH-005 Host-free image Graph → Float/Multiply/Compose → Canvas/Inspector edits → connections → Undo/Redo → GLSL text → ACK-backed save/reopen path, plus independent JSON export/file-open and two Contexts. Start it using [the production README](../README.md). The packaged static build is [s01-web.tar.gz](s01-web.tar.gz); serve its extracted contents over HTTP.

[verification.json](verification.json) binds the tested source files, effective runtime, command exit codes, browser version, and packaged build hashes. [browser-results.json](browser-results.json) is the Playwright machine report; [s01-workspace.png](s01-workspace.png) is a screenshot from the real UI. The screenshot deliberately shows a previous generation marked stale after an edit.

Declared environment: Node **25.5.0**, Linux x64, Chromium **151.0.7922.34**, Playwright **1.62.1**, headless browser, viewport **1440 × 1000**. The browser suite exercises real DOM layout, accessibility names/focus, keyboard and pointer dispatch, IndexedDB transactions, downloads, file open, and adapter fault handling. It does not claim physical-device or native OS IME execution.

Final repair execution: **42 model/conformance tests, 17 Chromium tests, 9 root bootstrap tests; zero failures or skips**. The production build, 30-file ownership check, module fingerprints, frozen Handoff integrity, and current-state validation passed. Tested repair implementation revision: `c1ecb3cd1a4cd1685e3fb1d9ba2a17b4108e68c3`. The prior review checkpoint and original implementation remain available in Git history; their earlier passing tests did not detect M1 and do not constitute acceptance.

## Review findings repaired

- **M1 (acceptance blocking):** both Float Value and Multiply B originally reported success while emitting `1e+21.0`. The direct counterexamples were run before the fix and both failed; [m1-counterexample-initial.log](m1-counterexample-initial.log) retains that execution. A shared pure formatter now emits `1.0e+21`, placing the decimal point in the significand before any exponent, across Node emission and scalar/vector local-input lowering. It preserves existing finite/float32 admission without rounding or clamping model values. Five added model tests cover both counterexamples, ordinary integers/decimals/signs/exponents, 2,040 float32 bit patterns spanning all finite exponent bins, representative subnormal/normal/max-finite boundaries, and unchanged admission/rejection. The syntax oracle is the GLSL floating-constant grammar, not a GPU qualification claim.
- **M1 browser evidence:** two added real-Inspector tests commit `1e21` independently in Float Value and Multiply B and assert successful generation with valid literals. Screenshots: [m1-float.png](m1-float.png), [m1-multiply.png](m1-multiply.png).
- **N1:** a primary-button guard prevents middle/right pointerdown from starting node movement. One added Chromium test verifies unchanged node position, Graph revision and saved baseline for both buttons, then proves primary drag and its single Undo still work. No pan UX or deferred interaction redesign was added.
- **N2:** PR #1's description is updated at publication with the repair implementation revision, evidence commit/pushed HEAD, current counts and links pinned to that checkpoint. This repository record deliberately does not self-reference its containing evidence commit.

The Node module source changed, so its exact fingerprint was recomputed and checked. Older documents pinned to the previous module identity use existing missing-definition recovery; no migration, silent identity alias or external document-stability promise was added. The Human Owner's intervening Pages workflow commit `05d152d46570bc4e4ebe2af3412be3e153e31a20` is preserved unchanged.

Deferred visual design, drag-release connection UX, temporary wire preview, grid/camera visuals and page-layout polish remain untouched. The repaired behavior is submitted for independent review; no reviewer acceptance or Gate resolution is inferred from test results.

## Acceptance mapping

| Acceptance | Product / architecture evidence |
| --- | --- |
| AT-S01-01 | Real browser creates connected Float=0.25, Multiply b=2 and Compose output. Model test verifies immutable same-snapshot compilation and the 0.25 × 2 dataflow. GLSL text only; no GPU compiler claim. |
| AT-S01-02 | Model rejects direction, occupied input, cycle, type mismatch and cross-Stage endpoints in two actual networks without snapshot/history changes; browser confirms occupied/type rejection preserves wires/revision. |
| AT-S01-03 | Mode change publishes schema, detached edge, prior-value/port loss and diagnostics together. Undo/Redo reproduce exact documents. Browser independently saves/reopens the error-bearing document and confirms retained losses and generation refusal. |
| AT-S01-04 | Browser scalar draft cancel/commit, simulated composition, keyboard Undo, multi-event drag and pointer cancellation; model proves one operation entry and redo retention on cancel/no-op. |
| AT-S01-05 | Browser IndexedDB ACK save/reopen and independent downloaded file reopen; model proves exact content/IDs, new loadId, empty History and invalid old handles. |
| AT-S01-06 | Browser two Canvas contexts with independent selections/cameras and shared edits; model proves selection cleanup before external observers and no UI-selection restoration on Undo. |
| AT-S01-07 | Browser delays transaction completion, edits newer content, injects quota denial, and cancels an export download. Model tests SAVE_BUSY, rejection, capture identity, late ACK and stale open fencing. |
| AT-S01-08 | Production Graph observers attempt reentrant writes and throw; other observers receive the committed revision and complete projection. |

Additional conformance covers exact definition/type admission, full-model generation errors, required boundary output maps, JSON structural vs semantic recovery, forged conversion plans, prototype-named unknown keys, non-JSON values/descriptors, inactive loss data, opaque missing modules, raw invalid UTF-8 export, locale fallback/CAS, Panel event/lease authority, origin guards, same-ID reuse, render reentrancy, reverse cleanup, shared placeholders and retry. See [CONTRACT_MAP.md](../conformance/CONTRACT_MAP.md) for owner/API mapping and authoritative sources.

## Review status and residual scope

All final command results must be read from `verification.json`; no earlier log or screenshot supersedes a failed/running result. The verifier invalidates a previous success record before another run. Test pass counts are execution facts, not approval.

The implementation's source review and static manifest checks found no contradiction requiring Architecture Change. Source review confirmed that generator/persistence consume immutable data, browser APIs stay at browser/presentation boundaries, Canvas Graph commands require Application grants and current mounted-event leases, and shared rendering imports no concrete feature. The manifest is a reviewed assertion, not a proof against malicious extensions or arbitrary reflective access.

G-UI-CONFORMANCE and G-EXTENSION-PANEL have submitted evidence for this declared S01 scope only. Physical iPad/Safari/touch, native OS IME and the full later-action busy matrix remain open under G-LU-UI-001/003. G-LU-NODE-005's Legacy fixture and other Node families are not claimed resolved. Nested Inspector/S06 remain outside the delivered root scope. HC-001 source summaries remain quarantined. G-DOCUMENT-STABILITY remains open for any external compatibility promise. No Gate decision is recorded as resolved before evidence review.

An added topology regression initially expected duplicate Stage keys to be a saveable semantic error. The formal wire validator correctly rejected duplicate identity. The corrected test and Graph hydration now distinguish duplicate identity rejection from a unique but undeclared Stage slot's saveable generation-blocking diagnostic. The initial failed assertion is retained in [topology-regression-initial.log](topology-regression-initial.log); the oracle was aligned with the existing wire contract, without relaxing the codec.

Review should assess the declared scope, acceptance observations, authority/lifetime invariants, source ownership classifications, and remaining Gates. Only subsequent accepted review may populate accepted evidence and mark S01 completed. The Human Owner retains final acceptance authority.
