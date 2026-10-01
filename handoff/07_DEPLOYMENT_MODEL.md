# One application, three deployment profiles

共用的是 Graph/Network/Node/Edge、Parameter model、Registry/DefinitionSet、resources、History、EditorContext、validators、Generator/Profile、Updates、Binding contracts 與Panel/Widget的操作契約。**Node-hosted 不代表Graph只存在server；Electron不代表Graph搬到main process。** composition可選進程位置，但不能製造雙重canonical truth或讓平台決定domain API。

Deployment profile 與 GLSL `GenerationProfile` 是不同軸：前者決定可用 bootstrap／service providers，後者是已驗的 GLSL shell、版本及 shader capability 邊界。改用 Node 或 Electron 不會帶來任意程式語言 backend，也不證明 TD／GPU 相容。

| 能力 | Static Web / GitHub Pages | Node-hosted development/runtime | Electron packaged runtime |
|---|---|---|---|
| App assets/bootstrap | 靜態bundle；首次／重載離線不由manifest自動保證 | server供bundle；server與Host可不同電腦 | packaged bundle；完整打包／更新另驗 |
| 作品編輯/生成 | 同一純application核心；沒有Host也可工作 | 同一核心；不能依賴server才能定義Node | 同一核心，不需重寫模型 |
| Graph persistence | browser storage、使用者選檔／下載等能力；沒有任意目錄權限假設 | 可加filesystem/service adapter，明確作用設備與權限 | narrow filesystem bridge可增加能力；不把fs/IPC散在core |
| Host discovery/launch | 明確descriptor/選擇；無provider則缺能力 | 可增加discovery/launch，但不能猜server和用戶同機 | 可增加launcher；不以窗口／地址代替Target identity |
| Host session/publish/inputs | 遠端可達且授權的provider；origin/permission/runtime需驗 | provider可中介，但自身cache不是Host真值 | bridge/provider可供應；receiving fence與authority仍適用 |
| Preview／native windows | browser媒體／繪圖能力＋外部Host provider | server不自動擁有客戶端GPU或窗口 | renderer/bridge/provider分工；native window需指出在哪台設備 |
| UI/Panel/Widget | browser renderer與共享model contracts | 相同renderer驗IME/touch/clipboard | 仍有renderer事件與權限問題，不能免測 |

**Node→Electron 路線**：保留application與modules，新增packaged bootstrap、受限bridge、native storage/launch adapters，再驗renderer與package。不能把 `isElectron` 分支加到Graph／Parameter／Generator來完成包裝。

## 啟動與缺能力

1. 提供IdentitySource與環境capabilities。
2. 初始化並驗證NodeModules、types與profiles，建立registry。
3. 建立application documents/editor/services，注入storage/host adapters。
4. 註冊PanelTypes/Widgets，恢復Layout/viewState；缺Panel顯placeholder。
5. Manager建立routing並掛載UI；Host連線是可選後續動作。

身份服務需可用且唯一；無服務回明確failure，不用時間戳／Math.random偷代。沒有Host/write/clipboard等能力時回unavailable並保留作品；UI的按鈕可禁用或解釋，不能靜默執行另一個設備上的動作。

## 首版與尚未承諾

S01先以browser或Node開發server載入host-free產品，使用可確認ACK的storage adapter完成save/reload；download是額外export，不冒充save。這是實作順序，不提前選定React/Vue、render library、transport或installer。

PWA、背景offline cache、任意本機目錄掃描、LAN自動發現、三平台全量GPU／TD相容都沒有由原型全部證明。相應Gate依slice處理。部署用受控adapter增加能力，不讓最低權限profile變成另一種Graph格式。

平台相依檢查見 `tools/check-boundaries.mjs`；它能抓明顯import/API洩漏，但實際權限、打包與跨origin可行性仍需runtime evidence。
