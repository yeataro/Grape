import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Graph, Registry, adaptation } from "../core.ts";
import { builtinModule, refs } from "../nodes.ts";
import { generate, ES300_PROFILE } from "../generator.ts";
import type { GenerationProfile } from "../generator.ts";
import { TypeEnvironment, HelperRegistry } from "../qualification-compute.ts";
import { bindGeneratedDiagnostics } from "../generation-provenance.ts";
import type { Json, NodeModule, NodeType, PortSpec, Result, TypeRef, Value } from "../contracts.ts";

const value = <T>(r: Result<T>): T => { if (!r.ok) throw new Error(`${r.error.code}: ${r.error.message}`); return r.value; };
const ref = (typeId: string): TypeRef => ({ moduleId: "qualification.compute", typeId, version: "1", fingerprint: "q-compute-1" });
const input = (key: string, type: string, fallback?: Value): PortSpec => ({ key, type, direction: "input", supply: fallback === undefined ? "required" : "local", ...(fallback === undefined ? {} : { default: fallback }) });
const output = (key: string, type: string): PortSpec => ({ key, type, direction: "output" });
const type = (name: string, extra: Partial<NodeType>): NodeType => ({ ref: ref(name), role: "operation", stages: ["pixel", "vertex"], stateCodec: { schemaVersion: 1, validate: () => [] }, initialize: args => ({ state: args }), ports: () => [], parameters: () => [], validate: () => [], emit: () => ({ outputs: {} }), ...extra });
const identityMat = [1, 0, 0, 1];
const members = [
  type("policy-switch", { ports: state => [{ ...input("value", "float", 0), connectionPolicy: (state as any).policy }, output("out", "float")], emit: (_, ctx) => ({ outputs: { out: ctx.input("value") } }) }),
  type("fine-derivative", { stages: ["pixel"], requiredCapabilities: ["glsl.derivatives.fine"], ports: () => [input("value", "float", 0.5), output("out", "float")], emit: (_, ctx) => ({ outputs: { out: { type: "float", code: `dFdxFine(${ctx.input("value").code})` } } }) }),
  type("dynamic-feature", { ports: () => [output("out", "float")], emit: (_, ctx) => { ctx.requireCapability("qualification.dynamic-feature"); return { outputs: { out: { type: "float", code: "1.0" } } }; } }),
  type("traced", { ports: () => [output("out", "vec4")], emit: (_, ctx) => ({ outputs: { out: { type: "vec4", code: ctx.trace({ path: ["inner-call", "leaf"], definitionId: "inner-definition", portKey: "out" }, "vec4(\n0.25, 0.5, 0.75, 1.0)") } } }) }),
  type("numeric", { ports: () => [{ ...input("color", "vec4"), connectionPolicy: "numeric" }], role: "boundary", stages: ["pixel"], emit: (_, ctx) => ({ outputs: {}, color: ctx.input("color") }) }),
  type("uniform-array", { initialize: args => ({ state: {}, references: { source: { kind: "resource", targetId: String(args) } } }), ports: () => [output("out", "float[#count]")], emit: (_, ctx) => ({ outputs: { out: ctx.uniform(ctx.referenceId("source")!, "float[#count]") } }) }),
  type("infer-router", { connectionTypePolicy: "infer", ports: (_, ctx) => { const t = ctx?.inputSource("value")?.port.type ?? "float"; return [input("value", t), output("out", t)]; }, emit: (_, ctx) => ({ outputs: { out: ctx.input("value") } }) }),
  type("extent", { ports: () => [input("array", "float[#count]"), output("out", "vec4")], emit: (_, ctx) => ({ outputs: { out: { type: "vec4", code: `vec4(float(${ctx.input("array").code}.length()) * 0.25)` } } }) }),
  type("preserve", { invalidEdgePolicy: "preserve", ports: state => [(state as any).mode === "gone" ? output("out", "float") : input("value", (state as any).mode === "int" ? "int" : "float", 0)], emit: () => ({ outputs: {} }) }),
  type("literal", { ports: state => { const s = state as any; return [input("value", s.type, s.value), output("out", s.type)]; }, emit: (_, ctx) => ({ outputs: { out: ctx.input("value") } }) }),
  type("matrix", { ports: () => [input("m", "mat2", identityMat), input("weights", "float[2]", [0.25, 0.5]), output("out", "vec4")], emit: (_, ctx) => ({ outputs: { out: { type: "vec4", code: `vec4(${ctx.input("m").code}[0][0] * ${ctx.input("weights").code}[1], 0.25, 0.0, 1.0)` } } }) }),
  type("structure", { ports: state => [input("data", "@surface", (state as any).value), output("out", "vec4")], emit: (_, ctx) => { const data = ctx.input("data"); return { outputs: { out: { type: "vec4", code: `vec4(${data.code}.f_636f6c6f72 * ${data.code}.f_77656967687473[0], 1.0)` } } }; } }),
  type("constant-demand", { ports: () => [{ ...input("value", "float"), requireConstant: true }, output("out", "vec4")], emit: (_, ctx) => ({ outputs: { out: { type: "vec4", code: `vec4(${ctx.input("value").code})` } } }) }),
  type("uniform", { initialize: args => ({ state: {}, references: { source: { kind: "resource", targetId: String(args) } } }), ports: () => [output("out", "float")], emit: (_, ctx) => ({ outputs: { out: ctx.uniform(ctx.referenceId("source")!, "float") } }) }),
  type("helper-out", { ports: () => [input("value", "float", 1.25), output("out", "vec4")], emit: (_, ctx) => { const temp = ctx.local("whole"); const helper = ctx.helper("twice", "float $name(float x) { return x * 2.0; }"); const v = ctx.input("value"); return { statements: [`float ${temp};`], outputs: { out: { type: "vec4", code: `vec4(${helper}(modf(${v.code}, ${temp})), ${temp} * 0.25, 0.0, 1.0)` } } }; } }),
  type("depth", { stages: ["pixel"], effectRoot: true, ports: () => [input("depth", "float", 0.5)], emit: (_, ctx) => ({ outputs: {}, effects: [{ kind: "depth", value: ctx.input("depth") }] }) }),
  type("discard", { stages: ["pixel"], effectRoot: true, ports: () => [input("condition", "bool", false)], emit: (_, ctx) => ({ outputs: {}, effects: [{ kind: "discard", condition: ctx.input("condition") }] }) }),
  type("position", { stages: ["vertex"], stageOutput: "position", emit: (_, ctx) => { ctx.varying("tint", "vec3", { type: "vec3", code: "vec3(0.25, 0.5, 0.75)" }); return { outputs: {}, position: { type: "vec4", code: "vec4(position, 0.0, 1.0)" } }; } }),
  type("varying", { stages: ["pixel"], ports: () => [output("out", "vec4")], emit: (_, ctx) => ({ outputs: { out: { type: "vec4", code: `vec4(${ctx.varying("tint", "vec3").code}, 1.0)` } } }) }),
  type("sampler", { initialize: args => ({ state: {}, references: { source: { kind: "resource", targetId: String(args) } } }), ports: () => [output("out", "sampler2D")], emit: (_, ctx) => ({ outputs: { out: ctx.uniform(ctx.referenceId("source")!, "sampler2D") } }) }),
  type("sample", { ports: () => [input("sampler", "sampler2D"), output("out", "vec4")], emit: (_, ctx) => ({ outputs: { out: { type: "vec4", code: `texture(${ctx.input("sampler").code}, vec2(0.5))` } } }) }),
];
const module: NodeModule = { manifest: { id: "qualification.compute", version: "1", fingerprint: "q-compute-1", coreApiVersion: 1, dependencies: [], source: "experiment", license: "test" }, resourceValidators: { source: () => [] }, types: members };
const registry = () => { const r = new Registry(); value(r.register(builtinModule)); value(r.register(module)); return r; };
const fixture = (kind: "td.top" | "td.mat" = "td.top") => { const r = registry(); return { r, g: new Graph({ name: "qualification", definitions: r.pin(), outputType: refs.output, kind }) }; };
const add = (g: Graph, name: string, args: Json = {}, stage: "vertex" | "pixel" = "pixel") => value(g.change("create", d => d.createNode(g.stage(stage).id, ref(name), args)));
const connect = (g: Graph, from: string, target = g.stage("pixel").node("output")!.id, key = "color") => value(g.change("connect", d => d.connect(g.nodeById(from)!.output("out"), g.nodeById(target)!.input(key))));
const surface: Json = { kind: "dataType", name: "Surface", type: { kind: "struct", fields: [{ key: "color", type: "vec3" }, { key: "weights", type: "float[2]" }] } };
const MAT_PROFILE: GenerationProfile = { ...ES300_PROFILE, id: "qualification.mat-es-shell", graphKinds: ["td.mat"], vertexNetwork: true, render(programs) { const result = ES300_PROFILE.render(programs); return { vertex: result.vertex.replace("void main()", "layout(location=0) in vec2 position;\nvoid main()"), pixel: result.pixel }; } };
class BoundTypes extends TypeEnvironment {
  override resolve(type: string, ancestors?: Set<string>) {
    const result = super.resolve(type, ancestors);
    if (result.kind === "array" && result.length === "HOST_COUNT") return { ...result, length: 2 };
    return result;
  }
}
const EXTENT_PROFILE: GenerationProfile = { ...ES300_PROFILE, id: "qualification.host-bound-extent", createTypes: document => new BoundTypes(document.resources) };

