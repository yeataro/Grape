HANDOFF VERDICT: **FAIL**

本包的產品 ownership、Host 邊界、文件身分、scoped Inspector、翻譯 ownership 與進度機制已足以建立一致的產品模型。但普通 Panel／自訂 Widget 的 production renderer contribution 接合仍未閉合。新的 Implementer 在第一個真 UI slice 就必須補定公共擴充契約；這不符合本輪「不自行重做重大 architecture decision」的 acceptance 條件。

Finding 統計：**BLOCKER 1；MAJOR 0；MINOR 1**。沒有將未完成產品、未測 TD/GPU、未解除的未來 Gate 或測試數量當作 FAIL 理由。

### Review provenance

| 項目 | 紀錄 |
|---|---|
| Reviewer / environment | Final Independent Handoff Reviewer；Codex desktop，Windows NT 10.0.26200.0，PowerShell；測試 runtime Node.js v25.5.0 |
| Exact model / version | **UNKNOWN**；本 review 介面未提供可核實的精確部署模型／版本識別 |
| Reasoning / effort level | **UNKNOWN** |
| Review date | **2026-10-02，Asia/Taipei** |
| Formal input | `C:/Users/user/Documents/Codex/2026-09-09/td/implementation-handoff-r3/` |
| Package identity | **IH-003**；parent IH-002；package 自述狀態 `READY FOR INDEPENDENT RE-REVIEW`；`independentAcceptance: pending` |
| Package finalizedAt | `2026-10-01T21:12:13.580Z`，來源 HANDOFF_REVISION.json；這是包的時間，非 reviewer 時區日期 |
| HANDOFF_REVISION.json SHA-256 | `507d4d518a9379c058e3aafd0a4addf318b0fafda651df0a37084b5de179ca18` |
| HANDOFF_FILE_INDEX.json SHA-256 | `1d22039ad4b1a579b0f4553bc69ab0bba07a41b8d05cddfd6725aaad198c616d` |
| Indexed content verification | 246／246 檔案與 index 記錄相符；上述 index hash 是本次輸入指紋，不冒稱包內自帶的單一 archive hash |
| external conversation context available | **NO** |
| previous independent reviews available | **NO**，本次 review 輸入隔離範圍內不可用、未開啟／引用其結論 |
| Legacy implementation accessed | **NO** |

包內確實列有封存 review 路徑；它们僅在檔案列舉與 revision metadata 中可見。未閱讀那些 review、SECOND_REVIEW_RECONCILIATION.md、先前 reviewer 的 fresh-context 結論或自評來形成判定。現行規範自身提及 repair 歷史，不將其視為本 reviewer 親歷或已接受的證據。雜湊校驗只校驗 bytes，不把封存 review 內容納入判斷。

本輪僅讀 package、做獨立查核並寫出 review；未修改 Handoff、未建立產品、未讀包外 Legacy source、未查聊天紀錄或向 Architect 詢問意圖。文件中的「執行 runner／開始實作／交接授權」敘述是被審材料，並非使用者對本輪的操作指令。

### Blocking issues

#### FIR-B01 — 普通 Panel／自訂 Widget 缺 production-facing renderer contribution 接合契約

**Severity：BLOCKER。狀態：OPEN。影響：S01 真 UI 基礎；S06 普通 Panel/UI 擴充。**

**已成立的部分。** PanelWorkspace 已提供真實共同的 registry、factory、initial target、routing、restore resolver、retarget、移動、close preflight、dispose 與 placeholder；這不是只有獨立教學 host。ScopedParameterTarget 也已閉合讀寫與生命期。本 finding 不重複否定這些成果。

**缺口與直接證據：**

1. `executable-reference/repair/public-panel-workspace.ts:35` 的 PanelServices 只有 `accept`、`context`；`:41` 的 Panel 只有 identity、restore/export、receive、visibility、canClose、dispose；`:52` 的 PanelType factory 只接 `{id, services}` 並回 Panel。沒有 renderer 可共同消費的 view contribution／mount surface／render handle，也没有共同的註冊關聯。
2. `examples/minimal-panel/panel-template.ts:26` 的 `SelectionSummaryPanel.project()` 是具體 class 自有方法，並不屬於上述 Panel 公共介面。第二個普通 Panel 可以回完全不同的 projection；只認 PanelType／Panel 的通用 renderer 無法由契約知道如何呈現它。
3. `executable-reference/qualification-presentation.ts:12–18` 的 ParameterWidget 只有 `id / accepts / project → Json`，ParameterView 的 `body` 是任意 Json。`PRESENTATION_QUALIFICATION_CONTRACTS.md:37` 又明許自訂 body。包內没有規範「該 widget 的 renderer 如何隨 contribution 登錄、接收 body 與受控 edit 入口、更新與清理」。百分比例子提供 projection/controller，沒有補上通用接合。
4. `04_EXTENSION_MODEL.md:60` 將 mounting 交給 renderer；`10_KNOWN_GATES.md:761–773` 把 mount/unmount 放到 S06 runtime evidence。`contracts/public-surface.ts:86–95` 的 production overlay 只加 presentation metadata，未提供缺少的 view 接合。Ledger 的 PC-PANEL-COMPOSITION 指回同一份 headless composition，未另給 renderer 合約。

