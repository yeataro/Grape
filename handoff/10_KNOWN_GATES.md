# Known gates：已知未知、決策與證據門檻

這份交接繼續保留 **33 UNKNOWN（13 significant）、8 Product Decision Required leaves**，原问题仍未解除，沒有更動 CQ-001。Panel/scoped Inspector 的契約自 IH-002 起陸續修補，view/mount seam 自 IH-004 納入；目前 production runtime 仍未驗證，既有 extension Gate 保持 **contract-qualified-runtime-unverified**，本修訂依自己的 regression／fresh review 判定契約。IH-005 另採用 [DEC-GRAPE-001](provenance/product-decisions/DEC-GRAPE-001.md)：G-MIXED-HISTORY 的有效狀態為 `DEFERRED_BY_PRODUCT_DECISION`；LC-UI-100 的 CQ Partial 與原 oracle 保留，安全 Gates 不被解除。Gate不是全面停止指令；每項有明確 blocks、doesNotBlock、最早時點與所需證據。

機器可讀真值：[data/gates.json](data/gates.json)。共 **46條gate記錄**＝33個原UNKNOWN＋5個產品決策view＋8個handoff風險（含1個HC-001來源摘要衝突及 IH-003 的 document stability commitment）。5個產品view是4個原UNKNOWN的別名視角，不是新增5個UNKNOWN；兩個native-window action故意分開決定。

## 門檻與關閉規則

P＝planning；S＝對應行為/相容契約定案，先於依賴該選擇的實作；I＝第一個相關integration可行性，先於擴大依賴或正式資料；R＝對應功能/平台驗收。C/D項可在相關slice內實作並取得證據，不能要求先完成整個產品才准開始。產品B不應在行為寫死或資料丟失後才補決定。

| 分類 | 解讀 |
|---|---|
| A | 已證必要架構契約不能成立；停止受影響依賴並提交反例/architecture change。此包沒有新增已證實的全域A。 |
| B | owner必須決定成功/拒絕/可見/權限範圍。 |
| C | 缺真環境證據；在首個相關integration或相應驗收取得。 |
| D | 對應capability實作/組合契約/演算法與驗收工作。 |
| E | 不阻planning；不代表已解決或可跳過其他門檻。 |

若adapter證明無法履行必要契約，或既有owner/依賴方向不能表達必需行為，才升為A。不得把未知寫成已錯，也不得把模型可表達寫成實機必成功。關閉gate需要可核對的證據或owner決策、受影響ID與baseline revision；原有IR/AC/CQ封存檔不覆写。

## 33個原UNKNOWN

完整capability membership、原問題、原缺資訊與完整required evidence保存在本包JSON；以下亦列可獨立閱讀的每項scope。

### G-LU-DATA-001

**原UNKNOWN：** LU-DATA-001；**重要性：** provisional，仍unresolved；**類別：** C/D/E。

**行為未知。** 未修改的 JS fixture 缺 URLSearchParams，哪些完整交易斷言在真實瀏覽器仍成立？

**受影響能力。** LC-DATA-008–009、LC-DATA-046；相關slice：S02、S03。

**架構影響。** Does not change owner or dependency boundary; exact environment/behavior evidence stays open and bounded qualification is separate.

**最早關閉時點。** 對應slice的I/R；若觀察結果改變產品成功/拒絕範圍，需在S定案

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 在完整browser globals的隔離瀏覽器執行同cases；保留本輪失敗，不能用讀碼冒充通過。 本輪test_import_ui.js/test_editor_edits.js在初始化即失敗，尚未到待驗斷言。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-DATA-002

**原UNKNOWN：** LU-DATA-002；**重要性：** provisional，仍unresolved；**類別：** C/D/E。

**行為未知。** 各支援瀏覽器生成PNG影像與帶metadata檔案是否完整往返？

**受影響能力。** LC-DATA-006–007；相關slice：S02。

**架構影響。** Does not change owner or dependency boundary; exact environment/behavior evidence stays open and bounded qualification is separate.

**最早關閉時點。** 對應slice的I/R；若觀察結果改變產品成功/拒絕範圍，需在S定案

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 各browser導出含大圖、多byte註解、嵌套子圖的PNG，重讀比較graph與CRC。 本輪未啟動實際Canvas/browser並產檔；browser腳本或來源僅支持預期。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-DATA-003

**原UNKNOWN：** LU-DATA-003；**重要性：** provisional，仍unresolved；**類別：** C/D/E。

**行為未知。** TD各版本及macOS對原生來源與遷移的實際一致性？

**受影響能力。** LC-DATA-016、LC-DATA-018–019、LC-DATA-021、LC-DATA-023、LC-DATA-039、LC-DATA-053、LC-DATA-055、LC-DATA-057；相關slice：S04、S08、S09。

**架構影響。** Does not change owner or dependency boundary; exact environment/behavior evidence stays open and bounded qualification is separate.

**最早關閉時點。** 對應slice的I/R；若觀察結果改變產品成功/拒絕範圍，需在S定案

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 在已聲明TD版本逐項執行tests/td對應測試，記錄renderer/OS與實際bindings。 本輪沒有live TD；宿主腳本與Windows歷史測試不是跨平台實測。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-DATA-004

**原UNKNOWN：** LU-DATA-004；**重要性：** provisional，仍unresolved；**類別：** C/D/E。

**行為未知。** 已重現Unicode轉義計量造成額外容量限制；host／paste各入口是否還有不同界線？

**受影響能力。** LC-DATA-056；相關slice：S02、S03。

**架構影響。** Does not change owner or dependency boundary; exact environment/behavior evidence stays open and bounded qualification is separate.

**最早關閉時點。** 對應slice的I/R；若觀察結果改變產品成功/拒絕範圍，需在S定案

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 构造ASCII、中文、非BMP接近限制的圖，对inspect、paste、host apply/export比對拒絕位置。 inspect→compile已實測ASCII／CJK／非BMP，限制差異確定存在；尚未覆蓋每個host、paste、export入口及完整邊界矩陣。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-DATA-005

