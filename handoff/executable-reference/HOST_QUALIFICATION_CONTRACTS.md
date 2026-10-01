# 宿主能力的架構資格實驗契約

本文件是新架構實驗的追加契約，不修改凍結的 AB-001，也不宣稱產品遷移完成。產品輸入僅為根目錄 `LEGACY_CAPABILITIES.json`、`LEGACY_BEHAVIOR_CONTRACTS.md`；本輪沒有重新讀取 legacy implementation。逐項對照為 `architecture-coverage/qualification/host-analysis.json`。

## 1. 本輪真正推進了什麼

先前已確認的方向：Graph 保存宣告／預設；實際值由宿主擁有。Generator 產碼，Binding 交付，Connection 溝通。EditorContext 的顯示狀態獨立；Graph History 不承擔更新排程。Node/Electron 不能改寫 application core。這些責任保持不變。

本輪補充的實驗決策與命名如下。它們不是追認為先前已達成的共識。

| 補充 | 必要原因 | 新名稱／邊界 |
| --- | --- | --- |
| 宿主側再次驗證提交順序 | UI 忽略舊回覆不會阻止舊 Shader 真正蓋掉新 Shader | `FencedArtifactReceiver` 是 receiving Target 的 publication 行為；不是第二個 Graph |
| 實際值在最後提交時合併 | 開始編譯時複製值會覆蓋等待期間的新 live 值 | `ArtifactExecutor.commit(candidate, values)` 的 values 是 commit 當下的相容值，不是 Graph defaults |
| 三種歷史各自守護責任 | 圖快照、live 值、參數面板定義的 Undo 有不同 authority | `HostValueHistory`、`NativeDefinitionHistory` 不併進 `Graph.history`；上層可協調一次使用者操作的 receipts |
| 可觀察權限不能是普通可編輯 metadata | 若編輯可以清空 externalReferences，下一次刪除就繞過保護 | `NativeRecord.owner/editable/externalReferences` 是 provider observation，只能由宿主回報更新 |
| 原生結構先計畫再提交 | source 改 shape 必須同時考慮 controls、頁面與外部引用 | `NativeDefinitions.plan/commit`，不是讓各控件各自立即改 Par |
| 原生資料也需要生命期 | 同一路徑、同 revision 的新實例不能接收舊 Undo | Target incarnation、Binding epoch、Native plan/receipt session 各自有生命期 |
| last-good 引用保留 tombstone | 使用者可以編輯無效中間圖，但不能抹掉目前運行產物需要的來源身份 | native source definition 可 inactive/tombstone；它不是新輸入值，也不觸發產碼 |
| 升級 review 與一般重試不同 | 去重 request ID 不能证明使用者審查的是這份內容 | `ReviewTickets` 綁定 target＋revision＋before＋after，一次確認 |
| 環境能力顯式可缺 | 靜態網頁不因開啟 URL 就有 TD/native window/file 權限 | `HostServices` 只描述抽象能力是否存在；Node/Electron 是 bootstrap 配置 |

沒有新增名為「ElectronService」的核心物件。原型類別是契約驗證載具；產品可把 receiving Target 與 provider 放在別的程序，仍需遵守同樣的責任。

## 2. 身分、權限與三種部署

`TargetIdentity = {hostId, targetId, incarnation}`。名稱、網路地址、OP path 都是 locator／顯示屬性，不能替代 identity。`BindingLease` 再含 `{bindingId, graphId, loadId, epoch}`。Graph reload、新 Target、重新授予 write 關係都不能延用舊 epoch。純重繪或 EditorContext 切換不創新 Target。

`BootstrapDescriptor` 帶預期實例與到期時間。`verifyBootstrap` 只證明所回報實例一致，不驗證對方是否可信。真實 credential、傳輸加密、origin 判定、peer authentication 是 provider 的責任。`authorize` 測試 optional credentials、action/origin allowlist、size 限制；保留 legacy 的 credential 可選且 default off，沒有暗改成永遠要求 token。原生 viewer 與原生 parameters window 分別授權，不能以一個 `isLocal` 偷偷統一其未決產品範圍。

