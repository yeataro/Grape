import test from 'node:test';
import assert from 'node:assert/strict';
import { Graph, Registry } from '../core.ts';
import { builtinModule, refs } from '../nodes.ts';
import { TargetSelection,invalidateTargetDocument,inspectTargetDocument,publishInspected,capturePreview,TextureBinding,authorize, ControlLayout, FencedArtifactReceiver, HostServices, HostValueHistory, InputMirror, InputValueStore, LiveGestures, NativeDefinitionHistory, NativeDefinitions, OwnerQueue, PreviewSession, ReviewTickets, verifyBootstrap } from '../qualification-host.ts';
import type { ResolvedTexture,TextureResolver,TextureState,ArtifactExecutor, BindingLease, Delivery, HostArtifact, InputField, NativeRecord, PreparedCandidate, TargetIdentity } from '../qualification-host.ts';

const identity:TargetIdentity={hostId:'host-a',targetId:'target-a',incarnation:'born-1'};
const artifact=(key:string):HostArtifact=>({codeKey:key,schemaKey:'schema1',code:key,sources:[{id:'roughness',type:'float',defaultValue:.5}],document:{name:key}});
class Candidate implements PreparedCandidate { disposed=false;dispose(){this.disposed=true;} }
class FakeExecutor implements ArtifactExecutor {
  commits=0;prepares=0; outcome:'committed'|'retained'|'indeterminate'='committed';
  failPrepare=false;throwCommit=false;candidates:Candidate[]=[];
  async prepare(){this.prepares++;if(this.failPrepare)throw Error('compile rejected');const c=new Candidate();this.candidates.push(c);return c;}
  commit(){this.commits++;if(this.throwCommit)throw Error('host died');return this.outcome;}
}
class ControlledExecutor extends FakeExecutor {
  waiting:((candidate:Candidate)=>void)[]=[];
  override async prepare(){this.prepares++;return new Promise<Candidate>(resolve=>this.waiting.push(resolve));}
  finish(index:number){const c=new Candidate();this.candidates.push(c);this.waiting[index](c);}
}
function receiver(executor:ArtifactExecutor=new FakeExecutor()){
  const host=new FencedArtifactReceiver(identity,executor),lease=host.bind('binding','graph','load1');
  const request=(seq:number,key:string,revision=host.observed().revision):Delivery=>({requestId:'request'+seq,lease,intentSeq:seq,expectedHostRevision:revision,artifact:artifact(key)});
  return{host,lease,request};
}
const field=(id='v',value=0):InputField=>({id,value,type:'float',shapeId:'shape1',driverId:'driver1',revision:0,writable:true});
const setupValues=()=>{const store=new InputValueStore();store.seed(field());store.seed(field('unrelated',12));return {store,live:new LiveGestures(store)};};

test('HQ-01 bootstrap checks target incarnation, expiry and host identity; names/addresses are not identity',()=>{
  const d={expectedHostId:'host-a',targetId:'target-a',incarnation:'born-1',expiresAt:10};
  assert.deepEqual(verifyBootstrap(d,identity,9),identity);
  assert.throws(()=>verifyBootstrap(d,{...identity,incarnation:'born-2'},9),/WRONG_INSTANCE/);
  assert.throws(()=>verifyBootstrap(d,{...identity,hostId:'host-b'},9),/WRONG_INSTANCE/);
  assert.throws(()=>verifyBootstrap(d,identity,10),/BOOTSTRAP_EXPIRED/);
});

test('HQ-02 three deployment compositions share service contract but missing capabilities remain unavailable (all fake)',()=>{
  for(const profile of ['static-web','node-hosted','electron'] as const){
    const services=new HostServices(profile,[{name:'artifact-apply',environmentEvidence:'fake'}]);
    assert.equal(services.require('artifact-apply').name,'artifact-apply');
    assert.throws(()=>services.require('native-window'),/CAPABILITY_UNAVAILABLE/);
  }
  assert.throws(()=>new HostServices('electron',[{name:'artifact-apply',environmentEvidence:'fake'},{name:'artifact-apply',environmentEvidence:'fake'}]),/DUPLICATE_SERVICE/);
});

test('HQ-03 late old compilation cannot publish after newer intent; disposed candidates do not leak',async()=>{
  const exec=new ControlledExecutor(),{host,request}=receiver(exec);
  const older=host.receive(request(1,'old')),newer=host.receive(request(2,'new'));
  exec.finish(1);assert.equal((await newer).status,'applied');exec.finish(0);
  assert.equal((await older).status,'superseded');assert.equal(host.observed().artifact?.code,'new');
  assert.equal(exec.commits,1);assert.ok(exec.candidates.every(c=>c.disposed));
});

test('HQ-04 revoke or same-path reincarnation fences an in-flight commit',async()=>{
  for(const replacement of [false,true]){
    const exec=new ControlledExecutor(),{host,request}=receiver(exec);const old=host.receive(request(1,'old'));
    if(replacement)host.replaceTarget({...identity,incarnation:'born-2'});else host.revoke();
    exec.finish(0);assert.equal((await old).status,'superseded');assert.equal(exec.commits,0);
    await assert.rejects(host.receive(request(2,'late')),/STALE_LEASE/);
  }
});

