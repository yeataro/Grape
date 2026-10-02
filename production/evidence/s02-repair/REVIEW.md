# PR #2 — S02 M1/M2 repair checkpoint

**UNREVIEWED — NOT HUMAN ACCEPTED — NOT SLICE COMPLETION EVIDENCE.**

The Human Owner reported the previous Fresh Independent Review as **FAIL / NOT_ELIGIBLE_FOR_HUMAN_ACCEPTANCE**, with findings M1 and M2. This repair checkpoint requests targeted independent re-review; it does not replace that verdict with an implementer-authored review PASS. S02 remains active and unaccepted. S01 and its accepted evidence remain unchanged; no later Slice is authorized. No merge is performed.

## Revisions

- Previous PR HEAD: `922af510c808a1874958b19df65d73240eaf742e`.
- M1 save repair: `3c0ca1ba8eddf56fb566d6bcee23712fadcefee7`.
- M2 publication repair and final tested implementation: `e23a997f53a17f3e00bf7f83de489cfaeb367251`.
- The evidence revision is the Git commit containing this checkpoint. PR #2 identifies that pushed HEAD. The evidence follow-up changes only this directory and mutable implementation-state build references.

## Targeted review

M1: `writeDocument` validates shared canonical structure and per-network node/edge budgets, then checks the actual emitted UTF-8 representation, including compact fallback. Oversize returns `DOCUMENT_SIZE`; excess network counts return `NETWORK_SIZE`. Nothing is truncated or written before validation succeeds. Dirty state compares current canonical content to the acknowledged snapshot independently of serialization limits; failed saves retain current edits and the previous storage record. The reader budgets remain 512000 bytes, 256 nodes and 1024 edges per network.

M2: existing structural validation is factored into `src/sdk/document-validation.ts`, a pure contract consumed by reader, writer and model. `Draft.replaceDocument` validates the complete incoming envelope before staging; `Graph.change` validates the final replacement before publication. This avoids a model dependency on persistence. Invalid candidates and poisoned batches cannot change canonical content, revision, History or publication notifications. Existing pin/kind, base-content, load/revision and semantic checks remain intact. Valid replacement still publishes one Undo operation.

Added regressions: seven model/application save-limit cases (ASCII/CJK/non-BMP missing-module boundary, actual compact output, node and edge budgets, edited graph beyond capacity); eight direct replacement cases (malformed position component/length, duplicate recovery IDs, unknown envelope/node/endpoint fields, caught failure poisoning, valid detached publication with Undo/Redo); one real Chromium save/reopen case checking IndexedDB, visible Unsaved status, named rejection, revision stability and opaque preservation.

`m1-before.log` preserves seven expected failures against the previous implementation (`922af51`) with the newly added regressions. `m2-before.log` preserves seven expected failures and three passes against the M1-only implementation (`3c0ca1b`) with the new replacement tests. These diagnostic runs preceded test formatting/commit; final revision-bound results are in `verification.json`.

## Validation and state

At `e23a997`: 72/72 model/conformance and 25/25 real Chromium tests passed, with zero skipped/flaky/unexpected browser tests. Build/typecheck, ownership/dependencies (34 files), both module fingerprints, bootstrap integrity and all nine bootstrap negative controls passed. The final mutable state also passed bootstrap/current-state verification after binding it to the tested revision. Source and artifact SHA-256 values are in `verification.json`; checkpoint state/evidence hashes are in `checkpoint.json`.

The existing S01 and S02 tests were retained. `handoff/`, accepted S01 records and historical S02 evidence were not modified. No S02 evidence was added to `acceptedEvidence`; no completion or Gate decision was fabricated.

## Bounded legacy scope

**AT-S02-03 legacy compatibility remains NOT DELIVERED / BLOCKED, not passed.** The reviewer resolved this as **Classification A**: the branch may remain not delivered for bounded S02 acceptance, and no Human Gate is required for that scope question. No legacy revision mappings, conversion policy, fallback or generated-output compatibility were invented. Inherited compatibility Gates remain unresolved for their dependent legacy scope.

No true Human Gate was encountered in these repairs. Residual limitations remain legacy conversion/upgrade, Texture/TOP conversion, and non-Chromium/GPU/Host/device qualification. Exact-module restoration retains model/application evidence; no browser module installer is introduced. Technical re-review must precede any Human product acceptance.
