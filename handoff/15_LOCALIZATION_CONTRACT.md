# Localization 與模組呈現契約 · IH-003

**規範形狀：本修訂採用，待 Independent Re-review。** 這是 M2 與明確多語言需求的局部補件，不新增 canonical model owner，也不開始產品實作。唯一型別入口：[contracts/localization.ts](contracts/localization.ts)；[public surface](contracts/public-surface.ts) 只重匯出，不能另定第二組 TextRef。執行參考與測試分別在 [localization qualification](executable-reference/repair/localization.ts)、[direct cases](executable-reference/repair/localization.test.ts)。**THIS IS NOT THE PRODUCTION IMPLEMENTATION.**

## 1. 決策與責任

Node 與 Panel 的呈現文字由其模組宣告；application 提供共用解析、fallback 與 UI 通知。新增一個普通節點、Panel 或其語言檔，不需要改中央 label/category/help/search 表、Graph、History 或 Generator。內建模組使用相同契約；只有共用 shell 文案由 `grape.shell` 擁有，不能把 feature 專屬文字塞回 shell。

| 所在處 | 唯一資料／責任 | 不能變成 |
|---|---|---|
| `NodeModule.presentation: ModulePresentation` | 模組文字 owner、default locale、可選模組名稱；與該模組 manifest 精確身份一致 | 全產品 translation catalog |
| `NodeType.presentation: NodePresentation` | label、description、category、searchTerms、help、ports/parameters/actions/diagnostics 的 TextRefs | Node 實例名稱、值或 UI DOM |
| `NodePresentation.ports/parameters` | 以原 schema 的 stable keys 對應 FeaturePresentation；讀 Node definition 即可找文案 | PortSpec／ParameterSpec 另一份可改 label 真值 |
| `PanelType.presentation: PanelPresentation` | Panel 名稱、說明、動作、診斷文字；Panel 實例只投影 | 私有全域 locale 或另一份 Graph |
| feature-owned locale contribution | 特定 owner／locale 的 key→text；獨立 revision、可單独維護語言檔 | 改 Node behavior／port key 的辦法 |
| application LocalizationService | 解析 TextRef、持目前 locale 和 immutable catalog 快照、通知受影響 UI | Graph / document / History / Generator 的一部分 |
| renderer／UI widget | 對 TextRef 取當前顯示文字、重排版及更新搜尋索引；dispose 時取消訂閱 | 用英文句子反查 key、自己找別的模組私有字典 |

`ParameterPresentation` 的 widget/options 是編輯外觀／互動描述；此處的 `FeaturePresentation` 是文字描述，兩者不同。語言切換不能偷改 widget ID、enum 的實際值、Parameter value、port datatype/style、conversion policy 或 GLSL symbol。

### Menu choice 的正式 options convention

`ParameterPresentation.options` 的選單內容採 **`MenuPresentationOptions`**：`{schema:'grape.ui.menu-items.v1', items:[{value, label:TextRef}]}`。這是 feature 提供的 widget options，不是中央 enum/translation 表。整份 payload 必須為有限純 JSON；value 為 string、finite number 或 boolean，items 非空且 value 以「型別＋值」唯一，順序由模組明訂。label 以同一模組 TextRef 規則解析，不能拿翻譯後的 label 當 value/key。Widget 讀 LocalizationService 更新顯示，不讓 Generator 解析翻譯。

Parameter 欄位**標題／help**仍只在 `NodePresentation.parameters[key]`；此處的 labels 是 widget 內**各個選項**的內容，兩者沒有同一文字的雙來源。選項選取仍提交原始 value，codec／模型決定它是否有效。語言切換只重投影label；缺 key 或缺 exact catalog 用TextRef.fallback、保留原value並回notice。沒有合法TextRef、重複value或非有限資料則是options契約錯誤，UI顯示unavailable／notice，不能偷偷改值或選另一項。

舊 `examples/dynamic-interface-node` 的 `handoff.menu-items.v1`＋literal labels是qualification fixture，不是production schema。正式移植須改成上述 `grape.ui.menu-items.v1`＋TextRef；不能以sample convention繼承硬編碼英文字串。[module-localization example](examples/module-localization/example.ts) 的 `modeMenu` 與直接tests示範這條接法。本規格沒有新建另一個metadata owner。

動態接口可以在同一 NodePresentation 中列出各模式使用的 keys；只為當前 schema 中存在的接口投影文案。缺 entry 時用 stable key 作有明確來源的 fallback 並回 UI notice，不發明新接口、不按翻譯後的排序改接線。普通 add-node 目錄、Help 與 Inspector 都讀同一模組呈現資料。Category 的 `id` 不翻譯；`label` 翻譯。搜尋索引可合併目前語言的 label/searchTerms 和既有穩定 type/name，但 locale 變更只能重建 UI 索引，不改模型。

