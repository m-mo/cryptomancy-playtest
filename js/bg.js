window.HM = window.HM || {};
HM.Swirl = (function () {
const SCALE = 4;
let PALETTES = [
[[0.10, 0.27, 0.36], [0.05, 0.13, 0.20], [0.20, 0.55, 0.62]],
[[0.10, 0.36, 0.25], [0.04, 0.16, 0.12], [0.30, 0.70, 0.45]],
[[0.18, 0.22, 0.48], [0.07, 0.08, 0.22], [0.35, 0.45, 0.90]],
[[0.45, 0.25, 0.08], [0.20, 0.09, 0.04], [0.95, 0.60, 0.20]],
[[0.38, 0.12, 0.40], [0.14, 0.04, 0.17], [0.80, 0.35, 0.80]],
[[0.50, 0.12, 0.14], [0.20, 0.04, 0.06], [0.98, 0.37, 0.33]],
[[0.10, 0.36, 0.40], [0.03, 0.12, 0.15], [0.98, 0.70, 0.27]],
[[0.25, 0.25, 0.28], [0.06, 0.06, 0.08], [0.70, 0.70, 0.78]],
[[0.42, 0.06, 0.24], [0.12, 0.02, 0.10], [0.20, 0.85, 0.95]],
[[0.05, 0.05, 0.05], [0.18, 0.02, 0.02], [0.95, 0.20, 0.10]],
[[0.30, 0.00, 0.40], [0.00, 0.00, 0.00], [1.00, 0.85, 0.20]],
];
let canvas, gl, prog, uRes, uT, uC1, uC2, uC3, uSpin, uWarp;
let cur = PALETTES[0].map(c => c.slice()), target = PALETTES[0];
let spin = 0.15, spinTarget = 0.15, warp = 1, warpTarget = 1;
let ok = false, time = 0;
const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FS = `precision mediump float;
uniform vec2 res;uniform float t;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;uniform float spin;uniform float warp;
void main(){
  vec2 uv=(gl_FragCoord.xy-0.5*res)/length(res);
  float r=length(uv);
  float a=atan(uv.y,uv.x)+t*spin+ (1.2*spin+0.2)/(r+0.35);
  vec2 p=vec2(cos(a),sin(a))*r*7.0;
  for(int i=0;i<5;i++){
    p+=vec2(sin(p.y*1.27+t*0.31),cos(p.x*1.13-t*0.23))*0.55*warp;
  }
  float v=sin(p.x+p.y)*0.5+0.5;
  float v2=sin(length(p)*0.9-t*0.4)*0.5+0.5;
  vec3 col=mix(c2,c1,smoothstep(0.15,0.85,v));
  col=mix(col,c3,smoothstep(0.62,0.98,v2)*0.55);
  col*=1.0-smoothstep(0.35,0.85,r)*0.55;
  col=floor(col*12.0+0.5)/12.0;
  gl_FragColor=vec4(col,1.0);
}`;
function init(el) {
canvas = el;
try {
gl = canvas.getContext('webgl', { antialias: false, preserveDrawingBuffer: false });
if (!gl) throw new Error('no webgl');
const sh = (type, src) => {
const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
return s;
};
prog = gl.createProgram();
gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
gl.linkProgram(prog);
gl.useProgram(prog);
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(prog, 'p');
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
uRes = gl.getUniformLocation(prog, 'res'); uT = gl.getUniformLocation(prog, 't');
uC1 = gl.getUniformLocation(prog, 'c1'); uC2 = gl.getUniformLocation(prog, 'c2'); uC3 = gl.getUniformLocation(prog, 'c3');
uSpin = gl.getUniformLocation(prog, 'spin'); uWarp = gl.getUniformLocation(prog, 'warp');
ok = true;
} catch (e) {
ok = false;
canvas.style.background = 'radial-gradient(circle at 50% 40%, #1d4a58, #0b1a22 70%)';
}
resize();
window.addEventListener('resize', resize);
}
function resize() {
if (!canvas) return;
canvas.width = Math.max(1, Math.ceil(window.innerWidth / SCALE));
canvas.height = Math.max(1, Math.ceil(window.innerHeight / SCALE));
if (ok) gl.viewport(0, 0, canvas.width, canvas.height);
}
let curTier = 0;
function setTier(tier) { curTier = tier; target = PALETTES[Math.max(0, Math.min(PALETTES.length - 1, tier))]; }
function setPalettes(list) { if (list && list.length) { PALETTES = list; setTier(curTier); } }
function pulse(amount = 1) { spin += 0.6 * amount; warp += 0.6 * amount; }
function setCalm(calm) { spinTarget = calm ? 0.08 : 0.15; }
function setPanic(p) { spinTarget = 0.15 + p * 0.5; warpTarget = 1 + p * 0.8; }
function render(dt) {
if (!ok) return;
time += dt;
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cur[i][j] += (target[i][j] - cur[i][j]) * Math.min(1, dt * 1.5);
spin += (spinTarget - spin) * Math.min(1, dt * 1.2);
warp += (warpTarget - warp) * Math.min(1, dt * 1.2);
gl.uniform2f(uRes, canvas.width, canvas.height);
gl.uniform1f(uT, time);
gl.uniform3fv(uC1, cur[0]); gl.uniform3fv(uC2, cur[1]); gl.uniform3fv(uC3, cur[2]);
gl.uniform1f(uSpin, spin); gl.uniform1f(uWarp, warp);
gl.drawArrays(gl.TRIANGLES, 0, 3);
}
return { init, render, setTier, setPalettes, setTheme: th => setPalettes(th && th.bg), pulse, setCalm, setPanic };
})();
