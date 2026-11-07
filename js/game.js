window.HM = window.HM || {};
HM.bus = (function () {
const map = {};
return {
on(ev, fn) { (map[ev] || (map[ev] = [])).push(fn); },
emit(ev, data) { (map[ev] || []).forEach(fn => { try { fn(data); } catch (e) { console.error('[bus]', ev, e); } }); (map['*'] || []).forEach(fn => fn(ev, data)); },
};
})();
HM.Game = (function () {
const bus = HM.bus;
const cfg = () => HM.config;
const G = { run: null, round: null, phase: 'idle', paused: false, draft: null, keys: [] };
const now = () => performance.now() / 1000;
function tierInfo(level) {
const raw = Math.ceil(level / cfg().levelsPerTier);
return { tier: Math.min(cfg().maxTier, raw), endless: Math.max(0, raw - cfg().maxTier), raw };
}
function loadRecent() { try { return JSON.parse(localStorage.getItem('hm_recent') || '[]'); } catch (e) { return []; } }
function saveRecent(w) {
try { const r = loadRecent().filter(x => x !== w); r.unshift(w); localStorage.setItem('hm_recent', JSON.stringify(r.slice(0, 250))); } catch (e) { }
}
const batchSize = () => cfg().levelsPerTier + 3;
function sourceTier(tier, endless) {
if (!endless) return tier;
return endless % 2 ? cfg().maxTier : Math.max(1, cfg().maxTier - 1);
}
function ensureBatch(t) {
const run = G.run;
if (run.batches[t] && run.batches[t].length) return Promise.resolve();
if (run.pending[t]) return run.pending[t];
run.pending[t] = HM.WordSource.batch(t, batchSize(), run.used).then(list => {
run.batches[t] = (run.batches[t] || []).concat(list.filter(e => !run.used.has(e.w)));
if (!run.batches[t].length) run.batches[t] = list.slice();
}).finally(() => { delete run.pending[t]; });
return run.pending[t];
}
function takeWord(t) { const b = G.run.batches[t]; return b && b.length ? b.shift() : null; }
function prefetchNext() {
const run = G.run;
const inTier = ((run.level - 1) % cfg().levelsPerTier) + 1;
if (inTier >= cfg().levelsPerTier - 2) {
const ti = tierInfo(run.level + cfg().levelsPerTier);
ensureBatch(sourceTier(ti.tier, ti.endless)).catch(e => console.warn('[prefetch]', e));
}
}
function roundSeconds(endless) {
const c = cfg();
return Math.max(Math.min(c.minRoundSeconds, c.roundSeconds), c.roundSeconds - endless * c.endlessTimeShrink);
}
const hc = () => !!(G.run && G.run.hardcore);
const hiddenIdx = () => G.round.revealed.map((v, i) => v ? -1 : i).filter(i => i >= 0);
const hiddenLetters = () => [...new Set(hiddenIdx().map(i => G.round.word[i]))];
const isVowel = c => 'aeiou'.includes(c);
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const byRarity = arr => arr.slice().sort((x, y) => HM.LETTER_FREQ.indexOf(y) - HM.LETTER_FREQ.indexOf(x));
function registerKey() {
const t = now();
G.keys.push(t);
if (G.run) G.run.totalKeys++;
while (G.keys.length && t - G.keys[0] > cfg().kpsWindow) G.keys.shift();
}
function kps() {
const t = now();
while (G.keys.length && t - G.keys[0] > cfg().kpsWindow) G.keys.shift();
return G.keys.length / cfg().kpsWindow;
}
function kpsLevel(v) { const c = cfg(); return v >= c.kpsInferno ? 3 : v >= c.kpsFire ? 2 : v >= c.kpsHot ? 1 : 0; }
function newRun(avatarMode) {
clearTarget();
G.round = null;
G.run = {
batches: {}, pending: {},
avatar: avatarMode, score: 0, level: 1, solved: [], flourishes: [], belt: new Array(cfg().beltSize).fill(null),
bestKps: 0, streak: 0, bestStreak: 0, used: new Set(), lastPerk: null, perksUsed: 0, totalKeys: 0,
startedAt: Date.now(), hardcore: !!cfg().hardcore, seed: Math.floor(Math.random() * 1e9),
};
G.keys = [];
G.paused = false;
bus.emit('run:start', G.run);
if (cfg().startingDraft) openDraft('start'); else startRound();
}
function startRound(entryOverride, opts = {}) {
const run = G.run;
const ti = tierInfo(run.level);
const st = opts.tier || sourceTier(ti.tier, ti.endless);
const entry = entryOverride || takeWord(st);
if (!entry) {
if (opts.retried) { console.error('No words available for tier', st); bus.emit('error', { text: 'NO WORDS FOR TIER ' + st }); return; }
G.phase = 'loading'; bus.emit('loading', { on: true });
const attempt = (opts.attempt || 0);
const runRef = run;
ensureBatch(st).then(() => {
if (G.run !== runRef || G.phase !== 'loading') return;
bus.emit('loading', { on: false }); startRound(null, Object.assign({}, opts, { retried: true }));
}).catch(e => {
console.error(e);
if (G.run !== runRef || G.phase !== 'loading') return;
const wait = Math.min(8000, 800 * Math.pow(2, attempt));
bus.emit('error', { text: `COULD NOT LOAD WORDS · RETRYING IN ${Math.round(wait / 1000)}s (ESC = MENU)` });
setTimeout(() => { if (G.run === runRef && G.phase === 'loading') startRound(null, Object.assign({}, opts, { attempt: attempt + 1 })); }, wait);
});
return;
}
clearTarget();
run.used.add(entry.w);
saveRecent(entry.w);
const secs = roundSeconds(ti.endless);
if (opts.tier) ti.tier = opts.tier;
G.round = {
entry, word: entry.w, len: entry.w.length, tier: ti.tier, endless: ti.endless, level: run.level,
revealed: new Array(entry.w.length).fill(false), guessed: new Set(), wrong: new Set(), eliminated: new Set(), dowsed: new Set(),
timeMax: secs, timeLeft: secs, elapsed: 0, grace: 0.7,
chips: 0, chipsBonus: 0, multAdd: 0, multX: 1, halfPoints: !!opts.halfPoints,
buffer: '', guessStartAt: null, freeze: 0, slow: 0, slowFactor: 1, shield: 0, armed: {},
pinned: [], clueOrder: [], cluesShown: 0, wrongCount: 0, submits: 0, consumed: 0, reserve: 0, jumble: null, lastWhole: -1, peakKps: 0,
};
const nClues = Math.min(cfg().clueCount, (entry.h || []).length);
const order = [...Array(nClues).keys()];
G.round.clueOrder = cfg().clueOrder === 'progressive' ? order : shuffle(order);
G.round.cluesShown = nClues ? 1 : 0;
G.phase = 'playing';
const bonus = run.bonusNext || 0;
run.bonusNext = 0;
G.round.reserve = bonus;
bus.emit('round:start', G.round);
bus.emit('buffer', { buffer: '' });
if (bonus) bus.emit('time:bank', { secs: bonus });
prefetchNext();
}
function update(dt) {
if (G.run) { const k = kps(); if (G.round && k > G.round.peakKps) G.round.peakKps = k; }
if (G.phase !== 'playing' || G.paused) return;
const r = G.round;
if (r.grace > 0) { r.grace -= dt; return; }
r.elapsed += dt;
if (r.freeze > 0) { r.freeze = Math.max(0, r.freeze - dt); }
else {
let f = 1;
if (r.slow > 0) { f = r.slowFactor; r.slow = Math.max(0, r.slow - dt); }
r.timeLeft -= dt * f;
r.consumed += dt * f;
}
clueCheck();
const whole = Math.ceil(r.timeLeft);
if (whole !== r.lastWhole) { r.lastWhole = whole; if (whole <= cfg().lowTimeWarning && whole > 0) bus.emit('tick', { left: whole }); }
if (r.timeLeft <= 0) timeout();
}
function nextClueIn() { const r = G.round; return Math.max(0, r.cluesShown * cfg().clueInterval - r.consumed); }
function clueCheck() {
const r = G.round; if (!r) return;
while (r.cluesShown < r.clueOrder.length && r.consumed >= r.cluesShown * cfg().clueInterval) showClue('time');
}
function showClue(src) {
const r = G.round;
if (r.cluesShown >= r.clueOrder.length) return false;
const idx = r.clueOrder[r.cluesShown++];
bus.emit('clue', { n: r.cluesShown, total: r.clueOrder.length, text: r.entry.h[idx], src });
return true;
}
function timeout() {
const r = G.round;
if (r.reserve > 0) {
r.timeLeft = r.reserve; r.reserve = 0; r.lastWhole = -1;
bus.emit('reserve:used', { secs: r.timeLeft });
return;
}
if (r.armed.phoenix) {
r.armed.phoenix = false; r.timeLeft = 30; r.lastWhole = -1;
bus.emit('perk:proc', { id: 'phoenix', text: 'PHOENIX! +30s' });
return;
}
r.timeLeft = 0;
gameOver('timeout');
}
function gameOver(reason) {
if (G.phase === 'over') return;
clearTarget();
const r = G.round, run = G.run;
if (!r) { G.phase = 'idle'; bus.emit('abort', {}); return; }
G.phase = 'over';
const shown = r.revealed.filter(Boolean).length;
r.revealed = r.revealed.map(() => true);
run.endedAt = Date.now();
run.failedWord = r.word;
run.failedStats = { w: r.word, tier: r.tier, level: run.level, secs: Math.round(r.elapsed * 10) / 10, wrong: r.wrongCount, clues: r.cluesShown, revealed: shown, reason };
run.failedEntry = r.entry;
bus.emit('gameover', { reason, run, round: r });
}
function typeLetter(ch) {
if (G.phase !== 'playing' || G.paused) return;
const r = G.round;
if (r.buffer.length >= r.len) { bus.emit('buffer:full', { buffer: r.buffer }); return; }
registerKey();
if (!r.buffer.length) r.guessStartAt = now();
r.buffer += ch;
bus.emit('buffer', { buffer: r.buffer, added: ch });
}
function backspace(all) {
if (G.phase !== 'playing' || G.paused) return;
const r = G.round;
if (!r.buffer.length) { bus.emit('buffer', { buffer: '', removed: '', empty: true }); return; }
registerKey();
const removed = all ? r.buffer : r.buffer.slice(-1);
r.buffer = all ? '' : r.buffer.slice(0, -1);
bus.emit('buffer', { buffer: r.buffer, removed });
}
function submit() {
if (G.phase !== 'playing' || G.paused) return;
const r = G.round;
const b = r.buffer;
if (!b) { bus.emit('reject', { reason: 'empty' }); return; }
if (b.length !== 1 && b.length !== r.len) { bus.emit('reject', { reason: 'length', need: r.len, have: b.length }); return; }
registerKey();
r.submits++;
const dur = r.guessStartAt ? Math.max(0.05, now() - r.guessStartAt) : 1;
const burst = b.length >= 4 ? (b.length + 1) / dur : 0;
r.buffer = ''; r.guessStartAt = null;
bus.emit('buffer', { buffer: '', submitted: b });
if (b.length === 1 && r.len !== 1) guessLetter(b);
else guessWord(b, burst);
}
function letterStates() {
const r = G.round, st = {};
for (const c of r.wrong) st[c] = 'miss';
for (const c of r.eliminated) st[c] = 'elim';
for (const c of r.dowsed) st[c] = 'dowse';
const seen = new Set(r.word);
for (const c of seen) {
const pos = [...r.word].map((x, i) => x === c ? i : -1).filter(i => i >= 0);
const rev = pos.filter(i => r.revealed[i]).length;
if (rev === pos.length) st[c] = 'hit';
else if (rev > 0 || r.guessed.has(c)) st[c] = 'partial';
}
return st;
}
function reveal(positions, source, letter) {
const r = G.round;
const fresh = positions.filter(i => i >= 0 && i < r.len && !r.revealed[i]);
fresh.forEach(i => (r.revealed[i] = true));
if (fresh.length) {
const per = cfg().chipsPerHit * (r.tier + r.endless) * (r.armed.midas ? 3 : 1);
const gain = source === 'solve' ? 0 : per * fresh.length * (source === 'position' ? 0.5 : 1);
r.chips += Math.round(gain);
if (r.armed.sandthief && source === 'letter') { r.timeLeft += 2 * fresh.length; bus.emit('time:add', { secs: 2 * fresh.length, src: 'sandthief' }); }
bus.emit('reveal', { positions: fresh, source, letter, chips: Math.round(gain), states: letterStates() });
}
return fresh;
}
function guessLetter(ch) {
const r = G.round;
if (r.wrong.has(ch) || (r.guessed.has(ch) && ![...r.word].some((c, i) => c === ch && !r.revealed[i]))) {
bus.emit('reject', { reason: 'repeat', letter: ch }); return;
}
if (r.eliminated.has(ch)) { bus.emit('reject', { reason: 'eliminated', letter: ch }); return; }
if (r.word.includes(ch) && ![...r.word].some((c, i) => c === ch && !r.revealed[i])) {
r.guessed.add(ch); bus.emit('reject', { reason: 'known', letter: ch }); return;
}
if (r.word.includes(ch)) {
r.guessed.add(ch); r.dowsed.delete(ch);
const pos = [...r.word].map((c, i) => (c === ch && !r.revealed[i]) ? i : -1).filter(i => i >= 0);
const fresh = reveal(pos, 'letter', ch);
bus.emit('hit', { letter: ch, positions: fresh, count: fresh.length });
checkSolved('letters');
} else {
r.wrong.add(ch); r.dowsed.delete(ch);
penalty('letter', ch);
}
}
function guessWord(g, burst) {
const r = G.round;
if (g === r.word) { solve('word', burst); return; }
if (r.armed.wager) { r.armed.wager = false; bus.emit('perk:proc', { id: 'wager', text: 'WAGER LOST -8s', bad: true }); r.timeLeft -= 8; r.consumed += 8; }
let fresh = [];
if (cfg().wordGuessRevealsPositions) {
const pos = []; for (let i = 0; i < r.len; i++) if (g[i] === r.word[i] && !r.revealed[i]) pos.push(i);
fresh = reveal(pos, 'position');
}
bus.emit('wordmiss', { guess: g, positions: fresh });
if (checkSolved('letters')) return;
penalty('word', g);
}
function penalty(kind, what) {
const r = G.round, c = cfg();
r.wrongCount++;
if (r.armed.highroller === 'live') { r.armed.highroller = 'busted'; bus.emit('perk:proc', { id: 'highroller', text: 'HIGH ROLLER BUSTED', bad: true }); }
let p = kind === 'letter' ? (hc() ? c.hardcoreLetterPenalty : c.wrongLetterPenalty) : (hc() ? c.hardcoreWordPenalty : c.wrongWordPenalty);
if (r.shield > 0 && p > 0) { r.shield--; bus.emit('miss', { kind, what, penalty: 0, shielded: true, states: letterStates() }); return; }
r.timeLeft -= p;
r.consumed += p;
bus.emit('miss', { kind, what, penalty: p, states: letterStates() });
clueCheck();
if (r.timeLeft <= 0) timeout();
}
function checkSolved(method) {
const r = G.round;
if (G.phase === 'playing' && r.revealed.every(Boolean)) { solve(method, 0); return true; }
return false;
}
function solve(method, burst) {
const r = G.round, run = G.run, c = cfg();
if (G.phase !== 'playing') return;
G.phase = 'solved';
const hidden = r.revealed.filter(v => !v).length;
reveal(hiddenIdx(), 'solve');
const k = method === 'word' && r.len >= 4 ? (burst || 0) : kps();
const kl = kpsLevel(k);
const tierPts = r.tier + r.endless;
const base = r.len * c.chipsPerLetter * tierPts;
const chips = base + r.chips + r.chipsBonus;
const firstTry = method === 'word' && r.submits === 1;
let mult = 1 + r.multAdd + Math.floor(Math.max(0, r.timeLeft) / 10) * c.multPerTenSecondsLeft;
const notes = [];
if (firstTry) { mult *= c.firstTryMult; notes.push(`x${c.firstTryMult} FIRST TRY`); }
mult *= r.multX; if (r.multX > 1) notes.push(`x${r.multX} PERK`);
if (r.armed.highroller === 'live') { mult *= 4; notes.push('x4 HIGH ROLLER'); }
if (r.armed.highroller === 'busted') { mult *= 0.5; notes.push('x0.5 BUSTED'); }
if (r.armed.wager && method === 'word') { mult *= 3; notes.push('x3 WAGER'); }
const km = [1, c.kpsMultHot, c.kpsMultFire, c.kpsMultInferno][kl];
if (kl) { mult *= km; notes.push(`x${km} ${['', 'HOT', 'ON FIRE', 'INFERNO'][kl]}`); }
if (r.halfPoints) { mult *= 0.5; notes.push('x0.5 EASY'); }
if (hc()) { mult *= 1.5; notes.push('x1.5 HARDCORE'); }
mult = Math.round(mult * 100) / 100;
const score = Math.round(chips * mult);
run.score += score;
run.streak = r.wrongCount === 0 ? run.streak + 1 : 0; run.bestStreak = Math.max(run.bestStreak, run.streak);
run.solveSeq = (run.solveSeq || 0) + 1;
run.bestKps = Math.max(run.bestKps, k, r.peakKps);
const rec = { w: r.word, tier: r.tier, endless: r.endless, level: run.level, secs: Math.round(r.elapsed * 10) / 10, kps: Math.round(k * 10) / 10, score, method, hidden,
wrong: r.wrongCount, letters: r.guessed.size + r.wrong.size, clues: r.cluesShown, timeLeft: Math.round(r.timeLeft * 10) / 10, chips, mult, firstTry };
if (firstTry) { run.firstTries = (run.firstTries || 0) + 1; run.bonusNext = (run.bonusNext || 0) + c.firstTryBonusSeconds; }
run.solved.push(rec);
const newF = awardTierFlair();
bus.emit('solve', { method, hidden, chips, mult, score, kps: k, kpsLevel: kl, notes, rec, flourishes: newF, timeLeft: r.timeLeft, tierClear: newF.tierClear, firstTry, bonus: firstTry ? c.firstTryBonusSeconds : 0 });
}
function awardTierFlair() {
const run = G.run, out = [];
out.tierClear = run.level % cfg().levelsPerTier === 0;
if (!out.tierClear) return out;
for (let i = 0; i < cfg().flourishesPerTierClear; i++) {
const id = HM.Avatar.rollFlourish(run.flourishes, run.level);
if (id) { run.flourishes.push(id); out.push(id); }
}
run.lastFlair = out.slice();
return out;
}
function advance() {
if (G.phase !== 'solved') return;
const run = G.run;
if (run.level % cfg().levelsPerTier === 0) openDraft('tier');
else { run.level++; startRound(); }
}
function skipWord() {
clearTarget();
const r = G.round, run = G.run;
G.phase = 'solved';
reveal(hiddenIdx(), 'solve');
run.solved.push({ w: r.word, tier: r.tier, endless: r.endless, level: run.level, secs: Math.round(r.elapsed * 10) / 10, kps: 0, score: 0, method: 'skip', hidden: 0 });
const newF = awardTierFlair();
bus.emit('solve', { method: 'skip', hidden: 0, chips: 0, mult: 0, score: 0, kps: 0, kpsLevel: 0, notes: ['SKIPPED'], rec: run.solved[run.solved.length - 1], flourishes: newF, timeLeft: r.timeLeft, tierClear: newF.tierClear });
}
function openDraft(kind) {
G.phase = 'draft';
const nextTier = tierInfo(G.run.level + (kind === 'start' ? 0 : 1)).tier;
const offers = HM.rollPerks(cfg().draftChoices, nextTier);
G.draft = { kind, offers, pending: null, skipBonus: HM.feature('Scoring') ? 50 * nextTier * nextTier : 0, flair: kind === 'tier' ? (G.run.lastFlair || []) : [] };
bus.emit('draft:open', G.draft);
}
function draftChoose(i) {
if (G.phase !== 'draft' || !G.draft) return;
const p = G.draft.offers[i]; if (!p) return;
const slot = G.run.belt.findIndex(x => !x);
if (slot >= 0) { G.run.belt[slot] = p.id; bus.emit('belt', { belt: G.run.belt, added: slot }); closeDraft(); }
else { G.draft.pending = p; bus.emit('draft:replace', { perk: p, belt: G.run.belt }); }
}
function draftReplace(slot) {
if (!G.draft || !G.draft.pending) return;
G.run.belt[slot] = G.draft.pending.id;
bus.emit('belt', { belt: G.run.belt, added: slot });
closeDraft();
}
function draftSkip() {
if (!G.draft) return;
const bonus = G.draft.skipBonus;
G.run.score += bonus;
bus.emit('draft:skip', { bonus });
closeDraft();
}
function draftBack() {
if (!G.draft || !G.draft.pending) return;
G.draft.pending = null;
bus.emit('draft:open', G.draft);
}
function closeDraft() {
const kind = G.draft.kind;
G.draft = null;
bus.emit('draft:close', {});
if (kind === 'tier') { G.run.level++; bus.emit('tier:up', tierInfo(G.run.level)); }
startRound();
}
let targetCb = null, targetPerk = null;
function clearTarget() { if (targetCb) { targetCb = null; targetPerk = null; bus.emit('target:end', { cancelled: true }); } }
const api = {
get r() { return G.round; }, get run() { return G.run; }, get len() { return G.round.len; },
hidden: hiddenIdx, hiddenLetters, isVowel, shuffle, byRarity,
count: c => [...G.round.word].filter(x => x === c).length,
capPositions(pos) { const max = hiddenIdx().length - 1; return pos.slice(0, Math.max(0, max)); },
revealPositions(pos) { pos = api.capPositions(pos.filter(i => !G.round.revealed[i])); return reveal(pos, 'perk'); },
revealLetters(letters) {
const r = G.round; let pos = [];
for (const c of letters) { [...r.word].forEach((x, i) => { if (x === c && !r.revealed[i]) pos.push(i); }); }
const capped = api.capPositions(pos);
if (capped.length === pos.length) letters.forEach(c => r.guessed.add(c));
return reveal(capped, 'perk');
},
revealFraction(f) {
const n = Math.max(1, Math.round(f * G.round.len));
return api.revealPositions(shuffle(hiddenIdx()).slice(0, n));
},
addTime(s) { const r = G.round; if (s < 0) r.consumed -= s; r.timeLeft = Math.max(0.5, r.timeLeft + s); bus.emit('time:add', { secs: s }); clueCheck(); },
freeze(s) { G.round.freeze += s; bus.emit('time:freeze', { secs: s }); },
slow(f, s) { G.round.slow = Math.max(G.round.slow, s); G.round.slowFactor = f; bus.emit('time:slow', { secs: s }); },
shield(n) { G.round.shield += n; bus.emit('shield', { n: G.round.shield }); },
arm(k, v) { G.round.armed[k] = v; bus.emit('armed', { key: k }); },
skip: () => skipWord(),
cluesLeft() { const r = G.round; return r.clueOrder.length - r.cluesShown; },
revealClues(n) { let k = 0; while (k < n && showClue('perk')) k++; return k; },
absentUnmarked() { const r = G.round; return 'abcdefghijklmnopqrstuvwxyz'.split('').filter(c => !r.word.includes(c) && !r.wrong.has(c) && !r.eliminated.has(c)); },
eliminate(n) { const r = G.round; shuffle(api.absentUnmarked()).slice(0, n).forEach(c => r.eliminated.add(c)); bus.emit('letters', { states: letterStates() }); },
dowse(n) { const r = G.round; shuffle(hiddenLetters().filter(c => !r.guessed.has(c))).slice(0, n).forEach(c => r.dowsed.add(c)); bus.emit('letters', { states: letterStates() }); },
jumble(secs) { const r = G.round; const letters = shuffle(hiddenIdx().map(i => r.word[i])); r.jumble = { letters, until: secs ? now() + secs : Infinity }; bus.emit('jumble', r.jumble); },
xray(secs) { bus.emit('xray', { secs, word: G.round.word }); },
census() {
const r = G.round;
const n = hiddenLetters().length;
r.pinned.push(`${n} distinct letter${n === 1 ? '' : 's'} still hidden`);
shuffle(HM.Hints.structural(r.word).slice(1)).slice(0, 2).forEach(f => r.pinned.push(f));
bus.emit('pinned', { pinned: r.pinned });
},
reroll(delta) {
const ti = tierInfo(G.run.level);
const t = delta ? Math.max(1, ti.tier + delta) : sourceTier(ti.tier, ti.endless);
startRound(takeWord(t), { tier: t, halfPoints: delta < 0 });
},
multX(x) { G.round.multX *= x; bus.emit('mult:change', {}); },
chips(n) { G.round.chipsBonus += n; bus.emit('chips:change', {}); },
toast(text, kind) { bus.emit('toast', { text, kind }); },
target(cb) { targetCb = cb; targetPerk = api._current; bus.emit('target:start', {}); },
echo() { const p = HM.PERK_BY_ID[G.run.lastPerk]; if (!p) return; p.use(api); api.toast('ECHO: ' + p.name.toUpperCase(), 'good'); },
echoCan() { const p = HM.PERK_BY_ID[G.run.lastPerk]; if (!p || p.id === 'echo') return 'Nothing to echo'; return p.can ? p.can(api) : true; },
transform() { api._transform = true; },
};
function usePerk(slot) {
if (G.phase !== 'playing' || G.paused) return { ok: false, reason: 'Not now' };
const id = G.run.belt[slot]; if (!id) return { ok: false, reason: 'Empty slot' };
const p = HM.PERK_BY_ID[id];
const can = p.can ? p.can(api) : true;
if (can !== true) { bus.emit('perk:denied', { slot, reason: can }); return { ok: false, reason: can }; }
api._transform = false;
api._current = { slot, id };
G.run.belt[slot] = null;
G.run.perksUsed++;
bus.emit('perk:used', { slot, perk: p });
p.use(api);
if (api._transform) {
const np = HM.rollPerks(1, G.round.tier, ['pickpocket'])[0];
G.run.belt[slot] = np.id;
api.toast('PICKPOCKETED: ' + np.name.toUpperCase() + (np.lvl ? ' ' + HM.romanLvl(np.lvl) : ''), 'good');
}
if (p.id !== 'echo') G.run.lastPerk = p.id;
bus.emit('belt', { belt: G.run.belt });
if (G.phase === 'playing') checkSolved('letters');
return { ok: true };
}
function targetPick(i) {
if (!targetCb) return false;
if (G.round.revealed[i]) return false;
if (hiddenIdx().length <= 1) { targetCancel(); bus.emit('toast', { text: 'NOTHING LEFT TO SPOTLIGHT · REFUNDED', kind: 'gold' }); return false; }
const cb = targetCb; targetCb = null; targetPerk = null;
cb(i);
bus.emit('target:end', {});
return true;
}
function targetCancel() {
if (!targetCb) return;
const tp = targetPerk;
targetCb = null; targetPerk = null;
if (tp && G.run && !G.run.belt[tp.slot]) { G.run.belt[tp.slot] = tp.id; G.run.perksUsed = Math.max(0, G.run.perksUsed - 1); bus.emit('belt', { belt: G.run.belt }); }
bus.emit('target:end', { cancelled: true });
}
function setPaused(p) { if (G.phase === 'playing' || G.phase === 'loading' || !p) { G.paused = p; bus.emit('pause', { paused: p }); } }
return {
G, nextClueIn, draftBack, newRun, startRound, update, typeLetter, backspace, submit, advance, usePerk, draftChoose, draftReplace, draftSkip,
targetPick, targetCancel, get targeting() { return !!targetCb; }, setPaused, kps, kpsLevel, tierInfo, letterStates,
gameOver, api,
};
})();