**原UNKNOWN：** LU-DATA-005；**重要性：** provisional，仍unresolved；**類別：** C/D/E。

**行為未知。** 目前Fresnel/Facing/Mapping/Rim Light roundtrip tests的Stage目標不符是否僅限fixture建構？

**受影響能力。** LC-DATA-028、LC-DATA-038–039、LC-DATA-042；相關slice：S04、S05。

**架構影響。** Does not change owner or dependency boundary; exact environment/behavior evidence stays open and bounded qualification is separate.

**最早關閉時點。** 對應slice的I/R；若觀察結果改變產品成功/拒絕範圍，需在S定案

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 重現每個內建庫入口→放入→compile→personal save，保留具體error位置，不修改舊產品。 本輪Python測試的固定7項庫列表斷言已過時；四個roundtrip案例回stages mismatch。另以正確MAT兩Stage的獨立probe全部14子圖可inspect及personal往返；未驗各個實際wired caller/GPU。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-DATA-006

**原UNKNOWN：** LU-DATA-006；**重要性：** provisional，仍unresolved；**類別：** C/D/E。

**行為未知。** Save在各TD原生專案設定下會使用哪個實際檔名、覆寫或編號策略？

**受影響能力。** LC-DATA-061；相關slice：S08。

**架構影響。** Does not change owner or dependency boundary; exact environment/behavior evidence stays open and bounded qualification is separate.

**最早關閉時點。** 對應slice的I/R；若觀察結果改變產品成功/拒絕範圍，需在S定案

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 在拋棄式TOE以未命名／已命名／numbered-save等設定操作Save，檢查返回值、檔案與未套用draft是否仍保留。 已核對標題列Save及onclick，確認存在UI入口；未呼叫真實project.save以免改使用者檔案，原生API及磁碟結果未實測。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-DATA-007

**原UNKNOWN：** LU-DATA-007；**重要性：** architecture-significant，仍unresolved；**類別：** B/E。

**行為未知。** Personal匯出／載入合法符號陣列子圖的已重現失敗，是刻意限制還是非預期缺陷；還影響哪些交換情境？

**受影響能力。** LC-DATA-028、LC-DATA-038、LC-DATA-042、LC-DATA-047；相關slice：S04。

**架構影響。** Typed symbolic scope remapping required; known legacy failure is not converted into an intentional feature limit.

**最早關閉時點。** S: Personal symbolic-array admission before implementing that success/rejection policy

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 以保留的最小反例及其他literal、source-bound、nested extent逐一往返；明確記錄成功或同樣拒絕。不得用JS重映射的成功推論Python Personal成功。 已證明build與entry重編function ID的兩個scope失敗案例；尚缺產品意圖與所有符號scope型態的邊界矩陣。

**被否證時。** 記錄產品決策及成功/拒絕範圍，不自動選擇；若必需行為不能在既有邊界表達，停止受影響分支並提交Architecture Change。

### G-LU-NODE-001

**原UNKNOWN：** LU-NODE-001；**重要性：** architecture-significant，仍unresolved；**類別：** C/D/E。

**行為未知。** 本次未啟動TD/真GPU，無法以新執行證據確認每個native helper、driver數值邊界與Windows/macOS當前build一致性。

**受影響能力。** LC-NODE-034–042、LC-NODE-045、LC-NODE-053、LC-NODE-061–063、LC-NODE-066–069、LC-NODE-087、LC-NODE-091–092、LC-NODE-183–259、LC-NODE-328–343、LC-NODE-359–360、LC-NODE-371、LC-NODE-383–385、LC-NODE-388、LC-NODE-390–391；相關slice：S05、S08、S11。

**架構影響。** Native helper/build/GPU support is a backend/environment evidence gate; typed lowering placement is provisional and does not certify native signatures/pixels.

**最早關閉時點。** I: first native backend feasibility; R: promised operation/platform matrix

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 在可控宿主fixture逐native節點/overload/stage編譯與像素檢查；需另外授權TD操作。 實際TD、GPU、平台/build矩陣及render像素；歷史docs/test腳本只證明當時記錄或測試意圖。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-NODE-002

**原UNKNOWN：** LU-NODE-002；**重要性：** provisional，仍unresolved；**類別：** C/D/E。

**行為未知。** 所有360命名操作的每種UI編輯途徑，是否都以一致history分組保存並重載？

**受影響能力。** LC-NODE-001–360、LC-NODE-378–391；相關slice：S05。

**架構影響。** All UI edit routes have not been observed in legacy, but Graph Operation/History persistence ownership is independent of which route is used. Provisional mechanism coverage only.

**最早關閉時點。** 對應slice的I/R；若觀察結果改變產品成功/拒絕範圍，需在S定案

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 以根盤點UI/DATA記錄交叉參照；需時逐剩餘操作在隔離editor fixture做edit/export/import/undo，不能把corecompile單測等同UI存儲。 目前可證明params/inputValues為可序列資料、編譯不mutate；已測families可證部分roundtrip/undo，不能以共用code推定每個UI觸發。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-NODE-003

**原UNKNOWN：** LU-NODE-003；**重要性：** provisional，仍unresolved；**類別：** C/D/E。

**行為未知。** Matrix Get/Set越界時的GPU結果不是Array的安全clamp/忽略；是否為欲保留產品行為需另決定。

**受影響能力。** LC-NODE-075–076；相關slice：S05。

**架構影響。** Raw matrix indexing is expressible without inventing clamp; preserve recorded unchecked behavior for qualification. Numerical out-of-bounds result remains unknown, no safety guarantee.

**最早關閉時點。** 對應slice的I/R；若觀察結果改變產品成功/拒絕範圍，需在S定案

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 單獨宿主fixture觀察；inventory只能確立目前code不保護。 各GPU/driver的越界實際反應；此盤點不將其改為安全行為。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-NODE-004

