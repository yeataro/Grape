# S04 操作導覽（已驗收版本）

Human 已確認「測試通過OK，請發起PR。」本文件補齊日後重現操作所需的步驟，不要求再驗收。S04 已接受；合併與下一 Slice 尚未授權。

入口：[S04 版本頁](http://127.0.0.1:4192/review.html) → 開啟工作區。這是同一台電腦上的既有服務，頁面應顯示 **S04-web-0c13932**。請用桌面 Chromium，保留瀏覽器儲存權限；不要清除站點資料。

- 實作 I：`0c13932150bf1b78f215e25721292962e6c4263a`
- 獨立審查 R：`985357be67cce2f2ecc232e827e83e5cdbb521ab`，報告 `S04-FR-985357b-01` 為 PASS。
- [正式建置封存](../../../s04/submission-01/candidate-web-01.tar.gz) SHA256：`24b1420e04871cd76cc2a3745b1d7100aadba43db632dfa809975327e312d3b1`。現有網頁的三個產物檔與原封存一致，沒有重新建置或更換版本。

## 操作前提與範例

按 **New document** 建立測試文件。Personal 插入前，整張目的圖必須有效：先按 **Add Float**，點 Float 的 **value** 輸出，再點 Image output 的 **color** 輸入。連線操作是依序點兩個接點。若卡片重疊，可按 **Arrange nodes**。不要把範例的陣列輸出直接接到 color。

先下載要用的範例；若瀏覽器直接顯示 JSON，將它另存為原檔名，不修改內容。它們都是原審查範例的逐位元組副本，下載及檔案雜湊已核對，見 [delivery-verification-01.json](delivery-verification-01.json)。

| 直接取得範例 | 用途 | 匯入後名稱 |
| --- | --- | --- |
| [literal.sgrape-function.json](http://127.0.0.1:4192/samples/literal.sgrape-function.json) | 固定陣列長度 | Portable array |
| [source.sgrape-function.json](http://127.0.0.1:4192/samples/source.sgrape-function.json) | 由來源決定長度 | Portable array |
| [direct-source.sgrape-function.json](http://127.0.0.1:4192/samples/direct-source.sgrape-function.json) | 直接來源引用 | Portable array |
| [input.sgrape-function.json](http://127.0.0.1:4192/samples/input.sgrape-function.json) | 由子圖輸入決定長度 | Portable array |
| [nested.sgrape-function.json](http://127.0.0.1:4192/samples/nested.sgrape-function.json) | 巢狀子圖與引用依賴 | Nested array |
| [invalid-missing-source.sgrape-function.json](http://127.0.0.1:4192/samples/invalid-missing-source.sgrape-function.json) | 故意缺少依賴的拒絕案例 | 不應新增項目 |

前四個合法檔案名稱相近，請逐個操作，或按清單顯示的檔名區分，不只看 Portable array 標題。

## 人可以直接確認的事項

1. **純量可以接到畫面輸出。** 在新文件按 Add Float，點 Float 標題，在 Inspector 的 **Value** 輸入 `0.5` 後按 Enter；連 value → color，再按 **Generate GLSL**。應出現連線與 GLSL 文字。按 **Undo** 移除剛建立的連線，按 **Redo** 恢復。此處沒有 shader 圖像預覽，不必找畫面顏色變化。
2. **不同長度向量也可以接入。** 每次用新文件按 **Add Compose**，選卡片，在 **Shape** 選 `vec2`、`vec3`、**RGBA (vec4)**；填 **R / X、G / Y**，需要時再填 **B / Z、A / W**，每個數字按 Enter。連 **result → color**，按 Generate GLSL。三種形狀都應成功；vec2 補 Z=0、W=1，vec3 補 W=1，vec4 不變。完整數值矩陣已自動驗證，不要求手算 GLSL。
3. **個人子圖可保存、去重及匯出。** 保留有效的 Float → Image output 連線，按 **New subgraph**，它會被選取。開 **Personal Library**，按 **Save selected subgraph**，應顯示 Saved 與一筆資料；再按一次應顯示 Reused，不新增相同內容。按 **Export selected subgraph**，應下載套件。
4. **合法範例可以匯入及重複使用。** 在 Personal Library 的檔案選擇器 **Import Personal package** 選一個合法範例，應出現對應項目。按 **Insert Portable array**（nested 則為 **Insert Nested array**）；對話框會關閉。再開 Personal Library，插入同一筆一次，應看到兩個子圖呼叫。依序換其餘合法檔案重複確認，目的圖始終保持有效。可按該列的 **Export Portable array／Export Nested array** 下載，再匯入；相同內容應重用。完整依賴、重新對應及子圖 shader 編譯由已通過的自動測試保證，不能只靠看到項目判定。
5. **修改圖上的共享副本不覆寫 Library 原件。** 使用第 3 步保存的 Subgraph，從 Library 插入兩次。選其中一個 → **Enter subgraph** → 展開 **Subgraph interface** → 將 **Subgraph name** 改為 `Edited copy` → **Apply interface** → **Up**。共享此定義的既有卡片應一起改名。再插入 Library 中原保存的 Subgraph，新卡片仍應叫 Subgraph。介面沒有「本機／Library」徽章，以此可見差異確認。
6. **指定一份副本可以獨立。** 接續第 5 步，選一張 Edited copy → **Make independent** → Enter subgraph → 在 Subgraph interface 改名為 `Independent copy` → Apply interface → Up。應只有這份改名，另一張仍叫 Edited copy。Undo／Redo 可撤銷／恢復改名；「獨立」是前一個獨立的 Undo 步驟。
7. **同名而不同內容不覆寫舊資產。** 將一個圖上子圖內容修改後，保留與原資產相同的 Subgraph name，選取它並 Save selected subgraph。Library 應保留原件，另一筆檔名帶區別後綴。不要只以相同顯示名稱判斷是否覆寫。Graph 的 Undo 只撤銷圖上操作，不刪除已保存的 Library 資產。
8. **缺依賴必須整筆拒絕。** 記住當前 Library 項目與畫布內容，再透過 Import Personal package 選 invalid-missing-source 範例。應顯示依賴錯誤，不新增資產、節點或連線。此檔 checksum 正確；拒絕原因是內容依賴不完整。
9. **文件能保存及重開。** 保留上述可用圖，按 **Save**，等候 **Saved to this browser.**／**Saved**；按 **Open saved** 選剛保存的文件，通常名為 Untitled shader。若同名文件很多，改用 **Export JSON → Open file → 選下載檔 → Open in new session**。節點、連線和插入的子圖應保留；新 session 的 Undo 記錄重新開始。匯出的新文件格式為 grape.document 2.1。Personal Library 是瀏覽器原點的獨立儲存，重開文件不會清除資產。

## 已完成的技術驗證與邊界

上述人工步驟對應 AT-S04-01／02／03 與 DEC002 的可見連線、保存行為。十一個驗收家族均已獨立 PASS：179 項單元／架構、54 項瀏覽器、10 項 bootstrap fixture，另有 9 組獨立反例及正式封存 UI 檢查。16 組轉換數值、exact port 拒絕、失敗回復、型別權威、typed reference remap、2.0／2.1 舊 reader 矩陣、精確 module pin 和舊定義保留都是自動技術驗證，不要求 Human 重跑。詳見原 [Human review 索引](../../../s04/review-01/HUMAN-REVIEW.md)；其中「尚未驗收」是保留的歷史狀態，已由本次接受登記取代，原 PASS 仍只綁 I/R。

- 測試環境是 Windows x64、Chromium 151.0.7922.34、1440×1000、WebGL2；renderer 為 WebKit WebGL，未宣稱實體 GPU 或其他平台資格。普通 Generate GLSL 只產生程式文字。
- Library 限額為 64 檔、每檔 256000 bytes、合計 4000000 bytes；瀏覽器交易完成不等於磁碟、crash 或雲端耐久性。此處不是原生目錄管理器。
- input-bound 保存定義預設值；圖上 caller 的覆寫值属于該次使用。共享定義需一致的常數綁定。nested 指巢狀子圖／引用依賴，不增加多層陣列型別。
- 舊精確定義不會自動升級；S02 Legacy v1 轉換仍未交付。沒有完整 Legacy catalog、原生 Host／TouchDesigner 或任意 extension/profile 承諾，也沒有關閉全域 Gate。
- 完整 DEC003／AC002 function-mode 尚未交付；S05 未啟動。配色、排版與選取框改善留待 S06，屆時需實際參考既有 Legacy UI/UX 包；本次沒有外觀改動，S06 亦未啟動。
