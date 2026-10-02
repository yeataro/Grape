import type { PanelType, PanelUpdate } from "../sdk/ui.ts";
import type { PanelViewContribution } from "../sdk/view-mount.ts";
import type { LocalizationService } from "../sdk/localization.ts";
import type { ParameterWidgets, WidgetFieldSlot } from "../sdk/ui.ts";
import { Signal, demand } from "../sdk/kernel.ts";
const owner = {
  moduleId: "grape.ui.inspector",
  version: "0.1.0",
  fingerprint: "inspector-dom-v1",
  namespace: "grape.ui.inspector",
  catalogVersion: 1,
};
export function inspectorType(
  widgets: ParameterWidgets,
  locale: LocalizationService,
): PanelType {
  return {
    typeId: "grape.panel.inspector",
    viewStateVersion: 1,
    presentation: { label: { owner, key: "title", fallback: "Inspector" } },
    commandIds: ["grape.edge.disconnect", "grape.node.rename"],
    create: (_id, services) => {
      let update: PanelUpdate = {
          lease: { panelId: _id, generation: 0 },
          target: null,
        },
        identity = "",
        name = "",
        fields = new Map<string, WidgetFieldSlot>(),
        links: { id: string; source: string }[] = [];
      const signal = new Signal<void>();
      const clear = () => {
        for (const slot of fields.values()) slot.dispose();
        fields.clear();
      };
      return {
        restoreViewState: () => {},
        exportViewState: () => ({}),
        receive: (value) => {
          update = value;
          const target = update.target;
          const next =
            target?.object?.kind === "node"
              ? JSON.stringify([target.scope, target.object.id])
              : "";
          if (next !== identity) {
            clear();
            identity = next;
          }
          name = "";
          links = [];
          if (next && target) {
            const context = services.context(update.lease),
              node = context
                .network()
                .nodes.find((n) => n.id === target.object!.id);
            name = node?.name ?? "";
            const keys = services.parameters(update.lease, target.object!.id);
            for (const [key, slot] of fields)
              if (!keys.includes(key)) {
                slot.dispose();
                fields.delete(key);
              }
            for (const key of keys)
              if (!fields.has(key))
                fields.set(
                  key,
                  widgets.open(
                    services.parameter(update.lease, target.object!.id, key),
                    locale,
                  ),
                );
            links = context
              .network()
              .edges.filter((e) => e.to.nodeId === target.object!.id)
              .map((e) => ({
                id: e.id,
                source:
                  context.network().nodes.find((n) => n.id === e.from.nodeId)
                    ?.name ?? e.from.nodeId,
              }));
          }
          signal.emit();
        },
        canClose: () => ![...fields.values()].some((slot) => slot.pending),
        dispose: () => {
          clear();
          signal.clear();
        },
        createView: () =>
          ({
            kind: "panel",
            capture: () => ({
              identity,
              name,
              keys: [...fields.keys()],
              links,
            }),
            subscribe: (fn) => signal.subscribe(fn),
            dispose: () => {},
            mount: ({ surface, scope, commands }) => {
              demand(surface.protocol === "grape.dom.v1", "SURFACE_PROTOCOL");
              const root = document.createElement("div"),
                title = document.createElement("h2"),
                subtitle = document.createElement("p"),
                rename = document.createElement("button"),
                body = document.createElement("div"),
                connections = document.createElement("div");
              root.className = "inspector";

              root.append(title, subtitle, rename, body, connections);
              rename.addEventListener(
                "click",
                scope.event(() => {
                  if (!update.target?.object) return;
                  const next = prompt(rename.textContent ?? "", name);
                  if (next !== null)
                    commands?.execute(update.lease, {
                      commandId: "grape.node.rename",
                      args: { id: update.target.object.id, name: next },
                    });
                }),
              );
              (surface.target as HTMLElement).append(root);
              scope.own(() => root.remove());
              const mounted = new Map<
                string,
                { slot: WidgetFieldSlot; anchor: HTMLElement }
              >();
              scope.own(() => {
                for (const { slot } of mounted.values()) slot.unmount();
                mounted.clear();
              });
              return {
                update: (
                  p: {
                    identity: string;
                    name: string;
                    keys: string[];
                    links: { id: string; source: string }[];
                  },
                  frame: import("../sdk/view-mount.ts").ViewFrame,
                ) => {
                  title.textContent = frame.text({
                    owner,
                    key: "title",
                    fallback: "Inspector",
                  });
                  rename.textContent = frame.text({
                    owner,
                    key: "rename",
                    fallback: "Rename node",
                  });
                  rename.hidden = !p.identity;
                  subtitle.textContent =
                    p.name ||
                    frame.text({
                      owner,
                      key: "empty",
                      fallback: "Select a node to inspect its parameters.",
                    });
                  for (const [key, item] of mounted)
                    if (
                      !p.keys.includes(key) ||
                      fields.get(key) !== item.slot
                    ) {
                      item.slot.unmount();
                      item.anchor.remove();
                      mounted.delete(key);
                    }
                  for (const key of p.keys) {
                    if (mounted.has(key)) continue;
                    const anchor = document.createElement("div"),
                      slot = fields.get(key)!;
                    anchor.dataset.field = key;
                    body.append(anchor);
                    mounted.set(key, { slot, anchor });
                    slot.mount({ protocol: surface.protocol, target: anchor });
                    if (slot.status === "placeholder") {
                      const message = document.createElement("p");
                      message.textContent = slot.issue;
                      anchor.append(message);
                    }
                  }
                  connections.replaceChildren(
                    ...p.links.map((link) => {
                      const row = document.createElement("div"),
                        label = document.createElement("span"),
                        button = document.createElement("button");
                      label.textContent = frame.text({
                        owner,
                        key: "source",
                        fallback: "From {name}",
                        params: { name: link.source },
                      });
                      button.textContent = frame.text({
                        owner,
                        key: "disconnect",
                        fallback: "Disconnect",
                      });
                      button.addEventListener(
                        "click",
                        scope.event(() =>
                          commands?.execute(update.lease, {
                            commandId: "grape.edge.disconnect",
                            args: { id: link.id },
                          }),
                        ),
                      );
                      row.append(label, button);
                      return row;
                    }),
                  );
                },
              };
            },
          }) as PanelViewContribution,
      };
    },
  };
}

export const inspectorText = {
  presentation: { owner, defaultLocale: "en" },
  defaults: {
    owner,
    locale: "en",
    revision: 1,
    messages: [
      { key: "title", text: "Inspector" },
      { key: "empty", text: "Select a node to inspect its parameters." },
      { key: "source", text: "From {name}" },
      { key: "disconnect", text: "Disconnect" },
      { key: "rename", text: "Rename node" },
    ],
  },
};
