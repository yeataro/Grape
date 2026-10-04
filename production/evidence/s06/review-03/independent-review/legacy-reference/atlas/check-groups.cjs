/* Pure Node VM / DOM-double check of the offline Group artifact.
 * No browser, Playwright, network, Legacy code or Host operation.
 * Not a layout engine: no CSS pixels, hit testing, visual or touch claims.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
class EventDouble {
  constructor(type,init={}){Object.assign(this,{type,button:0,pointerId:1,clientX:0,clientY:0,defaultPrevented:false},init);}
  preventDefault(){this.defaultPrevented=true;}
  stopPropagation(){this.propagationStopped=true;}
}
class TargetDouble {
  constructor(){this.listeners=new Map();}
  addEventListener(type,handler){if(!this.listeners.has(type))this.listeners.set(type,[]);this.listeners.get(type).push(handler);}
  dispatchEvent(event){event.target||=this;event.currentTarget=this;for(const handler of this.listeners.get(event.type)||[])handler(event);this['on'+event.type]?.(event);return !event.defaultPrevented;}
}
class ElementDouble extends TargetDouble {
  constructor(tag,doc){super();this.tagName=tag.toUpperCase();this.ownerDocument=doc;this.attributes=new Map();this.children=[];this.parentNode=null;this._text='';this.checked=false;this.disabled=false;this.value='';this.capture=new Set();this.style={setProperty(key,value){this[key]=String(value);},getPropertyValue(key){return this[key]||'';}};
    const dataName=key=>'data-'+String(key).replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
    this.dataset=new Proxy({}, {get:(_,key)=>this.getAttribute(dataName(key))??undefined,set:(_,key,value)=>{this.setAttribute(dataName(key),value);return true;}});
    this.classList={contains:name=>(this.getAttribute('class')||'').split(/\s+/).includes(name),toggle:(name,force)=>{const names=new Set((this.getAttribute('class')||'').split(/\s+/).filter(Boolean)),on=force??!names.has(name);on?names.add(name):names.delete(name);this.setAttribute('class',[...names].join(' '));return on;}};
  }
  append(...nodes){for(const node of nodes){node.parentNode=this;this.children.push(node);}}
  get lastChild(){return this.children.at(-1)||null;}
  get previousSibling(){const siblings=this.parentNode?.children||[];return siblings[siblings.indexOf(this)-1]||null;}
  get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
  set textContent(value){this._text=String(value);this.children=[];}
  setAttribute(key,value){this.attributes.set(key,String(value));if(key==='checked')this.checked=true;}
  getAttribute(key){return this.attributes.get(key)??null;}
  hasAttribute(key){return this.attributes.has(key);}
  toggleAttribute(key,force){const on=force??!this.hasAttribute(key);on?this.setAttribute(key,''):this.attributes.delete(key);return on;}
  get hidden(){return this.hasAttribute('hidden');}
  set hidden(value){this.toggleAttribute('hidden',Boolean(value));}
  matches(selector){
    const simple=selector.replace(/\[[^\]]*\]/g,'');
    const tag=simple.match(/^[a-z][\w-]*/i);if(tag&&this.tagName!==tag[0].toUpperCase())return false;
    const id=simple.match(/#([\w-]+)/);if(id&&this.getAttribute('id')!==id[1])return false;
    for(const match of simple.matchAll(/\.([\w-]+)/g))if(!this.classList.contains(match[1]))return false;
    for(const match of selector.matchAll(/\[([^\]=]+)(?:="([^"]*)")?\]/g))if(match[2]===undefined?!this.hasAttribute(match[1]):this.getAttribute(match[1])!==match[2])return false;
    return true;
  }
  querySelectorAll(selector){const result=[];const visit=node=>{for(const child of node.children){if(child.matches(selector))result.push(child);visit(child);}};visit(this);return result;}
  querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
  contains(node){return node===this||this.children.some(child=>child.contains(node));}
  focus(){if(this.ownerDocument.activeElement===this)return;const old=this.ownerDocument.activeElement;this.ownerDocument.activeElement=this;old?.dispatchEvent(new EventDouble('blur'));}
  select(){this.selectionRequested=true;}
  setPointerCapture(id){this.capture.add(id);}
  hasPointerCapture(id){return this.capture.has(id);}
  releasePointerCapture(id){this.capture.delete(id);this.dispatchEvent(new EventDouble('lostpointercapture',{pointerId:id}));}
  createSVGPoint(){return {x:0,y:0,matrixTransform(){return {x:this.x,y:this.y};}};}
  getScreenCTM(){return {inverse(){return {};}};}
}
class DocumentDouble extends TargetDouble {
  constructor(){super();this.readyState='complete';this.activeElement=null;this.tree=new ElementDouble('document',this);}
  createElement(tag){return new ElementDouble(tag,this);}
  createElementNS(ns,tag){return this.createElement(tag);}
  getElementById(id){return this.tree.querySelector('#'+id);}
}
function parseFixture(html,doc){
  // Only the actual fragment's element tree, attributes and text are needed.
  // This intentionally does not implement CSS/layout or general HTML parsing.
  const stack=[doc.tree],voidTags=new Set(['input','br','img','meta','link','hr']);
  for(const token of html.match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g)||[]){
    if(token.startsWith('<!--'))continue;
    if(token.startsWith('</')){const tag=token.slice(2,-1).trim().toLowerCase();assert.equal(stack.at(-1).tagName.toLowerCase(),tag,'fixture nesting');stack.pop();continue;}
    if(token.startsWith('<')){const match=token.match(/^<([\w-]+)([\s\S]*?)\/?\s*>$/);assert(match,'supported fixture tag '+token);const node=doc.createElement(match[1]);
      for(const attr of match[2].matchAll(/([\w:-]+)(?:\s*=\s*"([^"]*)")?/g))node.setAttribute(attr[1],attr[2]??'');
      stack.at(-1).append(node);if(!voidTags.has(match[1].toLowerCase())&&!/\/\s*>$/.test(token))stack.push(node);
    }else stack.at(-1)._text+=token;
  }
  assert.equal(stack.length,1,'balanced fragment');
}
const document=new DocumentDouble(),window=new TargetDouble();parseFixture(read('atlas/parts/groups.html'),document);
const sandbox=vm.createContext({document,window,MouseEvent:EventDouble});
vm.runInContext(read('atlas/parts/groups.js'),sandbox,{filename:'groups.js',timeout:1000});
const root=document.getElementById('groups'),q=selector=>{const el=root.querySelector(selector);assert(el,'missing '+selector);return el;},qa=selector=>root.querySelectorAll(selector);
const named=name=>q('[data-gf-'+name+']'),node=id=>q('[data-gf-node="'+id+'"]'),pos=id=>node(id).getAttribute('transform');
const emit=(el,type,init={})=>el.dispatchEvent(new EventDouble(type,init));
const click=el=>{assert(!el.disabled,'cannot click disabled helper');emit(el,'click');};
const action=name=>click(named(name)),check=(value,label)=>{assert(value,label);results.push(label);},results=[];
const checked=(name,value)=>{named(name).checked=value;emit(named(name),'change');};
const reset=()=>action('reset'),selected=()=>qa('[data-gf-node][aria-pressed="true"]');
check(qa('[data-gf-node]').length===3,'fixture initializes three demo nodes');
check(node('c').dataset.member==='false','C starts outside explicit member set');
const translate=el=>el.getAttribute('transform').match(/-?\d+(?:\.\d+)?/g).map(Number),frameXY=translate(named('frame')),cXY=translate(node('c')),cSurface=node('c').querySelector('.gf-node-surface');
check(cXY[0]>frameXY[0]&&cXY[1]>frameXY[1]&&cXY[0]+Number(cSurface.getAttribute('width'))<frameXY[0]+Number(named('frame-body').getAttribute('width'))&&cXY[1]+Number(cSurface.getAttribute('height'))<frameXY[1]+Number(named('frame-body').getAttribute('height')),'computed SVG coordinates enclose nonmember C (not rendered geometry)');
action('select-frame');check(selected().length===2&&!selected().includes(node('c')),'frame selection excludes nonmember');
const a=pos('a'),c=pos('c');action('move');check(pos('a')!==a&&pos('c')===c,'member move excludes nonmember');action('undo');check(pos('a')===a,'local move undo restores position');
action('include-c');check(!named('join').disabled,'member plus incoming selection enables join');action('join');check(node('c').dataset.member==='true','join updates explicit member');click(node('c'));action('detach');check(node('c').dataset.member==='false'&&pos('c')===c,'detach keeps position');
const h=Number(named('frame-body').getAttribute('height'));action('collapse');check(Number(named('frame-body').getAttribute('height'))<h&&qa('[data-gf-wire]').length===1,'member collapse recomputes coordinates and retains wire');action('undo');
action('rename');named('name-input').value='Exposure controls';emit(named('name-input'),'keydown',{key:'Enter'});check(named('name').textContent==='Exposure controls'&&named('name-foreign').hidden,'rename Enter submits');
action('rename');named('name-input').value='Cancelled';emit(named('name-input'),'keydown',{key:'Escape'});check(named('name').textContent==='Exposure controls','rename Escape preserves prior name');
action('rename');named('name-input').value='Blur title';emit(named('name-input'),'blur');check(named('name').textContent==='Blur title','rename blur submits');
action('rename');named('name-input').value='';emit(named('name-input'),'keydown',{key:'Enter'});check(named('name').textContent==='Blur title','invalid name preserves previous value');
action('color');check(!named('palette').hidden&&qa('[data-gf-swatch]').length===12,'color opens twelve presets');click(q('[data-gf-swatch="#72a6a5"]'));check(named('scene').style.getPropertyValue('--gf-frame')==='#72a6a5'&&named('palette').hidden,'preset updates frame and closes palette');
const wire=named('wire').getAttribute('d');action('remove');check(named('frame').style.display==='none'&&qa('[data-gf-node]').length===3&&named('wire').getAttribute('d')===wire,'frame removal preserves nodes and wire');action('undo');check(named('frame').style.display!=='none','remove undo restores frame');
checked('corner-setting',false);check(named('corner').style.display==='none','corner preference hides entry');checked('corner-setting',true);check(named('corner').style.display!=='none','corner preference restores entry');
checked('readonly',true);check(named('move').disabled&&named('remove').getAttribute('aria-disabled')==='true','readonly marks mutations unavailable');action('select-frame');check(selected().length===2,'readonly still selects');emit(named('remove'),'click');check(named('frame').style.display!=='none','readonly handler refuses removal');
reset();emit(named('heading'),'pointerdown',{clientX:100,clientY:100});emit(named('heading'),'pointermove',{clientX:101,clientY:101});emit(named('heading'),'pointerup',{clientX:101,clientY:101});check(named('state').textContent.endsWith('Demo edits: 0'),'below-threshold drag creates no history');
emit(named('heading'),'pointerdown',{clientX:100,clientY:100});emit(named('heading'),'pointermove',{clientX:120,clientY:118});emit(named('heading'),'pointermove',{clientX:130,clientY:120});emit(named('heading'),'pointerup',{clientX:130,clientY:120});check(named('state').textContent.endsWith('Demo edits: 1')&&pos('c')===c,'multiple drag previews commit one local edit');action('undo');check(pos('a')===a,'drag undo restores basis');
emit(named('heading'),'pointerdown',{clientX:100,clientY:100});emit(named('heading'),'pointermove',{clientX:130,clientY:120});emit(window,'keydown',{key:'Escape'});check(pos('a')===a&&!named('heading').hasPointerCapture(1)&&named('state').textContent.endsWith('Demo edits: 0'),'drag Escape restores basis without history');
emit(named('heading'),'pointerdown',{clientX:100,clientY:100});emit(named('heading'),'pointermove',{clientX:130,clientY:120});emit(window,'blur');check(pos('a')===a,'window blur cancels drag');
reset();click(node('a'));emit(node('c'),'keydown',{key:'Enter',shiftKey:true});check(selected().length===2&&selected().includes(node('c')),'node modifier keyboard adds selection');emit(named('heading'),'keydown',{key:' ',shiftKey:true});check(selected().length===3,'frame modifier keyboard adds members');emit(named('heading'),'keydown',{key:' ',shiftKey:true});check(selected().length===1&&selected()[0]===node('c'),'frame modifier keyboard toggles members off');
reset();click(node('a'));action('detach');check(named('frame').style.display!=='none'&&node('b').dataset.member==='true','one member frame survives');click(node('b'));action('detach');check(named('frame').style.display==='none','last member detach removes empty frame');
click(node('a'));emit(node('c'),'click',{shiftKey:true});check(!named('create').disabled,'two unframed nodes enable create');action('create');check(node('a').dataset.member==='true'&&node('c').dataset.member==='true'&&node('b').dataset.member==='false'&&!named('name-foreign').hidden,'create uses selected members then renames');emit(named('name-input'),'keydown',{key:'Escape'});
const beforeNodes=qa('[data-gf-node]').length;vm.runInContext(read('atlas/parts/groups.js'),sandbox,{filename:'groups.js',timeout:1000});check(qa('[data-gf-node]').length===beforeNodes,'reinitialization guard avoids duplicate nodes/listeners');
const manifest=JSON.parse(read('atlas/parts/groups-manifest.json'));
for(const artboard of manifest.artboards){check(document.tree.querySelectorAll('#'+artboard.id).length===1,'manifest artboard '+artboard.id);for(const ref of artboard.sourceReferences)check(fs.existsSync(path.resolve(base,'atlas/parts',ref.path)),'evidence path '+ref.path);}
console.log(JSON.stringify({part:'groups',method:'pure Node VM with DOM and event doubles',checks:results.length,result:'PASS',assertions:results,limits:['No browser or CSS/layout engine','No rendered geometry, hit testing, native focus/event propagation or device gestures verified','No screenshot/visual/CUA acceptance','No Legacy product, Host, network or storage operations']},null,2));
