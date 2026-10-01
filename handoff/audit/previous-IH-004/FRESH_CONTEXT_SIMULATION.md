# IH-004 package-only contract walk-through

**SELF-CHECK ONLY；不是 independent blind acceptance。** 只根據本包逐題重建FIR-B01相關實作路徑；不需要聊天或Legacy source。

### How does an ordinary Panel hand off a view?

Register the feature PanelType; existing workspace creates/restores/routes; required production PanelViewProvider.createView returns feature-owned PanelViewContribution; common renderer mounts it without a class/type switch.

Source: 04_EXTENSION_MODEL.md;16_VIEW_MOUNT_CONTRACT.md

### How does a custom Widget hand off its view and edit?

Register projection and ParameterWidgetViewType with the same selected Widget ID. Shared renderer creates a WidgetViewSlot from a borrowed ScopedParameterTarget, injects read binding and event-gated commands. commit/draft preserve the existing scoped Parameter/Operation boundary.

Source: 16_VIEW_MOUNT_CONTRACT.md;contracts/view-mount.ts

### Who owns the target and the allocated view resources?

The shell/Layout owns pre-existing technology anchors; lookup borrows them, failing acquisition self-cleans. MountScope owns feature mount resources, revoked before cleanup. The shell releases an anchor only after all children unmount.

Source: 16_VIEW_MOUNT_CONTRACT.md#5

### What happens on move, hidden tab and remount?

Same Panel/contribution/private state and field draft remain; actual visible mount is removed, old callbacks/tickets revoked. A new mount captures latest data/locale. No Graph edit, close, or draft commit is implied.

Source: 16_VIEW_MOUNT_CONTRACT.md#4

### Does closing bypass canClose?

No. Workspace origin/close preflight runs before view teardown. A rejected close leaves mounted resources. Accepted close/replacement/dispose notifies public beforePanelDispose, then logical disposal. Shell detach is separately terminal only for the presentation attachment.

Source: 16_VIEW_MOUNT_CONTRACT.md#4

### What if create/mount/update fails?

Common placeholder records the failure; partial allocations clean up even before mount returns. Surface/mount retry keeps logical owner/state; factory/subscribe retry recreates the failed presentation attachment. Missing Widget view is an explicit retryable slot, never a feature-type switch.

Source: 16_VIEW_MOUNT_CONTRACT.md#5

### What does an async or old event retain?

Only a revocable mount/revision ticket or wrapped event, not a persistent edit authority. Target lease/editToken additionally constrain model identity. Cleanup cannot inherit outer event rights; cancelling an uncommitted draft is local cleanup, not model write.

Source: 16_VIEW_MOUNT_CONTRACT.md#6

### What remains an implementation choice?

Renderer technology/protocol implementation, DOM/CSS/virtualization and internal SDK spelling subject to ledger consistency. The public owner/ordering/error semantics are specified; no fresh architecture choice is required to close FIR-B01.

Source: 13_PRODUCTION_CONTRACT_SURFACE.md;16_VIEW_MOUNT_CONTRACT.md

### What can this repair claim?

29 new direct tests and 383 full regression tests passed. It cannot claim product DOM, focus/IME/accessibility/device behavior, HANDOFF PASS, or S01 started. Existing Gates still apply.

Source: audit/FINAL_REVIEW_REPAIR_VALIDATION.json

先前IH-003完整產品模型自測保留於previous-IH-003。新契約與既有模型不構成第二套ownership；本次不再展開整體研究。
