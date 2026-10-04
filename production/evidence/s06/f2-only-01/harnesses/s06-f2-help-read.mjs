import fs from 'node:fs';
const f='production/src/features/canvas.ts';let s=fs.readFileSync(f,'utf8');const at=s.indexOf('helpTitle.textContent');console.log(s.slice(at,at+1550));
