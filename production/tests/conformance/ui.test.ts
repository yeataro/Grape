import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { application } from "../fixtures/setup.ts";
import { Workspace } from "../../src/ui/workspace.ts";
import { PresentationSession, PanelRenderer } from "../../src/ui/mount.ts";
import { Localization } from "../../src/localization/service.ts";
import { Signal } from "../../src/sdk/kernel.ts";
import type { PanelType, PanelUpdate } from "../../src/sdk/ui.ts";
import type { PanelMountContext } from "../../src/sdk/view-mount.ts";
const owner = {
  moduleId: "test.panel",
  version: "1",
  fingerprint: "test",
  namespace: "test.panel",
  catalogVersion: 1,
};
const harnesses: any[] = [];
afterEach(() => {
  for (const h of harnesses.splice(0))
    assert(
      !h.session.issues.some((x: any) => x.message.includes("AssertionError")),
      "Assertion inside guarded event failed",
    );
});
function harness() {
  const s = application();
  const node = s.add("float");
  s.app.grant("editable", ["grape.node.move", "grape.undo"]);
  const workspace = new Workspace(s.app),
    locale = new Localization();
  let mounted: PanelMountContext | null = null,
    update: PanelUpdate | null = null,
    failRender = false;
  let cleanup = 0,
    disposed = 0,
    received = 0,
    creates = 0;
  const changed = new Signal<void>();
  const type: PanelType = {
    typeId: "editable",
    viewStateVersion: 1,
    commandIds: ["grape.node.move", "grape.undo"],
    providesContext: true,
    presentation: { label: { owner, key: "title", fallback: "Editable" } },
    create: () => ({
      restoreViewState: () => {},
      exportViewState: () => ({ expanded: true }),
      receive: (value) => {
        update = value;
        received++;
        changed.emit();
      },
      canClose: () => true,
      dispose: () => {
        disposed++;
      },
      createView: () => {
        creates++;
        return {
          kind: "panel",
          capture: () => ({ received }),
          subscribe: (fn) => changed.subscribe(fn),
          dispose: () => {},
          mount: (context) => {
            mounted = context;
            context.scope.own(() => {
              cleanup++;
            });
            return {
              update: () => {
                if (failRender) throw Error("render failure");
              },
            };
          },
        };
      },
    }),
  };
  workspace.addPane("a");
  workspace.addPane("b");
  workspace.register(type);
  workspace.open({
    id: "edit",
    typeId: "editable",
    viewStateVersion: 1,
    state: {},
    paneId: "a",
    hidden: false,
    contextId: s.context.id,
  });
  workspace.activate("edit");
  const renderer = new PanelRenderer(workspace, locale, () => ({
    protocol: "test.v1",
    target: {},
  }));
  const h = {
    ...s,
    node,
    workspace,
    locale,
    renderer,
    session: renderer.session("edit")!,
    mount: () => mounted!,
    lease: () => update!.lease,
    fail: () => {
      failRender = true;
    },
    counts: () => ({ cleanup, disposed, received, creates }),
  };
  harnesses.push(h);
  return h;
}
test("PC authority: declaration is not grant; render/async/outside event denied, same mounted event succeeds", async () => {
  const h = harness(),
    m = h.mount();
  assert.throws(
    () => m.commands!.execute(h.lease(), { commandId: "grape.undo", args: {} }),
    /MOUNT_EVENT_REQUIRED/,
  );
  let late: Promise<void> | null = null;
  let asyncError = "";
  m.scope.event(() => {
    late = Promise.resolve().then(() => {
      try {
        m.commands!.execute(h.lease(), { commandId: "grape.undo", args: {} });
      } catch (error) {
        asyncError = String(error);
      }
    });
  })();
  await late;
  assert.match(asyncError, /MOUNT_EVENT_REQUIRED/);
  const revision = h.app.snapshot.revision;
  m.scope.event(() =>
    m.commands!.execute(h.lease(), { commandId: "grape.undo", args: {} }),
  )();
  assert(h.app.snapshot.revision > revision);
  h.renderer.dispose();
  h.workspace.dispose();
});
test("PC gesture: origin guard, one operation, cross-Panel lease rejection and latest lease required", () => {
  const h = harness(),
    m = h.mount();
  let gesture: any;
  const old = h.lease();
  m.scope.event(() => {
    assert.throws(
      () =>
        m.commands!.beginGesture(
          { ...old, panelId: "spoof" },
          { commandId: "grape.node.move", args: { ids: [h.node] } },
        ),
      /STALE_PANEL_LEASE/,
    );
    gesture = m.commands!.beginGesture(old, {
      commandId: "grape.node.move",
      args: { ids: [h.node] },
    });
    gesture.update(h.lease(), { positions: { [h.node]: [10, 20] } });
    assert.throws(
      () => gesture.update(old, { positions: { [h.node]: [20, 30] } }),
      /STALE_PANEL_LEASE/,
    );
    assert.throws(() => h.workspace.close("edit"), /PANEL_CLOSE_VETO/);
    assert.throws(
      () => h.workspace.retarget("edit", h.context.id),
      /HISTORY_BUSY/,
    );
    gesture.update(h.lease(), { positions: { [h.node]: [30, 40] } });
    gesture.commit(h.lease());
  })();
  assert.equal(h.app.busy, false);
  const before = h.app.snapshot.document;
  h
    .mount()
    .scope.event(() =>
      h
        .mount()
        .commands!.execute(h.lease(), { commandId: "grape.undo", args: {} }),
    )();
  assert.notDeepEqual(h.app.snapshot.document, before);
  h.renderer.dispose();
  h.workspace.dispose();
});
test("PC move/hide cancel pointer gesture and drain new leases before workspace action returns", () => {
  for (const mode of ["hide", "move", "detach"]) {
    const h = harness(),
      m = h.mount(),
      before = h.app.snapshot.document;
    let gesture: any;
    m.scope.event(() => {
      gesture = m.commands!.beginGesture(h.lease(), {
        commandId: "grape.node.move",
        args: { ids: [h.node] },
      });
      gesture.update(h.lease(), { positions: { [h.node]: [90, 100] } });
    })();
    const old = h.lease();
    if (mode === "hide") h.workspace.hide("edit", true);
    else if (mode === "move") h.workspace.move("edit", "b");
    else h.renderer.dispose();
    assert.equal(h.app.busy, false, mode);
    assert.deepEqual(h.app.snapshot.document, before, mode);
    assert(h.lease().generation > old.generation, mode);
    if (mode !== "detach") h.renderer.dispose();
    h.workspace.dispose();
  }
});
test("PC render failure cancels only unfinished operation after publication, with no reentrant mutation", () => {
  const h = harness(),
    m = h.mount(),
    before = h.app.snapshot.document;
  m.scope.event(() => {
    const gesture = m.commands!.beginGesture(h.lease(), {
      commandId: "grape.node.move",
      args: { ids: [h.node] },
    });
    h.fail();
    gesture.update(h.lease(), { positions: { [h.node]: [30, 40] } });
  })();
  assert.equal(h.app.busy, false);
  assert.deepEqual(h.app.snapshot.document, before);
  assert.equal(h.renderer.session("edit")!.status, "placeholder");
  h.renderer.dispose();
  h.workspace.dispose();
});
test("PC same ID reuse and old scope registrations remain revoked", () => {
  const h = harness(),
    old = h.mount();
  h.workspace.close("edit");
  h.workspace.open({
    id: "edit",
    typeId: "editable",
    viewStateVersion: 1,
    state: {},
    paneId: "a",
    hidden: false,
    contextId: h.context.id,
  });
  const next = h.mount();
  let ran = false;
  old.scope.event(() => {
    ran = true;
  })();
  assert.equal(ran, false);
  let cleaned = false;
  old.scope.own(() => {
    cleaned = true;
  });
  assert(cleaned);
  next.scope.event(() =>
    assert.throws(
      () =>
        old.commands!.execute(h.lease(), { commandId: "grape.undo", args: {} }),
      /MOUNT_REVOKED/,
    ),
  )();
  h.renderer.dispose();
  h.workspace.dispose();
});
test("VM resources: cleanup in reverse order, failure isolation, stale async tickets, no render reentrancy", () => {
  const locale = new Localization(),
    events: string[] = [],
    signal = new Signal<void>();
  let mounted: any;
  const session = new PresentationSession(
    {
      kind: "panel",
      capture: () => ({}),
      subscribe: (fn) => signal.subscribe(fn),
      dispose: () => events.push("dispose"),
      mount: (ctx) => {
        mounted = ctx;
        ctx.scope.own(() => events.push("first"));
        ctx.scope.own(() => {
          events.push("second");
          throw Error("cleanup");
        });
        return { update: () => {}, unmount: () => events.push("unmount") };
      },
    },
    locale,
  );
  session.mount({ protocol: "test", target: {} });
  const ticket = mounted.scope.ticket();
  signal.emit();
  assert.equal(
    mounted.scope.accept(ticket, () => events.push("stale")),
    false,
  );
  session.unmount();
  assert.deepEqual(events, ["unmount", "second", "first"]);
  assert.equal(session.issues.length, 1);
  session.dispose();
  assert.equal(events.at(-1), "dispose");
});
test("two independently registered Panels and two Widget view shapes share lifecycle without feature dispatch", () => {
  const s = application(),
    workspace = new Workspace(s.app),
    locale = new Localization(),
    seen: string[] = [];
  for (const name of ["summary", "help"]) {
    workspace.addPane(name);
    workspace.register({
      typeId: name,
      viewStateVersion: 1,
      presentation: { label: { owner, key: name, fallback: name } },
      create: () => {
        let state = { expanded: false };
        return {
          restoreViewState: (v) => {
            state = v as typeof state;
          },
          exportViewState: () => state,
          receive: () => {},
          canClose: () => true,
          dispose: () => {},
          createView: () => ({
            kind: "panel",
            capture: () => (name === "help" ? state : { selection: [] }),
            subscribe: () => () => {},
            dispose: () => {},
            mount: ({ commands }) => {
              assert.equal(commands, undefined);
              return { update: () => seen.push(name) };
            },
          }),
        };
      },
    });
    workspace.open({
      id: name,
      typeId: name,
      viewStateVersion: 1,
      state: { expanded: true },
      paneId: name,
      hidden: false,
    });
  }
  const renderer = new PanelRenderer(workspace, locale, () => ({
    protocol: "test",
    target: {},
  }));
  assert(seen.includes("summary") && seen.includes("help"));
  for (const projection of [{ value: 1 }, { enabled: true, shape: "toggle" }]) {
    let rendered: any;
    const session = new PresentationSession(
      {
        kind: "parameter-widget",
        capture: () => ({ projection, editToken: "one", writable: true }),
        subscribe: () => () => {},
        dispose: () => {},
        mount: () => ({
          update: (value) => {
            rendered = value;
          },
        }),
      },
      locale,
      undefined,
      {
        commit: () => {},
        draft: () => {
          throw Error("unused");
        },
      },
    );
    session.mount({ protocol: "test", target: {} });
    assert.deepEqual(rendered.projection, projection);
    session.dispose();
  }
  renderer.dispose();
  workspace.dispose();
});

