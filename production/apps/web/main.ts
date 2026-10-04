import { currentSources } from "../../src/modules/sources-current.ts";
import { browserIdentity } from "../../src/adapters/browser/identity.ts";
import { functionNetworks } from "../../src/modules/function-networks.ts";
import {
  functionOperations,
  functionProfile,
} from "../../src/modules/function-operations.ts";
import { networkModule } from "../../src/modules/networks.ts";
import { probeDefinitions } from "../../src/modules/package-probe.ts";
import { extentModule } from "../../src/modules/extents.ts";
import { BrowserLibraryStore } from "../../src/adapters/browser/library.ts";
import { PersonalLibrary } from "../../src/application/personal.ts";
import { mountPersonal } from "./personal.ts";
import {
  currentOutputModule,
  currentGraphKinds,
  currentImageKind,
  currentOutputText,
} from "../../src/modules/image-current.ts";
import { shellText, shellPresentation, shellDefaults } from "./shell-copy.ts";
import { Definitions } from "../../src/definitions/registry.ts";
import { basicNodes, nodeText } from "../../src/modules/nodes.ts";
import {
  graphKinds,
  imageKind,
  stages,
  esProfile,
} from "../../src/modules/image.ts";
import { EditorApplication } from "../../src/application/editor.ts";
import type { DocumentInspection } from "../../src/application/inspection.ts";
import { decodeInput } from "../../src/persistence/png.ts";
import { renderDocumentPNG } from "../../src/adapters/browser/png.ts";
import {
  BrowserStorage,
  browserOutput,
  downloadBytes,
} from "../../src/adapters/browser/storage.ts";
import { browserFeedback } from "../../src/adapters/browser/presentation.ts";
import { Localization } from "../../src/localization/service.ts";
import { Workspace } from "../../src/ui/workspace.ts";
import { PanelRenderer } from "../../src/ui/mount.ts";
import { WidgetRegistry } from "../../src/ui/widgets.ts";
import {
  canvasType,
  canvasCommands,
  canvasText,
} from "../../src/features/canvas.ts";
import { inspectorType, inspectorText } from "../../src/features/inspector.ts";
import { actionsType, actionsText } from "../../src/features/actions.ts";
import { codeType, codeText } from "../../src/features/code.ts";
import {
  jsonWidget,
  numberWidget,
  choiceWidget,
  controlsText,
} from "../../src/features/controls.ts";

const definitions = new Definitions();
stages.forEach((s) => definitions.registerStage(s));
definitions.register(basicNodes);
definitions.register(networkModule);
definitions.register(extentModule);
definitions.register(currentSources);
definitions.register(functionNetworks);
definitions.register(functionOperations);
definitions.register(graphKinds);
definitions.registerKind(imageKind);
definitions.register(currentOutputModule);
definitions.register(currentGraphKinds);
definitions.registerKind(currentImageKind);
const locale = new Localization();
locale.registerModule(shellPresentation, shellDefaults);
for (const contribution of [
  nodeText,
  currentOutputText,
  canvasText,
  inspectorText,
  actionsText,
  codeText,
  controlsText,
])
  locale.registerModule(contribution.presentation, contribution.defaults);
