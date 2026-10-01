# Fresh Context Simulation · FCS-001

**目前結果：PASS（16／16項能從包內回答）。** 初輪14 PASS／2 FAIL、第二輪13 PASS／3 FAIL均保留；修正後完成第三輪只讀重查。這是有界的package-only自足性模擬，審查者先前寫過plan/gates，因此**不是新的stateless Context，也不是獨立blind review**。開始模擬後，只將本包文件、範例、API與現有報告作證據；沒有讀Legacy或外部baseline，沒有跑產品測試。

**PASS只表示交接答案清楚且一致，不等於Migration Ready或產品功能通過。HC-001仍是open、quarantined的來源摘要衝突；45個gate仍按各自範圍生效。**

審查規則：需要外部聊天/Legacy才能回答、canonical互相矛盾、owner不明、擴充必須猜接口，都記FAIL。明示的未實作gate不被改寫為PASS功能；能從包內得到具體入口、契約及明確停止線，才算可回答。

## 16項問題

### FC-01 — 這個產品是什麼？

**PASS。** Grape是以Graph作品為中心的Shader節點編輯產品；來源、nodes、edges、parameters、GLSL、保存與可選Host交付構成使用流程。Graph內含Stages，不以每Stage建一份作品。

證據：

- [00_README.md](../00_README.md) — opening product statement
- [01_PRODUCT_MODEL.md](../01_PRODUCT_MODEL.md) — 作品與編輯

### FC-02 — 為什麼重構？

**PASS。** 保留產品能力但解除Host托管帶來的隱含依賴，維持可擴充的Node/UI/backend與清楚owner；同application可由Static/Node/Electron提供服務。沒有要求仿製Legacy module layout。

證據：

- [00_README.md](../00_README.md) — product/refactor purpose
- [11_LEGACY_COMPATIBILITY.md](../11_LEGACY_COMPATIBILITY.md) — opening Architecture→Extension→Slice direction
- [12_DECISION_LOG.md](../12_DECISION_LOG.md) — D01,D03,D14,D17

### FC-03 — Canonical Graph由誰擁有？

**PASS。** Application documents持有已載Graph；GraphDocument是快照，UI/Host都不另持canonical副本。Stage/Node/Edge/resources與GraphHistory由模型域持有；Context僅view/selection。 機器coverage現已將CQ原文隔離在non-normative sourceSummary，compiled fields明示Graph持有資料、Generator只讀、Context不是產碼前置；HC-001來源文字衝突仍open，不把隔離誤稱來源已修訂。

證據：

- [01_PRODUCT_MODEL.md](../01_PRODUCT_MODEL.md) — 作品與編輯
- [02_ARCHITECTURE_SPEC.md](../02_ARCHITECTURE_SPEC.md) — §1,§2
- [03_RESPONSIBILITY_AND_DEPENDENCY.md](../03_RESPONSIBILITY_AND_DEPENDENCY.md) — Application documents / Graph rows
- [data/capability-coverage.json](../data/capability-coverage.json) — LC-NODE-370 executionPath/persistence/transformationChain
- [11_LEGACY_COMPATIBILITY.md](../11_LEGACY_COMPATIBILITY.md) — 機器coverage資料定位
- [audit/HANDOFF_CONFLICTS.md](../audit/HANDOFF_CONFLICTS.md) — HC-001
- [data/gates.json](../data/gates.json) — G-HANDOFF-CQ-OWNERSHIP

### FC-04 — Host的角色是什麼？

**PASS。** 外部execution/integration target，擁有原生active artifact/current values/control authority；Binding持session/receipt/mirror。Host可保存已交付document副本，但不能接管工作中Graph。

證據：

- [01_PRODUCT_MODEL.md](../01_PRODUCT_MODEL.md) — 兩條參數路徑
- [06_HOST_INTEGRATION.md](../06_HOST_INTEGRATION.md) — Publication協定責任 / Live inputs與native operations
- [02_ARCHITECTURE_SPEC.md](../02_ARCHITECTURE_SPEC.md) — §8