test("VM mount/capture/update reentrancy revokes scope and preserves placeholder; explicit retry recovers", () => {
  for (const phase of ["mount", "capture", "update"]) {
    const signal = new Signal<void>();
    let fail = true,
      cleanups = 0,
      scope: any;
    const session = new PresentationSession(
      {
        kind: "panel",
        subscribe: (fn) => signal.subscribe(fn),
        dispose: () => {},
        capture: () => {
          if (fail && phase === "capture") signal.emit();
          return {};
        },
        mount: (context) => {
          scope = context.scope;
          scope.own(() => cleanups++);
          if (fail && phase === "mount") signal.emit();
          return {
            update: () => {
              if (fail && phase === "update") signal.emit();
            },
          };
        },
      },
      new Localization(),
    );
    session.mount({ protocol: "test", target: {} });
    assert.equal(session.status, "placeholder", phase);
    assert.equal(cleanups, 1, phase);
    assert(
      session.issues.some((i) => i.message.includes("VIEW_RENDER_REENTRANCY")),
      phase,
    );
    let ran = false;
    scope.event(() => (ran = true))();
    assert.equal(ran, false);
    fail = false;
    session.retry();
    assert.equal(session.status, "mounted", phase);
    session.dispose();
    assert.equal(cleanups, 2);
  }
});

