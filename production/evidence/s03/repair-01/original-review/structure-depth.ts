import fs from 'node:fs';
import {flow} from '../s03-review-01/production/tests/fixtures/setup.ts';
import {compile} from '../s03-review-01/production/src/generation/compiler.ts';
import {esProfile} from '../s03-review-01/production/src/modules/image.ts';
const s=flow(),ids:string[]=[];
for(let i=0;i<16;i++)s.graph.change('Chain',d=>ids.push(d.createStructure('Depth'+i,[{id:'v',name:'value',type:i===0?'glsl.float':'struct@'+ids[i-1]}])));
let leaf='';s.graph.change('Leaf',d=>leaf=d.createStructure('NewLeaf',[{id:'v',name:'value',type:'glsl.float'}]));
const before=s.graph.capture();
let error:string|null=null;try{s.graph.change('Extend',d=>d.editStructure(ids[0],{name:'Depth0',fields:[{id:'v',name:'value',type:'struct@'+leaf}]}))}catch(e){error=String(e)}
const after=s.graph.capture();
let controlError:string|null=null;try{s.graph.change('Create equally deep outer structure',d=>d.createStructure('Depth16',[{id:'v',name:'value',type:'struct@'+ids[15]}]))}catch(e){controlError=String(e)}
const result={error,expected:'Reject expansion making existing dependent depth17 or preserve invalid with explicit diagnostic and block generation',beforeRevision:before.revision,afterRevision:after.revision,diagnostics:after.diagnostics,compileStatus:compile(after,s.fixed,esProfile).status,controlError,afterDocument:after.document};
fs.writeFileSync('C:/Users/user/source/Grape/.verification/s03-independent-review-01/structure-depth-results.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({...result,afterDocument:undefined},null,2));
