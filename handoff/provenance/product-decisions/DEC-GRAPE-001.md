# DEC-GRAPE-001 — 延後協調式跨領域 Undo

**正式 Product Decision · ACCEPTED · DEFER · 由產品 owner 在本次請求直接裁定。**

適用目前初期產品／release 的 S08、S09 範圍，直到另一項明確產品決策取代。不是永久取消，不宣稱 LC-UI-100 已覆蓋，也不是正式實作授權。本決策在外部生效；IH-004 / AC-002 / IR-001 / CQ-001 / MRDP-001 保持封存。

機器真值：[DEC-GRAPE-001.json](DEC-GRAPE-001.json)。其中記錄來源、affected IDs、before/after、scope delta、保留義務與可實作的 acceptance cases。開工時引用資料：[state-patch](DEC-GRAPE-001.state-patch.json)。目前沒有產品測試結果可以替代所列驗收。

## 決策與理由

Graph History 記錄 canonical product/document state 的 semantic editing transactions。Host actual/live values 是外部 runtime state；script、CHOP、expression、OSC/MIDI、automation 等高頻改值不是 Grape 使用者編輯意圖。觀察到有效狀態改變，不代表可以由 Graph Ctrl+Z 逐條倒轉。

把 runtime stream 合併進全局時間線，會使 Graph 編輯被低語意記錄淹沒，並引入不必要的 memory、receipt、同步與衝突成本。在尚未定義哪些跨域操作具有 user-intent-level Undo 語意前，**初期產品只提供 domain-separated Undo**。

拒絕方案：永久刪除 Legacy oracle；把獨立 History 當成已完成 mixed coordination；透過 hidden flag/partial coordinator 保留混合模式；因 defer 一併移除 authority、receipt 或 lifetime guard。

## 正式產品行為

1. **明確 dispatch。** Canvas 與已提交 Inspector model edit 使用 Graph History；Host runtime/live control 使用其 Host/live History。Panel 只是入口，不取得 History ownership。無 eligible domain、該 domain 不支援 Undo 或已無步驟時，不 fallback 到最近全局操作。未提交 field draft/text/IME 先遵循本地編輯語意；只有成功 commit 才形成模型 History。
2. **Graph Undo 先完成模型恢復。** 沿既有唯一 mutation／History 邊界還原 canonical value，revision 向前，發布一致 projection。若有 active Binding，恢復值作為一個**新的 conditional live write** 嘗試送往 Host。沒有 active Binding 時只有模型恢復。
3. **傳播與模型 Undo 分域完成。** live write 不新增 Graph History entry，不重播舊 receipt、不 rewind native History。有效的 Target/lease/load/epoch、field identity/shape/driver 和 expected basis 仍是前置條件。Binding 依其適用的既有 intent/receipt 判定 conditional basis；runtime mirror 最新值本身不授予 Undo 覆蓋外部變更的權利。缺乏可用 basis、權限、連線或能力時明示不可寫；Host 狀態未知時維持 indeterminate/recovery 規則，不能假造成功。這些 runtime 憑據仍由 Binding／Host domain 持有，不搬進 Graph History。
4. **conflict 不補償 Graph。** 外部動畫、控制、TD Undo 或改值使 expected basis 失效時，拒絕覆蓋 actual value，標記 conflict/divergence；已完成的 Graph Undo 不撤銷、不等待 Host 成功才推進 Graph cursor。不得為了使 Undo 成功而悄悄採用新 readback basis 重試。Graph/default 與 actual 可以不同；Binding 應顯示這項差異。
5. **Host/live Undo 仍守自己的契約。** Grape-originated 操作以 own-domain intent/receipt、conditional write、readback/conflict 處理；該 domain 的 stack 只在其結果獲確認後推進。TD 自己的 Undo 或其他外部操作只回報 runtime/Binding；不加入 Graph History，也不由 Grape 倒回 TD-originated History。
6. **runtime observation 不建 History。** 外部高頻改值只更新 runtime/readback/basis；不建立 Graph 或 application-level Undo entry、不改 document dirty、不破壞 Graph Redo，也不由 observation 回送 write。未來若要記錄某種 user-intent-level operation，必須另外明定契約。
7. **全部 lifetime 與 authority 保護保留。** loadId、Binding epoch、Target incarnation、request/receipt basis、stale reply、接收端 fence、CAS 都照舊。舊 document／binding 的回覆不得改新 document、dirty、render、History context；本地丟棄晚回覆也不代表遠端副作用已被物理取消。
8. **本階段沒有跨域協調器。** 不建立 coordinator、experimental toggle、hidden mode 或 feature flag。普通 domain command dispatch 不排序或回捲其他 domain 的歷史。

