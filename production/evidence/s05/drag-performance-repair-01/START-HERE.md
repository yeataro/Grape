# S05 拖動效能修復候選

候選版本 **S05-drag-aa4c86e**，實作 I **aa4c86e20b0b4b54218b9992921578e7f24a28a2**。本候選尚待新的獨立審查；此文件不要求現在重新驗收，也沒有部署到既有測試入口。S05 仍在進行中，完整節點目錄尚未完成。

修復內容：每次同步讀取編輯狀態時，共用該次已分離的快照。拖動、欄位更新、唯讀／忙碌狀態、取消及 Undo/Redo 的通知與驗證均保留。

## 之後的人工確認

前提：由協調員完成 exact I/R 獨立 PASS 並部署相符封存版本後，使用協調員提供的入口。不要把目前4193／4194／4195當作此候選。

1. 下載 [14節點 Multiply 場景](performance-01/fixture-14-Multiply.json)。在新測試分頁使用 **Open file → Review document → Open in new session**；此步會開新文件，原文件若有修改先保存。
2. 選取 Multiply，使 Inspector 顯示 A、B 欄位。連續拖動幾次，確認節點跟隨游標、欄位值不變。
3. 拖動完成後按 **Undo**，應回到這一次拖動前位置；按 **Redo**，应回到完成位置。進行另一拖動後按 Escape，應取消該次拖動。
4. 用同樣步驟開啟 [14節點 Image Output 場景](performance-01/fixture-14-Image-output.json)，拖動 Image Output 作比較。另有 [4節點 Multiply](performance-01/fixture-4-Multiply.json)／[4節點 Image Output](performance-01/fixture-4-Image-output.json)。檔案是相同圖內容的對應位置配置；14節點場景含10個未連線 Multiply。
5. 需要檢查既有能力時，可用 [Vector2 Function 範例](samples/vec2-pixel-function.grape.json)：公開檔案開啟、進入 Subgraph、修改 X/Y、Undo/Redo、Generate GLSL、Save/Reopen。預期保持相同值與成功生成。四種固定值、vertex與pixel範例列於 [範例清單](samples/manifest.json)；先前14個交付範例的原樣副本在 [legacy-samples](legacy-samples/manifest.json)。

## 已完成的自動技術檢查

- 227項單元／契約、106項隔離瀏覽器、10項維護fixtures，以及型別、owner、boundary、build和根目錄完整性檢查通過。
- 新封存包實際經公開檔案流程重播13範例；其中12例以真正WebGL2編譯、連結、像素讀回或vertex transform feedback確認數值。2個既有授權HTTP位址只暫時提供3個驗證過的靜態檔案，Personal checksum／往返／ID檢查通過，測試服務已關閉。
- 78次效能拖動量測保留原始軌跡。14節點Multiply的未插樁輸入處理率中位數28.48→58.09次／秒；Graph.capture19544→2540。這是Windows／Headless Chromium／SwiftShader的本機結果，並非畫面FPS或所有裝置保證。

封存包：[candidate-web-01.tar.gz](candidate-web-01.tar.gz)，SHA256 **8fefd2e02eb9d78610ae68c553926bd7ba6604769d306e810c2fc8dda5279a62**。原始報告：[performance-comparison-01.json](performance-comparison-01.json)。舊獨立PASS仍只綁原I/R；新審查、Human接受、發布及merge尚未發生。
