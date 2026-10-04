# UI 設計與已接受架構的相容規則

本文件服務完整產品的 UX/UI 交接，不把 first-slice 示意圖當成最終視覺目標，也不新增架構、API 或產品決策。`C:/Users/user/Dropbox/Codex/Grape/` 本輪嚴格唯讀；以下規則由已讀的 IH-005 與 DEC-GRAPE-001 整理而來。

資料入口：[工作範圍](../README.md)、[LIVE-001 初始觀察](../research/live-observations-001.md)、[LIVE-002 操作觀察](../research/live-observations-002.md)、[擴充邊界](../research/extension-boundaries.md)、[狀態與 Host 邊界](../research/state-and-host-boundaries.md)。下列 `handoff/...` 引用均相對於上述 Grape repository。這些規則是設計審查條件；本文編寫者未操作 browser 或執行 production／reference code，而是引用授權 observer 的實際產品觀察。LIVE-002 的局部操作成功不等於完整 runtime acceptance 通過。

能力、入口配置、操作語義、Widget 與 Style 的分類遵循 [DESIGN_PREMISES.md](DESIGN_PREMISES.md)。Legacy toolbar／Panel 位置是 reference composition，不自動固定；factory-default enabled 的 experimental 能力依 owner 要求必須保留，但目前 checkbox 不足以證明出廠預設。

## 1. 設計證據的標記

| 標記 | 可以據此主張什麼 | 不可以據此主張什麼 |
|---|---|---|
| **Observed** | 本輪實際看到的布局、文字、有效樣式、狀態 | 看到按鈕不等於驗過操作；看到 frame 不等於證明 freshness。 |
| **UI-advertised** | Legacy help／快捷鍵介面宣告的操作 | 不冒充已操作通過。 |
| **Historical** | 舊畫面／行為紀錄是保真與相容參考 | 不覆蓋後來的 Product Decision，不帶入舊 ownership。 |
| **Contract-required** | 接受契約要求設計能表達的狀態／邊界 | 不等於 production UI 已完成。 |
| **Design proposal** | 本次視覺交接提出的安排、命名或 optional profile | 不暗中升格成新 API、canonical schema 或正式產品需求。 |
| **Unverified** | 缺少該裝置／操作／配置的證據 | 不用其他成功案例補成 PASS。 |

## 2. Legacy 可以沿用什麼，必須轉換什麼

| Legacy evidence | 保留的產品意圖 | 新產品必須表達的差異／轉換 | 驗收條件 |
|---|---|---|---|
| **Observed**：header 有 Import、Export、Save TD project、Apply Shader；footer 同時有 Graph saved 與 Uniform live。 | 可保存作品、交付 shader、辨識目前工作與 runtime 狀態。 | Grape 文件保存、Export/download、Host project save、generation、Apply、readback 各有不同結果；Host 不能因保有儲存動作就成為 canonical Graph owner。 | 無 Host 仍可建立／編輯／生成／保存文件。Download 不冒充 durable Save；Apply 成功不清掉更新版本的 document dirty。 |
| **Observed**：URL 開啟後預覽自動連上特定 TD path。 | 低摩擦地找到使用者想操作的對象。 | target identity、capabilities、authority 是獨立 integration 狀態；不能依舊 URL／托管方式推論寫入權限。 | 可辨識「無 target」「可看不可寫」「已斷線／stale」「不同實例重連」。不強迫使用者理解 transport，也不在設計稿指定 transport。 |
| **UI-advertised**：Ctrl+Z／Redo；**Historical** LC-UI-100 包含跨 Graph/native/live chronology。 | 撤回使用者編輯意圖。 | DEC-GRAPE-001 已延後 coordinated Mixed History。Graph、Host/native/live、未提交文字各依明確 domain 操作；沒有全局最近一次 fallback。 | 焦點 domain 無可 Undo 操作時不撤回別的 domain；runtime stream 不生成 Graph History；不設計 hidden mixed mode。 |
| **Observed**：右欄 Parameter 與 OP Parameter 並列；來源與 Uniform live 可見。 | 檢視與編輯需要的值，理解接線來源。 | canonical/default、connection effective input、Host actual/live、native control definition 不可當同一份值。 | 每個欄位能看出編輯哪一類值；unreadable 不顯示成 0，stale 不顯示成 current；linked local value 不假裝覆蓋 source。 |
| **Observed**：預覽圖與已儲存／live footer 狀態共存。 | 看見執行效果。 | 保留 last-good output 時，當前 Graph 可能 invalid、generation failed 或尚未 publication。 | 舊預覽仍在時顯示執行 basis／保留原因，不以「有影像」代表最新編輯成功。 |
| **Observed**：左側 Add Node/Sources、中央 Canvas、右側 Inspector/Preview/Help。 | 熟悉且可讀的工作空間。 | 物理鄰近不決定 ownership；Panel/Tab/Layout 必須使用公開 composition 與 routing。 | 跟隨 Inspector 在切換 Canvas 後指向正確 scope；移動 Tab 不複製 Graph 或失去 Panel private state。 |
| **Observed**：dark/Cool/standard；Appearance 有六個 style 名稱與 Dark/Light。 | 可讀且可調整的外觀。 | 本輪只量到當前配置；其他選項存在不等於視覺／互動已驗。 | default fidelity 以實際證據對照；其他 profile 明示 proposal／unverified，不冒稱 Legacy exact match。 |

