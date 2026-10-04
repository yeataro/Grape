import type { Compilation } from "../../src/sdk/editing.ts";
export function executeGL(
  out: Compilation,
  bindings: Record<string, number | number[]> = {},
  depthProbe?: number,
) {
  if (out.status !== "success") throw Error(JSON.stringify(out.diagnostics));
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const gl = canvas.getContext("webgl2", {
    premultipliedAlpha: false,
    antialias: false,
    preserveDrawingBuffer: true,
  })!;
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
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw Error(gl.getProgramInfoLog(program)!);
  gl.useProgram(program);
  for (const binding of out.bindingSchema as any[]) {
    const loc = gl.getUniformLocation(program, binding.symbol),
      value = bindings[binding.resourceId] ?? binding.defaultValue;
    if (binding.type === "glsl.float") gl.uniform1f(loc, value as number);
    else if (binding.type === "glsl.int") gl.uniform1i(loc, value as number);
    else if (binding.type === "glsl.uint") gl.uniform1ui(loc, value as number);
    else if (binding.type === "glsl.vec4")
      gl.uniform4fv(loc, value as number[]);
    else throw Error("TEST_UNIFORM_TYPE");
  }
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
  gl.clearColor(0, 0, 0, 0);
  if (depthProbe !== undefined) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
  }
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  if (depthProbe !== undefined) {
    const probe = gl.createProgram()!,
      sources = [
        `#version 300 es\nlayout(location=0) in vec2 position;void main(){gl_Position=vec4(position,${(depthProbe * 2 - 1).toFixed(4)},1.0);}`,
        `#version 300 es\nprecision highp float;out vec4 color;void main(){color=vec4(1.0,0.0,0.0,1.0);}`,
      ];
    const probeShaders = sources.map((source, index) => {
      const shader = gl.createShader(
        index === 0 ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER,
      )!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw Error(gl.getShaderInfoLog(shader)!);
      gl.attachShader(probe, shader);
      return shader;
    });
    gl.linkProgram(probe);
    if (!gl.getProgramParameter(probe, gl.LINK_STATUS))
      throw Error(gl.getProgramInfoLog(probe)!);
    gl.useProgram(probe);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    probeShaders.forEach((shader) => gl.deleteShader(shader));
    gl.deleteProgram(probe);
  }
  const pixels = new Uint8Array(4);
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  const error = gl.getError();
  if (error !== gl.NO_ERROR) throw Error("WEBGL_ERROR:" + error);
  const result = {
    pixels: [...pixels],
    version: gl.getParameter(gl.VERSION),
    renderer: gl.getParameter(gl.RENDERER),
    artifacts: out.artifacts,
    bindings: out.bindingSchema,
    depthProbe: depthProbe ?? null,
    depthBits: gl.getParameter(gl.DEPTH_BITS),
  };
  shaders.forEach((s) => gl.deleteShader(s));
  gl.deleteProgram(program);
  gl.deleteBuffer(buffer);
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return result;
}
