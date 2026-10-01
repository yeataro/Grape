# Fresh Context Simulation · FCS-IH-002

**狀態：READY FOR INDEPENDENT RE-REVIEW。Self-check result：ANSWERS_LOCATED_WITH_EXPLICIT_LIMITS。**

這是 **package-only 的有界自查，不是 blind fresh context，也不是 Independent Review**。執行者參與本修訂，不能藉答案清單自行判定 HANDOFF PASS。此處核對新 Context 能否找到責任、公開入口與停止線；没有開始 S01、没有產品測試，也不以自查取代完整 regression。

原來16題及B01/M01兩題都有包內入口。限定閱讀未發現尚未表明的canonical ownership矛盾；HC-001來源衝突仍開放且隔離。下列答案不要求聊天或Legacy source；不代表已證明所有未讀程式皆無矛盾。

本檔取代舊IH-001 PASS結論；舊證據保留於 [previous-IH-001](previous-IH-001/FRESH_CONTEXT_SIMULATION.md)。機器答案：[FRESH_CONTEXT_SIMULATION.json](FRESH_CONTEXT_SIMULATION.json)。

## FC-01 — 產品是什麼？

**ANSWER_LOCATED。** Grape 是以可保存 Shader Graph 作品為中心的節點編輯產品；建立來源／節點、連線、調參、查看 GLSL、保存／重載，並可選擇交付外部 Host。Graph 包含 Stage，不以每 Stage 建一份作品。

包內入口：

- [00_README.md](../00_README.md) — 產品定位。
- [01_PRODUCT_MODEL.md](../01_PRODUCT_MODEL.md) — 作品與編輯。

## FC-02 — 為什麼重構？

**ANSWER_LOCATED。** 保留產品 observable intent，明確拆開作品、編輯狀態、UI、產碼與外部執行環境；普通擴充及三種部署不應迫使不相關 core 改動。Legacy 是行為 oracle，不是 ownership 或模組切分指令。

包內入口：

- [00_README.md](../00_README.md) — 重構目的。
- [11_LEGACY_COMPATIBILITY.md](../11_LEGACY_COMPATIBILITY.md) — Legacy 的角色。
- [03_RESPONSIBILITY_AND_DEPENDENCY.md](../03_RESPONSIBILITY_AND_DEPENDENCY.md) — architecture violations。

## FC-03 — Canonical Graph 在哪？

**ANSWER_LOCATED。** Application documents 持有開啟的 Graph；Graph 擁有 Node/Edge/resources、模型值及 Graph History。GraphDocument 是快照；Context、Panel、Host 不持第二份可寫真值。CQ 相反摘要隔離於 sourceSummary；HC-001仍未修訂來源，不能當作 Host ownership 例外。

包內入口：

- [02_ARCHITECTURE_SPEC.md](../02_ARCHITECTURE_SPEC.md) — §1。
- [03_RESPONSIBILITY_AND_DEPENDENCY.md](../03_RESPONSIBILITY_AND_DEPENDENCY.md) — Application documents／Graph rows。
- [audit/HANDOFF_CONFLICTS.md](../audit/HANDOFF_CONFLICTS.md) — HC-001。

## FC-04 — Host 是什麼角色？

**ANSWER_LOCATED。** Host/Target 是外部 execution/integration 領域，擁有 runtime artifact、actual values、native resources；Binding 持 identity/authority/session/receipt/mirror。回讀不直接改 Graph default；已交付文件副本不是工作中文件真值。

包內入口：

- [06_HOST_INTEGRATION.md](../06_HOST_INTEGRATION.md) — Host 可以做什麼，不代表它擁有什麼。
- [01_PRODUCT_MODEL.md](../01_PRODUCT_MODEL.md) — 兩條參數路徑。

## FC-05 — Parameter 修改走哪條 responsibility path？

**ANSWER_LOCATED。** Workspace 先給 effective Context/scope；欄位經 ScopedParameterTarget.openRouted，從同一 target 取得 spec/value/port/type/link。Widget 只持文字和 edit token；commit驗target/token，再委派 Parameter→Graph Draft→codec/schema/reconcile/diagnostics→原子發布，Context 投影先於外部通知；Operation 分組 History，Updates 另排產碼。Host live值使用独立service/CAS/receipt。

