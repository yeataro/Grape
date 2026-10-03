import type { ModulePin, ResourceDocument } from "./document.ts";
import type { GLSLProfile } from "./public-surface.ts";
import type { DefinitionSet } from "./editing.ts";
import type { NetworkData } from "./networks.ts";
export type PackageProbe = (
  definitions: DefinitionSet,
  network: NetworkData,
  stageKindId: string,
) => {
  definitions: DefinitionSet;
  kind: import("./public-surface.ts").GraphKindDefinition;
  sinkNode: import("./public-surface.ts").NodeTypeRef;
  inputNode: import("./public-surface.ts").NodeTypeRef;
};
export interface PersonalPackage {
  format: "grape.personal";
  version: 1;
  name: string;
  entry: string;
  stageKindIds: string[];
  profile: GLSLProfile["ref"];
  modules: ModulePin[];
  resources: ResourceDocument[];
  contentHash: string;
}
export interface LibraryFile {
  name: string;
  text: string;
  kind: "file" | "symlink";
  scope: string;
}
/** Adapter-owned asset collection, independent of Graph History and document storage. */
export interface LibraryStore {
  readonly scope: string;
  list(): Promise<readonly LibraryFile[]>;
  /** Atomic create-if-absent, case-insensitive; never overwrites an existing file. */
  publish(name: string, text: string): Promise<"created" | "exists">;
}
