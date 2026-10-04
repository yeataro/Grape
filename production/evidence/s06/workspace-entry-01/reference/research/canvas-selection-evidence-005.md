# Canvas selection / gesture evidence 005

查證日期：2026-10-03。用途：供 UX/UI design handoff 主文件整合的唯讀行為證據；不是新 Grape 的已核准設計，也不是本輪測試報告。

## 範圍與可信度

- 唯讀來源根目錄：`C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape`。讀取時 HEAD 為 `e005f08badff8caef6331de5312809e4cab09cc2`。下列主要程式／文件／測試的限定路徑 `git status --short` 沒有列出改動；Git 同時警告無權讀取使用者全域 ignore，因此不宣稱整個 repository 為乾淨狀態。
- 查過來源及本輸出路徑的祖先 `AGENTS.md`，沒有適用檔案。來源中唯一搜尋到的 AGENTS 位於 `docs/discussions/next-project-draft/antigravity/for-agent`，不在本次查證檔案的祖先範圍。
- 本輪只讀程式、文件、測試原始碼；沒有啟動 Legacy UI、沒有執行產品或瀏覽器測試、沒有寫入 Legacy 或新 Grape repository。唯一新增檔案為本證據檔。
- 「程式可確認」指可由目前控制流程直接讀出；「測試意圖」指現有測試中的 assertion，**不代表本輪已執行或通過**。既有文件聲稱的歷史驗證不轉寫成本輪結果。
- 以下完整行為說明可獨立閱讀。精確行號指上述 Legacy working tree；為省略重複路徑，表格採下列來源代號。

## 來源索引

| 代號 | 完整來源 |
| --- | --- |
| G | [graph_ui.js](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/graph_ui.js) |
| A | [app.js](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/app.js) |
| F | [frames_ui.js](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/frames_ui.js) |
| N | [functions_ui.js](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/functions_ui.js) |
| I | [inspector.js](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/inspector.js) |
| S | [selection_ui.js](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/selection_ui.js) |
| K | [shortcuts_ui.js](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/src/editor/shortcuts_ui.js) |
| DNav | [UI_NAVIGATION.md](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/docs/ui/UI_NAVIGATION.md) |
| DTouch | [TOUCH_EDITING.md](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/docs/ui/TOUCH_EDITING.md) |
| DSub | [SUBGRAPH_SHORTCUTS.md](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/docs/features/SUBGRAPH_SHORTCUTS.md) |

## 1. 選取：集合、主要節點、節點／連線模式

| 使用者操作／狀態 | 目前程式可確認的行為 | 證據 |
| --- | --- | --- |
| 在一般節點的可選取表面按一下 | 以該節點取代原選取集合，並將它設為主要節點。按鈕、input、textarea、select、連結、contenteditable、role=button、inline values 不走這條卡片選取處理。 | G:1435–1442、1947 |
| Ctrl、Cmd 或 Shift 按一下節點 | 三者都使用 toggle：未選取者加入；已選取者移除。加入者成為主要節點；移除者之後，主要節點為選取 Set 中最後一個存留項，沒有項目則為 null。這不是固定空間排序。 | G:1406、1440 |
| 多選中，按下已選節點並開始拖曳 | pointerdown 先保留整個多選集合，只把被拖節點設為主要節點；跨過拖曳門檻後抑制接續 click，因此整組移動。若只是按一下、沒有開始拖曳，接續 click 仍將選取縮為單一節點。 | G:96–105、111、116–119、1898–1900、1947 |
| 「主要節點」的可見意義 | Inspector/Parameters 依 `selected` 找單一節點並顯示該節點標題／參數，即使 `selection` 含多個節點。一般 selected 外框只依集合成員判斷；此處未見另一種 primary 外框的設定。 | I:1585–1598；G:1447；G:1865 |
| 選取節點 | 清除 selectedEdge；重設箭頭路徑記憶、Inputs 面板來源選取，移開 Viewer Inspector，將焦點放到 canvas，清除瀏覽器殘留的文字選取。 | G:1293–1299、1435–1442 |
| 按一下 Wire 或 Link | 使用連線選取模式；一般 click 取代既有 edge 集合，Ctrl/Cmd/Shift click 切換該連線。節點集合與主要節點清空。連線與節點不是混合選取。 | A:630–631；G:1406、1410–1427 |
| 多線右鍵選單 | 右鍵命中已選連線保留整個 edge 集合；命中未選連線則改選該線。 | G:2861 |
| Undo、Stage／graph replacement 後的 edge 身分 | edge 選取存的是當前 graph/data 的物件引用；換 owner/data 會清除，不把舊 index 自動指向另一條線。 | G:1407–1421 |
| Group 標題／角落選取 | Group 是成員節點集合操作。一般 click 選其全部成員；modifier click 若成員全已選就全部移除，否則補齊所有成員並保留 Group 外的選取。主要節點若仍在集合內就保留，否則改為最後成員。角落 handle 的開關預設開啟。 | F:182–188、263–267；G:2 |
| Group 選取外觀 | 每個 Group 的所有成員都在節點選取集合時，該 Group 才標記 selected；並非獨立 frame object selection。 | G:1450–1451；F:235–240 |
| 唯讀 | 選取、Group/連線多選、非編輯導覽仍可用；mutation 路徑另外攔截。 | G:100–102、1332–1354、1435–1442；F:204；A:268、324–325 |

