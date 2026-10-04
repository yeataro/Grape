import {
  zeroOutputModule,
  zeroGraphKinds,
  zeroImageKind,
  zeroSources,
  zeroOutputText,
} from "../../src/modules/image-zero.ts";
import { floatingSurface } from "../../src/ui/floating.ts";
import { mountBuildInfo } from "./build-info.ts";
import { icon } from "../../src/features/node-browser.ts";
import { mountHover } from "../../src/ui/hover.ts";
import { currentSources } from "../../src/modules/sources-current.ts";
import {
  fixedValues,
  FIXED_VALUES_PIN,
} from "../../src/modules/fixed-values.ts";
import { vectorWidget } from "../../src/features/vector-control.ts";
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
import { WorkspaceView } from "../../src/ui/workspace-view.ts";
import type { WorkspaceLayout } from "../../src/sdk/ui.ts";
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
definitions.register(fixedValues);
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
definitions.register(zeroOutputModule);
definitions.register(zeroGraphKinds);
definitions.registerKind(zeroImageKind);
definitions.register(zeroSources);
const locale = new Localization();
locale.registerModule(shellPresentation, shellDefaults);
for (const contribution of [
  nodeText,
  currentOutputText,
  zeroOutputText,
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
widgets.register(
  vectorWidget,
  (p) =>
    p.spec.presentation.widget === "grape.widget.vector" &&
    Array.isArray(p.value),
);
const application = new EditorApplication(
  definitions,
  browserIdentity(),
  zeroImageKind.ref,
  functionProfile,
  new BrowserStorage(),
  browserOutput,
  probeDefinitions,
);
const app = document.querySelector<HTMLElement>("#app")!;
app.innerHTML =
  '<header><div class="brand"><svg class="grape-mark" viewBox="0 0 64 64" width="28" height="28" aria-hidden="true"><circle cx="20" cy="23" r="11" fill="#bfa5f4"/><circle cx="44" cy="23" r="11" fill="#a98be2"/><circle cx="32" cy="44" r="11" fill="#b499ef"/></svg> Grape <small>SHADER WORKSPACE</small></div><nav aria-label="Document actions"></nav><div class="status"><span id="save-state"></span><span class="host">Host-free</span></div></header><div id="message" role="status"></div><div id="actions"></div><main><section id="canvases"></section><aside id="inspector"></aside></main><section id="code"></section><footer><span data-hint="connections">Click an output port, then an input to connect. Shift-click replaces a connection.</span><span data-hint="navigation">Scroll to zoom · Drag empty space to pan</span></footer><dialog id="open-dialog"><h2>Open saved document</h2><div id="saved-list"></div><button id="cancel-open">Cancel</button></dialog><dialog id="recovery"><h2>Document retained</h2><p id="recovery-message"></p><button id="export-original">Export original</button><button id="close-recovery">Close</button></dialog>';
const staticText = [
  [".brand small", "subtitle"],
  [".host", "hostFree"],
  ["[data-hint=connections]", "connections"],
  ["[data-hint=navigation]", "navigation"],
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
mountBuildInfo(app.querySelector<HTMLElement>(".brand")!);
const oldMessage = document.querySelector<HTMLElement>("#message")!,
  message = document.createElement("button"),
  statusBar = document.createElement("div"),
  nav = app.querySelector("nav")!,
  saveState = document.querySelector<HTMLElement>("#save-state")!;
message.id = "message";
message.type = "button";
message.ariaLabel = "Read full application status";
message.setAttribute("aria-haspopup", "dialog");
statusBar.className = "application-status";
statusBar.setAttribute("role", "status");
oldMessage.replaceWith(statusBar);
statusBar.append(message);
app.querySelector("footer")!.append(statusBar);
const statusText = document.createElement("div");
statusText.className = "status-details-text";
statusText.tabIndex = 0;
statusText.setAttribute("role", "region");
statusText.ariaLabel = "Full current application status";
const statusView = floatingSurface({
  host: app,
  trigger: message,
  content: statusText,
  title: "Application status details",
  closeLabel: "Close status details",
  kind: "anchored",
  width: 680,
  maxHeight: 420,
  beforeOpen: () => !!message.textContent,
  fallbackFocus: () =>
    nav.querySelector<HTMLButtonElement>("button:not(:disabled)"),
});
const closeStatus = () => statusView.close();
message.onclick = () => {
  statusText.textContent = message.textContent;
  statusView.toggle();
};
const setMessage = (text: string) => {
  message.textContent = text;
  message.disabled = !text;
  statusText.textContent = text;
  if (!text) closeStatus();
};
setMessage("");
const errors = new Map<string, string>();
const success = (text: string) => {
  if (!errors.size) setMessage(text);
};
const renderErrors = () => {
  setMessage([...errors.values()].join(" · "));
  message.classList.toggle("error", !!errors.size);
  statusBar.setAttribute("role", errors.size ? "alert" : "status");
};
const report = (error: unknown, key = "operation") => {
  errors.set(key, error instanceof Error ? error.message : String(error));
  renderErrors();
};
const action = (
  key: Parameters<typeof shellText>[0],
  fn: () => void | Promise<void>,
) => {
  const button = document.createElement("button");
  button.dataset.action = key;
  const symbol: Record<string, string> = {
    new: "add",
    save: "save",
    open: "folder",
    file: "folder",
    export: "download",
    png: "image",
    generate: "code",
    second: "panels",
    lock: "lock",
  };
  const renderAction = () =>
    button.replaceChildren(
      icon(symbol[key] ?? "folder"),
      document.createTextNode(text(key)),
    );
  renderAction();
  locale.subscribe(renderAction);
  button.addEventListener("click", () => {
    try {
      Promise.resolve(fn())
        .then(() => {
          if (errors.delete(key)) renderErrors();
        })
        .catch((error) => report(error, key));
    } catch (error) {
      report(error, key);
    }
  });
  nav.append(button);
  return button;
};
let workspace: Workspace | null = null,
  renderer: PanelRenderer | null = null,
  canvasCount = 0;
let workspaceView: WorkspaceView | null = null;
const footer = app.querySelector<HTMLElement>("footer")!;
const outputTrigger = document.createElement("button"),
  output = app.querySelector<HTMLElement>("#code")!;
outputTrigger.type = "button";
outputTrigger.textContent = "Shader output";
footer.append(outputTrigger);
output.tabIndex = 0;
const outputView = floatingSurface({
  host: app,
  trigger: outputTrigger,
  content: output,
  title: "Shader output and diagnostics",
  closeLabel: "Close shader output",
  kind: "anchored",
  width: 860,
  maxHeight: 550,
  align: "end",
  dismissOutside: false,
});
outputTrigger.onclick = () => outputView.toggle();
const hover = mountHover(app, () => application.busy || application.saving);
function buildWorkspace(layout?: WorkspaceLayout) {
  if (layout) Workspace.validate(layout);
  workspace?.preflightClose();
  hover.invalidate();
  renderer?.dispose();
  renderer = null;
  workspaceView?.dispose();
  workspace?.dispose();
  document.querySelector("#code")!.replaceChildren();
  document.querySelector("#actions")!.replaceChildren();
  workspace = new Workspace(application);
  workspace.register(canvasType);
  workspace.register(inspectorType(widgets, locale));
  workspace.register(
    actionsType(
      application.catalog().map((item) =>
        item.ref.moduleId === FIXED_VALUES_PIN.moduleId &&
        item.ref.typeId === "float"
          ? {
              ...item,
              presentation: {
                ...item.presentation,
                label: {
                  ...item.presentation.label,
                  key: "float.authoring",
                  fallback: "Float (fixed)",
                },
              },
            }
          : item,
      ),
      () => ({
        undo: application.canUndo,
        redo: application.canRedo,
        editing: !application.readonly && !application.busy,
      }),
    ),
  );
  workspace.register(
    codeType(() => ({
      compilation: application.compilation,
      snapshot: application.snapshot,
    })),
  );
  canvasCount = 0;
  if (layout) workspace.restore(layout);
  else {
    workspace.addPane("actions", "utility");
    workspace.addPane("inspector", "right");
    workspace.addPane("code", "utility");
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
  }
  workspaceView = new WorkspaceView(
    workspace,
    app.querySelector("main")!,
    locale,
    (error) => report(error, "workspace"),
    ["actions", "code"],
    () => renderer?.refresh(),
  );
  renderer = new PanelRenderer(
    workspace,
    locale,
    (pane, id) => ({
      protocol: "grape.dom.v1",
      target: ["actions", "code"].includes(pane)
        ? document.getElementById(pane)!
        : workspaceView!.surface(pane, id),
    }),
    feedback,
    (id, pane) => workspaceView!.presented(id, pane),
  );
}
function addCanvas() {
  const context = application.context();
  let id: string;
  do {
    id = "canvas-" + ++canvasCount;
  } while (
    workspace!.records().some((r) => r.saved.id === id) ||
    workspace!.panes().some((p) => p.id === id)
  );
  workspace!.addPane(id, "center");
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
function addParameters() {
  let n = 1;
  while (
    workspace!.records().some((r) => r.saved.id === "parameters-" + n) ||
    workspace!.panes().some((p) => p.id === "parameters-" + n)
  )
    n++;
  const id = "parameters-" + n;
  workspace!.addPane(id, "right");
  workspace!.open({
    id,
    typeId: "grape.panel.inspector",
    viewStateVersion: 1,
    state: {},
    paneId: id,
    hidden: false,
  });
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
  workspaceView?.dispose();
  workspaceView = null;
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
    setMessage(
      "Subgraph owners upgraded explicitly; existing definitions remain expanded. Save to retain the upgraded document.",
    );
  } catch (error) {
    report(error);
  }
};
nav.append(upgradeButton);
const imageUpgrade = document.createElement("button");
imageUpgrade.textContent = "Upgrade Image Output";
imageUpgrade.onclick = () => {
  try {
    if (!replacing()) return;
    prepareReplace();
    application.upgradeGraphKind(zeroImageKind.ref);
    buildWorkspace();
    setMessage(
      "Image Output and compatible image source owners explicitly upgraded to 0.3.0 in a new session. Unconnected color is transparent zero. Save to retain this version.",
    );
  } catch (error) {
    report(error);
  }
};
nav.append(imageUpgrade);
const saveButton = action("save", async () => {
  await application.save();
  success(text("stored"));
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
  success(text("exported"));
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
  const activeCanvas = workspace?.activeCanvas();
  const pane = activeCanvas
    ? document.getElementById(activeCanvas.saved.id)
    : null;
  if (
    !activeCanvas?.update.target ||
    activeCanvas.update.target.scope.networkPath.length
  )
    throw Error("PNG_LAYOUT_MISSING");
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
    loadButton.hidden =
      currentReview.read.status !== "editable" ||
      !currentReview.document ||
      currentReview.reason === "NETWORK_SIZE";
    refreshReplacement();
    input.value = "";
  })().catch(report);
});
action("generate", () => {
  const result = application.generate();
  if (result.status !== "success")
    throw Error(
      result.diagnostics.map((d) => d.code + ": " + d.message).join(" · "),
    );
});
action("second", () => {
  addCanvas();
});
const lockButton = action("lock", () =>
  application.setReadonly(!application.readonly),
);
lockButton.setAttribute("aria-checked", "false");
let original: string | ArrayBuffer | Blob = "";
let currentReview: DocumentInspection | null = null,
  reviewTicket = 0;
const reviewDialog = document.querySelector<HTMLDialogElement>("#recovery")!;
reviewDialog.style.width = "min(900px, 90vw)";
const reviewDetails = document.createElement("pre"),
  rawPreview = document.createElement("pre"),
  explanation = document.createElement("p"),
  replacementMessage = document.createElement("p"),
  acceptButton = document.createElement("button"),
  loadButton = document.createElement("button");
reviewDetails.setAttribute("aria-label", text("reviewDetails"));
rawPreview.setAttribute("aria-label", text("originalPreview"));
reviewDetails.style.maxHeight = "30vh";
rawPreview.style.maxHeight = "15vh";
reviewDetails.style.overflow = rawPreview.style.overflow = "auto";
explanation.textContent = text("loadExplanation");
replacementMessage.id = "replacement-message";
replacementMessage.setAttribute("role", "status");
acceptButton.textContent = text("acceptImport");
loadButton.textContent = text("openPreserved");
acceptButton.hidden = loadButton.hidden = true;
reviewDialog.append(
  explanation,
  reviewDetails,
  rawPreview,
  replacementMessage,
  acceptButton,
  loadButton,
);
function refreshReplacement() {
  if (!currentReview) {
    replacementMessage.textContent = "";
    return;
  }
  const eligibility = application.replacementEligibility(currentReview);
  acceptButton.hidden = !currentReview.candidate;
  acceptButton.disabled = !eligibility.available;
  const code = eligibility.available ? null : eligibility.code;
  replacementMessage.textContent = !currentReview.candidate
    ? ""
    : code === null
      ? text("replaceReady")
      : code === "IMPORT_DEFINITIONS"
        ? text("replaceDefinitions")
        : code === "IMPORT_STALE" || code === "REVIEW_CLOSED"
          ? text("replaceStale", { code })
          : code === "IMPORT_READONLY"
            ? text("replaceReadonly")
            : code === "HISTORY_BUSY"
              ? text("replaceBusy")
              : text("replaceUnavailable", { code });
  loadButton.disabled =
    application.readonly ||
    application.busy ||
    code === "IMPORT_STALE" ||
    code === "REVIEW_CLOSED";
}
function closeReview() {
  reviewTicket++;
  if (currentReview) application.cancelReview(currentReview);
  currentReview = null;
  reviewDetails.textContent = rawPreview.textContent = "";
  replacementMessage.textContent = "";
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
    refreshReplacement();
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
  hover.invalidate();
  refreshReplacement();
  saveState.textContent = application.saving
    ? text("saving")
    : application.dirty
      ? text("dirty")
      : text("saved");
  saveButton.disabled = application.saving;
  lockButton.setAttribute("aria-checked", String(application.readonly));
});
application.newDocument();
buildWorkspace();
mountPersonal(
  nav,
  application,
  () => {
    const id = workspace?.activeCanvas()?.update.target?.scope.contextId;
    if (!id) throw Error("Select a Canvas first.");
    return application.context(id);
  },
  new PersonalLibrary(
    new BrowserLibraryStore(),
    definitions.pin(definitions.pins()),
    functionProfile,
    probeDefinitions,
  ),
  (error, operation) => {
    const key = "personal:" + operation;
    if (error === undefined) {
      if (errors.delete(key)) renderErrors();
    } else report(error, key);
  },
);

