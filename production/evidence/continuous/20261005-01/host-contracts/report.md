# S07 真 Host 接合批次：唯讀契約準備

狀態：**規格／工程分解，沒有實作、runtime 執行、technical PASS、Fresh Review、Human acceptance 或 Gate 裁決。**

第一批可收斂為：一個新建隔離 TD Manager、可區分的多個 client sessions 與明確 Shader Targets，先建立 discovery/bootstrap、identity/authority、只讀 Target inspection、安全切換及失敗／重連。S08 再接真 TD publication，必先證明 native fenced commit 與失敗讀回。跨身分 adoption 不因「只有一個 Manager」而得到答案。

## 1. 身分、輸入與邊界

- 作者：`/root/continuous_host_contracts_01`；run：`GRAPE-CONTINUOUS-20261005-01`。
- 固定 repository source：`9357e2152f0d1150d31cae7d7c25085af203d288`；全部以 `git show` 讀取，沒有讀並行 B01 的工作樹 source。
- Checkpoint：`9003c00b214ac29cafcb6cc22ac10693ac92a0bf`。當前 source pin 的 state 仍為 active S06、I `30c867945c992d25956a2a32825de34571f7749e`；這是固定 blob 內容，不是對正在進行 B01 的即時進度判斷。
- Packet：`production/evidence/coordinator/continuous/20261005-01/host-contracts-scout-packet-01.json`，5949 bytes，SHA256 `489458cd6fa516128cd9e2818bffc914ef362a1817976ad9a9008dafce17ef80`；已核對。
- 全部八個 inputRefs 的 bytes／SHA256 都符合 packet；只有它們與 packet 以實際檔案讀入。新 Human controls 不從其他 chat、摘要或未列檔案補讀。
- 只寫指定 ignored reports；沒有 TD／Bridge／網路／process enumeration／browser／service／安裝／外部 Legacy 操作，沒有產品／state／frozen／committed evidence 寫入，沒有提交推送或再派代理。

| 輸入 | bytes | SHA256 |
| --- | --- | --- |
| production/evidence/coordinator/continuous/20261005-01/human-run-authorization-01.json | 22400 | 49dd9a0500ae2a07e868fc1cc58c6528f0b50ab0c349f33c9bea8442aa9922fa |
| production/evidence/coordinator/continuous/20261005-01/host-feasibility-collection-01.json | 5323 | d1a6c11aad7f7794edff065aa28b04b8b781923e39cc4ab2c70c744c0c34f7a6 |
| production/evidence/coordinator/continuous/20261005-01/owner-host-direction-01.json | 2760 | a6b054577ff55284cb661b80edd78d8eaf1483bfb3a4afdb274ff618ed245025 |
| production/evidence/coordinator/continuous/20261005-01/owner-host-direction-02.json | 1920 | 9903ff2b6a1509b8f11fafadd784ae2c02d4786be76a341ba2e2ec5fb3904c87 |
| production/evidence/coordinator/continuous/20261005-01/human-native-isolation-control-01.json | 2209 | 22cf8a8d4c9285d79f20178446047ad646ac8ab25bf845823bb3f99239705173 |
| production/evidence/coordinator/continuous/20261005-01/human-native-isolation-control-02.json | 1243 | 4ca569ed402b5c4b0be4e3f48eb34f85a8482d178248419fe691c992fd57f2c3 |
| .verification/continuous-host-feasibility-01/report.md | 17282 | 07436b203c4540a830b9444c35dcfcb18f09291d140ffb89e3e7a0359e493951 |
| .verification/continuous-host-feasibility-01/report.json | 99190 | e8c7a6fb9e1ab21339138bc6328e673da604ac79e7232b41f83a5ec6701e8c4c |

## 2. 角色不能混為一談

| 角色 | 所擁有／負責 | 身分與限制 |
| --- | --- | --- |
| TD Host 實例 | 具體執行環境；持有 OP/Par、active shader、current values、native queue。 | actual process/instance witness、project/work-directory、hostId；不得只用 URL、port、名稱或歷史 PID 認定。 |
| TD Manager／服務元件 | 提供 discovery/bootstrap、registered Shader directory、listener/access policy；可服務多個 client sessions 與多個 Shader Targets。 | 服務生命期與 session 政策；沒有契約規定一個 Manager 只能對一個 Connection，也沒有新增全域 singleton。 |
| Connection | 一個通訊 session/request-reply channel；可中斷、關閉、重建。 | peer/service/session identity；不擁有 Graph、不自動取得全部 Targets 的 authority。 |
| Target | 接收 artifact/control/native operation 的明確位置。 | exact {hostId,targetId,incarnation}；OP path/label 只是 locator。重建同 path 不是原 Target。 |
| Binding | 把 canonical Graph 的明確 delivery/live-write 意圖連到 Target；持 lease、sequence、receipts、runtime projections。 | lease={bindingId,graphId,loadId,epoch}+Target；reload/rebind/reauthorize 失效。 |
| Graph／Application／EditorContext | Graph 擁有 canonical document/History；Application 授權命令與轉換；Context 擁有導航、selection、draft 等編輯狀態。 | graph persistent ID 與新 loadId 分開；Host readback 不是自動模型寫入。 |
| UI Workspace／Panel manager | 註冊、掛載、routing、layout/focus 與 Panel lifetime；這是部署啟動次序中的 UI Manager。 | Panel/mount lease 不是 Host lease；Panel move/hide 不換 Target，不把 TD Manager 塞成全產品同步所有者。 |

Human `owner-host-direction-02` 已允許沿 accepted contracts 採「一個 disposable Manager、多 sessions、多 explicit Shader Targets」的首路徑。Manager 不是每個 Shader 一個的強制配置，也不是跨程序全域 singleton；現有抽象 discovery/candidate 邊界須保留。UI Workspace 的 Manager 是另一責任。Target、Connection、Binding、Panel 的有效期彼此不能替代。

