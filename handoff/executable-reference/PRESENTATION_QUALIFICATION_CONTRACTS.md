# Presentation qualification contract

UI 模組可以沿用或自行提供 widget，但只收到 snapshot/context 的查詢投影；WidgetRegistry 不持有可編輯 Graph 副本，不含 DOM。DisplayServices 提供翻譯與文字測量，具體平台字體/overflow/IME行為留給renderer，不能用假measure證明實體Safari像素一致。

Widget註冊依ID拒重，保存definition的detached shallow object；受信任callback不能被當sandbox。輸出必為有限JSON，缺widget回不可操作placeholder，disposed context拒絕。theme/preferences/locale影響投影，不改Graph或History。Preferences持有獨立有限JSON，更新/restore先驗整份再一次發布，失敗保留舊值；返回副本，未知擴充欄位保留。StorageAdapter可保存其serialize結果；本模型未證明瀏覽器持久存儲。

## PF-01：Parameter presentation 不是只有 number/menu

原 `ParameterSpec.presentation: 'number'|'menu'` 不能讓節點模組合法宣告 bool/color/matrix/custom widgets。既有一般 WidgetRegistry 只接受 snapshot/primary，也沒有參數值／型別／呈現描述的接合點，不能用它的存在推論這個缺口已被涵蓋。`presentation-contract-probe.ts` 的三份合法需求在舊契約 typecheck 出现 TS2322；原始輸出保留於 `architecture-coverage/qualification/presentation-contract-red.txt`。

本輪追加的實驗決策：

```ts
interface ParameterPresentation {
  widget: string;                 // UI registry ID，不是 GLSL type
  options?: Record<string, Json>; // 純資料，不可放 DOM 或 callback
  fallback?: 'auto' | 'none';     // default auto
}
```

舊字串保持兼容，等價於 `core.number` 與 `core.menu`。模組可以宣告 `core.boolean`、`core.color`、`core.matrix` 或自己的 registry ID，無需修改核心 union。`Parameter.spec` 每次仍查詢當前模組及 schema，檢查描述為合法有限JSON並返回隔離複本。min/max/clamp 不搬進Widget，不更改既有純量clamp語義；分量範圍／曲線色域不在本輪實驗中冒稱已完整實作。

## ParameterWidgets 的完整責任

| 面向 | 契約 |
| --- | --- |
| Ownership | Node/Parameter擁有編輯入口規格，Port/TypeEnvironment或module state codec擁有資料型別與合法性；ParameterWidgets擁有UI實作登錄，沒有自己的可編輯Graph或current value副本 |
| Precondition | context有效、node/parameter仍存在；input target必須仍有該port；presentation必須合法JSON。Widget若不支援此dataType不能假裝可用 |
| Projection | input型別透過共用TypeEnvironment解析，不重新建立另一套GLSL型別檢查器。state target沒有GLSL type，僅供Widget查詢JSON值形狀，其合法值仍由module state codec判斷 |
| Fallback | 先找requested widget並檢查accepts。缺失、不相容或project拋錯时，auto使用安全builtin numeric/boolean/text/vector/matrix；沒有可用通用編輯器則readonly。none直接readonly。原requested descriptor/options與值完整保留，附notice，不偷偷改寫Graph裡的定義 |
| Mutation boundary | project拿到deep-frozen detached ParameterProjection，只產出有限JSON。UI想寫值必須走Parameter.write/Editor操作；widget畫成toggle並不授權把bool改成數字或vec3補成vec4 |
| Failure | descriptor不合法、context已關閉、schema移除，拒絕投影；Widget本身失敗可fallback，保留錯誤notice。未知style不造成資料丟失。connected input顯示writable=false；真正寫入仍由模型驗證，UI flag不是安全邊界 |
| Notifications | 投影與樣式override不發Graph通知。成功Parameter.write才經Graph原有變更／Operation通知；錯誤寫入無mutation、無History |
| Identity/lifetime | registry ID指向本UI runtime module；NodeType ref及Parameter target才指向模型。不能快取舊ParameterSpec越過dynamic ports更新。context dispose立即停止使用，widget removal可降級而不是刪data |
| Undo/Redo | UI樣式override沒有Graph Undo；編輯資料仍是Graph操作。矩陣修改整個typed value再由原Graph History還原。Widget不能自行保存另一個Undo值快照 |

目前 builtin projections：number、boolean、text、menu、components、color、matrix、readonly。它們是renderer-neutral JSON，不是產品畫好的DOM控件；Matrix投影明确column-major及rows/columns。自訂Widget可使用自有body資料，但自訂JS仍是受信任模組，不是sandbox。

PQ04驗bool/color/matrix、style override不改GLSL/History；PQ05驗缺／錯widget安全fallback與descriptor/值保留；PQ06驗自訂widget重用、隔離及失敗fallback；PQ07驗型別拒絕、matrix寫入Undo、menu codec、dynamic stale handle；PQ08驗connected input與context lifetime。8項PQ模型案例皆執行通過，沒有宣稱真DOM、瀏覽器色彩/IME/字體、TD矩陣控件或完整產品UI已驗證。

Actions 是 Editor操作入口的共用dispatcher，不是Graph第二層修改器。Menu/keyboard/button可以調同action。readonly、IME、text focus、busy、disposed先阻擋；真正資料變更仍經EditorContext.change/Graph Operation。純查詢UI可走projection或另設不寫模型action，不能因這個簡化寫入dispatcher把help/scroll在readonly時一概禁掉。

PQ01–03驗證projection隔離、可替换翻譯/measure、missing widget、preference原子驗證/保存/unknown、observer隔離與共用修改guard。沒有重做精確搜尋排名、layout像素、文字換行、觸控辨識或任一瀏覽器原生widget；相應leaf evidence不得以此冒充完成。這是能安放這些產品規則的共用界面驗證。
