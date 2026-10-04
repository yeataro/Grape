唯讀盤點完成，未寫檔、未執行產品測試、未產生獨立 review verdict。

**盤點身分**

- Packet：`CONTINUOUS-INVENTORY-SCOUT-01`，SHA-256 已核對為 `bba60cb16d8785f4043898997e88b81f554319aef401b369ca2251f3110d0c7d`。
- Authority：`production/evidence/coordinator/continuous/20261005-01/human-run-authorization-01.json`，SHA-256 已核對為 `49dd9a0500ae2a07e868fc1cc58c6528f0b50ab0c349f33c9bea8442aa9922fa`。
- 以下契約、state、code、evidence 均以 checkpoint `9003c00b214ac29cafcb6cc22ac10693ac92a0bf` 讀取。
- checkpoint 的產品候選仍是 I `30c867945c992d25956a2a32825de34571f7749e`、build `S06-debug-30c8679`；checkpoint merge 不是 S06 acceptance。
- `slices.json` 的 S01–S12 聯集涵蓋 618 個 capability IDs；共有 57 個 slice acceptance entries，其中 `AT-S09-03` 明確 deferred，另 10 個 DEC-GRAPE-001 替代／保留測試已包含於這 57 項。共享 AT 不代表整葉全部 modes 已驗證。

**共同來源定位**

每列 Slice 的完整 membership、先決輸出、AT、runtime 與 conformance 義務，定位於：

- `handoff/data/slices.json` → `slices[id=Sxx]`
- `handoff/data/acceptance-index.json` → `entries[capabilityId=LC-…]`
- `handoff/data/capability-coverage.json` → `entries[capabilityId=LC-…]` 的 `mechanismFamily`、compiled ownership；不可採 `sourceSummary` 作實作權威。
- `handoff/compatibility/capabilities.json` → `capabilities[id=LC-…]`，尤其 `operationSpec`、failure、persistence、Undo、edge cases；另有 `handoff/compatibility/behavior-contracts.md`。
- `handoff/09_ACCEPTANCE_AND_CONFORMANCE.md`：四類證據、组合反例、AT-S01…S12。
- `handoff/data/gates.json`／`handoff/10_KNOWN_GATES.md`：46 個 Gate records 的 scope，不是 46 個全面停工條件。
- 跨批次必守：`handoff/02_ARCHITECTURE_SPEC.md`、`03_RESPONSIBILITY_AND_DEPENDENCY.md`、`04_EXTENSION_MODEL.md`、`05_DATA_AND_LIFECYCLE.md`、`13_PRODUCTION_CONTRACT_SURFACE.md`、`14_DOCUMENT_FORMAT.md`、`15_LOCALIZATION_CONTRACT.md`、`16_VIEW_MOUNT_CONTRACT.md`、`17_PANEL_COMMAND_CONTRACT.md`、`data/invariants.json#INV-001..021`、`data/production-contract-ledger.json`。
- 現行寫入格式 **grape.document 2.1** 及外部 accepted amendments 疊加於 frozen IH-005；不能回寫 frozen 格式或悄悄改旧 exact pins。

**既有 exact evidence 索引**

