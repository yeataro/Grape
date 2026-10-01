/** Minimal contract qualification only. NOT PRODUCTION IMPLEMENTATION; no Graph/UI/Host product runtime. */
import type { GraphKindDefinition, GraphKindRef, StageKindDefinition, GraphKindRegistry,
  CapabilityDefinition, CapabilityScope, CapabilityRef, CapabilityResolution, CapabilityDirectory,
  GLSLProfile, GLSLStageProgram, Json, NodeTypeRef, NodeEmission, BoundaryOutputSpec, GLSLExpression } from '../contracts/public-surface.ts';

function demand(value: unknown, code: string): asserts value { if (!value) throw Error(code); }
function id(value: string): boolean { return /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/.test(value); }
const key = (value: unknown): string => JSON.stringify(value);
const refKey = (r: GraphKindRef) => key([r.moduleId, r.kindId, r.version, r.fingerprint]);
function immutable<T>(v: T): T { if (v && typeof v === 'object' && !Object.isFrozen(v)) { for (const child of Object.values(v)) immutable(child); Object.freeze(v); } return v; }
function exactRef(ref: { moduleId: string; version: string; fingerprint: string }): boolean {
  return id(ref.moduleId) && !!ref.version.trim() && !!ref.fingerprint.trim();
}
const contractKey = (d: Pick<CapabilityDefinition<object>, 'ref' | 'owner' | 'scope' | 'operations'>) => key([d.ref.id, d.ref.contractVersion, d.owner.moduleId, d.owner.version, d.owner.fingerprint, d.scope, d.operations]);
function scopeKey(scope: CapabilityScope): string {
  if (scope.kind === 'application') return 'application';
  demand(scope.kind === 'target' && [scope.target.hostId, scope.target.targetId, scope.target.incarnation].every(v => typeof v === 'string' && v.length > 0), 'CAPABILITY_SCOPE');
  return key(['target', scope.target.hostId, scope.target.targetId, scope.target.incarnation]);
}

