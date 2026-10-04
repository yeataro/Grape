# Grape UX/UI 設計交接草稿

**版本：v0.3 / ATLAS-005 · 2026-10-03 · 證據有界，尚非完整設計驗收**

這份報告讓設計者與實作者在不閱讀 Legacy UI 原始碼的情況下，理解 Grape 應保留的操作能力、外觀識別、狀態差異及設計自由。它以完整產品為範圍，不以目前 implementation slice 已做到哪裡決定功能取捨；不修改 IH-005 架構、Migration Plan、S13 或其他 slice 的範圍，也不授權產品實作。

最重要的結論是：**現有 Node 外觀必須保留；能力、入口配置、操作語義、Widget 與 Style 必須分開交接。** Add Node、Add Node pane、Source Tags、Stage buttons 是 owner 明確喜歡的正向參考。後續 owner review 已要求 Uniform Source 圖卡簡化；其他 Source 呈現未一律定案。

## 1. 本稿的依據與使用方式

| 材料 | 用途 | 證據界線 |
|---|---|---|
| [DESIGN_PREMISES](DESIGN_PREMISES.md) | owner 的保留要求、設計分類、experimental 取捨規則 | 是本輪設計前提，不是新 production API。 |
| [ARCHITECTURE_COMPATIBILITY](ARCHITECTURE_COMPATIBILITY.md)、[擴充邊界](../research/extension-boundaries.md)、[狀態與 Host 邊界](../research/state-and-host-boundaries.md) | IH-005、DEC-GRAPE-001 的責任、資料與生命期限制 | 已接受架構不等於產品畫面已完成。 |
| [LIVE-001](../research/live-observations-001.md) | 現行產品初始畫面、尺寸、色彩及可見說明 | 只證明所記錄的配置與觀察；說明文案不是完整操作驗證。 |
| [LIVE-002](../research/live-observations-002.md) | disposable graph 上的直接操作及局部狀態轉換 | 有操作證據，不代表完整測試序列或跨環境驗收。 |
| [LIVE-003](../research/live-observations-003.md)、[LIVE-004](../research/live-observations-004.md) | experimental 設定、Viewer takeover、自定義參數／Export 視窗、收合、Wire／Link、Create node 與 Source Tags | 分開記錄成功操作、僅開啟／閱讀及未成功驗證的操作；沒有完整 runtime／gesture 回歸。 |
| [Experimental controls](../research/experimental-controls-observation.json) | 29 個 setting 與 2 個 duration 控件的當前值、用途及 default 證據 | Reset defaults 停用只是 UI 表示目前符合其 default 條件；未獨立驗證乾淨 profile。 |
| [Token JSON](../research/current-dark-cool.tokens.partial.json)、[離線證據查閱頁](../index.html) | 精確色碼、alpha、尺寸及來源 locator | LIVE-001 的 partial snapshot；HTML specimen 不是產品 screenshot。 |
| [INTERACTION_COVERAGE](INTERACTION_COVERAGE.json) | 元件、觀察序列、缺口與證據粒度的查詢表 | 是觀察計畫／對照索引，不是已通過的產品測試清單。 |
| [歷史截圖 gallery](../visual-reference/index.html)、[來源清單](../visual-reference/historical/index.json) | owner 提供的五張 2026-09-30／10-01 Legacy screenshot | 原圖副本及 checksum 留存；是歷史外觀參考，不代表本次 LIVE session 的每個狀態。 |
| [COLOR_PICKER_SPEC](../atlas/COLOR_PICKER_SPEC.md)、[TD 色票參考圖](../atlas/assets/td-color-reference.png) | 已採用的精簡自有色彩面板與44色色票參考 | 設計及0.8.273既有交付證據分列；圖冊不是重構產品或CEF驗收。 |

來源有先後時保留原始觀察，不抹掉歷史：LIVE-001 當時沒有 selected/struct 樣本；LIVE-002 O02-07 後來看到這些實際呈現。某些較早的筆記仍寫「未觀察」，應按各自 session 的範圍解讀。日文切換亦已有 LIVE-002 O02-05 的局部證據，不能繼續泛稱完全未切換，也不能升格為五種語言全部驗收。

本稿使用下列標記，需求與證據分開記錄：

- **Owner-required／Contract-required**：需要保留的要求；不代表已實作或實機通過。
- **Observed**：已看見的狀態或已完成的特定操作，必須能回到 session／案例。
- **UI-advertised**：產品文案宣告的能力，尚未以相應操作完整證實。
- **Reference composition**：可參考的入口與空間安排；不自動固定每個座標。
- **Proposed／Undecided**：候選設計或未定案項，不能當成 owner 已批准。
- **Unknown／Unverified**：缺證據；既不刪除能力，也不補猜成成功。

## 2. 保留強度與設計自由

