# Checkpoint and continuous contract delivery

Status: workflow transition prepared; checkpoint and continuous execution are **not activated by this document**.

## Owner direction and authority

The Human Owner authorized revising the workflow in the **Grape PM** chat (`01a1010f-2b35-7861-bb35-0e7e9b0b42a9`) on 2026-10-05. The normalized direction is:

- Complete and verify the existing Grape Refractor contracts as a working reference for Legacy.
- First preserve the current phase through a `work` to `main` PR and merge; that exact merge is the recoverable checkpoint.
- Continue on the existing `work` branch. Distinguish Slice work by commits; do not require a PR, merge or Human acceptance stop at every Slice boundary.
- Retain independent review, evidence integrity and final Human product acceptance.

This records workflow direction, not a claim that the checkpoint exists, S06 is accepted, publication is authorized for an unspecified candidate, or the full contract run has started. The Owner required the checkpoint **before giving the next execution instruction**. Preparing this policy must not resume dispatch, modify product code or perform Git publication.

After the checkpoint is verified and the Owner gives the end-to-end execution instruction, the Coordinator records that instruction once, with the exact checkpoint, policy revision, contract set and authorized scope. Do not ask for the same authorization again at each internal Slice. Until then, existing bounded authorizations, pauses and explicit controls remain in force.

This mode changes workflow routing only. IH-005 remains immutable; accepted product and architecture obligations, inherited decisions, real-environment requirements and scoped Gates remain binding. No frozen validator, product contract or historical evidence is changed.

## Precedence and the transition

When activated for a recorded run, this document takes precedence over the following **workflow** rules in [COORDINATOR](COORDINATOR.md), [RUNBOOK](RUNBOOK.md) and [PACKETS](PACKETS.md):

| Existing per-Slice rule | Continuous-run rule |
| --- | --- |
| One Slice authorization followed by another Human start control | One bounded contract-run authorization; Coordinator derives and dispatches its internal batches |
| Each activation starts from work equal to accepted main | First batch starts from the verified checkpoint; later batches use a revision-bound, independently reviewed engineering baseline on work |
| At most one active Slice | One designated writer and one bounded write assignment at a time; activated scopes awaiting final acceptance may span multiple Slice IDs |
| Technical PASS always waits for Human acceptance | Record the exact technical result and proceed to the next eligible authorized batch |
| One work-to-main PR and merge between Slices | No intermediate PR or merge requirement; commits and review receipts distinguish batches |
| Any main merge implies accepted product scope or an integrity incident | The explicitly authorized initial checkpoint may preserve honestly unaccepted work; its merge is not product acceptance |

All other protections remain: exact scope and revision binding, independent review, guarded publication, preserved divergent work, one state maintainer, no fabricated acceptance, no silent contract changes, and scoped handling of genuine Human Gates. The old per-Slice route remains the default outside an activated continuous run. Historical v1 evidence describes its original policy, not proof of this mode.

## Establish the checkpoint first

1. Reconcile actual writer/reviewer status and pending work. Establish a stable capture boundary; do not snapshot while another writer can publish changes into it.
2. Inventory committed, modified, untracked and relevant ignored content. Preserve necessary source, contracts, decisions, current state, evidence and recovery material. Explicitly account for excluded generated files and local configuration; do not blindly add caches, credentials or private machine data to Git. Required non-Git recovery material needs an identified backup or reproducible reconstruction.
3. Prepare the checkpoint candidate and a short recovery record: exact source/build identities, how to restore and start it, required environment, reviewed scopes, unreviewed or failing scopes and unfinished work. Preserve prior acceptance and review provenance. Do not label active S06 or a technical PASS as Human accepted.
4. Restore the candidate in a separate disposable directory and verify the recorded startup/build and a bounded smoke check. Record what actually ran and any unresolved recovery limitation. This is a recovery check, not full product acceptance or a substitute for required review.
5. Bind the existing or newly supplied Human publication control to repository `https://github.com/yeataro/Grape`, source `work`, target `main`, exact expected heads, review coverage and the checkpoint's explicitly disclosed status. Only then push, create/reuse the PR and merge with the existing head guards. Do not reuse an unrelated S05 grant. If product acceptance is pending, the control must explicitly permit preserving that unaccepted state; do not manufacture an acceptance receipt to satisfy the old template.
6. Verify the remote merge and retained content. Record its full commit identity as the checkpoint; a named tag is optional. Verify the merged tree matches the recovery-tested content; if integration changed it, repeat the affected checks. `main` is a moving branch name, so it alone is not the immutable recovery locator.

Continue on **the existing work branch**. Reconcile it with the actual merge using a normal ancestry-preserving update when needed. No additional long-lived branch or worktree is required. An isolated recovery/review directory is verification infrastructure, not a second product workflow. Never reset, force-push, discard unique work or silently omit uncommitted results.

## Pin the contract run, then keep working

The Coordinator binds the Owner's execution instruction to IH-005 and the accepted amendments at the checkpoint. Build a requirement-to-evidence inventory covering unfinished obligations, including residual scope from previously bounded accepted Slices. Existing completion records do not prove that every requirement under that Slice ID is delivered. Explicit non-goals, withdrawn behavior and deferred obligations retain their accepted disposition; new ideas are not automatically added.

The inventory is an immutable, revision-bound run artifact, not a second mutable project-state database. It identifies requirement/source, applicable amendment, batch/Slice, existing coverage, remaining work and relevant Gate/environment. Ordinary implementation decomposition does not require another Human decision. A genuinely ambiguous obligation still follows the accepted decision procedure.

For each bounded batch:

