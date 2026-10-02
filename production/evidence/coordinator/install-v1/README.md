# Coordinator v1 installation evidence

Baseline: `ba39de6992827514bbd74368f67e406ec2eef06a`. Normative policy source: `0826de5a9cca7cf200d843435985a7dc624634a2`. The final AGENTS pointer uses a literal path to preserve existing isolated bootstrap fixtures; no policy-document change followed evaluation.

[checkpoint.json](checkpoint.json) binds authority, synchronization, source revision, actual validation, protected identities and artifact hashes. [dry-run-results.json](dry-run-results.json) records inputs, expected/observed phase and single action, historical proofs, and replay/restart observations for every variant. [historical-pr-facts.json](historical-pr-facts.json) captures actual GitHub merged metadata independently of historical PR wording.

| Case | Exercised variants | Result and observed boundary |
| --- | --- | --- |
| C01 | Behind work; synchronized work | PASS (2): safe fast-forward proposal, then wait without Slice authority |
| C02 | FAIL; repaired submission; exhausted repair rounds | PASS (3): repair → targeted review; technical diagnosis after three unsuccessful rounds |
| C03 | Stale expected head; synthetic divergence | PASS (2): retain Human Pages commit; reject stale publication / stop divergent mutation |
| C04 | Bounded PASS; existing Human acceptance receipt | PASS (2): request bounded acceptance, then bookkeeping; legacy branch remains blocked |
| C05 | S01 and S02 I/R/B triples | PASS (2): ancestry and metadata-only diffs verified; wait for separate merge control |
| C06 | PR #1 and #2 lost-response replay | PASS (2): actual merged facts prevail; no repeated merge |
| C07 | Stale report; missing/malformed report | PASS (2): obtain exact-candidate review; preserve historical null provenance |
| C08 | Packaging defect; environment failure; exhausted transient retries | PASS (3): technical repair versus environment recovery; exhaustion is workflow diagnosis |
| C09 | Unpromoted discussion; synthetic contract contradiction | PASS (2): exclude speculative context; only scoped decision packet for demonstrated simulated conflict |

All 20 variants replayed duplicate events and simulated restart immediately before/after route publication. Inputs and receipt sets were serialized/recovered in memory; one matching route receipt suppresses duplicate publication. Each variant checked protected repository bytes and filtered packets. No real Gate, product acceptance, dispatch or product-state mutation occurred.

Reproduce from repository root:

```sh
python3 production/evidence/coordinator/install-v1/replay.py
node tools/verify-bootstrap.mjs
node handoff/tools/check-implementation-state.mjs --current
node --test --test-isolation=none tools/verify-bootstrap.test.mjs
```

The replay prints observations only. Redirect new runs outside this immutable evidence directory. It is an offline test fixture, not runtime Coordinator automation. The model PASS does not verify a live isolated adapter, external retries, durable crash recovery or concurrent writers. No adapter is claimed to exist. A later adapter requires separate authorization and its own conformance proof.

Actual root validation: 463 integrity/bootstrap checks, current state valid, nine bootstrap negative controls passed with zero failures/skips under Node 24.19.0. This is not Node 25.5.0 product qualification. [bootstrap-tests-initial.log](bootstrap-tests-initial.log) retains the two initial fixture navigation failures; the literal-path pointer fixed them without changing tests. [bootstrap-tests.log](bootstrap-tests.log) and [bootstrap.json](bootstrap.json) contain passing results. Product suites/builds were not rerun or relabeled.

All 565 original tracked files were compared by SHA-256; only the authorized AGENTS pointer changed. All existing IH-005 instructions, 412 handoff files, implementation-state, product source/tests/tools, existing automation, and accepted S01/S02 evidence remain unchanged. No active Slice; S03+ remains unauthorized. No product requirements, Gate decisions, runtime automation, mutable project-state database, repository settings or external task IDs were introduced. This evidence is ready for Fresh Independent Workflow Review, not a claim that such review or Human acceptance has occurred.
