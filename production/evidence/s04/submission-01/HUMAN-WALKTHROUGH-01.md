# S04 待獨立審查／Human 驗收導覽

此材料綁定 implementation I `0c13932150bf1b78f215e25721292962e6c4263a`。目前只有實作者檢查通過；尚無獨立 PASS、Human 驗收、完成登記或發布授權。

1. 將同目錄 `candidate-web-01.tar.gz` 解壓至新的資料夾，以本機 HTTP 服務開啟。先核對 `build-manifest-01.json` 中的三個內容檔雜湊。這是已保存的正式建置，不需以開發伺服器重新編譯。
2. 新畫布新增 Float，將 value 調成 0.5，連到 Image output 的 color。按 Generate GLSL 應成功；Undo／Redo 應還原同一條連線。再用 Compose 的 vec2、vec3、vec4 形狀試接。邊界一律是 vec4：vec2 補 Z=0、W=1，vec3 補 W=1，scalar 的四個分量均為原值。
3. 新增一個 Subgraph，選取它後開啟 Personal Library。Save selected 存成瀏覽器 Library 資產，Export selected 下載自足套件。重複保存會重用相同內容；檔名相撞時使用後綴，不覆寫原檔。
4. 在 Personal Library 的 Import Personal package 選擇 `samples/literal.sgrape-function.json`，再依序匯入 source、direct-source、input、nested 範例。每個合法套件須通過依賴與生成資格檢查才列出。選 Insert 可插入兩次；它們重用同版本定義。進入其中的子圖做語意編輯後，應看到本機快照分離；Make independent 僅複製直接定義及其必須擁有的引用，普通子依賴仍共享。
5. 匯入 `samples/invalid-missing-source.sgrape-function.json`。它的 checksum 正確，但缺少長度來源，因此必須顯示錯誤，不增加 Library 或 Graph 內容。保存文件後重新開啟，已插入的定義應保留；Graph Undo 不會刪掉已保存的 Library 檔案。
6. Export JSON 應輸出 `grape.document 2.1`。舊 2.0 文件以額外的明確 envelope upgrade 開啟；舊精確 Image Output 定義仍保持原本的 exact 型別規則，不會只因新版本存在而替換。

完整自檢：179 項單元／架構測試、54 項瀏覽器測試、10 項 bootstrap fixture 測試。`coverage-01.json` 對應 11 個驗收家族、7 個 capability 及 scoped Gates。16 組轉換有實際 WebGL2 像素結果；Personal 五個 fixture 類別有生成後的 WebGL2 shader 編譯結果。一般生成仍為 GLSL 產物，不是完整預覽功能。

本候選限定 Windows x64 Chromium 151.0.7922.34、Playwright 1.62.1、1440×1000、WebGL2 與瀏覽器原點 IndexedDB。Library ACK 代表交易被接受，不是 crash／磁碟／雲端耐久性保證。未宣稱 TouchDesigner、原生檔案目錄、實體 GPU、Safari／觸控裝置或完整 Legacy 內建 catalog 資格。S02 Legacy v1 轉換仍 blocked；完整 DEC003 function-mode、S05 與下一 Slice 都尚未交付／啟動。
