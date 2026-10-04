import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium,expect} from '../production/node_modules/@playwright/test/index.mjs';
import {replacementFlow} from '../production/tests/fixtures/s05-replacement-flows.ts';
import {reviewFile} from '../production/tests/fixtures/s05-delivered-flows.ts';
const config=JSON.parse(fs.readFileSync(process.argv[2]));
const output=path.resolve(process.argv[3]);
assert.ok(output.startsWith(path.resolve('production/evidence/coordinator/s05/preview-04')+path.sep));
assert.equal(fs.existsSync(output),false);fs.mkdirSync(output);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const write=(name,j)=>{const b=Buffer.from(JSON.stringify(j,null,2)+'\n');fs.writeFileSync(path.join(output,name),b,{flag:'wx'});return{file:name,sha256:hash(b),bytes:b.length};};
const browser=await chromium.launch();const rows=[];
try{
 for(const address of config.addresses){
  const origin='http://'+address+':'+config.port;
  const context=await browser.newContext({viewport:{width:1440,height:1100}});
  let sample;const files=[];let heading;let wrapper;
  try{
   const page=await context.newPage();const response=await page.request.get(origin+'/_delivery.json');assert.equal(response.status(),200);const identity=await response.json();
   for(const key of ['sliceId','buildId','implementationI','reviewedR','reviewSha256','buildManifestSha256'])assert.equal(identity[key],config[key]);
   for(const f of identity.files){const r=await page.request.get(origin+'/'+f.file);assert.equal(r.status(),200);const b=await r.body();assert.equal(b.length,f.bytes);assert.equal(hash(b),f.sha256);files.push(f);if(f.file==='samples/legacy-owner.grape.json')sample=b;}
   assert.ok(sample);assert.equal(hash(sample),'2bc735a55637ee42f7beeef7687a6e687fa62a8154dfc36cef3d4ebc152fbb86');
   await page.goto(origin+'/review.html');heading=await page.getByLabel('目前部署版本').textContent();assert.ok(heading.includes(config.buildId)&&heading.includes(config.reviewedR.slice(0,7)));
   const app=page.frameLocator('iframe');const inspection=await reviewFile(app,'legacy-owner.grape.json',sample);assert.match(inspection.message,/DOCUMENT_VALID/);assert.ok(inspection.details.candidate);
   const accept=app.getByRole('button',{name:'Accept replacement (one Undo)',exact:true});await expect(accept).toBeDisabled();await expect(app.locator('#replacement-message')).toContainText('different module versions or output profile');
   wrapper={inspectionMessage:inspection.message,reason:await app.locator('#replacement-message').textContent(),replaceDisabled:await accept.isDisabled(),newSessionEnabled:await app.getByRole('button',{name:'Open in new session',exact:true}).isEnabled()};
   assert.equal(wrapper.newSessionEnabled,true);await page.screenshot({path:path.join(output,'deployed-ineligible-'+address+'.png'),fullPage:true});
  }finally{await context.close();}
  const cases=[];
  for(const mode of ['default','upgraded','matching']){
   const context=await browser.newContext({viewport:{width:1440,height:1000}});
   try{
    const page=await context.newPage(),errors=[],confirmations=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',async d=>{confirmations.push({type:d.type(),message:d.message()});await d.accept();});
    await page.goto(origin+'/');const flow=await replacementFlow(page,mode,sample);
    const environment=await page.evaluate(()=>({secure:isSecureContext,subtle:typeof crypto.subtle,uuid:typeof crypto.randomUUID,entropy:typeof crypto.getRandomValues}));
    if(address!=='127.0.0.1'){assert.equal(environment.secure,false);assert.equal(environment.subtle,'undefined');}assert.equal(environment.entropy,'function');assert.deepEqual(errors,[]);
    await page.screenshot({path:path.join(output,'result-'+mode+'-'+address+'.png'),fullPage:true});
    const evidence=write('flow-'+mode+'-'+address+'.json',{flow,environment,confirmations,pageErrors:errors});
    cases.push({mode,status:'PASS',refusalAtomic:flow.refusalAtomic??null,oneUndoRedo:flow.oneUndoRedo??null,recovery:flow.recovery??null,evidence,environment,pageErrors:errors});
   }finally{await context.close();}
  }
  rows.push({address,entry:origin+'/review.html',bundle:origin+'/s05-replacement-retest-ee1212f.zip',heading,verifiedFiles:files,wrapper,cases});
 }
 const result={packetType:'DEPLOYED_PREVIEW_BROWSER_VERIFICATION',recordedAt:new Date().toISOString(),status:'PASS_DEPLOYMENT_REPLACEMENT_FLOW_ONLY',implementationI:config.implementationI,reviewedR:config.reviewedR,buildId:config.buildId,reviewSha256:config.reviewSha256,browser:browser.version(),sameMachine:true,secondDevice:false,isolatedContexts:true,humanStorageUntouched:true,serviceStillRunning:true,scope:'Operational exact deployment identities/19 files on three origins, actual wrapper incompatibility UI, default/upgraded/matching public replacement, one Undo/Redo and new-session explicit upgrade/generation/save-reopen. Independent technical verdict remains separate.',reusedReviewedHarness:'production/tests/fixtures/s05-replacement-flows.ts',rows};
 write('result.json',result);console.log(JSON.stringify({status:result.status,browser:result.browser,rows:rows.map(r=>({address:r.address,files:r.verifiedFiles.length,cases:r.cases.map(c=>({mode:c.mode,status:c.status}))}))}));
}catch(error){write('failure.json',{recordedAt:new Date().toISOString(),status:'DEPLOYMENT_CHECK_FAILED',rows,error:String(error),stack:error.stack});throw error;}finally{await browser.close();}
