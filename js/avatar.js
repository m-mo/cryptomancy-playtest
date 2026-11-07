window.HM = window.HM || {};
HM.Avatar = (function () {
const C = {
K: '#120a14', o: '#1a1020', W: '#ffffff', w: '#e8e0d0', g: '#8a8a9a', G: '#4a4a5a',
y: '#f5b244', Y: '#ffe08a', d: '#a8691a', r: '#e63946', R: '#8d1b2b', p: '#ff8fab', P: '#f72585',
b: '#3a86ff', B: '#1d3a8a', c: '#4cc9f0', n: '#2ec27e', N: '#1b6b45', v: '#8b5cf6', V: '#4c1d95',
f: '#ff9e00', F: '#c2410c', m: '#8b5a2b', M: '#4a2c14', t: '#d4a373', s: '#c9c9d6',
};
const SKINS = {
bone: { o: '#2a1d2e', b: '#efe6d2', h: '#ffffff', s: '#c2b296', k: '#1a0f1f', t: '#fffaf0', g: '#4a3a40' },
gold: { o: '#3a2405', b: '#f5b244', h: '#ffe9a8', s: '#c07a1e', k: '#2a1500', t: '#fff0b8', g: '#6a4010' },
crystal: { o: '#10224a', b: '#9fdcff', h: '#ffffff', s: '#4f8fd8', k: '#0a1630', t: '#e6f7ff', g: '#2a4a80', alpha: 0.85 },
obsidian: { o: '#000000', b: '#2b2236', h: '#5b4a78', s: '#16101e', k: '#c13cff', t: '#3d3150', g: '#000000' },
ruby: { o: '#3a0610', b: '#e63946', h: '#ffb3ba', s: '#8d1b2b', k: '#1a0005', t: '#ffd6da', g: '#5a0a16' },
jade: { o: '#06301c', b: '#2ec27e', h: '#b8f5d4', s: '#1b6b45', k: '#021a0e', t: '#d8ffe9', g: '#0b3d24' },
ghost: { o: '#3a4a6a', b: '#dfe8ff', h: '#ffffff', s: '#9fb0d8', k: '#2a3550', t: '#ffffff', g: '#6a7aa0', alpha: 0.55 },
chrome: { o: '#1a1a22', b: '#c9ccd6', h: '#ffffff', s: '#6d7280', k: '#0d0d12', t: '#f0f2f8', g: '#3a3d48' },
};
const FONT = {
A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010',
P: '110101110100100', Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010',
Z: '111001010100111', 0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111',
9: '111101111001110', '!': '010010010000010', '?': '110001010000010', '$': '011110010011110', '+': '000010111010000',
'-': '000000111000000', '.': '000000000000010', ':': '000010000010000', ' ': '000000000000000', '♥': '000101111111010',
};
function ptext(ctx, str, x, y, color, shadow) {
str = String(str).toUpperCase();
let cx = Math.round(x);
for (const ch of str) {
const g = FONT[ch] || FONT['?'];
for (let i = 0; i < 15; i++) if (g[i] === '1') {
const px = cx + (i % 3), py = Math.round(y) + Math.floor(i / 3);
if (shadow) { ctx.fillStyle = shadow; ctx.fillRect(px + 1, py + 1, 1, 1); }
ctx.fillStyle = color; ctx.fillRect(px, py, 1, 1);
}
cx += 4;
}
}
const sprCache = new Map();
function prep(rows) {
let s = sprCache.get(rows);
if (s) return s;
const h = rows.length, w = Math.max(...rows.map(r => r.length));
const px = [], filled = new Set();
rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] !== '.') { px.push([x, y, r[x]]); filled.add(x + ',' + y); } });
const ol = [], seen = new Set();
for (const [x, y] of px) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
const k = (x + dx) + ',' + (y + dy);
if (!filled.has(k) && !seen.has(k)) { seen.add(k); ol.push([x + dx, y + dy]); }
}
s = { w, h, px, ol };
sprCache.set(rows, s);
return s;
}
function spr(ctx, rows, x, y, outline = C.o, pal = C, flipX = false) {
const s = prep(rows);
x = Math.round(x); y = Math.round(y);
if (outline) { ctx.fillStyle = outline; for (const [ox, oy] of s.ol) ctx.fillRect(x + (flipX ? s.w - 1 - ox : ox), y + oy, 1, 1); }
for (const [px, py, ch] of s.px) { ctx.fillStyle = pal[ch] || ch; ctx.fillRect(x + (flipX ? s.w - 1 - px : px), y + py, 1, 1); }
return s;
}
function sprCB(ctx, rows, cx, by, outline = C.o, pal = C, flipX = false) {
const s = prep(rows);
spr(ctx, rows, Math.round(cx - s.w / 2), by - s.h + 1, outline, pal, flipX);
return s;
}
const px = (ctx, x, y, col, w = 1, h = 1) => { ctx.fillStyle = col; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
function pline(ctx, x0, y0, x1, y1, col, w = 1) {
x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
let err = dx + dy; ctx.fillStyle = col;
for (let i = 0; i < 400; i++) {
ctx.fillRect(x0 - Math.floor(w / 2), y0 - Math.floor(w / 2), w, w);
if (x0 === x1 && y0 === y1) break;
const e2 = 2 * err;
if (e2 >= dy) { err += dy; x0 += sx; }
if (e2 <= dx) { err += dx; y0 += sy; }
}
}
function disc(ctx, cx, cy, r, col) {
ctx.fillStyle = col;
for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) ctx.fillRect(Math.round(cx + x), Math.round(cy + y), 1, 1);
}
function circ(ctx, cx, cy, r, col) {
ctx.fillStyle = col;
const n = Math.max(8, Math.round(r * 7));
for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; ctx.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1); }
}
const tintCache = document.createElement('canvas');
function outlineBlit(ctx, src, x, y, col) {
tintCache.width = src.width; tintCache.height = src.height;
const tc = tintCache.getContext('2d');
tc.clearRect(0, 0, src.width, src.height);
tc.drawImage(src, 0, 0);
tc.globalCompositeOperation = 'source-in'; tc.fillStyle = col; tc.fillRect(0, 0, src.width, src.height);
tc.globalCompositeOperation = 'source-over';
for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) ctx.drawImage(tintCache, x + dx, y + dy);
ctx.drawImage(src, x, y);
}
const hsl = (h, s, l) => `hsl(${((h % 360) + 360) % 360},${s}%,${l}%)`;
const SK = (function build() {
const W = 28, H = 23;
const HW = [12.6, 12.0, 11.0, 9.6, 8.4, 7.6, 7.2, 7.2];
const inside = (x, y) => {
if (y < 0 || y > 22 || x < 0 || x >= W) return false;
const dx = x + 0.5 - 14;
if (y <= 14) { const ny = (y + 0.5 - 11) / 11.2, nx = dx / 13.8; return nx * nx + ny * ny <= 1; }
return Math.abs(dx) <= HW[y - 15];
};
const socket = (x, y) => {
for (const ex of [9, 19]) { const nx = (x + 0.5 - ex) / 3.4, ny = (y + 0.5 - 13.5) / 3.5; if (nx * nx + ny * ny <= 1) return true; }
return false;
};
const nose = (x, y) => (y === 17 && (x === 13 || x === 14)) || ((y === 18 || y === 19) && x >= 12 && x <= 15);
const grid = [];
for (let y = 0; y < H; y++) {
const row = [];
for (let x = 0; x < W; x++) {
if (!inside(x, y)) { row.push('.'); continue; }
if (socket(x, y) || nose(x, y)) { row.push('k'); continue; }
if (y >= 21 && x >= 7 && x <= 20) { row.push((x - 7) % 3 === 2 ? 'g' : 't'); continue; }
const nx = (x + 0.5 - 14) / 14, ny = (y + 0.5 - 11) / 12;
if (nx * 0.7 + ny * 0.7 < -0.72) row.push('h');
else if (nx * 0.45 + ny * 0.85 > 0.62 || (socket(x, y - 1) && y < 19)) row.push('s');
else row.push('b');
}
grid.push(row);
}
const jaw = [];
const JR = [[7, 20, true], [6, 21], [6, 21], [7, 20], [9, 18]];
for (let j = 0; j < 5; j++) {
const row = [];
for (let x = 0; x < W; x++) {
const [a, b, teeth] = JR[j];
if (x < a || x > b) { row.push('.'); continue; }
if (teeth) row.push((x - 7) % 3 === 2 ? 'g' : 't');
else row.push(j >= 3 || x > 18 ? 's' : 'b');
}
jaw.push(row);
}
const outline = g => {
const h = g.length, w = g[0].length, out = [];
for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) {
const f = (yy, xx) => yy >= 0 && yy < h && xx >= 0 && xx < w && g[yy][xx] !== '.';
if (f(y, x)) continue;
if (f(y - 1, x) || f(y + 1, x) || f(y, x - 1) || f(y, x + 1)) out.push([x, y]);
}
return out;
};
return { upper: grid, jaw, upperOl: outline(grid), jawOl: outline(jaw), W, H };
})();
const HC = 72, X0 = 22, Y0 = 30;
const A = {
cx: 36, top: 30, eyeL: [31, 43.5], eyeR: [41, 43.5], nose: [36, 48], teeth: 51, jawTop: 53, jawBot: 57,
forehead: [36, 34], brain: [36, 35], hatY: 33,
};
function skinColors(skinId, t) {
if (skinId === 'rainbow') {
const h = t * 120;
return { o: '#1a1020', b: hsl(h, 80, 70), h: hsl(h + 30, 90, 88), s: hsl(h - 30, 70, 50), k: '#140a18', t: hsl(h + 60, 80, 90), g: hsl(h, 60, 30) };
}
return SKINS[skinId] || SKINS.bone;
}
function drawSkull(ctx, pal, jawOpen, tint) {
const col = k => tint && k !== 'o' && k !== 'k' && k !== 'g' ? tint : pal[k];
ctx.fillStyle = pal.o;
for (const [x, y] of SK.upperOl) ctx.fillRect(X0 + x, Y0 + y, 1, 1);
for (let y = 0; y < SK.H; y++) for (let x = 0; x < SK.W; x++) {
const k = SK.upper[y][x]; if (k === '.') continue;
ctx.fillStyle = col(k); ctx.fillRect(X0 + x, Y0 + y, 1, 1);
}
const jy = Y0 + 23 + jawOpen;
ctx.fillStyle = pal.o;
for (const [x, y] of SK.jawOl) ctx.fillRect(X0 + x, jy + y, 1, 1);
for (let y = 0; y < 5; y++) for (let x = 0; x < SK.W; x++) {
const k = SK.jaw[y][x]; if (k === '.') continue;
ctx.fillStyle = col(k); ctx.fillRect(X0 + x, jy + y, 1, 1);
}
if (jawOpen > 0) { ctx.fillStyle = pal.k; ctx.fillRect(X0 + 8, Y0 + 23, 12, jawOpen); }
}
const S = {
crown: ['y....y....y', 'yy..yYy..yy', 'yyyyyyyyyyy', 'yrryybyyrry', 'ddddddddddd'],
tophat: ['..KKKKKKKK..', '..KGKKKKKK..', '..KGKKKKKK..', '..KGKKKKKK..', '..KKKKKKKK..', '..rrrrrrrr..', '..KKKKKKKK..', 'KKKKKKKKKKKK', '.KKKKKKKKKK.'],
party: ['....W....', '...WpW...', '....P....', '...PcP...', '...cPc...', '..PPcPP..', '..ccPcc..', '.PPPcPPP.', '.cccPccc.', 'PPPPcPPPP'],
wizard: ['........vv...', '.......vvv...', '......vvv....', '.....vvvv....', '.....vvYv....', '....vvvvvv...', '....vvvvvv...', '...vvvvvYvv..', '...vYvvvvvv..', '..vvvvvvvvvv.', '..vvvvvvvYvv.', '.yyyyyyyyyyy.', 'VVVVVVVVVVVVV'],
viking: ['w..............w', 'ww............ww', '.ww..gggggg..ww.', '.wwwgggWggggwww.', '..wggWgggggggw..', '...gggggggggg...', '...dddddddddd...'],
beanie: ['..rryyybb..', '.rrryyybbb.', 'rrrryyybbbb', 'nnnnnnnnnnn'],
cowboy: ['....mmmmmmmm....', '...mmmmMMmmmm...', '...mmmmmmmmmm...', '...MMMMMMMMMM...', 'mm.mmmmmmmmmm.mm', '.mmmmmmmmmmmmmm.', '..mmmmmmmmmmmm..'],
jester: ['y..............y', 'rr............bb', '.rr..........bb.', '.rrr........bbb.', '..rrrr....bbbb..', '..rrrrrbbbbbbb..', '...rrrrbbbbbb...', '..yyyyyyyyyyyy..'],
pirate: ['.......KK.......', '....KKKKKKKK....', '..KKKKWWWWKKKK..', '.KKKKKWKKWKKKKK.', 'KKKKKKWWWWKKKKKK', 'yyyyyyyyyyyyyyyy', '.KKKK......KKKK.'],
grad: ['.......KK.......', '..KKKKKKKKKKKK..', 'KKKKKKKKKKKKKKKK', '..KKKKKKKKKKKKy.', '....KKKKKKKK..y.', '....KKKKKKKK..Y.'],
chef: ['..WW..WW...', '.WWWWWWWWW.', 'WWWWWWWWWWW', 'WWWWWWWWWWW', '.WWWWWWWWW.', '..wwwwwww..', '..wwwwwww..'],
cone: ['....ff....', '....ff....', '...ffff...', '...WWWW...', '...ffff...', '..ffffff..', '..WWWWWW..', '..ffffff..', '.ffffffff.', 'FFFFFFFFFF'],
flowers: ['..p....y....p....y', '.pYp..yWy..pYp..yWy', '..p.n..y.n..p.n..y.', 'nnnnnnnnnnnnnnnnnnn'],
beret: ['.....r.....', '..rrrrrrr..', '.rrrrrrrrr.', 'rrrrrrrrrrr', '.RRRRRRRRR.'],
hornL: ['r....', 'rr...', '.rr..', '.rrr.', '..rrr'],
unicorn: ['..Y..', '..y..', '.Yy..', '.yY..', '.Yyy.', '.yYy.', 'YyYyy'],
heart: ['P.P', 'PPP', '.P.'],
heart5: ['.P.P.', 'PPPPP', 'PPPPP', '.PPP.', '..P..'],
dollar: ['.n.', 'nnn', 'n..', 'nnn', '..n', 'nnn', '.n.'],
star: ['..Y..', '.YYY.', 'YYYYY', '.YYY.', '.Y.Y.'],
xeye: ['r...r', '.r.r.', '..r..', '.r.r.', 'r...r'],
shades: ['KKKKKKKKKKKKKKKKKK', 'KWKKKKKKKKKKWKKKKK', '.KKKKKK....KKKKKK.', '..KKKK......KKKK..'],
nerd: ['KKKKKKKK..KKKKKKKK', 'K......KWWK......K', 'K......K..K......K', 'KKKKKKKK..KKKKKKKK'],
glasses3d: ['WWWWWWWWWWWWWWWWWW', 'WrrrrrrW..WccccccW', 'WrrrrrrW..WccccccW', 'WWWWWWWW..WWWWWWWW'],
mustache: ['.KK......KK.', 'K..KK..KK..K', 'K.KKKKKKKK.K', '.KKK....KKK.'],
rose: ['..rr...', '.rRrr..', 'rrRRr..', '.rrrnnnnnnn', '....n.n....'],
pipe: ['.....mmm', '.....mMm', 'mmmmmmmm'],
dice: ['WWWWW', 'WKWWW', 'WWKWW', 'WWWKW', 'WWWWW'],
card: ['WWWW', 'WrWW', 'WrrW', 'WWrW', 'WWWW', 'WWWW'],
bat1: ['K.....K', 'KK.K.KK', '.KKKKK.'],
bat2: ['...K...', '.KKKKK.', 'K.....K'],
note: ['.KK', '.K.', '.K.', 'KK.', 'KK.'],
moon: ['.YY', 'Y..', 'Y..', '.YY'],
cloud: ['....WWWW......', '..WWWWWWWW.WW.', '.WWWWWWWWWWWWW', 'WWsssWWWWsssWW', '.ssssssssssss.'],
spider: ['K.K.K.K', '.KKKKK.', 'KKrKrKK', '.KKKKK.', 'K.K.K.K'],
butterflyO: ['PP.PP', 'PcPcP', '.PKP.', 'PcPcP', 'PP.PP'],
butterflyC: ['.P.P.', '.cPc.', '..K..', '.cPc.', '.P.P.'],
bandaid: ['tt....tt', '.tttttt.', '..tWWt..', '.tttttt.', 'tt....tt'],
eyeball: ['.WWW.', 'WWWWW', 'WWbWW', 'WWWWW', '.WWW.'],
};
const SLOTS = {
hat: 3, halo: 1, horns: 1, top: 1, hair: 1, eyes: 1, third: 1, face: 1, nose: 1, lip: 1, jaw: 1,
mouth: 1, brain: 1, scar: 1, critter: 2, aura: 2, orbit: 2, particles: 3, motion: 3, skin: 1, post: 2,
};
function hatDraw(rows, offset = 0) {
return (ctx, st, by) => { const s = sprCB(ctx, rows, A.cx, by + offset); return by + offset - s.h; };
}
const F = [];
const def = (id, name, slot, min, draw, extra = {}) => F.push(Object.assign({ id, name, slot, min, draw }, extra));
def('crown', 'Royal Crown', 'hat', 1, hatDraw(S.crown, -1));
def('tophat', 'Top Hat', 'hat', 1, hatDraw(S.tophat));
def('party', 'Party Hat', 'hat', 1, hatDraw(S.party, -1));
def('wizard', 'Wizard Hat', 'hat', 4, hatDraw(S.wizard));
def('viking', 'Viking Helm', 'hat', 3, hatDraw(S.viking, 1));
def('beanie', 'Propeller Beanie', 'hat', 2, (ctx, st, by) => {
sprCB(ctx, S.beanie, A.cx, by); const top = by - 4;
px(ctx, A.cx - 1, top - 1, C.K, 2, 2);
const w = Math.round(Math.abs(Math.cos(st.t * 18)) * 6) + 1;
px(ctx, A.cx - w, top - 2, C.r, w, 1); px(ctx, A.cx, top - 2, C.b, w, 1);
return top - 3;
});
def('cowboy', 'Ten-Gallon Hat', 'hat', 3, hatDraw(S.cowboy, 1));
def('jester', 'Jester Cap', 'hat', 5, hatDraw(S.jester));
def('pirate', 'Pirate Tricorn', 'hat', 4, hatDraw(S.pirate));
def('grad', 'Mortarboard', 'hat', 6, hatDraw(S.grad, -1));
def('chef', 'Chef Toque', 'hat', 2, hatDraw(S.chef, -1));
def('cone', 'Traffic Cone', 'hat', 7, hatDraw(S.cone, -1));
def('flowers', 'Flower Crown', 'hat', 2, hatDraw(S.flowers, -1));
def('beret', 'Artiste Beret', 'hat', 3, hatDraw(S.beret, -1));
def('halo', 'Holy Halo', 'halo', 4, (ctx, st, by) => {
const y = by - 5 + Math.round(Math.sin(st.t * 2.5) * 1.5);
for (let i = -6; i <= 6; i++) { const yy = y + Math.round((i * i) / 18); px(ctx, A.cx + i, yy, i % 3 === 0 ? C.W : C.Y); px(ctx, A.cx + i, yy - 1, C.y); }
});
def('horns', 'Devil Horns', 'horns', 3, ctx => { spr(ctx, S.hornL, 24, 26); spr(ctx, S.hornL, 43, 26, C.o, C, true); });
def('unicorn', 'Unicorn Horn', 'horns', 5, ctx => { sprCB(ctx, S.unicorn, A.cx, 31); });
def('antenna', 'Alien Antenna', 'top', 4, (ctx, st, by) => {
const sway = Math.round(Math.sin(st.t * 3) * 2);
pline(ctx, A.cx, by, A.cx + sway, by - 8, C.g);
disc(ctx, A.cx + sway, by - 10, 1.5, Math.sin(st.t * 6) > 0 ? C.n : '#9bffcf');
});
def('candle', 'Wax Candle', 'top', 3, (ctx, st, by) => {
px(ctx, A.cx - 2, by - 6, '#fff3d6', 4, 6); px(ctx, A.cx - 2, by - 6, '#e8d6b0', 1, 6);
px(ctx, A.cx, by - 8, C.K, 1, 2);
const f = Math.sin(st.t * 20) > 0 ? 1 : 0;
px(ctx, A.cx - 1 + f, by - 11, C.f, 2, 3); px(ctx, A.cx, by - 12 - f, C.Y, 1, 2);
px(ctx, A.cx + 2, by - 4, '#fff3d6', 1, 2);
});
def('mohawk', 'Punk Mohawk', 'hair', 4, (ctx, st) => {
for (let i = 0; i < 7; i++) {
const x = 30 + i * 2, h = 5 + (i % 2) * 2 + Math.round(Math.sin(st.t * 5 + i) * 0.6);
pline(ctx, x, 31, x + 1, 31 - h, i % 2 ? C.P : C.n, 2);
}
});
const EYES = [A.eyeL, A.eyeR];
def('googly', 'Googly Eyes', 'eyes', 1, (ctx, st) => {
for (const [ex, ey] of EYES) {
disc(ctx, ex - 0.5, ey, 2.6, C.W);
const jx = Math.round(Math.sin(st.t * 7.3 + ex) * 1.2 + st.vx * 0.3), jy = Math.round(Math.cos(st.t * 5.1 + ex) * 1.2 + 0.6);
px(ctx, ex - 1 + jx, ey - 1 + jy, C.K, 2, 2);
}
});
def('redeyes', 'Hellfire Pupils', 'eyes', 2, (ctx, st) => {
const p = 0.6 + Math.sin(st.t * 4) * 0.4;
for (const [ex, ey] of EYES) {
ctx.globalAlpha = 0.45 * p; disc(ctx, ex - 0.5, ey, 2.5, C.r); ctx.globalAlpha = 1;
px(ctx, ex - 1, ey - 1, '#ff4d4d', 2, 2); px(ctx, ex - 1, ey - 1, C.W, 1, 1);
}
});
def('hearteyes', 'Heart Eyes', 'eyes', 2, (ctx, st) => {
const big = Math.sin(st.t * 6) > 0.3;
for (const [ex, ey] of EYES) spr(ctx, big ? S.heart5 : S.heart, ex - (big ? 3 : 2), ey - (big ? 2 : 1), null);
});
def('dollareyes', 'Dollar Eyes', 'eyes', 3, (ctx, st) => {
const flip = Math.floor(st.t * 3) % 2;
for (const [ex, ey] of EYES) spr(ctx, S.dollar, ex - 2, ey - 3, null, flip ? C : Object.assign({}, C, { n: C.y }));
});
def('stareyes', 'Star Eyes', 'eyes', 2, (ctx, st) => {
for (const [ex, ey] of EYES) { spr(ctx, S.star, ex - 3, ey - 2, null); if (Math.sin(st.t * 9 + ex) > 0.7) px(ctx, ex - 3, ey - 3, C.W); }
});
def('spiral', 'Hypno Spirals', 'eyes', 4, (ctx, st) => {
for (const [ex, ey] of EYES) {
disc(ctx, ex - 0.5, ey, 2.6, C.W);
for (let i = 0; i < 14; i++) { const a = i * 0.7 + st.t * 6, r = i * 0.2; px(ctx, ex - 0.5 + Math.cos(a) * r, ey + Math.sin(a) * r, i % 2 ? C.K : C.v); }
}
});
def('lasers', 'Laser Eyes', 'eyes', 6, (ctx, st) => {
const on = (st.t % 3) < 0.9;
for (const [ex, ey] of EYES) {
px(ctx, ex - 1, ey - 1, C.r, 2, 2); px(ctx, ex - 1, ey - 1, C.W);
if (on) {
const dir = ex < A.cx ? -1 : 1;
ctx.globalAlpha = 0.8; pline(ctx, ex, ey, ex + dir * 40, ey + 30, C.r, 2); ctx.globalAlpha = 1;
pline(ctx, ex, ey, ex + dir * 40, ey + 30, '#ffd6d6', 1);
}
}
});
def('xeyes', 'X_X Eyes', 'eyes', 3, ctx => { for (const [ex, ey] of EYES) spr(ctx, S.xeye, ex - 3, ey - 2, null); });
def('rainboweyes', 'Prism Eyes', 'eyes', 5, (ctx, st) => {
for (const [ex, ey] of EYES) for (let r = 3; r >= 1; r--) disc(ctx, ex - 0.5, ey, r * 0.85, hsl(st.t * 200 + r * 60 + ex * 10, 90, 60));
});
def('darting', 'Darting Pupils', 'eyes', 1, (ctx, st) => {
const ph = Math.floor(st.t * 1.6) % 4, off = [[-1, 0], [1, 0], [0, -1], [1, 1]][ph];
for (const [ex, ey] of EYES) px(ctx, ex - 1 + off[0], ey - 1 + off[1], C.W, 2, 2);
});
def('flameeyes', 'Soul Flames', 'eyes', 5, (ctx, st) => {
for (const [ex, ey] of EYES) for (let i = 0; i < 6; i++) {
const h = (Math.sin(st.t * 12 + i * 1.7 + ex) * 0.5 + 0.5) * 6;
const x = ex - 3 + i;
pline(ctx, x, ey + 2, x, ey + 2 - h, i % 2 ? C.c : '#9be7ff');
}
});
def('thirdeye', 'Third Eye', 'third', 4, (ctx, st) => {
const [x, y] = A.forehead; const open = (st.t % 4) > 0.15;
px(ctx, x - 3, y - 1, C.o, 6, 3);
if (open) { px(ctx, x - 2, y - 1, C.W, 4, 2); px(ctx, x - 1, y - 1, C.v, 2, 2); px(ctx, x - 1, y - 1, C.W, 1, 1); }
else px(ctx, x - 2, y, C.K, 4, 1);
});
def('shades', 'Deal-With-It Shades', 'face', 2, ctx => { sprCB(ctx, S.shades, A.cx, 45, null); });
def('monocle', 'Gentleman Monocle', 'face', 3, (ctx, st) => {
circ(ctx, A.eyeR[0] - 0.5, A.eyeR[1], 4, C.y);
ctx.globalAlpha = 0.25; disc(ctx, A.eyeR[0] - 0.5, A.eyeR[1], 3, C.c); ctx.globalAlpha = 1;
const sw = Math.sin(st.t * 2) * 2;
for (let i = 0; i < 10; i++) px(ctx, A.eyeR[0] + 3 + i * 0.4 + Math.sin(i * 0.5) * sw * 0.2, A.eyeR[1] + 4 + i, i % 2 ? C.y : C.d);
});
def('eyepatch', 'Pirate Eyepatch', 'face', 3, ctx => {
pline(ctx, 24, 36, 48, 41, C.K, 1);
disc(ctx, A.eyeL[0] - 0.5, A.eyeL[1] + 0.5, 3.3, C.K);
});
def('glasses3d', '3D Glasses', 'face', 4, ctx => { sprCB(ctx, S.glasses3d, A.cx, 45, C.o); });
def('nerd', 'Taped Specs', 'face', 2, ctx => { sprCB(ctx, S.nerd, A.cx, 45, null); });
def('clownnose', 'Clown Nose', 'nose', 2, (ctx, st) => { disc(ctx, A.nose[0] - 0.5, A.nose[1], 2.3, C.r); px(ctx, A.nose[0] - 2, A.nose[1] - 2, C.W); if (Math.sin(st.t * 3) > 0.95) px(ctx, A.nose[0] - 1, A.nose[1] - 1, C.W, 2, 1); });
def('mustache', 'Handlebar Mustache', 'lip', 2, ctx => { sprCB(ctx, S.mustache, A.cx, 52, null); });
def('laugh', 'Maniacal Laugh', 'jaw', 2, null, { jaw: st => (st.t % 3.2) < 1.3 ? (Math.sin(st.t * 30) > 0 ? 3 : 1) : 0, text: true });
def('goldtooth', 'Gold Tooth', 'mouth', 1, (ctx, st) => {
px(ctx, X0 + 16, Y0 + 21, C.y, 2, 2);
if ((st.t % 2.5) < 0.25) { px(ctx, X0 + 18, Y0 + 19, C.W); px(ctx, X0 + 19, Y0 + 20, C.Y); px(ctx, X0 + 17, Y0 + 20, C.Y); }
});
def('blower', 'Party Blower', 'mouth', 3, (ctx, st) => {
const ph = st.t % 2.4, out = ph < 0.9 ? Math.min(1, ph * 4) : Math.max(0, 1 - (ph - 0.9) * 3);
const len = 3 + Math.round(out * 9);
for (let i = 0; i < len; i++) px(ctx, X0 + 19 + i, A.teeth + 1, Math.floor(i / 2) % 2 ? C.y : C.r, 1, 2);
if (out < 0.4) { px(ctx, X0 + 19 + len, A.teeth - 1, C.r, 2, 2); px(ctx, X0 + 20 + len, A.teeth - 2, C.y, 1, 1); }
if (out > 0.95) for (let i = 0; i < 4; i++) px(ctx, X0 + 30 + i * 2, A.teeth - 3 + (i % 2) * 6, [C.c, C.P, C.Y, C.n][i]);
});
def('tongue', 'Silly Tongue', 'mouth', 2, (ctx, st, by, jo) => {
const len = 4 + Math.round(Math.sin(st.t * 5) * 1.5);
px(ctx, A.cx - 2, A.jawTop + jo, C.p, 4, len); px(ctx, A.cx - 1, A.jawTop + jo + len, C.p, 2, 1);
px(ctx, A.cx, A.jawTop + jo + 1, '#e05a7a', 1, len - 1);
});
def('fangs', 'Vampire Fangs', 'mouth', 4, ctx => { px(ctx, X0 + 9, A.teeth, C.W, 1, 5); px(ctx, X0 + 18, A.teeth, C.W, 1, 5); px(ctx, X0 + 9, A.teeth + 5, C.r); px(ctx, X0 + 18, A.teeth + 5, C.r); });
def('rose', 'Rose Between Teeth', 'mouth', 3, ctx => { spr(ctx, S.rose, X0 - 1, A.teeth - 2); });
def('bubblegum', 'Bubblegum', 'mouth', 2, (ctx, st) => {
const ph = st.t % 3.5;
if (ph < 2.8) { const r = Math.max(1, ph * 2.6); disc(ctx, A.cx + 4, A.teeth + 2, r, C.p); px(ctx, A.cx + 4 - r * 0.5, A.teeth + 1 - r * 0.5, C.W); }
else if (ph < 3.1) for (let i = 0; i < 8; i++) px(ctx, A.cx + 4 + Math.cos(i) * 9, A.teeth + 2 + Math.sin(i) * 9, C.p);
});
def('pipe', 'Bubble Pipe', 'mouth', 3, (ctx, st) => {
spr(ctx, S.pipe, X0 + 18, A.teeth);
for (let i = 0; i < 3; i++) { const k = (st.t * 0.6 + i / 3) % 1; circ(ctx, X0 + 25 + Math.sin(k * 8) * 2, A.teeth - 2 - k * 20, 1 + k * 1.5, C.c); }
});
def('sparks', 'Neural Sparks', 'brain', 1, (ctx, st) => {
const seed = Math.floor(st.t * 8);
for (let n = 0; n < 3; n++) {
let r = (seed * 9301 + n * 49297) % 233280;
const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
let x = 26 + rnd() * 20, y = 32 + rnd() * 6;
const col = [C.c, C.Y, '#9bffcf'][n];
for (let i = 0; i < 5; i++) { const nx = x + (rnd() - 0.5) * 8, ny = y + (rnd() - 0.3) * 4; pline(ctx, x, y, nx, ny, col); x = nx; y = ny; }
px(ctx, x - 1, y - 1, C.W, 2, 2);
}
});
const brainBlob = (ctx, st, glow) => {
for (let y = 30; y < 39; y++) for (let x = 26; x < 47; x++) {
const nx = (x + 0.5 - 36) / 10.5, ny = (y + 0.5 - 37) / 7.5;
if (nx * nx + ny * ny > 1 || y > 38) continue;
const fold = (Math.sin(x * 1.3 + y * 0.8) + Math.sin(y * 2.1 - x * 0.4)) > 0.6;
ctx.fillStyle = fold ? '#d94f86' : (glow ? hsl(330, 90, 70 + Math.sin(st.t * 5) * 10) : '#ff8fb6');
ctx.fillRect(x, y, 1, 1);
}
px(ctx, 35, 31, '#d94f86', 1, 7);
};
def('brain', 'Exposed Brain', 'brain', 3, (ctx, st) => brainBlob(ctx, st, false));
def('bigbrain', 'Galaxy Brain', 'brain', 6, (ctx, st) => {
for (let y = 30; y < 39; y++) for (let x = 26; x < 47; x++) {
const nx = (x + 0.5 - 36) / 10.5, ny = (y + 0.5 - 37) / 7.5;
if (nx * nx + ny * ny > 1) continue;
ctx.fillStyle = hsl(250 + nx * 40 + Math.sin(st.t + ny) * 20, 70, 18 + (1 - nx * nx - ny * ny) * 18); ctx.fillRect(x, y, 1, 1);
}
for (let i = 0; i < 12; i++) {
const a = i * 2.4 + st.t * (0.5 + (i % 3) * 0.3), r = (i % 5) * 2 + 1;
const x = 36 + Math.cos(a) * r * 1.6, y = 35 + Math.sin(a) * r * 0.7;
px(ctx, x, y, i % 4 === 0 ? C.Y : C.W);
}
});
def('gears', 'Clockwork Mind', 'brain', 5, (ctx, st) => {
const gear = (cx, cy, r, sp) => {
disc(ctx, cx, cy, r, C.y); disc(ctx, cx, cy, Math.max(1, r - 2), C.d); px(ctx, cx, cy, C.K);
for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + st.t * sp; px(ctx, cx + Math.cos(a) * (r + 1), cy + Math.sin(a) * (r + 1), C.y, 1, 1); }
};
gear(32, 35, 3, 2); gear(39, 34, 2, -3); gear(42, 37, 2, 3);
});
def('glowbrain', 'Big Brain Energy', 'brain', 4, (ctx, st) => {
ctx.globalAlpha = 0.35 + Math.sin(st.t * 5) * 0.15; disc(ctx, 36, 35, 9, '#ff8fb6'); ctx.globalAlpha = 1;
brainBlob(ctx, st, true);
});
def('worm', 'Eye-Socket Worm', 'critter', 2, (ctx, st) => {
const out = Math.max(0, Math.sin(st.t * 1.5)) * 5;
for (let i = 0; i < out; i++) px(ctx, A.eyeL[0] - 3 - i + Math.round(Math.sin(st.t * 6 + i) * 0.6), A.eyeL[1] + 1 - i * 0.6, i === Math.floor(out) - 1 ? '#7be08f' : '#4caf50', 2, 2);
});
def('spider', 'Dangling Spider', 'critter', 3, (ctx, st) => {
const len = 6 + Math.round((Math.sin(st.t * 1.3) * 0.5 + 0.5) * 6);
pline(ctx, X0 + 7, A.jawBot, X0 + 7, A.jawBot + len, '#dddddd');
spr(ctx, S.spider, X0 + 4, A.jawBot + len, null);
});
def('snake', 'Socket Snake', 'critter', 5, (ctx, st) => {
for (let i = 0; i < 26; i++) {
const x = 22 + i, y = 43 + Math.round(Math.sin(i * 0.5 - st.t * 4) * 2.5);
const inSock = (x >= 28 && x <= 33) || (x >= 38 && x <= 43);
if (!inSock && (x > 33 && x < 38)) continue;
px(ctx, x, y, i % 3 === 0 ? '#2e7d32' : '#66bb6a', 1, 2);
}
px(ctx, 48, 42 + Math.round(Math.sin(-st.t * 4) * 2), C.r, 2, 1);
});
def('butterfly', 'Resting Butterfly', 'critter', 3, (ctx, st) => {
spr(ctx, Math.sin(st.t * 10) > 0 ? S.butterflyO : S.butterflyC, 42, 26, C.o);
});
def('cracks', 'Battle Cracks', 'scar', 2, ctx => {
pline(ctx, 30, 30, 32, 34, '#5a4a44'); pline(ctx, 32, 34, 31, 37, '#5a4a44'); pline(ctx, 32, 34, 35, 35, '#5a4a44');
pline(ctx, 45, 38, 47, 42, '#5a4a44');
});
def('stitches', 'Frankenstitches', 'scar', 3, ctx => {
pline(ctx, 27, 36, 45, 35, '#3a2a30');
for (let x = 28; x <= 44; x += 3) px(ctx, x, 34, '#3a2a30', 1, 3);
});
def('bandaid', 'Boo-Boo Bandage', 'scar', 1, ctx => { spr(ctx, S.bandaid, 40, 31, null); });
def('sugarskull', 'Sugar Skull Paint', 'scar', 5, (ctx, st) => {
for (const [ex, ey] of EYES) { circ(ctx, ex - 0.5, ey, 4.5, (Math.floor(st.t * 2) % 2) ? C.P : C.c); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; px(ctx, ex - 0.5 + Math.cos(a) * 5.5, ey + Math.sin(a) * 5.5, C.y); } }
sprCB(ctx, S.heart5, A.cx, 37, null); px(ctx, 29, 51, C.n); px(ctx, 42, 51, C.n);
});
def('rays', 'Radiant Rays', 'aura', 2, null, {
back: (ctx, st, hx, hy) => {
ctx.save(); ctx.translate(hx, hy); ctx.rotate(st.t * 0.4);
for (let i = 0; i < 12; i++) {
ctx.fillStyle = i % 2 ? 'rgba(255,224,138,0.35)' : 'rgba(255,158,0,0.25)';
ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 60, i / 12 * Math.PI * 2, (i + 0.5) / 12 * Math.PI * 2); ctx.fill();
}
ctx.restore();
},
});
def('flameaura', 'Infernal Aura', 'aura', 4, null, { emit: (st, hx, hy) => st.emit({ x: hx + (Math.random() - 0.5) * 30, y: hy + 10 + Math.random() * 6, vx: (Math.random() - 0.5) * 6, vy: -18 - Math.random() * 22, life: 0.9, col: ['#ffd166', '#ff9e00', '#ff4d00', '#d00000'], size: 2, back: true }, 0.7) });
def('wisps', 'Ghost Wisps', 'aura', 3, null, {
back: (ctx, st, hx, hy) => {
for (let i = 0; i < 4; i++) for (let k = 0; k < 6; k++) {
const a = st.t * 1.4 + i * Math.PI / 2 - k * 0.12;
ctx.globalAlpha = 0.5 * (1 - k / 6);
px(ctx, hx + Math.cos(a) * 28, hy + Math.sin(a) * 14 - 4, '#dfe8ff', 2, 2);
}
ctx.globalAlpha = 1;
},
});
def('raincloud', 'Personal Raincloud', 'aura', 2, null, {
back: (ctx, st, hx, hy) => {
sprCB(ctx, S.cloud, hx, hy - 26 + Math.round(Math.sin(st.t) * 1), C.g);
},
emit: (st, hx, hy) => st.emit({ x: hx - 6 + Math.random() * 12, y: hy - 25, vx: 0, vy: 50, life: 0.7, col: ['#4cc9f0', '#9be7ff'], size: 1, tall: true }, 0.25),
});
def('lightning', 'Storm Crackle', 'aura', 5, null, {
back: (ctx, st, hx, hy) => {
const ph = st.t % 1.7; if (ph > 0.18) return;
let r = Math.floor(st.t / 1.7) * 7919 % 1000;
const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
const side = rnd() > 0.5 ? 1 : -1;
let x = hx + side * (18 + rnd() * 10), y = hy - 34;
for (let i = 0; i < 7; i++) { const nx = x + (rnd() - 0.5) * 8, ny = y + 8; pline(ctx, x, y, nx, ny, i % 2 ? '#fff3b0' : '#ffffff', 2); x = nx; y = ny; }
},
});
const orbit = (id, name, min, n, drawItem, rx = 34, ry = 12, speed = 1.3) => def(id, name, 'orbit', min, null, {
orbit: (ctx, st, hx, hy, front) => {
for (let i = 0; i < n; i++) {
const a = st.t * speed + i / n * Math.PI * 2;
if ((Math.sin(a) > 0) !== front) continue;
drawItem(ctx, Math.round(hx + Math.cos(a) * rx), Math.round(hy + Math.sin(a) * ry), st, i, a);
}
},
});
orbit('dice', 'Orbiting Dice', 2, 3, (ctx, x, y) => spr(ctx, S.dice, x - 2, y - 2));
orbit('planets', 'Pocket Planets', 4, 3, (ctx, x, y, st, i) => { disc(ctx, x, y, 2, [C.f, C.c, C.n][i]); pline(ctx, x - 4, y + 1, x + 4, y - 1, C.Y); }, 38, 14, 0.9);
orbit('cards', 'Card Carousel', 3, 4, (ctx, x, y) => spr(ctx, S.card, x - 2, y - 3));
orbit('bats', 'Bat Swarm', 4, 4, (ctx, x, y, st) => spr(ctx, Math.sin(st.t * 14) > 0 ? S.bat1 : S.bat2, x - 3, y - 1, null), 36, 16, 2.1);
orbit('moons', 'Twin Moons', 3, 2, (ctx, x, y) => spr(ctx, S.moon, x - 1, y - 2, C.o), 30, 10, 0.8);
orbit('eyeballs', 'Floating Eyeballs', 6, 3, (ctx, x, y, st) => spr(ctx, S.eyeball, x - 2, y - 2), 34, 13, -1.1);
const emitter = (id, name, min, rate, make) => def(id, name, 'particles', min, null, { emit: (st, hx, hy) => st.emit(make(hx, hy), rate) });
emitter('sparkles', 'Sparkles', 1, 0.25, (hx, hy) => ({ x: hx + (Math.random() - 0.5) * 60, y: hy + (Math.random() - 0.5) * 50, vx: 0, vy: -4, life: 0.6, col: [C.W, C.Y, C.c], size: 1, sparkle: true }));
emitter('notes', 'Music Notes', 2, 0.12, (hx, hy) => ({ x: hx + 14 + Math.random() * 8, y: hy + 8, vx: 8 + Math.random() * 6, vy: -16, life: 1.6, sprite: S.note, wave: true }));
emitter('hearts', 'Floating Hearts', 2, 0.12, (hx, hy) => ({ x: hx + (Math.random() - 0.5) * 40, y: hy + 10, vx: 0, vy: -14, life: 1.6, sprite: S.heart, wave: true }));
emitter('bubbles', 'Bubbles', 2, 0.15, (hx, hy) => ({ x: hx + (Math.random() - 0.5) * 50, y: hy + 26, vx: 0, vy: -12 - Math.random() * 8, life: 2, ring: 1 + Math.random() * 1.5, col: [C.c], wave: true }));
emitter('fireflies', 'Fireflies', 3, 0.1, (hx, hy) => ({ x: hx + (Math.random() - 0.5) * 70, y: hy + (Math.random() - 0.5) * 50, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 2.4, col: ['#d9ff66', '#fff3b0'], size: 1, glow: true, wave: true }));
emitter('confetti', 'Confetti Drizzle', 3, 0.3, (hx, hy) => ({ x: hx + (Math.random() - 0.5) * 80, y: hy - 45, vx: (Math.random() - 0.5) * 6, vy: 20 + Math.random() * 10, life: 2.5, col: [C.r, C.y, C.n, C.c, C.P, C.v], size: 1, wave: true }));
emitter('stars', 'Shooting Stars', 5, 0.06, (hx, hy) => ({ x: hx - 50, y: hy - 30 - Math.random() * 15, vx: 70, vy: 25, life: 1.4, col: [C.W, C.Y], size: 1, trail: true }));
def('bob', 'Gentle Float', 'motion', 1, null, { motion: (m, st) => { m.dy += Math.sin(st.t * 2) * 2; } });
def('wobble', 'Drunken Wobble', 'motion', 2, null, { motion: (m, st) => { m.rot += Math.sin(st.t * 3) * 0.12; } });
def('spin', 'Rapid Spin Cycle', 'motion', 4, null, {
motion: (m, st) => { const ph = st.t % 6; if (ph < 0.7) { const k = ph / 0.7; m.rot += (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2) * Math.PI * 4; } },
});
def('jitter', 'Over-Caffeinated', 'motion', 3, null, { motion: m => { m.dx += Math.round((Math.random() - 0.5) * 2); m.dy += Math.round((Math.random() - 0.5) * 2); } });
def('pulse', 'Heartbeat Pulse', 'motion', 2, null, { motion: (m, st) => { const b = Math.pow(Math.max(0, Math.sin(st.t * 5)), 8); m.sx *= 1 + b * 0.08; m.sy *= 1 + b * 0.08; } });
def('headbang', 'Headbanger', 'motion', 5, null, { motion: (m, st) => { const b = Math.max(0, Math.sin(st.t * 9)); m.dy += b * 3; m.rot += b * 0.15; } });
def('hop', 'Bunny Hop', 'motion', 3, null, { motion: (m, st) => { const h = Math.abs(Math.sin(st.t * 3.2)); m.dy -= h * 5; m.sy *= 1 - (1 - h) * 0.06 * (h < 0.15 ? 1 : 0); } });
const skin = (id, name, min) => def(id, name, 'skin', min, null, { skin: id.replace('skin_', '') });
skin('skin_gold', 'Golden Skull', 3); skin('skin_crystal', 'Crystal Skull', 5); skin('skin_obsidian', 'Obsidian Skull', 6);
skin('skin_rainbow', 'Rainbow Skull', 7); skin('skin_ruby', 'Ruby Skull', 4); skin('skin_jade', 'Jade Skull', 4);
skin('skin_ghost', 'Ghostly Skull', 5); skin('skin_chrome', 'Chrome Skull', 6);
def('afterimage', 'Afterimage Trails', 'post', 5, null, { post: 'after' });
def('glitch', 'Glitch Mode', 'post', 6, null, { post: 'glitch' });
def('strobe', 'Strobe Flash', 'post', 4, null, { post: 'strobe' });
def('outline', 'Neon Outline', 'post', 3, null, { post: 'neon' });
const BY_ID = {}; F.forEach(f => (BY_ID[f.id] = f));
function resolve(list) {
const active = {};
for (const id of list) {
const f = BY_ID[id]; if (!f) continue;
const arr = active[f.slot] || (active[f.slot] = []);
const idx = arr.indexOf(f); if (idx >= 0) arr.splice(idx, 1);
arr.push(f);
while (arr.length > (SLOTS[f.slot] || 1)) arr.shift();
}
return active;
}
function rollFlourish(owned, level) {
const have = new Set(owned);
const tier = Math.ceil(level / 5);
let pool = F.filter(f => !have.has(f.id) && f.min <= tier + 1);
if (!pool.length) pool = F.filter(f => !have.has(f.id));
if (!pool.length) return null;
const act = resolve(owned);
const weighted = [];
for (const f of pool) { const w = act[f.slot] ? 1 : 3; for (let i = 0; i < w; i++) weighted.push(f); }
return weighted[Math.floor(Math.random() * weighted.length)].id;
}
class Inst {
constructor(canvas, opts = {}) {
this.canvas = canvas;
this.ctx = canvas.getContext('2d');
this.head = document.createElement('canvas'); this.head.width = HC; this.head.height = HC;
this.hctx = this.head.getContext('2d');
this.hang = document.createElement('canvas'); this.hang.width = 128; this.hang.height = 128;
this.gctx = this.hang.getContext('2d');
this.t = Math.random() * 10;
this.parts = [];
this.react = { flash: 0, hurt: 0, happy: 0, key: 0, pop: 0 };
this.panic = 0; this.dead = false; this.deadT = 0;
this.trail = [];
this.vx = 0;
this.setMode(opts.mode || 'skull');
this.setFlourishes(opts.flourishes || []);
}
setMode(mode) {
this.mode = mode;
const s = mode === 'skeleton' ? 128 : 96;
this.canvas.width = s; this.canvas.height = s;
this.ctx.imageSmoothingEnabled = false;
}
setFlourishes(list) { this.list = list.slice(); this.active = resolve(this.list); }
addFlourish(id) { this.list.push(id); this.active = resolve(this.list); this.react.flash = 0.5; this.react.happy = 0.6; }
hit(kind) {
const r = this.react;
if (kind === 'key') { r.key = 0.12; }
else if (kind === 'hit') { r.flash = 0.18; r.pop = 0.25; }
else if (kind === 'miss') { r.hurt = 0.35; }
else if (kind === 'solve') { r.flash = 0.3; r.happy = 1; r.pop = 0.4; }
else if (kind === 'perk') { r.flash = 0.4; r.pop = 0.3; }
else if (kind === 'backspace') { r.key = 0.1; }
else if (kind === 'dead') { this.dead = true; this.deadT = 0; }
}
emit(p, rate) {
if (Math.random() > rate * 60 * this._dt) return;
const col = p.col ? p.col[Math.floor(Math.random() * p.col.length)] : C.W;
this.parts.push(Object.assign({ age: 0 }, p, { col }));
}
slot(name) { return this.active[name] || []; }
drawHead(t) {
const ctx = this.hctx, st = this;
ctx.clearRect(0, 0, HC, HC);
const skinF = this.slot('skin')[0];
let pal = skinColors(skinF ? skinF.skin : 'bone', t);
if (this.dead) pal = Object.assign({}, pal, { b: '#9a9590', h: '#bab5ae', s: '#6a6560', t: '#c8c3bb' });
let tint = null;
if (this.react.flash > 0) tint = '#ffffff';
else if (this.react.hurt > 0 && Math.sin(this.react.hurt * 60) > 0) tint = '#ff6b6b';
let jaw = 0;
const jf = this.slot('jaw')[0];
if (jf && jf.jaw) jaw = jf.jaw(st);
if (this.react.happy > 0) jaw = Math.max(jaw, Math.sin(this.react.happy * 25) > 0 ? 2 : 0);
if (this.react.hurt > 0) jaw = Math.max(jaw, 1);
if (this.dead) jaw = Math.min(4, Math.floor(this.deadT * 8));
if (this.panic > 0.5) jaw = Math.max(jaw, Math.sin(t * 40) > 0.3 ? 1 : 0);
if (this.talk > 0 && !this.dead) jaw = Math.max(jaw, Math.sin(t * 26) > 0 ? 2 : 0);
const ghostAlpha = pal.alpha || 1;
ctx.globalAlpha = ghostAlpha;
drawSkull(ctx, pal, jaw, tint);
ctx.globalAlpha = 1;
const order = ['scar', 'brain', 'eyes', 'third', 'nose', 'lip', 'mouth', 'face', 'hair', 'horns'];
for (const s of order) for (const f of this.slot(s)) if (f.draw) f.draw(ctx, st, A.hatY, jaw);
if (!this.slot('eyes').length && !this.dead) {
const g = this.react.key > 0 ? C.Y : '#6b5a70';
for (const [ex, ey] of EYES) px(ctx, ex - 1, ey - 1, g, 1, 1);
}
if (this.dead) for (const [ex, ey] of EYES) spr(ctx, S.xeye, ex - 3, ey - 2, null);
let by = A.hatY;
for (const f of this.slot('hat')) by = f.draw(ctx, st, by) + 1;
for (const f of this.slot('top')) f.draw(ctx, st, by);
if (this.slot('top').length) by -= 10;
for (const f of this.slot('halo')) f.draw(ctx, st, by);
for (const f of this.slot('critter')) f.draw(ctx, st, by, jaw);
if (jf && jf.text && jaw > 0) ptext(ctx, Math.floor(t * 3) % 2 ? 'HA' : 'HA!', 50, 44 - Math.floor(t * 3) % 2 * 3, C.Y, C.K);
if (this.panic > 0) {
const k = (t * 1.6) % 1;
px(ctx, 24 - k * 2, 36 + k * 12, '#9be7ff', 1, 2); px(ctx, 49 + k * 2, 38 + k * 10, '#9be7ff', 1, 2);
}
this.headTop = by;
}
motion(t) {
const m = { dx: 0, dy: 0, rot: 0, sx: 1, sy: 1 };
for (const f of this.slot('motion')) f.motion(m, this);
const r = this.react;
if (r.pop > 0) { const k = r.pop / 0.4; m.sx *= 1 + k * 0.12; m.sy *= 1 + k * 0.12; }
if (r.hurt > 0) { m.dx += Math.round((Math.random() - 0.5) * 4); m.rot += (Math.random() - 0.5) * 0.15; }
if (r.happy > 0) m.dy -= Math.abs(Math.sin(r.happy * 12)) * 4;
if (this.panic > 0) { m.dx += Math.round((Math.random() - 0.5) * this.panic * 2); }
if (this.dead) { m.rot += Math.min(0.5, this.deadT * 0.8); m.dy += Math.min(8, this.deadT * 20); }
return m;
}
blitHead(ctx, cx, cy, m, alpha = 1) {
ctx.save();
ctx.globalAlpha = alpha;
ctx.translate(Math.round(cx + m.dx), Math.round(cy + m.dy));
if (m.rot) ctx.rotate(m.rot);
if (m.sx !== 1 || m.sy !== 1) ctx.scale(m.sx, m.sy);
ctx.drawImage(this.head, -A.cx, -43);
ctx.restore();
}
renderHeadInto(ctx, cx, cy, m) {
const post = this.slot('post').map(f => f.post);
if (post.includes('after')) {
this.trail.unshift({ m: Object.assign({}, m), cx, cy }); if (this.trail.length > 8) this.trail.pop();
[6, 4, 2].forEach((i, k) => { const p = this.trail[i]; if (p) this.blitHead(ctx, p.cx, p.cy, p.m, 0.18 + k * 0.08); });
}
if (post.includes('neon')) {
ctx.save(); ctx.filter = `drop-shadow(0 0 1px ${hsl(this.t * 90, 100, 60)})`; this.blitHead(ctx, cx, cy, m); ctx.restore();
} else if (post.includes('glitch') && (this.t % 2.2) < 0.25) {
const off = Math.round((Math.random() - 0.5) * 6);
ctx.save(); ctx.globalCompositeOperation = 'lighter';
ctx.globalAlpha = 0.6; this.blitHead(ctx, cx + off, cy, m, 0.6); this.blitHead(ctx, cx - off, cy, m, 0.6);
ctx.restore();
this.blitHead(ctx, cx, cy + (Math.random() > 0.5 ? 1 : 0), m);
const sy = Math.round(cy - 20 + Math.random() * 30);
ctx.drawImage(ctx.canvas, 0, sy, ctx.canvas.width, 3, Math.round((Math.random() - 0.5) * 8), sy, ctx.canvas.width, 3);
} else {
this.blitHead(ctx, cx, cy, m);
}
if (post.includes('strobe') && (this.t % 1.6) < 0.08) {
ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5; this.blitHead(ctx, cx, cy, m); ctx.restore();
}
}
updateParticles(ctx, dt, back) {
for (let i = this.parts.length - 1; i >= 0; i--) {
const p = this.parts[i];
if (!!p.back !== back) continue;
if (back !== null) { p.age += dt; }
if (p.age > p.life) { this.parts.splice(i, 1); continue; }
p.x += (p.vx + (p.wave ? Math.sin(p.age * 4 + p.y) * 6 : 0)) * dt; p.y += p.vy * dt;
const k = 1 - p.age / p.life;
ctx.globalAlpha = Math.min(1, k * 2);
if (p.sprite) spr(ctx, p.sprite, p.x, p.y, null);
else if (p.ring) circ(ctx, p.x, p.y, p.ring, p.col);
else if (p.sparkle) { const s = k > 0.5 ? 1 : 0; px(ctx, p.x, p.y, p.col); if (s) { px(ctx, p.x - 1, p.y, p.col); px(ctx, p.x + 1, p.y, p.col); px(ctx, p.x, p.y - 1, p.col); px(ctx, p.x, p.y + 1, p.col); } }
else if (p.trail) { pline(ctx, p.x, p.y, p.x - p.vx * 0.08, p.y - p.vy * 0.08, p.col); }
else if (p.tall) px(ctx, p.x, p.y, p.col, 1, 2);
else { if (p.glow) { ctx.globalAlpha *= 0.4; px(ctx, p.x - 1, p.y - 1, p.col, 3, 3); ctx.globalAlpha = Math.min(1, k * 2); } px(ctx, p.x, p.y, p.col, p.size || 1, p.size || 1); }
}
ctx.globalAlpha = 1;
}
drawGallows(ctx) {
px(ctx, 4, 120, C.M, 84, 8); px(ctx, 4, 120, C.m, 84, 2);
px(ctx, 14, 6, C.M, 5, 115); px(ctx, 15, 6, C.m, 2, 115);
px(ctx, 14, 5, C.M, 82, 5); px(ctx, 14, 6, C.m, 82, 2);
pline(ctx, 18, 28, 36, 9, C.M, 3); pline(ctx, 18, 27, 35, 9, C.m, 1);
for (let x = 22; x < 84; x += 9) px(ctx, x, 121, C.M, 1, 6);
}
drawBody(ctx, cx, neckY, t, skinPal) {
const tmp = this._body || (this._body = document.createElement('canvas'));
tmp.width = 128; tmp.height = 128;
const b = tmp.getContext('2d');
const bone = this.dead ? '#9a9590' : (this.react.flash > 0 ? '#ffffff' : skinPal.b);
const sh = this.dead ? '#6a6560' : skinPal.s;
const kick = this.panic * Math.sin(t * 18) * 3;
pline(b, cx, neckY, cx, neckY + 26, sh, 2);
for (let y = neckY; y < neckY + 26; y += 3) px(b, cx - 1, y, bone, 3, 2);
pline(b, cx - 10, neckY + 4, cx + 10, neckY + 4, bone, 2);
[[7, 10], [10, 9], [13, 8], [16, 6]].forEach(([dy, w]) => {
pline(b, cx - w, neckY + dy + 1, cx - 1, neckY + dy - 1, bone, 1); pline(b, cx + w, neckY + dy + 1, cx + 1, neckY + dy - 1, bone, 1);
px(b, cx - w, neckY + dy + 1, bone, 1, 2); px(b, cx + w, neckY + dy + 1, bone, 1, 2);
});
const py = neckY + 27;
pline(b, cx - 7, py, cx + 7, py, bone, 2); pline(b, cx - 7, py, cx - 4, py + 5, bone, 2); pline(b, cx + 7, py, cx + 4, py + 5, bone, 2);
px(b, cx - 2, py + 2, sh, 4, 2);
const sw = Math.sin(t * 1.7) * 1.5;
pline(b, cx - 10, neckY + 5, cx - 12 + sw, neckY + 16, bone, 2); pline(b, cx - 12 + sw, neckY + 16, cx - 12 + sw * 2, neckY + 27, bone, 2);
pline(b, cx + 10, neckY + 5, cx + 12 + sw, neckY + 16, bone, 2); pline(b, cx + 12 + sw, neckY + 16, cx + 12 + sw * 2, neckY + 27, bone, 2);
px(b, cx - 14 + sw * 2, neckY + 27, bone, 3, 3); px(b, cx + 11 + sw * 2, neckY + 27, bone, 3, 3);
pline(b, cx - 4, py + 5, cx - 5 - kick, py + 18, bone, 2); pline(b, cx - 5 - kick, py + 18, cx - 5 - kick * 1.5, py + 30, bone, 2);
pline(b, cx + 4, py + 5, cx + 5 + kick, py + 18, bone, 2); pline(b, cx + 5 + kick, py + 18, cx + 5 + kick * 1.5, py + 30, bone, 2);
px(b, cx - 8 - kick * 1.5, py + 30, bone, 4, 2); px(b, cx + 4 + kick * 1.5, py + 30, bone, 4, 2);
outlineBlit(ctx, tmp, 0, 0, skinPal.o);
}
render(dt) {
this._dt = Math.min(0.05, dt);
this.t += this._dt;
const t = this.t;
for (const k in this.react) this.react[k] = Math.max(0, this.react[k] - this._dt);
if (this.talk > 0) this.talk = Math.max(0, this.talk - this._dt);
if (this.dead) this.deadT += this._dt;
const ctx = this.ctx, W = this.canvas.width;
ctx.clearRect(0, 0, W, W);
this.drawHead(t);
const m = this.motion(t);
if (this.mode === 'skeleton') {
this.drawGallows(ctx);
const RT = [88, 10], neckY = 62;
const g = this.gctx; g.clearRect(0, 0, 128, 128);
for (let y = RT[1]; y < neckY; y++) px(g, RT[0] - 1 + ((y >> 1) % 2), y, y % 3 ? '#c9a66b' : '#8a6a3e', 2, 1);
const skinF = this.slot('skin')[0];
const pal = skinColors(skinF ? skinF.skin : 'bone', t);
this.drawBody(g, RT[0], neckY, t, pal);
px(g, RT[0] - 3, neckY - 1, '#8a6a3e', 6, 3); px(g, RT[0] - 2, neckY - 1, '#c9a66b', 4, 1);
const hm = Object.assign({}, m, { dx: m.dx, dy: m.dy });
const hx = RT[0], hy = neckY - 14;
const swing = Math.sin(t * 1.3) * (0.06 + this.panic * 0.12) + (this.dead ? Math.sin(this.deadT * 6) * Math.max(0, 0.4 - this.deadT * 0.1) : 0);
const ax = RT[0] + Math.sin(-swing) * (hy - RT[1]) * -1, ay = RT[1] + Math.cos(swing) * (hy - RT[1]);
for (const f of this.slot('aura')) if (f.back) f.back(ctx, this, ax, ay);
for (const f of [...this.slot('aura'), ...this.slot('particles')]) if (f.emit) f.emit(this, ax, ay);
this.updateParticles(ctx, this._dt, true);
for (const f of this.slot('orbit')) f.orbit(g, this, hx, hy, false);
this.renderHeadInto(g, hx, hy, hm);
for (const f of this.slot('orbit')) f.orbit(g, this, hx, hy, true);
ctx.save(); ctx.translate(RT[0], RT[1]); ctx.rotate(swing); ctx.drawImage(this.hang, -RT[0], -RT[1]); ctx.restore();
this.updateParticles(ctx, this._dt, false);
} else {
const hx = 48, hy = 52;
for (const f of this.slot('aura')) if (f.back) f.back(ctx, this, hx, hy);
for (const f of [...this.slot('aura'), ...this.slot('particles')]) if (f.emit) f.emit(this, hx, hy);
this.updateParticles(ctx, this._dt, true);
for (const f of this.slot('orbit')) f.orbit(ctx, this, hx, hy, false);
this.renderHeadInto(ctx, hx, hy, m);
for (const f of this.slot('orbit')) f.orbit(ctx, this, hx, hy, true);
this.updateParticles(ctx, this._dt, false);
}
}
headAnchor() { return this.mode === 'skeleton' ? { x: 88 / 128, y: 30 / 128 } : { x: 0.5, y: 36 / 96 }; }
snapshot() { this.render(0.016); return this.canvas.toDataURL('image/png'); }
}
return {
create: (canvas, opts) => new Inst(canvas, opts),
LIST: F, BY_ID, rollFlourish, resolve, ptext,
get count() { return F.length; },
};
})();
