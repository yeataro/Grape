import type {
  CanonicalGraphDocument,
  NetworkDocument,
} from "../sdk/document.ts";
import type { DefinitionSet } from "../sdk/editing.ts";
import type {
  ContractIssue,
  GLSLExpression,
  GLSLProfile,
} from "../sdk/public-surface.ts";
import {
  asNetwork,
  networks,
  typeSystem,
  callResource,
} from "../sdk/networks.ts";
import { demand, detached, issue } from "../sdk/kernel.ts";
import { typeReferences } from "../sdk/type-tokens.ts";

export interface ConstantAnalysis {
  readonly edges: ReadonlyMap<string, boolean | undefined>;
  readonly diagnostics: readonly ContractIssue[];
  readonly functions: ReadonlyMap<string, readonly ContractIssue[]>;
}
/** Pure node-owned emission semantics with bounded symbolic expressions, never code evaluation.
 * Unknown emission is not evidence of either constant or runtime eligibility. */
export function analyzeConstants(
  doc: CanonicalGraphDocument,
  defs: DefinitionSet,
  profile?: GLSLProfile,
): ConstantAnalysis {
  const types = typeSystem(doc, defs),
    all = networks(doc, defs),
    edges = new Map<string, boolean | undefined>(),
    diagnostics: ContractIssue[] = [],
    functions = new Map<string, readonly ContractIssue[]>(),
    visited = new Set<string>();
  const refs = (id: string) =>
    all.flatMap(({ network }) =>
      network.nodes
        .filter((n) => callResource(n, defs) === id)
        .map((n) => ({ networkId: network.id, nodeId: n.id })),
    );
  const expression = (type: string, constant?: boolean): GLSLExpression => ({
    type,
    code: "v",
    constant,
  });
  const walk = (
    network: NetworkDocument,
    boundary: Readonly<Record<string, GLSLExpression>>,
    path: string[],
    resourceId?: string,
    qualification = false,
  ): { outputs: Record<string, GLSLExpression>; errors: ContractIssue[] } => {
    const cache = new Map<string, Record<string, GLSLExpression>>(),
      active = new Set<string>(),
      outputs: Record<string, GLSLExpression> = {},
      errors: ContractIssue[] = [];
    const inputTrail = (
      id: string,
      key: string,
      seen = new Set<string>(),
    ): string[] => {
      const address = id + ":" + key;
      if (seen.has(address) || cache.get(id)?.[key]?.constant === true)
        return [];
      const node = network.nodes.find((n) => n.id === id);
      if (!node) return [];
      if (defs.node(node.type)?.modelRole === "network-input")
        return boundary[key]?.constant === false ? [key] : [];
      const next = new Set([...seen, address]);
      return network.edges
        .filter((e) => e.to.nodeId === id && !e.invalid)
        .flatMap((e) => inputTrail(e.from.nodeId, e.from.portKey, next));
    };
    const report = (
      code: string,
      message: string,
      nodeId: string,
      portKey?: string,
      edgeId?: string,
    ) => {
      const error = {
        ...issue(code, message, {
          graphId: doc.graph.id,
          resourceId,
          nodeId,
          portKey,
          edgeId,
        }),
        ...(resourceId ? { related: refs(resourceId) } : {}),
      };
      errors.push(error);
    };
    const lower = (id: string): Record<string, GLSLExpression> => {
      if (cache.has(id)) return cache.get(id)!;
      const node = network.nodes.find((n) => n.id === id),
        def = node && defs.node(node.type);
      if (!node || !def || active.has(id)) {
        report(
          "CONSTANT_ANALYSIS_UNAVAILABLE",
          "Missing node owner or cyclic dependency.",
          id,
        );
        return {};
      }
      active.add(id);
      const inputs: Record<string, GLSLExpression> = {};
      for (const p of node.ports.filter((p) => p.direction === "input")) {
        const edge = network.edges.find(
          (e) => e.to.nodeId === id && e.to.portKey === p.key,
        );
        const sourcePort =
          edge &&
          network.nodes
            .find((n) => n.id === edge.from.nodeId)
            ?.ports.find(
              (p) => p.key === edge.from.portKey && p.direction === "output",
            );
        const admitted =
          edge &&
          !edge.invalid &&
          sourcePort &&
          types.planValid(edge.adaptation, sourcePort, p) &&
          def.acceptsInput?.(sourcePort, p) !== false;
        const value = admitted
          ? lower(edge.from.nodeId)[edge.from.portKey]
          : !edge && node.inputValues[p.key] !== undefined
            ? expression(p.type, true)
            : undefined;
        inputs[p.key] = expression(p.type, value?.constant);
        if (p.requireConstant) {
          if (edge && !qualification) {
            const key = network.id + ":" + edge.id,
              current = edges.get(key),
              fact = !admitted ? undefined : value?.constant;
            edges.set(
              key,
              !edges.has(key)
                ? fact
                : current === false || fact === false
                  ? false
                  : current === true && fact === true
                    ? true
                    : undefined,
            );
          }
          if (value?.constant !== true) {
            const trail = edge
              ? [...new Set(inputTrail(edge.from.nodeId, edge.from.portKey))]
              : [];
            report(
              "CONSTANT_REQUIRED",
              "This input requires a compile-time constant; ordinary function parameters and function results are runtime values." +
                (trail.length
                  ? " Upstream ordinary input dependencies: " +
                    trail.join(", ") +
                    "."
                  : ""),
              id,
              p.key,
              edge?.id,
            );
          }
        }
      }
      let values: Record<string, GLSLExpression> = {};
      try {
        demand(
          !def.stateCodec
            .validate(node.state)
            .some((i) => i.severity === "error"),
          "NODE_STATE",
        );
        if (profile) {
          demand(
            (def.eligibility.requiredGeneratorCapabilities ?? []).every((c) =>
              profile.capabilities.includes(c),
            ),
            "PROFILE_CAPABILITY",
          );
          demand(
            node.ports.every(
              (p) =>
                !profile
                  .validateType(p.type)
                  .some((i) => i.severity === "error"),
            ),
            "PROFILE_TYPE",
          );
        }
        const emitted = def.emit(detached(node.state), detached(inputs), {
          resources: detached(doc.graph.resources),
          types,
          boundaryInputs: detached(boundary),
          literal: () => "v",
          typeName: () => "T",
          uniform: (_id, type) => expression(type, false),
          emitNetwork: (id, supplied) => {
            const resource = doc.graph.resources.find((r) => r.id === id),
              data = resource && asNetwork(resource, defs);
            demand(resource && data && !path.includes(id), "DEFINITION_CYCLE");
            visited.add(id);
            const mode =
              defs
                .resource(resource.type)
                ?.networkEmission?.mode(resource.data) ?? "expand";
            const parameters = Object.fromEntries(
              data.interface
                .filter((p) => p.direction === "input")
                .map((p) => [
                  p.key,
                  mode === "function"
                    ? expression(p.type, false)
                    : (supplied[p.key] ?? expression(p.type)),
                ]),
            );
            const child = walk(
              data.network,
              parameters,
              [...path, id],
              id,
              qualification,
            );
            errors.push(...child.errors);
            return Object.fromEntries(
              Object.entries(child.outputs).map(([key, v]) => [
                key,
                expression(v.type, mode === "function" ? false : v.constant),
              ]),
            );
          },
        });
        for (const p of node.ports.filter((p) => p.direction === "output")) {
          const value = emitted.outputs[p.key];
          demand(value?.type === p.type, "EMISSION_TYPE");
          // Never feed expanding GLSL text back into another emitter during analysis.
          values[p.key] = expression(p.type, value.constant);
        }
        for (const [key, value] of Object.entries(emitted.networkOutputs ?? {}))
          outputs[key] = expression(value.type, value.constant);
      } catch (e) {
        report(
          e instanceof Error ? e.name : "CONSTANT_ANALYSIS_UNAVAILABLE",
          e instanceof Error ? e.message : String(e),
          id,
        );
        values = Object.fromEntries(
          node.ports
            .filter((p) => p.direction === "output")
            .map((p) => [p.key, expression(p.type)]),
        );
      }
      cache.set(id, values);
      active.delete(id);
      return values;
    };
    // All authored nodes, including unused operations, participate in eligibility.
    for (const node of network.nodes) lower(node.id);
    return { outputs, errors };
  };
  for (const stage of doc.graph.stages) {
    const result = walk(stage.network, {}, []);
    diagnostics.push(
      ...result.errors.filter((e) => e.code === "CONSTANT_REQUIRED"),
    );
  }
  for (const r of doc.graph.resources) {
    const data = asNetwork(r, defs);
    if (!data) continue;
    let mode: "expand" | "function";
    try {
      mode = defs.resource(r.type)?.networkEmission?.mode(r.data) ?? "expand";
    } catch (e) {
      diagnostics.push(
        issue("NETWORK_EMISSION_MODE", String(e), { resourceId: r.id }),
      );
      continue;
    }
    if (mode === "function") {
      const boundary = Object.fromEntries(
        data.interface
          .filter((p) => p.direction === "input")
          .map((p) => [p.key, expression(p.type, false)]),
      );
      const result = walk(data.network, boundary, [r.id], r.id, true);
      const seen = new Set<string>();
      const extentDependencies = (type: string) => {
        for (const id of typeReferences(type)) {
          if (seen.has(id)) continue;
          seen.add(id);
          const referenced = doc.graph.resources.find((r) => r.id === id);
          if (!referenced) continue;
          const owner = defs.resource(referenced.type);
          for (const input of owner?.extentInputs?.(referenced.data) ?? []) {
            if (input.networkId === data.network.id)
              result.errors.push({
                ...issue(
                  "FUNCTION_EXTENT_PARAMETER",
                  "A symbolic type extent depends on ordinary function input " +
                    input.portKey +
                    ". Use a literal or source-bound fixed shape.",
                  {
                    resourceId: r.id,
                    nodeId: input.nodeId,
                    portKey: input.portKey,
                  },
                ),
                related: refs(r.id),
              });
          }
          if (owner?.model === "structure")
            for (const field of (
              referenced.data as unknown as { fields: { type: string }[] }
            ).fields)
              extentDependencies(field.type);
        }
      };
      for (const node of data.network.nodes)
        for (const port of node.ports) extentDependencies(port.type);
      functions.set(r.id, result.errors);
      diagnostics.push(...result.errors);
    }
    if (!visited.has(r.id)) {
      const boundary = Object.fromEntries(
        data.interface
          .filter((p) => p.direction === "input")
          .map((p) => [
            p.key,
            expression(p.type, mode === "function" ? false : true),
          ]),
      );
      diagnostics.push(
        ...walk(data.network, boundary, [r.id], r.id).errors.filter(
          (e) => e.code === "CONSTANT_REQUIRED",
        ),
      );
    }
  }
  const unique = new Map(diagnostics.map((d) => [JSON.stringify(d), d]));
  return { edges, diagnostics: [...unique.values()], functions };
}
