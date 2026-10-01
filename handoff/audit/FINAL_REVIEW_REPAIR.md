# IH-004 · final independent review repair

**READY FOR FRESH RE-REVIEW — 不是 HANDOFF PASS，不開始 S01。** 最終處置與執行證據以 [validation](FINAL_REVIEW_REPAIR_VALIDATION.json) 為準。

## Finding 核對

| Finding | 原 severity | 自行核對 | Root cause | 修訂 |
|---|---|---|---|---|
| FIR-B01 | BLOCKER | 成立 | public Panel 終止在 logical lifecycle；Widget 在 arbitrary projection，缺少 feature-owned view 到共同 renderer 的公開接合，renderer 只好猜 class 或發明 glue。 | AC-IH004-01；[16](../16_VIEW_MOUNT_CONTRACT.md) 與 [declarations](../contracts/view-mount.ts)。 |
| FIR-N01 | MINOR | 成立 | 04 快速入口仍先教 reference validate string／GenerationProfile／HostServices，再要讀者由13修正。 | 04 直接 production-first；舊名只留 Reference mapping。documentation-only，沒有第二次 API redesign。 |

[原 review](../provenance/final-independent-review-IH-003/HANDOFF_FINAL_INDEPENDENT_REVIEW.md) 與 [owner brief](../provenance/final-independent-review-IH-003/OWNER_FINAL_REVIEW_BRIEF.md) 是 independent evidence。IH-003 246個 indexed files 保留於 parent manifest；本輪另建 IH-004，不修改 frozen revision。

## 最小 Architecture Change

新增的 public seam 讓 feature 提供 PanelViewContribution 或 ParameterWidgetViewContribution；shell 以 opaque contribution 調 mount/update/unmount，不認識 feature class，也不解讀其私有 projection。共享的是 mount scope、資源清理、update/async fencing 與 controlled command boundary，不強迫 Panel 與 Widget 成為万能同型物件。

PanelWorkspace routing／target resolution／restore／retarget／move／close guard 保持；新增 lifecycle observation 只使 renderer 能在 logical dispose 前撤銷 mount。Widget 讀写仍經相同 ScopedParameterTarget／draft／editToken；mount 失敗不能成為模型編輯、Undo 或刪除草稿的理由。locale 仍來自唯一 LocalizationService。

不改：Graph canonical truth、Graph History、EditorContext ownership、scoped lookup、field draft語意、Host authority、deployment、文件格式、既定 product positioning。Framework／DOM／CSS 與 virtualization 仍為實作自由。新增 extension 使用 feature module 與普通 registration wiring，不能要求 central type switch。

## 影響範圍

Canonical：02/03/04/05/08/09/10/12/13/15 加入或定位16；00/START_HERE 更新閱讀入口；13的 ledger 增記 view surface。G-EXTENSION-PANEL 不再把 public mount 接合延到 S06：契約是 S01 前置，真 browser 證據依 S01/S06 分段驗。現有其餘 Gates 不關閉。

Executable：public-panel-workspace 的 additive public observation + view-mount qualification + two Panel/two Widget examples；Graph/History/scoped/localization implementation bytes 對 IH-003 hash 保護不變。這些不是 production foundation。

## Qualification 與限制

最終案例／失敗修正／完整 regression 記於 [validation](FINAL_REVIEW_REPAIR_VALIDATION.json)。尚未執行的檢查不得被此文件當成通過。本輪只 fake/headless mounting surface，不聲稱真 DOM／browser／IME／focus／accessibility／TD／GPU 已驗。獨立 acceptance 仍 pending；修訂完成終點是 READY FOR FRESH RE-REVIEW。

## 需人類決策

解除 FIR-B01／N01 不需要新的產品決策。G-DOCUMENT-STABILITY-COMMITMENT 等既有 owner decisions 保留；不在這一輪假設答案。

## 已執行結果

新增29項直接案例（VM01–18、VA01–11）通過；完整 regression **383/383** 通過，零失敗／跳過，所有 strict TypeScript scopes通過。首次完整run曾因進度validator仍指IH-003失敗，修正revision後全部重跑；失敗report保留。VA09與VA11是實際執行找到的authority/cleanup反例，其觀察輸出轉錄與修正回歸均保存；surface-move與malformed-restore則為設計/程式檢查先提出、再以直接案例固定的反例，不冒稱先跑過紅燈。細節與證據層級见validation。

Affected invariants：INV-001/006/008/009/019/020、CP-01/02/04，責任保持；新增的是符合這些邊界的view交接方式。未發現需下一位implementer自行裁定的FIR architecture choice；renderertechnology與具體widgets/DOM屬已明訂工程自由。新freshreview仍應核對scope.cancel與commit分離、cleanup先撤权、借用anchor與失敗retry，不以本段自評代替獨立接受。
