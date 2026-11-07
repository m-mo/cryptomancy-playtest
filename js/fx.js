window.HM = window.HM || {};
HM.FX = (function () {
let cv, cx, W = 0, H = 0, dpr = 1;
const parts = [], pillars = [], rings = [], flashes = [];
let shake = 0, shakeX = 0, shakeY = 0;
let PALETTE = ['#ffd166', '#06d6a0', '#4cc9f0', '#f72585', '#ff9e00', '#ffffff', '#b5179e', '#90f1ef'];
const I = () => HM.config.fxIntensity;
function init(el) {
cv = el; cx = cv.getContext('2d');
resize(); window.addEventListener('resize', resize);
}
function resize() {
dpr = Math.min(2, window.devicePixelRatio || 1);
W = window.innerWidth; H = window.innerHeight;
cv.width = W * dpr; cv.height = H * dpr;
cv.style.width = W + 'px'; cv.style.height = H + 'px';
}
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
function burst(x, y, n = 20, opts = {}) {
n = Math.round(n * I());
for (let i = 0; i < n; i++) {
const ang = opts.angle != null ? opts.angle + rnd(-opts.spread || -0.5, opts.spread || 0.5) : rnd(0, Math.PI * 2);
const sp = rnd(opts.minSpeed || 80, opts.speed || 420);
parts.push({
x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
life: 0, max: rnd(0.35, opts.life || 0.9), size: Math.round(rnd(opts.minSize || 3, opts.size || 7)),
color: opts.colors ? pick(opts.colors) : pick(PALETTE),
g: opts.gravity != null ? opts.gravity : 600, drag: opts.drag || 2.2, shape: opts.shape || 'sq',
add: opts.additive !== false,
});
}
}
function pillar(x, y, color) {
color = color || pick(PALETTE);
const h = (HM.config.pillarHeight || 100) * (0.85 + Math.random() * 0.3);
pillars.push({ x, y, h, w: rnd(8, 14), life: 0, max: 0.4, color });
burst(x, y, 8, { colors: [color, '#ffffff'], speed: 220, minSpeed: 60, gravity: 700, life: 0.45, size: 4 });
burst(x, y, 5, { colors: [color], angle: -Math.PI / 2, spread: 0.25, speed: 300, minSpeed: 160, gravity: 500, life: 0.4, size: 3 });
rings.push({ x, y, r: 3, max: 0.25, life: 0, color, w: 2 });
}
function sink(x, y) {
for (let i = 0; i < Math.round(12 * I()); i++) {
const a = rnd(0, Math.PI * 2), d = rnd(30, 70);
parts.push({
x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, vx: -Math.cos(a) * d * 3.2, vy: -Math.sin(a) * d * 3.2 + 60,
life: 0, max: 0.32, size: 4, color: pick(['#7a2e3a', '#4a1c2a', '#a33', '#552']), g: 200, drag: 1, shape: 'sq', add: false,
});
}
rings.push({ x, y, r: 46, max: 0.25, life: 0, color: '#9a3044', w: 3, shrink: true });
flash('rgba(120,20,40,0.10)', 0.15);
}
function ring(x, y, color = '#fff', w = 6, max = 0.5) { rings.push({ x, y, r: 6, max, life: 0, color, w }); }
function flash(color = 'rgba(255,255,255,0.35)', dur = 0.2) { flashes.push({ color, life: 0, max: dur }); }
function addShake(amt) { if (HM.config.screenShake) shake = Math.min(30, shake + amt * I()); }
function flames(rect, level = 1) {
const n = Math.round((2 + level * 3) * I());
for (let i = 0; i < n; i++) {
parts.push({
x: rnd(rect.left, rect.right), y: rect.bottom - rnd(0, rect.height * 0.3),
vx: rnd(-30, 30), vy: rnd(-120, -260) * (0.8 + level * 0.25),
life: 0, max: rnd(0.35, 0.7), size: Math.round(rnd(4, 9)),
color: pick(level >= 3 ? ['#fff3b0', '#ffd166', '#ff9e00', '#ff4d00', '#4cc9f0'] : ['#ffd166', '#ff9e00', '#ff4d00', '#d00000']),
g: -120, drag: 1.5, shape: 'flame', add: true,
});
}
}
function explode(x, y, scale = 1) {
burst(x, y, 90 * scale, { speed: 900 * scale, gravity: 500, life: 1.4, size: 10 });
burst(x, y, 40 * scale, { colors: ['#fff3b0', '#ffd166', '#ff9e00', '#ff4d00'], speed: 500, gravity: -100, life: 1.1, size: 12, shape: 'flame' });
ring(x, y, '#fff3b0', 10, 0.6); ring(x, y, '#ff9e00', 6, 0.9);
flash('rgba(255,220,150,0.45)', 0.35);
addShake(22);
}
function confetti(n = 120) {
for (let i = 0; i < n * I(); i++) {
parts.push({
x: rnd(0, W), y: rnd(-60, -10), vx: rnd(-60, 60), vy: rnd(80, 300),
life: 0, max: rnd(1.5, 2.8), size: Math.round(rnd(5, 10)), color: pick(PALETTE), g: 120, drag: 0.4, shape: 'conf', add: false, rot: rnd(0, 6),
});
}
}
function floatText(text, x, y, cls = '') {
const el = document.createElement('div');
el.className = 'float-text ' + cls;
el.textContent = text;
el.style.left = x + 'px'; el.style.top = y + 'px';
document.body.appendChild(el);
setTimeout(() => el.remove(), 1300);
}
function centerOf(el) {
const r = el.getBoundingClientRect();
return { x: r.left + r.width / 2, y: r.top + r.height / 2, r };
}
function update(dt) {
cx.setTransform(dpr, 0, 0, dpr, 0, 0);
cx.clearRect(0, 0, W, H);
for (let i = pillars.length - 1; i >= 0; i--) {
const p = pillars[i]; p.life += dt;
const k = p.life / p.max; if (k >= 1) { pillars.splice(i, 1); continue; }
const w = p.w * (1 + k * 0.8);
const a = (1 - k) * 0.55;
const top = p.y - p.h * (0.6 + 0.4 * Math.min(1, k * 4));
const g = cx.createLinearGradient(0, p.y, 0, top);
g.addColorStop(0, hexA(p.color, a)); g.addColorStop(0.5, hexA(p.color, a * 0.4)); g.addColorStop(1, hexA(p.color, 0));
cx.globalCompositeOperation = 'lighter';
cx.fillStyle = g;
cx.fillRect(Math.round(p.x - w / 2), Math.round(top), Math.round(w), Math.round(p.y - top));
cx.fillStyle = hexA('#ffffff', a * 0.6);
cx.fillRect(Math.round(p.x - w / 6), Math.round(top + (p.y - top) * 0.3), Math.max(1, Math.round(w / 3)), Math.round((p.y - top) * 0.7));
cx.globalCompositeOperation = 'source-over';
}
for (let i = rings.length - 1; i >= 0; i--) {
const r = rings[i]; r.life += dt;
const k = r.life / r.max; if (k >= 1) { rings.splice(i, 1); continue; }
const rad = r.shrink ? r.r * (1 - k) : r.r + k * 160;
cx.strokeStyle = hexA(r.color, 1 - k); cx.lineWidth = Math.max(1, r.w * (1 - k));
cx.beginPath(); cx.arc(r.x, r.y, rad, 0, Math.PI * 2); cx.stroke();
}
for (let i = parts.length - 1; i >= 0; i--) {
const p = parts[i]; p.life += dt;
if (p.life >= p.max) { parts.splice(i, 1); continue; }
p.vx *= Math.exp(-p.drag * dt); p.vy *= Math.exp(-p.drag * dt);
p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
const k = 1 - p.life / p.max;
cx.globalCompositeOperation = p.add ? 'lighter' : 'source-over';
cx.globalAlpha = p.shape === 'conf' ? Math.min(1, k * 3) : k;
cx.fillStyle = p.color;
const s = p.shape === 'flame' ? Math.max(1, Math.round(p.size * k)) : p.size;
if (p.shape === 'conf') {
p.rot += dt * 8;
const sw = Math.abs(Math.cos(p.rot)) * s;
cx.fillRect(Math.round(p.x - sw / 2), Math.round(p.y), Math.max(1, Math.round(sw)), Math.round(s * 0.6));
} else {
cx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s);
}
}
cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over';
for (let i = flashes.length - 1; i >= 0; i--) {
const f = flashes[i]; f.life += dt;
const k = f.life / f.max; if (k >= 1) { flashes.splice(i, 1); continue; }
cx.globalAlpha = 1 - k; cx.fillStyle = f.color; cx.fillRect(0, 0, W, H);
}
cx.globalAlpha = 1;
shake *= Math.exp(-8 * dt);
if (shake < 0.3) shake = 0;
shakeX = (Math.random() * 2 - 1) * shake; shakeY = (Math.random() * 2 - 1) * shake;
const app = document.getElementById('app');
if (app) app.style.transform = shake ? `translate(${shakeX.toFixed(1)}px,${shakeY.toFixed(1)}px)` : '';
}
function hexA(hex, a) {
if (hex.startsWith('rgba')) return hex;
const n = parseInt(hex.slice(1), 16);
return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
}
return { setPalette: p => { if (p && p.length) PALETTE = p; }, init, update, burst, pillar, sink, ring, flash, addShake, flames, explode, confetti, floatText, centerOf, PALETTE };
})();