### 不能混淆的兩條路徑

```text
Graph History.undo → canonical restore/commit → Graph projection/notification
                                            └→ Binding NEW conditional live intent
                                                 → Host CAS → receipt/conflict
                                                 → Binding runtime/divergence only

Graph snapshot → Generator → publication → preserve compatible Host current values
```

第二條 publication 路徑仍不可因 Graph Undo 使用 `resetSourceIds` 或重播 defaults 覆蓋 live state。`executable-reference/HOST_QUALIFICATION_CONTRACTS.md` §3 的「native current values 不跟著 Graph Undo 回到 defaults」是 publication 邊界；§4 的 conditional live-input 路徑才承載本次新增的產品觸發政策。若把該句讀成「任何途徑都永不傳播 Undo 值」，這個過廣的產品解讀被本決策明確取代，**publication 保留 current value 的契約沒有改**。

## 核對後的 scope delta

| Current ID | Before（IH-004） | After／current disposition | Replacement / retained acceptance |
|---|---|---|---|
| S08 | publication、Reload Applied；包含 G-MIXED-HISTORY | `SCOPE_ADJUSTED_NOT_STARTED`；移除跨域協調的等待，安全 publication/Reload/lifetime 範圍不縮減 | AT-S08-01…04 保留；DSH-04/05/07/08/10 |
| S09 | live/native controls，另要求 mixed order/dispatch/retry | `SCOPE_ADJUSTED_NOT_STARTED`；改 domain-separated behavior；typed native/live 能力仍須實作與真 TD 證據 | AT-S09-01/02 保留；DSH-01…10 |
| G-MIXED-HISTORY | unresolved；同時列 LC-UI-100、LC-UI-101，包含 order/receipt/load/Reload | `DEFERRED_BY_PRODUCT_DECISION`；scoped Gate delta=`deferred`；不再以 coordination 阻目前 slice/release，**不是 resolved/PASS** | 統一次序保留為 deferred；原本夾帶的 receipt/lifetime/Reload 義務保留在下列 gates/tests |
| LC-UI-100 | CQ qualification=`Partial`；統一 chronology 的 legacy leaf | effective product scope=`DEFERRED_BY_PRODUCT_DECISION`；CQ/IR 歷史值不改、不轉 Covered | LC-UI-100/B01 deferred；B02/B03/B04 的分域/no-op/receipt/lifetime 部分由 DSH 明確承接；不稱為 leaf 等價覆蓋 |
| AT-S09-03 | 尚未執行的混合次序＋receipt＋late reply 複合驗收 | 原測試原文完整保留，整體 unified claim=`DEFERRED_BY_PRODUCT_DECISION`；不是 PASS，也不刪除 | receipt/per-domain confirmation → DSH-09；late reply → DSH-07；domain semantics → DSH-01…08 |
| LU-UI-009 / G-LU-UI-009 | live-restore await 後外部 load，新圖 dirty/history/render 是否受污染未知 | `RETAINED_UNRESOLVED`；即使唯一 legacy leaf 被 defer，這項安全義務仍有效 | DSH-07；第一個 async Host/live restore 整合前建立 guard，在其驗收前取得隔離 fixture + 真 adapter 證據 |
| LC-UI-101 | CQ=`Partial`；確認捨棄工作圖並重讀已套用快照 | `RETAINED_PARTIAL`；沒有被 defer、沒有宣稱完成 | AT-S08-03、LC-UI-101/B01…04、DSH-10；G-LU-UI-008 仍 unresolved |
| G-LU-UI-008 | Reload Applied draft/History/reset 原子性仍待證 | `RETAINED_UNRESOLVED` | AT-S08-03、DSH-10；不能因與 mixed Gate 同列就刪除 |
| AT-S09-01 / AT-S09-02 | live CAS、外部動畫排除、native typed Undo 待驗 | `RETAINED_REQUIRED_NOT_EXECUTED` | 原 acceptance 原封不動保留；DSH 為補充，不是取代 |

