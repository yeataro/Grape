HANDOFF VERDICT: **FAIL**

### Review provenance

| 欄位 | 本輪紀錄 |
|---|---|
| Reviewer / environment | Codex，獨立 acceptance review；Windows / PowerShell；本機 Node.js v25.5.0 |
| exact model / version | UNKNOWN；介面未提供可核實的精確 model ID／版本 |
| reasoning / effort level | UNKNOWN |
| review date | 2026-10-02，Asia/Taipei（UTC+08:00） |
| 正式輸入 | `C:/Users/user/Documents/Codex/2026-09-09/td/implementation-handoff-r4/` |
| package ID / revision | IH-004；parent IH-003；revision finalizedAt `2026-10-01T21:53:26.843Z` |
| package hash identity | `HANDOFF_FILE_INDEX.json` 的 SHA-256：`c1cbc7521dc95fed9027695220dc8b963f229299575d7fd9bd78e7543f412c53` |
| revision metadata hash | `HANDOFF_REVISION.json` 的 SHA-256：`e2fbe7f80a434b6e5daff795514dbfe72ac97540be4ffce7afe7b13f312cf59d` |
| previous reviews consulted | **NO** |
| external conversation context | **NO** |
| Legacy implementation accessed | **NO** |

Hash identity 指本包內容索引的 hash，並非宣稱存在另一個官方整包 archive hash。獨立核算全部 344 個 indexed files，全部符合記載的 SHA-256；依索引排除規則檢查，沒有額外未索引檔案。`node_modules`、重複 staging runs 與 index 自身依 package 規則排除。封存 review 的存在、路徑及 hash 已納入完整性檢查，未讀其內容。

審查只使用包內現行規範、正式 declarations、machine contract/slice/gate 資料、examples 與 executable specification。未開啟 previous review、reconciliation、repair report、audit 自評、provenance 來源文件或外部 Architecture/Coverage 原件。現行規範內嵌的歷史 finding 編號與修訂自述無法與契約文字完全分開；本輪不採用那些判斷，只獨立檢驗其後的契約。`executable-reference/repair/` 中被現行規範明訂採用的 Panel/scoped/view 契約及可執行程式，是現行技術輸入，與 repair report 分開處理。

本輪沒有修改 IH-004、補寫契約、修正架構或建立產品程式。執行的是既有 qualification tests 與唯讀 codec 反例；本報告中的 slices 只作紙面推演。

**核心結論：** IH-004 已足以唯一重建產品 ownership，普通 Node／Panel／Widget 的擴充責任、renderer mount seam 與 localization ownership 亦成立。但目前仍不能無条件交付「直接依完整正式 schema 完成 S01」：核心持久資料的 adaptation／loss 子結構未封閉，Implementer 必須自行補定相容契約。另有較後期 mixed History 的 application coordination 契約仍留在 Gate。FAIL 的原因是這兩項契約問題，並非未完成產品、未跑 DOM／TD／GPU，或 Gate 數量。

### Blocking issues

#### IHR4-B01 — 核心持久子結構尚未成為唯一的正式 schema

**Severity: BLOCKER。** 影響 S01 的 connection、dynamic mode loss、save/reload；也影響 S02 恢復與 S03 nested loss。

**證據路徑：**

- `contracts/document-format.ts:19`：正式 `EdgeDocument.adaptation` 為任意 `Json`；`:32` 的 `losses/recovery` 為 `Json[]`。
- `contracts/document-format.ts:103`：Edge validation 不檢查 adaptation 的任何 key、shape 或 schema identity；`:136` 只檢查 losses/recovery 是 array。
- `14_DOCUMENT_FORMAT.md:22` 宣告該檔為完整型別；`:66` 將可任意保全的 inert metadata 與具必要執行／引用／值語意的 payload 分開；`:76` 要求未知結構欄位進 read-only recovery；`:91` 要求結構演進有版本。
- `data/production-contract-ledger.json` 的 `nonRenamableDomains` 包含 document field keys；但 `records[sourceSymbol=Adaptation]`（約 `:207`）與 `LossRecord`（約 `:342`）只提供可一致更名的 runtime shape，未指定其正式 serialized mapping。
- `executable-reference/contracts.ts:39` 的 adaptation 為 `{from,to,op}`；`:63` 的 LossRecord 有 `id/reason/nodeId/...`。相對地，正式 codec fixture `contracts/document-format.test.ts:80` 使用 `{operation:'identity'}`，下一行的 loss 是 `{oldInput,value}`。該案例只證明保全語意錯誤資料，不能作為有效正式 record schema。

**Fresh counterexample：** 同一份 1.0 envelope，在 Edge 的 adaptation 內加入 `futureRequiredRule`，在 loss record 內加入同名未知欄位，直接呼叫包內 `readDocument`，結果為 `editable`。把同欄位放到 Edge 本身，結果則為 `recovery-readonly / UNKNOWN_STRUCTURAL_FIELDS`，並列出精確 unknown path。這是本輪實際執行結果，沒有引用先前 log。

這個 probe **不證明** Graph hydration 或 Generator 已經錯誤執行未知語意：codec 自己就說它不做 hydration。它證明的是，正式格式目前沒有決定這些核心欄位內何者屬結構、何者屬可保全 opaque payload，以及 unknown data 應採何種 load outcome。對 module-owned `state/data/kindSettings`，包內已提供 exact owner/codec；adaptation／loss 沒有對等的 codec identity 或明確 wire mapping。