const text = (
  key: Parameters<typeof shellText>[0],
  params?: Parameters<typeof shellText>[1],
) => locale.resolve(shellText(key, params)).text;
const feedback = browserFeedback(locale);
const widgets = new WidgetRegistry(feedback);
widgets.register(jsonWidget, (p) => p.spec.type === "json");
widgets.register(numberWidget, (p) => p.spec.type === "number");
widgets.register(choiceWidget, (p) => p.spec.type === "choice");
const application = new EditorApplication(
  definitions,
  browserIdentity(),
  currentImageKind.ref,
  functionProfile,
  new BrowserStorage(),
  browserOutput,
  probeDefinitions,
);
const app = document.querySelector<HTMLElement>("#app")!;
app.innerHTML =
  '<header><div class="brand"><span class="grape-mark">●</span> Grape <small>SHADER WORKSPACE</small></div><nav aria-label="Document actions"></nav><div class="status"><span id="save-state"></span><span class="host">Host-free</span></div></header><div id="message" role="status"></div><div id="actions"></div><main><section id="canvases"></section><aside id="inspector"></aside></main><section id="code"></section><footer><span>Click an output port, then an input to connect. Shift-click replaces a connection.</span><span>Scroll to zoom · Drag empty space to pan</span></footer><dialog id="open-dialog"><h2>Open saved document</h2><div id="saved-list"></div><button id="cancel-open">Cancel</button></dialog><dialog id="recovery"><h2>Document retained</h2><p id="recovery-message"></p><button id="export-original">Export original</button><button id="close-recovery">Close</button></dialog>';
const staticText = [
  [".brand small", "subtitle"],
  [".host", "hostFree"],
  ["footer span:first-child", "connections"],
  ["footer span:last-child", "navigation"],
  ["#open-dialog h2", "openTitle"],
  ["#cancel-open", "cancel"],
  ["#recovery h2", "recoveryTitle"],
  ["#export-original", "original"],
  ["#close-recovery", "close"],
] as const;
const renderShell = () => {
  for (const [selector, key] of staticText)
    app.querySelector(selector)!.textContent = text(key);
  app.querySelector("nav")!.setAttribute("aria-label", text("documentActions"));
};
renderShell();
locale.subscribe(renderShell);
const message = document.querySelector<HTMLElement>("#message")!,
  nav = app.querySelector("nav")!,
  saveState = document.querySelector<HTMLElement>("#save-state")!;
const report = (error: unknown) => {
  message.textContent = error instanceof Error ? error.message : String(error);
  message.classList.add("error");
};
const action = (
  key: Parameters<typeof shellText>[0],
  fn: () => void | Promise<void>,
) => {
  const button = document.createElement("button");
  button.textContent = text(key);
  locale.subscribe(() => {
    button.textContent = text(key);
  });
  button.addEventListener("click", () => {
    message.textContent = "";
    message.classList.remove("error");
    try {
      Promise.resolve(fn()).catch(report);
    } catch (error) {
      report(error);
    }
  });
  nav.append(button);
  return button;
};
let workspace: Workspace | null = null,
  renderer: PanelRenderer | null = null,
  canvasCount = 0;
