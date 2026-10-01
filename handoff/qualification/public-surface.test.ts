import test from 'node:test';
import assert from 'node:assert/strict';
import type { GraphKindDefinition, GLSLProfile, GLSLStageProgram, CapabilityDefinition, StageKindDefinition } from '../contracts/public-surface.ts';
import { PRODUCT_GRAPH_KIND_IDS, PRODUCT_STAGE_KIND_IDS, INITIAL_CAPABILITY_IDS } from '../contracts/public-surface.ts';
import { QualifiedCapabilities, QualifiedGraphKinds, qualifyRender, qualifyBoundaryOutputs } from './public-surface-probe.ts';
import type { StageRecord, GraphDocument } from '../executable-reference/contracts.ts';

const owner = { moduleId: 'grape.graph-kinds', version: 'test-1', fingerprint: 'fixture-not-production-pin' };
const boundary = { moduleId: 'grape.boundaries', typeId: 'output', version: 'test-1', fingerprint: 'fixture-output' };
const stageDefinitions: readonly StageKindDefinition[] = Object.values(PRODUCT_STAGE_KIND_IDS).map(id => ({ id, owner, requiredGeneratorCapabilities: [] }));
const definition = (id = PRODUCT_GRAPH_KIND_IDS.image): GraphKindDefinition => ({
  ref: { ...owner, kindId: id }, settingsCodec: { schemaVersion: 1, validate: () => [] }, defaultSettings: {}, requiredGeneratorCapabilities: [],
  stages: [
    { key: 'vertex', stageKindId: PRODUCT_STAGE_KIND_IDS.vertex, implementations: ['profile-default', 'network'], defaultImplementation: 'profile-default', boundaries: [] },
    { key: 'pixel', stageKindId: PRODUCT_STAGE_KIND_IDS.pixel, implementations: ['network'], defaultImplementation: 'network', boundaries: [{ key: 'output', nodeType: boundary, required: true, removable: false, initialState: {} }] },
  ],
});
const stages = (kind: GraphKindDefinition): GLSLStageProgram[] => kind.stages.map(slot => ({ stageId: 'stage-' + slot.key, slotKey: slot.key, stageKindId: slot.stageKindId,
  implementation: slot.defaultImplementation, globals: [], body: [], outputs: {}, varyings: [] }));