### FC-05 — Parameter.write的完整資料路徑？

**PASS。** Widget文字draft經guard/parse，再Parameter.write→Graph同步Draft→codec/schema/reconcile/diagnostics→原子發布、Context投影先、observer後；Operation commit形成History，Updates另排程。Host live值是另一條CAS/service路徑。 機器coverage現已將CQ原文隔離在non-normative sourceSummary，compiled fields明示Graph持有資料、Generator只讀、Context不是產碼前置；HC-001來源文字衝突仍open，不把隔離誤稱來源已修訂。

證據：

- [05_DATA_AND_LIFECYCLE.md](../05_DATA_AND_LIFECYCLE.md) — §1 sequence and operation table
- [executable-reference/core.ts](../executable-reference/core.ts) — Parameter.write / Graph.change / Operation
- [examples/parameter-widget-or-ui-contribution/contribution.ts](../examples/parameter-widget-or-ui-contribution/contribution.ts) — PercentFieldController.commit
- [data/capability-coverage.json](../data/capability-coverage.json) — LC-NODE-370 executionPath/persistence/transformationChain
- [11_LEGACY_COMPATIBILITY.md](../11_LEGACY_COMPATIBILITY.md) — 機器coverage資料定位
- [audit/HANDOFF_CONFLICTS.md](../audit/HANDOFF_CONFLICTS.md) — HC-001
- [data/gates.json](../data/gates.json) — G-HANDOFF-CQ-OWNERSHIP

### FC-06 — 如何增加普通Node？

**PASS。** 實作exact NodeType ref、codec/initialize/ports/parameters/validate/emit，放NodeModule manifest/types；Registry.register→pin→Draft.createNode。minimal-node實例與測試給完整API順序，core不按名稱分支。

證據：

- [04_EXTENSION_MODEL.md](../04_EXTENSION_MODEL.md) — §2
- [examples/minimal-node/example.ts](../examples/minimal-node/example.ts) — minimalNodeModule / scale
- [examples/minimal-node/example.test.ts](../examples/minimal-node/example.test.ts) — HANDOFF-NODE-01

### FC-07 — 如何增加Dynamic Node？

**PASS。** 同NodeModule定義state codec與state→ports，stable keys和Parameter.write觸發同批reconcile。範例現已用既有presentation.options傳送handoff.menu-items.v1及有序value/label；generic renderer可直接列出pair/color再提交選值，不必猜typeId或codec。這是明示sample convention，沒有冒稱正式menu SDK或DOM已實作。

證據：

- [04_EXTENSION_MODEL.md](../04_EXTENSION_MODEL.md) — §3
- [examples/dynamic-interface-node/example.ts](../examples/dynamic-interface-node/example.ts) — pack.parameters
- [executable-reference/contracts.ts](../executable-reference/contracts.ts) — ParameterPresentation/ParameterSpec
- [executable-reference/qualification-presentation.ts](../executable-reference/qualification-presentation.ts) — ParameterWidgets core.menu
- [ui-reference/UI_SPEC.md](../ui-reference/UI_SPEC.md) — Inspector最小建構規則
- [examples/dynamic-interface-node/README.md](../examples/dynamic-interface-node/README.md) — Explicit menu descriptor
- [examples/dynamic-interface-node/example.test.ts](../examples/dynamic-interface-node/example.test.ts) — HANDOFF-DYNAMIC-03

### FC-08 — 如何增加Panel？

**PASS。** 宣告PanelType typeId/viewStateVersion/create，依Panel canClose/export/restore/dispose契約實作，經PanelTemplateHost.register/open/save/close；template能登錄SelectionSummary而不改Graph。完整production mount/router/restore ABI尚在G-EXTENSION-PANEL，文件明說停止線，不需假裝現有bounded Workspace已實作。

證據：

