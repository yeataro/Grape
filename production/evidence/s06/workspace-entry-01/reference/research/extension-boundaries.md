# UI 設計交接：擴充契約的邊界

本筆記只讀取 `C:/Users/user/Dropbox/Codex/Grape/` 的現行 Handoff；沒有修改該 repository、執行測試、操作 TD／browser，或重新設計架構。以下引用路徑均相對於該 repository。用途是把已接受的技術邊界轉成 UI 設計工作可使用的輸入，不取代 canonical contracts。

來源基準：root `README.md`、`HANDOFF_ACCEPTANCE.json` 認定 IH-005 已接受；部分封存文件的「待 re-review」屬歷史狀態。`handoff/13_PRODUCTION_CONTRACT_SURFACE.md` §1 區分 exact identity、可一致改名但不可改語義的 public shape，以及 qualification-only 實作。新增技術契約仍標為 **EXPERIMENTAL BUT CURRENTLY ACCEPTED**，不是已完成 production UI 的證據。

## 1. UI 設計必須遵守的邊界

| 設計對象 | 已接受的約束 | 設計交接應補上的具體內容 | 來源 |
|---|---|---|---|
| Workspace、Pane、Tab、Panel | Tab 持有 Panel；Pane 管 Tabs；Layout 管分割／尺寸。物理位置不改 ownership。Panel 不持有第二份 Graph。 | 各區域用途、分頁位置、可見／隱藏狀態、分隔操作與尺寸行為；不要從視覺父子關係推導模型 ownership。 | `handoff/04_EXTENSION_MODEL.md` §4 |
| Canvas／Inspector 路由 | group 0 跟隨 active Canvas；非零組不跨組回退；followCanvas 指定 provider；pin 固定 scope/object。聚焦 Inspector 不偷改 active Canvas。 | active Canvas、pin、group、missing target 的可辨識狀態；切換 Canvas 後 Inspector 應顯示什麼。是否把所有路由控制暴露給使用者仍依 slice 範圍。 | `handoff/04_EXTENSION_MODEL.md` §4 |
| Panel 建立與還原 | factory → restoreViewState → visibility → initial receive；共用 target resolver 處理 root/nested/pin。普通 Panel 不自己發明 routing／restore policy。 | 首次無目標、正在恢復、缺模組／版本、恢復失敗、可 retry 的畫面。 | 同上；`handoff/16_VIEW_MOUNT_CONTRACT.md` §3、§5 |
| Node 與動態接口 | 真實 ports/parameters/edges/diagnostics 由 Node 定義與 Graph 操作共同發布。label 不作 identity；UI 不創假 socket。 | 每個 mode 的真實接口／控件、變更後 loss／invalid 狀態、重排方式。不要把「隱藏欄位」當成接口移除。 | `handoff/04_EXTENSION_MODEL.md` §2–3；`handoff/ui-reference/UI_SPEC.md` §3 |
| Inspector／Widget | spec、value、type、links、projection、write 必須指向同一 scoped target。renderer 不自行遍歷 Graph/resources 補 nested 查詢。 | local／connected／readonly／stale／missing／invalid 狀態；欄位標籤、component 排列、來源名稱與 Disconnect 分開的操作。 | `handoff/04_EXTENSION_MODEL.md` §5；`handoff/ui-reference/UI_SPEC.md` §4 |
| 共用定義的多個 occurrence | occurrence 各有 lease，但仍遵原本共享模型；不能為每個 occurrence 私藏不同 canonical value。 | 顯示目前 scope、共享關係與作用範圍；切換 scope 時不能保留可寫的舊控件。 | `handoff/04_EXTENSION_MODEL.md` §5 |
| Panel 私有呈現狀態 | finite JSON viewState 由 Panel 擁有；Layout 保存 type/version/route/group/state/placement。Graph、History 不屬 Panel。 | 指明 expanded/collapsed、filter、scroll 等哪些是 viewState，哪些只是 mount 暫態；不把 Graph 值塞進 Panel state。 | `handoff/04_EXTENSION_MODEL.md` §4 |
| 錯誤與 placeholder | mount/render failure 是 UI issue，不是 shader error，也不 rollback 已提交模型。缺模組／restore failure 保留可保存資料。 | 不同失敗種類的文案、定位、retry、原資料仍在的提示；retry 只重建呈現，不重播編輯。 | `handoff/16_VIEW_MOUNT_CONTRACT.md` §5 |
| Host／文件狀態 | canonical Graph 與 Host runtime 分離。無 Host 仍能編輯、生成、保存；preview／native control 需有效 provider。 | 明確分開 Graph dirty、generation error、Host unavailable／binding conflict／runtime error，不能以單一「已同步」掩蓋不同狀態。 | root `README.md`；`handoff/ui-reference/UI_SPEC.md` §6、§8 |

