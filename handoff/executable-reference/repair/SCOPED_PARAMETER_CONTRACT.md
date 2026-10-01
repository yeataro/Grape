# M01: scoped Inspector contract (IH-002)

Status: **EXPERIMENTAL, IMPLEMENTED IN EXECUTABLE REFERENCE, FOR INDEPENDENT RE-REVIEW.** Not production implementation. This additive contract supersedes only the root-only Inspector limitation; the 37 sealed files remain unchanged.

## Reason, before and after

The executed `M01-RED` counterexample constructs a real nested network occurrence. AC-002 `NestedNetworkEditorQualification.parameter('multiply','b')` reads and writes it, but `ParameterWidgets.project(context,'multiply','b')` throws `MISSING_NODE`. A same-ID root node could also be selected by the old projection. Scoped writing plus root-only reading is not a closed Inspector contract.

IH-002 adds `ScopedParameterTarget` as the single reference for spec, value, resolved port/type, link state, projection and mutation. `ScopedParameterWidgets.projectTarget` accepts it. Widgets/renderers never traverse Graph/resources. The additive registry retains `ParameterWidget`, `ParameterProjection` and `ParameterView` descriptions. Production should implement one scope-capable generic registry, not a second nested-specific renderer.

Affected invariants are strengthened, not reversed: Graph is canonical; Context owns navigation/selection only; local definitions can be shared by occurrences; Graph mutation/History is the only document change path; UI draft text is not model truth; projection never edits Graph. Host, generation and persistence formats are unchanged.

## Public surface

```ts
interface ScopeRef {
  graphId: string; loadId: string; contextId: string;
  stageId: string; networkPath: readonly string[];
}
interface RoutedContext {
  context: EditorContext;
  subscribe(listener: () => void): () => void;
}
captureScope(context): ScopeRef
inspectScopedObject(context, scope, {kind:'node', id}): Result<metadata>
ScopedParameterTarget.openRouted(routedContext, nodeId, parameterKey, scope?): Result<Target>
target.capture(): ScopedParameterSnapshot
target.spec; target.read(); target.write(json, operation?): Result<void>
target.commit(json, expectedEditToken, operation?): Result<void>
target.subscribe(listener): unsubscribe
target.dispose(): void
widgets.register(ParameterWidget): void
widgets.projectTarget(target, presentationOverride?): ParameterView
new ScopedFieldDraft(target) // text, composition, commit(parse), cancel
```

`open(context,...)` and `refresh()` are compatibility helpers for sealed/headless fixtures, not canonical UI acquisition. UI uses `openRouted` with observable Context. Every successful navigation/dispose publishes synchronously; coalescing an away-and-back navigation into no event is prohibited. Captured navigation revision also prevents lazy headless lookup from reviving after navigation ABA. Scope identity is session-local, not a permanent serialized Graph identifier.

The public Panel targeting service supplies the effective Context/scope. Follow uses provider Context; pin uses a centrally retained scope Context. Panels must not implement pinning by traversing resources or constructing hidden Contexts. Different effective Context IDs are explicit routing results. The targeting service owns retained Context release; fields dispose only their leases.

## Responsibilities and ordering

| Operation | Preconditions / ownership | Postcondition / notification / failure |
|---|---|---|
| Acquire | Live borrowed Context; exact graph/load/context/stage/path; existing Node/Parameter; occurrence chain resolves | Immutable scope and view-local lease; captures resource-chain/NodeType identity/navigation revision. Failure returns Result without model mutation/subscription leak. Initial capture has no event. |
| Capture / project | Live lease; same occurrence chain; parameter/port exists | One immutable synchronous snapshot holds spec/value/port/type/local links/writability/token. No History. Wrong scope/missing target invalidates and throws. Never fall back to root lookup. |
| Begin draft | Successful capture | UI owns only text and baseline token. |
| Commit | Exact token; writable local non-resource input or state parameter; live scope; existing Operation rules | Delegate existing Parameter mutation. Graph validates/reconciles/diagnoses/publishes; one History entry or explicit grouping Operation. Failure changes no model/History and retains text. No implicit disconnect/coercion. |
| Model event | Graph published; Context projections reconciled | Same-target capture; relevant change increments edit epoch and emits `updated`; missing/rebound owner emits terminal `invalidated`. Unrelated position changes retain draft validity. |
| Navigate / dispose Context | Public observable Context publishes after successful operation | Old scope lease invalidates immediately; no UI polling/refresh. Routing can acquire new target. |
| Close / retarget field | Caller owns lease, borrows Context | Idempotent dispose unsubscribes Graph/Context; one invalidation; no model/History/Context destruction. Another target needs another lease. |

