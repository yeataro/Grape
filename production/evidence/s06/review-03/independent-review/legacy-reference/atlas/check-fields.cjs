// Current static field references only. The 27 superseded picker checks are
// recorded historically; check-color.cjs qualifies the accepted new specimen.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const html=read('parts/fields.html'),manifest=JSON.parse(read('parts/fields-manifest.json'));
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
let count=0;const test=(name,fn)=>{fn();count++;console.log('PASS '+name);};
test('Static field IDs unique and manifest boards present',()=>{assert.equal(ids.length,new Set(ids).size);manifest.artboards.forEach(b=>assert(ids.includes(b.id)));});
test('Inline field, state and host range references retained',()=>{['fd-fields-reference','fd-field-states','fd-range-reference'].forEach(id=>assert(ids.includes(id)));});
test('Superseded picker and rejected numeric lab absent from field references',()=>{assert(!html.includes('fd-color-editor'));assert(!html.includes('fd-number-lab'));assert(!read('parts/fields.js').includes('initColor'));});
test('Current static references do not introduce native picker or product writes',()=>{assert(!/type="color"|fetch\(|WebSocket|localStorage/.test(html+read('parts/fields.js')));});
console.log(JSON.stringify({status:'PASS',checks:count,scope:'Static field reference checks only; color moved to check-color.cjs'}));
