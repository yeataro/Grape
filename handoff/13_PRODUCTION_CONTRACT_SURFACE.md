# Production contract surface — IH-005

本文件保留 AC-IH003-01 的契約補完，並合併 IH-004 view/mount 與 IH-005 wire／Panel command 契約。AC-002 的 ownership、mutation、History、Snapshot 與 Host 邊界保持不變。新增技術契約的狀態為 **EXPERIMENTAL BUT CURRENTLY ACCEPTED**；它們尚未變成 production runtime。DEC-GRAPE-001 是已接受的產品範圍決策，不能與技術 qualification 混淆。

## 1. Implementer 應照什麼做

Production 必須独立實作本 package 的行為與契約。不要複製 `executable-reference/`、`qualification/` 的實作，改名後繼續堆功能；也不要把「reference 不是 production」解讀成可以重選 ownership 或自行縮減契約。它們提供反例與 executable specification。

契約是以下三者合成的唯一 surface：

1. 02–06 的責任、事件、錯誤與 lifecycle 規則，以及 09 的 conformance；
2. 本文件與 [machine ledger](data/production-contract-ledger.json) 對 reference 公開 type/field 的逐項 disposition；
3. `contracts/public-surface.ts`、[document format](14_DOCUMENT_FORMAT.md)、[localization](15_LOCALIZATION_CONTRACT.md)、[view/mount](16_VIEW_MOUNT_CONTRACT.md) 與 [Panel commands](17_PANEL_COMMAND_CONTRACT.md) 的明確形狀。

Ledger 保留 source symbol 作為定位，**不授權 production import reference**。普通 extension 面向 production SDK；SDK 名稱由實作者統一命名，能力不可變成比較弱的替代品。任何契約修改須記錄 architecture change，不能只更新 implementation。

| 分類 | 不可任意改變的部分 | 可以由工程決定的部分 |
|---|---|---|
| `EXACT_IDENTITY` | 文件欄位／版本、穩定 ID、exact definition pin、port key、capability ID/version 的對應 | 類別、檔案、local variable 名稱 |
| `NORMATIVE_SHAPE_RENAMEABLE` | 輸入輸出資訊、owner、authority、生命週期、失敗與通知語意 | public method 的拼字可在同一 SDK 一致更名，並維護 ledger 對應 |
| `QUALIFICATION_ONLY` | 測試主張與反例必須移植為驗收 | fixture literal、實作演算法、bounded helper、constructor arrangement 不繼承 |

同一 type 可包含不同分類的 field。TypeScript `string` 不表示任何字串都有效；identity 必須查 registry，GLSL type 必須查 TypeEnvironment。原型的 literals 也不自动成為產品 wire format。

## 2. GraphKind 與 Stage topology

`GraphKindRegistry` 為 application-owned definition registry，與 NodeType registry 同樣提供已驗證、固定版本的定義。它不持有 Graph 狀態。`GraphKindRef` 是 `{moduleId, kindId, version, fingerprint}`；Graph document 保存 exact ref，並透過文件 modules pins 保留來源。找不到 exact ref 不猜近似名稱／版本；依 document recovery 與 missing-definition 規則處理。

目前採用的穩定 kind IDs：

| kindId | Stage slot | Stage kind | implementation |
|---|---|---|---|
| `grape.image` | `vertex` | `grape.stage.vertex` | 預設 `profile-default`；允許 `network` |
| `grape.image` | `pixel` | `grape.stage.pixel` | `network` |
| `grape.material` | `vertex` | `grape.stage.vertex` | `network` |
| `grape.material` | `pixel` | `grape.stage.pixel` | `network` |

內建 kind 定義的 module owner 為 `grape.graph-kinds`。Version/fingerprint 由實際 release 的 module manifest 決定，測試中的 `test-1`、fixture fingerprint 不能成為 production pin。

