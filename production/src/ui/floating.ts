let surfaceOrder = 70;
/** DOM presentation only. Callers retain content, data and command ownership. */
export interface FloatingOptions {
  host: HTMLElement;
  trigger?: HTMLElement;
  content: HTMLElement;
  title: string;
  closeLabel: string;
  kind: "anchored" | "modal" | "menu" | "upper-slot";
  width: number;
  maxHeight: number;
  align?: "start" | "end";
  dismissOutside?: boolean;
  beforeOpen?: () => boolean;
  closed?: () => void;
  fallbackFocus?: () => HTMLElement | null;
}
export function floatingSurface(options: FloatingOptions) {
  const { host, trigger, content } = options;
  if (!trigger && options.kind !== "modal" && options.kind !== "upper-slot")
    throw Error("FLOATING_ANCHOR_REQUIRED");
  const surface = document.createElement("dialog"),
    heading = document.createElement("h2"),
    closeButton = document.createElement("button");
  surface.className = "floating-surface";
  surface.dataset.kind = options.kind;
  surface.ariaLabel = options.title;
  if (options.kind === "menu") surface.setAttribute("role", "menu");
  heading.textContent = options.title;
  closeButton.type = "button";
  closeButton.textContent = options.closeLabel;
  content.classList.add("floating-content");
  surface.append(heading, content, closeButton);
  host.append(surface);
  trigger?.setAttribute(
    "aria-haspopup",
    options.kind === "menu" ? "menu" : "dialog",
  );
  trigger?.setAttribute("aria-expanded", "false");
  let disposed = false,
    opener: HTMLElement | SVGElement | null = null;
  const cleanups: (() => void)[] = [];
  const listen = (
    target: EventTarget,
    name: string,
    fn: EventListener,
    capture = false,
  ) => {
    target.addEventListener(name, fn, capture);
    cleanups.push(() => target.removeEventListener(name, fn, capture));
  };
  const visible = (e: Element) =>
    e.isConnected && e.getClientRects().length > 0;
  const position = () => {
    if (!surface.open) return;
    const margin = options.kind === "upper-slot" ? 12 : 8,
      width = Math.min(options.width, innerWidth - margin * 2),
      height = Math.min(options.maxHeight, innerHeight - margin * 2);
    surface.style.width = width + "px";
    surface.style.maxHeight = height + "px";
    if (options.kind === "modal") return;
    if (options.kind === "upper-slot") {
      surface.style.left = Math.max(margin, innerWidth - width - margin) + "px";
      surface.style.top = margin + "px";
      return;
    }
    const a = trigger!.getBoundingClientRect();
    const left = options.align === "end" ? a.right - width : a.left;
    surface.style.left =
      Math.max(margin, Math.min(left, innerWidth - width - margin)) + "px";
    const h = surface.getBoundingClientRect().height;
    surface.style.top =
      Math.max(margin, Math.min(a.top - h - margin, innerHeight - h - margin)) +
      "px";
  };
  const close = (focus = true) => {
    if (!surface.open) return;
    surface.close();
    trigger?.setAttribute("aria-expanded", "false");
    options.closed?.();
    const available = (
      e: HTMLElement | SVGElement | null,
    ): e is HTMLElement | SVGElement =>
      !!e && visible(e) && !(e as HTMLButtonElement).disabled;
    const target = available(opener)
      ? opener
      : available(trigger ?? null)
        ? trigger!
        : (options.fallbackFocus?.() ?? host);
    if (focus && available(target)) target.focus({ preventScroll: true });
  };
  const open = (focusTarget: HTMLElement | null = content) => {
    if (
      disposed ||
      !visible(trigger ?? host) ||
      options.beforeOpen?.() === false
    )
      return false;
    if (surface.open) return true;
    opener =
      document.activeElement instanceof HTMLElement ||
      document.activeElement instanceof SVGElement
        ? document.activeElement
        : (trigger ?? host);
    surface.style.zIndex = String(++surfaceOrder);
    if (options.kind === "modal") surface.showModal();
    else surface.show();
    trigger?.setAttribute("aria-expanded", "true");
    position();
    (options.kind === "menu"
      ? content.querySelector<HTMLElement>("[role^=menuitem]:not(:disabled)")
      : focusTarget
    )?.focus({ preventScroll: true });
    return true;
  };
  listen(closeButton, "click", () => close());
  listen(surface, "cancel", (event) => {
    event.preventDefault();
    close();
  });
  listen(surface, "keydown", (event) => {
    const e = event as KeyboardEvent;
    if (e.key === "Escape" && !e.isComposing) {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
    if (!e.isComposing && options.kind === "menu") {
      const items = [
        ...content.querySelectorAll<HTMLElement>(
          "[role^=menuitem]:not(:disabled)",
        ),
      ].filter(visible);
      if (
        items.length &&
        ["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)
      ) {
        e.preventDefault();
        const i = items.indexOf(document.activeElement as HTMLElement);
        const next =
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? items.length - 1
              : (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) %
                items.length;
        items[next]!.focus();
      }
      if (e.key === "Tab") close(false);
    }
    if (e.key === "Tab" && !e.isComposing && options.kind === "modal") {
      const items = [
        ...surface.querySelectorAll<HTMLElement>(
          "button,input,select,textarea,a[href],[tabindex]",
        ),
      ].filter(
        (el) =>
          el.tabIndex >= 0 &&
          visible(el) &&
          !(el as HTMLButtonElement).disabled,
      );
      const first = items[0],
        last = items.at(-1);
      if (
        first &&
        last &&
        (e.shiftKey
          ? document.activeElement === first
          : document.activeElement === last)
      ) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    }
  });
  // A nonmodal disclosure never traps focus. Outside interaction closes only itself.
  if (options.kind !== "modal" && options.dismissOutside !== false)
    listen(
      document,
      "pointerdown",
      (e) => {
        if (document.querySelector("dialog:modal")) return;
        if (
          surface.open &&
          e.target instanceof Node &&
          !surface.contains(e.target) &&
          !trigger?.contains(e.target)
        )
          close(false);
      },
      true,
    );
  listen(window, "resize", position);
  listen(document, "scroll", position, true);
  let observer: ResizeObserver | undefined;
  try {
    observer = new ResizeObserver(position);
    observer.observe(content);
    if (trigger) observer.observe(trigger);
  } catch (error) {
    observer?.disconnect();
    cleanups.forEach((cleanup) => cleanup());
    surface.remove();
    throw error;
  }
  return {
    surface,
    closeButton,
    open,
    close,
    position,
    toggle: () => (surface.open ? close() : open()),
    dispose: () => {
      if (disposed) return;
      disposed = true;
      close(false);
      observer?.disconnect();
      cleanups.forEach((f) => f());
      surface.remove();
    },
  };
}
