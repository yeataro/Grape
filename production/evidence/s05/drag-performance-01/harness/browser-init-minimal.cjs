module.exports=function(){
 let active=false,mode='off',stack=[],stats={},frames=[],events=[],longtasks=[];
 const count=n=>{if(active){(stats[n]??={count:0,inclusive:0,self:0}).count++;}};
 const enter=n=>{
   if(!active||mode==='off')return;
   const s=stats[n]??={count:0,inclusive:0,self:0};s.count++;
   if(mode==='count')return;
   const t=performance.now(),entry={child:0};stack.push(entry);
   return()=>{const d=performance.now()-t;stack.pop();s.inclusive+=d;s.self+=d-entry.child;if(stack.length)stack.at(-1).child+=d;};
 };
 globalThis.__perfEnter=enter;globalThis.__perfCount=count;
 const wrap=(obj,key,name)=>{const old=obj[key];obj[key]=function(...args){const stop=enter(name);try{return Reflect.apply(old,this,args);}finally{stop?.();}};};
 let raf;const frame=t=>{if(active)frames.push(t);raf=requestAnimationFrame(frame)};raf=requestAnimationFrame(frame);
 for(const type of ['pointerdown','pointermove','pointerup'])document.addEventListener(type,e=>{if(active)events.push({type,t:performance.now(),x:e.clientX,y:e.clientY,buttons:e.buttons});},true);
 new PerformanceObserver(list=>{if(active)for(const e of list.getEntries())longtasks.push({start:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:false});
 globalThis.__diagnostic={start(m){stats={};frames=[];events=[];longtasks=[];stack=[];mode=m;active=true;return performance.now()},stop(){active=false;return{stats,frames,events,longtasks,ended:performance.now()}}};
};
