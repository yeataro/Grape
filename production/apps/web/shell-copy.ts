import type { TextRef } from "../../src/sdk/localization.ts";
const owner = {
  moduleId: "grape.shell",
  version: "0.1.0",
  fingerprint: "shell-dom-v1",
  namespace: "grape.shell",
  catalogVersion: 1,
};
const messages = {
  subtitle: "SHADER WORKSPACE",
  documentActions: "Document actions",
  hostFree: "Host-free",
  connections:
    "Click an output port, then an input to connect. Shift-click replaces a connection.",
  navigation: "Scroll to zoom · Drag empty space to pan",
  new: "New document",
  save: "Save",
  open: "Open saved",
  export: "Export JSON",
  png: "Export PNG",
  pngTitle: "Preview PNG export",
  pngDownload: "Download PNG",
  reviewTitle: "Review document",
  acceptImport: "Accept replacement (one Undo)",
  openPreserved: "Open in new session",
  reviewDetails: "Inspection and proposal",
  originalPreview: "Original text (first 12000 characters)",
  loadExplanation:
    "Opening in a new session preserves model errors for re-save and starts empty History. Import acceptance requires a valid candidate and the current exact modules.",
  file: "Open file",
  generate: "Generate GLSL",
  second: "Second Canvas",
  lock: "Lock editing",
  openTitle: "Open saved document",
  cancel: "Cancel",
  recoveryTitle: "Document retained",
  original: "Export original",
  close: "Close",
  canvas: "Canvas {number}",
  gestureBusy: "Finish or cancel the current gesture first.",
  draftBusy: "Commit or cancel parameter drafts first.",
  discard: "Discard unsaved changes and open another document?",
  stored: "Saved to this browser.",
  noDocuments: "No saved documents yet.",
  exported: "Export started. Saved status is unchanged.",
  recovery:
    "{reason}. The current graph was not replaced. You can export the original source.",
  saving: "Saving…",
  dirty: "Unsaved changes",
  saved: "Saved",
  retry: "Retry view",
} as const;
export const shellPresentation = { owner, defaultLocale: "en" };
export const shellDefaults = {
  owner,
  locale: "en",
  revision: 1,
  messages: Object.entries(messages).map(([key, text]) => ({ key, text })),
};
export function shellText(
  key: keyof typeof messages,
  params?: TextRef["params"],
): TextRef {
  return { owner, key, fallback: messages[key], ...(params ? { params } : {}) };
}
