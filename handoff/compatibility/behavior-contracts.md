# Legacy Behavior Contracts

本文件是替代實作的可觀察驗收條件；不指定未來模組、transport 或 ownership。每項需同時遵守 inventory 的前置條件、失敗、保存、Undo 及 operationSpec；不能只通過 happy path 就判定完成。以下 Given/When/Then 是由證據抽出的契約，**不是宣稱本輪每一條都已執行**。

## LC-DATA-001 — MAT 與 TOP 圖的保存目標及 Stage 邊界

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-001) · Portable

### LC-DATA-001/B01

- Given: 符合 Preconditions
- When: 建立／載入／檢查圖 JSON
- Then: 合法目標有完整對應 Stage；target 不符拒絕候選，原圖不變。

- Failure oracle: schema/target/stage 組合錯誤回 blocked；不自動刪除多出的 Stage。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 檢查本身不入歷史；接受匯入才是一筆。
- UNKNOWN gates: 全域限制

## LC-DATA-002 — 匯入前唯讀檢查與明確的結果分類

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-002) · Portable

### LC-DATA-002/B01

- Given: 符合 Preconditions
- When: 送入圖 JSON 做 inspect
- Then: 原始輸入不被修改；提供 issues、repairs、candidate 或明確無候選。

- Failure oracle: 非物件、非有限 JSON、UTF-8 超過512000 bytes、節點重複 ID、循環、型別錯誤均不能以成功候選繞過。
- Persistence oracle: 檢查報告不保存進圖。
- Undo/Redo oracle: 沒有模型修改或歷史項目。
- UNKNOWN gates: 全域限制

## LC-DATA-003 — 修復只能先提案，且不能猜測未知節點連線

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-003) · Portable

### LC-DATA-003/B01

- Given: 符合 Preconditions
- When: inspect 有局部可修錯誤的圖
- Then: 回 repairable 及修改位置，接受之前原文、目前圖及歷史保持不變。

### LC-DATA-003/B02

- Given: 第一個需修座標的節點含ui.x="bad"及其他UI欄位
- When: inspect提案修復
- Then: candidate中整個ui取代為{x:48,y:96}，其它ui欄位不保留；原輸入不變，接受前圖不變。

- Failure oracle: 未知定義與重複 ID 不猜測 edge 歸屬；library snapshot 有壞線不能偷偷修；修復後仍編不過則無 candidate。
- Persistence oracle: 原始匯入檔不覆寫；修後圖需另行保存。
- Undo/Redo oracle: 提案不入歷史；接受整份候選一筆可 Undo。
- UNKNOWN gates: 全域限制

## LC-DATA-004 — 損壞保存資料保護與原文取回

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-004) · Environment-bound

### LC-DATA-004/B01

- Given: 符合 Preconditions
- When: 讀取宿主保存 envelope／打開原文檢視
- Then: 進保護狀態，停用套用與正常匯出；可取回原始文字／原始檔，重新載入重查。

- Failure oracle: state-source 回原文 hash 不符拒絕；空白呈現只是保護 UI，不能作新圖套用。
- Persistence oracle: 原保存文字保留；預覽最多12000字元，下載不截斷。
- Undo/Redo oracle: 不是圖編輯；錯誤載入不新增 Undo。
- UNKNOWN gates: 全域限制

## LC-DATA-005 — 下載目前整份圖的 JSON

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-005) · Portable

### LC-DATA-005/B01

- Given: 符合 Preconditions
- When: Export 對話框 Download JSON
- Then: 得到 Grape-MAT.json 或 Grape-TOP.json 的當前草稿快照。

- Failure oracle: savedStateIssue 或 exportBusy 不執行；Blob／序列化出錯顯示 export.failed。
- Persistence oracle: 新建下載檔；不代表已套用宿主或保存 TOE。
- Undo/Redo oracle: 無圖修改，不入歷史。
- UNKNOWN gates: 全域限制

## LC-DATA-006 — 以畫布圖像攜帶完整可再匯入的圖

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-006) · Environment-bound

### LC-DATA-006/B01

- Given: 符合 Preconditions
- When: Export PNG 預覽後下載
- Then: 圖片可供閱讀，也能以本產品再次匯入完整圖；檔名含target/stage。

- Failure oracle: 未取得節點排版、canvas編碼失败會報錯；取消／重新開啟使較早非同步結果失效。
- Persistence oracle: 下載PNG保存圖快照；原圖不變。
- Undo/Redo oracle: 不入歷史。
- UNKNOWN gates: LU-DATA-002

## LC-DATA-007 — PNG 圖資料讀取與惡意／損毀封裝拒絕

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-007) · Portable

### LC-DATA-007/B01

- Given: 符合 Preconditions
- When: 選取.png或含PNG簽名檔
- Then: 合法PNG取得graph供review；不解壓圖片／壓縮文字以尋找圖。

- Failure oracle: 檔>16MiB、metadata>512000+8192bytes、graph>512000bytes、>65536chunks、重複ownedmetadata、壓縮tEXt/zTXt/iTXt及尾隨資料被拒。
- Persistence oracle: 原PNG不修改。
- Undo/Redo oracle: 解讀不入歷史。
- UNKNOWN gates: LU-DATA-002

## LC-DATA-008 — 匯入檢閱、取消及原檔下載

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-008) · Environment-bound

### LC-DATA-008/B01

- Given: 符合 Preconditions
- When: 選JSON／PNG，檢閱或取消
- Then: 檢閱前後目前圖／Undo不變；取消後遲到的請求也不能重新開啟檢閱。

- Failure oracle: 不合法JSON／newer／blocked沒有Accept；read-only不可接受。
- Persistence oracle: 原檔保持；候選僅暫存於對話框。
- Undo/Redo oracle: 檢阅不入歷史。
- UNKNOWN gates: LU-DATA-001

## LC-DATA-009 — 接受匯入是一筆替換且防止檢閱期間覆寫新編輯

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-009) · Portable

### LC-DATA-009/B01

- Given: 符合 Preconditions
- When: Accept import
- Then: 只接受仍對應当前基準的候選；一筆Undo還原匯入前所有圖內容。

- Failure oracle: review期間任何圖變動或切target會拒絕並要求重新檢閱，不能覆蓋新草稿。
- Persistence oracle: 成為未套用草稿；需成功apply才保存宿主狀態。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: LU-DATA-001

## LC-DATA-010 — 匯入圖保留目前活的原生來源身份

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-010) · Environment-bound

### LC-DATA-010/B01

- Given: 符合 Preconditions
- When: 接受JSON／PNG替換時存在原生來源
- Then: 匯入不把現有原生參數驅動／來源当作可任意丟弃的圖資料。

- Failure oracle: 原生snapshot未ready或revision不符、kind不符、ID/name交叉衝突、名稱歧義拒絕；不猜測。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-011 — 節點版本／行為升級先比較快照

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-011) · Portable

### LC-DATA-011/B01

- Given: 符合 Preconditions
- When: Inspect upgrade
- Then: 可檢視change清單及localizedFunctions；未接受不改來源圖。

- Failure oracle: 未知definition無替代則blocked；snapshot損壞或升級會需要修掉edge時blocked，保留原連線。
- Persistence oracle: 候選加當前catalogSnapshot；舊圖不覆写。
- Undo/Redo oracle: 檢閱不入歷史。
- UNKNOWN gates: 全域限制

## LC-DATA-012 — 確認升級必須仍對應檢閱快照與宿主revision

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-012) · Environment-bound

### LC-DATA-012/B01

- Given: 符合 Preconditions
- When: Accept upgrade
- Then: 清upgradePending與草稿、Home並加入可Undo歷史；原生token關聯保存。

- Failure oracle: 請求失敗使token失效；請求飛行中若本地草稿被callback改了，不覆盖草稿，標dirty/conflicted；stale load結果忽略。
- Persistence oracle: 成功套用後保存新圖；備份與原生回滾由host能力記錄。
- Undo/Redo oracle: 成功升級一筆nativeApplied圖歷史；未成功不虛構成功歷史。
- UNKNOWN gates: 全域限制

## LC-DATA-013 — 嵌入的歷史 archive 只保留不執行

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-013) · Portable

### LC-DATA-013/B01

- Given: 符合 Preconditions
- When: 載入帶archive的合法圖
- Then: archive內容保留而不改當前Shader結果。

- Failure oracle: archive不是修復非法現行圖的替代；現行圖仍須通過驗證。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 僅作圖的一部分跟隨整圖undo，沒有archive執行操作。
- UNKNOWN gates: 全域限制

## LC-DATA-014 — 建立具型別及唯一名稱的圖來源

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-014) · Portable

### LC-DATA-014/B01

- Given: 符合 Preconditions
- When: Sources分組＋New，提交name/kind/type
- Then: 来源出现在对应组并被选中、显示其参数；各引用节点以ID指向同份来源。

- Failure oracle: 名稱須字母開頭A-Za-z0-9_、最多48字、不能gl_/TD/sg_/sTD前綴或重名；array須有效整數length及path，POP需POP/attribute。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-015 — 圖常數可編輯純量／分量／矩陣並被多處引用

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-015) · Portable

### LC-DATA-015/B01

- Given: 符合 Preconditions
- When: 來源卡或constant parameter修改value
- Then: 所有同ID引用讀到同值；numeric family控制輸入，matrix按column-major保存。

- Failure oracle: 過期generation、刪除／missing／type已改不寫回；Constants不能initialDriver或expose。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-016 — Uniform 的圖內預設值與宿主目前值分開

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-016) · Environment-bound

### LC-DATA-016/B01

- Given: 符合 Preconditions
- When: 建立Uniform或修改Default
- Then: 圖存預設，原生值由宿主提供；Default不是連續覆寫使用者目前原生值的命令。

- Failure oracle: array/samplerBuffer無一般numeric default；已有matrix/vector原生sequence會限制跨形狀切換。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: LU-DATA-003

## LC-DATA-017 — MAT 2D貼圖來源與預設／公開參數

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-017) · Environment-bound

### LC-DATA-017/B01

- Given: 符合 Preconditions
- When: 新增Sampler、選default、選external path、Expose
- Then: 圖保存source/default及公開設定，引用不額外製造独立來源。

- Failure oracle: 非sampler2D、非內建或絕對路徑、不合法公開label拒絕；新TOP圖不接受sampler聲明。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-018 — TOP 輸入槽具有固定身份、預設圖與公開標籤

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-018) · Environment-bound

### LC-DATA-018/B01

- Given: 符合 Preconditions
- When: 新增TOP Input、設定default/label/expose
- Then: 多次引用同ID仍是一個外部輸入槽；看得到實際connected/path/width/height。

- Failure oracle: 只能2D資源；label<=48且無控制字元；達16槽不能新增。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: LU-DATA-003

## LC-DATA-019 — TOP 槽排序不更換引用，刪除有安全條件

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-019) · Environment-bound

### LC-DATA-019/B01

- Given: 符合 Preconditions
- When: 槽參數上移／下移／Remove
- Then: 合法排序更新呈現與編譯index；可刪除到零槽。

- Failure oracle: 首尾排序禁用；有引用／alias／external wire時Remove禁用并說明。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: LU-DATA-003

## LC-DATA-020 — 來源可直接選取、拖入或增加引用

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-020) · Portable

### LC-DATA-020/B01

- Given: 來源卡存在
- When: 點選來源卡
- Then: 只改選取與參數顯示，不增節點、不入Undo。

### LC-DATA-020/B02

- Given: 來源可在目前Stage引用
- When: ＋或拖入畫布
- Then: 新增指向同一聲明的引用節點，一筆可Undo圖編輯。

- Failure oracle: missing source不可引用；Attribute只允許MAT Vertex；read-only/blocked拒絕。
- Persistence oracle: 點選不寫graph；新增引用寫graph並成為session draft，成功apply後才保存宿主圖。
- Undo/Redo oracle: 點選不入Undo；新增引用由change包成一次圖編輯，可Undo/Redo新增節點。
- UNKNOWN gates: 全域限制

## LC-DATA-021 — 來源更名保持ID引用與名稱唯一

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-021) · Environment-bound

### LC-DATA-021/B01

- Given: 符合 Preconditions
- When: Source inspector Name 修改
- Then: 來源身份及節點引用不變；所有名稱呈現更新。

- Failure oracle: invalidName恢復顯示；原生名字不可寫／snapshot不ready禁止寫；stale expected拒絕。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: LU-DATA-003

## LC-DATA-022 — 刪除被引用的本地來源留下 Missing 標記，可恢復

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-022) · Portable

### LC-DATA-022/B01

- Given: 符合 Preconditions
- When: 來源Remove／Restore並確認
- Then: 失踪來源不使節點無聲消失，後續不能再次引用missing；可按Restore保留原ID恢復。

- Failure oracle: 對話框等待期間圖generation、reference count或原生來源狀態變了則放棄／報changed。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-023 — 常用時間等來源按身份重用，不重置使用者driver

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-023) · Environment-bound

### LC-DATA-023/B01

- Given: 符合 Preconditions
- When: Common Sources新增／引用
- Then: 同一常用來源多次放入只多引用；改名的唯一來源仍可重用，原生driver不被重新初始化。

- Failure oracle: 相同預設名被別kind/type佔用，或多個同recipe改名來源造成歧義，顯示conflict、不猜測。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: LU-DATA-003

## LC-DATA-024 — Sources搜尋與TD/common名稱呈現

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-024) · Portable

### LC-DATA-024/B01

- Given: 符合 Preconditions
- When: Sources search／name mode
- Then: 符合內容顯示、分類展開；切名稱不重置live編輯焦點/選取/歷史。

- Failure oracle: 無結果顯示empty；無效name mode忽略。
- Persistence oracle: TD/common偏好localStorage sgrapeSourceNamesV1；查詢不存圖。
- Undo/Redo oracle: 顯示操作無圖Undo。
- UNKNOWN gates: 全域限制

## LC-DATA-025 — Sources分組折疊、拖排、精簡及說明偏好

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-025) · Portable

### LC-DATA-025/B01

- Given: 符合 Preconditions
- When: 折疊標題／拖排序／Minimal／Notes
- Then: 分類順序不因搜尋或切Stage暫時缺項被覆寫；可讀取舊array格式折疊偏好。

- Failure oracle: 拖動<5px當點擊；Escape/cancel/blur/切Stage/圖generation變化取消拖動；storage異常不阻斷使用。
- Persistence oracle: localStorage: sgrapeInputCollapsedGroups、grapeSourceGroupOrder、grapeSourceMinimal、grapeSourceNotes；個別卡片展開暫存Map不屬圖。
- Undo/Redo oracle: 無圖Undo。
- UNKNOWN gates: 全域限制

## LC-DATA-026 — 來源反查目前畫布引用及其他Stage位置

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-026) · Portable

### LC-DATA-026/B01

- Given: 符合 Preconditions
- When: 來源⋯→Select references 或 Locations
- Then: 可從共享來源找使用點；無當前引用時選取命令停用。

- Failure oracle: 缺ID／節點已消失無操作；Locations並未提供所有nested引用的逐層導航。
- Persistence oracle: 選取／導航不改圖。
- Undo/Redo oracle: 不入圖歷史。
- UNKNOWN gates: 全域限制

## LC-DATA-027 — 建立預設可通過 vec4 的本地子圖

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-027) · Portable

### LC-DATA-027/B01

- Given: 符合 Preconditions
- When: New Subgraph
- Then: 新call指向可進入編輯的單份定義，不是把另一張完整Shader當子圖。

- Failure oracle: 當下前端檢查（例如64份functions、型別／常數）失敗由change回復；newFunction本身沒有完整network節點數驗證，後續inspect／apply編譯才檢查完整容量，不能保證新增當下同步拒絕所有非法圖。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-028 — 內建／個人庫加入圖時攜帶依賴並按版本重用

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-028) · Portable

### LC-DATA-028/B01

- Given: 符合 Preconditions
- When: 新增library/personal subgraph call
- Then: 圖不依賴即時讀取library檔維持既有snapshot；多個call共享圖內同一份definition。

- Failure oracle: 缺dependency、capacity>64、同ID不同customtype內容或循環拒絕；不靜默覆蓋。 Personal符號array extent反例：packet有效不保證entry可編譯。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: LU-DATA-005, LU-DATA-007

## LC-DATA-029 — 首次語意編輯把外部snapshot轉為圖內共用local副本

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-029) · Portable

### LC-DATA-029/B01

- Given: 符合 Preconditions
- When: 進入source subgraph修改內容或改名
- Then: 同一Shader內所有原本指向該definition的call一起改用同份local版本；其他Shader／庫原件不變。

- Failure oracle: 容量不足或缺reference失敗；source原件不直接寫回個人庫。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-030 — Make Independent 只分離選定call的直接定義

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-030) · Portable

### LC-DATA-030/B01

- Given: 符合 Preconditions
- When: 選subgraph call→Make Independent
- Then: 選定call的直接子圖編輯與其他call分離。

- Failure oracle: 找不到定義／容量不足拒絕；不是遞迴deep-independent全部依賴。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-031 — 將選取計算節點封成子圖並保留跨界連線

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-031) · Portable

### LC-DATA-031/B01

- Given: 符合 Preconditions
- When: 選nodes→Group as Subgraph
- Then: 生成call与boundary接線，移動內部節點相對座標，完整選取frames搬入，外部接線仍有路徑。

- Failure oracle: 沒有可封裝節點不操作；functions>64或前端型別／常數檢查失敗回復。groupSelection沒有16接口數檢查，可先形成超限草稿；完整接口／節點／循環合法性由後續inspect／apply編譯拒絕。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-032 — 子圖接口可改顯示名稱／default但保持portID

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-032) · Portable

### LC-DATA-032/B01

- Given: 符合 Preconditions
- When: 編輯Subgraph Input/Output參數
- Then: 所有共用call呈現最新接口名稱與default；個別call覆寫inputValue可保持独立。

- Failure oracle: 資源接口default為null且无numeric編輯；composite只顯示型別，不把它當普通vector控件。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-033 — 子圖接口更改型別及全圖call值轉換

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-033) · Portable

### LC-DATA-033/B01

- Given: 符合 Preconditions
- When: Boundary Settings改Type
- Then: 每個call的同一接口保持ID而重算型別；圖的型別變更檢查處理線相容性。

- Failure oracle: 無效type不能建立；不相容線的處理由通用type-change流程記錄（見UI/node能力），不宣稱自動數值無損。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-034 — 子圖接口重排及刪除會一致更新所有call

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-034) · Portable

### LC-DATA-034/B01

- Given: 符合 Preconditions
- When: Boundary Settings Add/Move/Remove Port
- Then: 重排不斷線；刪除不留對不存在port的正常連線，一次Undo恢复接口與相關線。

- Failure oracle: 首尾Move禁用，>=16 Add禁用；只read-only時無可寫操作。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-035 — 拖線到空白接口可一次新增port與連線

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-035) · Portable

### LC-DATA-035/B01

- Given: 符合 Preconditions
- When: 將合法wire拖到spare socket
- Then: 對應接口列表及call呈現增加一個port，連線完成；沒有先產生孤立port的半次undo。

- Failure oracle: 兩個spare相接、非法方向、不可用type、stage payload禁用或>=16拒絕。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-036 — 巢狀導航、breadcrumb與循環阻止

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-036) · Portable

### LC-DATA-036/B01

- Given: 符合 Preconditions
- When: Enter Subgraph／breadcrumb／Up
- Then: 現在畫布換成對應子圖而圖身份不變。

- Failure oracle: function不存在不進入；遞迴trail顯示cycle；存檔編譯另檢整份subgraph cycle，即使沒被使用也拒絕。
- Persistence oracle: breadcrumb/session視角不是子圖definition語意；圖definition持續保留。
- Undo/Redo oracle: 不加入圖歷史。
- UNKNOWN gates: 全域限制

## LC-DATA-037 — 子圖名稱與scope資訊

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-037) · Portable

### LC-DATA-037/B01

- Given: 符合 Preconditions
- When: Subgraph Name修改、Escape取消
- Then: 共用同definition的call標題一起更新，node獨立name仍是另一欄位。

- Failure oracle: 非法名拒絕並恢復原顯示；同名則no-op；外部name修改先localize。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-038 — 輸出可獨立再用的子圖依賴快照

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-038) · Portable

### LC-DATA-038/B01

- Given: 符合 Preconditions
- When: Save to Personal Library
- Then: td-sgrape-function v1 packet完整自包含，重複build得到相同contentHash。

### LC-DATA-038/B02

- Given: 合法MAT圖的Make子圖以自身int input決定輸出array長度，array extent編碼帶原function作用域
- When: Save to Personal Library，build將function重編為fn0
- Then: 現行build拋Unsupported Subgraph port type，不能宣稱已成功保存；原圖不變。

- Failure oracle: missing dependency、cycle、unknownnode、任一承諾stage無法compile或packet>256000 bytes拒絕。 已能compile的子圖若output array extent引用自身function input，Personal build重編function ID後可因scope未同步重映射而拋Unsupported Subgraph port type；不能把JS交換入口的能力套用到Personal。
- Persistence oracle: 產生独立packet而非修改library來源。
- Undo/Redo oracle: build不入圖Undo；檔案保存也不由圖Undo刪檔。
- UNKNOWN gates: LU-DATA-005, LU-DATA-007

## LC-DATA-039 — 個人子圖拒絕外部聲明但允許特定內建依賴

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-039) · Environment-bound

### LC-DATA-039/B01

- Given: 符合 Preconditions
- When: Save self-contained validation
- Then: 失敗説明must be self-contained且未寫入新檔；合法例外仍保留TD相依性。

- Failure oracle: 不會為打包而自動創Uniform／capture宿主值。
- Persistence oracle: 拒絕時沒有packet檔；成功的例外保留其target/stage限制。
- Undo/Redo oracle: 無圖修改。
- UNKNOWN gates: LU-DATA-003, LU-DATA-005

## LC-DATA-040 — 讀取個人庫時逐檔隔離錯誤與限額

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-040) · Environment-bound

### LC-DATA-040/B01

- Given: 符合 Preconditions
- When: Refresh Personal Library／host讀取folder
- Then: items与issues同時回傳，部分成功顯示partial；等contentHash只列一次。

- Failure oracle: 不是folder、任何symlink（即使沒有逃出folder）、resolved parent不同或非法packet拒絕；超限提issue而非無限讀。
- Persistence oracle: read不建立缺folder、不改任何檔。
- Undo/Redo oracle: Refresh不是圖編輯。
- UNKNOWN gates: 全域限制

## LC-DATA-041 — 可讀檔名及不覆寫既有使用者檔案

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-041) · Environment-bound

### LC-DATA-041/B01

- Given: 符合 Preconditions
- When: Save Personal Subgraph
- Then: 檔名無UUID/contenthash；原display name保存在packet；case-insensitive衝突也不覆寫。

- Failure oracle: 原子publish失敗顯示錯誤並清temp；并行writer佔名則重選；existing samecontent即使改檔名或滿64檔可reuse。
- Persistence oracle: 只新建快照，不原地更新同名檔；identity由內容非檔名決定。
- Undo/Redo oracle: 沒有圖Undo刪除已保存檔。
- UNKNOWN gates: 全域限制

## LC-DATA-042 — 快照checksum與format版本驗證

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-042) · Portable

### LC-DATA-042/B01

- Given: 符合 Preconditions
- When: 讀取／匯入personal packet
- Then: 相同內容以同版本識別，modified JSON數值型態改變會被checksum偵測。

- Failure oracle: 未知format、extra不許欄位、hash不符或無hash拒絕，原檔保留。
- Persistence oracle: checksum在packet內；不是簽名／trust認證。
- Undo/Redo oracle: 驗證不入歷史。
- UNKNOWN gates: LU-DATA-005, LU-DATA-007

## LC-DATA-043 — 複製選取含內部線及所需來源／子圖／型別

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-043) · Portable

### LC-DATA-043/B01

- Given: 符合 Preconditions
- When: Copy selected nodes
- Then: 貼到別圖所需依賴可用；跨選取邊界的線不偷偷指向原圖。

- Failure oracle: 空選取／boundary等不可paste內容及payload>512000受限制；code/ui字符串不是引用，不盲目重寫。
- Persistence oracle: 剪貼payload含圖資料，不含連線驗證碼；OS clipboard權限行為另見UI。
- Undo/Redo oracle: Copy不變圖不入歷史。
- UNKNOWN gates: 全域限制

## LC-DATA-044 — 同一Shader貼上重用共享來源與子圖

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-044) · Portable

### LC-DATA-044/B01

- Given: 符合 Preconditions
- When: 在原Shader貼上已複製nodes
- Then: 兩組source refs仍對同ID；多個subgraph calls仍共享definition。

- Failure oracle: 不能藉paste覆寫existing source；paste後每input仍只能一條edge，boundaries不可重建。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-045 — 跨Shader貼上建立獨立聲明並重映射全部引用

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-045) · Portable

### LC-DATA-045/B01

- Given: 符合 Preconditions
- When: 將selection貼入另一Shader
- Then: 不意外綁到同名來源；spec constantId用最小空位；customtype closure隨行。

- Failure oracle: 同customtypeID異內容衝突拒絕；缺dep、非法type、目標不支持的source拒絕。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-046 — 貼上失敗必須整筆回復，不留半份依賴

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-046) · Portable

### LC-DATA-046/B01

- Given: 符合 Preconditions
- When: Paste錯誤或自我子圖遞迴payload
- Then: 報錯且原圖、selection依編輯交易回復；不能留下先插入的declaration/function。

- Failure oracle: 模型貼入過程可能先寫暫態資料，只有外層編輯交易保證rollback；直接呼叫内部helper不等於產品成功操作。
- Persistence oracle: 拒絕不保存部分結果，不新增成功草稿寫入；原先session draft保持。
- Undo/Redo oracle: 失敗不新增成功history；Undo/Redo集合保持失敗前狀態。
- UNKNOWN gates: LU-DATA-001

## LC-DATA-047 — 複合型別及符號陣列長度隨複製／封裝保持語意

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-047) · Portable

### LC-DATA-047/B01

- Given: JS交換入口支援的合法複合型別及符號長度
- When: JS Copy/Paste、Group、Localize、Independent；不包含Python Personal export。
- Then: 新的圖引用自己的正確來源，不把舊scope/ID留在array長度。

- Failure oracle: 同ID異內容、缺length來源、循環／自我reference及不合法runtime長度拒絕。
- Persistence oracle: Copy保留在clipboard資料；其餘成功編輯將scope/引用更新寫graph及session draft，apply後保存宿主图；原來源不被重新命名。
- Undo/Redo oracle: Copy只寫剪貼包，不改圖也不入Undo；成功Paste/Group/Localize/Independent由所在編輯操作形成history；失敗回復。Personal export不屬此能力且不入圖Undo。
- UNKNOWN gates: LU-DATA-007

## LC-DATA-048 — 新增圖內自訂Structure及有限型別fields

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-048) · Portable

### LC-DATA-048/B01

- Given: 符合 Preconditions
- When: Sources Structures→New／Edit
- Then: 新struct出現在可引用type與新增節點選單，field names/types可供建構和取欄位。

- Failure oracle: 遞迴type、depth>16、resourcefield、symboliclength arrayfield拒絕；arrayfield必須固定數字長度。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-049 — Structure編輯使用草稿並拒絕過時提交

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-049) · Portable

### LC-DATA-049/B01

- Given: 符合 Preconditions
- When: Structure dialog Save／Cancel
- Then: 成功一次性替換definition；改name保留ID與既有field identity。

- Failure oracle: 等待期間同定義或圖已換則拒絕；不能以舊dialog覆蓋新狀態。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-050 — Structure形狀變更保留不相容線作診斷

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-050) · Portable

### LC-DATA-050/B01

- Given: 符合 Preconditions
- When: 編輯已被引用Structure type
- Then: 不相容既有線仍在圖，讓錯誤可見而非靜默丟失；用Undo可還原definition/values。

- Failure oracle: 新definition本身不合法直接拒；使用端錯誤可留下待修，不能當可編譯成功。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-051 — Structure引用與使用中刪除阻擋

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-051) · Portable

### LC-DATA-051/B01

- Given: 圖內已有structure
- When: Help／選取
- Then: 显示說明或選取狀態；不改圖、不入Undo。

### LC-DATA-051/B02

- Given: 結構可引用
- When: Reference
- Then: 新增struct_create節點，一筆可Undo。

### LC-DATA-051/B03

- Given: 結構尚無任何直接／間接使用
- When: 確認Remove且等待期間stamp不變
- Then: 刪除type definition，一筆可Undo；已使用或等待期間變更時拒絕。

- Failure oracle: 確認等待中generation/stamp/usage變了則取消刪除。
- Persistence oracle: Help、選取及fold為UI暫態；Reference與Remove變更graph，成功apply後保存宿主圖。
- Undo/Redo oracle: Help、選取及fold不入圖Undo；Reference及Remove各自一筆圖編輯，Undo還原節點／type definition。
- UNKNOWN gates: 全域限制

## LC-DATA-052 — 舊合併Texture節點可拆為來源加Texture2D

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-052) · Portable

### LC-DATA-052/B01

- Given: 符合 Preconditions
- When: Split legacy Texture
- Then: 采样结果接線保留，声明引用移到source node；MAT fallback設定opaque-black。

- Failure oracle: 找不到legacy sampler声明報錯，整筆回復；非Texture節點no-op。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-053 — 舊TOP source format需要review遷移到有序槽

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-053) · Environment-bound

### LC-DATA-053/B01

- Given: 符合 Preconditions
- When: 升級舊TOP圖
- Then: 候選採topInputs穩定ID，不再將舊sampler當新TOP宣告；接受前不改原圖。

- Failure oracle: 仍不能compile或會損線升級blocked；原資料不被自動重存。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: LU-DATA-003

## LC-DATA-054 — 序列化保留視覺資料但與Shader語意分開

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-054) · Portable

### LC-DATA-054/B01

- Given: 符合 Preconditions
- When: 移動／命名／保存／比較是否需編譯
- Then: 保存仍保留編輯外觀，純ui欄位不參與此語意比較；一般node.name仍會改此比較鍵。

- Failure oracle: 非法視覺資料可在inspect提出repair；不能把clean_semantic輸出當完整使用者圖覆蓋保存。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-055 — 來源預設暴露名稱從節點標籤初始化一次

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-055) · Environment-bound

### LC-DATA-055/B01

- Given: 符合 Preconditions
- When: 在有label的source node勾Expose
- Then: 公開控制的初始名稱可與使用者語意一致，不必改GLSL來源name。

- Failure oracle: 沒有label則保持既有fallback名稱；exposeName已有值不覆蓋。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: LU-DATA-003

## LC-DATA-056 — 圖內容容量與數字合法性按入口驗證

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-056) · Portable

### LC-DATA-056/B01

- Given: 符合 Preconditions
- When: 匯入／貼上／compile超限或非法數字
- Then: 明確拒絕過量／非JSON數值，不截斷成貌似成功的圖。

- Failure oracle: inspect先算UTF8 bytes，再呼叫compile；compiler部分算json.dumps預設轉義後的字元長度，故檔案未達512000 bytes也可能被compile拒絕。實測CJK註記259645 bytes但517645轉義字元、非BMP181645 bytes但541645轉義字元皆回Graph exceeds 512 KB；ASCII87645則成功。host/paste所有入口界線尚未完整實測。
- Persistence oracle: 非法資料可保留原raw供下載，但不是valid圖。
- Undo/Redo oracle: 拒絕不創成功歷史。
- UNKNOWN gates: LU-DATA-004

## LC-DATA-057 — 複製來源recipe不等於共用原生來源identity

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-057) · Environment-bound

### LC-DATA-057/B01

- Given: 符合 Preconditions
- When: 複製帶preset source至另一Shader或另建copy
- Then: copy得到不同sourceID/name；common drawer仍明確辨認原或報衝突。

- Failure oracle: 同recipe改名來源多於一個且無exactname時conflict，不以第一個猜測。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: LU-DATA-003

## LC-DATA-058 — 直接來源禁止封入子圖不等於舊圖無法載入

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-058) · Portable

### LC-DATA-058/B01

- Given: 符合 Preconditions
- When: 封裝選取、載入舊子圖、保存personal
- Then: 對不同入口保持各自限制與錯誤，讓使用者能知道何時需將來源移到接口。

- Failure oracle: 無法自包含personal時reject；不能為了輸出任意擷取host目前值。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-059 — 合法保存envelope revision有界且不得靜默修復

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-059) · Portable

### LC-DATA-059/B01

- Given: 符合 Preconditions
- When: inspect_saved_state／state-source
- Then: 坏保存狀態走保護流程；revision不可失去精度後當作成功加载。

- Failure oracle: duplicate JSON keys、NaN/Infinity、原文非str、oversize回error並保留原文。
- Persistence oracle: revision跟graph在宿主envelope，不是使用者node值。
- Undo/Redo oracle: inspect不入歷史。
- UNKNOWN gates: 全域限制

## LC-DATA-060 — 把目前圖匯出至宿主專案資料夾

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-060) · Environment-bound

### LC-DATA-060/B01

- Given: 符合 Preconditions
- When: Export to project／POST /api/export graph
- Then: 回saved=true及實際檔案path，既有檔案不當作唯一固定名稱覆寫。

- Failure oracle: 不是object或UTF8>512000bytes拒絕；磁碟I/O錯誤回報；此endpoint不是完整compiler驗證的替代。
- Persistence oracle: 新建外部JSON檔；不是保存整個TOE。
- Undo/Redo oracle: 檔案輸出不入圖Undo，Undo不會刪下載／匯出檔。
- UNKNOWN gates: 全域限制

## LC-DATA-061 — 標題列Save呼叫宿主保存，未套用草稿不因此套用

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-061) · Environment-bound

### LC-DATA-061/B01

- Given: 符合 Preconditions
- When: 標題列Save／經通用請求授權的POST /api/save
- Then: 由TD執行當前整個project的保存並回saved結果；不是只保存此圖。

- Failure oracle: 未通過通用token/LAN守門則不執行；宿主save異常依通用error回報。
- Persistence oracle: 宿主project保存副作用；檔名及TDnumbered-save環境取決於原生設定。
- Undo/Redo oracle: 不由圖Undo撤銷磁碟保存。
- UNKNOWN gates: LU-DATA-006

## LC-DATA-062 — 跨圖來源剪貼的接受範圍比一般圖格式窄

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-062) · Portable

### LC-DATA-062/B01

- Given: 符合 Preconditions
- When: 將有複合constant、長CHOP path或特殊symbolic array type的selection跨Shader貼上
- Then: 不能假定可合法載入／編譯的所有source都一定可跨圖clipboard；此分支可回clipboard.invalid而保留原圖。

- Failure oracle: 原生array類型此處只接受float/vec2/3/4加literal或sg_len_...；不接受任意其它expression length token。sampler來源path也有2048界線。
- Persistence oracle: 結果存入圖 JSON；接受並成功套用後隨宿主保存的圖保留，未套用只屬本地草稿。
- Undo/Redo oracle: 透過編輯器 change/changeDeclaration 形成一次圖編輯；Undo 還原之前的圖，Redo 重做；已套用宿主後受原生歷史有效性檢查限制。
- UNKNOWN gates: 全域限制

## LC-DATA-063 — 既有來源引用節點可切換指向另一份來源

