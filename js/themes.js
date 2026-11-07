window.HM = window.HM || {};
HM.Themes = (function () {
const BG_CRYPT = [
[[0.10, 0.27, 0.36], [0.05, 0.13, 0.20], [0.20, 0.55, 0.62]],
[[0.10, 0.36, 0.25], [0.04, 0.16, 0.12], [0.30, 0.70, 0.45]],
[[0.18, 0.22, 0.48], [0.07, 0.08, 0.22], [0.35, 0.45, 0.90]],
[[0.45, 0.25, 0.08], [0.20, 0.09, 0.04], [0.95, 0.60, 0.20]],
[[0.38, 0.12, 0.40], [0.14, 0.04, 0.17], [0.80, 0.35, 0.80]],
[[0.50, 0.12, 0.14], [0.20, 0.04, 0.06], [0.98, 0.37, 0.33]],
[[0.10, 0.36, 0.40], [0.03, 0.12, 0.15], [0.98, 0.70, 0.27]],
[[0.25, 0.25, 0.28], [0.06, 0.06, 0.08], [0.70, 0.70, 0.78]],
[[0.42, 0.06, 0.24], [0.12, 0.02, 0.10], [0.20, 0.85, 0.95]],
[[0.05, 0.05, 0.05], [0.18, 0.02, 0.02], [0.95, 0.20, 0.10]],
[[0.30, 0.00, 0.40], [0.00, 0.00, 0.00], [1.00, 0.85, 0.20]],
];
const BG_CASINO = [
[[0.55, 0.10, 0.12], [0.10, 0.18, 0.40], [0.95, 0.35, 0.30]],
[[0.10, 0.38, 0.26], [0.03, 0.18, 0.12], [0.25, 0.65, 0.42]],
[[0.10, 0.25, 0.55], [0.03, 0.08, 0.25], [0.30, 0.60, 1.00]],
[[0.60, 0.35, 0.05], [0.25, 0.10, 0.02], [1.00, 0.70, 0.20]],
[[0.45, 0.10, 0.45], [0.15, 0.03, 0.20], [0.90, 0.40, 0.90]],
[[0.60, 0.08, 0.10], [0.20, 0.02, 0.05], [1.00, 0.40, 0.35]],
];
const BG_CANDY = [
[[0.98, 0.72, 0.84], [0.70, 0.85, 1.00], [1.00, 0.95, 0.70]],
[[0.75, 0.95, 0.85], [0.95, 0.80, 1.00], [1.00, 1.00, 1.00]],
[[1.00, 0.85, 0.70], [0.85, 0.75, 1.00], [0.70, 1.00, 0.95]],
];
const BG_TERMINAL = [
[[0.02, 0.18, 0.06], [0.00, 0.04, 0.01], [0.10, 0.75, 0.25]],
[[0.18, 0.12, 0.00], [0.03, 0.02, 0.00], [0.95, 0.70, 0.10]],
];
const THEMES = {
crypt: {
name: 'Crypt (default)',
title: ['CRYPTO', 'MANCY'], subtitle: 'a roguelite of words & bones', overTitle: 'HANGED.', meltWord: 'HANGED',
bg: BG_CRYPT,
melt: { base: '#07020a', edge: '#4a0414', glint: '#b0102a' },
forest: {},
fx: ['#ffd166', '#06d6a0', '#4cc9f0', '#f72585', '#ff9e00', '#ffffff', '#b5179e', '#90f1ef'],
vars: {
'--panel': '#2b3a40', '--panel-2': '#1f2b30', '--panel-edge': '#121a1e', '--panel-hi': '#3d5058',
'--ink': '#f4f1e8', '--ink-dim': '#9fb3b8', '--ink-shadow': '#0b1215',
'--accent': '#fe5f55', '--accent-2': '#ff9a00', '--chips': '#009dff', '--mult': '#fe5f55', '--gold': '#f5b244',
'--good': '#4bc292', '--partial': '#c6d84a', '--bad': '#e0414f', '--warn': '#ffb703',
'--tile-face': '#f0d9a8', '--tile-face-hi': '#fbecc8', '--tile-edge': '#c9a66b', '--tile-shadow': '#7a5a32', '--tile-ink': '#2b2118',
'--tile-back': '#3a2a4a', '--tile-back-2': '#4d3862', '--tile-back-mark': '#6d5590',
'--key': '#3a4d55', '--key-edge': '#1a2428', '--key-ink': '#e8f0f0',
'--rar-common': '#5a7a8a', '--rar-uncommon': '#3a9a6a', '--rar-rare': '#c0392b', '--rar-legendary': '#d4a017',
'--font-display': "'Silkscreen', 'Press Start 2P', 'Courier New', monospace",
'--font-body': "'Pixelify Sans', 'VT323', 'Courier New', monospace",
'--radius': '8px', '--crt-opacity': '0.10',
},
},
casino: {
name: 'Casino Felt',
title: ['CRYPTO', 'MANCY'], subtitle: 'all in on every letter', overTitle: 'BUSTED.', meltWord: 'BUSTED',
bg: BG_CASINO,
melt: { base: '#0b0b1a', edge: '#1d3a8a', glint: '#ffd166' },
forest: { sky: ['#0a0710', '#1a0f20', '#2a1530', '#3a1c34'], mountains: '#1c1020', far: '#170d1a', mid: '#0f0812', near: '#050307', fog: [230, 180, 120], wisps: ['#ffd166', '#fe5f55', '#ffffff'], moon: '#ffe9a8' },
fx: ['#ffd166', '#fe5f55', '#009dff', '#ffffff', '#4bc292', '#ff9a00'],
vars: {
'--panel': '#3a4a54', '--panel-2': '#2a363e', '--panel-edge': '#1a2228', '--panel-hi': '#4e6270',
'--ink': '#ffffff', '--ink-dim': '#b8c8d0', '--ink-shadow': '#11181c',
'--accent': '#fe5f55', '--accent-2': '#ff9a00', '--chips': '#009dff', '--mult': '#fe5f55', '--gold': '#f5b244',
'--good': '#4bc292', '--partial': '#e0d34a', '--bad': '#fe5f55', '--warn': '#ff9a00',
'--tile-face': '#fdfdf6', '--tile-face-hi': '#ffffff', '--tile-edge': '#c8c8c0', '--tile-shadow': '#6a6a66', '--tile-ink': '#1a1a2e',
'--tile-back': '#b02a30', '--tile-back-2': '#d23a40', '--tile-back-mark': '#f6c6c8',
'--key': '#4a5a64', '--key-edge': '#20282e', '--key-ink': '#ffffff',
'--rar-common': '#009dff', '--rar-uncommon': '#4bc292', '--rar-rare': '#fe5f55', '--rar-legendary': '#b26cbb',
'--font-display': "'Silkscreen', 'Press Start 2P', 'Courier New', monospace",
'--font-body': "'Pixelify Sans', 'VT323', 'Courier New', monospace",
'--radius': '10px', '--crt-opacity': '0.06',
},
},
candy: {
name: 'Sugar Rush',
title: ['CRYPTO', 'MANCY'], subtitle: 'sweet words, sour deaths', overTitle: 'MELTED.', meltWord: 'MELTED',
bg: BG_CANDY,
melt: { base: '#ff8fab', edge: '#f72585', glint: '#ffffff' },
forest: { sky: ['#3a2a5a', '#6a4a8a', '#a07ab8', '#e0a8c8'], stars: '#ffffff', mountains: '#5a3a6a', far: '#4a2f5a', mid: '#36204a', near: '#24143a', ground: '#24143a', fog: [255, 220, 240], wisps: ['#ffd6e0', '#a0e7e5', '#fff3b0'], moon: '#fff7d6', mushroom: '#ff8fab', blood: '#f72585' },
fx: ['#ff8fab', '#ffd6e0', '#a0e7e5', '#b4f8c8', '#fbe7c6', '#ffffff', '#c3aed6'],
vars: {
'--panel': '#ffffff', '--panel-2': '#ffe3ee', '--panel-edge': '#e07aa0', '--panel-hi': '#fff6fa',
'--ink': '#5a2a4a', '--ink-dim': '#a06a8a', '--ink-shadow': '#ffd6e6',
'--accent': '#f72585', '--accent-2': '#ff9e00', '--chips': '#3a86ff', '--mult': '#f72585', '--gold': '#e09f3e',
'--good': '#2ec27e', '--partial': '#b5c400', '--bad': '#e0414f', '--warn': '#ff9e00',
'--tile-face': '#fff7d6', '--tile-face-hi': '#ffffff', '--tile-edge': '#f4c2d7', '--tile-shadow': '#d47fa6', '--tile-ink': '#5a2a4a',
'--tile-back': '#a0e7e5', '--tile-back-2': '#c4f1f0', '--tile-back-mark': '#ffffff',
'--key': '#ffd6e6', '--key-edge': '#e07aa0', '--key-ink': '#5a2a4a',
'--rar-common': '#7ab8d6', '--rar-uncommon': '#7fd1a8', '--rar-rare': '#f772a5', '--rar-legendary': '#f2b134',
'--font-display': "'Silkscreen', 'Press Start 2P', 'Courier New', monospace",
'--font-body': "'Pixelify Sans', 'VT323', 'Courier New', monospace",
'--radius': '14px', '--crt-opacity': '0',
},
},
terminal: {
name: 'Terminal',
title: ['CRYPTO', 'MANCY'], subtitle: '> ./guess --or-die', overTitle: 'SEGFAULT.', meltWord: 'SEGFAULT',
bg: BG_TERMINAL,
melt: { base: '#000000', edge: '#0a3a12', glint: '#33ff66' },
forest: { sky: ['#000000', '#010a03', '#021406', '#031c09'], stars: '#33ff66', moon: '#a6ffb5', moonShade: '#1f9a40', blood: '#ffb000', mountains: '#021006', far: '#010c04', mid: '#000802', near: '#000000', fog: [51, 255, 102], wisps: ['#33ff66', '#a6ffb5'], eyes: ['#33ff66', '#ffb000'], mushroom: '#33ff66' },
fx: ['#33ff66', '#a6ffb5', '#ffffff', '#ffb000'],
vars: {
'--panel': '#03140a', '--panel-2': '#010a04', '--panel-edge': '#33ff66', '--panel-hi': '#0a2a14',
'--ink': '#33ff66', '--ink-dim': '#1f9a40', '--ink-shadow': '#000000',
'--accent': '#33ff66', '--accent-2': '#ffb000', '--chips': '#33ff66', '--mult': '#ffb000', '--gold': '#ffb000',
'--good': '#33ff66', '--partial': '#b0ff33', '--bad': '#ff3355', '--warn': '#ffb000',
'--tile-face': '#03140a', '--tile-face-hi': '#0a2a14', '--tile-edge': '#33ff66', '--tile-shadow': '#0a3a12', '--tile-ink': '#33ff66',
'--tile-back': '#010a04', '--tile-back-2': '#03140a', '--tile-back-mark': '#1f9a40',
'--key': '#03140a', '--key-edge': '#1f9a40', '--key-ink': '#33ff66',
'--rar-common': '#1f9a40', '--rar-uncommon': '#33ff66', '--rar-rare': '#ffb000', '--rar-legendary': '#ffffff',
'--font-display': "'VT323', 'Courier New', monospace",
'--font-body': "'VT323', 'Courier New', monospace",
'--radius': '0px', '--crt-opacity': '0.25',
},
},
};
let current = null;
function apply(id) {
const th = THEMES[id] || THEMES.crypt;
current = th;
const root = document.documentElement;
for (const [k, v] of Object.entries(th.vars)) root.style.setProperty(k, v);
document.body.dataset.theme = THEMES[id] ? id : 'crypt';
if (HM.BG && HM.BG.setTheme) HM.BG.setTheme(th);
if (HM.FX && HM.FX.setPalette) HM.FX.setPalette(th.fx);
document.querySelectorAll('[data-theme-text]').forEach(el => {
const key = el.dataset.themeText;
const val = th[key];
if (Array.isArray(val)) el.innerHTML = val.map(s => `<span>${s}</span>`).join('<span class="logo-skull"></span>');
else if (val != null) el.textContent = val;
});
return th;
}
return {
list: THEMES,
apply,
get current() { return current || THEMES.crypt; },
register(id, def) { THEMES[id] = def; },
};
})();