test('HQ-05 request retry returns same receipt; changed payload under same request ID rejects',async()=>{
  const exec=new FakeExecutor(),{host,request}=receiver(exec),r=request(1,'first');
  const a=host.receive(r),b=host.receive(structuredClone(r));assert.equal(a,b);assert.equal((await a).status,'applied');
  await assert.rejects(host.receive({...r,artifact:artifact('changed')}),/REQUEST_ID_REUSED/);assert.equal(exec.commits,1);
});

test('HQ-06 failed candidate retains last-good but commit uncertainty blocks further writes honestly',async()=>{
  const exec=new FakeExecutor(),{host,request}=receiver(exec);await host.receive(request(1,'good'));
  exec.failPrepare=true;assert.equal((await host.receive(request(2,'bad'))).status,'retained');assert.equal(host.observed().artifact?.code,'good');
  exec.failPrepare=false;exec.throwCommit=true;assert.equal((await host.receive(request(3,'uncertain'))).status,'indeterminate');
  assert.equal(host.observed().uncertain,true);await assert.rejects(host.receive(request(4,'cannot-guess')),/HOST_STATE_UNKNOWN/);
});

test('HQ-07 layout-only delivery saves latest document without compiling; compatible schema keeps host values',async()=>{
  const exec=new FakeExecutor(),{host,request}=receiver(exec);await host.receive(request(1,'a'));
  host.setObservedInput('roughness',.9);
  const r=request(2,'a');r.artifact.document={name:'renamed',position:[4,5]};r.artifact.sources[0].defaultValue=.1;
  const receipt=await host.receive(r);assert.equal(receipt.shaderUpdated,false);assert.equal(exec.prepares,1);
  assert.equal(host.observed().values.roughness.value,.9);assert.deepEqual(host.observed().artifact?.document,r.artifact.document);
});

test('HQ-08 source type change rejects unless explicit reset; new sources initialize independently',async()=>{
  const {host,request}=receiver();await host.receive(request(1,'a'));host.setObservedInput('roughness',.9);
  const r=request(2,'b');r.artifact.schemaKey='schema2';r.artifact.sources=[{id:'roughness',type:'int',defaultValue:1},{id:'new',type:'float',defaultValue:.3}];
  assert.equal((await host.receive(r)).reason,'SOURCE_SHAPE_CONFLICT');assert.equal(host.observed().values.roughness.value,.9);
  assert.equal((await host.receive({...r,requestId:'reset',intentSeq:3,resetSourceIds:['roughness']})).status,'applied');
  assert.equal(host.observed().values.roughness.value,1);assert.equal(host.observed().values.new.value,.3);
});

test('HQ-09 Undo-to-A is a new intent even if host last observed A and B is compiling',async()=>{
  const exec=new ControlledExecutor(),{host,request}=receiver(exec);
  const initial=host.receive(request(1,'A'));exec.finish(0);await initial;
  const b=host.receive(request(2,'B'));const a=await host.receive(request(3,'A'));
  assert.equal(a.status,'applied');assert.equal(a.shaderUpdated,false);exec.finish(1);
  assert.equal((await b).status,'superseded');assert.equal(host.observed().artifact?.code,'A');
});

test('HQ-10 a group value write validates every member before mutation',()=>{
  const {store}=setupValues();const before=store.read('v');
  assert.throws(()=>store.write([{expected:before,value:1},{expected:store.read('unrelated'),value:NaN}]),/INVALID_VALUE/);
  assert.deepEqual(store.read('v'),before);
  store.seed({...field(),type:'int'});assert.throws(()=>store.write([{expected:store.read('v'),value:.5}]),/INVALID_VALUE/);
});

test('HQ-11 continuous values form one receipt; same finish is idempotent and Undo excludes unrelated values',()=>{
  const {store,live}=setupValues();live.begin('g',[store.read('v')]);live.update('g',1,[1]);live.update('g',2,[2]);
  const receipt=live.finish('g')!;assert.deepEqual(live.finish('g'),receipt);
  const history=new HostValueHistory(store,receipt);store.write([{expected:store.read('unrelated'),value:99}]);
  history.restore('undo');assert.equal(store.read('v').value,0);assert.equal(store.read('unrelated').value,99);
  history.restore('redo');assert.equal(store.read('v').value,2);
});

test('HQ-12 stale update / changed source shape / changed driver cannot be applied by old gesture or Undo',()=>{
  const {store,live}=setupValues();live.begin('g',[store.read('v')]);live.update('g',1,[1]);
  assert.throws(()=>live.update('g',1,[2]),/OLD_SEQUENCE/);
  const history=new HostValueHistory(store,live.finish('g')!);store.seed({...store.read('v'),driverId:'external-new-driver'});
  assert.throws(()=>history.restore('undo'),/VALUE_CONFLICT/);assert.throws(()=>history.restore('redo'),/HISTORY_BLOCKED/);
  live.begin('next',[store.read('v')]);store.seed({...store.read('v'),shapeId:'new-shape'});
  assert.throws(()=>live.update('next',1,[3]),/VALUE_CONFLICT/);
});

