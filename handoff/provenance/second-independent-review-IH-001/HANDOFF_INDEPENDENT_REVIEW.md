# HANDOFF_INDEPENDENT_REVIEW · IH-001

審查日期：2026-10-02　審查者：Independent Handoff Reviewer（fresh context，未參與設計）
正式輸入：只有 `implementation-handoff/`。沒有讀聊天紀錄、Legacy source 或封存 baseline 原檔。
本輪沒有修改 Handoff，也沒有補寫 architecture。修正方向只列最小建議。

---

## HANDOFF VERDICT: **FAIL**（範圍窄、修起來便宜）

Ownership、產品定位、Gate 紀律和 vertical-slice 計畫都達到可交付水準。FAIL 只來自兩個缺口，兩者都要在 Slice 001 產出第一份持久資料和第一個模組 API **之前**決定，而 package 給了兩種互斥的讀法：

1. 從 executable-reference 移植到 production 時，哪些部分是規範契約，哪些只是 qualification 上限。
2. Production 的 canonical document schema 用什麼身分。

兩者都屬於「下一個 Implementer 必須自己做 architecture decision」。補一頁 contract ledger 加一段 document-format 決定，就應該能轉成 PASS WITH NON-BLOCKING ISSUES。

我實際跑過的檢查（Node 25.5.0）：`tools/check-handoff.mjs` PASS（8986 checks）、`tools/check-boundaries.mjs` passed，5 組 examples 共 15/15 pass。這些只證明 package 本身自洽，不影響上面的判定。

---

## Blocking issues

### B1：沒有規範的 production contract surface，reference 裡的封閉型別要靠 Implementer 自行裁定

**證據（互相衝突的 canonical 說法）**
- `04_EXTENSION_MODEL.md` §2：「最小結構直接見 `contracts.ts`……**不要另發明一份較鬆的 JSON API**」。表格把各 extension 入口標為 `[EXECUTABLE] Registry.register`、`HostServices`、`GenerationProfile`。
- `12_DECISION_LOG.md` 開頭：「新增交接範例的函式拼字**不是新產品ABI**」。`02` 開頭：「正式實作**可換內部演算法與名稱**」。`executable-reference/README.md`：「THIS IS NOT THE PRODUCTION IMPLEMENTATION」。D17：不能繼續把 qualification classes 堆成產品。
- `02` §9 只列出部分 qualification bounds（fixed-array 4096、struct 128、cache 8、PanelKind），並說「不可複製為產品限制」。但 `contracts.ts`/`generator.ts`/`qualification-host.ts` 還有更多封閉型別沒被歸類：
  - `StageRecord.kind: "vertex"|"pixel"`
  - `GraphDocument.kind: "td.top"|"td.mat"`
  - `GenerationProfile.graphKinds` 與 `render({vertex,pixel})`，等於寫死兩個 stage 的拓撲
  - `ServiceName` 是 9 個字面值的 union
  - `ParameterSpec.presentation: "number"|"menu"|…`
  - `format: "grape-core-experiment"`
- 所有 examples 都直接 import `executable-reference/core.ts`、`qualification-host.ts`（`FencedArtifactReceiver`），沒有說明換到 production API 時要怎麼對應。

**兩種互斥讀法**
- (a) 原樣移植 `contracts.ts` 當 production 模組 API。後果是把 TD 命名的 graph kinds、只有雙 stage 的 profile、封閉的 Host capability 集合一起帶進產品核心。這和 `01`（ISF 是既定擴充方向）、`02` §9、D13 的精神衝突。
- (b) 只保留可觀察語意，重新設計 production API。這就是 Implementer 自己做 architecture，而且違反 04 的「不要另發明」。

S01 一定會建立 NodeModule、GenerationProfile、Graph kind 和 Stage 的 production 型別，而之後所有模組都依賴這份型別。這是 extension ABI 的決定，不是一般命名自由。

**最小修正方向**：在 package 內加一份 contract ledger。逐一標出 `contracts.ts`（以及 Host/Profile/Panel 介面）每個型別和欄位屬於哪一類：「規範，必須照抄」、「規範形狀，可改名」或「qualification bound，必須開放」。開放的項目要寫出開放後的形式，例如 StageKind 和 GraphKind 由已註冊的 graph-kind 定義提供、Host capability 用開放的命名空間 id。這張表只做分類，不新增 owner。

