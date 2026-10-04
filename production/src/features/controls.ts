import type {
  ParameterWidgetViewType,
  WidgetDraft,
} from "../sdk/view-mount.ts";
import type { ParameterProjection } from "../sdk/editing.ts";
import type { MenuPresentationOptions } from "../sdk/localization.ts";
import { demand } from "../sdk/kernel.ts";
const owner = {
  moduleId: "grape.ui.controls",
  version: "0.1.0",
  fingerprint: "controls-dom-v1",
  namespace: "grape.ui.controls",
  catalogVersion: 1,
};
function valueWidget(
  json = false,
): ParameterWidgetViewType<ParameterProjection> {
  return {
    widgetId: json ? "grape.widget.json" : "grape.widget.number",
    create: ({ binding }) => {
      let editing = false,
        retainedText = "",
        composing = false;
      return {
        kind: "parameter-widget",
        capture: () => binding.capture(),
        subscribe: (fn) => binding.subscribe(fn),
        dispose: () => {},
        mount: ({ surface, scope, commands, hover: diagnostics }) => {
          demand(surface.protocol === "grape.dom.v1", "SURFACE_PROTOCOL");
          const anchor = surface.target as HTMLElement,
            root = document.createElement("div");
          root.className = "field";
          anchor.append(root);
          scope.own(() => root.remove());
          const hover = diagnostics?.(root, () =>
            composing
              ? {
                  kind: "composition",
                  message:
                    "Finish composition before changing this preference.",
                }
              : editing
                ? {
                    kind: "draft",
                    message:
                      "Finish or cancel the field draft before changing this preference.",
                  }
                : null,
          );
          const label = document.createElement("label"),
            input = document.createElement("input"),
            error = document.createElement("span"),
            cancel = document.createElement("button");
          input.type = "text";
          input.inputMode = "decimal";
          error.className = "field-error";
          error.setAttribute("role", "alert");

          cancel.type = "button";
          cancel.hidden = true;
          root.append(label, input, cancel, error);
          let draft: WidgetDraft | null = null;
          input.value = retainedText;
          cancel.hidden = !editing;
          const attempt = (fn: () => void) => {
            try {
              fn();
              error.textContent = "";
              input.removeAttribute("aria-invalid");
            } catch (e) {
              error.textContent = String(e);
              input.setAttribute("aria-invalid", "true");
            }
          };
          const listen = (name: string, fn: (event: Event) => void) => {
            const guarded = scope.event(fn);
            input.addEventListener(name, guarded);
            scope.own(() => input.removeEventListener(name, guarded));
          };
          listen("input", () => {
            draft = commands.draft();
            draft.setText(input.value);
            retainedText = input.value;
            editing = true;
            input.dataset.draft = "true";
            cancel.hidden = false;
          });
          listen("compositionstart", () => {
            draft = commands.draft();
            composing = true;
            input.dataset.composing = "true";
            draft.composition(true);
          });
          listen("compositionend", () => {
            composing = false;
            input.dataset.composing = "false";
            draft = commands.draft();
            draft.composition(false);
          });
          const commit = () =>
            attempt(() => {
              if (!editing) return;
              demand(!composing, "IME_COMPOSITION");
              draft = commands.draft();
              draft.commit((text) => {
                if (json) return JSON.parse(text);
                demand(
                  text.trim() !== "" && Number.isFinite(Number(text)),
                  "NUMBER_PARSE",
                );
                return Number(text);
              });
              editing = false;
              input.dataset.draft = "false";
              input.value = json
                ? JSON.stringify(binding.capture().projection.value)
                : String(binding.capture().projection.value);
              cancel.hidden = true;
            });
          listen("keydown", (event) => {
            const e = event as KeyboardEvent;
            if (e.key === "Enter") {
              e.stopPropagation();
              if (!e.isComposing) commit();
            }
            if (e.key === "Escape") {
              e.stopPropagation();
              draft = commands.draft();
              draft.cancel();
              hover?.invalidate();
              editing = false;
              input.dataset.draft = "false";
              input.value = json
                ? JSON.stringify(binding.capture().projection.value)
                : String(binding.capture().projection.value);
              cancel.hidden = true;
              error.textContent = "";
            }
          });
          const cancelEvent = scope.event(() => {
            draft = commands.draft();
            draft.cancel();
            hover?.invalidate();
            editing = false;
            input.dataset.draft = "false";
            input.value = json
              ? JSON.stringify(binding.capture().projection.value)
              : String(binding.capture().projection.value);
            cancel.hidden = true;
            error.textContent = "";
          });
          cancel.addEventListener("click", cancelEvent);
          scope.own(() => cancel.removeEventListener("click", cancelEvent));
          return {
            update: (snapshot, frame) => {
              const p = snapshot.projection;
              hover?.set(input, () => ({
                kind: "Parameter Widget",
                name: frame.text(p.label),
                identity: `${p.nodeId}/${p.spec.key}`,
                state: `${snapshot.writable ? "Writable" : "Read-only"} · ${editing ? "unfinished draft" : "committed"}`,
                data: {
                  widget: json ? "grape.widget.json" : "grape.widget.number",
                  committed: {
                    value: p.value,
                    type: p.spec.type,
                    links: p.links.map((l) => ({ ...l })),
                  },
                  draft: editing ? { text: retainedText, composing } : null,
                  uiOnly: { editing, composing },
                },
              }));
              cancel.textContent = frame.text({
                owner,
                key: "cancel",
                fallback: "Cancel edit",
              });
              label.textContent = frame.text(p.label);
              input.setAttribute("aria-label", frame.text(p.label));
              input.dataset.parameter = p.spec.key;
              if (!editing)
                input.value = json ? JSON.stringify(p.value) : String(p.value);
              else input.value = retainedText;
              input.dataset.draft = String(editing);
              input.dataset.composing = String(composing);
              input.readOnly = !snapshot.writable;
              root.classList.toggle(
                "connected",
                p.links.some((x) => !x.invalid),
              );
              if (p.links.some((x) => !x.invalid))
                error.textContent = frame.text({
                  owner,
                  key: "connected",
                  fallback: "Connected input — local value retained.",
                });
              else if (!editing) error.textContent = "";
            },
          };
        },
      };
    },
  };
}
export const numberWidget = valueWidget();
export const jsonWidget = valueWidget(true);