1. The Coordinator dispatches normalized scope to the designated Implementer, using the current reviewed engineering baseline and exact expected work head. Necessary path/packet corrections within that scope are ordinary coordination, not a new product decision.
2. The Implementer commits the implementation and evidence with Slice/batch identifiers, exact build/environment and honest limitations.
3. A Fresh Reviewer independently reviews the exact submitted revision in an isolated context and checkout. A PR is optional metadata, not a review prerequisite. FAIL returns to bounded repair and targeted re-review, including affected regressions.
4. The Coordinator collects and validates the actual result. A valid PASS permits dependent engineering work under the same run authority. Record it as **technical readiness**, not Human acceptance, and proceed without requesting a per-Slice preview, PR, merge or start approval.
5. Keep work backed up by normal pushes within the recorded run publication authority. Reconcile remote heads before publishing. Local commits alone are not a remote backup. No intermediate main merge, release or repository-setting change is implied.

Only revision-bound reviewed outputs may satisfy a technical prerequisite. A blocked branch does not block unrelated authorized work, but mocks, unexecuted checks and absent Host evidence cannot substitute for its required outputs. Necessary regression coverage continues across batches; old PASS results are not silently carried across changed code. Final delivery requires integrated evidence at the final candidate, not merely a collection of earlier PASS labels.

The Coordinator owns continuation and result collection, not just dispatch. After every completed action, recover facts and select the next eligible action. A sent message is not proof of a running worker or completed task. Preserve unresolved action identities on interruption; do not launch duplicates. Existing retry budgets require diagnosis at exhaustion, not fabricated closure or a routine Human product Gate. This document installs no background scheduler and promises no execution while all agents are idle.

## Preserve state and acceptance semantics

[implementation-state.json](../implementation-state.json) remains the sole mutable project-state record, written by the designated maintainer using the existing validator and atomic-update protocol.

- `activeSlices` describes activated scopes still awaiting accepted completion; it does not count simultaneous writers. Keep only actually activated IDs there, and never the same ID in both active and completed arrays.
- For newly reviewed but not Human-accepted work, keep technical results in immutable submission/review receipts. Do not put them in `acceptedEvidence`, move them into `completedSlices`, close a Gate or set overall `status` to `complete` merely to advance the engineering loop.
- If an already completed Slice must be reactivated for its previously undelivered scope, first preserve its exact prior completion entry in an immutable reactivation receipt and retain all accepted evidence. The maintainer then moves that ID from completed to active; the new scope does not revoke or widen the old bounded acceptance. This is part of authorized residual work, not permission to rewrite historical records.
- `implementationBaseline` and `build` identify the actual registered engineering candidate; they do not certify acceptance. Reference the run's registered authority and relevant accepted decisions using existing fields. Do not add unsupported phase/status fields or alter frozen schemas.
- After final Human acceptance, record only the exact accepted scope and supporting behavior/conformance evidence, preserving all unresolved exclusions and Gate limits. Formal completion remains separate from technical readiness.

## When to involve the Human

Proceed autonomously with ordinary implementation choices, defects, evidence repair and coordination inside the authorized run. Request Human input only for a concrete product/architecture decision, an action requiring Human credentials or physical access, a needed authority outside the run, or final overall acceptance. Pause only the affected dependency, and explain the exact issue and recommended resolution in plain language. An explicit later Human instruction to preview a particular candidate still takes precedence.

Before asking for final testing, prepare and verify the runnable candidate, display its build identity and provide the working localhost link plus a short, complete list of what the Human should test. Apply the accepted removal of LAN/Tailscale delivery prerequisites; do not silently revive historical obligations. Name the actual chat titles when referring to workers. Keep routine progress and unchanged waits out of Human notifications; report actionable blockers and completed delivery.

At the end, deliver the runnable implementation, contract-to-evidence coverage, final independent review, actual environment limits and remaining decisions or unverified requirements. Required gaps mean incomplete delivery. The Owner retains final product acceptance. A later final merge to main, if desired, needs applicable publication control; this policy does not create repeated intermediate merge gates or grant an unspecified final merge.

## Minimal bindings and verification

Reuse existing immutable packets/receipts rather than adding a service or mutable control database. For this mode, carry `workflowMode: continuous-contract` and bind:

- **Checkpoint record/control:** Human source, exact expected work/main, candidate and PR, disclosure of unaccepted scope, recovery record, verified merge SHA and optional tag.
- **Run authorization:** Human execution source, policy revision, checkpoint SHA, pinned contract/amendment set, scope/exclusions/inventory reference, designated Coordinator and writer, permitted commit/push destinations, and final-acceptance/main-merge boundaries.
- **Batch submission/review:** run authorization, Slice/batch, exact prerequisite revision, I/R/build/environment/evidence, findings and actual technical verdict. Set PR to `not required` when absent. PASS routes to the next eligible batch or final acceptance, according to this mode.

The workflow editor does not fill these with invented approvals or issue run receipts on behalf of the Coordinator. Missing checkpoint or execution authority leaves this mode inactive, not partially started. References become immutable at submission; reconcile any newer control before action.

Before activation, check these routing cases against the recorded controls: policy installed without checkpoint; checkpoint merged without run instruction; valid batch PASS without Human acceptance; technical FAIL; genuine scoped Gate; required Host evidence missing; restart after lost dispatch response; and final delivery with remaining required gaps. Expected outcomes are respectively no continuous start, no continuous start, next eligible batch, repair/re-review, pause affected dependency, retain blocked coverage, recover without duplicate dispatch, and no complete-contract claim. A document review of these cases is not a runtime automation or product PASS.