兩條合理但不相容的實作路徑因而存在：①沿用 reference 的 `{from,to,op}` 與 LossRecord 形狀，將未知子欄位視為未知結構；②依正式 DTO 的 arbitrary JSON 保全這些子物件，把其 shape 留到模型層自行解讀。兩者可以都維持 Graph ownership，卻會寫出／接受不同意義的同版本文件。泛型 `Json` 本身不是問題；**缺少指定的解釋者及版本／未知欄位政策**才是問題。

**為何阻 S01：** AT-S01-03 要保存 mode change 的 loss，AT-S01-05 要重載 ports/edges/metadata，14 §5 要往返 loss 並重新生成。不能以「S01 暫不存線或錯誤圖」避開，也不能把核心持久 key 當一般 TypeScript 命名自由。公開長期相容承諾可以延後，但當下 `grape.document 1.0` 的技術解釋仍須唯一。

**最小修正方向（本輪未修）：** 明定 adaptation、loss 及 recovery 記錄的正式持久形狀／判別方式，或指定具版本的 payload owner/codec；列明 runtime-to-document mapping 與 unknown-field outcome。補一個有效接線、一次動態失線，以及未知子欄位的 save/reload 反例。無須改 Graph ownership，也無須 Human 選欄位名稱。

### Major issues

#### IHR4-M01 — Mixed History Gate 仍包含未定的 application coordination 契約

**Severity: MAJOR。** 不阻 Graph-only S01；影響 S08/S09 的混合 Undo／Redo、Reload Applied 與不確定遠端結果。

**證據：** `10_KNOWN_GATES.md:719`–`:731`、`data/gates.json[id=G-MIXED-HISTORY]` 明列「如何排序、dispatch、重試去重……如何確認 stack 推進，尚未完成 composition」，且最早時點包括 **S: order/dispatch/retry contract**。`05_DATA_AND_LIFECYCLE.md:83` 只固定三域各自 authority。`data/slices.json[S09].architectureConformanceChecks` 有「coordination 只持順序/receipt」，但 `AT-S09-03` 的前提仍是「依已定次序」，未提供那個次序及完整操作協定。

**獨立推演：** Graph edit G1 → live receipt L1 → native-definition receipt N1；使用者 Undo N1，結果 timeout；接著 load 新 Graph，再收到 N1 成功回覆。包內能決定「不把舊回覆寫到新 Graph」「不回捲外部動畫」「確認前不推 stack」，但不足以唯一決定 pending chronology entry 的持有者／生命期、跨域命令的序列化邊界、重試與重新查證入口，以及 load 對舊 chronology 的處置。這些影響 application/host/history 接合，並非只差真 TD receipt 的環境證據。

Gate 已誠實揭露缺口，不是刻意隱瞞；仍不符合本輪「重要 Gates 應只剩外部證據／產品決策」的門檻。若下一位 Implementer 在 S08/S09 自行補此 contract，容易累積 UI action 特例、不同 history 私有狀態穿透或第二份 stack authority。

**最小修正方向（未修）：** 在既定分域責任下，補 application coordination 的公共命令／結果、pending/retry/recovery/load 生命期及序列 oracle；把 contract 定案與 native runtime qualification 分成可辨識的 Gate scope。不需要合併三種 canonical state，也不應叫 Human 設計 coordinator API。

### Minor issues

#### IHR4-N01 — Current-state 指引仍要求 IH-003，與正式範本及 checker 不一致

**Severity: MINOR。** `08_IMPLEMENTATION_PLAN.md:11` 稱初始範本為 IH-003，`:15` 明列 `handoffRevision` 為 IH-003；但 `implementation-state.json:4` 是 IH-004，`tools/check-implementation-state.mjs:19` 只接受 IH-004，README／START_HERE 也指 IH-004。

照文字表格建立 mutable state 會被 checker 拒絕。Revision identity、範本與 checker 提供一致解答，故不構成第二套 architecture 或 acceptance blocker。最小方向是同步兩處操作指引；本輪未修改。單純歷史章節標題留 IH-003 不另列 finding。

### Product-positioning drift

**判定：NONE（現行 canonical 契約）。** 未找到兩種同樣具規範效力、互斥的產品 owner 理解。

`01_PRODUCT_MODEL.md:5`–`:25`、`02_ARCHITECTURE_SPEC.md:24`–`:26`、`03_RESPONSIBILITY_AND_DEPENDENCY.md:7`–`:23`、`06_HOST_INTEGRATION.md:5`–`:9`、`07_DEPLOYMENT_MODEL.md:3` 共同維持：Graph/document/Parameter/Graph History 屬 Grape，Host 是 external execution/integration target，部署只換 composition/providers。

`11_LEGACY_COMPATIBILITY.md:13`–`:21` 明確把 Legacy 的 Host-hosted UI、Apply 後保存與 current-emitter fallback 轉成 observable intent、顯式 import 或 adapter 行為，沒有把 Legacy ownership 搬回新產品。包內指出 `sourceSummary` 含衝突來源措辭，但現行規範已撤除其實作指令效力；本輪未以原來源或該衝突報告作判斷，因此不把封存文字當成現行漂移。

#### Fresh product reconstruction