test('HQ-13 cancel compensates only still-owned value; disconnect seals last accepted state',()=>{
  const {store,live}=setupValues();live.begin('cancel',[store.read('v')]);live.update('cancel',1,[3]);assert.equal(live.finish('cancel',true),null);assert.equal(store.read('v').value,0);
  live.begin('race',[store.read('v')]);live.update('race',1,[4]);store.write([{expected:store.read('v'),value:5}]);
  assert.throws(()=>live.finish('race',true),/VALUE_CONFLICT/);assert.equal(store.read('v').value,5);
  const completed=live.disconnect();assert.equal(completed.length,1);assert.equal(store.read('v').value,5);
  assert.throws(()=>new HostValueHistory(store,completed[0]).restore('undo'),/VALUE_CONFLICT/);
});

test('HQ-14 host live and layout histories do not mutate Graph defaults, revision, or Graph history',()=>{
  const registry=new Registry();assert.equal(registry.register(builtinModule).ok,true);
  const graph=new Graph({name:'independent',definitions:registry.pin(),outputType:refs.output});
  const before=graph.exportJSON(),revision=graph.revision,history=graph.history.length;
  const {store,live}=setupValues();live.begin('g',[store.read('v')]);live.update('g',1,[.5]);live.finish('g');
  const layout=new ControlLayout(store);layout.edit(rows=>rows.push({id:'c',sourceId:'v',page:'Inputs',label:'V',style:'slider',section:false,externalReferences:0,definitionEditable:true}));
  layout.restore('undo');assert.equal(store.read('v').value,.5);
  assert.equal(graph.exportJSON(),before);assert.equal(graph.revision,revision);assert.equal(graph.history.length,history);
});

test('HQ-15 mirror gaps request snapshot; snapshot may jump; stale epoch/schema never contaminates values',()=>{
  const m=new InputMirror(1,'s');assert.equal(m.receive({epoch:1,schemaId:'s',revision:1,kind:'snapshot',values:{a:1}}),true);
  assert.equal(m.receive({epoch:1,schemaId:'s',revision:3,baseRevision:2,kind:'delta',values:{b:3}}),false);assert.equal(m.needsSnapshot,true);
  assert.deepEqual(m.read().values,{a:1});assert.equal(m.receive({epoch:1,schemaId:'s',revision:4,kind:'snapshot',values:{a:2,b:3}}),true);
  assert.equal(m.receive({epoch:2,schemaId:'s',revision:9,kind:'snapshot',values:{a:99}}),false);
  assert.equal(m.receive({epoch:1,schemaId:'old',revision:9,kind:'snapshot',values:{a:99}}),false);assert.deepEqual(m.read().values,{a:2,b:3});
});

test('HQ-16 control removal and definition Undo preserve current live values; external references block removal',()=>{
  const {store}=setupValues(),layout=new ControlLayout(store);
  layout.edit(r=>r.push({id:'c',sourceId:'v',page:'Inputs',label:'V',style:'slider',section:false,externalReferences:0,definitionEditable:true}));
  layout.edit(r=>{r[0].label='Renamed';});store.write([{expected:store.read('v'),value:42}]);layout.restore('undo');
  assert.equal(layout.read()[0].label,'V');assert.equal(store.read('v').value,42);
  layout.edit(r=>{r[0].externalReferences=1;});assert.throws(()=>layout.edit(r=>r.splice(0)),/EXTERNAL_REFERENCES/);assert.equal(layout.read().length,1);
});

test('HQ-17 preview input has a normalized origin; no isolated delta, stale lease, or unreleased pointer',()=>{
  const p=new PreviewSession(),lease=p.claim(identity);
  assert.throws(()=>p.receive({lease,sequence:1,kind:'move',pointerId:1,x:.5,y:.5}),/NO_POINTER_ORIGIN/);
  p.receive({lease,sequence:1,kind:'down',pointerId:1,x:.5,y:.5});p.receive({lease,sequence:2,kind:'move',pointerId:1,x:.6,y:.5});
  assert.ok(Math.abs(p.events.at(-1)!.dx!-.1)<1e-10);
  p.setVisible(false);assert.equal(p.events.at(-1)!.kind,'release');p.setVisible(true);
  p.claim({...identity,incarnation:'new'});assert.throws(()=>p.receive({lease,sequence:3,kind:'down',pointerId:1,x:.1,y:.1}),/STALE_PREVIEW/);
});

test('HQ-18 capture hold belongs to a target session and cannot freeze or revive a replacement session',()=>{
  const p=new PreviewSession();p.claim(identity);const release=p.hold();assert.equal(p.captureAllowed(),false);
  p.claim({...identity,incarnation:'new'});assert.equal(p.captureAllowed(),true);release();assert.equal(p.captureAllowed(),true);
  const release2=p.hold();p.disconnect();release2();assert.equal(p.captureAllowed(),false);
});

