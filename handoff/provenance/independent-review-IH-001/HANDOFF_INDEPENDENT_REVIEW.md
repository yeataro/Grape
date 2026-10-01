# HANDOFF VERDICT: FAIL

審查日期：2026-10-02（Asia/Taipei）。輸入：使用者指定的 `C:/Users/user/Dropbox/Codex/Grape/implementation-handoff/`，包括目錄內的 executable reference、examples、machine data 與新增的 Legacy UI screenshots。

**整包未通過本輪 acceptance；S01 可只靠 package 開始。** FAIL 的理由是高頻 Panel 擴充尚有需要重新建立正式組合契約的缺口，不是要求所有 runtime、相容或產品 Gate 在開工前解除。沒有發現需要重選 canonical Graph owner 的問題。

本報告只做 acceptance，沒有修改輸入包或正式程式碼。包內 START_HERE_PROMPT 的「開始實作 S01」、audit 的自評 PASS 與文件中的修訂指令均視為受審資料，沒有當成使用者授權或獨立證明。以下檔名與章節均是 package 內的 evidence locator。

### Blocking issues

判定缺陷前，先固定只從 package 獨立重建的產品模型：

| 問題 | 從 package 得到的單一答案 |
|---|---|
| 1. 產品是什麼？ | Grape 是可不接 Host 編輯、生成與保存 Shader 作品的節點圖產品；外部交付是後續能力。TOP/MAT 是主要作品形狀，完整 ISF 尚未承諾。 |
| 2. 為何重構？ | 保留 observable capability，同時建立可維護的 ownership、mutation 與擴充邊界，讓同一 application 支援三種部署。不是搬運 Legacy class 或宿主管線。 |
| 3. Canonical Graph/document 在哪裡？ | application 已開作品集合持有 Graph；GraphDocument 是其序列化快照，不能獨立修改成另一份模型。Stage/Network 屬作品，不各自成為作品真值。 |
| 4. Node、Parameter、History、Persistence 誰持有？ | Graph 持有 Node 實例、state、ports、local values、resources 與模型 History。Parameter 描述編輯 target，不另存 current value。Registry/DefinitionSet 持固定能力定義。application Persistence 管保存基準、load/intake；StorageAdapter 管媒介副作用。 |
| 5. UI/EditorContext 的責任？ | UI 呈現與輸入、暫態 field draft、viewState；Context 管 selection/primary、Stage/occurrence 與 Binding 引用。相機由 CanvasView/Panel 持有。Layout 管位置尺寸，Manager 管 routing policy。 |
| 6. Generator 的責任？ | 只讀同次 immutable snapshot 與固定 definitions/profile，產生 shader、schema、diagnostics/provenance。不得改 Graph、保存文件或 Apply Host。Updates 另管排程/cache。 |
| 7. Host 是什麼？ | external execution/integration target；Target 是其接收位置。接 artifact/binding/resources/live writes/native operations，回 receipt/readback/runtime/diagnostics。 |
| 8. Host 可持哪些 runtime state？ | active shader、native resources、actual inputs、drivers、native control records、執行狀態與已交付文件副本；Binding 在 application 持 lease/epoch/intent/receipt/live mirror。 |
| 9. Host 絕不可成為哪些 canonical owner？ | 工作中 Graph/document、NodeType/Graph-local definitions、作品參數/default、Graph/application History、EditorContext。回讀文件須明確 import/reload，不以 subscription 改作品。 |
| 10. 三部署的關係？ | Static Web、Node-hosted、Electron 共用 domain/application contracts，改 bootstrap/providers/bridges。部署不重定 owner；server 所在機器不等於 browser 使用者機器。 |

依據：01、02 §§1–8、03 ownership matrix、05、06、07。這十題沒有發現互斥的 canonical 答案；攝影畫面上的 Host path/Save TD project 也不能覆寫它們。

**B01 — 普通新 Panel 只有獨立教學 host，缺少可直接接入產品工作區的完整公共組合契約。BLOCKER（整包擴充交接；不阻 S01）。**

證據鏈：

