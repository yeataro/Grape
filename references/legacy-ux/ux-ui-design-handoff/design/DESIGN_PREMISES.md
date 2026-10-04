# UX/UI 交接的設計前提

本文件記錄本輪 owner 明確要求的設計分類，與已接受 IH-005 架構一起使用。不新增架構 API，不授權 production 實作。規則適用完整產品；第一個 implementation slice 未交付某功能，不等於該功能被排除。

相關文件：[架構相容規則](ARCHITECTURE_COMPATIBILITY.md)、[實機觀察](../research/live-observations-001.md)、[擴充邊界](../research/extension-boundaries.md)。Legacy 提供能力與外觀證據；既有 ownership、lifecycle、authority 及正式 Product Decision 約束新設計。

## 1. 五個問題分開回答

| 層次 | 要回答的問題 | 例子 | 交接要求 |
|---|---|---|---|
| **產品能力** | 使用者能完成什麼，成功／失敗結果是什麼？ | 調整數值、取消修改、找來源節點、配置工作空間。 | 必要能力不能因重排或換控件而消失。寫清前置條件、效果與邊界。 |
| **入口與配置** | 從哪裡觸發、放在哪裡、何時可見？ | 工具列、選單、快捷鍵、Inspector、浮動 Panel。 | Legacy 位置是參考 composition，不自動成為固定規格；更換入口仍要可發現、可達、明確指向正確 target。 |
| **操作語義** | 操作過程如何 commit、cancel、feedback、undo？ | 拖曳一次算一次編輯、Escape 取消、stale draft 拒絕。 | 所需效果與安全語義須保留；某個滑鼠手勢是否逐字沿用，要由具體需求／相容承諾判定。 |
| **Widget／互動呈現** | 用什麼控制來提供能力？ | Numeric Field、Slider、Value Ladder、向量分量控件、色彩控件。 | 可替換或擴充，但要適合目標 spec/type，經既有命令／scoped write，保留必要操作語義。 |
| **Style／視覺語彙** | 相同資訊與能力看起來如何？ | 顏色、字體、spacing、border、密度、hover/focus。 | 不決定型別、值、合法性、權限或 ownership；不能因換皮而換寫入語義。 |

這是設計分類，不新增五層程式物件。共同 Panel 外觀不等於所有 Panel 必須使用同一 Widget；共同 Widget 能力也不等於只能有一種皮膚。

## 2. 要求狀態與證據狀態分開記錄

一項能力可以同時是「owner-required」與「unknown factory default」；必要性已確定，不代表每個觀察細節也已證實。

| 標記 | 含義 | 不得推論 |
|---|---|---|
| **Owner-required** | owner 明確要求保留的能力／本輪分類規則。已接受契約另標 `contract-required` 並引用來源。 | 不代表已實作、已驗收，或 Legacy 每個控件位置都被保證。 |
| **Observed** | 已直接看見的外觀／狀態，或實際完成並記錄的操作。必須寫出是哪一種。 | 看到勾選、按鈕、help 文案不等於驗過出廠設定或完整行為。 |
| **Proposed** | 設計安排、替代控件、配色方案、名稱或可選候選功能。 | 不自動升格成 owner 決策、已觀察行為或架構契約。 |
| **Unknown** | 證據不足、衝突或尚未測試。寫明缺什麼證據。 | 不可因 Unknown 就默默刪功能，也不可補猜成已支援。 |

`UI-advertised`、`historical`、`runtime-tested` 可作 evidence 細分。每條紀錄同時保留「需要程度」與「證据來源」，不要把兩者壓成單一 PASS／FAIL。

## 3. Experimental 不代表可以刪

**Owner-required：出廠預設啟用的 experimental 功能，屬於新產品需要保留的能力。出廠預設停用的 experimental 功能，列為 optional candidate。** experimental 標籤本身不決定取捨。

