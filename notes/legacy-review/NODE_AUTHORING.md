# Legacy 新增節點的人類維護流程

2026-10-04。靜態閱讀基準為 TD-Grape `90a946bdd2acacbf52c93842806edbc23f76b7ba`／0.8.276；本篇引用的 tracked 來源與該 HEAD 一致。完整 review 範圍見[總覽](README.md)。

本篇回答：一位不依賴 Agent 的維護者，要新增一顆內建運算節點，必須先理解什麼、修改什麼，以及如何判斷已經完成。這是產品側分析與程式導讀，不是實作授權、新產品規格或 Fresh Reviewer 驗收。本次沒有新增節點、修改 Legacy、執行或新增產品測試，也沒有啟動 TouchDesigner。

Owner 的問題是：Legacy 已很好用，希望保留其能力，但擔心人類已難以掌握修改範圍與確認完整性。這與判定整套邏輯錯誤、放棄產品或全部重寫無關。程式閱讀可以證實責任分布與需要掌握的規則；本次沒有量測人類開發時間，不能把「只能由 AI 維護」當成已證明的事實。

**結論：符合既有原生函式描述表的節點已有較短路徑；帶新接口或依賴語意的節點，需要維護者跨核心、編輯器與交付流程自行核對。最重的負擔是找齊節點的全部責任，以及知道哪些共用政策會自動作用於它。**

## 先判斷新增的是哪一種能力

| 要加入的能力 | 現存途徑 | 人類作者需要掌握的範圍 |
|---|---|---|
| 既有節點的組合 | Subgraph，另見主 review | 組合及接口能力；不等同新增核心節點種類 |
| 既有 GLSL Code 容器可表達的運算 | GLSL Code，另見主 review | 該容器的接口與產碼限制 |
| 已有原生函式或運算子，符合現存呼叫模型 | `sgrape_legacy_nodes.CALLS` | 描述表、catalog、共用政策、選單與交付 |
| 有新的模式、接口布局或自訂 helper | 以 Voronoi 的整合方式為例 | 節點模組之外，還有核心 dispatch、前端接口與控制項 |
| 輸出只依賴部分輸入，或有額外可觀察作用 | 以 Replace／終端節點為例 | 還須理解依賴、常數資格及產碼根的分析規則 |

以下集中在內建運算節點。這些是依現存實作整理的路徑，不是建議新增一套框架。符合共用機制時應直接沿用，不能把所有條件性修改都算成每顆節點的必要工作。[N01][N02][N03]

## 從找範例到確認完成

人類作者可按下面順序閱讀；實際編輯需讓互相依賴的資料與實作一起完成，不能期待中途的半成品已可載入。

1. **先寫清這顆節點的行為。** 列出接口、合法型別與模式、未接線預設、輸出依賴、常數資格、Stage／target 限制。這些決定能否沿用原生呼叫表。
2. **從 catalog 找相近節點，再追 emitter。** 確認範例究竟走共同 emitter、核心分支或專用模組；不能只憑節點名稱選範本。
3. **追接口與型別契約。** 後端透過 `definition_ports`、`node_parameter_types` 與 `resolved_ports` 解釋節點；`_type_contract` 提供前端所需的型別資料。確認兩端實際讀到的是什麼。
4. **接上產碼與分析。** 先完成運算，再確認它對常數、有效輸入及必要輸出的解釋一致。普通函式可以沿用，新的依賴語意則需要另查。
5. **走一遍編輯操作。** 確認建立、接線、改型別或模式、拔線、手動輸入值，以及適用的 Auto 行為；需要新控制項時再修改 Inspector。
6. **完成發現入口與交付。** 補齊選單資料、說明、產生的索引，以及 TD 內嵌來源；按宣告範圍核對保存重載與實際運作。

其中每一步都包含「確認可以沿用」的工作，不必每一步都修改程式。[N04][N05][N06][N07][N08]

## 普通原生函式的較短路徑

以既有 `tan` 為閱讀樣本，不是在本次重新新增它。作者先看到 catalog 中的 `float → float`，再追查才知道它實際還有 vector 變體：`CALLS` 的 `add` 為各型別建立接口，核心優先讀取這些變體。只看 JSON 無法得知這顆節點的完整型別能力。[N01][N04][N09]

