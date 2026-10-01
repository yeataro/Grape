import type {
  Json,
  NodeModule,
  NodeType,
  ParameterSpec,
  PortSpec,
  TypeRef,
} from "./contracts.ts";

const moduleId = "experiment.builtin";
const version = "1";
const fingerprint = "experiment-builtin-v1-fixed";
const ref = (typeId: string): TypeRef => ({
  moduleId,
  typeId,
  version,
  fingerprint,
});
export const refs = Object.freeze({
  output: ref("output"),
  multiply: ref("multiply"),
  constant: ref("constant"),
  compose: ref("compose"),
});
const object = (value: Json): value is { [key: string]: Json } =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const omitted = (args: Json) =>
  args === null || (object(args) && Object.keys(args).length === 0);
const empty = (state: Json): string[] =>
  object(state) && Object.keys(state).length === 0
    ? []
    : ["Expected empty object"];
const constantState = (state: Json): string[] =>
  object(state) &&
  Object.keys(state).length === 1 &&
  typeof state.value === "number" &&
  Number.isFinite(state.value) &&
  Number.isFinite(Math.fround(state.value))
    ? []
    : [
        "Expected { value: finite number representable without float32 overflow }",
      ];
const composeState = (state: Json): string[] =>
  object(state) &&
  Object.keys(state).length === 1 &&
  (state.mode === "color" || state.mode === "pair")
    ? []
    : ["Expected { mode: color | pair }"];
const numberParameter = (key: string): ParameterSpec => ({
  key,
  target: { kind: "input", key },
  presentation: "number",
});
const composePorts = (state: Json): PortSpec[] => {
  const color = object(state) && state.mode === "color";
  return [
    ...(color ? ["r", "g", "b", "a"] : ["r", "g"]).map(
      (key): PortSpec => ({
        key,
        direction: "input",
        type: "float",
        supply: "local",
        default: key === "a" ? 1 : 0,
      }),
    ),
    {
      key: "out",
      direction: "output",
      type: color ? "vec4" : "vec2",
      semantic: color ? "rgba" : "uv",
    },
  ];
};

const output: NodeType = {
  ref: refs.output,
  role: "boundary",
  stages: ["pixel"],
  stateCodec: { schemaVersion: 1, validate: empty },
  initialize: () => ({ state: {} }),
  ports: () => [
    {
      key: "color",
      direction: "input",
      type: "vec4",
      semantic: "rgba",
      supply: "required",
    },
  ],
  parameters: () => [],
  validate: empty,
  emit: (_state, context) => ({ outputs: {}, color: context.input("color") }),
};
const multiply: NodeType = {
  ref: refs.multiply,
  role: "operation",
  stages: ["vertex", "pixel"],
  stateCodec: { schemaVersion: 1, validate: empty },
  initialize: () => ({ state: {} }),
  ports: () => [
    {
      key: "a",
      direction: "input",
      type: "float",
      supply: "local",
      default: 1,
    },
    {
      key: "b",
      direction: "input",
      type: "float",
      supply: "local",
      default: 1,
    },
    { key: "out", direction: "output", type: "float" },
  ],
  parameters: () => [numberParameter("a"), numberParameter("b")],
  validate: empty,
  emit: (_state, context) => ({
    outputs: {
      out: {
        type: "float",
        code: `(${context.input("a").code} * ${context.input("b").code})`,
      },
    },
  }),
};
const constant: NodeType = {
  ref: refs.constant,
  role: "operation",
  stages: ["vertex", "pixel"],
  stateCodec: { schemaVersion: 1, validate: constantState },
  initialize: (args) => ({
    state: omitted(args) ? { value: 0 } : structuredClone(args),
  }),
  ports: () => [{ key: "out", direction: "output", type: "float" }],
  parameters: () => [
    {
      key: "value",
      target: { kind: "state", key: "value" },
      presentation: "number",
    },
  ],
  validate: constantState,
  emit: (state) => {
    const value = (state as { value: number }).value;
    const text = String(value);
    return {
      outputs: {
        out: {
          type: "float",
          code:
            Number.isInteger(value) && !/[eE]/.test(text) ? `${text}.0` : text,
        },
      },
    };
  },
};
const compose: NodeType = {
  ref: refs.compose,
  role: "operation",
  stages: ["vertex", "pixel"],
  stateCodec: { schemaVersion: 1, validate: composeState },
  initialize: (args) => ({
    state: omitted(args) ? { mode: "color" } : structuredClone(args),
  }),
  ports: composePorts,
  parameters: (state) => [
    {
      key: "mode",
      target: { kind: "state", key: "mode" },
      presentation: "menu",
    },
    ...composePorts(state)
      .filter((port) => port.direction === "input")
      .map((port) => numberParameter(port.key)),
  ],
  validate: composeState,
  emit: (state, context) => {
    const color = (state as { mode: string }).mode === "color";
    const type = color ? "vec4" : "vec2";
    return {
      outputs: {
        out: {
          type,
          code: `${type}(${(color ? ["r", "g", "b", "a"] : ["r", "g"]).map((key) => context.input(key).code).join(", ")})`,
        },
      },
    };
  },
};

export const builtinModule: NodeModule = {
  manifest: {
    id: moduleId,
    version,
    fingerprint,
    coreApiVersion: 1,
    dependencies: [],
    source: "architecture-core-prototype/nodes.ts",
    license: "Architecture experiment; not a distributable product module",
  },
  types: [output, multiply, constant, compose],
};
