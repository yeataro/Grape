const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const root='C:/Users/user/.codex/worktrees/s05-drag-performance-review-01/Grape/.verification/s05-drag-performance-review-01/runtime',base=__dirname,out="C:/Users/user/.codex/worktrees/s05-drag-performance-review-01/Grape/.verification/s05-drag-performance-review-01/performance-01";
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'); const results=[];
for(const label of ['before','after']){
 const m=JSON.parse(fs.readFileSync(base+'/'+label+'-manifest.json'));
 const archive=root+'/'+m.archive.file;if(hash(fs.readFileSync(archive))!==m.archive.sha256)throw Error('archive');
 const dest=base+'/'+label+'-archive';if(!fs.existsSync(dest)){fs.mkdirSync(dest);cp.execFileSync('tar',['-xzf',archive,'-C',dest]);}
 for(const f of m.files){const p=dest+'/'+f.file.replace(/^production\/dist\//,'');if(hash(fs.readFileSync(p))!==f.sha256)throw Error('archive file '+p);}
 for(const kind of ['source','instrumented-02']){
   const cwd=base+'/'+label+'-'+kind;
   const proc=cp.spawnSync(process.execPath,[root+'/production/node_modules/vite/bin/vite.js','build'],{cwd,encoding:'utf8'});
   const files=fs.existsSync(cwd+'/dist')?fs.readdirSync(cwd+'/dist',{recursive:true}).filter(f=>fs.statSync(cwd+'/dist/'+f).isFile()).map(f=>({file:f,sha256:hash(fs.readFileSync(cwd+'/dist/'+f))})):[];
   const equal=kind==='source'&&m.files.every(f=>files.some(x=>x.file.replaceAll('\\','/')===f.file.replace(/^production\/dist\//,'')&&x.sha256===f.sha256));
   results.push({label,kind,status:proc.status,stdout:proc.stdout,stderr:proc.stderr,files,exactRebuiltArchiveEquality:equal});
   if(proc.status!==0)throw Error(proc.stderr);
   if(kind==='source'&&!equal)throw Error('Uninstrumented rebuild not byte-identical');
 }
}
fs.writeFileSync(out+'/build-equivalence-01.json',JSON.stringify(results,null,2)+'\n',{flag:'wx'});console.log(results.map(x=>({label:x.label,kind:x.kind,status:x.status,exact:x.exactRebuiltArchiveEquality})));
