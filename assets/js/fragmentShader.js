let fragmentShaderSource = `#version 300 es
precision highp float;
out vec4 outColor;
void main (){
    outColor = vec4(0, 0.2, 0.1, 1);
}
`;