| 問題 | 僅從 IH-004 得出的答案 |
|---|---|
| 1. 產品是什麼？ | Grape 是可離線編輯 Shader 作品的節點圖產品：建立節點／來源、接線、調參、查看 GLSL、保存，再選擇交付外部執行目標。 |
| 2. 為什麼重構？ | 保留可觀察能力，讓責任可維護、擴充可局部完成，並共用 Static Web／Node-hosted／Electron 的 application core；不是重造 Legacy hosting topology。 |
| 3. Canonical Graph/document 在哪？ | Application documents 持有已開 Graph；Graph 是執行中唯一可寫模型，GraphDocument 是其可序列化快照。無須額外多圖 Project。 |
| 4. Node／Parameter／History／Persistence 誰擁有？ | Graph→Stage/Network→Node/Edge；Registry/DefinitionSet 持精確能力定義。Parameter 是同模型的讀寫入口，不存第二份值。Graph 擁有模型 History；Persistence/application 捕捉保存內容、處理 intake/ACK，adapter 寫媒介。 |
| 5. UI／EditorContext／Panel？ | UI 投影及發命令；Context 持 selection/primary/Stage/occurrence/可選 Binding 引用；Panel 持 private viewState、呈現與 draft。Layout 持 Pane/Tab/尺寸；Manager 持 routing/policy，不复制 selection。 |
| 6. Generator 能與不能？ | 讀 immutable snapshot、固定 definitions/profile，做 typed GLSL lowering、artifact、schema、diagnostic/provenance；不能修圖、讀 active Canvas、保存文件或 dispatch Host。全圖 Error 先阻生成，才做 pruning。 |
| 7. Host 角色？ | 接收與執行 artifacts/bindings/resources、live writes、明確原生操作，回報能力、身份、receipt/readback。 |
| 8. Host 可持 runtime state？ | Active/last-good artifact、GPU/native resources、actual inputs/driver、原生控制定義、native revision/authority、queue/receipts；可另存已交付文件快照。 |
| 9. Host 不可成為哪些 canonical owner？ | Grape working Graph、NodeType/DefinitionSet、Parameter model/defaults、Graph History、EditorContext。Readback 只能更新 mirror；變成作品值需顯式模型命令。 |
| 10. 三部署的關係？ | 同 application 和契約，不同 bootstrap/storage/host/UI platform providers；Node server 不自動是使用者 Host，Electron main 不自動成為 Graph owner。 |
| 11. 固定核心責任／invariant？ | 唯一 Graph writer、同步私有 Draft／poison batch／原子發布、stable IDs/port keys、exact pins、Context 先投影再外部通知、Operation/History 分工、錯誤圖可存、snapshot generation、load/epoch fences、各 owner cleanup。 |
| 12. 正式 seams？ | NodeModule/DefinitionRegistry、GraphKind/StageKind registry、Graph resource codec/reference descriptors、Parameter presentation/scoped target、PanelWorkspace/Panel view、Widget projection/view、GLSLProfile、typed CapabilityDirectory/Host providers、Storage/DocumentInputOutput、Localization、deployment bootstrap。 |

### Production-contract assessment

**判定：PARTIAL；一般 API 分類清楚，正式持久子結構有 IHR4-B01。**

| 類別 | 本包能辨認的 surface | 實作者應採取的方式 |
|---|---|---|
| A. Exact identity | `grape.document`、1.0 envelope keys、persistent IDs、exact module/type/kind/profile refs、port/parameter keys、GraphKind/StageKind IDs、capability ID/version、catalog owner/key | 保持 wire／identity 對應；更動需要明示版本／轉換。不要把 fixture fingerprint 當 release pin。 |
| B. Normative shape / renameable | Node callbacks、Graph mutation/lifecycle、Parameter/Panel/scoped commands、mount responsibilities、GLSLProfile、typed services、localization methods | 可一致命名 public SDK、改 class/file/內部演算法；不得改輸入資訊、owner、authority、失敗或時序。 |
| C. Executable reference / behavioral oracle | Core/compute/workspace/host 的機制案例、negative tests、現行 repair 目錄的公共契約實驗、examples | 移植 assertions 到 production public SDK；不是 production import 或成功宣稱。 |
| D. Qualification-only | `td.top/td.mat` fixture union、closed ServiceName/PanelKind、fixed-array 4096／struct 128／cache 8、fake provider/surface、qualification class arrangement、實驗格式 | 不繼承成產品上限或架構。可配置 intake budget 不等於格式容量承諾。 |

逐項核對結果：NodeModule/Registry 的 register→pin→initialize/schema/validate/emit 有定義；GraphKind/StageKind 替代 closed union；Parameter presentation 是 widget ID/options/fallback；Panel 是 composition＋required view provider；Widget 是 immutable scoped projection＋受限 commands；GLSLProfile 是 GLSL shell/capability seam；Host capability 有 exact identity/scope/operation contract；examples 均有 qualification firewall。下一位不需要在「照抄 prototype class」與「重發明 ownership」之間二選一。

IHR4-B01 是 A/B 邊界尚未閉合的具體例外，不能被 ledger 全欄位有 disposition 的機器檢查掩蓋。

#### Canonical document

| 驗收項 | 結果 |
|---|---|
| format identity / version | 已固定 `grape.document`、`{major:1,minor:0}`；一 envelope 一 Graph。 |
| GraphKind identity | Exact `{moduleId,kindId,version,fingerprint}`；內建 `grape.image/grape.material`，owner `grape.graph-kinds`；Stage slot key／instance ID／kind ID 分開。 |
| forward compatibility | 未支援 major/minor 保原文 read-only，非猜測式可編輯；major/minor 語意已定。 |
| unknown-field handling | Envelope/Node/Edge/Stage/ref 等已列結構有 fence；module payload 與 inert extensions 可保全。adaptation/loss 的結構邊界未定，見 B01。 |
| incompatible / malformed input | Unsupported version recovery；invalid JSON、duplicate keys、ambiguous identity/nonfinite 拒絕且保留原始資料；不發布半張 Graph。 |
| Legacy import | 外來格式，S02 顯式 converter→review→accept；不能只換 format/kind 字串或 fallback 最新 module。 |
| Host naming | Host 不在 canonical format/GraphKind identity；TD/native naming 留 profile/target/import。 |
| save / reload | Graph snapshot→ACK-backed storage；晚 ACK 不清新 dirty；load 保 persistent IDs、換 loadId、清 runtime History；download 不等於 save ACK。 |
| Human compatibility milestone | 可以由 G-DOCUMENT-STABILITY-COMMITMENT 延後決定；不豁免當下技術 schema。 |