### B2：Production canonical document schema 的身分沒有定義

**證據**：整包唯一的 document schema 是 `contracts.ts` 的 `GraphDocument { format:"grape-core-experiment", formatVersion:1, kind:"td.top"|"td.mat", … }`（`core.ts:1024`、`generator.ts:157` 寫死驗證）。`02` §6、`05` §2 定義了保存語意（ACK、dirty、opaque preservation），但沒有定義 production 的格式識別、版本策略、未知欄位 forward-compat 規則，也沒說它跟 S02 legacy import 是什麼關係。

**為何阻塞 S01**：S01 的完成定義包含 save→reload，會產生第一批使用者文件。Implementer 必須決定：要直接用 experimental 格式字串和 TD 命名的 kind 寫入 canonical document，還是另訂。前者等於讓 Host 名稱進入產品的持久資料身分（見下方 Product-positioning drift），後者是自行做出資料承諾。

**最小修正方向**：在 `05` 加一段 production document identity：format id、版本遞增規則、未知欄位保留、與 legacy 格式（只經 S02 import）的關係，以及 graph kind 用產品命名、TD 只當 profile 和 target。其中「從哪個 slice 起算是穩定的使用者資料承諾」交給人類（見最後一節）。

---

## Major issues

| ID | 問題 | 證據 | 後果 | 最小修正方向 |
|---|---|---|---|---|
| M1 | **Panel 擴充的 canonical 說法互相矛盾，也缺 production Panel 宿主契約** | `04` §4、D13 說 Panel 是一級擴充、「一般 Panel 可依本模板獨立建立」。`10` G-EXTENSION-PANEL 卻說「新 kind 若要交付，明訂新增契約並**獲 Architecture Change 記錄**」，又說「不得為示例自造未封存架構」。mount/unmount、Context 事件訂閱、resolver restore 都沒有契約 | 新增一個 Panel（案例 C）在文件上的正式路徑是 Architecture Change。S01 的 Canvas/Inspector 只能自己發明宿主方式，之後 S06 很可能要重做 | 明訂 Panel 宿主最小契約：mount(target, services)、訂閱 Context、retarget token、dispose。說明這是既有 lifecycle 的實作細化，不需要 AC；G-EXTENSION-PANEL 只保留「外部不受信任 Panel 套件」 |
| M2 | **Node 的呈現中繼資料與 i18n 沒有 owner** | `NodeType`、`PortSpec`、`ParameterSpec` 沒有 label、category、search tags、help 或 localization 欄位。UI_SPEC §4 要求「可見 label」，Legacy 截圖有 Add Node 分類、Help panel、EN/JA 混合介面。`ACTION_QUALIFICATION_CONTRACTS` 只有 HelpView resolver | 新增普通 Node 要出現在 Add Node 目錄和 Help 時，實作者最可能做出一張中央 catalog/label 表，每加一個 Node 就改一次核心，正好是 03 禁止的「新增 Node 改多個無關 core」 | 決定 label/category/help/i18n key 由 NodeModule 宣告，還是由並列的 UI contribution 宣告；寫進 ledger |
| M3 | **低頻但重要的能力缺少開放 seam** | `ServiceName` 封閉；`GenerationProfile.render` 只接 `{vertex,pixel}`；Graph kind 沒有註冊入口，誰定義必要 stage 和 boundary node 也沒寫；`04` §7 自承「bounded capability 集」 | 新 Host capability（案例 F）或多 pass/ISF backend（案例 E）只能改核心 union，在 core 累積 host-specific 或 profile-specific 分支 | 和 B1 的 ledger 一起處理：寫出 GraphKind 定義與 Host capability 的開放形式（這裡只需要 seam，不需要實作） |
| M4 | **Conformance 工具只擋平台洩漏，擋不住模組間穿透** | `check-boundaries.mjs`：五個 pure roles（contracts/core/module/generator/application）彼此可以任意 import。沒有檢查 generator 是否 import 可變 Graph、UI 是否 import core internals、Panel 之間是否互相穿透、module 是否碰 core private | 03 的責任矩陣和禁止事項只能靠人工 review。幾個月後很容易重新變成 spaghetti | 在 production manifest 範本加上 03 的依賴方向矩陣（role → 可依賴的 role、只能經 `contracts` 公開入口），讓 checker 驗證 |
| M5 | **Prototype code 有被當成 production 基礎的風險** | START_HERE 要求「將必要 reference 案例移植到 production 公開 API」，但 examples 綁著 qualification classes（`FencedArtifactReceiver`、`WorkspaceQualification` 等名稱）。D17 又禁止繼續堆 qualification classes | 最省事的路徑就是複製 core.ts（68 KB）和 qualification-*.ts 進 production，名稱和封閉 bounds 一起帶過去 | 列出每個 example 對應的 production 入口（可以併入 B1 的 ledger）；明說 reference tests 是移植成「行為測試」，不是移植實作 |
| M6 | **沒有可寫的專案狀態層** | `slices.json` 只有 package 層的 `status:"planned-not-implemented"`，每個 slice 沒有狀態欄位。gates 沒有 closedBy/evidence/baseline 欄位。D-log 是 markdown，沒有新增 ID 或 Architecture Change 提交格式。08「每次交付的收據」只列內容，沒指定寫到哪裡 | 換 Agent 或換 Context 後，進度、Gate 解除與架構變更就散落在聊天和 PR 裡，違背「專案狀態不依賴 AI 記憶」 | 加一個可寫的 `project-state.json`（或為 slices 和 gates 加 status、evidence、decisionRef 欄位），並寫一行 AC/Decision 新增規則。這不需要新增大量文件 |

