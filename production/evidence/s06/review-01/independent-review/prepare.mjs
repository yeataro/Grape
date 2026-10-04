import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=process.cwd(),out=path.join(root,'.verification/s06-workspace-review-01');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const packet=JSON.parse(fs.readFileSync('C:/Users/user/source/Grape/production/evidence/coordinator/s06/review-01/reviewer-packet-01.json','utf8'));
const verify=(rows,base=root)=>rows.map(r=>{if(!fs.existsSync(path.join(base,r.file)))return {file:r.file,valid:false,missing:true};const b=fs.readFileSync(path.join(base,r.file));return {file:r.file,bytes:b.length,sha256:hash(b),valid:b.length===r.bytes&&hash(b)===r.sha256};});
const base='production/evidence/s06/workspace-entry-01/';
const records={recordedAt:new Date().toISOString(),head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),packetInputs:verify(packet.inputRefs),source:verify(read(base+'build-final-01/source-config-manifest.json').files),evidence:verify(read(base+'evidence-manifest-01.json').files),reference:verify(read('production/evidence/coordinator/s06/preparation-01/legacy-reference-manifest-01.json').files,path.join(root,base,'reference'))};
records.mismatches=Object.fromEntries(Object.entries(records).filter(([,v])=>Array.isArray(v)).map(([k,v])=>[k,v.filter(r=>!r.valid)]));
for(const [id,a,b] of [['accepted-to-I',packet.acceptedMain,packet.implementationI],['I-to-R',packet.implementationI,packet.submittedHeadR]]){execFileSync('git',['merge-base','--is-ancestor',a,b]);records[id]=true;}
records.ItoRDiff=execFileSync('git',['diff','--name-only',packet.implementationI,packet.submittedHeadR],{encoding:'utf8'}).trim().split('\n');
records.materialDelta=records.ItoRDiff.filter(p=>!['README.md','implementation-state.json'].includes(p)&&!p.startsWith('production/evidence/'));
fs.writeFileSync(path.join(out,'identity-checks.json'),JSON.stringify(records,null,2));
const runtime=path.join(out,'runtime');fs.mkdirSync(runtime,{recursive:true});
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8',maxBuffer:32*1024*1024}).split('\0').filter(Boolean);
let bytes=0;for(const p of files){const target=path.join(runtime,p);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,p),target);bytes+=fs.statSync(target).size;}
const depsSource='C:/Users/user/source/Grape/production/node_modules';
fs.cpSync(depsSource,path.join(runtime,'production/node_modules'),{recursive:true});
const info={files:files.length,bytes,runtime,node:process.version,playwright:JSON.parse(fs.readFileSync(path.join(runtime,'production/node_modules/@playwright/test/package.json'))).version,dependencySource:depsSource,primaryLockMatches:hash(fs.readFileSync('C:/Users/user/source/Grape/production/package-lock.json'))===hash(fs.readFileSync(path.join(root,'production/package-lock.json')))};
fs.writeFileSync(path.join(out,'runtime-preparation.json'),JSON.stringify(info,null,2));
console.log(JSON.stringify({counts:Object.fromEntries(Object.entries(records).filter(([,v])=>Array.isArray(v)).map(([k,v])=>[k,v.length])),...info}));