| 順序 | 要讀與處理的內容 | 本路徑是否通常要改 |
|---|---|---|
| 原生呼叫描述 | `sgrape_legacy_nodes.py` 的 `add`／`fixed`；指定函式、inputs／outputs、types、defaults、constant、stages／targets，必要時使用既有 out 參數模型 | 新增描述；所需行為若已被 common emitter 支援，不需新增 emit 分支 |
| 節點身份與展示資料 | `node_catalog.json` 的 definition、emitter 與 browser；設定 UUID、revision hash、預設與接口、說明索引及搜尋入口 | 新增 catalog entry；須保持 catalog 與描述表的共同欄位一致 |
| 核心接入 | `EMITTER_IDS` 納入全部 CALLS；接口、型別選項、一般常數清單與產碼都有 CALLS 共用入口 | 上述既有入口可沿用；不是每顆普通函式都改核心 |
| 編輯器 | 前端從型別契約讀 variants；建立時套用 defaults；普通輸入及型別選單沿用共用 UI | 確認行為，不必為普通函式新增專用 Inspector |
| 說明與選單索引 | `locales.json` 的說明與適用文字；`sync_node_browser.py` 從 catalog 產生 `index.html` 的選單 metadata | 增補文字並同步生成內容；不手寫另一份選單資料 |
| TD 交付 | 更新已映射的 catalog、Python 與編輯器內嵌來源，按交付範圍保存 TOE | 既有檔案已有映射；只有新增來源檔時才需補映射 |

依據：[描述表與通用 emitter][N01]、[CALLS 自動進入核心清單][N02]、[catalog 驗證][N05]、[type contract][N06]、[前端讀取 variants][N07]、[建立節點][N08]、[選單生成][N10]、[開發交付][N11]。

這條路在既有檔案中的主要編寫位置是描述表、catalog 與說明文字；另有生成的選單索引和適當驗證。不能因此省略對共用政策的理解：若希望不同於既有 Auto、常數或預設值規則，這顆節點已超出「只新增一列描述」的條件。

`sin` 和 `tan` 也提醒了範本選擇的成本：兩者看起來都是單輸入數學函式，`sin` 在核心的原生函式分支，`tan` 在 CALLS 表。現存相近節點並不保證採用同一條整合路徑。[N01][N12]

## 固定三個輸入的連加案例

Owner 提出的具體情境按「已有 Math，但希望另有一顆用途明確的連加，直接做 A＋B＋C」理解。本例只分析三個輸入與固定加法，沒有把它擴成任意數量輸入、不同型別政策或新 UI 系統。

**現況：** catalog 的 Math 預設 inputCount 為 3，核心在沒有明示 steps 時預設逐項加法。Math 文件及前端也確認 A、B、C 命名與可切換運算的控制。因此運算能力已存在；一顆不必再選運算的專用節點，仍可提供不同的操作體驗。不能用「Math 已算得出來」否定這項便利需求。[N31][N32]

**最小可行路徑的程式推論：** 現有 CALLS emitter 的 operator 分支以指定運算子串接全部輸入，並非只支援二元。因此，若沿用既有同型別與編輯政策，三輸入連加可用描述表宣告三個輸入、輸出及 `+`；不需要為這個固定案例增加動態接口、dependency 或產碼分支。這是靜態分析，未新增描述或執行測試。[N33]

人類作者仍須完成：找到這個入口、選定支援型別與預設、加入 CALLS 和 catalog、建立有效指紋、補充名稱與說明、同步選單投影、核對共用 Auto／接線／保存行為，並交付到 TD。若只是在畫布上使用一次，Math 既有預設即可計算；本篇評估的是作者要提供一顆可重複使用的專用節點。

**付出與回報判斷：** 對已熟悉 CALLS 與交付流程的維護者，這是有界且相對小的新增工作；不應套用 Voronoi 的跨層修改成本。對第一次進來的作者，找齊入口與確認沒有漏掉規則的前置成本，相對 A＋B＋C 這個很小的功能增量，明顯偏高。此處評的是學習與確認成本，不是假稱加法公式難寫，也沒有量測工時或成本倍數。

UUID、說明及包裝本身有正常用途。真正值得改善的維護性問題，是作者必須先靠全局追查，才知道這個小需求可以只走短路徑，以及短路徑何時才算完整。這個判斷不授權修改 Legacy，也不把連加節點列為已接受的新產品需求。

## 動態接口需要跨層接入

以 Voronoi 為例。它已有專用 Python 模組，內含 settings 驗證、接口、提供給前端的模式資料與 GLSL helper；因此並非所有運算都擠在核心。但這份模組本身仍不足以完成節點整合。[N13]