| 對象 | 保留強度 | 實務要求 |
|---|---|---|
| **Node 外觀** | **Owner-required：必須保留** | 以真實 Legacy 的卡片、標題、body、socket、型別文字、欄位與狀態為保真基準。不能因改框架或採通用元件庫而換成另一套 Node 設計。缺少的狀態先標 unknown，不用新畫法填洞。 |
| Node／Port／Edge 的型別、有效性、選取與錯誤資訊 | Contract-required | 外觀不可改變資料型別、真實接口、編輯權限或接線結果。選取與錯誤可同時存在，不能用一個邊框狀態互相抹掉。 |
| Add Node 互動及 Add Node pane | Owner 喜歡的 reference，可改善 | 保留可辨識的查找、分類、加入與回饋方式；改善需說明保留的能力與變更理由，不直接換成另一套難以對照的流程。 |
| Source Tags | Owner 喜歡的 reference | 保留資訊可辨識性；標籤承載名稱、來源或作用資訊的方式需逐項確認，不預設刪除或退化成無差別純文字。 |
| Stage buttons | Owner 喜歡的 reference | 保留清楚的可選 Stage、active 狀態及目前編輯範圍。切 Stage 不等於切 Graph，更不等於切 Host。 |
| Toolbar Panel | Owner 指定的獨立 capability surface／reference | 必須另行盤點；Node／Edge selection quickbar 不能被當成已涵蓋 Toolbar Panel。未有證據的命令、配置與保存行為繼續列缺口。 |
| 全局、Node、Edge 工具列的共同呈現 | 可共用樣式／排列模式 | 共用外觀不共用權限。每個動作仍明確指向自己的 selection、node、edge、scope 與有效生命期。 |
| Uniform Source 圖卡 | **Owner-required：簡化** | 舊圖卡作 reference；精簡列候選供review，具體排版未批准。其他 Source 尚未一律要求簡化。 |
| 非固定 toolbar 座標、Panel 排列、控件形式 | Reference composition／可調整 | 必須維持功能可發現、可達、可取消／恢復、target 明確。不是刪除不容易安放的能力。 |
| 新配色／密度／其他外觀 profile | 未在本稿提出定案 | 不用一次主題整理抹去 owner 指定的 Node 外觀或既有型別視覺承諾。若另提方案，需與保真版本分開比較。 |

這些強度優先於「Style 通常可以調整」的一般說法。保留 Node 外觀也不表示複製 Legacy DOM、class、內部狀態或宿主托管方式。

## 3. 能力分類：先確定做什麼，再安排放哪裡

每項設計分別回答五個問題：**產品能力 → 入口與配置 → 操作語義 → Widget → Style**。這只是設計分析方法，不新增五層程式物件。

| 能力群 | 使用者應能完成的事 | 交接時不能遺失的差異 | 本輪證據／不足 |
|---|---|---|---|
| 工作空間與範圍 | 辨識文件、Host、Stage、目前 Canvas，調整 Panel／浮動呈現 | 文件與 Host identity；active Canvas 與 Panel focus；view close 與 Graph unload | LIVE-001 整體配置、LIVE-002 O02-04/09；layout 保存／復原未完整驗。 |
| 查找與建立 | Add Node 搜尋、分類、來源篩選、Library／Source 入口 | 找既有來源與建立來源；功能名稱與實例名稱；可用 Stage 限制 | O02-01/03/06、O04-03 Tab 搜尋與 filter；完整排序、鍵盤導覽仍待補。 |
| 選取與導覽 | 單選、多選、primary、Home／Frame、沿接線找對象、巢狀路徑 | 選取不是模型值；primary 不等於集合第一項；不同 Context 可不同選取 | O02-02/03 局部；完整 Link／方向鍵／兩 Context 序列待驗。 |
| Node 與圖形編輯 | 移動、複製、刪除、收合、群組、安排、子圖 | 受保護 endpoint；可移動不等於可刪除；共享定義與 occurrence | O02-02 證明該 Pixel Stage 的 protected endpoints；O04-01 收合／展開；不能外推所有 Stage／子圖。 |
| Edge／接口 | 建立、取代、斷線、找來源、看型別／轉換、理解動態端口 | 真實 Port 與呈現入口；取消與拒絕；detach/loss 與 preserved-invalid | O02-03 有 click 接線、浮動 socket、mode 變更及 Undo；O04-02 Wire／Link 保持端點及目的端導航；drag／非法接線矩陣未驗。 |
| 數值與結構編輯 | 精確輸入、連續／精細調整、分量與顏色、矩陣／陣列的適用呈現 | 型別、local/default、linked input、Host live、draft、range/clamp | O02-01/04/07 局部；不可把缺少 array 表格誤報成已支援。 |
| Sources 與資源 | 定義／找到／引用 source，理解預設與 runtime 輸入 | Source identity 不因改 label 改變；Host 資源取得與圖內宣告分開 | O02-06 新增入口與非法名稱拒絕；O04-04 expanded source／count badges；未成功建立完整來源鏈。 |
| 生成、保存與交付 | 檢視 GLSL、保存文件、匯出、交付 Host、辨識各結果 | Save ACK、download、generation、Apply receipt、Host project save 分開 | O02-08 產碼視窗、O03-05 Export 開啟／關閉；沒有匯出檔案或 Save TD project 完整操作。 |
| Preview／Viewer | 查看輸出、選擇正確 Viewer、操作視角、暫時預覽中間值 | 遠端 Viewer 與暫時 shader Preview Node 是兩項能力；last-good 與目前文件分開 | O02-01/08/10 局部、O03-02 takeover 狀態；leave／expiry、視角手勢及 pixel 比對未驗。 |
| 錯誤與恢復 | 看見原因、定位、修復／取消、保留可救援資料 | model／compile／delivery／storage／UI error；無效但可保存；不確定 commit | O02-06 名稱錯誤；compile error／stale reply／recovery 序列待補。 |
| 多語言與說明 | 切換語言、閱讀 Node／Panel help、找完整長名稱 | 系統文案與使用者文字、技術 identifier；locale 不改 Graph | O02-05 日文換行及局部翻譯；其他語言、fallback、字型覆蓋待驗。 |
| 裝置、快捷與可及性 | 鍵盤、滑鼠、觸控、文字輸入時正確操作 | text focus 與 Canvas shortcut；viewport 小不等於 touch 支援；服務可用與否 | O02-09 窄 viewport；真 touch／pen／IME／screen reader 未驗。 |

這不是 618 項 Legacy 能力的新清單，也不把十二群當成新模組邊界。後續元件交接仍須指出具體操作與 failure semantics；單寫「支援節點編輯」不足以驗收。