## Minor issues

- m1 S01 的 save/reload 主路徑寫法不一致。`08` 和 slices 的產品結果寫「下載 JSON 並重新開啟」；`07` 寫「使用可確認 ACK 的 storage adapter 完成 save/reload，download 是額外 export」。從 storage 重新開啟的 UI（文件清單）沒有規格。
- m2 `HANDOFF_FILE_INDEX.json`、`SCREEN_INDEX.md`、`UI_SPEC.md` 都刻意沒有索引 `ui-reference/legacy-screenshots/`，`check-handoff` 卻仍 PASS，代表 integrity 檢查沒有涵蓋所有檔案。
- m3 `invariants.json` 21 條全部標 EXPERIMENTAL，但 `02` 把其中部分（唯一 mutation 邊界、Parameter 無第二份值、只讀 Generator）標為 CONFIRMED。哪些 invariant 可以經 D-log 修改，兩邊說法不一致。
- m4 可讀性問題：繁簡混用、錯字（「當當前」、「绕过」），`08`/`09` 有大量去掉空白的字串（`applicationcore`、`nativeI`、`publicationqueue`），會增加 AI 和人誤讀的機率。
- m5 Production 語言和工具鏈沒有明說（TypeScript 和 Node 25 只能從 reference 推出）。這屬於 engineering freedom，但寫一句可以省掉猜測。
- m6 `audit/FRESH_CONTEXT_SIMULATION.md` 自承不是獨立 blind review（作者自測）。誠實標示，不算缺陷，但它的 16/16 PASS 不能代替本審查。

## Product-positioning drift: **POSSIBLE**

文字層面一致：00、01、02 §1/§8、03、06、11、D01、HC-001 的隔離都明確寫出 Graph、Parameter、History 和 EditorContext 屬於產品，Host 是外部 target。LC-DATA-001 的「Apply 後隨宿主保存」已被正確隔離。

潛在的漂移管道來自 B1 和 B2：唯一可執行的 document schema 把 canonical 作品的 kind 定義為 `td.top`/`td.mat`，profile 也只認這兩種。照 reference 移植的話，Host（TouchDesigner）的命名會進入產品文件的持久身分和 Generator 的型別系統。結果是 Host 沒有取得所有權，卻定義了作品是什麼。目前沒有證據顯示任何 ownership 被搬回 Host，所以判定 POSSIBLE，不是 CONFIRMED。

## Extension-model assessment: **PARTIAL**

