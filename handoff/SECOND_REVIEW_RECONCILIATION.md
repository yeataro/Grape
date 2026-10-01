# RECONCILIATION VERDICT

**READY FOR INDEPENDENT RE-REVIEW**

此處是修訂送審處置，不是 HANDOFF PASS，不開始 S01。最終執行證據見 [validation](audit/SECOND_REVIEW_VALIDATION.json)；若該記錄未完成或失敗，本處置不得使用。唯一新增 owner decision 是 **G-DOCUMENT-STABILITY-COMMITMENT**：何時對外承諾穩定可讀；它不阻塞技術格式與局部修訂送審。既有產品／真實環境 Gates 保留。

## 比對基準與判定方法

- 第二份審查的 target 是 **IH-001**；provenance（Claude Code v2.1.287 / Opus 5.5 / Claude Pro / fresh context）來自使用者，並非本輪自行驗證。原文件完整收於 [review](provenance/second-independent-review-IH-001/HANDOFF_INDEPENDENT_REVIEW.md)／[brief](provenance/second-independent-review-IH-001/OWNER_REVIEW_BRIEF.md)。
- 本輪先對照已修 **IH-002**，再只修改殘留的 B1/B2/M2–M6；M1 與巢狀 Inspector 不重新設計。新修訂是 **IH-003**，AC-002/IR-001/CQ-001/MRDP-001 及兩份舊 Handoff 保持封存。
- 下表的 Current status 是 **收到 review 時對 IH-002 的判定**。本輪修掉的 STILL VALID 不偷改成「上一輪已解除」；Action 與 validation 說明 IH-003 結果。ALREADY RESOLVED 僅用於既有證據。補充評估列不與其所引用 finding 重複計數。
- 有編號的 14 項中，M1 已由上一輪完整解除；另有重疊的 nested Inspector（EXT-D）已解除。m2 已補可發現性但少完整自動索引驗證，故仍列 PARTIALLY RESOLVED；m6 原本就非缺陷且已正確限縮，不計成新修復。

## 逐項 reconciliation

