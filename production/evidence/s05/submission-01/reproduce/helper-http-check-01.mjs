import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {chromium} from '../production/node_modules/playwright/index.mjs';
import {prepareReviewedPreview,listenPreview} from '../production/evidence/coordinator/s05/preview-preparation-01/serve-reviewed-preview-01.mjs';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const temporary='.verification/s05-helper-http-01';
if(fs.existsSync(temporary))throw Error('FRESH_HELPER_TEST_REQUIRED');
fs.mkdirSync(temporary,{recursive:true});
execFileSync('tar',['-xzf','production/evidence/s04/submission-01/candidate-web-01.tar.gz','-C',temporary]);
const report='production/evidence/s04/review-01/independent-review/INDEPENDENT_REVIEW_RESULT.json';
const manifest='production/evidence/s04/submission-01/build-manifest-01.json';
const prepared=prepareReviewedPreview({sliceId:'S04',buildId:'S04-accepted-helper-HTTP-check',implementationI:'0c13932150bf1b78f215e25721292962e6c4263a',reviewedR:'985357be67cce2f2ecc232e827e83e5cdbb521ab',reviewReport:report,reviewSha256:hash(fs.readFileSync(report)),buildManifest:manifest,buildManifestSha256:hash(fs.readFileSync(manifest)),previewRoot:temporary});
const service=await listenPreview(prepared,['127.0.0.1','192.168.1.105','100.83.88.97'],0);
const browser=await chromium.launch();
const rows=[];
try{
  for(const url of service.urls){
    const context=await browser.newContext();
    try {
      const page=await context.newPage();
      const response=await page.goto(url);
      assert.equal(response.status(),200);
      assert.match(await page.locator('header').innerText(),/S04-accepted-helper-HTTP-check/);
      assert.match(await page.locator('header').innerText(),/985357b/);
      const facts=await page.evaluate(()=>({secure:isSecureContext,subtle:typeof crypto.subtle,uuid:typeof crypto.randomUUID,entropy:typeof crypto.getRandomValues}));
      if(!url.includes('127.0.0.1')){assert.equal(facts.secure,false);assert.equal(facts.subtle,'undefined');}
      const identity=await (await page.request.get(new URL('/_delivery.json',url).href)).json();
      assert.equal(identity.reviewedR,'985357be67cce2f2ecc232e827e83e5cdbb521ab');
      for(const f of identity.files){const res=await page.request.get(new URL('/'+f.file,url).href);assert.equal(hash(await res.body()),f.sha256);}
      rows.push({url,...facts,header:await page.locator('header').innerText(),identityAndAllAssetHashesMatched:true});
    }finally{await context.close();}
  }
}finally{await browser.close();await service.close();}
const result={recordedAt:new Date().toISOString(),status:'PASS_HELPER_ONLY',helperSha256:hash(fs.readFileSync('production/evidence/coordinator/s05/preview-preparation-01/serve-reviewed-preview-01.mjs')),fixture:'Exact already accepted S04 I/R/report/archive on isolated byte copy. Verifies deployment wrapper HTTP identity only; does not qualify S04 on new origins or assert S05 technical PASS/deployment.',browser:'Chromium',sameMachine:true,secondDevice:false,temporaryListenersClosed:true,humanPreviewPortsUntouched:[4174,4192],rows};
fs.writeFileSync('production/evidence/s05/submission-01/helper-http-01.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(result,null,2));
