# S05 portable catalog 工程預備分析

本報告是唯讀 scout 的分析輸出，供 Coordinator 組成下一個有界工作封包。不是實作、啟動 S05、Fresh Review、接受證據或 project state；未執行產品測試，沒有新增 PASS。唯一允許新增的檔案是本報告與同目錄 `report.json`。既有 `continuous-inventory-01` 兩份報告保持原樣。

## 固定來源與範圍

- Run：`GRAPE-CONTINUOUS-20261005-01`。
- Packet：`CONTINUOUS-PORTABLE-CATALOG-SCOUT-01`，2797 bytes，SHA256 `91eaada8f7ab7305a20d5d1cb93005df48daf4ca236d1c4a02246fe4ece28f52`。
- Packet locator：`production/evidence/coordinator/continuous/20261005-01/portable-catalog-scout-packet-01.json`。
- 契約／policy checkpoint：`9003c00b214ac29cafcb6cc22ac10693ac92a0bf`。
- 生產程式固定來源：`02313a0d0d6bd3d66cbfd9fe20c6df36c53909d6`。以下 source locator 一律在此 revision 解讀，不隨主工作目錄稍後的 B01 變動漂移。
- 先前基準：`.verification/continuous-inventory-01/report.md`（SHA256 `edba25ff5bb7b58c472f944a7f426a54ba620c3e65ac9f941341fc480eea5712`）及 `report.json`（SHA256 `ec280a241b9f23330585b8ca2d95d134215ee959bb85cf86ee7d37bf36f5c254`）。
- 本輪只準備 portable catalog；目前唯一 product/state writer 仍是 Original Implementer。下列 module 名稱、測試設計及批次代號是建議，不是已接受新契約或派工。

契約優先序是 README／AGENTS／continuous policy、checkpoint 已登錄決議、IH-005 production-facing contracts，再依每個 capability 的規範 operationSpec 與 behavior contract。`handoff/executable-reference/COMPUTE_QUALIFICATION_CONTRACTS.md` 的機制說明可用於了解 oracle，不能把 reference runtime、DTO、矩陣表示或其固定上限搬進產品。

## 結論與第一個完整有界族

建議 B01 完成並由 Coordinator 凍結下一來源後，以 **PC01「角度＋圓／雙曲三角函數」**為第一個 portable 命名子族：

`LC-NODE-018`, `LC-NODE-028`, `LC-NODE-094`–`LC-NODE-106`。

共有 15 個 leaf，每個恰有 `float / vec2 / vec3 / vec4` 四個 mode，共 60 個 leaf-mode。這是 `NQ-expression` 的完整、有界子族，不是整個 108-leaf `NQ-expression` 已完成。JSON 逐列保存 60 個 canonical mode 的來源、ports、順序、default、數值樣本與驗證要求，不能以單一共享 emitter 的測試代替。

現有型別、immutable DefinitionSet、NodeDefinition、choice/vector widgets、Compiler、ES300 profile、Graph 操作與保存機制可以承載這族。沒有必要先等 S07/S08、TD、native window 或新 Human 產品決策。但不是「只加 15 個 emitter」：**一般可變型 operation 的 per-shape 手動值恢復仍有工程缺口**，必須在首批納入 `LC-NODE-377` 的 float/vec2/vec3/vec4 有界前置範圍；其 matrix/int/bool/compound 其餘分支仍未交付。

首批直接 acceptance 對應 `AT-S05-01`；常數、全圖錯誤、profile/stage 的適用分支對應 `AT-S05-02/03`。`AT-S05-04` 的 TD/build/GPU 全矩陣不是這批 bounded ES browser 證據可關閉的項目。支持性 crossrefs 為 `LC-NODE-362/363/364/365/366/367/369/370/377`；引用不代表整 leaf 已接受。

## 既有範圍與不能借用的證據

S05 歷史接受的精確 locator：

