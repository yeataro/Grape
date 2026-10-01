# First-slice UI specification

這是**實作規格與結構示意**，不是新視覺設計、Legacy 截圖、已完成的 UI 或 pixel-perfect 認證。來源是 IR-001 行為、AC-002 的 model/UI 邊界及 MRDP 未決項。第一個 slice 只需本文件列出的 root-network Canvas＋Inspector＋基本圖／產碼／保存操作；不把所有 618 項塞進第一個畫面。

本文件可單獨使用：**Graph 是共用模型；EditorContext 是每個 Canvas 的選取／導航；CanvasView 是相機；Inspector 查詢明確 Context 的選取；Graph 操作才改資料；UI 不備份另一份可寫圖。** UI 命令經 Editor/Parameter；產碼讀 immutable Snapshot；檔案與 Host 另經 adapter。無 Host 仍能顯示／編輯模型，但不能顯示虛假的 applied 狀態。

## 1. 必須分辨的四種 UI 指示

| 標記 | 意義 | 如何驗收 |
|---|---|---|
| **S — Structural** | ownership、資訊關係、Panel／Context／接口身份等不可由 theme 改掉的結構 | 讀狀態／操作序列測試；可替換 renderer，關係仍成立 |
| **B — Behavioral** | 使用者可觀察的結果、焦點、失敗與狀態轉移 | 具名互動／失敗案例；不是只截圖 |
| **P — Visual preference** | 既有外观／配置偏好優先保留；示意尺寸不因此成為像素規範 | 外觀可逐slice核對；若偏好還有明確保存／重設／預設行為，該部分屬B，不能以換theme取消 |
| **R — Replaceable** | 示意排版、theme token、圖示、精確尺寸未被本 slice 承諾 | 可以換外觀；不能破壞 S/B 或冒稱像素等價 |

所有 SVG 明列這四類。示意顏色只幫閱讀；除 §5 引述的 Legacy 明確色值外，不把示意圖的 palette 當產品標準。

## 2. 第一個畫面的區域與路由

見 [UIR-01 結構示意](workspace-schematic.svg)；UIR 為畫面參考 ID，與實作 slice S01 不同。

| 區域 | 第一個 slice 必須提供 | 綁定／所有權 |
|---|---|---|
| 標題與命令區 | Graph 名稱；當前 Stage；新增節點、Undo、Redo、生成/查看 GLSL、保存或匯出、重新載入入口；狀態訊息 | **S** 顯示對象由當前 Canvas Context 決定；按鈕不是另一份 Graph state。**R** toolbar 可 overflow，但不能遮住名稱 |
| Canvas Panel | 一張 root network；既有固定 Output boundary；固定與動態 Node；真實 ports/edges；獨立 pan/zoom/selection | **S** Layout/Panes/Tabs 管擺放，Panel 管呈現，Context 管選取，Graph 管模型。無需第一輪就開放自由拆 panel |
| Parameter/Inspector Panel | 選取對象、名稱與功能種類分開；列出該 Node 的 ParameterSpec；local value／connected source／錯誤 | **S** 跟隨 Context 明確主選取；無選取為空態。UI 依真 schema 建構，不能自行猜 ports |
| Code 區（可按需打開） | 當前 Snapshot 的唯讀 GLSL、stage 標記、生成錯誤；舊成功產物和當前錯誤可分辨 | **B** 不允許改 viewer 文字去改 Graph；晚回覆不得覆蓋新 target 的 code |
| 診斷／狀態區 | error/warning、定位、目前保存狀態；若無 Host，清楚標示未連接 | **S/B** 儲存完成、shader applied、生成成功是三件事；一般成功 toast 不遮掉持續 error |

**第一輪可不提供**自由 Panel 編排、完整 Add Node catalog、Library、Preview 串流、Host OP Parameter、Structures authoring、Notes、touch scrubbing、全部自動排列、Overview。它們仍在 inventory 中，不因 first-slice scope 刪除。這個 scope 不是改寫 Default Layout：Legacy 的八 panels/default/minimal 要在 layout slice 按 LC-UI-060 驗收。

首次切換 Canvas A→B：處理 A 的未完成手勢 → 驗 B Context → 更新 active → Inspector 清舊內容 → 查 B selection；B 無 selection 就顯示空態，不保留 A 的參數。Inspector 接受焦點不改 active Canvas。未來非零 linkGroup／pin 以既有 Workspace routing 契約為準；不在第一輪製造另一個 global selectedNode。

## 3. 互動與可驗收結果

