/** Direct FIR-B01 qualification. Fake surface proves lifecycle, not production browser rendering. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Graph, Registry } from '../core.ts';
import { builtinModule, refs } from '../nodes.ts';
import type { Json,NodeModule } from '../contracts.ts';
import { QualificationLocalization } from './localization.ts';
import { ContextDirectory,ObservableEditorContext,PanelWorkspace,type SavedPanel } from './public-panel-workspace.ts';
import { ScopedParameterTarget } from './scoped-parameter.ts';
import { PanelRenderer,WidgetRenderer,ViewSession } from './view-mount.ts';
import type { MountScope,MountSurface,PanelViewContribution } from '../../contracts/view-mount.ts';
import { registerExamples } from '../../examples/view-contributions/registration.ts';
import { textOwner } from '../../examples/view-contributions/headless-controls.ts';
import { value } from './scoped-fixtures.ts';
class Surface {
  live=0;opened=0;closed=0;paints:Json[]=[];listeners=new Map<string,(v:Json)=>void>();
  surface:MountSurface={protocol:'qualification.controls.v1',target:this};
  open(){this.opened++;this.live++;let closed=false;const own=new Set<string>();return {
    paint:(v:Json)=>{assert.equal(closed,false);this.paints.push(v);},on:(name:string,fn:(v:Json)=>void)=>{this.listeners.set(name,fn);own.add(name);return()=>{if(this.listeners.get(name)===fn)this.listeners.delete(name);};},
    dispose:()=>{assert.equal(closed,false);closed=true;this.live--;this.closed++;for(const k of own)this.listeners.delete(k);},
  };}
  fire(name:string,value:Json=null){this.listeners.get(name)?.(value);}
  get last(){return this.paints.at(-1) as Record<string,Json>;}
}
const record=(id:string,typeId:string,state:Json={}):SavedPanel=>({id,typeId,state,viewStateVersion:1,route:{mode:'follow'},linkGroup:0,hidden:false});
const boolRef={moduleId:'qualification.flag',typeId:'flag',version:'1',fingerprint:'flag-v1'};
function setup(){const registry=new Registry();value(registry.register(builtinModule));const module:NodeModule={manifest:{...builtinModule.manifest,id:boolRef.moduleId,version:'1',fingerprint:boolRef.fingerprint},types:[{
  ref:boolRef,role:'operation',stages:['pixel'],stateCodec:{schemaVersion:1,validate:s=>typeof (s as {enabled?:unknown}).enabled==='boolean'?[]:['BOOL_REQUIRED']},initialize:()=>({state:{enabled:false}}),ports:()=>[],
  parameters:()=>[{key:'enabled',target:{kind:'state',key:'enabled'},presentation:{widget:'core.boolean'}}],validate:()=>[],emit:()=>({outputs:{}}),
}]};value(registry.register(module));const graph=new Graph({name:'Views',definitions:registry.pin(),outputType:refs.output});
const ids=value(graph.change('Fixture',d=>({number:d.createNode(graph.stage('pixel').id,refs.constant,{value:3}),flag:d.createNode(graph.stage('pixel').id,boolRef)})));
const context=new ObservableEditorContext(graph),directory=new ContextDirectory();directory.add(context);directory.activate(context.id);const workspace=new PanelWorkspace(directory);workspace.createPane('left');workspace.createPane('right');
const locale=new QualificationLocalization();locale.registerModule({owner:textOwner,defaultLocale:'en'},{owner:textOwner,locale:'en',revision:1,messages:[{key:'help.title',text:'Help'},{key:'selection.title',text:'Selection'},{key:'number.title',text:'Value'},{key:'toggle.title',text:'Enabled'}]});
locale.addLocale({owner:textOwner,locale:'zh-TW',revision:1,messages:[{key:'help.title',text:'說明'},{key:'number.title',text:'數值'}]});const widgets=new WidgetRenderer(locale);registerExamples(workspace,widgets);
const target=(id:string,key:string)=>value(ScopedParameterTarget.openRouted({context,subscribe:fn=>context.subscribe(fn)},id,key));return {registry,graph,context,directory,workspace,locale,widgets,target,...ids};}

test('VM01 two independent Panel packages mount through one public workspace and generic renderer',()=>{const f=setup(),a=new Surface(),b=new Surface();const renderer=new PanelRenderer(f.workspace,f.locale,id=>id==='selection'?a.surface:b.surface);
f.workspace.open(record('selection','example.selection-summary'),'left');f.workspace.open(record('help','example.help'),'right');value(f.context.select([f.number]));assert.deepEqual(a.last.selection,[f.number]);assert.equal(b.last.target,f.number);assert.equal(renderer.status('selection'),'mounted');assert.equal(renderer.status('help'),'mounted');renderer.dispose();assert.equal(a.live+b.live,0);assert.equal(f.workspace.panels().length,2);});

test('VM02 help private expansion survives hide/move/remount; stale old controls revoked',()=>{const f=setup(),a=new Surface(),b=new Surface();const r=new PanelRenderer(f.workspace,f.locale,(_id,pane)=>pane==='left'?a.surface:b.surface);const panel=f.workspace.open(record('help','example.help'),'left');const old=a.listeners.get('expand')!;a.fire('expand');assert.equal(a.last.expanded,false);f.workspace.hide('help',true);assert.equal(a.live,0);old(null);assert.deepEqual(panel.exportViewState(),{expanded:false});f.workspace.move('help','right');f.workspace.hide('help',false);assert.equal(f.workspace.panel('help'),panel);assert.equal(b.last.expanded,false);b.fire('expand');assert.equal(b.last.expanded,true);assert.equal(f.graph.historyCounts.undo,1);r.dispose();});

test('VM03 selection and locale updates render but do not mutate Graph/History',()=>{const f=setup(),s=new Surface();new PanelRenderer(f.workspace,f.locale,()=>s.surface);f.workspace.open(record('help','example.help'),'left');const document=f.graph.snapshot().document,history=f.graph.historyCounts;f.locale.setLocale('zh-TW');assert.equal(s.last.title,'說明');value(f.context.select([f.number]));assert.equal(s.last.target,f.number);assert.deepEqual(f.graph.snapshot().document,document);assert.deepEqual(f.graph.historyCounts,history);});

test('VM04 mount failure cleans partial resources, placeholder retry preserves Panel state',()=>{const f=setup(),s=new Surface();let fail=true,disposed=0;f.workspace.register({typeId:'fail',viewStateVersion:1,create:({id})=>({id,typeId:'fail',restoreViewState:()=>({restored:true}),exportViewState:()=>({expanded:false}),receive(){},setVisible(){},canClose:()=>({allowed:true}),dispose(){},createView:()=>({kind:'panel',capture:()=>({}),subscribe:()=>()=>{},dispose:()=>{disposed++;},mount:ctx=>{const view=s.open();ctx.scope.own(()=>view.dispose());if(fail)throw Error('MOUNT_FAIL');return {update:()=>view.paint({ok:true})};}})})});const r=new PanelRenderer(f.workspace,f.locale,()=>s.surface);const p=f.workspace.open(record('x','fail'),'left');assert.equal(r.status('x'),'placeholder');assert.equal(s.live,0);assert.equal(disposed,0);fail=false;r.retry('x');assert.equal(r.status('x'),'mounted');assert.equal(f.workspace.panel('x'),p);assert.equal(disposed,0);value(f.graph.history.undo());f.workspace.close('x');assert.equal(disposed,1);assert.equal(s.live,0);});

test('VM05 update failure revokes all mount resources before placeholder and retry',()=>{const f=setup(),s=new Surface();let notify=()=>{},fail=false;const c:PanelViewContribution={kind:'panel',capture:()=>({}),subscribe:fn=>{notify=fn;return()=>{};},dispose(){},mount:ctx=>{const v=s.open();ctx.scope.own(()=>v.dispose());return {update:()=>{if(fail)throw Error('UPDATE_FAIL');v.paint({ok:true});}};}};const session=new ViewSession(c,f.locale);session.mount(s.surface);fail=true;notify();assert.equal(session.status,'placeholder');assert.equal(s.live,0);fail=false;session.retry();assert.equal(s.live,1);session.dispose();assert.equal(s.live,0);});

test('VM06 dispose fences async work; cleanup registered after revoke executes immediately',async()=>{const f=setup();let scope!:MountScope,cleanups=0,calls=0;const c:PanelViewContribution={kind:'panel',capture:()=>({}),subscribe:()=>()=>{},dispose(){},mount:ctx=>{scope=ctx.scope;return {update(){}};}};const session=new ViewSession(c,f.locale);session.mount({protocol:'fake',target:{}});const ticket=scope.ticket();session.dispose();await Promise.resolve();scope.own(()=>cleanups++);assert.equal(scope.accept(ticket,()=>calls++),false);assert.equal(cleanups,1);assert.equal(calls,0);});

test('VM07 number field draft survives unmount/remount and commits through scoped target once',()=>{const f=setup(),s=new Surface(),t=f.target(f.number,'value'),session=f.widgets.open('core.number',t);session.mount(s.surface);const old=s.listeners.get('commit')!;s.fire('input','12');assert.equal(t.read(),3);assert.equal(s.last.text,'12');session.unmount();old(null);assert.equal(t.read(),3);session.mount(s.surface);assert.equal(s.last.text,'12');s.fire('commit');assert.equal(t.read(),12);assert.equal(f.graph.historyCounts.undo,2);value(f.graph.history.undo());assert.equal(s.last.text,'3');session.dispose();t.dispose();});

test('VM08 toggle feature uses same registered mount path and retains bool semantics',()=>{const f=setup(),s=new Surface(),t=f.target(f.flag,'enabled'),session=f.widgets.open('core.boolean',t);session.mount(s.surface);assert.equal(s.last.checked,false);const stale=s.listeners.get('toggle')!;s.fire('toggle');assert.equal(t.read(),true);assert.equal(s.last.checked,true);session.dispose();stale(null);assert.equal(t.read(),true);assert.equal(s.live,0);});

test('VM09 field draft rejects concurrent target change, retains text for user recovery',()=>{const f=setup(),s=new Surface(),t=f.target(f.number,'value'),session=f.widgets.open('core.number',t);session.mount(s.surface);s.fire('input','22');value(t.write(8));s.fire('commit');assert.equal(t.read(),8);assert.equal(s.last.text,'22');assert.match(session.issues.at(-1)!.message,/FIELD_STALE/);s.fire('cancel');assert.equal(s.last.text,'8');});

test('VM10 mount/update cannot invoke widget model commands',()=>{const f=setup(),s=new Surface(),t=f.target(f.number,'value'),w=new WidgetRenderer(f.locale);w.register({widgetId:'core.number',create:({binding})=>({kind:'parameter-widget',capture:()=>binding.capture(),subscribe:fn=>binding.subscribe(fn),dispose(){},mount:ctx=>({update:p=>ctx.commands.commit(90,p.editToken)})})});const session=w.open('core.number',t);session.mount(s.surface);assert.equal(session.status,'placeholder');assert.equal(t.read(),3);assert.match(session.issues.at(-1)!.message,/VIEW_EDIT_AUTHORITY/);});

test('VM11 scoped target disposal invalidates widget display and fences pending actions',()=>{const f=setup(),s=new Surface(),t=f.target(f.number,'value'),session=f.widgets.open('core.number',t);session.mount(s.surface);s.fire('input','14');const stale=s.listeners.get('commit')!;t.dispose();assert.equal(session.status,'placeholder');assert.equal(s.live,0);stale(null);assert.equal(f.graph.nodeById(f.number)!.parameter('value').read(),3);});

test('VM12 inactive tab releases mount only, not private Panel state',()=>{const f=setup(),surfaces=new Map<string,Surface>([['help',new Surface()],['selection',new Surface()]]);const r=new PanelRenderer(f.workspace,f.locale,id=>surfaces.get(id)!.surface);const p=f.workspace.open(record('help','example.help'),'left');surfaces.get('help')!.fire('expand');f.workspace.open(record('selection','example.selection-summary'),'left');f.workspace.activate('selection');assert.equal(r.status('help'),'unmounted');f.workspace.activate('help');assert.equal(f.workspace.panel('help'),p);assert.equal(surfaces.get('help')!.last.expanded,false);});

test('VM13 guarded workspace close/dispose preserves mount until guard allows',()=>{const f=setup(),s=new Surface();let allowed=false,disposed=0;f.workspace.register({typeId:'guard',viewStateVersion:1,create:({id})=>({id,typeId:'guard',restoreViewState:()=>({restored:true}),exportViewState:()=>({}),receive(){},setVisible(){},canClose:()=>({allowed}),dispose:()=>disposed++,createView:()=>({kind:'panel',capture:()=>({}),subscribe:()=>()=>{},dispose(){},mount:ctx=>{const v=s.open();ctx.scope.own(()=>v.dispose());return {update(){}};}})})});new PanelRenderer(f.workspace,f.locale,()=>s.surface);f.workspace.open(record('guard','guard'),'left');assert.equal(f.workspace.close('guard').allowed,false);assert.equal(f.workspace.dispose().allowed,false);assert.equal(s.live,1);assert.equal(disposed,0);allowed=true;assert.equal(f.workspace.dispose().allowed,true);assert.equal(s.live,0);assert.equal(disposed,1);});

test('VM14 missing Widget view is explicit placeholder and registry retry resolves it',()=>{const f=setup(),s=new Surface(),t=f.target(f.flag,'enabled'),w=new WidgetRenderer(f.locale);const session=w.open('core.boolean',t);session.mount(s.surface);assert.equal(session.status,'placeholder');registerExamples(new PanelWorkspace(new ContextDirectory()),w);session.retry();assert.equal(session.status,'mounted');s.fire('toggle');assert.equal(t.read(),true);});

test('VM15 incompatible technology protocol yields controlled placeholder',()=>{const f=setup();const r=new PanelRenderer(f.workspace,f.locale,()=>({protocol:'unrelated.tech',target:{}}));f.workspace.open(record('help','example.help'),'left');assert.equal(r.status('help'),'placeholder');assert.match(r.issues('help')[0].message,/UNSUPPORTED_VIEW_SURFACE/);});

test('VM16 restored Help projection uses private viewState before initial mount',()=>{const f=setup(),s=new Surface();new PanelRenderer(f.workspace,f.locale,()=>s.surface);f.workspace.open(record('help','example.help',{expanded:false}),'left');assert.equal(s.last.expanded,false);assert.deepEqual(f.workspace.save().panels[0].state,{expanded:false});});

test('VM17 generic renderer has no feature imports, class checks, or Graph/History mutation',()=>{const source=fs.readFileSync(new URL('./view-mount.ts',import.meta.url),'utf8');assert.doesNotMatch(source,/SelectionSummary|HelpPanel|toggleWidget|numberWidget|instanceof|\.graph\b|\.history\b/);assert.doesNotMatch(source,/switch\s*\(/);});


test('VM18 malformed feature viewState becomes opaque workspace placeholder before view creation',()=>{for(const state of (['bad',{expanded:'false'},{expanded:false,unknown:1}] as Json[])){const f=setup(),s=new Surface();const r=new PanelRenderer(f.workspace,f.locale,()=>s.surface);f.workspace.open(record('help','example.help',state),'left');assert.equal(r.status('help'),'placeholder');assert.equal(s.opened,0);assert.deepEqual(f.workspace.save().panels[0].state,state);assert.match(f.workspace.issues[0].message,/HELP_STATE/);}});