| Ref | Exact scope / identity | Evidence locator |
|---|---|---|
| E01 | S01 I `c1ecb3cd1a4cd1685e3fb1d9ba2a17b4108e68c3`，R `ab0216436d66ab1282758d51dceb38d0283c1965`；Linux Chromium151 desktop、host-free、root Inspector、GLSL text、document2.0 | `production/evidence/acceptance/S01-independent-review.json`，SHA `22c9df33c3d851e15fc4e3c24b73529b92c22963d3630d9d766d189f82a5afbc`；相鄰 `S01-human-owner-acceptance.json` |
| E02 | S02 I `e23a997f53a17f3e00bf7f83de489cfaeb367251`，R `45c08a5b27beb9c57797975cea8007c35640e16c`；AT-S02-01/02/04，有界 current format／PNG | `production/evidence/acceptance/s02/S02-independent-review.json`，SHA `a35053bdb7fc5e70583dde209ca5e0f8a0f62a505d216239affcb7e629cafde9`；相鄰 human acceptance；原 gap `production/evidence/s02/REVIEW.md` |
| E03 | S03 I `80ee116b8f809c9160aa9cc311801cce15923cee`，R `c209bba451149b9d54a6a54c3b35dd28f39225f3`；24 mapped IDs、AT-S03-01..04 的 Windows Chromium151 scope | `production/evidence/acceptance/s03/closeout-20261004-01/accepted-scope-01.json`；原 review `production/evidence/s03/acceptance-01/independent-review/INDEPENDENT_REVIEW_RESULT.json`，SHA `5c36c11da58b739a84a089ae5bc1c90aa8c3b079f3b9cfe5c2ca90644d25c565` |
| E04 | S04 I `0c13932150bf1b78f215e25721292962e6c4263a`，R `985357be67cce2f2ecc232e827e83e5cdbb521ab`；7 IDs、11 acceptance families | `production/evidence/acceptance/s04/closeout-20261004-01/accepted-scope-01.json`；review `production/evidence/s04/review-01/independent-review/INDEPENDENT_REVIEW_RESULT.json`，SHA `c1cb4fd813ba2f78405ba03eb07f1986a0c97021fae2dd3772eeb95001158d2c` |
| E05 | S05 I `aa4c86e20b0b4b54218b9992921578e7f24a28a2`，R `6c3a734325d0db2d924356a9614e971d80a966c8`；DEC003/AC002 十項、固定值011..014、記錄過的 synchronous snapshot reuse | `production/evidence/acceptance/s05/closeout-20261004-01/accepted-scope-01.json`；review `production/evidence/s05/closeout-20261004-01/independent-review/SCOPED_CLOSEOUT_ASSESSMENT-01.json`，SHA `2799350c47ed934ad0b2c4576218f612d2b6d4c12d21ad72c7914d0172da7e15` |
| E06 | S06 checkpoint I `30c867945c992d25956a2a32825de34571f7749e`；self-check，未獨立審查／未 Human accepted | `production/evidence/s06/owner-corrections-01/requirement-mapping-01.json`，SHA `824d1f7591e9bd8e9df7b6562a0b1892598cbd04204424849a55bdd6c920269a`；`impact-and-coverage-01.json`、原 `workspace-entry-01/coverage-final-01.json` |
| E06-history | workspace repair3 I `40af6555f475d37c2da12a630655831f73ef9e33`／R `95a9260f35dd2ad4cdf7bba93d53c35bd5c7170f`；debug repair I `528c4f76149fad6da53c3c4da701cf1e8e121750`／R `571f04a7dcdc1567aff53e530e48170f1a86870c` | `production/evidence/s06/review-04/independent-review/`、`debug-hover-review-02/independent-review/`；僅原 scope，不能轉移到後續 F2/OC candidate |

目前 `implementation-state.json.gateDecisions` 只有 S01 的 `G-UI-CONFORMANCE`、`G-EXTENSION-PANEL` 為 `resolved-for-scope`；其他 historical records／決策不得被推成 global closure。

**S01–S12 殘留總表**