test('HQ-19 host live values changed during compilation survive publication of a compatible shader',async()=>{
  const exec=new ControlledExecutor(),{host,request}=receiver(exec);
  const initial=host.receive(request(1,'A'));exec.finish(0);await initial;
  const next=host.receive(request(2,'B'));
  host.setObservedInput('roughness',.8);
  exec.finish(1);assert.equal((await next).status,'applied');
  assert.equal(host.observed().values.roughness.value,.8);
});

test('HQ-20 cleanup failure cannot erase a committed receipt or encourage replay',async()=>{
  const exec=new FakeExecutor();exec.prepare=async()=>({disposed:false,dispose(){throw Error('cleanup failed');}});
  const {host,request}=receiver(exec),r=request(1,'A');
  assert.equal((await host.receive(r)).status,'applied');assert.equal(host.observed().cleanupFailures,1);
  assert.equal((await host.receive(r)).status,'applied');assert.equal(exec.commits,1);
});

test('HQ-21 identical cache keys cannot skip compilation of changed executable bytes',async()=>{
  const exec=new FakeExecutor(),{host,request}=receiver(exec);await host.receive(request(1,'A'));
  const changed=request(2,'A');changed.artifact.code='different executable';
  assert.equal((await host.receive(changed)).shaderUpdated,true);assert.equal(exec.prepares,2);
});

test('HQ-22 a client owns one gesture; writers exclude only the same components and release at seal',()=>{
  const {store,live}=setupValues();live.begin('a',[store.read('v')],'client1');
  assert.throws(()=>live.begin('b',[store.read('unrelated')],'client1'),/CLIENT_BUSY/);
  assert.throws(()=>live.begin('c',[store.read('v')],'client2'),/COMPONENT_BUSY/);
  live.begin('d',[store.read('unrelated')],'client2');live.update('a',1,[2]);live.update('d',1,[3]);
  live.finish('a');live.finish('d');live.begin('e',[store.read('v')],'client2');live.finish('e');
});

test('HQ-23 optional credentials do not bypass origin/action/payload admission and policy can require them',()=>{
  const policy={requireCredential:false,credential:null,allowedOrigins:['editor-origin'],allowedActions:['apply','read'],maxBytes:64};
  const attempt={origin:'editor-origin',action:'apply',credential:null,bytes:4};authorize(policy,attempt);
  assert.throws(()=>authorize(policy,{...attempt,origin:'other'}),/ORIGIN_DENIED/);
  assert.throws(()=>authorize(policy,{...attempt,action:'native-window'}),/ACTION_DENIED/);
  assert.throws(()=>authorize(policy,{...attempt,bytes:65}),/PAYLOAD_LIMIT/);
  assert.throws(()=>authorize({...policy,requireCredential:true,credential:'secret'},attempt),/CREDENTIAL_DENIED/);
  authorize({...policy,requireCredential:true,credential:'secret'},{...attempt,credential:'secret'});
});

test('HQ-24 bounded host-affine dispatch rejects busy/expired/stopped jobs before any mutation',async()=>{
  const q=new OwnerQueue(2),events:string[]=[];
  const a=q.submit(10,()=>events.push('a')),b=q.submit(3,()=>events.push('b'));
  await assert.rejects(q.submit(10,()=>events.push('overflow')),/HOST_BUSY/);
  const expired=assert.rejects(b,/DEADLINE/);q.drain(4);await a;await expired;assert.deepEqual(events,['a']);
  const stopped=q.submit(10,()=>events.push('stale')),rejection=assert.rejects(stopped,/HOST_STOPPED/);q.stop();await rejection;
  q.drain(5);await assert.rejects(q.submit(10,()=>events.push('late')),/HOST_STOPPED/);assert.deepEqual(events,['a']);
});

function setupNative(){
  const {store}=setupValues(),model=new NativeDefinitions(store);
  const record=(id:string,kind:NativeRecord['kind'],extra:Partial<NativeRecord>={}):NativeRecord=>({id,kind,incarnation:id+'-born1',owner:'managed',editable:true,externalReferences:[],data:{label:id,order:1},...extra});
  const page=record('page','page'),source=record('source','source',{shapeId:'float',sourceKind:'uniform',active:true});
  const control=record('control','control',{sourceId:'source',pageId:'page',shapeId:'float'});
  for(const r of [page,source,control])model.observe(r);
  const patch=(next:NativeRecord|null,id=next!.id)=>({id,expectedRevision:model.read(id).revision,next});
  return{store,model,record,page,source,control,patch};
}

