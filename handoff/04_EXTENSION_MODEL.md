# Extension model：可交付的擴充邊界

本文件是 IH-005 的 **production-facing extension 入口**，沿用 IH-002 的 Panel／scoped Parameter、IH-003 的 public surface／localization 與 IH-004 的 view/mount。**Node Module、Dynamic Node、Panel Module、Widget/UI Contribution、GLSLProfile、Host Capability 都是明確角色。** 它們不必共用一個巨大插件介面；也不能因 Node 原型較完整，便把 Panel 或 Widget 退化成任意 DOM callback。

下列主表直接使用正式採用的契約名稱及語意。精確形狀見 [production contract surface](13_PRODUCTION_CONTRACT_SURFACE.md)、[public TypeScript declarations](contracts/public-surface.ts)、[localization contract](15_LOCALIZATION_CONTRACT.md) 與 [view/mount contract](16_VIEW_MOUNT_CONTRACT.md)。可一致改名的 SDK symbol、不可更改的持久 identity，以及 qualification-only bounds，依 [contract ledger](data/production-contract-ledger.json) 分類；不要求 implementer 先從舊 prototype 反推正式 API。

**範例與 executable reference 是契約驗證，不是 production foundation。** 可移植 contract、行為 assertion 與反例，不能直接複製 prototype class structure、fixture bounds 或實驗 document format 繼續堆產品。舊名稱只在本文件最後的「Reference mapping」定位歷史證據；沒有第二套並列的正式入口。以下範例測試不增加 CQ-001 的 Covered 數量，也不宣稱真 DOM／GPU／Host runtime 已通過。

## 1. 入口總覽與不變條件

| Extension kind | 實際入口 | 持久身份／runtime 身份 | 不可偷渡的責任 |
|---|---|---|---|
| Node Module | DefinitionRegistry 的 register／pin；`PresentedNodeModule`＋`PresentedNodeType`，`NodeEligibility` 與 `LocalizableIssue` | exact moduleId/version/fingerprint；`NodeTypeRef` 再有 typeId；Graph Node.id 另行建立 | DOM、宿主實際值、transport、History 排程 |
| Dynamic Node/interface | 同一 NodeModule；`ports(state,context)`、`parameters(state)`、state codec | 固定 NodeTypeRef＋每個穩定 port key；mode 是 Node state | 由 UI 任意加假 socket、直接改 edges、每次切模式換 Node identity |
| Panel Module | `PanelWorkspace.register(PresentedPanelType)`／`open`；共用 scope、routing、restore、lifecycle，view contribution 交共同 mounting seam | Panel typeId 與 Panel instance id 分開；Tab 持有 instance | 擁有第二份 Graph、關 Tab 即刪 Graph、以 DOM 層級代表模型 ownership |
| Widget / UI Contribution | `ScopedParameterTarget.openRouted` → `ScopedParameterWidgets.register/projectTarget`；feature-owned view contribution 使用同一 scoped edit authority | namespaced WidgetId；模型參數 identity 不變 | Widget 自己寫 snapshot、改 port 型別、自己還原模型 Undo |
| GLSL profile | immutable `GLSLProfile` 交 compilation service；支援檢查後 `render` 回 `GeneratedArtifact[]` | exact `ProfileRef`；產物另帶 load/revision/provenance | 決定 Node 的功能語意、讀 DOM、在產碼時寫宿主、宣稱可直接替换任意語言 |
| Host Adapter/Capability | `CapabilityDirectory.register/provide/require/withdraw`＋typed `CapabilityDefinition<Service>` | exact capability id/contractVersion、ModuleRef、application 或 exact Host/Target/incarnation scope | 使用地址作身份、把 Node/Electron API import 到 application core |

所有模組都是**可信任的程式碼**；目前沒有 sandbox、第三方依賴安裝器、熱更新卸載交易或安全隔離保證。Node 與 UI contribution 的版本機制不能互相冒充。保存 Graph 時只保存宣告資料與引用，不序列化函式、DOM、連線權杖或 OS handle。

