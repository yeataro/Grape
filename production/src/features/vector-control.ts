import type { ParameterWidgetViewType } from "../sdk/view-mount.ts";
import type { ParameterProjection } from "../sdk/editing.ts";
import { demand } from "../sdk/kernel.ts";

// Component editing retains one owner-defined value and one scoped draft/token.
export const vectorWidget: ParameterWidgetViewType<ParameterProjection> = {
  widgetId: "grape.widget.vector",
  create: ({ binding }) => {
    let editing = false,
      composing = false,
      texts: string[] = [];
    return {
      kind: "parameter-widget",
      capture: () => binding.capture(),
      subscribe: (fn) => binding.subscribe(fn),
      dispose: () => {},
      mount: ({ surface, scope, commands, hover: diagnostics }) => {
        demand(surface.protocol === "grape.dom.v1", "SURFACE_PROTOCOL");
        const root = document.createElement("div"),
          title = document.createElement("label"),
          error = document.createElement("span"),
          cancel = document.createElement("button");
        root.className = "field";
        error.className = "field-error";
        error.setAttribute("role", "alert");
        const projection = binding.capture().projection,
          labels = (
            projection.spec.presentation.options as { components: string[] }
          ).components;
        demand(
          Array.isArray(projection.value) &&
            labels.length === projection.value.length,
          "VECTOR_WIDGET_SHAPE",
        );
        const inputs = labels.map((label) => {
          const input = document.createElement("input");
          input.type = "text";
          input.inputMode = "decimal";
          input.ariaLabel = label;
          input.dataset.parameter = projection.spec.key;
          input.dataset.component = label;
          return input;
        });
        cancel.type = "button";
        cancel.hidden = !editing;
        const componentRows = inputs.map((input, i) => {
          const label = document.createElement("label");
          label.textContent = labels[i];
          label.append(input);
          return label;
        });
        root.append(title, ...componentRows, cancel, error);
        (surface.target as HTMLElement).append(root);
        scope.own(() => root.remove());
        const hover = diagnostics?.(root, () =>
          composing
            ? {
                kind: "composition",
                message: "Finish composition before changing this preference.",
              }
            : editing
              ? {
                  kind: "draft",
                  message:
                    "Finish or cancel the field draft before changing this preference.",
                }
              : null,
        );
        const reset = () => {
          commands.draft().cancel();
          hover?.invalidate();
          editing = false;
          composing = false;
          texts = (binding.capture().projection.value as number[]).map(String);
          inputs.forEach((input, i) => {
            input.value = texts[i];
            input.dataset.draft = "false";
            input.dataset.composing = "false";
            input.removeAttribute("aria-invalid");
          });
          error.textContent = "";
          cancel.hidden = true;
        };
        const attempt = (fn: () => void) => {
          try {
            fn();
            error.textContent = "";
            inputs.forEach((input) => input.removeAttribute("aria-invalid"));
          } catch (e) {
            error.textContent = String(e);
            inputs.forEach((input) =>
              input.setAttribute("aria-invalid", "true"),
            );
          }
        };
        const commit = () =>
          attempt(() => {
            if (!editing) return;
            demand(!composing, "IME_COMPOSITION");
            commands.draft().commit((raw) => {
              const parts = JSON.parse(raw) as string[];
              demand(
                parts.every(
                  (t) => t.trim() !== "" && Number.isFinite(Number(t)),
                ),
                "NUMBER_PARSE",
              );
              return parts.map(Number);
            });
            reset();
          });
        inputs.forEach((input, i) => {
          const listen = (name: string, fn: (event: Event) => void) => {
            const handler = scope.event(fn);
            input.addEventListener(name, handler);
            scope.own(() => input.removeEventListener(name, handler));
          };
          listen("input", () => {
            if (!editing)
              texts = (binding.capture().projection.value as number[]).map(
                String,
              );
            texts[i] = input.value;
            commands.draft().setText(JSON.stringify(texts));
            editing = true;
            inputs.forEach((x) => (x.dataset.draft = "true"));
            cancel.hidden = false;
          });
          listen("compositionstart", () => {
            composing = true;
            input.dataset.composing = "true";
            commands.draft().composition(true);
          });
          listen("compositionend", () => {
            composing = false;
            input.dataset.composing = "false";
            commands.draft().composition(false);
          });
          listen("keydown", (event) => {
            const e = event as KeyboardEvent;
            if (e.key === "Enter") {
              e.stopPropagation();
              if (!e.isComposing) commit();
            }
            if (e.key === "Escape") {
              e.stopPropagation();
              attempt(reset);
            }
          });
        });
        const cancelEvent = scope.event(() => attempt(reset));
        cancel.addEventListener("click", cancelEvent);
        scope.own(() => cancel.removeEventListener("click", cancelEvent));
        return {
          update: (snapshot, frame) => {
            const p = snapshot.projection;
            inputs.forEach((input, i) =>
              hover?.set(input, () => ({
                kind: "Parameter Widget",
                name: `${frame.text(p.label)} / ${labels[i]}`,
                identity: `${p.nodeId}/${p.spec.key}/${labels[i]}`,
                state: `${snapshot.writable ? "Writable" : "Read-only"} · ${editing ? "unfinished draft" : "committed"}`,
                data: {
                  widget: "grape.widget.vector",
                  committed: {
                    value: p.value,
                    type: p.spec.type,
                    links: p.links.map((l) => ({ ...l })),
                  },
                  draft: editing
                    ? { componentTexts: [...texts], composing }
                    : null,
                  uiOnly: { component: labels[i], editing, composing },
                },
              })),
            );
            cancel.textContent = frame.text({
              owner: {
                moduleId: "grape.ui.controls",
                version: "0.1.0",
                fingerprint: "controls-dom-v1",
                namespace: "grape.ui.controls",
                catalogVersion: 1,
              },
              key: "cancel",
              fallback: "Cancel edit",
            });
            title.textContent = frame.text(snapshot.projection.label);
            if (!editing)
              texts = (snapshot.projection.value as number[]).map(String);
            inputs.forEach((input, i) => {
              input.value = texts[i];
              input.readOnly = !snapshot.writable;
              input.dataset.draft = String(editing);
            });
            cancel.hidden = !editing;
          },
        };
      },
    };
  },
};