**主節點不是全域統一「最後點擊」規則。** 點擊 toggle 後採 Set 最後一項；Group 選取優先保留現有主節點；框選 release 採結果 Set 最後一項；connected-selection 若現有主節點仍被選中則保留，否則採圖中第一個存留成員。不得把這些不同入口簡化成同一套已實作契約。（G:1440、2417、1352–1353；F:187。）

## 2. 空白點擊、平移、框選方向及 modifier

| 操作 | 目前行為與邊界 | 證據 |
| --- | --- | --- |
| 左鍵按一下空白，沒有接線起點 | 清除節點選取、主要節點和連線選取；本來已空選取時直接返回。更新外框、Inspector、導航／選取工具，不重建 node/port/library DOM。 | G:1444–1457、2416–2418 |
| 左鍵按一下空白，已有 click-click 接線起點 | 優先完成「線到空白」流程，不執行清除選取。已連接 input 且 trash 實驗關閉時斷開該 input；其他合格空白投放開相容 Creator；灰色新增接口不建項目。 | G:7–20、2418 |
| 左鍵在空白拖曳，未開 Box Select，也未按 Shift | 平移 view，保留選取。Ctrl/Cmd 單獨加左拖仍是平移；Ctrl/Cmd 本身不是啟動框選的條件。 | G:2409、2414；測試意圖 TCanvas:46–49 |
| 框選啟動 | Box Select 模式 + 左鍵、Shift + 拖曳，或右鍵拖曳。只有 button 0/2 接受此流程；中鍵由 Dolly 分支處理。 | G:2400–2410、2491 |
| 左→右 vs 右→左 | **完全相同的矩形交集規則**：以起終點 min/max 建矩形，node card 的 `getBoundingClientRect()` 只要與矩形接觸／交疊就加入。邊界比较為 >= / <=，因此碰到邊也算。沒有左→右完整包含、右→左交集的區分。上下方向亦相同。 | G:2412–2413；觸控 G:2601–2604 |
| Shift 框選 | Shift 啟動框選，但不保留先前選取，會被框選結果取代。Shift 在「點選」是 toggle、在「框選」不是 additive。 | G:1406、1440 對照 G:2409、2413 |
| Ctrl/Cmd + 框選 | pointerdown 先拷貝舊 selection；每次框選更新以舊集合加上目前矩形交集的節點。可組成 Ctrl/Cmd+Shift 左拖、Ctrl/Cmd+右拖，或 Box Select 模式下 Ctrl/Cmd+左拖。不是 XOR，也沒有 subtract 模式。 | G:2409、2413 |
| 框選選哪些東西 | 只遍歷 `.node`，不選線，也不直接選 frame。Group 可因成員全被選取而顯示完整 Group 外框。包含哪些卡片由其 DOM 外接矩形決定，不是只測節點中心。 | G:2413、1450–1451 |
| 移動門檻與 release | 滑鼠 blank gesture 用起點距離 **大於 3 client pixels** 判斷 moved。框選 preview 在 pointermove 即更新；release 若 moved，主要節點改為結果 Set 最後一項、清除 edge mode、刷新控件。這個 moved 值每次事件重算，並非跨過一次後永遠鎖住。 | G:2411–2417 |
| Shift/Box Select 模式下只左點、沒拖 | 仍落入空白 click 流程，清除選取或處理既有接線起點。 | G:2417–2418 |
| 右拖 release vs 右點 | 已 moved 的右鍵框選設定一次 contextmenu suppression，避免立即開選單；一般右點仍開 context menu。 | G:2391–2398、2417 |
| 空白雙擊 | 不在 node、path、link-direction 上時開 Creator。普通左鍵點擊與雙擊不是同一命令。 | G:2390 |

