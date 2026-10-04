---
id: grape-ui-node-browser
title: "節點瀏覽與新增面板"
category: ui
source_revision: "30c867945c992d25956a2a32825de34571f7749e"
---

# 節點瀏覽與新增面板

用名稱、來源與型別尋找目前可用的節點，查看資訊，或開始新增。
Create 與 Browse 使用同一個 `mountNodeBrowser`，操作模式不同，沒有兩套獨立目錄。

實作 I：`30c867945c992d25956a2a32825de34571f7749e`。文件基底 R：`a4a6e72b1a7ade9ee3c4b2f782c1da4358faa3e3`。
本頁描述此版本的程式分支；Owner 目前仍對「單擊原地新增」有疑慮，本次文件工作不判定其已解決。

## 責任與組成

Canvas 掛載面板，提供目前 context、相機與 mount lease；`services.catalog` 回傳 `CatalogEntry` 候選。
候選包含精確定義、參數選型、接口與 scope／revision；目錄顯示不自行持有正式節點。
Application 重新核對候選與操作權限，再以 `grape.node.add` 進入 Graph；有接線時同批建立節點及 Edge。

面板包含搜尋欄、來源／library scope／接口型別篩選、分類列、名稱按鈕、每列的「＋」與詳情區。
`catalogRank` 做 NFKC、轉小寫與去除首尾空白；搜尋是字面詞比對，不是正規表達式或語意搜尋。
空搜尋可依分類展開；wired 候選優先排精確匹配，再依文字排名等條件排列。
詳情顯示模組提供的名稱、來源、描述、aliases 與接口簽名，不等於完整物件手冊。

## 操作與結果

下表是**此 I 的來源碼行為**；正式圖變更都必須通過當下的權限與新鮮度檢查。

| 入口／操作 | 結果 |
| --- | --- |
| 一般 Create：單點名稱 | 選中該列並查看詳情，尚未新增 |
| 一般 Create：雙擊名稱、點「＋」、搜尋欄 Enter | 進入節點預覽，再在有效 Canvas 空白主鍵點擊放置 |
| Browse：單點名稱或搜尋欄 Enter | 查看詳情，不新增 |
| Browse：雙擊名稱或點「＋」 | 插入 Canvas 視口相對位置 `(180,160)` 換算出的圖座標；不是滑鼠當前位置 |
| 一般列的名稱／「＋」拖出 | 移動超過 4 px 進入預覽，於有效 Canvas 放開時新增；觸控名稱列不啟動此拖出路徑 |
| Output 線拖到空白放開後的相容清單 | 捕捉落線圖座標；單點名稱、「＋」或搜尋欄 Enter，直接在該點新增並接線，不再要求第二次放置 |

一般預覽移動／放置及拖出放置會對齊 24 圖座標單位；Output 落線捕捉分支直接使用捕捉座標。
移動或限制面板位置不應改寫已捕捉的落線座標；相機縮放改變會使目前提案失效。
面板標題可拖移，不會因此建立節點或寫入 Graph History。

## 從哪裡開啟

Canvas 的 Add Node、Browse nodes，以及空白處雙擊等既有入口會開啟此共用面板。
一般 Create 仍是預覽／放置流程；不能把 Output 落線分支套用到所有單擊操作。
已接線 Input 拖到空白放開屬於 [Edge 斷線](../model/edge.md)，不會走新增清單。
socket context menu 所帶的 wired 候選也不必然具有 `atRelease` 捕捉；勿把它描述成新增的右鍵跟隨滑鼠路徑。

## 取消、唯讀與失效

Escape 可關閉面板／預覽，預覽中的 Tab 亦會取消；組字時不接管這些文字操作。
點到不合法放置處、blur、resize、隱藏或 pointercancel 等事件會依現有流程取消。
context scope、Graph revision 或 zoom 改變時，舊候選不能繼續提交；close／dispose 清理事件與 DOM。
Readonly 可瀏覽，但不能新增；UI 預覽與詳情不是 Graph 編輯，只有成功提交才進 History。

例子：搜尋 [Multiply](../nodes/multiply.md)，一般 Create 點「＋」後先出現預覽，再點 Canvas 放置。
如果是從 Output 拉線放開後搜尋 Multiply，則名稱單擊走捕捉落點的原子 create＋connect 分支。
這兩條路徑與 Owner 回報須分開核對，文件不以舊自測結果否定新的操作疑慮，也不在此修改產品。

## 引用與被引用

- **直接 UI 呼叫**：`choose` 使用 [Port row](port-row.md) 畫預覽；Canvas 呼叫 `mountNodeBrowser` 與其 `open`／`update`／`cancel`。
- **資料與命令關係**：[Port](../model/port.md) 是候選接口；[Edge](../model/edge.md) 由 Application／Graph 在成功提交時建立。
- **目錄例子／概念關係**：[Multiply](../nodes/multiply.md) 由已安裝定義通用列舉，不是面板硬寫的節點。
- **原始碼證據**：[node-browser.ts](../../../production/src/features/node-browser.ts)、[Canvas](../../../production/src/features/canvas.ts)、[editor.ts](../../../production/src/application/editor.ts) 的 `creationCatalog` 與 `grape.node.add` 分派；[UI DTO](../../../production/src/sdk/ui.ts) 的 `CatalogEntry`。
- **契約與歷史證據**：[Panel 命令契約](../../../handoff/17_PANEL_COMMAND_CONTRACT.md)、[既有 OC03 對照](../../../production/evidence/s06/owner-corrections-01/requirement-mapping-01.json)、[本次文件工作包](../../../production/evidence/coordinator/s06/manual-pilot-01/implementer-packet-01.json)。後兩者是文件／證據引用，不是執行期依賴。

[回五頁索引](../index.md)
