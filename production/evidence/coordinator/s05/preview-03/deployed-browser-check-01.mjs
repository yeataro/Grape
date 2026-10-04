import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium} from '../production/node_modules/@playwright/test/index.mjs';
import {deliveredFlow,reviewFile} from '../production/tests/fixtures/s05-delivered-flows.ts';
const config=JSON.parse(fs.readFileSync(process.argv[2]));
const output=path.resolve(process.argv[3]);
assert.ok(output.startsWith(path.resolve('production/evidence/coordinator/s05/preview-03')+path.sep));
assert.equal(fs.existsSync(output),false);fs.mkdirSync(output);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const browser=await chromium.launch();const rows=[];
try {
 for(const address of config.addresses){
  const origin=`http://${address}:${config.port}`;const context=await browser.newContext({viewport:{width:1440,height:1000}});
  try {
   const page=await context.newPage();const errors=[];const confirmations=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('dialog',async d=>{confirmations.push({type:d.type(),message:d.message()});await d.accept();});
   const response=await page.request.get(origin+'/_delivery.json');assert.equal(response.status(),200);const identity=await response.json();
   for(const key of ['sliceId','buildId','implementationI','reviewedR','reviewSha256','buildManifestSha256'])assert.equal(identity[key],config[key]);
   const files=[];let sample;
   for(const row of identity.files){const r=await page.request.get(origin+'/'+row.file);assert.equal(r.status(),200);const b=await r.body();assert.equal(b.length,row.bytes);assert.equal(hash(b),row.sha256);files.push({file:row.file,sha256:row.sha256,bytes:b.length});if(row.file==='samples/legacy-owner.grape.json')sample=b;}
   assert.ok(sample);assert.equal(sample.length,10296);
   await page.goto(origin+'/review.html');const heading=await page.getByLabel('目前部署版本').textContent();assert.ok(heading.includes(config.buildId)&&heading.includes(config.reviewedR.slice(0,7)));
   await page.goto(origin+'/');const inspection=await reviewFile(page,'legacy-owner.grape.json',sample);assert.match(inspection.message,/DOCUMENT_VALID/);assert.ok(inspection.details.candidate);
   await page.screenshot({path:path.join(output,'valid-import-'+address+'.png'),fullPage:true});
   await page.reload();const flow=await deliveredFlow(page,'legacy-owner.grape.json',sample,sample);
   await page.getByRole('button',{name:'Generate GLSL',exact:true}).click();assert.match(await page.getByLabel('Generated GLSL').textContent(),/#version 300 es/);
   const environment=await page.evaluate(()=>({secure:isSecureContext,subtle:typeof crypto.subtle,uuid:typeof crypto.randomUUID,entropy:typeof crypto.getRandomValues}));
   if(address!=='127.0.0.1'){assert.equal(environment.secure,false);assert.equal(environment.subtle,'undefined');}assert.equal(environment.entropy,'function');assert.deepEqual(errors,[]);
   await page.goto(origin+'/review.html');const app=page.frameLocator('iframe');await app.getByRole('button',{name:'Open saved',exact:true}).click();await app.locator('#saved-list button').first().click();await app.getByRole('button',{name:'Generate GLSL',exact:true}).click();assert.match(await app.getByLabel('Generated GLSL').textContent(),/#version 300 es/);
   await page.screenshot({path:path.join(output,'deployed-upgraded-'+address+'.png'),fullPage:true});
   rows.push({address,entry:origin+'/review.html',bundle:origin+'/s05-legacy-retest-b0d61c6.zip',heading,verifiedFiles:files,inspection,flow,confirmations,environment,pageErrors:errors});
  } finally {await context.close();}
 }
 const result={packetType:'DEPLOYED_PREVIEW_BROWSER_VERIFICATION',recordedAt:new Date().toISOString(),status:'PASS_DEPLOYMENT_LEGACY_FLOW_ONLY',implementationI:config.implementationI,reviewedR:config.reviewedR,buildId:config.buildId,reviewSha256:config.reviewSha256,browser:browser.version(),sameMachine:true,secondDevice:false,isolatedContexts:true,humanStorageUntouched:true,serviceStillRunning:true,scope:'Operational exact delivered legacy sample public import/upgrade/generation/save/reopen on three origins; independent technical verdict remains the separate reviewer report.',reusedReviewedHarness:'production/tests/fixtures/s05-delivered-flows.ts',rows};
 fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:result.status,rows:rows.map(r=>({address:r.address,files:r.verifiedFiles.length,actions:r.flow.actions,valid:r.inspection.message})),browser:result.browser}));
}catch(error){fs.writeFileSync(path.join(output,'failure.json'),JSON.stringify({recordedAt:new Date().toISOString(),status:'DEPLOYMENT_CHECK_FAILED',rows,error:String(error),stack:error.stack},null,2)+'\n',{flag:'wx'});throw error;}finally{await browser.close();}