| 案例 | 入口 | 判定 | 主要阻礙 |
|---|---|---|---|
| A 普通 Node | `Registry.register(NodeModule)` | 契約佳，可執行範例 | 沒有 label/category/help/i18n 的 owner（M2）；模組 API 要用哪個版本（B1） |
| B 動態 ports Node | 同一個 NodeModule：`ports(state)`、codec、`invalidEdgePolicy` | **最強**：生命週期、失敗語意、Undo 和測試清單完整 | 無 |
| C Panel | 設計契約加 template | **弱**：正式路徑和 G-EXTENSION-PANEL 衝突，宿主契約缺 | M1 |
| D Widget / UI contribution | `ParameterWidgets.register`、`Actions.register` | 好：projection、draft、fallback 都清楚 | nested 投影已有正確的 Gate |
| E Generator backend/profile | 把 `GenerationProfile` 傳入 generate | 可以加第二個雙 stage 的 GLSL profile；多 pass、ISF、其他 stage 拓撲沒有 seam | M3、B1 |
| F Host adapter/capability | `HostServices` providers + 具名介面 | 既有 capability 的新 adapter 路徑清楚（fence、receipt、indeterminate）；新 capability 種類要改封閉 union | M3 |

高頻擴充點（A、B、D）低摩擦，達到「概念核心明確」。低頻但重要的擴充點（C、E、F）的 seam 不是缺，就是被 qualification 封閉型別擋住。

## Fresh Implementer result: **可以開始 S01 的 ownership、mutation、generation 與 UI 行為部分；但開工第一天就要先做 B1、B2 兩個 architecture decision**

- Blocking external information for Slice 001：**NONE**。不需要聊天紀錄或 Legacy source，capability oracle 可以直接從 `tools/find-capability.mjs` 取得。
- Architecture decisions still to invent for Slice 001：**2**（B1 contract normativity、B2 document schema identity）。另有 M1 的 Panel 宿主方式和 M2 的 label 來源，兩者 S01 可以暫時繞過，但會留下技術債。

## UI handoff result: **PASS（限 S01 範圍）**

S/B/P/R 四級分類清楚。UI_SPEC 的區域、路由、互動表、Inspector 建構規則、狀態畫面、兩 Context 序列都足以在不讀 Legacy UI source 的情況下重建首版。5 張 Legacy 截圖提供外觀密度、節點卡片、深色主題、停靠與浮動並存的參考。

後續 slice 還缺的視覺參考（package 自己也列了）：空圖與空選取、多選 primary、展開的選單、接線被拒、missing module、欄位草稿錯誤、子圖 breadcrumb、窄螢幕和觸控、操作前後對照，以及非 matrix 型別的色票。M1、M2 也會影響 UI 結構，但不妨礙 S01。

## AI workflow readiness: **PARTIAL**

有：slice、gate、invariant、capability 的機器可讀 ID 和依賴（`prerequisites`、`conditionalPrerequisites`、`prerequisiteOutputs`）、baseline identity（IR-001/AC-002/CQ-001/MRDP-001）、AT 的狀態欄位、integrity 檢查工具。
缺：可寫的進度狀態、Gate 解除欄位、Decision/AC 的新增協定、production repo 的 baseline 指標（M6）。

## Decisions requiring human owner

1. **Canonical document 的資料承諾時點**：S01 產生的 Grape document 格式，是從 S01 起就承諾永久可讀（之後只能做 forward migration），還是在某個指定 slice 之前都標為 pre-release、允許不相容變更？（package 已隱含新格式和 Legacy 只經 S02 import 互通，這點不需要再決定。）

既有的 G-PD-1、G-PD-2、G-PD-3、G-PD-4A、G-PD-4B 都已正確列為人類決策，各自依 slice 生效，不是本審查新增的項目，也不阻 S01。B1 的 contract ledger、M1 到 M6 都是 architecture 或 engineering 補件，**不交給人類**。

---
---

# 附錄：支持上述結論的審查過程

## 一、只依 package 重建的產品模型