| 抽象能力 | Static Web / GitHub Pages | Node hosted | Electron packaged |
| --- | --- | --- | --- |
| application-assets | 靜態 bundle；不能從 manifest 推定首次／重載離線可用 | server 提供 bundle；server 故障與 host 故障分開 | 包內 bundle；打包完整性、更新仍要驗證 |
| instance-discovery / editor-launch | 明確入口 descriptor 或使用者選取；無可用 provider 則保留離線編輯 | 可提供額外 discovery/launch adapter，但 server 不必與使用者同機 | 可加 launcher/bootstrap；Graph 不 import desktop API |
| target-session / artifact-publication | 遠端可達且授權的 provider；不存在就明示不可用 | 配置 provider；宿主可能仍在別台機器 | narrow bridge 可提供 provider；bridge 的接收方仍驗 identity/action |
| input-description/write/subscription | 必須取得宿主能力；瀏覽器 storage 不是宿主目前值 | 可以轉送；不能把 server cache 宣稱成 authoritative | 可以 bridge；同一 native value/driver 契約 |
| preview-surface / capture | 真 browser/GPU/媒體權限、尺寸、網路仍須測 | server 不代表具備使用者 native viewer/GPU | renderer/bridge/provider 協作，但包裝不證明 capture 支援 |
| native-window / document-export | 必須有具體作用設備的 provider；否則不可用，不能靜默另開自己的視窗 | 不能把 server 本地 filesystem/window 當作使用者 TD 的位置 | 可新增系統能力，但仍要指出作用设备及授權 |
| host-dispatch / resource-ownership | 實際 host 接收端持有執行緒與原生資源規則 | 同左；不是由 HTTP handler 任意碰宿主物件 | 同左；IPC 也不繞過原生執行緒約束 |

這張表是候選部署配置與失敗責任，**沒有實際執行三種部署**。HQ-02 只證明三種配置可使用同一純 TypeScript service contract，並且缺少服務會回 `CAPABILITY_UNAVAILABLE`。沒有聲稱 WebRTC、WebSocket、IPC 或某個 browser policy 已通過。實際選擇傳輸不反向決定 Graph API。

## 3. Artifact publication 契約

資料最小形狀：

```ts
type Delivery = {
  requestId: string;
  lease: BindingLease;
  intentSeq: number;
  expectedHostRevision: number;
  artifact: {
    codeKey: string; schemaKey: string; code: string;
    sources: {id: string; type: string; defaultValue: Json}[];
    document: Json;
  };
  resetSourceIds?: string[];
};
```

| 面向 | 規範 |
| --- | --- |
| Ownership | Graph／Generator 擁有 document／code 來源；Binding 擁有 delivery intent；receiver 擁有已接受 revision、去重 receipts、active artifact；宿主擁有 current values |
| Precondition | 有效 lease、單調 intentSeq、expectedHostRevision 相符；source ID 唯一；type 改變有明確 reset 指示。requestId 重用只接受完全相同 payload |
| Postcondition | applied 同時更新已接收 document/schema/code 與 host revision；同 ID/type current value 保留、新 source 才採 default。失敗不能宣稱已套用 |
| Mutation boundary | `prepare` 可 await，但不能修改 active 產物。結束後在 receiving owner 的同一提交區段重驗 lease/seq/revision，重新合併當下 values，再 `commit`。回傳 committed 前不得讓另一 writer 插入此區段 |
| Failure semantics | stale request 拒絕；更晚 intent 使舊 candidate superseded；prepare failure retained。commit 結果不確定或拋錯 → indeterminate＋阻止後續 write，等實際 readback/recovery，不假裝已 rollback。cleanup 失敗記獨立診斷，不抹掉已提交 receipt |
| Notification timing | receipt 在完成提交／確定拒絕之後可供查詢；複送同 request 拿同 receipt。observed snapshot 是 receiver 接受狀態；indeterminate 的 snapshot 不是已確認真實宿主狀態 |
| Identity/lifetime | 去重 map 僅 binding session；rebind 清新 session 的 receipts；Target replacement 清其觀察狀態。舊承諾無法宣稱已被遠端物理取消，只能在接收端 fence 後阻止發布 |
| Undo/Redo | Graph Undo 是新的意圖；A→B→Undo A 即使 A 命中 code cache，也要提交新 seq，才能否決仍在編譯的 B。native current values 不跟著 Graph Undo 回到 defaults |

`codeKey/schemaKey` 是 cache hint，不能僅靠相同字串跳过不同 code/schema payload。原型 additionally 比較 code bytes 與 source id/type signature。完整產品 signature 仍須包含 generator/target/module版本與真正 executable dependencies，不能忽略宿主限制。

