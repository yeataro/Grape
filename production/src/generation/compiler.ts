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
import { detached, demand, issue } from "../sdk/kernel.ts";
import { glslType, width } from "../definitions/types.ts";
function adapt(
  input: GLSLExpression,
  plan: EdgeAdaptationDocument,
): GLSLExpression {
  const type = glslType(plan.targetType);
  let code = input.code;
  if (plan.operation === "broadcast" || plan.operation === "numeric-cast")
    code = `${type}(${code})`;
  if (plan.operation === "take-leading")
    code = `(${code}).${"xyzw".slice(0, width(plan.targetType))}`;
  if (plan.operation === "append-alpha-one") code = `vec4(${code}, 1.0)`;
  return { type: plan.targetType, code, constant: input.constant };
}
export function compile(
  snapshot: GraphSnapshot,
  definitions: DefinitionSet,
  profile: GLSLProfile,
): Compilation {
  const diagnostics: ContractIssue[] = [...snapshot.diagnostics],
    provenance: { stageId: string; nodeId: string; symbol: string }[] = [];
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
      bindingSchema: [],
      provenance,
    });
  try {
    const doc = snapshot.document,
      kind = definitions.kind(doc.graph.kind);
    demand(kind, "KIND_MISSING");
    demand(profile.graphKindIds.includes(kind.ref.kindId), "PROFILE_KIND");
    const requirements = [...kind.requiredGeneratorCapabilities];
    for (const s of doc.graph.stages) {
      demand(profile.stageKindIds.includes(s.stageKindId), "PROFILE_STAGE");
      requirements.push(
        ...(definitions.stage(s.stageKindId)?.requiredGeneratorCapabilities ??
          []),
      );
      for (const n of s.network.nodes) {
        const def = definitions.node(n.type);
        demand(def, "NODE_MISSING");
        requirements.push(
          ...(def.eligibility.requiredGeneratorCapabilities ?? []),
        );
        for (const p of n.ports)
          diagnostics.push(...profile.validateType(p.type));
      }
    }
    demand(
      requirements.every((c) => profile.capabilities.includes(c)),
      "PROFILE_CAPABILITY",
    );
    if (diagnostics.some((x) => x.severity === "error")) return result([]);
    const programs: GLSLStageProgram[] = doc.graph.stages.map((stage) => {
      const outputs: Record<string, GLSLExpression> = {},
        body: string[] = [],
        emitted = new Map<string, Record<string, GLSLExpression>>(),
        active = new Set<string>();
      const network = stage.network;
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
                definitions.types.planValid(e.adaptation, from, p),
              "EDGE_INVALID",
            );
            const source = lower(e.from.nodeId)[e.from.portKey];
            demand(source, "EMISSION_PORT");
            if (p.requireConstant) demand(source.constant, "CONSTANT_REQUIRED");
            inputs[p.key] = adapt(source, e.adaptation);
          } else {
            const value = node.inputValues[p.key];
            demand(value !== undefined, "INPUT_REQUIRED");
            const literal = (n: unknown) =>
              Number.isInteger(n) ? `${n}.0` : String(n);
            inputs[p.key] = {
              type: p.type,
              code: Array.isArray(value)
                ? `${glslType(p.type)}(${value.map(literal).join(", ")})`
                : literal(value),
              constant: true,
            };
          }
        }
        const emission = def.emit(detached(node.state), detached(inputs));
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
          const symbol = `n_${network.nodes.indexOf(node)}_p${node.ports.indexOf(p)}`;
          body.push(`${glslType(p.type)} ${symbol} = ${expression.code};`);
          values[p.key] = { ...expression, code: symbol };
          provenance.push({ stageId: stage.id, nodeId: id, symbol });
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
        body.push(...(emission.statements ?? []));
        demand(!emission.effects?.length, "PROFILE_EFFECT_UNSUPPORTED");
        active.delete(id);
        emitted.set(id, values);
        return values;
      };
      if (stage.implementation === "network")
        for (const node of network.nodes)
          if (definitions.node(node.type)?.role === "boundary") lower(node.id);
      return {
        stageId: stage.id,
        slotKey: stage.key,
        stageKindId: stage.stageKindId,
        implementation: stage.implementation,
        globals: [],
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
