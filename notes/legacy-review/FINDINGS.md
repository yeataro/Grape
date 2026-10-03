# Legacy 核心實作 review：哪些可修補，哪些是能力邊界

2026-10-03。閱讀基準為 TD-Grape `90a946b`／0.8.276，以及 Grape IH-005 與尚未接受的 S03 工作版 `04834e2`。完整版本、權限及範圍見[總覽](README.md)。

這是 Human Owner 授權的程式分析，不是 Fresh Reviewer 驗收、產品決策或實作派工。以下「可改善」表示程式結構支持這項判斷，不表示已量測收益或證明任何特定改法安全。

## 結論

**Legacy 有可以繼續修補的實質基礎；目前的效能疑慮不足以證明必須全面重寫。但若目標是新增節點能獨立交付、產品資料由產品持有、宿主只是整合對象，僅修補效能也達不到這些目標。**

Legacy 已有資料模型、共用 subgraph 定義、型別契約、局部候選試算、使用節點剪枝、單次走訪重用、產碼結果快取及提交保護。它的問題不是「只有 DOM」或「每一層完全沒有重用」，而是部分路徑仍把同一份分析做多次，且一般節點擴充仍受核心的固定種類與特殊分支限制。

最值得注意的兩個成本來源分屬不同階段：

1. **接線：**候選判定、實際放線與提交後重算之間重複規劃；部分檢查範圍超過本次變動的 network。常量資格檢查另有逐使用位置深入 subgraph 的成本。
2. **產碼：**每份 subgraph 定義先建立獨立驗證圖並展開，再展開實際主圖；同一份巢狀定義可能在這些路徑重複處理。整圖快取只能避開命中時的工作，不能消除一次未命中內部的重複。

新 Grape 的已接受架構更直接對應 Owner 的擴充目標，但 S03 現有產碼也會按使用位置處理 subgraph，部分 stage 檢查也重複遞迴。**新架構允許改善，不等於效能已改善。**

## 1. Legacy 實際怎麼運作

| 階段 | 實際做法 | 對本次問題的意義 |
|---|---|---|
| 儲存圖 | Stage 與 `graph.functions` 保存節點、連線及共用定義；call 用 `functionId` 引用 | 儲存沒有按每次引用攤平；Legacy 已有非 DOM 的資料身分 |
| 編輯與 Auto | 瀏覽器依 Python 提供的型別契約選具體簽名，將結果寫入 node 參數 | 數值 Auto 是編輯政策；Python 不會重新執行同一套 Auto 選型政策 |
| 接線候選 | 從 DOM 接孔收集目標，以模型 planner 判斷；支援 all／hover／viewport | 候選數量、觸發次數與每次判定成本是三個不同問題 |
| 常量資格 | 用實際輸入的資格進入 subgraph，區分普通常量、特化常量及 runtime 值 | 外露型別固定不足以取代這項檢查 |
| Python 圖檢查／產碼 | 檢查定義 → 各定義驗證圖展開 → 實際圖展開 → 全圖合法性 → 使用節點剪枝 → GLSL | 儲存重用沒有自動變成分析及產碼重用 |
| 套用 TD | 瀏覽器送圖與 revision；runtime 重驗、建立候選、驗證後套用並保存狀態 | 圖分析成本與 TD API／編譯／套用成本要分開 |

依據：[FunctionModel][L01]、[Auto 與具體 Port][L02]、[接線候選][L03]、[Python 入口][L04]、[TD 套用][L05]。

### 儲存與命名並非缺失

FunctionModel 有 library snapshot、localize 與 independent copy：既有 library 定義被修改時會保留舊版本、重配需要本地化的引用；不是所有 call 都各存一份內部圖。產碼展開另外以使用路徑與 node ID 產生內部身分，再配置輸出符號。不能將「函式有命名空間」推成「現行內聯一定會重名」。[L01]、[L06]