- [04_EXTENSION_MODEL.md](../04_EXTENSION_MODEL.md) — §4
- [examples/minimal-panel/panel-template.ts](../examples/minimal-panel/panel-template.ts) — Panel / PanelType / PanelTemplateHost
- [examples/minimal-panel/README.md](../examples/minimal-panel/README.md)
- [10_KNOWN_GATES.md](../10_KNOWN_GATES.md) — G-EXTENSION-PANEL

### FC-09 — 如何增加Widget/UI Contribution？

**PASS。** ParameterWidgets.register註冊immutable projection；presentation descriptor/options只決定樣貌，值提交仍經Parameter.write。Actions/FieldDraft示例提供lifecycle/guard/parse/fallback/Undo，nested projection缺口明列G-EXTENSION-WIDGET-SCOPE。

證據：

- [04_EXTENSION_MODEL.md](../04_EXTENSION_MODEL.md) — §5
- [examples/parameter-widget-or-ui-contribution/contribution.ts](../examples/parameter-widget-or-ui-contribution/contribution.ts) — registerPercentWidget / PercentFieldController
- [executable-reference/qualification-presentation.ts](../executable-reference/qualification-presentation.ts) — ParameterWidgets / WidgetRegistry / Actions

### FC-10 — 如何增加backend/profile？

**PASS。** 實作GenerationProfile id/graphKinds/vertexNetwork/capabilities/type validation/render，注入generate(snapshot,profile)。NodeType定operation語意，Profile定shell和支持範圍，不寫Graph/Host；GLSL backend原型範圍與native/ISF未驗門檻清楚。 機器coverage現已將CQ原文隔離在non-normative sourceSummary，compiled fields明示Graph持有資料、Generator只讀、Context不是產碼前置；HC-001來源文字衝突仍open，不把隔離誤稱來源已修訂。

證據：

- [04_EXTENSION_MODEL.md](../04_EXTENSION_MODEL.md) — §6
- [executable-reference/generator.ts](../executable-reference/generator.ts) — GenerationProfile / ES300_PROFILE / generate
- [02_ARCHITECTURE_SPEC.md](../02_ARCHITECTURE_SPEC.md) — §5
- [data/capability-coverage.json](../data/capability-coverage.json) — LC-NODE-370 executionPath/persistence/transformationChain
- [11_LEGACY_COMPATIBILITY.md](../11_LEGACY_COMPATIBILITY.md) — 機器coverage資料定位
- [audit/HANDOFF_CONFLICTS.md](../audit/HANDOFF_CONFLICTS.md) — HC-001
- [data/gates.json](../data/gates.json) — G-HANDOFF-CQ-OWNERSHIP

### FC-11 — 如何保存／重新載入？

**PASS。** export當下已發布document；save捕捉內容後await adapter，只ACK該內容；download不清dirty。load保持persistentIDs但新loadId、空History，missingmoduleopaque可存；import accept與reload是不同生命期。

證據：

- [05_DATA_AND_LIFECYCLE.md](../05_DATA_AND_LIFECYCLE.md) — §2
- [02_ARCHITECTURE_SPEC.md](../02_ARCHITECTURE_SPEC.md) — §6
- [executable-reference/core.ts](../executable-reference/core.ts) — Graph.exportJSON / Graph.save / Graph.load
- [examples/minimal-node/example.test.ts](../examples/minimal-node/example.test.ts) — HANDOFF-NODE-02

### FC-12 — 如何接入Host，是否需要先Apply？

**PASS。** 以bootstrap身份查核、HostServices權限與對應provider建立Target能力；publication使用lease/fenced receiver和ArtifactExecutor。既有Target的live/native控制及preview不要求先Apply：S09基本前置只有S07，S08只在跨publication/Reload的mixedHistory、schema替換及receipt競態分支成為conditionalPrerequisite。memory adapter不能證明原生原子性。

證據：