同 executable 的 document-only delivery 只更新文件與 revision，不重新 compile；此路徑也使用同樣的意圖順序。delivery 必須由同一 generation demand 的 code/schema/document 組成，不能在 await 之後隨手拿當前 GraphDocument 搭配舊 code。此跨物件配對由 Binding／Updates integration 約束，不由 receiver 猜測兩者語義。

真 adapter 的 `commit` 必須在宿主規定執行緒實作上述區段，並維持對外 resource identity。純記憶體模型不能证明 TD 原生 configure/rollback 是原子操作；無此證據時保持 Partially covered。

## 4. Actual inputs、手勢與值 History

`InputField` 帶 field ID、shape ID、driver ID、type、current value、writable、revision。`ExpectedField` 是其 `{id,shapeId,driverId,revision}` 投影；傳完整 InputField 仍合法，不能因多了 value 等欄位而 CAS 失敗。

| 操作 | 完整邊界 |
| --- | --- |
| read | TargetInputs 擁有；讀複本、不修改、不進 Undo。Graph 的 default 與此 current value 是兩筆不同資料 |
| write(group) | 全組欄位存在、可寫、expected 相符、值可表示、ID 不重複才寫；一欄失敗全部不寫。通知應在整組成功後；value 真變化才增 revision。原型驗 float32 finite、int32、bool、string，不假稱覆蓋 uint/matrix/native styles |
| begin gesture | client 最多一個 gesture；同 component 最多一個 writer；不同 component 可並行。捕捉 before，保留受控的欄位 identity。begin 不寫值、不建立完成 Undo |
| update | sequence 單調；數量精確；以 latest accepted reference 做 write；失敗不接收該 sample、不偷改 baseline。成功即時反映 actual value，不改 Graph、不重新產碼 |
| seal | before/after 一致則空 receipt；否則一次 ValueReceipt。重試同 gesture ID 得相同結果。release component/client writer。receipt 為 session 資料 |
| cancel | 嘗試按 latest expected 值補償回 before；他人改動／driver變動則拒絕補償，不覆蓋他人。失敗可由disconnect seal已接受差異，Undo再檢查expected並明示blocked |
| disconnect | 封存已接受步驟、釋放控制；不聲稱整段手勢從未發生 |
| undo/redo | receipt 只包含自己的 components；重新驗 shape/driver/revision，整組一致才還原；新的 revision 隨成功還原前進。外部修改造成衝突則blocked，不能把方向切換當作取消衝突。其他inputs與動畫不回捲 |

`InputMirror` 是可丟棄 projection：snapshot 可跨 revision，delta 必須 baseRevision 正好接續。epoch/schema 不符忽略；漏 delta 標記 needsSnapshot，不能以 patch 猜補資料，也不能把回報再當作新的寫命令造成 echo。

外部 Bind 鏈解析、Constant endpoint、resource identity（例如貼圖 TOP）、native Undo callback、RGB不改Alpha、Pulse不可撤銷等，由具體 input/history provider 提供能力描述及操作。禁止把「ControlDefinition 是保護的」推論成「值一定不可寫」；兩者權限獨立。Pulse 是有 request identity 的 command，不是假 bool 數值。

## 5. Native definition plan／patch／history

`NativeDefinitions` 管理純資料描述，不持有原生 OP/Par 指標、不擁有 current values。page/source/control/row 都有穩定 ID、incarnation、kind，以及 provider 回報的 owner/editable/externalReferences。`data` 是模組可擴充的定義資料；matrix columns、範圍、section、order、style 不需强塞成 scalar。

不同宿主可使用不同 data schema，但 host module 必須負責驗證其 schema。原型驗結構／引用／權限／生命期，不聲稱任意 `data: Json` 都是有效 TD 參數。