**原UNKNOWN：** LU-NODE-004；**重要性：** provisional，仍unresolved；**類別：** C/D/E。

**行為未知。** 有限Voronoi search stencil在全部輸入、特別Minkowski exponent<1的全域最近點/效能與macOS畫面尚無完整證明。

**受影響能力。** LC-NODE-070；相關slice：S05。

**架構影響。** Voronoi finite-stencil accuracy/performance is module algorithm evidence; it does not select a different owner/state lifetime.

**最早關閉時點。** 對應slice的I/R；若觀察結果改變產品成功/拒絕範圍，需在S定案

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 離線擴大reference搜索半徑對照最壞座標，再另行宿主GPU比較；root可用已存在portabletest結果驗證目前取樣cases。 更廣數值空間reference、實GPU平台與frame成本；不是Blender逐像素一致承諾。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-NODE-005

**原UNKNOWN：** LU-NODE-005；**重要性：** provisional，仍unresolved；**類別：** C/D/E。

**行為未知。** Auto/typed-value等Node VM編輯測試的實際重跑被fixture URLSearchParams缺失阻塞。

**受影響能力。** LC-NODE-369、LC-NODE-376–377；相關slice：S01、S05、S06。

**架構影響。** Legacy fixture initialization failed; new immutable/inference tests do not answer it, while edit/reconcile placement stays the same.

**最早關閉時點。** 對應slice的I/R；若觀察結果改變產品成功/拒絕範圍，需在S定案

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 另用不改snapshot source的fixture環境提供所需Web API，重跑相應測試；本次不修產品來遷就測試。 在等效隔離browser/VM環境完整執行編輯assertions；source顯示的行為不等於本次測試已通過。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-NODE-006

**原UNKNOWN：** LU-NODE-006；**重要性：** architecture-significant，仍unresolved；**類別：** C/D/E。

**行為未知。** 舊baseline指紋/完整輸出不同，無法宣稱所有舊圖結果與早期golden逐字一致。

**受影響能力。** LC-NODE-365、LC-NODE-370；相關slice：S02、S05。

**架構影響。** Old goldens differ. Exact pin/version/diagnostic paths are available; numerical/host binding equivalence remains externally unproved.

**最早關閉時點。** S: legacy revision mapping; I/R: emitted semantics/bindings equivalence

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 針對既有固定fixture對比code/bindings/hash差異，不改產品/重錄golden偽裝通過；真正GPU差異需另行宿主驗證。 baseline變動中何者只有新版shell/meta，何者可能改語意；像素等價尚未全部驗證。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-UI-001

**原UNKNOWN：** LU-UI-001；**重要性：** provisional，仍unresolved；**類別：** C/D/E。

**行為未知。** 目前snapshot在實體iPad/Safari、平台keyboard/Fullscreen/colorpicker及分数contentzoom下的最终操作一致性是否成立？

**受影響能力。** LC-UI-023–024、LC-UI-031、LC-UI-053–054、LC-UI-080、LC-UI-098；相關slice：S01、S06、S10。

**架構影響。** Does not change owner or dependency boundary; exact environment/behavior evidence stays open and bounded qualification is separate.

**最早關閉時點。** 對應slice的I/R；若觀察結果改變產品成功/拒絕範圍，需在S定案

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 隔離副本使用受控實機矩陣，驗PointerEvent/visualViewport/keyboard focus與cancel；保留裝置/版本/scale及可重現記錄。 本轮没有使用真實裝置或使用者瀏覽器，未新跑這些瀏覽器测试。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-UI-002

**原UNKNOWN：** LU-UI-002；**重要性：** provisional，仍unresolved；**類別：** C/D/E。

**行為未知。** 歷史browser測試/文件與0.8.271最新UI defaults不一致时，是否需要更新舊測試？

**受影響能力。** LC-UI-022、LC-UI-060、LC-UI-068；相關slice：S06。

**架構影響。** Does not change owner or dependency boundary; exact environment/behavior evidence stays open and bounded qualification is separate.

**最早關閉時點。** 對應slice的I/R；若觀察結果改變產品成功/拒絕範圍，需在S定案

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 在隔離snapshot跑對應browsertests，分辨fixtureoverride與真實staleassertion。 本文不修產品/測試；尚未執行這些browser套件以確認其fixture是否另設定舊預設。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-UI-003

**原UNKNOWN：** LU-UI-003；**重要性：** provisional，仍unresolved；**類別：** C/D/E。

**行為未知。** 完整readonly/busy/IME cross-product是否每個input與globalshortcut都一致隔離？

**受影響能力。** LC-UI-038、LC-UI-042、LC-UI-057、LC-UI-072；相關slice：S01、S06。

**架構影響。** Does not change owner or dependency boundary; exact environment/behavior evidence stays open and bounded qualification is separate.

**最早關閉時點。** 對應slice的I/R；若觀察結果改變產品成功/拒絕範圍，需在S定案

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 對每個publicaction在readonly/historyBusy/nativeBusy/IME/composition與pendingdraft執行負向矩陣；不得由幾個通過case推斷全部。 已讀共同guard和多個assertion，但未逐一實際跑所有分支／原生IME。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-UI-004

**原UNKNOWN：** LU-UI-004；**重要性：** provisional，仍unresolved；**類別：** C/D/E。

**行為未知。** 桌面marquee pointercancel後，應保留最後preview選取還是還原按下前選取？

**受影響能力。** LC-UI-002；相關slice：S06。

**架構影響。** Does not change owner or dependency boundary; exact environment/behavior evidence stays open and bounded qualification is separate.

**最早關閉時點。** 對應slice的I/R；若觀察結果改變產品成功/拒絕範圍，需在S定案

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 隔離browser重現拖框後pointercancel並讀selection；向產品審查標示可能偶然行為，不偷改成交易式選取。 目前observablesource顯示可留下preview選取；未找到明確產品需求或測試將此定為intent。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-UI-005

