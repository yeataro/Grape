# Acceptance 與 architecture conformance

本頁將封存契約編成實作驗收需求。**AT-Sxx-yy 是計畫中的產品驗收，不是本輪已執行測試。** 原型通過紀錄只證明其列明機制；搬入交接包不會把它升為新產品、完整catalog或真TD/GPU驗收。

- [08_IMPLEMENTATION_PLAN.md](08_IMPLEMENTATION_PLAN.md)：slice scope、依賴與完成定義。
- [10_KNOWN_GATES.md](10_KNOWN_GATES.md)：哪些未知阻塞哪些承諾。
- [data/slices.json](data/slices.json)：本頁Given/When/Then的機器可讀版本。
- [11_LEGACY_COMPATIBILITY.md](11_LEGACY_COMPATIBILITY.md)：完整leaf行为与证据边界。
- [Current implementation locator](08_IMPLEMENTATION_PLAN.md#implementation-state)：正式產品開始後從本包上一層的 `implementation-state.json` 讀取 production baseline、active/completed slices、scoped Gate 決定與 accepted evidence；包內同名檔只是 not-started 範本。本輪沒有 production acceptance。

## 四種互補證據

| 證據 | 能證明 | 不能單獨證明 |
|---|---|---|
| Package integrity/conformance checks | 引用、ID、group、gate、契約資料與依賴邊界自洽；限定import不越界 | 真產品可用、所有動作正確、TD/GPU可用 |
| 封存prototype／本包executable reference | 具名API與bounded案例可組合；搬入本包後可重現其接口 | 新產品UI、完整leaf模式、宿主原生行為 |
| 產品slice tests | 實作由入口到結果、失敗、保存與Undo的行為符合oracle | 未跑的平台、未測的mode、未驗的原生provider |
| 真runtime/integration證據 | 被實際跑過的build/OS/device/provider條件下的結果 | 所有未跑矩陣、無限輸入、任意第三方module永不失敗 |

沒有可用provider時的typed unavailable是需要驗的失敗分支；不能把所有功能都回unsupported當成成功交付。若某能力是所宣告profile必須支持的，unavailable只能算未完成。

## 交接包的可執行檢查

從本目錄執行：

```text
node tools/check-handoff.mjs
node tools/check-boundaries.mjs
node tools/check-repair.mjs
node tools/check-implementation-state.mjs
node --test tools/implementation-state.test.mjs
node executable-reference/verify-reference.mjs
```

`executable-reference/verify-reference.mjs`產生的結果在 [PACKAGE_VALIDATION.json](executable-reference/evidence/PACKAGE_VALIDATION.json)；它只驗被列明的reference/例子，不執行本頁47個產品AT案例。整包工具亦可由 `node tools/run-handoff.mjs` 編排（工具實際存在且其報告有結果才算執行）。

**本修訂 IH-005 必須執行完整 `node tools/run-handoff.mjs`**：封存 reference、B01/M01 repair 與 BM 組合測試、全部 extension examples、strict TypeScript、boundary checker、N03 locator tests、來源完整性都包含在內。只跑舊 reference 不能證明本次修復。最新實際結果見 [repair audit](audit/FINAL_HANDOFF_AUDIT.md)；其 PASS 字樣僅屬具名測試結果，本輪總處置永遠是待 Independent Re-review，不構成 HANDOFF PASS。

具體example/reference的執行命令與本輪結果以 [00_README.md](00_README.md) 所列為準；沒有列出成功結果的命令不視為已跑。工具必須在缺reference、capability漏映射、未知gateID或禁止依賴時回失敗，不能只輸出漂亮報表。本頁不捏造尚未產生的退出碼。

正式實作後，PM／Reviewer 使用 `node tools/check-implementation-state.mjs --current` 找目前結果，不能拿本包 `audit/`、`data/acceptance-index.json` 或 CQ disposition 充當 production 進度。current record 的通過只證明欄位／引用／hash 自洽，不證明產品通過；每個 completion 的同 revision 行為與架構證據仍須實際審查，Gate 的 scope 外保持繼承狀態。

## 必守的組合反例

| 邊界 | 必須由實作保住的觀察 | 不合格捷徑 |
|---|---|---|
| Graph ownership | 兩Context共用同一model；各自selection/camera；刪除後外部observer不見懸空selection | UI維護另一份可寫Graph或私自合併state |
| Operation/History | 同批所有副作用/diagnostics原子發布；gesture多batch一筆Undo；失敗無部分提交 | 在每個widgetcallback做自己的undo或手動刪線補救 |
| Parameter/port | write重新解析當前stable key/type/lifetime；style不改GLSL type | 按DOM排序寫第n個接口、widget繞過Parameter/Draft |
| Module/registry | 精確pin；codec/reference完整；callback只讀，失敗隔離 | 同名自動代換最新版、核心nodeName巨型分支、任意字串猜ID |
| Nested network | 與root共用reconcile，所有callers/edges/loss同批 | 子圖私有第二Graph/History或獨立不一致的轉型規則 |
| Generation | immutable snapshot，全圖errors先檢查，symbols/provenance按identity | 讀activeCanvas、剪掉未連錯節點後假成功 |
| Persistence | 捕捉當前document；missingmodule資料保留；晚save只確認該內容 | 保存時自動commit、刪未知field、把download視為durable save |
| Updates | cache、delivery、History分責；artifact code/schema/document同次捕捉 | 一條historylog同時當queue、拿最新文件配舊shader |
| Host authority | 寫入前identity/epoch/revision/expected重新驗；read-onlyinspection無writegrant | URL/name即identity、UI按鈕隱藏當權限控制 |
| Native state | Graph defaults、livevalues、control definitions及各History分域 | nativeUndo倒退動畫、因reply晚到寫新Target |
| Deployment | 平台權限只在adapter/bootstrap；同core不因Electron重写 | browser core直接import Node/Electron/TD global |
| Ordinary Panel extension | 只 register 新 PanelType 即經同一 public workspace 完成 initial/routing/restore/move/close；原 Graph/History bytes 不變 | 私造示範 host，再叫實作者接另一份 workspace；central type-name switch |
| Scoped Inspector | root/nested 同一 target 的 spec/value/link/type/projection/write；invalid lease 永不復活 | root lookup＋nested write；renderer 遍歷 resources 補洞 |

完整invariant清單依 [data/invariants.json](data/invariants.json)；本頁是行為化驗收摘要，不替代或重命名它。

<a id="s01"></a>

## S01 — Host-free 最小可使用編輯流程

狀態：**planned，未由本輪handoff宣稱產品已執行**。Gate請依 S01 的scope判讀，不能為取得綠燈刪掉未解分支。

| Test | Given | When | Then | 證據類型 |
|---|---|---|---|---|
| AT-S01-01 | 乾淨的支援瀏覽器、無 Host service | 在產品 UI 新建圖，建立 Float=0.25、Multiply b=2、Compose RGBA 並接到輸出 | Canvas/Inspector/GLSL 同指一份 Graph；產碼成功且資料流表達0.5；沒有 Host 存活前置。 | product-behavior |
| AT-S01-02 | 有效接線已存在 | 嘗試非法方向、跨 Stage、占用未選replace、循環或無法適配接線 | 整批拒絕，原線/值/revision/History不變，UI顯示確定錯誤。 | product-behavior |
| AT-S01-03 | Compose vec4 輸出已連至必要 color input | 以 Inspector 改為不相容形狀，再 Undo/Redo | 合法 mode 改動、接口、失效線/loss與診斷同批發布；error可保存但不能產碼；Undo精確恢復，Redo再次呈現同一模型結果。 | product-behavior |
| AT-S01-04 | 選取節點，數值輸入有未提交文字 | 取消或以合法值提交，再做一次拖曳手勢 | 草稿不是第二份模型；取消無模型編輯；多批手勢形成一筆Undo；UI選取/縮放不進Graph History。 | product-behavior |
| AT-S01-05 | 可保存當前圖 | 先 ACK 保存並重新開啟同一正式格式文件，再獨立下載 JSON 並由 UI 開啟 | persistent IDs/ports/values/edges/metadata保持；reload有新loadId和空History；舊handle不能指到新實例。 | browser-plus-model |
| AT-S01-06 | 同Graph有兩個Canvas Context | 兩邊分別選取／平移；一邊改值或刪除另一邊所選節點 | 視圖各自保持；模型共用；外部observer看到的selection已清理；Undo不強迫恢復UI選取。 | product-behavior |
| AT-S01-07 | StorageAdapter 寫入尚未完成 | 保存A後改為B，再令A完成；另測拒絕及SAVE_BUSY | A的完成不把B標為saved；拒絕不改保存基準；download完成不冒充持久保存確認。 | product-behavior |
| AT-S01-08 | 訂閱者可讀模型 | 成功編輯時observer嘗試重入或拋錯，另一observer繼續讀取 | 重入拒絕；已提交成功不倒退；其他observer見相同完整revision。 | architecture-conformance |

<a id="s02"></a>

## S02 — 安全開啟、檢閱與保存既有文件

狀態：**planned，未由本輪handoff宣稱產品已執行**。Gate請依 S02 的scope判讀，不能為取得綠燈刪掉未解分支。

| Test | Given | When | Then | 證據類型 |
|---|---|---|---|---|
| AT-S02-01 | valid/damaged/future-version/duplicate-ID文件各一 | inspect、取消、下載原文、接受合法提案 | inspect不改原文/當前Graph；接受一筆Undo且檢查base內容；不猜未知引用。 | product-behavior |
| AT-S02-02 | 含缺失exact module及opaque fields的文件 | 載入、移動/更名、保存，補正確模組重新載入 | opaque語意不丟；未補時生成阻擋；補後由codec恢復，不使用同名其他版本。 | product-behavior |
| AT-S02-03 | 已核准的legacy revision→pin/轉換案例 | 經產品import UI開啟並產碼 | 結果符合明訂成功/拒絕範圍、provenance可追；不能用新core exact-pin規則自動定義legacy相容。 | product-behavior |
| AT-S02-04 | 接近限制的ASCII/CJK/nonBMP、CRC壞/缺metadataPNG | 不同import入口讀取 | 一致且具名的接受/拒絕與原文保護；PNG roundtrip另有真browser證據。 | product-behavior |

<a id="s03"></a>

## S03 — 子圖的建立、巢狀編輯與全圖 callers 更新

狀態：**planned，未由本輪handoff宣稱產品已執行**。Gate請依 S03 的scope判讀，不能為取得綠燈刪掉未解分支。

| Test | Given | When | Then | 證據類型 |
|---|---|---|---|---|
| AT-S03-01 | 同definition的兩個occurrence及两Context | 進入不同breadcrumb，改definition參數/位置 | 模型共用、occurrence導航独立；語意首次編輯library副本fork，position-only不改外部library。 | product-behavior |
| AT-S03-02 | 父/祖先/同層callers都存在 | 更名、重排、改型別或移除interface，再Undo | 所有callers與相關值/edges/diagnostics同批更新；保留穩定key；root/nested同樣失效規則。 | product-behavior |
| AT-S03-03 | 含crossing edges及source/type引用的選取 | 封裝/複製到同圖與別圖，注入一個不允許引用 | 合法操作重映射完整closure；拒絕整批不留孤兒，Undo恢復所有引用。 | product-behavior |
| AT-S03-04 | 過時ScopedParameter或layout proposal | 語意fork/切網路/Undo後再提交 | 過時scope明確拒絕，不寫到同ID新生命期或錯occurrence。 | product-behavior |

<a id="s04"></a>

## S04 — Library / Personal 子圖交換與可辨識資產

狀態：**planned，未由本輪handoff宣稱產品已執行**。Gate請依 S04 的scope判讀，不能為取得綠燈刪掉未解分支。

| Test | Given | When | Then | 證據類型 |
|---|---|---|---|---|
| AT-S04-01 | 相同library版本加入兩次 | 加入圖/首次語意編輯/Make Independent | 按已定scope重用或fork；圖保存dependency snapshot，不依live檔案。 | product-behavior |
| AT-S04-02 | literal/source-bound/input-bound/nested extent包 | 按核准PD-1矩陣匯出/重編identity/重讀/生成 | 接受範圍往返語意正確；拒絕明確且無部分資料，checksum通過不代替compile可用。 | product-behavior |
| AT-S04-03 | 多個檔案含碰撞名稱/壞包/超限 | 儲存與重新列庫 | 不覆寫現有檔案；單一壞包不讓其他資產消失；scope/限额有確定結果。 | product-behavior |

<a id="s05"></a>

## S05 — Shader 能力族與後端輸出

狀態：**planned，未由本輪handoff宣稱產品已執行**。Gate請依 S05 的scope判讀，不能為取得綠燈刪掉未解分支。

| Test | Given | When | Then | 證據類型 |
|---|---|---|---|---|
| AT-S05-01 | 某一交付族的每個leaf和mode | 由UI建立、改參數、接線、生成、保存/reload、Undo | 每個leaf各有列明oracle，不能只驗共享模板；unsupported profile回確定diagnostic。 | product-behavior |
| AT-S05-02 | required constant、resource-array extent、fragment effects、depth writer cases | 改變依賴/Stage/mode後生成 | type/constant/stage/side-effect限制正確；整圖error不因reachability pruning消失。 | product-behavior |
| AT-S05-03 | 相同型別但backend能力不同的操作 | 在不同宣告profile產碼及實機編譯 | 支持的可編譯，不支持的提前明確拒絕；不能用Node/Electron部署名推論GPU能力。 | product-behavior |
| AT-S05-04 | driver/runtime數值邊界及nativehelper fixtures | 針對宣告TD/build/GPU矩陣比較結果 | 數值、bindings、line-map/provenance具實測記錄；boundedES probes不冒充TD全catalog。 | product-behavior |

<a id="s06"></a>

## S06 — 完整工作區與編輯互動

狀態：**planned，未由本輪handoff宣稱產品已執行**。Gate請依 S06 的scope判讀，不能為取得綠燈刪掉未解分支。

| Test | Given | When | Then | 證據類型 |
|---|---|---|---|---|
| AT-S06-01 | 兩Canvas、兩Parameter、linkGroup/未link與不同選取 | 切tab/選node/關tab/分割layout | Parameter跟隨正確context；關view不刪Graph；layout保存恢復包含浮動panel且不污染Graph History。 | product-behavior |
| AT-S06-02 | readonly/busy/IME/textfocus/draft各組合 | 逐公開command與shortcut觸發 | 需禁用者不改模型，允許者結果一致；globalshortcut不吃文字編輯。 | product-behavior |
| AT-S06-03 | 使用者named presets達邊界 | 按PD-2政策保存/匯入/重載 | 保存成功意義與retention明確，無未告知資料損失。 | product-behavior |
| AT-S06-04 | browser/device矩陣含touch、fractionalzoom、clipboard拒絕 | drag/pan/pick/Fullscreen/paste/leave-page | 裝置事件與權限拒絕結果符合leaf；不以模擬PointerEvent代替實機觀察。 | product-behavior |

<a id="s07"></a>

## S07 — 找到並明確連至正確 Host/Target

狀態：**planned，未由本輪handoff宣稱產品已執行**。Gate請依 S07 的scope判讀，不能為取得綠燈刪掉未解分支。

| Test | Given | When | Then | 證據類型 |
|---|---|---|---|---|
| AT-S07-01 | 零/一/多個候選及matching/foreignidentity | 從入口連線、切Target、失敗、取消 | 未知對象不被任意選中；失敗保留前次有效對象；target與authority可核對。 | product-behavior |
| AT-S07-02 | stale epoch/token、錯origin/格式與斷線 | 送控制請求、重連並回覆舊請求 | 不跨新Target或epoch套用；當前圖仍可保存/編輯，不自動接其他主機。 | product-behavior |
| AT-S07-03 | PD-3/4a/4b已各別定案 | 執行cross-ID入口和兩種nativewindowaction | 可見性/確認/授權/本機remote結果各自符合決策，不互借規則。 | product-behavior |

<a id="s08"></a>

## S08 — 安全交付 Shader、保留 last-good 並讀回

狀態：**planned，未由本輪handoff宣稱產品已執行**。Gate請依 S08 的scope判讀，不能為取得綠燈刪掉未解分支。

| Test | Given | When | Then | 證據類型 |
|---|---|---|---|---|
| AT-S08-01 | 明確Target與可編譯artifactA | Prepare/commit A後改Graph為B，延遲與逆序回覆 | receipt只對正確artifact/delivery/Target；不把B文件配A shader；舊結果不污染現在diagnostics。 | product-behavior |
| AT-S08-02 | 隔離TDfixture | 注入candidate/configure後/restore失敗與遺失回覆 | 實際Par/OP、graph/meta/lastgood/receipt結果可核對；未知狀態明示且停止相關write，不虛構rollback保證。 | native-runtime |
| AT-S08-03 | dirtyGraph+sessiondraft、reviewticket | 接受upgrade或Reload Applied時改base/revision、之後整頁reload | 過時票據拒絕；成功reset的draft/history/subscription一致；失敗沒有未定半state。 | product-behavior |
| AT-S08-04 | 只改node位置/名稱、同內容Undo與on-demand查看 | Observe Updates與Host compile次數 | 必要更新與metadata/code產物界線正確；無多餘repeat物件身份；全圖error仍阻生成。 | product-behavior |

<a id="s09"></a>

## S09 — 即時參數、自訂控制與分域 Undo

[DEC-GRAPE-001](provenance/product-decisions/DEC-GRAPE-001.md) 已接受。下表 AT-S09-01／02 仍 required；AT-S09-03 的原文保留作 deferred unified oracle，不是本 release 待交付工作，更不是 PASS。G-LU-UI-009、receipt/CAS/load/epoch guards 和 LC-UI-101／AT-S08-03 不因 deferral 消失。

狀態：**planned，未由本輪handoff宣稱產品已執行**。Gate請依 S09 的scope判讀，不能為取得綠燈刪掉未解分支。

| Test | Given | When | Then | 證據類型 |
|---|---|---|---|---|
| AT-S09-01 | Host控制有live值、driver、外部Bind與Graph預設 | 改UI值/取消gesture/斷線/重連 | 預設不被覆蓋；CAS衝突明示；保留已接受狀態；Gesture收據/Undo不含他人動畫。 | product-behavior |
| AT-S09-02 | typedcontrol與相鄰列、外部Export存在 | 改shape/頁/label/刪除再Undo | 定義與live值按各自owner恢復；不改鄰列/外部引用；typed nativeundo有實機證據。 | product-behavior |
| AT-S09-03 **DEFERRED_BY_PRODUCT_DECISION** | Graph、native定義、live值交錯操作 | 依已定次序Undo/Redo、timeout重試、await期間load新圖 | 只在確認結果後推stack；idempotentreceipt不重做；晚回覆不mark/render新Graph。 | product-behavior |

<a id="s10"></a>

### DEC-GRAPE-001：十项保留／替代验收

所有案例是接受的产品要求，**没有执行产品测试，没有 runtime PASS**。JSON 保存完整文字／validationMethod／scope；下表逐项可执行，而不是「以后再想混合 Undo」。它们不构成 LC-UI-100 的 unified chronology 等价覆盖。

| ID | Given | When | Then | Status |
|---|---|---|---|---|
| AT-DEC-GRAPE-001-01 | Canonical model was edited; TD performed an external operation/Undo; Graph History has an eligible edit. | Dispatch Graph Undo. | Canonical model restores through Graph History. TD-originated history cursor and external animation are not rewound. Any active-binding propagation is a new conditional write. | REQUIRED_NOT_EXECUTED |
| AT-DEC-GRAPE-001-02 | A Grape-originated Host/native/live operation has a valid receipt; canonical/default value and Graph history are captured. | Undo only the explicit Host/live domain. | Only owned eligible Host records change. Canonical/default value, Graph revision/dirty/history/redo stay unchanged. | REQUIRED_NOT_EXECUTED |
| AT-DEC-GRAPE-001-03 | Graph has a Redo branch and a known serialized snapshot; Host has external drivers. | Feed at least 10000 observations including animation and TD Undo readback. | Mirror/runtime basis updates correctly; no Graph or application Undo entries, Graph dirty/revision/redo changes, or echo writes. This bounded test is not a throughput claim. | REQUIRED_NOT_EXECUTED |
| AT-DEC-GRAPE-001-04 | An existing applicable Binding intent/receipt basis and canonical edit are available; Graph Undo would propagate a conditional live write. | Exercise both orders: (1) capture write basis then external change before commit; (2) external animation/TD Undo and mirror readback happen before Graph Undo starts. Change value/driver/shape/revision; include A-to-B-to-A values. | Invalidated applicable basis causes refusal/conflict; Graph Undo stays committed and Host external result remains. Latest mirror alone does not renew authority. No value-only equality shortcut, silent fresh-basis retry or force-write. | REQUIRED_NOT_EXECUTED |
| AT-DEC-GRAPE-001-05 | Canonical 2-to-1 Undo commits; actual Host state has diverged. | Deliver conflict for the new conditional live write. | Canonical=1; Graph cursor already advanced and revision increased; no extra Graph entry/rollback. Host external actual value retained; Binding exposes divergence. | REQUIRED_NOT_EXECUTED |
| AT-DEC-GRAPE-001-06 | Canvas, committed Inspector, uncommitted text/IME draft, Host/live control, and no eligible/empty history domain can have focus. | Dispatch Ctrl+Z with newer edits available in a different domain. | Only explicit domain/local-draft semantics apply. No global-most-recent fallback or Panel-owned History. Draft editing creates no Graph entry until commit. | REQUIRED_NOT_EXECUTED |
| AT-DEC-GRAPE-001-07 | Native/live restore, Undo propagation or publication receipt is pending. | Load a new document via UI and non-UI entry, rebind to new epoch, or restart Target incarnation; then release each old response. | Old response cannot mutate new document, dirty, render, or Graph/Host History context. No lease/token revival. Receiver fences remain required; client discard does not prove physical remote cancellation. | REQUIRED_NOT_EXECUTED |
| AT-DEC-GRAPE-001-08 | Active binding has valid expected basis and authority; model edit can Undo; repeat with no binding. | Commit Graph Undo, then complete conditional live write; observe concurrent artifact publication separately. | Graph restore completes first. Live path has new request/intent identity and does not append Graph History or replay old receipt. No binding yields zero Host calls. Publication preserves compatible actual values, never resets defaults to implement this propagation. | REQUIRED_NOT_EXECUTED |
| AT-DEC-GRAPE-001-09 | A Host-domain Undo has valid receipt; capture its stack and unrelated Graph state. | Delay, reject, retry same payload, duplicate receipt, change reused payload, or make outcome indeterminate; exercise no-op/cancel/Redo. | Only confirmed own-domain success advances that stack. Same request+payload has no repeated side effect; changed payload rejected. Unknown outcome blocks related Host writes for readback. Already committed Graph Undo stands. Own-domain no-op preserves Redo; no shared global Redo. | REQUIRED_NOT_EXECUTED |
| AT-DEC-GRAPE-001-10 | LC-UI-101 confirm/cancel/draft cases and restored canonical value exist; runtime differs. | Exercise cancel, fetch failure, accepted replacement, stale replies, and canonical save/reload. | Original reload confirmation/guard/failure requirements retained (G-LU-UI-008 not presumed solved). Successful load has new lifetime and reset session state; stale callbacks do not revive it. Save contains canonical value, not runtime mirror/leases/History/divergence; binding authority must be re-established. | REQUIRED_NOT_EXECUTED |

DSH-04／05／07／08／10 同时约束 S08。Fake/model/router fixtures只能证明对应范围；声称 TD/native/live compatibility 必须取得真实 adapter/TD evidence。DSH-07 保留 LU-UI-009 的独立安全缺口；DSH-10 保留 LC-UI-101/G-LU-UI-008。以 `resetSourceIds`／publication重播defaults代替conditional propagation，或Host conflict补偿Graph Undo，都必须验为失败。

## S10 — 遠端 Preview 與獨立 Viewer 控制

狀態：**planned，未由本輪handoff宣稱產品已執行**。Gate請依 S10 的scope判讀，不能為取得綠燈刪掉未解分支。

| Test | Given | When | Then | 證據類型 |
|---|---|---|---|---|
| AT-S10-01 | currentpreview和candidatehandoffticket | 連新target失敗/取消、成功、停止 | 未成功前不動current；獨立lease/identityfences正確；停止清capture/heartbeat。 | product-behavior |
| AT-S10-02 | Viewer layout/contentzoom改動、pointerfocus與多touch | drag/pan/zoom/Home/cancel/release | 正規化位置無初始跳動，僅轉送允許快捷鍵；gesture/capture在失焦/換Target時釋放。 | product-behavior |
| AT-S10-03 | 個別MAT/TOPViewer控件 | 改值、TDundo、save/reload與querysections | 回讀正確；Undo/persistence僅聲明實證控制；不套GraphHistory保證。 | product-behavior |
| AT-S10-04 | 真TDcook/stream與MATApply | capturehold/resize/stop/lateframe | 無錯target lateframe，pause/release bounded；不得用fakePNG證真GPU/cook。 | product-behavior |

<a id="s11"></a>

## S11 — 範本建立與獨立 Shader 產物

狀態：**planned，未由本輪handoff宣稱產品已執行**。Gate請依 S11 的scope判讀，不能為取得綠燈刪掉未解分支。

| Test | Given | When | Then | 證據類型 |
|---|---|---|---|---|
| AT-S11-01 | 四份versionedtemplate | 由native/產品入口建立、改值/貼圖、保存 | 各有獨立identity/輸出口，fallback和可編輯Graph完整。 | product-behavior |
| AT-S11-02 | 隔離保存TOE/TOX | 冷啟動、移除manager/編輯component、重新加入 | render與必要資源在宣告版本可用；沒有隱含記憶體/舊Host依賴。 | product-behavior |
| AT-S11-03 | native建立選單provider不存在或拒絕 | 發佈模板能力 | 核心Graph建立仍可用，原生選單不可用具明確結果。 | product-behavior |

<a id="s12"></a>

## S12 — 三種部署的發佈與能力降級

狀態：**planned，未由本輪handoff宣稱產品已執行**。Gate請依 S12 的scope判讀，不能為取得綠燈刪掉未解分支。

| Test | Given | When | Then | 證據類型 |
|---|---|---|---|---|
| AT-S12-01 | 每個產品宣告profile的安裝/啟動包 | 執行S01最小流程及services可用/不可用路徑 | application core不分叉，缺權限或service有typedunavailable；模型可保存不改Target猜測。 | product-behavior |
| AT-S12-02 | client/Node不同machine及Electronrenderer | 讀寫檔案、launchwindow、建立Host關係 | location/authority對正確機器；renderer不得任意Node/nativeimports。 | product-behavior |
| AT-S12-03 | 斷外網、停TD、清cache三獨立情境 | 首次或再次載入產品 | 結果依宣告資產能力；embedded-host成功不冒充PWAoffline。 | product-behavior |

## 結果記錄與失敗處理

每個案例記錄status（planned/passed/failed/blocked/not-applicable）、執行時間、build/platform、fixture與輸入雜湊、命令/動作、期望與實際、輸出證據、受影響capability、適用gate。not-applicable必须指向產品宣告範圍，不能作為略過必備行為的理由。

失敗先区分：①實作違反已定契約，修對應實作；②未知行為缺證據，維持gate；③想取消或改變產品行為，提交owner決策；④必要行為無法在封存責任邊界表達，保留反例並提Architecture Change。④只停止受影響依賴，不自動宣告所有slice均不可進行。

本包完整、可執行或conformance檢查全綠，仍不等於Migration-ready。CQ-001的Partial與UNKNOWN須靠對應slice的實際證據或owner決策處理；不得只改文字狀態。

## IH-003 直接 qualification

完整 runner 新增 production-boundary negative fixtures、正式文件 codec／open contract／localization probes，以及 schema 2 的 decision/AC progress references。這些是 contract qualification，沒有建立 production model 或代替 AT-S01。

Production checker 命令：`node tools/check-production-boundaries.mjs --manifest <reviewed-production-manifest.json>`。Manifest v1: `scope: production`, `base`, `roots: string[]`, `files: {path:{owner,role,exports?:{symbol: rights}}}`, `externals`, `registrationFiles`, 可選 `changeSet:{extensionOwner,changedFiles}`。roots 掃出全部 source，漏列 fail；只列 extensions 自身而漏 production core 不構成合格驗收。Dependency matrix 是工具公開的 `dependencies`，是 [03](03_RESPONSIBILITY_AND_DEPENDENCY.md) 的最小 machine gate。

能阻止：跨 owner private import／re-export、非授權 public mutation import、Generator/Persistence/Node 依賴 model、core platform imports、普通 extension 修改 core 檔案。不能單獨證明：public facade 宣稱的 rights 是否誠實、callback 任意 side effect、any/cast/reflection 注入、執行期是否只傳唯讀 snapshot、巧妙寫法的 type-name switch。後者須用 readonly service 注入、strict typing、behavior tests 和人工 conformance review；不得以工具 PASS 替代。

## IH-004 direct renderer qualification

FIR-B01 不能以既有 routing/tests 綠燈解除。新增直接案例須包含兩個不同 Panel（Selection Summary、private expanded Help）、兩個不同 Widget（含非 text/number）、generic renderer、move/hide/remount、close veto、mount/update/cleanup failure、dispose 後 async 與 edit fencing。詳見 [16](16_VIEW_MOUNT_CONTRACT.md) 及 [本輪實際執行紀錄](audit/FINAL_REVIEW_REPAIR_VALIDATION.json)。production 必須移植 assertions 到自己的 public SDK，不能複製 qualification class 當 foundation。