const profile = (kind: GraphKindDefinition): GLSLProfile => ({
  ref: { ...owner, profileId: 'qualification.glsl-shell' }, language: 'glsl', graphKindIds: [kind.ref.kindId], stageKindIds: kind.stages.map(slot => slot.stageKindId), capabilities: [],
  validateType: () => [], render: input => ({ artifacts: input.stages.map(stage => ({ key: stage.slotKey, stageId: stage.stageId, mediaType: 'text/x-glsl', text: '// ' + stage.stageKindId })), diagnostics: [] }),
});
function registry() { const registry = new QualifiedGraphKinds(ref => ref.moduleId === boundary.moduleId && ref.typeId === boundary.typeId);
  registry.registerStageKind({ id: PRODUCT_STAGE_KIND_IDS.vertex, owner, requiredGeneratorCapabilities: [] });
  registry.registerStageKind({ id: PRODUCT_STAGE_KIND_IDS.pixel, owner, requiredGeneratorCapabilities: [] }); return registry;
}
test('PC-CE original qualifier literal types are intentionally not the production extension contract', () => {
  // @ts-expect-error frozen qualification union cannot express the open registration ID.
  const oldStage: StageRecord['kind'] = 'vendor.stage.postprocess';
  // @ts-expect-error frozen experiment persists TD-specific kind names, not the product identity.
  const oldKind: GraphDocument['kind'] = PRODUCT_GRAPH_KIND_IDS.image;
  assert.equal(oldStage, 'vendor.stage.postprocess'); assert.equal(oldKind, 'grape.image');
});
test('PC-01 a new graph kind and stage kind register without extending a core union', () => {
  const r = registry(), extra = { ...definition(), ref: { ...owner, kindId: 'vendor.image-filter' }, stages: [{ ...definition().stages[1], key: 'post', stageKindId: 'vendor.stage.postprocess' }] };
  r.registerStageKind({ id: 'vendor.stage.postprocess', owner: { ...owner, moduleId: 'vendor.stages' }, requiredGeneratorCapabilities: [] });
  r.register(extra); assert.equal(r.resolve(extra.ref)?.stages[0].key, 'post');
  assert.equal(r.resolve({ ...extra.ref, fingerprint: 'different' }), undefined); assert.equal(r.list().length, 1);
});
test('PC-02 atomic admission rejects unknown stages, missing boundaries, duplicate pins and removable required boundary', () => {
  const r = registry(), baseline = definition(); r.register(baseline);
  assert.throws(() => r.register(baseline), /REGISTRATION/);
  const candidate = (patch: Partial<GraphKindDefinition>): GraphKindDefinition => ({ ...definition(), ref: { ...owner, kindId: 'vendor.other' }, ...patch });
  assert.throws(() => r.register(candidate({ stages: [{ ...baseline.stages[1], stageKindId: 'vendor.absent' }] })), /TOPOLOGY/);
  assert.throws(() => r.register(candidate({ stages: [{ ...baseline.stages[1], boundaries: [{ ...baseline.stages[1].boundaries[0], nodeType: { ...boundary, typeId: 'absent' } }] }] })), /BOUNDARY/);
  assert.throws(() => r.register(candidate({ stages: [{ ...baseline.stages[1], boundaries: [{ ...baseline.stages[1].boundaries[0], removable: true }] }] })), /REMOVABLE/);
  assert.equal(r.list().length, 1); assert.ok(Object.isFrozen(r.resolve(baseline.ref)!.stages));
});
test('PC-03 product graph identity has no Host requirement and image/material are explicit stable IDs', () => {
  const r = registry(); r.register(definition());
  assert.equal(r.resolve(definition().ref)?.ref.kindId, 'grape.image'); assert.equal(PRODUCT_GRAPH_KIND_IDS.material, 'grape.material');
  assert.deepEqual(definition().stages.map(slot => slot.key), ['vertex', 'pixel']);
});
test('PC-04 profile input uses registered stage entries; pass settings do not create Stage parents or copies', () => {
  const kind = definition(), programs = stages(kind), inputSettings = { passes: [{ target: 'scratch' }, { target: 'output' }] };
  let received = 0;
  const p = { ...profile(kind), render: (input: Parameters<GLSLProfile['render']>[0]) => { received = input.stages.length; assert.deepEqual(input.kindSettings, inputSettings); return profile(kind).render(input); } };
  assert.equal(qualifyRender(p, kind, inputSettings, programs, stageDefinitions).artifacts.length, 2); assert.equal(received, 2);
  assert.deepEqual(programs, stages(kind));
});
test('PC-05 profile rejects unsupported registered stage/topology before calling render', () => {
  const kind = definition(), p = profile(kind); let called = false;
  const limited: GLSLProfile = { ...p, stageKindIds: [PRODUCT_STAGE_KIND_IDS.pixel], render: () => { called = true; return { artifacts: [], diagnostics: [] }; } };
  assert.throws(() => qualifyRender(limited, kind, {}, stages(kind), stageDefinitions), /PROFILE_STAGE_UNSUPPORTED/); assert.equal(called, false);
  assert.throws(() => qualifyRender(p, kind, {}, [stages(kind)[0], stages(kind)[0]], stageDefinitions), /STAGE_TOPOLOGY/);
});
interface ReadExposure { read(): number }
const capability: CapabilityDefinition<ReadExposure> = { ref: { id: 'vendor.host.exposure', contractVersion: 1 }, owner: { ...owner, moduleId: 'vendor.exposure' }, scope: 'target', operations: [{ name: 'read', contract: 'vendor.exposure/read@1', effect: 'query' }] };
const target = { kind: 'target' as const, target: { hostId: 'host', targetId: 'target', incarnation: 'start-a' } };
test('PC-06 new typed Host capability is open by namespace and remains scoped to exact target incarnation', () => {
  const r = new QualifiedCapabilities(); r.register(capability); r.provide(capability, target, { read: () => 42 });
  const found = r.require(capability, target); assert.equal(found.available, true); if (found.available) assert.equal(found.service.read(), 42);
  assert.equal(r.require(capability, { ...target, target: { ...target.target, incarnation: 'start-b' } }).available, false);
  r.withdraw(target, capability.ref); assert.equal(r.require(capability, target).available, false);
});
test('PC-07 unavailable versions and duplicate/underspecified registration never produce an untyped service', () => {
  const r = new QualifiedCapabilities(); r.register(capability);
  assert.throws(() => r.register(capability), /CAPABILITY_REGISTRATION/);
  assert.equal(r.require({ ...capability, ref: { ...capability.ref, contractVersion: 2 } }, target).available, false);
  assert.throws(() => r.register({ ...capability, ref: { id: 'vendor.empty', contractVersion: 1 }, operations: [] }), /CAPABILITY_CONTRACT/);
  assert.throws(() => r.provide(capability, { kind: 'application' }, { read: () => 1 }), /CAPABILITY_NOT_REGISTERED/);
});
test('PC-08 application export/discovery capabilities require no fabricated Host identity', () => {
  interface Exporter { exportText(text: string): string }
  const key: CapabilityDefinition<Exporter> = { ref: { id: INITIAL_CAPABILITY_IDS.documentExport, contractVersion: 1 }, owner, scope: 'application', operations: [{ name: 'exportText', contract: 'grape.export/text@1', effect: 'mutation' }] };
  const r = new QualifiedCapabilities(); r.register(key); r.provide(key, { kind: 'application' }, { exportText: text => text });
  const found = r.require(key, { kind: 'application' }); assert.equal(found.available, true); if (found.available) assert.equal(found.service.exportText('document'), 'document');
});