1. **產品**：Grape 是可離線編輯 Shader 作品的節點圖編輯器。使用者建立節點和來源、接線、調參、檢視 GLSL、保存，之後可以選擇交付給 TouchDesigner 等執行目標。
2. **為何重構**：讓既有能力（618 個 capability leaf）可維護、可擴充，並去除「Host 託管 UI 所以 Host 擁有文件」的隱含依賴。同一 application 支援 Static Web、Node-hosted、Electron。
3. **Canonical Graph**：在 application 的已開作品集合。Graph 是運行中模型，GraphDocument 是它的序列化快照，不是第二份模型。
4. **Ownership**：Node、Edge、resources、revision、Operation、Graph History 歸 Graph。Node 的能力定義歸 NodeType/DefinitionSet（exact pin）。Parameter 只是 Graph 寫入邊界的入口，沒有自己的值。Persistence 負責 save/load 流程，媒介由 adapter 處理，ACK 只確認當時捕捉的內容。
5. **UI/EditorContext**：Context 持有 selection、primary、Stage/occurrence 路徑和可選的 Binding 引用。多個 Context 共用同一個 Graph。Panel 持有 viewState，Layout 持有位置與尺寸，Manager 只做路由，不保存第二份狀態。
6. **Generator**：從不可變 snapshot、固定 definitions 和 profile 產生 artifact、binding schema、診斷與 provenance。不修改 Graph，也不讀 active Context。
7. **Host**：外部執行或整合目標（TD 實例裡的 Target），身分是 `{hostId,targetId,incarnation}`。
8. **Host 可持有**：active artifact、實際 live values、原生 control 定義、runtime resources、已交付的 document 副本、自己的 Value/NativeDefinition History。
9. **Host 絕不能成為 canonical owner 的**：Graph/document、NodeType definitions、作品參數模型、Graph History、EditorContext。
10. **三種部署**：共用同一個 application core，只差 bootstrap 和 adapter，缺能力時回 typed unavailable。Node-hosted 不代表 Graph 放在 server，Electron 不代表 Graph 放在 main process。

以上 10 題都能從 package 得到唯一答案，**這部分沒有 Handoff defect**。唯一的模糊點在 3 和 4 的持久形式（B2）。

## 二、Legacy 是否被偷帶回

逐項核對要求的 8 條原則，在 00/01/02/03/05/06/07/11/12 與 HC-001 中都一致成立。特別檢查的地方：
- 06 明說「Host 存的 GraphDocument 只是已交付版本，重讀須走明確 reload/import」。
- 11 的轉換表把每個 Legacy 假設都改寫成「意圖 → 新機制」。
- 「Reload Applied」不得冒用為本地重載（UI_SPEC §6）。
- 「取為預設」必須是顯式模型命令（01、03）。
- 部署不重新定義架構（07、D14）。

沒有發現 compatibility workaround 被升格成 canonical。唯一的風險來自 reference schema 的 TD 命名（見 drift 段）。

## 三、Super-user 擴充模擬（摘要）

細節見上方 Extension-model 表。共通觀察：
- 所有入口都不需要讀 private internals（examples 只用公開 API，`check-boundaries` 範例也驗證「新增模組 core diff 為零」）。
- State ownership、lifecycle、validation、persistence 在 A、B、D 三種案例都有逐欄位契約（04 的表格格式很好）。
- 「再新增一個同類能力」：A、B、D 仍然自然；C、E、F 第二次以後就會碰到封閉 union 或 AC 要求。

## 四、「不是一切都要 plugin 化」

固定核心固定的是責任與 invariant（唯一 mutation 邊界、snapshot 生成、exact pin），方向正確。04 明說不需要一個巨大的插件介面，trusted-code 的定位也誠實。問題不在過度 plugin 化，而在 qualification 型別把 seam 封死了（B1、M3）。convenience abstraction（Manager）明確不是必經之路（02 §1）。

## 五、Fresh Implementer 模擬：前三個 slices

**Slice 1 = S01 Host-free 最小編輯流程**
- 要建立：production 根目錄；Graph、Stage、Node、Edge 與 Draft/Operation/History；Registry/DefinitionSet；Float/Multiply/Compose 三個模組；ES profile 生成；StorageAdapter 加 JSON export；EditorContext ×2；Canvas、Inspector、actions 的瀏覽器 UI。
- 可直接實作的契約：mutation 五步驟（02 §3）、invalid edge 兩種政策、save ACK/dirty（05）、Context 與 selection 規則（INHERITED_UI §13.1–13.3）、AT-S01-01 到 08。
- Engineering freedom：UI framework、渲染方式、storage 媒介、資料結構、History 的實作策略。
- **仍需自行發明的 architecture**：B1（模組 API 與 Stage/GraphKind 要不要開放）、B2（document format 身分）。另外 M1（Canvas、Inspector 用什麼 Panel 宿主方式）與 M2（label 從哪裡來）可以暫時處理，但會留債。
- 矛盾的 canonical 說法：04 vs 12/02 的 API 規範性；07 vs 08 的 save/reload 主路徑（m1）。
- 需要外部資訊：無。

