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
    for (const invalidate of invalidations) invalidate(target);
}
export function hoverOwner(
  target: unknown,
  scope: Pick<MountScope, "own">,
  blocked: () => HoverBlock | null = () => null,
): HoverReadView {
  if (!(target instanceof Element)) throw Error("HOVER_SURFACE_PROTOCOL");
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
      if (!(target instanceof Element)) throw Error("HOVER_OWNER_TARGET");
      const element = target;
      if (!owner.live) return;
      invalidateHover(element);
      entries.set(element, { owner, read });
    },
    invalidate: () => invalidateHover(root),
  };
}
export interface HoverPreference {
  load(): { enabled: boolean; issue: string };
  save(enabled: boolean): { enabled: boolean; issue: string };
}
/** One shell presentation with mount-owned feature readers; no model access. */
export function mountHover(
  root: HTMLElement,
  footer: HTMLElement,
  preference: HoverPreference,
  busy: () => boolean,
) {
  const ui = document.createElement("div"),
    settings = document.createElement("div"),
    summary = document.createElement("button"),
    group = document.createElement("fieldset"),
    legend = document.createElement("legend"),
    label = document.createElement("label"),
    checkbox = document.createElement("input"),
    issue = document.createElement("p"),
    hint = document.createElement("span"),
    expand = document.createElement("button"),
    content = document.createElement("pre");
  ui.className = "hover-debug-ui";
  settings.className = "experimental-settings";
  summary.type = "button";
  summary.textContent = "Experimental features";
  legend.textContent = "Hover information";
  checkbox.type = "checkbox";
  checkbox.id = "debug-hover-enabled";
  label.append(
    checkbox,
    " Show object information instead of normal hover hints",
  );
  issue.setAttribute("role", "status");
  issue.className = "experimental-issue";
  group.className = "experimental-options";
  group.tabIndex = -1;
  group.append(legend, label, issue);
  settings.append(summary);
  hint.className = "hover-summary";
  hint.setAttribute("aria-live", "off");
  expand.type = "button";
  expand.textContent = "Read object details";
  expand.disabled = true;
  expand.setAttribute("aria-haspopup", "dialog");
  expand.setAttribute("aria-keyshortcuts", "F2");
  expand.title = "Read the focused object's information with F2";
  content.className = "status-details-text";
  content.tabIndex = 0;
  content.setAttribute("role", "region");
  content.ariaLabel = "Current object data";
  ui.append(settings, hint, expand);
  footer.append(ui);
  const initial = preference.load();
  checkbox.checked = initial.enabled;
  issue.textContent = initial.issue;
  let active: { element: Element; entry: Entry | null } | null = null,
    disposed = false,
    pending: ReturnType<typeof setTimeout> | undefined;
  let pendingTarget: Element | null = null;
  const cleanups: (() => void)[] = [];
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
    visible(active.element) &&
    (!active.entry ||
      (active.entry.owner.live &&
        active.entry.owner.root.contains(active.element)));
  const preferenceView = floatingSurface({
    host: root,
    trigger: summary,
    content: group,
    title: "Hover preferences",
    closeLabel: "Close experimental features",
    kind: "anchored",
    width: 360,
    maxHeight: 340,
    align: "end",
    dismissOutside: false,
    beforeOpen: () => {
      const reason = blocked();
      if (reason) issue.textContent = reason;
      return !reason;
    },
  });
  const detailsView = floatingSurface({
    host: root,
    trigger: expand,
    content,
    title: "Object information",
    closeLabel: "Close object details",
    kind: "modal",
    width: 680,
    maxHeight: 700,
  });
  const dialog = detailsView.surface;
  dialog.classList.add("hover-details", "hover-owned-surface");
  preferenceView.surface.classList.add("hover-owned-surface");
  const finish = (focus: boolean) => detailsView.close(focus);
  const cancelPending = () => {
    clearTimeout(pending);
    pending = undefined;
    pendingTarget = null;
  };
  const clear = () => {
    cancelPending();
    const wasOpen = dialog.open;
    finish(false);
    active = null;
    hint.textContent = "";
    expand.disabled = true;
    content.textContent = "";
    if (wasOpen && ui.isConnected) summary.focus({ preventScroll: true });
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
  const blocked = (reading = false) => {
    if (busy())
      return "Finish the current operation before changing this preference.";
    const reasons = [...owners]
      .filter((o) => o.live && visible(o.root))
      .map((o) => o.blocked())
      .filter((r): r is HoverBlock => !!r);
    return reasons.find((r) => !reading || r.kind !== "draft")?.message ?? "";
  };
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
      // Panel metadata is a fallback; ordinary controls retain their own identity.
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
  const showTarget = (target: Element) => {
    if (
      disposed ||
      !(target instanceof Element) ||
      target.closest(".hover-debug-ui,.hover-owned-surface") ||
      dialog.open
    )
      return;
    if (!checkbox.checked) {
      clear();
      return;
    }
    if (busy()) {
      clear();
      return;
    }
    const resolved = resolve(target);
    if (!resolved || !visible(resolved.element)) {
      clear();
      return;
    }
    if (active?.element === resolved.element && active.entry === resolved.entry)
      return;
    clear();
    let info: HoverInfo;
    try {
      info = resolved.entry
        ? resolved.entry.read()
        : fallback(resolved.element);
    } catch {
      info = {
        kind: "Object",
        name: "未提供",
        identity: "未提供",
        state: "Unavailable",
        data: { reason: "未提供" },
      };
    }
    active = resolved;
    hint.textContent = `${info.kind} · ${info.name} · ${info.state}`;
    expand.disabled = false;
  };
  // Hold a valid target during continuous travel to its explicit reader. Settling
  // over a different object hands off after a short dwell; movement reads no data.
  const queueTarget = (target: Element) => {
    cancelPending();
    if (target.closest(".hover-debug-ui,.hover-owned-surface") || dialog.open)
      return;
    if (!active) {
      showTarget(target);
      return;
    }
    pendingTarget = target;
    pending = setTimeout(() => {
      pendingTarget = null;
      showTarget(target);
    }, 140);
  };
  listen(root, "pointerover", (e) => {
    if ((e as PointerEvent).buttons) {
      clear();
      return;
    }
    if (e.target instanceof Element) queueTarget(e.target);
  });
  listen(root, "pointermove", () => {
    if (pendingTarget) queueTarget(pendingTarget);
  });
  listen(root, "focusin", (e) => {
    if (e.target instanceof Element) {
      cancelPending();
      showTarget(e.target);
    }
  });
  listen(root, "pointerleave", () => {
    if (!dialog.open) clear();
  });
  listen(root, "input", (e) => {
    if (!(e.target as Element)?.closest(".hover-debug-ui,.hover-owned-surface"))
      clear();
  });
  listen(root, "compositionstart", () => clear());
  listen(
    root,
    "pointerdown",
    (e) => {
      if (
        !(e.target as Element)?.closest(".hover-debug-ui,.hover-owned-surface")
      )
        clear();
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
  // Reject before default focus transfer: never blur an unfinished draft or IME to toggle.
  const guardPreference = (event: Event) => {
    const reason = blocked();
    if (reason) {
      event.preventDefault();
      issue.textContent = reason;
      hint.textContent = reason;
    }
  };
  listen(summary, "click", () => preferenceView.toggle());
  listen(settings, "pointerdown", guardPreference, true);
  listen(settings, "mousedown", guardPreference, true);
  listen(settings, "click", guardPreference, true);
  listen(group, "pointerdown", guardPreference, true);
  listen(group, "mousedown", guardPreference, true);
  listen(group, "click", guardPreference, true);
  listen(settings, "keydown", (e) => {
    const k = e as KeyboardEvent;
    if (["Enter", " "].includes(k.key)) guardPreference(e);
  });
  listen(checkbox, "change", () => {
    const reason = blocked();
    if (reason) {
      checkbox.checked = !checkbox.checked;
      issue.textContent = reason;
      return;
    }
    const result = preference.save(checkbox.checked);
    checkbox.checked = result.enabled;
    issue.textContent = result.issue;
    clear();
  });
  listen(settings, "keydown", (e) => {
    if ((e as KeyboardEvent).key === "Escape") {
      e.preventDefault();
      preferenceView.close();
    }
  });
  listen(
    expand,
    "pointerdown",
    (e) => {
      const reason = blocked(true);
      if (reason) {
        e.preventDefault();
        issue.textContent = reason;
      }
    },
    true,
  );
  const openDetails = () => {
    cancelPending();
    if (!valid() || busy()) {
      clear();
      return;
    }
    const reason = blocked(true);
    if (reason) {
      issue.textContent = reason;
      return;
    }
    try {
      const info = active!.entry
        ? active!.entry.read()
        : fallback(active!.element);
      content.textContent = `${info.kind}: ${info.name}\nIdentity: ${info.identity}\nState: ${info.state}\n\n${info.data === undefined ? "未提供" : JSON.stringify(info.data, null, 2)}`;
      preferenceView.close(false);
      detailsView.open();
    } catch {
      clear();
      issue.textContent = "Current object data: 未提供";
    }
  };
  listen(expand, "click", openDetails);
  listen(root, "keydown", (event) => {
    const e = event as KeyboardEvent;
    if (
      checkbox.checked &&
      e.key === "F2" &&
      !e.isComposing &&
      !e.repeat &&
      !e.defaultPrevented &&
      !dialog.open
    ) {
      e.preventDefault();
      const focused = document.activeElement;
      if (
        focused instanceof Element &&
        !focused.closest(".hover-debug-ui,.hover-owned-surface")
      )
        showTarget(focused);
      else return;
      openDetails();
    }
  });
  return {
    invalidate: clear,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      clear();
      for (const cleanup of cleanups.reverse()) cleanup();
      preferenceView.dispose();
      detailsView.dispose();
      ui.remove();
    },
  };
}