| Slice／requirement families | 已有覆蓋 | 未交付／仍需驗證 | 接續條件 |
|---|---|---|---|
| **S01**，21 IDs；WQ-document、selection、model/edge-command、parameters、presentation、code-view；NQ expression/vector/conversion/source/structure/dynamic/core；AT-S01-01..08 | E01 完成最小 host-free flow；後续 S02–S06 有 affected regressions | 未承諾全 catalog、TD GLSL、physical GPU、完整裝置／extension UI。舊 2.0 acceptance 不自動證明 final 2.1 全整合 | 保留 regression foundation，無需重開已接受最小 scope；增廣殘留歸相應 S05/S06/S08/S12 |
| **S02**，17 IDs；WQ-document/import-review，NQ-core；AT-S02-01..04 | E02：inspect/review/cancel/atomic replace、opaque exact missing modules、limits、PNG | **AT-S02-03 legacy conversion NOT DELIVERED/BLOCKED，既有 Classification A 保留**；revision→pin mappings、Texture split、TOP source normalization、historical generated-output compatibility 未交付。其他 browsers／native entry limits 未全驗 | 先建立明確逐 case mapping、conversion/provenance/oracle；不可 Registry latest fallback。若改／取消已知 legacy success 才需產品決策；真正 boundary conflict 保留反例走 AC。只阻該 branch |
| **S03**，24 IDs；WQ-subgraph/admission、nested-navigation、structures、clipboard，NQ structure/dynamic；AT-S03-01..04 | E03 all mapped IDs 的原 bounded scope；shared/nested callers、typed closure、stale scoped target | 大圖性能非普遍保證；nested UI 的更廣 IME／device／accessibility 仍是 S06；source/native families、full catalog 另列 | portable extension／UI 可繼續，無待決 Personal policy |
| **S04**，7 IDs；WQ-library、subgraph、clipboard；AT-S04-01..03＋AT-DEC-GRAPE-002-01..08 | E04；DEC002/AC001 conversion、DEC004 四類 Personal roundtrip、2.1/codec-v2 | broader built-in libraries、native directory/storage、platform-wide permissions、native shader helpers 未交付；「nested」不含新增 arrays-of-arrays | **G-PD-1 已由 DEC004 選定，勿再問**。native/library expansion 按實際 profile補；不得將本 bounded policy 解讀成 arbitrary Host resource portability |
| **S05**，391 IDs；19 NQ families；AT-S05-01..04 | E05 精確固定值011..014，DEC003/AC002 十項與 supporting corrections；S01/S03/S04 已提供其他局部 mechanism | 非選定 catalog leaf/modes、各 profile support、native helper／physical GPU、完整 CQ01..23；不能把 Multiply 的 S01 subset 當142個 variants皆完成 | portable family 逐批立即工程；native first integration 需 S07/S08 outputs，但不阻 portable |
| **S06**，108 IDs；下表完整 family清單；AT-S06-01..04 | 目前11個 bounded UI leaves＋F2/OC 修正候選；E06-history 僅舊 scope | full workspace、ordinary extension runtime、多 Parameter routing、layout/presets、完整 shortcuts/actions、numeric/IME、touch、clipboard/fullscreen/leave-page、broader catalogue metadata；AT-S06-03 待 PD2 | 先 B00 current exact review，然後 B01 public workspace。PD2 只阻 named-retention policy；其他 UI 不必等 |
| **S07**，11 IDs；HQG-BOOTSTRAP：HOST001–003、008–013、021–022；AT-S07-01..03 | checkpoint 無 S07 product acceptance evidence；source inventory也未見 native provider implementation | discovery→identity→authority→exact Target、cancel/failure/reconnect/stale epoch、share descriptor；native windows | basic exact-target route可工程；PD3 只阻 foreign-manager fallback，PD4A/B各自阻 native-window policies；真 Host permission/locality须實證 |
| **S08**，17 IDs；HQG-ARTIFACT/AVAILABILITY、WQ-host/code-view/import-review；AT-S08-01..04，另 DSH04/05/07/08/10 | shared snapshot/generation/import boundaries 局部已存在，非 native Apply acceptance | Updates、snapshot-coherent artifact/schema/document、prepare/commit/receipt、last-good、rollback/indeterminate、Reload Applied、native save、late results | 依 S01 snapshot＋S07 basic Target；首個 native feasibility 必須真 TD 后再擴；PD3/4 分支不用先完成 |
| **S09**，37 mapped IDs 含 deferred UI100；HQG-VALUES/CONTROLS/NATIVE-HISTORY、WQ-source/host；AT-S09-01/02＋AT-DEC-GRAPE-001-01..10 | Graph-domain history foundation；無 Host/live/native acceptance | typed live/CAS、control definitions、Export/Bind/external ownership、shape change、own-domain Undo、10,000 observations、stale basis/ABA/divergence、confirmation/retry/no-op | existing Target live-control可從 S07 接續；僅跨publication/reload branches依 S08。**AT-S09-03/UI100/Mixed History 不實作** |
| **S10**，HOST023–035 HQG-PREVIEW；AT-S10-01..04 | 無 production preview acceptance | candidate/current handoff、leases、MAT/TOP routing、Home、touch/normalized input、capture/heartbeat cleanup、Viewer descriptions、native Undo/persistence、stream/cook/resize | 依 S07明確 Preview Target；capture-hold與 Apply交會才依 S08；真 TD/GPU/TOE/device必要 |
| **S11**，HOST004–007及NODE378–391；HQG-ARTIFACT/NQ-subgraph；AT-S11-01..03 | local subgraph及function framework可用；無四模板/native independent artifact acceptance | 四份可編輯 templates、neutral texture fallback、material formulas、native menus optional route、TOE/TOX冷啟動、manager removal/re-add | 依 S03、S05「模板實際用到」族、S08 publication；不必等全部391 leaves |
| **S12**，17 IDs；availability/bootstrap、document/library/host、canvas/clipboard/presentation；AT-S12-01..03 | static-web Windows/Linux的 bounded artifact startup；不等於 S12完成 | declared static/Node-hosted/Electron packages、provider availability、权限/locality、cross-machine、断外网/停TD/清cache分離 | 可從 S01旁支開始packaging；最後匯合各已驗行為。typed unavailable必驗，但不能拿它取代宣告必支援能力 |