- `production/evidence/acceptance/s05/closeout-20261004-01/accepted-scope-01.json`。
- `production/evidence/s05/closeout-20261004-01/independent-review/SCOPED_CLOSEOUT_ASSESSMENT-01.json`，SHA256 `2799350c47ed934ad0b2c4576218f612d2b6d4c12d21ad72c7914d0172da7e15`。
- implementation `aa4c86e20b0b4b54218b9992921578e7f24a28a2`，reviewed revision `6c3a734325d0db2d924356a9614e971d80a966c8`。
- scope 是 DEC-GRAPE-003／AC-GRAPE-002 十項有界 function criteria、fixed `LC-NODE-011/012/013/014` 與已記錄同步 snapshot reuse。不能轉成全部 catalog、CQ01–23 或 native qualification。

source02313a0 的 `modules/fixed-values.ts` 有四個 fixed definitions，且 `modules/function-operations.ts` 有支持性 float Add（輸出 `value`）及其他 function fixtures；`modules/nodes.ts` 有 S01 float Multiply（輸出 `result`）、Compose 等支持節點。catalog Add 的 70 個 variants、Multiply 的 142 個 variants 及 canonical ports 並未因此完整交付。不要在既有 exact pin 背後把支持節點改成新 catalog definition。

DEC-GRAPE-002／AC-GRAPE-001 的 16 組 float-vector Edge 表已在 S04 有界接受。它修訂了對應 float 接收政策；不能從 Legacy `LC-NODE-362` 重新套用 vec4→vec3 拒絕，抵觸已接受決議。這也不表示整個 int/uint/double/bool numeric 連線族已完成。DEC-GRAPE-005 的新 Image Output 0.3.0 與零值行為保持 exact 版本邊界。

## 全 portable 目錄的相依顺序

S05 canonical mapping 是 391 個 LC-NODE：269 Portable、122 Environment-bound。269 中只有上述四個 fixed leaf 有精確 catalog bounded historical acceptance；其餘 265 個是「仍需 scope/evidence assessment」，不是逐一證明完全無程式。16 個 mechanism families 含 portable 項目，另三族完全屬環境分支。下表是工程相依關係，不是新架構分層；每族完整 IDs 在 JSON，所有 rows 均有 checkpoint locator。

