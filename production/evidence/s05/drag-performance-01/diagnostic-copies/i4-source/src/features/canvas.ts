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
    frameLayer = document.createElement("div"),
    wires = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
    notice = document.createElement("div"),
    breadcrumb = document.createElement("div");
  viewport.className = "viewport";
  nodes.className = "nodes";
  wires.classList.add("wires");
  notice.className = "canvas-notice";
  notice.setAttribute("role", "status");
  breadcrumb.className = "canvas-breadcrumb";
  frameLayer.className = "canvas-frames";
  viewport.append(frameLayer, wires, nodes);
  root.append(viewport, breadcrumb, notice);
  const toolbar = document.createElement("div");
  toolbar.className = "network-toolbar";
  root.append(toolbar);
  toolbar.addEventListener("click", (event) => event.stopPropagation());
  breadcrumb.addEventListener("click", (event) => event.stopPropagation());
  const execute = (commandId: string, args: Json = {}) =>
    run(() => {
      services.activate();
      mount.commands?.execute(lease().lease, { commandId, args });
    });
  for (const [name, command, args] of [
    ["New subgraph", "grape.network.create", {}],
    ["Library subgraph", "grape.network.create", { library: true }],
    ["Encapsulate", "grape.network.encapsulate", {}],
    ["Make independent", "grape.network.independent", {}],
    ["Enter subgraph", "grape.network.enter", null],
    ["Up", "grape.network.up", {}],
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
      const losses = after.graph.document.graph.losses.filter(
        (l) =>
          l.code === "FUNCTION_CONSTANT_DETACHED" &&
          !c.graph.document.graph.losses.some((old) => old.id === l.id),
      );
      if (losses.length)
        notice.textContent = losses
          .map(
            (l) =>
              l.reason +
              (l.payload.kind === "edge"
                ? ` Receiver ${l.payload.edge.to.nodeId}/${l.payload.edge.to.portKey}; edge ${l.payload.edge.id}.`
                : ""),
          )
          .join(" ");
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
      return true;
    } catch (error) {
      notice.textContent = String(error);
      return false;
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
      if (e.button !== 0) return;
      const socket = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-port]",
      );
      if (socket) {
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
        return;
      }
      if (
        (e.target as HTMLElement).closest(
          "button,input,select,textarea,summary,.network-toolbar",
        )
      )
        return;
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
  listen(root, "pointerup", (event) => {
    const e = event as PointerEvent,
      pending = portDrag;
    portDrag = null;
    if (pending) {
      if (root.hasPointerCapture(pending.id))
        root.releasePointerCapture(pending.id);
      if (Math.hypot(e.clientX - pending.x, e.clientY - pending.y) > 4) {
        suppressPortClick = true;
        run(() => {
          const c = services.context(lease().lease).capture();
          demand(
            pending.scope === JSON.stringify(c.scope) &&
              pending.revision === c.graph.revision,
            "STALE_SCOPE",
          );
          const target = document
            .elementFromPoint(e.clientX, e.clientY)
            ?.closest<HTMLElement>("[data-spare],[data-port]");
          demand(target && root.contains(target), "PORT_TARGET");
          if (target.dataset.spare) {
            execute("grape.network.spare", {
              boundary: target.dataset.spare,
              endpoint: { nodeId: pending.nodeId, portKey: pending.portKey },
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
            execute("grape.edge.connect", {
              from: pending.direction === "output" ? a : b,
              to: pending.direction === "input" ? a : b,
            });
          }
          selectedPort = null;
        });
      }
    }
    if (!pending) end(false);
  });
  listen(root, "pointercancel", () => {
    portDrag = null;
    end(true);
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
        portDrag = null;
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
      const scopeKey = JSON.stringify(c.scope);
      if (renderedScope && renderedScope !== scopeKey) {
        selectedPort = null;
        suppressPortClick = false;
        interfaceDraft = null;
        structureDraft = null;
        editor.open = false;
        structs.open = false;
        notice.textContent = "";
        if (drag && root.hasPointerCapture(drag.id))
          root.releasePointerCapture(drag.id);
        drag = null;
      }
      renderedScope = scopeKey;
      const network = c.network;
      if (
        portDrag &&
        (portDrag.scope !== JSON.stringify(c.scope) ||
          portDrag.revision !== c.graph.revision)
      ) {
        if (root.hasPointerCapture(portDrag.id))
          root.releasePointerCapture(portDrag.id);
        portDrag = null;
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
                execute("grape.network.spare", {
                  boundary: n.id,
                  endpoint: {
                    nodeId: selectedPort.nodeId,
                    portKey: selectedPort.portKey,
                  },
                });
                selectedPort = null;
              }),
            );
            card.append(spare);
          }
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
              `${n.name} ${p.direction} ${c.portLabels[n.id]?.[p.key] ?? p.key}`,
            );
            const socket = document.createElement("span");
            socket.className = "socket";
            socket.textContent = "●";
            const caption = document.createElement("span");
            caption.textContent = c.portLabels[n.id]?.[p.key] ?? p.key;
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
