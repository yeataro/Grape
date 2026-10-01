# Grape 核心 API 契約實驗

日期：2026-10-01。狀態：獨立 architecture experiment 的可實作契約，不是產品規格。本文與同目錄 TypeScript 原型共同限定保證範圍；不引用 legacy implementation。

本文承接 [ARCHITECTURE_EXPERIMENT.md](../ARCHITECTURE_EXPERIMENT.md)。原稿中的 C 決策繼續有效；本輪將仍有歧義的行為固定為 E 決策。API 是否成立以本輪實際驗證記錄為準，不以介面宣告存在當作功能通過。

## 1. 契約閱讀規則與範圍

這份契約的目的是：模型、節點模組、Editor、保存及 Generator 可以各自實作，組合時不必猜測其他模組的內部狀態。每項公開操作必須遵守 ownership、前置條件、後置條件、修改邊界、失敗、通知、身分與 Undo 八個面向。

本輪涵蓋 Graph／Stage、固定與動態接口 Node、Edge、Parameter、診斷、Undo／Redo、最小 GLSL、保存／載入、缺模組保留，以及兩個 EditorContext 共用圖。沒有將子圖、全部 GLSL 型別、真正宿主通訊或 DOM UI 偷塞入「已完成」範圍。

### 1.1 決策基線

| ID | 分類 | 契約 |
| --- | --- | --- |
| C01 | 已確認 | Graph 是模型資料的唯一持有者；Stage／Node／Edge 由 Graph 的集合持有。UI 不另保存一份模型。 |
| C02 | 已確認 | NodeType 是共用能力定義，Node 是圖中的實例；設定和接口的生成由 NodeType 提供。 |
| C03 | 已確認 | Parameter 是編輯入口；它不持有第二份值。Edge 端點始終可追溯 Node。 |
| C04 | 已確認 | Operation 分組使用者操作；History 復原；發布批次與產碼觸發不是同一件事。 |
| C05 | 已確認 | 錯誤圖可以保存；當前模型 Error 阻擋生成。Warning 不阻擋。 |
| C06 | 已確認 | EditorContext 的選取與導覽獨立；兩個 Context 可指向同一 Graph。 |
| E01 | 本輪實驗 | 未明傳 Operation 的單次寫入建立隱式 Operation，成功後立即提交。已有開放 Operation 時不擅自加入。 |
| E02 | 本輪修正 | 同步通知期間拒絕重入修改；不自動延後一個已返回的同步寫入。呼叫者可另排新的操作。 |
| E03 | 本輪實驗 | 先採完整資料快照復原。Undo 身分由穩定 ID／port key 定義，不由 JavaScript 物件參照定義。 |
| E04 | 本輪實驗 | 模組回呼只能取得唯讀資料；所有回傳資料皆經核心複製與檢查後才進入模型。 |
| E05 | 本輪實驗 | 可預期失敗與模組例外都必須在公開邊界有確定結果；不得留下部分修改或半次通知。 |
| E06 | 本輪實驗 | 缺模組的節點保留 opaque state、精確 type reference、最後接口快照、引用描述及未知欄位；不能假裝成另一個同名 NodeType。 |
| E07 | 本輪實驗 | 失敗的 Draft 被 poison；捕捉個別命令例外不能讓整批繼續提交。 |
| E08 | 本輪實驗 | Editor 的模型投影先於外部 change observers 更新，避免懸空 selection 被外界看到。 |
| E09 | 本輪實作選擇 | History 保存整張 Graph 的 before／after 快照，較原稿的受影響物件 memento 更粗；可逆語意不變，尚未證明大圖成本。 |
| E10 | 本輪實驗 | Context 提供修改與 Operation 轉呼叫，但不擁有第二份 Graph；有未結束 Graph Operation 時先拒絕關閉 Context。 |
| E11 | 驗證導致的修正 | 可編輯 float／向量值需可表示為有限 float32；僅檢查 JavaScript 有限值不足以保證最小 GLSL profile 的數值有效。 |

### 1.2 身分的三層

- 保存身分：Graph ID、Stage ID、Node ID、Edge ID、穩定 port key。保存與載入後不因重新建構物件而改變。
- 載入生命週期：同一保存身分被再次載入，是新的執行中實例。舊的 Graph／Node 包裝物件不能跨載入偷指向新物件。
- 資料版本：revision 是成功發布的順序，Undo／Redo 也向前增加。不能把 Undo 理解成 revision 倒退。

接口的邏輯身分為 `(nodeId, direction, key)`。模式切換移除 `out` 再由 Undo 恢復 `out`，恢復的是同一邏輯接口；不保證原 JavaScript 參照復活。查詢及 UI 應保存 Ref，使用時重新解析。

## 2. 第一組：物件與集合

### 2.1 唯一 ownership

