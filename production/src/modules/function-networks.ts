import type { ModuleContribution } from "../sdk/editing.ts";
import type { Json } from "../sdk/public-surface.ts";
import { demand, detached, exact, issue } from "../sdk/kernel.ts";
import { networkModule, networkRef } from "./networks.ts";
import { extentModule, extentRef } from "./extents.ts";

export const FUNCTION_PIN = {
  moduleId: "grape.resources.function-networks",
  version: "0.1.0",
  fingerprint:
    "sha256:25d291427adb77405f826a636cd2a7c9a5851f0017cb779ced1a13e5a9b0b9e7",
};
export const functionNetworkRef = { ...FUNCTION_PIN, typeId: "definition" };
export const functionExtentRef = { ...FUNCTION_PIN, typeId: "array-extent" };
const legacy = networkModule.resources!.find((r) => r.model === "network")!;
const extent = extentModule.resources![0];
const owner = {
  ...FUNCTION_PIN,
  namespace: FUNCTION_PIN.moduleId,
  catalogVersion: 1,
};
function mode(data: Json): "expand" | "function" {
  const value = (data as { emissionMode?: string }).emissionMode;
  demand(value === "expand" || value === "function", "NETWORK_EMISSION_MODE");
  return value;
}
const initialize = (data: Json): Json => ({
  ...(data as object),
  emissionMode: "expand",
});
export const functionNetworks: ModuleContribution = {
  manifest: FUNCTION_PIN,
  presentation: { owner, defaultLocale: "en" },
  nodes: [],
  resources: [
    {
      ...legacy,
      ref: functionNetworkRef,
      codec: {
        schemaVersion: 2,
        validate: (data) => {
          const errors = [...legacy.codec.validate(data)];
          try {
            mode(data);
          } catch {
            errors.push(
              issue(
                "NETWORK_EMISSION_MODE",
                "A version 2 definition requires expand or function mode.",
              ),
            );
          }
          return errors;
        },
      },
      networkEmission: {
        initialize,
        mode,
        setMode: (data, value) => {
          demand(
            value === "expand" || value === "function",
            "NETWORK_EMISSION_MODE",
          );
          return { ...(detached(data) as object), emissionMode: value };
        },
      },
      upgrades: [{ from: networkRef("definition"), upgrade: initialize }],
    },
    {
      ...extent,
      ref: functionExtentRef,
      codec: { ...extent.codec, schemaVersion: 2 },
      upgrades: [{ from: extentRef, upgrade: detached }],
      extentInputs: (data) => {
        const d = data as unknown as {
          kind: string;
          networkId: string;
          nodeId: string;
          portKey: string;
        };
        return d.kind === "input"
          ? [{ networkId: d.networkId, nodeId: d.nodeId, portKey: d.portKey }]
          : [];
      },
      // This exact owner declares compatibility with the new definition payload.
      // Project only owner identity for the immutable legacy resolver, never stored data.
      resolveExtent: (data, resources, networks) =>
        extent.resolveExtent!(
          data,
          resources.map((r) =>
            exact(r.type, functionNetworkRef) &&
            r.type.typeId === functionNetworkRef.typeId
              ? { ...r, type: networkRef("definition") }
              : r,
          ),
          networks,
        ),
    },
  ],
};