| 順序／family | 精確範圍 | 可進行的工程與前置條件 | 尚不可推論的完成範圍 |
|---|---|---|---|
| P0 共通交易／`NQ-core-contract` | 365–367、370 | 沿用全圖驗證、exact identity、只讀 compile、名稱／symbol 隔離，為每批補 provenance 與 malformed saved data cases | source compiler 的 provenance 是 stage/node/symbol；完整 physical-line、nested occurrence、Host compiler 定位另有殘留 |
| P0 `NQ-source` portable | 363 | 接線優先但保留 local inputValues；被接線遮蔽的非法保存值仍拒絕生成 | 不把 uniform 支持樣例當成 34/35/36 等 native source catalog |
| P0/P1 `NQ-vector` | 32、33、47–52、377 | 先補首批 float shape backups；接著 vector constructors、component/split/swizzle/replace，逐 mode 與 component policy | 15-mode nodes 涉及其他 numeric/bool family；不能把 Compose 支持節點當所有向量節點 |
| P1 `NQ-expression` | 108 IDs，JSON 完整列出 | 先 PC01 的 15×4；再按完整命名子族分圓整／指数／比較／幾何／算術／packing 等，先有其值型別、回傳型別、發射需求與 profile admission | 全族包含 float/double/int/uint/bool、多輸出、out arguments、matrix arithmetic；不要用 float 成功概括其它模式 |
| P2 `NQ-conversion` | 4、5、64、65、362、373 | 延伸實際型別宣告、literal/typeName、選定 numeric policies；Scalar/Convert／Range 各完整 variants；算術 shapes 再與 15/16/19/20 整合 | DEC002 的 float 表不授權 double/bool/matrix／Auto新語意；explicit constructor 不擴大 wire policy |
| P2 `NQ-constant` | 44、364 | Constant 38型別與 ordinary provenance；requireConstant 在 root/nested/expand/function 及圖中未使用節點都檢查 | 53 Spec Constant 為 Environment-bound；native specialization 與 backend lowering 另處理 |
| P2 `NQ-derivative` | 174–182 | 174–176 的四種float modes可先在 pixel profile 做數值與stage負向；fine/coarse 必須有不同 backend capability admission | 177–182 不能因 ports 跟一般float一樣而宣稱 ES300支援；全九leaf族需其可用 backend 或明確unsupported分支 |
| P2 `NQ-effect` portable | 357、358、372 | 對照既有 pixel-effect支持節點，完成 Discard/Depth canonical schema、順序、effect roots及唯一depth writer；納入unused/嵌套/function負向 | 不把支持樣例當原命名operation全模式或native AlphaTest／Dither |
| P3 `NQ-matrix` | 6、71–81 | float 9 shapes已有型別儲存支援；constructor／列欄／transpose/componentmultiply／outerproduct／inverse/det逐variant，再補double profile及literal | 18-mode族包含double；矩陣本地值在production是column arrays，不能抄reference平坦array；75/76越界依 G-LU-NODE-003 原始未防護行為觀察，不發明clamp |
| P3 `NQ-structure` | 86、93、361、368 | 沿用 S03 nominal structure/Field/typed refs，補完整38值型別、recursive boundaries、field缺失、保存引用與全部local-value cases | S03／DEC004只證其已選typed closure；不自動算全catalog或任意arrays-of-arrays |
| P3 `NQ-array` | 82–85、88 | element型別＋fixed/source-bound extent＋typed reference closure；create/index/replace/length逐schema參數展開，支持／拒絕深度明示 | interface variants=1不等於只有一種測試；element×extent×nested/function/錯誤須展開；Host extent等S07/S08分支 |
| P4 `NQ-dynamic` | 1、2、3、7、8、70、369、374、376 | 在上述型別／value preservation／reconciliation可用後做Router/Math/Switch/Compare/If的精確ranking、lock、preflight與反序鏈；Voronoi另完整子批 | 不由首批手動choice推論Auto完成；70的搜尋／Minkowski／性能受G-LU-NODE-004數值證據限制 |
| P4 `NQ-custom-code` | 46 | 先明確其 canonical ports/state/code signature、全圖驗證、function組合、diagnostic provenance；透過module emitter | 不把 arbitrary string當trusted型別或繞過compiler／保存驗證；本scout未逐審全部code template模式 |
| P4 `NQ-annotation` | 9、10、375 | 依原leaf分別交付 authored註解／GLSL展示及geometry不影響code；与S06 authored UI responsibility接合 | 不把UI幾何放入shader語意，不把撤回自動codegen復活；普通便條不是新shader operation需求 |
| P5 `NQ-texture` portable | 43、89、90、260–327、344–356、371 | sampler token／resource binding／維度／LOD／offset／constant要求／stage與profile admission先行，再按sampler與function完整族 | Portable不是ES300可用：sampler1D、samplerBuffer、gather及各offset/profile差異要逐列判斷；資源來源／runtime實測仍需provider，不能用local數字假裝sampler |
| P6 `NQ-subgraph` portable | 378–382、386、387、389 | 依各builtin圖的確切operation/resource closure，在前序葉完成後，以production Graph-owned definition建立與驗證；保存、Make Independent、shared/nested/function及exact包引用 | 不先做flattened魔法emitter冒充原builtin圖；圖body數值、defaults及依賴仍逐builtin對照 |
| 環境平行軌 | 122 Environment-bound；JSON逐ID保存 | S07 bootstrap/provider availability → S08 bindings/Updates／native shader shell與resources → exact TD/build/GPU測量 | `NQ-native`71、geometry23、lighting8全是環境；其餘source8、effect3、texture2、constant1、subgraph6亦在此軌 |

可並行的是規格／fixture準備；產品寫入仍由唯一writer串行採用。每次新批次只引用此不可變分析基準及自己的receipt，不以這份 JSON 建立可變完成狀態庫。

## 實際 module／seams 與首批前置缺口

以下 source locator 在 `02313a0…`：