| 資料／能力 | 唯一持有者 | 其他模組的權限 |
| --- | --- | --- |
| Graph 名稱、Stage 集合、所有持久模型資料 | Graph | 取得唯讀快照，透過寫入入口修改 |
| Stage 的 Node／Edge 集合 | Stage，生命週期由 Graph 控制 | 依 ID 或名字查詢，不可直接 push/splice |
| Node 設定、位置、Input 本地值 | Graph 中的 Node 記錄 | NodeType 描述結構；Parameter 提交修改請求 |
| NodeType 的能力及精確版本 | 固定定義集合 | Node 以精確引用使用，不能靜默升級 |
| 選取、主要選取與目前 Stage | EditorContext | 可共用同一 Graph，不能把 selection 寫進 Graph |
| 診斷內容 | 以當前模型推導的診斷集合 | UI 查詢內容並導出標記；不得獨立設定 hasError |
| 歷史快照 | Graph 的 History | Editor 呼叫 Undo／Redo，不直接改快照 |

### 2.2 Graph 與 Stage 建立

建立 Graph 必須一次取得可查詢、內部身分唯一的 Stage 集合。初始化不是一連串可被外界觀察的未完成修改。Graph 建構失敗時不發布半張圖，也不產生 Undo 項目。

| 面向 | 規範 |
| --- | --- |
| 前置條件 | Graph 名稱、kind 與固定定義集合有效；所需 Stage 種類可由本輪 profile 建立。 |
| 後置條件 | 每個 Stage 有穩定 ID／kind；Stage 中的集合可安全查詢。依 profile 要求建立必要邊界。 |
| 修改邊界 | 建構時一次完成；建構完成後所有持久修改經批次。 |
| 失敗 | 不回傳可編輯的半成品；不改 registry 或既有 Graph。 |
| 通知 | 初始化無一般 change 事件；訂閱者先取得初始 snapshot，再接收之後的事件。 |
| 身分／生命週期 | Graph 與其 Stage 的 ID 持續至卸載；同 ID 的 reload 是新執行實例。 |
| Undo | 建構本身不是 Graph 內歷史；後續 Node 建立則是可逆操作。 |

### 2.3 Node 建立、查詢、刪除

建立 Node 使用本 Graph 能解析的精確 NodeType。模組初始化回傳資料後，核心驗證設定、建立接口、檢查唯一名稱與 ID，再一起發布。新增 Node 不是先加入集合再補設定。

Node 查詢的名稱與 ID 入口必須分開。找不到回傳明確空結果；不能把 name 找不到改成 label 找到。查詢結果不可用普通物件 mutation 修改模型。

刪除 Node 同批移除其連線，清理受影響診斷，再發布一次模型事件。EditorContext 接到該事件後清理無法解析的 selection。正常刪除不是資料損失，因此不產生「模式更新拆線」的 Warning；Undo 同時恢復 Node、接口、本地值與連線。

必要邊界 Node 的普通刪除必須拒絕。Node 名稱、位置及設定的合法性由核心或模組各司其職；設定非法不得先儲存再等生成時才發現。

### 2.4 Edge 與 connection

接線檢查至少包含：端點存在、來源為 output、目標為 input、兩端同 Stage／Network、型別與允許的適配、Input 占用情況，以及新增循環。

`check` 的結果只是對當下狀態的觀察，不是之後免驗的通行證。真正接線時必須重驗；失敗時保留原線。替換已占用 Input 必須是明確選項，在同批拆舊接新；不能先斷舊線再失敗。

成功 Edge 保存可查詢的端點與適配；Input 至多一條有效進線，Output 可以有多條。跨 Stage 不以特殊 Edge 暫時繞過約束。本輪最小 profile 接受的型別／適配範圍必須由實作與驗證記錄明列。

### 2.5 EditorContext

本輪 EditorContext 建立時引用一個 Graph，初始 Stage 為 pixel。Context 可自行更改選取或切換 Stage，不產生 Graph revision、History 或 GLSL 失效。`context.change(...)`／`beginOperation(...)` 檢查 Context 仍有效後，轉呼叫同一 Graph API，不持有私有模型或第二份 History。完整子圖路徑導覽仍屬母文件的設計；本輪只實作 Stage 導覽。

兩個 Context A、B 指同一 Graph：A 的位置修改立即出現在 B 下一次讀取；A 的 selection 不改 B 的 selection。刪除 B 所選節點時，B 的 selection 必須清理；Undo 恢復模型不強迫恢復 UI selection。這是 UI 狀態獨立的結果，不是 Undo 漏資料。

Context dispose 只解除其订阅與執行中選取，不刪 Graph。已 dispose 的 Context 拒絕 selection、導覽及寫入轉呼叫；先前取得的 Graph 引用不因此失效，其他持有者仍可直接編輯 Graph。dispose 不是 Graph 授權撤銷機制。Graph 有開放 Operation 時，另一 Context 所發起的新寫入按單 writer 規則失敗，不合併到其他人的手勢。

**E10 的保守限制：**本輪沒有 Operation origin owner，因此只要該 Graph 還有開放 Operation，`dispose`／`Editor.close` 先回 BUSY，不自行 commit、cancel 或失去最後一個可完成手勢的入口。即使開放操作來自另一 Context，目前也採相同限制；這是首個原型的限制，不聲稱是產品最後的多視圖關閉政策。

## 3. 第二組：修改與通知

### 3.1 同步發布的完整順序

每個成功修改批次必須遵循：

