import { currentSources } from "../../src/modules/sources-current.ts";
import { probeDefinitions } from "../../src/modules/package-probe.ts";
import { setup } from "../fixtures/setup.ts";
import {
  extentModule,
  extentRef,
  arrayRepeatRef,
} from "../../src/modules/extents.ts";
import {
  currentOutputModule,
  currentGraphKinds,
  currentImageKind,
} from "../../src/modules/image-current.ts";
import { Graph } from "../../src/model/graph.ts";
import {
  buildPersonal,
  readPersonal,
  packagePacket,
  qualifyPackage,
  personalFilename,
} from "../../src/application/personal.ts";
import { esProfile } from "../../src/modules/image.ts";
import { nodeRef } from "../../src/modules/nodes.ts";
import { asNetwork, typeSystem, callResource } from "../../src/sdk/networks.ts";
import { TypeEnvironment } from "../../src/definitions/types.ts";
import { compile } from "../../src/generation/compiler.ts";
import { readDocument, writeDocument } from "../../src/persistence/codec.ts";
import { upgradeDocument } from "../../src/application/document-upgrade.ts";
export function currentSetup() {
  const s = setup();
  s.definitions.register(extentModule);
  s.definitions.register(currentSources);
  s.definitions.register(currentOutputModule);
  s.definitions.register(currentGraphKinds);
  s.definitions.registerKind(currentImageKind);
  const fixed = s.definitions.pin(s.definitions.pins()),
    graph = Graph.create(currentImageKind.ref, fixed, s.identity),
    network = graph
      .capture()
      .document.graph.stages.find((s) => s.key === "pixel")!.network.id;
  return { ...s, fixed, graph, network };
}
export function arrayFixture(
  mode: "literal" | "source" | "direct-source" | "input",
  size = 4,
) {
  const s = currentSetup();
  let call = "";
  s.graph.change("Array package", (d) => {
    call = d.createSubgraph(s.network, "Portable array", null, true);
  });
  const id = callResource(
    s.graph.resolveNetwork(s.network).nodes.find((n) => n.id === call)!,
    s.fixed,
  )!;
  const net = () =>
    asNetwork(
      s.graph.capture().document.graph.resources.find((r) => r.id === id)!,
      s.fixed,
    )!;
  if (mode === "input")
    s.graph.change("Length input", (d) =>
      d.interface(net().network.id, [
        {
          key: "length",
          name: "Length",
          direction: "input",
          type: "glsl.int",
          supply: "local",
          defaultValue: size,
          requireConstant: true,
        },
      ]),
    );
  let extent: number | { sourceId: string } = size,
    source = "";
  if (mode === "source" || mode === "direct-source")
    s.graph.change("Constant length", (d) => {
      source = d.createSource("Length", "glsl.int", size);
    });
  if (mode !== "literal")
    s.graph.change("Bound extent", (d) => {
      extent = {
        sourceId:
          mode === "direct-source"
            ? source
            : d.addResource(
                extentRef,
                mode === "source"
                  ? { kind: "source", sourceId: source }
                  : {
                      kind: "input",
                      networkId: net().network.id,
                      nodeId: net().network.nodes[0].id,
                      portKey: "length",
                    },
              ),
      };
    });
  const type = "array@" + JSON.stringify(["glsl.float", extent]);
  s.graph.change("Array output", (d) =>
    d.interface(net().network.id, [
      ...net().interface,
      {
        key: "array",
        name: "Array",
        direction: "output",
        type,
        defaultValue: Array(size).fill(0),
      },
    ]),
  );
  let repeat = "";
  s.graph.change("Produce array", (d) => {
    repeat = d.add(net().network.id, arrayRepeatRef, [150, 100]);
    d.parameter(net().network.id, repeat, "type", type);
  });
  s.graph.change("Wire array", (d) => {
    d.connect(
      net().network.id,
      { nodeId: repeat, portKey: "value" },
      { nodeId: net().network.nodes[1].id, portKey: "array" },
    );
  });
  return { ...s, id, call, net, type, extent, source, repeat };
}
export function nestedArrayFixture() {
  const s = arrayFixture("input");
  let parent = "";
  s.graph.change("Parent", (d) => {
    parent = d.createSubgraph(s.network, "Nested array", null, true);
  });
  const root = callResource(
    s.graph.resolveNetwork(s.network).nodes.find((n) => n.id === parent)!,
    s.fixed,
  )!;
  const data = () =>
    asNetwork(
      s.graph.capture().document.graph.resources.find((r) => r.id === root)!,
      s.fixed,
    )!;
  s.graph.change("Parent interface", (d) =>
    d.interface(data().network.id, [
      {
        key: "length",
        name: "Length",
        direction: "input",
        type: "glsl.int",
        supply: "local",
        defaultValue: 4,
        requireConstant: true,
      },
      {
        key: "array",
        name: "Array",
        direction: "output",
        type: s.type,
        defaultValue: [0, 0, 0, 0],
      },
    ]),
  );
  let child = "";
  s.graph.change("Nested calls", (d) => {
    child = d.addReferenceNode(data().network.id, "call", s.id);
    const second = d.addReferenceNode(data().network.id, "call", s.id);
    d.connect(
      data().network.id,
      { nodeId: data().network.nodes[0].id, portKey: "length" },
      { nodeId: second, portKey: "length" },
    );
    d.connect(
      data().network.id,
      { nodeId: data().network.nodes[0].id, portKey: "length" },
      { nodeId: child, portKey: "length" },
    );
    d.connect(
      data().network.id,
      { nodeId: child, portKey: "array" },
      { nodeId: data().network.nodes[1].id, portKey: "array" },
    );
    d.remove(s.network, s.call);
  });
  return { ...s, root, parent, parentData: data, child };
}

