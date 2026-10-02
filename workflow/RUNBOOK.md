# Coordinator v1 operational runbook

Apply [COORDINATOR](COORDINATOR.md) and [PACKETS](PACKETS.md). Procedures describe already-authorized work; they grant no new authority. Phase names are derived, not a new state database.

## Fresh restart without chat history

1. Read root README, AGENTS, Coordinator policy and root current state. Fetch remote main/work and relevant PR metadata. Pin exact SHAs; do not assume a cached remote-tracking ref is current. If shell transport fails, an authenticated GitHub connector may supply Git objects/refs; record the actual transport and verify resulting identities.
2. Read HANDOFF_ACCEPTANCE and verify indexed bytes using root read-only commands. Read relevant IH-005 contracts and referenced accepted evidence/decision hashes. Recover completed scopes, residual Gates, active Slice and authorization receipts. Never infer acceptance from `status: complete` alone.
3. Inspect local status, local/remote heads, ancestry, unique commits, pending submissions, review/acceptance/merge controls and PR merged facts. Preserve unpublished changes. If an active Slice exists, recover its phase; do not synchronize it away or activate another.
4. Recover explicit writer ownership and any outstanding action intent/result. Unknown prior dispatch status means `WF_DISPATCH`; determine its outcome before replacement. Reject stale scope/revision bindings and packets polluted by speculative context.
5. Derive one phase and one next action, or a named wait with resume condition. Report exact facts, limitations and action. When no Slice is authorized, wait. Maintenance may synchronize branches only within its authorization.

Read-only root checks: `node tools/verify-bootstrap.mjs`, `node handoff/tools/check-implementation-state.mjs --current`, and `node --test --test-isolation=none tools/verify-bootstrap.test.mjs`. Record actual Node version; accepted qualification used Node 25.5.0. A different runtime's result must not be presented as equivalent product qualification. Never run write-producing frozen qualification tools in place.

## Branch and publication protocol

Before activation, compare remote main/work by commit ancestry, not tree equality alone. Work equal to accepted main needs no write. With no active Slice and zero work-only commits, fast-forward normally and push without force; fetch/read back and require equality. Unique/divergent/unaccounted work means **WF_BRANCH_DIVERGENCE**: stop branch mutation, preserve all commits and local changes, and diagnose ownership/integration. Do not reset, force-push, delete, silently cherry-pick around or discard it. Main must itself have valid acceptance; an unexpected merge is not an accepted baseline automatically.

For every write, the designated publisher must check the expected main, work/PR head and relevant receipts immediately before publishing. A normal non-force update must descend from the current remote head. A changed head rejects the stale publication even if a push could fast-forward mechanically. Preserve the candidate separately, reconcile intervening Human commits, rebase/integrate only with established authority, and refresh review for changed content. Never overwrite concurrent Human changes. If main changes, pause dependent publication and assess the accepted integration baseline and authorization binding.

Open one relevant work-to-main PR for the authorized run; reuse its identity for updates. A closed/unmerged PR is not completion or merge. Preserve work; stop pending publication against it and reconcile the reason before reopening or creating a replacement. Do not create duplicates after an ambiguous response: query current PRs first. PR descriptions and old “not merged” wording are historical prose; GitHub merged status and Git ancestry establish merge.

## Submission, review and bookkeeping

Implementer readiness requires an exact implementation revision, submission/PR head, source/configuration and evidence manifest, build identity, environment, scope, exclusions, negative behavior and required checks. Missing fields return for evidence completion. Ready submissions route directly to a fresh isolated reviewer; there is no Human pre-review. Manual fallback means an operator transports the unchanged bounded packet and returns the report; it does not grant product approval.

Validate independent review attribution, context isolation, exact candidate and implementation, evidence hashes, coverage, findings and limitations before accepting a technical verdict. Missing/malformed reports or required unexecuted checks cannot PASS. Ask the reviewer to correct evidence; do not fill missing counts or identity yourself. Historical owner-reported S01/S02 verdicts remain valid historical records with their explicit null provenance; never retroactively represent them as direct reviewer transcripts.

Technical FAIL routes to bounded Implementer repair with finding IDs/counterexamples and accepted expected behavior, then targeted Fresh Review plus affected regressions. Do not broaden numeric admission, UX, platform or other scope to hide a defect. A changed candidate requires coverage for the change. Technical PASS produces a Human acceptance control, not an acceptedEvidence mutation.

Keep three identities distinct: **I** = implementation revision, **R** = exact independently reviewed submission head, **B** = later bookkeeping descendant. After explicit Human acceptance, the designated maintainer may record the acceptance and completion in the existing current-state schema. B must descend from R; validate its diff contains only acceptance records, state and status documentation, with all reviewed source/tests/tools/configuration/build and original evidence unchanged. Bind evidence to I/R, never claim independent product review of B. Any material change ends this exception and requires fresh review. Validate temporary state completely before atomic replacement; on failure retain the prior valid file. This maintenance task does not perform product bookkeeping.

