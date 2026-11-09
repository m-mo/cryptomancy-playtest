(function () {
const LAND = { w: 1180, h: 760 };
const PORT = { w: 760, h: 960 };
const MAX_SCALE = 1.3;
const ASPECT_MAX = 2.2;
const COMPACT_BELOW = 0.72, COMPACT_BELOW_TOUCH = 0.82, HYST = 0.02;
const force = new URLSearchParams(location.search).get('layout');
const coarse = matchMedia('(pointer: coarse)');
const listeners = [];
let raf = 0;
const F = HM.Fit = {
scale: 1, fit: 1, compact: false, portrait: false,
onChange(fn) { listeners.push(fn); },
apply,
toLocal(px) { return px / F.scale; },
};
function safeRect() {
const p = document.getElementById('sa-probe');
if (!p) return { x: 0, y: 0, w: innerWidth, h: innerHeight };
const cs = getComputedStyle(p);
const l = parseFloat(cs.paddingLeft) || 0, t = parseFloat(cs.paddingTop) || 0;
const r = parseFloat(cs.paddingRight) || 0, b = parseFloat(cs.paddingBottom) || 0;
return { x: l, y: t, w: innerWidth - l - r, h: innerHeight - t - b };
}
function apply() {
raf = 0;
const frame = document.getElementById('frame'), root = document.documentElement;
if (!frame) return;
const safe = safeRect();
const fw = Math.min(safe.w, safe.h * ASPECT_MAX), fh = safe.h;
const sl = Math.min(MAX_SCALE, fh / LAND.h, fw / LAND.w), sp = Math.min(MAX_SCALE, fh / PORT.h, fw / PORT.w);
const portrait = sp > sl * 1.05;
const fit = portrait ? sp : sl;
const floor = coarse.matches ? COMPACT_BELOW_TOUCH : COMPACT_BELOW;
const tx = ((HM.config && HM.config.textScale) || 100) / 100;
const compact = force === 'compact' ? true : force === 'frame' ? false
: tx > 1.25 || (F.compact ? fit < floor + HYST : fit < floor);
let s, W, H, x, y;
if (compact) {
s = 1; W = safe.w; H = safe.h; x = safe.x; y = safe.y;
} else {
s = fit;
if (devicePixelRatio >= 2 && !coarse.matches && s > 1 && s <= 1.1) s = 1;
W = fw; H = fh; x = safe.x + (safe.w - fw) / 2; y = safe.y + (safe.h - fh) / 2;
}
frame.style.width = (W / s) + 'px';
frame.style.height = (H / s) + 'px';
frame.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) scale(${s})`;
root.style.setProperty('--s', s);
root.classList.toggle('compact', compact);
root.classList.toggle('portrait', !compact && portrait);
root.classList.add('fitted');
F.scale = s; F.fit = fit; F.compact = compact; F.portrait = !compact && portrait;
listeners.forEach(fn => { try { fn(F); } catch (e) { console.error(e); } });
}
function schedule() { if (!raf) raf = requestAnimationFrame(apply); }
addEventListener('resize', schedule);
if (coarse.addEventListener) coarse.addEventListener('change', schedule);
apply();
})();