- 04 §1 將 `grape.ui.panelTypes` 列為正式設計入口；§4 宣告 Panel 為第一級擴充角色；03 禁止普通新 Panel 要改多個無關 core subsystem。
- `examples/minimal-panel/panel-template.ts` 明寫「Production Layout/Tab routing is intentionally absent」。`create` 只收到單一 borrowed Context，`restoreViewState` 沒有繼承設計中的 Resolver；範例手動呼叫 projection，沒有 production Context subscription contract。
- `executable-reference/qualification-workspace.ts:63,132` 的 `PanelKind`/`registerPanel` 仍是六類 bounded routing probe。不能以增加 union/switch 作正式的普通擴充路徑。
- 04 §4 說這些是 implementation/qualification 工作，但 10 的 G-EXTENSION-PANEL（約 lines 761–773）又要求「新kind若要交付，明訂新增契約並獲Architecture Change記錄」。

實際模擬：新增一個 Selection Summary Panel，想像既有 Parameters Panel 一樣跟隨 Canvas、搬 Tab、恢復 layout、失敗留 placeholder。模板能完成 create/private-state/dispose，卻不能回答它如何經同一正式入口取得初次及後續 resolved target、訂閱 routing、在 restore 時重解析引用、在 retarget/close 時處理 origin-owned gesture。繼承文件已給行為 invariants，但兩條公開入口沒有包內已定的組合契約。下一位實作者必須自行把教學 host 與工作區拼成新的 extension architecture，或退回封閉 kind 的特例。

這不是要求先寫完 Panel renderer、固定函式拼字、提供第三方 sandbox、熱更新或通用 plugin SDK。缺的是**普通產品 Panel 的公開接合責任與順序**；原包自己將新增該契約判為 Architecture Change，因此不能把全部缺口算普通 coding freedom。

最小修正方向：由架構責任者在包內固定一條 Panel→Tab/Layout/Manager 的公共組合契約，涵蓋 target resolution/notifications、restore resolver、retarget/dispose/close failure；用同一產品工作區契約接入一個新 type，驗「註冊後可用、既有 core diff 為零」。runtime/DOM 證據可以在 S06 取得。本輪不替作者選 API 或補設計。

### Major issues

**M01 — generic nested Inspector 的 read/projection 與 write 尚未閉合；容易形成 UI 的另一套 scoped lookup。MAJOR，影響 S03/S06，非 S01 blocker。**

04 §5、10 G-EXTENSION-WIDGET-SCOPE 已誠實揭露：`ParameterWidgets.project(context,nodeId,key)` 讀 root `Graph.nodeById` 與 root Stage edges；`workspace.parameterEditor` 的 EditableParameter/ScopedParameter 則可指 nested network。`qualification-presentation.ts:42` 起可直接確認兩者不接同一 scoped handle。root widget 成功不證 nested widget 成功。

具體後果：共享 definition 的兩個 occurrence，在 write 路徑已能精確指向目標，projection 仍可能漏值、漏 link state 或誤查 root 同 ID Node。若 UI 為求能動而自行遍歷 resources/occurrences，就會把模型解析、staleness 與型別政策複製到 Inspector。入口存在但組合缺口仍需契約工作，不可只在 renderer 加一個 nested 分支宣布完成。

最小方向：在需要 nested 投影前閉合 scoped spec/read/link state→projection→同目標 write 的契約；驗兩 occurrence、stale path、type change、dispose。沿既有 Gate 處理，不改 ownership，不要求 S01 等待。

其他未解 Gate 未因「尚未通過」自動升為 Major。真 TD rollback、GPU、Legacy revision mapping、混合 History 等有明確時點與分支限制；這些限制本身合理。

### Minor issues

**N01 — UI 索引描述已落後於截圖補充。** `SCREEN_INDEX.md` 開頭仍說以下全是 schematic，READ ME 的主閱讀路徑不列 `legacy-screenshots/README.md`；新增資料夾自己說原索引保持原樣。結果是入口閱讀者容易誤判「沒有任何 Legacy screenshot」。圖片實際存在，不能報成缺圖 blocker。最小方向是增加 additive supplement locator；不必改舊圖的 authority。

**N02 — Backend 與 GLSL Profile 的範圍用語過寬。** 04 稱 Generator Backend/Profile 同一入口，但 contracts 的 TypedExpression 已攜 code 字串，GenerationProfile.render 接收 globals/body/result 字串，既有 conversion/effects lowering 已帶 GLSL 語意。新增 GLSL version/shell/capability profile 有自然 seam；這不能證明任意語言 backend 可只換 Profile。非 GLSL backend 並未列為 S01 必備，本輪不要求新 IR 或 redesign。最小方向：明示已交接的可替換範圍與超出範圍的 stopping line，避免下一位誤把 profile injection 當完整跨語言 backend SDK。