包內入口：

- [04_EXTENSION_MODEL.md](../04_EXTENSION_MODEL.md) — §5。
- [05_DATA_AND_LIFECYCLE.md](../05_DATA_AND_LIFECYCLE.md) — §1、§6。
- [executable-reference/repair/SCOPED_PARAMETER_CONTRACT.md](../executable-reference/repair/SCOPED_PARAMETER_CONTRACT.md) — Responsibilities and ordering。
- [examples/parameter-widget-or-ui-contribution/contribution.ts](../examples/parameter-widget-or-ui-contribution/contribution.ts) — PercentFieldController。

## FC-06 — 如何新增 Node？

**ANSWER_LOCATED。** 提供精確 NodeType ref、state codec、initialize/ports/parameters/validate/emit，收在 NodeModule；Registry.register 原子登記，pin 成 DefinitionSet，再由 Graph 建實例。state/值歸 Graph，模組只提供能力；沿 minimal-node 模板，不改 core node-name switch。

包內入口：

- [04_EXTENSION_MODEL.md](../04_EXTENSION_MODEL.md) — §2。
- [executable-reference/contracts.ts](../executable-reference/contracts.ts) — NodeModule、NodeType。
- [examples/minimal-node/example.ts](../examples/minimal-node/example.ts) — minimalNodeModule。
- [examples/minimal-node/example.test.ts](../examples/minimal-node/example.test.ts) — 直接案例。

## FC-07 — 如何新增 Dynamic Node？

**ANSWER_LOCATED。** 同一 NodeType 契約，以可編碼 mode/state 決定完整 ports/parameters，stable key 維持身份。變更與 edges/losses/diagnostics 同批發布；合法不相容模式依 detach/preserve 政策，Undo精確恢復。範例 menu options 是明示 sample convention，不承諾完整 enum SDK。

包內入口：

- [04_EXTENSION_MODEL.md](../04_EXTENSION_MODEL.md) — §3。
- [examples/dynamic-interface-node/README.md](../examples/dynamic-interface-node/README.md) — Explicit menu descriptor。
- [examples/dynamic-interface-node/example.ts](../examples/dynamic-interface-node/example.ts) — pack。
- [02_ARCHITECTURE_SPEC.md](../02_ARCHITECTURE_SPEC.md) — §3、§4。

## FC-08 — 如何新增 Panel？

**ANSWER_LOCATED。** 實作 Panel 私有 viewState、receive/setVisible/canClose/dispose，匯出 PanelType，再 workspace.register/open。共同 PanelWorkspace 負責 registry、targeting/routing、restore、placement、close preflight 和 placeholder；ordinary Panel 不另造 host/resolver/central kind branch。

包內入口：

- [04_EXTENSION_MODEL.md](../04_EXTENSION_MODEL.md) — §4。
- [executable-reference/repair/PANEL_COMPOSITION_CONTRACT.md](../executable-reference/repair/PANEL_COMPOSITION_CONTRACT.md) — Public roles、register/open。
- [examples/minimal-panel/README.md](../examples/minimal-panel/README.md) — 共同公共契約。
- [examples/minimal-panel/panel-template.ts](../examples/minimal-panel/panel-template.ts) — SelectionSummaryPanel／selectionSummaryType。

## FC-09 — UI contribution 怎麼加入？

**ANSWER_LOCATED。** ScopedParameterWidgets.register 登記 identity、supported predicate與immutable projection，不把 Graph/變更函式交給Widget。controller借effective Context、持target lease與text draft，同lease投影/commit；一般UI沿WidgetRegistry/Actions。失敗fallback保留描述和值；root/nested用同一controller。

包內入口：

- [04_EXTENSION_MODEL.md](../04_EXTENSION_MODEL.md) — §5。
- [examples/parameter-widget-or-ui-contribution/README.md](../examples/parameter-widget-or-ui-contribution/README.md) — scoped widget pattern。
- [examples/parameter-widget-or-ui-contribution/contribution.ts](../examples/parameter-widget-or-ui-contribution/contribution.ts) — registerPercentWidget／PercentFieldController。