| 已知狀態 | 產品分類 | 還需記錄 |
|---|---|---|
| 有可信證據為 factory-default enabled | Required capability | 實際效果、邊界與相容要求；不要求保留原「實驗」入口或標籤。 |
| 有可信證據為 factory-default disabled | Optional candidate | 效果、價值、依賴／限制；未採用前不得當成既定交付承諾。 |
| 對話框明示目前符合預設，例如 Reset defaults 停用 | UI-indicated default，信心 medium | 比單一 checkbox 強，但仍不是乾淨 profile 的初始驗證；保留所見值與該提示，不升格為 fresh-profile verified。 |
| 只看到目前 checkbox on/off | Factory default unknown | 目前偏好可能是使用者設定、restore 或版本 migration 結果；不能據此定必做／選做。 |
| 功能在目前偏好下運作，但 default 證據不足 | Observed behavior，requiredness 尚待分類 | 保留能力紀錄與驗證入口，不先丟棄。 |

可用 default 證據包括：owner 對該功能的明確確認、可信的該版本預設資料，或乾淨且受控環境的初始設定驗證。既有頁面、同 browser 新 Tab、甚至重開頁面，都可能沿用偏好，不能單獨證明 factory default。這是證據要求，**不是授權為了驗 default 重設使用者環境**。

本輪新增對話框證據：Experimental features 中 **Reset defaults 為 disabled**，共 **31 個 controls＝29 個 settings＋2 個 duration 欄位**。應保留為上述 UI-indicated／medium 證據；控制項數不等於不同產品能力數，兩個 duration 也不是兩項獨立 experimental feature。

**先判斷 toggle 控制的是哪一層，再分類。** 預設停用若只關閉某種入口、手勢變體或外觀，optional 的只是該變體，不能連帶刪掉底層能力。例如：

- expanded node 的 Triangle 停用：只影響該 collapse 入口；不能據此把 Node collapse 能力列為 optional。
- Toolbar background 停用：只影響背景 style；不表示工具列或其命令可省略。
- Canvas trash 停用：只影響該刪除互動；不表示刪除節點能力可省略。

每筆 experimental setting 應因此拆成「底層能力」「此 setting 控制的入口／操作變體／style」「default 證據與信心」，再對真正受 toggle 影響的範圍套用 required／optional 規則。

正式後續產品決策仍優先，例如 DEC-GRAPE-001 已延後 coordinated Mixed History；不因 Legacy 有此能力而恢復它，也不把它標成 Covered。

## 4. 數值編輯：交接能力，不鎖死 Legacy 機構

| 必須逐項盤點的能力／語義 | 不自動鎖定的做法 |
|---|---|
| 輸入明確 scalar／vector 數值，辨識各 component 與目標型別。 | Numeric Field、Slider、Value Ladder 的確切组合／位置。 |
| 若需求包含連續調整與精細調整，保留相應精度、可控性及 feedback。 | 僅因舊版使用階梯，就要求新版一模一樣的 popup；或僅因使用 slider 就把所有值限定 0–1。 |
| commit／cancel、parse error、IME、stale token、readonly／connected、gesture batching 與 Undo 的已接受語義。 | 字級、顏色、step 控件外觀；特定修飾鍵是否必須完全相同，依該項明確相容需求判定。 |
| local/default 值與 Host actual、linked source 的區別。 | 把它們合成一個看似通用但無法判斷 authority 的欄位。 |

**min/max、drag range、step、clamp 要分開敘述。** Slider 顯示範圍不必等於合法值範圍；clamp 是對編輯輸入如何採納的規則，不是色彩或 spacing。後續可設計 UI／Parameter 編輯層的配置方式，但必須遵照該 target 的已宣告 spec／write 驗證；renderer 不能私下改寫資料約束。

這些編輯層選擇不等於新增 GLSL `clamp()`、改變 data type，或限制 connected shader 值；若需要 shader 運算，應明確是另一項模型能力。設計稿應直接說「何時限制輸入」「超界拒絕、保留文字或按已宣告規則 clamp」「是否只是拖曳範圍」，不要用單一 min/max 圖示混過去。

