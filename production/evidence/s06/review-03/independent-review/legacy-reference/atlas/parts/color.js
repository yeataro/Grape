/* Independent atlas demonstration of the accepted 0.8.273 editing policy.
 * Local model values below are explanatory stand-ins: no TD, CAS, receipt,
 * History, persistence or product-source import exists in this fragment.
 */
(() => {
  const root=document.getElementById('grape-compact-color');
  if(!root||root.dataset.colorInitialized)return;root.dataset.colorInitialized='true';
  const q=s=>root.querySelector(s), qa=s=>[...root.querySelectorAll(s)];
  const canvas=q('canvas'), ctx=canvas.getContext('2d'), surface=q('.gcp-surface'), preview=q('.gcp-preview'), hex=q('.gcp-hex');
  const channels=qa('.gcp-channel').map(e=>({label:e.querySelector('span'),range:e.querySelector('[type=range]'),number:e.querySelector('[type=number]')}));
  // Row-major samples from the owner's TD screenshot; visual reference, not TD float metadata.
  const preset=[
    '#FF0000','#FF8B00','#E9FF00','#5DFF00','#00FF2D','#00FFB9','#00BBFF','#002FFF','#5B00FF','#E700FF','#FF008D',
    '#FF7F80','#FFC57F','#F4FF7F','#AEFF7F','#7FFF96','#7FFFDC','#7FDDFF','#7F97FF','#AD7FFF','#F37FFF','#FF7FC6',
    '#7F0000','#7F4500','#747F00','#2E7F00','#007F16','#007F5C','#005D7F','#00177F','#2D007F','#73007F','#7F0046',
    '#000000','#191919','#333333','#4C4C4C','#666666','#7F7F7F','#999999','#B2B2B2','#CCCCCC','#E5E5E5','#FFFFFF'
  ];
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const hsvRGB=(h,s,v)=>{h=((h%360)+360)%360/60;let c=v*s,x=c*(1-Math.abs(h%2-1)),m=v-c;return (h<1?[c,x,0]:h<2?[x,c,0]:h<3?[0,c,x]:h<4?[0,x,c]:h<5?[x,0,c]:[c,0,x]).map(n=>n+m);};
  const rgbHSV=(r,g,b,old)=>{const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=old.h;if(d>1e-9)h=((max===r?(g-b)/d:max===g?(b-r)/d+2:(r-g)/d+4)*60+360)%360;return {h,s:max===0?old.s:d/max,v:max};};
  let state={h:261.5625,s:128/255,v:1,a:225/255,type:'RGBA',shape:'square',planeOpen:false,saved:['#AD7FFFE1','#5FB893E1','#AFB893E1','#AF5293E1','#910165E1','#914479E1']};
  const models={RGB:[173/255,127/255,1],RGBA:[173/255,127/255,1,225/255]};
  let mode='constant',opened=true,opening=models.RGBA.slice(),draft=opening.slice(),modelWrites=0;
  const panel=q('.gcp-window'),modelOutput=document.querySelector('[data-color-model]'),result=document.querySelector('[data-color-result]');
  const same=(a,b)=>a.length===b.length&&a.every((n,i)=>Object.is(n,b[i]));
  let invalid=null,drag=null,dragBasis=null,lastPlane='';
  let planePixels=null;
  const design={width:320};
  const css=(c,a=1)=>`rgba(${c.map(n=>Math.round(clamp(n)*255)).join(',')},${clamp(a)})`;
  const effectiveAlpha=()=>state.type==='RGBA'?draft[3]:1;
  const hexOf=value=>'#'+value.map(v=>Math.round(clamp(v)*255).toString(16).padStart(2,'0')).join('').toUpperCase();
  const toHex=()=>hexOf(draft);
  function project(){Object.assign(state,rgbHSV(...draft.slice(0,3).map(n=>clamp(n)),state));state.a=state.type==='RGBA'?draft[3]:1;}
  function modelView(){
    modelOutput.textContent=hexOf(models[state.type]);modelOutput.setAttribute('data-value',JSON.stringify(models[state.type]));
    modelOutput.setAttribute('data-writes',String(modelWrites));
    document.querySelector('.color-demo-model-swatch').style.background=css(models[state.type].slice(0,3),models[state.type][3]??1);
    panel.hidden=!opened;q('.color-demo-closed').hidden=opened;
    q('.gcp-apply').hidden=mode==='live';
    document.querySelectorAll('[data-color-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.colorMode===mode)));
  }
  function writeModel(value){if(!same(models[state.type],value)){models[state.type]=value.slice();modelWrites++;}modelView();}
  function changed(preserve){if(mode==='live')writeModel(draft);render(preserve);}
  function setRGB(rgb,preserve,alpha,keepHSV=false){draft=rgb.slice(0,3);if(state.type==='RGBA')draft.push(alpha===undefined?state.a:alpha);if(!keepHSV)project();else state.a=effectiveAlpha();changed(preserve);}
  function openSession(){
    if(opened)finish(mode==='live');
    opened=true;opening=models[state.type].slice();draft=opening.slice();project();clearInvalid();render();modelView();
    result.textContent=mode==='live'?'Uniform 本地即時：點外面接受；×／Escape 還原開啟值。':'常數草稿：Apply 才改模型值。';
  }
  function finish(accept){
    if(!opened||accept&&mode==='constant'&&invalid)return false;
    endDrag(false);
    if(mode==='live'){if(!accept)writeModel(opening);}else if(accept)writeModel(draft);
    opened=false;draft=models[state.type].slice();project();clearInvalid();render();modelView();
    result.textContent=accept?(mode==='live'?'已接受本地即時值。':'已套用常數草稿。'):(mode==='live'?'已還原面板開啟前的本地值。':'已取消常數草稿；模型值未變。');
    return true;
  }
  function announce(){q('.gcp-status').textContent=state.type+' '+toHex();}
  let W=canvas.width,H=canvas.height,A,B,C,R;
  function geometry(){const th=Math.min(H-24,(W-24)*Math.sqrt(3)/2),top=(H-th)/2,bottom=top+th;A={x:W/2,y:top};B={x:W/2-th/Math.sqrt(3),y:bottom};C={x:W/2+th/Math.sqrt(3),y:bottom};R=Math.min(W,H)/2-10;}
  geometry();
  function bary(x,y){const a=(B.y-y)/(B.y-A.y),c=(x-A.x*a-B.x*(1-a))/(C.x-B.x);return [a,1-a-c,c];}
  function draw(){
    if(!opened||!state.planeOpen)return;
    const bounds=surface.getBoundingClientRect();
    if(bounds.width>0&&bounds.height>0){const w=Math.round(bounds.width*2),h=Math.round(bounds.height*2);if(w!==W||h!==H){W=w;H=h;canvas.width=W;canvas.height=H;geometry();lastPlane='';}}
    const key=state.shape+':'+W+':'+H+':'+(state.shape==='circle'?state.v:state.h);
    if(key!==lastPlane){const image=ctx.createImageData(W,H),data=image.data;for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      let rgb,inside=true;
      if(state.shape==='square')rgb=hsvRGB(state.h,x/(W-1),1-y/(H-1));
      else if(state.shape==='circle'){const dx=x-W/2,dy=y-H/2,r=Math.hypot(dx,dy)/R;inside=r<=1;rgb=hsvRGB((Math.atan2(dy,dx)*180/Math.PI+360)%360,Math.min(1,r),state.v);}
      else{const w=bary(x,y);inside=w.every(n=>n>=0);const pure=hsvRGB(state.h,1,1);rgb=pure.map(c=>w[0]*c+w[2]);}
      if(inside){const i=(y*W+x)*4;data[i]=clamp(rgb[0])*255;data[i+1]=clamp(rgb[1])*255;data[i+2]=clamp(rgb[2])*255;data[i+3]=255;}
    }planePixels=image;lastPlane=key;}
    ctx.putImageData(planePixels,0,0);let x,y;
    if(state.shape==='square'){x=state.s*(W-1);y=(1-state.v)*(H-1);}
    else if(state.shape==='circle'){x=W/2+Math.cos(state.h*Math.PI/180)*state.s*R;y=H/2+Math.sin(state.h*Math.PI/180)*state.s*R;}
    else{const a=state.v*state.s,b=1-state.v,c=state.v*(1-state.s);x=a*A.x+b*B.x+c*C.x;y=a*A.y+b*B.y+c*C.y;}
    ctx.beginPath();ctx.arc(clamp(x,7,W-7),clamp(y,7,H-7),7,0,Math.PI*2);ctx.strokeStyle='#16121b';ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle='#f9f4ff';ctx.lineWidth=2.5;ctx.stroke();
  }
  function palette(container,colors){container.replaceChildren();colors.forEach((color,i)=>{const button=document.createElement('button');button.type='button';button.className='gcp-swatch cursor-interaction';button.setAttribute('aria-label',`色票 ${color}`);button.setAttribute('title',color);button.dataset.color=color;button.style.setProperty('--gcp-swatch',color);button.append(document.createElement('span'));button.addEventListener('click',()=>{if(!opened||invalid)return;fromHex(color);announce();});container.append(button);});}
  function fromHex(value,preserve){const rgb=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)/255);setRGB(rgb,preserve,state.type==='RGBA'&&value.length===9?parseInt(value.slice(7,9),16)/255:undefined);}
  function render(preserve){
    q('.gcp-window').style.width=design.width+'px';
    q('#gcp-optional-plane').hidden=!state.planeOpen;q('.gcp-top').hidden=state.planeOpen;qa('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.view==='plane')===state.planeOpen)));
    q('.gcp-alpha-row').hidden=state.type!=='RGBA';
    hex.setAttribute('aria-label',state.type==='RGBA'?'HEX：六位保留 Alpha，八位包含 Alpha':'HEX：RGB 六位色碼');
    hex.setAttribute('title',state.type==='RGBA'?'#RRGGBB / #RRGGBBAA':'#RRGGBB');
    const rgb=draft.slice(0,3),names=['H','S','V','R','G','B','A'],values=[state.h,state.s,state.v,...rgb,state.a];
    const current=css(rgb,effectiveAlpha());preview.style.background=current;preview.setAttribute('aria-label','目前顏色 '+toHex());
    const bg=rgb.map(c=>c*effectiveAlpha()+.36*(1-effectiveAlpha()));preview.style.color=(bg[0]*.2126+bg[1]*.7152+bg[2]*.0722)>.56?'#171420':'#fff';
    if(hex!==preserve)hex.value=toHex();
    qa('[data-shape]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.shape===state.shape)));
    channels.forEach((c,i)=>{c.label.textContent=names[i];const max=i===0?360:1,step=max===360?.1:.001;for(const input of [c.range,c.number]){input.max=max;input.step=step;input.setAttribute('aria-label',names[i]+(max===360?' degrees 0–360':i>=3&&i<=5?' normalized / HDR':' 0–1'));if(input===c.number&&i>=3&&i<=5){input.removeAttribute('min');input.removeAttribute('max');}if(input!==preserve)input.value=input===c.range?clamp(values[i],0,max):Number(values[i].toFixed(max===360?1:7));}});
      channels[0].range.style.background='linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)';
      channels[1].range.style.background=`linear-gradient(90deg,${css(hsvRGB(state.h,0,state.v))},${css(hsvRGB(state.h,1,state.v))})`;
      channels[2].range.style.background=`linear-gradient(90deg,#000,${css(hsvRGB(state.h,state.s,1))})`;
    for(let i=0;i<3;i++){let a=[...rgb],b=[...rgb];a[i]=0;b[i]=1;channels[i+3].range.style.background=`linear-gradient(90deg,${css(a)},${css(b)})`;}
    channels[6].range.style.background=`linear-gradient(90deg,${css(rgb,0)},${css(rgb)}),repeating-conic-gradient(#74717b 0% 25%,#45424c 0% 50%) 0/8px 8px`;
    qa('.gcp-swatch').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color.toUpperCase()===toHex())));
    surface.setAttribute('aria-label',state.shape==='circle'?'色相飽和度圓盤；左右鍵調色相，上下鍵調飽和度':'飽和度明度色面；左右鍵調飽和度，上下鍵調明度');draw();
  }
  function clearInvalid(){invalid=null;qa('input').forEach(i=>{i.removeAttribute('aria-invalid');i.disabled=false;});qa('button').forEach(b=>b.disabled=false);}
  function fail(input){endDrag(false);invalid=input;input.setAttribute('aria-invalid','true');qa('input').forEach(i=>i.disabled=i!==input);qa('button').forEach(b=>b.disabled=b!==q('.gcp-close'));q('.gcp-status').textContent='請修正數值；Escape 取消整個面板工作階段。';}
  channels.forEach((c,i)=>[c.range,c.number].forEach(input=>input.addEventListener('input',()=>{
    if(!opened||invalid&&invalid!==input)return;const n=Number(input.value),bounded=i<3||i===6;if(input.value.trim()===''||!Number.isFinite(n)||bounded&&(n<0||n>(i===0?360:1))){fail(input);return;}clearInvalid();
    if(i===6){if(state.type!=='RGBA'){render();return;}state.a=n;draft[3]=n;changed(input);}else if(i<3){state[['h','s','v'][i]]=n;setRGB(hsvRGB(state.h,state.s,state.v),input,undefined,true);}else{draft[i-3]=n;project();changed(input);}
  })));
  qa('input').forEach(input=>{input.addEventListener('change',()=>{if(opened&&!invalid){render();announce();}});input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();event.stopPropagation();if(opened&&!invalid){render();announce();}}});});
  hex.addEventListener('input',()=>{if(!opened||invalid&&invalid!==hex)return;const pattern=state.type==='RGBA'?/^#[\da-f]{6}([\da-f]{2})?$/i:/^#[\da-f]{6}$/i;if(!pattern.test(hex.value)){fail(hex);return;}clearInvalid();fromHex(hex.value,hex);});
  qa('[data-shape]').forEach(b=>b.addEventListener('click',()=>{if(!opened||invalid)return;endDrag(true);state.shape=b.dataset.shape;render();announce();}));
  qa('[data-view]').forEach(b=>b.addEventListener('click',()=>{if(!opened||invalid)return;endDrag(true);state.planeOpen=b.dataset.view==='plane';render();announce();}));
  q('.gcp-eyedropper').addEventListener('click',()=>{if(opened&&!invalid)q('.gcp-notice').hidden=false;});
  function selectPoint(event,initial=false){const r=surface.getBoundingClientRect(),x=(event.clientX-r.left)/r.width*W,y=(event.clientY-r.top)/r.height*H;
    if(state.shape==='square'){state.s=clamp(x/W);state.v=clamp(1-y/H);}
    else if(state.shape==='circle'){const dx=x-W/2,dy=y-H/2,d=Math.hypot(dx,dy)/R;if(initial&&d>1)return false;if(d>.0001)state.h=(Math.atan2(dy,dx)*180/Math.PI+360)%360;state.s=clamp(d);}
    else{let weights=bary(x,y);if(initial&&weights.some(n=>n<0))return false;weights=weights.map(n=>Math.max(0,n));const sum=weights.reduce((a,b)=>a+b,0);weights=weights.map(n=>n/sum);state.v=weights[0]+weights[2];if(state.v>0)state.s=weights[0]/state.v;}
    setRGB(hsvRGB(state.h,state.s,state.v),null,undefined,true);return true;
  }
  surface.addEventListener('pointerdown',e=>{if(!opened||invalid||!state.planeOpen||e.button!==0||drag!==null)return;dragBasis={draft:draft.slice(),h:state.h,s:state.s,v:state.v};if(!selectPoint(e,true)){dragBasis=null;return;}e.preventDefault();surface.focus();drag=e.pointerId;surface.setPointerCapture(drag);});
  surface.addEventListener('pointermove',e=>{if(drag===e.pointerId&&!invalid)selectPoint(e);});
  function endDrag(cancel){if(drag===null)return;const id=drag;drag=null;if(cancel&&dragBasis){draft=dragBasis.draft.slice();Object.assign(state,{h:dragBasis.h,s:dragBasis.s,v:dragBasis.v,a:draft[3]??1});changed();}dragBasis=null;if(surface.hasPointerCapture(id))surface.releasePointerCapture(id);if(!cancel)announce();}
  surface.addEventListener('pointerup',e=>{if(drag!==e.pointerId||invalid)return;selectPoint(e);endDrag(false);});surface.addEventListener('pointercancel',e=>{if(drag===e.pointerId)endDrag(true);});surface.addEventListener('lostpointercapture',e=>{if(drag===e.pointerId)endDrag(true);});
  surface.addEventListener('keydown',e=>{if(!opened||invalid)return;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const dx=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0,dy=e.key==='ArrowUp'?1:e.key==='ArrowDown'?-1:0;if(state.shape==='circle'){state.h=(state.h+dx*2+360)%360;state.s=clamp(state.s+dy*.01);}else{state.s=clamp(state.s+dx*.01);state.v=clamp(state.v+dy*.01);}setRGB(hsvRGB(state.h,state.s,state.v),null,undefined,true);announce();});
  q('.gcp-add').addEventListener('click',()=>{if(!opened||invalid)return;const color=toHex();state.saved=[color,...state.saved.filter(c=>c!==color)].slice(0,6);palette(q('.gcp-saved'),state.saved);q('.gcp-saved').hidden=false;render();announce();q('.gcp-status').textContent='已加入色票 '+color;});
  const targets=[...document.querySelectorAll('[data-color-target]')];
  targets.forEach(button=>button.addEventListener('click',()=>{endDrag(true);finish(mode==='live');state.type=button.dataset.colorTarget;targets.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));openSession();announce();}));
  document.querySelectorAll('[data-color-mode]').forEach(button=>button.addEventListener('click',()=>{endDrag(true);finish(mode==='live');mode=button.dataset.colorMode;openSession();}));
  document.querySelector('[data-color-open]').addEventListener('click',openSession);
  q('.gcp-apply').addEventListener('click',()=>{if(mode==='constant')finish(true);});
  q('.gcp-close').addEventListener('click',()=>finish(false));
  panel.addEventListener('keydown',event=>{event.stopPropagation();if(event.key==='Escape'){event.preventDefault();finish(false);}});
  document.addEventListener('pointerdown',event=>{if(opened&&!panel.contains(event.target))finish(mode==='live');});
  hex.addEventListener('blur',()=>{if(opened&&!invalid)render();});
  palette(q('.gcp-swatches'),preset);palette(q('.gcp-saved'),state.saved);q('.gcp-saved').hidden=state.saved.length===0;project();render();modelView();
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>draw()).observe(surface);
})();
