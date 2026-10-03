import type { DefinitionSet, NodeDefinition } from "../sdk/editing.ts";
import type {
  GraphKindDefinition,
  GLSLExpression,
  Json,
} from "../sdk/public-surface.ts";
import type { NetworkData } from "../sdk/networks.ts";
import { parseType, formatType } from "../sdk/type-tokens.ts";
import { demand, exact } from "../sdk/kernel.ts";

// Job-private qualification definitions force every advertised output to execute.
// They are never included in a saved Personal asset or installed into its Graph.
export const PROBE_PIN = {
  moduleId: "grape.personal.probe",
  version: "0.1.0",
  fingerprint:
    "sha256:5167f5133660bdb59f087fdabf9f15b277989f545a86222ed3efa571d73d012b",
};
const owner = {
  ...PROBE_PIN,
  namespace: PROBE_PIN.moduleId,
  catalogVersion: 1,
};
export const probeDefinitions: import("../sdk/library.ts").PackageProbe = (
  base,
  network,
  stageKindId,
) => {
  const ref = (typeId: string) => ({ ...PROBE_PIN, typeId });
  const empty = { schemaVersion: 1, validate: () => [] };
  const nodes: NodeDefinition[] = [
    {
      ref: ref("sink"),
      role: "boundary",
      presentation: {
        label: { owner, key: "sink", fallback: "Package validation" },
      },
      eligibility: { stageKindIds: [stageKindId] },
      stateCodec: empty,
      initialize: () => ({}),
      parameters: () => [],
      validate: () => [],
      ports: () =>
        network.interface
          .filter((p) => p.direction === "output")
          .map(({ name, ...p }) => ({
            ...p,
            direction: "input",
            supply: "required",
          })),
      boundaryOutputs: () => [
        {
          key: stageKindId === "grape.stage.vertex" ? "position" : "color",
          type: "glsl.vec4",
          required: true,
        },
      ],
      emit: (_s, inputs, context) => {
        const consume = (e: GLSLExpression): string => {
          const t = parseType(e.type);
          if (t.kind === "array")
            return consume({
              ...e,
              type: formatType(t.element),
              code: `(${e.code})[0]`,
            });
          if (t.kind === "structure") {
            const d = context!.resources.find((r) => r.id === t.id)!
              .data as unknown as { fields: { type: string }[] };
            return d.fields
              .map((f, i) =>
                consume({ ...e, type: f.type, code: `(${e.code}).f${i}` }),
              )
              .join(" + ");
          }
          if (/^glsl\.mat/.test(e.type)) return `(${e.code})[0][0]`;
          if (/^glsl\.vec/.test(e.type)) return `(${e.code}).x`;
          demand(
            ["glsl.float", "glsl.int", "glsl.uint"].includes(e.type),
            "PERSONAL_PROFILE_TYPE",
          );
          return e.type === "glsl.float" ? e.code : `float(${e.code})`;
        };
        const code = Object.values(inputs).map(consume).join(" + ") || "0.0";
        return {
          outputs: {},
          boundaryOutputs: {
            [stageKindId === "grape.stage.vertex" ? "position" : "color"]: {
              type: "glsl.vec4",
              code: `vec4(${code})`,
              constant: Object.values(inputs).every((e) => e.constant),
            },
          },
        };
      },
    },
    {
      ref: ref("input"),
      role: "operation",
      presentation: {
        label: { owner, key: "input", fallback: "Package input" },
      },
      eligibility: { stageKindIds: [stageKindId] },
      stateCodec: empty,
      initialize: () => ({}),
      parameters: () => [],
      validate: () => [],
      ports: (s) => [
        {
          key: "value",
          direction: "output",
          type: String((s as Record<string, Json>).type),
        },
      ],
      emit: (s, _i, c) => {
        const d = s as { type: string; value: Json };
        return {
          outputs: {
            value: {
              type: d.type,
              code: c!.literal(d.type, d.value),
              constant: true,
            },
          },
        };
      },
    },
  ];
  const kind: GraphKindDefinition = {
    ref: { ...PROBE_PIN, kindId: "grape.image" },
    settingsCodec: empty,
    defaultSettings: {},
    requiredGeneratorCapabilities: [],
    stages: [
      {
        key: stageKindId === "grape.stage.vertex" ? "vertex" : "pixel",
        stageKindId,
        implementations: ["network"],
        defaultImplementation: "network",
        boundaries: [
          {
            key: "output",
            nodeType: ref("sink"),
            required: true,
            removable: false,
            initialState: {},
          },
        ],
      },
    ],
  };
  return {
    kind,
    sinkNode: ref("sink"),
    inputNode: ref("input"),
    definitions: {
      ...base,
      pins: [...base.pins, PROBE_PIN],
      module: (p) => exact(p, PROBE_PIN) || base.module(p),
      kind: (r) =>
        exact(r, PROBE_PIN) && r.kindId === kind.ref.kindId
          ? kind
          : base.kind(r),
      node: (r) =>
        exact(r, PROBE_PIN)
          ? nodes.find((n) => n.ref.typeId === r.typeId)
          : base.node(r),
    },
  };
};
