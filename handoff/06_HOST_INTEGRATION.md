# Host integration：外部執行領域

## Host 可以做什麼，不代表它擁有什麼

Host 是具體 TD 實例或其他執行環境；Target 是其中接收 artifacts／控制項／原生操作的位置。它可以持有 active shader、runtime resources、實際 inputs、原生控制定義和執行狀態。**它不擁有 Grape canonical Graph、NodeType definitions、作品參數模型、application History 或 EditorContext。**

Host 存一份已套用 GraphDocument 是可選 persistence/integration 行為：那份資料是已交付版本，不能勝過目前 application 的未保存／invalid draft。重讀它必須走明確 reload/import 流程；Host 重啟也不能直接用同名 OP 替換目前 Graph。

Graph defaults 與 Host current values 是不同資料。Graph 的 Undo 不自動回捲動畫，Host Undo 也不擅改 Graph。NativeDefinitions 的「definition」指外部 page/control/source/row 的描述；不要跟 NodeType/DefinitionSet 混名。

**DEC-GRAPE-001（正式產品決策，IH-005 已納入）：** 協調式 Mixed History 延後。Ctrl+Z 依明確 command/editing domain，沒有 eligible domain 不作全局 fallback。Graph Undo先恢復canonical值，再由active Binding送一個新的conditional live write；authority/basis過期就標conflict/divergence，保留已完成Graph Undo。這不是Host history rewind，也不增加Graph entry。對應既有receipt/intent的basis不能因新readback而悄悄續權；高頻script/CHOP/expression/automation改值只更新runtime observation。LU-UI-009、receiving-side fence、load/epoch、CAS與所有原生authority保護仍適用。詳見05與08/09的分域驗收，不建立coordinator或hidden mode。

## 身分與權限

| 內容 | 規範 |
|---|---|
| TargetIdentity | `{hostId,targetId,incarnation}`；地址、OP path、label 只是 locator／顯示，不是 identity |
| BindingLease | `{bindingId,graphId,loadId,epoch}` 加對應 Target；reload/rebind/新授權都不能沿用舊有效期 |
| Discovery | 只產生候選與描述。Static Web 不承諾掃到本機／LAN；沒有provider仍可離線編輯 |
| Bootstrap | 攜預期identity／到期資訊；verify matching identity 不等於認證對方可信 |
| Authority | provider 決定 action/origin/credentials/size 等政策；UI 不可自行把 observed editable 變 true |
| Connection | 通訊session與request/reply；不決定Graph ownership，也不包辦全產品同步 |
| Capability negotiation | 列支援的publication、input description/write/subscription、native definitions、preview、window、dispatch等；可缺；缺能力明示unavailable |

Legacy credential 可選/default-off 行為已在相容資料中，不得未經產品決策偷偷變成完全不同的必填流程；但 credential-free 也不等於任何 locator 都能取得任何 action authority。遠端窗口、cross-manager adoption 的政策另受 Gate，不能由 transport 猜答案。

## Publication 協定責任

最小 delivery 包含 requestId、lease、intentSeq、expectedHostRevision，以及同次 generation demand 的 artifact/code/schema/document 和明確 resetSourceIds。這是資料契約，不指定 HTTP、WebSocket、IPC 或誰先開連線。

1. Binding 捕捉明確 Graph/Target 意圖。若 code cache 命中，仍是新的 delivery request/sequence。
2. Receiver 驗證 lease、payload、身份、request 去重、expected revision、source type/reset。
3. prepare 可非同步建立候選，不能更動 active artifact。編譯失敗回 retained，保留 last-good。
4. **真正 commit 前再驗** lease、序號、revision；在 Host 執行緒／序列區段取最新 current values，合併仍相容的ID/type，新source才用Graph default。
5. commit 後才返回 applied receipt/readback；cleanup failure 另報，不抹掉已成功receipt。

相同 requestId 重試只接受完全相同payload，不能藉去重偷偷換內容。同 code/schema 的 document-only delivery 仍有排序／receipt；它更新的是Host已交付副本，不代表canonical變更。code hash不是ACK。

| 結果 | 接收方／application 必須表達的意思 |
|---|---|
| applied | 該意圖已完整提交，帶原identity/basis及新host revision |
| retained / rejected | 候選失敗或前置不成立；沒有宣稱套用，保留可確認前狀態 |
| superseded | 較晚意圖已取代它，舊compile不可再發布 |
| indeterminate | commit可能已部分或全部發生，無足夠結果；停後續write，要求readback/recovery |

`indeterminate` 是誠實報告，不是降低「失敗保留原生資源」要求後自稱相容。真 TD rollback/readback Gate 必須在第一個相關I處理。Host receiver fence 也不能只以「前端忽略舊ACK」代替。

## Live inputs 與 native operations

Live field有id、shapeId、driverId、type、current value、writable、revision。寫入提交expected欄位；一組寫入要全部驗證後才執行，不能前半組成功。gesture seal產生自己的ValueReceipt；取消／Undo都重驗expected，不能覆蓋外部新值／新driver。Pulse是帶request identity的command，不是假裝bool可Undo。

Binding 的 InputMirror只作投影：snapshot可重新建立；delta必須baseRevision連續，schema/epoch不符忽略，缺段要求新snapshot。回報不能回送成新write形成echo。

NativeDefinitions plan/commit用provider回報的owner/editable/externalReferences守護外部權限；UI不能清掉這些欄位來繞過保護。source/control/page/row需一起驗shape與引用。只patch自己records，不還原其他人的row或動畫current values。old last-good仍引用的source可保留tombstone，不因draft刪除就破壞正在執行的資源。

原生操作經Host-affine queue：capacity滿回busy，未開始且逾期不做；client timeout不證明已開始的工作沒做。窗口、project-save、resource-select等作用設備要明確，Node server所在電腦不是自動等於使用者TD所在電腦。

## Preview、reconnect 與 readback

PreviewSession指定Target，保epoch/sequence/visibility/pointer origin；換identity清舊pointer/hold，才對新目標home。down/move/up須同gesture、有限正規化座標；hidden/stop釋放pressed狀態。舊capture或release不能影響新session。touch recognizer、encoder resize與真Panel控制各有驗收。

Preview／既有Target的值控制不要求先成功發布新shader。Target authority共用，但publication、inputs/native definitions、preview是可平行的能力支線。不要建立一個「Apply過一次才能操作所有Host功能」的隱含前提。

重連先確認instance/incarnation、能力和authority，重新建立session/epoch並readback。未ACK操作可能已發生；不能盲目重送Pulse、開窗或原生刪改。允許的Host-side changes只更新其領域的observation；若要影響document，轉成顯式模型命令／review，不直接寫Graph。

Host移除後，已產出shader／bindings是否獨立運行由TD/TOX證據決定，不從Reference的fake provider推定。解除Binding只清自己的通訊／授權／鏡像，不刪作品或使用者原生OP。

擴充範本：`examples/minimal-host-adapter/`。部署差異：`07_DEPLOYMENT_MODEL.md`。未決Gate：`10_KNOWN_GATES.md`；沒有在本文件選擇新transport或新增產品後端需求。

IH-003 的 capability registration 使用 [13](13_PRODUCTION_CONTRACT_SURFACE.md) 明定 namespaced identity 與 typed contract。原九種 ServiceName 是資格測試範圍，不是擴充上限；新增 ID 不授予 authority，也不改 Target/lease/receipt 的責任。
