// Additional negative qualification at the frozen I; no production source mutation.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {valueCases,valueFixture} from '../../../tests/fixtures/s05-values.ts';
import {functionOperationRef} from '../../../src/modules/function-operations.ts';
import {compile} from '../../../src/generation/compiler.ts';
const rows=[];
for(const item of valueCases){const s=valueFixture(item.key);let array='';s.graph.change('Array witness',d=>{array=d.add(s.network,functionOperationRef('array-length'),[0,0]);});const before=s.graph.capture();let rejected:string|null=null;try{s.graph.change('Illegal node specialization extent',d=>d.parameter(s.network,array,'type','array@'+JSON.stringify(['glsl.float',{sourceId:s.leaf}])));}catch(e){rejected=String(e);assert.deepEqual(s.graph.capture(),before);}const after=s.graph.capture(),result=compile(after,s.fixed,s.profile);if(!rejected)assert.equal(result.status,'failed');assert.deepEqual(s.graph.capture(),after);assert.deepEqual(s.graph.resolveNetwork(s.network).nodes.find(n=>n.id===s.leaf)!.state,{value:item.initial});rows.push({leaf:item.key,illegalExtentSource:s.leaf,commandRejected:rejected,compilation:result.status,diagnostics:result.diagnostics,sourceTypeUnchanged:true,compileReadOnly:true});}
fs.writeFileSync(new URL('./specialization-probe-result-01.json',import.meta.url),JSON.stringify({implementationI:'8ffbea96bdc76e307d59eaa8514f3c6432a7d34d',status:'PASS',meaning:'An ordinary fixed-value node cannot become a symbolic specialization resource merely by using its identity as an extent. No scalar/vector coercion or implicit extent declaration.',rows},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:'PASS',cases:rows.length}));
