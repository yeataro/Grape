# Legacy 核心追查筆記

閱讀版本與權限見[總覽](../README.md)。這是調查筆記；最終分析見 [Review 結果](../FINDINGS.md)，兩者都不能直接成為派工。

## 已確認的結構

- Legacy 有 Python 核心 `src/core/`、JSON 節點目錄 `src/library/node_catalog.json`、瀏覽器 JS 編輯模型及 TD runtime，不能概括為只有 DOM 和產碼。
- 瀏覽器 `graph` 本身是資料；DOM 提供候選接孔與呈現。`src/editor/functions_model.js:96–160` 以 `graph.functions` 保存共用定義，由 call Node 的 `params.functionId` 引用，包含 library snapshot、localize、independent copy。儲存沒有按每次引用攤平。
- 起始 HEAD 的最新 commit 已修補單輸入 Multiply／Outer Product 的預設，不能把先前回報當作仍未修的現行缺陷。`src/editor/graph_ui.js:828–847,884–901` 對新單一 scalar/vector 輸入偏好同型別兩運算元，並刻意保留未被改動的有效舊簽名。後續核對確認：Python 驗證已保存的具體數值簽名，不重跑此 Auto 選型政策。不是前後端兩套相同演算法。

## 接線成本的實際分層

`src/editor/graph_ui.js:1515–1565` 的 all／hover／viewport 是候選發現與觸發頻率策略。三者仍經 `connectionProblem`；hover 用手勢內的 DOM 接孔身分與 `editVersion` 重用結果。不是每次 pointermove 一定全圖重驗，也不是切成 hover 就改變正式合法性規則。

一般接孔 `connectionProblem:1486–1496` 先檢查循環，再呼叫 `planWireTypes:1018–1049`。planner 複製当前 network 節點與線，建立目前 Port map、候選及基準各一份 `planAutoGraph`，比較新舊錯誤，條件成立時再做常量檢查。循環搜尋在外層與 planner 各有一次，且每次出隊會掃描 edge array。

`connectPorts:1498–1505` 再呼叫 connectionProblem，接著在 `change` 內由 `commitPlannedWire:1051` 再規劃一次。`src/editor/app.js:333–343` 的 `change` 另有整份 graph 複製、localize、Auto reconciliation、常量檢查、History、dirty 與保存排程。必須區分正式提交的重驗與同次同步操作內可重用的分析；不能把預檢當成永久免驗權杖。

## Auto 並非對每次 subgraph 引用展開

`autoUnits:791` 列舉 Stage 與每份 function definition；`autoDefinition:786–789` 從 subgraph 明示的 inputs／outputs 取得外露型別。`planAutoGraph:819–909` 用 map/set 記錄單份 network 內已處理節點、輸入鄰接及循環路徑，以來源先於接收端處理。它會處理整個傳入 network，但不是沒有 memo 的樸素遞迴，也不會在每個 call 重新推導整份內部型別。

`resolveAutoEdit:980–1012` 一旦 autoTopology 改變，會對所有 Stage／definition 單位規劃，不只本次變動單位。invalid edge detach 可觸發多輪重新規劃。是否可縮小範圍，需要保留子圖接口、跨 Stage 邊界、來源與型別依賴。

## 常量檢查確有逐使用位置深入子圖

`constantRequirementIssues:720–779` 在圖有 requireConstant 或 Array Create 時啟用，從所有 Stage 遍歷每個節點。call 以實際輸入常量資格遞迴進入 function graph，每次建立新的 values map。seenFunctions 只避免最後額外驗證已遇到定義，沒有避免同一定義被多個 call 重複分析。此處不複製一份攤平圖，但分析工作按使用位置展開。

常量有 runtime／普通常量／特化常量三種狀態，並有 Replace 分量覆寫等規則。因此「外露 Port 型別固定」不能直接刪除這條分析，也不能把它誤稱為 Auto 輸出型別推導。若整圖沒有 requireConstant／Array Create，該函式早退。

## 新增節點候選已有局部試算

`creatorValidationContext:1052–1064` 對圖、所在位置與目錄等建立快取身分，保存基準 plan。`creatorTypePlan:1066–1147` 已把候選試算縮小至新節點與必要來源邊界，reverse 候選按來源型別重用；完整驗證留到選取提交。`commitCreatorMatch:2349–2356` 沿用 change 與完整規劃；本次閱讀了這些入口，沒有執行 stale-candidate 或 browser 測試。這是已存在的 Legacy 能力，不能把它列成尚需全面重構才能獲得的能力。

