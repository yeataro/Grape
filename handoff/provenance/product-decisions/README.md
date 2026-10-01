# Accepted product decision evidence

`DEC-GRAPE-001.md`、`DEC-GRAPE-001.json` 與原 `state-patch.json` 是外部接受紀錄的 **byte-identical copies**。Hash 與來源位置見 [COPY_PROVENANCE.json](COPY_PROVENANCE.json)。原接受狀態、接受者、時間意義及 source baselines 沒有被 Handoff 編輯重新授權或改寫。

供獨立 implementer 直接使用的政策為：**domain-separated Undo；coordinated Mixed History 延後**。IH-005 已把這項 accepted decision 編譯進 [implementation plan](../../08_IMPLEMENTATION_PLAN.md)、[Gates](../../data/gates.json)、[slices](../../data/slices.json)、[acceptance index](../../data/acceptance-index.json) 與 [capability scope](../../data/capability-coverage.json)。不用回到聊天或外部檔案取得答案，也不必重新請 owner 接受一次。

原決策的 `registration`／`sourceEvidence`／`humanReadableRecord` 與 state-patch 路徑描述 **IH-004 當時的外部登錄位置**，是歷史 evidence locator，不是要求本包 implementer 載入 Legacy implementation。若要讀決策本身，使用本目錄相鄰的 md/json；source evidence 的原 hash 用於稽核，並不轉換成可覆寫舊 baseline 的授權。

`state-patch.json` 保留為原始 adoption evidence，**不是目前進度，也不能把它套進尚未開工的空範本**。IH-005 的 not-started implementation-state 仍沒有 project、implementation baseline、active/completed slices、accepted implementation evidence 或 decisionReferences/Gate deltas。產品政策已由本 Handoff baseline 繼承；取得正式開工授權後，才依現有 current-state 契約登錄實際進度與必要 reference。

`DEFERRED_BY_PRODUCT_DECISION` 不等於 Covered、PASS 或 runtime verification。原 CQ Partial、legacy oracle、AT-S09-03 原文保留。LU-UI-009、LC-UI-101／G-LU-UI-008、CAS、authority、receipts 與所有 lifetime fences 繼續有效。十項 `AT-DEC-GRAPE-001-xx` 均為 `REQUIRED_NOT_EXECUTED`。