依據：`handoff/05_DATA_AND_LIFECYCLE.md`、`handoff/06_HOST_INTEGRATION.md`、`handoff/13_PRODUCTION_CONTRACT_SURFACE.md`；DEC-GRAPE-001；本輪 observations。此表不決定新按鈕的正式命名。

## 3. 設計必須能同時呈現的狀態

### 文件、執行與 History

| 情境 | 畫面要讓使用者理解 | 禁止的簡化 |
|---|---|---|
| Save snapshot A 期間又改成 B，A 保存完成 | A 成功，B 仍未保存 | 只因 await 結束就把目前 B 標 clean。 |
| 當前 Graph 有 Error，Host 仍有 last-good output | 文件可保存／修復；目前 generation blocked；預覽仍是先前結果 | 關閉本機編輯、靜默刪除錯誤 Node、把舊輸出當新成功。 |
| Apply pending／retained／rejected／superseded／indeterminate | 各結果及相關操作可否繼續 | 一律變成成功或 timeout=未執行；retry 重複 Pulse／native operation。 |
| Graph Undo 成功，但向 Host 的 conditional write conflict | canonical value 已還原；Host actual 未被覆蓋；Binding 顯示 divergence | rollback Graph Undo、強制覆蓋 Host、把 conflict 當第二份 Graph 真值。 |
| Host 動畫、CHOP、script 或外部控制高頻更新 | runtime/readback 更新，顯示 driver／writability／staleness | 逐筆加入 Graph Undo，或清掉 Graph Redo。 |
| 焦點在未提交文字／Graph 編輯／Host live control | 同一快捷鍵依當前 editing domain 處理 | 無操作可撤回時自動跨 domain 找最近操作。 |
| 舊 document/binding reply 晚到 | 新畫面／dirty／History 不受影響 | 因名稱或 path 相同而套入新 lifetime。 |

對應責任：Application／Graph History、Binding／Host authority、Storage、Generator 各守既有邊界；UI 只投影，不自行做跨領域 coordinator。詳見 `handoff/06_HOST_INTEGRATION.md`、`handoff/09_ACCEPTANCE_AND_CONFORMANCE.md` 的 AT-DEC-GRAPE-001、LU-UI-009 相關保護。

### Panel、Inspector、欄位

| 狀態／動作 | 設計規則 | Feature／共用責任 |
|---|---|---|
| Empty selection、readonly、missing module、stale occurrence | 四者有不同內容與可用動作；缺模組不發明 ports。 | Panel 消費共用 resolved/missing target；module 提供 feature projection。 |
| 同一 Graph 的 Canvas A/B | model 更新共用；selection、camera、navigation 個別。 | EditorContext 持 view/editor state；Graph 持模型；跟隨路由由 workspace 提供。 |
| root／nested Inspector | 同一 scoped target 供 spec/value/link/type/projection/write。 | renderer 不自行走 Graph/resources；feature 不按 label 猜 target。 |
| Field draft／IME／parse error | 保留可修正文字；commit 前不寫 canonical model；外部刷新不能無條件蓋掉 focused draft。 | Widget draft 與 scoped commit；不得只把草稿存於 DOM。 |
| Dynamic mode 接受並失去接線 | 明示 detached+loss+Warning 或 declared preserved-invalid+Error；切回不保證自動接回。 | Node 定義及 Graph reconcile 決定結果，UI 不以隱藏控制代替 schema 變更。 |
| move／hide／inactive Tab／remount | 保留 Panel identity、private viewState、field draft；舊 mount 失效，未完成 pointer gesture 取消。 | Feature 提供 viewState；shell mount cleanup；Application 取消自己的 Operation。 |
| close／retarget 正在操作的 Panel | 依 guard 拒絕，不做半套 close；accepted close 不等於 unload Graph。 | Application gesture origin + Panel canClose；workspace 管 lifetime。 |
| mount/render failure | placeholder／issue／retry 保留可保存資料；不等於 Graph error。 | shell 捕捉／清理 mount 資源；feature 可重建投影；retry 不重播編輯。 |