每個產品自有的可見文字位置必須可接 TextRef：標題、label、說明、help、選單項、tooltip、按鈕、空狀態、validation 提示、動作與診斷等。翻譯清單不是中央 API；各 feature 提供自己的 messages。ID、path、數值和使用者輸入不是待翻譯文字，不能因它們也是 string 而自動查字典。

## 2. 身份與可獨立更新

```ts
TextOwnerRef = {
  moduleId, version, fingerprint,
  namespace,      // 固定等於 moduleId；不用顯示名稱
  catalogVersion // 正整數：文字 keys/含意的契約版本
}
TextRef = { owner, key, fallback, params? }
LocaleContribution = { owner, locale, revision, messages: [{ key, text }] }
```

完整 owner tuple 是解析身份；兩個不同精確版本可以同時存在。同 namespace 但另一 version／fingerprint／catalogVersion 不可被自動借用。模組可引用明示的 shell TextRef，但 feature 專屬文字屬自己的 namespace。跨模組共用不是依文字相同猜測，必須明確攜帶該 owner reference。

`fallback` 是必填、非空的安全預設文字；它不是 runtime 的第二份可寫值。Catalog 中每個 key 非空且唯一，text 非空。messages 用 entries 保存重名證據，拒絕 duplicate key；loader 不可先用會覆蓋重名的 parse 邏輯把證據吞掉。語言包所有 entry 驗完才發布。

新增／修正翻譯可獨立增加 locale contribution revision，不需要改 Node 的語意版本、Graph 或 GraphDocument。此 revision 只適用同一 exact owner+locale，不是 NodeType 的 schema migration。刪 key／改含意而破壞舊 TextRef 時，必須變更 catalogVersion 並由該模組顯式更新 reference；舊 Graph 的 pinned definition 仍引用原 owner，不自動轉最新版。發佈工具、下載器和檔案監看不在本次承諾內；開發期 import 新語言 payload 後使用相同公共登記入口即可。

## 3. 公共操作與時序

| 操作 | Precondition / mutation boundary | 成功、通知與失敗 |
|---|---|---|
| `registerModule(presentation, defaults)` | owner 格式及精確身份合法、尚未登記；defaults owner/locale 必須匹配；完整驗字典 | 原子登記模組預設字典後發一次 `catalog` 事件；重複、非法 key/owner/default locale 拒絕，零部分資料、零通知 |
| `addLocale(contribution)` | exact owner 已存在；canonical locale 尚不存在；正整數 revision | 原子新增後發一次 `catalog`；不覆蓋舊語言，不改其他 owner |
| `replaceLocale(contribution, expectedRevision)` | owner/locale 已存在、當前 revision 精確匹配、new revision 較大 | 全包驗完後一次替換並通知；stale／錯誤不發布；不是默認 last-wins |
| `resolve(ref)` | service 未 dispose，合法 TextRef 與純量 params | 同步、唯讀、immutable `{text,source,resolvedLocale,notices}`；缺字典/key走fallback。非法 ref 是明確契約錯誤；缺翻譯不是 Graph model Error |
| `setLocale(locale)` | 可解析的 BCP47 tag；service 未 dispose、非自身通知重入 | canonical base locale 改變後同步發一次 `locale`；同值 no-op；locale 不支援仍允許選擇並用fallback。無 Graph mutation、History 或產碼 |
| `subscribe(listener)` | live service | 返回冪等 unsubscribe；無初始事件，消費者在同一同步回合 capture→subscribe；每事件有單調revision和locale |
| `unregisterModule(owner)` | live service、合法 owner | 只移除該精確文字資料並通知；其他版本不變；仍存在的TextRef用自身fallback，不刪Node、Panel或document |
| `dispose()` | application 擁有 service lifetime；首次非通知重入 | 清自己的catalog/subscriptions；冪等；後續resolve/register/subscribe拒絕。不處置Graph、Panel或外部權限 |

Notification 發生在 catalog／locale 完整發布之後。callback throw 被隔離，不阻斷其他訂閱者、不rollback成功登記。自身通知期間重入修改 service 拒絕；這是 owner-local guard，不是任意 plugin sandbox。UI callback 只重做自己的投影；不能順手寫 Graph、觸發 Undo 或產碼。Panel 自己的 dispose 必須 unsubscribe；取消後不再收到尚未派送的 callback，包括同輪通知中較早 callback 造成的 cleanup。application 關閉時先清其 UI consumers，再清 LocalizationService。

## 4. 確定性的 fallback 和格式化

順序固定為：**requested base locale → 逐層 parent locale → exact module default locale → TextRef.fallback**。重複候選只查一次，不掃描任意可用語言，不跨 owner 猜同名key。例如 `zh-Hant-TW` 依次查 `zh-Hant-TW`、`zh-Hant`、`zh`、模組 default；`ja-JP-u-nu-latn` 的文字選擇 baseName 為 `ja-JP`。每個 key 各自fallback，允許新語言包尚未翻完整。