1. 檢查 Graph 仍有效、Operation 身分與狀態、非重入通知及同步呼叫限制。
2. 複製可修改 draft，不向任何訂閱者曝露。
3. 執行命令；呼叫必要的模組 codec／接口 schema。
4. 依穩定 key 對齊接口、本地值及連線；保留拆除原因。
5. 驗證結構；計算當前診斷。
6. 一次替換已發布資料，增加 revision。
7. 通知訂閱者；此時每個讀取都只能看到完整的已發布狀態。

命令、接口、Edge、loss record、診斷不能分五次發布。批次與 callback 皆不可 `await`；Promise／thenable 回傳必須拒絕，不能讓外界在 draft 還活著時再改圖。

### 3.2 Parameter.write 與 Operation

Parameter 的 `read` 解析目前 target；`write` 驗證控制項值及 presentation clamp，然後呼叫模型的同一修改機制。Parameter 不擁有 currentValue。

- 未傳 Operation 且 Graph 無開放 Operation：等價於 begin → 一批 write → commit。一次有效修改對應最多一筆 Undo。
- 傳入本 Graph 的開放 Operation：寫入一批，不自動 commit；手勢控制者負責後续 commit／cancel。
- 未傳 Operation但 Graph 已有開放 Operation：拒絕，不猜測想加入誰。
- Operation 來自其他 Graph、已 commit／cancel：拒絕，不改資料。
- 目標已被動態接口變更移除：回傳無效 target，不把旧值寫去同位置的新接口。

顯式 Operation 可發布多批。commit 只關閉編輯並形成一筆 before／after 歷史；不再假造一次模型修改。cancel 若已發布修改，發布一個補償批次回到開始狀態；不留下 Undo 項目。失敗的單批不自動取消已成功的前幾批，呼叫者仍可修正後續輸入、commit 或 cancel。

`change` 事件保證模型批次已發布。**隱式 Operation 先記錄 History 並關閉 Operation，再發布 change；顯式 Operation 的 change 不代表已 commit。**依賴「整次操作完成」的通用呼叫者以 `commit`／隱式 write 的返回為界；不能把每個 change callback 當作手勢結束。本輪沒有實作 Updates 的 operation-end 排程器。

### 3.3 失敗層級

| 情況 | 模型結果 | 通知與歷史 |
| --- | --- | --- |
| 無效 token、占用、跨 Stage、重複 key、非法值、命令新增循環 | 整批拒絕，保持前一狀態 | 無 change、無新歷史 |
| 模組 callback 丟例外或回傳無法編碼的內容 | 整批拒絕，包裝成模組契約失敗；不能忽略 | 無 change、無新歷史 |
| 模式合法改變導致必要輸入缺失、原 Edge 不相容 | 可以發布 invalid draft；Error／Warning 必須可查詢 | 一次完整 change；正常可 Undo |
| 訂閱者在成功發布後丟例外 | 已發布修改仍成功；隔離該訂閱者，其他訂閱者仍取得事件 | 後續訂閱者仍收到同批；正常可 Undo |
| 生成失敗 | 不改圖，不覆寫模型歷史；回傳生成診斷 | 無模型 change、無新歷史 |

前兩列都不得增加模型 revision、Undo 項目或一般 change 通知；失敗回報供呼叫者展示。失敗批次不是一筆先做再 Undo 的操作。

### 3.4 通知不可重入

本輪將原稿「自動排到目前發布結束後」改為「同步重入拒絕」。反例是訂閱者呼叫 `write()`，它已回報成功但實際尚未執行；後來排程才遇到失效接口或已關閉 Operation，原呼叫者無從取得正確結果。

通知 callback 不得同步建立修改、Undo／Redo 或提交其他寫入。若需要由事件觸發新編輯，呼叫者在通知結束後發起一個新操作，並處理當時的失敗。純查詢和 selection 清理可以同步進行。

每個訂閱者看到同一批 revision 的完整狀態；一個訂閱者的錯誤不能阻止其他訂閱者。通知不構成模型 rollback 的可否決階段。

### 3.5 History

History 保存已提交 Operation 的整張 Graph before／after 模型快照；包含 Node state、接口值、Edge、適配及 loss records。這是比母文件「受影響物件 memento」更粗的實驗實作：先驗證恢復語意，不預先優化增量成本。UI selection、Context、訂閱者、revision、runtime handles 不在快照裡。

Undo／Redo 必須在沒有開放 Operation、沒有正在發布通知時執行。它們恢復資料後重新發布完整狀態，revision 向前增加；不呼叫原先的 UI callback，也不新增一筆普通歷史。新的有效編輯會使 redo 分支失效；查詢或沒有資料改變的操作不應切斷 redo。

若 Operation 先改 A→B、再改 B→A，外界可能已收到兩批，但 commit 的前後持久資料相等，無須新增 Undo 項目。這個「最後沒有淨改變」與「過程沒有發布」不同，不能刪掉已經發出的事件。相同值的單批則直接是 no-op，不增加 revision 或發布事件。

## 4. 第三組：節點模組

### 4.1 模組輸入與輸出

模組提供精確 NodeType 引用、初始化、state codec、接口描述、Parameter 描述、驗證及生成能力。固定接口節點與動態接口節點共用同一契約：固定節點回傳固定描述，動態節點以自己的已驗證設定推導描述。