- [06_HOST_INTEGRATION.md](../06_HOST_INTEGRATION.md) — Preview、reconnect與readback
- [examples/minimal-host-adapter/example.ts](../examples/minimal-host-adapter/example.ts) — MemoryArtifactExecutor / makeMemoryHost
- [executable-reference/qualification-host.ts](../executable-reference/qualification-host.ts) — verifyBootstrap / HostServices / FencedArtifactReceiver
- [08_IMPLEMENTATION_PLAN.md](../08_IMPLEMENTATION_PLAN.md) — S09
- [data/slices.json](../data/slices.json) — S09 prerequisites/prerequisiteOutputs/conditionalPrerequisites

### FC-13 — Static/Node/Electron的共同與不同？

**PASS。** 同Graph/Generator/application contracts；bootstrap/providers及可用權限不同。Static無任意fs/nativewindow，Node位置不等用戶machine，Electron只窄bridge而不改core；實際runtime各驗，PWA不自動承諾。

證據：

- [07_DEPLOYMENT_MODEL.md](../07_DEPLOYMENT_MODEL.md) — profile table / Node→Electron / 啟動與缺能力
- [03_RESPONSIBILITY_AND_DEPENDENCY.md](../03_RESPONSIBILITY_AND_DEPENDENCY.md) — Bootstrap/deployment row

### FC-14 — 第一個可實作slice是什麼？

**PASS。** S01是最小真Canvas+Inspector+actions的host-free產品路徑；建立Graph/nodes、改parameter、connect、看GLSL、Undo、save/reload，兩Context模型共享。47AT是計畫而非已跑產品測試；不能只交headless新原型。

證據：

- [00_README.md](../00_README.md) — first slice paragraph
- [08_IMPLEMENTATION_PLAN.md](../08_IMPLEMENTATION_PLAN.md) — S01
- [09_ACCEPTANCE_AND_CONFORMANCE.md](../09_ACCEPTANCE_AND_CONFORMANCE.md) — S01
- [ui-reference/UI_SPEC.md](../ui-reference/UI_SPEC.md) — 首輪scope / 兩Canvas驗收序列

### FC-15 — 哪些Gate不能跨越？

**PASS。** 33UNKNOWN、13significant、8PDR葉、5決策view及7handoff風險合計45 gate記錄，逐項列blocks/doesNotBlock/earliest/evidence。Personal/retention/adoption/window要owner決策；revision/mixedHistory先定scope；native可行性不可拖到大量依賴之後；HC-001衝突原摘要不能當指令。這些不是全域停工，也未因handoff清晰而解除。

證據：

- [10_KNOWN_GATES.md](../10_KNOWN_GATES.md) — 門檻、33UNKNOWN、決策view、額外gates
- [data/gates.json](../data/gates.json)
- [12_DECISION_LOG.md](../12_DECISION_LOG.md) — unresolved product behavior

### FC-16 — 哪些作法違反架構？

**PASS。** 另一份canonical UI值、Generator寫Graph、module私改他人state、Host接管document、Panel穿透internals、Node名字switch、core平台API、slot-by-index identity、把readback當write、半批提交或silent latest均明列禁止；manifest檢查不代語意review。

證據：

- [03_RESPONSIBILITY_AND_DEPENDENCY.md](../03_RESPONSIBILITY_AND_DEPENDENCY.md) — 必須拒絕的architecture violations
- [09_ACCEPTANCE_AND_CONFORMANCE.md](../09_ACCEPTANCE_AND_CONFORMANCE.md) — 必守組合反例
- [examples/conformance-manifest.json](../examples/conformance-manifest.json)

## 檢查輪次與實際修正

| 輪次 | 結果 | 發現與處理 |
|---|---|---|
| 1 | FAIL：14 PASS／2 FAIL | FCS-F01：dynamic menu沒有generic UI可枚舉的choices/labels。FCS-F02：S09全面依賴publication，與既有Target控制契約矛盾。 |
| 2 | FAIL：13 PASS／3 FAIL | F01/F02已解；FCS-F03：機器coverage把Graph mutation/storage放在Generator，Graph資料保存owner列Registry/NodeType。三個canonical答案不一致。 |
| 3 | PASS：16 PASS／0 FAIL | F03的handoff指令已更正並保留原摘要。HC-001来源衝突仍open，禁止直接採用原摘要；不是宣稱封存來源已修好。 |