**N03 — machine state 是完整的交接 baseline，但 production 狀態檔的接續位置未固定。** slices/acceptance-index 都是 planned/not-executed，checker 明確要求其保持此種狀態。09 已定 production result 的狀態與證據欄位，08 也要求交付收據，因此不缺狀態概念；只缺「新實作狀態存哪裡、哪個入口指向最新 build/review」的 locator。最小方向：一個 production state 檔或既有專案狀態入口的引用即可，不需新行政文件群，也不應覆写封存 coverage。

### Product-positioning drift

**NONE（有效 canonical 規範）；存在已隔離的歷史漂移文字。**

全包搜尋 Graph/Host ownership、Generator mutation、Apply/save 與 definition/persistence 摘要後，衝突的典型位置是已列 HC-001 的 sourceSummary：Generator 被寫入 Graph.change/reconcile/History/load-save 路徑，NodeType/Registry 被當實例 persistence owner，LC-DATA-001 把未 Apply 的內容當僅本地 draft。它們是真實的誤讀風險，但 00、02、11、START_HERE_PROMPT 與 machine `sourceSummary.status=historical-non-normative-summary` 明確隔離；compiled ownership 與獨立保存規則一致。不能忽略這些字句，也不能將已隔離字句當仍有效的 canonical 指令而報 CONFIRMED drift。

Legacy compatibility 保存 observable intent、失敗/Undo/persistence oracle。Host project save 是外部 native operation；Host 保存 delivered copy 不是產品保存；actual values 是外部 authority，不是 Graph default 的第二份真值。Graph History 與 native/live receipts 分域，混合 dispatch 仍 Gate。deployment profiles 只供能力，不重定 application architecture。未見新的有效規範把上述責任偷偷搬回 Host。

Architecture conformance 的 adversarial 判讀：

| 失控路徑 | 判定 | 依據及實務限制 |
|---|---|---|
| 第二份 canonical state、circular ownership | NON-ISSUE：規範足夠 | GraphDocument 明定 snapshot；Context/UI/mirror 分域；仍須 production 多 Context tests 證明。 |
| cross-module private mutation、隱性 active globals | NON-ISSUE：明確禁止 | read-only callbacks、Graph Draft、Generator snapshot。邊界 checker 不能證所有 closure/alias。 |
| UI/Generator/Persistence 越權 | NON-ISSUE：可驗契約 | Parameter→Graph、只讀生成、save 捕捉/ACK basis、load 新 lifetime，均有負向案例。 |
| host/deployment-specific logic 穿 core | NON-ISSUE：seam 明確 | bootstrap/providers、receiving fence、capability unavailable；不能以平台名推斷 authority。 |
| extension 修改 central switch/private registry | BLOCKER B01；MAJOR M01 | Panel 組合與 nested projection 兩處最容易迫使實作者另開特例。普通 Node 的公開 registry 路徑足夠。 |
| feature-specific condition 堆在 core | 目前非已證實缺陷 | Node schema/codec/validation/emit 與 capability admission 可承接普通能力；不能直接搬原型 closed bounds。 |
| compatibility workaround 變 canonical | 已隔離風險，非新 defect | HC-001、import/codec/adapter 邊界及 exact pins 禁 silent latest。 |
| prototype 成為 production foundation | NON-ISSUE：禁止很清楚 | 00/02/12/START_HERE/reference README 明令新 production root；可移植契約測試，不能繼續堆 qualification classes。 |
| API 名義公開但需大量 internals | 局部缺陷 | B01/M01 成立；未將所有 reference class 內部複雜度視為產品必須照抄。 |

固定核心主要固定 responsibility/invariant，沒有要求一切 plugin 化。trusted TS extensions 非 sandbox 的限制合理；不以缺熱卸載或任意惡意 plugin 隔離扣分。

### Extension-model assessment

**PARTIAL。** Node/動態 Node/root Widget/GLSL Profile/既有 Host capability adapter 的路徑清楚；普通 Panel 的產品接合未達標，nested Widget 受明確缺口限制。

