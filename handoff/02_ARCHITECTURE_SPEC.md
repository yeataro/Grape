# Canonical architecture specification · IH-005

本文件是交接包內的規範入口，編譯自 **AC-002（含其已繼承的 AB-001/AC-001）**；IR/CQ/MRDP 決定相容需求與證據狀態，不覆寫 ownership。其他文件不得另立不同真值。原型只證明 bounded mechanisms；正式實作可換內部演算法；名稱與 shape 的可變範圍依 [production ledger](13_PRODUCTION_CONTRACT_SURFACE.md)，不得自行判斷照抄或重新設計。可疑差異進 `audit/HANDOFF_CONFLICTS.md`／Gate。

標記：**CONFIRMED**＝已確認方向；**EXPERIMENTAL BUT CURRENTLY ACCEPTED**＝目前採用、具限定證據的實驗方案，實作照做且保留檢驗；**GATED / UNRESOLVED**＝不得假設已支援。不把原型中的暫時數量上限升為產品限制。

本修訂有兩項明記的 additive Architecture Change：**AC-IH002-01**（Panel public composition 與 Context 通知）、**AC-IH002-02**（同一 scoped Parameter target 的 read/project/write）。它們是本修訂採用、待獨立複驗的實驗契約；不是聲稱 AC-002 早已驗過，也不修改其封存檔案。理由、前後差異、不變量與證據見 [修復紀錄](audit/REPAIR_CHANGELOG.md)，精確契約見 [Panel](executable-reference/repair/PANEL_COMPOSITION_CONTRACT.md) 與 [Scoped Parameter](executable-reference/repair/SCOPED_PARAMETER_CONTRACT.md)。以下 ownership 與 Graph mutation 邊界不變。

## 1. Ownership 與依賴方向

**CONFIRMED**

```text
UI / Panel / Widget ──command/query──> Editor / application services
                                      │
                                      ├──> Graph (document, History, diagnostics)
                                      ├──> Updates ──snapshot──> Generator / Profile
                                      └──> Binding ──capability port──> Host adapter
Node modules ──register──> Registry ──pin──> DefinitionSet ──read──> Graph / Generator
Storage / Host / UI environment adapters ──implement──> application contracts
bootstrap ──compose──> core + modules + UI + adapters
```

Graph 不依賴 UI、Host、Node.js、Electron 或 storage implementation。Node callbacks 取得唯讀能力，不 import 一個 active global Graph 來修改。Generator 只讀 snapshot，不依赖目前 active Editor。UI 可以直接呼叫合法公開模型入口；Manager 不是繞過資料完整性檢查的必要仲介。

Canonical document、Node 設定、Source defaults、Graph-local definitions、Parameter model、Graph History 都在 application。Host current values、原生 control records 和已套用 artifact 屬外部 runtime；Binding 持有帶版本鏡像與流程狀態。名為 `NativeDefinitions` 的服務不是 NodeType/Graph definitions 的持有者。

## 2. 身分、集合、生命期

**CONFIRMED**：Graph→Stage/Network→Node/Edge；端點必能回查 Node。NodeType 是共用定義，Node 是實例；SubgraphDefinition 是圖內資料，不因新增使用者子圖而創造另一種核心 NodeType。

**EXPERIMENTAL BUT CURRENTLY ACCEPTED**：

- 持久 ID 與 runtime `loadId` 分開；每次真正 load 是新生命期。revision 單調向前，Undo 也增加。
- PortRef 由 loadId、nodeId、direction、stable key 辨識；巢狀使用再帶 occurrence path。UI 排序、label、Node.name 不能替代 ID/key。
- `get(id)` 與 name 查詢分開，label/tag 搜尋不是唯一定位。未知 ID 不回退同名物件。
- 固定 DefinitionSet 以 exact module/type/version/fingerprint 引用能力；Registry 後續變更不改開啟中的圖。
- 初始化要完整發布或失敗，不暴露半張 Graph；必要 Stage boundary 是受保護 Node。
- Context、Layout、jobs、Binding 各有 dispose/lifetime；close Tab 不意味 unload Graph。開放 Operation 時先回 busy，不丟失 commit/cancel 入口。

## 3. Mutation boundary

**CONFIRMED**：持久模型只透過 Graph 批次命令寫入。Parameter 是同一邊界的入口，沒有另一份 canonical value。

**EXPERIMENTAL BUT CURRENTLY ACCEPTED**：

