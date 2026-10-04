import type {
  CatalogEntry,
  CatalogWire,
  PanelServices,
  PanelUpdate,
} from "../sdk/ui.ts";
import type { ContextSnapshot } from "../sdk/editing.ts";
import type { PanelMountContext } from "../sdk/view-mount.ts";
import type { Json } from "../sdk/public-surface.ts";

const normalized = (text: string) =>
  text.normalize("NFKC").toLowerCase().trim();
/** Literal, all-term ranking; module metadata remains the source of names and aliases. */
export function catalogRank(item: CatalogEntry, query: string): number | null {
  const q = normalized(query),
    name = normalized(item.presentation.label.fallback),
    aliases = (item.presentation.searchTerms ?? []).map((t) =>
      normalized(t.fallback),
    ),
    category = normalized(item.presentation.category?.label.fallback ?? ""),
    description = normalized(item.presentation.description?.fallback ?? ""),
    terms = q.split(/\s+/);
  if (!q || name === q) return 0;
  if (aliases.includes(q)) return 1;
  if (name.startsWith(q)) return 2;
  if (terms.every((t) => name.includes(t))) return 3;
  if (terms.every((t) => [name, ...aliases].join(" ").includes(t))) return 4;
  if (terms.every((t) => [name, ...aliases, category].join(" ").includes(t)))
    return 5;
  if (
    terms.every((t) =>
      [name, ...aliases, category, description].join(" ").includes(t),
    )
  )
    return 6;
  return null;
}
export function icon(name: string): SVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("action-icon");
  const paths: Record<string, string> = {
    add: "M12 5v14M5 12h14",
    search: "M20 20l-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
    up: "m5 14 7-7 7 7M12 7v14",
    undo: "m8 4-5 5 5 5M3 9h10a7 7 0 0 1 0 14",
    redo: "m16 4 5 5-5 5M21 9h-10a7 7 0 0 0 0 14",
    help: "M9 8a3 3 0 0 1 6 0c0 3-3 2-3 5M12 17h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
    more: "M5 12h.01M12 12h.01M19 12h.01",
    delete: "M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7",
    close: "m6 6 12 12M18 6 6 18",
    folder: "M3 6h7l2 3h9v12H3z",
    save: "M4 3h13l4 4v14H4zM8 3v6h8V3M8 21v-8h9v8",
    code: "m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18",
    stage: "M4 4h16v16H4zM4 12h16M12 4v16",
    download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
    image: "M3 3h18v18H3zM3 16l5-5 4 4 3-3 6 6M8 7h.01",
    panels: "M3 4h18v16H3zM13 4v16",
    lock: "M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5zM12 14v3",
  };
  const p = document.createElementNS(svg.namespaceURI, "path");
  p.setAttribute("d", paths[name] ?? paths.folder!);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "currentColor");
  p.setAttribute("stroke-width", "1.6");
  p.setAttribute("stroke-linecap", "round");
  p.setAttribute("stroke-linejoin", "round");
  svg.append(p);
  return svg;
}
/** Shared display-only card row: preview and mounted node use identical socket geometry. */
export function nodePortRow(
  port: import("../sdk/document.ts").PortSnapshot,
  label: string,
  node?: { id: string; name: string },
  connected = false,
  value: Json | undefined = port.defaultValue,
): HTMLElement {
  const row = document.createElement("div"),
    button = document.createElement("button"),
    socket = document.createElement("span"),
    caption = document.createElement("span"),
    type = document.createElement("small");
  row.className = "port-row " + port.direction;
  button.type = "button";
  button.className = "port";
  button.dataset.direction = port.direction;
  if (node) {
    button.dataset.port = port.key;
    button.dataset.nodeId = node.id;
    button.ariaLabel = node.name + " " + port.direction + " " + label;
  } else {
    button.dataset.previewPort = port.key;
    button.tabIndex = -1;
  }
  socket.className = "socket";
  socket.classList.toggle("connected", connected);
  caption.textContent = label;
  const colors: Record<string, string> = {
    "glsl.float": "#c4c1bc",
    "glsl.vec2": "#8fc5ee",
    "glsl.vec3": "#87ceb7",
    "glsl.vec4": "#c5b2e2",
  };
  row.style.setProperty("--port-color", colors[port.type] ?? "#a1adb7");
  if (port.direction === "output") button.append(caption, socket);
  else button.append(socket, caption);
  type.textContent = port.type.replace("glsl.", "");
  row.append(button, type);
  if (port.direction === "input" && !connected && value !== undefined) {
    const display = document.createElement("span");
    display.className = "node-value";
    display.title = "Current local value; edit in Inspector";
    display.textContent =
      typeof value === "object" ? JSON.stringify(value) : String(value);
    row.append(display);
  }
  return row;
}
export function mountNodeBrowser(
  root: HTMLElement,
  mount: PanelMountContext,
  services: PanelServices,
  lease: () => PanelUpdate,
  camera: () => { x: number; y: number; zoom: number },
  report: (error: unknown) => void,
) {
  const panel = document.createElement("section"),
    title = document.createElement("header"),
    heading = document.createElement("strong"),
    close = document.createElement("button"),
    search = document.createElement("input"),
    filters = document.createElement("div"),
    libraryScope = document.createElement("select"),
    source = document.createElement("select"),
    type = document.createElement("select"),
    list = document.createElement("div"),
    detail = document.createElement("div"),
    preview = document.createElement("article"),
    previewWire = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  panel.className = "node-browser";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.ariaLabel = "Node catalog";
  heading.textContent = "Add Node";
  close.ariaLabel = "Close node catalog";
  close.append(icon("close"));
  title.append(heading, close);
  title.style.touchAction = "none";
  search.type = "search";
  search.placeholder = "Search nodes…";
  search.ariaLabel = "Search nodes";
  source.ariaLabel = "Node source";
  libraryScope.ariaLabel = "Library scope";
  for (const [value, label] of [
    ["", "All installed and project"],
    ["builtin", "Built-in"],
    ["project", "Project"],
  ]) {
    const option = document.createElement("option");
    option.value = value!;
    option.textContent = label!;
    libraryScope.append(option);
  }
  type.ariaLabel = "Node port type";
  filters.className = "catalog-filters";
  filters.append(libraryScope, source, type);
  list.className = "catalog-list";
  detail.className = "catalog-detail";
  detail.hidden = true;
  panel.append(title, search, filters, list, detail);
  preview.className = "creation-preview";
  preview.hidden = true;
  previewWire.classList.add("creation-wire");
  previewWire.style.display = "none";
  root.append(panel, previewWire, preview);
  let suppressClick = false;
  const validPlacement = (target: Element | null) =>
    !!target &&
    root.contains(target) &&
    !target.closest(
      ".node-browser,.canvas-menu,.network-toolbar,.canvas-entry-actions,.stage-switch,.canvas-breadcrumb,button,input,textarea,select,summary,dialog,[data-node],[data-edge]",
    );
  let entries: readonly CatalogEntry[] = [],
    visible: CatalogEntry[] = [],
    selected = 0,
    current: CatalogEntry | null = null,
    wire: CatalogWire | undefined,
    base = "",
    revision = -1,
    zoom = 1,
    point: [number, number] = [0, 0],
    mode: "create" | "browse" = "create",
    opener: HTMLElement | null = null,
    moving: {
      id: number;
      x: number;
      y: number;
      left: number;
      top: number;
      started: boolean;
    } | null = null,
    rowDrag: {
      id: number;
      x: number;
      y: number;
      item: CatalogEntry;
      started: boolean;
    } | null = null;
  const expanded = new Map<string, boolean>();
  const listen = (
    target: EventTarget,
    name: string,
    fn: (e: any) => void,
    options?: AddEventListenerOptions,
  ) => {
    const f = mount.scope.event(fn);
    target.addEventListener(name, f, options);
    mount.scope.own(() => target.removeEventListener(name, f, options));
  };
  const editable = () => services.editing?.(lease().lease) !== false;
  const context = () => services.context(lease().lease).capture();
  const graphPoint = (x: number, y: number): [number, number] => {
    const r = root.getBoundingClientRect(),
      c = camera();
    return [(x - r.left - c.x) / c.zoom, (y - r.top - c.y) / c.zoom];
  };
  const clamp = () => {
    panel.style.left = `${Math.max(0, Math.min(parseFloat(panel.style.left) || 0, root.clientWidth - panel.offsetWidth))}px`;
    panel.style.top = `${Math.max(0, Math.min(parseFloat(panel.style.top) || 0, root.clientHeight - panel.offsetHeight))}px`;
  };
  const cancel = (focus = true) => {
    if (moving) {
      panel.style.left = moving.left + "px";
      panel.style.top = moving.top + "px";
    }
    moving = null;
    rowDrag = null;
    current = null;
    panel.hidden = true;
    preview.hidden = true;
    preview.replaceChildren();
    previewWire.style.display = "none";
    if (focus)
      (mode === "create" ? root : opener?.isConnected ? opener : root).focus({
        preventScroll: true,
      });
  };
  const fresh = () => {
    const c = context();
    return (
      JSON.stringify(c.scope) === base &&
      c.graph.revision === revision &&
      camera().zoom === zoom
    );
  };
  const drawPreview = () => {
    if (!current) return;
    const c = camera();
    preview.style.left = point[0] * c.zoom + c.x + "px";
    preview.style.top = point[1] * c.zoom + c.y + "px";
    preview.style.transform = `scale(${c.zoom})`;
    preview.style.transformOrigin = "top left";
    previewWire.replaceChildren();
    if (!wire) {
      previewWire.style.display = "none";
      return;
    }
    const socket = Array.from(
        root.querySelectorAll<HTMLElement>(".nodes [data-port]"),
      ).find(
        (e) =>
          e.dataset.nodeId === wire!.nodeId &&
          e.dataset.port === wire!.portKey &&
          e.dataset.direction === wire!.direction,
      ),
      match = Array.from(
        preview.querySelectorAll<HTMLElement>("[data-preview-port]"),
      ).find(
        (e) =>
          e.dataset.previewPort === current!.matchingPort &&
          e.dataset.direction !== wire!.direction,
      );
    if (socket && match) {
      const r = root.getBoundingClientRect(),
        a = socket.querySelector(".socket")!.getBoundingClientRect(),
        b = match.querySelector(".socket")!.getBoundingClientRect();
      const p = document.createElementNS(previewWire.namespaceURI, "path"),
        x1 = a.left + a.width / 2 - r.left,
        y1 = a.top + a.height / 2 - r.top,
        x2 = b.left + b.width / 2 - r.left,
        y2 = b.top + b.height / 2 - r.top;
      const dir = wire.direction === "output" ? 1 : -1;
      p.setAttribute(
        "d",
        `M${x1} ${y1} C${x1 + 70 * dir} ${y1},${x2 - 70 * dir} ${y2},${x2} ${y2}`,
      );
      previewWire.append(p);
      previewWire.style.display = "";
    }
  };
  const commit = (item: CatalogEntry, position: [number, number]) => {
    if (!fresh() || !editable()) {
      cancel();
      throw Error("STALE_PROPOSAL");
    }
    services.activate();
    mount.commands?.execute(lease().lease, {
      commandId: "grape.node.add",
      args: {
        ref: { ...item.ref },
        position,
        parameters: { ...item.parameters },
        ...(item.creation ? { creation: { ...item.creation } } : {}),
        scope: { ...item.scope, networkPath: [...item.scope.networkPath] },
        revision: item.revision,
        ...(wire
          ? { wire: { ...wire }, matchingPort: item.matchingPort! }
          : {}),
      } as Json,
    });
    report(undefined);
    cancel();
  };
  const choose = (item: CatalogEntry) => {
    if (!editable()) return;
    current = item;
    panel.hidden = true;
    preview.replaceChildren();
    const h = document.createElement("h3");
    h.textContent = item.presentation.label.fallback;
    preview.append(h);
    for (const p of item.ports)
      preview.append(
        nodePortRow(
          p,
          item.presentation.ports?.[p.key]?.label.fallback ?? p.key,
        ),
      );
    preview.hidden = false;
    drawPreview();
    root.focus({ preventScroll: true });
  };
  const inspect = (item: CatalogEntry) => {
    detail.hidden = false;
    detail.replaceChildren();
    const h = document.createElement("strong"),
      p = document.createElement("p"),
      sig = document.createElement("pre");
    h.textContent = item.presentation.label.fallback;
    p.textContent = [
      item.presentation.category?.label.fallback,
      item.source,
      item.presentation.description?.fallback,
      item.presentation.help?.fallback,
      "Aliases: " +
        (item.presentation.searchTerms ?? []).map((t) => t.fallback).join(", "),
    ]
      .filter(Boolean)
      .join("\n");
    sig.textContent = item.ports
      .map((p) => `${p.direction} ${p.key}: ${p.type}`)
      .join("\n");
    const c = document.createElement("button");
    c.textContent = "Close details";
    c.onclick = mount.scope.event(() => {
      detail.hidden = true;
    });
    detail.append(h, p, sig, c);
  };
  const draw = () => {
    visible = entries
      .filter(
        (e) =>
          (!source.value || e.source === source.value) &&
          (!libraryScope.value ||
            (e.libraryScope ?? "builtin") === libraryScope.value) &&
          (!type.value || e.ports.some((p) => p.type === type.value)),
      )
      .map((e) => ({ e, rank: catalogRank(e, search.value) }))
      .filter((x) => x.rank !== null)
      .sort(
        (a, b) =>
          Number(b.e.exactMatch) - Number(a.e.exactMatch) ||
          a.rank! - b.rank! ||
          (!normalized(search.value)
            ? (
                a.e.presentation.category?.label.fallback ?? "Nodes"
              ).localeCompare(
                b.e.presentation.category?.label.fallback ?? "Nodes",
              )
            : 0) ||
          a.e.presentation.label.fallback.localeCompare(
            b.e.presentation.label.fallback,
          ) ||
          a.e.key.localeCompare(b.e.key),
      )
      .map((x) => x.e);
    selected = Math.max(0, Math.min(selected, visible.length - 1));
    list.replaceChildren();
    if (!visible.length) {
      list.textContent = "No matching nodes in this stage and profile.";
      return;
    }
    const groups = new Map<string, HTMLDetailsElement>();
    visible.forEach((item, index) => {
      let host: HTMLElement = list;
      const category = item.presentation.category?.label.fallback ?? "Nodes";
      if (!normalized(search.value)) {
        let branch = "";
        for (const part of category
          .split("/")
          .map((p) => p.trim())
          .filter(Boolean)) {
          branch = branch ? branch + "/" + part : part;
          let group = groups.get(branch);
          if (!group) {
            group = document.createElement("details");
            group.open = expanded.get(branch) ?? true;
            const summary = document.createElement("summary"),
              key = branch;
            summary.textContent = part;
            group.append(summary);
            summary.onclick = () => expanded.set(key, !group!.open);
            group.ontoggle = () => {
              if (group!.isConnected) expanded.set(key, group!.open);
            };
            groups.set(branch, group);
            host.append(group);
          }
          host = group;
        }
      }
      const row = document.createElement("div"),
        label = document.createElement("button"),
        badge = document.createElement("small"),
        plus = document.createElement("button");
      row.className = "catalog-row";
      row.dataset.key = item.key;
      row.classList.toggle("current", index === selected);
      label.textContent = item.presentation.label.fallback;
      label.ariaLabel = "Inspect " + label.textContent;
      badge.textContent =
        (item.creation?.kind === "source"
          ? "New source · "
          : item.creation?.kind === "reference"
            ? "Existing " + item.creation.role + " · "
            : "") +
        item.source +
        (item.matchingPort
          ? " · " +
            item.matchingPort +
            (item.exactMatch ? " (exact)" : " (conversion)")
          : "");
      label.append(badge);
      plus.ariaLabel = "Add " + item.presentation.label.fallback;
      plus.title =
        mode === "create"
          ? "Preview, then place on Canvas"
          : "Insert at viewport (180, 160)";
      plus.append(icon("add"));
      plus.style.touchAction = "none";
      plus.disabled = !editable();
      label.onclick = mount.scope.event(() => {
        if (rowDrag?.started) return;
        selected = index;
        inspect(item);
      });
      label.ondblclick = mount.scope.event((e) => {
        e.preventDefault();
        if (editable())
          try {
            if (mode === "create") {
              choose(item);
              return;
            }
            commit(
              item,
              graphPoint(
                root.getBoundingClientRect().left + 180,
                root.getBoundingClientRect().top + 160,
              ),
            );
          } catch (err) {
            report(err);
          }
      });
      plus.onclick = mount.scope.event(() => {
        if (rowDrag?.started) return;
        try {
          if (mode === "create") choose(item);
          else
            commit(
              item,
              graphPoint(
                root.getBoundingClientRect().left + 180,
                root.getBoundingClientRect().top + 160,
              ),
            );
        } catch (err) {
          report(err);
        }
      });
      const start = mount.scope.event((e: PointerEvent) => {
        if (
          e.button !== 0 ||
          !editable() ||
          (e.pointerType === "touch" && e.currentTarget === label)
        )
          return;
        rowDrag = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          item,
          started: false,
        };
      });
      label.addEventListener("pointerdown", start);
      plus.addEventListener("pointerdown", start);
      row.append(label, plus);
      host.append(row);
    });
  };
  const open = (
    x: number,
    y: number,
    requestedMode: "create" | "browse" = "create",
    from?: CatalogWire,
  ) => {
    if (requestedMode === "create" && !editable()) return;
    cancel(false);
    services.activate();
    opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : root;
    const c = context();
    base = JSON.stringify(c.scope);
    revision = c.graph.revision;
    zoom = camera().zoom;
    point = graphPoint(x, y);
    wire = from;
    mode = requestedMode;
    entries = services.catalog?.(lease().lease, wire) ?? [];
    search.value = "";
    selected = 0;
    detail.hidden = true;
    const options = (
      select: HTMLSelectElement,
      all: string,
      values: string[],
    ) => {
      const prior = select.value;
      select.replaceChildren();
      for (const value of ["", ...new Set(values)].sort()) {
        const o = document.createElement("option");
        o.value = value;
        o.textContent = value || all;
        select.append(o);
      }
      select.value = Array.from(select.options).some((o) => o.value === prior)
        ? prior
        : "";
    };
    options(
      source,
      "All installed sources",
      entries.map((e) => e.source),
    );
    options(
      type,
      "All port types",
      entries.flatMap((e) => e.ports.map((p) => p.type)),
    );
    heading.textContent = mode === "browse" ? "Node browser" : "Create node";
    panel.hidden = false;
    const r = root.getBoundingClientRect();
    panel.style.left = x - r.left + "px";
    panel.style.top = y - r.top + "px";
    draw();
    clamp();
    search.focus();
  };
  close.onclick = mount.scope.event(() => cancel());
  search.oninput = mount.scope.event(draw);
  source.onchange = mount.scope.event(draw);
  libraryScope.onchange = mount.scope.event(draw);
  type.onchange = mount.scope.event(draw);
  listen(panel, "pointerdown", (e: PointerEvent) => {
    e.stopPropagation();
    if (
      e.button !== 0 ||
      !(e.target instanceof Element) ||
      e.target.closest("button,input,select,summary") ||
      !title.contains(e.target)
    )
      return;
    if (moving) {
      cancel();
      return;
    }
    moving = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      left: parseFloat(panel.style.left),
      top: parseFloat(panel.style.top),
      started: false,
    };
    title.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  listen(document, "pointermove", (e: PointerEvent) => {
    if (moving && e.pointerId === moving.id) {
      if (Math.hypot(e.clientX - moving.x, e.clientY - moving.y) >= 3)
        moving.started = true;
      if (moving.started) {
        panel.style.left = moving.left + e.clientX - moving.x + "px";
        panel.style.top = moving.top + e.clientY - moving.y + "px";
        clamp();
      }
      return;
    }
    if (
      rowDrag &&
      e.pointerId === rowDrag.id &&
      Math.hypot(e.clientX - rowDrag.x, e.clientY - rowDrag.y) > 4
    ) {
      rowDrag.started = true;
      choose(rowDrag.item);
    }
    if (current) {
      const p = graphPoint(e.clientX, e.clientY);
      point = [Math.round(p[0] / 24) * 24, Math.round(p[1] / 24) * 24];
      drawPreview();
    }
  });
  listen(document, "pointerup", (e: PointerEvent) => {
    if (moving?.id === e.pointerId) {
      moving = null;
      return;
    }
    if (rowDrag?.id === e.pointerId) {
      const pending = rowDrag;
      rowDrag = null;
      if (pending.started) {
        suppressClick = true;
        const target = document.elementFromPoint(e.clientX, e.clientY);
        try {
          if (validPlacement(target)) {
            const p = graphPoint(e.clientX, e.clientY);
            commit(pending.item, [
              Math.round(p[0] / 24) * 24,
              Math.round(p[1] / 24) * 24,
            ]);
          } else cancel();
        } catch (err) {
          report(err);
          cancel();
        }
        e.preventDefault();
      }
    }
  });
  listen(
    root,
    "pointerdown",
    (e: PointerEvent) => {
      if (current && !rowDrag) {
        if (!e.isPrimary || !validPlacement(e.target as Element)) {
          cancel(false);
          return;
        }
        e.preventDefault();
        e.stopImmediatePropagation();
        if (e.button === 0)
          try {
            const p = graphPoint(e.clientX, e.clientY);
            suppressClick = true;
            commit(current, [
              Math.round(p[0] / 24) * 24,
              Math.round(p[1] / 24) * 24,
            ]);
          } catch (err) {
            report(err);
            cancel();
          }
        else cancel();
      }
    },
    { capture: true },
  );
  listen(
    document,
    "pointerdown",
    (e: PointerEvent) => {
      suppressClick = false;
      if (
        (moving && e.pointerId !== moving.id) ||
        (rowDrag && e.pointerId !== rowDrag.id)
      ) {
        cancel();
        return;
      }
      if (
        (!panel.hidden || current) &&
        e.target instanceof Node &&
        (!root.contains(e.target) ||
          (!panel.hidden && !panel.contains(e.target)))
      )
        cancel(false);
    },
    { capture: true },
  );
  listen(
    root,
    "click",
    (e: MouseEvent) => {
      if (suppressClick) {
        suppressClick = false;
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    { capture: true },
  );
  listen(panel, "keydown", (e: KeyboardEvent) => {
    if (e.isComposing) return;
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    } else if (
      ["ArrowDown", "ArrowUp"].includes(e.key) &&
      e.target === search
    ) {
      e.preventDefault();
      const displayed = visible
        .map((item, index) => ({
          index,
          row: Array.from(
            list.querySelectorAll<HTMLElement>(".catalog-row"),
          ).find((r) => r.dataset.key === item.key),
        }))
        .filter((x) => x.row?.getClientRects().length);
      const at = displayed.findIndex((x) => x.index === selected),
        next =
          (at + (e.key === "ArrowDown" ? 1 : -1) + displayed.length) %
          Math.max(1, displayed.length);
      selected = displayed[next]?.index ?? 0;
      draw();
      list.querySelector(".current")?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && e.target === search && !e.repeat) {
      e.preventDefault();
      if (
        visible[selected] &&
        list.querySelector<HTMLElement>(".current")?.getClientRects().length
      )
        mode === "create"
          ? choose(visible[selected]!)
          : inspect(visible[selected]!);
    }
  });
  listen(
    root,
    "keydown",
    (e: KeyboardEvent) => {
      if (current && !e.isComposing && ["Escape", "Tab"].includes(e.key)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        cancel();
      }
    },
    { capture: true },
  );
  for (const name of ["blur", "resize"])
    listen(window, name, () => {
      if (!panel.hidden || current) cancel(false);
    });
  listen(document, "visibilitychange", () => {
    if (document.hidden) cancel(false);
  });
  listen(root, "pointercancel", () => cancel());
  mount.scope.own(() => {
    cancel(false);
    panel.remove();
    preview.remove();
    previewWire.remove();
  });
  return {
    open,
    cancel,
    isOpen: () => !panel.hidden || !!current,
    update: (c: ContextSnapshot) => {
      if (
        (!panel.hidden || current) &&
        (JSON.stringify(c.scope) !== base ||
          c.graph.revision !== revision ||
          camera().zoom !== zoom ||
          (mode === "create" && !editable()))
      )
        cancel(false);
    },
  };
}
