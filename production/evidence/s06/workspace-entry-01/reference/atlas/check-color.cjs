#!/usr/bin/env node
'use strict';

/**
 * node atlas/check-color.cjs
 * Read-only, dependency-free checks of the ACTUAL transplanted color fragment.
 * The small parser/DOM/canvas double exercises selectors, handlers and raster math.
 * It implements only simple parent bubbling, not browser layout, focus/IME, native range coercion,
 * pointer capture, accessibility or CEF. CSS checks are structural assertions only.
 * No browser/visual/Legacy/product acceptance is claimed. No files are written.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const test = require('node:test');

const parts = path.join(__dirname, 'parts');
const html = fs.readFileSync(path.join(parts, 'color.html'), 'utf8');
const script = fs.readFileSync(path.join(parts, 'color.js'), 'utf8');
const css = fs.readFileSync(path.join(parts, 'color.css'), 'utf8');
const decode = text => text.replace(/&(?:amp|lt|gt|quot|#39);/g, v => ({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'"}[v]));

function fixture({width = 260, height = 100} = {}) {
  const ids = new Map(), observers = [];
  let document;
  class Element {
    constructor(tag) {
      this.tagName = tag.toUpperCase(); this.children = []; this.parentNode = null;
      this.attributes = {}; this.dataset = {}; this.listeners = new Map();
      this.style = {setProperty(name, value) { this[name] = String(value); }};
      this.hidden = false; this.disabled = false; this.isConnected = true;
      this._value = ''; this._text = ''; this.captures = new Set();
      this.bounds = {left: 0, top: 0, width, height};
      if (tag === 'canvas') {
        this.width = 300; this.height = 150;
        this.context = {
          image: null, arcs: [],
          createImageData(w, h) { return {width: w, height: h, data: new Uint8ClampedArray(w*h*4)}; },
          putImageData(image) { this.image = image; },
          beginPath() { this.arcs = []; },
          arc(...args) { this.arcs.push(args); },
          stroke() {}
        };
      }
    }
    set value(value) { this._value = String(value); }
    get value() { return this._value; }
    set className(value) { this.attributes.class = String(value); }
    get className() { return this.attributes.class || ''; }
    get id() { return this.attributes.id || ''; }
    set textContent(value) { this._text = String(value); this.children = []; }
    get textContent() { return this._text + this.children.map(c => c.textContent).join(''); }
    setAttribute(name, value) {
      value = String(value); this.attributes[name] = value;
      if (name === 'id') { assert(!ids.has(value) || ids.get(value) === this, `Duplicate ID ${value}`); ids.set(value, this); }
      if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_,c) => c.toUpperCase())] = value;
      if (['value','max','min','step','type','width','height'].includes(name)) this[name] = ['width','height'].includes(name) ? Number(value) : value;
      if (name === 'hidden' || name === 'disabled') this[name] = true;
    }
    getAttribute(name) { return this.attributes[name] ?? null; }
    removeAttribute(name) { delete this.attributes[name]; if (name === 'hidden' || name === 'disabled') this[name] = false; }
    append(...nodes) { for (const n of nodes) { n.parentNode = this; this.children.push(n); } }
    replaceChildren(...nodes) { this.children.forEach(c => {c.parentNode = null;}); this.children=[]; this._text=''; this.append(...nodes); }
    contains(node) { for(let n=node;n;n=n.parentNode)if(n===this)return true;return false; }
    addEventListener(type, handler) { if (!this.listeners.has(type)) this.listeners.set(type,[]); this.listeners.get(type).push(handler); }
    emit(type, props={}) {
      // dispatch-style delivery is intentional: a queued event must obey JS guards
      // even where the real UI also disables the corresponding control.
      const e={target:this, isComposing:false, defaultPrevented:false, propagationStopped:false,
        preventDefault(){this.defaultPrevented=true;}, stopPropagation(){this.propagationStopped=true;}, ...props};
      for(let current=this;current;current=current.parentNode){
        e.currentTarget=current;
        for(const fn of current.listeners.get(type)||[]) fn(e);
        if(e.propagationStopped||type==='blur')break;
      }
      return e;
    }
    focus() { document.activeElement = this; }
    select() { this.selected = true; }
    getBoundingClientRect() { return {...this.bounds}; }
    setPointerCapture(id) { this.captures.add(id); }
    hasPointerCapture(id) { return this.captures.has(id); }
    releasePointerCapture(id) { this.captures.delete(id); }
    getContext(kind) { assert.equal(kind,'2d'); return this.context; }
    querySelectorAll(selector) {
      const all=[]; const walk=node=>node.children.forEach(c=>{all.push(c);walk(c);}); walk(this);
      return all.filter(el=>selector.split(',').some(part=>matchesChain(el,part.trim(),this)));
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  }
  function matches(el, selector) {
    const attrs=[...selector.matchAll(/\[([^\]=\s]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+)))?\]/g)];
    selector=selector.replace(/\[[^\]]*\]/g,'');
    for(const a of attrs) {
      const expected=a[2]??a[3]??a[4]; const value=el.getAttribute(a[1]);
      if(value===null || (expected!==undefined && value!==expected)) return false;
    }
    const tag=selector.match(/^[\w-]+/); if(tag && el.tagName!==tag[0].toUpperCase()) return false;
    for(const id of selector.matchAll(/#([\w-]+)/g)) if(el.id!==id[1]) return false;
    for(const cls of selector.matchAll(/\.([\w-]+)/g)) if(!el.className.split(/\s+/).includes(cls[1])) return false;
    return true;
  }
  function matchesChain(el, selector, scope) {
    const chain=selector.split(/\s+(?![^\[]*\])/); let current=el;
    if(!matches(current,chain.pop())) return false;
    while(chain.length) {
      const ancestor=chain.pop(); current=current.parentNode;
      while(current && current!==scope && !matches(current,ancestor)) current=current.parentNode;
      if(!current || current===scope && !matches(current,ancestor)) return false;
    }
    return true;
  }
  document=new Element('document');
  document.readyState='complete'; document.activeElement=null;
  document.createElement=tag=>new Element(tag);
  document.getElementById=id=>ids.get(id)||null;
  const stack=[document], voids=new Set(['input','img','br','hr','meta','link','source','wbr']);
  for(const token of html.matchAll(/<!--[\s\S]*?-->|<![^>]*>|<\/?[a-zA-Z][^>]*>|[^<]+/g)) {
    const raw=token[0]; if(raw.startsWith('<!--') || raw.startsWith('<!')) continue;
    if(raw.startsWith('</')) {
      const tag=raw.match(/^<\/([\w-]+)/)[1].toUpperCase();
      assert.equal(stack.at(-1).tagName,tag,`Unbalanced closing ${tag}`); stack.pop(); continue;
    }
    if(raw.startsWith('<')) {
      const tag=raw.match(/^<([\w-]+)/)[1]; const el=new Element(tag);
      const body=raw.slice(tag.length+1).replace(/\/?\s*>$/,'');
      for(const a of body.matchAll(/([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+)))?/g)) {
        if(a[1]==='/') continue; el.setAttribute(a[1],decode(a[2]??a[3]??a[4]??''));
      }
      stack.at(-1).append(el); if(!voids.has(tag) && !raw.endsWith('/>')) stack.push(el);
    } else stack.at(-1)._text+=decode(raw);
  }
  assert.equal(stack.length,1,'Fragment is balanced');
  const root=document.getElementById('grape-compact-color'); assert(root,'Actual color fragment must contain the candidate root');
  const ResizeObserver=class { constructor(callback){this.callback=callback;observers.push(this);} observe(target){this.target=target;} disconnect(){} };
  const window={addEventListener(){throw new Error('Unexpected external/window event');}};
  vm.runInNewContext(script,{document,window,ResizeObserver,Uint8ClampedArray},{filename:'parts/color.js',timeout:5000});
  const q=selector=>{const el=root.querySelector(selector);assert(el,`Missing actual selector ${selector}`);return el;};
  const qa=selector=>root.querySelectorAll(selector);
  const rows=qa('.gcp-channel').map(row=>({label:row.querySelector('span'),range:row.querySelector('[type=range]'),number:row.querySelector('[type=number]')}));
  return {document,root,q,qa,rows,
    hex:()=>q('.gcp-hex').value,
    input(el,value){el.value=value;el.emit('input');},
    click(selector){q(selector).emit('click');},
    key(el,key,props={}){el.emit('keydown',{key,...props});},
    target(type){const el=document.querySelector(`[data-color-target="${type}"]`);assert(el,`Missing ${type} review target`);el.emit('click');},
    mode(mode){document.querySelector(`[data-color-mode="${mode}"]`).emit('click');},
    open(){document.querySelector('[data-color-open]').emit('click');},
    outside(){document.querySelector('[data-color-model]').emit('pointerdown');},
    model(){return JSON.parse(document.querySelector('[data-color-model]').getAttribute('data-value'));},
    writes(){return Number(document.querySelector('[data-color-model]').getAttribute('data-writes'));},
    isOpen(){return !q('.gcp-window').hidden;},
    resize(w,h){const surface=q('.gcp-surface');surface.bounds={left:0,top:0,width:w,height:h};observers.forEach(o=>o.callback([{target:surface}]));},
    image(){return q('canvas').context.image;}
  };
}
const near=(actual,expected,tolerance=.0006)=>assert(Math.abs(Number(actual)-expected)<=tolerance,`${actual} differs from ${expected}`);
const preview=f=>f.q('.gcp-preview').style.background;
const numeric=f=>f.rows.map(r=>r.number.value);
const pointer=(f,type,id,x,y)=>f.q('.gcp-surface').emit(type,{pointerId:id,button:0,clientX:x,clientY:y});

test('01 actual fragment/selectors, simultaneous seven channels and 44 reference swatches',()=>{
  const f=fixture();
  assert.equal(f.rows.length,7); assert.deepEqual(f.rows.map(r=>r.label.textContent),['H','S','V','R','G','B','A']);
  assert.equal(f.q('.gcp-swatches').children.length,44);
  assert.equal(f.q('.gcp-swatches').children[0].dataset.color.toUpperCase(),'#FF0000');
  assert.equal(f.q('.gcp-swatches').children.at(-1).dataset.color.toUpperCase(),'#FFFFFF');
  near(f.rows[0].number.value,261.5625,.06); near(f.rows[1].number.value,.5019607843); near(f.rows[2].number.value,1);
  near(f.rows[6].number.value,.8823529412); assert.equal(f.hex(),'#AD7FFFE1');
});

test('02 100px preview, minimum16px palette and 320px panel are structural declarations, not layout proof',()=>{
  assert.match(css,/\.gcp-preview-checker\s*\{[^}]*width\s*:\s*100px[^}]*height\s*:\s*100px/);
  assert.match(css,/\.gcp-swatches\s*\{[^}]*repeat\(11,\s*minmax\(16px,\s*1fr\)\)/);
  assert.match(css,/\.gcp-window\s*\{[^}]*width\s*:\s*320px/);
  assert(!/input[^>]*type=["']color["']/i.test(html));
  assert(!/window\.openai|\bTweak\b|\bfetch\s*\(|\blocalStorage\b|\bsessionStorage\b|\bWebSocket\b/.test(script));
});

test('03 six saved swatches, add-to-front, duplicate elimination and cap',()=>{
  const f=fixture(), saved=()=>f.q('.gcp-saved').children;
  assert.equal(saved().length,6);assert.equal(f.q('.gcp-saved').hidden,false);
  f.input(f.q('.gcp-hex'),'#12345678'); f.click('.gcp-add');
  assert.equal(saved().length,6); assert.equal(saved()[0].dataset.color,'#12345678');
  f.click('.gcp-add');assert.equal(saved().length,6);
  assert.equal(saved().filter(e=>e.dataset.color==='#12345678').length,1);
  saved()[1].emit('click');assert.equal(f.hex(),saved()[1].dataset.color.toUpperCase());
});

test('04 RGB target hides Alpha, emits six HEX digits and ignores hidden Alpha edits',()=>{
  const f=fixture();f.target('RGB');
  assert.equal(f.q('.gcp-alpha-row').hidden,true);assert.match(f.hex(),/^#[A-F0-9]{6}$/);
  const before=preview(f);f.input(f.rows[6].range,'.2');assert.equal(preview(f),before);assert.match(f.hex(),/^#[A-F0-9]{6}$/);
});

test('05 RGBA target exposes Alpha and always emits eight digits including opaque FF',()=>{
  const f=fixture();f.target('RGB');f.target('RGBA');
  assert.equal(f.q('.gcp-alpha-row').hidden,false);
  f.input(f.rows[6].number,'1');assert.match(f.hex(),/^#[A-F0-9]{6}FF$/);
  f.input(f.q('.gcp-hex'),'#00FF0080');f.q('.gcp-hex').emit('blur');
  assert.equal(f.hex(),'#00FF0080');near(f.rows[6].number.value,128/255);
});

for(const [i,event] of [[6,'blur'],[7,'change'],[8,'Enter']]) test(`${String(i).padStart(2,'0')} RGBA six-digit paste preserves Alpha and normalizes on ${event}`,()=>{
  const f=fixture(),hex=f.q('.gcp-hex');f.input(hex,'#112233');
  near(f.rows[6].number.value,.8823529412);assert.equal(hex.value,'#112233');
  if(event==='Enter')f.key(hex,'Enter');else hex.emit(event);
  assert.equal(hex.value,'#112233E1');
});

test('09 RGB rejects eight-digit HEX and Escape cancels the opening',()=>{
  const f=fixture();f.target('RGB');const before=preview(f),hex=f.q('.gcp-hex'),valid=hex.value;
  f.input(hex,'#11223380');assert.equal(hex.getAttribute('aria-invalid'),'true');assert.equal(hex.value,'#11223380');assert.equal(preview(f),before);
  f.key(hex,'Escape');assert.equal(hex.value,valid);assert.notEqual(hex.getAttribute('aria-invalid'),'true');assert.equal(f.isOpen(),false);
});

test('10 HSV and RGB controls synchronize with known non-achromatic colors',()=>{
  const f=fixture();f.input(f.rows[0].number,'120');f.input(f.rows[1].number,'1');f.input(f.rows[2].number,'.5');
  [0,.5,0].forEach((n,i)=>near(f.rows[i+3].number.value,n));
  f.input(f.rows[3].number,'.25');f.input(f.rows[4].number,'.25');f.input(f.rows[5].number,'.5');
  [240,.5,.5].forEach((n,i)=>near(f.rows[i].number.value,n));
});

test('11 displayed color and Alpha remain stable across unrelated renders',()=>{
  const f=fixture();f.input(f.rows[3].number,'.1234567');f.input(f.rows[6].number,'.4371234');
  const before={hex:f.hex(),preview:preview(f),rows:numeric(f)};
  for(let i=0;i<8;i++){f.click('[data-view=plane]');f.click('[data-shape=circle]');f.click('[data-shape=square]');f.click('[data-view=swatches]');}
  assert.equal(f.hex(),before.hex);assert.equal(preview(f),before.preview);
  near(f.rows[3].number.value,.1234567);near(f.rows[6].number.value,.4371234);
});

test('12 invalid component fences other components, HEX, palette, shape/view and add',()=>{
  const f=fixture(),r=f.rows[3].number,hex=f.q('.gcp-hex');const before=preview(f),saved=f.q('.gcp-saved').children.map(x=>x.dataset.color);
  f.input(r,'');assert.equal(r.getAttribute('aria-invalid'),'true');
  f.input(f.rows[0].range,'90');f.input(hex,'#FFFFFF');
  f.q('.gcp-swatches').children[0].emit('click');f.click('.gcp-add');f.click('[data-view=plane]');f.click('[data-shape=circle]');
  assert.equal(r.value,'');assert.equal(r.getAttribute('aria-invalid'),'true');assert.equal(preview(f),before);
  assert.equal(f.q('#gcp-optional-plane').hidden,true);assert.equal(f.q('[data-shape=square]').getAttribute('aria-pressed'),'true');
  assert.deepEqual(f.q('.gcp-saved').children.map(x=>x.dataset.color),saved);
  f.key(r,'Escape');assert.notEqual(r.getAttribute('aria-invalid'),'true');assert.equal(preview(f),before);assert.equal(f.rows[0].range.disabled,false);
});

test('13 invalid HEX fences sliders/plane and Escape cancels the opening',()=>{
  const f=fixture();f.click('[data-view=plane]');const before=preview(f),valid=f.hex();
  f.input(f.q('.gcp-hex'),'#bad');f.input(f.rows[6].range,'.1');pointer(f,'pointerdown',13,10,10);
  f.key(f.q('.gcp-surface'),'ArrowRight');assert.equal(f.q('.gcp-surface').hasPointerCapture(13),false);
  assert.equal(preview(f),before);assert.equal(f.hex(),'#bad');
  f.key(f.q('.gcp-hex'),'Escape');assert.equal(f.hex(),valid);assert.equal(f.rows[6].range.disabled,false);
});

test('14 view and all shape choices project visibility/pressed state without changing color',()=>{
  const f=fixture(),before=preview(f);assert.equal(f.q('#gcp-optional-plane').hidden,true);assert.equal(f.q('.gcp-top').hidden,false);
  f.click('[data-view=plane]');assert.equal(f.q('#gcp-optional-plane').hidden,false);assert.equal(f.q('.gcp-top').hidden,true);
  for(const shape of ['circle','triangle','square']) {f.click(`[data-shape=${shape}]`);assert.equal(f.q(`[data-shape=${shape}]`).getAttribute('aria-pressed'),'true');assert.equal(preview(f),before);assert(f.image());}
  f.click('[data-view=swatches]');assert.equal(f.q('.gcp-top').hidden,false);
});

for(const [i,w,h] of [[15,260,100],[16,140,212],[17,300,140]]) test(`${i} circle raster is round at fake surface ${w}x${h} (not browser proof)`,()=>{
  const f=fixture();f.click('[data-view=plane]');f.click('[data-shape=circle]');f.resize(w,h);
  const image=f.image();assert.equal(image.width,w*2);assert.equal(image.height,h*2);
  let minX=image.width,minY=image.height,maxX=-1,maxY=-1;
  for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++)if(image.data[(y*image.width+x)*4+3]){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
  assert(maxX>minX);assert(Math.abs((maxX-minX)-(maxY-minY))<=1,'Raster disk bounds must have equal diameters');
  near((minX+maxX)/2,image.width/2,1);near((minY+maxY)/2,image.height/2,1);
  assert.equal(image.data[3],0,'Outside disk remains transparent');
});

test('18 circle and triangle outside-start does not capture or change state',()=>{
  const f=fixture();f.click('[data-view=plane]');const before=preview(f);
  for(const shape of ['circle','triangle']){f.click(`[data-shape=${shape}]`);pointer(f,'pointerdown',18,0,0);assert.equal(f.q('.gcp-surface').hasPointerCapture(18),false);assert.equal(preview(f),before);}
});

test('19 pointer cancellation restores the gesture basis; late movement/up cannot reapply',()=>{
  const f=fixture();f.click('[data-view=plane]');const before={hex:f.hex(),preview:preview(f)};
  pointer(f,'pointerdown',19,80,40);assert.equal(f.q('.gcp-surface').hasPointerCapture(19),true);assert.notEqual(preview(f),before.preview);
  pointer(f,'pointermove',19,180,60);pointer(f,'pointercancel',19,0,0);
  assert.equal(f.hex(),before.hex);assert.equal(preview(f),before.preview);assert.equal(f.q('.gcp-surface').hasPointerCapture(19),false);
  pointer(f,'pointermove',19,0,0);pointer(f,'pointerup',19,260,100);assert.equal(f.hex(),before.hex);
});

test('20 target switch during drag cancels old gesture and fences late events',()=>{
  const f=fixture();f.click('[data-view=plane]');const before=f.hex();
  pointer(f,'pointerdown',20,80,40);f.target('RGB');
  assert.equal(f.q('.gcp-surface').hasPointerCapture(20),false);assert.equal(f.hex(),before.slice(0,7));
  const rgb=f.hex();pointer(f,'pointermove',20,0,0);pointer(f,'pointerup',20,200,20);assert.equal(f.hex(),rgb);
  f.target('RGBA');assert.equal(f.hex(),before);
});

test('21 changing top view during drag cancels it without retaining its transient value',()=>{
  const f=fixture();f.click('[data-view=plane]');const before=f.hex();
  pointer(f,'pointerdown',21,60,30);f.click('[data-view=swatches]');
  assert.equal(f.q('.gcp-surface').hasPointerCapture(21),false);assert.equal(f.hex(),before);
});

test('22 invalid draft during drag survives pointerup; Escape cancels the whole opening',()=>{
  const f=fixture(),opening=preview(f);f.click('[data-view=plane]');pointer(f,'pointerdown',22,80,40);
  f.input(f.q('.gcp-hex'),'#unfinished');const atInvalid=preview(f);
  pointer(f,'pointerup',22,250,2);assert.equal(f.hex(),'#unfinished');assert.equal(f.q('.gcp-hex').getAttribute('aria-invalid'),'true');assert.equal(preview(f),atInvalid);
  f.key(f.q('.gcp-hex'),'Escape');pointer(f,'pointermove',22,0,0);assert.equal(preview(f),opening);assert.equal(f.isOpen(),false);
});

test('23 late cancellation for an old pointer cannot cancel a new gesture',()=>{
  const f=fixture();f.click('[data-view=plane]');
  pointer(f,'pointerdown',23,60,30);pointer(f,'pointercancel',23,0,0);
  pointer(f,'pointerdown',24,180,20);const second=preview(f);pointer(f,'pointercancel',23,0,0);
  assert.equal(f.q('.gcp-surface').hasPointerCapture(24),true);assert.equal(preview(f),second);
  pointer(f,'pointercancel',24,0,0);assert.equal(f.q('.gcp-surface').hasPointerCapture(24),false);
});

test('24 center trio and independent right actions; demo controls remain outside specimen',()=>{
  const f=fixture(),tools=f.q('.gcp-header-tools'),actions=f.q('.gcp-header-actions');
  assert.equal(tools.children.length,3);assert.equal(tools.children[0].dataset.view,'swatches');assert.equal(tools.children[1].dataset.view,'plane');
  assert.equal(tools.children[2],f.q('.gcp-eyedropper'));assert.equal(actions.children[0],f.q('.gcp-apply'));assert.equal(actions.children[1],f.q('.gcp-close'));
  for(const selector of ['[data-color-target]','[data-color-mode]','[data-color-model]','[data-color-open]'])assert.equal(f.root.contains(f.document.querySelector(selector)),false);
  assert.equal(f.q('.gcp-close').hidden,false);f.mode('live');assert.equal(f.q('.gcp-apply').hidden,true);assert.equal(f.q('.gcp-close').hidden,false);
});

test('25 constant draft changes preview only; Enter normalizes; Apply commits once and fences late edits',()=>{
  const f=fixture(),before=f.model();f.input(f.q('.gcp-hex'),'#12345678');assert.deepEqual(f.model(),before);assert.equal(f.writes(),0);
  f.key(f.q('.gcp-hex'),'Enter');assert.equal(f.isOpen(),true);assert.equal(f.writes(),0);
  f.click('.gcp-apply');assert.equal(f.isOpen(),false);assert.deepEqual(f.model(),[18/255,52/255,86/255,120/255]);assert.equal(f.writes(),1);
  f.click('.gcp-apply');f.input(f.rows[0].number,'90');f.q('.gcp-swatches').children[0].emit('click');assert.equal(f.writes(),1);
  f.open();assert.equal(f.hex(),'#12345678');assert.equal(f.writes(),1);
});

test('26 constant outside, X and Escape each discard the entire draft without model writes',()=>{
  for(const cancel of [f=>f.outside(),f=>f.click('.gcp-close'),f=>f.key(f.rows[3].number,'Escape')]){
    const f=fixture(),opening=f.model();f.input(f.rows[3].number,'.1');f.input(f.rows[6].number,'.2');cancel(f);
    assert.equal(f.isOpen(),false);assert.deepEqual(f.model(),opening);assert.equal(f.writes(),0);f.open();assert.equal(f.hex(),'#AD7FFFE1');
  }
});

test('27 live edits immediately update the local model; outside accepts and next opening uses it',()=>{
  const f=fixture();f.mode('live');assert.equal(f.writes(),0);f.input(f.rows[3].number,'.123456789012345');
  assert.equal(f.model()[0],.123456789012345);assert.equal(f.writes(),1);f.outside();assert.equal(f.isOpen(),false);assert.equal(f.writes(),1);
  f.open();f.input(f.rows[4].number,'.75');f.click('.gcp-close');assert.equal(f.model()[0],.123456789012345);assert.equal(f.model()[1],127/255);
});

test('28 live X and Escape restore the whole opening after several edits, including an invalid final draft',()=>{
  for(const cancel of [f=>f.click('.gcp-close'),f=>f.key(f.q('.gcp-hex'),'Escape')]){
    const f=fixture();f.mode('live');const opening=f.model();f.input(f.rows[3].number,'.25');f.q('.gcp-swatches').children[0].emit('click');f.input(f.rows[6].number,'.5');
    assert.notDeepEqual(f.model(),opening);f.input(f.q('.gcp-hex'),'#unfinished');const writes=f.writes();cancel(f);
    assert.equal(f.isOpen(),false);assert.deepEqual(f.model(),opening);assert.equal(f.writes(),writes+1);f.click('.gcp-close');assert.equal(f.writes(),writes+1);
  }
});

test('29 invalid constant draft disables Apply, does not commit, and remains cancellable',()=>{
  const f=fixture(),opening=f.model();f.input(f.rows[3].number,'.4');f.input(f.q('.gcp-hex'),'#bad');
  assert.equal(f.q('.gcp-apply').disabled,true);assert.equal(f.q('.gcp-close').disabled,false);f.click('.gcp-apply');assert.equal(f.isOpen(),true);assert.equal(f.writes(),0);
  f.click('.gcp-close');assert.deepEqual(f.model(),opening);assert.equal(f.isOpen(),false);
});

test('30 live pointercancel restores its gesture basis; X later restores the opening basis',()=>{
  const f=fixture();f.mode('live');const opening=f.model();f.input(f.rows[3].number,'.2');const gestureBasis=f.model();f.click('[data-view=plane]');
  pointer(f,'pointerdown',30,30,70);assert.notDeepEqual(f.model(),gestureBasis);pointer(f,'pointercancel',30,0,0);
  assert.equal(f.isOpen(),true);assert.deepEqual(f.model(),gestureBasis);f.click('.gcp-close');assert.deepEqual(f.model(),opening);
});

test('31 HDR and exact RGB/Alpha survive reopen, projection controls, no-op Apply and live cancel',()=>{
  const f=fixture(),raw=[2.23456789012345,-.123456789012345,.333333333333333,.456789012345678];
  raw.forEach((n,i)=>f.input(f.rows[i+3].number,String(n)));f.click('.gcp-apply');assert.deepEqual(f.model(),raw);const count=f.writes();
  f.open();for(const shape of ['circle','triangle','square']){f.click('[data-view=plane]');f.click(`[data-shape=${shape}]`);}f.click('[data-view=swatches]');
  f.click('.gcp-apply');assert.deepEqual(f.model(),raw);assert.equal(f.writes(),count);
  f.mode('live');f.input(f.rows[4].number,'.25');assert.deepEqual(f.model(),[raw[0],.25,raw[2],raw[3]]);f.key(f.rows[4].number,'Escape');assert.deepEqual(f.model(),raw);
});

test('32 RGB and RGBA local targets keep their exact shape and independent accepted values',()=>{
  const f=fixture();f.target('RGB');f.mode('live');f.input(f.q('.gcp-hex'),'#123456');assert.equal(f.model().length,3);f.outside();
  f.target('RGBA');assert.equal(f.model().length,4);assert.equal(f.hex(),'#AD7FFFE1');f.target('RGB');assert.deepEqual(f.model(),[18/255,52/255,86/255]);
});

test('33 session swatches survive draft cancellation; demo eyedropper writes no model value',()=>{
  const f=fixture();f.input(f.q('.gcp-hex'),'#12345678');f.click('.gcp-add');f.click('.gcp-eyedropper');assert.equal(f.q('.gcp-notice').hidden,false);assert.equal(f.writes(),0);
  f.click('.gcp-close');f.open();assert.equal(f.q('.gcp-saved').children[0].dataset.color,'#12345678');assert.equal(f.hex(),'#AD7FFFE1');
});

process.stdout.write('# Scope: actual color files + local model transitions + selector-aware DOM/canvas doubles; NOT browser/visual/CEF/product acceptance.\n');