Graph defaults／canonical document、Host current values、Host last-applied document、副本 cache／mirror 是不同資料。Host 可以保存已套用文件，但不能勝過未保存／invalid draft；必須顯式 reload/import 才影響模型。Target attach/readback 不寫 Graph History；Graph Undo／Host Value History／Native Definition History 維持分域。

## 3. 公開操作與第一批輸出

`OP-01` 是已有 SDK 宣告；其他 operation 名称是可改名的工程分解，**不是宣稱 production 已有這些方法，也不是新增已接受 API 拼字**。Writer 應在 SDK 建 service-specific typed input/output、authority、receipt、retry/cancel/cleanup 與 runtime validation，登記穩定 contract/schema locator；不可只傳任意 JSON method。capability ID/version、scope 與責任不得改成猜測 alias。明確 Target 出現前只使用 application discovery／bootstrap；不為 registry 偽造 Target。

### OP-01 — CapabilityDirectory

- 公開動作／effect：register / provide / require / withdraw（既有公開宣告）；application integration mutation/query。
- 輸入：exact CapabilityDefinition {ref:{id,contractVersion},owner,scope,operations:[{name,contract,effect}]}；target scope 必帶 exact HostIdentity。
- 輸出：typed Service 或 exact CAPABILITY_UNAVAILABLE。
- 必要規則：初始 ID version=1；register/provide 原子、duplicate 拒絕，不 alias/fallback/silent replace。withdraw 只撤 lookup，已取得 handle 仍須 service lifetime fence；不能宣稱遠端取消。
- 來源：handoff/13_PRODUCTION_CONTRACT_SURFACE.md:94–118; handoff/contracts/public-surface.ts:149–184。

### OP-02 — grape.host.discovery@1 application

- 公開動作／effect：discover / resolveDescriptor（規劃名稱）；query。
- 輸入：explicit locator/entry descriptor、expected identity/expiry、查詢意圖與取消生命期。
- 輸出：零/一/多候選及其 Target/service identity、顯示/project/path/能力摘要；沒有 write grant。
- 必要規則：不以候選唯一推定可信；無 Target 根入口仍無 Target。無 provider 明示 unavailable。Static Web 不新增 LAN 掃描；不把 historical manager ID、URL、port 或 UI active Context 當 host identity。
- 來源：06:13–25; S07:344–351; LC-HOST-001/012。

### OP-03 — deployment/provider bootstrap → grape.host.target-session@1

- 公開動作／effect：verifyBootstrap / connect / authorize（規劃名稱）；session mutation with read-only handshake。
- 輸入：copied expected Target identity、descriptor expiry、caller origin/peer context、requested actions/capability versions、optional credentials、request identity。
- 輸出：actual peer/fixture metadata、resolved exact identity/capabilities、per-action authorization result、revocable session/lease or explicit rejection。
- 必要規則：identity match 不等於 trusted authentication；TD側核 action/origin/credential/size policy。先核 fixture PID或等價stable instance、project、work/source directory、receiver identity及port；缺失/不符零 native write。不得要求 discovery 為了註冊 application scope 而偽造 Target。
- 來源：06:13–25; HOST_QUALIFICATION §2; human-native-isolation-control-01/02。

### OP-04 — HostDirectory / target-session query

- 公開動作／effect：listTargets / readTargetState / inspectDocument（規劃名稱）；query。
- 輸入：已明確連線 service/target、query request identity、所需讀取權限。
- 輸出：registered valid unique Targets，顯示 project/path；Target revision、applied raw/document/version/state與fresh明示；inspection原始claim。
- 必要規則：非法/重複/unregistered targets 不成為可寫項目；較新版本列表禁選並附理由，direct explicit inspection 保 raw readonly。fresh 必須 provider 明示且不存在 raw。inspection不能授權；copy readonly view 改 mode 無效，raw/version/Target改變撤claim。
- 來源：LC-HOST-003/012; HOST_QUALIFICATION §10。

### OP-05 — Application Target selection

- 公開動作／effect：switchTarget(clean / keepDraft / apply / cancel)（規劃名稱）；navigation/session mutation; no Graph Undo entry。
- 輸入：明確候選 Target copy、switch intent、原 Graph/load/revision/Target、所選 draft policy。
- 輸出：最後 readback 成功才替換選中 Target；failure/cancel保留舊選中對象與工作。
- 必要規則：先等 Graph Operation 完成或 busy 拒絕；keep 寫完整document後精確讀回；apply 必須 Binding applied receipt（S08缺席明示 unavailable，不模擬成功）；cancel before dispatch不呼provider。每await重驗意圖/base/Target；開始過apply後取消導航不能聲稱遠端撤銷。
- 來源：LC-HOST-003; HOST_QUALIFICATION §10; AT-S07-01。

### OP-06 — grape.host.target-session@1

- 公開動作／effect：observeStatus / retryReadback / reconnect / disconnect / unbind（規劃名稱）；query/event/session mutation。
- 輸入：Target identity、current session/epoch、已知 revision、visibility、pending request/receipt bases。
- 輸出：connected/interrupted/restored/changed 等可辨狀態、stale observations、新驗authority/capability/epoch，或typed failure。
- 必要規則：visible頁只讀恢復間隔至少5s；401/403/changed不自動輪詢；20s client timeout與15s未開始queue等待失敗/queue滿要可辨。same revision只恢復連線；changed要求review不覆draft。重连新lease/epoch、先readback；不blind replay write/Pulse/window。unsubscribe/cleanup不刪Graph或Host產物。
- 來源：LC-HOST-013; 05:87–101; 06:58–66。