#### Prototype → production firewall

**PASS（規範及交付規則）。** `13_PRODUCTION_CONTRACT_SURFACE.md:7`–`:23`、`:120`–`:130`，`08_IMPLEMENTATION_PLAN.md:574`–`:582` 及各 example README 均要求新 production root；允許移植契約、semantics、invariants、behavior/negative assertions，以及明確允許的 declaration/schema。禁止直接搬 qualification implementation、class structure、closed probe unions、fixture limits 和實驗文件格式。

Conformance 還需審查 actual production source roots、manifest 與 diff；包內 checker 不是 clone-detection 工具。這個限制已有誠實揭露，並不等於只能靠一句「禁止照抄」。

### Extension-model assessment

下列為 fresh 紙面 simulation，不是宣稱新增模組已實作。**PASS 只評 seam；需經真 runtime Gate 的項目仍保留證據門檻。** A/B/F 的 PARTIAL 來自共享文件 B01，不是必須修改 unrelated core。

| Simulation / 判定 | Public entry、最少概念與改動範圍 | State owner、lifecycle | Validation／failure／persistence；第二個同類 |
|---|---|---|---|
| A. `example.bias` 普通 Node — **PARTIAL** | PresentedNodeModule/Type→DefinitionRegistry register/pin；理解 exact ref、codec、ports/Parameter、eligibility、typed emit、TextRef。只改本模組＋registration。 | 定義屬 module/registry；實例值屬 Graph；initialize 一次，修改進 Operation，snapshot emit。 | Codec/port/type/capability 驗證；missing module 保資料阻生成；一次 Undo、save/reload。第二個 gain Node 同路。不需 switch/private access；持久 Edge/loss 受 B01。 |
| B. 二／四分量 Pack dynamic Node — **PARTIAL** | 同 NodeModule；mode codec→ports/parameters；MenuPresentationOptions/TextRef；理解 stable key、reconcile、loss、nested caller。 | Mode/local values/ports/edges/loss 同 Graph；UI 不造 socket；一次 candidate 原子發布。 | Illegal schema 全批拒絕；合法 mode 可失線而 invalid；Undo 精確還原，detach 不自動重接。第二個 dynamic splitter 同路；不改 core。Loss 正式保存受 B01。 |
| C. Diagnostics Panel — **PASS** | PresentedPanelType→PanelWorkspace.register/open→PanelViewProvider；理解 route/TargetLease、read-only query、viewState、mount。Feature＋wiring。 | Panel 保存 filter/expanded viewState；diagnostics producer 仍是原 owner；restore/receive 後 createView，move/hide 保留 instance。 | Missing target 空態，callback failure placeholder；close preflight/cleanup；Layout 保存 viewState。第二個 Help Panel 同 registry，不讀其他 Panel private state。 |
| D. Percent Widget／choice strip — **PASS** | ScopedParameterTarget.openRouted→ScopedParameterWidgets.register/projectTarget→ParameterWidgetViewType；理解 actual widget ID/fallback、snapshot/token、draft/event。Feature projection＋view＋locale＋wiring。 | 值屬 Graph；draft 屬 field/contribution；target lease 借用，Inspector 負責結束；mount 只是呈現。 | accepts/type/options、IME/busy/connected/stale commit 重驗；失敗保 draft，無錯誤 History entry；只模型值保存。第二個 choice strip 同路；無 renderer switch/nested traversal。 |
| E. 新 GLSL ES shell profile — **PASS** | Immutable GLSLProfile/ref 注入 compilation service；理解 TypeEnvironment、GraphKind/topology、capabilities、StageProgram、artifact/provenance。改 profile＋wiring。 | Job 擁有中間資料；Graph 不變；admission→lowering→render→整組結果。 | 不支援 type/stage/capability 就失敗，不發半份 artifact；新 exact ref 使 cache identity 更新；artifact 可重建。第二 profile 同路。不保證 WGSL/JS。 |
| F. 雙 pixel-slot image kind — **PARTIAL** | GraphKindRegistry.register（重用已知 StageKind）；若新增 StageKind 先 registerStageKind；slots/settingsCodec/boundary refs＋支援 profile。理解 topology、boundary outputs、exact refs。 | Registry 持定義；Graph 持 stages/networks/kindSettings；完整建圖才發布。 | Unique slots/exact pins/required boundaries/capability admission；unknown kind 既有文件保全診斷；新建未知 ID 拒絕。第二個 kind 同路，不改 central union。涉及新 shader 語意時需相應 profile/環境證據；共同 persistence 仍受 B01。 |
| G. 第二個同類 Host publication adapter — **PASS** | CapabilityDirectory.provide 已有 typed capability；prepare/commit/readback executor；理解 Target incarnation、lease/epoch/intent/CAS、receipts。改 adapter/bootstrap。 | Host 持實際值/active resources；Binding 持流程/mirror；attach→prepare→fenced commit→receipt→withdraw/dispose。 | Prepare failure retained；commit 不明 indeterminate 停寫；重試同 request/payload，current values 在 commit 合併。文件仍由 Grape 保存。第二 adapter 同路；原生 feasibility 另驗。 |
| H. 新 `example.host.metrics` capability — **PASS** | CapabilityDefinition<Service> 明列 namespaced ID/version、scope、query/subscription 契約→register/provide/require。Feature 定義 service contract＋provider＋wiring。 | Target/provider 擁 runtime metrics；application 消費 observation；subscribe/unsubscribe 依 session lifetime。 | Validate payload、exact scope/contract；缺 provider typed unavailable；withdraw 不當作遠端取消；舊 handle 需 lifetime fence。Metrics 不入 Graph。第二新 capability 同路，不改 ServiceName union；若變成有副作用能力，必須定義其 authority/receipt/retry，不是任意 JSON dispatch。 |