| seam | 可使用內容 | 首批約束／需補內容 |
|---|---|---|
| `production/src/sdk/editing.ts` 的 `NodeDefinition`、`ParameterSpec`、`EmissionContext` | initialize、ports、parameters、stateCodec、validate、emit；只讀 resources/types；typed expressions、literal/typeName | 每leaf精確state selector與ports；不得拿Graph handle或加入名稱分派；現有callback沒有完整 old inputValues 的型別切換transition入口 |
| `production/src/sdk/public-surface.ts` | exact refs、presentation owner、capability/stage/graph admission、typed stage program | 中英文fallback與aliases來自module presentation；UI不得硬碼operation清單；本族純expression無effects/resources |
| `production/src/definitions/registry.ts` | register、深freeze、pin、精確version+fingerprint resolve；stage先register | 新module後重新建立新Graph所需DefinitionSet；舊Graph pin不自動漂移，不能same-name fallback |
| `production/src/modules/fixed-values.ts` | strict finite float32 scalar/vector validator、number/vector widget及literal使用方式 | 可依公開seam重新寫獨立module；不改其four fixed exact pins或把value state錯當operation inputValues |
| `production/src/modules/function-operations.ts` | 普通expression、constant三值、functionProfile、uniform支援參照 | 支持Add output是value；不要直接共用成canonical trig ports，未知constant不是true |
| `production/src/definitions/types.ts` | float/vec2/3/4、int/uint、9 float矩陣、typed arrays/struct；DEC002 16float plans | 首批不用增加值型別；未見bool/ivec/uvec/double/dvec/dmat/sampler完整宣告，後批需顯式工程；generic numeric宣告目前是float width1–4 |
| `production/src/model/graph.ts` `Draft.parameter` 約1298、reconcile約515–615 | transaction、state codec、port schema、input edit validation、connected input拒寫、loss/default及edges同批重驗 | **LC377 gap**：一般operation不相容值會移loss並設新default；這不是 per-shape切回恢復。需同一Graph Operation內讀舊values、更新module-owned inactive-shape backups、產生新values，Undo/redo/reload都保留 |
| `production/src/application/editor.ts` catalog約605–680、parameter約1435–1484 | generic catalog從definition state choices產生候選；public create/parameter commands、lifetime/lease checks | 60mode不能靠測試私改state造出；類型編輯與首次新增均走公開路徑；不混入Add/Browse重新設計 |
| `production/src/features/node-browser.ts`、`features/inspector.ts`及widgets | metadata search／ports preview／generic parameter views | 保留pending operation、readonly、IME、stale lease／draft隔離；支持dtype choice與unconnected scalar/vector輸入 |
| `production/src/generation/compiler.ts`、`definitions/constant-analysis.ts` | 全圖admission後read-only lowering；連線adaptation／literal；常數分析調用module.emit；nested/function組合 | exact `sin` 等GLSL builtins，不用CPU生成結果；connected illegal saved value仍由model診斷阻擋；資料快照／History不動 |
| `production/src/modules/image.ts`、`image-current.ts`、`image-zero.ts` | image graph、vertex/pixel stages，current與zero boundaries；`functionProfile`延伸ES300 | runtime graphKind只有已註冊image；canonical targets top/mat是產品eligibility oracle，不能因public常數有material就宣稱TD MAT已实现 |
| `production/apps/web/main.ts` 約74–127 | 唯一composition root註冊module/profile與presentation | 新module註冊與文字；不能放emitter或第二份nodes schema於main |
| `production/tools/module-pins.mjs` | 源檔UTF-8把digest literal normalize成`sha256:<self>`再SHA256 | 新module列入verify集合；不在本scout執行--write，不重新指紋化既有module以掩蓋語意改動 |

首批建議新 additive owner（例如 `grape.nodes.trigonometry` 0.1.0，名稱仍由Implementer選），15個穩定 typeId，各獨立presentation/schema/ref，允許內部純helper避免重複。不能把generic Math單node或一個任意GLSL函數字串視為全部15leaf。