### OP-07 — provider access / host-affine dispatcher

- 公開動作／effect：validateRequest / enqueueAction / queryReceipt（規劃名稱）；query/mutation/event according to named operation。
- 輸入：valid schema、request identity、exact target/session/action、origin/peer/credential policy、size/deadline；寫入另帶basis。
- 輸出：accepted pending / definitive denial / busy / unavailable / receipt or indeterminate；status拼字由typed契約定義。
- 必要規則：queue capacity bounded、未開始逾期零執行、stop拒新/queued；只有host-affine loop碰native objects。始終在side effect前再驗identity/authority；開始後clienttimeout不是取消證據。HTTP provider映射400/401/403/413/415/503；不強制所有transport使用HTTP。
- 來源：LC-HOST-008/010/013; 06:48–56; HOST_QUALIFICATION §6。

### OP-08 — TD service administration contribution（精確typed contract待writer定義）

- 公開動作／effect：setCredentialRequirement / setReachability（規劃名稱）；explicit service mutation; outside Graph。
- 輸入：明確service instance/admin action authority、expected configuration、desired mode；非Shader publication意圖。
- 輸出：實際credential/reachability policy與成功或保留舊設定的失敗。
- 必要規則：Requiretoken default off；off允缺/舊credential但仍驗action/origin/identity，on讀寫都需current token；toggle不換port/token/queue。Allowlan default false；strict同port rebind失敗回舊mode，不漂移port、不改firewall，old listener拒新操作。作用層是TD服務元件，不因Target UI切換而自動改。
- 來源：LC-HOST-008/009; 13:96–118。

### OP-09 — optional share/launch/clipboard/QR providers

- 公開動作／effect：shareDescriptor / renderQR / copyLink / launchEditor（規劃名稱）；query for descriptor; explicit external mutation for launch/copy。
- 輸入：同一明確Target與可用origins；經驗证http/https入口；必要現有credential僅經准許share envelope。
- 輸出：保Target連結、local-only說明、QR/copy/launch outcome，或unavailable。
- 必要規則：share不啟LAN/改token；先留目前頁link，query失敗仍可用；requiretoken且缺token不給other origins；invalid origins丟棄、token非query/Graph/log。Windows app launch最多10×300ms探活、early nonzero/spawn failure僅fallback一次、0視為handoff；無provider不假稱已開其他設備。後續batch，首個basic Target path不依此。
- 來源：LC-HOST-002/011; 07; S07:344–351。

### OP-10 — grape.host.native-window@1 target

- 公開動作／effect：native Viewer / native Parameters / existing direct Pulse（保留底層義務）；explicit native mutation。
- 輸入：exact Target/action/device/authority；Viewer與Parameters各自policy。
- 輸出：正確TD設備的視窗動作結果；不Apply/save/generate，不Graph Undo。
- 必要規則：Human退役兩個UI按鈕；本批不還原、不以此推論API/Pulse刪除。既有Viewer localhost proof與Parameters通用guards不同，remote disposition仍需各別處理。無決策不自行合併成一個isLocal或自動全刪API。
- 來源：LC-HOST-021/022; G-PD-4A/4B; owner-host-direction-01/02。

### OP-11 — grape.host.artifact-publication@1 target（S08前置）

- 公開動作／effect：deliver / prepare / fencedCommit / receiptReadback / recover（規劃名稱）；mutation/query。
- 輸入：requestId、lease+Target、intentSeq、expectedHostRevision、同次generation artifact/code/schema/document/provenance、explicit resetSourceIds。
- 輸出：applied / retained / rejected / superseded / indeterminate，原basis與新revision；native actual readback。
- 必要規則：prepare不動active；native提交區段重驗lease/seq/revision/authority、取當時live values並合併compatible id/type；同request只同payload重試；code cache命中仍新delivery；document-only仍排序receipt；cleanup failure另報。S07不得stub applied。
- 來源：06:27–46; 05:63–85; HOST_QUALIFICATION §3; S08:368–407。

## 4. S07 全部 mapped leaves 與本批範圍

固定 `handoff/compatibility/capabilities.json` 的十一個 S07 records **全部沒有 `operationSpec` 欄位**。packet 的「operationSpec」提示不能作為補造資料的理由。下列從實際 `contracts`、`failureBehavior`、`importantEdgeCases` 等欄位提取；JSON 另保留每筆來源與 JSON pointer。Shader catalog 的 operationSpec 不可移植成 Host schema。

| ID | 保留的產品行為 | 分批與限制 |
| --- | --- | --- |
| LC-HOST-001 | 由Shader帶明確ID開正確Editor；Manager可辨識 | matching明確入口可做；唯一異IDfallback維持G-PD-3，不能借候選唯一授write權。 |
| LC-HOST-002 | Windows app launcher與一般browser一次fallback | 後續optional launcher；http(s) only、最多10×300ms、code0 handoff；本scout不開browser。 |
| LC-HOST-003 | registered合法唯一Target清單；clean/keep/apply/cancel安全切換 | 第一批list/inspect/clean/keep/cancel；apply分支等S08真applied；更版列表禁選和direct readonly不同。 |
| LC-HOST-008 | credential optional/default off；on時read/write需當前token | 首receiver必要authority matrix；完整service設定toggle保port/token/queue；不得偷偷全改必填token。 |
| LC-HOST-009 | loopback default；可選LAN；strict同port rebind | 第一批loopback；LAN/toggle為後續未交付義務，失敗保舊mode，不能漂移port或改firewall。 |
| LC-HOST-010 | 來源/action/format/size驗證後才排隊 | 首receiver必驗；HTTP具體status/header有oracle，transport本身仍工程選擇。 |
| LC-HOST-011 | Share正確Target link、local QR、copy/manual fallback | 後續optional share；不更LAN/token，壞origins去除，secret不入query/Graph/log。 |
| LC-HOST-012 | 無Target或失效ID不猜另一Shader | 第一批；root入口繼續host-free/提示，deleted ID拒絕，與明確manager create入口分開。 |
| LC-HOST-013 | 中斷只讀recovery；revision變化review，lost write不重送 | 第一批；至少5s visible polling、401/403/changed停止、20s client/15s queue等待、busy與compileerror分開。 |
| LC-HOST-021 | Native Viewer底層API有自己的local proof | Human已退役UI button；本批不還原；API／direct consumers不因此刪除，不宣稱Gate關閉。 |
| LC-HOST-022 | Native Parameters／TD Glslparameters Pulse作用正確OP | Human已退役UI button；底層API/Pulse與remote scope另列，不借Viewer local-only規則。 |