**S05 完整 family 範圍**

所有 ID 下列省略共同前綴 `LC-NODE-`；每項定位於 `capability-coverage.json.entries[].mechanismFamily`，逐 mode 再查 canonical `operationSpec`。除上述 exact historical scopes，其餘不得推定已交付。

| Family | IDs |
|---|---|
| NQ-annotation | 009–010、375 |
| NQ-array | 082–085、088 |
| NQ-constant | 044、053、364 |
| NQ-conversion | 004–005、064–065、362、373 |
| NQ-core-contract | 365–367、370 |
| NQ-custom-code | 046 |
| NQ-derivative | 174–182 |
| NQ-dynamic | 001–003、007–008、070、369、374、376 |
| NQ-effect | 041、357–360、372 |
| NQ-expression | 011–031、054–060、094–173 |
| NQ-geometry | 037–040、231–244、333、337–340 |
| NQ-lighting | 328–332、334–336 |
| NQ-matrix | 006、071–081 |
| NQ-native | 061–063、066–069、183–230、245–259、341 |
| NQ-source | 034–036、042、045、087、091–092、363 |
| NQ-structure | 086、093、361、368 |
| NQ-subgraph | 378–391 |
| NQ-texture | 043、089–090、260–327、342–356、371 |
| NQ-vector | 032–033、047–052、377 |

額外不可漏列的 CQ residuals，精確來源是 E05 accepted-scope 的 `residualGates.cqReadiness`：

- CQ01–04：array/matrix、nested nominal、malformed composite、specialization/native constant。
- CQ05–09：helper collisions、effect ordering、sampler/texture ownership、native MAT varying/double、resource families。
- CQ10–14：readonly callback/mutation isolation、全部 port disappearance/recovery、原 probe breadth與真GPU、source resize Undo/native resolution、malformed dependencies。
- CQ15–19：Router inference、remove/reinstall/provider conflicts、catalog admission/import/paste、native array shape、operation/type conversion combinations。
- CQ20–23：independent Graph/provider conflicts、derivative/dynamic/backend capability matrix、physical shader line spans/native receipts/cache Apply、dynamic interface policies。

這些是有界 readiness 的殘留，不是應另建一套 core，也不是原型測試可替代產品 acceptance。

**S06 family inventory**

ID 省略共同 `LC-UI-` 前綴，DATA 明列。

| Family | IDs／殘留定位 |
|---|---|
| WQ-layout | 060–066、095；Default/Minimal、dock/tabs、resize、named presets、floating等；PD2僅063 retention |
| WQ-selection | 001–007、014、045 |
| WQ-canvas | 019–024 |
| WQ-model-command | 008–011、013、015–018、032–033、037–041、086、089 |
| WQ-edge-command | 025–031、036、046、088 |
| WQ-parameters | 042–044、047–057、087、093–094 |
| WQ-presentation | DATA024–025；034–035、058–059、067–075、080–083、090–092、098 |
| WQ-code-view | 076、078–079、099 |
| WQ-clipboard | 084–085 |
| WQ-source | DATA014–015、020、022、026、063 |
| WQ-document | DATA054 |
| WQ-action-proxy | 097 |
| AQ 個別族 | 012、077、096 |

