# Implementation-relevant decision log

此表只固定影響實作的選擇。來源 AC-002 含繼承方向；CQ-001 提供驗證覆蓋，MRDP-001 提供 Gate 時點。IH-002 的 B01/M01 是明記的 public contract 修補，見 [修訂與 Architecture Change 索引](HANDOFF_REVISION.json)；production-facing 表示正式實作者應沿相同責任與公開介面接合，不表示 reference 程式已是 production code，也不承諾永久 binary/plugin SDK ABI。普通內部工程細節不需要另開 architecture research。

| ID / decision | Reason | Source baseline / status | Rejected alternative | Reconsideration trigger |
|---|---|---|---|---|
| D01 Canonical Graph在application | 沒Host仍可編輯、保存、多Context共用；Host只執行 | AC-002＋本次最高定位；CONFIRMED | Host document為唯一真值／UI鏡像 | 真需求改成Host專屬文件產品；需owner決策，不以相容便利改 |
| D02 Graph含Stage，SubgraphDefinition持Network | 一份作品完整；Edge端點始終Node | AC-002 inherited C01–05；CONFIRMED | Stage各成Graph／非Node边界接口 | 無法表示必要新shader語意的具體反例 |
| D03 NodeType共用、Node實例、exact DefinitionSet | 模組可擴、固定生成來源、缺模組可保留 | AC-002；CONFIRMED方向，exact pin為EXPERIMENTAL BUT CURRENTLY ACCEPTED | 同名latest自動替換／多個同義Definition管理層 | G-VERSION-COMPAT；明確upgrade需求，但不私改resolver |
| D04 Parameter不持第二份值 | UI/腳本/Inspector同一修改路徑 | AC-002；CONFIRMED | Widget currentValue作canonical | 只允許暫態draft/mirror，不是重新開放真值 |
| D05 同步atomic Draft，Operation可含多批 | 動態接口／線／值／diagnostics一致；gesture一筆Undo | AC-002；EXPERIMENTAL BUT CURRENTLY ACCEPTED | 先改mode後另補線／async Draft／caught failure半批提交 | 可重現原子性或性能反例；保留外部語意下可換資料結構 |
| D06 stable port key，loss records與invalid保存 | 重排不換值，模式失線可說明與Undo | AC-002；EXPERIMENTAL BUT CURRENTLY ACCEPTED | 日常重排按index認接口／已detach到loss的線切回自動復線 | 新operation明確migration mapping；不可改日常身分規則 |
| D07 History、Updates、delivery分離 | UI每批更新、gesture一次Undo、必要時才生成／交付 | AC-002 UG；CONFIRMED分工，排程/cache策略為EXPERIMENTAL BUT CURRENTLY ACCEPTED | History兼任queue／15個移動=15次HostApply | 大圖性能數據；不得因此混淆ACK與saved state |
| D08 全圖Error先擋生成，Error圖可保存 | 能修復，不靠pruning藏錯 | AC-002；CONFIRMED | 未接輸出錯誤直接忽略／錯誤圖不可存 | 真產品改變validity承諾才重議 |
| D09 immutable snapshot＋只讀Generator | 結果與其圖／definitions/profile可對應 | AC-002；CONFIRMED | emitter讀activeContext／生成時修圖 | 已驗 GLSL profile 的具體能力缺口走 extension；任意語言後端需另行設計，不能由名稱推定 |
| D10 子圖／source／struct用Graph resources与模組契約 | 身分與共用明確，擴充不硬編碼名字 | AC-002 CG/WG；EXPERIMENTAL BUT CURRENTLY ACCEPTED | 字串猜引用／每子圖一個core type／Source default混live | reference closure或stage eligibility反例 |
| D11 Host值／原生定義與Graph分域 | 宿主有外部driver／資源authority；不能回滾別人 | AC-002 HG；CONFIRMED方向，CAS/receipts為EXPERIMENTAL BUT CURRENTLY ACCEPTED | Graph快照全量覆蓋native值／native callback改Graph | 真Host不支援必要一致性；G-LU-HOST-005 等仍有效。Mixed coordination 已依 DEC-GRAPE-001 延後，不是本期工程前置 |
| D12 receiving-side fence＋commit時取live值 | 前端忽略舊ACK無法阻止舊shader蓋新shader | AC-002 HG/UG；EXPERIMENTAL BUT CURRENTLY ACCEPTED | prepare前複製舊值／完成先後直接發布 | 真TD native commit/readback Gate否證 |
| D13 Layout→Pane→Tab→Panel；Panel/Widget一級擴充 | layout/作品 lifecycle 不同，可新增普通模組而不改 Graph/History core | AC-002 inherited UI；CONFIRMED ownership，IH-002 public composition 為 EXPERIMENTAL BUT CURRENTLY ACCEPTED、待獨立複審 | 關 Tab 就刪 Graph／closed PanelKind 永久限制／普通 Panel 自行拼 routing internals | G-EXTENSION-PANEL 已到 contract-qualified/runtime-unverified；真 renderer／平台證據保留，公開契約反例則重開 B01 |
| D14 平台只改bootstrap/adapter | Static/Node/Electron能漸進，core不因打包重寫 | AC-002/AC-001 inherited；CONFIRMED | Node/Electron API散到core／單一宿主托管是永久要求 | 相應deployment Gate與具體provider反例 |
| D15 missing preservation≠unsafe remap許可 | 保資料不能等同知道opaque引用的意思 | AC-002；EXPERIMENTAL BUT CURRENTLY ACCEPTED | 缺module丟state／無完整refs仍複製並聲稱成功 | 精確module恢復或明確codec能證完整重映射 |
| D16 CQ disposition与產品完成分開 | 模型證明不是618功能實作；Gate可按slice而非全域阻塞 | CQ-001/MRDP-001；已採用交接判讀 | 全測試綠就Migration Ready／所有Partial先全部重寫才可planning | 新證據/產品範圍變動；建立新revision |
| D17 範本與production分開 | 原型便於驗證，不代表人類可維護的production布局 | AC-002 proof bounds＋本次handoff；CONFIRMED | 繼續堆qualification classes當產品 | 無；可重用測試與契約，產品結構另按本包切slice |
| D-N02 GLSL profile 與任意語言 backend 分清 | 封存 emit/lowering 仍含 GLSL 語意，只驗 shell/version/capability seam | IH-002 接受 Independent Review N02；DOCUMENTATION CLARIFICATION | 用 backend 名稱承諾 WGSL/JS 等可直接替換 | 新產品需求另授權語言後端；此次無新增抽象或架構變更 |
| D-N03 獨立 current progress locator | PM／實作者／reviewer 可查現在產品，封存研究不兼任進度真值 | IH-002 接受 Independent Review N03；HANDOFF CONVENTION | 覆寫 CQ disposition／每個 slice 各自藏一份進度 | 多 writer／多產品需求若真出現再擴充；目前單一 current 檔＋scoped evidence 即足夠 |
| D-B01 public Panel composition | 一般擴充只實作 PanelType／Panel，registration 到 restore/routing/move/close/dispose 使用同一公共契約 | [IH-002 revision](HANDOFF_REVISION.json)、[Panel composition contract](executable-reference/repair/PANEL_COMPOSITION_CONTRACT.md)；EXPERIMENTAL BUT CURRENTLY ACCEPTED、待獨立複審 | central type switch、Panel 自造 target/restore resolver、讀 private Layout/Manager、sample-only facade | 具體普通 Panel 無法沿 seam 接合，或 lifetime/order 反例；修最小 contract，不把 Graph/History 交給 Panel |
| D-M01 single scoped Parameter target | spec/value/type/link/projection/write 指同一 logical target；root/nested 共用 renderer | [IH-002 revision](HANDOFF_REVISION.json)、[Scoped Parameter contract](executable-reference/repair/SCOPED_PARAMETER_CONTRACT.md)；EXPERIMENTAL BUT CURRENTLY ACCEPTED、待獨立複審 | root-only projection＋scoped write 混用、UI 遍歷 resources、per-occurrence 第二份 canonical value | collision/stale/definition-chain/interface/notification 反例；修 resolver/lease 邊界，不新增 nested-specific renderer |