| 操作 | Ownership / precondition / postcondition / mutation / failure / timing / identity / Undo |
| --- | --- |
| observe | 僅 provider／測試注入使用；收到宿主定義或權限改動後更新相應 record 及單調 revision。不是 UI 可呼叫的權限修改命令。即時動畫值不進此 revision |
| plan | Application 提供欲改的 record ID、expectedRevision、next record，以及實際 input guards。NativeDefinitions 產生自己的 planId/epoch，先完整驗證。返回複本不修改狀態、不通知、不建 Undo。失敗全無 mutation |
| validate candidate | 只允許修改 managed/editable；外部引用阻止刪除／替換identity／shape變更；editor不可修改 observed權限欄位。control 必須引用有效page/source與一致shape；texture source最多一個control；含protectedcontrol的page不能改結構 |
| commit | 查找本 session 發出且內容完全相同的 plan；重新驗全部 expected/driver/shape/ownership。先算完整候選再同步替換本次所列record，增加其revision。其餘records／current values不碰。全部完成才返回receipt／通知。重試同plan回同receipt，不再覆蓋後來外部狀態 |
| ensureControl | 先查source既有control，有則回該identity；無才計畫建立。不是「同label」就當同一control。texture單控件由整體validator保護 |
| shape change | source與所有受影響control需在同一candidate保持一致。protected/external refs先拒絕整批。實際native建立、值轉換與component capability由provider計畫供應；模型不偷偷截斷或重新解讀值 |
| delete source | 若last-good artifact仍引用source，保留inactive tombstone identity；可刪其control且不改input值。last-good引用由publication結果維護。tombstone不能新建control；它不等於draft合法，也不觸發publish |
| receipt / history | before/after只包含本次patch的records，input guards不含動畫value/revision但含shape/driver。Undo重新比對當前受影響record revision與原driver；先驗全組再還原definition；current values與旁邊row不倒退 |
| receipt lifecycle | receipt必須是目前NativeDefinitions session所發出的真實receipt，內容不得被改。Target replacement使所有plan／receipt失效。同path同revision也不能還原舊target的definition |

頁排序等操作可將所有要移動的 page/order 記成一批 patch；expectedRevision 阻止覆盖外部重排。刪非空頁會因control引用缺頁而失敗。移除控制不刪current input；取消Expose可只改source.active，保留control identity、matrix column definition和外部引用。

Source edit checkpoint 的定義內容可含driver expression／row order，因此結構改變可被察覺；動畫current value不在checkpoint。native row的sentinel和實際Export mode是provider特定的 plan 验证与 apply 行為，不能用全表舊快照覆蓋。HQ-31/33已證實「只patch自己的row、他人row與value保留、重送去重」，未證實真TD sentinel或Export API。

Graph invalid draft、native source state、last-good artifact 是三個可同時存在的版本。Graph儲存允許invalid；產碼受error阻擋；native source Undo可處理自己的差異。這不是允許一個native transaction偷偷改Graph的authoritative document。需要同時修改兩域時，上層操作持有雙方receipts及失敗狀態；不能以跨程序完全原子成功為無證據前提。

## 6. Upgrade review、preview、runtime queue

`ReviewTickets.issue(target, revision, before, after)` 只保存不可變內容指紋，不改宿主。`confirm` 先驗完整identity/revision/兩份內容，相符才消耗一次ticket；不同內容拒絕且不消耗原票；成功票不能再確認。確認不是credential grant，也不意味後續native commit必成功。commit仍需自身CAS；失敗需重新審查當下內容，不能重用舊確認。批次更新各Target有獨立ticket與publication receipt，沒有一個global currentTarget。

`PreviewSession.claim` 更新epoch、release舊pointer、清舊holds；identity真的變才home。輸入須有效session、可見、單調sequence、finite [0,1] coordinate；move/up須有down origin。hidden/stop釋放pressed state。hold token只影響建立時的session，release舊token不能freeze或恢復新session。snapshot capture、touch recognizer、encoder resizer是獨立能力；原型不以一般mouse測試取代雙指/三指/nativePanel驗收。

`OwnerQueue.submit` 接有限capacity、deadline和工作；滿載busy，未開始逾期不執行，stop後不接受且拒絕pending。`drain`只能由provider的host-affine loop调用；原型的drain並不證明執行在TD主執行緒。已開始的原生工作若客戶端timeout，不能推論未寫；需要receipt/readback。stop queue不應刪除host持有的已發布artifact、用户OP或Graph資料。

## 7. 已執行驗證與真正的反例

執行環境：本機 Node 25.5.0，純 TypeScript、記憶體 fake providers。沒有TD、GPU、真browser LAN/media/Clipboard、Electron包裝執行。測試不調用宿主、不修改產品、不讀legacy。

| 編號 | 反例／結果 | 對架構的改動 |
| --- | --- | --- |
| HF-01 | 第一輪18例中HQ10–14/16錯把完整InputField與ExpectedField整物件比較，6例失敗 | 參照只比較宣告的identity/revision欄位；保持結構化API可相容傳入 |
| HF-02 | HQ18原本在換preview後仍有舊hold，capture永遠false | hold與lease共同生命期，claim清舊hold；舊release不可改新session |
| HF-03 | HQ19 pending compile期间value=.8，commit還原為.5，實際失敗 | merge從prepare前移到fenced commit前；executor取得當下值 |
| HF-04 | HQ37替換Target後revision剛好相同，舊history竟可還原舊control | receipt綁NativeDefinitions session並核內容，replacement撤銷 |
| HF-05 | HQ38可以先edit清空externalReferences再刪有外部consumer的control | observed authority fields不可由definition edit修改 |

