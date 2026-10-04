import fs from 'node:fs';
let s=fs.readFileSync('production/tests/browser/s06-brand-info.spec.ts','utf8').replace('S06-debug-[a-f0-9]{7}','S06-(debug|f2)-[a-f0-9]{7}');fs.writeFileSync('production/tests/browser/s06-brand-info.spec.ts',s);