**取消差異（不能抹平）**：滑鼠 blank/marquee `onpointercancel` 只清掉 move/up handler、隱藏矩形，未還原預先選取、未同步主要節點，也未在這條流程實作 Escape rollback 或 lostpointercapture callback。既有 Escape handler 只取消連線並關 Creator。故不能宣稱「滑鼠框選 Escape／失焦會還原原選取」。觸控 box 的 `clearPreview` 則明確還原原 selection、selected、selectedEdge。這是目前控制流程差異，未經本輪操作驗證。（G:2420、2480–2482 對照 G:2552–2557、2565–2566、2674、2682–2684。）

## 3. 節點拖曳：啟動、預覽、吸附、完成、取消、Undo

| 項目 | 目前程式可確認的規則 | 證據 |
| --- | --- | --- |
| 入口／按鍵 | 只有左鍵開始 node drag；Ctrl/Cmd/Shift 有任一按住時不開拖曳，保留 click toggle 意義。 | G:96–99、1406 |
| 可拖範圍 | 普通節點 `nodeBodyDrag=true` 預設整個非控制項表面可拖；關閉後標題列可拖。overview 模式下普通節點仍可整卡拖。annotation 只允許標題；Router 有自己的 handle/socket 區分。 | G:2、91–94、1844–1860、1899–1900 |
| 控制項優先 | button、input、textarea、select、a、summary、contenteditable=true、role=button、`.node-alias`、`.node-inline-values` 不當作 node drag surface。可改自訂名稱的文字 pointerdown 停止傳遞、雙擊進 rename。 | G:91–94、1886 |
| Mouse/pen 啟動門檻 | 距起點不足 3 client pixels 不開始；到 **3 px 或以上** 才標記 moved。門檻不依 graph zoom 或 UI zoom 放大。 | G:103–118 |
| 哪些節點移動 | 被按到的節點若未在選取集合，就先改為只選它；若已選則保留集合。拖曳快照涵蓋 current graph 中所有選取節點。 | G:100–105 |
| 位移換算 | client 位移除以 pointerdown 時的 `scale * uiScaleFactor()`，轉為 graph 世界座標。 | G:103、118 |
| 吸附 | GRID = 24；`snap` 是四捨五入至 24 的倍數。先把被拖節點的原始 x/y 加位移後各自 snap，再把同一個 dx/dy 加給所有選取節點。因此被拖節點是吸附錨點，其餘節點保留相對偏移，未必全都落到格點。沒有讀取 Alt 或另一種暫時關閉吸附 modifier。 | A:42、46；G:105、118–119 |
| 預覽 | 只改卡片 style.left/top，重畫隨動線與可用 drop feedback；node.ui 不在 pointermove 中改寫。 | G:104–120 |
| 邊緣自動平移（autopan） | 本次檢查的 mouse node-drag 全流程和 touch node 分支皆無邊缘偵測、pan 更新或 autopan timer。它們只算節點 style/線；勿在 Legacy 契約中聲稱有邊緣 autopan。這是來源碼範圍內的否定證據，不是已執行的 UI 測試。 | G:96–135；G:2583–2605；搜尋 app.js / graph_ui.js / UI docs 的 auto.?pan、edge.?pan 未找到 node autopan 實作 |
| 放開 | 先處理最後一次 move、還原 DOM preview並結束 capture，再確認 graph owner/current level 仍同一個且 mutation 未被阻擋。只有實際 x/y 改變才執行一次 `change(...,{localize:false,layout:true})`；只跨過門檻但 snap 結果未改變不加歷史。 | G:124–134 |
| 編輯／Undo | 成功放開是一個 layout change。`change` 比對前後圖，有差別才記一筆 history 並 mark dirty；這不是每一個 pointermove 一筆。Undo/Redo 用一般圖歷史回放。layout 參數及 localize:false 避免純位置移動把來源 Subgraph 語意本地化。 | A:287–289、315–338；G:131；DSub:18–20 |
| 明確取消途徑 | Escape、pointercancel、lostpointercapture、window blur、resize 還原所有位置 preview、清除手勢及 drop 樣式，不調 change。renderCards 也會 cancel 現有手勢。取消後選取／主節點不回到 pointerdown 之前，因 restore 只還原位置。 | G:106–114、133–134、1794 |
| 唯讀／忙碌 | 唯讀可選中節點，但在拖曳狀態建立前 return。release 再用 editorMutationBlocked 檢查 readonly、preview ending、historyBusy、nativeMutationBusy；不得保證忙碌時 preview 永不出現。 | G:100–103、128；A:268 |
| 可選 drop 目的地 | `canvasTrash` 預設 false，開啟時 drop trash 優先提交刪除；拖單個 Subgraph call 到 Personal Library 會走保存流程而不是提交位置。不要把這些實驗／特定區域 drop 說成一般拖曳一律改座標。 | G:2、117、121、126–131 |

