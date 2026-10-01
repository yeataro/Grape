// Shared experimental contracts. No dependency on a product implementation.
export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json };
export type Scalar = "float" | "int" | "uint" | "bool" | "double";
// A type token is resolved by TypeEnvironment; arbitrary strings are NOT valid types.
// @<resource-id> is nominal; fixed arrays use T[N]. Missing nominal types can be saved.
export type ValueType = string;
export type Value = number | boolean | Value[] | { [key: string]: Value };
export interface TypeRef {
  moduleId: string;
  typeId: string;
  version: string;
  fingerprint: string;
}
export type ModuleRef = Pick<TypeRef, "moduleId" | "version" | "fingerprint">;
export interface Reference {
  kind: "node" | "resource";
  targetId: string;
}
export interface PortSpec {
  key: string;
  direction: "input" | "output";
  type: ValueType;
  semantic?: "value" | "rgb" | "rgba" | "xyz" | "uv";
  supply?: "local" | "required";
  default?: Value;
  requireConstant?: boolean;
  connectionPolicy?: "default" | "numeric" | "exact";
}
export interface Endpoint {
  nodeId: string;
  key: string;
}
export interface Adaptation {
  from: ValueType;
  to: ValueType;
  op: "identity" | "broadcast" | "take" | "alpha" | "cast";
}
export interface NodeRecord {
  id: string;
  name: string;
  typeRef: TypeRef;
  state: Json;
  position: [number, number];
  ports: PortSpec[];
  values: Record<string, Value>;
  references: Record<string, Reference>;
  referencesComplete: boolean;
  [extension: string]: unknown;
}
export interface EdgeRecord {
  id: string;
  from: Endpoint;
  to: Endpoint;
  adaptation: Adaptation;
  invalid?: { code: "INTERFACE_CHANGED"; reason: string };
}
export interface LossRecord {
  id: string;
  reason: string;
  nodeId: string;
  resourceId?: string;
  edge?: EdgeRecord;
  inputKey?: string;
  value?: Value;
}
export interface StageRecord {
  id: string;
  kind: "vertex" | "pixel";
  implementation: "default" | "network";
  nodes: NodeRecord[];
  edges: EdgeRecord[];
}
export interface GraphDocument {
  format: "grape-core-experiment";
  formatVersion: 1;
  id: string;
  name: string;
  kind: "td.top" | "td.mat";
  outputType: TypeRef;
  definitions: TypeRef[];
  modules?: ModuleRef[];
  stages: StageRecord[];
  losses: LossRecord[];
  resources: { id: string; data: Json }[];
  recovery: Json[];
  [extension: string]: unknown;
}
export interface Issue {
  code: string;
  severity: "error" | "warning";
  message: string;
  subject: { nodeId?: string; edgeId?: string; lossId?: string; resourceId?: string };
}
export interface Failure {
  code: string;
  message: string;
}
export type Result<T> = { ok: true; value: T } | { ok: false; error: Failure };
export interface ParameterPresentation {
  /** UI registry identity, never a GLSL data type or an executable callback. */
  widget: string;
  options?: Record<string, Json>;
  fallback?: "auto" | "none";
}
export interface ParameterSpec {
  key: string;
  target: { kind: "state"; key: string } | { kind: "input"; key: string };
  // The two original spellings remain shorthand for core.number/core.menu.
  presentation: "number" | "menu" | ParameterPresentation;
  min?: number;
  max?: number;
  clamp?: boolean;
}
export interface NodeInit {
  state: Json;
  references?: Record<string, Reference>;
  referencesComplete?: boolean;
}
export interface TypedExpression {
  type: ValueType;
  code: string;
  // Only an emitter that can prove a GLSL constant expression may opt in.
  constant?: boolean;
}
export interface ModuleContext {
  readonly graphKind: GraphDocument["kind"];
  readonly stageKind: StageRecord["kind"];
  readonly nodeId: string;
  resource(id: string): Json | undefined;
  resources(kind?: string): readonly { id: string; data: Json }[];
  referenceId(key: string): string | undefined;
  resolveType(ref: TypeRef): NodeType | undefined;
  inputSource(key: string): { nodeId: string; key: string; port: PortSpec } | undefined;
  reference(key: string): Json | NodeRecord | undefined;
}
export interface EmitContext extends ModuleContext {
  requireCapability(id: string): void;
  trace(origin: { path: readonly string[]; definitionId?: string; portKey?: string }, code: string): string;
  input(key: string): TypedExpression;
  local(key: string): string;
  helper(key: string, body: string): string;
  uniform(resourceId: string, type: ValueType): TypedExpression;
  varying(key: string, type: ValueType, value?: TypedExpression): TypedExpression;
}
export interface NodeEmission {
  outputs: Record<string, TypedExpression>;
  color?: TypedExpression;
  position?: TypedExpression;
  statements?: string[];
  effects?: ({ kind: "discard"; condition: TypedExpression } | { kind: "depth"; value: TypedExpression })[];
}
export interface NodeType {
  ref: TypeRef;
  role: "operation" | "boundary";
  stages: ("vertex" | "pixel")[];
  targets?: GraphDocument["kind"][];
  requiredCapabilities?: readonly string[];
  // Effects are explicit roots even when no data output reaches the color boundary.
  effectRoot?: boolean;
  stageOutput?: "position";
  invalidEdgePolicy?: "detach" | "preserve";
  connectionTypePolicy?: "fixed" | "infer";
  stateReferences?: {
    collect(state: Json): string[];
    remap(state: Json, resourceId: (id: string) => string): Json;
  };
  stateCodec: { schemaVersion: number; validate(state: Json): string[] };
  initialize(args: Json, context?: ModuleContext): NodeInit;
  ports(state: Json, context?: ModuleContext): PortSpec[];
  parameters(state: Json): ParameterSpec[];
  validate(state: Json, context?: ModuleContext): string[];
  emit(state: Json, context: EmitContext): NodeEmission;
}
export interface ModuleManifest {
  id: string;
  version: string;
  fingerprint: string;
  coreApiVersion: 1;
  dependencies: { id: string; version: string; fingerprint: string }[];
  source: string;
  license: string;
}
export interface NodeModule {
  manifest: ModuleManifest;
  types: NodeType[];
  resourceValidators?: Record<string, (data: Json, context: ModuleContext) => string[]>;
}
export interface DefinitionResolver {
  resolve(ref: TypeRef): NodeType | undefined;
  validateResources?(document: GraphDocument): Issue[];
}
export interface Snapshot {
  document: GraphDocument;
  revision: number;
  loadId: string;
  diagnostics: Issue[];
  definitions: DefinitionResolver;
}
export interface GenerationResult {
  vertex: string;
  pixel: string;
  revision: number;
  loadId: string;
  sourceMap: { symbol: string; nodeId: string; portKey: string }[];
  diagnosticMap?: {
    artifactKey: string;
    profileId: string;
    spans: { stage: "vertex" | "pixel"; startLine: number; endLine: number; path: string[]; definitionId?: string; portKey?: string }[];
  };
}
export interface ChangeEvent {
  kind: "change" | "cancel" | "undo" | "redo";
  revision: number;
  operationId: string | null;
  snapshot: Snapshot;
}
export interface OperationEndEvent {
  operationId: string;
  cancelled: boolean;
  snapshot: Snapshot;
}
export interface StorageAdapter {
  write(text: string): Promise<void>;
  read(): Promise<string>;
}
