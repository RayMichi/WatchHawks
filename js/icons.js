// ===============================================================
// PIXEL-SYMBOLE FÜR KNÖPFE
//    Gleiche Technik wie die Spielgrafik: Textbild + Farbpalette.
//    Daraus wird ein kleines SVG gebaut, mit dunkler Kontur.
//    In HTML einfach <i data-icon="name"></i> schreiben.
// ===============================================================
const ICON_UMRISS = '#1d1219';

// Farbe abdunkeln (f < 1) / aufhellen (f > 1) – eigene Kopie, weil icons.js vor grafik.js geladen wird
function iconTon(hex, f) {
  let h = hex.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const c = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)).map(v => f < 1 ? v * f : v + (255 - v) * (f - 1));
  return '#' + c.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}

// Mitarbeiter-Porträt im Knuddel-Stil (wie im Laden): Haar in 3 Tönen, Kulleraugen mit Lichtpunkt
// koerper: eigene Zeilen für Schürze, Krawatte …
const KOPF_ICON = ['....hHHHh....', '..hHHjjHHHh..', '.hHjjHHHHHHh.', 'hHjHHHHHHHHHh', 'hHHHHHHHHHHHh', 'hHsssssssssHh',
                   'sseessssseess', 'sseessssseess', 'ssssssmssssss', '.sssssssssss.', '...sssssss...'];
const person = (haar, shirt, koerper = ['....ttttt....', '...sttTtts...', '....tTTTt....', '....pp.pp....', '....oo.oo....'], extra = {}) => ({
  bild: KOPF_ICON.concat(koerper),
  pal: Object.assign({ H: haar, h: iconTon(haar, 0.72), j: iconTon(haar, 1.45), s: '#f6c79a', e: ICON_UMRISS, m: '#8a3a3a',
    t: shirt, T: iconTon(shirt, 0.8), p: '#3a3a58', o: '#4a2c1c' }, extra),
  punkte: [[4, 12], [5, 12], [4, 13], [18, 12], [19, 12], [18, 13]].map(([x, y]) => [x, y, '#ffffff'])   // Lichtpunkte (feine Pixel)
});