**FCS-F01。** 既有presentation.options承載明示sample descriptor；renderer可枚舉而不猜Node私有結構。例子直接檢查projection、選值和codec拒絕非法值。這不是改動sealed core或宣告正式menu SDK。

**FCS-F02。** S09基本前置只有S07；S08只在跨publication／Reload的mixedHistory、schema替換與receipt競態分支適用。文字、圖與JSON已與06一致。

**FCS-F03／HC-001。** 以LC-NODE-370、LC-DATA-001等為反例：原機器摘要將mutation/history/save歸Generator或Registry，並把Legacy的Apply後保存条件當新持久化要求。現在原文在每leaf的sourceSummary明示historical-non-normative；compiled欄位分清Graph模型、UI狀態與Host runtime。只讀資料彙整確認395個Generator步驟都有只讀標記，618葉都有隔離來源與獨立Graph保存規則；這是資料審查，不是行為測試。詳見[衝突登錄](HANDOFF_CONFLICTS.md#hc-001)。

原封CQ文字尚未經來源修訂解除衝突。G-HANDOFF-CQ-OWNERSHIP阻止以隔離摘要生成實作，並要求遇到實質契約反例時停止受影響分支；它不阻止依明確模型契約做S01。不能把415個受摘要隔離影響的leaf當415項產品失敗。

## 尚未證明的事

- 這不是獨立無上下文的盲審；角色限制明列。
- 47項產品acceptance仍是planned，沒有在本模擬執行。
- Panel production registry／mount／restore／routing、nested Parameter projection、真TD/GPU／跨browser/device／部署仍有明確gate。
- 兩張交接SVG已完成PNG渲染與視覺檢查，見[VISUAL_QA.md](../ui-reference/VISUAL_QA.md)；這不代表新版產品UI已實作、其互動或真產品畫面已驗收。
- sourceSummary的隔離不修改原coverage disposition、不取消UNKNOWN、不解除原有產品決策。

## 證據範圍

讀到的[PACKAGE_VALIDATION.json](../executable-reference/evidence/PACKAGE_VALIDATION.json)記錄reference 201/201、node/host例子8/8；不是本模擬重跑。它不證明native TD或產品UI。原始失敗答案、輪次、解法與本輪所讀來源hash見[FRESH_CONTEXT_SIMULATION.json](FRESH_CONTEXT_SIMULATION.json)。本審查只寫這兩份audit文件，其他修正由編譯負責者完成。

## 最後增量一致性重讀

**PASS，16項答案與狀態不變。** 新增的[acceptance-index.json](../data/acceptance-index.json)有618個唯一leaf，明示全部production acceptance尚未執行；共用slice tests不能取代個別行為驗收。[11](../11_LEGACY_COMPATIBILITY.md)只增加查詢路徑，未改owner或完成判準。

[UI_SPEC §9](../ui-reference/UI_SPEC.md#9-responsivetabletmobile-的交接界線)與包內LC-UI-066／LC-HOST-031相符：responsive overlay保留desktop偏好；Viewer觸控不可直接當Canvas通用手勢；tablet/mobile實機仍缺證據。SCREEN_INDEX明列UIR-07為gap。[12的D06](../12_DECISION_LOG.md)限定「已detach到loss」不自動復線，與preserve-invalid修復政策一致。

另已讀取[示意圖視覺QA](../ui-reference/VISUAL_QA.md)及[渲染紀錄](../ui-reference/rendered/RENDER_RECORD.json)：有兩張PNG的實際視覺檢查紀錄。本審查沒有重新渲染或自行完成該檢查；原限制所指的是**產品UI的真實畫面、交互與跨平台驗收**，不是否認已完成的靜態示意圖QA。