## FC-10 — Generator/backend 怎麼擴充？

**ANSWER_LOCATED。** GenerationProfile 決定 GLSL shell/version/capabilities；NodeTypes 定操作語意。生成讀固定snapshot/definitions，回artifact/diagnostics/provenance。已驗GLSL seam，沒有 arbitrary-language replacement／語言中立IR承諾；TD/GPU真相容仍Gate，deployment不是shader語言選項。

包內入口：

- [04_EXTENSION_MODEL.md](../04_EXTENSION_MODEL.md) — §6。
- [02_ARCHITECTURE_SPEC.md](../02_ARCHITECTURE_SPEC.md) — §5。
- [07_DEPLOYMENT_MODEL.md](../07_DEPLOYMENT_MODEL.md) — 兩種profile不同軸。
- [12_DECISION_LOG.md](../12_DECISION_LOG.md) — D-N02。

## FC-11 — 如何 save/reload？

**ANSWER_LOCATED。** Save同步捕捉已發布完整document，再await storage；只ACK該snapshot，晚結果不清後續dirty。Error圖和missing module opaque records仍可保存；download不是durable ACK。Reload parse/pin/validate後新loadId、空History；import accept是保留runtime identity的可Undo replacement。Layout另存。

包內入口：

- [05_DATA_AND_LIFECYCLE.md](../05_DATA_AND_LIFECYCLE.md) — §2。
- [02_ARCHITECTURE_SPEC.md](../02_ARCHITECTURE_SPEC.md) — §6。
- [executable-reference/CORE_API_CONTRACTS.md](../executable-reference/CORE_API_CONTRACTS.md) — 保存與生命期。

## FC-12 — 如何 attach Host？

**ANSWER_LOCATED。** Discovery給候選，驗Host/Target/incarnation/能力與authority後建Binding lease/session；publish/inputs/native/preview各走capability。receiver提交前重新fence；不確定commit進indeterminate，待readback/recovery。重連新epoch不盲重放side effects；既有Target的live/preview不要求先Apply新shader。

包內入口：

- [06_HOST_INTEGRATION.md](../06_HOST_INTEGRATION.md) — 身分與權限、Publication、Preview/reconnect/readback。
- [04_EXTENSION_MODEL.md](../04_EXTENSION_MODEL.md) — §7。
- [examples/minimal-host-adapter/README.md](../examples/minimal-host-adapter/README.md) — adapter example。

## FC-13 — Static Web／Node／Electron 差在哪？

**ANSWER_LOCATED。** 共享application/core/modules契約；差bootstrap、storage、discovery/launch、transport/bridge、permission和作用設備。Static無任意目錄/LAN掃描假設；Node server不等於用戶TD所在機器；Electron增受限adapter/bridge，不把fs/IPC/isElectron塞進Graph/Parameter/Generator。

包內入口：

- [07_DEPLOYMENT_MODEL.md](../07_DEPLOYMENT_MODEL.md) — profiles表、Node→Electron。
- [03_RESPONSIBILITY_AND_DEPENDENCY.md](../03_RESPONSIBILITY_AND_DEPENDENCY.md) — dependency matrix。

## FC-14 — 第一個 slice 是什麼？現在能開始嗎？

**ANSWER_LOCATED。** S01是真UI的Host-free create Graph→Node→Parameter→Edge→GLSL→Undo/Redo→save/reload，含兩Context共用模型。本輪只Independent Re-review，未授權S01。未來授權後建production root；包內implementation-state.json是not-started範本，唯一mutable locator在包上一層同名檔，project.root指向checkout。

包內入口：

- [START_HERE_PROMPT.md](../START_HERE_PROMPT.md) — 目前任務與未來授權。
- [08_IMPLEMENTATION_PLAN.md](../08_IMPLEMENTATION_PLAN.md) — Current implementation入口、S01。
- [09_ACCEPTANCE_AND_CONFORMANCE.md](../09_ACCEPTANCE_AND_CONFORMANCE.md) — S01 planned acceptance。
- [implementation-state.json](../implementation-state.json) — 唯讀範本。
- [tools/check-implementation-state.mjs](../tools/check-implementation-state.mjs) — --current。

