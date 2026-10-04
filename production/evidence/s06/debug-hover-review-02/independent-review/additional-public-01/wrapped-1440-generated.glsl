// vertex
#version 300 es
layout(location=0) in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }

// pixel
#version 300 es
precision highp float;
out vec4 fragColor;

void main() {
  const vec4 n_1_p0 = vec4(0.25, 0.5, 0.75, 1.0);
  fragColor = n_1_p0;
}
