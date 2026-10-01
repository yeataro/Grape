import test from 'node:test';
import assert from 'node:assert/strict';
import {exercise,unwrap} from '../scenario.ts';
import {Editor,Graph,Registry} from '../core.ts';
import {builtinModule,refs} from '../nodes.ts';
import {generate} from '../generator.ts';
import type {Json,NodeModule,NodeType,ParameterSpec,PortSpec} from '../contracts.ts';
import {WidgetRegistry,Preferences,Actions,ParameterWidgets} from '../qualification-presentation.ts';
test('PQ01 interchangeable widget projection reads model/context but holds no editable graph copy',async()=>{
 const {graph,ids}=await exercise(),editor=new Editor(),a=editor.open(graph),b=editor.open(graph),widgets=new WidgetRegistry();
 unwrap(a.select([ids.constant]));unwrap(b.select([ids.compose]));const before=graph.exportJSON();
 widgets.register({id:'node-title',project:({snapshot,primary,locale},services)=>({id:'node-title',text:services.translate(snapshot.document.stages.flatMap(s=>s.nodes).find(n=>n.id===primary)!.name,locale),enabled:true,style:{maxWidth:services.measure('title','ui')}})});
 const services={translate:(t:string,l:string)=>l+':'+t,measure:()=>100};
 const va=widgets.project('node-title',a,'zh',{},services),vb=widgets.project('node-title',b,'ja',{},services);
 assert.notEqual(va.text,vb.text);va.style.maxWidth=99;assert.equal(widgets.project('node-title',a,'zh',{},services).style.maxWidth,100);assert.equal(graph.exportJSON(),before);
 assert.equal(widgets.project('absent',a,'zh',{},services).enabled,false);assert.throws(()=>widgets.register({id:'node-title',project:()=>va}),/DUPLICATE/);
});
test('PQ02 preferences validate atomically, preserve unknown extension data, and stay outside Graph history',async()=>{
 const {graph}=await exercise(),before=graph.exportJSON(),history=graph.historyCounts;
 const prefs=new Preferences(p=>{if(typeof p.scale!=='number'||p.scale<0.2||p.scale>2)throw Error('SCALE');});let notices=0;
 prefs.subscribe(()=>{throw Error('bad observer');});prefs.subscribe(()=>notices++);
 prefs.update({scale:1,locale:'zh-TW',pluginSetting:{future:true}});const valid=prefs.serialize();
 assert.throws(()=>prefs.update({scale:0.1}));assert.equal(prefs.serialize(),valid);assert.equal(notices,1);
 const restored=new Preferences(()=>{});restored.restore(valid);assert.deepEqual(restored.snapshot().pluginSetting,{future:true});
 assert.throws(()=>restored.restore('[]'));assert.equal(graph.exportJSON(),before);assert.deepEqual(graph.historyCounts,history);assert.equal(prefs.observerErrors.length,1);
});
test('PQ03 menu, shortcut and button share guarded action without confusing IME/text focus/model transaction',async()=>{
 const {graph,ids}=await exercise(),context=new Editor().open(graph),actions=new Actions();
 const input={context,readonly:false,ime:false,textFocus:false};
 actions.register({id:'rename',enabled:()=>true,invoke:({context})=>unwrap(context.change('Rename',d=>d.rename(ids.constant,'renamed')))});
 const old=graph.exportJSON();for(const condition of ['readonly','ime','textFocus']as const)assert.equal(actions.run('rename',{...input,[condition]:true}),'blocked');
 assert.equal(graph.exportJSON(),old);assert.equal(actions.run('rename',input),'executed');assert.match(graph.exportJSON(),/renamed/);
 unwrap(graph.history.undo());assert.equal(graph.exportJSON(),old);
 const op=unwrap(graph.beginOperation('busy'));assert.equal(actions.run('rename',input),'blocked');unwrap(op.cancel());
});

function parameterFixture(){
 const typeRef={moduleId:'qualification.presentation',typeId:'controls',version:'1',fingerprint:'q-presentation-1'};
 const input=(key:string,type:string,value:any):PortSpec=>({key,type,direction:'input',supply:'local',default:value});
 const mode=(s:Json)=>(s as {mode:string}).mode;
 const spec=(key:string,widget:string):ParameterSpec=>({key,target:{kind:'input',key},presentation:{widget}});
 const nodeType:NodeType={ref:typeRef,role:'operation',stages:['pixel'],stateCodec:{schemaVersion:1,validate:s=>s&&typeof s==='object'&&!Array.isArray(s)&&['A','B'].includes(String(s.mode))?[]:['mode']},
  initialize:()=>({state:{mode:'A'}}),ports:s=>[input('enabled','bool',true),input('color','vec3',[.2,.4,.6]),...(mode(s)==='A'?[input('matrix','mat2',[1,0,0,1])]:[]),{key:'out',type:'vec4',direction:'output'}],
  parameters:s=>[spec('enabled','core.boolean'),spec('color','core.color'),...(mode(s)==='A'?[spec('matrix','core.matrix')]:[]),{key:'mode',target:{kind:'state',key:'mode'},presentation:{widget:'core.menu',options:{items:[{value:'A',label:'Alpha'},{value:'B',label:'Beta'}]}}}],
  validate:()=>[],emit:(_,ctx)=>({outputs:{out:{type:'vec4',code:`vec4(${ctx.input('color').code}, 1.0)`}}})};
 const module:NodeModule={manifest:{id:typeRef.moduleId,version:'1',fingerprint:typeRef.fingerprint,coreApiVersion:1,dependencies:[],source:'qualification',license:'test'},types:[nodeType]};
 const registry=new Registry();unwrap(registry.register(builtinModule));unwrap(registry.register(module));
 const graph=new Graph({name:'Parameter widget boundary',definitions:registry.pin(),outputType:refs.output});
 const id=unwrap(graph.change('create',d=>d.createNode(graph.stage('pixel').id,typeRef)));
 unwrap(graph.change('connect',d=>d.connect(graph.nodeById(id)!.output('out'),graph.stage('pixel').node('output')!.input('color'))));
 return{graph,id,context:new Editor().open(graph),widgets:new ParameterWidgets()};
}