test('HQ-25 page plans validate whole membership; protected page and stale reorder reject without partial mutation',()=>{
  const {model,page,control,patch}=setupNative();
  assert.throws(()=>model.plan([patch(null,'page')]),/NATIVE_MISSING_PAGE/);assert.deepEqual(model.read('page').record,page);
  const plan=model.plan([patch({...page,data:{label:'New',order:2}})]);
  model.observe({...page,data:{label:'External',order:1}});assert.throws(()=>model.commit(plan),/NATIVE_CONFLICT/);
  model.observe({...control,editable:false});assert.throws(()=>model.plan([patch({...page,data:{label:'Other'}})]),/NATIVE_PROTECTED_PAGE/);
});

test('HQ-26 source promotion reuses existing control; texture source has exactly one picker',()=>{
  const {model,source,control,record,patch}=setupNative();
  assert.deepEqual(model.ensureControl('source',record('second','control',{sourceId:'source'})),{existing:control});
  model.commit(model.plan([patch({...source,sourceKind:'texture'})]));
  assert.throws(()=>model.plan([patch({...control,id:'duplicate',incarnation:'dup'})]),/DUPLICATE_TEXTURE_CONTROL/);
  assert.equal(model.all().filter(r=>r.kind==='control').length,1);
});

test('HQ-27 shape transition must include dependent control and validates external references before changing any record',()=>{
  const {model,source,control,patch}=setupNative();
  assert.throws(()=>model.plan([patch({...source,shapeId:'vec3'})]),/NATIVE_SHAPE_MISMATCH/);
  model.observe({...control,externalReferences:['external-client']});
  assert.throws(()=>model.plan([patch({...source,shapeId:'vec3'}),patch({...control,shapeId:'vec3'})]),/NATIVE_REFERENCED/);
  assert.equal(model.read('source').record!.shapeId,'float');
  model.observe(control);model.commit(model.plan([patch({...source,shapeId:'vec3'}),patch({...control,shapeId:'vec3'})]));
  assert.equal(model.read('control').record!.shapeId,'vec3');
});

test('HQ-28 control rename preserves identity; external takeover rejects queued plans and subsequent managed edits',()=>{
  const {model,control,patch}=setupNative();
  model.commit(model.plan([patch({...control,data:{label:'Renamed',order:1}})]));
  assert.equal(model.read('control').record!.incarnation,control.incarnation);
  const oldPlan=model.plan([patch({...control,data:{label:'Pending'}})]);
  model.observe({...control,owner:'external'});assert.throws(()=>model.commit(oldPlan),/NATIVE_CONFLICT/);
  assert.throws(()=>model.plan([patch({...control,data:{label:'Overwrite'}})]),/NATIVE_PROTECTED/);
});

test('HQ-29 definition remove/Undo keeps newest live input and external driver replacement rejects later restore',()=>{
  const {store,model,patch}=setupNative();
  const receipt=model.commit(model.plan([patch(null,'control')],['v'])),history=new NativeDefinitionHistory(model,receipt);
  store.write([{expected:store.read('v'),value:12}]);history.restore('undo');assert.equal(store.read('v').value,12);
  history.restore('redo');store.seed({...store.read('v'),driverId:'external'});
  assert.throws(()=>history.restore('undo'),/NATIVE_DRIVER_CONFLICT/);assert.equal(model.read('control').record,null);
});

test('HQ-30 native checkpoint excludes animation but definition changes remain guarded',()=>{
  const {store,model,control,patch}=setupNative();
  const plan=model.plan([patch({...control,data:{label:'New definition',expression:'new expression'}})],['v']);
  for(let i=0;i<20;i++)store.write([{expected:store.read('v'),value:i}]);
  model.commit(plan);assert.deepEqual(model.read('control').record!.data,{label:'New definition',expression:'new expression'});
  const next=model.plan([patch({...control,data:{label:'Pending'}})],['v']);
  model.observe({...model.read('control').record!,data:{expression:'external expression'}});
  assert.throws(()=>model.commit(next),/NATIVE_CONFLICT/);assert.equal(store.read('v').value,19);
});

test('HQ-31 native delta Undo touches only owned rows; unrelated neighboring edits and values survive',()=>{
  const {store,model,record,patch}=setupNative();
  const rowA=record('rowA','row'),rowB=record('rowB','row');model.observe(rowA);model.observe(rowB);
  const receipt=model.commit(model.plan([patch({...rowA,data:{order:3}})],['v']));
  model.observe({...rowB,data:{order:9,expression:'external'}});store.write([{expected:store.read('v'),value:99}]);
  new NativeDefinitionHistory(model,receipt).restore('undo');
  assert.deepEqual(model.read('rowA').record,rowA);assert.deepEqual(model.read('rowB').record!.data,{order:9,expression:'external'});assert.equal(store.read('v').value,99);
});

test('HQ-32 source deletion keeps last-good tombstone; Undo restores draft source without publishing shader',()=>{
  const {store,model,source,patch}=setupNative();model.setLastGoodSources(['source']);
  const receipt=model.commit(model.plan([patch(null,'control'),patch(null,'source')],['v']));
  assert.equal(model.read('source').record!.tombstone,true);assert.equal(model.read('source').record!.active,false);
  store.write([{expected:store.read('v'),value:7}]);new NativeDefinitionHistory(model,receipt).restore('undo');
  assert.deepEqual(model.read('source').record,source);assert.equal(store.read('v').value,7);
});