## 2. Node Module

正式 Node 契約由 `PresentedNodeModule`／`PresentedNodeType`、`NodeEligibility`、`NodeEmission`、presentation 與下表的 callback 語意組成。`NodeTypeRef={moduleId,typeId,version,fingerprint}` 是 exact pin；stage／graph eligibility 使用註冊的 namespaced IDs，不使用宿主命名的 closed union。普通計算、複雜動態節點、來源類同樣經 registry 建立 definition，不由 core 依 type 名稱分派。可跑範例見 [`examples/minimal-node`](examples/minimal-node)；該 harness 的歷史型別替代對照集中在文末，不是 production import 路徑。

| 面向 | 可獨立實作的契約 |
|---|---|
| Registration／identity | DefinitionRegistry register 一次驗整個 manifest、exact dependencies、types 與 presentation owner；全部成功才公開。`NodeTypeRef` 完整 tuple 為定義身份。同身份重複拒絕，不能 last-wins。每張 Graph 持有固定 DefinitionSet。 |
| Lifecycle | 載入 module → register → pin → Graph.createNode 時 initialize → 後續按 state 查 ports/parameters/validate/emit。load/Undo 不靠 initialize 重建歷史。後來註冊新版不改既有 Graph。 |
| Inputs／outputs | initialize 接純 JSON args 與唯讀 ModuleContext，回 NodeInit；ports 回 PortSpec；parameters 回 ParameterSpec；module validate／stateCodec.validate／resource validator 回 `LocalizableIssue[]`，含 code、severity、default TextRef，呼叫層補 subject/path；emit 回 `NodeEmission` 的 typed port outputs、可選 statements/effects，boundary role 才能回宣告的 boundaryOutputs。 |
| State owner／dependencies | Graph 持有 Node state/values/references/metadata；Module 持有功能定義與純 callback。只經 ModuleContext 讀固定依賴／資源；不要讀可變 global Registry、UI 選取、Host actual values。 |
| Validation | stateCodec 的 schemaVersion/validate 約束 JSON；ports 的 key、方向、型別與供值方式由 core 驗證；`NodeEligibility.stageKindIds/graphKindIds/requiredGeneratorCapabilities` 不能只藏在選單。所有節點／resource 都驗，即使未達 shader output。未知 registry ID 在 authoring admission 拒絕，已載文件保全並診斷。 |
| Persistence／Undo | Graph 保存 ref、state、值、references；Mutation 僅進 Graph.change/Operation。missing module 保 opaque record，允許修復性保存、阻止生成；不拿同名最新模組代替。 |
| Failure／notification | registration failure 不公開半個 module。callback／schema 失敗不發布半個候選。合法 authored error 圖可存在，diagnostics 由 core 發布；error 不等於刪資料。observer 只在完整發布後看見狀態。 |
| Testing | 固定接口與輸出型別；非法 args/state；未連 required port；unused invalid node；save/load；missing module；同圖兩實例；兩圖 pin 不同版本；Mutation 一筆 Undo。core 測試不能代替全部公式 modes。 |
| Versioning | production SDK contract compatibility 明確宣告；module dependencies 需 exact id/version/fingerprint。resource kind owner moduleId 唯一、可多版本；同 Graph pin 到歧義 providers 拒絕。改 state schema／ports／semantics 必須有明確版本與匯入計畫，不默改 fingerprint。fixture 的 coreApiVersion 數字不替代正式 release policy。 |

`stateReferences.collect/remap` 是非一般 ref 欄位中資源引用的唯一明示入口；不要全 JSON 字串搜尋取代 ID。自訂 resources 要提供 resourceValidators；型別與 extent 必须交由共用 TypeEnvironment，不在每個節點發明不同相容規則。

## 3. Dynamic Node／接口