| Action／條件 | 使用者可觀察結果 | 寫入／History／failure |
|---|---|---|
| 點 node／加選 | 普通點擊取代集合；modifier 切換成員；primary 留在集合；Inspector 跟隨 primary | Context-only；不改 Graph/History。來源 LC-UI-001 |
| 點空白 | 清選取後 Inspector 空態；不可用舊 Parameter handle 寫回前一 Node | Context-only；框選精細 cancel 行為留 LC-UI-002 的完整 slice |
| 拖 node 或選取集合 | 保相對位置、線端跟隨；只在超過拖移門檻才當拖移；欄位/socket/button 不是拖移把手 | Graph positions；gesture 一筆 Undo；cancel 補償／不留下開放 Operation。LC-UI-008 |
| Pan／wheel／H／F | pan 是視圖；wheel 以游標為錨；H 全圖；F 選取，無 node selection 則全圖；readonly 仍能導航 | Panel camera，不進 Graph Undo。LC-UI-019；精確 smoothing 是後續 P |
| Port→反方向 port | 依真 PortRef 建 edge；occupied input 原子替換；型別／cycle／方向非法顯示拒絕，原線不變 | Graph transaction 一筆；不能先刪舊線再驗候選。LC-UI-025 |
| Dynamic mode 改變 | 當前 ports/parameters/edges/diagnostics 同次更新；被移除接口不能留可寫控件 | Graph state＋reconcile；loss／invalid edge 清楚顯示；Undo 還原。不能由 DOM 隱藏欄位代替 schema 更新 |
| 輸入數字但未提交 | 保留未完成字串；其他 view 的安全 refresh 不覆蓋 focused draft | FieldDraft；無模型變更；Enter 經 IME guard；stale schema/value 顯示拒絕而非覆蓋。LC-UI-047 |
| Commit 值 | 正確型別／合法範圍才更新所有同 Graph 的模型投影 | Parameter.write/Operation；失敗保模型與可修復 draft；range/clamp 遵 ParameterSpec，不由 slider 改寫 type |
| 點 connected source 名稱 | 依真 edge source 選取並 Frame source，與 Disconnect 分開 | 導航不進模型 Undo；stale graph/network/edge 拒絕，不找同名替代。LC-UI-045 |
| Undo／Redo | 第一輪只有 Graph History，成功才刷新模型；值、接線、位置一起恢復適當 transaction | 模型共享，selection/camera 個別；**不宣稱已完成 mixed native chronology**。LC-UI-100 仍有 MRDP gate |
| Close Inspector／Canvas | 只結束相應呈現資源；Graph 可繼續存在；未完成手勢先被處理 | Panel close≠Graph unload。借用 Context 不任意dispose；missing Panel 保存opaque viewState |
| 查看 GLSL | 明示當前 Graph/Stage，唯讀 code；失敗有 error，舊成功內容若保留須標清楚 | Snapshot query；late reply用 context/load/navigation/request guard，不覆蓋新畫面。LC-UI-076/077/099 |

接線空白落點（LC-UI-026）會受到 Trash preference 影響，完整 Create-on-wire 流程不在首 slice 時，**不能默默套用另一種破壞性斷線行為**。首 slice 若只支援明確 port-to-port，禁用尚未支援手勢並寫入 slice 限制。

## 4. Inspector 的最小建構規則

1. 使用 [Panel public composition](../04_EXTENSION_MODEL.md) 路由取得 Context＋Graph load＋occurrence＋node identity，再由 `ScopedParameterTarget.openRouted` 開啟目標。spec/value/type/link/projection/write 都經同一 target；renderer 不自行遍歷 Graph/resources，也不按顯示名稱查物件。每次 schema 變更重新取得 immutable snapshot。
2. Node identity/name 與功能名稱分開。參數列順序取 module 的公開規格；不要依 DOM 前後反推 port。
3. input parameter 查實際 port type/semantic/connection；state parameter 沒有假 GLSL port。widget 只能改呈現，不能改接口型別。
4. Local value 有可編輯器；connected input 顯示來源與 Disconnect，不能假裝可以用本地欄位蓋過來源。整矩陣／column／component 覆寫的細粒度繼承需後續複合控件驗收。
5. 未支援 widget → 安全 fallback 或 readonly，加 notice，保留完整值。missing Node module → opaque/fallback 資訊，不擅造 ports／預設值。
6. 控制項至少具可見 label、鍵盤焦點、明確 error/readonly 狀態；長名稱可省略但須可取得完整名稱。長 CJK 按鈕可換行，不與名稱重疊。確切欄寬是 R，非英文固定長度。
7. 向量按 width 顯示 components；矩陣 column-major、每欄向量，不能把欄壓到不可讀。vec style RGB/XYZ 僅改名稱／呈現。兩者資料型別、port keys 不變。LC-UI-043/044/058/093。