`AT-S07-01` 要驗零／一／多候選、matching／foreign、切換／失敗／取消與保原對象；`AT-S07-02` 要驗 stale epoch/token、wrong origin/format、斷線重連、舊回覆及離線仍可編輯保存。首批有界技術結果不能寫為整個 S07 或十一葉全 PASS。`AT-S07-03` 依各自產品決策分支，不把按鈕退役當 API 刪除或跨ID政策決議。

## 5. 失敗、取消、重連與 offline 測量矩陣

**所有列均 NOT_EXECUTED；是後續最少應收集的證據，不是測試結果。** 多候選與非法資料可在純契約 harness 驗決策，但真正 connect/reconnect/receiver authority/queue/native side effect 必須用隔離 TD；fake provider 不可替代原生列。

| ID／觸發 | 期待行為 | 應量測 | 來源 |
| --- | --- | --- | --- |
| M01 缺provider；零/一/多候選；無target根入口 | 只列候選；明確target才能connect；不選第一個／異ID唯一者 | candidate列表、selected Target前後、provider/receiver calls=0於無授權路徑；Graph/dirty/History不变 | AT-S07-01; LC001/012 |
| M02 valid matching descriptor；expired或foreign identity；same path replacement | matching仍單獨授權；expiry/mismatch拒絕；同path新incarnation淘汰舊handle | expected/actual identity、expiry、session/lease生成、denial，fixture target mutation counter | AT-S07-01/02; 06 §identity |
| M03 一隔離Manager；兩client sessions；至少兩明確Targets | session各自；切Target不跨寫；錯Target grants不能用；不加全域singleton | sessionA/B + targetA/B矩陣、每request送收路徑、Target側ledger；其餘對象無變 | owner-host-direction-02; AT-S07-02 |
| M04 Requiretoken off/on、valid/missing/old credential、toggle | off仍受其餘guards；on讀寫皆拒bad credential且body零作用；toggle保port/token/queue | 政策前後及action outcomes；credential僅redacted/指紋、不記secret | LC008; G-LU-HOST-003 |
| M05 wrong origin/action/peer、invalid JSON/object/MIME/framing/size | 先拒再排隊；無權/壞請求不能native mutation；缺Origin不自動等於cross-origin許可 | HTTP採用時400/401/403/413/415與no-store/nosniff/no-referrer/CSP；queue入列/TD mutation=0 | LC010; AT-S07-02 |
| M06 正常connect、失敗connect/unknown target/deleted target/cancel | 只成功readback+guards才改selection；其餘保前次有效Target，不guess其他Host | selection/Graph document/selection/History before-after；cancel before dispatch calls=0 | AT-S07-01; LC003/012 |
| M07 active Operation、dirty Graph、keepDraft寫入失败/讀回不同、並行edit/reload | busy守護；完整draft精確roundtrip後才switch；各await後驗load/rev/intent；失敗不離原對象 | operation timing、snapshot hash、stored/readback bytes、old/new loadId；舊Graph不被导航重寫 | HOST_QUALIFICATION §10; LC003 |
| M08 apply-and-switch缺能力/retained/rejected/indeterminate；apply開始後cancel | 未取得applied不可switch；開始後不聲稱物理取消；無pubprovider明示不可用 | receipt和native state分開；navigation維持原Target，後續write policy清楚 | S07/S08 dependency; LC003 |
| M09 newer/corrupt/raw-empty target document；偽造inspection clone | readonly/recovery保原raw，不以demo覆寫；fresh須明示；copy-mode不能grant write；new raw/revision失效claim | raw bytes/hash、parse結果、claim identity/invalidation、publish拒絕、native沒有改 | HOST_QUALIFICATION §10 HQ46/47 behavioral oracle |
| M10 瞬斷、visible/hidden、retry/online、auth/forbidden/changed | visible暫斷只讀>=5s；401/403/changed停止auto poll；compileerror不當掉線 | monotonic query timeline、operation kind、UI status；Graph可編輯ACK save且dirty/History符合本域 | LC013; AT-S07-02 |
| M11 same revision恢復；revision changed；restart新incarnation | 同rev只恢復；changed需review保draft；restart重驗instance/capabilities/authority、新lease/epoch、先readback | old/new session/epoch/incarnation/rev與readback bytes；pending舊reply不影響current | 05 §5; LC013 |
| M12 delay/duplicate/out-of-order reply、switch/load/rebind/unbind/dispose後舊reply | 在接收側與Application雙端fence；不污染新Target/diagnostics/model | request→Target/lease/load/epoch對照，actual writes、stale callback counts、Graph state对照 | AT-S07-02; G-LU-UI-009 |
| M13 queue滿、未開始deadline expiry、stop、開始後timeout/lost response | 滿busy、未開始expiry零執行；已開始未知不能定為未寫，readback/receipt查證、不重播Pulse/window/native edits | enqueue/start/finish/drop monotonic timestamp、client20s/server15s路徑、native execution count、outcome | LC013; HOST_QUALIFICATION §6 |
| M14 disconnect/unbind/Panel hide/move/remount/close | 解除自己的lease/subscriptions/mirror；不刪Graph、Host最後產物或他人session；UI移動不重連 | subscriber/timer counts、pointer/gesture cleanup（若能力啟用）、native resource identity、Graph Undo/Redo | 05 §5; 06 §preview/reconnect |
| M15 fixture ownership/project/workdir/peer缺失或不符；port衝突 | 正常startup核對不足就零native write；不沿用Legacy端點、不restart/save現有user TD；後續明確fixture可另選專用port | assigned-vs-actual tuple、listener bind result；本輪NOT_EXECUTED；不以URL/PID單點等同權限 | human-native-isolation-control-01/02 |
| M16 Allowlan strict同port rebind成功/失敗、舊keepalive listener | default loopback；失敗保舊mode/port/session/queue，不修改firewall；新操作不落old listener | before/after bound policy、port/session IDs、graph/native/revision不變；實際遠端另驗 | LC009; later reachability batch |
| M17 share失敗/QR失敗/clipboard拒絕/app launcher失敗 | 保當前Target link、manual copy；share不改服務設定；launcher fallback一次、非http(s)拒絕 | link target/origin/secret-redaction、external action計数；真browser/provider另驗 | LC002/011; later entry/share batch |
| M18 首個declared deployment真bootstrap/provider；無Host／無write | 同核心host-free可用、缺cap明示、作用設備正確；三profile不以模型測試互證 | profile/package/TD/browser/build/locality/permissions；實際startup+import-boundary evidence | G-DEPLOYMENT-CONFORMANCE; 07 |
| M19 停止fixture TD後已載入頁；断外網；空cache首次載入 | 分開三情境；已開頁可編輯存檔不等於PWA首次offline能啟動 | 各場景assets requests/host availability/storage ACK，不改使用者cache/全機網路 | G-LU-HOST-008; S12 residual |
| M20 G-PD-3 foreign-manager-only；Native UI/API分支 | 首批不作跨IDadoption判決、未交付分支清楚；兩退休buttons不出現，底層API不推定消失 | Gates/殘餘mapping；此分析不出AT-S07-03 PASS | owner directions; AT-S07-03 |

