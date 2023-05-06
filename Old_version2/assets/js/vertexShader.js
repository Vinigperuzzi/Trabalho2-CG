let vertexShaderSource = `#version 300 es
in vec2 a_position;
in vec2 resolution;
out vec2 uv;
void main (){
    gl_Position = vec4(a_position, 0.0, 1.0);
}    
`;

// let vertexShaderSource = 
// `#version 300 es
// uniform vec2 resolution;
// uniform vec2 a_position;
// in vec3 vertexPosition;
// out vec2 uv;

// void main() {
//     uv = a_position;
//     uv.x += resolution.x / resolution.y;

//     gl_Position = vec4(vertexPosition, 1.0);
// }
// `;