第一輪範例包含 float scalar 與 dynamic state menu，ParameterWidget 範例另外證明可替換呈現。完整 bool/menu/color/vector/matrix 控件可依共用projection加入，**不等於原生browser controls已驗證**。IH-002 的 [scoped target 契約與實例](../examples/parameter-widget-or-ui-contribution/README.md) 已把 root/nested projection 與 write 接到同一公開入口；G-EXTENSION-WIDGET-SCOPE 保留 production UI integration 門檻，不再要求 implementer 自行補 nested lookup。封存 root-only API 保留為歷史反例，不能當目前 renderer 入口。

## 5. Port、edge、Node 的視覺語義

| 元素 | 需保留的語義 | 標記／來源 |
|---|---|---|
| Input/output | 方向明確、有真實 PortRef；socket 座標由同一 screen↔viewport↔network 轉換取得 | **S/B**；共用座標，不分別估算 pointer 與 wire |
| Wire | 型別色曲線；颜色取 source type；socket 是各自 type，轉換時兩端可不同 | **B** LC-UI-027/058；gradient不自動表示任意轉換已合法 |
| Link | 灰色有方向的直虛線；改 style 不改 endpoints/type/GLSL | **B/P** LC-UI-027；不是新 Edge 類別 |
| Matrix | 冷石板灰；dark `#A1ADB7`、light `#5D6B78` | **B** LC-UI-058 明確保存的色值 |
| Struct／array | struct 低彩度 gradient socket/wire、文字 plain；array 沿 element type 色；TDMatrix 是 struct | **B** LC-UI-058；selection/hover 優先於 gradient |
| Scalar/vector／family | 種類/語義可用色與caption區分；不靠色判定型別 | **S**文字與type；**R**未在freeze文字列出的精確palette需後續補證據，不由示意圖發明 |
| Selected/error | selection 與 error 是不同狀態，可同時顯示；文字/圖標提供非色覺提示 | **S/B**；outline具體寬度/圖示 **R** |
| Port hitarea | 線接真socket中心；透明線命中至少6 CSS px，放大時可隨線增長；socket/node controls優先於line hitarea | **B** LC-UI-031；其他觸控幾何另驗 |

實驗 Overview 是獨立偏好：預設 off；on 時最小20%且嚴格小於30%才全卡家族色，port caption/type/inline fields/dropdowns隱藏，尺寸与socket位置不變；左下統一字級、36 graph px且最小10 CSS px、70% opacity（LC-UI-059）。它**不在 first-slice 必做範圍**，也不拿SVG縮放代替該規則。

## 6. 儲存、重載與錯誤畫面

見 [UIR-02/03/04 狀態示意](states-schematic.svg)。

| 狀態 | 顯示／允許 | 禁止混淆 |
|---|---|---|
| Clean Graph、無 Host | 可編輯、生成、Graph存檔；Host actions 顯示 unavailable 或不在此slice | 不能說已套用 TD，也不需要假Host才能編輯 |
| Dirty Graph | 明確dirty；可保存目前完整文件，含非可見 Stage/resources/model UI metadata | 不能只存 visible canvas |
| Export JSON | 捕捉當下完整Graph，兩空格JSON，交DocumentOutput；failure顯示、原Graph保留 | **下載不等於 mark saved、Host Apply 或 TOE Save**，LC-DATA-005 |
| Save via StorageAdapter | 捕捉snapshot/revision，寫入成功只標該份內容；同時新編輯仍dirty | 不把await結束時最新Graph當已存；沒有adapter就明示不可用，不偽成功 |
| Reload file/document | 獨立新load lifecycle或明確importreview；保留原raw，檢查候選；accept前比base/target | 不與Host `Reload Applied` 相混；後者丟棄/清history且MRDP仍待驗 |
| Invalid edge／model error | 顯示問題、可儲存修復性文件，生成被阻擋 | 不因error就靜默刪Node，不把舊shader說成新成功 |
| Missing module | 顯示missing type/ref，保留opaque state/refs／問題；不可生成 | 不同名最新版代填；所有payload保留不等於能安全執行 |
| Unfinished field | 顯示原文字，離開/重載先處理草稿，IME Enter不commit | 不把未完成字串自動轉0、不讓打開menu偷偷blur提交 |
| Persistent error | status/error details保留；對應recovery才清，定位到正確Graph/stage/occurrence | 一般toast或另種成功不能清全部error，LC-UI-091 |

