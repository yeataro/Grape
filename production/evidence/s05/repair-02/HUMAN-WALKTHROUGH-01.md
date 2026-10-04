# S05：只重試 legacy 開啟與明示升級

此候選等待新的獨立複審。請由 Grape Coordinator 在 PASS 後提供對應入口與下載；目前4193仍是先前版本，這份文件不表示已部署或已驗收。其他已觀察項目保留為正面回饋，不要求 Human 重做整輪。

候選 I：`b0d61c61d35908f6332b439aae539ce87bf854c5`；build：`S05-web-b0d61c6`。R 由提交索引的精確 Git commit 綁定。

1. 先保存目前工作，再下載本版 [legacy-owner.grape.json](samples/legacy-owner.grape.json)（10296 bytes；SHA256 `2bc735a55637ee42f7beeef7687a6e687fa62a8154dfc36cef3d4ebc152fbb86`）。避免選到先前同名的9692-byte檔案。
2. 按 **Open file** 選檔。在 **Review document** 預期看見 **DOCUMENT_VALID** 且有 candidate。按底部 **Open in new session**；若詢問放棄目前未保存內容，確認已保存後按確認。
3. 點 **Subgraph** 節點，按 **Enter subgraph**，展開 **Subgraph interface**。此時模式選單不可用，表示仍是舊 owner。
4. 按頂端 **Upgrade subgraph owners**，再點 Subgraph → Enter subgraph → Subgraph interface。預期模式可用且為 **Expand**，原節點、連線、介面與內容保留。
5. 按 **Generate GLSL**，本版已接好 Image Output，預期成功生成。按 **Save**，重新整理，再按 **Open saved** 選回文件，確認仍可生成及繼續編輯。

原版的 IMPORT_ERRORS 只有未接線的 INPUT_REQUIRED。原版也能用 Open in new session 加上確認來保留該草稿，升級後生成才持續指出缺線；它與嚴格的 Accept replacement 是不同操作。新範例先接好輸出，讓這次升級測試不混入缺線診斷。匯入規則、缺模組與未知模式處理沒有放寬。

工程端已自動完成全部 [14份範例](samples/manifest.json) 的實際檔案／Personal操作、保存往返、六類負面匯入，以及原版錯誤草稿的明示開啟；不要求 Human 重做這些技術檢查。舊 guide、START-HERE、PASS 與範例原樣保留。S05整個391項catalog仍未完成；本版沒有發布、合併或下一Slice授權。
