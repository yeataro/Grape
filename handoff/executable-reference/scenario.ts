import assert from "node:assert/strict";
import { Registry, Graph, Editor, CanvasView } from "./core.ts";
import { builtinModule, refs } from "./nodes.ts";
import { generate } from "./generator.ts";
import type { Result, StorageAdapter } from "./contracts.ts";

export function unwrap<T>(result: Result<T>): T {
  if (!result.ok)
    throw new Error(`${result.error.code}: ${result.error.message}`);
  return result.value;
}
export async function exercise(adapter?: StorageAdapter) {
  const trace: { step: string; result: string; revision: number }[] = [];
  const registry = new Registry();
  unwrap(registry.register(builtinModule));
  const graph = new Graph({
    name: "Architecture closed loop",
    definitions: registry.pin(),
    outputType: refs.output,
  });
  const note = (step: string, result: string) =>
    trace.push({ step, result, revision: graph.revision });
  const pixel = graph.stage("pixel");
  assert.equal(graph.stage("vertex").record.implementation, "default");
  assert.equal(pixel.nodes.length, 1);
  assert.equal(
    graph.diagnostics.some((i) => i.code === "REQUIRED_INPUT"),
    true,
  );
  note(
    "Graph / Stage 建立",
    "預設 Vertex、Pixel network、受保護的輸出節點一次建立；未供值 Error 可保存",
  );

  const editor = new Editor(),
    left = editor.open(graph),
    right = editor.open(graph);
  const leftView = new CanvasView(left),
    rightView = new CanvasView(right);
  const ids = unwrap(
    left.change("Create fixed and dynamic nodes", (draft) => {
      const constant = draft.createNode(
        pixel.id,
        refs.constant,
        { value: 0.4 },
        "constant1",
      );
      const multiply = draft.createNode(
        pixel.id,
        refs.multiply,
        {},
        "multiply1",
      );
      const compose = draft.createNode(
        pixel.id,
        refs.compose,
        { mode: "color" },
        "compose1",
      );
      draft.setInput(multiply, "b", 0.5);
      draft.setInput(compose, "g", 0.4);
      draft.setInput(compose, "b", 0.6);
      return { constant, multiply, compose, output: pixel.nodes[0].id };
    }),
  );
  note(
    "固定與動態接口節點",
    "同一批建立 Constant、Multiply、Compose；核心不依 typeId 特判",
  );
  const constant = graph.nodeById(ids.constant)!,
    multiply = graph.nodeById(ids.multiply)!,
    compose = graph.nodeById(ids.compose)!,
    output = graph.nodeById(ids.output)!;
  unwrap(
    right.change("Connect", (draft) => {
      draft.connect(constant.output("out"), multiply.input("a"));
      draft.connect(multiply.output("out"), compose.input("r"));
      draft.connect(compose.output("out"), output.input("color"));
    }),
  );
  assert.equal(graph.diagnostics.length, 0);
  const original = unwrap(generate(graph.snapshot()));
  note(
    "connection / GLSL generation",
    "三條有效 Edge；最小 GLSL ES300 成功生成，預期 RGBA = (0.2,0.4,0.6,1)",
  );

  unwrap(left.select([constant.id, compose.id], compose.id));
  unwrap(right.select([multiply.id]));
  unwrap(leftView.setCamera({ x: 10, y: 20, zoom: 0.5 }));
  unwrap(rightView.setCamera({ x: -10, y: 0, zoom: 1.5 }));
  const oldCode = original.pixel;
  unwrap(
    left.change("Rename and move", (d) => {
      d.rename(compose.id, "Visible name");
      d.move(compose.id, [200, 300]);
    }),
  );
  assert.equal(right.graph.nodeById(compose.id)!.name, "Visible name");
  assert.deepEqual(right.selection, {
    items: [multiply.id],
    primary: multiply.id,
  });
  assert.notDeepEqual(leftView.camera, rightView.camera);
  assert.equal(unwrap(generate(graph.snapshot())).pixel, oldCode);
  const op = unwrap(right.beginOperation("Grouped slider edit"));
  unwrap(multiply.parameter("b").write(0.25, op));
  unwrap(multiply.parameter("b").write(0.5, op));
  unwrap(op.commit());
  note(
    "兩個 EditorContext",
    "左側修改立即可從右側讀取；Stage、選取與 Canvas camera 各自獨立；名稱不改變執行程式",
  );

  const before = graph.exportJSON(),
    beforeHistory = graph.history.length;
  unwrap(compose.parameter("mode").write("pair"));
  assert.equal(graph.stage("pixel").edges.length, 2);
  assert.ok(graph.snapshot().document.losses.some((l) => !!l.edge));
  assert.ok(graph.diagnostics.some((i) => i.severity === "warning"));
  assert.ok(graph.diagnostics.some((i) => i.code === "REQUIRED_INPUT"));
  assert.equal(generate(graph.snapshot()).ok, false);
  assert.equal(graph.history.length, beforeHistory + 1);
  note(
    "動態接口 / invalid connection / diagnostics",
    "vec4 改成 vec2；不能自動補值的線轉為 loss record，Warning 與必要輸入 Error 一起發布",
  );

  const invalid = graph.exportJSON();
  const invalidReload = unwrap(Graph.load(invalid, registry));
  assert.equal(generate(invalidReload.snapshot()).ok, false);
  assert.equal(invalidReload.exportJSON(), invalid);
  note("錯誤圖保存", "診斷有 Error 仍可保存並載入；沒有偽造可生成狀態");
  const revision = graph.revision;
  unwrap(graph.history.undo());
  assert.equal(graph.exportJSON(), before);
  assert.ok(graph.revision > revision);
  const restored = unwrap(generate(graph.snapshot()));
  assert.equal(restored.pixel, oldCode);
  unwrap(graph.history.redo());
  assert.equal(graph.exportJSON(), invalid);
  unwrap(graph.history.undo());
  assert.equal(graph.exportJSON(), before);
  note(
    "undo / redo",
    "一筆記錄完整恢復設定、接口、本地值、Edge 及 losses；revision 始終向前",
  );

  let memory = "";
  const storage = adapter ?? {
    async write(text: string) {
      memory = text;
    },
    async read() {
      return memory;
    },
  };
  unwrap(await graph.save(storage));
  assert.equal(graph.dirty, false);
  const saved = await storage.read();
  const reloaded = unwrap(Graph.load(saved, registry));
  assert.equal(reloaded.id, graph.id);
  assert.notEqual(reloaded.loadId, graph.loadId);
  assert.equal(reloaded.history.length, 0);
  assert.equal(reloaded.exportJSON(), saved);
  assert.equal(unwrap(generate(reloaded.snapshot())).pixel, oldCode);
  note(
    "save / reload",
    "保存模型身分、接口與連線；重新載入有新 loadId，不把 History / selection 塞入作品",
  );

  const unknownDocument = JSON.parse(saved);
  unknownDocument.futureExtension = {
    vendor: "unavailable-editor",
    values: [0, false, "keep"],
  };
  const unknownNode = unknownDocument.stages[1].nodes.find(
    (n: { id: string }) => n.id === compose.id,
  );
  unknownNode.futureWidget = { state: ["opaque", { version: 7 }] };
  const unavailable = unwrap(
    Graph.load(JSON.stringify(unknownDocument), new Registry()),
  );
  assert.equal(generate(unavailable.snapshot()).ok, false);
  const opaqueBefore = unavailable.nodeById(compose.id)!.state;
  unwrap(
    unavailable.change("Move missing node", (d) =>
      d.move(compose.id, [400, 500]),
    ),
  );
  assert.deepEqual(unavailable.nodeById(compose.id)!.state, opaqueBefore);
  const preserved = JSON.parse(unavailable.exportJSON());
  assert.deepEqual(preserved.futureExtension, unknownDocument.futureExtension);
  assert.deepEqual(
    preserved.stages[1].nodes.find((n: { id: string }) => n.id === compose.id)
      .futureWidget,
    unknownNode.futureWidget,
  );
  const recovered = unwrap(Graph.load(unavailable.exportJSON(), registry));
  assert.equal(unwrap(generate(recovered.snapshot())).pixel, oldCode);
  note(
    "missing module preservation",
    "缺模組仍可移動與另存，opaque / 未知欄位完整保留；精確模組恢復後相同 GLSL",
  );

  unwrap(editor.close(left.id));
  assert.equal(editor.contexts.length, 1);
  assert.equal(graph.nodeById(compose.id)!.exists, true);
  note(
    "生命週期",
    "關閉 Context 不刪除 Graph；另一個 Context 繼續持有同一模型",
  );
  return {
    trace,
    ids,
    graph,
    shader: restored,
    saved,
    invalid,
    preserved: unavailable.exportJSON(),
    expectedPixel: [51, 102, 153, 255],
  };
}
