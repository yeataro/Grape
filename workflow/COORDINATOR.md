# Coordinator v1 repository policy

**Workflow mode:** the [checkpoint and continuous-delivery policy](CONTINUOUS_DELIVERY.md) records the Owner-directed transition. Its explicit overrides apply only after a verified checkpoint and recorded Human end-to-end execution instruction. Until then, the per-Slice route below and existing explicit controls remain in force. Installing the policy does not resume dispatch or authorize publication. Preserve all role separation, evidence and IH-005 protections not explicitly overridden.

This policy supplements [AGENTS](../AGENTS.md) and accepted IH-005; it cannot rewrite either. It installs workflow rules only, introduces no product requirement, and authorizes no Slice. S03+ requires a separate explicit Human authorization. Operational procedures are in [RUNBOOK](RUNBOOK.md), normalized contracts in [PACKETS](PACKETS.md), and workflow dry runs in [CONFORMANCE](CONFORMANCE.md).

## Authority and truth

1. Current repository truth and accepted IH-005 constraints govern. The root [implementation-state.json](../implementation-state.json) is the sole mutable project-state record. Accepted main is the canonical baseline; work contains proposals layered on it. A merge lacking acceptance is an integrity incident, not implicit acceptance.
2. IH-005 and accepted decision references define obligations; current state indexes accepted progress; exact evidence establishes tested and accepted scope; Git/GitHub establishes branch and PR facts; an attributable Human Owner instruction grants authority. A contradiction pauses only dependent transitions while the evidence is preserved.
3. The Human's explicit workflow-installation instructions govern unavailable sections of the supporting proposal, *Grape Coordinator v1 design for Human review* (2026-10-02). This precedence was explicitly confirmed by the Human. Chat summaries, PR wording, labels, passing checks and roadmap order cannot override repository truth or grant product authority.
4. Frozen handoff identity comes from [HANDOFF_ACCEPTANCE.json](../HANDOFF_ACCEPTANCE.json) and its indexed bytes. Never edit, normalize, regenerate, write or install dependencies under `handoff/`. Preserve accepted historical evidence, including old pending/unreviewed labels. Full qualification uses disposable byte copies only.

## Invariants and roles

- At most one authorized active Slice. Completion, acceptance, merge or a generic instruction to continue never authorizes the next Slice.
- Exactly one designated state maintainer / logical writer for a run. This is a **logical workflow invariant**, implemented in v1 by serialized execution, explicit ownership, expected-head guards and reconciliation. No distributed lock, queue, daemon, lease service or second project-state database is required or installed.
- Every publication preserves existing reachable work. Never reset, force-push, delete or overwrite unique, divergent or unaccounted work. A changed expected head rejects publication until reconciliation.
- Work performed must lie within explicit authorization and accepted contracts. Preserve canonical Graph ownership, Application command authority, domain-separated History, CAS/receipts/lifetime protections and inherited DEC-GRAPE-001.
- Evidence must bind scope, implementation, reviewed head, build/environment and hashes. Structural validation authenticates neither Human approval nor evidence adequacy. Never invent execution, reviewer identity, acceptance, timestamps or Gate closure.

| Role | Authority and duties | Boundaries |
| --- | --- | --- |
| Coordinator | Read first; recover truth; validate receipts, revisions and prerequisites; derive phase; select the single next action; route readiness directly to Fresh Review and FAIL to repair/re-review | Does not implement product decisions, self-review a repair, grant acceptance, close Gates by inference or activate future Slices |
| Implementer / designated state maintainer | Implement and repair only the authorized scope; preserve Human commits; submit immutable evidence; publish state changes and mechanical bookkeeping when authorized | Does not impersonate Reviewer or Human; no scope expansion, independent PASS, implied merge or frozen writes |
| Fresh Reviewer | Independently inspect exact candidate, contracts, evidence and negative behavior in a fresh context and separate checkout; return findings, verdict, provenance and limits | No inherited implementation conversation or speculative Human discussion; no product writes, acceptance, merge or authority expansion |
| Human Owner | Explicitly authorize a Slice, promote ideas into bounded scope, resolve genuine product/architecture questions, accept a technically valid scope, separately control merge | Brainstorming, discussion, a preview visit or a transport click is not authorization or acceptance |

Writer ownership must be explicit in the dispatch packet. Reassignment requires reconciling the prior writer's status and unpublished work; no replacement writer may publish while the old writer can still do so. A new chat name alone proves neither reviewer independence nor write isolation. Review outputs go to the designated maintainer for persistence without altering their authorship.

## Derived transition model

Phases below are derived from facts and immutable receipts, not persisted as another mutable state machine. A run binds `(policyRevision, acceptedMain, workHead, authorizationId, sliceId, submissionId, reviewId, acceptanceId, bookkeepingCommit, PR)`. Missing or inconsistent bindings block the dependent transition.