**原UNKNOWN：** LU-UI-005；**重要性：** architecture-significant，仍unresolved；**類別：** B/E。

**行為未知。** named layouts超100筆的保留上限是否為使用者可見限制？

**受影響能力。** LC-UI-063；相關slice：S06。

**架構影響。** Preset retention belongs PreferenceStore policy, not graph history; legacy truncation product intent unresolved.

**最早關閉時點。** S: named preset limit/retention policy before writing production data

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 隔離存儲建立101筆再reload，確認截斷及是否持久写回；保留其可能偶然性，不視為產品期待。 未執行101筆save/reload边界；未找到用途说明。

**被否證時。** 記錄產品決策及成功/拒絕範圍，不自動選擇；若必需行為不能在既有邊界表達，停止受影響分支並提交Architecture Change。

### G-LU-UI-006

**原UNKNOWN：** LU-UI-006；**重要性：** provisional，仍unresolved；**類別：** C/D/E。

**行為未知。** 舊inline_vector_values測試是否已完全落後目前固定Vector/Replace拆分，哪些斷言仍適用？

**受影響能力。** LC-UI-087；相關slice：S05、S06。

**架構影響。** Does not change owner or dependency boundary; exact environment/behavior evidence stays open and bounded qualification is separate.

**最早關閉時點。** 對應slice的I/R；若觀察結果改變產品成功/拒絕範圍，需在S定案

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 隔離載入0.8.271catalog重跑該測試，逐斷言對Vector/Replace/Split重新歸屬；禁止僅讀歷史check宣稱目前通過。 尚未實際跑該舊browserfixture判別測試基底的定義版本；目前capability按source固定Vector記錄，舊vector功能不自動算現有。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-UI-007

**原UNKNOWN：** LU-UI-007；**重要性：** provisional，仍unresolved；**類別：** C/D/E。

**行為未知。** GLSL modal validate回應與換圖／快速再次請求競態，能否顯示前一次圖的code？

**受影響能力。** LC-UI-099；相關slice：S06、S08。

**架構影響。** Does not change owner or dependency boundary; exact environment/behavior evidence stays open and bounded qualification is separate.

**最早關閉時點。** 對應slice的I/R；若觀察結果改變產品成功/拒絕範圍，需在S定案

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 在隔離fixture延遲並逆序回validate，request後換graph，觀察modal的code標頭與內容；把差異當既有邊界報告，不在inventory任務修產品。 未實際跑延遲validate+切graph的modal場景；source指出未做相同guard，不能宣稱目前排除了stale。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-UI-008

**原UNKNOWN：** LU-UI-008；**重要性：** architecture-significant，仍unresolved；**類別：** C/D/E。

**行為未知。** Reload Applied確認丟棄後的舊session draft是否會在下次整頁重載再提示restore；load取得state後的後續例外會否留下部分新state？

**受影響能力。** LC-UI-101；相關slice：S08。

**架構影響。** Explicit lifecycle replacement must own draft eviction/history reset and publish after successful validation; old accidental partial-load behavior not relied upon.

**最早關閉時點。** S: discard/reload semantics; I: lifecycle/draft/history composition

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 隔離fixture建立dirty+sessiondraft→確認Reload Applied→整頁reload，查是否再次restore提示；另在state成功後inject受控錯誤檢查部分state，保留真實結果與產品意圖差別。 未新增執行sessiondraft殘留/後段render例外測試，不能把fetch失敗保圖提升成所有reloadfailure都原子回復。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-UI-009

**原UNKNOWN：** LU-UI-009；**重要性：** architecture-significant，仍unresolved；**類別：** C/D/E。

**行為未知。** 若非一般UI入口在live-restore await期間呼load，晚到回覆是否會對新圖呼mark/render？

**受影響能力。** LC-UI-100 的保留 async safety 義務；相關slice：S08／S09。Chronology 延後不解除 publication／Reload Applied／分域 restore 的 lifetime 驗證。

**架構影響。** Async native/live restores require same load/epoch guard; host qualification owns receipt handling.

**最早關閉時點。** S：分域 async restore/propagation 的 lifetime guard，早於相依實作；I：load/epoch/incarnation race，早於 runtime acceptance。DEC-GRAPE-001 延後 chronology，不延後 LU-UI-009；AT-DEC-GRAPE-001-07／10 仍 required。

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 只在隔離fixture延遲live-restore，呼load成功再放回覆，觀察新graph dirty/history/render；若產品不提供該並發入口則記為實作邊界，不改能力意圖。 未新增執行延遲live-restore與外部load交錯；不能以native restore的generation測試代表全部restore分支。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-HOST-001

**原UNKNOWN：** LU-HOST-001；**重要性：** architecture-significant，仍unresolved；**類別：** C/D/E。

**行為未知。** 本次未連TD／GPU／實際瀏覽器與多平台：原生渲染、冷啟動、刪manager後獨立性、相容版本與遠端實機完整性尚未再證實。

**受影響能力。** LC-HOST-002、LC-HOST-004、LC-HOST-007、LC-HOST-017、LC-HOST-024；相關slice：S07、S08、S10、S11。

**架構影響。** 契約可分離環境，但不證明TD/GPU/瀏覽器/多平台實作成立；保持未通過。

**最早關閉時點。** I: artifact reload/native lifecycle; R: promised platforms

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 另行授權後使用隔離fixture分別測實機渲染/TOX冷重載/manager移除／重新加入、appwindow與LAN裝置；保留TDbuild、OS、GPU與像素/identity結果。 当前TD/macOS/iPad/Windows實機回報及保存重載完整測試；歷史文件不是本次執行。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-HOST-002

**原UNKNOWN：** LU-HOST-002；**重要性：** architecture-significant，仍unresolved；**類別：** B/E。

