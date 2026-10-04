import test from "node:test";
import assert from "node:assert/strict";
import { application } from "../fixtures/setup.ts";
import { Graph } from "../../src/model/graph.ts";
import { canvasCommands } from "../../src/features/canvas.ts";
import { resolveOccurrence } from "../../src/sdk/networks.ts";

function oneSnapshot<T>(read: () => T): T {
  const original = Graph.prototype.capture;
  let calls = 0;
  Graph.prototype.capture = function () {
    calls++;
    return original.call(this);
  };
  try {
    const value = read();
    assert.equal(
      calls,
      1,
      "one isolated read must not clone the Graph repeatedly",
    );
    return value;
  } finally {
    Graph.prototype.capture = original;
  }
}

for (const nested of [false, true]) {
  test(`S05 drag repair ${nested ? "nested" : "root"} reads one fresh snapshot and retains immutable earlier projections`, () => {
    const s = application();
    s.app.grant("capture-test", canvasCommands);
    const run = (commandId: string, args: any = {}) =>
      s.app.execute(
        { panelId: "capture-test", typeId: "capture-test" },
        s.target(),
        {
          commandId,
          args,
        },
      );
    if (nested) {
      run("grape.network.create");
      run("grape.network.enter", { id: s.context.capture().primary! });
    }
    const id = s.add("float"),
      before = oneSnapshot(() => s.context.capture()),
      network = oneSnapshot(() => s.context.network()),
      field = s.app.parameter(s.context, id, "value", before.scope),
      value = oneSnapshot(() => field.capture()),
      frozenBytes = JSON.stringify(before);
    const resolved = resolveOccurrence(
      before.graph.document,
      s.definitions.pin(before.graph.document.graph.modules),
      before.scope.stageId,
      before.scope.networkPath,
    ).network;
    assert.deepEqual(before.network, resolved);
    assert.deepEqual(network, resolved);
    assert.equal(before.scope.networkPath.length, nested ? 1 : 0);
    assert(Object.isFrozen(before.graph.document.graph));
    assert(Object.isFrozen(network.nodes[0].position));
    assert(Object.isFrozen(value.projection));
    assert.throws(() => ((network.nodes[0].position as any)[0] = 999));
    assert.throws(() => ((value.projection as any).value = 99));
    field.commit(0.75, value.editToken);
    assert.equal(oneSnapshot(() => field.capture()).projection.value, 0.75);
    assert.equal(value.projection.value, 0.25);
    assert.equal(JSON.stringify(before), frozenBytes);
    assert.equal(
      (
        oneSnapshot(() => s.context.capture()).network.nodes.find(
          (n) => n.id === id,
        )!.state as { value: number }
      ).value,
      0.75,
    );
    if (nested) {
      run("grape.network.up");
      assert.throws(() => field.capture(), /TARGET_EXPIRED|STALE_SCOPE/);
    }
    s.context.dispose();
    assert.throws(() => s.context.capture(), /CONTEXT_DISPOSED/);
    assert.throws(() => s.context.network(), /CONTEXT_DISPOSED/);
  });
}

test("S05 drag repair preserves readonly and busy notification values while movement keeps field token", () => {
  const s = application(),
    id = s.add("float"),
    field = s.app.parameter(s.context, id, "value", s.context.capture().scope),
    initial = field.capture(),
    notices: { writable: boolean; value: unknown; token: string }[] = [];
  const unsubscribe = field.subscribe(() => {
    const current = field.capture();
    notices.push({
      writable: current.writable,
      value: current.projection.value,
      token: current.editToken,
    });
  });
  const revision = s.app.snapshot.revision;
  s.app.setReadonly(true);
  assert.equal(notices.at(-1)?.writable, false);
  assert.throws(() => field.commit(0.9, initial.editToken), /FIELD_READONLY/);
  s.app.setReadonly(false);
  assert.equal(notices.at(-1)?.writable, true);
  assert.equal(s.app.snapshot.revision, revision);
  const originalPosition = [
    ...s.context.network().nodes.find((n) => n.id === id)!.position,
  ];
  const gesture = s.app.beginGesture(
    { panelId: "test", typeId: "test" },
    s.target(),
    { commandId: "grape.node.move", args: { ids: [id] } },
  );
  assert.equal(field.capture().writable, false);
  const beforeMove = notices.length;
  gesture.update({ positions: { [id]: [130, 90] } });
  assert.equal(
    notices.length - beforeMove,
    2,
    "Context and Application delivery both remain",
  );
  assert(notices.slice(beforeMove).every((n) => !n.writable));
  assert.equal(field.capture().editToken, initial.editToken);
  gesture.cancel();
  assert.equal(notices.at(-1)?.writable, true);
  assert.deepEqual(
    s.context.network().nodes.find((n) => n.id === id)!.position,
    originalPosition,
  );
  assert(
    notices.every(
      (n) =>
        n.value === initial.projection.value && n.token === initial.editToken,
    ),
  );
  unsubscribe();
  field.dispose();
  assert.throws(() => field.capture(), /TARGET_EXPIRED/);
});
