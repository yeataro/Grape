# Coordinator v1 workflow conformance

**Policy scope:** the cases below remain the v1 per-Slice and historical installation expectations. The [continuous-delivery routing cases](CONTINUOUS_DELIVERY.md#minimal-bindings-and-verification) cover the new conditional mode; do not report old fixture results as validation of its changed authorization, multi-Slice readiness or checkpoint behavior. Unchanged integrity, isolation and replay protections still apply.

These scenarios test workflow rules, not Grape product acceptance. They do not reopen S01/S02, authorize S03, create real Gates or inject product defects. Run them read-only against immutable historical Git objects and explicitly synthetic events. A policy tabletop/model result is not proof of a deployed Coordinator or an isolated dispatch adapter.

## Common execution contract

For **every case and variant** below, evaluate the event, deliver it again, restart immediately before simulated publication, and restart immediately after simulated publication. Derive the phase from the same authoritative inputs and any immutable publication receipt. Before publication, the same single action remains eligible; after it, an existing matching receipt suppresses duplicate publication. A no-op remains a no-op. Preserve pending technical obligations after a dispatch receipt: transport acknowledgement is not task completion.

For each case record inputs/refs, expected and observed transition, single next action, forbidden actions, replay/restart observations and PASS/FAIL for the behavior actually exercised. Verify all shared invariants separately for each case: **no lost commits, no invented acceptance, no extra active Slice, frozen handoff unchanged, speculative Human context excluded**. Shared forbidden actions are branch reset/force-push/discard, product/state/accepted-evidence writes, fabricated acceptance or Gate closure, additional Slice activation, frozen writes and speculative context forwarding. Scenario-specific prohibitions below add to these.

The installation replay script is an explicitly invoked, offline, read-only evidence fixture under `production/evidence/coordinator/install-v1/`. It loads historical facts, evaluates routing in memory and prints observations. It has no dispatch, publication, project-state write, network or scheduler capability. Its simulated receipts and events are never production receipts. Policy conformance also needs a reader to compare observed routes against these normative expectations; model assertions alone cannot establish adapter correctness.

## Immutable history register

| Symbol | Commit |
| --- | --- |
| S01 pre-repair submission | `19124c11799362bec41f7f0791c7e5dbc963de4f` |
| Intervening Human Pages change | `05d152d46570bc4e4ebe2af3412be3e153e31a20` |
| S01 I | `c1ecb3cd1a4cd1685e3fb1d9ba2a17b4108e68c3` |
| S01 R | `ab0216436d66ab1282758d51dceb38d0283c1965` |
| S01 B | `d44cb8ebc1d00d4a46bb4b08b93b00a6b455e83f` |
| S01 merge | `365eef3e3240a25b18eb46cb637774596336228d` |
| S02 packaging repair | `e6dfecf407ca37fa58725bf21ec344d00074a04d` |
| S02 I | `e23a997f53a17f3e00bf7f83de489cfaeb367251` |
| S02 R | `45c08a5b27beb9c57797975cea8007c35640e16c` |
| S02 B | `bfbba1d3199ddd2d4a6cf8b7d00085810b92b863` |
| Accepted S02 merge / installation baseline | `ba39de6992827514bbd74368f67e406ec2eef06a` |

Resolve short historical selectors uniquely before running; do not accept an invented expansion. Current remote refs must be fetched/read again for actual operation.

## C01 — safe start after S02 merge

Inputs: accepted S02 merge, its state with no active Slice, historical work=S02 B, and no authorization. Expected: `SYNC_REQUIRED`, single next action **propose safe fast-forward** in a read-only run. Re-evaluate with work=main: `WAITING_AUTHORIZATION`, single next action **wait for Human Slice authorization**. Forbidden: treating accepted S02, branch equality or maintenance authorization as S03 authority. Duplicate and both publication-boundary restarts must retain the fast-forward intent once, then wait without new product work; apply every common invariant.

## C02 — S01 technical failure repair loop

Inputs: pre-repair history, preserved `1e+21.0` counterexample, M1/N1 repair evidence at S01 R, and a synthetic replay of the recorded technical FAIL. Expected: `REPAIR_REQUIRED`, single next action **dispatch bounded M1/N1 repair**. Synthetic repaired submission at I/R yields `REVIEW_PENDING`, single next action **dispatch targeted Fresh Review**. Three unsuccessful synthetic rounds yield `WF_RETRY_BUDGET`, single next action **technical diagnosis**. Forbidden: Human pre-review, pan redesign, numeric admission change, GPU qualification or retry exhaustion becoming a Gate. Duplicate and before/after-publication restarts must deduplicate each dispatch, preserve finding group/round count, and apply all common invariants.

## C03 — preserve intervening Human work / divergence

Inputs: actual Pages commit `05d152d`, previous expected head and synthetic stale publication attempt. Expected: `WF_INTEGRITY`, single next action **reread and reconcile the preserved Human commit**. Separate synthetic divergence/unaccounted-work event yields `WF_BRANCH_DIVERGENCE`, single next action **stop branch mutation and diagnose**. Forbidden: accepting tree equality as proof of ancestry, force-push/reset or dropping Pages. Duplicate and both publication-boundary restarts must reject the same stale attempt and retain all commits; apply all common invariants.

## C04 — S02 bounded acceptance

Inputs: S02 I/R, recorded owner-reported PASS and explicit bounded acceptance at B; synthetic replay of PASS before Human acceptance. Expected: `AWAITING_HUMAN_ACCEPTANCE`, single next action **present bounded acceptance control**. Supplying the existing historical Human receipt yields `HUMAN_ACCEPTED`, single next action **validate bounded bookkeeping** (simulated only). Preserve AT-S02-03 NOT DELIVERED / BLOCKED and G-VERSION-COMPAT unresolved, with no Gate deltas. Forbidden: inventing converters, promoting reviewer Classification A into architecture authority or claiming global closure. Duplicate and both restarts must retain the exact scope and suppress duplicate controls/bookkeeping; apply all common invariants.

## C05 — bookkeeping descendant I/R/B distinction

Inputs: both S01 and S02 I/R/B triples, Git ancestry/diffs, source/test/tool/configuration trees, original evidence and root acceptance hashes. Expected: `COMPLETION_RECORDED`, single next action **wait for separate merge control** after validating metadata-only B. Forbidden: claiming B is a reviewed implementation, rewriting old unreviewed labels or rerunning evidence writers. Duplicate and before/after-publication restarts recognize existing bookkeeping rather than create it again. Apply all common invariants to both triples.

## C06 — historical wording / lost merge response

Inputs: actual PR #1/#2 merged metadata and reachable merge commits, PR prose still saying no merge, synthetic lost-response/duplicate-closed events. Expected: `MERGED_VERIFIED`, single next action **reconcile accepted baseline/work**, then C01 waiting behavior. Forbidden: duplicate merge, rewriting old prose to establish truth, new Gate decisions or next-Slice activation. Duplicate and both publication-boundary restarts recover actual merged facts, not a second merge; apply all common invariants.

## C07 — provenance / stale review

Inputs: historical owner-reported S01/S02 PASS records with null reviewer identities and missing original reports. Synthetic old-R report arrives for a newer product candidate; separate malformed/missing report. Expected: `REVIEW_PENDING` with integrity wait, single next action **obtain valid review for exact candidate**. Forbidden: fabricating independent counts/identity or carrying PASS across changed product content. Duplicate and both restarts retain honest provenance and reject stale/malformed evidence consistently; apply all common invariants.

## C08 — technical versus environment failure

Inputs: S02 packaging-navigation repair `e6dfecf`; synthetic wrong Node/browser/dependency or lost-artifact-access failures. Packaging defect yields `REPAIR_REQUIRED`, single next action **bounded technical repair/re-review**. Environment failure yields `WF_ENVIRONMENT`, single next action **restore/verify declared environment**. After initial attempt plus two unsuccessful transient retries, `WF_RETRY_BUDGET`, single next action **workflow diagnosis**. Forbidden: product FAIL for unavailable runtime, PASS for unexecuted checks or a Human Gate caused by retry exhaustion. Duplicate and both restarts retain retry counts and classification; apply all common invariants.

## C09 — Human discussion versus true Gate

Inputs: repository-recorded deferred S01 observations used only as excluded-context markers, an explicitly synthetic unpromoted idea, and a separate synthetic minimal impossible-contract counterexample with no real product decision. Discussion alone leaves `WAITING_AUTHORIZATION`, single next action **wait**, with the idea absent from role packets. A demonstrated invariant conflict in an already-authorized simulated dependency yields `HUMAN_GATE_WAIT`, single next action **prepare scoped HG_ARCHITECTURE decision packet via IH-005**, preserving unaffected authorized work. Forbidden: making brainstorming a requirement or a Gate, creating an actual Gate record, reinterpreting DEC-GRAPE-001, or forwarding speculative text. Duplicate and both restarts must produce no duplicate Gate packet or new scope; apply all common invariants.

## M1 — accumulated retry budgets (targeted C02/C08 regressions)

Use explicitly synthetic operation/finding identities and receipts in the new `production/evidence/coordinator/install-v1-repair-m1/` fixture. Keep the original install-v1 checkpoint and replay immutable; their results describe the prior policy revision. Apply the common no-write, context-exclusion and replay/restart invariants to these targeted cases as well.

- **M1-A / C02:** one finding group reaches two unsuccessful repair/re-review rounds. New diagnostics, changed symptoms, additional logs, changed error messages and new evidence leave its count at two. The next unsuccessful round reaches three and yields `WF_RETRY_BUDGET`; the single next action is technical diagnosis. Further rounds are refused, not reset.
- **M1-B / C08:** one transient operation completes its initial attempt and first retry. Changed error details/new diagnostics leave the retry count at one and attached to the same operation/actionKey. The second retry reaches two and yields `WF_RETRY_BUDGET`; the single next action is workflow diagnosis. Further retries are refused, not reset.
- **M1-C-operation / M1-C-group:** after the Coordinator has established a genuinely different operation/actionKey or independent finding group, that identity starts its own counter. The prior exhausted identity and count remain intact; the new identity must not be a continuation intended to evade exhaustion.
- **M1-C-renamed-operation / M1-C-renamed-group:** changed names, wording, actionKey spelling, attempt identifiers or reframing of the same unresolved work do not create an independent identity. Preserve accumulated counts and diagnosis pauses. Unestablished identity claims cannot obtain a fresh budget.

For each trace, replay duplicate events and serialize/recover the ledger before/after every simulated receipt publication. Counts and phase must be identical after replay/restart; diagnostic events must not change counts. Include negative controls demonstrating that the prior reset-on-new-evidence behavior violates M1-A/M1-B. These are implementer-run policy-model checks, not independent review or live dispatch qualification. No real Human Gate or product acceptance is created.

## Limits and reporting

Record a case as PASS only for the read-only procedure/model actually executed. A specification without execution is NOT RUN. Adapter isolation, real dispatch, retries against services, crash recovery across machines and durable concurrent publication need separate authorized tests; this installation does not claim them. Never register synthetic observations as accepted product evidence. Preserve installation checkpoints immutably; corrections use new evidence/commits, not rewritten historical acceptance.
