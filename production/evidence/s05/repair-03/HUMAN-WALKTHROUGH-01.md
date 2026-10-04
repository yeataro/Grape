# S05：分清「開新文件」與「替換目前內容」

候選 I：`ee1212fdc54359f1ceba4c4b09f6e7cc06cddc41`；build：`S05-web-ee1212f`。這份修正仍待獨立複審；由 Grape Coordinator 在 PASS 並部署後提供對應入口，現在不要求 Human 重試。現有4193／4194未被本輪變更。

原本不是當機：檔案本身有效，但它與目前文件的模組版本或輸出設定不同，不能在同一編輯階段直接替換。原先只在按下後顯示 IMPORT_DEFINITIONS，現在會先停用不適用的 Replace 並說明原因。

- 在一般目前文件按 **Open file**，選本版 [legacy-owner.grape.json](samples/legacy-owner.grape.json)。範例仍是10296 bytes，SHA256 `2bc735a55637ee42f7beeef7687a6e687fa62a8154dfc36cef3d4ebc152fbb86`，沒有改檔。
- **DOCUMENT_VALID** 表示檔案有效。若 **Accept replacement (one Undo)** 停用，閱讀旁邊說明；可按 **Close** 留在目前文件，或 **Export original** 保存原檔。
- 要開啟這份範例，先保存目前工作，再按 **Open in new session** 並確認放棄目前未保存內容。進入後按 **Upgrade subgraph owners**；明示升級為 Expand，再按 **Generate GLSL**、**Save**，重新整理後 **Open saved** 應能繼續編輯與生成。
- 要確認可相容的 Replace：先用 **Open in new session** 開啟原範例，暫時不要升級；按 **Add Float** 後重新選同一原範例。此時 Replace 可用。按下後多加的 Float 移除；一次 **Undo** 恢復，一次 **Redo** 再次替換。升級之後與原檔的模組版本不同，Replace 停用是預期保護。

工程端已測試不相容、過期及無效候選的拒絕與保全、相容替換的一次 Undo／Redo，以及全部14份範例。這些自動檢查不要求 Human 重做。Vertex只需解釋的問題保持已解決；沒有新增 Vertex 修改或重測。S05仍 active／未接受，全catalog尚未完成。
