# Feature-owned view 與共同 mount 契約 · IH-005

**狀態：EXPERIMENTAL BUT CURRENTLY ACCEPTED，待 fresh independent re-review。** 本文件與 [contracts/view-mount.ts](contracts/view-mount.ts) 定義 production-facing 語意；[view-mount.ts qualification](executable-reference/repair/view-mount.ts) 只實作可執行規格。**THIS IS NOT THE PRODUCTION IMPLEMENTATION.** Production 應移植契約與反例，不複製 qualification class structure 當產品基礎。

FIR-B01 成立的原因：IH-003 已定義 Panel 的建構、target、routing、保存與關閉，以及 Widget 的 scoped projection／write；但沒有說明 feature 的畫面如何由共用 renderer 取得並掛載。多一份 projection description 不等於 view contribution。此次只補這條接合，不重建 PanelWorkspace、ScopedParameterTarget、History 或 localization。

## 1. 責任與兩種 contribution

Panel 與 Widget **保留不同 contribution type，共享 mount semantics**。Panel 的內容来自 Panel 自身公開投影，Widget 必須額外携帶 scoped edit token、writable 狀態與受限 field commands。強迫兩者進同一個萬用 editable view，會讓純展示 Panel 多出不該有的 Graph 編輯權。

| 角色 | 擁有 | 可取得／不可取得 |
|---|---|---|
| PanelWorkspace | Panel instance、route、TargetLease、Tab placement、close preflight | 不解讀 feature 的畫面、projection shape 或 private viewState |
| Panel feature | 自己的 private finite-JSON viewState、target projection、feature view factory | 經 PanelServices 讀 target；只有 application 授權的可編輯 Panel 才經 `PanelMountContext.commands` 發命令，詳見17；不讀 workspace 私有 maps |
| Widget feature | 自己的 view contribution、暫存 draft／編輯外觀 | `WidgetReadBinding` 的 scoped snapshot 與受限 `WidgetCommands`；沒有 Graph/raw mutation handle |
| 共同 renderer／shell | presentation attachment、mount lifetime、surface allocation、cleanup、placeholder、locale 更新 | 只認 Panel／Widget 公共契約；不 import concrete feature class、不 switch feature 名稱 |
| MountSurface provider | 特定 renderer 技術的 mount target／底層 root 資源 | `protocol` 表明技術能力，不表明哪一個 Panel 或 Widget；平台 handle 不進 model |
| Graph／EditorContext／ScopedParameterTarget | 既有 canonical model、context state、scope identity、edit validation | 不因 mount、move、hide 或 renderer 更換而轉移 owner |

`MountSurface={protocol,target}` 是共同 shell 與 feature renderer 間的受控技術邊界。`target` 的實際型別由該 protocol 決定；它不是任意 Graph／Workspace service bag。Bootstrap 為整個 UI 選同一 renderer protocol，feature 在相同技術組合中提供相容 mount。React、Vue、DOM、Web Components、CSS 與 virtualization 沒有在此被選定，也沒有保證一份 feature view 可不經適配跨所有 renderer。generic shell 不需要知道 feature class；辨認 renderer protocol 不等於新增 feature-specific switch。Production 可以定義同一 protocol 的 concrete DOM adapter／framework target，這是本已定 seam 的工程實作，不是再設計 Graph/UI ownership 或為每個 Panel 開新入口。

## 2. Public shapes 與 registration

精確 TypeScript 宣告在 [contracts/view-mount.ts](contracts/view-mount.ts)。下表是實作者的正式接法；方法拼字仍受 [13](13_PRODUCTION_CONTRACT_SURFACE.md) 的一致更名規則，ownership、ordering 與 identity 不可偷偷更改。