test('PC-09 stage-required capability is checked before render, independently of GraphKind requirements', () => {
  const kind = definition();
  const required = stageDefinitions.map(s => ({ ...s, requiredGeneratorCapabilities: ['vendor.glsl.feature'] }));
  assert.throws(() => qualifyRender(profile(kind), kind, {}, stages(kind), required), /PROFILE_CAPABILITY_UNSUPPORTED/);
  assert.throws(() => qualifyRender(profile(kind), kind, {}, stages(kind), []), /STAGE_KIND_UNRESOLVED/);
  assert.equal(qualifyRender({ ...profile(kind), capabilities: ['vendor.glsl.feature'] }, kind, {}, stages(kind), required).artifacts.length, 2);
});

test('PC-10 changed operation contract cannot masquerade as a registered service; scope key ignores object field ordering', () => {
  const r = new QualifiedCapabilities(); r.register(capability); r.provide(capability, target, { read: () => 42 });
  const forged = { ...capability, operations: [{ name: 'write', contract: 'vendor.exposure/write@1', effect: 'mutation' as const }] };
  assert.equal(r.require(forged, target).available, false);
  assert.throws(() => r.provide(forged, { ...target, target: { ...target.target, incarnation: 'other' } }, { read: () => 42 }), /CAPABILITY_NOT_REGISTERED/);
  assert.equal(r.require(capability, { kind: 'target', target: { incarnation: 'start-a', targetId: 'target', hostId: 'host' } }).available, true);
});

test('PC-11 declared Stage outputs are separate from normal ports and merge without mutating prior results', () => {
  const specs = [{ key: 'color', type: 'vec4', required: true }];
  const expression = { type: 'vec4', code: 'vec4(1.0)' };
  const prior = { position: expression };
  const out = qualifyBoundaryOutputs('boundary', specs, { outputs: { arbitraryPort: expression }, boundaryOutputs: { color: expression } }, prior);
  assert.deepEqual(Object.keys(out), ['position', 'color']); assert.deepEqual(Object.keys(prior), ['position']);
  assert.ok(Object.isFrozen(out.color));
});

test('PC-12 boundary role, required keys, type, duplicate key and declaration failures reject before Stage mutation', () => {
  const specs = [{ key: 'color', type: 'vec4', required: true }], expression = { type: 'vec4', code: 'vec4(1.0)' };
  assert.throws(() => qualifyBoundaryOutputs('operation', specs, { outputs: {}, boundaryOutputs: { color: expression } }), /BOUNDARY_ROLE/);
  assert.throws(() => qualifyBoundaryOutputs('boundary', specs, { outputs: {} }), /BOUNDARY_REQUIRED/);
  assert.throws(() => qualifyBoundaryOutputs('boundary', specs, { outputs: {}, boundaryOutputs: { color: { type: 'float', code: '1.0' } } }), /BOUNDARY_OUTPUT/);
  assert.throws(() => qualifyBoundaryOutputs('boundary', specs, { outputs: {}, boundaryOutputs: { color: expression } }, { color: expression }), /BOUNDARY_OUTPUT/);
  assert.throws(() => qualifyBoundaryOutputs('boundary', [...specs,...specs], { outputs: {}, boundaryOutputs: { color: expression } }), /BOUNDARY_SCHEMA/);
});

