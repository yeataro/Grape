# 給新 Codex Context 的入口 · IH-005

以本目錄 `00_README.md` 為入口，依閱讀順序載入此 self-contained package。固定來源為 AC-002、IR-001、CQ-001、MRDP-001；本輪 IH-005 的局部修正見 `audit/IH005_REPAIR.md`。canonical 規範在02，責任矩陣在03，擴充入口在04，正式 contract ledger／grape.document 2.0／多語言契約在13／14／15；Panel／Widget view-mount 規範在16。不要重新研究架構或讀 Legacy implementation 來決定結構。

**目前任務是 Targeted Independent Re-review；本檔不授權開始 S01 或產生 repository bootstrap bundle。** 先依修訂紀錄、直接反例測試與 acceptance 規則審查局部修補，回報是否仍有 blocker，不自行宣稱 final acceptance。DEC-GRAPE-001 已接受：coordinated Mixed History 延後，不實作 coordinator／hidden mode；以本包 slices/Gates 的 effective disposition 驗收 domain-separated Undo，保留 LU-UI-009 與 Host fences。

只有使用者另行授權正式實作時，第一個 slice 才是 **S01：Host-free 最小可使用編輯流程**。在獨立 production 根目錄建立新產品，不在 `executable-reference/` 或 `examples/` 持續堆功能。依08／09／data/slices.json完成實際Canvas、Inspector與操作入口，走通建立文件／Graph／固定及動態Node／Parameter／接線／GLSL生成／Undo-Redo／save-reload，以及兩個Context共用模型但各自保持UI狀態。不能只交命令列原型。Generator 擴充範圍是已驗的 GLSL profile／shell／capabilities，不承諾任意程式語言後端替換。

正式實作前先查本包上一層固定位置 `implementation-state.json`（可用 `node tools/check-implementation-state.mjs --current`）。它不存在即尚未登錄，不能把研究 audit 當產品進度；獲正式實作授權後才依08從包內唯讀範本建立外部 current 記錄、指定 production project 與 baseline。不得改寫包內範本或任何封存 qualification 以記錄進度。UI 視覺參考的兩種用途見 `ui-reference/SCREEN_INDEX.md`，其中 Legacy screenshots 是補充現況 evidence。

實作與驗收同時遵守03的禁止事項、21個invariants及對應契約。先核對交接包檢查結果與依賴，只將必要reference契約、行為測試與invariants移植到production公開API，禁止copy qualification core/classes/bounds作production foundation；不要把reference已通過當成production證據。普通Node/Panel/Widget沿正式擴充入口，避免新增不相關core分支。

Gates按分支生效，不要求先解決真TD/GPU或全部Legacy版本相容才做S01。**HC-001原CQ摘要已隔離，sourceSummary只作歷史證據**，不能用它讓Generator改Graph或把保存責任搬回Host。遇到真正改變產品需求或無法滿足既定契約的反例，保留證據並停下受影響分支；不要默改架構、oracle或清掉Gate。

獲實作授權後的完成回報必須分別交付 Product behavior acceptance 與 Architecture conformance 的實際證據、執行環境、未完成分支與剩餘Gates，並更新外部 current 記錄。本修訂的終點只到 READY FOR FRESH RE-REVIEW；不得據此開始 S01、Host 整合或 catalog 移植。