## 2. Feature 如何交付畫面及操作

普通 Panel 的正式路徑是：

```text
PresentedPanelType registration
→ PanelWorkspace 建立／還原／路由
→ PanelViewProvider.createView()
→ PanelViewContribution.capture + subscribe + mount
→ 共同 renderer 交付 projection 與 ViewFrame
```

Panel 與 Parameter Widget 保留不同 contribution type，共享 mount resource、更新、失效與清理語義。共同 renderer 不知道具體 feature class、不讀私有 viewState、不用 Panel／Widget 名稱 switch 找 render 方法。新 feature 的視覺設計應能落在該 feature 自己的 contribution，不要求改不相關 core。

引用：`handoff/16_VIEW_MOUNT_CONTRACT.md` §1–3、§7；`handoff/contracts/view-mount.ts`（`PanelViewProvider`、`PanelViewContribution`、`ParameterWidgetViewContribution`）。

**操作入口分兩條，不能混用：**

- 可編輯 Panel：`PanelType.commandIds` 是申請，不是授權。Application 授權後由 `PanelMountContext.commands` 提供 instance-bound 命令；`PanelServices` 仍只供 query/routing。命令經目前 mount 的 `scope.event`、最新 lease、Application validation，才進既有 scoped editing／Graph Operation。Panel 不直接改 Graph，也不自行建立 History。
- Parameter Widget：共同 scoped target 提供一致的 projection、editToken、writable；Widget 經 `WidgetCommands.commit` 或 `WidgetDraft.commit` 提交。commit 再檢查 scope、spec、type、link、舊值 token；視覺上的 writable 不是跳過驗證的授權。

引用：`handoff/17_PANEL_COMMAND_CONTRACT.md`「Ownership and composition」「Callable semantics」；`handoff/04_EXTENSION_MODEL.md` §5；`handoff/contracts/panel-commands.ts`、`handoff/contracts/view-mount.ts`。

設計稿需要標記 **意圖**（選取、移動、改值、斷線、導航等）及 commit/cancel 時機，不應自己定義另一套 command framework。capture/render/receive、一般 async reply、同步事件之後的 Promise continuation 都不能暗中提交編輯。非同步搜尋／載入結果仍要 target lease 與 mount revision 双重 fence。

## 3. 必須畫清楚的生命期差異

| 情境 | 應保留 | 應結束／拒絕 | 設計注意 |
|---|---|---|---|
| Panel move／hide／Tab 變 inactive | 同一 Panel identity、私有 viewState、既有 field draft | 舊 mount、舊事件入口；未完成 Panel pointer gesture 取消 | 不把未提交文字只存 DOM；移動不等於關閉。 |
| remount | 同一 contribution 可重新投影；既有 draft 由原 owner 提供 | 舊 mount ticket／callback 不復活 | 不能以重新 render 自動 commit 或清空文字。 |
| close／retarget 正在做 pointer gesture 的 Panel | 原狀態 | origin guard 拒絕這次 close／retarget | canClose 不能繞過 Application 的 gesture guard。 |
| close 已接受 | 已提交 Graph 修改、借用的 Graph/Context | routing、lease、contribution／Panel 資源清理一次 | 關 Tab 不等於刪 Graph。 |
| schema／type／link 改變 | 目前模型資料、可用的新 projection | 舊 editToken；移除的 target 終止 | 顯示衝突／失效；不能讓 stale field 覆寫新模型。 |
| Widget identity 改變 | canonical value | 舊 view binding／draft 按既有失效契約結束 | 新 Widget 由相同 registry 建立，不能沿用舊 token。 |
| mount／render 失敗 | 模型、可保存的 Panel state | 所有已取得的 mount 資源；進 placeholder | 部分 mount 也要 cleanup；retry 不重播成功操作。 |
| 關 shell／renderer detach | Panel 可能仍存在；已匯出的 viewState | contribution 可被 dispose；pointer gesture 結束 | 只有 Panel.exportViewState 保證可持續還原，任意 view-local 狀態沒有額外保存承諾。 |