Legacy 的線在文件中保存端點，Python 依兩端型別檢查並在取用輸入時生成轉換表達式；不必每條轉換先建立獨立承接變數。這和新 Grape 明示保存、查詢 Edge adaptation plan 的契約不同，但不是「Legacy 連線僅存在 DOM」的證據。[L07]、[G01]

## 2. 接線成本：有局部修補空間，不能全歸因於 Auto

### 2.1 同一條接線有數層規劃

一般接孔的路徑是：

`connectionProblem → planWireTypes → 候選 planAutoGraph + 基準 planAutoGraph + 新舊錯誤比較`

實際放線時，`connectPorts` 再呼叫 `connectionProblem`，進入 `change` 後由 `commitPlannedWire` 再次執行 `planWireTypes`。後者只把所規劃的 edges 套入；提交後 `resolveAutoEdit` 再依圖變更重新調整型別。不能把這些都算成 pointermove 工作，但也不能只看 planner 裡面已有 map，就認為整次操作沒有重複分析。[L08]、[L09]

另有兩個可直接定位的成本：

- 外層接線判定與 planner 各做循環搜尋；搜尋每處理一個節點又掃描 edge array。可達節點越多，重複掃描越多，並非用既有鄰接索引直接走線。
- `resolveAutoEdit` 先比較整份 `autoTopology`；有變動便對所有 Stage／function definition 建立 plan，不只本次變動單位。若手動改型後要移除新失效連線，還會按移除結果再規劃；這個迴圈有 edge 數量作界限，不是無條件無窮傳播。[L10]

**判斷：有限實作改善候選。** 可以先檢視單次操作內未改變的基準能否共用、查找是否重掃，以及哪些 network 確實受影響。這些改善不必先改存檔格式或撤回 Auto。實際提交仍須對當前狀態驗證；減少重複工作不等於讓舊預檢結果永久有效。

### 2.2 Auto 已有邊界和局部記憶

`planAutoGraph` 先索引節點與輸入連線，依上游先行處理，已完成節點不因同次走訪的 fan-out 重做。遇到 subgraph call 時，`autoDefinition` 讀取定義明示的外露接口，不在每個 call 進入全部內部圖；`autoUnits` 則每份定義列舉一次。[L02]、[L11]

因此，先前「每次接線 Auto 都把所有 subgraph 引用全部攤平」的概括不成立。較準確的問題是：**每個候選處理所在 network，加上提交時多單位重算，以及另一條可能逐引用深入的常量檢查。**

### 2.3 候選提示已提供減少工作量的方式

all 模式評估所有收集到的接孔；viewport 先限制幾何範圍；hover 按命中需要評估。手勢內還有依接孔、`editVersion` 等失效的結果重用。它不是每個 pointermove 都無條件檢查全圖。[L03]

這些模式降低候選數量或評估次數，沒有改變正式接線規則，也沒有消除單一候選的 planner 成本。特殊向量分量預覽還有額外規劃路徑，不能把普通 hover 的一次命中成本當作所有線型的上限。[L12]

目前文件明列真實大圖效能仍待比對。故本 review 不能宣稱新模式已解決 Owner 的 lag。[L13]

### 2.4 拉線新增已做局部候選試算

creator 保存同一上下文的基準 plan，把多數候選縮成新節點與必要的來源邊界；反向新增另按新來源型別共用結果。完整常量或下游限制可留到選取時拒絕，實際建立仍走完整提交。這是現存能力，不能列成非重構不可的缺口。[L14]

歷史紀錄有 101 節點合成圖的改善：往下游開啟由 773 ms 降至 14 ms，`mat` 查詢由 635 ms 降至 5 ms。這是 0.8.89 的本機隔離量測、文件所載結果，本次沒有重跑，也沒有取得私人原始報告；只能支持「局部減少重複規劃曾有實益」，不能估算 Owner 實際巢狀圖的收益。[L15]

## 3. 常量檢查是另一個真正的 subgraph 倍率

