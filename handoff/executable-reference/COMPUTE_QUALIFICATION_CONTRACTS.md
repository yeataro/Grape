# Compute Qualification Contracts

狀態：實驗性補充契約。這份文件描述新架構為既有能力留下的可實作路徑，**不是宣稱 391 個 LC-NODE 已全部實作**。歷史產品輸入只使用根目錄 LEGACY_CAPABILITIES.json 與 LEGACY_BEHAVIOR_CONTRACTS.md；未讀取或執行 legacy implementation。

## 1. 本輪的判斷及與 AB-001 的差異

| 編號 | AB-001 邊界 / 原假設 | 本輪補充決策 | 原因與證據 |
|---|---|---|---|
| CQ-D01 | ValueType 硬列六種；core/generator 各驗一次 | 共用 TypeEnvironment，保留型別 token 與名義 identity；core 與 generator 同時使用 | 矩陣、陣列、結構若只有旁路工具，仍不能接進 Graph。CQ01–03 實際走 Graph →產碼→Undo→reload |
| CQ-D02 | NodeType.ports 只讀 state | ModuleContext 唯讀查詢 resource/reference/referenceId/inputSource/resolveType | Source/Subgraph/結構是引用，不應把整份資料複製進 Node.state。CQ10/15、WS11–27 |
| CQ-D03 | 只做一次依儲存順序的接口重算 | dependencyOrder 先來源再消費者；connectionTypePolicy='infer' 才允許候選連線影響接口 | 反序建立 Router 鏈也需在一次發布中一致；CQ15 |
| CQ-D04 | 動態無效 edge 一律移除並記 loss | 缺省保持 detach；模組可明示 preserve，保留 invalid edge 與 error | 結構欄位與一般模式切換不必相同政策。CQ11；沒有暗改原 A07 |
| CQ-D05 | emit 只有輸出 expression | 加 statements、受理的 effects、helper/local、uniform、varying | out arguments、無輸出的 discard/depth、原生資源不適用 return expression 模型。CQ04–09/12 |
| CQ-D06 | 只支援固定 td.top / default vertex 的 ES shell | Graph 可持有 td.mat；GenerationProfile 可選型別環境、支援種類、vertex network、stage shell | 不能把 MAT 列入 model 卻永遠沒有生成路徑。CQ08/12 有真正 vertex+pixel+varying 的可編譯實驗 profile |
| CQ-D07 | DefinitionSet 只持有 NodeType refs | 另存 exact ModuleRef，Graph.modules 可包含沒有 NodeType 的模組 | resource-only 模組若靠 NodeType 推導會丟失；CQ16 |
| CQ-D08 | resources 是保存容器，沒有修改/驗證能力 | Draft 資源操作＋NodeModule.resourceValidators，全量驗證 unused resources | 不能用 sidecar mutable store 繞過 Graph/History。CQ10/14/17、WS23 |
| CQ-D09 | ordinary change 可保存 error 圖 | 增加 transaction-scoped Draft.requireValid()，在 final diagnostics 後拒絕整筆 | Import/paste 要求候選完整合法，一般編輯仍允許暫時錯誤。CQ17、WS25/27 |
| CQ-D10 | operation completion 沒有事件 | subscribeOperationEnd 在成功 commit/cancel 後發布 immutable snapshot | Updates 不能靠猜測第幾次 change 是一次手勢的結尾。UQ01/07 |
| CQ-D11 | 型別中的長度只能是數字 | T[#resourceID] 指向 arrayExtent；可為固定長度或待 backend 解析的 symbol | 同一來源的 identity 可保存/重映射；不能把宿主巨集字串誤當全域型別 identity。CQ13/18 |
| CQ-D12 | AB 的 float/vec 自動轉型被誤當通用政策 | receiving PortSpec.connectionPolicy='default'/'numeric'/'exact'；Edge 增 cast plan | LC-NODE-362 數值族同寬 cast/scalar splat 與 AB 的 vector 裁剪政策不同；CQ19 先失敗再修正，原 default 沒被覆寫 |
| CQ-D13 | 一個 resource kind 全 registry 只能註冊一次 | kind 的 owner moduleId 唯一，但可註冊多版本；每個 DefinitionSet 只能 pin 一個該 kind 的 exact provider | CQ20 實際反例：兩張圖分別 pin v1/v2，第二版原先無法註冊；修正後兩圖及 reload 各驗自己的 schema，同圖歧義明拒 |
| CQ-D14 | backend.validateType 被當成全部 backend compatibility | NodeType.requiredCapabilities 與 EmitContext.requireCapability 對 GenerationProfile.capabilities 驗證 | dFdxFine 與普通 float 運算可以有完全相同 ports；型別合法不代表 GLSL 版本提供函數。CQ21，來源為審查推演，沒有捏造 pre-fix red |
| CQ-D15 | sourceMap 只有 symbol→top-level Node | 追加診斷用 stage/physical-line/occurrence trail，按 artifact 與 delivery 綁定接收端 compiler source | LC-NODE-366 需要從錯誤行回內層節點；cached artifact origin revision 不等於新 delivery revision。CQ22，WS nested trace 測試另列 |
| CQ-D16 | dynamic reconcile 只供頂層 Stage 私用 | 抽出共用 reconcileNetworkModel；root與nested resource候選共用，loss回同Graph transaction | scoped parameter若直接validate完整network會把本應detach/preserve的schema變更拒絕。CQ23及workspace scoped dynamic cases；沒有另建Graph/history |

這些都是本輪補充決策，不回寫成「早已確認」。模組仍由註冊表初始化；Node 是 Graph 內的實例；Generator 讀 snapshot；Editor 不擁有第二份模型。沒有引入第二個 Graph 或把 Graph 複製到 UI。

## 2. 型別與引用：可表達性不等於後端支援

ValueType 在 TypeScript 層是字串 token，在模型邊界必须經 typeTokenValid/TypeEnvironment 驗證，不代表任意字串都合法。

- 值型別：float/double/int/uint/bool、對應 2/3/4 分量向量，以及 2..4 欄、2..4 列 float/double 矩陣，共 38 種 GLSL 值型別。
- 矩陣本地值是 column-major 的平坦陣列；沒有暗中補單位矩陣或改變乘法含義。
- 資源：具維度的 sampler token。它不是本地數值，不會生成非法的 local sampler assignment。
- 固定陣列：T[N]；來源長度：T[#resourceID]。資源 {kind:'arrayExtent',length:2} 可作本地值；{kind:'arrayExtent',symbol:'HOST_COUNT'} 必須由後端解析，不能假設長度，也不能建立未證明大小的本地 literal。
- 名義結構：@resourceID，資源 {kind:'dataType',type:{kind:'struct',fields:[{key,type}]}}。name 只作呈現；同名不同 ID 不同型別；欄位 shader name 使用 stable key 編碼。
- TypeEnvironment 拒绝 recursive value-type cycles、空/重複欄位、非有限 float32、越界 int/uint、sparse arrays、錯誤的矩陣/向量/陣列 shape。結構值必須精確匹配欄位，不默默忽略多餘 key。

TypeEnvironment 是「這個 Graph 的解析視圖」，不是另一個 mutable registry。實驗把命名/查找的 scope 交給資源服務，引用落地後使用穩定 identity。typeResourceIds/remapTypeResources 是語法感知的引用操作；文字描述包含同樣字串時不應一起替換。

實驗上限：固定陣列 1..4096，結構 1..128 欄。這些是實驗防護邊界，不是宣稱 legacy 的所有上限相同。完整遷移須以每葉 inventory 為準。

Default ES300_PROFILE 拒绝 double、1D/Buffer sampler、sampler-array indexing/binding policy、陣列的陣列，以及尚未解析的 host extent。這些資料仍可存在 Graph 中。另一個後端可以透過 createTypes/validateType 接管目標方言，但不能把 unsupported 靜默當成功。

## 3. Graph-owned resource 操作契約

以下方法都只在 Graph.change 的同步 Draft 內使用，繼承既有 poisoned-batch、禁止 async/reentrancy、一次 revision/通知及 Operation grouping。任何 exception 都回 Result failure，候選資料、History、revision、observer 均不前進。模組回報 error 與操作本身失敗不同：一般 change 可保存 error；requireValid 將 error 升級為本次候選拒絕。

| 操作 | Ownership / precondition | Postcondition / mutation boundary | Failure / notifications / identity / Undo |
|---|---|---|---|
| readResource(id) | Graph 持有；Draft 必須仍活著 | 回 deep-frozen detached Json 或 undefined；無修改 | 不通知、不入 Undo；保留返回值不能寫回 Graph |
| putResource(id,data) | 非空 ID，finite plain JSON；不能撞 Graph/Node/Stage 等 identity | upsert 同 ID；最後重算 Node schema、edges、diagnostics | 重複物件 identity 由 envelope 拒绝；成功與本批其他修改一起發布/Undo；舊引用仍指同一資源 |
| removeResource(id) | 必須存在 | 候選移除；引用不被私自改寫 | known modules 可報 missing reference；模組若無法建立合法 ports 則候選失敗。error 圖可保存；Undo 恢復同 ID |
| setReference(nodeId,key,ref/null) | Node 存在，非空 key；reference 格式合法 | 只改該 Node 的引用 slot；null 刪除 | 不複製 source data 進 state。缺失目標成 diagnostics；同 batch 重算，Undo 恢復原 slot |
| importNode(stageId,record) | 目的 editable Stage、exact pinned type、Stage/target eligibility；不能複製保護 boundary | 產生 fresh Node ID；name 若重複附增量；保留 state/values/references/擴充 metadata，最後 reconcile | 缺失 module 可保 opaque record，但不能猜新連線。新 ID 只屬本 Graph；整批失敗不留下 Node；Undo 移除整筆 |
| connectEndpoints(from,to,options) | 候選 Graph 內 Node/port/network 合法；已佔 input 必須 explicit replace；不能新造 cycle | 與 Port handle 版 connect 使用同一檢查；支援同批剛 import 的 Node | IDs 是本 Draft 的解析入口，不允許跨 Network。不可跳过型別/module policy。Undo 還原原 edge |
| replaceDocument(candidate) | 與目的 Graph 的 exact definition/module pins、output profile 相同；finite envelope 合法 | 保目的 Graph.id/loadId/History 實體；替換其 persistent content | 不新建第二個 Graph、不先發布再 Undo；Context projections 經同一 publication；一筆 Undo 恢復全部舊文件 |
| setMetadata(nodeId/null,key,value) | 只寫 uiMetadata bag；有限 JSON | 可 Undo 的文件/節點 metadata，非核心语意欄位 | 不可用這入口更改 ports/typeRef/position 等受控欄位；Graph id 不變 |
| setStageImplementation('vertex',mode) | 僅支援 vertex 切換；切回 default 時 network 必須空 | Stage identity 不變，切換 implementation | 不暗中丟棄圖；Graph 保存該設定；後端另決定能否生成 |
| requireValid() | 尚有效 Draft | 設一次本批 flag；完成 reconcile/diagnose 後 error 則拒絕候選 | 不獨立寫 state、不保存 flag、不入 History；整筆成功才有通知 |
| recordLoss(loss) | 尚有效 Draft；finite JSON、非空reason/nodeId；可附resourceId指定nested scope | 核心配置fresh loss ID，追加本批recovery記錄 | 同本批resource/node變更一起發布與Undo；warning.subject攜帶resourceId與nodeId，不猜nested ID是root Node |

Registry 不成為 Graph 的可變依賴。DefinitionSet pin 已載入的 exact identities；原始 module 物件的事後修改不能改變已載入的 definition metadata。

## 4. 模組上下文與資源驗證

ModuleContext 提供 graphKind、stageKind、nodeId，以及以下唯讀查詢：

- resource(id)：Graph resource data。
- resources(kind?)：全部或指定 kind 的唯讀資源列表；供 Source 名稱等跨資源約束檢查，不需要另一份 registry。
- referenceId(key)：原 reference slot 的 stable targetId。
- reference(key)：解析後 resource data 或 NodeRecord；不以 display name 查找。
- inputSource(key)：候選 edge 上游 node/key/port spec，用於推導接口。
- resolveType(ref)：只在 pinned DefinitionSet 內找 NodeType；不讀 mutable Registry。
- resource validator 的 nodeId 是被驗證的 resource ID；self reference 指同一資源。

initialize(args,context)、ports(state,context)、validate(state,context) 與 emit 都可使用它。context 是當次快照；不能直接呼叫修改方法。內部 module callbacks 是受信任 TS 程式，不宣稱這是惡意外掛 sandbox。

NodeModule.resourceValidators 以 kind 宣告唯一 owner moduleId。同 owner 可註冊不同版本，同 id/version 重複仍拒絕；不同 owner 搶相同 kind、覆蓋 core dataType/arrayExtent 或不合法 validator 一次拒絕，不能 last-wins。DefinitionSet 對同 kind 若 pin 兩個已載入版本則 RESOURCE_PROVIDER_AMBIGUOUS；Registry.pin() 的「全部」選取也可能因此拒絕，呼叫端必須明選版本，不能偷偷採最新版。Graph.modules 另外鎖定 moduleId/version/fingerprint，包含 types=[] 的資源模組。缺失或同版本不同 fingerprint 不會借用新 module；保存 original module pins/resource payload，diagnostics 阻止執行。未知具有 kind 的資源保持原值，沒有 pinned validator 時報 error。兩張 Graph 的 DefinitionSet/History/保存互相獨立；註冊新版不修改既有 pins，不發 Graph 修改通知也不產生 Undo。

每個 resource 都在 full-graph validation 被檢查，即使沒有被 live Node 使用。核心型別資源由 typeResourceIssues 檢查；其他由 pinned resource validators 負責。validate-before-prune 的原则沒有變成「只有被 shader 用到的資源才需要合法」。

NodeType.stateReferences 是模組的 collect/remap 協定。來源引用若藏於 module-owned state，模組應揭露它；clipboard/closure service 不應對任意字串做 replace。referencesComplete 不等於允許猜未知 opaque state 的引用。

## 5. 動態接口與 Edge 的兩種政策

預設固定接口：connect 依當前 ports 驗證，再由 Graph 整批 reconcile。infer 模組明示允許把一條候選 edge 放入**候選副本**供 ports 查詢上游型別，之後仍需通過 direction、Network、occupancy、adaptation、cycle 檢查。

成功修改後以依賴順序重算接口，而不是依 Node 建立/儲存順序。已有非法 cycle 可保留並診斷，不把它當作合法推導固定點。反序建立的 Router chain 在 CQ15 中仍只有一個一致的發布。

`reconcileNetworkModel(network,definitions,identity,contextForNode,resources)` 是對mutable candidate的共用schema/values/edges重算，不是新的Graph，也不自動發布。呼叫者持有candidate與scope；傳入pinned resolver、唯讀context factory與資源解析環境。函式回loss records並修改candidate ports/values/edge plans。root Stage直接使用它；nested service在資源候選使用它後，經原Graph.change提交resource與recordLoss。callback/型別schema失敗仍回滾整個外層交易；普通authoring允許保留error圖，不可把嚴格import/paste的requireValid套到全部parameter變更。

相同 from/to type不意味舊Edge plan永遠有效：receiving connectionPolicy可從numeric改exact。reconcile重新算當前policy，不因型別字串一樣就保留舊cast。CQ23驗policy-only變更會detach並記loss，scoped loss與同批資源共用一筆Undo。

invalidEdgePolicy='detach' 保持 AB-001：不再有效的線移入 loss。'preserve'：若任一端模組要求保留，edge 維持 identity/endpoints，記 invalid:{code:'INTERFACE_CHANGED',reason}，診斷為 error；save/reload 保留，產碼拒絕。接口恢復時重新解析/解除 invalid，不新建 edge。刪掉 Node 本身仍會刪除其連線，不屬接口保線情境。

保留 edge 不等於禁止記錄其他 loss。例如刪除 local-value port，舊 local value 仍進 loss。這點由 CQ11 初次測試過度寬泛的 oracle 揭露並修正；實作沒有為零 loss 改掉必要的資料保存。

### 5.1 自動轉型政策是接收接口契約

PortSpec.connectionPolicy 決定建立連線時能採用的 plan；core 與 generator 共用 automaticAdaptation。default 保留 AB-001 的 identity、float splat、float-vector take、RGB→RGBA alpha=1。numeric 用於 LC-NODE-362 的普通數值連線：float/int/uint/double scalar/vector 同寬可 cast；數值 scalar 可向數值 vector cast/splat；bool 可向 bvec splat。numeric 禁止 vector 裁剪/補分量、bool↔numeric、matrix/array/名義結構異型轉換。exact 只接受同型別。相同型別不做額外轉換。

兩套政策不同是明示的能力差異，沒有把「Explicit Convert 可做」當成自動連線已保留。普通 legacy NodeType 選 numeric；Compare/Switch/分量接口需精確連線時選 exact。NodeType 定義負責政策，Edge 保存當時的 from/to/op；policy 或 type 變動在既有 reconcile boundary 重驗，不可直接修改 Edge 來繞過。cast lowering 明確產生目標型別 constructor，不依賴 GLSL 隱式轉型。失敗 connect 不發布、不入 History；成功 connect 的政策結果與原 edge 一起保存/Undo/redo。受信任 module 仍必須選對其產品語意，本輪沒有實作全部 legacy NodeType。

## 6. GenerationProfile 與 lowering 契約

generate(snapshot,profile=ES300_PROFILE) 的入口仍只讀 Snapshot，永不修改 Graph/History 或 Host。

GenerationProfile：
- id / graphKinds / vertexNetwork：聲明本後端接受的圖/Stage 邊界。
- createTypes(document)：可提供 backend-specific TypeEnvironment，例如 host-bound extent 或原生結構名稱對應。
- validateType(type,environment)：明确拒不支援的型別/能力。
- capabilities：字串 ID 的明示能力集合，缺省空。NodeType.requiredCapabilities 在全圖檢查時驗（unused Node 也不逃過）；emit 中的 requireCapability 可表達模式特有要求。需求由模組提供，profile 不依 Node 名稱硬編碼。聲明支援的 profile 仍須真正 compiler 驗證，不能因通過此 admission 就假稱 native 支援。
- render({vertex,pixel})：接收已驗證 stage globals/body/result/varyings，組合版本、宣告、入口、output 命名及宿主 shell；必須回兩份非空 shader。
- Default profile 是獨立 GLSL ES 3.00，不是 TD backend。實驗 MAT profile 實際接可編輯 vertex network、position root、pixel output 和 varying。

NodeType.emit(state,ctx)：
- input(key) 回 TypedExpression；local/default literal 的 constant 為 true；uniform/varying 為 false；模組只能在能證明 GLSL constant expression 時主動宣告 constant。
- requireConstant 的輸入會查 expression provenance，不會接受「型別相同所以 uniform 也可以」。
- local(key) 分配當次 node occurrence 的 helper temporaries；helper(key,body) 以 exact TypeRef+semantic key 命名和 deduplicate，同 identity 不同內容報錯。
- statements 提供 out arguments/有限 statement lowering；outputs 必須與 declared output key/type 一致。
- uniform(resourceId,type) 以 stable resource identity 宣告；同 ID 不同 uniform type 為 error。資源輸出直接 alias uniform，不生成 local sampler。
- varying(key,type,value?) 在 vertex 寫入、pixel 讀取；同 key 必須同型別、只有一個 writer。缺 writer、反向寫入或型別不支援均拒绝。
- effectRoot 的 outputless Node 不被 pruning；discard 必須 bool，depth 必須 float，pixel stage 最多一個 depth writer。
- vertex network 必須有一個 stageOutput='position' 的 Node 並產生 vec4 position。這是有限 vertical proof，不是完整 vertex interface UI。

### 6.1 Shader 行號與 artifact 診斷生命期

原 sourceMap symbol 索引保留相容。新 generation-provenance.ts 提供 `GeneratedProvenance` 與 `bindGeneratedDiagnostics`，產出另加 diagnosticMap。`ctx.trace({path,definitionId?,portKey?},code)` 的 path 相對頂層 call；Generator 自動補 root Node ID，nested compiler 帶完整 child occurrence path。生成前插入成對標記，profile 組裝 shader 後移除標記且不改換行，計算 1-based physical line ranges。多層同一行允許多個 span，resolve 優先列最深 path，仍保留外層。stage body/output/effect 自動標記；內層需使用共用 trace，不从symbol名字猜路徑。

profile 必須保留這些標記直到 finish；若剝除、重排破壞配對，生成拒絕 SOURCE_MARKER。包含 #line 指令的 backend 目前拒絕 SOURCE_LINE_DIRECTIVE，需另提供明示 logical→physical mapping，不能照物理行數亂指。未標記 helper／宿主 scaffold 行回空 spans，不猜某個 Node；任意 GLSL 的 parser/source spans 仍不在此實驗內。

diagnosticMap.artifactKey 以 profile ID、loadId、artifact revision 和兩份完整 shader bytes 建立碰撞無歧義 token。這個實驗使用 exact canonical 字串，並非高效率網路內容雜湊；產品 adapter 可使用具相同內容驗證責任的識別方法，但不能以隨便一個 cache key 代替內容身分。

Binding 擁有「這次交付的 compiler sources」：`bindGeneratedDiagnostics(artifact, {target,requestId,shapeId,loadId,deliveryRevision,sources})`。source entry 含 provider實際 sourceId（例如DAT路徑）、stage、前綴行 offset；這是 adapter 注入資料，不是核心讀 native DAT。建立時檢查 artifact/load、delivery revision 不早於 artifact、source ID 唯一、offset 非負整數，捕捉不可變複本。resolve 收到 receipt 時重新比對 target host/id/incarnation/epoch、request、shape 和 artifactKey；不符回 STALE_DIAGNOSTIC，不發布節點標記。未知 source／非法行號回 DIAGNOSTIC_SOURCE；合法未映射行保留message、spans=[]。

artifactRevision 表示 code 產生來源；deliveryRevision 表示此次送出 Graph 的版本。快取重用允許 artifactRevision 較舊，但必須重新綁定 request/shape/target 並使用該次 artifact 的 map；不能以 Graph.currentRevision 相等作條件而拒絕合法 cache reuse。也不能把晚到的舊 artifact 報錯套用新 artifact，即使 sourceId 相同。此機制只做查詢映射，不改 Graph/History；UI如何展示及清除由相應 projection負責，receipt生命期由Binding管理。

順序：檢查全部資源/definition/state/ports/local values/edges/cycles/Stage eligibility →拒 error→從 stage result + effects 收集所需運算→lower→profile render。只有通過全圖結構檢查後才剪枝 unused emitters。helper bodies、statements 與 arbitrary user GLSL 的語法仍需真正 compiler 驗證；type/key 檢查不是 GLSL parser。

## 7. 操作通知與 Updates 交接

subscribeOperationEnd(event) 接收 operationId、cancelled、immutable Snapshot：

1. implicit change：候選 commit、model/context/change 通知完成，最後發 operation end。
2. explicit commit：即使沒有新 model bytes 也發一次 end。
3. cancel：補償狀態與 ordinary cancel 通知完成後發 end。
4. 失敗候選不發成功 end；listener exception 隔離記錄；listener 內同步重入寫入仍拒絕。
5. History 只做 Undo；Updates 據 demand/operation end 選擇何時生成，不能用 end snapshot 擅自改模型。

UQ01/07/08/09 驗證一次手勢合併、later active gesture 隔離與 snapshot/receipt 綁定；核心不保證「每次 change 都要 compile」。

## 8. 已執行的計算領域驗證

CQ01–CQ23 為本輪實際 node:test 案例。CQ12 包含六個真實 WebGL2 編譯/連結/畫素比對：矩陣+陣列、helper+out parameter、名義結構的 array field、注入的 MAT vertex+pixel/varying、backend-bound uniform array、numeric ivec4→vec4。證據在 architecture-coverage/qualification/compute-gpu-evidence.json；執行環境為 Edge/ANGLE SwiftShader，不是 TD 或實體 GPU 驗證。

CQ21 驗同型別不同後端 feature，包含 static未使用節點與emit動態需求；CQ22驗multi-line span、nested trail、provider source offset、target/shape/old artifact拒絕、cached reapply與profile剝標記拒絕。CQ19 另遍歷 400 numeric pairs、400 exact pairs 與五種禁止 composite pair，並實際走 Graph→generate→reload→Undo/Redo。每次完整執行的精確總數見 logs；最終全域數以 root consolidated run 為準。既有 baseline assertions 未放寬；default ES profile 仍拒 vertex network，只有明示的 profile 能開啟。

真實初次失敗及分類：
- CQ11：expected total loss=0，actual=1；是 local-value port 刪除的 recovery，edge 並未遺失。改測 zero edge losses，保留全部模型資料策略。
- CQ15：讀不存在的 Port.type 得 undefined；原型 public API 是 Port.spec.type。只修 test 路徑。
- 這兩次都不是「架構已被反例推翻」的假敘述。架構擴充 D01–D11 源於先行 contract gap 審查；沒有捏造 pre-fix runtime failure。
- CQ19：pre-fix actual undefined，expected cast；證明單靠 AB adaptation 或 explicit Convert 無法承載 LC-NODE-362 的自動連線需求，導致 D12。
- CQ20：pre-fix 第二版本 register 回 RESOURCE_KIND_CONFLICT；證明「每 kind 全 registry 一個 entry」與每圖版本隔離不能共存，導致 D13。
- 後兩例真實失敗/修復輸出分别保留在 compute-counterexamples-before-fix.log（2 fail）及 compute-counterexamples-after-fix.log（2 pass）。沒有弱化期待；同圖多 provider 的歧義仍被拒絕。

## 9. 391 葉映射怎麼閱讀

node-analysis.json 每葉有 exact inventory SHA256、完整 operationSpec（含所有模式/interface/default/nativeCall/outArgs/constantInputs）、failure/persistence/Undo、例外、UNKNOWN、owner、required paths 和 acceptance strategy。19 個 family 只是共用 mechanism，不足以把 Tint 與 Color Multiply、matrix native indexing 與 Array safety、Voronoi 各 mode 視為同一測試。

圖中語意的保存與執行分開：
- 已展示：同一 Graph 的 typed resources/Node/Edge/History/保存/生成/Context 實際接起來。
- 已展示：缺 module、wrong fingerprint、bad resources、constant mismatch、varying mismatch 都會拒絕執行而保留資料。
- 尚未展示：391 個 NodeType 的完整數值等價、所有 native TD helper/POP/material、所有 driver 的 undefined numeric cases、任意使用者 GLSL parser、所有 interpolation qualifier/geometry source/MRT 規則、完整 legacy Auto ranking/typed-value cache UX。
- 還沒有完整 ISF/FFGL backend；可注入後端是擴充路徑，不是假裝宿主已整合。

原型限制：nested full Network 與 clipboard 的責任/測試在 workspace qualification；原生宿主同步在 host qualification；UI style 由 presentation qualification。這份計算契約不能單獨替代它們。Graph.resources 與 exact pins 是共同交接點，不能各自再保存另一份內容。

