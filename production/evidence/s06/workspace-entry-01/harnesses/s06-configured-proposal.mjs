import fs from 'node:fs';import path from 'node:path';import cp from 'node:child_process';import crypto from 'node:crypto';
const root=process.cwd(),base=path.join(root,'.verification/s06-configured-proposal-01'),dest=path.join(base,'production');
if(fs.existsSync(base))throw Error('IMMUTABLE_PROPOSAL_ALREADY_EXISTS');fs.mkdirSync(dest,{recursive:true});
for(const folder of ['src','tests/fixtures'])fs.cpSync(path.join(root,'production',folder),path.join(dest,folder),{recursive:true});
fs.cpSync(path.join(root,'production/node_modules/@noble/hashes'),path.join(dest,'node_modules/@noble/hashes'),{recursive:true});fs.copyFileSync(path.join(root,'production/package.json'),path.join(dest,'package.json'));
const file=path.join(dest,'src/model/graph.ts');let graph=fs.readFileSync(file,'utf8');
graph=graph.replace('add(networkId: string, ref: NodeTypeRef, position: [number, number]): string {','add(networkId: string, ref: NodeTypeRef, position: [number, number], parameters: Readonly<Record<string, Json>> = {}): string {');
const before='const node = this.make(def, def.initialize(), position, network);',after=`plain(parameters);
      demand(parameters && typeof parameters === "object" && !Array.isArray(parameters), "PARAMETER_VALUE");
      const state = structuredClone(def.initialize());
      for (const [key, value] of Object.entries(parameters)) {
        const spec = def.parameters(detached(state), modelContext(this.document, this.definitions)).find(p => p.key === key);
        demand(spec, "PARAMETER_MISSING");
        demand(spec.target === "state" && spec.type === "choice" && spec.choices?.some(v => equal(v, value)), "PARAMETER_VALUE");
        demand(state && typeof state === "object" && !Array.isArray(state), "STATE_RECORD");
        state[key] = structuredClone(value);
      }
      const node = this.make(def, state, position, network);`;
if(!graph.includes(before))throw Error('PREIMAGE');graph=graph.replace(before,after);fs.writeFileSync(file,graph);
const editor=path.join(dest,'src/application/editor.ts');let app=fs.readFileSync(editor,'utf8');
app=app.replace('else id = d.add(network.id, definition.ref, [0, 0]);','else id = d.add(network.id, definition.ref, [0, 0], parameters);');
app=app.replace(/            if \(Object.keys\(parameters\).length\)[\s\S]*?            const candidateNetwork/,'            const candidateNetwork');
app=app.replace('args.position as [number, number],\n          );','args.position as [number, number],\n            candidate?.parameters ?? {},\n          );');
// Source keeps CRLF; match either form without touching the original file.
app=app.replace('args.position as [number, number],\r\n          );','args.position as [number, number],\r\n            candidate?.parameters ?? {},\r\n          );');
fs.writeFileSync(editor,app);
const changed=['src/model/graph.ts','src/application/editor.ts'];let patches='';
for(const f of changed){const a=path.join(root,'production',f),b=path.join(dest,f),result=cp.spawnSync('git',['diff','--no-index','--no-ext-diff','--',a,b],{encoding:'utf8',maxBuffer:4e6});if(result.status!==1)throw Error('NO_PROPOSAL_DIFF '+f);patches+=result.stdout.replaceAll(a.replaceAll('\\','/'),'production/'+f).replaceAll(b.replaceAll('\\','/'),'production/'+f);}
const evidence=path.join(root,'production/evidence/s06/workspace-entry-01');fs.writeFileSync(path.join(evidence,'configured-creation-proposal-01.patch'),patches,{flag:'wx'});
let repro=fs.readFileSync(path.join(root,'.verification/s06-configured-creation-counterexample.mjs'),'utf8');repro=repro.replaceAll("'../production/","'./production/");repro=repro.slice(0,repro.indexOf('const result='))+`const good=created.state.mode==='vec2'&&created.ports.find(p=>p.direction==='output').type==='glsl.vec2';if(!good)throw Error('PROPOSAL_FAILED');
const edge=context.network().edges.find(e=>e.from.nodeId===created.id);if(!edge || edge.adaptation.kind!=='direct')throw Error('ADAPTATION');
s.app.execute({panelId:'s06',typeId:'s06'},{object:null,scope:context.scope},{commandId:'grape.undo'});if(JSON.stringify(s.app.snapshot.document)!==JSON.stringify(before.document))throw Error('UNDO');
console.log(JSON.stringify({status:'DISPOSABLE_PROPOSAL_ONLY',good,preview:item.parameters,actual:created.state,ports:created.ports,edge,oneUndo:true}));`;
fs.writeFileSync(path.join(base,'probe.mjs'),repro);
console.log(JSON.stringify({base,originalUnchanged:true,patchSha256:crypto.createHash('sha256').update(patches).digest('hex')}));
