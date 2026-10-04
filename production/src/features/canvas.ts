import type { PanelType, PanelServices, PanelUpdate } from "../sdk/ui.ts";
import type {
  PanelViewContribution,
  PanelMountContext,
  ViewFrame,
} from "../sdk/view-mount.ts";
import type { Json } from "../sdk/public-surface.ts";
import { parseType, formatType } from "../sdk/type-tokens.ts";
import type { ContextSnapshot } from "../sdk/editing.ts";
import type { PanelGestureCommands } from "../sdk/panel-commands.ts";
import { Signal, detached, demand } from "../sdk/kernel.ts";
import { mountNodeBrowser, icon, nodePortRow } from "./node-browser.ts";
const owner = {
  moduleId: "grape.ui.canvas",
  version: "0.1.0",
  fingerprint: "canvas-dom-v1",
  namespace: "grape.ui.canvas",
  catalogVersion: 1,
};
export const canvasCommands = [
  "grape.network.frame",
  "grape.network.layout",
  "grape.network.spare",
  "grape.clipboard.copy",
  "grape.clipboard.paste",
  "grape.structure.apply",
  "grape.structure.delete",
  "grape.structure.instance",
  "grape.structure.field",
  "grape.network.create",
  "grape.network.encapsulate",
  "grape.network.independent",
  "grape.network.enter",
  "grape.network.up",
  "grape.network.navigate",
  "grape.stage.navigate",
  "grape.network.interface",
  "grape.network.mode",
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
      // View-only margin keeps imported origin nodes clear of the stage/header controls.
      camera = { x: 24, y: 104, zoom: 1 };
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
  const hover = mount.hover?.(root, () =>
    drag || portDrag || selectedPort
      ? {
          kind: "gesture",
          message:
            "Finish the Canvas gesture or pending connection before changing this preference.",
        }
      : null,
  );
  const scene = document.createElement("div"),
    viewport = document.createElement("div"),
    nodes = document.createElement("div"),
    frameLayer = document.createElement("div"),
    wires = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
    notice = document.createElement("div"),
    breadcrumb = document.createElement("div");
  viewport.className = "viewport";
  scene.className = "canvas-scene";
  nodes.className = "nodes";
  wires.classList.add("wires");
  notice.className = "canvas-notice";
  notice.setAttribute("role", "status");
  breadcrumb.className = "canvas-breadcrumb";
  frameLayer.className = "canvas-frames";
  viewport.append(frameLayer, wires, nodes);
  scene.append(viewport);
  root.append(scene, breadcrumb, notice);
  const toolbar = document.createElement("div");
  const noticeErrors = new Map<string, string>();
  const noticeSummary = document.createElement("button"),
    statusText = document.createElement("div");
  noticeSummary.type = "button";
  noticeSummary.ariaLabel = "Read full Canvas status";
  noticeSummary.setAttribute("aria-haspopup", "dialog");
  notice.append(noticeSummary);
  statusText.className = "status-details-text";
  statusText.setAttribute("role", "region");
  statusText.ariaLabel = "Full current Canvas status";
  statusText.tabIndex = 0;
  demand(mount.floating, "FLOATING_PRESENTATION_UNAVAILABLE");
  const statusView = mount.floating({
    host: root,
    trigger: noticeSummary,
    content: statusText,
    title: "Canvas status details",
    closeLabel: "Close status details",
    kind: "modal",
    width: 680,
    maxHeight: 680,
  });
  const closeStatus = () => statusView.close();
  noticeSummary.onclick = mount.scope.event(() => {
    clearConnection();
    if (noticeSummary.disabled) return;
    browser.cancel(false);
    end(true);
    statusView.open();
  });
  let connectionNotice = "",
    detailNotice = "";
  const showNoticeErrors = () => {
    const persistent = [...noticeErrors.values(), detailNotice].filter(Boolean);
    noticeSummary.textContent = [
      ...noticeErrors.values(),
      detailNotice,
      connectionNotice,
    ]
      .filter(Boolean)
      .join(" · ");
    notice.hidden = !noticeSummary.textContent;
    noticeSummary.disabled = !persistent.length;
    statusText.textContent = persistent.join("\n\n");
    if (!persistent.length) closeStatus();
  };
  showNoticeErrors();
  toolbar.className = "network-toolbar";
  root.append(toolbar);
  toolbar.addEventListener("click", (event) => event.stopPropagation());
  breadcrumb.addEventListener("click", (event) => event.stopPropagation());
  const execute = (commandId: string, args: Json = {}) =>
    run(() => {
      services.activate();
      mount.commands?.execute(lease().lease, { commandId, args });
    }, commandId);
  const browser = mountNodeBrowser(
    root,
    mount,
    services,
    lease,
    camera,
    (error, connected) => {
      if (error === undefined) noticeErrors.delete("creation");
      else noticeErrors.set("creation", String(error));
      if (error === undefined && connected)
        noticeErrors.delete("grape.edge.connect");
      showNoticeErrors();
    },
  );
  const stageBar = document.createElement("div"),
    entryBar = document.createElement("div");
  stageBar.className = "stage-switch";
  entryBar.className = "canvas-entry-actions";
  root.append(stageBar, entryBar);
  const entry = (label: string, symbol: string, callback: () => void) => {
    const b = document.createElement("button");
    b.type = "button";
    b.ariaLabel = label;
    b.title = label;
    b.append(icon(symbol), document.createTextNode(label));
    b.onclick = mount.scope.event(callback);
    entryBar.append(b);
    return b;
  };
  const openCreator = (mode: "create" | "browse" = "create") => {
    clearConnection();
    const r = root.getBoundingClientRect();
    browser.open(r.left + r.width / 2, r.top + r.height / 3, mode);
  };
  const addNode = entry("Add Node", "add", () => openCreator());
  addNode.title = "Add Node · Tab or double-click blank canvas";
  entry("Browse nodes", "search", () => openCreator("browse"));
  const upNode = entry("Up", "up", () => execute("grape.network.up"));
  const helpDialog = document.createElement("dialog"),
    helpTitle = document.createElement("h2"),
    helpContent = document.createElement("div"),
    helpClose = document.createElement("button");
  helpDialog.className = "shortcut-help";
  helpDialog.ariaLabel = "Keyboard shortcuts";
  helpTitle.textContent = "Keyboard shortcuts";
  helpContent.className = "shortcut-grid";
  helpClose.textContent = "Close shortcuts";
  helpDialog.append(helpTitle, helpContent, helpClose);
  root.append(helpDialog);
  helpDialog.addEventListener(
    "keydown",
    mount.scope.event((e: KeyboardEvent) => {
      if (e.key === "Tab" && !e.isComposing) {
        e.preventDefault();
        helpClose.focus();
      }
    }),
  );
  const mod = navigator.platform.includes("Mac") ? "⌘" : "Ctrl";
  for (const [key, text] of [
    ["Tab", "Create node at canvas center"],
    ["Double-click blank canvas", "Create node at pointer"],
    ["↑ / ↓ / Enter", "Choose a creation result"],
    ["Escape", "Cancel placement, menu or active drag"],
    [`${mod}+Z / ${mod}+Shift+Z`, "Undo / Redo graph edit"],
    ["Delete / Backspace", "Delete selected nodes"],
    ["H / F", "Frame graph / selected nodes"],
    ["Shift+F10", "Open canvas or node menu"],
    ["?", "Keyboard shortcuts"],
  ]) {
    const k = document.createElement("kbd"),
      d = document.createElement("span");
    k.textContent = key!;
    d.textContent = text!;
    helpContent.append(k, d);
  }
  let helpOpener: HTMLElement | null = null,
    backdropPointer: number | null = null;
  const outsideHelp = (event: MouseEvent) => {
    const rect = helpDialog.getBoundingClientRect();
    return (
      event.target === helpDialog &&
      (event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom)
    );
  };
  const closeHelp = () => {
    backdropPointer = null;
    if (!helpDialog.open) return;
    helpDialog.close();
    (helpOpener?.isConnected && helpOpener.getClientRects().length
      ? helpOpener
      : root
    ).focus({
      preventScroll: true,
    });
  };
  const showHelp = () => {
    clearConnection();
    browser.cancel(false);
    backdropPointer = null;
    helpOpener = document.activeElement as HTMLElement;
    helpDialog.showModal();
  };
  entry("Shortcuts", "help", showHelp);
  helpClose.onclick = mount.scope.event(closeHelp);
  helpDialog.addEventListener(
    "cancel",
    mount.scope.event((e) => {
      e.preventDefault();
      closeHelp();
    }),
  );
  helpDialog.addEventListener(
    "pointerdown",
    mount.scope.event((e) => {
      backdropPointer =
        helpDialog.open && e.isPrimary && e.button === 0 && outsideHelp(e)
          ? e.pointerId
          : null;
    }),
  );
  helpDialog.addEventListener(
    "pointercancel",
    mount.scope.event(() => {
      backdropPointer = null;
    }),
  );
  helpDialog.addEventListener(
    "click",
    mount.scope.event((e) => {
      const pointer = backdropPointer;
      backdropPointer = null;
      // Native clicks can be retargeted to DIALOG after an inside release.
      if (pointer !== null && e.pointerId === pointer && outsideHelp(e))
        closeHelp();
    }),
  );
  const menu = document.createElement("div");
  menu.className = "canvas-menu";
  menu.hidden = true;
  menu.setAttribute("role", "menu");
  root.append(menu);
  let menuBase = "",
    menuRevision = -1,
    menuSelection = "",
    menuOpener: HTMLElement | null = null;
  const closeMenu = (focus = false) => {
    menu.hidden = true;
    if (focus)
      (menuOpener?.isConnected ? menuOpener : root).focus({
        preventScroll: true,
      });
  };
  const showMenu = (target: Element, x: number, y: number) => {
    const port = target.closest<HTMLElement>("[data-port]");
    if (
      !port &&
      target.closest(
        "button,input,textarea,select,summary,.network-toolbar,.node-browser,dialog,.canvas-entry-actions,.stage-switch",
      )
    )
      return;
    browser.cancel(false);
    services.activate();
    clearConnection();
    const c = services.context(lease().lease),
      node = target.closest<HTMLElement>("[data-node]"),
      edge = target.closest<SVGElement>("[data-edge]");
    if (node && !c.capture().selection.includes(node.dataset.node!))
      c.select([node.dataset.node!]);
    const captured = c.capture();
    menuBase = JSON.stringify(captured.scope);
    menuRevision = captured.graph.revision;
    menuSelection = JSON.stringify(captured.selection);
    menuOpener = document.activeElement as HTMLElement;
    menu.replaceChildren();
    const item = (label: string, fn: () => void, enabled = true) => {
      const b = document.createElement("button");
      b.setAttribute("role", "menuitem");
      b.textContent = label;
      b.disabled = !enabled;
      b.onclick = mount.scope.event(() => {
        const now = c.capture();
        if (
          menuBase !== JSON.stringify(now.scope) ||
          menuRevision !== now.graph.revision ||
          menuSelection !== JSON.stringify(now.selection)
        ) {
          closeMenu();
          return;
        }
        closeMenu();
        fn();
      });
      menu.append(b);
    };
    const editing = services.editing?.(lease().lease) !== false;
    if (port)
      item(
        "Create connected node",
        () =>
          browser.open(x, y, "create", {
            nodeId: port.dataset.nodeId!,
            portKey: port.dataset.port!,
            direction: port.dataset.direction as "input" | "output",
          }),
        editing,
      );
    else if (edge)
      item(
        "Disconnect edge",
        () => execute("grape.edge.disconnect", { id: edge.dataset.edge! }),
        editing,
      );
    else if (node) {
      item("Delete selected", () => execute("grape.node.delete"), editing);
      item(
        "Enter subgraph",
        () => execute("grape.network.enter", { id: node.dataset.node! }),
        captured.nodeRoles[node.dataset.node!] === "call",
      );
      item("Encapsulate", () => execute("grape.network.encapsulate"), editing);
    } else item("Add Node", () => browser.open(x, y), editing);
    item("Browse nodes", () => browser.open(x, y, "browse"));
    item("Keyboard shortcuts", () => {
      closeMenu(true);
      showHelp();
    });
    const r = root.getBoundingClientRect();
    menu.hidden = false;
    menu.style.left =
      Math.max(0, Math.min(x - r.left, root.clientWidth - menu.offsetWidth)) +
      "px";
    menu.style.top =
      Math.max(0, Math.min(y - r.top, root.clientHeight - menu.offsetHeight)) +
      "px";
    menu.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
  };
  menu.addEventListener(
    "keydown",
    mount.scope.event((e: KeyboardEvent) => {
      e.stopPropagation();
      const items = Array.from(
          menu.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
        ),
        i = items.indexOf(document.activeElement as HTMLButtonElement);
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
        e.preventDefault();
        items[
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? items.length - 1
              : (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) %
                items.length
        ]?.focus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeMenu(true);
      } else if (e.key === "Tab") closeMenu();
    }),
  );
  for (const [name, command, args] of [
    ["New subgraph", "grape.network.create", {}],
    ["Library subgraph", "grape.network.create", { library: true }],
    ["Encapsulate", "grape.network.encapsulate", {}],
    ["Make independent", "grape.network.independent", {}],
    ["Enter subgraph", "grape.network.enter", null],
  ] as const) {
    const b = document.createElement("button");
    b.textContent = name;
    b.type = "button";
    b.onclick = mount.scope.event(() =>
      execute(
        command,
        args ?? { id: services.context(lease().lease).capture().primary ?? "" },
      ),
    );
    toolbar.append(b);
  }
  const arrange = document.createElement("button");
  arrange.textContent = "Arrange nodes";
  arrange.onclick = mount.scope.event(() =>
    execute("grape.network.layout", services.layout?.(lease().lease) ?? {}),
  );
  toolbar.append(arrange);
  const frameButton = document.createElement("button");
  frameButton.textContent = "Frame selection";
  frameButton.onclick = mount.scope.event(() => execute("grape.network.frame"));
  toolbar.append(frameButton);
  const editor = document.createElement("details"),
    summary = document.createElement("summary"),
    rows = document.createElement("div"),
    add = document.createElement("button"),
    apply = document.createElement("button"),
    cancel = document.createElement("button");
  summary.textContent = "Subgraph interface";
  add.textContent = "Add interface port";
  apply.textContent = "Apply interface";
  cancel.textContent = "Cancel interface";
  const definitionName = document.createElement("input"),
    addDirection = document.createElement("select");
  definitionName.ariaLabel = "Subgraph name";
  const emissionMode = document.createElement("select"),
    modeNote = document.createElement("span");
  emissionMode.ariaLabel = "Subgraph emission mode";
  for (const value of ["expand", "function"]) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value === "expand" ? "Expand" : "Function";
    emissionMode.append(option);
  }
  emissionMode.addEventListener(
    "change",
    mount.scope.event(() => {
      const c = capture().context!;
      execute("grape.network.mode", {
        mode: emissionMode.value,
        revision: c.graph.revision,
      });
      const after = capture().context!;
      emissionMode.value = after.definition?.emissionMode ?? "expand";
      showNoticeErrors();
    }),
  );
  addDirection.ariaLabel = "New port direction";
  for (const d of ["input", "output"]) {
    const o = document.createElement("option");
    o.value = d;
    o.textContent = d;
    addDirection.append(o);
  }
  editor.append(
    summary,
    definitionName,
    emissionMode,
    modeNote,
    rows,
    addDirection,
    add,
    apply,
    cancel,
  );
  toolbar.append(editor);
  let interfaceDraft:
      | import("../sdk/networks.ts").NetworkData["interface"]
      | null = null,
    draftRevision = -1,
    draftScope = "";
  const typeChoices = () => [
    "glsl.float",
    "glsl.vec2",
    "glsl.vec3",
    "glsl.vec4",
    ...[2, 3, 4].flatMap((c) =>
      [2, 3, 4].map((r) => "glsl.mat" + c + (c === r ? "" : "x" + r)),
    ),
    ...services
      .context(lease().lease)
      .capture()
      .structures.map((s) => "struct@" + s.id),
  ];
  const portLimit = () => {
    add.disabled =
      (interfaceDraft ?? []).filter((p) => p.direction === addDirection.value)
        .length >= 16;
  };
  addDirection.onchange = portLimit;
  const drawPorts = () => {
    rows.replaceChildren();
    for (const [i, p] of (interfaceDraft ?? []).entries()) {
      const row = document.createElement("div"),
        name = document.createElement("input"),
        type = document.createElement("select"),
        direction = document.createElement("select"),
        remove = document.createElement("button"),
        up = document.createElement("button");
      name.value = p.name;
      name.ariaLabel = "Port name " + (i + 1);
      name.oninput = () => (p.name = name.value);
      for (const t of new Set([...typeChoices(), p.type])) {
        const option = document.createElement("option");
        option.value = t;
        option.textContent = t;
        type.append(option);
      }
      type.value = p.type;
      type.ariaLabel = "Port type " + (i + 1);
      const value = document.createElement("input");
      value.className = "port-default";
      value.ariaLabel = "Port default " + (i + 1);
      value.value =
        p.defaultValue === undefined ? "" : JSON.stringify(p.defaultValue);
      const defaultPolicy = () => {
        value.readOnly =
          !/^glsl\.(float|int|uint|vec[234]|mat[234](x[234])?)$/.test(p.type);
        value.title = value.readOnly ? p.type : "";
      };
      defaultPolicy();
      type.onchange = () => {
        if (
          !run(() => {
            demand(services.reshape, "TYPE_SERVICE");
            const next = services.reshape(
              lease().lease,
              type.value,
              JSON.parse(value.value || "null"),
            );
            p.type = type.value;
            p.defaultValue = next;
            value.value = JSON.stringify(next);
            defaultPolicy();
          })
        ) {
          type.value = p.type;
        }
      };
      for (const d of ["input", "output"]) {
        const option = document.createElement("option");
        option.value = d;
        option.textContent = d;
        direction.append(option);
      }
      direction.value = p.direction;
      direction.ariaLabel = "Port direction " + (i + 1);
      direction.onchange = () => {
        if (
          !run(() => {
            demand(
              interfaceDraft!.filter(
                (x) => x !== p && x.direction === direction.value,
              ).length < 16,
              "INTERFACE_PORT_LIMIT",
            );
            p.direction = direction.value as "input" | "output";
            portLimit();
          })
        )
          direction.value = p.direction;
      };
      remove.textContent = "Remove port " + (i + 1);
      remove.onclick = () => {
        interfaceDraft!.splice(i, 1);
        drawPorts();
      };
      up.textContent = "Move port up " + (i + 1);
      up.onclick = () => {
        if (i) {
          [interfaceDraft![i - 1], interfaceDraft![i]] = [
            interfaceDraft![i],
            interfaceDraft![i - 1],
          ];
          drawPorts();
        }
      };
      up.disabled = i === 0;
      row.append(name, type, value, direction, up, remove);
      rows.append(row);
    }
    portLimit();
  };
  const beginInterface = () => {
    const c = services.context(lease().lease).capture();
    demand(c.definition, "DEFINITION_MISSING");
    interfaceDraft = structuredClone(c.definition.data.interface);
    definitionName.value = c.definition.data.name;
    draftRevision = c.graph.revision;
    draftScope = JSON.stringify(c.scope);
    drawPorts();
  };
  summary.onclick = mount.scope.event(() =>
    run(() => {
      if (!editor.open) beginInterface();
    }),
  );
  add.onclick = mount.scope.event(() =>
    run(() => {
      if (!interfaceDraft) beginInterface();
      demand(
        interfaceDraft!.filter((p) => p.direction === addDirection.value)
          .length < 16,
        "INTERFACE_PORT_LIMIT",
      );
      interfaceDraft!.push({
        key:
          "port-" +
          (
            services.identifier ??
            (() => {
              throw Error("IDENTITY_UNAVAILABLE");
            })
          )(),
        name: "Port " + (interfaceDraft!.length + 1),
        direction: addDirection.value as "input" | "output",
        type: "glsl.float",
        supply: "local",
        defaultValue: 0,
      });
      drawPorts();
    }),
  );
  apply.onclick = mount.scope.event(() =>
    run(() => {
      demand(
        draftScope ===
          JSON.stringify(services.context(lease().lease).capture().scope),
        "STALE_SCOPE",
      );
      const defaults = [
        ...rows.querySelectorAll<HTMLInputElement>(".port-default"),
      ].map((input) =>
        input.value.trim() ? (JSON.parse(input.value) as Json) : undefined,
      );
      interfaceDraft!.forEach((p, i) => {
        if (defaults[i] === undefined) delete p.defaultValue;
        else p.defaultValue = defaults[i];
      });
      if (
        execute("grape.network.interface", {
          ports: interfaceDraft as unknown as Json,
          name: definitionName.value,
          revision: draftRevision,
        })
      ) {
        interfaceDraft = null;
        editor.open = false;
      }
    }),
  );
  cancel.onclick = mount.scope.event(() => {
    interfaceDraft = null;
    editor.open = false;
  });
  definitionName.addEventListener(
    "keydown",
    mount.scope.event((event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        interfaceDraft = null;
        editor.open = false;
      }
    }),
  );
  const clip = document.createElement("details"),
    clipSummary = document.createElement("summary"),
    clipText = document.createElement("textarea"),
    copy = document.createElement("button"),
    paste = document.createElement("button");
  clipSummary.textContent = "Local clipboard";
  clipText.ariaLabel = "Local clipboard text";
  copy.textContent = "Copy selection";
  paste.textContent = "Paste selection";
  clip.append(clipSummary, clipText, copy, paste);
  toolbar.append(clip);
  copy.onclick = mount.scope.event(() => {
    execute("grape.clipboard.copy");
    clipText.value = services.clipboard?.() ?? "";
  });
  paste.onclick = mount.scope.event(() =>
    execute("grape.clipboard.paste", { text: clipText.value }),
  );
  const structs = document.createElement("details"),
    structSummary = document.createElement("summary"),
    choose = document.createElement("select"),
    structName = document.createElement("input"),
    structDescription = document.createElement("textarea"),
    fields = document.createElement("div"),
    addField = document.createElement("button"),
    saveStruct = document.createElement("button"),
    cancelStruct = document.createElement("button"),
    deleteStruct = document.createElement("button"),
    instance = document.createElement("button"),
    fieldChoice = document.createElement("select"),
    fieldInstance = document.createElement("button");
  structSummary.textContent = "Structures";
  choose.ariaLabel = "Structure definition";
  structName.ariaLabel = "Structure name";
  structDescription.ariaLabel = "Structure description";
  addField.textContent = "Add structure field";
  saveStruct.textContent = "Apply structure";
  cancelStruct.textContent = "Cancel structure";
  deleteStruct.textContent = "Delete structure";
  instance.textContent = "Add structure node";
  fieldChoice.ariaLabel = "Structure field";
  fieldInstance.textContent = "Add field node";
  structs.append(
    structSummary,
    choose,
    structName,
    structDescription,
    fields,
    addField,
    saveStruct,
    cancelStruct,
    deleteStruct,
    instance,
    fieldChoice,
    fieldInstance,
  );
  toolbar.append(structs);
  const help = document.createElement("button"),
    helpText = document.createElement("pre");
  help.textContent = "Structure Help";
  helpText.className = "structure-help";
  helpText.hidden = true;
  structs.append(help, helpText);
  help.onclick = mount.scope.event(() => {
    const selected = services
      .context(lease().lease)
      .capture()
      .structures.find((s) => s.id === choose.value);
    helpText.textContent = selected
      ? `${selected.data.name}\n${selected.data.description ?? ""}\nFields: ${selected.data.fields.map((f) => f.name + ": " + f.type).join(", ")}\nUses (${selected.uses.length}): ${selected.uses.join(", ") || "None"}`
      : "Select a saved structure.";
    helpText.hidden = false;
  });
  let structureDraft: import("../sdk/networks.ts").StructureData | null = null,
    structureRevision = -1,
    structureId = "";
  const drawFields = () => {
    fields.replaceChildren();
    for (const [i, f] of (structureDraft?.fields ?? []).entries()) {
      const row = document.createElement("div"),
        name = document.createElement("input"),
        type = document.createElement("select"),
        remove = document.createElement("button"),
        up = document.createElement("button");
      name.value = f.name;
      name.ariaLabel = "Field name " + (i + 1);
      const token = parseType(f.type),
        array = token.kind === "array",
        base = array ? formatType(token.element) : f.type;
      for (const t of new Set([...typeChoices(), base])) {
        const o = document.createElement("option");
        o.value = t;
        o.textContent = t;
        type.append(o);
      }
      type.value = base;
      type.ariaLabel = "Field type " + (i + 1);
      const arrayToggle = document.createElement("input"),
        length = document.createElement("input");
      arrayToggle.type = "checkbox";
      arrayToggle.ariaLabel = "Field array " + (i + 1);
      arrayToggle.checked = array;
      length.type = "number";
      length.min = "1";
      length.max = "1024";
      length.ariaLabel = "Field array length " + (i + 1);
      length.value = String(
        array && typeof token.extent === "number" ? token.extent : 1,
      );
      length.hidden = !array;
      const updateType = () => {
        length.hidden = !arrayToggle.checked;
        f.type = arrayToggle.checked
          ? "array@" + JSON.stringify([type.value, Number(length.value)])
          : type.value;
      };
      type.onchange = updateType;
      arrayToggle.onchange = updateType;
      length.oninput = updateType;
      name.oninput = () => (f.name = name.value);

      remove.textContent = "Remove field " + (i + 1);
      remove.onclick = () => {
        structureDraft!.fields.splice(i, 1);
        drawFields();
      };
      up.textContent = "Move field up " + (i + 1);
      up.onclick = () => {
        if (i) {
          [structureDraft!.fields[i - 1], structureDraft!.fields[i]] = [
            structureDraft!.fields[i],
            structureDraft!.fields[i - 1],
          ];
          drawFields();
        }
      };
      up.disabled = i === 0;
      row.append(name, type, arrayToggle, length, up, remove);
      fields.append(row);
    }
    addField.disabled = (structureDraft?.fields.length ?? 0) >= 64;
  };
  const beginStructure = () => {
    const c = services.context(lease().lease).capture();
    structureId = choose.value;
    structureDraft = structuredClone(
      c.structures.find((s) => s.id === structureId)?.data ?? {
        name: "Structure",
        fields: [
          {
            id:
              "field-" +
              (
                services.identifier ??
                (() => {
                  throw Error("IDENTITY_UNAVAILABLE");
                })
              )(),
            name: "value",
            type: "glsl.float",
          },
        ],
      },
    );
    structureRevision = c.graph.revision;
    fieldChoice.replaceChildren(
      ...structureDraft.fields.map((f) => {
        const option = document.createElement("option");
        option.value = f.id;
        option.textContent = f.name;
        return option;
      }),
    );
    structName.value = structureDraft.name;
    structDescription.value = structureDraft.description ?? "";
    drawFields();
  };
  structSummary.onclick = mount.scope.event(() => {
    if (!structs.open) beginStructure();
  });
  choose.onchange = mount.scope.event(beginStructure);
  structName.oninput = () => {
    if (structureDraft) structureDraft.name = structName.value;
  };
  structDescription.oninput = () => {
    if (structureDraft) structureDraft.description = structDescription.value;
  };
  addField.onclick = mount.scope.event(() => {
    if (!structureDraft) beginStructure();
    if (structureDraft!.fields.length >= 64) return;
    structureDraft!.fields.push({
      id:
        "field-" +
        (
          services.identifier ??
          (() => {
            throw Error("IDENTITY_UNAVAILABLE");
          })
        )(),
      name: "field" + (structureDraft!.fields.length + 1),
      type: "glsl.float",
    });
    drawFields();
  });
  saveStruct.onclick = mount.scope.event(() => {
    if (
      execute("grape.structure.apply", {
        id: structureId,
        data: structureDraft as unknown as Json,
        revision: structureRevision,
      })
    ) {
      structs.open = false;
      structureDraft = null;
    }
  });
  cancelStruct.onclick = mount.scope.event(() => {
    structs.open = false;
    structureDraft = null;
  });
  deleteStruct.onclick = mount.scope.event(() =>
    execute("grape.structure.delete", {
      id: structureId,
      revision: structureRevision,
    }),
  );
  instance.onclick = mount.scope.event(() =>
    execute("grape.structure.instance", {
      id: choose.value,
      revision: services.context(lease().lease).capture().graph.revision,
    }),
  );
  fieldInstance.onclick = mount.scope.event(() =>
    execute("grape.structure.field", {
      id: choose.value,
      field: fieldChoice.value,
      revision: services.context(lease().lease).capture().graph.revision,
    }),
  );
  let connectionHint = "",
    renderedScope = "";
  let portDrag: {
      id: number;
      x: number;
      y: number;
      nodeId: string;
      portKey: string;
      direction: string;
      scope: string;
      revision: number;
    } | null = null,
    suppressPortClick = false;
  let selectedPort: {
      nodeId: string;
      portKey: string;
      direction: string;
      scope: string;
      revision: number;
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
  const connectionPreview = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );
  connectionPreview.classList.add("connection-preview");
  root.append(connectionPreview);
  let pointerPoint: { x: number; y: number } | null = null;
  const drawConnection = () => {
    connectionPreview.replaceChildren();
    const pending = portDrag ?? selectedPort;
    const hit = pointerPoint
      ? document
          .elementFromPoint(pointerPoint.x, pointerPoint.y)
          ?.closest<HTMLElement>("[data-port]")
      : null;
    for (const button of nodes.querySelectorAll<HTMLElement>("[data-port]")) {
      button.classList.toggle(
        "wire-origin",
        !!pending &&
          button.dataset.nodeId === pending.nodeId &&
          button.dataset.port === pending.portKey &&
          button.dataset.direction === pending.direction,
      );
      button.classList.toggle(
        "wire-target",
        !!pending &&
          services.editing?.(lease().lease) !== false &&
          button === hit &&
          pending.direction !== button.dataset.direction,
      );
    }
    if (!pending || !pointerPoint || browser.isOpen()) return;
    const socket = Array.from(
      nodes.querySelectorAll<HTMLElement>("[data-port]"),
    ).find(
      (e) =>
        e.dataset.nodeId === pending.nodeId &&
        e.dataset.port === pending.portKey &&
        e.dataset.direction === pending.direction,
    );
    if (!socket) return;
    const s = socket.querySelector(".socket")!.getBoundingClientRect(),
      r = root.getBoundingClientRect();
    const x = s.left + s.width / 2 - r.left,
      y = s.top + s.height / 2 - r.top,
      toX = pointerPoint.x - r.left,
      toY = pointerPoint.y - r.top,
      direction = pending.direction === "output" ? 1 : -1;
    const p = document.createElementNS(connectionPreview.namespaceURI, "path"),
      ring = document.createElementNS(connectionPreview.namespaceURI, "circle");
    p.setAttribute(
      "d",
      `M${x} ${y} C${x + 70 * direction} ${y},${toX - 70 * direction} ${toY},${toX} ${toY}`,
    );
    p.setAttribute(
      "stroke",
      getComputedStyle(socket.parentElement!)
        .getPropertyValue("--port-color")
        .trim() || "#c4c1bc",
    );
    ring.setAttribute("cx", String(x));
    ring.setAttribute("cy", String(y));
    ring.setAttribute("r", "8");
    ring.setAttribute(
      "style",
      `stroke:${p.getAttribute("stroke")};fill:transparent`,
    );
    connectionPreview.append(p, ring);
  };
  const clearConnection = () => {
    if (portDrag) suppressPortClick = true;
    if (portDrag && root.hasPointerCapture(portDrag.id))
      root.releasePointerCapture(portDrag.id);
    portDrag = null;
    selectedPort = null;
    pointerPoint = null;
    connectionNotice = "";
    drawConnection();
    showNoticeErrors();
  };
  const run = (fn: () => void | boolean, action?: string) => {
    try {
      const recovered = fn();
      if (action && recovered !== false && noticeErrors.delete(action))
        showNoticeErrors();
      return true;
    } catch (error) {
      noticeErrors.set(action ?? "interaction", String(error));
      showNoticeErrors();
      return false;
    }
  };
  const listen = <T extends Event = Event>(
    target: EventTarget,
    name: string,
    fn: (event: T) => void,
    options?: AddEventListenerOptions,
  ) => {
    const handler = mount.scope.event(fn);
    target.addEventListener(name, handler as EventListener, options);
    mount.scope.own(() =>
      target.removeEventListener(name, handler as EventListener, options),
    );
  };
  listen(root, "dblclick", (e: MouseEvent) => {
    const t = e.target as Element;
    if (
      t.closest(
        ".node,button,input,select,textarea,summary,.network-toolbar,.node-browser,.canvas-menu,dialog",
      )
    )
      return;
    e.preventDefault();
    end(true);
    browser.open(e.clientX, e.clientY);
  });
  listen(root, "contextmenu", (e: MouseEvent) => {
    if (
      (e.target as Element).closest(
        "input,textarea,select,[contenteditable=true]",
      )
    )
      return;
    if (browser.isOpen()) {
      browser.cancel();
      e.preventDefault();
      return;
    }
    e.preventDefault();
    end(true);
    showMenu(e.target as Element, e.clientX, e.clientY);
  });
  listen(document, "pointerdown", (e: PointerEvent) => {
    if (!menu.hidden && !menu.contains(e.target as Node)) closeMenu();
  });
  const outsidePortEnd = (e: PointerEvent) => {
    if (portDrag?.id === e.pointerId && !root.contains(e.target as Node))
      clearConnection();
  };
  listen(document, "pointerup", outsidePortEnd, { capture: true });
  listen(document, "pointercancel", outsidePortEnd, { capture: true });
  listen(window, "blur", () => {
    backdropPointer = null;
    clearConnection();
    clearHold();
    closeMenu();
    end(true);
  });
  listen(document, "visibilitychange", () => {
    if (document.hidden) {
      backdropPointer = null;
      clearConnection();
      clearHold();
      closeMenu();
      end(true);
    }
  });
  listen(window, "resize", () => closeMenu());
  let hold: ReturnType<typeof setTimeout> | undefined,
    holdToken: { id: number; scope: string; revision: number } | null = null,
    holdPoint: [number, number] = [0, 0];
  listen(
    document,
    "pointerdown",
    (e: PointerEvent) => {
      if (holdToken && e.pointerId !== holdToken.id) clearHold();
    },
    { capture: true },
  );
  listen(root, "pointerdown", (e: PointerEvent) => {
    if (e.pointerType !== "touch") return;
    clearHold();
    if (!e.isPrimary) return;
    if (
      (e.target as Element).closest(
        "button,input,textarea,select,[contenteditable=true],.node-browser,dialog,.network-toolbar",
      )
    )
      return;
    holdPoint = [e.clientX, e.clientY];
    const c = services.context(lease().lease).capture(),
      token = {
        id: e.pointerId,
        scope: JSON.stringify(c.scope),
        revision: c.graph.revision,
      };
    holdToken = token;
    hold = setTimeout(
      mount.scope.event(() => {
        const now = services.context(lease().lease).capture();
        if (
          holdToken !== token ||
          document.hidden ||
          JSON.stringify(now.scope) !== token.scope ||
          now.graph.revision !== token.revision
        )
          return;
        clearHold();
        end(true);
        showMenu(e.target as Element, e.clientX, e.clientY);
      }),
      550,
    );
  });
  const clearHold = () => {
    clearTimeout(hold);
    hold = undefined;
    holdToken = null;
  };
  mount.scope.own(clearHold);
  listen(root, "pointermove", (e: PointerEvent) => {
    if (Math.hypot(e.clientX - holdPoint[0], e.clientY - holdPoint[1]) > 4)
      clearHold();
  });
  listen(root, "pointerup", clearHold);
  listen(root, "pointercancel", clearHold);
  listen(root, "pointerdown", (event) =>
    run(() => {
      const e = event as PointerEvent;
      if (
        browser.isOpen() ||
        !menu.hidden ||
        helpDialog.open ||
        statusView.isOpen()
      )
        return;
      if (!e.isPrimary) {
        clearConnection();
        end(true);
        return;
      }
      if (e.button !== 0) return;
      suppressPortClick = false;
      const socket = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-port]",
      );
      if (socket) {
        if (services.editing?.(lease().lease) === false) return;
        const c = services.context(lease().lease).capture();
        portDrag = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          nodeId: socket.dataset.nodeId!,
          portKey: socket.dataset.port!,
          direction: socket.dataset.direction!,
          scope: JSON.stringify(c.scope),
          revision: c.graph.revision,
        };
        pointerPoint = { x: e.clientX, y: e.clientY };
        return;
      }
      if (
        (e.target as HTMLElement).closest(
          "button,input,select,textarea,summary,.network-toolbar",
        )
      )
        return;
      // Keep native mousedown from removing Canvas focus after selection redraw.
      e.preventDefault();
      clearConnection();
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
      if (portDrag?.id === e.pointerId && (e.buttons & 1) === 0)
        clearConnection();
      if (portDrag || selectedPort) {
        pointerPoint = { x: e.clientX, y: e.clientY };
        drawConnection();
      }
      if (
        portDrag?.id === e.pointerId &&
        Math.hypot(e.clientX - portDrag.x, e.clientY - portDrag.y) > 4
      ) {
        if (!root.hasPointerCapture(e.pointerId))
          root.setPointerCapture(e.pointerId);
        return;
      }
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
  let lastBlankTap: { time: number; x: number; y: number } | null = null;
  listen(root, "pointerup", (event) => {
    const e = event as PointerEvent,
      pending = portDrag;
    if (
      !e.isPrimary ||
      (pending && pending.id !== e.pointerId) ||
      (drag && drag.id !== e.pointerId)
    )
      return;
    const blankTap =
      e.pointerType === "touch" &&
      drag?.pan &&
      Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 8 &&
      menu.hidden &&
      !browser.isOpen();
    portDrag = null;
    drawConnection();
    if (pending) {
      if (root.hasPointerCapture(pending.id))
        root.releasePointerCapture(pending.id);
      if (Math.hypot(e.clientX - pending.x, e.clientY - pending.y) > 4) {
        suppressPortClick = true;
        clearConnection();
        run(() => {
          const c = services.context(lease().lease).capture();
          demand(
            pending.scope === JSON.stringify(c.scope) &&
              pending.revision === c.graph.revision,
            "STALE_SCOPE",
          );
          const hit = document.elementFromPoint(e.clientX, e.clientY);
          const target = hit?.closest<HTMLElement>("[data-spare],[data-port]");
          if (
            !target &&
            hit &&
            root.contains(hit) &&
            !hit.closest(
              ".node,.network-toolbar,button,input,select,textarea,dialog",
            )
          ) {
            browser.open(e.clientX, e.clientY, "create", {
              nodeId: pending.nodeId,
              portKey: pending.portKey,
              direction: pending.direction as "input" | "output",
            });
            return false;
          }
          demand(target && root.contains(target), "PORT_TARGET");
          demand(mount.commands, "COMMAND_DENIED");
          if (target.dataset.spare) {
            mount.commands.execute(lease().lease, {
              commandId: "grape.network.spare",
              args: {
                boundary: target.dataset.spare,
                endpoint: { nodeId: pending.nodeId, portKey: pending.portKey },
              },
            });
          } else {
            demand(
              pending.direction !== target.dataset.direction,
              "PORT_DIRECTION",
            );
            const a = { nodeId: pending.nodeId, portKey: pending.portKey },
              b = {
                nodeId: target.dataset.nodeId!,
                portKey: target.dataset.port!,
              };
            mount.commands.execute(lease().lease, {
              commandId: "grape.edge.connect",
              args: {
                from: pending.direction === "output" ? a : b,
                to: pending.direction === "input" ? a : b,
                replace: e.shiftKey,
              },
            });
          }
          selectedPort = null;
        }, "grape.edge.connect");
      }
    }
    if (!pending) end(false);
    if (blankTap) {
      const time = performance.now();
      if (
        lastBlankTap &&
        time - lastBlankTap.time < 350 &&
        Math.hypot(e.clientX - lastBlankTap.x, e.clientY - lastBlankTap.y) < 24
      ) {
        lastBlankTap = null;
        browser.open(e.clientX, e.clientY);
      } else lastBlankTap = { time, x: e.clientX, y: e.clientY };
    } else lastBlankTap = null;
  });
  listen(root, "pointercancel", () => {
    clearConnection();
    end(true);
  });
  listen(root, "pointerleave", () => {
    if (!portDrag) {
      pointerPoint = null;
      drawConnection();
    }
  });
  listen(root, "click", (event) =>
    run(() => {
      const button = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-port]",
      );
      if (suppressPortClick) {
        suppressPortClick = false;
        return;
      }
      if (!button) return;
      if (services.editing?.(lease().lease) === false) {
        clearConnection();
        return;
      }
      services.activate();
      const captured = services.context(lease().lease).capture();
      const port = {
        nodeId: button.dataset.nodeId!,
        portKey: button.dataset.port!,
        direction: button.dataset.direction!,
        scope: JSON.stringify(captured.scope),
        revision: captured.graph.revision,
      };
      if (!selectedPort) {
        selectedPort = port;
        pointerPoint =
          (event as MouseEvent).detail === 0
            ? null
            : {
                x: (event as MouseEvent).clientX,
                y: (event as MouseEvent).clientY,
              };
        connectionNotice = connectionHint;
        showNoticeErrors();
        drawConnection();
        return;
      }
      const source = selectedPort.direction === "output" ? selectedPort : port,
        target = selectedPort.direction === "output" ? port : selectedPort;
      const pending = selectedPort;
      clearConnection();
      run(() => {
        demand(
          pending.scope === JSON.stringify(captured.scope) &&
            pending.revision === captured.graph.revision,
          "STALE_SCOPE",
        );
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
      }, "grape.edge.connect");
    }),
  );
  listen(root, "keydown", (event) =>
    run(() => {
      const e = event as KeyboardEvent;
      if (
        e.defaultPrevented ||
        e.isComposing ||
        e.repeat ||
        document.querySelector("dialog:modal") ||
        (e.target as HTMLElement).closest(
          "input,textarea,select,[contenteditable=true],.node-browser,.canvas-menu",
        )
      )
        return;
      if ((drag || portDrag) && e.key !== "Escape") return;
      if (
        e.key === "Tab" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !e.shiftKey &&
        e.target === root
      ) {
        e.preventDefault();
        openCreator();
        return;
      }
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        showHelp();
        return;
      }
      if (
        !e.altKey &&
        !e.ctrlKey &&
        !e.metaKey &&
        (e.key === "ContextMenu" || (e.key === "F10" && e.shiftKey))
      ) {
        e.preventDefault();
        const r = root.getBoundingClientRect();
        showMenu(
          e.target as Element,
          r.left + r.width / 2,
          r.top + r.height / 3,
        );
        return;
      }
      if (e.altKey || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() !== "z"))
        return;
      if (e.key === "Escape") {
        clearConnection();
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
            right = Math.max(...items.map((n) => n.position[0] + 190)),
            bottom = Math.max(
              ...items.map((n) => n.position[1] + 48 + n.ports.length * 29),
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
      if (
        (e.target as Element).closest(
          ".node-browser,.network-toolbar,dialog,.canvas-menu",
        )
      )
        return;
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
      hover?.invalidate();
      if (projection.context) {
        const c = projection.context;
        browser.update(c);
        if (
          !menu.hidden &&
          (menuBase !== JSON.stringify(c.scope) ||
            menuRevision !== c.graph.revision ||
            menuSelection !== JSON.stringify(c.selection))
        )
          closeMenu();
        const stages = c.graph.document.graph.stages;
        const stageKey = stages.map((s) => s.id + ":" + s.key).join("|");
        if (stageBar.dataset.key !== stageKey) {
          stageBar.dataset.key = stageKey;
          stageBar.replaceChildren();
          for (const stage of stages) {
            const b = document.createElement("button");
            b.textContent = stage.key[0]!.toUpperCase() + stage.key.slice(1);
            b.dataset.stageId = stage.id;
            b.title = b.textContent + " Stage";
            b.onclick = mount.scope.event(() =>
              execute("grape.stage.navigate", { stageId: stage.id }),
            );
            stageBar.append(b);
          }
        }
        for (const b of stageBar.querySelectorAll<HTMLButtonElement>("button"))
          b.setAttribute(
            "aria-pressed",
            String(b.dataset.stageId === c.scope.stageId),
          );
        addNode.disabled = services.editing?.(lease().lease) === false;
        upNode.disabled = !c.scope.networkPath.length;
      }
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
        clearConnection();
        closeStatus();
        nodes.replaceChildren();
        wires.replaceChildren();
        return;
      }
      const scopeKey = JSON.stringify(c.scope);
      if (
        holdToken &&
        (holdToken.scope !== scopeKey ||
          holdToken.revision !== c.graph.revision)
      )
        clearHold();
      if (renderedScope && renderedScope !== scopeKey) {
        clearConnection();
        suppressPortClick = false;
        interfaceDraft = null;
        structureDraft = null;
        editor.open = false;
        structs.open = false;
        noticeErrors.clear();
        detailNotice = "";
        showNoticeErrors();
        if (drag && root.hasPointerCapture(drag.id))
          root.releasePointerCapture(drag.id);
        drag = null;
      }
      renderedScope = scopeKey;
      // Project current loss facts, including Undo/Redo; this is not a status log.
      detailNotice = c.graph.document.graph.losses
        .filter((l) => l.code === "FUNCTION_CONSTANT_DETACHED")
        .map(
          (l) =>
            l.reason +
            (l.payload.kind === "edge"
              ? ` Receiver ${l.payload.edge.to.nodeId}/${l.payload.edge.to.portKey}; edge ${l.payload.edge.id}.`
              : ""),
        )
        .join(" ");
      showNoticeErrors();
      const network = c.network;
      if (
        selectedPort &&
        (selectedPort.scope !== scopeKey ||
          selectedPort.revision !== c.graph.revision ||
          services.editing?.(lease().lease) === false)
      )
        clearConnection();
      if (
        portDrag &&
        (portDrag.scope !== JSON.stringify(c.scope) ||
          portDrag.revision !== c.graph.revision ||
          services.editing?.(lease().lease) === false)
      ) {
        clearConnection();
      }
      frameLayer.replaceChildren(
        ...c.frames.map((f) => {
          const members = network.nodes.filter((n) => f.nodeIds.includes(n.id)),
            box = document.createElement("div");
          box.className = "canvas-frame";
          box.dataset.frame = f.id;
          box.textContent = f.name;
          if (members.length) {
            const x = Math.min(...members.map((n) => n.position[0])) - 18,
              y = Math.min(...members.map((n) => n.position[1])) - 30;
            Object.assign(box.style, {
              left: x + "px",
              top: y + "px",
              width:
                Math.max(...members.map((n) => n.position[0] + 200)) -
                x +
                18 +
                "px",
              height:
                Math.max(
                  ...members.map(
                    (n) => n.position[1] + 60 + n.ports.length * 31,
                  ),
                ) -
                y +
                18 +
                "px",
            });
          }
          return box;
        }),
      );
      editor.hidden = !c.definition;
      emissionMode.value = c.definition?.emissionMode ?? "expand";
      emissionMode.disabled = !c.definition?.emissionMode;
      modeNote.textContent =
        c.definition && !c.definition.emissionMode
          ? "Use Upgrade subgraph owners to enable this mode."
          : "Shared by all references. Use Make independent for a separate choice.";
      const selectedStructure = choose.value;
      choose.replaceChildren();
      for (const item of [
        { id: "", data: { name: "New structure" } },
        ...c.structures,
      ]) {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.data.name;
        choose.append(option);
      }
      choose.value = selectedStructure;
      breadcrumb.replaceChildren(
        ...c.breadcrumbs.map((item) => {
          const button = document.createElement("button");
          button.textContent = item.name;
          button.dataset.depth = String(item.depth);
          button.disabled = item.depth === c.scope.networkPath.length;
          button.onclick = mount.scope.event(() =>
            execute("grape.network.navigate", { depth: item.depth }),
          );
          return button;
        }),
      );
      root.dataset.network = network.id;
      root.dataset.definition = c.definition?.id ?? "";
      root.dataset.definitionKind = c.definition
        ? c.definition.data.local
          ? "local"
          : "library"
        : "root";
      root.dataset.path = c.scope.networkPath.join("/");
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
          card.dataset.role = c.nodeRoles[n.id];
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
          title.textContent = c.definitionNames[n.id] ?? n.name;
          card.append(title);
          hover?.set(card, () => ({
            kind: "Node",
            name: c.definitionNames[n.id] ?? n.name,
            identity: n.id,
            state: c.selection.includes(n.id)
              ? "Committed · selected (UI-only)"
              : "Committed · unselected (UI-only)",
            data: {
              committed: {
                type: { ...n.type },
                state: n.state,
                inputValues: n.inputValues,
                position: [...n.position],
                references: n.references.map((r) => ({ ...r })),
              },
              uiOnly: {
                selected: c.selection.includes(n.id),
                stage: c.scope.stageId,
                occurrence: [...c.scope.networkPath],
              },
            },
          }));
          if (c.definitionNames[n.id] && c.definitionNames[n.id] !== n.name) {
            const label = document.createElement("small");
            label.className = "instance-name";
            label.textContent = n.name;
            card.append(label);
          }
          if (["network-input", "network-output"].includes(c.nodeRoles[n.id])) {
            const spare = document.createElement("button");
            spare.dataset.spare = n.id;
            spare.textContent =
              c.nodeRoles[n.id] === "network-input"
                ? "Create input port from selection"
                : "Create output port from selection";
            spare.onclick = mount.scope.event(() =>
              run(() => {
                demand(selectedPort, "SELECT_PORT");
                demand(mount.commands, "COMMAND_DENIED");
                mount.commands.execute(lease().lease, {
                  commandId: "grape.network.spare",
                  args: {
                    boundary: n.id,
                    endpoint: {
                      nodeId: selectedPort.nodeId,
                      portKey: selectedPort.portKey,
                    },
                  },
                });
                selectedPort = null;
                clearConnection();
              }, "grape.edge.connect"),
            );
            card.append(spare);
          }
          for (const p of n.ports) {
            const connected = network.edges.some((e) =>
              p.direction === "output"
                ? e.from.nodeId === n.id && e.from.portKey === p.key
                : e.to.nodeId === n.id && e.to.portKey === p.key,
            );
            const row = nodePortRow(
              p,
              c.portLabels[n.id]?.[p.key] ?? p.key,
              { id: n.id, name: n.name },
              connected,
              n.inputValues[p.key],
            );
            card.append(row);
            hover?.set(row, () => ({
              kind: "Port",
              name: c.portLabels[n.id]?.[p.key] ?? p.key,
              identity: `${n.id}/${p.direction}/${p.key}`,
              state: connected
                ? "Committed · connected"
                : "Committed · disconnected",
              data: {
                committed: {
                  key: p.key,
                  direction: p.direction,
                  type: p.type,
                  requireConstant: p.requireConstant ?? false,
                  value:
                    p.key in n.inputValues
                      ? n.inputValues[p.key]
                      : p.defaultValue === undefined
                        ? "未提供"
                        : p.defaultValue,
                },
                uiOnly: {
                  stage: c.scope.stageId,
                  occurrence: [...c.scope.networkPath],
                },
              },
            }));
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
          const sourcePort = network.nodes
            .find((n) => n.id === e.from.nodeId)
            ?.ports.find((p) => p.key === e.from.portKey);
          path.style.stroke =
            sourcePort?.type === "glsl.float"
              ? "#c4c1bc"
              : sourcePort?.type === "glsl.vec2"
                ? "#8fc5ee"
                : sourcePort?.type === "glsl.vec3"
                  ? "#87ceb7"
                  : "#c5b2e2";
          path.dataset.edge = e.id;
          path.setAttribute("tabindex", "0");
          path.setAttribute("aria-label", `Edge ${e.id}`);
          hover?.set(path, () => ({
            kind: "Edge",
            name: `${e.from.nodeId}/${e.from.portKey} → ${e.to.nodeId}/${e.to.portKey}`,
            identity: e.id,
            state: e.invalid ? "Committed · invalid" : "Committed · valid",
            data: {
              committed: {
                from: { ...e.from },
                to: { ...e.to },
                adaptation: { ...e.adaptation },
                invalid: e.invalid ? { ...e.invalid } : null,
              },
              uiOnly: {
                stage: c.scope.stageId,
                occurrence: [...c.scope.networkPath],
              },
            },
          }));
          return path;
        }),
      );
      drawConnection();
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
