# 操作與唯讀投影的資格契約

此文件補充本輪 Coverage Qualification，不修改 AB-001、legacy 或正式產品。實作：`qualification-actions.ts`；案例：`tests/qualification-actions.test.ts`。介面以可替換的 layout algorithm、tokenizer、Help resolver、DocumentOutput provider 組合，沒有用 Legacy Capability ID 驅動程式分支。

## 已確認與本輪補充

已確認的責任保持不變：Graph 是模型與 History 的 owner；EditorContext 保存自己的選取／所在 network；UI 是查詢與命令入口；部署能力經 provider 注入。這輪補充以下實驗決策：

- `AutoLayout` 先產生唯讀提案，再由 EditorContext 一次提交所有 position。布局算法不能直接操作 Graph。
- `CodeProjection` 輸出完整文字及文字 token，沒有 HTML 或可執行內容。
- `HelpView` 依 subject kind 登錄 resolver；query 帶 context、stage、locale、不可變 snapshot。Help 不是 Node 的持久欄位，也不是程式碼查看器的別名。
- `SnapshotDownload` 使用 `DocumentOutput` 交付一次捕捉的完整 bytes；下載成功不等同保存回目前 Graph 的來源，因此不清 dirty。檔名由 `DocumentNaming` 策略提供，預設策略處理本原型兩種圖，不把宿主寫進核心 transport。

## AutoLayout

| 邊界 | 契約 |
|---|---|
| Ownership | UI geometry provider 擁有實際卡片寬高與 geometryRevision；算法只讀 LayoutInput；planner 擁有暫態 proposal；Graph 擁有 positions／History。|
| Precondition | Context 有效、至少兩個選取 node、NetworkLayoutTarget 能解析目前 scope、選取卡片尺寸為正有限數。geometryRevision 由 UI 在尺寸／布局度量變化時更新。|
| Proposal | 捕捉 graphId/loadId/revision/contextId/stageId/network occurrence path/navigationRevision/resourceId/selection/geometryRevision；輸入包含真實 ports 順序、內部 edges、尺寸與 graph order。算法輸出只能包含每個選取 node 恰一次及有限座標，不得改 edge 或其他 node。|
| Mutation boundary | propose 無模型修改；apply 必須是同 planner 發出的原始未消耗提案，所有捕捉條件仍一致才呼叫一次 context.change。所有 position 在同一 Graph transaction 發布。|
| Failure | 過期／偽造／重送已成功提案／尺寸缺失／算法輸出不完整／算法嘗試改 frozen input → 明確錯誤，零 Graph mutation。Graph busy 等錯誤沿用核心失敗結果。|
| Notification | propose 無通知。apply 完成全部位置後才有 Graph change，訂閱者不會看到只搬了一半。|
| Identity/lifetime | proposal 是 session 內不可持久化的計畫，不允許複製 JSON 後拿來當操作授權。Graph reload、Context 改變、selection 或 geometry 改變使舊 proposal 不可套用。|
| Undo/Redo | 一次成功 apply 對應一筆 Graph History；Undo／Redo 只還原該交易模型，不回捲 context selection／camera。|

`rankedLayout` 是可替換的示範算法：先做 SCC，再對有向無環群組排行，按真實尺寸配置欄距與列距；weak components 分區、孤立節點置後；reverse 改排行方向但不改 edges。output port 順序與 graph order 是穩定排序資料。AQ01/08 證明 cycle、不等尺寸、port-order、reverse 等輸入可以由這個邊界處理。沒有承諾這是最終美學布局、全產品每種卡片實測或大型圖效能。

追加決策 AC-ACTIONS-01：`NetworkLayoutTarget` 提供 `capture(context)`、`validate(context,capture)` 與 `apply(context,capture,positions)`。AutoLayout 算法不判斷根／巢狀，也不另建 Graph。RootNetworkLayoutTarget 是預設；NestedNetworkLayoutTarget 用既有 NestedNetworkEditorQualification.inspectPath/resolvedNodes 取得 scope 與真正推導的 ports，透過 Graph resource 的單一 transaction 寫回定義節點位置。自定義 adapter 也必須遵守同一捕捉與提交邊界。

**與先前方案的差異：** root-only 拒絕巢狀 scope 無法保留一般編輯能力，因此改為可注入 scoped target。另一項 experimental policy 是縮限「所有 library 編輯皆 fork」：position-only 修改 Graph 內已持有副本的視覺資料，保持 library scope／origin，不改外部 library 資產；兩個 occurrence 共用該副本的位置。semantic parameter 等內容編輯仍使用既有 forkLibraryDefinition，第一次 fork 後所有相關 callers 指向同份 local 定義。這不是第二份 UI graph 或偷偷共用外部庫的可變物件。

舊 geometry proposal 捕捉 definition identity、Graph revision、完整 occurrence path 與 navigationRevision；semantic fork、刪除 occurrence、離開又回到相同 path 皆令它失效。AQ10/11 驗證同定義兩次引用的位置同步，但兩個 Context 的主要選取與路徑独立；position transaction 單步 Undo，library semantic fork 不會讓舊提案誤寫新定義。

## CodeProjection 與 HelpView

