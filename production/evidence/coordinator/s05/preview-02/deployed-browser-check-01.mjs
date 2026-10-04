import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium} from '../production/node_modules/@playwright/test/index.mjs';

const config = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const output = path.resolve(process.argv[3]);
const allowed = path.resolve('production/evidence/coordinator/s05/preview-02') + path.sep;
assert.ok(output.startsWith(allowed));
assert.equal(fs.existsSync(output), false);
fs.mkdirSync(output);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const browser = await chromium.launch();
const rows = [];
try {
  for (const address of config.addresses) {
    const origin = `http://${address}:${config.port}`;
    const context = await browser.newContext({viewport:{width:1440,height:1000}});
    try {
      const page = await context.newPage();
      const errors = [];
      page.on('dialog', dialog => dialog.accept());
      page.on('pageerror', error => errors.push(error.message));
      const deliveryResponse = await page.request.get(origin + '/_delivery.json');
      assert.equal(deliveryResponse.status(), 200);
      const identity = await deliveryResponse.json();
      for (const key of ['sliceId','buildId','implementationI','reviewedR','reviewSha256','buildManifestSha256']) assert.equal(identity[key], config[key]);
      const verified = [];
      for (const row of identity.files) {
        const response = await page.request.get(origin + '/' + row.file);
        const bytes = await response.body();
        assert.equal(response.status(), 200);
        assert.equal(bytes.length, row.bytes);
        assert.equal(hash(bytes), row.sha256);
        verified.push({file:row.file,sha256:row.sha256});
      }
      const sample = async name => {
        const response = await page.request.get(origin + '/samples/' + name);
        assert.equal(response.status(), 200);
        return {name,mimeType:'application/json',buffer:await response.body()};
      };
      await page.goto(origin + '/review.html');
      const heading = await page.getByLabel('目前部署版本').textContent();
      assert.ok(heading.includes(config.sliceId) && heading.includes(config.buildId) && heading.includes(config.reviewedR.slice(0,7)));
      const app = page.frameLocator('iframe');
      await app.getByLabel('Open document file').setInputFiles(await sample('shared-function.grape.json'));
      await app.getByRole('button',{name:'Open in new session',exact:true}).click();
      await app.getByRole('button',{name:'Generate GLSL',exact:true}).click();
      assert.match(await app.getByLabel('Generated GLSL').textContent(),/void grape_function_0/);
      const canvas = app.locator('.canvas').first();
      await canvas.getByRole('heading',{name:'Shared arithmetic',exact:true}).first().click();
      await canvas.getByRole('button',{name:'Enter subgraph',exact:true}).click();
      await canvas.getByText('Subgraph interface',{exact:true}).click();
      assert.equal(await canvas.getByLabel('Subgraph emission mode').inputValue(),'function');
      await canvas.getByRole('button',{name:'Add interface port',exact:true}).click();
      await canvas.getByRole('button',{name:'Apply interface',exact:true}).click();
      await app.getByRole('button',{name:'Personal Library',exact:true}).click();
      await app.getByLabel('Import Personal package').setInputFiles(await sample('shared-function.personal.json'));
      await app.locator('[data-personal-file]').waitFor();
      assert.equal(await app.locator('[data-personal-file]').count(),1);
      await app.getByRole('button',{name:'Insert Shared arithmetic',exact:true}).click();
      await app.getByRole('button',{name:'Save',exact:true}).click();
      await app.locator('#save-state').filter({hasText:'Saved'}).waitFor();
      await page.reload();
      await app.getByRole('button',{name:'Open saved',exact:true}).click();
      await app.locator('#saved-list button').first().click();
      await app.getByRole('button',{name:'Generate GLSL',exact:true}).click();
      assert.match(await app.getByLabel('Generated GLSL').textContent(),/void grape_function_/);
      const facts = await app.locator('body').evaluate(() => ({secure:isSecureContext,subtle:typeof crypto.subtle,uuid:typeof crypto.randomUUID,entropy:typeof crypto.getRandomValues}));
      if (address !== '127.0.0.1') {assert.equal(facts.secure,false);assert.equal(facts.subtle,'undefined');}
      assert.equal(facts.entropy,'function');
      assert.deepEqual(errors,[]);
      await page.screenshot({path:path.join(output,'deployed-'+address+'.png'),fullPage:true});
      rows.push({address,url:origin+'/review.html',visibleIdentity:heading,...facts,servedFiles:verified,loadedSample:true,functionGeneration:true,interfaceIdentityOperation:true,personalImportInsert:true,saveReloadGeneration:true,pageErrors:errors});
    } finally { await context.close(); }
  }
  const result = {packetType:'DEPLOYED_PREVIEW_BROWSER_VERIFICATION',recordedAt:new Date().toISOString(),status:'PASS_DEPLOYMENT_SMOKE_ONLY',implementationI:config.implementationI,reviewedR:config.reviewedR,buildId:config.buildId,reviewSha256:config.reviewSha256,browser:browser.version(),sameMachine:true,secondDevice:false,isolatedContexts:true,humanStorageUntouched:true,serviceStillRunning:true,rows};
  fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify(result));
} catch (error) {
  fs.writeFileSync(path.join(output,'failure.json'),JSON.stringify({status:'FAILED_DEPLOYMENT_SMOKE',recordedAt:new Date().toISOString(),rows,error:String(error),stack:error.stack},null,2)+'\n',{flag:'wx'});
  throw error;
} finally { await browser.close(); }
