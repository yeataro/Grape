# S06 本輪修正 — 操作指南

版本：S06-debug-30c8679。Implementation I：30c867945c992d25956a2a32825de34571f7749e。

本版已完成必要自測，依 Human 指示先交本人看 localhost，尚未經 AI 獨立審查，也未取得 S06 驗收。Coordinator 收件後提供新入口；既有 4202 等站仍是各自舊版本。

- 先看左上品牌列的版本是否與上面一致；「本輪更新」可讀摘要，Escape 關閉。
- 新開空白文件直接 Generate GLSL：Image Output 未接線可正常產碼，輸出 RGBA (0,0,0,0)，alpha 也是 0。這裡是產碼工具；透明黑的實際數值已由 WebGL2 自動讀回確認，UI 不冒充像素預覽。
- 舊文件例子：[required-image-output.grape.json](samples/required-image-output.grape.json)。Project actions → Open file 選它 → Review document → Open in new session。舊版仍顯示 INPUT_REQUIRED。Project actions → Upgrade Image Output（有未存變更時先按既有提示處理）才明確轉成新定義；再 Generate GLSL 即成功。Save／Export JSON 後重新 Open file，版本與內容保持。此升級建立新 load，不是假裝成一次 Undo 的替換。
- 已接線新文件：[sample-color.grape.json](samples/sample-color.grape.json)；另有 [Float](samples/sample-float.grape.json)、[Vector2](samples/sample-vec2.grape.json)、[Vector3](samples/sample-vec3.grape.json)。同樣用公開 Open file → Open in new session 載入。
- 從 Output 圓點拉線到 Canvas 空白放開，在相容節點清單**單點名稱**，立即於原落線位置新增並接線；不需再拖或第二次放置。可先平移／縮放，或移動清單，再確認落點。Undo／Redo 各一次恢復整筆。
- 從**已接線 Input** 圓點拖到空白放開，即斷線，不開新增清單；Undo 一次恢復。拖到視窗外、Escape 或取消不斷線。
- 接到已占用的 Input，預設不必 Shift 即 Replace；Undo 一次恢復舊線。可配置關閉是應用組合參數，不是本輪新增設定畫面。
- 實線、暫時線及建立預覽使用同一平滑曲線；socket 保持型別色實心本體，hover／目標以不同強度的柔和紫色提示，沒有額外 Replace 圈。
- 一般點 Node 標題後按 F2，應顯示該 Node；Tab 到其他控制項／Port 後 F2 顯示當下鍵盤焦點。滑鼠偶然停在另一物件不換目標。Close／Escape 返回有效焦點；普通 hover 提示仍在，沒有診斷 hover 勾選列。
- 底列在窄／寬視窗均貼底占满寬度；Shader output、Hints、Project actions 可按需展開，Escape 收回，保留完整狀態與適用 Locate。收合不留額外空白區。

範圍限制：不含 OC11 選取層級、右鍵 socket 跟隨滑鼠再放置、OC09 自動產碼、general Add/Browse 改造、多工作區／全 catalog／native Host。舊接受文件與 pin 不被偷偷更新。自測使用 Windows Chromium151／SwiftShader 同機 loopback；未宣稱所有 GPU、實體裝置或 IME。LAN／Tailscale 義務已由 Owner 移除，歷史未執行與原拒絕維持。
