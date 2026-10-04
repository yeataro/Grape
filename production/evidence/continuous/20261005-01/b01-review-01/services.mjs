import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {createServer} from '../../production/node_modules/vite/dist/node/index.js';
const out=path.dirname(fileURLToPath(import.meta.url)), root=path.resolve(out,'../..');
const metadata=JSON.parse(fs.readFileSync(path.join(root,'production/evidence/continuous/20261005-01/b01-workspace/build-01/metadata.json'),'utf8'));
const vite=await createServer({root:path.join(root,'production'),server:{host:'127.0.0.1',port:4237,strictPort:true},define:{__GRAPE_BUILD__:JSON.stringify(metadata)}});await vite.listen();
const archive=path.join(out,'archive');
const server=http.createServer((req,res)=>{try{const url=new URL(req.url,'http://127.0.0.1');const route=decodeURIComponent(url.pathname);if(route==='/preview'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><iframe src="/" style="border:0;width:100vw;height:100vh"></iframe>');return;}
let p=path.resolve(archive,'.'+(route==='/'?'/index.html':route));if(!p.startsWith(archive+path.sep))throw Error('Denied');if(!fs.existsSync(p)){res.statusCode=404;res.end('Missing');return;}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(p));}catch(e){res.statusCode=500;res.end(String(e));}});await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(4238,'127.0.0.1',resolve);});
fs.writeFileSync(path.join(out,'services-01.json'),JSON.stringify({pid:process.pid,source:'http://127.0.0.1:4237',archive:'http://127.0.0.1:4238',metadata},null,2)+'\n');console.log('Reviewer services ready on 4237 / 4238');
