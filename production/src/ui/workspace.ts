import type { Json } from "../sdk/public-surface.ts";
import type {
  Panel,
  PanelType,
  SavedPanel,
  PanelUpdate,
  PanelServices,
  PanelRoute,
  ContextRestoreHint,
  WorkspacePane,
  WorkspaceLayout,
} from "../sdk/ui.ts";
import type {
  PanelCommandLease,
  PanelCommandMountAuthority,
  PanelCommands,
  PanelCommandTarget,
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
  readonly placement: number;
}
type Internal = {
  saved: SavedPanel;
  type: PanelType | null;
  instance: Panel | null;
  update: PanelUpdate;
  issues: string[];
  incarnation: number;
  placement: number;
  unsubscribe: () => void;
  signature: unknown;
  ownedContext?: string;
};
const name = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0 && v.length <= 256;
const keys = (v: object, allowed: string[]) =>
  demand(
    Object.keys(v).every((k) => allowed.includes(k)),
    "LAYOUT_FIELD",
  );
function hintValid(h: ContextRestoreHint) {
  demand(h && !Array.isArray(h), "CONTEXT_HINT");
  keys(h, ["graphId", "stageId", "networkPath", "selection", "primary"]);
  demand(
    name(h.graphId) &&
      name(h.stageId) &&
      Array.isArray(h.networkPath) &&
      h.networkPath.every(name) &&
      Array.isArray(h.selection) &&
      h.selection.every(name) &&
      new Set(h.selection).size === h.selection.length &&
      (h.primary === null ||
        (name(h.primary) && h.selection.includes(h.primary))),
    "CONTEXT_HINT",
  );
}
function routeValid(r: PanelRoute, persisted = false) {
  demand(r && !Array.isArray(r), "PANEL_ROUTE");
  if (r.mode === "follow") keys(r, ["mode"]);
  else if (r.mode === "followCanvas") {
    keys(r, ["mode", "panelId"]);
    demand(name(r.panelId), "PANEL_ROUTE");
  } else {
    demand(r.mode === "context", "PANEL_ROUTE");
    keys(r, ["mode", "contextId", "hint"]);
    demand(
      persisted
        ? r.contextId === undefined && r.hint !== undefined
        : (r.contextId !== undefined) !== (r.hint !== undefined),
      "PANEL_ROUTE",
    );
    if (r.contextId !== undefined) demand(name(r.contextId), "PANEL_ROUTE");
    if (r.hint !== undefined) hintValid(r.hint);
  }
}
function savedValid(s: SavedPanel, persisted = false) {
  plain(s);
  demand(Object.hasOwn(s, "state"), "PANEL_STATE");
  keys(s, [
    "id",
    "typeId",
    "viewStateVersion",
    "state",
    "paneId",
    "hidden",
    "contextId",
    "contextHint",
    "linkGroup",
    "route",
    "floating",
    "collapsed",
    "floatWidth",
  ]);
  demand(
    name(s.id) &&
      name(s.typeId) &&
      name(s.paneId) &&
      Number.isSafeInteger(s.viewStateVersion) &&
      s.viewStateVersion > 0 &&
      typeof s.hidden === "boolean",
    "PANEL_DATA",
  );
  demand(
    s.linkGroup === undefined ||
      (Number.isSafeInteger(s.linkGroup) && s.linkGroup >= 0),
    "PANEL_GROUP",
  );
  demand(
    s.collapsed === undefined || typeof s.collapsed === "boolean",
    "PANEL_COLLAPSED",
  );
  demand(
    s.floatWidth === undefined ||
      (Number.isFinite(s.floatWidth) && s.floatWidth >= 280),
    "PANEL_FLOAT",
  );
  if (persisted)
    demand(s.contextId === undefined, "LIVE_CONTEXT_NOT_PERSISTENT");
  if (s.contextId !== undefined)
    demand(name(s.contextId) && s.contextHint === undefined, "PANEL_CONTEXT");
  demand(
    s.route === undefined ||
      (s.contextId === undefined && s.contextHint === undefined),
    "PANEL_CONTEXT",
  );
  if (s.contextHint !== undefined) hintValid(s.contextHint);
  if (s.route !== undefined) routeValid(s.route, persisted);
  if (s.floating !== undefined) {
    demand(s.floating && !Array.isArray(s.floating), "PANEL_FLOAT");
    const f = s.floating;
    keys(f, ["dockPaneId", "dockIndex", "width", "collapsed"]);
    demand(
      name(f.dockPaneId) &&
        Number.isSafeInteger(f.dockIndex) &&
        f.dockIndex >= 0 &&
        Number.isFinite(f.width) &&
        f.width >= 280 &&
        typeof f.collapsed === "boolean",
      "PANEL_FLOAT",
    );
  }
}
export class Workspace {
  #types = new Map<string, PanelType>();
  #records = new Map<string, Internal>();
  #panes = new Map<string, WorkspacePane>();
  #widths = { left: 240, right: 320 };
  #activation: string[] = [];
  #signal = new Signal<void>();
  #beforeDispose = new Signal<string>();
  #beforePlacement = new Signal<string>();
  #publishing = false;
  #pending = false;
  #generation = 0;
  #incarnation = 0;
  #commandDepth = 0;
  #cleanup: (() => void)[] = [];
  #appUnsubscribe: () => void;
  #live = true;
  #restoring = false;
  constructor(private readonly application: EditorApplication) {
    this.#appUnsubscribe = application.subscribe(() => this.route());
  }
  private mutable() {
    demand(
      this.#live && !this.#publishing && !this.#restoring,
      "WORKSPACE_BUSY",
    );
  }
  register(type: PanelType): void {
    this.mutable();
    demand(
      name(type.typeId) &&
        Number.isSafeInteger(type.viewStateVersion) &&
        type.viewStateVersion > 0 &&
        !this.#types.has(type.typeId),
      "DUPLICATE_PANEL",
    );
    this.#types.set(type.typeId, Object.freeze({ ...type }));
  }
  subscribe(fn: () => void): () => void {
    demand(this.#live, "WORKSPACE_DISPOSED");
    return this.#signal.subscribe(fn);
  }
  beforePanelDispose(fn: (id: string) => void): () => void {
    return this.#beforeDispose.subscribe(fn);
  }
  beforePanelPlacement(fn: (id: string) => void): () => void {
    return this.#beforePlacement.subscribe(fn);
  }
  private preparePlacement(ids: string[]): void {
    const prior = this.#publishing;
    this.#publishing = true;
    try {
      for (const id of ids) this.#beforePlacement.emit(id);
    } finally {
      this.#publishing = prior;
    }
  }
  records(): readonly PanelRecord[] {
    return [...this.#records.values()].map((r) =>
      Object.freeze({
        saved: detached(r.saved),
        type: r.type,
        instance: r.instance,
        update: detached(r.update),
        issues: [...r.issues],
        incarnation: r.incarnation,
        placement: r.placement,
      }),
    );
  }
  record(id: string): PanelRecord {
    const r = this.records().find((r) => r.saved.id === id);
    demand(r, "PANEL_MISSING");
    return r;
  }
  panes(): readonly WorkspacePane[] {
    return detached([...this.#panes.values()]);
  }
  widths(): { left: number; right: number } {
    return detached(this.#widths);
  }
  addPane(
    id: string,
    zone: WorkspacePane["zone"] = "center",
    index = this.#panes.size,
  ): void {
    this.mutable();
    demand(
      name(id) &&
        !this.#panes.has(id) &&
        ["left", "center", "right", "utility"].includes(zone) &&
        Number.isInteger(index) &&
        index >= 0 &&
        index <= this.#panes.size,
      "PANE_DATA",
    );
    const entries = [...this.#panes.entries()];
    entries.splice(index, 0, [
      id,
      { id, zone, weight: 1, tabs: [], active: null },
    ]);
    this.#panes = new Map(entries);
    this.route();
  }
  visible(id: string): boolean {
    const r = this.#records.get(id);
    return (
      !!r &&
      !r.saved.hidden &&
      !r.saved.collapsed &&
      (r.saved.floating
        ? !r.saved.floating.collapsed
        : this.#panes.get(r.saved.paneId)?.active === id)
    );
  }
  open(saved: SavedPanel): void {
    this.mutable();
    savedValid(saved);
    demand(!this.#records.has(saved.id), "DUPLICATE_PANEL");
    demand(this.#panes.has(saved.paneId), "PANE_MISSING");
    const r = this.construct(saved);
    this.#records.set(saved.id, r);
    const pane = this.#panes.get(saved.paneId)!;
    pane.tabs.push(saved.id);
    pane.active = saved.id;
    this.route();
  }
  private construct(saved: SavedPanel): Internal {
    const priorPublishing = this.#publishing;
    this.#publishing = true;
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
      placement: 0,
      unsubscribe: () => {},
      signature: undefined,
    };
    try {
      demand(
        type && type.viewStateVersion === saved.viewStateVersion,
        "PANEL_UNAVAILABLE",
      );
      demand(!saved.floating || type.upperSlotFloat, "PANEL_FLOAT_UNAVAILABLE");
      const hint =
        saved.contextHint ??
        (saved.route?.mode === "context" ? saved.route.hint : undefined);
      if (hint) {
        const context = this.application.restoreContext(hint);
        demand(context, "CONTEXT_UNRESOLVED");
        r.ownedContext = context.id;
        if (saved.contextHint) {
          r.saved.contextId = context.id;
          delete r.saved.contextHint;
        } else r.saved.route = { mode: "context", contextId: context.id };
      }
      const contextId =
        r.saved.contextId ??
        (r.saved.route?.mode === "context"
          ? r.saved.route.contextId
          : undefined);
      if (contextId) {
        const release = type.providesContext
          ? this.application.borrowContext(contextId)
          : () => {};
        const unsubscribe = this.application
          .context(contextId)
          .subscribe(() => this.route());
        r.unsubscribe = () => {
          unsubscribe();
          release();
        };
      }
      const services: PanelServices = {
        catalog: (lease, wire) => {
          this.assertLease(r, lease);
          demand(r.update.target, "TARGET_MISSING");
          return this.application.creationCatalog(
            this.application.context(r.update.target.scope.contextId),
            wire,
          );
        },
        editing: (lease) => {
          this.assertLease(r, lease);
          return !this.application.readonly && !this.application.busy;
        },
        identifier: () => this.application.identifier(),
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
    } catch (error) {
      r.issues.push(String(error));
      try {
        r.instance?.dispose();
      } catch {}
      r.instance = null;
      r.unsubscribe();
      if (r.ownedContext) {
        this.application.releaseContext(r.ownedContext);
        delete r.ownedContext;
      }
      r.saved = structuredClone(saved);
    }
    this.#publishing = priorPublishing;
    return r;
  }
  retry(id: string): void {
    this.mutable();
    const old = this.#records.get(id);
    demand(old && !old.instance, "PANEL_RETRY");
    const next = this.construct(old.saved);
    if (old.ownedContext) next.ownedContext = old.ownedContext;
    this.#beforeDispose.emit(id);
    old.unsubscribe();
    this.#records.set(id, next);
    this.route();
  }
  activate(id: string): void {
    this.mutable();
    const r = this.#records.get(id);
    demand(r, "PANEL_MISSING");
    if (r.type?.providesContext && r.instance && r.saved.contextId) {
      const previous = this.provider(0)?.saved.contextId;
      if (previous && previous !== r.saved.contextId)
        demand(
          !this.application.originBusy(undefined, previous),
          "HISTORY_BUSY",
        );
      this.#activation = this.#activation.filter((x) => x !== id);
      this.#activation.push(id);
    }
    r.saved.hidden = false;
    r.saved.collapsed = false;
    if (r.saved.floating) r.saved.floating.collapsed = false;
    this.#panes.get(r.saved.paneId)!.active = id;
    this.route();
  }
  private provider(group: number): Internal | undefined {
    return [...this.#activation]
      .reverse()
      .map((id) => this.#records.get(id))
      .find(
        (r) =>
          r?.type?.providesContext &&
          r.instance &&
          r.saved.contextId &&
          (group === 0 || (r.saved.linkGroup ?? 0) === group),
      );
  }
  activeCanvas(): PanelRecord | null {
    const provider = this.provider(0);
    return provider ? this.record(provider.saved.id) : null;
  }
  setRoute(id: string, route: PanelRoute): void {
    this.mutable();
    plain(route as unknown);
    routeValid(route);
    const r = this.#records.get(id);
    demand(r, "PANEL_MISSING");
    this.preflight(r, "HISTORY_BUSY");
    demand(!r.type?.providesContext && !r.saved.contextId, "PROVIDER_ROUTE");
    if (route.mode === "context") {
      demand(route.contextId && !route.hint, "CONTEXT_MISSING");
      this.application.context(route.contextId).capture();
    }
    r.unsubscribe();
    r.unsubscribe = () => {};
    if (route.mode === "context")
      r.unsubscribe = this.application
        .context(route.contextId!)
        .subscribe(() => this.route());
    if (
      r.ownedContext &&
      (route.mode !== "context" || route.contextId !== r.ownedContext)
    ) {
      this.application.releaseContext(r.ownedContext);
      delete r.ownedContext;
    }
    r.saved.route = structuredClone(route);
    this.route();
  }
  retarget(id: string, contextId: string): void {
    this.setRoute(id, { mode: "context", contextId });
  }
  setLinkGroup(id: string, group: number): void {
    this.mutable();
    demand(Number.isSafeInteger(group) && group >= 0, "PANEL_GROUP");
    const r = this.#records.get(id);
    demand(r, "PANEL_MISSING");
    this.preflight(r, "HISTORY_BUSY");
    r.saved.linkGroup = group;
    this.route();
  }
  move(id: string, paneId: string, index?: number): void {
    this.mutable();
    const r = this.#records.get(id),
      pane = this.#panes.get(paneId);
    demand(r && pane, "PANE_MISSING");
    const to = index ?? pane.tabs.filter((x) => x !== id).length;
    demand(
      Number.isInteger(to) &&
        to >= 0 &&
        to <= pane.tabs.filter((x) => x !== id).length,
      "TAB_INDEX",
    );
    this.preparePlacement([id]);
    const old = this.#panes.get(r.saved.paneId)!;
    old.tabs = old.tabs.filter((x) => x !== id);
    if (old.active === id)
      old.active =
        old.tabs.find((x) => !this.#records.get(x)?.saved.hidden) ?? null;
    r.placement++;
    r.saved.paneId = paneId;
    delete r.saved.floating;
    pane.tabs.splice(to, 0, id);
    pane.active = id;
    this.route();
  }
  movePane(id: string, index: number): void {
    this.mutable();
    const pane = this.#panes.get(id);
    demand(pane, "PANE_MISSING");
    const entries = [...this.#panes.entries()];
    const positions = entries.flatMap(([key, p], n) =>
      p.zone === pane.zone ? [n] : [],
    );
    demand(
      Number.isInteger(index) && index >= 0 && index < positions.length,
      "PANE_INDEX",
    );
    const group = positions.map((n) => entries[n]);
    const old = group.findIndex(([key]) => key === id);
    if (old === index) return;
    this.preparePlacement(pane.tabs);
    group.splice(index, 0, group.splice(old, 1)[0]);
    positions.forEach((n, i) => {
      entries[n] = group[i];
    });
    this.#panes = new Map(entries);
    for (const r of this.#records.values())
      if (r.saved.paneId === id) r.placement++;
    this.route();
  }
  split(id: string, paneId: string, zone: WorkspacePane["zone"]): void {
    this.mutable();
    demand(
      this.#records.has(id) &&
        name(paneId) &&
        !this.#panes.has(paneId) &&
        ["left", "center", "right"].includes(zone),
      "PANE_DATA",
    );
    this.addPane(paneId, zone);
    this.move(id, paneId);
  }
  hide(id: string, hidden: boolean): void {
    this.mutable();
    const r = this.#records.get(id);
    demand(r && typeof hidden === "boolean", "PANEL_MISSING");
    if (r.saved.floating) this.dock(id);
    this.preparePlacement([id]);
    r.saved.hidden = hidden;
    const p = this.#panes.get(r.saved.paneId)!;
    if (hidden && p.active === id)
      p.active =
        p.tabs.find((x) => !this.#records.get(x)!.saved.hidden) ?? null;
    if (!hidden) p.active = id;
    this.route();
  }
  collapse(id: string, collapsed: boolean): void {
    this.mutable();
    const r = this.#records.get(id);
    demand(r, "PANEL_MISSING");
    this.preparePlacement([id]);
    r.saved.collapsed = collapsed;
    if (r.saved.floating) r.saved.floating.collapsed = collapsed;
    this.route();
  }
  float(id: string): void {
    this.mutable();
    const r = this.#records.get(id);
    demand(r?.type?.upperSlotFloat, "PANEL_FLOAT_UNAVAILABLE");
    for (const x of this.#records.values())
      if (x.saved.floating && x !== r) this.dock(x.saved.id);
    this.preparePlacement([id]);
    r.saved.floating ??= {
      dockPaneId: r.saved.paneId,
      dockIndex: this.#panes.get(r.saved.paneId)!.tabs.indexOf(id),
      width: r.saved.floatWidth ?? 320,
      collapsed: !!r.saved.collapsed,
    };
    r.saved.hidden = false;
    this.route();
  }
  dock(id: string): void {
    this.mutable();
    const r = this.#records.get(id);
    demand(r, "PANEL_MISSING");
    if (!r.saved.floating) return;
    const f = r.saved.floating;
    r.saved.floatWidth = f.width;
    delete r.saved.floating;
    this.move(
      id,
      f.dockPaneId,
      Math.min(
        f.dockIndex,
        this.#panes.get(f.dockPaneId)!.tabs.filter((x) => x !== id).length,
      ),
    );
  }
  resizeFloat(id: string, width: number): void {
    this.mutable();
    const r = this.#records.get(id);
    demand(
      r?.saved.floating && Number.isFinite(width) && width >= 280,
      "PANEL_FLOAT",
    );
    r.saved.floating.width = width;
    r.saved.floatWidth = width;
    this.route();
  }
  resizeSide(side: "left" | "right", width: number): void {
    this.mutable();
    demand(
      (side === "left" || side === "right") &&
        Number.isFinite(width) &&
        width >= (side === "left" ? 180 : 300) &&
        width <= (side === "left" ? 520 : 640),
      "SIDE_WIDTH",
    );
    this.#widths[side] = width;
    this.route();
  }
  resizePair(a: string, b: string, first: number, second: number): void {
    this.mutable();
    const x = this.#panes.get(a),
      y = this.#panes.get(b);
    const list = [...this.#panes.values()].filter(
      (p) =>
        p.zone === x?.zone &&
        p.tabs.some(
          (id) => this.visible(id) && !this.#records.get(id)!.saved.floating,
        ),
    );
    demand(
      x &&
        y &&
        list.indexOf(y) === list.indexOf(x) + 1 &&
        Number.isFinite(first) &&
        Number.isFinite(second) &&
        first > 0 &&
        second > 0,
      "PANE_WEIGHT",
    );
    x.weight = first;
    y.weight = second;
    this.route();
  }
  private preflight(r: Internal, code = "PANEL_CLOSE_VETO") {
    const before = this.#publishing;
    this.#publishing = true;
    try {
      demand(
        !this.application.originBusy(
          r.saved.id,
          r.update.target?.scope.contextId,
        ) &&
          (!r.instance || r.instance.canClose()),
        code,
      );
    } finally {
      this.#publishing = before;
    }
  }
  preflightClose(): void {
    this.mutable();
    for (const r of this.#records.values()) this.preflight(r);
  }
  close(id: string): void {
    this.mutable();
    const r = this.#records.get(id);
    demand(r, "PANEL_MISSING");
    this.preflight(r);
    this.remove(r);
    this.route();
  }
  private remove(r: Internal) {
    const priorPublishing = this.#publishing;
    this.#publishing = true;
    try {
      this.#records.delete(r.saved.id);
      this.#activation = this.#activation.filter((id) => id !== r.saved.id);
      const pane = this.#panes.get(r.saved.paneId)!;
      pane.tabs = pane.tabs.filter((id) => id !== r.saved.id);
      if (pane.active === r.saved.id)
        pane.active =
          pane.tabs.find((id) => !this.#records.get(id)?.saved.hidden) ?? null;
      this.#beforeDispose.emit(r.saved.id);
      r.unsubscribe();
      try {
        r.instance?.dispose();
      } catch (error) {
        r.issues.push(String(error));
      }
      if (r.ownedContext) this.application.releaseContext(r.ownedContext);
    } finally {
      this.#publishing = priorPublishing;
    }
  }
  exportState(): readonly SavedPanel[] {
    return this.records().map((r) => {
      const state = r.instance?.exportViewState() ?? r.saved.state;
      plain(state);
      return { ...r.saved, state: structuredClone(state) };
    });
  }
  save(): WorkspaceLayout {
    this.mutable();
    this.#publishing = true;
    try {
      const panels = this.exportState().map((s) => {
        if (s.contextId) {
          s.contextHint = this.application.contextHint(s.contextId);
          delete s.contextId;
        }
        if (s.route?.mode === "context" && s.route.contextId)
          s.route = {
            mode: "context",
            hint: this.application.contextHint(s.route.contextId),
          };
        return s;
      });
      const result = {
        version: 1 as const,
        panes: [...this.#panes.values()],
        panels,
        widths: this.#widths,
      };
      Workspace.validate(result);
      return detached(result);
    } finally {
      this.#publishing = false;
    }
  }
  static validate(value: unknown): asserts value is WorkspaceLayout {
    plain(value);
    demand(
      value && typeof value === "object" && !Array.isArray(value),
      "LAYOUT",
    );
    const l = value as unknown as WorkspaceLayout;
    keys(l, ["version", "panes", "panels", "widths"]);
    demand(
      l.version === 1 &&
        Array.isArray(l.panes) &&
        Array.isArray(l.panels) &&
        l.panes.length <= 64 &&
        l.panels.length <= 128,
      "LAYOUT_VERSION",
    );
    demand(l.widths && typeof l.widths === "object", "LAYOUT_WIDTH");
    keys(l.widths, ["left", "right"]);
    demand(
      typeof l.widths.left === "number" &&
        typeof l.widths.right === "number" &&
        l.widths.left >= 180 &&
        l.widths.left <= 520 &&
        l.widths.right >= 300 &&
        l.widths.right <= 640,
      "LAYOUT_WIDTH",
    );
    const ids = new Set<string>(),
      paneIds = new Set<string>(),
      tabs: string[] = [];
    for (const p of l.panes) {
      keys(p, ["id", "zone", "weight", "tabs", "active"]);
      demand(
        name(p.id) &&
          !paneIds.has(p.id) &&
          ["left", "center", "right", "utility"].includes(p.zone) &&
          Number.isFinite(p.weight) &&
          p.weight > 0 &&
          Array.isArray(p.tabs) &&
          p.tabs.every(name) &&
          (p.active === null || p.tabs.includes(p.active)),
        "LAYOUT_PANE",
      );
      paneIds.add(p.id);
      tabs.push(...p.tabs);
    }
    for (const s of l.panels) {
      savedValid(s, true);
      demand(
        !ids.has(s.id) &&
          paneIds.has(s.paneId) &&
          l.panes.find((p) => p.id === s.paneId)!.tabs.includes(s.id),
        "LAYOUT_PANEL",
      );
      ids.add(s.id);
      if (s.floating)
        demand(
          s.floating.dockPaneId === s.paneId &&
            s.floating.dockIndex <
              l.panes.find((p) => p.id === s.paneId)!.tabs.length,
          "LAYOUT_DOCK",
        );
    }
    demand(
      tabs.length === ids.size &&
        new Set(tabs).size === tabs.length &&
        tabs.every((id) => ids.has(id)) &&
        l.panels.filter((s) => s.floating).length <= 1,
      "LAYOUT_TABS",
    );
    demand(
      new TextEncoder().encode(JSON.stringify(l)).length <= 262144,
      "LAYOUT_SIZE",
    );
  }
  restore(value: unknown): void {
    this.mutable();
    demand(!this.#records.size && !this.#panes.size, "WORKSPACE_NOT_EMPTY");
    Workspace.validate(value);
    const layout = structuredClone(value);
    this.#restoring = true;
    try {
      this.#panes = new Map(layout.panes.map((p) => [p.id, p]));
      this.#widths = layout.widths;
      for (const saved of layout.panels)
        this.#records.set(saved.id, this.construct(saved));
    } finally {
      this.#restoring = false;
    }
    this.route();
  }
  private assertLease(r: Internal, lease: PanelCommandLease): void {
    demand(
      this.#live &&
        this.#records.get(r.saved.id) === r &&
        lease.panelId === r.saved.id &&
        lease.generation === r.update.lease.generation &&
        r.update.target,
      "STALE_PANEL_LEASE",
    );
  }
  private route(): void {
    if (!this.#live) return;
    if (this.#publishing || this.#restoring) {
      this.#pending = true;
      return;
    }
    this.#publishing = true;
    try {
      do {
        this.#pending = false;
        const revision = this.application.snapshot.revision;
        for (const r of this.#records.values()) {
          let target: PanelCommandTarget | null = null;
          const route = r.saved.route;
          const provider =
            route?.mode === "followCanvas"
              ? this.#records.get(route.panelId)
              : this.provider(r.saved.linkGroup ?? 0);
          const contextId =
            r.saved.contextId ??
            (route?.mode === "context"
              ? route.contextId
              : provider?.type?.providesContext && provider.instance
                ? provider.saved.contextId
                : undefined);
          let selection: readonly string[] = [];
          if (contextId)
            try {
              const c = this.application.context(contextId).capture();
              target = {
                scope: c.scope,
                object: c.primary ? { kind: "node", id: c.primary } : null,
              };
              selection = c.selection;
            } catch {}
          const signature = [
            target,
            selection,
            revision,
            this.application.readonly,
            this.application.busy,
            this.application.compilation,
          ];
          if (equal(r.signature, signature)) continue;
          r.signature = signature;
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
              } catch {}
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
    this.preflightClose();
    for (const r of [...this.#records.values()]) this.remove(r);
    this.#live = false;
    this.#appUnsubscribe();
    this.#signal.clear();
    this.#beforeDispose.clear();
    this.drain();
  }
}