## 4. 桌面 reference composition 與 overlay 類型

### 4.1 既有桌面構圖

當前 desktop 參考是：上方產品 header 與導航列，左方 Add Node／Sources，中間帶 Stage 與快捷入口的 Canvas，右方 Parameter／OP Parameter、Preview、Help，下方狀態與偏好入口。LIVE-001 在 1280 × 720、dark／Cool／standard、UI scale 1 量得 header 52 CSS px、左右 divider 值 300／340、Canvas 628 × 604；它是一次 restored view，不是所有裝置的預設布局。

此構圖承載了幾個重要資訊層：

1. **全局／文件操作**：目前文件、目標、保存與匯出。
2. **編輯範圍與發現**：Stage、Add Node、Sources、Library、搜尋。
3. **局部操作**：selected Node／Edge、Inspector 值與連線、上下文工具列。
4. **執行與協助**：Preview、Host controls、Help、diagnostics。

可以重新安排入口，但不能因物理位置改變而合併資料 owner。Toolbar Panel 另有自己的功能範圍；應避免把全局 toolbar、selection quickbar 和 Toolbar Panel 三者在交接中只寫成同一個「工具列」。

### 4.2 三種 overlay 分開記錄

| 類型 | 現有角色 | 本稿可確認的部分 | 必須另驗、不可從外觀推定 |
|---|---|---|---|
| **Canvas 浮動 Panel** | Inspector／Preview／Help 等工作內容的浮動入口 | O02-04 實際 float/dock 同一選取 Inspector；320 CSS px 樣本，可能遮住 Canvas hit target | 移動／resize、draft 連續性、具名 Layout 保存、focus、close guard；不可把 visual close 直接當 Graph unload。 |
| **可拖曳的自定義參數編輯視窗** | 編輯 Host control definition 的獨立介面 | O03-04 開啟／關閉：fixed DIALOG、aria-modal=false、440 × 540 CSS px、move cursor／resize affordance；Roughness 的 range/min/max/clamp 已可見 | 實際拖動／resize、背景可操作性、局部提交／取消、Escape、外部改值衝突、重開保存；未操作過不能當已驗。 |
| **Export modal** | 將目前作品導向匯出流程的有界對話 | O03-05 開啟／關閉：centered DIALOG、460 × 376.781 CSS px、PNG／JSON download／Save to TD project folder 可見 | owner 指定此 modal 類型；但 aria-modal 缺席不能判定原生 focus／背景 inertness。沒有匯出、下載或寫入結果；不能借 Inspector 的語義填空。 |

這些是**互動行為分類**，不是新增三個 production class，也不要求全部塞進 Panel。每個設計稿都應標出 target、是否可並存、背景互動範圍、focus／快捷鍵、草稿歸屬、commit/cancel、關閉結果與失敗保留內容。

## 5. Node、socket、wire 的保真基準

### 5.1 Node 外觀

必須延續的不是一個抽象紫色方塊，而是現有 Node 的可讀層次：角色標題列、名稱／功能辨識、body 的 ports 與適用欄位、型別文字、socket 與線、局部快捷入口、selected/error 等狀態。

LIVE-001 的普通樣本 card 寬 **190 graph-space px**，body **#2E2C3A**，border **#60576E**，外圓角 **9 px**，shadow **`0 6px 20px #0004`**；title 為 weight **600**、**12／16 px**。量得 ordinary title 高 41 px、subgraph 樣本 45 px，只是所見 content/padding 的結果，不把所有卡片寫死為同高。來源卡可更寬。socket 的 **11 graph-space px** 直徑及 **2 px** ring 不能直接當 zoom 後的 screen px；25% zoom 下 11 px 對應 2.75 screen px。

Mode／設定的位置需要逐項保真：O02-03 的 Voronoi mode 在 Inspector，Node body 顯示真實接口與輸入值。不能據此推定所有 Node 都沒有 title dropdown，也不能自行把全部設定移到 body。

O04-01 實際透過 selection toolbar 收合、再展開 Voronoi，collapsed card 未顯示各別 port，操作文字改成 Expand；量得的 24.308 screen px 是約57% zoom 下的樣本，不是新的 logical 高度或最低 hit target。O04-02 把同一 Edge 由 Wire 切為 Link、再切回，端點屬性不變，Link 樣本 dash 為4px,5px。 後續 LIVE-006 補量：正常線為 rgba(142,142,150,0.6)、1px、non-scaling-stroke；選取線為 #FFF2D2、2px，dash仍4/5。Link不沿用資料型別色，socket仍保有型別辨識。設計必須保持「同一關係的呈現方式」這項差異，不創造第二種模型連線。

### 5.2 三種「紫色」與兩條配色軸

| 用途 | 精確 dark／Cool 樣本值 |
|---|---|
| 全局 accent | `#B39CFB` |
| Math／function title | `#43345C` |
| vec4 data type | `#C5B2E2` |
| Uniform／Sampler／Output title | `#2A5E6B`／`#6E4C2E`／`#38524A` |
| Runtime info／Vertex Inputs title | `#62414F` |
| Scalar／vec2／vec3 | `#C4C1BC`／`#8FC5EE`／`#87CEB7` |
| Matrix／sampler type | `#A1ADB7`／`#CAB08B` |
| Struct socket／wire gradient | `135deg, #BC9C85, #B690AC 33%, #949FC4 67%, #83B4A7` |
| Selected Node border | `#70DC69`；LIVE-002 O02-07 已看到實際 selected 樣本 |

**Node role 與 data type 是不同資訊。** 不把 accent、function title、vec4 合併成一個通用 purple。Struct 的低彩度 gradient 用於 socket／wire，type label 保持 plain text；O02-07 已看見 TDMatrix[4] 的 gradient socket、plain label 與 wire stops。Array 的視覺依 element type，不因「陣列」一詞全部退回 vec4 色。精確作用面仍按元件證據確認，不把 gradient token 套到所有文字。

