import type {
  ModuleContribution,
  NodeDefinition,
  DefinitionSet,
  ResourceDefinition,
} from "../sdk/editing.ts";
import type {
  GraphKindDefinition,
  StageKindDefinition,
  NodeTypeRef,
  ModuleRef,
  GraphKindRef,
} from "../sdk/public-surface.ts";
import { TypeEnvironment } from "./types.ts";
import { demand, pinKey, exact, plain } from "../sdk/kernel.ts";
function key(ref: NodeTypeRef | GraphKindRef): string {
  return pinKey(ref) + ("typeId" in ref ? ref.typeId : ref.kindId);
}
function freezeDefinition<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(freezeDefinition);
    Object.freeze(value);
  }
  return value;
}
export class Definitions {
  #modules = new Map<string, ModuleContribution>();
  #nodes = new Map<string, NodeDefinition>();
  #resources = new Map<string, ResourceDefinition>();
  #stages = new Map<string, StageKindDefinition>();
  #kinds = new Map<string, GraphKindDefinition>();
  register(module: ModuleContribution): void {
    const id = pinKey(module.manifest);
    demand(!this.#modules.has(id), "DUPLICATE_MODULE");
    demand(
      exact(module.manifest, module.presentation.owner) &&
        module.presentation.owner.namespace === module.manifest.moduleId,
      "PRESENTATION_OWNER",
    );
    const ids = new Set<string>();
    for (const node of module.nodes) {
      demand(
        exact(node.ref, module.manifest) &&
          node.ref.typeId &&
          !ids.has(node.ref.typeId),
        "NODE_REGISTRATION",
      );
      ids.add(node.ref.typeId);
      demand(
        node.eligibility.stageKindIds.every((x) => this.#stages.has(x)),
        "STAGE_UNREGISTERED",
      );
      demand(
        exact(node.presentation.label.owner, module.manifest),
        "PRESENTATION_OWNER",
      );
    }
    const resources = new Set<string>();
    for (const resource of module.resources ?? []) {
      demand(
        exact(resource.ref, module.manifest) &&
          !resources.has(resource.ref.typeId),
        "RESOURCE_REGISTRATION",
      );
      resources.add(resource.ref.typeId);
    }
    const codecs = new Set<string>();
    for (const entry of module.preservationCodecs ?? []) {
      const k = entry.codecId + ":" + entry.codec.schemaVersion;
      demand(
        entry.codecId &&
          Number.isSafeInteger(entry.codec.schemaVersion) &&
          entry.codec.schemaVersion > 0 &&
          !codecs.has(k),
        "CODEC_REGISTRATION",
      );
      codecs.add(k);
    }
    new TypeEnvironment(module.types);
    freezeDefinition(module);
    this.#modules.set(id, module);
    for (const n of module.nodes) this.#nodes.set(key(n.ref), n);
    for (const r of module.resources ?? []) this.#resources.set(key(r.ref), r);
  }
  registerStage(stage: StageKindDefinition): void {
    demand(stage.id && !this.#stages.has(stage.id), "DUPLICATE_STAGE");
    this.#stages.set(stage.id, freezeDefinition(stage));
  }
  registerKind(kind: GraphKindDefinition): void {
    demand(
      !this.#kinds.has(key(kind.ref)) && this.#modules.has(pinKey(kind.ref)),
      "KIND_REGISTRATION",
    );
    plain(kind.defaultSettings);
    demand(
      !kind.settingsCodec
        .validate(kind.defaultSettings)
        .some((x) => x.severity === "error"),
      "KIND_SETTINGS",
    );
    const slots = new Set<string>();
    for (const slot of kind.stages) {
      demand(
        !slots.has(slot.key) &&
          this.#stages.has(slot.stageKindId) &&
          slot.implementations.includes(slot.defaultImplementation),
        "KIND_STAGE",
      );
      slots.add(slot.key);
      const boundaries = new Set<string>();
      for (const b of slot.boundaries) {
        const node = this.#nodes.get(key(b.nodeType));
        demand(
          node?.role === "boundary" &&
            !boundaries.has(b.key) &&
            (!b.required || !b.removable),
          "KIND_BOUNDARY",
        );
        boundaries.add(b.key);
        plain(b.initialState);
        demand(
          !node.stateCodec
            .validate(b.initialState)
            .some((x) => x.severity === "error"),
          "BOUNDARY_STATE",
        );
      }
    }
    this.#kinds.set(key(kind.ref), freezeDefinition(kind));
  }
  nodeTypes(): readonly NodeDefinition[] {
    return Object.freeze([...this.#nodes.values()]);
  }
  kinds(): readonly GraphKindDefinition[] {
    return Object.freeze([...this.#kinds.values()]);
  }
  pin(pins: readonly ModuleRef[]): DefinitionSet {
    const modules = new Map(
      pins.map((p) => [pinKey(p), this.#modules.get(pinKey(p))]),
    );
    const nodes = new Map(this.#nodes);
    const kinds = new Map(this.#kinds);
    const stages = new Map(this.#stages);
    const resources = new Map(this.#resources);
    return Object.freeze({
      nodeByRole: (role: NonNullable<NodeDefinition["modelRole"]>) =>
        [...nodes.values()].find(
          (n) => n.modelRole === role && modules.get(pinKey(n.ref)),
        ),
      resourceByModel: (model: NonNullable<ResourceDefinition["model"]>) =>
        [...resources.values()].find(
          (r) => r.model === model && modules.get(pinKey(r.ref)),
        ),
      pins: Object.freeze(pins.map((p) => Object.freeze({ ...p }))),
      types: new TypeEnvironment(
        [...modules.values()].flatMap((m) => m?.types ?? []),
      ),
      node: (ref: NodeTypeRef) =>
        modules.get(pinKey(ref)) ? nodes.get(key(ref)) : undefined,
      kind: (ref: GraphKindRef) =>
        modules.get(pinKey(ref)) ? kinds.get(key(ref)) : undefined,
      stage: (id: string) => {
        const stage = stages.get(id);
        return stage && modules.get(pinKey(stage.owner)) ? stage : undefined;
      },
      module: (ref: ModuleRef) => !!modules.get(pinKey(ref)),
      resource: (ref: NodeTypeRef) =>
        modules.get(pinKey(ref)) ? resources.get(key(ref)) : undefined,
      preservation: (owner: ModuleRef, id: string, version: number) =>
        modules
          .get(pinKey(owner))
          ?.preservationCodecs?.find(
            (x) => x.codecId === id && x.codec.schemaVersion === version,
          )?.codec,
    });
  }
  pins(): readonly ModuleRef[] {
    return [...this.#modules.values()].map((x) => x.manifest);
  }
}