所有 simulation 都無需跨模組 private mutation、修改無關 Graph/History 或在共同 renderer 按具體 type/class 加分支。低頻新增 GraphKind/StageKind、GLSL profile、新 capability 需多寫自己的語意契約，這是 seam 的使用成本；不等於重設整體 architecture。若後續要求多語言 backend、sandbox 或全新 shader 執行模型，超出目前已承諾 seam。

### UI view-contribution assessment

**PASS。沒有因 renderer technology 未選而列 finding。**

可唯一決定的公共鏈為：

`registration → logical contribution create/restore/initial target → createView/create(binding) → subscribe → shell surface → mount → capture → initial update → invalidation/capture/update → hide/move unmount → same contribution remount → accepted close/detach → unmount cleanup → contribution dispose`。

`16_VIEW_MOUNT_CONTRACT.md:28`–`:40`、`:46`–`:60` 和 `contracts/view-mount.ts` 已給正式責任；Panel 不需與 Widget 共用萬能 interface。`MountSurface.protocol/target` 讓 bootstrap 選 renderer 技術，feature 提供相容 mount；shell 無須知道 feature projection schema。

| 獨立 simulation | 從建立到結束的觀察 |
|---|---|
| Panel 1：Diagnostics list | route 到明確 Graph/context，receive 取得目前診斷投影；view capture 回 list/filter。共同 shell 初次 update，即使 feature 沒發初次事件仍 render。診斷 producer 更新或 filter 改變只 invalidates；renderer 不查 Graph internals。 |
| Panel 2：可展開 Help | private expanded/topic 屬 Panel；createView 封裝 view actions。按 expand 只改 viewState；move/hide 保留；layout save 用 exportViewState；恢復依 exact state version。沒有由 shell 讀 class 私有欄位。 |
| Widget 1：百分比數字輸入 | underlying scalar 不改型別；文字 draft 可顯示百分比，明示轉換後 commit。mount resources 即時 own；draft 位於 contribution/field controller，remount 後保留。舊 token 或 IME 未結束拒絕，不能靜默以新 baseline 重試。 |
| Widget 2：布林 switch | 同一 binding capture 取得 boolean/writable/token；event guard 內 commit。連線／scope 失效後舊事件不能改值；非 number/text view 仍走同一 registry/mount，不需要 shell switch。 |

**Mount target：** shell/Layout/platform 擁有 anchor，feature 只借用。新 anchor 配置須先納入 shell lifetime，provider 取得失敗自行 cleanup；所有 child unmount 後才能釋放 anchor（16 §5）。

**Renderer resources：** feature 取得 listener/root/timer 立即 `scope.own`；共同 scope 逆序、逐項隔離 cleanup。`MountedView.unmount` 僅是成功 return 後可登記的 finalizer，不能承擔 partial-mount 唯一清理。Factory 尚未交出 contribution 即失敗時，自己的短期配置由 factory 清理。

**Services / authority：** Panel 用既有 PanelServices、TargetLease、公開 query/commands；Widget 只得 WidgetReadBinding、ViewFrame 與 event-guarded WidgetCommands。沒有 raw Graph／任意 platform service bag。`writable` 只是提示，實際 commit 仍走 scoped target→Parameter→Graph/History。

**Stale async：** mount generation＋projection revision 的 MountTicket 阻止 locale/update/move/hide/unmount/dispose 後晚回覆；logical target 另驗 TargetLease／load/occurrence/edit token。兩層不互代，取消外部工作也不替代 fence。

**Failure／placeholder／retry：** create/restore/receive 由 Workspace 管；view factory/subscribe/mount/capture/update 由 presentation session 管。Mount failure 不重建 Panel/Graph；有效 contribution 以新 scope retry。缺 Widget factory 回可查 status/issues 的 slot；actual widget ID 改變需 Inspector 結束舊 binding 再走同路。Cleanup exception 繼續其餘清理。Hidden retry 不擅自顯示。

**Close／routing／localization：** close guard 通過才觸發 beforePanelDispose；拒絕 close 保留 mount。Move/hide 不 dispose logical Panel/Context。Locale invalidation 重投影，hidden remount 取最新 locale；Graph/default/History 不變。

本輪另讀兩個包內 Panel 與 number/toggle Widget 的實際 contribution、generic driver，並重跑 view tests。其 headless protocol 不構成 production toolkit 要求；也不構成真 DOM、focus、IME、accessibility 成功證據。

### Localization assessment

**PASS。新增 EN／JA／zh-Hant 普通 Node 或 Panel，可只改自身 module/package 與一般 registration wiring。**

依 `15_LOCALIZATION_CONTRACT.md`、`contracts/localization.ts`：translation ownership 隨 feature；`TextOwnerRef.namespace=moduleId`，完整 exact owner tuple 隔離不同版本；Node/Panel presentation 指向同一 TextRef 來源，built-in 與 extension 同機制。Shell 只持 common vocabulary；明示共用 TextRef 可以跨 owner 引用，不能猜同名 key。

Fresh 流程：module manifest/presentation→feature default catalog→`registerModule`→在同 package 加 JA／zh-Hant locale contribution→`addLocale`。不改中央 Node/Panel 文案表、Graph 或 Generator。Node ports/parameters 用 stable keys；menu choices 的 label 是 TextRef，value 不翻譯。

