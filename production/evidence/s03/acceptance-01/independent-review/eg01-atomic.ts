import fs from 'node:fs';
import assert from 'node:assert/strict';
import {flow} from '../s03-review-01/production/tests/fixtures/setup.ts';
import {Graph} from '../s03-review-01/production/src/model/graph.ts';
import {copySelection} from '../s03-review-01/production/src/model/transfer.ts';
import {readDocument,writeDocument} from '../s03-review-01/production/src/persistence/codec.ts';
const out='C:/Users/user/source/Grape/.verification/s03-independent-rereview-02';
const result:any[]=[];
const inputs:any[]=[['array@'+JSON.stringify(['glsl.float',2]),[1,2]],['array@'+JSON.stringify(['glsl.vec2',2]),[[1,2],[3,4]]],['glsl.float',3],['glsl.vec2',[1,2]],['glsl.mat2',[[1,0],[0,1]]]];
for(const [type,value] of inputs)for(const kind of [undefined,'constant','uniform']){
 const s=flow();let id='',node='';s.graph.change('Independent source',d=>{id=d.createSource('Independent source',type,value,true,kind?{kind}:undefined);node=d.addReferenceNode(s.network,'source',id)});
 const packet=copySelection(s.graph.capture(),s.fixed,s.network,[node]);const packetBefore=structuredClone(packet);
 const persisted=readDocument(writeDocument(s.graph.capture().document),s.fixed.module);assert.equal(persisted.status,'editable');
 s.graph.change('Reuse',d=>d.paste(s.network,packet));assert.equal(s.graph.capture().document.graph.resources.length,1);const sourceBefore=s.graph.capture();
 const destination=structuredClone(flow().graph.capture().document);destination.graph.id='eg01-independent-graph';let sequence=0;
 for(const [route,doc] of [['distinctGraph',destination],['freshLoad',s.graph.capture().document]] as const){
  const g=new Graph(doc,s.fixed,{next:()=>`eg01-${++sequence}`});
  assert.notEqual(g.loadId,packet.loadId);assert.equal(g.capture().document.graph.id===packet.graphId,route==='freshLoad');
  g.change('Seed Redo',d=>d.move(s.network,s.float,[83,94]));const redoDocument=g.capture().document;g.undo();
  const before=g.capture(),history=g.historyLength;assert.equal(g.canRedo,true);let events=0;const off=g.subscribe(()=>events++);
  const composite=type.startsWith('array@');let error:string|null=null;
  try{g.change('Paste',d=>d.paste(s.network,packet))}catch(e){error=String(e)}
  const after=g.capture();
  if(composite){assert.match(error!,/SOURCE_CLIPBOARD_DENIED/);assert.deepEqual(after,before);assert.equal(g.historyLength,history);assert.equal(g.canRedo,true);assert.equal(events,0);off();g.redo();assert.deepEqual(g.capture().document,redoDocument)}
  else{assert.equal(error,null);assert.deepEqual(after.diagnostics,[]);assert.equal(g.historyLength,history+1);assert.equal(after.revision,before.revision+1);assert.equal(after.document.graph.resources.length,before.document.graph.resources.length+1);assert.equal(events,1);off();g.undo();assert.deepEqual(g.capture().document,before.document);g.redo();assert.deepEqual(g.capture().document,after.document)}
  assert.deepEqual(s.graph.capture(),sourceBefore);assert.deepEqual(packet,packetBefore);
  result.push({type,kind:kind??'implicit constant',route,status:'PASS',expected:composite?'atomic rejection with executable retained Redo':'independent numeric import with exact Undo/Redo',error,sameGraphSameLoadResourceReuse:true,sourceUnchanged:true,packetUnchanged:true,documentRevisionHistoryVerified:true,events});
 }
}
fs.writeFileSync(out+'/eg01-atomic-results.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({cases:result.length,rejected:result.filter(x=>x.error).length,accepted:result.filter(x=>!x.error).length,status:'PASS'},null,2));
