# DEC-GRAPE-003 子圖可選函式化與 Library 保存

**Product decision：ACCEPTED。Human Owner 已接受本文件涵蓋的方案並授權修訂；尚未實作、尚未登記或採用到 implementation baseline，未指定交付 Slice。**

子圖提供「展開／函式化」的產碼模式。函式化讓重複引用共用 GLSL 函式定義，各引用仍以自己的輸入計算。模式跟隨子圖保存及 Library 交換，引入後仍可修改。配套責任、常量判定、保存與切換契約見 [AC-GRAPE-002](AC-GRAPE-002.md)。

## 權威與來源

- 決策者：Human Owner；記錄者：Technical Product Steward／PM。
- 記錄日期：2026-10-04，Asia/Taipei；未取得原始訊息的精確時間，不以記錄時間替代。
- 能力要求原文：「總之,此圖可以函式化這點也是明確希望要求的，甚至是它這個選項應該要被持久化到 Library 裡面有收錄的時候，使用者在引入的時候，這個選項還是保持的。之餘，使用者還可以更改，在他引入之後。」上下文的「此圖」指 subgraph。
- 常量檢查確認原文：「所以可以用既定的常量傳播檢查處理，函式化的話，就是它的 input 不具有，不具有常量資格嘛。」此處指普通函式參數的編譯期常量資格，不是否定傳入常量值。
- 最終接受與修訂授權原文：「嗯，你的建議我都接受，然後直接放到修訂版。放之前再檢查一下邏輯。」
- 接受前已列明：子圖可選模式、Library 往返與引入後可改、常量資格檢查、函式去重、失效常量連線處理、原因通知及同筆 Undo；最後確認的建議為定義層共用模式、個別引用使用 Make Independent，以及新建／舊資料升級預設展開。
- 本次閱讀工作 HEAD：`aea7418232d9144a6aa32764d044960974b78fa4`；本機 main：`3a59aeeeddb71a06a1172c85016ad06aeb59f34f`。accepted architecture 仍為 IH-005；工作樹程式觀察不等於 main 已交付能力。

## 使用者可觀察的行為

| 情境 | 已接受行為 |
|---|---|
| 新建子圖 | 預設「展開」；使用者可明確切換成「函式化」。 |
| 同一定義有多個引用 | 全部引用共用模式。若要其中一個引用採用不同模式，先使用既有 Make Independent；本次不增加逐引用覆寫。 |
| 收錄至 Library／Personal | 在原本允許收錄的範圍內，完整保存子圖、依賴及模式；不以產出的 GLSL 取代子圖內容。 |
| 從 Library 引入 | 保留資產保存的模式；不被「新建預設展開」覆蓋。 |
| 修改引入的子圖模式 | 沿用既有首次語意編輯本地化及相關引用更新；不改 Library 原件。 |
| 保存、重開、複製或 Make Independent | 保留模式，遵循既有依賴、identity、版本與交換限制。 |
| 已支持的舊資料升級 | 經明示的版本化升級補為「展開」，維持既有行為；不能直接改寫舊模組的 exact pin。 |

## 函式化資格與常量

沿用現有由內容推導的 stage 集合、實際使用 stage、profile／capability、型別、循環及資源規則。函式化不重設子圖接口，也不因呼叫位置的值不同而自動改型。

資格檢查把子圖外露輸入對應的普通函式參數視為非編譯期常量，沿節點各自的常量語意分析子圖及巢狀引用。子圖內部的常量保持資格；由固定型別可確定的陣列長度等，也按原規則判斷，不能一見陣列就拒絕。常量值可以正常傳入普通參數，但不使參數成為 GLSL constant expression。

若子圖內部必須使用編譯期常量的位置，因改用函式參數而無法滿足，拒絕這次啟用，保留原模式、連線與 History，並指出原因及位置。本次不交付依呼叫端常量產生專用函式版本的能力。

函式呼叫產生的輸出本身不宣稱具有編譯期常量資格；後續節點仍按自身規則判斷。從「展開」切換成「函式化」若使既有下游常量要求失效，斷開因此失效的接收端連線，保留一般連線。影響可以經過中間計算與巢狀子圖，不限於直接連在子圖輸出的第一條線。

這項斷線政策只適用於本次明確的模式切換。它不把一般接線、Uniform 變更或其他模式修改，一併改成自動斷線政策。與本次變更無關的連線及先前錯誤不得藉此清除；具體原子性及保全規則由 AC-GRAPE-002 界定。

## 斷線通知與修改範圍

