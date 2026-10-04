import type {
  ModuleContribution,
  NodeDefinition,
  SourcePolicyContext,
} from "../sdk/editing.ts";
import type { GraphKindDefinition } from "../sdk/public-surface.ts";
import type { CanonicalGraphDocument } from "../sdk/document.ts";
import { currentOutput, currentImageKind } from "./image-current.ts";
import { currentSources, currentSourceRef } from "./sources-current.ts";
import { imageKind } from "./image.ts";
import { networkRef } from "./networks.ts";
import { demand, equal, exact } from "../sdk/kernel.ts";

// Owner-approved additive revision. The old 0.1/0.2 definitions remain exact.
const fingerprint =
  "sha256:675e4e5aca274cb7de4cd90eca0e3405eec406678e9f4dc90d96c48e422e795f";
export const ZERO_OUTPUT_PIN = {
  moduleId: "grape.nodes.image-output",
  version: "0.3.0",
  fingerprint,
};
const owner = {
  ...ZERO_OUTPUT_PIN,
  namespace: ZERO_OUTPUT_PIN.moduleId,
  catalogVersion: 1,
};
const label = { owner, key: "output.label", fallback: "Image output" };
export const zeroOutput: NodeDefinition = {
  ...currentOutput,
  ref: { ...ZERO_OUTPUT_PIN, typeId: "image-output" },
  presentation: {
    label,
    ports: {
      color: { label: { owner, key: "output.color", fallback: "Color" } },
    },
  },
  ports: () => [
    {
      key: "color",
      direction: "input",
      type: "glsl.vec4",
      supply: "local",
      defaultValue: [0, 0, 0, 0],
      connectionPolicy: "numeric",
    },
  ],
};
export const zeroOutputModule: ModuleContribution = {
  manifest: ZERO_OUTPUT_PIN,
  presentation: { owner, defaultLocale: "en" },
  nodes: [zeroOutput],
};
export const zeroOutputText = {
  presentation: zeroOutputModule.presentation,
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
export const ZERO_KIND_PIN = {
  moduleId: "grape.graph-kinds",
  version: "0.3.0",
  fingerprint,
};
export const zeroGraphKinds: ModuleContribution = {
  manifest: ZERO_KIND_PIN,
  presentation: {
    owner: {
      ...ZERO_KIND_PIN,
      namespace: ZERO_KIND_PIN.moduleId,
      catalogVersion: 1,
    },
    defaultLocale: "en",
  },
  nodes: [],
};
export const ZERO_SOURCE_PIN = {
  moduleId: "grape.resources.image-sources",
  version: "0.3.0",
  fingerprint,
};
export const zeroSourceRef = {
  ...ZERO_SOURCE_PIN,
  typeId: "source-definition",
};
const priorSource = currentSources.resources![0];
const descriptorContext = (
  context: SourcePolicyContext,
): SourcePolicyContext => ({
  ...context,
  graphKind: equal(context.graphKind, zeroImageKind.ref)
    ? currentImageKind.ref
    : context.graphKind,
  resources: context.resources.map((r) =>
    equal(r.type, zeroSourceRef) ? { ...r, type: currentSourceRef } : r,
  ),
});
export const zeroSources: ModuleContribution = {
  manifest: ZERO_SOURCE_PIN,
  presentation: {
    owner: {
      ...ZERO_SOURCE_PIN,
      namespace: ZERO_SOURCE_PIN.moduleId,
      catalogVersion: 1,
    },
    defaultLocale: "en",
  },
  nodes: [],
  resources: [
    {
      ...priorSource,
      ref: zeroSourceRef,
      sourcePolicy: {
        validate: (data, context) =>
          priorSource.sourcePolicy!.validate(data, descriptorContext(context)),
        prepareTransfer: (data, context) =>
          priorSource.sourcePolicy!.prepareTransfer!(
            data,
            descriptorContext(context),
          ),
      },
    },
  ],
};
function upgradeImage(source: CanonicalGraphDocument): CanonicalGraphDocument {
  const document = structuredClone(source);
  const previous = [imageKind, currentImageKind].find((kind) =>
    equal(kind.ref, document.graph.kind),
  );
  demand(previous, "UPGRADE_KIND");
  const pixel = document.graph.stages.find((stage) => stage.key === "pixel"),
    oldBoundary = previous.stages.find((stage) => stage.key === "pixel")!
      .boundaries[0];
  demand(pixel, "UPGRADE_STAGE");
  const outputs = pixel.network.nodes.filter((node) =>
    equal(node.type, oldBoundary.nodeType),
  );
  demand(outputs.length === 1, "UPGRADE_BOUNDARY");
  const output = outputs[0];
  demand(
    output && equal(output.type, oldBoundary.nodeType),
    "UPGRADE_BOUNDARY",
  );
  output.type = { ...zeroOutput.ref };
  output.ports = structuredClone([...zeroOutput.ports(output.state)]);
  output.inputValues.color = [0, 0, 0, 0];
  document.graph.kind = { ...zeroImageKind.ref };
  for (const resource of document.graph.resources) {
    if (
      [currentSourceRef, networkRef("source-definition")].some((ref) =>
        equal(ref, resource.type),
      )
    )
      resource.type = { ...zeroSourceRef };
  }
  for (const pin of [ZERO_OUTPUT_PIN, ZERO_KIND_PIN, ZERO_SOURCE_PIN])
    if (!document.graph.modules.some((p) => exact(p, pin)))
      document.graph.modules.push({ ...pin });
  return document;
}
export const zeroImageKind: GraphKindDefinition = {
  ...currentImageKind,
  ref: { ...ZERO_KIND_PIN, kindId: "grape.image" },
  stages: currentImageKind.stages.map((stage) =>
    stage.key !== "pixel"
      ? stage
      : {
          ...stage,
          boundaries: stage.boundaries.map((boundary) => ({
            ...boundary,
            nodeType: zeroOutput.ref,
          })),
        },
  ),
  upgrades: [imageKind, currentImageKind].map((kind) => ({
    from: kind.ref,
    upgrade: upgradeImage,
  })),
};
