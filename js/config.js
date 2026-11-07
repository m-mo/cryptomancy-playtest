window.HM = window.HM || {};
HM.DEFAULT_CONFIG = {
featureScoring: false,
featureSwirlBg: false,
featureLetterGuesses: false,
featureFirstTryBonus: false,
roundSeconds: 60,
wrongLetterPenalty: 2,
wrongWordPenalty: 0,
hardcore: false,
hardcoreWordPenalty: 2,
hardcoreLetterPenalty: 3,
wordGuessRevealsPositions: false,
lowTimeWarning: 10,
levelsPerTier: 3,
maxTier: 10,
endlessTimeShrink: 0,
minRoundSeconds: 20,
flourishesPerTierClear: 2,
beltSize: 3,
draftChoices: 3,
startingDraft: false,
clueCount: 4,
clueInterval: 15,
clueOrder: 'random',
tickerSpeed: 70,
kpsWindow: 1.5,
kpsHot: 5,
kpsFire: 8,
kpsInferno: 11,
kpsMultHot: 1.5,
kpsMultFire: 2,
kpsMultInferno: 3,
chipsPerLetter: 10,
chipsPerHit: 5,
firstTryBonusSeconds: 10,
firstTryMult: 2,
multPerTenSecondsLeft: 1,
theme: 'crypt',
sound: true,
volume: 0.5,
fxIntensity: 1,
pillarHeight: 100,
screenShake: true,
crt: true,
};
HM.CONFIG_LIMITS = {
roundSeconds: [5, 600], wrongLetterPenalty: [0, 30], wrongWordPenalty: [0, 30],
hardcoreWordPenalty: [0, 30], hardcoreLetterPenalty: [0, 30], levelsPerTier: [1, 50],
beltSize: [1, 9], draftChoices: [1, 5], kpsHot: [1, 40], kpsFire: [1, 40], kpsInferno: [1, 40],
fxIntensity: [0, 2], volume: [0, 1], clueInterval: [1, 120], clueCount: [1, 4],
};
HM.clampConfig = function (k, v) {
const lim = HM.CONFIG_LIMITS[k];
return lim && typeof v === 'number' ? Math.min(lim[1], Math.max(lim[0], v)) : v;
};
HM.loadConfig = function () {
const cfg = Object.assign({}, HM.DEFAULT_CONFIG);
try {
const saved = JSON.parse(localStorage.getItem('hm_config') || '{}');
for (const k in saved) if (k in cfg) cfg[k] = saved[k];
} catch (e) { }
try {
const q = new URLSearchParams(location.search);
const map = { time: 'roundSeconds', lp: 'wrongLetterPenalty', wp: 'wrongWordPenalty', tier: 'levelsPerTier' };
const url = {};
for (const [short, key] of Object.entries(map)) {
if (q.has(short) && !isNaN(+q.get(short))) url[key] = HM.clampConfig(key, +q.get(short));
}
if (q.has('mute')) url.sound = false;
if (q.has('hardcore')) url.hardcore = true;
if (q.has('theme')) url.theme = q.get('theme');
if (q.has('scoring')) url.featureScoring = true;
if (q.has('swirl')) url.featureSwirlBg = true;
if (q.has('ftbonus')) url.featureFirstTryBonus = true;
Object.assign(cfg, url);
HM._urlOverrides = url;
HM.DEBUG = q.has('debug') && !window.HM_RELEASE;
} catch (e) { }
return cfg;
};
HM.saveConfig = function (cfg) {
let stored = {};
try { stored = JSON.parse(localStorage.getItem('hm_config') || '{}'); } catch (e) { }
const url = HM._urlOverrides || {};
const diff = {};
for (const k in cfg) {
if (k in url && cfg[k] === url[k]) { if (k in stored) diff[k] = stored[k]; continue; }
if (cfg[k] !== HM.DEFAULT_CONFIG[k]) diff[k] = cfg[k];
}
try { localStorage.setItem('hm_config', JSON.stringify(diff)); } catch (e) { }
};
HM.config = HM.loadConfig();
HM.feature = name => !!HM.config['feature' + name];
