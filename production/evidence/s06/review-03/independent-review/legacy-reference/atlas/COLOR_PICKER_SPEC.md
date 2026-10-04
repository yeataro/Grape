# 共用色彩面板 · ATLAS-004

狀態：**Owner 已確認外觀；功能預覽版 Legacy 0.8.273 已交付。圖冊以獨立本地模型同步其介面與編輯規則。**

入口：[互動圖稿](index.html#color)。本文件交接已定案的設計，不更改 IH-005、production ownership 或重構專案既有編輯契約。圖冊沒有匯入、改寫或執行產品程式。

## 應用與型別

凡產品提供「選擇顏色」的入口，都採用此共用設計，包括節點、Inspector、來源、Note／Group Frame 及其他色彩設定。目標的色彩語意與可寫能力決定 RGB／RGBA；不能僅依 vec3／vec4 分量數推測。共用面板不建立第二份 canonical value。

| 目標 | 始終可見的列 | Alpha | 完成編輯後的 HEX |
|---|---|---|---|
| RGB | H、S、V、R、G、B | 不顯示、不可操作，不屬於值 | `#RRGGBB`，6 位 |
| RGBA | H、S、V、R、G、B、A | 0–1 | `#RRGGBBAA`，8 位，A=1 仍顯示 `FF` |

RGBA 可貼 6 位 HEX，保留原 Alpha；失焦、change 或 Enter 後顯示 8 位。RGB 不接受 8 位 HEX，避免靜默遺失 Alpha。常用 RGB 色票套到 RGBA 也保留 Alpha；自存 RGBA 色票套到 RGB 時只取 RGB，不改變目標值的 shape。

## 已定案的編輯規則

| 模式 | 編輯中 | 點面板外 | Apply | ×／Escape |
|---|---|---|---|---|
| Uniform live | 即時更新目標 | 接受目前值、關閉 | 不顯示 | 還原整個面板開啟前的值、關閉 |
| 常數／其他非即時入口 | 只改面板草稿 | 取消草稿、關閉 | 一次提交、關閉 | 取消草稿、關閉 |

Enter 只完成數值／HEX 格式正規化，不提交或關閉面板。沒有變更的開啟與 Apply 不寫入。× 在兩種模式都表示取消，不能把它當接受的關閉按鈕。

Uniform 的產品實作將一次面板工作階段視為一組 live gesture，並由既有 adapter 管理 authority、合併寫入、receipt、Undo 與取消。遇到外部寫入衝突時，產品取消會回報衝突並保留 actual values，不能覆蓋外部值。本頁只有單一寫入者的本地示範，**沒有模擬 TD、CAS、receipt、外部衝突或 Undo**，因此取消直接還原本地開啟值。

## 外觀與排版

- 桌面參考寬 **320px**；目前顏色維持 **100 × 100px**。
- 標頭**中央三個按鈕為色票、色面、畫面滴管**；右側獨立放非即時模式的 Apply 與所有模式都有的 ×。左側僅保留簡短名稱。
- 「＋」疊在目前色塊右上角，不另占一行；HEX 右側保留 6 格本次色票。色票操作不等於提交目標值，取消色彩草稿不刪除本次已存色票。
- 常用色依 [owner 提供的 TD 原圖](assets/td-color-reference.png) 排成 **11 欄 × 4 列**：彩色、淡色、深色、灰階。44 色的原圖像素取樣列於 [manifest](parts/color-manifest.json)，不是 TD 內部浮點值的宣告。
- 桌面色票最小寬 **16px**、高 **20px**。空間不足時重排。粗指標 CSS 放大命中區並分列標頭，尚不代表實體觸控裝置驗收。
- 色票／色面使用相同上方空間。色面保留方形、圓盤、三角形；圓盤依可用短邊繪製，不能拉成橢圓。
- HSV 與 RGB 六列**同時顯示**。H 使用 0–360 度，S／V／A 使用 0–1。RGB 以正規化單位輸入，數值欄可保留有限 HDR／負值，滑桿與視覺呈現範圍為 0–1。不另設 RGB 0–255 或 HSV／RGB 模式切換。
- 精簡面板可見文字，保留分量及 HEX 標籤，其餘以圖示、位置、tooltip 與可及性名稱交代。

## 本地示範與精度

圖冊外側的 RGB／RGBA、Constant／Uniform、模型值與重新開啟控制只供 reviewer 比較，**不是產品面板上的設定**。RGB、RGBA 各有一個僅在本頁記憶體內的示範目標；每次開啟取該目標的值作為 opening basis，面板持有草稿。切換示範目標／模式會依原模式結束工作階段：常數取消，live 接受。

調 HSV、RGB、Alpha、色票或色面時，草稿的其他表示立即連動；live 模式同時更新外側本地模型值。顯示數字取整、HEX 投影、切換色面或重新開啟都不回寫 RGB／Alpha。未編輯的高精度、HDR 與負值保留；只有使用者明確修改的分量或選色會變更色值。灰／黑色保留 latent hue，避免再次調飽和度時無故跳色。

非法或尚未完成的 HEX／數值留在欄位內，不寫入有效草稿；其他改值入口與 Apply 暫停，× 仍可取消。修正後恢復；Escape 依整個面板工作階段取消，**不是只撤回最後一個欄位**。色面 pointer cancel 回到該次手勢起點；它不等同於取消整個面板。舊 pointer 的後續事件不能修改新狀態。

本地自存色票使用顯示 HEX，最多六個，重新整理重置；不宣稱圖冊已有持久色票或產品 raw-value 儲存機制。圖冊的畫面滴管只保留入口提示，不擷取螢幕。Legacy 已交付 feature-detected `EyeDropper`，缺少 API 時禁用並提示；取消、失敗與晚到回覆由產品處理，不退回原生 `input[type=color]`。

## 驗證與證據邊界

在 `atlas` 目錄執行：

```text
node check-color.cjs
```

目前 **33 項本地檢查**讀取實際三個 fragment 檔，檢查選擇器、簡單 DOM／canvas 替身、色值同步、RGB／RGBA、44 色與 6 格、圓盤數學、pointer 取消、兩種模式的 Apply／outside／×／Escape、精度與無變更操作。這些不是瀏覽器布局、CEF、真實鍵盤／IME、可及性或產品驗收；圖冊整體的 build／視覺檢查由 [verification.json](verification.json) 記錄。

**產品證據另列：Legacy 0.8.273 的 39 項單元、35 項瀏覽器、6 項 TD 驗證。** 規則以該版 `docs/features/CUSTOM_COLOR_PICKER.md` 為交接證據；產品測試不併入上述 33 項，不由本頁重新執行或宣稱涵蓋重構專案。Windows TD 2025.32820／Edge 的產品結果也不代表所有 CEF、Safari、iPad 或作業系統已驗證。

CSS sRGB 與非預乘 Alpha 只用於呈現，不定義 shader／document 全域 clamp 或 linear／sRGB 轉換政策。色彩管理、顯示 profile、原生取色與真實裝置資格仍依產品環境判定。舊 ATLAS-002 的 27 項歷史測試已被取代，不算當前通過數。