| Finding | Original severity | Current status（IH-002） | Current evidence / canonical contract | Action taken / no action | Remaining risk（IH-003） |
|---|---|---|---|---|---|
| B1 | BLOCKER | STILL VALID | IH-002: 04 §2 references prototype contracts while 02 permits names/algorithm changes; no exhaustive normative/bounded ledger. [契約](13_PRODUCTION_CONTRACT_SURFACE.md) | AC-IH003-01: explicit contract ledger + open seam contracts; reference/API naming and shape boundaries classified. | Production must apply ledger to its own APIs and qualification tests; no arbitrary-language backend promise. |
| B2 | BLOCKER | STILL VALID | IH-002 canonical examples only identify grape-core-experiment/td.top/td.mat; no production format/version/unknown field policy. [契約](14_DOCUMENT_FORMAT.md) | AC-IH003-02: production format, exact kind refs, version/forward/legacy policies and codec qualification; external stability milestone isolated as Gate. | G-DOCUMENT-STABILITY-COMMITMENT blocks external permanence promise, not technical schema or internal S01. |
| M1 | MAJOR | ALREADY RESOLVED | IH-002 AC-IH002-01 and B01-CE/B01-01–17, HP01–04: shared PanelWorkspace register/open/resolve/route/restore/close/dispose; no central Panel type switch. [契約](executable-reference/repair/PANEL_COMPOSITION_CONTRACT.md) | No Panel architecture change; rerun existing direct regression. | DOM mounting/focus/device evidence remains gated. Do not follow review suggestion to narrow the Gate only to untrusted extensions; trusted modules are not sandboxed. |
| M2 | MAJOR | STILL VALID | IH-002 Node/Panel semantic contracts and screenshot labels do not define module-owned label/category/help/i18n registration. [契約](15_LOCALIZATION_CONTRACT.md) | AC-IH003-03: feature-owned metadata and locale contributions, deterministic fallback, builtin uses same seam, UI preference separated from model. | Not a translated product corpus or guarantee of arbitrary plural/format engines; actual visual locales qualify in product slices. |
| M3 | MAJOR | STILL VALID | IH-002 preserves fixed ServiceName, td.* GraphKind and vertex/pixel rendering bounds without public production counterpart. [契約](13_PRODUCTION_CONTRACT_SURFACE.md) | Within AC-IH003-01: registered GraphKind/StageKind and namespaced typed Host capabilities; GLSL profile stage map, explicit unsupported results. | Opening a seam does not implement or qualify every topology/ISF/GPU profile. Passes remain kind/profile configuration. |
| M4 | MAJOR | STILL VALID | IH-002 check-boundaries allows mutual pure-role imports; private subsystem and mutable-model dependencies are not rejected. [契約](09_ACCEPTANCE_AND_CONFORMANCE.md) | Add production-specific public-export/owner/rights dependency checker, changed-file restriction and negative fixtures; old reference policy remains historical. | Manifest truth, injected runtime services, callbacks/casts/reflection still require review and behavior tests. |
| M5 | MAJOR | PARTIALLY RESOLVED | IH-002 README prohibits stacking product features in reference, but examples import qualification classes without a complete production-surface mapping. [契約](13_PRODUCTION_CONTRACT_SURFACE.md) | Explicit no copying qualification implementation/classes/bounds as production foundation; map each example to public contract. | Behavior tests may be ported only with production API and semantic evidence; prototype tests do not accept production. |
| M6 | MAJOR | PARTIALLY RESOLVED | IH-002 N03 has external current locator with baseline/slices/Gates/accepted evidence; no structured Decision/AC references. [契約](08_IMPLEMENTATION_PLAN.md) | Progress schema 2 adds decisionReferences and baseline accepted decision refs; hashed evidence, no update to frozen coverage. | No approval authentication or multiwriter PM service; single maintainer and reviewer validate accepted records. |
| m1 | MINOR | STILL VALID | IH-002 07 ACK save vs 08/data download description is ambiguous although AT-S01-07 distinguishes ACK. [契約](08_IMPLEMENTATION_PLAN.md) | Align 08/09/data S01 with ACK storage reopen AND independent download/file reopen; minimum saved-record selector clarified. | Browser storage persistence/per-device guarantees still need real runtime evidence. |
| m2 | MINOR | PARTIALLY RESOLVED | IH-002 N01 adds README/SCREEN_INDEX links, 179-file index and screenshot hash guard; generic checker does not validate full file index membership automatically. [契約](00_README.md) | Keep all eight screenshot-evidence files unchanged; add full index membership/hash verification mode in check-second-review. | Index excludes locked node_modules and duplicate test staging, with exact exclusions recorded. |
| m3 | MINOR | STILL VALID | IH-002 invariant index status applies to bounded mechanisms; 02 confirms higher principles but the distinction is not explicit in machine data. [契約](02_ARCHITECTURE_SPEC.md) | Retain 21 source statuses; add statusScope, four confirmed parent principles and explicit change rules. | Experimental does not mean optional; human product/ownership conflicts cannot be silently changed by D-log. |
| m4 | MINOR | STILL VALID | Review gives concrete compact tokens/applicationcore and mixed-language text. No changed ownership is evidenced. [契約](09_ACCEPTANCE_AND_CONFORMANCE.md) | Fix named ambiguous tokens in touched plan/acceptance docs; no broad editorial rewrite. | Some inherited bilingual wording remains; not treated as formal API or additional spec. |
| m5 | MINOR | STILL VALID | IH-002 production TypeScript/toolchain role inferred from reference, not stated at start. [契約](08_IMPLEMENTATION_PLAN.md) | State TypeScript production, lock actual versions at implementation baseline; Node25 reference is not runtime requirement. | Framework/compiler/runtime versions are engineering choices recorded in current baseline. |
| m6 | MINOR (scope note; not a defect) | INVALIDATED BY CURRENT DESIGN | IH-002 FCS explicitly says bounded self-check and independent acceptance pending; original reviewer also calls honest disclosure not a defect. [契約](audit/previous-IH-002/FRESH_CONTEXT_SIMULATION.md) | No repair to make self-check independent; retain label and request fresh external re-review. | This reconciliation is author-side, not independent acceptance. |
| POSITIONING | POSSIBLE DRIFT | PARTIALLY RESOLVED | IH-002 ownership is explicit and HC-001 quarantined; persistent td.* experiment identity can still leak if copied. [契約](14_DOCUMENT_FORMAT.md) | Product document identity separated from Host profile/target, copy ban and ledger; no owner moved. | HC-001 remains historical-source wording conflict; external Host runtime evidence unchanged. |
| EXT-A | EXTENSION PARTIAL | STILL VALID | Ordinary Node semantic path exists; B1/M2 metadata/normativity unresolved at IH-002. [契約](04_EXTENSION_MODEL.md) | B1/M2 repair closes the remaining ordinary extension surface; no Node-specific core branch. | Complete formula catalog not qualified by sample. |
| EXT-B | EXTENSION STRONG (no defect) | ALREADY RESOLVED | Fixed/dynamic Node share NodeModule, ports/state codec/reconciliation and Undo; reviewer found no defect. [契約](04_EXTENSION_MODEL.md) | Preserve existing tests and contracts; no redesign. | All product Node modes still need slice acceptance. |
| EXT-C | EXTENSION WEAK | ALREADY RESOLVED | IH-002 public Panel composition replaces the IH001 teaching host; same path used by minimal-panel. [契約](executable-reference/repair/PANEL_COMPOSITION_CONTRACT.md) | Same as M1; rerun direct regression only. | Runtime mount/device evidence remains Gate. |
| EXT-D | EXTENSION GOOD / nested Gate | ALREADY RESOLVED | IH-002 AC-IH002-02 scoped target capture contains spec/value/links/type/editToken; routed root/nested projection and commit share lease; M01/BM tests cover two occurrences, stale path/type/disposal. [契約](executable-reference/repair/SCOPED_PARAMETER_CONTRACT.md) | No new nested special case; rerun direct M01/widgets/BM regression. | Browser controls and field-specific runtime rendering remain product tests. |
| EXT-E | EXTENSION PARTIAL | PARTIALLY RESOLVED | IH-002 N02 already restricts backend to GLSL; stage/profile seam still bounded as M3. [契約](13_PRODUCTION_CONTRACT_SURFACE.md) | Keep N02 boundary; add open GLSL profile descriptor/map with capability validation. | No arbitrary-language substitution, no invented per-pass network or universal stages. |
| EXT-F | EXTENSION PARTIAL | PARTIALLY RESOLVED | Existing adapter/fencing/lifecycle works in IH002 reference; adding a capability remains closed union. [契約](13_PRODUCTION_CONTRACT_SURFACE.md) | Typed namespaced capability contracts from AC-IH003-01; authority negotiation unchanged. | True TD/native providers still gated. |
| AI-WORKFLOW | PARTIAL | PARTIALLY RESOLVED | IH-002 external progress locator already exists; structured decisions missing, as M6. [契約](08_IMPLEMENTATION_PLAN.md) | One schema2 locator; new decision refs, no new PM hierarchy. | Progress truth still requires evidence acceptance and single-writer updates. |
| FRESH-IMPLEMENTER | TWO ARCHITECTURE DECISIONS NEEDED | STILL VALID | B1/B2 absent in IH002 despite sound established model semantics. [契約](13_PRODUCTION_CONTRACT_SURFACE.md) | Resolve engineering decisions here, no delegation of schema/API invention to implementer. | No authorization to begin S01 in this task. |
| UI-HANDOFF | PASS LIMITED TO S01 | ALREADY RESOLVED | IH002 UI spec + indexed five original screenshots sufficient bounded initial reference; missing advanced/mobile/error states already Gate. [契約](ui-reference/SCREEN_INDEX.md) | No UI redesign and no screenshot rewrite. | Actual device/browser rendering is not proved by screenshots. |
| HUMAN-STABILITY | HUMAN PRODUCT QUESTION | STILL VALID | Neither IH001 nor IH002 records when public long-term document compatibility promise starts. [契約](14_DOCUMENT_FORMAT.md) | Record G-DOCUMENT-STABILITY-COMMITMENT with precise earliest decision; schema technical definition completed. | Owner still must choose S01 guarantee vs identified later milestone; no hidden default. |