以下是實際 extension simulation；「修改」指新增 contribution 與 composition registration，不代表修改 Handoff：

| 案例 | 入口／最少概念 | 要動哪些 subsystem／是否碰不相關 core 或 private internals？ |
|---|---|---|
| A 普通 Node | Registry.register→pin；NodeType ref、state codec、ports、parameters、validate、emit、共享 types | 新 Node module、bootstrap 註冊與其測試；無需改 Graph/History/Persistence/Host。公開 ModuleContext 足夠。PASS。 |
| B 動態 ports Node | 同 NodeModule；state→ports、stable key、connection policy、loss/preserve、Operation | 新 module 與必要 Widget descriptor；既有 reconcile 做原子 ports/values/edges。无需按 type 名改核心或讀別人 state。PASS。 |
| C Panel | 設計 panelTypes/factory；Panel/Tab/Pane、borrowed Context、follow/pin、private viewState | 新類型在模板可用；接正式工作區仍需補 Layout/Manager/resolver/events composition。不能從模板證 core diff=0。B01，FAIL。 |
| D UI contribution/widget | ParameterWidgets/WidgetRegistry/Actions.register；immutable projection、FieldDraft、Parameter、focus/IME/guards | 新 contribution/controller/renderer 實作及註冊；root 不需改模型核心。nested projection 尚不接 scoped parameter，見 M01。PARTIAL。 |
| E Generator backend/profile | generate(snapshot,GenerationProfile)；types、capabilities、stage shell、lowering、trace/provenance、Updates basis | GLSL Profile 新模組與 composition；不碰 UI/Host/Persistence。非 GLSL lowering 替換不由現有 Profile 完整涵蓋，見 N02。PASS（已定 GLSL profile 範圍）。 |
| F Host adapter/target capability | HostServices/providers＋具名 executor/input/preview contracts；identity/incarnation、lease、CAS、receipt、native queue | 同一 capability 的新 Host adapter 與 bootstrap，不改 Graph/Node。全新 capability 需新公開 service contract；closed ServiceName 是 bounded reference，不能永久封閉產品。低頻 seam 可辨識，不需任意 generic protocol。PASS（新 capability 尚須自身契約/evidence）。 |

| 案例 | State owner／lifecycle | Validation/error/persistence 與再次新增同類能力 |
|---|---|---|
| A | 定義由 Registry/DefinitionSet；實例由 Graph；register→pin→initialize，load/Undo 不重跑初始化 | codec/schema/callback 原子失敗、exact refs、missing preservation、Undo/load；下一個普通 Node 仍同一路。 |
| B | mode/backups/ports/local values/loss 由 Graph；一次 mutation reconcile→publish→History | 合法但 invalid 可保存；非法 codec/callback 全批拒；detach 不自動復線，Undo 精確還原。另一動態 Node 不需新 core 特例。 |
| C | Graph/Context/Layout/Panel 分責清楚；create/restore/hide/move/canClose/dispose 行為有規範 | state 版本/placeholder/failure 有模板；production resolution/subscription/retarget/close composition 未閉合。再新增同類可能重複 glue。 |
| D | registry 管 callback，模型值仍在 Graph；draft/dispose 與提交分開 | fallback/readonly/notice、stale write、IME、History 有案例。nested 同目標讀寫尚待 Gate，不能用 root ID 快取替代。 |
| E | snapshot 固定；job 擁中間值；Updates cache，不進 Graph History | 全圖 error 先擋、unsupported capability/type 回診斷；profile 不產生模型 persistence。新 GLSL profile 自然，版本變更必須使 cache identity 失效。 |
| F | Host 擁 actual/native state，Binding 擁 mirror/intent；bind→prepare/commit→readback→unbind | receiving-side fence、CAS、indeterminate、retry 去重；權杖/handle 不存文件，Graph defaults 不變。新 adapter 不得直接穿 core。 |

不需要理解半個產品的是 A/B/root D 與同能力 F；新 backend/profile 本來涉及型別與生成，這是相關必要概念，不是高摩擦缺陷。C 的跨 subsystem 接合是尚缺公共契約，而非僅 renderer 寫法不同。

### Fresh Implementer result

**S01：可以只靠 package 開始。Architecture decisions still to invent = NONE（限 S01 明定範圍）；blocking external information for S01 = NONE。**

