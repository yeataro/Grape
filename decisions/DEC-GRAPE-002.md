# DEC-GRAPE-002 浮點向量 Edge 轉換與 Image Output 接收政策

**Product decision：ACCEPTED。文件修訂已獲 Human Owner 授權；尚未實作、尚未登記到 implementation baseline，未授權任何 Slice 開始或擴張。**

本決議採用已向 Owner 展示的 Unity Shader Graph 浮點純量／向量轉換表，新增 vec2 → vec3、vec2 → vec4，並讓 Image Output 的 color 接孔接受該表可轉為 vec4 的來源。這是產品語意變更，不是文字清理。配套的精確保存契約見 [AC-GRAPE-001](AC-GRAPE-001.md)。

## 權威與記錄範圍

- 決策者：Human Owner；記錄者：Technical Product Steward／PM。
- 記錄日期：2026-10-04，Asia/Taipei。原始訊息的精確時間未取得，不以記錄時間冒充決策時間。
- 決策原文：「那我覺得 Unity這樣蠻有道理的耶。我想要修改成這樣。」
- 修訂授權原文：「沒有問題，請修訂。但修訂之前你跟我講，沒有辦法修改 handoff 嗎？還是說修訂的部分要放在 handoff 之外再跟協調員講。」
- 授權前已展示的修改清單：轉換表、版本化 Edge 保存格式、接線／合法性／產碼一致性、Image Output 接收政策及驗收條件；並明示 float 0.5 → vec4 的第四分量也是 0.5。
- 本次讀取基準：工作 HEAD `04834e2d0c11656f9d06a3e9ab82350f6edede33`；本機 main `3a59aeeeddb71a06a1172c85016ad06aeb59f34f`。不是遠端同步或新實作驗收聲明。
- IH-005 與歷史接受證據保持封存。PM 沒有修改 `implementation-state.json`、工作流程、產品程式或測試，也沒有發送派工。

## 已接受的轉換表

本表只涵蓋 `glsl.float`、`glsl.vec2`、`glsl.vec3`、`glsl.vec4`。`s` 是來源純量，`x/y/z/w` 是來源分量。接收端的型別已確定；表描述 Edge 供給接收端的值，不改來源節點的型別、參數或輸出。

| 來源 | 目標 | 結果 | 相對目前實作 |
|---|---|---|---|
| float | float | s | 保留 |
| float | vec2 | (s, s) | 保留 |
| float | vec3 | (s, s, s) | 保留 |
| float | vec4 | (s, s, s, s) | 保留 |
| vec2 | float | x | 保留 |
| vec2 | vec2 | (x, y) | 保留 |
| vec2 | vec3 | (x, y, 0) | 新增 |
| vec2 | vec4 | (x, y, 0, 1) | 新增 |
| vec3 | float | x | 保留 |
| vec3 | vec2 | (x, y) | 保留 |
| vec3 | vec3 | (x, y, z) | 保留 |
| vec3 | vec4 | (x, y, z, 1) | 保留 |
| vec4 | float | x | 保留 |
| vec4 | vec2 | (x, y) | 保留 |
| vec4 | vec3 | (x, y, z) | 保留 |
| vec4 | vec4 | (x, y, z, w) | 保留 |

補值是固定語意，不依 RGB／XYZ 顯示方式、節點名稱、主題或使用者界面偏好改變。純量向量化是複製純量：float 0.5 → vec4 的結果為 (0.5, 0.5, 0.5, 0.5)，不套用向量補 W=1 的規則。

## Image Output

本修訂適用的 Image Output 定義，其 `color` 輸入仍固定為 vec4、仍為 required；放寬的是來源接收政策。float、vec2、vec3、vec4 均可按上表供給 color。最終 boundary output 仍為 vec4。

接線仍受原有端點存在、方向、同 Network、單一輸入連線、替換原子性、cycle、型別／profile 及其他適用合法性條件約束。本決議不開放任意來源型別，也不一併取消其他接孔的 `exact` 政策。Vertex Output 的政策沒有在本次被更改。

改變 Node 定義行為仍須遵守 exact module identity。不能在讀取舊文件時把舊 pin 靜默指向新定義；舊 Image Output 定義的升級需要明示的支援路徑。本次不宣稱既有文件已自動獲得新政策。

## 契約影響與狀態

