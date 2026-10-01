# Complete visible extension path — IH-004

The controller/projection sample below remains a qualification reference. A visible production extension also provides the required view/mount contribution. Start with [the complete four-feature examples](../view-contributions/README.md) and [the canonical mount contract](../../16_VIEW_MOUNT_CONTRACT.md). The shell never discovers a concrete class or calls an ad-hoc `project()` method.

# Parameter widget / UI contribution (IH-002)

Run from the handoff directory: `node --test examples/parameter-widget-or-ui-contribution/test.ts`.

**THIS IS NOT THE PRODUCTION IMPLEMENTATION.** This is the recommended scoped widget pattern. The unchanged AC-002 root-only renderer remains historical reference evidence; do not use it as the new production Inspector entry.

`registerPercentWidget` receives `ScopedParameterWidgets`. It registers only an identity, supported-type predicate and immutable description projection. It does not receive Graph, resources, Context or mutation functions. The example displays a float as percent without changing its stored GLSL type. Missing/failed widgets fall back without losing the model value or descriptor.

After workspace target resolution, the application creates one field lease:

```ts
const opened = ScopedParameterTarget.openRouted(
  { context, subscribe: listener => context.subscribe(listener) },
  update.target.ref.object.id,
  'b',
  update.target.ref.scope,
);
if (!opened.ok) showUnavailable(opened.error);
else new PercentFieldController(actionContext, opened.value, widgets);
```

Check `update.target.status === 'resolved'` and node kind first. `context` is the public observable Context supplied by workspace targeting for the effective scope. Follow targets use their provider Context; pinned scopes use the targeting service's retained Context. The Panel constructs/traverses neither. The public composition contract specifies acquiring the Context; this is field creation after resolution, not replacement Panel-routing logic.

`PercentFieldController` is minimal renderer glue. The same class handles a root or nested field: no conditional traversal of Graph/resources. It owns the passed target lease, draft text and action registration; it borrows the Context. Each field gets its own lease. `project()` queries that lease and `ScopedFieldDraft` commits through the same lease. Drafts conflict when value, interface/type, link state or occurrence identity changes. Successful writes use existing Parameter mutation and Graph History. Invalid text retains the draft and changes no model. The action is guarded by readonly, IME, busy and Context state.

Terminal invalidation requires an unavailable field or a newly resolved target. Do not search for another node with the same name/ID. A library copy-on-write commit can succeed and invalidate the old lease: reacquire before further edits without replaying that successful mutation. Dispose cancels text and disposes only the owned lease, never Context/Graph. `ActionContext` flags represent actual UI input state, not proof of native-browser composition handling.

No DOM, slider geometry, semantic color conversion, component range policy, plugin sandbox or production widget-version migration is supplied. Those are implementation work; root/nested lookup closure is no longer a renderer responsibility.

HW01–HW03 retain projection/no-write, Undo, readonly/IME/busy/parse failure, stale draft/fallback/lifetime checks. HW04 uses the same controller for nested shared-definition occurrences; HW05 rejects mismatched action Context/target. Additional scope/lifecycle/interface/notification qualification lives in [the scoped contract suite](../../executable-reference/repair/scoped-parameter.test.ts). No test here claims browser parity.
