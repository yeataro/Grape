import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';

// A same-machine exploratory preview. The full PASS-gated delivery helper remains unchanged.
// This entry cannot bind LAN/Tailscale and cannot represent its preserved BLOCKED report as PASS.
const config = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const checked = (file, expected, bytes) => {
  const data = fs.readFileSync(file);
  if (!/^[a-f0-9]{64}$/.test(expected) || sha(data) !== expected || bytes !== undefined && data.length !== bytes) throw Error('Identity mismatch: ' + file);
  return data;
};
const json = row => JSON.parse(checked(row.file, row.sha256, row.bytes));
const within = (root, file) => {
  const rel = path.relative(root, file);
  return rel !== '' && !path.isAbsolute(rel) && rel !== '..' && !rel.startsWith('..' + path.sep);
};
if (config.address !== '127.0.0.1' || !Number.isInteger(config.port) || config.port < 1024 || config.port > 65535) throw Error('Local-only endpoint required');
for (const key of ['implementationI', 'reviewedR']) if (!/^[a-f0-9]{40}$/.test(config[key])) throw Error('Invalid revision');
if (!/^[A-Za-z0-9._-]{1,100}$/.test(config.buildId)) throw Error('Invalid build ID');
const report = json(config.originalReview);
if (report.verdict !== 'BLOCKED' || report.reviewedI !== config.implementationI || report.reviewedR !== config.reviewedR || report.remainingFindings.length !== 0) throw Error('Unexpected review state');
if (report.requiredEvidenceGaps.length !== 1 || report.requiredEvidenceGaps[0].id !== 'S05-DRAG-FR-GAP-001' || report.requiredEvidenceGaps[0].classification !== 'WF_PERMISSION') throw Error('Unexpected required gap');
const assessment = json(config.localAssessment);
if (assessment.localPreviewEligible !== true || assessment.overallReviewVerdict !== 'BLOCKED' || assessment.reviewedI !== config.implementationI || assessment.reviewedR !== config.reviewedR) throw Error('Original-author local assessment required');
const manifest = json(config.buildManifest);
if (manifest.implementationI !== config.implementationI || manifest.files.length !== 3) throw Error('Build mismatch');
const root = fs.realpathSync(config.previewRoot);
if (!within(fs.realpathSync('.verification'), root)) throw Error('Isolated preview root required');
const assets = manifest.files.map(f => {
  if (!f.file.startsWith('production/dist/')) throw Error('Artifact path mismatch');
  return {...f, file: f.file.slice('production/dist/'.length)};
});
const rows = [...assets, ...config.samples];
if (rows.length > 1000) throw Error('File count bound');
const files = new Map();
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8','.zip':'application/zip'};
let total = 0;
for (const row of rows) {
  if (!/^[A-Za-z0-9_-][A-Za-z0-9_./-]*$/.test(row.file) || row.file.split('/').some(p => p === '.' || p === '..' || p === '')) throw Error('Invalid path');
  if (!Number.isSafeInteger(row.bytes) || row.bytes < 0 || row.bytes > 16777216 || (total += row.bytes) > 100000000) throw Error('File size bound');
  const file = fs.realpathSync(path.resolve(root, row.file));
  if (!within(root, file)) throw Error('Path escape');
  const route = '/' + row.file;
  if (files.has(route) || route === '/review.html' || route === '/_delivery.json') throw Error('Duplicate/reserved route');
  files.set(route, {bytes:checked(file, row.sha256, row.bytes), type:types[path.extname(file)] ?? 'application/octet-stream'});
}
if (!files.has('/index.html')) throw Error('Product entry absent');
files.set('/', files.get('/index.html'));
const identity = {mode:'LOCAL_ONLY_ENGINEERING_PREVIEW',buildId:config.buildId,implementationI:config.implementationI,reviewedR:config.reviewedR,overallReviewVerdict:'BLOCKED',networkChecks:'LAN_TAILSCALE_NOT_EXECUTED_PERMISSION_PENDING',productAcceptance:'NOT_GRANTED',originalReviewSha256:config.originalReview.sha256,localAssessmentSha256:config.localAssessment.sha256,files:rows};
const wrapper = `<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Grape S05 · 本機測試</title><style>*{box-sizing:border-box}html,body{height:100%;margin:0}body{display:flex;flex-direction:column;background:#111827;color:#f3f4f6;font:14px system-ui,sans-serif}header{display:flex;align-items:center;gap:18px;flex-wrap:wrap;padding:12px 18px;border-bottom:1px solid #475569}header a{color:#c4b5fd}.status{color:#fde68a;font-size:12px}iframe{display:block;flex:1;width:100%;min-height:0;border:0}</style><header aria-label="目前部署版本"><strong>Grape · S05</strong><span>${config.buildId}</span><span>受審版本 ${config.reviewedR.slice(0,7)}</span><a href="/START-HERE.html" target="_blank" rel="noopener">測試說明與範例</a><span class="status">本機工程試用 · 審查 BLOCKED：LAN／Tailscale 待驗證 · 尚未驗收</span></header><iframe src="/" title="Grape S05 本機測試畫面"></iframe></html>`;
files.set('/review.html', {bytes:Buffer.from(wrapper),type:types['.html']});
files.set('/_delivery.json', {bytes:Buffer.from(JSON.stringify(identity)),type:types['.json']});
const server = http.createServer((req,res) => {
  const headers = {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'};
  if (req.headers.host !== `127.0.0.1:${config.port}` && req.headers.host !== `localhost:${config.port}`) {res.writeHead(403,headers);res.end();return;}
  if (req.method !== 'GET' && req.method !== 'HEAD') {res.writeHead(405,{...headers,Allow:'GET, HEAD'});res.end();return;}
  let route;try {route=decodeURIComponent((req.url ?? '').split('?')[0]);} catch {res.writeHead(400,headers);res.end();return;}
  const f=files.get(route);if(!f){res.writeHead(404,headers);res.end();return;}
  res.writeHead(200,{...headers,'Content-Type':f.type,'Content-Length':f.bytes.length});res.end(req.method==='HEAD'?undefined:f.bytes);
});
server.once('error',error=>{console.error(error);process.exitCode=1;});
server.listen(config.port,'127.0.0.1',()=>console.log(JSON.stringify({status:'RUNNING_LOCAL_ONLY_VERIFIED_BYTES',pid:process.pid,startedAt:new Date().toISOString(),address:server.address(),url:`http://127.0.0.1:${config.port}/review.html`,guide:`http://127.0.0.1:${config.port}/START-HERE.html`,identity,wrapperSha256:sha(Buffer.from(wrapper))})));
for (const signal of ['SIGTERM','SIGINT']) process.once(signal,()=>server.close(()=>process.exit(0)));
