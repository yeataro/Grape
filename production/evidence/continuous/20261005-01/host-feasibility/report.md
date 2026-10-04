# S07–S12 Host/runtime 可行性唯讀報告

狀態：**工程預備分析；沒有執行產品／TD 測試，不是 technical PASS、獨立審查、Human acceptance 或 Gate 關閉。**

本機已有 TouchDesigner，第一條 Windows 本機隔離驗證路徑可規劃。當前真正缺的是 production Host adapter、被明確指派的拋棄式工程／Target，以及經核對權限後的實際 native 證據。安裝資訊和既有執行程序不能填補這些缺口；也沒有證據顯示架構不可行。

## 1. 身分與讀取邊界

- Scout：`/root/continuous_host_feasibility_01`；run：`GRAPE-CONTINUOUS-20261005-01`。
- Packet：`production/evidence/coordinator/continuous/20261005-01/host-feasibility-scout-packet-01.json`，2873 bytes，SHA-256 `edf79fa7035ca8593890d06668b24f0b823e4eb6735340c6772a661e56f4c20b`，已核對。
- Authority SHA-256：`49dd9a0500ae2a07e868fc1cc58c6528f0b50ab0c349f33c9bea8442aa9922fa`，已核對。
- Checkpoint：`9003c00b214ac29cafcb6cc22ac10693ac92a0bf`；首次和後續讀取 HEAD 均為 packet 的 `02313a0d0d6bd3d66cbfd9fe20c6df36c53909d6`。
- 觀察時間：2026-10-04T19:55:37.1989224Z（台北 2026-10-05）。當時 state 指向 I `30c867945c992d25956a2a32825de34571f7749e`、build `S06-debug-30c8679`、active S06。這只是讀取，不改 state 或啟動新 Slice。
- Packet 中 `handoff/02_MODULE_CONTRACTS.md` 不存在。以檔名搜尋定位到實際 `02_ARCHITECTURE_SPEC.md`、`03_RESPONSIBILITY_AND_DEPENDENCY.md`、`06_HOST_INTEGRATION.md`、`13_PRODUCTION_CONTRACT_SURFACE.md`；屬普通路徑修正，不構成契約衝突。
- 只讀規則、契約、source、既有 inventory 及狹窄安裝／程序 metadata。沒有啟動／連接／停止／修改 TD、Legacy 或其他 Host，沒有安裝、讀秘密／license 檔、網路掃描、廣泛檔案掃描、機器設定修改或再派代理。現有 PID 的 project、command line、記憶體、port、credential 均未讀。
- 唯一寫入為本目錄的 `report.md`、`report.json`；`.verification/` 已在根 `.gitignore` 排除。B01 的 writer/state/source/evidence 完全不改。

## 2. 觀察到的資源

| 項目 | 實際觀察 | 能證明的範圍 |
| --- | --- | --- |
| TD 安裝 | 2023.12000；2025.30060、30960、32050、32460、32820；六個對應 executable 均存在，ProductVersion 符合 | 可指定已存在版本作後續隔離可行性起點；沒有 runtime 支援認證 |
| TD 執行中 | PID 12476，`C:\Program Files\Derivative\TouchDesigner.2025.32820\bin\TouchDesigner.exe` | 既有使用者 session；不是拋棄式 fixture，不可借用／重啟／改動 |
| Node | PATH executable `C:\Program Files\nodejs\node.exe`，metadata 25.5.0.0；安裝 25.5.0 | 符合 README 指定版本 metadata；本次未執行 |
| Python | `C:\Python314\python.exe`，metadata 3.14.2150.1013 | 系統 Python；不能推定為 TD 內嵌 Python |
| 已有 JS 工具 | production 已有 @playwright/test 1.62.1、Vite 7.3.1、TypeScript 5.9.3 package metadata | 未啟動 browser、未執行測試 |
| OS | registry 原文 ProductName「Windows 10 Pro」、DisplayVersion 25H2、build26200/UBR9457；Environment version10.0.26200.0 | 保留原文，不自行修正 OS 行銷名稱 |
| GPU／runtime | Win32_VideoController、Win32_OperatingSystem 的 CIM 查詢均 AccessDenied | GPU、driver、TD app.build、實際 renderer、license 功能仍未知；沒有升權或改設定 |
| Callable tools | available tool name/description 沒有 TouchDesigner 專用匹配；已揭露 CUA native API disabled；shell 可用 | 未證明可以自動控制 TD，也未證明未來 adapter 不可能實作 |
| 產品 Host code | SDK 有 HostIdentity、CapabilityDirectory、namespaced IDs；source 清單目前僅 browser adapters，Host/receiver/input/preview 搜尋未見 concrete native provider | 目前不能把 SDK declaration 當成 runtime adapter |
| Electron | production package 無 Electron dependency/package script；PATH 無 electron；一般 production/handoff 檔案清單無 electron match | 未見 Grape Electron 包；不能推論整機完全沒有 Electron，也不能用 Codex runtime 代替 |
| TOE／TOX | 一般 `rg` file inventory 在 handoff/production 無 .toe/.tox | 此搜尋範圍未找到可驗 binary；未搜尋忽略目錄或歷史外部 Legacy 路徑 |

