import type { FieldTarget, ParameterProjection } from "../sdk/editing.ts";
import type {
  ParameterWidgetViewType,
  WidgetCommands,
  MountSurface,
} from "../sdk/view-mount.ts";
import type { LocalizationService } from "../sdk/localization.ts";
import { demand } from "../sdk/kernel.ts";
import { FieldDraft } from "../application/editor.ts";
import { PresentationSession } from "./mount.ts";
import type { PresentationFeedback } from "../sdk/ui.ts";
export class WidgetSlot {
  #session: PresentationSession | null = null;
  #draft: FieldDraft;
  #disposed = false;
  #unsubscribe: () => void;
  #widgetId: string | null = null;
  #surface: MountSurface | null = null;
  #clear: (() => void) | null = null;
  status: "ready" | "placeholder" | "disposed" = "placeholder";
  issue = "";
  constructor(
    private readonly target: FieldTarget,
    private readonly registry: WidgetRegistry,
    private readonly locale: LocalizationService,
    private readonly feedback?: PresentationFeedback,
  ) {
    this.#draft = new FieldDraft(target);
    this.#unsubscribe = target.subscribe(() => {
      try {
        if (this.#widgetId && this.resolve() !== this.#widgetId) {
          this.#draft.cancel();
          this.#session?.dispose();
          this.#session = null;
          this.placeholder("WIDGET_VIEW_CHANGED");
        }
      } catch (error) {
        this.#session?.dispose();
        this.#session = null;
        this.placeholder(String(error));
      }
    });
  }
  get pending(): boolean {
    return this.#draft.active;
  }
  private placeholder(issue: string): void {
    this.status = "placeholder";
    this.issue = issue;
    this.#clear?.();
    this.#clear = null;
    if (this.#surface)
      this.#clear =
        this.feedback?.show(this.#surface, issue, () => this.retry()) ?? null;
  }
  private resolve(): string {
    const p = this.target.capture().projection;
    return this.registry.resolve(p);
  }
  mount(surface: MountSurface): void {
    this.#surface = surface;
    if (this.#session) {
      this.#session.mount(surface);
      return;
    }
    this.retry();
  }
  retry(): void {
    demand(!this.#disposed, "WIDGET_DISPOSED");
    if (!this.#surface) return;
    this.#clear?.();
    this.#clear = null;
    if (
      this.#session &&
      this.#session.status === "placeholder" &&
      !this.#session.issues.some((x) => x.phase === "subscribe")
    ) {
      this.#session.retry();
      this.status =
        String(this.#session.status) === "mounted" ? "ready" : "placeholder";
      return;
    }
    this.#session?.dispose();
    this.#session = null;
    try {
      const id = this.resolve(),
        factory = this.registry.factory(id);
      demand(factory, "WIDGET_UNAVAILABLE");
      const contribution = factory.create({
        binding: {
          capture: () => this.target.capture(),
          subscribe: (fn) => this.target.subscribe(fn),
        },
      });
      const commands: WidgetCommands = {
        commit: (value, token) => this.target.commit(value, token),
        draft: () => this.#draft,
      };
      this.#session = new PresentationSession(
        contribution,
        this.locale,
        undefined,
        commands,
        (issue) => this.placeholder(issue),
      );
      this.#widgetId = id;
      this.#session.mount(this.#surface);
      this.status =
        this.#session.status === "mounted" ? "ready" : "placeholder";
      this.issue = this.#session.issues.map((x) => x.message).join("; ");
    } catch (error) {
      this.placeholder(String(error));
    }
  }
  unmount(): void {
    this.#session?.unmount();
    this.#clear?.();
    this.#clear = null;
    this.#surface = null;
  }
  cancel(): void {
    this.#draft.cancel();
    this.#session?.refresh();
  }
  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#unsubscribe();
    this.#session?.dispose();
    this.#clear?.();
    this.#clear = null;
    this.#draft.cancel();
    this.target.dispose();
    this.status = "disposed";
  }
}
export class WidgetRegistry {
  constructor(private readonly feedback?: PresentationFeedback) {}
  #factories = new Map<
    string,
    {
      view: ParameterWidgetViewType<ParameterProjection>;
      accepts: (p: ParameterProjection) => boolean;
    }
  >();
  register(
    view: ParameterWidgetViewType<ParameterProjection>,
    accepts: (p: ParameterProjection) => boolean,
  ): void {
    demand(!this.#factories.has(view.widgetId), "DUPLICATE_WIDGET");
    this.#factories.set(view.widgetId, { view, accepts });
  }
  resolve(p: ParameterProjection): string {
    const requested = this.#factories.get(p.spec.presentation.widget);
    if (requested?.accepts(p)) return requested.view.widgetId;
    if (p.spec.presentation.fallback !== "none")
      for (const f of this.#factories.values())
        if (f.accepts(p)) return f.view.widgetId;
    throw Error("WIDGET_UNAVAILABLE");
  }
  factory(
    id: string,
  ): ParameterWidgetViewType<ParameterProjection> | undefined {
    return this.#factories.get(id)?.view;
  }
  open(target: FieldTarget, locale: LocalizationService): WidgetSlot {
    return new WidgetSlot(target, this, locale, this.feedback);
  }
}
