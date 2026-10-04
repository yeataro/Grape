import type { PanelType, PanelUpdate } from "../sdk/ui.ts";
import type { PanelViewContribution } from "../sdk/view-mount.ts";
import type {
  NodeTypeRef,
  NodePresentation,
  Json,
} from "../sdk/public-surface.ts";
import { Signal, demand } from "../sdk/kernel.ts";
const owner = {
  moduleId: "grape.ui.actions",
  version: "0.1.0",
  fingerprint: "actions-dom-v1",
  namespace: "grape.ui.actions",
  catalogVersion: 1,
};
export function actionsType(
  catalog: readonly { ref: NodeTypeRef; presentation: NodePresentation }[],
  history: () => { undo: boolean; redo: boolean; editing?: boolean },
): PanelType {
  return {
    typeId: "grape.panel.actions",
    viewStateVersion: 1,
    commandIds: [
      "grape.node.add",
      "grape.node.delete",
      "grape.undo",
      "grape.redo",
    ],
    presentation: { label: { owner, key: "title", fallback: "Edit actions" } },
    create: (id, services) => {
      let update: PanelUpdate = {
        lease: { panelId: id, generation: 0 },
        target: null,
      };
      const changed = new Signal<void>();
      return {
        restoreViewState: () => {},
        exportViewState: () => ({}),
        receive: (value) => {
          update = value;
          changed.emit();
        },
        canClose: () => true,
        dispose: () => changed.clear(),
        createView: () =>
          ({
            kind: "panel",
            capture: () => ({ target: !!update.target, ...history() }),
            subscribe: (fn) => changed.subscribe(fn),
            dispose: () => {},
            mount: ({ surface, scope, commands }) => {
              demand(surface.protocol === "grape.dom.v1", "SURFACE_PROTOCOL");
              const root = document.createElement("div");
              root.className = "editing-actions";
              (surface.target as HTMLElement).append(root);
              scope.own(() => root.remove());
              const notice = document.createElement("span");
              notice.setAttribute("role", "alert");
              const buttons: HTMLButtonElement[] = [];
              const labels: ((
                frame: import("../sdk/view-mount.ts").ViewFrame,
              ) => void)[] = [];
              const add = (
                label: string | NodePresentation["label"],
                commandId: string,
                args: () => Json,
              ) => {
                const button = document.createElement("button");
                labels.push((frame) => {
                  button.textContent =
                    typeof label === "string"
                      ? frame.text({ owner, key: commandId, fallback: label })
                      : frame.text({
                          owner,
                          key: "add",
                          fallback: "Add {name}",
                          params: { name: frame.text(label) },
                        });
                });
                button.addEventListener(
                  "click",
                  scope.event(() => {
                    try {
                      commands?.execute(update.lease, {
                        commandId,
                        args: args(),
                      });
                      notice.textContent = "";
                    } catch (error) {
                      notice.textContent = String(error);
                    }
                  }),
                );
                root.append(button);
                buttons.push(button);
                return button;
              };
              const undo = add("Undo", "grape.undo", () => ({})),
                redo = add("Redo", "grape.redo", () => ({}));
              add("Delete selected", "grape.node.delete", () => ({}));
              root.append(notice);
              const keyboard = scope.event((e: KeyboardEvent) => {
                if (
                  e.defaultPrevented ||
                  e.isComposing ||
                  e.repeat ||
                  e.altKey ||
                  document.querySelector("dialog[open]") ||
                  !(e.ctrlKey || e.metaKey) ||
                  e.key.toLowerCase() !== "z"
                )
                  return;
                const target = e.target as HTMLElement;
                if (
                  target.closest(
                    "[contenteditable=true],.node-browser,.canvas-menu",
                  )
                )
                  return;
                if (
                  target.matches("input,textarea,select") &&
                  (target.dataset.draft === "true" ||
                    target.dataset.composing === "true" ||
                    !target.dataset.parameter)
                )
                  return;
                e.preventDefault();
                try {
                  commands?.execute(update.lease, {
                    commandId: e.shiftKey ? "grape.redo" : "grape.undo",
                    args: {},
                  });
                } catch (error) {
                  notice.textContent = String(error);
                }
              });
              document.addEventListener("keydown", keyboard);
              scope.own(() =>
                document.removeEventListener("keydown", keyboard),
              );
              return {
                update: (
                  p: {
                    target: boolean;
                    undo: boolean;
                    redo: boolean;
                    editing?: boolean;
                  },
                  frame: import("../sdk/view-mount.ts").ViewFrame,
                ) => {
                  labels.forEach((render) => render(frame));
                  for (const [b, name] of [
                    [undo, "undo"],
                    [redo, "redo"],
                  ] as const) {
                    const svg = document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "svg",
                      ),
                      p = document.createElementNS(svg.namespaceURI, "path");
                    svg.setAttribute("viewBox", "0 0 24 24");
                    svg.setAttribute("aria-hidden", "true");
                    svg.classList.add("action-icon");
                    p.setAttribute(
                      "d",
                      name === "undo"
                        ? "m8 4-5 5 5 5M3 9h10a7 7 0 0 1 0 14"
                        : "m16 4 5 5-5 5M21 9h-10a7 7 0 0 0 0 14",
                    );
                    p.setAttribute("fill", "none");
                    p.setAttribute("stroke", "currentColor");
                    p.setAttribute("stroke-width", "1.6");
                    svg.append(p);
                    b.prepend(svg);
                    b.title =
                      b.textContent! +
                      " · Ctrl/⌘ " +
                      (name === "redo" ? "Shift+" : "") +
                      "Z";
                  }
                  buttons.forEach(
                    (b) => (b.disabled = !p.target || p.editing === false),
                  );
                  undo.disabled = !p.undo;
                  redo.disabled = !p.redo;
                },
              };
            },
          }) as PanelViewContribution,
      };
    },
  };
}

export const actionsText = {
  presentation: { owner, defaultLocale: "en" },
  defaults: {
    owner,
    locale: "en",
    revision: 1,
    messages: [
      { key: "title", text: "Edit actions" },
      { key: "add", text: "Add {name}" },
      { key: "grape.undo", text: "Undo" },
      { key: "grape.redo", text: "Redo" },
      { key: "grape.node.delete", text: "Delete selected" },
    ],
  },
};