**現有能力不能誤報為不存在：**本輪實際 UI 的 Host 自定義參數 Roughness 已呈現 `RangeMin/Max`、`Minimum/Maximum`、`ClampMin/Max`。這是現有 **Host custom-parameter surface** 的證據；owner 對未來 generic numeric Widget 的 min/max 設計提議是另一個適用範圍。不能因此說「目前完全沒有範圍／clamp」，也不能反過來宣稱通用 Widget 已具備同樣設定。各欄位的實際作用與互動驗證仍依對應觀察紀錄判定。

來源：既有 scoped Parameter／field draft 契約（`handoff/04_EXTENSION_MODEL.md` §5）、`handoff/ui-reference/UI_SPEC.md` §3–4。Legacy 顯示的數值操作 help 目前僅屬 UI-advertised；真正測過的效果再獨立升級 evidence。

## 5. Panel、Widget、Style 的擴充關係

- **Panel** 決定功能內容與自己的 private viewState，經公共 composition／view contribution 進 workspace；不必因共用外觀而失去特殊功能。
- **Widget** 提供某種互動能力，可由 feature 擴充；採用 common 控件或自己的控件皆須經一致 projection、scoped target／Application command、draft／lifetime 語義。它不是 Graph 的第二份資料來源。
- **Style** 調整同一能力的外觀。皮膚不能獨自更改 Widget 的 commit/cancel、精度、clamp、authority 或 link 行為。
- **Parameter presentation/semantic style**（例如 RGB／XYZ、適用的色彩控件）與全局視覺 profile 不是同一件事：前者須適合 spec/type／既有 projection，後者不改 canonical value shape。也不能把換 Widget 當成單純換色。
- **Localization** 跟隨 feature owner：Panel／Node／Widget 使用自己的 contribution 與 TextRef，Shell 管共用文字。新增 feature 文案不修改中央 catalog；locale 不進 Graph canonical state。

以上是既有 `handoff/04_EXTENSION_MODEL.md`、`15_LOCALIZATION_CONTRACT.md`、`16_VIEW_MOUNT_CONTRACT.md`、`17_PANEL_COMMAND_CONTRACT.md` 的設計約束，沒有新增 registry、Theme API 或 framework。

## 6. 怎麼閱讀後續設計材料

工具列位置、Panel 排列、按鈕群組、Legacy theme 名稱及 screenshot composition，預設作 **reference composition**。若某項效果／入口已有明確產品要求，另標 required；不得只靠「舊圖在那裡」升格為永久位置約束。

每個元件交付最少寫出：**能力與需要程度 → 操作效果／commit/cancel/feedback → 可用入口 → Widget 選擇 → Style → evidence／unknown**。一個視覺稿可以提新配置，但必須能指出每個 required capability 仍從何處觸發、如何知道成功／失敗、如何取消或恢復，以及 scope／authority 如何維持。

忠實保留產品能力與視覺品質，不等於複製所有 toolbar 座標；允許重新配置，也不等於可刪掉不方便放的能力。單純 appearance proposal 不構成產品或架構決策。

## 7. Owner 已指定的保留項與未決項

以下是 owner 後續明確偏好，不能被前面的「reference composition／style 可調整」一律降為自由重設。