Graph 擁有 Stage；Stage 擁有其 Network；Network 擁有 Node/Edge。文件中 Stage 的 `key` 是 topology slot，`id` 是該實例身分，`stageKindId` 是 shader 語意。三者不混用。profile-default 仍有 Stage/Network 的文件位置；由 kind semantic validator 限定這種模式不能偷偷執行 Network 內容。切換為 network 是 Graph operation，建立 kind 宣告的必要 boundary Node 並一起驗證／發布／記 History。

每個 `StageSlotDefinition` 明確列出 implementation 選项、預設值與 `BoundaryDeclaration[]`。Boundary 引用 exact NodeType；required boundary 必須不可刪除，仍是具有 Port 的 Node，因此 Edge 無須另一種 endpoint。新建 Graph 時先完成 definition resolution，再一次建構所有必要 Stage/Network/boundaries；其中任何一步失敗都不得留下半張圖。

`StageKindDefinition` 的 stage semantics 與 required generator capability 可擴充；Node eligibility 引用註冊 ID。未知 ID 在新建／編輯 admission 時拒絕，既有文件則保存並診斷。新增 ID 不代表每個 backend 支援它。Geometry、compute 或 vendor stage 必須另有 backend 與實際環境資格，不能只靠 registration 宣稱可用。

Pass **不是** Stage 的父層，也不自動多產生 Network。某種 GraphKind 如需要 Pass descriptors，由 Graph-owned `kindSettings` 與該 kind 的 `settingsCodec` 定義；profile 消費這份設定。此處只保留既定位置，不增加 ISF runtime／pass schema 或任意多語言 IR。

### Registration / lifecycle

- Owner：application registry；Graph 只保留固定 ref / settings。
- Preconditions：unique exact pin、已註冊 StageKind、可解析 boundary definition、有效 settings codec/default、slot key 唯一。
- Mutation boundary：register 先驗證完整候選，再一次公開。register callback 失敗不安裝候選；重複 exact pin 是錯誤，不 last-write-wins。
- 通知：registry completion 後才發註冊事件；不暗改已載入 Graph 的 DefinitionSet。
- Undo：registry 安裝不是 Graph History；Graph kind/settings/implementation 轉換若提供給產品，必須另經 Graph operation，不能藉 registry reload 偷換。

## 3. Node／Parameter／Panel 的 production surface

既有 `NodeType` 的 initialize → ports/parameters → validate → emit 分工繼續有效。ModuleContext/EmitContext 是受限的只讀 context／產碼服務；callback 不獲得另一個模組的私有 state 寫入權。固定、動態與來源類 Node 同樣由 module 註冊；core 不以 type 名稱分派。

以下是 reference shape 必須做的替代，不是可選 redesign：

| Reference field | Production contract |
|---|---|
| `NodeType.stages / targets` 的封閉 literal arrays | `NodeEligibility.stageKindIds / graphKindIds`，registry resolution 後判斷；未列 graph restriction 表示不限 kind，仍須 Stage/type/capability validation |
| `NodeType.requiredCapabilities` | namespaced **generator** capability IDs；不能拿 Host service availability 代替 shader 能力 |
| `NodeType.stageOutput`、`NodeEmission.color/position` 特例 | emitter 提交 declared boundary output map；GraphKind/profile 依 stable output key 驗證。一般 Node 的 port outputs 不變 |
| `ParameterSpec.presentation = 'number'/'menu'` | `ParameterPresentation {widget, options?, fallback?}`；shorthand 只保留在 fixture，production 使用註冊 Widget ID |
| `NodeModule` 缺少 presentation | 必須套用 `PresentedNodeModule<Module>` overlay |
| `NodeType` 缺少 presentation | 必須套用 `PresentedNodeType<Definition>` overlay |
| `PanelType` 缺少 presentation | 必須套用 `PresentedPanelType<Definition>` overlay |

