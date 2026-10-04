This PR publishes the currently tested S05 delivery: function-mode subgraphs and their constant/Uniform handling, document import/replacement corrections, four fixed-value nodes (Float, Vector2, Vector3 and ColorRGBA), and the measured drag-performance improvement. Snapshot reuse is limited to one synchronous editor read; existing publication, validation and History protections are retained.

The candidate is implementation `aa4c86e20b0b4b54218b9992921578e7f24a28a2` (I6), reviewed submission `6c3a734325d0db2d924356a9614e971d80a966c8` (R6), build `S05-drag-aa4c86e`. Any later publication commit contains only evidence/status bookkeeping. The Owner confirmed the current round and explicitly requested this PR; the in-progress Escape repair is excluded and preserved for the next round.

Validation and limits:

- Earlier independent PASS reports remain bound to their original candidates, including function-mode/Uniform, legacy import, replacement eligibility and fixed-value deliveries.
- The I6 independent review executed 227 unit/contract checks, local browser/archive flows and drag-performance measurements. Its overall verdict remains **BLOCKED**, because the two exact LAN/Tailscale archive checks were denied by automatic tool approval and were not executed.
- A subsequent independent check found that natural Escape can lose Canvas keyboard focus during dragging. The Owner explicitly deferred this finding to the next round; the original FAIL evidence is preserved. The uncommitted fix and its tests are not part of this PR.
- Local preview delivery and archive hashes were checked. This is not a claim of LAN/Tailscale availability, native GPU/TouchDesigner qualification, complete catalog parity, whole-S05 completion, or merge approval.

Evidence: `production/evidence/s05/review-06/independent-review/`, `production/evidence/s05/review-06/escape-focus/`, and `production/evidence/coordinator/s05/owner-pr-01/`. The draft status makes the outstanding independent-review limitations visible while publishing the Owner-requested candidate.