const ICONS = {
  // --- Aktionen ---
  bau:      { bild: ['.mmmmmmmd', 'mwwwwwwmd', 'mmmmmmmmd', '.ddd.....'.replace(/d/g, '.'), '....hH...', '....hH...', '....hH...', '....hH...', '....hH...'].map((z, i) => i === 3 ? '.........' : z),   // Hammer
              pal: { m: '#9aa7b0', w: '#e8eef3', d: '#6a7680', h: '#c08850', H: '#7a4e28' } },
  polier:   { bild: ['....w....', '....w....', '...wyw...', '..wyyyw..', 'wwyyYyyww', '..wyyyw..', '...wyw...', '....w....', '....w....'],   // Funkeln
              pal: { w: '#ffffff', y: '#ffe9a0', Y: '#ffd040' } },
  pack:     { bild: ['..rr.rr..', '.r..r..r.', '..rrrrr..', 'bbbbrbbbb', 'bBBBrBBBb', 'rrrrrrrrr', 'bBBBrBBBb', 'bBBBrBBBb', 'bbbbrbbbb'],   // Geschenkpaket
              pal: { b: '#a8723e', B: '#c9925a', r: '#d8485a' } },
  verkauf:  { bild: ['...kk.kk...', '....kkk....', '....sss....', '...sssss...', '..swsddds..', '.sssdsssss.', 'sswddddssss', 'sswsdssssss', 'sssddddssss', 'ssssdssssss', '.ssssdddss.', '..sssssss..'],   // Geldsack mit €
              pal: { k: '#7a4e28', s: '#d8b070', w: '#f0d8a0', d: '#7a4e28' } },
  // --- Mitarbeiter ---
  manager:      person('#4a2a1a', '#3a4a7a', ['....tRRt.....'.replace('tRRt.', 'ttRtt'), '...sttRtts...', '....tTRTt....', '....pp.pp....', '....oo.oo....'], { R: '#d8485a' }),
  uhrmacher:    person('#8a8a8a', '#f3f0e6', ['....ttttt....', '...saaaaas...', '....aAAAa....', '....pp.pp....', '....oo.oo....'], { a: '#8a5a3a', A: '#6a4028' }),
  polierer:     person('#e0b050', '#5aa8a0'),
  packer:       person('#b0482e', '#c9925a'),
  verkaeuferin: person('#2a1a10', '#d0567a'),
  // --- Menüs ---
  upgrades: { bild: ['....g....', '...gGg...', '..gGggg..', '.gGgggggg'.slice(0, 8) + '.', 'ggggggggg', '...Ggg...', '...Ggg...', '...Ggg...', '...ggg...'],   // Pfeil nach oben
              pal: { g: '#6cbf6a', G: '#a8e6a0' } },
  menue:    { bild: ['wwwwww', 'wkkkkw', 'wwwwww', 'wkkkkw', 'wwwwww', 'wkkkkw', 'wwwwww'], pal: { w: '#fff1d6', k: '#8a7a80' } },
  vollbild: { bild: ['kkk...kkk', 'kk.....kk', 'k.......k', '.........', '.........', '.........', 'k.......k', 'kk.....kk', 'kkk...kkk'],
              pal: { k: ICON_UMRISS }, umriss: false },
  zu:       { bild: ['kk...kk', 'kkk.kkk', '.kkkkk.', '..kkk..', '.kkkkk.', 'kkk.kkk', 'kk...kk'], pal: { k: ICON_UMRISS }, umriss: false },
  uhren:    { bild: ['..SSSSS...', '.CCCCCCC..', 'CgFFKFFFC.', 'CFHFFFHFC.', 'CFFHFHFFC.', 'CKFFpFFKCc', 'CFFFFFFFC.', 'CFFFKFFFC.', '.CCCCCCC..', '..SSSSS...'],
              pal: { S: '#7a4a2a', C: '#c0c6cc', g: '#e8ecef', c: '#8a9096', F: '#f4f1e6', K: '#9aa0a6', H: '#222', p: '#111' } },
  laden:    { bild: ['rwrwrwrwr', 'rwrwrwrwr', 'RWRWRWRWR', '.mmmmmmm.', '.mbbmddm.', '.mbBmddm.', '.mbbmdkm.', '.mmmmddm.'],   // Ladenfront mit Markise
              pal: { r: '#d8485a', w: '#fff1d6', R: '#a83040', W: '#d8c8b0', m: '#e8d8bc', b: '#7ab8e0', B: '#c8e8ff', d: '#7a5232', k: '#f0c050' } },
  regal:    { bild: ['bbbbbbb', 'bgbcbgb', 'bbbbbbb', 'bcbgbcb', 'bbbbbbb'], pal: { b: '#7a5232', g: '#f0c050', c: '#c0c6cc' } },
  erfolg:   { bild: ['..rrrrr..', '.rgggggr.', 'rgyyyyygr', 'rgywyyygr', 'rgyyyyygr', 'rgyyyyygr', '.rgggggr.', '..rrrrr..', '..bb.bb..', '..bb.bb..', '..b...b..'],
              pal: { r: '#d8485a', g: '#f0c050', y: '#ffe08a', w: '#ffffff', b: '#5b8bd8' } },
  erfolgGrau: { bild: ['..rrrrr..', '.rgggggr.', 'rgyyyyygr', 'rgywyyygr', 'rgyyyyygr', 'rgyyyyygr', '.rgggggr.', '..rrrrr..', '..bb.bb..', '..bb.bb..', '..b...b..'],
              pal: { r: '#8a7a80', g: '#a89aa0', y: '#c9bcc2', w: '#e0d6da', b: '#7a6c72' } },
  stern:    { bild: ['....y....', '...yyy...', '...wyy...', 'yyywyyyyy', '.ywyyyyy.', '..yyyyy..', '..yyyyy..', '.yyy.yyy.', '.yy...yy.'], pal: { y: '#8fd0ff', w: '#ffffff' } },
  vip:      { bild: ['g...g...g', 'gg.ggg.gg', 'ggggggggg', 'gwgrgbgwg', 'GGGGGGGGG'], pal: { g: '#f0c050', G: '#c8932e', w: '#fff6c0', r: '#d8485a', b: '#5b8bd8' } },   // Krone
  raritaet: { bild: ['...kkk...', '...k.k...', '..ggggg..', '.gwwwwwg.', 'gwwwkwwwg', 'gwwwkwwwg', 'gwwwwkkwg', 'gwwwwwwwg', '.gwwwwwg.', '..ggggg..'],   // Taschenuhr
              pal: { k: '#8a5a12', g: '#f0c050', w: '#fff6dc' } },
  frage:    { bild: ['.kkk.', 'k...k', '...k.', '..k..', '.....', '..k..'], pal: { k: '#8a7a80' } },
  euro:     { bild: ['...OOOOO...', '..OOyyyOO..', '.OywydddyO.', 'OOwydyyyyOO', 'OyyddddyyyO', 'OyyydyyyyyO', 'OyyddddyyyO', 'OOyydyyyyOO', '.OyyydddyO.', '..OOyyyOO..', '...OOOOO...'], pal: { O: '#c8902e', y: '#ffd45a', d: '#8a5a12', w: '#fff4c0' } },   // runde Goldmünze mit €
  gem:      { bild: ['..LLLLL..', '.LwLLLLL.', 'LwLLLLLLL', 'MMMMMMMMM', '.MwMMMmM.', '..MMMmM..', '...MMM...', '....M....'], pal: { L: '#e2b8ff', w: '#ffffff', M: '#a050e8', m: '#7a30c0' } },   // geschliffener Edelstein
  zahnrad:  { bild: ['..k.k.k..', '.kkkkkkk.', 'kkkdddkkk', '.kd...dk.', 'kkd...dkk', '.kd...dk.', 'kkkdddkkk', '.kkkkkkk.', '..k.k.k..'],   // Zahnrad
              pal: { k: '#c9d3da', d: '#8a98a2' } },
  statistik:{ bild: ['.......gg', '.......gg', '....bb.gg', '....bb.gg', '.rr.bb.gg', '.rr.bb.gg', 'kkkkkkkkk'],   // Balkendiagramm
              pal: { g: '#6cbf6a', b: '#5b8bd8', r: '#f0c050', k: '#c9d3da' } },
  welt:     { bild: ['..bbbbb..', '.bggbbbb.', 'bgggbbggb', 'bbggbbggb', 'bbbgbbbgb', 'bbbbbbgbb', '.bbbbbbb.', '..bbbbb..'],   // Globus
              pal: { b: '#5b8bd8', g: '#6cbf6a' } },
  schloss:  { bild: ['..kkkkk..', '.kk...kk.', '.k.....k.', '.k.....k.', 'ggggggggg', 'gGGGdGGGg', 'gGGGdGGGg', 'gGGGGGGGg', 'ggggggggg'],   // Vorhängeschloss
              pal: { k: '#9aa7b0', g: '#c8932e', G: '#f0c050', d: ICON_UMRISS } }
};