| 作者的下一個問題 | 現有答案位於何處 | 依這個模式加入另一種節點時的工作 |
|---|---|---|
| 模組怎麼被載入 | 核心同時有普通 Python import 與 TD DAT.module 路徑 | 增補接入；新來源檔需補兩份 TD 映射 |
| catalog 怎麼找到新的接口 | `definition_ports` 用 `key == 'voronoi'` 轉到模組 | 新增對應分派，或確認已有路徑涵蓋 |
| 瀏覽器如何得到各模式的接口 | 核心 `_type_contract` 放入 `voronoi.contract()`，前端 `voronoiPorts` 讀取 | 接上資料交付及前端解析；不應複製成另一套獨立猜測 |
| 模式變更時怎麼處理輸入值 | `setVoronoiOption` 保存目前可見輸入值，再依新接口恢復 | 若產品也需要此行為，實作其狀態轉換；只加下拉選單不夠 |
| 什麼會讓既有連線重新檢查 | `autoTopology` 列出 dimensions、feature、metric 等欄位 | 新的接口相關參數須確認已被偵測，不能假設任意 params 都會觸發 |
| 模式控制項和數值限制在哪裡 | `inspector.js` 的 `voronoiInspector`、`nodeInputOptions` | 提供必要控制項，透過既有 change 流程修改資料 |
| helper 怎麼呼叫及映射到 outputs | 核心 Voronoi emission 分支處理座標、參數、helper 重用、result fields | 接上產碼環境；模組只產生 helper 並未自動完成這部分 |

依據：[載入與接口分派][N04][N14]、[型別契約][N06]、[前端模式變更][N15]、[變更偵測][N16]、[Inspector][N17]、[產碼接入][N12]、[交付映射][N18]。

可沿用的部分仍很多，包括一般節點身分、連線容器、編輯交易、History、保存以及既有數值輸入元件。作者不需要另寫一套；但必須確認自己的控制項與狀態使用了這些入口。`change` 會處理快照、localize、規劃、失敗還原及 History，直接改資料並重畫不能代表同一件事。[N19]

本例顯示的限制是：新的模式語意要由人跨層接好。單純將運算程式搬到另一個 Python 檔，並沒有建立完整的節點擴充邊界。

## 超出普通輸入依賴時還要理解分析器

Replace 的輸出可能完全覆蓋原始 value；此時原始 value 不應繼續決定結果的常數資格。核心先建立分量來源，再由 `effective_inputs` 提供有效輸入，供常數資格、表達式身分、所需輸出與上游保留等分析使用。前端的常數預檢也有對應處理。[N20][N21]

因此，加入具有相似依賴語意的節點，作者要先判斷普通「所有輸入都影響輸出」是否符合行為。若不符合，就必須追這條分析路徑，不能只增加 GLSL emission。反之，一般原生純函式不需要為了形式一致改寫這些地方。

這是跨階段一致性問題：程式可以成功產出 GLSL，卻還不能單憑這件事證明常數判定或依賴處理符合該節點的產品語意。本次沒有透過新增錯誤節點實驗重現缺陷，也沒有把此風險寫成現有節點已出錯。

## 容易漏掉的共用約定

以下是已查到的規則及其條件性風險，不是新產品要求，也不是宣告現有實作都有 bug。

| 約定 | 程式事實 | 對人類作者的具體負擔 |
|---|---|---|
| 型別重算的變更偵測 | `autoTopology` 明列 params 欄位；`resolveAutoEdit` 在新舊結果相同時提早返回 | 假設新增一個未列出的 `shapeMode`，它會改變接口，而且此次只改該欄位，這條重新規劃路徑就不會因它啟動。這是程式條件推論，未新增節點實測。[N16] |
| Auto 由程式分類啟用 | `supportsAutoType` 同時看 `nodeCategory`、例外清單與 selector；`instantiate` 可據此預設 `ui.typeMode = auto` | 作者不能僅以是否自己寫了 Auto 來判斷節點會不會自動變型。[N08][N22] |
| 選單分類與行為分類不同 | browser metadata 提供選單分類；`nodeCategory` 另有 key 判斷及 math fallback，包含 `_out` 結尾規則 | 改 browser category 不代表改了 Auto 適用性；選擇 key 名稱時也要注意既有慣例。[N10][N22] |
| 預設輸入值含端口名稱慣例 | 前後端一般 fallback 對 factor 使用 0.5、alpha 使用 1，其他通常為 0；另有矩陣等特殊路徑 | 有意義的預設值應明確核對，不能把接口命名當純展示文字。[N23][N24] |
| catalog 載入要求實作先存在 | import 核心時會載入並驗證 catalog，key 要在允許清單、revision hash 要吻合 | 先加 JSON 後尚未接上實作的中間狀態，可能讓 catalog 載入失敗；生成選單工具也會 import 核心。[N05][N10] |
| catalog 指紋的範圍有限 | revision hash 驗證 definition 資料內容；CALLS 變體與核心分支不在該 definition 本文內 | catalog 指紋一致不代表行為完整或 emitter 沒變；不能把這項檢查當所有責任已實作的證明。[N01][N05] |
| 一部分舊回歸測試按節點清單選取 | `test_type_contract.py` 以明列排除清單區分舊基準與新節點專項 | 非 CALLS 的新節點可能需同步調整舊案例的選取範圍；需保留原基準意義，不能直接更新期望雜湊消除失敗。[N25] |

