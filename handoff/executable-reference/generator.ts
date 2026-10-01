import { ComputeContractError, HelperRegistry, TypeEnvironment, automaticAdaptation, encodeIdentity, moduleContext, typeTokenValid, typeResourceIssues } from "./qualification-compute.ts";
import { GeneratedProvenance } from "./generation-provenance.ts";
import type {
  Adaptation,
  EdgeRecord,
  GenerationResult,
  Json,
  NodeRecord,
  NodeType,
  PortSpec,
  Result,
  Snapshot,
  StageRecord,
  TypedExpression,
  TypeRef,
  Value,
  ValueType,
} from "./contracts.ts";

export interface GeneratedStageProgram {
  globals: string[];
  body: string[];
  result: string;
  varyings: { symbol: string; type: string; declaration: string }[];
}
export interface GenerationProfile {
  readonly id: string;
  readonly graphKinds: readonly ("td.top" | "td.mat")[];
  readonly vertexNetwork: boolean;
  readonly capabilities?: readonly string[];
  createTypes?(document: Snapshot["document"]): TypeEnvironment;
  validateType(type: ValueType, environment: TypeEnvironment): void;
  render(programs: { vertex: GeneratedStageProgram | null; pixel: GeneratedStageProgram }): { vertex: string; pixel: string };
}
// Profiles own language/version/shell conventions; NodeTypes own operations.
// This profile is an ES experiment, NOT a TouchDesigner native adapter.
export const ES300_PROFILE: GenerationProfile = Object.freeze({
  id: "qualification.glsl-es-300",
  graphKinds: ["td.top"] as const,
  vertexNetwork: false,
  capabilities: ["glsl.derivatives.standard"],
  validateType: (type: ValueType, environment: TypeEnvironment) => environment.requireES300(type),
  render: ({ vertex, pixel }: { vertex: GeneratedStageProgram | null; pixel: GeneratedStageProgram }) => ({
    vertex: vertex ? `#version 300 es\nprecision highp float;\nprecision highp int;\n${vertex.globals.join("\n")}\n${vertex.varyings.map(v => `out ${v.declaration};`).join("\n")}\nvoid main() {\n${vertex.body.join("\n")}\n  gl_Position = ${vertex.result};\n}\n`
      : "#version 300 es\nprecision highp float;\nlayout(location = 0) in vec2 position;\nvoid main() {\n  gl_Position = vec4(position, 0.0, 1.0);\n}\n",
    pixel: `#version 300 es\nprecision highp float;\nprecision highp int;\n${pixel.globals.join("\n")}\n${pixel.varyings.map(v => `in ${v.declaration};`).join("\n")}\nlayout(location = 0) out vec4 outColor;\nvoid main() {\n${pixel.body.join("\n")}\n  outColor = ${pixel.result};\n}\n`,
  }),
});

// This backend emits standalone GLSL ES 3.00. It is not a TouchDesigner adapter.
class GenerationFailure extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}
function fail(code: string, message: string): never {
  throw new GenerationFailure(code, message);
}
function requireCapability(profile: GenerationProfile, id: string): void {
  if (typeof id !== "string" || !id.length || !profile.capabilities?.includes(id)) fail("BACKEND_CAPABILITY", `Profile ${profile.id} does not provide ${id}`);
}
const refKey = (ref: TypeRef) =>
  JSON.stringify([ref.moduleId, ref.typeId, ref.version, ref.fingerprint]);
const width = (type: ValueType) =>
  type.startsWith("vec") ? Number(type.slice(3)) : 1;