## 阻塞範圍與責任類型

| Finding | Classification | Fresh implementation blocking scope at intake | Human product-owner decision genuinely required |
|---|---|---|---|
| B1 | architecture | Yes: public API implementation needs a fixed interpretation. | No |
| B2 | architecture | Yes: first canonical save/reload. | Yes — only stated product promise; technical repair not delegated. |
| M1 | architecture | No current public composition blocker. | No |
| M2 | architecture | Yes: ordinary visible Node/Panel extension would otherwise invent a central catalog. | No |
| M3 | architecture | Blocks new kind/capability/profile extension, not existing Graph ownership. | No |
| M4 | tooling | Blocks automated production conformance claim. | No |
| M5 | documentation | Blocks unambiguous choice of production foundation. | No |
| M6 | workflow | No baseline-locator blocker; missing decision continuity before first changed baseline. | No |
| m1 | documentation | Only exact S01 acceptance interpretation. | No |
| m2 | tooling | No current screenshot discovery blocker. | No |
| m3 | documentation | No owner conflict; classification ambiguity. | No |
| m4 | documentation | No. | No |
| m5 | documentation | Engineering ambiguity only. | No |
| m6 | workflow | No. | No |
| POSITIONING | architecture | Only identity leakage risk, not an observed Host ownership regression. | No |
| EXT-A | architecture | Visible extension composition depends on B1/M2. | No |
| EXT-B | architecture | No. | No |
| EXT-C | architecture | No current architecture blocker. | No |
| EXT-D | architecture | No scoped read/write contract blocker. | No |
| EXT-E | architecture | New GLSL topology/profile scope only. | No |
| EXT-F | architecture | New capability registration only. | No |
| AI-WORKFLOW | workflow | Decision continuity before first changed implementation baseline. | No |
| FRESH-IMPLEMENTER | architecture | B1/B2 technical seams before S01. | No |
| UI-HANDOFF | documentation | No new initial UI reference blocker. | No |
| HUMAN-STABILITY | workflow | Only external compatibility promise/release affected. | Yes — only stated product promise; technical repair not delegated. |

