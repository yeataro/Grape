import type { PresentationFeedback } from "../../sdk/ui.ts";
import type { LocalizationService } from "../../sdk/localization.ts";
import { demand } from "../../sdk/kernel.ts";
const owner = {
  moduleId: "grape.shell",
  version: "0.1.0",
  fingerprint: "shell-dom-v1",
  namespace: "grape.shell",
  catalogVersion: 1,
};
export function browserFeedback(
  locale: LocalizationService,
): PresentationFeedback {
  return {
    show(surface, issue, retry) {
      demand(surface.protocol === "grape.dom.v1", "SURFACE_PROTOCOL");
      const root = document.createElement("section"),
        message = document.createElement("p"),
        button = document.createElement("button");
      root.className = "view-placeholder";
      root.setAttribute("role", "alert");
      message.textContent = issue;
      const render = () => {
        button.textContent = locale.resolve({
          owner,
          key: "retry",
          fallback: "Retry view",
        }).text;
      };
      render();
      const unsubscribe = locale.subscribe(render);
      button.addEventListener("click", retry);
      root.append(message, button);
      (surface.target as HTMLElement).append(root);
      return () => {
        unsubscribe();
        button.removeEventListener("click", retry);
        root.remove();
      };
    },
  };
}
