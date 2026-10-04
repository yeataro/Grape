import fs from 'node:fs';
const file='production/src/ui/hover.ts';let s=fs.readFileSync(file,'utf8');s=s.slice(0,s.indexOf('export interface HoverPreference'));s=s.replace('for (const invalidate of invalidations) invalidate(target);','for (const invalidate of invalidations) {\n      try { invalidate(target); } catch { /* Optional inspection cannot interrupt publication or teardown. */ }\n    }');s+=`/** Optional shell inspection: owner data is read only on an explicit F2 request. */
export function mountHover(root: HTMLElement, busy: () => boolean) {
  const content = document.createElement("pre");
  content.className = "status-details-text";
  content.tabIndex = 0;
  content.setAttribute("role", "region");
  content.ariaLabel = "Current object data";
  let active: { element: Element; entry: Entry | null } | null = null,
    disposed = false;
  const cleanups: (() => void)[] = [];
  const listen = (target: EventTarget, type: string, callback: EventListener, capture = false) => {
    target.addEventListener(type, callback, capture);
    cleanups.push(() => target.removeEventListener(type, callback, capture));
  };
  const visible = (element: Element) => element.isConnected &&
    element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden";
  const valid = () => active && root.contains(active.element) && visible(active.element) &&
    (!active.entry || (active.entry.owner.live && active.entry.owner.root.contains(active.element) && entries.get(active.element) === active.entry));
  const details = floatingSurface({ host: root, content, title: "Object information",
    closeLabel: "Close object details", kind: "modal", width: 680, maxHeight: 700,
    closed: () => { active = null; content.textContent = ""; } });
  details.surface.classList.add("hover-details", "hover-owned-surface");
  const clear = () => { details.close(false); active = null; content.textContent = ""; };
  const invalidated = (element: Element) => {
    if (active && (element === active.element || element.contains(active.element))) clear();
  };
  invalidations.add(invalidated);
  cleanups.push(() => invalidations.delete(invalidated));
  const resolve = (target: Element) => {
    let panel: { element: Element; entry: Entry } | null = null;
    for (let e: Element | null = target; e && root.contains(e); e = e.parentElement) {
      const entry = entries.get(e);
      if (!entry || !entry.owner.live || !entry.owner.root.contains(e)) continue;
      if (e === entry.owner.root && e.hasAttribute("data-hover-panel")) panel ??= { element: e, entry };
      else return { element: e, entry };
    }
    const control = target.closest("button,input,select,textarea,summary,a");
    return control && root.contains(control) ? { element: control, entry: null } : panel;
  };
  const fallback = (element: Element): HoverInfo => ({
    kind: "UI control",
    name: element.getAttribute("aria-label") || element.getAttribute("title") || element.textContent?.trim().slice(0, 100) || element.tagName,
    identity: element.id || "未提供",
    state: (element as HTMLButtonElement).disabled ? "UI-only · disabled" : "UI-only · available",
    data: { modelData: "未提供", role: element.getAttribute("role") || element.tagName.toLowerCase() },
  });
  // No pointer/focus reader, timer or preference. Existing native titles remain untouched.
  listen(root, "keydown", (event) => {
    const e = event as KeyboardEvent;
    if (disposed || e.key !== "F2" || e.isComposing || e.repeat || e.defaultPrevented || details.surface.open) return;
    const focused = document.activeElement;
    if (!(focused instanceof Element) || !root.contains(focused) || focused.closest(".hover-owned-surface")) return;
    try {
      if (busy()) return;
      for (const owner of owners) {
        if (!owner.live || !root.contains(owner.root) || !visible(owner.root)) continue;
        const reason = owner.blocked();
        if (reason && reason.kind !== "draft") return;
      }
      const target = resolve(focused);
      if (!target || !visible(target.element)) return;
      active = target;
      let info: HoverInfo;
      try { info = target.entry ? target.entry.read() : fallback(target.element); }
      catch { info = { kind: "Object", name: "未提供", identity: "未提供", state: "Unavailable", data: { reason: "Owner data unavailable" } }; }
      // An owner invalidation during read cannot revive a revoked projection.
      if (!valid()) { clear(); return; }
      content.textContent = info.kind + ": " + info.name + "\\nIdentity: " + info.identity + "\\nState: " + info.state + "\\n\\n" + (info.data === undefined ? "未提供" : JSON.stringify(info.data, null, 2));
      if (details.open()) e.preventDefault();
    } catch { clear(); } // Failed guards/serialization/presentation remain local to inspection.
  });
  listen(root, "input", () => clear());
  listen(root, "compositionstart", () => clear());
  listen(root, "pointerdown", (e) => { if (!(e.target as Element)?.closest(".hover-owned-surface")) clear(); }, true);
  listen(window, "blur", () => clear());
  listen(document, "visibilitychange", () => { if (document.hidden) clear(); });
  const observer = new MutationObserver(() => { if (active && !valid()) clear(); });
  observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "style", "class"] });
  cleanups.push(() => observer.disconnect());
  return { invalidate: clear, dispose: () => {
    if (disposed) return;
    disposed = true;
    clear();
    for (const cleanup of cleanups.reverse()) cleanup();
    details.dispose();
  } };
}
`;fs.writeFileSync(file,s);
const f='production/src/ui/floating.ts';s=fs.readFileSync(f,'utf8').replace('trigger: HTMLElement;','trigger?: HTMLElement;').replace('  const { host, trigger, content } = options;','  const { host, trigger, content } = options;\n  if (!trigger && options.kind !== "modal") throw Error("FLOATING_ANCHOR_REQUIRED");').replace('trigger.setAttribute(', 'trigger?.setAttribute(').replaceAll('trigger.setAttribute(', 'trigger?.setAttribute(').replace('const a = trigger.getBoundingClientRect();','const a = trigger!.getBoundingClientRect();').replace('available(trigger)','available(trigger ?? null)').replace('!visible(trigger)','!visible(trigger ?? host)').replace(': trigger;',': (trigger ?? host);').replace('!trigger.contains(e.target)','!trigger?.contains(e.target)').replace('observer.observe(trigger);','if (trigger) observer.observe(trigger);');fs.writeFileSync(f,s);
const m='production/apps/web/main.ts';s=fs.readFileSync(m,'utf8').replace('import { hoverPreference } from "./experimental-preferences.ts";\r\n','').replace('  app.querySelector("footer")!,\r\n  hoverPreference(() => localStorage),\r\n','');fs.writeFileSync(m,s);
const b='production/apps/web/build-info.ts';s=fs.readFileSync(b,'utf8').replace('底部功能列集中 Project actions、Shader output、Hints 與 Experimental features；','底部功能列集中 Project actions、Shader output 與 Hints；').replace('Read object details 可沿連續滑鼠路徑到達；F2 讀取目前鍵盤焦點，兩者不再混用目標。','物件資訊只由 F2 開啟，直接讀取目前鍵盤焦點；不需要開啟偏好，普通 hover 操作提示保留。').replace('Read object details（鍵盤 F2）可展開全文；','F2 可展開唯讀全文；');fs.writeFileSync(b,s);
const o='production/conformance/ownership.json',j=JSON.parse(fs.readFileSync(o));delete j.files['src/ui/hover.ts'].exports.HoverPreference;delete j.files['apps/web/experimental-preferences.ts'];fs.writeFileSync(o,JSON.stringify(j,null,2)+'\n');
fs.unlinkSync('production/apps/web/experimental-preferences.ts');fs.unlinkSync('production/tests/unit/hover-preferences.test.ts');
for(const [from,to] of [['.verification/s06-dhr-browser.mjs','.verification/s06-f2-browser.mjs'],['.verification/s06-dhr-checks.mjs','.verification/s06-f2-checks.mjs']])fs.writeFileSync(to,fs.readFileSync(from,'utf8').replaceAll('debug-hover-repair-01','f2-only-01').replaceAll('s06-dhr','s06-f2'));