要同時量測「Application 忽略舊結果」與「receiver 未對新 Target 產生副作用」。只看 UI 沒變不夠。所有 query 也要核對要求的讀權；但 bootstrap／inspection 的讀取成功不等於 publication authority。Cancel／withdraw／disconnect 只撤本方 lifetime，不能假稱已取消開始中的遠端 native 動作。

## 6. 先前 feasibility 與最小實機接合要求

沿用既有 feasibility 在 `2026-10-04T19:55:37.1989224Z`、source pin `02313a0` 的觀察：TD 安裝使 Windows 隔離驗證起點可規劃；它沒有驗 native automation、TD內嵌Python、GPU/driver/renderer/license、真receiver或部署。**沒有重做環境／程序探索**。該報告中的既有使用者TD程序只是歷史保護對象，不能拿舊 PID／名稱當目前 fixture authority。

後續由原 writer 在 bounded packet 下建立可檢視的 fixture：唯一明確root/project、專用listener、run marker與test-owned Targets；正常startup先回傳實際 process/instance、project file、working/source directory、receiver/peer identity，与指派對象比對，再決定是否允許任何native write。缺資料、不符或port collision停止該連線的write，不借Legacy／Bridge既有session。初始選port與LC-HOST-009運行中strict同port rebind是不同情境，不可借後者錯誤允许漂移。

服務介面至少能讓 client 驗 explicit bootstrap／exact Target／capability版本／action authority、查Targets／revision／applied raw及確認結果、關閉自己的session、觀察read-only reconnect，並能在host-affine queue記錄native前驗證與執行。首批未提供publication就明示capability unavailable，不能用stub applied解開S08。機器資料與receipt由fixture測量輸出，不靠Graph存session權限，也不開一個通用任意script執行RPC作為產品公開操作。

Continuous run 的既有權限及 Human isolation controls 已足以讓後續普通隔離fixture工程循正常流程，不新增每次實機前的重複Human gate。真正license／UI／device／access不足才只停受影響部分交Human。**本scout本身仍沒有任何runtime權限。**

## 7. S08 前置：第一個 native I 就要收的東西