模式變更、必要的 Library 本地化、受影響引用、失效連線、loss record 與 diagnostics 在同一筆 Graph 操作發布，Undo／Redo 精確還原。切回展開不自動復線。

必須能查詢斷線原因、接收位置及受影響連線，UI 在完整發布後收到通知；可沿用模型變更通知及 loss record，不要求新增獨立事件型別。提示外觀、位置與是否合併提示留給 UI 設計。

斷線後若留下必填孔未接，沿用「可保存的 error 圖、阻止生成」規則，不發明預設值或默默刪除節點。已啟用函式化後，後續正常編輯或載入發現不合資格時，保留模式與資料並診斷；不暗中切回展開或在生成時修改圖。

## 產碼結果與範圍

在同一份 shader 原始碼中，同一子圖定義與相同必要產碼環境的函式實作只定義一次；各 caller 使用自己的輸入。不同 stage／profile 產物分別完整生成，不承諾跨 shader 共用單一函式定義。多輸出不能導致同一 caller 的運算或副作用被重複執行。函式內外均保留既有運算、資源、轉換及診斷來源語意。

目的包括減少重複 GLSL 本文及提供使用者可選的產碼方式。shader 編譯時間、GPU 執行速度或圖遍歷耗時的改善均須量測；本決議不設定未經驗證的效能保證。