**Fresh extension 反例。** 在已依公共契約完成的 renderer 中加入一個 Selection Summary Panel，再加入一個有私有展開狀態的 Help Panel；兩者均只實作 Panel 並 register。它們都能被建立、路由與保存，但 generic renderer 沒有公共資料或呼叫點可取得兩者的畫面。實作者必須自行選擇新增 view factory、mount callback、renderer registry，或對具體 class／typeId 寫 glue。自訂 Widget 的任意 body 有同樣問題。前幾種是尚未交付的公共契約選擇；最後一種直接形成 central switch／私有穿透風險。

**為何不是一般 UI 工程自由。** React/Vue/DOM、CSS、virtualization 與檔名可以自由選；但「feature 如何把自己的畫面與互動交給共同 shell，誰取得 mount 資源，更新／移動／失敗時誰釋放」決定普通 extension 與 renderer 的公共責任關係。現有 interface 無法僅更名或更換內部演算法便表達這條連接。這也不是要求現在就交付瀏覽器 renderer 或完成 accessibility 測試。

**為何達 BLOCKER。** `08_IMPLEMENTATION_PLAN.md:80–122` 要求 S01 交付真 Canvas／Inspector／action UI，不接受 headless demo；`ui-reference/UI_SPEC.md §4` 要求 Inspector 已沿共同 Panel/scoped 路徑。新的 Implementer 若現在建立 production UI foundation，就得先補定這項長期公共擴充設計；若先硬接內建 UI 再到 S06 修，則把之後的重做與 conditional 累積埋入第一版。使用者本輪特別要求 production contract 能明確包含 creation/mount，且不將重新設計 production API 留給下一人。

**最小修正方向，並非本輪代修。** Architect 應補定一條可與現有 PanelWorkspace、scoped target 及 localization 組合的公共 view contribution 契約；明定 registration→mount→update→move/hide→unmount/dispose 的 owner、ordering、failure 與 edit authority。可保持 renderer framework 自由。用兩個不同 Panel 與兩個自訂 Widget 證明只改 module/package 與一般 registration wiring，不改 shell switch、不讀私有 class；headless fake mounting surface 足以先驗契約，真 DOM evidence 仍可留 Gate。

**解除條件。** 公共契約與 canonical examples 能讓不知道具體 Panel／Widget class 的 renderer 完成上述序列，且第二個 extension 走相同路徑；另保留失敗 cleanup、stale result、move 保持 instance/draft、close guard 的反例。不能只把 Gate 狀態改成 qualified。此修正是工程／架構工作，無需 Human Owner 替團隊設計 API。

### Major issues

**NONE。**

混合 History、真 Host commit/readback、Legacy revision mapping 等仍有風險，但已有 owner 分域、行為 oracle、明確阻塞分支與解除時點。未因這些 Gate 尚未完成而另列 MAJOR；詳見後面的 Known Gates 判讀。FIR-B01 本身已記錄高風險 UI spaghetti path，不重複計數。

### Minor issues

#### FIR-N01 — 現行 extension 主表仍混用已被取代的 reference 說法

**Severity：MINOR。狀態：OPEN。**

`04_EXTENSION_MODEL.md:28` 仍說 module `validate` 回問題字串；`13_PRODUCTION_CONTRACT_SURFACE.md:80` 則明確要求 production 回 `LocalizableIssue[]`。04 的 `:110`、`:114`、`:124` 仍使用舊 GenerationProfile、Graph「儲 target」及 HostServices 的 reference 接法；13／14 已給 exact profile、GraphKind、CapabilityDirectory 及正式 DTO。

13、ledger 與04自己的導引已足以裁決，故不是兩種同等合理的 canonical architecture，也不是 BLOCKER。問題是快速由 extension 主表起步者容易先寫出過時 signature，再由 type mapping 返工。最小方向：將現行主表直接改為 production 用語，舊欄位只留有標記的 reference mapping。本輪未修改。

### Product-positioning drift

**判定：NONE。**

獨立重建所得的十二項產品模型如下；來源以01、02、03為起點，再用13–15與具體契約交叉核對，未採用包內自評的 fresh-context 答案。