const types: ValueType[] = ["float", "int", "bool", "vec2", "vec3", "vec4"];
const isFloat = (type: ValueType) => type === "float" || type.startsWith("vec");
const deepFreeze = <T>(value: T): T => {
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) deepFreeze(item);
    Object.freeze(value);
  }
  return value;
};
const stateCopy = (value: Json) => deepFreeze(structuredClone(value));
function callback<T>(nodeId: string, part: string, fn: () => T): T {
  try {
    return fn();
  } catch (error) {
    if (error instanceof GenerationFailure) throw error;
    return fail(
      "MODULE_CALLBACK_FAILED",
      `${nodeId} ${part}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
function validValue(type: ValueType, value: unknown, resources: Snapshot["document"]["resources"] = []): value is Value {
  return new TypeEnvironment(resources).valid(type, value);
}
function validAdaptation(
  plan: Adaptation,
  sourcePort: PortSpec,
  targetPort: PortSpec,
): boolean {
  const source = sourcePort.type, target = targetPort.type;
  if (plan.from !== source || plan.to !== target) return false;
  if (targetPort.connectionPolicy && targetPort.connectionPolicy !== "default") return automaticAdaptation(sourcePort, targetPort)?.op === plan.op;
  if (plan.op === "identity") return source === target;
  if (plan.op === "broadcast")
    return source === "float" && target.startsWith("vec");
  if (plan.op === "take")
    return isFloat(source) && isFloat(target) && width(source) > width(target);
  return plan.op === "alpha" && source === "vec3" && target === "vec4";
}
function adapted(
  plan: Adaptation,
  expression: TypedExpression,
): TypedExpression {
  const code =
    plan.op === "identity"
      ? expression.code
      : plan.op === "broadcast" || plan.op === "cast"
        ? `${plan.to}(${expression.code})`
        : plan.op === "take"
          ? `(${expression.code}).${"xyzw".slice(0, width(plan.to))}`
          : `vec4(${expression.code}, 1.0)`;
  return { type: plan.to, code, constant: expression.constant === true };
}
function literal(type: ValueType, value: Value, environment: TypeEnvironment): TypedExpression {
  return { type, code: environment.literal(type, value), constant: true };
}
// Full UTF-8 encoding is injective; no name-dependent output or hash collision.
const encoded = (value: string) =>
  Array.from(new TextEncoder().encode(value), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
const symbol = (nodeId: string, portKey: string) =>
  `n_${encoded(nodeId)}_p_${encoded(portKey)}`;
const portKey = (port: PortSpec) => `${port.direction}:${port.key}`;
function canonicalPort(port: PortSpec) {
  return JSON.stringify([
    port.key,
    port.direction,
    port.type,
    port.semantic ?? null,
    port.supply ?? null,
    port.default ?? null,
    port.requireConstant ?? false,
    port.connectionPolicy ?? "default",
  ]);
}

interface Validated {
  nodes: Map<string, NodeRecord>;
  definitions: Map<string, NodeType>;
  incoming: Map<string, EdgeRecord>;
  pixel: StageRecord;
  boundary: NodeRecord;
}
function validate(snapshot: Snapshot, profile: GenerationProfile, environment: TypeEnvironment): Validated {
  const document = snapshot.document;
  const resourceErrors = [...typeResourceIssues(document), ...(snapshot.definitions.validateResources?.(document) ?? [])];
  if (resourceErrors.some(issue => issue.severity === "error")) fail("RESOURCE_ERRORS", resourceErrors.map(issue => issue.message).join("; "));
  if (
    document.format !== "grape-core-experiment" ||
    document.formatVersion !== 1 ||
    !profile.graphKinds.includes(document.kind)
  )
    fail(
      "UNSUPPORTED_GRAPH",
      "Expected core experiment graph version 1, td.top kind",
    );
  if (
    document.stages.length !== 2 ||
    document.stages.filter((stage) => stage.kind === "vertex").length !== 1 ||
    document.stages.filter((stage) => stage.kind === "pixel").length !== 1
  )
    fail("STAGE_SCHEMA", "Exactly one vertex and one pixel Stage are required");
  const definitions = new Map<string, NodeType>();
  const pinned = new Set(document.definitions.map(refKey));
  for (const ref of document.definitions) {
    const definition = snapshot.definitions.resolve(ref);
    if (!definition || refKey(definition.ref) !== refKey(ref))
      fail("MISSING_DEFINITION", `Missing exact definition ${refKey(ref)}`);
    definitions.set(refKey(ref), definition);
  }
  if (!pinned.has(refKey(document.outputType)))
    fail("MISSING_DEFINITION", "Output definition is not pinned");
  const nodes = new Map<string, NodeRecord>();
  const nodeStage = new Map<string, StageRecord>();
  const stageIds = new Set<string>();
  const edgeIds = new Set<string>();
  const incoming = new Map<string, EdgeRecord>();
  const boundaryNodes: NodeRecord[] = [];
  const endpointKey = (nodeId: string, key: string) =>
    JSON.stringify([nodeId, key]);
  for (const stage of document.stages) {
    if (!stage.id || stageIds.has(stage.id))
      fail("DUPLICATE_ID", "Stage IDs must be unique and nonempty");
    stageIds.add(stage.id);
    if (
      stage.implementation !== "default" &&
      stage.implementation !== "network"
    )
      fail("STAGE_SCHEMA", "Unknown Stage implementation");
    if (stage.kind === "vertex" && stage.implementation !== "default" && !profile.vertexNetwork)
      fail(
        "UNSUPPORTED_VERTEX_NETWORK",
        "This minimal backend only implements default vertex scaffold",
      );
    for (const node of stage.nodes) {
      if (!node.id || nodes.has(node.id))
        fail("DUPLICATE_ID", "Node IDs must be unique and nonempty");
      nodes.set(node.id, node);
      nodeStage.set(node.id, stage);
      const definition = definitions.get(refKey(node.typeRef));
      if (!definition)
        fail(
          "MISSING_DEFINITION",
          `${node.id}: definition is not available in pinned set`,
        );
      if (!definition.stages.includes(stage.kind) || (definition.targets && !definition.targets.includes(document.kind)))
        fail(
          "STAGE_NOT_ALLOWED",
          `${node.id}: definition cannot be used in ${stage.kind}`,
        );
      for (const capability of definition.requiredCapabilities ?? []) requireCapability(profile, capability);
      const codecErrors = callback(node.id, "state codec", () =>
        definition.stateCodec.validate(stateCopy(node.state)),
      );
      if (!Array.isArray(codecErrors) || codecErrors.length)
        fail("INVALID_NODE_STATE", `${node.id}: ${codecErrors}`);
      const semanticErrors = callback(node.id, "validate", () =>
        definition.validate(stateCopy(node.state), moduleContext(document, node, stage.kind, snapshot.definitions)),
      );
      if (!Array.isArray(semanticErrors) || semanticErrors.length)
        fail("INVALID_NODE_STATE", `${node.id}: ${semanticErrors}`);
      const expectedPorts = callback(node.id, "ports", () =>
        definition.ports(stateCopy(node.state), moduleContext(document, node, stage.kind, snapshot.definitions)),
      );
      const keys = new Set<string>();
      for (const port of expectedPorts) {
        profile.validateType(port.type, environment);
        if (
          !port.key ||
          keys.has(portKey(port)) ||
          !typeTokenValid(port.type) ||
          !["input", "output"].includes(port.direction)
        )
          fail("INVALID_PORT_SCHEMA", `${node.id}: invalid or duplicate port`);
        keys.add(portKey(port));
        if (
          port.direction === "input" &&
          port.supply !== "local" &&
          port.supply !== "required"
        )
          fail(
            "INVALID_PORT_SCHEMA",
            `${node.id}: input supply must be explicit`,
          );
        if (port.default !== undefined && !validValue(port.type, port.default, document.resources))
          fail(
            "INVALID_PORT_SCHEMA",
            `${node.id}: invalid default for ${port.key}`,
          );
      }
      if (
        expectedPorts.length !== node.ports.length ||
        expectedPorts.some(
          (port, index) =>
            canonicalPort(port) !== canonicalPort(node.ports[index]),
        )
      )
        fail(
          "PORT_SCHEMA_MISMATCH",
          `${node.id}: saved ports do not match current state and pinned definition`,
        );
      for (const [key, value] of Object.entries(node.values)) {
        const port = node.ports.find(
          (port) => port.direction === "input" && port.key === key,
        );
        if (!port || port.supply !== "local" || !validValue(port.type, value, document.resources))
          fail(
            "INVALID_INPUT_VALUE",
            `${node.id}: invalid stored local value ${key}`,
          );
      }
      if (definition.role === "boundary") {
        if (
          stage.kind !== "pixel" ||
          refKey(node.typeRef) !== refKey(document.outputType)
        )
          fail(
            "BOUNDARY_SCHEMA",
            "Only the configured pixel output boundary is supported",
          );
        boundaryNodes.push(node);
      }
    }
  }
  for (const stage of document.stages) {
    for (const edge of stage.edges) {
      if (!edge.id || edgeIds.has(edge.id))
        fail("DUPLICATE_ID", "Edge IDs must be unique and nonempty");
      edgeIds.add(edge.id);
      const source = nodes.get(edge.from.nodeId);
      const target = nodes.get(edge.to.nodeId);
      if (
        !source ||
        !target ||
        nodeStage.get(source.id) !== stage ||
        nodeStage.get(target.id) !== stage
      )
        fail(
          "INVALID_CONNECTION",
          `${edge.id}: both endpoints must exist in the same Stage`,
        );
      const output = source.ports.find(
        (port) => port.direction === "output" && port.key === edge.from.key,
      );
      const input = target.ports.find(
        (port) => port.direction === "input" && port.key === edge.to.key,
      );
      if (
        !output ||
        !input ||
        !validAdaptation(edge.adaptation, output, input)
      )
        fail(
          "INVALID_CONNECTION",
          `${edge.id}: endpoint or adaptation is invalid`,
        );
      const key = endpointKey(target.id, input.key);
      if (incoming.has(key))
        fail(
          "MULTIPLE_INPUT_EDGES",
          `${target.id}.${input.key} has more than one edge`,
        );
      incoming.set(key, edge);
    }
  }
  for (const node of nodes.values()) {
    for (const port of node.ports.filter(
      (port) => port.direction === "input",
    )) {
      if (
        !incoming.has(endpointKey(node.id, port.key)) &&
        port.supply === "required"
      )
        fail("REQUIRED_INPUT", `${node.id}.${port.key} requires a connection`);
      if (
        !incoming.has(endpointKey(node.id, port.key)) &&
        port.supply === "local" &&
        !validValue(port.type, node.values[port.key] ?? port.default, document.resources)
      )
        fail(
          "INVALID_INPUT_VALUE",
          `${node.id}.${port.key} has no valid local value`,
        );
    }
  }
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) fail("CYCLE", `Dependency cycle at ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const edge of incoming.values())
      if (edge.to.nodeId === id) visit(edge.from.nodeId);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of nodes.keys()) visit(id);
  if (boundaryNodes.length !== 1)
    fail(
      "BOUNDARY_SCHEMA",
      "Exactly one configured output boundary is required",
    );
  const pixel = document.stages.find((stage) => stage.kind === "pixel")!;
  if (pixel.implementation !== "network")
    fail(
      "UNSUPPORTED_PIXEL_DEFAULT",
      "This backend requires pixel network implementation",
    );
  if (snapshot.diagnostics.some((issue) => issue.severity === "error"))
    fail("GRAPH_ERRORS", "Snapshot contains generation-blocking model errors");
  return { nodes, definitions, incoming, pixel, boundary: boundaryNodes[0] };
}

