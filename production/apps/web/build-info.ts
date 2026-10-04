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
    "底部功能列貼底佔满可用寬度；輸出預設收合，GLSL、診斷與 Locate 仍可取得。",
    "新版 Image Output 未接線時輸出零 RGBA；舊文件保留原版本，可由 Project actions 明確 Upgrade Image Output。",
    "Output 拉線到空白後，單點相容節點原地新增並接線；已接線 Input 拉到空白則斷線，均可一次 Undo。",
    "接線預設允許 Replace；圓點保留型別色，柔和紫色提示與平滑曲線不改節點排版。",
    "一般點擊 Node 會交付焦點；F2 在開窗前讀取當下焦點物件一次，不依 incidental hover 改換對象。",
    "物件資訊只由 F2 開啟，直接讀取目前鍵盤焦點；不需要開啟偏好，普通 hover 操作提示保留。",
    "接線只點 socket 圓；名稱與型別分開。實心提示保留各型別顏色，選取與提示不改節點排版。",
    "Node、Port、Edge、Parameter Widget、Panel 與一般控制項提供各自可讀的資料；未提供資料會明示。",
    "F2 可展開唯讀全文；Close 或 Escape 關閉。不改文件、選取或編輯歷史。",
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
