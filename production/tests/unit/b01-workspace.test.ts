import { test } from "node:test";
import assert from "node:assert/strict";
import { Workspace } from "../../src/ui/workspace.ts";
import type { PanelType, SavedPanel, PanelServices } from "../../src/sdk/ui.ts";
import { application } from "../fixtures/setup.ts";
const owner = {
  moduleId: "test.panels",
  version: "1",
  fingerprint: "test",
  namespace: "test.panels",
  catalogVersion: 1,
};
function fixture() {
  const s = application(),
    w = new Workspace(s.app),
    seen = new Map<string, any>(),
    services = new Map<string, PanelServices>();
  let creates = 0,
    disposes = 0,
    veto = "",
    exportFailure = "";
  const type = (id: string, provider = false): PanelType => ({
    typeId: id,
    viewStateVersion: 1,
    providesContext: provider,
    upperSlotFloat: !provider,
    presentation: { label: { owner, key: id, fallback: id } },
    create: (id, api) => {
      creates++;
      services.set(id, api);
      let state: any = {};
      return {
        restoreViewState: (v) => {
          state = v;
        },
        exportViewState: () => {
          if (exportFailure === id) throw Error("EXPORT_FAILED");
          return state;
        },
        receive: (v) => {
          seen.set(id, v);
        },
        canClose: () => veto !== id,
        dispose: () => {
          disposes++;
        },
        createView: () => ({
          kind: "panel",
          capture: () => ({}),
          subscribe: () => () => {},
          dispose: () => {},
          mount: () => ({ update: () => {} }),
        }),
      };
    },
  });
  w.register(type("canvas", true));
  w.register(type("parameters"));
  for (const id of ["a", "b", "c", "d"])
    w.addPane(id, id === "a" || id === "b" ? "center" : "right");
  const open = (id: string, paneId: string, contextId?: string) =>
    w.open({
      id,
      typeId: contextId ? "canvas" : "parameters",
      viewStateVersion: 1,
      state: { note: id },
      paneId,
      hidden: false,
      ...(contextId ? { contextId } : {}),
    });
  return {
    ...s,
    w,
    seen,
    services,
    type,
    open,
    counts: () => ({ creates, disposes }),
    veto: (id: string) => {
      veto = id;
    },
    failExport: (id: string) => {
      exportFailure = id;
    },
  };
}
test("B01 group0, positive groups and fixed Canvas routes distinguish activation, hide and close", () => {
  const f = fixture(),
    c2 = f.app.context();
  f.open("A", "a", f.context.id);
  f.open("B", "b", c2.id);
  f.open("P", "c");
  f.open("Q", "d");
  assert.equal(f.w.record("P").update.target, null);
  f.w.activate("A");
  assert.equal(f.w.record("P").update.target!.scope.contextId, f.context.id);
  f.w.activate("Q");
  assert.equal(f.w.activeCanvas()!.saved.id, "A");
  f.w.setLinkGroup("Q", 2);
  assert.equal(f.w.record("Q").update.target, null);
  f.w.setLinkGroup("B", 2);
  assert.equal(f.w.record("Q").update.target, null);
  f.w.activate("B");
  assert.equal(f.w.record("Q").update.target!.scope.contextId, c2.id);
  f.w.setRoute("P", { mode: "followCanvas", panelId: "A" });
  f.w.hide("A", true);
  assert.equal(f.w.record("P").update.target!.scope.contextId, f.context.id);
  f.w.close("B");
  assert.equal(f.w.record("Q").update.target, null);
  assert.equal(f.w.activeCanvas()!.saved.id, "A");
  f.w.close("A");
  assert.equal(f.w.record("P").update.target, null);
  assert.equal(f.w.activeCanvas(), null);
  assert.doesNotThrow(() => f.app.context(c2.id));
});
test("B01 direct Context changes and revision update routed targets, unchanged placement does not repeat receive", () => {
  const f = fixture(),
    n = f.add("float");
  f.context.select([]);
  f.open("A", "a", f.context.id);
  f.open("P", "c");
  f.w.activate("A");
  const lease = f.w.record("P").update.lease;
  f.w.move("P", "d");
  assert.deepEqual(f.w.record("P").update.lease, lease);
  f.context.select([n]);
  assert.equal(f.w.record("P").update.target!.object!.id, n);
  assert.equal(
    f.services.get("P")!.accept(lease, () => assert.fail("stale")),
    false,
  );
  const next = f.w.record("P").update.lease;
  f.app.execute({ panelId: "test", typeId: "test" }, f.target(), {
    commandId: "grape.undo",
    args: {},
  });
  assert.notDeepEqual(f.w.record("P").update.lease, next);
});
test("B01 close and retarget veto keep logical instances and placement intact", () => {
  const f = fixture();
  f.open("A", "a", f.context.id);
  f.open("P", "c");
  f.w.activate("A");
  f.veto("P");
  const before = f.w.save(),
    instance = f.w.record("P").instance;
  assert.throws(() => f.w.close("P"), /PANEL_CLOSE_VETO/);
  assert.throws(() => f.w.retarget("P", f.context.id), /HISTORY_BUSY/);
  assert.deepEqual(f.w.save(), before);
  assert.equal(f.w.record("P").instance, instance);
  assert.throws(() => f.w.dispose(), /PANEL_CLOSE_VETO/);
});
test("B01 provider borrowing guards direct disposal; closing releases borrow without deleting Context", () => {
  const f = fixture();
  f.open("A", "a", f.context.id);
  assert.throws(() => f.context.dispose(), /CONTEXT_IN_USE/);
  assert.throws(() => f.app.releaseContext(f.context.id), /CONTEXT_IN_USE/);
  f.w.close("A");
  assert.equal(f.app.context(f.context.id), f.context);
  assert.doesNotThrow(() => f.app.releaseContext(f.context.id));
});
test("B01 move, float, collapse, hide/show preserve Panel and exported draft; upper slot returns prior owner to dock", () => {
  const f = fixture();
  f.open("P", "c");
  f.open("Q", "d");
  const p = f.w.record("P").instance,
    initial = f.app.snapshot;
  f.w.float("P");
  f.w.resizeFloat("P", 420);
  f.w.collapse("P", true);
  assert.equal(f.w.visible("P"), false);
  f.w.float("Q");
  assert.equal(f.w.record("P").saved.floating, undefined);
  f.w.hide("Q", true);
  f.w.hide("Q", false);
  assert.equal(f.w.record("Q").saved.floating, undefined);
  f.w.move("P", "d", 0);
  assert.equal(f.w.record("P").instance, p);
  assert.deepEqual(p!.exportViewState(), { note: "P" });
  assert.deepEqual(f.app.snapshot, initial);
  assert.deepEqual(f.w.panes().find((x) => x.id === "d")!.tabs, ["P", "Q"]);
});
test("B01 save/restore mints Context and leases, preserves inert identities and no runtime activation", () => {
  const f = fixture(),
    n = f.add("float");
  f.open("A", "a", f.context.id);
  f.open("P", "c");
  f.w.activate("A");
  f.context.select([n]);
  f.w.resizeSide("right", 480);
  const saved = f.w.save(),
    old = f.w.record("A").update.target!.scope;
  assert.equal(JSON.stringify(saved).includes('"loadId"'), false);
  assert.equal(JSON.stringify(saved).includes('"contextId"'), false);
  const restored = new Workspace(f.app);
  restored.register(f.type("canvas", true));
  restored.register(f.type("parameters"));
  restored.restore(saved);
  assert.equal(restored.record("P").update.target, null);
  const current = restored.record("A").update.target!.scope;
  assert.notEqual(current.contextId, old.contextId);
  assert.equal(current.graphId, old.graphId);
  assert.deepEqual(f.app.context(current.contextId).capture().selection, [n]);
  assert.equal(restored.widths().right, 480);
  restored.activate("A");
  assert.equal(restored.record("P").update.target!.object!.id, n);
});
test("B01 application restore resolves exact graph/stage/occurrence, never names or first stage", () => {
  const f = fixture();
  const h = f.app.contextHint(f.context.id);
  for (const bad of [
    { ...h, graphId: "missing" },
    { ...h, stageId: "pixel" },
    { ...h, networkPath: ["missing"] },
    { ...h, selection: ["missing"], primary: "missing" },
  ])
    assert.equal(f.app.restoreContext(bad), null);
  const c = f.app.restoreContext(h)!;
  assert.notEqual(c.id, f.context.id);
  assert.equal(c.capture().scope.stageId, h.stageId);
});
test("B01 missing type/version and unresolved target retain opaque data with retry using one registry", () => {
  const f = fixture();
  f.open("A", "a", f.context.id);
  const layout = structuredClone(f.w.save());
  layout.panels[0].typeId = "later";
  const w = new Workspace(f.app);
  w.restore(layout);
  assert.equal(w.record("A").instance, null);
  assert.deepEqual(w.save(), layout);
  w.register(f.type("later", true));
  w.retry("A");
  assert(w.record("A").instance);
  assert.deepEqual(w.panes(), layout.panes);
  const unresolved = structuredClone(layout);
  unresolved.panels[0].contextHint!.networkPath = ["missing"];
  const missing = new Workspace(f.app);
  missing.register(f.type("later", true));
  missing.restore(unresolved);
  assert.match(missing.record("A").issues.join(), /CONTEXT_UNRESOLVED/);
  assert.deepEqual(missing.save(), unresolved);
  const version = structuredClone(layout);
  version.panels[0].viewStateVersion = 99;
  const newer = new Workspace(f.app);
  newer.register(f.type("later", true));
  newer.restore(version);
  assert.equal(newer.record("A").instance, null);
  assert.deepEqual(newer.save(), version);
});
test("B01 full layout validation refuses malformed candidates before any factory or live mutation", () => {
  const f = fixture();
  f.open("A", "a", f.context.id);
  f.open("P", "c");
  const valid = f.w.save(),
    before = f.counts(),
    model = f.app.snapshot;
  const mutations: ((x: any) => void)[] = [
    (x) => (x.version = 2),
    (x) => delete x.panels[0].state,
    (x) => x.panels.push(x.panels[0]),
    (x) => x.panes[0].tabs.push("A"),
    (x) => (x.panels[0].paneId = "missing"),
    (x) => (x.panels[0].linkGroup = -1),
    (x) => (x.panels[0].route = { mode: "followCanvas", panelId: "" }),
    (x) => (x.panels[0].viewStateVersion = 0),
    (x) => (x.panes[0].weight = Infinity),
    (x) => (x.panes[0].active = "missing"),
    (x) => (x.panels[0].contextHint.loadId = "old"),
    (x) => (x.panels[0].contextId = "old"),
    (x) => (x.widths.right = 0),
    (x) => (x.panels[0].route = null),
    (x) => (x.panels[0].floating = null),
    (x) => (x.panels[0].contextHint = null),
    (x) => (x.panels[0].route = { mode: "follow" }),
    (x) => (x.panels[0].state = { payload: "x".repeat(262145) }),
  ];
  for (const mutate of mutations) {
    const bad = structuredClone(valid);
    mutate(bad);
    const w = new Workspace(f.app);
    w.register(f.type("canvas", true));
    w.register(f.type("parameters"));
    assert.throws(() => w.restore(bad));
    assert.deepEqual(w.records(), []);
    assert.deepEqual(w.panes(), []);
    w.dispose();
  }
  assert.deepEqual(f.counts(), before);
  assert.deepEqual(f.app.snapshot, model);
  assert.deepEqual(f.w.save(), valid);
});
test("B01 invalid open/move route does not call factory or change tabs; reentry rejected in factory", () => {
  const f = fixture();
  const before = f.counts();
  assert.throws(() => f.open("P", "missing"), /PANE_MISSING/);
  assert.deepEqual(f.counts(), before);
  f.open("P", "c");
  const saved = f.w.save();
  assert.throws(() => f.w.move("P", "d", 3), /TAB_INDEX/);
  assert.throws(
    () => f.w.setRoute("P", { mode: "bogus" } as any),
    /PANEL_ROUTE/,
  );
  assert.deepEqual(f.w.save(), saved);
  f.w.register({
    ...f.type("reentrant"),
    create: () => {
      f.w.hide("P", true);
      throw Error("unreachable");
    },
  });
  f.w.open({
    id: "R",
    typeId: "reentrant",
    viewStateVersion: 1,
    state: {},
    paneId: "a",
    hidden: false,
  });
  assert.match(f.w.record("R").issues.join(), /WORKSPACE_BUSY/);
  assert.equal(f.w.record("P").saved.hidden, false);
});
test("B01 export callback failure is whole-save failure without graph/history changes", () => {
  const f = fixture();
  f.open("P", "c");
  f.open("Q", "d");
  const graph = f.app.snapshot;
  f.failExport("Q");
  assert.throws(() => f.w.save(), /EXPORT_FAILED/);
  assert.deepEqual(f.app.snapshot, graph);
});
test("B01 same-ID close/reopen rejects old services and restores detached state only", () => {
  const f = fixture();
  f.open("A", "a", f.context.id);
  f.w.activate("A");
  const api = f.services.get("A")!,
    lease = f.w.record("A").update.lease;
  f.w.close("A");
  f.open("A", "a", f.context.id);
  assert.equal(
    api.accept(lease, () => assert.fail("old callback")),
    false,
  );
  assert.throws(() => api.context(lease), /STALE_PANEL_LEASE/);
});

