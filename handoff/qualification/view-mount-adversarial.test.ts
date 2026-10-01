/** Independent seam counterexamples. Qualification only; not a product renderer or teaching host. */
import test from 'node:test';
import assert from 'node:assert/strict';
import type { MountScope, MountTicket, PanelViewContribution, WidgetDraft, WidgetSnapshot } from '../contracts/view-mount.ts';
import type { ParameterView } from '../executable-reference/qualification-presentation.ts';
import { PanelRenderer, ViewSession, WidgetRenderer } from '../executable-reference/repair/view-mount.ts';
import { QualificationLocalization } from '../executable-reference/repair/localization.ts';
import { ContextDirectory, ObservableEditorContext, PanelWorkspace, type Panel, type PanelType, type SavedPanel } from '../executable-reference/repair/public-panel-workspace.ts';
import { ScopedParameterTarget, ScopedParameterWidgets } from '../executable-reference/repair/scoped-parameter.ts';
import { scopedFixture, value } from '../executable-reference/repair/scoped-fixtures.ts';
import { NestedNetworkEditorQualification } from '../executable-reference/qualification-workspace.ts';
import { Graph, Registry } from '../executable-reference/core.ts';
import { builtinModule, refs } from '../executable-reference/nodes.ts';
import type { NodeModule, NodeType, ParameterSpec } from '../executable-reference/contracts.ts';

const surface = { protocol: 'qualification.text-v1', target: {} };
function workspaceFixture() {
  const f = scopedFixture(), context = new ObservableEditorContext(f.graph), directory = new ContextDirectory();
  directory.add(context); directory.activate(context.id); value(context.select([f.root]));
  const workspace = new PanelWorkspace(directory); workspace.createPane('left'); workspace.createPane('right');
  return { ...f, context, directory, workspace, locale: new QualificationLocalization() };
}
const record = (id: string, typeId='adversarial.panel'): SavedPanel => ({ id, typeId, viewStateVersion: 1, state: {}, route: { mode: 'follow' }, linkGroup: 0, hidden: false });
function countedPanel() {
  const log: string[] = [], scopes: MountScope[] = [], events: (() => void)[] = [];
  let closeAllowed = false, clicks = 0, creates = 0, viewCreates = 0, viewDisposes = 0;
  const type: PanelType = { typeId: 'adversarial.panel', viewStateVersion: 1, create: ({ id }) => {
    creates++;
    const panel: Panel = {
      id, typeId: type.typeId, restoreViewState: () => ({ restored: true }), exportViewState: () => ({}),
      receive: () => {}, setVisible: () => {}, canClose: () => ({ allowed: closeAllowed }), dispose: () => { log.push('panel.dispose'); },
      createView: () => {
        viewCreates++;
        return { kind: 'panel', capture: () => ({ clicks }), subscribe: () => () => {},
          mount: ({ scope }) => { scopes.push(scope); events.push(scope.event(() => { clicks++; }));
            scope.own(() => { log.push('scope.cleanup'); }); return { update: () => {}, unmount: () => { log.push('view.unmount'); } }; },
          dispose: () => { viewDisposes++; log.push('contribution.dispose'); },
        };
      },
    }; return panel;
  } };
  return { type, log, scopes, events, allowClose: () => { closeAllowed = true; }, get clicks() { return clicks; }, get creates() { return creates; }, get viewCreates() { return viewCreates; }, get viewDisposes() { return viewDisposes; } };
}

test('VA01 real workspace close/dispose veto preserves mounted resources; successful close retires view before model', () => {
  const f = workspaceFixture(), feature = countedPanel(); f.workspace.register(feature.type);
  const renderer = new PanelRenderer(f.workspace, f.locale, () => surface); f.workspace.open(record('p'), 'left');
  assert.equal(renderer.status('p'), 'mounted'); assert.equal(f.workspace.close('p').allowed, false); assert.equal(f.workspace.dispose().allowed, false);
  assert.deepEqual(feature.log, []); feature.events[0](); assert.equal(feature.clicks, 1);
  feature.allowClose(); assert.equal(f.workspace.close('p').allowed, true);
  assert.deepEqual(feature.log, ['view.unmount', 'scope.cleanup', 'contribution.dispose', 'panel.dispose']);
  assert.equal(renderer.status('p'), undefined); feature.events[0](); assert.equal(feature.clicks, 1);
  renderer.dispose(); assert.equal(feature.viewDisposes, 1);
});