| 原來源 | 本次修訂 |
|---|---|
| IH-005 [14 §2a](../handoff/14_DOCUMENT_FORMAT.md#2a-canonical-edge-adaptation-wire-contract) 的五種 Edge 操作 | 保留原義；以版本化擴充表示 vec2 的兩種放大。具體新契約見 AC-GRAPE-001。 |
| IH-005 [14 §2c](../handoff/14_DOCUMENT_FORMAT.md#2c-structural-vs-opaque-subfields-and-evolution) 的版本演進規則 | 沿用新增操作需提高文件版本的要求，不把新語意藏在 extensions。 |
| [接收端政策](../handoff/executable-reference/COMPUTE_QUALIFICATION_CONTRACTS.md#51-自動轉型政策是接收接口契約) | 支援此浮點轉換族的政策增加兩項；exact 同型限制仍有效。其他數值、bool、矩陣或名義型別政策不由本表重定義。 |
| Production Image Output 的 `connectionPolicy: exact` | 新版定義採上表的浮點接收政策；現有程式未改。 |
| 接線、重驗、生成及資料交換 | 必須對同一保存的轉換有一致解讀；見下列驗收。 |

沒有改變 Graph、Application、TypeEnvironment、Node、Port、Edge、Generator 或 History 的 ownership。Auto 動態選型、下游自動改型、矩陣轉換、編輯層開關及 UI 美化均不由本決議新增或定案。Unity 是此次比較證據；未來 Unity 的修改不會自動修改 Grape 契約。

目前分類是「已接受產品變更，待授權實作與驗收」。S03 的歷史 PASS 不證明本修訂已完成；也不因本文件存在就失效。S04 是討論中的整合時機，不是本文件授予的啟動或範圍授權。G-PD-1、G-VERSION-COMPAT、文件穩定承諾等既有 Gates 不因此關閉。

## 必要驗收

全部為 **REQUIRED_NOT_EXECUTED**，不代表本輪建立或執行了產品測試。

| ID | 必須證明的結果 |
|---|---|
| AT-DEC-GRAPE-002-01 | 驗上表全部 16 組，使用不相等的分量與非 1 純量，確認複製、裁剪、Z=0、W=1 的數值語意。 |
| AT-DEC-GRAPE-002-02 | 同一 source 可分別接到不同目標；建立 Edge 不改來源節點的型別、參數、port identity 或既有其他輸出用途。 |
| AT-DEC-GRAPE-002-03 | 實際 Canvas 把 float、vec2、vec3、vec4 分別接到新版 Image Output/color；生成的 boundary 值皆為正確 vec4。撤銷／重做恢復同一條線及其轉換。 |
| AT-DEC-GRAPE-002-04 | exact 接孔仍拒絕異型來源；不支援的型別／偽造轉換仍拒絕。失敗接線或替換不發布半成品、不刪掉原線、不新增 History。 |
| AT-DEC-GRAPE-002-05 | 正式接線、已有的候選檢查、Graph 重驗、hydration、Generator 對相同端點與 plan 一致。不為此驗收發明尚未授權的 UI 預檢功能。 |
| AT-DEC-GRAPE-002-06 | 新轉換經 save/reopen、JSON roundtrip、nested/shared subgraph、clipboard 及受授權的 Library/Personal 往返後保留語意。未授權或未完成的交換分支不得標成 PASS。 |
| AT-DEC-GRAPE-002-07 | AC-GRAPE-001 的版本矩陣、未知／畸形資料、inactive loss/recovery 中的 Edge 均遵守保存與拒絕規則，不自動復線、不降格猜測。 |
| AT-DEC-GRAPE-002-08 | 既有 module pin 保持精確；新版節點 identity 與支援的舊資料讀取／升級邊界有證據。不以相同名稱替代缺失的舊定義。 |

## 採用與追溯

Human 已接受上述產品語意與有界修訂。指定 state maintainer 應在適當流程中把本決議及 AC-GRAPE-001 的實際檔案 SHA-256 登記到 `decisionReferences`，並在被授權的新實作基準引用它們。PM 不為此更換目前 baseline、補填接受證據或啟動 Slice。

任何依賴本變更的 Implementer／Reviewer 必須同時取得 IH-005、本決議與配套修訂的精確版本。不能僅以舊 handoff 判定新增操作違規，也不能把新規則倒灌成舊版本早已交付的宣稱。這是追溯要求，不是本輪派工。

證據：目前程式 [TypeEnvironment](../production/src/definitions/types.ts)、[Node definitions](../production/src/modules/nodes.ts)、[Generator](../production/src/generation/compiler.ts)；比較來源為 [Unity Shader Graph 17.0 Data Types](https://docs.unity3d.com/Packages/com.unity.shadergraph@17.0/manual/Data-Types.html#promotingtruncating) 與 [AdaptNodeOutput](https://github.com/Unity-Technologies/Graphics/blob/master/Packages/com.unity.shadergraph/Editor/Generation/Processors/GenerationUtils.cs#L679)，於 2026-10-04 查閱。Unity master 連結可變；本文件固定的表格才是此次 Grape 決議。