它仍是一個 NodeType，不是 UI 任意塑形的特殊例外。可跑範例見 [`examples/dynamic-interface-node`](examples/dynamic-interface-node)。

模式選單採 `ParameterPresentation {widget,options?,fallback?}`；`widget` 是註冊 WidgetId，`options` 採 `MenuPresentationOptions`：`{schema:'grape.ui.menu-items.v1',items:[{value,label:TextRef}]}`。value 是不翻譯的語意值，label 由 feature 的 localization contribution 解析。Node state codec 仍驗合法模式，widget 不成為另一份合法值真相；production 不從 literal label 派生型別。[module-localization example](examples/module-localization/README.md) 展示正式選項文字契約。

| 面向 | 契約 |
|---|---|
| Registration／identity | 用相同 NodeModule 登記。node.id 與仍存在的 port keys 穩定；display label、semantic、位置不作 identity。 |
| Lifecycle／inputs | state 參數或來源型別改變 → 同一 Graph candidate 中重算依賴序 → ports/values/edges/diagnostics 一起發布。`connectionTypePolicy:'infer'` 只在 module 明示時啟用。 |
| Outputs／state owner | `ports` 回每次完整接口；`parameters` 回當前編輯入口。state/備份值/手動 type-lock 是 Graph-owned，不藏 EditorContext 或 Widget。 |
| Dependencies／validation | 可用 readonly inputSource/resource 查詢，不可讀尚未發布的 UI 節點。root 與 nested network 共用 reconciliation；nested caller closure 必須同批更新，不另外建立 Graph。 |
| Failure semantics | schema/callback 不合法，整批拒絕；合法模式變更導致線失效時，預設 detach 並保存 loss record 與 Warning，或由模組明示 `invalidEdgePolicy: 'preserve'` 保留 invalid Edge 並報 Error。保留的線可在型別重新相容後恢复有效；已 detach 的 loss 不自動重接。正常 authoring 可產生 error 圖；嚴格 import/transfer 才可要求 valid candidate。 |
| Persistence／Undo／notifications | mode、接口依據、losses 與資料同 Graph 保存；一次操作的 before/after 還原精確接線。切回模式不偷接回 loss，Undo 才還原。所有受影響 Context 見同次 model publication，但 selection/camera 不共用。 |
| Testing／versioning | mode A→B→Undo→save/reload；被刪 port 的 stale Parameter；invalid edge 兩政策；nested reusable calls；兩 Context；更換 NodeType revision 不等於 mode 變更。 |

**Runtime／capability qualification 限制：** typed model 可保存本地值，但完整產品的每類 component/array editing 算法仍依該 capability 驗收。不得以本範例通過宣稱完成 Swizzle、Voronoi 或所有複合型別控件。

## 4. Panel Module 是第一級擴充角色

精確 composition 介面與操作前後條件見 [PANEL_COMPOSITION_CONTRACT](executable-reference/repair/PANEL_COMPOSITION_CONTRACT.md)，由 AC-IH002-01 採用；production 另須 `PresentedPanelType` 的 feature-owned metadata 與 [view/mount contract](16_VIEW_MOUNT_CONTRACT.md) 的 public view contribution。普通擴充以 [minimal-panel](examples/minimal-panel/README.md) 為推薦模板，與共同 workspace 使用同一公共契約。

Tab 持有 Panel，Pane 管 Tabs，Layout 管分割與尺寸。PanelWorkspace 是這些公開職責的 composition facade，統一處理 registry、target routing 與生命期；不是另一套私有 workspace，不要求普通模組拼接內部狀態。Panel 以公開 view contribution 接入共同 renderer；mount contract 決定資源與更新責任，renderer technology／DOM structure／CSS 是實作選擇。Routing 與 model projection 的 headless 成功不等於真 browser render 已完成。

