---
id: grape-ui-port-row
title: "nodePortRow — 接口行 UI"
category: ui
source_revision: "30c867945c992d25956a2a32825de34571f7749e"
---

# nodePortRow — 接口行 UI

**實際符號：`nodePortRow` · 種類：exported function · 回傳：`HTMLElement`。**

- **模組／原始碼**：[features/node-browser.ts](../../../production/src/features/node-browser.ts)。
- **主要資料來源**：[`PortSnapshot`](../../../production/src/sdk/document.ts)，其模型意義見 [Port／接口](../model/port.md)。
- **實際呼叫者**：[Canvas](../../../production/src/features/canvas.ts) 的節點呈現迴圈，以及 [`mountNodeBrowser`](../../../production/src/features/node-browser.ts) 內的 `choose` 新增預覽。

節點上的一行接口顯示：圓點、名稱、型別，以及適用時的本地值。
正式 Canvas 節點和新增預覽共用這個最小呈現單元，讓 socket 幾何一致。
輸入與輸出也共用此函式，以 `port.direction` 的 `input`／`output` 區分；沒有分立的 `InputRow`／`OutRow` 類別。

實作 I：`30c867945c992d25956a2a32825de34571f7749e`。文件基底 R：`a4a6e72b1a7ade9ee3c4b2f782c1da4358faa3e3`。
內容依程式碼整理；本次未啟動產品測試或獨立審查。

## 參數與責任

它不是 Port 類別，不持有 canonical Graph，也不是數字輸入元件。
函式負責建立這一行 DOM；呼叫者提供資料並負責後續更新、事件與生命週期。

| 呼叫者提供 | 用途 |
| --- | --- |
| `port: PortSnapshot` | 方向、型別、key 與預設資料 |
| `label: string` | 要顯示的名稱；不等於持久 key |
| `node?: { id: string; name: string }` | 正式 socket 的資料屬性與可讀標籤 |
| `connected: boolean`，預設 false | 顯示已接線狀態，由呼叫者從目前網路計算 |
| `value: Json \| undefined`，預設 `port.defaultValue` | 顯示本地值；Canvas 會傳入節點當前 `inputValues` |

## 組成與可見結果

- 外層是帶 input／output 方向的 `.port-row`。
- `.port` button 只容納 `.socket` 圓點；名稱 `.port-label` 與型別文字是獨立元素。
- 正式節點提供 `data-node-id`、`data-port`、方向和 aria-label，供 Canvas 事件辨識。
- 預覽未傳 node 時使用 `data-preview-port`，並把按鈕移出 Tab 順序；不冒充持久端點。
- float、vec2、vec3、vec4 有既有型別色，其他型別用 fallback 色。
- 僅未接線 input 且有值時顯示 `.node-value`；物件值用 JSON 文字呈現，其他值用文字。

圓點的 hover／wire-target 與焦點外觀由共用樣式及 Canvas 狀態處理。
顯示「已接線」不等於這個函式驗證了 Edge，也不把資料複製成另一份模型。

## 實際操作分工

以 [Multiply](../nodes/multiply.md) 的 A 行為例，未接線時可看到 A、float 與本地數值。
使用者在 Inspector 改值後，Graph 發布新資料，Canvas 重新以目前值建立接口行。
有效接線後，Canvas 傳入 `connected: true`，本地值文字收起；保留值仍在 Graph 中。
要編輯值請用 Inspector；點這行的數值文字不等於開啟數字編輯器。

正式 socket 的接線與 F2 資料由 Canvas 既有事件／readonly projection 提供。
此函式本身沒有呼叫 Graph 命令、沒有掛接數值編輯器，也不註冊 hover 診斷模式。
長內容、未知型別或未提供值仍受呼叫者與樣式限制，本頁不承諾通用複合型別編輯器。

## 引用與被引用

- **直接資料輸入**：[Port](../model/port.md)；已接線狀態由呼叫者計算後傳入，函式不直接讀 Edge。
- **直接執行期呼叫者**：[Canvas](../../../production/src/features/canvas.ts) 的節點呈現迴圈；[Node browser](node-browser.md) 的 `choose` 預覽。
- **例子／被說明對象**：[Multiply](../nodes/multiply.md) 使用同一接口呈現，沒有專屬接口行實作。
- **原始碼證據**：[node-browser.ts](../../../production/src/features/node-browser.ts) 的 `nodePortRow`；[共用樣式](../../../production/apps/web/style.css)。
- **數值編輯與契約**：[Inspector](../../../production/src/features/inspector.ts)、[View mount 契約](../../../handoff/16_VIEW_MOUNT_CONTRACT.md)、[Panel 命令契約](../../../handoff/17_PANEL_COMMAND_CONTRACT.md)。

[回五頁索引](../index.md)