**行為未知。** 單一非同managerID fallback採用目前是刻意產品行為還是相容意外？

**受影響能力。** LC-HOST-001；相關slice：S07。

**架構影響。** 跨不同manager身份採用需要明確產品範圍；Identity fence禁止把此fallback一般化。

**最早關閉時點。** S: cross-identity adoption policy before implementing fallback

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 在隔離工程以舊Shader+同ID/異ID一個/兩個manager逐例記錄OpenEditor結果及原資料是否改變；在確認前保留現行行為但不作任意adoption承諾。 較新需求／跨管理身分恢復的實機驗證與限制。

**被否證時。** 記錄產品決策及成功/拒絕範圍，不自動選擇；若必需行為不能在既有邊界表達，停止受影響分支並提交Architecture Change。

### G-LU-HOST-003

**原UNKNOWN：** LU-HOST-003；**重要性：** provisional，仍unresolved；**類別：** D/E。

**行為未知。** 舊連線／live文件與現行runtime不一致，文件不能用來縮限或加強實作規格。

**受影響能力。** LC-HOST-008、LC-HOST-039；相關slice：S07、S09。

**架構影響。** 目前行為已知：可選token default off、外部Bind終端Constant可寫；不需重新問架構。新契約明確保留。

**最早關閉時點。** R: publishing connection/live behavior documentation; current recorded runtime semantics already usable

**阻止。** 將舊文件的always-token／owned-Bind-only說法當作現行產品oracle；宣稱新手冊已與當前實作行為一致。

**不阻止。** 依IR已確認的可選token default off與外部Bind終端Constant可寫行為實作。 HostDirectory/NativeDefinitions邊界與無關slice；這不是連線或Bind的額外未知產品政策。

**需要的證據。** 以目前程式及對應測試已列出的行為為inventory；未經產品決策不把歷史always-token／owned-Bind-only當要求。 對外手冊是否已在別處更新；不是現行程式分支未知。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-HOST-004

**原UNKNOWN：** LU-HOST-004；**重要性：** architecture-significant，仍unresolved；**類別：** B/E。

**行為未知。** native-viewer按鈕現在隱藏但API保留，native-parameters又可遠端觸發本機視窗；何者是目前正式對外入口？

**受影響能力。** LC-HOST-021–022；相關slice：S07。

**架構影響。** Window action可各自授權/顯示；不能由架構擅自統一兩API的remote規則。

**最早關閉時點。** S: each native-window action visibility/access scope

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 先由目前可觀察UI與API分别記錄；在真正產品決策前不把隱藏視為刪除能力，也不保證LAN開nativeparameters是預期。 按鈕隱藏與API授權scope的已確認產品意圖；不可自行補新授權設計。

**被否證時。** 記錄產品決策及成功/拒絕範圍，不自動選擇；若必需行為不能在既有邊界表達，停止受影響分支並提交Architecture Change。

### G-LU-HOST-005

**原UNKNOWN：** LU-HOST-005；**重要性：** architecture-significant，仍unresolved；**類別：** C/D/E。

**行為未知。** Apply在宿主异常导致rollback本身也失败時，能否完全恢复原生資源尚缺實證。

**受影響能力。** LC-HOST-015；相關slice：S08。

**架構影響。** 補indeterminate/quarantine可誠實表達宿主故障；不將未證明的rollback承諾改稱保證。HQ-06僅模型。

**最早關閉時點。** I: first native commit/failure/readback, before extending dependent publication work

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 只在隔離TD fixture注入候選失败、正式configure後失败、restore本身失败，核對lastgood與明示錯誤；不把正常exception路徑證據外推到宿主全面失效。 configure／restore階段故障注入，以及原生Par/OP與state/codemetadata的對照。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-HOST-006

**原UNKNOWN：** LU-HOST-006；**重要性：** architecture-significant，仍unresolved；**類別：** C/D/E。

**行為未知。** Viewer參數直接寫入的nativeUndo與各camera參數在TOE重載後的保留範圍未由目前檢查確立。

**受影響能力。** LC-HOST-029；相關slice：S10。

**架構影響。** Viewer input能宣告undo/persistence支持；實際支持範圍未知，不能繼承GraphHistory或CustomControlHistory。

**最早關閉時點。** I: Viewer write/Undo/persistence

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 隔離MAT/TOP viewer逐型別改值、TDUndo/Redo、保存重載並比較；只證實相應controls，不能概括所有viewer。 原生viewernavigation與parameters變更的實機Undo/保存重載結果。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-HOST-007

**原UNKNOWN：** LU-HOST-007；**重要性：** architecture-significant，仍unresolved；**類別：** C/D/E。

**行為未知。** custom-control typed native Undo案例未完成：本次portable suite先因mock Par缺style出錯。

**受影響能力。** LC-HOST-046、LC-HOST-051；相關slice：S09。

**架構影響。** HQ-12證明新CAS機制，不修復也不替代legacy未到斷言的typed Undo測試與TD native證據。

**最早關閉時點。** I: typed native Undo

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 不改本次產品；记录evidence/portable-01.log67–82的AttributeError。未來在獨立驗證fixture補完整原生Par契約後重跑，另外做真TD型別切換Undo。 該測試修復fixture後callback對新type的斷言結果；以及實機原生行為。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-HOST-008

**原UNKNOWN：** LU-HOST-008；**重要性：** architecture-significant，仍unresolved；**類別：** C/D/E。

**行為未知。** 沒有serviceworker/PWA執行證據；無宿主時前端首次／重新載入與編輯是否可用不能從離線提案推定。

**受影響能力。** LC-HOST-061；相關slice：S12。

**架構影響。** 內嵌assets與獨立PWA分開；不把manifest當offline implementation。

