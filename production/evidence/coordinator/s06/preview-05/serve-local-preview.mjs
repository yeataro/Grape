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
const wrapper = '<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Grape S06 · 本機預覽</title><style>html,body{height:100%;margin:0;background:#14141c}iframe{display:block;width:100%;height:100%;border:0}</style><iframe src="/" title="Grape S06 工作區"></iframe></html>';

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

