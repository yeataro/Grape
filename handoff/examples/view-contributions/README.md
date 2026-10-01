# Canonical view contribution examples (IH-004)

THIS IS NOT THE PRODUCTION IMPLEMENTATION.

These are four independent feature contributions using one public seam. Their controller bodies and the fake surface are deliberately small. The production implementation may choose DOM, React, Vue, or another renderer; `qualification.controls.v1` is only the executable headless test protocol and is not a prescribed widget toolkit.

| Feature | Registration | Own state | Mount behavior |
| --- | --- | --- | --- |
| Selection Summary Panel | `selection-summary.ts` → `PanelWorkspace.register` | Latest borrowed routed selection projection | Displays selected IDs through its own view contribution |
| Help Panel | `help-panel.ts` → `PanelWorkspace.register` | Private `expanded`, latest target | Toggle edits viewState only; expansion survives move/hide/remount |
| Number field | `number-widget.ts` → `WidgetRenderer.register` | A scoped field draft | Input is draft-only; commit uses the existing target token/command path |
| Toggle field | `toggle-widget.ts` → `WidgetRenderer.register` | Mounted control projection only | A real toggle event submits boolean through the same scoped command path |

`registration.ts` is the only general composition wiring. The renderer imports none of the four implementation classes. No Graph or History core changes and no central Panel/Widget kind switch are required. The built-in `core.number` and `core.boolean` projection IDs are intentionally registered through the same view mechanism available to other widget modules. A custom widget package registers its semantic projection and its view under the same stable ID; the selected projection's actual fallback ID determines the view factory.

Read [the production contract](../../16_VIEW_MOUNT_CONTRACT.md), [type declarations](../../contracts/view-mount.ts), and [headless driver](../../executable-reference/repair/view-mount.ts) together. `PanelViewProvider.createView` is required for a visible production Panel. Optionality on the older qualification `Panel` interface only permits inherited logical-controller tests; an absent view produces an explicit placeholder.

The shell owns pre-existing surface anchors. `controls()` borrows that anchor, acquires child resources, and immediately registers cleanup with `MountScope.own`, so a later throw cannot leak those acquisitions. Cleanup registered after revoke runs immediately. A feature must not allocate mount-only resources during its pure factory or silently allocate a new unowned root in the surface getter.

Normal lifecycle: create/restore/receive via PanelWorkspace → create contribution → subscribe → mount → initial capture/update → subsequent target/private-state/locale invalidation → unmount for hide/inactive tab/move → remount same contribution. Close/replacement disposes the contribution before logical Panel disposal. Explicit renderer detachment ends the presentation attachment; it is not a replacement for guarded user close.

Widget contribution identity is one Inspector field binding, not one mount. The application owns the ScopedParameterTarget and must dispose/replace it when its logical scope ends. The view never looks up Graph/resources. Drafts survive ordinary remount and locale changes; a scoped conflict rejects commit while retaining text. Terminal contribution disposal drops only UI draft state. `cancel` is permitted during cleanup; model commit is not.

Factory/projection unavailable, incompatible surface, mount/update failure all have explicit placeholder/error paths. Retry does not silently choose another target. A target/type/widget-selection invalidation requires the Inspector to replace the old binding using the same public registry path; stale drafts are never retargeted to another logical parameter.

Direct executable tests: `executable-reference/repair/view-mount.test.ts` (VM01–VM18) and `qualification/view-mount-adversarial.test.ts`. They use the same public PanelWorkspace and scoped parameter contracts as the rest of the reference. They do not establish real DOM, accessibility, browser, device, GPU, or TD qualification.
