# Legacy compatibility is an acceptance layer

實作方向是 **Architecture → Extension Model → Vertical Slice**。然後以 **capability oracle → regression → compatibility audit** 檢查是否遺失行為。不能從618項重新推導ownership、class、protocol或repository切分。

**HC-001 已隔離**：CQ的部分摘要把能力責任、資料owner及Legacy保存前提混在一起。原文在`sourceSummary`，僅供追溯，不是實作指令；compiled `executionPath/stateOwnership/persistence`依02/03/05/06明確分責。所有原 CQ disposition、case IDs、UNKNOWN及group membership不變；IH-005 的 DEC-GRAPE-001 有效產品範圍另列，不改歷史來源。詳見 [衝突記錄](audit/HANDOFF_CONFLICTS.md#hc-001)。沒有藉編譯交接包修訂CQ來源。

`compatibility/capabilities.json` 是IR-001 canonical JSON的原樣副本，含618葉、全部必要行為欄位、原始證據描述和UNKNOWN。`compatibility/behavior-contracts.md` 保留逐行為契約。`data/capability-coverage.json` 編譯CQ-001的owner/path/service/profiles/disposition、345 groups、unknowns與implementation-only findings。source paths/line numbers 是**歷史證據locator**，不是本包要求載入的程式依賴；不要為了使用包而閱讀那些Legacy files。

## 轉換方式

| Legacy behavior / assumption | Preserved intent | New architecture mechanism | Acceptance evidence |
|---|---|---|---|
| Host托管UI所以自動知道該Host；LC-HOST-001 | 低摩擦且明確對應正確宿主 | descriptor/discovery→identity/authority→明確Binding；不用origin當identity | 同ID、異ID、stale/restart/多候選；cross-ID依PD Gate |
| 圖隨Host已Apply內容保存，未Apply為本地draft；LC-DATA-001、LC-UI-101 | 不丟作品，明確區分working與applied | Canonical Graph保存獨立；Host保存已交付snapshot；顯式Reload Applied重建工作生命期 | 未Apply仍可獨立save/reload；拒絕重讀不變；draft/History/late回覆按Gate驗 |
| Uniform綁原生參數、Host動畫回報 | 控制執行中值並看到有效輸入 | Graph Source/default與Binding live mirror分開；CAS/receipt，不寫document | 外部寫值不改default/GraphHistory；不可echo；type/driver替換blocked |
| 缺/未知revision inspection但已知UUID可用現行emitter；LC-NODE-370 | 可辨識來源及可定義的舊圖相容 | exact pins＋明確legacy import映射計畫；不可默認latest | G-VERSION-COMPAT解除前不承諾legacy compile結果 |
| Personal身份重編破壞部分symbolic arrays；LC-DATA-028/038/042/047 | 可獨立重用且引用語意正確 | typed reference closure/remap，format/semantic admission分開 | 依PD-1選定scope跑literal/source/input-bound/nested往返；不假裝舊失敗已決定修掉 |
| Graph/native/live交錯History；LC-UI-100 | 原 unified chronology intent 留為 deferred oracle；目前 accepted scope 為分域 Undo | DEC-GRAPE-001：explicit domain dispatch；Graph先restore，Binding再發新conditional live intent；無coordinator | LC-UI-100／G-MIXED-HISTORY／原AT-S09-03為DEFERRED_BY_PRODUCT_DECISION；DSH-01…10全待驗，不能稱leaf等價Covered |
| 不同viewport/zoom下接線與Preview拖動 | 指向正確端點／面板，手勢不跳動 | shared coordinates＋PortRef；Preview session/down origin/sequence | 真browser/device坐標、capture、resize、cancel；模型測試不代真機 |

表內新責任是已採用契約的摘要，不是要求逐字模仿Legacy資料擺放。Compatibility workaround放在明確import/codec/adapter邊界，轉入canonical時用新的合法資料；原始opaque內容保留作recovery/provenance，不能讓core到處查 `legacyMode`。

## Slice 驗收方法

可機器查詢的leaf→mechanism→slice／Gate／planned test索引是`data/acceptance-index.json`。命令`node tools/find-capability.mjs LC-NODE-370`可取得本包內的完整oracle與責任／Gate／slice；不讀外部source。`sharedPlannedTests`是共通slice案例，不等於每leaf所有細節已被驗證。

1. 從`data/slices.json`選slice與代表Capability/coverage groups，再查該leaf的完整trigger、precondition、failure、persistence、Undo、edge cases。
2. 對每個聲稱完成的leaf維護逐behavior assertion與runtime evidence；group的代表性測試不能代替每葉特殊failure/lifetime。
3. [DEC-GRAPE-001](provenance/product-decisions/DEC-GRAPE-001.md) 的 accepted scope overlay 優先於 historical unified Undo 工作指令；LC-UI-100 sourceDisposition/sourceQualification 仍 Partial／原封存值，effectiveProductDisposition 是 DEFERRED_BY_PRODUCT_DECISION。LC-UI-101／G-LU-UI-008、LU-UI-009 与所有 receipt/CAS/lifetime obligation 保留。
4. `Covered` 是封存architecture qualification；不自動是production acceptance。原348 Partial與8PDR保留原disposition，另記新implementation狀態，不回改CQ-001。
5. UNKNOWN不能猜；查`data/gates.json`何時必須解除。產品owner決定行為差異，並記接受／拒絕／降範圍後果。
6. 若TOE/TOX或其他必要證據揭露新行為，新增inventory revision与受影響coverage審查；不偷偷把IR-001內容換掉。

Implementation artifact不重新實作；資料中12項implementation-only finding不是12個新功能。但穩定可觀察的奇怪行為不能只因看似bug而刪掉：標possibly accidental，交對應Gate。

目前限制繼續有效：TOE/TOX embedded未窮盡；TD/GPU/cross-platform browser證據不完整；33 UNKNOWN尚存。即使首個新產品slice可運作，也不能宣稱所有Legacy能力已替代。