test("VM subscription failure releases acquired subscriptions and cannot pretend to mount", () => {
  let subscribed = 0,
    mounted = 0,
    disposed = 0;
  const locale = new Localization();
  locale.dispose();
  const session = new PresentationSession(
    {
      kind: "panel",
      capture: () => ({}),
      subscribe: () => {
        subscribed++;
        return () => subscribed--;
      },
      mount: () => {
        mounted++;
        return { update: () => {} };
      },
      dispose: () => {
        disposed++;
      },
    },
    locale,
  );
  assert.equal(subscribed, 0);
  session.mount({ protocol: "test", target: {} });
  assert.equal(session.status, "placeholder");
  assert.equal(mounted, 0);
  session.dispose();
  assert.equal(disposed, 1);
});

test("PC application denies every editing command while readonly or history busy; field binding invalidates", () => {
  const h = harness();
  const field = h.app.parameter(
    h.context,
    h.node,
    "value",
    h.context.capture().scope,
  );
  let notifications = 0;
  field.subscribe(() => notifications++);
  const commands = [
    "grape.node.add",
    "grape.node.delete",
    "grape.node.rename",
    "grape.edge.connect",
    "grape.edge.disconnect",
    "grape.undo",
    "grape.redo",
  ];
  h.app.grant("matrix", [...commands, "grape.node.move"]);
  const origin = { panelId: "matrix", typeId: "matrix" },
    target = h.target();
  h.app.setReadonly(true);
  assert(notifications > 0);
  assert.equal(field.capture().writable, false);
  for (const commandId of commands)
    assert.throws(
      () => h.app.execute(origin, target, { commandId, args: {} }),
      /COMMAND_DENIED/,
      commandId,
    );
  assert.throws(
    () =>
      h.app.beginGesture(origin, target, {
        commandId: "grape.node.move",
        args: { ids: [h.node] },
      }),
    /COMMAND_DENIED/,
  );
  assert.throws(
    () => field.commit(1, field.capture().editToken),
    /FIELD_READONLY/,
  );
  h.app.setReadonly(false);
  const move = h.app.beginGesture(origin, target, {
    commandId: "grape.node.move",
    args: { ids: [h.node] },
  });
  assert.equal(field.capture().writable, false);
  const args: Record<string, any> = {
    "grape.node.add": { ref: h.app.catalog()[0].ref, position: [0, 0] },
    "grape.node.rename": { id: h.node, name: "Renamed" },
    "grape.edge.connect": {
      from: { nodeId: h.node, portKey: "value" },
      to: { nodeId: h.node, portKey: "value" },
    },
    "grape.edge.disconnect": { id: "edge" },
  };
  for (const commandId of commands)
    assert.throws(
      () =>
        h.app.execute(origin, target, {
          commandId,
          args: args[commandId] ?? {},
        }),
      /HISTORY_BUSY/,
      commandId,
    );
  assert.throws(
    () => field.commit(1, field.capture().editToken),
    /FIELD_READONLY/,
  );
  move.cancel();
  assert.equal(field.capture().writable, true);
  field.dispose();
  h.renderer.dispose();
  h.workspace.dispose();
});

