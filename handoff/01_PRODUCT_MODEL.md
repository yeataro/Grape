# 產品模型

## 作品與編輯

**Graph 是一份完整 Shader 作品的運行中模型；GraphDocument 是它可序列化的資料快照，不是另一個可獨立修改的模型。** Grape 的已開作品集合持有 Graph。不需要先建立一個含多張圖的 Project 才能工作。關閉最後一個 Canvas 不等於刪除、卸載或保存 Graph。

一份 Graph 有種類、名稱、穩定身分、Stages、Node/Edge、資源及精確模組引用。Legacy 的主要作品為 TOP、MAT；ISF 是既定擴充方向，完整 ISF profile／多 pass 執行尚有 Gate，不能列成首版已支援。原型的 `td.top` 名稱只代表 authoring shape；其 ES300 輸出不是 TD 原生交付保證。

| 概念 | 產品意義與關係 | 不要混淆成 |
|---|---|---|
| **Network** | 節點與線的局部容器，負責端點同域、唯一性及循環限制 | DOM canvas 或另一份 Graph |
| **Stage** | 有 shader stage 種類與要求的 Network；Graph 依 kind/profile 建立所需 Stage | 每一 Stage 一張獨立作品；Pass 的子階層 |
| **SubgraphDefinition** | Graph 內可重用的接口與 Network；call Node 引用它，同一份定義可有多個使用位置 | 每個副本新註冊的 NodeType；Library 檔案本身 |
| **Node** | Network 中有 ID/name、設定、輸入本地值與接口的實例 | 定義物件或 UI 卡片 |
| **NodeType / Definition** | 已初始化、共用的節點能力定義，含 codec、接口、參數、驗證、產碼能力；Definition 是解釋性同義詞，不另建平行 NodeDefinition 層 | Registry、Builder 或圖中 Node |
| **Port** | Node 的 input/output；穩定 key、型別、可選語意 style／connection policy | 參數控制項；可脫離 Node 的連線端點 |
| **Edge** | 同 Network 的 output→input 連線，保存端點與允許的轉換方案 | 網路 Connection；畫線 style |
| **Parameter** | 對 Node state、input local value 或明確模型欄位的編輯入口；可讀取、驗證、write | 第二份 current value；畫面滑桿本身 |
| **Resources** | Graph 擁有的 Source/default/style、型別、子圖、媒體描述等可列舉依賴 | TD OP/Par、GPU handle、連線權杖 |
| **EditorContext** | 編輯某 Graph 的 Stage／子圖使用路徑、selection/primary、可選 Binding；多 Context 可共用 Graph | Graph 副本、UI DOM、所有面板共用的全域 selection |
| **History** | Graph 已提交 Operation 的 Undo/Redo；application 可另管理 Host 操作 receipts | 更新排程、log、跨程序全能 rollback |
| **Generator / GLSL Profile** | 由不可變 Graph snapshot＋固定 definitions＋選定 GLSL profile 產生 artifacts、binding schema、診斷與 provenance；已驗入口限 GLSL shell、版本與能力支援 | 會修圖的 visitor；Host Apply；任意語言 backend 替換承諾 |
| **Persistence** | 保存／載入 GraphDocument，另保存 Layout；adapter 負責實際媒介 | Host project save；download 一定等於可確認的持久保存 |
| **Host Target** | 外部 Host 實例中的接收位置，具 identity/incarnation、能力及獨立 runtime state | Graph canonical owner；畫布目前的名字／網址 |
| **Deployment environment** | application 啟動與服務提供方式：Static Web、Node、Electron | 三套 domain model 或三份產品真值 |

輸入可以只有 Port，不提供 Parameter。連線後本地預設仍可保存，但運算使用連線來源；UI 必須顯示有效來源，不能把預設當成另一條正在輸出的值。RGB/XYZ 等 presentation 是受型別約束的呈現與語意描述，不可由換 Widget 偷改 GLSL 型別或 Edge 適配。

## 兩條參數路徑

1. **作品參數／Source default**：Widget → Parameter → Editor command 或直接 Graph API → Graph transaction → History／model notification。保存到 Graph。
2. **Host live value**：Host Widget → 指定 Binding/Target 的 inputs service → expected identity/revision 驗證 → receipt/readback → mirror。實際值由 Host 擁有；不回寫 Graph default，不因動畫改值而持續重新產碼。

要把 live value 變成作品預設，必須是明確且可查的模型編輯；不能把訂閱回報当作同一件事。

## UI 是投影與操作入口

Layout 的 split tree 葉是 **Pane**；Pane 持有 Tabs，Tab 持有 Panel instance。Panel 的種類如 Canvas、Parameter、Sources、Code、Preview，可由模組增加。浮動 Pane 使用相同 Tab/Panel 機制。Canvas/NodeView/Widget 不是 Graph 真值。

Manager 組合公開操作、管理跟隨與預設流程。它不取代 Layout 的尺寸真值、EditorContext 的 selection、Panel 的 viewState。畫面上的物理位置與責任所有權不同：tabbar 可畫在別處，仍由原 Pane/Tabs 控制。

## 幾個可觀察的不變關係

- 兩個 Canvas 看同圖：改模型彼此看得到；選取、縮放與導覽可不同。
- Graph invalid 仍可保存、重載、修復；任何當前 model Error 阻止新生成，Warning 不阻止。
- 缺模組的 Node 保留原資料與可辨識占位；不能替換同名新版假装正常。
- 一張圖不接 Host 仍可編輯、生成、保存。斷線不等於作品消失。
- 靜態 GLSL 與宿主綁定描述可交付；交付成功只表示 Host 接收了某版本，不能代替本機文件保存成功。

以上是 implementation 的工作對象。實驗上限與尚缺的原生證據見 `02_ARCHITECTURE_SPEC.md`、`10_KNOWN_GATES.md`。