| 對象 | 目前要求 | 設計交接處理 |
|---|---|---|
| **現有 Node 外觀** | **Owner-required：必須保留。** 是 owner 喜愛且要求延續的產品外觀。 | 以真實 Legacy Node 外觀作保真基準；不要以架構重寫、通用元件庫或新 profile 為由默默換成另一套 Node 設計。缺少某狀態證據就補記 unknown，不自行發明替代版。 |
| Add Node 的互動與 Add Node pane | Owner 喜歡的 reference，允許改善。 | 保存目前可辨識的使用方式與品質；任何改善另標 proposed，寫清保留了哪些能力、改善什麼，不把喜好誤讀成每個座標固定。 |
| Source Tags | Owner 喜歡的 reference。 | 保留作正向設計依據；拆清標籤的資訊與操作，再作視覺／配置調整，不預設刪除或併成無法辨識的通用文字。 |
| Stage buttons | Owner 喜歡的 reference。 | 保留清楚的 Stage 選擇與 active 狀態；不得把切 Stage 與切 Graph／Host 混成同一件事。 |
| Toolbar Panel | Owner 明示也是 capability surface 與 reference；和 selection quickbar 分開辨識。 | 盤點它實際提供的能力與入口，不因已有 Node／Edge 選取快捷列就視為涵蓋。哪些能力必做、可選或未驗，沿本文件規則逐項記錄。 |
| Uniform Source 圖卡 | **Owner-required：必須簡化。** | 舊圖卡只作現況參考；精簡列是待 review 的呈現候選。不能把 tag teal 色直接套整張卡。其他 Source 類型尚未一律要求簡化。 |

### Overlay 與浮動入口不能只按外觀合併

Canvas 浮動面板、可拖曳的自定義參數編輯對話框、Export modal 是不同的 **互動行為類型**。這是設計分類，不新增架構 class，也不要求把它們全塞入一種 Panel。

每一類各自描述：是否可移動、是否可並存／阻擋背景、target 與 lifetime、focus／鍵盤範圍、草稿歸屬、commit／cancel、close／Escape 與失敗回饋。某項尚未觀察就標 unknown；不能因都能漂浮就推論它們有相同 close guard、保存方式或 Enter／Escape 效果。既有 Panel 若適用仍遵 Panel 契約，但不由 modal 的外觀推導其必須成為 Panel。

全局、Node、Edge 的浮動工具列可以共用可組合的入口樣式或排列模式；**共用呈現不等於共用 authority**。每個動作仍標明自己的 target/scope、Application command 或 scoped write、可用條件與 lifetime fence；Node toolbar 不能因共用元件取得全局或另一 Edge 的編輯權限。

**Scope 提醒：**本份材料描述最終產品 UX reference，不宣稱 S13 或其後已涵蓋這些能力。即使某 implementation slice 完成，Toolbar Panel 等能力仍可能沒有對應交付／驗收證據；這時記為 scope/coverage gap 或 unknown，不把它推定為已實作，也不自行改 Migration Plan、擴充 S13 範圍或授權開工。

## 8. 已採用的圖冊設計：精簡自有色彩選取面板

**UX-DESIGN-GAP-COLOR-001 · Owner-required · 精簡設計已獲 owner 接受；Function Preview0.8.273 已交付並有局部實機驗證。ATLAS-004 同步其行為；重構產品與 CEF／裝置驗收仍未完成。** 此 ID 僅屬本設計交接，不是新增 Handoff Gate 或 Architecture Decision。這次採用的是設計呈現，不能把 runtime gap 一併標為已解。

2026-10-02 owner 回報：目前色彩選取視窗在不同 browser／環境中呈現不一致，在 CEF 環境甚至無法成功叫出。因此，產品必須提供自己的色彩選取面板；不能把瀏覽器／作業系統的原生 color picker 當成完成這項能力的必要條件。

這裡有兩種不同的證據：**產品自有面板是 owner 已明確要求的補齊方向；CEF 無法叫出是 owner-reported runtime evidence，本輪尚未獨立重現。** LIVE-003/004 已觀察到色彩欄位／swatch，不代表原生色彩面板在各環境可用，也不代表自有面板已存在。這不是可省略的 disabled experimental variant。

