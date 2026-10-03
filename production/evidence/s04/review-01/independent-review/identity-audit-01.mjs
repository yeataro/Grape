import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=process.cwd(); const out=path.join(root,'.verification/s04-fresh-review-01');
const packetPath='C:/Users/user/source/Grape/production/evidence/coordinator/s04/review-01/reviewer-packet-01.json';
const packet=JSON.parse(fs.readFileSync(packetPath)); const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p)); const git=(...a)=>execFileSync('git',a,{cwd:root,encoding:null,maxBuffer:128*1024*1024});
const checked=[],errors=[]; function check(p,expected,kind,revision){try{const data=revision?git('show',revision+':'+p):fs.readFileSync(p);const actual=hash(data);checked.push({file:p,kind,revision:revision??null,actual,expected,pass:actual===expected});if(actual!==expected)errors.push({file:p,kind,revision,actual,expected});}catch(e){errors.push({file:p,kind,revision,error:String(e)});}}
function refs(v){if(!v||typeof v!=='object')return;if(v.file&&v.sha256)check(v.file,v.sha256,'packet-ref');for(const c of Object.values(v))refs(c);}
check(packetPath,'b7ce1f081772dfcab892bd62ffe375a843c509bebdf27cca7259aac0b5b178ac','dispatch');refs(packet);
for(const key of ['sourceManifest','evidenceManifest']){const m=read(packet[key].file);for(const f of m.files){check(f.file,f.sha256,key);check(f.file,f.sha256,key+'-R',packet.submittedHeadR);if(key==='sourceManifest')check(f.file,f.sha256,key+'-I',packet.implementationI);}}
const manifest=read(packet.build.manifest.file);for(const f of manifest.files)check(f.file,f.sha256,'independent-build');
const oracle=read('production/tests/fixtures/reader-2.0/PROVENANCE.json');for(const f of oracle.files){check(f.target,f.sha256,'reader-oracle-copy');check(f.source,f.sha256,'accepted-reader-original',oracle.commit);}
for(const p of ['production/src/modules/image.ts','production/src/modules/nodes.ts','production/src/modules/networks.ts'])check(p,hash(git('show',packet.acceptedMain+':'+p)),'old-exact-owner');
const protectedDiff=git('diff','--name-only',packet.acceptedMain,packet.submittedHeadR,'--','handoff','production/evidence/acceptance','production/evidence/s01','production/evidence/s02','production/evidence/s03').toString().trim();
const status=git('status','--porcelain','--untracked-files=no').toString();
const result={at:new Date().toISOString(),head:git('rev-parse','HEAD').toString().trim(),implementationAncestor:execFileSync('git',['merge-base','--is-ancestor',packet.implementationI,packet.submittedHeadR],{cwd:root}).toString(),checkedCount:checked.length,errors,protectedDiff,status,checks:checked};
fs.writeFileSync(path.join(out,'identity-audit-01.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({head:result.head,checkedCount:checked.length,errors,protectedDiff,status}));