[詳細規格](LEGACY_CAPABILITIES.md#lc-data-063) · Portable

### LC-DATA-063/B01

- Given: 符合 Preconditions
- When: 來源引用node主選單／Settings來源選單
- Then: nodeID與位置保持，改為引用選中來源，下游型別經一般change重推導；來源聲明及live值本身不修改。

- Failure oracle: readonly不可改；一般change前端檢查失敗回前圖；不因找不到來源自動新建。Settings有空值選項不等於產码一定接受空引用，完整合法性仍由後續驗證判斷。
- Persistence oracle: 新引用ID寫graph/session draft，成功apply後保存宿主圖。
- Undo/Redo oracle: 成功改引用是一筆圖Undo/Redo，失敗不創成功history。
- UNKNOWN gates: 全域限制

## LC-NODE-001 — Router [router]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-001) · Portable

### LC-NODE-001/B01

- Given: 合法 router 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 連線中繼並沿來源推導型別，GLSL 直接使用來源運算式，不新增計算。

### LC-NODE-001/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：未接來源而被需要時報 Connect a source to Router；數值、矩陣、陣列、結構與 opaque resource 都可直通。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-002 — Math [math]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-002) · Portable

### LC-NODE-002/B01

- Given: 合法 math 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 从 Input 0 開始，按 steps 的順序左結合 +、−、×、÷；shared 對每個後續輸入套同一運算；不採一般乘除優先序。

### LC-NODE-002/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：inputCount 2–32，預設 3；mode steps/shared，預設 steps；每 step operator add/subtract/multiply/divide 且 input 0..count−1，可重複引用。矩陣只容許每步保持相同形狀；無除零保護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-003 — Switch [switch]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-003) · Portable

### LC-NODE-003/B01

- Given: 合法 switch 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 用 GLSL switch(index) 選取 Case n；不存在的 index（含負數）返回 Default。所有分支上游仍求值。

### LC-NODE-003/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：caseCount 0–16，預設 1；index 僅 int、各 Case 與 Default 的最終型別必須完全相同。Default 連線在編輯器決定型別；不接受陣列、結構、資源。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-004 — Scalar [scalar]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-004) · Portable

### LC-NODE-004/B01

- Given: 合法 scalar 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以選定 float/int/uint/bool/double 型別輸出單一常數。

### LC-NODE-004/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：value 必須符合數值族；fixedType 存在時不可換型別。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-005 — Convert [convert]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-005) · Portable

### LC-NODE-005/B01

- Given: 合法 convert 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 用目標 scalar/vector 的單參數 GLSL constructor 顯式轉換；純量 splat、多分量可截短，矩陣依 column-major 供應分量。

### LC-NODE-005/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：無不足分量補值；可用配對逐一列於 type contract 的 convert.pairs；不放寬一般連線。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-006 — Matrix Convert [matrix_convert]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-006) · Portable

### LC-NODE-006/B01

- Given: 合法 matrix_convert 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 用目標矩陣 constructor：純量填對角，其餘零；矩陣按座標調整尺寸並以 identity 補齊；足夠分量依 column-major。

### LC-NODE-006/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：輸出限定 float/double 矩陣；所有可用 from/to 配對附錄逐一列出。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-007 — Compare [compare]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-007) · Portable

### LC-NODE-007/B01

- Given: 合法 compare 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 >、>=、<、<=、==、!= 比較兩個純量，回傳 bool。

### LC-NODE-007/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：type 只 float/int/uint；預設 >；向量、bool、double 不在本節點比較介面內。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-008 — If [if]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-008) · Portable

### LC-NODE-008/B01

- Given: 合法 if 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以純量 bool condition 回傳 true 或 false 值，生成 ?:；上游兩支仍計算，不作死支刪除。

### LC-NODE-008/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：所有 38 種 scalar/vector/matrix 值型別；true 預設 1、false 0，矩陣 true 是 identity（含長方形），false 為零矩陣；不接受數字 condition。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-009 — Comment [comment]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-009) · Portable

### LC-NODE-009/B01

- Given: 合法 comment 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 保存畫布文字註解，不產生計算與 shader bindings。

### LC-NODE-009/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：ui.comment 最多 2000 字且禁止控制字元；其 UI 操作由 UI 盤點負責。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-010 — Generated GLSL [generated_glsl]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-010) · Portable

### LC-NODE-010/B01

- Given: 合法 generated_glsl 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 畫布內顯示產出的 GLSL，自己沒有輸入輸出與 shader 計算。

### LC-NODE-010/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：每畫布最多一個，重複存在編譯驗證報錯；顯示/選取/行號互動屬 UI 盤點。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-011 — Float [float]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-011) · Portable

### LC-NODE-011/B01

- Given: 合法 float 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 輸出固定 float literal；保存 value 控制所有分量。

### LC-NODE-011/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：固定型別，不因 downstream 或 value 長度隱式改型；所有初始數值列於 operationSpec.defaultParameters。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-012 — Vector 2 [vec2]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-012) · Portable

### LC-NODE-012/B01

- Given: 合法 vec2 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 輸出固定 vec2 literal；保存 value 控制所有分量。

### LC-NODE-012/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：固定型別，不因 downstream 或 value 長度隱式改型；所有初始數值列於 operationSpec.defaultParameters。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-013 — Vector 3 [vec3]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-013) · Portable

### LC-NODE-013/B01

- Given: 合法 vec3 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 輸出固定 vec3 literal；保存 value 控制所有分量。

### LC-NODE-013/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：固定型別，不因 downstream 或 value 長度隱式改型；所有初始數值列於 operationSpec.defaultParameters。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-014 — Color RGBA [color]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-014) · Portable

### LC-NODE-014/B01

- Given: 合法 color 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 輸出固定 vec4 literal；保存 value 控制所有分量。

### LC-NODE-014/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：固定型別，不因 downstream 或 value 長度隱式改型；所有初始數值列於 operationSpec.defaultParameters。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-015 — Add [add]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-015) · Portable

### LC-NODE-015/B01

- Given: 合法 add 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按宣告介面計算 a+b。

### LC-NODE-015/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援的族、形狀、各operand型別列於 variants；不增加零除、NaN、singular/zero-length 等 domain 防護。矩陣依列出的合法線性代數維度；純量直接乘除矩陣而非轉成對角矩陣。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-016 — Multiply [multiply]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-016) · Portable

### LC-NODE-016/B01

- Given: 合法 multiply 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按宣告介面計算 a*b。

### LC-NODE-016/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援的族、形狀、各operand型別列於 variants；不增加零除、NaN、singular/zero-length 等 domain 防護。矩陣依列出的合法線性代數維度；純量直接乘除矩陣而非轉成對角矩陣。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-017 — Mix [mix]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-017) · Portable

### LC-NODE-017/B01

- Given: 合法 mix 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按宣告介面計算 mix(a,b,factor)。

### LC-NODE-017/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援的族、形狀、各operand型別列於 variants；不增加零除、NaN、singular/zero-length 等 domain 防護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-018 — Sine [sin]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-018) · Portable

### LC-NODE-018/B01

- Given: 合法 sin 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按輸入型別計算 GLSL sin(value)，向量逐分量，型別/shape保留。

### LC-NODE-018/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援型別列於variants；即便 sqrt(-1)、round半值、極值等也不另寫替代算法。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-019 — Subtract [subtract]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-019) · Portable

### LC-NODE-019/B01

- Given: 合法 subtract 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按宣告介面計算 a−b。

### LC-NODE-019/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援的族、形狀、各operand型別列於 variants；不增加零除、NaN、singular/zero-length 等 domain 防護。矩陣依列出的合法線性代數維度；純量直接乘除矩陣而非轉成對角矩陣。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-020 — Divide [divide]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-020) · Portable

### LC-NODE-020/B01

- Given: 合法 divide 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按宣告介面計算 a/b。

### LC-NODE-020/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援的族、形狀、各operand型別列於 variants；不增加零除、NaN、singular/zero-length 等 domain 防護。矩陣依列出的合法線性代數維度；純量直接乘除矩陣而非轉成對角矩陣。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-021 — Minimum [min]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-021) · Portable

### LC-NODE-021/B01

- Given: 合法 min 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按宣告介面計算 min(a,b)。

### LC-NODE-021/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援的族、形狀、各operand型別列於 variants；不增加零除、NaN、singular/zero-length 等 domain 防護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-022 — Maximum [max]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-022) · Portable

### LC-NODE-022/B01

- Given: 合法 max 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按宣告介面計算 max(a,b)。

### LC-NODE-022/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援的族、形狀、各operand型別列於 variants；不增加零除、NaN、singular/zero-length 等 domain 防護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-023 — Clamp [clamp]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-023) · Portable

### LC-NODE-023/B01

- Given: 合法 clamp 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按宣告介面計算 clamp(value,min,max)。

### LC-NODE-023/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援的族、形狀、各operand型別列於 variants；不增加零除、NaN、singular/zero-length 等 domain 防護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-024 — Smoothstep [smoothstep]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-024) · Portable

### LC-NODE-024/B01

- Given: 合法 smoothstep 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按宣告介面計算 smoothstep(edge0,edge1,value)。

### LC-NODE-024/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援的族、形狀、各operand型別列於 variants；不增加零除、NaN、singular/zero-length 等 domain 防護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-025 — Absolute [abs]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-025) · Portable

### LC-NODE-025/B01

- Given: 合法 abs 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按輸入型別計算 GLSL abs(value)，向量逐分量，型別/shape保留。

### LC-NODE-025/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援型別列於variants；即便 sqrt(-1)、round半值、極值等也不另寫替代算法。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-026 — Fraction [fract]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-026) · Portable

### LC-NODE-026/B01

- Given: 合法 fract 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按輸入型別計算 GLSL fract(value)，向量逐分量，型別/shape保留。

### LC-NODE-026/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援型別列於variants；即便 sqrt(-1)、round半值、極值等也不另寫替代算法。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-027 — Power [pow]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-027) · Portable

### LC-NODE-027/B01

- Given: 合法 pow 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按宣告介面計算 pow(base,exponent)。

### LC-NODE-027/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援的族、形狀、各operand型別列於 variants；不增加零除、NaN、singular/zero-length 等 domain 防護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-028 — Cosine [cos]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-028) · Portable

### LC-NODE-028/B01

- Given: 合法 cos 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按輸入型別計算 GLSL cos(value)，向量逐分量，型別/shape保留。

### LC-NODE-028/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援型別列於variants；即便 sqrt(-1)、round半值、極值等也不另寫替代算法。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-029 — Dot Product [dot]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-029) · Portable

### LC-NODE-029/B01

- Given: 合法 dot 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按宣告介面計算 dot(a,b)。

### LC-NODE-029/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援的族、形狀、各operand型別列於 variants；不增加零除、NaN、singular/zero-length 等 domain 防護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-030 — Length [length]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-030) · Portable

### LC-NODE-030/B01

- Given: 合法 length 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按宣告介面計算 length(value)。

### LC-NODE-030/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援的族、形狀、各operand型別列於 variants；不增加零除、NaN、singular/zero-length 等 domain 防護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-031 — Normalize [normalize]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-031) · Portable

### LC-NODE-031/B01

- Given: 合法 normalize 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按宣告介面計算 normalize(value)。

### LC-NODE-031/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援的族、形狀、各operand型別列於 variants；不增加零除、NaN、singular/zero-length 等 domain 防護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-032 — Compose RGBA [rgba]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-032) · Portable

### LC-NODE-032/B01

- Given: 合法 rgba 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: vec4(rgb, alpha)，RGB 三分量加獨立 Alpha，Alpha 預設 1。

### LC-NODE-032/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：不預乘 alpha；只接受 vec3 與 float（一般連線規則仍適用）。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-033 — Split RGBA [split]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-033) · Portable

### LC-NODE-033/B01

- Given: 合法 split 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 將 vec4 color 同時提供 rgb、r、g、b、a；以原值 swizzle，不作顏色空間/alpha 變換。

### LC-NODE-033/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：所有輸出引用同一輸入，無重新取樣。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-034 — Uniform [uniform]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-034) · Environment-bound

### LC-NODE-034/B01

- Given: 合法 uniform 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 引用 graph declaration 的 uniform 名稱與型別成為圖內輸出；只有用到才出現在 shader bindings。

### LC-NODE-034/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：declaration 必须 kind=uniform 且型別符合已支援原生頁；宣告 CRUD/原生實值由 DATA/HOST 盤點。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-035 — Texture Coordinates [uv]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-035) · Environment-bound

### LC-NODE-035/B01

- Given: 合法 uv 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 輸出 sg_uv：TOP 的 vUV.st 或 MAT 從 Vertex 傳入的 TDTexCoord(0u).xy。

### LC-NODE-035/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：只可 Pixel；不包含紋理取樣。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-036 — Texture 2D [texture]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-036) · Environment-bound

### LC-NODE-036/B01

- Given: 合法 texture 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 舊式 Texture 2D 引用 sampler 宣告（managed TOP 可 inputId），用 texture(sampler, uv) 輸出 vec4。

### LC-NODE-036/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：未接 uv 使用 sg_uv；需有效 declaration/input；保留舊式圖語意。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-037 — TD Position [position]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-037) · Environment-bound

### LC-NODE-037/B01

- Given: 合法 position 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDPos() 提供幾何頂點位置 vec3。

### LC-NODE-037/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：僅 Vertex；需 TD MAT shader 環境。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-038 — TD Deform [deform]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-038) · Environment-bound

### LC-NODE-038/B01

- Given: 合法 deform 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDDeform(position) 將 vec3 頂點變為變形後 vec4。

### LC-NODE-038/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：僅 Vertex；不自行重建 normal/tangent。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-039 — World to Projection [to_clip]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-039) · Environment-bound

### LC-NODE-039/B01

- Given: 合法 to_clip 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDWorldToProj(world) 將 vec4 world 位置轉為 clip position。

### LC-NODE-039/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：僅 Vertex；依 TD 相機/投影環境。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-040 — Vertex Output [vertex_out]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-040) · Environment-bound

### LC-NODE-040/B01

- Given: 合法 vertex_out 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 寫 gl_Position，將自訂輸入跨 Stage 傳為 varying。

### LC-NODE-040/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：最多16 ports；純量/向量/矩陣與固定陣列結構可遞迴平坦化，每port最多1024 leaves；非 float family 強制 flat；bool 編碼為 int；不能傳 sampler 或不固定長度陣列。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-041 — Color Output [pixel_out]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-041) · Environment-bound

### LC-NODE-041/B01

- Given: 合法 pixel_out 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 輸出 Color buffer。TOP 只一個 TDOutputSwizzle(color)；MAT 先將全部配置 buffer 清透明黑再寫選定輸入。

### LC-NODE-041/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：MAT bufferCount 1–8；主色可獨立 dither/alphaTest/convertColorSpace，新模式預設全 true；額外 buffer 只 Swizzle；舊 nativeFinishing 模式保留原輸出直到旗標被編輯。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-042 — Sampler 2D [sampler]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-042) · Environment-bound

### LC-NODE-042/B01

- Given: 合法 sampler 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 將已宣告 sampler2D 資源作為引用輸出，可交給外部 Texture 2D 取樣。

### LC-NODE-042/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：只有資源引用、不是 pixel 值；不存在或 kind 不符宣告報錯。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-043 — Texture 2D [texture_sample]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-043) · Portable

### LC-NODE-043/B01

- Given: 合法 texture_sample 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 將外部 sampler2D 與 uv 取樣成 vec4，未接 uv 使用 sg_uv。

### LC-NODE-043/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：未接 sampler：managed TOP 直接 opaque black 且不配置 input slot；MAT/legacy TOP 共用一個 black fallback binding；都附 diagnostic。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-044 — Constant [constant]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-044) · Portable

### LC-NODE-044/B01

- Given: 合法 constant 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 引用 graph constant 宣告，生成有明確型別的 const 定義及 literal 值。

### LC-NODE-044/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：固定長度 compound 可用；不能有 live driver/expose；宣告 CRUD 另列。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-045 — TOP Input [top_input]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-045) · Environment-bound

### LC-NODE-045/B01

- Given: 合法 top_input 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 由固定 inputId 引用 TOP 輸入，輸出 sampler2D、size=(width,height)、pixelSize=(1/width,1/height)。

### LC-NODE-045/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：size 與 pixelSize 分別 uTD2DInfos[i].res.zw / .xy；按當前 slot 順序取索引，inputId 必须存在。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-046 — GLSL Code [glsl_code]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-046) · Portable

### LC-NODE-046/B01

- Given: 合法 glsl_code 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 用自訂 inputs/outputs/body 產生每節點唯一 void helper，一次呼叫可有多個 out；先零初始化輸出再執行 body。

### LC-NODE-046/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：0–16 inputs，1–16 outputs，body ≤16384；資源只准輸入；名與ID唯一/合法，禁止 # 指令、續行反斜線、控制字元、不成對花括號/註解。不是 GLSL 語法解析器或沙箱。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-047 — Vector 4 [vec4]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-047) · Portable

### LC-NODE-047/B01

- Given: 合法 vec4 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 輸出固定 vec4 literal；保存 value 控制所有分量。

### LC-NODE-047/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：固定型別，不因 downstream 或 value 長度隱式改型；所有初始數值列於 operationSpec.defaultParameters。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-048 — Combine [combine]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-048) · Portable

### LC-NODE-048/B01

- Given: 合法 combine 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 用 contiguous component groups 組成所選向量，保留 x/y/z/w 對應位置；未接組使用 components 對应區段。

### LC-NODE-048/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：groups 必須合法分割、不重疊；每根線必須精確型別；不做自動 splat 或截短。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-049 — Split [vector_split]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-049) · Portable

### LC-NODE-049/B01

- Given: 合法 vector_split 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 將選定向量按 x/y/z/w 分成相同純量族的輸出。

### LC-NODE-049/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：float/int/uint/bool/double 各 vec2/3/4；只列实际分量，無組合或色彩轉換。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-050 — Swizzle [swizzle]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-050) · Portable

### LC-NODE-050/B01

- Given: 合法 swizzle 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按 mask 重排或重複已有向量分量，輸出同 family 的純量或向量。

### LC-NODE-050/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：mask 1–4 字，僅 x/y/z/w 且不能引用不存在的分量；例如 vec2.xxxy 合法，vec2.z 不合法。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-051 — Vector [vector]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-051) · Portable

### LC-NODE-051/B01

- Given: 合法 vector 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 保留四個 components 值，依所選 vec2/3/4 輸出前 N 項常數。

### LC-NODE-051/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：float/int/uint/bool/double families；fixedType 存在不可換型。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-052 — Replace [replace]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-052) · Portable

### LC-NODE-052/B01

- Given: 合法 replace 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 向量分量覆寫優先序：已接的 component group > 已接 value baseline > components 手動值。

### LC-NODE-052/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：unconnected group 必须先移除；精確型別；被全部覆蓋的上游不產碼/不帶 binding；輸出保持 group constructor 語意。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-053 — Spec Constant [spec_constant]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-053) · Environment-bound

### LC-NODE-053/B01

- Given: 合法 spec_constant 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 引用 specialization constant，生成 layout(constant_id=N) const T name=value。

### LC-NODE-053/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：目前僅 float/int/uint/bool；ID 穩定且唯一非負 signed32；不能冒充 ordinary constant expression。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-054 — Sign [sign]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-054) · Portable

### LC-NODE-054/B01

- Given: 合法 sign 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按輸入型別計算 GLSL sign(value)，向量逐分量，型別/shape保留。

### LC-NODE-054/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援型別列於variants；即便 sqrt(-1)、round半值、極值等也不另寫替代算法。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-055 — Sqrt [sqrt]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-055) · Portable

### LC-NODE-055/B01

- Given: 合法 sqrt 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按輸入型別計算 GLSL sqrt(value)，向量逐分量，型別/shape保留。

### LC-NODE-055/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援型別列於variants；即便 sqrt(-1)、round半值、極值等也不另寫替代算法。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-056 — Floor [floor]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-056) · Portable

### LC-NODE-056/B01

- Given: 合法 floor 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按輸入型別計算 GLSL floor(value)，向量逐分量，型別/shape保留。

### LC-NODE-056/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援型別列於variants；即便 sqrt(-1)、round半值、極值等也不另寫替代算法。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-057 — Round [round]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-057) · Portable

### LC-NODE-057/B01

- Given: 合法 round 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按輸入型別計算 GLSL round(value)，向量逐分量，型別/shape保留。

### LC-NODE-057/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援型別列於variants；即便 sqrt(-1)、round半值、極值等也不另寫替代算法。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-058 — Ceil [ceil]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-058) · Portable

### LC-NODE-058/B01

- Given: 合法 ceil 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按輸入型別計算 GLSL ceil(value)，向量逐分量，型別/shape保留。

### LC-NODE-058/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援型別列於variants；即便 sqrt(-1)、round半值、極值等也不另寫替代算法。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-059 — Truncate [trunc]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-059) · Portable

### LC-NODE-059/B01

- Given: 合法 trunc 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按輸入型別計算 GLSL trunc(value)，向量逐分量，型別/shape保留。

### LC-NODE-059/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援型別列於variants；即便 sqrt(-1)、round半值、極值等也不另寫替代算法。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-060 — Modulo [mod]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-060) · Portable

### LC-NODE-060/B01

- Given: 合法 mod 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 按宣告介面計算 float/double: mod(a,b)；int/uint: a % b。

### LC-NODE-060/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確支援的族、形狀、各operand型別列於 variants；不增加零除、NaN、singular/zero-length 等 domain 防護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-061 — RGB to HSV [rgb_to_hsv]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-061) · Environment-bound

### LC-NODE-061/B01

- Given: 合法 rgb_to_hsv 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: TDRGBToHSV(rgb) 轉換三分量色彩。

### LC-NODE-061/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：無 alpha 端口，不處理 alpha；TD helper 決定色彩算法。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-062 — HSV to RGB [hsv_to_rgb]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-062) · Environment-bound

### LC-NODE-062/B01

- Given: 合法 hsv_to_rgb 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: TDHSVToRGB(hsv) 轉換三分量色彩。

### LC-NODE-062/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：無 alpha 端口，不處理 alpha；TD helper 決定色彩算法。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-063 — Remap [remap]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-063) · Environment-bound

### LC-NODE-063/B01

- Given: 合法 remap 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: TDRemap(value,fromMin,fromMax,toMin,toMax) 作區間重映射。

### LC-NODE-063/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：不另加 clamp，fromMin=fromMax 的實際結果取決於 TD helper。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-064 — Range From [range_from]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-064) · Portable

### LC-NODE-064/B01

- Given: 合法 range_from 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 逐分量將 [min,max] 映成 [0,1]：(value−min)/(max−min)。

### LC-NODE-064/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：某分量 min==max 時該分量保留原 value；不 clamp。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-065 — Range To [range_to]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-065) · Portable

### LC-NODE-065/B01

- Given: 合法 range_to 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 逐分量 value*(max−min)+min，將 0..1 映到目標範圍。

### LC-NODE-065/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：不 clamp；double 保留 double literal/precision。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-066 — Loop [loop]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-066) · Environment-bound

### LC-NODE-066/B01

- Given: 合法 loop 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 逐分量 TDLoop(value,min,max)，循環包覆範圍。

### LC-NODE-066/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：不自行處理 range 退化；原生 TD helper。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-067 — Zigzag [zigzag]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-067) · Environment-bound

### LC-NODE-067/B01

- Given: 合法 zigzag 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 逐分量 TDZigZag(value,min,max)，往返折返範圍。

### LC-NODE-067/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：不自行處理 range 退化；原生 TD helper。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-068 — Perlin Noise [perlin_noise]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-068) · Environment-bound

### LC-NODE-068/B01

- Given: 合法 perlin_noise 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: TDPerlinNoise(position) 以 vec2/vec3/vec4 座標輸出單一 float。

### LC-NODE-068/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：沒有 scalar 座標、沒有 dimension 自動裁切；runtime helper 不算 ordinary constant，即便座標 literal。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-069 — Simplex Noise [simplex_noise]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-069) · Environment-bound

### LC-NODE-069/B01

- Given: 合法 simplex_noise 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: TDSimplexNoise(position) 以 vec2/vec3/vec4 座標輸出單一 float。

### LC-NODE-069/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：沒有 scalar 座標、沒有 dimension 自動裁切；runtime helper 不算 ordinary constant。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-070 — Voronoi [voronoi]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-070) · Portable

### LC-NODE-070/B01

- Given: 合法 voronoi 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 一維到四維 cellular noise；F1/F2/smooth F1 距離、顏色與特徵點位置；distance_to_edge 或 n_sphere_radius 提供幾何距離。

### LC-NODE-070/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：4 dimensions ×5 features ×4 metrics；預設 3D/F1/Euclidean、不normalize；不是 Blender 數值重現。所有模式/port 附錄逐一列出。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-004

## LC-NODE-071 — Matrix [matrix]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-071) · Portable

### LC-NODE-071/B01

- Given: 合法 matrix 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 依 column-major values 輸出矩陣常數，未改值預設 identity。

### LC-NODE-071/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：float/double 的 2..4 columns ×2..4 rows 共18型；值數量必須符合，fixedType 不可改。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-072 — Matrix Combine [matrix_combine]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-072) · Portable

### LC-NODE-072/B01

- Given: 合法 matrix_combine 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 矩陣每個 scalar cell > column vector > 手動 values，組成同 shape 矩陣。

### LC-NODE-072/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：column 與 cell 同時存在；不以 inputValues 覆蓋手動矩陣；整欄被覆蓋時上游欄可裁除。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-073 — Matrix Replace [matrix_replace]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-073) · Portable

### LC-NODE-073/B01

- Given: 合法 matrix_replace 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 矩陣每個 scalar cell > column vector > value baseline > 手動 values。

### LC-NODE-073/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：完全覆蓋的 runtime baseline 不產碼；斷線回復保存的值，非取樣目前上游值。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-074 — Matrix Split [matrix_split]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-074) · Portable

### LC-NODE-074/B01

- Given: 合法 matrix_split 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 同時提供所有 column vectors 與 scalar cells，索引 value[column][row]。

### LC-NODE-074/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：長方形與 double shapes 按實際 columns/rows；不轉置。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-075 — Matrix Get [matrix_get]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-075) · Portable

### LC-NODE-075/B01

- Given: 合法 matrix_get 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 依動態 column 索引讀欄向量，mode=element 時再依 row 讀純量。

### LC-NODE-075/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：mode column/element；indexType int/uint；不 clamp、不做越界保護，越界 GPU 結果未保證。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-003

## LC-NODE-076 — Matrix Set [matrix_set]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-076) · Portable

### LC-NODE-076/B01

- Given: 合法 matrix_set 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 複製輸入矩陣後，依 column 或 column+row 索引替換欄/元素。

### LC-NODE-076/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：mode column/element；indexType int/uint；不 clamp，不沿用 Array Replace 越界忽略規則。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-003

## LC-NODE-077 — Transpose [transpose]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-077) · Portable

### LC-NODE-077/B01

- Given: 合法 transpose 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: transpose(value)；長方形輸出 columns/rows 互換。

### LC-NODE-077/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：同 float/double family，不改儲存規約。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-078 — Inverse [inverse]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-078) · Portable

### LC-NODE-078/B01

- Given: 合法 inverse 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: inverse(value) 求方矩陣反矩陣。

### LC-NODE-078/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：只2/3/4方矩陣及double對應；不對奇異矩陣提供安全替代。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-079 — Determinant [determinant]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-079) · Portable

### LC-NODE-079/B01

- Given: 合法 determinant 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: determinant(value) 求方矩陣行列式，回傳相應 float/double。

### LC-NODE-079/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：只2/3/4方矩陣及double對應。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-080 — Matrix Component Multiply [matrix_comp_mult]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-080) · Portable

### LC-NODE-080/B01

- Given: 合法 matrix_comp_mult 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: matrixCompMult(a,b) 對同 shape 矩陣逐元素相乘。

### LC-NODE-080/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：不同於一般 Multiply 的線性代數矩陣乘法。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-081 — Outer Product [outer_product]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-081) · Portable

### LC-NODE-081/B01

- Given: 合法 outer_product 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: outerProduct(a,b)；a 的分量數為結果 rows，b 分量數為 columns。

### LC-NODE-081/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：float/double family，輸出可長方形。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-082 — Array [array]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-082) · Portable

### LC-NODE-082/B01

- Given: 合法 array 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 建立選定 elementType、length 的零值陣列；矩陣元素也是全零，不是 identity。

### LC-NODE-082/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：作者literal length 1–1024；可合法符號長度，無資源建立；symbolic array 以迴圈初始化。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-083 — Array[i] [array_get]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-083) · Portable

### LC-NODE-083/B01

- Given: 合法 array_get 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 讀取陣列 i；int clamp(i,0,length−1)，uint min(i,length−1)；opaque element 保留資源引用。

### LC-NODE-083/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：indexType int/uint，不因對面純量自動更換；空host array用 #error；opaque index 包 nonuniformEXT。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-084 — Array Replace [array_replace]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-084) · Portable

### LC-NODE-084/B01

- Given: 合法 array_replace 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 複製 Array，只在 0<=i<length 時替換元素，範圍外原樣傳出；下標仍 clamp 以避免死分支常數越界。

### LC-NODE-084/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：禁止 opaque array；specialization-sized 外層用逐元素複製；不改來源陣列。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-085 — Array Length [array_length]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-085) · Portable

### LC-NODE-085/B01

- Given: 合法 array_length 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 輸出型別攜帶的長度 literal/symbol/macro（int），不是掃描/取回GPU資料。

### LC-NODE-085/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：不求值 Array 來源的內容，僅保留其長度的必要宣告依賴。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-086 — Field [struct_field]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-086) · Portable

### LC-NODE-086/B01

- Given: 合法 struct_field 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 依穩定 field ID 選出結構欄位，GLSL 使用該欄位現行 name。

### LC-NODE-086/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：支援 TD builtin 與 graph 自訂結構；compiler不把不存在field自動換第一個，會報錯；編輯器的修復與線路處置另列。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-087 — Built-in Source [builtin_source]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-087) · Environment-bound

### LC-NODE-087/B01

- Given: 合法 builtin_source 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 依 source ID 引用 TD builtin 值、結構或陣列；結構額外提供各 f_<fieldID> 欄位。

### LC-NODE-087/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：該source及其所有遞迴型別須允許目前target/stage；原生結構不重複宣告。來源清單由DATA盤點。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-088 — Array Create [array_create]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-088) · Portable

### LC-NODE-088/B01

- Given: 合法 array_create 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: length 決定陣列型別，用 value 填滿各元素；value 可 runtime。

### LC-NODE-088/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：length 必須 int/uint 的 ordinary/spec constant 允許運算鏈；不 CPU 評估；直接literal 1–1024；只用 Length 時不填值/不帶 value 的 runtime binding。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-089 — Buffer Fetch [buffer_fetch]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-089) · Portable

### LC-NODE-089/B01

- Given: 合法 buffer_fetch 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: texelFetch(buffer,index) 以整數座標讀 samplerBuffer，輸出 vec4。

### LC-NODE-089/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：必須外接 Texture Buffer；不自動 normalize/clamp index。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-090 — Buffer Length [buffer_length]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-090) · Portable

### LC-NODE-090/B01

- Given: 合法 buffer_length 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: textureSize(buffer) 取得 samplerBuffer texel 數量，輸出 int。

### LC-NODE-090/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：必須外接 Texture Buffer。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-091 — POP Buffer [pop_buffer]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-091) · Environment-bound

### LC-NODE-091/B01

- Given: 合法 pop_buffer 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 index/arrayIndex 讀 TDBuffer_name，顯式 cast 成宣告值型別；另輸出 TDBufferLength_name() 與 cTDBufferArraySize_name。

### LC-NODE-091/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：index/arrayIndex uint；僅 length/arraySize 被使用時不讀取元素；numeric/matrix含double，實際POP資料精度不由cast保證。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-092 — Attribute [attribute]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-092) · Environment-bound

### LC-NODE-092/B01

- Given: 合法 attribute 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: Vertex 以 TDAttrib_name(arrayIndex) 讀取具名幾何屬性，arraySize uint 直接反映宣告。

### LC-NODE-092/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：僅 MAT Vertex；numeric scalar/vector + float matrix；資料由geometry提供、不接受 literal default。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-093 — Structure [struct_create]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-093) · Portable

### LC-NODE-093/B01

- Given: 合法 struct_create 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 f_<fieldID> inputs 建立完整結構值，同時輸出 out 與各 f_<fieldID> 欄位。

### LC-NODE-093/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：欄位重命名不改port identity；刪除欄位使舊線路端点無效；需有效結構型別。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-094 — radians [radians]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-094) · Portable

### LC-NODE-094/B01

- Given: 合法 radians 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 radians(value) 提供 radians；回傳型別/分量完整保留。

### LC-NODE-094/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-095 — degrees [degrees]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-095) · Portable

### LC-NODE-095/B01

- Given: 合法 degrees 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 degrees(value) 提供 degrees；回傳型別/分量完整保留。

### LC-NODE-095/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-096 — tan [tan]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-096) · Portable

### LC-NODE-096/B01

- Given: 合法 tan 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 tan(value) 提供 tan；回傳型別/分量完整保留。

### LC-NODE-096/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-097 — asin [asin]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-097) · Portable

### LC-NODE-097/B01

- Given: 合法 asin 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 asin(value) 提供 asin；回傳型別/分量完整保留。

### LC-NODE-097/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-098 — acos [acos]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-098) · Portable

### LC-NODE-098/B01

- Given: 合法 acos 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 acos(value) 提供 acos；回傳型別/分量完整保留。

### LC-NODE-098/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-099 — atan [atan]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-099) · Portable

### LC-NODE-099/B01

- Given: 合法 atan 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 atan(value) 提供 atan；回傳型別/分量完整保留。

### LC-NODE-099/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-100 — sinh [sinh]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-100) · Portable

### LC-NODE-100/B01

- Given: 合法 sinh 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 sinh(value) 提供 sinh；回傳型別/分量完整保留。

### LC-NODE-100/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-101 — cosh [cosh]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-101) · Portable

### LC-NODE-101/B01

- Given: 合法 cosh 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 cosh(value) 提供 cosh；回傳型別/分量完整保留。

### LC-NODE-101/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-102 — tanh [tanh]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-102) · Portable

### LC-NODE-102/B01

- Given: 合法 tanh 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 tanh(value) 提供 tanh；回傳型別/分量完整保留。

### LC-NODE-102/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-103 — asinh [asinh]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-103) · Portable

### LC-NODE-103/B01

- Given: 合法 asinh 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 asinh(value) 提供 asinh；回傳型別/分量完整保留。

### LC-NODE-103/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-104 — acosh [acosh]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-104) · Portable

### LC-NODE-104/B01

- Given: 合法 acosh 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 acosh(value) 提供 acosh；回傳型別/分量完整保留。

### LC-NODE-104/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-105 — atanh [atanh]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-105) · Portable

### LC-NODE-105/B01

- Given: 合法 atanh 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 atanh(value) 提供 atanh；回傳型別/分量完整保留。

### LC-NODE-105/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-106 — atan (y, x) [atan2]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-106) · Portable

### LC-NODE-106/B01

- Given: 合法 atan2 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 atan(y, x) 提供 atan (y, x)；回傳型別/分量完整保留。

### LC-NODE-106/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-107 — exp [exp]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-107) · Portable

### LC-NODE-107/B01

- Given: 合法 exp 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 exp(value) 提供 exp；回傳型別/分量完整保留。

### LC-NODE-107/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-108 — log [log]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-108) · Portable

### LC-NODE-108/B01

- Given: 合法 log 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 log(value) 提供 log；回傳型別/分量完整保留。

### LC-NODE-108/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-109 — exp2 [exp2]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-109) · Portable

### LC-NODE-109/B01

- Given: 合法 exp2 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 exp2(value) 提供 exp2；回傳型別/分量完整保留。

### LC-NODE-109/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-110 — log2 [log2]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-110) · Portable

### LC-NODE-110/B01

- Given: 合法 log2 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 log2(value) 提供 log2；回傳型別/分量完整保留。

### LC-NODE-110/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-111 — inversesqrt [inversesqrt]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-111) · Portable

### LC-NODE-111/B01

- Given: 合法 inversesqrt 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 inversesqrt(value) 提供 inversesqrt；回傳型別/分量完整保留。

### LC-NODE-111/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-112 — roundEven [round_even]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-112) · Portable

### LC-NODE-112/B01

- Given: 合法 round_even 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 roundEven(value) 提供 roundEven；回傳型別/分量完整保留。

### LC-NODE-112/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-113 — step [step]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-113) · Portable

### LC-NODE-113/B01

- Given: 合法 step 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 step(edge, value) 提供 step；回傳型別/分量完整保留。

### LC-NODE-113/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-114 — isnan [isnan]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-114) · Portable

### LC-NODE-114/B01

- Given: 合法 isnan 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 isnan(value) 提供 isnan；回傳型別/分量完整保留。

### LC-NODE-114/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-115 — isinf [isinf]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-115) · Portable

### LC-NODE-115/B01

- Given: 合法 isinf 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 isinf(value) 提供 isinf；回傳型別/分量完整保留。

### LC-NODE-115/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-116 — fma [fma]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-116) · Portable

### LC-NODE-116/B01

- Given: 合法 fma 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 fma(a, b, c) 提供 fma；回傳型別/分量完整保留。

### LC-NODE-116/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-117 — modf [modf]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-117) · Portable

### LC-NODE-117/B01

- Given: 合法 modf 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 modf(value) 提供 modf；同次呼叫另以 out arguments 提供 whole。

### LC-NODE-117/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-118 — frexp [frexp]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-118) · Portable

### LC-NODE-118/B01

- Given: 合法 frexp 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 frexp(value) 提供 frexp；同次呼叫另以 out arguments 提供 exponent。

### LC-NODE-118/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-119 — ldexp [ldexp]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-119) · Portable

### LC-NODE-119/B01

- Given: 合法 ldexp 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 ldexp(value, exponent) 提供 ldexp；回傳型別/分量完整保留。

### LC-NODE-119/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-120 — Boolean Mix [mix_boolean]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-120) · Portable

### LC-NODE-120/B01

- Given: 合法 mix_boolean 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 mix(a, b, factor) 提供 Boolean Mix；回傳型別/分量完整保留。

### LC-NODE-120/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-121 — Component Mix [mix_components]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-121) · Portable

### LC-NODE-121/B01

- Given: 合法 mix_components 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 mix(a, b, factor) 提供 Component Mix；回傳型別/分量完整保留。

### LC-NODE-121/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-122 — Scalar Edge Step [step_scalar]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-122) · Portable

### LC-NODE-122/B01

- Given: 合法 step_scalar 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 step(edge, value) 提供 Scalar Edge Step；回傳型別/分量完整保留。

### LC-NODE-122/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-123 — Bit And [bit_and]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-123) · Portable

### LC-NODE-123/B01

- Given: 合法 bit_and 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 GLSL & 計算 a, b；向量版本逐分量，回傳原整數/bool族。

### LC-NODE-123/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：位移量、整數除零/溢位等保留原生 GLSL 規則，未加保護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-124 — Bit Or [bit_or]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-124) · Portable

### LC-NODE-124/B01

- Given: 合法 bit_or 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 GLSL | 計算 a, b；向量版本逐分量，回傳原整數/bool族。

### LC-NODE-124/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：位移量、整數除零/溢位等保留原生 GLSL 規則，未加保護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-125 — Bit Xor [bit_xor]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-125) · Portable

### LC-NODE-125/B01

- Given: 合法 bit_xor 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 GLSL ^ 計算 a, b；向量版本逐分量，回傳原整數/bool族。

### LC-NODE-125/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：位移量、整數除零/溢位等保留原生 GLSL 規則，未加保護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-126 — Bit Not [bit_not]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-126) · Portable

### LC-NODE-126/B01

- Given: 合法 bit_not 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 GLSL ~ 計算 value；向量版本逐分量，回傳原整數/bool族。

### LC-NODE-126/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：位移量、整數除零/溢位等保留原生 GLSL 規則，未加保護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-127 — Shift Left [shift_left]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-127) · Portable

### LC-NODE-127/B01

- Given: 合法 shift_left 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 GLSL << 計算 a, b；向量版本逐分量，回傳原整數/bool族。

### LC-NODE-127/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：位移量、整數除零/溢位等保留原生 GLSL 規則，未加保護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-128 — Shift Right [shift_right]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-128) · Portable

### LC-NODE-128/B01

- Given: 合法 shift_right 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 GLSL >> 計算 a, b；向量版本逐分量，回傳原整數/bool族。

### LC-NODE-128/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：位移量、整數除零/溢位等保留原生 GLSL 規則，未加保護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-129 — Remainder [remainder]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-129) · Portable

### LC-NODE-129/B01

- Given: 合法 remainder 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 GLSL % 計算 a, b；向量版本逐分量，回傳原整數/bool族。

### LC-NODE-129/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：位移量、整數除零/溢位等保留原生 GLSL 規則，未加保護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-130 — Boolean And [boolean_and]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-130) · Portable

### LC-NODE-130/B01

- Given: 合法 boolean_and 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 GLSL && 計算 a, b；向量版本逐分量，回傳原整數/bool族。

### LC-NODE-130/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：位移量、整數除零/溢位等保留原生 GLSL 規則，未加保護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-131 — Boolean Or [boolean_or]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-131) · Portable

### LC-NODE-131/B01

- Given: 合法 boolean_or 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 GLSL || 計算 a, b；向量版本逐分量，回傳原整數/bool族。

### LC-NODE-131/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：位移量、整數除零/溢位等保留原生 GLSL 規則，未加保護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-132 — Boolean Xor [boolean_xor]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-132) · Portable

### LC-NODE-132/B01

- Given: 合法 boolean_xor 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 GLSL ^^ 計算 a, b；向量版本逐分量，回傳原整數/bool族。

### LC-NODE-132/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：位移量、整數除零/溢位等保留原生 GLSL 規則，未加保護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-133 — Boolean Not [boolean_not]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-133) · Portable

### LC-NODE-133/B01

- Given: 合法 boolean_not 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 GLSL ! 計算 value；向量版本逐分量，回傳原整數/bool族。

### LC-NODE-133/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：位移量、整數除零/溢位等保留原生 GLSL 規則，未加保護。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-134 — floatBitsToInt [floatBitsToInt]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-134) · Portable

### LC-NODE-134/B01

- Given: 合法 floatBitsToInt 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 floatBitsToInt(value) 提供 floatBitsToInt；回傳型別/分量完整保留。

### LC-NODE-134/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-135 — floatBitsToUint [floatBitsToUint]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-135) · Portable

### LC-NODE-135/B01

- Given: 合法 floatBitsToUint 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 floatBitsToUint(value) 提供 floatBitsToUint；回傳型別/分量完整保留。

### LC-NODE-135/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-136 — intBitsToFloat [intBitsToFloat]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-136) · Portable

### LC-NODE-136/B01

- Given: 合法 intBitsToFloat 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 intBitsToFloat(value) 提供 intBitsToFloat；回傳型別/分量完整保留。

### LC-NODE-136/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-137 — uintBitsToFloat [uintBitsToFloat]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-137) · Portable

### LC-NODE-137/B01

- Given: 合法 uintBitsToFloat 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 uintBitsToFloat(value) 提供 uintBitsToFloat；回傳型別/分量完整保留。

### LC-NODE-137/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-138 — packUnorm2x16 [packUnorm2x16]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-138) · Portable

### LC-NODE-138/B01

- Given: 合法 packUnorm2x16 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 packUnorm2x16(value) 提供 packUnorm2x16；回傳型別/分量完整保留。

### LC-NODE-138/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-139 — packSnorm2x16 [packSnorm2x16]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-139) · Portable

### LC-NODE-139/B01

- Given: 合法 packSnorm2x16 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 packSnorm2x16(value) 提供 packSnorm2x16；回傳型別/分量完整保留。

### LC-NODE-139/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-140 — packHalf2x16 [packHalf2x16]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-140) · Portable

### LC-NODE-140/B01

- Given: 合法 packHalf2x16 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 packHalf2x16(value) 提供 packHalf2x16；回傳型別/分量完整保留。

### LC-NODE-140/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-141 — packUnorm4x8 [packUnorm4x8]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-141) · Portable

### LC-NODE-141/B01

- Given: 合法 packUnorm4x8 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 packUnorm4x8(value) 提供 packUnorm4x8；回傳型別/分量完整保留。

### LC-NODE-141/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-142 — packSnorm4x8 [packSnorm4x8]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-142) · Portable

### LC-NODE-142/B01

- Given: 合法 packSnorm4x8 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 packSnorm4x8(value) 提供 packSnorm4x8；回傳型別/分量完整保留。

### LC-NODE-142/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-143 — unpackUnorm2x16 [unpackUnorm2x16]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-143) · Portable

### LC-NODE-143/B01

- Given: 合法 unpackUnorm2x16 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 unpackUnorm2x16(value) 提供 unpackUnorm2x16；回傳型別/分量完整保留。

### LC-NODE-143/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-144 — unpackSnorm2x16 [unpackSnorm2x16]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-144) · Portable

### LC-NODE-144/B01

- Given: 合法 unpackSnorm2x16 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 unpackSnorm2x16(value) 提供 unpackSnorm2x16；回傳型別/分量完整保留。

### LC-NODE-144/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-145 — unpackHalf2x16 [unpackHalf2x16]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-145) · Portable

### LC-NODE-145/B01

- Given: 合法 unpackHalf2x16 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 unpackHalf2x16(value) 提供 unpackHalf2x16；回傳型別/分量完整保留。

### LC-NODE-145/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-146 — unpackUnorm4x8 [unpackUnorm4x8]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-146) · Portable

### LC-NODE-146/B01

- Given: 合法 unpackUnorm4x8 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 unpackUnorm4x8(value) 提供 unpackUnorm4x8；回傳型別/分量完整保留。

### LC-NODE-146/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-147 — unpackSnorm4x8 [unpackSnorm4x8]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-147) · Portable

### LC-NODE-147/B01

- Given: 合法 unpackSnorm4x8 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 unpackSnorm4x8(value) 提供 unpackSnorm4x8；回傳型別/分量完整保留。

### LC-NODE-147/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-148 — packDouble2x32 [packDouble2x32]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-148) · Portable

### LC-NODE-148/B01

- Given: 合法 packDouble2x32 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 packDouble2x32(value) 提供 packDouble2x32；回傳型別/分量完整保留。

### LC-NODE-148/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-149 — unpackDouble2x32 [unpackDouble2x32]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-149) · Portable

### LC-NODE-149/B01

- Given: 合法 unpackDouble2x32 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 unpackDouble2x32(value) 提供 unpackDouble2x32；回傳型別/分量完整保留。

### LC-NODE-149/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-150 — distance [distance]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-150) · Portable

### LC-NODE-150/B01

- Given: 合法 distance 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 distance(a, b) 提供 distance；回傳型別/分量完整保留。

### LC-NODE-150/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-151 — cross [cross]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-151) · Portable

### LC-NODE-151/B01

- Given: 合法 cross 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 cross(a, b) 提供 cross；回傳型別/分量完整保留。

### LC-NODE-151/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-152 — faceforward [faceforward]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-152) · Portable

### LC-NODE-152/B01

- Given: 合法 faceforward 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 faceforward(normal, incident, reference) 提供 faceforward；回傳型別/分量完整保留。

### LC-NODE-152/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-153 — reflect [reflect]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-153) · Portable

### LC-NODE-153/B01

- Given: 合法 reflect 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 reflect(incident, normal) 提供 reflect；回傳型別/分量完整保留。

### LC-NODE-153/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-154 — refract [refract]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-154) · Portable

### LC-NODE-154/B01

- Given: 合法 refract 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 refract(incident, normal, eta) 提供 refract；回傳型別/分量完整保留。

### LC-NODE-154/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-155 — lessThan [lessThan]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-155) · Portable

### LC-NODE-155/B01

- Given: 合法 lessThan 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 lessThan(a, b) 提供 lessThan；回傳型別/分量完整保留。

### LC-NODE-155/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-156 — lessThanEqual [lessThanEqual]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-156) · Portable

### LC-NODE-156/B01

- Given: 合法 lessThanEqual 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 lessThanEqual(a, b) 提供 lessThanEqual；回傳型別/分量完整保留。

### LC-NODE-156/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-157 — greaterThan [greaterThan]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-157) · Portable

### LC-NODE-157/B01

- Given: 合法 greaterThan 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 greaterThan(a, b) 提供 greaterThan；回傳型別/分量完整保留。

### LC-NODE-157/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-158 — greaterThanEqual [greaterThanEqual]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-158) · Portable

### LC-NODE-158/B01

- Given: 合法 greaterThanEqual 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 greaterThanEqual(a, b) 提供 greaterThanEqual；回傳型別/分量完整保留。

### LC-NODE-158/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-159 — equal [equal]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-159) · Portable

### LC-NODE-159/B01

- Given: 合法 equal 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 equal(a, b) 提供 equal；回傳型別/分量完整保留。

### LC-NODE-159/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-160 — notEqual [notEqual]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-160) · Portable

### LC-NODE-160/B01

- Given: 合法 notEqual 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 notEqual(a, b) 提供 notEqual；回傳型別/分量完整保留。

### LC-NODE-160/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-161 — any [any]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-161) · Portable

### LC-NODE-161/B01

- Given: 合法 any 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 any(value) 提供 any；回傳型別/分量完整保留。

### LC-NODE-161/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-162 — all [all]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-162) · Portable

### LC-NODE-162/B01

- Given: 合法 all 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 all(value) 提供 all；回傳型別/分量完整保留。

### LC-NODE-162/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-163 — not [not]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-163) · Portable

### LC-NODE-163/B01

- Given: 合法 not 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 not(value) 提供 not；回傳型別/分量完整保留。

### LC-NODE-163/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-164 — bitfieldReverse [bitfieldReverse]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-164) · Portable

### LC-NODE-164/B01

- Given: 合法 bitfieldReverse 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 bitfieldReverse(value) 提供 bitfieldReverse；回傳型別/分量完整保留。

### LC-NODE-164/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-165 — bitCount [bitCount]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-165) · Portable

### LC-NODE-165/B01

- Given: 合法 bitCount 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 bitCount(value) 提供 bitCount；回傳型別/分量完整保留。

### LC-NODE-165/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-166 — findLSB [findLSB]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-166) · Portable

### LC-NODE-166/B01

- Given: 合法 findLSB 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 findLSB(value) 提供 findLSB；回傳型別/分量完整保留。

### LC-NODE-166/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-167 — findMSB [findMSB]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-167) · Portable

### LC-NODE-167/B01

- Given: 合法 findMSB 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 findMSB(value) 提供 findMSB；回傳型別/分量完整保留。

### LC-NODE-167/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-168 — bitfieldExtract [bitfieldExtract]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-168) · Portable

### LC-NODE-168/B01

- Given: 合法 bitfieldExtract 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 bitfieldExtract(value, offset, bits) 提供 bitfieldExtract；回傳型別/分量完整保留。

### LC-NODE-168/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-169 — bitfieldInsert [bitfieldInsert]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-169) · Portable

### LC-NODE-169/B01

- Given: 合法 bitfieldInsert 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 bitfieldInsert(base, insert, offset, bits) 提供 bitfieldInsert；回傳型別/分量完整保留。

### LC-NODE-169/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-170 — uaddCarry [uaddCarry]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-170) · Portable

### LC-NODE-170/B01

- Given: 合法 uaddCarry 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 uaddCarry(a, b) 提供 uaddCarry；同次呼叫另以 out arguments 提供 carry。

### LC-NODE-170/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-171 — usubBorrow [usubBorrow]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-171) · Portable

### LC-NODE-171/B01

- Given: 合法 usubBorrow 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 usubBorrow(a, b) 提供 usubBorrow；同次呼叫另以 out arguments 提供 carry。

### LC-NODE-171/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-172 — umulExtended [umulExtended]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-172) · Portable

### LC-NODE-172/B01

- Given: 合法 umulExtended 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 umulExtended(a, b) 提供 umulExtended；同次呼叫另以 out arguments 提供 high, low。

### LC-NODE-172/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-173 — imulExtended [imulExtended]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-173) · Portable

### LC-NODE-173/B01

- Given: 合法 imulExtended 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 imulExtended(a, b) 提供 imulExtended；同次呼叫另以 out arguments 提供 high, low。

### LC-NODE-173/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-174 — dFdx [dFdx]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-174) · Portable

### LC-NODE-174/B01

- Given: 合法 dFdx 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 dFdx(value) 提供 dFdx；回傳型別/分量完整保留。

### LC-NODE-174/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-175 — dFdy [dFdy]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-175) · Portable

### LC-NODE-175/B01

- Given: 合法 dFdy 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 dFdy(value) 提供 dFdy；回傳型別/分量完整保留。

### LC-NODE-175/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-176 — fwidth [fwidth]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-176) · Portable

### LC-NODE-176/B01

- Given: 合法 fwidth 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 fwidth(value) 提供 fwidth；回傳型別/分量完整保留。

### LC-NODE-176/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-177 — dFdxFine [dFdxFine]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-177) · Portable

### LC-NODE-177/B01

- Given: 合法 dFdxFine 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 dFdxFine(value) 提供 dFdxFine；回傳型別/分量完整保留。

### LC-NODE-177/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-178 — dFdyFine [dFdyFine]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-178) · Portable

### LC-NODE-178/B01

- Given: 合法 dFdyFine 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 dFdyFine(value) 提供 dFdyFine；回傳型別/分量完整保留。

### LC-NODE-178/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-179 — fwidthFine [fwidthFine]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-179) · Portable

### LC-NODE-179/B01

- Given: 合法 fwidthFine 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 fwidthFine(value) 提供 fwidthFine；回傳型別/分量完整保留。

### LC-NODE-179/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-180 — dFdxCoarse [dFdxCoarse]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-180) · Portable

### LC-NODE-180/B01

- Given: 合法 dFdxCoarse 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 dFdxCoarse(value) 提供 dFdxCoarse；回傳型別/分量完整保留。

### LC-NODE-180/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-181 — dFdyCoarse [dFdyCoarse]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-181) · Portable

### LC-NODE-181/B01

- Given: 合法 dFdyCoarse 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 dFdyCoarse(value) 提供 dFdyCoarse；回傳型別/分量完整保留。

### LC-NODE-181/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-182 — fwidthCoarse [fwidthCoarse]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-182) · Portable

### LC-NODE-182/B01

- Given: 合法 fwidthCoarse 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 fwidthCoarse(value) 提供 fwidthCoarse；回傳型別/分量完整保留。

### LC-NODE-182/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-183 — TDAverage [td_average]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-183) · Environment-bound

### LC-NODE-183/B01

- Given: 合法 td_average 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDAverage(a, b) 提供 TDAverage；回傳型別/分量完整保留。

### LC-NODE-183/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-184 — TDRotateToVector [td_rotate_to_vector]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-184) · Environment-bound

### LC-NODE-184/B01

- Given: 合法 td_rotate_to_vector 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDRotateToVector(forward, up) 提供 TDRotateToVector；回傳型別/分量完整保留。

### LC-NODE-184/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-185 — TDRotateOnAxis [td_rotate_on_axis]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-185) · Environment-bound

### LC-NODE-185/B01

- Given: 合法 td_rotate_on_axis 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDRotateOnAxis(radians, axis) 提供 TDRotateOnAxis；回傳型別/分量完整保留。

### LC-NODE-185/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-186 — TDRotateX [td_rotate_x]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-186) · Environment-bound

### LC-NODE-186/B01

- Given: 合法 td_rotate_x 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDRotateX(radians) 提供 TDRotateX；回傳型別/分量完整保留。

### LC-NODE-186/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-187 — TDRotateY [td_rotate_y]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-187) · Environment-bound

### LC-NODE-187/B01

- Given: 合法 td_rotate_y 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDRotateY(radians) 提供 TDRotateY；回傳型別/分量完整保留。

### LC-NODE-187/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-188 — TDRotateZ [td_rotate_z]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-188) · Environment-bound

### LC-NODE-188/B01

- Given: 合法 td_rotate_z 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDRotateZ(radians) 提供 TDRotateZ；回傳型別/分量完整保留。

### LC-NODE-188/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-189 — TDScale [td_scale]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-189) · Environment-bound

### LC-NODE-189/B01

- Given: 合法 td_scale 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDScale(x, y, z) 提供 TDScale；回傳型別/分量完整保留。

### LC-NODE-189/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-190 — TDTranslate [td_translate]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-190) · Environment-bound

### LC-NODE-190/B01

- Given: 合法 td_translate 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTranslate(x, y, z) 提供 TDTranslate；回傳型別/分量完整保留。

### LC-NODE-190/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-191 — TDCreateRotMatrix [td_create_rot_matrix]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-191) · Environment-bound

### LC-NODE-191/B01

- Given: 合法 td_create_rot_matrix 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDCreateRotMatrix(from, to) 提供 TDCreateRotMatrix；回傳型別/分量完整保留。

### LC-NODE-191/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-192 — TDCreateTBNMatrix [td_create_tbn_matrix]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-192) · Environment-bound

### LC-NODE-192/B01

- Given: 合法 td_create_tbn_matrix 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDCreateTBNMatrix(normal, tangent, handedness) 提供 TDCreateTBNMatrix；回傳型別/分量完整保留。

### LC-NODE-192/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-193 — TDFade [td_fade]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-193) · Environment-bound

### LC-NODE-193/B01

- Given: 合法 td_fade 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDFade(value) 提供 TDFade；回傳型別/分量完整保留。

### LC-NODE-193/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-194 — TDFadeDeriv [td_fade_deriv]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-194) · Environment-bound

### LC-NODE-194/B01

- Given: 合法 td_fade_deriv 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDFadeDeriv(value) 提供 TDFadeDeriv；回傳型別/分量完整保留。

### LC-NODE-194/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-195 — TDSineLookup [td_sine_lookup]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-195) · Environment-bound

### LC-NODE-195/B01

- Given: 合法 td_sine_lookup 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDSineLookup(value) 提供 TDSineLookup；回傳型別/分量完整保留。

### LC-NODE-195/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-196 — TDPerlinNoiseDeriv [td_perlin_noise_deriv]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-196) · Environment-bound

### LC-NODE-196/B01

- Given: 合法 td_perlin_noise_deriv 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDPerlinNoiseDeriv(position) 提供 TDPerlinNoiseDeriv；回傳型別/分量完整保留。

### LC-NODE-196/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-197 — TDPerlinNoiseDeriv [td_perlin_noise_deriv_noise]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-197) · Environment-bound

### LC-NODE-197/B01

- Given: 合法 td_perlin_noise_deriv_noise 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDPerlinNoiseDeriv(position) 提供 TDPerlinNoiseDeriv；同次呼叫另以 out arguments 提供 noise。

### LC-NODE-197/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-198 — TDSimplexNoiseDeriv [td_simplex_noise_deriv]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-198) · Environment-bound

### LC-NODE-198/B01

- Given: 合法 td_simplex_noise_deriv 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDSimplexNoiseDeriv(position) 提供 TDSimplexNoiseDeriv；回傳型別/分量完整保留。

### LC-NODE-198/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-199 — TDSimplexNoiseDeriv [td_simplex_noise_deriv_noise]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-199) · Environment-bound

### LC-NODE-199/B01

- Given: 合法 td_simplex_noise_deriv_noise 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDSimplexNoiseDeriv(position) 提供 TDSimplexNoiseDeriv；同次呼叫另以 out arguments 提供 noise。

### LC-NODE-199/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-200 — TDLuminance [td_luminance]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-200) · Environment-bound

### LC-NODE-200/B01

- Given: 合法 td_luminance 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDLuminance(color) 提供 TDLuminance；回傳型別/分量完整保留。

### LC-NODE-200/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-201 — TDGamutRec709ToRec2020 [td_gamut_rec709torec2020]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-201) · Environment-bound

### LC-NODE-201/B01

- Given: 合法 td_gamut_rec709torec2020 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDGamutRec709ToRec2020(color) 提供 TDGamutRec709ToRec2020；回傳型別/分量完整保留。

### LC-NODE-201/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-202 — TDGamutRec2020ToRec709 [td_gamut_rec2020torec709]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-202) · Environment-bound

### LC-NODE-202/B01

- Given: 合法 td_gamut_rec2020torec709 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDGamutRec2020ToRec709(color) 提供 TDGamutRec2020ToRec709；回傳型別/分量完整保留。

### LC-NODE-202/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-203 — TDTransferLinearToSRGB [td_transfer_lineartosrgb]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-203) · Environment-bound

### LC-NODE-203/B01

- Given: 合法 td_transfer_lineartosrgb 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferLinearToSRGB(color) 提供 TDTransferLinearToSRGB；回傳型別/分量完整保留。

### LC-NODE-203/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-204 — TDTransferSRGBToLinear [td_transfer_srgbtolinear]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-204) · Environment-bound

### LC-NODE-204/B01

- Given: 合法 td_transfer_srgbtolinear 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferSRGBToLinear(color) 提供 TDTransferSRGBToLinear；回傳型別/分量完整保留。

### LC-NODE-204/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-205 — TDTransferLinearToRec709 [td_transfer_lineartorec709]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-205) · Environment-bound

### LC-NODE-205/B01

- Given: 合法 td_transfer_lineartorec709 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferLinearToRec709(color) 提供 TDTransferLinearToRec709；回傳型別/分量完整保留。

### LC-NODE-205/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-206 — TDTransferRec709ToLinear [td_transfer_rec709tolinear]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-206) · Environment-bound

### LC-NODE-206/B01

- Given: 合法 td_transfer_rec709tolinear 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferRec709ToLinear(color) 提供 TDTransferRec709ToLinear；回傳型別/分量完整保留。

### LC-NODE-206/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-207 — TDTransferLinearToGamma1_8 [td_transfer_lineartogamma1_8]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-207) · Environment-bound

### LC-NODE-207/B01

- Given: 合法 td_transfer_lineartogamma1_8 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferLinearToGamma1_8(color) 提供 TDTransferLinearToGamma1_8；回傳型別/分量完整保留。

### LC-NODE-207/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-208 — TDTransferGamma1_8ToLinear [td_transfer_gamma1_8tolinear]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-208) · Environment-bound

### LC-NODE-208/B01

- Given: 合法 td_transfer_gamma1_8tolinear 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferGamma1_8ToLinear(color) 提供 TDTransferGamma1_8ToLinear；回傳型別/分量完整保留。

### LC-NODE-208/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-209 — TDTransferLinearToGamma2_2 [td_transfer_lineartogamma2_2]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-209) · Environment-bound

### LC-NODE-209/B01

- Given: 合法 td_transfer_lineartogamma2_2 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferLinearToGamma2_2(color) 提供 TDTransferLinearToGamma2_2；回傳型別/分量完整保留。

### LC-NODE-209/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-210 — TDTransferGamma2_2ToLinear [td_transfer_gamma2_2tolinear]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-210) · Environment-bound

### LC-NODE-210/B01

- Given: 合法 td_transfer_gamma2_2tolinear 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferGamma2_2ToLinear(color) 提供 TDTransferGamma2_2ToLinear；回傳型別/分量完整保留。

### LC-NODE-210/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-211 — TDTransferLinearToGamma2_4 [td_transfer_lineartogamma2_4]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-211) · Environment-bound

### LC-NODE-211/B01

- Given: 合法 td_transfer_lineartogamma2_4 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferLinearToGamma2_4(color) 提供 TDTransferLinearToGamma2_4；回傳型別/分量完整保留。

### LC-NODE-211/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-212 — TDTransferGamma2_4ToLinear [td_transfer_gamma2_4tolinear]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-212) · Environment-bound

### LC-NODE-212/B01

- Given: 合法 td_transfer_gamma2_4tolinear 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferGamma2_4ToLinear(color) 提供 TDTransferGamma2_4ToLinear；回傳型別/分量完整保留。

### LC-NODE-212/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-213 — TDTransferLinearToGamma2_6 [td_transfer_lineartogamma2_6]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-213) · Environment-bound

### LC-NODE-213/B01

- Given: 合法 td_transfer_lineartogamma2_6 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferLinearToGamma2_6(color) 提供 TDTransferLinearToGamma2_6；回傳型別/分量完整保留。

### LC-NODE-213/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-214 — TDTransferGamma2_6ToLinear [td_transfer_gamma2_6tolinear]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-214) · Environment-bound

### LC-NODE-214/B01

- Given: 合法 td_transfer_gamma2_6tolinear 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferGamma2_6ToLinear(color) 提供 TDTransferGamma2_6ToLinear；回傳型別/分量完整保留。

### LC-NODE-214/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-215 — TDTransferLinearToGamma2_8 [td_transfer_lineartogamma2_8]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-215) · Environment-bound

### LC-NODE-215/B01

- Given: 合法 td_transfer_lineartogamma2_8 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferLinearToGamma2_8(color) 提供 TDTransferLinearToGamma2_8；回傳型別/分量完整保留。

### LC-NODE-215/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-216 — TDTransferGamma2_8ToLinear [td_transfer_gamma2_8tolinear]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-216) · Environment-bound

### LC-NODE-216/B01

- Given: 合法 td_transfer_gamma2_8tolinear 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferGamma2_8ToLinear(color) 提供 TDTransferGamma2_8ToLinear；回傳型別/分量完整保留。

### LC-NODE-216/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-217 — TDTransferLinearToACESproxy [td_transfer_lineartoacesproxy]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-217) · Environment-bound

### LC-NODE-217/B01

- Given: 合法 td_transfer_lineartoacesproxy 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferLinearToACESproxy(color) 提供 TDTransferLinearToACESproxy；回傳型別/分量完整保留。

### LC-NODE-217/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-218 — TDTransferACESproxyToLinear [td_transfer_acesproxytolinear]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-218) · Environment-bound

### LC-NODE-218/B01

- Given: 合法 td_transfer_acesproxytolinear 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferACESproxyToLinear(color) 提供 TDTransferACESproxyToLinear；回傳型別/分量完整保留。

### LC-NODE-218/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-219 — TDTransferLinearToST2084PQ [td_transfer_lineartost2084pq]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-219) · Environment-bound

### LC-NODE-219/B01

- Given: 合法 td_transfer_lineartost2084pq 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferLinearToST2084PQ(color, referenceWhiteNits) 提供 TDTransferLinearToST2084PQ；回傳型別/分量完整保留。

### LC-NODE-219/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-220 — TDTransferST2084PQToLinear [td_transfer_st2084pqtolinear]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-220) · Environment-bound

### LC-NODE-220/B01

- Given: 合法 td_transfer_st2084pqtolinear 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferST2084PQToLinear(color, referenceWhiteNits) 提供 TDTransferST2084PQToLinear；回傳型別/分量完整保留。

### LC-NODE-220/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-221 — TDTransferLinearToBT2100HLG [td_transfer_lineartobt2100hlg]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-221) · Environment-bound

### LC-NODE-221/B01

- Given: 合法 td_transfer_lineartobt2100hlg 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferLinearToBT2100HLG(color, peakNits, referenceWhiteNits) 提供 TDTransferLinearToBT2100HLG；回傳型別/分量完整保留。

### LC-NODE-221/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-222 — TDTransferBT2100HLGToLinear [td_transfer_bt2100hlgtolinear]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-222) · Environment-bound

### LC-NODE-222/B01

- Given: 合法 td_transfer_bt2100hlgtolinear 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTransferBT2100HLGToLinear(color, peakNits, referenceWhiteNits) 提供 TDTransferBT2100HLGToLinear；回傳型別/分量完整保留。

### LC-NODE-222/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-223 — TDTriplanarBlend [td_triplanar_blend]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-223) · Environment-bound

### LC-NODE-223/B01

- Given: 合法 td_triplanar_blend 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTriplanarBlend(normal, xcolor, ycolor, zcolor, blendPower) 提供 TDTriplanarBlend；回傳型別/分量完整保留。

### LC-NODE-223/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-224 — TDBicubicInterpolation · sampler2D [td_bicubic]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-224) · Environment-bound

### LC-NODE-224/B01

- Given: 合法 td_bicubic 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDBicubicInterpolation(sampler, uv) 提供 TDBicubicInterpolation · sampler2D；回傳型別/分量完整保留。

### LC-NODE-224/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-225 — TDBicubicInterpolation · sampler2D · Size [td_bicubic_size]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-225) · Environment-bound

### LC-NODE-225/B01

- Given: 合法 td_bicubic_size 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDBicubicInterpolation(sampler, uv, size, inverseSize) 提供 TDBicubicInterpolation · sampler2D · Size；回傳型別/分量完整保留。

### LC-NODE-225/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-226 — TDTricubicInterpolation · sampler3D [td_tricubic]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-226) · Environment-bound

### LC-NODE-226/B01

- Given: 合法 td_tricubic 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTricubicInterpolation(sampler, uv) 提供 TDTricubicInterpolation · sampler3D；回傳型別/分量完整保留。

### LC-NODE-226/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-227 — TDTricubicInterpolation · sampler3D · Size [td_tricubic_size]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-227) · Environment-bound

### LC-NODE-227/B01

- Given: 合法 td_tricubic_size 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTricubicInterpolation(sampler, uv, size, inverseSize) 提供 TDTricubicInterpolation · sampler3D · Size；回傳型別/分量完整保留。

### LC-NODE-227/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-228 — TDTexGenSphere [td_texgen_sphere]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-228) · Environment-bound

### LC-NODE-228/B01

- Given: 合法 td_texgen_sphere 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDTexGenSphere(direction) 提供 TDTexGenSphere；回傳型別/分量完整保留。

### LC-NODE-228/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-229 — TDEquirectangularToCubeMap [td_equirectangular_to_cube]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-229) · Environment-bound

### LC-NODE-229/B01

- Given: 合法 td_equirectangular_to_cube 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDEquirectangularToCubeMap(uv) 提供 TDEquirectangularToCubeMap；回傳型別/分量完整保留。

### LC-NODE-229/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-230 — TDCubeMapToEquirectangular [td_cube_to_equirectangular]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-230) · Environment-bound

### LC-NODE-230/B01

- Given: 合法 td_cube_to_equirectangular 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDCubeMapToEquirectangular(direction) 提供 TDCubeMapToEquirectangular；同次呼叫另以 out arguments 提供 mipMapBias。

### LC-NODE-230/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-231 — TDDeformNorm [td_deform_normal]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-231) · Environment-bound

### LC-NODE-231/B01

- Given: 合法 td_deform_normal 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDDeformNorm(value) 提供 TDDeformNorm；回傳型別/分量完整保留。

### LC-NODE-231/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-232 — TDDeformVec [td_deform_vector]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-232) · Environment-bound

### LC-NODE-232/B01

- Given: 合法 td_deform_vector 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDDeformVec(value) 提供 TDDeformVec；回傳型別/分量完整保留。

### LC-NODE-232/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-233 — TDSkinnedDeform [td_skinned_deform]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-233) · Environment-bound

### LC-NODE-233/B01

- Given: 合法 td_skinned_deform 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDSkinnedDeform(value) 提供 TDSkinnedDeform；回傳型別/分量完整保留。

### LC-NODE-233/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-234 — TDSkinnedDeformVec [td_skinned_vector]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-234) · Environment-bound

### LC-NODE-234/B01

- Given: 合法 td_skinned_vector 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDSkinnedDeformVec(value) 提供 TDSkinnedDeformVec；回傳型別/分量完整保留。

### LC-NODE-234/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-235 — TDInstanceDeform [td_instance_deform]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-235) · Environment-bound

### LC-NODE-235/B01

- Given: 合法 td_instance_deform 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDInstanceDeform(value) 提供 TDInstanceDeform；回傳型別/分量完整保留。

### LC-NODE-235/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-236 — TDInstanceDeformVec [td_instance_vector]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-236) · Environment-bound

### LC-NODE-236/B01

- Given: 合法 td_instance_vector 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDInstanceDeformVec(value) 提供 TDInstanceDeformVec；回傳型別/分量完整保留。

### LC-NODE-236/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-237 — TDDeform · Instance [td_deform_instance]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-237) · Environment-bound

### LC-NODE-237/B01

- Given: 合法 td_deform_instance 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDDeform(instance, position) 提供 TDDeform · Instance；回傳型別/分量完整保留。

### LC-NODE-237/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-238 — TDDeformNorm · Instance [td_deform_normal_instance]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-238) · Environment-bound

### LC-NODE-238/B01

- Given: 合法 td_deform_normal_instance 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDDeformNorm(instance, normal) 提供 TDDeformNorm · Instance；回傳型別/分量完整保留。

### LC-NODE-238/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-239 — TDDeformVec · Instance [td_deform_vector_instance]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-239) · Environment-bound

### LC-NODE-239/B01

- Given: 合法 td_deform_vector_instance 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDDeformVec(instance, vector) 提供 TDDeformVec · Instance；回傳型別/分量完整保留。

### LC-NODE-239/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-240 — TDInstanceTexCoord [td_instance_texcoord]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-240) · Environment-bound

### LC-NODE-240/B01

- Given: 合法 td_instance_texcoord 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDInstanceTexCoord(instance, uv) 提供 TDInstanceTexCoord；回傳型別/分量完整保留。

### LC-NODE-240/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-241 — TDQuadReproject [td_quad_reproject]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-241) · Environment-bound

### LC-NODE-241/B01

- Given: 合法 td_quad_reproject 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDQuadReproject(position, camera) 提供 TDQuadReproject；回傳型別/分量完整保留。

### LC-NODE-241/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-242 — TDWorldToProj [td_world_to_proj_uv]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-242) · Environment-bound

### LC-NODE-242/B01

- Given: 合法 td_world_to_proj_uv 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDWorldToProj(position, uv) 提供 TDWorldToProj；回傳型別/分量完整保留。

### LC-NODE-242/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-243 — TDFrontFacing [td_front_facing]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-243) · Environment-bound

### LC-NODE-243/B01

- Given: 合法 td_front_facing 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDFrontFacing(position, normal) 提供 TDFrontFacing；回傳型別/分量完整保留。

### LC-NODE-243/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-244 — TDPixelColor [td_pixel_color]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-244) · Environment-bound

### LC-NODE-244/B01

- Given: 合法 td_pixel_color 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDPixelColor(color) 提供 TDPixelColor；回傳型別/分量完整保留。

### LC-NODE-244/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-245 — TDFog [td_fog]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-245) · Environment-bound

### LC-NODE-245/B01

- Given: 合法 td_fog 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDFog(color, position, camera) 提供 TDFog；回傳型別/分量完整保留。

### LC-NODE-245/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-246 — TDHardShadow [td_hardshadow]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-246) · Environment-bound

### LC-NODE-246/B01

- Given: 合法 td_hardshadow 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDHardShadow(light, position) 提供 TDHardShadow；回傳型別/分量完整保留。

### LC-NODE-246/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-247 — TDSoftShadow [td_softshadow]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-247) · Environment-bound

### LC-NODE-247/B01

- Given: 合法 td_softshadow 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDSoftShadow(light, position, samples, searchSteps) 提供 TDSoftShadow；回傳型別/分量完整保留。

### LC-NODE-247/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-248 — TDProjMap [td_projmap]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-248) · Environment-bound

### LC-NODE-248/B01

- Given: 合法 td_projmap 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDProjMap(light, position, defaultColor) 提供 TDProjMap；回傳型別/分量完整保留。

### LC-NODE-248/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-249 — TDCompareShadowTexture [td_compareshadowtexture]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-249) · Environment-bound

### LC-NODE-249/B01

- Given: 合法 td_compareshadowtexture 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDCompareShadowTexture(light, uv, depth) 提供 TDCompareShadowTexture；回傳型別/分量完整保留。

### LC-NODE-249/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-250 — TDCompareShadowTextureProj [td_compareshadowtextureproj]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-250) · Environment-bound

### LC-NODE-250/B01

- Given: 合法 td_compareshadowtextureproj 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDCompareShadowTextureProj(light, uv) 提供 TDCompareShadowTextureProj；回傳型別/分量完整保留。

### LC-NODE-250/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-251 — TDShadowTexture [td_shadowtexture]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-251) · Environment-bound

### LC-NODE-251/B01

- Given: 合法 td_shadowtexture 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDShadowTexture(light, uv) 提供 TDShadowTexture；回傳型別/分量完整保留。

### LC-NODE-251/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-252 — TDShadowTextureProj [td_shadowtextureproj]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-252) · Environment-bound

### LC-NODE-252/B01

- Given: 合法 td_shadowtextureproj 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDShadowTextureProj(light, uv) 提供 TDShadowTextureProj；回傳型別/分量完整保留。

### LC-NODE-252/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-253 — TDProjTexture [td_projtexture]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-253) · Environment-bound

### LC-NODE-253/B01

- Given: 合法 td_projtexture 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDProjTexture(light, uv, bias) 提供 TDProjTexture；回傳型別/分量完整保留。

### LC-NODE-253/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-254 — TDProjTextureProj [td_projtextureproj]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-254) · Environment-bound

### LC-NODE-254/B01

- Given: 合法 td_projtextureproj 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDProjTextureProj(light, uv) 提供 TDProjTextureProj；回傳型別/分量完整保留。

### LC-NODE-254/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-255 — TDConeLookup [td_conelookup]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-255) · Environment-bound

### LC-NODE-255/B01

- Given: 合法 td_conelookup 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDConeLookup(light, coord) 提供 TDConeLookup；回傳型別/分量完整保留。

### LC-NODE-255/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-256 — TDEnvLightTextureLod [td_env_light_texture]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-256) · Environment-bound

### LC-NODE-256/B01

- Given: 合法 td_env_light_texture 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDEnvLightTextureLod(light, uv, lod) 提供 TDEnvLightTextureLod；回傳型別/分量完整保留。

### LC-NODE-256/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-257 — TDAttenuateLight [td_attenuate_light]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-257) · Environment-bound

### LC-NODE-257/B01

- Given: 合法 td_attenuate_light 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDAttenuateLight(light, distance) 提供 TDAttenuateLight；回傳型別/分量完整保留。

### LC-NODE-257/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-258 — TDInstanceColor [td_instance_color]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-258) · Environment-bound

### LC-NODE-258/B01

- Given: 合法 td_instance_color 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDInstanceColor(instance, color) 提供 TDInstanceColor；回傳型別/分量完整保留。

### LC-NODE-258/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-259 — TDInstanceTexture [td_instance_texture]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-259) · Environment-bound

### LC-NODE-259/B01

- Given: 合法 td_instance_texture 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDInstanceTexture(index, uv) 提供 TDInstanceTexture；回傳型別/分量完整保留。

### LC-NODE-259/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-260 — textureSize · sampler1D [texture_size_1d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-260) · Portable

### LC-NODE-260/B01

- Given: 合法 texture_size_1d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureSize(sampler, lod) 提供 textureSize · sampler1D；回傳型別/分量完整保留。

### LC-NODE-260/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-261 — textureQueryLevels · sampler1D [texture_levels_1d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-261) · Portable

### LC-NODE-261/B01

- Given: 合法 texture_levels_1d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureQueryLevels(sampler) 提供 textureQueryLevels · sampler1D；回傳型別/分量完整保留。

### LC-NODE-261/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-262 — texture · sampler1D [texture_sample_1d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-262) · Portable

### LC-NODE-262/B01

- Given: 合法 texture_sample_1d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 texture(sampler, uv) 提供 texture · sampler1D；回傳型別/分量完整保留。

### LC-NODE-262/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-263 — textureLod · sampler1D [texture_lod_1d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-263) · Portable

### LC-NODE-263/B01

- Given: 合法 texture_lod_1d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureLod(sampler, uv, lod) 提供 textureLod · sampler1D；回傳型別/分量完整保留。

### LC-NODE-263/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-264 — texture · sampler1D · Bias [texture_bias_1d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-264) · Portable

### LC-NODE-264/B01

- Given: 合法 texture_bias_1d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 texture(sampler, uv, bias) 提供 texture · sampler1D · Bias；回傳型別/分量完整保留。

### LC-NODE-264/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-265 — textureGrad · sampler1D [texture_grad_1d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-265) · Portable

### LC-NODE-265/B01

- Given: 合法 texture_grad_1d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureGrad(sampler, uv, dx, dy) 提供 textureGrad · sampler1D；回傳型別/分量完整保留。

### LC-NODE-265/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-266 — texelFetch · sampler1D [texel_fetch_1d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-266) · Portable

### LC-NODE-266/B01

- Given: 合法 texel_fetch_1d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 texelFetch(sampler, coord, lod) 提供 texelFetch · sampler1D；回傳型別/分量完整保留。

### LC-NODE-266/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-267 — textureProj · sampler1D [texture_proj_1d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-267) · Portable

### LC-NODE-267/B01

- Given: 合法 texture_proj_1d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureProj(sampler, uv) 提供 textureProj · sampler1D；回傳型別/分量完整保留。

### LC-NODE-267/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-268 — textureQueryLod · sampler1D [texture_query_lod_1d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-268) · Portable

### LC-NODE-268/B01

- Given: 合法 texture_query_lod_1d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureQueryLod(sampler, uv) 提供 textureQueryLod · sampler1D；回傳型別/分量完整保留。

### LC-NODE-268/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-269 — textureOffset · sampler1D [texture_offset_1d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-269) · Portable

### LC-NODE-269/B01

- Given: 合法 texture_offset_1d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureOffset(sampler, uv, offset) 提供 textureOffset · sampler1D；回傳型別/分量完整保留。

### LC-NODE-269/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-270 — textureLodOffset · sampler1D [texture_lod_offset_1d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-270) · Portable

### LC-NODE-270/B01

- Given: 合法 texture_lod_offset_1d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureLodOffset(sampler, uv, lod, offset) 提供 textureLodOffset · sampler1D；回傳型別/分量完整保留。

### LC-NODE-270/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-271 — textureGradOffset · sampler1D [texture_grad_offset_1d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-271) · Portable

### LC-NODE-271/B01

- Given: 合法 texture_grad_offset_1d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureGradOffset(sampler, uv, dx, dy, offset) 提供 textureGradOffset · sampler1D；回傳型別/分量完整保留。

### LC-NODE-271/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-272 — texelFetchOffset · sampler1D [texel_fetch_offset_1d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-272) · Portable

### LC-NODE-272/B01

- Given: 合法 texel_fetch_offset_1d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 texelFetchOffset(sampler, coord, lod, offset) 提供 texelFetchOffset · sampler1D；回傳型別/分量完整保留。

### LC-NODE-272/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-273 — textureProjLod · sampler1D [texture_proj_lod_1d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-273) · Portable

### LC-NODE-273/B01

- Given: 合法 texture_proj_lod_1d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureProjLod(sampler, uv, lod) 提供 textureProjLod · sampler1D；回傳型別/分量完整保留。

### LC-NODE-273/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-274 — textureProjGrad · sampler1D [texture_proj_grad_1d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-274) · Portable

### LC-NODE-274/B01

- Given: 合法 texture_proj_grad_1d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureProjGrad(sampler, uv, dx, dy) 提供 textureProjGrad · sampler1D；回傳型別/分量完整保留。

### LC-NODE-274/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-275 — textureSize · sampler2D [texture_size_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-275) · Portable

### LC-NODE-275/B01

- Given: 合法 texture_size_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureSize(sampler, lod) 提供 textureSize · sampler2D；回傳型別/分量完整保留。

### LC-NODE-275/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-276 — textureQueryLevels · sampler2D [texture_levels_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-276) · Portable

### LC-NODE-276/B01

- Given: 合法 texture_levels_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureQueryLevels(sampler) 提供 textureQueryLevels · sampler2D；回傳型別/分量完整保留。

### LC-NODE-276/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-277 — texture · sampler2D [texture_sample_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-277) · Portable

### LC-NODE-277/B01

- Given: 合法 texture_sample_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 texture(sampler, uv) 提供 texture · sampler2D；回傳型別/分量完整保留。

### LC-NODE-277/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-278 — textureLod · sampler2D [texture_lod_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-278) · Portable

### LC-NODE-278/B01

- Given: 合法 texture_lod_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureLod(sampler, uv, lod) 提供 textureLod · sampler2D；回傳型別/分量完整保留。

### LC-NODE-278/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-279 — texture · sampler2D · Bias [texture_bias_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-279) · Portable

### LC-NODE-279/B01

- Given: 合法 texture_bias_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 texture(sampler, uv, bias) 提供 texture · sampler2D · Bias；回傳型別/分量完整保留。

### LC-NODE-279/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-280 — textureGrad · sampler2D [texture_grad_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-280) · Portable

### LC-NODE-280/B01

- Given: 合法 texture_grad_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureGrad(sampler, uv, dx, dy) 提供 textureGrad · sampler2D；回傳型別/分量完整保留。

### LC-NODE-280/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-281 — texelFetch · sampler2D [texel_fetch_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-281) · Portable

### LC-NODE-281/B01

- Given: 合法 texel_fetch_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 texelFetch(sampler, coord, lod) 提供 texelFetch · sampler2D；回傳型別/分量完整保留。

### LC-NODE-281/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-282 — textureProj · sampler2D [texture_proj_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-282) · Portable

### LC-NODE-282/B01

- Given: 合法 texture_proj_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureProj(sampler, uv) 提供 textureProj · sampler2D；回傳型別/分量完整保留。

### LC-NODE-282/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-283 — textureQueryLod · sampler2D [texture_query_lod_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-283) · Portable

### LC-NODE-283/B01

- Given: 合法 texture_query_lod_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureQueryLod(sampler, uv) 提供 textureQueryLod · sampler2D；回傳型別/分量完整保留。

### LC-NODE-283/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-284 — textureGather · sampler2D [texture_gather_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-284) · Portable

### LC-NODE-284/B01

- Given: 合法 texture_gather_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureGather(sampler, uv, component) 提供 textureGather · sampler2D；回傳型別/分量完整保留。

### LC-NODE-284/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 component 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-285 — textureOffset · sampler2D [texture_offset_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-285) · Portable

### LC-NODE-285/B01

- Given: 合法 texture_offset_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureOffset(sampler, uv, offset) 提供 textureOffset · sampler2D；回傳型別/分量完整保留。

### LC-NODE-285/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-286 — textureLodOffset · sampler2D [texture_lod_offset_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-286) · Portable

### LC-NODE-286/B01

- Given: 合法 texture_lod_offset_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureLodOffset(sampler, uv, lod, offset) 提供 textureLodOffset · sampler2D；回傳型別/分量完整保留。

### LC-NODE-286/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-287 — textureGradOffset · sampler2D [texture_grad_offset_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-287) · Portable

### LC-NODE-287/B01

- Given: 合法 texture_grad_offset_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureGradOffset(sampler, uv, dx, dy, offset) 提供 textureGradOffset · sampler2D；回傳型別/分量完整保留。

### LC-NODE-287/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-288 — texelFetchOffset · sampler2D [texel_fetch_offset_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-288) · Portable

### LC-NODE-288/B01

- Given: 合法 texel_fetch_offset_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 texelFetchOffset(sampler, coord, lod, offset) 提供 texelFetchOffset · sampler2D；回傳型別/分量完整保留。

### LC-NODE-288/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-289 — textureProjLod · sampler2D [texture_proj_lod_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-289) · Portable

### LC-NODE-289/B01

- Given: 合法 texture_proj_lod_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureProjLod(sampler, uv, lod) 提供 textureProjLod · sampler2D；回傳型別/分量完整保留。

### LC-NODE-289/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-290 — textureProjGrad · sampler2D [texture_proj_grad_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-290) · Portable

### LC-NODE-290/B01

- Given: 合法 texture_proj_grad_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureProjGrad(sampler, uv, dx, dy) 提供 textureProjGrad · sampler2D；回傳型別/分量完整保留。

### LC-NODE-290/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-291 — textureSize · sampler3D [texture_size_3d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-291) · Portable

### LC-NODE-291/B01

- Given: 合法 texture_size_3d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureSize(sampler, lod) 提供 textureSize · sampler3D；回傳型別/分量完整保留。

### LC-NODE-291/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-292 — textureQueryLevels · sampler3D [texture_levels_3d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-292) · Portable

### LC-NODE-292/B01

- Given: 合法 texture_levels_3d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureQueryLevels(sampler) 提供 textureQueryLevels · sampler3D；回傳型別/分量完整保留。

### LC-NODE-292/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-293 — texture · sampler3D [texture_sample_3d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-293) · Portable

### LC-NODE-293/B01

- Given: 合法 texture_sample_3d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 texture(sampler, uv) 提供 texture · sampler3D；回傳型別/分量完整保留。

### LC-NODE-293/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-294 — textureLod · sampler3D [texture_lod_3d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-294) · Portable

### LC-NODE-294/B01

- Given: 合法 texture_lod_3d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureLod(sampler, uv, lod) 提供 textureLod · sampler3D；回傳型別/分量完整保留。

### LC-NODE-294/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-295 — texture · sampler3D · Bias [texture_bias_3d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-295) · Portable

### LC-NODE-295/B01

- Given: 合法 texture_bias_3d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 texture(sampler, uv, bias) 提供 texture · sampler3D · Bias；回傳型別/分量完整保留。

### LC-NODE-295/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-296 — textureGrad · sampler3D [texture_grad_3d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-296) · Portable

### LC-NODE-296/B01

- Given: 合法 texture_grad_3d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureGrad(sampler, uv, dx, dy) 提供 textureGrad · sampler3D；回傳型別/分量完整保留。

### LC-NODE-296/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-297 — texelFetch · sampler3D [texel_fetch_3d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-297) · Portable

### LC-NODE-297/B01

- Given: 合法 texel_fetch_3d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 texelFetch(sampler, coord, lod) 提供 texelFetch · sampler3D；回傳型別/分量完整保留。

### LC-NODE-297/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-298 — textureProj · sampler3D [texture_proj_3d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-298) · Portable

### LC-NODE-298/B01

- Given: 合法 texture_proj_3d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureProj(sampler, uv) 提供 textureProj · sampler3D；回傳型別/分量完整保留。

### LC-NODE-298/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-299 — textureQueryLod · sampler3D [texture_query_lod_3d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-299) · Portable

### LC-NODE-299/B01

- Given: 合法 texture_query_lod_3d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureQueryLod(sampler, uv) 提供 textureQueryLod · sampler3D；回傳型別/分量完整保留。

### LC-NODE-299/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-300 — textureOffset · sampler3D [texture_offset_3d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-300) · Portable

### LC-NODE-300/B01

- Given: 合法 texture_offset_3d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureOffset(sampler, uv, offset) 提供 textureOffset · sampler3D；回傳型別/分量完整保留。

### LC-NODE-300/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-301 — textureLodOffset · sampler3D [texture_lod_offset_3d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-301) · Portable

### LC-NODE-301/B01

- Given: 合法 texture_lod_offset_3d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureLodOffset(sampler, uv, lod, offset) 提供 textureLodOffset · sampler3D；回傳型別/分量完整保留。

### LC-NODE-301/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-302 — textureGradOffset · sampler3D [texture_grad_offset_3d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-302) · Portable

### LC-NODE-302/B01

- Given: 合法 texture_grad_offset_3d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureGradOffset(sampler, uv, dx, dy, offset) 提供 textureGradOffset · sampler3D；回傳型別/分量完整保留。

### LC-NODE-302/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-303 — texelFetchOffset · sampler3D [texel_fetch_offset_3d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-303) · Portable

### LC-NODE-303/B01

- Given: 合法 texel_fetch_offset_3d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 texelFetchOffset(sampler, coord, lod, offset) 提供 texelFetchOffset · sampler3D；回傳型別/分量完整保留。

### LC-NODE-303/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-304 — textureProjLod · sampler3D [texture_proj_lod_3d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-304) · Portable

### LC-NODE-304/B01

- Given: 合法 texture_proj_lod_3d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureProjLod(sampler, uv, lod) 提供 textureProjLod · sampler3D；回傳型別/分量完整保留。

### LC-NODE-304/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-305 — textureProjGrad · sampler3D [texture_proj_grad_3d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-305) · Portable

### LC-NODE-305/B01

- Given: 合法 texture_proj_grad_3d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureProjGrad(sampler, uv, dx, dy) 提供 textureProjGrad · sampler3D；回傳型別/分量完整保留。

### LC-NODE-305/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-306 — textureSize · sampler2DArray [texture_size_2darray]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-306) · Portable

### LC-NODE-306/B01

- Given: 合法 texture_size_2darray 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureSize(sampler, lod) 提供 textureSize · sampler2DArray；回傳型別/分量完整保留。

### LC-NODE-306/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-307 — textureQueryLevels · sampler2DArray [texture_levels_2darray]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-307) · Portable

### LC-NODE-307/B01

- Given: 合法 texture_levels_2darray 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureQueryLevels(sampler) 提供 textureQueryLevels · sampler2DArray；回傳型別/分量完整保留。

### LC-NODE-307/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-308 — texture · sampler2DArray [texture_sample_2darray]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-308) · Portable

### LC-NODE-308/B01

- Given: 合法 texture_sample_2darray 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 texture(sampler, uv) 提供 texture · sampler2DArray；回傳型別/分量完整保留。

### LC-NODE-308/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-309 — textureLod · sampler2DArray [texture_lod_2darray]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-309) · Portable

### LC-NODE-309/B01

- Given: 合法 texture_lod_2darray 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureLod(sampler, uv, lod) 提供 textureLod · sampler2DArray；回傳型別/分量完整保留。

### LC-NODE-309/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-310 — texture · sampler2DArray · Bias [texture_bias_2darray]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-310) · Portable

### LC-NODE-310/B01

- Given: 合法 texture_bias_2darray 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 texture(sampler, uv, bias) 提供 texture · sampler2DArray · Bias；回傳型別/分量完整保留。

### LC-NODE-310/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-311 — textureGrad · sampler2DArray [texture_grad_2darray]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-311) · Portable

### LC-NODE-311/B01

- Given: 合法 texture_grad_2darray 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureGrad(sampler, uv, dx, dy) 提供 textureGrad · sampler2DArray；回傳型別/分量完整保留。

### LC-NODE-311/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-312 — texelFetch · sampler2DArray [texel_fetch_2darray]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-312) · Portable

### LC-NODE-312/B01

- Given: 合法 texel_fetch_2darray 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 texelFetch(sampler, coord, lod) 提供 texelFetch · sampler2DArray；回傳型別/分量完整保留。

### LC-NODE-312/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-313 — textureQueryLod · sampler2DArray [texture_query_lod_2darray]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-313) · Portable

### LC-NODE-313/B01

- Given: 合法 texture_query_lod_2darray 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureQueryLod(sampler, uv) 提供 textureQueryLod · sampler2DArray；回傳型別/分量完整保留。

### LC-NODE-313/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-314 — textureGather · sampler2DArray [texture_gather_2darray]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-314) · Portable

### LC-NODE-314/B01

- Given: 合法 texture_gather_2darray 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureGather(sampler, uv, component) 提供 textureGather · sampler2DArray；回傳型別/分量完整保留。

### LC-NODE-314/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 component 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-315 — textureOffset · sampler2DArray [texture_offset_2darray]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-315) · Portable

### LC-NODE-315/B01

- Given: 合法 texture_offset_2darray 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureOffset(sampler, uv, offset) 提供 textureOffset · sampler2DArray；回傳型別/分量完整保留。

### LC-NODE-315/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-316 — textureLodOffset · sampler2DArray [texture_lod_offset_2darray]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-316) · Portable

### LC-NODE-316/B01

- Given: 合法 texture_lod_offset_2darray 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureLodOffset(sampler, uv, lod, offset) 提供 textureLodOffset · sampler2DArray；回傳型別/分量完整保留。

### LC-NODE-316/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-317 — textureGradOffset · sampler2DArray [texture_grad_offset_2darray]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-317) · Portable

### LC-NODE-317/B01

- Given: 合法 texture_grad_offset_2darray 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureGradOffset(sampler, uv, dx, dy, offset) 提供 textureGradOffset · sampler2DArray；回傳型別/分量完整保留。

### LC-NODE-317/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-318 — texelFetchOffset · sampler2DArray [texel_fetch_offset_2darray]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-318) · Portable

### LC-NODE-318/B01

- Given: 合法 texel_fetch_offset_2darray 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 texelFetchOffset(sampler, coord, lod, offset) 提供 texelFetchOffset · sampler2DArray；回傳型別/分量完整保留。

### LC-NODE-318/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-319 — textureSize · samplerCube [texture_size_cube]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-319) · Portable

### LC-NODE-319/B01

- Given: 合法 texture_size_cube 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureSize(sampler, lod) 提供 textureSize · samplerCube；回傳型別/分量完整保留。

### LC-NODE-319/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-320 — textureQueryLevels · samplerCube [texture_levels_cube]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-320) · Portable

### LC-NODE-320/B01

- Given: 合法 texture_levels_cube 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureQueryLevels(sampler) 提供 textureQueryLevels · samplerCube；回傳型別/分量完整保留。

### LC-NODE-320/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-321 — texture · samplerCube [texture_sample_cube]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-321) · Portable

### LC-NODE-321/B01

- Given: 合法 texture_sample_cube 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 texture(sampler, uv) 提供 texture · samplerCube；回傳型別/分量完整保留。

### LC-NODE-321/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-322 — textureLod · samplerCube [texture_lod_cube]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-322) · Portable

### LC-NODE-322/B01

- Given: 合法 texture_lod_cube 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureLod(sampler, uv, lod) 提供 textureLod · samplerCube；回傳型別/分量完整保留。

### LC-NODE-322/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-323 — texture · samplerCube · Bias [texture_bias_cube]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-323) · Portable

### LC-NODE-323/B01

- Given: 合法 texture_bias_cube 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 texture(sampler, uv, bias) 提供 texture · samplerCube · Bias；回傳型別/分量完整保留。

### LC-NODE-323/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-324 — textureGrad · samplerCube [texture_grad_cube]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-324) · Portable

### LC-NODE-324/B01

- Given: 合法 texture_grad_cube 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureGrad(sampler, uv, dx, dy) 提供 textureGrad · samplerCube；回傳型別/分量完整保留。

### LC-NODE-324/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-325 — textureQueryLod · samplerCube [texture_query_lod_cube]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-325) · Portable

### LC-NODE-325/B01

- Given: 合法 texture_query_lod_cube 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureQueryLod(sampler, uv) 提供 textureQueryLod · samplerCube；回傳型別/分量完整保留。

### LC-NODE-325/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-326 — textureGather · samplerCube [texture_gather_cube]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-326) · Portable

### LC-NODE-326/B01

- Given: 合法 texture_gather_cube 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureGather(sampler, uv, component) 提供 textureGather · samplerCube；回傳型別/分量完整保留。

### LC-NODE-326/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 component 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-327 — textureSize · samplerBuffer [texture_size_buffer]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-327) · Portable

### LC-NODE-327/B01

- Given: 合法 texture_size_buffer 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureSize(sampler) 提供 textureSize · samplerBuffer；回傳型別/分量完整保留。

### LC-NODE-327/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-328 — TDLighting [td_lighting]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-328) · Environment-bound

### LC-NODE-328/B01

- Given: 合法 td_lighting 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 呼叫單盞 TDLighting(light, position, normal, shadowStrength, shadowColor, view, shininess, shininess2)，將回傳 TDPhongResult 拆為宣告的 diffuse/specular/shadowStrength（Phong另specular2）。

### LC-NODE-328/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：不自行加總所有燈，不額外加入ambient或alpha，不重新宣告TD內建結果struct。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-329 — TDLightingPBR [td_lighting_pbr]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-329) · Environment-bound

### LC-NODE-329/B01

- Given: 合法 td_lighting_pbr 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 呼叫單盞 TDLightingPBR(light, diffuseColor, specularColor, position, normal, shadowStrength, shadowColor, view, roughness)，將回傳 TDPBRResult 拆為宣告的 diffuse/specular/shadowStrength（Phong另specular2）。

### LC-NODE-329/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：不自行加總所有燈，不額外加入ambient或alpha，不重新宣告TD內建結果struct。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-330 — TDEnvLightingPBR [td_env_lighting_pbr]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-330) · Environment-bound

### LC-NODE-330/B01

- Given: 合法 td_env_lighting_pbr 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 呼叫單盞 TDEnvLightingPBR(light, diffuseColor, specularColor, normal, view, roughness, ambientOcclusion)，將回傳 TDPBRResult 拆為宣告的 diffuse/specular/shadowStrength（Phong另specular2）。

### LC-NODE-330/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：不自行加總所有燈，不額外加入ambient或alpha，不重新宣告TD內建結果struct。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-331 — Phong Material [material_phong]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-331) · Environment-bound

### LC-NODE-331/B01

- Given: 合法 material_phong 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: Phong 材質：加總所有 TDLighting 的 diffuse/specular；diffuse=(sumDiffuse+ambientColor*ambient)*baseColor，specular=sumSpecular*specularColor；out=vec4(diffuse+specular+emission,alpha)。

### LC-NODE-331/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：shininess 同時傳入 TDLighting 兩個高光指數但本節點只採第一specular；normalnormalize、view由camera/position；ambient預設1；alpha原樣、不預乘。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-332 — PBR Material [material_pbr]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-332) · Environment-bound

### LC-NODE-332/B01

- Given: 合法 material_pbr 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: PBR 材質：baseDiffuse=baseColor*(1−metallic)，reflectance=mix(specularColor,baseColor,metallic)；加總全部 TDLightingPBR 與 TDEnvLightingPBR，再加 ambientColor*baseDiffuse*AO*ambientStrength；out=vec4(diffuse+specular+emission,alpha)。

### LC-NODE-332/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：normal會normalize，view由camera矩陣與position求得；position/normal/camera未設定時引用Vertex生成的原生值；ambientStrength預設0；alpha原樣、不預乘，specularColor是vec3、不自動乘0.08、不clamp roughness/metallic。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-333 — Vertex Inputs [vertex_input]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-333) · Environment-bound

### LC-NODE-333/B01

- Given: 合法 vertex_input 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: Pixel 節點鏡像 Vertex Output 的自訂 ports，把 varyings 還原為原型別。

### LC-NODE-333/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：僅 MAT Pixel；ports 來自共同 vertexInterface，bool 由 int 還原；不自行定義另一份接口。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-334 — Phong Lights [td_lighting_all]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-334) · Environment-bound

### LC-NODE-334/B01

- Given: 合法 td_lighting_all 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 由零累加全部 TD_NUM_LIGHTS 盞燈的 TDLighting 結果，只提供個別光照貢獻輸出。

### LC-NODE-334/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：不加入ambient、材質顏色、alpha或emission；不輸出單燈shadowStrength；TD燈數為零時各輸出零。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-335 — PBR Lights [td_lighting_pbr_all]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-335) · Environment-bound

### LC-NODE-335/B01

- Given: 合法 td_lighting_pbr_all 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 由零累加全部 TD_NUM_LIGHTS 盞燈的 TDLightingPBR 結果，只提供個別光照貢獻輸出。

### LC-NODE-335/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：不加入ambient、材質顏色、alpha或emission；不輸出單燈shadowStrength；TD燈數為零時各輸出零。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-336 — PBR Environment Lights [td_env_lighting_pbr_all]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-336) · Environment-bound

### LC-NODE-336/B01

- Given: 合法 td_env_lighting_pbr_all 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 由零累加全部 TD_NUM_ENV_LIGHTS 盞燈的 TDEnvLightingPBR 結果，只提供個別光照貢獻輸出。

### LC-NODE-336/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：不加入ambient、材質顏色、alpha或emission；不輸出單燈shadowStrength；TD燈數為零時各輸出零。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-337 — Texture Attribute [tex_attribute]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-337) · Environment-bound

### LC-NODE-337/B01

- Given: 合法 tex_attribute 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: Vertex 以 TDTexAttrib_name(layer) 讀命名的貼圖座標屬性。

### LC-NODE-337/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：宣告必須非陣列 vec3 Attribute；layer uint預設0；僅MAT Vertex。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-338 — TDInstanceTexCoord (Current) [td_instance_texcoord_current]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-338) · Environment-bound

### LC-NODE-338/B01

- Given: 合法 td_instance_texcoord_current 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDInstanceTexCoord(uv) 提供 TDInstanceTexCoord (Current)；回傳型別/分量完整保留。

### LC-NODE-338/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-339 — TDInstanceColor (Current) [td_instance_color_current]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-339) · Environment-bound

### LC-NODE-339/B01

- Given: 合法 td_instance_color_current 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDInstanceColor(color) 提供 TDInstanceColor (Current)；回傳型別/分量完整保留。

### LC-NODE-339/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-340 — TDInstanceColor (Pixel) [td_instance_color_pixel]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-340) · Environment-bound

### LC-NODE-340/B01

- Given: 合法 td_instance_color_pixel 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDInstanceColor(instance, color) 提供 TDInstanceColor (Pixel)；回傳型別/分量完整保留。

### LC-NODE-340/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-341 — TDConvertColorSpace [td_convert_color_space]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-341) · Environment-bound

### LC-NODE-341/B01

- Given: 合法 td_convert_color_space 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDConvertColorSpace(color) 提供 TDConvertColorSpace；回傳型別/分量完整保留。

### LC-NODE-341/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-342 — TDProjTextureLod [td_projtexture_lod]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-342) · Environment-bound

### LC-NODE-342/B01

- Given: 合法 td_projtexture_lod 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDProjTextureLod(light, uv, lod) 提供 TDProjTextureLod；回傳型別/分量完整保留。

### LC-NODE-342/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-343 — TDProjTextureSize [td_projtexture_size]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-343) · Environment-bound

### LC-NODE-343/B01

- Given: 合法 td_projtexture_size 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDProjTextureSize(light) 提供 TDProjTextureSize；回傳型別/分量完整保留。

### LC-NODE-343/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-344 — textureProjOffset · sampler1D [texture_proj_offset_1d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-344) · Portable

### LC-NODE-344/B01

- Given: 合法 texture_proj_offset_1d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureProjOffset(sampler, uv, offset) 提供 textureProjOffset · sampler1D；回傳型別/分量完整保留。

### LC-NODE-344/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-345 — textureProjLodOffset · sampler1D [texture_proj_lod_offset_1d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-345) · Portable

### LC-NODE-345/B01

- Given: 合法 texture_proj_lod_offset_1d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureProjLodOffset(sampler, uv, lod, offset) 提供 textureProjLodOffset · sampler1D；回傳型別/分量完整保留。

### LC-NODE-345/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-346 — textureProjGradOffset · sampler1D [texture_proj_grad_offset_1d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-346) · Portable

### LC-NODE-346/B01

- Given: 合法 texture_proj_grad_offset_1d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureProjGradOffset(sampler, uv, dx, dy, offset) 提供 textureProjGradOffset · sampler1D；回傳型別/分量完整保留。

### LC-NODE-346/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-347 — textureProjOffset · sampler2D [texture_proj_offset_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-347) · Portable

### LC-NODE-347/B01

- Given: 合法 texture_proj_offset_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureProjOffset(sampler, uv, offset) 提供 textureProjOffset · sampler2D；回傳型別/分量完整保留。

### LC-NODE-347/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-348 — textureProjLodOffset · sampler2D [texture_proj_lod_offset_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-348) · Portable

### LC-NODE-348/B01

- Given: 合法 texture_proj_lod_offset_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureProjLodOffset(sampler, uv, lod, offset) 提供 textureProjLodOffset · sampler2D；回傳型別/分量完整保留。

### LC-NODE-348/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-349 — textureProjGradOffset · sampler2D [texture_proj_grad_offset_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-349) · Portable

### LC-NODE-349/B01

- Given: 合法 texture_proj_grad_offset_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureProjGradOffset(sampler, uv, dx, dy, offset) 提供 textureProjGradOffset · sampler2D；回傳型別/分量完整保留。

### LC-NODE-349/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-350 — textureGatherOffset · sampler2D [texture_gather_offset_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-350) · Portable

### LC-NODE-350/B01

- Given: 合法 texture_gather_offset_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureGatherOffset(sampler, uv, offset, component) 提供 textureGatherOffset · sampler2D；回傳型別/分量完整保留。

### LC-NODE-350/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 component 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-351 — textureGatherOffsets · sampler2D [texture_gather_offsets_2d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-351) · Portable

### LC-NODE-351/B01

- Given: 合法 texture_gather_offsets_2d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureGatherOffsets(sampler, uv, offsets, component) 提供 textureGatherOffsets · sampler2D；回傳型別/分量完整保留。

### LC-NODE-351/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 component,offsets 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-352 — textureProjOffset · sampler3D [texture_proj_offset_3d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-352) · Portable

### LC-NODE-352/B01

- Given: 合法 texture_proj_offset_3d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureProjOffset(sampler, uv, offset) 提供 textureProjOffset · sampler3D；回傳型別/分量完整保留。

### LC-NODE-352/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-353 — textureProjLodOffset · sampler3D [texture_proj_lod_offset_3d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-353) · Portable

### LC-NODE-353/B01

- Given: 合法 texture_proj_lod_offset_3d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureProjLodOffset(sampler, uv, lod, offset) 提供 textureProjLodOffset · sampler3D；回傳型別/分量完整保留。

### LC-NODE-353/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-354 — textureProjGradOffset · sampler3D [texture_proj_grad_offset_3d]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-354) · Portable

### LC-NODE-354/B01

- Given: 合法 texture_proj_grad_offset_3d 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureProjGradOffset(sampler, uv, dx, dy, offset) 提供 textureProjGradOffset · sampler3D；回傳型別/分量完整保留。

### LC-NODE-354/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 offset 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-355 — textureGatherOffset · sampler2DArray [texture_gather_offset_2darray]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-355) · Portable

### LC-NODE-355/B01

- Given: 合法 texture_gather_offset_2darray 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureGatherOffset(sampler, uv, offset, component) 提供 textureGatherOffset · sampler2DArray；回傳型別/分量完整保留。

### LC-NODE-355/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 component 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-356 — textureGatherOffsets · sampler2DArray [texture_gather_offsets_2darray]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-356) · Portable

### LC-NODE-356/B01

- Given: 合法 texture_gather_offsets_2darray 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 textureGatherOffsets(sampler, uv, offsets, component) 提供 textureGatherOffsets · sampler2DArray；回傳型別/分量完整保留。

### LC-NODE-356/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 所有 sampler 端必須接來源，沒有便捷 Texture 2D 的缺圖黑色回退。 component,offsets 必須 ordinary constant expression；Uniform與Spec Constant鏈不合格。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-357 — Discard [discard]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-357) · Portable

### LC-NODE-357/B01

- Given: 合法 discard 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: condition true 時 discard；false 不丟棄 fragment。

### LC-NODE-357/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：終端副作用無輸出仍會執行；規則見 fragmentRoots；不能靠 downstream If/Switch 關閉副作用。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-358 — Depth Output [depth_out]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-358) · Portable

### LC-NODE-358/B01

- Given: 合法 depth_out 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 將 depth 直接寫入 gl_FragDepth，未明示值時沿用 gl_FragCoord.z。

### LC-NODE-358/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：終端副作用無輸出仍會執行；規則見 fragmentRoots；不能靠 downstream If/Switch 關閉副作用。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-359 — TDDither [td_dither]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-359) · Environment-bound

### LC-NODE-359/B01

- Given: 合法 td_dither 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 以 TDDither(color) 提供 TDDither；回傳型別/分量完整保留。

### LC-NODE-359/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：精確的 variants、參數順序、defaults、stage/target 與 constantInputs 都列在本筆 operationSpec；沒有額外數值域修正。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-360 — TDAlphaTest [td_alpha_test]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-360) · Environment-bound

### LC-NODE-360/B01

- Given: 合法 td_alpha_test 節點與 operationSpec 中的一組完整型別/設定
- When: 以所列 inputs/defaults 編譯
- Then: 執行 TDAlphaTest(alpha)，依宿主 alpha-test 設定可能丟棄 fragment。

### LC-NODE-360/B02

- Given: 模式/型別/連線違反列出的前置條件
- When: 請求編譯
- Then: GraphError；compile不更改原圖資料，不靜默換算法。

- Failure oracle: 不合法型別/模式/端點/值依共通驗證拋 GraphError；節點特有限制：終端副作用無輸出仍會執行；規則見 fragmentRoots；不能靠 downstream If/Switch 關閉副作用。 宿主 native/GPU 成功與數值見 LU-NODE-001。
- Persistence oracle: definitionUuid、revisionHash、params、inputValues 為保存圖的JSON資料；source/filter推導於compile副本中，不覆寫原graph。catalog所有模式的真實檔案存儲/重載通用性未逐UI驗證：LU-NODE-002。
- Undo/Redo oracle: 編譯本身不修改graph所以不建立undo；此操作所有UI修改路徑的undo分組未逐一確認，見LU-NODE-002；具明確tests的變型另於behaviorRefinements列出。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-361 — 38種GLSL值型別、資源與複合型別辨識

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-361) · Portable