**Group 標題拖曳另有差異**：普通按下先選 Group 成員，拖曳只移該 Group 的成員，以第一個成員作 24-unit snap 錨點；3px 門檻、DOM-only preview、release 單次 layout commit。它比普通 node drag 多了 wheel、visibility hidden、其他 pointerdown 的取消處理，並在 move 時檢查 owner/level/zoom。不可把 Group 的取消保障推定到普通 node drag。（F:201–233。）

**普通 node drag 的 wheel／zoom 限制**：目前 `dragNodeTitle` 以開始時 zoom 算位移，沒有自行取消 wheel、visibilitychange 或每次 move 檢查 zoom；全局 canvas wheel 可以改視圖（A:1570）。因此「拖曳途中 zoom 一律取消／保證維持 pointer-relative anchor」不是已確認規則，需另做新設計決定或操作驗證。

## 4. Touch 補充（與 mouse 分開描述）

目前已有完整 touch graph controller，不能沿用早期只支援 pan/tap 的描述。

- 單指 movement 門檻 8 CSS/client px；hold 550ms；double tap 320ms 且位置差小於 24px。node title/body 使用共用 drag surface 判斷；拖已選節點可移整個選取群，24-unit anchor snap／release 單筆 layout commit 與桌面一致。（G:2535–2541、2593–2595、2607–2618、2664–2667。）
- 二指優先接管：取消尚未提交的節點／線／框選 preview，轉 anchored pan/pinch；剩下一指繼續 pan，不能在最後放開補提交原拖曳。（G:2552–2557、2578–2581、2651–2652、2660。）
- Box Select 開啟時，空白單指拖框；交集規則與方向無關，但 touch box 每次使用空 Set，沒有 desktop Ctrl/Cmd additive 計算。touch box 取消還原原選取。（G:2555、2601–2604、2617。）
- touch 初始命中可見 wire 時，wire 優先於附近 22px socket proximity；socket 保留給接線，不設 long-press context-menu timer。其他 node/blank/wire hold 開 touch menu。（G:2568、2570–2576、2644–2649。）
- Touch 節點／線 preview 可由 pointercancel、lost capture、Escape、blur、resize、visibility hidden、第二指或外部 pointer 取消；一般 controls／可編輯區不交給 canvas touch controller。（G:2541、2674–2684。）
- DTouch:37–40 清楚列同樣門檻；DTouch:7、67–68 明確保留 physical iPad/Safari 驗證限制。本輪沒有實機驗證，不能由 Chromium 測試碼推論 Safari 現況。