function iconSvg(name) {
  const ic = ICONS[name];
  if (!ic) return '';
  return spriteSvg(ic);
}
// Beliebiges Textbild + Palette als SVG (auch für die Charakter-Vorschau)
// Scale2x: verdoppelt die Auflösung eines Sprites und glättet dabei schräge Kanten.
// Aus 1 Pixel werden 2×2 feinere Pixel – so wirkt alles höher aufgelöst, bleibt aber Pixel-Art.
const scale2xCache = new Map();
function scale2x(bild) {
  const key = bild.join('\n');
  if (scale2xCache.has(key)) return scale2xCache.get(key);
  const h = bild.length, w = Math.max(0, ...bild.map(z => z.length));
  const p = (x, y) => (bild[y] && bild[y][x]) || '.';
  const out = [];
  for (let y = 0; y < h; y++) {
    let o0 = '', o1 = '';
    for (let x = 0; x < w; x++) {
      const P = p(x, y), A = p(x, y - 1), B = p(x + 1, y), C = p(x - 1, y), D = p(x, y + 1);
      o0 += (C === A && C !== D && A !== B ? A : P) + (A === B && A !== C && B !== D ? B : P);
      o1 += (D === C && D !== B && C !== A ? C : P) + (B === D && B !== A && D !== C ? D : P);
    }
    out.push(o0, o1);
  }
  scale2xCache.set(key, out);
  return out;
}

function spriteSvg(ic) {
  if (!ic.hd) ic = { ...ic, bild: scale2x(ic.bild), hd: true };
  const R = ic.umriss === false ? 0 : 2;     // Kontur 2 feine Pixel dick (wie die Figuren im Laden)
  const h = ic.bild.length, w = Math.max(...ic.bild.map(z => z.length));
  const voll = (x, y) => ic.bild[y] && ic.pal[ic.bild[y][x]];
  const rand = new Set();
  if (R) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (voll(x, y)) {
    // 1 Pixel rundherum (auch diagonal) + 2. Pixel waagerecht/senkrecht → runde Ecken
    for (const [dx, dy] of [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1],[-2,0],[2,0],[0,-2],[0,2]])
      if (!voll(x + dx, y + dy)) rand.add((x + dx) + ',' + (y + dy));
  }
  let rects = '';
  for (const k of rand) { const [x, y] = k.split(',').map(Number); rects += `<rect x="${x + R}" y="${y + R}" width="1" height="1" fill="${ICON_UMRISS}"/>`; }
  ic.bild.forEach((zeile, y) => {
    for (let x = 0; x < zeile.length; x++) {
      const c = ic.pal[zeile[x]];
      if (c) rects += `<rect x="${x + R}" y="${y + R}" width="1" height="1" fill="${c}"/>`;
    }
  });
  for (const [x, y, c] of ic.punkte || []) rects += `<rect x="${x + R}" y="${y + R}" width="1" height="1" fill="${c}"/>`;
  const W = w + 2 * R, H = h + 2 * R;
  return `<svg viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}

function iconsEinsetzen(wurzel = document) {
  for (const el of wurzel.querySelectorAll('[data-icon]')) el.innerHTML = iconSvg(el.dataset.icon);
}
iconsEinsetzen();