test("B01 tab and group ordering revokes placement while preserving live Panel identity", () => {
  const f = fixture();
  f.open("P", "a");
  f.open("Q", "a");
  f.open("R", "b");
  const before = f.w.record("P"),
    graph = f.app.snapshot;
  f.w.move("P", "a", 1);
  const after = f.w.record("P");
  assert.equal(after.instance, before.instance);
  assert.equal(after.incarnation, before.incarnation);
  assert(after.placement > before.placement);
  f.w.movePane("a", 1);
  assert.deepEqual(
    f.w
      .panes()
      .slice(0, 2)
      .map((p) => p.id),
    ["b", "a"],
  );
  assert.equal(f.w.record("P").instance, before.instance);
  assert.deepEqual(f.app.snapshot, graph);
  assert.throws(() => f.w.movePane("a", 99), /PANE_INDEX/);
});

test("B01 restored owned Context survives same-target retarget and receive retry then closes", () => {
  const f = fixture();
  f.open("P", "c");
  f.w.retarget("P", f.context.id);
  const layout = f.w.save();
  let fail = false;
  const type = f.type("parameters");
  const w = new Workspace(f.app);
  w.register({
    ...type,
    create: (id, api) => {
      const panel = type.create(id, api);
      return {
        ...panel,
        receive: (update) => {
          if (fail) throw Error("RECEIVE_FAILED");
          panel.receive(update);
        },
      };
    },
  });
  w.restore(layout);
  const c = w.record("P").update.target!.scope.contextId;
  w.retarget("P", c);
  assert.equal(f.app.context(c).capture().scope.contextId, c);
  fail = true;
  f.app.setReadonly(true);
  assert.equal(w.record("P").instance, null);
  fail = false;
  w.retry("P");
  assert(w.record("P").instance);
  assert.equal(w.record("P").update.target!.scope.contextId, c);
  w.close("P");
  assert.throws(() => f.app.context(c), /CONTEXT/);
});