LC377 的實作選擇是普通工程問題：以最小、可選的 module-owned parameter/input transition seam 在 `Draft.parameter`／共同reconciliation transaction內計算新state與values即可，不需建立第二Graph或Panel store。需要取得舊state／ports／local values的detached輸入、限制返回可寫範圍、同批codec／values／edge重驗與完整回滾；core只呼叫宣告協定，不判斷trig名稱。這是候選方案，現有SDK並未提供這個hook，不得在工作封包中把它寫成已存在接口。若現有宣告的其他合法公開操作足以達成，可選更小做法；只有實際契約／invariant反例才升Architecture Change。

backups 是 Graph-owned、module-private serialized authored state；current值仍只在inputValues。不要用Panel/sessionStorage、任意extensions或mutable singleton。只保存inactive shapes，或另有明確不造成第二current值權威的表示；owner codec驗shape／finite float32／key，referencesComplete維持真實。scalar→vector缺分量依LC377的第一分量補值，shape切回恢復已存資料；不把Edge的Z=0/W=1政策套到手動編輯reshape。matrix overlap/int clamp/bool conversion不在本首批擴張。對未精確化的重疊編輯細節應回到canonical evidence核對，不能擅自發明值。

## 首批精確 schema 與每模式數值計畫

所有15leaf的 `defaultParameters={type:"float"}`，`ordinaryConstantEligible=true`、`specializationExpressionEligible=false`。canonical stage為vertex/pixel，target為top/mat。production型別token可明確映射為`glsl.float/vec2/vec3/vec4`；不得靜默多收double/bool/matrix。

14個unary leaf的輸入stable key是`value`，輸出是`out`，型別隨四個mode一致，預設scalar0或對應全零vector。**acosh的預設也是0**，不能把它改為1、clamp或改算法。`LC-NODE-106` 的key為`atan2`但GLSL lowering是`atan(y, x)`，輸入順序是`y`後`x`，y預設0、x預設1（向量逐分量），輸出`out`。

下列數值池對每個mode單獨使用；float必須輪流涵蓋全部scalar cases，vector以滑動／循環方式覆蓋每個case並使用不相等分量。JSON的60rows保存每mode的完整向量化測試inputs。期望值由獨立數學比較器計算、輸入先float32化；CPU Math只作有界比較oracle，不成為產品GLSL語義替代。

| ID | operation／GLSL | 每mode有定義域的數值池 | 專屬negative／邊界 |
|---|---|---|---|
| 018 | sin | -1.25, -0.25, 0, 0.75, 1.5 | 正負／0；不得用degree解讀 |
| 028 | cos | -1.25, -0.25, 0, 0.75, 1.5 | cos(0)=1，組件獨立 |
| 094 | radians | -180, -45, 0, 90, 180 | 不是只換label；輸出可負或>1 |
| 095 | degrees | -π, -π/4, 0, π/2, π | 不可用RGBA8 clamped讀回冒充數值驗收 |
| 096 | tan | -0.9, -0.25, 0, 0.5, 0.9 | 數值assert避pole；不得偷加clamp |
| 097 | asin | -1, -0.5, 0, 0.25, 1 | ±1端點；域外只檢保留lowering／無自訂修復，不固定GPU NaN |
| 098 | acos | -1, -0.5, 0, 0.25, 1 | acos(0)非0；域外同上 |
| 099 | atan | -4, -1, 0, 0.5, 3 | 與atan2是不同node／signature |
| 100 | sinh | -1, -0.25, 0, 0.5, 1 | 中等輸入防溢位測試誤判 |
| 101 | cosh | -1, -0.25, 0, 0.5, 1 | cosh(0)=1、輸出可>1 |
| 102 | tanh | -2, -0.5, 0, 0.25, 2 | 飽和附近有界數值，保持負值 |
| 103 | asinh | -3, -0.5, 0, 0.25, 2 | 不誤用asin |
| 104 | acosh | 1, 1.25, 2, 3, 4 | default0與域外不改；數值assert只用>=1 |
| 105 | atanh | -0.75, -0.25, 0, 0.5, 0.75 | ±1／域外無額外安全承諾；不替換成atan |
| 106 | atan(y,x) | (-1,-2),(-1,2),(1,-2),(1,2),(0,2),(2,0),(-2,0) | 四象限與軸、非對稱y/x；避免(0,0)固定結果承諾；missing/reversed key必須偵測 |

