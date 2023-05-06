// cria um elemento canvas e obtém seu contexto WebGL
const canvas = document.querySelector("#canvas");
const gl = canvas.getContext('webgl');

// cria os shaders GLSL para ray marching
const vertexShaderSource = `
    attribute vec4 position;
    void main() {
        gl_Position = position;
    }
`;

const fragmentShaderSource = `
    precision highp float;

    uniform vec2 resolution;
    uniform float time;

    // função para calcular a distância ao objeto
    float distanceFunc(vec3 p) {
        // aqui você deve escrever a equação do seu fractal
        // por exemplo, para um fractal de Mandelbulb:
        float m = dot(p, p);
        vec3 z = p;
        float dr = 1.0;
        float r = 0.0;
        for (int i = 0; i < 100; i++) {
            r = length(z);
            if (r > 100.0) break;
            // operações para atualizar z e dr
            dr += 0.08;
        }
        return 0.5 * log(r) * r / dr;
    }

    // função para calcular a cor do pixel com base na distância ao objeto
    vec3 colorFunc(float distance) {
        // aqui você deve escrever a função de coloração
        return vec3(distance);
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        uv = uv * 2.0 - 1.0;
        uv.x *= resolution.x / resolution.y;
        vec3 cameraPos = vec3(0.0, 0.0, -3.0);
        vec3 rayDir = normalize(vec3(uv, 1.0));
        vec3 p = cameraPos;
        float distance = 0.0;
        for (int i = 0; i < 100; i++) {
            distance = distanceFunc(p);
            p += distance * rayDir;
            if (distance < 0.0001 || length(p) > 100.0) break;
        }
        vec3 color = colorFunc(distance);
        gl_FragColor = vec4(color, 1.0);
    }
`;

// compila os shaders
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

// cria o programa e vincula os shaders
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

// define os atributos e uniformes que o shader utiliza
const positionAttributeLocation = gl.getAttribLocation(program, 'position');
const resolutionUniformLocation = gl.getUniformLocation(program, 'resolution');
const timeUniformLocation = gl.getUniformLocation(program, 'time');

// cria um buffer para os vértices
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

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
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
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
    requestAnimationFrame(render);
}
