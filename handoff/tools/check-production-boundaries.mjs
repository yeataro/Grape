// Qualification of a production dependency policy, NOT a production codebase.
import ts from '../executable-reference/node_modules/typescript/lib/typescript.js';
import {inspectSources} from './check-boundaries.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {builtinModules} from 'node:module';

export const dependencies = Object.freeze({
  contracts: [], definitions: ['contracts'], model: ['contracts','definitions'],
  module: ['contracts'], generator: ['contracts','definitions'], persistence: ['contracts'],
  application: ['contracts','definitions','model','generator','persistence','host'],
  ui: ['contracts','application','model'], host: ['contracts'],
  adapter: ['contracts','host','persistence'], bootstrap: ['*'], test: ['*']
});
const legacyRole = role => ({definitions:'core',model:'core',persistence:'core',host:'application',bootstrap:'harness',test:'harness'})[role] ?? role;
const consumers = {query:['ui','application'],command:['ui','application'],mutation:['model'],snapshot:['generator','persistence','application'],contract:['*'],service:['application','adapter'],environment:['adapter','bootstrap','test']};
const normalize = x=>x.replaceAll('\\','/');
const builtins=new Set(builtinModules.map(x=>x.replace(/^node:/,'')));

/** Manifest ownership/public exports are reviewed inputs, not inferred from filenames. */
export function checkProduction(manifest,sources,changeSet) {
  const errors=[];const fail=(code,file,message)=>errors.push({code,file,message});
  const files=manifest.files??{};
  if(manifest.version!==1||manifest.scope!=='production')fail('MANIFEST','', 'Expected production policy v1');
  for(const [file,entry] of Object.entries(files)) {
    if(!entry.owner||!Object.hasOwn(dependencies,entry.role))fail('OWNER',file,'Unknown/missing subsystem owner or role');
    for(const rights of Object.values(entry.exports??{}))if(!Object.hasOwn(consumers,rights))fail('SURFACE',file,'Unknown public export rights');
  }
  const ownership=new Map();
  for(const e of Object.values(files)) {
    if(ownership.has(e.owner)&&ownership.get(e.owner)!==e.role)fail('OWNER_ROLE','', 'One subsystem cannot claim several roles');
    ownership.set(e.owner,e.role);
  }
  const generic=inspectSources({version:1,files:Object.fromEntries(Object.entries(files).map(([p,e])=>[p,legacyRole(e.role)])),externals:manifest.externals??{}},sources);
  errors.push(...generic.errors);
  const imports=generic.imports;
  const local=(file,spec)=>imports.find(x=>x.file===file&&x.specifier===spec)?.target;
  for(const [file,text] of Object.entries(sources)) {
    const from=files[file];if(!from)continue;
    const ast=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true);
    function check(spec,names) {
      const dest=local(file,spec);
      if(!dest) {
        if((/^(node:|electron(?:\/|$))/.test(spec)||builtins.has(spec))&&!['adapter','bootstrap','test'].includes(from.role))fail('NATIVE_TYPE_OR_VALUE',file,spec);
        return;
      }
      const to=files[dest];if(!to||from.owner===to.owner)return;
      const allowed=dependencies[from.role]??[];
      if(!allowed.includes('*')&&!allowed.includes(to.role))fail('DEPENDENCY_DIRECTION',file,`${from.role} -> ${to.role}`);
      if(!to.exports) {fail('PRIVATE_IMPORT',file, dest);return;}
      if(!names||names.length===0){fail('EXPLICIT_PUBLIC_IMPORT_REQUIRED',file,spec);return;}
      for(const name of names) {
        const rights=to.exports[name];
        if(!rights){fail('UNEXPORTED_SYMBOL',file,`${dest}#${name}`);continue;}
        const permitted=consumers[rights]??[];
        if(!['bootstrap','test'].includes(from.role)&&!permitted.includes('*')&&!permitted.includes(from.role))fail('CAPABILITY_DENIED',file,`${name} grants ${rights}, denied to ${from.role}`);
      }
    }
    function visit(n) {
      if(ts.isImportDeclaration(n)&&ts.isStringLiteralLike(n.moduleSpecifier)) {
        const c=n.importClause;const names=[];
        if(c?.name)names.push('default');
        if(c?.namedBindings&&ts.isNamedImports(c.namedBindings))for(const e of c.namedBindings.elements)names.push((e.propertyName??e.name).text);
        check(n.moduleSpecifier.text,c?.namedBindings&&ts.isNamespaceImport(c.namedBindings)?null:names);
      } else if(ts.isExportDeclaration(n)&&n.moduleSpecifier&&ts.isStringLiteralLike(n.moduleSpecifier)) {
        check(n.moduleSpecifier.text,n.exportClause&&ts.isNamedExports(n.exportClause)?n.exportClause.elements.map(e=>(e.propertyName??e.name).text):null);
      } else if(ts.isImportTypeNode(n)&&ts.isLiteralTypeNode(n.argument)&&ts.isStringLiteralLike(n.argument.literal)) {
        check(n.argument.literal.text,n.qualifier&&ts.isIdentifier(n.qualifier)?[n.qualifier.text]:null);
      } else if(ts.isCallExpression(n)&&(n.expression.kind===ts.SyntaxKind.ImportKeyword||ts.isIdentifier(n.expression)&&n.expression.text==='require')) {
        // Dynamic loading is the bootstrap/adapter boundary, not an escape hatch for extensions.
        if(!['bootstrap','adapter','test'].includes(from.role))fail('DYNAMIC_LOADER',file,'Use explicit public static imports');
        const spec=n.arguments[0];
        if(spec&&ts.isStringLiteralLike(spec))check(spec.text,null);
      } else if(ts.isImportEqualsDeclaration(n))fail('IMPORT_EQUALS',file,'Use explicit public named imports');
      ts.forEachChild(n,visit);
    }
    visit(ast);
  }
  if(changeSet)for(const file of changeSet.changedFiles??[]) {
    const e=files[file];
    const wiring=(manifest.registrationFiles??[]).includes(file)&&e?.role==='bootstrap';
    if(!e||e.owner!==changeSet.extensionOwner&&!wiring)fail('ORDINARY_EXTENSION_CORE_CHANGE',file,'Ordinary extension may change only its subsystem and declared bootstrap registration');
  }
  return {status:errors.length?'FAIL':'PASS',errors,checkedFiles:Object.keys(sources).length,
    limits:['Manifest role and public-export correctness require review.','No security sandbox or proof of callback purity; injected service surface and behavioral tests still enforce runtime authority.','Does not prove absence of arbitrary aliases/casts/reflection or semantic node-name switches. Changes to core by an ordinary extension are independently rejected.']};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const [, ,flag,filename]=process.argv;
  if(flag!=='--manifest'||!filename)throw Error('Usage: node tools/check-production-boundaries.mjs --manifest production-manifest.json');
  const manifest=JSON.parse(fs.readFileSync(filename,'utf8'));const base=path.resolve(path.dirname(filename),manifest.base??'.');
  const sources={};
  function scan(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    if(e.isSymbolicLink())throw Error('Unreviewed symlink');
    if(e.isDirectory()){if(!['node_modules','.git'].includes(e.name))scan(path.join(dir,e.name));}
    else if(/\.(?:[cm]?[jt]sx?)$/.test(e.name))sources[normalize(path.relative(base,path.join(dir,e.name)))]=fs.readFileSync(path.join(dir,e.name),'utf8');
  }}
  if(!Array.isArray(manifest.roots)||manifest.roots.length===0)throw Error('Inspected production source roots required');
  for(const root of manifest.roots)scan(path.resolve(base,root));
  const result=checkProduction(manifest,sources,manifest.changeSet);console.log(JSON.stringify(result,null,2));process.exitCode=result.status==='PASS'?0:1;
}
