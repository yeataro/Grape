import { currentSourceRef } from "./sources-current.ts";
import type { ModuleContribution } from "../sdk/editing.ts";
import type { Json } from "../sdk/public-surface.ts";
import type {
  ResourceDocument,
  DocumentReference,
  NetworkDocument,
} from "../sdk/document.ts";
import type { NetworkData, SourceData } from "../sdk/networks.ts";
import { demand, issue, exact } from "../sdk/kernel.ts";
import { networkRef } from "./networks.ts";
import {
  parseType,
  formatType,
  typeReferences,
  remapType,
} from "../sdk/type-tokens.ts";

export const EXTENT_PIN = {
  moduleId: "grape.resources.extents",
  version: "0.1.0",
  fingerprint:
    "sha256:bcfaaca3ef01c57070e05b26e09bbcacde5d51f6ba0091b8b6aaf3d83efa3c60",
};
export const extentRef = { ...EXTENT_PIN, typeId: "array-extent" };
const owner = {
  ...EXTENT_PIN,
  namespace: EXTENT_PIN.moduleId,
  catalogVersion: 1,
};
const text = (key: string, fallback: string) => ({ owner, key, fallback });
export const arrayRepeatRef = { ...EXTENT_PIN, typeId: "array-repeat" };
export type ExtentData =
  | { kind: "literal"; length: number }
  | { kind: "source"; sourceId: string }
  | { kind: "input"; networkId: string; nodeId: string; portKey: string };
const reference = (d: ExtentData): DocumentReference[] =>
  d.kind === "source"
    ? [{ slot: "extent-source", kind: "resource", targetId: d.sourceId }]
    : d.kind === "input"
      ? [
          {
            slot: "extent-input",
            kind: "node",
            targetId: d.nodeId,
            networkId: d.networkId,
          },
        ]
      : [];
