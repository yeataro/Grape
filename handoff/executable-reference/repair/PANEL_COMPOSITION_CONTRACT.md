# IH-002 Panel 公共組合契約（B01 repair）

**IH-005 current addition:** ordinary read/routing/lifecycle below remains in force. Editable Panel commands use [`17_PANEL_COMMAND_CONTRACT.md`](../../17_PANEL_COMMAND_CONTRACT.md): `PanelType.commandIds` requests + application grant → workspace-bound instance/target → `PanelMountContext.commands` guarded by the current mounted user event. `PanelServices` itself does not provide unguarded model commands. The older low-level `ContextDirectory.beginGesture(contextId,panelId,...)` shown below is the application authority's implementation seam, never a capability handed to Panel modules. On pointer-event route loss, unfinished command gestures cancel; Panel viewState and Widget drafts retain their existing lifecycle.

**THIS IS NOT THE PRODUCTION IMPLEMENTATION.** 本檔與 `public-panel-workspace.ts` 是新增的 executable architecture specification；沒有修改 IH-001 封存的 37 個 reference 檔案。普通 Panel 實作者以這份契約和 canonical example 為入口，不再使用獨立 `PanelTemplateHost`。

## 變更理由與保持的責任

IH-001 已定義 Panel/Tab/Pane、follow/pin、restore、close 的規則，但六種 `PanelKind` 的工作區原型與普通 Panel 模板沒有同一公共接合點。B01-CE 同時保留 TypeScript 拒絕普通 type 的編譯反例，以及該 bounded probe 無法為普通 Panel 提供 target 的查詢反例。這不是 Node/Graph ownership 的反例。

IH-002 補一條明確路徑：

`PanelType → PanelWorkspace.register → open/restore → restore resolver → initial target → receive updates → move/hide/retarget → close preflight → dispose`。

Graph/Node/值/History 仍由 Graph 持有；Context 持 selection/navigation；Workspace 持 Tab/Pane 與 routing policy；Panel 只持私有 viewState 與當前 immutable presentation。`ScopedTargetService` 持 pinned scope 的 Context lease；該 Context 引用同一 Graph，不複製模型。DOM renderer、TD、transport 均不進入本組合契約。

## 共同公共角色

| 角色 | Ownership／輸入輸出 | 禁止事項 |
|---|---|---|
| `ObservableEditorContext` | 封存 Context 的 additive subtype；保留原 selection/navigation/model，新增成功後事件與 dispose guard | 不新增第二份 selection、Graph 或 Undo；不可要求 caller 手動 refresh |
| `ContextDirectory` | 借用 Context 的 registry、activeContextId 與 gesture origin metadata；select/navigation 可經 facade，也可直接調 Context 公開方法 | 不擁有 Graph、不以 UI 焦點推測 active Canvas；不能藉關 Panel 釋放別人的 Context |
| `PanelWorkspace` | 唯一公開 panelTypes、Panel instance、Pane/Tab placement 與 routing 組合；`panes/panels/save` 回 detached immutable 資料 | 不依 `typeId` 字串分支；不以 union 列舉普通 Panel；不窺探模組私有 state |
| `PanelType` | `typeId/viewStateVersion/create`，可宣告 `providesContext`；同 registry 的 capability，不是另一種專用 Canvas host | 不把 typeId 当 runtime instance id；不將使用者內容寫到 module global |
| `Panel` | `restoreViewState/exportViewState/receive/setVisible/canClose/dispose` | `receive` 是唯讀投影回呼，不得從中重新改 Workspace、Context 或 Graph；操作來自其後的 UI event |
| `ScopedTargetService` | 預設公開 target resolver；節點解析走 M01 `inspectScopedObject` 與 scoped network 公開 API；pin scope lease由服務集中持有 | Panel 不自行遍歷 resource、重建 occurrence lookup 或用 node 名猜目標 |
| `RestoreResolver` | application 明確把 inert 保存引用映射到現在 Context/完整 target；不成功回 null | 舊 load/context ID 不是 authority，不能靠同名或第一個宿主復活引用 |

UI 的公開 Context 必須提供通知。原封存 `EditorContext` 沒有非模型事件；本次使用 subclass 的 private event state 加公開 method overrides，不 monkeypatch 封存實例、不改 Graph。`select` 經 override 的 `selectObjects` 通知，`navigateStage/enterNetwork/dispose` 亦直接通知；Graph 的 projection 完成後發 model 事件。因此不經 Manager 的直接公開操作也更新 Panel。這是明確的 Context 契約補足，不是要求每個 Panel 訂閱舊私有實作。

