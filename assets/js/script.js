"use strict";

let audio = new Audio ('./assets/musica/audio2.mp3');
let audio2 = new Audio ('./assets/musica/audio.mp3');
let tocando = 0;
let frequencyData;
let estouradao = 1.0;
let timeForward = 0.0;


function playAudio(){
    if (tocando != 1){
      audio2.pause();
      audio2.currentTime = 0;
      audio.play();
      tocando = 1;
      timeForward = 0.0;
    } else {
      audio.pause();
      audio.currentTime = 0;
      tocando = 0;
      timeForward = 0.0;
    }
}

function playAudio2(){
  if (tocando != 2){
    audio.pause();
    audio.currentTime = 0;
    audio2.play();
    tocando = 2;
    timeForward = 0.0;
  } else {
    audio2.pause();
    audio2.currentTime = 0;
    tocando = 0;
    timeForward = 0.0;
  }
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const source = audioCtx.createMediaElementSource(audio);
const analyser = audioCtx.createAnalyser();
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 2048;
frequencyData = new Uint8Array(analyser.frequencyBinCount);


function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
}

// setup GLSL program
const program = webglUtils.createProgramFromSources(gl, [vs, fs]);

// look up where the vertex data needs to go.
const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

// look up uniform locations
const resolutionLocation = gl.getUniformLocation(program, "iResolution");
const mouseLocation = gl.getUniformLocation(program, "iMouse");
const timeLocation = gl.getUniformLocation(program, "iTime");
const corMarLocation = gl.getUniformLocation(program, "corMar");
const corCeuLocation = gl.getUniformLocation(program, "corCeu");
const alturaLocation = gl.getUniformLocation(program, "altura");
const frequenciaLocation = gl.getUniformLocation(program, "frequencia");

// Create a vertex array object (attribute state)
const vao = gl.createVertexArray();

// and make it the one we're currently working with
gl.bindVertexArray(vao);

// Create a buffer to put three 2d clip space points in
const positionBuffer = gl.createBuffer();

// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// fill it with a 2 triangles that cover clip space
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1, -1,  // first triangle
   1, -1,
  -1,  1,
  -1,  1,  // second triangle
   1, -1,
   1,  1,
]), gl.STATIC_DRAW);

// Turn on the attribute
gl.enableVertexAttribArray(positionAttributeLocation);

// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
gl.vertexAttribPointer(
    positionAttributeLocation,
    2,          // 2 components per iteration
    gl.FLOAT,   // the data is 32bit floats
    false,      // don't normalize the data
    0,          // 0 = move forward size * sizeof(type) each iteration to get the next position
    0,          // start at the beginning of the buffer
);

const playpauseElem = document.querySelector('.playpause');
const inputElem = document.querySelector('.divcanvas');
inputElem.addEventListener('mouseover', requestFrame);
//inputElem.addEventListener('mouseout', cancelFrame);

let mouseX = 0;
let mouseY = 0;

function setMousePosition(e) {
  const rect = inputElem.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = rect.height - (e.clientY - rect.top) - 1;  // bottom is 0 in WebGL
}

inputElem.addEventListener('mousemove', setMousePosition);
inputElem.addEventListener('touchstart', (e) => {
  e.preventDefault();
  playpauseElem.classList.add('playpausehide');
  requestFrame();
}, {passive: false});
inputElem.addEventListener('touchmove', (e) => {
  e.preventDefault();
  setMousePosition(e.touches[0]);
}, {passive: false});
inputElem.addEventListener('touchend', (e) => {
  e.preventDefault();
  playpauseElem.classList.remove('playpausehide');
  cancelFrame();
}, {passive: false});

let requestId;
function requestFrame() {
  if (!requestId) {
    requestId = requestAnimationFrame(render);
  }
}
function cancelFrame() {
  if (requestId) {
    cancelAnimationFrame(requestId);
    requestId = undefined;
  }
}

let then = 0;
let time = 0;

function render(now) {
  requestId = undefined;
  now *= 0.001;  // convert to seconds
  const elapsedTime = Math.min(now - then, 0.1);
  time += elapsedTime;
  then = now;

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  let corMarNor;
  let corCeuNor;
  let alturaNor;
  let freqNor;
  analyser.getByteFrequencyData(frequencyData);
  let frequency = frequencyData[100];

  if(tocando == 0){
      corMarNor = (mouseX/gl.canvas.width) * 2.5;
      corCeuNor = (mouseX/gl.canvas.width) + 0.1;
      alturaNor = (mouseY/gl.canvas.height) + 0.4;
      freqNor = ((mouseY/gl.canvas.height)/10) + 0.10;
      timeForward = 0.0;
  } else if (tocando == 1){
      corMarNor = 1-(frequency/200) * 2.5 * estouradao;
      corCeuNor = 1-(frequency/200) + 0.1 * estouradao;
      alturaNor = (frequency/200) + 0.4 * estouradao;
      freqNor = 0.16;
      //freqNor = ((frequency/200)/10) + 0.10 * estouradao;
      timeForward = 0.0;
  } else {
    if (timeForward < 2){
      timeForward += elapsedTime*0.05;
    }
    //Colocar os if's que trancam aqui
      corMarNor = 2.5-(timeForward);
      corCeuNor = 1.1-(timeForward/3);
      alturaNor = (timeForward/10) + 0.4;
      freqNor = (timeForward/10) + 0.10;
  }

  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform2f(mouseLocation, mouseX, mouseY);
  gl.uniform1f(timeLocation, time);
  gl.uniform1f(corMarLocation, corMarNor);
  gl.uniform1f(corCeuLocation, corCeuNor);
  gl.uniform1f(alturaLocation, alturaNor);
  gl.uniform1f(frequenciaLocation, freqNor);

  gl.drawArrays(
      gl.TRIANGLES,
      0,     // offset
      6,     // num vertices to process
  );

  requestFrame();
}

requestFrame();
requestAnimationFrame(cancelFrame);
}

main();