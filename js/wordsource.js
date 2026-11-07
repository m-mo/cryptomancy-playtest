window.HM = window.HM || {};
HM.WordSource = (function () {
const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let mode = 'local', key = null, sid = null, ready = null;
const meta = { counts: {} };
async function importKey(raw) {
return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['decrypt']);
}
const LEXT = [], LBASE = [], DEXT = [], DBASE = [];
for (let i = 0, b = 3; i < 29; i++) { LEXT[i] = i < 8 || i === 28 ? 0 : (i >> 2) - 1; LBASE[i] = i === 28 ? 258 : b; b += 1 << LEXT[i]; }
for (let i = 0, b = 1; i < 30; i++) { DEXT[i] = i < 4 ? 0 : (i >> 1) - 1; DBASE[i] = b; b += 1 << DEXT[i]; }
function huff(lengths) {
const count = new Uint16Array(16), offs = new Uint16Array(16), symbol = new Uint16Array(lengths.length);
for (const l of lengths) count[l]++;
count[0] = 0;
for (let i = 1; i < 16; i++) offs[i] = offs[i - 1] + count[i - 1];
lengths.forEach((l, s) => { if (l) symbol[offs[l]++] = s; });
return { count, symbol };
}
let FIXED = null;
function inflateRaw(src) {
let pos = 0, buf = 0, cnt = 0, out = new Uint8Array(src.length * 4 + 64), len = 0;
const bits = n => {
while (cnt < n) { if (pos >= src.length) throw new Error('inflate: truncated'); buf |= src[pos++] << cnt; cnt += 8; }
const v = buf & ((1 << n) - 1); buf >>>= n; cnt -= n; return v;
};
const room = n => { if (len + n > out.length) { const o = new Uint8Array(Math.max(out.length * 2, len + n)); o.set(out); out = o; } };
const sym = h => {
for (let l = 1, code = 0, first = 0, index = 0; l < 16; l++) {
code |= bits(1);
const c = h.count[l];
if (code - c < first) return h.symbol[index + code - first];
index += c; first = (first + c) << 1; code <<= 1;
}
throw new Error('inflate: bad code');
};
if (!FIXED) {
const l = new Uint8Array(288).fill(8, 0, 144).fill(9, 144, 256).fill(7, 256, 280).fill(8, 280);
FIXED = [huff(l), huff(new Uint8Array(30).fill(5))];
}
let last;
do {
last = bits(1);
const type = bits(2);
if (type === 0) {
buf = cnt = 0;
if (pos + 4 > src.length) throw new Error('inflate: truncated');
const n = src[pos] | src[pos + 1] << 8;
if (n !== (~(src[pos + 2] | src[pos + 3] << 8) & 0xffff) || pos + 4 + n > src.length) throw new Error('inflate: bad stored block');
room(n); out.set(src.subarray(pos + 4, pos + 4 + n), len); len += n; pos += 4 + n;
continue;
}
let lc, dc;
if (type === 1) [lc, dc] = FIXED;
else if (type === 2) {
const nl = bits(5) + 257, nd = bits(5) + 1, nc = bits(4) + 4, L = new Uint8Array(nl + nd), C = new Uint8Array(19);
for (let i = 0; i < nc; i++) C[[16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15][i]] = bits(3);
const cc = huff(C);
for (let i = 0; i < nl + nd;) {
const s = sym(cc);
if (s < 16) { L[i++] = s; continue; }
const v = s === 16 ? (i ? L[i - 1] : -1) : 0, r = s === 16 ? 3 + bits(2) : s === 17 ? 3 + bits(3) : 11 + bits(7);
if (v < 0 || i + r > nl + nd) throw new Error('inflate: bad lengths');
L.fill(v, i, i + r); i += r;
}
if (!L[256]) throw new Error('inflate: no end code');
lc = huff(L.subarray(0, nl)); dc = huff(L.subarray(nl));
} else throw new Error('inflate: bad block type');
for (;;) {
let s = sym(lc);
if (s < 256) { room(1); out[len++] = s; continue; }
if (s === 256) break;
s -= 257;
if (s >= 29) throw new Error('inflate: bad length');
const n = LBASE[s] + bits(LEXT[s]), d = sym(dc);
if (d >= 30) throw new Error('inflate: bad distance');
const dist = DBASE[d] + bits(DEXT[d]);
if (dist > len) throw new Error('inflate: distance too far');
room(n);
for (let k = 0; k < n; k++, len++) out[len] = out[len - dist];
}
} while (!last);
return out.subarray(0, len);
}
async function inflate(bytes) {
if (typeof DecompressionStream === 'function') {
try {
const ds = new DecompressionStream('deflate-raw');
return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer());
} catch (e) { }
}
return inflateRaw(bytes);
}
function unpack(text, layout, d) {
if (layout === 'json') return JSON.parse(text);
if (layout !== 'cols') throw new Error('unknown word pack layout ' + layout);
if (!text) return [];
const pos = d.pos.split(' '), tags = d.tags.split(' ');
const [ws, ms, ...cols] = text.split('\n'), M = ms.split(' '), H = cols.map(c => c.split('|'));
return ws.split(' ').map((w, i) => ({
w, pos: pos[ALPHA.indexOf(M[i][0])], t: [...M[i].slice(1)].map(c => tags[ALPHA.indexOf(c)]), h: H.map(c => c[i]),
}));
}
async function open(ivB64, ctB64, desc) {
let buf = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(ivB64) }, key, b64(ctB64)));
const codec = desc.c || 'none';
if (codec === 'deflate-raw') buf = await inflate(buf);
else if (codec !== 'none') throw new Error('unknown word pack codec ' + codec);
return unpack(new TextDecoder().decode(buf), desc.f || 'json', desc);
}
async function initLocal() {
const P = HM.WORDPACK;
if (!P) throw new Error('No word pack found (js/words.js missing?)');
if (P.v > 2) throw new Error('Word pack v' + P.v + ' is newer than this client (js/wordsource.js)');
const m = b64(P.m), k = b64(P.k);
key = await importKey(k.map((v, i) => v ^ m[i]));
for (const [t, v] of Object.entries(P.tiers)) meta.counts[t] = v.n;
mode = 'local';
}
async function initRemote() {
const r = await fetch('api/session', { method: 'POST' });
if (!r.ok) throw new Error('session failed');
const j = await r.json();
sid = j.sid; key = await importKey(b64(j.key));
Object.assign(meta.counts, j.counts || {});
mode = 'remote';
}
function init() {
if (ready) return ready;
ready = (async () => {
const wantRemote = HM.REMOTE || (location.protocol.startsWith('http') && !HM.WORDPACK);
if (wantRemote) {
try { await initRemote(); return mode; } catch (e) { console.warn('[words] remote unavailable, using local pack', e); }
}
await initLocal();
return mode;
})();
return ready;
}
async function batch(tier, count, exclude) {
await init();
tier = String(tier);
if (mode === 'remote') {
const r = await fetch(`api/batch?sid=${encodeURIComponent(sid)}&tier=${tier}&count=${count}`);
if (!r.ok) throw new Error('batch failed ' + r.status);
const j = await r.json();
return open(j.iv, j.ct, j);
}
const P = HM.WORDPACK;
const pack = P.tiers[tier] || P.tiers[String(Math.max(...Object.keys(P.tiers).map(Number).filter(t => t <= +tier)))];
if (!pack) return [];
let all = await open(pack.iv, pack.ct, P);
const ex = exclude || new Set();
let recent = new Set();
try { recent = new Set(JSON.parse(localStorage.getItem('hm_recent') || '[]')); } catch (e) { }
let cand = all.filter(e => !ex.has(e.w) && !recent.has(e.w));
if (cand.length < count) cand = cand.concat(all.filter(e => !ex.has(e.w) && recent.has(e.w)));
if (cand.length < count) cand = cand.concat(all.filter(e => ex.has(e.w)));
for (let i = cand.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cand[i], cand[j]] = [cand[j], cand[i]]; }
const out = cand.slice(0, count);
all = null; cand = null;
return out;
}
return {
init, batch,
get mode() { return mode; },
get total() { return Object.values(meta.counts).reduce((a, b) => a + b, 0); },
get tiers() { return Object.keys(meta.counts).map(Number).sort((a, b) => a - b); },
};
})();
