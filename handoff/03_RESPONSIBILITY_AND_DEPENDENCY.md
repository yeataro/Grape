# Responsibility and dependency matrix

`owns` 表示真值與生命期的責任，不表示 UI 不能投影。讀取都經唯讀公開資料／snapshot。名稱是責任角色，不要求 production 拆成同名 class/file。NodeType 與 graph-local SubgraphDefinition 也不是同一種 definitions。

| Subsystem | Owns | May read | May mutate | Calls / may depend on | Must not depend on |
|---|---|---|---|---|---|
| **Application documents** | 已載入 Graph 集合、明確 open/close/save 流程 | Graph status、引用／dirty blockers、Storage 能力 | 作品集合，經公開 API 操作 Graph | Graph、Editor、storage contract | 特定 Host 存在、DOM、平台 filesystem 實作 |
| **Graph / Network** | Canonical document、Node/Edge/resources、revision、Operation、Graph History | 固定 DefinitionSet、read-only module responses、IdentitySource | 唯一 Draft 邊界內的模型 | codec、reconcile、validators、不可變 snapshots | UI、Host live state、Node/Electron、active selection |
| **Registry / DefinitionSet** | 共用定義與精確固定解析集合 | module manifest、dependencies、type/profile metadata | Registry registration；既有 DefinitionSet 不被就地改寫 | trusted module registration、shared type contracts | 某張 active Graph 或 Panel、Host 物件 |
| **Node/resource modules** | 自己的能力實作、state/refs/schema 規則；實例資料由 Graph 擁有 | 自己 state＋ModuleContext 的公開查詢 | 僅回傳候選／plan；不直接寫模型 | types、codec、typed lowering contracts | 他人私有 state、全域可變 Graph、DOM／原生 API（純模型模組） |
| **TypeEnvironment / Edge validation** | 型別解析與轉換規則 | pinned type defs、來源／接收接口 policy | 不直接寫 Graph；回檢查／adaptation plan | shared contracts、scoped definitions | 節點顯示名稱 dispatch、UI 顏色、宿主 current values |
| **Parameter** | 編輯 target 描述、style／validation 描述 | 當前 target/value/schema | 透過同一 Graph/Operation；Host parameter 使用獨立 live service | 模型 query/write 契約 | 私有 currentValue、Widget text 作模型值 |
| **EditorContext / commands** | selection/primary、Stage/occurrence、active context 與可選 Binding 引用 | Graph、公開 model/host services | Context state；模型透過 Graph API | document identity、public action interfaces | DOM 所在位置當身分、Host 複本作模型真值 |
| **Graph History** | 已提交模型操作的 before/after | Graph state、Operation completion | 透過受控恢復發布模型 | Graph mutation/notification | Updates scheduler、UI callbacks、native全量回捲 |
| **Generator / backend** | 生成工作的中間值、artifact 與診斷 | snapshot、DefinitionSet、profile、resource descriptors | 只改本次 job 私有資料 | typed module lowering、TypeEnvironment、symbol/provenance services | 可變 Graph、Editor focus、storage／Host dispatch |
| **Updates** | Graph-scoped scheduling、每 profile jobs/cache | 同次 immutable snapshot、operation-end | 自己 jobs/status/cache | Generator contract、Graph notifications | History 當 queue、全域 dirty、Host values |
| **Persistence / intake** | storage request、import review／saved-content baseline 流程 | 當前 snapshot、文件、格式/pins | save ACK；import 经 Graph；load 建新 lifetime | Storage/DocumentInput/Output capability | 自行寫 Node state、Host project等於作品save、download等於ACK |
| **Layout / Pane / Tab** | split、尺寸、active tab、floating layout、Panel viewState引用 | panel types、合法視圖引用 | 自己配置；發通知給 Manager | Panel public lifecycle、PreferenceStore contract | Graph副本、Host權限、私下改別的Panel state |
| **UI Manager** | routing/policy、activation sequence、預設流程 | Layout/Tab公開集合、Context、panel target | 透過各 owner API；不擁有第二份selection/layout | Editor activate/reveal、Panel retarget、Layout APIs | 欄位穿透、只有自己按鈕才更新狀態的隱藏流程 |
| **Panel / NodeView / Widget** | render resources、field text draft、私有可序列化 viewState | model projection、Parameter、diagnostics、theme、shared coordinates | 自己 viewState；commands/write 經公開入口 | borrowed Context、contribution registry、public UI services | 第二份 parameter truth、其他Panel internals、擅造 Port |
| **Binding / Connection** | Graph↔Target 關係、epoch、intent、receipts、live mirror；通訊 session | snapshot/artifact、provider observation | delivery/session state；明確請求外部操作 | Host abstract capability contracts | 把 Host document 当当前Graph；protocol API 泄漏進 Graph |
| **Host adapter / receiver** | 原生 target observation、active artifact、resource/value authority、thread queue | 接收payload、native identity/capabilities | 按授權與CAS寫外部 runtime；回receipt/readback | Host API、connection/dispatch adapters | 私下改 Grape Graph/History、假ACK、憑OP path借用舊identity |
| **Bootstrap / deployment adapters** | composition、identity/storage/host/UI能力供應 | 配置、權限、環境 | 環境初始化、自己資源 | application contracts、Node/Electron/browser實作 | 改寫 domain ownership、用部署if/else散落核心 |
| **Diagnostics index** | 按producer/scope/basis可查的問題 | owner驗證結果、有效生命期 | 自己索引；內容由各producer發布 | object refs、artifact/request provenance | 代修 Graph、舊錯誤鎖新生成、清除別的validator結果 |

## 必須拒絕的 architecture violations

