# 畫布操作交接規格

版本：CANVAS-005 / ATLAS-005，2026-10-03。用途：完整說明功能預覽版畫布的可見行為與操作手感，供人類審查及重構方實作對照。**這是 UX reference，不是新的 architecture baseline，也不要求重構採用 Legacy DOM、event listener 或 state 結構。**

先看[畫布圖解](../atlas/index.html#canvas-operations)，再按本稿查操作；機器可讀的逐項驗收見 [CANVAS_ACCEPTANCE.json](CANVAS_ACCEPTANCE.json)。Group、節點排列、Link 的細節沿用各專章，本稿補齊它們共用的畫布入口、焦點、選取及生命週期。

## 1. 證據、保留程度與用語

- **SRC**：2026-10-03 唯讀檢查 Legacy HEAD `e005f08badff8caef6331de5312809e4cab09cc2`，具體路徑與行號見 [NAV](../research/canvas-navigation-evidence-005.md) / [SEL](../research/canvas-selection-evidence-005.md)。讀過測試不等於跑過測試。
- **LIVE**：Function Preview 0.8.273、MAT Pixel、1280×720、UI scale 100%，原 owner 指定 disposable graph 上的[七組實際操作](../research/canvas-live-005.md)。只涵蓋列出的環境及結果。
- **ILLUSTRATION**：圖册靜態 SVG，只說明視覺與行為關係，沒有冒充能操作的產品畫布。
- **REWRITE BOUNDARY**：新產品遵循已接受的 Graph / EditorContext / History / application commands ownership。Legacy 的全域變數、儲存拓樸或缺少 guard 不是移植要求。
- **OPEN**：尚未實測、證據衝突或可疑 Legacy 行為。必須留在交接，不替它編造一致的理想實作。

保留能力與可見結果；按鈕實體位置、DOM/CSS、渲染技術由重構方決定。以下常數是目前手感參考，若調整需人類 UX review，並非不可改的 architecture invariant。預設開啟能力為必要基線，預設關閉變體是可選實驗能力；現況值、source default、跨版本保存值分開看。

## 2. 三種不同狀態

| 狀態 | 操作例子 | 提交／Undo／保存 |
|---|---|---|
| 相機／可見工作區 | 平移、wheel、Dolly、Home、Frame、Focus graph | 改變 view，沒有 Graph History entry，不應重產 GLSL；Legacy 目前不保存相機到圖。新產品 view owner 是 EditorContext |
| 選取與導航 | 點節點、modifier toggle、框選、方向鍵、沿線找來源 | 更新選取、primary、工具列／Help／Inspector的適用投影；不改圖內容，不加入 Graph Undo |
| 文件版面編輯 | 拖節點／Group、排列、改節點寬度 | 預覽與提交分離；有變化的完整 gesture 一筆 layout transaction，可 Undo／Redo；節點座標等 document layout 可以保存，不應改 GLSL 計算結果 |

Stage／子圖切換是 scope 變化，不能讓舊 gesture 繼續寫入新的 scope。產品保有 model、操作入口只是呼叫能力；Panel 不因顯示按鈕就擁有另一份 History。

## 3. 起手式與命中優先

| 起點與動作 | 操作 |
|---|---|
| 空白左鍵拖曳，Box Select關閉且未按Shift | 平移相機 |
| 空白右鍵拖曳，或Shift＋空白拖曳，或Box Select開啟時左鍵拖曳 | 框選 |
| 空白中鍵拖曳 | Dolly；不是平移。數值欄位的中鍵保留給Value Ladder |
| 節點標題拖曳；啟用body-drag時的非互動body | 移動節點／目前多選集合 |
| 接孔、數值欄、選單、按鈕、resize handle、Group標題 | 各自優先處理，不可泛化成背景pan或節點drag |
| 滑鼠wheel到達Canvas | 以游標為錨點縮放；可捲動內嵌區域先攔截wheel |

右鍵未形成拖曳可開情境選單；成功右鍵框選後抑制隨後contextmenu。空白左鍵點擊在未武裝連線時清選取；正在click-to-connect時交給連線的落空白流程，不能先清掉它。CTRL／CMD本身不把左拖改成框選。詳見SEL與NAV的命中例外。

## 4. 平移（C01）

空白left pointerdown取得焦點與capture、關閉Creator，保存起始pan。pointermove使用 `起始pan + 螢幕位移 / UI scale`，不除以graph zoom，畫面跟著手勢移動；一般阻尼目前預設開，150ms。

放開結束；有移動時不清選取。`>3 CSS px`用來區別點擊結果，但**不阻止門檻內pan更新**，而且目前每次move重新判斷，拖回起點附近可能被當成點擊。pointercancel清除handler與marquee，**不還原起始相機**。Esc只凍結進行中的相機動畫，普通pan的pointer owner並未因此被取消。這些最後兩項是Legacy caveat，不可用「任何取消都rollback」蓋過。

LIVE CL-01：(+40,+30)拖曳得到同量pan變化、zoom與9個節點的graph位置不變。沒有由save revision推論無網路請求或shader cook。

## 5. Wheel與百分比選單（C02–C03）

Wheel：負deltaY放大，正deltaY縮小；目前倍率 `exp(-deltaY×0.001)`。錨點是游標相對Canvas的位置（除UI scale），縮放後保持同一graph point在同一螢幕點；連續wheel從尚未完成的同類target累加。普通範圍25%–170%；Overview開啟可到20%。目前handler直接使用deltaY，不正規化deltaMode、不使用deltaX，trackpad／不同OS實際手感仍須驗證。

百分比按鈕開選單；普通preset為25、50、75、100、125、150、170%，Overview才多20%。選preset以**畫布中心**為錨點，並非上一次滑鼠點。顯示四捨五入百分比，不代表精確命中該preset；開選單本身不改view。方向鍵循環、Home/End首末項；Esc關選單回opener；Tab關選單後走正常焦點順序；outside關閉。這裡的Home鍵是選單首項，與Canvas的H不同。

LIVE CL-05：wheel前後投影錨點誤差<0.002 CSS px；只是單次desktop樣本。百分比選單另有舊LIVE-005 25/50/100/170取樣；完整鍵盤、UI倍率與touch序列仍OPEN。

## 6. Dolly（C04）

空白middle down起動；節點、線、Group實體、控件與overlay不借用此手勢。沒有其他wire、placement、drag、resize、touch owner時才接受。右／上放大，左／下縮小，混合方向依 `delta=(dx-dy)/起始UI倍率`，倍率 `exp(delta×0.006)`。固定按下位置為錨點；游標顯示放大／縮小。每步clamp目標，因此到界限反向時即時回應，不需拖回一段死區。

中鍵放開取最後座標，完成尚未到達的target並清理；wheel先結束Dolly，再交wheel。Esc、pointercancel、lostcapture、blur、resize、hidden會嘗試回起始pan/zoom，但只在同graph／scope／stage／UI scale下；換scope後絕不把舊view寫回。Dolly不同於普通pan，不可共用「取消一定不回復」的說明。SRC與測試意圖已核對，本輪沒有實機MMB qualification。

## 7. Home、Frame、Center與專注（C05–C07）

| 能力 | 目標與時間 | 邊界 |
|---|---|---|
| Home：H／Home按鈕／選單 | 當前scope全部節點，立即跳到結果，不受阻尼控制 | 不清選取；空圖no-op；已在最低zoom的大圖不保證全部放得下 |
| Frame：F／選取工具列Frame／選單 | 有node selection且未選edge→選取；否則全部。独立Frame動畫，預設333ms | bounds用真實展開／收合大小，完整包含的Group外框一起計算；最多100% |
| Center：導航策略 | 保留zoom，只把目標中心移入畫面 | 是節點方向鍵導航的可配置結果；Link箭頭固定Frame，非全圖fit |
| Focus graph：按鈕／Ctrl或Cmd+Enter／選單 | 隱藏周圍chrome、保留Canvas與工具列；不重新fit或修改node位置 | 再次切換才離開；**Esc不退出Focus graph** |

Fit參考：左右合計留100、上下合計140 local CSS px，`clamp(min(1,(W-100)/boundsW,(H-140)/boundsH), minZoom, 1)`；不是對所有窗口都寫死screen px。空圖Home在當前source中甚至不保證停止既有motion，另列OPEN。

Home會停止舊動畫並立即採新結果。Frame與wheel的動畫不可互相當成同一個時間設定。Esc／新的Canvas內容pointerdown凍結displayed view（工具列、view controls、選取工具列、connection notice與浮動Parameter除外）；blur／resize／hidden完成pending target；專屬gesture可以更早攔截並依自己的取消規則處理。相同Frame target重複觸發不重新計時。

Browser fullscreen（Alt+Enter）是另外的能力，Focus graph不等於fullscreen；原生權限／失敗／unsupported需個別回饋，不能隱含保證所有宿主成功。LIVE CL-02/03驗了Array定位、Home、Focus按鈕與Esc保留狀態；沒有驗fullscreen。

## 8. 單選、多選與primary（C08）

普通click取代選取並設primary；Ctrl／Cmd／Shift做成員toggle。加入者成為primary；移除後取選取加入順序最後存留者，空則null。Group與connected-selection先保留仍有效primary；後者失效才取圖中第一個結果。primary必須屬於選取集合；它不是「node array第一項」。點已選節點再開始拖動，不應在pointerdown先破壞多選集合；已選節點只click會縮為單選；真正drag才保留多選。未武裝連線的空白click清選取與相關工具列；節點選取和edge選取互斥呈現。純選取不用Graph Undo。

Inspector是否跟隨以目前Panel target規則為準；沒有selection時有empty state，不偷換成前一個graph的物件；pinned Inspector不因普通全域選取而改target。這是已定新架構責任邊界，不是宣稱Legacy已有多EditorContext實證。

LIVE CL-07驗了Array→Shift+Voronoi加入→Shift+Array移除→空白清選取；Ctrl／Cmd、primary、pinned與跨Context仍OPEN。

## 9. 框選（C09）

空白右拖／Shift拖／Box Select mode左拖。框以screen座標畫出，矩形與node card bounds**相交或碰邊**即選入。左→右與右→左相同，不使用CAD式containment分流。一般取代舊集合；起手時Ctrl／Cmd保留旧selection作加選基礎；Shift本身只開框選、不表示加選。過程即更新selected外觀。

放開且move距離>3px時，確立選取、清selected edge、primary取結果集合最後一員、刷新工具列；框消失；Box Select mode不是單次工具，用後仍維持直到切關。**普通mouse pointercancel只隱藏框、拆handler，沒有明確restore舊selection／完整refresh。** 觸控marquee的cancel另有restore。不能替Legacy宣稱兩者完全一致；跨輸入方式最終統一取消語義需UX review，不能讓實作者憑圖稿猜。

LIVE CL-04驗了兩個方向各一個partial-intersection，不代表碰邊、Ctrl加選、capture loss等全矩陣PASS。不得以圖冊畫的假節點數量取代真實選取集合驗收。

## 10. 節點拖曳與Group（C10–C11）

標題為明確可拖入口；可配置body drag僅限非控件表面，不能搶數值欄／socket／button。Mouse位移達3 CSS px（≥3）後開始layout preview；確立移動集合後保存各節點位置。以起手node為基準對24 graph-unit網格snap，其他成員保持相對位移；不能把每個成員各自snap導致排列變形。普通node drag僅左鍵、無Ctrl／Cmd／Shift時啟動，modifier保留給click toggle。位移除起手graph zoom×UI scale；把起手node的原位置加位移後round至24-unit格，再把共同位移套到所有成員；沒有Alt暫停吸附。不改node值或Edge identity。純preview只動可見位置／線路，放開時才一筆layout transaction。有變化才入history；Undo回起始，Redo回提交位置。

取消與ownership失效必須清preview與listener；普通node drag於Esc、pointercancel、lostcapture、blur、resize或重建卡片時還原位置preview；Group另有wheel、hidden、其他pointer與zoom改變保護。普通node不保證wheel途中取消；取消位置也不等於還原起手前selection／primary，詳SEL。source未提供node drag的邊緣自動pan，不能把它寫成既有能力；也不新增產品功能。LIVE CL-06驗了48×24移動、一次Undo、Redo、再Undo回原位。

Group標題拖動成員；空白框身仍是背景操作區。幾何在框內不等於member；外框由member bounds決定。細節見[Group evidence](../research/groups-evidence-004.md)。節點排列、等距與spacing handles見[Arrange evidence](../research/arrange-evidence-004.md)，不得把frame selection、自動排列及workspace panel layout混為一談。

## 11. 鍵盤導航、Stage／子圖與連線入口（C12–C14）

普通方向鍵僅單選node時導航，預設按位置找鄰近node；多選或空選取不導航。selected edge時左右鍵到來源／目的並Frame。Ctrl/Cmd+Left／Right選全部上游／下游並含起點；Up選所有起點的完整雙向連通分量；Down選scope中這些分量以外的所有node，包括其他彼此相連的群組。connected-selection不接受空選取／wire-only，key repeat不再次擴張；只更新集合，不移動相機。算法的tie-break、穿過Router、primary anchor與Frame／Center策略詳SEL及[Link專章](../research/link-evidence-004.md)；Link箭頭只看直接Link peers，不把普通Wire或遞迴上下游混進同一列表。

Tab開Create node，query/source/port type影響候選；Stage切換與Alt+Up返回parent應更新當前scope、selection及視角。舊scope的menu、pointer、creator結果不可回填新scope；跨scope的camera保存不能由面板長得像Tab就推定。現況loading／stage／subgraph路徑常fit，並不保證回上一頁還原原相機。雙擊Subgraph call非控制區進入；可編輯名稱優先rename。Stage切換回該Stage root，清trail、node／edge selection與connection，render後fit。Alt+Up／Up回parent，breadcrumb可回指定祖先；root Up停用，當前crumb不可重點。進入／返回子圖清selection、connection與Creator並fit，不恢復上一層原相機。具體route及保存限制見SEL／NAV。

接線可從output或input起手；click output→提示選input，Esc可取消。一般線落合格空白開相容Creator；但預設trash關閉時，已有連線input落空白會斷開該input；灰色新增接口落空白不建立接口、不開Creator。普通socket的modifier-click仍是socket操作，Router才有modifier選取特例。drag-to-connect、占用input替換、落空白Creator、right-click port篩選入口，須區分於背景框選／pan。既有LIVE-002支援click成功接線，不等於完整drag/rejection/blank-drop已驗。此輪只閉合畫布與連線的優先邊界，型別／cycle／dynamic-interface matrix仍沿用既有coverage OPEN項。

## 12. Touch／pen（C15）

單指background：8 CSS px slop前是pending；達到8px後平移或Box Select。Node拖動由獨立touch editing處理，readonly不可偷變成node edit。長按550ms、double-tap320ms且距離<24px是目前參考值。兩指進入pinch+translation前取消未提交編輯preview；以兩指中心及距離rebase。放開一指剩一指時接續pan，不跳到舊基準；經過pinch不再誤觸tap／creator。第三指沒有另外定義的新gesture。

取消touch edit不代表回到起始相機；相機動畫的freeze／finish與Dolly不同。捕获／lostcapture／blur／context失效、合成mouse click抑制是必要核對項。這裡是source-backed説明，**没有真iPad／觸控板／pen／CEF驗證**；pen不假定等同touch。不要把窄viewport或SVG互動當成裝置證據。

## 13. 網格、倍率與動態可讀性（C16–C17）

24 graph units是snap格；顯示點距另算：從24開始倍增，直到 `displayGrid × graphZoom ≥ 14` local CSS px。25%顯示96-unit格，50%顯示48，100%顯示24；只是隱去過密點，**不把snap改成96或48**。點半徑 `clamp(1.05×zoom^0.65,0.45,1.65)`，背景offset=`pan - step/2`。UI scale、graph zoom、device DPI必須各自理解。

Overview預設off；開啟後20%可用，嚴格小於30%才簡化node外觀，保留layout dimensions／socket及線、提高標籤可讀性；30%回正常。關閉且低於25%時以中心立即恢復25%，捨棄較低pending target；不加Graph History。Router／annotation等特例見NAV，不要求重構core依node名字special-case。

選取工具列相對node bounds保留既有12px可見間隙；頂部空間不足可翻到下方；縮放後仍須清楚對應目標與可點擊。Link線細淡且non-scaling、普通Wire維持型別表達；畫布倍率不能讓命中區縮到難用。已有[網格與線條量測](../atlas/evidence.json)，這是離散樣本與手感參考，不是完整density曲線視覺PASS。

## 14. 保存、只讀與快捷鍵guard（C18–C20）

Legacy camera/focus為當前頁面記憶體；沒有導航路徑把pan/zoom/focus寫入Graph文件。一般阻尼與Frame有獨立開關／duration，10–1000ms；目前Reset為on/150與on/333。明確選為動畫的方向鍵Frame／Center即使一般阻尼關閉仍可動畫，不能承諾「全部開關off就沒有任何動畫」。阻尼／Overview等是瀏覽器偏好，與document分開；儲存失敗時目前只留下頁面效果，沒有durability保證。Stage/reload過程fit，不能寫「每張圖都會記得上次視角」。新產品按既定EditorContext／Layout／Persistence契約決定view保存範圍，本稿不加新的保存owner。

只讀仍能選取、平移、縮放、Frame及查看；禁graph mutation，不能因為一個button被disable就禁止整個Canvas觀看。節點移動、排列、delete、接線等不得繞過既有mutation boundary。

H/F/L/P/X/方向鍵/Group/Focus等較新command檢查IME、text/contenteditable、目前scope、open dialogs/popovers、gesture及inline editors；輸入欄／Viewer／Panel的焦點不能被Canvas搶走。**舊Tab/Delete/Alt+Up/Ctrl+A/D/Z支線沒有完全同一套guard**，不可寫成所有快捷鍵都已一致；缺口需在重構依既有public command authority檢查，不能直接複製舊listener。

Graph Ctrl+Z回放canonical文件編輯，包含已提交的節點版面交易；不回放相機、選取或Host runtime／TD history。純相機與選取不塞進Graph History。未提交文字先走自身editing semantics。這是DEC-GRAPE-001已定邊界，本稿沒有恢復mixed-history coordinator。

## 15. 取消矩陣與不可掩蓋的現況

| 操作 | 正常結束 | Esc／失焦／中斷 |
|---|---|---|
| Wheel／一般相機動畫 | 到最後target | Esc或新Canvas內容pointer凍結displayed（排除上述controls）；blur/resize/hidden到target |
| Mouse pan | 停止跟隨pointer，相機不回原點 | pointercancel清handler；没有起點rollback；Esc不解除pan owner |
| Dolly | release完成target且清理 | 同scope下還原起點；舊scope失效不寫回 |
| Mouse marquee | 確認集合、刷新primary／toolbar | cancel沒有完整selection rollback保證 |
| Node layout drag | 有變化才一筆layout edit | 上述node取消入口還原位置preview；不保證wheel取消或還原起手前selection |
| Group layout drag | 有變化才一筆layout edit | 另含wheel/hidden/其他pointer/zoom保護；不移植舊scope座標 |
| Touch pinch／pan | 最後view，允許動畫尾端 | 取消edit preview，非回滾camera origin |
| Focus graph | 再切換離開 | Esc保持focus，只可能處理其他當前操作 |

**已解清的舊描述錯誤**：Esc不退出focus；兩方向框選同為intersection；MMB是Dolly；Home即時而Frame独立動畫；display grid密度不等於snap粒度。

**仍須保留的OPEN**：舊阻尼測試default-off與現source default-on衝突；mouse pan返回門檻內會走click；mouse marquee cancel與touch不同；部分舊快捷鍵guard弱；空圖fit對pending animation的處理；raw wheel deltaMode跨裝置。這些在[驗收索引](CANVAS_ACCEPTANCE.json)有具名項目，未靜默修產品或改新架構。

## 16. 驗收方法與本輪結果

每項用「初始view／selection／model → 入口＋gesture → 中間回饋 → 結束／取消 → model/view/history差異」驗收。放大測試要等可見view穩定，不以固定兩個RAF假定動畫已完。不要為了自動化讀private model；優先可見geometry/labels及公開commands，必要時由重構既有test seam取得可比較snapshot。

本輪7組LIVE記錄支持桌面正常路徑：pan、F/Home、Focus、雙向partial marquee、anchored wheel、drag/Undo/Redo、Shift toggle/clear。沒有宣稱全平台／完整scope已驗，也沒有重跑Legacy整套測試。圖冊static checks與既有local demo regression只驗交接材料；不拿其通過取代產品gesture驗證。

若後續要把本稿用作rewrite acceptance，先按CANVAS_ACCEPTANCE逐項取得該實作的證據，再由人類review OPEN的Legacy caveat。已知範圍內的操作規則已集中，不需要實作者回到聊天或猜一般編輯器慣例。
