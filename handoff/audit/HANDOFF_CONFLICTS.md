# Handoff conflict register

**Open HANDOFF CONFLICT count: 1 — HC-001（來源摘要衝突，已隔離，尚未修訂封存來源）。Canonical contract conflicts remaining in this handoff: 0.** 這兩個數字不同：本包沒有採用矛盾指令，也沒有宣稱來源已被修好。產品／環境 Gates 仍然存在。

<a id="hc-001"></a>

## HC-001 — CQ-001 的責任摘要不能逐字當新架構指令

Fresh Context Review 發現機器資料比 Markdown 更容易把錯誤指令交給實作者：

| 原封摘要證據 | 與既定責任的衝突 | 影響 |
|---|---|---|
| LC-NODE-370 `executionPath` 把「Graph.change/reconcile…History, load/save」列在 Generator action | AC-002 Generator 只讀 snapshot，Graph 才能修改模型 | 可能在產碼時修改／保存作品 |
| 同leaf `newPersistence.owner=Registry`，rule 卻是保存Graph resources/node values；大量Node leaf同類欄位為NodeType | schema/行為責任不等於實例資料owner；Graph持有實例 | 可能產生第二份canonical值或把保存交模組 |
| LC-DATA-001 `newPersistence.rule` 使用「Apply後隨宿主保存，未Apply只屬草稿」 | 這是Legacy環境事實，與產品獨立save／canonical Graph定位不能同時作規範 | 可能讓Host重新取得文件責任 |

**沒有自行裁定哪份封存來源應被改寫。** 原文在 `data/capability-coverage.json` 的 `sourceSummary` 保留；IR/AC/CQ/MRDP封存資料都未修改。衝突來源摘要不得作architecture指令；本包的 `executionPath/stateOwnership/persistence` 只表達02/03/05/06已有、且本次要求再次明定的邊界。它們不增加新owner、不改原coverage disposition，也不取消任何Legacy行為oracle。

**Gate：G-HANDOFF-CQ-OWNERSHIP。** 阻止將來源混寫直接轉成實作；不阻止按清楚的AC／最高定位做S01。若要宣稱CQ來源衝突已解除，必須有獨立的來源修訂／核准，不能靠本包宣告。若證據顯示是實質契約矛盾而非摘要錯置，停止受影響分支，不私改ownership。

機器清單：`data/handoff-conflicts.json`。415個leaf包含重用的角色／持久化摘要，這是**受摘要隔離影響的範圍，不是415項功能失敗**。Node查詢／產碼的入口亦明確不要求EditorContext；Context只是可選的UI呼叫者。

## 其他已檢查的表面衝突

| Potential conflict | Evidence / impact | Disposition |
|---|---|---|
| Legacy保存圖在Host，是否Host才是canonical？ | IR的保存欄位描述舊環境；AC-002 Host契約明確Graph/document源自application，receiver持已交付snapshot | **No conflict**：將保存媒介與canonical owner分開；明確reload/import。不能反向繼承Legacy ownership。 |
| Host擁有actual values，是否違反Parameter由產品擁有？ | AC-002 Graph defaults／Parameter入口與TargetInputs current value分域 | **No conflict**：兩種不同資料，不是同值雙真相。Graph Parameter改模型；Host control改外部runtime。 |
| NativeDefinitions/History是否搶走definitions/applicationHistory？ | 其records為Host原生page/control/row observation；不是NodeType或Graph-local definitions | **No conflict**：native receipts由application協調，不把GraphHistory交給Host；混合chronology仍Gate。 |
| 原型PanelKind只有六種，最高定位要求first-class Panel extension | IH-001 的普通模板未接共享workspace；Independent Review B01 接受為真缺口 | **IH-002 additive repair，待獨立複驗**：AC-IH002-01 補 PanelWorkspace public composition／default scope resolver／Context notifications；canonical example 使用同一路徑。封存bounded probe保留，production runtime仍G-EXTENSION-PANEL。 |
| Legacy unknown revision仍compile current，new exact pins拒絕缺ref | CQ明記舊行为；AC-002 resolver exact與未完成upgrade plan | **Compatibility Gate**：G-VERSION-COMPAT；本包沒有選擇取消舊行為，也沒有改exact resolver。受影響slice不能稱相容已解。 |
| 新model/renderer未達所有UI細節，能否HandoffReady？ | CQ的Partial及MRDP把實作與證據按slice分開；本包UI schematic不宣稱Legacy screenshot | **No conflict**：只交可建立首版的結構/行為/範例與具體UI Gates，不冒稱全部視覺已驗。 |

If a fresh reviewer finds a true contradiction, add its exact statements, source references, blocked slice and unresolved choice here. Do not silently resolve it by moving document truth to Host, weakening an invariant, or declaring a Gate passed.
