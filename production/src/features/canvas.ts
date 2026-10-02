import type { PanelType, PanelServices, PanelUpdate } from "../sdk/ui.ts";
import type {
  PanelViewContribution,
  PanelMountContext,
  ViewFrame,
} from "../sdk/view-mount.ts";
import type { Json } from "../sdk/public-surface.ts";
import type { ContextSnapshot } from "../sdk/editing.ts";
import type { PanelGestureCommands } from "../sdk/panel-commands.ts";
import { Signal, detached, demand } from "../sdk/kernel.ts";
const owner = {
  moduleId: "grape.ui.canvas",
  version: "0.1.0",
  fingerprint: "canvas-dom-v1",
  namespace: "grape.ui.canvas",
  catalogVersion: 1,
};
export const canvasCommands = [
  "grape.node.add",
  "grape.node.delete",
  "grape.node.move",
  "grape.edge.connect",
  "grape.edge.disconnect",
  "grape.node.rename",
  "grape.undo",
  "grape.redo",
];
export const canvasType: PanelType = {
  typeId: "grape.panel.canvas",
  viewStateVersion: 1,
  providesContext: true,
  commandIds: canvasCommands,
  presentation: { label: { owner, key: "title", fallback: "Canvas" } },
  create: (_id, services) => {
    let update: PanelUpdate = {
        lease: { panelId: _id, generation: 0 },
        target: null,
      },
      camera = { x: 0, y: 0, zoom: 1 };
    const signal = new Signal<void>();
    const capture = () =>
      detached({
        update,
        context: update.target
          ? services.context(update.lease).capture()
          : null,
        camera,
      });
    return {
      restoreViewState: (state) => {
        if (state && typeof state === "object" && !Array.isArray(state)) {
          const s = state as Record<string, Json>;
          if (
            typeof s.x === "number" &&
            typeof s.y === "number" &&
            typeof s.zoom === "number" &&
            s.zoom > 0
          )
            camera = { x: s.x, y: s.y, zoom: s.zoom };
        }
      },
      exportViewState: () => camera,
      receive: (value) => {
        update = value;
        signal.emit();
      },
      canClose: () => true,
      dispose: () => signal.clear(),
      createView: () =>
        ({
          kind: "panel",
          capture,
          subscribe: (fn) => signal.subscribe(fn),
          dispose: () => {},
          mount: (context) =>
            mountCanvas(
              context,
              services,
              capture,
              () => update,
              () => camera,
              (value) => {
                camera = value;
                signal.emit();
              },
            ),
        }) as PanelViewContribution,
    };
  },
};
function mountCanvas(
  mount: PanelMountContext,
  services: PanelServices,
  capture: () => {
    context: ContextSnapshot | null;
    camera: { x: number; y: number; zoom: number };
  },
  lease: () => PanelUpdate,
  camera: () => { x: number; y: number; zoom: number },
  setCamera: (v: { x: number; y: number; zoom: number }) => void,
) {
  demand(mount.surface.protocol === "grape.dom.v1", "SURFACE_PROTOCOL");
  const anchor = mount.surface.target as HTMLElement,
    root = document.createElement("div");
  root.className = "canvas";
  root.tabIndex = 0;
  root.setAttribute("aria-label", "Shader graph canvas");
  root.dataset.panel = lease().lease.panelId;
  anchor.append(root);
  mount.scope.own(() => root.remove());
  const viewport = document.createElement("div"),
    nodes = document.createElement("div"),
    wires = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
    notice = document.createElement("div"),
    breadcrumb = document.createElement("div");
  viewport.className = "viewport";
  nodes.className = "nodes";
  wires.classList.add("wires");
  notice.className = "canvas-notice";
  notice.setAttribute("role", "status");
  breadcrumb.className = "canvas-breadcrumb";
  viewport.append(wires, nodes);
  root.append(viewport, breadcrumb, notice);
  let connectionHint = "";
  let selectedPort: {
      nodeId: string;
      portKey: string;
      direction: string;
    } | null = null,
    drag: {
      id: number;
      startX: number;
      startY: number;
      positions: Record<string, [number, number]>;
      gesture: PanelGestureCommands | null;
      pan: boolean;
      camera: ReturnType<typeof camera>;
    } | null = null;
  const run = (fn: () => void) => {
    try {
      notice.textContent = "";
      fn();
    } catch (error) {
      notice.textContent = String(error);
    }
  };
  const listen = (
    target: EventTarget,
    name: string,
    fn: (event: Event) => void,
    options?: AddEventListenerOptions,
  ) => {
    const handler = mount.scope.event(fn);
    target.addEventListener(name, handler, options);
    mount.scope.own(() => target.removeEventListener(name, handler, options));
  };
  listen(root, "pointerdown", (event) =>
    run(() => {
      const e = event as PointerEvent;
      if ((e.target as HTMLElement).closest("button,input,select")) return;
      services.activate();
      root.focus();
      const context = services.context(lease().lease),
        snapshot = context.capture(),
        node = (e.target as HTMLElement).closest<HTMLElement>("[data-node]");
      if (node) {
        const id = node.dataset.node!;
        const selection = e.shiftKey
          ? snapshot.selection.includes(id)
            ? snapshot.selection.filter((x) => x !== id)
            : [...snapshot.selection, id]
          : snapshot.selection.includes(id)
            ? snapshot.selection
            : [id];
        context.select(
          selection,
          selection.includes(id) ? id : (selection.at(-1) ?? null),
        );
        drag = {
          id: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          positions: Object.fromEntries(
            context
              .network()
              .nodes.filter((n) => selection.includes(n.id))
              .map((n) => [n.id, [...n.position] as [number, number]]),
          ),
          gesture: null,
          pan: false,
          camera: { ...camera() },
        };
      } else {
        context.select([]);
        drag = {
          id: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          positions: {},
          gesture: null,
          pan: true,
          camera: { ...camera() },
        };
      }
      root.setPointerCapture(e.pointerId);
    }),
  );
  listen(root, "pointermove", (event) =>
    run(() => {
      const e = event as PointerEvent;
      if (!drag || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.startX,
        dy = e.clientY - drag.startY;
      if (drag.pan) {
        setCamera({
          ...drag.camera,
          x: drag.camera.x + dx,
          y: drag.camera.y + dy,
        });
        return;
      }
      if (!drag.gesture && Math.hypot(dx, dy) < 4) return;
      demand(mount.commands, "COMMAND_DENIED");
      drag.gesture ??= mount.commands.beginGesture(lease().lease, {
        commandId: "grape.node.move",
        args: { ids: Object.keys(drag.positions) },
      });
      drag.gesture.update(lease().lease, {
        positions: Object.fromEntries(
          Object.entries(drag.positions).map(([id, p]) => [
            id,
            [p[0] + dx / camera().zoom, p[1] + dy / camera().zoom],
          ]),
        ),
      });
    }),
  );
  const end = (cancel: boolean) =>
    run(() => {
      if (drag?.gesture) {
        if (cancel) drag.gesture.cancel();
        else drag.gesture.commit(lease().lease);
      }
      if (drag && root.hasPointerCapture(drag.id))
        root.releasePointerCapture(drag.id);
      drag = null;
    });
  listen(root, "pointerup", () => end(false));
  listen(root, "pointercancel", () => end(true));
  listen(root, "click", (event) =>
    run(() => {
      const button = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-port]",
      );
      if (!button) return;
      services.activate();
      const port = {
        nodeId: button.dataset.nodeId!,
        portKey: button.dataset.port!,
        direction: button.dataset.direction!,
      };
      if (!selectedPort) {
        selectedPort = port;
        notice.textContent = connectionHint;
        return;
      }
      const source = selectedPort.direction === "output" ? selectedPort : port,
        target = selectedPort.direction === "output" ? port : selectedPort;
      selectedPort = null;
      demand(
        source.direction === "output" && target.direction === "input",
        "PORT_DIRECTION",
      );
      demand(mount.commands, "COMMAND_DENIED");
      mount.commands.execute(lease().lease, {
        commandId: "grape.edge.connect",
        args: {
          from: { nodeId: source.nodeId, portKey: source.portKey },
          to: { nodeId: target.nodeId, portKey: target.portKey },
          replace: (event as MouseEvent).shiftKey,
        },
      });
    }),
  );
  listen(root, "keydown", (event) =>
    run(() => {
      const e = event as KeyboardEvent;
      if (
        e.isComposing ||
        (e.target as HTMLElement).matches("input,textarea,select")
      )
        return;
      if (e.key === "Escape") {
        selectedPort = null;
        end(true);
        return;
      }
      const node = (e.target as HTMLElement).closest<HTMLElement>(
        "article[data-node]",
      );
      if (
        (e.key === "Enter" || e.key === " ") &&
        node &&
        !(e.target as HTMLElement).closest("button")
      ) {
        e.preventDefault();
        services.activate();
        services.context(lease().lease).select([node.dataset.node!]);
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        mount.commands?.execute(lease().lease, {
          commandId: "grape.node.delete",
          args: {},
        });
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        mount.commands?.execute(lease().lease, {
          commandId: e.shiftKey ? "grape.redo" : "grape.undo",
          args: {},
        });
      }
      if (e.key.toLowerCase() === "h" || e.key.toLowerCase() === "f") {
        const c = services.context(lease().lease),
          selection = c.capture().selection;
        const all = c.network().nodes,
          items =
            e.key.toLowerCase() === "f" && selection.length
              ? all.filter((n) => selection.includes(n.id))
              : all;
        if (items.length) {
          const x = Math.min(...items.map((n) => n.position[0])),
            y = Math.min(...items.map((n) => n.position[1])),
            right = Math.max(...items.map((n) => n.position[0] + 180)),
            bottom = Math.max(
              ...items.map((n) => n.position[1] + 46 + n.ports.length * 31),
            );
          const zoom = Math.min(
            1.5,
            (root.clientWidth - 80) / (right - x),
            (root.clientHeight - 80) / (bottom - y),
          );
          setCamera({
            zoom,
            x: (root.clientWidth - (right - x) * zoom) / 2 - x * zoom,
            y: (root.clientHeight - (bottom - y) * zoom) / 2 - y * zoom,
          });
        }
      }
    }),
  );
  listen(
    root,
    "wheel",
    (event) => {
      const e = event as WheelEvent;
      e.preventDefault();
      const current = camera(),
        rect = root.getBoundingClientRect(),
        x = e.clientX - rect.left,
        y = e.clientY - rect.top,
        zoom = Math.max(
          0.25,
          Math.min(2, current.zoom * Math.exp(-e.deltaY * 0.001)),
        );
      setCamera({
        zoom,
        x: x - ((x - current.x) * zoom) / current.zoom,
        y: y - ((y - current.y) * zoom) / current.zoom,
      });
    },
    { passive: false },
  );
  return {
    update: (projection: ReturnType<typeof capture>, _frame: ViewFrame) => {
      root.setAttribute(
        "aria-label",
        _frame.text({
          owner,
          key: "accessibleTitle",
          fallback: "Shader graph canvas",
        }),
      );
      connectionHint = _frame.text({
        owner,
        key: "connectHint",
        fallback:
          "Choose the opposite port. Hold Shift to replace an existing connection.",
      });
      const c = projection.context;
      if (!c) {
        nodes.replaceChildren();
        wires.replaceChildren();
        return;
      }
      const network = c.graph.document.graph.stages.find(
        (s) => s.id === c.scope.stageId,
      )!.network;
      const stage = c.graph.document.graph.stages.find(
        (s) => s.id === c.scope.stageId,
      )!;
      breadcrumb.textContent = c.graph.document.graph.name + " / " + stage.key;
      const focused =
        document.activeElement instanceof HTMLElement &&
        nodes.contains(document.activeElement)
          ? document.activeElement
          : null;
      const focusedNode =
        focused?.closest<HTMLElement>("[data-node]")?.dataset.node;
      const focusedPort = focused?.dataset.port;
      const focusedDirection = focused?.dataset.direction;
      root.dataset.selection = c.selection.join(",");
      root.dataset.revision = String(c.graph.revision);
      root.dataset.zoom = String(projection.camera.zoom);
      viewport.style.transform = `translate(${projection.camera.x}px,${projection.camera.y}px) scale(${projection.camera.zoom})`;
      nodes.replaceChildren(
        ...network.nodes.map((n) => {
          const card = document.createElement("article");
          card.className =
            "node" + (c.selection.includes(n.id) ? " selected" : "");
          card.dataset.node = n.id;
          card.tabIndex = 0;
          card.setAttribute("aria-label", n.name);
          card.setAttribute(
            "aria-description",
            c.selection.includes(n.id)
              ? _frame.text({ owner, key: "selected", fallback: "Selected" })
              : "",
          );
          card.setAttribute("role", "group");
          card.style.left = n.position[0] + "px";
          card.style.top = n.position[1] + "px";
          const title = document.createElement("h3");
          title.textContent = n.name;
          card.append(title);
          for (const p of n.ports) {
            const row = document.createElement("div"),
              button = document.createElement("button");
            row.className = "port-row " + p.direction;
            button.type = "button";
            button.className = "port";
            button.dataset.port = p.key;
            button.dataset.nodeId = n.id;
            button.dataset.direction = p.direction;
            button.setAttribute(
              "aria-label",
              `${n.name} ${p.direction} ${p.key}`,
            );
            const socket = document.createElement("span");
            socket.className = "socket";
            socket.textContent = "●";
            const caption = document.createElement("span");
            caption.textContent = p.key;
            if (p.direction === "output") button.append(caption, socket);
            else button.append(socket, caption);
            const type = document.createElement("small");
            type.textContent = p.type.replace("glsl.", "");
            row.append(button, type);
            card.append(row);
          }
          return card;
        }),
      );
      if (focusedNode) {
        const card = nodes.querySelector<HTMLElement>(
          `[data-node="${CSS.escape(focusedNode)}"]`,
        );
        const target = focusedPort
          ? card?.querySelector<HTMLElement>(
              `[data-port="${CSS.escape(focusedPort)}"][data-direction="${focusedDirection}"]`,
            )
          : card;
        target?.focus({ preventScroll: true });
      }
      const point = (id: string, key: string, direction: string) => {
        const socket = nodes.querySelector<HTMLElement>(
          `[data-node="${CSS.escape(id)}"] [data-port="${CSS.escape(key)}"][data-direction="${direction}"] .socket`,
        );
        if (!socket) return [0, 0];
        const rect = socket.getBoundingClientRect(),
          canvasRect = root.getBoundingClientRect(),
          view = projection.camera;
        return [
          (rect.left + rect.width / 2 - canvasRect.left - view.x) / view.zoom,
          (rect.top + rect.height / 2 - canvasRect.top - view.y) / view.zoom,
        ];
      };
      wires.replaceChildren(
        ...network.edges.map((e) => {
          const a = point(e.from.nodeId, e.from.portKey, "output"),
            b = point(e.to.nodeId, e.to.portKey, "input"),
            path = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "path",
            );
          path.setAttribute(
            "d",
            `M ${a[0]} ${a[1]} C ${a[0] + 70} ${a[1]}, ${b[0] - 70} ${b[1]}, ${b[0]} ${b[1]}`,
          );
          path.classList.toggle("invalid", !!e.invalid);
          path.dataset.edge = e.id;
          return path;
        }),
      );
    },
  };
}

export const canvasText = {
  presentation: { owner, defaultLocale: "en" },
  defaults: {
    owner,
    locale: "en",
    revision: 1,
    messages: [
      { key: "title", text: "Canvas" },
      { key: "accessibleTitle", text: "Shader graph canvas" },
      {
        key: "connectHint",
        text: "Choose the opposite port. Hold Shift to replace an existing connection.",
      },
      { key: "selected", text: "Selected" },
    ],
  },
};
