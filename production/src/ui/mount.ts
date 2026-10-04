import type {
  HoverBlock,
  MountScope,
  MountTicket,
  MountedView,
  PanelViewContribution,
  MountSurface,
  ViewFrame,
  ViewStatus,
  ViewIssue,
  ParameterWidgetViewContribution,
  WidgetCommands,
} from "../sdk/view-mount.ts";
import type { LocalizationService } from "../sdk/localization.ts";
import { demand } from "../sdk/kernel.ts";
import { Workspace } from "./workspace.ts";
import type { PresentationFeedback } from "../sdk/ui.ts";
import { hoverOwner, invalidateHover } from "./hover.ts";
let mountSequence = 0;
export class PresentationSession {
  #scope: MountScope | null = null;
  #mounted: MountedView | null = null;
  #cleanups: (() => void)[] = [];
  #subscriptions: (() => void)[] = [];
  #live = true;
  #rendering = false;
  #eventDepth = 0;
  #revision = 0;
  #mount = 0;
  #surface: MountSurface | null = null;
  #subscribed = false;
  status: ViewStatus = "unmounted";
  readonly issues: ViewIssue[] = [];
  constructor(
    private readonly view:
      | PanelViewContribution
      | ParameterWidgetViewContribution,
    private readonly locale: LocalizationService,
    private readonly bind?: (authority: {
      assertEvent(): void;
      own(cleanup: () => void): void;
    }) => import("../sdk/panel-commands.ts").PanelCommands | undefined,
    private readonly widgets?: WidgetCommands,
    private readonly failed?: (issue: string) => void,
  ) {
    try {
      this.#subscriptions.push(view.subscribe(() => this.refresh()));
      this.#subscriptions.push(locale.subscribe(() => this.refresh()));
      this.#subscribed = true;
    } catch (error) {
      for (const cleanup of this.#subscriptions.splice(0).reverse()) {
        try {
          cleanup();
        } catch (failure) {
          this.error("unsubscribe", failure);
        }
      }
      this.fail("subscribe", error);
    }
  }
  private error(phase: string, error: unknown): void {
    this.issues.push({ phase, message: String(error) });
  }
  private fail(phase: string, error: unknown): void {
    this.error(phase, error);
    this.unmount();
    this.status = "placeholder";
    this.failed?.(phase + ": " + String(error));
  }
  assertEvent = (): void => {
    demand(
      this.#scope && this.#live && this.#eventDepth > 0 && !this.#rendering,
      "MOUNT_EVENT_REQUIRED",
    );
  };
  mount(surface: MountSurface): void {
    demand(this.#live, "VIEW_DISPOSED");
    if (!this.#subscribed) return;
    this.unmount();
    this.#surface = surface;
    const mount = ++mountSequence;
    this.#mount = mount;
    const own = (cleanup: () => void) => {
      if (this.#scope !== scope) {
        try {
          cleanup();
        } catch (error) {
          this.error("cleanup", error);
        }
      } else this.#cleanups.push(cleanup);
    };
    const scope: MountScope = {
      own,
      ticket: () => ({ mount, revision: this.#revision }),
      accept: (ticket, fn) => {
        if (
          !this.#scope ||
          this.#mount !== ticket.mount ||
          this.#revision !== ticket.revision
        )
          return false;
        try {
          this.#rendering = true;
          fn();
          return true;
        } catch (error) {
          this.fail("async", error);
          return false;
        } finally {
          this.#rendering = false;
        }
      },
      event:
        (callback) =>
        (...args) => {
          if (this.#scope !== scope || !this.#live || this.#rendering) return;
          this.#eventDepth++;
          try {
            callback(...args);
          } catch (error) {
            this.error("event", error);
          } finally {
            this.#eventDepth--;
          }
        },
    };
    this.#scope = scope;
    try {
      this.#rendering = true;
      const base = {
        surface,
        scope,
        ...(surface.protocol === "grape.dom.v1"
          ? {
              hover: (target: unknown, blocked?: () => HoverBlock | null) =>
                hoverOwner(target, scope, blocked),
            }
          : {}),
      };
      if (this.view.kind === "panel") {
        const commands = this.bind?.({
          assertEvent: () => {
            demand(this.#scope === scope, "MOUNT_REVOKED");
            this.assertEvent();
          },
          own,
        });
        this.#mounted = this.view.mount({
          ...base,
          ...(commands ? { commands } : {}),
        });
      } else {
        demand(this.widgets, "WIDGET_COMMANDS");
        const commands: WidgetCommands = {
          commit: (value, token) => {
            demand(this.#scope === scope, "MOUNT_REVOKED");
            this.assertEvent();
            this.widgets!.commit(value, token);
          },
          draft: () => {
            demand(this.#scope === scope, "MOUNT_REVOKED");
            this.assertEvent();
            const draft = this.widgets!.draft();
            return {
              get text() {
                return draft.text;
              },
              setText: (text) => {
                demand(this.#scope === scope, "MOUNT_REVOKED");
                this.assertEvent();
                draft.setText(text);
              },
              composition: (active) => {
                demand(this.#scope === scope, "MOUNT_REVOKED");
                this.assertEvent();
                draft.composition(active);
              },
              commit: (parse) => {
                demand(this.#scope === scope, "MOUNT_REVOKED");
                this.assertEvent();
                draft.commit(parse);
              },
              cancel: () => {
                demand(this.#scope === scope, "MOUNT_REVOKED");
                this.assertEvent();
                draft.cancel();
              },
            };
          },
        };
        this.#mounted = this.view.mount({ ...base, commands });
      }
      if (this.#mounted.unmount) {
        const mounted = this.#mounted;
        own(() => mounted.unmount?.());
      }
      if (this.#scope === scope) this.status = "mounted";
      else this.#mounted = null;
    } catch (error) {
      this.fail("mount", error);
    } finally {
      this.#rendering = false;
    }
    if (this.status === "mounted") this.refresh();
  }
  refresh(): void {
    invalidateHover(this.#surface?.target);
    this.#revision++;
    if (this.#scope && this.#rendering) {
      this.fail("render", "VIEW_RENDER_REENTRANCY");
      return;
    }
    if (!this.#scope || this.status !== "mounted") return;
    try {
      this.#rendering = true;
      const projection = this.view.capture();
      const frame: ViewFrame = {
        revision: this.#revision,
        locale: this.locale.locale,
        text: (ref) => this.locale.resolve(ref).text,
      };
      this.#mounted!.update(projection, frame);
    } catch (error) {
      this.fail("update", error);
    } finally {
      this.#rendering = false;
    }
  }
  unmount(): void {
    invalidateHover(this.#surface?.target);
    this.#scope = null;
    this.#mount = ++mountSequence;
    for (const cleanup of this.#cleanups.splice(0).reverse())
      try {
        cleanup();
      } catch (error) {
        this.error("cleanup", error);
      }
    this.#mounted = null;
    if (this.status !== "disposed") this.status = "unmounted";
  }
  retry(): void {
    if (this.#surface && this.status === "placeholder")
      this.mount(this.#surface);
  }
  dispose(): void {
    if (!this.#live) return;
    this.#live = false;
    this.unmount();
    for (const cleanup of this.#subscriptions.splice(0))
      try {
        cleanup();
      } catch (error) {
        this.error("unsubscribe", error);
      }
    try {
      this.view.dispose();
    } catch (error) {
      this.error("dispose", error);
    }
    this.status = "disposed";
  }
}
type Attachment = {
  session: PresentationSession | null;
  pane: string;
  incarnation: number;
  issue: string;
  clear: (() => void) | null;
  surface: MountSurface | null;
};
export class PanelRenderer {
  #sessions = new Map<string, Attachment>();
  #unsubscribe: () => void;
  #before: () => void;
  constructor(
    private readonly workspace: Workspace,
    private readonly locale: LocalizationService,
    private readonly surface: (pane: string, id: string) => MountSurface,
    private readonly feedback?: PresentationFeedback,
  ) {
    this.#unsubscribe = workspace.subscribe(() => this.sync());
    this.#before = workspace.beforePanelDispose((id) => this.detach(id));
    this.sync();
  }
  session(id: string): PresentationSession | undefined {
    return this.#sessions.get(id)?.session ?? undefined;
  }
  issue(id: string): string {
    return this.#sessions.get(id)?.issue ?? "";
  }
  private detach(id: string): void {
    const item = this.#sessions.get(id);
    this.#sessions.delete(id);
    item?.session?.dispose();
    item?.clear?.();
  }
  retry(id: string): void {
    this.detach(id);
    if (!this.workspace.record(id).instance) this.workspace.retry(id);
    else this.sync();
  }
  private placeholder(id: string, item: Attachment, issue: string): void {
    item.issue = issue;
    item.clear?.();
    item.clear = null;
    if (item.surface && this.workspace.visible(id)) {
      try {
        item.clear =
          this.feedback?.show(item.surface, issue, () => this.retry(id)) ??
          null;
      } catch (error) {
        item.issue += "; placeholder: " + String(error);
      }
    }
  }
  private sync(): void {
    for (const r of this.workspace.records()) {
      const id = r.saved.id;
      let item = this.#sessions.get(id);
      if (!item || item.incarnation !== r.incarnation) {
        this.detach(id);
        item = {
          session: null,
          pane: r.saved.paneId,
          incarnation: r.incarnation,
          issue: "",
          clear: null,
          surface: null,
        };
        this.#sessions.set(id, item);
      }
      if (!this.workspace.visible(id)) {
        item.session?.unmount();
        item.clear?.();
        item.clear = null;
        continue;
      }
      if (item.pane !== r.saved.paneId) {
        item.session?.unmount();
        item.clear?.();
        item.clear = null;
        item.surface = null;
        item.pane = r.saved.paneId;
      }
      try {
        item.surface ??= this.surface(item.pane, id);
      } catch (error) {
        this.placeholder(id, item, "surface: " + String(error));
        continue;
      }
      if (item.issue) {
        if (!item.clear) this.placeholder(id, item, item.issue);
        continue;
      }
      if (!r.instance) {
        this.placeholder(id, item, r.issues.join("; "));
        continue;
      }
      if (!item.session) {
        try {
          const attachment = item;
          const view = r.instance.createView();
          const presented: PanelViewContribution = {
            kind: "panel",
            capture: () => view.capture(),
            subscribe: (fn) => view.subscribe(fn),
            dispose: () => view.dispose(),
            mount: (mount) => {
              const mounted = view.mount(mount);
              if (
                mount.surface.protocol === "grape.dom.v1" &&
                typeof Element !== "undefined" &&
                mount.surface.target instanceof Element
              ) {
                const root = mount.surface.target;
                root.setAttribute("data-hover-panel", id);
                const hover = hoverOwner(root, mount.scope);
                hover.set(root, () => {
                  const current = this.workspace.record(id);
                  demand(
                    current.incarnation === r.incarnation &&
                      this.workspace.visible(id),
                    "PANEL_UNAVAILABLE",
                  );
                  return {
                    kind: "Panel",
                    name: current.type
                      ? this.locale.resolve(current.type.presentation.label)
                          .text
                      : id,
                    identity: id,
                    state: "UI-only · visible",
                    data: {
                      type: current.saved.typeId,
                      viewState:
                        current.instance?.exportViewState() ?? "未提供",
                    },
                  };
                });
                mount.scope.own(() => root.removeAttribute("data-hover-panel"));
              }
              return mounted;
            },
          };
          item.session = new PresentationSession(
            presented,
            this.locale,
            (guard) => this.workspace.bindPanelCommands(id, guard),
            undefined,
            (issue) => this.placeholder(id, attachment, issue),
          );
        } catch (error) {
          this.placeholder(id, item, "createView: " + String(error));
          continue;
        }
      }
      if (item.session.status === "unmounted") item.session.mount(item.surface);
    }
  }
  dispose(): void {
    this.#unsubscribe();
    this.#before();
    for (const id of [...this.#sessions.keys()]) this.detach(id);
  }
}
