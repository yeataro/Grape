import test from 'node:test';
import assert from 'node:assert/strict';
import {checkProduction} from './check-production-boundaries.mjs';
function fixture(role='module') {
  return {manifest:{version:1,scope:'production',files:{
    'contracts.ts':{owner:'contracts',role:'contracts',exports:{Spec:'contract'}},
    'model.ts':{owner:'graph',role:'model',exports:{read:'query',edit:'command',raw:'mutation'}},
    'private.ts':{owner:'graph',role:'model'},
    'feature.ts':{owner:'sample',role},
    'wire.ts':{owner:'boot',role:'bootstrap'}
  },registrationFiles:['wire.ts']},sources:{'contracts.ts':'export interface Spec {}','model.ts':'export const read=()=>0; export const edit=()=>{}; export const raw=()=>{};','private.ts':'export const secret=1;','feature.ts':"import type {Spec} from './contracts.ts';",'wire.ts':''}};
}
const run=f=>checkProduction(f.manifest,f.sources);
test('PB01 ordinary extension public contract works with no core edit',()=>{
  const f=fixture();assert.equal(checkProduction(f.manifest,f.sources,{extensionOwner:'sample',changedFiles:['feature.ts','wire.ts']}).status,'PASS');
});
for(const role of ['module','ui','generator','persistence'])test(`PB private internals denied to ${role}`,()=>{
  const f=fixture(role);f.sources['feature.ts']="import {secret} from './private.ts';";assert.ok(run(f).errors.some(e=>e.code==='PRIVATE_IMPORT'));
});
for(const role of ['generator','persistence','module'])test(`PB mutable/public Graph denied to ${role}`,()=>{
  const f=fixture(role);f.sources['feature.ts']="import {edit} from './model.ts';";assert.ok(run(f).errors.some(e=>e.code==='DEPENDENCY_DIRECTION'));
});
test('PB UI has public query/command but not raw mutation',()=>{
  const f=fixture('ui');f.sources['feature.ts']="import {read,edit} from './model.ts';";assert.equal(run(f).status,'PASS');
  f.sources['feature.ts']="import {raw} from './model.ts';";assert.ok(run(f).errors.some(e=>e.code==='CAPABILITY_DENIED'));
});
test('PB type-only private import is not an exemption',()=>{const f=fixture();f.sources['feature.ts']="import type {secret} from './private.ts';";assert.equal(run(f).status,'FAIL');});
test('PB unclassified new source fails closed',()=>{const f=fixture();f.sources['forgot.ts']='';assert.equal(run(f).status,'FAIL');});
test('PB alias/re-export/barrel cannot bypass private boundary',()=>{const f=fixture('ui');f.sources['feature.ts']="export {secret as x} from './private.ts';";assert.equal(run(f).status,'FAIL');});
test('PB namespace and dynamic imports cannot hide export rights',()=>{for(const code of ["import * as m from './model.ts';","import('./model.ts');"]){const f=fixture('ui');f.sources['feature.ts']=code;assert.equal(run(f).status,'FAIL');}});
test('PB Node/Electron values and types remain outside core',()=>{for(const code of ["import type {Stats} from 'node:fs';","import {ipcRenderer} from 'electron';",'globalThis.process.exit();']){const f=fixture('model');f.sources['feature.ts']=code;assert.equal(run(f).status,'FAIL');}});
test('PB ordinary extension core/switch modification rejected',()=>{const f=fixture();const r=checkProduction(f.manifest,f.sources,{extensionOwner:'sample',changedFiles:['feature.ts','model.ts']});assert.ok(r.errors.some(e=>e.code==='ORDINARY_EXTENSION_CORE_CHANGE'));});
test('PB missing public export is denied even when direction allowed',()=>{const f=fixture('ui');f.sources['feature.ts']="import {secret} from './model.ts';";assert.equal(run(f).status,'FAIL');});
test('PB one owner cannot relabel private files to bypass role matrix',()=>{const f=fixture();f.manifest.files['feature.ts'].owner='graph';assert.equal(run(f).status,'FAIL');});
test('PB18 bare builtin type import still leaks Node capability',()=>{const f=fixture('model');f.manifest.externals={'node:*':{runtimeRoles:['adapter','harness']}};f.sources['feature.ts']="import type {Stats} from 'fs';";assert.ok(run(f).errors.some(e=>e.code==='NATIVE_TYPE_OR_VALUE'));});
test('PB19 privileged loader does not grant cross-owner private access',()=>{const f=fixture('adapter');f.sources['feature.ts']="const m=await import('./private.ts');";assert.ok(run(f).errors.some(e=>e.code==='PRIVATE_IMPORT'));});