引用：`handoff/16_VIEW_MOUNT_CONTRACT.md` §4–6；`handoff/17_PANEL_COMMAND_CONTRACT.md`「Ordering, render and event authority」「Close, move, hide and cleanup」。effectively visible = 未被明示 hidden 且為 Pane active Tab；inactive Tab 不應被寫成永久 hidden。

## 4. 多語言不是待補的架構入口

IH-005 已包含 feature-owned localization seam；「新增 Node／Panel 的語言文字，不改 central UI catalog」已有明確契約。設計工作應使用它，不另建中央翻譯表。

| 誰提供 | 內容／規則 |
|---|---|
| Shell | shared/common strings，自己的 namespace（`grape.shell`）。 |
| Node／Panel／extension | 自己的 label、category、help、actions、diagnostics、search terms，以及 port／parameter 文字；built-in 走同一 contribution。 |
| Module identity | `TextOwnerRef` 帶 moduleId、version、fingerprint、namespace、catalogVersion；namespace 等於 stable moduleId。翻譯不是依顯示名稱查找。 |
| 可翻譯文字 | `TextRef` 含 owner、key、非空 inline fallback、scalar params；fallback 本身可以是定義內的文字，不等於散落於 renderer 的硬編文案。 |
| 菜單選項 | `grape.ui.menu-items.v1` 的 value 與 `TextRef` label 分離；翻譯不得改 option value／枚舉身份。 |
| 語言更新 | feature 自己的 LocaleContribution；replaceLocale 經 revision CAS 原子更新，不要求改中央 feature 清單。 |
| 缺語言／文字 | requested locale → parent locale → exact module default → inline fallback。缺字提示屬 UI issue，不是 Graph error。 |
| 使用者內容 | Node name／label override、notes、path、code 不自動翻譯；原始 Host error 保留，產品解說可翻譯。 |
| Locale state | application/UI preference；不進 canonical Graph、不改 dirty、History、generation、binding。 |

引用：`handoff/15_LOCALIZATION_CONTRACT.md` §1–6；`handoff/contracts/localization.ts`；`handoff/contracts/public-surface.ts` 的 `NodePresentation`／`PanelPresentation`。

設計交接要列出文字用途、owner/key、fallback、參數插值與可用空間；至少畫長英文、無空格 CJK、多行按鈕、截斷後完整名稱取得方式。Inspector 長名稱與按鈕不能重疊，不能用英文寬度當規格（`handoff/ui-reference/UI_SPEC.md` §4）。Panel／Widget 的 `ViewFrame.text` 與 locale invalidation 負責重新投影；切語言不得改寫模型。

## 5. 視覺可決定的部分與不可當作自由設計的部分

**可由設計／實作決定：** renderer technology、DOM 結構、CSS、virtualization，以及未被行為契約固定的字體、spacing、radius、icon、theme token、控件安排。所讀 public contracts 未要求一個特定 ThemeService／token API；不要因為要交付視覺規格而創立新架構角色。普通 feature 可以提供自己的 view，但仍遵共同 projection、mount、命令、localization 邊界。