test('VA02 full workspace disposal emits teardown even without a final workspace notification', () => {
  const f = workspaceFixture(), feature = countedPanel(); feature.allowClose(); f.workspace.register(feature.type);
  const renderer = new PanelRenderer(f.workspace, f.locale, () => surface); f.workspace.open(record('p'), 'left');
  assert.equal(f.workspace.dispose().allowed, true); assert.equal(renderer.status('p'), undefined); assert.equal(feature.viewDisposes, 1);
  feature.events[0](); assert.equal(feature.clicks, 0); renderer.dispose();
});

test('VA03 surface acquisition failure during move revokes old callbacks and retry preserves contribution', () => {
  const f = workspaceFixture(), feature = countedPanel(); f.workspace.register(feature.type); let unavailable = true;
  const renderer = new PanelRenderer(f.workspace, f.locale, (_id,pane) => { if (pane === 'right' && unavailable) throw Error('SURFACE_UNAVAILABLE'); return surface; });
  const panel = f.workspace.open(record('p'), 'left'); const oldClick = feature.events[0];
  f.workspace.move('p', 'right'); assert.equal(renderer.status('p'), 'placeholder');
  oldClick(); assert.equal(feature.clicks, 0, 'old mount must lose event authority even when new surface acquisition throws');
  unavailable = false; renderer.retry('p'); assert.equal(renderer.status('p'), 'mounted');
  assert.equal(f.workspace.panel('p'), panel); assert.equal(feature.viewCreates, 1, 'mount retry does not discard contribution/controller state');
  feature.events.at(-1)!(); assert.equal(feature.clicks, 1); renderer.dispose();
});

test('VA04 same-ID reopen never revives async ticket or event from the old instance', async () => {
  const f = workspaceFixture(), feature = countedPanel(); feature.allowClose(); f.workspace.register(feature.type);
  const renderer = new PanelRenderer(f.workspace, f.locale, () => surface); f.workspace.open(record('p'), 'left');
  const oldScope = feature.scopes[0], oldTicket = oldScope.ticket(), oldClick = feature.events[0]; let accepted = 0, released = 0;
  f.workspace.close('p'); f.workspace.open(record('p'), 'left'); await Promise.resolve();
  assert.equal(oldScope.accept(oldTicket, () => { accepted++; }), false); oldClick(); oldScope.own(() => { released++; });
  assert.equal(accepted, 0); assert.equal(feature.clicks, 0); assert.equal(released, 1); assert.equal(feature.creates, 2);
  renderer.dispose();
});

test('VA05 partial mount failure releases all prior acquisitions even when one cleanup throws; retry keeps feature state', () => {
  const locale = new QualificationLocalization(); let attempts = 0, disposed = 0; const order: string[] = [];
  const contribution: PanelViewContribution = { kind: 'panel', capture: () => ({}), subscribe: () => () => {},
    mount: ({ scope }) => { scope.own(() => { order.push('a'); }); scope.own(() => { order.push('b'); throw Error('CLEANUP_FAILURE'); });
      if (++attempts === 1) throw Error('MOUNT_FAILURE'); return { update: () => {}, unmount: () => { order.push('unmount'); } }; },
    dispose: () => { disposed++; },
  };
  const session = new ViewSession(contribution, locale); session.mount(surface);
  assert.equal(session.status, 'placeholder'); assert.deepEqual(order, ['b','a']); assert.equal(disposed, 0);
  session.retry(); assert.equal(session.status, 'mounted'); session.dispose(); assert.equal(disposed, 1);
  assert.deepEqual(order, ['b','a','unmount','b','a']); assert.ok(session.issues.some(x => x.phase === 'cleanup'));
});

