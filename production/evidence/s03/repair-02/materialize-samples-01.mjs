import fs from 'node:fs';
import {flow} from '../../../tests/fixtures/setup.ts';
import {copySelection} from '../../../src/model/transfer.ts';
const s=flow();let inline='',native='';s.graph.change('Inline source',d=>{inline=d.addReferenceNode(s.network,'source',d.createSource('Inline array','array@["glsl.float",2]',[1,2]));});
const put=(file,value)=>fs.writeFileSync(new URL(file,import.meta.url),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
put('human-inline.document.json',s.graph.capture().document);
put('human-inline.packet.json',copySelection(s.graph.capture(),s.fixed,s.network,[inline]));
s.graph.change('Native descriptor',d=>{native=d.addReferenceNode(s.network,'source',d.createSource('Native array','array@["glsl.float",2]',null,true,{kind:'native-array',path:'/authored/example'}));});
put('human-native.packet.json',copySelection(s.graph.capture(),s.fixed,s.network,[native]));
