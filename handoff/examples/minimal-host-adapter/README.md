# Minimal receiving-host adapter example

**THIS IS NOT THE PRODUCTION IMPLEMENTATION. This is a fake in-memory provider, not a TouchDesigner adapter.**

`MemoryArtifactExecutor` implements the exact sealed `ArtifactExecutor` interface. `prepare` creates a disposable candidate without publishing it. The existing `FencedArtifactReceiver` owns intent/lease/revision checks, retry receipts and current-value reconciliation, then invokes `commit`. The example does not add transport, credentials or a second Graph.

```powershell
# From the handoff root; Node 25.5.0, no npm runtime dependencies
node --test examples/minimal-host-adapter/example.test.ts
```

Three tests verify idempotent retry, current host value preservation, prepare-failure retention, and stale Target lease rejection. They prove no TD thread safety, native resource atomicity, rollback guarantee, IPC security, cross-process cancellation, restart recovery or real deployment. A real provider must satisfy those separate integration gates; returning `committed` from this memory fake cannot be used as their evidence.
