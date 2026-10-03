import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import cp from 'node:child_process';
const root = 'C:/Users/user/source/Grape/.verification/s03-review-01';
const out = 'C:/Users/user/source/Grape/.verification/s03-independent-review-01';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const results = [];
for (const manifest of ['source-config-manifest-01.json','protected-identities-02.json','evidence-manifest-02.json']) {
 const bytes = fs.readFileSync(path.join(root,'production/evidence/s03',manifest));
 const data = JSON.parse(bytes); const failures=[];
 for (const entry of data.files) {
  const content=fs.readFileSync(path.join(root,entry.file));
  if(hash(content)!==entry.sha256 || content.length!==entry.bytes) failures.push(entry.file);
 }
 results.push({manifest,sha256:hash(bytes),count:data.files.length,failures});
}
const submission=JSON.parse(fs.readFileSync(path.join(root,'production/evidence/s03/submission-02.json')));
for(const [key,entry] of Object.entries(submission)) if(entry?.file && entry?.sha256) {
 const bytes=fs.readFileSync(path.join(root,entry.file));
 results.push({object:key,file:entry.file,sha256:hash(bytes),matches:hash(bytes)===entry.sha256 && bytes.length===entry.bytes});
}
const git=(...args)=>cp.execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const output={time:new Date().toISOString(),root,head:git('rev-parse','HEAD'),gitDirectory:git('rev-parse','--absolute-git-dir'),sourceImplementationDiff:git('diff','--name-only','5a2dec1772735ce259912a0c26a9e3dc8fd2a20a','HEAD','--','production/src','production/apps','production/tests','production/tools','production/package.json','production/package-lock.json','production/playwright.config.ts','production/tsconfig.json'),metadataCorrectionDiff:git('diff','--stat','2e7fd4cd3d0f76562a79bd78bab0d6d18046311f','HEAD'),results};
fs.writeFileSync(path.join(out,process.argv[2]??'identities-before.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
if(results.some(x=>x.failures?.length || x.matches===false)) process.exitCode=1;