1. Guard 檢查 live Graph、Operation、非 reentrant、合法命令。
2. 私有同步 Draft；回呼不能 await／回傳 thenable，不能保留 Draft 做晚寫。
3. 模組 state codec、port schema、reference 驗證；以 stable key reconcile。
4. Node state、ports、local values、Edge、loss records、diagnostics 一起成為候選。
5. 原子發布一次完整模型，增加 revision；先更新 Context 投影，再通知外部 observers。

Draft 中任一命令失敗會 poison 整批；catch 不能讓前半批偷偷提交。模組 callback 例外／重複 port key／非法 default 全批失敗。observer 在成功發布後 throw 不 rollback，不能阻止其他訂閱者；同步通知內重入修改拒絕。

合法 mode 變更可使圖語意 invalid。預設 detach 政策把失效 Edge 移出有效集合，完整保存 loss record 與 Warning；必接輸入缺失另報 Error。模組明示 `invalidEdgePolicy: 'preserve'` 時，則保留失效 Edge 與 Error，供修復及保存；後續型別重新相容時，可經同一 reconciliation 恢復有效。兩者都不是整批拒絕。明確 `requireValid` 操作（例如 verified paste/import）則拒絕候選中任何 model Error，包括原有 Error。已 detach 到 loss 的線不因模式切回而自動重接；Undo 才精確恢復。

一次 Operation 可發布多個批次（例如 slider gesture），最後形成一筆 Undo；單次未附 Operation 的寫入是隱式 Operation。Graph 同時只有一個 writer Operation；另一 Context 不能自動加入。cancel 回到起點並發布補償，不留 Undo entry。

## 4. 連線、型別、模組

**CONFIRMED**：Node module 提供 initialize/codec/ports/parameters/validation/generation。固定與動態節點共用契約，不在 core 以名稱判斷各節點。JSON table 是簡單 NodeType 的建構來源之一，不是唯一擴充方式。

**EXPERIMENTAL BUT CURRENTLY ACCEPTED**：

- 接線真提交時重驗：端點、方向、同 Network、單 input incoming、適配、循環。check 不是免驗 token；replace 必須同批保留舊線或成功換線。
- TypeEnvironment 共用數值、matrix、array、nominal struct、resource 型別；模組不得各寫互斥的型別判讀器。各 profile 的可表示範圍另驗。
- receiving Port 的 connection policy 決定接受預設適配／numeric／exact；Edge 保存與可查詢 conversion plan。型別 style 不能由視覺樣式無聲改掉轉換。
- Module state 必須可編碼；跨物件引用用 reference slots，特殊 state 引用由模組 `collect/remap` 明列。普通字串不得靠猜測替換。
- Graph resources 的 provider 版本也要精確 pin；unused resources 仍驗證。Source name 全 Graph 跨種類唯一。
- 新增／子圖封裝 admission、existing document preservation、Personal 自包含 export 是不同政策。不能把創建限制拿來刪除舊文件內容。
- 子圖接口變更依 child-first 更新所有受影響 caller，root/nested 使用同一 reconciliation，最後一筆 Graph transaction。

## 5. Snapshot、generation、Updates

**CONFIRMED**：生成不修改 Graph；當前全圖 model Error 先阻擋，之後才做 dead-code pruning；Warning 可生成。使用者 name/position 不作 shader symbol 身分。GeneratedArtifact 不是文件，也不是 Host Apply receipt。

**EXPERIMENTAL BUT CURRENTLY ACCEPTED**：snapshot 固定 document、load/revision、definitions/profile；module emit 與 GLSL profile 組合 typed lowering，helpers 去重、effect/statement、stage transfer、nested provenance 都有明確輸出。unsupported profile operation 回診斷，不以隱藏替代節點解決。此包的 backend 一詞只指已驗 GLSL shell／版本／capability seam；Node emitter 仍有 GLSL 語意，沒有已驗的語言中立 IR 或任意程式語言 backend replacement 契約。

Graph-scoped Updates 處理何時生成，History 不排程。manual／operation-end policy 分開；每 profile 至多一個 running compiler 與可替換 latest wanted request。舊完成結果必須符合 demand basis；dispose 不承諾物理停止外部工作。完整最新文件的 export 不等待／不依賴 generator cache。

Code/schema/document 必須取自同一 demand snapshot，不能 await 後拼最新 document＋舊 shader。命中 cache 仍驗目前全圖；每次 Host delivery 有新 intent/receipt。已知 presentation-only 欄位可排除 code key，未知 state/resource/module 保守 invalidation。

## 6. Persistence 與 History

**CONFIRMED**：Graph error state 可保存。GraphDocument 不含 DOM、GPU handles、credentials、Context selection、Host live values、執行中 Operation 或 runtime History。Layout 另存，不放作品副本。

