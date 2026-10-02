import type {
  ModuleContribution,
  NodeDefinition,
  ParameterSpec,
} from "../sdk/editing.ts";
import type {
  Json,
  NodeTypeRef,
  LocalizableIssue,
  GLSLExpression,
} from "../sdk/public-surface.ts";
import type { PortSnapshot } from "../sdk/document.ts";
import type { TextRef } from "../sdk/localization.ts";
import { glslFloatLiteral } from "../sdk/glsl.ts";
export const NODE_PIN = Object.freeze({
  moduleId: "grape.nodes.basic",
  version: "0.1.0",
  fingerprint:
    "sha256:011f48f4ebe044a2391d335ac3cff7c52791f1ee485fd47d211211991e7a2292",
});
export const owner = Object.freeze({
  ...NODE_PIN,
  namespace: NODE_PIN.moduleId,
  catalogVersion: 1,
});
const defaultMessages = new Map<string, string>();
export function text(key: string, fallback: string): TextRef {
  defaultMessages.set(key, fallback);
  return { owner, key, fallback };
}
export function nodeRef(typeId: string): NodeTypeRef {
  return { ...NODE_PIN, typeId };
}
function problem(code: string, message: string): LocalizableIssue {
  return {
    code,
    severity: "error",
    message,
    messageRef: text("diagnostics." + code, message),
  };
}
function record(state: Json): Record<string, Json> {
  return state as Record<string, Json>;
}
function scalar(v: Json): boolean {
  return (
    typeof v === "number" &&
    Number.isFinite(v) &&
    Number.isFinite(Math.fround(v))
  );
}
const pixel = ["grape.stage.pixel"];
const port = (
  key: string,
  direction: "input" | "output",
  type = "glsl.float",
  value?: Json,
): PortSnapshot => ({
  key,
  direction,
  type,
  ...(value === undefined ? {} : { supply: "local", defaultValue: value }),
});
const parameter = (key: string, target: "state" | "input"): ParameterSpec => ({
  key,
  target,
  type: "number",
  presentation: { widget: "grape.widget.number", fallback: "auto" },
});
function definition(
  id: string,
  label: string,
  spec: Omit<
    NodeDefinition,
    "ref" | "presentation" | "eligibility" | "validate"
  >,
  labels: Record<string, string>,
): NodeDefinition {
  return {
    ref: nodeRef(id),
    presentation: {
      label: text(id + ".label", label),
      ports: Object.fromEntries(
        Object.entries(labels).map(([k, v]) => [
          k,
          { label: text(id + ".port." + k, v) },
        ]),
      ),
      parameters: Object.fromEntries(
        Object.entries(labels).map(([k, v]) => [
          k,
          { label: text(id + ".parameter." + k, v) },
        ]),
      ),
    },
    eligibility: {
      stageKindIds: pixel,
      requiredGeneratorCapabilities: ["grape.glsl.numeric"],
    },
    validate: () => [],
    ...spec,
  };
}
const emptyCodec = {
  schemaVersion: 1,
  validate: (state: Json) =>
    state &&
    typeof state === "object" &&
    !Array.isArray(state) &&
    Object.keys(state).length === 0
      ? []
      : [problem("STATE", "Expected empty node settings.")],
};
export const floatNode = definition(
  "float",
  "Float",
  {
    role: "operation",
    stateCodec: {
      schemaVersion: 1,
      validate: (s) =>
        s &&
        typeof s === "object" &&
        !Array.isArray(s) &&
        Object.keys(s).length === 1 &&
        scalar(record(s).value)
          ? []
          : [problem("FLOAT_VALUE", "Enter a finite shader number.")],
    },
    initialize: () => ({ value: 0.25 }),
    ports: () => [port("value", "output")],
    parameters: () => [parameter("value", "state")],
    emit: (s) => ({
      outputs: {
        value: {
          type: "glsl.float",
          code: glslFloatLiteral(record(s).value),
          constant: true,
        },
      },
    }),
  },
  { value: "Value" },
);
export const multiplyNode = definition(
  "multiply",
  "Multiply",
  {
    role: "operation",
    stateCodec: emptyCodec,
    initialize: () => ({}),
    ports: () => [
      port("a", "input", "glsl.float", 1),
      port("b", "input", "glsl.float", 2),
      port("result", "output"),
    ],
    parameters: () => [parameter("a", "input"), parameter("b", "input")],
    emit: (_s, i) => ({
      outputs: {
        result: {
          type: "glsl.float",
          code: `(${i.a.code} * ${i.b.code})`,
          constant: i.a.constant && i.b.constant,
        },
      },
    }),
  },
  { a: "A", b: "B", result: "Result" },
);
const modes = ["vec2", "vec3", "vec4"];
export const composeNode = definition(
  "compose",
  "Compose",
  {
    role: "operation",
    stateCodec: {
      schemaVersion: 1,
      validate: (s) =>
        s &&
        typeof s === "object" &&
        !Array.isArray(s) &&
        Object.keys(s).length === 1 &&
        modes.includes(String(record(s).mode)) &&
        typeof record(s).mode === "string"
          ? []
          : [problem("COMPOSE_MODE", "Choose a supported vector shape.")],
    },
    initialize: () => ({ mode: "vec4" }),
    ports: (s) => [
      ...["x", "y", "z", "w"]
        .slice(0, Number(String(record(s).mode).at(-1)))
        .map((k, i) => port(k, "input", "glsl.float", i === 3 ? 1 : 0)),
      port("result", "output", "glsl." + record(s).mode),
    ],
    parameters: (s) => [
      {
        key: "mode",
        target: "state",
        type: "choice",
        choices: modes,
        presentation: {
          widget: "grape.widget.choice",
          options: {
            schema: "grape.ui.menu-items.v1",
            items: modes.map((value) => ({
              value,
              label: text(
                "compose.mode." + value,
                value === "vec4" ? "RGBA (vec4)" : value,
              ),
            })),
          },
        },
      },
      ...["x", "y", "z", "w"]
        .slice(0, Number(String(record(s).mode).at(-1)))
        .map((k) => parameter(k, "input")),
    ],
    emit: (s, i) => ({
      outputs: {
        result: {
          type: "glsl." + record(s).mode,
          code: `${record(s).mode}(${Object.values(i)
            .map((x) => x.code)
            .join(", ")})`,
          constant: Object.values(i).every((x) => x.constant),
        },
      },
    }),
  },
  {
    mode: "Shape",
    x: "R / X",
    y: "G / Y",
    z: "B / Z",
    w: "A / W",
    result: "Color",
  },
);
export const outputNode = definition(
  "image-output",
  "Image output",
  {
    role: "boundary",
    stateCodec: emptyCodec,
    initialize: () => ({}),
    ports: () => [
      {
        ...port("color", "input", "glsl.vec4"),
        supply: "required",
        connectionPolicy: "exact",
      },
    ],
    parameters: () => [],
    boundaryOutputs: () => [
      { key: "color", type: "glsl.vec4", required: true },
    ],
    emit: (_s, i) => ({
      outputs: {},
      boundaryOutputs: { color: i.color as GLSLExpression },
    }),
  },
  { color: "Color" },
);
export const vertexOutputNode: NodeDefinition = {
  ...definition(
    "vertex-output",
    "Vertex output",
    {
      role: "boundary",
      stateCodec: emptyCodec,
      initialize: () => ({}),
      ports: () => [
        {
          ...port("position", "input", "glsl.vec4"),
          supply: "required",
          connectionPolicy: "exact",
        },
      ],
      parameters: () => [],
      boundaryOutputs: () => [
        { key: "position", type: "glsl.vec4", required: true },
      ],
      emit: (_state, inputs) => ({
        outputs: {},
        boundaryOutputs: { position: inputs.position },
      }),
    },
    { position: "Position" },
  ),
  eligibility: {
    stageKindIds: ["grape.stage.vertex"],
    requiredGeneratorCapabilities: ["grape.glsl.numeric"],
  },
};
export const basicNodes: ModuleContribution = {
  manifest: NODE_PIN,
  presentation: {
    owner,
    defaultLocale: "en",
    label: text("module", "Basic nodes"),
  },
  nodes: [floatNode, multiplyNode, composeNode, outputNode, vertexOutputNode],
};

// Evaluate declared parameter presentations once to include menu item TextRefs in this module's default catalog.
for (const node of basicNodes.nodes) node.parameters(node.initialize());
export const nodeText = {
  presentation: basicNodes.presentation,
  defaults: {
    owner,
    locale: "en",
    revision: 1,
    messages: [...defaultMessages].map(([key, text]) => ({ key, text })),
  },
};