test('HQ-33 native patch replay returns receipt rather than rewriting newer external state; protected group is atomic',()=>{
  const {model,record,patch}=setupNative();const a=record('a','row'),b=record('b','row',{owner:'external'});model.observe(a);model.observe(b);
  assert.throws(()=>model.plan([patch({...a,data:{value:'new'}}),patch(null,'b')]),/NATIVE_PROTECTED/);assert.deepEqual(model.read('a').record,a);
  const plan=model.plan([patch({...a,data:{value:'new'}})]),receipt=model.commit(plan);model.observe({...a,data:{value:'external now'}});
  assert.deepEqual(model.commit(plan),receipt);assert.deepEqual(model.read('a').record!.data,{value:'external now'});
  assert.throws(()=>model.commit({...plan,patches:[]}),/PLAN_CHANGED/);
});

test('HQ-34 inactive source retains control identity and matrix column metadata without forcing scalar representation',()=>{
  const {model,source,control,patch}=setupNative();
  model.commit(model.plan([patch({...source,shapeId:'mat3',data:{columns:['c0','c1','c2']}}),patch({...control,shapeId:'mat3',data:{style:'matrix',columns:3}})]));
  const current=model.read('source').record!;model.commit(model.plan([patch({...current,active:false})]));
  assert.equal(model.read('control').record!.incarnation,control.incarnation);
  assert.deepEqual(model.read('control').record!.data,{style:'matrix',columns:3});assert.equal(model.read('source').record!.active,false);
});

test('HQ-35 upgrade confirmation binds exact reviewed content, target incarnation and revision; successful ticket is single-use',()=>{
  const tickets=new ReviewTickets(),id=tickets.issue(identity,4,{version:1},{version:2});
  assert.throws(()=>tickets.confirm(id,{...identity,incarnation:'new'},4,{version:1},{version:2}),/REVIEW_CHANGED/);
  assert.throws(()=>tickets.confirm(id,identity,5,{version:1},{version:2}),/REVIEW_CHANGED/);
  assert.throws(()=>tickets.confirm(id,identity,4,{version:1},{version:3}),/REVIEW_CHANGED/);
  tickets.confirm(id,identity,4,{version:1},{version:2});assert.throws(()=>tickets.confirm(id,identity,4,{version:1},{version:2}),/REVIEW_USED/);
});

test('HQ-36 queued native schema plan cannot commit to replacement target lifetime',()=>{
  const {model,control,patch}=setupNative();const plan=model.plan([patch({...control,data:{label:'late'}})]);
  model.replaceTarget();assert.throws(()=>model.commit(plan),/UNKNOWN_PLAN/);assert.equal(model.all().length,0);
});

test('HQ-37 native history receipt cannot restore definitions into a replacement target with coincident revisions',()=>{
  const {model,page,source,control,patch}=setupNative();
  const receipt=model.commit(model.plan([patch({...control,data:{label:'edited'}})])),history=new NativeDefinitionHistory(model,receipt);
  model.replaceTarget();for(const r of [page,source,control])model.observe({...r,incarnation:r.incarnation+'-replacement'});
  model.observe({...control,incarnation:'replacement-2'}); // Its revision now equals old receipt's after revision.
  assert.throws(()=>history.restore('undo'),/NATIVE_RECEIPT/);
  assert.equal(model.read('control').record!.incarnation,'replacement-2');
});

test('HQ-38 a definition edit cannot forge away host-observed ownership or external reference guards',()=>{
  const {model,control,patch}=setupNative();model.observe({...control,externalReferences:['consumer']});
  assert.throws(()=>model.plan([patch(control)]),/AUTHORITY_MUTATION/);
  assert.deepEqual(model.read('control').record!.externalReferences,['consumer']);
});