| 入口 | 意義 |
|---|---|
| `PanelViewProvider.createView()` | 普通 Panel 套用 required provider shape 並交出 `PanelViewContribution`；共同 renderer 不再找 concrete class 的自訂 render 方法 |
| `PanelViewContribution.capture/subscribe/mount/dispose` | feature 提供完整、detached、唯讀 projection，發布 invalidation，建立本次 mount；終止 presentation attachment 時清自己的訂閱／暫存 |
| `ParameterWidgetViewType {widgetId,create}` | 與 registered widget presentation identity 對應；create 只接 `WidgetReadBinding`，回 `ParameterWidgetViewContribution` |
| `WidgetReadBinding.capture/subscribe` | 由同一 ScopedParameterTarget 取得 `{projection,editToken,writable}`；不是 renderer 再查 Graph 的捷徑 |
| `ParameterWidgetViewContribution.capture/subscribe/mount/dispose` | 與 Panel view 有相同 lifetime，但 mount 另接 `WidgetCommands`，不能取得別的 node/parameter 寫入權 |
| `MountedView.update(projection,frame)` | shell 主動推送初始與後續最新完整 projection；不要求 shell 理解 projection 的 feature schema |
| `MountScope.own/ticket/accept/event` | cleanup ownership、非同步 fence 與 live user-event 入口；不是新 model operation service |
| `ViewFrame {revision,locale,text}` | 本次完整呈現的修訂與文字解析；不把 locale 存回 Graph |
| `PanelWorkspace.beforePanelDispose(listener)` | 公共 shell teardown hook；只有 close guards 通過或邏輯 replacement 已決定後才通知，先清 view 再 dispose Panel；拒絕 close 不發此 hook |
| `PanelMountContext.commands?` | IH-005 新增：由 workspace 綁定 exact Panel instance／target lease、shell 綁定本次事件權限；Application 仍持有 commands／Operation。只讀 Panel 不取得此能力，詳見17。 |

普通 Panel 套用 `PresentedPanelType` 與既有 `PanelWorkspace.register/open`，再由 Panel 的公開 `createView` 交接；不建立第二份 Panel-type registry。Widget 同樣使用 namespaced widgetId 的普通 registration，登記自己的 view factory；它可搭配既有 `ScopedParameterWidgets` projection，不重造 nested lookup。重名 registration 拒絕、不 last-wins；不相容 contribution 是可診斷的不可用 UI，不可默默換模型值。

qualification 中 `Panel.createView` 為 optional，以容納封存的 headless fixtures 與 placeholder；**production 中可顯示的普通 Panel 必須提供它**。其 production declaration 套用本契約 `PanelViewProvider` 的 required `createView(): PanelViewContribution` 約束，不能把 fixture optionality 搬成普通 extension 的自由選項。缺少 view 的既有 opaque placeholder 仍可以保全 state，但不得宣稱該 extension 已完整接入。

## 3. Creation、初始 render 與更新 ordering

Panel 的既定路徑保持：

```text
register PanelType
→ Workspace.open
→ create Panel → restoreViewState → visibility → initial receive(resolved or missing target)
→ publish public workspace state
→ shared renderer obtains Panel.createView()
→ subscribe contribution invalidation + LocalizationService
→ obtain surface → mount → capture latest projection → MountedView.update
```

restore 與初始 target delivery 完成後才建立 view，畫面不用猜沒有初始化的 Panel。首次 update 是 shell 的責任，不能依賴 contribution 恰巧會發第一個 invalidation。訂閱先於初次 capture；所有 publication 與 capture 在既定同步 callback 邊界內完成，避免先讀舊 projection 再漏掉通知。訂閱期間可能引起的刷新只使 shell 讀最新完整 snapshot，不保存一串舊 render delta 當 canonical state。

Widget creation 路徑為 Inspector 取得 scoped target → projection registry 解析實際 widget（含既定 fallback）→ view registry 以解析後的 widgetId 找 factory → create(binding) → session 訂閱 → mount → capture/update。不是按使用者要求的 widget 名稱強行建立不相容 view。target lease 由建立它的 Inspector／field owner 持有，WidgetRenderer 借用；session.dispose 取消自己的 binding 訂閱，不處置借用的 Graph／Context。Inspector 結束該 field 時還須按 scoped 契約清理自己擁有的 target handle。

若 registry 缺 view、factory／subscription 失敗，`WidgetRenderer.open` 仍回可查詢 `status/issues` 的 `WidgetViewSlot`，由共同 slot 持有 field placeholder，保留 descriptor 與模型值；修復 registry／factory 後，visible slot 的 `retry` 用同一 factory 路徑重新建立。Inspector／shell 只呈現 slot 狀態，不讓每個 widget 自行發明 fallback／retry。若後續 type/presentation 變更使投影解析到不同 widgetId，舊 session 進 `WIDGET_VIEW_CHANGED` placeholder；Inspector dispose 舊 view binding，再走相同 registry/factory 路徑建立新 contribution，不以中央 widget 類別 switch 猜轉換。舊 draft 必須明確結束／通知，不能重用舊 token 寫新型別。

