window.HM = window.HM || {};
HM.Main = (function () {
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const Game = HM.Game, UI = HM.UI, Au = HM.Audio, FX = HM.FX;
let screen = 'scr-title', overlays = [], selMode = 'skull';
let titleAv, selAvs = [], overAv, tdAv, tdTrophy = null, last = performance.now(), titleT = 0;
let meltState = null;
function show(id) {
$$('.screen').forEach(s => s.classList.toggle('active', s.id === id));
screen = id;
if (id === 'scr-title') {
const sc = HM.feature('Scoring');
$('#best-label').textContent = sc ? 'best run' : 'deepest run: level';
$('#best-score').textContent = sc ? HM.Trophies.best().toLocaleString('en-US') : HM.Trophies.bestLevel();
HM.BG.setTier(0);
}
if (id === 'scr-select') { $('#sel-hardcore').checked = !!HM.config.hardcore; pickVessel(selMode); }
if (id === 'scr-trophies') UI.fillTrophies();
}
function openOverlay(id) {
$('#' + id).classList.add('active');
overlays = overlays.filter(o => o !== id); overlays.push(id);
if (id === 'ov-settings') UI.buildSettings();
}
function closeOverlay(id) {
$('#' + id).classList.remove('active');
overlays = overlays.filter(o => o !== id);
if (id === 'ov-pause') resume();
if (id === 'ov-trophy') tdTrophy = null;
}
const topOverlay = () => overlays[overlays.length - 1];
function pause() {
if (Game.G.phase !== 'playing' && Game.G.phase !== 'loading') return;
Game.setPaused(true); document.body.classList.add('paused'); openOverlay('ov-pause');
}
function resume() { Game.setPaused(false); document.body.classList.remove('paused'); }
function applyConfig() {
const c = HM.config;
HM.Themes.apply(c.theme);
document.body.classList.toggle('no-scoring', !c.featureScoring);
$('#crt').style.display = c.crt ? '' : 'none';
Au.setVolume(c.volume);
$('#help-secs').textContent = c.roundSeconds;
$('#help-lp').textContent = c.hardcore ? c.hardcoreLetterPenalty : c.wrongLetterPenalty;
$('#help-tier').textContent = c.levelsPerTier;
$('#help-clue').textContent = c.clueInterval;
}
function pickVessel(mode) {
selMode = mode;
$$('.vessel').forEach(v => v.classList.toggle('sel', v.dataset.mode === mode));
}
function startRun() {
HM.config.hardcore = $('#sel-hardcore').checked;
HM.saveConfig(HM.config);
applyConfig();
show('scr-game');
Game.newRun(selMode);
}
function onGameOver(d) {
const run = d.run;
Au.gameOver();
UI.avatar.hit('dead');
FX.addShake(18); FX.flash('rgba(200,0,30,0.45)', 0.6);
const tiles = $$('#tiles .tile');
tiles.forEach((t, i) => { if (!t.classList.contains('rev')) setTimeout(() => t.classList.add('rev', 'lost', 'pop'), i * 60); });
UI.hideTooltip();
let thumb = null;
try {
const c = document.createElement('canvas');
const a = HM.Avatar.create(c, { mode: run.avatar, flourishes: run.flourishes });
for (let i = 0; i < 20; i++) a.render(1 / 30);
thumb = c.toDataURL('image/png');
} catch (e) { }
HM.Trophies.add(run, thumb);
appendLog(run);
setTimeout(() => melt(() => {
UI.fillOver(run, d.round);
overAv.setMode(run.avatar); overAv.setFlourishes(run.flourishes); overAv.dead = false;
$('#scr-game').classList.remove('melting');
show('scr-over');
}), 1100);
setTimeout(() => $('#scr-game').classList.add('melting'), 400);
}
function openTrophy(t) {
tdTrophy = t;
tdAv.setMode(t.avatar); tdAv.setFlourishes(t.flourishes);
$('#td-plaque').textContent = HM.feature('Scoring') ? `LEVEL ${t.level} · ${t.score.toLocaleString('en-US')} PTS · ${new Date(t.date).toLocaleDateString()}` : `LEVEL ${t.level} · ${t.words.length} WORDS · ${new Date(t.date).toLocaleDateString()}`;
UI.fillMemento($('#td-track'), t.words);
openOverlay('ov-trophy');
}
function exportLog() {
let log = [];
try { log = JSON.parse(localStorage.getItem('hm_playlog') || '[]'); } catch (e) { }
const cols = ['run', 'date', 'hardcore', 'roundSeconds', 'level', 'tier', 'word', 'outcome', 'firstTry', 'secs', 'timeLeft', 'wrong', 'letters', 'clues', 'kps', 'score'];
const rows = [cols.join(',')].concat(log.map(r => cols.map(c => r[c] == null ? '' : String(r[c]).replace(/,/g, ';')).join(',')));
const csv = rows.join('\n');
let embedded = false; try { embedded = window.self !== window.top; } catch (e) { embedded = true; }
if (embedded) {
navigator.clipboard.writeText(csv).then(() => UI.toast(`COPIED ${log.length} ROWS AS CSV`, 'good'), () => UI.toast('COPY BLOCKED', 'bad'));
return;
}
const blob = new Blob([csv], { type: 'text/csv' });
const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cryptomancy-playtest-log.csv'; a.click();
setTimeout(() => URL.revokeObjectURL(a.href), 2000);
UI.toast(`EXPORTED ${log.length} ROWS`, 'good');
}
function appendLog(run) {
try {
const log = JSON.parse(localStorage.getItem('hm_playlog') || '[]');
const base = { run: run.seed, date: new Date(run.endedAt).toISOString(), hardcore: run.hardcore, roundSeconds: HM.config.roundSeconds };
run.solved.forEach(s => log.push(Object.assign({}, base, { level: s.level, tier: s.tier, word: s.w, outcome: s.method, firstTry: !!s.firstTry, secs: s.secs, timeLeft: s.timeLeft, wrong: s.wrong, letters: s.letters, clues: s.clues, kps: s.kps, hidden: s.hidden, score: s.score })));
const f = run.failedStats;
if (f) log.push(Object.assign({}, base, { level: f.level, tier: f.tier, word: f.w, outcome: 'FAILED:' + f.reason, secs: f.secs, timeLeft: 0, wrong: f.wrong, clues: f.clues, hidden: f.revealed }));
localStorage.setItem('hm_playlog', JSON.stringify(log.slice(-3000)));
} catch (e) { }
}
function melt(onCovered) {
const cv = $('#melt'), PX = 6;
const W = Math.ceil(innerWidth / PX), H = Math.ceil(innerHeight / PX);
cv.width = W; cv.height = H; cv.style.display = 'block';
const ctx = cv.getContext('2d');
const th = HM.Themes.current.melt;
const offsets = () => { const y = new Float32Array(W); y[0] = -Math.random() * 16; for (let i = 1; i < W; i++) y[i] = Math.max(-16, Math.min(0, y[i - 1] + Math.floor(Math.random() * 3) - 1)); return y; };
const cur = document.createElement('canvas'); cur.width = W; cur.height = H;
const cc = cur.getContext('2d');
cc.fillStyle = th.base; cc.fillRect(0, 0, W, H);
for (let i = 0; i < W; i++) { const len = Math.random() * H * 0.25; cc.fillStyle = th.edge; cc.fillRect(i, 0, 1, len); if (Math.random() < 0.08) { cc.fillStyle = th.glint; cc.fillRect(i, len - 2, 1, 2); } }
const word = HM.Themes.current.meltWord || 'HANGED';
const tc = document.createElement('canvas'); tc.width = word.length * 4 + 2; tc.height = 7;
HM.Avatar.ptext(tc.getContext('2d'), word, 1, 1, th.glint, '#000');
const scale = Math.max(2, Math.floor(W * 0.6 / tc.width));
cc.imageSmoothingEnabled = false;
cc.drawImage(tc, Math.round(W / 2 - tc.width * scale / 2), Math.round(H / 2 - tc.height * scale / 2), tc.width * scale, tc.height * scale);
meltState = { phase: 'A', y: offsets(), offsets, W, H, ctx, cur, th, hold: 0, onCovered };
}
function meltStep(dt) {
const m = meltState; if (!m) return;
const k = dt * 35, { W, H, ctx, th } = m;
const adv = () => { let done = true; for (let i = 0; i < W; i++) { if (m.y[i] < 0) m.y[i] += k; else m.y[i] += (m.y[i] < 16 ? m.y[i] + 1 : Math.max(4, H / 40)) * k * 0.55; if (m.y[i] < H) done = false; } return done; };
if (m.phase === 'A') {
const done = adv();
ctx.clearRect(0, 0, W, H);
for (let i = 0; i < W; i++) {
const h = Math.max(0, Math.min(H, m.y[i]));
ctx.fillStyle = th.base; ctx.fillRect(i, 0, 1, h);
ctx.fillStyle = th.edge; ctx.fillRect(i, h - 4, 1, 4);
if ((i * 7) % 11 === 0) { ctx.fillStyle = th.glint; ctx.fillRect(i, h - 1, 1, 1); }
}
if (done) { m.phase = 'hold'; ctx.drawImage(m.cur, 0, 0); try { m.onCovered(); } catch (e) { console.error(e); } }
} else if (m.phase === 'hold') {
m.hold += dt;
if (m.hold > 0.7) { m.phase = 'B'; m.y = m.offsets(); }
} else {
const done = adv();
ctx.clearRect(0, 0, W, H);
for (let i = 0; i < W; i++) {
const yy = Math.max(0, Math.floor(m.y[i]));
if (yy < H) ctx.drawImage(m.cur, i, 0, 1, H - yy, i, yy, 1, H - yy);
}
if (done) { $('#melt').style.display = 'none'; meltState = null; }
}
}
function perkKey(i) {
const run = Game.G.run;
if (!run || i >= run.belt.length || Game.G.phase !== 'playing') return;
if (!run.belt[i]) { UI.toast(`SLOT ${i + 1} IS EMPTY`); return; }
if (UI.S.inspect === i) {
const res = Game.usePerk(i);
if (!res.ok) UI.showTooltip(i);
} else { UI.showTooltip(i); Au.perkHover(); }
}
function draftKey(i) {
const D = Game.G.draft; if (!D) return;
if (D.pending) {
if (i >= Game.G.run.belt.length) return;
if (UI.S.replaceInspect === i) { Game.draftReplace(i); Au.select(); }
else { UI.S.replaceInspect = i; UI.replaceInspect(i); }
} else {
if (i >= D.offers.length) return;
if (UI.S.draftInspect === i) { Game.draftChoose(i); Au.select(); }
else { UI.S.draftInspect = i; UI.draftInspect(i); }
}
}
function virtualKey(k) {
Au.unlock();
const G = Game.G;
if (G.phase === 'solved' && k === ' ') { tryAdvance(); return; }
if (Game.targeting && k === ' ') { Game.targetPick(UI.S.targetCursor); return; }
if (k === 'Backspace') Game.backspace(false);
else if (k === 'Clear') Game.backspace(true);
else if (k === ' ') Game.submit();
else if (/^[a-z]$/.test(k)) Game.typeLetter(k);
}
function tryAdvance() { if (performance.now() - UI.S.solveAt > 450) Game.advance(); }
function gameKey(e) {
const k = e.key, G = Game.G;
if (k === 'Escape') {
e.preventDefault();
if (Game.targeting) { Game.targetCancel(); UI.toast('SPOTLIGHT CANCELLED · PERK REFUNDED', 'gold'); return; }
if (UI.S.inspect >= 0) { UI.hideTooltip(); return; }
pause(); return;
}
if (G.phase === 'solved') { if (k === ' ' || k === 'Enter') { e.preventDefault(); if (!e.repeat) tryAdvance(); } return; }
if (G.phase !== 'playing' || G.paused) return;
if (Game.targeting) {
if (k === 'ArrowLeft') { UI.moveTarget(-1); return; }
if (k === 'ArrowRight') { UI.moveTarget(1); return; }
if (k === ' ' || k === 'Enter') { e.preventDefault(); Game.targetPick(UI.S.targetCursor); return; }
}
if (/^[1-9]$/.test(k)) { e.preventDefault(); if (!e.repeat) perkKey(+k - 1); return; }
if (k === ' ' || k === 'Enter') { e.preventDefault(); if (!e.repeat) Game.submit(); return; }
if (k === 'Backspace') { e.preventDefault(); Game.backspace(e.ctrlKey || e.altKey || e.metaKey); return; }
if (/^[a-zA-Z]$/.test(k) && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); if (!e.repeat) Game.typeLetter(k.toLowerCase()); }
}
function overlayKey(ov, e) {
const k = e.key;
if (e.repeat) return;
if (ov === 'ov-draft') {
if (/^[1-9]$/.test(k)) { draftKey(+k - 1); return; }
if (k === 'Escape' && Game.G.draft && Game.G.draft.pending) { UI.S.draftInspect = -1; Game.draftBack(); return; }
if (k.toLowerCase() === 's') { Game.draftSkip(); return; }
return;
}
if (k === 'Escape') { e.preventDefault(); closeOverlay(ov); }
}
function onKey(e) {
const ov0 = topOverlay();
if (e.key === 'Escape' && ov0 && ov0 !== 'ov-draft') { e.preventDefault(); if (document.activeElement) document.activeElement.blur(); closeOverlay(ov0); return; }
if (e.target.matches && e.target.matches('input[type=number], select, textarea')) return;
Au.unlock();
const ov = topOverlay();
if (ov) { overlayKey(ov, e); return; }
if (meltState && meltState.phase !== 'B') return;
const k = e.key;
switch (screen) {
case 'scr-title':
if (k === ' ' || k === 'Enter') { e.preventDefault(); show('scr-select'); }
else if (k.toLowerCase() === 't') show('scr-trophies');
else if (k.toLowerCase() === 'h') openOverlay('ov-help');
else if (k.toLowerCase() === 'o') openOverlay('ov-settings');
break;
case 'scr-select':
if (k === 'ArrowLeft' || k === 'a') pickVessel('skull');
else if (k === 'ArrowRight' || k === 'd') pickVessel('skeleton');
else if (k.toLowerCase() === 'h') { const c = $('#sel-hardcore'); c.checked = !c.checked; Au.select(); }
else if (k === ' ' || k === 'Enter') { e.preventDefault(); if (document.activeElement) document.activeElement.blur(); startRun(); }
else if (k === 'Escape') show('scr-title');
break;
case 'scr-game': gameKey(e); break;
case 'scr-over':
if (k === ' ' || k === 'Enter') { e.preventDefault(); show('scr-select'); }
else if (k.toLowerCase() === 't') show('scr-trophies');
else if (k === 'Escape') show('scr-title');
break;
case 'scr-trophies':
if (k === 'Escape') show('scr-title');
break;
}
}
function onClick(e) {
Au.unlock();
const b = e.target.closest('[data-act]');
if (b) {
const act = b.dataset.act;
const ov = b.closest('.overlay');
switch (act) {
case 'play': show('scr-select'); break;
case 'trophies': show('scr-trophies'); break;
case 'help': openOverlay('ov-help'); break;
case 'settings': openOverlay('ov-settings'); break;
case 'title': show('scr-title'); break;
case 'pause': pause(); break;
case 'resume': closeOverlay('ov-pause'); break;
case 'abandon': closeOverlay('ov-pause'); Game.gameOver('abandon'); break;
case 'close': if (ov) closeOverlay(ov.id); break;
case 'draft-skip': Game.draftSkip(); break;
case 'export-log': exportLog(); break;
case 'settings-reset': HM.config = Object.assign({}, HM.DEFAULT_CONFIG); HM.saveConfig(HM.config); applyConfig(); UI.buildSettings(); break;
case 'trophy-delete':
if (!tdTrophy) break;
if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = 'REALLY DELETE?'; setTimeout(() => { b.dataset.armed = ''; b.textContent = 'DELETE'; }, 2500); break; }
b.dataset.armed = ''; b.textContent = 'DELETE';
HM.Trophies.remove(tdTrophy.id); closeOverlay('ov-trophy'); UI.fillTrophies(); break;
}
Au.select();
return;
}
const v = e.target.closest('.vessel');
if (v) { if (selMode === v.dataset.mode) startRun(); else pickVessel(v.dataset.mode); }
}
function loop(t) {
const raw = Math.max(0, (t - last) / 1000); last = t;
const dt = Math.min(0.05, raw);
try {
HM.BG.render(dt);
Game.update(Math.min(0.25, raw));
UI.frame(dt);
if (screen === 'scr-game') UI.avatar.render(dt);
else if (screen === 'scr-title') {
titleT += dt;
if (titleT > 1.6) { titleT = 0; if (titleAv.list.length > 7) titleAv.setFlourishes([]); const id = HM.Avatar.rollFlourish(titleAv.list, 30); if (id) titleAv.addFlourish(id); }
titleAv.render(dt);
} else if (screen === 'scr-select') selAvs.forEach(a => a.render(dt));
else if (screen === 'scr-over') overAv.render(dt);
if (tdTrophy) tdAv.render(dt);
meltStep(dt);
FX.update(dt);
} catch (err) { console.error(err); }
requestAnimationFrame(loop);
}
function boot() {
HM.BG = HM.feature('SwirlBg') ? HM.Swirl : HM.Forest;
HM.BG.init($('#bg'));
FX.init($('#fx'));
UI.init();
applyConfig();
if (window.HM_BUILD) $('#build-tag').textContent = window.HM_BUILD;
titleAv = HM.Avatar.create($('#title-avatar'), { mode: 'skull', flourishes: ['googly'] });
selAvs = [HM.Avatar.create($('#sel-skull'), { mode: 'skull' }), HM.Avatar.create($('#sel-skel'), { mode: 'skeleton' })];
overAv = HM.Avatar.create($('#over-avatar'), { mode: 'skull' });
tdAv = HM.Avatar.create($('#td-avatar'), { mode: 'skull' });
HM.WordSource.init().then(mode => {
$('#word-count').textContent = HM.WordSource.total.toLocaleString('en-US') + (mode === 'remote' ? ' (server)' : '');
}).catch(e => { console.error(e); $('#word-count').textContent = 'NO'; UI.toast('WORD PACK FAILED TO LOAD', 'bad'); });
HM.bus.on('round:start', () => { if (!HM.DEBUG && !document.hasFocus()) setTimeout(pause, 0); });
HM.bus.on('abort', () => { UI.hushSpeech(); show('scr-title'); });
document.addEventListener('keydown', onKey);
document.addEventListener('click', onClick);
document.addEventListener('visibilitychange', () => { if (document.hidden && screen === 'scr-game') pause(); });
window.addEventListener('blur', () => { if (screen === 'scr-game' && !HM.DEBUG) pause(); });
show('scr-title');
requestAnimationFrame(loop);
}
if (HM.DEBUG) HM.debug = {
word: () => Game.G.round && Game.G.round.word,
solve() { const r = Game.G.round; if (!r) return; r.buffer = r.word; r.guessStartAt = performance.now() / 1000 - 0.4; Game.submit(); },
give(id, slot = 0) { Game.G.run.belt[slot] = id; UI.renderBelt(); },
flair(n = 10) { for (let i = 0; i < n; i++) { const id = HM.Avatar.rollFlourish(Game.G.run.flourishes, 50); if (id) { Game.G.run.flourishes.push(id); UI.avatar.addFlourish(id); } } },
level(n) { Game.G.run.level = n; Game.startRound(); },
kill() { Game.G.round.timeLeft = 0.01; },
get state() { return { screen, phase: Game.G.phase, overlays: overlays.slice() }; },
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
return { show, openOverlay, closeOverlay, applyConfig, onGameOver, openTrophy, perkKey, draftKey, virtualKey, pickVessel, startRun };
})();
