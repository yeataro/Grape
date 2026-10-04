import { Workspace } from "./workspace.ts";
import { floatingSurface, type FloatingOptions } from "./floating.ts";
import { mountDivider } from "./divider.ts";
import type { WorkspacePane } from "../sdk/ui.ts";
import type { LocalizationService } from "../sdk/localization.ts";
/** Placement DOM is owned here; feature content and commands stay in PanelRenderer. */
export class WorkspaceView {
  #live = true;
  #cleanups: (() => void)[] = [];
  #panes = new Map<
    string,
    { root: HTMLElement; tabs: HTMLElement; body: HTMLElement }
  >();
  #targets = new Map<string, HTMLElement>();
  #tabs = new Map<string, HTMLButtonElement>();
  #pairs = new Map<
    string,
    { element: HTMLElement; control: ReturnType<typeof mountDivider> }
  >();
  #float: {
    id: string;
    body: HTMLElement;
    options: FloatingOptions;
    view: ReturnType<typeof floatingSurface>;
    control: ReturnType<typeof mountDivider>;
    collapse: HTMLButtonElement;
  } | null = null;
  #zones = new Map<string, HTMLElement>();
  #drag: string | null = null;
  #menuId: string | null = null;
  #menu: ReturnType<typeof floatingSurface> | null = null;
  #menuContent: HTMLElement;
  #sideOpen = { left: true, right: true };
  #narrow = false;
  #visibility = "";
  #structural = "";
  constructor(
    private readonly workspace: Workspace,
    private readonly host: HTMLElement,
    private readonly locale: LocalizationService,
    private readonly report: (error: unknown) => void,
    private readonly externalPanes: readonly string[] = [],
    private readonly presentationChanged: () => void = () => {},
  ) {
    host.classList.add("workspace");
    host.replaceChildren();
    for (const zone of ["left", "center", "right"] as const) {
      const el = document.createElement(zone === "right" ? "aside" : "section");
      el.className = "workspace-zone workspace-" + zone;
      el.dataset.zone = zone;
      el.id =
        zone === "center"
          ? "canvases"
          : zone === "right"
            ? "inspector"
            : "workspace-left";
      this.#zones.set(zone, el);
      host.append(el);
      el.addEventListener("dragover", (e) => {
        if (this.#drag) {
          e.preventDefault();
          e.dataTransfer!.dropEffect = "move";
        }
      });
      el.addEventListener("drop", (e) =>
        this.attempt(() => {
          if (!this.#drag) return;
          e.preventDefault();
          const id = this.#drag;
          this.#drag = null;
          const pane = this.workspace.panes().find((p) => p.zone === zone);
          if (pane) this.workspace.move(id, pane.id);
          else this.workspace.split(id, this.nextPane(), zone);
        }),
      );
      if (zone !== "center") {
        const divider = document.createElement("div");
        divider.className = "workspace-side-divider";
        divider.dataset.side = zone;
        host.append(divider);
        const c = mountDivider(divider, {
          label: zone + " sidebar width",
          axis: "x",
          direction: zone === "left" ? 1 : -1,
          value: () => workspace.widths()[zone],
          limits: () => (zone === "left" ? [180, 520] : [300, 640]),
          reset: () => (zone === "left" ? 240 : 320),
          set: (v) => workspace.resizeSide(zone, v),
          scale: () => host.getBoundingClientRect().width / host.offsetWidth,
        });
        this.#cleanups.push(() => c.dispose());
        const close = document.createElement("button");
        close.type = "button";
        close.className = "workspace-overlay-close";
        close.textContent = "Close " + zone + " overlay";
        close.onclick = () => {
          this.#sideOpen[zone] = false;
          this.resize();
        };
        el.append(close);
      }
    }
    this.#menuContent = document.createElement("div");
    this.#menuContent.className = "workspace-panel-options";
    const resize = () => this.resize();
    window.addEventListener("resize", resize);
    this.#cleanups.push(() => window.removeEventListener("resize", resize));
    const key = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() !== "p" ||
        e.repeat ||
        e.isComposing ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        document.querySelector('dialog[open]:not([data-kind="upper-slot"])') ||
        (e.target instanceof Element &&
          e.target.closest("input,textarea,select,[contenteditable=true]"))
      )
        return;
      const r = this.workspace
        .records()
        .find((r) => r.type?.upperSlotFloat && !r.saved.hidden);
      if (!r) return;
      e.preventDefault();
      this.attempt(() =>
        r.saved.floating
          ? workspace.dock(r.saved.id)
          : workspace.float(r.saved.id),
      );
    };
    window.addEventListener("keydown", key);
    this.#cleanups.push(() => window.removeEventListener("keydown", key));
    this.#cleanups.push(
      workspace.beforePanelDispose((id) => {
        if (this.#menuId === id) {
          this.#menu?.close(false);
          this.#menuId = null;
        }
      }),
    );
    this.#cleanups.push(workspace.subscribe(() => this.sync()));
    this.sync();
  }
  private attempt(fn: () => void) {
    if (!this.#live) return;
    try {
      fn();
    } catch (error) {
      this.report(error);
    }
  }
  private label(id: string) {
    const r = this.workspace.record(id);
    return (
      (r.type
        ? this.locale.resolve(r.type.presentation.label).text
        : r.saved.typeId) +
      " · " +
      id
    );
  }
  private nextPane() {
    let n = 1;
    while (this.workspace.panes().some((p) => p.id === "pane-" + n)) n++;
    return "pane-" + n;
  }
  private button(label: string, fn: () => void) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.onclick = () => this.attempt(fn);
    return b;
  }
  panelOptions(id: string, anchor: HTMLElement) {
    this.options(id, anchor);
  }
  private options(id: string, anchor: HTMLElement) {
    const incarnation = this.workspace.record(id).incarnation;
    const guard = () => {
      if (this.workspace.record(id).incarnation !== incarnation)
        throw Error("PANEL_EXPIRED");
    };
    this.#menuId = id;
    this.#menu?.dispose();
    this.#menu = floatingSurface({
      host: this.host,
      trigger: anchor,
      content: this.#menuContent,
      title: "Panel options",
      closeLabel: "Close panel options",
      kind: "anchored",
      width: 310,
      maxHeight: 580,
    });
    this.#menuContent.replaceChildren();
    const add = (label: string, fn: () => void) =>
      this.#menuContent.append(
        this.button(label, () => {
          guard();
          fn();
          this.#menu?.close(false);
        }),
      );
    add("Hide panel", () => this.workspace.hide(id, true));
    add("Close panel", () => this.workspace.close(id));
    add("Toggle collapse", () =>
      this.workspace.collapse(id, !this.workspace.record(id).saved.collapsed),
    );
    const r = this.workspace.record(id);
    if (r.type?.upperSlotFloat)
      add(r.saved.floating ? "Return to dock" : "Float Parameters", () =>
        r.saved.floating ? this.workspace.dock(id) : this.workspace.float(id),
      );
    const row = (label: string, input: HTMLElement) => {
      const l = document.createElement("label");
      l.append(label, input);
      this.#menuContent.append(l);
    };
    const group = document.createElement("input");
    group.type = "number";
    group.min = "0";
    group.step = "1";
    group.value = String(r.saved.linkGroup ?? 0);
    group.ariaLabel = "Panel link group";
    group.onchange = () =>
      this.attempt(() => {
        guard();
        this.workspace.setLinkGroup(id, Number(group.value));
      });
    row("Link group", group);
    if (!r.type?.providesContext) {
      const route = document.createElement("select");
      route.ariaLabel = "Panel source";
      route.add(new Option("Follow active Canvas in group", "follow"));
      for (const p of this.workspace
        .records()
        .filter((p) => p.type?.providesContext))
        route.add(new Option(this.label(p.saved.id), p.saved.id));
      if (
        r.saved.route?.mode === "followCanvas" &&
        !this.workspace
          .records()
          .some(
            (x) =>
              x.saved.id === (r.saved.route as { panelId: string }).panelId,
          )
      )
        route.add(
          new Option("Missing " + r.saved.route.panelId, r.saved.route.panelId),
        );
      route.value =
        r.saved.route?.mode === "followCanvas"
          ? r.saved.route.panelId
          : "follow";
      route.onchange = () =>
        this.attempt(() => {
          guard();
          this.workspace.setRoute(
            id,
            route.value === "follow"
              ? { mode: "follow" }
              : { mode: "followCanvas", panelId: route.value },
          );
        });
      row("Source", route);
    }
    for (const p of this.workspace.panes().filter((p) => p.zone !== "utility"))
      add("Move to " + p.id, () => this.workspace.move(id, p.id));
    const pane = this.workspace.panes().find((p) => p.id === r.saved.paneId)!;
    const index = pane.tabs.indexOf(id);
    if (index > 0)
      add("Move tab earlier", () =>
        this.workspace.move(id, pane.id, index - 1),
      );
    if (index < pane.tabs.length - 1)
      add("Move tab later", () => this.workspace.move(id, pane.id, index + 1));
    const groups = this.workspace.panes().filter((p) => p.zone === pane.zone);
    const groupIndex = groups.findIndex((p) => p.id === pane.id);
    if (groupIndex > 0)
      add("Move group earlier", () =>
        this.workspace.movePane(pane.id, groupIndex - 1),
      );
    if (groupIndex < groups.length - 1)
      add("Move group later", () =>
        this.workspace.movePane(pane.id, groupIndex + 1),
      );
    for (const zone of ["left", "center", "right"] as const)
      add("Split to " + zone, () =>
        this.workspace.split(id, this.nextPane(), zone),
      );
    this.#menu!.open(this.#menuContent.querySelector("button"));
  }
  surface(pane: string, id: string): HTMLElement {
    let target = this.#targets.get(id);
    if (!target) {
      target = document.createElement("div");
      target.id = id.startsWith("canvas-") ? id : "panel-" + id;
      target.className = "workspace-panel-body";
      target.dataset.panel = id;
      this.#targets.set(id, target);
    }
    const destination = pane.startsWith("float:")
      ? this.#float?.body
      : this.#panes.get(pane)?.body;
    if (!destination) throw Error("PANE_SURFACE_MISSING");
    if (target.parentElement !== destination) destination.append(target);
    target.hidden = false;
    return target;
  }
  presented(id: string, pane: string): boolean {
    if (
      this.workspace.record(id).saved.floating ||
      this.externalPanes.includes(pane)
    )
      return true;
    const zone = this.workspace.panes().find((p) => p.id === pane)?.zone;
    return (
      (zone !== "left" && zone !== "right") || !this.#zones.get(zone)!.hidden
    );
  }
  show(id: string) {
    this.attempt(() => {
      const r = this.workspace.record(id);
      const zone = this.workspace
        .panes()
        .find((p) => p.id === r.saved.paneId)?.zone;
      if (zone === "left" || zone === "right") this.#sideOpen[zone] = true;
      this.workspace.hide(id, false);
    });
  }
  private sync() {
    if (!this.#live) return;
    const panes = this.workspace
        .panes()
        .filter((p) => !this.externalPanes.includes(p.id)),
      records = this.workspace.records();
    const structure = JSON.stringify(panes.map((p) => [p.id, p.zone, p.tabs]));
    for (const p of panes) {
      let view = this.#panes.get(p.id);
      if (!view) {
        const root = document.createElement("section"),
          tabs = document.createElement("div"),
          body = document.createElement("div");
        root.className = "workspace-pane";
        root.dataset.pane = p.id;
        tabs.className = "workspace-tabs";
        tabs.setAttribute("role", "tablist");
        tabs.ariaLabel = p.id + " panels";
        body.className = "workspace-pane-content";
        root.append(tabs, body);
        view = { root, tabs, body };
        this.#panes.set(p.id, view);
        root.addEventListener("dragover", (e) => {
          if (this.#drag) e.preventDefault();
        });
        root.addEventListener("drop", (e) =>
          this.attempt(() => {
            if (!this.#drag) return;
            e.preventDefault();
            e.stopPropagation();
            const id = this.#drag;
            this.#drag = null;
            const before = (e.target as Element).closest<HTMLElement>(
              "[data-tab]",
            )?.dataset.tab;
            const current = this.workspace.panes().find((x) => x.id === p.id)!;
            const index = before
              ? current.tabs.filter((x) => x !== id).indexOf(before)
              : undefined;
            this.workspace.move(id, p.id, index);
          }),
        );
      }
      const zone = this.#zones.get(p.zone === "utility" ? "center" : p.zone)!;
      const ordered = panes.filter(
        (pane) =>
          (pane.zone === "utility" ? "center" : pane.zone) ===
          (p.zone === "utility" ? "center" : p.zone),
      );
      const position = ordered.findIndex((pane) => pane.id === p.id);
      const current = [...zone.children].filter((e) =>
        e.classList.contains("workspace-pane"),
      );
      if (current[position] !== view.root)
        zone.insertBefore(view.root, current[position] ?? null);
      for (const id of p.tabs) {
        const r = records.find((r) => r.saved.id === id)!;
        let tab = this.#tabs.get(id);
        if (tab && tab.dataset.incarnation !== String(r.incarnation)) {
          tab.remove();
          this.#tabs.delete(id);
          tab = undefined;
        }
        if (!tab) {
          const incarnation = r.incarnation;
          tab = this.button(this.label(id), () => {
            if (this.workspace.record(id).incarnation !== incarnation)
              throw Error("PANEL_EXPIRED");
            this.workspace.activate(id);
          });
          tab.dataset.tab = id;
          tab.dataset.incarnation = String(incarnation);
          tab.setAttribute("role", "tab");
          tab.draggable = true;
          tab.addEventListener("dragstart", (e) => {
            this.#drag = id;
            e.dataTransfer!.setData("text/plain", id);
            e.dataTransfer!.effectAllowed = "move";
          });
          tab.addEventListener("dragend", () => {
            this.#drag = null;
          });
          tab.oncontextmenu = (e) => {
            e.preventDefault();
            this.options(id, tab!);
          };
          tab.addEventListener("keydown", (e) => {
            if (e.key === "ContextMenu" || (e.key === "F10" && e.shiftKey)) {
              e.preventDefault();
              this.options(id, tab!);
            }
          });
          this.#tabs.set(id, tab);
        }
        tab.hidden = r.saved.hidden || !!r.saved.floating;
        tab.setAttribute("aria-selected", String(p.active === id));
        tab.title = this.label(id);
        if (tab.parentElement !== view.tabs) view.tabs.append(tab);
      }
      if (this.#structural !== structure) {
        for (const id of p.tabs) {
          const tab = this.#tabs.get(id)!;
          view.tabs.append(tab);
        }
      }
      let controls = view.tabs.querySelector<HTMLElement>(
        ".workspace-tab-controls",
      );
      if (!controls) {
        controls = document.createElement("div");
        controls.className = "workspace-tab-controls";
        view.tabs.append(controls);
        controls.append(
          this.button("▾", () => {
            const id = this.workspace
              .panes()
              .find((x) => x.id === p.id)?.active;
            if (id)
              this.workspace.collapse(
                id,
                !this.workspace.record(id).saved.collapsed,
              );
          }),
          this.button("⋯", () => {
            const id = this.workspace
              .panes()
              .find((x) => x.id === p.id)?.active;
            if (id) this.options(id, controls!);
          }),
        );
      }
      controls.querySelectorAll("button")[0].ariaLabel =
        "Collapse active panel in " + p.id;
      controls.querySelectorAll("button")[1].ariaLabel =
        "Panel options in " + p.id;
      if (controls !== view.tabs.lastElementChild) view.tabs.append(controls);
      const available = p.tabs.some((id) => {
        const r = records.find((x) => x.saved.id === id)!;
        return !r.saved.hidden && !r.saved.floating;
      });
      view.root.hidden = !available;
      const expanded = p.tabs.some(
        (id) =>
          this.workspace.visible(id) &&
          !records.find((x) => x.saved.id === id)!.saved.floating,
      );
      view.root.style.flex = expanded ? String(p.weight) + " 1 0" : "0 0 auto";
      view.body.hidden = !expanded;
      view.root.dataset.expanded = String(expanded);
      let routeStatus = view.tabs.querySelector<HTMLElement>(
        ".workspace-route-status",
      );
      if (!routeStatus) {
        routeStatus = document.createElement("span");
        routeStatus.className = "workspace-route-status";
        view.tabs.insertBefore(routeStatus, controls);
      }
      const active = records.find((r) => r.saved.id === p.active);
      routeStatus.textContent =
        active && !active.type?.providesContext && !active.update.target
          ? "No Canvas source"
          : "";
    }
    for (const [id, tab] of this.#tabs)
      if (!records.some((r) => r.saved.id === id)) {
        tab.remove();
        this.#tabs.delete(id);
        this.#targets.get(id)?.remove();
        this.#targets.delete(id);
      }
    for (const [id, target] of this.#targets)
      target.hidden = !this.workspace.visible(id);
    if (this.#menuId && !records.some((r) => r.saved.id === this.#menuId)) {
      this.#menu?.close(false);
      this.#menuId = null;
    }
    this.syncFloat();
    this.syncPairs();
    this.resize();
    this.#structural = structure;
  }
  private syncFloat() {
    const record = this.workspace
      .records()
      .find((r) => r.saved.floating && !r.saved.hidden);
    if (this.#float && this.#float.id !== record?.saved.id) {
      const old = this.#float;
      this.#float = null;
      old.control.dispose();
      old.view.dispose();
    }
    if (!record) return;
    const id = record.saved.id,
      f = record.saved.floating!;
    if (!this.#float) {
      const body = document.createElement("div"),
        content = document.createElement("div"),
        divider = document.createElement("div");
      body.className = "workspace-float-body";
      divider.className = "workspace-float-divider";
      content.append(divider, body);
      const options: FloatingOptions = {
        host: this.host,
        content,
        title: this.label(id),
        closeLabel: "Return Parameters to dock",
        kind: "upper-slot",
        width: f.width,
        maxHeight: Math.max(100, innerHeight - 24),
        dismissOutside: false,
        closed: () => {
          if (this.#live && this.#float?.id === id)
            this.attempt(() => this.workspace.dock(id));
        },
        fallbackFocus: () => this.#tabs.get(id) ?? this.host,
      };
      const view = floatingSurface(options);
      view.surface.classList.add("workspace-float");
      const collapse = this.button("Collapse Parameters", () =>
        this.workspace.collapse(id, !this.workspace.record(id).saved.collapsed),
      );
      view.surface.insertBefore(collapse, content);
      const control = mountDivider(divider, {
        label: "Parameters floating width",
        axis: "x",
        direction: -1,
        valid: () =>
          !!this.workspace.records().find((r) => r.saved.id === id)?.saved
            .floating,
        value: () => this.workspace.record(id).saved.floating?.width ?? 320,
        limits: () => [280, Math.max(280, innerWidth - 24)],
        reset: () => 320,
        set: (v) => this.workspace.resizeFloat(id, v),
      });
      this.#float = { id, body, options, view, control, collapse };
      view.open(null);
    }
    const item = this.#float;
    item.options.width = f.width;
    item.options.maxHeight = Math.max(100, innerHeight - 24);
    item.body.hidden = !!record.saved.collapsed;
    item.collapse.textContent = record.saved.collapsed
      ? "Expand Parameters"
      : "Collapse Parameters";
    item.view.position();
    item.control.refresh();
  }
  private syncPairs() {
    const wanted = new Set<string>();
    for (const zone of ["left", "center", "right"]) {
      const panes = this.workspace
        .panes()
        .filter(
          (p) =>
            p.zone === zone &&
            p.tabs.some(
              (id) =>
                this.workspace.visible(id) &&
                !this.workspace.record(id).saved.floating,
            ),
        );
      for (let i = 0; i < panes.length - 1; i++) {
        const a = panes[i],
          b = panes[i + 1],
          key = a.id + "/" + b.id;
        wanted.add(key);
        if (this.#pairs.has(key)) {
          const divider = this.#pairs.get(key)!.element;
          const nextPane = this.#panes.get(b.id)!.root;
          // Value publications must not detach the focused/captured separator.
          if (divider.nextSibling !== nextPane) nextPane.before(divider);
          continue;
        }
        const element = document.createElement("div");
        element.className = "workspace-group-divider";
        const pair = () => {
          const list = this.workspace.panes();
          return [
            list.find((p) => p.id === a.id)!,
            list.find((p) => p.id === b.id)!,
          ] as const;
        };
        const height = () =>
          Math.max(
            80,
            this.#panes.get(a.id)!.root.getBoundingClientRect().height +
              this.#panes.get(b.id)!.root.getBoundingClientRect().height,
          );
        const control = mountDivider(element, {
          valid: () => {
            const current = this.workspace
              .panes()
              .filter(
                (p) =>
                  p.zone === a.zone &&
                  p.tabs.some(
                    (id) =>
                      this.workspace.visible(id) &&
                      !this.workspace.record(id).saved.floating,
                  ),
              );
            return (
              current.findIndex((p) => p.id === b.id) ===
                current.findIndex((p) => p.id === a.id) + 1 &&
              current.some((p) => p.id === a.id)
            );
          },
          label: "Resize " + a.id + " and " + b.id,
          axis: "y",
          value: () => {
            const [x, y] = pair();
            return (height() * x.weight) / (x.weight + y.weight);
          },
          limits: () => [36, height() - 36],
          reset: () => height() / 2,
          set: (v) => {
            const [x, y] = pair(),
              total = x.weight + y.weight,
              fraction = v / height();
            this.workspace.resizePair(
              a.id,
              b.id,
              total * fraction,
              total * (1 - fraction),
            );
          },
        });
        this.#pairs.set(key, { element, control });
        this.#panes.get(b.id)!.root.before(element);
      }
    }
    for (const [key, pair] of this.#pairs)
      if (!wanted.has(key)) {
        pair.control.dispose();
        pair.element.remove();
        this.#pairs.delete(key);
      }
  }
  private resize() {
    const widths = this.workspace.widths(),
      narrow = innerWidth <= 800;
    if (narrow && !this.#narrow) this.#sideOpen = { left: false, right: false };
    this.#narrow = narrow;
    this.host.dataset.narrow = String(narrow);
    for (const side of ["left", "right"] as const) {
      const zone = this.#zones.get(side)!;
      const available = [
        ...zone.querySelectorAll<HTMLElement>(".workspace-pane"),
      ].some((p) => !p.hidden);
      const shown = available && (!narrow || this.#sideOpen[side]);
      zone.hidden = !shown;
      this.host.querySelector<HTMLElement>("[data-side=" + side + "]")!.hidden =
        !shown;
      const rendered = Math.min(
        widths[side],
        Math.max(160, this.host.clientWidth * (narrow ? 0.85 : 0.38)),
      );
      this.host.style.setProperty("--workspace-" + side, rendered + "px");
      this.host.style.setProperty(
        "--" + side + "-visible",
        shown ? rendered + "px" : "0px",
      );
      this.host.style.setProperty(
        "--" + side + "-handle",
        shown ? "6px" : "0px",
      );
    }
    if (this.#float) {
      this.#float.options.maxHeight = Math.max(100, innerHeight - 24);
      this.#float.view.position();
    }
    // Initial insertion and viewport changes alter the pair's pixel extent.
    // Publish its actual accessible value after layout, without moving it.
    for (const pair of this.#pairs.values()) pair.control.refresh();
    const visibility = JSON.stringify([
      this.#zones.get("left")!.hidden,
      this.#zones.get("right")!.hidden,
    ]);
    if (visibility !== this.#visibility) {
      this.#visibility = visibility;
      this.presentationChanged();
    }
  }
  dispose() {
    if (!this.#live) return;
    this.#live = false;
    this.#cleanups.forEach((fn) => fn());
    for (const p of this.#pairs.values()) p.control.dispose();
    this.#float?.control.dispose();
    this.#float?.view.dispose();
    this.#menu?.dispose();
    this.host.replaceChildren();
  }
}
