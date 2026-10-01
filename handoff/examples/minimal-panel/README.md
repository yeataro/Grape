# Complete visible extension path — IH-004

The controller/projection sample below remains a qualification reference. A visible production extension also provides the required view/mount contribution. Start with [the complete four-feature examples](../view-contributions/README.md) and [the canonical mount contract](../../16_VIEW_MOUNT_CONTRACT.md). The shell never discovers a concrete class or calls an ad-hoc `project()` method.

# Minimal Panel contribution — IH-002

**THIS IS NOT THE PRODUCTION IMPLEMENTATION.** This is the canonical ordinary Panel extension example, now composed through the same public workspace contract as every Panel. The former independent `PanelTemplateHost` has been removed from this example.

Run from the package root:

```sh
node --test examples/minimal-panel/test.ts
```

Read [Panel composition contract](../../executable-reference/repair/PANEL_COMPOSITION_CONTRACT.md) for precise registration, target routing, restoration, preflight and notification semantics.

A contribution implements `Panel`, exports a `PanelType`, and calls `workspace.register(selectionSummaryType)`. `workspace.open(record,paneId)` creates it, restores its finite private view state, and sends initial and ongoing immutable `PanelUpdate` values. The application uses `ObservableEditorContext` and `ContextDirectory`; direct public selection/navigation changes emit events automatically. The ordinary contribution never writes a resolver, traverses Graph resources or edits a central Panel-kind switch.

`SelectionSummaryPanel` stores only its prefix, visibility and current presentation. It receives selection through `receive`; it does not own a Graph or a second selection model. Moving a Tab preserves this same Panel. Closing it disposes the view, not the borrowed Context or Graph. The shared workspace performs origin-owned gesture preflight before `canClose`/dispose.

Async rendering uses the update's `lease` and `services.accept(lease,callback)` so a result for an old target cannot update the current one. A parameter-aware Panel obtains `services.context(lease)` and passes that observable Context plus `target.ref.scope` to M01 `ScopedParameterTarget.openRouted`; it must not invent a nested lookup. A pinned target uses a centrally retained Context over the same Graph, so provider navigation does not change its object.

Unknown Panel types, unsupported view-state versions and unresolved saved references remain opaque placeholders. A later registration and explicit `workspace.retry(id)` use the same lifecycle. Cross-reload references require application-provided `RestoreResolver`; serialized Context/load identifiers are not authority.

HP01–04 now validate the real public composition using sealed Graph model objects: registration/direct notifications without model changes; missing/version preservation; origin-specific blocked close while an unrelated Panel can close; and failed restore cleanup. They do not establish pixel layout, browser focus, accessibility or native integration.