function widgetFixture(nested=false) {
  const f = workspaceFixture(); if(nested) { value(new NestedNetworkEditorQualification(f.context).enter(f.a)); value(f.context.select(['multiply'])); }
  const target = value(ScopedParameterTarget.openRouted({ context: f.context, subscribe: fn => f.context.subscribe(fn) }, nested ? 'multiply' : f.root, 'b'));
  const projections = new ScopedParameterWidgets(); projections.register({ id: 'adversarial.percent', accepts: p => p.dataType?.kind === 'scalar' && p.dataType.scalar === 'float', project: p => ({ percent: Number(p.value)*100 }) });
  const renderer = new WidgetRenderer(f.locale, projections); let draft: WidgetDraft | undefined, current: WidgetSnapshot<ParameterView> | undefined;
  let edit: (text: string) => void = () => {}, commit = () => {}, drafts = 0, updates = 0, immediateCalls = 0;
  const scopes: MountScope[] = [], directErrors: string[] = [];
  renderer.register({ widgetId: 'adversarial.percent', create: ({ binding }) => ({ kind: 'parameter-widget', capture: () => binding.capture(), subscribe: fn => binding.subscribe(fn),
    mount: ({ scope, commands }) => {
      scopes.push(scope);
      edit = scope.event((text: string) => { if (!draft) { draft = commands.draft(); drafts++; } draft.setText(text); });
      commit = scope.event(() => { draft!.commit(text => Number(text)/100); draft = undefined; });
      const immediate = scope.event(() => { immediateCalls++; commands.commit(99, binding.capture().editToken); }); immediate();
      try { commands.commit(99, binding.capture().editToken); } catch(e) { directErrors.push(String(e)); }
      return { update: projection => { updates++; current = projection; immediate(); } };
    }, dispose: () => { draft?.cancel(); draft = undefined; },
  }) });
  const session = renderer.open('adversarial.percent', target);
  return { ...f, target, renderer, session, scopes, directErrors, input: (text:string) => edit(text), commit: () => commit(), event: () => commit,
    get drafts() { return drafts; }, get updates() { return updates; }, get immediateCalls() { return immediateCalls; }, get current() { return current; }, get draftText() { return draft?.text; } };
}

test('VA06 custom projection matches custom view; mount/update cannot enter edit boundary', () => {
  const f = widgetFixture(); const before = f.graph.historyCounts.undo; f.session.mount(surface);
  assert.equal(f.current?.projection.widget, 'adversarial.percent'); assert.deepEqual(f.current?.projection.body, { percent: 100 });
  assert.equal(f.immediateCalls, 0); assert.ok(f.directErrors.every(x => x.includes('VIEW_EDIT_AUTHORITY'))); assert.equal(f.target.capture().value, 1); assert.equal(f.graph.historyCounts.undo, before);
  f.session.dispose();
});

test('VA07 nested draft survives unmount/show/locale and commits once to same scoped model', () => {
  const f = widgetFixture(true), before = f.graph.historyCounts.undo; f.session.mount(surface); f.input('275');
  assert.equal(f.drafts, 1); f.session.unmount(); f.locale.setLocale('ja'); f.session.mount(surface);
  assert.equal(f.draftText, '275'); assert.equal(f.drafts, 1); f.commit();
  assert.equal(f.target.capture().value, 2.75); assert.equal(f.graph.nodeById(f.root)!.parameter('b').read(), 1); assert.equal(f.graph.historyCounts.undo, before+1);
  f.session.dispose();
});

test('VA08 retained old event cannot write after navigation invalidates scoped target', () => {
  const f = widgetFixture(true); f.session.mount(surface); f.input('875'); const oldCommit = f.event(), oldScope=f.scopes[0], ticket:MountTicket=oldScope.ticket();
  value(new NestedNetworkEditorQualification(f.context).root()); const after=f.graph.historyCounts.undo;
  assert.equal(f.session.status, 'placeholder'); oldCommit(); assert.equal(f.graph.historyCounts.undo,after);
  assert.equal(oldScope.accept(ticket,()=>{throw Error('MUST_NOT_RUN');}),false); f.session.dispose();
});

test('VA09 pending UI draft can be cancelled by contribution cleanup without model edit authority', () => {
  const f = widgetFixture(); f.session.mount(surface); f.input('12'); const before=f.graph.exportJSON();
  f.session.dispose(); assert.equal(f.graph.exportJSON(),before); assert.equal(f.draftText,undefined);
  assert.equal(f.session.issues.filter(x=>x.phase==='cleanup').length,0,'ordinary draft cancellation during dispose must not throw VIEW_EDIT_AUTHORITY');
});