Production SDK 的具體定位為 `production/src/sdk/public-surface.ts:248` 和 295–301。檢查過該檔與 `production/package.json` 沒有 working diff；本報告仍是時間點觀察，不是對 B01 的完整快照 review。對應 source hashes 都在 report.json。

`handoff/examples/minimal-host-adapter/README.md` 明說它是 in-memory fake，沒有 TD thread、native atomicity、rollback、IPC、restart、deployment 證據。只能移植行為斷言，不可複製 receiver／qualification classes 作 production foundation。`HOST_QUALIFICATION_CONTRACTS.md` 的舊協調 History 字句以 IH-005／DEC-GRAPE-001 為準，不新增 Mixed History。

## 3. S07–S12 必要實機證據與依賴

| Slice | 可以開始的邊界 | 真 runtime 必須證明 | 驗收／最早 Gate |
| --- | --- | --- | --- |
| S07 | S01 host-free Graph；明確 Target 基本連線不等 PD3/4 | 零／一／多候選、matching／foreign identity、切換／取消／失敗保留舊對象、斷線重連／舊 epoch 回覆；真正接收端 authority、origin/action/size/optional credential 政策；各宣告 profile bootstrap、正確作用設備 | AT-S07-01/02；AT-S07-03 只在 PD3/4 各別定案後。G-DEPLOYMENT-CONFORMANCE 的實際 provider/profile |
| S08 | S01 同 snapshot＋S07 Target/authority/epoch | native prepare 不動 active；host-affine commit 前重新驗 lease/seq/revision 並合併當時 live 值；真 compile/error/diagnostic mapping/readback；候選、configure 後、restore 本身失敗及 lost reply；Par/OP、code/schema/document/meta/last-good/receipt 對照；native save 及 Reload Applied | AT-S08-01..04＋DSH04/05/07/08/10。**G-LU-HOST-005 第一個 native commit/failure/readback 就要取得證據，然後才擴大依賴** |
| S09 | S07 existing Target、control schema/readback/permissions；既有 live/control 不等先 Apply | TD Par/style/Bind/Export/expression／外部 ownership；scalar/vector/matrix/texture typed writes、shape/page/row/label/delete／真 typed Undo；CAS、driver/shape/revision、ABA、receipt/retry/load 競態；不回捲旁列、動畫或 Graph | AT-S09-01/02＋十個 DEC001 AT。G-LU-HOST-007 在 typed Undo；G-LU-UI-009 在 load/epoch/incarnation integration。跨 publication/reload 才依 S08 |
| S10 | S07 explicit Preview Target；capture hold 與 Apply 相交才依 S08 | MAT/TOP routing、handoff ticket/current 保留、takeover/Home、真 GPU/cook/PNG/stream、pointer/touch/resize/heartbeat/stop；個別 Viewer controls native Undo/TOE reload；實際遠端裝置／media／LAN scope | AT-S10-01..04；G-LU-HOST-006 在 Viewer write/Undo/persistence；HOST001/AUDIT001/002/UI-CONFORMANCE 按宣告 scope |
| S11 | S03＋S05「四模板用到」族＋S08 安全 provision；不等全391 leaves | 四份可編輯 Graph/resources、獨立 identity/output、native helper pixels；真正 TOE/TOX 保存；全新 process 冷重載、移除 manager/editor、再加入仍 render；embedded source/binary 比對 | AT-S11-01..03；G-LU-NODE-001、G-LU-HOST-001、G-LU-AUDIT-001/002 |
| S12 | S01 旁支可準備 package／service injection；final 按已驗行為整合 | 每個宣告 Static Web／Node-hosted／Electron 真 package、browser/runtime/version、permission/locality/storage/provider；client/Node 不同機器；斷外網、停 TD、清 cache 首次載入三情境分開；缺服務明示 unavailable | AT-S12-01..03；G-LU-HOST-008 第一個 embedded bootstrap；G-DEPLOYMENT-CONFORMANCE 每個宣告 package/profile |

共同 receiver 約束不能只驗前端忽略舊 ACK：Target=`{hostId,targetId,incarnation}`；lease 帶 bindingId/graphId/loadId/epoch；每次 delivery requestId/intentSeq/expectedHostRevision。OP path、label、URL 不是 identity。相同 request ID 只接受完全相同 payload；同 code cache 仍需新 delivery sequence。同 code 的 document-only delivery 也有排序與 receipt，code hash 不是 ACK。