目前 `workspace-entry-01/coverage-final-01.json` 只明列 **034、035、036、072、073、081、082、083、090、091** 的 scoped branches，加 natural Escape repair。其明示殘留包括：

- 081：缺 secondary-category ordering/template metadata；Personal 仍獨立 dialog，非 unified catalog。
- 082：缺 GLSL-name/tag/secondary-category metadata與自動 fixed-type aliases。
- 072：更廣 P/X/navigation shortcuts未暴露。
- 073：無 arbitrary Toolbar Panel／user-configured layout/presets。
- 090：未提供 submenu，其左右鍵分支未交付。
- 091：無 Host shader-applied/native receipt UI。
- touch evidence為 Chromium emulation，非 physical-device qualification。

**Gate 分流**

| 類別 | 精確 Gate／處置 |
|---|---|
| 已有產品決策，勿再問 | `G-PD-1`／`G-LU-DATA-007`：DEC004已選 literal/source/input-bound/nested四類，E04/E05有 bounded證據；保留 native／unsupported-type限制 |
| 真待決產品分支 | `G-PD-2`／LU-UI-005：>100 named presets retention與「保存成功」意義；`G-PD-3`／LU-HOST-002：foreign manager adoption；`G-PD-4A`：Viewer入口可見性；`G-PD-4B`：Parameters remote window scope；checkpoint decisionReferences未見另行解決 |
| Release promise gate | `G-DOCUMENT-STABILITY-COMMITMENT`：對外支持起點／期限／範圍未定。阻宣傳／依該承諾的 release，不阻 internal工程，也不容同版本暗改語意 |
| 已有阻塞但須精確診斷 | `G-VERSION-COMPAT`：E02保留 Classification A；缺 approved mappings/oracles。先界定case與反例，不能憑該標籤宣告全部工作需 Human；取消既有 success或證實契約衝突時才路由決策／AC |
| 可工程取得證據 | DATA001/002/004、NODE002/005、UI002/003/006/007/008/009、EXTENSION-PANEL/WIDGET-SCOPE、UI-CONFORMANCE：browser、guard、entry、lifetime／race矩陣。真IME／device分支須對應實機 |
| 數值／算法，非自動產品Gate | NODE003 Matrix unchecked OOB、NODE004 Voronoi有限搜索。保留現有oracle，做reference與GPU比較；不得自行加clamp／另換算法。需改行為才提產品選擇 |
| 真 Host／GPU／native | DATA003/006、NODE001、HOST001/005/006/007、AUDIT001/002、DEPLOYMENT-CONFORMANCE：實際 TD build、GPU、Par/OP、TOE/TOX、readback、fault injection、cold reload、native Undo／package locality。mock只能證其自身範圍 |
| 舊輸出差異調查 | NODE006／AUDIT003：逐fixture分辨shell/meta/symbol差異與語意差異，不重錄golden掩蓋；需產品改義才詢問 |
| 已定責任／來源隔離 | HOST003：舊文件不等於現行runtime限制；HANDOFF-CQ-OWNERSHIP：sourceSummary持續quarantine，逐batch守Graph／Application／readonly Generator |
| 明確排除 | MIXED-HISTORY／UI100／AT-S09-03 deferred，不能以分域測試關閉 |

**OC09 與 S08 Updates 的交集**

精確撤回來源：`production/evidence/coordinator/s06/owner-corrections-01/human-control-01.json` 的 `disposition.withdrawn[id=OC09]`：

> “Withdrawn; manual generate remains. No auto-generation/Updates/incremental compiler work authorized by subsequent informational question.”

因此：