test('VA10 retained mounted event is revoked by dynamic type and interface removal; restoring type cannot revive it', () => {
  const ref={moduleId:'adversarial.typed',typeId:'field',version:'1',fingerprint:'fixture-only'};
  const modeSpec:ParameterSpec={key:'mode',target:{kind:'state',key:'mode'},presentation:'menu'};
  const fieldSpec:ParameterSpec={key:'value',target:{kind:'input',key:'value'},presentation:'number'};
  const node:NodeType={ref,role:'operation',stages:['pixel'],stateCodec:{schemaVersion:1,validate:s=>['float','int','none'].includes((s as {mode:string}).mode)?[]:['mode']},
    initialize:()=>({state:{mode:'float'}}),parameters:s=>(s as {mode:string}).mode==='none'?[modeSpec]:[modeSpec,fieldSpec],
    ports:s=>(s as {mode:string}).mode==='none'?[]:[{key:'value',direction:'input',type:(s as {mode:string}).mode,supply:'local',default:1}],validate:()=>[],emit:()=>({outputs:{}})};
  const module:NodeModule={manifest:{id:ref.moduleId,version:ref.version,fingerprint:ref.fingerprint,coreApiVersion:1,dependencies:[],source:'test',license:'test'},types:[node]};
  const registry=new Registry();value(registry.register(builtinModule));value(registry.register(module));
  const graph=new Graph({name:'Dynamic mounted field',definitions:registry.pin(),outputType:refs.output});
  const id=value(graph.change('add',d=>d.createNode(graph.stage('pixel').id,ref))),context=new ObservableEditorContext(graph);
  const target=value(ScopedParameterTarget.openRouted({context,subscribe:fn=>context.subscribe(fn)},id,'value'));
  const projections=new ScopedParameterWidgets();projections.register({id:'adversarial.float-only',accepts:p=>p.dataType?.kind==='scalar'&&p.dataType.scalar==='float',project:p=>({value:p.value})});
  const renderer=new WidgetRenderer(new QualificationLocalization(),projections);let event:()=>void=()=>{};
  renderer.register({widgetId:'adversarial.float-only',create:({binding})=>({kind:'parameter-widget',capture:()=>binding.capture(),subscribe:fn=>binding.subscribe(fn),
    mount:({scope,commands})=>{const token=binding.capture().editToken;event=scope.event(()=>commands.commit(7,token));return {update:()=>{}};},dispose:()=>{}})});
  const session=renderer.open('adversarial.float-only',target);session.mount(surface);const old=event;
  value(graph.nodeById(id)!.parameter('mode').write('int'));const afterType=graph.historyCounts.undo;
  assert.equal(session.status,'placeholder');old();assert.equal(target.read(),1);assert.equal(graph.historyCounts.undo,afterType);
  value(graph.nodeById(id)!.parameter('mode').write('float'));old();assert.equal(target.read(),1,'matching type later does not revive old event');
  session.retry();assert.equal(session.status,'mounted');const beforeRemoval=event;
  value(graph.nodeById(id)!.parameter('mode').write('none'));const afterRemove=graph.historyCounts.undo;
  assert.equal(session.status,'placeholder');beforeRemoval();assert.equal(graph.historyCounts.undo,afterRemove);session.dispose();
});

test('VA11 cleanup inside a user event cannot inherit the previous mount edit authority', () => {
  const f=widgetFixture();let unmount:()=>void=()=>{};let writes=0;let session:ViewSession;
  session=new ViewSession({kind:'parameter-widget',capture:()=>({projection:{},editToken:'fixture',writable:true}),subscribe:()=>()=>{},
    mount:({scope,commands})=>{scope.own(()=>commands.commit(99,'fixture'));unmount=scope.event(()=>session.unmount());return {update:()=>{}};},dispose:()=>{}},
    f.locale,{commit:()=>{writes++;},draft:()=>{throw Error('not used');}});
  session.mount(surface);unmount();assert.equal(session.status,'unmounted');assert.equal(writes,0,'revocation occurs before cleanup even while caller event is active');session.dispose();
});