Fallback 唯一：requested base locale→逐層 parent→exact module default→inline fallback；缺字典/key 有 notices；非法或重複 entry 原子拒絕；replaceLocale 有 revision CAS。Locale 在 application preference，user-authored names/notes/code/path 保原文，不因字串相等被翻譯。語言切換只改 view projection/search index。

未把翻譯 corpus、CJK 長字排版、plural/ICU 或真瀏覽器 IME 未完成列為交接 failure。Qualification raw messages／literal labels 受正式 overlay 與 mapping 排除，不能移植為 feature 專屬硬編碼 catalog。

### Anti-spaghetti / conformance assessment

**PARTIAL。主要固定核心有可重複驗證的防線；B01/M01 是仍須收斂的具体路徑。**

| 風險 | 現有可驗防線與實際限制 |
|---|---|
| Second canonical state | 兩 Context 同圖、Parameter 無私有 value、Host readback 不寫 default、snapshot/ACK/reload assertions；仍需 production 行為驗證，單靠 type 不能證明。 |
| Circular ownership | 03 owner matrix、production dependencies matrix、life-cycle destroy/unload guards；同角色或 closure 的語意循環仍需 ownership review，沒有假稱完整靜態證明。 |
| Cross-module private mutation | Production manifest 逐 owner/export rights，private/type-only/re-export 越界 fail；受限 injected services＋readonly callback 行為測試。Manifest 分類需 review。 |
| UI／Generator／Persistence 越權 | UI 只能 public query/command；raw mutation rights 限 model；Generator/Persistence/Node 不能 import mutable model。生成與保存的獨立反例另驗。 |
| Module 穿 core private／Panel 私有穿透 | Private import gate、same public extension path、target/scoped service、renderer 不讀 feature internals；動態 alias/cast/reflection 不是靜態保證。 |
| Host/deployment logic 穿 core | AST import/global 檢查、role matrix、capability unavailable、三 profile 同 core；真權限/locality 仍需 runtime Gate。 |
| Ordinary extension 改 unrelated core | `changeSet.extensionOwner/changedFiles` 只許 feature＋registrationFiles；第二個 extension 必須同路。更動 checker/manifest 本身需 review。 |
| Central special-case 累積 | Open registry、declared boundary outputs、public view factory、capability IDs；changedFiles gate 能擋普通 extension 改 core，但不能識別所有語意 switch。 |
| Compatibility workaround 進 model | Explicit converter/review/exact pins；Legacy ownership 與 sourceSummary 無規範優先權。Core wire schema 未封閉的 B01 會增加各子系統自訂解釋風險。 |
| Prototype 成 production foundation | 新 checkout、copy/import ban、declaration whitelist、移植 behavior/negative tests、actual-root manifest；仍需看實際 diff，不能把 qualification PASS 當產品 conformance。 |
| 混合跨域 Undo | 三域 authority、CAS/receipt/lifetime 已分清；shared chronology contract 未閉合（M01），可能迫使 UI/Host action 添加局部補丁。 |

主要 dependency boundary 並非完全靠人記得。`tools/check-production-boundaries.mjs:9`–`:17`、`:48`–`:83` 的機器規則，加上反例／行為 oracle，足以建立可持續 conformance 起點。Owner-local observer guard 的限制在 02/03 已說明，不能把可信 extension 契約當惡意 plugin sandbox；不另列假安全 blocker。

#### Implementation plan assessment

**PASS（vertical-slice 結構）；能否照包完整執行 S01 仍受 B01。**

檢查 `data/slices.json` 的全部 12 slices：各有 observable result、owners、prerequisite outputs、non-goals、Gates、Given/When/Then tests、runtime evidence、conformance checks 和 completion definition。S01 合法為空 prerequisites/product decisions；不是漏欄位。S04/05/06 等較大 slice 可再拆同族 batch，仍保留從 UI 到模型／生成／保存或 Host 結果的縱向交付。

| Slice | 可觀察結果與 scope 判讀 |
|---|---|
| S01 | Host-free document→Graph→Node→Parameter→connection→generation→ACK save→reload，另測 export/reopen。 |
| S02 | 安全 inspect/review/accept、foreign/unknown/missing-module recovery；Legacy revision 轉換另依 Gate。 |
| S03 | Local/shared/nested subgraph edit、caller reconcile、clipboard、Undo。 |
| S04 | Library/Personal 自包含 exchange；symbolic array policy 不阻 literal 分支。 |
| S05 | 按 shader capability family 逐 leaf/mode 交付；文字、compiler、GPU 證據分開。 |
| S06 | 多 Panel/Context、layout/action/field/locale 互動；沿 S01 同一 view seam。 |
| S07 | 明確 Host/Target discovery、authority、connect/reconnect；未決 adoption/window 分支可隔離。 |
| S08 | Fenced publication、last-good、readback/Reload Applied；真 native failure evidence 不省略。 |
| S09 | Live/native controls 與 Undo；混合部分有 M01，不能用「依已定次序」替代待定 contract。 |
| S10 | Preview acquire/control/stop、pointer/late frame 清理，無新 Graph owner。 |
| S11 | 四個模板及 cold reload／manager removal 後獨立產物，需相應真包證據。 |
| S12 | 宣告部署 profile 的實際啟動／權限／降級；不以 Node tests 代替 Electron package。 |

#### Known Gates assessment

46 筆 Gate 都有 `blocks`、`doesNotBlock`、`earliestRequiredPhase`、`requiredEvidence`、`disproofAction` 及 `sliceIds`；這是欄位完整性，不等於內容都屬純證據 Gate。