### LC-NODE-361/B01

- Given: int最小值−2147483648
- When: 產生literal
- Then: 用 (-2147483647 - 1)；不是溢位的正literal再取負。

- Failure oracle: 未知型別、超過8維array、非法長度/結構都拒絕。
- Persistence oracle: 結果的ports/diagnostics/sourceMap是衍生資料；原始graph保存責任另列DATA盤點。
- Undo/Redo oracle: 此階段不是編輯事件；UI造成的輸入修改另有history，參照具體tests。
- UNKNOWN gates: 全域限制

## LC-NODE-362 — 連線型別轉換與精確接口規則

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-362) · Portable

### LC-NODE-362/B01

- Given: vec4輸出與vec3輸入
- When: 直接連接
- Then: 拒絕；需explicit Convert/Swizzle。

### LC-NODE-362/B02

- Given: float→vec3
- When: 合法普通input連線
- Then: 生成 vec3(source) splat。

- Failure oracle: 不合法配對 GraphError；Compare只能float/int/uint scalar；Switch與vector components要求精確型別。
- Persistence oracle: 結果的ports/diagnostics/sourceMap是衍生資料；原始graph保存責任另列DATA盤點。
- Undo/Redo oracle: 此階段不是編輯事件；UI造成的輸入修改另有history，參照具體tests。
- UNKNOWN gates: 全域限制