Locale tags 由 `Intl.Locale` 正規化，無效tag拒絕。`notices` 清楚標出缺 owner、缺 key、語言fallback或缺插值參數；source 標示來源，不把fallback冒稱翻譯完成。Missing module 的 opaque Node 若仍有可用 presentation，使用該 TextRef fallback；若連 presentation 都不存在，顯示 user name／stable type ID／port key。文件不另存第二份翻譯 metadata；任何 fallback 都不代表已找到語意實作或允許生成。

最小 interpolation 只支援 `{name}` 的 string/finite number/boolean params；不 eval、不執行程式碼、不把插入值再次解析成template或HTML。缺參數保留placeholder並回notice；render端仍使用安全文字API。Diagnostic 保留穩定 code/severity/subject/params；messageRef或模組diagnostics map只決定顯示。不能用已翻譯的句子判斷錯誤種類。Host原生error payload、使用者code與路徑保持原文；可附可翻譯的產品說明，但不能改寫證據。

本次**沒有**宣稱完整plural/ICU message grammar、日期／數字本地化、RTL排版、所有語言的字體/IME/可及性或translation管理平台已完成。這些新增能力若需要，應扩充同一公開文字服務且保留既有key/owner/fallback語意；不以本契約假定其已實作。Help目前可提供多段plain text；安全rich content renderer仍為UI實作工作，不准直接將翻譯當可執行HTML。

## 5. Locale、保存與使用者內容

- Locale 屬 application/UI preference；可由既有 PreferenceStore 持久化。不是GraphDocument欄位、不進Graph History、不改圖的dirty/revision，也不強迫Host同步或重新生成shader。跨部署沿同一PreferenceStore capability，沒有把Node/Electron API帶進core。
- NodeType/PanelType保留TextRefs與metadata；模組語言payload從模組載入，不把所有locale dictionaries複製進Graph。Graph只保存原有definition pins與使用者資料。
- 使用者的Node name、label override、notes、Graph名、資源名、path與code保持原文；由明確UI位置選擇顯示default label或user name，不以字串相等猜它是否可翻譯，也不因切語言重命名資料。
- UI可保留翻譯後文字cache，但必須依LocalizationChange更新；cache不是canonical parameter value。Panel自己的private view state不需要另存一份application locale；如果未來有per-view語言override，須明訂額外產品能力，這次沒有偷偷加入。

## 6. 普通擴充的實作入口

1. 在模組旁建立 `ModulePresentation` 及 Node／Panel 的TextRefs，namespace等於模組ID；用stable keys連到現有ports/parameters/actions/diagnostic codes。
2. 提供default `LocaleContribution` 和任意額外locale payload。Bootstrap遍歷模組contributions並登記，不依每個node/panel名稱switch。
3. Node目錄／Help／Inspector從公開definition的presentation取文字；Panel從PanelType.presentation取文字。UI只向LocalizationService解析，不import該模組字典內部。
4. 要增加新locale，在該feature加檔案或更新其translation contribution列表，再`addLocale`。核心shell和其他features不用同步加表；缺翻譯有明定fallback。
5. UI訂閱一次並在dispose取消；語言切換重投影即可。參照 [module-localization example](examples/module-localization/README.md)。此例展示文案與通知，不替代IH-002的PanelWorkspace/ScopedParameterTarget接合契約。

## 7. Direct qualification 與尚存證據缺口

執行：`node --test executable-reference/repair/localization.test.ts`。L10N-01–17直接驗metadata各用途、feature locale獨立新增、parent/default fallback、精確版本隔離、duplicate與malformed原子拒絕、revision CAS、missing fallback、shell/feature分域、真reference Graph/document/History/GLSL不變、pure interpolation、通知重入／例外、cleanup、不可變投影、menu切語言保留enum值與缺翻譯fallback。

初次L10N-10 fixture使用不存在的reference type，遭模型拒絕；修正fixture為現有constant後驗證，不曾放寬模型或localization契約。這是test setup修正，不是architecture反例。

這些測試沒有證明產品所有labels已完成翻譯、translation corpus完整、瀏覽器實際長字換行、JA/CJK/RTL排版或任何framework/DOM integration。真正UI／多語言驗收仍須在對應implementation slice跑；不得用此次qualification關閉那些runtime Gates。

## IH-004 view delivery

Localization ownership／fallback 規則不變。已 mount 的 view 透過共同 UI mount lifecycle 接收 locale invalidation、重新投影；未 mount 時保留 logical state，remount 採最新 locale。shell 與 feature 不新增第二份可寫 locale truth。具體 lifetime/fence 規則见 [16](16_VIEW_MOUNT_CONTRACT.md)。
