window.HM = window.HM || {};
HM.UI = (function () {
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const bus = HM.bus, Game = HM.Game, FX = HM.FX, Au = HM.Audio;
const cfg = () => HM.config;
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const fmt = n => Math.round(n).toLocaleString('en-US');
const TIER_COLORS = ['#5a7a8a', '#4bc292', '#009dff', '#ff9a00', '#b26cbb', '#fe5f55', '#f5b244', '#8a8a9a', '#f72585', '#d00000', '#ffffff'];
const ICONS = {
reveal: ['...KKK...', '.KKWWWKK.', 'KWWWbWWWK', 'KWWbKbWWK', 'KWWWbWWWK', '.KKWWWKK.', '...KKK...'],
time: ['KKKKKKK', 'KyyyyyK', '.KyyyK.', '..KyK..', '.K.y.K.', 'K..y..K', 'KyyyyyK', 'KKKKKKK'],
shield: ['KKKKKKK', 'KcWcccK', 'KcWcccK', 'KcccccK', '.KcccK.', '..KcK..', '...K...'],
info: ['.KKKKKK.', 'KwwwwwwK', '.KwKKwK.', '.KwwwwK.', '.KwKKwK.', 'KwwwwwwK', '.KKKKKK.'],
chaos: ['KKKKKKK', 'KWWWWrK', 'KWWWWWK', 'KWWrWWK', 'KWWWWWK', 'KrWWWWK', 'KKKKKKK'],
score: ['.KKKKK.', 'KyyYyyK', 'KyKKKyK', 'KyKyyyK', 'KyKKKyK', 'KyyyyyK', '.KKKKK.'],
};
const ICOL = { K: '#120a14', W: '#ffffff', w: '#f3e6c4', b: '#3a86ff', y: '#f5b244', Y: '#ffe08a', c: '#4cc9f0', r: '#e63946' };
const iconCache = {};
function iconURL(fam) {
if (iconCache[fam]) return iconCache[fam];
const rows = ICONS[fam] || ICONS.info;
const w = Math.max(...rows.map(r => r.length)), h = rows.length, S = 11;
const c = document.createElement('canvas'); c.width = S; c.height = S;
const x = c.getContext('2d');
const ox = Math.floor((S - w) / 2), oy = Math.floor((S - h) / 2);
rows.forEach((r, y) => [...r].forEach((ch, i) => { if (ch !== '.') { x.fillStyle = ICOL[ch]; x.fillRect(ox + i, oy + y, 1, 1); } }));
return (iconCache[fam] = c.toDataURL());
}
function perkCard(p, key, opts = {}) {
const card = el('div', 'perk-card ' + (p ? p.rarity : 'empty'));
if (!p) { card.innerHTML = `<div></div><div class="pname">EMPTY</div><div></div>` + (key ? `<div class="pkey">${key}</div>` : ''); return card; }
card.style.setProperty('--rar', `var(--rar-${p.rarity})`);
card.style.setProperty('--tilt', ((key || 1) % 2 ? -2 : 2) + 'deg');
card.style.setProperty('--delay', (-(key || 0) * 0.7) + 's');
card.innerHTML = `<img class="ico" src="${iconURL(p.fam)}" alt="">` +
`<div class="pname">${p.name.toUpperCase()}</div>` +
(opts.desc ? `<div class="pdesc">${p.desc}</div><div class="prar">${HM.RARITY[p.rarity].name.toUpperCase()}</div>` : '') +
(p.lvl ? `<div class="plvl">${HM.romanLvl(p.lvl)}</div>` : '') +
(key ? `<div class="pkey">${key}</div>` : '');
return card;
}
const S = {
inspect: -1, inspectTimer: 0, shownScore: 0, targetCursor: 0, solveAt: 0, avatar: null,
ticker: { x: 0, queue: [], entry: null },
keyFlames: 0, lastTimerLow: false, draftInspect: -1, replaceInspect: -1,
};
function buildKeyboard() {
const kb = $('#keyboard'); kb.innerHTML = '';
['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].forEach((row, ri) => {
const r = el('div', 'krow');
if (ri === 2) { const b = el('button', 'key wide', 'DEL'); b.dataset.k = 'Backspace'; r.appendChild(b); }
for (const ch of row) { const b = el('button', 'key', ch); b.dataset.k = ch; r.appendChild(b); }
if (ri === 2) { const b = el('button', 'key wide', 'CLEAR'); b.dataset.k = 'Clear'; r.appendChild(b); }
kb.appendChild(r);
});
const r = el('div', 'krow'); const sp = el('button', 'key space', 'SPACE = SUBMIT'); sp.dataset.k = ' '; r.appendChild(sp); kb.appendChild(r);
kb.addEventListener('pointerdown', e => {
const b = e.target.closest('.key'); if (!b) return;
e.preventDefault();
HM.Main.virtualKey(b.dataset.k);
});
}
function setKeyStates(states) {
$$('#keyboard .key').forEach(k => {
const c = k.dataset.k; if (c.length !== 1 || c === ' ') return;
k.classList.remove('hit', 'partial', 'miss', 'elim', 'dowse');
if (states[c]) k.classList.add(states[c]);
});
}
function flashKey(k) {
const b = document.querySelector(`#keyboard .key[data-k="${k === ' ' ? ' ' : k}"]`);
if (!b) return; b.classList.add('down'); setTimeout(() => b.classList.remove('down'), 90);
}
function sizeTiles(len) {
const avail = Math.max(200, $('#stage').clientWidth - 24);
const ts = Math.max(24, Math.floor(Math.min(64, avail / (len * 1.16))));
$('#tiles').style.setProperty('--ts', ts + 'px');
const bs = Math.max(14, Math.min(26, Math.floor(avail / (len * 1.2))));
$('#buffer').style.setProperty('--bs', bs + 'px');
}
function buildTiles(word) {
const wrap = $('#tiles'); wrap.innerHTML = ''; wrap.classList.remove('xray');
sizeTiles(word.length);
[...word].forEach((ch, i) => {
const t = el('div', 'tile');
t.style.setProperty('--tilt', ((i % 2 ? 1 : -1) * (Math.random() < 0.25 ? -1 : 1) * (4.6 + Math.random() * 0.8)).toFixed(1) + 'deg');
t.style.setProperty('--i', i);
t.innerHTML = `<div class="tile-bob"><div class="tile-in"><div class="tile-back" data-l="${ch}"></div><div class="tile-face">${ch}</div></div></div>`;
t.addEventListener('pointerdown', () => { if (Game.targeting) Game.targetPick(i); });
wrap.appendChild(t);
});
}
function revealTiles(positions, cls) {
const tiles = $$('#tiles .tile');
positions.forEach((i, k) => {
const t = tiles[i]; if (!t) return;
setTimeout(() => {
if (!t.isConnected) return;
t.classList.add('rev', 'pop'); if (cls) t.classList.add(cls);
Au.flip(k);
const c = FX.centerOf(t);
FX.burst(c.x, c.y, 10, { speed: 260, size: 5, life: 0.5 });
setTimeout(() => t.classList.remove('pop'), 600);
}, k * 55);
});
}
function shiverHidden() {
$$('#tiles .tile:not(.rev)').forEach((t, i) => {
t.classList.remove('shiver'); void t.offsetWidth;
setTimeout(() => t.classList.add('shiver'), i * 20);
setTimeout(() => t.classList.remove('shiver'), 400 + i * 20);
});
}
function renderBuffer(buf, len) {
const b = $('#buffer'); b.innerHTML = '';
for (const ch of buf) b.appendChild(el('div', 'bchar', ch));
b.appendChild(el('div', 'caret'));
const m = $('#buffer-mode');
m.className = '';
const letters = HM.feature('LetterGuesses');
if (!buf.length) {
if (letters) m.textContent = `TYPE A LETTER OR THE ${len}-LETTER WORD`;
else { m.classList.add('hint'); m.innerHTML = `<span class="len-num">${len}</span>-LETTER WORD`; }
}
else if (letters && buf.length === 1 && len !== 1) { m.textContent = 'LETTER GUESS · SPACE'; m.classList.add('ok'); }
else if (buf.length === len) { m.textContent = 'WORD GUESS · SPACE'; m.classList.add('ok'); }
else { m.textContent = `${buf.length}/${len}`; }
}
function bufferAnchor() {
const chars = $$('#buffer .bchar');
const target = chars.length ? chars[chars.length - 1] : $('#buffer .caret');
return FX.centerOf(target || $('#buffer'));
}
function tickerItem(it, fresh) {
const d = el('div', 'tk ' + it.kind + (fresh ? ' fresh' : ''));
d.textContent = it.text;
return d;
}
function quip(kind, chance = 1) {
if (!S.ticker.entry || Math.random() > chance) return;
const now = performance.now();
if (now - (S.lastQuip || 0) < 2500) return;
S.lastQuip = now;
tickerInject({ text: HM.Hints.quip(kind), kind: 'quip' });
}
function tickerNext() {
const T = S.ticker;
if (!T.queue.length) T.queue = HM.Hints.buildLoop(T.entry);
return T.queue.shift();
}
function tickerFill() {
const track = $('#ticker-track'), view = $('#ticker-view');
let guard = 0;
while (track.scrollWidth + S.ticker.x < view.clientWidth * 2 && guard++ < 30) track.appendChild(tickerItem(tickerNext()));
}
function tickerReset(entry) {
const T = S.ticker; T.entry = entry; T.x = 0; T.queue = [];
const track = $('#ticker-track'); track.innerHTML = ''; track.style.transform = 'translateX(0)';
tickerFill();
}
function tickerInject(it) {
const track = $('#ticker-track'), view = $('#ticker-view');
const node = tickerItem(it, true);
const kids = [...track.children];
const after = kids.find(k => k.offsetLeft + S.ticker.x > view.clientWidth * 0.75);
if (after) track.insertBefore(node, after); else track.appendChild(node);
}
function tickerUpdate(dt) {
const T = S.ticker; if (!T.entry) return;
const track = $('#ticker-track');
T.x -= (cfg().tickerSpeed || 70) * dt;
const first = track.firstElementChild;
if (first && T.x + first.offsetWidth < 0) { T.x += first.offsetWidth; first.remove(); }
tickerFill();
track.style.transform = `translateX(${Math.round(T.x)}px)`;
}
const SP = { queue: [], busy: false, timer: null, typer: null };
function placeSpeech() {
const sp = $('#speech'), av = $('#avatar'), ce = $('#center');
if (!sp || !av || !S.avatar) return;
const a = av.getBoundingClientRect(), c = ce.getBoundingClientRect(), h = S.avatar.headAnchor();
sp.style.left = Math.round(a.left - c.left + a.width * h.x) + 'px';
sp.style.top = Math.round(a.top - c.top + a.height * h.y) + 'px';
}
function say(text, opts = {}) {
SP.queue.push({ text, tag: opts.tag || '', taunt: !!opts.taunt, hold: opts.hold });
if (!SP.busy) nextSpeech();
}
function nextSpeech() {
const sp = $('#speech');
const item = SP.queue.shift();
if (!item) { SP.busy = false; return; }
SP.busy = true;
clearTimeout(SP.timer); clearInterval(SP.typer);
sp.className = 'speech' + (item.taunt ? ' taunt' : '');
void sp.offsetWidth;
sp.querySelector('.sp-tag').textContent = item.tag;
const out = sp.querySelector('.sp-text'); out.textContent = '';
placeSpeech();
let i = 0;
const cps = 38;
S.avatar.talk = item.text.length / cps + 0.2;
SP.typer = setInterval(() => {
i = Math.min(item.text.length, i + 1);
out.textContent = item.text.slice(0, i);
if (i % 2 === 0 && item.text[i - 1] !== ' ') Au.talk(i);
if (i >= item.text.length) {
clearInterval(SP.typer);
const hold = item.hold != null ? item.hold : 2600 + item.text.length * 35;
SP.timer = setTimeout(() => {
if (SP.queue.length) { nextSpeech(); return; }
sp.classList.add('out');
SP.timer = setTimeout(() => { sp.classList.add('hidden'); SP.busy = false; if (SP.queue.length) nextSpeech(); }, 300);
}, SP.queue.length ? 900 : hold);
}
}, 1000 / cps);
}
function hushSpeech() {
SP.queue.length = 0; clearTimeout(SP.timer); clearInterval(SP.typer); SP.busy = false;
if (S.avatar) S.avatar.talk = 0;
const sp = $('#speech'); if (sp) sp.className = 'speech hidden';
}
function buildClueBox(r) {
const list = $('#cb-list'); list.innerHTML = '';
for (let i = 0; i < r.clueOrder.length; i++) {
const it = el('div', 'cb-item locked', `<span class="cb-n">${i + 1}</span><span class="cb-t">LOCKED</span>`);
list.appendChild(it);
}
if (r.cluesShown) {
const first = list.firstElementChild;
first.className = 'cb-item open';
first.innerHTML = `<span class="cb-n">1</span><span class="cb-t">${r.entry.h[r.clueOrder[0]]}</span>`;
}
}
function clueCountdown() {
const r = Game.G.round; if (!r) return;
const nx = $('#cb-next');
if (r.cluesShown >= r.clueOrder.length) { nx.textContent = 'ALL SHOWN'; return; }
const secs = Game.nextClueIn();
nx.textContent = `NEXT IN ${Math.ceil(secs)}s`;
const slot = $$('#cb-list .cb-item')[r.cluesShown];
if (slot) { const t = slot.querySelector('.cb-t'); const txt = `UNLOCKS IN ${Math.ceil(secs)}s`; if (t.textContent !== txt) t.textContent = txt; slot.classList.add('next'); }
}
function renderBelt(fresh) {
const belt = $('#belt'); belt.innerHTML = '';
const run = Game.G.run; if (!run) return;
run.belt.forEach((id, i) => {
const p = id ? HM.PERK_BY_ID[id] : null;
const c = perkCard(p, i + 1);
if (fresh === i) c.classList.add('fresh');
if (S.inspect === i) c.classList.add('inspect');
c.addEventListener('pointerdown', e => { e.preventDefault(); HM.Main.perkKey(i); });
belt.appendChild(c);
});
}
function showTooltip(slot) {
const tt = $('#tooltip');
const run = Game.G.run; const id = run && run.belt[slot];
if (!id) { hideTooltip(); return; }
const p = HM.PERK_BY_ID[id];
const can = p.can ? p.can(Game.api) : true;
tt.innerHTML = `<div class="tt-name">${p.name.toUpperCase()} ${p.lvl ? HM.romanLvl(p.lvl) : ''}</div>` +
`<div class="tt-meta">${HM.RARITY[p.rarity].name.toUpperCase()} · ${HM.PERK_FAMILIES[p.fam].name.toUpperCase()}</div>` +
`<div class="tt-desc">${p.desc}</div>` +
(can === true ? `<div class="tt-cta">PRESS ${slot + 1} AGAIN TO USE</div>` : `<div class="tt-cta bad">${can}</div>`);
tt.classList.remove('hidden');
const card = $$('#belt .perk-card')[slot];
const stage = $('#scr-game').getBoundingClientRect();
if (card) {
const r = card.getBoundingClientRect();
tt.style.left = Math.max(8, r.left - stage.left + r.width / 2 - 130) + 'px';
tt.style.top = (r.bottom - stage.top + 20) + 'px';
}
S.inspect = slot; S.inspectTimer = 6;
$$('#belt .perk-card').forEach((c, i) => c.classList.toggle('inspect', i === slot));
}
function hideTooltip() {
$('#tooltip').classList.add('hidden'); S.inspect = -1;
$$('#belt .perk-card').forEach(c => c.classList.remove('inspect'));
}
function toast(text, kind = '') {
const t = el('div', 'toast ' + kind, text);
$('#toasts').appendChild(t);
setTimeout(() => t.remove(), 3000);
while ($('#toasts').children.length > 5) $('#toasts').firstChild.remove();
}
function hud() {
const run = Game.G.run, r = Game.G.round; if (!run || !r) return;
const ti = Game.tierInfo(run.level);
$('#tier-label').textContent = ti.endless ? `ENDLESS ${ti.endless}` : `TIER ${ti.tier}`;
const inTier = ((run.level - 1) % cfg().levelsPerTier) + 1;
$('#level-label').innerHTML = `LEVEL ${run.level} <span class="dim">· ${inTier}/${cfg().levelsPerTier}</span>`;
$('#streak').textContent = run.streak;
$('#flair').textContent = run.flourishes.length;
$('#solved-count').textContent = run.solved.filter(s => s.method !== 'skip').length;
$('#firsttries').textContent = run.firstTries || 0;
renderAvgSolve(run);
$('#hc-badge').classList.toggle('hidden', !run.hardcore);
updateChipsMult();
}
const SOLVE_KEY = 'hm_solvetime';
function solveTotals() { try { const t = JSON.parse(localStorage.getItem(SOLVE_KEY) || '{}'); return { n: +t.n || 0, total: +t.total || 0 }; } catch (e) { return { n: 0, total: 0 }; } }
function recordSolveTime(secs) {
if (!(secs >= 0)) return;
const t = solveTotals(); t.n += 1; t.total += secs;
try { localStorage.setItem(SOLVE_KEY, JSON.stringify(t)); } catch (e) { }
}
function fmtSecs(s) { return s == null ? '--' : (s < 100 ? s.toFixed(1) : Math.round(s)) + 's'; }
function runAvgSolve(run) {
const done = (run && run.solved || []).filter(s => s.method !== 'skip' && s.secs >= 0);
return done.length ? done.reduce((a, s) => a + s.secs, 0) / done.length : null;
}
function renderAvgSolve(run) {
const el = $('#avg-solve'); if (!el) return;
el.textContent = fmtSecs(runAvgSolve(run));
const t = solveTotals(); $('#avg-solve-all').textContent = fmtSecs(t.n ? t.total / t.n : null);
}
function liveMult() {
const r = Game.G.round, c = cfg();
let m = (1 + r.multAdd + Math.floor(Math.max(0, r.timeLeft) / 10) * c.multPerTenSecondsLeft) * r.multX;
if (Game.G.run && Game.G.run.hardcore) m *= 1.5;
return Math.round(m * 10) / 10;
}
function updateChipsMult() {
const r = Game.G.round; if (!r) return;
const base = r.len * cfg().chipsPerLetter * (r.tier + r.endless);
$('#chips').textContent = fmt(base + r.chips + r.chipsBonus);
$('#mult').textContent = liveMult();
}
function bump(sel) { const e = $(sel); if (!e) return; e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump'); }
function timerUpdate() {
const r = Game.G.round; if (!r) return;
const t = Math.max(0, r.timeLeft);
const low = t <= cfg().lowTimeWarning;
const timer = $('#timer');
timer.textContent = low ? t.toFixed(1) : Math.ceil(t);
timer.classList.toggle('low', low && !r.freeze);
timer.classList.toggle('frozen', r.freeze > 0);
const fill = $('#timer-fill');
fill.style.width = Math.min(100, (t / r.timeMax) * 100) + '%';
fill.classList.toggle('low', low);
const mods = [];
if (r.freeze > 0) mods.push(`<div class="mod freeze">FROZEN ${r.freeze.toFixed(1)}</div>`);
if (r.slow > 0) mods.push(`<div class="mod slow">SLOW ${r.slow.toFixed(0)}</div>`);
if (r.reserve > 0) mods.push(`<div class="mod armed">+${Math.round(r.reserve)}s BANKED</div>`);
if (r.shield > 0) mods.push(`<div class="mod shield">SHIELD ${r.shield > 99 ? '∞' : r.shield}</div>`);
for (const [k, v] of Object.entries(r.armed)) if (v && v !== 'busted') mods.push(`<div class="mod armed">${k.toUpperCase()}</div>`);
const html = mods.join('');
if ($('#timer-mods').innerHTML !== html) $('#timer-mods').innerHTML = html;
const panic = Game.G.phase === 'playing' && low ? 1 - t / cfg().lowTimeWarning : 0;
if (S.avatar) S.avatar.panic = panic;
HM.BG.setPanic(panic);
if (low !== S.lastTimerLow) { S.lastTimerLow = low; }
}
function kpsUpdate(dt) {
const k = Game.kps(), lvl = Game.kpsLevel(k);
$('#kps').textContent = k.toFixed(1);
$('#kps-fill').style.width = Math.min(100, k / cfg().kpsInferno * 100) + '%';
const p = $('#kps-panel');
p.classList.toggle('hot', lvl === 1); p.classList.toggle('fire', lvl === 2); p.classList.toggle('inferno', lvl >= 3);
const run = Game.G.run;
if (run) { run.bestKps = Math.max(run.bestKps, k); $('#kps-best').textContent = run.bestKps.toFixed(1); }
if (lvl >= 2 && $('#scr-game').classList.contains('active')) {
S.keyFlames += dt;
if (S.keyFlames > 0.033) { S.keyFlames = 0; FX.flames(p.getBoundingClientRect(), lvl); }
}
}
function wire() {
bus.on('run:start', run => {
renderAvgSolve(run); $('#solve-panel').classList.remove('faster', 'slower');
S.shownScore = 0; $('#score').textContent = '0';
$('#tiles').innerHTML = ''; $('#cb-list').innerHTML = ''; $('#cb-next').textContent = ''; $('#ticker-track').innerHTML = ''; S.ticker.entry = null;
$('#pinned').innerHTML = ''; $('#buffer').innerHTML = ''; $('#buffer-mode').textContent = '';
$('#chips').textContent = '0'; $('#mult').textContent = '1'; setKeyStates({});
S.avatar.setMode(run.avatar); S.avatar.setFlourishes([]); S.avatar.dead = false; hushSpeech();
renderBelt();
});
bus.on('round:start', r => {
buildTiles(r.word);
tickerReset(r.entry);
hushSpeech();
if (r.cluesShown) { const n = r.clueOrder.length; setTimeout(() => { if (Game.G.round === r && Game.G.phase === 'playing') say(r.entry.h[r.clueOrder[0]], { tag: `CLUE 1/${n}` }); }, 650); }
if (S.tierQuip) { S.tierQuip = false; S.lastQuip = 0; quip('tier'); }
buildClueBox(r);
$('#pinned').innerHTML = '';
$('#jumble').classList.add('hidden'); clearTimeout(S.jumbleTimer);
setKeyStates({});
renderBuffer('', r.len);
hud(); hideTooltip(); renderBelt();
HM.BG.setTier(r.endless ? 10 : r.tier - 1);
$('#solve-banner').classList.add('hidden');
$$('#tiles .tile').forEach((t, i) => { t.style.opacity = 0; setTimeout(() => { t.style.opacity = 1; t.classList.add('pop'); setTimeout(() => t.classList.remove('pop'), 500); Au.flip(i); }, 40 * i); });
});
bus.on('buffer', d => {
const r = Game.G.round; if (!r) return;
renderBuffer(d.buffer, r.len);
if (d.added) {
const a = bufferAnchor();
FX.pillar(a.x, a.y);
Au.key(d.buffer.length);
S.avatar.hit('key');
flashKey(d.added);
} else if (d.removed != null && !d.submitted) {
const a = bufferAnchor();
FX.sink(a.x + 14, a.y);
Au.backspace();
S.avatar.hit('backspace');
flashKey('Backspace');
}
});
bus.on('buffer:full', () => { $('#buffer').classList.remove('reject'); void $('#buffer').offsetWidth; $('#buffer').classList.add('reject'); Au.reject(); });
bus.on('reject', d => {
const b = $('#buffer'); b.classList.remove('reject'); void b.offsetWidth; b.classList.add('reject');
Au.reject();
const m = $('#buffer-mode');
m.className = 'bad';
m.textContent = d.reason === 'length' ? (d.letters ? `NEED 1 LETTER OR ${d.need} — YOU HAVE ${d.have}` : `ALL ${d.need} LETTERS — YOU HAVE ${d.have}`) : d.reason === 'repeat' ? `ALREADY TRIED "${d.letter.toUpperCase()}" (FREE)` :
d.reason === 'known' ? `"${d.letter.toUpperCase()}" IS ALREADY SHOWING (FREE)` : d.reason === 'eliminated' ? `"${d.letter.toUpperCase()}" WAS CROSSED OUT (FREE)` : 'TYPE SOMETHING FIRST';
});
bus.on('reveal', d => {
revealTiles(d.positions, null);
setKeyStates(d.states);
updateChipsMult();
if (d.chips && HM.feature('Scoring')) { bump('#chips'); const c = FX.centerOf($('#chips')); FX.floatText('+' + d.chips, c.x, c.y - 20, 'chips'); }
if (d.source === 'perk') { S.avatar.hit('perk'); }
});
bus.on('hit', d => {
Au.hit(d.count); S.avatar.hit('hit'); HM.BG.pulse(0.3); quip('hit', 0.25);
const a = FX.centerOf($('#tiles'));
FX.ring(a.x, a.y, '#4bc292', 5, 0.4);
});
bus.on('miss', d => {
setKeyStates(d.states);
if (d.shielded) { Au.select(); toast('SHIELD BLOCKED IT', 'good'); }
else {
Au.miss(); S.avatar.hit('miss'); FX.addShake(d.penalty ? 7 : 3); FX.flash('rgba(224,65,79,0.18)', 0.25);
if (d.penalty) { const c = FX.centerOf($('#timer')); FX.floatText('-' + d.penalty + 's', c.x, c.y + 30, 'bad'); }
}
shiverHidden();
updateChipsMult();
if (d.kind === 'letter') quip('miss', 0.6);
});
bus.on('wordmiss', d => {
quip('wordmiss', 0.4);
if (d.positions.length) toast(`${d.positions.length} IN THE RIGHT SPOT`, 'good');
shiverHidden();
});
bus.on('clue', d => {
const slot = $$('#cb-list .cb-item')[d.n - 1];
if (slot) {
slot.className = 'cb-item open fresh';
slot.innerHTML = `<span class="cb-n">${d.n}</span><span class="cb-t">${d.text}</span>`;
const c = FX.centerOf(slot); FX.burst(c.x - c.r.width / 2 + 14, c.y, 14, { colors: ['#ffd166', '#fff3b0'], speed: 220, size: 4 });
}
if (d.n > 1) { Au.perkHover(); say(d.text, { tag: `CLUE ${d.n}/${d.total}` }); }
});
bus.on('tick', d => { if (d.left === 10) { S.lastQuip = 0; quip('low'); } Au.tick(d.left <= 3); if (d.left <= 3) FX.flash('rgba(224,65,79,0.10)', 0.2); });
bus.on('pinned', d => { $('#pinned').innerHTML = d.pinned.map(t => `<div class="pin">${t}</div>`).join(''); });
bus.on('letters', d => setKeyStates(d.states));
bus.on('jumble', j => {
const e = $('#jumble'); e.textContent = j.letters.join(' ').toUpperCase(); e.classList.remove('hidden');
clearTimeout(S.jumbleTimer);
if (isFinite(j.until)) S.jumbleTimer = setTimeout(() => e.classList.add('hidden'), (j.until - performance.now() / 1000) * 1000);
});
bus.on('xray', d => { const t = $('#tiles'); t.classList.add('xray'); setTimeout(() => t.classList.remove('xray'), d.secs * 1000); FX.flash('rgba(160,255,255,0.15)', d.secs); });
bus.on('time:add', d => {
const c = FX.centerOf($('#timer'));
FX.floatText((d.secs > 0 ? '+' : '') + d.secs + 's', c.x, c.y - 20, d.secs > 0 ? 'gold' : 'bad');
if (d.secs > 0) FX.burst(c.x, c.y, 20, { colors: ['#ffd166', '#fff3b0'] });
});
bus.on('time:bank', d => { setTimeout(() => toast(`FIRST-TRY BONUS: +${d.secs}s BANKED`, 'gold'), 600); });
bus.on('reserve:used', d => {
const c = FX.centerOf($('#timer'));
FX.floatText(`+${Math.round(d.secs)}s BONUS TIME!`, c.x, c.y - 20, 'gold'); FX.burst(c.x, c.y, 30, { colors: ['#ffd166', '#fff3b0'] });
FX.flash('rgba(255,209,102,0.3)', 0.4); Au.perkUse(); quip('perk', 1);
});
bus.on('time:freeze', () => { Au.freeze(); FX.flash('rgba(155,231,255,0.25)', 0.4); });
bus.on('time:slow', () => { Au.freeze(); });
bus.on('shield', () => Au.select());
bus.on('mult:change', () => { updateChipsMult(); bump('#mult'); });
bus.on('chips:change', () => { updateChipsMult(); bump('#chips'); });
bus.on('toast', d => toast(d.text, d.kind));
bus.on('perk:proc', d => { toast(d.text, d.bad ? 'bad' : 'gold'); if (!d.bad) { FX.flash('rgba(255,209,102,0.3)', 0.4); Au.perkUse(); } });
bus.on('perk:used', d => {
Au.perkUse(); hideTooltip(); quip('perk', 0.7);
const card = $$('#belt .perk-card')[d.slot];
if (card) { card.classList.add('used'); const c = FX.centerOf(card); FX.burst(c.x, c.y, 40, { colors: [HM.PERK_FAMILIES[d.perk.fam].color, '#fff'] }); FX.ring(c.x, c.y, HM.PERK_FAMILIES[d.perk.fam].color); }
toast(`USED ${d.perk.name.toUpperCase()}${d.perk.lvl ? ' ' + HM.romanLvl(d.perk.lvl) : ''}`, 'gold');
});
bus.on('perk:denied', d => {
Au.reject();
const card = $$('#belt .perk-card')[d.slot];
if (card) { card.classList.remove('denied'); void card.offsetWidth; card.classList.add('denied'); }
toast(String(d.reason).toUpperCase(), 'bad');
});
bus.on('belt', d => setTimeout(() => renderBelt(d.added), 300));
bus.on('target:start', () => {
const tiles = $$('#tiles .tile');
S.targetCursor = tiles.findIndex(t => !t.classList.contains('rev'));
tiles.forEach(t => { if (!t.classList.contains('rev')) t.classList.add('target'); });
moveTarget(0);
toast('SPOTLIGHT: ← → THEN SPACE (OR CLICK A TILE)', 'gold');
});
bus.on('target:end', () => $$('#tiles .tile').forEach(t => t.classList.remove('target', 'cursor')));
bus.on('solve', d => {
S.solveAt = performance.now();
hushSpeech();
const r = Game.G.round, run = Game.G.run;
if (d.method !== 'skip' && d.rec) {
const prev = runAvgSolve({ solved: run.solved.filter(x => x !== d.rec) });
recordSolveTime(d.rec.secs); renderAvgSolve(run);
const p = $('#solve-panel'); p.classList.remove('faster', 'slower');
if (prev != null) { void p.offsetWidth; p.classList.add(d.rec.secs <= prev ? 'faster' : 'slower'); setTimeout(() => p.classList.remove('faster', 'slower'), 1600); }
}
if (d.method === 'word' && d.hidden) $$('#tiles .tile:not(.rev)').forEach(t => t.classList.add('blind'));
Au.solve(); S.avatar.hit('solve'); HM.BG.pulse(1.2);
const tc = FX.centerOf($('#tiles'));
FX.confetti(d.method === 'skip' ? 30 : 90);
$$('#tiles .tile').forEach((t, i) => setTimeout(() => { if (!t.isConnected) return; const c = FX.centerOf(t); FX.pillar(c.x, c.y); }, Math.min(i, 20) * 40));
if (d.kpsLevel >= 2) {
const kc = FX.centerOf($('#kps-panel'));
setTimeout(() => {
FX.explode(kc.x, kc.y, d.kpsLevel - 1);
d.kpsLevel >= 3 ? Au.explode() : Au.fire(1);
FX.floatText(d.kpsLevel >= 3 ? `INFERNO ${d.kps.toFixed(1)} KPS!` : `ON FIRE ${d.kps.toFixed(1)} KPS!`, kc.x + 120, kc.y, 'huge');
}, 250);
} else if (d.kpsLevel === 1) { const kc = FX.centerOf($('#kps-panel')); FX.floatText('HOT HANDS', kc.x + 80, kc.y, 'gold'); }
const ban = $('#solve-banner');
const title = d.method === 'skip' ? 'SKIPPED' : d.firstTry ? 'FIRST TRY!' : d.method === 'word' ? 'NAILED IT!' : 'SOLVED!';
if (d.firstTry) {
FX.confetti(120); FX.flash('rgba(255,209,102,0.35)', 0.4); Au.perkUse();
const tc2 = FX.centerOf($('#tiles')); FX.ring(tc2.x, tc2.y, '#ffd166', 8, 0.7);
}
const scoring = HM.feature('Scoring');
const kpsTag = ['', 'HOT HANDS', 'ON FIRE', 'INFERNO'][d.kpsLevel];
const statLine = d.method === 'skip' ? '' : `${d.rec.secs}s · ${d.kps.toFixed(1)} KPS${d.rec.wrong ? ` · ${d.rec.wrong} miss${d.rec.wrong > 1 ? 'es' : ''}` : ' · FLAWLESS'}`;
const notes = scoring ? d.notes.join(' · ') : [kpsTag, d.bonus ? `+${d.bonus}s BANKED FOR THE NEXT WORD` : ''].filter(Boolean).join(' · ');
const flair = d.tierClear && d.flourishes.length ? `<div class="sb-flair">TIER CLEARED · NEW FLAIR: ${d.flourishes.map(id => (HM.Avatar.BY_ID[id] || {}).name || id).join(' + ').toUpperCase()}</div>` : (d.tierClear ? '<div class="sb-flair">TIER CLEARED</div>' : '');
ban.innerHTML = `<div class="sb-title">${title}</div>` +
(scoring && d.method !== 'skip' ? `<div class="sb-score"><span class="chips">${fmt(d.chips)}</span><span>X</span><span class="mult">${d.mult}</span></div><div class="sb-total">+${fmt(d.score)}</div>` : '') +
(!scoring && statLine ? `<div class="sb-stat">${statLine}</div>` : '') +
(notes ? `<div class="sb-notes">${notes}</div>` : '') + flair + `<div class="sb-hint">SPACE TO CONTINUE</div>`;
ban.classList.remove('hidden');
ban.style.animation = 'none'; void ban.offsetWidth; ban.style.animation = '';
d.flourishes.forEach((id, i) => setTimeout(() => {
S.avatar.addFlourish(id); Au.flourish();
const ac = FX.centerOf($('#avatar')); FX.burst(ac.x, ac.y, 30, { speed: 300 });
}, 350 + i * 450));
hud();
const seq = (S.solveSeq = (S.solveSeq || 0) + 1);
setTimeout(() => { if (S.solveSeq === seq && Game.G.phase === 'solved') Game.advance(); }, d.method === 'skip' ? 900 : 1700);
});
bus.on('draft:open', d => openDraft(d));
bus.on('draft:replace', d => showReplace(d));
bus.on('draft:skip', d => { if (d.bonus) toast(`+${d.bonus} FOR SKIPPING`, 'gold'); });
bus.on('draft:close', () => { HM.Main.closeOverlay('ov-draft'); });
bus.on('tier:up', ti => {
S.tierQuip = true;
toast(ti.endless ? `ENDLESS ${ti.endless}: CLOCK SHRINKS` : `TIER ${ti.tier}: HARDER WORDS`, 'gold');
FX.flash('rgba(255,255,255,0.3)', 0.4); HM.BG.pulse(2);
});
bus.on('gameover', d => {
hushSpeech();
say(`HA! It was "${d.round.word.toUpperCase()}".`, { taunt: true, tag: 'THE END', hold: 4000 });
HM.Main.onGameOver(d);
});
bus.on('loading', d => {
const m = $('#buffer-mode');
if (d.on) { $('#tiles').innerHTML = '<div class="loading">SHUFFLING THE DECK...</div>'; m.textContent = ''; }
});
bus.on('error', d => toast(d.text, 'bad'));
}
function moveTarget(dir) {
const tiles = $$('#tiles .tile');
let i = S.targetCursor;
for (let k = 0; k < tiles.length; k++) {
if (dir) i = (i + dir + tiles.length) % tiles.length;
if (!tiles[i].classList.contains('rev')) break;
if (!dir) i = (i + 1) % tiles.length;
}
S.targetCursor = i;
tiles.forEach((t, j) => t.classList.toggle('cursor', j === i));
}
function openDraft(d) {
S.draftInspect = -1; S.replaceInspect = -1;
$('#draft-title').textContent = d.kind === 'start' ? 'PICK A STARTING PERK' : 'TIER CLEARED!';
$('#draft-sub').textContent = 'Press a number to inspect, press it again to take it. Or click.';
$('.draft-actions .btn').innerHTML = d.skipBonus ? `SKIP FOR +<span id="skip-bonus">${d.skipBonus}</span> PTS <kbd>S</kbd>` : 'SKIP <kbd>S</kbd>';
const fl = (d.flair || []).map(id => (HM.Avatar.BY_ID[id] || {}).name || id);
$('#draft-flair').textContent = fl.length ? `YOUR ${Game.G.run.avatar === 'skeleton' ? 'HANGED ONE' : 'SKULL'} EARNED: ${fl.join(' + ').toUpperCase()}` : '';
$('#draft-replace').classList.add('hidden');
$('#draft-cards').classList.remove('hidden');
const row = $('#draft-cards'); row.innerHTML = '';
d.offers.forEach((p, i) => {
const c = perkCard(p, i + 1, { desc: true });
c.classList.add('fresh'); c.style.animationDelay = (i * 0.12) + 's';
c.addEventListener('pointerdown', () => HM.Main.draftKey(i));
row.appendChild(c);
});
Au.draft();
HM.Main.openOverlay('ov-draft');
}
function draftInspect(i) {
const cards = $$('#draft-cards .perk-card');
cards.forEach((c, j) => c.classList.toggle('inspect', j === i));
Au.perkHover();
}
function showReplace(d) {
$('.draft-actions .btn').innerHTML = Game.G.draft.skipBonus ? `KEEP MY BELT (+<span id="skip-bonus">${Game.G.draft.skipBonus}</span> PTS) <kbd>S</kbd>` : 'KEEP MY BELT <kbd>S</kbd>';
$('#draft-cards').classList.add('hidden');
$('#draft-replace').classList.remove('hidden');
$('#draft-sub').innerHTML = `Taking <b>${d.perk.name.toUpperCase()} ${d.perk.lvl ? HM.romanLvl(d.perk.lvl) : ''}</b>`;
const row = $('#draft-belt'); row.innerHTML = '';
d.belt.forEach((id, i) => {
const c = perkCard(HM.PERK_BY_ID[id], i + 1, { desc: true });
c.addEventListener('pointerdown', () => HM.Main.draftKey(i));
row.appendChild(c);
});
}
function replaceInspect(i) { $$('#draft-belt .perk-card').forEach((c, j) => c.classList.toggle('inspect', j === i)); Au.perkHover(); }
function fillOver(run, round) {
$('#over-word').textContent = run.failedWord || '';
const e = run.failedEntry;
$('#over-clue').textContent = e && e.h ? `"${e.h[e.h.length - 1]}"` : '';
const nWords = run.solved.filter(s => s.method !== 'skip').length;
$('#over-plaque').textContent = HM.feature('Scoring') ? `LEVEL ${run.level} · ${fmt(run.score)} PTS` : `LEVEL ${run.level} · ${nWords} WORD${nWords === 1 ? '' : 'S'}`;
const solved = run.solved.filter(s => s.method !== 'skip');
const secs = Math.round((run.endedAt - run.startedAt) / 1000);
const firstTries = solved.filter(s => s.firstTry).length;
const avgKps = solved.length ? solved.reduce((a, s) => a + s.kps, 0) / solved.length : 0;
const ti = Game.tierInfo(run.level);
const stats = [
...(HM.feature('Scoring') ? [['FINAL SCORE', fmt(run.score), 'wide']] : []), ['REACHED', ti.endless ? `ENDLESS ${ti.endless}` : `TIER ${ti.tier}`], ['WORDS', solved.length],
['BEST KPS', run.bestKps.toFixed(1)], ['AVG SOLVE KPS', avgKps.toFixed(1)], ['BEST FLAWLESS RUN', run.bestStreak], ['FIRST TRIES', firstTries],
['PERKS USED', run.perksUsed], ['FLAIR', run.flourishes.length], ['KEYSTROKES', run.totalKeys], ['RUN TIME', `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`],
];
$('#over-stats').innerHTML = stats.map(([l, v, w]) => `<div class="stat ${w || ''}"><div class="lbl">${l}</div><div class="v">${v}</div></div>`).join('') +
(run.hardcore ? '<div class="stat wide"><div class="lbl">MODE</div><div class="v" style="color:var(--bad)">HARDCORE</div></div>' : '');
fillMemento($('#memento-track'), run.solved.map(s => ({ w: s.w, t: s.tier, k: s.kps, s: s.score, m: s.method, sec: s.secs })));
}
function fillMemento(track, words) {
if (!words.length) { track.innerHTML = '<div class="mem"><span class="w dim">NO WORDS. THE NOOSE WAS QUICK.</span></div>'; track.style.animation = 'none'; return; }
const row = s => `<div class="mem ${s.m === 'skip' ? 'skip' : ''}"><span class="w"><span class="t" style="background:${TIER_COLORS[Math.min(10, s.t)]}">T${s.t}</span>${s.w}</span><span class="m">${s.m === 'skip' ? 'skip' : HM.feature('Scoring') ? `${s.k.toFixed(1)}kps · +${fmt(s.s)}` : `${s.sec != null ? s.sec + 's · ' : ''}${s.k.toFixed(1)}kps`}</span></div>`;
const html = words.map(row).join('');
track.innerHTML = html + html;
track.style.setProperty('--dur', Math.max(8, words.length * 2.2) + 's');
track.style.animation = words.length > 6 ? '' : 'none';
if (words.length <= 6) track.innerHTML = html;
}
function fillTrophies() {
const g = $('#trophy-grid'); g.innerHTML = '';
const list = HM.Trophies.all();
if (!list.length) { g.innerHTML = '<div class="empty-note">No trophies yet. Die gloriously to earn one.</div>'; return; }
list.forEach(t => {
const c = el('div', 'trophy panel');
c.innerHTML = (t.thumb ? `<img src="${t.thumb}" alt="">` : '<div style="height:120px"></div>') +
(HM.feature('Scoring') ? `<div class="ts">${fmt(t.score)}</div><div class="tl">LVL ${t.level} · ${t.words.length} words${t.hardcore ? ' · HC' : ''}</div>` : `<div class="ts">LEVEL ${t.level}</div><div class="tl">${t.words.length} words${t.hardcore ? ' · HC' : ''}</div>`) + `<div class="tl">${new Date(t.date).toLocaleDateString()}</div>`;
c.addEventListener('click', () => HM.Main.openTrophy(t));
g.appendChild(c);
});
}
const SETTINGS = [
...(window.HM_RELEASE ? [] : [['sec', 'FEATURE FLAGS'], ['featureScoring', 'Scoring (points, score perks)', 'bool'], ['featureSwirlBg', 'Swirl background (reload)', 'bool'], ['featureFirstTryBonus', 'First-try time bonus (banked)', 'bool'], ['featureLetterGuesses', 'Letter guesses (1 letter + SPACE)', 'bool'], ['wrongLetterPenalty', 'Wrong letter penalty (s)', 'num'], ['hardcoreLetterPenalty', 'Hardcore: wrong letter (s)', 'num'], ['wordGuessRevealsPositions', 'Wrong words flip right-spot letters', 'bool']]),
['sec', 'LOOK'],
['theme', 'Theme / skin', 'select'],
['crt', 'CRT scanlines', 'bool'], ['screenShake', 'Screen shake', 'bool'], ['fxIntensity', 'FX intensity (0-2)', 'num'],
['sec', 'SOUND'], ['sound', 'Sound', 'bool'], ['volume', 'Volume (0-1)', 'num'],
['sec', 'TIMER'],
['roundSeconds', 'Seconds per word', 'num'], ['wrongWordPenalty', 'Wrong word penalty (s)', 'num'],
['hardcore', 'Hardcore mode (next run)', 'bool'], ['hardcoreWordPenalty', 'Hardcore: wrong word (s)', 'num'],
['sec', 'PROGRESSION'],
['levelsPerTier', 'Words per tier', 'num'], ['beltSize', 'Perk slots (needs new run)', 'num'], ['draftChoices', 'Perks offered per draft', 'num'], ['startingDraft', 'Perk pick before level 1', 'bool'],
['sec', 'KPS THRESHOLDS'], ['kpsHot', 'Hot at', 'num'], ['kpsFire', 'On fire at', 'num'], ['kpsInferno', 'Inferno at', 'num'],
];
function buildSettings() {
const f = $('#settings-form'); f.innerHTML = '';
for (const [k, label, type] of SETTINGS) {
if (k === 'sec') { f.appendChild(el('div', 'sec', label)); continue; }
const lab = el('label', '', label); lab.htmlFor = 'set-' + k;
let input;
if (type === 'bool') { input = el('input'); input.type = 'checkbox'; input.checked = !!cfg()[k]; }
else if (type === 'select') {
input = el('select');
for (const [id, th] of Object.entries(HM.Themes.list)) { const o = el('option', '', th.name); o.value = id; if (id === cfg().theme) o.selected = true; input.appendChild(o); }
} else { input = el('input'); input.type = 'number'; input.step = 'any'; input.value = cfg()[k]; }
input.id = 'set-' + k;
input.addEventListener('change', () => {
let v = type === 'bool' ? input.checked : type === 'select' ? input.value : parseFloat(input.value);
if (type === 'num' && isNaN(v)) return;
if (type === 'num') { v = HM.clampConfig(k, v); input.value = v; }
if (k === 'beltSize' || k === 'draftChoices' || k === 'levelsPerTier') v = Math.max(1, Math.round(v));
HM.config[k] = v; HM.saveConfig(HM.config);
HM.Main.applyConfig();
});
f.appendChild(lab); f.appendChild(input);
}
}
function frame(dt) {
if ($('#scr-game').classList.contains('active')) {
timerUpdate();
clueCountdown();
tickerUpdate(dt);
kpsUpdate(dt);
if (Game.G.round && Game.G.phase === 'playing') $('#mult').textContent = liveMult();
const run = Game.G.run;
if (run && S.shownScore !== run.score) {
S.shownScore += Math.max(1, (run.score - S.shownScore) * Math.min(1, dt * 6));
if (S.shownScore > run.score) S.shownScore = run.score;
$('#score').textContent = fmt(S.shownScore);
}
if (S.inspect >= 0) { S.inspectTimer -= dt; if (S.inspectTimer <= 0) hideTooltip(); }
}
}
function init() {
buildKeyboard();
window.addEventListener('resize', () => { const r = Game.G.round; if (r && $('#scr-game').classList.contains('active')) { sizeTiles(r.len); placeSpeech(); } });
S.avatar = HM.Avatar.create($('#avatar'), { mode: 'skull' });
wire();
}
return {
init, frame, renderBelt, showTooltip, hideTooltip, toast, fillOver, fillMemento, fillTrophies, buildSettings, draftInspect, replaceInspect,
moveTarget, perkCard, hud, say, hushSpeech, S, get avatar() { return S.avatar; },
};
})();
