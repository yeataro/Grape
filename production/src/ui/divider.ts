/** One owned pointer/keyboard resize gesture for sides, adjacent groups and upper-slot width. */
export function mountDivider(
  element: HTMLElement,
  options: {
    label: string;
    axis: "x" | "y";
    direction?: 1 | -1;
    value(): number;
    limits(): readonly [number, number];
    reset(): number;
    set(value: number): void;
    scale?(): number;
    valid?(): boolean;
  },
) {
  element.tabIndex = 0;
  element.setAttribute("role", "separator");
  element.ariaLabel = options.label;
  element.setAttribute(
    "aria-orientation",
    options.axis === "x" ? "vertical" : "horizontal",
  );
  let live = true,
    pointer: {
      id: number;
      start: number;
      coordinate: number;
      scale: number;
    } | null = null,
    keyboardStart: number | null = null;
  const cleanups: (() => void)[] = [];
  const listen = (target: EventTarget, event: string, fn: EventListener) => {
    target.addEventListener(event, fn);
    cleanups.push(() => target.removeEventListener(event, fn));
  };
  const refresh = () => {
    const [min, max] = options.limits();
    element.setAttribute("aria-valuemin", String(min));
    element.setAttribute("aria-valuemax", String(max));
    element.setAttribute("aria-valuenow", String(options.value()));
  };
  const set = (value: number) => {
    if (!live || options.valid?.() === false) return;
    const [min, max] = options.limits();
    options.set(Math.max(min, Math.min(max, value)));
    refresh();
  };
  const release = () => {
    const p = pointer;
    pointer = null;
    if (p && element.hasPointerCapture(p.id))
      element.releasePointerCapture(p.id);
  };
  const cancel = () => {
    const prior = pointer?.start ?? keyboardStart;
    release();
    keyboardStart = null;
    if (
      prior !== null &&
      prior !== undefined &&
      live &&
      options.valid?.() !== false
    ) {
      options.set(prior);
      refresh();
    }
  };
  listen(element, "pointerdown", (event) => {
    const e = event as PointerEvent;
    if (e.button !== 0 || pointer) return;
    e.preventDefault();
    e.stopPropagation();
    keyboardStart = null;
    pointer = {
      id: e.pointerId,
      start: options.value(),
      coordinate: options.axis === "x" ? e.clientX : e.clientY,
      scale: options.scale?.() || 1,
    };
    element.focus({ preventScroll: true });
    element.setPointerCapture(e.pointerId);
  });
  listen(element, "pointermove", (event) => {
    const e = event as PointerEvent;
    if (!pointer || e.pointerId !== pointer.id) return;
    e.preventDefault();
    e.stopPropagation();
    if (!(e.buttons & 1)) {
      cancel();
      return;
    }
    set(
      pointer.start +
        (((options.axis === "x" ? e.clientX : e.clientY) - pointer.coordinate) /
          pointer.scale) *
          (options.direction ?? 1),
    );
  });
  listen(element, "pointerup", (event) => {
    const e = event as PointerEvent;
    if (pointer?.id !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    release();
  });
  listen(element, "pointercancel", (event) => {
    if (pointer?.id === (event as PointerEvent).pointerId) cancel();
  });
  listen(element, "lostpointercapture", () => {
    if (pointer) cancel();
  });
  listen(window, "blur", cancel);
  listen(element, "keydown", (event) => {
    const e = event as KeyboardEvent;
    if (e.isComposing || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      cancel();
      return;
    }
    const negative = options.axis === "x" ? "ArrowLeft" : "ArrowUp",
      positive = options.axis === "x" ? "ArrowRight" : "ArrowDown";
    if (![negative, positive, "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    e.stopPropagation();
    keyboardStart ??= options.value();
    const [min, max] = options.limits();
    set(
      e.key === "Home"
        ? min
        : e.key === "End"
          ? max
          : options.value() +
            (e.key === positive ? 1 : -1) *
              (options.direction ?? 1) *
              (e.shiftKey ? 32 : 8),
    );
  });
  listen(element, "blur", () => {
    keyboardStart = null;
  });
  listen(element, "dblclick", (event) => {
    event.preventDefault();
    event.stopPropagation();
    release();
    keyboardStart = null;
    set(options.reset());
  });
  refresh();
  return {
    refresh,
    dispose: () => {
      if (!live) return;
      try {
        cancel();
      } finally {
        live = false;
        cleanups.forEach((fn) => fn());
      }
    },
  };
}