每個60row都需下列證據，執行receipt逐row列actual outcome、fixture、artifact identity、browser/renderer與限制：

1. UI新增該leaf，驗名稱／搜尋alias／精確module ref；四個mode的ports direction/order/type/default；choice及scalar/vector editors；首次default與edited value分開。
2. 本地值與connected值兩條路：連線優先，不覆寫保存local值；disconnect恢復local。修改正連線input被拒，讀回不偷變成host observation。atan2分別／同時連y/x且值不對稱。
3. 依accepted DEC002浮點表測供給接收端的值與source不變，exact端點仍拒異型；支持的16組不重開產品選擇。任意int/bool/matrix來源、偽造adaptation／endpoint／cross-network／cycle／single-input replacement的適用負向不得被catalog候選或compile跳過。
4. choice模式切換、backups切回、connected mode改變的edge/loss、Undo/redo、save/reopen、nested shared occurrence。一次使用者commit是一個Graph operation；cancel／stale load／readonly不更新revision/history。編譯本身不建立Undo。
5. root／expand／function／nested function與vertex／pixel的宣告支援組合，各row至少具有可追溯schema/lowering/link coverage；共用transaction/lifetime adversarial tests可按明示crossrefs重用，不能取代每row產品路徑。要宣稱某組合完成，receipt就必須實際涵蓋它。
6. ordinary constant local→true、uniform/function ordinary input→false、unknown provenance不等於true；requireConstant sink在root/nested/function中的正反例。不得因common helper或CPU先算過而把runtime值標constant。
7. exact saved module缺失／同name不同fingerprint、非法type choice、extra state欄位、錯誤ports／output key、vector長度／sparse／NaN／Infinity／float32 overflow、被edge遮蔽非法inputValues；可表達錯誤保留與generation拒絕、不可表達候選原子回滾，依既有inspection/Graph邊界分辨。
8. unsupported profile graph/stage/capability、未使用錯誤節點／resource及stale plans仍拒絕；generate snapshot與Graph bytes/revision/history前後一致；輸出diagnostic定位leaf，不能只assert任何error。

## browser 數值量測不是產碼字串測試

現有 `production/tests/fixtures/s05-webgl.ts` 的 `executeGL` 會原樣compile/link artifacts並draw，但只從預設 framebuffer讀 `Uint8Array RGBA`。負值与>1會被限制到色彩範圍，不能驗degrees、cosh、asin等全數值。uniform helper也只處理float/int/uint/vec4，首批vec2/vec3 connected runtime path需補對應測試綁定。

建議在測試層提供float color framebuffer讀回能力，記錄真實extension／framebuffer complete／readPixels error；不支援時該測量明列 unavailable，不能把clamped值或CPU結果當browser成功。或在獨立的明示test profile增加已知可逆scale/bias來讀回，記錄量化誤差與解碼，不混稱production原樣artifact的raw輸出。signed、>1及不同vector分量都要有樣本。

pixel 60modes以實際product compilation artifact執行；vertex 60modes至少原樣product program compile/link/draw，另外可用合法的test-profile varying／讀回方式量測stage program中的數值。兩份證據分欄，不能修改生成後shader文字再宣稱production artifact原樣通過。vertex讀回harness的API支援與誤差界限在implementation時實際驗證，本scout未宣稱已可用。

使用獨立CPU比較器與有界inputs能抓出radians/degrees互換、atan2順序反轉、錯函數／錯mode／swizzle／常數化等真缺陷。每函數記錄absolute+relative tolerance與precision/renderer，先選保守有意義的樣本，不在failure後任意放寬。有限且可float32表示的輸入不因數學域外自動成非法 authored值；GLSL未定義結果與資料型別驗證是不同事情。特別保留acosh(0) canonical default的compile/no-mutation證據，不能為得到好看的pixel改契約。

## 版本、保存與測試邊界