## 5. 快捷鍵與焦點：不能宣稱所有 graph shortcuts 共用完全相同的 guard

共同早期退出：若 event.defaultPrevented，或目標在 details、graph edit menu、library、Creator、Shader selector、dialog，或目標 tag 為 INPUT/SELECT/TEXTAREA，主 graph keydown handler 返回。floating workspace panel 只允許 P 繼續檢查。（G:2432–2436。）

較新的命令再檢查 `graphCommandReady`：焦點在 body、documentElement 或 `.graph-workspace`；不是 IME composition/contenteditable；沒有 canvas pointer move、Value Ladder／pending ladder／numeric preset、Creator、armed click-click connection、wire/node/resize/touch gesture，也沒有相應 open dialog/popover。`graphNavigationReady` 還排除 nodePlacement、button/link/slider/listbox/menu/tablist 上的焦點。（G:2437–2440。）

| 快捷鍵 | 可確認行為／適用 guard | 證據 |
| --- | --- | --- |
| Ctrl/Cmd+Enter | graphCommandReady、無 placement 才切換 graph focus；不接受 Ctrl+Meta 同時、Alt、Shift；repeat 不反覆切換。 | G:2440–2443 |
| 方向鍵 | 無 modifier、graphNavigationReady；單一節點才導航。預設 spatial：比較節點中心，先選前方 90° sector，後比較距離；無 sector 候選才取同側斜角；tie 為 Y/X/ID；不 wrap。 | G:1313–1329、1356–1362、2449–2451；預設 G:2 |
| 選中線後 Left/Right | 可選來源／目的端節點，並 frame 結果；此分支在單一節點判斷前。不是把 wire 當節點做 spatial search。 | G:1356–1358、1429–1433 |
| Ctrl/Cmd+Left/Right | graphNavigationReady；從一或多個已選節點取全部上游／下游，含起始點；僅限 current graph/Stage/Subgraph。沒有選取或只有線時不作用。 | G:1332–1354、2445–2447 |
| Ctrl/Cmd+Up/Down | Up 取所有起點的整個連通 component（雙向）；Down 取 current graph 裡 component 之外的所有節點，可能變空。Group membership 不算連線。repeat 被抑制。 | G:1337–1353、2445–2447 |
| one-step connected-selection 實驗 | `ctrlArrowAdjacent=false` 預設。開啟後僅 Left/Right 改為保留集合並每按一次加一層鄰接節點；Up/Down 仍整個 component；不移視圖，不加 Undo。 | G:2、1342–1354；DNav:81–94 |
| P / X | 無 modifier，graphCommandReady、無 placement；P 切 Floating Parameter，X 切 Link line visibility；ignore repeat。 | G:2453–2459 |
| H / F / L / Shift+L | graphCommandReady。H frame 全圖；F frame 選取（無節點選取則 frame 全圖）；L／Shift+L auto arrange／reverse，需至少兩節點且允許修改、忽略 repeat。H/F 不作 graph mutation。 | G:2461–2467；S:91–92；A:855 |
| Ctrl/Cmd+G、Ctrl/Cmd+Shift+G、Alt+G、Alt+Shift+G | graphCommandReady 並允許 mutation，分别建立 Group frame、形成 Subgraph、從 Group detach、join Group；repeat 不作用。 | G:2469–2476 |
| ContextMenu / Shift+F10、Tab、Escape、Alt+Up、Delete/Backspace、Ctrl/Cmd+A/D/Z | **舊分支沒有再使用 graphCommandReady / graphNavigationReady**。ContextMenu 開選單；Tab 開 Creator；Escape 取消連線／關 Creator；Alt+Up 上一層；Delete/Backspace remove；A 全選當前層、D duplicate、Z Undo／Shift+Z Redo。只能確認它們共用前述早期 return 及下游函式自己的 mutation guard。 | G:2478–2488 |
| Ctrl/Cmd+C/V | 由 document copy/paste events 處理；editableText 目標的原生文字操作保留，Copy 遇到現有文字選取也返回。選取節點時清除舊文字選取，避免仍複製先前 Note 文字。 | G:1293–1299、2689–2691、2972–2980 |