## LC-NODE-363 — 輸入口手動值、連線與隐含值優先序

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-363) · Portable

### LC-NODE-363/B01

- Given: saved a=2及wire值3
- When: 編譯後斷wire再編譯
- Then: 先用3，斷線回2，不以目前上游覆寫saved value。

- Failure oracle: 值shape、family、範圍、port key不合法都報錯；資源不接受可編輯numeric default。
- Persistence oracle: 結果的ports/diagnostics/sourceMap是衍生資料；原始graph保存責任另列DATA盤點。
- Undo/Redo oracle: 此階段不是編輯事件；UI造成的輸入修改另有history，參照具體tests。
- UNKNOWN gates: 全域限制

## LC-NODE-364 — 普通常數、特化常數與 Require Constant

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-364) · Portable

### LC-NODE-364/B01

- Given: literal If condition但另支Uniform
- When: Require Constant
- Then: 拒絕；不依預設條件剪枝。

- Failure oracle: Require Constant遇uniform、noise、TDhelper、out-arg call等不合格即報錯；Spec Constant不冒充ordinary constant。
- Persistence oracle: 結果的ports/diagnostics/sourceMap是衍生資料；原始graph保存責任另列DATA盤點。
- Undo/Redo oracle: 此階段不是編輯事件；UI造成的輸入修改另有history，參照具體tests。
- UNKNOWN gates: 全域限制

