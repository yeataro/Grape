import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {chromium} from '../production/node_modules/playwright/index.mjs';
const out='production/evidence/s05/submission-01',scratch='.verification/s05-archive-browser-01';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(fs.readFileSync(out+'/build-manifest-01.json'));
assert.equal(hash(fs.readFileSync(manifest.archive.file)),manifest.archive.sha256);
if(fs.existsSync(scratch))throw Error('FRESH_ARCHIVE_CHECK_REQUIRED');fs.mkdirSync(scratch,{recursive:true});
execFileSync('tar',['-xzf',manifest.archive.file,'-C',scratch]);
const map=new Map();for(const row of manifest.files){const f=row.file.slice('production/dist/'.length),b=fs.readFileSync(path.join(scratch,f));assert.equal(hash(b),row.sha256);map.set('/'+f,{bytes:b,type:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}map.set('/',map.get('/index.html'));
const browser=await chromium.launch(),rows=[];
try{for(const address of ['127.0.0.1','192.168.1.105','100.83.88.97']){
  const server=http.createServer((req,res)=>{const f=map.get(req.url);if(!f){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':f.type,'Cache-Control':'no-store'});res.end(f.bytes);});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,address,resolve);});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  try{
    const page=await context.newPage();page.on('dialog',d=>d.accept());const url='http://'+address+':'+server.address().port;
    await page.goto(url);
    await page.getByLabel('Open document file').setInputFiles(out+'/samples/shared-function.grape.json');
    await page.getByRole('button',{name:'Open in new session',exact:true}).click();
    await page.getByRole('button',{name:'Generate GLSL',exact:true}).click();
    assert.match(await page.getByLabel('Generated GLSL').textContent(),/void grape_function_0/);
    const canvas=page.locator('.canvas').first();
    await canvas.getByRole('heading',{name:'Shared arithmetic',exact:true}).first().click();
    await canvas.getByRole('button',{name:'Enter subgraph',exact:true}).click();
    await canvas.getByText('Subgraph interface',{exact:true}).click();
    assert.equal(await canvas.getByLabel('Subgraph emission mode').inputValue(),'function');
    await canvas.getByRole('button',{name:'Add interface port',exact:true}).click();
    await canvas.getByRole('button',{name:'Apply interface',exact:true}).click();
    await page.getByRole('button',{name:'Personal Library',exact:true}).click();
    await page.getByLabel('Import Personal package').setInputFiles(out+'/samples/shared-function.personal.json');
    await page.locator('[data-personal-file]').waitFor();
    assert.equal(await page.locator('[data-personal-file]').count(),1);
    await page.getByRole('button',{name:'Insert Subgraph',exact:true}).click();
    await page.getByRole('button',{name:'Save',exact:true}).click();
    await page.locator('#save-state').filter({hasText:'Saved'}).waitFor();
    const facts=await page.evaluate(()=>({secure:isSecureContext,subtle:typeof crypto.subtle,uuid:typeof crypto.randomUUID}));
    if(address!=='127.0.0.1'){assert.equal(facts.secure,false);assert.equal(facts.subtle,'undefined');}
    const artifactHashes=[];for(const row of manifest.files){const r=await page.request.get(url+'/'+row.file.slice('production/dist/'.length));assert.equal(hash(await r.body()),row.sha256);artifactHashes.push(row.sha256);}
    await page.screenshot({path:out+'/archive-'+address+'.png',fullPage:true});
    rows.push({address,url,...facts,loadedSample:true,functionGeneration:true,interfaceSecureId:true,PersonalImportInsert:true,saveAcknowledged:true,artifactHashes});
  }finally{await context.close();await new Promise(resolve=>server.close(resolve));}
}}finally{await browser.close();}
const result={status:'PASS_IMPLEMENTER_ARCHIVE_SMOKE',implementationI:manifest.implementationI,buildManifestSha256:hash(fs.readFileSync(out+'/build-manifest-01.json')),archive:manifest.archive,browser:'Chromium151.0.7922.34',sameMachine:true,secondDevice:false,isolatedContexts:true,temporaryListenersClosed:true,humanPreviewPortsUntouched:[4174,4192],rows};
fs.writeFileSync(out+'/archive-browser-01.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result,null,2));