### 5.3 色票、文字與度量的引用方式

[Token JSON](../research/current-dark-cool.tokens.partial.json) 保存 **44 個 color token、20 個 metric、文字 alpha 與 shadow**；[index.html](../index.html) 是離線閱讀器，內嵌 **LIVE-001／2026-10-02** 快照，不會自動取得後續觀察。其 mini-node 是 illustrative specimen，不是 screenshot 或完整 Node 設計。

文字以白色 RGB 加 alpha 分層：primary .88、title .85、value .74、secondary .72、soft .62、muted .54、faint .32。`#70DC6940` 的 glow alpha 是 **64/255**，`#C4C0DF24` 的 slider-fill alpha 是 **36/255**，不能把 screenshot 混色當原始值。CSS font stack 為 Inter／Segoe UI／Microsoft JhengHei／sans-serif；實際每個 glyph 使用哪個 font 仍未驗。

其他尺寸可直接查 JSON：Panel header 32 CSS px、divider 6、popup radius 10、popup row height 32、toolbar radius 8；numeric field height 24／radius 4 是 graph-space metric。這些只代表目前 partial observation，不是完整 theme，也不證明 Light／其他 style／responsive 的效果。

### 5.4 Source Tags 的獨立配色

O04-04 已量到有實際 rendered bounds 的 source-count badges；10 CSS px 字、4 CSS px radius。精確新增值見 [source-tags.tokens.json](../research/source-tags.tokens.json)：

| Source category | Background | Foreground |
|---|---|---|
| Attribute | `#565141` | `#EEE6CF` |
| Runtime Info | `#62414F` | `#F5DDE7` |
| Compile-time Info | `#526D91` | `#E3ECFA` |
| Uniforms | `#2A5E6B` | `#D0EDEF` |

這是**來源分類**，不替代 socket／wire 的資料型別色。Expanded Uniform entries 的名稱、Add reference、Source actions、output type、numeric/color controls 是現況參考；本輪未編輯或新增引用。Legacy 文案的「TD 提供共享值」只作現況描述，不把新產品 default 的 canonical ownership 交還 Host。Uniform Source 圖卡後續已明確要求簡化；其他 Source 類型尚未一律定案。

## 6. 數值編輯：保留能力，不綁死 Slider 或 Ladder

設計先確定使用者需要的精度、可控性及 commit/cancel，再選 Numeric Field、Slider、Value Ladder 或組合。不能因 Slider 易畫，就把所有值限定 0–1；也不能因舊版有 Ladder，就把每個欄位都強制成同一 popup。

| 要交接的能力 | 必須說清楚的行為 | 目前證據 |
|---|---|---|
| 精確文字輸入 | scalar／vector 型別、component 名稱、合法範圍、parse/IME、提交與取消 | O02-01 Scalar 0.35＋Enter；O02-04 Voronoi Scale 7.25＋Escape 回5。只證明這兩個例子。 |
| 連續與精細調整 | drag 調整、相對敏感度、步進、回饋、release、Escape、一次 gesture 的 Undo | LIVE-001／O03-03 help 有宣告；O03-03 工具 drag 後值未變，未建立成功調整證據，也未判定產品 bug。完整 scrub／Ladder／modifier 仍未驗。 |
| 分量／顏色／聚合型別 | 型別不被呈現方式改掉；component 對應、完整值讀取、connected 狀態 | O02-07 有 aggregate display；不代表有一般 array element table。 |
| Local/default 與 linked input | 連線來源優先；預設值仍可保留，但不能顯成另一條有效輸入 | O02-03 浮動 Inspector socket 建立同一 Edge、來源名稱可跳轉；Disconnect 後 local 恢復待驗。 |
| Host live 編輯 | readable、writable、driver、stale、conditional write 與 receipt | 已有架構要求；本稿的有限 UI 觀察不等於 live race／Undo 通過。 |

必須分開以下概念：

1. **Minimum／Maximum**：某個編輯／target spec 宣告的上下限資訊。
2. **Range Min／Max**：拖曳或 Slider 的顯示／調整範圍，不自動等於唯一合法值域。
3. **Step／sensitivity**：一次輸入如何變動及精細調整能力。
4. **Clamp Min／Max**：是否、何時依 target 已宣告規則限制輸入；不是色彩設定。
5. **超界／非法文字的結果**：拒絕、保留草稿或已宣告 clamp；必須讓使用者理解，不可私下改值。

目前 Host 自定義參數 Roughness surface 已有 `RangeMin/Max`、`Minimum/Maximum`、`ClampMin/Max` 可見欄位（[LIVE-003 O03-04](../research/live-observations-003.md)）。樣本 identity 為唯讀 `Uroughness`、Style/Size 為唯讀 Float/1、Default=1、兩組上下限均0/1、Clamp Min/Max 均未勾選。**不能說產品完全沒有 range/clamp，也不能因此聲稱 generic numeric Widget 已經具備同樣配置。** 欄位的實際效果、commit、Host History、超界輸入仍待直接驗證；本輪沒有更改那些值。O03-03 Node Inspector 的 HTML min/max 空白也不能反向證明沒有 application-level constraints。

以上不隱含 shader 內新增 `clamp()`，不改 connected GLSL 值的運算規則，也不新增 Parameter API。Widget 只提交該 scoped target 允許的編輯；Renderer 不自行改資料約束。

### 6.1 精簡色彩設計與已交付的提交行為

