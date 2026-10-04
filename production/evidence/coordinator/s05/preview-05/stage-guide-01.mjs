import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
const base='production/evidence/coordinator/s05/preview-05', dest='.verification/s05-human-preview-aa4c86e-01', sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const rows=[];for(const name of ['START-HERE.html','START-HERE.txt']){const b=fs.readFileSync(base+'/'+name);fs.writeFileSync(dest+'/'+name,b,{flag:'wx'});rows.push({file:name,bytes:b.length,sha256:sha(b),source:base+'/'+name});}
fs.writeFileSync(base+'/guide-stage-01.json',JSON.stringify({recordedAt:new Date().toISOString(),status:'STAGED_NOT_DEPLOYED_REVIEW_PENDING',files:rows},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({staged:rows.length}));
