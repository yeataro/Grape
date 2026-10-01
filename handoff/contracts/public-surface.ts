/** IH-003 normative production contract shapes. Declarations only, not product implementation.
 * TypeScript symbol spelling is renameable within one production SDK; serialized identifiers below are not.
 */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export interface ModuleRef { readonly moduleId: string; readonly version: string; readonly fingerprint: string }
export interface NodeTypeRef extends ModuleRef { readonly typeId: string }
export interface GraphKindRef extends ModuleRef { readonly kindId: string }
export interface ProfileRef extends ModuleRef { readonly profileId: string }
export type NamespacedId = string;
export type StageKindId = NamespacedId;
export type GraphKindId = NamespacedId;
export type WidgetId = NamespacedId;
export type CapabilityId = NamespacedId;
export interface ContractIssue {
  readonly code: string; readonly severity: 'error' | 'warning';
  /** Default/external fallback. Never infer a translation key from this string. */
  readonly message: string;
  readonly messageRef?: import('./localization.ts').TextRef;
  readonly subject?: Readonly<{ graphId?: string; stageId?: string; networkPath?: readonly string[];
    nodeId?: string; portKey?: string; parameterKey?: string; edgeId?: string; resourceId?: string; lossId?: string }>;
}
/** Feature-owned diagnostics carry a default TextRef; raw external diagnostics may use ContractIssue alone. */
export interface LocalizableIssue extends ContractIssue { readonly messageRef: import('./localization.ts').TextRef }
export interface DataCodec<T extends Json = Json> {
  readonly schemaVersion: number;
  validate(value: Json): readonly ContractIssue[];
}

/** StageKind specifies shader semantics/admission, not a Graph or Network owner. */
export interface StageKindDefinition {
  readonly id: StageKindId;
  readonly owner: ModuleRef;
  readonly requiredGeneratorCapabilities: readonly NamespacedId[];
}
export interface BoundaryDeclaration {
  /** Stable slot key; instantiated Node gets a separate immutable runtime/document ID. */
  readonly key: string;
  readonly nodeType: NodeTypeRef;
  readonly required: boolean;
  readonly removable: boolean;
  readonly initialState: Json;
}
export interface StageSlotDefinition {
  readonly key: string;
  readonly stageKindId: StageKindId;
  /** One Stage per declared slot. Optional execution is represented by profile-default, not duplicate Graphs. */
  readonly implementations: readonly ('network' | 'profile-default')[];
  readonly defaultImplementation: 'network' | 'profile-default';
  readonly boundaries: readonly BoundaryDeclaration[];
}
export interface GraphKindDefinition {
  readonly ref: GraphKindRef;
  readonly stages: readonly StageSlotDefinition[];
  /** Graph-owned settings. Future pass descriptors live here; Pass never becomes Stage's parent. */
  readonly settingsCodec: DataCodec;
  readonly defaultSettings: Json;
  readonly requiredGeneratorCapabilities: readonly NamespacedId[];
}
export interface GraphKindRegistry {
  registerStageKind(definition: StageKindDefinition): void;
  /** Atomic registration; validates referenced StageKind and boundary definitions before publishing. */
  register(definition: GraphKindDefinition): void;
  resolve(ref: GraphKindRef): Readonly<GraphKindDefinition> | undefined;
  list(): readonly Readonly<GraphKindDefinition>[];
}
export const PRODUCT_GRAPH_KIND_IDS = Object.freeze({ image: 'grape.image', material: 'grape.material' } as const);
export const PRODUCT_STAGE_KIND_IDS = Object.freeze({ vertex: 'grape.stage.vertex', pixel: 'grape.stage.pixel' } as const);

/** Semantic registration is open; whether an implementation supports a stage remains an explicit check. */
export interface NodeEligibility {
  readonly stageKindIds: readonly StageKindId[];
  readonly graphKindIds?: readonly GraphKindId[];
  readonly requiredGeneratorCapabilities?: readonly NamespacedId[];
}
export interface ParameterPresentation {
  readonly widget: WidgetId;
  readonly options?: Readonly<Record<string, Json>> | import('./localization.ts').MenuPresentationOptions;
  readonly fallback?: 'auto' | 'none';
}
export type {
  TextOwnerRef, TextRef, FeaturePresentation, NodePresentation,
  PanelPresentation, ModulePresentation,
  LocaleContribution, LocalizationService, LocalizationResolution, LocalizationChange,
  MenuPresentationOptions,
} from './localization.ts';

/** Mandatory overlays on the corresponding production contributions, not new owners.
 * They add metadata to the existing NodeModule/NodeType/PanelType contracts.
 */
export interface NodeModuleMetadata { readonly presentation: import('./localization.ts').ModulePresentation }
export interface NodeTypeMetadata { readonly presentation: import('./localization.ts').NodePresentation }
export interface PanelTypeMetadata { readonly presentation: import('./localization.ts').PanelPresentation }
export type PresentedNodeType<Definition extends { readonly ref: NodeTypeRef }> = Definition & NodeTypeMetadata;
export type PresentedNodeModule<Module extends { readonly manifest: { readonly id: string; readonly version: string; readonly fingerprint: string } }> = Module & NodeModuleMetadata;
export type PresentedPanelType<Definition extends { readonly typeId: string }> = Definition & PanelTypeMetadata;

