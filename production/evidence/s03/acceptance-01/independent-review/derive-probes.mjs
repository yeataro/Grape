import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root='C:/Users/user/source/Grape/.verification/s03-review-01',out='C:/Users/user/source/Grape/.verification/s03-independent-rereview-02';
const hash=b=>({sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length});
const prior=root+'/production/evidence/s03/repair-02/prior-rereview';
const derived=[];
for(const name of ['verify-identities.mjs','verify-build-coverage.mjs','independent-probes.ts','counterexamples.ts','structure-depth.ts']) {
 const source=prior+'/'+name,original=fs.readFileSync(source);let text=original.toString().replaceAll('s03-independent-rereview-01','s03-independent-rereview-02');
 if(name==='verify-identities.mjs')text=text.replaceAll('s03-rereview-dispatch-01.json','s03-rereview-dispatch-02.json').replaceAll('production/evidence/s03/repair-01/','production/evidence/s03/repair-02/');
 if(name==='verify-build-coverage.mjs')text=text.replaceAll('production/evidence/s03/repair-01/','production/evidence/s03/repair-02/').replaceAll('repair-02/original-review/','repair-01/original-review/');
 const target=out+'/'+name;fs.writeFileSync(target,text);derived.push({source,original:hash(original),target,derived:hash(Buffer.from(text)),changes:'Only output directory and round2 manifest/dispatch paths, preserving historical initial report paths; same exact review clone imports'});
}
fs.copyFileSync('C:/Users/user/source/Grape/.verification/s03-rereview-dispatch-02.json',out+'/dispatch-packet.json');
fs.writeFileSync(out+'/probe-derivations.json',JSON.stringify(derived,null,2)+'\n');
