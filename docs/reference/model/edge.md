---
id: grape-model-edge
title: "Edge｜連線"
category: model
source_revision: "30c867945c992d25956a2a32825de34571f7749e"
---

# Edge｜連線

Edge 把同一 network 內一個節點的輸出接到另一個節點的輸入。
它同時保存端點與已獲准的型別轉換方案；畫面的曲線只是這份資料的呈現。

實作 I：`30c867945c992d25956a2a32825de34571f7749e`。文件基底 R：`a4a6e72b1a7ade9ee3c4b2f782c1da4358faa3e3`。
下列是來源碼與契約說明，不是本次文件工作的執行測試結果。

## 身分與資料

實際持久型別是 `EdgeDocument`，保存於 `NetworkDocument.edges`，由 Graph 擁有。

| 欄位 | 內容 |
| --- | --- |
| `id` | 這條連線的持久身分 |
| `from` | 來源 `{ nodeId, portKey }`，必須是 output |
| `to` | 接收 `{ nodeId, portKey }`，必須是 input |
| `adaptation` | `EdgeAdaptationDocument`：來源／目標型別、operation、schema 與 version |
| `invalid` | 可選的錯誤 code／reason；保留不代表可執行 |
| `extensions` | 保留的擴充資料，不可藉此偷放未授權轉換 |

端點不是 DOM、顯示名稱或 Port 物件指標；型別解析依 [Port](port.md) 與精確定義。

## 建立、替換與移除

Canvas 發出 `grape.edge.connect`／`grape.edge.disconnect`，Application 驗證操作權限並呼叫 `graph.change`。
`Draft.connect` 確認端點、方向、已占用輸入與 replacement 參數、節點接受規則、型別轉換、循環與常數限制。
不合法操作不發布半條連線；成功的接線或替換是一次 Graph History 操作，可 Undo／Redo。

目前 Canvas 的 `createCanvasType` 預設 `replaceConnections: true`，不用 Shift；組合時可設為 false。
這不改 `Draft.connect` 的明確 `replace` 參數；停用替換時，占用輸入會拒絕為 `INPUT_OCCUPIED`。
從已接線 input 拖到空白放開會移除該 Edge；Escape、取消或失效的操作不能變成斷線。
Output 落線後新增節點的完整路徑另見 [Node browser](../ui/node-browser.md)。

## 轉換與產碼

`TypeEnvironment.adaptation` 產生方案，`planValid` 比對目前端點與保存方案。
目前 operation 包含 identity、broadcast、take-leading、append-alpha-one、numeric-cast、pad-vector；適用範圍仍受型別、input policy 與 profile 限制。
`pad-vector` 使用 adaptation version 2；不能把所有不同型別都當成可轉換。

例如 vec3 `(0.2, 0.4, 0.6)` 接到允許轉換的 float 輸入，使用 take-leading 得到 `0.2`。
來源接口仍是 vec3；若接到 [Multiply](../nodes/multiply.md) 的 A，Multiply 的 A／Result 仍是 float。
相反地，要求 exact 的不同型別輸入必須拒絕，不能偷偷改來源型別。

`compile` 讀取快照、檢查 Edge 與方案，再用 `adapt` 轉換來源表達式供接收節點使用。
它不藉產碼修理 Graph。保存的無效 Edge 可留作診斷，但不能直接執行。

## 視覺與限制

Canvas 以共用 [`wireCurve`](../../../production/src/features/wire-geometry.ts) 畫平滑曲線，並依來源型別著色；暫時預覽不等於已建立 Edge。
本版沒有承諾在連線上顯示轉換文字標籤或來源到目標的漸層。
發現型別不合法時應讀目前診斷；不能僅憑線條顏色推斷整個方案已通過。

## 引用與被引用

- **持久引用**：[Port](port.md) 對應端點；**計算使用關係**：[Multiply](../nodes/multiply.md) 可接收轉換後輸入。
- **命令呼叫者**：[Node browser](../ui/node-browser.md) 可請 Application 一次新增並接線；Canvas 負責一般連線操作入口。
- **原始碼證據**：[document.ts](../../../production/src/sdk/document.ts)、[graph.ts](../../../production/src/model/graph.ts) 的 `Draft.connect`／`disconnect`、[editor.ts](../../../production/src/application/editor.ts) 的命令分派。
- **轉換與產碼證據**：[types.ts](../../../production/src/definitions/types.ts) 的 `TypeEnvironment`；[compiler.ts](../../../production/src/generation/compiler.ts) 的 `compile`／`adapt`。
- **適用契約**：[文件格式](../../../handoff/14_DOCUMENT_FORMAT.md)、[DEC-GRAPE-002](../../../decisions/DEC-GRAPE-002.md)、[AC-GRAPE-001](../../../decisions/AC-GRAPE-001.md)、[Panel 命令](../../../handoff/17_PANEL_COMMAND_CONTRACT.md)。

[回五頁索引](../index.md)