表內 `DSH-xx` 的完整穩定 ID 是 **`AT-DEC-GRAPE-001-xx`**。S09 的 S08 conditional prerequisite 只去除 mixed-order 分支；binding schema replacement、跨 publication/reload 的 receipt race 仍依賴 S08。S08/S09 其他 Gate 和 prerequisite 不因本次決策解除。S06/S01 可沿既有分域模型實作；本決策不因此授權任何 slice 開始。

## 必須新增的 acceptance（全數 REQUIRED_NOT_EXECUTED）

| ID suffix | 可檢查的案例與必要斷言 |
|---|---|
| 01 | Graph edit 與 TD-originated native Undo 交錯，再 Graph Undo：只還原 canonical model；TD history cursor/外部動畫不回捲；active binding 最多是新的受條件約束寫值。 |
| 02 | Grape-originated Host/live/native 操作在該 domain Undo：Graph/default、revision、dirty、Graph history/redo 不變；只影響有 receipt/authority 的自身 records。 |
| 03 | 注入至少 10,000 筆 runtime observation、driver animation 與 TD Undo readback：runtime 顯示最新值/basis；Graph serialization/revision/dirty/History/Redo 不變；沒有 application Undo entry 或 echo write。此為有界正確性測試，不是假定效能門檻。 |
| 04 | 兩種次序都驗：① live intent 捕捉 basis 後外部改值；② animation／TD Undo 已在 Graph Undo 開始前改值且 readback 已更新 mirror。覆蓋 value、driver、shape、revision 與 A→B→A。適用的既有 intent/receipt basis 失效就拒絕；不把最新 mirror 自動視為新的 Undo 授權，不以值相等或 fresh readback rebase/force-write；Host actual 保持外部結果，Graph Undo 仍完成。 |
| 05 | canonical 2→1 的 Graph Undo 已成功，Host write 回 conflict：canonical=1、Graph cursor 已推進且 revision 向前；無額外 entry、無 rollback；Host actual 未被覆蓋，Binding divergence 可觀察。 |
| 06 | Canvas、committed Inspector、未提交 draft、Host/live control、無 domain/空 domain 的 Ctrl+Z：依明確 domain/local draft 規則處理；不以其他域有最近操作而 fallback；同一 Panel 切換能力也不取得全域 History。 |
| 07 | 延遲 native/live restore、Undo propagation、publication receipt；分別 load 新圖、rebind 新 epoch、Target restart/incarnation 後放舊回覆：新 document/dirty/render/Graph與Host History context 均不受舊回覆修改；含非一般 UI 的 load 入口。保存真實隔離 TD/adapter 證據，不能只以其他分支測試推定 live-restore 安全。 |
| 08 | active Binding 且 basis 有效時 Graph Undo：model 先完成；新的 request/intent 送恢復值；成功只更新 runtime/receipt，不新增 Graph entry；publication 仍保留相容 current values。無 Binding 時零 Host call。不以 publication resetSourceIds 取代這條路徑。 |
| 09 | Host-domain Undo timeout/重試/拒絕/重複 receipt：confirmation 前不推該 domain stack；同 ID+payload 不重做；改 payload 拒絕；indeterminate 停相關 Host write並等待readback；Graph 已完成 Undo 不因此撤回。own-domain no-op/cancel 保留 Redo，不建立全局 Redo。 |
| 10 | LC-UI-101 的確認/Cancel/draft/取得快照前失敗/成功 replacement：保留原 oracle 與 G-LU-UI-008；成功 load 新 lifetime、reset 相應 session/draft/History；舊回覆不能復活。canonical save 保留恢復值，runtime/divergence/History不寫入 GraphDocument；load 後重建 Binding authority，非持久化 token 復活。 |

