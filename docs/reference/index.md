---
id: grape-reference-pilot
title: "Grape 物件參考｜五頁試作"
category: index
source_revision: "30c867945c992d25956a2a32825de34571f7749e"
---

# Grape 物件參考｜五頁試作

這五頁從一個計算節點往外，說明接口、連線與共用 UI 的責任、操作和相互關係。
適合先了解物件在做什麼，再沿引用找到實際程式或契約；[關係怎麼讀](#關係怎麼讀) 區分不同引用，不必先讀整份 SDK。

實作 I：`30c867945c992d25956a2a32825de34571f7749e`。
文件基底 R：`a4a6e72b1a7ade9ee3c4b2f782c1da4358faa3e3`；產品 build：`S06-debug-30c8679`。
本試作未提交，供 Human 先閱讀。來源碼核對不是新的產品執行測試、獨立 PASS 或 S06 驗收。

## 五個條目

| 分類 | 條目 | 從這頁可以了解 |
| --- | --- | --- |
| 節點 | [Multiply](nodes/multiply.md) | 固定 float Pixel 乘法、A／B 本地值與輸入來源 |
| 模型 | [Port／接口](model/port.md) | 接口身分、型別、Node／Graph 擁有權與持久快照 |
| 模型 | [Edge／連線](model/edge.md) | 端點、轉換方案、驗證、History 與產碼 |
| UI | [接口行／Port row](ui/port-row.md) | 共用顯示函式、socket／標籤／值及呼叫者責任 |
| UI | [節點瀏覽與新增面板](ui/node-browser.md) | Create／Browse、查看、拖出、放置與 Output 落線分支 |

## 關係怎麼讀

每頁末尾均有「引用與被引用」，反向入口也列在下表。
**執行期／資料關係**表示真的使用型別、資料或函式；**概念關係**只是幫助理解；**文件證據**是核對依據。
例如 Edge 以 nodeId／portKey 指向接口，並不保存 Port row 的 DOM，也不直接呼叫它。

| 起點 → 相關條目 | 關係 | 反向入口 |
| --- | --- | --- |
| Multiply → Port | 定義宣告接口 | Port 頁的資料使用者 |
| Edge → Port | network 內端點識別與型別驗證 | Port 頁的接線說明 |
| Port row → Port | 函式接收接口顯示資料 | Port 頁的畫面說明 |
| Node browser → Port row | 直接呼叫函式畫新增預覽 | Port row 頁的直接呼叫者 |
| Node browser → Edge | 請 Application／Graph 一次新增並接線 | Edge 頁的命令呼叫者 |
| Multiply ↔ Node browser | 通用目錄中的例子，非專屬硬寫依賴 | 兩頁各自的例子與入口 |

## 閱讀界線

- 名稱相同不保證與 Legacy 能力相同；Multiply 以本版固定 float 定義為準。
- Node browser 頁分開列明目前來源碼與 Owner 的單擊原地新增疑慮；本次未判定或修理該疑慮。
- 只涵蓋這五頁，不是完整型別／節點／操作手冊，也不整理仍在收集中的其他 UI 意見。
- YAML 頁首僅提供穩定 id、標題、分類與來源 revision；一般 Markdown 即可閱讀，未安裝或驗證 Jekyll 網站。
- 文件記載固定來源，不是平行的專案狀態庫；目前狀態仍以 [implementation-state.json](../../implementation-state.json) 為準。

[回專案 README](../../README.md) · [本次試作授權](../../production/evidence/coordinator/s06/manual-pilot-01/human-authority-01.json)
