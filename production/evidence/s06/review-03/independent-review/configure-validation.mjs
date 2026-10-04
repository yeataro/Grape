import fs from 'node:fs';import path from 'node:path';
const root=process.cwd(),out=path.join(root,'.verification/s06-workspace-review-03'),runtime=path.join(out,'runtime');
let source=fs.readFileSync(path.join(root,'production/evidence/s06/review-02/independent-review/run-validation.mjs'),'utf8').replaceAll('s06-workspace-review-02','s06-workspace-review-03').replaceAll('workspace-repair-01','workspace-repair-02').replace("const specs=['s06-help.spec.ts'","const specs=['s06-connection-view.spec.ts','s06-help.spec.ts'").replace("...specs,'s01.spec.ts'","...specs,'s01.spec.ts','s03.spec.ts'");
fs.writeFileSync(path.join(out,'run-validation.mjs'),source);
for(const f of ['production/evidence/s05/repair-02/samples/legacy-owner.grape.json','production/evidence/s06/workspace-repair-02/build-01/candidate-web.tar.gz']){const dst=path.join(runtime,f);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(path.join(root,f),dst);}
