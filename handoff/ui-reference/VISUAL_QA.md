# Schematic visual QA

本紀錄只驗證兩張交接用 SVG 在指定尺寸下的可讀性。它們是 **HANDOFF SCHEMATICS**，不是 Legacy 或新版產品截圖，不證明 UI 行為、瀏覽器互動、跨平台相容性或 architecture gate 已通過。

| Item | Record |
|---|---|
| Render time | 2026-10-01 19:15:52 UTC / 2026-10-02 03:15:52 Asia/Taipei |
| Visual inspection time | 2026-10-01 19:16 UTC / 2026-10-02 03:16 Asia/Taipei |
| Tool | Playwright 1.62.1，明確使用 PACKAGE_VALIDATION.json 所記錄的 modulePath；headless Microsoft Edge 154.0.4258.48 |
| Runtime | Node.js v25.5.0；deviceScaleFactor = 1 |
| UIR-01 viewport | 1280 × 760；[rendered PNG](rendered/workspace-schematic.png) |
| UIR-02–04 viewport | 1280 × 690；[rendered PNG](rendered/states-schematic.png) |
| Inspection | 兩張 PNG 均經 `view_image` 實際查看；不以 XML parse 代替視覺檢查。 |
| Result | 此尺寸下未見文字被裁切、區塊重疊或連線遮蓋重要標籤。Canvas／Inspector 邊界、draft 與 model 值、兩個 Context 與共用 Graph，以及 missing-module 的保存／產碼差異均可辨識。未因此修改視覺設計。 |
| Evidence | [RENDER_RECORD.json](rendered/RENDER_RECORD.json) 記錄來源與產物 SHA-256、viewport、工具與時間。 |

`render-schematics.mjs` 可重現靜態文件渲染；它讀取現有 package evidence 的明確瀏覽器工具位置，不自動安裝或猜測瀏覽器。它不執行產品程式或新的架構實驗。

未驗證：產品 DOM、鍵盤／IME／指標互動、響應式版面、使用者縮放、非此 viewport、其他字型環境、Safari／Firefox、native TD Viewer，以及無障礙操作。SCREEN_INDEX 的行為驗收方框仍保留未勾選。
