import type { HoverPreference } from "../../src/ui/hover.ts";
/** Isolated versioned Preferences key; never uses document/layout storage. */
export function hoverPreference(
  storage: () => Pick<Storage, "getItem" | "setItem">,
): HoverPreference {
  const key = "grape.preferences.hover.v1";
  return {
    load() {
      try {
        const raw = storage().getItem(key);
        if (raw === null)
          return {
            enabled: false,
            issue: "Default: normal hints. Saved only in this browser.",
          };
        if (raw === "true" || raw === "false")
          return {
            enabled: raw === "true",
            issue: "Saved only in this browser.",
          };
        return {
          enabled: false,
          issue:
            "Stored hover preference is invalid. Normal hints are active; unrelated preferences are unchanged.",
        };
      } catch {
        return {
          enabled: false,
          issue: "Preference storage is unavailable. Normal hints are active.",
        };
      }
    },
    save(enabled) {
      try {
        storage().setItem(key, String(enabled));
        return { enabled, issue: "Saved only in this browser." };
      } catch {
        return {
          enabled: false,
          issue:
            "Preference could not be saved. Normal hints are active; storage was not cleared.",
        };
      }
    },
  };
}