## LC-NODE-365 — 全圖驗證、可達運算產碼與TD Shader輸出

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-365) · Portable

### LC-NODE-365/B01

- Given: 結果可達部分合法、孤立節點循環
- When: 編譯
- Then: 仍拒絕整圖。

### LC-NODE-365/B02

- Given: 未使用的合法普通值節點
- When: 編譯
- Then: code中不存在、diagnostic標示not emitted。

- Failure oracle: 未知node/wrongstage、循環（包括孤立）、過量、錯誤宣告/frames/ports均報GraphError，不接受部分新shader。 JSON含NaN/非JSON資料可能在序列化先拋ValueError/TypeError，不保證所有malformed graph都統一GraphError。
- Persistence oracle: 結果的ports/diagnostics/sourceMap是衍生資料；原始graph保存責任另列DATA盤點。
- Undo/Redo oracle: 此階段不是編輯事件；UI造成的輸入修改另有history，參照具體tests。
- UNKNOWN gates: LU-NODE-006

## LC-NODE-366 — 圖錯誤與宿主編譯行號可定位原節點

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-366) · Portable

### LC-NODE-366/B01

- Given: 陌生DAT路徑或未對應code line
- When: 解析native錯誤
- Then: 保留message/line，不能臆測node。

- Failure oracle: 未知driver/link行保留為外部文字但此解析器不猜node；同三元錯誤去重，最多32。
- Persistence oracle: 結果的ports/diagnostics/sourceMap是衍生資料；原始graph保存責任另列DATA盤點。
- Undo/Redo oracle: 此階段不是編輯事件；UI造成的輸入修改另有history，參照具體tests。
- UNKNOWN gates: 全域限制

## LC-NODE-367 — 可讀節點名稱、穩定identity與GLSL命名隔離

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-367) · Portable

### LC-NODE-367/B01

- Given: named node移動
- When: compile
- Then: 符號不因position改變；rename則可改generated符號。

- Failure oracle: name非合法nonreserved GLSL identifier或超48字、同scope重名拒絕；禁止graph注入內部符號metadata。
- Persistence oracle: 結果的ports/diagnostics/sourceMap是衍生資料；原始graph保存責任另列DATA盤點。
- Undo/Redo oracle: 此階段不是編輯事件；UI造成的輸入修改另有history，參照具體tests。
- UNKNOWN gates: 全域限制

## LC-NODE-368 — 自訂結構與遞迴複合型別邊界

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-368) · Portable

### LC-NODE-368/B01

- Given: custom Sample欄位stable ID weight renamed mass
- When: compile原f_weight線
- Then: 引用mass，不重連。

- Failure oracle: 重複/非法ID、重複非法fieldname、recursive structure、嵌套>16、無效provider拒絕。
- Persistence oracle: 結果的ports/diagnostics/sourceMap是衍生資料；原始graph保存責任另列DATA盤點。
- Undo/Redo oracle: 此階段不是編輯事件；UI造成的輸入修改另有history，參照具體tests。
- UNKNOWN gates: 全域限制

## LC-NODE-369 — 動態節點接口與型別/連線重新驗證

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-369) · Portable

### LC-NODE-369/B01

- Given: Switch Default由float變vec3、已接float Case
- When: 編輯器修改
- Then: Case失效線斷開，同次undo可還原type與edges。

- Failure oracle: core只驗證現行接口，舊端點不存在必定報錯；編輯器修復不等於compiler偷偷修復。
- Persistence oracle: 結果的ports/diagnostics/sourceMap是衍生資料；原始graph保存責任另列DATA盤點。
- Undo/Redo oracle: 此階段不是編輯事件；UI造成的輸入修改另有history，參照具體tests。
- UNKNOWN gates: LU-NODE-005

## LC-NODE-370 — 內建操作辨識與revision來源檢查

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-370) · Portable

### LC-NODE-370/B01

- Given: graph夾帶未知revision的舊definitionarchive
- When: inspection
- Then: 報來源差異、不以archive取代目前emitter。

- Failure oracle: 不支援emitter/version/duplicate catalog拒絕；graph攜帶archive不是可執行emitter authority；不因未知revision載入外来程式。
- Persistence oracle: 結果的ports/diagnostics/sourceMap是衍生資料；原始graph保存責任另列DATA盤點。
- Undo/Redo oracle: 此階段不是編輯事件；UI造成的輸入修改另有history，參照具體tests。
- UNKNOWN gates: LU-NODE-006

## LC-NODE-371 — 取樣維度、LOD、offset與資源要求

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-371) · Portable

### LC-NODE-371/B01

- Given: textureGatherOffset offset接Uniform ivec2
- When: 編譯
- Then: 允許；component仍須ordinary constant。

- Failure oracle: 缺resource直接報Connect source；uniform/spec offset或錯誤ivec2[4]拒絕；GPU texture domain/limits LU-NODE-001。
- Persistence oracle: 結果的ports/diagnostics/sourceMap是衍生資料；原始graph保存責任另列DATA盤點。
- Undo/Redo oracle: 此階段不是編輯事件；UI造成的輸入修改另有history，參照具體tests。
- UNKNOWN gates: LU-NODE-001

## LC-NODE-372 — Fragment副作用root、順序與單一depth writer

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-372) · Portable

### LC-NODE-372/B01

- Given: 兩個不同subgraph instance各含DepthOutput
- When: 編譯
- Then: 拒絕多writer，即使兩個輸出都沒接ColorOutput。

- Failure oracle: expanded Pixel含第二個DepthOutput拒絕，包括不同subgraph instance；effects dependencies有cycle照樣拒絕。
- Persistence oracle: 結果的ports/diagnostics/sourceMap是衍生資料；原始graph保存責任另列DATA盤點。
- Undo/Redo oracle: 此階段不是編輯事件；UI造成的輸入修改另有history，參照具體tests。
- UNKNOWN gates: 全域限制

## LC-NODE-373 — 純量/向量/矩陣四則operand形狀

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-373) · Portable

### LC-NODE-373/B01

- Given: mat2x3 × vec2
- When: 編譯
- Then: 結果vec3；不得回傳mat2x3或先broadcast。

- Failure oracle: 不合法operand order/shape報錯；這能力不放寬普通matrix wires。
- Persistence oracle: 結果的ports/diagnostics/sourceMap是衍生資料；原始graph保存責任另列DATA盤點。
- Undo/Redo oracle: 此階段不是編輯事件；UI造成的輸入修改另有history，參照具體tests。
- UNKNOWN gates: 全域限制

## LC-NODE-374 — 編譯時追蹤Router與陣列結構來源型別

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-374) · Portable

### LC-NODE-374/B01

- Given: saved array_get type過時但Array來源有效
- When: compile
- Then: 按來源型別生成ports，原graph JSON不變。

- Failure oracle: 循環/丟失node/非intuint長度/不合法field在推導階段報GraphError並附scope。
- Persistence oracle: 結果的ports/diagnostics/sourceMap是衍生資料；原始graph保存責任另列DATA盤點。
- Undo/Redo oracle: 此階段不是編輯事件；UI造成的輸入修改另有history，參照具體tests。
- UNKNOWN gates: 全域限制

## LC-NODE-375 — 程式註記與幾何UI對產碼影響

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-375) · Portable

### LC-NODE-375/B01

- Given: label內含換行與類似GLSL指令
- When: 產碼
- Then: 每行仍是// inert comment，不執行內容。

- Failure oracle: comment控制字元/長度非法拒絕；注入字串只能成為註解，不作code。
- Persistence oracle: 結果的ports/diagnostics/sourceMap是衍生資料；原始graph保存責任另列DATA盤點。
- Undo/Redo oracle: 此階段不是編輯事件；UI造成的輸入修改另有history，參照具體tests。
- UNKNOWN gates: 全域限制

## LC-NODE-376 — 編輯器 Auto型別排名、手動鎖定與連線預檢

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-376) · Portable

### LC-NODE-376/B01

- Given: Noise Auto vec2、連入vec3座標
- When: 合法wire edit
- Then: 改為vec3；Undo回到原type與manual values。

### LC-NODE-376/B02

- Given: 同Noise手動locked vec4、連入vec3
- When: 嘗試wire edit
- Then: 拒絕而非裁切或擴張。

- Failure oracle: 新增wire先在candidate驗證cycle、完整下游、RequireConstant；新增錯誤拒絕，不破壞graph/history；既有無效draft可維持。
- Persistence oracle: 結果的ports/diagnostics/sourceMap是衍生資料；原始graph保存責任另列DATA盤點。
- Undo/Redo oracle: 此階段不是編輯事件；UI造成的輸入修改另有history，參照具體tests。
- UNKNOWN gates: LU-NODE-005

## LC-NODE-377 — 更換型別保留各shape的備用手動數值

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-377) · Portable

### LC-NODE-377/B01

- Given: 矩陣大shape縮小、改可見cell再切回
- When: reshape
- Then: 隱藏cell從cache恢復，重疊cell保留剛編輯值。

- Failure oracle: fixedType不可改；無法編輯的compound replacement清除不合適手動值；無合法結構時由型別/graph檢查報錯。
- Persistence oracle: 結果的ports/diagnostics/sourceMap是衍生資料；原始graph保存責任另列DATA盤點。
- Undo/Redo oracle: 此階段不是編輯事件；UI造成的輸入修改另有history，參照具體tests。
- UNKNOWN gates: LU-NODE-005

## LC-NODE-378 — Tint [built-in subgraph]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-378) · Portable

### LC-NODE-378/B01

- Given: 可用target/stage與所列預設/輸入
- When: 編譯並使用指定輸出
- Then: color*tint逐RGBA分量相乘，包含alpha。

- Failure oracle: 越界stage/target、內部ports/型別/decl不合法同樣GraphError；數學边界：無clamp、無gamma或premultiply；與Color Multiply保留alpha不同。
- Persistence oracle: root獨立有效MAT fixture已執行inspect與personal build→entry：graph不變且function graph保留。這證明資料往返，不證明每個UI保存途徑或render像素。
- Undo/Redo oracle: 屬普通subgraph編輯，具體UI歷史分組由DATA/UI盤點；本輪不假定每個操作已逐UI驗證。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-379 — Invert [built-in subgraph]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-379) · Portable

### LC-NODE-379/B01

- Given: 可用target/stage與所列預設/輸入
- When: 編譯並使用指定輸出
- Then: out.rgb=1−color.rgb，out.a=color.a。

- Failure oracle: 越界stage/target、內部ports/型別/decl不合法同樣GraphError；數學边界：不clamp超HDR值；只反轉RGB。
- Persistence oracle: root獨立有效MAT fixture已執行inspect與personal build→entry：graph不變且function graph保留。這證明資料往返，不證明每個UI保存途徑或render像素。
- Undo/Redo oracle: 屬普通subgraph編輯，具體UI歷史分組由DATA/UI盤點；本輪不假定每個操作已逐UI驗證。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-380 — Contrast [built-in subgraph]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-380) · Portable

### LC-NODE-380/B01

- Given: 可用target/stage與所列預設/輸入
- When: 編譯並使用指定輸出
- Then: out.rgb=(color.rgb−pivot)*contrast+pivot，out.a=color.a。

- Failure oracle: 越界stage/target、內部ports/型別/decl不合法同樣GraphError；數學边界：pivot與contrast為float同時作用RGB；不clamp。
- Persistence oracle: root獨立有效MAT fixture已執行inspect與personal build→entry：graph不變且function graph保留。這證明資料往返，不證明每個UI保存途徑或render像素。
- Undo/Redo oracle: 屬普通subgraph編輯，具體UI歷史分組由DATA/UI盤點；本輪不假定每個操作已逐UI驗證。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-381 — Color Clamp [built-in subgraph]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-381) · Portable

### LC-NODE-381/B01

- Given: 可用target/stage與所列預設/輸入
- When: 編譯並使用指定輸出
- Then: out.rgb=clamp(color.rgb,minimum,maximum)，out.a=color.a。

- Failure oracle: 越界stage/target、內部ports/型別/decl不合法同樣GraphError；數學边界：min/max每色共用float，不修正minimum>maximum等原生domain。
- Persistence oracle: root獨立有效MAT fixture已執行inspect與personal build→entry：graph不變且function graph保留。這證明資料往返，不證明每個UI保存途徑或render像素。
- Undo/Redo oracle: 屬普通subgraph編輯，具體UI歷史分組由DATA/UI盤點；本輪不假定每個操作已逐UI驗證。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-382 — Color Multiply [built-in subgraph]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-382) · Portable

### LC-NODE-382/B01

- Given: 可用target/stage與所列預設/輸入
- When: 編譯並使用指定輸出
- Then: RGB=color.rgb*multiplier；RGBA=vec4(RGB,color.a)；A=color.a，三輸出共享同一次RGB乘法。

- Failure oracle: 越界stage/target、內部ports/型別/decl不合法同樣GraphError；數學边界：不乘alpha、不clamp、不取樣、不作色彩空間轉換。
- Persistence oracle: root獨立有效MAT fixture已執行inspect與personal build→entry：graph不變且function graph保留。這證明資料往返，不證明每個UI保存途徑或render像素。
- Undo/Redo oracle: 屬普通subgraph編輯，具體UI歷史分組由DATA/UI盤點；本輪不假定每個操作已逐UI驗證。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-383 — Normal Map [built-in subgraph]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-383) · Environment-bound

### LC-NODE-383/B01

- Given: 可用target/stage與所列預設/輸入
- When: 編譯並使用指定輸出
- Then: decoded=(color.rgb−0.5)*2；decoded.xy*=strength；n=normalize(tangentToWorld*decoded)；TDFrontFacing(position,normal)時輸出n，背面輸出−n。

- Failure oracle: 越界stage/target、內部ports/型別/decl不合法同樣GraphError；數學边界：貼圖取樣在外部；TBN由幾何/Vertex提供，不微分重建切線；strength只縮放XY、不clamp；color alpha忽略；zero normal未提供epsilon保護。
- Persistence oracle: root獨立有效MAT fixture已執行inspect與personal build→entry：graph不變且function graph保留。這證明資料往返，不證明每個UI保存途徑或render像素。
- Undo/Redo oracle: 屬普通subgraph編輯，具體UI歷史分組由DATA/UI盤點；本輪不假定每個操作已逐UI驗證。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-384 — Displacement [built-in subgraph]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-384) · Environment-bound

### LC-NODE-384/B01

- Given: 可用target/stage與所列預設/輸入
- When: 編譯並使用指定輸出
- Then: position + normalize(normal)*(height−midlevel)*scale。

- Failure oracle: 越界stage/target、內部ports/型別/decl不合法同樣GraphError；數學边界：MAT Vertex only；height預設等於midlevel所以一般有效normal時中性；貼圖外部以LOD/sample節點供值；不修改法線、不提供切線/細分；zero normal仍沿native normalize。
- Persistence oracle: root獨立有效MAT fixture已執行inspect與personal build→entry：graph不變且function graph保留。這證明資料往返，不證明每個UI保存途徑或render像素。
- Undo/Redo oracle: 屬普通subgraph編輯，具體UI歷史分組由DATA/UI盤點；本輪不假定每個操作已逐UI驗證。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-385 — View Direction [built-in subgraph]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-385) · Environment-bound

### LC-NODE-385/B01

- Given: 可用target/stage與所列預設/輸入
- When: 編譯並使用指定輸出
- Then: 讀指定camera的uTDMats：proj[3][3]!=0視為orthographic，取camInverse[2].xyz；否則camInverse[3].xyz−position；用v/sqrt(max(dot(v,v),1e−20))正規化。

- Failure oracle: 越界stage/target、內部ports/型別/decl不合法同樣GraphError；數學边界：position須與camera matrix同為world座標；camera索引沿ArrayGet clamp；MAT Vertex/Pixel；零向量仍零，不自動代Z；正交/透視靠projection矩陣元素辨識。
- Persistence oracle: root獨立有效MAT fixture已執行inspect與personal build→entry：graph不變且function graph保留。這證明資料往返，不證明每個UI保存途徑或render像素。
- Undo/Redo oracle: 屬普通subgraph編輯，具體UI歷史分組由DATA/UI盤點；本輪不假定每個操作已逐UI驗證。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-386 — Fresnel [built-in subgraph]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-386) · Portable

### LC-NODE-386/B01

- Given: 可用target/stage與所列預設/輸入
- When: 編譯並使用指定輸出
- Then: 無偏振dielectric Fresnel：安全normalize N/V，ci=clamp(abs(dot(N,V)),0,1)，eta=max(IOR,1e−6)，st²=(1−ci²)/eta²，ct=sqrt(max(1−st²,0))；Rs=((ci−eta*ct)/max(ci+eta*ct,1e−8))²，Rp=((eta*ci−ct)/max(eta*ci+ct,1e−8))²；st²>=1取1、eta==1取0，其餘clamp((Rs+Rp)/2,0,1)。

- Failure oracle: 越界stage/target、內部ports/型別/decl不合法同樣GraphError；數學边界：不是Schlick近似；雙面用abs，未按正背面自動倒置IOR；IOR表示相對值；無厚度/吸收。
- Persistence oracle: root獨立有效MAT fixture已執行inspect與personal build→entry：graph不變且function graph保留。這證明資料往返，不證明每個UI保存途徑或render像素。
- Undo/Redo oracle: 屬普通subgraph編輯，具體UI歷史分組由DATA/UI盤點；本輪不假定每個操作已逐UI驗證。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-387 — Facing [built-in subgraph]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-387) · Portable

### LC-NODE-387/B01

- Given: 可用target/stage與所列預設/輸入
- When: 編譯並使用指定輸出
- Then: Fac=1−clamp(abs(dot(unit(N),unit(V))),0,1)，unit使用max(length²,1e−20)。

- Failure oracle: 越界stage/target、內部ports/型別/decl不合法同樣GraphError；數學边界：双面edge weight；正對鏡頭0、掠射1；不是帶IOR的物理Fresnel。
- Persistence oracle: root獨立有效MAT fixture已執行inspect與personal build→entry：graph不變且function graph保留。這證明資料往返，不證明每個UI保存途徑或render像素。
- Undo/Redo oracle: 屬普通subgraph編輯，具體UI歷史分組由DATA/UI盤點；本輪不假定每個操作已逐UI驗證。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-388 — Mapping [built-in subgraph]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-388) · Environment-bound

### LC-NODE-388/B01

- Given: 可用target/stage與所列預設/輸入
- When: 編譯並使用指定輸出
- Then: 對Vector先逐分量Scale，再按Rotation的degree值轉radians，以TDRotateX/Y/Z依序左乘，最後加Translation。

- Failure oracle: 越界stage/target、內部ports/型別/decl不合法同樣GraphError；數學边界：固定順序S→Rx→Ry→Rz→T；沒有Blender Point/Vector/Normal/Texture模式選單；旋轉使用TD helper，雖targets未限制但不完全host-independent。
- Persistence oracle: root獨立有效MAT fixture已執行inspect與personal build→entry：graph不變且function graph保留。這證明資料往返，不證明每個UI保存途徑或render像素。
- Undo/Redo oracle: 屬普通subgraph編輯，具體UI歷史分組由DATA/UI盤點；本輪不假定每個操作已逐UI驗證。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-389 — Rim Light [built-in subgraph]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-389) · Portable

### LC-NODE-389/B01

- Given: 可用target/stage與所列預設/輸入
- When: 編譯並使用指定輸出
- Then: Fac=pow(1−clamp(abs(dot(unit(N),unit(V))),0,1),max(power,0.0001))；Color=color*Fac*max(strength,0)。

- Failure oracle: 越界stage/target、內部ports/型別/decl不合法同樣GraphError；數學边界：Fac獨立於Color與Strength，strength=0不使Fac變0；不取樣燈、不是獨立Material；可接emission；unit使用epsilon。
- Persistence oracle: root獨立有效MAT fixture已執行inspect與personal build→entry：graph不變且function graph保留。這證明資料往返，不證明每個UI保存途徑或render像素。
- Undo/Redo oracle: 屬普通subgraph編輯，具體UI歷史分組由DATA/UI盤點；本輪不假定每個操作已逐UI驗證。
- UNKNOWN gates: LU-NODE-002

## LC-NODE-390 — Subsurface Approx [built-in subgraph]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-390) · Environment-bound

### LC-NODE-390/B01

- Given: 可用target/stage與所列預設/輸入
- When: 編譯並使用指定輸出
- Then: 以−unit(normal)加總TD所有普通燈的Phong diffuse背光；Color=backDiffuse*color*exp(−max(thickness,0)/max(distance,1e−6))*max(strength,0)；shadowStrength clamp到0..1。

- Failure oracle: 越界stage/target、內部ports/型別/decl不合法同樣GraphError；數學边界：MAT Pixel；Distance是相同位置/厚度單位的衰減尺度，不是散射kernel半徑；不含env/ambient、畫面模糊、厚度估計、多重散射；輸出加法光色，可接Phong/PBR emission。
- Persistence oracle: root獨立有效MAT fixture已執行inspect與personal build→entry：graph不變且function graph保留。這證明資料往返，不證明每個UI保存途徑或render像素。
- Undo/Redo oracle: 屬普通subgraph編輯，具體UI歷史分組由DATA/UI盤點；本輪不假定每個操作已逐UI驗證。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-NODE-391 — Bump [built-in subgraph]

[詳細規格](LEGACY_CAPABILITIES.md#lc-node-391) · Environment-bound

### LC-NODE-391/B01

- Given: 可用target/stage與所列預設/輸入
- When: 編譯並使用指定輸出
- Then: unit N；Px=dFdx(position),Py=dFdy(position),hx=dFdx(height),hy=dFdy(height)；rx=cross(Py,N),ry=cross(N,Px),det=dot(Px,rx)；valid=abs(det)>max(length(Px)*length(Py)*1e−6,1e−30)。gradient=(rx*hx+ry*hy)/(valid?det:1)；perturbed=unit(N−gradient*distance)；valid時unit(mix(N,perturbed,clamp(strength,0,1)))，否則N。

- Failure oracle: 越界stage/target、內部ports/型別/decl不合法同樣GraphError；數學边界：MAT Pixel；signed determinant處理鏡射座標；position/height必須随fragment變化，同座標空間N；不取樣/不含TDFrontFacing、不搬動頂點；Distance可負反轉凹凸；zero N不自動取幾何法線。
- Persistence oracle: root獨立有效MAT fixture已執行inspect與personal build→entry：graph不變且function graph保留。這證明資料往返，不證明每個UI保存途徑或render像素。
- Undo/Redo oracle: 屬普通subgraph編輯，具體UI歷史分組由DATA/UI盤點；本輪不假定每個操作已逐UI驗證。
- UNKNOWN gates: LU-NODE-002, LU-NODE-001

## LC-UI-001 — 單選、多選與主要選取

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-001) · Portable

### LC-UI-001/B01

- Given: 已載入圖且入口可用
- When: 點擊節點；Ctrl／Meta／Shift 加點
- Then: 普通點擊取代集合；修飾鍵逐個切換集合成員。主要選取是本次仍在集合的節點，否則取集合最後一個；清除連線／來源選取並更新 Parameter。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-002 — 空白點擊清除與框選

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-002) · Portable

### LC-UI-002/B01

- Given: 已載入圖且入口可用
- When: 空白左鍵點擊；Box Select 左拖／Shift 拖／右鍵拖曳
- Then: 超過 3 CSS px 才是框選／pan；框與卡片相交即入選。Ctrl/Meta 框選保留先前集合，其他框選取代。空白靜止左擊清選取；拖移 pan 保留原選取。右拖結束抑制右鍵選單。

- Failure oracle: pointercancel 清除框選手勢；框選期間曾顯示的選取是否應回復起始集合未有產品結論，見 LU-UI-004。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: LU-UI-004

## LC-UI-003 — 連線多選與端點選取

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-003) · Portable

### LC-UI-003/B01

- Given: 已載入圖且入口可用
- When: 點線；Ctrl/Meta/Shift 點線；已選線 Left／Right
- Then: 選線切換獨立連線集合，清節點選取。Left 選全部真實 source 節點、Right 選 target，去重並 Frame；不受線條左右幾何位置、readonly 或 context-menu Frame 偏好影響。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-004 — 全選與連通集合選取

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-004) · Portable

### LC-UI-004/B01

- Given: 已載入圖且入口可用
- When: Mod+A；Mod+Up/Left/Right/Down
- Then: 全選當前 network；Mod+Up 擴張所有連通節點，Left 上游、Right 下游，Down 選目前連通集合之外。Wire 和 Link 都参与；ctrlArrowAdjacent 開啟時只讓 Left/Right 增加相鄰一層，預設 false 為傳遞閉包。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-005 — 空間方向鍵導航

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-005) · Portable

### LC-UI-005/B01

- Given: 已載入圖且入口可用
- When: 單選節點後無修飾方向鍵；arrowNavigationMode=spatial（預設）
- Then: 從卡片中心沿按鍵方向找候選，優先前方 90 度區域再比距離，平手依 y/x/id；不循環，不自動更動模型。多選／空選取不導航。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-006 — 沿連線／分支方向導航

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-006) · Portable

### LC-UI-006/B01

- Given: 已載入圖且入口可用
- When: arrowNavigationMode=legacy 或 branches；Left/Right、Up/Down
- Then: Left/Right 建立上下游路徑，候選按 y/x/id 並去重；反向鍵回溯實際來路。Up/Down 切換該層分支，不循環。branches 額外保留返回上游後的下游錨點以探索其他輸入；legacy 回到原模式。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-007 — 導航視野跟隨策略

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-007) · Portable

### LC-UI-007/B01

- Given: 已載入圖且入口可用
- When: 設定 arrowNavigationView
- Then: 可選 none（預設）、frame、frameInstant、centerAnimated、centerInstant。Frame 改 zoom+pan 以包含目標，Center 保留 zoom 只置中；顯式 animated 不被一般 Frame checkbox 關閉覆蓋。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 寫入同 origin 的 localStorage；不存於圖、TOE 或圖 Undo history。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-008 — 節點／多選拖移

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-008) · Portable

### LC-UI-008/B01

- Given: 已載入圖且入口可用
- When: 拖標題；nodeBodyDrag=true 時拖可用 body；touch 同途徑
- Then: 拖移超過門檻後只預覽座標與線端；放開一次提交全部選取節點座標。節點維持相對位置，UI scale 與 graph zoom 共同換算。輸入欄、選單、按鈕、label、socket 不作拖移把手。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 寫入目前 network 節點／連線的圖資料；隨圖 JSON 保存。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-009 — 節點固定寬度調整

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-009) · Portable

### LC-UI-009/B01

