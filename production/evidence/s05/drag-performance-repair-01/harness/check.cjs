const fs=require('fs'),cp=require('child_process'),path=require('path');
const root='C:/Users/user/source/Grape',out=root+'/production/evidence/s05/drag-performance-repair-01/checks';fs.mkdirSync(out,{recursive:true});
const [label,cwd,...args]=process.argv.slice(2);if(!label||!cwd||!args.length)throw Error('label cwd nodeArgs');
const started=new Date().toISOString(),p=cp.spawnSync(process.execPath,args,{cwd,encoding:'utf8',maxBuffer:40e6,env:process.env});
fs.writeFileSync(out+'/'+label+'.log',p.stdout+'\n'+p.stderr,{flag:'wx'});fs.writeFileSync(out+'/'+label+'.json',JSON.stringify({started,ended:new Date().toISOString(),cwd,command:[process.execPath,...args],exitCode:p.status,error:p.error?String(p.error):null,stdoutFile:label+'.log'},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({label,exitCode:p.status,lastOutput:(p.stdout+p.stderr).slice(-1800)}));process.exitCode=p.status??1;
