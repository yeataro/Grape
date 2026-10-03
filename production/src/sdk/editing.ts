import type { WidgetReadBinding } from "./view-mount.ts";
import type {
  Json,
  NodeTypeRef,
  NodeEligibility,
  NodePresentation,
  ModulePresentation,
  LocalizableIssue,
  NodeEmission,
  GLSLExpression,
  GraphKindDefinition,
  StageKindDefinition,
  GLSLProfile,
  ContractIssue,
  ParameterPresentation,
  ModuleRef,
  DataCodec,
} from "./public-surface.ts";
import type {
  CanonicalGraphDocument,
  NodeDocument,
  PortSnapshot,
  ModulePin,
} from "./document.ts";
export interface ParameterSpec {
  readonly key: string;
  readonly label?: import("./localization.ts").TextRef;
  readonly target: "state" | "input";
  readonly type: string;
  readonly choices?: readonly Json[];
  readonly presentation: ParameterPresentation;
}
export interface ModelContext {
  readonly resources: readonly import("./document.ts").ResourceDocument[];
  readonly types: TypeSystem;
}
export interface EmissionContext extends ModelContext {
  readonly boundaryInputs: Readonly<Record<string, GLSLExpression>>;
  literal(type: string, value: Json): string;
  typeName(type: string): string;
  emitNetwork(
    id: string,
    inputs: Readonly<Record<string, GLSLExpression>>,
  ): Readonly<Record<string, GLSLExpression>>;
}
export interface StateReferences {
  collect(state: Json): readonly import("./document.ts").DocumentReference[];
  remap(
    state: Json,
    map: (
      ref: import("./document.ts").DocumentReference,
    ) => import("./document.ts").DocumentReference,
  ): Json;
}
export interface NodeDefinition {
  readonly modelRole?:
    | "call"
    | "network-input"
    | "network-output"
    | "source"
    | "structure"
    | "field";
  readonly stateReferences?: StateReferences;
  markInputOverride?(state: Json, key: string): Json;
  isInputOverridden?(state: Json, key: string): boolean;
  readonly ref: NodeTypeRef;
  readonly role: "operation" | "boundary";
  readonly eligibility: NodeEligibility;
  readonly presentation: NodePresentation;
  readonly stateCodec: DataCodec;
  /** Optional stricter input admission owned by this exact node definition. */
  acceptsInput?(
    source: Readonly<PortSnapshot>,
    target: Readonly<PortSnapshot>,
  ): boolean;
  readonly invalidEdgePolicy?: "detach" | "preserve";
  initialize(): Json;
  ports(state: Json, context?: ModelContext): readonly PortSnapshot[];
  parameters(state: Json, context?: ModelContext): readonly ParameterSpec[];
  validate(
    node: Readonly<NodeDocument>,
    context?: ModelContext,
  ): readonly LocalizableIssue[];
  emit(
    state: Json,
    inputs: Readonly<Record<string, GLSLExpression>>,
    context?: EmissionContext,
  ): NodeEmission & {
    readonly networkOutputs?: Readonly<Record<string, GLSLExpression>>;
  };
  boundaryOutputs?(
    state: Json,
    ports: readonly PortSnapshot[],
  ): readonly { key: string; type: string; required: boolean }[];
}
export interface ResourceDefinition {
  readonly ref: NodeTypeRef;
  readonly codec: DataCodec;
  readonly model?: "network" | "structure" | "source" | "frame";
  readonly referencePolicy?: "declared";
  readonly library?: {
    readonly origin: string;
    readonly nodes: readonly {
      ref: NodeTypeRef;
      state: Json;
      position: [number, number];
    }[];
  };
  readonly stateReferences?: StateReferences;
  /** Pure owner interpretation of a symbolic array extent from a closed snapshot. */
  resolveExtent?(
    data: Json,
    resources: readonly import("./document.ts").ResourceDocument[],
    networks?: readonly import("./document.ts").NetworkDocument[],
  ): number | undefined;
  /** Pure owner admission and preparation; never resolves live native resources. */
  readonly sourcePolicy?: {
    validate(
      data: Json,
      context: SourcePolicyContext,
    ): readonly ContractIssue[];
    prepareTransfer?(data: Json, context: SourcePolicyContext): Json;
  };
}
export interface SourcePolicyContext extends ModelContext {
  readonly phase: "construction" | "clipboard" | "document";
  readonly graphKind: CanonicalGraphDocument["graph"]["kind"];
}
export interface ModuleContribution {
  readonly manifest: ModulePin;
  readonly presentation: ModulePresentation;
  readonly nodes: readonly NodeDefinition[];
  readonly resources?: readonly ResourceDefinition[];
  readonly types?: readonly ShaderTypeDefinition[];
  readonly preservationCodecs?: readonly {
    codecId: string;
    codec: DataCodec;
  }[];
}
export interface ShaderTypeDefinition {
  readonly id: string;
  readonly structureField?: false;
  readonly valueCodec: DataCodec;
  /** Numeric shape participates in the shared adaptation policy; nominal types use exact identity. */
  readonly numeric?: { readonly scalar: "float"; readonly width: number };
}
export interface TypeResource {
  readonly id: string;
  readonly model?: "network" | "source" | "structure" | "frame";
  readonly data: Json;
  readonly extent?: number;
}
export interface TypeSystem {
  extent(id: string): number | undefined;
  forResources(resources: readonly TypeResource[]): TypeSystem;
  defaultValue(id: string): Json;
  reshape(id: string, value: Json): Json;
  resolve(id: string): Readonly<ShaderTypeDefinition> | undefined;
  validValue(id: string, value: Json): boolean;
  adaptation(
    source: PortSnapshot,
    target: PortSnapshot,
  ): import("./document.ts").EdgeAdaptationDocument;
  planValid(
    plan: import("./document.ts").EdgeAdaptationDocument,
    source: PortSnapshot,
    target: PortSnapshot,
  ): boolean;
}
export interface DefinitionSet {
  readonly pins: readonly ModulePin[];
  nodeByRole(
    role: NonNullable<NodeDefinition["modelRole"]>,
  ): Readonly<NodeDefinition> | undefined;
  resourceByModel(
    model: NonNullable<ResourceDefinition["model"]>,
  ): Readonly<ResourceDefinition> | undefined;
  readonly types: TypeSystem;
  node(ref: NodeTypeRef): Readonly<NodeDefinition> | undefined;
  kind(
    ref: CanonicalGraphDocument["graph"]["kind"],
  ): Readonly<GraphKindDefinition> | undefined;
  stage(id: string): Readonly<StageKindDefinition> | undefined;
  module(pin: ModuleRef): boolean;
  resource(ref: NodeTypeRef): Readonly<ResourceDefinition> | undefined;
  preservation(
    owner: ModulePin,
    codecId: string,
    version: number,
  ): DataCodec | undefined;
}
export interface GraphSnapshot {
  readonly document: CanonicalGraphDocument;
  readonly loadId: string;
  readonly revision: number;
  readonly diagnostics: readonly ContractIssue[];
}
export interface Compilation {
  readonly status: "success" | "failed";
  readonly loadId: string;
  readonly revision: number;
  readonly profile: GLSLProfile["ref"];
  readonly artifacts: readonly import("./public-surface.ts").GeneratedArtifact[];
  readonly diagnostics: readonly ContractIssue[];
  readonly document: CanonicalGraphDocument;
  readonly bindingSchema: readonly Json[];
  readonly provenance: readonly {
    stageId: string;
    nodeId: string;
    symbol: string;
  }[];
}
export interface ScopeRef {
  readonly graphId: string;
  readonly loadId: string;
  readonly contextId: string;
  readonly stageId: string;
  readonly networkPath: readonly string[];
  readonly lifetime?: number;
}
export interface ParameterProjection {
  readonly nodeId: string;
  readonly spec: ParameterSpec;
  readonly label: import("./localization.ts").TextRef;
  readonly value: Json;
  readonly port?: PortSnapshot;
  readonly links: readonly {
    edgeId: string;
    sourceNodeId: string;
    invalid: boolean;
  }[];
}
export interface StorageAdapter {
  write(key: string, text: string): Promise<void>;
  read(key: string): Promise<string>;
  list(): Promise<readonly { key: string; name: string }[]>;
}
export interface DocumentOutput {
  download(name: string, text: string): Promise<void>;
}
export interface FieldTarget extends WidgetReadBinding<ParameterProjection> {
  commit(value: Json, token: string): void;
  dispose(): void;
}

export interface ContextSnapshot {
  readonly definitionNames: Readonly<Record<string, string>>;
  readonly breadcrumbs: readonly { depth: number; name: string }[];
  readonly frames: readonly (import("./networks.ts").FrameData & {
    id: string;
  })[];
  readonly scope: ScopeRef;
  readonly selection: readonly string[];
  readonly primary: string | null;
  readonly navigation: number;
  readonly network: import("./document.ts").NetworkDocument;
  readonly portLabels: Readonly<
    Record<string, Readonly<Record<string, string>>>
  >;
  readonly nodeRoles: Readonly<Record<string, string>>;
  readonly structures: readonly {
    id: string;
    data: import("./networks.ts").StructureData;
    uses: readonly string[];
  }[];
  readonly definition: {
    id: string;
    data: import("./networks.ts").NetworkData;
  } | null;
  readonly graph: GraphSnapshot;
}