- Given: 已載入圖且入口可用
- When: 節點寬度把手水平拖曳
- Then: 依畫布比例預覽寬度與端點；釋放把 ui.width 保存成一次 layout edit。普通節點只有寬度；最大 1200 graph px，最小與節點類型及控制項有關。預設寬度未手調時由內容估計。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 寫入目前 network 節點／連線的圖資料；隨圖 JSON 保存。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-010 — 單節點與多選收合／展開

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-010) · Portable

### LC-UI-010/B01

- Given: 已載入圖且入口可用
- When: 卡片三角；Selection toolbar；右鍵 Collapse／Expand
- Then: 收合為固定高度標題，維持展開寬度資料；0 port 不畫點，1 port 畫真實型別可連點，>1 同側合併視覺 socket。混合選取可分別全收合／全展開；群組關係不變。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 寫入目前 network 節點／連線的圖資料；隨圖 JSON 保存。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-011 — 多選對齊、等距與格狀排列

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-011) · Portable

### LC-UI-011/B01

- Given: 至少兩張可編輯節點；等距需要三張。
- When: Arrange：left/centerX/right/top/centerY/bottom/spaceX/spaceY/grid
- Then: 六種對齊計入每張卡實際尺寸。等距至少 3 張，依位置/id 排序，以首張起點開始、間隔至少 48 graph px，可能推開最末張。grid 依 y/x/id，ceil(sqrt(N)) 欄，列欄用最大尺寸再加 48。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 寫入目前 network 節點／連線的圖資料；隨圖 JSON 保存。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-012 — 依連線自動排列

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-012) · Portable

### LC-UI-012/B01

- Given: 至少兩張可編輯節點。
- When: L／Shift+L；Arrange auto／autoReverse
- Then: 對選取子圖依內部邊分組、排行；正常由輸入往输出，reverse 從输出反推排行但線方向不改。循環以 SCC 處理，穩定 graph-order tie break；水平間隔 96、垂直 48。孤立節點放連通部分下方，獨立 components 垂直分區。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 寫入目前 network 節點／連線的圖資料；隨圖 JSON 保存。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-013 — 八方向選取間距拖曳

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-013) · Portable

### LC-UI-013/B01

- Given: 已載入圖且入口可用
- When: 多選框 n/ne/e/se/s/sw/w/nw 把手
- Then: 固定對側，以中心距離擴張／收縮節點間距，不縮放卡片、字體或連線結構；預覽後一次提交。收縮不能引入原本不存在的重疊，原有重疊可以拉開，重合中心保持有限值。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 寫入目前 network 節點／連線的圖資料；隨圖 JSON 保存。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-014 — 選取工具列與邊界呈現

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-014) · Portable

### LC-UI-014/B01

- Given: 已載入圖且入口可用
- When: selectionToolbar off/multiple/all；editToolbar；persistentSelectionBounds 等偏好
- Then: 預設 all：選單節點也有上下文 edit 工具，multiple 限多選，off 不顯示上下文條。歷史按鈕留主列；editToolbar 獨立控制主列 edit 組。至少兩節點才有持續選取框；hideGroupedSelectionBounds 僅對剛好完整單一群組隱藏。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 寫入同 origin 的 localStorage；不存於圖、TOE 或圖 Undo history。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-015 — 建立與刪除群組框

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-015) · Portable

### LC-UI-015/B01

- Given: 已載入圖且入口可用
- When: Mod+G／Create Frame；框刪除按鈕
- Then: 至少兩個全未分組節點才可建立；名稱 Group N 取未用序號。框是 layout metadata，不是 shader node；邊界自動包所有成員加左右24、上方28標題。刪框不刪節點／線。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 寫入目前 network 節點／連線的圖資料；隨圖 JSON 保存。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-016 — 選取、移動群組框全部成員

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-016) · Portable

### LC-UI-016/B01

- Given: 已載入圖且入口可用
- When: 點框標題／Enter/Space／可選角落；拖框標題
- Then: 普通點選整框成員，修飾鍵切換整組（全在集合則移除，否則全加）；保留已選 primary 或取最後項。拖標題一起搬全部成員，一次 layout Undo；空框body讓底下畫布和線可操作。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 成員座標寫回圖；點擊選取本身不保存。
- Undo/Redo oracle: 選取無 Undo；成功拖移一次 Undo/Redo。
- UNKNOWN gates: 全域限制

## LC-UI-017 — 框名稱與顏色

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-017) · Portable

### LC-UI-017/B01

- Given: 已載入圖且入口可用
- When: 雙擊框名稱／F2；palette 色塊與自訂色
- Then: 名稱 trim 後 1–80 字且無控制字元；Escape 取消、非 IME Enter/blur 提交。顏色必須 #RRGGBB，預設 #7f8797；12 個預設 slate/gray/red/orange/sand/olive/green/teal/blue/navy/violet/rose，不改成員節點家族顏色。

- Failure oracle: 不合法名稱顯示 frame.invalidName 且不改；不合法 hex 忽略。
- Persistence oracle: 寫入目前 network 節點／連線的圖資料；隨圖 JSON 保存。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-018 — 把選取加入／移出群組

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-018) · Portable

### LC-UI-018/B01

- Given: 已載入圖且入口可用
- When: Alt+Shift+G Join；Alt+G Detach
- Then: Join 目標為目前選取覆蓋成員數嚴格最多的框，必須另有框外節點；從其他框移出後加入目標。平手／全在同框／無框不提供 Join。Detach 只移除選取成員的 membership，不改節點線。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 寫入目前 network 節點／連線的圖資料；隨圖 JSON 保存。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-019 — 平移、滾輪與 Home/Frame

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-019) · Portable

### LC-UI-019/B01

- Given: 已載入圖且入口可用
- When: 空白左拖；wheel；H Home；F Frame
- Then: pan 為視圖操作，wheel 錨定游標；H 立即 frame 全部節點，F frame 選取，沒有節點選取（含只選線）退為全部。使用卡片實際大小及完整框界，readonly 可導航。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-020 — 縮放百分比選單

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-020) · Portable

### LC-UI-020/B01

- Given: 已載入圖且入口可用
- When: 點 percentage；Enter/Space/Up/Down 開啟
- Then: 預設範圍25–170%；presets 25/50/75/100/125/150/170，Overview 啟用再增加20。選項以畫布中心為錨；上下/Home/End 導航、Escape 回焦、Tab dismiss，不改 UI scale 或節點資料。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-021 — 中鍵 Dolly 縮放

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-021) · Portable

### LC-UI-021/B01

- Given: 已載入圖且入口可用
- When: 空白 MMB 拖水平／垂直
- Then: 以按下座標為錨，右／上放大、左／下縮小，dx−dy 合併；比例 exp(delta*0.006)，限於目前zoom範圍。Escape/blur 回原始view；中鍵單擊不清selection。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-022 — 獨立 Pan/Zoom 與 Frame 平滑

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-022) · Portable

### LC-UI-022/B01

- Given: 已載入圖且入口可用
- When: canvasDamping/frameDamping 與時間設定
- Then: 兩者預設都 on，150ms／333ms；各自10–1000ms，可讀圖也可調。持續輸入合到一個動畫，停止輸入後到精確target；切off到target結束；新pointer互動停在目前顯示位置。Home及系统初始定位仍即時。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 寫入同 origin 的 localStorage；不存於圖、TOE 或圖 Undo history。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: LU-UI-002

## LC-UI-023 — Touch 畫布手勢與相容滑鼠事件

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-023) · Portable

### LC-UI-023/B01

- Given: 已載入圖且入口可用
- When: 單指 pan、兩指 pinch、tap/doubletap/hold
- Then: 8 CSS px 判移動；長按550ms 開context；雙tap320ms/24px。兩指接管時取消node/wire預覽，錨定pinch，剩一指可pan。touch操作後抑制合成mouse/click直到真正mouse/pen；canvas避免page zoom/callout，欄位保留原生輸入。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: LU-UI-001

## LC-UI-024 — Graph Focus 與系統 Fullscreen

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-024) · Environment-bound

### LC-UI-024/B01

- Given: 已載入圖且入口可用
- When: Mod+Enter Focus；Alt+Enter Fullscreen／按鈕
- Then: Focus 暫時只留圖編輯區，保留原layout供還原；Escape 不退出Focus。Fullscreen 使用瀏覽器文件 fullscreen，失敗顯示狀態，busy禁重入，外部退出同步按鈕；Alt+Enter不提交欄位draft且IME不觸發。

- Failure oracle: Fullscreen不支援按鈕disabled；Promise拒絕顯示 fullscreenFailed，finally 清 busy。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: LU-UI-001

## LC-UI-025 — 從任一方向建立連線

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-025) · Portable

### LC-UI-025/B01

- Given: 已載入圖且入口可用
- When: 拖output→input或input→output；依序點兩socket
- Then: 輸入／輸出必須相反，規劃型別與自動推導後一次連接；occupied input 替換舊來源原子Undo。cycle、型別、constant不合則回報，保留現狀；同方向不建立。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 寫入目前 network 節點／連線的圖資料；隨圖 JSON 保存。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-026 — 空白落線的斷線／建立選擇

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-026) · Portable

### LC-UI-026/B01

- Given: 已載入圖且入口可用
- When: 已連Input拖空白或其他socket拖空白
- Then: Trash 預設關閉時，已連input拖空白即刪該input連線；其他開始點開相容Create。Trash開啟時已連input空白也開Create，必須丟垃圾桶或Disconnect才斷。grey spare socket落空白不產接口。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 成功斷線寫入圖；只開Create無保存。
- Undo/Redo oracle: 斷線一次Undo；只開Create不建history。
- UNKNOWN gates: 全域限制

## LC-UI-027 — Wire／Link 外觀切換

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-027) · Portable

### LC-UI-027/B01

- Given: 已載入圖且入口可用
- When: 線右鍵或quick bar選Wire/Link
- Then: Wire為型別色曲線；Link灰直虛線並帶方向。批次改所選連線，一次Undo；Wire移除edge.ui.style，Link寫link。語意端點／型別／GLSL不變；混合選取不假裝同一模式。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: edge.ui.style 隨圖／clipboard等圖序列化保存；Wire缺省。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-028 — 批次改輸入／輸出線型

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-028) · Portable

### LC-UI-028/B01

- Given: 已載入圖且入口可用
- When: 節點context Convert Wires四選項；線context來源全Link
- Then: 對選取節點的所有輸入或输出改Wire/Link；內部線只處理一次。從線context來源全Link只改那一個output port的分支。空集合／已全目標樣式禁用；stale選取／圖context不提交。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 同 LC-UI-027 的 edge.ui.style。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-029 — 隱藏Link仍能找端點

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-029) · Portable

### LC-UI-029/B01

- Given: 已載入圖且入口可用
- When: X／Show Link lines；Link arrow左擊／右擊
- Then: 線可隱藏並移除line hitarea；proxy arrows仍出現。左擊選並Frame所有對側節點去重；右鍵列對側單項，含同名節點的customname辨識及轉回Wire動作。只代表Link、不混入Wire或遞迴。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 線可見偏好 sgrapeLinkLinesV1 localStorage；不改圖。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-030 — 連線快捷動作條

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-030) · Portable

### LC-UI-030/B01

- Given: 已載入圖且入口可用
- When: 點選線；wireQuickActions 預設true
- Then: 游標上方夾住顯示Wire/Link/Source/Target/Disconnect五項。Source/Target必Frame，不受context Frame偏好。混合模式正確空選樣式；批次Disconnect一次Undo；Escape回canvas、arrows/Home/End走按鈕。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: toolbar無持久化；線型或Disconnect按圖保存。
- Undo/Redo oracle: 導航／開關無Undo；線型或Disconnect一次Undo。
- UNKNOWN gates: 全域限制

## LC-UI-031 — 接線幾何與選線命中

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-031) · Portable

### LC-UI-031/B01

- Given: 已載入圖且入口可用
- When: 不同zoom、UIscale、pan、sidebar/floating尺寸下操作線
- Then: 線與真實socket中心對齐；透明hit區至少6 CSS px，放大時隨線成長。實際可見線優先於其他線透明區，節點/socket/frame title/corner再優先；重疊同類按後畫者。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: LU-UI-001

## LC-UI-032 — 可選垃圾桶拖刪

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-032) · Portable

### LC-UI-032/B01

- Given: 已載入圖且入口可用
- When: canvasTrash=true；node/group/edge/input拖右下垃圾桶
- Then: 預設false；hover只顯示待刪高亮及數目，release才移除可刪節點與附邊／指定edge/input線，一次Undo。固定不可刪節點剔除，readonly/stale拒绝；未接output丟棄僅取消。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 寫入目前 network 節點／連線的圖資料；隨圖 JSON 保存。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-033 — Router 緊湊分線與排列

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-033) · Portable

### LC-UI-033/B01

- Given: 已載入圖且入口可用
- When: 建立Router、單socket接入，從該點接出多分支
- Then: Router為真節點／真邊，型別追蹤來源；可沒有顯示名，title hover/selection才顯示便於拖移。分支依destination的屏幕Y排列到最多四個出口位置，超出分層；首層空心，Link與Wire各自端點。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 寫入目前 network 節點／連線的圖資料；隨圖 JSON 保存。
- Undo/Redo oracle: 建立／連線／拖移各自一次Undo；自動分配端點是呈現，不另写图。
- UNKNOWN gates: 全域限制

## LC-UI-034 — 開啟Add Node並篩選候選

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-034) · Portable

### LC-UI-034/B01

- Given: 已載入圖且入口可用
- When: Tab／空白doubleclick/doubletap／右鍵Add／落線空白
- Then: 以graph座標記住建立點，搜尋重置，category路徑/source/type篩選；顯示標籤、來源badge及匹配port。wired模式列真正可規劃的連線變體，精確型別優先，每node顯示最佳變體；新source和已存在source有不同標示。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-035 — 移动Create面板不改建立點

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-035) · Portable

### LC-UI-035/B01

- Given: 已載入圖且入口可用
- When: 拖Create標題非控制區
- Then: 3 CSS px後移動面板，viewport內夾住，獨立記住graph建立點。取消drag回原位置；移動不建節點、不改線。縮放／圖context變動使stale選擇失效。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-036 — 從接孔右鍵建立後放置

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-036) · Portable

### LC-UI-036/B01

- Given: 已載入圖且入口可用
- When: port context Create候選，移cursor再左擊canvas
- Then: 先測量候選真實port與卡尺寸，顯示輪廓/預覽線，不實際加node/source。位置snap24；左擊有效canvas處一次提交節點+連線。Escape/Tab/右擊/外部點/換圖/版本變更取消。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只有最後確認才保存節點/來源/連線；預覽無保存。
- Undo/Redo oracle: 確認建立+接線為一次Undo；取消無步驟。
- UNKNOWN gates: 全域限制

## LC-UI-037 — 自訂名稱、Label與功能名稱分辨

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-037) · Portable

### LC-UI-037/B01

- Given: 已載入圖且入口可用
- When: Show Custom Names；Parameter Label；雙擊label
- Then: 可切canvas顯示customname；切前先blur並檢查unfinishedfield。Label為ui.label，trim、最多80、無控制字元，空值移除；保留原node身份和GLSL名稱。長label截斷不撐卡，literaltext防HTML。

- Failure oracle: label不合法顯示錯誤並回原值；unfinishedfield阻擋顯示模式切換。
- Persistence oracle: label寫圖；Show Custom Names為sgrapeCustomNamesV1瀏覽器偏好。
- Undo/Redo oracle: label一次Undo；顯示模式不進history。
- UNKNOWN gates: 全域限制

## LC-UI-038 — 普通節點Notes文本

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-038) · Portable

### LC-UI-038/B01

- Given: 已載入圖且入口可用
- When: Parameter Notes分頁；Ctrl/Meta+Enter或blur提交，Escape取消
- Then: 每節點ui.comment換行正規化LF，最多2000字，拒不允許控制字元；canvas/Help以純文字呈現。普通/source/GLSLCode共用Notes分頁，切selection保留當前tab；Note節點用專用內容不重複Notes。

- Failure oracle: 過長/不合法字元顯示 node.commentInvalid、不提交。
- Persistence oracle: ui.comment隨圖保存；普通節點註解亦進GLSL註解，非一律shader-neutral。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: LU-UI-003

## LC-UI-039 — 獨立Note內容與Markdown閱讀

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-039) · Portable

### LC-UI-039/B01

- Given: 已載入圖且入口可用
- When: 建立Note／canvas單擊選取Enter編輯或doubletap；Parameter內容
- Then: Note是無port註釋卡，保有rawtext；canvas支援headings/emphasis/lists/安全連結/fenced GLSL，Parameter總為原文。Ctrl/Meta+Enter／blur一次提交，Escape取消，重render保留未提交draft；長文獨立捲動。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: Note文字與ui外觀存圖／clip；Note操作為graph-only，不改shader語意。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-040 — Note標題、背景、透明、字體與對齊

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-040) · Portable

### LC-UI-040/B01

- Given: 已載入圖且入口可用
- When: Note canvasappearance buttons／Settings
- Then: title正常或selected-only；body可預設色／自選色／透明，Default一次刪兩override；字體scale普通Note1–10，GLSLviewer0.1–10；文字left/center/right只作用canvas閱讀段落，不改code區／原文editor對齊。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: ui.noteTitleOnSelection、noteTransparent、noteColor、noteFontScale、noteTextAlign 隨圖保存。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-041 — Note雙軸縮放與最小內容高度

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-041) · Portable

### LC-UI-041/B01

- Given: 已載入圖且入口可用
- When: 拖Note邊角／寬度及高度
- Then: 兩軸預覽後一筆layoutUndo；width至少190、height至少實際一行高度（依Markdown首元素/fontscale），多行滾動不強迫長高。未指定height保留180預設，保存手動height不被render縮小；collapsed暫不使用height。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: ui.width/ui.height隨圖與clipboard保存。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-042 — Parameters/Settings/Notes與選取對象

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-042) · Portable

### LC-UI-042/B01

- Given: 已載入圖且入口可用
- When: 選node／source／viewer；選Inspector tab
- Then: 普通node Parameters顯示值／連接，Settings顯示設定，Notes顯示備註；header分功能label與instance/sourceidentity。更換選取跟隨到正確資料，空選取有空態，unknown definition顯示對應fallback而非擅造接口。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: LU-UI-003

## LC-UI-043 — 向量compact與component展開

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-043) · Portable

### LC-UI-043/B01

- Given: 已載入圖且入口可用；以下涉及模型保存的斷言僅適用graph-owned值/default，native live另見LC-HOST-036–046
- When: 參數向量行三角／行label點擊
- Then: vec2/3/4保留整列compactcontrols，展開再列各分量名稱。Parameter展開是WeakMap UIstate不改圖；所有copy同步但不蓋正在編輯draft。bool用true/false；int/uint遵守32位範圍；普通float容許有限高精度。

- Failure oracle: 空字串、NaN/Infinity、整數非整數/越界標aria-invalid不寫；stale signature恢復。
- Persistence oracle: 數值提交存模型；Parameter展開只同一node物件暫存，非graphui字段。
- Undo/Redo oracle: 展開無Undo；數值每次有效提交一次Undo。
- UNKNOWN gates: 全域限制

## LC-UI-044 — 矩陣欄／分量編輯

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-044) · Portable

### LC-UI-044/B01

- Given: 已載入圖且入口可用；以下涉及模型保存的斷言僅適用graph-owned值/default，native live另見LC-HOST-036–046
- When: 矩陣Parameter與inline展開
- Then: 矩陣依column-major切成column向量，每column及component有對應真實值與connection；不把所有矩陣欄壓窄到不可讀。主矩陣／column／scalar連入使相應manual值inherited禁編，但其他未覆寫分量仍可編。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 修改值／覆寫連線隨圖；展示不改矩陣存序。
- Undo/Redo oracle: 每次合法值修改/連接一次Undo。
- UNKNOWN gates: 全域限制

## LC-UI-045 — 從已連接來源名稱跳至來源

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-045) · Portable

### LC-UI-045/B01

- Given: 已載入圖且入口可用
- When: 點Parameter connected source名稱；Enter/Space
- Then: 選取並Frame真實來源node，包含矩陣column/component；docked/floating/readonly同樣可用。來源按鈕與Disconnect分開；stale圖/network/edge不跳到錯物件。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-046 — Floating Parameter代理輸入socket

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-046) · Portable

### LC-UI-046/B01

- Given: 已載入圖且入口可用
- When: parameterInputPorts=true（預設）；從面板input接線
- Then: 僅floating node Parameter實際input旁有socket；可雙向接線及替換，預覽終點到面板、保存終點仍真nodeport。常數值、Settings、Notes、viewer、docked不造fakeport。matrixcolumn/component映射真接口。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 代理呈現不保存；連線存圖。
- Undo/Redo oracle: 連線一次Undo；切代理顯示無Undo。
- UNKNOWN gates: 全域限制

## LC-UI-047 — 精確文字輸入與draft同步

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-047) · Portable

### LC-UI-047/B01

- Given: 已載入圖且入口可用；以下涉及模型保存的斷言僅適用graph-owned值/default，native live另見LC-HOST-036–046
- When: 點numericfield；鍵入；Enter／blur提交；Escape取消
- Then: 保留輸入的精度與未完成字串跨安全render；未完成不写圖，inline/Parameter同步有效值，不覆蓋另一個focused draft。readonly/變更owner丟棄staledraft；Enter受IME保護。

- Failure oracle: 不合法數字aria-invalid、保持draft待修；未變更不加Undo。
- Persistence oracle: 提交值存模型；文字draft只暫存，非圖值。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-048 — 浮點數水平scrub

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-048) · Portable

### LC-UI-048/B01

- Given: 已載入圖且入口可用；以下涉及模型保存的斷言僅適用graph-owned值/default，native live另見LC-HOST-036–046
- When: 未進文字編輯時leftdrag numeric field
- Then: 以field螢幕寬對應目前十進位量級，連續跨0、±1與十進位帶，事件頻率不影響結果；Ctrl快10倍、Shift慢10倍、Ctrl+Shift最細。預覽兩表面與fill，release才commit；精確回baseline不造Undo。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只有release合法值才存模型。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-049 — 整數與受限數值scrub

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-049) · Portable

### LC-UI-049/B01

- Given: 已載入圖且入口可用；以下涉及模型保存的斷言僅適用graph-owned值/default，native live另見LC-HOST-036–046
- When: int/uint field拖曳；有numericRange的field拖曳
- Then: int每10 CSS px一步，Shift100px一步，Ctrl（含CtrlShift）1px一步；uint不得小於0，int/uint限32位。range值按min/max/step，撞limit立即反向，不累積hiddenovershoot。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: release值存模型；本機設定fields則localStorage。
- Undo/Redo oracle: 圖值一次Undo；local UI setting不寫圖history。
- UNKNOWN gates: 全域限制

## LC-UI-050 — 單欄Value Ladder

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-050) · Portable

### LC-UI-050/B01

- Given: 已載入圖且入口可用；以下涉及模型保存的斷言僅適用graph-owned值/default，native live另見LC-HOST-036–046
- When: MMB／Alt+rightdrag／450ms hold；移到rung再水平拖
- Then: float rungs10/1/.1/.01/.001，integer100/10/1；預設float.1/int1，每8 CSS px增一步。先垂直選rung，一旦水平拖鎖rung；放開一commit，取消精確恢復原字串／值。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: release值存模型；popup位置不存。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-051 — 整組／單分量Ladder

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-051) · Portable

### LC-UI-051/B01

- Given: 已載入圖且入口可用；以下涉及模型保存的斷言僅適用graph-owned值/default，native live另見LC-HOST-036–046
- When: Parameter數值行的名稱或型別MMB拖
- Then: 對可寫的scalar/vector/color/fixed/unconnecteddefault整組加相同delta；展開componentlabel只改該分量。整數由共同delta約束避免某分量越界而改變差值；Color不強制0..1。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 整組各分量提交寫同一節點值。
- Undo/Redo oracle: 全部可寫分量一筆Undo；取消／回起點不產生history。
- UNKNOWN gates: 全域限制

## LC-UI-052 — 常用數值presets選單

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-052) · Portable

### LC-UI-052/B01

- Given: 已載入圖且入口可用；以下涉及模型保存的斷言僅適用graph-owned值/default，native live另見LC-HOST-036–046
- When: numericfield rightclick／Shift+F10／ContextMenu
- Then: float列0/1/.5/-.5/-1；int列0/1/-1，再按fieldmin/max過濾。開／取消保留draft，選值才替換提交；上下/Home/End選、Escape/Tab回field。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只選值提交才存模型。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-053 — Touch數值輸入意圖區分

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-053) · Portable

### LC-UI-053/B01

- Given: 已載入圖且入口可用；以下涉及模型保存的斷言僅適用graph-owned值/default，native live另見LC-HOST-036–046
- When: 數值單tap／同field第二tap／橫拖／縱拖／hold
- Then: 未focus單tap不叫keyboard；350ms內24px同field第二tap進文字。8px後橫向啟scrub、先縱向則鎖panel scroll或canvas pan，之後不偷變numeric；450ms hold啟ladder。已focus field保留原生caret。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只完成numericcommit存模型；gesture/tap記憶臨時。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: LU-UI-001

## LC-UI-054 — RGBA色票與Color picker

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-054) · Portable

### LC-UI-054/B01

- Given: 已載入圖且入口可用；以下涉及模型保存的斷言僅適用graph-owned值/default，native live另見LC-HOST-036–046
- When: Color欄RGB picker／RGBA numericvalues
- Then: Alpha-aware CSS swatch顯示透明；畫面clamp到0..1但不改HDR/negative存值。picker只改RGB保留exactAlpha，沒改picker色不量化原extendedRGB。numericAlpha同步所有swatches。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: RGBA本體按模型存；色票只是顯示。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: LU-UI-001

## LC-UI-055 — 普通select統一popup交互

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-055) · Portable

### LC-UI-055/B01

- Given: 已載入圖且入口可用
- When: 點合法single-select／鍵盤打開
- Then: 保留原native select值與onchange語意；popup不跟graphzoom縮小，保留optgroup/disabled/translatedlabel。上下/HomeEnd/typeahead只移焦點，Enter/點leaf才input+change各一次，選目前項零事件；Escape/outside/Tab取消。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-056 — 型別階層選單

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-056) · Portable

### LC-UI-056/B01

- Given: 已載入圖且入口可用
- When: type selector popup
- Then: Auto優先；Floating、Integer、Boolean、Matrix、Double(Floating/Matrix)、Array、Struct、Sampler、Other。整數signed再unsigned、矩陣square再rectangular；普通單family／<=5簡化，Double仍階層。窄於600 UI px drillin/back，寬版submenu可反向避邊。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-057 — 節點header/body設定select及型別提示

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-057) · Portable

### LC-UI-057/B01

- Given: 已載入圖且入口可用
- When: 點header type或body operation/field select
- Then: header呈目前配置（如Lengthvec4、Compareint），port呈實際out型別（float/bool）；Compare operation在body首行。NodeType/primary select只在定義支持時出現，固定值節點不提供改型別。更型別先推Auto、再依設定移除本次新失效連線。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 合法option／typeparams存圖。
- Undo/Redo oracle: 本次type/portchange與新失效線清除合一Undo；一般編輯不清先前既有壞線。
- UNKNOWN gates: LU-UI-003

## LC-UI-058 — 型別／家族顏色與分量語義

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-058) · Portable

### LC-UI-058/B01

- Given: 已載入圖且入口可用
- When: 呈現port/typecaption/wire；component naming設定
- Then: wire取source型別色、socket取自己的型別；array沿element色，mat冷石板灰（dark #A1ADB7/light #5D6B78），struct低彩度漸層socket/wire配plain文字（TDMatrix屬struct）。RGBA/XYZW/STPQ等語義可用于分量色／名稱，但不改稳定port ID。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-059 — 低縮放Overview實驗呈現

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-059) · Portable

### LC-UI-059/B01

- Given: 已載入圖且入口可用
- When: lowZoomOverview=true，zoom<30%
- Then: 預設off；開啟後下限20%，嚴格低於30整卡變家族色，隱portcaption/types/inlinevalues/dropdowns、title/body不分。卡尺寸與socket原位不變；左下統一字級，36 graph px但最少10 CSS px，opacity70%。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 開關localStorage；Overview視覺不改圖、card尺寸、collapse狀態。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-060 — 預設／Minimal與八面板布局

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-060) · Portable

### LC-UI-060/B01

- Given: 已載入圖且入口可用
- When: Layout選Default或Minimal
- Then: 目前八panel為AddNode(browser)、Sources(uniforms)、Structures、Parameter、OP Parameter(controls)、GLSL、Preview(live)、Help。Default左300:browser/uniforms/structures，右340:parameters/controls/glsl權重5、live3、help2；Structures/GLSLhidden，header/sidesvisible，floats全關。Minimal同dock結構但header/sideshidden，Parameterupper、Previewlower浮起。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 寫入同 origin 的 localStorage；不存於圖、TOE 或圖 Undo history。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: LU-UI-002

## LC-UI-061 — 側欄panel拖放、tab重排與分組

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-061) · Portable

### LC-UI-061/B01

- Given: 已載入圖且入口可用
- When: 拖panel title/tab到左右side／group上下／body／tabstrip
- Then: 可跨side移動、獨立堆疊或合成tabs、tabstrip插入重排；原DOM重用保持未提交draft與preview。標題點擊選該tab並expand，collapse用独立chevron；hidden保留原placement。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 寫入同 origin 的 localStorage；不存於圖、TOE 或圖 Undo history。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-062 — 側欄與panel分隔尺寸

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-062) · Portable

### LC-UI-062/B01

- Given: 已載入圖且入口可用
- When: 左右divider拖／keyboard；panel group divider
- Then: 左寬180–520、右300–640；preferredwidth保存，窄viewport只clamp不覆蓋偏好，doubleclick只reset該side；keyboard依divider方向調整，Escape回初值。groupheight用weights分配，內容scroll。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 寫入同 origin 的 localStorage；不存於圖、TOE 或圖 Undo history。
- Undo/Redo oracle: 本機layout變更不進圖Undo。
- UNKNOWN gates: 全域限制

## LC-UI-063 — Layout命名preset管理與JSON

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-063) · Portable

### LC-UI-063/B01

- Given: 已載入圖且入口可用
- When: Layout Save/Manage：save/apply/update/rename/delete/import/export
- Then: name trim非空最長80，重名拒；可用keyboardform移panel/order。保存完整currentlayout（groups/active/weights/widths/visibility/floats/collapsed尺寸）；匯出TD-Grape-layout.json含format/version/current。import<=262144bytes，驗schema每panel恰一次才apply。

- Failure oracle: 不合法／重名顯示validation；storage失敗layout.storageError；badimport顯示error不apply。
- Persistence oracle: grapeWorkspaceV1 current；grapeWorkspacePresetsV1 named；下載JSON僅layout不含graph。
- Undo/Redo oracle: 布局操作不在圖Undo；preset apply可重套原preset，非historytransaction。
- UNKNOWN gates: LU-UI-005

## LC-UI-064 — 浮動Parameter/OP與Preview/Help

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-064) · Portable

### LC-UI-064/B01

- Given: 已載入圖且入口可用
- When: 各panel popout；P切Parameter；close返回dock
- Then: upper slot只能Parameter或OP，lower只能Preview或Help；同slot新開取代舊，另一slot保持。搬同一DOM而非新建；selection/tabs/fielddraft預覽保留；P忽略文字、IME、dialog、modifier、repeat。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: Layoutfloating記upper/lower/collapsed，reload恢复；dock位置仍保存。
- Undo/Redo oracle: 本機UI不進圖history。
- UNKNOWN gates: 全域限制

## LC-UI-065 — 浮動收合、上下slot與尺寸

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-065) · Portable

### LC-UI-065/B01

- Given: 已載入圖且入口可用
- When: float headercollapse；width/height/cornerresize，keyboardarrows/Home/End
- Then: 各pane獨立collapsed，header常在。upper右上12px、lower右下12px、間隔12px；Parameterwidth預設320/min280、無自由height或positiondrag；lower兩pane共享preferred320×320,min280×160，left/top/corner resize。keyboard8px，Home/End限值；cancel復原。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: collapsed與preferred尺寸記Layout；暫時viewportclamp不重寫preferred。
- Undo/Redo oracle: 不進圖history。
- UNKNOWN gates: 全域限制

## LC-UI-066 — 側欄／header可見與窄螢幕overlay

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-066) · Portable

### LC-UI-066/B01

- Given: 已載入圖且入口可用
- When: toggleleft/toggleright/toggleheader；Layoutpanelvisibility
- Then: header可隱仍保有恢復入口；desktop記sidebar可見，<=800px使用overlay，不以一次mobile暫關覆蓋desktop偏好。窄螢幕Add成功後關browseroverlay；顯示某panel會啟對應group與side。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: header sgrapeHeaderVisible＋workspacevisibility；sidebar依workspace。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-067 — 主題、密度、亮暗tone與UIscale

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-067) · Portable

### LC-UI-067/B01

- Given: 已載入圖且入口可用
- When: footerAppearance/Size popover
- Then: 初始Standard/Dark；可Standard/Comfortable、Dark/Light、每theme獨立tone[-100,100]整數，±每10，double/rightclick reset0；UIscale75–125整數，±5，double/rightclickreset100。保持node/Parameter DOM、focused draft、graphzoom。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: sgrapeAppearanceV1存size/theme/tones/scale；舊單tone只移到其原theme。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-068 — 實驗設定與預設完整值

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-068) · Portable

### LC-UI-068/B01

- Given: 已載入圖且入口可用
- When: gear Experimental UI
- Then: 三組Toolbar/Nodes/Appearance當下更新，多數不重建圖或丟draft。最新defaults見defaults附錄；choice的合法值由Choices附錄列全。Reset回defaults但保留uiStyle，亦不動另立的ShowLinklines、theme/scale。gesture進行中拒改避免座標錯位。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: sgrapeExperimentsV1 localStorage；不存graph/layout。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: LU-UI-002

## LC-UI-069 — 完整產品偏好重設

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-069) · Environment-bound

### LC-UI-069/B01

- Given: 已載入圖且入口可用
- When: Reset Browser Preferences确认
- Then: 阻擋unfinishedfield、valuegesture、正在寫入；dirtygraph先verified sessioncheckpoint再清明列產品keys，保auth/sessiondraft/同origin其他appkeys。確認後reload；部分storagefail尝试还原，還原失敗明示partial。

- Failure oracle: draft寫不入／readback不一致不reload；remove失敗復原快照，fail或partial提示。
- Persistence oracle: 删除明列偏好与namedlayouts；保留sessiondraft，圖Undo reload不存。
- Undo/Redo oracle: 不能用圖Undo還原；執行前確認。
- UNKNOWN gates: 全域限制

## LC-UI-070 — 重載Editor保留已提交draft

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-070) · Environment-bound

### LC-UI-070/B01

- Given: 已載入圖且入口可用
- When: editor refresh
- Then: unfinishedfield先警告回焦，不默默submit；busy時拒；dirtygraph先序列化graph+revision到sessionStorage並readback，確認保draft後reload。不是重新讀宿主appliedgraph按鈕。

- Failure oracle: unfinished/busy/storagefailed分別阻止；取消confirmation維持頁面。
- Persistence oracle: dirty模型存sessiondraft；未提交field不自動納入，history不跨reload。
- Undo/Redo oracle: 重載不屬可Undo編輯。
- UNKNOWN gates: 全域限制

## LC-UI-071 — 五語言介面與平台modifier提示

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-071) · Portable

### LC-UI-071/B01