export function generate(snapshot: Snapshot, profile: GenerationProfile = ES300_PROFILE): Result<GenerationResult> {
  try {
    const environment = profile.createTypes?.(snapshot.document) ?? new TypeEnvironment(snapshot.document.resources);
    const validated = validate(snapshot, profile, environment);
    const helpers = new HelperRegistry();
    const provenance = new GeneratedProvenance();
    const uniformTypes = new Map<string, string>();
    let depthWriters = 0;
    const emitted = new Map<string, Record<string, TypedExpression>>();
    const stageLines: Record<"vertex" | "pixel", string[]> = { vertex: [], pixel: [] };
    const varyings = new Map<string, { type: string; symbol: string; written: boolean; read: boolean }>();
    let position: TypedExpression | undefined;
    const sourceMap: GenerationResult["sourceMap"] = [];
    let color: TypedExpression | undefined;
    const emit = (node: NodeRecord): Record<string, TypedExpression> => {
      const cached = emitted.get(node.id);
      if (cached) return cached;
      const definition = validated.definitions.get(refKey(node.typeRef))!;
      const stageKind = snapshot.document.stages.find(stage => stage.nodes.some(n => n.id === node.id))!.kind;
      const lines = stageLines[stageKind];
      const emission = callback(node.id, "emit", () =>
        definition.emit(
          stateCopy(node.state),
          Object.freeze({
            ...moduleContext(snapshot.document, node, stageKind, snapshot.definitions),
            requireCapability: (id: string) => requireCapability(profile, id),
            trace: (origin: { path: readonly string[]; definitionId?: string; portKey?: string }, code: string) => provenance.mark({ ...origin, path: [node.id, ...origin.path] }, code),
            local(key: string): string {
              if (!key) fail("LOCAL_SYMBOL", "Local symbol key is required");
              return `l_${encodeIdentity(node.id)}_${encodeIdentity(key)}`;
            },
            helper(key: string, body: string): string { return helpers.register(refKey(node.typeRef), key, body); },
            uniform(resourceId: string, type: ValueType): TypedExpression {
              if (!snapshot.document.resources.some(r => r.id === resourceId)) fail("MISSING_REFERENCE", "Uniform resource not found");
              profile.validateType(type, environment);
              const previous = uniformTypes.get(resourceId);
              if (previous && previous !== type) fail("UNIFORM_CONFLICT", "One resource cannot declare two uniform types");
              uniformTypes.set(resourceId, type);
              return Object.freeze({ type, code: `u_${encodeIdentity(resourceId)}`, constant: false });
            },
            varying(key: string, type: ValueType, value?: TypedExpression): TypedExpression {
              const shape = environment.resolve(type);
              // Bounded default interpolation: only float scalar/vector. Integer flat policies remain explicit work.
              if (!(shape.kind === "scalar" || shape.kind === "vector") || shape.scalar !== "float") fail("VARYING_TYPE", "Qualification varyings require float scalar/vector");
              const previous = varyings.get(key);
              if (!key || previous && previous.type !== type) fail("VARYING_CONFLICT", "Varying identity/type conflict");
              const item = previous ?? { type, symbol: `v_${encodeIdentity(key)}`, written: false, read: false };
              if (stageKind === "vertex") {
                if (!value || value.type !== type || item.written) fail("VARYING_WRITER", "Varying needs exactly one typed vertex writer");
                item.written = true; lines.push(provenance.mark({ path: [node.id], portKey: key }, `  ${item.symbol} = ${value.code};`));
              } else {
                if (value) fail("VARYING_DIRECTION", "Pixel stage can only read varyings");
                item.read = true;
              }
              varyings.set(key, item); return Object.freeze({ type, code: item.symbol, constant: false });
            },
            input(key: string): TypedExpression {
              const port = node.ports.find(
                (port) => port.direction === "input" && port.key === key,
              );
              if (!port)
                return fail(
                  "UNKNOWN_INPUT",
                  `${node.id}: emitter requested unknown input ${key}`,
                );
              const edge = validated.incoming.get(
                JSON.stringify([node.id, key]),
              );
              const expression = edge
                ? adapted(edge.adaptation, emit(validated.nodes.get(edge.from.nodeId)!)[edge.from.key])
                : literal(port.type, node.values[key] ?? port.default!, environment);
              if (port.requireConstant && expression.constant !== true)
                fail("CONSTANT_REQUIRED", `${node.id}.${key} requires a proven constant expression`);
              return Object.freeze(expression);
            },
          }),
        ),
      );
      if (
        !emission ||
        !emission.outputs ||
        typeof emission.outputs !== "object"
      )
        fail("EMISSION_SCHEMA", `${node.id}: emitter must return outputs`);
      if (emission.statements !== undefined) {
        if (!Array.isArray(emission.statements) || emission.statements.some(s => typeof s !== "string" || !s.trim())) fail("EMISSION_SCHEMA", "Statements must be nonempty GLSL statements");
        lines.push(...emission.statements.map(statement => provenance.mark({ path: [node.id] }, `  ${statement}`)));
      }
      const outputs = node.ports.filter((port) => port.direction === "output");
      if (Object.keys(emission.outputs).length !== outputs.length)
        fail(
          "EMISSION_SCHEMA",
          `${node.id}: emitter output keys differ from declared ports`,
        );
      const locals: Record<string, TypedExpression> = {};
      for (const port of outputs) {
        const expression = emission.outputs[port.key];
        if (
          !expression ||
          expression.type !== port.type ||
          typeof expression.code !== "string" ||
          !expression.code.trim()
        )
          fail(
            "EMISSION_SCHEMA",
            `${node.id}.${port.key}: emitter type/key differs from declared port`,
          );
        const name = symbol(node.id, port.key);
        // Opaque sampler expressions alias the original resource, never an illegal local sampler.
        const resource = environment.resolve(port.type).kind === "resource";
        if (!resource) lines.push(provenance.mark({ path: [node.id], portKey: port.key }, `  ${expression.constant === true ? "const " : ""}${environment.declaration(port.type, name)} = ${expression.code};`));
        sourceMap.push({ symbol: resource ? expression.code : name, nodeId: node.id, portKey: port.key });
        locals[port.key] = Object.freeze({ type: port.type, code: resource ? expression.code : name, constant: expression.constant === true });
      }
      if (emission.effects?.length) {
        if (stageKind !== "pixel" || !definition.effectRoot || definition.role === "boundary") fail("EFFECT_ROLE", "Only a declared effect node can emit effects");
        for (const effect of emission.effects) {
          if (effect.kind === "discard" && effect.condition.type === "bool") lines.push(provenance.mark({ path: [node.id] }, `  if (${effect.condition.code}) discard;`));
          else if (effect.kind === "depth" && effect.value.type === "float") {
            if (++depthWriters > 1) fail("MULTIPLE_DEPTH_WRITERS", "Pixel Stage can have only one depth writer");
            lines.push(provenance.mark({ path: [node.id] }, `  gl_FragDepth = ${effect.value.code};`));
          } else fail("EFFECT_SCHEMA", "Effect type or value type invalid");
        }
      }
      if (emission.position !== undefined) {
        if (stageKind !== "vertex" || definition.stageOutput !== "position" || emission.position.type !== "vec4" || position)
          fail("POSITION_OUTPUT", "Vertex network needs one declared vec4 position result");
        position = { ...emission.position, code: provenance.mark({ path: [node.id], portKey: "position" }, emission.position.code) };
      }
      if (definition.role === "boundary") {
        if (
          !emission.color ||
          emission.color.type !== "vec4" ||
          typeof emission.color.code !== "string" ||
          !emission.color.code.trim()
        )
          fail("EMISSION_SCHEMA", `${node.id}: boundary must emit vec4 color`);
        color = { ...emission.color, code: provenance.mark({ path: [node.id], portKey: "color" }, emission.color.code) };
      } else if (emission.color !== undefined)
        fail(
          "EMISSION_SCHEMA",
          `${node.id}: operation cannot emit boundary color`,
        );
      emitted.set(node.id, locals);
      return locals;
    };
    const vertexStage = snapshot.document.stages.find(stage => stage.kind === "vertex")!;
    if (vertexStage.implementation === "network") {
      const roots = vertexStage.nodes.filter(node => validated.definitions.get(refKey(node.typeRef))!.stageOutput === "position");
      if (roots.length !== 1) fail("POSITION_OUTPUT", "Vertex network requires exactly one position root");
      emit(roots[0]);
      if (!position) fail("POSITION_OUTPUT", "Vertex output emitter did not provide position");
    }
    emit(validated.boundary);
    for (const node of validated.pixel.nodes) if (validated.definitions.get(refKey(node.typeRef))!.effectRoot) emit(node);
    if (!color) fail("EMISSION_SCHEMA", "No pixel boundary expression");
    if ([...varyings.values()].some(v => v.read && !v.written)) fail("VARYING_UNBOUND", "Pixel varying has no vertex writer");
    const declarations = environment.declarations([...validated.nodes.values()].flatMap(node => node.ports.map(p => p.type)));
    const uniforms = [...uniformTypes].map(([id, type]) => `uniform ${environment.declaration(type, `u_${encodeIdentity(id)}`)};`);
    const globals = [...declarations, ...uniforms, ...helpers.source()];
    const sharedVaryings = [...varyings.values()].map(v => ({ symbol: v.symbol, type: v.type, declaration: environment.declaration(v.type, v.symbol) }));
    const programs = {
      vertex: position ? { globals, body: stageLines.vertex, result: position.code, varyings: sharedVaryings } : null,
      pixel: { globals, body: stageLines.pixel, result: color.code, varyings: sharedVaryings },
    };
    const requiredCode = JSON.stringify(programs);
    const rendered = profile.render(programs);
    if (!rendered.vertex?.trim() || !rendered.pixel?.trim()) fail("PROFILE_OUTPUT", "Backend must return both shader stages");
    const { vertex, pixel, spans } = provenance.finish(rendered, requiredCode);
    return {
      ok: true,
      value: {
        vertex,
        pixel,
        sourceMap: sourceMap.map(entry => ({ ...entry, symbol: entry.symbol.replace(/\/\*__grape_trace_(?:begin|end)_\d+__\*\//g, "") })),
        diagnosticMap: { profileId: profile.id, artifactKey: JSON.stringify([profile.id, snapshot.loadId, snapshot.revision, vertex, pixel]), spans },
        revision: snapshot.revision,
        loadId: snapshot.loadId,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code:
          error instanceof GenerationFailure || error instanceof ComputeContractError ? error.code : "GENERATION_FAILED",
        message: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
