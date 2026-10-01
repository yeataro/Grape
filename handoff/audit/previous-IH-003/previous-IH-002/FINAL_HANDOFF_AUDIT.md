# IH-002 — Repair qualification for independent re-review

Disposition: **READY FOR INDEPENDENT RE-REVIEW**. **不是 HANDOFF PASS。** 本輪未開始 S01、Migration、正式產品實作，也沒有擴大 Legacy archaeology 或 Coverage。

IH-001 的原自評保留於 [previous-IH-001](previous-IH-001/FINAL_HANDOFF_AUDIT.md)，它已受 Independent Review 挑戰，不是本修訂的驗收結論。來源四份 baseline 仍為 AC-002 / IR-001 / CQ-001 / MRDP-001。

## Repair disposition

| Finding | 交付與直接證據 | 本輪判定 |
|---|---|---|
| B01 | [Panel public contract](../executable-reference/repair/PANEL_COMPOSITION_CONTRACT.md)、同一公共工作區的 [minimal-panel](../examples/minimal-panel/README.md)；B01-CE、01–17、HP01–04 | 已提供可重驗修復；independent acceptance pending |
| M01 | [Scoped target contract](../executable-reference/repair/SCOPED_PARAMETER_CONTRACT.md)、[widget example](../examples/parameter-widget-or-ui-contribution/README.md)；M01-RED、01–16、HW01–05 | 已提供可重驗修復；independent acceptance pending |
| B01＋M01 組合 | [BM-01–05](../executable-reference/repair/panel-inspector.test.ts)：普通 Panel → root/nested target → projection/write/Undo；shared occurrences；move/close；fixed pin 跨來源 Context 關閉；stale occurrence；真正 Graph reload 後明示映射新 lifetime | 直接公共 API 組合通過，無 renderer resources traversal |
| N01 | 主 README → SCREEN_INDEX → 原 Legacy screenshot supplement；8 個原始檔案 hash 不變 | Locator-only；不改視覺 evidence |
| N02 | 01/02/04/07/12/START_HERE 將 backend 明訂為 GLSL profile/shell/version/capability seam | 無 arbitrary-language replacement 承諾；無新 backend 架構 |
| N03 | [implementation-state template](../implementation-state.json)、[08 locator](../08_IMPLEMENTATION_PLAN.md#implementation-state)、validator＋11 tests | 外部 current record 尚未建立；not-started，沒有假 slice/evidence |

## 實際完整 regression

命令：從 IH-002 根目錄執行 `node tools/run-handoff.mjs`。使用明示 Playwright provider，沒有跳過 browser tests。可攜工具前置見 executable-reference/README；整體結果見 [RUN_HANDOFF.json](evidence/RUN_HANDOFF.json)。

| Suite | 實際結果 |
|---|---|
| 封存 AC-002 reference | 201 / 201 |
| 新增 B01／M01／BM direct qualification | 40 / 40（18＋17＋5） |
| 更新後 Panel／Widget examples | 9 / 9（4＋5） |
| 原 Node／Dynamic Node／Host examples | 8 / 8 |
| Dependency checker tests | 13 / 13 |
| Implementation-state locator tests | 11 / 11 |
| **合計** | **282 / 282，0 failed、0 skipped、0 cancelled、0 todo** |
| TypeScript | sealed reference、所有 examples、repair modules/tests：strict 通過 |
| Handoff integrity | 全618 capability/345 groups/45 gates/33 UNKNOWN 與來源hash、links檢查通過 |
| Dependency boundaries | 25 個已分類 source 通過；新 application seam 未引入 Node/Electron/DOM runtime依賴 |
| 保護來源 | 37 個封存 reference files hash不變；IH-001 parent143個檔案hash不變；原8個截图supplement檔案hash不變 |

環境：Windows、Node25.5.0、TypeScript5.9.3、Playwright1.62.1、Edge154.0.4258.48／ANGLE SwiftShader。這是真正執行的有限 WebGL probe，**不是 TD、實體 GPU、跨平台 UI、DOM Panel 或產品 acceptance**。所有47個 production acceptance仍 planned。

## 曾失敗的驗證與修復

不因最終綠燈抹去反例。原 B01/M01 缺口各保留 expected-negative case。修復過程另有以下反例：

| 反例／失敗 | 修正與可重驗位置 |
|---|---|
| M01 observer A 在 updated 中 dispose，observer B 先收到 invalidated 又收到舊 updated | terminal dispatch fence；M01-15 |
| value變更後Undo到原值可使舊draft復活 | edit epoch；M01-16 |
| Directory observer 直接改另一 Context，mutation成功但recursive notification被丟棄 | Directory對所有登錄Context公開修改做notification guard；B01-12 |
| pin 原來源Context已關閉時仍用原來源revision判斷是否更新 | 以 effective retained Context/revision判斷；B01-11、BM-03 |
| malformed pin target 已先改 live route 才變 placeholder | 結構驗證移到mutation前；B01-14 |
| open/retry 的 receive失敗後，回傳被dispose的舊Panel或錯誤success | 回傳完整lifecycle之後的實際Panel/status；B01-08 |
| pinned Panel在自身Context通知中失敗，立即cleanup遇到reentrancy | owned cleanup在Context與Directory publication結束後執行；B01-13/16 |
| 第一輪整包checker測試仍預期22files，新增3個repair source後得到25 | 更新本修訂manifest的精確expected count為25，未減少檢查；[失敗輸出](evidence/repair-first-regression/boundary-tests.txt)及[當次結果](evidence/repair-first-regression/RUN_HANDOFF.json)保留 |
| 早期測試fixture用了不存在的Draft.renameGraph，另有nested wrapper遺漏必要boundary | 更正測試fixture使用公開API／合法schema，沒有放寬核心契約；封存source仍exact |

部分前期adversarial probe的逐條原stdout未另存，以上保留其反例說明及直接回歸；不得把它們說成獨立reviewer已接受。最後完整測試原始TAP、hash與環境資訊已保存。

## 邊界與仍需 reviewer 檢查的地方

1. **固定目標的 scope Context lease。** 它與原 Canvas 共用同一 Graph；target service 只持有自己的 Context並集中釋放。請重新檢查 navigation／source disposal／missing occurrence／busy cleanup 的 ownership 與ordering，不可改成每個Panel自建隱藏lookup。
2. **Public contract vs renderer。** 本修訂定義 production-facing contract，但原型仍不是 production。實際 DOM mounting、focus/IME、輸入裝置、Layout尺寸呈現仍需對應 integration evidence；這不是把普通Panel接入工作再丟給實作者發明。
3. **通知與 trusted callbacks。** 已強制的是 owner-local guard、Graph publication guard及不可變描述；獨立Context/dispose通知沒有全域Graph鎖。可信回呼仍負有唯讀義務，不能宣稱惡意模組sandbox。
4. **Restore authority。** 同lifetime可直接解析；跨reload由application提供明示mapping。ordinary Panel不提供自己的identity推測；unknown refs保留placeholder。沒有default同名／第一個物件fallback。
5. **N03不是行政／權限系統。** Validator驗structure/hash/revision/scopedGate引用；不證明acceptedBy的真實身份或證據語意充分。未建立production進度，未解除任何產品Gate。
6. **既有 HC-001。** 原CQ責任摘要衝突仍open-quarantined；本輪未改其来源。33 UNKNOWN、13 significant UNKNOWN、8產品decision leaves、TD/GPU/browser/TOE/TOX等原限制仍保留。

目前沒有已知尚未修復的 B01/M01 直接反例；這不是獨立驗收結論。以上為 reviewer 應挑戰的明示實驗邊界，發現反例應重開對應finding。

## A–I repair self-audit

| 面向 | 本輪可查證依據／界線 |
|---|---|
| A Architecture completeness | 02/04與兩份repair contracts閉合指定缺口；只有兩項記錄的Architecture Change |
| B Responsibility clarity | Graph/History所有權不變；37files hash；scope lease、routing、view state明確 |
| C Extension clarity | 同publicworkspace的ordinaryPanel，無type-name switch；canonicalexamples與BM組合測試 |
| D Implementation executability | 08的verticalslice仍planned；新增契約可供實作，S01未開始 |
| E Legacy traceability | 618/345與封存summaries不變；不讀Legacy implementation補答案 |
| F Gate completeness | 45Gate IDs及33UNKNOWN保留；兩extensionGate只提升contractqualification，runtime未驗 |
| G UI portability | screenshot locator可達且bytes不變；沒有UI redesign；DOM/deviceGate保留 |
| H Executable spec validity | 282tests＋strictTS＋boundary/source checks實際通過 |
| I Fresh-context self-sufficiency | [package-only simulation](FRESH_CONTEXT_SIMULATION.md)提供逐題定位；不是新盲審，仍待independentreview |

所有面向是本次repair提交依據，**不標成自我授予的 HANDOFF PASS**。本輪到此停止，僅交付 independent re-review。