- Given: 已載入圖且入口可用
- When: language選en/zh-Hant/ja/fr/ko（完整語言數以locales索引為準）
- Then: 翻譯UI標籤／tooltip／aria；保使用者name、API/GLSLtype/品牌、宿主native labels。類別名稱固定English，部分stage/title/About/Layout保English依locale規則。Command/Ctrl提示依OS，但實際支援Ctrl/Meta，不改graph/Undo。

- Failure oracle: 未知locale忽略；init未知storedlocale fallback default。setLanguage的localStorage.setItem未包try/catch：若storage拒絕會在language已賦值後中斷translate/render；未將其他偏好可在storage失敗時liveapply的保證套在本入口。
- Persistence oracle: sgrapeLanguage localStorage；未設為en。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-072 — 快捷鍵說明與事件隔離

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-072) · Portable

### LC-UI-072/B01

- Given: 已載入圖且入口可用
- When: Help shortcuts按鈕；modal鍵盤／close／backdrop
- Then: 列現有操作與實際OS modifier、shortcut metadata，群組雙欄短screen內容scroll；開時關popovers，Tab留dialog，Escape/close及完整外部down+click關閉回opener，drag-out不關。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: LU-UI-003

## LC-UI-073 — Toolbar響應式overflow

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-073) · Portable

### LC-UI-073/B01

- Given: 已載入圖且入口可用
- When: canvas寬度不足／UIscale與density改變
- Then: 按實際空間整組移入dropdown，保Undo/Redo組合、stage/breadcrumb/Up可達；足夠時移回原control無duplicate。overflow支持keyboard且可打開原Arrange，customnames/GLSL等引用原action。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-074 — 本機時鐘與Fullscreen暫時顯示

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-074) · Portable

### LC-UI-074/B01

- Given: 已載入圖且入口可用
- When: systemClock=true或進Fullscreen
- Then: padded local24h HH:mm，下分鐘精確更新，visibility恢復刷新；只保一timer，disable且非Fullscreen清timer。一般footer fullscreen前，FullscreenFocus仍在可見chrome；不寫graph。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: systemClock偏好local；Fullscreen暫時強制不覆蓋存值。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-075 — 前端FPS儀表

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-075) · Portable

### LC-UI-075/B01

- Given: 已載入圖且入口可用
- When: showFps=true（預設false）
- Then: 顯示瀏覽器RAF frameinterval的FPS、10秒1%low和最慢min，100個100ms bucket trace；1%low不足100樣本顯 unavailable，超固定容量不假報縮短window。關閉/hidden停止量測釋放loop。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: showFps偏好local；歷史frame樣本不保存。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-076 — 把編譯錯誤定位到節點／stage／程式行

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-076) · Portable

### LC-UI-076/B01

- Given: 已載入圖且入口可用
- When: 錯誤banner Go to node／details
- Then: 只接受當前graphversion診斷；顯示Error details、相應stage/path/node並可導航，若帶codeLine選中GLSLtextarea對應段。保留最近successfulshader的資訊不等於UI宣稱新圖已成功。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-077 — 驗證後唯讀GLSL呈現與syntaxhighlight

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-077) · Portable

### LC-UI-077/B01

- Given: 已載入圖且入口可用
- When: GLSL查看入口
- Then: 文字依token分comment/directive/string/number/type/keyword/builtin/function，使用textContent避免HTML；長字／行可scroll。顯示的是產碼結果，不能藉修改viewer改圖。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-078 — 按需GLSL dock panel

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-078) · Environment-bound

### LC-UI-078/B01

- Given: 已載入圖且入口可用
- When: Layout開GLSL；切stage/semanticedit；關panel
- Then: 預設hidden、位右上tab；只有有可見viewer才請求validate並顯目前stagecode，250ms合併、key按graphsemantic+stage+loadgeneration。更版取消stale結果；loading/error替換舊字，error不冒充成功code。

- Failure oracle: API失敗呈generatedGLSL.error；缺當前stage字串呈unavailable；舊serial/key丟棄。
- Persistence oracle: panelvisibility/active/layout保存local；codecache不當作graph資料保存。
- Undo/Redo oracle: 顯示／刷新不建Undo；由圖semanticedit觸發但不產額外history。
- UNKNOWN gates: 全域限制

## LC-UI-079 — 畫布Generated GLSL singleton viewer

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-079) · Portable

### LC-UI-079/B01

- Given: 已載入圖且入口可用
- When: Create搜尋Generated GLSL；duplicate/paste/delete
- Then: 每network最多一個Note-like唯讀viewer，已有時Create隱藏；duplicate/paste整次拒第二個。Vertex/Pixel各自可有，subgraph各自亦可；title/color/twoaxis沿Note但黑底、fontscale最小.1。刪除/Undo恢復singleton可用狀態。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: viewer節點與外觀隨圖；code文本動態產生非可編內容。
- Undo/Redo oracle: 建立/刪除/外觀為正常圖Undo；code更新不加Undo。
- UNKNOWN gates: 全域限制

## LC-UI-080 — 可選接線座標診斷overlay

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-080) · Environment-bound

### LC-UI-080/B01

- Given: 已載入圖且入口可用
- When: URL query ?wire-coordinates（fragment之前）
- Then: 預設完全關閉；啟用顯event/page/screen/visualviewport/graphbasis/socket/tip等座標與yellowcross，最後sample取消後保留供截圖；移除query關overlay/listener，不改graph/偏好/history/network。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: LU-UI-001

## LC-UI-081 — 分類樹、library範圍与inspect詳情

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-081) · Portable

### LC-UI-081/B01

- Given: 已載入圖且入口可用
- When: 左側Add Node Categories/Library accordion；branch展開；點entry
- Then: 分類樹使用primary與secondarycategory（同一路徑去重），沿預定category/branch順序，再字串排序。branch展開狀態跨filter/render保留於會話；單擊只inspect signature/categorypath/help/aliases，不建立。subgraph列inputs/outputs而非假裝GLSL函數。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-082 — 全域搜尋排序與來源filter

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-082) · Portable

### LC-UI-082/B01

- Given: 已載入圖且入口可用
- When: Add Node search／Create search輸入多詞；Escape/clear
- Then: NFKC+lowercase+trim；優先精確name/GLSLname(0)、精確alias(1)、nameprefix(2)、所有詞存在name(3)、name+alias(4)、再category/path/tag(5)、再description(6)。多詞可分散於欄位但必全命中；平手label/key。搜尋跨展開branch/library，仍遵守sourcefilter；empty復原樹。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-083 — 從列表加節點／拖入畫布

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-083) · Portable

### LC-UI-083/B01

- Given: 已載入圖且入口可用
- When: entry +點擊／doubleclick；mouse拖row／mouse或touch拖+
- Then: +與doubleclick在目前viewport偏移(180,160)換graph座標加一節點；drag有效canvas以落點建。rowtouch單tap只inspect避免誤拖；+支持touchdrag。新增Auto遵現有選項；readonly禁insert。窄螢幕成功後收browser。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 真正新增node/source寫圖；inspect/dragpreview不存。
- Undo/Redo oracle: 每次成功新增一筆Undo；無效落點/cancel不新增。
- UNKNOWN gates: 全域限制

## LC-UI-084 — 複製選取與原生文字剪貼簿分工

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-084) · Environment-bound

### LC-UI-084/B01

- Given: 已載入圖且入口可用
- When: Mod+C／toolbarCopy／contextCopy
- Then: 一般copy事件遇input/textarea或native文字選取保文字；點node/frame把焦點帶回canvas並清文字選取後copy圖。顯式Copy只攔自己的copy事件，先保存localgraphclipboard，再execCommand，最後navigatorclipboard可選；拒permission仍localCopy。固定不可刪node排除copy。

- Failure oracle: payload encoding失敗顯clipboard錯誤；systemcopy失敗仍可local，不宣稱OS已複製。
- Persistence oracle: 當前頁localgraphclipboard暫存；系統clipboard可外部保存，不寫graph。
- Undo/Redo oracle: Copy沒有Undo。
- UNKNOWN gates: 全域限制

## LC-UI-085 — Paste入口、可見落點與非同步owner防護

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-085) · Environment-bound

### LC-UI-085/B01

- Given: 已載入圖且入口可用
- When: Mod+V／toolbarPaste／contextPaste
- Then: keyboard取eventtext直接貼；toolbar先讀system（失敗用local），取現在viewport約1/3處而非舊offscreenpointer，重複落點以24px步進且toolbar5次循環防跑出視窗。systemprompt期間換graph/stage/network或readonly則丟結果。

- Failure oracle: invalidpayload顯clipboard.invalid；沒有任何內容提示使用鍵盤shortcut。
- Persistence oracle: 成功插入node/edge寫圖；pasteoffset只會話。
- Undo/Redo oracle: 整次paste一筆Undo；invalidpayload/asyncstale全部不寫。
- UNKNOWN gates: 全域限制

## LC-UI-086 — Delete與Duplicate畫布入口

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-086) · Portable

### LC-UI-086/B01

- Given: 已載入圖且入口可用
- When: Delete/Backspace／toolbar／context；Mod+D
- Then: Delete節點同刪附著edges，選edge則disconnect；固定outputs不可刪。Duplicate使用可複製選取、offset+48，給新node identity/name並選新nodes；source固定規則交data域。readonly禁mutation，textBackspace不刪node。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 寫入目前 network 節點／連線的圖資料；隨圖 JSON 保存。
- Undo/Redo oracle: 一次成功提交是一個圖 Undo/Redo 步驟；取消或無變化不新增步驟。
- UNKNOWN gates: 全域限制

## LC-UI-087 — 固定Vector／Color的數值compact與component展開

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-087) · Portable

### LC-UI-087/B01

- Given: 已載入圖且入口可用
- When: 固定值節點的Components三角
- Then: 目前Vector無input、只有whole output，其手動component數值保於params.components，Color為params.value。compact以同行fields呈現，展開加label；切換ui.componentsExpanded經layout change，一次可Undo，readonly不能寫。不能把舊test中的Vector input/output配對與覆蓋行為算進這個固定值節點。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: node.ui.componentsExpanded與數值存圖，與Parameter WeakMap展開不同；mark寫sessiondraft再走圖保存。
- Undo/Redo oracle: 展開/收回為一次layout Undo；數值提交另一次Undo。
- UNKNOWN gates: LU-UI-006

## LC-UI-088 — 自動Split捷徑與分量接線預覽

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-088) · Portable

### LC-UI-088/B01

- Given: 已載入圖且入口可用
- When: vectoroutput旁Split按鈕；向Vector/Combine分量拉線
- Then: Split建立實際vector_split，位source右260，同Y，繼承xyzw/rgba/stpq/uv並expanded，接value一次Undo；已有同sourceport→split.value則只選現有。分量拉線preview標將覆蓋範圍與被替換線，顯示例如YZ。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: Split節點／連線及componentnames存圖；預覽高亮不存。
- Undo/Redo oracle: 新Split+線一筆Undo；復用只選取不Undo。
- UNKNOWN gates: 全域限制

## LC-UI-089 — 自訂node name內联編輯與輸入正規化

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-089) · Portable

### LC-UI-089/B01

- Given: 已載入圖且入口可用
- When: Show Custom Names後雙擊非source name；Parameter name
- Then: name編輯與Label分離，非法字元即时過濾／空格轉底線；IME composition期間先保留原文，compositionend才清理；Enter非IME或blur提交，Escape回原。duplicate name拒絕，空清理結果不覆蓋原name；顯示functionalprototype不丟。

- Failure oracle: 名稱非法／重名保原名並提示；最大長度/保留字合法性由LC-NODE/LC-DATA identity規則詳述。
- Persistence oracle: node.name隨圖保存；源reference名仍來源所有，不可誤改本地名。
- Undo/Redo oracle: 一次合法name提交可Undo/Redo；拒絕/取消不新增。
- UNKNOWN gates: 全域限制

## LC-UI-090 — 畫布／節點／線context安全與鍵盤

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-090) · Portable

### LC-UI-090/B01

- Given: 已載入圖且入口可用
- When: rightclick／touchhold／ShiftF10/ContextMenu
- Then: 按對象建立不同menu；右擊未選node/edge取代selection，已選保batch；捕捉graph/network/selectedIDs避免staleaction。keyboardanchor畫布中心上1/3，arrow/Home/End循環enableditems，Right/Left開關submenu，Esc回opener，Tab/外點/blur/resize關閉。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-091 — 狀態列不被暫時成功訊息遮掉錯誤

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-091) · Portable

### LC-UI-091/B01

- Given: 已載入圖且入口可用
- When: 提交／連線／保存等status事件
- Then: 持續state/compileerror有優先性；一般操作提示不能覆蓋不同kind的persistenterror，只有匹配recovery可清。saved/applied瞬時訊息不反覆刷，持續badge保留讓使用者辨識graph-saved與shader-applied。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-092 — 固定產品資訊/About與本地release notes

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-092) · Portable

### LC-UI-092/B01

- Given: 已載入圖且入口可用
- When: About按鈕／modal
- Then: 顯示產品名、版號、作者聯絡、credit/dedication及本地打包的release notes入口；technical brand不隨locale改名。關閉回原操作，不改图。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-093 — 矩陣欄位與component展開

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-093) · Portable

### LC-UI-093/B01

- Given: 已載入圖且入口可用
- When: 矩陣node各column三角
- Then: literal矩陣以column值列，Combine/Replace有column輸入，Split為column输出；展開顯scalarports，未展開仍保留有線的componentrow。compact顯可寫值、inherited為—、component覆寫為↳標示與source tooltip。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: ui.matrixColumnsExpanded各column保存於圖；render不改矩陣值。
- Undo/Redo oracle: 每個column切換是一笔layout Undo；scalar值/線另正常Undo。
- UNKNOWN gates: 全域限制

## LC-UI-094 — Node body特定下拉與長度欄位

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-094) · Portable

### LC-UI-094/B01

- Given: 已載入圖且入口可用
- When: Compare body operator；Field bodyfield；Array bodylength
- Then: 目前body確有Compare operator、struct_field field dropdown、array_create length editor；它們引用相同Parameter mutation handler，collapsed/Overview時隱藏。不能由此推論每個node都可自由加任意bodydropdown。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 實際選項／長度寫nodeparams，接口重算由LC-NODE記錄；只顯示不改。
- Undo/Redo oracle: 每次成功params/typechange及需要的本次連線修正合一Undo。
- UNKNOWN gates: 全域限制

## LC-UI-095 — Node詳情區獨立高度與捲動

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-095) · Portable

### LC-UI-095/B01

- Given: 已載入圖且入口可用
- When: 拖browser detail divider；Up/Down/Home/End／doubleclick
- Then: detail preferredheight預設240，通常最低112，上限保留list140或可用高度半邊（取較小）；pointer調高、keyboard8/Shift32，doubleclick回240。viewport clamp不重寫偏好；Escape取消，本身可scroll長文且不pan畫布。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: grapeBrowserDetailHeight localStorage；不在graph或圖history。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-096 — 依目前對象顯示Help

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-096) · Portable

### LC-UI-096/B01

- Given: 已載入圖且入口可用
- When: 選node/source／Structure Help／Personal ?／Preview Help
- Then: Help取目前context與對象：structure轉結構說明、personal顯操作提示、sourcepreset顯expression/name/type；preview在節點選取改变後回nodehelp；普通node先顯plaincomment再類型說明，fixedvalue有專用help。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-097 — Footer action代理與draft保護

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-097) · Portable

### LC-UI-097/B01

- Given: 已載入圖且入口可用
- When: footeractions按鈕／UpDown打開；選Save/Import/Export/Apply等proxy
- Then: 代理原action的disabled/inert，不繞過檢查；popup依可用上下空間放置，鍵盤上下/HomeEnd，Tabdismiss。若有unfinishedfield，pointerdown防止blur、開menu不搶焦，因此不因打開menu偷偷提交draft。

- Failure oracle: 條件不成立時忽略操作；不建立模型變更。
- Persistence oracle: 只改目前編輯器的暫時狀態；不寫入圖 JSON。
- Undo/Redo oracle: 不建立圖的 Undo/Redo 步驟。
- UNKNOWN gates: 全域限制

## LC-UI-098 — 離開頁面前的未存圖／欄位保護

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-098) · Environment-bound

### LC-UI-098/B01

- Given: 已載入圖且入口可用
- When: browser refresh/navigation/close觸发beforeunload
- Then: 當dirty或有pendingfield且不是已授權editorReloading/switchingShader，preventDefault並設returnValue要求browser標準離頁提示；不能承諾browser一定顯示或自動保存未提交field。

- Failure oracle: 受browser決定可能沒有提示；未執行真實OS關閉頁面矩陣。
- Persistence oracle: 單純離頁guard不存資料；sessiondraftcheckpoint及explicitreload另記LC-UI-070。
- Undo/Redo oracle: 不屬圖history。
- UNKNOWN gates: LU-UI-001

## LC-UI-099 — GLSL modal一次查看Vertex與Pixel

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-099) · Environment-bound

### LC-UI-099/B01

- Given: 已載入圖且入口可用
- When: 主toolbar/overflow/footer GLSL按鈕
- Then: 直接呼validate({graph})成功後，以// VERTEX（若有）和// PIXEL標頭合併GLSL到唯讀syntaxhighlightedmodal；失敗statuserror而不開新modal。與按需stage-only dockviewer是不同入口。

- Failure oracle: API錯誤由status顯示；此handler未看到與graph/stage generation核對，可能顯已換圖前的回應，LU-UI-007。
- Persistence oracle: 此viewer文字不存graph或history。
- Undo/Redo oracle: 查看／close不加Undo。
- UNKNOWN gates: LU-UI-007

## LC-UI-100 — 全域圖／原生值歷史的順序、Undo與Redo分派

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-100) · Environment-bound

### LC-UI-100/B01

- Given: 先移node、提交一個native值、再移node且history可用
- When: 連續三次Undo，再三次Redo
- Then: 分別還原最後位置、native值、最初位置；相反方向重做，不用Apply次數取代使用者步驟。

### LC-UI-100/B02

- Given: 已有Redo分支
- When: no-op graph edit／同值native write／live取消回空receipt
- Then: 沒有有效新變更不永久清空Redo；真正新edit才清Redo。

### LC-UI-100/B03

- Given: Undo等待Apply或native restore，或host拒絕這次restore
- When: 回覆尚未到或拒絕
- Then: 有效stackcursor不先pop；成功後才移項；錯誤可顯示並重試，空live預約可例外跳過。

### LC-UI-100/B04

- Given: 另一個load已成功替換圖
- When: 舊Apply或history-restore回覆晚到
- Then: 這兩條路徑的loadgeneration檢查避免舊graph/native snapshot覆蓋新編輯圖；新stack從空開始。live-restore await後沒有同等核驗，不由這一條推論其安全性。

- Failure oracle: graph與預期snapshot/epoch不符、token失效或host restore拒絕，顯history.failed且不pop有效項；可重試同一Undo。僅無receipt空live預約可跳過/移除；Apply與history-restore的舊回應在明確generation檢查處忽略；live分支例外另列。例外：live-restore分支await後沒有再次generation核验；一般UI busy会挡Reload，但外部load並發尚不能聲稱同等隔離（LU-UI-009）。
- Persistence oracle: past/future/receipts只本頁與目前載入generation；Apply成功不清stack；load()成功清兩stack。切Shader用頁面navigation，sessionStorage僅留圖draft/revision，不留history。
- Undo/Redo oracle: 此項即history本體。graph gesture在其commit只記一次，apply debounce650ms不把多次使用者edit合成一步；live手勢先預約順序再等receipt，取消/no-op可刪空預約並保原Redo。
- UNKNOWN gates: LU-UI-009

## LC-UI-101 — 確認捨棄編輯狀態並重讀宿主已套用圖

[詳細規格](LEGACY_CAPABILITIES.md#lc-ui-101) · Environment-bound

### LC-UI-101/B01

- Given: clean或dirty圖、任意history，無busy/fielddraft
- When: 打開Reload Applied確認再Cancel/Escape
- Then: Cancel預先focus；打開不fetch或改模型，原graph/history/view保留；原先排程autoApply可在關閉後恢復。

### LC-UI-101/B02

- Given: 有unfinished numeric/GLSL/body field或活躍ladder
- When: 點Reload Applied
- Then: 不blur提交、不開dialog，保draft並提示；可聚焦的field回焦。

### LC-UI-101/B03

- Given: 確認對話開啟且busy/draft二次檢查通過
- When: 明確確認且state API成功
- Then: 只fetch已套用圖，丟當頁工作圖、清history、dirty=false，不送出被丟圖的Apply；此操作無Undo。

### LC-UI-101/B04

- Given: 確認後state API尚未傳回任何圖就失敗
- When: 錯誤被回報
- Then: 原圖與past/future仍保留並顯error；不泛稱已撤銷load開始的live/generation副作用。

- Failure oracle: 確認時變busy/有draft則留modal顯原因。state request在取得結果前失敗保原graph/history並報statuserror；autoApply不再因這次confirm自動resume。load後段錯誤並非原子rollback保證（LU-UI-008）。
- Persistence oracle: 成功取代目前記憶體graph；不保存TOE，也不Apply被捨棄graph。目前流程未刪sessionStorage draftKey，後續整頁初始化可能再提示舊draft（LU-UI-008）。
- Undo/Redo oracle: 成功load清圖past/future，不可用Undo把被捨棄狀態找回；Cancel/Escape不碰history。
- UNKNOWN gates: LU-UI-008

## LC-HOST-001 — 由 Shader 開啟對應 Editor，沿用或辨識管理者

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-001) · Environment-bound

### LC-HOST-001/B01

- Given: 生成 Shader 存在；管理者可唯一辨識
- When: 既有 Grape Shader 的 Openeditor Pulse
- Then: 進入該 Shader 的 /shader/<32hexID>/，不是不帶對象的首頁；無法辨識時顯示需安裝所屬元件。

- Failure oracle: 相同 manager ID 不是唯一且全場也非唯一管理者時拒絕；服務或開瀏覽器的錯誤回報。
- Persistence oracle: Shader ID／manager ID 在 COMP storage；網址 token 為服務 session；開頁本身不保存 TOE。
- Undo/Redo oracle: 開頁／註冊不是圖的 Undo 步驟。
- UNKNOWN gates: LU-HOST-002

## LC-HOST-002 — Open Editor 的桌面視窗啟動與一般瀏覽器備援

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-002) · Environment-bound

### LC-HOST-002/B01

- Given: http/https Editor URL 已建立
- When: Openeditor 或 Openinbrowser Pulse
- Then: 支援的 Windows 安裝嘗試 app 視窗；其餘正常開頁；不因失敗反覆開分頁。

- Failure oracle: 非 http/https 拒絕；spawn 錯誤備援；一般 opener 自身錯誤仍拋出；程序 code 0 視為已交接既有瀏覽器。
- Persistence oracle: 無 Graph／TOE 寫入；瀏覽器自身視窗持續性不由此功能保证。
- Undo/Redo oracle: 不納入圖或參數 Undo。
- UNKNOWN gates: LU-HOST-001

## LC-HOST-003 — 列出管理範圍內的 Shader 並安全切換編輯目標

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-003) · Environment-bound

### LC-HOST-003/B01

- Given: Editor 已連接一個有效 Shader
- When: GET shaders；選另一 Shader；Apply and switch／Keep draft and switch
- Then: 乾淨圖直接前往新 ID；保留草稿經寫入回讀成功才離開；套用失敗維持原圖。

- Failure oracle: 重複／壞 ID 或未註冊者略過；較新版本列有原因且選項停用；storage失敗不離頁；忙碌拒絕切換。
- Persistence oracle: Keep draft 存 sessionStorage 的 shader-specific key，非 native state；工程 path 只顯示。
- Undo/Redo oracle: 導航本身不建圖 Undo；每頁既有編輯 history 不跨導航承諾保存。
- UNKNOWN gates: 全域限制

## LC-HOST-004 — 新 Shader 與複製模板取得独立身分／原生輸出口

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-004) · Environment-bound

### LC-HOST-004/B01

- Given: 對應 master 存在；目標網路允許建立 OP
- When: Create Grape MAT／TOP Pulse，或 TDFam 放置模板
- Then: 各副本可独立編輯；名字撞名自動增量；既有 Shader viewer flag保留，新建立者開啟。

- Failure oracle: 模板缺失拒絕；新建configure/compile失敗刪除此次新Shader；壞既有state不以預設覆蓋。
- Persistence oracle: 圖／程式碼／參數儲存於新COMP；需使用者保存TOE或TOX才有磁碟持久性。
- Undo/Redo oracle: 此流程無自訂graph Undo；TD原生copy/create是否形成全域Undo未在此程式建立明確契約。
- UNKNOWN gates: LU-HOST-001

## LC-HOST-005 — 將 Grape MAT/TOP 與材質範本登錄到原生建立選單

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-005) · Environment-bound

### LC-HOST-005/B01

- Given: manager有tdfam extension與masters
- When: manager啟動或Registertdfam Pulse
- Then: Status為Ready或具體錯誤；最多每秒一次共10次等待；已被其他component擁有時不搶占。

- Failure oracle: 未知選單layout只保留原樣式不阻止建立Shader；TDFam unavailable提示手動retry。
- Persistence oracle: 範本manifest包含名字、分類、相容family與保存欄位；執行中registry不等於持久圖。
- Undo/Redo oracle: 註冊狀態無圖Undo；TDFam Update/Stub明確回False。
- UNKNOWN gates: 全域限制

## LC-HOST-006 — 提供四種可編輯材質範本及中性貼圖預設

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-006) · Environment-bound

### LC-HOST-006/B01

- Given: 內嵌material_presets資料可讀；TD材質函數與geometry來源可用
- When: 選範本建立MAT，或讀取MAT examples
- Then: 範本本身是可編輯圖；產生TBN正常貼圖，沒有另加像素微分切線；PBR含.08反射係數與roughness下限.0001。

### LC-HOST-006/B02

- Given: 建立 Phong MAT Graph 並保留預設連線，幾何與宿主輸入有效
- When: 檢查生成圖的材質數值、Alpha 及 Point Color 路徑
- Then: 依 variants[phong].compositionSteps 順序組合，再執行其 pixelFinishing；這是應驗證的 fixture 行為，未聲稱本輪已驗證GPU像素結果。

### LC-HOST-006/B03

- Given: 建立 PBR MAT Graph 並保留預設連線，幾何與宿主輸入有效
- When: 檢查生成圖的材質數值、Alpha 及 Point Color 路徑
- Then: 依 variants[pbr].compositionSteps 順序組合，再執行其 pixelFinishing；這是應驗證的 fixture 行為，未聲稱本輪已驗證GPU像素結果。

### LC-HOST-006/B04

- Given: 建立 Phong Material Textured 並保留預設連線，幾何與宿主輸入有效
- When: 檢查生成圖的材質數值、Alpha 及 Point Color 路徑
- Then: 依 variants[phong_textured].compositionSteps 順序組合，再執行其 pixelFinishing；這是應驗證的 fixture 行為，未聲稱本輪已驗證GPU像素結果。

### LC-HOST-006/B05

- Given: 建立 PBR Material Textured 並保留預設連線，幾何與宿主輸入有效
- When: 檢查生成圖的材質數值、Alpha 及 Point Color 路徑
- Then: 依 variants[pbr_textured].compositionSteps 順序組合，再執行其 pixelFinishing；這是應驗證的 fixture 行為，未聲稱本輪已驗證GPU像素結果。

- Failure oracle: 編譯錯誤按新Shader建立失敗處理；不承諾缺少切線的任意geometry可正確normal mapping。
- Persistence oracle: 圖與中性貼圖隨COMP；外部TOP引用依原生工程；使用者調整不回寫master。
- Undo/Redo oracle: 範本內後續圖編輯依一般圖history；建立本身未自訂history。
- UNKNOWN gates: 全域限制

## LC-HOST-007 — 生成資源在管理／編輯元件不存在時仍可渲染

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-007) · Environment-bound

### LC-HOST-007/B01

- Given: 先前成功生成資源仍存在；所引用外部資源仍可用；在相容TD版本
- When: 關閉Editor或移除manager；使用既有Shader
- Then: 既有Shader繼續输出；沒有manager時Open Editor需可辨識管理者才能恢復編輯。

- Failure oracle: 缺失外部TOP／driven來源或不相容TD版本仍可失敗；不保證任意平台／版本或所有原生資源永遠可用。
- Persistence oracle: 資源隨TOE/TOX保存；snapshot docs有歷史測試報告，未在本次刪除manager或重開TD驗證。
- Undo/Redo oracle: 渲染持續不涉及Undo；已記錄native參數Undo callback保留原物件，不必新找manager。
- UNKNOWN gates: LU-HOST-001

## LC-HOST-008 — 可選要求 Editor session token，預設不要求

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-008) · Environment-bound

### LC-HOST-008/B01

- Given: runtime已啟動；若要求token需拿到當前開啟連結
- When: TD manager Requiretoken toggle；Editor API請求
- Then: 有效憑證正常讀寫；缺失／不符回401；選項切換保持port、token與queue。

- Failure oracle: 不正確token與啟用驗證後的舊憑證請求拒絕，body不套用。
- Persistence oracle: 要求驗證的設定是manager參數；token非圖欄位；頁面token只存分頁sessionStorage。
- Undo/Redo oracle: 設定不走graph Undo；驗證失敗無mutation。
- UNKNOWN gates: LU-HOST-003

## LC-HOST-009 — 切換區網可達性但不改變正在編輯的 Shader

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-009) · Environment-bound

### LC-HOST-009/B01

- Given: TD networking可bind目前port
- When: Allowlan toggle
- Then: 開啟後可使用列出的區網IP連結；關閉後不再接收非loopback；失敗不漂移到新port。

- Failure oracle: strict rebind失敗恢復舊mode並顯示錯誤；不自動修改防火牆。
- Persistence oracle: Allowlan為manager參數；addresses定期刷新；port/token存服務生命期與manager記錄，非graph。
- Undo/Redo oracle: 不走圖Undo。
- UNKNOWN gates: 全域限制

## LC-HOST-010 — 拒絕錯誤來源／格式的 Editor 控制請求

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-010) · Environment-bound

### LC-HOST-010/B01

- Given: 連到現行listener
- When: 任何Editor HTTP API請求
- Then: 錯誤Host／Origin回403；Transfer-Encoding或重複長度回400；錯mime415；過大413；壞JSON400；有效請求才排入TD。

- Failure oracle: 關閉拒絕請求連線，不消耗套用body；缺Origin可接受，不等於跨origin授權。
- Persistence oracle: 無圖持久狀態；安全response headers no-store、nosniff、no-referrer與CSP。
- Undo/Redo oracle: 拒絕無Undo紀錄。
- UNKNOWN gates: 全域限制

## LC-HOST-011 — 分享當前 Shader 的可選位址、QR 與複製連結

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-011) · Environment-bound

### LC-HOST-011/B01

- Given: 目前頁有正確Shader path；分享者持有必要token
- When: 開啟UI Share，選address，Copy或掃QR
- Then: 連結保留目標Shader；loopback提示僅本機；複製失敗改選文字手動複製；查詢失敗仍保留目前頁連結。

- Failure oracle: requiretoken且目前缺token時不提供其他origin；壞origin去除；QR生成錯誤有提示。
- Persistence oracle: 分享面板選項為當頁暫態；token不寫Graph也不放query。
- Undo/Redo oracle: 分享不納入Undo。
- UNKNOWN gates: 全域限制

## LC-HOST-012 — 無明確 Shader 的入口不任意猜測目標

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-012) · Environment-bound

### LC-HOST-012/B01

- Given: Editor服務仍存在
- When: 直接開根URL或對已刪除Shader的URL發API
- Then: 不將寫入轉給另一個Shader；顯示從指定Shader開Editor的提示。

- Failure oracle: 失效ID提示Shader no longer exists；路由不符拒絕。
- Persistence oracle: 不持久猜測性關聯；合法ID原有storage不改。
- Undo/Redo oracle: 失敗无Undo。
- UNKNOWN gates: 全域限制

## LC-HOST-013 — 連線中斷後只讀恢復與revision衝突辨識

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-013) · Environment-bound

### LC-HOST-013/B01

- Given: 有既有Editor圖；TD可能恢復
- When: 網路失敗、TD不回應、Retry／online事件
- Then: 同revision只恢复連線；revision變更顯示需要review而不覆盖草稿；lost write response不自動重送。

- Failure oracle: 401/403/changed不自動輪詢；20秒clienttimeout；服務15秒queue等待逾時或queue滿回503，不推定尚未/已寫入。
- Persistence oracle: 連線提示是當頁暫態；既有草稿保存由資料域負責；不自動保存TD工程。
- Undo/Redo oracle: retry不建Undo；先前已實際接受的操作由其原history規則處理。
- UNKNOWN gates: 全域限制

## LC-HOST-014 — 套用時拒絕過期 revision 與不相容目標

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-014) · Environment-bound

### LC-HOST-014/B01

- Given: 已存在有效可編輯saved state
- When: POST apply(graph,revision)
- Then: stale revision回Conflict，MAT/TOP不一致拒絕；合法才進入candidate驗證。

- Failure oracle: 未知/newer state、缺source、target mismatch明確error；不能靠不同編輯頁最後寫入取勝。
- Persistence oracle: 成功才寫state revision；preflight失敗不寫圖。
- Undo/Redo oracle: 拒絕不記宿主Undo；瀏覽器草稿可保留。
- UNKNOWN gates: 全域限制

## LC-HOST-015 — 新 Shader 先驗證再套用，失败保留最後成功輸出

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-015) · Environment-bound

### LC-HOST-015/B01

- Given: 可取得現有Shader與其原生control狀態
- When: 有效revision的Apply或Update Shader
- Then: 成功更新既有OP並revision+1；失敗仍保留lastgoodcode與輸出，告知source/shader error。

- Failure oracle: 不使用新compiler重新生成舊code作rollback；回復本身遇宿主故障的完整性尚未实机驗證（LU-HOST-005）。
- Persistence oracle: 成功state／graph／GLSL／manifest保存在ShaderDAT；临時candidate finally销毁；不等於project.save。
- Undo/Redo oracle: Apply不是TD全域native graph Undo；前端圖history可回草稿再Apply，與nativevaluehistory不同。
- UNKNOWN gates: LU-HOST-005

## LC-HOST-016 — 純佈局保存不重新配置或編譯 Shader

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-016) · Environment-bound

### LC-HOST-016/B01

- Given: 現有版本、catalogcontract、code及bindings fingerprint仍current
- When: 只改節點位置、大小等仍產生相同compiled結果後Apply
- Then: 回Graph layout saved；nativeOP/Par identity、Bind和held Uniform gesture保持；不呼叫configure/validate。

- Failure oracle: 版本/helper/fingerprint不current時不能冒充layout-only，回到正常更新驗證。
- Persistence oracle: 最新layout仍寫native graph/stateDAT；live值不倒退。
- Undo/Redo oracle: layout變更按前端圖history；不產生nativevalue Undo。
- UNKNOWN gates: 全域限制

## LC-HOST-017 — 宿主編譯錯誤定位，非致命 warning 分開處理

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-017) · Environment-bound

### LC-HOST-017/B01

- Given: 有compile_info與compiled diagnostic map
- When: candidate或正式Shader驗證；前端讀取compile diagnostics
- Then: 拒絕不能用的Shader且可回到相關節點；一般warnings不一概當error；驗證場景不改用戶Render的lights。

- Failure oracle: 没有期待的Linked／compile成功字樣也拒絕；native文字格式变化的跨版本保障未验证。
- Persistence oracle: lastError/前端diagnostics依runtime輸出；不把驗證fixture當用戶場景保存。
- Undo/Redo oracle: 診斷不建Undo；改圖後舊diagnostic不得錯指新節點，UI域另記。
- UNKNOWN gates: LU-HOST-001

