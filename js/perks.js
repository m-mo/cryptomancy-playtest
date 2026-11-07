window.HM = window.HM || {};
HM.PERK_FAMILIES = {
reveal: { name: 'Reveal', color: '#4cc9f0' },
time: { name: 'Time', color: '#ffd166' },
shield: { name: 'Shield', color: '#90f1ef' },
info: { name: 'Insight', color: '#c3aed6' },
chaos: { name: 'Chaos', color: '#f72585' },
score: { name: 'Score', color: '#f5b244' },
};
HM.RARITY = {
common: { name: 'Common', weight: 60, grow: 0 },
uncommon: { name: 'Uncommon', weight: 28, grow: 2 },
rare: { name: 'Rare', weight: 10, grow: 1.6 },
legendary: { name: 'Legendary', weight: 2, grow: 0.6 },
};
(function () {
const P = [];
const add = (p) => P.push(Object.assign({ lvl: 0, can: null }, p));
const needHidden = n => api => api.hidden().length >= n ? true : 'Not enough hidden letters';
add({ id: 'reveal1', name: 'Peek', lvl: 1, fam: 'reveal', rarity: 'common', desc: 'Reveal one random letter (every copy of it).', can: needHidden(2), use: a => a.revealLetters(a.shuffle(a.hiddenLetters()).slice(0, 1)) });
add({ id: 'reveal2', name: 'Glimpse', lvl: 2, fam: 'reveal', rarity: 'uncommon', desc: 'Reveal 25% of the word.', can: needHidden(2), use: a => a.revealFraction(0.25) });
add({ id: 'reveal3', name: 'Gaze', lvl: 3, fam: 'reveal', rarity: 'rare', desc: 'Reveal 50% of the word.', can: needHidden(2), use: a => a.revealFraction(0.5) });
add({ id: 'reveal4', name: 'Third Eye', lvl: 4, fam: 'reveal', rarity: 'legendary', desc: 'Reveal 75% of the word.', can: needHidden(2), use: a => a.revealFraction(0.75) });
add({ id: 'vowel1', name: 'Vowel Lamp', lvl: 1, fam: 'reveal', rarity: 'common', desc: 'Reveal one vowel letter.', can: a => (a.hidden().length >= 2 && a.hiddenLetters().some(a.isVowel)) || 'No hidden vowels (or only 1 tile left)', use: a => a.revealLetters(a.shuffle(a.hiddenLetters().filter(a.isVowel)).slice(0, 1)) });
add({ id: 'vowel2', name: 'Vowel Lamp', lvl: 2, fam: 'reveal', rarity: 'uncommon', desc: 'Reveal two vowel letters.', can: a => (a.hidden().length >= 2 && a.hiddenLetters().some(a.isVowel)) || 'No hidden vowels (or only 1 tile left)', use: a => a.revealLetters(a.shuffle(a.hiddenLetters().filter(a.isVowel)).slice(0, 2)) });
add({ id: 'vowel3', name: 'Vowel Lamp', lvl: 3, fam: 'reveal', rarity: 'rare', desc: 'Reveal ALL the vowels.', can: a => (a.hidden().length >= 2 && a.hiddenLetters().some(a.isVowel)) || 'No hidden vowels (or only 1 tile left)', use: a => a.revealLetters(a.hiddenLetters().filter(a.isVowel)) });
add({ id: 'cons1', name: 'Consonant Crack', lvl: 1, fam: 'reveal', rarity: 'common', desc: 'Reveal one consonant letter.', can: a => (a.hidden().length >= 2 && a.hiddenLetters().some(c => !a.isVowel(c))) || 'No hidden consonants (or only 1 tile left)', use: a => a.revealLetters(a.shuffle(a.hiddenLetters().filter(c => !a.isVowel(c))).slice(0, 1)) });
add({ id: 'cons2', name: 'Consonant Crack', lvl: 2, fam: 'reveal', rarity: 'uncommon', desc: 'Reveal the two rarest consonants.', can: a => (a.hidden().length >= 2 && a.hiddenLetters().some(c => !a.isVowel(c))) || 'No hidden consonants (or only 1 tile left)', use: a => a.revealLetters(a.byRarity(a.hiddenLetters().filter(c => !a.isVowel(c))).slice(0, 2)) });
add({ id: 'bookend1', name: 'Bookend', lvl: 1, fam: 'reveal', rarity: 'common', desc: 'Reveal the first tile.', can: a => (a.hidden().length >= 2 && !a.r.revealed[0]) || 'Already showing (or only 1 tile left)', use: a => a.revealPositions([0]) });
add({ id: 'bookend2', name: 'Bookend', lvl: 2, fam: 'reveal', rarity: 'uncommon', desc: 'Reveal the first and last tiles.', can: a => (a.hidden().length >= 2 && (!a.r.revealed[0] || !a.r.revealed[a.len - 1])) || 'Already showing (or only 1 tile left)', use: a => a.revealPositions([0, a.len - 1]) });
add({ id: 'rarest', name: 'Odd One Out', fam: 'reveal', rarity: 'uncommon', desc: 'Reveal the rarest letter in the word.', can: needHidden(2), use: a => a.revealLetters(a.byRarity(a.hiddenLetters()).slice(0, 1)) });
add({ id: 'crowd', name: 'Crowd Pleaser', fam: 'reveal', rarity: 'common', desc: 'Reveal the letter that appears most often.', can: needHidden(2), use: a => { const hl = a.hiddenLetters(); hl.sort((x, y) => a.count(y) - a.count(x)); a.revealLetters(hl.slice(0, 1)); } });
add({ id: 'spotlight', name: 'Spotlight', fam: 'reveal', rarity: 'uncommon', desc: 'You pick a tile to reveal. Arrows/click to aim, SPACE to confirm.', can: needHidden(2), use: a => a.target(i => a.revealPositions([i])) });
add({ id: 'mirror', name: 'Mirror Mirror', fam: 'reveal', rarity: 'rare', desc: 'Every revealed tile also reveals its mirror-image position.', can: a => (a.r.revealed.some(Boolean) && a.hidden().length >= 2) || 'Reveal something first', use: a => { const pos = []; a.r.revealed.forEach((v, i) => { const m = a.len - 1 - i; if (v && !a.r.revealed[m]) pos.push(m); }); if (!pos.length) return a.revealFraction(0.15); a.revealPositions(pos); } });
add({ id: 'domino', name: 'Domino', fam: 'reveal', rarity: 'rare', desc: 'Reveal the tile to the right of every revealed tile.', can: a => (a.r.revealed.some(Boolean) && a.hidden().length >= 2) || 'Reveal something first', use: a => { const pos = []; a.r.revealed.forEach((v, i) => { if (v && i + 1 < a.len && !a.r.revealed[i + 1]) pos.push(i + 1); }); if (!pos.length) return a.revealFraction(0.15); a.revealPositions(pos); } });
add({ id: 'time1', name: 'Borrowed Time', lvl: 1, fam: 'time', rarity: 'common', desc: '+10 seconds.', use: a => a.addTime(10) });
add({ id: 'time2', name: 'Borrowed Time', lvl: 2, fam: 'time', rarity: 'uncommon', desc: '+20 seconds.', use: a => a.addTime(20) });
add({ id: 'time3', name: 'Borrowed Time', lvl: 3, fam: 'time', rarity: 'rare', desc: '+35 seconds.', use: a => a.addTime(35) });
add({ id: 'freeze1', name: 'Cold Snap', lvl: 1, fam: 'time', rarity: 'common', desc: 'Freeze the clock for 8 seconds.', use: a => a.freeze(8) });
add({ id: 'freeze2', name: 'Cold Snap', lvl: 2, fam: 'time', rarity: 'uncommon', desc: 'Freeze the clock for 15 seconds.', use: a => a.freeze(15) });
add({ id: 'slow', name: 'Molasses', fam: 'time', rarity: 'uncommon', desc: 'The clock runs at half speed for 20 seconds.', use: a => a.slow(0.5, 20) });
add({ id: 'clutch', name: 'Clutch', fam: 'time', rarity: 'rare', desc: 'Only with 10s or less left: +15 seconds AND reveal a letter.', can: a => a.r.timeLeft <= 10 || 'Only usable at 10s or less', use: a => { a.addTime(15); if (a.hidden().length >= 2) a.revealLetters(a.shuffle(a.hiddenLetters()).slice(0, 1)); } });
add({ id: 'phoenix', name: 'Phoenix Feather', fam: 'time', rarity: 'legendary', desc: 'Arm it: if the clock hits zero this word, revive with 30 seconds.', can: a => !a.r.armed.phoenix || 'Already armed', use: a => a.arm('phoenix', true) });
add({ id: 'hourglass', name: 'Sand Thief', fam: 'time', rarity: 'common', desc: 'Every correct letter this word gives +2 seconds.', can: a => !a.r.armed.sandthief || 'Already active', use: a => a.arm('sandthief', true) });
add({ id: 'shield1', name: 'Bone Shield', lvl: 1, fam: 'shield', rarity: 'common', desc: 'Your next 3 wrong guesses cost no time.', use: a => a.shield(3) });
add({ id: 'shield2', name: 'Bone Shield', lvl: 2, fam: 'shield', rarity: 'uncommon', desc: 'Your next 8 wrong guesses cost no time.', use: a => a.shield(8) });
add({ id: 'shield3', name: 'Bone Shield', lvl: 3, fam: 'shield', rarity: 'rare', desc: 'Wrong guesses cost no time for the rest of this word.', use: a => a.shield(999) });
add({ id: 'hallpass', name: 'Hall Pass', fam: 'shield', rarity: 'rare', desc: 'Skip this word. The level still advances.', use: a => a.skip() });
add({ id: 'oracle1', name: 'Oracle', lvl: 1, fam: 'info', rarity: 'common', desc: 'Unlock the next clue right now.', can: a => a.cluesLeft() > 0 || 'All clues already showing', use: a => a.revealClues(1) });
add({ id: 'oracle2', name: 'Oracle', lvl: 2, fam: 'info', rarity: 'uncommon', desc: 'Unlock ALL remaining clues right now.', can: a => a.cluesLeft() > 0 || 'All clues already showing', use: a => a.revealClues(99) });
add({ id: 'elim1', name: 'Eliminator', lvl: 1, fam: 'info', rarity: 'common', desc: 'Cross out 5 letters that are NOT in the word.', can: a => a.absentUnmarked().length > 0 || 'Nothing to cross out', use: a => a.eliminate(5) });
add({ id: 'elim2', name: 'Eliminator', lvl: 2, fam: 'info', rarity: 'uncommon', desc: 'Cross out 10 letters that are NOT in the word.', can: a => a.absentUnmarked().length > 0 || 'Nothing to cross out', use: a => a.eliminate(10) });
add({ id: 'elim3', name: 'Eliminator', lvl: 3, fam: 'info', rarity: 'rare', desc: 'Cross out EVERY letter not in the word.', can: a => a.absentUnmarked().length > 0 || 'Nothing to cross out', use: a => a.eliminate(26) });
add({ id: 'dowse', name: 'Dowsing Rod', fam: 'info', rarity: 'uncommon', desc: 'Highlight 3 hidden letters on the keyboard (no positions).', can: needHidden(2), use: a => a.dowse(3) });
add({ id: 'jumble1', name: 'Jumble', lvl: 1, fam: 'info', rarity: 'common', desc: 'Flash the hidden letters, scrambled, for 3 seconds.', can: needHidden(2), use: a => a.jumble(3) });
add({ id: 'jumble2', name: 'Jumble', lvl: 2, fam: 'info', rarity: 'uncommon', desc: 'Show the hidden letters, scrambled, for the rest of the word.', can: needHidden(2), use: a => a.jumble(0) });
add({ id: 'xray1', name: 'X-Ray', lvl: 1, fam: 'info', rarity: 'uncommon', desc: 'The whole word flashes visible for half a second. Blink and miss it.', use: a => a.xray(0.5) });
add({ id: 'xray2', name: 'X-Ray', lvl: 2, fam: 'info', rarity: 'rare', desc: 'The whole word flashes visible for 1.2 seconds.', use: a => a.xray(1.2) });
add({ id: 'census', name: 'Census', fam: 'info', rarity: 'common', desc: 'Pin how many distinct letters are still hidden, plus two spelling facts.', use: a => a.census() });
add({ id: 'reroll', name: 'Reroll', fam: 'chaos', rarity: 'uncommon', desc: 'Swap this word for a fresh one of the same tier. Clock resets.', use: a => a.reroll(0) });
add({ id: 'easystreet', name: 'Easy Street', fam: 'chaos', rarity: 'common', desc: 'Swap for an easier word from the previous tier. Clock resets.', can: a => a.r.tier > 1 || 'Already on the easiest tier', use: a => a.reroll(-1) });
add({ id: 'coinflip', name: 'Coin Flip', fam: 'chaos', rarity: 'common', desc: 'Heads: reveal 50% of the word. Tails: lose 10 seconds.', can: needHidden(2), use: a => { if (Math.random() < 0.5) { a.toast('HEADS!', 'good'); a.revealFraction(0.5); } else { a.toast('TAILS...', 'bad'); a.addTime(-10); } } });
add({ id: 'echo', name: 'Echo', fam: 'chaos', rarity: 'rare', desc: 'Re-cast the last perk you used this run.', can: a => a.echoCan(), use: a => a.echo() });
add({ id: 'pickpocket', name: 'Pickpocket', fam: 'chaos', rarity: 'common', desc: 'Transform into a random different perk, right in this slot.', use: a => a.transform() });
add({ id: 'gold', name: 'Golden Tooth', fam: 'score', rarity: 'uncommon', desc: 'x2 mult on this word.', use: a => a.multX(2) });
add({ id: 'diamond', name: 'Diamond Tooth', fam: 'score', rarity: 'rare', desc: 'x3 mult on this word.', use: a => a.multX(3) });
add({ id: 'chipstack', name: 'Chip Stack', fam: 'score', rarity: 'common', desc: '+60 chips per tier on this word.', use: a => a.chips(60 * a.r.tier) });
add({ id: 'highroller', name: 'High Roller', fam: 'score', rarity: 'rare', desc: 'x4 mult if you solve with no more wrong guesses. Miss once: x0.5.', can: a => !a.r.armed.highroller || 'Already armed', use: a => a.arm('highroller', 'live') });
add({ id: 'wager', name: 'Word Wager', fam: 'score', rarity: 'uncommon', desc: 'Next full-word guess: right = x3 mult, wrong = lose 8 seconds.', can: a => !a.r.armed.wager || 'Already armed', use: a => a.arm('wager', true) });
add({ id: 'midas', name: 'Midas Touch', fam: 'score', rarity: 'uncommon', desc: 'Letters you reveal this word give triple chips.', can: a => !a.r.armed.midas || 'Already active', use: a => a.arm('midas', true) });
HM.PERKS = P;
HM.PERK_BY_ID = {};
P.forEach(p => (HM.PERK_BY_ID[p.id] = p));
HM.rollPerks = function (n, tier, exclude = []) {
const out = [];
const ex = new Set(exclude);
if (!HM.feature('Scoring')) P.forEach(p => { if (p.fam === 'score') ex.add(p.id); });
const c = HM.config, run = HM.Game && HM.Game.G.run, hard = run ? run.hardcore : c.hardcore;
const letters = HM.feature('LetterGuesses');
if (!letters) ex.add('hourglass');
const missCosts = (letters && (hard ? c.hardcoreLetterPenalty : c.wrongLetterPenalty) > 0) || (hard ? c.hardcoreWordPenalty : c.wrongWordPenalty) > 0;
if (!missCosts) ['shield1', 'shield2', 'shield3'].forEach(id => ex.add(id));
for (let k = 0; k < n; k++) {
const pool = P.filter(p => !ex.has(p.id) && !out.includes(p));
if (!pool.length) break;
const w = pool.map(p => { const r = HM.RARITY[p.rarity]; return r.weight + r.grow * (tier - 1) * (p.rarity === 'common' ? 0 : 3); });
let s = w.reduce((a, b) => a + b, 0) * Math.random();
let i = 0; for (; i < pool.length; i++) { s -= w[i]; if (s <= 0) break; }
out.push(pool[Math.min(i, pool.length - 1)]);
}
return out;
};
HM.romanLvl = l => ['', 'I', 'II', 'III', 'IV', 'V'][l] || '';
})();
