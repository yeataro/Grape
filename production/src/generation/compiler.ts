import {
  networks,
  asNetwork,
  typeSystem,
  definitionStages,
  callResource,
} from "../sdk/networks.ts";
import type { StructureData, SourceData } from "../sdk/networks.ts";
import type { NetworkDocument } from "../sdk/document.ts";
import type { Json } from "../sdk/public-surface.ts";
import { parseType, formatType } from "../sdk/type-tokens.ts";
import type {
  DefinitionSet,
  GraphSnapshot,
  Compilation,
} from "../sdk/editing.ts";
import type {
  GLSLProfile,
  ContractIssue,
  GLSLExpression,
  GLSLStageProgram,
} from "../sdk/public-surface.ts";
import type { EdgeAdaptationDocument } from "../sdk/document.ts";
import { detached, demand, issue, equal } from "../sdk/kernel.ts";
import { glslType, width } from "../definitions/types.ts";
import { glslFloatLiteral } from "../sdk/glsl.ts";
import { analyzeConstants } from "../definitions/constant-analysis.ts";
function adapt(
  input: GLSLExpression,
  plan: EdgeAdaptationDocument,
): GLSLExpression {
  if (plan.operation === "identity") return { ...input, type: plan.targetType };
  const type = glslType(plan.targetType);
  let code = input.code;
  if (plan.operation === "broadcast" || plan.operation === "numeric-cast")
    code = `${type}(${code})`;
  if (plan.operation === "take-leading")
    code = `(${code}).${"xyzw".slice(0, width(plan.targetType))}`;
  if (plan.operation === "append-alpha-one") code = `vec4(${code}, 1.0)`;
  if (plan.operation === "pad-vector")
    code = `${type}(${code}, 0.0${plan.targetType === "glsl.vec4" ? ", 1.0" : ""})`;
  return { type: plan.targetType, code, constant: input.constant };
}
export function compile(
  snapshot: GraphSnapshot,
  definitions: DefinitionSet,
  profile: GLSLProfile,
): Compilation {
  const diagnostics: ContractIssue[] = [...snapshot.diagnostics],
    provenance: { stageId: string; nodeId: string; symbol: string }[] = [],
    bindingSchema: Json[] = [];
  const result = (artifacts: Compilation["artifacts"]): Compilation =>
    detached({
      status: diagnostics.some((x) => x.severity === "error")
        ? "failed"
        : "success",
      loadId: snapshot.loadId,
      revision: snapshot.revision,
      profile: profile.ref,
      artifacts,
      diagnostics,
      document: snapshot.document,
      bindingSchema,
      provenance,
    });
  try {
    const doc = snapshot.document,
      kind = definitions.kind(doc.graph.kind);
    demand(kind, "KIND_MISSING");
    demand(profile.graphKindIds.includes(kind.ref.kindId), "PROFILE_KIND");
    diagnostics.push(
      ...analyzeConstants(doc, definitions, profile).diagnostics,
    );
    for (const { network } of networks(doc, definitions))
      if (network.nodes.length > 256 || network.edges.length > 1024)
        diagnostics.push(
          issue(
            "NETWORK_SIZE",
            "Network exceeds the admitted node or edge capacity.",
          ),
        );
    for (const resource of doc.graph.resources) {
      const network = asNetwork(resource, definitions);
      if (network)
        for (const direction of ["input", "output"]) {
          if (
            network.interface.filter((port) => port.direction === direction)
              .length > 16
          )
            diagnostics.push(
              issue(
                "INTERFACE_PORT_LIMIT",
                "Subgraph compilation supports at most 16 ports per direction.",
              ),
            );
        }
    }
    const types = typeSystem(doc, definitions),
      structureIds = doc.graph.resources
        .filter((r) => definitions.resource(r.type)?.model === "structure")
        .map((r) => r.id);
    const lengthOf = (extent: number | { sourceId: string }) =>
      typeof extent === "number" ? extent : types.extent(extent.sourceId);
    const typeName = (type: string): string => {
      const t = parseType(type);
      return t.kind === "structure"
        ? "GrapeStruct" + structureIds.indexOf(t.id)
        : t.kind === "array"
          ? typeName(formatType(t.element)) + "[" + lengthOf(t.extent) + "]"
          : glslType(type);
    };
    const literal = (type: string, value: Json): string => {
      if (type === "glsl.int" || type === "glsl.uint") {
        demand(types.validValue(type, value), "TYPE_VALUE");
        return String(value) + (type === "glsl.uint" ? "u" : "");
      }
      const t = parseType(type);
      if (t.kind === "structure") {
        const data = doc.graph.resources.find((r) => r.id === t.id)!
          .data as unknown as StructureData;
        return (
          typeName(type) +
          "(" +
          data.fields
            .map((f) => literal(f.type, (value as Record<string, Json>)[f.id]))
            .join(", ") +
          ")"
        );
      }
      if (t.kind === "array")
        return (
          typeName(type) +
          "(" +
          (value as Json[])
            .map((v) => literal(formatType(t.element), v))
            .join(", ") +
          ")"
        );
      return Array.isArray(value)
        ? typeName(type) +
            "(" +
            value.flat().map(glslFloatLiteral).join(", ") +
            ")"
        : glslFloatLiteral(value);
    };
    const globals: string[] = [],
      declared = new Set<string>();
    const checkType = (type: string) => {
      demand(types.resolve(type), "TYPE_UNKNOWN");
      const t = parseType(type);
      diagnostics.push(...profile.validateType(type));
      if (t.kind === "array") {
        if (typeof t.extent !== "number") {
          const ref = t.extent.sourceId,
            r = doc.graph.resources.find((r) => r.id === ref);
          if (r && definitions.resource(r.type)?.model === "source") {
            const source = r.data as unknown as SourceData;
            demand(
              !source.binding || source.binding.kind === "constant",
              "EXTENT_RUNTIME_UNAVAILABLE",
            );
          }
        }
        checkType(formatType(t.element));
      }
      if (t.kind === "structure" && !declared.has(t.id)) {
        declared.add(t.id);
        const data = doc.graph.resources.find((r) => r.id === t.id)!
          .data as unknown as StructureData;
        data.fields.forEach((f) => checkType(f.type));
        globals.push(
          "struct " +
            typeName(type) +
            " { " +
            data.fields
              .map((f, i) => typeName(f.type) + " f" + i + ";")
              .join(" ") +
            " };",
        );
      }
    };
    const requirements = [...kind.requiredGeneratorCapabilities];
    for (const s of doc.graph.stages) {
      demand(profile.stageKindIds.includes(s.stageKindId), "PROFILE_STAGE");
      requirements.push(
        ...(definitions.stage(s.stageKindId)?.requiredGeneratorCapabilities ??
          []),
      );
      for (const n of networks(doc, definitions)
        .filter((row) => row.stageKindId === s.stageKindId)
        .flatMap((row) => row.network.nodes)) {
        const def = definitions.node(n.type);
        demand(def, "NODE_MISSING");
        requirements.push(
          ...(def.eligibility.requiredGeneratorCapabilities ?? []),
        );
        for (const p of n.ports) checkType(p.type);
      }
    }
    demand(
      requirements.every((c) => profile.capabilities.includes(c)),
      "PROFILE_CAPABILITY",
    );
    if (diagnostics.some((x) => x.severity === "error")) return result([]);
    // Uniform names are linked across stages: identity belongs to this complete
    // program, while each consuming shader still owns its declaration.
    const uniforms = new Map<
      string,
      { symbol: string; type: string; defaultValue: Json }
    >();
    const programs: GLSLStageProgram[] = doc.graph.stages.map((stage) => {
      const outputs: Record<string, GLSLExpression> = {},
        body: string[] = [],
        stageGlobals = [...globals],
        helpers = new Map<string, string>(),
        helperBodies: string[] = [],
        declaredUniforms = new Set<string>(),
        depthCounts = new Map<string[], number>(),
        helperDepth = new Map<string, number>();
      let ordinal = 0;
      const hasEffects = (
        network: NetworkDocument,
        seen = new Set<string>(),
      ): boolean =>
        network.nodes.some((node) => {
          if (definitions.node(node.type)?.effectful) return true;
          const id = callResource(node, definitions);
          if (!id || seen.has(id)) return false;
          const resource = doc.graph.resources.find((r) => r.id === id),
            data = resource && asNetwork(resource, definitions);
          return !!data && hasEffects(data.network, new Set([...seen, id]));
        });
      const lowerNetwork = (
        network: NetworkDocument,
        boundaryInputs: Record<string, GLSLExpression>,
        path: string[],
        sink: string[] = body,
      ): Record<string, GLSLExpression> => {
        const emitted = new Map<string, Record<string, GLSLExpression>>(),
          active = new Set<string>(),
          subOutputs: Record<string, GLSLExpression> = {};
        const lower = (id: string): Record<string, GLSLExpression> => {
          if (emitted.has(id)) return emitted.get(id)!;
          demand(!active.has(id), "CYCLE");
          active.add(id);
          const node = network.nodes.find((n) => n.id === id);
          demand(node, "NODE_MISSING");
          const def = definitions.node(node.type);
          demand(def, "NODE_MISSING");
          const inputs: Record<string, GLSLExpression> = {};
          for (const p of node.ports.filter((p) => p.direction === "input")) {
            const e = network.edges.find(
              (e) => e.to.nodeId === id && e.to.portKey === p.key,
            );
            if (e) {
              const from = network.nodes
                .find((n) => n.id === e.from.nodeId)
                ?.ports.find(
                  (p) => p.direction === "output" && p.key === e.from.portKey,
                );
              demand(
                !e.invalid &&
                  from &&
                  types.planValid(e.adaptation, from, p) &&
                  def.acceptsInput?.(detached(from), detached(p)) !== false,
                "EDGE_INVALID",
              );
              const source = lower(e.from.nodeId)[e.from.portKey];
              demand(source, "EMISSION_PORT");
              if (p.requireConstant)
                demand(source.constant, "CONSTANT_REQUIRED");
              inputs[p.key] = adapt(source, e.adaptation);
            } else {
              const value = node.inputValues[p.key];
              demand(value !== undefined, "INPUT_REQUIRED");
              inputs[p.key] = {
                type: p.type,
                code: literal(p.type, value),
                constant: true,
              };
            }
          }
          const emission = def.emit(
            detached(node.state),
            detached(inputs),
            Object.freeze({
              resources: detached(doc.graph.resources),
              types,
              boundaryInputs: detached(boundaryInputs),
              literal,
              typeName,
              uniform: (resourceId: string, type: string, value: Json) => {
                demand(
                  profile.capabilities.includes("grape.glsl.uniforms"),
                  "PROFILE_UNIFORM_UNSUPPORTED",
                );
                demand(
                  doc.graph.resources.some((r) => r.id === resourceId),
                  "RESOURCE_MISSING",
                );
                demand(
                  types.validValue(type, value) &&
                    !profile
                      .validateType(type)
                      .some((i) => i.severity === "error"),
                  "UNIFORM_TYPE",
                );
                let binding = uniforms.get(resourceId);
                if (binding)
                  demand(
                    binding.type === type && equal(binding.defaultValue, value),
                    "UNIFORM_CONFLICT",
                  );
                if (!binding) {
                  binding = {
                    symbol: "u_grape_" + uniforms.size,
                    type,
                    defaultValue: detached(value),
                  };
                  uniforms.set(resourceId, binding);
                }
                if (!declaredUniforms.has(resourceId)) {
                  declaredUniforms.add(resourceId);
                  stageGlobals.push(
                    `uniform ${typeName(type)} ${binding.symbol};`,
                  );
                  bindingSchema.push({
                    stageId: stage.id,
                    resourceId,
                    ...binding,
                  });
                }
                return { type, code: binding.symbol, constant: false };
              },
              emitNetwork: (
                resourceId: string,
                values: Readonly<Record<string, GLSLExpression>>,
              ) => {
                const resource = doc.graph.resources.find(
                  (r) => r.id === resourceId,
                );
                demand(
                  resource && !path.includes(resource.id),
                  "DEFINITION_CYCLE",
                );
                const data = asNetwork(resource, definitions);
                demand(
                  data &&
                    definitionStages(doc, definitions, resource.id).includes(
                      stage.stageKindId,
                    ),
                  "SUBGRAPH_STAGE",
                );
                const mode =
                  definitions
                    .resource(resource.type)
                    ?.networkEmission?.mode(resource.data) ?? "expand";
                if (mode === "function") {
                  demand(
                    profile.capabilities.includes("grape.glsl.functions"),
                    "PROFILE_FUNCTION_UNSUPPORTED",
                  );
                  // Snapshot-local identity includes the exact resource, body, dependency/type
                  // environment and profile by construction. No cache crosses compilation jobs.
                  let helper = helpers.get(resourceId);
                  const inputs = data.interface.filter(
                      (p) => p.direction === "input",
                    ),
                    outs = data.interface.filter(
                      (p) => p.direction === "output",
                    );
                  if (!helper) {
                    helper = "grape_function_" + helpers.size;
                    helpers.set(resourceId, helper);
                    const helperBody: string[] = [];
                    const formals = Object.fromEntries(
                      inputs.map((p, i) => [
                        p.key,
                        { type: p.type, code: "arg_" + i, constant: false },
                      ]),
                    );
                    const returned = lowerNetwork(
                      data.network,
                      formals,
                      [resourceId],
                      helperBody,
                    );
                    helperDepth.set(
                      resourceId,
                      depthCounts.get(helperBody) ?? 0,
                    );
                    for (const [i, p] of outs.entries()) {
                      demand(returned[p.key]?.type === p.type, "EMISSION_TYPE");
                      helperBody.push(`out_${i} = ${returned[p.key].code};`);
                    }
                    helperBodies.push(
                      `void ${helper}(${[...inputs.map((p, i) => `${typeName(p.type)} arg_${i}`), ...outs.map((p, i) => `out ${typeName(p.type)} out_${i}`)].join(", ")}) {\n${helperBody.map((s) => "  " + s).join("\n")}\n}`,
                    );
                  }
                  const outputs = Object.fromEntries(
                    outs.map((p) => {
                      const symbol = "call_" + ordinal++;
                      sink.push(`${typeName(p.type)} ${symbol};`);
                      return [
                        p.key,
                        { type: p.type, code: symbol, constant: false },
                      ];
                    }),
                  );
                  sink.push(
                    `${helper}(${[...inputs.map((p) => values[p.key].code), ...outs.map((p) => outputs[p.key].code)].join(", ")});`,
                  );
                  depthCounts.set(
                    sink,
                    (depthCounts.get(sink) ?? 0) +
                      (helperDepth.get(resourceId) ?? 0),
                  );
                  return detached(outputs);
                }
                return detached(
                  lowerNetwork(
                    data.network,
                    { ...values },
                    [...path, resource.id, node.id],
                    sink,
                  ),
                );
              },
            }),
          );
          if (emission.networkOutputs)
            Object.assign(subOutputs, emission.networkOutputs);
          demand(
            Object.keys(emission.outputs).every((key) =>
              node.ports.some((p) => p.direction === "output" && p.key === key),
            ),
            "EMISSION_PORT",
          );
          const values: Record<string, GLSLExpression> = {};
          for (const p of node.ports.filter((p) => p.direction === "output")) {
            const expression = emission.outputs[p.key];
            demand(expression && expression.type === p.type, "EMISSION_TYPE");
            // Job-local ordinals are collision-free even for port keys that sanitize identically.
            // Persistent identity remains in provenance, never inferred from a GLSL spelling.
            const symbol = `n_${path.length ? "s" + ordinal++ + "_" : ""}${network.nodes.indexOf(node)}_p${node.ports.indexOf(p)}`;
            sink.push(
              `${expression.constant ? "const " : ""}${typeName(p.type)} ${symbol} = ${expression.code};`,
            );
            values[p.key] = { ...expression, code: symbol };
            provenance.push({
              stageId: stage.id,
              nodeId: [...path, id].join("/"),
              symbol,
            });
          }
          if (def.role === "boundary" || emission.boundaryOutputs) {
            demand(def.role === "boundary", "BOUNDARY_AUTHORITY");
            const specs = def.boundaryOutputs?.(node.state, node.ports) ?? [];
            for (const [key, value] of Object.entries(
              emission.boundaryOutputs ?? {},
            )) {
              demand(
                !outputs[key] &&
                  specs.some((s) => s.key === key && s.type === value.type),
                "BOUNDARY_OUTPUT",
              );
              outputs[key] = value;
            }
            demand(
              specs
                .filter((s) => s.required)
                .every((s) => emission.boundaryOutputs?.[s.key]),
              "BOUNDARY_REQUIRED",
            );
          }
          sink.push(...(emission.statements ?? []));
          for (const effect of emission.effects ?? []) {
            demand(
              stage.stageKindId === "grape.stage.pixel" &&
                profile.capabilities.includes("grape.glsl.pixel-effects"),
              "PROFILE_EFFECT_UNSUPPORTED",
            );
            if (effect.kind === "discard") {
              demand(effect.condition.type === "glsl.bool", "EFFECT_TYPE");
              sink.push(`if (${effect.condition.code}) discard;`);
            } else {
              demand(effect.value.type === "glsl.float", "EFFECT_TYPE");
              sink.push(`gl_FragDepth = ${effect.value.code};`);
              depthCounts.set(sink, (depthCounts.get(sink) ?? 0) + 1);
            }
          }
          active.delete(id);
          emitted.set(id, values);
          return values;
        };
        for (const node of network.nodes)
          if (
            (definitions.node(node.type)?.role === "boundary" &&
              definitions.node(node.type)?.modelRole !== "network-input") ||
            definitions.node(node.type)?.effectful ||
            (() => {
              const id = callResource(node, definitions),
                resource = id && doc.graph.resources.find((r) => r.id === id),
                data = resource && asNetwork(resource, definitions);
              return !!data && hasEffects(data.network);
            })()
          )
            lower(node.id);
        return subOutputs;
      };
      if (stage.implementation === "network")
        lowerNetwork(stage.network, {}, []);
      demand(
        (depthCounts.get(body) ?? 0) <= 1,
        "DEPTH_WRITERS",
        "A shader may have at most one live depth-writing occurrence.",
      );
      return {
        stageId: stage.id,
        slotKey: stage.key,
        stageKindId: stage.stageKindId,
        implementation: stage.implementation,
        globals: [...stageGlobals, ...helperBodies],
        body,
        outputs,
        varyings: [],
      };
    });
    const rendered = profile.render(
      Object.freeze({
        graphKind: kind,
        kindSettings: detached(doc.graph.kindSettings),
        stages: detached(programs),
      }),
    );
    diagnostics.push(...rendered.diagnostics);
    return result(
      diagnostics.some((x) => x.severity === "error") ? [] : rendered.artifacts,
    );
  } catch (error) {
    diagnostics.push(
      issue(
        error instanceof Error ? error.name : "GENERATION_FAILED",
        error instanceof Error ? error.message : String(error),
      ),
    );
    return result([]);
  }
}