function buildWorkspace() {
  renderer?.dispose();
  workspace?.dispose();
  document.querySelector("#canvases")!.replaceChildren();
  document.querySelector("#inspector")!.replaceChildren();
  document.querySelector("#code")!.replaceChildren();
  document.querySelector("#actions")!.replaceChildren();
  workspace = new Workspace(application);
  workspace.register(canvasType);
  workspace.register(inspectorType(widgets, locale));
  workspace.register(
    actionsType(application.catalog(), () => ({
      undo: application.canUndo,
      redo: application.canRedo,
      editing: !application.readonly && !application.busy,
    })),
  );
  workspace.register(
    codeType(() => ({
      compilation: application.compilation,
      snapshot: application.snapshot,
    })),
  );
  canvasCount = 0;
  workspace.open({
    id: "actions",
    typeId: "grape.panel.actions",
    viewStateVersion: 1,
    state: {},
    paneId: "actions",
    hidden: false,
  });
  workspace.open({
    id: "inspector",
    typeId: "grape.panel.inspector",
    viewStateVersion: 1,
    state: {},
    paneId: "inspector",
    hidden: false,
  });
  workspace.open({
    id: "code",
    typeId: "grape.panel.code",
    viewStateVersion: 1,
    state: {},
    paneId: "code",
    hidden: false,
  });
  addCanvas();
  renderer = new PanelRenderer(
    workspace,
    locale,
    (pane, id) => ({
      protocol: "grape.dom.v1",
      target: document.getElementById(pane)!,
    }),
    feedback,
  );
}
function addCanvas() {
  const context = application.context(),
    id = "canvas-" + ++canvasCount;
  const container = document.createElement("section");
  container.id = id;
  container.className = "canvas-pane";
  const label = document.createElement("div");
  label.className = "pane-title";
  label.textContent = text("canvas", { number: canvasCount });
  container.append(label);
  document.querySelector("#canvases")!.append(container);
  workspace!.open({
    id,
    typeId: canvasType.typeId,
    viewStateVersion: 1,
    state: {},
    paneId: id,
    hidden: false,
    contextId: context.id,
  });
  workspace!.activate(id);
}
application.grant(canvasType.typeId, canvasCommands);
application.grant("grape.panel.actions", [
  "grape.node.add",
  "grape.node.delete",
  "grape.undo",
  "grape.redo",
]);
application.grant("grape.panel.inspector", [
  "grape.edge.disconnect",
  "grape.node.rename",
]);
const replacing = () => {
  if (application.busy) throw Error(text("gestureBusy"));
  if (workspace?.records().some((r) => r.instance && !r.instance.canClose()))
    throw Error(text("draftBusy"));
  return !application.dirty || confirm(text("discard"));
};
// Dispose routed presentation before replacing document lifetimes; the new document gets fresh contexts.
function prepareReplace() {
  renderer?.dispose();
  renderer = null;
  workspace?.dispose();
  workspace = null;
}
action("new", () => {
  if (!replacing()) return;
  prepareReplace();
  application.newDocument();
  buildWorkspace();
});
const upgradeButton = document.createElement("button");
upgradeButton.textContent = "Upgrade subgraph owners";
upgradeButton.onclick = () => {
  try {
    if (!replacing()) return;
    prepareReplace();
    application.upgradeOwners();
    buildWorkspace();
    message.textContent =
      "Subgraph owners upgraded explicitly; existing definitions remain expanded. Save to retain the upgraded document.";
  } catch (error) {
    report(error);
  }
};
nav.append(upgradeButton);
const saveButton = action("save", async () => {
  await application.save();
  message.textContent = text("stored");
});
action("open", async () => {
  const list = document.querySelector("#saved-list")!;
  list.replaceChildren();
  for (const entry of await application.savedDocuments()) {
    const b = document.createElement("button");
    b.textContent = entry.name;
    b.dataset.documentKey = entry.key;
    b.onclick = () => {
      void (async () => {
        if (!replacing()) return;
        const result = await application.reopen(entry.key);
        if (result.status === "editable") {
          buildWorkspace();
          (document.querySelector("#open-dialog") as HTMLDialogElement).close();
        } else recovery(result.raw, result.reason);
      })().catch(report);
    };
    list.append(b);
  }
  if (!list.childNodes.length) list.textContent = text("noDocuments");
  (document.querySelector("#open-dialog") as HTMLDialogElement).showModal();
});
action("export", async () => {
  await application.download();
  message.textContent = text("exported");
});
const pngDialog = document.createElement("dialog");
const pngTitle = document.createElement("h2"),
  pngImage = document.createElement("img"),
  pngDownload = document.createElement("button"),
  pngClose = document.createElement("button");
pngTitle.textContent = text("pngTitle");
pngDownload.textContent = text("pngDownload");
pngClose.textContent = text("cancel");
pngDialog.style.width = "min(1100px, 90vw)";
pngImage.alt = text("pngTitle");
pngImage.style.maxWidth = "100%";
pngImage.style.maxHeight = "65vh";
pngImage.style.display = "block";
pngImage.style.margin = "0 auto 16px";
pngDialog.append(pngTitle, pngImage, pngDownload, pngClose);
app.append(pngDialog);
let pngTicket = 0,
  pngURL = "",
  pngBytes: Uint8Array | null = null,
  pngName = "";