`editableText` 特別包含 input/textarea/select/contenteditable=true、dialog、library、details、Creator、Note preview、floating workspace panel（G:2689）。其保護範圍與 graph keydown 的早期 return 並不相同。

**交接待決限制**：不要把「所有快捷鍵在 IME／contenteditable／active gesture 都被擋」寫成現況。較新命令確實有此 guard，舊分支沒有相同條件。Ctrl+A 的舊分支只覆寫節點 selection/selected 並 render，未顯式清 selectedEdge；由選線狀態按 Ctrl+A 的最終可見模式應列待驗證，不能拿它作一般 node/edge 互斥規則的已驗證例外或已修正缺陷。（G:2486–2487。）

## 6. Stage 與 Subgraph 層級

- `current()` 是目前 Subgraph 的 graph；沒有進 Subgraph 時為選中 stage 的 graph。選取、框選、connected traversal、drag snapshots 皆針對這個 current level。（A:514；N:21；G:104、1334、2413。）
- 點 Stage tab：檢查該 Stage 存在，切 Stage、清 graphTrail、節點／線選取，取消 connection，重新 render 並 fit。沒有保留每 Stage 的 selection 或 view 還原邏輯出現在此 handler。（A:1564；A:643–648。）
- 普通 Subgraph call 卡片可雙擊進入；control 排除表與 click 相同。若名稱可編輯且命中名稱本身，名稱的雙擊 rename handler 會先停止傳遞，因此「雙擊任何 Subgraph 文字都進入」不精確。（G:1886、1953。）
- 進入 Subgraph：找到 function，若它已在 trail 中則顯示 cycle 訊息並拒絕；正常 push trail、清 node/edge selection、取消 connection、關 Creator、render、fit。（N:44–47。）
- 上一層／breadcrumb：上箭頭按鈕和 Alt+Up 回上一層；breadcrumb 可直接回某祖先層，當前 crumb disabled 並帶 aria-current=location。root 時 Up disabled。導航同樣清選取、取消 connection、關 Creator、render、fit。（N:41–58；G:2484、2490。）
- 以上導航函式不调用 `change`，屬 view/navigation 狀態；不要把導航本身描述成 Undo entry。renderCards 會取消 node/touch/resize/wire preview（G:1794）。來源 Subgraph 的語意 edit 另有 localize 行為，不是進入時就複製（N:36–38）。
- 箭頭 navigation 的 temporary route 有 graph、stage、trail、current level 及單選身分檢查；切層或選取改變時不能延續舊路徑。預設 spatial 模式本身不依賴連線歷史。（G:1300–1307、1313–1314；N:50。）

## 7. Connection／控制項的手勢優先順序

1. **普通 socket 優先接線**：port 是 button，被 node drag surface 排除；其 pointerdown 呼叫 dragWire 並停止傳遞。普通 socket click 也停止冒泡，不選取 node。注意普通 port 沒有「Ctrl/Shift 選節點」分支；Router socket 則有 modifier 優先 toggle 選取的特例。（G:91–94、1501–1503、1913–1914 對照 G:1854–1855。）
2. **Desktop wire drag 門檻 4px**：低於 4px 不進 wire preview，讓 click-click 接線保留；達到門檻後取消舊 linkStart，對相容候選作 proximity 搜尋。命中 actual invalid/disabled port 不改挑附近的相容 port。一般半徑 14 screen CSS px，跟 graph zoom 無關。（G:1485–1498、1504–1525。）
3. **候選和提交一致**：type/direction/cycle 檢查先濾候選；ready preview 指向候選 port 中心；release 再更新並用同一 target connect。connectPorts 以一次 `change` 提交；hover 只更新視覺不調 change。（G:1459–1478、1505、1520–1538。）
4. **空白 drop 分流**：沒有 target 時，不是任何位置都開 Creator。必須是 `#canvas` 中且不在 node、wire/link-direction、graph navigation、selection toolbar；已接 input + trash off 可直接斷線；spare add port 空白 drop 不新增接口。（G:7–20、1535–1537。）
5. **取消**：wire drag 的 Escape、blur、pointercancel、lost capture 會清 ready/preview；owner/current data 改變或 socket 移除也取消；renderCards 亦取消。沒有 graph edit 發生於取消。（G:1507–1518、1527–1540、1794。）
6. **開始 node drag**：會取消既有 wireGesture；但 mouse node-drag 開頭沒有直接清 click-click 的 `linkStart`。Touch node-drag 開始則调用 cancelConnection。不能把兩種裝置寫成完全同一個 armed-wire 清理流程。（G:99 對照 G:2613。）
7. **Group title 和 wire 重疊**：現有測試有用 elementFromPoint 驗證 Group title 命中優先於相交的 wire；這是測試意圖，不是本輪實測。（TMulti:45–46。）