**最早關閉時點。** I: embedded assets/bootstrap; independent PWA not automatically required

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 在必要證據缺失時將相關leaf稱為完整驗收。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 檢查發佈包以及實際網路請求，分開阻外網、停TD、清browsercache首次載入三情境；目前只記已實作的內嵌資產服務，不承諾PWA。 真正發佈包可離線啟動的瀏覽器驗證；當前證據只涵蓋host存活且資產內嵌。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-AUDIT-001

**原UNKNOWN：** LU-AUDIT-001；**重要性：** provisional，仍unresolved；**類別：** C/D/E。

**行為未知。** binary TOE／TOX 內是否有與外部src不同、未映射出的現行行為？

**受影響能力。** 非單一leaf；見完整性／擴充承諾scope；相關slice：S10、S11。

**架構影響。** 二進位內容若另有行為會改coverage集合；此輪禁止重查legacy，不能聲稱已排除。

**最早關閉時點。** S/I: affected embedded scope; R: declared complete replacement/platform promise

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 宣稱Legacy已窮盡或對未解析內容作完整替代保證。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 在隔離TD專案載入已捕捉二進位並唯讀列出DAT、參數、callback、storage與remote viewer網路，對source hash和行為比較。 本輪沒有把原生TD二進位網路／內嵌DAT逐一抽出比較，也未讀目前running TD。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-AUDIT-002

**原UNKNOWN：** LU-AUDIT-002；**重要性：** provisional，仍unresolved；**類別：** C/D/E。

**行為未知。** 現行平台、TD版本、GPU與瀏覽器的完整適用範圍？

**受影響能力。** 非單一leaf；見完整性／擴充承諾scope；相關slice：S05、S06、S07、S08、S09、S10、S11、S12。

**架構影響。** 三profile只做抽象邊界模型測試，非多OS/GPU/觸控/網路真實驗收。

**最早關閉時點。** S/I: affected embedded scope; R: declared complete replacement/platform promise

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 宣稱Legacy已窮盡或對未解析內容作完整替代保證。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 依每capability Environment Assumptions於矩陣環境跑對應驗收，記錄renderer、TD及browser build；歷史報告不能代替此版本結果。 只有本次Windows portable執行。macOS/Metal、iPad Safari、觸控筆、真實WebRTC、frame-time、native GPU行為未實測。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

### G-LU-AUDIT-003

**原UNKNOWN：** LU-AUDIT-003；**重要性：** provisional，仍unresolved；**類別：** C/D/E。

**行為未知。** 剩餘歷史golden fingerprint差異是否全部是已知刻意變更？

**受影響能力。** 非單一leaf；見完整性／擴充承諾scope；相關slice：S02、S05。

**架構影響。** 既有golden差異未分類；不能以新core測試綠燈認定計算等價。

**最早關閉時點。** S/I: affected embedded scope; R: declared complete replacement/platform promise

**阻止。** 對應capability中由此未知決定的成功/拒絕、相容或runtime承諾；不預設阻擋slice所有分支。 宣稱Legacy已窮盡或對未解析內容作完整替代保證。

**不阻止。** 有界planning。 不依賴此未知的slice或同slice其他已定分支。 取得證據所需的隔離integration實作；不得據此操作正式使用者資料。

**需要的證據。** 按portable-01.log逐案比較當前生成GLSL／bindings與fixture，分辨可讀符號、版本、真實計算或相容性變動，再由產品意圖判定。 未有逐差異核准產品決策；不能單由hash不同推論輸出錯，也不能忽略。

**被否證時。** 保留反例/版本/輸入；不得改oracle或假裝通過。若僅adapter缺陷則修該實作；若必要契約在既有邊界不可表達，升A並停止受影響依賴；新legacy行為須新IR/CQ修訂。

## 8個產品decision leaves／5個決策view

這些是原UNKNOWN的產品問題視角，不是本包代選答案。

| Gate | 原UNKNOWN | Capability IDs | 必須決定 | 可延後到 |
|---|---|---|---|---|
| G-PD-1 | LU-DATA-007 | LC-DATA-028、LC-DATA-038、LC-DATA-042、LC-DATA-047 | Personal符號陣列的接受範圍 | 對應 S04 的S；無關slice可平行 |
| G-PD-2 | LU-UI-005 | LC-UI-063 | Named presets超100筆retention | 對應 S06 的S；無關slice可平行 |
| G-PD-3 | LU-HOST-002 | LC-HOST-001 | 唯一異ID manager adoption | 對應 S07 的S；無關slice可平行 |
| G-PD-4A | LU-HOST-004 | LC-HOST-021 | Native Viewer正式入口可見性 | 對應 S07 的S；無關slice可平行 |
| G-PD-4B | LU-HOST-004 | LC-HOST-022 | Native Parameters遠端開窗scope | 對應 S07 的S；無關slice可平行 |

- **PD-1**：明列Personal符號陣列限制、承諾完整remap，或依format/version列subset；三者需要不同的接受/拒絕與往返oracle，不能只通過checksum。
- **PD-2**：保留load截斷、明確最多100並拒絕/替換，或改採storagequota；是否改變legacy行為及保存成功意義必須記錄。
- **PD-3**：保留自動cross-ID adoption、要求明確選擇/確認，或不提供fallback；任何選擇都不讓候選唯一自動成為writeauthority。
- **PD-4A**：Viewer API-only、提供明確本機UI，或owner明確放棄能力。
- **PD-4B**：Parameters remote action保留、限本機，或需Host本機同意；不能直接繼承Viewer的local-only政策。

## 額外handoff gates

### G-VERSION-COMPAT — Legacy revision→exact pin的compatibility policy

**影響。** Exact DefinitionSet不提供legacy current-emitter fallback；轉換尚未由封存機制證明，不代表一定要改core。

**能力／slice。** LC-NODE-370；S02。

**時點。** S: legacy-version import policy before dependent implementation

**阻止。** Legacy known UUID + unknown revision成功範圍，以及import轉換/拒絕的定案。 **不阻止。** 不依賴此契約的slice及有界planning。