const cancelPNG = () => {
  pngTicket++;
  pngBytes = null;
  if (pngURL) URL.revokeObjectURL(pngURL);
  pngURL = "";
  pngImage.removeAttribute("src");
  pngDialog.close();
};
pngClose.onclick = cancelPNG;
pngDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  cancelPNG();
});
pngDownload.onclick = () => {
  if (pngBytes)
    void downloadBytes(pngName, pngBytes.slice().buffer).catch(report);
};
action("png", async () => {
  cancelPNG();
  const ticket = pngTicket,
    snapshot = application.snapshot;
  const pane = document.querySelector(".canvas-pane");
  const layout = new Map<string, { width: number; height: number }>();
  pane?.querySelectorAll<HTMLElement>(".node[data-node]").forEach((node) =>
    layout.set(node.dataset.node!, {
      width: node.offsetWidth,
      height: node.offsetHeight,
    }),
  );
  const stage = snapshot.document.graph.stages.find((s) =>
    s.network.nodes.some((n) => layout.has(n.id)),
  );
  if (!stage) throw Error("PNG_LAYOUT_MISSING");
  pngDownload.disabled = true;
  pngDialog.showModal();
  try {
    const bytes = await renderDocumentPNG(snapshot.document, stage.id, layout);
    if (ticket !== pngTicket) return;
    pngBytes = bytes;
    pngName = `${snapshot.document.graph.name}-${snapshot.document.graph.kind.kindId}-${stage.key}.png`;
    pngURL = URL.createObjectURL(
      new Blob([bytes.slice().buffer], { type: "image/png" }),
    );
    pngImage.src = pngURL;
    pngDownload.disabled = false;
  } catch (error) {
    if (ticket === pngTicket) {
      cancelPNG();
      throw error;
    }
  }
});
const input = document.createElement("input");
input.type = "file";
input.setAttribute("aria-label", "Open document file");
input.accept = ".json,.grape.json,.png,application/json,image/png";
input.hidden = true;
app.append(input);
action("file", () => {
  input.click();
});
input.addEventListener("change", () => {
  void (async () => {
    const file = input.files?.[0];
    if (!file) return;
    closeReview();
    const ticket = reviewTicket;
    const base = application.snapshot;
    recovery(file, "READING_INPUT");
    let bytes: ArrayBuffer;
    try {
      bytes = await file.arrayBuffer();
    } catch {
      if (ticket === reviewTicket) recovery(file, "FILE_READ_FAILED");
      input.value = "";
      return;
    }
    if (ticket !== reviewTicket) return;
    if (
      base.loadId !== application.snapshot.loadId ||
      base.revision !== application.snapshot.revision
    ) {
      recovery(bytes, "OPEN_SUPERSEDED");
      input.value = "";
      return;
    }
    let raw: string;
    try {
      raw = decodeInput(new Uint8Array(bytes), file.name);
    } catch (error) {
      recovery(bytes, error instanceof Error ? error.message : String(error));
      input.value = "";
      return;
    }
    currentReview = application.inspectText(raw);
    document.querySelector("#recovery h2")!.textContent = text("reviewTitle");
    recovery(bytes, currentReview.status + ": " + currentReview.reason);
    reviewDetails.textContent = JSON.stringify(
      {
        diagnostics: currentReview.diagnostics,
        repairs: currentReview.repairs,
        provenance: currentReview.provenance,
        unknownPaths:
          currentReview.read.status === "recovery-readonly"
            ? currentReview.read.unknownPaths
            : [],
        candidate: currentReview.candidate,
      },
      null,
      2,
    );
    rawPreview.textContent = raw.slice(0, 12000);
    acceptButton.hidden = !currentReview.candidate;
    acceptButton.disabled = application.readonly;
    loadButton.hidden =
      currentReview.read.status !== "editable" ||
      !currentReview.document ||
      currentReview.reason === "NETWORK_SIZE";
    loadButton.disabled = application.readonly;
    input.value = "";
  })().catch(report);
});
action("generate", () => {
  application.generate();
});
action("second", () => {
  addCanvas();
});
const lockButton = action("lock", () =>
  application.setReadonly(!application.readonly),
);
lockButton.setAttribute("aria-pressed", "false");
let original: string | ArrayBuffer | Blob = "";
let currentReview: DocumentInspection | null = null,
  reviewTicket = 0;