## 完成新增的檢查範圍

以下整理自實作與既有測試所保護的行為，供作者判斷工作是否閉合。它不是本次新增的強制測試政策；新增何種證據應按節點風險決定，本次未執行這些測試。

| 完成項目 | 要能回答的問題 | 可參考的既有證據 |
|---|---|---|
| 身分與入口 | catalog 能載入？建立時拿到正確 definition、revision、defaults？選單可找到？ | catalog 與 browser metadata 檢查 [N26][N27] |
| 型別與模式 | 所宣告 variants、模式、Stage／target 在前端與後端一致？不合法組合是否適當拒絕？ | noise 與 Voronoi 測試 [N28][N29] |
| 輸入與互動 | 未接、手填、接上、拔線後的值是否一致？改型或模式是否沿用正確交易？適用的 Auto 與拉線新增是否正確？ | math 預設值、noise 的 JS 交易檢查及 change 實作 [N19][N28][N30] |
| 運算及分析 | 公式與所有 outputs 正確？常數資格、有效依賴、helper 重用及未使用節點處理符合預期？ | Voronoi 與核心分析 [N20][N29] |
| 文件生命週期 | 保存重載後身分、參數與產碼一致？適用的複製、History、subgraph 使用是否保留語意？ | 既有序列化案例與共用建立／交易入口；特殊新狀態仍需另核對 [N08][N19][N28][N30] |
| 真正交付 | 運行中 TD 載入了新來源？宣告支援的 target／Stage 實際可用？既有使用者圖與來源關係保留？ | 開發交付流程；靜態閱讀不能替代 native 驗證 [N11] |

「選單有了」「單一範例能產碼」「catalog 雜湊通過」各自只證明其中一部分。完成的關鍵是作者能說明上述每項由自己的程式或哪個既有共用機制承擔，並有與風險相稱的驗證。

## 對可維護性的判斷

**程式事實：** CALLS 描述表已集中一批節點的接口變體、呼叫、預設與常數資訊；型別契約也讓一般節點免於前後端各自寫完整型別表。新的動態或依賴語意則仍透過中央 key 分支、固定欄位與手動接入處理。

**工程判斷：** 人類仍可維護 Legacy，但新增特殊節點的作者需要接近核心維護者的知識。其負擔包括找出責任、辨認不同層的權威、理解哪些預設政策會生效，以及為自己的修改確認一個停止範圍。AI 能加速搜尋，卻不會讓這些責任自然集中，也不保證找齊。

**可由文件改善的部分：** 本篇的入口、路徑和條件性檢查可以減少考古成本。這不等於取得一般節點獨立交付能力；後者涉及實際能力邊界，已在主 review 第 5 節分析。本次不選擇架構改法、不改規格、不啟動 Slice。

**尚未證明的部分：** 人類實際新增節點所需時間、漏改率，以及 AI 與人類的維護品質差異，均無本次量測。不能把維護負擔直接換算為效率數字，也不能由此否定現有產品的使用價值。

## 原始碼與證據索引

以下連結定位本次閱讀來源；行號綁定前述版本。既有測試只作行為與維護範圍的證據，不表示本次執行通過。

[N01]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_legacy_nodes.py:17
[N02]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:108
[N03]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_legacy_nodes.py:286
[N04]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:604
[N05]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:284
[N06]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:701
[N07]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/graph_ui.js:564
[N08]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/functions_ui.js:229
[N09]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/library/node_catalog.json:4173
[N10]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/tools/build/sync_node_browser.py:10
[N11]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/docs/development/DEVELOPMENT.md:5
[N12]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:1517
[N13]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_voronoi.py:15
[N14]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:10
[N15]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/graph_ui.js:548
[N16]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/graph_ui.js:967
[N17]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/inspector.js:1197
[N18]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/td/source_files.json:2
[N19]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/app.js:333
[N20]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:1267
[N21]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/graph_ui.js:720
[N22]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/graph_ui.js:139
[N23]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_core.py:905
[N24]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/inspector.js:495
[N25]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/tests/unit/test_type_contract.py:20
[N26]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/tests/unit/test_catalog_contract.py:11
[N27]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/tests/integration/test_node_browser_metadata.py:17
[N28]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/tests/unit/test_noise_nodes.py:30
[N29]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/tests/unit/test_voronoi.py:14
[N30]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/tests/unit/test_math_catalog.py:22
[N31]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/library/node_catalog.json:52
[N32]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/docs/features/MATH.md:3
[N33]: /C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/core/sgrape_legacy_nodes.py:327