**Slice 2 = S05 第一個 shader 能力族批次（例如 math family）**
- 要建立：一族 NodeModule 的完整垂直路徑（新增、參數、接線、生成、錯誤、保存、Undo）。
- 可直接實作：behavior contracts（find-capability 可查）、TypeEnvironment 作為唯一型別判斷、`requiredCapabilities`。
- 仍需發明：M2 的目錄、分類與 help 宣告位置。少了它，Add Node 目錄會成為中央 switch。
- 矛盾：無新的矛盾。

**Slice 3 = S06 的 workspace 與 Panel 部分（多 Canvas、Parameters、Help、Layout 保存）**
- 可直接實作：routing 規則（linkGroup、follow、pin）、Layout→Pane→Tab→Panel、close/move/hide 的生命期表。
- 仍需發明：M1 的 Panel mount、訂閱、restore 契約。依 G-EXTENSION-PANEL 字面，新增 Help 以外的 panel kind 需要 AC。
- 矛盾：04/D13 vs 10 G-EXTENSION-PANEL。

## 六、Implementation Plan

可執行，不是 roadmap。每個 slice 都有產品結果、architecture 責任、前置（含 `prerequisiteOutputs` 精確範圍與條件式前置）、範圍、明確不做、Gates、AT、runtime 證據、conformance 與完成定義。S01 正是要求的 Host-free 主線（document→graph→node→parameter→connection→generation→save→reload），而且必須有真 UI，S07 之後才接 Host。S05 依 family 縱切，避免先做水平基礎層。合格。

## 七、Known Gates

合格，是本包最強的部分。45 條 gate 都有 blocks、doesNotBlock、earliestRequiredPhase（P/S/I/R）、requiredEvidence、disproofAction（含何時升 A、停止哪些依賴）。沒有要求開工前全部解除，S01 只受 4 條（加 HC-001）gate 的特定分支約束。唯一的瑕疵是 G-EXTENSION-PANEL 的 disproof 路徑和 04 衝突（M1）。

## 八、Spaghetti 風險分級

| 風險 | 級別 | 說明 |
|---|---|---|
| 第二份 canonical state | NON-ISSUE | 02、03、09 和 21 條 invariant 都有正反例 |
| circular ownership | NON-ISSUE | 依賴方向圖清楚（02 §1） |
| cross-module private mutation | MAJOR | 規則清楚但工具不擋（M4） |
| 隱性 global state | MINOR | 有明文禁止（Node callbacks 不 import active Graph），工具只抓平台 globals |
| generator/persistence/UI 越權 | NON-ISSUE（規範）/ MAJOR（工具） | 同 M4 |
| host-specific logic 穿透 core | MAJOR | 經 TD 命名的 kind 與封閉 ServiceName（B1/M3） |
| deployment-specific code 穿透 core | NON-ISSUE | check-boundaries 確實擋得住 |
| extension 需修改 central switch/registry | MAJOR | Node 目錄與 label（M2）、ServiceName（M3）、PanelKind（M1） |
| feature-specific conditional 累積在 core | MINOR | 03 明文禁止；剩下的風險來自 M2/M3 |
| compatibility workaround 變 canonical | NON-ISSUE | 11 與 HC-001 處理得很好 |
| prototype code 當 production foundation | MAJOR | M5 |
| API 名義存在但需懂內部 | NON-ISSUE | examples 只用公開 API |

## 九、UI 分級摘要

- **Structural（完整）**：區域與 owner、Context 路由、Panel、Context、Graph 分離、PortRef 與共用座標、狀態徽章分離。
- **Behavioral（完整，限 S01）**：選取、拖曳、pan/zoom/H/F、接線替換與拒絕、dynamic mode、field draft、IME、Undo、close、GLSL late reply、save/export/reload 狀態、responsive 邊界（≤800px overlay 為 B）。
- **Visual preference**：Legacy 截圖加 matrix 色值。其餘色票明確標為 R，需要後續補證據。
- **Replaceable**：尺寸、theme token、圖示。
- 缺的參考已列在 UI handoff 段落。

## 十、AI-native 開發流程

見上方 AI workflow readiness 與 M6。目前的 package 能當**不可變的 baseline**（source of truth for intent），還不能當**可變的專案狀態**（source of truth for progress）。