`constantRequirementIssues` 在整圖出現 `requireConstant` 或 Array Create 時啟用，從所有 Stage 分析節點。每次遇到 call，帶入該次使用的輸入資格，再為內部 graph 建立新的 values map。單一使用位置內有記憶，但不同 call 不共用該 map；`seenFunctions` 只避免最後補查已遇過的定義，沒有省掉重複 call 的分析。[L16]

這裡沒有建立實體攤平副本，卻仍有**按使用位置展開的分析工作**。若 A 內含三個 B，而主圖使用兩次 A，該次分析會沿六個 B 使用位置進入。實際程式還有未使用定義補查與新舊錯誤比較；例子不是完整呼叫次數量測。

普通常量、特化常量、runtime 值、Array length 及分量覆寫會影響結果。相同外露型別的兩次 call，也可能有不同資格。因此：

- 撤回數值 Auto 不會自動撤掉這項成本。
- 只看 subgraph 外露 Port 的型別，不能保證常量要求成立。
- 可以調查「定義對各輸入資格的依賴」是否能重用，但不能只以 definition ID 快取所有呼叫的結論。

**判斷：有限分析流程調整候選，必須帶條件。** 它不要求先讓全部 subgraph 變成 GLSL 函式，也不能在沒有替代證據時直接省略內部驗證。若整圖沒有上述觸發條件，此函式會早退，不應把這份成本套到每張圖。

## 4. 產碼的主要重複：定義驗證展開，加上實際使用展開

### 4.1 不只主圖攤平一次

`_compile_graph` 對每份 function、每個宣告的 stage 建立 probe 圖，呼叫 `_expand` 與 `_compile_flat`。這是為了驗證未被主圖使用的定義。之後才對實際圖再執行 `_expand` 與 `_compile_flat`。[L04]

而 `_expand` 在每個 call 建立該使用位置的邊界 relay、複製內部節點、重配身分並遞迴子圖；它先展開 Stage 內的 call，再由後面的產碼分析決定哪些節點真的需要輸出 GLSL。斷開且不參與輸出的 call 仍可能先產生展開成本。[L06]

因此巢狀重用同時遇到兩種倍率：

1. 同一定義在主圖的多個使用位置。
2. 每份定義的 probe 又重新處理自己的巢狀引用。

這是來源碼可確認的工作量結構，不是量測哪一步佔最多毫秒。程式另有限制定義數、每單位節點數及展開後節點數；不會無界增長，但小型主圖仍可能因內部重用碰到展開上限。當前限制包括最多 64 份定義、單位 256 個節點、展開後 Stage 最多 2048 個節點。[L17]、[L06]

### 4.2 它已有正確且有用的剪枝與重用

`_compile_flat` 建立節點、Port、輸入連線表，先對所有節點做循環及常量資格等驗證；再從輸出、Preview 與 effect 根找出需要的依賴，依拓撲順序產碼。每個輸出有 expressions 記錄，通常以一次產生的暫存變數供多個下游使用，不因 fan-out 重複產生整條運算鏈。[L18]、[L19]

這裡需要區分三件事：

- **同一節點輸出重用：已有。**
- **所有相同算式自動合併：不能據此宣稱已有。** expression identity 的一段計算服務於 array extent 一致性，不是通用算式合併器。
- **同一 subgraph 定義跨使用位置共用完整分析／產碼模板：這條路徑未做。**

因此不應為「看起來像成熟編譯器」而增加通用 IR、完整常數求值器或算式最佳化框架。先解決可見的重複展開與分析，才符合這次目標。

### 4.3 不必把「能重用」等同「全部函式化」

可分別思考：

