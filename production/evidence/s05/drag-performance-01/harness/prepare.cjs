const fs=require('fs'), path=require('path'), cp=require('child_process'), crypto=require('crypto');
const root='C:/Users/user/source/Grape', scratch=__dirname, out=path.join(root,'production/evidence/s05/drag-performance-01');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const git=(...a)=>cp.execFileSync('git',a,{cwd:root,maxBuffer:100e6});
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const packetPath='production/evidence/coordinator/s05/owner-review-drag-performance-01/implementer-packet-02.json';
const packet=json(packetPath);
if(sha(fs.readFileSync(path.join(root,packetPath)))!=='b493f72a547f70edb31798db7970de3f86adbc6d1db7fb6bb13b4239f6c5c15a')throw Error('packet');
if(git('rev-parse','HEAD').toString().trim()!==packet.expectedWorkHead||git('diff','--name-only').length||git('diff','--cached','--name-only').length)throw Error('HEAD/index');
if(fs.existsSync(out))throw Error('Output exists; reconcile, never replay');
const refs=[...packet.inputRefs,packet.authorizationRef,packet.priorActionReceipt,packet.additionalSliceAuthority];
for(const r of refs){const b=fs.readFileSync(path.join(root,r.file)); if(sha(b)!==r.sha256||(r.bytes!==undefined&&b.length!==r.bytes))throw Error(r.file);}
const entries=git('ls-files','-s','-z').toString().split('\0').filter(Boolean), tracked=entries.map(entry=>{const [header,file]=entry.split('\t'),oid=header.split(' ')[1],b=fs.readFileSync(path.join(root,file));const blob=crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');if(blob!==oid)throw Error('Tracked mismatch '+file);return{file,bytes:b.length,sha256:sha(b),gitBlob:blob}});
const untracked=git('ls-files','--others','--exclude-standard','-z').toString().split('\0').filter(Boolean).map(file=>{const b=fs.readFileSync(path.join(root,file));return{file,bytes:b.length,sha256:sha(b)}});
fs.mkdirSync(out,{recursive:true}); const write=(name,data)=>fs.writeFileSync(path.join(out,name),JSON.stringify(data,null,2)+'\n',{flag:'wx'});
write('preimages-01.json',{head:packet.expectedWorkHead,tracked,untracked});
const inputs=[...new Set([...refs.map(r=>r.file),packetPath,...['resume-parent-intent-02.json','resume-parent-result-02.json'].map(n=>'production/evidence/coordinator/s05/owner-review-drag-performance-01/'+n)])];
fs.mkdirSync(path.join(out,'inputs')); const relocated=[];
for(const file of inputs){const b=fs.readFileSync(path.join(root,file));const dest='inputs/'+path.basename(file); if(fs.existsSync(path.join(out,dest)))throw Error('Name collision');fs.writeFileSync(path.join(out,dest),b,{flag:'wx'}); relocated.push({source:file,destination:dest,bytes:b.length,sha256:sha(b)});}
write('start-01.json',{actionKey:packet.actionKey,packetId:packet.packetId,startedAt:new Date().toISOString(),head:packet.expectedWorkHead,scope:'READ_ONLY_DIAGNOSIS; no product optimization, commit, deployment or live-service action',continuation:2,attempt:2,retriesUsed:0,priorMeasurements:0,repairAttempts:0,trackedVerified:tracked.length,untrackedPreserved:untracked.length,inputs:relocated});
for(const [label,rev,manifestPath] of [['i4','ee1212fdc54359f1ceba4c4b09f6e7cc06cddc41','production/evidence/s05/repair-03/build-manifest-01.json'],['r5',packet.expectedWorkHead,'production/evidence/s05/catalog-values-01/build-manifest-01.json']]){
 const dest=path.join(scratch,label+'-source');fs.mkdirSync(dest,{recursive:true});
 for(const file of git('ls-tree','-r','--name-only',rev,'production/src','production/apps','production/index.html','production/package.json').toString().trim().split('\n')){const target=path.join(dest,file.replace(/^production\//,''));fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,git('show',`${rev}:${file}`));}
 fs.mkdirSync(path.join(dest,'node_modules','@noble'),{recursive:true});fs.cpSync(path.join(root,'production/node_modules/@noble/hashes'),path.join(dest,'node_modules/@noble/hashes'),{recursive:true});
 const m=json(manifestPath);fs.writeFileSync(path.join(scratch,label+'-manifest.json'),JSON.stringify(m,null,2));
 console.log(label,JSON.stringify(m));
}
console.log(JSON.stringify({tracked:tracked.length,untracked:untracked.length,out}));