## 8. 測試意圖清單：全數未在本輪執行

| 測試來源（完整檔案） | 精確行號／原始碼要驗證的使用者結果 |
| --- | --- |
| TCanvas — [test_canvas_selection.cjs](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/tests/browser/test_canvas_selection.cjs) | 34–45：空白 click 清空單／多／Group／wire 選取，不改圖／history、不重建 DOM、不發 API。46–49：pan 保留 selection。50–56：Shift marquee release 更新 Group 外框及工具而不重建圖。57–64：touch blank tap/double tap 以及 armed wire blank click。65–70：canvas click 也能讓原先 focused numeric edit 正常提交一筆 Undo。 |
| TMulti — [test_multiselection.cjs](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/tests/browser/test_multiselection.cjs) | 21–35：真實 Control/Shift 點節點、Group title/corner、Wire/Link toggle（此 loop 本身沒測 Meta）。36–42：多線 right-click、bulk style/disconnect 一次 Undo、節點／圖替換清 edge state。43–46：Shift 框選、Group title 蓋過線。47–54：失敗 edit 還原 edge 集、刪除 reindex、stage 清理、readonly 選取。 |
| TConnected — [test_graph_selection_shortcuts.cjs](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/tests/browser/test_graph_selection_shortcuts.cjs) | 21–42：上／下游、component、complement、多起點、cycle/dangling、readonly、Meta dispatch、primary preservation，graph/history/view/DOM 不變。43–55：one-step、每按一層、repeat suppression。56–68：empty/wire 不作用、text/contenteditable/修飾鍵/gesture/placement/dialog/popover guards。69–75：Stage 範圍及 2500-node 非遞迴遍歷。 |
| TNode — [test_node_interactions.cjs](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/tests/browser/test_node_interactions.cjs) | 19–35：body drag 單筆 Undo/Redo、wire endpoint 貼 socket、comment body drag、Escape 沒 history、Label 不被拖、port 優先 wire、touch cancellation／second finger／readonly。48–70：Subgraph spare port 空白取消、接口+首線原子 Undo、容量／readonly。78–87：header-only fixture mouse/touch。 |
| TTouch — [test_touch_editing.cjs](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/tests/browser/test_touch_editing.cjs) | 54–70：node preview 無 graph writes，release 單次 Undo/apply，各 cancellation、second finger takeover。72–93：22px proximity、reverse、tap-tap armed socket cancel、invalid drop、socket hold、blank drop。94–118：blank double tap、long press、Subgraph double tap、Box Select、群拖及 readonly。119 行報告模板明寫 physical iPad remains to verify。 |
| TWire — [test_navigation_browser.cjs](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/tests/browser/test_navigation_browser.cjs) | 57–81：ready target與release一致、reverse proximity、invalid/cycle、不在 canvas 不接、Escape/blur/pointercancel/captureloss/rerender、click-click、occupied input replace 一次 Undo、blank Creator、zoom/zoom-during-wire。不能把其中早期 touch 範圍當最新 controller 的完整涵蓋。 |
| TLayout — [test_layout_edits.cjs](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/tests/browser/test_layout_edits.cjs) | 41–49：layout fast path graph/history/draft 與舊路徑一致，Undo/Redo 還原文檔，錯分類語意／label edit 不誤走 layout，readonly inert。 |
| TArrows — [test_arrow_navigation.cjs](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/tests/browser/test_arrow_navigation.cjs) | 22–48：舊 connection/path 模式、路線失效、Stage/Undo、text/modal guards；59–82：branches 模式；91–99：預設 spatial 模式、90° sector、nearest/ties、single-selection、Help。不可只引用開頭旧模式作現行預設。 |
| TFocus — [test_fullscreen_shortcut.cjs](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/tests/browser/test_fullscreen_shortcut.cjs) | 50–64：Ctrl/Meta+Enter 切 graph focus，Escape 只取消 Creator、不離開 focus；repeat/IME/extra modifiers/gestures/modal／文字 Ctrl+Enter 保護。 |
| TClipboard — [test_clipboard_keyboard.cjs](C:/Users/user/Dropbox/Codex/TD-Grape-workspace/TD-Grape/tests/browser/test_clipboard_keyboard.cjs) | 56–122：Note 原生文字 Copy、點／拖已選節點後 graph Copy、貼上一次且 Undo、Group 成員 copy、input/Note clipboard ownership、鍵盤 Copy/Paste 不走 permission-gated navigator.clipboard。 |