export function conversionFixture(from: string, to: string) {
  const s = currentSetup(),
    pin = {
      moduleId: "test.s04.numeric",
      version: "1.0.0",
      fingerprint: "sha256:" + "7".repeat(64),
    },
    owner = { ...pin, namespace: pin.moduleId, catalogVersion: 1 },
    ref = (typeId: string) => ({ ...pin, typeId });
  const base = {
    role: "operation" as const,
    eligibility: { stageKindIds: ["grape.stage.pixel"] },
    presentation: { label: { owner, key: "node", fallback: "Test" } },
    stateCodec: { schemaVersion: 1, validate: () => [] },
    initialize: () => ({}),
    parameters: () => [],
    validate: () => [],
  };
  const width = (t: string) => (t === "glsl.float" ? 1 : Number(t.slice(-1))),
    values = [0.2, 0.4, 0.6, 0.8];
  const value = from === "glsl.float" ? 0.5 : values.slice(0, width(from));
  s.definitions.register({
    manifest: pin,
    presentation: { owner, defaultLocale: "en" },
    nodes: [
      {
        ...base,
        ref: ref("source"),
        ports: () => [
          { key: "value", direction: "output" as const, type: from },
        ],
        emit: (_s, _i, c) => ({
          outputs: {
            value: {
              type: from,
              code: c!.literal(from, value),
              constant: true,
            },
          },
        }),
      },
      {
        ...base,
        ref: ref("sink"),
        ports: () => [
          {
            key: "value",
            direction: "input" as const,
            type: to,
            supply: "required" as const,
          },
          { key: "color", direction: "output" as const, type: "glsl.vec4" },
        ],
        emit: (_s, i) => ({
          outputs: {
            color: {
              type: "glsl.vec4",
              code:
                to === "glsl.vec4"
                  ? i.value.code
                  : "vec4(" +
                    i.value.code +
                    (to === "glsl.vec2"
                      ? ", 0.0, 1.0"
                      : to === "glsl.vec3"
                        ? ", 1.0"
                        : "") +
                    ")",
              constant: i.value.constant,
            },
          },
        }),
      },
    ],
  });
  const fixed = s.definitions.pin(s.definitions.pins()),
    graph = Graph.create(currentImageKind.ref, fixed, s.identity),
    network = graph
      .capture()
      .document.graph.stages.find((s) => s.key === "pixel")!.network.id;
  graph.change("Convert", (d) => {
    const a = d.add(network, ref("source"), [0, 0]),
      b = d.add(network, ref("sink"), [100, 0]);
    d.connect(
      network,
      { nodeId: a, portKey: "value" },
      { nodeId: b, portKey: "value" },
    );
    d.connect(
      network,
      { nodeId: b, portKey: "color" },
      { nodeId: graph.resolveNetwork(network).nodes[0].id, portKey: "color" },
    );
  });
  const converted =
    from === "glsl.float"
      ? Array(width(to)).fill(0.5)
      : values.slice(0, Math.min(width(from), width(to)));
  while (converted.length < width(to))
    converted.push(converted.length === 3 ? 1 : 0);
  const expected =
    width(to) === 1 ? Array(4).fill(converted[0]) : [...converted];
  while (expected.length < 4) expected.push(expected.length === 3 ? 1 : 0);
  return { ...s, fixed, graph, network, expected };
}
