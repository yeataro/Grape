import type { Json, PanelPresentation } from "./public-surface.ts";
import type {
  PanelCommandLease,
  PanelCommandTarget,
} from "./panel-commands.ts";
import type {
  PanelViewContribution,
  WidgetReadBinding,
  ParameterWidgetViewType,
} from "./view-mount.ts";
import type { ScopeRef, FieldTarget, ParameterProjection } from "./editing.ts";
export interface PanelUpdate {
  readonly lease: PanelCommandLease;
  readonly target: PanelCommandTarget | null;
}
export interface ContextQuery {
  capture(): import("./editing.ts").ContextSnapshot;
  network(): import("./document.ts").NetworkDocument;
  select(ids: readonly string[], primary?: string | null): void;
  subscribe(fn: () => void): () => void;
}
export interface PanelServices {
  clipboard?(): string;
  reshape?(lease: PanelCommandLease, type: string, value: Json): Json;
  layout?(lease: PanelCommandLease): Json;
  context(lease: PanelCommandLease): ContextQuery;
  parameters(lease: PanelCommandLease, nodeId: string): readonly string[];
  parameter(lease: PanelCommandLease, nodeId: string, key: string): FieldTarget;
  accept(lease: PanelCommandLease, callback: () => void): boolean;
  activate(): void;
}
export interface Panel {
  restoreViewState(state: Json): void;
  exportViewState(): Json;
  receive(update: PanelUpdate): void;
  canClose(): boolean;
  dispose(): void;
  createView(): PanelViewContribution;
}
export interface PanelType {
  readonly typeId: string;
  readonly viewStateVersion: number;
  readonly presentation: PanelPresentation;
  readonly providesContext?: boolean;
  readonly commandIds?: readonly string[];
  create(id: string, services: PanelServices): Panel;
}
export interface SavedPanel {
  id: string;
  typeId: string;
  viewStateVersion: number;
  state: Json;
  paneId: string;
  hidden: boolean;
  contextId?: string;
  route?: { mode: "follow" | "context"; contextId?: string };
}

export interface WidgetFieldSlot {
  readonly status: "ready" | "placeholder" | "disposed";
  readonly issue: string;
  readonly pending: boolean;
  mount(surface: import("./view-mount.ts").MountSurface): void;
  unmount(): void;
  retry(): void;
  cancel(): void;
  dispose(): void;
}
export interface ParameterWidgets {
  open(
    target: FieldTarget,
    locale: import("./localization.ts").LocalizationService,
  ): WidgetFieldSlot;
}

/** Platform-owned placeholder; shared composition supplies the issue and retry. */
export interface PresentationFeedback {
  show(
    surface: import("./view-mount.ts").MountSurface,
    issue: string,
    retry: () => void,
  ): () => void;
}