| Phase | Entry proof | Single permitted next action |
| --- | --- | --- |
| RECOVERING | Fresh launch or event hint | Read authoritative facts and derive phase |
| SYNC_REQUIRED | No active Slice; work is a proven ancestor of accepted main | Safely fast-forward under maintenance authority, then reconcile |
| WAITING_AUTHORIZATION | Accepted baseline recovered; no valid new Slice receipt | Wait for explicit Human Slice authorization |
| AUTHORIZED_PENDING_START | Attributable, unrevoked receipt for one Slice and exact accepted base | Verify work equals accepted main, prerequisites, scoped Gate timing, ownership and environment, then register authorized activation |
| IMPLEMENTING | Activation and authorized scope are registered | Produce revision-bound implementation submission; self-check failures remain here |
| REVIEW_PENDING / REVIEWING | Complete submission, evidence and isolated reviewer context | Dispatch/complete Fresh Review immediately, with no Human pre-review |
| REPAIR_REQUIRED | Valid technical FAIL with identified counterexamples | Dispatch bounded repair, then targeted re-review of findings and affected regressions |
| TECHNICAL_PASS | Valid independent PASS at exact scope and candidate; no blocking findings or required evidence gaps | Prepare Human acceptance control |
| AWAITING_HUMAN_ACCEPTANCE | Exact build, PASS and limitations presented | Obtain explicit acceptance of that scope; in-scope defects return to repair/re-review |
| HUMAN_ACCEPTED | Separate attributable acceptance references PASS and implementation | Designated maintainer performs completion bookkeeping |
| COMPLETION_RECORDED | Valid state, both accepted evidence kinds at same implementation revision, Slice removed from active, bookkeeping integrity verified | Wait for separate merge control; with valid control and guards, merge |
| MERGED_VERIFIED | GitHub merged fact, reachable merge commit, accepted content/state verified | Reconcile accepted baseline and safely synchronize work if authorized; then wait for next authorization |

The table describes future authorized operation. This maintenance installation neither activates a Slice nor grants merge authority for its own PR.

Orthogonal waits `WF_DISPATCH`, `WF_ENVIRONMENT`, `WF_PERMISSION`, `WF_BRANCH_DIVERGENCE`, `WF_INTEGRITY` and `WF_RETRY_BUDGET` retain the prior phase and explicit resume condition. `HUMAN_GATE_WAIT` retains the affected dependency and exact decision needed. Revocation pauses work and preserves its commits. A missing runtime is not technical PASS or product FAIL. Retry exhaustion is a workflow/technical diagnosis pause, never automatically a Human Gate.

New product, test, tool or configuration changes invalidate applicable review coverage. Changed main requires integration assessment and renewed baseline binding; never relabel a stale PASS for a new candidate. The strictly metadata-only bookkeeping exception is specified in the runbook. A Human decision resolves only its question; it skips no required implementation, review or acceptance.

## Human Gates and context isolation

Within the technical loop, request Human intervention only for valid technical PASS/product acceptance or a true Human Gate. Initial Slice authorization and separate merge control remain explicit Human control points. Mechanical help with unavailable credentials/dispatch can be requested as an operational action; it is not product pre-review.

A true `HG_PRODUCT` concerns an unresolved product choice or requested scope/behavior change required for the authorized dependency. A true `HG_ARCHITECTURE` requires a concrete accepted-contract/invariant conflict, minimal counterexample and the existing IH-005 Decision/Architecture Change procedure. Do not replace IH-005 classifications with these routing labels. `HG_SCOPE` denotes an explicit request to change authorized scope; unpromoted discussion alone does not create one.

Ordinary defects, implementation choices, failed tests, missing evidence, dependency/browser mismatch, authentication/rate limits, branch divergence, stale previews and retry exhaustion are technical/workflow conditions. Repair or diagnose them under current authority. An inherited Gate applies at its documented phase and concrete branch; it does not automatically block the entire Slice. Gate deltas require exact scope, disposition, evidence and residual scope under IH-005. Omitted deltas inherit frozen truth. S02 bounded acceptance does not deliver AT-S02-03 or resolve G-VERSION-COMPAT. Reviewer “Classification A” is not an IH-005 architecture classification.

Forward only normalized authorized context: repository/policy/base identities, one authorized scope and exclusions, necessary contracts, relevant accepted decisions, exact findings, evidence, environment and task-specific constraints. Exclude brainstorming, future concepts, aesthetic discussion, deferred observations as implementation requests, and unrelated chat history. A Human idea enters engineering context only after explicit promotion and authorization, recorded with attribution, scope and base. Reviewer suggestions cannot promote it. Templates in PACKETS are the allowlist; source documents are read for necessary contracts, not wholesale conversation forwarding.

## Replay and automation boundary

Events only wake reconciliation. Before a side effect, reread refs, PR state and receipts; bind an action key to repository, authorization, role/action, immutable candidate, finding group and attempt. Persist intent/packet identity before dispatch; discover any existing result after an interrupted response. Duplicate or stale events must produce a no-op or the same outstanding action, never duplicate dispatch, acceptance, bookkeeping or merge. Do not infer success from dispatch acknowledgement. Unknown outcomes pause redispatch until checked.

v1 is a read-first Coordinator with explicit Human Slice authorization, immediate technical review routing, repair/re-review routing, manual dispatch **fallback transport** where adapters remain unverified, and Human-controlled acceptance and merge. Manual copy/paste is not a permanent semantic requirement. A later VERIFIED isolated adapter may replace transport without changing authority, context boundaries or transitions.

v2 requires separately authorized, verified technical dispatch automation. Verification must demonstrate isolated contexts/checkouts, durable outputs, dispatch/status/result recovery, duplicate and crash handling, expected-head publication and late-writer exclusion. v3 requires separately delegated additional autonomy. Neither is installed here; no Work-to-Codex bridge or exact-once execution capability is claimed.

No Coordinator runtime workflow, Codex Action, scheduled Work task, webhook, secrets, variables, repository setting changes or external task IDs are installed. Existing Pages automation is preserved. Future event adapters may map PR readiness/updates to submission reconciliation, review events to verdict validation, comments to attributable controls, closed events to merged/unmerged checks and CI events to exact-head evidence. They must always read current truth; no event, CI check, label or generic GitHub approval itself advances product authority.
