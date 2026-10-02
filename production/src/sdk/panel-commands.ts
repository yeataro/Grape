// Declaration provenance: IH-005 contracts/panel-commands.ts; no reference implementation imported.
/** IH-005 normative scoped Panel editing seam. Not a command registry or Graph authority. */
import type { Json } from "./public-surface.ts";

export interface PanelCommandLease {
  readonly panelId: string;
  readonly generation: number;
}
export interface PanelCommandIntent {
  readonly commandId: string;
  readonly args: Json;
}
export interface PanelGestureCommands {
  /** Latest routed publication lease; gesture target identity itself cannot change. */
  update(lease: PanelCommandLease, args: Json): void;
  commit(lease: PanelCommandLease): void;
  cancel(): void;
}
export interface PanelCommands {
  execute(lease: PanelCommandLease, intent: PanelCommandIntent): void;
  beginGesture(
    lease: PanelCommandLease,
    intent: PanelCommandIntent,
  ): PanelGestureCommands;
}
export interface PanelCommandTarget {
  readonly scope: Readonly<{
    graphId: string;
    loadId: string;
    contextId: string;
    stageId: string;
    networkPath: readonly string[];
  }>;
  readonly object: Readonly<{ kind: string; id: string }> | null;
}
export interface PanelCommandOrigin {
  readonly panelId: string;
  readonly typeId: string;
}
/** Application-owned existing command execution adapter. Never given to a Panel contribution.
 * Validate command/payload/scope before mutation; use the existing Operation/History boundary.
 * beginGesture records the supplied origin in application gesture preflight before returning.
 * Error leaves no partial mutation; update failure does not consume the gesture; commit/cancel
 * terminal only on success. Gesture is never a serialized capability.
 */
export interface ApplicationPanelCommandAuthority {
  allows(typeId: string, commandId: string): boolean;
  execute(
    origin: PanelCommandOrigin,
    target: PanelCommandTarget,
    intent: PanelCommandIntent,
  ): void;
  beginGesture(
    origin: PanelCommandOrigin,
    target: PanelCommandTarget,
    intent: PanelCommandIntent,
  ): {
    update(args: Json): void;
    commit(): void;
    cancel(): void;
  };
}
/** Shell-only attachment. Guard rejects capture/render/async/outside-event and revoked mounts.
 * Each new mount gets a new guard; resources own cancellation on loss of event route.
 */
export interface PanelCommandMountAuthority {
  assertEvent(): void;
  own(cleanup: () => void): void;
}