1. 此次 S06 的手動 Generate／Shader Output 行為保持；不得因舊碼顯示或資訊性問答加入自動生成。
2. 原始 IH-005 `02_ARCHITECTURE_SPEC.md §5` 明定 Graph-scoped Updates、manual／operation-end 分離、每profile最多一running compiler＋replaceable latest demand、stale completion basis、cache/current validation、同snapshot code/schema/document；`05 §1/4` 與 AT-S08-01/04仍保留。
3. 本次 continuous authority授權原契約未完成工作，並不等於恢復 **OC09「改預設為自動生成」**。可先實作／驗證 manual demand、cache、stale results與publication separation；operation-end機制不能偷改目前 S06 的默认UI。
4. 若下一個具體 S08批次必須決定「何種產品入口啟用 operation-end，會否改目前手動預設」，應保留這個狹窄交集並向 Owner澄清，不得自行把整個 Updates删掉或把withdrawal當全域禁令。incremental compiler optimization也非僅由此撤回問答而新增的功能要求。

**建議派工順序**

1. **B00：current S06 I30c8679 的 exact independent review／必要修復。** 包含 F2-only、inspection isolation、OC01..08/10、DEC005、natural Escape、受影響S01–S05 regressions；舊review不轉移。
2. **B01：S06公開 Workspace 多Panel routing／生命期小批。**
3. S06可決 UI枝幹：dock/resize/floating、普通Panel/Widget、numeric/draft/guards、catalog metadata/search、remaining actions／clipboard／notes／frames；named retention單獨等PD2。
4. S05 portable families逐小批；可先選 Sine `LC-NODE-018`＋Cosine `LC-NODE-028`，各只有float/vec2/vec3/vec4四mode，完整UI→edit/connect→generate→save/reload→Undo及數值驗證。比 Add/Multiply 起步更有限：Add有70 variants、Multiply142，不能將四個float/vector modes冒充整葉。
5. S02 legacy mapping／conversion residue持續整理，按所需catalog逐段實作；不阻S06／portable S05。
6. S07 exact Target基础＋S12实际provider/package边界；PD3/4与基本身份连接分开。
7. S08第一個真native prepare/commit/readback/failure小批，先證可行性再擴。S09已有Target live/control可不等全S08；跨publication/reload分支再匯合。
8. S10 preview、S11所需shader族与四templates，最后S12矩阵与final integrated evidence。缺真实环境时保留受阻coverage，继续无关工程；不可声称全契约完成。

**B01 可直接转成派工封包的边界**

- **范围**：AT-S06-01/02相关枝干；两Canvas、两Parameter；linked/unlinked/fixed/follow路由；Tab activate/move/hide/close/retarget；公共普通Panel注册与placeholder/retry；layout state保存／restore的对应小范围。
- **基础**：checkpoint已有 `production/src/ui/workspace.ts` 的 `open/activate/retarget/move/hide/close/exportState`；`production/apps/web/main.ts` 目前固定一个Inspector、addCanvas及固定pane targets。先复用已存在public seam，把可操作入口／残留行为补齐，不另立workspace基础。
- **必须证据**：相同Graph、独立Context；routing在observer前一致；draft/IME不丢／不偷commit；move/hide取消该Panel未完成pointer gesture而不取消所有draft；close/retarget preflight；旧mount／same-ID重开／late callbacks不能恢复authority；restore只能重新解析authority；纯layout不改Graph/dirty/History/Redo。
- **对应规范**：`04 §4–5`、`05 §5–6`、`16`、`17`；`G-EXTENSION-PANEL`、`G-EXTENSION-WIDGET-SCOPE`、`G-UI-CONFORMANCE`；LC-UI-060/061/064仅相关枝干。
- **明确不在此批**：named >100 policy、OP/Preview真Host、OC11 stacking、一般Add/Browse初始落点延后项、完整Default/Minimal八Panel或整个S06 claim。
- **依赖**：B00获得有效独立技术结果后，绑定新reviewed engineering baseline、唯一writer、exact expected work head；不需新的每Slice Human start。若重启已completed Slice残留，先保存原completion entry的immutable reactivation receipt。

LAN/Tailscale旧archive checks保持历史 `NOT_EXECUTED`，已非当前／未来delivery前置；这项撤除没有解除S07–S12自身的Host、真实设备、provider/locality或native runtime契约。