S08 的失敗測試必須比較「native 實際狀態」和 receipt。indeterminate＋停寫是誠實的未知表達，**不能因此宣稱 last-good 已保留或 rollback 成功**。若必要契約被具體反例否證，保存 build/input/actual state，先判 adapter 缺陷；確實無法在既定邊界表達時才提 Architecture Change，只停止受影響依賴。

S09 的十個 DEC001 案例不可省略：①Graph Undo 不等 TD rewind；②Host Undo 不改 canonical/Graph stack；③至少10000 observations 不改 Graph revision/dirty/Redo、不 echo；④外部變更在 capture 前後兩種順序和 ABA 都拒绝 stale basis；⑤Graph Undo 完成後 live conflict 顯示 divergence、不 rollback model；⑥Ctrl+Z 明確 domain、draft/IME、本域空 stack 不 fallback；⑦UI/non-UI load/rebind/incarnation 的舊回覆失效；⑧conditional write 是新意圖，無 Binding 零 Host calls；⑨delay/retry/duplicate/changed payload/unknown/no-op 只按 confirmed own-domain receipts 推 stack；⑩Reload Applied/保存只存 canonical，不復活 session 權限。**LC-UI-100／AT-S09-03／G-MIXED-HISTORY 仍 deferred，不實作 coordinator 或 hidden mode。**

S10 的 leaf 精度不能縮成一般滑鼠 smoke：LC-HOST-023 MAT PNG 是512×512保 alpha、等待兩次絕對幀、等待時不阻其他 API，TOP 路徑另驗；LC-HOST-031 有6CSSpx tap/drag、雙指 movement6/spread10、spread>movement×1.5 pinch、第三指／取消後剩一指不續 drag；LC-HOST-033 是偶數64..1920×64..1080、350ms settle、無 held pointer/paused 才送、同 peer/source 不 Home。真實 device/native navigation 仍必需。

S11 四模板為 Phong MAT Graph、PBR MAT Graph、Phong Material Textured、PBR Material Textured。textured9／10 maps、white／flat-normal fallback、alpha map取R、Point Color／Alpha順序、PBR0.08／roughness最低0.0001、TBN／tangent／native finishing 按 `capabilities.json#LC-HOST-006.variants` 驗；不能以同名控件證明材質公式或像素等價。manager 尚在記憶體時 render 不能證產物獨立。

S12 的停 TD 必須停新建的 fixture instance；cache-empty 使用獨立 browser profile；外網 unavailable 使用隔離測試環境。不得為此停現有 user TD、清使用者 cache 或更改整機網路設定。這是測試隔離方案，沒有在本輪執行。

## 4. 最小安全 fixture 路徑（尚未建立／執行）

