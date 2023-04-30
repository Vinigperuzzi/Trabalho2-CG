// cria um elemento canvas e obtém seu contexto WebGL
const canvas = document.querySelector("#canvas");
const gl = canvas.getContext('webgl2');

// cria os shaders GLSL para ray marching
const vertexShaderSource = `#version 300 es
    in vec4 position;
    void main() {
        gl_Position = position;
    }
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

uniform float uTime;
uniform vec2 uResolution;

const float MAX_DIST = 100.0;
const float EPSILON = 0.001;

vec3 getRayDir(vec2 coord) {
  vec2 p = (coord / uResolution) * 2.0 - 1.0;
  p.x *= uResolution.x / uResolution.y;
  vec3 rayDir = normalize(vec3(p, -1.0));
  return rayDir;
}

float sphereSDF(vec3 p, float radius) {
  return length(p) - radius;
}

float boxSDF(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0);
}

float sceneSDF(vec3 p) {
  return min(
    sphereSDF(p, 1.0),
    boxSDF(p - vec3(0.5, 0.0, 0.0), vec3(0.5))
  );
}

float rayMarch(vec3 origin, vec3 dir) {
  float dist = 0.0;
  for (int i = 0; i < 100; i++) {
    vec3 p = origin + dir * dist;
    float d = sceneSDF(p);
    dist += d;
    if (d < EPSILON || dist > MAX_DIST) {
      break;
    }
  }
  return dist;
}

void main() {
  vec2 coord = gl_FragCoord.xy;
  vec3 rayDir = getRayDir(coord);
  float dist = rayMarch(vec3(0.0, 0.0, 5.0), rayDir);
  vec3 color = vec3(dist / MAX_DIST);
  gl_FragColor = vec4(color, 1.0);
}

`;

// compila os shaders
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error('Erro ao compilar o shader de vértices:', gl.getShaderInfoLog(vertexShader));
  }

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error('Erro ao compilar o shader de fragmento:', gl.getShaderInfoLog(fragmentShader));
  }
  

// cria o programa e vincula os shaders
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error('Erro ao linkar o programa:', gl.getProgramInfoLog(program));
}

// define os atributos e uniformes que o shader utiliza
const positionAttributeLocation = gl.getAttribLocation(program, 'position');
const resolutionUniformLocation = gl.getUniformLocation(program, 'resolution');
const timeUniformLocation = gl.getUniformLocation(program, 'time');

// cria um buffer para os vértices
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]), gl.STATIC_DRAW);

gl.vertexAttribPointer(
    positionAttributeLocation,
    2,          // 2 components per iteration
    gl.FLOAT,   // the data is 32bit floats
    false,      // don't normalize the data
    0,          // 0 = move forward size * sizeof(type) each iteration to get the next position
    0,          // start at the beginning of the buffer
);

render();

function render(){
    // define o tamanho da viewport
    gl.viewport(0, 0, canvas.width, canvas.height);

    // define a cor de fundo
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // usa o programa e define os valores dos uniformes e dos atributos
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
    gl.uniform1f(timeUniformLocation, performance.now() / 1000);

    // desenha o conteúdo do buffer na tela
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    console.log("Acontecendo");
    //requestAnimationFrame(render);
}