IH-002 的 `PanelWorkspace` 是以上 registry／Layout／Manager 職責的 public composition facade，不能和另一套 private workspace 平行各存一份真值。`ContextDirectory` 借用外部 EditorContext，管理登錄、activation 與 gesture origin；`ScopedTargetService` 只擁有 pin 所需的獨立 scope Context 生命期，Graph 仍共用。普通 Panel 只註冊 factory、接收路由结果與實作自身生命周期。close Panel 不 dispose 借用的 Canvas Context；target service 釋放自己建立的 retained scope Context。

`ScopedParameterTarget` 屬 application query/write service：可讀當前 scope 模型、可透過既有 Parameter/Operation 寫入；只擁有 lease／訂閱／衝突 token。`ScopedParameterWidgets` 讀該 target 的 immutable projection；不自行查 Graph/resources，也不保存 canonical value。兩者依賴同一公開 target contract，不依賴彼此的私有實作。詳見 [04](04_EXTENSION_MODEL.md) 與兩份 repair contracts。

通知的執行保護依 owner 分界：Graph 拒絕自己的 publication 中的模型重入；Context/workspace 拒絕各自通知期間經自身公開 API 重入。所有 contribution observer 都必須是可信、只觀察的 callback，但獨立 Context／lease dispose 通知並沒有全域阻止另一個已持有 Graph 的 callback 寫入。這種越界屬 contribution contract violation，須由 extension review／conformance 檢查；目前不能宣稱是 sandbox 或所有跨 owner mutation 均會自動拒絕。不得為補此文字界線而新建全域 notification manager。

| Violation | 為何拒絕／正確邊界 |
|---|---|
| UI 保存第二份 canonical parameter value | text draft/mirror 可以存在但標暫態；提交走 Parameter/Graph，重畫從模型讀。 |
| Generator 修改 Graph 或讀「現在選到哪個 Node」 | 生成只讀固定 snapshot；自動修復必須另作顯式模型操作。 |
| Node module 任改其他模組私有 state | 模組只描述自己的資料與公開引用；跨物件編輯回命令計畫，由 owner 提交。 |
| Host 成為 canonical Graph owner | Host 保存已交付 document 是執行快照；回讀須明确匯入／恢復，不接管作品真值。 |
| Panel 穿透另一 Panel internals | Manager 或公開 contribution/context routing API 協調；不能靠同頁DOM id查對方資料。 |
| Core 用 Node type/name 大量 special-case | 普通能力由 module codec/schema/lowering/resource contracts 提供；新模組只註冊。 |
| Node/Electron API 洩漏進 core | 經窄能力接口注入；缺能力明示 unavailable，不用平台分支維持第二套模型。 |
| 新普通 Node/Panel/Widget 要改多個無關 core subsystem | 擴充 contract/sample 有缺口時先記 Gate；不能新增三處 switch 作常態擴充方式。 |
| Graph defaults 被 Host 動畫／readback覆蓋 | 不同資料域；只有明確「取為預設」命令能改 Graph。 |
| 異常吞掉後宣稱成功／半批提交 | Result、diagnostics、indeterminate 分清；通知只在完整發布後。 |
| 缺模組按label／最新版本替換 | exact refs＋opaque preservation；版本轉換需明確 plan。 |
| 只有 UI callback 會觸發 necessary cleanup/reconcile | 直接API與多Context同樣要成立；不變量在 owner 維護。 |

`tools/check-boundaries.mjs` 用實作提供的 ownership manifest 檢查 static dependency 與平台 API 邊界；它不證明所有語意。別名、closure、callback 是否藏第二真值仍需測試／review。普通 extension 的 conformance 必須以「新增模組後 core diff 為零、經註冊可用」檢查，不能僅靠 folder 名稱。

## IH-003：可機器檢查的 production 邊界

[tools/check-production-boundaries.mjs](tools/check-production-boundaries.mjs) 使用 reviewed manifest 的 subsystem owner、role、public named exports 與權限分類；跨 subsystem 只可依公開入口，type-only 也不可碰 private。UI 可讀 query／調用受控 command，但不能取得 raw mutation；Generator、Persistence、Node module 不可依賴 mutable model。環境 API 留 adapter/bootstrap；普通 extension 變更清單只可包含自身及登錄 wiring。

原 check-boundaries 仍驗歷史 reference 的環境隔離，不作 production 許可表。manifest 本身需 code review；本工具不是 sandbox，也不證明任意 alias/cast/callback 的語意純度。檢查方法與限制見 [09](09_ACCEPTANCE_AND_CONFORMANCE.md)。

## IH-004 renderer responsibility

Feature 提供其 Panel 或 Widget view contribution；shell 擁有 mount target 與共同 mount coordinator；contribution 只借用受限 rendering scope。Graph edits 仍走既有 command/scoped draft boundary。Renderer 不可 import 具體 Panel class、讀 private viewState、按 Panel type 寫 central switch，或自行遍歷 Graph/resources 補 projection。[公開契約与 ordering](16_VIEW_MOUNT_CONTRACT.md)。

## IH-005 command and wire responsibility

PanelServices負責讀取／routing；[PanelMountContext.commands](17_PANEL_COMMAND_CONTRACT.md) 才是可編輯Panel的公開命令路徑。Application決定grant、驗intent並執行Operation；workspace綁定exactinstance與target；shell驗現在的event。Panel不能傳入自己的origin、Graph或任意Context。Pointergesture失去mount時的取消由Application補償自己的Operation；shell不直接寫模型。只讀Panel無此capability。

Document Codec擁有[14](14_DOCUMENT_FORMAT.md)的corewire解析；Graph hydrator用固定definition/type驗語意及診斷，Generator只讀且不修復。Module preservation codec只驗其exact-owneropaque資料，不能把loss/recovery當活動Graph或History。UI與Host都不擁有這些保存資料的第二真值。