| 面向 | Public contract |
|---|---|
| Registration / identity | PanelType 的唯一 typeId、exact viewStateVersion、create；可選 providesContext 是角色能力，不是 panel 名稱 switch。Panel instance id 與 typeId 分離。普通 Panel 只新增 contribution 並 register。 |
| Creation / restore ordering | bootstrap 組合 ContextDirectory 與 PanelWorkspace；內建 ScopedTargetService 是預設 resolver。open 提交 SavedPanel 與 Pane。共用服務 factory→restoreViewState(state,resolver)→visibility→initial receive(resolved-or-missing target)。restore 使用明示映射，不按 label/name 猜新身份。 |
| Routing / updates | public Context 的 selection/navigation/model/dispose 通知觸發共享 routing，直接 API 也成立。follow group 0 隨 active Canvas；非零 group 不跨組回退；followCanvas 指定 provider；pin 固定 scope/object。Panel focus 不偷改 Canvas activation。缺目標仍是正常 missing projection。 |
| Target resolution | 內建 ScopedTargetService 處理 root/nested scope 及 pin 的 retained Context；Panel 由 services.context(lease) 取得 effective Context，不遍歷 Graph/resources，不必發明 resolver。pin 仍用同 Graph，只固定獨立 Stage/occurrence；原 Canvas 導航不改它。 |
| View state / persistence | Panel 只擁有 finite JSON 私有呈現 state。Layout 保存 type/version/route/group/state/placement；Graph/History 另屬 application。missing type/version/restore failure 保留原 state placeholder，公開 retry 在正確模組可用後重試。 |
| Retarget / late results | 共享 routing 交付 TargetLease。失效後 accept(oldLease,callback) 不執行 callback；Panel 收到新 target 時釋放舊 handle/render 訂閱，再查新 projection。每個 resolved target 的 scope 都能交給相同 scoped Parameter 入口。 |
| Move / hide | move 改 Tab/Pane placement，保留同一 Panel 與 field draft；hide 只改 visible/render，保留 provider。close 才撤出 routing；不能把 DOM 物理父層当 owner。 |
| Close / dispose | origin gesture guard 與 canClose 均先行；拒絕無部分 close。接受後 lease 失效、Tab/routing 移除、dispose一次。workspace dispose先預檢全部 Panel。借用的 Context/Graph 不被 Panel 刪除；target service 清理自己建立的 scope Context。 |
| Failures | 結構輸入不合法拒絕。factory/restore/receive callback 錯誤依 composition 契約轉 UI issue/placeholder，清理已建立的 contribution，保留可保存資料。mount/render failure 是 [16](16_VIEW_MOUNT_CONTRACT.md) 的另一錯誤邊界，不可假裝是新 Graph error。observer error 不 rollback 已提交模型；Context/workspace 自身公共 API 拒絕通知內重入；Graph 的 guard 只涵蓋自身 publication，其他可信 callback 的唯讀義務見 02/03。save 無法取得完整 viewState 則失敗，不假裝保存舊值成功。 |
| Dependencies | PanelServices 提供 query/routing/target lifetime；可編輯 Panel 另經 application 授權取得 instance-bound `PanelMountContext.commands`，不是從 PanelServices 猜出不存在的 mutation API。只有目前 mount 的 user event 可發命令；只讀 Panel 不自動取得。不得讀 workspace 私有 maps、修改其他 Panel state、持有第二份 Graph，或要求 central kind switch 加自己的名字。 |
| Validation / versioning | exact stateVersion，不偷偷升版。資格測試覆蓋普通新 type、routing、root/nested/pin、restore/missing retry、move/hide、busy close、late result、exceptions及 core不變。真 DOM mount、focus、device behavior 仍在對應 runtime Gate。 |

新模組作者不實作 target/restore/routing policy；bootstrap 的明示 restore mapping 屬 document/layout reopen 的 application 責任，不是每個 Panel 的責任。Renderer 不讀 concrete Panel class／私有 state，不以 Panel 名稱 switch 派發 view。歷史 bounded workspace 只保留作來源證據，不能與本契約並列成另一種 production-facing 接法。

