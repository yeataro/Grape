import fs from 'node:fs';
let s=fs.readFileSync('.verification/s06-f2-build.mjs','utf8').replaceAll('build-01','build-02').replaceAll('S06-f2-','S06-debug-');fs.writeFileSync('.verification/s06-f2-build-02.mjs',s);
s=fs.readFileSync('.verification/s06-f2-rebuild.mjs','utf8').replaceAll('build-01','build-02');fs.writeFileSync('.verification/s06-f2-rebuild-02.mjs',s);
s=fs.readFileSync('.verification/s06-f2-delivery-01.mjs','utf8').replaceAll('build-01','build-02');fs.writeFileSync('.verification/s06-f2-delivery-01.mjs',s);
