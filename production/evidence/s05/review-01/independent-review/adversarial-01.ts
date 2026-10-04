import fs from 'node:fs';
import { stageFixture, functionFixture } from '../../production/tests/fixtures/s05.ts';
import { functionOperationRef } from '../../production/src/modules/function-operations.ts';
import { compile } from '../../production/src/generation/compiler.ts';
import { asNetwork } from '../../production/src/sdk/networks.ts';
import { Graph } from '../../production/src/model/graph.ts';
const dir='.verification/s05-fresh-review-01';
const s=stageFixture();
const resources=[];
s.graph.change('Independent cross-stage float uniform probe',d=>{
  for(const [index,stage] of s.graph.capture().document.graph.stages.entries()){
    const value=index===0?0.25:0.75;
    const id=d.createSource('stage-uniform-'+index,'glsl.float',value,true,{kind:'uniform'});
    resources.push({stageId:stage.id,resourceId:id,value});
    const node=d.addReferenceNode(stage.network.id,'source',id,undefined,functionOperationRef('source'));
    const call=stage.network.nodes.find(n=>s.fixed.node(n.type)?.modelRole==='call');
    d.connect(stage.network.id,{nodeId:node,portKey:'value'},{nodeId:call.id,portKey:'value'},true);
  }
});
const generated=compile(s.graph.capture(),s.fixed,s.profile);
fs.writeFileSync(dir+'/cross-stage-uniform-01.json',JSON.stringify({resources,document:s.graph.capture().document,generated},null,2));
console.log(JSON.stringify({probe:'cross-stage-uniform',status:generated.status,bindings:generated.bindingSchema,diagnostics:generated.diagnostics}));
const nested=functionFixture();
let outer='';
nested.graph.change('Independent nested boundary setup',d=>{outer=d.encapsulate(nested.network,[nested.call,nested.second]);});
const doc=nested.graph.capture().document;
const wrapper=doc.graph.resources.find(r=>asNetwork(r,nested.fixed)?.network.nodes.some(n=>n.id===nested.call));
nested.graph.change('Enable nested function only',d=>d.emissionMode(nested.body,'function',nested.profile));
const mixed=compile(nested.graph.capture(),nested.fixed,nested.profile);
fs.writeFileSync(dir+'/mixed-nesting-01.json',JSON.stringify({document:nested.graph.capture().document,generated:mixed,expectedPixels:[51,102,153,255]},null,2));
console.log(JSON.stringify({probe:'mixed-nesting',status:mixed.status,helpers:(mixed.artifacts.find(a=>a.key==='pixel')?.text.match(/void grape_function_/g)||[]).length}));