const reviewDialog = document.querySelector<HTMLDialogElement>("#recovery")!;
reviewDialog.style.width = "min(900px, 90vw)";
const reviewDetails = document.createElement("pre"),
  rawPreview = document.createElement("pre"),
  explanation = document.createElement("p"),
  acceptButton = document.createElement("button"),
  loadButton = document.createElement("button");
reviewDetails.setAttribute("aria-label", text("reviewDetails"));
rawPreview.setAttribute("aria-label", text("originalPreview"));
reviewDetails.style.maxHeight = "30vh";
rawPreview.style.maxHeight = "15vh";
reviewDetails.style.overflow = rawPreview.style.overflow = "auto";
explanation.textContent = text("loadExplanation");
acceptButton.textContent = text("acceptImport");
loadButton.textContent = text("openPreserved");
acceptButton.hidden = loadButton.hidden = true;
reviewDialog.append(
  explanation,
  reviewDetails,
  rawPreview,
  acceptButton,
  loadButton,
);
function closeReview() {
  reviewTicket++;
  if (currentReview) application.cancelReview(currentReview);
  currentReview = null;
  reviewDetails.textContent = rawPreview.textContent = "";
  acceptButton.hidden = loadButton.hidden = true;
  reviewDialog.close();
  input.value = "";
}
reviewDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeReview();
});
acceptButton.onclick = () => {
  try {
    if (workspace?.records().some((r) => r.instance && !r.instance.canClose()))
      throw Error(text("draftBusy"));
    if (currentReview) application.acceptReview(currentReview);
    closeReview();
  } catch (error) {
    document.querySelector("#recovery-message")!.textContent =
      error instanceof Error ? error.message : String(error);
  }
};
loadButton.onclick = () => {
  try {
    if (!currentReview || !replacing()) return;
    application.openReviewed(currentReview);
    buildWorkspace();
    closeReview();
  } catch (error) {
    document.querySelector("#recovery-message")!.textContent =
      error instanceof Error ? error.message : String(error);
  }
};
function recovery(raw: string | ArrayBuffer | Blob, reason: string) {
  original = raw;
  document.querySelector("#recovery-message")!.textContent = text("recovery", {
    reason,
  });
  if (!reviewDialog.open) reviewDialog.showModal();
}
document
  .querySelector("#export-original")!
  .addEventListener(
    "click",
    () => void downloadBytes("recovery-original.json", original),
  );
document
  .querySelector("#close-recovery")!
  .addEventListener("click", closeReview);
document
  .querySelector("#cancel-open")!
  .addEventListener("click", () =>
    (document.querySelector("#open-dialog") as HTMLDialogElement).close(),
  );
application.subscribe(() => {
  saveState.textContent = application.saving
    ? text("saving")
    : application.dirty
      ? text("dirty")
      : text("saved");
  saveButton.disabled = application.saving;
  lockButton.setAttribute("aria-pressed", String(application.readonly));
});
application.newDocument();
buildWorkspace();
mountPersonal(
  nav,
  application,
  () => {
    const id = workspace?.records().find((r) => r.saved.id === "inspector")
      ?.update.target?.scope.contextId;
    if (!id) throw Error("Select a Canvas first.");
    return application.context(id);
  },
  new PersonalLibrary(
    new BrowserLibraryStore(),
    definitions.pin(definitions.pins()),
    functionProfile,
    probeDefinitions,
  ),
  report,
);