| Slice | 準備建立／可直接實作的 contract | Engineering freedom | 尚需 architecture／矛盾／外部資訊 |
|---|---|---|---|
| S01 | 新 production root；真 Canvas/Inspector/action UI；Float/Multiply/Compose→Output→ES GLSL→Undo/Redo→save/reload，兩 Context。Graph atomic Draft、stable ports、exact definitions、FieldDraft、snapshot、History、ACK/dirty/lifetime 已定 | renderer/framework、檔案/class 分解、集合結構、接線命中算法、browser storage adapter、測試工具、theme。用既定 Panel responsibility 做最小固定畫面，不宣稱任意 Panel SDK 已完工 | 不需重選 ownership、transport、架構或查聊天/Legacy source。UI 真事件/Storage race 是要做的驗證，不是 missing architecture。Gates 按 root/portable 分支生效。 |
| S02 | inspect→review/cancel/accept UI、opaque missing modules、壞檔 raw preservation、load 新 lifetime；accept 一筆 replaceDocument/Undo | parser/recovery UI 組織、測試 fixtures、adapter 細節；不是允許自選 legacy latest fallback | new-format/known exact-pin 分支可開始；Legacy revision→pins 的成功/拒絕 mapping 未定，受 G-VERSION-COMPAT。必要 goldens/環境證據有 Gate；不得回聊天猜答案。無新的 canonical ownership 矛盾。 |
| S03 | 真 nested Canvas/breadcrumb、shared definition、多 callers reconcile、scoped mutation、clipboard closure/remap、Undo | 遍歷/closure 算法、view rendering、相機算法、效能優化 | nested Inspector 的公開讀取/投影組合須先閉合 M01；目前不等於 NONE。其他 local/scoped-model 分支可開始，不必等待 Personal 符號陣列決策。不能用讀 Legacy source 補 API。 |

這三個 slices 是規劃模擬，未實作。S02/S03 的 Gate 不因下一個 slice 能開始而視為已解除。

Implementation Plan 判定：**可執行的垂直計畫，非僅 roadmap。** 08、09 與 slices.json 的主要 slices 均有 observable result、owners、dependencies、scope、non-goals、Gate、Given/When/Then、runtime evidence 與 completion。S01 先走 Host-free 完整流程，S07 以後才引入 external Host，沒有要求長期先堆 infrastructure。prerequisiteOutputs/conditionalPrerequisites 避免等整個 catalog 或整個 Apply 才做 preview/live controls。S05/S06 大範圍需按宣告族/分支拆實作工作單；這是合理的工程編排，不需重做 architecture。

Known Gates 判定：**整體合格；B01/M01 是契約缺口，不能用 Gate 名稱免除驗收。** machine data 將 33 UNKNOWN 對應成 33 base Gates，另有產品 views/handoff risks，共 45 records。blocks/doesNotBlock/earliestRequiredPhase/requiredEvidence/disproofAction 均存在；13 significant UNKNOWN 有 architectureImpact。真 native commit/readback 在首次相關 I，version mapping/mixed dispatch 在依賴實作前 S，平台承諾在 R；時點不是一律最後驗收。反證需保留 fixture/version，按 adapter defect、行為決策或 boundary 不可表達分流，再開 Architecture Change。各 Gate 的 impact 加責任矩陣可定位要重開的領域；無需要求所有 Gate 在 S01 前清空。

獨立執行證據：只讀 `node tools/check-handoff.mjs`，exit 0，8986 checks、errors=[]；重跑固定/動態 Node、fake Host、Panel template、root UI contribution 五組 examples，15 tests passed，exit 0。沒有執行會寫回包內 evidence 的 verify-reference，沒有真 TD/GPU/browser 產品操作證據。這些通過結果只確認包內資料/例子可用，不證明 B01 的 production 組合、不提高產品 readiness。

### UI handoff result

**PASS（S01 桌面 UI 意圖）；完整工作區、行動版與 runtime parity 仍未驗收。**