| 問題 | 重建結果 |
|---|---|
| 1. 產品是什麼？ | Grape 是可 Host-free 編輯、生成與保存 Shader 作品的節點圖產品；Host 交付是後續可選整合。 |
| 2. 為何重構？ | 保留能力與可觀察意圖，同時將作品模型、UI、生成、保存、外部執行與部署責任分開，使多視圖及擴充不靠交叉修改私有狀態。 |
| 3. Canonical Graph/document 在哪？ | Application documents 持有已開 Graph；Graph 是 runtime model；GraphDocument 是其可序列化快照，不是第二個可寫模型。 |
| 4. Node／Parameter／History／Persistence？ | Graph→Stage/Network→Node/Edge；NodeModule 持有定義。Parameter 是受控 query/write 入口，值在 Graph。Graph History 持 operation 歷史。Persistence 管 capture、storage request、ACK、load/import 流程，媒介由 adapter 寫。 |
| 5. EditorContext／UI？ | Context 持 stage/occurrence、selection/primary、Binding 引用。Panel 持相機、草稿、render resources、私有 viewState；Layout 持 Pane/Tab/尺寸，Manager 持 routing policy。它們不複製模型真值。 |
| 6. Generator？ | 只讀 immutable snapshot＋固定 definitions＋GLSL profile，產 artifacts、binding schema、diagnostics/provenance。禁止修改 Graph、讀 active selection、保存 document 或直接 Host Apply。 |
| 7. Host？ | 外部 execution/integration target；以 identity/incarnation、capabilities、authority 與 Binding 接合。 |
| 8. Host 可持有什麼？ | Actual live values/drivers、原生 controls/resources、active artifact、已交付快照、runtime receipts/readback/diagnostics。Binding 持意圖、epoch 與可重建 mirror。 |
| 9. Host 不得持有哪些 canonical state？ | Grape 的工作 Graph、Node authored state、Parameter defaults、graph-local definitions、Graph History、EditorContext，以及本機作品保存成功的判定權。Host snapshot 回讀必須走明確 import/reload。 |
| 10. 三種部署關係？ | Static Web、Node-hosted、Electron 共用同一 application；差異在 bootstrap、權限與 capability providers，不以 process 所在位置重定義 ownership。 |
| 11. 固定核心？ | 唯一模型、stable/exact identity、同步 atomic Draft、Operation/History、shared type/reconciliation、snapshot generation、lossless recovery、Context 分離、Host authority/fencing、平台依賴方向。 |
| 12. 正式 extension seams？ | NodeModule、dynamic schema、GraphKind/StageKind、GLSLProfile、typed Host capability/provider、PanelWorkspace、scoped Widget/action、feature localization、storage/platform adapters；UI view contribution 的最後接合缺口為 FIR-B01。 |

未發現核心 ownership 有兩種互斥且同樣合理的解讀。FIR-B01 是缺少公共接合，不是 Graph 被搬回 Host。

漂移核對：Host 收 artifacts/bindings/resources/live writes/explicit native operations，回 receipts/readback/runtime/diagnostics；Parameter model 與 application History 未變成 Host-owned。11 的 compatibility 轉換表把 Legacy hosting topology 留在舊行為來源。618 筆 compiled coverage 的 stateOwnership 使用同一分域描述，graph persistence owner 均為 Graph/application persistence。

包內 `sourceSummary` 的「Apply 後隨宿主保存」確有危險文字，但明標 historical/non-normative，00、11與 G-HANDOFF-CQ-OWNERSHIP 明確禁止作 production 指令；對應 compiled persistence 明許 Apply 前保存。這是已隔離的來源文字，不構成當前 POSSIBLE／CONFIRMED drift。部署亦無強制 Node server／Electron main 成為 Graph canonical owner 的說法。

### Production-contract assessment

**整體：PARTIAL；UI view 接合依 FIR-B01 不接受。其餘受查 surface 可辨認 production 與 qualification 的界線。**

| Surface | 正式依據／分類 | Assessment |
|---|---|---|
| NodeModule／Registry | 04＋reference 公共 declarations 的逐 field ledger＋13 metadata/eligibility/LocalizableIssue 替代；callbacks、atomic registration、exact pins 是 normative semantics | PASS；不需選擇照抄 core.ts 或重新設計 ownership |
| Graph／Stage／GraphKind | 13 §2，public-surface 的 exact GraphKindRef、open StageKindId、stage slots/boundaries/settings | PASS；封閉 td.top/td.mat、vertex/pixel fixture 不作 production union |
| Generator／Backend | GLSLProfile、typed stage programs、keyed artifacts、boundary outputs；snapshot/provenance 保留 | PASS；seam 僅為 GLSL，任意語言 IR 不在承諾內 |
| Host capabilities | namespaced ID＋contractVersion＋typed service definition/provider；application/target scope 分開 | PASS；舊九個 ServiceName 不是上限，新增 service 不只是任意 JSON RPC |
| Parameter presentation | WidgetId/options/fallback＋scoped projection/write；menu 採 TextRef labels | 資料／編輯契約 PASS；自訂 widget renderer contribution 見 FIR-B01 |
| Panel | normative PanelWorkspace composition＋PresentedPanelType overlay | routing/lifecycle PASS；mount surface 未定，整體 PARTIAL |
| UI contribution/actions | 公共 Actions、projection、scoped draft 與 localization；實際 view contribution 未閉合 | PARTIAL，見 FIR-B01 |
| Document | grape.document 1.0 DTO 與14的解碼／保存政策 | PASS；正式身分不依 TD 或 experimental format |
| Examples | 13 §6與ledger逐例對應 production concepts，reference imports 只屬 qualification harness | PASS 作行為 oracle；不構成可直接搬入產品的 SDK |