首slice沒有Host binding時，**不要提供功能相同但名字沿用「Reload Applied」的本地重載按鈕**。可使用明確的 Open/Reload Document 操作；這是 first-slice 範圍標記，不是對 Legacy 命令的產品更名決策。

## 7. 兩個 Canvas 共用 Graph 的驗收序列

建立同 Graph 的 Context A/B → A選node1、B選node2 → Inspector 跟最近明確啟用的Canvas → A改node1的值 → B看到共用值但selection/camera不改 → A拖node1一次Operation → B同步模型位置 → B Undo 還原Graph → A/B仍保各自選取與視野 → 關A只釋放A視圖，不刪Graph → B仍可編輯。

這個序列同時檢查ownership、notification與實際UI routing。AC-002已驗模型邊界；新的browser實作仍須跑整段可見互動，不能引用模型測試假裝已完成Canvas。

## 8. 需要實作人明示的差距

| Gap | 第一輪處理界線 | 不能宣稱 |
|---|---|---|
| Exact visual specification | SVG僅結構；精確非matrix palette、font metrics、spacing/appearance tokens由UI slice明示標R | 像素複刻Legacy、已跨Safari驗證 |
| General Panel integration | 沿 [public composition／canonical example](../examples/minimal-panel/README.md) 登記、建立、route、restore、move、retarget、close；G-EXTENSION-PANEL 尚須真 browser renderer 驗收 | 六種 bounded PanelKind 是產品限制，或 headless qualification 等於 DOM/focus/accessibility 已驗 |
| Nested Inspector UI | 首 slice 範圍仍可 root；S03/S06 使用同一 `ScopedParameterTarget`／`projectTarget`／scoped draft，已有直接契約案例 | 使用 root.nodeById 或 UI-side resources traversal 補 nested lookup；模型驗證等於 browser Inspector 已驗 |
| Browser input | 實際IME/focus/pointercapture/cancel測試，scale+zoom同座標 | 模型傳入數字等於觸控筆/瀏覽器成功 |
| Legacy import/provenance | 依MRDP版本mapping S gate，先保存unknown，不自選latest | exactpin原型已保存knownUUID+unknownrevision的舊compile成功路徑 |
| Mixed Undo／Reload Applied | 首sliceGraph-only；Host slice另定chronology／draft eviction | Graph Undo等於原生controls/live receipts全通 |
| Host preview／native | 未提供真provider就明示不可用 | fakeprovider通過等於TD/GPU已驗 |

對應證據與示意畫面清單見 [SCREEN_INDEX.md](SCREEN_INDEX.md)。所有初期畫面上尚未實作的能力須清楚限制，不以「看起來有按鈕」當功能存在。

## 9. Responsive／tablet／mobile 的交接界線

**B（LC-UI-066）**：Legacy在寬度≤800px使用sidebar overlay；一次窄畫面暫關不能覆蓋desktop sidebar偏好。窄畫面Add成功後關browser overlay，header隱藏仍有恢復入口。這些是可觀察行為，並非要求把舊CSS搬進新產品。第一版若只交桌面viewport，必須列明範圍，不以隱藏overflow宣稱行動版完成。

**S/B**：重排／overlay不能換掉Context、選取或Graph；Inspector仍指向正確Canvas。視窗與Canvas座標轉換共用，裝置scale不能成為另一套接孔位置；overlay收合、pointercancel、focus與未完成gesture都要有清理路徑。觸控、滑鼠、筆的事件能力不可由Static／Node／Electron部署名稱推定。

**B（LC-HOST-031，後續Preview slice）**：單指未達6 CSS px先不送down，抬起才tap；超过成left drag。3D navigation允許才做雙指，pan／pinch判定後鎖定至放開。不得把此遠端Viewer手勢直接當Canvas的通用手勢規格。

**UI handoff gap**：本包無tablet／mobile實機截圖、screen-reader操作或觸控筆證據，只有desktop結構示意；版面細節R可在不變S/B內實作。相關宣告須通過G-UI-CONFORMANCE／G-DEPLOYMENT-CONFORMANCE及對應leaf Gate；本包不為完成視覺交接而發明新行動介面。

## IH-004 renderer seam

普通 Panel 與 Parameter Widget 透過 [View / mount contract](../16_VIEW_MOUNT_CONTRACT.md) 交付 feature-owned view；本 UI_SPEC 的結構／操作要求不變。fake surface 不是新視覺設計、DOM 實作或可及性證據。
