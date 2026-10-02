# S01 implementation evidence — awaiting review

This is an Implementer submission, **not accepted evidence or a completed slice**. Root state keeps S01 active, `completedSlices` empty, and `acceptedEvidence` empty. No later slice or mixed History was started. Nothing was merged or published.

## Result and reproduction

The production entry provides the IH-005 Host-free image Graph → Float/Multiply/Compose → Canvas/Inspector edits → connections → Undo/Redo → GLSL text → ACK-backed save/reopen path, plus independent JSON export/file-open and two Contexts. Start it using [the production README](../README.md). The packaged static build is [s01-web.tar.gz](s01-web.tar.gz); serve its extracted contents over HTTP.

[verification.json](verification.json) binds the tested source files, effective runtime, command exit codes, browser version, and packaged build hashes. [browser-results.json](browser-results.json) is the Playwright machine report; [s01-workspace.png](s01-workspace.png) is a screenshot from the real UI. The screenshot deliberately shows a previous generation marked stale after an edit.

Declared environment: Node **25.5.0**, Linux x64, Chromium **151.0.7922.34**, Playwright **1.62.1**, headless browser, viewport **1440 × 1000**. The browser suite exercises real DOM layout, accessibility names/focus, keyboard and pointer dispatch, IndexedDB transactions, downloads, file open, and adapter fault handling. It does not claim physical-device or native OS IME execution.

Final execution: **37 model/conformance tests, 14 Chromium tests, 9 root bootstrap tests; zero failures or skips**. The production build, 29-file ownership check, module fingerprints, frozen Handoff integrity, and current-state validation passed. Tested production revision: `949527eaa0a8b281de3a39862976ca9180579d1c`.

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
