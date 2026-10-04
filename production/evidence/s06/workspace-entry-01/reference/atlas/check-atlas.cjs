// DOM doubles qualify only local illustration state transitions, never browser rendering.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
class El{
 constructor(){this.dataset={};this.style={};this.attrs={};this.handlers={};this.hidden=false;this.textContent='';this.value='';this.clientWidth=680;this.classes=new Set;this.classList={contains:k=>this.classes.has(k),toggle:k=>{if(this.classes.has(k)){this.classes.delete(k);return false;}this.classes.add(k);return true;}};}
 addEventListener(n,f){this.handlers[n]=f;}setAttribute(k,v){this.attrs[k]=v;}fire(n){this.handlers[n]?.({currentTarget:this});}
}
const ids={};for(const id of ['layout-board','layout-frame','layout-description','layout-scale','dynamic-dimension','dynamic-feature','dynamic-state','review-export','review-status'])ids[id]=new El;
ids['dynamic-dimension'].value='3D';ids['dynamic-feature'].value='f1';
const modes=['default','minimal','focus'].map(k=>{const e=new El;e.dataset.layout=k;return e;});
const ports={wInput:new El,color:new El,position:new El,wOutput:new El};
const rows=[{dataset:{reviewId:'nodes'},querySelector:s=>({value:s==='select'?'revise':'Check connected sockets'})}];
const doc={getElementById:k=>{assert(ids[k],k);return ids[k]},querySelectorAll:q=>{
 if(q==='button[data-layout]')return modes;
 if(q==='[data-review-id]')return rows;
 if(q.includes('w-input'))return [ports.wInput];
 if(q.includes('w-output'))return [ports.wOutput];
 if(q.includes('data-dynamic=color'))return [ports.color,ports.position];
 throw Error(q);
},createElement:()=>({click(){this.clicked=true}})};
let exported,revoked=false;
const sandbox={document:doc,ResizeObserver:class{constructor(fn){this.fn=fn}observe(){this.fn()}},Blob:class{constructor(parts){exported=JSON.parse(parts[0])}},URL:{createObjectURL:()=> 'blob:local-test',revokeObjectURL:()=>{revoked=true}},setTimeout:fn=>fn(),Date,Math,JSON,Array,String};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'atlas.js'),'utf8'),sandbox);
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name)}
test('Fit scales board and height coherently',()=>{assert.equal(ids['layout-board'].style.transform,'scale(0.5)');assert.equal(ids['layout-frame'].style.height,'390px')});
test('Layout controls change only local composition and active selection',()=>{for(const b of modes){b.fire('click');assert.equal(ids['layout-board'].dataset.layout,b.dataset.layout);assert.equal(modes.filter(x=>x.attrs['aria-pressed']==='true').length,1)}});
test('One-to-one toggle restores fit on second click',()=>{ids['layout-scale'].fire('click');assert.equal(ids['layout-board'].style.transform,'scale(1)');ids['layout-scale'].fire('click');assert.equal(ids['layout-board'].style.transform,'scale(0.5)')});
test('3D F1 does not show W',()=>{assert(ports.wInput.hidden);assert(ports.wOutput.hidden);assert(!ports.color.hidden)});
test('4D F1 adds W input/output',()=>{ids['dynamic-dimension'].value='4D';ids['dynamic-dimension'].fire('change');assert(!ports.wInput.hidden);assert(!ports.wOutput.hidden)});
test('Edge mode removes feature outputs while preserving 4D input',()=>{ids['dynamic-feature'].value='edge';ids['dynamic-feature'].fire('change');assert(ports.color.hidden);assert(ports.position.hidden);assert(ports.wOutput.hidden);assert(!ports.wInput.hidden)});
test('Return to 3D F1 restores visible interface',()=>{ids['dynamic-dimension'].value='3D';ids['dynamic-feature'].value='f1';ids['dynamic-feature'].fire('change');assert(!ports.color.hidden);assert(ports.wInput.hidden);assert(ports.wOutput.hidden)});
test('Review export carries current revision and only local review notes',()=>{ids['review-export'].fire('click');assert.equal(exported.atlasRevision,'ATLAS-005');assert.equal(exported.items[0].note,'Check connected sockets');assert.equal(exported.items[0].disposition,'revise');assert(revoked)});
console.log(JSON.stringify({status:'PASS',checks:count,scope:'Local atlas DOM-double tests only; no browser or product'}));