Boundary NodeType 另套 `NodeTypeBoundaryMetadata`：`boundaryOutputs(state, resolvedPorts)` 在候選 schema 確定後回傳 `{key,type,required}[]`。這是只讀 schema callback，與 ports 同一驗證／錯誤隔離邊界；不得持有 live model。`NodeEmission.outputs` 仍是普通 output port expressions；新增 `NodeEmission.boundaryOutputs` 才是 Stage 結果。只有 boundary role 可提交後者，必須符合其 declaration，不能以輸出名稱猜 Node type。重複 Stage output key、缺 required key、未知 key 或 type 不符都讓整次 generation 失敗；不能 last-write-wins。Compiler 將已驗證結果合成 `GLSLStageProgram.outputs`，profile 再檢查該 Stage 所需輸出。required Stage boundary protection 不變。

三種 overlay 在 `contracts/public-surface.ts` 是確切 TypeScript shape，為既有 contribution 加上 `.presentation`，沒有增加資料 owner。NodeType 的 `NodePresentation.ports/parameters/actions` 是以 stable key 索引的唯一文案來源；PortSpec/ParameterSpec 不另放第二份 label。動態 Node 可宣告所有模式的 keys，UI 只投影目前 schema。`ParameterPresentation` 只決定 widget；`NodePresentation` 決定文案，兩者不可混用。

Module/Node/Panel presentation 的 owner 必須與定義 module 的 exact manifest pin 一致。翻譯缺失採 15 的 fallback；不改 Graph、type、parameter value 或產碼。使用者 name/label/notes 是使用者內容。`ContractIssue.messageRef?:TextRef` 讓 module 診斷帶結構化文字來源；`message` 保留預設／外部原文，不從英文內容反推 key。Diagnostic code 仍是機器語意。

上句指 feature 自有文案的 owner；明示引用 `grape.shell` 或其他 shared owner 的 TextRef 依它的 exact owner 解析，不能假冒 namespace。ModulePresentation.owner 自身仍只能是該 module。

Production 的 module `validate`、`stateCodec.validate`、resource validator 等回傳 `LocalizableIssue[]`，替代 reference 的 `string[]`；每項有 code、severity、default messageRef（含可選 params），由呼叫層補完整 subject/path。core 不將英文 message 當 identity，Generator 也不呼叫 LocalizationService。通用 transport/native diagnostics 可回傳只有 raw message 的 ContractIssue，再由 adapter 保留原始 payload；不能把自家 module 文案冒充外部錯誤來繞過 metadata。

本次没有把 Node role 擴充成一個新的分類 DSL。`operation` 與 `boundary` 是既有有限責任角色；UI category、source module grouping 不能偷偷轉成 core dispatch role。

## 4. GLSL Profile seam

`GLSLProfile` 是 immutable Snapshot compilation 的 backend adapter，**只談 GLSL**。它收到固定 `GraphKindDefinition`、該快照的 `kindSettings`、按 Stage 身分列出的 `GLSLStageProgram[]`，回傳 `GeneratedArtifact[]` 與 diagnostics。Node lowering 仍產生 typed GLSL expressions/statements；此處没有承諾 WGSL、JavaScript 或任意語言支援。

Compilation service 先檢查：全部 model errors、definition/type resolution、topology、每個 GraphKind/StageKind/Node 的 capability requirement、profile graph/stage support，以及 boundary output shape。TypeEnvironment 管 type；profile 可另外拒絕不支援的 type。全部 admission 成功後才 render。`profile-default` Stage 可提供空 network program，profile 負責該 Stage 的已宣告預設 shader。

Artifact 以 `key` 與 optional `stageId` 定位；不硬編只有 `{vertex,pixel}` 兩個 return fields。主產碼結果仍須帶 immutable snapshot revision/loadId、source/diagnostic provenance；變成 artifact list 不得丟失它們。Bounded fixture 的 color/position 便利欄位是到 declared output map 的映射，不是多一份輸出 authority。

Render 不修改 Graph，不自行選擇另一張快照，不直接 publication；failure 產生 diagnostic / failed generation，不能發送半份 artifact。實際 GLSL compiler、TD/GPU 與 link-time behavior 仍依既有 Gates。`qualifyRender` 只測 admission 與資料邊界，不是 GLSL compiler。

