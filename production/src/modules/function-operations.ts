import type { ModuleContribution, NodeDefinition } from "../sdk/editing.ts";
import type { GLSLProfile, Json } from "../sdk/public-surface.ts";
import type { PortSnapshot } from "../sdk/document.ts";
import type { SourceData } from "../sdk/networks.ts";
import { demand, issue } from "../sdk/kernel.ts";
import { parseType, typeReferences, remapType } from "../sdk/type-tokens.ts";
import { networkModule } from "./networks.ts";
import { esProfile } from "./image.ts";

export const FUNCTION_OPS_PIN = {
  moduleId: "grape.nodes.function-operations",
  version: "0.1.0",
  fingerprint:
    "sha256:86501aa76e15aa05f3837ec050f2f883ab6aba6932e4ee59998a864432435b01",
};
const owner = {
  ...FUNCTION_OPS_PIN,
  namespace: FUNCTION_OPS_PIN.moduleId,
  catalogVersion: 1,
};
const text = (key: string, fallback: string) => ({ owner, key, fallback });
export const functionOperationRef = (typeId: string) => ({
  ...FUNCTION_OPS_PIN,
  typeId,
});
const input = (key: string, value?: number): PortSnapshot => ({
  key,
  direction: "input",
  type: "glsl.float",
  ...(value === undefined
    ? { supply: "required" as const }
    : { supply: "local" as const, defaultValue: value }),
});
const output = (key: string): PortSnapshot => ({
  key,
  direction: "output",
  type: "glsl.float",
});
const base = (
  id: string,
  label: string,
): Omit<NodeDefinition, "ports" | "emit"> => ({
  ref: functionOperationRef(id),
  role: "operation",
  eligibility: {
    stageKindIds: ["grape.stage.vertex", "grape.stage.pixel"],
    requiredGeneratorCapabilities: ["grape.glsl.numeric"],
  },
  presentation: { label: text(id, label) },
  initialize: () => ({}),
  stateCodec: {
    schemaVersion: 1,
    validate: (s) =>
      s &&
      typeof s === "object" &&
      !Array.isArray(s) &&
      Object.keys(s).length === 0
        ? []
        : [issue("NODE_STATE", "Expected empty state.")],
  },
  parameters: () => [],
  validate: () => [],
});
const legacySource = networkModule.nodes.find((n) => n.modelRole === "source")!;
export const functionOperations: ModuleContribution = {
  manifest: FUNCTION_OPS_PIN,
  presentation: { owner, defaultLocale: "en" },
  nodes: [
    {
      ...base("vertex-position", "Vertex position"),
      eligibility: {
        stageKindIds: ["grape.stage.vertex"],
        requiredGeneratorCapabilities: ["grape.glsl.vertex-position"],
      },
      ports: () => [
        { key: "position", direction: "output", type: "glsl.vec4" },
      ],
      emit: () => ({
        outputs: {
          position: {
            type: "glsl.vec4",
            code: "vec4(grape_position, 0.0, 1.0)",
            constant: false,
          },
        },
      }),
    },
    {
      ...base("constant-input", "Constant input"),
      ports: () => [
        { ...input("value"), requireConstant: true },
        output("value"),
      ],
      emit: (_s, values) => ({ outputs: { value: values.value } }),
    },
    {
      ...base("add", "Add"),
      ports: () => [input("a", 0), input("b", 0), output("value")],
      emit: (_s, i) => ({
        outputs: {
          value: {
            type: "glsl.float",
            code: `(${i.a.code} + ${i.b.code})`,
            constant:
              i.a.constant === true && i.b.constant === true
                ? true
                : i.a.constant === false || i.b.constant === false
                  ? false
                  : undefined,
          },
        },
      }),
    },
    {
      ...base("array-length", "Array length"),
      initialize: () => ({ type: 'array@["glsl.float",2]' }),
      stateCodec: {
        schemaVersion: 1,
        validate: (s) => {
          try {
            demand(
              parseType((s as { type: string }).type).kind === "array" &&
                Object.keys(s as object).length === 1,
              "ARRAY_STATE",
            );
            return [];
          } catch {
            return [issue("ARRAY_STATE", "Expected a canonical array type.")];
          }
        },
      },
      parameters: () => [
        {
          key: "type",
          target: "state",
          type: "json",
          presentation: { widget: "grape.widget.json", fallback: "auto" },
        },
      ],
      stateReferences: {
        collect: (s) =>
          typeReferences((s as { type: string }).type).map((targetId, i) => ({
            slot: "type:" + i,
            kind: "resource",
            targetId,
          })),
        remap: (s, map) => ({
          type: remapType(
            (s as { type: string }).type,
            new Map(
              typeReferences((s as { type: string }).type).map((id, i) => [
                id,
                map({ slot: "type:" + i, kind: "resource", targetId: id })
                  .targetId,
              ]),
            ),
          ),
        }),
      },
      ports: (s) => [
        {
          key: "array",
          direction: "input",
          type: (s as { type: string }).type,
          supply: "required",
        },
        output("length"),
      ],
      emit: (s, _inputs, c) => {
        const type = parseType((s as { type: string }).type);
        demand(type.kind === "array", "ARRAY_STATE");
        const length =
          typeof type.extent === "number"
            ? type.extent
            : c!.types.extent(type.extent.sourceId);
        demand(Number.isSafeInteger(length), "EXTENT_INVALID");
        return {
          outputs: {
            length: {
              type: "glsl.float",
              code: String(length) + ".0",
              constant: true,
            },
          },
        };
      },
    },
    {
      ...legacySource,
      ref: functionOperationRef("source"),
      presentation: {
        ...legacySource.presentation,
        label: text("source", "Source value"),
      },
      emit: (s, _i, c) => {
        const id = (s as { source: string }).source,
          data = c!.resources.find((r) => r.id === id)
            ?.data as unknown as SourceData;
        demand(data, "RESOURCE_MISSING");
        if (data.binding?.kind === "uniform") {
          demand(c!.uniform, "PROFILE_UNIFORM_UNSUPPORTED");
          return { outputs: { value: c!.uniform(id, data.type, data.value) } };
        }
        return legacySource.emit(s, _i, c);
      },
    },
    {
      ...base("pixel-effect", "Pixel depth and pair"),
      effectful: true,
      eligibility: {
        stageKindIds: ["grape.stage.pixel"],
        requiredGeneratorCapabilities: [
          "grape.glsl.numeric",
          "grape.glsl.pixel-effects",
        ],
      },
      ports: () => [
        input("value", 0.25),
        input("depth", 0.5),
        input("discardBelow", -1),
        output("first"),
        output("second"),
      ],
      parameters: () =>
        ["value", "depth", "discardBelow"].map((key) => ({
          key,
          target: "input",
          type: "number",
          presentation: { widget: "grape.widget.number", fallback: "auto" },
        })),
      emit: (_s, i) => ({
        outputs: {
          first: i.value,
          second: { ...i.value, code: `(${i.value.code} * 2.0)` },
        },
        effects: [
          { kind: "depth", value: i.depth },
          {
            kind: "discard",
            condition: {
              type: "glsl.bool",
              code: `(${i.value.code} < ${i.discardBelow.code})`,
              constant: false,
            },
          },
        ],
      }),
    },
  ],
};
export const functionProfile: GLSLProfile = {
  ...esProfile,
  ref: { ...FUNCTION_OPS_PIN, profileId: "es300-functions" },
  capabilities: [
    ...esProfile.capabilities,
    "grape.glsl.functions",
    "grape.glsl.uniforms",
    "grape.glsl.pixel-effects",
    "grape.glsl.vertex-position",
  ],
  render: (input) => {
    const result = esProfile.render(input);
    return {
      ...result,
      artifacts: result.artifacts.map((artifact) =>
        input.stages.some(
          (stage) =>
            stage.stageId === artifact.stageId &&
            stage.stageKindId === "grape.stage.vertex" &&
            stage.implementation === "network",
        )
          ? {
              ...artifact,
              text: artifact.text.replace(
                "precision highp float;",
                "precision highp float;\nlayout(location=0) in vec2 grape_position;",
              ),
            }
          : artifact,
      ),
    };
  },
};
