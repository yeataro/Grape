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
  report: (e: unknown) => void,
) {
  const dialog = document.createElement("dialog"),
    heading = document.createElement("h2"),
    note = document.createElement("p"),
    list = document.createElement("div"),
    status = document.createElement("p");
  heading.textContent = "Personal Library";
  note.textContent =
    "Saved in this browser. Export a package to keep a file copy. Select a subgraph to save it.";
  status.setAttribute("role", "status");
  dialog.append(heading, note, status, list);
  parent.append(dialog);
  let activity = 0;
  const button = (
    label: string,
    fn: () => void | Promise<void>,
    target: HTMLElement = dialog,
  ) => {
    const b = document.createElement("button");
    b.textContent = label;
    b.onclick = () => {
      activity++;
      void Promise.resolve()
        .then(fn)
        .catch((e) => {
          status.textContent = e instanceof Error ? e.message : String(e);
          report(e);
        });
    };
    target.append(b);
    return b;
  };
  const refresh = async () => {
    const ticket = activity,
      result = await library.list();
    if (ticket !== activity) return;
    list.replaceChildren();
    for (const item of result.items) {
      const row = document.createElement("div");
      row.dataset.personalFile = item.name;
      const name = document.createElement("span");
      name.textContent = item.asset.name + " — " + item.name;
      row.append(name);
      button(
        "Insert " + item.asset.name,
        async () => {
          await application.insertPersonal(
            context(),
            JSON.stringify(item.asset),
          );
          dialog.close();
        },
        row,
      );
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
  };
  const open = button(
    "Personal Library",
    async () => {
      dialog.showModal();
      await refresh();
    },
    parent,
  );
  button("Save selected subgraph", async () => {
    const asset = await application.exportPersonal(context());
    const saved = await library.save(asset);
    await refresh();
    status.textContent = (saved.reused ? "Reused " : "Saved ") + saved.name;
  });
  button("Export selected subgraph", async () => {
    const asset = await application.exportPersonal(context());
    await downloadBytes(personalFilename(asset.name), JSON.stringify(asset));
  });
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,.sgrape-function.json";
  input.setAttribute("aria-label", "Import Personal package");
  input.onchange = () => {
    activity++;
    void (async () => {
      const file = input.files?.[0];
      if (!file) return;
      const asset = await readPersonal(
        await file.text(),
        library.definitions,
        library.profile,
        library.probeProvider,
      );
      await library.save(asset);
      await refresh();
    })()
      .catch((e) => {
        status.textContent = e instanceof Error ? e.message : String(e);
        report(e);
      })
      .finally(() => {
        input.value = "";
      });
  };
  dialog.append(input);
  button("Refresh Personal", refresh);
  button("Close Personal", () => dialog.close());
  return { open, dialog };
}
