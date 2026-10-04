---
id: grape-model-port
title: "Port｜接口"
category: model
source_revision: "30c867945c992d25956a2a32825de34571f7749e"
---

# Port｜接口

接口描述節點可接收或輸出的資料：例如 Multiply 的 A 是浮點輸入，Result 是浮點輸出。
畫面的 socket 圓點是接口的操作入口，不是接口資料的擁有者。

實作 I：`30c867945c992d25956a2a32825de34571f7749e`。文件基底 R：`a4a6e72b1a7ade9ee3c4b2f782c1da4358faa3e3`。
本頁依目前資料型別與呼叫處整理，沒有新增執行期驗證結論。

## 實際型別與擁有權

目前資料型別是 `PortSnapshot`；這裡沒有一個自行持有 Graph 或自行接線的 `Port` 類別。
模組的 `NodeDefinition.ports` 宣告接口，Graph 在建立／調整節點時驗證 schema 與型別。
已建立的資料放在 `NodeDocument.ports`，由 canonical Graph 擁有。

名稱雖含 Snapshot，`ports` 也是文件中的最後已知接口快照，用於保存缺少定義時的資訊。
它與 `Graph.capture()` 回傳的脫離原資料、唯讀圖快照是不同層次。
畫面可讀取快照，不能藉由修改快照或 DOM 改寫 Graph。

## 主要欄位

| 欄位 | 含義 |
| --- | --- |
| `key`、`direction` | 節點內穩定 key 與 input／output；同方向與 key 的組合不可重複 |
| `type` | 可解析的資料型別 token，例如 `glsl.float`；不是顯示名稱 |
| `supply` | 可選的 `local`／`required`，描述輸入供值要求 |
| `defaultValue` | 可選的初始本地值；建立節點時會驗證並填入輸入值資料 |
| `requireConstant` | 是否要求常數輸入；不是看到數字就當作常數 |
| `connectionPolicy` | `default`／`numeric`／`exact` 的接線策略；與型別及節點接受規則共同判定 |
| `semantic` | 可選的語意提示，不是接口身分 |

Edge 的端點保存 `nodeId` 與 `portKey`；所在 network 和 from／to 分別補足範圍與方向。
顯示用標籤可以與 key 不同，重新命名顯示文字不應被當成建立新接口。

## 本地值、連線與畫面

未接線輸入使用 `NodeDocument.inputValues[key]`；`defaultValue` 是建立／schema 的預設資訊，不是另一份即時值。
有效 Edge 供值時，本地值保留，但產碼讀連線來源；可編輯性仍由目前參數與連線狀態決定。
例如 [Multiply](../nodes/multiply.md) 的 A 原本是 `1`，改成 `3` 後再接線，移除連線可恢復使用 `3`。

Canvas 把當前接口、標籤、已接線狀態與本地值交給 [Port row](../ui/port-row.md)。
socket 的 hover／焦點／暫時接線提示屬於 UI，不會寫進 `PortSnapshot`。
F2 讀取有效焦點物件的資料；load、occurrence、revision 與 edit token 等守衛不能靠持久 ID 取代。

## 限制與錯誤

- 接線前需確認端點存在、方向相反、型別可接受；詳見 [Edge](edge.md)。
- `exact` 不允許把不同型別當成可自動轉換；未知型別也不能只憑文字相似接受。
- schema 變更可能留下無效連線／診斷；最後已知快照不代表目前可成功產碼。
- UI 的 `data-port`、圓點元素與短期操作權杖不屬於文件的接口資料。

## 引用與被引用

- **資料使用者**：[Multiply](../nodes/multiply.md) 宣告接口；[Edge](edge.md) 以端點識別它；[Port row](../ui/port-row.md) 接收其顯示資料。
- **原始碼證據**：[document.ts](../../../production/src/sdk/document.ts) 的 `PortSnapshot`、`NodeDocument`；[graph.ts](../../../production/src/model/graph.ts) 的 `schema`、`Graph.capture`、`Draft.parameter`。
- **型別與持久契約**：[types.ts](../../../production/src/definitions/types.ts)、[文件格式](../../../handoff/14_DOCUMENT_FORMAT.md)、[架構擁有權](../../../handoff/02_ARCHITECTURE_SPEC.md)。

[回五頁索引](../index.md)