export class QualifiedGraphKinds implements GraphKindRegistry {
  #stages = new Map<string, StageKindDefinition>();
  #kinds = new Map<string, GraphKindDefinition>();
  #boundaryAvailable: (ref: NodeTypeRef) => boolean;
  constructor(boundaryAvailable: (ref: NodeTypeRef) => boolean) { this.#boundaryAvailable = boundaryAvailable; }
  registerStageKind(definition: StageKindDefinition): void {
    demand(id(definition.id) && exactRef(definition.owner) && !this.#stages.has(definition.id), 'STAGE_KIND_REGISTRATION');
    demand(definition.requiredGeneratorCapabilities.every(id), 'STAGE_CAPABILITY_ID');
    this.#stages.set(definition.id, immutable(structuredClone(definition)));
  }
  register(definition: GraphKindDefinition): void {
    demand(exactRef(definition.ref) && id(definition.ref.kindId) && !this.#kinds.has(refKey(definition.ref)), 'GRAPH_KIND_REGISTRATION');
    demand(definition.stages.length > 0, 'STAGE_TOPOLOGY_EMPTY');
    const slots = new Set<string>();
    for (const stage of definition.stages) {
      demand(stage.key && !slots.has(stage.key) && this.#stages.has(stage.stageKindId), 'STAGE_TOPOLOGY'); slots.add(stage.key);
      demand(stage.implementations.length > 0 && stage.implementations.includes(stage.defaultImplementation), 'STAGE_IMPLEMENTATION');
      demand(new Set(stage.implementations).size === stage.implementations.length && stage.implementations.every(mode => ['network', 'profile-default'].includes(mode)), 'STAGE_IMPLEMENTATION');
      const boundaries = new Set<string>();
      for (const boundary of stage.boundaries) {
        demand(boundary.key && !boundaries.has(boundary.key) && this.#boundaryAvailable(boundary.nodeType), 'BOUNDARY_DEFINITION'); boundaries.add(boundary.key);
        demand(!boundary.required || !boundary.removable, 'REQUIRED_BOUNDARY_REMOVABLE');
      }
    }
    demand(definition.requiredGeneratorCapabilities.every(id), 'GRAPH_CAPABILITY_ID');
    demand(definition.settingsCodec.validate(definition.defaultSettings).every(issue => issue.severity !== 'error'), 'GRAPH_SETTINGS');
    this.#kinds.set(refKey(definition.ref), immutable({ ...definition, ref: structuredClone(definition.ref), stages: structuredClone(definition.stages),
      defaultSettings: structuredClone(definition.defaultSettings), requiredGeneratorCapabilities: [...definition.requiredGeneratorCapabilities], settingsCodec: { ...definition.settingsCodec } }));
  }
  resolve(ref: GraphKindRef): Readonly<GraphKindDefinition> | undefined { return this.#kinds.get(refKey(ref)); }
  list(): readonly Readonly<GraphKindDefinition>[] { return Object.freeze([...this.#kinds.values()]); }
}

export class QualifiedCapabilities implements CapabilityDirectory {
  #definitions = new Map<string, CapabilityDefinition<object>>();
  #providers = new Map<string, object>();
  #ref(ref: CapabilityRef): string { return key([ref.id, ref.contractVersion]); }
  #provider(scope: CapabilityScope, ref: CapabilityRef): string { return key([scopeKey(scope), this.#ref(ref)]); }
  register<S extends object>(definition: CapabilityDefinition<S>): void {
    demand(id(definition.ref.id) && Number.isSafeInteger(definition.ref.contractVersion) && definition.ref.contractVersion > 0, 'CAPABILITY_ID');
    demand(exactRef(definition.owner) && ['application', 'target'].includes(definition.scope) && !this.#definitions.has(this.#ref(definition.ref)), 'CAPABILITY_REGISTRATION');
    demand(definition.operations.length > 0 && definition.operations.every(op => op.name.trim() && op.contract.trim() && ['query', 'mutation', 'event'].includes(op.effect)), 'CAPABILITY_CONTRACT');
    demand(new Set(definition.operations.map(op => op.name)).size === definition.operations.length, 'CAPABILITY_OPERATION_DUPLICATE');
    this.#definitions.set(this.#ref(definition.ref), immutable({ ref: structuredClone(definition.ref), owner: structuredClone(definition.owner), scope: definition.scope, operations: structuredClone(definition.operations) }));
  }
  provide<S extends object>(definition: CapabilityDefinition<S>, scope: CapabilityScope, service: S): void {
    const registered = this.#definitions.get(this.#ref(definition.ref));
    demand(registered && registered.scope === scope.kind && contractKey(registered) === contractKey(definition), 'CAPABILITY_NOT_REGISTERED');
    demand(!this.#providers.has(this.#provider(scope, definition.ref)), 'CAPABILITY_PROVIDER_DUPLICATE');
    this.#providers.set(this.#provider(scope, definition.ref), service);
  }
  require<S extends object>(definition: CapabilityDefinition<S>, scope: CapabilityScope): CapabilityResolution<S> {
    const registered = this.#definitions.get(this.#ref(definition.ref));
    const service = registered?.scope === scope.kind && contractKey(registered) === contractKey(definition) ? this.#providers.get(this.#provider(scope, definition.ref)) : undefined;
    return service ? { available: true, service: service as S } : { available: false, code: 'CAPABILITY_UNAVAILABLE', requested: structuredClone(definition.ref) };
  }
  withdraw(scope: CapabilityScope, ref: CapabilityRef): void { this.#providers.delete(this.#provider(scope, ref)); }
}

/** Admission before render: adding a registered semantic does not imply profile support. */
export function qualifyRender(profile: GLSLProfile, graphKind: GraphKindDefinition, settings: Json, stages: readonly GLSLStageProgram[], stageKinds: readonly StageKindDefinition[]) {
  demand(profile.language === 'glsl' && profile.graphKindIds.includes(graphKind.ref.kindId), 'PROFILE_GRAPH_UNSUPPORTED');
  demand(graphKind.settingsCodec.validate(settings).every(issue => issue.severity !== 'error'), 'GRAPH_SETTINGS');
  demand(stages.length === graphKind.stages.length && new Set(stages.map(stage => stage.slotKey)).size === stages.length, 'STAGE_TOPOLOGY');
  for (const slot of graphKind.stages) {
    const definition = stageKinds.find(kind => kind.id === slot.stageKindId);
    demand(definition, 'STAGE_KIND_UNRESOLVED');
    const stage = stages.find(stage => stage.slotKey === slot.key);
    demand(stage && stage.stageKindId === slot.stageKindId && slot.implementations.includes(stage.implementation), 'STAGE_TOPOLOGY');
    demand(profile.stageKindIds.includes(stage.stageKindId), 'PROFILE_STAGE_UNSUPPORTED');
    demand(definition.requiredGeneratorCapabilities.every(capability => profile.capabilities.includes(capability)), 'PROFILE_CAPABILITY_UNSUPPORTED');
  }
  demand(graphKind.requiredGeneratorCapabilities.every(capability => profile.capabilities.includes(capability)), 'PROFILE_CAPABILITY_UNSUPPORTED');
  return profile.render(immutable({ graphKind, kindSettings: structuredClone(settings), stages: structuredClone(stages) }));
}

/** One compiler boundary check, not a Graph generator. No caller data is mutated. */
export function qualifyBoundaryOutputs(role: 'operation' | 'boundary', specs: readonly BoundaryOutputSpec[], emission: NodeEmission,
  prior: Readonly<Record<string, GLSLExpression>> = {}): Readonly<Record<string, GLSLExpression>> {
  const actual = emission.boundaryOutputs ?? {};
  demand(role === 'boundary' || (specs.length === 0 && Object.keys(actual).length === 0), 'BOUNDARY_ROLE');
  demand(specs.every(spec => spec.key.length > 0 && spec.type.length > 0) && new Set(specs.map(s => s.key)).size === specs.length, 'BOUNDARY_SCHEMA');
  demand(specs.every(spec => !spec.required || Object.hasOwn(actual, spec.key)), 'BOUNDARY_REQUIRED');
  for (const [key, expression] of Object.entries(actual)) {
    const spec = specs.find(spec => spec.key === key);
    demand(spec && spec.type === expression.type && !Object.hasOwn(prior, key), 'BOUNDARY_OUTPUT');
  }
  return immutable(structuredClone({ ...prior, ...actual }));
}
