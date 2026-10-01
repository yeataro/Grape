# AC-002 inherited UI contract excerpt

This is supporting provenance, not another canonical specification. Active compiled rules are in 02_ARCHITECTURE_SPEC.md and04_EXTENSION_MODEL.md.

Source: AB-001 capture/ARCHITECTURE_EXPERIMENT.md, sections13.1–13.6 (lines710–810); inherited by AC-002 except narrower executed prototype limitations explicitly recorded in the handoff.
SHA-256: dc6d2e71ac8f7c8038011be2066c621d84b2fcfb3f8b7f339dc352a1fd2136c0

## 13. Editor 與 UI：多視圖時仍能確定正在操作誰

### 13.1 E：EditorContext

```ts
type GraphRef = { graphId: Id; loadId: Id };
interface EditorContext {
  readonly id: Id;
  readonly graph: GraphRef;
  readonly stageId: Id;
  readonly instancePath: readonly Id[];
  readonly selection: Selection;
  readonly bindingId: Id | null;
  readonly revision: number;
  readonly activeNetwork: Network;           // 由上述引用解析，非第二個指標
}
```

GraphRef 加 loadId，避免卸載再讀入同名／同 ID 的作品時，舊非同步回覆自動接到新 runtime 實例。Context 的 Graph 固定；Canvas 切換作品時改持另一個 Context，不在分散欄位上先改 graph 再清 selection。Context 導覽 Stage／子圖路徑的修改一次发布完整狀態。

Editor.contexts 持有 Context；每 Canvas 默認獨立一份，主選取必屬 selection.items。E：`set(items)` 未指定 primary 時取最後項；移除 primary 時取剩餘最後項；空集合為 null。物件移除後按 ID 清理所有受影響 context；Undo 復原模型不必偷偷復原各視圖的舊 selection。

`editor.activeContextId` 是唯一目前操作上下文；`activeStage/activeNetwork/selection` 都是唯讀投影。Manager 選擇供應者後調用 `editor.activate(contextId)`，不另存另一份全域 active 真相。腳本可直接帶 contextId 執行，不必依賴焦點。

Canvas 相機、縮放、選框暫態留在 Panel。Context 的 bindingId 只能引用同 Graph 的有效 Binding；沒有 Binding 顯示未指定，不能猜第一個宿主。這使 Parameter 的模型編輯與 Preview 的執行對象分開且可查。

### 13.2 E：確定性的跟隨規則

| 模式 | Target 的選擇 |
| --- | --- |
| follow + Tab.linkGroup=0 | editor 當前上下文；產品預設由最近明確操作的 Canvas 啟用 |
| follow + 非零 group | 同群組仍存活 Canvas 中最近明確啟用者 |
| followCanvas(tabId) | 固定跟隨該 Canvas 的 Context；適用其浮動面板 |
| pin | 固定完整 ObjectRef／BindingRef；不跟隨選取 |

Canvas 分頁被啟用、或在 Canvas 操作才更新 activation sequence。Parameter 接受鍵盤焦點不改它。隱藏 Canvas 不撤销供應者；關閉才撤销。非零 group 沒供應者就清空，不能悄悄回退另一組。關閉當前供應者時可選同範圍下一個最近啟用者。

產品預設由Canvas供應的activeContext在最後一個供應者關閉後設為null，即使該Context仍保留於Editor.contexts。保留資料與正在作為全域follow供應者是不同狀態；不能因物件仍在就讓group0永遠顯示已關閉畫布的內容。腳本若明確activate一個headless Context，則是另一個明確的操作來源，不由關Tab流程猜測建立。

Manager 的 activation 排序是 UI政策狀態，不是可獨立修改的面板名單；候選每次來自 Layout/Tab 公開集合。直呼 Tab.close 或修改 linkGroup 也發布通知，Manager 不能只在自己按鈕流程裡更新路由。

Pin 保存 `{graphRef, objectId, occurrence?, bindingRef?}`。固定 Source 的模型預設不必有 Binding；固定宿主值／Preview 必須有 Binding。對象不見顯示 missing，不改綁同名物件；Undo 恢復同 runtime 物件 ID 可以再次解析。

### 13.3 切換與晚到訊息

Canvas A→B 時：先完成／取消 A 的寫入手勢，再验证 B Context，切換 Panel 的 contextRef，更新 editor active，再由 Manager 解析所有跟隨目標。面板先清空舊呈現，重新訂閱新目標，無 selection 就顯示無選取。

每次面板 retarget 遞增 request token；非同步載入、宿主參數查詢、預覽畫面都帶 `{panelInstance, contextId/revision, binding epoch, token}` 的適用資訊。與當前目標不符就丟棄呈現結果。這不是只在 callback 關閉時「希望沒有晚到資料」。

Editor 改選取與路徑是 runtime 事件，不進 Graph History／產碼。Graph 修改後如果 Context 路徑被刪，回退到仍可解析的最近祖先 Network，清理失效 selection，並通知位置已改；不能保留一個幽靈 activeNetwork。

共用操作入口包括 `select(contextId, refs)`、`navigate(contextId, occurrence)`、`reveal(contextId, ref, occurrence?)`；reveal負責導覽及選取，Canvas另外決定是否frame/focus。點參數的連線來源名稱，可以沿Input.edge.from.node取得精確Node，再呼叫同一入口；不用在Parameter內重新寫一套畫布查找。多個使用路徑時使用已有occurrence，無唯一候選才回傳候選資料，不能任意跳到第一個實例。

### 13.4 Panel、Tab、Pane 與浮動內容