test("B01 same-pane movement revokes old scope before placement publication and retains contribution", () => {
  const h = harness(),
    old = h.mount(),
    counts = h.counts();
  let seen = false;
  h.workspace.subscribe(() => {
    seen = true;
    assert.equal(
      old.scope.accept(old.scope.ticket(), () => assert.fail("old mount")),
      false,
    );
  });
  h.workspace.move("edit", "a", 0);
  assert(seen);
  assert.equal(h.counts().creates, counts.creates);
  assert.equal(h.counts().disposed, 0);
  assert(h.counts().cleanup > counts.cleanup);
  h.renderer.dispose();
  h.workspace.dispose();
});
test("B01 PanelRenderer subscription failure rebuilds contribution on explicit retry", () => {
  const s = application(),
    w = new Workspace(s.app);
  w.addPane("a");
  let broken = true,
    views = 0;
  w.register({
    typeId: "retry",
    viewStateVersion: 1,
    presentation: { label: { owner, key: "retry", fallback: "Retry" } },
    create: () => ({
      restoreViewState: () => {},
      exportViewState: () => ({}),
      receive: () => {},
      canClose: () => true,
      dispose: () => {},
      createView: () => {
        views++;
        return {
          kind: "panel",
          capture: () => ({}),
          subscribe: () => {
            if (broken) throw Error("SUBSCRIBE_FAILURE");
            return () => {};
          },
          dispose: () => {},
          mount: () => ({ update: () => {} }),
        };
      },
    }),
  });
  w.open({
    id: "P",
    typeId: "retry",
    viewStateVersion: 1,
    state: {},
    paneId: "a",
    hidden: false,
  });
  const renderer = new PanelRenderer(w, new Localization(), () => ({
    protocol: "test",
    target: {},
  }));
  assert.match(renderer.issue("P"), /subscribe/);
  broken = false;
  renderer.retry("P");
  assert.equal(renderer.session("P")!.status, "mounted");
  assert.equal(views, 2);
  renderer.dispose();
  w.dispose();
});