function targetGraph(name:string){const registry=new Registry();const registered=registry.register(builtinModule);assert.equal(registered.ok,true);return new Graph({name,definitions:registry.pin(),outputType:refs.output});}
function selectionProviders(next:Graph){let raw:string|null=null;const counters={write:0,read:0,open:0,apply:0};return {counters,providers:{drafts:{write:async(_target:TargetIdentity,value:string)=>{counters.write++;raw=value;},read:async()=>{counters.read++;return raw;}},apply:async()=>{counters.apply++;return{status:'applied'};},open:async(target:TargetIdentity)=>{counters.open++;return{identity:target,graph:next};}}};}
test('HQ-39 target switch waits for the active operation, verifies keep-draft readback and supports cancel without origin inference',async()=>{
 const current=targetGraph('old'),next=targetGraph('next'),selection=new TargetSelection(identity,current),target={...identity,targetId:'target-b'},p=selectionProviders(next);const begin=current.beginOperation('move');assert.equal(begin.ok,true);if(!begin.ok)return;
 const waiting=selection.switchTo(target,'keep',p.providers);await Promise.resolve();assert.equal(p.counters.write,0);assert.equal(selection.current().graph,current);assert.equal(begin.value.commit().ok,true);assert.equal(await waiting,'switched');assert.equal(p.counters.write,1);assert.equal(p.counters.read,1);assert.deepEqual(selection.current().identity,target);assert.equal(selection.current().graph,next);assert.equal(current.dirty,true);
 const cancel=selectionProviders(current);assert.equal(await selection.switchTo(identity,'cancel',cancel.providers),'cancelled');assert.deepEqual(cancel.counters,{write:0,read:0,open:0,apply:0});assert.equal(selection.current().graph,next);
});
test('HQ-40 switch storage failure, apply rejection, concurrent edit and wrong incarnation retain the current target',async()=>{
 for(const branch of ['storage','apply','edit','identity'] as const){const current=targetGraph('old'),next=targetGraph('next'),selection=new TargetSelection(identity,current),p=selectionProviders(next),target={...identity,targetId:'other'};
  if(branch==='storage')p.providers.drafts.read=async()=>null;if(branch==='apply')p.providers.apply=async()=>({status:'retained'});if(branch==='edit')p.providers.drafts.read=async()=>{const move=current.change('New edit',d=>d.move(current.stage('pixel').node('output')!.id,[4,5]));assert.equal(move.ok,true);return current.exportJSON();};if(branch==='identity')p.providers.open=async()=>({identity:{...target,incarnation:'replacement'},graph:next});
  await assert.rejects(selection.switchTo(target,branch==='apply'?'apply':'keep',p.providers));assert.equal(selection.current().graph,current);assert.deepEqual(selection.current().identity,identity);}
});
test('HQ-41 unsupported and corrupt target documents preserve raw and last-good output; only explicit fresh storage can initialize',async()=>{
 const {host,request}=receiver();await host.receive(request(1,'good'));let parses=0;const parse=(raw:string)=>{parses++;return JSON.parse(raw);};
 for(const record of [{fresh:false,version:'2.0.0',raw:'{"future":true}'},{fresh:false,version:'1.0.0',raw:'{broken'},{fresh:false,version:'1.0.0',raw:''},{fresh:false,version:'weird',raw:'{}'}]){const view=inspectTargetDocument(identity,record,'1.0.0',parse);assert.equal(view.mode,'readonly');assert.equal(view.raw,record.raw);await assert.rejects(publishInspected(view,host,request(2,'bad')),/READ_ONLY_TARGET/);assert.equal(host.observed().artifact!.code,'good');}
 const before=parses,fresh=inspectTargetDocument(identity,{fresh:true,version:'1.0.0',raw:null},'1.0.0',parse);assert.equal(fresh.mode,'fresh');assert.equal(parses,before);assert.equal((await publishInspected(fresh,host,request(2,'new'))).status,'applied');assert.equal(inspectTargetDocument(identity,{fresh:true,version:'1.0.0',raw:'{}'},'1.0.0',parse).mode,'readonly');
 const preview=new PreviewSession();preview.claim(identity);assert.equal(preview.captureAllowed(),true);
});
test('HQ-42 capture cancellation avoids GPU read; late result and replacement epoch cannot publish another image',async()=>{
 const session=new PreviewSession(),lease=session.claim(identity),controller=new AbortController();let ready!:()=>void,reads=0,disposes=0;const provider={create:()=>({identity,ready:new Promise<void>(r=>ready=r),read:async()=>{reads++;return new Uint8Array([1]);},dispose:()=>{disposes++;}})};
 const pending=capturePreview(session,lease,provider,controller.signal);controller.abort();await assert.rejects(pending,/CANCELLED/);ready();assert.equal(reads,0);assert.equal(disposes,1);
 let image!:(data:Uint8Array)=>void;const late=capturePreview(session,lease,{create:()=>({identity,ready:Promise.resolve(),read:()=>{reads++;return new Promise<Uint8Array>(r=>image=r);},dispose:()=>{disposes++;}})});await Promise.resolve();await Promise.resolve();session.claim({...identity,incarnation:'new'});image(new Uint8Array([9]));await assert.rejects(late,/STALE_PREVIEW/);assert.equal(disposes,2);
});
test('HQ-43 capture handles no target, preparation identity errors and provider read failures with owned cleanup',async()=>{
 const session=new PreviewSession(),lease=session.claim(identity);let created=0,disposed=0;const provider={create:()=>{created++;return{identity,ready:Promise.resolve(),read:async()=>new Uint8Array([1,2]),dispose:()=>{disposed++;}};}};
 assert.equal((await capturePreview(session,null,provider)).length,0);assert.equal(created,0);assert.deepEqual(await capturePreview(session,lease,provider),new Uint8Array([1,2]));assert.equal(disposed,1);
 await assert.rejects(capturePreview(session,lease,{create:()=>({...provider.create(),identity:{...identity,targetId:'wrong'}})}),/WRONG_INSTANCE/);assert.equal(disposed,2);
 await assert.rejects(capturePreview(session,lease,{create:()=>({...provider.create(),read:async()=>{throw Error('GPU read rejected');}})}),/GPU read/);assert.equal(disposed,3);
});
function textures(){const values=new Map<string,ResolvedTexture>();for(const [id,kind,ownership] of [['fallback','texture2d','internal'],['a','texture2d','external'],['b','texture2d','external'],['wrong','geometry','external'],['internal','texture2d','internal']] as const)values.set(id,{id,incarnation:'born1',kind,ownership,locator:'/'+id});const resolver:TextureResolver={resolve:async locator=>[...values.values()].find(v=>v.locator===locator)??null,inspect:ref=>values.get(ref.id)??null};const state:TextureState={target:identity,epoch:1,sourceId:'texture',shapeId:'sampler2d',driverId:'constant',revision:0,resource:null};return{values,resolver,binding:new TextureBinding(state,values.get('fallback')!)};}
test('HQ-44 texture selection resolves only permitted external resources; empty uses fallback; identity guards native Undo',async()=>{
 const {binding,resolver,values}=textures();for(const path of ['/missing','/wrong','/internal','x\n','x'.repeat(2049)]){const before=binding.snapshot();await assert.rejects(binding.write(before,path,resolver));assert.deepEqual(binding.snapshot(),before);}
 await binding.write(binding.snapshot(),'/a',resolver);const change=await binding.write(binding.snapshot(),'/b',resolver);values.set('a',{...values.get('a')!,incarnation:'born2'});assert.throws(()=>binding.undo(change,resolver),/RESOURCE_IDENTITY_CHANGED/);assert.equal(binding.snapshot().resource!.id,'b');values.delete('b');const before=binding.snapshot();assert.deepEqual(binding.effective(resolver),{resource:values.get('fallback'),invalid:true});assert.deepEqual(binding.snapshot(),before);
 await binding.write(binding.snapshot(),'',resolver);assert.equal(binding.effective(resolver).invalid,false);assert.equal(binding.effective(resolver).resource.id,'fallback');
});
test('HQ-45 late texture resolution cannot cross target/source epoch or accept a recreated same-path resource',async()=>{
 const {binding,resolver,values}=textures();let finish!:(v:ResolvedTexture)=>void;const old=binding.snapshot(),pending=binding.write(old,'/a',{...resolver,resolve:()=>new Promise(r=>finish=r)});binding.rebind({...old,epoch:2,target:{...identity,incarnation:'new'}});finish(values.get('a')!);await assert.rejects(pending,/TEXTURE_CONFLICT/);assert.equal(binding.snapshot().resource,null);
 const selected=await binding.write(binding.snapshot(),'/a',resolver);const forged={...selected,before:{...selected.before,resource:values.get('b')!}};assert.throws(()=>binding.undo(forged,resolver),/TEXTURE_RECEIPT/);values.set('a',{...values.get('a')!,incarnation:'born2'});assert.equal(binding.effective(resolver).invalid,true);
});

