const fs=require('fs'),path=require('path'),http=require('http'),os=require('os'),crypto=require('crypto');
const root='C:/Users/user/source/Grape',base=__dirname,out=root+'/production/evidence/s05/drag-performance-01';
const {chromium}=require(root+'/production/node_modules/playwright');
const init=require('./browser-init.cjs'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const wait=ms=>new Promise(r=>setTimeout(r,Math.max(0,ms)));
const write=(n,v)=>fs.writeFileSync(out+'/'+n,JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html'};
const server=http.createServer((req,res)=>{try{const u=new URL(req.url,'http://localhost'),parts=u.pathname.split('/').filter(Boolean),variant=parts.shift();if(!['i4-archive','r5-archive','i4-instrumented-02','r5-instrumented-02'].includes(variant))throw Error('variant');const rel=parts.join('/')||'index.html',dir=base+'/'+variant+(variant.includes('instrumented')?'/dist':'');let p=path.resolve(dir,rel);if(!p.startsWith(path.resolve(dir)+path.sep))throw Error('path');let bytes=fs.readFileSync(p);if(rel==='index.html')bytes=Buffer.from(bytes.toString().replaceAll('src="/assets/','src="/'+variant+'/assets/').replaceAll('href="/assets/','href="/'+variant+'/assets/'));res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});res.end(bytes);}catch(e){res.writeHead(404);res.end('not found');}});
let browser;
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;
 browser=await chromium.launch({headless:true,args:['--enable-logging=stderr']});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});const page=await ctx.newPage();page.setDefaultTimeout(15000);await page.goto(`http://127.0.0.1:${port}/i4-archive/`);
 const environment=await page.evaluate(()=>{const gl=document.createElement('canvas').getContext('webgl2'),ext=gl?.getExtension('WEBGL_debug_renderer_info');return{userAgent:navigator.userAgent,hardwareConcurrency:navigator.hardwareConcurrency,deviceMemory:navigator.deviceMemory,dpr:devicePixelRatio,renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null,viewport:[innerWidth,innerHeight]};});
 write('environment-04.json',{...environment,browserVersion:browser.version(),node:process.version,platform:os.platform(),release:os.release(),cpus:os.cpus().map(c=>({model:c.model,speed:c.speed})),totalMemory:os.totalmem(),port,headless:true,isolatedContext:true,livePreviewsUntouched:true,htmlDeliveryWrapper:'Only absolute asset URL prefixes rewritten to isolated variant routes; JS/CSS archive bytes unchanged'});
 const fixtures=JSON.parse(fs.readFileSync(out+'/fixture-identities-01.json')).fixtures;await ctx.close();
 const cases=[];
 // Paired A/B orders alternate per repeat; all cases use the same pointer coordinates after fixture placement.
 for(const size of [4,14])for(const label of ['i4','r5'])for(let repeat=0;repeat<3;repeat++){
  for(const actor of repeat%2?['Image output','Multiply']:['Multiply','Image output'])cases.push({size,label,repeat,actor,variant:label+'-archive',mode:'off',fields:'mounted'});
  for(const fields of ['mounted','absent'])for(const actor of repeat%2?['Image output','Multiply']:['Multiply','Image output'])cases.push({size,label,repeat,actor,variant:label+'-instrumented-02',mode:'timed',fields});
 }
 for(let repeat=0;repeat<3;repeat++)for(const actor of ['Multiply','Image output'])cases.push({size:14,label:'i4',repeat,actor,variant:'i4-instrumented-02',mode:'count',fields:'mounted'});
 const completed=[];
 for(let idx=0;idx<cases.length;idx++){
  const c=cases[idx],id='run04-'+String(idx+1).padStart(3,'0')+'-'+c.label+'-'+c.size+'-'+c.actor.replace(' ','-')+'-'+c.fields+'-'+c.mode+'-'+c.repeat;
  const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});await context.addInitScript(init);const p=await context.newPage(),errors=[];p.setDefaultTimeout(15000);p.on('dialog',async d=>{console.log(JSON.stringify({setupDialog:d.type(),message:d.message()}));await d.accept();});p.on('pageerror',e=>errors.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/${c.variant}/?fields=${c.fields}`);
  await p.getByLabel('Open document file',{exact:true}).setInputFiles(out+'/'+fixtures[c.size+':'+c.actor]);
  const dialog=p.locator('#recovery');await dialog.waitFor();await p.waitForFunction(()=>!document.querySelector('#recovery-message').textContent.includes('READING_INPUT'));const admission=await dialog.innerText();if(!admission.includes('DOCUMENT_VALID'))throw Error('admission '+admission);
  await p.getByRole('button',{name:'Open in new session',exact:true}).click();await dialog.waitFor({state:'hidden'});
  const target=p.locator('.node h3').filter({hasText:new RegExp('^'+c.actor+'$','i')});await target.click();
  await p.waitForTimeout(180);const bounds=await target.boundingBox(),x=bounds.x+35,y=bounds.y+8;
  const inspectorFields=await p.locator('#inspector [data-field]').count();if((c.fields==='absent'&&inspectorFields!==0)||(c.fields==='mounted'&&c.actor==='Multiply'&&inspectorFields!==2))throw Error('fields '+inspectorFields);
  const cdp=await context.newCDPSession(p);const trace=c.size===14&&c.label==='i4'&&c.repeat===0&&c.mode==='timed';
  if(trace)await cdp.send('Tracing.start',{categories:'devtools.timeline,v8.execute,blink.user_timing',transferMode:'ReturnAsStream'});
  await p.mouse.move(x,y);await p.mouse.down();await p.waitForTimeout(50);
  const started=await p.evaluate(m=>globalThis.__diagnostic.start(m),c.mode),sent=[],wall=performance.now();
  for(let i=1;i<=60;i++){const due=wall+i*1000/60;await wait(due-performance.now());const delta=60*Math.sin(i*Math.PI/60);const t=performance.now();await p.mouse.move(x+delta,y+delta/3);sent.push({i,start:t-wall,end:performance.now()-wall,x:x+delta,y:y+delta/3});}
  const result=await p.evaluate(()=>globalThis.__diagnostic.stop());await p.mouse.up();await p.waitForTimeout(100);
  if(trace){const done=new Promise(r=>cdp.once('Tracing.tracingComplete',r));await cdp.send('Tracing.end');const event=await done;let data='';for(;;){const chunk=await cdp.send('IO.read',{handle:event.stream});data+=chunk.data;if(chunk.eof)break;}await cdp.send('IO.close',{handle:event.stream});fs.writeFileSync(out+'/'+id+'.trace.json',data,{flag:'wx'});}
  const after={nodeCount:await p.locator('.node').count(),selected:await p.locator('.node.selected h3').allTextContents(),undoEnabled:await p.getByRole('button',{name:'Undo',exact:true}).isEnabled(),message:await p.locator('#message').innerText(),fields:await p.locator('#inspector [data-field]').count()};
  if(c.repeat===0&&c.size===14&&c.mode==='timed')await p.screenshot({path:out+'/'+id+'.png',fullPage:true});
  const resultFile=id+'.json';write(resultFile,{...c,id,fixture:fixtures[c.size+':'+c.actor],inspectorFields,bounds,pathStart:[x,y],steps:60,intendedDurationMs:1000,started,...result,sent,after,errors,trace:trace?id+'.trace.json':null});
  completed.push(resultFile);console.log(JSON.stringify({id,frames:result.frames.length,elapsed:result.ended-started,captures:result.stats['Graph.capture']?.count,fields:inspectorFields,errors}));await context.close();
 }
 write('execution-04.json',{status:'COMPLETE',cases:completed.length,files:completed,completedAt:new Date().toISOString()});
})().catch(e=>{console.error(e);const n='measurement-error-'+Date.now()+'.json';write(n,{error:String(e),stack:e.stack,when:new Date().toISOString()});process.exitCode=1;}).finally(async()=>{await browser?.close();await new Promise(r=>server.close(r));});