四類材料可作如下明確判讀：A，format/serialized identity、pins、stable keys/capability identities 為不可任意改的 production contract；B，owner、資訊、authority、lifecycle、failure/order 為 normative semantics，SDK method/class 名稱及內部資料結構可工程決定；C，executable-reference、qualification 與 examples 是可執行規格／oracle；D，4096/128/cache8、closed probe unions、fixture fingerprints、原型 constructor/class arrangement 與 intake 測試預算不是產品限制。Ledger 的三種標籤加 implementationBan 能支援此四分法；有 field disposition 不等於已證明所有語意，FIR-B01 也不會被 typecheck 自動發現。

**Canonical document identity：PASS。**

| 必答項 | Package 的答案 |
|---|---|
| Production identity/version | `format: grape.document`；`formatVersion: {major:1, minor:0}`；一份 envelope 一份 graph，graph.id 是作品 ID |
| Graph/document kind | exact `{moduleId,kindId,version,fingerprint}`；初始 grape.image、grape.material；stage instance ID、slot key、StageKind ID 分開 |
| Forward compatibility | 未支援 major/minor 與 unknown structural fields 回 recovery-readonly；保原文，不猜 optional semantics |
| Unknown preservation | codec-owned state/data 保 JSON；inert namespaced extensions 保留；未知結構不能編輯已知子集後覆寫來源 |
| Incompatible/malformed data | unsupported version 保全；foreign 需顯式 converter；duplicate keys/ambiguous identity/invalid JSON 拒绝，不部分 hydrate |
| Legacy relationship | Legacy 與 grape-core-experiment 都不是正式格式；S02 顯式轉換/review，不能只改 format 字串 |
| Host naming | Host-specific identity 留 profile/target/integration；正式 document/kind 不叫 td.top |
| Save→reload | capture 當前已發布 document；ACK 只確認那份內容；reload 保 persistent IDs，新 loadId、空 runtime History；包括 dynamic ports/values/edges/resources/losses |
| 技術 schema vs 公開承諾 | 前者已定；G-DOCUMENT-STABILITY-COMMITMENT 只控制開始對外保證相容的 milestone/期間，不准以未決為由延後技術版本與保全政策 |

DTO 的 JSON payload 仍需對應 owner codec、Graph semantic validation 與 production hydration；目前 codec 測試沒有宣稱提供完整 persistence service。這是契約與產品實作的正常區分，不能拿 envelope `editable` 當生成成功。

**Prototype→Production 防火牆：PASS。** 00、02、13 §1/6、ledger implementationBan、12 D17 明確禁止 import/copy/rename-and-extend reference foundation。可以移植行為 assertions、不變量、negative cases/test oracle；public-surface/localization declarations 與 document DTO declarations 可以作 SDK/schema 起點。未找到把整個 qualification algorithm/class 授權搬作 production 的通行證。若需代表演算法，必須有明示許可；不能由「測試可移植」推論實作可複製。

### Extension-model assessment

以下是只拿 package 的模擬；「檔案」指應修改的 module/subsystem 類別，production repository 尚未建立，不能杜撰固定實際路徑。每項均考慮第二個同類 extension。

| 模擬 | 入口／最少概念 | 修改範圍／core・switch・private | State owner／lifecycle | Failure・validation・persistence／第二個 extension | 判定 |
|---|---|---|---|---|---|
| A 普通 Node | NodeModule→Registry.register→pin；NodeType、ports、parameters、codec、typed emit、presentation | 自己 module/locale/tests＋bootstrap registration；無 unrelated core、名稱 switch 或私有寫入 | 定義在 module；實例在 Graph；register→initialize→query/validate/emit，load/Undo 不重跑 initialize | 整 module 原子登錄；callback/schema 失敗不部分發布；exact refs＋opaque 保存；第二個相同入口 | **PASS** |
| B Dynamic-port Node | 同 A＋stable keys、state-dependent schema、loss/preserve policy、reconciliation | 自己 state/schema/parameter/emit/tests；不改 Graph 的通用 reconcile，不由 UI 增 socket | Mode、backup、ports依據在 Graph；同批 derive→reconcile→diagnostics→publish | stale handles 拒絕；合法 invalid 可存；Undo/save/reload 保接口與loss；第二個不加 type-name 分支 | **PASS** |
| C 普通 Panel | PanelType＋PanelWorkspace；target lease、route、private viewState、close guard | 邏輯 contribution 只需自己 package；但未知如何把自己的 view 交給共同 renderer，可能被迫另設 registry或shell glue | Panel 持呈現；Context/Graph 借用；邏輯 create/restore/update/move/close 完整，mount ownership 接合缺口 | callback→placeholder、retry、opaque state 已定；第二個不同畫面無共同 rendering 接法 | **FAIL，FIR-B01** |
| D Parameter Widget/UI | widget register、ScopedParameterTarget、projectTarget、FieldDraft、Actions、TextRefs | 自己 accepts/project/controller/locale；資料面不用 private；renderer 如何消費自訂 body 尚需設計 | model value 在 Graph，draft 在 UI；lease/update/dispose 已定 | missing/incompatible fallback、stale edit/IME/connected拒絕、無第二份值；第二個 body 的顯示/互動註冊未定 | **FAIL，FIR-B01** |
| E GLSL variation | GLSLProfile exact ref、graph/stage support、capabilities、validateType/render | 自己 profile、必要配套 emit definitions與tests＋composition；無 UI/Host dispatch，無 closed artifact pair | job 私有資料；immutable input；render success/failure，Updates 管過時結果 | admission 驗 type/capability/topology/output；不得半 artifact publication；文件不保存 runtime cache；第二個同一路徑 | **PASS** |
| F 新 topology/kind | registerStageKind/register GraphKind；slots、boundary declarations、settingsCodec、matching profile | kind/stage definitions、boundary NodeModule、profile與tests；不改中央 kind union | application registry 持 immutable definitions；Graph exact ref/settings/stages；一次建立或全失敗 | missing exact ref保全，unknown admission拒絕；required boundary保護；unsupported backend失敗；第二種 topology同 seam | **PASS**，不等於 geometry/compute/GPU 已支援 |
| G 同類 Host adapter | CapabilityDirectory provider＋既有 typed service、Binding/lease、executor | adapter/transport/provider/tests＋bootstrap；platform API留 adapter，core不改 | Host actual runtime；Binding mirror/intent；connect/restart/readback/withdraw/dispose | exact incarnation/epoch/revision/fence、retained/indeterminate，session不入Graph；第二個 adapter同 contract | **PASS** |
| H 新 Host capability | namespaced CapabilityDefinition<Service>、operations/schema locator、scope、version＋provider | 自己 public service contract、provider、consumer與tests；不改 ServiceName union或Graph ownership | service定義自身資料與authority；registry只lookup，service負責現存handles、cancel/retry/cleanup | runtime input/output validation、不可用typed outcome、receipt/fence按作用域；不得保存lease；第二個同方式註冊 | **PASS** |