後續來源分工：

- **model／context／selection／navigation**：既有 workspace routing 交 `Panel.receive` 與 TargetLease，feature 更新自己的 projection 並 invalidates view。
- **Panel private state**：由 feature 的公開 UI action 改自身 state，再 invalidates；例如 Help expanded/collapsed，不改 Graph History。
- **scoped parameter／interface／link**：既有 target 通知經 `WidgetReadBinding` invalidation；新的 capture 得到 spec/value/link/type 與同一 edit token。
- **locale／catalog**：共同 session 訂閱 LocalizationService，重 capture/update；feature 使用 frame.text 解析自己的 TextRef，選單 value／port key／Graph state 不變。

`capture`、`subscribe`、`mount`、`update` 是呈現 callback，不得在其中提交 model edit 或偷偷切 selection。Widget commands 在此被共同 session 拒絕。`mount/capture/update` 中同步 invalidate 自己是 render reentrancy，session 以 `VIEW_RENDER_REENTRANCY` 進 placeholder，不能無上限遞迴 render。可信 feature 的純度仍需 conformance review；這不是惡意插件 sandbox，也不是宣稱可阻止任意閉包、cast 或全域偷渡。

## 4. Move、hide、unmount 與 dispose

| 動作 | Panel／feature identity | 私有 state／draft | mount／訂閱 |
|---|---|---|---|
| Tab 移到另一 Pane | 同一 Panel、同一 live view contribution | 保留；不重跑 restore／initialize | 舊 mount 撤銷並 cleanup，向新 surface remount，再推最新 projection |
| hide 或成為非 active Tab | 同一 Panel、同一 contribution | 保留；不視為 commit、cancel 或 close | unmount／停止可見 render；仍追蹤 owner/locale invalidation，舊 async ticket 失效 |
| show／重新 active | 同一 Panel、同一 contribution | 恢復原 private state／draft | 新 mount identity，capture 當前狀態；不重播隱藏期間舊畫面更新 |
| 明示 unmount | contribution 仍 live | 保留 | 只結束當次 mount，cleanup 其資源、使 ticket/event callback 過期 |
| close accepted | 先完成既定 gesture guard 與 canClose | 結束該 instance 的私有生命期；模型內容不刪 | 先撤銷 mount／presentation，再 dispose Panel；各 cleanup 一次 |
| close rejected | 完全保留 | 保留 | 不先 unmount，不部分拆除 view |
| renderer/shell detach | application Panel 可繼續存在 | Panel-owned viewState 保留；結束的 contribution 私有暫存不可冒充仍live | 釋放此 attachment 的 sessions/subscriptions；重裝 shell 可重新 createView |

Widget field draft 必須保存在 contribution／field controller lifetime，不能只藏在 mount target 或某個 DOM element 中。hide／move/remount 保留同一 contribution，因此能恢復 draft；dispose 才結束該 contribution 的 draft lifetime。這不保證選取改變後舊 field 還能提交：scope/token/link/type 的有效性仍由原 ScopedParameterTarget 決定。

IH-005 的 [Panel pointer gesture](17_PANEL_COMMAND_CONTRACT.md) 是不同於 field draft 的 application Operation：事件路由隨 unmount／hide／move／failure 結束時，Application 取消未完成的 Panel gesture，補償其自身批次而不新增 History entry。上表的「保留」仍適用於 Panel identity／private viewState／Widget draft，不表示舊 pointer gesture 可跨失效 mount 繼續發命令。這是新 command seam 的明確 lifetime 規則，不改 Widget draft 契約。

有效可見性為 `!SavedPanel.hidden && pane.activeTab === panel.id`。非 active Tab 不是把 persisted hidden flag 改成 true；共同 renderer 可以停止它的 mount，但不能因此改寫 layout preference 或刪除 routing provider。Renderer attachment 結束時停止 workspace 訂閱；每個 session 先撤銷 mount/ticket 並清理 mount 資源，再終止 locale／contribution 訂閱與 dispose contribution。原 Panel 可繼續存在；下一個 attachment 得到新的 contribution，僅由 Panel.export/restoreViewState 所規定的 state 具備持久承諾。這與 hide/move 保留同一 contribution 明確不同。

