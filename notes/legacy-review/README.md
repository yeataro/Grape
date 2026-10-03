# Legacy 核心實作與修補範圍評估

這份 review 由 Human Owner 授權，從程式碼追查 Legacy 的節點擴充、接線與型別推導、subgraph、GLSL 產碼及相關資料責任，回答哪些問題可局部修補、哪些需要有限調整、哪些構成架構限制，並對照 Grape 已接受架構。

目前狀態：核心路徑的靜態 review 已完成，已能回答本次擴充、圖遍歷、產碼與局部修補問題。未做效能實測、全庫逐行稽核或產品驗收；報告不構成產品規格、Slice 授權或 Fresh Reviewer 的驗收。

## 閱讀基準與範圍

- 日期：2026-10-03。
- Legacy 根目錄：`C:\Users\user\Dropbox\Codex\TD-Grape-workspace\TD-Grape`。
- Legacy Git HEAD：`90a946bdd2acacbf52c93842806edbc23f76b7ba`，README 版本 `0.8.276`。
- Legacy 起始工作區已有 `docs/README.md` 修改、未追蹤的 `.claude/` 及 `docs/discussions/WEB_PWA_HOST_DEPLOYMENT_DRAFT_2026-09-29.md`；不是本次改動。
- 調查後段另觀察到未追蹤的 `src/.vscode/`；本次沒有建立或修改該目錄。來源 HEAD 未變，所引用的核心程式保持該版本的 tracked 內容。
- Grape 已接受架構：IH-005。接受 main 為 `3a59aeeeddb71a06a1172c85016ad06aeb59f34f`；目前 S03 工作版 HEAD 為 `04834e2d0c11656f9d06a3e9ab82350f6edede33`，S03 尚未接受。
- 本次僅寫入 `notes/`。Legacy、`production/`、`handoff/` 及專案狀態紀錄維持唯讀。
- 以靜態程式閱讀為主，不新增或修改 Legacy 測試，不啟動 TD、不套用 Shader、不安裝依賴。既有測試與量測文件只作帶版本與範圍限制的證據，不能冒稱本次執行結果。
- GPU 編譯快取、GPU 渲染效能、安全稽核及全產品 UI 驗收不在本次核心範圍。

## 文件入口

- [Review 結果](FINDINGS.md)：結論、逐項證據、局部修補範圍及與新 Grape 的交叉比較。
- [新增節點的人類維護流程](NODE_AUTHORING.md)：2026-10-04 延伸分析；以原生函式表、Voronoi 與 Replace 追查作者需讀、需改及可沿用的範圍，包含容易漏掉的共用約定與完成檢查。
- [核心追查筆記](working/CORE_READING.md)：呼叫路徑、已確認事實及本次閱讀邊界。
- [來源指紋](working/SOURCE_MANIFEST.json)：引用檔案的 SHA-256 與基準版本，供後續核對；不是驗收證據。
- [既有問題脈絡](../OPEN_QUESTIONS.md)：Q-001 接線預檢與 Q-002 巢狀 subgraph 成本。

結論：Legacy 的接線與產碼有可局部改善的重複工作，不能僅以目前效能疑慮證明全面重寫必要；一般節點獨立擴充與產品／宿主持有權則是不同層次的能力目標。新 Grape 對這些責任的規定更明確，但現行 S03 仍有逐使用位置處理 subgraph 的路徑，尚無新舊實測效能比較。

## 判斷方式

每項結論保留來源檔案、版本與行號，分開標示程式事實、推論、歷史量測與尚未確認的影響。容許「局部修補已足夠」的結論；不以檔案大小、年代、架構外觀或測試通過與否代替分析。Legacy 行為不因被記錄而成為新產品要求。