建議之後使用 `C:\Users\user\source\Grape\.verification\continuous-native-01\<unique-run-id>\`；只是一個新的臨時位置建議，不授權本 scout 在此寫入。初次可選本機已存在的 TD2025.32820，**另開空白拋棄式 instance**；不據此宣告該版本或任何平台已支援。

1. 指定 Implementer 完成獨立 production receiver/adapter、fixture bootstrap 與失敗注入設計。使用 public capability/authority/receipt 邊界，保留 Graph ownership 和 domain-separated History。先提供具體、可檢視的 fixture，再處理需要的 runtime 權限。
2. Coordinator 核對 run 與 Gate 的 TD 操作權限，綁定精確 executable、臨時 root、新 process、allowed Target/actions/outputs。Scout packet 禁止 launch；`G-LU-NODE-001` 的 required evidence 明載需另行授權 TD 操作。既有 run 已能涵蓋的普通工程毋需重問；若沒有可確認的實機操作授權，只補這個窄範圍，不能問一次新的全 Slice start。
3. 授權後在新 fixture process 記錄 app/build、OS/GPU/driver、license capability、PID／root marker；既有 PID12476 排除。未驗證本機 TD 自動啟動／bootstrap interface，不能寫成已可用 CLI。若 license/UI/physical 動作確實需要人，只請人開啟準備好的新工程並執行其 bootstrap，不要求暴露目前 Legacy 或 secrets。
4. 最初只造 fixture-owned TOP、常數顏色 shader、一個 live scalar、全新 identities。以 explicit localhost descriptor 連接專用 receiver；後續 harness 選未占用的專用 port並記錄，不借用 Legacy URL、不掃 LAN。
5. S07 connect/cancel/failure/reconnect/authority → S08 A prepare/commit/readback → prepare 中外部 live change → A/B/Undo ordering → duplicate／changed-payload retry → candidate/configure/restore failure＋lost reply。輸出 actual Par/OP、native code/schema/document/meta、pixel與receipt。任一 uncertain state 停該 Target 依賴寫入，保留反例。
6. 加第二個 fixture Target 驗 wrong-target／incarnation，加入 MAT 才能支撐 MAT compile/helper/preview/template。TOP 成功不外推 MAT。UI/non-UI load 的 late replies 要同時在產品和 receiver 邊界驗。
7. 依序擴到 typed controls／Bind/Export／own-domain Undo、Viewer/capture、四模板及真 TOE/TOX。所謂「external」測試對象也必須是 fixture 內新造、可丟棄的鄰接 resources，不是使用者資產。
8. 將 package 保存於 fixture root，停止「自己的」fixture process，再於新 process 冷重載驗 manager absent／re-add。歸檔 logs、pixels、packages、hashes、receipts 後才處理自己建立的資源。最後才擴 declared profile／遠端 device 矩陣。

每項證據必綁 exact I/build、fixture input hash、TD/OS/GPU/browser/device、request/identity/epoch/seq/revision、實際動作／expected／actual、native state與image、receipt／recovery、失敗／未執行欄位及受影響 Gate。不要記 credentials。獨立 Fresh Review 仍需 exact candidate 與隔離 context，本 scout 不出 verdict。

## 5. 真正缺口與窄範圍 Human 問題

| 缺口 | 類型／影響 | 後續處理 |
| --- | --- | --- |
| Concrete production Host provider/harness 未見 | 工程工作；不是新的產品決策 | B01 後由同一 writer 派 S07＋最小 S08，先完成可檢視實作 |
| 新 fixture/process/Target 操作範圍尚未綁定 | 本 scout 明確不允許；現有 process 不能作授權替代 | Coordinator 先對既有 run 進行權限對照；只在 TD 實機權限欠缺時補窄授權 |
| 無已驗自動 TD 控制路徑／native UI tool | tooling feasibility 未驗，非必然缺軟體 | 準備 bootstrap；真的遭遇 UI/license/physical 需求才請 Human 操作新工程 |
| GPU/driver/runtime metadata 無法取得 | CIM AccessDenied；不是產品FAIL | 後續從隔離 TD fixture 取實值；本輪未要求升權 |
| Captured original TOE/TOX 路徑不在 bounded search | S11 embedded audit／complete-replacement claim 缺 evidence | Production 新 fixture 可自行造；原 Legacy binary 比對另以已知 provenance或Owner提供精確資產定位，不掃整機 |
| macOS/Metal、iPad／touch/stylus、第二機器未供實测 | 只阻相應 declared matrix cells | 可續本機工程；需時向 Human 要確切 device/build/session，不把 localhost 說成遠端成功 |
| Electron package/provider 尚未見 | S12 工程／package evidence | 不因有 Node 或 Codex app 就判 Electron PASS；後續準備真正 package |
| G-PD-3 | 唯一異ID manager adoption政策 | 僅 fallback 分支前請 Owner選成功／拒絕及確認範圍；基本明確 Target 繼續 |
| G-PD-4A | Native Viewer 正式入口可見性／access | 與4B分開，在該 window 分支前決定 |
| G-PD-4B | Native Parameters 遠端 window作用範圍 | 在該分支前決定正確設備、權限／確認；不能自行合成兩視窗共用 locality規則 |
| OC09／S08 Updates 交集 | withdrawn可見自動生成與既有operation-end契約 | 只有將決定可見自動觸發的 batch 需窄澄清；不刪除 Updates、不擅自重加 withdrawn 行為 |

PD2只影響 named-layout retention，不阻此 scout 或 S07 basic。G-LU-HOST-003是舊手冊與現行 optional credential／Bind endpoint 行為的差異，不是所有 Host 工作的停工理由。沒有發現必要架構契約被否證的反例，因此不能升為 Architecture Change。

Owner已移除過去 LAN/Tailscale preview delivery-link prerequisites，歷史 NOT_EXECUTED不改成PASS，也不重新設為交付門檻；S07–S12本身的 remote device／provider locality／native runtime義務仍按其 scope 取得證據。

## 6. 可以繼續的獨立工作

- 原 writer 的 B01 S06 繼續，本 scout不接管。
- S05 portable families與 S11純Graph/template/resource資料。
- S07 service registration、explicit Target/lifetime／authority與缺provider路徑。
- S08 same-snapshot／scheduling/cache／receipt/readback contracts、receiver negative fixtures及最小 TD harness。
- S09分域dispatch／CAS/ABA/mirror，S10 Viewer描述／touch recognizer／resize算法；模型成果只算所測範圍。
- S12 provider/bootstrap/package邊界、typed unavailable和 restricted bridge 設計。

報告的 JSON 保存完整 S07–S12 capability membership、prerequisite outputs、原 AT文字與 Gate投影，以及逐Slice runtime清單和26個source hashes。原資料的 planned/unresolved/deferred 是來源狀態，不能當成本次執行結果或state更新。

**STOP_WRITING。**

