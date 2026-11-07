window.HM = window.HM || {};
HM.WordSource = (function () {
const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
let mode = 'local', key = null, sid = null, ready = null;
const meta = { counts: {} };
async function importKey(raw) {
return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['decrypt']);
}
async function decrypt(ivB64, ctB64) {
const buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(ivB64) }, key, b64(ctB64));
return JSON.parse(new TextDecoder().decode(buf));
}
async function initLocal() {
const P = HM.WORDPACK;
if (!P) throw new Error('No word pack found (js/words.js missing?)');
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
return decrypt(j.iv, j.ct);
}
const P = HM.WORDPACK;
const pack = P.tiers[tier] || P.tiers[String(Math.max(...Object.keys(P.tiers).map(Number).filter(t => t <= +tier)))];
if (!pack) return [];
let all = await decrypt(pack.iv, pack.ct);
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
