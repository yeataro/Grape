import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {pathToFileURL} from 'node:url';
const root=process.cwd(),out=path.join(root,'.verification/s06-workspace-review-01'),runtime=path.join(out,'runtime'),prod=path.join(runtime,'production');const results=[];
async function run(id,args,cwd,extra={}){const dir=path.join(out,id);fs.mkdirSync(dir,{recursive:true});const startedAt=new Date().toISOString();const log=fs.createWriteStream(path.join(dir,'execution.log'));const code=await new Promise(resolve=>{const p=spawn(process.execPath,args,{cwd,env:{...process.env,...extra},windowsHide:true});p.stdout.pipe(log,{end:false});p.stderr.pipe(log,{end:false});p.on('error',e=>log.write(String(e)));p.on('close',resolve)});log.end();const row={id,args,cwd,startedAt,finishedAt:new Date().toISOString(),exitCode:code};results.push(row);fs.writeFileSync(path.join(out,'validation-executions.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(row));return code;}
await run('root-bootstrap',['tools/verify-bootstrap.mjs'],root);
await run('root-state',['handoff/tools/check-implementation-state.mjs','--current'],root);
await run('root-fixtures',['--test','--test-isolation=none','tools/verify-bootstrap.test.mjs'],root);
await run('typecheck',['node_modules/typescript/bin/tsc','--noEmit'],prod);
await run('module-pins',['tools/module-pins.mjs'],prod);
await run('boundaries',['tools/boundaries.mjs'],prod);
await run('unit-conformance',['--experimental-transform-types','--test','--test-isolation=none',...['unit','conformance'].flatMap(d=>fs.readdirSync(path.join(prod,'tests',d)).filter(f=>f.endsWith('.test.ts')).map(f=>'tests/'+d+'/'+f))],prod);
const {createServer}=await import(pathToFileURL(path.join(prod,'node_modules/vite/dist/node/index.js')).href);
const server=await createServer({root:prod,server:{host:'127.0.0.1',port:0,strictPort:true,watch:{ignored:['**/evidence/**','**/test-results/**']}}});await server.listen();const origin=server.resolvedUrls.local[0];fs.writeFileSync(path.join(out,'source-origin.json'),JSON.stringify({origin,loopbackOnly:true}));
try{await run('source-browser',['node_modules/@playwright/test/cli.js','test','--config','tools/s06-playwright.config.ts','--output',path.join(out,'source-browser','test-results')],prod,{GRAPE_EVIDENCE_DIR:path.join(out,'source-browser'),GRAPE_BASE_URL:origin});}finally{await server.close();}
await run('archive-smoke',['--experimental-transform-types','tools/s06-archive-check.ts','--manifest',path.join(root,'production/evidence/s06/workspace-entry-01/build-final-01/build-manifest.json'),'--output',path.join(out,'archive-public','result.json'),'--scratch',path.join(out,'archive-extracted')],prod,{GRAPE_EVIDENCE_DIR:path.join(out,'archive-public')});
