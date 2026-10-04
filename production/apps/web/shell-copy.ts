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
    "Click an output port, then an input to connect. Existing connections are replaced by default.",
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
  replaceReady:
    "Replace is available for the current document. It keeps this session and replaces its contents in one Undo step.",
  replaceDefinitions:
    "This file is valid, but Replace is unavailable because it uses different module versions or output profile. Choose Open in new session to open the file, or Close to keep working here. You can still export the original source.",
  replaceStale:
    "The current document changed or this review ended ({code}). Close this review and choose Open file again. You can still export the original source.",
  replaceReadonly:
    "Editing is locked. Close this review, unlock editing, and open the file again.",
  replaceBusy:
    "Finish or cancel the current edit before replacing this document.",
  replaceUnavailable:
    "Replace is unavailable ({code}). Close this review to keep working; the original source remains available to export.",
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
