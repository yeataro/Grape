// THIS IS NOT THE PRODUCTION IMPLEMENTATION.
// Packaging-only reconstruction of the accepted AC-002 dependency closure.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const output = dirname(fileURLToPath(import.meta.url));
const root = resolve(output, '../..');
const read = p => JSON.parse(readFileSync(resolve(root, p), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const basePath = 'architecture-baseline/AB-001/manifest.json';
const changePath = 'architecture-baseline/changes.json';
const acceptedPath = 'architecture-baseline/AC-002/manifest.json';
const base = read(basePath), ledger = read(changePath), accepted = read(acceptedPath);
const prefix = 'architecture-core-prototype/';
const needed = p => p.startsWith(prefix) && (p.endsWith('.ts') || p.endsWith('_CONTRACTS.md') || /\/(package(?:-lock)?\.json|tsconfig\.json)$/.test(p));
const sources = new Map(base.entries.filter(e => needed(e.path)).map(e => [e.path, {
  path: e.path, source: 'architecture-baseline/AB-001/' + e.snapshot,
  sha256: e.sha256, origin: 'AB-001 capture',
}]));
for (const change of ledger.changes) {
  if (!['AC-001', 'AC-002'].includes(change.id)) continue;
  for (const file of change.files.filter(e => needed(e.path))) {
    const capture = `architecture-baseline/${change.id}/capture/${file.path}`;
    sources.set(file.path, {
      path: file.path, source: capture, sha256: file.afterHash,
      origin: `${change.id} capture`,
    });
  }
}
// AC-001 has no physical capture. AC-002 supersedes its core/contracts/tests;
// identity.ts is its sole inherited executable dependency. Its accepted hash,
// never the latest implementation's semantics, decides whether recovery is safe.
const identity = sources.get(prefix + 'identity.ts');
if (identity && !existsSync(resolve(root, identity.source))) {
  identity.source = identity.path;
  identity.origin = 'AC-001 accepted-hash recovery; physical AC-001 capture absent';
}
const rows = [];
for (const entry of [...sources.values()].sort((a,b) => a.path.localeCompare(b.path))) {
  const bytes = readFileSync(resolve(root, entry.source));
  if (hash(bytes) !== entry.sha256) throw new Error('SEALED_SOURCE_HASH_MISMATCH: ' + entry.path);
  const target = resolve(output, entry.path.slice(prefix.length));
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, bytes);
  rows.push({ ...entry, copiedPath: relative(output, target).replaceAll('\\','/') });
}
if (accepted.id !== 'AC-002') throw new Error('Unexpected accepted baseline');
writeFileSync(resolve(output, 'SOURCE_PROVENANCE.json'), JSON.stringify({
  warning: 'THIS IS NOT THE PRODUCTION IMPLEMENTATION',
  acceptedArchitecture: 'AC-002',
  sourceManifests: [basePath, changePath, acceptedPath].map(path => ({path, sha256:hash(readFileSync(resolve(root,path)))})),
  reconstruction: 'AB-001 captured files + accepted AC-001/AC-002 overlays. Only identity.ts requires explicit accepted-hash recovery. No active implementation fallback for other files.',
  files: rows,
}, null, 2) + '\n');
console.log(JSON.stringify({copiedFiles:rows.length, recovered:rows.filter(x=>x.origin.includes('recovery')).map(x=>x.path)}));