**尚未選擇的產品行為**：Personal符號陣列範圍、named layouts超限、cross-manager adoption、native Viewer可見性、native Parameters遠端scope。其合理替代与後果保存在Gate／MRDP編譯資料；不能把未定案選項列成上述confirmed decision。

## IH-003 adopted repairs

| Decision | Reason | Source / status | Rejected alternative | Reconsideration trigger |
|---|---|---|---|---|
| AC-IH003-01 contract ledger/open seams | Production API cannot be inferred from qualification bounds | B1/M3/M5; experimental accepted, pending independent review | Copy unions/classes; promise arbitrary-language backends | Concrete extension/topology counterexample, recorded AC/regression |
| AC-IH003-02 grape.document 1.0 | First save/reload needs technical format | B2; experimental accepted | Experimental/TD identity as product format; silently drop unknowns | Proven data loss/ambiguity; explicit version change |
| AC-IH003-03 feature-owned localization | Extensions own visible strings without central catalog edits | M2 + user requirement; experimental accepted | Per-node shell table; locale as Graph state | Contribution/fallback/lifecycle counterexample |
| ED-IH003-01 production boundary checker | Enforce public entrypoints/dependency direction | M4; engineering enforcement | Reference permissive manifest as production permission | Static bypass; runtime semantics still need tests/review |
| ED-IH003-02 progress schema2 | Decision/AC references survive Context changes | M6; engineering convention | Rewrite CQ; add large PM system | Actual multiple-writer/project requirements |

