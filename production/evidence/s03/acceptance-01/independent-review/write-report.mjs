import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import cp from 'node:child_process';
import assert from 'node:assert/strict';
const root='C:/Users/user/source/Grape/.verification/s03-review-01',out='C:/Users/user/source/Grape/.verification/s03-independent-rereview-02';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=p=>{const b=fs.readFileSync(p);return {sha256:sha(b),bytes:b.length}};
const ref=p=>({file:p,...hash(out+'/'+p)});
const repositoryRef=p=>({file:p,...hash(root+'/'+p)});
const write=(name,value)=>fs.writeFileSync(out+'/'+name,JSON.stringify(value,null,2)+'\n');
const git=(...args)=>cp.execFileSync('git',['-c','safe.directory='+root,...args],{cwd:root,encoding:'utf8'}).trim();
const packet=read(out+'/dispatch-packet.json'), before=read(out+'/identities-before.json'),after=read(out+'/identities-after.json');
const coverage=read(root+'/production/evidence/s03/repair-02/coverage-01.json'),verified=read(out+'/build-relocation-coverage.json');
const atomic=read(out+'/eg01-atomic-results.json'),oldProbes=read(out+'/independent-probe-results.json'),webgl=read(out+'/browser/repair-webgl2.json');
const records=['unit','root','build','probes','browser'].flatMap(x=>read(out+'/execution-'+x+'.json'));
assert(records.every(x=>x.status===0));assert.equal(after.head,packet.submittedHeadR);assert.equal(after.gitStatus,'');assert.equal(before.gitStatus,'');
assert.equal(after.sourceImplementationDiff,'');assert(after.implementationAncestor);assert.deepEqual(before.manifests,after.manifests);assert.deepEqual(before.objects,after.objects);
assert.equal(atomic.length,30);assert(atomic.every(x=>x.status==='PASS'));assert(oldProbes.filter(x=>x.id==='EG01-inline-source-admission').every(x=>x.contractConforms));
assert.equal(verified.browser.stats.expected,48);assert.equal(verified.browser.stats.unexpected,0);assert.equal(verified.browser.stats.skipped,0);assert.equal(verified.browser.stats.flaky,0);
assert.equal(verified.coverage.actualCapabilityIds.length,24);assert(verified.coverage.checks.every(x=>x.executedTitleMatch!==false));assert(verified.build.files.every(x=>x.matches));assert.equal(verified.relocation.failures.length,0);
assert.equal(webgl.browser,'151.0.7922.34');assert(webgl.rows[0].shaders.every(x=>x.compiled));assert.equal(webgl.rows[1].status,'failed');assert.equal(webgl.rows[1].artifacts.length,0);
assert.match(fs.readFileSync(out+'/unit.log','utf8'),/pass 156/);assert.match(fs.readFileSync(out+'/bootstrap-tests.log','utf8'),/pass 9/);
const detached=cp.spawnSync('git',['-c','safe.directory='+root,'symbolic-ref','-q','HEAD'],{cwd:root,encoding:'utf8'});
assert.equal(detached.status,1);assert.equal(detached.stdout,'');
const protectedDiff=git('diff','--name-only',packet.acceptedMain,packet.submittedHeadR,'--','handoff','workflow','production/evidence/acceptance','HANDOFF_ACCEPTANCE.json');assert.equal(protectedDiff,'');
write('static-portable-audit.json',{
 reviewerIdentity:'/root/s03_fresh_rereview_02/portable_static',attribution:'Actual read-only subreview returned through collaboration; parent records its findings here. No source writes or test/build execution by subreviewer.',
 reviewedR:packet.submittedHeadR,verdict:'PASS_FOR_BOUNDED_STATIC_REPAIR',additionalFindings:[],
 inspected:[
  {area:'Accepted source admission',refs:['handoff/data/capability-coverage.json:11515','handoff/data/capability-coverage.json:11519','handoff/data/capability-coverage.json:11532','handoff/data/capability-coverage.json:11552','handoff/data/capability-coverage.json:8326'],observation:'Numeric scalar/vector/matrix clipboard rule, same Graph/load reuse, separately legal bounded native arrays and independent source declaration rules.'},
  {area:'Round2 owner policy and exact identity',refs:['production/src/modules/networks.ts:300','production/src/model/transfer.ts:234','production/src/model/transfer.ts:282','production/src/model/transfer.ts:404'],observation:'Constant/uniform/specialization clipboard imports reject non-scalar TypeToken kinds; scalar token category includes GLSL vectors/matrices. Construction/document phases retain value validation. Only exact Graph+load resource reuse skips import policy.'},
  {area:'Atomicity and detached owner execution',refs:['production/src/model/transfer.ts:192','production/src/model/transfer.ts:410','production/src/sdk/kernel.ts:48','production/src/model/graph.ts:370'],observation:'Exact definitions/modules, required policy, detached deep-frozen callback inputs, candidate validation before History/Redo/publication.'},
  {area:'Adjacent portable rules',refs:['production/src/modules/networks.ts:341','production/src/modules/networks.ts:381','production/src/sdk/type-tokens.ts:10','production/src/definitions/types.ts:239'],observation:'2048 clipboard and 4096 construction path bounds; exact image target; null authored native value; float/vec2/vec3/vec4 native elements; typed positive int/uint extents; TOP source+origin/current defaults; minimum vacant specialization ID retained.'},
  {area:'Tests and retained FR01..03',refs:['production/tests/unit/s03-repair2.test.ts:23','production/tests/unit/s03-repair2.test.ts:104','production/tests/browser/s03-repair2.spec.ts:8','production/tests/unit/s03-repair.test.ts:232','production/src/modules/image.ts:98','production/src/model/graph.ts:1967','production/src/model/graph.ts:1336'],observation:'Round2 tests cover real distinct Graph/new load, full atomicity, changed current same-load values, numeric positives; previous repair tests unchanged. ES300 explicit nested refusal, mixed shared/cloned addresses and dependent Structure limits retained.'}
 ],fingerprint:{source:'production/src/modules/networks.ts',algorithm:'Normalized source SHA256 as module-pins.mjs',actual:'sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2',matches:true},
 limits:['Static findings do not by themselves establish runtime pass, native resolution, arbitrary callback purity, Human acceptance or global Gate closure.']
});
write('supplemental-execution.json',{
 recordedAt:new Date().toISOString(),provenance:'Observed executions by this reviewer through exec_command; all returned exit0.',
 commands:[
 {command:'node --experimental-transform-types '+out+'/eg01-atomic.ts',result:'30 PASS:12 rejected,18 accepted',log:'eg01-atomic.log',output:'eg01-atomic-results.json'},
 {command:'node --experimental-transform-types production/tools/s03-performance.ts',cwd:root,result:'Single 200-node model sample, no performance threshold claim',log:'performance.log'},
 {command:'npm ls --prefix production --depth=0',cwd:root,result:'@playwright/test1.62.1, prettier3.8.1, typescript5.9.3, vite7.3.1; successful exit0'},
 {command:'node '+out+'/verify-build-coverage.mjs',result:'3 build files match;61 relocated files;24 capabilities;338 mapped evidence entries; no mismatches',output:'build-relocation-coverage.json'},
 {command:'node '+out+'/verify-identities.mjs after',result:'Exact clean R;18 objects,78 source/config,112 evidence,743 protected files match; source/test/config unchanged I->R',output:'identities-after.json'}
 ],git:{detachedHead:true,protectedDiffFromAcceptedMain:protectedDiff,finalStatus:git('status','--porcelain')},
 visualInspection:{files:['browser/repair2-inline-glsl.float.png','browser/s03-two-occurrences.png'],observation:'Inspected actual fresh screenshots as supporting evidence; behavioral pass comes from executed assertions. No independent accessibility or device qualification.'},
 permission:{browser:'Normal Windows child-process permissions via legitimately require_escalated on first run; completed successfully without sandbox teardown hang.',git:'Exact-clone command-scoped safe.directory only; no global Git settings changed; read-only host global ignore permission warning observed.'}
});
const evidenceFor=e=>({kind:e.kind,title:e.title,file:e.kind==='browser'?'browser/browser-results.json':'unit.log'});
const capabilityRows=coverage.capabilities.map((c,i)=>{
 const chosen=[c.evidence.find(e=>e.kind==='unit/conformance'),c.evidence.find(e=>e.kind==='browser')].filter(Boolean);
 const extra=c.capabilityId==='LC-DATA-030'?['independent-probe-results.json','counterexamples-results.json']:['LC-DATA-045','LC-DATA-062','LC-DATA-046'].includes(c.capabilityId)?['eg01-atomic-results.json']:['LC-DATA-048','LC-NODE-368','LC-NODE-374'].includes(c.capabilityId)?['structure-depth-results.json','browser/repair-webgl2.json']:[];
 return {capabilityId:c.capabilityId,disposition:'PASS_FOR_AUTHORIZED_S03_SCOPE_AT_CURRENT_R',scope:c.scope,evidence:chosen.map(evidenceFor),additionalEvidence:extra,fullMapping:'build-relocation-coverage.json#/coverage/checks; location prefix coverage.capabilities.'+i,residual:c.capabilityId.startsWith('LC-NODE-')?'Shared wider S05 catalog branches remain unqualified.':null};
});
const findings=[
 {id:'S03-FR-01',severity:'P2',status:'CLOSED_AT_CURRENT_R',affectedScope:['LC-DATA-048','LC-NODE-368','LC-NODE-374'],contract:['handoff/04_EXTENSION_MODEL.md:113','handoff/data/capability-coverage.json:96332'],retainedCounterexample:'Nested Structure array outer3/inner2 previously produced successful invalid ES300 code.',observed:'Original case explicitly fails PROFILE_TYPE with zero artifacts. Fresh Chromium WebGL2 compiles supported one-dimensional Structure vertex+fragment. Both leave canonical snapshot unchanged.',evidence:['counterexamples-results.json','nested-array-compilation.json','browser/repair-webgl2.json'],limit:'No nested-array shader lowering or physical GPU qualification claimed.'},
 {id:'S03-FR-02',severity:'P2',status:'CLOSED_AT_CURRENT_R',affectedScope:['LC-DATA-030','AT-S03-03'],contract:['handoff/08_IMPLEMENTATION_PLAN.md:169','handoff/09_ACCEPTANCE_AND_CONFORMANCE.md:103','handoff/14_DOCUMENT_FORMAT.md:50'],retainedCounterexample:'Make Independent rejected complete owner resource references to parent nodes and valid shared child nodes.',observed:'Original case succeeds. Independent shared-child and transitively cloned-child variants preserve/remap each address correctly, preserve literal payload, publish once, add one History entry and exactly Undo/Redo documents. Missing-address/codec refusal regressions passed.',evidence:['counterexamples-results.json','independent-probe-results.json','unit.log'],limit:'Bounded exact-owner codec fixtures; arbitrary third-party callback purity not established.'},
 {id:'S03-FR-03',severity:'P2',status:'CLOSED_AT_CURRENT_R',affectedScope:['LC-DATA-048','LC-NODE-368'],contract:['handoff/data/capability-coverage.json:8944','handoff/data/capability-coverage.json:96338'],retainedCounterexample:'Inner Structure edit increased existing dependent depth16 to17 without refusal.',observed:'Original depth17 edit rejects STRUCTURE_DEPTH at unchanged revision18; direct construction control rejects. Independent dependent expansion65536->131072 rejects with exact snapshot/History/Redo retained and zero publication. Full suite verifies depth atomicity and external-shape metadata preservation.',evidence:['structure-depth-results.json','independent-probe-results.json','unit.log'],limit:'No admission broadening.'},
 {id:'S03-EG-01',severity:'P2',status:'CLOSED_AT_CURRENT_R',affectedScope:['LC-DATA-045','LC-DATA-062','AT-S03-03'],contract:['handoff/data/capability-coverage.json:11515','handoff/data/capability-coverage.json:11519','handoff/data/capability-coverage.json:11532','handoff/data/capability-coverage.json:11557'],retainedCounterexample:'float[2]/vec2[2] inline constants were imported cross-Graph/new load despite narrower numeric source clipboard rule.',observed:'Fresh independent30-case matrix:12 array refusals across implicit constant/explicit constant/uniform and true distinct Graph/fresh load; complete capture/revision/History preserved, seeded Redo remains executable, zero publication, source and packet unchanged. Same Graph+load reuse remains legal.18 scalar/vector/matrix imports succeed with exact Undo/Redo. Fresh156-unit and48-browser suites preserve native-array/sampler path, TOP slot/default, specialization, target and owner/provider rules.',evidence:['eg01-atomic-results.json','independent-probe-results.json','unit.log','browser/browser-results.json','static-portable-audit.json'],limit:'Portable authored descriptor admission only; real native resolution/emission remains unavailable.'}
];
const report={
 packetVersion:1,packetType:'INDEPENDENT_REVIEW_RESULT',packetId:'S03-INDEPENDENT-REREVIEW-02',actionKey:packet.actionKey,reviewId:'S03-FR-c209bba-R2',reviewerRole:'Fresh Independent Reviewer',reviewerIdentity:'/root/s03_fresh_rereview_02',
 provenance:{parentCoordinator:'/root',recordedAt:new Date().toISOString(),dispatch:ref('dispatch-packet.json'),staticSubreview:ref('static-portable-audit.json'),attribution:'Actual fresh reviewer executions and inspections at exact candidate; historical reports are retained counterexample inputs, not reused PASS. Subreview attribution preserved.'},
 repository:packet.repository,policyRevision:packet.policyRevision,acceptedMain:packet.acceptedMain,expectedWorkHead:packet.submittedHeadR,PR:packet.PR,authorizationRef:packet.authorizationRef,sliceId:'S03',writer:packet.writer,
 reviewedI:packet.implementationI,reviewedR:packet.submittedHeadR,priorI:packet.priorI,priorR:packet.priorR,
 independenceStatement:{context:'New fresh reviewer context received normalized packet/files/Git authority; no implementation conversation inherited.',checkout:root,gitDirectory:after.gitDirectory,method:'Separate no-hardlink clone; reused isolated clone at clean detached exact R after previous reviewer terminated. Existing independent locked dependencies verified, not reinstalled by this reviewer.',verified:'Before/after clean R; I ancestor; no source/test/tool/config diff I->R; no Git alternates; sampled files nlink1;19 installed lock entries matched; dependency tree checked. All new outputs outside product checkout in new round2 evidence directory.',limitations:'Same host/filesystem, operational role isolation rather than OS security boundary.'},
 findingGroup:packet.findingGroup,round:2,unsuccessfulRepairRereviewRoundsBefore:1,unsuccessfulRepairRereviewRoundsAfter:1,
 reviewedScope:{authorization:'All authorized S03 AT01..04 and24 capabilities, bounded product/environment scope, original findings plus retained EG01 and affected regressions.',acceptanceFamilies:coverage.acceptanceFamilies.map((a,i)=>({id:a.id,disposition:'PASS_AT_CURRENT_R',fullMapping:'build-relocation-coverage.json#/coverage/checks; location prefix coverage.acceptanceFamilies.'+i,evidence:a.evidence.filter(e=>e.kind==='browser').slice(0,2).map(evidenceFor)})),capabilities:capabilityRows},
 build:{implementation:packet.implementationI,buildId:'S03-repair2-web-80ee116',submittedArtifact:packet.buildArtifact,independentBuild:'build/',comparison:ref('build-relocation-coverage.json'),result:'All3 independent rebuilt files and extracted submitted archive files match submitted manifest byte-for-byte.'},
 environment:{...after.environment,chromium:webgl.browser,webgl:webgl.webgl,renderer:webgl.renderer,viewport:{width:1440,height:1000},browserMode:'Headless Chromium with actual DOM events and synthetic composition events; WebGL2 shader compilation only. Legitimately elevated browser suite completed on first attempt.'},
 executedChecks:[
  {check:'Independent unit and conformance suite',result:'PASS',tests:156,failures:0,skips:0,evidence:['execution-unit.json','unit.log']},
  {check:'Independent complete browser suite',result:'PASS',tests:48,failures:0,skips:0,flaky:0,evidence:['execution-browser.json','browser.log','browser/browser-results.json']},
  {check:'Read-only root integrity/current state',result:'PASS',checks:463,indexedFiles:411,frozenFiles:412,evidence:['bootstrap.log','current-state.log','execution-root.json']},
  {check:'Bootstrap mutation/relocation tests',result:'PASS',tests:9,failures:0,skips:0,evidence:['bootstrap-tests.log']},
  {check:'Runtime/typecheck/build/module pins/dependency boundaries',result:'PASS',evidence:['execution-build.json','typecheck.log','build.log','module-pins.log','boundaries.log']},
  {check:'Retained original counterexamples and adjacent probes',result:'PASS',evidence:['execution-probes.json','counterexamples-results.json','structure-depth-results.json','independent-probe-results.json']},
  {check:'Independent stronger EG01 atomic matrix',result:'PASS',cases:30,compositeRefusals:12,numericSuccesses:18,evidence:['eg01-atomic-results.json','eg01-atomic.log']},
  {check:'Packet/source/evidence/protected identities before and after',result:'PASS',packetSubmissionObjects:18,sourceConfigFiles:78,evidenceFiles:112,protectedFiles:743,evidence:['identities-before.json','identities-after.json']},
  {check:'Build/relocation/full current coverage identities',result:'PASS',buildFiles:3,relocatedPriorFiles:61,capabilityIds:24,mappedEvidenceEntries:338,evidence:['build-relocation-coverage.json']},
  {check:'Read-only static owner policy, invariants and fingerprint',result:'PASS',evidence:['static-portable-audit.json']},
  {check:'200-node model performance sample',result:'RECORDED_WITHOUT_SCALABILITY_CLAIM',evidence:['performance.log']}
 ],
 priorReview:{report:packet.originalReview,originalWholeScopeReport:repositoryRef('production/evidence/s03/repair-01/original-review/INDEPENDENT_REVIEW_RESULT.json'),originalCapabilitySupplement:repositoryRef('production/evidence/s03/repair-01/original-review/CAPABILITY_MAPPING_SUPPLEMENT-01.json'),relocation:repositoryRef('production/evidence/s03/repair-02/review-relocation-01.json'),preserved:'Original report, mapping supplement and previous round report remain immutable.61 round1 relocation files verified.'},
 evidenceHashes:['identities-before.json','identities-after.json','build-relocation-coverage.json','unit.log','browser/browser-results.json','browser/repair-webgl2.json','eg01-atomic-results.json','independent-probe-results.json','counterexamples-results.json','structure-depth-results.json','probe-derivations.json','static-portable-audit.json','supplemental-execution.json'].map(ref),
 verdict:'PASS',findings,remainingFindings:[],requiredEvidenceGaps:[],
 limitations:[
  'Host-free Windows x64 10.0.26200, Node25.5.0, Playwright1.62.1, Chromium151.0.7922.34 at1440x1000 only; no native OS IME, touch/iPad/Safari, broader accessibility/device matrix, physical GPU or TouchDesigner qualification.',
  'Admitted nested Structure arrays explicitly fail shipped ES300 generation with no artifacts. Only supported one-dimensional Structure array shader compilation is demonstrated; no valid nested-array lowering claimed.',
  'Portable exact-owner native-array/sampler/TOP/specialization descriptor admission and refusal is covered. Live native resource resolution and runtime emission remain unavailable; no real TD or legacy-v1 alias conversion claimed.',
  'LC-NODE-368/369/374 shared wider S05 catalog branches, including Router/array_get/replace/length/array_create beyond S03, remain outside this S03 scope.',
  'S04 Personal/library package and symbolic-array policy remain separate; G-LU-DATA-007/G-PD-1 are not closed.',
  'S02 AT-S02-03 legacy compatibility remains NOT DELIVERED/BLOCKED and G-VERSION-COMPAT unresolved; the legacy rejection regression is not compatibility delivery.',
  'Single200-node model timing sample is not a browser frame-rate, unbounded scalability or performance guarantee.',
  'Inherited DEC-GRAPE-001 domain-separated History and HC-001 quarantine remain unchanged. Exact-owner tests do not establish arbitrary third-party callback purity or an OS security sandbox.',
  'Frozen/accepted evidence remains unchanged. This report binds I/R only; changed source/test/tool/config invalidates applicable coverage.'
 ],
 notExecuted:['Full frozen Handoff runtime qualification (only required root read-only integrity/bootstrap executed)','Real Host/native resource execution, physical GPU qualification, non-Windows browsers/devices and native OS IME','Publication, Human acceptance, completion state bookkeeping, merge and later Slice work'],
 acceptanceEligibility:'ELIGIBLE_FOR_HUMAN_ACCEPTANCE_OF_EXACT_REVIEWED_S03_SCOPE: all required independent checks PASS; all4 findings closed; no remaining finding or required evidence gap. Acceptance has not been granted.',
 boundedExclusions:['S04 Personal/package policies','Wider shared S05 catalog branches','S02 legacy compatibility delivery','Real native runtime resolution/emission','Broader S06 widget/device/accessibility matrix'],
 residualGates:[
 {id:'G-LU-DATA-001',review:'Current transaction rollback and owner/provider/source refusal cases pass, including EG01 exact atomic rejection. No global Gate closure.'},
 {id:'G-LU-DATA-004',review:'Current ASCII/CJK/nonBMP local clipboard UTF8 cases pass; other entry/Host scopes inherited.'},
 {id:'G-EXTENSION-WIDGET-SCOPE',review:'Current nested retarget/cancel/synthetic composition/focus/Undo cases pass in Chromium; broader widget/device/accessibility scopes unqualified.'},
 {id:'G-HANDOFF-CQ-OWNERSHIP',review:'Exact-owner read-only policies and shared/cloned child cases pass; HC-001 quarantine and wider owner questions remain inherited.'},
 {id:'G-LU-DATA-007 / G-PD-1 / G-VERSION-COMPAT / G-MIXED-HISTORY',review:'Inherited residuals and DEC-GRAPE-001 unchanged; no inferred closure.'}
 ],
 technicalOrEnvironmentClassification:'TECHNICAL_PASS; no unresolved required environment blocker and no demonstrated contract conflict. Finding group retains1 prior unsuccessful round; this round is successful.',
 nextAction:'Coordinator validates and routes this exact technical PASS, build and limitations to Human Owner acceptance control. Designated maintainer may persist reviewer-authored frozen evidence unchanged with relocation map. No acceptance, completion or merge is performed by Reviewer.',
 productAcceptance:'NOT_GRANTED',mergeAuthority:'NOT_GRANTED',nextSliceAuthority:'NOT_GRANTED',outputFrozen:true,evidenceManifest:'review-evidence-manifest.json (all output files except the manifest itself; external SHA256 returned with report)'
};
write('INDEPENDENT_REVIEW_RESULT.json',report);
const files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.name!=='review-evidence-manifest.json')files.push({file:path.relative(out,p).replaceAll('\\','/'),...hash(p)})}}walk(out);files.sort((a,b)=>a.file.localeCompare(b.file));
write('review-evidence-manifest.json',{reviewId:report.reviewId,reviewedI:report.reviewedI,reviewedR:report.reviewedR,createdAt:new Date().toISOString(),scope:'Complete frozen rereview output; self excluded to avoid recursive hash. Logical immutable evidence, no OS isolation claim.',files});
console.log(JSON.stringify({verdict:report.verdict,report:ref('INDEPENDENT_REVIEW_RESULT.json'),manifest:ref('review-evidence-manifest.json'),files:files.length,capabilities:capabilityRows.length,findings:findings.map(f=>({id:f.id,status:f.status})),productAcceptance:report.productAcceptance},null,2));