export const choiceWidget: ParameterWidgetViewType<ParameterProjection> = {
  widgetId: "grape.widget.choice",
  create: ({ binding }) => ({
    kind: "parameter-widget",
    capture: () => binding.capture(),
    subscribe: (fn) => binding.subscribe(fn),
    dispose: () => {},
    mount: ({ surface, scope, commands, hover: diagnostics }) => {
      demand(surface.protocol === "grape.dom.v1", "SURFACE_PROTOCOL");
      const root = document.createElement("div"),
        label = document.createElement("label"),
        select = document.createElement("select"),
        error = document.createElement("span");
      root.className = "field";
      root.append(label, select, error);
      (surface.target as HTMLElement).append(root);
      scope.own(() => root.remove());
      const hover = diagnostics?.(root);
      let token = "";
      const change = scope.event(() => {
        try {
          const items = (
            binding.capture().projection.spec.presentation
              .options as MenuPresentationOptions
          ).items;
          const value = items[select.selectedIndex].value;
          commands.commit(value, token);
          error.textContent = "";
        } catch (e) {
          error.textContent = String(e);
        }
      });
      select.addEventListener("change", change);
      scope.own(() => select.removeEventListener("change", change));
      return {
        update: (snapshot, frame) => {
          const p = snapshot.projection;
          hover?.set(select, () => ({
            kind: "Parameter Widget",
            name: frame.text(p.label),
            identity: `${p.nodeId}/${p.spec.key}`,
            state: snapshot.writable
              ? "Writable · committed"
              : "Read-only · committed",
            data: {
              widget: "grape.widget.choice",
              committed: { value: p.value, type: p.spec.type },
              draft: null,
              uiOnly: { writable: snapshot.writable },
            },
          }));
          token = snapshot.editToken;
          label.textContent = frame.text(snapshot.projection.label);
          select.setAttribute(
            "aria-label",
            frame.text(snapshot.projection.label),
          );
          select.dataset.parameter = snapshot.projection.spec.key;
          const options = snapshot.projection.spec.presentation
            .options as MenuPresentationOptions;
          select.replaceChildren(
            ...options.items.map((item) => {
              const option = document.createElement("option");
              option.textContent = frame.text(item.label);
              option.selected = item.value === snapshot.projection.value;
              return option;
            }),
          );
          select.disabled = !snapshot.writable;
        },
      };
    },
  }),
};

export const controlsText = {
  presentation: { owner, defaultLocale: "en" },
  defaults: {
    owner,
    locale: "en",
    revision: 1,
    messages: [
      { key: "cancel", text: "Cancel edit" },
      { key: "connected", text: "Connected input — local value retained." },
    ],
  },
};