During implementation use stable `DEC-<project>-NNN` or `AC-<project>-NNN` IDs, reason, before/after, affected responsibilities/invariants, rejected alternatives, evidence and status. Store records outside the frozen package and reference their hash in current `decisionReferences`; an adopted baseline references only accepted records. An engineering label does not authorize a product/ownership change. G-DOCUMENT-STABILITY-COMMITMENT remains an unresolved human policy; technical schema is defined. Full evidence: [change record](audit/SECOND_REVIEW_CHANGES.md).

## AC-IH004-01 — feature-owned view contribution / shared mount semantics

- Decision：Panel 與 Parameter Widget 保留各自 contribution type，共用 renderer mount ownership、invalidation、failure cleanup 與 async fencing。確切契約見 [16](16_VIEW_MOUNT_CONTRACT.md)。
- Reason：FIR-B01 的反例成立；原 public Panel composition 與 scoped projection 能更新資料，但未提供未知 feature 的共同 view 交付入口。
- Source：IH-003 與 [fresh independent review](provenance/final-independent-review-IH-003/HANDOFF_FINAL_INDEPENDENT_REVIEW.md)。狀態 EXPERIMENTAL BUT CURRENTLY ACCEPTED，待 fresh re-review。
- Rejected：central type switch／private class method glue；讓 implementer 到 S01 自行發明長期 seam；把所有 Widget/Panel 塞進万能 UI AST；為本輪選定 DOM framework。
- Unchanged：Graph、EditorContext、History、ScopedParameterTarget、localization、routing lease、field draft、close guard 與 Host authority。
- Reconsideration：第二個普通 extension 仍需改不相關 core，或具體反例顯示 mount/failure 清理會使 state/authority 失真。先保反例再修契約，不能 bypass。

FIR-N01 為 documentation-only consistency repair：04 主表直接使用 production terminology；reference 舊符號只作明標 mapping，不另改 API。

## DEC-GRAPE-001 — accepted product scope carried into IH-005

