import fs from 'node:fs';
const s=fs.readFileSync('.verification/s06-f2-browser.mjs','utf8').replaceAll('s06/f2-only-01','s06/owner-corrections-01').replaceAll('s06-f2','s06-oc');fs.writeFileSync('.verification/s06-oc-browser.mjs',s,{flag:'wx'});