紅燈原始輸出：`architecture-coverage/qualification-host-first-tests.txt`、`qualification-host-second-tests.txt`、`qualification-host-native-red-tests.txt`。修正後輸出：`qualification-host-final-tests.txt`。完整當時回歸為 `qualification-host-regression.txt`；最终整个phase计数由根任务统一记录，不能把先前較小的完整回歸冒充最終。

具體案例：HQ01–02 identity/能力缺席；03–09受控編譯順序、retry、uncertainty、source compatibility、cached Undo；10–16 groupCAS、live/history/mirror/Graph隔離；17–18 preview生命期；19–21 commit-time value、cleanup/cache key；22–24 writer准入、access、queue；25–34 native plan/patch/形狀/ownership/動畫與tombstone；35 reviewticket；36–38 replacement與authority反例。

## 8. 仍未證明的限制與真正阻塞

- 三profile尚無真實provider、bootstrap package、跨程序執行證據。所有63宿主能力至多 Partially covered；可表達／模型通過不等於宿主／browser支援。
- 原生apply rollback本身失敗是否仍能恢復last-good沒有實證。indeterminate是誠實表達未知，不是將承諾改弱後宣布已通過。
- 原生controls style全矩陣、貼圖resource身份解析、driver Bind/Export/Expression、native Undo callback、跨Target row plan對實際API的原子性、矩陣與inactive保存仍須真adapter驗收。
- preview PNG/stream、touch門檻、encoder/cook、viewer own parameters的Undo與重載，未由這個pointer模型通過。
- 生成資源移除manager之後冷重載的獨立性、相容TD/GPU版本、材質範本像素與後處理、包內binary與外部能力清單是否一致，仍有原inventory UNKNOWN。
- LU-HOST-002跨不同manager fallback是否正式需求、LU-HOST-004 native viewer/parameters入口與遠端作用域是產品決策；架構已能表達分別policy，但不能自行替使用者選其公開範圍。
- LU-HOST-003是舊文件與已知現行行為不同，不能當成必須停工的架構問題；此契約保留token可選與外部Bind可寫endpoint。LU-HOST-007未完成的舊typed-Undo測試不因HQ12綠燈變已通過。LU-HOST-008尚無PWA證據。
- 此原型 receipt stores 是有界生命期但未實作容量回收／過期／durable journal。產品若要求程序崩潰後仍去重或Undo，必須增加persisted receipt provider，不能把記憶體結果外推。

這些限制是驗證的明確邊界。文件沒有自動放行Migration，也沒有把宿主托管頁面的舊環境前提保留成新產品必需結構。

## 9. 對照表反向審查修正

`host-analysis.json` 的 `modelQualification` 明確区分「部分共用機制已執行」與「契約有位置但此操作路徑未執行」。HQ02 的服務缺席測試不能拿來認證 Shader 列表切換、分享 QR、原生視窗開啟。63 項均不聲稱 whole-leaf qualified；沒有執行個別路徑者保留驗證阻塞，不能以有 owner 就升為 Covered。

新 `persistenceImplications` 不再引用舊宿主的儲存欄位或 COMP 機制。舊行為原文只在 `legacyPersistence` 保留，作驗收來源。新責任是 Target artifact/input/definition 儲存能力、Graph 文件與暫態 session 分開；實際格式、檔案位置、原生參數欄位不是核心契約。`NativeDefinitionHistory` 是本輪真正實作的定義歷史名稱。

事件路徑按觸發方分開：compiler result、input delta、資源更名、heartbeat 來自 provider observations；queue drain 來自 host-affine loop；assets 來自部署 bootstrap；使用者寫入才是 Application command。觀察事件通過 identity/revision 驗證後更新相應 mirror／diagnostics，不因回報自動產生一次編輯，亦不得形成雙向回送循環。路徑描述不等同各種 provider 已經實作。

## 10. 最後一輪可獨立驗證的宿主入口

新增 HQ39–47，仍為 Node 的 fake provider／純模型驗證。它們補足先前只寫了位置的生命期，不新增統管 Graph、UI、host 的 manager。