這是子圖產碼模式的產品與契約修訂，不重設 Graph／Module／Generator／Library／History ownership。節點多目標、多版本及跨目標選項共用仍屬 [Q-003 工作筆記](../notes/OPEN_QUESTIONS.md#q-003--節點的多目標與不同版本支援)，沒有隨本次一起定案。既有 Library／Personal admission 與相關 Gates 不變。

## 章節對應與建議交付順序

Owner 已指示由 PM 分配修訂章節。下表是本決議與 AC-GRAPE-002 對 frozen IH-005 的外部對照，不直接修改 handoff，也不重開 S03 驗收。

| 既有章節 | 本次應讀入的修訂內容 |
|---|---|
| [01 產品模型](../handoff/01_PRODUCT_MODEL.md)「作品與編輯」 | 子圖定義持有產碼模式、共享引用共用選擇、Make Independent 後可分別修改。 |
| [02 架構](../handoff/02_ARCHITECTURE_SPEC.md) §3、§6、§7 | 模式切換、Library 本地化、常量失效線、loss／diagnostics、一次發布與 Undo；失敗與既有 error 圖的界線。 |
| [02 架構](../handoff/02_ARCHITECTURE_SPEC.md) §5、[04 擴充](../handoff/04_EXTENSION_MODEL.md) §2、§6、[13 production surface](../handoff/13_PRODUCTION_CONTRACT_SURFACE.md) §3、§4 | 函式邊界常量資格、函式去重、各 caller 獨立計算、profile／stage 及診斷來源。 |
| [03 責任表](../handoff/03_RESPONSIBILITY_AND_DEPENDENCY.md) | Graph 保存模式；子圖模組提供語意與資格規則；Application 發出修改命令；Generator 只產碼；UI 投影結果。沿用現有責任，不新增平行 owner。 |
| [14 文件格式](../handoff/14_DOCUMENT_FORMAT.md) §2、§2c、§4 | Resource payload 中的模式、exact owner／codec 演進、舊資料明示升級為展開及未知模式保全邊界。 |
| [08 實作計畫](../handoff/08_IMPLEMENTATION_PLAN.md) S04、S05 | S04 對應 Library 交換與資料保全；S05 對應產碼、資格分析與完整使用者操作。實際交付順序依下述建議另行授權。 |
| [09 驗收](../handoff/09_ACCEPTANCE_AND_CONFORMANCE.md) S03、S04、S05 | S03 共用引用／History 行為作回歸依據；S04 對應模式往返；S05 對應生成及常量行為。新增驗收固定在本決議 AT-DEC-GRAPE-003-01…10，不改寫歷史 PASS。 |

以下為 **PM 的交付順序建議，尚非 Slice 授權或已採用的工作包範圍**。產品要求已接受；分配時機不應再由 Human 手動拆解檔案或技術責任。

1. **S04 開始前／交換實作時，先處理資料契約相容。** 實作者應讀入本修訂，確認 Library 包裝、複製、remap 與首次編輯路徑依 owner codec 保全完整資料，沒有僅挑目前已知欄位而丟失模式的設計。保全不等於容許缺模組或未知版本直接生成，既有 admission 不放寬。此時可確認模式的資料位置與升級路徑，但不要求只為占位就發布新 codec 或不具功能的欄位。
2. **完整函式化建議置於 S05 前段的有界交付，在大量複雜 shader 節點加入前完成。** 同一縱向工作包含必要的 helper 能力、模式的版本化保存、可用切換入口、資格判定、去重產碼、斷線通知與 Undo，並接回 Library 往返驗收。這不是只做 Generator 或資料模型的半份交付，也不是等 S05 全 catalog 完成才處理。實際工作包仍由協調員依 Human 授權界定。
3. **功能啟用與交換驗收同步。** UI 不提供尚未接上產碼／資格檢查的有效函式化開關；接收者不支援時依既有規則保全並診斷，不默默展開。S04 若先完成一般交換，只能宣告已驗的交換範圍；函式模式的 AT-DEC-GRAPE-003-06、07 必須在相應 codec 與功能可用後補足，不能靠一般 JSON 保留宣稱整項函式化驗收完成。

提早處理的理由是保存契約與共用產碼能力會被後續工作依賴；沒有證據要求本次連同編譯效能最佳化、跨次快取或多目標節點一起實作。上述建議未變更 S04 的 G-PD-1、環境選擇或既有工作包，也未替尚未接受的符號陣列分支作範圍決定。

## 必要驗收

以下全部為 **REQUIRED_NOT_EXECUTED**；本次沒有建立或執行產品測試。

| ID | 必須證明的結果 |
|---|---|
| AT-DEC-GRAPE-003-01 | 新建預設展開；定義模式影響全部共享引用；Make Independent 保留初始模式且之後可獨立修改。 |
| AT-DEC-GRAPE-003-02 | 同一複雜子圖在同一 shader 重複引用及巢狀引用時，函式本文只生成一份，各 caller 的不同輸入與多輸出正確；不能共用不同 caller 的計算結果。 |
| AT-DEC-GRAPE-003-03 | 普通常量／Uniform 都可作普通函式參數；內部固定常量及固定形狀長度查詢可用；外露參數被用於必須常量的位置時拒絕啟用，圖與 History 不變。 |
| AT-DEC-GRAPE-003-04 | root、nested、shared 的下游常量影響傳播至實際要求處；只拆本次新增失效的接收端線，保留正常分支及既有錯誤證據，通知含明確原因。 |
| AT-DEC-GRAPE-003-05 | 模式、本地化、所有受影響引用及 losses 同筆發布／Undo／Redo；切回展開不復線；斷線後 required input 缺值可保存但阻止生成。 |
| AT-DEC-GRAPE-003-06 | 授權範圍內的 Library／Personal 收錄、引入、再編輯、再收錄及 save/reopen 保留模式與依賴；原 Library 不被改動，不跳過既有 admission。 |
| AT-DEC-GRAPE-003-07 | 受支持舊資料經明示升級維持展開；新資料缺失／未知模式不被猜成展開；缺 exact module 保留資料並遵循既有阻止生成／恢復規則。 |
| AT-DEC-GRAPE-003-08 | 不同 stage／profile、資源、名義型別、nested helper、effects 與多輸出在所交付範圍內保持語意；實際 shader 編譯及相應結果驗證不以文字快照替代。 |
| AT-DEC-GRAPE-003-09 | 已啟用的子圖後續變成不合資格，模式不被靜默重設；生成回確定 diagnostic，來源能定位共享定義與相關引用，Generator 不修改 Graph。 |
| AT-DEC-GRAPE-003-10 | 模式、定義本文、依賴或 profile 改變後，不錯用先前產物；共享函式的診斷不虛構成單一 caller；既有 snapshot／stale reply 保護保留。 |

## 採用與追溯

本決議及 AC-GRAPE-002 是 Human 接受的外部修訂，IH-005 保持封存。指定維護者後續依既有流程登記精確檔案及 SHA-256，再綁定獲授權的實作基準；登記不等於實作或驗收。本輪不更改 `implementation-state.json`、S03 接受證據或 S04 工作包，不派工、不提交或啟動 Slice。

已有契約依據：[Module／Generator 邊界](../handoff/04_EXTENSION_MODEL.md)、[helper 與常量資格](../handoff/executable-reference/COMPUTE_QUALIFICATION_CONTRACTS.md#6-generationprofile-與-lowering-契約)、[子圖共享與 Library 本地化](../handoff/executable-reference/WORKSPACE_QUALIFICATION_CONTRACTS.md)、[文件保存與模組版本](../handoff/14_DOCUMENT_FORMAT.md)。目前 production [NetworkData](../production/src/sdk/networks.ts) 尚無本決議的模式；[Compiler](../production/src/generation/compiler.ts) 逐引用展開。這些是本次靜態閱讀結果，並非已完成實作的證明。