| Gate 類別 | 獨立判斷 |
|---|---|
| TD/native/GPU/browser/device/deployment、TOE/TOX inventory 範圍 | 合理外部證據／已知交付限制。取得證據可能推翻可行性，但不能預先判 architecture 已錯。 |
| Formula、typed UI、capacity／PNG／golden 細節 | 多數是指定 capability 的 algorithm/compatibility qualification。已知 owner 不需重定；相關成功／拒絕意圖若需實質改變才升產品決策。 |
| Personal symbolic arrays、preset retention、cross-ID adoption、兩種 native-window scope | 真產品／資料／authority 決策，有對應 earliest phase；不是 TypeScript/API 命名問題。 |
| G-DOCUMENT-STABILITY-COMMITMENT | 合理 Human Gate；只管對外支援承諾。不能作 B01 技術 schema 的延期理由。 |
| G-VERSION-COMPAT | 合理 converter/observable compatibility 前置；exact pin owner 已固定。未取得逐版本 oracle 時，只隔離 Legacy conversion 分支，不重開 Registry ownership。 |
| G-EXTENSION-PANEL／WIDGET-SCOPE／UI-CONFORMANCE | 現行 view/scoped contract 已可檢驗，剩下 production/browser integration 不自動 FAIL。S01 mount prerequisite 在 08/16 已明定。 |
| G-HANDOFF-CQ-OWNERSHIP | Source wording quarantine；現行 precedence 可用。來源尚未修訂不阻遵從現行契約。 |
| G-MIXED-HISTORY | **MAJOR / IHR4-M01**：混合了未定 coordination contract 與外部 runtime evidence。不可將整項描述成只待 TD 實測。 |

### Fresh Implementer result

只看 IH-004，不寫產品 code，前三個實際 vertical slices 的執行設計如下。這是指出已能實作什麼與在哪個點必須停，不代替 Architect 補決策。

#### 第一個：S01 — Host-free 最小 Canvas／Inspector／保存重開

- **建立什麼：** 新 TypeScript production checkout；registry/pinned definitions；`grape.image` stages/boundaries；Float/Multiply/Compose；Canvas/Inspector/Code/action UI；Graph Operation/History；ACK storage、JSON export 與 Open。以真正 browser 走 AT-S01-01–08。
- **已足夠 contract：** Canonical owners、同步 transaction/reconcile/notification、Parameter/draft/scoped lease、PanelWorkspace/routing/view mount、GLSL profile/admission、save ACK/load lifetime、locale ownership、production boundary manifest。
- **Engineering freedom：** renderer 技術／protocol concrete target、檔案/class/SDK 一致命名、bundler、鎖定工具鏈、儲存 adapter 內部實作、immutable data/History 演算法及非規範視覺樣式。不得把 framework 選擇交回 Human 當 architecture Gate。
- **Architecture decisions still to invent for S01: NOT NONE。** IHR4-B01：核心 adaptation/loss 的正式持久 shape、runtime→wire mapping、unknown subfield 的解釋／版本邊界。這是目前唯一識別出的 S01 acceptance blocker。
- **Canonical contradictions：** Graph/UI/Host ownership 無互斥理解；document 子結構的 broad JSON 與 unknown-structure fence 無唯一接合。Runtime Adaptation/LossRecord 的可改名 shape 不等於已定正式 wire format。
- **Blocking external information for S01: NONE。** 不需聊天、Legacy source、TD、GPU 或 Human 選 UI library。B01 是交接內部缺口。Browser evidence 是此 slice 實作後必須產生的驗收證據，不是開始前外部資訊。
- **完成／停止線：** 必須能保存動態失線／invalid graph，重載 persistent IDs/values/ports/edges/loss，並重新生成；不能以尚未選定子結構的臨時 1.0 文件宣稱完成。B01 解決前不啟動正式完整 S01 acceptance。

#### 第二個：S02 的 production-format recovery 分支

- **建立什麼：** 從 S01 Open 延伸 inspection/review UI；正常 1.0、unknown structural fields、unsupported version、malformed/duplicate keys、missing exact module 的輸入分類；raw recovery export、cancel、base-bound accept；包含 stale review reject 與 Undo。
- **已足夠 contract：** 14 的四種 read outcome、raw preservation、exact pins、不初始化重造 serialized state、import candidate／一筆 replaceDocument、load 與 import 不同 lifetime。
- **Engineering freedom：** UI 排版、parser/storage library、測試 fixture 組織、錯誤細節的呈現。沿現有 owner 編寫 codec 是實作工作。
- **尚需自行發明的 architecture：** 承接 B01 的 wire/unknown boundary；沒有必要另造 document owner/import transaction。
- **Canonical contradictions：** 同 B01；除此之外 foreign 與 native 格式的分界明確。
- **需要外部資訊：** 此 production-format 分支 NONE；若同次宣稱 Legacy known UUID/unknown revision、PNG 或 old golden 相容，必須取得相關 Gate 的 conversion/runtime evidence，不能讀 Legacy spaghetti 作架構依賴，也不能把未支援分支稱完成。
- **完成定義：** AT-S02-01–04 中適用 scope 有明列 input→outcome；原文不丟失、cancel 不 mutation、stale accept 拒絕、missing module 可再存。整個 S02 不因本分支通過而自動完成。

#### 第三個：S03 的 local reusable subgraph 分支