Events are synchronous and their descriptions are immutable. Trusted observers must remain read-only except for their own lease cleanup. The actual guards have specific scope: Graph rejects writes during Graph publication; Context/workspace reject re-entry through their own public APIs. Standalone Context/dispose notifications do not install a global Graph lock or security boundary: an untrusted callback holding another Graph reference could still attempt model mutation outside Graph publication. Do not claim that all external callback mutations are runtime-blocked. Observer errors are isolated in `observerErrors`; a committed edit does not become a failure. If an observer disposes during an update, later observers receive invalidation and never that old update afterward. Subscription does not emit an initial value; capture and subscribe before yielding control.

`capture()` failure follows existing Parameter queries (throw with code); acquisition/writes/draft commits return `Result`. `invalidated` includes a code; later reads/writes fail. A successful library copy-on-write can invalidate the old lease during publication; commit still returns success. Reacquire before more edits and never replay the successful mutation.

## Identity, sharing, stale edits and persistence

Logical target: `(Graph load, Context, Stage, occurrence path, Node ID, Parameter key)`, with entire resource chain and pinned NodeType checked internally. A/B occurrences have distinct view identities but one stored local-definition value. Editing A updates B and conflicts B's pending draft; this does not introduce per-occurrence storage.

Deleted paths, ancestor rebinding, another load with identical saved IDs or replaced NodeType cannot redirect a lease. Undo restores model, not old view leases. Surviving interface changes update projections; old draft tokens fail even if numeric value/ParameterSpec remain equal, because resolved type/link state participate. A lease edit epoch prevents value/type edit followed by Undo from reviving a stale draft. Position-only edits do not conflict.

Active connections make local input editing read-only. Invalid-link evidence is visible with `invalid:true` but not treated as a working connection. Model remains responsible for value validation/reconciliation; presentation cannot maintain another defaults store.

Leases, draft text, tokens and observers are neither serialized nor undoable. Successful writes/forks are ordinary saved and undoable Graph mutations. Load/model replacement or retarget requires disposal/reacquisition via targeting.

## Direct validation and observed failures

- `M01-RED`: actual old root-only renderer rejects writable nested target (expected failure observed).
- `M01-01..03`: root and nested closure, local links, shared occurrences, Undo and cross-view draft conflict.
- `M01-04..06`: colliding root/nested IDs; deletion/Undo; wrong load; path/Context invalidation.
- `M01-07..09`: removed input; same spec/value with changed GLSL type; new connection vs unrelated movement.
- `M01-10..12`: library fork success/invalidation; widget fault/immutability; preserved invalid links.
- `M01-13..14`: observable navigation ABA/disposal without UI refresh; ancestor replacement preserving leaf definition.
- `M01-15`: actual adversarial failure: first draft implementation delivered terminal `invalidated` then stale `updated` to a later observer when another observer disposed during dispatch. Repair stops pending update delivery after invalidation; direct regression executes this ordering.
- `M01-16`: value edit/Undo ABA rejects old draft.
- `HW01..05`: existing widget behaviors retained; same controller for root/nested; mismatched action Context rejected.

A test fixture initially omitted a required input boundary in its nested wrapper and was rejected. The fixture was corrected; the architecture was not relaxed. Full regression is recorded in revision audit. These checks do not prove DOM/device parity or production performance.