## LC-HOST-018 — 新於目前版本或損壞保存資料的保護性唯讀

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-018) · Environment-bound

### LC-HOST-018/B01

- Given: Shader仍存在且可讀取其DAT
- When: GET state或嘗試修改unsupported Shader
- Then: state回readOnlyReason或savedStateIssue；前端readonly；不自動用demo覆蓋；預覽endpoint不依賴圖解析成功。

- Failure oracle: manifest壞或version不是三數格式拒絕更新；state-source超16MB提示由TD保存DAT。
- Persistence oracle: 原始state/graph保留；救援原始匯出由資料域完整記錄。
- Undo/Redo oracle: readonly操作不產生Undo；已有輸出不回滾為空。
- UNKNOWN gates: 全域限制

## LC-HOST-019 — 圖升級需檢查當前內容並以單次票據確認

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-019) · Environment-bound

### LC-HOST-019/B01

- Given: 可識別版本及current state；候選沒有blockedupgrade
- When: inspect／accept upgrade後Apply
- Then: 相同被檢閱內容只准確認一次，10分鐘後失效；成功留一份原先state/graph/manifest/code的upgrade_backup。

- Failure oracle: 編輯器外code變更、catalog变、candidate改、過期或重用票據全部拒絕；userDAT占backup名也拒絕。
- Persistence oracle: pendingtickets session內最多8；backup一份nativeDAT，非graph裡新增巨大歷史。
- Undo/Redo oracle: 票據不是Undo；backup為救援资料不等於一鍵undo承諾。
- UNKNOWN gates: 全域限制

## LC-HOST-020 — 批次更新管理範圍內已保存的 Shader

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-020) · Environment-bound

### LC-HOST-020/B01

- Given: manager可列舉ownedshader；其savedgraph可讀
- When: manager Updateshaders Pulse
- Then: Last Update列updated/current/review/failed數與首個error；不變者revision不增；成功者revision增加，舊頁下次寫入衝突。

- Failure oracle: 較新版本／需review／編譯失敗各自回報且保留該Shader；不是TDFam整件替換。
- Persistence oracle: 新成功artifact留在既有COMP；仍由使用者決定何時保存TOE。
- Undo/Redo oracle: 無跨全部Shader的原生Undo交易；graphhistory不包含此manager操作。
- UNKNOWN gates: 全域限制

## LC-HOST-021 — 保留原生 Viewer 開窗能力但目前按鈕隱藏

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-021) · Environment-bound

### LC-HOST-021/B01

- Given: peer與destination皆loopback；無Forwarded header；Origin與editorOrigin符合
- When: 具local origin證明的POST native-viewer
- Then: 已有Viewer重用／前景顯示；不Apply、不saveTOE、不開GLSL參數；不能宣稱目前UI可點選。

- Failure oracle: LAN、gateway forwarded、缺origin等403；已刪除目標拒絕。
- Persistence oracle: 視窗位置由TD管理；此API無圖狀態持久化。
- Undo/Redo oracle: 無圖Undo。
- UNKNOWN gates: LU-HOST-004

## LC-HOST-022 — 開啟對應原生 GLSL 參數視窗

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-022) · Environment-bound

### LC-HOST-022/B01

- Given: 目標generatedShader及內部GLSL OP仍存在；API通過通用認證/來源guards
- When: Glslparameters Pulse；POST native-parameters
- Then: 對正確內部GLSL OP開Parameters，不套用草稿或重編。

- Failure oracle: missingtarget報錯；API可能在LAN呼叫時也開本機視窗，此是否預期需求未確認。
- Persistence oracle: 視窗狀態由TD；不保存Graph。
- Undo/Redo oracle: 無graph Undo。
- UNKNOWN gates: LU-HOST-004

## LC-HOST-023 — 保留 MAT/TOP 圖像快照 API 及取消安全

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-023) · Environment-bound

### LC-HOST-023/B01

- Given: ShaderOP可供view/cook；TD Cooking與drawframe前進
- When: GET preview
- Then: 回當前圖像；等待MAT時其他API仍可處理；取消／刪除／替換目標後不錯抓另一對象。

- Failure oracle: 無target回空bytes；GPU/cook錯誤回error；captureidentity變更拒絕；請求取消不再讀GPU。
- Persistence oracle: PNG不存TOE；capture是manager側臨時OP；原生Shader自身輸出保存另述。
- Undo/Redo oracle: 取圖無Undo。
- UNKNOWN gates: 全域限制

## LC-HOST-024 — 遠端預覽顯式連接、停止與重新取得控制

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-024) · Environment-bound

### LC-HOST-024/B01

- Given: manager有Active RemotePanel且output存在
- When: 首次可見preview或手動Refresh／Start／Stop
- Then: 顯示connecting/connected/replaced/error；手動refresh可以再次取得目標串流；隱藏不發初始連接。

- Failure oracle: RemotePanel不存在／inactive／无output回錯誤；自訂element10秒未定義失敗；不因失敗重複搶控制。
- Persistence oracle: peer連線與previewAttempted為session；不保存成Graph配置。
- Undo/Redo oracle: 連接／停止不走graph Undo。
- UNKNOWN gates: LU-HOST-001

## LC-HOST-025 — 預覽交接票據在實際連接前不改變現用來源

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-025) · Environment-bound

### LC-HOST-025/B01

- Given: 請求的TD target仍存在
- When: POST remote-preview→remote signal帶ticket
- Then: 有效ticket使用一次並選正確source；過期／已消耗／刪除target／偽ticket不會踢現有peer。

- Failure oracle: ticket儲存最多32且淘汰最舊；驗證失敗只拒新客戶。
- Persistence oracle: ticket僅memory，stop清空；Graph無ticket。
- Undo/Redo oracle: 交接不走Undo；會release舊輸入避免held button。
- UNKNOWN gates: 全域限制

## LC-HOST-026 — 單一遠端 receiver 接管與獨立面板的 LAN 範圍

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-026) · Environment-bound

### LC-HOST-026/B01

- Given: RemotePanel Active；LAN規則允許來源
- When: standalone panel連接或新browser以合法ticket連接
- Then: 始終一個activeclient；旧client不再控制；loopback IPv4/IPv6可用；未授權來源403。

- Failure oracle: signal路徑錯、來源不符、answer重複、ICE超界或失效connection不套用；standalone HTTP只GET。
- Persistence oracle: copies/load不能恢復舊peer；設定可留COMP但client/tickets不持久。
- Undo/Redo oracle: 連線接管無graph Undo。
- UNKNOWN gates: 全域限制

## LC-HOST-027 — MAT 與 TOP 各自 Viewer 路由及僅換來源自動 Home

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-027) · Environment-bound

### LC-HOST-027/B01

- Given: 對應customviewer存在且target可解析
- When: 切Targetop／Source／Panel或新previewhandoff
- Then: MAT/TOP顯示對應Viewer；Home前release所有輸入；保留使用者viewer內部參數階層。

- Failure oracle: 錯target／panel讓stream停用並回error，不繼續操作舊panel。
- Persistence oracle: Targetop/Source為native參數；navigation與peer為session；無Graph欄位。
- Undo/Redo oracle: Home/切preview來源不納入圖Undo。
- UNKNOWN gates: 全域限制

## LC-HOST-028 — 讀取目前個別 Viewer 的參數與原生分節資訊

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-028) · Environment-bound

### LC-HOST-028/B01

- Given: 當前peer、revision及customviewer匹配
- When: 預覽focus後Parameter頁要求viewer-parameters
- Then: 只顯示當前viewer參數；換source後discard旧snapshot；表達原生分節供UI使用。

- Failure oracle: 非customviewer或stalepeer/revision拒絕；未知style略過；browser5秒無回應提示。
- Persistence oracle: snapshot當次讀值；不寫graph或複製viewer設定到圖。
- Undo/Redo oracle: 讀取無Undo。
- UNKNOWN gates: 全域限制

## LC-HOST-029 — 個別 Viewer 參數以預期值寫入並回讀

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-029) · Environment-bound

### LC-HOST-029/B01

- Given: 與snapshot同一viewer/revision；expected仍相等
- When: viewer-parameter-value
- Then: 寫後回實際snapshot；menu需在names內，numeric需finite/int整數，超出啟用clamp的上下限直接拒絕而非截值；OP存在且family符合；參數不重置view。

- Failure oracle: target身份/expected/模式變拒絕；字串>2048拒絕；Pulse需boolean且false不pulse。
- Persistence oracle: viewer Par是native狀態，能否全數保存TOE與camera transient區別需原生驗證；不存Graph。
- Undo/Redo oracle: 直接寫Par或pulse，程式沒有graphhistory或自訂nativeUndo wrapper；不聲稱可Undo。
- UNKNOWN gates: LU-HOST-006

## LC-HOST-030 — 遠端滑鼠以畫面正規化座標控制，不因focus排版跳動

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-030) · Environment-bound

### LC-HOST-030/B01

- Given: 當前channelopen；pointer在有效畫面或已捕捉拖曳
- When: mouse down/drag/up／wheel於remotevideo
- Then: 遠端位置與實際圖像一致；首下無jump；來源/stalepeer事件忽略；release終止原生操作。

- Failure oracle: 非finite、buttons超0..7、u/v超-1..2拒絕；wheel限制±10；pointercancel/lostcapture釋放。
- Persistence oracle: camera/panel互動由viewer維持，basis只此次gesture；不存Graph。
- Undo/Redo oracle: 不使用graph Undo；原生viewer transform歷史無額外承諾。
- UNKNOWN gates: 全域限制

## LC-HOST-031 — 觸控單指點拖、雙指平移／縮放與多指取消

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-031) · Environment-bound

### LC-HOST-031/B01

- Given: 當前source宣告3D touch navigation才能雙指操作
- When: remotevideo touch pointer events
- Then: 第二指取消未發出的tap；pan送rightdrag，pinch送middledrag保持虛擬u；三指或取消release且剩一指不續成新drag。

- Failure oracle: 第三指或不支援雙指source停止操作；取消／disconnect不留下buttondown。
- Persistence oracle: gesture只memory；navigation最終結果由Viewer保持。
- Undo/Redo oracle: 無graph Undo；Cancel觸控是停止輸入，不宣稱回復先前camera。
- UNKNOWN gates: 全域限制

## LC-HOST-032 — 只轉送明確的 Home 快捷鍵並處理焦點／釋放

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-032) · Environment-bound

### LC-HOST-032/B01

- Given: document可見且hasFocus，當前datachannelopen與shortcut宣告
- When: 在remotevideo按H；失焦／disconnect／換來源
- Then: 只重置當前有效來源；舊revision／removedtarget不誤控；Tab等照瀏覽器行為。

- Failure oracle: modifier、IME、repeat、非H、沒focus或不支援時不送；stale快捷拒絕。
- Persistence oracle: 快捷／focus為UI runtime；不寫Graph。
- Undo/Redo oracle: Home不納入graph Undo。
- UNKNOWN gates: 全域限制

## LC-HOST-033 — 預覽跟隨視窗大小，等候layout／gesture穩定才改encoder

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-033) · Environment-bound

### LC-HOST-033/B01

- Given: follow-size屬性且connected，尺寸finite正數
- When: preview ResizeObserver／panel resize，pointer release後
- Then: 相同尺寸不重送；更新尺寸維持同peer/source、不Home；standalone可手動固定尺寸。

- Failure oracle: hidden或不啟用時不送；badsize拒絕；stale revision resize忽略。
- Persistence oracle: 實際width/height native參數改變；pendingtimer只session；不改Graph。
- Undo/Redo oracle: 不走graph Undo。
- UNKNOWN gates: 全域限制

## LC-HOST-034 — MAT 套用期間暫停預覽擷取避免中間空白畫面

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-034) · Environment-bound

### LC-HOST-034/B01

- Given: RemotePanel目前connected且targetidentity相同
- When: Apply／Update目前預覽MAT
- Then: 中間reconfigure不顯露在串流；release恢復先前lock/active值，不清掉使用者原鎖。

- Failure oracle: nativeapply失敗也finallyrelease；source被換/斷線清hold，不持續卡住舊來源。
- Persistence oracle: hold token暫態，不存Graph／TOE作為持久lock。
- Undo/Redo oracle: 无獨立Undo；跟隨所包Apply成功/失敗。
- UNKNOWN gates: 全域限制

## LC-HOST-035 — 預覽 cook／heartbeat 與停止後資源清理

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-035) · Environment-bound

### LC-HOST-035/B01

- Given: TD tick持續執行才能服務
- When: preview start/stop、TD Cooking停止、peer消失
- Then: 離線/錯誤回可見狀態；停止釋放nativebutton、RTC、socket、ticket、capturehold，不從savedcopy自動連舊peer。

- Failure oracle: 失效RTC忽略舊callback；autoplay失敗提示點panel播放；任意desktop/網際網路時序不能保證。
- Persistence oracle: 連線/heartbeat/tickets不持久；Active及native設定屬COMP。
- Undo/Redo oracle: 無graph Undo。
- UNKNOWN gates: 全域限制

## LC-HOST-036 — 讀取 Uniform 真實宿主值與可寫狀態而不改圖預設

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-036) · Environment-bound

### LC-HOST-036/B01

- Given: 已保存Shader及可查nativebinding
- When: GET uniforms或source value snapshot
- Then: 看見宿主實際值，與圖declaration default不混淆；matrix/array binding狀態可返回但不假裝所有種類都支援live手勢。

- Failure oracle: 原生分量讀取失败只該component不可讀；unsupported/newerShader寫入仍被保護。
- Persistence oracle: snapshot不存Graph；native值按TD保存，default留圖。
- Undo/Redo oracle: 讀值無Undo；動畫變化不應被當source結構編輯history。
- UNKNOWN gates: 全域限制

## LC-HOST-037 — 一次 Uniform 值修改以 revision／expected 保護

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-037) · Environment-bound

### LC-HOST-037/B01

- Given: native目標可寫，source仍存在且expected沒變
- When: POST uniform或source-value具數值
- Then: 僅指定值變更，回actualsnapshot；GLSL、graphdefault不因一般Uniform現值重新產碼。

- Failure oracle: staleexpected/readonly/badtype/missing拒絕；revision conflict無重送；write reply lost由讀回恢復。
- Persistence oracle: native值在TD參數；source宣告預設不被當此次live現值保存。
- Undo/Redo oracle: changed值交nativeUndo callback；no-op不建entry；Editor值history另由receipt/checkpoint處理。
- UNKNOWN gates: 全域限制

## LC-HOST-038 — 貼圖選擇只接受有效外部 TOP 或空值預設

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-038) · Environment-bound

### LC-HOST-038/B01

- Given: sampler來源仍存在，revision及expected值/模式匹配
- When: exposedtexture值修改／custom TOP picker
- Then: 合法TOP即時供sample；空值不失去中性內建來源；非法不改原值。

- Failure oracle: 壞path／wrongfamily／內部循環性來源拒絕；外部expression之後變壞時helper標invalid並用bundledfallback。
- Persistence oracle: TOP參數存原生引用；外部OP本體不打包進Graph；未override的default仍隨Shader。
- Undo/Redo oracle: nativeUndo會檢查old/newTOP身份，不以相同path的新OP代替；control定義Undo不回退最新選圖。
- UNKNOWN gates: 全域限制

## LC-HOST-039 — native Bind 鏈可編輯終端 Constant 而保留driver

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-039) · Environment-bound

### LC-HOST-039/B01

- Given: 整條鏈可安全辨識且終端是可寫Constant
- When: nativeUniform live或source-value嘗試修改Bind值
- Then: 值寫終端master，所有中間Bindmode/expr保留；Expression／Export終端只讀。

- Failure oracle: cycle、超64層、disabled、readonly、invalid無可寫target；同path重建master會改valueidentity並拒stalegesture。
- Persistence oracle: 原生Bind表達式保存於TD；valueidentity handles僅session，最多16384。
- Undo/Redo oracle: Undo仍須保留source/currenttype/Par身份；不能以解Bind方式完成Undo。
- UNKNOWN gates: LU-HOST-003

## LC-HOST-040 — 即時訂閱可見 Uniform 集合，只推改變的值

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-040) · Environment-bound

### LC-HOST-040/B01

- Given: live服務已連接有效Shader；source為支援numericuniform
- When: live subscribe source或sources，更新可見集合
- Then: 大量來源仍可一批讀取；縮小subscription停止不再看者；layout-only和同identitycode更新不自動終止值流。

- Failure oracle: 非法／不支援source隔離；gesture中不能重訂閱；同identity失去type/name/kind等則invalidated。
- Persistence oracle: 訂閱、cache、watcher只session；不把動畫采樣寫graph/history。
- Undo/Redo oracle: stream讀值無Undo；只用户commit的寫gesture有history。
- UNKNOWN gates: 全域限制

## LC-HOST-041 — 連續 Uniform 手勢即時改值且提交只留一次撤銷

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-041) · Environment-bound

### LC-HOST-041/B01

- Given: live有效session且訂閱來源；目前無同componentwriter
- When: 按下numeric ladder／slider→多次update→release commit
- Then: 拖動即改render輸入，不反覆產碼／写圖；一次手勢Undo回起點，不需逐sample撤銷。

- Failure oracle: nonmonotonic sequence、source變、expected不符拒絕；已接受的值是否保留依conflict/cancel規則而非假裝從未寫入。
- Persistence oracle: source／code／graph原資料不因手勢sample更新；nativefinalvalue按TD保存；gesture與receipt sessiononly。
- Undo/Redo oracle: commit有變才一筆nativeUndo；browser先保留history順序，完成receipt無操作則移除空步驟並恢復redo。
- UNKNOWN gates: 全域限制

## LC-HOST-042 — 即時手勢取消、失敗及斷線保留已接受狀態

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-042) · Environment-bound

### LC-HOST-042/B01

- Given: 已begin或已接受部分updates
- When: Escape/cancel；gestureerror；socketclose/timeout
- Then: 安全取消回起點；衝突保持外部值並回error／receipt；斷線不重送舊pointer資料。

- Failure oracle: 取消前Par已變更則不強行rollback；finish建立receipt供後續查證，无法驗證nativeundo安全就不覆蓋外部。
- Persistence oracle: finalnative值保留；未送buffer丟棄，receipt最多256session內。
- Undo/Redo oracle: 成功cancel无entry；途中accepted而斷線可由receipt恢復；與graphdraftUndo獨立。
- UNKNOWN gates: 全域限制

## LC-HOST-043 — live Undo／Redo 與遺失回覆的 idempotent 收據復原

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-043) · Environment-bound

### LC-HOST-043/B01

- Given: 收據仍在sessionmemory且屬同Shader實例
- When: POST live-seal；POST live-restore(receipt,undo,requestId)
- Then: Undo只還原目標值，Redo還原最後值；同request重送回相同結果而不重複動作。

- Failure oracle: receipt過期、不同Shader、同request不同內容、externalchange／source/type變更拒絕；不覆蓋current。
- Persistence oracle: receiptmax256、restore去重max128；不隨Graph/TOE保存，服務重建不可保證舊Undo仍用。
- Undo/Redo oracle: receipt控制browser值history；nativeglobalUndo是另一條回调，兩者衝突以currentexpected拒絕，不假定雙邊stack同步。
- UNKNOWN gates: 全域限制

## LC-HOST-044 — 即時值通道准入、可見性與服務錯誤隔離

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-044) · Environment-bound

### LC-HOST-044/B01

- Given: 已通過Editor API取得對應Shader票據；TDserveravailable
- When: 建立liveconnection；頁面隱藏／前景；live服務啟動失敗
- Then: 無效/過期ticket關socket；準入超限拒絕；live unavailable不關整個HTTP Editor；回前景重新查真值。

- Failure oracle: 同名user OP占uniform_socket不覆蓋；tick20秒无heartbeatclose；前端15秒无值流聯絡disconnect。
- Persistence oracle: tickets/client/subscriptions皆session；stop清ticket/watchers；與Graph保存無關。
- Undo/Redo oracle: visible變更本身無Undo；close期間已接受手勢依finish收據規則。
- UNKNOWN gates: 全域限制

## LC-HOST-045 — 宿主原生值 Undo／Redo 單值與 RGB 原子組合

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-045) · Environment-bound

### LC-HOST-045/B01

- Given: 原生Par可寫；寫入前後可保存scalar值
- When: 一次Uniform／customvalue／texturewrite；原生Ctrl/Cmd+Z及Redo
- Then: Undo回before、Redo回after；RGB一次撤銷，Alpha不被RGBpicker改；undo globaloff時不新增callback但值成功。

- Failure oracle: 同一Par批次給衝突值拒絕；中途writefailure回復已寫項；callback exception報TD status而不強行改。
- Persistence oracle: native値可隨TOE；callback為TDsession，不保存進Graph。
- Undo/Redo oracle: 只numeric/stringtexture等受管value，不把graph編輯、controls定義、previewnavigation都冒充nativeUndo。
- UNKNOWN gates: 全域限制

## LC-HOST-046 — native Undo 遇外部更動、替換或型別變更安全跳過

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-046) · Environment-bound

### LC-HOST-046/B01

- Given: 原callback仍在TDundo stack
- When: 原生Undo／Redo回呼但目標或其條件已變
- Then: 無法安全還原時不改當前值並顯示skipreason；texture還需old/newTOPidentity有效。

- Failure oracle: 型別改int後.5不能Undo寫回；bool只接受0/1；同path重建、sourceID變、外部value變均拒。
- Persistence oracle: blocked屬callback生命期；不寫Graph；typedvalidator查當下原Shader context。
- Undo/Redo oracle: 被跳過entry不盲目redo；與othernativeUndo保持各自操作。
- UNKNOWN gates: LU-HOST-007

## LC-HOST-047 — 原生自定義參數快照，定義可編輯性與值可寫性分開

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-047) · Environment-bound

### LC-HOST-047/B01

- Given: 有效savedShader且source module可用
- When: GET custom-parameters；開OP Parameter或Customize Parameters
- Then: 可建native參數面板並顯示來源／頁面／driver與section；styleEditable=false，不能用此API任意改widgetstyle。

- Failure oracle: userDAT占helper名稱且不是相同owned內容時拒絕保留；newer/invalidstate拒絕；unsupportedstyle顯示保護。
- Persistence oracle: native定義在COMP，helper內嵌隨TOE/TOX；snapshot/expectedtoken當次有效。
- Undo/Redo oracle: GETensure的維護未建立定義history步驟；usereditabledefinitions與valuehistory分開。
- UNKNOWN gates: 全域限制

## LC-HOST-048 — 新增、重新命名、刪除空頁與排序自定義參數頁

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-048) · Environment-bound

### LC-HOST-048/B01

- Given: revision與expectedPages token符合；target頁可編輯
- When: custom-parameters actions page-create/page-rename/page-remove/page-move/pages/place等
- Then: userpages維持在protectedpages之前；可搬control到既有或新頁、指定before位置。

- Failure oracle: protected頁或token過期、drop位置失效、非空remove全部拒絕；transaction失敗回復原定義。
- Persistence oracle: 原生頁名稱和order隨COMP；定義historysession-only。
- Undo/Redo oracle: 每成功定義操作一筆custom definitionUndo，與值/圖history獨立。
- UNKNOWN gates: 全域限制

## LC-HOST-049 — 從 Uniform／Specialization 建立對應原生控制並重用既有綁定

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-049) · Environment-bound

### LC-HOST-049/B01

- Given: revision、expectedPages、sourceExpected與drop位置符合；nativeConstant或可移轉的已知preset expression
- When: 把source放入可編輯custompage／bind action
- Then: sourcevalue改由新control驅動；name來源可讀增量不撞名；label依原source拆字；min/max給合理初始範圍。

- Failure oracle: 外部Expression/Export/Bind ownership不搶；不支持type/非法typed現值/default先拒絕，尚未建立control。
- Persistence oracle: 原生controldefinitions+bindingstore保存COMP；不把實際值改成graphdefault。
- Undo/Redo oracle: 建立/move可定義Undo；Undo建立移除controller但保留當前sourcevalue，不退到創建時值。
- UNKNOWN gates: 全域限制

## LC-HOST-050 — 原生控制項標籤、位置、範圍與預設值編輯

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-050) · Environment-bound

### LC-HOST-050/B01

- Given: row.expected metadata、revision與必要pages token符合；group可編輯
- When: custom-parameters label/page/place/move/range/default actions
- Then: 新的面板呈現與default生效；目前live值保留；normMin<normMax，雙clamp時min≤max。

- Failure oracle: range會夾掉currentvalue拒絕；default不合法typed值／TOPpath拒絕；textdefault>4096拒絕。
- Persistence oracle: 定義保存COMP；Graph source default是否同步？此動作只p.default，不改Graph declaration。
- Undo/Redo oracle: definitionUndo可回定義但不回退live值/driver；回復舊clamp會影響當前值也拒絕。
- UNKNOWN gates: 全域限制

## LC-HOST-051 — 原生控制值、Pulse 與 RGB 一次修改

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-051) · Environment-bound

### LC-HOST-051/B01

- Given: revision及row.expected／expectedValue相等；nativeConstant enabled非readonly
- When: custom-parameters value/pulse/color actions
- Then: 直接影響原生值／pulse副作用，回snapshot實際值；Expression/Bind/Export的本control不直接覆寫。

- Failure oracle: typed/range/ownership變拒絕；RGB任一不安全整組不寫；Pulse效果由原生目標決定。
- Persistence oracle: 值可隨TD儲存；Pulse不是持久狀態；不寫graph參數default。
- Undo/Redo oracle: value/color走nativevalueUndo；Pulse沒有自訂可逆處理；三者不進customdefinitionhistory。
- UNKNOWN gates: LU-HOST-007

## LC-HOST-052 — 移除自定義控制時保留 source 最後值，保護外部引用

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-052) · Environment-bound

### LC-HOST-052/B01

- Given: 可編輯group、expectedrow符合，沒有外部nativeBind依賴
- When: custom-parameters remove
- Then: source仍以當前值運作；control消失；移除source本身也不默默刪使用者control。

- Failure oracle: 未知native style要求到TD自行處理以免遺失完整definition；外部依賴拒絕；不得改外部driver。
- Persistence oracle: linkstore更新及lastvalue留native；删除controlpersist隨COMP；不改source預設。
- Undo/Redo oracle: definitionUndo重建control時取source最新值而不是歷史value；同名被占不能搶回。
- UNKNOWN gates: 全域限制

## LC-HOST-053 — source 型別／分量變更時同步 owned control 形狀

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-053) · Environment-bound

### LC-HOST-053/B01

- Given: existingcontrol是可編輯且owned，source新type支援style
- When: 改已綁source的型別/size後Apply
- Then: vec3→vec4新增第四分量default，已有可保留值與定義保持；Apply失败恢复old shape。

- Failure oracle: 外部Bind／drivencontrol、protected頁、不支援型別、舊值不能表示新type拒絕；不强转數值讓compile通過。
- Persistence oracle: 新形狀及attrs保存COMP；Paridentity可能變，不能聲稱shapechange保留原handle。
- Undo/Redo oracle: Shape更改屬graph Apply而非獨立definitionUndo；舊definitionUndo遇shape不符拒絕；graphUndo重Apply仍需驗證。
- UNKNOWN gates: 全域限制

## LC-HOST-054 — 自定義參數定義 Undo／Redo 不倒退 live值

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-054) · Environment-bound

### LC-HOST-054/B01

- Given: 同COMP/session且revision和expectedhistory相等
- When: custom-parameters undo/redo(expectedHistory)
- Then: 復原label/order/range/default/pages/bind結構；已存在control的val/expr/bindExpr/mode保持現在；移除後重建取source現值。

- Failure oracle: 定義被TD／另一editor改、name被占、shape不符、restoreclamp會改值拒絕；operation失敗恢復beforedefinitions。
- Persistence oracle: native定義可保存，但history memory以(comp.path,comp.id)為key，不保存圖/TOE。
- Undo/Redo oracle: 此為定義history，不是TDglobalUndo或graphUndo；livevalue改變不使其過期。
- UNKNOWN gates: 全域限制

## LC-HOST-055 — owned 原生 Bind 自動追蹤控制重命名／刪除／外部接管

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-055) · Environment-bound

### LC-HOST-055/B01

- Given: Shader內嵌owned parameter_links且來源registry存在
- When: 使用者在TD改控制名稱、刪除control、改nativeBind/Expression；helper value/mode callbacks
- Then: 可追的rename保留值連續；刪除後source保留最後有效值；externaldriver保持所有權。

- Failure oracle: native來源不再唯一／missing停止追蹤；同名新control不靠名字誤判是舊master；未知helperDAT不覆寫。
- Persistence oracle: links與lastsample在Shaderstorage；啟動prime重建sessionhandles；不依manager存活。
- Undo/Redo oracle: 外部TD操作的Undo由TD處理；此callback不新增graphdefinitionUndo；最後值恢復不是反向捏造編輯history。
- UNKNOWN gates: 全域限制

## LC-HOST-056 — sampler 的 TOP 控制單一化與移除／Undo 後持續使用最新貼圖

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-056) · Environment-bound

### LC-HOST-056/B01

- Given: sampler存在且sourceExpected/page token符合
- When: custom-parameters bind sampler；remove、Undo、Redo、nativeRename
- Then: 每sampler只有一個受管picker；driver和当前TOP保留；control不存在仍以last選圖或内建fallback運作。

- Failure oracle: wrongTOP/internalpath拒絕；外部Bindrefs拒絕刪除；usercontrolcollision不奪取。
- Persistence oracle: grapeCustomTexturesV1記parameter或None及last；helper隨COMP；外部TOP仍由工程持有。
- Undo/Redo oracle: 定義Undo restores control但保留最新TOP；選圖value走nativevalueUndo且驗identity。
- UNKNOWN gates: 全域限制

## LC-HOST-057 — Editor native來源 history checkpoint 與動畫排除

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-057) · Environment-bound

### LC-HOST-057/B01

- Given: native source module與history module存在
- When: 需history的source操作／state附帶historytoken
- Then: 相同語義state重用checkpoint；動畫不造成無限Undo；Foreign Shader／expiredtoken拒絕。

- Failure oracle: 超過256checkpoint或8MB淘汰舊者後Undo提示expired；不是任意舊token仍有效。
- Persistence oracle: checkpoint僅runtime session，不寫TOE/Graph；完整圖保存能力與此history不同。
- Undo/Redo oracle: 此token支持browser graph/sourceUndo；不是TDglobalUndo，也不把每frame值當步驟。
- UNKNOWN gates: 全域限制

## LC-HOST-058 — Editor Undo 只還原此次 native來源／分量差異

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-058) · Environment-bound

### LC-HOST-058/B01

- Given: tokens有效、revision exact、scope≤256uniqueIDs且currentexpected符合
- When: browserUndo/Redo涉及已實現native來源編輯
- Then: A.x撤銷不改A.z/B現值；Bind還原寫master不detach；Redo可rebase仍限制原component範圍。

- Failure oracle: scope之外declaration變更拒絕；同path新Par、disabled/driver/type變更／currentvalue變則Conflict noop。
- Persistence oracle: 成功canonicalstate更新TD；checkpoint/restore receipts session內。
- Undo/Redo oracle: 此恢復禁用TDnativecapture避免一個browserUndo又新增TDUndo；以当下安全性決定能否redo。
- UNKNOWN gates: 全域限制

## LC-HOST-059 — 無效草稿 Undo 可復原來源但不污染宿主 authoritative 圖

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-059) · Environment-bound

### LC-HOST-059/B01

- Given: historytokens與受影響native來源仍可安全復原
- When: 在有invalid intermediate draft時Undo/Redo來源改動
- Then: browser拿回需要的草稿；native來源復原但invalid字段/graph不直接寫進authoritativestate。

- Failure oracle: canonical不可驗證或任何native復原失败則rollback；rollback自身失败給需review訊息，不宣稱無副作用。
- Persistence oracle: 只canonical保存nativeDAT，invaliddraft由前端draft域處理。
- Undo/Redo oracle: 可以復原source但仍需後續修圖/Apply；Undo不是保證本次草稿立刻compile成功。
- UNKNOWN gates: 全域限制

## LC-HOST-060 — native 結構復原保護鄰列、外部 Export 與重試去重

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-060) · Environment-bound

### LC-HOST-060/B01

- Given: native rows及checkpoint可比對，外部ownership沒有禁止重排
- When: source結構刪除/還原；history-restore request重試
- Then: 只還原指定rows并保持neighbors最新值；完全相同request回cached result，重用requestID不同body拒絕。

- Failure oracle: 任一受影響row Export/externalBind拒绝；editedblankrow不当空位覆盖；failure回復values/storage/state，rollbackfailure明告。
- Persistence oracle: native sequence/registry存COMP；requestcache最大128且有8MB限制，sessiononly。
- Undo/Redo oracle: browserUndo/Redo同scopedrestore；TDglobalUndo不收本恢復動作。
- UNKNOWN gates: 全域限制

## LC-HOST-061 — 由內嵌資產啟動 Editor，不代表獨立離線 PWA

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-061) · Environment-bound

### LC-HOST-061/B01

- Given: 部署的manager內含完整embedded DAT資產且TD服務運作
- When: 啟動TD-Grape服務，GET /與静態assets
- Then: host可達時不依CDN讀核心UI資產；host不可達時不保證首次或重新載入Editor。manifest圖標資料不構成已安裝PWA離線功能。

- Failure oracle: 缺少必需DAT／資產或TD未運作不能假定可用browsercache補救；不是前端單檔自足產碼。
- Persistence oracle: assets隨managerCOMP/TOE；服務memoryasset快照；無已實作serviceworker持久快取的證據。
- Undo/Redo oracle: 載入資產无Undo。
- UNKNOWN gates: LU-HOST-008

## LC-HOST-062 — 服務主執行緒派發、負載限額與不接管無關 OP

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-062) · Environment-bound

### LC-HOST-062/B01

- Given: TD主執行緒仍tick；服務內部標記可辨識
- When: 同時多個Editor請求；runtime啟停；保存工程後重載服務
- Then: 高負載有busy/timeout而非無限堆積；其他Shader请求按各自context派發；無關OP占保留名字不覆寫。

- Failure oracle: queuefull503；worker超過30秒無mainthreadtick停止；未開始且取消job略過；startedtimeout結果需讀回，不宣稱必然未寫。
- Persistence oracle: queues與pendingcaptures純session；port保留為服務記錄但非永久endpoint保證。
- Undo/Redo oracle: 排隊本身不建Undo；真正操作沿自身history規則。
- UNKNOWN gates: 全域限制

## LC-HOST-063 — 既有 Expose Uniform 的控制 identity／矩陣分欄與停用保留

[詳細規格](LEGACY_CAPABILITIES.md#lc-host-063) · Environment-bound

### LC-HOST-063/B01

- Given: source尚未列入migratedcontrol；相同id原type不變
- When: Apply帶expose的Uniform；取消expose；既有expose圖升級
- Then: 取消expose不刪Par，搬Inactive Uniforms並disable；再次expose復用。矩陣明確按column而非扁平色彩控制。

- Failure oracle: 同exposedid換type拒絕要求新Uniform；array拒expose並提示操作CHOP；撞controlname拒絕。與已migratedownedcontrol可shapeplan不同。
- Persistence oracle: sgrapePublicUniforms保存type与Par名字列表；native值/driver保存原生，default更新自圖。
- Undo/Redo oracle: expose切換為圖編輯，成功Apply改原生定義；沒有宣称此舊控制流程共用所有新definitionUndo語義；valueUndo仍需currenttypevalid。
- UNKNOWN gates: 全域限制