/** This is a GLSL compilation seam. Its programs already contain GLSL text and typed GLSL expressions. */
export interface GLSLExpression { readonly type: string; readonly code: string; readonly constant?: boolean }
export interface BoundaryOutputSpec { readonly key: string; readonly type: string; readonly required: boolean }
/** Additional shape on NodeType; only role:boundary may declare boundary outputs.
 * Candidate resolved ports are detached schema, not live model handles.
 */
export interface NodeTypeBoundaryMetadata {
  boundaryOutputs?(state: Json, ports: readonly { readonly key: string; readonly direction: 'input' | 'output'; readonly type: string }[]): readonly BoundaryOutputSpec[];
}
export interface NodeEmission {
  /** Ordinary downstream data outputs, keyed by output port key. */
  readonly outputs: Readonly<Record<string, GLSLExpression>>;
  /** Stage results only; keys/types must match this boundary's declared specs. */
  readonly boundaryOutputs?: Readonly<Record<string, GLSLExpression>>;
  readonly statements?: readonly string[];
  readonly effects?: readonly (
    { readonly kind: 'discard'; readonly condition: GLSLExpression }
    | { readonly kind: 'depth'; readonly value: GLSLExpression }
  )[];
}
export interface GLSLStageProgram {
  readonly stageId: string;
  readonly slotKey: string;
  readonly stageKindId: StageKindId;
  readonly implementation: 'network' | 'profile-default';
  readonly globals: readonly string[];
  readonly body: readonly string[];
  /** Stable boundary output names supplied by that GraphKind; profile rejects missing/unsupported outputs. */
  readonly outputs: Readonly<Record<string, GLSLExpression>>;
  readonly varyings: readonly { readonly symbol: string; readonly type: string; readonly declaration: string }[];
}
export interface GeneratedArtifact {
  readonly key: string;
  readonly mediaType: string;
  readonly text: string;
  readonly stageId?: string;
}
export interface GLSLProfile {
  readonly ref: ProfileRef;
  readonly language: 'glsl';
  readonly graphKindIds: readonly GraphKindId[];
  readonly stageKindIds: readonly StageKindId[];
  readonly capabilities: readonly NamespacedId[];
  /** Existing shared TypeEnvironment remains the authority; a profile can additionally reject unsupported types. */
  validateType(type: string): readonly ContractIssue[];
  render(input: Readonly<{
    graphKind: Readonly<GraphKindDefinition>;
    kindSettings: Json;
    stages: readonly GLSLStageProgram[];
  }>): { readonly artifacts: readonly GeneratedArtifact[]; readonly diagnostics: readonly ContractIssue[] };
}

/** Different extension families keep their own contracts; this key only opens capability registration. */
export interface CapabilityRef { readonly id: CapabilityId; readonly contractVersion: number }
export interface HostIdentity { readonly hostId: string; readonly targetId: string; readonly incarnation: string }
export type CapabilityScope = { readonly kind: 'application' } | { readonly kind: 'target'; readonly target: HostIdentity };
export interface OperationContract {
  readonly name: string;
  /** Stable public contract/schema locator. A name alone never defines a service's callable methods. */
  readonly contract: string;
  readonly effect: 'query' | 'mutation' | 'event';
}
export interface CapabilityDefinition<Service extends object> {
  readonly ref: CapabilityRef;
  readonly owner: ModuleRef;
  readonly scope: CapabilityScope['kind'];
  readonly operations: readonly OperationContract[];
  /** Type-only variance marker; never serialized or invoked. */
  readonly serviceType?: (service: Service) => Service;
}
export type CapabilityResolution<Service extends object> =
  | { readonly available: true; readonly service: Service }
  | { readonly available: false; readonly code: 'CAPABILITY_UNAVAILABLE'; readonly requested: CapabilityRef };
export interface CapabilityDirectory {
  register<Service extends object>(definition: CapabilityDefinition<Service>): void;
  provide<Service extends object>(definition: CapabilityDefinition<Service>, scope: CapabilityScope, service: Service): void;
  require<Service extends object>(definition: CapabilityDefinition<Service>, scope: CapabilityScope): CapabilityResolution<Service>;
  withdraw(scope: CapabilityScope, capability: CapabilityRef): void;
}

/** Default names are contract identities, not transport routes or user-facing labels. */
export const INITIAL_CAPABILITY_IDS = Object.freeze({
  hostDiscovery: 'grape.host.discovery', targetSession: 'grape.host.target-session',
  artifactPublication: 'grape.host.artifact-publication', inputValues: 'grape.host.input-values',
  controlLayout: 'grape.host.control-layout', previewSurface: 'grape.host.preview-surface',
  nativeWindow: 'grape.host.native-window', documentExport: 'grape.application.document-export',
  applicationAssets: 'grape.application.assets',
} as const);