| 檢查 | 分類／判讀 |
|---|---|
| layout/panel | Structural：Layout→Pane→Tab→Panel、浮動 Pane、borrowed Context 與 close≠unload 明確。S01 可固定配置；完整可擴工作區有 B01。 |
| canvas/node states | Structural/Behavioral：真 ports/edges、shared coordinates、selected/error 可共存、protected Output、missing opaque Node；移動/接線失敗/Undo 規則可實作。 |
| inspector/dynamic ports | Structural/Behavioral：primary target、schema 更新、connected/local 分辨、source reveal/disconnect、stale write 與 field draft 清楚。nested 部分 M01 不在 S01。 |
| toolbar/menus/selection | Behavioral：New/Add/Undo/Redo/generate/save/export/open 入口、Canvas activation、Inspector focus 不改來源；selection/primary 清理有行為 oracle。位置/精確圖示是 Replaceable。 |
| errors | Behavioral：model/generation/storage/Host 分域，invalid 可保存、不假生成，persistent error 不被 toast 清掉。states schematic 提供可見狀態。 |
| responsive | Behavioral：≤800px sidebar overlay、不覆写 desktop 偏好與 Context；裝置座標/取消清理明定。mobile/tablet/pen/screen-reader runtime 證據未提供，不可宣稱完成。 |
| appearance | Visual preference/Replaceable：家族色、matrix 明定值、line style 等按 oracle；示意 spacing/fonts/icons 可換，不把 schematic 色值升為產品承諾。 |

已視覺檢查兩張 rendered schematics 與 Legacy LUI-01/LUI-05；其餘三張截圖的涵蓋描述/metadata 在 supplemental README/manifest。桌面停靠/浮動配置、節點資訊密度、Inspector、工具列與選取外觀已有直接參考，不需要讀 Legacy UI source 才能重建首版意圖。

尚無操作前後影像涵蓋：動態 ports 損失/修復、接線拒絕、missing-module、focused invalid draft、nested breadcrumb、mobile/tablet。S01 必要行為已有文字與 states schematic，因此不是視覺 blocker；若後续要求 Legacy 精確外觀/狀態 parity，需這些具名狀態的 screenshot 或 annotated mockup、窄畫面參考。不得自行 redesign 來補缺證據。

### AI workflow readiness

**PASS（handoff baseline）；production 狀態接續有 N03。**

packageId/baseline IDs、immutable input hashes/source provenance、S01–S12 identities、Gate status、planned acceptance、21 invariant index、decision log、dependencies/prerequisite outputs、618 leaf→slice/Gate/test mappings 俱在包內。PM/Supervisor 可分派可做分支；Implementer 能查契約；Reviewer 能分開 production behavior/conformance 與 reference qualification，不必依賴任何 agent 記憶。

SOURCE_BASELINES 指外部來源的 path 是歷史 locator，included copies/hash 是可用输入；reference reconstruct 明定不是新 context prerequisite。audit/FRESH_CONTEXT_SIMULATION.json 自述其作者曾參與規劃，故其 PASS 不算本輪 independent fresh-context evidence。

不要求額外行政系統。正式實作只需可定位、機器可讀的當前 build/slice/Gate/acceptance 收據，沿 09 現有狀態欄位記錄，並保持封存 qualification 不變。

### Decisions requiring human owner

**S01 需要的人類決策：NONE。B01/M01 的公共組合契約修訂由架構責任者處理，不因需要 Architecture Change 就把 API 設計交回人類。**

package 已列、到對應分支才必須處理的真產品 owner 決策：

1. **G-PD-1：Personal 符號陣列的接受/拒絕與能力範圍。** 影響交換資料的語意承諾；S04 前定對應政策。
2. **G-PD-2：named layout 超限的 retention/拒絕行為。** 影響使用者設定是否丟失；在 S06 寫正式資料前決定。
3. **G-PD-3：cross-manager/不同 Host identity 的 adoption/fallback 範圍與確認。** 影響 authority model；S07 該分支前決定。
4. **G-PD-4A：native Viewer 的可見入口/API-only/local UI 或能力放棄。** 影響產品能力；S07 該分支前決定。
5. **G-PD-4B：native Parameters remote action 的保留/local-only/Host 本機同意範圍。** 影響外部操作 authority；不能沿用 Viewer 政策；S07 該分支前決定。

Legacy revision mapping、mixed History 順序、真 TD 故障處理先是既定要求下的契約/evidence 工作。只有要取消既有成功行為、降低 last-good/資料承諾或改 authority 才需人類決定。framework、class/function、storage algorithm、transport、registry API 拼字均不列為人類待辦。
