// THIS IS NOT THE PRODUCTION IMPLEMENTATION.
// Static handoff boundary checker. A reviewed manifest supplies ownership; it cannot infer ownership.
import ts from '../executable-reference/node_modules/typescript/lib/typescript.js';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { dirname, resolve, relative, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const pureRoles = new Set(['contracts','core','module','generator','application']);
const roles = new Set([...pureRoles,'ui','adapter','harness']);
const nativeRoles = new Set(['adapter','harness']);
const runtimeEnvironmentNames = new Set([
  'document','window','navigator','localStorage','sessionStorage','indexedDB',
  'HTMLElement','HTMLCanvasElement','HTMLDivElement','HTMLInputElement','OffscreenCanvas',
  'Worker','SharedWorker','WebSocket','XMLHttpRequest','RTCPeerConnection','fetch',
  'process','Buffer','__dirname','__filename',
]);
const nodeNames = new Set(builtinModules.map(name => name.replace(/^node:/,'')));
const slash = p => p.replaceAll('\\','/');
const sourcePattern = /\.(?:[cm]?ts|tsx|[cm]?js|jsx)$/;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const isNode = name => name.startsWith('node:') || nodeNames.has(name);
const isElectron = name => name === 'electron' || name.startsWith('electron/');

function importIsTypeOnly(node) {
  if (ts.isImportDeclaration(node)) {
    const clause=node.importClause;
    if (!clause) return false;
    if (clause.isTypeOnly) return true;
    return !clause.name && !!clause.namedBindings && ts.isNamedImports(clause.namedBindings)
      && clause.namedBindings.elements.length > 0 && clause.namedBindings.elements.every(e=>e.isTypeOnly);
  }
  if (ts.isExportDeclaration(node)) {
    if (node.isTypeOnly) return true;
    return !!node.exportClause && ts.isNamedExports(node.exportClause)
      && node.exportClause.elements.length > 0 && node.exportClause.elements.every(e=>e.isTypeOnly);
  }
  return ts.isImportEqualsDeclaration(node) && node.isTypeOnly;
}

function resolveLocal(file,name,sources) {
  const path=posix.normalize(posix.join(posix.dirname(file),name));
  const candidates=[path];
  if (/\.(mjs|cjs|js)$/.test(path)) candidates.push(path.replace(/\.mjs$/,'.mts').replace(/\.cjs$/,'.cts').replace(/\.js$/,'.ts'),path.replace(/\.js$/,'.tsx'));
  if (!sourcePattern.test(path)) candidates.push(...['.ts','.tsx','.js','.mjs','.mts','.cts','.cjs','/index.ts','/index.js'].map(ext=>path+ext));
  return candidates.find(candidate=>Object.hasOwn(sources,candidate));
}

/** In-memory entry point used by negative fixtures; no production file is read. */
export function inspectSources(manifest, inputSources) {
  const sources=Object.fromEntries(Object.entries(inputSources).map(([p,s])=>[slash(posix.normalize(p)),s]));
  const errors=[], imports=[], environmentChecks=[];
  const add=(code,file,message,node,source)=>{
    const location=node&&source?source.getLineAndCharacterOfPosition(node.getStart(source)):null;
    errors.push({code,file,...(location?{line:location.line+1,column:location.character+1}:{}),message});
  };
  if (manifest.version!==1 || !manifest.files || typeof manifest.files!=='object' || Array.isArray(manifest.files))
    return {status:'failed',errors:[{code:'INVALID_MANIFEST',message:'Expected version 1 and an explicit files object'}],imports,environmentChecks,checkedFiles:0};
  for (const file of Object.keys(sources)) if (!Object.hasOwn(manifest.files,file)) add('UNCLASSIFIED_SOURCE',file,'Source has no reviewed ownership role');
  for (const [file,role] of Object.entries(manifest.files)) {
    if (!roles.has(role)) add('UNKNOWN_ROLE',file,'Unknown role: '+role);
    if (!Object.hasOwn(sources,file)) add('DECLARED_SOURCE_MISSING',file,'Role declaration is not in the inspected source roots');
  }
  const asts=new Map(Object.entries(sources).map(([file,text])=>[file,ts.createSourceFile('/'+file,text,ts.ScriptTarget.Latest,true,file.endsWith('x')?ts.ScriptKind.TSX:ts.ScriptKind.TS)]));
  // Symbol lookup is used only to distinguish local bindings from unbound environment globals.
  // noLib/noResolve keep fixture analysis deterministic and do not perform a product typecheck.
  const host={
    getSourceFile:name=>asts.get(name.replace(/^\//,'')),getDefaultLibFileName:()=>'',
    writeFile:()=>{},getCurrentDirectory:()=>'/','getDirectories':()=>[],
    fileExists:name=>asts.has(name.replace(/^\//,'')),readFile:name=>sources[name.replace(/^\//,'')],
    getCanonicalFileName:name=>name,useCaseSensitiveFileNames:()=>true,getNewLine:()=> '\n',
  };
  const program=ts.createProgram([...asts.keys()].map(x=>'/'+x),{noLib:true,noResolve:true,allowJs:true,target:ts.ScriptTarget.Latest,module:ts.ModuleKind.NodeNext},host);
  const checker=program.getTypeChecker();
  for (const [file,source] of asts) {
    const role=manifest.files[file];
    if (!roles.has(role)) continue;
    for (const d of source.parseDiagnostics??[]) add('SOURCE_PARSE_ERROR',file,ts.flattenDiagnosticMessageText(d.messageText,' '));
    const globalAliases=new Set(['globalThis','global']);
    const isLocal=id=>!!checker.getSymbolAtLocation(id)?.declarations?.some(d=>d.getSourceFile()===source && !ts.isImportSpecifier(d) && !ts.isImportClause(d) && !ts.isNamespaceImport(d));
    const isGlobalObject=n=>ts.isIdentifier(n)&&globalAliases.has(n.text)&&(n.text!=='globalThis'&&n.text!=='global'||!isLocal(n));
    const aliases=n=>{
      if (ts.isVariableDeclaration(n)&&ts.isIdentifier(n.name)&&n.initializer&&isGlobalObject(n.initializer)) globalAliases.add(n.name.text);
      ts.forEachChild(n,aliases);
    };
    aliases(source);
    function dependency(name,node,typeOnly=false) {
      const record={file,role,specifier:name,kind:typeOnly?'type':'runtime'}; imports.push(record);
      if (name.startsWith('.')) {
        const target=resolveLocal(file,name,sources); record.target=target??null;
        if (!target) return add('UNRESOLVED_LOCAL_IMPORT',file,'Imported source is outside declared/inspected roots or missing: '+name,node,source);
        const targetRole=manifest.files[target]; record.targetRole=targetRole??null;
        if (!roles.has(targetRole)) return add('UNCLASSIFIED_IMPORT',file,'Imported source has no valid role: '+target,node,source);
        if (!typeOnly && pureRoles.has(role) && ['ui','adapter','harness'].includes(targetRole))
          add('FORBIDDEN_RUNTIME_DEPENDENCY',file,role+' must not depend on '+targetRole+' runtime: '+target,node,source);
        if (!typeOnly && role==='ui' && targetRole==='harness') add('FORBIDDEN_RUNTIME_DEPENDENCY',file,'UI runtime cannot depend on a test/harness',node,source);
      } else {
        const declaration=manifest.externals?.[name] ?? (isNode(name)?manifest.externals?.['node:*']:undefined);
        if (!declaration) return add('UNCLASSIFIED_EXTERNAL_IMPORT',file,'External dependency is not declared: '+name,node,source);
        if (!typeOnly && (isNode(name)||isElectron(name)) && !nativeRoles.has(role))
          add('ENVIRONMENT_IMPORT',file,'Native runtime import requires an adapter or harness: '+name,node,source);
        if (!typeOnly && !declaration.runtimeRoles?.includes(role))
          add('EXTERNAL_ROLE_DENIED',file,'External dependency is not approved for role '+role+': '+name,node,source);
      }
    }
    const runtimeReference=id=>{
      const parent=id.parent;
      if ((ts.isPropertyAccessExpression(parent)&&parent.name===id) ||
          (ts.isPropertyAssignment(parent)&&parent.name===id) ||
          (ts.isMethodDeclaration(parent)&&parent.name===id) ||
          (ts.isBindingElement(parent)&&parent.propertyName===id) ||
          (ts.isVariableDeclaration(parent)&&parent.name===id) ||
          (ts.isParameter(parent)&&parent.name===id) ||
          (ts.isFunctionDeclaration(parent)&&parent.name===id) ||
          (ts.isClassDeclaration(parent)&&parent.name===id)) return false;
      return true;
    };
    const visit=node=>{
      if (ts.isImportDeclaration(node)||ts.isExportDeclaration(node)) {
        if (node.moduleSpecifier) {
          if (ts.isStringLiteralLike(node.moduleSpecifier)) dependency(node.moduleSpecifier.text,node,importIsTypeOnly(node));
          else add('UNRESOLVED_IMPORT',file,'Import/export specifier is not a literal',node,source);
        }
        return;
      }
      if (ts.isImportEqualsDeclaration(node)) {
        const expression=ts.isExternalModuleReference(node.moduleReference)?node.moduleReference.expression:null;
        if (expression&&ts.isStringLiteralLike(expression)) dependency(expression.text,node,importIsTypeOnly(node));
        else add('UNRESOLVED_IMPORT',file,'Import-equals must have a literal external module',node,source);
        return;
      }
      if (ts.isImportTypeNode(node)) return; // Recorded by the separate erased-type traversal below.
      if (ts.isTypeNode(node)||ts.isInterfaceDeclaration(node)||ts.isTypeAliasDeclaration(node)) return;
      if (ts.isCallExpression(node)&&(node.expression.kind===ts.SyntaxKind.ImportKeyword || ts.isIdentifier(node.expression)&&node.expression.text==='require')) {
        const arg=node.arguments[0];
        if (arg&&ts.isStringLiteralLike(arg)) dependency(arg.text,node);
        else add('UNRESOLVED_DYNAMIC_IMPORT',file,'Runtime imports/requires must be literal and classified',node,source);
      }
      if (pureRoles.has(role)) {
        if (ts.isIdentifier(node)&&runtimeEnvironmentNames.has(node.text)&&runtimeReference(node)&&!isLocal(node)) {
          add('ENVIRONMENT_GLOBAL',file,role+' directly reads environment global '+node.text,node,source);
          environmentChecks.push({file,global:node.text});
        }
        if ((ts.isPropertyAccessExpression(node)||ts.isElementAccessExpression(node))&&isGlobalObject(node.expression)) {
          const name=ts.isPropertyAccessExpression(node)?node.name.text:node.argumentExpression&&ts.isStringLiteralLike(node.argumentExpression)?node.argumentExpression.text:null;
          if (name===null) add('UNRESOLVED_ENVIRONMENT_ACCESS',file,'Computed global environment access needs a reviewed adapter',node,source);
          else if (runtimeEnvironmentNames.has(name)) add('ENVIRONMENT_GLOBAL',file,role+' reads global environment API '+name,node,source);
        }
        if (ts.isVariableDeclaration(node)&&ts.isObjectBindingPattern(node.name)&&node.initializer&&isGlobalObject(node.initializer)) {
          for (const element of node.name.elements) {
            const name=element.propertyName??element.name;
            if ((ts.isIdentifier(name)||ts.isStringLiteralLike(name))&&runtimeEnvironmentNames.has(name.text)) add('ENVIRONMENT_GLOBAL',file,role+' destructures global environment API '+name.text,element,source);
          }
        }
      }
      ts.forEachChild(node,visit);
    };
    const visitTypes=node=>{
      if (ts.isImportTypeNode(node)) {
        if (ts.isLiteralTypeNode(node.argument)&&ts.isStringLiteralLike(node.argument.literal)) dependency(node.argument.literal.text,node,true);
        else add('UNRESOLVED_TYPE_IMPORT',file,'Import type is not a literal',node,source);
      }
      ts.forEachChild(node,visitTypes);
    };
    visitTypes(source);
    visit(source);
  }
  return {status:errors.length?'failed':'passed',scope:manifest.scope??'explicit manifest roots',checkedFiles:Object.keys(sources).length,errors,imports,environmentChecks,
    claim:'Checks declared runtime dependency direction and common environment leakage only; not behavioral compatibility, transaction correctness, security isolation or production readiness.'};
}

export function inspectManifest(manifestPath) {
  const bytes=readFileSync(manifestPath),manifest=JSON.parse(bytes);
  if (!Array.isArray(manifest.roots)||manifest.roots.length===0) throw new Error('Manifest must declare at least one inspected source root');
  const root=resolve(dirname(manifestPath),manifest.base??'.');
  const sources={},scanErrors=[];
  const ignored=new Set(manifest.ignoreDirectories??['node_modules','.git']);
  const excluded=name=>(manifest.excludeBasenames??[]).includes(name)||(manifest.excludeSuffixes??[]).some(suffix=>name.endsWith(suffix));
  const read=(path,recursive)=>{
    for (const entry of readdirSync(path,{withFileTypes:true})) {
      const full=resolve(path,entry.name);
      if (entry.isDirectory()&&ignored.has(entry.name)) continue;
      if (entry.isSymbolicLink()) {scanErrors.push({code:'UNRESOLVED_SYMLINK',file:slash(relative(root,full)),message:'Symlink in inspected roots requires an explicit non-aliased source root'});continue;}
      if (entry.isDirectory()) {if(recursive)read(full,true);continue;}
      if (sourcePattern.test(entry.name)&&!excluded(entry.name)) sources[slash(relative(root,full))]=readFileSync(full,'utf8');
    }
  };
  for (const entry of manifest.roots??[]) {
    const path=resolve(root,entry.path);
    if (!statSync(path).isDirectory()) throw new Error('Manifest root must be a directory: '+entry.path);
    read(path,entry.recursive!==false);
  }
  const result=inspectSources(manifest,sources);
  result.errors.unshift(...scanErrors); if(scanErrors.length)result.status='failed';
  return {...result,manifest:resolve(manifestPath),manifestSha256:hash(bytes),sourceHashes:Object.fromEntries(Object.entries(sources).map(([file,text])=>[file,hash(text)]))};
}

if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const args=process.argv.slice(2);
    if (args.length && (args.length!==2||args[0]!=='--manifest')) throw new Error('Usage: node tools/check-boundaries.mjs [--manifest path]');
    const path=args.length?resolve(args[1]):fileURLToPath(new URL('../examples/conformance-manifest.json',import.meta.url));
    const result=inspectManifest(path); console.log(JSON.stringify(result,null,2)); process.exitCode=result.status==='passed'?0:1;
  } catch(error) {
    console.error(JSON.stringify({status:'failed',errors:[{code:'CHECKER_INPUT_OR_TOOLING',message:String(error.message??error)}]},null,2)); process.exitCode=1;
  }
}