**UX-DESIGN-GAP-COLOR-001 · Owner-required。** 設計由 ATLAS-003 採用，接著已在 Function Preview0.8.273 交付；ATLAS-004 同步其實際規則。原生 popup 在 CEF 無法叫出仍是 owner-reported evidence；不能把 web panel 已實作推定為 CEF 已驗。

H、S、V、R、G、B 六列同時顯示與即時連動。RGB為0–1，不用255。RGB target 沒有 A、使用6位 HEX；RGBA有 A、一律8位 HEX，6位貼上保留A。100×100當前色塊、右上角加號、44色色票11×4、最小16px色票格，HEX旁6個自訂槽。色票／色面／滴管三個工具置中，保留輕量版面；不得把此色盤的表示範圍當所有 shader 值的 clamp。

| Target | 調整時 | 外點 | ×／Escape | Apply |
|---|---|---|---|---|
| Uniform / bound live OP | 即時更新；保留進入前值及可用basis | 接受已送值 | 依既有權限嘗試還原；有外部變更不能強制覆寫 | 不顯示 |
| 常數／非live OP／Note或Group custom color | 本地草稿 | 取消 | 取消 | 明確提交 |

這是 owner 已確定、預覽版已實作的分流，不是把 generic 數值欄位改為大型 Apply popup。圖冊只模擬自己的暫存值。實機的 receipt/CAS/History、dirty與生命期仍由原本負責者管理；畫出還原不代表本頁實作 Host conflict。

Screen eyedropper 在產品 feature-detect，不可用則禁用並說明。圖冊只保留入口及限制，不擷取螢幕。詳見 [COLOR_PICKER_SPEC](../atlas/COLOR_PICKER_SPEC.md)；[prior0.8.273 evidence](../research/color-implementation-004.md) 列39 targeted、35 isolated browser、6 actual TD/browser cases和整體回歸的既有16 failures。這些不是本輪圖冊測試，也不是重構产品的驗收。

## 7. Experimental controls 的取捨不能靠名稱

owner 的規則已清楚：**有可靠證據為出廠預設啟用的 experimental 能力，要保留；出廠預設停用的列 optional candidate。** 若 default 未知，保留能力紀錄並標未分類，不能用「實驗」二字刪掉。

先判斷 toggle 影響哪一層：

| 控制例子 | 實際影響範圍 | 不允許的錯誤推論 |
|---|---|---|
| Expanded-node triangle | 收合的某個入口 | Triangle 預設關閉，所以 Node collapse 可刪。 |
| Toolbar background | 背景 style／空白區穿透呈現 | 背景關閉，所以工具列及其命令都不是必要能力。 |
| Canvas trash | 一種拖曳刪除／落線變體 | 此變體 optional，所以刪除／建立節點能力 optional。 |
| Floating Parameter input sockets | 同一 Node 接口的額外 editing surface | 把它畫成另一張 Graph 的連線。 |
| RGBA／vector component colors | 分量辨識的 style 表達 | 用顏色決定新的資料型別或改變 component identity。 |
| Disconnect incompatible wires | mode 變更的行為政策 | 只靠畫面隱藏線條，或推定切 toggle 會重寫全部舊線。 |

目前 dialog 有 **31 controls＝29 settings＋2 duration**。Reset defaults 停用支持「UI 認為當前符合預設」的 medium evidence；不是獨立 fresh-profile proof。150ms damping、333ms Frame transition 及其 10–1000ms 範圍是 UI 明示的值／說明，不是此稿實測的動畫時間。個別效果與保存 roundtrip 大多尚未驗。

完整逐項分類見 [experimental-controls-observation.json](../research/experimental-controls-observation.json)。本稿不把當前 checkbox on/off 直接轉為29項正式 required/optional 決策，也不重設使用者偏好取得更漂亮的報告。

## 8. 可見狀態與架構邊界

### 8.1 保存、產碼、Apply 與 runtime

新產品必須能在無 Host 下編輯、生成、保存作品。Host 是外部執行目標，不是 canonical Graph owner。畫面至少可分辨：

- **文件**：目前內容、unsaved、save in flight、特定 snapshot 已保存、storage failure。
- **生成**：未生成／成功／model error 阻擋／backend diagnostic。
- **交付**：pending、applied、retained、rejected、superseded、indeterminate。
- **執行與讀回**：目前 Target、live／readonly／unreadable、stale／offline、last-good output。

Save A 後改成 B，A 的 ACK 不把 B 變 clean；download 不冒充 durable Save；有預覽影像不代表目前圖已成功。若 commit 結果不確定，不能把 timeout 當「肯定未執行」並默默重試有副作用的命令。

O03-02 的 Preview 實際出現 `Taken over by another page`，提供明確 Connect/take-control 入口；本輪未重新搶佔。這個狀態必須與 offline、compile failure、shader Preview Node 分開。Help 宣告回到 tab／編輯 Shader 不會自動 reclaim，但完整兩 client 仲裁仍未驗。O03-05 Export 顯示「當前圖層圖像＋完整 Shader／Subgraphs 資料、外部 TOP texture 保留引用」；這是 Legacy export 意圖與文案，不能讓舊格式或 TD 檔案路徑變成新 canonical `grape.document` 2.0 的 owner。

### 8.2 Undo 與焦點

DEC-GRAPE-001 已延後 coordinated Mixed History。Graph、Host live、native definition 以及未提交文字按明確 domain 處理，沒有全局最近一次 fallback。Graph Undo 已完成而 Host conditional write 衝突時，UI 要能顯示 **canonical 已還原、Host actual 保留外部結果、兩者 divergence**，不能回滾 Graph Undo 假裝同步成功。runtime stream 不填滿 Graph History。

### 8.3 Context、Panel、draft