## 5. Widget／UI Contribution 與 scoped Inspector

[SCOPED_PARAMETER_CONTRACT](executable-reference/repair/SCOPED_PARAMETER_CONTRACT.md) 是 AC-IH002-02 採用的 root/nested 同一讀寫契約；[canonical widget example](examples/parameter-widget-or-ui-contribution/README.md) 展示相同操作路徑。Widget 的 [view contribution](16_VIEW_MOUNT_CONTRACT.md) 可以提供不同外觀，但掛載生命週期不得繞過 scoped target／draft／commit authority。

```text
Panel receive(update) → services.context(update.lease)
 → ScopedParameterTarget.openRouted({context, subscribe}, nodeId, parameterKey, update.target.ref.scope)
 → capture(): spec + value + port + links + resolved type + editToken
 → ScopedParameterWidgets.projectTarget(target, presentationOverride?)
 → ScopedFieldDraft.commit(parse) / target.commit(value, expectedToken, operation?)
 → existing scoped Parameter.write → Graph Operation / History
```

| 面向 | Contract |
|---|---|
| Identity / lifetime | ScopeRef 含 graphId、loadId、contextId、stageId、完整 occurrence path；handle 另驗 definition chain 與 NodeType。root 空 path 也用此契約，不退回 root-only projection。openRouted 的 lifecycle subscription 是 UI 必要條件。 |
| State ownership | spec/value/link/type 只從同一 logical target 取得；immutable snapshot 是投影。Widget 只持 text draft 和衝突 token。共享 definition 的兩個 occurrence 各有 lease，但修改仍落在原本共享模型，沒有每 occurrence 私藏值。 |
| Inputs / outputs | Widget accepts/project 使用 immutable ParameterProjection；presentation options finite JSON。target.capture 回一致欄位與 writable；projectTarget 回 ParameterView。Renderer 不走 Graph/resources 查 nested 資料。 |
| Registration | widget ID unique，缺少／不相容／throw 時 safe auto fallback 或 readonly；保留 descriptor/options/value 与 notice。改 UI style 不改 port GLSL type。原 WidgetRegistry/Actions 公共入口仍適用。 |
| Write / Undo | commit 重驗 scope、spec、type、link與原值 token，再由同一 Parameter.write 提交；普通 write 是明示「以現在基準」的程式操作。UI stale draft 不得覆寫新值；parse/IME/busy/connected/invalid lease 拒絕無 History entry。成功寫入仍是原 Graph 操作。 |
| Notifications / invalidation | Graph 發布後查一致投影；Context 導航與 dispose 有公開事件。scope消失/替換/離開或 type identity失效即 terminal invalidation，釋放訂閱；不能在 invalidated 後再發 updated。回原位置/Undo 不復活舊 handle，要取得新 lease。 |
| Dynamic interfaces | spec或解析型別、接線改變使舊 editToken stale；仍存在的參數可重新 projection。port/parameter被移除時失效。位置-only修改不造成無關 field conflict。 |
| Failure / copy-on-write | 真實模型提交成功後，若library-local fork令舊 handle失效，仍回成功；後續重開目標。不得以lease失效虛報該次commit沒發生。 |
| Persistence / dependencies | handle/token/subscription不保存；模型保存值/定義，Layout保存view state。依賴 application public target，不依賴 nested UI特例或Host實際值。 |
| Testing / remaining limits | M01直接反例與 root/nested、同ID遮蔽、兩occurrences、stale path/ancestor、interface/type/link、Undo/Redo、dispose/navigation ABA直接測；真renderer IME/focus/accessibility與複合型別控件完整性仍要runtime驗。 |

