import type { ModuleContribution, NodeDefinition } from "../sdk/editing.ts";
import type { GraphKindDefinition } from "../sdk/public-surface.ts";
import { outputNode } from "./nodes.ts";
import { imageKind } from "./image.ts";

// Additive exact identities: the accepted basic module and old GraphKind remain
// registered unchanged. Opening an old envelope never replaces either pin.
const fingerprint =
  "sha256:5e996954cafb09b5816b3e1b0ea4e62cb1668822931e86c8ea0c794406a4ac93";
export const IMAGE_OUTPUT_PIN = {
  moduleId: "grape.nodes.image-output",
  version: "0.2.0",
  fingerprint,
};
const owner = {
  ...IMAGE_OUTPUT_PIN,
  namespace: IMAGE_OUTPUT_PIN.moduleId,
  catalogVersion: 1,
};
const label = { owner, key: "output.label", fallback: "Image output" };
export const currentOutput: NodeDefinition = {
  ...outputNode,
  ref: { ...IMAGE_OUTPUT_PIN, typeId: "image-output" },
  presentation: {
    label,
    ports: {
      color: { label: { owner, key: "output.color", fallback: "Color" } },
    },
  },
  acceptsInput: (source) =>
    ["glsl.float", "glsl.vec2", "glsl.vec3", "glsl.vec4"].includes(source.type),
  ports: () => [
    {
      key: "color",
      direction: "input",
      type: "glsl.vec4",
      supply: "required",
      connectionPolicy: "numeric",
    },
  ],
};
export const currentOutputModule: ModuleContribution = {
  manifest: IMAGE_OUTPUT_PIN,
  presentation: { owner, defaultLocale: "en" },
  nodes: [currentOutput],
};
export const currentOutputText = {
  presentation: currentOutputModule.presentation,
  defaults: {
    owner,
    locale: "en",
    revision: 1,
    messages: [
      { key: label.key, text: label.fallback },
      { key: "output.color", text: "Color" },
    ],
  },
};
export const CURRENT_KIND_PIN = {
  moduleId: "grape.graph-kinds",
  version: "0.2.0",
  fingerprint,
};
export const currentGraphKinds: ModuleContribution = {
  manifest: CURRENT_KIND_PIN,
  presentation: {
    owner: {
      ...CURRENT_KIND_PIN,
      namespace: CURRENT_KIND_PIN.moduleId,
      catalogVersion: 1,
    },
    defaultLocale: "en",
  },
  nodes: [],
};
export const currentImageKind: GraphKindDefinition = {
  ...imageKind,
  ref: { ...CURRENT_KIND_PIN, kindId: "grape.image" },
  stages: imageKind.stages.map((stage) =>
    stage.key !== "pixel"
      ? stage
      : {
          ...stage,
          boundaries: stage.boundaries.map((boundary) => ({
            ...boundary,
            nodeType: currentOutput.ref,
          })),
        },
  ),
};