**EXPERIMENTAL BUT CURRENTLY ACCEPTED**：

- save 同步捕捉當下完整已發布 snapshot，再 await adapter。只 ACK 那份內容；新編輯不能被晚到 ACK 清 dirty。save 不幫 gesture commit。原型同時一個 save，重入回 SAVE_BUSY。
- JSON export/download 不是 durable save ACK。Storage write 失敗保留 dirty 並回失敗。
- load 先解析／固定 definitions／完整驗證，再發布新 runtime Graph；持久 ID 保留，loadId 新建、History 清空。
- import review 保存 base document/load/pins，accept 重驗、一次 replaceDocument、保留目前 Graph/Context identity、可 Undo。它不等於 reload。
- missing modules 保 codec-owned opaque state 的未知欄位、port snapshot、refs；文件 envelope／結構未知欄位則依14進 readonly recovery。可理解的外層仍可定位、移動、改名、刪除、另存，不能猜另一版本生成。unsafe remap 可拒絕，普通保存仍允許。
- Graph History 保存完整 before/after memento 是現行實驗策略；no-op 不清 redo；取消／Undo/Redo 的模型狀態完整。改增量實作必須保留語意，不先宣稱效能足夠。

## 7. Diagnostics 與 failure authority

**CONFIRMED**：各 owner 驗自己的領域，診斷集中查詢；UI badge 由內容導出，不另設可編輯 hasError 真值。model/generate/delivery/runtime/storage/ui 的錯誤不同，Host offline 不阻止離線保存與生成。

**EXPERIMENTAL BUT CURRENTLY ACCEPTED**：診斷帶 producer、scope、basis、subject／occurrence；同 producer/scope/basis 替換自己的結果，不清其他 owner。舊 artifact/request 的錯誤只能進 log，不能鎖住最新生成。命令被拒絕、合法但 invalid 的模型、生成失敗、Host indeterminate 必須能區分。

## 8. Host 與 deployment

**CONFIRMED**：Host 是 external integration target；能接 artifacts/bindings/resources/live writes/explicit native operations，能回 identity/capabilities/receipts/readback/runtime/diagnostics/允許的變動。收到的 Graph copy 即使被 Host 儲存，也只是已交付快照；reload-from-host 是明確、帶確認與生命期檢查的匯入／替換流程，不是把 canonical owner 搬回 Host。

**EXPERIMENTAL BUT CURRENTLY ACCEPTED**：Target identity＋incarnation、Binding epoch、intentSeq 與 expected Host revision 在 receiving side 提交前重驗；prepare 不能改 active artifact。commit 時合併當下相容 live values。uncertain commit 進 indeterminate 並阻寫，等 readback/recovery；不偽造 rollback。input value、native definition、Graph History 分域。**ACCEPTED PRODUCT DECISION DEC-GRAPE-001**：協調式 Mixed History 延後；沒有隱藏協調器。Graph Undo 的 canonical commit 與後續新的 Binding conditional live write 分開完成，Host conflict 不 rollback Graph。

Static Web、Node-hosted、Electron 用相同 application core，改 bootstrap/service adapters。沒有 provider 回 capability unavailable；不能用環境判斷或原生 API 穿透 core。可信 TS extensions 不是 sandbox，不能宣稱防任意惡意模組。

## 9. Panel composition 與 scoped Inspector

**EXPERIMENTAL BUT CURRENTLY ACCEPTED · IH-002 repair**

普通 Panel 的正式公共接入路徑為 `PanelWorkspace.register/open`。它是一個 composition facade，統一調用 Panel registry、Layout/Pane/Tab 與 Manager routing 職責；不是第二個 Graph owner，也不與另一個私有 workspace 各存一份布局。Panel factory 接收自己的 identity 與 public services，實作私有 viewState、接收 resolved/missing target、canClose/dispose。共享服務負責 initial resolution、後續路由、恢復、移動、close preflight、placeholder 與過期結果隔離，普通 Panel 不必發明它們。

EditorContext 的成功選取、導航、Graph 投影更新與 dispose 均有公開通知，直接呼叫 API 與 UI 操作走同一條路。Context/workspace 在各自通知期間拒絕透過自己的公開 API 重入修改；Graph 在自己的模型發布期間拒絕模型重入寫入。可信 callback 必須保持觀察用途；獨立 Context／dispose 通知沒有安裝跨 owner 的全域 Graph 寫入鎖，也不是 plugin 安全邊界。若 callback 直接持有 Graph 並在這些獨立通知中寫入，屬違反 callback 契約，不能宣稱目前會自動阻止。Panel 焦點不等於 Canvas activation。固定目標由共享 targeting service 持有獨立 scope Context，仍指向同一 Graph；原 Canvas 導航不能把 pin 偷換成新選取。真正失去 occurrence/load 則顯示 missing，不按同名恢復。

