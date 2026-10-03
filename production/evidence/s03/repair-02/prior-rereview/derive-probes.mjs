import fs from 'node:fs';
import crypto from 'node:crypto';
const root='C:/Users/user/source/Grape/.verification/s03-review-01';
const out='C:/Users/user/source/Grape/.verification/s03-independent-rereview-01';
const rows=[];
for(const file of ['counterexamples.ts','structure-depth.ts']){
const original=root+'/production/evidence/s03/repair-01/original-review/'+file;
const bytes=fs.readFileSync(original);const derived=bytes.toString('utf8').replaceAll('C:/Users/user/source/Grape/.verification/s03-independent-review-01',out);
if(derived.includes('/s03-independent-review-01'))throw Error('STALE_OUTPUT_PATH');
fs.writeFileSync(out+'/'+file,derived);rows.push({original,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),derived:out+'/'+file,derivedSha256:crypto.createHash('sha256').update(derived).digest('hex'),changes:'Only output directory changed to new rereview directory. Existing ../s03-review-01 imports resolve exact isolated candidate; no old script executed.'});
}
fs.writeFileSync(out+'/probe-derivations.json',JSON.stringify(rows,null,2)+'\n');
