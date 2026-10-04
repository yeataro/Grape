import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {chromium} from '../../../../node_modules/playwright-core/index.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const evidence=path.join(root,'archive-visual-01');fs.mkdirSync(evidence,{recursive:true});
const base='http://127.0.0.1:4214', I='0f4ea44d5bdb69866f271ebfbadea2ceac2523ec', build='S06-debug-0f4ea44';
const hash=b=>createHash('sha256').update(b).digest('hex');
const browser=await chromium.launch({headless:true});const rows=[];
try {for(const wrapped of [false,true])for(const width of [1440,620]){
 const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+(wrapped?'/review.html':'/'));const a=wrapped?page.frameLocator('iframe'):page;
 await a.locator('.build-identity').waitFor();if(await a.locator('.build-identity').textContent()!==build)throw Error('build identity');
 const action=async name=>{const b=a.getByRole('button',{name,exact:true}).or(a.getByRole('menuitem',{name,exact:true}));if(!await b.isVisible())await a.getByRole('button',{name:'Project actions',exact:true}).click();await b.click();};
 const download=async name=>{const pending=page.waitForEvent('download');await action(name);return fs.readFileSync(await(await pending).path());};
 const canvas=a.locator('.canvas').first();await canvas.getByRole('button',{name:'Add Node',exact:true}).click();const catalog=canvas.getByRole('dialog',{name:'Node catalog'});await catalog.getByLabel('Search nodes',{exact:true}).fill('Float');await catalog.getByLabel('Node source',{exact:true}).selectOption('grape.nodes.basic');await catalog.getByRole('button',{name:'Add Float',exact:true}).click();await canvas.click({position:{x:60,y:140}});
 await action('Second Canvas');await action('Add Parameters');await a.locator('#canvas-1 .node h3').filter({hasText:'Float'}).click();
 const model=await download('Export JSON'),layout=await download('Export current layout');
 await action('Save current layout');await action('Restore current layout');
 if(JSON.stringify(JSON.parse(await download('Export JSON')))!==JSON.stringify(JSON.parse(model)))throw Error('layout mutated document');
 await action('Generate GLSL');await a.getByRole('button',{name:'Shader output',exact:true}).click();if(!await a.getByLabel('Generated GLSL').textContent())throw Error('generation empty');await a.getByRole('button',{name:'Close shader output',exact:true}).click();
 const key=(wrapped?'wrapped':'direct')+'-'+width;await page.screenshot({path:path.join(evidence,key+'.png'),fullPage:true});
 const metadata=await (await page.request.get(base+'/_delivery.json')).json();if(metadata.implementationI!==I||metadata.buildId!==build)throw Error('delivery identity');
 rows.push({key,browser:browser.version(),viewport:{width,height:1000},canvasCount:await a.locator('.canvas').count(),modelSha256:hash(model),layoutSha256:hash(layout),unchanged:true,errors});if(errors.length)throw Error(errors.join());
 if(!wrapped&&width===1440){fs.mkdirSync(path.join(root,'samples'),{recursive:true});fs.writeFileSync(path.join(root,'samples','workspace.grape.json'),model);fs.writeFileSync(path.join(root,'samples','current-layout.json'),layout);}
 await context.close();
}}finally{await browser.close();fs.writeFileSync(path.join(evidence,'result-01.json'),JSON.stringify({implementationI:I,build,rows,physicalDeviceClaim:false},null,2)+'\n');}