| 希望減少的工作 | 可以調查的性質 | 仍需保留的差異 |
|---|---|---|
| 相同定義的結構、stage、接口檢查 | 在同一固定圖／定義版本內重用已完成分析 | 未使用定義仍驗、依賴與 module/profile 不同要失效 |
| 按使用位置重走相同內部拓撲 | 重用內部順序或可套用模板 | 輸入表達式、常量資格、資源、符號及診斷來源 |
| GLSL 重複函式內容 | 合適路徑共用 helper／函式 | 常量表達式資格、effect、extent 與呼叫位置語意 |

這些是可比較的技術方向，沒有選定機制或授權實作。單次 Exporter 可以保存本次工作的中間結果，完成後釋放；不必先成為跨次匯出的長壽物件。

既有 GLSL Code 已能輸出具名 helper，Voronoi 也有 helper 重用，因此「Legacy 完全無法使用函式」不成立；但一般 subgraph 沒有因此自動函式化。[L20]、[L21]

先前「常量不能傳入函式」的說法太寬。固定值可以傳入函式；受限制的是要求 GLSL constant expression 的位置，不能無條件以自訂函式呼叫替代原表達式。已查證的語言依據與限制保留在 [Q-002](../OPEN_QUESTIONS.md#q-002--巢狀-subgraph-重用的產碼與圖遍歷成本)，本 review 沒有重做跨 profile 資格驗證。

## 5. 節點擴充：已有三種途徑，但不等於一般模組擴充

| 擴充方式 | Legacy 已提供 | 邊界 |
|---|---|---|
| 封裝既有節點為 subgraph | 共用定義、庫快照、本地化、獨立副本 | 用既有節點組合，受既有接口及產碼能力約束 |
| GLSL Code | 自訂輸入／輸出及函式內容，產生 helper | 仍是一種已內建節點，不能據此替換任意節點生命週期、特殊規則或 UI |
| 原生函式表 | `sgrape_legacy_nodes.CALLS` 以資料列描述變體、預設值、out 參數、常量資格等，由通用 emitter 處理 | 新增這一類普通函式較集中，仍須交付核心表與 catalog；特殊語意另有分支 |
| 新的一般節點模組 | 沒有等價於 IH-005 NodeModule 的開放註冊契約 | JSON catalog 不能自行提供新的 ports／validate／emit 實作 |

`validate_catalog` 要求 key 屬於固定 `EMITTER_IDS`，emitter id 亦須吻合。Python 的 `definition_ports`、參數推導及產碼 dispatch 有種類分支；JS 的 `resolvedNodePorts`、型別政策與 Inspector 也有動態節點分支。以 Voronoi 或自訂複合接口為例，新增能力不只是放一份描述文件。[L22]、[L23]、[L24]

但「每加任何節點都要改一大堆中央檔案」同樣太粗。符合原生 CALLS 表模型的節點已有集中入口，subgraph／GLSL Code 也確實解決一部分擴充需求。應先問新節點要哪種能力，不能用特殊節點的成本代表所有新增。[L25]

**判斷：相對於 Owner 的一般節點獨立擴充目標，這是真正的架構限制。** 可在 Legacy 逐步建立對應能力，但會涉及定義權威、動態接口、驗證、產碼、編輯呈現及版本保存，不是幾處效能優化即可完成；也不能只把大型檔案拆開就宣稱達標。

IH-005 明確要求普通計算、動態節點及來源類都透過 registry 與唯讀 callback，不由 core 依名稱分派。這項差異是可觀察的擴充成本與能力邊界，不只是架構外觀。[G02]

## 6. 雙端分工與宿主依賴：既非完全重複，也非完全獨立

### 6.1 Auto 的責任已經分開

前端直接註明 Auto 是 editor policy，保存的是具體型別。Python 產碼主要驗證該簽名；`_infer_graph_types` 另處理 Router、Preview、Array／Struct 等來源相關型別，沒有重跑前端數值 Auto 的簽名排序。[L02]、[L26]

Python 產生的有限型別契約提供前端合法變體，減少兩端各自猜 GLSL 的問題。但特殊動態接口與常量／接線政策仍分散於兩種語言，變更時需要同步核對。不能說有共享契約就沒有維護成本，也不能說兩端存在相似判斷就必然是錯誤；編輯預檢與正式權威驗證本來就有不同用途。

值得注意的是 `ui.typeMode` 會改變語意，並不是純外觀欄位。現行 topology 與 GraphChecks 的 key 都刻意保留它。任何以 `ui` 欄位整類排除語意分析的優化都會錯。[L10]、[L27]

### 6.2 已有純圖結果快取，宿主保護沒有被一起快取

runtime 持有 `GraphChecks` 實例。它最多保存 8 份結果，以序列化鍵與結果合計 4 MiB 為界；不是 Python heap 的精確上限。相同 compiler／catalog 且 key 命中時，回傳結果副本；只排除列明的幾何欄位，未知欄位、標籤、型別政策與函式仍進 key。這是 GLSL 文字與純圖工作的重用，不是本次排除的 GPU 編譯快取。[L27]、[L28]

快取可以跨同一 runtime 實例的請求保留；`session` 的用途是同一同步操作中少做依賴核對，不是每結束一次 session 就丟掉所有結果。即使命中仍有整圖序列化與結果複製，故不能稱零成本。

TD 部署另查 revision、來源狀態、升級、manifest／Shader 是否仍吻合；需要時先建候選驗證，成功才改正式目標。這些保護有實際目的，不能因為耗時便視為多餘。[L05]

### 6.3 純 Python 分析可離線做，不代表產物與宿主無關

核心把 TD 的 built-in、來源 binding、MAT／TOP 輸出、stage shell 寫進產碼；輸出含 `TDDeform`、`TDTexCoord`、`TDCheckDiscard`、`sTD2DInputs` 等。Python 模組可以離開 TD 被呼叫，與產碼語意可跨宿主，是兩個不同命題。[L29]

瀏覽器持有工作草稿與圖 History，成功 apply 的圖／manifest／state 存入 TD，History 還有 native token 等交會。新 Grape 則明定產品擁有文件、Graph values 與分域 History，Host 為外部整合對象。若要把 Legacy 改成這種產品，不只是把 TD 呼叫包成一個 adapter。[L09]、[L30]、[G03]

**判斷：**保留 TD 材質工具定位時，這些依賴很多是有用的整合；希望產品獨立時，它們是要明確處理的責任轉移。不能以「耦合」一詞直接否定所有現有設計。

## 7. 新版本已修的行為，不能繼續當作現行缺陷

Owner 提過單一 `vec3` 接入 Multiply，另一孔被選為矩陣而輸出 `vec2`。本次 HEAD 已新增以下政策：新單一純量／向量輸入，Multiply 偏好兩個同型運算元；Outer Product 偏好對應方陣。A 或 B 都包含在既有測試的敘述中。[L31]

它又保留舊圖已存在、仍有效且未更換輸入的簽名，避免一次無關編輯重解舊圖並斷掉下游。換來源、來源改型別或 Locked → Auto 才可能採新預設。因此修補後仍可能看到舊的矩陣簽名，不能僅憑此認定新預設沒生效。[L11]、[L31]

這份行為也暴露一個產品取捨：**保留舊圖意圖，會讓目前結果不只取決於眼前接入型別，還依賴已保存的具體簽名及操作情境。** 這不是本 review 替 Owner 判錯或批准，而是日後決定 Auto 政策時要說清楚的可預期性問題。

現行 HEAD 也已有布局操作短路徑與 History 比較工作減量。舊 lag 文件中的「位置變更仍完整推導」不能原封不動當作 0.8.276 現況；目前非布局的語意編輯仍有本報告列出的較重流程。[L09]、[L13]

## 8. 和新 Grape 的交叉結論

| 能力／問題 | Legacy 現況 | Grape 已接受契約／S03 程式觀察 |
|---|---|---|
| 共用 subgraph 儲存 | 已有 | IH-005 已有；不是這次重構才發明 |
| 新節點不改核心種類分支 | CALLS／GLSL Code／subgraph 各有局部途徑，任意新種類沒有一般模組契約 | IH-005 明確要求 NodeModule；S03 全能力驗收仍未完成 |
| 動態接口與改型影響 | 編輯器 planner、整圖提交及特殊分支共同處理 | 契約要求 Graph candidate 內依賴序重算、caller 同批更新及明示失效線政策 |
| Edge 轉換 | 從端點型別現算相容與 GLSL 轉換 | 明示的、可查詢的 adaptation plan，接收 Port 有政策 |
| 單一使用位置內輸出重用 | expressions／拓撲順序已有 | `lowerNetwork` 內的 emitted map 已有 |
| 跨 subgraph 使用位置重用 | 一般路徑逐 call 展開，另有 probe 展開 | S03 `emitNetwork` 每次建立新的 `lowerNetwork`，尚不能宣稱已解決 |
| 定義適用性分析重用 | 定義引用循環檢查已有 done set；其他分析各有範圍 | S03 `definitionStages` 只有路徑防循環，同一定義可重複遞迴 |
| 產碼快取 | GraphChecks 已有有界整圖結果重用 | IH-005 有 Updates／cache 責任；S03 所讀 `generate()` 直接呼叫 compile，不能拿規格當已交付效能 |
| 全圖正確性 | 所有節點與未使用定義都會驗 | IH-005 同樣要求剪枝前處理全圖 model Error；不能靠少驗來宣稱更快 |
| 宿主獨立 | 圖分析有 Python 邊界，GLSL 與成功狀態仍深入 TD | 產品擁有資料與 History，Host 為外部目標；不是任意語言後端承諾 |

新 Grape 程式依據：[單次產碼與子圖展開][G04]、[definitionStages][G05]、[generate][G06]。接受契約依據：[動態接口][G07]、[generation／Updates][G08]。這些觀察不改變 S03 狀態，不是新增阻擋條件或通過判定。

**架構可表達性：YES，部分需要有界實作工作。** 同次生成的局部重用、圖查找索引、候選上下文重用與保留當前全圖判定，在已接受責任範圍內有探索空間。本次未發現「為了少做重複分析，就必須推翻 IH-005」的反例。是否採跨次定義快取、一般子圖函式化等機制，仍需另行界定依賴與語意，不能從本報告直接推成新架構要求。

## 9. 哪些補 Legacy 就夠，哪些不夠

| 目標 | 評價 | 適當分類與下一個權限 |
|---|---|---|
| 避免單一向量輸入時意外選矩陣 | 最新版本已有針對性修補；兼容舊簽名的取捨仍需理解 | 已支持的局部政策；PM 解釋即可，不另創工作 |
| 降低拉線候選的重複規劃與循環掃描 | 可在現有模型與正式提交保護內改善 | 有界實作候選；需 Human 授權後交 Implementer |
| 降低語意編輯重算無關單位 | 有局部化空間；需明確依賴閉包及失效條件 | 有限流程調整候選，不能直接刪除全圖錯誤保護 |
| 降低巢狀 subgraph 的驗證／遍歷成本 | 有明確重複路徑；與是否全面函式化可分開處理 | 值得準備未來 Slice 的問題，尚非派工 |
| 縮小所有重複 GLSL 內容 | 部分可用函式；常量、effect、extent 等不能一律替代 | 需釐清機制及兼容條件，尚無全面承諾 |
| 一般新節點模組可獨立交付 | 現有集中表與特殊分支未提供同等能力 | 真實擴充邊界；效能修補不足以達到 |
| 產品文件、Graph values 與 History 獨立於宿主 | 牽涉持有權、保存、錯誤草稿與套用生命週期 | 跨邊界產品／架構工作，不是局部補丁 |
| 判定新產品已更快 | 本次資料不足；S03 也有重複分析路徑 | 保留未證實，不能列為重構已達成成果 |

我對 Legacy 的評價是：**它已是具有具體圖語意、保護與多次局部優化的 TD 專用材質工具；弱點在一般擴充邊界與若干分析路徑的重複工作，不在「舊」或「檔案很大」。**

若 Owner 只要現有 TD 產品更順，沒有證據說一定要全面重做。若核心目標仍是獨立節點擴充及產品自主權，Grape 重構有可指出的能力理由；但應沿用 Legacy 證明有用的語意與效能經驗，並重新驗證新實作的成本。

## 證據界限與本次未作的推論

- 本次以程式閱讀為主，沒有新增、修改或執行測試，沒有啟動 TD、載入使用者作品或做 UI 操作。既有測試僅用來核對意圖與案例範圍。
- 沒有拿到 Owner 原始 lag 分析的完整報告／trace，因此未把任何路徑定為實測首要瓶頸，未給新舊速度比或修補工時估價。
- 無原生 UI 操作觀察，不評斷拖線手感、意圖是否被正確理解、可發現性或人類是否覺得流暢。
- 核心路徑已足以回答本次抽象問題；不是全庫逐行安全稽核、全部節點公式核對、歷史交易驗收或 binary／部署狀態稽核。
- 不主張 Auto 必須撤回、所有 subgraph 必須函式化、Edge 應包辦整圖合法性，或應複製其他產品核心。這些都不能由此次程式分析自動決定。
- 只有 notes 文件改動。沒有修改 Legacy、`production/`、`handoff/`、workflow 或 `implementation-state.json`，也沒有建立或授權 Slice。

## 來源索引

引用行號以本次固定版本為準；後續程式移動時應核對版本及函式，不以行號單獨認定仍適用。Legacy 路徑指向 Owner 提供的來源資料夾；Grape 路徑指向目前工作區。

- L01：[functions_model.js:96][L01]，共用定義、localize、import、independent copy，至 158。
- L02：[graph_ui.js:564][L02]，具體 Port 與 Auto 政策，至 600。
- L03：[graph_ui.js:1515][L03]，候選模式與手勢內重用，至 1565。
- L04：[sgrape_core.py:2318][L04]，入口、定義 probe、正式展開，至 2373。
- L05：[sgrape_runtime.py:1760][L05]，版本檢查、GraphChecks、候選部署，至 1840。
- L06：[sgrape_core.py:2124][L06]，逐 call 展開、路徑身分與 relay，至 2233。
- L07：[sgrape_core.py:1218][L07]，端點／型別合法性，至 1231；轉換表達式見 L19。
- L08：[graph_ui.js:1018][L08]，候選 plan 與 commitPlannedWire，至 1051。
- L09：[app.js:294][L09]，History、布局短路徑與 change，至 343。
- L10：[graph_ui.js:967][L10]，topology 與全單位 reconciliation，至 1012。
- L11：[graph_ui.js:786][L11]，call 邊界、autoUnits、規劃與舊簽名保留，至 909。
- L12：[graph_ui.js:1310][L12]，向量接線預覽規劃，至 1317；拖線呼叫位於 1605。
- L13：[STATUS.md:3][L13]，0.8.274–276 現況、已修行為及限制，至 13。
- L14：[graph_ui.js:1052][L14]，creator context 與局部試算，至 1147。
- L15：[TESTING.md:146][L15]，0.8.89 合成圖的歷史量測與限制，至 150。
- L16：[graph_ui.js:720][L16]，常量資格逐使用位置分析與新舊比較，至 784。
- L17：[sgrape_core.py:2088][L17]，定義及引用合法性、done set，至 2121。
- L18：[sgrape_core.py:1277][L18]，全圖驗證、資格、extent 與 live 遍歷，至 1351。
- L19：[sgrape_core.py:1385][L19]，輸出符號／輸入轉換與逐節點 emission；結果落在 expressions 的分支至 1738。
- L20：[sgrape_core.py:1636][L20]，GLSL Code helper，至 1655。
- L21：[sgrape_core.py:1520][L21]，Voronoi helper 的去重及呼叫，至 1536。
- L22：[sgrape_core.py:108][L22]，固定 emitter 集合；catalog 驗證位於 284–326。
- L23：[sgrape_core.py:604][L23]，Port 與參數特殊分支，至 669。
- L24：[inspector.js:1197][L24]，Voronoi 特殊 Inspector；其他種類分支同檔。
- L25：[sgrape_legacy_nodes.py:17][L25]，CALLS 表模型；通用 emit 位於 304–342。
- L26：[sgrape_core.py:2257][L26]，後端來源相關型別處理，至 2316。
- L27：[sgrape_document.py:356][L27]，GraphChecks 全部實作，至 454。
- L28：[sgrape_runtime.py:443][L28]，runtime 持有 GraphChecks 實例，至 458。
- L29：[sgrape_core.py:1744][L29]，binding、TD shell 與輸出，至 1792。
- L30：[app.js:455][L30]，送出圖／revision、native history 與在途回覆，至 509。
- L31：[test_auto_operand_defaults.js:48][L31]，新預設、手動鎖定及舊圖保存案例，至 150；只閱讀，未執行。
- G01：[02_ARCHITECTURE_SPEC.md:65][G01]，正式接線與 Edge adaptation，至 71。
- G02：[04_EXTENSION_MODEL.md:24][G02]，NodeModule 契約，至 38。
- G03：[README.md:3][G03]，產品與 Host 的責任、當前接受狀態；另見不可變責任表。
- G04：[compiler.ts:196][G04]，Network 局部 memo 及逐 call 進入，至 279。
- G05：[networks.ts:145][G05]，definitionStages，至 165。
- G06：[editor.ts:502][G06]，generate，至 511。
- G07：[04_EXTENSION_MODEL.md:49][G07]，動態接口、下游及失效線語意，至 54。
- G08：[02_ARCHITECTURE_SPEC.md:75][G08]，全圖錯誤、生成與 Updates，至 81。

[L01]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/functions_model.js:96
[L02]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/graph_ui.js:564
[L03]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/graph_ui.js:1515
[L04]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:2318
[L05]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/td/runtime/sgrape_runtime.py:1760
[L06]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:2124
[L07]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:1218
[L08]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/graph_ui.js:1018
[L09]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/app.js:294
[L10]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/graph_ui.js:967
[L11]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/graph_ui.js:786
[L12]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/graph_ui.js:1310
[L13]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/docs/development/STATUS.md:3
[L14]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/graph_ui.js:1052
[L15]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/docs/development/TESTING.md:146
[L16]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/graph_ui.js:720
[L17]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:2088
[L18]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:1277
[L19]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:1385
[L20]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:1636
[L21]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:1520
[L22]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:108
[L23]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:604
[L24]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/inspector.js:1197
[L25]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_legacy_nodes.py:17
[L26]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:2257
[L27]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_document.py:356
[L28]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/td/runtime/sgrape_runtime.py:443
[L29]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:1744
[L30]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/app.js:455
[L31]: C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/tests/unit/test_auto_operand_defaults.js:48
[G01]: C:/Users/user/source/Grape/handoff/02_ARCHITECTURE_SPEC.md:65
[G02]: C:/Users/user/source/Grape/handoff/04_EXTENSION_MODEL.md:24
[G03]: C:/Users/user/source/Grape/README.md:3
[G04]: C:/Users/user/source/Grape/production/src/generation/compiler.ts:196
[G05]: C:/Users/user/source/Grape/production/src/sdk/networks.ts:145
[G06]: C:/Users/user/source/Grape/production/src/application/editor.ts:502
[G07]: C:/Users/user/source/Grape/handoff/04_EXTENSION_MODEL.md:49
[G08]: C:/Users/user/source/Grape/handoff/02_ARCHITECTURE_SPEC.md:75
