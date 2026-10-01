// IH-002 repair integrity/conformance evidence. Does not confer independent acceptance.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const errors=[];let checks=0;
const check=(ok,msg)=>{checks++;if(!ok)errors.push(msg);};
const revision=json('HANDOFF_REVISION.json');
check(revision.packageId==='IH-005'&&revision.parentPackageId==='IH-004','Repair identity');
check(revision.productionImplementationStarted===false,'Repair cannot claim product work');
check(['REPAIR_IN_PROGRESS','READY FOR TARGETED RE-REVIEW'].includes(revision.status),'Invalid repair disposition');
check(JSON.stringify(revision.sourceBaselines)===JSON.stringify({architecture:'AC-002',inventory:'IR-001',coverage:'CQ-001',readiness:'MRDP-001'}),'Source baselines changed');
for(const evidence of revision.independentReview)check(sha(path.join(root,evidence.path))===evidence.sha256,'Review evidence drift '+evidence.path);
const parent=json('provenance/IH-001_PARENT_CONTENTS.json');
for(const source of json('executable-reference/SOURCE_PROVENANCE.json').files){
 check(sha(path.join(root,'executable-reference',source.copiedPath))===source.sha256,'Sealed reference modified '+source.copiedPath);
}
const gallery=parent.files.filter(f=>f.path.startsWith('ui-reference/legacy-screenshots/'));
check(gallery.length===8,'Original screenshot evidence set missing');
for(const f of gallery)check(sha(path.join(root,f.path))===f.sha256,'Screenshot evidence rewritten '+f.path);
const source=fs.readFileSync(path.join(root,'executable-reference/repair/public-panel-workspace.ts'),'utf8');
for(const name of ['handoff.selection-summary','extension.later','qualification.inspector'])check(!source.includes(name),'Ordinary Panel identity leaked into shared composition '+name);
check(!source.includes('../../examples/'),'Shared composition imports a contribution');
const panelExample=fs.readFileSync(path.join(root,'examples/minimal-panel/panel-template.ts'),'utf8');
check(panelExample.includes('repair/public-panel-workspace.ts'),'Example bypasses common contract');
check(!panelExample.includes('PanelTemplateHost'),'Old parallel teaching host resurrected');
const widget=fs.readFileSync(path.join(root,'examples/parameter-widget-or-ui-contribution/contribution.ts'),'utf8');
for(const forbidden of ['.resources','.nodeById(','resolvedNodes(','.activeStage.record'])check(!widget.includes(forbidden),'Widget traverses model '+forbidden);
check(widget.includes('ScopedParameterTarget')&&widget.includes('projectTarget'),'Widget bypasses scoped projection');
for(const file of ['public-panel-workspace.test.ts','scoped-parameter.test.ts','panel-inspector.test.ts'])check(fs.existsSync(path.join(root,'executable-reference/repair',file)),'Direct validation missing '+file);
for(const file of ['PANEL_COMPOSITION_CONTRACT.md','SCOPED_PARAMETER_CONTRACT.md'])check(fs.existsSync(path.join(root,'executable-reference/repair',file)),'Public contract missing '+file);
const records=json('data/repair-index.json');
check(['B01','M01','N01','N02','N03'].every(id=>records.findings.some(f=>f.id===id)),'Missing accepted review finding');
check(records.architectureChanges.length===2,'Unrecorded architecture change cardinality');
for(const f of records.findings)for(const file of [...f.contracts,...f.validationFiles])check(fs.existsSync(path.join(root,file)),f.id+' missing locator '+file);
const state=json('implementation-state.json');
check(state.recordRole==='handoff-template'&&state.status==='not-started'&&state.currentRecord==='../implementation-state.json','Progress locator/authority drift');
check(state.activeSlices.length===0&&state.completedSlices.length===0,'Repair started production slice');
// Parent verification is explicit and optional, preserving self-contained package use.
const arg=process.argv.indexOf('--verify-parent');
if(arg>=0){
 const directory=process.argv[arg+1];if(!directory)throw Error('--verify-parent requires exact parent directory');
 for(const f of parent.files)check(sha(path.join(directory,f.path))===f.sha256,'Frozen parent modified '+f.path);
}
console.log(JSON.stringify({packageId:'IH-005',scope:'Repair integrity, protected sources, public seam references; not semantic certification',checks,status:errors.length?'FAIL':'PASS',verifiedParent:arg>=0,errors},null,2));
process.exitCode=errors.length?1:0;
