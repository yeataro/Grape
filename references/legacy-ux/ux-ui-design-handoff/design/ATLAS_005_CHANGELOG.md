# ATLAS-005 / CANVAS-005 — 畫布操作交接補齊

2026-10-03；人類審查草稿。沒有變更 IH-005、新產品 Repo、功能預覽版程式碼、產品需求 Gate 或 implementation slice。

## 新增交付

- [集中操作規格](CANVAS_INTERACTION_SPEC.md)：20類行為、起手式／modifier／門檻、命中優先、完成與取消、相機／選取／圖版面／History／保存邊界。
- [機器可讀驗收](CANVAS_ACCEPTANCE.json)：20個 UX-only stable cases、7組有界live觀察、7個OPEN；不是Migration LC清單或產品PASS證書。
- [圖冊](../atlas/index.html#canvas-operations)：五張靜態SVG artboards（相機與內容、游標錨點、雙向框選、gesture生命週期、導航）。不發明一個假產品畫布引擎。
- [NAV](../research/canvas-navigation-evidence-005.md)、[SEL](../research/canvas-selection-evidence-005.md)：限定Legacy唯讀查證，含精確來源行號及未執行的test intent。
- [LIVE](../research/canvas-live-005.md)：實際0.8.273測試圖的七組desktop UI觀察，node移動已Undo回原位。

## 更正而非新增功能

1. Esc不退出Focus graph；修改舊交接摘要並保留原觀察作歷史。
2. 左右兩方向框選皆intersection，沒有containment分流；Shift啟動框選不等於加選，Ctrl/Cmd才保留舊集合。
3. MMB是Dolly；Home立即、Frame有獨立動畫。Node direction navigation可Center，但Link箭頭用Frame。
4. Node drag≥3px、marquee release>3px、touch≥8px不可混用；24-unit snap與視覺網格密度分開。
5. 普通node drag不冒領Group的wheel/hidden/其他pointer取消保障。mouse pan、marquee、Dolly、touch不能統稱一種rollback。
6. Ctrl/Cmd+Down選連通分量以外的所有節點，不只孤立／未接線節點。
7. Current source阻尼default-on與一支舊測試default-off衝突被具名保留；沒有偷偷修Legacy測試或把test intent算PASS。

## 證據及scope

Live序列涵蓋：空白pan、F/Home、Focus/對Esc的反應、雙向partial marquee、wheel錨點、node drag/Undo/Redo、Shift toggle/空白clear。未驗MMB硬體、真touch/pen/CEF/IME、完整capture/context loss、readonly/reload與跨scope回復。書面規則有source支撐；未做的測試仍未做。

Coverage revision7→8，原65項ID保留；49項有observed claims、75 observation mappings；full required-sequence qualification仍0。這些數字不是75個獨立測試，更不是Legacy618功能的完成數。

## 檢查與重現

於交接目錄執行：

```text
python atlas/build.py
python atlas/check.py
python check-material.py
python check-canvas.py
node atlas/check-atlas.cjs
node atlas/check-fields.cjs
node atlas/check-links.cjs
node atlas/check-groups.cjs
node atlas/check-arrange.cjs
node atlas/check-color.cjs
```

以上是離線材料一致性與既有圖冊local demo regression，無產品連線／寫入。最新實際結果記在[canvas verification](../research/canvas-verification-005.json)；舊verification.json報告仍保留歷史，最新欄位指向本次記錄。live觀察與圖冊檢查分開，不把文件build成功當成產品行為qualification。

## 同日人類 review 小修正：Parameter 底色與排列圖示

- 第五章的樣本明確標為「浮動 Inspector」，內容底色從側欄的 `#1B1B23` 改回產品浮動 Parameter 的 `#2E2C3A`；欄位維持 `#42404F`，標題列與其他展示區不變。唯讀依據：Legacy `src/editor/style.css:883` 的浮動內容 surface 與 `:2202–2203` 的 dark palette；側欄 `:309` 使用另一個 surface。這不是把所有 Panel 強制改成同色。
- Arrange 選單補回產品已有的全部 11 項 SVG 圖示：六種對齊、兩種等距、兩種自動排列及格狀排列。路徑依據 `src/editor/selection_ui.js:72–89`；16px 圖示、1.75 線寬、round cap/join 依 `src/editor/style.css:445`。不是新增圖示風格或排列功能。
- Source 區塊依人類指示暫不調整。只修改圖冊材料；產品及唯讀重構 Repo 未修改。此為 ATLAS-005 的 review 修正，無新增行為或驗收範圍。檢查結果另列於兩份 `verification.json` 的 `latestVisualCorrection`，不覆寫先前 Canvas 驗證紀錄。
