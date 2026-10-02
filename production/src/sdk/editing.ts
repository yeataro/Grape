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
  readonly target: "state" | "input";
  readonly type: string;
  readonly choices?: readonly Json[];
  readonly presentation: ParameterPresentation;
}
export interface NodeDefinition {
  readonly ref: NodeTypeRef;
  readonly role: "operation" | "boundary";
  readonly eligibility: NodeEligibility;
  readonly presentation: NodePresentation;
  readonly stateCodec: DataCodec;
  readonly invalidEdgePolicy?: "detach" | "preserve";
  initialize(): Json;
  ports(state: Json): readonly PortSnapshot[];
  parameters(state: Json): readonly ParameterSpec[];
  validate(node: Readonly<NodeDocument>): readonly LocalizableIssue[];
  emit(
    state: Json,
    inputs: Readonly<Record<string, GLSLExpression>>,
  ): NodeEmission;
  boundaryOutputs?(
    state: Json,
    ports: readonly PortSnapshot[],
  ): readonly { key: string; type: string; required: boolean }[];
}
export interface ResourceDefinition {
  readonly ref: NodeTypeRef;
  readonly codec: DataCodec;
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
  readonly valueCodec: DataCodec;
  /** Numeric shape participates in the shared adaptation policy; nominal types use exact identity. */
  readonly numeric?: { readonly scalar: "float"; readonly width: number };
}
export interface TypeSystem {
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
  readonly scope: ScopeRef;
  readonly selection: readonly string[];
  readonly primary: string | null;
  readonly navigation: number;
  readonly graph: GraphSnapshot;
}