| ID | 要求 | 來源 |
| --- | --- | --- |
| S08-P1 | Target成功/失敗/reconnect基本路徑必有exact reviewed revision與native證據；share/windows無須先全交付。 | S07 prerequisite output; 08:376 |
| S08-P2 | provider提供真正host-affine executor/queue與test-owned receiver；至少一fixture TOP、已知last-good、live scalar，第二Target驗wrong-target/incarnation。MAT另驗，不外推。 | 06 §§publication/live; feasibility report §4 |
| S08-P3 | 定義真TD generation profile/shell與source binding map。現production functionProfile extends esProfile，輸出#version 300 es；把shader文字直接送TD不證相容。TD profile應透過既有GLSLProfile contribution，無TD字串條件散入Graph。 | production/src/modules/function-operations.ts:251–278; image.ts:85–149; 13 §4 |
| S08-P4 | 同snapshot捕捉Compilation document/artifacts/bindingSchema/provenance/profile/loadId/revision；不能await後取目前Graph拼舊code。complete signature包含generator/target/module及executable deps，hash不是ACK。 | compiler.ts:44–65; sdk/editing.ts:211–230; HOST_QUALIFICATION §3 |
| S08-P5 | 真正receiver在side-effect前驗Target、lease、requestId/payload、intentSeq、expectedHostRevision、sources id/type/reset；prepare與commit間可故意延遲，但prepare不可碰active。commit在native序列區重驗並取最新current values。 | 06:27–46; AT-S08-01 |
| S08-P6 | native讀回必對照active code/schema/applied document/meta、host revision、OP/Par實際identity/current values、last-good與receipt；stale前端ACK隔離不是receiver fence證據。 | AT-S08-02; G-LU-HOST-005 |
| S08-P7 | 第一個native I就測candidate失敗、正式configure後失敗、restore本身失敗、lost reply；retain/applied/indeterminate須以真狀態支撐。未知停該Target後續write，不能把quarantine當rollback成功。 | 08:384–405; 10:545–563 |
| S08-P8 | 排序測A→B→Undo A cache命中仍新seq、prepare中live更改保留、同request同payload重試與改payload拒絕、document-only revision/receipt、不重compile、cleanup failure不抹applied。多session concurrency/expected revision必守。 | 06 §publication; HOST_QUALIFICATION §3 |
| S08-P9 | readback/inspection與ReviewTickets本身無write authority。Reload Applied獨立顯式確認；dirty/sessiondraft/History/subscriptions/load callback整體life-cycle依G-LU-UI-008/009驗，failed save不Apply新draft。 | 05:42–51/87–101; AT-S08-03; AT-DEC001-07/10 |
| S08-P10 | Graph Undo先完成模型；有active Binding才嘗試新的conditional live-write，沿原basis，衝突顯divergence、不rollback Graph Undo、不resetSourceIds回defaults；publication與live propagation分開。Mixed History維持deferred。 | 05:83–85; 06:9–11; S08 related AT-DEC-GRAPE-001-04/05/07/08/10 |

最小接合可先使用 fixture-owned TOP、已知last-good與一個live scalar，再用第二Target驗錯目標／replacement；MAT compile/helper/preview不從TOP結果外推。G-LU-HOST-005的時點是第一次native commit/failure/readback，必須在擴大依賴publication前取得對照。indeterminate＋停寫是未知的正確表达，無法取代last-good／rollback證據。

## 8. 固定 production 的現有接點與缺口

| Source／精確位置 | 已存在 | 仍需實作／驗證 |
| --- | --- | --- |
| production/src/sdk/public-surface.ts:243–304 | 已有exact capability/HostIdentity宣告與9個初始IDs。 | 缺runtime directory、service-specific typed contracts/validators/providers；declaration不是服務實現。 |
| production/apps/web/main.ts:74–128,278 | bootstrap Definitions、browserIdentity、EditorApplication、Workspace；Host-free文字在:131。 | 新增provider injection/Host-facing application orchestration seam需writer設計；禁止靠core global/URL假target。 |
| production/src/application/editor.ts:435–478,758–798 | 建構注入identity/kind/profile/storage/output；install/new/open已有Graph/context disposal與load identity。 | 尚无Host attach/unbind/reconnect/inspection claims及Binding lifecycle；接合須涵蓋UI與non-UI load入口。 |
| production/src/application/editor.ts:977–1022 | generate同時捕捉snapshot；save以storage.write ACK且loadId guarding；reopen驗base。 | keepDraft需完整write+exact readback的新導航契約；不能僅呼save後假定可安全離target；不能將storage ACK當Host applied。 |
| production/src/generation/compiler.ts:44–65; production/src/sdk/editing.ts:211–230 | Compilation攜document/loadId/revision/profile/artifacts/bindingSchema/provenance。 | 缺Updates/Binding delivery與receiver receipts；generation success不是native compile acceptance。 |
| production/src/modules/image.ts:85–149; production/src/modules/function-operations.ts:251–278 | 現有GLSL ES3.00/函式profile（portable輸出）。 | 最小native Apply需要明確TD shell/profile與actual build compile/readback，無證據不得重標為TD相容。 |
| production/src/persistence/codec.ts:94–164 | 新格式version/unknown/raw recovery與512000-byte loader/writer boundary。 | Target inspection以既有loader驗data；不把JSON.parse等同有效Graph、不把空raw認定fresh；無Host-grant發行功能。 |
| production/src/ui/workspace.ts:35–50,83–181,256–295,428–441 | Workspace管理Panel records/routing/mount與application subscriptions。 | 只呈現Host owner的public projection/commands；不可持第二份Graph/同步權威，不等同TD Manager。 |
| production/src/adapters/browser/identity.ts:4–23; production/package.json | browser secure entropy與既有Node25.5.0/Vite/TypeScript工具。 | 無native adapter/runtime package或Electron包；既有工具不等於Native bootstrap已驗。 |

固定 source 全部 `production/src` 的 HostIdentity/CapabilityDirectory/initial IDs搜尋僅出SDK宣告；source inventory僅有browser adapters，沒有 concrete native provider、TargetSession/Binding receiver。這個結論限定 `9357e21`，不可覆蓋 writer 之後新增內容。第一個extension應只用public SDK編譯／測試；`minimal-host-adapter` 明示是in-memory fake，禁止複製其receiver/test doubles/transport cache作production foundation。

## 9. 普通工程、真正未決與依賴