## 兩份 review 的共同證據

Panel：兩份 review 都指出 IH-001 的 template/public workspace 不閉合；IH-002 已有 AC-IH002-01、共同 PanelWorkspace、TargetService、ObservableContext、canonical example 和直接負向測試。本輪沿用、重新回歸，不以舊 finding 宣稱目前仍缺 seam。

Inspector：第一份 M01 與第二份 EXT-D 提到 nested projection/write 的缺口。IH-002 AC-IH002-02 的同一 target lease 負責 spec/value/link/type/projection/write，涵蓋 shared definition 的兩個 occurrence、stale path、interface change、dispose。本輪不讓 renderer 遍歷 resources 補洞。

Prototype／正式實作界線：IH-002 已禁止在 reference 堆產品，但兩份提醒共同顯示 API normativity 與範例 imports 仍可誤讀。本輪 ledger、copy ban 與正式 schema 處理這個剩餘缺口，沒有移動 Graph/History/Host ownership。

## 新增與未新增的決策

[變更紀錄](audit/SECOND_REVIEW_CHANGES.md) 明列三項 Architecture Change；dependency tooling／進度 schema 是 engineering enforcement，不另創核心責任。沒有新增 product-positioning drift，反而隔離 experimental td.* identity 的移植風險。HC-001 舊來源文字衝突仍在既有 Gate，不被本輪偷偷改寫。

必須保留的界線：tests PASS 是有界 qualification；不是全部語言翻譯、正式產品、任意 backend 或真 TD/GPU/browser matrix 通過。所有 production slices 仍未開始。

## 最終實際結果

完整 regression **354/354 通過，零失敗／跳過**，strict TypeScript 通過。新增直接案例共 72：public surface/ledger 15、document format 17、localization 17、production boundary 19、Decision/AC progress 4。上一輪與封存測試仍全部保留。IH-001 143、IH-002 179 個已索引檔案 hash 驗證未改；618 dispositions／33 UNKNOWN／8 PDR leaves 未變。

送審前未發現尚未處理的 B1/B2 blocker 或 M1–M6 major。這是作者修訂結論，請 fresh reviewer 特別核對 ledger 的 normative 分類、unknown 結構的唯讀保全、GLSL/open registry 範圍、普通 Node/Panel 的文字贡献與 checker 的明示限界。唯一新增人類決策是外部文件穩定相容承諾時點，既有 runtime Gates 不因本輪解除。
