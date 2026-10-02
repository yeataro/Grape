import fs from 'node:fs';
import {flow} from '../../../tests/fixtures/setup.ts';
import {copySelection} from '../../../src/model/transfer.ts';
const s=flow();let top='',array='';s.graph.change('Acceptance sample descriptors',d=>{
 top=d.addReferenceNode(s.network,'source',d.createSource('Image slot','glsl.sampler2D',null,true,{kind:'top',path:'/authored/example',source:'example-source',origin:'example-origin',slot:0}));
 array=d.addReferenceNode(s.network,'source',d.createSource('Long array path','array@["glsl.float",2]',null,true,{kind:'native-array',path:'x'.repeat(2049)}));
});
for(const [file,id] of [['human-top.packet.json',top],['human-array-2049.packet.json',array]])fs.writeFileSync(new URL(file,import.meta.url),JSON.stringify(copySelection(s.graph.capture(),s.fixed,s.network,[id]),null,2)+'\n',{flag:'wx'});
