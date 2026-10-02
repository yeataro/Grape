import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import cp from 'node:child_process';
import os from 'node:os';
const root='C:/Users/user/source/Grape/.verification/s03-review-01';
const out='C:/Users/user/source/Grape/.verification/s03-independent-rereview-02';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const git=(...args)=>cp.execFileSync('git',['-c','safe.directory='+root,...args],{cwd:root,encoding:'utf8'}).trim();
const hash=p=>{const b=fs.readFileSync(p);return {sha256:sha(b),bytes:b.length}};
const phase=process.argv[2]||'before';
const packet=JSON.parse(fs.readFileSync('C:/Users/user/source/Grape/.verification/s03-rereview-dispatch-02.json','utf8'));
const submission=read('production/evidence/s03/repair-02/submission-01.json');
let objects=[];for(const [key,v] of [...Object.entries(packet),...Object.entries(submission)]) if(v&&typeof v==='object'&&v.file&&v.sha256){const actual=hash(path.join(root,v.file));objects.push({key,file:v.file,...actual,matches:actual.sha256===v.sha256&&(v.bytes===undefined||actual.bytes===v.bytes)});}
const manifests=['source-config-manifest-01.json','evidence-manifest-01.json','protected-identities-01.json'];
const checked=manifests.map(name=>{const file='production/evidence/s03/repair-02/'+name;const m=read(file);return {file,...hash(path.join(root,file)),count:m.files.length,failures:m.files.flatMap(x=>{try {const a=hash(path.join(root,x.file));return a.sha256===x.sha256&&a.bytes===x.bytes?[]:[{expected:x,actual:a}]}catch(e){return[{file:x.file,error:String(e)}]}})}});
const lock=read('production/package-lock.json'),installed=read('production/node_modules/.package-lock.json');const mismatches=[];let dependencyCount=0;for(const [p,v] of Object.entries(installed.packages)){if(!p)continue;dependencyCount++;const l=lock.packages[p];if(!l||l.version!==v.version||l.integrity!==v.integrity)mismatches.push({p,expected:l,actual:v});}
const status={time:new Date().toISOString(),phase,root,head:git('rev-parse','HEAD'),gitDirectory:git('rev-parse','--absolute-git-dir'),gitStatus:git('status','--porcelain'),implementationAncestor:(()=>{try{git('merge-base','--is-ancestor',packet.implementationI,packet.submittedHeadR);return true}catch{return false}})(),sourceImplementationDiff:git('diff','--name-only',packet.implementationI,packet.submittedHeadR,'--','production/src','production/tests','production/tools','production/package.json','production/package-lock.json','production/playwright.config.ts','production/tsconfig.json','production/vite.config.ts'),implementationToSubmissionDiff:git('diff','--stat',packet.implementationI,packet.submittedHeadR),objects,manifests:checked,environment:{node:process.version,platform:process.platform,arch:process.arch,osRelease:os.release(),playwright:read('production/node_modules/playwright/package.json').version,gitAlternatesPresent:fs.existsSync(path.join(root,'.git/objects/info/alternates')),dependencyCount,dependencyLockMismatches:mismatches,paths:['README.md','production/src/model/graph.ts','production/node_modules/playwright/package.json'].map(p=>({path:p,real:fs.realpathSync(path.join(root,p)),nlink:fs.statSync(path.join(root,p)).nlink}))}};
fs.writeFileSync(out+'/identities-'+phase+'.json',JSON.stringify(status,null,2)+'\n');
console.log(JSON.stringify({head:status.head,status:status.gitStatus,sourceImplementationDiff:status.sourceImplementationDiff,objects:objects.length,objectFailures:objects.filter(x=>!x.matches),manifests:checked,environment:status.environment},null,2));
if(status.head!==packet.submittedHeadR||objects.some(x=>!x.matches)||checked.some(x=>x.failures.length)||mismatches.length||status.sourceImplementationDiff)process.exitCode=1;
