import {
  PersonalLibrary,
  readPersonal,
  personalFilename,
} from "../../src/application/personal.ts";
import type {
  EditorApplication,
  EditorContext,
} from "../../src/application/editor.ts";
import { downloadBytes } from "../../src/adapters/browser/storage.ts";
/** Shell routes user intent through Application; Library storage never touches Graph History. */
export function mountPersonal(
  parent: HTMLElement,
  application: EditorApplication,
  context: () => EditorContext,
  library: PersonalLibrary,
  report: (e: unknown, operation: string) => void,
) {
  const dialog = document.createElement("dialog"),
    heading = document.createElement("h2"),
    note = document.createElement("p"),
    list = document.createElement("div"),
    status = document.createElement("p");
  const search = document.createElement("input"),
    detail = document.createElement("pre");
  search.type = "search";
  search.ariaLabel = "Search Personal Library";
  search.placeholder = "Search saved subgraphs…";
  detail.hidden = true;
  heading.textContent = "Personal Library";
  note.textContent =
    "Saved in this browser. Export a package to keep a file copy. Select a subgraph to save it.";
  status.setAttribute("role", "status");
  dialog.append(heading, note, search, status, list, detail);
  parent.append(dialog);
  let activity = 0,
    openedContext: EditorContext | null = null,
    openedScope = "";
  const destination = () => {
    if (
      !dialog.open ||
      !openedContext ||
      context() !== openedContext ||
      JSON.stringify(openedContext.capture().scope) !== openedScope
    )
      throw Error("PERSONAL_STALE: Reopen the Library for the current Canvas.");
    return openedContext;
  };
  const button = (
    label: string,
    fn: (ticket: number) => void | Promise<void>,
    target: HTMLElement = dialog,
  ) => {
    const b = document.createElement("button");
    b.textContent = label;
    b.onclick = () => {
      const ticket = ++activity;
      void Promise.resolve()
        .then(() => {
          if (ticket === activity) return fn(ticket);
        })
        .then(() => {
          if (ticket === activity) report(undefined, label);
        })
        .catch((e) => {
          if (ticket !== activity) return;
          status.textContent = e instanceof Error ? e.message : String(e);
          report(e, label);
        });
    };
    target.append(b);
    return b;
  };
  const refresh = async (ticket = activity) => {
    const result = await library.list();
    if (ticket !== activity) return;
    list.replaceChildren();
    for (const item of result.items) {
      const row = document.createElement("div");
      row.dataset.personalFile = item.name;
      const name = document.createElement("span");
      name.textContent = item.asset.name + " — " + item.name;
      row.append(name);
      row.dataset.search = (item.asset.name + " " + item.name)
        .normalize("NFKC")
        .toLowerCase();
      button(
        "Inspect " + item.asset.name,
        () => {
          detail.hidden = false;
          const entry = item.asset.resources.find(
              (r) => r.id === item.asset.entry,
            )!,
            data = entry.data as unknown as {
              interface: {
                name: string;
                key: string;
                direction: string;
                type: string;
              }[];
            };
          detail.textContent = [
            item.asset.name,
            "Personal subgraph",
            ...data.interface.map(
              (p) => `${p.direction} ${p.name || p.key}: ${p.type}`,
            ),
            "Stages: " +
              item.asset.stageKindIds
                .map((s) => s.replace("grape.stage.", ""))
                .join(", "),
          ].join("\n");
        },
        row,
      );
      const insert = button(
        "Insert " + item.asset.name,
        async (ticket) => {
          await application.insertPersonal(
            destination(),
            JSON.stringify(item.asset),
          );
          if (ticket === activity && dialog.open) dialog.close();
        },
        row,
      );
      insert.dataset.libraryInsert = "true";
      insert.disabled = application.readonly || application.busy;
      button(
        "Export " + item.asset.name,
        () => downloadBytes(item.name, JSON.stringify(item.asset)),
        row,
      );
      list.append(row);
    }
    status.textContent =
      result.issues.map((i) => i.name + ": " + i.code).join("\n") ||
      `${result.items.length} saved subgraphs`;
    filter();
  };
  const filter = () => {
    const terms = search.value
      .normalize("NFKC")
      .toLowerCase()
      .trim()
      .split(/\s+/);
    for (const row of list.children)
      (row as HTMLElement).hidden = !terms.every((t) =>
        (row as HTMLElement).dataset.search!.includes(t),
      );
  };
  search.oninput = filter;
  const open = button(
    "Personal Library",
    async () => {
      openedContext = context();
      openedScope = JSON.stringify(openedContext.capture().scope);
      dialog.showModal();
      search.value = "";
      detail.hidden = true;
      await refresh();
    },
    parent,
  );
  button("Save selected subgraph", async (ticket) => {
    const asset = await application.exportPersonal(destination());
    if (ticket !== activity) return;
    const saved = await library.save(asset);
    if (ticket !== activity) return;
    await refresh(ticket);
    if (ticket !== activity) return;
    status.textContent = (saved.reused ? "Reused " : "Saved ") + saved.name;
  });
  button("Export selected subgraph", async (ticket) => {
    const asset = await application.exportPersonal(destination());
    if (ticket !== activity) return;
    await downloadBytes(personalFilename(asset.name), JSON.stringify(asset));
  });
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,.sgrape-function.json";
  input.setAttribute("aria-label", "Import Personal package");
  input.onchange = () => {
    const ticket = ++activity;
    void (async () => {
      const file = input.files?.[0];
      if (!file) return;
      const asset = await readPersonal(
        await file.text(),
        library.definitions,
        library.profile,
        library.probeProvider,
      );
      if (ticket !== activity) return;
      await library.save(asset);
      if (ticket !== activity) return;
      await refresh(ticket);
      if (ticket !== activity) return;
      report(undefined, "Import Personal package");
    })()
      .catch((e) => {
        if (ticket !== activity) return;
        status.textContent = e instanceof Error ? e.message : String(e);
        report(e, "Import Personal package");
      })
      .finally(() => {
        if (ticket === activity) input.value = "";
      });
  };
  dialog.append(input);
  button("Refresh Personal", refresh);
  button("Close Personal", () => dialog.close());
  button("Close Personal details", () => {
    detail.hidden = true;
  });
  application.subscribe(() => {
    for (const insert of dialog.querySelectorAll<HTMLButtonElement>(
      "[data-library-insert]",
    ))
      insert.disabled = application.readonly || application.busy;
  });
  dialog.addEventListener("close", () => {
    activity++;
    openedContext = null;
    openedScope = "";
    open.focus();
  });
  return { open, dialog };
}
