import { flow } from "./setup.ts";
import { Graph } from "../../src/model/graph.ts";
import type {
  ModuleContribution,
  StateReferences,
} from "../../src/sdk/editing.ts";
import type { DocumentReference } from "../../src/sdk/document.ts";
import type { Json } from "../../src/sdk/public-surface.ts";

export function customTransferFixture() {
  const s = flow();
  let source = "",
    structure = "";
  s.graph.change("Dependencies", (d) => {
    source = d.createSource("Source", "glsl.float", 3, true);
    structure = d.createStructure("Record", [
      { id: "x", name: "x", type: "glsl.float" },
    ]);
  });
  const pin = {
    moduleId: "test.transfer",
    version: "1.0.0",
    fingerprint: "test-transfer-v1",
  };
  const owner = { ...pin, namespace: pin.moduleId, catalogVersion: 1 };
  const ref = (typeId: string) => ({ ...pin, typeId });
  const rr = (slot: string, targetId: string): DocumentReference => ({
    slot,
    kind: "resource",
    targetId,
  });
  const nr = (slot: string, targetId: string): DocumentReference => ({
    slot,
    kind: "node",
    targetId,
    networkId: s.network,
  });
  const read = (data: Json) =>
    data as unknown as {
      links: DocumentReference[];
      literal: string;
      failCollect?: boolean;
      failRemap?: boolean;
    };
  const traversal: StateReferences = {
    collect(data) {
      const p = read(data);
      if (p.failCollect) throw Error("TEST_COLLECT");
      return structuredClone(p.links);
    },
    remap(data, map) {
      const p = read(data);
      if (p.failRemap) throw Error("TEST_REMAP");
      return { ...p, links: p.links.map(map) } as unknown as Json;
    },
  };
  const codec = { schemaVersion: 1, validate: (_data: Json) => [] };
  const module: ModuleContribution = {
    manifest: pin,
    presentation: { owner, defaultLocale: "en" },
    nodes: [
      {
        ref: ref("owner"),
        role: "operation",
        eligibility: {
          stageKindIds: ["grape.stage.pixel"],
          requiredGeneratorCapabilities: [],
        },
        presentation: {
          label: { owner, key: "owner", fallback: "Reference owner" },
        },
        stateCodec: codec,
        stateReferences: traversal,
        initialize: () => ({ links: [], literal: "" }),
        ports: () => [],
        parameters: () => [],
        validate: () => [],
        emit: () => ({ outputs: {} }),
      },
    ],
    resources: [
      { ref: ref("state"), codec, stateReferences: traversal },
      { ref: ref("declared"), codec, referencePolicy: "declared" },
    ],
  };
  s.definitions.register(module);
  const fixed = s.definitions.pin(s.definitions.pins());
  const targetDocument = structuredClone(s.graph.capture().document);
  targetDocument.graph.modules.push(pin);
  const doc = structuredClone(targetDocument),
    network = doc.graph.stages.find((x) => x.network.id === s.network)!.network;
  const custom = "custom-owner",
    a = "custom-state",
    b = "custom-declared";
  network.nodes.push({
    id: custom,
    name: "Reference owner",
    type: ref("owner"),
    state: {
      links: [rr("state-root", a), nr("peer", s.float)],
      literal: s.float + " " + a,
    } as unknown as Json,
    inputValues: {},
    ports: [],
    references: [rr("declared-root", b)],
    referencesComplete: true,
    position: [0, 200],
    extensions: { "test.literal": b },
  });
  doc.graph.resources.push(
    {
      id: a,
      type: ref("state"),
      data: {
        links: [rr("child", b), rr("source", source)],
        literal: b,
      } as unknown as Json,
      references: [rr("type", structure)],
      referencesComplete: true,
      extensions: {},
    },
    {
      id: b,
      type: ref("declared"),
      data: { literal: s.float },
      references: [nr("subject", s.float)],
      referencesComplete: true,
      extensions: {},
    },
  );
  const graph = new Graph(doc, fixed, s.identity);
  return {
    ...s,
    graph,
    fixed,
    targetDocument,
    custom,
    a,
    b,
    source,
    structure,
    selection: [custom, s.float],
  };
}