Production 可以在相同條件下保留底層 view tree 搬移，或按上表撤銷後 remount；可觀察 identity、draft 與失效語意必須等價。Qualification 使用明確 unmount/remount，避免依賴某一 UI framework 的 DOM reparent 行為。實際 focus／IME／pointer capture 可保留到什麼程度仍要 browser runtime 驗證，不能由 headless 測試推定。

## 5. Mount resource ownership 與失敗

每次 mount 都有新的 `MountScope`。Feature 每獲得一個 listener、observer、view root、timer 或其他 mount-only 資源，就**立即** `scope.own(cleanup)`；不能等 mount 成功 return 後才登記。Scope 的 cleanup stack 採 reverse acquisition order，逐項隔離 exception；一項 cleanup 失敗不能阻止其餘項釋放。scope 已失效後才登記的 cleanup 立即執行，讓晚回應不把新資源掛回舊 view。

`mount/capture/update/unmount/dispose` 與登記的 cleanup 都是同步契約；render 所需 async 工作走 ticket/fence。Cleanup 必須同步完成本地 release/revoke，不得回傳 Promise 並把未 await 的 rejection 當作已清理成功。若清理觸發某個獨立 service 的非同步 native/remote teardown，該 service 自己持有完成／失敗責任；本契約不宣稱已等待遠端清除。

surface 的 target 必須是已有明確 shell／Layout owner 的 borrowed anchor/container；取得 surface 本身不把 anchor ownership 交給 contribution。Feature 只清自己配置的 child view/resources，不得刪除別的 Panel 使用的 container。Provider 若需要配置新 anchor，須先把它登記到 shell/platform lifetime；factory 在回傳前失敗則自行 cleanup，不能把配置藏進無清理責任的 target getter。Shell 只有在該 anchor 上的 mounts 全部 unmount 後才能釋放 anchor。這不需要另一套 universal release API：每次 mount 的資源交 MountScope，pane/shell 的 anchor 交其原有 owner。

`MountedView.unmount` 是可選最後清理函式，只有 mount 成功返回後 shell 才能登記它；因此不能用它單獨處理 partial mount failure。`createView`／widget factory 在取得 MountScope 前不得配置 mount-only 資源；factory 若配置自身短期資源又 throw，必須自行釋放，shell 尚未取得 contribution 時不可能替它清理未知閉包。

| 失敗來源 | 結果與 retry |
|---|---|
| Panel factory／restore／receive | 繼承 workspace composition failure semantics：保留可保存 state，清理失敗 contribution，workspace placeholder／retry；不是本次重新設計 |
| feature view factory／subscribe | UI 不可用，shell 報具體 phase；清理已取得 subscription／presentation 資源，不能假裝已 mount |
| surface acquisition／mount | 清理本次已登記資源、撤銷 ticket/event callback，view placeholder；不刪 Panel state／Graph／History |
| capture／MountedView.update／accepted async render callback | 撤銷當次 mount、cleanup、view placeholder；不回滾已完成的 Graph operation，不把 renderer bug 當 shader error |
| cleanup／unmount finalizer | 記錄 UI issue 並繼續全部清理；已撤銷 mount 不復活，也不再次 dispose contribution |
| user edit event／parse／stale token | 回報失敗，保留可修正 draft；原 scoped mutation 拒絕時沒有 History entry，不自動用目前值重試 |

view retry 是 presentation retry；不重開 Graph，不重跑 Node initialize，不重送已成功的 write。mount failure 要在仍有效的 contribution 上用新 scope 重 mount；不能讓 workspace.retry 重建整個 Panel 來掩蓋 mount leak。若 contribution 本身不能建立或訂閱，presentation attachment 必須先 cleanup 再重新建立。隱藏 panel 的 retry 也不能偷偷顯示或取得可見 mount；展示仍由 workspace visibility/active Tab 決定。

placeholder 中的可保存 Panel state 由既有 Panel.exportViewState 決定，view 失敗不授權 shell 從 concrete class 搶救私有欄位。狀態匯出本身失敗時仍是 save failure，不能宣稱舊快取等於目前狀態。

## 6. Async fence 與 edit authority

有兩層彼此不能替代的身份：