已採用的精簡呈現如下；詳細行為與圖稿入口見 [COLOR_PICKER_SPEC](../atlas/COLOR_PICKER_SPEC.md)、[離線 Color artboard](../atlas/index.html#color)：

| 部分 | 本輪採用的設計 |
|---|---|
| 數值列 | **H、S、V、R、G、B 六列同時可見、同步更新**，不是 HSV／RGB 模式切換。RGB 使用0–1數值表示。只有 target 明確為 RGBA 時才顯示 A；RGB 不顯示多餘的 alpha。 |
| HEX | RGB 顯示 `#RRGGBB`；RGBA 一律顯示 `#RRGGBBAA`，alpha 是 `FF` 也保留八位。RGBA 可貼六位並保留原 A，完成該次 HEX 編輯後正規化為八位；RGB 拒絕八位，不偷偷丟 alpha。 |
| 當前色 | 保留 **100×100** current swatch，寬度不因工具擴充而縮小；加號覆在右上角。這是圖冊設計尺寸，不是 Legacy 採樣值。 |
| 色票 | 以 [TD 色票參考圖](../atlas/assets/td-color-reference.png) 為來源，呈現44色、11×4 grid，每格最小16px。HEX 右側另放6個 custom colors。不得把 screenshot 色票參考當成跨顯示器色彩管理保證。 |
| 上方工具 | Icon tabs 切換 swatches 與方形／圓形／三角形色面。這些是同一份圖冊色值的不同入口，不把數值列拆成互斥模式。 |
| 所有色彩入口 | 共享這套呈現意圖。既有 target adapter 明確選 RGB／RGBA；不能從任意 vec3／vec4 維度猜出「這是顏色」或自行改型別。 |
| Screen eyedropper | 保留入口及誠實的限制說明；本輪只是 demo，不擷取螢幕。Browser／CEF 的 capture 能力與權限另待後續驗證。 |

後續 owner 已明確確定提交行為，並在 Function Preview0.8.273 交付：**Uniform 即時更新，外點接受，×／Escape 嘗試恢復開啟值；非 live／常數保留草稿，Apply 才提交，外點／×／Escape 取消。** 恢復不能越過 Host actual 的 CAS／receipt／lifetime 保護；外部值已變時保留外部值並回報 conflict。Apply 只在非 live 模式出現，× 始終可見；色票／色面／滴管三個入口置中。

舊稿的 HSV／RGB 二選一、以 SV＋H/A 作完整面板，以及「提交政策尚未定義」說法已被上述 owner 決策取代。不是把先前被否定的 generic 大型數值控制器重新加回。圖冊只改示範值，不對 Host 執行 CAS，也不規定重構 UI 的 class 或 API。

[COLOR-IMPLEMENTATION-004](../research/color-implementation-004.md) 分列先前完成的產品驗證與剩餘限制。真实 CEF、代表性裝置、screen eyedropper 權限／支援以及新色彩管理承諾仍未驗；產品不用原生 popup 不等於所有環境自動通過。圖冊採用與 prior preview evidence 也不替代重構產品驗收。

本項不改 Graph／Host／Parameter ownership，不改 S13 範圍。圖冊 HTML／SVG 不寫入產品 Graph／Host，本輪只交付設計稿。

## 9. 圖冊人類 review 修正（2026-10-02）

適用工作稿 [ATLAS-004](../atlas/index.html)，承接 ATLAS-002 的人類 review 修正；不修改 frozen Handoff 或正式產品。

- **產品圖標必須保留**：目前 Function Preview 的三圓形關係、大小與顏色；依可見 SVG 量測，不以圓點字元代替。28px 顯示、64px viewBox、三圓半徑11；詳見 atlas/evidence.json。
- **本輪設計新方向**：Input、Output 都是未接空心、已接實心。圖冊附真實連線情境。Legacy 的按方向區分只保留為比較；未宣稱 live product 已改。Wire/Link 隱藏與 invalid 狀態仍須分別說明。
- **高亮分層**：工作區 tabs／搜尋選取可用填色；Node 選取保留綠框；Inspector 小分頁保留底線。不能把所有 highlight 一律加框。键盤 focus ring 與持續 selected 外觀不同。
- **分隔把手可見**：側欄直向與右側面板橫向都附樣本。6px分隔帶與2×28px把手来自當次 DOM；圖稿沒有假装已完成拖曳產品驗收。
- **下拉圖示**：圖稿採SVG實心三角；展開、勾選與其他命令是不同語義。無可靠實測的其他圖示標重繪候選，不能宣稱 exact copy；原生 select 展開 popup 仍可能受平台影響。
- **多語言**：日文「を編集」維持同一行，不把助詞與動作以 br 強切。按語義短語／可用寬度斷行，不因長文縮到不可讀。locale 不改 canonical Graph。
- **Grid**：25/50/100/170% 的畫面點距和點半徑已取樣並在圖冊並列；不能推定全部縮放門檻、DPR或吸附行為。
- **Color panel**：本輪採用 §8 的精簡版：HSV／RGB 六列同時可見、RGBA 才有 A、六位／八位 HEX 規則、100×100 色塊、44色 grid、6個 custom colors 與 icon tabs。它不強迫跟隨浮動 Panel 模樣，也不成為全體 shader 值的 clamp。
- **亮度／色彩 profile**：白色襯底會影響深色UI觀感。本輪不重配色。家族／OP Type完整彩度角色色再疊body的方向留待後續style調整，尚無新合成公式或alpha規格。

- **Link 線保真**：LIVE-006 已量得正常淡灰 #8E8E96 / 60%、1px、dash4/5、non-scaling-stroke；選取為 #FFF2D2 / 2px。不得把型別色Wire改成虚线就当Link。
- **Add Node 圖標**：owner對本輪SVG圖標給予正向review，先保留目前方向；新增節點時再選合適圖示，這不是永久固定全部glyph的規格。

- **數值欄位保真邊界**：移除自行設計的大輸入框＋獨立Slider＋Apply/Cancel實驗。這不是既有產品操作，不應取代真正的內嵌欄位／拖曳手感。候選畫面不能只靠標籤就充當現況交接；自有色彩面板是另外明確要求補齊的缺口。

- **選取工具列的間隙**：LIVE-007 量到節點可見邊界至工具列 12 CSS px；100% 樣本上方空間不足時改在下方，仍隔 12px。圖稿以節點局部邊界定位，不固定於整個展示區的 top；×1.2 是圖稿整體放大，不是要求工具列隨 Canvas zoom 縮放。完整避碰規則仍未驗。
- **Scroller**：新增真的可捲動的深色面板樣本，與 resize divider 分開。把手 #51465F、軌道 #1B1B23、標準 thin；9px WebKit 備援與當次 10px 實際占位分別記錄，不冒稱跨平台尺寸。Hover／active、OS自動隱藏與CEF待驗。
- **Color 呈現一致性**：採用 §8 的同步數值列與色面／色票 tabs，不再把舊 SV＋H/A 草稿當成現行完整面板。色面操作與精確輸入共享圖冊值；每種色面的實際軸向與操作說明以 COLOR_PICKER_SPEC 為準，不由圖冊推導新的 shader 色彩語義。


## 10. ATLAS-004：Group、節點排列、Link

- Group Frame 是視覺組織與明確成員關係，不是 Subgraph。框內相交不自動加入。移動標題帶動成員；移除框保留節點／接線。成員節點可摺疊，Frame 本身沒有獨立 collapsed 狀態。
- Owner 所說的 Layout 是**節點排列**：對齊、等距、依接線 Arrange。它不是工作區 Pane 分割。來源／結果兩種 Arrange 都保持左往右資料走向，只改選取節點，不保證避開未選節點。
- Link 章節強調淡灰線＋接孔箭頭。Line visibility、連接關係、導航選取、Wire/Link 樣式保存是不同狀態；詳見圖稿表格，不能只畫淡線省略操作。
- 以上仍以能力交接；toolbar、選單、快捷键是可配置入口。default-enabled experimental 保留要求沒有放鬆。來源檔與局部演示不變成重構元件模型。
- 詳細來源和範圍見 [本輪變更紀錄](ATLAS_004_CHANGELOG.md)。
