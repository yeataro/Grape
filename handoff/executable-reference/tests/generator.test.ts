import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { builtinModule, refs } from "../nodes.ts";
import { generate } from "../generator.ts";
import { exercise } from "../scenario.ts";
import type {
  Adaptation,
  EdgeRecord,
  Json,
  NodeRecord,
  NodeType,
  Snapshot,
  TypeRef,
} from "../contracts.ts";

const refKey = (ref: TypeRef) => JSON.stringify(ref);
const definition = (ref: TypeRef) =>
  builtinModule.types.find((type) => type.ref.typeId === ref.typeId)!;
function node(
  id: string,
  ref: TypeRef,
  args: Json = null,
  custom?: NodeType,
): NodeRecord {
  const type = custom ?? definition(ref);
  const { state } = type.initialize(args);
  const ports = type.ports(state);
  return {
    id,
    name: id,
    typeRef: structuredClone(ref),
    state,
    ports,
    position: [0, 0],
    values: Object.fromEntries(
      ports
        .filter(
          (port) =>
            port.direction === "input" &&
            port.supply === "local" &&
            port.default !== undefined,
        )
        .map((port) => [port.key, structuredClone(port.default!)]),
    ),
    references: {},
    referencesComplete: true,
  };
}
function edge(
  id: string,
  from: string,
  to: string,
  input: string,
  plan: Adaptation,
  output = "out",
): EdgeRecord {
  return {
    id,
    from: { nodeId: from, key: output },
    to: { nodeId: to, key: input },
    adaptation: plan,
  };
}
const identity = (type: "float" | "vec4"): Adaptation => ({
  from: type,
  to: type,
  op: "identity",
});
function fixture(): Snapshot {
  const nodes = [
    node("output", refs.output),
    node("compose", refs.compose),
    node("multiply", refs.multiply),
    node("constant", refs.constant, { value: 0.4 }),
  ];
  return {
    revision: 7,
    loadId: "load-1",
    diagnostics: [],
    definitions: {
      resolve: (ref) =>
        builtinModule.types.find((type) => refKey(type.ref) === refKey(ref)),
    },
    document: {
      format: "grape-core-experiment",
      formatVersion: 1,
      id: "graph-1",
      name: "Example",
      kind: "td.top",
      outputType: refs.output,
      definitions: Object.values(refs),
      losses: [],
      resources: [],
      recovery: [],
      stages: [
        {
          id: "vertex",
          kind: "vertex",
          implementation: "default",
          nodes: [],
          edges: [],
        },
        {
          id: "pixel",
          kind: "pixel",
          implementation: "network",
          nodes,
          edges: [
            edge("e1", "constant", "multiply", "a", identity("float")),
            edge("e2", "multiply", "compose", "r", identity("float")),
            edge("e3", "multiply", "compose", "g", identity("float")),
            edge("e4", "compose", "output", "color", identity("vec4")),
          ],
        },
      ],
    },
  };
}
const pixel = (snapshot: Snapshot) => snapshot.document.stages[1];
function withCustom(snapshot: Snapshot, custom: NodeType): void {
  const original = snapshot.definitions;
  snapshot.document.definitions.push(custom.ref);
  snapshot.definitions = {
    resolve: (ref) =>
      refKey(ref) === refKey(custom.ref) ? custom : original.resolve(ref),
  };
}
function expectFailure(snapshot: Snapshot, code: string) {
  const result = generate(snapshot);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error.code, code, result.error.message);
}