Inspector 透過 `ScopedParameterTarget.openRouted` 取得 occurrence-bound lease；spec、value、port、links、型別投影與 write 都由這個 target 查詢／操作同一模型。`ScopedParameterWidgets.projectTarget` 不接受不帶 scope 的根節點查找捷徑。Graph load、Context、Stage、完整 occurrence path、definition chain 與動態接口共同決定有效性；UI 不遍歷 resources 補查。lease invalidated 後是終止狀態，Undo 或導航回原位置不能復活舊 handle。view draft 只保存文字與 conflict token，提交仍使用既有 Graph Operation/History。

## 10. GATED / UNRESOLVED

Gate 全表與依賴在 `10_KNOWN_GATES.md`／`data/gates.json`；此處列禁止預設成功的範圍：真 TD publication/rollback/readback、native/GPU profile、legacy revision→exact pins、分域 History/reload/lifetime races、Personal 符號陣列政策、layout 超限、cross-manager adoption、原生窗口範圍、TOE/TOX 內嵌內容、browser/device、Electron package、production Panel DOM mount 與真 UI 互動。協調式 Mixed History 屬已決定延後的產品 scope，不是要求實作者補建的 coordinator。IH-002 的 Panel/scoped Inspector 契約 qualification 不等於這些 runtime 已完成。

Node/Host 範本編排既有契約；IH-002 的 Panel/scoped Inspector 則是已明記新增的 production-facing public contract，其 executable reference 仍不是 production code，也不承諾永久 binary/plugin SDK ABI。原型 fixed-array 4096、struct 128、cache 8、有限 source/control types、閉合的 PanelKind 等是 **qualification bounds**；不可複製為禁止一般擴充的產品設計。ISF完整行為、多人協作、安全執行不可信 plugin、雲端資源庫均不得由本包的首版計畫暗中宣稱完成。

## IH-003 規範補充

**EXPERIMENTAL BUT CURRENTLY ACCEPTED**：[13](13_PRODUCTION_CONTRACT_SURFACE.md) 分類正式契約、可改名 shape 與 qualification-only bounds，並明訂開放 registry；[14](14_DOCUMENT_FORMAT.md) 定義正式文件格式與安全 forward handling；[15](15_LOCALIZATION_CONTRACT.md) 定義 feature-owned presentation 與翻譯。變更分別登錄 AC-IH003-01／02／03，不改 Graph/History/Host ownership。

**GATED / UNRESOLVED**：對外穩定文件相容承諾開始時間由 G-DOCUMENT-STABILITY-COMMITMENT 管理，技術 schema 不待此決策才定義。原 21 INV 的 status 指 bounded mechanism 證據；已確認上位原則另列 data/invariants.json 的 confirmedPrinciples，不把 CONFIRMED 誤解為每個實作細節已完備。

## IH-004 additive view boundary

AC-IH004-01 補上 feature-owned view contribution 與共同 renderer 的 mount 契約，詳見 [16](16_VIEW_MOUNT_CONTRACT.md)。狀態為 EXPERIMENTAL BUT CURRENTLY ACCEPTED、待 fresh re-review。PanelWorkspace 的 factory／routing／target／restore／close authority 與 ScopedParameterTarget 全部沿用；mount failure 是 view failure，不得改寫 Graph 或繞過 close guard。

## IH-005 technical closure

**EXPERIMENTAL BUT CURRENTLY ACCEPTED**：AC-IH005-01 明定 `grape.document 2.0` 的 adaptation／loss／recovery wire identity、exact module preservation codec 與遞迴 unknown-field fence，見 [14](14_DOCUMENT_FORMAT.md)。舊1.0未經converter只能保全／唯讀；不是把新schema塞進舊版本。Loss/recovery永不在hydrate時自動重播。

AC-IH005-02 補足 [可編輯 Panel command seam](17_PANEL_COMMAND_CONTRACT.md)：Application 保留 command/Operation authority；Panel instance、target lease、mounted user event 三者都有效才可操作。只讀 Panel 不獲寫入權。Mount loss僅取消新契約規定的未完成 Panel pointer gesture；不能改 Widget draft 或已提交 History。模型通知因cleanup再發生時，workspace在返回前完成新lease/projection派送。上述補完不改原21項invariant、canonical owner、renderer資源owner或deployment模型。