test('PQ04 bool/color/matrix presentation is typed metadata; rendering and style overrides do not change GLSL or history',()=>{
 const {graph,id,context,widgets}=parameterFixture(),before=graph.exportJSON(),history=graph.historyCounts,code=unwrap(generate(graph.snapshot())).pixel;
 const boolean=widgets.project(context,id,'enabled'),color=widgets.project(context,id,'color'),matrix=widgets.project(context,id,'matrix');
 assert.equal(boolean.widget,'core.boolean');assert.equal(color.widget,'core.color');assert.equal(matrix.widget,'core.matrix');
 assert.deepEqual(matrix.field.dataType,{kind:'matrix',scalar:'float',columns:2,rows:2});assert.equal((matrix.body as any).major,'column');
 assert.equal(widgets.project(context,id,'color',{widget:'core.components'}).widget,'core.components');
 assert.equal(graph.exportJSON(),before);assert.deepEqual(graph.historyCounts,history);assert.equal(unwrap(generate(graph.snapshot())).pixel,code);
});

test('PQ05 missing/incompatible custom widgets use type-safe fallback without changing or dropping values',()=>{
 const {graph,id,context,widgets}=parameterFixture(),before=graph.exportJSON();
 const absent=widgets.project(context,id,'color',{widget:'custom.missing',options:{future:{retain:true}}});
 assert.equal(absent.widget,'core.components');assert.equal(absent.fallback,true);assert.deepEqual(absent.field.value,[.2,.4,.6]);
 assert.deepEqual(absent.field.presentation.options,{future:{retain:true}});
 assert.equal(widgets.project(context,id,'matrix',{widget:'core.color'}).widget,'core.matrix');
 const disabled=widgets.project(context,id,'color',{widget:'custom.missing',fallback:'none'});assert.equal(disabled.widget,'core.readonly');assert.equal(disabled.writable,false);
 assert.equal(graph.exportJSON(),before);
});

test('PQ06 reusable custom widgets only receive frozen projections; failure falls back and cannot mutate Graph',()=>{
 const {graph,id,context,widgets}=parameterFixture(),before=graph.exportJSON();
 widgets.register({id:'custom.swatch',accepts:f=>f.dataType?.kind==='vector',project:f=>({channels:f.value,appearance:'swatch'})});
 const view=widgets.project(context,id,'color',{widget:'custom.swatch'});assert.equal(view.fallback,false);(view.body as any).channels[0]=99;
 assert.deepEqual(graph.nodeById(id)!.parameter('color').read(),[.2,.4,.6]);
 widgets.register({id:'custom.invalid',accepts:()=>true,project:f=>{(f.value as number[])[0]=99;return{};}});
 assert.equal(widgets.project(context,id,'color',{widget:'custom.invalid'}).widget,'core.components');assert.equal(graph.exportJSON(),before);
 assert.throws(()=>widgets.register({id:'custom.swatch',accepts:()=>true,project:()=>null}),/DUPLICATE_PARAMETER_WIDGET/);
});

test('PQ07 edits remain Parameter/Graph operations: type rejection, matrix write/Undo, menu codec, stale dynamic handle',()=>{
 const {graph,id,context,widgets}=parameterFixture(),node=graph.nodeById(id)!;
 const before=graph.exportJSON();assert.equal(node.parameter('enabled').write(1).ok,false);assert.equal(node.parameter('color').write([1,2]).ok,false);assert.equal(node.parameter('mode').write('INVALID').ok,false);assert.equal(graph.exportJSON(),before);
 unwrap(node.parameter('enabled').write(false));assert.equal(widgets.project(context,id,'enabled').field.value,false);
 unwrap(node.parameter('matrix').write([2,0,0,3]));assert.deepEqual(node.parameter('matrix').read(),[2,0,0,3]);unwrap(graph.history.undo());assert.deepEqual(node.parameter('matrix').read(),[1,0,0,1]);
 const old=node.parameter('matrix');unwrap(node.parameter('mode').write('B'));assert.equal(old.write([1,0,0,1]).ok,false);assert.throws(()=>widgets.project(context,id,'matrix'),/Parameter unavailable/);
});

test('PQ08 connected input and closed context cannot be presented as writable standalone controls',()=>{
 const {graph,id,context,widgets}=parameterFixture();
 const constant=unwrap(graph.change('source',d=>d.createNode(graph.stage('pixel').id,refs.constant,{value:.5})));
 unwrap(graph.change('wire',d=>d.connect(graph.nodeById(constant)!.output('out'),graph.nodeById(id)!.input('color'))));
 assert.equal(widgets.project(context,id,'color').writable,false);context.dispose();assert.throws(()=>widgets.project(context,id,'color'),/CONTEXT_CLOSED/);
});