同 Graph 的兩個 Canvas 共用模型、各有 selection/camera/navigation。Following Inspector 切 Canvas 後指向正確 scope；pinned Inspector 不因其他 Canvas 導航而偷換對象。Empty selection、readonly、missing module、stale occurrence 是不同畫面，不是一個通用空白。

Move/hide/remount 保留 Panel identity/private viewState／Widget draft；舊 mount 和 pointer route 失效，未完成 Panel pointer gesture 按既有契約取消。Close/retarget 的 guard、Field draft 取消、Graph unload 是不同動作。UI mount failure 的 placeholder/retry 不得重建或覆寫 Graph。

### 8.4 動態接口、錯誤、恢復

O02-03 已觀察 Voronoi mode 變更移除部分 outputs、Preview 接線被移除，而一次 Undo 恢復接口及原線。這只是一個成功案例；設計仍須能表達接受後 detach/loss/Warning、declared preserved-invalid/Error、整次拒絕保舊線等不同結果。

Model Error 可保存修復，但阻止新 generation；Warning 不阻擋。Compile/runtime/storage/UI error 不能互相冒名，一個暫時 success toast 不能清掉另一類持續錯誤。來源／stage／code line 的定位必須符合目前版本，不能把 stale diagnostic 導向新物件。

Reopen、review/accept import、Reload Applied 不可合併成同一「重新載入」。前者新 lifetime、import acceptance 可是一筆 Undo；Reload Applied 有明確不可 Undo 的確認及草稿／busy guards。缺模組與未知格式要保留可救援資料，不呈現為成功但缺了半張圖。

詳細狀態與來源可查 [state-and-host-boundaries.md](../research/state-and-host-boundaries.md)。本節翻譯既有契約為畫面要求，不新增同步器、History 協調器或 transport。

## 9. 多語言與長文字

Localization 已有 feature-owned extension seam，不是等功能完成後才補的架構入口：Shell 提供共同文字；Node／Panel／Widget／extension 提供自己的 label/category/help/actions/diagnostics，built-in 也走相同 contribution。新增普通 feature 的語言文字不必修改中央 UI catalog。

設計交接應記錄文字用途、feature owner、既有 TextRef key/fallback 與插值、可用寬度、換行／截斷及完整名稱取得方式。使用者 name/notes/code、Host path、原始錯誤文字不能自動當翻譯資源；可另有翻譯的產品解說。Locale 是 UI preference，不改 Graph、dirty、History、generation 或 binding。

LIVE-002 O02-05 的日文 Customize Parameters 按鈕可分兩行，樣本寬132px、高48.375px、line-height16.2px，使用 normal wrapping、overflow-wrap anywhere、min-width0。這提供真實長字串參考，不把132px定為所有語言的固定寬度。某些 Inspector label 有 ellipsis，仍需驗完整名稱是否易取得、是否與動作重疊。

目前語言選單可見繁中、英文、日文、法文、韓文；只記錄日文的局部切換，不宣稱五種 catalog 完整。`layout.title`，以及 O03-04 的 `action.close`／`controls.page` 原樣顯示在 accessibility name，是已記錄的可能 polish issue，不是要忠實複製的設計。

缺文字 fallback 遵既有 requested locale → parent locale → exact module default → inline fallback；屬 UI issue，不把 Graph 標 invalid。RTL、ICU/plural、rich help 或在地數字格式超過已定契約的部分，不在本稿自行承諾。

## 10. 元件交接與畫面組合的最小內容

每個元件／流程的後續設計頁，至少包含以下資訊，避免只交一張漂亮但無法實作的靜態圖：

| 面向 | 需要交付的內容 |
|---|---|
| 能力與保留程度 | 使用者目的、owner/contract 要求或 reference/proposal、適用範圍。 |
| 可見資料 | 目前 target/scope、真實身份與顯示名稱、值來源、不可讀／不可寫原因。 |
| 正常及例外狀態 | empty、selected/focused、connected/local、readonly、missing、invalid、stale draft、busy、loading、placeholder/retry。 |
| 操作 | 入口、user intent、gesture begin/update/commit/cancel、focus／快捷衝突、成功／失敗 feedback。 |
| 生命期 | move/hide/retarget/close 後保留什麼；viewState、draft、canonical data 分開。 |
| 呈現 | Node 保真要求、token、graph-space/CSS-space、型別文字與非純色辨識、長字串、多語言。 |
| 證據 | source/session/case、before/action/after、是否只看見控件或實際操作、未驗項與限制。 |

普通 Panel／Widget 的設計應能放進 feature 自己的 contribution，經共同 routing、scoped projection/write、mount cleanup 與 localization。共同 renderer 不應需要知道具體 feature class；設計稿也不應要求 private Graph lookup 或另一份可寫值副本。這是使用現有契約，不是新設計一套 UI framework。

## 11. 實際觀察、未決事項與未通過驗證

### 11.1 本輪已能支撐的結論

- 現行 dark／Cool／standard 的 desktop 層級、部分精確視覺值，以及 Node role／data type 的不同配色。
- Preview／Scalar 加入與一次 Enter 提交；Pixel Stage 部分 endpoint 的刪除保護。
- Voronoi 接口切換、click 接線、浮動 Inspector socket、來源名稱導航及一次接口／連線 Undo。
- Inspector float/dock、一次 numeric Escape 取消、日文多行按鈕與局部長文字狀態。
- 非法來源名稱的可見拒絕；array/struct 型別呈現與 selected border；Generated GLSL 視窗。
- 760 × 900 viewport 的側欄隱藏／overlay、header reflow，以及恢復 desktop 後的布局。
- Customize Parameters 與 Export 對話的開啟／關閉、不同 scope／尺寸、range/clamp 欄位；未寫入任何控制值或輸出檔。
- Voronoi 收合／展開、Wire／Link 保持端點、Connection quickbar 導航到 destination。
- Tab 開啟 Create node、Source／Port type filters、query 與 detail 區；空查詢的 All types 與 vec3 都顯示 Preview 在首位。這是所見結果，不承諾未知的完整排序演算法。
- Source-count badge 色彩、expanded source controls，以及 Viewer 被其他 page 接管的狀態與明確 recovery 入口。

