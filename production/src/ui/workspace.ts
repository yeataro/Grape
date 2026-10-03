import type { Json } from "../sdk/public-surface.ts";
import type {
  Panel,
  PanelType,
  SavedPanel,
  PanelUpdate,
  PanelServices,
} from "../sdk/ui.ts";
import type {
  PanelCommandLease,
  PanelCommandMountAuthority,
  PanelCommands,
  PanelCommandTarget,
  PanelCommandIntent,
} from "../sdk/panel-commands.ts";
import { EditorApplication } from "../application/editor.ts";
import { Signal, demand, detached, plain, equal } from "../sdk/kernel.ts";
export interface PanelRecord {
  readonly saved: SavedPanel;
  readonly type: PanelType | null;
  readonly instance: Panel | null;
  readonly update: PanelUpdate;
  readonly issues: readonly string[];
  readonly incarnation: number;
}
type Internal = {
  saved: SavedPanel;
  type: PanelType | null;
  instance: Panel | null;
  update: PanelUpdate;
  issues: string[];
  incarnation: number;
  unsubscribe: () => void;
};
export class Workspace {
  #types = new Map<string, PanelType>();
  #records = new Map<string, Internal>();
  #signal = new Signal<void>();
  #beforeDispose = new Signal<string>();
  #activeContext: string | null = null;
  #activeTabs = new Map<string, string>();
  #publishing = false;
  #pending = false;
  #generation = 0;
  #incarnation = 0;
  #commandDepth = 0;
  #cleanup: (() => void)[] = [];
  #appUnsubscribe: () => void;
  constructor(private readonly application: EditorApplication) {
    this.#appUnsubscribe = application.subscribe(() => this.route());
  }
  register(type: PanelType): void {
    demand(!this.#types.has(type.typeId), "DUPLICATE_PANEL");
    this.#types.set(type.typeId, type);
  }
  subscribe(fn: () => void): () => void {
    return this.#signal.subscribe(fn);
  }
  beforePanelDispose(fn: (id: string) => void): () => void {
    return this.#beforeDispose.subscribe(fn);
  }
  records(): readonly PanelRecord[] {
    return [...this.#records.values()].map((r) =>
      Object.freeze({
        ...r,
        saved: detached(r.saved),
        update: detached(r.update),
        issues: [...r.issues],
      }),
    );
  }
  record(id: string): PanelRecord {
    const r = this.records().find((r) => r.saved.id === id);
    demand(r, "PANEL_MISSING");
    return r;
  }
  visible(id: string): boolean {
    const r = this.#records.get(id);
    return (
      !!r && !r.saved.hidden && this.#activeTabs.get(r.saved.paneId) === id
    );
  }
  open(saved: SavedPanel): void {
    demand(!this.#publishing && !this.#records.has(saved.id), "WORKSPACE_BUSY");
    plain(saved.state);
    const type = this.#types.get(saved.typeId) ?? null;
    const r: Internal = {
      saved: structuredClone(saved),
      type,
      instance: null,
      update: {
        lease: { panelId: saved.id, generation: ++this.#generation },
        target: null,
      },
      issues: [],
      incarnation: ++this.#incarnation,
      unsubscribe: () => {},
    };
    this.#records.set(saved.id, r);
    this.#activeTabs.set(saved.paneId, saved.id);
    try {
      demand(
        type && type.viewStateVersion === saved.viewStateVersion,
        "PANEL_UNAVAILABLE",
      );
      const services: PanelServices = {
        clipboard: () => this.application.clipboardText,
        reshape: (lease, type, value) => {
          this.assertLease(r, lease);
          demand(r.update.target, "TARGET_MISSING");
          return this.application.reshapeValue(
            this.application.context(r.update.target.scope.contextId),
            type,
            value,
          );
        },
        layout: (lease) => {
          this.assertLease(r, lease);
          demand(r.update.target, "TARGET_MISSING");
          return this.application.layoutProposal(
            this.application.context(r.update.target.scope.contextId),
          ) as unknown as Json;
        },
        context: (lease) => {
          this.assertLease(r, lease);
          demand(r.update.target, "TARGET_MISSING");
          return this.application.context(r.update.target.scope.contextId);
        },
        parameters: (lease, node) => {
          this.assertLease(r, lease);
          demand(r.update.target, "TARGET_MISSING");
          return this.application.parameterKeys(
            this.application.context(r.update.target.scope.contextId),
            node,
          );
        },
        parameter: (lease, node, key) => {
          this.assertLease(r, lease);
          demand(r.update.target, "TARGET_MISSING");
          const c = this.application.context(r.update.target.scope.contextId);
          return this.application.parameter(
            c,
            node,
            key,
            r.update.target.scope,
          );
        },
        accept: (lease, callback) => {
          try {
            this.assertLease(r, lease);
          } catch {
            return false;
          }
          callback();
          return true;
        },
        activate: () => this.activate(saved.id),
      };
      r.instance = type.create(saved.id, services);
      r.instance.restoreViewState(detached(saved.state));
      if (saved.contextId)
        r.unsubscribe = this.application
          .context(saved.contextId)
          .subscribe(() => this.route());
    } catch (error) {
      r.issues.push(String(error));
      try {
        r.instance?.dispose();
      } catch {}
      r.instance = null;
    }
    this.route();
  }
  retry(id: string): void {
    const r = this.#records.get(id);
    demand(r && !r.instance, "PANEL_RETRY");
    const saved = r.saved;
    this.close(id);
    this.open(saved);
  }
  activate(id: string): void {
    const r = this.#records.get(id);
    demand(r, "PANEL_MISSING");
    if (r.type?.providesContext && r.saved.contextId) {
      if (this.#activeContext && this.#activeContext !== r.saved.contextId)
        demand(
          !this.application.originBusy(undefined, this.#activeContext),
          "HISTORY_BUSY",
        );
      this.#activeContext = r.saved.contextId;
    }
    this.#activeTabs.set(r.saved.paneId, id);
    this.route();
  }
  retarget(id: string, contextId: string): void {
    const r = this.#records.get(id);
    demand(
      r &&
        !this.#publishing &&
        !this.application.originBusy(id, r.update.target?.scope.contextId),
      "HISTORY_BUSY",
    );
    this.application.context(contextId);
    r.saved.route = { mode: "context", contextId };
    this.route();
  }
  move(id: string, paneId: string): void {
    demand(!this.#publishing, "WORKSPACE_BUSY");
    const r = this.#records.get(id);
    demand(r, "PANEL_MISSING");
    r.saved.paneId = paneId;
    this.#activeTabs.set(paneId, id);
    this.route();
  }
  hide(id: string, hidden: boolean): void {
    demand(!this.#publishing, "WORKSPACE_BUSY");
    const r = this.#records.get(id);
    demand(r, "PANEL_MISSING");
    r.saved.hidden = hidden;
    this.route();
  }
  close(id: string): void {
    demand(!this.#publishing, "WORKSPACE_BUSY");
    const r = this.#records.get(id);
    demand(r, "PANEL_MISSING");
    demand(
      !this.application.originBusy(id, r.update.target?.scope.contextId) &&
        (!r.instance || r.instance.canClose()),
      "PANEL_CLOSE_VETO",
    );
    this.#beforeDispose.emit(id);
    this.#records.delete(id);
    r.unsubscribe();
    try {
      r.instance?.dispose();
    } catch (error) {
      r.issues.push(String(error));
    }
    this.route();
  }
  exportState(): readonly SavedPanel[] {
    return this.records().map((r) => {
      const state = r.instance?.exportViewState() ?? r.saved.state;
      plain(state);
      return { ...r.saved, state: structuredClone(state) };
    });
  }
  private assertLease(r: Internal, lease: PanelCommandLease): void {
    demand(
      this.#records.get(r.saved.id) === r &&
        lease.panelId === r.saved.id &&
        lease.generation === r.update.lease.generation &&
        r.update.target,
      "STALE_PANEL_LEASE",
    );
  }
  private route(): void {
    if (this.#publishing) {
      this.#pending = true;
      return;
    }
    this.#publishing = true;
    try {
      do {
        this.#pending = false;
        for (const r of this.#records.values()) {
          let target: PanelCommandTarget | null = null;
          const contextId =
            r.saved.contextId ??
            (r.saved.route?.mode === "context"
              ? r.saved.route.contextId
              : this.#activeContext);
          if (contextId)
            try {
              const c = this.application.context(contextId).capture();
              target = {
                scope: c.scope,
                object: c.primary ? { kind: "node", id: c.primary } : null,
              };
            } catch {}
          r.update = {
            lease: { panelId: r.saved.id, generation: ++this.#generation },
            target,
          };
          if (r.instance)
            try {
              r.instance.receive(detached(r.update));
            } catch (error) {
              r.issues.push(String(error));
              try {
                r.saved.state = detached(r.instance.exportViewState());
              } catch (failure) {
                r.issues.push("exportViewState: " + String(failure));
              }
              this.#beforeDispose.emit(r.saved.id);
              r.unsubscribe();
              try {
                r.instance.dispose();
              } catch (failure) {
                r.issues.push("dispose: " + String(failure));
              }
              r.instance = null;
            }
        }
        this.#signal.emit();
      } while (this.#pending);
    } finally {
      this.#publishing = false;
    }
    this.drain();
  }
  private drain(): void {
    if (this.#commandDepth || this.#publishing) return;
    while (this.#cleanup.length) {
      const fn = this.#cleanup.shift()!;
      try {
        fn();
      } catch (error) {
        this.#signal.errors.push(error);
      }
    }
    if (this.#pending) this.route();
  }
  bindPanelCommands(
    id: string,
    mount: PanelCommandMountAuthority,
  ): PanelCommands | undefined {
    const r = this.#records.get(id);
    demand(r, "PANEL_MISSING");
    const requested = r.type?.commandIds;
    if (!requested?.length) return undefined;
    const gestures = new Set<{ cancel: () => void }>();
    let revoked = false;
    const guard = (lease: PanelCommandLease, commandId: string) => {
      mount.assertEvent();
      demand(!revoked, "MOUNT_REVOKED");
      this.assertLease(r, lease);
      demand(
        requested.includes(commandId) &&
          this.application.allows(r.saved.typeId, commandId),
        "COMMAND_DENIED",
      );
    };
    const invoke = <T>(fn: () => T): T => {
      this.#commandDepth++;
      try {
        return fn();
      } finally {
        this.#commandDepth--;
        this.drain();
      }
    };
    mount.own(() => {
      revoked = true;
      for (const g of gestures)
        this.#cleanup.push(() => {
          g.cancel();
          gestures.delete(g);
        });
      this.drain();
    });
    return {
      execute: (lease, intent) =>
        invoke(() => {
          guard(lease, intent.commandId);
          this.application.execute(
            { panelId: id, typeId: r.saved.typeId },
            r.update.target!,
            intent,
          );
        }),
      beginGesture: (lease, intent) =>
        invoke(() => {
          guard(lease, intent.commandId);
          const target = r.update.target!;
          const gesture = this.application.beginGesture(
            { panelId: id, typeId: r.saved.typeId },
            target,
            intent,
          );
          gestures.add(gesture);
          let live = true;
          const check = (next: PanelCommandLease) => {
            guard(next, intent.commandId);
            demand(
              live && equal(target.scope, r.update.target?.scope),
              "GESTURE_EXPIRED",
            );
          };
          return {
            update: (next, args) =>
              invoke(() => {
                check(next);
                gesture.update(args);
              }),
            commit: (next) =>
              invoke(() => {
                check(next);
                gesture.commit();
                live = false;
                gestures.delete(gesture);
              }),
            cancel: () =>
              invoke(() => {
                mount.assertEvent();
                demand(!revoked && live, "GESTURE_EXPIRED");
                gesture.cancel();
                live = false;
                gestures.delete(gesture);
              }),
          };
        }),
    };
  }
  dispose(): void {
    for (const r of this.#records.values())
      demand(
        !this.application.originBusy(
          r.saved.id,
          r.update.target?.scope.contextId,
        ) &&
          (!r.instance || r.instance.canClose()),
        "PANEL_CLOSE_VETO",
      );
    for (const id of [...this.#records.keys()]) this.close(id);
    this.#appUnsubscribe();
    this.#signal.clear();
    this.#beforeDispose.clear();
  }
}