- **建立什麼：** 封裝普通計算節點為 graph-owned definition、兩個 call occurrences、nested Canvas/breadcrumb、同一路 scoped Inspector；改接口使兩 callers/edges/loss/diagnostics 原子更新；Make Independent／local copy-paste 與 Undo/reload。
- **已足夠 contract：** Graph-owned resource/Network、exact refs、typed reference collect/remap、child-first caller closure、root/nested reconciliation、scope/definition-chain invalidation、shared value 與不同 view lease 的區別。
- **Engineering freedom：** Traversal/data structure、UI breadcrumb、feature-owned codec 實作、符合既定 reference-completeness 的 closure/remap 演算法。Extension 自己宣告 payload schema 不是新 canonical owner。
- **尚需自行發明的 architecture：** 不需新 nested Graph/History、per-occurrence value owner 或 renderer traversal；仍依賴 B01 對 loss 的明確持久表示。
- **Canonical contradictions：** 無新的 ownership 衝突。
- **需要外部資訊：** Local scope NONE；Personal symbolic array exchange 留 S04/PD-1，不從此分支推定完整交換相容。
- **完成定義：** AT-S03-01–04 適用 local/shared/nested cases、真 browser nested interaction、兩 occurrences draft conflict、caller 同批更新與 save/reload；未交付 Personal/runtime 範圍保持 Gate。

### UI handoff result

**PASS（可開始工程實作的 UI 責任／互動規格）；不是 UI runtime acceptance。**

`ui-reference/UI_SPEC.md` 能區分 Structural／Behavioral／Visual preference／Replaceable；首 slice 的 Canvas、Inspector、Code、save/export 狀態、接線拒絕、dynamic interface、兩 Context、draft/IME/readonly/cancel 都有明確可觀察結果。`SCREEN_INDEX.md` 明列 schematic 與截圖的證據角色，未將靜態畫面當交互成功。

本輪不要求 pixel-perfect design、完成 DOM 或選定 React/Vue。尚未實測 tablet/mobile、screen reader、pointer capture/focus/IME，依 scope 保留 runtime Gate。無需另造 view factory 或 mount ownership，故沒有 UI architecture finding。整體 S01 仍受文件 B01，不能把 UI seam PASS 解讀成整包 PASS。

### AI workflow readiness

**PASS WITH NON-BLOCKING ISSUE：IHR4-N01。**

Frozen Handoff 與 mutable state 的位置清楚分離：包內 `implementation-state.json` 是 not-started template；唯一 current locator 是包外上一層同名檔，再由 `project.root` 找 production checkout。本輪沒有讀取包外 current state，也沒有把任何其他 chat/project 進度帶進 review。

Schema 2 可恢復 implementation baseline/revision、active/completed slices、scoped Gate decisions、accepted evidence/hash/revision、Decision/Architecture Change references、latest accepted evidence。Completion 要求同 revision 的 product-behavior 與 architecture-conformance evidence；review acceptance 的人／時間由 evidence 記錄承接。不是從封存 CQ/audit 推論已實作。

更新採單一維護者、先驗臨時檔再原子替換；checker 驗引用、hash、scope，明說不能驗批准者真偽或內容充分性。這已足夠讓 AI PM/Reviewer/Implementer 換 context 後接手，不需要大型 PM 系統。N01 的 IH-003 表格文字應同步，但機器真值指向 IH-004 明確。

### Decisions requiring Human Owner

**為修 IHR4-B01／M01 所需 Human architecture/API 決策：NONE。** 它們是技術交接契約責任，不應把 field spelling、TypeScript interface、coordinator API、renderer protocol、registry/checker 或 localization implementation 交回 Human。

本包真正保留的 Human 決策有以下六個 scope；沒有一項是目前 S01 的外部資訊 blocker：

| 決策 | 最早需要時點／原因 |
|---|---|
| Personal symbolic-array 接受範圍（G-PD-1） | S04 相關成功／拒絕政策寫死前；涉及產品交換能力及相容範圍。 |
| Named presets 超限 retention（G-PD-2） | S06 存正式使用者資料前；涉及保存成功意義與資料保留。 |
| Cross-manager ID adoption（G-PD-3） | S07 fallback 定案前；涉及身份選擇與使用者控制。 |
| Native Viewer 正式入口可見性（G-PD-4A） | S07 對應入口定案前；涉及是否保留／如何暴露產品能力。 |
| Native Parameters 遠端開窗 scope（G-PD-4B） | S07 該 authority 行為實作前；不能借用 Viewer 的 local-only 規則。 |
| 公開文件相容承諾 milestone／範圍／期間 | 首次對外承諾前；只決定承諾，不代替正式 schema。 |

未來若證據迫使刪除既有能力、實質改變 observable success/rejection、canonical ownership 或 security/user-control semantics，才需額外 Human 決策；一般工程選擇維持工程責任。

### Independent verification record and limits

- SHA-256：全部 344 indexed files 符合；index hash 見 provenance。存在與完整性核算不代表採用歷史 finding。
- 本輪重跑 document format、public surface／ledger、localization、Panel composition、scoped Parameter、view mount/adversarial、production boundaries、implementation-state 及五類 extension example suites。
- 初次批次有 162 cases 通過，ledger test file 因 reviewer 從本 chat cwd 執行而 ENOENT，未到 assertion。依該 test 明訂的 package-root cwd 單獨重跑，2 cases 通過。**最終 164 個實際 test cases 通過；沒有未解測試 failure。** 初次 cwd 錯誤是本輪操作問題，不列 package finding。
- 本輪唯讀 unknown-subfield probe 的結果已記於 B01；沒有由測試數量推導 acceptance。綠燈 cases 並未覆蓋或解決該 schema 問題，也未提供 mixed chronology contract。
- 未跑 production app、DOM/browser UI、TD/GPU、Electron 或 Legacy implementation；未宣稱所有 618 capabilities 已逐葉驗證。這些不在本輪 independent handoff contract acceptance 的執行範圍。
- Finding ID `IHR4-*` 為本輪獨立編號；未修後再宣稱 PASS。結論保留為 **FAIL：1 BLOCKER、1 MAJOR、1 MINOR**。