| 分類 | 判斷 | 推進／停止範圍 |
| --- | --- | --- |
| 普通工程 | 選一個有界transport、typed contract名稱/locator、module/folder、queue容量與timeout實作、用新fixture專用port及startup核對、建立provider/receiver與fake negative harness。 | 保持規範語意及oracle數字；名稱可調但capability id/version不可猜alias。不需新的Human Gate。 |
| 第一批建議 | 先交S07基本Host接合：一個新隔離TD Manager、兩clients/兩Targets、explicit descriptor、typed registry、identity/authority、Target query/inspection、clean/keep/cancel switch、故障/reconnect/load lifetime，真TD receiver只提供已宣告且獲權的操作。 | 本報告不是派工或啟动；Coordinator待B01獨立技術ready後使用當時exact工程head重綁單一writer，不以本9357e21直接覆蓋並行工作。 |
| 後續S07義務 | Requiretoken/Allowlan service config、launch/share/QR/clipboard、各宣告deployment、真正remote reachability、native APIs依範圍安排。 | 首批loopback基本路徑不算11 leaves完整交付；未交付明列NOT_DELIVERED/NOT_EXECUTED，不寫state或Gate closure。 |
| 真產品未決 | G-PD-3：唯一foreign manager時自動adopt、明確選擇/確認或無fallback，Owner未選。 | 一個Manager可多連線的同意沒有解此policy；不得加永久binding/額外確認或自動adoption。只隔離該fallback分支。 |
| 已有Human UI方向 | 兩個Native Viewer/Native Parameters UI buttons退役；公開API/TD直接Pulse不能由此推論刪除。 | G-PD-4A UI可見性已有方向；精確API disposition/Parameters remote scope保留獨立殘餘，不替Human關Gate。 |
| 真架構衝突 | 目前沒有保存到必要契約在既定boundary不能表達的反例。 | 若native結果否證，先判adapter defect；僅真正invariant conflict按08決策/Architecture Change，保存input/build/native actual。 |
| 現有實機權限 | feasibility collection已解釋continuous run涵蓋ordinary disposable fixture engineering，Human又指定identity/workdir/port核對。 | 後續writer按bounded packet執行正常startup safeguards；不是每次重新問批准。真的需要license/UI/device/access才只停受影響部分找Human。本scout仍一律不得runtime。 |
| 仍須對照的withdrawn範圍 | S08 Updates基礎與OC09 withdrawn可見automatic generation不能混寫。 | 原run accepted direction具權威；未準備可見自動觸發範圍前不擅自恢复，也不因此刪Updates整個責任。 |

首個 basic native Target 批次的前置是 S01 host-free Graph／Editor入口與B01當時已reviewed工程base；不是等待S05全catalog或S07全部share/windows。建議次序為：public typed contracts＋pure boundary negatives → bounded TD receiver／fixture＋真connect/readback/authority → switch/cancel/reconnect/load races → Fresh Review exact candidate → S08 minimal native publication；後續才逐項補launch/share/LAN/deployment與nativeAPI殘餘。這是依賴分解，沒有替Coordinator派工或改state。

G-LU-HOST-001、G-LU-AUDIT-002和G-DEPLOYMENT-CONFORMANCE依所宣告runtime/profile取得證據；不能把一台Windows localhost推成多OS/GPU/remote或三profile。G-LU-HOST-003是舊文件與已知default-off語意差，不阻基本工程。G-LU-HOST-008首次／cache-empty offline與已開頁斷Host分開。歷史LAN/Tailscale「交付連結」前置已由Owner移除，不能復活；契約本身仍要求的remote/locality matrix也不能因此偷消。

## 10. 每份未來證據應綁定

- exact run/packet/I/R/build、profile/package hash、TD app/build、OS/GPU/driver/browser（未知照記）、fixture input/scripts hash。
- assign-vs-actual fixture root、project file、working/source directory、process/instance witness、service receiver identity、port、Target tuple與session tuple；不得沿用prior feasibility PID當current authority。
- 每operation的request/intent、target、lease bindingId/graphId/loadId/epoch、seq、expected/actual revision、capability id/version、allow/deny原因；secrets與token不入log。
- 用monotonic時間記dispatch/enqueue/start/commit/reply/cancel/readback，證明poll/timeout/queue與native thread-affinity；只client stopwatch不足。
- native側執行counter/OP/Par與applied document/meta/code/schema、current values、resource identity before/after；圖revision/dirty/Undo/Redo/selection/draft的獨立before/after。
- 每case列expected、actual、native run／pure model／unexecuted類型，失敗收據/recovery與受影響Gate；不得以fake/historical/install metadata標runtime PASS。
- 生命期清理記訂閱、pending jobs、timers、handles撤銷及其對他人session無影響；retarget/cancel未真正遠端取消須如實記錄。
- 首declared profile實際bootstrap及權限/作用設備證據；Static Web/Node-hosted/Electron與本機/遠端是各自matrix cells；舊LAN交付連結檢查已移除，不可偷復活。

## 11. Source 指紋與引用規則

下表全部為固定 Git blob 的原始bytes與SHA256；不是工作樹檔案指紋。上文 `06`、`07`、`08`、`10`、`13` 分別指 `handoff/` 同編號文件；`HOST_QUALIFICATION §n` 指 `handoff/executable-reference/HOST_QUALIFICATION_CONTRACTS.md`。主要規範定位：05 §2/4/5，06全文，07全文，08 S07:328–366／S08:368–407，09 AT-S07:146–154／AT-S08:158–167，10各同名Gate，13 §4/5/6，public-surface:149–184，HOST_QUALIFICATION §2/3/6/10。

JSON保留完整S07/S08 slice與相關Gate投影、十一個capability原欄位及精確JSON pointer；其planned/unresolved/deferred文字是**凍結來源狀態**，不代表此次執行或裁決。IH-005/DEC-GRAPE-001優先於早期qualification的mixed chronology字句。