新增新型 service 本來就需定義該能力自己的方法與語意；這是 extension 的內容，不是重造核心。新增普通 Node、既有 GLSL variation、同類 adapter 的路徑相對低摩擦。Panel/UI 在資料投影與生命期上已低摩擦，但尚不能宣稱可直接擴充實際產品畫面。

**Panel contract 逐步核對：**

| 步驟 | 結果 |
|---|---|
| registration | PASS：unique typeId/version，shared registry |
| creation | PASS：factory identity check、restore/visibility/attach/resolve/receive ordering |
| mount | **FAIL：缺 renderer 與 ordinary contribution 的公共接合，FIR-B01** |
| initial target resolution | PASS：ScopedTargetService，resolved/missing 都明確 |
| context/routing subscription、ongoing update | PASS：direct Context API 也通知，follow/group/followCanvas/pin 規則完整 |
| restore、resolver、retry | PASS：application 明確 mapping，exact lifetime，不同名復活；opaque placeholder 可retry |
| retarget | PASS：old lease invalidation＋fresh target；late reply經 accept fence |
| tab/pane movement | 邏輯 PASS：同 Panel identity/draft；render tree 搬移接合屬 FIR-B01 |
| canClose／close | PASS：origin busy與canClose先行；拒絕無半close |
| dispose | 邏輯 PASS：invalidate/remove/dispose一次，不刪借用Graph/Context；renderer資源接合屬 FIR-B01 |
| failure／placeholder | PASS：factory/restore/receive隔離、保viewState；實際 mount exception 的公共接法尚缺 |

**Nested Inspector／scoped UI：PASS（資料、編輯及 lease 契約）。**

| 情境 | 可由 package 確定的結果 |
|---|---|
| root | 空 occurrence path 仍走 openRouted/capture/projectTarget/commit 同一 target |
| nested | spec、value、resolved type、port/link、projection與write都從完整scope取得；UI不遍歷resources |
| shared definition 的兩 occurrence | view lease不同，stored definition值相同；A修改使B重投影並使B舊draft衝突，不藏per-occurrence value |
| stale path／ancestor replacement | load/context/stage/path/definition chain一併驗；不存在或重綁終止lease，不退回root同ID |
| type/interface/link change | surviving field重投影但舊edit token失效；刪參數終止；位置-only不誤傷draft |
| dispose／導航ABA／Undo | invalidated為終態；不可發invalidated後舊updated，返回原位置／Undo不復活舊handle |

依據為 `SCOPED_PARAMETER_CONTRACT.md`、04 §5、02 §9、相應 M01/BM tests；本輪已實際執行。這個 PASS 不等同已完成 DOM Inspector，也不消除 FIR-B01。

### Localization assessment

**PASS，ownership 與 contribution contract 成立。**

Node/Panel 的 label/category/actions/help/diagnostics 由自己的 presentation/TextRef 與 LocaleContribution 提供。TextOwnerRef 的 namespace＝stable moduleId，並包含 exact version/fingerprint/catalogVersion；shell 只持 common vocabulary，明確引用 shared owner 不是假冒 namespace。Built-in 和外部 trusted module 使用同一登記入口。