這次只讀到既有 tests 的目標：沒有補測左右相反框選、additive 組合全部排列、mouse marquee cancel、Ctrl+A from selected wire、node wheel-during-drag、viewport edge autopan 或 physical Safari。主文件應把這些分成「已可由程式確定」與「仍需新設計／驗證」，不能補上沒有根據的通用畫布慣例。

## 9. 文件衝突／需保留的未確定性

1. **Touch 舊描述已過時。** DNav:118–120 宣稱未實作 one-finger node drag、touch wire drag 或 numeric scrub，但目前 G:2535–2684、DTouch:19–40 與 TTouch 已明確有前兩者；DTouch:43–62 也記錄 numeric touch。引用目前程式與較新 DTouch，不將舊 checkpoint 的 Touch scope 沿用。
2. **nodeBodyDrag 的歷史測試註解已過時。** TNode:77 說更改 internal flag 需 reload、不是 user preference；目前 DSub:18–20 與 G:1–3 已說 browser-local experimental setting 可即時切換。舊 fixture 的存在能證明 header-only 邏輯有測試意圖，不能證明目前 UI 沒有設定。
3. **左右框選方向沒有兩套語意。** Legacy runtime 只有交集；如新 Grape 決定採 CAD 類方向性框選，必須標為新設計，而不是 Legacy 相容性重建。
4. **取消契約不齊一。** mouse marquee、ordinary node drag、Group drag、touch controller 各有不同取消 coverage；請保留第 2／3／4 節差異，不合併成泛稱「所有手勢 Escape、blur、wheel、失去 capture 都自動完整還原」。
5. **焦點保護不齊一。** 新快捷鍵用強 guard；舊快捷鍵只用較早的 shared returns。這是已讀取的程式差異；實際特殊情境對使用者的結果未在本輪重現，不直接標成已確認 UX bug。
6. **主選取視覺**：一般 node 卡片的 selected CSS class 沒有區分 primary；Inspector 卻使用 primary。此處沒有完整審核所有 CSS 顏色／aria 狀態，因此只確定 selection rendering 的資料來源，不宣稱整個產品絕無其他 primary 視覺提示。
7. **Autopan**：讀取的 drag/controller 無實作；不能推定別的未查 subsystem 永遠不可能變更 view。本交接允許寫「Legacy node-drag 路徑未見 edge autopan；新系統需決定是否加入」，不宜寫實測「抵達任意邊緣都完全靜止」。
8. **版本／歷史通過記錄**：DNav:124–129、DSub:30–32 的既有測試／TD 驗證敘述只屬歷史文件。沒有本輪 run log、native TD readback 或實機結果可供宣稱。
