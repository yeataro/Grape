import { floatingSurface } from "./floating.ts";
import type {
  HoverBlock,
  MountScope,
  HoverInfo,
  HoverReadView,
} from "../sdk/view-mount.ts";
type Owner = { root: Element; live: boolean; blocked: () => HoverBlock | null };
type Entry = { owner: Owner; read: () => HoverInfo };
const entries = new WeakMap<Element, Entry>(),
  owners = new Set<Owner>(),
  invalidations = new Set<(root: Element) => void>();
export function invalidateHover(target: unknown): void {
  if (typeof Element !== "undefined" && target instanceof Element)
    for (const invalidate of invalidations) {
      try {
        invalidate(target);
      } catch {
        /* Optional inspection cannot interrupt publication or teardown. */
      }
    }
}
export function hoverOwner(
  target: unknown,
  scope: Pick<MountScope, "own">,
  blocked: () => HoverBlock | null = () => null,
): HoverReadView {
  if (!(target instanceof Element))
    return { set: () => {}, invalidate: () => {} };
  const root = target;
  const owner: Owner = { root, live: true, blocked };
  owners.add(owner);
  scope.own(() => {
    owner.live = false;
    owners.delete(owner);
    invalidateHover(root);
  });
  return {
    set(target: unknown, read: () => HoverInfo) {
      if (!(target instanceof Element)) return;
      const element = target;
      if (!owner.live) return; // Renderers may register before appending; containment is checked on read.
      invalidateHover(element);
      entries.set(element, { owner, read });
    },
    invalidate: () => invalidateHover(root),
  };
}
/** Optional shell inspection: owner data is read only on an explicit F2 request. */
export function mountHover(root: HTMLElement, busy: () => boolean) {
  const cleanups: (() => void)[] = [];
  const release = () => {
    for (const cleanup of cleanups.splice(0).reverse()) {
      try {
        cleanup();
      } catch {
        /* Continue releasing this optional helper. */
      }
    }
  };
  try {
    const content = document.createElement("pre");
    content.className = "status-details-text";
    content.tabIndex = 0;
    content.setAttribute("role", "region");
    content.ariaLabel = "Current object data";
    let active: { element: Element; entry: Entry | null } | null = null,
      disposed = false;
    const listen = (
      target: EventTarget,
      type: string,
      callback: EventListener,
      capture = false,
    ) => {
      target.addEventListener(type, callback, capture);
      cleanups.push(() => target.removeEventListener(type, callback, capture));
    };
    const visible = (element: Element) =>
      element.isConnected &&
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility !== "hidden";
    const valid = () =>
      active &&
      root.contains(active.element) &&
      visible(active.element) &&
      (!active.entry ||
        (active.entry.owner.live &&
          active.entry.owner.root.contains(active.element) &&
          entries.get(active.element) === active.entry));
    const details = floatingSurface({
      host: root,
      content,
      title: "Object information",
      closeLabel: "Close object details",
      kind: "modal",
      width: 680,
      maxHeight: 700,
      closed: () => {
        active = null;
        content.textContent = "";
      },
    });
    cleanups.push(() => details.dispose());
    details.surface.classList.add("hover-details", "hover-owned-surface");
    const clear = () => {
      active = null;
      content.textContent = "";
      try {
        details.close(false);
      } catch {
        /* Never fail core publication. */
      }
    };
    const invalidated = (element: Element) => {
      if (
        active &&
        (element === active.element || element.contains(active.element))
      )
        clear();
    };
    invalidations.add(invalidated);
    cleanups.push(() => invalidations.delete(invalidated));
    const resolve = (target: Element) => {
      let panel: { element: Element; entry: Entry } | null = null;
      for (
        let e: Element | null = target;
        e && root.contains(e);
        e = e.parentElement
      ) {
        const entry = entries.get(e);
        if (!entry || !entry.owner.live || !entry.owner.root.contains(e))
          continue;
        if (e === entry.owner.root && e.hasAttribute("data-hover-panel"))
          panel ??= { element: e, entry };
        else return { element: e, entry };
      }
      const control = target.closest("button,input,select,textarea,summary,a");
      return control && root.contains(control)
        ? { element: control, entry: null }
        : panel;
    };
    const fallback = (element: Element): HoverInfo => ({
      kind: "UI control",
      name:
        element.getAttribute("aria-label") ||
        element.getAttribute("title") ||
        element.textContent?.trim().slice(0, 100) ||
        element.tagName,
      identity: element.id || "未提供",
      state: (element as HTMLButtonElement).disabled
        ? "UI-only · disabled"
        : "UI-only · available",
      data: {
        modelData: "未提供",
        role: element.getAttribute("role") || element.tagName.toLowerCase(),
      },
    });
    // No pointer/focus reader, timer or preference. Existing native titles remain untouched.
    listen(root, "keydown", (event) => {
      const e = event as KeyboardEvent;
      if (
        disposed ||
        e.key !== "F2" ||
        e.isComposing ||
        e.repeat ||
        e.defaultPrevented ||
        details.surface.open
      )
        return;
      const focused = document.activeElement;
      if (
        !(focused instanceof Element) ||
        !root.contains(focused) ||
        focused.closest(".hover-owned-surface")
      )
        return;
      try {
        if (busy()) return;
        for (const owner of owners) {
          if (!owner.live || !root.contains(owner.root) || !visible(owner.root))
            continue;
          const reason = owner.blocked();
          if (reason && reason.kind !== "draft") return;
        }
        const target = resolve(focused);
        if (!target || !visible(target.element)) return;
        active = target;
        let info: HoverInfo;
        try {
          info = target.entry ? target.entry.read() : fallback(target.element);
        } catch {
          info = {
            kind: "Object",
            name: "未提供",
            identity: "未提供",
            state: "Unavailable",
            data: { reason: "Owner data unavailable" },
          };
        }
        // An owner invalidation during read cannot revive a revoked projection.
        if (!valid()) {
          clear();
          return;
        }
        content.textContent =
          info.kind +
          ": " +
          info.name +
          "\nIdentity: " +
          info.identity +
          "\nState: " +
          info.state +
          "\n\n" +
          (info.data === undefined
            ? "未提供"
            : JSON.stringify(info.data, null, 2));
        if (!valid() || disposed) {
          clear();
          return;
        }
        if (details.open()) e.preventDefault();
      } catch {
        clear();
      } // Failed guards/serialization/presentation remain local to inspection.
    });
    listen(root, "input", () => clear());
    listen(root, "compositionstart", () => clear());
    listen(
      root,
      "pointerdown",
      (e) => {
        if (!(e.target as Element)?.closest(".hover-owned-surface")) clear();
      },
      true,
    );
    listen(window, "blur", () => clear());
    listen(document, "visibilitychange", () => {
      if (document.hidden) clear();
    });
    const observer = new MutationObserver(() => {
      if (active && !valid()) clear();
    });
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["hidden", "style", "class"],
    });
    cleanups.push(() => observer.disconnect());
    return {
      invalidate: clear,
      dispose: () => {
        if (disposed) return;
        disposed = true;
        clear();
        release();
      },
    };
  } catch {
    release();
    return { invalidate: () => {}, dispose: () => {} };
  }
}