test("CQ01 integrated matrix + array ports survive edit/connect/generate/undo/reload", () => {
  const { g, r } = fixture(); const id = add(g, "matrix"); connect(g, id);
  assert.deepEqual(g.diagnostics, []); const shader = value(generate(g.snapshot())); assert.match(shader.pixel, /float\[[2]\]\(0.25, 0.5\)/);
  value(g.change("matrix edit", d => d.setInput(id, "m", [2, 0, 0, 2]))); assert.match(value(generate(g.snapshot())).pixel, /mat2\(2.0/);
  value(g.history.undo()); assert.equal(value(generate(g.snapshot())).pixel, shader.pixel);
  const loaded = value(Graph.load(g.exportJSON(), r)); assert.equal(value(generate(loaded.snapshot())).pixel, shader.pixel);
});
test("CQ02 graph-owned nominal structures keep identity independent of label and generate nested declarations", () => {
  const { g } = fixture(); value(g.change("structure", d => d.putResource("surface", surface)));
  const id = add(g, "structure", { value: { color: [0.5, 1, 0], weights: [0.5, 1] } }); connect(g, id);
  const shader = value(generate(g.snapshot())); assert.match(shader.pixel, /struct s_73757266616365/); assert.match(shader.pixel, /float f_77656967687473\[2\]/);
  value(g.change("rename type", d => d.putResource("surface", { ...(surface as object), name: "別名" } as Json)));
  assert.equal(value(generate(g.snapshot())).pixel, shader.pixel);
  const environment = new TypeEnvironment([{ id: "a", data: surface }, { id: "b", data: surface }]); assert.notEqual(environment.glsl("@a"), environment.glsl("@b"));
});
test("CQ03 malformed/cyclic types and invalid composite values cannot mutate the Graph", () => {
  const { g } = fixture(); const before = g.exportJSON(); const revision = g.revision;
  const result = g.change("bad matrix", d => d.createNode(g.stage("pixel").id, ref("matrix"))); assert.equal(result.ok, true);
  const id = value(result); const clean = g.exportJSON();
  assert.equal(g.change("bad input", d => d.setInput(id, "m", [1, 0])).ok, false); assert.equal(g.exportJSON(), clean);
  const env = new TypeEnvironment([{ id: "cycle", data: { kind: "dataType", type: { kind: "struct", fields: [{ key: "again", type: "@cycle" }] } } }]);
  assert.throws(() => env.resolve("@cycle"), /Recursive/); assert.equal(env.valid("mat2", [1, 0, 0, 1e100]), false);
  assert.equal(new TypeEnvironment().valid("uvec2", [-1, 1]), false); assert.equal(new TypeEnvironment().valid("float[2]", [0, ,]), false);
  assert.notEqual(g.exportJSON(), before); assert.equal(g.revision, revision + 1);
});
test("CQ04 constant demand accepts proven constant but rejects a uniform from the same typed port", () => {
  const { g } = fixture(); const literal = add(g, "literal", { type: "float", value: 0.25 }); const demand = add(g, "constant-demand"); connect(g, literal, demand, "value"); connect(g, demand);
  assert.equal(generate(g.snapshot()).ok, true);
  value(g.change("source", d => d.putResource("uniform", { kind: "source", sourceKind: "uniform", default: 0.25 })));
  const uniform = add(g, "uniform", "uniform"); value(g.change("replace", d => d.connect(g.nodeById(uniform)!.output("out"), g.nodeById(demand)!.input("value"), { replace: true })));
  const result = generate(g.snapshot()); assert.equal(result.ok, false); if (!result.ok) assert.equal(result.error.code, "CONSTANT_REQUIRED");
});
test("CQ05 helper identity conflicts fail; out parameters have per-node symbols and statements", () => {
  const helpers = new HelperRegistry(); const first = helpers.register("m", "h", "float $name(float x){return x;}");
  assert.equal(first, helpers.register("m", "h", "float $name(float x){return x;}")); assert.throws(() => helpers.register("m", "h", "float $name(float x){return x*2.0;}"), /different definitions/);
  const { g } = fixture(); const id = add(g, "helper-out"); connect(g, id); const shader = value(generate(g.snapshot())); assert.match(shader.pixel, /modf\(/); assert.match(shader.pixel, /float l_/); assert.match(shader.pixel, /float h_/);
});
test("CQ06 outputless effects remain live, while duplicate depth writers block generation", () => {
  const { g } = fixture(); connect(g, add(g, "matrix")); add(g, "depth"); add(g, "discard");
  const shader = value(generate(g.snapshot())); assert.match(shader.pixel, /gl_FragDepth = 0.5/); assert.match(shader.pixel, /if \(false\) discard/);
  add(g, "depth"); const result = generate(g.snapshot()); assert.equal(result.ok, false); if (!result.ok) assert.equal(result.error.code, "MULTIPLE_DEPTH_WRITERS");
});
test("CQ07 opaque texture resources alias uniforms and never generate local samplers", () => {
  const { g } = fixture(); value(g.change("texture", d => d.putResource("image", { kind: "source", sourceKind: "texture" })));
  const sampler = add(g, "sampler", "image"), sample = add(g, "sample"); connect(g, sampler, sample, "sampler"); connect(g, sample);
  const shader = value(generate(g.snapshot())); assert.match(shader.pixel, /uniform sampler2D u_/); assert.doesNotMatch(shader.pixel, /sampler2D n_/); assert.match(shader.pixel, /texture\(u_/);
});
test("CQ08 backend support differs from editable data types and graph profile", () => {
  const { g } = fixture("td.mat"); value(g.change("vertex", d => d.setStageImplementation("vertex", "network"))); add(g, "position", {}, "vertex"); connect(g, add(g, "varying"));
  assert.equal(generate(g.snapshot()).ok, false); const result = value(generate(g.snapshot(), MAT_PROFILE)); assert.match(result.vertex, /gl_Position/); assert.match(result.vertex, /out vec3 v_/); assert.match(result.pixel, /in vec3 v_/);
  const unsupported = fixture(); connect(unsupported.g, add(unsupported.g, "matrix")); add(unsupported.g, "literal", { type: "double", value: 0.5 });
  assert.equal(unsupported.g.diagnostics.length, 0); const failed = generate(unsupported.g.snapshot()); assert.equal(failed.ok, false); if (!failed.ok) assert.equal(failed.error.code, "BACKEND_TYPE");
});
test("CQ09 missing varying writer and missing resource remain saveable but cannot generate", () => {
  const { g } = fixture(); connect(g, add(g, "varying")); const failed = generate(g.snapshot()); assert.equal(failed.ok, false); if (!failed.ok) assert.equal(failed.error.code, "VARYING_UNBOUND");
  const id = add(g, "uniform", "missing"); assert.ok(g.diagnostics.some(d => d.code === "MISSING_REFERENCE")); assert.ok(g.exportJSON().includes(id));
});
test("CQ10 shared resource context is immutable, and a resource mutation uses the same Undo boundary", () => {
  const { g } = fixture(); value(g.change("source", d => d.putResource("r", { value: 1 })));
  const before = g.exportJSON(); let captured: Json | undefined;
  value(g.change("edit resource", d => { captured = d.readResource("r"); assert.throws(() => { (captured as any).value = 8; }, TypeError); d.putResource("r", { value: 2 }); }));
  assert.deepEqual(captured, { value: 1 }); value(g.history.undo()); assert.equal(g.exportJSON(), before);
});
test("CQ11 module-selected preserve policy retains invalid edges with diagnostics across reload and recovers them", () => {
  const { g, r } = fixture(); connect(g, add(g, "matrix")); const source = add(g, "literal", { type: "float", value: 0.5 }), target = add(g, "preserve", { mode: "float" }); connect(g, source, target, "value");
  value(g.change("type", d => d.setState(target, { mode: "int" })));
  const invalid = g.snapshot().document.stages[1].edges.find(e => e.to.nodeId === target)!;
  assert.equal(invalid.invalid?.code, "INTERFACE_CHANGED"); assert.ok(g.diagnostics.some(d => d.code === "INVALID_EDGE")); assert.equal(generate(g.snapshot()).ok, false);
  value(g.change("remove port", d => d.setState(target, { mode: "gone" })));
  const reloaded = value(Graph.load(g.exportJSON(), r)); assert.ok(reloaded.diagnostics.some(d => d.code === "INVALID_EDGE"));
  value(g.change("restore", d => d.setState(target, { mode: "float" })));
  assert.equal(g.snapshot().document.stages[1].edges.find(e => e.to.nodeId === target)!.invalid, undefined);
  assert.equal(g.snapshot().document.losses.filter(loss => loss.edge).length, 0);
});
test("CQ13 symbolic array extents resolve by resource identity and change atomically with values", () => {
  const { g, r } = fixture(); value(g.change("extent", d => d.putResource("count", { kind: "arrayExtent", length: 2 })));
  const a = add(g, "literal", { type: "float[#count]", value: [0.25, 0.5] }), b = add(g, "extent"); connect(g, a, b, "array"); connect(g, b);
  assert.match(value(generate(g.snapshot())).pixel, /float\[2\]/);
  value(g.change("resize source extent", d => { d.putResource("count", { kind: "arrayExtent", length: 3 }); d.setState(a, { type: "float[#count]", value: [0.25, 0.5, 0.75] }); d.setInput(a, "value", [0.25, 0.5, 0.75]); }));
  assert.match(value(generate(g.snapshot())).pixel, /float\[3\]/); assert.equal(value(Graph.load(g.exportJSON(), r)).snapshot().document.resources[0].id, "count");
  value(g.history.undo()); assert.match(value(generate(g.snapshot())).pixel, /float\[2\]/);
  assert.equal(new TypeEnvironment().resolve("sampler2D[4]").kind, "array"); assert.throws(() => new TypeEnvironment().requireES300("sampler2D[4]"), /indexing\/binding policy/);
});
test("CQ14 unused invalid resources block generation, resource kind conflicts reject registration atomically", () => {
  const { g } = fixture(); connect(g, add(g, "matrix"));
  value(g.change("unreferenced invalid type", d => d.putResource("bad", { kind: "dataType", type: { kind: "struct", fields: [] } })));
  assert.ok(g.diagnostics.some(d => d.code === "RESOURCE_TYPE" && d.subject.resourceId === "bad")); assert.equal(generate(g.snapshot()).ok, false);
  const r = registry(); const collision = r.register({ manifest: { ...module.manifest, id: "collision" }, types: [], resourceValidators: { source: () => [] } });
  assert.equal(collision.ok, false); if (!collision.ok) assert.equal(collision.error.code, "RESOURCE_KIND_CONFLICT");
  const missing = value(Graph.load(g.exportJSON(), new Registry())); assert.deepEqual(missing.snapshot().document.resources, g.snapshot().document.resources);
});
test("CQ15 inference propagates through a reverse-created Router chain in one publication", () => {
  const { g } = fixture(); const downstream = add(g, "infer-router"), upstream = add(g, "infer-router"); const source = add(g, "literal", { type: "vec4", value: [0.1, 0.2, 0.3, 1] });
  connect(g, upstream, downstream, "value"); connect(g, source, upstream, "value"); connect(g, downstream);
  assert.equal(g.nodeById(upstream)!.output("out").spec!.type, "vec4"); assert.equal(g.nodeById(downstream)!.output("out").spec!.type, "vec4");
  assert.equal(g.diagnostics.length, 0); assert.equal(generate(g.snapshot()).ok, true);
  const observed: string[] = []; g.subscribe(() => observed.push(g.nodeById(downstream)!.output("out").spec!.type));
  const scalar = add(g, "literal", { type: "float", value: 0.5 }); observed.length = 0;
  value(g.change("replace inferred source", d => d.connect(g.nodeById(scalar)!.output("out"), g.nodeById(upstream)!.input("value"), { replace: true })));
  assert.deepEqual(observed, ["float"]); assert.equal(generate(g.snapshot()).ok, true);
});
test("CQ16 resource-only modules pin exact identity and cannot borrow an installed replacement after reload", () => {
  const only: NodeModule = { manifest: { id: "resource-only", version: "1", fingerprint: "exact-one", coreApiVersion: 1, dependencies: [], source: "qualification", license: "test" }, types: [], resourceValidators: { palette: data => (data as any).valid === true ? [] : ["Invalid palette"] } };
  const r = registry(); value(r.register(only)); const g = new Graph({ name: "module pin", definitions: r.pin(), outputType: refs.output }); connect(g, add(g, "matrix"));
  value(g.change("resource", d => d.putResource("palette", { kind: "palette", valid: true })));
  assert.ok(g.snapshot().document.modules!.some(m => m.moduleId === "resource-only")); assert.equal(generate(g.snapshot()).ok, true);
  const different = registry(); value(different.register({ ...only, manifest: { ...only.manifest, fingerprint: "different" } }));
  const loaded = value(Graph.load(g.exportJSON(), different));
  assert.ok(loaded.diagnostics.some(d => d.code === "MISSING_MODULE")); assert.equal(generate(loaded.snapshot()).ok, false);
  assert.deepEqual(loaded.snapshot().document.modules, g.snapshot().document.modules); assert.deepEqual(loaded.snapshot().document.resources, g.snapshot().document.resources);
  assert.equal(generate(value(Graph.load(g.exportJSON(), r)).snapshot()).ok, true);
});
test("CQ17 requireValid rejects final-candidate errors without publishing or creating an Undo entry", () => {
  const { g } = fixture(); connect(g, add(g, "matrix")); const before = g.exportJSON(), undo = g.historyCounts.undo, revision = g.revision; let events = 0; g.subscribe(() => events++);
  const result = g.change("invalid paste", d => { d.requireValid(); d.putResource("bad", { kind: "unregistered" }); });
  assert.equal(result.ok, false); assert.equal(g.exportJSON(), before); assert.equal(g.historyCounts.undo, undo); assert.equal(g.revision, revision); assert.equal(events, 0);
});
test("CQ18 unresolved host extent preserves graph type identity and requires an explicit backend resolution", () => {
  const { g } = fixture(); value(g.change("symbolic", d => { d.putResource("count", { kind: "arrayExtent", symbol: "HOST_COUNT" }); d.putResource("buffer", { kind: "source", sourceKind: "uniform" }); }));
  const source = add(g, "uniform-array", "buffer"), consumer = add(g, "extent"); connect(g, source, consumer, "array"); connect(g, consumer);
  assert.equal(g.diagnostics.length, 0); const unsupported = generate(g.snapshot()); assert.equal(unsupported.ok, false); if (!unsupported.ok) assert.equal(unsupported.error.code, "BACKEND_EXTENT");
  const shader = value(generate(g.snapshot(), EXTENT_PROFILE)); assert.match(shader.pixel, /uniform float u_[a-f0-9]+\[2\]/);
  assert.equal((g.snapshot().document.resources.find(r => r.id === "count")!.data as any).symbol, "HOST_COUNT");
});
test("CQ19 port-selected numeric/exact policies preserve ordinary casts without enabling vector truncation", () => {
  assert.equal(adaptation(output("out", "int"), { ...input("in", "vec3"), connectionPolicy: "numeric" })?.op, "cast");
  assert.equal(adaptation(output("out", "bool"), { ...input("in", "bvec3"), connectionPolicy: "numeric" })?.op, "broadcast");
  assert.equal(adaptation(output("out", "vec4"), { ...input("in", "vec3"), connectionPolicy: "numeric" }), undefined);
  assert.equal(adaptation(output("out", "int"), { ...input("in", "float"), connectionPolicy: "exact" }), undefined);
  const families = [["float", "vec"], ["int", "ivec"], ["uint", "uvec"], ["double", "dvec"], ["bool", "bvec"]];
  const numericTypes = families.flatMap(([scalar, prefix]) => [1, 2, 3, 4].map(width => ({ type: width === 1 ? scalar : prefix + width, scalar, width })));
  let pairs = 0;
  for (const a of numericTypes) for (const b of numericTypes) {
    const plan = adaptation(output("out", a.type), { ...input("in", b.type), connectionPolicy: "numeric" });
    const sameFamilyClass = (a.scalar === "bool") === (b.scalar === "bool");
    const expected = a.type === b.type || sameFamilyClass && (a.width === b.width || a.width === 1) && (a.scalar !== "bool" || a.width === 1);
    assert.equal(!!plan, expected, `${a.type} -> ${b.type}`); pairs++;
    assert.equal(!!adaptation(output("out", a.type), { ...input("in", b.type), connectionPolicy: "exact" }), a.type === b.type);
  }
  assert.equal(pairs, 400);
  for (const [a, b] of [["mat2", "mat3"], ["mat2", "vec4"], ["float[2]", "vec2"], ["float", "float[2]"], ["@a", "@b"]]) assert.equal(adaptation(output("out", a), { ...input("in", b), connectionPolicy: "numeric" }), undefined);
  // AB-001 semantics remain available; numeric is an explicit receiving-port policy.
  assert.equal(adaptation(output("out", "int"), input("in", "float")), undefined);
  assert.equal(adaptation(output("out", "vec4"), input("in", "vec3"))?.op, "take");
  const r = registry(), g = new Graph({ name: "numeric graph", definitions: r.pin(), outputType: ref("numeric") });
  const id = add(g, "literal", { type: "ivec4", value: [1, 0, 1, 1] }); connect(g, id);
  assert.equal(g.diagnostics.length, 0); const shader = value(generate(g.snapshot())); assert.match(shader.pixel, /outColor = vec4\(n_/);
  assert.equal(value(Graph.load(g.exportJSON(), r)).stage("pixel").edges[0].adaptation.op, "cast");
  value(g.history.undo()); assert.equal(g.stage("pixel").edges.length, 0); value(g.history.redo()); assert.equal(value(generate(g.snapshot())).pixel, shader.pixel);
});
test("CQ20 different exact versions of one resource provider coexist without cross-Graph validator substitution", () => {
  const r = registry(), base = r.pin();
  const provider = (version: string): NodeModule => ({ manifest: { id: "palette-provider", version, fingerprint: "hash-" + version, coreApiVersion: 1, dependencies: [], source: "qualification", license: "test" }, types: [], resourceValidators: { palette: data => (data as any).version === version ? [] : ["Wrong provider schema " + version] } });
  value(r.register(provider("1"))); value(r.register(provider("2")));
  assert.throws(() => r.pin(), (error: any) => error.code === "RESOURCE_PROVIDER_AMBIGUOUS");
  const pinned = (version: string) => {
    return r.pin(base.refs, [...base.modules, { moduleId: "palette-provider", version, fingerprint: "hash-" + version }]);
  };
  const intruder = provider("3"); intruder.manifest.id = "other-palette-provider"; const conflict = r.register(intruder); assert.equal(conflict.ok, false); if (!conflict.ok) assert.equal(conflict.error.code, "RESOURCE_KIND_CONFLICT");
  const first = new Graph({ name: "v1", definitions: pinned("1"), outputType: refs.output }); connect(first, add(first, "matrix"));
  const second = new Graph({ name: "v2", definitions: pinned("2"), outputType: refs.output }); connect(second, add(second, "matrix"));
  value(first.change("v1 palette", d => d.putResource("palette", { kind: "palette", version: "1" })));
  value(second.change("v2 palette", d => d.putResource("palette", { kind: "palette", version: "2" })));
  assert.equal(first.diagnostics.length, 0); assert.equal(second.diagnostics.length, 0);
  assert.equal(value(Graph.load(first.exportJSON(), r)).diagnostics.length, 0);
  value(second.change("wrong version", d => d.putResource("palette", { kind: "palette", version: "1" })));
  assert.ok(second.diagnostics.some(d => d.code === "RESOURCE_VALIDATION")); assert.equal(first.diagnostics.length, 0);
});

test("CQ21 equal port types do not imply equal backend operation support; profile feature requirements gate static and dynamic lowering", () => {
  const { g } = fixture(); const id = add(g, "fine-derivative"); connect(g, id);
  assert.equal(g.diagnostics.length, 0);
  const rejected = generate(g.snapshot()); assert.equal(rejected.ok, false); if (!rejected.ok) assert.equal(rejected.error.code, "BACKEND_CAPABILITY");
  const profile = { ...ES300_PROFILE, id: "qualification.fine-derivatives-contract", capabilities: [...ES300_PROFILE.capabilities!, "glsl.derivatives.fine"] };
  assert.match(value(generate(g.snapshot(), profile)).pixel, /dFdxFine/);
  // Acceptance proves a backend capability contract, not native compiler support.
  const dynamic = fixture().g; connect(dynamic, add(dynamic, "dynamic-feature"));
  const unsupported = generate(dynamic.snapshot()); assert.equal(unsupported.ok, false); if (!unsupported.ok) assert.equal(unsupported.error.code, "BACKEND_CAPABILITY");
  assert.equal(generate(dynamic.snapshot(), { ...ES300_PROFILE, capabilities: ["qualification.dynamic-feature"] }).ok, true);
  value(g.change("disconnect derivative", d => d.disconnect(g.stage("pixel").edges[0].id)));
  const unused = generate(g.snapshot()); assert.equal(unused.ok, false); if (!unused.ok) assert.equal(unused.error.code, "BACKEND_CAPABILITY");
});

test("CQ22 generated physical lines and nested occurrence trails bind diagnostics to artifact plus delivery, including cached reapply", () => {
  const { g } = fixture(); const id = add(g, "traced"); connect(g, id);
  const original = value(generate(g.snapshot())); const map = original.diagnosticMap!;
  const span = map.spans.find(s => s.path.length === 3)!;
  assert.deepEqual(span.path, [id, "inner-call", "leaf"]); assert.equal(span.definitionId, "inner-definition"); assert.equal(span.endLine, span.startLine + 1);
  assert.match(original.pixel.split("\n")[span.startLine - 1], /vec4\($/);
  assert.doesNotMatch(original.pixel, /__grape_trace/);
  const target = { hostId: "host", targetId: "target", incarnation: "one", epoch: 1 };
  const spec = { target, requestId: "delivery1", shapeId: "schema1", loadId: g.loadId, deliveryRevision: g.revision, sources: [{ sourceId: "/native/pixel", stage: "pixel" as const, lineOffset: 5 }] };
  const receipt = { target, requestId: spec.requestId, shapeId: spec.shapeId, artifactKey: map.artifactKey, sourceId: "/native/pixel", line: span.startLine + 5, message: "synthetic compiler location" };
  assert.deepEqual(value(bindGeneratedDiagnostics(original, spec).resolve(receipt)).spans[0].path, span.path);
  assert.equal(bindGeneratedDiagnostics(original, spec).resolve({ ...receipt, target: { ...target, incarnation: "two" } }).ok, false);
  assert.equal(bindGeneratedDiagnostics(original, spec).resolve({ ...receipt, shapeId: "schema2" }).ok, false);
  value(g.change("rename", d => d.rename(id, "renamed")));
  const cached = bindGeneratedDiagnostics(original, { ...spec, requestId: "delivery2", deliveryRevision: g.revision });
  assert.equal(cached.resolve(receipt).ok, false);
  const mapped = value(cached.resolve({ ...receipt, requestId: "delivery2" }));
  assert.equal(mapped.artifactRevision, original.revision); assert.equal(mapped.deliveryRevision, g.revision); assert.deepEqual(mapped.spans[0].path, span.path);
  const newArtifact = value(generate(g.snapshot()));
  const newest = bindGeneratedDiagnostics(newArtifact, { ...spec, requestId: "delivery3", deliveryRevision: g.revision });
  assert.equal(newest.resolve({ ...receipt, requestId: "delivery3" }).ok, false);
  assert.equal(value(cached.resolve({ ...receipt, requestId: "delivery2", line: 1 })).spans.length, 0);
  const stripped = generate(g.snapshot(), { ...ES300_PROFILE, render: programs => { const code = ES300_PROFILE.render(programs); return { vertex: code.vertex.replace(/\/\*__grape_trace_[\s\S]*?\*\//g, ""), pixel: code.pixel.replace(/\/\*__grape_trace_[\s\S]*?\*\//g, "") }; } });
  assert.equal(stripped.ok, false); if (!stripped.ok) assert.equal(stripped.error.code, "SOURCE_MARKER");
});

test("CQ23 reconciliation rechecks same-type policy changes and scoped loss publication shares Graph Undo", () => {
  const { g } = fixture(); const source = add(g, "literal", { type: "int", value: 1 }), target = add(g, "policy-switch", { policy: "numeric" });
  connect(g, source, target, "value"); connect(g, target);
  const before = g.exportJSON(); const count = g.history.length;
  value(g.change("exact port", d => { d.setState(target, { policy: "exact" }); d.putResource("definition", { body: "opaque" }); d.recordLoss({ nodeId: "nested-node", resourceId: "definition", reason: "Nested input value removed", inputKey: "old", value: 1 }); }));
  assert.equal(g.stage("pixel").edges.some(e => e.to.nodeId === target), false);
  assert.equal(g.history.length, count + 1);
  assert.equal(g.snapshot().document.losses.length, 2);
  assert.ok(g.diagnostics.some(d => d.subject.resourceId === "definition" && d.subject.nodeId === "nested-node"));
  value(g.history.undo()); assert.equal(g.exportJSON(), before);
  value(g.history.redo()); assert.equal(g.snapshot().document.losses.length, 2);
});

test("CQ12 extended shaders compile, link and produce expected pixels in the available WebGL2 compiler", async t => {
  const packagePath = process.env.GRAPE_PLAYWRIGHT_PATH ?? join(process.env.USERPROFILE ?? "", ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs");
  if (!existsSync(packagePath)) { t.skip("WebGL compiler unavailable: CPU results are not GPU validation"); return; }
  const { chromium } = await import(pathToFileURL(packagePath).href);
  const browser = await chromium.launch({ channel: process.env.GRAPE_BROWSER_CHANNEL ?? "msedge", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  try {
    const page = await browser.newPage();
    const rendered: number[][] = await page.evaluate((shaders: { vertex: string; pixel: string }[]) => {
      const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1;
      const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: false })!;
      if (!gl) throw new Error("WebGL2 unavailable");
      return shaders.map(shader => {
        const program = gl.createProgram()!;
        for (const [kind, text] of [[gl.VERTEX_SHADER, shader.vertex], [gl.FRAGMENT_SHADER, shader.pixel]] as const) {
          const part = gl.createShader(kind)!; gl.shaderSource(part, text); gl.compileShader(part);
          if (!gl.getShaderParameter(part, gl.COMPILE_STATUS)) throw new Error(`${gl.getShaderInfoLog(part)}\n${text}`);
          gl.attachShader(program, part);
        }
        gl.linkProgram(program); if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program)!);
        gl.useProgram(program); const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.viewport(0, 0, 1, 1); gl.drawArrays(gl.TRIANGLES, 0, 3); const pixels = new Uint8Array(4); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        if (gl.getError() !== gl.NO_ERROR) throw new Error("WebGL operation failed");
        return Array.from(pixels);
      });
    }, qualificationShaders());
    const expected = [[128, 64, 0, 255], [128, 64, 0, 255], [64, 128, 0, 255], [64, 128, 191, 255], [128, 128, 128, 128], [255, 0, 255, 255]];
    rendered.forEach((p, i) => p.forEach((v, channel) => assert.ok(Math.abs(v - expected[i][channel]) <= 1, `probe ${i} channel ${channel}: ${v}`)));
    const directory = new URL("../../architecture-coverage/qualification/", import.meta.url); mkdirSync(directory, { recursive: true });
    writeFileSync(new URL("compute-gpu-evidence.json", directory), JSON.stringify({ observedAt: new Date().toISOString(), browser: browser.version(), backend: "WebGL2 ANGLE SwiftShader, not TD/native GPU", cases: ["matrix-array", "helper-out-parameter", "nominal-struct-array-field", "injected-MAT-profile-vertex-varying", "backend-bound-array-uniform", "numeric-ivec4-to-vec4"], rendered, expected }, null, 2));
  } finally { await browser.close(); }
});

// Exported only for the independent GPU probe; fixtures still build through the real Graph APIs.
export function qualificationShaders() {
  const samples = [];
  for (const name of ["matrix", "helper-out"]) { const { g } = fixture(); connect(g, add(g, name)); samples.push(value(generate(g.snapshot()))); }
  const { g } = fixture(); value(g.change("type", d => d.putResource("surface", surface))); connect(g, add(g, "structure", { value: { color: [0.5, 1, 0], weights: [0.5, 1] } })); samples.push(value(generate(g.snapshot())));
  const mat = fixture("td.mat").g; value(mat.change("vertex", d => d.setStageImplementation("vertex", "network"))); add(mat, "position", {}, "vertex"); connect(mat, add(mat, "varying")); samples.push(value(generate(mat.snapshot(), MAT_PROFILE)));
  const bound = fixture().g; value(bound.change("extent", d => { d.putResource("count", { kind: "arrayExtent", symbol: "HOST_COUNT" }); d.putResource("buffer", { kind: "source", sourceKind: "uniform" }); })); const array = add(bound, "uniform-array", "buffer"), length = add(bound, "extent"); connect(bound, array, length, "array"); connect(bound, length); samples.push(value(generate(bound.snapshot(), EXTENT_PROFILE)));
  const numeric = new Graph({ name: "numeric", definitions: registry().pin(), outputType: ref("numeric") }); connect(numeric, add(numeric, "literal", { type: "ivec4", value: [1, 0, 1, 1] })); samples.push(value(generate(numeric.snapshot())));
  return samples;
}
