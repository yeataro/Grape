import fs from 'node:fs';
import { chromium } from '../../production/node_modules/@playwright/test/index.mjs';
const dir='.verification/s05-fresh-review-01/browser-adversarial-01';fs.mkdirSync(dir);
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const results={browser:browser.version(),platform:process.platform,arch:process.arch,node:process.version,probes:[]};
 for(const [name,tf] of [['cross-stage-uniform-01',true],['mixed-nesting-01',false]]){
  const input=JSON.parse(fs.readFileSync('.verification/s05-fresh-review-01/'+name+'.json'));
  const actual=await page.evaluate(({out,tf})=>{
    const c=document.createElement('canvas');c.width=c.height=1;document.body.append(c);const gl=c.getContext('webgl2',{preserveDrawingBuffer:true,antialias:false});if(!gl)throw Error('NO_WEBGL2');
    const program=gl.createProgram(),shaders=[];
    for(const a of out.artifacts){const sh=gl.createShader(a.key==='vertex'?gl.VERTEX_SHADER:gl.FRAGMENT_SHADER);gl.shaderSource(sh,a.text);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));gl.attachShader(program,sh);shaders.push(sh);}
    if(tf)gl.transformFeedbackVaryings(program,['gl_Position'],gl.INTERLEAVED_ATTRIBS);
    gl.linkProgram(program);const linked=gl.getProgramParameter(program,gl.LINK_STATUS);if(!linked)throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
    const active=Array.from({length:gl.getProgramParameter(program,gl.ACTIVE_UNIFORMS)},(_,i)=>{const a=gl.getActiveUniform(program,i);return {name:a.name,size:a.size,type:a.type};});
    const assigned=[];for(const b of out.bindingSchema){const loc=gl.getUniformLocation(program,b.symbol);gl.uniform1f(loc,b.defaultValue);assigned.push({resourceId:b.resourceId,symbol:b.symbol,value:b.defaultValue});}
    const observedBindings=out.bindingSchema.map(b=>({resourceId:b.resourceId,symbol:b.symbol,actual:gl.getUniform(program,gl.getUniformLocation(program,b.symbol))}));
    const vertexBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    let position=null,pixels=null;
    if(tf){const t=gl.createTransformFeedback();gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK,t);const b=gl.createBuffer();gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER,b);gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER,16,gl.STREAM_READ);gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER,0,b);gl.enable(gl.RASTERIZER_DISCARD);gl.beginTransformFeedback(gl.POINTS);gl.drawArrays(gl.POINTS,0,1);gl.endTransformFeedback();gl.disable(gl.RASTERIZER_DISCARD);const p=new Float32Array(4);gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER,0,p);position=[...p];gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER,0,null);gl.deleteBuffer(b);gl.deleteTransformFeedback(t);}
    else{gl.viewport(0,0,1,1);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);const p=new Uint8Array(4);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,p);pixels=[...p];}
    const ext=gl.getExtension('WEBGL_debug_renderer_info');const result={linked,activeUniforms:active,assigned,observedBindings,position,pixels,error:gl.getError(),version:gl.getParameter(gl.VERSION),renderer:gl.getParameter(gl.RENDERER),unmaskedRenderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null};
    shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);gl.deleteBuffer(vertexBuffer);gl.getExtension('WEBGL_lose_context')?.loseContext();return result;
  },{out:input.generated,tf});
  results.probes.push({name,expected:tf?{activeUniformCount:2,vertexPosition:[0.25,0.25,0.25,0.25],pixelUniform:0.75}:{pixels:input.expectedPixels},actual});
 }
 fs.writeFileSync(dir+'/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));await page.close();
}finally{await browser.close();}
