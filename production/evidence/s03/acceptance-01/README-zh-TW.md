# S03 待 Human Owner 驗收

**狀態：獨立技術審查 PASS；人工驗收 PENDING／NOT_GRANTED。** 本資料夾只保存報告與驗收材料，不是完成登記 B，也不授權合併、後續 Slice 或遠端發布。

| 綁定項目 | 精確值 |
| --- | --- |
| Implementation I | `80ee116b8f809c9160aa9cc311801cce15923cee` |
| Reviewed R | `c209bba451149b9d54a6a54c3b35dd28f39225f3` |
| 獨立審查 | `S03-FR-c209bba-R2`，`/root/s03_fresh_rereview_02` |
| 原始報告 SHA256 | `5c36c11da58b739a84a089ae5bc1c90aa8c3b079f3b9cfe5c2ca90644d25c565` |
| 原始證據 manifest SHA256 | `dd0d2318ba014fe137035111a99d42f5b55b014cc32f2b5ffe68c74703a29c3a` |
| 候選 build SHA256 | `46cd7c70aba4139416173495453486a0d0ff8da41c2d10d7bd06a88329b4dc79` |

[本機驗收預覽](http://127.0.0.1:4174) 由 Coordinator 從[受審查封存 build](../repair-02/candidate-web-01.tar.gz)提供；三個 HTTP 檔案已與[build manifest](../repair-02/build-manifest-01.json)逐位元比對。預覽服務可隨時結束，封存檔才是固定版本。此後新增的證據收據 commit 不取代上述 I／R。

[獨立原始報告](independent-review/INDEPENDENT_REVIEW_RESULT.json)記錄：156 個 unit/conformance、48 個 browser、9 個 bootstrap 測試通過；build、型別、owner 邊界、pin、根目錄完整性與雜湊檢查通過。另有獨立 30 案來源轉移矩陣：12 案拒絕、18 案成功。FR01–FR03、EG01 均已關閉，沒有剩餘 finding 或必要證據缺口。原始 75 檔完整保留，作者與內容未改；[relocation map](review-relocation-01.json)連結原始路徑與保存路徑。

## 本次請驗收的範圍

- AT-S03-01：共用／本地 subgraph、第一次語意編輯分離、Make independent、巢狀 Canvas 與獨立導覽／選取／相機。
- AT-S03-02：介面 stable key、名稱／順序／型別／預設值變更，所有 caller 同步，無效連線與損失資訊保留，Undo 恢復。
- AT-S03-03：完整 clipboard 資源閉包、owner collect/remap、同 Graph＋load 重用、跨 Graph／新 load 准入與原子拒絕、frame、來源與 nominal type 引用。
- AT-S03-04：Graph-owned Structure 編輯／Help／usage、深度與展開限制、巢狀 Inspector 的草稿／取消／焦點／生命週期保護。

完整 24 個能力項目為 LC-DATA-027、029、030、031、032、033、034、035、036、037、043、044、045、046、047、048、049、050、051、058、062，以及 LC-NODE-368、369、374；以[完整 scope／證據 mapping](../repair-02/coverage-01.json)與獨立報告內相同 ID 的界線為準。

**來源剪貼的刻意差異：** inline scalar／vector／matrix constant／uniform 可跨 Graph 轉移；inline array 等 composite 可合法建立／載入、在同 Graph＋load 重用，但跨 Graph 或新 load 必須原子拒絕。Native-array descriptor 是另一條獨立准入路徑，保留型別、typed extent、建構 path4096／剪貼 path2048 等規則；TOP 依 source＋origin 重用 slot，聲明仍有獨立 ID。這些是可攜式 authored data 規則，不是執行實際 TD 資源。

## 簡短操作

1. 依[完整 walkthrough](../repair-02/HUMAN-WALKTHROUGH-01.md)建立 Compose → Image output 的有效圖。
2. 在 Local clipboard 貼入[inline 範例](../repair-02/human-inline.packet.json)：應顯示 `SOURCE_CLIPBOARD_DENIED` 並保留圖與 Redo；貼入[native descriptor 範例](../repair-02/human-native.packet.json)則可新增聲明，Undo 可移除。
3. 用[inline 文件](../repair-02/human-inline.document.json)進行檔案 review／明確 replacement，再選 Source、Copy、Paste：同一 live Graph／load 會重用原聲明。完整跨 Graph／新 load 矩陣由獨立測試另外驗證。
4. 試用 Encapsulate、兩個 Canvas、共用介面變更、Make independent、Structure 草稿／Help 與 Undo；檢查操作是否符合預期。

## 明確限制與繼承項目

驗證環境限 Windows x64、Node25.5.0、Playwright1.62.1、Chromium151.0.7922.34、1440×1000。巢狀 Structure arrays 可編輯，但 ES300 明確生成失敗且不輸出 shader；只驗證一維 Structure array 的 WebGL2 shader 編譯。未宣稱實體 GPU、原生 OS IME、touch／iPad／Safari、廣泛 accessibility/device 或 TD runtime 資格。200-node 測量不是效能保證。

S02 AT-S02-03 legacy compatibility 仍 NOT_DELIVERED／BLOCKED；S04 Personal/package、較廣 S05 catalog、S06 widget/device 範圍未納入。G-LU-DATA-001、004、G-EXTENSION-WIDGET-SCOPE、G-HANDOFF-CQ-OWNERSHIP 只有此次受測 scope 證據，沒有全域關閉；G-LU-DATA-007／G-PD-1／G-VERSION-COMPAT 與 HC-001 quarantine 等繼承限制不變。DEC-GRAPE-001 的 domain-separated History 保持不變。

**待您的決定：** 請確認是否接受上述精確 I／R、build 與界線內的 S03 產品行為；若不接受，請指明操作、實際結果及期待結果。這份請求沒有代填同意，也不把技術 PASS 視為人工接受。[結構化待驗收記錄](pending-human-acceptance-01.json)仍為 PENDING。遠端發布另有未回覆的明確授權問題，這次未發布。
