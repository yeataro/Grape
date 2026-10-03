import fs from 'node:fs';
import path from 'node:path';
import {chromium} from '../s03-review-01/production/node_modules/playwright/index.mjs';
const output = process.argv[process.argv.indexOf('--output')+1];
if(!path.isAbsolute(output)||process.env.GRAPE_EVIDENCE_DIR!==output)throw Error('REVIEW_EVIDENCE_REQUIRED');
fs.mkdirSync(output,{recursive:true});
const compilation=JSON.parse(fs.readFileSync(new URL('./nested-array-compilation.json',import.meta.url)));
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const result=await page.evaluate((artifacts)=>{
  const canvas=document.createElement('canvas'); const gl=canvas.getContext('webgl2');
  if(!gl)throw Error('WEBGL2_UNAVAILABLE');
  const debug=gl.getExtension('WEBGL_debug_renderer_info');
  const compile=(name,source,type)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);return {name,success:gl.getShaderParameter(s,gl.COMPILE_STATUS),log:gl.getShaderInfoLog(s),source};};
  return {vendor:gl.getParameter(gl.VENDOR),renderer:gl.getParameter(gl.RENDERER),unmaskedRenderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):null,version:gl.getParameter(gl.VERSION),shadingLanguageVersion:gl.getParameter(gl.SHADING_LANGUAGE_VERSION),shaders:[compile('control-fragment','#version 300 es\nprecision highp float;out vec4 color;void main(){color=vec4(1.0);}',gl.FRAGMENT_SHADER),...artifacts.map(a=>compile(a.key,a.text,a.key==='vertex'?gl.VERTEX_SHADER:gl.FRAGMENT_SHADER))]};
 },compilation.artifacts);
 const report={time:new Date().toISOString(),browser:await browser.version(),platform:process.platform,architecture:process.arch,node:process.version,output,...result};
 fs.writeFileSync(path.join(output,'shader-probe.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
}finally{await browser.close()}