## 5. Capability identifiers 與 Host service contract

封閉 `ServiceName` union 是 qualification-only。Production `CapabilityDefinition<Service>` 把 exact `{id,contractVersion}`、owner、scope 與 typed Service 的 public operation contract 放一起。新的普通 service 提供 definition/provider，不修改 centralized switch。這不是「任意 JSON method 呼叫」：每個 service 的 input/output、authority、receipt、retry、cancel、cleanup 必須由其專屬 public contract 定義，既有 Host publication 規則照舊。

初始 identity 對應如下（方法的拼字可調，語意與 scope 不可混淆）：

| Fixture name | Production ID | Scope / 已有責任 |
|---|---|---|
| HostDiscovery | `grape.host.discovery` | application；查候選，不因此取得 target authority |
| TargetSession | `grape.host.target-session` | target；identity/capabilities/connection lifecycle |
| ArtifactPublication | `grape.host.artifact-publication` | target；artifact＋binding publication／receipts／fencing |
| InputValues | `grape.host.input-values` | target；live values / explicit allowed readback |
| ControlLayout | `grape.host.control-layout` | target；原生控制項映射，不擁有 Parameter truth |
| PreviewSurface | `grape.host.preview-surface` | target；preview observation / input capability |
| NativeWindow | `grape.host.native-window` | target；明確原生操作，不影響 document ownership |
| DocumentExport | `grape.application.document-export` | application；輸出 canonical document，不需假造 Host |
| ApplicationAssets | `grape.application.assets` | application；外部資源能力，不自行成為 Graph owner |

以上 capability 初始契約版本採 `1`；這表示 API 合約版本，不表示 Host 已實作它。新 extension 使用自己的 namespaced ID；不提供 alias 猜測或 fallback 到相近服務。有效 definition 必須列出 operation name、contract/schema locator 與 query/mutation/event effect；泛型型別協助 TS 使用者，運行時邊界仍需該 service 的 validation。

Provider 的 target scope 是 exact `{hostId,targetId,incarnation}`。重啟後 incarnation 不同，即使 hostId/targetId 相同，舊 provider/lease/receipt 也不可重用。Application scope 不能被迫偽造 target。Registry 不持有 transport；Static Web/Node/Electron 各自 bootstrap provider，application core 只知道能力。

Register/provide 必須原子；duplicate contract 或同 scope provider 不 silent replace。`require` 缺少 exact registered contract/provider 回傳 `CAPABILITY_UNAVAILABLE`，不是把一個未驗證 object 當 service。Withdraw 撤除新的 lookup；已在途 operation 的結果由該 service 的 lease/epoch/fence 驗證，不能把 registry remove 當成「远端已取消」。Existing service handles 的有效性也必須由 service lifetime 綁定，不可因持有 JS object 而繼續取得 authority。

Registry 的安裝／撤除是 application integration state，不是 Graph Undo。Host native/live authority、receipt、lifetime 的 Gate 仍在；DEC-GRAPE-001 明定 coordinated Mixed History 延後，不建立跨系統原子 Undo。

## 6. Example → production 路徑與 copy ban

| Canonical example | Production-facing shape | 不可搬入產品的 reference 細節 |
|---|---|---|
| `examples/minimal-node` | NodeModule/NodeType＋metadata overlay、DefinitionRegistry、Graph operation、TypeEnvironment | core.ts、fixture graph factory、literal TD kind、fixed helper class |
| `examples/dynamic-interface-node` | 同上；state/schema/loss/diagnostic 原子發布、stable port keys | 不為具體 node name 加分支；不複製 bounded schema algorithm |
| `examples/minimal-panel` | IH-002 `PanelType → Workspace registry → routing → PanelServices` composition；加 Panel metadata 與16的 PanelViewProvider／mount seam | toy PanelTemplateHost 不再是替代路徑；原型 workspace implementation 不複製 |
| `examples/parameter-widget-or-ui-contribution` | definition-owned presentation＋Widget registry＋scoped Parameter target/draft writer＋16的 ParameterWidgetViewType／mount seam | 不複製 root-only lookup；不讀另一個 Panel private state |
| `examples/minimal-host-adapter` | typed capability provider＋publication executor/fence/receipts；exact target scope | receiver/test doubles不是 TD adapter，不把原型 transport/cache 搬入 core |
| `examples/editable-panel` | `PanelType.commandIds` → application 授權 → `PanelMountContext.commands` → scoped command/gesture；見17 | fixture command executor／Graph Operation adapter，不是 production Canvas 或新 command framework |