**證據。** 依IR的已知行為給出逐case成功/拒絕oracle、轉換及provenance；取消成功行為需owner決策。

**反證處理。** 反例保留；若須改責任邊界/新增未封存契約則走Architecture Change，不由handoff實作者靜默決定。

### G-MIXED-HISTORY — coordinated chronology 已延後

**有效狀態。** `DEFERRED_BY_PRODUCT_DECISION`；依 [DEC-GRAPE-001](provenance/product-decisions/DEC-GRAPE-001.md)，不是 resolved／Covered／PASS。原 IH-004 gate 與 AT-S09-03 的完整 oracle 在 machine data 的 sourceGateSnapshot／originalAcceptance 保留。

**目前範圍。** LC-UI-100 的 unified chronology 不交付於目前初期 S08/S09/release；不建立 coordinator、partial coordinator、hidden mode、feature flag 或 experimental toggle。S09 改為明確分域 dispatch，不存在全局最近項 fallback。

**仍阻止。** 未有新產品決策就恢復協調式 Mixed History，或以分域 tests 宣稱原 chronology 已驗收。**不阻止。** S08 安全 publication／Reload、S09 分域 Undo 的 planning 與另行授權後實作。

**保留義務。** LC-UI-101 的 Reload Applied／AT-S08-03／G-LU-UI-008 沒有延後；LU-UI-009 的 async live-restore/load 安全仍 unresolved，交 AT-DEC-GRAPE-001-07；Host authority、CAS、receipts、own-domain confirmation／no-op Redo、load/epoch/incarnation 與 receiver fence 照舊。AT-DEC-GRAPE-001-01…10 全為 REQUIRED_NOT_EXECUTED。

**時點與反證。** 只有新的明確產品決策才重議 chronology，屆時先定義 user-intent-level operation 与完整 oracle。當前分域安全反例立即修該責任邊界，不能因 Gate deferred 就略過，也不能為修安全問題偷偷加入 coordinator。

### G-UI-CONFORMANCE — 真UI操作與boundary conformance

**影響。** 沒有新增modelowner；UI必須遵守同一mutation/focus/selection契約。

**能力／slice。** LC-UI-023、LC-UI-031、LC-UI-042、LC-UI-047、LC-UI-053–054、LC-UI-072、LC-UI-084–085、LC-UI-098；S01、S06、S10。

**時點。** I: minimum product UI; R: supported input/device matrix

**阻止。** 把headlessmodel或原型demo等同於最小產品UI交付；未驗平台的interaction承諾。 **不阻止。** 不依賴此契約的slice及有界planning。

**證據。** 實際Canvas/Inspector/actions對同Graph操作、真browser/device/IME/focus/cancel/permission案例。

**反證處理。** 反例保留；若須改責任邊界/新增未封存契約則走Architecture Change，不由handoff實作者靜默決定。

### G-DEPLOYMENT-CONFORMANCE — Static Web / Node-hosted / Electron真部署

**影響。** 平台adapter/bridge可不同，不能靠改寫applicationcore取得平台能力。

**能力／slice。** LC-HOST-002、LC-HOST-008–010、LC-HOST-061–062；S07、S08、S12。

**時點。** I: first declared profile bootstrap; R: each promised package/profile

**阻止。** 宣稱三profile能力相同、所有runtime/permission/Host provider已通過。 **不阻止。** 不依賴此契約的slice及有界planning。

**證據。** 每profile真package/provider/permission/locality矩陣；applicationcore import邊界靜態審查與真啟動互補。

**反證處理。** 反例保留；若須改責任邊界/新增未封存契約則走Architecture Change，不由handoff實作者靜默決定。

### G-EXTENSION-PANEL — Panel public composition：契約已驗，production runtime 未驗

**狀態。** contract-qualified-runtime-unverified。Independent Review B01 接受後，IH-002 補了 [公開 composition 契約](04_EXTENSION_MODEL.md)、[PanelWorkspace executable contract](executable-reference/repair/public-panel-workspace.ts) 與 [canonical minimal-panel](examples/minimal-panel/README.md)。登記、建立、target／restore resolution、Context 訂閱、持續路由、retarget、move、close、dispose 和 placeholder 由同一公開入口完成，不把六種封存 PanelKind 當普通擴充限制。

**能力／slice。** LC-UI-060–061、LC-UI-064；S01／S06。

**時點。** 目前 IH-005 依其封存 qualification／fresh re-review 驗契約；S01 首次 Canvas/Inspector 與 S06 普通 extension 各自取得 runtime evidence。IH-002 為歷史修訂来源，不是本次待執行版本。

**阻止。** 宣稱 production renderer、DOM mount/focus/accessibility、跨平台行為已交付，或本輪自行宣稱 HANDOFF PASS。**不阻止。** Reviewer 直接用公開契約及範例驗普通擴充；未來另獲授權後依此完成 S06，不必再發明 workspace internals。此次不授權 S01。

**契約證據。** [public-panel-workspace.test.ts](executable-reference/repair/public-panel-workspace.test.ts) 與 canonical example 的具名案例；IH-004 的 view/mount qualification 保留為歷史證據。IH-005 另需 [Panel command contract](17_PANEL_COMMAND_CONTRACT.md) 與 [panel-commands.test.ts](executable-reference/repair/panel-commands.test.ts) 的 application-owned edit、Panel instance／mount／lease fencing、gesture／close／cleanup 直接案例，再執行完整 regression 與 targeted independent re-review。本修訂結果以 [IH-005 validation](audit/IH005_VALIDATION.json) 為準，不把舊 qualification 自動算成新契約證據。**仍需證據。** 真實 renderer 的 mount/unmount、focus、事件訂閱清理、late replies、pane/Tab 移動、保存/reload 及可及性驗收。

**反證處理。** 若新增普通 Panel 仍須讀 private state 或改 central type switch，重開 B01，保留反例並修契約／qualification；若只是 production renderer 問題，停止受影響 integration，不搬移 Graph/History ownership。

