# M1 workflow-policy repair evidence

Prior reviewed PR #3 head: `5d8d15bbfea440cb626fc40a31df63a2e9ca1ba8`.
Repair implementation candidate: `0f164cbba205a981f2ff21f5b402cd6ca4db42ee`.
The evidence-only commit adding this index/checkpoint is the submitted descendant; its exact SHA is recoverable from Git history and recorded in PR #3. No product implementation or acceptance bookkeeping occurs here.

The Human reported Fresh Independent Workflow Review **FAIL / NOT_ELIGIBLE**, with no BLOCKER and one MAJOR: M1, the retry-reset exception could evade the approved budgets. This submission does not issue an independent review verdict or close M1 on the reviewer's behalf. It is ready for targeted Fresh Independent Workflow Re-review.

The narrow repair removes reset permission for changed diagnostics/evidence. Counts remain attached to the same underlying operation (initial attempt plus at most two retries) or finding group (at most three unsuccessful rounds). Only an established genuinely different operation/actionKey or independent finding group gets a separate counter. Renaming, changed symptoms, attempt identifiers and reframing cannot establish independence or evade exhaustion. Exhaustion remains workflow/technical diagnosis, never automatically a Human Gate.

[checkpoint.json](checkpoint.json) records the exact policy diff, revision bindings, commands/results, protected boundaries, hashes and limitations. [results.json](results.json) records six executed regression traces from [regression.py](regression.py):

| Case | Observed implementer regression result |
| --- | --- |
| M1-A | Same group: two rounds → five diagnostic changes retain two → third unsuccessful round pauses for technical diagnosis; fourth refused |
| M1-B | Same operation: initial attempt plus retry one → five diagnostic changes retain one → retry two pauses for workflow diagnosis; retry three refused |
| M1-C-operation | Established independent operation starts at zero; old exhausted operation remains at two |
| M1-C-group | Established independent group starts at zero; old exhausted group remains at three |
| M1-C-renamed-operation | Renamed actionKey retains exhausted count; unestablished identity gets no fresh counter |
| M1-C-renamed-group | Reframed/renamed group retains exhausted count; unestablished identity gets no fresh counter |

All six traces satisfied their assertions, including duplicate delivery and serialized restart before/after each event receipt. Two negative controls deliberately applied the old reset behavior; both were detected at the first diagnostic event. The model uses explicit synthetic identity distinctions; it does not claim an automated real-world independence classifier or live dispatch verification.

Required validation was executed:

- Original `python3 production/evidence/coordinator/install-v1/replay.py`: rerun before edits at the prior reviewed head, exit 0, nine cases/20 variants, output byte-identical to the original results. It was also rerun on the repaired tree and exited 1 at its pinned historical policy-byte guard. This expected incompatibility is retained in the command record; the original script/checkpoint/results are unchanged. Its old counts do not cover M1; the new fixture does.
- `node tools/verify-bootstrap.mjs`: exit 0, 463 checks, no errors, 412 frozen files verified.
- `node handoff/tools/check-implementation-state.mjs --current`: exit 0, CURRENT_RECORD_VALID, no errors.
- `node --test --test-isolation=none tools/verify-bootstrap.test.mjs`: exit 0, nine tests succeeded, zero failures/skips.
- `python3 production/evidence/coordinator/install-v1-repair-m1/regression.py`: exit 0, six traces and two legacy negative controls satisfied.

Run the targeted fixture explicitly from repository root; it prints JSON and performs no writes or dispatch. Redirect reruns outside immutable evidence directories. Actual Node was v24.19.0; no accepted Node 25.5.0 product qualification is claimed.

All 575 prior tracked files outside the two authorized policy files were byte-compared unchanged, including original install-v1 evidence, handoff, implementation-state, product source/tests/tools, accepted S01/S02 evidence, AGENTS and existing automation. No unrelated policy edit, runtime automation, active Slice, product/architecture decision or Gate mutation was introduced. S03+ remains unauthorized. PR #3 remains unmerged.
