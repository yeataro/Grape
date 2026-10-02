import { test } from "node:test";
import assert from "node:assert/strict";
import { flow } from "../fixtures/setup.ts";
import { compile } from "../../src/generation/compiler.ts";
import { esProfile } from "../../src/modules/image.ts";
import { glslFloatLiteral } from "../../src/sdk/glsl.ts";
import { floatNode } from "../../src/modules/nodes.ts";

// GLSL ES floating-constant grammar, with the optional unary minus included.
const floatExpression =
  /^-?(?:(?:[0-9]+\.[0-9]*|\.[0-9]+)(?:[eE][+-]?[0-9]+)?|[0-9]+[eE][+-]?[0-9]+)$/;
for (const source of ["float", "multiply"] as const) {
  test(`M1 reviewer counterexample: ${source} 1e21 generates a valid GLSL floating constant`, () => {
    const s = flow();
    s.graph.change("Reviewer M1", (d) =>
      d.parameter(
        s.network,
        s[source],
        source === "float" ? "value" : "b",
        1e21,
      ),
    );
    const snapshot = s.graph.capture(),
      result = compile(snapshot, s.fixed, esProfile);
    assert.equal(result.status, "success");
    const pixel = result.artifacts.find((a) => a.key === "pixel")!.text;
    const literal =
      source === "float"
        ? /float n_1_p0 = ([^;]+);/.exec(pixel)![1]
        : /float n_2_p2 = \(n_1_p0 \* ([^)]+)\);/.exec(pixel)![1];
    assert.match(literal, floatExpression);
    assert.equal(Number(literal), 1e21);
    assert.deepEqual(
      s.graph.capture(),
      snapshot,
      "generation must not change admission/model values",
    );
  });
}

// This corpus includes JS decimal/exponent cutovers, both signs, float32 endpoints,
// subnormals, and finite JS values rounded to zero or max-finite by current admission.
const representatives = [
  0,
  -0,
  1,
  -2,
  0.25,
  -0.125,
  16777217,
  1e20,
  1e21,
  -1e21,
  1.25e21,
  1e-6,
  1e-7,
  -1.25e-7,
  Math.PI,
  -Math.PI,
  2 ** -149,
  -(2 ** -149),
  2 ** -126 - 2 ** -149,
  2 ** -126,
  (2 - 2 ** -23) * 2 ** 127,
  -((2 - 2 ** -23) * 2 ** 127),
  3.40282356e38,
  -3.40282356e38,
  Number.MIN_VALUE,
  -Number.MIN_VALUE,
];

test("M1 literal grammar and value roundtrip cover integers, decimals, signs and exponent-form values", () => {
  const examples: [number, string][] = [
    [0, "0.0"],
    [-0, "0.0"],
    [1, "1.0"],
    [-2, "-2.0"],
    [0.25, "0.25"],
    [-0.125, "-0.125"],
    [1e20, "100000000000000000000.0"],
    [1e21, "1.0e+21"],
    [-1e21, "-1.0e+21"],
    [1.25e21, "1.25e+21"],
    [1e-7, "1.0e-7"],
  ];
  for (const [value, expected] of examples)
    assert.equal(glslFloatLiteral(value), expected);
  for (const value of representatives) {
    const literal = glslFloatLiteral(value);
    assert.match(literal, floatExpression);
    assert.equal(Number(literal), value === 0 ? 0 : value);
  }
  for (const invalid of [NaN, Infinity, -Infinity, "1e21", null, [], {}])
    assert.throws(() => glslFloatLiteral(invalid), /GLSL_LITERAL/);
});

test("M1 all finite float32 exponent bins and representative mantissas have legal value-preserving literals", () => {
  const bits = new DataView(new ArrayBuffer(4));
  let count = 0;
  for (const sign of [0, 1])
    for (let exponent = 0; exponent < 255; exponent++) {
      for (const mantissa of [0, 1, 0x123456, 0x7fffff]) {
        bits.setUint32(0, sign * 0x80000000 + exponent * 0x800000 + mantissa);
        const value = bits.getFloat32(0),
          literal = glslFloatLiteral(value);
        assert(Number.isFinite(value));
        assert.match(
          literal,
          floatExpression,
          `bits=${bits.getUint32(0).toString(16)}`,
        );
        assert.equal(Number(literal), value === 0 ? 0 : value);
        count++;
      }
    }
  assert.equal(count, 2040);
});

test("M1 admitted boundary/representative values remain editable and compile through both production literal paths", () => {
  const s = flow();
  for (const value of representatives) {
    assert.equal(floatNode.stateCodec.validate({ value }).length, 0);
    assert(s.fixed.types.validValue("glsl.float", value));
    s.graph.change("Numeric regression", (d) => {
      d.parameter(s.network, s.float, "value", value);
      d.parameter(s.network, s.multiply, "b", value);
      d.parameter(s.network, s.compose, "y", value);
    });
    const before = s.graph.capture(),
      result = compile(before, s.fixed, esProfile);
    assert.equal(result.status, "success", String(value));
    const pixel = result.artifacts.find((a) => a.key === "pixel")!.text;
    const emitted = [
      /float n_1_p0 = ([^;]+);/.exec(pixel)![1],
      /float n_2_p2 = \(n_1_p0 \* ([^)]+)\);/.exec(pixel)![1],
      /vec4\(n_2_p2, ([^,]+),/.exec(pixel)![1],
    ];
    for (const literal of emitted) {
      assert.match(literal, floatExpression);
      assert.equal(Number(literal), value === 0 ? 0 : value);
    }
    assert.deepEqual(s.graph.capture(), before);
  }
  for (const rejected of [
    NaN,
    Infinity,
    -Infinity,
    Number.MAX_VALUE,
    3.40282357e38,
  ]) {
    assert(
      floatNode.stateCodec
        .validate({ value: rejected })
        .some((d) => d.severity === "error"),
    );
    assert.equal(s.fixed.types.validValue("glsl.float", rejected), false);
    for (const [node, key] of [
      [s.float, "value"],
      [s.multiply, "b"],
    ]) {
      const before = s.graph.capture();
      assert.throws(() =>
        s.graph.change("Rejected number", (d) =>
          d.parameter(s.network, node, key, rejected),
        ),
      );
      assert.deepEqual(s.graph.capture(), before);
    }
  }
});