test('HQ-46 read-only inspection cannot be forged into writable authority, and preview cannot retarget an in-flight lease object',async()=>{
 const {host,request}=receiver(),view=inspectTargetDocument(identity,{fresh:false,version:'9.0.0',raw:'{}'},'1.0.0',JSON.parse);
 await assert.rejects(publishInspected({...view,mode:'editable'},host,request(1,'bad')));assert.equal(host.observed().artifact,null);const fresh=inspectTargetDocument(identity,{fresh:true,version:'1.0.0',raw:null},'1.0.0',JSON.parse);invalidateTargetDocument(fresh);await assert.rejects(publishInspected(fresh,host,request(1,'also-bad')),/STALE_INSPECTION/);
 const session=new PreviewSession(),lease=session.claim(identity);let ready!:()=>void;const pending=capturePreview(session,lease,{create:()=>({identity,ready:new Promise<void>(r=>ready=r),read:async()=>new Uint8Array([7]),dispose:()=>{}})});Object.assign(lease,session.claim({...identity,incarnation:'new'}));ready();await assert.rejects(pending,/STALE_PREVIEW/);
});

test('HQ-47 target inspection composes with the real document loader rather than treating arbitrary JSON as editable Graph',()=>{
 const registry=new Registry();assert.equal(registry.register(builtinModule).ok,true);const graph=targetGraph('known');const parse=(raw:string)=>{const loaded=Graph.load(raw,registry);if(!loaded.ok)throw Error(loaded.error.code);return loaded.value.snapshot().document as unknown as import('../contracts.ts').Json;};
 const known=inspectTargetDocument(identity,{fresh:false,version:'1.0.0',raw:graph.exportJSON()},'1.0.0',parse);assert.equal(known.mode,'editable');const unknown=inspectTargetDocument(identity,{fresh:false,version:'1.0.0',raw:'{"unrecognized":true}'},'1.0.0',parse);assert.equal(unknown.mode,'readonly');assert.equal(unknown.raw,'{"unrecognized":true}');
});