## FC-15 — 哪些 Gate 現在不能跨過？

**ANSWER_LOCATED。** 依每Gate scope/earliestRequiredPhase，不以整slice一刀切。33原UNKNOWN、產品decisions、revision→pin、mixed History、真TD rollback/readback、GPU/browser/device、TOE/TOX與deployment證據不可假設。B01/M01為contract-qualified-runtime-unverified，不是production UI通過；HC-001源摘要隔離仍在。

包內入口：

- [10_KNOWN_GATES.md](../10_KNOWN_GATES.md) — 原UNKNOWN、產品decision、額外Gates。
- [data/gates.json](../data/gates.json) — 45 Gate records。
- [08_IMPLEMENTATION_PLAN.md](../08_IMPLEMENTATION_PLAN.md) — P/S/I/R停止線。
- [audit/HANDOFF_CONFLICTS.md](../audit/HANDOFF_CONFLICTS.md) — HC-001。

## FC-16 — 哪些 architecture violation 必須拒絕？

**ANSWER_LOCATED。** 第二份canonical parameter/Graph、Generator改模型、module改別人私有state、Host接管文件、Panel穿透workspace、core依type名硬分支、平台API污染core、普通extension需改不相關core、root projection配nested write、UI補resource lookup均拒絕。Owner-local guards不等於sandbox；可信callbacks的只讀義務須review。

包內入口：

- [03_RESPONSIBILITY_AND_DEPENDENCY.md](../03_RESPONSIBILITY_AND_DEPENDENCY.md) — architecture violations。
- [02_ARCHITECTURE_SPEC.md](../02_ARCHITECTURE_SPEC.md) — §9 guard scope。
- [09_ACCEPTANCE_AND_CONFORMANCE.md](../09_ACCEPTANCE_AND_CONFORMANCE.md) — 必守的組合反例。
- [data/invariants.json](../data/invariants.json) — 不變量。

## FC-17 — 普通 Panel 的 route/restore/move/close 能否只靠 public contract 接起來？

**ANSWER_LOCATED。** 固定順序register→factory→identity check→restoreViewState→visibility→Tab attach→resolve→receive。ContextDirectory/targeting service處理follow/group/followCanvas/pin；pin由服務持獨立scope Context、同Graph，不受來源Canvas導航影響。move保instance/draft/context；retarget撤舊lease，accept擋過期async。restore先驗layout，缺module/version/ref保opaque placeholder可retry；跨reload由application RestoreResolver映射，普通Panel不自造。close先origin/gesture、再canClose，成功撤lease/Tab/provider後dispose，不銷毀借用Graph/Context。

包內入口：

- [executable-reference/repair/PANEL_COMPOSITION_CONTRACT.md](../executable-reference/repair/PANEL_COMPOSITION_CONTRACT.md) — register/open、routing/pin、move/close、save/restore/retry。
- [examples/minimal-panel/README.md](../examples/minimal-panel/README.md) — ordinary workspace。
- [examples/minimal-panel/test.ts](../examples/minimal-panel/test.ts) — HP01–04。
- [executable-reference/repair/public-panel-workspace.test.ts](../executable-reference/repair/public-panel-workspace.test.ts) — B01 cases。
- [executable-reference/repair/panel-inspector.test.ts](../executable-reference/repair/panel-inspector.test.ts) — BM組合。

## FC-18 — root/nested Inspector 是否在同一 logical target 讀、投影和寫？

**ANSWER_LOCATED。** Target綁Graph load、Context、Stage、完整occurrence path、Node/Parameter key，校驗definition chain；capture一次給spec/value/port/type/link，projectTarget/commit同lease。root/nested ID碰撞不回退；shared兩occurrence各有view lease而值共享。navigation ABA、stale path/load/ancestor替換、dispose使lease終止；type/interface/link/value變化讓舊token stale，Undo不復活。dispose後不再發舊updated；copy-on-write成功可使舊lease失效，不得重播已成功write。

包內入口：