依據：`handoff/04_EXTENSION_MODEL.md` §4–5、`handoff/16_VIEW_MOUNT_CONTRACT.md` §3–6、`handoff/17_PANEL_COMMAND_CONTRACT.md`。Panel 可編輯能力來自 instance-bound `PanelMountContext.commands`，不是 PanelServices 私有 mutation；Widget 維持 scoped Parameter write 路徑。兩者都不能在 render／一般 async reply 中暗自提交。

## 4. Style／color profile 的可變範圍

本節容許整理或比較外觀，不新增 profile API。若設計稿使用「Current」「Alternative」「High contrast」等 profile 名稱，它們一律是 **Design proposal**，不是目前已接受的正式產品名稱／功能。

| 可以作為視覺 profile 的內容 | 不可被 profile 改變的內容 | 檢查方式 |
|---|---|---|
| surface、text、border、shadow、radius、spacing、選取／焦點提示、control 密度 | Graph／EditorContext／Panel ownership、dirty／History、真實 Node/Port identity | 切外觀後同一 document、selection、port key、data type、bindings 不變；純外觀切換不生成 GLSL 或 Graph edit。 |
| 同一 role 的配色／對比方案、theme 對照 | 把 vec4、accent、compute-family title 合成同一語義；只靠色辨型別或錯誤 | role 分別命名及驗收；保留文字／圖示／形狀提示。本輪三種紫色值各自有 evidence。 |
| Node 類別視覺提示與控件排法 | 以 title 顏色决定 NodeType、port schema 或合法連接 | 視覺分類不參與派發與驗證。 |
| Parameter 的可用呈現標籤／視覺語彙（例如 spec 允許的 RGB/XYZ） | GLSL data type、分量數量、canonical value shape、link state | 視覺呈現仍受既有 spec/projection 能力限制，不能由 skin 把 bool 變 vec4 或加假 port。Widget 選擇屬互動呈現，不只是視覺 profile。 |
| 長字串換行、合理截斷、tooltip／完整名稱入口 | 靠改 stable key、刪翻譯文字或縮成不可讀來維持英文寬度 | 長英文／CJK、不同 locale 與縮窄欄位均保留可辨識名稱與可操作按鈕。 |

**保真預設仍有明確限制：**已接受的 matrix 冷石板灰（dark `#A1ADB7`／light `#5D6B78`）、struct 低彩度 socket/wire gradient 且文字 plain、array 依 element type，以及 Wire／Link 的視覺語義，不應被一次「統一配色」靜默改掉。未裁定的 alternative palette 可以獨立展示，但與這些行為色值不同之處必須列為 proposal，不能宣稱已符合 frozen acceptance。

