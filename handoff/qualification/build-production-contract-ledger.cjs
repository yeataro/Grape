// Handoff authoring utility. Updates the reviewed ledger only when explicitly invoked; not a product build step.
const fs = require('node:fs');
const crypto = require('node:crypto');
const ts = require('../executable-reference/node_modules/typescript');
const source = 'executable-reference/contracts.ts';
const text = fs.readFileSync(source, 'utf8');
const ast = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true);
const N = 'NORMATIVE_SHAPE_RENAMEABLE', Q = 'QUALIFICATION_ONLY', E = 'EXACT_IDENTITY';
const groups = {
 Json:[N,'contracts/public-surface.ts#Json','JSON-safe module-owned data; graph edits remain behind the operation boundary.'],
 Scalar:[Q,'13_PRODUCTION_CONTRACT_SURFACE.md#1','Fixed scalar list is a qualifier convenience; TypeEnvironment resolves supported shader types.'],
 ValueType:[N,'02_ARCHITECTURE_SPEC.md','Type token resolves through shared TypeEnvironment; arbitrary strings are invalid.'],
 Value:[N,'02_ARCHITECTURE_SPEC.md','Typed shader input data, narrower than arbitrary JSON; validate with resolved type.'],
 TypeRef:[E,'contracts/public-surface.ts#NodeTypeRef','Exact module/type/version/fingerprint identity; no fallback to similar name.'],
 ModuleRef:[E,'contracts/public-surface.ts#ModuleRef','Exact module pin; manifest spelling id is mapped to moduleId at the document boundary.'],
 Reference:[N,'contracts/document-format.ts#DocumentReference','Explicit reference semantics preserved; canonical serialized shape is slot/kind/targetId/networkId, not a map of hidden strings.'],
 PortSpec:[N,'04_EXTENSION_MODEL.md','Module-owned derived schema; stable keys and shared type semantics; no UI value owner.'],
 Endpoint:[N,'contracts/document-format.ts#EdgeDocument','Logical Node+port endpoint in one Network; runtime lease additionally requires load/scope validation.'],
 Adaptation:[N,'contracts/document-format.ts#EdgeAdaptationDocument','Runtime conversion semantics are retained; exact wire uses schema/version/sourceType/targetType/operation/extensions with explicit mapping in14, never serialize from/to/op unchanged.'],
 NodeRecord:[Q,'contracts/document-format.ts#NodeDocument','Reference mutable record layout is not production format; persistent identity/state/reference behavior remains normative.'],
 EdgeRecord:[Q,'contracts/document-format.ts#EdgeDocument','Use canonical Edge DTO and immutable public projection; qualifier record is not a live mutable API.'],
 LossRecord:[N,'contracts/document-format.ts#LossDocument','Runtime loss semantics are model state in the same atomic operation; exact wire is a versioned grape.loss envelope with discriminated evidence payload. See14 for mapping; broad runtime fields are not canonical wire.'],
 StageRecord:[Q,'contracts/document-format.ts#StageDocument','Production Stage separates id/key/stageKindId and owns Network; never adopt closed fixture union.'],
 GraphDocument:[Q,'contracts/document-format.ts#CanonicalGraphDocument','Production document is grape.document 2.0; experimental envelope and TD kind literals are not a product format.'],
 Issue:[N,'contracts/public-surface.ts#ContractIssue','Stable code/severity/subject; feature-owned text uses LocalizableIssue, external raw diagnostics preserve origin.'],
 Failure:[N,'05_DATA_AND_LIFECYCLE.md','Failure preserves machine code and atomic/no-partial-commit semantics; feature text must be localizable.'],
 Result:[N,'05_DATA_AND_LIFECYCLE.md','Success/failure must be explicit; exact TypeScript discriminant spelling is engineering-owned.'],
 ParameterPresentation:[N,'contracts/public-surface.ts#ParameterPresentation','Widget identity/options/fallback only; not translated content and not canonical Parameter value.'],
 ParameterSpec:[N,'04_EXTENSION_MODEL.md','Editing entry maps to one state/input target with typed validation; local min/max/clamp does not change GLSL type.'],
 NodeInit:[N,'04_EXTENSION_MODEL.md','Candidate initialization produces owned data, not a live mutable Node; validate before atomic insertion.'],
 TypedExpression:[N,'contracts/public-surface.ts#GLSLExpression','Typed GLSL expression; constant is an explicit proof claim validated by compiler contract.'],
 ModuleContext:[N,'04_EXTENSION_MODEL.md','Read-only scoped queries; no Graph mutation, no private state authority and no dependency on UI.'],
 EmitContext:[N,'04_EXTENSION_MODEL.md','Compilation-owned naming/helper/input/provenance capabilities for one immutable snapshot.'],
 NodeEmission:[N,'13_PRODUCTION_CONTRACT_SURFACE.md#4','Typed GLSL output/statements/effects; boundary result aliases normalized as declared stable output map.'],
 NodeType:[N,'04_EXTENSION_MODEL.md','Definition-owned callbacks construct and validate candidate schema/emission; dynamic edits remain Graph operations.'],
 ModuleManifest:[N,'04_EXTENSION_MODEL.md','Exact provenance/dependencies/license plus declared SDK compatibility. Fixture coreApiVersion literal is not release policy.'],
 NodeModule:[N,'04_EXTENSION_MODEL.md','Contributes definitions/resource validation; module-local implementation permitted, cross-module private mutation forbidden.'],
 DefinitionResolver:[N,'02_ARCHITECTURE_SPEC.md','Exact fixed DefinitionSet resolution; missing module remains preservable; no silent latest-version substitution.'],
 Snapshot:[N,'05_DATA_AND_LIFECYCLE.md','Immutable document/revision/load/diagnostics plus pinned definitions; generation never observes live changing state.'],
 GenerationResult:[N,'13_PRODUCTION_CONTRACT_SURFACE.md#4','Artifacts plus provenance and snapshot identity; replaces fixed vertex/pixel pair without losing source mapping.'],
 ChangeEvent:[N,'05_DATA_AND_LIFECYCLE.md','Publish coherent state after model/diagnostic/context projection; observer failures isolated; owner-local no reentry.'],
 OperationEndEvent:[N,'05_DATA_AND_LIFECYCLE.md','End/cancel boundary drives history/update policy; not an instruction to regenerate or publish every event.'],
 StorageAdapter:[N,'05_DATA_AND_LIFECYCLE.md','Storage capability returns read/write outcome; save receipt applies only to captured state, not later edits.'],
};
const overrides = {
 'PortSpec.semantic':[N,'contracts/document-format.ts#PortSnapshot','Semantic/style identifiers can be registered; finite qualifier literals are not the whole product style domain.'],
 'PortSpec.key':[E,'04_EXTENSION_MODEL.md','Stable port key scoped by direction/Node; renaming a visible label never changes connectivity.'],
 'Endpoint.key':[Q,'contracts/document-format.ts#EdgeDocument','Serialized production spelling is portKey; preserve endpoint identity semantics.'],
 'Issue.message':[Q,'contracts/public-surface.ts#LocalizableIssue','Raw English string alone is not feature diagnostic identity; use code and TextRef, retain message only as default/external fallback.'],
 'Issue.subject':[N,'contracts/public-surface.ts#ContractIssue','Include Graph/Stage/networkPath and object keys as relevant; nested subject cannot silently resolve to root.'],
 'Failure.message':[Q,'contracts/public-surface.ts#LocalizableIssue','Localizable production diagnostic at feature boundary; raw external text stays raw.'],
 'ParameterSpec.presentation':[Q,'contracts/public-surface.ts#ParameterPresentation','number/menu literal shortcuts are fixture-only; production uses registered widget descriptor.'],
 'ParameterPresentation.options':[N,'contracts/localization.ts#MenuPresentationOptions','Widget-owned JSON options; menu choices use grape.ui.menu-items.v1 TextRef labels, never translated semantic values. Old handoff.menu-items.v1 literal-label examples are qualification-only.'],
 'ModuleContext.graphKind':[N,'contracts/public-surface.ts#GraphKindRef','Read exact registered kind reference, not td.top/td.mat union.'],
 'ModuleContext.stageKind':[N,'contracts/public-surface.ts#StageKindId','Read registered StageKindId, not closed vertex/pixel union.'],
 'NodeEmission.color':[Q,'contracts/public-surface.ts#NodeEmission','Convenience output alias replaced by boundaryOutputs, separate from normal port outputs; validated against NodeTypeBoundaryMetadata.'],
 'NodeEmission.position':[Q,'contracts/public-surface.ts#NodeEmission','Convenience output alias replaced by boundaryOutputs, separate from normal port outputs; validated against NodeTypeBoundaryMetadata.'],
 'NodeType.ref':[E,'contracts/public-surface.ts#NodeTypeRef','Exact definition identity survives storage and missing module restoration.'],
 'NodeType.stages':[Q,'contracts/public-surface.ts#NodeEligibility','Production stageKindIds references open registered IDs.'],
 'NodeType.targets':[Q,'contracts/public-surface.ts#NodeEligibility','Production graphKindIds restriction is independent of Host target identity.'],
 'NodeType.requiredCapabilities':[N,'contracts/public-surface.ts#NodeEligibility','Generator requirements, never Host service availability.'],
 'NodeType.stageOutput':[Q,'contracts/public-surface.ts#NodeTypeBoundaryMetadata','boundaryOutputs(state,resolvedPorts) declares stable keys/types/required; NodeEmission.boundaryOutputs supplies results; no positional special case.'],
 'NodeType.stateCodec':[N,'contracts/public-surface.ts#LocalizableIssue','Same module-owned codec lifecycle; production validate returns LocalizableIssue[], not string[].'],
 'NodeType.validate':[N,'contracts/public-surface.ts#LocalizableIssue','Production returns structured LocalizableIssue[]; caller supplies scoped subject; Generator does not localize.'],
 'NodeModule.resourceValidators':[N,'contracts/public-surface.ts#LocalizableIssue','Production resource validation returns structured LocalizableIssue[] with same owner/mutation guard.'],
 'ModuleManifest.coreApiVersion':[Q,'04_EXTENSION_MODEL.md','Literal 1 is qualifier compatibility only; production SDK has an explicit version/compatibility policy.'],
 'Snapshot.document':[N,'contracts/document-format.ts#CanonicalGraphDocument','Immutable snapshot wraps production DTO; experimental envelope is not retained.'],
 'GenerationResult.vertex':[Q,'contracts/public-surface.ts#GeneratedArtifact','Artifact entry keyed by stable artifact key and Stage ID, not universal fixed return field.'],
 'GenerationResult.pixel':[Q,'contracts/public-surface.ts#GeneratedArtifact','Artifact entry keyed by stable artifact key and Stage ID, not universal fixed return field.'],
 'GenerationResult.diagnosticMap':[N,'13_PRODUCTION_CONTRACT_SURFACE.md#4','Keep artifact/profile/path/line provenance; stage identifier uses registered Stage identity, not literal union.'],
};
const exported = ast.statements.filter(n => n.name && n.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) && (ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n)));
const records = exported.map(node => {
 const name = node.name.text, d = groups[name]; if (!d) throw Error('unclassified export '+name);
 const fields = ts.isInterfaceDeclaration(node) ? node.members.map(member => {
  const field = member.name ? member.name.getText(ast) : '[extension]';
  const x = overrides[name+'.'+field] || d;
  return {field,classification:x[0],productionContract:x[1],reason:x[2]};
 }) : [];
 return {sourceSymbol:name,sourceLine:ast.getLineAndCharacterOfPosition(node.getStart(ast)).line+1,classification:d[0],productionContract:d[1],reason:d[2],fields};
});
const output = {
 schemaVersion:1,revision:'IH-005',changeId:'AC-IH005-01',status:'EXPERIMENTAL_BUT_CURRENTLY_ACCEPTED',
 scope:'Production contract interpretation and open seams; no production implementation and no new ownership.',
 source:{path:source,sha256:crypto.createHash('sha256').update(text).digest('hex')},
 precedence:['02..06 responsibility/lifecycle semantics','13 plus this field disposition ledger','contracts/public-surface.ts','14/contracts/document-format.ts','15/contracts/localization.ts'],
 classificationMeaning:{[E]:'Persistent/protocol identity or exact pin: change requires migration/compatibility decision.',[N]:'Normative information/effects/authority, coherently renameable SDK symbols; not permission to weaken semantics.',[Q]:'Reference-only shape/implementation. Preserve behavioral assertion using listed production replacement, never source-copy.'},
 nonRenamableDomains:['document format/field keys','exact definition refs','Node/Resource/Network persistent IDs','port and parameter stable keys','GraphKind/StageKind IDs','capability ID and contract version','catalog owner/key identity'],
 records,
 additions:[
  {id:'PC-GRAPH-KIND',contract:'contracts/public-surface.ts#GraphKindDefinition',classification:N,replaces:['GraphDocument.kind','StageRecord.kind','NodeType.stages','NodeType.targets'],invariants:['INV-012','INV-013','INV-014','INV-017','CP-01'],status:'EXPERIMENTAL_BUT_CURRENTLY_ACCEPTED'},
  {id:'PC-GLSL-PROFILE',contract:'contracts/public-surface.ts#GLSLProfile',classification:N,replaces:['generator.ts:GenerationProfile','generator.ts:GeneratedStageProgram','GenerationResult.vertex','GenerationResult.pixel'],invariants:['INV-015','INV-016','CP-03'],status:'EXPERIMENTAL_BUT_CURRENTLY_ACCEPTED'},
  {id:'PC-BOUNDARY-OUTPUTS',contract:'contracts/public-surface.ts#NodeTypeBoundaryMetadata',classification:N,replaces:['NodeType.stageOutput','NodeEmission.color','NodeEmission.position'],invariants:['INV-012','INV-015','CP-03'],status:'EXPERIMENTAL_BUT_CURRENTLY_ACCEPTED'},
  {id:'PC-CAPABILITY',contract:'contracts/public-surface.ts#CapabilityDirectory',classification:N,replaces:['qualification-host.ts:ServiceName closed union'],invariants:['CP-01','CP-02'],status:'EXPERIMENTAL_BUT_CURRENTLY_ACCEPTED'},
  {id:'PC-NODE-METADATA',contract:'contracts/public-surface.ts#PresentedNodeType',classification:N,replaces:[],invariants:['CP-02','CP-03'],status:'EXPERIMENTAL_BUT_CURRENTLY_ACCEPTED'},
  {id:'PC-MODULE-METADATA',contract:'contracts/public-surface.ts#PresentedNodeModule',classification:N,replaces:[],invariants:['CP-02'],status:'EXPERIMENTAL_BUT_CURRENTLY_ACCEPTED'},
  {id:'PC-PANEL-METADATA',contract:'contracts/public-surface.ts#PresentedPanelType',classification:N,replaces:[],invariants:['CP-04'],status:'EXPERIMENTAL_BUT_CURRENTLY_ACCEPTED'},
  {id:'PC-PANEL-COMPOSITION',contract:'executable-reference/repair/PANEL_COMPOSITION_CONTRACT.md',classification:N,replaces:['qualification-workspace.ts:PanelKind closed union','toy PanelTemplateHost'],invariants:['INV-009','INV-019','CP-04'],status:'INHERITED_IH002_SEMANTICS_IMPLEMENTATION_NOT_REUSABLE'},
  {id:'PC-DOCUMENT',contract:'contracts/document-format.ts#CanonicalGraphDocument',classification:E,replaces:['GraphDocument'],invariants:['INV-017','INV-018','CP-01'],status:'EXPERIMENTAL_BUT_CURRENTLY_ACCEPTED'},
 ],
 implementationBan:{paths:['executable-reference/**','qualification/**'],rule:'Production code cannot import/copy/rename-and-extend reference implementations. Port behavior assertions to production SDK harness; class/file/method names engineering-owned while semantic contract retained.',allowed:'Type/contract reading and mapping; production uses its own SDK. contracts/public-surface.ts/localization.ts declarations may seed that SDK. document-format.ts DTO declarations may seed schema; codec qualification is not a production storage service.'},
 examples:[
  {path:'examples/minimal-node',production:['DefinitionRegistry','PresentedNodeModule','PresentedNodeType','Graph operation','TypeEnvironment'],notProduction:'reference Graph/fixture implementation'},
  {path:'examples/dynamic-interface-node',production:['PresentedNodeType','atomic schema reconciliation','stable port identity'],notProduction:'type-name special cases or bounded schema algorithm'},
  {path:'examples/minimal-panel',production:['PresentedPanelType','public Workspace composition','PanelServices','scoped TargetResolver'],notProduction:'PanelTemplateHost alternative or reference workspace implementation'},
  {path:'examples/parameter-widget-or-ui-contribution',production:['Widget registry','ParameterPresentation','scoped Parameter target/draft'],notProduction:'root-only lookup or private Panel access'},
  {path:'examples/minimal-host-adapter',production:['CapabilityDirectory','publication executor','fenced target lifecycle','receipts'],notProduction:'receiver double or fixture transport as TD integration'},
 ],
 validation:{direct:'qualification/public-surface.test.ts',ledger:'qualification/production-contract-ledger.test.ts',limits:['No GPU/TD compile','No arbitrary shader-language IR','No DOM renderer qualification','No product external format support-duration commitment']},
};
// Preserve reviewed additive seams from the immutable immediate-parent ledger.
const parent = JSON.parse(fs.readFileSync('provenance/IH-004_CONTRACT_LEDGER.json','utf8'));
output.additions = [...new Map([...parent.additions,...output.additions].map(x=>[x.id,x])).values()];
output.examples = parent.examples;
output.implementationBan = parent.implementationBan;
output.implementationBan.allowed += ' contracts/panel-commands.ts declarations may seed the SDK; application command adapters and gesture fixtures are qualification-only.';
output.additiveChangeIds = [...new Set([...(parent.additiveChangeIds??[]),'AC-IH005-01','AC-IH005-02'])];
output.additions.push(
 {id:'PC-WIRE-EVIDENCE',contract:'contracts/document-format.ts#EdgeAdaptationDocument',classification:E,changeId:'AC-IH005-01',spec:'14_DOCUMENT_FORMAT.md',semantics:'Document2.0 exact core schema/version; loss/recovery tagged evidence, nested fencing and owner codec identity. No implicit restore or reference runtime shape adoption.'},
 {id:'PC-PRESERVATION-CODECS',contract:'contracts/document-format.ts#PreservationCodecResolver',classification:N,changeId:'AC-IH005-01',spec:'14_DOCUMENT_FORMAT.md',semantics:'Exact owner pin plus codecId/version; optional module-owned codecs validate opaque evidence without Graph handle. Core tagged envelopes retain exact wire identity.'},
 {id:'PC-PANEL-COMMANDS',contract:'contracts/panel-commands.ts#PanelCommands',classification:N,changeId:'AC-IH005-02',spec:'17_PANEL_COMMAND_CONTRACT.md',semantics:'Application-authorized Panel instance + target lease + live user-event capability; readonly Panels receive no mutation grant.'}
);
output.precedence = [...parent.precedence, '17/contracts/panel-commands.ts (additive scoped editing authority)', 'IH-005 document 2.0 wire definitions in14 replace historical untyped adaptation/loss/recovery'];
output.examples.push({path:'examples/editable-panel',production:['PanelType.commandIds','ApplicationPanelCommandAuthority','PanelMountContext.commands','PanelCommandLease','application-owned Operation'],notProduction:'example command executor, fake mounting controls or reference Graph as product foundation'});
fs.writeFileSync('data/production-contract-ledger.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({exports:records.length,fields:records.reduce((n,r)=>n+r.fields.length,0)}));