test("built-in fixed and dynamic contracts expose typed ports and matching Parameters", () => {
  assert.equal(definition(refs.multiply).ports({}).length, 3);
  assert.deepEqual(
    definition(refs.compose)
      .ports({ mode: "pair" })
      .map((port) => [port.key, port.type]),
    [
      ["r", "float"],
      ["g", "float"],
      ["out", "vec2"],
    ],
  );
  assert.equal(
    definition(refs.compose).parameters({ mode: "color" }).length,
    5,
  );
  assert.equal(definition(refs.output).ports({})[0].supply, "required");
  assert.ok(
    definition(refs.constant).stateCodec.validate({ value: Infinity }).length,
  );
  assert.deepEqual(definition(refs.constant).initialize({}).state, {
    value: 0,
  });
  assert.deepEqual(definition(refs.compose).initialize({}).state, {
    mode: "color",
  });
});
test("minimal GLSL generation shares emitted node expressions and retains snapshot identity", () => {
  const snapshot = fixture();
  const before = JSON.stringify(snapshot.document);
  const result = generate(snapshot);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.match(result.value.vertex, /#version 300 es/);
  assert.match(result.value.vertex, /gl_Position = vec4\(position, 0.0, 1.0\)/);
  assert.match(result.value.pixel, /outColor = n_/);
  assert.match(result.value.pixel, /0\.4/);
  assert.equal(
    result.value.sourceMap.filter((item) => item.nodeId === "multiply").length,
    1,
  );
  assert.equal(result.value.sourceMap.length, 3);
  assert.equal(result.value.revision, 7);
  assert.equal(result.value.loadId, "load-1");
  assert.equal(JSON.stringify(snapshot.document), before);
});
test("rename and position changes do not alter code; Unicode IDs have stable distinct symbols", () => {
  const snapshot = fixture();
  const first = generate(snapshot);
  assert.ok(first.ok);
  pixel(snapshot).nodes.forEach((item) => {
    item.name = "名前 重複[]";
    item.position = [99, -10];
  });
  const second = generate(snapshot);
  assert.ok(second.ok);
  assert.equal(second.value.pixel, first.value.pixel);
  const source = pixel(snapshot).nodes.find((item) => item.id === "constant")!;
  source.id = "節點😀";
  pixel(snapshot).edges[0].from.nodeId = source.id;
  const unicode = generate(snapshot);
  assert.ok(unicode.ok);
  const item = unicode.value.sourceMap.find(
    (item) => item.nodeId === source.id,
  )!;
  assert.match(item.symbol, /^[A-Za-z_][A-Za-z0-9_]*$/);
});
test("uncached required input blocks generation", () => {
  const snapshot = fixture();
  pixel(snapshot).edges.pop();
  expectFailure(snapshot, "REQUIRED_INPUT");
});
test("unreachable invalid node blocks generation without cached diagnostics", () => {
  const snapshot = fixture();
  pixel(snapshot).nodes.push(node("bad", refs.constant));
  pixel(snapshot).nodes.at(-1)!.state = { value: "not numeric" };
  expectFailure(snapshot, "INVALID_NODE_STATE");
});
test("JavaScript finite numbers that overflow shader float32 are rejected", () => {
  const stateOverflow = fixture();
  pixel(stateOverflow).nodes.find((item) => item.id === "constant")!.state = {
    value: 1e100,
  };
  expectFailure(stateOverflow, "INVALID_NODE_STATE");
  const inputOverflow = fixture();
  pixel(inputOverflow).nodes.find((item) => item.id === "multiply")!.values.b =
    1e100;
  expectFailure(inputOverflow, "INVALID_INPUT_VALUE");
  assert.ok(
    definition(refs.constant).stateCodec.validate({ value: 1e100 }).length,
  );
});
test("sparse local vectors cannot bypass element validation", () => {
  const snapshot = fixture();
  const custom: NodeType = {
    ...definition(refs.constant),
    ref: { ...refs.constant, typeId: "vector-input" },
    ports: () => [
      {
        key: "value",
        direction: "input",
        type: "vec3",
        supply: "local",
        default: [0, 0, 0],
      },
      { key: "out", direction: "output", type: "float" },
    ],
  };
  withCustom(snapshot, custom);
  const added = node("sparse-vector", custom.ref, null, custom);
  added.values.value = new Array(3);
  pixel(snapshot).nodes.push(added);
  expectFailure(snapshot, "INVALID_INPUT_VALUE");
  added.values.value = [0, 0, 0];
  assert.ok(generate(snapshot).ok);
});
test("unreachable cycle blocks generation", () => {
  const snapshot = fixture();
  pixel(snapshot).nodes.push(
    node("a", refs.multiply),
    node("b", refs.multiply),
  );
  pixel(snapshot).edges.push(
    edge("loop1", "a", "b", "a", identity("float")),
    edge("loop2", "b", "a", "a", identity("float")),
  );
  expectFailure(snapshot, "CYCLE");
});
test("missing exact module fingerprint blocks even an unused pinned definition", () => {
  const snapshot = fixture();
  snapshot.document.definitions.push({
    ...refs.multiply,
    fingerprint: "different",
  });
  expectFailure(snapshot, "MISSING_DEFINITION");
});
test("dynamic state change cannot use stale cached ports or incompatible edge", () => {
  const snapshot = fixture();
  const compose = pixel(snapshot).nodes.find((item) => item.id === "compose")!;
  compose.state = { mode: "pair" };
  expectFailure(snapshot, "PORT_SCHEMA_MISMATCH");
  compose.ports = definition(refs.compose).ports(compose.state);
  compose.values = { r: 0, g: 0 };
  expectFailure(snapshot, "INVALID_CONNECTION");
});
test("dynamic pair is valid when consumed through explicit saved take adaptation", () => {
  const snapshot = fixture();
  const pair = node("pair", refs.compose, { mode: "pair" });
  pixel(snapshot).nodes.push(pair);
  pixel(snapshot).edges.push(
    edge("pair-to-blue", "pair", "compose", "b", {
      from: "vec2",
      to: "float",
      op: "take",
    }),
  );
  const result = generate(snapshot);
  assert.ok(result.ok);
  assert.match(result.value.pixel, /\)\.x/);
});
test("scalar broadcast generates an explicit constructor", () => {
  const snapshot = fixture();
  pixel(snapshot).edges = [
    edge("direct", "constant", "output", "color", {
      from: "float",
      to: "vec4",
      op: "broadcast",
    }),
  ];
  const result = generate(snapshot);
  assert.ok(result.ok);
  assert.match(result.value.pixel, /outColor = vec4\(n_/);
});
test("saved RGB to RGBA plan emits alpha one", () => {
  const snapshot = fixture();
  const rgb: NodeType = {
    ...definition(refs.constant),
    ref: { ...refs.constant, typeId: "rgb" },
    ports: () => [
      { key: "out", direction: "output", type: "vec3", semantic: "rgb" },
    ],
    emit: () => ({ outputs: { out: { type: "vec3", code: "vec3(0.2)" } } }),
  };
  withCustom(snapshot, rgb);
  pixel(snapshot).nodes.push(node("rgb", rgb.ref, null, rgb));
  pixel(snapshot).edges = [
    edge("alpha", "rgb", "output", "color", {
      from: "vec3",
      to: "vec4",
      op: "alpha",
    }),
  ];
  const result = generate(snapshot);
  assert.ok(result.ok);
  assert.match(result.value.pixel, /outColor = vec4\(n_.*?, 1\.0\)/);
});
test("cross-stage edge is rejected rather than silently traversed", () => {
  const snapshot = fixture();
  const source = pixel(snapshot).nodes.pop()!;
  snapshot.document.stages[0].nodes.push(source);
  expectFailure(snapshot, "INVALID_CONNECTION");
});
test("multiple incoming edges are rejected", () => {
  const snapshot = fixture();
  pixel(snapshot).edges.push({
    ...structuredClone(pixel(snapshot).edges[0]),
    id: "duplicate",
  });
  expectFailure(snapshot, "MULTIPLE_INPUT_EDGES");
});
test("cached errors remain blocking, while warnings do not", () => {
  const snapshot = fixture();
  snapshot.diagnostics.push({
    code: "TEST",
    severity: "warning",
    message: "Warning",
    subject: {},
  });
  assert.ok(generate(snapshot).ok);
  snapshot.diagnostics[0].severity = "error";
  expectFailure(snapshot, "GRAPH_ERRORS");
});
test("invalid emitter output type is a recoverable Result failure", () => {
  const snapshot = fixture();
  const broken: NodeType = {
    ...definition(refs.constant),
    emit: () => ({ outputs: { out: { type: "vec4", code: "vec4(1.0)" } } }),
  };
  snapshot.definitions = {
    resolve: (ref) =>
      refKey(ref) === refKey(refs.constant)
        ? broken
        : builtinModule.types.find((type) => refKey(type.ref) === refKey(ref)),
  };
  expectFailure(snapshot, "EMISSION_SCHEMA");
});
test("emitter exception is contained without modifying the source snapshot", () => {
  const snapshot = fixture();
  const broken: NodeType = {
    ...definition(refs.constant),
    emit: (state) => {
      (state as { value: number }).value = 99;
      throw new Error("should not mutate");
    },
  };
  snapshot.definitions = {
    resolve: (ref) =>
      refKey(ref) === refKey(refs.constant)
        ? broken
        : builtinModule.types.find((type) => refKey(type.ref) === refKey(ref)),
  };
  const before = JSON.stringify(snapshot.document);
  expectFailure(snapshot, "MODULE_CALLBACK_FAILED");
  assert.equal(JSON.stringify(snapshot.document), before);
});
test("unreachable emitter is pruned only after full structural validation", () => {
  const snapshot = fixture();
  const unused: NodeType = {
    ...definition(refs.constant),
    ref: { ...refs.constant, typeId: "unused" },
    emit: () => {
      throw new Error("must not run");
    },
  };
  withCustom(snapshot, unused);
  pixel(snapshot).nodes.push(node("unused", unused.ref, null, unused));
  assert.ok(generate(snapshot).ok);
});
test("vertex network implementation is explicitly unsupported, not falsely accepted", () => {
  const snapshot = fixture();
  snapshot.document.stages[0].implementation = "network";
  expectFailure(snapshot, "UNSUPPORTED_VERTEX_NETWORK");
});

test("generated shaders compile, link and render through WebGL2; invalid GLSL is rejected", async (t) => {
  const packagePath =
    process.env.GRAPE_PLAYWRIGHT_PATH ??
    join(
      process.env.USERPROFILE ?? "",
      ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs",
    );
  if (!existsSync(packagePath)) {
    t.skip(
      "No local Playwright runtime; CPU generation tests are not GPU compiler validation",
    );
    return;
  }
  const { chromium } = await import(pathToFileURL(packagePath).href);
  const browser = await chromium.launch({
    channel: process.env.GRAPE_BROWSER_CHANNEL ?? "msedge",
    headless: true,
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  try {
    const normal = fixture();
    const broadcast = fixture();
    const take = fixture();
    const alpha = fixture();
    pixel(broadcast).edges = [
      edge("direct", "constant", "output", "color", {
        from: "float",
        to: "vec4",
        op: "broadcast",
      }),
    ];
    pixel(take).nodes.push(node("pair", refs.compose, { mode: "pair" }));
    pixel(take).edges.push(
      edge("cut", "pair", "compose", "b", {
        from: "vec2",
        to: "float",
        op: "take",
      }),
    );
    const rgb: NodeType = {
      ...definition(refs.constant),
      ref: { ...refs.constant, typeId: "rgb" },
      ports: () => [
        { key: "out", direction: "output", type: "vec3", semantic: "rgb" },
      ],
      emit: () => ({ outputs: { out: { type: "vec3", code: "vec3(0.2)" } } }),
    };
    withCustom(alpha, rgb);
    pixel(alpha).nodes.push(node("rgb", rgb.ref, null, rgb));
    pixel(alpha).edges = [
      edge("alpha", "rgb", "output", "color", {
        from: "vec3",
        to: "vec4",
        op: "alpha",
      }),
    ];
    const shaders = [normal, broadcast, take, alpha].map((snapshot) => {
      const result = generate(snapshot);
      assert.ok(result.ok);
      return result.value;
    });
    const scenario = await exercise();
    shaders.push(scenario.shader);
    const page = await browser.newPage();
    const output = await page.evaluate(
      (shaders: { vertex: string; pixel: string }[]) => {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const gl = canvas.getContext("webgl2", {
          antialias: false,
          premultipliedAlpha: false,
        });
        if (!gl) throw new Error("WebGL2 unavailable");
        const compile = (kind: number, source: string) => {
          const shader = gl.createShader(kind)!;
          gl.shaderSource(shader, source);
          gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            throw new Error(
              gl.getShaderInfoLog(shader) ?? "Shader compile failed",
            );
          return shader;
        };
        const rendered = shaders.map((shader) => {
          const vertex = compile(gl.VERTEX_SHADER, shader.vertex);
          const pixel = compile(gl.FRAGMENT_SHADER, shader.pixel);
          const program = gl.createProgram()!;
          gl.attachShader(program, vertex);
          gl.attachShader(program, pixel);
          gl.linkProgram(program);
          if (!gl.getProgramParameter(program, gl.LINK_STATUS))
            throw new Error(gl.getProgramInfoLog(program) ?? "Link failed");
          gl.useProgram(program);
          const buffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 3, -1, -1, 3]),
            gl.STATIC_DRAW,
          );
          gl.enableVertexAttribArray(0);
          gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
          gl.viewport(0, 0, 1, 1);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          const values = new Uint8Array(4);
          gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, values);
          const error = gl.getError();
          if (error !== gl.NO_ERROR) throw new Error(`WebGL error ${error}`);
          gl.deleteBuffer(buffer);
          gl.deleteProgram(program);
          gl.deleteShader(vertex);
          gl.deleteShader(pixel);
          return Array.from(values);
        });
        const invalid = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(invalid, "#version 300 es\nthis is invalid GLSL");
        gl.compileShader(invalid);
        const invalidRejected = !gl.getShaderParameter(
          invalid,
          gl.COMPILE_STATUS,
        );
        gl.deleteShader(invalid);
        const overflow = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(
          overflow,
          "#version 300 es\nprecision highp float;\nlayout(location=0) out vec4 color;\nvoid main(){color=vec4(1e100);}\n",
        );
        gl.compileShader(overflow);
        const overflowProbe = {
          input: 1e100,
          compiled: Boolean(gl.getShaderParameter(overflow, gl.COMPILE_STATUS)),
          compilerLog: gl.getShaderInfoLog(overflow),
        };
        gl.deleteShader(overflow);
        return {
          rendered,
          invalidRejected,
          overflowProbe,
          version: gl.getParameter(gl.VERSION),
          renderer: gl.getParameter(gl.RENDERER),
        };
      },
      shaders,
    );
    const expected = [
      [102, 102, 0, 255],
      [102, 102, 102, 102],
      [102, 102, 0, 255],
      [51, 51, 51, 255],
      scenario.expectedPixel,
    ];
    output.rendered.forEach((color: number[], index: number) =>
      color.forEach((component, channel) =>
        assert.ok(
          Math.abs(component - expected[index][channel]) <= 1,
          `case ${index} channel ${channel}: ${component}`,
        ),
      ),
    );
    assert.equal(output.invalidRejected, true);
    const overflowErrors = definition(refs.constant).stateCodec.validate({
      value: 1e100,
    });
    assert.ok(overflowErrors.length);
    writeFileSync(
      new URL("../evidence/float-overflow.json", import.meta.url),
      JSON.stringify(
        {
          observedAt: new Date().toISOString(),
          browser: browser.version(),
          backend: "ANGLE SwiftShader via headless Edge; not native TD",
          ...output.overflowProbe,
          javascriptFinite: Number.isFinite(1e100),
          float32Finite: Number.isFinite(Math.fround(1e100)),
          currentNodeCodecRejected: true,
          currentNodeCodecErrors: overflowErrors,
          architectureChange:
            "Shader float scalar/vector values must remain finite after float32 conversion; JavaScript finite alone does not guarantee representability. Rounding/underflow are allowed; overflow is rejected before generation.",
          reproduction: "node --test tests/generator.test.ts",
        },
        null,
        2,
      ) + "\n",
      "utf8",
    );
    t.diagnostic(
      JSON.stringify({
        browser: browser.version(),
        ...output,
        backend: "ANGLE SwiftShader via headless Edge; not native TD",
      }),
    );
  } finally {
    await browser.close();
  }
});