這些是具名、有界的觀察，沒有轉成「整項能力全面通過」。Preview 後來消失及 footer 顯示還原訊息屬 **unattributed after-state**；沒有已知觸發與時間序列，不能拿來證明 leave／expiry 的演算法或保存契約。

### 11.2 設計仍需容納的未驗狀態

| 缺口 | 尚缺證據 | 對交接的處置 |
|---|---|---|
| **自有色彩面板：剩餘 runtime scope** | Preview0.8.273 已交付且有局部TD／browser證據；真CEF／裝置／screen eyedropper權限及重構整合未验 | 不再籠統說實作未完成；也不能因局部證據宣稱所有 runtime gap 已解。 |
| Numeric 精細調整 | scrub／Ladder／modifier、release/Escape/blur、Undo、IME 與 text-focus 隔離 | 保留能力及 commit/cancel 要求；不要把 help 當操作 PASS。 |
| Edge 完整互動 | drag、占用取代、方向／cycle／type 拒絕、落空白、Link 選目標、component split/merge | 兩次 click 接線不代替完整矩陣；未成功定位的 coordinate 操作也不當產品缺陷。 |
| 工作區配置／overlay | Default/Minimal 實套、拖動/resize、保存/恢復、三類 overlay 的 focus／guard／draft | 部分 overlay 已開啟／關閉，但不等於 focus、背景阻擋或帶草稿關閉已驗；保留三類差異。 |
| 巢狀與共享目標 | 兩 occurrence、nested Inspector、stale path、Disconnect 恢復 local | 採既有 scoped contract，畫出 missing/conflict；不可根據 root 樣本猜全域行為。 |
| Toolbar Panel／Source Tags 完整作用 | Toolbar Panel 真實命令、來源 count 改變、tag 操作／locale、保存方式 | Source Tags 已有 rendered 色票，仍不是完整行為驗收；不因別的 quickbar 存在就標 Toolbar Panel 完成。 |
| Factory defaults | 與版本相符的可信預設資料或受控初始環境／owner 確認 | 現況按 medium／unverified 保存；不重設使用者環境、不先刪選項。 |
| Preview／Viewer | pan/zoom/focus、takeover、singleton relocation、leave/no-save/formal restore、frame freshness | Viewer 與暫時 Preview 分開；程式碼含 override 不等於像素結果已驗。 |
| Failure／recovery | compile last-good、診斷定位／消除、import/reload/save 取消及拒絕、runtime timeout | 依已定契約保留明確狀態；現有 Gates 不因 mockup 變 PASS。 |
| Host range/clamp | 控件實際 effects、超界輸入、driver、Undo／readback | 記錄已存在的 Host surface；不外推 generic Widget。 |
| 其他語言與真裝置 | missing fallback、CJK glyph、touch/pen/IME、keyboard-only、screen reader、browser/platform matrix | viewport resize 不代替真平板或可及性驗收。 |

### 11.3 明確未定案

Uniform Source 簡化已是要求；候選列式外觀尚待review。其餘 Source 不自動套用這項決定。控件位置可改善不等於已批准全面重新配置。沒有新增 visual profile、production API、transport 或全域 mixed Undo。Toolbar Panel 等能力即使在某個既有 slice 完成後仍可能缺證據，應記 scope/coverage gap，而不是自行擴大 S13 或宣稱已包含。

## 12. v0.1 交接狀態

本稿已提供完整產品範圍的能力分類、保留強度、桌面與 overlay 參考、Node 保真基準、精確 token 入口、數值編輯語義、多語言與責任邊界，以及可追蹤的未驗事項。它可作設計與實作審查的共同輸入，**不能單獨作為完整 UI acceptance certificate**。

在本稿讀取時，INTERACTION_COVERAGE 早期 revision 6 已由初始61項擴為 **65 entries／12 component groups**，其中 **47 entries 有 observed claims、68 筆 observation mappings、fully verified sequences＝0**。同一觀察可以映射多個 entry，mapping 不是獨立測試。部分 entry 已有具名 observed transition，與「每項完整要求序列皆已完成」是不同層次。這些數字不是61／65／68個自動化測試，更不是618 capabilities 的交付進度；後續以該 JSON 的具體記錄為準。

Portable screenshots 仍有缺口：五張 owner 提供的**歷史**原圖已複製到 [visual-reference/historical](../visual-reference/historical/index.json)，並留有 checksum／來源；它們不能取代 LIVE-001–004 的當次操作證據。當次工具畫面尚未保存為這份交接的 portable captures。index.html 是 measured/token specimens，不是 pixel replica；只有靜態語法／link／embedded snapshot 檢查，本輪 browser preview 因 file protocol 安全限制未完成，沒有嘗試 workaround，也未取得 visual PASS。此稿只寫設計文件，未修改 Dropbox Grape repository、未執行產品或架構測試，也沒有開啟正式重構工作。


## 13. 可見設計稿與本輪修正

[ATLAS-004](../atlas/index.html) 是人類可審查的離線HTML/SVG圖冊，包含工作區配置、Group、節點排列、Link箭頭導航、獨立 Panel、數值與分量控件、浮動／對話狀態、連線／端點語義及已接受的精簡自有 Color 設計。它補足純文字報告，HTML 結構不指定重構實作架構；本輪只整合設計並停止供 review。

