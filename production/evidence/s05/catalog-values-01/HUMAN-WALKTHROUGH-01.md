# S05：四個固定值節點

版本：`S05-values-8ffbea9`，實作 I `8ffbea96bdc76e307d59eaa8514f3c6432a7d34d`。這份指南與 `candidate-web-01.tar.gz`、`build-manifest-01.json`、`samples-02/manifest.json` 是同一版本。獨立審查仍待進行；這裡沒有宣稱已部署，也不要求現在重測。審查通過後由「Grape Coordinator」提供核對過版本的入口。現有 4193／4194／4195 不是本批版本。

本輪只有 Float、Vector 2、Vector 3、Color RGBA。舊的「Add Float」仍保留原有行為；本輪新節點請選 **Add Float (fixed)**。其他運算節點、整個 S05、外觀改善及效能優化不在本輪完成聲明內。

## 從空白文件試用

1. 按 **New document**。既有文件若有未保存內容，先另存，或直接使用隔離測試工作區。
2. 按 **Add Float (fixed)**、**Add Vector 2**、**Add Vector 3** 或 **Add Color RGBA**。按節點標題，右側 Inspector 會顯示它的欄位。
3. 確認預設值：Float `0.5`；Vector 2 的 X、Y 都是 `0.5`；Vector 3 的 X、Y、Z 都是 `1`；Color RGBA 的 R、G、B、A 是 `0.55、0.28、0.9、1`。
4. 在各欄輸入數字後按 Enter。可依序試 `0.125、0.375、0.625、0.875`（只填該節點有的欄位）。Undo 應還原最後一次編輯，Redo 應恢復；正在輸入時按 Escape 應取消草稿。輸入 `Infinity` 應顯示錯誤，既有值仍保留。
5. 按節點右側 **out**，再按 Image output 左側 **color**。按 **Generate GLSL**，預期顯示 **Generated successfully · Host-free GLSL**。固定輸出型別分別是 float、vec2、vec3、vec4，不會因為接線改型。
6. 按 **Save**，確認 Saved；重新整理後按 **Open saved**，選剛才的文件。再按節點標題，數值應一致。也可按 **Export JSON**，再由 **Open file → 選檔 → Review document → Open in new session** 開啟，內容應一致。

## 直接開啟範例

以下都是本批隨附檔案。先取得檔案，再用 **Open file** 選取；Review document 應顯示 DOCUMENT_VALID，再按 **Open in new session**。這是獨立開啟，不要求用 Accept replacement 取代模組版本不同的現有文件。

| 節點 | Pixel 範例 | Vertex 範例 | 共用 Function 範例 |
| --- | --- | --- | --- |
| Float | [Pixel](samples-02/float-pixel-root.grape.json) | [Vertex](samples-02/float-vertex-root.grape.json) | [Function](samples-02/float-pixel-function.grape.json) |
| Vector 2 | [Pixel](samples-02/vec2-pixel-root.grape.json) | [Vertex](samples-02/vec2-vertex-root.grape.json) | [Function](samples-02/vec2-pixel-function.grape.json) |
| Vector 3 | [Pixel](samples-02/vec3-pixel-root.grape.json) | [Vertex](samples-02/vec3-vertex-root.grape.json) | [Function](samples-02/vec3-pixel-function.grape.json) |
| Color RGBA | [Pixel](samples-02/color-pixel-root.grape.json) | [Vertex](samples-02/color-vertex-root.grape.json) | [Function](samples-02/color-pixel-function.grape.json) |

- **Function**：按一個 Subgraph 標題，再按 Enter subgraph，選裡面的值節點。改值並保存；另一個共用呼叫也使用同一份值。可按 Second Canvas，從另一個 Subgraph 進入，確認值一致。按 Up 返回。此範例有兩個共用呼叫，不是兩份獨立副本。
- **Vertex**：這些檔案已帶有合法的頂點工作區與 Position 子圖。要從空白頂點工作區新增，可開啟 [vertex-workspace.grape.json](samples-02/vertex-workspace.grape.json)，新增本輪任一值節點，將 out 接到 Position 的 Value 輸入，再 Generate GLSL。這是沿用既有子圖型別轉換，沒有新增 Convert 節點或修改其他 Vertex 功能。
- 舊文件沒有新模組時，不會偷偷加入新模組或改寫舊 Float；新建文件或使用本批範例即可測本輪功能。模組／輸出種類不符時，Replace 的拒絕規則維持不變。

## 已由技術測試確認

224 項單元／一致性測試、108 項完整瀏覽器測試、13 份封存版本的公開操作流程、64 組 WebGL2 編譯／連結／數值回讀均通過。Pixel 使用像素回讀，Vertex 使用 transform feedback 回讀實際頂點分量；Function／Expand／巢狀與預設／修改值均包含。這些自動測試與人工操作確認分開記錄。

限定 Windows Chromium 151／ANGLE SwiftShader 的 portable GLSL ES 3.00 profile。沒有宣稱原生 TouchDesigner、實體 GPU、第二裝置、所有瀏覽器、全部 391 個 S05 leaf 或全域 Gate 已完成。舊的 S01–S04 接受範圍及 S02 legacy converter 限制保留。效能問題仍是 OPEN／DEFERRED，依 Human 指示在本輪完成後另行處理。
