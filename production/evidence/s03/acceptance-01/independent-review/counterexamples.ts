import fs from 'node:fs';
import assert from 'node:assert/strict';
import { flow } from '../s03-review-01/production/tests/fixtures/setup.ts';
import { customTransferFixture } from '../s03-review-01/production/tests/fixtures/custom-transfer.ts';
import { Graph } from '../s03-review-01/production/src/model/graph.ts';
import { compile } from '../s03-review-01/production/src/generation/compiler.ts';
import { esProfile } from '../s03-review-01/production/src/modules/image.ts';
import { asNetwork } from '../s03-review-01/production/src/sdk/networks.ts';
import { copySelection } from '../s03-review-01/production/src/model/transfer.ts';
const out='C:/Users/user/source/Grape/.verification/s03-independent-rereview-02';
const results:any[]=[];
{
 const s=flow(); let st='',n='',f='';
 const nested='array@'+JSON.stringify(['array@'+JSON.stringify(['glsl.float',2]),3]);
 s.graph.change('Nested',d=>{st=d.createStructure('Nested',[{id:'a',name:'a',type:nested},{id:'b',name:'b',type:'glsl.float'}]);n=d.addReferenceNode(s.network,'structure',st);f=d.addReferenceNode(s.network,'field',st,'b');d.connect(s.network,{nodeId:n,portKey:'value'},{nodeId:f,portKey:'value'});d.connect(s.network,{nodeId:f,portKey:'field'},{nodeId:s.compose,portKey:'y'});});
 const compilation=compile(s.graph.capture(),s.fixed,esProfile);
 fs.writeFileSync(out+'/nested-array-compilation.json',JSON.stringify(compilation,null,2));
 results.push({id:'nested-array-shader',status:compilation.status,diagnostics:compilation.diagnostics,artifacts:compilation.artifacts});
}
{
 const s=customTransferFixture(); let childCall='';
 s.graph.change('Child',d=>{childCall=d.createSubgraph(s.network,'Child')});
 const doc=structuredClone(s.graph.capture().document);
 const root=doc.graph.stages.find(x=>x.network.id===s.network)!.network;
 const childResource=doc.graph.resources.find(r=>r.id===(root.nodes.find(n=>n.id===childCall)!.state as any).definition)!;
 const child=asNetwork(childResource,s.fixed)!;
 const b=doc.graph.resources.find(r=>r.id===s.b)!;
 b.references.push({slot:'child-definition',kind:'resource',targetId:childResource.id},{slot:'child-node',kind:'node',networkId:child.network.id,targetId:child.network.nodes[0].id});
 let seq=0;
 const graph=new Graph(doc,s.fixed,{next:()=>`review-${++seq}`});
 const initialDiagnostics=graph.capture().diagnostics;
 let parentCall='';
 graph.change('Group selected dependency closure',d=>{parentCall=d.encapsulate(s.network,[...s.selection,childCall])});
 const grouped=graph.capture();
 const packet=copySelection(grouped,s.fixed,s.network,[parentCall]);
 let error:string|null=null;
 try {graph.change('Make independent',d=>d.makeIndependent(s.network,parentCall));}catch(e){error=String(e)}
 if(error) assert.deepEqual(graph.capture(),grouped);
 results.push({id:'mixed-network-owner-reference-independence',initialDiagnostics,groupedDiagnostics:grouped.diagnostics,copyResourceIds:packet.resources.map(r=>r.id),error,unchanged:error?true:false,childResource:childResource.id,childNetwork:child.network.id,parentCall,document:grouped.document});
}
fs.writeFileSync(out+'/counterexamples-results.json',JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results.map(({document,artifacts,...r})=>r),null,2));