| Git blob path | bytes | SHA256 |
| --- | --- | --- |
| README.md | 14861 | 2a195b5123af3ebc01e29cde2967b479ea7bedeeda966085d9f760b53abb5009 |
| AGENTS.md | 2902 | babfdd30f507c0b597c96751c62dbe72aae429ec55625c571b9a8466fa42d13e |
| .gitignore | 129 | a1b0692dd1e463b4ff0c0bf695fc812727e612ba3a6ec25bb062670b1a02f376 |
| workflow/COORDINATOR.md | 12857 | e9b16b1a98868f4e29549a0ea0d9abfc75f460ca4e30fa1eb1ccd58393323d7e |
| workflow/CONTINUOUS_DELIVERY.md | 14175 | faac9607081318c2d2caaa476adb14fc28ca56c583c2773df6df0873e1212189 |
| implementation-state.json | 44745 | 35c8cd27bd61804e8c6239ef922794fd33f974d1d9e47aae225e38027b7bb270 |
| handoff/05_DATA_AND_LIFECYCLE.md | 12428 | 70102a5988ebe3e23992faa54a13a4eed058628273611ceb945429c5b5573f8e |
| handoff/06_HOST_INTEGRATION.md | 7630 | c302ba93ff02ac9870eb9aa8943f4fa6b817961eff03358b42d463e425df2348 |
| handoff/07_DEPLOYMENT_MODEL.md | 3791 | 9d3f081a5569be3649b39f3e202bba7b18b25475c0cde9d5a7da0256733b1db7 |
| handoff/08_IMPLEMENTATION_PLAN.md | 45504 | df9ad6d9e05d762b767b1d536b97eb6f71c82b6c152c180bcf586cb6a713713d |
| handoff/09_ACCEPTANCE_AND_CONFORMANCE.md | 28825 | d9c32c0a3ef1a47e2704c44e33e12d69ab1748cfd5cbb49e878f731671f6a7c2 |
| handoff/10_KNOWN_GATES.md | 64343 | 8374d473c1534e3627d37573119a6488863d8992e0318c8e1f0d71d99b184b2b |
| handoff/13_PRODUCTION_CONTRACT_SURFACE.md | 19338 | 52be05f0db6eab935efc8869c703f20ce5bb8992ba583c311c9bc76d76a28294 |
| handoff/contracts/public-surface.ts | 10204 | 5d6ab44a5b50dc691e0d0e7a61c491478bd043b9e9226da6885994263c3ed713 |
| handoff/data/slices.json | 105550 | 0a11742f0cdda618a4543e99c7a5eb85c445f5b6826b54a00daa8b492771565a |
| handoff/data/gates.json | 118726 | 94ed3cd38f6415e442470a9b241ded29fb6851215eaff3161bd0a80b7a1755c0 |
| handoff/data/production-contract-ledger.json | 68574 | 569d4dd5f003bdbdfe6b75a2b137db6f6a76fde2d190a878300183bf3daa374d |
| handoff/compatibility/capabilities.json | 6586414 | 387fe3e5dc75f73dc711e867df18b292dcbf452569829767d1a2ccb835fa5a36 |
| handoff/executable-reference/HOST_QUALIFICATION_CONTRACTS.md | 26629 | 9bda8fc9edccd8716889e7928bb698024f00fa6ca621c9207e33f28bc5b9b098 |
| handoff/examples/minimal-host-adapter/README.md | 1087 | 32867990f7c2ca9beee2e16915180b21e9ab3da9a9513cc6a4fb8037a855efb1 |
| production/src/sdk/public-surface.ts | 11103 | 64602b22b69acfaa3335aa6b2155a4a3a8eec29100a7abe80a1db02a70303fce |
| production/src/sdk/editing.ts | 9729 | 9a48a94bd23dc4103a0b78c4d4f17bf4304e4b714d74be5831cbbd1601856fbe |
| production/src/application/editor.ts | 52453 | a786da219dc566103c9f08a1a80b451a10aa9d5a12308517621f311b482e8856 |
| production/src/generation/compiler.ts | 21586 | 3a7c83a5f2d446227e3091c14ed2fc8497794a06deead2b35699b9cbe41f801f |
| production/src/persistence/codec.ts | 5072 | 4c33327f6e06f380bb44dc9296b8f3d6d2a2ec99053b1ba5d2cde6599e161d4f |
| production/src/ui/workspace.ts | 13479 | 3d808b7851a342f6edb9dca9efaab0ed4501eda39d75c1051dcfbbcf88c69d36 |
| production/src/adapters/browser/identity.ts | 846 | 42435aba3b301d95cebf2c0b6a0a22f09135f65ed6bffc4e1216ce11180f5fbb |
| production/src/modules/image.ts | 4738 | 958d925b8acf175150e4cfb9089f7f426b495c328d8258b523f36d0222fe4e32 |
| production/src/modules/function-networks.ts | 3253 | fc062d22e93a67693fc1d91bd3ed036d2fe578d3fc53b521c9b616f4d5791f9e |
| production/apps/web/main.ts | 28173 | 4f6160d53ef4dbbf180fc74165b059594d832a3f391502926b4257be60b740fc |
| production/package.json | 891 | b7653baca8900675dc70303d89061070927d9cfb5c3441fdb1e5a4e1793f4110 |
| production/src/modules/function-operations.ts | 8392 | 2505739980cdd86d67533bf3a327a1d07d8ce7c0dac6fcd2d62ed1d31cb9a4fd |

## 12. 實際完成與限制

本次完成packet/inputRefs核對、固定source閱讀／hash、source-only符號清單、契約／來源／失敗矩陣分解及兩份報告的syntax/完整性核對。沒有跑產品測試、root資格驗證、真TD、native I、browser、網路或deploy checks；本次没有改產品，不能用root結構檢查替代native證據。下一批應重新綁實際reviewed工程base和exact Human controls。

唯一輸出：`.verification/continuous-host-contracts-01/report.md` 與 `report.json`。沒有新Human問題、Gate決策或第二份project-state truth。

**STOP_WRITING。**