// Existing document commands keep their own handlers and guards; only their
// presentation moves into the shared owned disclosure.
const menuTrigger = document.createElement("button"),
  menuContent = document.createElement("div"),
  hintsTrigger = document.createElement("button"),
  hintsContent = document.createElement("div");
menuTrigger.type = "button";
menuTrigger.textContent = "Project actions";
menuTrigger.className = "project-actions";
menuContent.className = "function-actions";
menuContent.tabIndex = -1;
const documentGroup = document.createElement("div"),
  workspaceGroup = document.createElement("div");
for (const [group, label] of [
  [documentGroup, "Documents and library"],
  [workspaceGroup, "Workspace"],
] as const) {
  group.setAttribute("role", "group");
  group.ariaLabel = label;
  menuContent.append(group);
}
for (const child of Array.from(nav.children)) {
  const key = (child as HTMLElement).dataset.action;
  if (!(child instanceof HTMLButtonElement)) app.append(child);
  else if (key !== "save" && key !== "generate") {
    child.setAttribute(
      "role",
      key === "lock" ? "menuitemcheckbox" : "menuitem",
    );
    (key === "second" || key === "lock"
      ? workspaceGroup
      : documentGroup
    ).append(child);
  }
}
const workspaceControl = (label: string, fn: () => void | Promise<void>) => {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.setAttribute("role", "menuitem");
  button.onclick = () => {
    try {
      Promise.resolve(fn())
        .then(() => {
          projectMenu.close(false);
          if (errors.delete("workspace")) renderErrors();
        })
        .catch((error) => report(error, "workspace"));
    } catch (error) {
      report(error, "workspace");
    }
  };
  workspaceGroup.append(button);
  return button;
};
workspaceControl("Add Parameters", addParameters);
const layoutKey = "grape.workspace.current.v1";
workspaceControl("Save current layout", () => {
  const layout = workspace!.save();
  localStorage.setItem(layoutKey, JSON.stringify(layout));
  success("Current layout saved.");
});
workspaceControl("Restore current layout", () => {
  const text = localStorage.getItem(layoutKey);
  if (!text) throw Error("LAYOUT_NOT_SAVED");
  if (new TextEncoder().encode(text).length > 262144)
    throw Error("LAYOUT_SIZE");
  const layout: unknown = JSON.parse(text);
  Workspace.validate(layout);
  buildWorkspace(layout);
  success("Current layout restored. Activate a Canvas to choose its source.");
});
workspaceControl("Export current layout", async () => {
  const layout = workspace!.save();
  await downloadBytes(
    "grape-current-layout.json",
    new TextEncoder().encode(JSON.stringify(layout)).buffer,
  );
  success("Current layout exported.");
});
const layoutFile = document.createElement("input");
layoutFile.type = "file";
layoutFile.accept = ".json,application/json";
layoutFile.hidden = true;
app.append(layoutFile);
layoutFile.onchange = async () => {
  try {
    const capturedWorkspace = workspace,
      capturedLoad = application.snapshot.loadId;
    const file = layoutFile.files?.[0];
    if (!file) return;
    if (file.size > 262144) throw Error("LAYOUT_SIZE");
    const layout: unknown = JSON.parse(await file.text());
    if (
      workspace !== capturedWorkspace ||
      application.snapshot.loadId !== capturedLoad
    )
      throw Error("LAYOUT_STALE");
    Workspace.validate(layout);
    buildWorkspace(layout);
    success("Current layout imported. Activate a Canvas to choose its source.");
  } catch (error) {
    report(error, "workspace");
  } finally {
    layoutFile.value = "";
  }
};
workspaceControl("Import current layout", () => layoutFile.click());
const showPanels = workspaceControl("Show hidden panels", () => {
  for (const r of workspace!.records())
    if (r.saved.hidden) workspaceView!.show(r.saved.id);
});
const panelsTrigger = document.createElement("button"),
  panelsList = document.createElement("div");
