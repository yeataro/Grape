import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';

const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const inside = (base, file) => {
  const relative = path.relative(base, file);
  return relative !== '' && !path.isAbsolute(relative) && relative !== '..' && !relative.startsWith('..' + path.sep);
};
const checkedJSON = (file, expected) => {
  const bytes = fs.readFileSync(file);
  if (!/^[a-f0-9]{64}$/.test(expected) || digest(bytes) !== expected) throw Error('Evidence digest mismatch');
  return JSON.parse(bytes.toString('utf8'));
};
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mime = file => ({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'}[path.extname(file)] ?? 'application/octet-stream');

// Deployment helper only: preload verified bytes, never expose filesystem paths or live source.
export function prepareReviewedPreview(config) {
  if (!/^S\d{2}$/.test(config.sliceId) || !/^[A-Za-z0-9._-]{1,100}$/.test(config.buildId)) throw Error('Invalid display identity');
  for (const value of [config.implementationI, config.reviewedR]) if (!/^[a-f0-9]{40}$/.test(value)) throw Error('Invalid revision');
  const report = checkedJSON(config.reviewReport, config.reviewSha256);
  if (report.verdict !== 'PASS' || report.reviewedI !== config.implementationI || report.reviewedR !== config.reviewedR || !Array.isArray(report.remainingFindings) || report.remainingFindings.length || !Array.isArray(report.requiredEvidenceGaps) || report.requiredEvidenceGaps.length) throw Error('Exact independent PASS required');
  const manifest = checkedJSON(config.buildManifest, config.buildManifestSha256);
  if (manifest.implementationI !== config.implementationI || !Array.isArray(manifest.files) || !manifest.files.length || manifest.files.length > 1000) throw Error('Build identity mismatch');
  const verificationRoot = fs.realpathSync(path.resolve('.verification'));
  const root = fs.realpathSync(config.previewRoot);
  if (!inside(verificationRoot, root)) throw Error('Preview root must be isolated under .verification');
  const prefix = config.manifestFilePrefix ?? 'production/dist/';
  const assets = manifest.files.map(row => {
    if (!row.file.startsWith(prefix)) throw Error('Unexpected artifact path');
    return {file: row.file.slice(prefix.length), sha256: row.sha256, bytes: row.bytes};
  });
  const rows = [...assets, ...(config.samples ?? [])];
  if (rows.length > 1100) throw Error('Too many files');
  const files = new Map();
  let total = 0;
  for (const row of rows) {
    if (!/^[A-Za-z0-9_-][A-Za-z0-9_./-]*$/.test(row.file) || row.file.split('/').some(s => s === '.' || s === '..' || s === '') || !/^[a-f0-9]{64}$/.test(row.sha256)) throw Error('Invalid declared file');
    if (!Number.isSafeInteger(row.bytes) || row.bytes < 0 || row.bytes > 16777216) throw Error('File size bound');
    total += row.bytes;
    if (total > 100000000) throw Error('Total size bound');
    const resolved = fs.realpathSync(path.resolve(root, row.file));
    if (!inside(root, resolved)) throw Error('File escapes preview root');
    const bytes = fs.readFileSync(resolved);
    if (bytes.length !== row.bytes || digest(bytes) !== row.sha256) throw Error('Artifact bytes mismatch: ' + row.file);
    const url = '/' + row.file;
    if (files.has(url) || url === '/review.html' || url === '/_delivery.json') throw Error('Duplicate/reserved route');
    files.set(url, {bytes, type: mime(row.file)});
  }
  if (!files.has('/index.html')) throw Error('No product entry');
  files.set('/', files.get('/index.html'));
  const identity = {sliceId: config.sliceId, buildId: config.buildId, implementationI: config.implementationI, reviewedR: config.reviewedR, reviewSha256: config.reviewSha256, buildManifestSha256: config.buildManifestSha256, files: rows};
  const html = `<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Grape 實機測試 · ${escape(config.sliceId)} · ${escape(config.buildId)}</title><style>*{box-sizing:border-box}html,body{height:100%;margin:0}body{display:flex;flex-direction:column;background:#111827;color:#f3f4f6;font:14px system-ui,sans-serif}header{display:flex;align-items:center;gap:20px;flex-wrap:wrap;min-height:54px;padding:12px 20px;border-bottom:1px solid #475569}.slice{font-size:17px;font-weight:700}.build{font-family:ui-monospace,monospace}.review{color:#cbd5e1;font-size:12px}.status{margin-left:auto;color:#a7b5c9;font-size:12px}iframe{display:block;flex:1;width:100%;min-height:0;border:0;background:#fff}</style><header aria-label="目前部署版本"><span class="slice">Grape · ${escape(config.sliceId)}</span><span class="build">${escape(config.buildId)}</span><span class="review" title="${config.reviewedR}">受審版本 ${config.reviewedR.slice(0,7)}</span><span class="status">封存版本已核對 · 實機測試</span></header><iframe src="/" title="Grape ${escape(config.sliceId)} 測試畫面"></iframe></html>`;
  files.set('/review.html', {bytes: Buffer.from(html), type: 'text/html; charset=utf-8'});
  files.set('/_delivery.json', {bytes: Buffer.from(JSON.stringify(identity)), type: 'application/json; charset=utf-8'});
  const handler = (request, response) => {
    const headers = {'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'same-origin'};
    if (request.method !== 'GET' && request.method !== 'HEAD') {response.writeHead(405, {...headers, Allow:'GET, HEAD'}); response.end(); return;}
    let route;
    try {route = decodeURIComponent((request.url ?? '').split('?')[0]);} catch {response.writeHead(400, headers); response.end(); return;}
    const file = files.get(route);
    if (!file) {response.writeHead(404, headers); response.end(); return;}
    response.writeHead(200, {...headers, 'Content-Type':file.type, 'Content-Length':file.bytes.length});
    response.end(request.method === 'HEAD' ? undefined : file.bytes);
  };
  return {handler, identity, entrySha256: digest(Buffer.from(html))};
}

export async function listenPreview(prepared, addresses, port) {
  const allowed = new Set(['127.0.0.1','192.168.1.105','100.83.88.97']);
  if (!Array.isArray(addresses) || !addresses.length || new Set(addresses).size !== addresses.length || addresses.some(x => !allowed.has(x))) throw Error('Unapproved binding address');
  if (!Number.isInteger(port) || port < 0 || port > 65535 || port !== 0 && port < 1024) throw Error('Invalid port');
  const servers = [];
  try {
    for (const host of addresses) {
      const server = http.createServer(prepared.handler);
      servers.push(server);
      await new Promise((resolve, reject) => {server.once('error', reject); server.listen(port, host, resolve);});
    }
  } catch (error) {await Promise.all(servers.map(s => new Promise(r => s.close(r)))); throw error;}
  return {servers, close: () => Promise.all(servers.map(s => new Promise(r => s.close(r)))), urls: servers.map(s => `http://${s.address().address}:${s.address().port}/review.html`)};
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  if (process.argv.length !== 3) throw Error('Usage: node serve-reviewed-preview-01.mjs config.json');
  const config = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  if (!Number.isInteger(config.port) || config.port < 1024) throw Error('Explicit nonprivileged test port required');
  const prepared = prepareReviewedPreview(config);
  const service = await listenPreview(prepared, config.addresses, config.port);
  console.log(JSON.stringify({status:'RUNNING_VERIFIED_BYTES',pid:process.pid,startedAt:new Date().toISOString(),urls:service.urls,identity:prepared.identity,entrySha256:prepared.entrySha256}));
  for (const signal of ['SIGINT','SIGTERM']) process.once(signal, async () => {await service.close(); process.exit(0);});
}
