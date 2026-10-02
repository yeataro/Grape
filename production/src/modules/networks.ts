import { nodeRef } from "./nodes.ts";
import { imageKind } from "./image.ts";
import { validateNetworkStructure } from "../sdk/document-validation.ts";
import type {
  ModuleContribution,
  NodeDefinition,
  ModelContext,
  StateReferences,
  SourcePolicyContext,
} from "../sdk/editing.ts";
import type { Json } from "../sdk/public-surface.ts";
import type { DocumentReference, PortSnapshot } from "../sdk/document.ts";
import type {
  NetworkData,
  StructureData,
  SourceData,
} from "../sdk/networks.ts";
import { demand, issue, equal } from "../sdk/kernel.ts";
import { parseType } from "../sdk/type-tokens.ts";
export const NETWORK_PIN = {
  moduleId: "grape.nodes.networks",
  version: "0.1.0",
  fingerprint:
    "sha256:fdd67aaa5341ce6c29d05e6b6d3220b90f367e910730ba517899fcf59a3b36d2",
};
const owner = {
  ...NETWORK_PIN,
  namespace: NETWORK_PIN.moduleId,
  catalogVersion: 1,
};
export const networkRef = (typeId: string) => ({ ...NETWORK_PIN, typeId });
const label = (key: string) => ({ owner, key, fallback: key });
function obj(data: Json) {
  demand(!!data && typeof data === "object" && !Array.isArray(data), "STATE");
  return data as Record<string, Json>;
}
function refs(key: string): StateReferences {
  return {
    collect: (state) => [
      { slot: key, kind: "resource", targetId: String(obj(state)[key]) },
    ],
    remap: (state, map) => ({
      ...obj(state),
      [key]: map({
        slot: key,
        kind: "resource",
        targetId: String(obj(state)[key]),
      }).targetId,
    }),
  };
}
const resource = (context: ModelContext | undefined, id: Json) => {
  const r = context?.resources.find((r) => r.id === id);
  demand(r, "RESOURCE_MISSING");
  return r;
};
function node(
  role: NonNullable<NodeDefinition["modelRole"]>,
  key: string,
  ports: NodeDefinition["ports"],
): NodeDefinition {
  return {
    ref: networkRef(role),
    role: role.startsWith("network-") ? "boundary" : "operation",
    modelRole: role,
    stateReferences: refs(key),
    eligibility: {
      stageKindIds: ["grape.stage.pixel", "grape.stage.vertex"],
      requiredGeneratorCapabilities: ["grape.glsl.numeric"],
    },
    presentation: {
      label: {
        ...label(role),
        fallback: {
          call: "Subgraph",
          "network-input": "Inputs",
          "network-output": "Outputs",
          source: "Source",
          structure: "Structure",
          field: "Field",
        }[role],
      },
    },
    invalidEdgePolicy:
      role === "structure" || role === "field" ? "preserve" : "detach",
    initialize: () => ({ [key]: "" }),
    stateCodec: {
      schemaVersion: 1,
      validate: (state) => {
        try {
          demand(typeof obj(state)[key] === "string", "STATE");
          return [];
        } catch {
          return [issue("STATE", "A definition reference is required.")];
        }
      },
    },
    ports,
    parameters: (state, context) =>
      ports(state, context)
        .filter((p) => p.direction === "input" && p.defaultValue !== undefined)
        .map((p) => ({
          key: p.key,
          label: {
            ...label(p.key),
            fallback:
              (
                (
                  context?.resources.find((r) => r.id === obj(state)[key])
                    ?.data as unknown as NetworkData
                )?.interface ?? []
              ).find((x) => x.key === p.key)?.name ?? p.key,
          },
          target: "input" as const,
          type: p.type === "glsl.float" ? "number" : "json",
          presentation: {
            widget:
              p.type === "glsl.float"
                ? "grape.widget.number"
                : "grape.widget.json",
            fallback: "auto" as const,
          },
        })),
    validate: () => [],
    emit: () => ({ outputs: {} }),
  };
}
const call = node("call", "definition", (state, context) =>
  (
    resource(context, obj(state).definition).data as unknown as NetworkData
  ).interface.map(({ name, ...p }) => p),
);
const boundary = (role: "network-input" | "network-output") =>
  node(role, "definition", (state, context) =>
    (
      resource(context, obj(state).definition).data as unknown as NetworkData
    ).interface
      .filter(
        (p) => p.direction === (role === "network-input" ? "input" : "output"),
      )
      .map(({ name, ...p }) => ({
        ...p,
        direction: p.direction === "input" ? "output" : "input",
        ...(role === "network-output"
          ? {
              supply: "local" as const,
              defaultValue:
                p.defaultValue ?? context!.types.defaultValue(p.type),
            }
          : {}),
      })),
  );
