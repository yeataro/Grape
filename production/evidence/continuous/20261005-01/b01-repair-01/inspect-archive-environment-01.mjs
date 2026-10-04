import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
import {chromium} from '../../../../node_modules/playwright-core/index.mjs';
const e=path.dirname(fileURLToPath(import.meta.url)), base='http://127.0.0.1:4214';
const manifest=JSON.parse(fs.readFileSync(path.join(e,'build-01/build-manifest-01.json')));
const rows=[];
for(const r of manifest.files){const response=await fetch(base+'/'+r.file), b=Buffer.from(await response.arrayBuffer()), sha256=crypto.createHash('sha256').update(b).digest('hex');if(response.status!==200||b.length!==r.bytes||sha256!==r.sha256)throw Error('served identity '+r.file);rows.push({...r,status:response.status,servedEqual:true});}
const browser=await chromium.launch({headless:true});
try{const page=await browser.newPage();await page.goto(base);const runtime=await page.evaluate(()=>{const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl2'), ext=gl?.getExtension('WEBGL_debug_renderer_info');return {userAgent:navigator.userAgent,webgl2:!!gl,vendor:gl&&ext?gl.getParameter(ext.UNMASKED_VENDOR_WEBGL):null,renderer:gl&&ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null,devicePixelRatio}});fs.writeFileSync(path.join(e,'environment-01.json'),JSON.stringify({implementationI:manifest.implementationI,buildId:manifest.buildId,node:process.version,platform:process.platform,arch:process.arch,browser:browser.version(),runtime,servedFiles:rows,loopbackOnly:true,services:{source:{session:68866,url:'http://127.0.0.1:4213'},archive:{session:82118,pid:54604,url:base}},browserCwd:process.cwd(),physicalDeviceClaim:false,existingServices:'Untouched; disposable owned checks only',limits:['No physical touch/IME or hardware GPU claim','No native Host/TD integration','No independent review/acceptance','No named preset or whole S06 qualification']},null,2)+'\n',{flag:'wx'});}finally{await browser.close();}