1. 建議新增module exact manifest＋state codec v1及其presentation owner；每個node有穩定typeId。新module source fingerprint依現有module-pin算法記錄，原`grape.nodes.basic`／fixed-values／function-operations／GraphKind exact bytes和pin保持歷史意義。若日後行為改变，新exact identity與明示converter／reviewed upgrade；不做nearest-version fallback。
2. 型別choice、inactive-shape backups皆可放新module既有state payload；只要不增document/core wire meaning，不需憑空創2.2。writer現行2.1與AC001 v1/v2 Edge meanings繼承；module schema與document版本分開。若必需改core wire，才按14章提出精確versioned change，不能藏在extensions。
3. 已開啟document的DefinitionSet固定；註冊新module不自動改既有Graph.modules。要在既有圖加入新定義，使用已宣告的definition/package adoption公開路徑與同批驗證；若該入口缺失，為此批明確補工程，不能私改pin list或把舊圖當新圖。
4. 缺精確module時保留opaque state、ports、values、refs與backups，安全rename/move／save仍依既有recovery規則；generation blocked。reload／package／Personal／clipboard只聲稱實際執行的authorized分支；DEC004既有四類typed dependency不代表所有catalog自動接受。
5. 根verification與production build／unit／conformance／browser由後续Implementer依變更執行；本輪僅讀檔、生成兩份分析與檔案hash，**未執行任何產品測試**。frozen qualification只可disposable byte copy，絕不在handoff原地執行或安裝。

## 真正的外部相依與未解界限

- `G-LU-NODE-002` 是360命名操作逐UI/history/reload尚未實測的證據缺口；本族可用新的60row產品證據有界消除適用缺口，不需Human先決定算法。
- `G-LU-NODE-005` 是歷史Node VM fixture缺URLSearchParams的測試阻塞；用真實browser驗本批shape/typed editing，不把fixture報錯當產品故障或產品Gate。
- `G-LU-NODE-001`、AT-S05-04及native/helper branches需要真TD/build/driver/GPU觀測。browser software renderer或ES300 probe不能標成TD實機。
- `G-LU-NODE-003`只針對75/76未保護矩陣索引；保留raw行為觀察，不以Array安全clamp代替。若要承諾不同成功／拒絕policy才需產品決策；目前不阻擋PC01。
- `G-LU-NODE-004`只針對Voronoi搜尋／特定Minkowski／性能範圍；不阻擋trig。
- `G-LU-NODE-006`／`G-LU-AUDIT-003`是舊golden/revision差異追溯，不能重錄golden消除反例。新catalog module不承諾所有Legacy圖無converter可直接載入。
- `G-LU-UI-006`的歷史inline_vector_values與現行Vector/Replace差異在該族另核對，不能拿舊斷言強制改fixed節點。
- PD1已由DEC004解決有界Personal matrix；PD2 >100 named layouts、PD3跨manager fallback、PD4A/4B native window都與PC01無直接前置關係。型別／emit／readback缺口是工程或runtime證據，不是新的Human產品Gate。
- OC09自動codegen撤回，本批仍由既有明示Generate路徑測量；不復活operation-end自動生成或刪除IH005的原始Updates契約。OC11 stacking、general Add/Browse initial placement deferred、新UI美化、未接受筆記／future refactor均不納入。

## 可直接轉成有界工作封包的成分

候選 packet scope：PC01 的15leaf×4mode與上述有限float shape-backup prerequisite；exact支持性crossrefs／evidence ledger，明示無全S05／native／TD／完整LC377完成聲明。輸入固定來源：本report與JSON、checkpoint canonical rows、DEC002/AC001/DEC003/AC002/DEC005、下一writer採用的實際HEAD。允許變更候選：新module、composition-root登録、module-pins清單、必要的generic module transition seam及針對性production tests；由Coordinator重新界定可寫範圍，不是本scout授權。

順序：先把60row fixture／schema／數值與negative ledger固定；補float per-shape值恢復的最小Graph-owned seam；逐leaf/module完整註冊與UI參數；root/pixel數值再nested/function/vertex；exact保存與負向；根verification；fresh reviewer以同一凍結來源與實際result逐row審查。任何未執行mode標明未交付，不用共享模板或completedSlices補齊。

完成後每批的新receipt引用本 immutable inventory；本文件保持分析快照。STOP_WRITING。