UI 使用 `ScopedParameterTarget.openRouted`；不能靠每個按鈕自行 refresh 補生命期通知，不能為 nested Inspector 加一套 renderer traversal。任何 low-level headless lookup 僅供 qualification harness；正式 renderer 只消費上述 scoped projection 與受限編輯入口。

## 6. GLSLProfile（本包的 backend 範圍）

| 面向 | 契約 |
|---|---|
| Registration／identity | 透過 composition 選定 `GLSLProfile` 交 compilation service；不是通用外掛安裝器。`ProfileRef={moduleId,profileId,version,fingerprint}` exact identity，`language:'glsl'`，graphKindIds／stageKindIds／capabilities 必須明示。 |
| Lifecycle／inputs／outputs | immutable Snapshot → validate exact GraphKindRef/topology/NodeEligibility/capabilities → module lowering → `GLSLStageProgram[]` → profile.validateType/render → keyed `GeneratedArtifact[]`、binding schema、diagnostics/provenance。render input 包含已解析 GraphKindDefinition、kindSettings、stages；每次 demand 的 document/code/schema 同來源。 |
| Ownership／deps | NodeTypes 定 operations；Profile 定 GLSL 版本、shell、target 支援與能力限制。可用 TypeEnvironment，不讀 UI、不寫 Host、不把 TD 原生 helper 假裝 WebGL intrinsic。Node emit/lowering 尚含 GLSL 語意，Profile 不承諾把它轉成任意語言。 |
| Validation／errors | 相同型別不等於相同 operation 支援，requiredCapabilities 必驗。缺支持回生成 failure，不傳半個 shader。保留 trace markers 至 profile 組裝，再產正確行號；不能亂剝標记。 |
| Persistence／Undo | Graph 依 [document format](14_DOCUMENT_FORMAT.md) 儲 exact GraphKindRef、Stage slots、module pins 與圖資料；Host 命名隔離在 profile／target。產物是可重建結果，不作 Undo 異動。Updates cache 與 History 分離；artifact origin revision 不等於 delivery revision。 |
| Notifications／lifetime | generate 查詢不改 Graph；async compiler reply 必須匹配 load/revision/request，cached artifact 可重用但 receipt 綁當次 demand。 |
| Testing／versioning | compile-text／必要 GPU pixels 分開；unsupported type/capability、material 的 vertex/pixel、nested trace、late reply。profile 改輸出規則須新 exact ref，使快取身份失效；不以可讀名稱代替版本，也未提供通用 package upgrade installer。 |

ES300 profiles 只證明所列 ES 程式，並非 TD native backend。MRDP 的 native signature、golden／revision 相容性與真正 GPU 門檻保留；完整 ISF/FFGL 不是本 handoff 已交付的 backend。**未承諾 arbitrary-language backend replacement**；若未來要 WGSL、JavaScript 等，需另有授權與具體設計，不可從 backend 一詞推定已可用。

## 7. Host Adapter／Capability