function resolve(
  data: Json,
  resources: readonly ResourceDocument[],
  networks: readonly NetworkDocument[] = [],
): number | undefined {
  const d = data as unknown as ExtentData;
  let value: unknown;
  if (d.kind === "literal") value = d.length;
  if (d.kind === "source") {
    const resource = resources.find((r) => r.id === d.sourceId);
    const source =
      resource &&
      (exact(resource.type, networkRef("source-definition")) ||
        exact(resource.type, currentSourceRef)) &&
      resource.type.typeId === "source-definition"
        ? (resource.data as unknown as SourceData)
        : null;
    if (
      source &&
      ["glsl.int", "glsl.uint"].includes(source.type) &&
      (!source.binding || source.binding.kind === "constant")
    )
      value = source.value;
  }
  if (d.kind === "input") {
    const definition = resources.find(
      (r) =>
        exact(r.type, networkRef("definition")) &&
        r.type.typeId === "definition" &&
        (r.data as unknown as NetworkData)?.network?.id === d.networkId,
    );
    const network = definition?.data as unknown as NetworkData;
    const node = network?.network.nodes.find((n) => n.id === d.nodeId);
    const input = network?.interface.find(
      (p) => p.direction === "input" && p.key === d.portKey,
    );
    if (
      node &&
      exact(node.type, networkRef("network-input")) &&
      node.type.typeId === "network-input" &&
      (node.state as { definition?: string }).definition === definition?.id &&
      input?.requireConstant &&
      ["glsl.int", "glsl.uint"].includes(input.type)
    ) {
      const bind = (
        definitionId: string,
        key: string,
        active: string[],
      ): { identity: string; value: unknown } | undefined => {
        const address = definitionId + ":" + key;
        if (active.includes(address)) return undefined;
        const definition = resources.find((r) => r.id === definitionId)
          ?.data as unknown as NetworkData;
        const port = definition?.interface.find(
          (p) => p.direction === "input" && p.key === key,
        );
        if (
          !port?.requireConstant ||
          !["glsl.int", "glsl.uint"].includes(port.type)
        )
          return undefined;
        const values: { identity: string; value: unknown }[] = [];
        for (const network of networks)
          for (const call of network.nodes) {
            if (
              !exact(call.type, networkRef("call")) ||
              call.type.typeId !== "call" ||
              (call.state as { definition?: string }).definition !==
                definitionId
            )
              continue;
            const edge = network.edges.find(
              (e) =>
                e.to.nodeId === call.id && e.to.portKey === key && !e.invalid,
            );
            if (!edge) {
              const v = call.inputValues[key] ?? port.defaultValue;
              values.push({
                identity: port.type + ":" + JSON.stringify(v),
                value: v,
              });
              continue;
            }
            const source = network.nodes.find((n) => n.id === edge.from.nodeId);
            if (!source) return undefined;
            if (
              exact(source.type, networkRef("source")) &&
              source.type.typeId === "source"
            ) {
              const id = (source.state as { source: string }).source;
              const r = resources.find((r) => r.id === id),
                s = r?.data as unknown as SourceData;
              if (
                !r ||
                !(
                  exact(r.type, networkRef("source-definition")) ||
                  exact(r.type, currentSourceRef)
                ) ||
                r.type.typeId !== "source-definition" ||
                !["glsl.int", "glsl.uint"].includes(s.type) ||
                (s.binding && s.binding.kind !== "constant")
              )
                return undefined;
              values.push({ identity: "source:" + id, value: s.value });
            } else if (
              exact(source.type, networkRef("network-input")) &&
              source.type.typeId === "network-input"
            ) {
              const resolved = bind(
                (source.state as { definition: string }).definition,
                edge.from.portKey,
                [...active, address],
              );
              if (!resolved) return undefined;
              values.push(resolved);
            } else return undefined;
          }
        if (!values.length)
          return {
            identity: port.type + ":" + JSON.stringify(port.defaultValue),
            value: port.defaultValue,
          };
        return values.every((v) => v.identity === values[0].identity)
          ? values[0]
          : undefined;
      };
      value = bind(definition!.id, d.portKey, [])?.value;
    }
  }
  return Number.isInteger(value) &&
    Number(value) > 0 &&
    Number(value) <= 2147483647
    ? Number(value)
    : undefined;
}
export const extentModule: ModuleContribution = {
  manifest: EXTENT_PIN,
  presentation: { owner, defaultLocale: "en" },
  nodes: [
    {
      ref: arrayRepeatRef,
      role: "operation",
      eligibility: {
        stageKindIds: ["grape.stage.vertex", "grape.stage.pixel"],
        requiredGeneratorCapabilities: ["grape.glsl.numeric"],
      },
      presentation: {
        label: text("array.label", "Array repeat"),
        ports: {
          item: { label: text("array.item", "Item") },
          value: { label: text("array.value", "Array") },
        },
        parameters: { type: { label: text("array.type", "Array type") } },
      },
      initialize: () => ({ type: 'array@["glsl.float",2]' }),
      stateCodec: {
        schemaVersion: 1,
        validate: (v) => {
          try {
            const d = v as { type: string };
            demand(
              d && Object.keys(d).length === 1 && typeof d.type === "string",
              "ARRAY_STATE",
            );
            const t = parseType(d.type);
            demand(
              t.kind === "array" &&
                t.element.kind === "scalar" &&
                ["glsl.float", "glsl.vec2", "glsl.vec3", "glsl.vec4"].includes(
                  t.element.id,
                ),
              "ARRAY_STATE",
            );
            return [];
          } catch {
            return [issue("ARRAY_STATE", "Unsupported array repetition type.")];
          }
        },
      },
      ports: (s, c) => {
        const t = parseType((s as { type: string }).type);
        demand(t.kind === "array", "ARRAY_STATE");
        const element = formatType(t.element);
        return [
          {
            key: "item",
            direction: "input",
            type: element,
            supply: "local",
            defaultValue: c!.types.defaultValue(element),
          },
          {
            key: "value",
            direction: "output",
            type: (s as { type: string }).type,
          },
        ];
      },
      parameters: () => [
        {
          key: "type",
          target: "state",
          type: "json",
          presentation: { widget: "grape.widget.json", fallback: "auto" },
        },
      ],
      validate: () => [],
      stateReferences: {
        collect: (s) =>
          typeReferences((s as { type: string }).type).map((id, i) => ({
            slot: "array-type:" + i,
            kind: "resource",
            targetId: id,
          })),
        remap: (s, map) => ({
          type: remapType(
            (s as { type: string }).type,
            new Map(
              typeReferences((s as { type: string }).type).map((id, i) => [
                id,
                map({ slot: "array-type:" + i, kind: "resource", targetId: id })
                  .targetId,
              ]),
            ),
          ),
        }),
      },
      emit: (s, inputs, c) => {
        const type = (s as { type: string }).type,
          t = parseType(type);
        demand(t.kind === "array", "ARRAY_STATE");
        const length =
          typeof t.extent === "number"
            ? t.extent
            : c!.types.extent(t.extent.sourceId);
        demand(
          Number.isInteger(length) &&
            Number(length) > 0 &&
            Number(length) <= 65536,
          "ARRAY_EXPANSION",
        );
        return {
          outputs: {
            value: {
              type,
              code:
                c!.typeName(type) +
                "(" +
                Array(Number(length)).fill(inputs.item.code).join(", ") +
                ")",
              constant: inputs.item.constant,
            },
          },
        };
      },
    },
  ],
  resources: [
    {
      ref: extentRef,
      resolveExtent: resolve,
      codec: {
        schemaVersion: 1,
        validate: (value) => {
          try {
            const d = value as unknown as ExtentData;
            demand(d && typeof d === "object", "EXTENT_DATA");
            const keys =
              d.kind === "literal"
                ? ["kind", "length"]
                : d.kind === "source"
                  ? ["kind", "sourceId"]
                  : d.kind === "input"
                    ? ["kind", "networkId", "nodeId", "portKey"]
                    : [];
            demand(
              keys.length > 0 &&
                Object.keys(d).length === keys.length &&
                keys.every((k) => Object.hasOwn(d, k)),
              "EXTENT_DATA",
            );
            demand(
              d.kind === "literal"
                ? Number.isInteger(d.length) &&
                    d.length > 0 &&
                    d.length <= 2147483647
                : keys
                    .slice(1)
                    .every(
                      (k) =>
                        typeof (d as unknown as Record<string, unknown>)[k] ===
                          "string" &&
                        (d as unknown as Record<string, unknown>)[k] !== "",
                    ),
              "EXTENT_DATA",
            );
            return [];
          } catch {
            return [issue("EXTENT_DATA", "Malformed array extent.")];
          }
        },
      },
      stateReferences: {
        collect: (value) => reference(value as unknown as ExtentData),
        remap: (value, map) => {
          const d = value as unknown as ExtentData,
            ref = reference(d)[0];
          if (!ref) return value;
          const r = map(ref);
          return d.kind === "source"
            ? { ...d, sourceId: r.targetId }
            : { ...d, nodeId: r.targetId, networkId: r.networkId! };
        },
      },
    },
  ],
};