核心不依節點名判斷 Swizzle／Multiply／Preview 的接口。動態模式的選項存入 Node state；UI 下拉選單只是操作該欄位的 Parameter。

模組 callback 不得直接改 Graph、登記新的全域型別、發通知或寫 History。輸入資料為唯讀快照；回傳資料先由核心複製與驗證，避免模組保留物件參照後悄悄變更模型。

### 4.2 接口更新的 stable-key 契約

同一 NodeType 內，key 是接口的穩定語意身分。label、排列次序或 UI 呈現不是 key。重排相同 key 時保留原本地值與 Edge，不按位置交換。

接口消失或型別不相容時，受影響 Edge 從有效集合移出，保存完整 loss record；對應 Warning 可查詢。若下游要求一定接入，另產生其 missing-input Error。模式切回不偷偷恢復歷史接線；Undo 才精確恢復那次修改前的資料。

同 key 型別改變時，舊本地值只有仍合法才可保留；否則依新 default，舊值與原因保留。新 default 本身非法屬於模組契約錯誤，整批拒絕；不能用零值掩蓋。

### 4.3 模組 state 與 references

state 必須能經 codec 完整 round-trip。本輪 JSON 狀態不接受 undefined、稀疏陣列、函式、循環物件、NaN／Infinity 或隱藏 class／handle。檢查要發生在資料進模型之前，而非保存時才失敗。JSON stringify 會把陣列洞轉成 null，不能用「最後能輸出 JSON」當作進入模型前的合法性證明。

state 可以自訂內容，但跨物件引用由核心 reference slots 表達。`referencesComplete` 為真表示模組承諾所有可追蹤引用都可列舉；核心不猜測普通字串是不是 Node ID。缺少此承諾的 opaque state 仍可原樣保存，但涉及安全 remap 的複製不能宣稱完整。

### 4.4 最小 GLSL generation

Generator 從固定 Graph snapshot 與固定定義集合工作，不讀 active EditorContext。生成前檢查整張圖的當前模型 Error；未接到輸出的非法節點也不能被裁掉後假裝合法。

同一 Node 的生成透過模組 callback 得到所需輸出，核心按依賴排序並組裝 Stage 結果。變數名稱由穩定身分分配，不能要求使用者名稱符合 GLSL。模組例外、missing module、缺輸出或接口型別不符都是確定的生成失敗，不返回看似成功的部分 shader。

最小文字生成、外部 GLSL 編譯器接受與 GPU 執行數值正確是三項不同證據；驗證記錄必須分開，不能以字串符合預期當作 GPU 已通過。

本輪 [generator.ts](generator.ts) 輸出獨立 GLSL ES 3.00：Vertex 是固定位置 scaffold，Pixel 由本輪 NodeModules 組裝。Graph 的 `td.top` 在此只提供作品形狀；產物沒有 TD 特定內建函式或綁定，不得把這個結果稱為已可載入 TD 的完整 TOP Shader。這正好驗證「Graph kind 與生成 backend 不必混為一個物件」，但尚未實作可選 GenerationProfile 集合。

## 5. 第四組：保存與引用

### 5.1 保存邊界

保存取得當前完整已發布狀態；開放 Operation 已發布的批次也是目前狀態，不能自動退回 Operation 起點。保存不自動 commit，不改 History，也不產生 Graph change。

作品文件包含格式版本、持久身分、kind、Stage、Node 核心欄位、state、接口本地值與快照、有效 Edge、loss records、精確模組引用與核心 references。Context 選取、runtime 訂閱、History、宿主即時值及執行中的 Operation 不進作品文件。

輸出應具有確定的資料語意；JSON 物件 key 排序、空白或行尾不是保存身分。缺模組保留的未知資料必須做到結構等價，不承諾字節完全一致。

### 5.2 載入

載入先解析文件包裝與身分唯一性，再解析精確 NodeType；不能按名稱偷偷換為最新版。組裝、接口恢復、Edge 檢查與診斷都在發布載入結果前完成。

語意不合法但結構可表示的 Graph 可以載入並附診斷；缺必要節點、缺模組或必接輸入不能因載入而自動捏造正確結果。無法解析成唯一物件集合的損毀文件必須明確拒絕或回傳 recovery 資料，不能默默丟掉一半再聲稱成功。

載入建立新的 runtime lifetime，保留持久 ID；History 為空、無開放 Operation、Context 由呼叫者另外建立。載入不廣播「新增每個 Node」的一連串半成品事件。

### 5.3 Missing module preservation

缺模組 Node 仍有核心位置、名稱、ID、最後接口與連線，因此可以被定位、移動、更名、刪除及保存。對模組 state 的 Parameter 寫入不可用，生成必須 Error。

opaque state 與未知欄位必須原樣保留其 JSON 語意。已知核心欄位的修改不應覆蓋 opaque 欄位。再提供精確模組後重新載入，可由該模組 codec 驗證、重建接口；不應需要使用者先放棄 opaque 資料。

