// Declaration provenance: IH-005 contracts/view-mount.ts; no reference implementation imported.
/** IH-004 production-facing view/mount lifecycle. UI technology is deliberately not selected. */
import type { Json } from "./public-surface.ts";
import type { TextRef } from "./localization.ts";

export interface MountSurface {
  /** Bootstrap-selected renderer technology protocol, NOT a Panel/Widget kind. */
  readonly protocol: string;
  /** Pre-existing shell/Layout-owned anchor, borrowed only. Its protocol supplies the public UI interface.
   * Surface lookup must not allocate orphan per-call anchors; provider self-cleans failed acquisition.
   * Shell releases anchors only after all child mounts are unmounted. */
  readonly target: unknown;
}
export interface MountTicket {
  readonly mount: number;
  readonly revision: number;
}
export interface MountScope {
  /** Register immediately after acquisition; even registration after revoke runs cleanup immediately. */
  own(cleanup: () => void): void;
  ticket(): MountTicket;
  /** Latest-projection + mount lifetime fence. Does not grant model edit authority. */
  accept(ticket: MountTicket, callback: () => void): boolean;
  /** Only live user-event callbacks may enter the widget command boundary. Render callbacks cannot. */
  event<A extends unknown[]>(
    callback: (...args: A) => void,
  ): (...args: A) => void;
}
export interface ViewFrame {
  readonly revision: number;
  readonly locale: string;
  text(ref: TextRef): string;
}
export interface MountContext {
  readonly surface: MountSurface;
  readonly scope: MountScope;
  /** Optional renderer presentation only; owner-selected JSON, no edit or reflection authority. */
  readonly hover?: (
    target: unknown,
    blocked?: () => HoverBlock | null,
  ) => HoverReadView;
}
export interface HoverBlock {
  readonly kind: "draft" | "composition" | "gesture";
  readonly message: string;
}
export interface HoverInfo {
  readonly kind: string;
  readonly name: string;
  readonly identity: string;
  readonly state: string;
  readonly data?: Json;
}
export interface HoverReadView {
  set(target: unknown, read: () => HoverInfo): void;
  invalidate(): void;
}
/** Read-only Panels receive no command capability. Commands are application-owned and Panel-bound. */
export interface PanelMountContext extends MountContext {
  readonly commands?: import("./panel-commands.ts").PanelCommands;
  /** Optional platform presentation only; no Graph or command authority. */
  readonly floating?: (options: FloatingPresentation) => {
    isOpen(): boolean;
    open(): boolean;
    close(focus?: boolean): void;
  };
}
export interface FloatingPresentation {
  readonly host: unknown;
  readonly trigger: unknown;
  readonly content: unknown;
  readonly title: string;
  readonly closeLabel: string;
  readonly kind: "anchored" | "modal";
  readonly width: number;
  readonly maxHeight: number;
  readonly align?: "start" | "end";
}
export interface MountedView<P = unknown> {
  /** Synchronous projection delivery. Async work must use scope.ticket/accept and scope.own. */
  update(projection: P, frame: ViewFrame): void;
  /** Optional finalizer; registered by shell only after mount returns. Use scope.own for partial mount. */
  unmount?(): void;
}
/** Required production Panel shape; legacy qualification Panel.createView optionality is not normative. */
export interface PanelViewProvider {
  createView(): PanelViewContribution;
}
export interface PanelViewContribution<P = unknown> {
  readonly kind: "panel";
  /** Must produce a detached read-only projection; no model editing during capture/update. */
  capture(): P;
  subscribe(invalidate: () => void): () => void;
  mount(context: PanelMountContext): MountedView<P>;
  /** Contribution ends at Panel close/replacement or explicit shell detachment, not hide/move/unmount. */
  dispose(): void;
}
export interface WidgetSnapshot<P = unknown> {
  readonly projection: P;
  readonly editToken: string;
  readonly writable: boolean;
}
export interface WidgetReadBinding<P = unknown> {
  capture(): WidgetSnapshot<P>;
  subscribe(invalidate: () => void): () => void;
}
export interface WidgetDraft {
  readonly text: string;
  setText(text: string): void;
  composition(active: boolean): void;
  commit(parse: (text: string) => Json): void;
  cancel(): void;
}
export interface WidgetCommands {
  commit(value: Json, expectedToken: string): void;
  draft(): WidgetDraft;
}
export interface WidgetMountContext extends MountContext {
  readonly commands: WidgetCommands;
}
export interface ParameterWidgetViewContribution<P = unknown> {
  readonly kind: "parameter-widget";
  capture(): WidgetSnapshot<P>;
  subscribe(invalidate: () => void): () => void;
  mount(context: WidgetMountContext): MountedView<WidgetSnapshot<P>>;
  dispose(): void;
}
export interface ParameterWidgetViewType<P = unknown> {
  readonly widgetId: string;
  /** Registration identity matches the registered widget projection, no renderer switch. */
  create(input: {
    readonly binding: WidgetReadBinding<P>;
  }): ParameterWidgetViewContribution<P>;
}
export type ViewStatus = "unmounted" | "mounted" | "placeholder" | "disposed";
export interface ViewIssue {
  readonly phase: string;
  readonly message: string;
}
