// Packaging negative controls only. No production slices or frozen-tree writes.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {repositoryRoot, verifyBootstrap, indexedPaths, sha256} from './verify-bootstrap.mjs';
import {stageHandoff} from './verify-handoff.mjs';

const read = (root, file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (root, file, value) => fs.writeFileSync(path.join(root, file), JSON.stringify(value, null, 2) + '\n');
const digest = file => sha256(fs.readFileSync(file));

// Copy only navigation inputs used by root verification. Never follow a link
// outside the repository, or a symlink at any level, into a disposable fixture.
function copyNavigation(source, destination, document) {
  const root = path.resolve(source);
  for (const match of fs.readFileSync(path.join(root, document), 'utf8').matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^[a-z]+:/i.test(target)) continue;
    const file = path.resolve(root, target);
    assert.ok(file.startsWith(root + path.sep), 'navigation must stay within repository');
    const relative = path.relative(root, file);
    let cursor = root;
    for (const part of relative.split(path.sep)) {
      cursor = path.join(cursor, part);
      assert.equal(fs.lstatSync(cursor).isSymbolicLink(), false, 'navigation cannot follow symlinks');
    }
    assert.ok(fs.statSync(file).isFile(), 'navigation must name a file');
    const output = path.join(destination, relative);
    fs.mkdirSync(path.dirname(output), {recursive: true});
    fs.copyFileSync(file, output);
  }
}

function fixture(t) {
  const temporaryBase = path.resolve(os.tmpdir());
  const root = fs.mkdtempSync(path.join(temporaryBase, 'grape-bootstrap-test-'));
  t.after(() => {
    // Only the exact directory returned by mkdtemp may be recursively removed.
    const target = path.resolve(root);
    assert.notEqual(target, temporaryBase);
    assert.ok(target.startsWith(temporaryBase + path.sep));
    assert.ok(path.basename(target).startsWith('grape-bootstrap-test-'));
    assert.equal(fs.lstatSync(target).isSymbolicLink(), false);
    fs.rmSync(target, {recursive: true, force: true});
  });
  for (const file of ['AGENTS.md', 'README.md', 'implementation-state.json', 'HANDOFF_ACCEPTANCE.json', '.gitignore', '.gitattributes', 'BOOTSTRAP_VALIDATION.json', 'tools/verify-handoff.mjs']) {
    const target = path.join(root, file); fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.copyFileSync(path.join(repositoryRoot, file), target);
  }
  for (const file of indexedPaths(path.join(repositoryRoot, 'handoff')).files) {
    const target = path.join(root, 'handoff', file); fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.copyFileSync(path.join(repositoryRoot, 'handoff', file), target);
  }
  for (const file of ['README.md', 'AGENTS.md']) copyNavigation(repositoryRoot, root, file);
  // Qualification fixtures always exercise the initial state, independent of later
  // real project progress. The wrapper separately validates the actual root record.
  write(root, 'implementation-state.json', {...read(root, 'handoff/implementation-state.json'), recordRole: 'current'});
  return root;
}

test('BOOT01 accepted baseline and materialized current record remain valid and not-started', async t => {
  const root = fixture(t), before = digest(path.join(root, 'implementation-state.json'));
  const result = await verifyBootstrap(root, {runExistingChecks: false});
  assert.equal(result.status, 'PASS', JSON.stringify(result.errors));
  assert.equal(result.indexedFiles, 411); assert.equal(result.frozenFiles, 412);
  assert.equal(result.currentState, 'not-started'); assert.equal(result.currentRecordValidation, 'CURRENT_RECORD_VALID');
  assert.deepEqual(result.activeSlices, []); assert.deepEqual(result.commands, []);
  assert.equal(digest(path.join(root, 'implementation-state.json')), before, 'read-only verification must not update progress');
});

test('BOOT10 navigation fixtures preserve linked bytes and reject escaping paths and symlink ancestors', t => {
  const root = fixture(t), source = path.join(root, 'source'), destination = path.join(root, 'copy');
  fs.mkdirSync(source); fs.mkdirSync(destination);
  fs.writeFileSync(path.join(source, 'value.md'), 'exact linked bytes\r\n');
  fs.writeFileSync(path.join(source, 'README.md'), '[value](value.md#anchor)');
  copyNavigation(source, destination, 'README.md');
  assert.equal(digest(path.join(destination, 'value.md')), digest(path.join(source, 'value.md')));
  fs.writeFileSync(path.join(source, 'README.md'), '[escape](../README.md)');
  assert.throws(() => copyNavigation(source, destination, 'README.md'), /within repository/);
  fs.mkdirSync(path.join(root, 'outside'));
  fs.writeFileSync(path.join(root, 'outside', 'data.md'), 'must not copy');
  fs.symlinkSync(path.join(root, 'outside'), path.join(source, 'linked'), 'junction');
  fs.writeFileSync(path.join(source, 'README.md'), '[symlink](linked/data.md)');
  assert.throws(() => copyNavigation(source, destination, 'README.md'), /symlinks/);
  assert.equal(fs.existsSync(path.join(destination, 'linked')), false);
});