## 關鍵操作的契約

### register / open

- `register(type)`：unique nonempty `typeId`、positive integer `viewStateVersion`；重複或錯誤整次拒絕。Registry 持 frozen callback descriptor；不建立 Graph instance。沒有熱替換已註冊 type 的承諾。
- `open(saved,paneId)`：Pane 必須存在、instance id 唯一、資料 finite JSON、route/linkGroup/version 合法。結構錯誤在任何 factory callback 前拒絕，不新增 Tab。
- 次序固定為 factory → identity check → `restoreViewState(detachedState,RestoreResolver)` → visibility → attach Tab → resolve → `receive`。回傳實際掛在 Tab 的 Panel，可能是 placeholder。
- Factory 已返回後的錯誤必呼叫一次 dispose；尚未返回就 throw 的 factory 必須自己收尾其半成品。create/restore/receive 失敗保留原紀錄或最後成功 export 的 viewState 為 `MissingPanel`，並在 Workspace.issues 記 phase。不刪 Graph，也不把它說成模型錯誤。
- `receive` 得到 frozen `PanelUpdate={target,lease}`；UI 不能修改投影使模型跟著變。沒有 target 是 `missing`，不是沿用上一個 target 的值。

### follow / retarget / ongoing notifications

- `follow` group 0：查唯一 `ContextDirectory.activeContextId`。Provider Tab 的明確 activation 更新它；普通 Parameter Tab activation 只改 visible Tab，不改 Canvas 來源。明確 headless Context activation 是獨立公開操作。
- 非零 group：只選同組仍可用且曾明確 activated 的 provider 中最近者；無來源回 missing，不 fallback 到 group 0。
- `followCanvas(tabId)`：只能由該具 `provide` route 的 Tab 供 Context；不跟隨普通 follower，避免 route chain/cycle。來源关闭後 missing。
- hide 不移除 provider；close 才移除。關 active provider 選剩下最近明確啟用 provider；沒有就清 active Context。Context 可以仍在 Directory，不因保留 registry entry 而繼續供應已關閉 Canvas。
- `setRoute`、`setLinkGroup`、`activate`、direct Context selection/navigation 與 Graph model publication 均重算 target，再通知 Workspace observers。無內容變化不重發 `receive`；模型 revision 變化仍更新 target lease。
- 每次有效 publication/retarget 用 Workspace monotonic generation 建 `TargetLease`。`services.accept(lease,callback)`／`workspace.accept` 先比對 live Panel instance 和 generation；stale target、關閉、重用相同 instance ID 都不呼叫 callback。這是呈現副作用 fence，不是任意外部副作用 transaction。
- 需要 M01 編輯時，使用 `services.context(update.lease)`（或 `workspace.targetContext`）取得 effective observable Context，再以 `update.target.ref.scope` 呼叫 `ScopedParameterTarget.openRouted`。舊 lease 查不到 Context；Widget 不自己重找同名節點。

### pin：固定物件，不跟 Canvas 導覽

Pin 保存的是 requested `TargetRef`。預設 resolver 為該 Panel 持一個 dedicated `ObservableEditorContext`，引用同一 Graph，定位到 exact Stage/occurrence；回傳 target 的 scope 是該 effective Context。原 Canvas 的 selection/navigation/close/disposal 不改它。

Occurrence/object 被刪或不能解析就顯示 missing，不改綁其它物件。Undo 恢復原 identity 後，服務可重新解析，但舊 M01 writable handle 仍失效，必須重開新 lease。切離 pin、close 或 Workspace dispose 釋放服務持有的 Context，不處置原 Canvas Context。若其他人正在持 Graph Operation，封存 Context 暫時拒绝 disposal，服務等 operation-end 收尾；不得為清畫面取消別人的編輯。

本預設 resolver 明確支援 root/nested node、edge、resource，以及已存在 root frame metadata。新種類或不同 frame schema 由另一個公開 `TargetResolver` contribution 實作；UI/Panel 不私自 parse。Host BindingRef/Preview session authority仍由 Host契約掌握，不因本 resolver 返回一個 Node target 而取得。

### move / hide / close / destroy

