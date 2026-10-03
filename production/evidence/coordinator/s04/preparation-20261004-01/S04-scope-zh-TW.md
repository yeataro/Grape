# S04 工作包草案（未派送、未啟動）

[完整草案](implementer-dispatch-draft-01.json) 保留精確基準、契約、11 組必要驗收、負面案例與環境證據要求。此處只有準備授權，沒有 S04 實作授權。

DEC-GRAPE-002／AC-GRAPE-001 已接受：浮點轉換16組、新 Image Output 接收政策、文件2.1／Edge v2 的保存與相容規則都列為未交付需求，不再要求重新批准同一張表。舊模組 pin、其他 exact 接孔與來源型別保持各自契約。S03 原I/R不因此改變。

待 Human 確认的範圍有兩項：

1. Personal 符號陣列（G-PD-1）：批准 literal／source-bound／input-bound／nested 的逐項成功或拒絕矩陣，或明確把受影響符號分支排除於本次交付。草案未替任何一項作決定，現有失敗也不自動成為限制。
2. 環境／Storage：建議以現有無 Host 的 Windows browser 與 portable package/remap 為有界交付；如要納入 Node、Electron 或 native provider，需指名實際 profile、權限與 runtime 證據。瀏覽器下載、LibraryStore 與文件 StorageAdapter 不可混為同一能力。

既有 AT-S04-01..03 涵蓋 Library 重用／fork／獨立副本、核准 extent 矩陣往返，以及名稱碰撞／壞包隔離／限額。AT-DEC-GRAPE-002-01..08 涵蓋數值、Canvas、原子拒絕、保存版本、nested/clipboard/package 與 exact module identity；全部仍是 REQUIRED_NOT_EXECUTED。

啟動前還須另行完成並核實 S03 發布與合併、重新綁定 accepted main/work、明確授權單一 S04 與指定 writer。沒有新增發布／合併授權；草案不可直接派送。