| 操作 | 契約與責任 |
|---|---|
| TargetSelection.switchTo | 這是 HostDirectory／application 的導航意圖物件，持有目前 Target identity 與既有 Graph reference；不複製 Graph、不從 origin 猜宿主。等待該 Graph 開啟的 Operation 結束後捕捉 snapshot。keep 必須由注入的 draft-store 寫入並精確讀回；apply 只有 Binding 回 applied 才可繼續。cancel 不呼叫provider。|
| Switch guards | 選定的 Target 在 await 前複製；每個 await 後驗 intent、原Graph/load/revision與目前Target。保留草稿失敗、apply拒絕、並行編輯、開啟回錯identity均留在原Target。最後一次明確 readback 成功才改 navigation selection；舊Graph內容／History不被導航改寫。已開始apply即使導航取消，不能宣稱宿主物理更新已撤銷。|
| Target document inspection | 不懂新版本、無效版本或損壞既有raw→readonly，保留raw，沒有demo覆蓋。fresh必須由provider明示且沒有既有raw；不是見空字串就推定fresh。parse由文檔loader提供；HQ47實際接Graph.load，不把任意可JSON.parse內容等同有效Graph。model diagnostics error仍與未知文件格式分開。|
| Inspection authority | inspection只是可展示資料時不能授予寫權。factory發出的不可變view另有session claim；publishInspected只接受該原始claim且不是readonly，並驗Target身份。複製view再改mode無效。provider觀察到新raw／版本或撤換Target時必須invalidate舊inspection；新的inspect不是舊claim續命。真正傳輸端也要驗權，不能依UI布林值放行。|
| Preview capture | PreviewSession驗目前lease；CaptureProvider.create取得request-owned job，其ready負責非阻塞frame等待，read才做影像讀取。captured lease在開始時複製；ready前取消不read，read後取消／換Target也不交出舊結果。所有結束路徑dispose本次job；不dispose新session別人的資源。無Target回空bytes。PNG格式、512尺寸、alpha、TD兩次絕對frame、GPU仍屬真provider驗收。|
| TextureBinding.write | TargetInputs的資源引用特化，與Graph宣告/GLSL分開。locator是查找輸入，不是identity；先限制長度/控制字元，再resolve。非空須provider判定external texture2d，internal／錯類型／不存在拒絕。await後重驗Target epoch、source/shape/driver/revision及目前值。空值選擇已存在的fallback。|
| Texture effective / Undo | 原始選擇失效時保留其引用並投影invalid＋fallback，不偷偷改Graph或把錯誤抹掉。Undo接同session發出的receipt，驗目前after與old/new資源id/incarnation；相同path重建物件不能被當舊物件。replacement/rebind清receipt authority。控件定義History不持有這個最新實際值。|

前三者的進行中請求、inspection authority、capture job、Texture receipts 都是 session 生命期，不序列化為可恢復的有效授權。keep草稿經 draft-store 保存完整文件；存放在哪個browser/storage/file由部署provider決定，不沿用舊sessionStorage key為核心API。原型不承諾receipt跨程序重啟，也不以下載／导航成功清Graph saved marker。

HOST017現在有真正產碼後的physical-line provenance映射證據：CQ22與WS36，包含artifact/delivery及nested occurrence。TD原生warning格式與插入code行偏移仍未實機驗證。WS37是backend capability檢查，不能拿來充source-map案例，因此不列為HOST017直接驗證。

其餘沒有獨立leaf行為case的能力，在 `modelQualification.placementEvidence` 分別寫明既有owner/共用邊界依據與未完成算法／provider：原生建立選單、四材質內容、QR分享、Viewer控件翻譯、touch recognizer、resize settle。這些未實作不是「外部必要資訊不存在」；它們是已有位置的產品實作／行為驗收工作。native parameters窗口另有真正產品入口政策問題。共用邊界case僅支持位置，沒有塞進該leaf的executedModelCases。

HF06 / HQ46：实际反例中，`{...readonlyView, mode:'editable'}`竟可發布新Shader；修成已發出的可撤銷inspection claim。另同例驗證await中的lease物件不能被改成新Target而交出舊圖。紅證據 `host-entrypoints-authority-red.txt`；新回歸 `host-entrypoints-tests.txt` 47/47。此輪完整 `host-entrypoints-regression.txt` 是當時198/198，typecheck通過，最終phase數量仍由根任務統一。
