import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=process.cwd(), out='production/evidence/continuous/20261005-01/b01-repair-01', coord='production/evidence/coordinator/continuous/20261005-01';
const git=(...a)=>execFileSync('git',a,{encoding:'utf8',maxBuffer:30e6}).trim();
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const info=file=>{const b=fs.readFileSync(file);return {file,bytes:b.length,sha256:hash(b)}};
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const write=(file,v)=>{if(fs.existsSync(file))throw Error('already exists '+file);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(v,null,2)+'\n')};
const packetFile=coord+'/b01-repair-packet-01.json', p=read(packetFile);
if(info(packetFile).sha256!=='e9ae72ca2bab59842e8373f4a10753422bde2db2b1a888dc9003fef3cfca93c3')throw Error('packet');
if(git('rev-parse','HEAD')!==p.currentExpectedHead || git('diff','--name-only') || git('diff','--cached','--name-only'))throw Error('head/index/worktree');
const refs=[]; function scan(v){if(v&&typeof v==='object'){if(v.file&&v.sha256&&Number.isInteger(v.bytes))refs.push(v); for(const x of Object.values(v))scan(x)}}scan(p);
for(const r of refs){const a=info(r.file);if(a.bytes!==r.bytes||a.sha256!==r.sha256)throw Error('input mismatch '+r.file)}
const tracked=git('ls-files','-z').split('\0').filter(Boolean).map(info), untracked=git('ls-files','--others','--exclude-standard','-z').split('\0').filter(Boolean).filter(x=>!x.startsWith(out+'/')).map(info);
write(out+'/preimages-01.json',{head:p.currentExpectedHead,tracked,untracked});
const copies=[];function copy(source,destination,expected){const a=info(source);if(expected&&(a.bytes!==expected.bytes||a.sha256!==expected.sha256))throw Error('copy mismatch '+source);if(fs.existsSync(destination))throw Error('destination exists '+destination);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(source,destination);const b=info(destination);if(a.sha256!==b.sha256)throw Error('copy failed');copies.push({...b,source});}
const source=path.resolve(p.persistence.reviewSource), dest=p.persistence.reviewDestination, manifest=read(p.originalManifest.file), seen=new Set();
for(const r of manifest.files){const rel=r.file.replaceAll('\\','/');const s=path.resolve(source,rel);if(!s.startsWith(source+path.sep)||seen.has(s.toLowerCase()))throw Error('containment/duplicate '+rel);seen.add(s.toLowerCase());copy(s,dest+'/'+rel,r)}
copy(p.originalReview.file,dest+'/INDEPENDENT_REVIEW_RESULT.json',p.originalReview);copy(p.originalManifest.file,dest+'/supporting-evidence-manifest-01.json',p.originalManifest);
for(const scout of p.persistence.scouts)for(const r of scout.files)copy(r.file,scout.destination+'/'+path.basename(r.file),r);
const transport=['b01-repair-packet-01.json','b01-repair-dispatch-result-01.json','b01-repair-parent-intent-01.json','b01-repair-parent-result-01.json'].map(x=>info(coord+'/'+x));
write(out+'/input-preservation-01.json',{actionKey:p.actionKey,priorI:p.priorI,priorR:p.priorR,rawReviewObjects:404,copies,verifiedInputs:refs,transport,scoutsStatus:'READ_ONLY_ANALYSIS_NOT_IMPLEMENTATION_OR_PASS',inheritedCounters:p.inheritedCounters,budgetApplication:p.budgetApplication});
write(out+'/start-01.json',{actionKey:p.actionKey,startedAt:new Date().toISOString(),head:p.currentExpectedHead,packet:info(packetFile),writer:p.writer,scope:p.authorizedScope,trackedClean:true,indexClean:true,untrackedPreserved:untracked.length,remote:{main:'9003c00b214ac29cafcb6cc22ac10693ac92a0bf',work:p.expectedWorkHead},status:'REPAIR_STARTED_NOT_REVIEWED'});
const paths=[...copies.map(x=>x.file),...p.persistence.pendingReceipts.map(x=>x.file),...transport.map(x=>x.file),out+'/preserve-inputs-01.mjs',out+'/preimages-01.json',out+'/input-preservation-01.json',out+'/start-01.json'];
write(out+'/maintenance-allowlist-01.json',{paths});
console.log(JSON.stringify({refs:refs.length,raw:manifest.files.length+2,copies:copies.length,tracked:tracked.length,untracked:untracked.length,paths:paths.length}));