### G-EXTENSION-WIDGET-SCOPE — Nested Inspector scoped target：契約已驗，production UI 未驗

**狀態。** contract-qualified-runtime-unverified。封存 `ParameterWidgets.project` 的 root-only 限制保留為反例；IH-002 的 [ScopedParameterTarget](executable-reference/repair/scoped-parameter.ts)、`openRouted`、`ScopedParameterWidgets.projectTarget`、`ScopedFieldDraft` 閉合同一 logical target 的 spec/value/type/link/projection/write。Renderer 不遍歷 resources，也不持有另一份 model value。公開契約見 [Extension Model](04_EXTENSION_MODEL.md)，範例見 [widget contribution](examples/parameter-widget-or-ui-contribution/README.md)。

**能力／slice。** LC-UI-042、LC-UI-043、LC-UI-044、LC-UI-046的nested投影分支；S03、S06。不是整個leaf全部被阻塞。

**時點。** 目前 IH-005 契約驗收；產品層仍在 S03/S06 首次真實 Inspector integration，早於 nested 產品驗收。IH-002 的 root/nested 修復 evidence 保留。

**阻止。** 宣稱 production nested Inspector、所有複合控件、browser event／accessibility 已驗；繼續把 sealed root-only projection 當 nested 入口。**不阻止。** Reviewer 驗同一公開 target；未來另獲授權後 S03/S06 接 scoped contract。S01 仍可限定 root 作交付範圍，並非契約只能處理 root。

**契約證據。** [scoped-parameter.test.ts](executable-reference/repair/scoped-parameter.test.ts) 包含 root-only 反例、root/nested、兩 shared-definition occurrences、stale path/load、type/interface/link、navigation ABA、ancestor resource replacement 與 terminal invalidation；canonical widget 直接走相同 API。完整 regression 以 `qualification` 與本修訂 audit 為準。**仍需證據。** 真實 UI 的 retarget/cancel/IME/focus/port mutation 可見狀態及 cleanup，模型案例不能取代。

**反證處理。** scoped spec/read/link/projection/write 若指向不同 logical target，重開 M01，最小修契約並重驗；browser integration 若失敗，修 renderer/事件 composition，禁止另造 canonical value 或 nested-specific UI resolver。

## 不可混為一談的結論

- 缺nativerollback證據不等於必定無法rollback；`indeterminate`只讓失敗誠實可表示，不免除last-good產品承諾。
- unknown revision/exact pin 仍是相應 slice 前置；coordinated Mixed History 已被 DEC-GRAPE-001 延後。各 domain 的 receipt/retry/lifetime 與 Reload Applied 仍須在相應 slice 驗證，不能延到最後 GPU 測試。
- TOE/TOX可能揭露未列能力，影響inventory完整性；目前已知618項仍可做有界planning。新發現必須新IR及affectedcoverage，不靜默擴寫IR-001。
- 真browser/TD/GPU/Electron證據各有scope；Edge/SwiftShader有限probe不認證實體GPU或全部平台。
- Handoff-ready不等於Migration-ready，也不構成開始Migration的授權。

## G-HANDOFF-CQ-OWNERSHIP — HC-001來源責任混寫

未知與影響：CQ部分摘要把Graph mutation列在Generator，或把schema責任者當持久資料owner，另有Legacy Apply後保存前提混入新規則。保留原文，不改封存來源；sourceSummary不能作實作指令。compiled欄位只重述02/03/05/06及本次最高定位。

阻止：消費衝突摘要形成API／持久化／mutation，以及宣稱CQ來源已修正。不阻止：依明定契約的S01及其他分支。最早時點：從S01開始便必須隔離摘要；來源正式修訂可另行進行。

證據：核对HC-001原文、AC契約及明示來源修訂；實作中只讀Generator、Graph独立保存、schema/data owner分離的conformance。若證據顯示實質契約衝突，停止受影響分支並提source/architecture conflict，不能自行搬動owner。完整415-leaf摘要影響範圍在data/handoff-conflicts.json，並非415個功能缺陷。

## G-DOCUMENT-STABILITY-COMMITMENT

**新增產品政策 Gate，未裁定，不是 Legacy UNKNOWN。**

未知的是「哪個 milestone 起、承諾多長時間／範圍的對外文件穩定相容」，不是 format/schema/API。正式技術格式已由 [14](14_DOCUMENT_FORMAT.md) 定義。此 Gate 阻擋未裁定前的 stable format／永久可讀宣傳與依賴該承諾的 release；不阻 internal S01（另行授權後）、本輪 codec qualification 或無關 slice。最早在首次對外發布此承諾前決定。

需要：owner 明確選擇從 S01 起保證，或指明稍後 milestone；記錄承諾範圍，並在該 milestone 保存 fixtures 和驗證 migration。若選更早時點，擴大相容 corpus／轉換驗證；若更晚，也不能默改相同 version 語意、破壞載入或丟掉未知資料。沒有假定 pre-release 已獲 owner 核准。機器記錄見 data/gates.json。

## IH-004：G-EXTENSION-PANEL 時點修正

FIR-B01 所指 view/mount public seam 是 S01 UI foundation 的契約前置，不是可以延到 S06 的 runtime 細節。[16](16_VIEW_MOUNT_CONTRACT.md) 補定契約；兩 Panel／兩 Widget 與 failure/fencing 的 headless qualification 见 [IH-004 當輪驗證](audit/FINAL_REVIEW_REPAIR_VALIDATION.json)。IH-005 在此基礎補入17的 editing Panel 命令 seam，按本修訂直接測試與獨立複驗判定。實際 DOM mount、focus、IME、accessibility、device 行為仍未驗：S01 首次 Canvas/Inspector 與 S06 普通 extension 各自需要對應 runtime evidence。這是同一 Gate 的分層澄清，不以 headless 測試關閉它；其他 Gates 不變。