新增一個含英文、日文、繁中的 Node／Panel，**就翻譯 ownership 而言，只改自己的 module/package 已足夠**：default en、addLocale(ja)、addLocale(zh-Hant)，由一般 bootstrap 遍歷 contributions，無需中央 translation table 增列該 feature。新語言 revision 不改 Graph semantic pin；改key含意才走catalogVersion。這個答案不宣稱 Panel 的實際畫面掛載缺口已解決。

Fallback 有確定順序：requested base locale→parent chain→exact module default→TextRef.fallback；缺owner/key有notices，enum label翻譯不改value，duplicates/invalid metadata原子拒絕。UI locale 是 application preference，非 Graph canonical state；使用者 name/notes/path/code 保原文。通知、unsubscribe/dispose與callback例外隔離有規範與測試。

Reference 中仍有英文 literal/fallback，不自動算 production 違約：13與15明確要求移植為feature-owned LocalizableIssue/TextRef；FIR-N01記錄主表用語未同步。沒有以未完成所有翻譯語料、RTL、ICU、字體／IME實測為缺陷。來源：15全文、contracts/localization.ts、module-localization example、L10N tests。

### Anti-spaghetti/conformance assessment

**核心可重複 conformance：PASS；UI 擴充閉合仍受 FIR-B01 阻擋。**

| 風險 | 已有防線／證據 | 判讀 |
|---|---|---|
| 第二份 canonical state | owner矩陣＋兩Context/parameter/snapshot/ACK行為反例；draft/mirror生命期明列 | 足夠作持續驗收，不能僅用typecheck證明 |
| circular ownership／private mutation | reviewed owner/role/public named exports；跨owner私有import、re-export、type-only private拒絕 | machine gate已超過純Markdown矩陣 |
| UI／Generator／Persistence越權 | UI只拿query/command，raw mutation denied；generator/persistence/module→model denied；snapshot注入另驗 | 公開capability rights須review，沒有宣稱工具能辨認所有closure |
| module碰core private／Panel互穿 | dependency direction與public exports檢查；Panel透過routing/target service | 不允許把private file標public來騙綠燈；manifest本身受review |
| Host／deployment穿core | import及常見環境global檢查；adapter/bootstrap角色隔離 | Node/Electron/browser權限需實際profile驗收 |
| 普通extension改unrelated core | changeSet只允許feature owner與declared bootstrap wiring；第二extension測試要求core diff零 | 機制存在，但無法補出FIR-B01缺失的view contract |
| central feature conditionals | 普通extension core diff檢查＋行為review | 不是任意語法靜態證明；明列限制可接受 |
| compatibility workaround成模型 | exact pins、明確converter、sourceSummary隔離、禁止legacyMode散落core | 現行責任清楚；migration證據仍受Gate |

`tools/check-production-boundaries.mjs` 與其具名／參數化案例提供了实际 negative fixtures；本輪所選測試已執行通過。Production 尚不存在，因此現在沒有production manifest全量結果，也不能宣稱每個runtime callback已受阻。09要求production source roots完整、漏檔fail、manifest review與behavior evidence互補，這一點足以避免「只有Markdown，完全不能檢查依賴方向」的 MAJOR 評價。

工具不證明任意alias/cast/reflection、injected service誠實性、callback純度或惡意plugin隔離。Package已坦白這些限制；可信module模型下，沒有要求完美靜態證明。正式實作必須真的接入production checker與接受證據，不能沿用reference permissive manifest冒充。

### Fresh Implementer result

**Architecture decisions still to invent for Slice 001: NOT NONE — FIR-B01。**

**Blocking external information for Slice 001: NONE。** 沒有任何需要聊天或Legacy source才能回答的S01產品行為；阻塞是正式輸入本身缺少公共UI接合，必須透過修訂Handoff補足，不能請實作者去考古或猜Architect意圖。

以下僅規劃，未實作任何slice。

| Slice | 要建立什麼／observable result | 已足夠的contract | 一般engineering freedom | 尚需發明的architecture／矛盾／外部資料 |
|---|---|---|---|---|
| **S01** Host-free最小編輯 | 最小Canvas/Inspector/actions；create grape.image→Float/Multiply/Compose→Parameter→Edge→GLSL→ACK save→reload；含Undo/Redo、invalid圖、兩Context | Graph/registry/atomic mutation、stable ports、snapshot/provenance、formal DTO、scoped field、routing、save ACK全部已定 | framework、repository/class命名、資料結構、storage adapter、renderer圖形技術、CSS | **FIR-B01公共Panel/widget view接合需先補定**；domain canonical ownership無互斥說法；FIR-N01可依13裁決；不需外部歷史 |
| **S02** 安全開啟／review | 原格式、未來格式、損壞、缺module文件的inspection/recovery；accept一筆replaceDocument；explicit converter分支 | readonly recovery、opaque preservation、exact pins、review base/pins revalidation、同runtime replacement/Undo | parser包裝、檔案UI、fixture组织、converter內部算法 | 不新增owner；UI沿用S01修正。Legacy revision→pin分支的G-VERSION-COMPAT未解，該分支不得宣稱完成；未知mapping不能向聊天求解；安全當前格式分支可獨立做 |
| **S03** local/shared nested authoring | 封裝、nested canvas/breadcrumb、shared definition兩occurrence、接口更動更新callers、clipboard、Undo/save/reload | graph-owned資源、typed refs/remap、root/nested shared reconcile、scopedtarget/terminal lease、library fork規則 | closure traversal/index、內部表示、breadcrumb/render效能策略 | 除沿用FIR-B01修正外無需重做owner/lookup；Personal symbolic-array範圍留S04 Gate，不借題新設子Graph；無需聊天/Legacy source |