| 操作 | 缺模組時的保證 |
| --- | --- |
| 移動／更名 | 可做，經正常批次，可 Undo |
| 刪除 | 可做，同批處理 Edge，可 Undo |
| 改模組專用 state | 拒絕，不能猜測 codec |
| 保存再載入 | 保留 state、ref、最後接口、未知欄位與可表示的 Edge |
| GLSL 生成 | 被 model Error 阻擋 |
| 引用 remap | 只在引用清單完整且操作有明確映射時承諾；本輪未實作的複製不得算通過 |

## 6. 關鍵反例與驗證門檻

| 反例 | 必須觀察到的結果 |
| --- | --- |
| 動態接口 callback 產生重複 key | 整批失敗；原 mode、接口、值、Edge、revision、History 全不變 |
| Parameter 引用的接口被另一批移除 | 舊 Parameter 寫入失敗，不能依順序寫到另一接口 |
| 拖曳三批後 cancel | 外界看過中間值；最後收到補償批次；沒有新的 Undo 項目 |
| Observer A 在 change 通知內寫入 | 該寫入被拒絕；Observer B 仍看到原批次的完整同一版本 |
| Observer A 丟例外 | 已提交修改保持成功，Observer B 仍收到通知 |
| 動態輸出型別改變 | 無法保留的 Edge 移出有效集合，loss record＋診斷同批可見；Undo 精確恢復 |
| 兩個 Context 同看一圖 | selection 互不影響；透過任一 Context 的模型寫入在另一個可見 |
| 缺模組載入→移動→保存→補模組載入 | opaque state 與未知資料保留；精確模組可重新辨識；未補前不能生成 |
| 改 Node 名稱 | 保存反映新名；產碼符號不因人用名稱非法而破壞 shader |
| 非同步 change callback | 明確拒絕，不留下等待中的可变 draft 或稍後補寫 |

## 7. 公開 API 與組合時的精確邊界

共享資料契約在 [contracts.ts](contracts.ts)。原型用小型 concrete API 實現上述角色，沒有假稱所有原稿 API 都已提供。這裡的 `TypeRef` 特指精確 NodeType 引用；完整 DataType 作用域、struct、陣列與矩陣不在這個型別別名內。

### 7.1 跨模組共用資料

```ts
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; message: string } };

interface TypeRef {
  moduleId: string;
  typeId: string;
  version: string;
  fingerprint: string;
}

interface ChangeEvent {
  kind: 'change' | 'cancel' | 'undo' | 'redo';
  revision: number;
  operationId: string | null;
  snapshot: Snapshot;
}
```

API 呼叫者應使用 `error.code` 分類，不 parse message。可失敗的修改、載入與生成入口回傳 Result；constructor／必須存在的 handle 解析可拋 `ApiError`，可選查詢則回傳空結果。同步批次內的 Draft mutator 以 `ApiError` 中止，最外層 `graph.change` 統一轉 Result。模組任意 exception 不外洩成半完成的命令。

**E07：失敗的 Draft 會被 poison。** 若 callback 先做一個非法 connect，再用 `try/catch` 吃掉例外繼續改名稱，整批仍須失敗。理由是命令不能因呼叫者是否記得重新 throw 而改變 rollback 保證。callback 自己丟的其他例外同樣拒絕整批。

Draft 的有效生命週期僅限 `graph.change` 同步 callback。保留 draft 後稍後呼叫、非同步 continuation、或 callback 返回後才用它，都必須失敗，不能更改已發布資料。

### 7.2 Registry 與固定 DefinitionSet

`Registry.register(module): Result<void>` 一次檢查整個 module：manifest、依賴、精確引用一致性、重複 type 身分、API version。全部通過才發布所有 types；任一項失敗時該 module 的任何 type 都不能查到。模組登記不是 Graph 編輯，不產生 Graph History 或 change。

`Registry.pin(refs?)` 取得固定解析視圖；`DefinitionSet.resolve(ref)` 只以四個精確身分欄位解析。缺 ref 回傳 undefined；不改查最新版或相同 typeId。Graph 持有此視圖；之後 registry 新增模組不能自動補全已載入 Graph。恢復缺模組的本輪路徑是用完整 registry 重新載入同一份文件。

註冊成功後不能透過修改原先的 `module.types` 陣列或 ref 物件改變登記內容。函式 callback 的 closure 仍是可信程式，原型不宣稱能隔離恶意模組。

### 7.3 Graph／Stage／Node 查詢

```ts
new Graph({ name, definitions, outputType });
graph.stage('vertex' | 'pixel');
stage.nodes;
stage.node(name);
graph.nodeById(id);
graph.snapshot();
graph.subscribe(observer);
```

本輪 Graph 建構固定 `td.top`，建立 default Vertex Stage 與 network Pixel Stage；`outputType` 是必要 Pixel boundary 的精確 NodeType。這是最小 profile 範圍，不是把原架構的 MAT／ISF 刪掉。

`stage.nodes` 與各 getter 是唯讀視圖；不是可直接修改的內部陣列。`snapshot` 包含完整持久 document、revision、loadId、diagnostics、固定 definitions。snapshot 可獨立交給 Generator；後續 Graph 更改不改舊 snapshot。

`subscribe` 訂閱未來已發布事件，不補發初始狀態；呼叫者先 snapshot 再訂閱時，兩個同步呼叫之間不可擅自插入异步 gap。回傳的解除訂閱能力可重複呼叫；解除後不得收到未來批次。

