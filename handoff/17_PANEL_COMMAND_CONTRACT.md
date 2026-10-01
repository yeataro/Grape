# Editable Panel command contract

Status: **EXPERIMENTAL BUT CURRENTLY ACCEPTED**, IH-005. Additive closure of the editable-Panel seam; `contracts/panel-commands.ts` and the `PanelMountContext.commands` shape are production-facing. Executable qualification is not production implementation.

## Ownership and composition

Application owns commands, validation, Graph Operation/History, and gesture origin tracking. Workspace owns Panel instance identity/routing and binds command access to that identity. Shell owns the mounted-event guard. Feature owns only its view, private viewState and event handlers. No Graph, Draft or Operation is passed to a Panel command callback.

`PanelType.commandIds` declares requested application command IDs. Bootstrap supplies the existing application's command authority; requests are not grants. A Panel with no request, or workspace without that authority, receives no commands. Application `allows(typeId,commandId)` is checked on each execution and gesture update/commit. Ordinary extension registration does not add a central Panel type switch.

Public path:

`PanelType registration → workspace instance/target lease → PanelRenderer mount → workspace.bindPanelCommands(panelId, mountAuthority) → PanelMountContext.commands → application command validation → existing scoped editing / Graph Operation → coherent projection publication`.

`PanelServices` remains routing/read access. The earlier suggestion that it already supplied an editing method was incomplete: model-editing views use the mount-scoped command capability above. Borrowed Context access for existing `ScopedParameterTarget` integration does not authorize arbitrary direct Graph mutation. Widgets retain their existing scoped Parameter command boundary.

`bindPanelCommands` is shell composition, never a service given to feature code. A feature cannot choose the Panel ID, Context, Graph, or origin of the returned capability. The shell passes its exact mounted Panel ID; workspace captures the logical instance, independently of mutable Tab placement and display labels. Reopening the same ID does not revive an old capability. Mount guards and Panel instance checks are both necessary.

## Callable semantics

| Operation | Preconditions and mutation | Success / failure / lifetime |
|---|---|---|
| `execute(lease,{commandId,args})` | Live mounted synchronous user event; exact Panel instance; latest target/model publication lease; resolved same-load target; requested and application-granted command; command-specific payload/scope validation | Application executes one existing semantic command. No second model/History in Panel. Validation failure leaves no partial model mutation. Failure becomes the existing event issue and remains retryable after a fresh event/lease; never silently resubmitted. |
| `beginGesture(lease,intent)` | Same checks; application validates input before opening the Operation, then records supplied Panel/Context origin using existing origin preflight | Returns only update/commit/cancel capability. Application owns actual Operation. Failure must leave no orphan Operation or origin record. This contract does not specify how pointer events are collected. |
| `gesture.update(latestLease,args)` | Same live event and permission checks; latest lease can change after each published batch, but logical target/occurrence must equal begin target | Application validates and applies a batch in the same Operation. Invalid batch leaves current model/gesture unchanged; retry or cancel remains possible. No independent History entry per update. |
| `gesture.commit(latestLease)` | Same checks; same operation lifetime and target | Successful commit ends gesture and publishes one semantic History entry if changed. No-op obeys existing no-op semantics. Terminal only after success. Later calls reject. |
| `gesture.cancel()` | Live event for explicit cancellation; shell cleanup uses a separate captured cleanup closure, never this user-call bypass | Application compensates its own Operation and clears origin; no History entry. It cannot cancel another Panel's edit. Failed cleanup records an issue and must not force changes outside the application boundary. |

Command IDs identify existing application intents and their own validation contracts. The `args: Json` transport into that in-process application boundary is not authorization and not a new persistent command language. The position-panel example uses one root-node move as a bounded fixture; production Canvas commands use their already defined scoped editor behavior, not this fixture as a closed command list.

The caller supplies only the latest `PanelUpdate.lease` plus the intent. Workspace derives target/origin and verifies the Panel ID in the lease. Panel A using Panel B's lease is rejected. A retarget, document reload, changed occurrence, new target publication or close invalidates the old lease. The application independently validates the supplied resolved scope before applying a command. This is the trusted-module authority boundary, not an isolation sandbox against malicious modules importing private owners or deliberately sharing a capability.

## Ordering, render and event authority

Only handlers wrapped by the current mount's `scope.event` can execute commands. First mount, capture, update/render, ordinary asynchronous reply callbacks and a Promise continuation after the synchronous event returns do not confer editing authority. Event callback wrappers retained from revoked mounts become inert. Command handles captured from revoked mounts reject even if invoked inside some newer event.

Workspace's target/model publication advances the lease before `receive`; view projection updates synchronously. Thus after a gesture batch the contribution reads its new lease for the next batch. It does not forge/reconstruct leases or reuse the begin lease indefinitely. No model editing happens during `receive` or projection capture.

If render failure during a gesture batch revokes the mount, cleanup requests cancellation, then drains it when the active command call returns, after model publication. It must not reenter Graph from a notification. This is cleanup of the application-owned gesture, not deferred execution of a rejected UI command.

If shell cleanup runs during workspace placement publication (for example hide/move unmount), its cancellation may publish another model revision. Workspace must drain that pending model/target publication **before the initiating workspace action returns**. Both the initiating Panel and other Panels sharing the Context receive the new projection/lease; pre-cancel target leases and async replies are stale immediately. Routing only before shell listeners is insufficient.

## Close, move, hide and cleanup

- **Close/retarget while an active gesture owns the Panel/Context:** existing origin preflight rejects before disposal or route mutation. The Panel does not bypass it with `canClose`.
- **Move/hide/inactive Tab/remount/renderer detachment/failure:** logical Panel instance and private viewState remain as previously specified. Loss of the mounted pointer-event route cancels an unfinished **Panel pointer gesture** through its own application Operation. A new mount cannot continue that obsolete gesture; it needs a new user event.
- **Completed edits:** unmount never undoes already committed model edits.
- **Widget drafts:** unchanged. Existing uncommitted field text/composition stays with its established draft owner across unmount/remount. The pointer-gesture cancellation rule does not dispose or commit field drafts.
- **Panel close/replacement:** revokes target and mount capabilities before releasing feature resources. Old callbacks cannot write to a replacement Panel/document even if names or IDs are reused.
- **Persistence:** request metadata belongs to the extension; command/gesture/mount authority, event depth, runtime origin records and live leases are never serialized. Panel saved viewState and Graph document semantics stay unchanged.

## Direct qualification and scope

`executable-reference/repair/panel-commands.test.ts` PC01–PC13 prove application-owned edits, origin spoof rejection, read-only/request versus grant, event/async/lease fencing, single-operation gestures, close/retarget guard, cancel, move/hide/remount/renderer detach, same-ID reuse, render failure cleanup and ordinary extension dependency conformance. PC13 first failed against routing-before-listeners because cancellation advanced Graph revision without advancing Panel target leases; the corrected workspace drains cleanup publications before returning. Existing Panel/workspace/view/widget tests remain regression requirements.

No Graph or History source was changed. Fake mounting surfaces qualify these authority and lifetime semantics; actual browser pointer capture, focus, IME and device behavior remain at their existing runtime Gates.
