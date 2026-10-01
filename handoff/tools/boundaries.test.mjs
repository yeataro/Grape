// THIS IS NOT THE PRODUCTION IMPLEMENTATION. Synthetic checker self-tests only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectSources,inspectManifest} from './check-boundaries.mjs';
import {fileURLToPath} from 'node:url';
const manifest=files=>({version:1,files,externals:{'node:*':{runtimeRoles:['adapter','harness']},electron:{runtimeRoles:['adapter']}}});
const codes=result=>result.errors.map(e=>e.code);

test('BOUNDARY-01 default handoff ownership manifest passes',()=>{
  const result=inspectManifest(fileURLToPath(new URL('../examples/conformance-manifest.json',import.meta.url)));
  // IH-005 adds one public contract, one test-only wire bridge and one feature-owned editable Panel.
  assert.equal(result.status,'passed',JSON.stringify(result.errors)); assert.equal(result.checkedFiles,42);
});
test('BOUNDARY-02 pure core cannot import UI runtime through a renamed folder',()=>{
  const result=inspectSources(manifest({'any/a.ts':'core','elsewhere/b.ts':'ui'}),{'any/a.ts':"import {show} from '../elsewhere/b.ts'; show();",'elsewhere/b.ts':'export function show() {}'});
  assert.ok(codes(result).includes('FORBIDDEN_RUNTIME_DEPENDENCY'));
});
test('BOUNDARY-03 direct Node and Electron imports cannot leak into application',()=>{
  for(const name of ['node:fs','fs','electron']) {
    const result=inspectSources(manifest({'a.ts':'application'}),{'a.ts':`import * as native from '${name}'; console.log(native);`});
    assert.ok(codes(result).includes('ENVIRONMENT_IMPORT'),name);
  }
});
test('BOUNDARY-04 core DOM/network/process globals fail, local document data remains valid',()=>{
  for(const code of ['document.title;','window.alert(1);','fetch("url");','process.cwd();','globalThis.document.title;','const env=globalThis; env.document.title;','const {document:doc}=globalThis;']) {
    assert.ok(codes(inspectSources(manifest({'a.ts':'core'}),{'a.ts':code})).includes('ENVIRONMENT_GLOBAL'),code);
  }
  const result=inspectSources(manifest({'a.ts':'core'}),{'a.ts':'export function name(document: {title:string}) { return document.title; } const x={document: 1};'});
  assert.equal(result.status,'passed',JSON.stringify(result.errors));
});
test('BOUNDARY-05 type-only imports are erased runtime dependencies and not rejected as native calls',()=>{
  const result=inspectSources(manifest({'a.ts':'core','b.ts':'adapter'}),{'a.ts':"import type {Description} from './b.ts'; import type {Stats} from 'node:fs'; export function identity(x:Description):Description { return x; }",'b.ts':'export interface Description {name:string}'});
  assert.equal(result.status,'passed',JSON.stringify(result.errors)); assert.ok(result.imports.every(x=>x.kind==='type'));
});
test('BOUNDARY-06 mixed import with an actual value keeps runtime direction checks',()=>{
  const result=inspectSources(manifest({'a.ts':'core','b.ts':'adapter'}),{'a.ts':"import {type Description, nativeCall} from './b.ts'; nativeCall();",'b.ts':'export interface Description {} export function nativeCall() {}'});
  assert.ok(codes(result).includes('FORBIDDEN_RUNTIME_DEPENDENCY'));
});
test('BOUNDARY-07 new unclassified source or external dependency fails closed',()=>{
  assert.ok(codes(inspectSources(manifest({}),{'new.ts':'export const x=1;'})).includes('UNCLASSIFIED_SOURCE'));
  assert.ok(codes(inspectSources(manifest({'a.ts':'core'}),{'a.ts':"import thing from 'unreviewed-package';"})).includes('UNCLASSIFIED_EXTERNAL_IMPORT'));
});
test('BOUNDARY-08 unresolved computed imports and source outside declared roots fail',()=>{
  assert.ok(codes(inspectSources(manifest({'a.ts':'module'}),{'a.ts':'const name="plugin"; import(name);'})).includes('UNRESOLVED_DYNAMIC_IMPORT'));
  assert.ok(codes(inspectSources(manifest({'a.ts':'module'}),{'a.ts':"export * from './missing.ts';"})).includes('UNRESOLVED_LOCAL_IMPORT'));
});
test('BOUNDARY-09 independent extension can use public pure contracts without core edits',()=>{
  const before='export interface NodeSpec {key:string}';
  const result=inspectSources(manifest({'public.ts':'contracts','extension.ts':'module'}),{'public.ts':before,'extension.ts':"import type {NodeSpec} from './public.ts'; export const definition:NodeSpec={key:'addition'};"});
  assert.equal(result.status,'passed'); assert.equal(before,'export interface NodeSpec {key:string}');
});
test('BOUNDARY-10 UI may use DOM; adapter may use native APIs without polluting the core',()=>{
  const result=inspectSources(manifest({'ui.ts':'ui','adapter.ts':'adapter'}),{'ui.ts':'document.createElement("div");','adapter.ts':"import fs from 'node:fs'; export const read=fs.readFileSync;"});
  assert.equal(result.status,'passed',JSON.stringify(result.errors));
});
test('BOUNDARY-11 export type and inline all-type imports remain type-only',()=>{
  const result=inspectSources(manifest({'a.ts':'core','b.ts':'ui'}),{'a.ts':"export type {View} from './b.ts'; import {type View} from './b.ts';",'b.ts':'export interface View {}'});
  assert.equal(result.status,'passed'); assert.equal(result.imports.length,2); assert.ok(result.imports.every(x=>x.kind==='type'));
});
test('BOUNDARY-12 Web Crypto bootstrap remains portable while computed environment lookup fails',()=>{
  assert.equal(inspectSources(manifest({'identity.ts':'core'}),{'identity.ts':'export const id=()=>globalThis.crypto.randomUUID();'}).status,'passed');
  assert.ok(codes(inspectSources(manifest({'a.ts':'core'}),{'a.ts':'const key="document"; globalThis[key];'})).includes('UNRESOLVED_ENVIRONMENT_ACCESS'));
});
test('BOUNDARY-13 import types in erased aliases still require classified resolvable sources',()=>{
  const good=inspectSources(manifest({'a.ts':'core','b.ts':'adapter'}),{'a.ts':"export type View=import('./b.ts').View;",'b.ts':'export interface View {}'});
  assert.equal(good.status,'passed'); assert.equal(good.imports[0].kind,'type');
  const missing=inspectSources(manifest({'a.ts':'core'}),{'a.ts':"export type View=import('./missing.ts').View;"});
  assert.ok(codes(missing).includes('UNRESOLVED_LOCAL_IMPORT'));
});