```ts
interface Panel {
  readonly id: Id;
  readonly typeId: string;                    // Canvas / Parameter / Preview…
  canClose(): CloseCheck;
  exportViewState(): JsonValue;
  restoreViewState(state: JsonValue, resolver: Resolver): RestoreReport;
  dispose(): void;
}
```

Panel 實例由 Tab 持有；Pane.tabs.active 指可見分頁。Tab 搬 Pane 保留 Panel，不重建 Graph／Context。tabbar 可由外部區域渲染；所有權不綁 DOM物理位置。Panel 模組／NodeView／Widget 的角色分開：自訂 NodeView 不是 Panel，也不能自造模型不存在的接孔。

**E：浮動面板仍使用 Pane→Tab→Panel。** Layout 增加 `floatingPanes`：矩形、最小尺寸、anchor CanvasTabId 或 viewport。Canvas 內只是它的呈現位置，所有權仍歸 Layout。anchor 只准指一般區域的 Canvas Tab，避免循環嵌套；關 anchor 後浮動 Pane 隱藏並保留可恢復設定，不因 DOM 被移除遺失 Panel。明確刪浮動 Pane 才走各 Tab 的關閉流程。

Layout 保存 split tree、比例、Tab順序/active/linkGroup、浮動矩形、Panel 類型及私有 viewState。Parameter 與 Preview 共用同一套大小限制與調整能力；是否共享尺寸偏好是 UI 設定，不把尺寸寫入 Shader模型。

預設 Layout 不啟用浮動面板；內建 Minimal 配置收合外層欄位／側面板，建立參數及預覽浮動 Pane。這保留已提出的產品能力，並讓它們只是配置。E：專注編輯採暫時 visibility override，預設存 Layout 時排除；結束時移除 override 回到當前 base layout，不拿舊整張快照覆蓋期間做的合法配置修改。

### 13.5 不能遺漏的 UI 共用契約

Widget 用 `read/write/editing-state` 契約，預設 theme、鍵盤、可及性與 i18n。模組可做私有 UI，但必須呈現真實 PortRef，使用共用座標與互動入口；控制項長度、換行與分隔區由排版處理，不能靠英文固定寬度。

E：Canvas 提供單一座標轉換服務 `screen ↔ viewport ↔ network`；UI scale 與 graph zoom 明確分開。NodeView 回報端點幾何（PortRef＋network座標），臨時線、接線命中、拖曳均使用同一矩陣與事件座標。Overview 只改呈現策略，不換接口身分或節點模型尺寸；收合／縮放後仍從相同服務取得端點。這是對手機／iPad縮放偏移能力的架構回應，**未執行真機驗證**。

遠端 MAT／TOP Viewer 都是 Host adapter 暴露的 preview target/controller；參數 metadata 包含 section/separator。Preview Panel 顯示／傳送標準化互動與尺寸資訊，具體 TD 參數層級、OPView 或 selector 細節留在 adapter，本實驗不假定它們的舊實作。pointer down 的座標／capture／按鍵與後续 delta 是一個完整 gesture，不能只把孤立 delta 當新起點。

### 13.6 初始化與生命週期

E：啟動順序為 core/runtime → 固定 NodeModules/Profiles → storage及host adapters → Editor → PanelTypes/Widgets → Layout 恢復 → Manager 訂閱與首次路由 → 掛載 UI。core 初始化不需要 UI；缺 Panel 模組用占位 Tab 保留 viewState。

| 操作 | 保留什麼 | 明確清理什麼 |
| --- | --- | --- |
| hide Tab | Panel、Context、Graph、Binding | 暫停不必要的渲染 |
| move Tab | 同一 Panel／Context／linkGroup | 原 Pane 的位置引用 |
| close Tab | Graph、History、Binding；Context 可保留 | Panel訂閱、路由供應者、呈現資源 |
| release Context | Graph 及 History | 該 Context；若仍有 Canvas 使用則拒絕 |
| unbind | Graph、宿主最後成功成果 | 權杖、live訂閱、本地對應 |
| unload Graph | 已保存文件／宿主獨立成果 | 必须先释放 contexts、pinned targets、bindings、jobs 等引用 |

底層 unload 遇到使用者或 dirty data 時回傳 blockers，不自動連鎖摧毀。Manager 的「關閉作品」流程可依明确保存／discard選擇依次處理，但這不改變直接操作的底層限制。即使最後 Canvas 已關，圖也能留在 graphs供離線生成或Binding繼續使用。Context 預設由明確 release 结束；产品流程可在關視圖後釋放其専用且未再被引用的Context，不把這當Graph終止。

**關閉前不能遺留開放Operation。** Operation記錄originContext及可選originPanel；Tab.close／Context.release／Graph.unload的preflight檢查相關未完成手勢，存在就回傳busy，不先dispose再失去收尾callback。Manager可先commit或cancel該Operation再重試；UI捕捉丟失也必須走cancel補償。這條同樣適用直接呼叫底層close，防止Numeric拖曳中關面板後Graph永遠鎖在busy。

**解除Binding同時維護引用不变量。** 本地Binding進入closing、禁止寫入，Editor在同一個runtime變更批次將指向它的Context.bindingId清為null並遞增Contextrevision；Manager重新路由Preview／宿主參數面板。Pin保留原引用但顯示missing，不自動改綁。普通Graph.defaults不因此改變。這些清理是Binding移除通知的必要訂閱流程，直接呼叫unbind也必須發生；失效回覆只可記log。

斷線只將Binding標為offline/stale並保留引用，與unbind不同。release Context同樣先清除active引用；`followCanvas`找不到已關閉Tab時顯示missing、不回退其他Canvas。這些生命週期前置檢查及引用清理在本文件是R的設計契約；現有Python UI模型只覆蓋較小的關Tab／路由子集，沒有宣稱全部流程已測。
