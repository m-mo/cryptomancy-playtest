window.HM = window.HM || {};
HM.Trophies = (function () {
const KEY = 'hm_trophies', MAX = 60;
function all() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
function save(list) {
try { localStorage.setItem(KEY, JSON.stringify(list)); return true; }
catch (e) {
list.slice(Math.floor(list.length / 2)).forEach(t => delete t.thumb);
try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (e2) { return false; }
}
}
function add(run, thumb) {
const t = {
id: run.seed + '-' + run.endedAt, date: run.endedAt, avatar: run.avatar, flourishes: run.flourishes.slice(),
score: run.score, level: run.level, tier: HM.Game.tierInfo(run.level).raw, words: run.solved.map(s => ({ w: s.w, t: s.tier, k: s.kps, s: s.score, m: s.method })),
failed: run.failedWord, bestKps: Math.round(run.bestKps * 10) / 10, bestStreak: run.bestStreak, perksUsed: run.perksUsed,
hardcore: run.hardcore, secs: Math.round((run.endedAt - run.startedAt) / 1000), thumb, theme: HM.config.theme,
};
const list = all(); list.unshift(t);
save(list.slice(0, MAX));
if (run.score > best()) { try { localStorage.setItem('hm_best', String(run.score)); } catch (e) { } }
return t;
}
function bestLevel() { return all().reduce((m, t) => Math.max(m, t.level || 0), 0); }
function best() { try { return +(localStorage.getItem('hm_best') || 0); } catch (e) { return 0; } }
function remove(id) { save(all().filter(t => t.id !== id)); }
function clear() { try { localStorage.removeItem(KEY); localStorage.removeItem('hm_best'); } catch (e) { } }
return { all, add, best, bestLevel, remove, clear };
})();
