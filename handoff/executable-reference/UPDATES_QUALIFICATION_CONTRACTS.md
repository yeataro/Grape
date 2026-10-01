# Updates qualification contract (experimental, AC-002)

## Gap and counterexample

`Graph.subscribe` alone cannot implement operation-end scheduling: fifteen changes in one explicit operation are observable, but committing it publishes no further model change. Polling History or asking every UI button to manually notify Updates violates the existing boundary. Graph adds an isolated operation-end notification; History remains a consumer of Graph operations, never the scheduler. The pre-extension API absence is a design counterexample, not a fabricated failed executable test.

## Ownership and operations

Graph owns its document, monotonic revision, history, operation lifetime and notifications. A Graph-scoped `Updates` owns disposable jobs/cache per generation profile. It holds no second editable document and no host value. Its compiler reads the captured immutable snapshot. A receiver Binding owns delivery progress independently; receipt `request` is fresh even when generated content is reused.

`flush(profile)` captures the calling revision and returns generated/blocked/failed/superseded/disposed for that request. It does not wait indefinitely for later edits and does not clear a global dirty flag. At most one compiler runs per profile; one replaceable latest wanted request remains. Replaced pending requests resolve superseded. A late running result is rejected when the current semantic key changed, even if no newer flush was called. Validation always runs against the full current graph before accepting cached output. Compiler throws become failed receipts; a retry is permitted.

`manual` makes no automatic request. `operation-end` requests after commit/cancel and undo/redo; work starts outside synchronous Graph notification. Each published model batch remains visible to EditorContexts. Multiple changes may thus be one history entry, many UI updates, and one generation. `dispose` drops pending demands and subscriptions and rejects results when running work finishes; it cannot promise cancellation of an external compiler.

The deferred automatic task checks Graph.busy again: a later gesture can start before its microtask runs. In that case the next operation-end requests the final state. A fresh compiler result must match the captured loadId and revision before it enters the cache. Internal cache reuse may retain the original artifact.revision as provenance; receipt.revision/request identify the new demand. A generated receipt includes the detached document from that SAME demand. A Binding must use this document, never pair old code with a later `graph.exportJSON()`.

Precondition: live Graph and pinned definitions, known compiler profile. Default compiler only supports its existing experimental GLSL profile; profile strings separate scheduling lanes and do not prove native backend support. Postcondition: receipt identifies captured load/revision/request. No operation here mutates Graph or creates history. Cache is not persisted; exportJSON always reads current full document independently of jobs. Undo/redo produces new Graph revisions and fresh delivery intentions.

Known presentation fields (graph/node names, node positions) are excluded from shader demand key because baseline symbols derive from stable identity. All unknown fields/resources/module state invalidate conservatively. Debug-view/export that needs a different naming policy must use a separately keyed compiler profile; a module cannot suppress invalidation of arbitrary state. No generic content hash is an ACK.

## Verification scope

UQ01–UQ05 execute real Graph operations and scheduling, including failure, coalescing, independent profile lanes and disposal. UQ06 joins Graph, real minimal GLSL generation, Updates and the fake receiver executor: A→pending B→Undo A establishes a fresh receiving-side sequence; late B cannot overwrite A. It proves the protocol model, not TD's ability to stage/commit/rollback resources. Timing performance, real host commit atomicity and browser networking remain unresolved environment evidence.

UQ07 reproduces and closes the queued-operation-end/later-gesture race. UQ08 and UQ09 address the independent host review's executed counterexamples (retained in `architecture-coverage/qualification/host-review-updates-output.jsonl`): mixed new document/old shader and stale compiler provenance. Cache holds at most eight content entries per profile; this is an experimental bound, not a performance claim. Full regression is required after these corrections.
