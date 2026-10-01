// Read-only repository packaging checks. No product implementation or Gate qualification.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
export const repositoryRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');

export function indexedPaths(handoffRoot){
  const index=JSON.parse(fs.readFileSync(path.join(handoffRoot,'HANDOFF_FILE_INDEX.json'),'utf8'));
  const seen=new Set();
  for(const f of index.files){
    if(typeof f.path!=='string'||f.path.startsWith('/')||/[\\:]/.test(f.path)||f.path.split('/').some(x=>!x||x==='.'||x==='..')||seen.has(f.path))throw Error('Unsafe/duplicate indexed path');
    seen.add(f.path);
  }
  return {index,files:[...seen,'HANDOFF_FILE_INDEX.json']};
}
function enumerate(dir,prefix=''){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
    if(e.isSymbolicLink())throw Error('Frozen tree may not contain symlinks: '+prefix+e.name);
    return e.isDirectory()?enumerate(path.join(dir,e.name),prefix+e.name+'/'):[prefix+e.name];
  }).sort();
}

export async function verifyBootstrap(root=repositoryRoot,{runExistingChecks=true}={}){
  root=path.resolve(root);const errors=[];let checks=0;
  const check=(ok,message)=>{checks++;if(!ok)errors.push(message);};
  const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
  const required=['AGENTS.md','README.md','implementation-state.json','HANDOFF_ACCEPTANCE.json','.gitignore','.gitattributes','tools/verify-handoff.mjs'];
  for(const p of required)check(fs.existsSync(path.join(root,p)),'Missing root entry '+p);
  if(errors.length)return {status:'FAIL',checks,errors};
  const accepted=read('HANDOFF_ACCEPTANCE.json'),handoff=path.join(root,'handoff');
  const {index,files}=indexedPaths(handoff);
  check(accepted.acceptedBaseline.revision==='IH-005'&&index.packageId==='IH-005','Accepted revision');
  check(accepted.acceptedBaseline.index==='handoff/HANDOFF_FILE_INDEX.json','Index locator');
  check(sha256(fs.readFileSync(path.join(handoff,'HANDOFF_FILE_INDEX.json')))===accepted.acceptedBaseline.indexSha256,'Accepted index digest changed');
  check(index.files.length===411&&accepted.acceptedBaseline.indexedFiles===411,'Indexed membership count');
  check(JSON.stringify(enumerate(handoff))===JSON.stringify(files.sort()),'Frozen membership changed; no dependencies/scratch or extra files allowed');
  for(const f of index.files)check(fs.existsSync(path.join(handoff,f.path))&&sha256(fs.readFileSync(path.join(handoff,f.path)))===f.sha256,'Frozen bytes changed '+f.path);
  const format=accepted.acceptedBaseline.canonicalWritableFormat;
  check(format.format==='grape.document'&&format.major===2&&format.minor===0,'Writable format must be grape.document2.0');
  check(accepted.acceptance.independentTargetedVerdict==='PASS','Accepted targeted verdict');
  for(const k of ['blockers','majors','minors','s01ArchitectureDecisionsStillToInvent','s01BlockingExternalInformation'])check(Array.isArray(accepted.acceptance[k])&&accepted.acceptance[k].length===0,'Owner acceptance facts '+k);
  check(accepted.initialAuthorization.productionImplementationStarted===false&&accepted.initialAuthorization.s01Authorized===false&&accepted.initialAuthorization.authorizedSlices.length===0,'Bootstrap must not authorize production');
  const template=read('handoff/implementation-state.json'),current=read('implementation-state.json');
  check(current.recordRole==='current'&&current.handoffRevision==='IH-005','Current record identity');
  check(current.currentRecord==='../implementation-state.json','Preserve accepted Handoff-relative locator');
  if(current.status==='not-started')check(JSON.stringify({...current,recordRole:'handoff-template'})===JSON.stringify(template),'Not-started record must materialize unchanged template except recordRole');
  // Only import the already verified immutable checker. It performs no write at import.
  let stateReport=null;
  if(!errors.length){
    const {validateImplementationState}=await import(pathToFileURL(path.join(handoff,'tools/check-implementation-state.mjs')).href);
    stateReport=validateImplementationState(current,{slices:read('handoff/data/slices.json').slices,gates:read('handoff/data/gates.json').gates},p=>fs.readFileSync(path.resolve(root,p)));
    check(stateReport.status==='CURRENT_RECORD_VALID','Current-state validation: '+stateReport.errors.join('; '));
  }
  const mixed=read('handoff/data/gates.json').gates.find(g=>g.id==='G-MIXED-HISTORY');
  const cap=read('handoff/data/capability-coverage.json').entries.find(c=>c.capabilityId==='LC-UI-100');
  check(mixed.status==='DEFERRED_BY_PRODUCT_DECISION'&&cap.effectiveProductDisposition===mixed.status,'Inherited Mixed History deferral');
  check(read('handoff/data/gates.json').gates.find(g=>g.id==='G-LU-UI-009').status==='unresolved','Retain unresolved lifetime evidence Gate');
  const decision=read('handoff/provenance/product-decisions/DEC-GRAPE-001.json');
  check(decision.id==='DEC-GRAPE-001'&&decision.status==='accepted','Inherited owner decision');
  check(JSON.stringify(accepted.inheritedProductDecisions)==='["DEC-GRAPE-001"]','Accepted baseline decision reference');
  check(fs.readFileSync(path.join(root,'.gitattributes'),'utf8').split(/\r?\n/).some(x=>x.trim()==='handoff/** -text'),'Frozen Git byte preservation');
  for(const p of ['README.md','AGENTS.md']){
    const text=fs.readFileSync(path.join(root,p),'utf8');
    for(const m of text.matchAll(/\]\(([^)]+)\)/g)){
      const target=m[1].split('#')[0];if(!target||/^(https?:|mailto:)/.test(target))continue;
      const full=path.resolve(root,target);check(full.startsWith(root+path.sep)&&fs.existsSync(full),p+' broken/outside navigation '+target);
    }
  }
  const commands=[];
  if(runExistingChecks&&!errors.length){
    const plans=[['check-handoff.mjs'],['check-ih005.mjs','--verify-index'],['check-repair.mjs'],['check-second-review.mjs'],['check-final-review-repair.mjs'],['check-implementation-state.mjs'],['check-implementation-state.mjs','--current']];
    for(const [file,...args] of plans){
      const run=spawnSync(process.execPath,[path.join(handoff,'tools',file),...args],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});
      let result;try{result=JSON.parse(run.stdout);}catch{result={stdout:run.stdout,stderr:run.stderr};}
      commands.push({command:'node handoff/tools/'+file+(args.length?' '+args.join(' '):''),exitCode:run.status,status:result.status,checks:result.checks,errors:result.errors??result.failures??[]});
      check(run.status===0,'Relocated check failed '+file+' '+args.join(' '));
    }
  }
  return {status:errors.length?'FAIL':'PASS',scope:'Read-only bootstrap/integrity/navigation and state checks, not full qualification or S01 authorization',checks,errors,indexedFiles:index.files.length,frozenFiles:files.length,acceptedRevision:'IH-005',canonicalFormat:'grape.document 2.0',currentState:current.status,activeSlices:current.activeSlices,currentRecordValidation:stateReport?.status,commands};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{const result=await verifyBootstrap();console.log(JSON.stringify(result,null,2));process.exitCode=result.status==='PASS'?0:1;}
  catch(error){console.error(JSON.stringify({status:'FAIL',error:String(error)},null,2));process.exitCode=1;}
}
