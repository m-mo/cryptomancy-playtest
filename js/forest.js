window.HM = window.HM || {};
HM.Forest = (function () {
const PX = 3;
let cv, ctx, W = 0, H = 0, time = 0;
let layers = null;
let pal = null, tier = 0, panic = 0, flare = 0;
let wisps = [], eyes = [], bats = [];
const DEFAULT_PAL = {
sky: ['#05070f', '#0b1424', '#152a3c', '#1f3a4a'], stars: '#cfe3ff',
moon: '#e8f0d8', blood: '#ff5a4a', moonShade: '#b9c7b0',
mountains: '#101c28', far: '#0d1822', mid: '#081018', near: '#030609', ground: '#04080b',
fog: [170, 205, 215], wisps: ['#9bffcf', '#4cc9f0', '#d9ff66'], eyes: ['#ff4d4d', '#ffd166', '#9bffcf'],
mushroom: '#7be08f',
};
let seed = 1;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const hex = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mix = (a, b, k) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`; };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; };
function pine(x, cx, base, h, col) {
const tiers = 3 + Math.floor(rnd() * 3);
const w = h * (0.42 + rnd() * 0.12);
x.fillStyle = col;
x.fillRect(Math.round(cx - Math.max(1, w * 0.05)), Math.round(base - h * 0.18), Math.max(2, Math.round(w * 0.1)), Math.round(h * 0.18) + 2);
for (let t = 0; t < tiers; t++) {
const tw = w * (1 - t / (tiers + 0.6)), th = h * 0.42, top = base - h * 0.15 - t * (h * 0.85 - th) / Math.max(1, tiers - 1) - th;
for (let r = 0; r < th; r++) {
const half = Math.round((r / th) * tw / 2);
x.fillRect(Math.round(cx - half), Math.round(top + r), half * 2 + 1, 1);
}
}
}
function dead(x, cx, base, h, col) {
x.fillStyle = col;
const branch = (x0, y0, ang, len, wid, depth) => {
const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
const steps = Math.ceil(len);
for (let i = 0; i <= steps; i++) {
const k = i / steps, ww = Math.max(1, Math.round(wid * (1 - k * 0.5)));
x.fillRect(Math.round(x0 + (x1 - x0) * k - ww / 2), Math.round(y0 + (y1 - y0) * k), ww, 1);
}
if (depth <= 0 || len < 3) return;
const n = 2 + (rnd() < 0.3 ? 1 : 0);
for (let i = 0; i < n; i++) branch(x1, y1, ang + (rnd() - 0.5) * 1.6, len * (0.55 + rnd() * 0.2), Math.max(1, wid * 0.6), depth - 1);
};
branch(cx, base, -Math.PI / 2 + (rnd() - 0.5) * 0.2, h * 0.45, Math.max(2, h * 0.07), 4);
}
function build() {
if (!W || !pal) return;
seed = 4242;
const LW = W + 160;
const [sky, sx] = mk(W, H);
const bands = pal.sky, bh = H * 0.75 / bands.length;
const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
for (let y = 0; y < H; y++) {
const fb = Math.min(bands.length - 1, y / bh), b0 = Math.floor(fb), f = fb - b0;
for (let xx = 0; xx < W; xx += 1) {
const use = f * 16 > bayer[(y % 4) * 4 + (xx % 4)] && b0 + 1 < bands.length ? bands[b0 + 1] : bands[b0];
sx.fillStyle = use; sx.fillRect(xx, y, 1, 1);
}
}
sx.fillStyle = pal.mountains;
let my = H * 0.52;
for (let xx = 0; xx < W; xx++) {
my += (rnd() - 0.5) * 2.2 + Math.sin(xx * 0.02) * 0.4;
my = Math.max(H * 0.42, Math.min(H * 0.62, my));
sx.fillRect(xx, Math.round(my), 1, H - Math.round(my));
}
const [far, fx] = mk(LW, H), [mid, mx] = mk(LW, H), [near, nx] = mk(W, H);
for (let i = 0; i < LW / 5; i++) { const x = rnd() * LW, h = H * (0.12 + rnd() * 0.12); pine(fx, x, H * 0.68 + rnd() * 6, h, pal.far); if (x < 30) pine(fx, x + LW, H * 0.68, h, pal.far); if (x > LW - 30) pine(fx, x - LW, H * 0.68, h, pal.far); }
fx.fillStyle = pal.far; fx.fillRect(0, Math.round(H * 0.68), LW, H);
for (let i = 0; i < LW / 16; i++) {
const x = rnd() * LW, h = H * (0.26 + rnd() * 0.22), base = H * 0.86 + rnd() * 6;
const f = rnd() < 0.3 ? dead : pine;
const s0 = seed;
f(mx, x, base, h, pal.mid);
if (x < 50) { seed = s0; f(mx, x + LW, base, h, pal.mid); }
if (x > LW - 50) { seed = s0; f(mx, x - LW, base, h, pal.mid); }
}
mx.fillStyle = pal.mid; mx.fillRect(0, Math.round(H * 0.86), LW, H);
for (let i = 0; i < LW / 60; i++) {
const x = Math.round(rnd() * LW), y = Math.round(H * 0.86), w = 4 + Math.round(rnd() * 3), h = 5 + Math.round(rnd() * 4);
mx.fillStyle = pal.mountains; mx.fillRect(x, y - h, w, h); mx.fillRect(x + 1, y - h - 1, w - 2, 1);
}
nx.fillStyle = pal.near;
const trunk = (cx, w) => {
nx.fillRect(Math.round(cx - w / 2), 0, Math.round(w), H);
for (let k = 0; k < 7; k++) {
const y = H * (0.08 + rnd() * 0.6), dir = cx < W / 2 ? 1 : -1, len = W * (0.05 + rnd() * 0.09);
dead(nx, cx + dir * w * 0.3, y + len * 0.2, len, pal.near);
for (let i = 0; i < len; i++) nx.fillRect(Math.round(cx + dir * i), Math.round(y + i * 0.25 + Math.sin(i * 0.3) * 1.5), 2, 2);
}
};
trunk(W * 0.02, Math.max(10, W * 0.05)); trunk(W * 0.1, Math.max(5, W * 0.022));
trunk(W * 0.985, Math.max(10, W * 0.05)); trunk(W * 0.9, Math.max(5, W * 0.022));
nx.fillRect(0, Math.round(H * 0.94), W, H);
for (let x = 0; x < W; x += 2 + Math.round(rnd() * 3)) nx.fillRect(x, Math.round(H * 0.94) - Math.round(rnd() * 3), 1, 3);
for (let i = 0; i < 8; i++) {
const x = Math.round(rnd() * W), y = Math.round(H * 0.94);
nx.fillStyle = '#1a2a22'; nx.fillRect(x, y - 3, 1, 3);
nx.fillStyle = pal.mushroom; nx.fillRect(x - 1, y - 4, 3, 1);
}
const stars = [];
for (let i = 0; i < W * H / 600; i++) stars.push([Math.round(rnd() * W), Math.round(rnd() * H * 0.45), rnd() * 6]);
layers = { sky, far, mid, near, LW, stars };
}
function moonColor() { return mix(pal.moon, pal.blood, Math.min(1, Math.max(0, tier) / 9)); }
function render(dt) {
if (!ctx || !layers) return;
time += dt; flare = Math.max(0, flare - dt * 1.5);
const L = layers;
ctx.drawImage(L.sky, 0, 0);
for (const [x, y, ph] of L.stars) { if (Math.sin(time * 2 + ph) > 0.2) { ctx.fillStyle = pal.stars; ctx.fillRect(x, y, 1, 1); } }
const mxp = Math.round(W * 0.72), myp = Math.round(H * 0.2), r = Math.max(8, Math.round(H * 0.075));
const mc = moonColor();
for (let g = 3; g >= 1; g--) { ctx.globalAlpha = (0.05 + flare * 0.08) * (4 - g); ctx.fillStyle = mc; disc(mxp, myp, r + g * r * 0.45); }
ctx.globalAlpha = 1; ctx.fillStyle = mc; disc(mxp, myp, r);
ctx.fillStyle = pal.moonShade; ctx.globalAlpha = 0.35; disc(mxp - r * 0.3, myp - r * 0.2, r * 0.22); disc(mxp + r * 0.35, myp + r * 0.3, r * 0.15); ctx.globalAlpha = 1;
if (Math.random() < dt * 0.08 && bats.length < 3) bats.push({ x: -10, y: H * (0.12 + Math.random() * 0.2), v: 25 + Math.random() * 20, ph: Math.random() * 6 });
ctx.fillStyle = '#000';
bats = bats.filter(b => { b.x += b.v * dt; const f = Math.sin(time * 16 + b.ph) > 0; const y = Math.round(b.y + Math.sin(time * 3 + b.ph) * 3), x = Math.round(b.x); ctx.fillRect(x, y, 3, 1); ctx.fillRect(x - 2, y - (f ? 1 : -1), 2, 1); ctx.fillRect(x + 3, y - (f ? 1 : -1), 2, 1); return b.x < W + 10; });
blitScroll(L.far, time * 2);
fog(0.55, 0.62, 6, 0.10 + panic * 0.12);
if (Math.random() < dt * 0.35 && eyes.length < 4) eyes.push({ x: W * (0.15 + Math.random() * 0.7), y: H * (0.7 + Math.random() * 0.12), life: 0, max: 2 + Math.random() * 3, col: pal.eyes[Math.floor(Math.random() * pal.eyes.length)], gap: 2 + Math.round(Math.random() * 2) });
eyes = eyes.filter(e => { e.life += dt; const k = e.life / e.max; const blink = Math.sin(e.life * 3) > 0.92; if (!blink) { ctx.globalAlpha = Math.min(1, Math.min(k, 1 - k) * 4); ctx.fillStyle = e.col; ctx.fillRect(Math.round(e.x), Math.round(e.y), 1, 1); ctx.fillRect(Math.round(e.x) + e.gap, Math.round(e.y), 1, 1); ctx.globalAlpha = 1; } return e.life < e.max; });
blitScroll(L.mid, time * 5);
fog(0.8, 0.9, 9, 0.13 + panic * 0.18);
while (wisps.length < Math.max(6, W / 40)) wisps.push({ x: Math.random() * W, y: H * (0.55 + Math.random() * 0.4), ph: Math.random() * 6, v: 3 + Math.random() * 5, col: pal.wisps[Math.floor(Math.random() * pal.wisps.length)] });
for (const w of wisps) {
w.x += Math.sin(time * 0.5 + w.ph) * w.v * dt; w.y += Math.cos(time * 0.7 + w.ph) * w.v * 0.6 * dt;
const a = 0.5 + Math.sin(time * 2 + w.ph) * 0.4;
ctx.globalAlpha = a * 0.25; ctx.fillStyle = w.col; ctx.fillRect(Math.round(w.x) - 1, Math.round(w.y) - 1, 3, 3);
ctx.globalAlpha = a; ctx.fillRect(Math.round(w.x), Math.round(w.y), 1, 1);
}
ctx.globalAlpha = 1;
ctx.drawImage(L.near, 0, 0);
if (panic > 0) {
const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.7);
g.addColorStop(0, 'rgba(120,0,0,0)'); g.addColorStop(1, `rgba(140,0,10,${(0.25 + Math.sin(time * 8) * 0.1) * panic})`);
ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
}
function disc(cx, cy, r) { for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(Math.max(0, r * r - y * y))); ctx.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1); } }
function blitScroll(c, off) {
const LW = layers.LW, o = Math.round(off % LW);
ctx.drawImage(c, -o, 0); ctx.drawImage(c, LW - o, 0);
}
function fog(y0, y1, thick, alpha) {
const [r, g, b] = pal.fog;
for (let band = 0; band < 3; band++) {
const y = H * (y0 + (y1 - y0) * band / 2), sp = (band + 1) * 4;
for (let x = 0; x < W; x += 4) {
const t = Math.sin((x + time * sp) * 0.02 + band) + Math.sin((x - time * sp * 0.6) * 0.045);
const h = Math.max(1, Math.round(thick * (0.6 + t * 0.35)));
ctx.fillStyle = `rgba(${r},${g},${b},${alpha * (0.6 + t * 0.2)})`;
ctx.fillRect(x, Math.round(y - h / 2), 4, h);
}
}
}
function init(el) {
cv = el; ctx = cv.getContext('2d');
if (!pal) pal = DEFAULT_PAL;
resize(); window.addEventListener('resize', resize);
}
function resize() {
if (!cv) return;
W = Math.max(1, Math.ceil(window.innerWidth / PX)); H = Math.max(1, Math.ceil(window.innerHeight / PX));
cv.width = W; cv.height = H; ctx.imageSmoothingEnabled = false;
build();
}
function setTheme(th) { pal = Object.assign({}, DEFAULT_PAL, (th && th.forest) || {}); build(); }
return {
init, render, setTheme,
setTier(t) { tier = Math.max(0, t); },
setPalettes() { },
pulse(a = 1) { flare = Math.min(1.5, flare + 0.4 * a); },
setPanic(p) { panic = p; },
setCalm() { },
};
})();
HM.BG = HM.Forest;
