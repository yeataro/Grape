# Screen / state index

此索引區分兩種資料：以下 UIR 是 **HANDOFF SCHEMATIC（結構示意）**，不是產品截圖或像素規格；另有使用者提供的 [LUI-01–05 Legacy screenshots](legacy-screenshots/README.md) 與其 [原圖 manifest](legacy-screenshots/manifest.json)。原有示意圖和 UI_SPEC 承擔設計／結構说明；LUI 只補充既有產品外觀，不從靜態截圖推定互動、ownership 或 Gate 已通過。本次只新增 canonical locator，沒有重寫或加工原截圖 evidence。

結構示意 ID 使用 `UIR-01` 至 `UIR-07`，Legacy 截圖用 `LUI-01` 至 `LUI-05`，均與實作 slice `S01` 分開。兩張示意圖已完成指定 viewport 的 [PNG 視覺檢查](VISUAL_QA.md)；這不代表下列產品互動驗收已完成。Legacy 截圖 README 中關於「原交接檔保持原樣」的敘述，是 IH-001 當時的收錄紀錄；IH-002 在此增加可發現入口，原圖與該收錄紀錄原樣保留。

| ID | 圖／狀態 | 需要看懂的結構或行為 | Evidence / scope |
|---|---|---|---|
| **UIR-01** | [workspace-schematic.svg](workspace-schematic.svg)：Canvas＋Inspector | 真ports/edges、shared Graph、context selection、local vs connected field、唯讀code、保存與套用分開 | IR LC-UI-001/025/042/045/047/077/091；AC002 Graph/Workspace/Presentation contracts |
| **UIR-02** | [states-schematic.svg](states-schematic.svg) 左：error／missing module | 可修復性保存，生成拒絕；opaque record保留；一般成功不清persistenterror | IR LC-UI-076/091；AC002 persistence/missingmodule/diagnostics |
| **UIR-03** | 同圖右上：未提交field | 顯示使用者尚未完成的字串，模型保舊值；Enter/IME/cancel分開 | IR LC-UI-047/097/098；AC002 FieldDraft |
| **UIR-04** | 同圖右下：兩Context | selection/camera独立、model/history共用；Inspector target明確 | AB inherited UI §13；AC002 Context/Workspace；首slice需真UI驗 |
| **UIR-05** | UI_SPEC §6表格：保存／reload | export捕捉全圖、下載不mark saved；Host Reload Applied不是一般文件reload | IR LC-DATA-005/008/009；LC-UI-070/101；MRDP相應gate |
| **UIR-06** | UI_SPEC §5表格：色彩／Overview | wire source color、own socket type、structgradientplaintext、matrixgray；Overview defaultoff | IR LC-UI-027/031/058/059；Overview不是首slice必做 |
| **UIR-07** | UI_SPEC §9：窄畫面／tablet／mobile，沒有實機圖 | overlay不覆寫desktop偏好；Context與座標不變；Canvas與Viewer手勢分域 | LC-UI-066、LC-HOST-031；mobile visual/runtime evidence仍是明示gap |

## First-slice view checklist

- [ ] 普通、空選取、多選primary、兩Context路由可辨識。
- [ ] 固定node與dynamic mode都由當前schema繪製；沒有UI自造ports。
- [ ] linked input來源／local value／readonly／missing widget可辨識。
- [ ] 拒絕接線不刪原線；mode變更的loss/error可見並可Undo。
- [ ] field draft可留未完成字串；外部schema/value改動不覆蓋新模型。
- [ ] invalid／missingmodule可保存但不能假生成成功。
- [ ] 生成結果標Graph/Stage及當前性；舊late回覆不可覆蓋新context。
- [ ] save、export、generate、host apply 狀態不是同一badge。
- [ ] keyboard焦點、IME、pointercancel與close時operation清理有browser證據。

這些方框是**待實作驗收**，不是已通過測試的複寫。Runnable extension examples只測示範controller與既有model接合，沒有渲染上述畫面。
