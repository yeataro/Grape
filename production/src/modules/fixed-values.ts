import type { ModuleContribution, NodeDefinition } from "../sdk/editing.ts";
import type { Json } from "../sdk/public-surface.ts";
import { issue } from "../sdk/kernel.ts";

// Additive owner: the legacy basic Float keeps its original value, ports and pin.
export const FIXED_VALUES_PIN = {
  moduleId: "grape.nodes.fixed-values",
  version: "0.1.0",
  fingerprint:
    "sha256:0d75d254ae4654e672001bc326252ab9775c87b581b79c15e6e8d44fee59a6ba",
};
const owner = {
  ...FIXED_VALUES_PIN,
  namespace: FIXED_VALUES_PIN.moduleId,
  catalogVersion: 1,
};
export const fixedValueRef = (typeId: string) => ({
  ...FIXED_VALUES_PIN,
  typeId,
});
const text = (key: string, fallback: string) => ({ owner, key, fallback });
const scalar = (v: Json) =>
  typeof v === "number" &&
  Number.isFinite(v) &&
  Number.isFinite(Math.fround(v));
function valueNode(
  id: string,
  label: string,
  type: string,
  initial: Json,
  components: string[],
): NodeDefinition {
  return {
    ref: fixedValueRef(id),
    role: "operation",
    presentation: {
      label: text(id, label),
      ports: { out: { label: text("out", "Value") } },
      parameters: { value: { label: text("value", "Value") } },
    },
    eligibility: {
      stageKindIds: ["grape.stage.vertex", "grape.stage.pixel"],
      requiredGeneratorCapabilities: ["grape.glsl.numeric"],
    },
    stateCodec: {
      schemaVersion: 1,
      validate: (state) => {
        const value =
          state &&
          typeof state === "object" &&
          !Array.isArray(state) &&
          Object.keys(state).length === 1 &&
          "value" in state
            ? state.value
            : null;
        const valid =
          components.length === 1
            ? scalar(value)
            : Array.isArray(value) &&
              value.length === components.length &&
              value.every(scalar);
        return valid
          ? []
          : [
              {
                ...issue(
                  "FIXED_VALUE",
                  `Expected ${components.length} finite float32 component(s) for ${label}.`,
                ),
                messageRef: text(
                  "invalid-" + id,
                  `Expected ${components.length} finite float32 component(s) for ${label}.`,
                ),
              },
            ];
      },
    },
    initialize: () => ({
      value: Array.isArray(initial) ? [...initial] : initial,
    }),
    ports: () => [{ key: "out", direction: "output", type }],
    parameters: () => [
      {
        key: "value",
        target: "state",
        type: components.length === 1 ? "number" : "json",
        presentation: {
          widget:
            components.length === 1
              ? "grape.widget.number"
              : "grape.widget.vector",
          fallback: "auto",
          options: { components },
        },
      },
    ],
    validate: () => [],
    emit: (state, _inputs, context) => ({
      outputs: {
        out: {
          type,
          code: context!.literal(type, (state as { value: Json }).value),
          constant: true,
        },
      },
    }),
  };
}
export const fixedValues: ModuleContribution = {
  manifest: FIXED_VALUES_PIN,
  presentation: {
    owner,
    defaultLocale: "en",
    label: text("module", "Fixed values"),
  },
  nodes: [
    valueNode("float", "Float", "glsl.float", 0.5, ["Value"]),
    valueNode("vec2", "Vector 2", "glsl.vec2", [0.5, 0.5], ["X", "Y"]),
    valueNode("vec3", "Vector 3", "glsl.vec3", [1, 1, 1], ["X", "Y", "Z"]),
    valueNode(
      "color",
      "Color RGBA",
      "glsl.vec4",
      [0.55, 0.28, 0.9, 1],
      ["R", "G", "B", "A"],
    ),
  ],
};
