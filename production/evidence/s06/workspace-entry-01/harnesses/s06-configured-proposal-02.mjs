import fs from 'node:fs';import path from 'node:path';import cp from 'node:child_process';
const root=process.cwd(),base=path.join(root,'.verification/s06-configured-proposal-01'),dest=path.join(base,'production');
const editor=path.join(dest,'src/application/editor.ts');let app=fs.readFileSync(editor,'utf8');app=app.replace(/          if \(Object.keys\(parameters\).length\)[\s\S]*?          const candidateNetwork/,'          const candidateNetwork');fs.writeFileSync(editor,app);
let repro=fs.readFileSync(path.join(base,'probe.mjs'),'utf8').replace("edge.adaptation.kind!=='direct'","edge.adaptation.operation!=='identity'");
repro=repro.replace("console.log(JSON.stringify({status:","const positive={status:").replace('edge,oneUndo:true}));','edge,oneUndo:true};');
repro+=`
const {nodeRef}=await import('./production/src/modules/nodes.ts');const negatives=[];
for(const parameters of [{mode:'bogus'},{unknown:'vec2'},{x:1}]){
 const fresh=application(),before=fresh.graph.capture();let events=0,error='';const off=fresh.graph.subscribe(()=>events++);
 try{fresh.graph.change('Rejected configured add',d=>d.add(fresh.network,nodeRef('compose'),[0,0],parameters));}catch(e){error=e.name;}off();
 if(!error||events||JSON.stringify(fresh.graph.capture())!==JSON.stringify(before))throw Error('ATOMICITY');negatives.push({parameters,error,events,unchanged:true});
}
const fs=await import('node:fs');fs.writeFileSync('production/evidence/s06/workspace-entry-01/configured-creation-proposal-result-02.json',JSON.stringify({positive,negatives,productionModelUnmodified:true,productClaim:false},null,2)+'\\n',{flag:'wx'});console.log(JSON.stringify({positive,negatives}));`;
repro=repro.replace("const fs=await import('node:fs');",'');fs.writeFileSync(path.join(base,'probe-02.mjs'),repro);
let patches='';for(const f of ['src/model/graph.ts','src/application/editor.ts']){const result=cp.spawnSync('git',['diff','--no-index','--no-ext-diff','--',path.join(root,'production',f),path.join(dest,f)],{encoding:'utf8',maxBuffer:4e6});if(result.status!==1)throw Error('DIFF');const lines=result.stdout.split('\n');lines[0]=`diff --git a/production/${f} b/production/${f}`;lines[2]=`--- a/production/${f}`;lines[3]=`+++ b/production/${f}`;patches+=lines.join('\n');}
fs.writeFileSync(path.join(root,'production/evidence/s06/workspace-entry-01/configured-creation-proposal-02.patch'),patches,{flag:'wx'});