panelsTrigger.type = "button";
panelsTrigger.textContent = "Panels";
panelsList.className = "workspace-panel-options";
footer.append(panelsTrigger);
const panelsView = floatingSurface({
  host: app,
  trigger: panelsTrigger,
  content: panelsList,
  title: "Workspace panels",
  closeLabel: "Close workspace panels",
  kind: "anchored",
  width: 360,
  maxHeight: 520,
});
panelsTrigger.onclick = () => {
  panelsList.replaceChildren();
  for (const r of workspace!
    .records()
    .filter((r) => !["actions", "code"].includes(r.saved.id))) {
    const row = document.createElement("div"),
      show = document.createElement("button"),
      settings = document.createElement("button");
    show.type = settings.type = "button";
    show.textContent = "Show " + r.saved.id;
    settings.textContent = "Settings " + r.saved.id;
    const guard = () => {
      if (workspace!.record(r.saved.id).incarnation !== r.incarnation)
        throw Error("PANEL_EXPIRED");
    };
    show.onclick = () => {
      try {
        guard();
        workspaceView!.show(r.saved.id);
        panelsView.close();
      } catch (error) {
        report(error, "workspace");
      }
    };
    settings.onclick = () => {
      try {
        guard();
        workspaceView!.panelOptions(r.saved.id, settings);
      } catch (error) {
        report(error, "workspace");
      }
    };
    row.append(show, settings);
    panelsList.append(row);
  }
  panelsView.toggle();
};
footer.prepend(menuTrigger);
const projectMenu = floatingSurface({
  host: app,
  trigger: menuTrigger,
  content: menuContent,
  title: "Project actions",
  closeLabel: "Close project actions",
  kind: "menu",
  width: 310,
  maxHeight: 520,
});
menuTrigger.onclick = () => projectMenu.toggle();
menuContent.addEventListener("click", (event) => {
  const action = (event.target as Element).closest<HTMLButtonElement>("button")
    ?.dataset.action;
  // Dialog-opening callers retain their visible opener until their own Close.
  if (action && ["new", "export", "file", "second", "lock"].includes(action))
    projectMenu.close(false);
});
hintsTrigger.type = "button";
hintsTrigger.textContent = "Hints";
hintsContent.tabIndex = 0;
for (const hint of Array.from(footer.querySelectorAll(":scope > span")))
  hintsContent.append(hint);
const inspectHint = document.createElement("span");
inspectHint.textContent =
  "F2 · Read the focused object information (read-only). Close or Escape returns focus.";
hintsContent.append(inspectHint);
footer.append(hintsTrigger);
const hintsView = floatingSurface({
  host: app,
  trigger: hintsTrigger,
  content: hintsContent,
  title: "Workspace hints",
  closeLabel: "Close hints",
  kind: "anchored",
  width: 370,
  maxHeight: 300,
  align: "end",
});
hintsTrigger.onclick = () => hintsView.toggle();