Separate merge control must bind PR, expected main, B/current work head and accepted scope. Recheck controls, diffs, checks and refs immediately before merge. After response loss, query GitHub and ancestry before doing anything again. A verified merge returns to recovery/safe synchronization and waiting for a separate next-Slice authorization.

## Exceptions and retry budgets

| Condition | Classification and single next action | Must not do |
| --- | --- | --- |
| Stale publication or concurrent Human commit | `WF_INTEGRITY`: retain candidate, reread refs and reconcile intervening work | Overwrite or silently drop commits; apply old PASS to changed content |
| Unique/divergent/unaccounted work | `WF_BRANCH_DIVERGENCE`: stop mutation and diagnose preserved branches | Reset, force-push, delete or discard |
| Technical FAIL | `REPAIR_REQUIRED`: repair identified findings then targeted re-review | Ask Human to pre-review or invent a Gate |
| Missing/malformed review or hash/scope mismatch | `REVIEW_PENDING` with integrity wait: obtain corrected revision-bound evidence | Infer PASS from green CI or generic approval |
| Runtime/browser/dependency mismatch | `WF_ENVIRONMENT`: establish declared environment and rerun required checks | Claim unexecuted checks passed or equate environments |
| Network/auth/rate-limit failure | `WF_ENVIRONMENT` or `WF_PERMISSION`: reconcile ambiguous outcomes; bounded retry when transient | Blindly retry writes, expose credentials, alter repository settings |
| Closed, unmerged PR | Workflow pause: retain work and reconcile closure/control | Mark merged/completed or silently recreate PR |
| Unexpected merge without acceptance | `WF_INTEGRITY`: preserve facts, inspect actual merge/content and missing controls | Invent acceptance, automatically undo Human work or start next Slice |
| Stale/duplicate/out-of-order event | Reconcile current facts; no-op if action already exists or is obsolete | Repeat dispatch/bookkeeping/merge |
| Pages preview differs from candidate | `WF_ENVIRONMENT`: verify deployment commit and artifact hash, obtain matching preview if needed | Use preview success as technical PASS or acceptance; change Pages configuration implicitly |
| Crash during bookkeeping/push | Reread local candidate, remote head, state and receipt hashes; validate existing publication or retry only missing authorized action | Regenerate accepted evidence or duplicate acceptance; infer push success |
| True contract/product decision conflict | `HUMAN_GATE_WAIT`: preserve minimal counterexample and request scoped decision through IH-005 | Rewrite product contract/tests to pass or block unrelated authorized dependencies |

Allow **up to 2 retries** after the initial attempt for the same transient dispatch/environment operation. Reconcile any ambiguous side effect before each retry. Authentication requiring reconnection pauses for mechanical assistance; retry is not a substitute for access. Allow **up to 3 unsuccessful repair/re-review rounds per finding group**, then pause for technical diagnosis with findings, attempted repairs and observations. Record accumulated counts in immutable per-run receipts so a restart cannot reset the budget. New diagnostics, changed symptoms, additional logs, changed error messages or new evidence about the **same underlying operation or finding group MUST NOT reset its accumulated count**. After the second retry or third unsuccessful round, stop further attempts for that identity and enter `WF_RETRY_BUDGET` for workflow or technical diagnosis respectively.

A fresh counter is permitted only after the Coordinator establishes a genuinely different transient operation/actionKey or a genuinely new independent finding group. Another attempt, a renamed/reframed unresolved group, or changed wording, label, packet or actionKey spelling alone does not establish a new identity. Attempt-specific dispatch identifiers remain attached to the same underlying operation's accumulated budget. Record the identity distinction and its basis; retain the exhausted prior identity and count. New-identity classification MUST NOT be used to evade exhaustion. Exhaustion remains a workflow/technical diagnosis pause, never automatically a Human product/architecture Gate, acceptance or finding closure.

## Transport recovery

Persist normalized intent, action key, packet hash and expected heads before dispatch, and retain the actual result/provenance after it returns. These are immutable evidence receipts, not competing project-state truth. With manual fallback, retain the launch receipt and delivered report; if launch success is unknown, reconcile with the operator before relaunching. No unverified adapter/job identity may be fabricated.

A later authorized adapter must demonstrate isolation, durable collection, status discovery after dispatch-response loss, at-most-one outstanding action, guarded publication and exclusion of late writers. Its tests must include crash after launch before receipt. Current policy dry runs do not prove those runtime capabilities. Existing Pages events may or may not follow connector publication; verify actual deployment rather than assuming a trigger ran. No automation enrollment, polling fallback or settings change is authorized by this runbook.
