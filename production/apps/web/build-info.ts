declare const __GRAPE_BUILD__:
  | { buildId: string; implementationI: string }
  | undefined;

/** Build-only presentation metadata; never a document or runtime authority. */
export function mountBuildInfo(brand: HTMLElement): void {
  const identity =
    typeof __GRAPE_BUILD__ === "undefined" ? null : __GRAPE_BUILD__;
  const version = document.createElement("span"),
    open = document.createElement("button"),
    dialog = document.createElement("dialog"),
    title = document.createElement("h2"),
    body = document.createElement("div"),
    close = document.createElement("button");
  version.className = "build-identity";
  version.textContent = identity?.buildId ?? "Development · unversioned";
  version.title = identity
    ? `Implementation ${identity.implementationI}`
    : "No candidate identity injected";
  open.type = "button";
  open.textContent = "本輪更新";
  open.className = "build-updates";
  open.setAttribute("aria-haspopup", "dialog");
  title.textContent = "本輪更新";
  dialog.ariaLabel = "本輪更新";
  dialog.className = "status-details build-details";
  body.className = "build-notes";
  body.tabIndex = 0;
  for (const text of [
    version.textContent,
    identity
      ? `Implementation: ${identity.implementationI}`
      : "Development source: no archived candidate identity declared.",
    "底部 Experimental features 可切換唯讀物件資訊；預設保留一般提示。",
    "Node、Port、Edge、Parameter Widget、Panel 與一般控制項提供各自可讀的資料；未提供資料會明示。",
    "Read object details（鍵盤 F2）可展開全文；Close 或 Escape 關閉。不改文件、選取或編輯歷史。",
    "版號與本輪更新位於既有品牌列。這是候選版本，獨立審查與 Human 接受依各自精確紀錄，不由此畫面推定。",
  ]) {
    const p = document.createElement("p");
    p.textContent = text;
    body.append(p);
  }
  close.type = "button";
  close.textContent = "關閉本輪更新";
  dialog.append(title, body, close);
  brand.append(version, open, dialog);
  open.addEventListener("click", () => {
    dialog.showModal();
    body.focus();
  });
  const finish = () => {
    dialog.close();
    if (open.isConnected) open.focus({ preventScroll: true });
  };
  close.addEventListener("click", finish);
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    finish();
  });
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && !e.isComposing) {
      e.preventDefault();
      (document.activeElement === body ? close : body).focus();
    }
  });
}
