# S05 首批 function-mode 修復版操作導覽

此修復版等待獨立複審；原始 S05-FR-001 FAIL 原樣保留。尚未請 Human 驗收。S05 仍進行中；這一批是子圖 function-mode 與三種 HTTP 入口相容性，不代表391項 catalog 已完成。正式可點入口與精確 I/R 版號由 Grape Coordinator 在獨立 PASS 後提供；這份文件不表示測試站已部署。請保留原瀏覽器資料，不需清除儲存空間。不同網址的保存資料各自獨立。

所有範例在同目錄 [samples](samples/manifest.json)；部署時應提供每個檔案的直接下載連結。操作前下載所需檔案，使用 **Open document file** 選檔，再按 **Open in new session**；若目前有未保存內容，先 Export JSON 備份。

1. **切換共享模式**：開啟 [shared-expand.grape.json](samples/shared-expand.grape.json)。點任一 Shared arithmetic 節點，按 Enter subgraph，再展開 Subgraph interface。把 Subgraph emission mode 改為 Function。預期所有指向此定義的 caller 共用模式；Generate GLSL 可生成，Undo/Redo 可還原／重做。這只改輸出方式，不把每個 caller 的不同輸入混在一起。
2. **獨立一份**：在上一例回上一層，選一個 caller，按 Make independent。進入這份子圖時模式仍是 Function；把它改為 Expand，另一份仍是 Function。
3. **可復原的斷線**：開啟 [constant-detach.grape.json](samples/constant-detach.grape.json)，進入 Shared arithmetic 並改成 Function。預期提示指出 receiver，要求常量的那條線移除；Generate GLSL 顯示 INPUT_REQUIRED。Export JSON 仍可保存。按 Undo，線、模式與 loss 一起恢復；Redo 重現。改回 Expand 不自動接回線。
4. **不能啟用時不改圖**：開啟 [activation-rejected.grape.json](samples/activation-rejected.grape.json)，嘗試相同切換。預期顯示 CONSTANT_REQUIRED、模式維持 Expand，沒有新增可 Undo 的操作。普通函式參數不因 caller 填常數就變成編譯常量。
5. **Personal 與再次編輯**：按 **Personal Library**，在 **Import Personal package** 選 [shared-function.personal.json](samples/shared-function.personal.json)；匯入會自動處理。選匯入項目後按 **Insert Shared arithmetic**。進入子圖確認 Function。改模式會建立可編輯本機副本；原 Personal 項目保留。可 **Save selected subgraph**、**Export Shared arithmetic**，再匯入；Save、重新整理、Open saved 後仍可操作。
6. **舊資料明示升級**：開啟 [legacy-owner.grape.json](samples/legacy-owner.grape.json)。進入 Subgraph，模式選單不可用；按頂端 Upgrade subgraph owners 後重新進入，模式是 Expand。原範例的 Image Output 未接線，因此 INPUT_REQUIRED 是該例前提，與升級成功無衝突。不要把缺模組或未知模式當作自動 Expand。
7. **可讀的更多範例**：[shared-function](samples/shared-function.grape.json)、[nested-function](samples/nested-function.grape.json)、[uniform-function](samples/uniform-function.grape.json)、[固定陣列](samples/shape-array.grape.json)、[Structure](samples/shape-nominal.grape.json)、[effects](samples/pixel-effects.grape.json)、[vertex/pixel](samples/vertex-pixel.grape.json) 可用同樣入口開啟並生成 GLSL。

自動技術驗證另有實際 WebGL2 編譯／連結和數值比較：共享／巢狀 caller 為 RGBA51/102/153/255，Uniform 改值影響各自結果，陣列長度3乘0.25約191，名義欄位約89；discard 與0.2深度的前後遮擋也驗證。產品目前的 Generate GLSL 主要顯示程式碼；請勿把上述數值當作介面內已提供新即時 GPU 預覽。

本機、LAN、Tailscale HTTP 的測試是同一台機器的真實瀏覽器操作，尚未證明第二裝置／實體GPU／原生TD。S02舊格式轉換阻擋、domain-separated History、S06外觀及更廣裝置限制維持。此文件不要求重做已自動通過的技術驗證，也不授權發布、合併或下一 Slice。

本候選實作 I：`9230f9652c2affd4c20a7dda1033baaa0d61f7e1`；組建：`S05-web-9230f96`。R 是包含本提交索引的精確後續 commit，由 Coordinator 派工記錄綁定。

## 本次修復確認

- 前提：由 Grape Coordinator 提供通過精確複審的入口；先下載 [跨階段獨立 Uniform](samples/cross-stage-uniform-distinct.grape.json)。目前尚未部署 S05 Human 測試站。
- 使用 Open document file 選檔，再按 Open in new session、Generate GLSL。預期 vertex 與 pixel 的兩個獨立 Uniform 使用不同名稱，0.25 與 0.75 不混用。可 Save，再 Open saved。
- 開啟 [同資源反向遇見順序](samples/cross-stage-uniform-shared-reversed.grape.json)，按 Generate GLSL。兩個階段以相反次序使用同一組資源，但每個資源仍使用一致名稱與預設值。
- 介面顯示的是生成程式碼。自動測試另有真實 WebGL2 連結、active uniform、讀回與 vertex transform feedback：原反例讀回0.25／0.75，vertex四分量為0.25；反向次序例為1.0，將第一資源改綁0.125後為0.875。這不是請 Human 重做 GPU 技術驗證。
- 這份新文件補充修復範例；不改歷史導覽、不表示獨立 PASS 或 Human 已接受。全部14份範例的精確 bytes 由 samples/manifest.json 綁定。