案例需要 production acceptance 時：DSH-01…06、08…10 的模型／router／fake receiver 可先獨立驗證；凡聲稱 TD/native/live 實際相容者仍需真 adapter/TD 證據；DSH-07 的舊 LU-UI-009 runtime gap 沒有因此被解除。跨 deployment 的 core 行為相同，實際 Host capability 缺失應回不可用，不穿透 application core。

## Architecture conflict check

**NONE（責任邊界與 invariant 無衝突）。** 這是產品 scope 與 command 觸發政策變更，不新增 Architecture Change。

| 檢查面 | IH-004 證據 | 結果 |
|---|---|---|
| Ownership / mutation | 02/03；CP-01/02；INV-001/002/003/020 | Graph 持 canonical；Parameter 走原 writer；UI/Host 不得繞過。保持。 |
| History domains | 05 §1/4；06 開頭；D07/D11；INV-005/006/007/019 | History、delivery 分離；Graph cursor 不依 Host 成功。no-op、reentrancy、兩個 Context 共用模型 History 保持。 |
| Binding / authority / CAS | 06 §Live inputs；HOST_QUALIFICATION_CONTRACTS §3/4/5；HG-02/04/05 | 新 write 仍驗 identity/shape/driver/revision/lease；publication 不 reset live；Host 拒絕不補償 Graph。保持。 |
| Lifecycle / notification | 05 §5；06 Target/BindingLease；INV-009/017/018 | load/epoch/receipt fences、projection ordering、舊 ACK 不清 dirty 保持；保留 G-LU-UI-009 實機驗收。 |
| Persistence | 05 §2、IH-003 persistence identity；14_DOCUMENT_FORMAT | 保存 canonical snapshot；runtime mirror、History、leases 不入文件；明確 Reload/import 才替換。保持。 |

被明確取代的是 S09 中「必須交付 unified coordination」及 AT-S09-03 的**跨域共同成功／時序**產品要求。Host-domain 的「確認後才推 stack」不能錯套成 Graph Undo 要等待 Host；Graph transaction 原子性不能被誤解成跨 process 原子性。

## 驗收與紀錄的真實狀態

- Accepted evidence：產品 owner 在本次訊息裁定範圍。不是任何 TD/runtime/test pass。
- 本輪只核對 IH-004 契約與封存相容資料；沒有重新閱讀 Legacy implementation、沒有改原型／產品程式。
- 可以驗證的是 ID/hash/scope/locator 格式與封存完整性；不能把這些檢查當成上述十項行為已實作。
- IH-004 schema 2 的 not-started 狀態不能登錄決策；因此外部 accepted 紀錄現在有效，state-patch 留給真正開工時合併。`README.md` 說明此限制，沒有靜默改 schema 或假造 implementation baseline。

## 重新考慮条件

只有具體產品證據（反覆 domain Undo 困惑、確實需要跨域 chronological 工作流、新跨域 transaction 需求）才重議。屆時先界定具有 user-intent-level Undo 語意的 operation；不要因 Legacy 曾有此能力就重啟，也不要把 runtime stream 整條塞回 History。若需要協調，保留在上層組合既有 authority 的可能性；此次不建立那個 coordinator。
