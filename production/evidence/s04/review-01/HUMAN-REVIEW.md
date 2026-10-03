# S04 Human review

**AWAITING_HUMAN_ACCEPTANCE — 技術審查 PASS，尚未接受或完成。**

「Grape Coordinator」底下的子代理「/root/s04_fresh_review_01」在新 context、獨立 checkout 完成審查，報告 `S04-FR-985357b-01` 給予 **PASS**；findings、remainingFindings、requiredEvidenceGaps 均為空。本文件由「Grape implementer」底下的子代理「/root/s03_implementer_resume」整理索引，沒有代寫或改動審查結論。

| 綁定 | 精確值 |
| --- | --- |
| Implementation I | `0c13932150bf1b78f215e25721292962e6c4263a` |
| Reviewed R | `985357be67cce2f2ecc232e827e83e5cdbb521ab` |
| Build | `S04-web-0c13932` |
| Build archive SHA256 | `24b1420e04871cd76cc2a3745b1d7100aadba43db632dfa809975327e312d3b1` |
| Original report SHA256 | `c1cb4fd813ba2f78405ba03eb07f1986a0c97021fae2dd3772eeb95001158d2c` |
| Original review manifest SHA256 | `45d5220f07dcfd94b31313c758f0f87a285d7d28aad9eeb0a766543d14b449ad` |

本次 evidence persistence commit **P 僅保存證據**；技術 PASS 永遠綁定上述 I/R，不改綁 P，也不是完成登記 B。

## 查看與試用

- [原始獨立報告](independent-review/INDEPENDENT_REVIEW_RESULT.json)：原作者、路徑、結論與 bytes 全部不變。
- [原始 70 檔證據清單](independent-review/review-evidence-manifest-01.json)及[72 檔搬移對照](relocation-manifest-01.json)：清單中的原路徑可由對照定位保存副本；未複製 npm-cache 或未列入內容。
- [正式建置封存](../submission-01/candidate-web-01.tar.gz)及[建置清單](../submission-01/build-manifest-01.json)：Reviewer 重新建置、解壓及以實際封存執行 UI，三個產物檔案均相符。
- [既有中文操作導覽](../submission-01/HUMAN-WALKTHROUGH-01.md)、[合法／拒絕範例清單](../submission-01/sample-manifest-01.json)、[實作對照](../submission-01/coverage-01.json)：原材料維持不變；本索引補充其後已完成的獨立審查。

建議先以正式封存嘗試 Float／vec2／vec3／vec4 接入 Image Output、Undo／Redo，以及 Personal 保存、重複插入、Make independent、匯入缺依賴範例。Personal 插入前，目的 Graph 必須已完整有效，例如先將 Float 連到 Image Output；既有錯誤不會被匯入順便修復。

## 已獨立 PASS 的十一個家族

| 家族 | 審查涵蓋行為 |
| --- | --- |
| AT-S04-01 | 同版本重用、語意編輯分離、直接 Independent、完整 owner payload、Graph 快照與 Library 生命週期分離 |
| AT-S04-02 | literal／source-bound／input-bound／nested 四類完整 typed closure、往返及生成；缺依賴、錯誤 scope、循環等整筆拒絕 |
| AT-S04-03 | 可讀檔名、碰撞不覆寫、內容去重、單檔失敗隔離及實際 IndexedDB 限額／競態 |
| AT-DEC-GRAPE-002-01 | 16 組轉換的實際 WebGL2 數值結果；scalar broadcast、截斷、Z=0／W=1 |
| AT-DEC-GRAPE-002-02 | 一來源多目標，來源資料、型別、port 與既有 edge 不變 |
| AT-DEC-GRAPE-002-03 | 真實 Canvas 四種形狀至 vec4 Output；Undo／Redo 恢復原連線及 plan |
| AT-DEC-GRAPE-002-04 | exact port、未知型別、偽造 plan 及失敗替換的拒絕／原子性 |
| AT-DEC-GRAPE-002-05 | 共用型別權威，Graph admission／hydration／revalidation 與 Generator 一致 |
| AT-DEC-GRAPE-002-06 | v1／v2 語意與 extensions 經保存、重開、clipboard、共享／巢狀及 Personal 保留 |
| AT-DEC-GRAPE-002-07 | 2.0／2.1 與舊 reader 矩陣、明確 envelope upgrade、未知／損壞及 inactive 證據邊界 |
| AT-DEC-GRAPE-002-08 | 舊精確 module 不變；新 module 身分分開；缺失定義不按同名替代 |

Reviewer 重跑 179 項單元／conformance、54 項 browser、10 項 bootstrap fixture，以及 typecheck、build、root/state/diff 等必要檢查；另有 9 組自寫反例與正式封存 UI smoke。獨立 identity audit 的 789 個比較沒有差異。獨立工具 fixture 維護亦 PASS，原 verifier 與 handoff 未改。依賴安裝紀錄保留兩项 advisory（low／high）；本審查未執行依賴升級，不是待修 finding。

## Human 驗收範圍與限制

- 僅實際 Windows x64、Node 25.5.0、Playwright 1.62.1、Chromium 151.0.7922.34、1440×1000、WebGL2 環境；renderer 字串為 **WebKit WebGL**。沒有實體 GPU、其他瀏覽器／裝置、原生檔案目錄、Host／TouchDesigner／Electron 的資格承諾。
- Personal 插入要求目的 Graph 完整有效。input-bound 套件保存定義預設值，外部 caller override 留在 occurrence state；共享定義需一致的 constant-binding identity。nested 是巢狀 Graph／引用 scope，不是新增 arrays-of-arrays。
- Library 限額為 64 檔、256000 bytes／檔、4000000 total bytes。IndexedDB ACK 代表交易完成，不代表 crash、磁碟或雲端耐久性；沒有任意 extension／profile 或完整 Legacy catalog 資格。
- S02 AT-S02-03 Legacy converter 仍 **NOT_DELIVERED／BLOCKED**；G-VERSION-COMPAT、外部文件穩定性期限承諾仍未解決。DEC-GRAPE-001 保留 domain-separated History，沒有 global Gate closure。
- **完整 DEC-GRAPE-003／AC-GRAPE-002 function-mode 尚未交付**，十個驗收案例仍 REQUIRED_NOT_EXECUTED。只有文件登記及 owner 資料保存經審查；early S05 草案仍 UNISSUED。較廣 catalog、S06 UI／accessibility／device 矩陣均不在本次交付。
- 舊 exact definitions 不變，沒有 silent upgrade。效能證據只有一次 200-float model sample，不是 frame-rate 或無限規模承諾。未宣稱在原位執行完整 frozen qualification。

請 Human 依上述 **原 I/R/build、十一家族與限制**驗收。當前 state 仍是 S04 active，acceptedEvidence／completedSlices 只有 S01–S03；本保存任務不授權接受、完成、關 Gate、推送、PR、合併或啟動下一 Slice。