- [executable-reference/repair/SCOPED_PARAMETER_CONTRACT.md](../executable-reference/repair/SCOPED_PARAMETER_CONTRACT.md) — Public surface、Responsibilities、Identity/sharing、Direct validation。
- [executable-reference/repair/scoped-parameter.test.ts](../executable-reference/repair/scoped-parameter.test.ts) — M01-RED、M01-01–16。
- [examples/parameter-widget-or-ui-contribution/test.ts](../examples/parameter-widget-or-ui-contribution/test.ts) — HW04/HW05。
- [executable-reference/repair/panel-inspector.test.ts](../executable-reference/repair/panel-inspector.test.ts) — BM組合。
- [04_EXTENSION_MODEL.md](../04_EXTENSION_MODEL.md) — §5。

## Independent Reviewer 應重新檢查的邊界

### FCS-L01 · OPEN_QUARANTINED

HC-001來源摘要仍未正式修訂；本自查未關閉G-HANDOFF-CQ-OWNERSHIP。

- [audit/HANDOFF_CONFLICTS.md](../audit/HANDOFF_CONFLICTS.md)
- [data/handoff-conflicts.json](../data/handoff-conflicts.json)

### FCS-L02 · INDEPENDENT_REVIEW_REQUIRED

B01/M01是本修訂public contracts及additive reference；定位答案不代替獨立review或把prototype認證為production。

- [executable-reference/repair/PANEL_COMPOSITION_CONTRACT.md](../executable-reference/repair/PANEL_COMPOSITION_CONTRACT.md)
- [executable-reference/repair/SCOPED_PARAMETER_CONTRACT.md](../executable-reference/repair/SCOPED_PARAMETER_CONTRACT.md)
- [audit/FINAL_HANDOFF_AUDIT.md](../audit/FINAL_HANDOFF_AUDIT.md)

### FCS-L03 · EXPLICIT_CONTRACT_LIMIT

Graph守自身publication，Context/workspace守自身API reentry；獨立Context/dispose通知沒有全域Graph lock。可信callbacks須只讀，不是惡意plugin安全隔離。

- [02_ARCHITECTURE_SPEC.md](../02_ARCHITECTURE_SPEC.md)
- [03_RESPONSIBILITY_AND_DEPENDENCY.md](../03_RESPONSIBILITY_AND_DEPENDENCY.md)

### FCS-L04 · GATED

TD/實體GPU/browser/IME/focus/touch、TOE/TOX及production renderer證據不由本自查提供。UI_SPEC/schematics是設計參照，Legacy screenshots是現況補充，不證明互動。

- [10_KNOWN_GATES.md](../10_KNOWN_GATES.md)
- [ui-reference/UI_SPEC.md](../ui-reference/UI_SPEC.md)
- [ui-reference/SCREEN_INDEX.md](../ui-reference/SCREEN_INDEX.md)
- [ui-reference/legacy-screenshots/README.md](../ui-reference/legacy-screenshots/README.md)

### FCS-L05 · EXPLICIT_CHECKER_LIMIT

進度checker驗shape/引用/hash，不能認證acceptedBy真偽或Gate證據足夠；外部current未登錄不開始production，封存audit不等於產品進度。

- [08_IMPLEMENTATION_PLAN.md](../08_IMPLEMENTATION_PLAN.md)
- [tools/check-implementation-state.mjs](../tools/check-implementation-state.mjs)
- [implementation-state.json](../implementation-state.json)

### FCS-L06 · OUTSIDE_COMMITMENT

GLSL profile seam不包含任意程式語言backend replacement，不得從backend名詞推論已解多語言產碼。

- [04_EXTENSION_MODEL.md](../04_EXTENSION_MODEL.md)
- [07_DEPLOYMENT_MODEL.md](../07_DEPLOYMENT_MODEL.md)

## 自查與執行證據分開

本檔只記答案定位與限定一致性檢查。B01/M01、組合反例及完整regression以 [Final repair audit](FINAL_HANDOFF_AUDIT.md) 和 [RUN_HANDOFF](evidence/RUN_HANDOFF.json) 的實際結果為準。ANSWER_LOCATED不是任何runtime、全部capability或正式產品通過；本自查未關閉runtime Gate。

新 Context 現在應做Independent Re-review。只有使用者另行授權後，才依 START_HERE_PROMPT／08 的S01與外部current locator開始正式實作。
