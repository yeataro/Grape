import type { Compilation } from "../../src/sdk/editing.ts";
/** Actual linked-program oracle, derived from the original review's transform-
 * feedback/readback method; also verifies a separately updated resource value. */
export function executeLinkedUniforms(
  out: Compilation,
  overrides: Record<string, number | number[]> = {},
) {
  if (out.status !== "success") throw Error(JSON.stringify(out.diagnostics));
  const canvas = document.createElement("canvas"),
    gl = canvas.getContext("webgl2", { antialias: false })!;
  if (!gl) throw Error("WEBGL2_UNAVAILABLE");
  const program = gl.createProgram()!,
    shaders = out.artifacts.map((a) => {
      const sh = gl.createShader(
        a.key === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER,
      )!;
      gl.shaderSource(sh, a.text);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
        throw Error(gl.getShaderInfoLog(sh) + "\n" + a.text);
      gl.attachShader(program, sh);
      return sh;
    });
  gl.transformFeedbackVaryings(
    program,
    ["gl_Position"],
    gl.INTERLEAVED_ATTRIBS,
  );
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw Error(gl.getProgramInfoLog(program)!);
  gl.useProgram(program);
  const active = Array.from(
    { length: gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) },
    (_, i) => {
      const uniform = gl.getActiveUniform(program, i)!;
      return { name: uniform.name, type: uniform.type, size: uniform.size };
    },
  );
  const schema = out.bindingSchema as {
    stageId: string;
    resourceId: string;
    symbol: string;
    type: string;
    defaultValue: number | number[];
  }[];
  for (const b of schema) {
    const loc = gl.getUniformLocation(program, b.symbol),
      value = overrides[b.resourceId] ?? b.defaultValue;
    if (b.type === "glsl.float") gl.uniform1f(loc, value as number);
    else if (b.type === "glsl.vec2") gl.uniform2fv(loc, value as number[]);
    else throw Error("ORACLE_TYPE_UNSUPPORTED");
  }
  const readback = schema.map((b) => {
    const value = gl.getUniform(
      program,
      gl.getUniformLocation(program, b.symbol)!,
    );
    return {
      ...b,
      actual: ArrayBuffer.isView(value)
        ? Array.from(value as Float32Array)
        : value,
    };
  });
  const tf = gl.createTransformFeedback(),
    buffer = gl.createBuffer();
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
  gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, buffer);
  gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, 16, gl.STREAM_READ);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer);
  gl.enable(gl.RASTERIZER_DISCARD);
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, 1);
  gl.endTransformFeedback();
  gl.disable(gl.RASTERIZER_DISCARD);
  const position = new Float32Array(4);
  gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER, 0, position);
  const debug = gl.getExtension("WEBGL_debug_renderer_info"),
    result = {
      linked: true,
      active,
      readback,
      position: Array.from(position),
      error: gl.getError(),
      version: gl.getParameter(gl.VERSION),
      renderer: gl.getParameter(gl.RENDERER),
      unmaskedRenderer: debug
        ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)
        : null,
      artifacts: out.artifacts,
    };
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
  gl.deleteBuffer(buffer);
  gl.deleteTransformFeedback(tf);
  shaders.forEach((s) => gl.deleteShader(s));
  gl.deleteProgram(program);
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return result;
}