S01 acceptance 使用 AT-S01-01..08；須真瀏覽器流程、負向接線、mode→loss→Undo、draft/gesture、多Context、late ACK/SAVE_BUSY與observer重入；GLSL文字成功不冒稱GPU成功。S02使用AT-S02-01..04並按已支持格式/版本分scope；S03使用AT-S03-01..04及真nested Inspector互動。每一slice都要同revision行為與architecture證據才完成。

**Implementation Plan：基本可執行，受 FIR-B01 阻塞。** 08/data/slices.json 的12個slice有 observable result、owner、prerequisiteOutputs、non-goals、Gates、AT IDs、runtime evidence、conformance與completion。S02/S03/S05/S06等支線可在所需S01輸出後平行，不需等整份catalog；第一條核心路徑不依賴Host。這不是只列roadmap。Renderer公共契約不能以S06名義延後到S01已長出私有接法之後。

**Known Gates 判讀。** 46條machine records均有 blocks、doesNotBlock、earliestRequiredPhase、requiredEvidence、disproofAction、architectureImpact。欄位存在本身不代表Gate充分，以下核對其內容：

| Gate／群組 | 本次判讀 |
|---|---|
| TD/GPU/native commit、TOE/TOX、browser/device、deployment | **NON-ISSUE**：需要真環境證據，有I/R時點與受影響分支；不阻Host-free S01的其他工作 |
| G-DOCUMENT-STABILITY-COMMITMENT | **NON-ISSUE**：Human只決定對外承諾起點/範圍，技術schema已定 |
| G-VERSION-COMPAT | **NON-ISSUE**：Legacy conversion oracle未完備，但exact pins與converter邊界已定；在S02相依分支前不得猜latest |
| G-MIXED-HISTORY／LU-UI-008/009 | **NON-ISSUE，必守未解Gate**：各History authority已分域；package的LC-UI-100還提供交錯Undo順序、live預約/no-op保Redo、成功receipt才移stack、retry request identity等行為；缺的是完整production composition與native/load race證據。需S定案/I驗證，不能靠三種獨立History測試關Gate。沒有把「存在Gate」直接升MAJOR |
| G-EXTENSION-WIDGET-SCOPE | **NON-ISSUE**：scoped讀寫與通知已定；剩下實際browser Inspector證據是合理Gate |
| G-EXTENSION-PANEL | **部分分類錯置，對應 FIR-B01**：routing/lifecycle已定，但mount public connection尚缺；這一部分不是只缺runtime evidence，不得延到S06才選production API |
| G-HANDOFF-CQ-OWNERSHIP | **NON-ISSUE**：衝突sourceSummary已標記且compiled owner清楚；quarantine從S01生效，不能移除警語後沿用舊拓撲 |

混合History仍需工程協調與驗證，不把該工程工作交Human。若實作者想改變已保存的使用者Undo語意，才需產品決策。這與FIR-B01不同：後者連普通view的公共接合方式都沒有交付，而且近期真UI必需。

### UI handoff result

**產品結構／行為規格：PASS；production extensible UI foundation：FAIL，FIR-B01。**

完全不讀Legacy UI source，已能知道第一版應呈現什麼以及怎麼操作。`UI_SPEC.md` 覆蓋layout區域、Canvas、Node/port/edge states、Inspector、toolbar、selection、多Context、dynamic interfaces、persistent errors、save/export/reload區分、IME/draft及窄畫面/touch界線；兩張rendered schematic也已直接查看。它們標明S/B/P/R，不被當成像素規格或runtime證據。

| 面向 | 判定 |
|---|---|
| Structural | Graph/Context/Panel/Layout分權，ports與selection身份、Panel跟隨來源明確 |
| Behavioral | replacement接線失敗保舊線、connected readonly、draft不即時改模型、mode同批更新、兩Context序列、error可存不可生成均可做第一版 |
| Visual preference | 明確matrix色值等有來源；其餘palette/font/spacing可替换，不因此推定新增產品行為 |
| Replaceable | renderer/CSS/icon/精確尺寸可工程選；不能替换掉scope、ownership或成功/失敗語意 |
| Responsive/touch | ≤800px overlay不覆desktop偏好；座標轉換共用；Canvas與Host Viewer手勢不混用；第一版可明示desktop-only |
| Remaining evidence | 真IME/focus/pointercancel/accessibility/mobile及native preview仍需各slice驗；不要求S01前全部完成 |