const inputsBoundary = boundary("network-input"),
  outputsBoundary = boundary("network-output");
inputsBoundary.emit = (_state, _inputs, context) => ({
  outputs: context!.boundaryInputs,
});
outputsBoundary.emit = (_state, inputs) => ({
  outputs: {},
  networkOutputs: inputs,
});
call.emit = (state, inputs, context) => ({
  outputs: context!.emitNetwork(String(obj(state).definition), inputs),
});
const source = node("source", "source", (state, context) => [
  {
    key: "value",
    direction: "output",
    type: (resource(context, obj(state).source).data as unknown as SourceData)
      .type,
  },
]);
const structure = node("structure", "structure", (state, context) => {
  const r = resource(context, obj(state).structure),
    s = r.data as unknown as StructureData;
  return [
    ...s.fields.map((f) => ({
      key: f.id,
      direction: "input" as const,
      type: f.type,
      supply: "local" as const,
      defaultValue: context!.types.defaultValue(f.type),
    })),
    { key: "value", direction: "output" as const, type: "struct@" + r.id },
  ];
});
const field = node("field", "structure", (state, context) => {
  const r = resource(context, obj(state).structure),
    s = r.data as unknown as StructureData,
    f = s.fields.find((f) => f.id === obj(state).field);
  if (!f)
    return [
      {
        key: "value",
        direction: "input",
        type: "struct@" + r.id,
        supply: "required",
      },
    ];
  return [
    {
      key: "value",
      direction: "input",
      type: "struct@" + r.id,
      supply: "required",
    },
    { key: "field", direction: "output", type: f.type },
  ];
});
field.validate = (n, context) => {
  const data = context?.resources.find(
    (r) => r.id === (n.state as { structure: string }).structure,
  )?.data as unknown as StructureData;
  return data?.fields.some((f) => f.id === (n.state as { field: string }).field)
    ? []
    : [
        {
          ...issue(
            "FIELD_MISSING",
            "Referenced structure field is unavailable.",
          ),
          messageRef: label("Field unavailable"),
        },
      ];
};
source.emit = (state, _inputs, context) => {
  const data = resource(context, obj(state).source)
    .data as unknown as SourceData;
  demand(
    !data.binding || data.binding.kind === "constant",
    "SOURCE_RUNTIME_UNAVAILABLE",
  );
  return {
    outputs: {
      value: {
        type: data.type,
        code: context!.literal(data.type, data.value),
        constant: true,
      },
    },
  };
};
structure.emit = (state, inputs, context) => {
  const r = resource(context, obj(state).structure),
    data = r.data as unknown as StructureData,
    type = "struct@" + r.id;
  return {
    outputs: {
      value: {
        type,
        code:
          context!.typeName(type) +
          "(" +
          data.fields.map((f) => inputs[f.id].code).join(", ") +
          ")",
        constant: data.fields.every((f) => inputs[f.id].constant),
      },
    },
  };
};
field.emit = (state, inputs, context) => {
  const data = resource(context, obj(state).structure)
      .data as unknown as StructureData,
    index = data.fields.findIndex((f) => f.id === obj(state).field);
  demand(index >= 0, "FIELD_MISSING");
  return {
    outputs: {
      field: {
        type: data.fields[index].type,
        code: "(" + inputs.value.code + ").f" + index,
        constant: inputs.value.constant,
      },
    },
  };
};
for (const def of [call, structure, outputsBoundary]) {
  def.markInputOverride = (state, key) => ({
    ...obj(state),
    inputOverrides: [
      ...new Set([
        ...(Array.isArray(obj(state).inputOverrides)
          ? (obj(state).inputOverrides as string[])
          : []),
        key,
      ]),
    ],
  });
  def.isInputOverridden = (state, key) =>
    Array.isArray(obj(state).inputOverrides) &&
    (obj(state).inputOverrides as string[]).includes(key);
}
const validate = (f: (data: Record<string, Json>) => void) => (data: Json) => {
  try {
    f(obj(data));
    return [];
  } catch (e) {
    return [issue("RESOURCE_STATE", String(e))];
  }
};
function validateSource(raw: Json, context: SourcePolicyContext) {
  try {
    const d = raw as unknown as SourceData,
      binding = d.binding;
    const token = parseType(d.type),
      kind = binding?.kind ?? "constant";
    demand(
      [
        "constant",
        "uniform",
        "native-array",
        "sampler",
        "top",
        "specialization",
      ].includes(kind),
      "SOURCE_KIND",
    );
    if (context.phase === "clipboard")
      demand(d.clipboard, "SOURCE_CLIPBOARD_DENIED");
    if (
      kind === "constant" ||
      kind === "uniform" ||
      kind === "specialization"
    ) {
      demand(context.types.validValue(d.type, d.value), "SOURCE_VALUE");
      if (context.phase === "clipboard")
        demand(
          token.kind === "scalar" &&
            /^glsl\.(float|int|uint|vec[234]|mat[234](x[234])?)$/.test(
              token.id,
            ),
          "SOURCE_CLIPBOARD_DENIED",
        );
      if (binding?.kind === "specialization")
        demand(
          Number.isSafeInteger(binding.constantId) &&
            binding.constantId >= 0 &&
            token.kind === "scalar" &&
            /^glsl\.(int|uint|float)$/.test(token.id),
          "SOURCE_SPECIALIZATION",
        );
    } else {
      demand(
        binding &&
          "path" in binding &&
          typeof binding.path === "string" &&
          binding.path.length > 0 &&
          binding.path.length <= (context.phase === "clipboard" ? 2048 : 4096),
        "SOURCE_PATH",
      );
      demand(d.value === null, "SOURCE_NATIVE_VALUE");
      // This owner supports authored image descriptors. Live resolution remains a provider operation.
      demand(
        equal(context.graphKind, imageKind.ref),
        "SOURCE_TARGET_UNSUPPORTED",
      );
      if (kind === "native-array")
        demand(
          token.kind === "array" &&
            token.element.kind === "scalar" &&
            /^glsl\.(float|vec[234])$/.test(token.element.id) &&
            !!context.types.resolve(d.type),
          "SOURCE_NATIVE_ARRAY_TYPE",
        );
      else demand(d.type === "glsl.sampler2D", "SOURCE_SAMPLER_TYPE");
      if (binding?.kind === "top")
        demand(
          typeof binding.source === "string" &&
            binding.source.length > 0 &&
            typeof binding.origin === "string" &&
            binding.origin.length > 0 &&
            Number.isSafeInteger(binding.slot) &&
            binding.slot >= 0,
          "SOURCE_SLOT",
        );
    }
    return [];
  } catch (e) {
    return [issue(e instanceof Error ? e.name : "SOURCE_INVALID", String(e))];
  }
}
function prepareSource(raw: Json, context: SourcePolicyContext): Json {
  const d = structuredClone(raw) as unknown as SourceData;
  const existing = context.resources
    .filter(
      (r) =>
        r.type.moduleId === NETWORK_PIN.moduleId &&
        r.type.version === NETWORK_PIN.version &&
        r.type.fingerprint === NETWORK_PIN.fingerprint &&
        r.type.typeId === "source-definition",
    )
    .map((r) => r.data as unknown as SourceData);
  const vacant = (values: number[]) => {
    const taken = new Set(values);
    let id = 0;
    while (taken.has(id)) id++;
    return id;
  };
  if (d.binding?.kind === "top") {
    const incoming = d.binding;
    const match = existing.find(
      (r) =>
        r.binding?.kind === "top" &&
        r.binding.source === incoming.source &&
        r.binding.origin === incoming.origin,
    );
    if (match?.binding?.kind === "top") {
      d.binding = structuredClone(match.binding);
      d.value = structuredClone(match.value);
    } else
      d.binding.slot = vacant(
        existing.flatMap((r) =>
          r.binding?.kind === "top" ? [r.binding.slot] : [],
        ),
      );
  }
  if (d.binding?.kind === "specialization")
    d.binding.constantId = vacant(
      existing.flatMap((r) =>
        r.binding?.kind === "specialization" ? [r.binding.constantId] : [],
      ),
    );
  return d as unknown as Json;
}
export const networkModule: ModuleContribution = {
  manifest: NETWORK_PIN,
  presentation: { owner, defaultLocale: "en", label: label("Networks") },
  nodes: [call, inputsBoundary, outputsBoundary, source, structure, field],
  types: [
    {
      id: "glsl.sampler2D",
      structureField: false,
      valueCodec: {
        schemaVersion: 1,
        validate: (value) =>
          value === null
            ? []
            : [
                issue(
                  "SAMPLER_VALUE",
                  "Sampler values use a null authored default.",
                ),
              ],
      },
    },
  ],
  resources: [
    {
      ref: networkRef("frame"),
      model: "frame",
      codec: {
        schemaVersion: 1,
        validate: validate((d) => {
          demand(
            typeof d.name === "string" &&
              typeof d.networkId === "string" &&
              Array.isArray(d.nodeIds) &&
              d.nodeIds.every((x) => typeof x === "string") &&
              new Set(d.nodeIds).size === d.nodeIds.length &&
              Array.isArray(d.position) &&
              d.position.length === 2 &&
              d.position.every(
                (x) => typeof x === "number" && Number.isFinite(x),
              ) &&
              Array.isArray(d.size) &&
              d.size.length === 2 &&
              d.size.every((x) => typeof x === "number" && x > 0) &&
              typeof d.color === "string",
            "FRAME_DATA",
          );
        }),
      },
      stateReferences: {
        collect: (data) =>
          (obj(data).nodeIds as string[]).map((id, i) => ({
            slot: "member:" + i,
            kind: "node" as const,
            targetId: id,
            networkId: String(obj(data).networkId),
          })),
        remap: (data, map) => {
          const d = obj(data),
            refs = (d.nodeIds as string[]).map((id, i) =>
              map({
                slot: "member:" + i,
                kind: "node",
                targetId: id,
                networkId: String(d.networkId),
              }),
            );
          return {
            ...d,
            networkId: refs[0]?.networkId ?? d.networkId,
            nodeIds: refs.map((r) => r.targetId),
          };
        },
      },
    },
    {
      ref: networkRef("definition"),
      model: "network",
      library: {
        origin: "grape.library.basic/1",
        nodes: [
          {
            ref: nodeRef("float"),
            state: { value: 0.25 },
            position: [220, 100],
          },
        ],
      },
      codec: {
        schemaVersion: 1,
        validate: validate((d) => {
          demand(
            typeof d.name === "string" &&
              typeof d.local === "boolean" &&
              Array.isArray(d.interface) &&
              Array.isArray(d.dependencies) &&
              !!d.network,
            "NETWORK_DATA",
          );
          validateNetworkStructure(d.network, true);
          const ports = d.interface as unknown as NetworkData["interface"];
          demand(
            new Set(ports.map((p) => p.direction + ":" + p.key)).size ===
              ports.length &&
              ports.every(
                (p) =>
                  p.key &&
                  p.name &&
                  ["input", "output"].includes(p.direction) &&
                  p.type,
              ),
            "INTERFACE_INVALID",
          );
        }),
      },
      stateReferences: {
        collect: (data) =>
          (data as unknown as NetworkData).dependencies.map((id, i) => ({
            slot: "dependency:" + i,
            kind: "resource",
            targetId: id,
          })),
        remap: (data, map) => ({
          ...obj(data),
          dependencies: (data as unknown as NetworkData).dependencies.map(
            (id, i) =>
              map({ slot: "dependency:" + i, kind: "resource", targetId: id })
                .targetId,
          ),
        }),
      },
    },
    {
      ref: networkRef("structure-definition"),
      model: "structure",
      codec: {
        schemaVersion: 1,
        validate: validate((d) => {
          demand(
            typeof d.name === "string" &&
              d.name.trim().length > 0 &&
              d.name === d.name.trim() &&
              d.name.length <= 80 &&
              !/[\x00-\x1f\x7f]/.test(d.name) &&
              (d.description === undefined ||
                (typeof d.description === "string" &&
                  d.description.length <= 4000)) &&
              Array.isArray(d.fields),
            "STRUCTURE_DATA",
          );
          const fields = d.fields as unknown as StructureData["fields"];
          demand(
            fields.length > 0 &&
              fields.length <= 64 &&
              new Set(fields.map((f) => f.id)).size === fields.length &&
              new Set(fields.map((f) => f.name)).size === fields.length &&
              fields.every(
                (f) =>
                  /^[A-Za-z_][A-Za-z0-9_]*$/.test(f.name) &&
                  !f.name.startsWith("gl_") &&
                  !f.name.includes("__") &&
                  !new Set(
                    "attribute const uniform varying buffer shared coherent volatile restrict readonly writeonly atomic_uint layout centroid flat smooth noperspective patch sample break continue do for while switch case default if else subroutine in out inout float double int void bool true false invariant precise discard return mat2 mat3 mat4 vec2 vec3 vec4 ivec2 ivec3 ivec4 bvec2 bvec3 bvec4 uint uvec2 uvec3 uvec4 struct sampler2D samplerCube".split(
                      " ",
                    ),
                  ).has(f.name) &&
                  f.id &&
                  f.type,
              ),
            "STRUCTURE_FIELDS",
          );
        }),
      },
    },
    {
      ref: networkRef("source-definition"),
      model: "source",
      sourcePolicy: {
        validate: validateSource,
        prepareTransfer: prepareSource,
      },
      codec: {
        schemaVersion: 1,
        validate: validate((d) => {
          demand(
            typeof d.name === "string" &&
              typeof d.type === "string" &&
              typeof d.clipboard === "boolean" &&
              d.value !== undefined,
            "SOURCE_DATA",
          );
        }),
      },
    },
  ],
};
