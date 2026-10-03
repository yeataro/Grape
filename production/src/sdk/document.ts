// IH-005 exact DTO declarations only. Production codec is independently implemented.
/** Normative production DTO identity + bounded codec qualification. Not a production persistence implementation. */
import type {
  Json,
  NodeTypeRef,
  GraphKindRef,
  DataCodec,
} from "./public-surface.ts";

export const DOCUMENT_FORMAT = "grape.document" as const;
export const DOCUMENT_VERSION = Object.freeze({ major: 2, minor: 1 });
export interface ModulePin {
  moduleId: string;
  version: string;
  fingerprint: string;
}
export interface DocumentReference {
  slot: string;
  kind: "node" | "resource";
  targetId: string;
  networkId?: string;
}
export interface PortSnapshot {
  key: string;
  direction: "input" | "output";
  type: string;
  semantic?: string;
  supply?: "local" | "required";
  defaultValue?: Json;
  requireConstant?: boolean;
  connectionPolicy?: "default" | "numeric" | "exact";
}
export interface NodeDocument {
  id: string;
  name: string;
  type: NodeTypeRef;
  state: Json;
  inputValues: Record<string, Json>;
  ports: PortSnapshot[];
  references: DocumentReference[];
  referencesComplete: boolean;
  position: [number, number];
  extensions: Record<string, Json>;
}
export interface EdgeDocument {
  id: string;
  from: { nodeId: string; portKey: string };
  to: { nodeId: string; portKey: string };
  adaptation: EdgeAdaptationDocument;
  invalid?: { code: string; reason: string };
  extensions: Record<string, Json>;
}
/** Core-owned, explicitly adopted wire identity; not the reference Adaptation runtime shape. */
export interface EdgeAdaptationDocument {
  schema: "grape.edge-adaptation";
  version: 1 | 2;
  sourceType: string;
  targetType: string;
  operation:
    | "identity"
    | "broadcast"
    | "take-leading"
    | "append-alpha-one"
    | "numeric-cast"
    | "pad-vector";
  extensions: Record<string, Json>;
}
export interface NetworkDocument {
  id: string;
  nodes: NodeDocument[];
  edges: EdgeDocument[];
  extensions: Record<string, Json>;
}
export interface StageDocument {
  id: string;
  key: string;
  stageKindId: string;
  implementation: "network" | "profile-default";
  network: NetworkDocument;
  extensions: Record<string, Json>;
}
export interface ResourceDocument {
  id: string;
  type: NodeTypeRef;
  data: Json;
  references: DocumentReference[];
  referencesComplete: boolean;
  extensions: Record<string, Json>;
}
/** Evidence snapshots only. Presence never installs an Edge, value, Node or Resource. */
export type PreservedPayload =
  | { kind: "edge"; networkId: string; edge: EdgeDocument }
  | {
      kind: "input-value";
      networkId: string;
      nodeId: string;
      port: PortSnapshot;
      value: Json;
    }
  | { kind: "node"; networkId: string; node: NodeDocument }
  | { kind: "resource"; resource: ResourceDocument }
  | {
      kind: "module";
      owner: ModulePin;
      codecId: string;
      codecVersion: number;
      data: Json;
      references: DocumentReference[];
      referencesComplete: boolean;
    };
export interface LossDocument {
  schema: "grape.loss";
  version: 1;
  id: string;
  code: string;
  reason: string;
  payload: PreservedPayload;
  extensions: Record<string, Json>;
}
export interface RecoveryDocument {
  schema: "grape.recovery";
  version: 1;
  id: string;
  reason: string;
  lossId?: string;
  payload: PreservedPayload;
  extensions: Record<string, Json>;
}
/** Optional module-owned contribution, registered atomically under the module's exact manifest pin.
 * Duplicate (owner, codecId, codec.schemaVersion) rejects registration; no last-writer wins.
 */
export interface ModulePreservationContribution {
  readonly preservationCodecs: readonly {
    readonly codecId: string;
    readonly codec: DataCodec;
  }[];
}
/** Definition-resolution service; no Graph handle or mutation capability is passed to a codec. */
export interface PreservationCodecResolver {
  resolve(
    owner: Readonly<ModulePin>,
    codecId: string,
    codecVersion: number,
  ): Readonly<DataCodec> | undefined;
}
export interface CanonicalGraphDocument {
  format: typeof DOCUMENT_FORMAT;
  formatVersion: { major: number; minor: number };
  graph: {
    id: string;
    name: string;
    kind: GraphKindRef;
    kindSettings: Json;
    modules: ModulePin[];
    stages: StageDocument[];
    resources: ResourceDocument[];
    losses: LossDocument[];
    recovery: RecoveryDocument[];
    extensions: Record<string, Json>;
  };
}
export type DocumentRead =
  | {
      status: "editable";
      document: CanonicalGraphDocument;
      unresolvedModules: ModulePin[];
      generationBlockedByMissingModules: boolean;
    }
  | {
      status: "recovery-readonly";
      raw: string;
      reason: string;
      unknownPaths: string[];
    }
  | {
      status: "foreign";
      raw: string;
      format: string | null;
      reason: "IMPORT_CONVERTER_REQUIRED";
    }
  | { status: "rejected"; raw: string; reason: string };
export interface ReadOptions {
  availableModule?(pin: Readonly<ModulePin>): boolean;
  maxBytes?: number;
  maxDepth?: number;
}
