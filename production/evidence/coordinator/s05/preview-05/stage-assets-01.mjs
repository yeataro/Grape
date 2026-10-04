import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const repo=process.cwd(), base='production/evidence/s05/drag-performance-repair-01', dest=path.resolve('.verification/s05-human-preview-aa4c86e-01');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const readJSON=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const build=readJSON(base+'/build-manifest-01.json');
if(build.implementationI!=='aa4c86e20b0b4b54218b9992921578e7f24a28a2')throw Error('Wrong candidate');
const archive=fs.readFileSync(build.archive.file);
if(sha(archive)!=='8fefd2e02eb9d78610ae68c553926bd7ba6604769d306e810c2fc8dda5279a62'||archive.length!==73186)throw Error('Archive identity');
if(fs.existsSync(dest))throw Error('Existing preview stage must be reconciled, not overwritten');
const assetRows=build.files.map(r=>({...r,file:r.file.replace(/^production\/dist\//,'')}));
const allowed=new Set(['./','./assets/',...assetRows.map(r=>'./'+r.file)]);
const entries=execFileSync('tar',['-tzf',build.archive.file],{encoding:'utf8'}).trim().split(/\r?\n/);
if(entries.some(x=>!allowed.has(x))||entries.length!==allowed.size)throw Error('Unexpected archive contents');
fs.mkdirSync(dest,{recursive:false});
const staged=[];
function write(row,bytes,from){
 if(!/^[a-zA-Z0-9_-][a-zA-Z0-9_./-]*$/.test(row.file)||row.file.split('/').some(x=>!x||x==='.'||x==='..'))throw Error('Bad staged path');
 if(bytes.length!==row.bytes||sha(bytes)!==row.sha256)throw Error('Byte mismatch '+row.file);
 const target=path.resolve(dest,row.file);
 if(!target.startsWith(dest+path.sep))throw Error('Outside preview');
 fs.mkdirSync(path.dirname(target),{recursive:true}); fs.writeFileSync(target,bytes,{flag:'wx'});
 staged.push({...row,source:from});
}
for(const r of assetRows)write(r,execFileSync('tar',['-xOf',build.archive.file,'./'+r.file]),build.archive.file+'!/'+r.file);
for(const dir of ['samples','legacy-samples']){
 const manifest=readJSON(base+'/'+dir+'/manifest.json');
 for(const r of manifest.entries)write({file:dir+'/'+r.file,bytes:r.bytes,sha256:r.sha256},fs.readFileSync(base+'/'+dir+'/'+r.file),base+'/'+dir+'/'+r.file);
 const bytes=fs.readFileSync(base+'/'+dir+'/manifest.json');write({file:dir+'/manifest.json',bytes:bytes.length,sha256:sha(bytes)},bytes,base+'/'+dir+'/manifest.json');
}
const evidence=readJSON(base+'/evidence-manifest-01.json');
for(const name of ['fixture-4-Multiply.json','fixture-4-Image-output.json','fixture-14-Multiply.json','fixture-14-Image-output.json']){
 const source=base+'/performance-01/'+name, r=evidence.files.find(x=>x.file===source);if(!r)throw Error('Missing fixture manifest entry');
 write({file:'performance/'+name,bytes:r.bytes,sha256:r.sha256},fs.readFileSync(source),source);
}
const record={recordType:'REVIEWED_PREVIEW_ASSET_PREPARATION',recordedAt:new Date().toISOString(),status:'STAGED_NOT_DEPLOYED_REVIEW_PENDING',implementationI:build.implementationI,reviewedR:'6c3a734325d0db2d924356a9614e971d80a966c8',buildId:build.buildId,previewRoot:dest,archive:build.archive,files:staged,serviceStarted:false,existingServicesChanged:false,productAcceptance:'NOT_GRANTED'};
fs.writeFileSync('production/evidence/coordinator/s05/preview-05/asset-stage-01.json',JSON.stringify(record,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:record.status,files:staged.length,previewRoot:dest}));
