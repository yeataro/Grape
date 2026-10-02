import type { ModuleContribution } from "../sdk/editing.ts";
import type {
  GraphKindDefinition,
  StageKindDefinition,
  GLSLProfile,
} from "../sdk/public-surface.ts";
import { demand } from "../sdk/kernel.ts";
import { nodeRef } from "./nodes.ts";
export const KIND_PIN = {
  moduleId: "grape.graph-kinds",
  version: "0.1.0",
  fingerprint:
    "sha256:03885a6c2dfddf7c376509678c3402cc1f0b8ea4cdc6417d168e1d54abc09119",
};
const owner = { ...KIND_PIN, namespace: KIND_PIN.moduleId, catalogVersion: 1 };
export const graphKinds: ModuleContribution = {
  manifest: KIND_PIN,
  presentation: { owner, defaultLocale: "en" },
  nodes: [],
};
export const stages: readonly StageKindDefinition[] = [
  "grape.stage.vertex",
  "grape.stage.pixel",
].map((id) => ({
  id,
  owner: KIND_PIN,
  requiredGeneratorCapabilities: ["grape.glsl.numeric"],
}));
export const imageKind: GraphKindDefinition = {
  ref: { ...KIND_PIN, kindId: "grape.image" },
  defaultSettings: {},
  settingsCodec: {
    schemaVersion: 1,
    validate: (v) =>
      v && typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length
        ? []
        : [
            {
              code: "KIND_SETTINGS",
              message: "Unsupported image settings.",
              severity: "error",
              messageRef: {
                owner,
                key: "settings",
                fallback: "Unsupported image settings.",
              },
            },
          ],
  },
  requiredGeneratorCapabilities: ["grape.glsl.numeric"],
  stages: [
    {
      key: "vertex",
      stageKindId: "grape.stage.vertex",
      implementations: ["profile-default", "network"],
      defaultImplementation: "profile-default",
      boundaries: [
        {
          key: "output",
          nodeType: nodeRef("vertex-output"),
          required: true,
          removable: false,
          initialState: {},
        },
      ],
    },
    {
      key: "pixel",
      stageKindId: "grape.stage.pixel",
      implementations: ["network"],
      defaultImplementation: "network",
      boundaries: [
        {
          key: "output",
          nodeType: nodeRef("image-output"),
          required: true,
          removable: false,
          initialState: {},
        },
      ],
    },
  ],
};
export const PROFILE_PIN = {
  moduleId: "grape.glsl.es300",
  profileId: "es300",
  version: "0.1.0",
  fingerprint:
    "sha256:03885a6c2dfddf7c376509678c3402cc1f0b8ea4cdc6417d168e1d54abc09119",
};
export const esProfile: GLSLProfile = {
  ref: PROFILE_PIN,
  language: "glsl",
  graphKindIds: ["grape.image"],
  stageKindIds: stages.map((x) => x.id),
  capabilities: ["grape.glsl.numeric"],
  validateType: (type) =>
    /^glsl\.(float|int|uint|vec[234]|mat[234](x[234])?)$/.test(type)
      ? []
      : [
          {
            code: "PROFILE_TYPE",
            message: "Type unavailable in this GLSL profile.",
            severity: "error",
            messageRef: {
              owner: {
                moduleId: "grape.glsl.es300",
                version: "0.1.0",
                fingerprint: PROFILE_PIN.fingerprint,
                namespace: "grape.glsl.es300",
                catalogVersion: 1,
              },
              key: "type",
              fallback: "Type unavailable in this GLSL profile.",
            },
          },
        ],
  render: (input) => ({
    diagnostics: [],
    artifacts: input.stages.map((stage) => {
      const vertex = stage.stageKindId === "grape.stage.vertex";
      demand(
        vertex || stage.stageKindId === "grape.stage.pixel",
        "PROFILE_STAGE",
      );
      if (stage.implementation === "profile-default") {
        demand(vertex, "PROFILE_DEFAULT_STAGE");
        return {
          key: stage.slotKey,
          stageId: stage.stageId,
          mediaType: "text/x-glsl",
          text: "#version 300 es\nlayout(location=0) in vec2 position;\nvoid main() { gl_Position = vec4(position, 0.0, 1.0); }\n",
        };
      }
      const output = stage.outputs[vertex ? "position" : "color"];
      demand(output?.type === "glsl.vec4", "PROFILE_BOUNDARY_REQUIRED");
      return {
        key: stage.slotKey,
        stageId: stage.stageId,
        mediaType: "text/x-glsl",
        text: `#version 300 es\nprecision highp float;\n${vertex ? "" : "out vec4 fragColor;\n"}${stage.globals.join("\n")}\nvoid main() {\n${stage.body.map((line) => "  " + line).join("\n")}\n  ${vertex ? "gl_Position" : "fragColor"} = ${output.code};\n}\n`,
      };
    }),
  }),
};