test('BOOT02 changing one frozen file is detected without executing changed checkers', async t => {
  const root = fixture(t); fs.appendFileSync(path.join(root, 'handoff/00_README.md'), '\nTampered fixture.\n');
  const result = await verifyBootstrap(root, {runExistingChecks: false});
  assert.equal(result.status, 'FAIL'); assert.ok(result.errors.some(e => e.includes('Frozen bytes changed 00_README.md')));
  assert.deepEqual(result.commands, []); assert.equal(result.currentRecordValidation, undefined);
});

test('BOOT03 unindexed files including dependency/scratch files are rejected', async t => {
  const root = fixture(t), extra = path.join(root, 'handoff/node_modules/unindexed.txt');
  fs.mkdirSync(path.dirname(extra), {recursive: true}); fs.writeFileSync(extra, 'not accepted snapshot content');
  const result = await verifyBootstrap(root, {runExistingChecks: false});
  assert.equal(result.status, 'FAIL'); assert.ok(result.errors.some(e => e.includes('Frozen membership changed')));
});

test('BOOT04 owner acceptance must bind the exact frozen index digest', async t => {
  const root = fixture(t), accepted = read(root, 'HANDOFF_ACCEPTANCE.json');
  accepted.acceptedBaseline.indexSha256 = '0'.repeat(64); write(root, 'HANDOFF_ACCEPTANCE.json', accepted);
  const result = await verifyBootstrap(root, {runExistingChecks: false});
  assert.equal(result.status, 'FAIL'); assert.ok(result.errors.includes('Accepted index digest changed'));
});

test('BOOT05 external current locator cannot masquerade as the frozen template', async t => {
  const root = fixture(t), current = read(root, 'implementation-state.json');
  current.recordRole = 'handoff-template'; write(root, 'implementation-state.json', current);
  const result = await verifyBootstrap(root, {runExistingChecks: false});
  assert.equal(result.status, 'FAIL'); assert.ok(result.errors.includes('Current record identity'));
});

test('BOOT06 not-started state cannot contain invented slice progress', async t => {
  const root = fixture(t), current = read(root, 'implementation-state.json');
  current.activeSlices.push('S01'); write(root, 'implementation-state.json', current);
  const result = await verifyBootstrap(root, {runExistingChecks: false});
  assert.equal(result.status, 'FAIL'); assert.ok(result.errors.some(e => e.includes('Not-started record must materialize unchanged template')));
});

test('BOOT07 changing status alone cannot invent a valid started project', async t => {
  const root = fixture(t), current = read(root, 'implementation-state.json');
  current.status = 'active'; current.activeSlices.push('S01'); write(root, 'implementation-state.json', current);
  const result = await verifyBootstrap(root, {runExistingChecks: false});
  assert.equal(result.status, 'FAIL'); assert.equal(result.currentRecordValidation, 'INVALID');
  assert.ok(result.errors.some(e => e.includes('Started record requires project identity/root')));
});

test('BOOT08 inherited DEC-GRAPE-001 remains single and is not fabricated as implementation progress', async t => {
  const root = fixture(t), current = read(root, 'implementation-state.json'), accepted = read(root, 'HANDOFF_ACCEPTANCE.json');
  assert.deepEqual(current.decisionReferences, []); assert.deepEqual(current.acceptedEvidence, []);
  assert.deepEqual(accepted.inheritedProductDecisions, ['DEC-GRAPE-001']);
  const gates = read(root, 'handoff/data/gates.json').gates;
  assert.equal(gates.find(g => g.id === 'G-MIXED-HISTORY').status, 'DEFERRED_BY_PRODUCT_DECISION');
  assert.equal(gates.find(g => g.id === 'G-LU-UI-009').status, 'unresolved');
  accepted.inheritedProductDecisions.push('DEC-GRAPE-001'); write(root, 'HANDOFF_ACCEPTANCE.json', accepted);
  const result = await verifyBootstrap(root, {runExistingChecks: false});
  assert.equal(result.status, 'FAIL'); assert.ok(result.errors.includes('Accepted baseline decision reference'));
});

test('BOOT09 staged qualification is an isolated byte copy; edits cannot alter accepted handoff or current state', async t => {
  const root = fixture(t), workspace = path.join(root, 'isolated-work'); fs.mkdirSync(workspace);
  const acceptedFile = path.join(root, 'handoff/00_README.md'), before = digest(acceptedFile);
  const currentBefore = digest(path.join(root, 'implementation-state.json'));
  const staged = stageHandoff(root, workspace);
  for (const file of indexedPaths(path.join(root, 'handoff')).files) {
    assert.equal(digest(path.join(staged, file)), digest(path.join(root, 'handoff', file)), file);
    assert.equal(fs.lstatSync(path.join(staged, file)).isSymbolicLink(), false);
  }
  fs.appendFileSync(path.join(staged, '00_README.md'), '\nDisposable verification output.\n');
  write(workspace, 'implementation-state.json', {fixture: 'changed only in disposable copy'});
  assert.notEqual(digest(path.join(staged, '00_README.md')), before);
  assert.equal(digest(acceptedFile), before); assert.equal(digest(path.join(root, 'implementation-state.json')), currentBefore);
  assert.throws(() => stageHandoff(root, workspace), /Fresh staging directory required/);
  const result = await verifyBootstrap(root, {runExistingChecks: false}); assert.equal(result.status, 'PASS');
});
