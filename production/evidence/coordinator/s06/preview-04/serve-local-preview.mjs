import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import crypto from "node:crypto";
const config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const digest = b => crypto.createHash("sha256").update(b).digest("hex");
const checked = (p, row) => {
  const bytes = fs.readFileSync(p);
  if (!/^[a-f0-9]{64}$/.test(row.sha256) || bytes.length !== row.bytes || digest(bytes) !== row.sha256) throw Error("Identity mismatch: " + p);
  return bytes;
};
const contained = (root, p) => {
  const relative = path.relative(root, p);
  return relative !== "" && relative !== ".." && !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative);
};
if (config.address !== "127.0.0.1" || !Number.isInteger(config.port) || config.port < 1024 || config.port > 65535) throw Error("Local preview endpoint required");
if (!/^[a-zA-Z0-9._-]{1,100}$/.test(config.buildId)) throw Error("Invalid build identity");
for (const key of ["implementationI", "submittedR"]) if (!/^[a-f0-9]{40}$/.test(config[key])) throw Error("Invalid revision");
const manifest = JSON.parse(checked(config.buildManifest.file, config.buildManifest));
if (manifest.implementationI !== config.implementationI || manifest.buildId !== config.buildId) throw Error("Manifest identity mismatch");
const root = fs.realpathSync(config.previewRoot);
if (!contained(fs.realpathSync(".verification"), root)) throw Error("Isolated preview directory required");
const rows = [...manifest.files, ...config.extraFiles];
if (!rows.length || rows.length > 1000) throw Error("Invalid file count");
const files = new Map();
const types = {".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".txt":"text/plain; charset=utf-8",".zip":"application/zip",".png":"image/png",".svg":"image/svg+xml"};
let total = 0;
for (const row of rows) {
  if (!/^[A-Za-z0-9_-][A-Za-z0-9_./-]*$/.test(row.file) || row.file.split("/").some(s => !s || s === "." || s === "..")) throw Error("Invalid file route");
  if (!Number.isSafeInteger(row.bytes) || row.bytes < 0 || row.bytes > 16777216 || (total += row.bytes) > 100000000) throw Error("Invalid file size");
  const p = fs.realpathSync(path.resolve(root, row.file));
  if (!contained(root, p)) throw Error("Path escape");
  const route = "/" + row.file;
  if (files.has(route) || route === "/review.html" || route === "/_delivery.json") throw Error("Duplicate or reserved route");
  files.set(route, {bytes:checked(p, row), type:types[path.extname(p)] ?? "application/octet-stream"});
}
if (!files.has("/index.html") || !files.has("/START-HERE.html")) throw Error("Entry or guide missing");
files.set("/", files.get("/index.html"));
const identity = {mode:"LOCALHOST_CANDIDATE_PREVIEW",buildId:config.buildId,implementationI:config.implementationI,submittedR:config.submittedR,network:"LAN_TAILSCALE_NOT_REQUIRED_BY_OWNER",acceptance:"NO_ACCEPTANCE_CLAIM_BY_PREVIEW",files:rows};
const notes = JSON.parse(checked(config.changeNotes.file, config.changeNotes));
if (notes.implementationI !== config.implementationI || notes.buildId !== config.buildId) throw Error("Change notes identity mismatch");
const escapeHtml = text => String(text).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const validText = value => { if (typeof value !== "string" || value.length > 3000) throw Error("Invalid note text"); return escapeHtml(value); };
if (!Array.isArray(notes.sections) || notes.sections.length > 8) throw Error("Invalid notes sections");
const sections = notes.sections.map(section => {
  if (!Array.isArray(section.items) || section.items.length > 12) throw Error("Invalid notes items");
  return '<section><h3>'+validText(section.title)+'</h3><ul>'+section.items.map(item=>'<li>'+validText(item)+'</li>').join('')+'</ul></section>';
}).join('');
const wrapper = '<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Grape S06 · 本機預覽</title><style>*{box-sizing:border-box}html,body{height:100%;margin:0}body{display:flex;flex-direction:column;background:#14141c;color:rgba(255,255,255,.88);font:13px system-ui,sans-serif}header{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:9px 16px;border-bottom:1px solid rgba(255,255,255,.17)}header span{color:rgba(255,255,255,.6)}a{color:rgba(255,255,255,.82)}button{font:inherit;color:rgba(255,255,255,.9);border:1px solid rgba(255,255,255,.12);background:#2a2833;border-radius:7px;padding:8px 12px;cursor:pointer}button:hover{background:#35313f}button:focus-visible,a:focus-visible{outline:2px solid rgba(255,255,255,.8);outline-offset:3px}iframe{display:block;flex:1;width:100%;min-height:0;border:0}dialog{position:fixed;inset:0;margin:auto;width:min(480px,calc(100vw - 32px));max-height:calc(100dvh - 48px);padding:0;overflow:hidden;border:1px solid rgba(255,255,255,.28);border-radius:10px;background:#211f2a;color:rgba(255,255,255,.82);box-shadow:0 20px 70px #0008}dialog::backdrop{background:rgba(0,0,0,.68)}.notes-shell{display:flex;flex-direction:column;max-height:calc(100dvh - 50px)}.notes-head{flex:none;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px}h2{font-size:14px;margin:0;color:rgba(255,255,255,.96)}form{margin:0}.notes-body{min-height:0;overflow:auto;padding:0 16px 20px;line-height:1.7;overflow-wrap:anywhere}.version{margin:4px 0 12px;color:rgba(255,255,255,.5);font-size:12px}p{margin:0 0 14px}section{margin-top:20px}h3{font-size:13px;color:rgba(255,255,255,.9);margin:0 0 8px}ul{padding-left:20px;margin:0}li+li{margin-top:8px}.review-status{color:rgba(255,255,255,.6);font-size:12px}</style><header><strong>Grape · S06</strong><span>'+config.buildId+'</span><span>提交 '+config.submittedR.slice(0,7)+'</span><button id="open-notes" type="button" aria-haspopup="dialog">本輪更新</button><a href="/START-HERE.html" target="_blank" rel="noopener">操作說明與範例</a></header><iframe src="/" title="Grape S06 工作區"></iframe><dialog id="change-notes" aria-labelledby="notes-title"><div class="notes-shell"><div class="notes-head"><h2 id="notes-title">本輪更新</h2><form method="dialog"><button autofocus aria-label="關閉本輪更新">關閉</button></form></div><div class="notes-body" tabindex="0"><p class="version">'+escapeHtml(config.buildId)+' · 提交 '+config.submittedR.slice(0,7)+'</p><p>'+validText(notes.introduction)+'</p><p class="review-status">'+validText(notes.reviewStatus)+'</p>'+sections+'</div></div></dialog><script>const openNotes=document.getElementById("open-notes"),notesDialog=document.getElementById("change-notes");openNotes.addEventListener("click",()=>notesDialog.showModal());notesDialog.addEventListener("close",()=>openNotes.focus());</script></html>';

files.set("/review.html", {bytes:Buffer.from(wrapper),type:types[".html"]});
files.set("/_delivery.json", {bytes:Buffer.from(JSON.stringify(identity)),type:types[".json"]});
const server = http.createServer((req, res) => {
  const headers = {"Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"same-origin"};
  if (![`127.0.0.1:${config.port}`, `localhost:${config.port}`].includes(req.headers.host)) { res.writeHead(403,headers);res.end();return; }
  if (!["GET","HEAD"].includes(req.method)) { res.writeHead(405,{...headers,Allow:"GET, HEAD"});res.end();return; }
  let route; try {route=decodeURIComponent((req.url??"").split("?")[0]);} catch {res.writeHead(400,headers);res.end();return;}
  const file=files.get(route);
  if (!file) {res.writeHead(404,headers);res.end();return;}
  res.writeHead(200,{...headers,"Content-Type":file.type,"Content-Length":file.bytes.length});res.end(req.method==="HEAD"?undefined:file.bytes);
});
server.once("error",error=>{console.error(error);process.exitCode=1;});
server.listen(config.port,"127.0.0.1",()=>console.log(JSON.stringify({status:"RUNNING_LOCAL_VERIFIED_CANDIDATE",pid:process.pid,startedAt:new Date().toISOString(),address:server.address(),buildId:config.buildId,implementationI:config.implementationI,submittedR:config.submittedR,fileCount:files.size,wrapperSha256:digest(Buffer.from(wrapper))})));
for (const signal of ["SIGTERM","SIGINT"]) process.once(signal,()=>server.close(()=>process.exit(0)));