| 面向 | 契約 |
|---|---|
| Registration／identity | `CapabilityDirectory.register(CapabilityDefinition<Service>)` 登記 namespaced `{id,contractVersion}`、ModuleRef、scope 及 typed operations 的 contract/schema locator；`provide` 安裝該 scope 的 provider，`require` 缺 exact 定義／provider 回 `CAPABILITY_UNAVAILABLE`。register／provide 原子、拒重，沒有 central service-name switch。 |
| Lifecycle／inputs／outputs | bootstrap descriptor → 查驗 Host/Target/incarnation → BindingLease → 帶 request/intent/expectedRevision 操作 → receipt/readback → unbind/dispose。斷線與解除配對不同；本輪沒有固定 transport。 |
| State owner | Graph 保存預設/宣告；宿主擁有 actual values/driver/native controls/產物；Binding 管意圖/authority/receipts；PreviewSession 管捕捉與控制租約。 |
| Allowed／forbidden deps | Adapter 可以碰 TD/OS/Node/Electron capability；core 不可以。Static Web 不獲得本機 filesystem/window 權限；Node所在機器不等於瀏覽器所在機器。 |
| Validation／failure | receiving-side fence 不只 UI 忽略舊回應；prepare/commit/cleanup 分開。無法證實 commit/rollback 則 indeterminate/quarantine，不虛報 retained。CAS 比 shape/driver/incarnation/expected value，不按同 path 猜身份。 |
| Persistence／Undo | Target持久provider與Graph storage分離；session權杖不保存後復活。GraphHistory、HostValueHistory、NativeDefinitionHistory各守自己的delta/authority；Pulse/window無Graph Undo。DEC-GRAPE-001 已延後 coordinated chronology，不建立 coordinator；分域 receipt/CAS/lifetime acceptance 繼續必要。 |
| Notifications／withdraw | provider observations 更新 mirror/diagnostics，不回送成寫入循環。async 接收核對當次租約／load；unsubscribe 和 queue 停止明確。`withdraw` 只撤新 lookup，不等於取消遠端操作；已取出的 service handle 仍由該 service lifetime/fence 撤權，不能靠舊 JS object 保留 authority。 |
| Testing／versioning | fake contract測試、真 native side effect、cold reload、failure injection分層。明示 fake/real evidence，不因Electron包裝就標相容。Target shape/schema/provider支援改變需新的狀態/版本確認，不重用舊receipt。 |

可跑 host adapter 範例與封存 HQ tests 只證明接合點。真 TD rollback、原生 Undo、TOE/TOX、auth/bootstrap 和browser可達性仍是 MRDP C/D門檻；產品 B 決策不在 adapter 裡偷偷選定。

## 8. 實作者交付清單與清楚的停止線

每一個新 contribution 都要提交：明確身份/版本；上述欄位的對應；正常及失敗測試；保存/Undo/lifetime案例；需要的 capabilities 與不可用結果；可信程式與資料邊界；renderer/host實機證據的缺口。Node formula存在不代表UI entry完成；UI projection存在不代表宿主適配完成。

一般 Panel 與 Widget 可依本模板獨立建立與測試，不必先改 Node 核心。Panel/scoped Inspector 的新增 public contract 已列入 IH-002 qualification；真 UI runtime、legacy revision fallback、Personal符號array政策仍回到對應 gate；coordinated Mixed History 按 DEC-GRAPE-001 延後，不得暗中實作。不要用 casts、隱藏全域變數或 DOM callback 绕过。這是 handoff 的明確限制，不是要求先完成所有 migration 才能寫第一個畫布。

來源：[繼承 UI 契約及來源指紋](provenance/INHERITED_UI_CONTRACT.md)、[Core contract](executable-reference/CORE_API_CONTRACTS.md)、[Workspace contract](executable-reference/WORKSPACE_QUALIFICATION_CONTRACTS.md)、[Presentation contract](executable-reference/PRESENTATION_QUALIFICATION_CONTRACTS.md)、[Compute contract](executable-reference/COMPUTE_QUALIFICATION_CONTRACTS.md)、[Host contract](executable-reference/HOST_QUALIFICATION_CONTRACTS.md)。不需回讀 Legacy。

## 9. 模組外觀、翻譯與低頻擴充

Node／Panel／Widget 模組提供自己的 presentation metadata 與 localization contribution；內建模組也相同。新增模組及語言不改 central catalog。精確契約與 fallback／失敗規則見 [15](15_LOCALIZATION_CONTRACT.md)。locale 是 application preference，user-authored text 不成為翻譯 key。

Graph kind／stage topology、Host capability identifier、GLSL profile stage artifacts 的 open seam 依 [13](13_PRODUCTION_CONTRACT_SURFACE.md)。這不把每個責任改成任意插件，也不承諾任意語言 backend。公開 composition 仍採 IH-002 Panel/scoped target，同一責任、ordering、lease 與錯誤語意不變。

