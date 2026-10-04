# CANVAS-LIVE-005 — 畫布操作的有界實機觀察

2026-10-03；Function Preview **0.8.273 DEV**；原先由 owner 指定可任意修改的 `/project1/PBR_MAT_Graph3`，MAT / Pixel Stage，9 nodes；1280×720 CSS px，English，dark / Cool，UI scale 1。透過 Codex in-app browser 的使用者操作 API，讀取可見 DOM 的座標、class、文字與樣式；未讀 private application state，未呼叫 product internal functions。測試頁為既有 `http://127.0.0.1:50997/shader/e94964260f2f4a3bb498c02992c17406/`。

本檔為操作紀錄，不是全部画布規格已通過的證書。數字來自操作當時輸出，並非事後以 source 推算的假測試。原始截圖只在工具會話中可見，這次沒有宣稱已封存 portable screenshot。未改產品程式或重構 Repo。曾有一次專注按鈕 role locator 沒匹配到；改用已觀察到的 `#graphfocus` 公開 DOM 入口後完成，這不是產品失敗。

## CL-01 — 空白拖曳平移

起點 Canvas rect=(306,84,628,604)，world transform=`translate(926.718px, 242.412px) scale(0.259078)`，未選取節點。空白從 (750,540) 拖到 (790,570)。第一個讀取仍在阻尼途中 `(949.129,259.268)`；後續讀取到 `(966.718,272.412)`，正好平移 (+40,+30)，zoom 不變。九個 node 的 inline graph positions 全部不變；當時 Graph save revision 仍 r510。Home 回到原 transform。只證明這次左鍵平移與終點，不證明阻尼耗時或持久化。

## CL-02 — 單選、Frame、Home

點 Array 標題 (856,438) 後該卡 selected；按 F，縮放先顯示中間值，穩定後100%，transform=`translate(1755px, -180px) scale(1)`。Array screen rect=(525,312,190,148)，中心 (620,386) 正是 Canvas 中心。Home 還原全圖26%顯示與上述全圖 transform。未測無選取 F、多選 F、最大邊界與空圖。

## CL-03 — 專注與 Escape

點 Focus graph 後 `aria-pressed=true`，Canvas 變成(0,0,1280,720)，Array 選取仍保留。按 Escape 兩次後專注仍為 true；按 Focus graph 才退出，回到原 Canvas rect。**Escape 不能寫成離開專注模式。** 此次未以 Ctrl/Cmd+Enter 操作切換；快捷鍵與 branch 依另份 source evidence。

## CL-04 — 部分相交框選，兩方向

Home、空白點擊清選取；開 Box Select。從空白 (844,427) 拖到 (875,445)，矩形只包含 Array 上部局部，仍選入 Array。關 Box Select、空白清選取、再開；從空白 (893,478) 反向拖到 (850,450)，只交 Array 右下局部，仍選入 Array。兩次放開都隱藏 marquee。最後關 Box Select。這證明兩個方向的局部相交樣本；沒有把它說成全 containment/boundary/modifier/cancel 矩陣已驗。

## CL-05 — 游標錨定 wheel zoom

全圖 transform=(926.718,242.412,0.259078)，Canvas origin=(306,84)。於螢幕(775,535) wheel up（工具0.2 page），穩定後 transform=(997.612,210.105,0.299205)，顯示30%。九個 node positions 未變，當時 save revision r510。由 before/after 可見 DOM transform計算同一 graph point=(-1766.7189,805.1166)，after投影=(775.00087,534.99991)，误差低於0.002 CSS px，支持此樣本游標錨定。這不是 trackpad、deltaMode、OS加速度或所有縮放界限的實測。Home恢復全圖。

## CL-06 — 節點拖動、Undo、Redo

Array選取並F到100%；初始 graph position=(-1536,408)，Undo disabled。標題由(559,330)拖到(607,354)，放開後位置=(-1488,432)，Undo enabled。點Undo一次回(-1536,408)，Undo disabled、Redo enabled；點Redo回(-1488,432)；再Undo回原位置。證明這次拖動僅一筆可Undo layout修改及Redo；沒有驗證未達門檻、modifier、拖曳中斷、保存後重開或 shader compilation count。自動保存revision後來增加，未宣稱執行Undo能抹除歷史或保存活動。

## CL-07 — Shift toggle 與空白清選取

保留Array選取，Shift點Voronoi標題→Array+Voronoi；Shift點Array標題→僅Voronoi；點空白(785,535)→0 selected。未以 private state讀primary，也未測Ctrl/Meta、Inspector pinned、多Context。

## 結束狀態與限制

Array位置已Undo回原值，九個節點保留；Home回全圖26%，空選取，Box Select=false，Focus=false。操作過程會有正常layout history與自動保存，沒有宣稱工作流完全無副作用。未按 Apply Shader、未修改任何參數值、來源或接線；viewer的連接是頁面既有啟動行為，沒有手動take-control。

未驗：真觸控／筆／IME、MMB Dolly及中途Escape、普通drag取消矩陣、marquee取消、readonly產品實機、裝置像素倍率、跨stage/巢狀返回保存、reload持久化、完整keyboard-only/a11y。這些已由spec與acceptance cases明確定位，不能用圖冊或source閱讀標記PASS。