Node／Port 包裝物件以 Graph lifetime＋穩定身分解析目前資料。讀者不得把一次得到的 NodeRecord 當成持續更新的可變物件；重新查詢才代表最新資料。跨 Graph 或跨 loadId 使用 handle 必須拒絕，即使字面 nodeId 恰好相同。

本輪公開查詢名稱為 `node.record / state / name / position / type`，`type` 是解析到的能力物件，缺模組時為 undefined；`node.input(key)`、`node.output(key)` 回傳 `Port` handle，`port.exists`／`port.spec` 判斷目前是否仍存在。Parameter 入口是 `node.parameter(key)`、`node.parameters` 及 `port.parameters`；handle 可以先存在，但實際讀寫必須重新解析當前 schema，不能保留過時 ParameterSpec。

Editor 的公開生命週期為 `editor.open(graph) → EditorContext`、`editor.close(contextId) → Result<void>`；`editor.contexts` 是唯讀清單。Context 提供 `activeStage`、`stageId`、`selection`、`disposed`、`navigateStage(kind)`、`select(ids, primary?)`、`change`、`beginOperation`、`dispose`。selection 只能指向當前 Stage 內 Node；非空選取必須有在集合內的 primary，省略時取最後一項；重複 ID 拒絕。切 Stage 清空 selection，且有開放 Operation 時先回 BUSY。`CanvasView` 另持有 `{x,y,zoom}`，不寫進 Graph 或 Context 的模型歷史。

### 7.4 修改入口的對照

```ts
graph.beginOperation(label): Result<Operation>;
graph.change(label, callback, operation?): Result<T>;
```

callback 取得 Draft。公開命令是 `createNode`、`setState`、`setInput`、`rename`、`move`、`removeNode`、`connect`、`disconnect`。所有命令都只修改 draft；只有 `graph.change` 可發布。這比原稿的 `pixel.createNode(...)` 更明確：公開 read model 與批次 command surface 分開，而不是讓每個集合自己決定交易邊界。

`createNode` 與 `connect` 回傳新 ID 字串，其餘 mutator 回傳 void。callback 可回傳這些 ID，形成 `Result<T>`；不回傳 draft 內部可變 NodeRecord。`Operation.commit()`／`cancel()`、`history.undo()`／`redo()` 皆回傳 `Result<void>`。建立後同批接線可用綁定該 Graph lifetime 的 `Port` 邏輯 handle，真正解析發生在 Draft 裡，因此不要求新 Node 已先發布到 Graph。

| 操作 | 前置條件 | 成功後資料與身分 | 失敗／Undo／通知 |
| --- | --- | --- | --- |
| `createNode(stageId, typeRef, args, name?)` | Stage 存在、type 在固定集合、Stage 可用、args codec 合法、name 唯一 | 建立新 Node ID、設定與全部接口；不把模組資料參照直接存入 | 初始化／schema 失敗整批拒絕；隨 batch 通知；Undo 刪除，Redo 恢復同 ID |
| `setState(nodeId, state)` | Node 存在且定義可用，state 可編碼 | 依完整新 state 重建接口，按穩定 key reconcile 值與 Edge | 非法 schema 拒絕；合法但拆線可发布並記診斷；Undo 完整恢復 |
| `setInput(nodeId, key, value)` | 目前 Input 存在、具有 local supply、值符合 GLSL 值型別 | 只改本地值；有 Edge 時不斷線，也不覆蓋上游資料 | 型別非法拒絕；batch／history 正常；不套 Parameter UI clamp |
| `rename(nodeId, name)` | Node 存在，name 正規化後非空、無路徑分隔符且在 Stage 唯一 | ID、port key、Edge 不變；只改可讀名稱 | 衝突拒絕；可 Undo；合法名稱不需符合 GLSL 識別字 |
| `move(nodeId, position)` | Node 存在、位置為有限數值對 | ID 與所有計算內容不變 | 非有限數值拒絕；正常 batch；可 Undo |
| `removeNode(nodeId)` | Node 存在且不是 protected boundary | Node 與其相關 Edge 同批移除 | protected 拒絕；Undo 恢復同身分及連線；投影先清理選取 |
| `connect(from, to, {replace?})` | 同 lifetime、同 Stage，合法方向型別，目標未占用或明確 replace，無新循環 | 建立新 Edge ID，保存適配；replace 同批移除舊線 | 任一失敗保留舊線；Undo 恢復原集合 |
| `disconnect(edgeId)` | Edge 存在於本 Graph 的有效集合 | 移除一條 Edge，本地值仍保留 | 失效 ID 拒絕；可 Undo；required Input 可能产生 Error 但不阻止斷線 |

以上 mutation boundary 都是整個外層 batch；同一 callback 內先建立 Node 再接線，若後者失敗，Node 也不能殘留。

### 7.5 Parameter 的公開寫入契約

`ParameterSpec.target` 只描述 `{kind:'state', key}` 或 `{kind:'input', key}`。Parameter 包裝物件的 owner 是 Node；實际 value 仍在 Node state 或 Input 本地值。對 state key 的寫入先合成新完整 state，再走 `setState`，因此動態接口與接線處理不會被 Parameter 繞過。