**不能改掉的語義：** type／port identity、色彩不能作唯一型別資訊、selection/error 可同時存在、widget style 不改 GLSL type、connected input 不能假装可用 local editor 蓋過來源、matrix column-major／vector components 的資料含義。UI_SPEC 已特定保存的 matrix 色（dark `#A1ADB7`、light `#5D6B78`）、struct 低彩度 socket/wire gradient＋plain text、array 沿 element type、Link 作 Edge style 等，不應因「重新設計」自動作廢。

`handoff/ui-reference/UI_SPEC.md` §1 的分類應沿用到新的視覺材料：Structural／Behavioral 必須保留；Visual preference 優先參考；Replaceable 才可在不破壞前兩者下調整。Legacy screenshot 是畫面 evidence，不會把舊 DOM、hosting topology 或 class structure 變成契約。

## 6. 每個畫面／控件應交接的最小欄位

建議研究成果交付下列設計資訊；這只是設計文件欄位，不是新增 production schema：

1. **Reference ID 與範圍**：畫面、Panel、Widget 或 Node 局部；Structural／Behavioral／Visual preference／Replaceable。
2. **Feature owner 與資料來源**：公開 projection 的欄位、target/scope、follow/pin/group 行為；不寫 private lookup。
3. **狀態變體**：正常、selected/focused、connected/local、readonly、missing、invalid、stale draft、loading／placeholder／retry。
4. **動作入口**：Application intent 或 scoped Parameter commit；user event、gesture begin/update/commit/cancel、IME、失敗後保留什麼。
5. **生命期與保存**：move/hide/retarget/close 各自結果；viewState、field draft、canonical value 分清楚。
6. **文案與排版**：feature namespace、TextRef key/fallback/params、長文字／CJK、tooltip／完整名稱取得、各 viewport 尺寸行為。
7. **視覺與幾何**：token、層級、色彩／文字提示、hit area、焦點順序；socket/wire/指標共用座標轉換。
8. **驗收證據**：哪張 screenshot 證明外觀、哪個操作序列證明行為、哪些仍需真 browser/device；禁止以 headless contract test 代替 UI 完成。

## 7. 真正尚缺的資訊與局限

- **真 browser evidence 尚未由這些契約證明**：IME、focus、pointer capture/cancel、a11y、touch/pen、font coverage。設計應留下狀態與測試步驟，不把已驗 lease/mount 等同實機通過。來源：`handoff/16_VIEW_MOUNT_CONTRACT.md` §8；`handoff/ui-reference/UI_SPEC.md` §8–9。
- **Localization 的未承諾範圍**：ICU/plural、數字／日期在地格式、RTL、per-view locale、rich help renderer。若設計確實需要其中某一項，須明示額外需求；不能推論現有 TextRef 已完整提供，也不必為未使用的能力先增架構。來源：`handoff/15_LOCALIZATION_CONTRACT.md` §7。
- **現有文字不足以定完整視覺系統**：精確非 matrix palette、font metrics、spacing、完整控件風格需畫面 evidence／設計整理。這是本次 UI handoff 的工作輸入，不是 ownership blocker。desktop screenshot 也不能證明手機／平板交互。來源：`handoff/ui-reference/UI_SPEC.md` §8–9。
- **歷史文字提醒**：`handoff/ui-reference/UI_SPEC.md` §3／§8 尚有 Mixed Undo「仍有 gate／另定 chronology」措辭。現行 `handoff/13_PRODUCTION_CONTRACT_SURFACE.md` 與 `handoff/04_EXTENSION_MODEL.md` 明示 **DEC-GRAPE-001 延後 coordinated Mixed History**。設計不得據舊措辭提供全域跨 domain Undo 或隱藏 mode；保留 domain-separated authority、runtime/readback 與 lifetime fence。本輪不修改封存來源。

在上述 public seam 內，普通 Panel、Widget、Node 的忠實 UI 設計不需要重新決定 Graph／History ownership、nested target resolution、mount lifecycle 或 localization registry。剩餘設計應聚焦可見狀態、交互細節、視覺 evidence 與各 slice 的實機驗收。