GraphKind 是 application-owned definition，Graph 文件保存 exact `GraphKindRef`；`GraphKindRegistry.registerStageKind/register` 原子驗證 stage semantics、slots、settingsCodec 與 boundary references。Stage 由 Graph 擁有，Node/Edge 由其 Network 擁有。Profile 只接已驗證的 topology，不能自行重造 Graph；新增 kind 不自動讓不支援它的 profile 可用。Pass descriptors 若需要，屬 kindSettings，不能因低頻擴充把 Pass 改成 Stage 的父層。

## Editable Panel command contribution (IH-005)

需要編輯模型的 Canvas／Panel 使用 [17_PANEL_COMMAND_CONTRACT](17_PANEL_COMMAND_CONTRACT.md)，最小例子在 [editable-panel](examples/editable-panel/README.md)。`PanelType.commandIds` 只宣告請求；Application 授權，workspace 綁定 exact instance／target lease，renderer 注入 optional `PanelMountContext.commands`。Feature 只在有效 `scope.event` 中送 intent，不能挑 origin、Graph、Context 或取得 Operation。沒有 grant 的 Panel 仍是完整可用的只讀 extension。普通 Panel 不需修改 central type switch 或 Graph/History。

## 10. Reference mapping（歷史 qualification，非正式入口）

下表只幫助重跑或移植現有 executable specification；左欄不得直接成為 production SDK。Production declarations 與 semantics 以上文、13–15 及其 TypeScript 契約為準。這些舊說法仍存在於凍結來源，是保留 evidence，不是給 implementer 二選一。

| Reference／fixture 符號 | 正式對應／限制 |
|---|---|
| `Registry.register/pin`、`TypeRef` | DefinitionRegistry 註冊／固定解析，`NodeTypeRef`；能力語意保留，prototype class/file 不複製 |
| `validate(): string[]`、問題字串、resource validator 的字串陣列 | feature-owned `LocalizableIssue[]`：code、severity、TextRef 與呼叫層補 subject；external raw diagnostic 才可用 `ContractIssue` 保留原文 |
| `GenerationProfile`、`profile.id`、固定 vertex/pixel return pair | exact `GLSLProfile.ref: ProfileRef`；`GLSLStageProgram[]` 與 `GeneratedArtifact[]`；只有 GLSL seam |
| `HostServices`、closed `ServiceName` union | `CapabilityDirectory`＋typed `CapabilityDefinition<Service>`；exact scope/contract lookup，不是任意 JSON dispatch |
| `'td.top' / 'td.mat'`、fixed Stage union | `GraphKindRef`、registered StageKindId；內建 `grape.image`／`grape.material`，Host-specific naming 留 profile/target |
| NodeType 的 `stages/targets`、`stageOutput`、emit 的 `color/position` | `NodeEligibility`；boundary role 的 declared output map，其餘仍是普通 port outputs |
| `ParameterPresentation='number'/'menu'`、`handoff.menu-items.v1` 的 literal label | 註冊 WidgetId＋`ParameterPresentation`；`grape.ui.menu-items.v1` 的 label 為 TextRef、value 不翻譯 |
| `coreApiVersion:1`、`grape-core-experiment` | 前者為 qualification fixture bound，後者為外來實驗格式；正式文件是 [14](14_DOCUMENT_FORMAT.md) 的 `grape.document`，不得只換字串冒充 converter |
| `PanelTemplateHost`、bounded `WorkspaceQualification.PanelKind` | 非普通 Panel 的替代 public path；正式以 PanelWorkspace composition ＋共同 view/mount seam 接入 |
| root-only `ParameterWidgets.project(context,nodeId,key)` | 新 Inspector 只用 ScopedParameterTarget + ScopedParameterWidgets，不靠 UI 遍歷 nested resources |

FIR-N01 的修復是使主入口直接表達已採用契約；沒有藉名詞同步改動 registry、Graph、History、profile、Host 或 localization ownership。