AB-001 的 presentation 原先僅 `number | menu`。Qualification 的 PF-01 反例證實它無法表達 bool/color/matrix 或模組 widget，現追加 `{widget, options?, fallback?: 'auto'|'none'}` 純資料描述；兩個字串保留為 `core.number/core.menu` 的簡寫。style 不是 GLSL type，Widget registry 不控制資料合法性，缺失／不相容可安全fallback或唯讀。詳見 `PRESENTATION_QUALIFICATION_CONTRACTS.md`。min/max/clamp 保持既有純量數值行為；NumberParameter 的 UI clamp 不等於 GLSL clamp，直接 Draft.setInput 應允許型別合法但超過 UI 範圍的數值。Menu 的合法選項由模組 state codec 驗證，不能只因它是整數就接受不存在的模式。

資料型別驗證另外要求：int 落在有號 32-bit 整數範圍；float 與 vec2／vec3／vec4 的每個分量須是數字，且 `Math.fround(value)` 仍為有限值；向量長度固定、不可有空洞。一般 JSON metadata 的有限 number 不全部強制 float32，因為它未必代表 Shader 值。這項限制由真實 GLSL 數值溢位反例補上，不能只靠 Number.isFinite 宣稱可安全生成。

### 7.6 內部投影與外部通知

**E08：模型通知分為兩個固定順序，不依碰巧的訂閱先後。** Graph 提供給 Editor 的 `registerProjection` 先處理選取清理；接著才呼叫一般 `subscribe` 外部 observers。投影 hook 只維護可推導的 Context 狀態，不得寫 Graph。

原因：若刪除節點的外部 observer 先執行，它會查到「Node 已不存在，但 Context 還選著它」；把 Editor 單純當一個普通 listener 無法保證一致性。兩階段只解決由 Graph change 引發的投影同步，不代表 UI render 已在同一呼叫內完成。

模型資料與診斷先發布，再清理相關 Context selection，再通知外部 observers。訂閱者因此可同時查模型與 Context，而不遇到已知可清理的懸空選取。

### 7.7 保存的非同步完成

```ts
graph.exportJSON();
graph.save(adapter);
Graph.load(text, registry): Result<Graph>;

interface StorageAdapter {
  write(text: string): Promise<void>;
  read(): Promise<string>;
}
```

`exportJSON` 是同步捕捉現在；不經檔案系統、不改 dirty。`save` 回傳 `Promise<Result<{revision:number}>>`，先同步捕捉 revision 與資料，再 await adapter.write。寫完只將該份內容設為已保存基準；若現在內容不同，Graph 仍是 dirty。若在途中改動又恢復到完全相同的內容，dirty 可以為 false，即使 revision 已增加；這是內容是否保存與通知順序的區別。write reject 不改已保存記號、不吞例外當成功、不取消圖上的新操作。同一 Graph 同時只接受一個進行中的 save，第二個回 `SAVE_BUSY`，避免寫入完成次序混淆保存基準。

StorageAdapter 的完成表示文字已由該 adapter 接受保存；崩潰一致性、原子磁碟替換、雲端耐久性要由 adapter 本身提供證據。本輪記憶體或暫存檔 adapter 的通過不能變成正式儲存平台保證。

## 8. 明確未覆蓋的 API 與判讀證據

本輪不實作完整圖集合管理、模組升級 migration、所有 Scope／DataType、Shared Subgraph、Host Binding、Updates 排程、深複製、資源 GC、真實 DOM 或遠端協作。這些在母文件仍有設計，但不列入核心原型已完成清單。

本輪 codec 只做可驗證 JSON state，沒有 binary encode／decode 擴充鉤子；不是宣稱任意 class 都能保存。Reference 目前只容納原型需要的 node／resource，不代表取消來源或子圖引用。

驗證若發現本文 API 前後條件不成立，必須記錄反例並更新設計、契約與實作；不把失敗預期直接改成現有行為來換取綠燈。實際測試、失敗及修正以同目錄的實驗紀錄與可重跑測試輸出為準。閱讀本文只能確認定義了什麼，不能單獨確認它已經執行通過。

## 9. 串起四組契約的最小呼叫示意

這段使用原型公開 API 說明責任流向，並包含最小斷言；更完整的可重跑斷言另在 tests。`must` 只是呼叫者選擇如何處理 Result，不是核心偷偷吞掉錯誤。

