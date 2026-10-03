import fs from 'node:fs';
import assert from 'node:assert/strict';
import {flow} from '../s03-review-01/production/tests/fixtures/setup.ts';
import {Graph} from '../s03-review-01/production/src/model/graph.ts';
import {copySelection} from '../s03-review-01/production/src/model/transfer.ts';
import {customTransferFixture} from '../s03-review-01/production/tests/fixtures/custom-transfer.ts';
import {asNetwork} from '../s03-review-01/production/src/sdk/networks.ts';
const out='C:/Users/user/source/Grape/.verification/s03-independent-rereview-02';
const arr=(type:string,n:number)=>'array@'+JSON.stringify([type,n]);
const results:any[]=[];
// New independent EG01 counterexample: a real different Graph and a fresh load.
for(const [type,value] of [[arr('glsl.float',2),[1,2]],[arr('glsl.vec2',2),[[1,2],[3,4]]],['glsl.vec2',[1,2]],['glsl.mat2',[[1,0],[0,1]]]] as const){
 const s=flow();let source='',node='';s.graph.change('Source',d=>{source=d.createSource('Review source',type,value as any);node=d.addReferenceNode(s.network,'source',source)});
 const packet=copySelection(s.graph.capture(),s.fixed,s.network,[node]);
 s.graph.change('Same-load reuse',d=>d.paste(s.network,packet));assert.equal(s.graph.capture().document.graph.resources.length,1);
 const detached=structuredClone(s.graph.capture().document);detached.graph.id='independent-destination';detached.graph.resources=[];
 // Use the original working flow for a clean destination document, with unique Graph ID.
 const targetDoc=structuredClone(flow().graph.capture().document);targetDoc.graph.id='independent-destination';let n=0;
 const target=new Graph(targetDoc,s.fixed,{next:()=>`destination-${++n}`});
 target.change('Make Redo control',d=>d.move(s.network,s.float,[22,33]));target.undo();
 const before=target.capture(),history=target.historyLength;let events=0;target.subscribe(()=>events++);let error=null;
 try{target.change('Cross-graph paste',d=>d.paste(s.network,packet))}catch(e){error=String(e)}
 const after=target.capture();const isArray=type.startsWith('array@');
 const reopen=new Graph(s.graph.capture().document,s.fixed,{next:()=>`reopened-${++n}`});const reopenBefore=reopen.capture();let reopenError=null;
 try{reopen.change('Fresh-load paste',d=>d.paste(s.network,packet))}catch(e){reopenError=String(e)}
 results.push({id:'EG01-inline-source-admission',type,value,expected:isArray?'same-load reuse; cross-graph and cross-load rejection without publication':'numeric control cross-graph success',sameLoadResourceCount:1,sourceGraphId:packet.graphId,destinationGraphId:before.document.graph.id,error,accepted:error===null,beforeRevision:before.revision,afterRevision:after.revision,beforeResources:before.document.graph.resources.length,afterResources:after.document.graph.resources.length,historyDelta:target.historyLength-history,redoBefore:true,redoAfter:target.canRedo,notifications:events,diagnostics:after.diagnostics,originalSourceUnchanged:s.graph.capture().document.graph.resources.length===1,reopenedError:reopenError,reopenedRevisionDelta:reopen.capture().revision-reopenBefore.revision,contractConforms:!isArray?error===null:error!==null&&after.revision===before.revision});
}
// Independently assert original mixed-parent/shared-child remap, literal preservation and one-operation History.
for(const cloneChild of [false,true]){
 const s=customTransferFixture();let cc='';s.graph.change('Child',d=>cc=d.createSubgraph(s.network,'Child'));
 const doc=structuredClone(s.graph.capture().document),root=doc.graph.stages.find(x=>x.network.id===s.network)!.network;
 const cr=doc.graph.resources.find(x=>x.id===(root.nodes.find(n=>n.id===cc)!.state as any).definition)!,child=asNetwork(cr,s.fixed)!;
 const b=doc.graph.resources.find(x=>x.id===s.b)!;if(!cloneChild)b.references.push({slot:'child-definition',kind:'resource',targetId:cr.id});
 b.references.push({slot:'child-node',kind:'node',networkId:child.network.id,targetId:child.network.nodes[0].id});if(cloneChild)child.dependencies.push(b.id);
 let i=0;const g=new Graph(doc,s.fixed,{next:()=>`ind-${cloneChild}-${++i}`});let p='';g.change('Group',d=>p=d.encapsulate(s.network,[...s.selection,cc]));
 const before=g.capture().document,h=g.historyLength;let publications=0;g.subscribe(()=>publications++);g.change('Independent',d=>d.makeIndependent(s.network,p));
 const after=g.capture();assert.deepEqual(after.diagnostics,[]);assert.equal(g.historyLength,h+1);assert.equal(publications,1);
 const caller=after.document.graph.stages.find(x=>x.network.id===s.network)!.network.nodes.find(n=>n.id===p)!;
 const parent=asNetwork(after.document.graph.resources.find(r=>r.id===(caller.state as any).definition)!,s.fixed)!;
 const owner=parent.network.nodes.find(n=>n.type.typeId==='owner')!,copied=after.document.graph.resources.find(r=>r.id===owner.references.find(x=>x.slot==='declared-root')!.targetId)!;
 const childRef=copied.references.find(r=>r.slot==='child-node')!,parentRef=copied.references.find(r=>r.slot==='subject')!;
 assert.equal(childRef.networkId===child.network.id,!cloneChild);assert.equal(childRef.targetId===child.network.nodes[0].id,!cloneChild);
 assert.equal(parentRef.networkId,parent.network.id);assert(parent.network.nodes.some(n=>n.id===parentRef.targetId));assert.deepEqual(copied.data,b.data);
 const childAfter=after.document.graph.resources.map(r=>asNetwork(r,s.fixed)).find(r=>r?.network.id===childRef.networkId)!;assert(childAfter.network.nodes.some(n=>n.id===childRef.targetId));
 g.undo();assert.deepEqual(g.capture().document,before);g.redo();assert.deepEqual(g.capture().document,after.document);
 results.push({id:'FR02-independent-remap',cloneChild,status:'PASS',parentReference:parentRef,childReference:childRef,literalPreserved:true,oneHistoryEntry:true,onePublication:true,undoRedoExact:true});
}
// Independent dependent expansion guard, including stale Redo/observer preservation.
{
 const s=flow();let inner='';s.graph.change('At budget',d=>{inner=d.createStructure('Inner',[{id:'v',name:'v',type:arr('glsl.float',64)}]);d.createStructure('Outer',[{id:'v',name:'v',type:arr('struct@'+inner,1024)}])});
 s.graph.change('Redo',d=>d.move(s.network,s.float,[1,2]));s.graph.undo();const before=s.graph.capture(),h=s.graph.historyLength;let events=0;s.graph.subscribe(()=>events++);let error=null;
 try{s.graph.change('Expand inner vector width',d=>d.editStructure(inner,{name:'Inner',fields:[{id:'v',name:'v',type:arr('glsl.vec2',64)}]}))}catch(e){error=String(e)}
 assert.match(error!,/STRUCTURE_EXPANSION/);assert.deepEqual(s.graph.capture(),before);assert.equal(s.graph.historyLength,h);assert.equal(s.graph.canRedo,true);assert.equal(events,0);
 results.push({id:'FR03-independent-dependent-expansion',status:'PASS',error,expansionBefore:65536,expansionAttempted:131072,snapshotUnchanged:true,redoRetained:true,notifications:events});
}
fs.writeFileSync(out+'/independent-probe-results.json',JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results,null,2));
