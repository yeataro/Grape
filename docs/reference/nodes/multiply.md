---
id: grape-node-multiply
title: "Multiply｜乘法節點"
category: nodes
source_revision: "30c867945c992d25956a2a32825de34571f7749e"
---

# Multiply｜乘法節點

把 A 與 B 相乘，輸出一個浮點數 Result。適合用來調整數值強度，例如把亮度乘以係數。
目前條目描述的是固定 `glsl.float`、限 Pixel 階段的節點。

實作 I：`30c867945c992d25956a2a32825de34571f7749e`。文件基底 R：`a4a6e72b1a7ade9ee3c4b2f782c1da4358faa3e3`。
這是對照程式碼的文件試作，不是新的執行測試或獨立審查結論。

## 身分與責任

- 實際定義：`multiplyNode`，型別為 `NodeDefinition`，由 `basicNodes` 註冊。
- 精確節點身分由 `nodeRef("multiply")` 與 `NODE_PIN` 組成；模組是 `grape.nodes.basic`、版本 `0.1.0`，並帶 fingerprint。
- 模組定義提供接口、參數與 GLSL 表達式；Graph 擁有建立後的節點資料及編輯歷史。
- `state` 初始化為空物件 `{}`；A、B 的本地值放在節點 `inputValues`，不是另一套 UI 狀態。
- 可用條件包含 `grape.stage.pixel` 及產碼能力 `grape.glsl.numeric`。

## 接口與參數

| 顯示名稱 | 穩定 key | 方向／型別 | 未接線時 |
| --- | --- | --- | --- |
| A | `a` | input／`glsl.float` | 預設值 `1` |
| B | `b` | input／`glsl.float` | 預設值 `2` |
| Result | `result` | output／`glsl.float` | 輸出 A × B |

A、B 都是 `target: "input"` 的數字參數，可在 Inspector 編輯。
有效連線會供應該輸入；此時不能用本地參數編輯覆蓋連線值，原本的本地值仍保留。
斷線後使用保留的本地值，並不必然重設成初始預設值。

## 操作與結果

1. 在 Pixel 的 [節點瀏覽與新增面板](../ui/node-browser.md) 搜尋 Multiply，依目前模式新增。
2. 選取節點，在 Inspector 把 A 改為 `3`，B 保持 `2`。
3. 將 Result 接到需要這個結果的下游輸入；Generate GLSL 時，對應表達式是 A × B，結果為 `6`。
4. 若改接上游到 A，產碼改用上游表達式；Undo 可恢復該次有效的圖編輯。

`emit` 回傳帶型別與 `constant` 標記的表達式；兩個輸入都是常數時，Result 才標為常數。
產碼器負責走訪實際被使用的網路、取得輸入及處理連線轉換；節點定義不自行寫回 Graph。

## 限制

- 本版沒有 Auto／向量乘法選型；Result 不會因接線變成 vec2、vec3 或 vec4。
- 不同來源型別若能接入，是 [Edge](../model/edge.md) 的合法轉換，不是 Multiply 自動改型別。
- 無效數值、錯誤接口、循環或不相容型別仍由既有驗證拒絕；顯示在目錄中不等於任意連線都可用。
- 本頁不把 Legacy 同名節點的完整能力當成目前產品承諾。

## 引用與被引用

- **執行期資料契約**：[Port](../model/port.md) 說明此定義回傳的接口與本地供值；[Edge](../model/edge.md) 說明上游如何供應輸入。
- **使用入口／概念關係**：[Node browser](../ui/node-browser.md) 通用列舉已安裝定義，並非直接匯入 `multiplyNode` 的專屬面板。
- **原始碼證據**：[nodes.ts](../../../production/src/modules/nodes.ts) 的 `multiplyNode`、`definition`、`parameter`；[compiler.ts](../../../production/src/generation/compiler.ts) 的 `compile`。
- **編輯證據**：[graph.ts](../../../production/src/model/graph.ts) 的 `Draft.parameter`；[Inspector](../../../production/src/features/inspector.ts) 負責掛載參數欄位。
- **適用契約**：[擴充模型](../../../handoff/04_EXTENSION_MODEL.md)、[正式契約表面](../../../handoff/13_PRODUCTION_CONTRACT_SURFACE.md)。

[回五頁索引](../index.md)
