// Local acceptance lookup. Never reads Legacy implementation or outside the package.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const id=process.argv[2];
if(!/^LC-(DATA|NODE|UI|HOST)-\d{3}$/.test(id??'')){console.error('Usage: node tools/find-capability.mjs LC-DATA-001');process.exitCode=2;}
else{
 const capability=read('compatibility/capabilities.json').capabilities.find(c=>c.id===id);
 if(!capability){console.error('Unknown capability');process.exitCode=2;}
 else console.log(JSON.stringify({capability,coverage:read('data/capability-coverage.json').entries.find(e=>e.capabilityId===id),gates:read('data/gates.json').gates.filter(g=>g.capabilityIds.includes(id)),slices:read('data/slices.json').slices.filter(s=>s.capabilityIds.includes(id)).map(s=>({id:s.id,name:s.name,scope:s.implementationScope,completion:s.completionDefinition}))},null,2));
}
