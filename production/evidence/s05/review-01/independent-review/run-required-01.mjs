import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=process.cwd(), out=path.join(root,'.verification/s05-fresh-review-01');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const packetPath='C:/Users/user/source/Grape/production/evidence/coordinator/s05/review-01/reviewer-packet-01.json';
const packetBytes=fs.readFileSync(packetPath), packet=JSON.parse(packetBytes);
if(hash(packetBytes)!=='0221c9e458a24f7c54a02d24d2844458932616f6a0e3d4a35002542b90c456e8')throw Error('packet hash mismatch');
fs.writeFileSync(path.join(out,'reviewer-packet-01.json'),packetBytes,{flag:'wx'});
const sha=cmd=>{let r=spawnSync('git',cmd,{cwd:root,encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);return r.stdout.trim()};
if(sha(['rev-parse','HEAD'])!==packet.submittedHeadR)throw Error('wrong head');
const binding={packetHash:hash(packetBytes),head:sha(['rev-parse','HEAD']),status:sha(['status','--short']),refs:[],sourceFiles:[],evidenceFiles:[],protectedFiles:[],errors:[]};
function check(ref,scope='refs'){
 const p=path.join(root,ref.file);let b=fs.readFileSync(p);const actual={file:ref.file,sha256:hash(b),bytes:b.length};
 if(actual.sha256!==ref.sha256||(ref.bytes!==undefined&&actual.bytes!==ref.bytes))binding.errors.push({expected:ref,actual});
 binding[scope].push(actual);
 return b;
}
for(const ref of [...packet.acceptedDecisions,packet.authorizationRef,packet.submission,packet.build.manifest,packet.build.artifact,packet.sourceManifest,packet.evidenceManifest,packet.environment,packet.coverage,packet.execution,packet.reproduction,packet.contracts,packet.guide,packet.samples,...packet.inputRefs.filter(r=>fs.existsSync(path.join(root,r.file)))])check(ref);
for(const f of JSON.parse(fs.readFileSync(path.join(root,packet.sourceManifest.file))).files){check(f,'sourceFiles');for(const rev of [packet.implementationI,packet.submittedHeadR]){let r=spawnSync('git',['show',rev+':'+f.file],{cwd:root,maxBuffer:20*1024*1024});if(r.status!==0||hash(r.stdout)!==f.sha256)binding.errors.push({sourceGitMismatch:rev+':'+f.file,stderr:r.stderr.toString()});}}
for(const f of JSON.parse(fs.readFileSync(path.join(root,packet.evidenceManifest.file))).files)check(f,'evidenceFiles');
const protectedPaths=sha(['ls-tree','-r','--name-only',packet.acceptedMain]).split('\n').filter(p=>p.startsWith('handoff/')||p.startsWith('production/evidence/')||p==='HANDOFF_ACCEPTANCE.json');
for(const file of protectedPaths){const b=spawnSync('git',['show',packet.acceptedMain+':'+file],{cwd:root,maxBuffer:20*1024*1024});const before=hash(b.stdout), after=hash(fs.readFileSync(path.join(root,file)));if(before!==after)binding.errors.push({protectedMismatch:file,before,after});binding.protectedFiles.push({file,sha256:after});}
fs.writeFileSync(path.join(out,'binding-check-01.json'),JSON.stringify(binding,null,2));
console.log(JSON.stringify({refs:binding.refs.length,source:binding.sourceFiles.length,evidence:binding.evidenceFiles.length,protected:binding.protectedFiles.length,errors:binding.errors}));
const results=[];
function run(id,exe,args,cwd=root){const start=new Date().toISOString();const r=spawnSync(exe,args,{cwd,encoding:'utf8',maxBuffer:32*1024*1024,shell:exe==='npm.cmd'});fs.writeFileSync(path.join(out,id+'.log'),(r.stdout??'')+(r.stderr??''));let record={id,command:[exe,...args],cwd,start,end:new Date().toISOString(),exitCode:r.status,error:r.error?.message,log:id+'.log'};results.push(record);fs.writeFileSync(path.join(out,'required-checks-01.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(record));}
run('bootstrap-01',process.execPath,['tools/verify-bootstrap.mjs']);
run('state-01',process.execPath,['handoff/tools/check-implementation-state.mjs','--current']);
run('bootstrap-tests-01',process.execPath,['--test','--test-isolation=none','tools/verify-bootstrap.test.mjs']);
run('diff-check-raw-01','git',['diff','--check',packet.acceptedMain+'..HEAD']);
run('diff-check-product-01','git',['diff','--check',packet.acceptedMain+'..HEAD','--','production/src','production/apps','production/tests','production/tools','production/package.json','production/package-lock.json','production/conformance','README.md','implementation-state.json']);
for(const name of ['typecheck','conformance','test','build'])run(name+'-01','npm.cmd',['--prefix','production',...(name==='test'?['test']:['run',name])]);