- `move(id,pane,index)` 先驗目標位置；成功只改 placement，保留同 Panel instance、Context、草稿、viewState、linkGroup，不重跑 factory/restore。
- `hide` 只改 visibility 並呼叫 `setVisible`。可暫停渲染但不 dispose，不撤銷 route provider。
- `beginGesture(contextId,panelId,label)` 記 operation origin，返回真 Graph Operation。其 commit/cancel 經 Graph operation-end 自動移除 origin record。
- close 先檢查該 Panel origin；provider close/切換 Context還檢查該 Context origin。未完成先拒絕，不先 dispose。另一個 Panel 的已知 origin 不阻止普通無關 Panel 關閉。未經 origin API 建立、無法歸屬的 busy Operation 不准藉 Context navigation/disposal 猜測清理。
- 然後呼叫 `canClose`；否決或 throw 仍完整保留 Tab/Panel；throw 記 UI issue。成功先撤銷 target lease、移除 Tab/provider，再 dispose。dispose throw 記 issue，Tab仍確定關閉，其他 Panel繼續；不謊稱可復活已部分釋放的 UI。
- 直接 Context.dispose 在仍有 provider 借用時回 `CONTEXT_IN_USE`。Graph/History/Binding 不受 Panel close 影響。
- Workspace.dispose 對全部 Panel做 preflight；任一拒絕則全部仍存。通過後unsubscribe Workspace、移除lease與所有Panel，清理屬於它的 pinned Context；Directory仍由 application持有。

### save / restore / retry

- `save()` 回 versioned immutable layout snapshot：Pane/Tab順序及active、type/version、route、linkGroup、hidden、private viewState。viewState export失敗則整次 save拒絕，不回半份成功資料。不進 Graph History。
- Context/load欄位只作 restore hint，不是可自動重用的 runtime權限。預設 resolver只認仍在當前Directory的相同 lifetime；跨reload必須由application明確 `RestoreResolver` 映射，否則保留opaque placeholder。沒有Host token儲存入口。
- `restore()` 只接受 empty Workspace，先完整驗Tab/Pane結構。結構錯誤零mutation；各 contribution錯誤各自placeholder，保留其他Tabs。所有factory/restore在initial target publication前完成。runtime activation歷史不從disk復活；第一次明確Canvas activation再分派follow。
- 不存在module、unsupported viewState version、unresolved ref不丟資料。稍後 `register` 後 `retry(id)` 經同一factory/restore/resolve生命週期嘗試；callback仍失敗則仍placeholder。

## 失敗與通知的共通規則

Callback看到的是已發布的模型或已驗證的presentation候選，不能重入Workspace操作；重入拒絕並隔離問題。Context自己的通知中直接重入select/navigation、Directory發布期間跨Context的select/navigation也拒絕。observer throw不阻止其他observer。終止的Context/Workspace拒絕新增訂閱。

這些 guard 是 owner-local。Graph在自己的publication中禁止reentrant mutation；獨立的Context/Workspace通知沒有在所有Graph上安裝全域security lock。trusted callback仍必須遵守read-only規範，不能拿既有Graph引用繞路寫入；本規格不宣称隔離惡意程式碼或任意closure/alias。`ScopedTargetService` 的resolve也不是純函式：它不改canonical Graph，但可以經共享服務建立／釋放pinned view Context。cleanup若发生於Context/Directory通知中，先排到該次publication完成後，避免丟事件或半途銷毀觀察者。

所有Workspace/UI變化不進Graph Undo。真Parameter.write仍走同一 Graph Operation/History。模型撤销触发投影再路由；不自動撤销布局與selection。

## 驗證與範圍

執行：`node --test executable-reference/repair/public-panel-workspace.test.ts examples/minimal-panel/test.ts`。

HP01–04保留原四類案例並改用共同工作區：ordinary registration/notification、opaque placeholder、origin close、restore throw。B01-CE保留舊public入口反例；B01-01–17覆蓋direct Context events、groups/pin、move/hide、gesture、late replies、fresh restore、retry、callback failure/reentrancy、結構錯誤、malformed pin、pin lease清理、terminal subscription，以及 source Context消失後model publication仍刷新pinned Panel。合計22個測試；嚴格 TypeScript檢查覆蓋修復實作、canonical example及測試。

這些驗證沒有渲染DOM、没有驗TD、實體GPU、跨瀏覽器focus/IME/觸控；這些仍按原runtime Gate。在公共Panel接合層，沒有要求下一位實作者另造ordinary Panel registry、routing、restore resolver或nested lookup。使用正式renderer時是實作同一契約，不是把這個實驗原型繼續堆成產品。
