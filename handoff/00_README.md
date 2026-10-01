# Grape implementation handoff · IH-005

**本修訂提交 READY FOR TARGETED RE-REVIEW；不是最終 acceptance，也不授權開始 S01 或產生 repository bootstrap bundle。** 此包以 AC-002、IR-001、CQ-001、MRDP-001 為固定來源，補入 blind IH-004 review 的局部修正。封存 CQ 仍為 262 Covered、348 Partial、8 Product Decision Required；另以 accepted **DEC-GRAPE-001** 明定 LC-UI-100／G-MIXED-HISTORY 的有效產品範圍為 DEFERRED_BY_PRODUCT_DECISION，不能算 Covered/PASS。

本輪入口：[修訂與直接驗證](audit/IH005_REPAIR.md)。正式保存格式是 [grape.document 2.0](14_DOCUMENT_FORMAT.md)，adaptation／loss／recovery 有唯一 wire schema；[editing Panel example](examples/editable-panel/README.md) 展示 application 授權、Panel instance 綁定的命令入口。Mixed History 已由產品 owner 延後；目前只有 domain-separated Undo，仍保留 LU-UI-009 與全部 CAS/authority/lifetime 保護。

Grape 是可離線編輯 Shader 作品的節點圖產品。使用者建立節點與來源、連線、調參、檢查 GLSL、保存作品，再選擇交付 TouchDesigner 等執行目標。重構的目的是讓這些能力可維護、可擴充，並讓同一 application 支援 Static Web、Node-hosted、Electron。

**Canonical Graph/document、Node、Parameter 的模型值、定義引用、Graph History 及 EditorContext 屬於 Grape。Host 是外部執行／整合目標。** Host 的實際值與原生資源是另一個有權威的領域；Host 回報不會自行覆蓋作品，也不取得作品所有權。Legacy 只提供行為 oracle、相容要求及轉換輸入。

閱讀順序：

1. `01_PRODUCT_MODEL.md` → `02_ARCHITECTURE_SPEC.md` → `03_RESPONSIBILITY_AND_DEPENDENCY.md`：產品、規範與禁止事項。
2. [Production contract surface](13_PRODUCTION_CONTRACT_SURFACE.md) → [Document format](14_DOCUMENT_FORMAT.md) → [Localization](15_LOCALIZATION_CONTRACT.md) → [View / mount](16_VIEW_MOUNT_CONTRACT.md)，再讀 `04_EXTENSION_MODEL.md`、`examples/`：新增 Node／Panel／Widget／GLSL profile／adapter 的方式；沒有任意程式語言後端替換承諾。
3. `05_DATA_AND_LIFECYCLE.md` → `06_HOST_INTEGRATION.md` → `07_DEPLOYMENT_MODEL.md`：狀態、時間與環境邊界。
4. `08_IMPLEMENTATION_PLAN.md` → `09_ACCEPTANCE_AND_CONFORMANCE.md` → `10_KNOWN_GATES.md`：依 vertical slices 執行與驗收。
5. [UI_SPEC](ui-reference/UI_SPEC.md)、[SCREEN_INDEX](ui-reference/SCREEN_INDEX.md)：設計規格與結構示意；另看 [Legacy screenshots](ui-reference/legacy-screenshots/README.md) 的五張原圖，作現況外觀補充參考，不取代新架構或證明互動。
6. 需要相容核對時讀 `11_LEGACY_COMPATIBILITY.md` 與 `compatibility/`；決策原因查 `12_DECISION_LOG.md`。618 capabilities 不是主要工作單。

**第一個 slice 是 S01：最小 Canvas＋Inspector，完成 create document → Graph → Node → Parameter → Edge → GLSL generation → save → reload；完全不要求 Host 存在。** 以新 production 根目錄建立它；不要在 `executable-reference/` 繼續堆產品功能。該目錄是可執行規格，標示 **THIS IS NOT THE PRODUCTION IMPLEMENTATION**。

正式實作目前 **not-started**。本包 [implementation-state.json](implementation-state.json) 是唯讀初始範本；未來唯一 current progress locator 是本包上一層的 `implementation-state.json`，其 `project.root` 指向真正的 production checkout。該外部檔尚未建立時即表示尚未登錄實作，不能從封存 audit 推斷已開始。完整讀寫與驗證規則見 [08 的進度入口](08_IMPLEMENTATION_PLAN.md#implementation-state)。

不能重新設計的邊界：唯一 Graph 真值、受控批次修改、Parameter 無第二份值、Context 與 Graph 分離、精確定義引用、只讀生成、可保存錯誤圖、Host 與作品分域、Node/Panel/UI 正式擴充入口、平台 API 留在 adapter/bootstrap。若必要反例推翻契約，先記錄 Gate/衝突，不能私下繞過。

機器入口：`data/slices.json`、`data/gates.json`、`data/invariants.json`、`data/capability-coverage.json`。檢查命令與實際結果見 `audit/FINAL_HANDOFF_AUDIT.md`；新 Context 自測見 `audit/FRESH_CONTEXT_SIMULATION.md`。本包所有必要輸入都在目錄內，無需聊天記錄或 Legacy source。

上一輪 IH-002 複驗入口：[接受的 findings 與兩項 Architecture Change](audit/REPAIR_CHANGELOG.md) → [當輪修復結果](audit/previous-IH-003/previous-IH-002/FINAL_HANDOFF_AUDIT.md) → [machine-readable repair index](data/repair-index.json)。原 IH-001 自評留在 `audit/previous-IH-001/`，不代表本修訂已通過 independent acceptance。

**來源衝突 HC-001** 已明列並隔離：CQ部分摘要的Generator／保存ownership混寫不能作實作指令。原文仍可追溯，封存来源尚未修訂；不阻止遵守上述明定契約的S01。見`audit/HANDOFF_CONFLICTS.md`。

上一輪 IH-003 入口：[第二份審查逐項判定](SECOND_REVIEW_RECONCILIATION.md) → [IH-003 變更紀錄](audit/SECOND_REVIEW_CHANGES.md) → [新驗證結果](audit/SECOND_REVIEW_VALIDATION.json)。IH-002 的 Panel/scoped target 契約沿用；新增加的正式格式、開放 seam 與翻譯契約僅補剩餘缺口。正式產品用 TypeScript；原型類別、數量界限與實驗格式禁止直接作 production foundation。

歷史 IH-004 修復 FIR-B01 與 FIR-N01：[當輪紀錄](audit/FINAL_REVIEW_REPAIR.md)；其 renderer/mount、PanelWorkspace、scoped target 與 localization ownership 繼續沿用。真 DOM／browser 證據仍屬原 Gate。本輪結果以 IH-005 audit 為準。