```ts
import { Registry, Graph, Port, Editor } from './core.ts';
import { builtinModule, refs } from './nodes.ts';
import { generate } from './generator.ts';
import type { Result } from './contracts.ts';

const must = <T>(result: Result<T>): T => {
  if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
  return result.value;
};

const registry = new Registry();
must(registry.register(builtinModule));
const graph = new Graph({
  name: 'CoreExperiment',
  definitions: registry.pin(),
  outputType: refs.output,
});
const pixel = graph.stage('pixel');
const output = pixel.node('output')!;

const ids = must(graph.change('Create and connect', draft => {
  const value = draft.createNode(pixel.id, refs.constant, { value: 0.25 }, 'value');
  const multiply = draft.createNode(pixel.id, refs.multiply, {}, 'multiply');
  const color = draft.createNode(pixel.id, refs.compose, { mode: 'color' }, 'color');
  draft.setInput(multiply, 'b', 2);
  draft.connect(new Port(graph, value, 'output', 'out'), new Port(graph, multiply, 'input', 'a'));
  draft.connect(new Port(graph, multiply, 'output', 'out'), new Port(graph, color, 'input', 'r'));
  draft.connect(new Port(graph, color, 'output', 'out'), output.input('color'));
  return { value, multiply, color };
}));

const editor = new Editor();
const left = editor.open(graph);
const right = editor.open(graph);
must(left.select([ids.value]));
must(right.select([ids.color]));
if (left.selection.primary === right.selection.primary) throw new Error('Selections leaked across Contexts');
must(left.change('Move shared model', draft => draft.move(ids.value, [20, 10])));
if (right.graph.nodeById(ids.value)!.position[0] !== 20) throw new Error('Contexts do not share model state');
const shader = must(generate(graph.snapshot()));

// mode 改變會讓 vec4 → vec2；不合法的下游接線同批移除並產生診斷。
must(graph.nodeById(ids.color)!.parameter('mode').write('pair'));
const blockedGeneration = generate(graph.snapshot()); // 預期失敗；圖仍可保存。
if (blockedGeneration.ok) throw new Error('Invalid downstream connection did not block generation');
const invalidDraftText = graph.exportJSON();
must(graph.history.undo()); // 精確恢復 mode、接口、本地值與被移除的 Edge。
const restored = must(generate(graph.snapshot()));

const saved = graph.exportJSON();
const reloaded = must(Graph.load(saved, registry));
const missingModules = must(Graph.load(saved, new Registry()));
if (generate(missingModules.snapshot()).ok) throw new Error('Missing module did not block generation');
must(missingModules.change('Move opaque node', draft => draft.move(ids.color, [40, 20])));
const preserved = missingModules.exportJSON(); // 模組內容仍在，生成則阻擋。
const recovered = must(Graph.load(preserved, registry));
must(generate(recovered.snapshot()));
if (recovered.nodeById(ids.color)!.position[0] !== 40) throw new Error('Opaque node movement was lost');
```

在上述流程中，Editor 不產碼也不保存；Generator 不修改圖；Graph 不認識色盤或 DOM；NodeType 不寫 History。動態接口的設定、拆線和診斷透過同一 batch 組合起來，Undo 恢復的是模型，不靠把 UI 下拉式選單再操作一次。

本段範例於 2026-10-01 以 Node v25.5.0 的 TypeScript 執行模式實際執行，exit code 0；這只證明範例的公開 API 呼叫與明列斷言可走通。它不代替 TypeScript 靜態檢查、完整測試套件或 GLSL 編譯。可在本目錄重跑：

```powershell
$sample = [regex]::Match((Get-Content -Encoding UTF8 -Raw -LiteralPath 'CORE_API_CONTRACTS.md'), '(?s)## 9\..*?```ts\r?\n(.*?)```').Groups[1].Value
if (-not $sample) { throw 'Missing documentation sample' }
$sample | node --input-type=module-typescript
```

## 10. AC-001：可注入的 IdentitySource（基線後擴充）

AB-001 保留原有 52 測試及 Node 執行證據；純瀏覽器原生 ESM 載入卻因 `node:crypto` 失敗。這不是 Legacy Capability，也不是產品需求變更，是新增三部署約束揭露的架構缺口 DEP-IMPORT-01。

`IdentitySource.newId(): string` 是 bootstrap 提供的運行能力。Graph constructor 可接 `identity`，`Graph.load(text,registry,{identity})` 可提供同一能力；預設 adapter 使用標準 Web Crypto。平台若沒有此能力，必須注入相容實作，不改 core import，也不回退到可能重複的時間戳或 Math.random。

- ownership：bootstrap 持有服務實作；Graph 捕捉穩定函式能力，Draft／Context 從此取得 ID。服務不是 GraphDocument 的資料。
- precondition：newId 同步回傳非空、跨其服務範圍唯一的字串；正式 adapter 預設 UUID。它不是通訊認證 token 來源。
- postcondition：所有既有 ID／port key／loadId 規則保持。載入保留持久 ID，但配置新的 loadId。constructor 檢查持久 ID 重複，失敗不發布 Graph。
- mutation boundary：在私有建構或 Draft 階段配號；失敗的批次可以消耗 ID，不能回收後重新配給另一物件。
- failure：服務缺失、非法回值或例外導致 constructor／Result 寫入邊界失敗；不留下半張模型。服務提供的跨實例唯一性仍是契約前提，有限測試不能證明所有外掛服務永不重複。
- notification：配號本身不發模型事件；成功批次才有原有通知。
- identity／lifetime：服務不隨保存還原，不進 History；Undo 還原原 ID，不重新問服務配號。
- undo／redo：原有完整 memento 與邏輯引用不變。呼叫者事後替換服務 descriptor 的 method 不會重新綁定已開啟的 Graph。

本輪新增 DEP01–DEP04 回歸；純靜態 ESM 載入及核心操作另由 `architecture-coverage/probes/portability.mjs` 在真實瀏覽器執行。Electron 實際打包仍未驗證，不能由此推論全部 Electron 能力已成立。