- **Decision：** 当前初期 S08/S09/release 只交付 domain-separated Undo；coordinated Mixed History、LC-UI-100 与原 AT-S09-03 是 DEFERRED_BY_PRODUCT_DECISION，不是永久删除，不是 PASS/Covered。
- **Authority：** [DEC-GRAPE-001](provenance/product-decisions/DEC-GRAPE-001.md) 与 [原样 JSON](provenance/product-decisions/DEC-GRAPE-001.json)；副本 hash／来源／locator 区分见 [copy provenance](provenance/product-decisions/COPY_PROVENANCE.json)。原接受人、接受状态、sourceBaselines 与 sourceEvidence 不重写。原注册字段描述 IH-004 当时环境；IH-005 的有效 scope 由本包 slices/Gates 编译，不要求重读外部路径。
- **Reason：** Graph History 记录 semantic document edits，runtime streams 不等于用户编辑意图；不把高频 readback 淹入全局 Undo。
- **Adopted path：** explicit command domain → 各域 History；Graph Undo 先完成 canonical restore，再由 active Binding 发新的 conditional live write。Host conflict 显示 divergence，不补偿 Graph、不用最新 mirror 默许 rebase。
- **Retained：** CAS／authority／receipts／load+epoch+incarnation／stale-reply／own-domain no-op Redo／LC-UI-101、G-LU-UI-008、LU-UI-009。Publication 仍保相容 current values，不用 resetSourceIds 实作 Undo propagation。
- **Rejected：** hidden/partial coordinator、experimental toggle、feature flag；把分域测试当 unified chronology 已通过；为 defer 删掉安全义务。
- **Validation：** AT-DEC-GRAPE-001-01…10 已编成 S09 acceptance，与 S08 按scope共享；全部 REQUIRED_NOT_EXECUTED。没有开始 production，也没有 runtime acceptance。
- **Reconsideration：** 只有新的明确产品决策与 user-intent-level 需求证据才重新纳入；不因 legacy 曾实现就自动复活。
- **Architecture change：** 这项产品 scope／command-trigger 政策本身不新增 owner 或 coordinator；原 ownership invariants 保持。IH-005 其他技术修复另以 AC 记录，不混作此产品决定。

## AC-IH005-01 — canonical adaptation/loss/recovery wire identity

- Decision：採 `grape.document 2.0` 與14的core-owned versioned adaptation/loss/recovery schema；preservation採五種tag，module資料有exactowner/codec/version。runtime→document必須明確映射，不照抄reference type。
- Reason：IHR4-B01反例證明Json與structural fencing缺少唯一解讀；新增requiredwire語意不符合舊版本相容範圍。
- Source：IH-004＋本次[blind review](provenance/blind-review-IH-004/HANDOFF_FINAL_INDEPENDENT_REVIEW.md)；技術狀態EXPERIMENTAL BUT CURRENTLY ACCEPTED，未獲independent final acceptance。
- Rejected：沿用1.0卻改解讀；arbitrary Json承載requiredconversion；載入時猜plan或自動restoreloss；把參考類別当wire。
- Reconsideration：新operation或payload需要不能由目前tag表達的語意時，提versionedtechnicalchange及converter／unknown-case證據；不可把requiredsemantics藏入inert extensions。
- Validation：DF01–17／DW01–13、strictTS與完整回歸；初始bridgeboundary與nestedenum反例及修復記於audit。原INV-004/010/011/015/017/021意思不變。

## AC-IH005-02 — editable Panel scoped command capability

- Decision：`PanelType.commandIds`請求，Application授權／執行，Workspace綁定Panel/target，shell綁定event；feature取得optional `PanelMountContext.commands`。Application保留Operation與History。
- Reason：原PanelServices文案沒有實際對應公開入口；普通Canvas不可被迫穿透Graph或猜origin/lifetime。
- Source：IH-004接受的mount/composition契約＋本輪明確repair範圍；EXPERIMENTAL BUT CURRENTLY ACCEPTED。
- Rejected：rawGraphhandle、caller自選origin、readonly自動可寫、centralCanvaskind特判、新通用commandframework。
- Lifetime：mount/eventroute結束只取消未完成Panelpointergesture，保留Widgetdraft；cleanup引起的modelpublication必須在workspaceaction返回前送新lease。PC13反例促成ordering修正，未改既有INV-009。
- Validation：PC01–13＋既有Panel/scoped/rendering回歸，Graph/History/corehash未變。
- Reconsideration：有反例無法在Application-command與公開scope內安全表達時，先留證據再修契約；不能繞過授權或用延後協調器掩蓋。

IHR4-N01僅同步目前IH-005/template/checker指令；舊IH-003/IH-004紀錄標成historical。DEC-GRAPE-001是另列的已接受產品決策，不由這兩項AC重新授權。