本輪 owner 修正以 [DESIGN_PREMISES §9](DESIGN_PREMISES.md#9) 為準：三圓logo、按連接狀態空/實心並畫線、分隔把手、不同高亮方式、Uniform簡化、SVG三角、日文「を編集」不拆開。家族色合成與brightness profile暫不重配。

LIVE-005 的額外資料見 [atlas/evidence.json](../atlas/evidence.json)。透過產品縮放選單量得25/50/100/170%的grid samples，最後返回Home；只有view操作，未改圖內容。這些是離散樣本，不是整段zoom curve或跨平台驗證。既有65項coverage未因圖冊示範而升格為產品PASS。

圖冊校驗見 [atlas/verification.json](../atlas/verification.json)。ATLAS-004 保留 build/check、靜態 fields 與 atlas 檢查，並分別以 check-color／links／groups／arrange 驗證局部圖解；此文件不預告本輪測試結果。舊 picker 的27項檢查已被新版取代，不能計為目前 `check-fields.cjs` 的通過證據。靜態與本地邏輯檢查均不代替 browser 視覺、CEF、IME、觸控、真實 Host 或 Graph 驗證。

### 圖冊補充：選取間距、Scroller 與精簡 Color

本次 view-only 觀察見 [LIVE-007](../atlas/evidence.json)。選取工具列距 Node 可見邊界約 12px；上方空間不足的 100% 樣本移到下方。圖冊已改用局部邊界定位，並保留整張 specimen 的 ×1.2 放大說明。

[Scroller 樣本](../atlas/index.html#scrollbars) 是可滾動的內容區，外觀採當次量得的低對比灰紫 #51465F／深色軌道 #1B1B23。捲軸不是面板 resize grip；不把瀏覽器備援尺寸當成跨平台承諾。

[Color](../atlas/index.html#color) 已轉為 §6.1 與 [COLOR_PICKER_SPEC](../atlas/COLOR_PICKER_SPEC.md) 的精簡設計：六列同時同步、按 RGB／RGBA 顯示 alpha 與 HEX、固定 current swatch、色票及色面 tabs。獨立 `atlas/parts/color.html`、`atlas/parts/color.css`、`atlas/parts/color.js` 與 `atlas/check-color.cjs` 分離圖稿及檢查；一般 fields 保留靜態保真 specimen。這是圖冊材料的分工，不是 production module 或 API 決策。


## 14. ATLAS-004 的三個能力章節

### Group：明確成員，不是空間吸附或 Subgraph

[Group 圖稿](../atlas/index.html#groups) 將 explicit membership 畫出來：節點幾何上在框內不等於加入；同一節點不重複屬於多個 Frame。標題拖動带動成員，空白框身保留背景操作。邊框隨成員位置與可見尺寸變動；一般24px padding＋28px title。Join依目前選取及唯一最高成員數判定目標，模糊時不猜。Remove Frame留節點與Edge；Detach移除成員關係。Frame沒有獨立摺疊，節點Collapse是另一操作。

### Layout：節點排列，不是 Panel layout

[排列圖稿](../atlas/index.html#arrange) 分開11命令。2個以上選取可對齊／Arrange，等距需3個以上。L依來源、Shift+L依結果；兩種都是左往右資料流。等距比較可見邊緣而非中心，最小gap48graph units，不夠時延伸最遠端。接線排列只用選取內部Edge；不是全圖避障器。可配置入口、順序、Undo与不改計算語義須一起交接。

### Link：顯示、導航與真正的關係

[Link圖稿](../atlas/index.html#links) 明列左鍵全對端／右鍵選單／←→來源目的地／X隱藏線／Wire-Link轉換。Current Always箭頭是預設啟用；hover/hidden為備選呈現，而隐藏线仍保留箭头。源端箭頭排除普通Wire與遞迴對端。持久樣式、瀏覽器偏好、視圖選取不能混成一個Graph修改。

每章都有來源文件與自含規則摘要，圖稿可在不讀舊程式的情況下理解；來源只用來支持行為，不規定下一版架構。詳見 [ATLAS-004 changelog](ATLAS_004_CHANGELOG.md)。

## 15. CANVAS-005：畫布操作行為交接

2026-10-03補齊，入口：[完整規格](CANVAS_INTERACTION_SPEC.md)、[20項機器可讀驗收](CANVAS_ACCEPTANCE.json)、[5張圖解](../atlas/index.html#canvas-operations)。分類涵蓋平移／游標錨定zoom／百分比選單／MMB Dolly／Home-Frame-Center／Focus與fullscreen／選取與primary／框選／Node-Group拖動／方向與Link／Stage-子圖／Creator／touch／網格-Overview／保存-readonly-guard-History。

這次不再只列能力名：給出起手式、modifier、命中優先、預览、完成、取消、阈值、view/model/history差異與OPEN。參考值：normal zoom25–170%，Overview20%且<30%才簡化；24-unit snap與自適應displayGrid分開；node drag≥3 CSSpx、mouse marquee完成>3px、touch≥8px。

重要更正：兩方向框選皆intersection；MMB是Dolly；Home立即、Frame獨立動畫；Esc不離開Focus graph。普通mouse pan／marquee／node／Group／touch取消不完全一致，不以理想化統一敘述掩蓋舊產品缺口。

[實機記錄](../research/canvas-live-005.md)新增七組桌面序列，測試node位置已Undo恢復；[導航證據](../research/canvas-navigation-evidence-005.md)及[選取證據](../research/canvas-selection-evidence-005.md)提供source/test-intent與衝突說明。阻尼舊測試default-off已與current source不一致，不宣稱它PASS。Coverage revision8為65 entries，49有observed claims、75 observation mappings；完整requiredSequences仍0，不能把source補齊或七個樣本當成全平台qualification。圖册升ATLAS-005，產品程式與新架構不變。