實作 SDK 可採不同 class/file 名稱，但 first extension 必須只透過 public SDK 編譯與測試；不得 reference import，也不得需要修改不相關 core。複製測試案例的**行為 assertion 與反例**到 production API harness 是必要驗收；複製 reference 的實作來让測試通過不算移植。

Second review 的 B1/M3 是有效的 handoff 邊界缺口：此前已有責任設計，但沒有逐項說明封閉 fixture 哪些須替換。本次補上它，沒有改 ownership。該 review 的 M1 指向 IH-001 的 PanelTemplateHost；IH-002 已有同一 public composition path（registration/restore/routing/move/close/dispose/placeholder），此次保留並加 metadata，不重開 Panel 架構。實際 DOM renderer/browser 行為仍是 integration evidence，不由 headless tests 證明。

## 7. 驗證與範圍

直接檢查（package root）：`node --test qualification/public-surface.test.ts qualification/production-contract-ledger.test.ts`；TypeScript strict check 依 package scripts 執行。PC-CE 刻意證明 frozen reference 的 unions 拒絕新 kind，然後 PC-01..12 檢查 open registration、atomic admission、no fake Host、stage requirements、immutable profile input、exact scope/contract、缺少能力拒絕、boundary declaration/output 的分離與失敗。Ledger check 檢查 sealed shared contract 的 34 個 public type 與 149 個 field 都有分類及替代定位，不等同語意人工審查。

尚未證明：第三方任意可信度 module 的隔離、真實 TD publication、GPU compiler、browser/DOM layout、跨 release 文件支援年限。現有 Gate 照舊；這些 registry tests 不能解除它們。新的 open surface 是可供實作的技術合約，仍須獨立 review；不得將本文件自評為正式產品 qualification。

## IH-004 additive surface

本文件原定的 public/qualification 分類保持有效。[16_VIEW_MOUNT_CONTRACT](16_VIEW_MOUNT_CONTRACT.md) 與 `contracts/view-mount.ts` 新增正式 view contribution/mount semantics；先前僅有 Panel composition／Widget projection 不足以完成可見 UI 擴充。公開 declarations 可作 SDK 起點；headless surface、coordinator 實作與 fixture projection 仍是 qualification-only，不是選定 DOM 技術。

## IH-005 exact wire and editable Panel surface

[14](14_DOCUMENT_FORMAT.md)／`contracts/document-format.ts` 的 **grape.document 2.0** 及 adaptation/loss/recovery 欄位、schema ID、payload discriminant、operation語意都是 EXACT_IDENTITY。`ModulePreservationContribution`／`PreservationCodecResolver` 的SDK拼字可一致更名，但exactowner/codec/version lookup、只讀驗證、缺失保全與拒絕隱式重播不可改。`contracts/document-wire.qualification.ts` 只是舊reference與新wire之間的測試橋，不是production converter。

[17](17_PANEL_COMMAND_CONTRACT.md)／`contracts/panel-commands.ts` 為 NORMATIVE_SHAPE_RENAMEABLE。PanelServices沒有隱藏的寫入方法；Application-owned授權與executor經workspace/mount配接後，feature使用optional PanelMountContext.commands。範例executor、fake surface和referenceworkspace不是productionfoundation。Ledger保留所有先前view/localization/publicseams，新增PC-WIRE-EVIDENCE、PC-PRESERVATION-CODECS、PC-PANEL-COMMANDS。
