import type {
  ModuleContribution,
  SourcePolicyContext,
} from "../sdk/editing.ts";
import { networkModule, networkRef } from "./networks.ts";
import { imageKind } from "./image.ts";
import { currentImageKind } from "./image-current.ts";
import { exact, equal } from "../sdk/kernel.ts";

export const SOURCE_PIN = {
  moduleId: "grape.resources.image-sources",
  version: "0.2.0",
  fingerprint:
    "sha256:bb0ff902b36d7a07fc104412d0ccb11e4e7efed0106aa3c8595026dbcef8b212",
};
export const currentSourceRef = { ...SOURCE_PIN, typeId: "source-definition" };
const legacy = networkModule.resources!.find((r) => r.model === "source")!;
// A new exact owner explicitly supports both image-kind revisions. Delegation
// retains the accepted descriptor rules; the legacy owner itself is unchanged.
const descriptorContext = (
  context: SourcePolicyContext,
): SourcePolicyContext => ({
  ...context,
  graphKind: equal(context.graphKind, currentImageKind.ref)
    ? imageKind.ref
    : context.graphKind,
  resources: context.resources.map((r) =>
    exact(r.type, currentSourceRef) && r.type.typeId === currentSourceRef.typeId
      ? { ...r, type: networkRef("source-definition") }
      : r,
  ),
});
export const currentSources: ModuleContribution = {
  manifest: SOURCE_PIN,
  presentation: {
    owner: { ...SOURCE_PIN, namespace: SOURCE_PIN.moduleId, catalogVersion: 1 },
    defaultLocale: "en",
  },
  nodes: [],
  resources: [
    {
      ...legacy,
      ref: currentSourceRef,
      sourcePolicy: {
        validate: (data, context) =>
          legacy.sourcePolicy!.validate(data, descriptorContext(context)),
        prepareTransfer: (data, context) =>
          legacy.sourcePolicy!.prepareTransfer!(
            data,
            descriptorContext(context),
          ),
      },
    },
  ],
};