| 操作 | Ownership / guards / mutation / failure / lifetime |
|---|---|
| register tokenizer | CodeProjection registry 以 language ID 管理可替換 tokenizer；重複 ID 拒絕。registry 不屬 Graph。|
| project code | 輸入不可修改字串；token spans 必須完整、依序且不重疊分割原字串。結果只含 `{kind,text}`，join 必須等於原文；不回傳 HTML。未知 language 回 plain token；壞分割回錯，不發不完整內容。|
| render code | renderer 必須使用文字 API（例如 textContent）呈現 token，不能將 text 當 HTML。此輪沒有真 DOM renderer；AQ04 只證明投影資料本身的邊界。文字捲動、選取、完整 GLSL 語法分類仍是後續產品驗證。|
| register Help resolver | HelpView 依 subject.kind 管理 resolver；可新增非 node 對象而不改 Graph 或 core 的分支。resolver 得到 subject ID、context、stage、locale 及 snapshot，回 plain text。|
| show Help | 新請求先清目前投影；只有 request 順序、context lifetime、Graph load/revision、stage 及 object selection 仍一致才能發布結果。完成後 getter 仍檢查 context，狀態已換就回 null。不同 HelpView 實例各自管理請求序。|
| Help failure | 沒有 resolver → HELP_UNAVAILABLE；內容不是文字 → HELP_CONTENT；舊結果 → STALE_HELP；resolver 錯誤 → HELP_FAILED。舊回覆不能清除／覆蓋更新請求的結果。不得藉顯示 Help 建立 Source 或 Graph history。|

兩種投影皆不修改模型、不持久化內容、不進 Undo； UI 可重建。Help 的各種正式內容與國際化資料仍需模組提供，這轮不硬編完整產品 Help catalog。query亦帶networkPath/scopeId/navigationRevision；即使不同occurrence內的node ID相同、Graph沒有修改，也不能把前一scope的Help顯示在後一scope。產碼 demand 的 stale guard 由既有 Workspace/Updates 負責；tokenizer 只接其接受的文字，兩者責任分開。

## SnapshotDownload / DocumentOutput

`DocumentOutput.deliver(packet)` 接收 `{requestId,graphId,loadId,revision,filename,mediaType,bytes}`。這是檔案輸出能力，不是 host connection，不預設 Node filesystem、Electron IPC 或 browser download 實作。

| 面向 | 契約 |
|---|---|
| Ownership | Graph 擁有文件；SnapshotDownload 擁有本次快照與 request；DocumentOutput 擁有實際交付／取消操作；檔名策略只讀 GraphDocument。|
| Precondition | 可以取得當下模型 snapshot。允許帶 Graph diagnostics errors 的文件；保存／輸出草稿不等於可產碼。filename 是單一名稱，不能是路徑。|
| Postcondition | provider 收到一次捕捉的完整 JSON UTF-8 bytes、同 snapshot 的 identity/revision 和檔名。等待期間 Graph 再修改也不改已交付 payload。|
| Mutation boundary | 首次 await 前完成 snapshot、name、bytes。此服務不呼叫 Graph.save、不寫 Graph saved marker、不改 History、Target 或 Sources。|
| Failure | 命名策略、provider 失敗或未知回執 → OUTPUT_FAILED，Graph 不變；cancelled 是明確結果，不等於已交付。delivered 只承認 provider 已接受交付，不推論使用者已永久寫盤。|
| Notification | 以本次 request 的 Promise 結果回報交付／取消；沒有 Graph change。不可用成功下載通知回寫較新的 Graph saved 狀態。|
| Identity/lifetime | 每次呼叫獨立 request、snapshot、bytes；回執 revision 指本次捕捉，不冒充完成時最新 revision。沒有重啟去重或持久下載佇列承諾。|
| Undo/Redo | 輸出是外部動作，不進 Graph Undo；Graph dirty 狀態始終不受交付成敗影響。|

Static Web 可提供 browser output adapter；Node hosted 必須區分伺服器存檔和交付使用者；Electron 可提供受限檔案 bridge。此次只執行 fake DocumentOutput，未聲稱 browser dialog、filesystem、權限或封裝三種 runtime 已驗證。

## 真正執行的反例與驗證

- AF01 / AQ03：原先只檢查 revision/context，複製並改造 proposal.positions 就能移動未選節點；實際紅燈。改為 planner-issued、不可變、一次成功後消耗的 proposal，並驗 geometry/network scope。
- AF02 / AQ05：過期 Help 請求拒絕了結果，但既有內容仍指向前個對象；實際紅燈。新請求清投影，成功後 getter 仍檢查 context 有效性。
- AF03 / AQ12：不同nested occurrence內同local node ID，Graph revision/stage/selection都相同，原Help guard誤接受舊回覆；實際紅燈。改驗scopeId/navigationRevision，query附networkPath。證據：`actions-help-scope-red-tests.txt`。
- `actions-nested-red-tests.txt` 是最初測試fixture漏掉required input boundary導致初始化失敗，屬fixture修正，不是通過任何行為斷言或架構反例。
- 紅燈：`architecture-coverage/qualification/actions-red-tests.txt`（7 例、2 失敗）。修正後 AQ01–12 皆通過，見 `actions-final-tests.txt`；完整 phase 回歸由根任務統一記錄，此輪 `actions-regression.txt` 是當時 186/186，typecheck亦通過。

檔案 `actions-analysis.json` 提供四項 capability 的精確新增案例及剩餘驗證，未替整份產品宣稱全覆蓋。