## Python 驗證、展開與產碼

`src/core/sgrape_core.py:2257–2316` 的後端型別推導處理 Router／Preview／Array／Struct 等來源相關接口，沒有重新執行數值 Auto 的簽名排序。`_functions:2088–2121` 驗證共用定義，引用循環檢查有 active／done set。

`_compile_graph:2337–2358` 對每份定義、每個宣告 stage 建立 probe 並 `_expand → _compile_flat`；之後才對實際圖做同一組處理。`_expand:2124–2233` 每個 call 會產生邊界 relay、複製內部節點及重新配置路徑身分，先展開再剪枝。因此重複工作包含每份定義的巢狀 probe，以及主圖各次使用。

`_compile_flat:1277–1351` 先做全圖循環／常量等檢查，再從輸出、Preview 及 effect 根收集使用節點。`1385–1738` 以 symbols／expressions 重用每個輸出，常見節點用暫存變數承接，轉換可以在輸入表達式內完成；不是每個 fan-out 重算整鏈。array extent 的 expression identity 不是一般 CSE。

GLSL Code 在 `1636–1655` 產生 helper，Voronoi 在 `1520–1536` 共用部分 helper；一般 subgraph 並未因此函式化。各路徑可能需要不同常量資格、effect、資源、extent 及來源定位，不能一律以 definition ID 共用最後 GLSL。

## 擴充能力的邊界

`EMITTER_IDS:108–117` 與 `validate_catalog:284–326` 限制 catalog 可宣告的種類；`definition_ports:604–646`、參數推導及主 emission 含特殊種類分支。前端的 `resolvedNodePorts:564–596` 與 Inspector 也有特殊接口／UI 處理。

反例是 `sgrape_legacy_nodes.py:17–38,304–342`：符合普通原生呼叫模式的節點可在 CALLS 表描述變體、預設、out 參數等，由通用 emitter 處理，不是所有新節點都需要獨立核心分支。Subgraph／GLSL Code 亦已提供使用者組合能力。但這些不等於一般 NodeModule 的獨立 ports／validate／emit／版本契約。

## GraphChecks、套用與宿主責任

`src/core/sgrape_document.py:356–454` 有 8 份／序列化鍵與結果合計 4 MiB 的純圖結果重用。`session` 控制一次同步操作的依賴核對，不會結束即清空結果。`src/td/runtime/sgrape_runtime.py:443–458` 持有實例，compiler／catalog 改變即失效。命中仍序列化 key 並 deep copy 結果；Host guards 在快取之外。

`runtime:1760–1840` 先查 revision、來源、升級與現有狀態，需要時在 candidate 驗證後才套用。`app.js:455–509` 處理在途圖版本、草稿與 native History token。`core.py:1744–1792` 的 shell、built-ins 與 bindings 仍具 TD 語意，不能因 Python 可離線執行便稱為宿主獨立。

## 已讀的輔助證據與限制

- `tests/unit/test_auto_operand_defaults.js`：新單輸入政策、既有簽名保留、換線、nested 與 History 案例；只閱讀，沒有執行。
- `tests/unit/test_graph_checks.py` 的案例範圍與 GraphChecks 實作對照：幾何排除、compiler／catalog 失效、來源文本變動、有界保存；沒有宣稱本次測試通過。
- `docs/development/TESTING.md:146–150`：101 節點 creator 歷史量測；未取得私人 raw profiler，不能代替 Owner lag trace。
- `docs/discussions/GRAPH_SYNC_SAVE_PLAN.md`：只閱讀狀態回填與相關原始問題；2026-09-19 舊現況敘述部分已被修補，最終以目前原始碼核對。
- `docs/development/STATUS.md:3–13,727–737`：目前 Auto／候選／History 修補及較早 GraphChecks／布局改善的交付記錄；不是本次部署查驗。
- 新 Grape 對照已確認：`handoff/04_EXTENSION_MODEL.md:24–54`、`02_ARCHITECTURE_SPEC.md:65–81`；S03 `compiler.ts:196–279`、`sdk/networks.ts:145–165`、`application/editor.ts:502–511`。接受規格與工作版觀察在最終報告分列。

未讀完所有 Inspector／runtime／History 特殊分支，未審完整 binary、native 操作或每種數學公式；這些不是回答本次核心問題的前提。實際耗時、原始 lag trace、UI 手感及新產品可用後的同負載比較仍屬證據缺口。