1. **TargetLease／ScopedParameterTarget**：驗 model/context/load/occurrence 與 parameter identity、interface、link、value/token；決定「這次操作是否仍指向原 logical target」。
2. **MountTicket={mount,revision}**：驗此呈現 attachment 的 mount generation 與最新 projection revision；決定「這個晚到結果是否還可畫在目前 view」。

開始 async render 時取得 ticket；完成時只在 `scope.accept(ticket, callback)` 內套用。如果後來的 projection、locale、hide、move、unmount、failure 或 dispose 已撤銷它，callback 不執行。取消可以減少工作，但不能代替 receiver-side fence。涉及 target 的 feature async 工作仍要通過 `PanelServices.accept(TargetLease,...)` 或 scoped target 的驗證；mount ticket 不能替舊 target 授權，也不允許 Graph mutation。

Widget 的可編輯事件經 `scope.event(handler)`，在 handler 內才使用 `WidgetCommands.commit(value,expectedToken)` 或 `draft()` 的編輯方法。Renderer shell 注入的 commands 最终仍走原 `ScopedParameterTarget.commit`／`ScopedFieldDraft`，再由 Parameter.write → Graph Operation → History。`draft.cancel()` 是丟棄本地暫存，可在 dispose cleanup 中使用，不授予任何 model edit；其他編輯／commit 仍受 event guard。這裡沒有新增「直接設定顯示值即寫模型」路徑。

`writable` 是 projection 的提示，不是 authority；正式 commit 仍要重驗 scope、connected、type、stale token、busy、IME 等原條件。取得 commands/draft 的舊 UI callback 在 unmount/dispose 後不再有執行權；新 mount 必須用新 event entry。成功 write 若引發 copy-on-write 並讓舊 lease 失效，仍維持既定「已成功」結果，重新取得 target 才能繼續，不重播這次 edit。

## 7. 普通擴充所需改動與禁止改動

新增 Selection Summary、Help 或其他普通 Panel：只在該 feature package 提供 PanelType／presentation／locales／Panel.createView 與測試，加入正常 registration wiring。新增 percent、choice strip 或其他 Widget：在 feature package 提供 registered projection／view type／文字與測試，加入 widget registration。共同 shell 只使用這份契約。

不得為第二個 extension：

- 修改 Graph／History core、workspace target resolver 或 scoped traversal。
- 在 renderer 加 `if (typeId === 'help')` 或 import concrete Help/Selection class。
- 讀 `panel.privateState`、另一個 widget 的 draft、workspace 私有 maps。
- 以 mount failure 為理由重建 document，或以 locale 更新為理由寫 Graph。
- 讓 contribution 取得 raw Graph mutation、Host authority 或任意 platform API。

Panel／Widget 可以各自定義 projection shape 及 renderer-specific view，而不必讓 shell 知道欄位。Shell 只負責 lifecycle 和公共權限；它不是通用第三方 UI framework。新 platform renderer protocol 是 bootstrap/render integration 工作，不要求普通 feature 修改 unrelated core。

## 8. 驗證範圍

直接 qualification 必須以兩個不同 Panel（Selection Summary、private expanded/collapsed Help）及兩個不同 Widget（包含非 text/number projection）走同一路徑，檢查首 render、更新、locale、move/hide/remount、close guard、partial mount failure、update failure、cleanup exception、retry、dispose 與 stale async／event。案例使用真實 reference Graph／History/scoped target 檢查模型未被 renderer 越權改動；不是以假的 value bag 代替既有讀寫邊界。

IH-004 mount 的歷史證據見 [當輪 validation](audit/FINAL_REVIEW_REPAIR_VALIDATION.json)；本修訂完整結果以 [IH-005 validation](audit/IH005_VALIDATION.json) 為準。結果只能寫已執行的內容。必要的 prototype adapter 是 reference-only，正式 implementation 不能依賴 reference import。真 DOM／browser focus／IME／accessibility／touch／GPU／Host 均仍在原 Gate。**此次 contract 修復不代表 S01 已開始，也不代表產品 UI 已完成。**

Renderer.dispose 是明示終止整個 shell attachment 的清理入口，不能作為關閉普通 Panel 的快捷替代。普通 close 必須經 Workspace.canClose/close preflight；shell detach 不刪除或結束仍由 application 擁有的 Panel/Graph，也不繞過它們的未保存資料政策。
