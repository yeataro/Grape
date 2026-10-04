import fs from 'node:fs';import cp from 'node:child_process';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const base='production/evidence/s06/workspace-entry-01/',manifest=JSON.parse(fs.readFileSync(base+'implementation-allowlist-01.json')),hash=b=>crypto.createHash('sha256').update(b).digest('hex'),git=(...args)=>cp.execFileSync('git',args,{encoding:'utf8',maxBuffer:16e6});
assert.equal(git('rev-parse','HEAD').trim(),manifest.parent);assert.equal(git('diff','--cached','--name-only').trim(),'');
for(const r of [...manifest.paths,...manifest.protected])assert.equal(hash(fs.readFileSync(r.file)),r.sha256,r.file);
const browser=JSON.parse(fs.readFileSync(base+'browser-final-02/browser-results.json'));assert.equal(browser.stats.unexpected,0);assert.equal(browser.stats.expected,132);
git('add','--',...manifest.paths.map(r=>r.file));assert.deepEqual(git('diff','--cached','--name-only').trim().split('\n').sort(),manifest.paths.map(r=>r.file).sort());
git('diff','--cached','--check');git('commit','-m','feat: deliver scoped S06 workspace entry and atomic configured creation');
const I=git('rev-parse','HEAD').trim();for(const r of manifest.paths)assert.equal(hash(cp.execFileSync('git',['show',I+':'+r.file],{maxBuffer:8e6})),r.sha256,r.file);
fs.writeFileSync(base+'implementation-commit-01.json',JSON.stringify({implementationI:I,parent:manifest.parent,sourceFiles:manifest.paths.length,browserExpected:132,productCommit:true,independentReview:'PENDING',humanAcceptance:'NOT_GRANTED'},null,2)+'\n',{flag:'wx'});console.log(I);