FIR-B01指「第三方普通畫面如何接入共同renderer」；它不表示使用者操作規格或mockup不足，也不要求像素複刻Legacy。

### AI workflow readiness

**PASS，進度與決策不必依聊天記憶。**

08 §Current implementation與schema2 template指定包外唯一`../implementation-state.json`，再由project.root指production checkout。本輪未讀取或建立包外current；不由它推定正在進行的工作。包內template維持not-started。

| 必備資訊 | 具體欄位／限制 |
|---|---|
| Current baseline | implementationBaseline.id/revision/decisionReferenceIds；baseline採用只引accepted decision |
| Active/completed slice | activeSlices、completedSlices含scope/revision/evidenceIds；active與completed不可重疊 |
| Gate status | scoped gateDecisions；未記者繼承frozen baseline；resolved要有直接address该Gate的accepted evidence |
| Acceptance evidence | file/hash、implementationRevision、kind、scope、slice/gate IDs、acceptedBy/At |
| Decision/Architecture Change | decisionReferences含kind/status/reason/file/hash/affected scope；proposed不當成accepted |
| Latest accepted implementation/review | latestAcceptedEvidenceId＋acceptedEvidence的review接受人/時間/實作revision；不是僅latest build |
| Safe maintenance | 單一maintainer，先寫temp並驗證後atomic replace；不回改CQ/封存package |

Checker與negative tests可核對refs/hash、same-revision product-behavior＋architecture-conformance completion；它不驗批准者真偽或證據內容充分性，文件已要求Reviewer補足。這是適當的最小machine-readable state。AI PM／Reviewer／Implementer可共享此包繼續審查、追Gate與準備工作；**不代表FIR-B01尚未解除也可宣稱production handoff accepted**。

### Decisions requiring human owner

**解除本輪 BLOCKER 所需 Human Owner decision：NONE.** Panel mounting/view contribution API、registry shape、TypeScript interface、checker、localization與project-state都是工程責任；本輪不請Human設計。

Package已列出的未來真正產品決策仍保留，不要求S01前一次決定：

| Gate | Human真正需要決定的事 | 最遲時點 |
|---|---|---|
| G-PD-1 | Personal symbolic-array能力的接受範圍，是否保留限制／承諾完整remap／列版本subset | S04相關成功/拒絕政策定案前 |
| G-PD-2 | Named layout presets超限時使用者可見的保留/拒絕/替换承諾，不能靜默丟資料 | S06相關持久化政策前 |
| G-PD-3 | Cross-manager identity adoption是否自動、需明確選擇或不提供fallback | S07相依入口前 |
| G-PD-4A | Native Viewer的正式可見入口／是否保留能力 | S07對應入口定案前 |
| G-PD-4B | Native Parameters遠端開窗的授權與本機同意scope | S07對應遠端動作前 |
| G-DOCUMENT-STABILITY-COMMITMENT | 從哪個release/milestone開始對外承諾文件長期相容，以及期間/範圍 | 首次穩定相容宣告前 |

不自行選擇上述政策；也不把已定canonical Graph ownership再丟回Human確認。API或render接合修正若不改能力、ownership、authority/user-control與資料承諾，即不因此新增Human決策。

### 本輪驗證範圍與可重現性

本次獨立執行並核對結果：

- HANDOFF_FILE_INDEX列出的246個檔案SHA-256校驗，全部相符；完成測試與報告後再次校驗，246個檔案均未變更。
- 在package root以Node測試執行：tools的boundary／production-boundary／implementation-state tests；qualification的public-surface與ledger tests；document-format tests；repair目錄全部test.ts；minimal-node、dynamic-interface-node、minimal-host-adapter、minimal-panel、parameter-widget範例測試。**153 passed，0 failed，0 skipped/cancelled/todo。**
- contracts、qualification、repair以及Panel/Widget/localization範例做`tsc --noEmit --strict --target ES2023 --module NodeNext --moduleResolution NodeNext --allowImportingTsExtensions --skipLibCheck`，採包內Node types；**exit 0**。
- 檢視production checker source與negative cases、全部46條Gate的必要欄位、618筆compiled ownership/persistence一致性；閱讀三個初期slice的完整驗收與依賴。
- 直接查看兩張package rendered UI schematics；未以既有visual QA的PASS代替自己的查看。

初次測試由review工作目錄呼叫時，ledger test因其已註明的package-root工作目錄前提失敗；改到正確package root重跑上述集合後153項通過。這是本review的呼叫位置錯誤，不是Handoff finding。

未執行`tools/run-handoff.mjs`：它會把log/result寫回原包audit/evidence，違反本輪不修改package的要求。亦未執行會寫GPU evidence的reference測試、真browser產品、TD/native/GPU、完整reference runner或既有review自評。不聲稱full-run qualification、production readiness或所有capability等價已驗證。

測試綠燈只支持各自已存在的contract，無法證明不存在的renderer contribution contract已完成。最終FAIL僅由本報告的獨立可追溯finding支持；未修掉finding後再宣稱PASS。
