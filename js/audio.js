window.HM = window.HM || {};
HM.Audio = (function () {
let ctx = null, master = null, comp = null;
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
function ensure() {
if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
try {
ctx = new (window.AudioContext || window.webkitAudioContext)();
comp = ctx.createDynamicsCompressor();
master = ctx.createGain();
master.gain.value = HM.config.volume;
master.connect(comp); comp.connect(ctx.destination);
return true;
} catch (e) { return false; }
}
function on() { return HM.config.sound && ensure(); }
function setVolume(v) { if (master) master.gain.value = v; }
function tone(freq, dur, type = 'square', vol = 0.15, slideTo = null, delay = 0) {
if (!on()) return;
const t0 = ctx.currentTime + delay;
const o = ctx.createOscillator();
const g = ctx.createGain();
o.type = type;
o.frequency.setValueAtTime(freq, t0);
if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
g.gain.setValueAtTime(0.0001, t0);
g.gain.exponentialRampToValueAtTime(vol, t0 + 0.005);
g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
o.connect(g); g.connect(master);
o.start(t0); o.stop(t0 + dur + 0.02);
}
function noise(dur, vol = 0.1, filterFreq = 2000, delay = 0, type = 'bandpass') {
if (!on()) return;
const t0 = ctx.currentTime + delay;
const len = Math.floor(ctx.sampleRate * dur);
const buf = ctx.createBuffer(1, len, ctx.sampleRate);
const d = buf.getChannelData(0);
for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
const src = ctx.createBufferSource(); src.buffer = buf;
const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = filterFreq;
const g = ctx.createGain(); g.gain.value = vol;
src.connect(f); f.connect(g); g.connect(master);
src.start(t0);
}
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
return {
unlock: ensure,
setVolume,
key(i = 0) {
const step = PENTA[(i + Math.floor(Math.random() * 2)) % PENTA.length];
tone(midi(64 + step), 0.07, 'square', 0.07);
tone(midi(76 + step), 0.05, 'triangle', 0.05);
},
backspace() { tone(260, 0.12, 'triangle', 0.1, 120); noise(0.05, 0.03, 500); },
reject() { tone(160, 0.08, 'square', 0.06); tone(150, 0.08, 'square', 0.06, null, 0.08); },
hit(n = 1) {
[0, 4, 7, 12].slice(0, 2 + Math.min(n, 2)).forEach((s, i) => tone(midi(72 + s), 0.12, 'square', 0.08, null, i * 0.05));
noise(0.08, 0.04, 6000, 0, 'highpass');
},
flip(i) { tone(midi(79 + (i % 5) * 2), 0.05, 'triangle', 0.06, null, i * 0.045); },
miss() { tone(110, 0.25, 'sawtooth', 0.09, 70); noise(0.15, 0.06, 300, 0, 'lowpass'); },
solve() {
[0, 4, 7, 12, 16, 19, 24].forEach((s, i) => tone(midi(67 + s), 0.16, 'square', 0.07, null, i * 0.06));
[0, 7, 12].forEach((s, i) => tone(midi(55 + s), 0.5, 'triangle', 0.06, null, 0.4 + i * 0.02));
},
talk(i) { tone(140 + ((i * 37) % 5) * 22, 0.045, 'square', 0.035, 110); },
tick(urgent) { tone(urgent ? 1400 : 1000, 0.03, 'square', 0.05); },
perkHover() { tone(midi(84), 0.05, 'triangle', 0.06); tone(midi(91), 0.06, 'triangle', 0.04, null, 0.04); },
perkUse() {
[0, 7, 12, 19, 24, 31].forEach((s, i) => tone(midi(72 + s), 0.1, 'triangle', 0.07, null, i * 0.035));
noise(0.3, 0.05, 8000, 0, 'highpass');
},
fire(level) { noise(0.4 + level * 0.2, 0.12 + level * 0.05, 900, 0, 'lowpass'); tone(80, 0.5, 'sawtooth', 0.08, 40); },
explode() { noise(0.9, 0.3, 400, 0, 'lowpass'); tone(60, 0.8, 'sine', 0.25, 30); noise(0.4, 0.12, 5000, 0.02, 'highpass'); },
laugh() { [0, 1, 2, 3].forEach(i => { tone(300 + (i % 2) * 40, 0.08, 'square', 0.05, 200, i * 0.13); }); },
gameOver() {
[12, 7, 3, 0, -5].forEach((s, i) => tone(midi(60 + s), 0.35, 'square', 0.08, null, i * 0.22));
tone(55, 1.6, 'sawtooth', 0.08, 30, 1.1);
},
draft() { [0, 5, 9, 12].forEach((s, i) => tone(midi(69 + s), 0.18, 'triangle', 0.07, null, i * 0.09)); },
select() { tone(midi(76), 0.06, 'square', 0.06); tone(midi(83), 0.08, 'square', 0.06, null, 0.06); },
flourish() { [0, 12, 7, 19].forEach((s, i) => tone(midi(84 + s), 0.08, 'triangle', 0.05, null, i * 0.05)); },
freeze() { [24, 19, 16, 12].forEach((s, i) => tone(midi(72 + s), 0.15, 'sine', 0.06, null, i * 0.05)); },
};
})();