LIVE-001 已量得：accent `#B39CFB`、vec4 `#C5B2E2`、compute/math title `#43345C` 是三種不同 role。該初始 session 的 selection／struct／constant 原本僅有 token 證據；**LIVE-002 O02-07 已補上 rendered sample**：TDMatrix[4] socket 的低彩度四段 gradient／plain type text、Array constant title `#384d73`、selected border `#70dc69`，並觀察既有 struct-wire gradient stops。這些不再是「尚未看過」；仍不能泛推全部 aggregate、selected+error、light theme 或其他狀態。保留 [LIVE-001 partial tokens](../research/current-dark-cool.tokens.partial.json) 的初始 provenance，現況以 [O02-07](../research/live-observations-002.md#o02-07--typed-aggregate-display) 的補充證據一起讀。

本文的 measured/default fidelity 指設計比對基準，**不宣稱目前 dark/Cool、偏好或實驗勾選狀態是 factory default**。Numeric Field／Slider／Value Ladder 是可選的互動實現；必要的是該能力的精度、可控性與已確定的 commit/cancel/feedback 等語義。min/max／clamp 的編輯規則亦不屬皮膚，更不隱含 GLSL 運算；詳見 DESIGN_PREMISES §4。

UI/application 的外觀偏好與 Graph authored appearance 必須分開：主題／欄寬／Panel 配置是 view/UI 層；Node position、frame、notes 是文件內容。不要因為都叫「layout」而混合保存或 Undo。確切新增 profile 的保存格式沒有在此指定。

## 5. 文案與多語言的交接要求

- feature 自己持有 label/category/help/actions/diagnostics；Shell 只管理 shared/common。built-in 與 extension 走同一 localization contribution，不要求新增 Panel 時修改中央 catalog。
- 設計稿為每個系統文字標出用途、feature owner、TextRef key/fallback 與插值；使用者 name/notes/code、Host 原始輸出不是可自動翻譯的 catalog。
- 缺 locale 的既定 fallback 是 requested → parent → exact module default → inline fallback。missing locale 是 UI issue，不得把 Graph 標 invalid。
- locale 變更只更新 UI preference／projection；不可更動 canonical Graph、dirty、History、generation、binding。菜單顯示翻譯不改 semantic value。
- 說明文字、按鈕與錯誤狀態的長度必須納入畫面設計；rich help、ICU/plural、RTL 等超過既有契約的能力，若真的採用須單列需求，不假定已內建。

依據：`handoff/15_LOCALIZATION_CONTRACT.md` §1–7；`handoff/contracts/localization.ts`。LIVE-001 看見繁中、英文、日文、法文、韓文選單，但當時未切換；**LIVE-002 O02-05 已直接操作 English → Japanese → English**，觀察 Shell／Inspector／Help 翻譯、技術名稱保留、日本語 Customize Parameters 兩行按鈕與長 label 省略。這是特定畫面可讀性／切換證據，不代表五種 catalog 完整或 CJK font coverage；footer 的「Graph/GLSL 未變」也沒有獨立 serialized diff 證明。

## 6. 設計驗收清單

本清單檢查 handoff 的設計是否可落在現有契約；通過設計審查不代表 production/runtime acceptance 通過。

1. 每個畫面至少標出資料 owner、target/scope、可編輯意圖、readonly／missing／stale／failure 狀態及證據等級。
2. 可新增普通 Panel／Widget，只需 feature contribution 與一般 registration；圖稿不依赖 concrete class switch、private workspace lookup 或額外 Graph copy。
3. 兩 Canvas、following／pinned Inspector、切換 Tab、move/hide、close guard、draft conflict 都有可檢查的狀態序列。
4. Save／Export／generation／Apply／runtime preview 的成功與失敗可區分；Host-free authoring 是完整可用路徑。
5. Graph Undo 完成而 Host propagation conflict 的画面可表達 divergence；沒有全域 Mixed History 承諾。
6. Node／socket／wire、selection/error、長文字、控件尺寸使用 logical／CSS 尺度與 zoom 區別；不把 screenshot pixel 直接當 graph-space size。
7. 每個 style/profile proposal 列出與 measured default 的差異；不改 data type、port、editing authority 或保存語义。
8. 不同 deployment profile 的 UI 依可用 service/target/device 顯示能力；Static/Node/Electron 名稱不是讀寫／touch/native 能力判斷條件。
9. 真 DOM、pointer/IME/focus/a11y、responsive/touch、TD/GPU 與 late runtime reply 的驗證仍歸現有 Gate；mockup 不會把它們改成 PASS。

**目前 evidence 邊界：**LIVE-002 已補 scalar Enter commit、連接、受保護端點刪除、Voronoi 動態接口及一次 Undo 恢復接線、floating/docked Inspector、數值 Escape 取消、來源建立失敗、Japanese 切換、aggregate／selected／constant 外觀與 GLSL dialog；也有 760×900 viewport probe。不要再將這些局部案例全部標成「未觀察」。但完整 drag／ladder／IME、nested/shared target、所有失敗與 lifetime、layout roundtrip、其他 theme／語言、真 touch/pen／跨 browser、GPU 像素正確性仍未由這些案例證明。O02-10 Preview 消失與 footer 是已觀察 after-state，觸發原因／時機未驗。這些界線依 [LIVE-002](../research/live-observations-002.md) 各 case 保留，不是重開 ownership 或擴充架構的理由。
