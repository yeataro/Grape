import type { PanelType, PanelUpdate } from "../sdk/ui.ts";
import type { PanelViewContribution } from "../sdk/view-mount.ts";
import type { Compilation, GraphSnapshot } from "../sdk/editing.ts";
import { Signal, demand } from "../sdk/kernel.ts";
const owner = {
  moduleId: "grape.ui.code",
  version: "0.1.0",
  fingerprint: "code-dom-v1",
  namespace: "grape.ui.code",
  catalogVersion: 1,
};
export function codeType(
  read: () => { compilation: Compilation | null; snapshot: GraphSnapshot },
): PanelType {
  return {
    typeId: "grape.panel.code",
    viewStateVersion: 1,
    presentation: { label: { owner, key: "title", fallback: "Shader output" } },
    create: (id, services) => {
      let target: PanelUpdate = {
        lease: { panelId: id, generation: 0 },
        target: null,
      };
      const signal = new Signal<void>();
      return {
        restoreViewState: () => {},
        exportViewState: () => ({}),
        receive: (value) => {
          target = value;
          signal.emit();
        },
        canClose: () => true,
        dispose: () => signal.clear(),
        createView: () =>
          ({
            kind: "panel",
            capture: read,
            subscribe: (fn) => signal.subscribe(fn),
            dispose: () => {},
            mount: ({ surface, scope }) => {
              demand(surface.protocol === "grape.dom.v1", "SURFACE_PROTOCOL");
              const root = document.createElement("section"),
                title = document.createElement("h2"),
                status = document.createElement("p"),
                code = document.createElement("pre"),
                issues = document.createElement("ul");
              root.className = "code";
              title.textContent = "GLSL · ES 3.00";
              code.setAttribute("aria-label", "Generated GLSL");
              issues.setAttribute("aria-label", "Diagnostics");
              root.append(title, status, code, issues);
              (surface.target as HTMLElement).append(root);
              scope.own(() => root.remove());
              let renderVersion = 0;
              return {
                update: (
                  p: ReturnType<typeof read>,
                  frame: import("../sdk/view-mount.ts").ViewFrame,
                ) => {
                  const version = ++renderVersion,
                    result = p.compilation;
                  title.textContent = frame.text({
                    owner,
                    key: "title",
                    fallback: "GLSL · ES 3.00",
                  });
                  code.setAttribute(
                    "aria-label",
                    frame.text({
                      owner,
                      key: "code",
                      fallback: "Generated GLSL",
                    }),
                  );
                  issues.setAttribute(
                    "aria-label",
                    frame.text({
                      owner,
                      key: "diagnostics",
                      fallback: "Diagnostics",
                    }),
                  );
                  const [key, fallback] = !result
                    ? ["empty", "Generate to inspect shader output."]
                    : result.revision !== p.snapshot.revision
                      ? ["stale", "Previous generation — graph has changed."]
                      : result.status === "success"
                        ? ["success", "Generated successfully · Host-free GLSL"]
                        : ["blocked", "Generation blocked"];
                  status.textContent = frame.text({ owner, key, fallback });
                  code.textContent =
                    result?.artifacts
                      .map((a) => "// " + a.key + "\n" + a.text)
                      .join("\n") ?? "";
                  issues.replaceChildren(
                    ...[
                      ...p.snapshot.diagnostics,
                      ...(result?.diagnostics.filter(
                        (x) =>
                          !p.snapshot.diagnostics.some(
                            (y) => y.code === x.code && y.message === x.message,
                          ),
                      ) ?? []),
                    ].map((d) => {
                      const li = document.createElement("li");
                      li.textContent =
                        d.code +
                        ": " +
                        (d.messageRef ? frame.text(d.messageRef) : d.message);
                      const subject = d.subject;
                      if (
                        subject?.nodeId &&
                        target.target?.scope.stageId === subject.stageId &&
                        (p.snapshot.diagnostics.includes(d) ||
                          result?.revision === p.snapshot.revision)
                      ) {
                        const button = document.createElement("button");
                        button.textContent = frame.text({
                          owner,
                          key: "locate",
                          fallback: "Locate node",
                        });
                        button.addEventListener(
                          "click",
                          scope.event(() => {
                            if (
                              version !== renderVersion ||
                              !button.isConnected
                            )
                              return;
                            const context = services.context(target.lease);
                            if (
                              context
                                .network()
                                .nodes.some((n) => n.id === subject.nodeId)
                            )
                              context.select([subject.nodeId!]);
                          }),
                        );
                        li.append(" ", button);
                      }
                      li.className = d.severity;
                      return li;
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

export const codeText = {
  presentation: { owner, defaultLocale: "en" },
  defaults: {
    owner,
    locale: "en",
    revision: 1,
    messages: [
      { key: "title", text: "Shader output" },
      { key: "code", text: "Generated GLSL" },
      { key: "diagnostics", text: "Diagnostics" },
      { key: "empty", text: "Generate to inspect shader output." },
      { key: "stale", text: "Previous generation — graph has changed." },
      { key: "success", text: "Generated successfully · Host-free GLSL" },
      { key: "blocked", text: "Generation blocked" },
      { key: "locate", text: "Locate node" },
    ],
  },
};
