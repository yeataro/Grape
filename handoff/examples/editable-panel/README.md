# Editable Panel through the public shell seam

**THIS IS NOT THE PRODUCTION IMPLEMENTATION.** `panel.ts` is a feature contribution, not a Canvas implementation. Its fake control surface is qualification-only; production chooses UI technology independently.

Register `editablePanelType` on the same `PanelWorkspace` as a read-only Panel. Bootstrap supplies an **application-owned** `ApplicationPanelCommandAuthority` as the workspace's fourth constructor argument; it grants and executes the already-defined `grape.editor.move-target` application intent. No feature imports a Graph, History or Draft.

`PanelType.commandIds` requests command access; it grants none by itself. At mount the generic `PanelRenderer` asks `workspace.bindPanelCommands(panelId, mountAuthority)` to create an identity-bound command handle. The feature receives only `PanelMountContext.commands`, or `undefined` when no commands were requested or no application authority was supplied. Application policy is rechecked per invocation and may still reject the command. `PanelServices` remains the read/routing service; it is not an unguarded model editing shortcut.

The service takes the current `PanelUpdate.lease`. It infers origin and scoped target itself; the feature cannot submit another Panel's origin, Context or Graph. Application command validation still determines legal payloads/targets. `execute` is one semantic edit; `beginGesture → update* → commit` is one application-owned Operation, while `cancel` compensates it without a History entry. Existing scoped Parameter widgets keep their own established write contract.

Events use `scope.event`; capture, render, Promise continuations and retained handlers from old mounts cannot edit. Origin gesture preflight still refuses close/retarget. Losing a mount's event route through move/hide/renderer detachment/failure **cancels an unfinished pointer gesture** through its existing application operation. It does not dispose the Panel, erase private viewState, or cancel Widget field drafts. A remount starts a new gesture only after a new user event.

This is an in-process contract boundary, not a hostile-code sandbox. Feature modules must not retain an out-of-band Graph or mount authority from bootstrap. Ordinary extension wiring changes its feature registration only, not Graph/History or unrelated workspace code.

Direct executable evidence: `node --test executable-reference/repair/panel-commands.test.ts`. Application command fixtures in that test deliberately cover one root-node move command; they are not a production command enumeration or promise that nested scope commands are unavailable.
