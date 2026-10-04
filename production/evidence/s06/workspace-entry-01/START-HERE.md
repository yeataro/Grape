# S06 工作區候選：操作指南

版本：**S06-workspace-cc92048**。實作 I：`cc920485e005825fea007863f0815cf7c0a5437b`。這是交付獨立審查的第一批工作區功能；S06 仍進行中，尚未取得獨立 PASS 或 Human 接受。

封存候選：[candidate-web.tar.gz](build-final-01/candidate-web.tar.gz)。精確檔案與 SHA-256：[build-manifest.json](build-final-01/build-manifest.json)。封存 SHA-256：`8f4541643265aa6762f6c6b0ee30fc8f58a8875ad39bfb5d5d0bbe731b7c6d88`。

## 準備與入口

候選已在隔離的本機瀏覽器中實際操作；測試用臨時服務已關閉。目前不宣稱任何既有預覽埠正在提供這個版本。Coordinator 取得獨立結果後，可用上述封存檔準備正式測試入口。不要用舊預覽的版號代替本候選。

審查者可將封存解壓到新的 `.verification/s06-manual-preview`，核對 manifest 的三個檔案，再從 repository root 執行：

```powershell
node production/node_modules/vite/bin/vite.js preview production --outDir C:/Users/user/source/Grape/.verification/s06-manual-preview --host 127.0.0.1 --port 4210 --strictPort
```

在獨立瀏覽器設定檔開啟 `http://127.0.0.1:4210/`。此指令只提供本機候選；如該埠已使用，停止並選擇新的測試埠，不要關閉別人的服務。既有 4193–4196 與 Human 儲存資料未被改動。

## 可直接取得的範例與確認步驟

1. **基本操作與保存**：下載 [workspace-color.grape.json](samples/workspace-color.grape.json)。選 **Open file → Review document → Open in new session**。畫面應有 Color RGBA 連到 Image output。點 Color RGBA，在 Inspector 修改 R/G/B/A，按 **Generate GLSL** 應成功；再 **Save → Open saved**，應保留同一內容。這是生成程式碼的工作區，沒有新增即時 Host 預覽承諾。
2. **搜尋、預覽與取消**：點 **Add Node**、Canvas 的空白處按 Tab，或雙擊空白處。搜尋 `Multiply`，點加號，移動預覽；尚未放置前文件不變。按 Escape 取消，或在空白處點擊放置。放置後一次 Undo 應移除整個新增節點。搜尋用字面文字，支援全形字正規化、名稱／別名／分類及來源與埠型別篩選。
3. **查看節點**：點 **Browse nodes**，單擊列查看介面。查看與篩選不改文件。加號或雙擊可插入，拖曳列到有效空白 Canvas 才建立；放到工具列、另一個 Canvas 或取消則不建立。Project 範圍提供目前文件已有的來源與子圖引用。
4. **vec2 連線建立**：開啟 [vec2-destination.grape.json](samples/vec2-destination.grape.json)。在 Subgraph 的 **Value 輸入埠**按右鍵，選 **Create connected node**，搜尋 `Compose`，雙擊列。預覽應顯示 vec2 和兩個輸入。點空白處放置後應建立 vec2 Compose 與連線；一次 Undo／Redo 同時移除／恢復兩者。[vec2-connected.grape.json](samples/vec2-connected.grape.json) 是已完成範例。兩個 vec2 範例故意尚未連 Image output，成功匯入後的 `INPUT_REQUIRED` 是預期提示。
5. **Stage 與子圖**：用 **Pixel／Vertex** 切換目前 Graph 的 Stage。選 Subgraph 後點 **Enter subgraph**，以 **Up** 或 breadcrumb 返回。這些導航不增加 Graph History；不同 Canvas 保留各自視圖。清單只顯示該 Stage／profile 可用的已安裝節點。
6. **快捷鍵與拖曳**：點 **Shortcuts** 查看實際支援按鍵。對话框內 Tab 保持焦點，Escape 返回開啟按鈕。在 Canvas 使用 H／F 檢視全部／選取，Delete 刪除，Ctrl+Z／Ctrl+Shift+Z 復原／重做。拖節點時直接按 Escape，再放開滑鼠，位置應回復且沒有這次拖曳的 History。輸入框保留文字與 IME 操作；不要先用程式設定焦點來測試 Escape。
7. **窄視窗與錯誤**：縮窄視窗，**More actions** 應保留原本文件與 Library 控制；Stage、Undo／Redo 仍可操作。未解決的生成或連線錯誤不會因無關的 Save 或移動成功而消失。
8. **Personal**：在 **More actions → Personal Library** 搜尋、查看、匯入／匯出既有資產。Readonly 仍可查看，但不可插入。非法匯入應保留目前圖與清楚錯誤；關閉後再開啟，前一次延遲工作不可覆蓋新對話框。

## 已執行的技術驗證

- 239 個單元／一致性案例；型別、模組指紋與 56 個來源邊界檢查。
- 132 個 localhost 瀏覽器案例，包括既有 S01–S05 匯入、14 個交付範例、Replace、Personal、跨 Stage Uniform 與固定值回歸。
- 新封存檔上的 25 個公開工作區／自然 Escape 案例，加 5 個獨立封存 smoke 案例；實際 WebGL2 讀回 `[64,128,191,255]`。
- 根目錄 473 項檢查、411 個 indexed files／412 個 frozen files 與 10 個維護 fixture；最終 state 再檢查另列紀錄。

以上為實作者檢查，不代替 Fresh Review 或 Human 接受。完整證據見 [submission-01.json](submission-01.json)，每個葉項／操作／限制見 [coverage-final-01.json](coverage-final-01.json) 與 [commands-and-shortcuts-01.json](commands-and-shortcuts-01.json)。

## 界線

本批沒有新增完整 shader catalog、任意 Panel layout/preset、Host/native 控制、次要分類／GLSL-name／tag metadata 或統一 Personal template catalog。G-PD-2 的超過 100 個 named preset 政策仍未決。本機 Windows Chromium 151／SwiftShader 與可信 touch 模擬不能代表實體觸控、全部 IME／輔助功能或其他平台。LAN／Tailscale 交付義務已由 Owner 移除；歷史 denied checks 仍為 NOT_EXECUTED，沒有改標 PASS。
