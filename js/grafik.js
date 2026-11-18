// ===============================================================
// 6. PIXEL-GRAFIK – Grundriss von schräg oben, Cartoon-Stil
//    Der Laden ist 192 x 128 Spielpixel groß. Gezeichnet wird in
//    ein kleines Pixelbild, das danach scharf hochskaliert wird.
//    Stil: dicke dunkle Umrandungen, runde Formen, große Köpfe,
//    ruhige Böden ohne viel Muster.
// ===============================================================
const cv = document.getElementById('szene');
const ctx = cv.getContext('2d');
const off = document.createElement('canvas');
const octx = off.getContext('2d');
let U = 4, lox = 0, loy = 0;
const S = 2;   // Auflösung: 2×2 feine Pixel pro Spieleinheit (vorher 1)

// Maße des größten Ladens – danach richtet sich der Maßstab, damit kleine
// Läden auch wirklich kleiner aussehen (mehr Bürgersteig drumherum).
const MAX_W = 214, MAX_H = 138;
let layoutW = 0;
function groesse() {
  const b = document.getElementById('buehne');
  const W = b.clientWidth, H = b.clientHeight;
  if (!W || !H) return;
  cv.width = W; cv.height = H;
  // Knöpfe stehen unten -> Platz unten lassen. Breitbild: seitlich Platz für die Anzeigen oben links/rechts.
  const desktop = DESKTOP.matches;
  const oben = desktop ? 28 : 64, unten = desktop ? 84 : 76, seite = desktop ? 190 : 0;
  const SCHILD = SCHILD_H + 6;   // Spielpixel über dem Laden für das Ladenschild
  const L = layout();
  layoutW = L.W;
  // Desktop: Maßstab vom größten Laden (kleine Läden wirken klein). Handy: jeder Laden füllt den Platz.
  const refW = desktop ? MAX_W : L.W, refH = desktop ? MAX_H : L.H;
  U = Math.max(1, Math.min((W - 2 * seite) / (refW + 4), (H - oben - unten) / (refH + 4 + SCHILD)));
  off.width = Math.ceil(W / U * S) + 2;
  off.height = Math.ceil(H / U * S) + 2;
  lox = Math.round((W - L.W * U) / 2 / U * S) / S;
  loy = Math.round((oben + Math.max(0, (H - oben - unten - (L.H + SCHILD) * U) / 2)) / U * S) / S + SCHILD;
}
const DESKTOP = matchMedia('(min-width: 900px) and (min-aspect-ratio: 6/5)');   // gleiche Regel wie im CSS
new ResizeObserver(groesse).observe(document.getElementById('buehne'));
DESKTOP.addEventListener('change', groesse);

// ---------- Farbpalette (alles an einer Stelle) ----------
const F = {
  umriss:   '#1d1219',
  draussen: '#1b1420',
  wandOben: '#3a2632', wandVorne: '#6b4558', wandKante: '#835a6d',
  holz:     '#b88a5c', holzLinie: '#ab7e52',
  fliese:   '#bcd8cf', flieseLinie: '#b0cec4',
  teppich:  '#9b5a6a', teppichRand: '#b2717f',
  lager:    '#8f857e', lagerLinie: '#82786f', lagerWand: '#6e5a50', lagerWandLinie: '#5e4c43',
  tisch:    '#9a6a42', tischHell: '#b8845a', tischVorne: '#7a5232',
  metall:   '#9aa7b0', metallHell: '#c9d3da', metallVorne: '#76838c',
  gold:     '#f0c050', goldDunkel: '#c8932e',
  haut:     '#f6c79a', wange: '#f29aa0', mund: '#8a3a3a',
  pflanze:  '#5fae5a', pflanzeHell: '#86cf6e', topf: '#c97a4a',
  schatten: 'rgba(20,10,20,.28)'
};

const F_BASIS = Object.assign({}, F);

// ---------- Filialen-Looks ----------
// Jede Filiale überschreibt Farben und bringt eigene Deko mit.
const THEMEN = [
  { // 0: Hinterhof-Laden – klein und runtergekommen
    farben: { lager: '#77706a', lagerLinie: '#6a635d', lagerWand: '#55484a', lagerWandLinie: '#463a3c',  wandOben: '#2e2428', wandVorne: '#5e4e52', wandKante: '#6e5c60',
              holz: '#8f7050', holzLinie: '#7f6244', fliese: '#aab5ae', flieseLinie: '#9ca79f',
              teppich: '#6e4c56', teppichRand: '#7c5a64', tisch: '#7a5838', tischHell: '#8e6a46', tischVorne: '#5e4228',
              metall: '#8a9298', metallHell: '#a8b0b6', metallVorne: '#6a7278' },
    deko: dekoRuine },
  { farben: { lager: '#a39484', lagerLinie: '#968776', }, deko: null },   // 1: Fußgängerzone – der bekannte Look
  { // 2: Einkaufszentrum – hell und modern
    farben: { lager: '#c5cad0', lagerLinie: '#b6bcc3', lagerWand: '#9aa3ad', lagerWandLinie: '#8a939d',  wandOben: '#3a4450', wandVorne: '#aab6c0', wandKante: '#c4ced6',
              holz: '#d4d8dc', holzLinie: '#cbd0d5', fliese: '#eef3f5', flieseLinie: '#e2e9ec',
              teppich: '#4d6f8f', teppichRand: '#5f81a1', tisch: '#e6e8ee', tischHell: '#ffffff', tischVorne: '#c6cad2' },
    deko: dekoModern },
  { // 3: Flagship-Store – dunkel mit Gold
    farben: { lager: '#4e474b', lagerLinie: '#443e42', lagerWand: '#3a3236', lagerWandLinie: '#2e272b',  wandOben: '#1e1a20', wandVorne: '#3a3038', wandKante: '#c8a04a',
              holz: '#5a3a28', holzLinie: '#4e3222', fliese: '#f2eee8', flieseLinie: '#e6e0d8',
              teppich: '#26222a', teppichRand: '#c8a04a', tisch: '#3a2a22', tischHell: '#5a4234', tischVorne: '#2a1e18' },
    deko: dekoLuxus },
  { // 4: Luxus-Boutique – Samt und Gold
    farben: { lager: '#4c3f58', lagerLinie: '#43374e', lagerWand: '#3a2c46', lagerWandLinie: '#2e223a',  wandOben: '#24162c', wandVorne: '#4a2a5a', wandKante: '#d4af37',
              holz: '#6a4a3a', holzLinie: '#5e4030', fliese: '#f4f0f8', flieseLinie: '#e8e2ee',
              teppich: '#5a2a6a', teppichRand: '#d4af37', tisch: '#2a1e18', tischHell: '#4a3426', tischVorne: '#1e140e' },
    deko: dekoLuxus }
];
const thema = () => THEMEN[Math.min(spiel.filiale, THEMEN.length - 1)];

// ---------- Zeichen-Helfer ----------
// Rechteck in Spieleinheiten; Werte auf das feine Raster (1/S) gerundet
const P = 1 / S;   // ein feiner Pixel
function r(x, y, w, h, c) {
  const x0 = Math.round((lox + x) * S), y0 = Math.round((loy + y) * S);
  octx.fillStyle = c; octx.fillRect(x0, y0, Math.round((lox + x + w) * S) - x0, Math.round((loy + y + h) * S) - y0);
}

// Sprite zeichnen. Standardmäßig bekommt jede Figur automatisch
// eine dunkle Kontur – das macht den Cartoon-Look.
// Das Sprite wird per Scale2x verdoppelt (feinere, rundere Kanten); die Kontur ist
// 1 feiner Pixel dick (auch diagonal), damit sie trotzdem kräftig wirkt.
// Kontur: 2 feine Pixel dick (ähnlich kräftig wie bei den Tischen), Ecken abgerundet.
// Jede Kombination aus Bild/Farben wird einmal auf eine kleine Leinwand gezeichnet und dann nur noch kopiert.
const spriteCache = new Map();
const RAND = 2;   // Konturdicke in feinen Pixeln
function spriteLeinwand(bild, pal, nur, umriss) {
  const key = bild.join('/') + '|' + JSON.stringify(pal) + '|' + (nur || '') + '|' + umriss + '|' + F.umriss;
  let c = spriteCache.get(key);
  if (c) return c;
  const hd = scale2x(bild), h = hd.length, w = Math.max(...hd.map(z => z.length));
  c = document.createElement('canvas'); c.width = w + 2 * RAND; c.height = h + 2 * RAND;
  const k = c.getContext('2d');
  const sichtbar = ch => pal[ch] && (!nur || nur.includes(ch));
  if (umriss) {
    k.fillStyle = F.umriss;
    hd.forEach((zeile, j) => { for (let i = 0; i < zeile.length; i++) if (sichtbar(zeile[i])) {
      k.fillRect(i + RAND - 1, j + RAND - 1, 3, 3);                 // 1 Pixel rundherum (auch diagonal)
      k.fillRect(i, j + RAND, 2 * RAND + 1, 1);                       // 2. Pixel waagerecht
      k.fillRect(i + RAND, j, 1, 2 * RAND + 1);                       // 2. Pixel senkrecht
    } });
  }
  hd.forEach((zeile, j) => { for (let i = 0; i < zeile.length; i++) if (sichtbar(zeile[i])) { k.fillStyle = pal[zeile[i]]; k.fillRect(i + RAND, j + RAND, 1, 1); } });
  if (spriteCache.size > 600) spriteCache.clear();
  spriteCache.set(key, c);
  return c;
}
function sprite(bild, pal, x, y, opt = {}) {
  const c = spriteLeinwand(bild, pal, opt.nur, opt.umriss !== false);
  octx.drawImage(c, Math.round((lox + x) * S) - RAND, Math.round((loy + y) * S) - RAND);
}

// Weicher Schatten unter Dingen
function schatten(x, y, w) { r(x + 1, y, w - 2, 2, F.schatten); r(x + P, y + P, w - 2 * P, 1.5, F.schatten); }

// Möbelstück in Schrägansicht: Oberseite + Vorderseite, runde Ecken, Umriss
function moebel(x, y, w, h, oben, hell, vorne, tiefe = 4) {
  schatten(x, y + h, w);
  // feine Kontur (1 feiner Pixel) mit abgerundeten Ecken
  r(x + 1, y - P, w - 2, h + 2 * P, F.umriss); r(x - P, y + 1, w + 2 * P, h - 2, F.umriss); r(x, y, w, h, F.umriss);
  r(x + P, y + P, w - 2 * P, h - 2 * P, oben);
  r(x + 1.5, y + P, w - 3, P, hell);
  r(x + P, y + h - P - tiefe, w - 2 * P, tiefe, vorne);
  r(x + P, y + h - P - tiefe, w - 2 * P, P, 'rgba(0,0,0,.18)');   // Kante zwischen Oberseite und Front
}

// Fortschrittsbalken mit Rahmen
function balken(x, y, w, anteil, farbe = F.gold) {
  r(x, y - P, w, 3 + 2 * P, F.umriss); r(x - P, y, w + 2 * P, 3, F.umriss);
  r(x, y, w, 3, '#3a2a32');
  const fw = Math.round(w * Math.max(0, Math.min(1, anteil)) * S) / S;
  if (fw > 0) { r(x, y, fw, 3, farbe); r(x, y, fw, P, 'rgba(255,255,255,.35)'); }
}

// ===============================================================
// PIXEL-SCHRIFT – wird direkt ins Pixelbild gezeichnet (scharf, passt zum Stil)
//   GROSS: 5×7 Pixel (Ladenname, Geld-Zahlen) · KLEIN: 3×5 Pixel (Raumschilder, Untertitel)
//   Nur Großbuchstaben; Kleinbuchstaben werden automatisch groß geschrieben.
// ===============================================================
const GROSS = { h: 7, z: {
  A: '.###./#...#/#...#/#####/#...#/#...#/#...#', B: '####./#...#/#...#/####./#...#/#...#/####.',
  C: '.###./#...#/#..../#..../#..../#...#/.###.', D: '####./#...#/#...#/#...#/#...#/#...#/####.',
  E: '#####/#..../#..../####./#..../#..../#####', F: '#####/#..../#..../####./#..../#..../#....',
  G: '.###./#...#/#..../#.###/#...#/#...#/.####', H: '#...#/#...#/#...#/#####/#...#/#...#/#...#',
  I: '###/.#./.#./.#./.#./.#./###',               J: '..###/...#./...#./...#./...#./#..#./.##..',
  K: '#...#/#..#./#.#../##.../#.#../#..#./#...#', L: '#..../#..../#..../#..../#..../#..../#####',
  M: '#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#', N: '#...#/#...#/##..#/#.#.#/#..##/#...#/#...#',
  O: '.###./#...#/#...#/#...#/#...#/#...#/.###.', P: '####./#...#/#...#/####./#..../#..../#....',
  Q: '.###./#...#/#...#/#...#/#.#.#/#..#./.##.#', R: '####./#...#/#...#/####./#.#../#..#./#...#',
  S: '.####/#..../#..../.###./....#/....#/####.', T: '#####/..#../..#../..#../..#../..#../..#..',
  U: '#...#/#...#/#...#/#...#/#...#/#...#/.###.', V: '#...#/#...#/#...#/#...#/#...#/.#.#./..#..',
  W: '#...#/#...#/#...#/#.#.#/#.#.#/#.#.#/.#.#.', X: '#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
  Y: '#...#/#...#/.#.#./..#../..#../..#../..#..', Z: '#####/....#/...#./..#../.#.../#..../#####',
  'Ä': '.#.#./...../.###./#...#/#####/#...#/#...#', 'Ö': '.#.#./...../.###./#...#/#...#/#...#/.###.',
  'Ü': '.#.#./...../#...#/#...#/#...#/#...#/.###.',
  0: '.###./#...#/#..##/#.#.#/##..#/#...#/.###.', 1: '.#./##./.#./.#./.#./.#./###',
  2: '.###./#...#/....#/...#./..#../.#.../#####', 3: '####./....#/....#/.###./....#/....#/####.',
  4: '#..#./#..#./#..#./#####/...#./...#./...#.', 5: '#####/#..../####./....#/....#/#...#/.###.',
  6: '.###./#..../#..../####./#...#/#...#/.###.', 7: '#####/....#/...#./..#../.#.../.#.../.#...',
  8: '.###./#...#/#...#/.###./#...#/#...#/.###.', 9: '.###./#...#/#...#/.####/....#/....#/.###.',
  ' ': '../../../../../../..', '.': '././././././#', ',': '../../../../../.#/#.', '!': '#/#/#/#/#/./#',
  '?': '.###./#...#/....#/...#./..#../...../..#..', '-': '.../.../.../###/.../.../...', "'": '#/#/./././././.',
  '&': '.##../#..#./#.#../.#.../#.#.#/#..#./.##.#', ':': './#/./././#/.', '/': '....#/...#./...#./..#../.#.../.#.../#....',
  '+': '...../..#../..#../#####/..#../..#../.....', '(': '.#/#./#./#./#./#./.#', ')': '#./.#/.#/.#/.#/.#/#.',
  '€': '..###/.#.../####./.#.../####./.#.../..###', '*': '...../#.#.#/.###./#####/.###./#.#.#/.....'
} };
const KLEIN = { h: 5, z: {
  A: '###/#.#/###/#.#/#.#', B: '###/#.#/##./#.#/###', C: '.##/#../#../#../.##', D: '##./#.#/#.#/#.#/##.',
  E: '###/#../###/#../###', F: '###/#../###/#../#..', G: '.##/#../#.#/#.#/.##', H: '#.#/#.#/###/#.#/#.#',
  I: '###/.#./.#./.#./###', J: '..#/..#/..#/#.#/.#.', K: '#.#/#.#/##./#.#/#.#', L: '#../#../#../#../###',
  M: '#...#/##.##/#.#.#/#...#/#...#', N: '#..#/##.#/#.##/#..#/#..#', O: '.#./#.#/#.#/#.#/.#.',
  P: '###/#.#/###/#../#..', Q: '.#./#.#/#.#/#.#/.##', R: '###/#.#/##./#.#/#.#', S: '.##/#../###/..#/##.',
  T: '###/.#./.#./.#./.#.', U: '#.#/#.#/#.#/#.#/###', V: '#...#/#...#/.#.#./.#.#./..#..', W: '#...#/#...#/#.#.#/#.#.#/.#.#.',
  X: '#.#/#.#/.#./#.#/#.#', Y: '#.#/#.#/.#./.#./.#.', Z: '###/..#/.#./#../###',
  0: '###/#.#/#.#/#.#/###', 1: '##./.#./.#./.#./###', 2: '##./..#/.#./#../###', 3: '##./..#/.#./..#/##.',
  4: '#.#/#.#/###/..#/..#', 5: '###/#../##./..#/##.', 6: '.##/#../###/#.#/###', 7: '###/..#/.#./.#./.#.',
  8: '###/#.#/###/#.#/###', 9: '###/#.#/###/..#/##.',
  ' ': '././././.', '.': '././././#', ',': '././././#', '!': '#/#/#/./#', '?': '##./..#/.#./.../.#.',
  '-': '.../.../###/.../...', "'": '#/#/./././', '&': '.#./#.#/.#./#.#/.##', ':': './#/./#/.', '/': '..#/..#/.#./#../#..',
  '+': '.../.#./###/.#./...', '(': '.#/#./#./#./.#', ')': '#./.#/.#/.#/#.'
} };
// Umlaute im kleinen Font: Grundbuchstabe + zwei Punkte darüber
const UMLAUT = { 'Ä': 'A', 'Ö': 'O', 'Ü': 'U' };
const glyph = (font, ch) => {
  let g = font.z[ch];
  if (!g && UMLAUT[ch]) g = font.z[UMLAUT[ch]];
  if (!g) g = font.z['?'];
  if (typeof g === 'string') g = font.z[ch] = g.split('/');   // einmal zerlegen, dann merken
  return g;
};
const pixelZeichen = t => [...String(t).toUpperCase()];
function textBreite(t, font) {
  const z = pixelZeichen(t);
  return z.reduce((s, ch) => s + glyph(font, ch)[0].length, 0) + Math.max(0, z.length - 1);
}
// x = Mitte, y = Oberkante. schatten: Farbe für 1 Pixel Schatten unten rechts (optional)
function pixelText(t, x, y, font, farbe, schatten) {
  let px = Math.round(x - textBreite(t, font) / 2);
  y = Math.round(y);
  for (const ch of pixelZeichen(t)) {
    const g = glyph(font, ch), w = g[0].length;
    const punkte = font === KLEIN && UMLAUT[ch];
    // Buchstaben mit Scale2x geglättet (runde Kanten); die Glyphen sind so gebaut, dass dabei keine Zacken entstehen
    const hd = scale2x(g);
    for (const [farb, d] of schatten ? [[schatten, P], [farbe, 0]] : [[farbe, 0]]) {
      for (let j = 0; j < hd.length; j++) for (let i = 0; i < hd[j].length; i++) if (hd[j][i] === '#') r(px + i * P + d, y + j * P + d, P, P, farb);
      if (punkte) { r(px + d, y - 2 + d, 1, 1, farb); r(px + w - 1 + d, y - 2 + d, 1, 1, farb); }
    }
    px += w + 1;
  }
}

// Sprechblase mit Zeichen ("!" = fertig/wartet, "?" = Kunde wartet auf Ware).
// Wird gesammelt und erst ganz zum Schluss gezeichnet – also immer über Schildern und Texten.
// "!" = gelbe Blase mit dunkelrotem Zeichen, "?" = weiße Blase mit blauem Zeichen.
let blasen = [];
const blase = (x, y, zeichen) => blasen.push([x, y + Math.round(Math.sin(zeit * 5)), zeichen]);
const ZEICHEN = {
  '!': { dx: 2.5, bild: ['.##..', '.##..', '.##..', '.##..', '.....', '.##..'] },
  '?': { dx: 2,   bild: ['.###.', '##.##', '...##', '..##.', '.....', '..##.'] }
};
function rs(x, y, w, h, c) {   // Rechteck direkt auf dem Bildschirm (Spielpixel → px, auf feine Pixel gerundet)
  const f = U / S, px = v => Math.round(Math.round(v * S) * f);   // ganze Bildschirmpixel → keine Fugen
  const x0 = px(lox + x), y0 = px(loy + y);
  ctx.fillStyle = c; ctx.fillRect(x0, y0, px(lox + x + w) - x0, px(loy + y + h) - y0);
}
function blasenZeichnen() {
  for (const [x, y, z] of blasen) {
    const frage = z === '?', fuell = frage ? '#ffffff' : '#ffd84a', schatten = frage ? '#c9d6e6' : '#e0a82a';
    const farbe = frage ? '#2f6fd0' : '#a8202a', o = F.umriss;
    // Kontur (1 Spielpixel dick), gleiche runde Form wie vorher
    rs(x - 1, y, 11, 8, o); rs(x, y - 1, 9, 10, o);
    rs(x + 2.5, y + 8, 4, 2.5, o); rs(x + 3.5, y + 10, 2, 1, o);
    // Füllung + Schatten unten
    rs(x, y + 0.5, 9, 7, fuell); rs(x + 0.5, y, 8, 8, fuell);
    rs(x + 0.5, y + 6.5, 8, 1.5, schatten);
    rs(x + 3.5, y + 8, 2, 1.5, schatten); rs(x + 4, y + 9.5, 1, 0.5, schatten);
    rs(x + 1, y + 0.5, 2, 1, 'rgba(255,255,255,.8)');                 // Glanzpunkt oben links
    // Zeichen als zusammenhängende waagerechte Striche (keine Fugen zwischen den Pixeln)
    const zc = ZEICHEN[z];
    zc.bild.forEach((zeile, j) => {
      for (let i = 0; i < zeile.length; i++) if (zeile[i] === '#') {
        let n = 1; while (zeile[i + n] === '#') n++;
        rs(x + zc.dx + i, y + 0.5 + j, n, 1, farbe);
        i += n - 1;
      }
    });
  }
  blasen = [];
}

// Text kommt über das hochskalierte Bild: erst sammeln, dann am Ende zeichnen
let textPuffer = [];
const text = (...a) => textPuffer.push(a);
// Menü-Schrift „Press Start 2P“: jedes Zeichen ist genau g breit (Monospace), Großbuchstaben ca. 7/8 g hoch.
// y = Mitte der Großbuchstaben, x = Mitte des Textes; optional dunkler Schatten unten rechts.
const webBreite = (t, g) => [...t].length * g - g / 8;   // letzter Zeichenabstand zählt nicht
function textJetzt(t, x, y, g, farbe, schatten) {
  const px = Math.max(6, Math.round(g * U));
  ctx.font = px + 'px "Press Start 2P", monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const sx = Math.round((lox + x) * U + px / 16), sy = Math.round((loy + y) * U + px / 16);
  if (schatten) { const d = Math.max(1, Math.round(px / 8)); ctx.fillStyle = schatten; ctx.fillText(t, sx + d, sy + d); }
  ctx.fillStyle = farbe; ctx.fillText(t, sx, sy);
}
function flushTexte() { for (const a of textPuffer) textJetzt(...a); textPuffer = []; }

// ---------- Sprites (Buchstabe = Farbe aus der Palette) ----------
// Uhr: s = Armband, c = Gehäuse, f = Zifferblatt, w = Glanz, h = Zeiger
// Eine Uhr für alles (Werkstatt, Polierraum, Packtisch, Lager, Vitrinen): Stil „Ikone 10:10“, 10 × 10
// S = Armband, C = Gehäuse, g = Gehäuse-Glanz, c = Krone, F = Zifferblatt, K = Stundenmarken, H = Zeiger (10:10), p = Mittelpunkt
const UHR_MINI = ['..SSSSS...', '.CCCCCCC..', 'CgFFKFFFC.', 'CFHFFFHFC.', 'CFFHFHFFC.', 'CKFFpFFKCc', 'CFFFFFFFC.', 'CFFFKFFFC.', '.CCCCCCC..', '..SSSSS...'];
const uhrFarben = m => ({ S: m.farben.S, C: m.farben.C, g: ton(m.farben.C, 1.5), c: ton(m.farben.C, 0.75), F: m.farben.F,
  K: m.farben.K, H: m.farben.H, p: ton(m.farben.H, 0.7) });

// Figur von vorne: großer Kopf, kleiner Körper
// h = Haare, s = Haut, e = Augen, b = Wangen, m = Mund, t = Shirt, p = Schuhe
// ---------- Figuren im „Knuddel“-Stil: runder Riesenkopf, große Kulleraugen, Mini-Körper (13 × 16) ----------
// H = Haar, h = Haar dunkel, j = Haar-Glanz, s = Haut, e = Augen, m = Mund, t/T = Shirt hell/dunkel, p = Hose, o = Schuhe
const GESICHT = ['sseessssseess', 'sseessssseess', 'ssssssmssssss', '.sssssssssss.', '...sssssss...'];
const KOERPER = ['....ttttt....', '...sttttts...', '....tTTTt....', '....pp.pp....', '....oo.oo....'];
const HAAR_OBEN = ['....hHHHh....', '..hHHjjHHHh..', '.hHjjHHHHHHh.', 'hHjHHHHHHHHHh', 'hHHHHHHHHHHHh', 'hHsssssssssHh'];
const FRISUREN = {
  kurz:   { name: 'Kurz',   kopf: HAAR_OBEN.concat(GESICHT) },
  lang:   { name: 'Lang',   kopf: HAAR_OBEN.concat(['HseessssseesH', 'HseessssseesH', 'HsssssmsssssH', 'hHsssssssssHh', '.hH.sssss.Hh.']) },
  dutt:   { name: 'Dutt',   kopf: ['.....hHh.....', '....hHjHh....', '..hHHjjHHHh..', '.hHjHHHHHHHh.', 'hHHHHHHHHHHHh', 'hHsssssssssHh'].concat(GESICHT) },
  stachel:{ name: 'Stacheln', kopf: ['..h.hH.Hh.h..', '.hHHhjjHhHHh.', '.hHjjHHHHHHh.', 'hHjHHHHHHHHHh', 'hHHHHHHHHHHHh', 'hHsssssssssHh'].concat(GESICHT) },
  glatze: { name: 'Glatze', kopf: ['.............', '....sssss....', '..sssssssss..', '.sssssssssss.', 'sssssssssssss', 'sssssssssssss'].concat(GESICHT) }
};
// Extras liegen über der Figur; dy = Zeilen über dem Kopf (Zylinder ragt nach oben)
const EXTRAS = {
  keins:  { name: 'Nichts' },
  brille: { name: 'Brille', bild: ['', '', '', '', '', '.kkkk...kkkk.', '.k..kkkkk..k.', '.k..k...k..k.', '.kkkk...kkkk.'], pal: { k: '#8a6a50' } },   // helles Gestell, Augen bleiben sichtbar
  muetze: { name: 'Mütze',  bild: ['....ccccc....', '..ccccccccc..', '.ccccccccccc.', 'dddddddddddddd'.slice(0, 13)], pal: { c: '#d8485a', d: '#a83040' } },
  hut:    { name: 'Zylinder', dy: 4, bild: ['...kkkkkkk...', '...kkkkkkk...', '...kkkkkkk...', '...rrrrrrr...', '.kkkkkkkkkkk.'], pal: { k: '#2a2230', r: '#a83040' } }
};
// Farbe abdunkeln (f < 1) oder aufhellen (f > 1, Richtung Weiß)
function ton(hex, f) {
  let h = hex.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const c = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)).map(v => f < 1 ? v * f : v + (255 - v) * (f - 1));
  return '#' + c.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}
const figurFarben = (haar, shirt, haut = F.haut) => ({ H: haar, h: ton(haar, 0.72), j: ton(haar, 1.45), s: haut, e: F.umriss, m: F.mund,
  t: shirt, T: ton(shirt, 0.8), p: '#3a3a58', o: '#4a2c1c' });
const figurBild = (frisur = 'kurz') => (FRISUREN[frisur] || FRISUREN.kurz).kopf.concat(KOERPER);
const FIGUR = figurBild();
// x, y = alte Bezugsposition (Füße bleiben, wo sie waren); die Figur ist 13 breit und 16 hoch
function figur(x, y, haar, shirt, wackeln = false, aussehen = {}) {
  const dy = wackeln ? Math.round(Math.abs(Math.sin(zeit * 8))) : 0;
  const fx = x - 2.5, fy = y - 5 - dy;
  schatten(x - 1.5, y + 11, 11);
  sprite(figurBild(aussehen.frisur), figurFarben(haar, shirt, aussehen.haut), fx, fy);
  // Lichtpunkte in den Kulleraugen (feine Pixel)
  r(fx + 2, fy + 6, 2 * P, P, '#ffffff'); r(fx + 9, fy + 6, 2 * P, P, '#ffffff');
  r(fx + 2, fy + 6.5, P, P, '#ffffff'); r(fx + 9, fy + 6.5, P, P, '#ffffff');
  if (aussehen.frisur === 'glatze') r(fx + 3, fy + 2, 2, P, 'rgba(255,255,255,.5)');
  const ex = EXTRAS[aussehen.extra];
  if (ex && ex.bild) sprite(ex.bild, ex.pal, fx, fy - (ex.dy || 0), { umriss: aussehen.extra !== 'brille' });
}

const KUNDENFARBEN = [
  { haar: '#3a2418', shirt: '#5b8bd8' }, { haar: '#e0b050', shirt: '#6cbf6a' },
  { haar: '#b0482e', shirt: '#e07aa0' }, { haar: '#2a2a3a', shirt: '#9a7ae0' },
  { haar: '#8a5a3a', shirt: '#f09a4a' }
];
let kundeFarbe = KUNDENFARBEN[0];
let zeit = 0, polierDreh = 0, kundeWeg = 1;   // kundeWeg: 0 = an der Tür, 1 = am Tresen
let kundeDaSeit = 0;                           // Zeitpunkt, seit dem der Kunde am Tresen wartet

function pflanze(x, y) {
  schatten(x - 1, y + 7, 10);
  sprite(['.pPp.', 'pPppP', 'ppPpp', '.ppp.'], { p: F.pflanze, P: F.pflanzeHell }, x + 1, y - 3);
  sprite(['tttttt', '.tttt.', '.tttt.'], { t: F.topf }, x + 1, y + 2);
}

// Ablauf beim Bauen: erst Armband, dann Gehäuse, Zifferblatt, Zeiger
function bauStufe(w) {
  const anteil = 1 - w.rest / M(w.id).bau;
  return anteil >= 1 ? null : anteil >= 0.66 ? 'SCgcFK' : anteil >= 0.33 ? 'SCgc' : 'S';
}

// Ein Packtisch mit Schachtel und Fortschritt
function packtisch(pack, k) {
  moebel(pack.x, pack.y, pack.w, pack.h, F.tisch, F.tischHell, F.tischVorne, 3);
  if (!k) return;
  const bx = pack.x + 13, by = pack.y;
  const anteil = 1 - k.rest / packZeit();
  const karton = { b: '#a8723e', B: '#c9925a', r: '#d8485a' };
  if (anteil < 0.5) {
    sprite(UHR_MINI, uhrFarben(M(k.id)), bx, by - 8);
    sprite(['bb......bb', 'bbbbbbbbbb', 'bBBBBBBBBb', 'bBBBBBBBBb'], karton, bx, by);
  } else {
    sprite(['bbbbrrbbbb', 'bBBBrrBBBb', 'rrrrrrrrrr', 'bBBBrrBBBb', 'bbbbrrbbbb'], karton, bx, by - 1);
    if (anteil >= 0.85) sprite(['r..r', '.rr.'], karton, bx + 3, by - 4);
  }
  if (k.fertig) blase(bx + 9, by - 14, '!');
  else balken(pack.x + 2, pack.y + pack.h + 4, pack.w - 4, anteil);
}

// ---------- Layout pro Filiale ----------
// Jede Filiale ist größer. Werkstatt & Polierraum sind schmale Nebenräume,
// der Verkaufsraum nimmt den meisten Platz ein. Alle Positionen werden
// hier berechnet, damit Möbel und Figuren mitwandern.
const GROESSEN = [[156, 112], [176, 122], [196, 130], [214, 138]];
let layoutCache = null, layoutFuer = -1;
function layout(f = spiel.filiale) {
  if (layoutFuer === f && layoutCache) return layoutCache;
  const [W, H] = GROESSEN[Math.min(f, GROESSEN.length - 1)];
  const oh = 32, mitte = Math.round(W / 2);
  const werk = { x: 4, y: 4, w: mitte - 6, h: oh };
  const pol = { x: mitte + 2, y: 4, w: W - 4 - (mitte + 2), h: oh };
  const verk = { x: 4, y: 4 + oh + 4, w: W - 8 };
  verk.h = H - 4 - verk.y;
  const wt = { x: werk.x + 16, y: werk.y + 10, w: 44, h: 14 };          // Werkbank
  const pt = { x: pol.x + 6, y: pol.y + 10, w: 44, h: 14 };             // Poliertisch
  const durchgang = { x: pol.x + pol.w - 20, w: 14 };                   // Polierraum -> Verkauf
  const theke = { x: Math.round(W * 0.55), y: verk.y + Math.max(36, Math.round(verk.h * 0.45)), w: 46, h: 9 };   // Abstand zu den Vitrinen (große Köpfe)
  const pack = { x: 12, y: verk.y + verk.h - 24, w: 36, h: 12 };
  const packs = [pack, { x: pack.x, y: pack.y - 22, w: pack.w, h: pack.h }];   // 2. Tisch darüber (ab 3. Filiale)
  const regalSpalten = Math.min(lagerMax(f), 4);
  const regal = { x: 7, y: verk.y + 8, w: regalSpalten * 12 + 3 };
  // Lager (Regal + Packtische) links, Verkauf rechts – getrennt durch Boden und Rückwand, ohne Mauer
  const lager = { x: verk.x, y: verk.y, w: 58, h: verk.h };
  const vk = { x: lager.x + lager.w, y: verk.y, w: verk.w - lager.w, h: verk.h };
  const plaetze = [];
  for (let x = vk.x + 4; x + 13 <= durchgang.x - 3; x += 16) plaetze.push([x, verk.y + 9]);
  for (let x = durchgang.x + durchgang.w + 3; x + 13 <= W - 6; x += 16) plaetze.push([x, verk.y + 9]);
  for (let y = verk.y + 29; y + 16 <= theke.y + 30; y += 19) plaetze.push([W - 19, y]);
  layoutCache = {
    W, H, mitte, werk, pol, verk, lager, vk, wt, pt, durchgang, theke, pack, packs, regal, plaetze,
    tuer: { x: mitte, y: H - 14 },                                     // Startpunkt der Kunden
    kunde: { x: theke.x + 16, y: theke.y + 10 },                       // vor der Theke
    spieler: { x: theke.x - 12, y: theke.y - 6 },
    verkaeufer: { x: theke.x + 28, y: theke.y - 8 },
    vip: { x: Math.max(theke.x - 28, vk.x + 4), y: theke.y + 12 }
  };
  layoutFuer = f;
  return layoutCache;
}

// ---------- Umgebung ----------
function baum(x, y) {
  schatten(x - 2, y + 12, 14);
  sprite(['tt', 'tt', 'tt'], { t: '#7a5232' }, x + 4, y + 9);
  sprite(['..gggg..', '.gGGgggg.', 'gGGgggggg', 'gggggggGg', '.ggggggg.', '..gggg..'].map(z => z.padEnd(9, '.')),
         { g: '#4f9a52', G: '#7cc46e' }, x, y + 1);
}
function laterne(x, y) {
  schatten(x - 2, y + 14, 7);
  sprite(['ll', 'ww', 'ww'], { l: '#fff3b0', w: '#3a3442' }, x, y);
  sprite(['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'], { p: '#3a3442' }, x + 1, y + 3);
}
function draussen(x0, x1, y0, y1, L) {
  // Bürgersteig mit dezenten Platten
  r(x0, y0, x1 - x0, y1 - y0, '#8f8893');
  const sx = Math.floor(x0 / 10) * 10, sy = Math.floor(y0 / 10) * 10;
  for (let x = sx; x < x1; x += 10) r(x, y0, P, y1 - y0, '#857e89');
  for (let y = sy; y < y1; y += 10) r(x0, y, x1 - x0, P, '#857e89');
  // Straße unter dem Laden
  const st = L.H + 22, sb = L.H + 54;
  r(x0, st - 2, x1 - x0, 2, '#b9b2bd');                 // Bordstein
  r(x0, st, x1 - x0, sb - st, '#3f3a45');               // Asphalt
  for (let x = Math.floor(x0 / 16) * 16; x < x1; x += 16) r(x, (st + sb) / 2 - 1, 8, 2, '#d9c98f');
  for (let y = st + 3; y < sb - 2; y += 4) r(L.mitte - 12, y, 24, 2, '#d8d2dc');   // Zebrastreifen
  r(x0, sb, x1 - x0, 2, '#b9b2bd');
  // Bäume und Laternen
  for (const [bx, by] of [[-26, 4], [-26, L.H - 16], [L.W + 16, 4], [L.W + 16, L.H - 16], [-60, L.H / 2 - 6], [L.W + 50, L.H / 2 - 6]]) baum(bx, by);
  laterne(L.mitte - 36, L.H + 3); laterne(L.mitte + 34, L.H + 3);
}

// ---------- Räume ----------
function raum(x, y, w, h, boden, linie, linienAbstand) {
  r(x, y, w, h, boden);
  if (linie) for (let ly = y + linienAbstand; ly < y + h; ly += linienAbstand) { r(x, ly, w, P, linie); r(x, ly + P, w, P, 'rgba(255,255,255,.08)'); }
  // Rückwand: in der Schrägansicht sieht man ihre Vorderseite
  r(x, y, w, 7, F.wandVorne);
  r(x, y + 6, w, 1, F.wandKante);
  r(x, y + 7, w, 1, F.schatten);
}
const SCHILD_SCHRIFT = 4.5;   // Schriftgröße (Spielpixel) für Raumschilder und Filialname
function schild(x0, y, t) {   // kleines Holzschild, x0 = linke Kante (oben links im Raum)
  // kompakt: 2 Pixel Rand links/rechts, 1 Pixel oben/unten
  t = t.toUpperCase();
  const g = SCHILD_SCHRIFT, w = Math.ceil(webBreite(t, g) + 4), x = x0 + w / 2;
  r(x0 - 1, y - 1, w + 2, 9, F.umriss);
  r(x0, y, w, 7, '#d9a874');                        // helles Holz, in jeder Filiale gleich (gut lesbar)
  text(t, x, y + 3.5, g, '#4a2c1c');                // Menü-Schrift, wird über das Pixelbild gezeichnet
}

// ===============================================================
// HAUPTZEICHNUNG
// ===============================================================
function zeichnen() {
  Object.assign(F, F_BASIS, thema().farben);   // Farben der aktuellen Filiale
  const L = layout();
  if (L.W !== layoutW) groesse();               // neue Filiale = neue Größe
  const { W, H, werk, pol, verk, wt, pt, durchgang: d, theke: th, pack, regal } = L;
  const st = spiel.stufe;
  const x0 = -lox - 1, x1 = off.width / S - lox, y0 = -loy - 1, y1 = off.height / S - loy;

  draussen(x0, x1, y0, y1, L);

  // Gebäude mit dicker Außenmauer
  schatten(2, H - 1, W - 4);
  r(0, 0, W, H, F.umriss);
  r(1, 1, W - 2, H - 2, F.wandOben);

  // Räume
  raum(werk.x, werk.y, werk.w, werk.h, F.holz, F.holzLinie, 8);
  raum(pol.x, pol.y, pol.w, pol.h, F.fliese, F.flieseLinie, 12);
  raum(verk.x, verk.y, verk.w, verk.h, F.teppich, null, 0);
  // Lagerbereich: eigener Boden (Platten) und eigene Rückwand (Bretter) – keine Mauer
  const lg = L.lager, vk = L.vk;
  r(lg.x, lg.y + 8, lg.w, lg.h - 8, F.lager);
  for (let ly = lg.y + 16; ly < lg.y + lg.h; ly += 8) r(lg.x, ly, lg.w, P, F.lagerLinie);
  for (let lx = lg.x + 12; lx < lg.x + lg.w; lx += 12) r(lx, lg.y + 8, P, lg.h - 8, F.lagerLinie);
  r(lg.x, lg.y, lg.w, 7, F.lagerWand);
  for (let lx = lg.x + 5; lx < lg.x + lg.w; lx += 6) r(lx, lg.y, P, 7, F.lagerWandLinie);
  r(lg.x, lg.y + 6, lg.w, 1, F.lagerWandLinie);
  r(lg.x, lg.y + 7, lg.w, 1, F.schatten);
  // Übergang: Pfeiler-Kante an der Rückwand + Schwelle im Boden
  r(vk.x - 1, vk.y, 2, 8, F.umriss);
  r(vk.x - 1, vk.y + 8, 2, vk.h - 8, F.wandKante);
  const tr = { x: vk.x + 6, y: verk.y + 22, w: vk.w - 12, h: verk.h - 26 };   // Teppich mit Rand
  r(tr.x, tr.y, tr.w, tr.h, F.teppichRand); r(tr.x + 2, tr.y + 2, tr.w - 4, tr.h - 4, F.teppich);
  if (st >= 3) { r(tr.x + 2, tr.y + 2, tr.w - 4, 1, F.gold); r(tr.x + 2, tr.y + tr.h - 3, tr.w - 4, 1, F.gold); }

  // Durchgänge
  r(L.mitte - 2, werk.y + 12, 4, 12, F.holz);                     // Werkstatt -> Polierraum
  r(L.mitte - 12, H - 4, 24, 4, F.teppich);                       // Eingang
  r(L.mitte - 14, H, 28, 2, '#5a4050');

  if (thema().deko) thema().deko(L);
  // Durchgang Polierraum -> Verkauf: Wand, Rückwand und Deko-Leisten aussparen
  r(d.x, pol.y + pol.h, d.w, 4, F.fliese); r(d.x, verk.y, d.w, 8, F.teppich);
  r(d.x - 1, pol.y + pol.h, 1, 12, F.umriss); r(d.x + d.w, pol.y + pol.h, 1, 12, F.umriss);

  // ---------- Werkstatt ----------
  moebel(wt.x, wt.y, wt.w, wt.h, F.tisch, F.tischHell, F.tischVorne);
  sprite(['gg', 'mm', 'mm', 'mm'], { g: F.gold, m: F.metallHell }, wt.x + 4, wt.y + 3);          // Schraubendreher
  sprite(['kkkk', 'kGGk', 'kkkk'], { k: '#6a4a8a', G: F.gold }, wt.x + wt.w - 9, wt.y + 3);       // Teilekiste
  const w = spiel.werkbank, wm = M(w.id);
  sprite(UHR_MINI, uhrFarben(wm), wt.x + 17, wt.y + 2, { nur: bauStufe(w) ?? undefined });
  if (w.fertig) blase(wt.x + 26, wt.y - 10, '!');
  else balken(wt.x + 2, wt.y + wt.h + 3, wt.w - 4, 1 - w.rest / wm.bau);
  if (spiel.team.bau) figur(werk.x + 4, wt.y + 4, '#8a8a8a', '#f3f0e6', !w.fertig);          // Uhrmacher

  // ---------- Polierraum ----------
  moebel(pt.x, pt.y, pt.w, pt.h, F.metall, F.metallHell, F.metallVorne);
  r(pt.x + 15, pt.y + 2, 20, 9, '#5a7ac0'); r(pt.x + 16, pt.y + 3, 18, 1, '#7a9ae0');           // Polierkissen
  const dreh = polierDreh > 0 ? Math.floor(zeit * 20) % 2 : 0;                                   // Polierscheibe
  sprite(['.oo.', 'oooo', 'oooo', '.oo.'], { o: dreh ? F.metallHell : '#e8eef3' }, pt.x + 4, pt.y + 3);
  const p = spiel.polier;
  if (p) {
    const pm = M(p.id), dreck = p.rest / pm.polier;
    sprite(UHR_MINI, uhrFarben(pm), pt.x + 20, pt.y + 2);
    const flecken = [[2, 2], [5, 6], [2, 6], [6, 3], [3, 4], [1, 5], [6, 2]];   // auf dem Zifferblatt
    for (let i = 0; i < Math.ceil(dreck * flecken.length); i++) r(pt.x + 20 + flecken[i][0], pt.y + 2 + flecken[i][1], 1, 1, '#8a7a68');
    if (p.fertig) blase(pt.x + 38, pt.y - 10, '!');   // rechts neben dem Raumschild
    else balken(pt.x + 2, pt.y + pt.h + 3, pt.w - 4, 1 - dreck);
  }
  if (spiel.team.polier) figur(pt.x + pt.w + 4, pt.y + 4, '#e0b050', '#5aa8a0', !!(p && !p.fertig));  // Polierer

  // ---------- Verkaufsraum ----------
  // Lagerregal an der Rückwand – wächst mit dem Upgrade
  const kap = lagerPlatz(), spalten = Math.min(kap, 4), zeilen = Math.ceil(kap / 4);
  moebel(regal.x, regal.y, spalten * 12 + 3, zeilen * 12 + 5, '#6a4430', '#8a5a40', '#5a3826', 2);
  for (let i = 0; i < kap; i++) {
    const sx = regal.x + 2 + (i % 4) * 12, sy = regal.y + 2 + Math.floor(i / 4) * 12;
    r(sx, sy, 11, 11, '#3a2418');
    if (spiel.lager[i]) sprite(UHR_MINI, uhrFarben(M(spiel.lager[i])), sx + 0.5, sy + 0.5);
  }

  // Vitrinen auf den berechneten Plätzen (lassen den Durchgang frei)
  const n = LADEN[st].vitrinen;
  for (let i = 0; i < n && i < L.plaetze.length; i++) {
    const [x, y] = L.plaetze[i];
    moebel(x, y, 13, 16, '#cfeaf0', '#ffffff', '#7a5232', 3);   // Glas hoch genug für die Uhr
    const id = spiel.modelle[i];
    if (id) sprite(UHR_MINI, uhrFarben(M(id)), x + 1.5, y + 1.5);
  }

  // Raumschilder nach Deko, Möbeln und Vitrinen, damit nichts sie überdeckt
  schild(werk.x + 1, werk.y, t('g.werkstatt'));
  schild(pol.x + 1, pol.y, t('g.polieren'));
  schild(L.lager.x + 1, verk.y, t('g.lager'));
  schild(L.vk.x + 2, verk.y, t('g.verkauf'));

  pflanze(W - 18, H - 20);
  if (st >= 1) pflanze(pack.x + pack.w + 18, H - 18);

  // Packtische: Uhr kommt in die Schachtel, Deckel zu, Schleife drauf
  const tische = packTische();
  for (let i = 0; i < tische; i++) packtisch(L.packs[i], spiel.packs[i]);
  if (spiel.team.pack) {   // ein Packer bedient alle Tische
    const arbeitet = spiel.packs.some(k => k && !k.fertig);
    figur(pack.x + pack.w + 4, tische > 1 ? pack.y - 12 : pack.y - 2, '#b0482e', '#c9925a', arbeitet);
  }


  // Theke mit Kasse, du stehst links daneben
  const pr = spiel.profil;
  figur(L.spieler.x, L.spieler.y, pr.haar, pr.shirt, false, pr);
  if (spiel.team.verkauf) figur(L.verkaeufer.x, L.verkaeufer.y, '#2a1a10', '#d0567a', spiel.lager.length > 0);
  moebel(th.x, th.y, th.w, th.h, F.tisch, F.tischHell, F.tischVorne, 4);
  sprite(['kkkk', 'kggk', 'kkkk'], { k: F.metall, g: '#7ad87a' }, th.x + th.w - 10, th.y + 1);

  // Kunde: läuft nach jedem Verkauf kurz von der Tür zur Theke (nur Optik)
  const weg = kundeWeg, t0 = L.tuer, t1 = L.kunde;
  const kx = Math.round(t0.x + (t1.x - t0.x) * weg), ky = Math.round(t0.y + (t1.y - t0.y) * weg);
  figur(kx, ky, kundeFarbe.haar, kundeFarbe.shirt, weg < 1);
  if (weg >= 1 && spiel.lager.length === 0) blase(kx - 0.5, ky - 17, '?');   // über dem Kopf, nicht über der Verkäuferin
  // VIP-Kunde mit Krone
  if (vip) {
    const p = vipPos();
    figur(p.x, p.y, '#6a3a8a', '#f0c050', vip.weg < 1);
    sprite(['g.g.g', 'ggggg'], { g: '#ffd84a' }, p.x + 1.5, p.y - 8 - (vip.weg < 1 ? 0 : Math.round(Math.abs(Math.sin(zeit * 4)))));
    if (vip.weg >= 1) blase(p.x - 0.5, p.y - 21, '!');   // über der Krone, nicht über dem Spieler
  }
  for (const g of gehend) {
    const gx = t1.x + (t0.x - t1.x) * g.t, gy = t1.y + (t0.y + 6 - t1.y) * g.t;
    figur(Math.round(gx), Math.round(gy), g.farbe.haar, g.farbe.shirt, true);
  }

  // Großes Ladenschild über dem Laden: eigener Name + Filiale
  ladenSchild(L);
  // Schwebendes „+3 €“ über der Theke
  for (const t of texte) {
    const a = 1 - t.t;
    text(t.text, th.x + 24, th.y - 15 - t.t * 10, 6, `rgba(255,215,122,${a})`, `rgba(29,18,25,${a})`);
  }

  // Pixelbild scharf hochskalieren, danach Texte und Effekte darüber
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, 0, 0, off.width, off.height, 0, 0, off.width * U / S, off.height * U / S);
  flushTexte();
  blasenZeichnen();   // Sprechblasen ganz oben

  for (const f of funken) {
    ctx.fillStyle = `rgba(255,246,200,${1 - f.t / 0.5})`;
    ctx.fillRect((lox + f.x) * U, (loy + f.y - 2) * U, U, 5 * U);
    ctx.fillRect((lox + f.x - 2) * U, (loy + f.y) * U, 5 * U, U);
  }
}

// ===============================================================
// 7. EFFEKTE
// ===============================================================
const funken = [], texte = [], gehend = [];
function funkeln(x, y) { if (funken.length < 40) funken.push({ x, y, t: 0 }); }
function effekteUpdaten(dt) {
  polierDreh = Math.max(0, polierDreh - dt);
  if (kundeWeg < 1 && kundeWeg + dt / 0.8 >= 1) kundeDaSeit = zeit;
  kundeWeg = Math.min(1, kundeWeg + dt / 0.8);
  for (const a of [funken, texte, gehend]) for (const e of a) e.t += dt;
  while (funken.length && funken[0].t > 0.5) funken.shift();
  while (texte.length && texte[0].t > 1) texte.shift();
  while (gehend.length && gehend[0].t > 1) gehend.shift();
}

// Ladenschild über dem Gebäude
const ladenName = () => (spiel.profil.name || t('profil.platzhalter')).toUpperCase();
// Großes Ladenschild: dunkles Holzbrett, viel Luft, Name groß, Filiale klein darunter
const SCHILD_H = 23;
function ladenSchild(L) {
  const name = ladenName().toUpperCase(), sub = filialName().toUpperCase();
  const w = Math.ceil(Math.max(64, webBreite(name, 7), webBreite(sub, SCHILD_SCHRIFT)) + 20);
  const x = Math.round(L.mitte - w / 2), y = -SCHILD_H - 4;
  r(x + 10, y + SCHILD_H, 2, 4, F.umriss); r(x + w - 12, y + SCHILD_H, 2, 4, F.umriss);   // Halterungen
  r(x - 1, y - 1, w + 2, SCHILD_H + 2, F.umriss);
  r(x, y, w, SCHILD_H, '#4a2c38');
  r(x, y, w, 1, '#6b4558');                                    // Lichtkante oben
  r(x, y + SCHILD_H - 2, w, 2, '#38202c');                     // Schatten unten
  for (const [dx, dy] of [[2, 2], [w - 3, 2], [2, SCHILD_H - 4], [w - 3, SCHILD_H - 4]]) r(x + dx, y + dy, 1, 1, F.gold);  // Nieten
  text(name, L.mitte, y + 8.5, 7, '#ffd77a', '#1d1219');
  text(sub, L.mitte, y + 17, SCHILD_SCHRIFT, '#d9b8c4');
}

// ===============================================================
// DEKO DER FILIALEN (Positionen relativ zum Layout L)
// ===============================================================
function spinnennetz(x, y, spiegel) {
  const c = 'rgba(220,214,218,.7)', d = spiegel ? -1 : 1;
  for (let i = 0; i < 6; i++) { r(x + d * i, y, 1, 1, c); r(x, y + i, 1, 1, c); }
  for (let i = 0; i < 5; i++) r(x + d * i, y + 4 - i, 1, 1, c);
  r(x + d * 2, y + 1, 1, 1, c); r(x + d * 1, y + 2, 1, 1, c);
}
function riss(x, y) { for (const [dx, dy] of [[0, 0], [1, 1], [1, 2], [2, 3], [2, 4], [3, 5]]) r(x + dx, y + dy, 1, 1, '#3a2c30'); }
function fleck(x, y, w, h) { r(x + 1, y, w - 2, h, 'rgba(40,20,10,.22)'); r(x, y + 1, w, h - 2, 'rgba(40,20,10,.22)'); }

function dekoRuine(L) {
  const { werk, pol, verk, W, H } = L;
  riss(werk.x + 12, werk.y); riss(pol.x + pol.w - 14, pol.y); riss(verk.x + Math.round(verk.w * 0.7), verk.y);
  spinnennetz(werk.x, werk.y + 7, false); spinnennetz(pol.x + pol.w - 1, pol.y + 7, true); spinnennetz(W - 5, verk.y + 7, true);
  fleck(werk.x + 30, werk.y + werk.h - 5, 9, 4); fleck(pol.x + 50, pol.y + pol.h - 6, 8, 4); fleck(W - 50, H - 14, 10, 5);
  r(werk.x + 20, werk.y + werk.h - 3, 11, 1, '#6a4c30');                                     // lose Diele
  r(verk.x + 46, H - 12, 9, 5, '#5a3a44'); r(verk.x + 47, H - 11, 7, 3, '#4a2e38');           // abgewetzter Teppich
  // Eimer unter einer undichten Stelle
  const ex = werk.x + werk.w - 8, ey = werk.y + werk.h - 7;
  sprite(['m...m', 'mwwwm', 'mmmmm'], { m: F.metall, w: '#6a9ac0' }, ex, ey);
  const tropfen = (zeit * 1.5) % 1;
  if (tropfen < 0.7) r(ex + 2, werk.y + 8 + Math.round(tropfen * (ey - werk.y - 8)), 1, 1, '#9ac8e8');
  // Mülltonne vor der Tür
  sprite(['.dddd.', 'dddddd', 'gggggg', 'gggggg', 'gggggg'], { d: '#3a4a3a', g: '#4f634f' }, L.mitte - 24, H + 3);
}
function dekoModern(L) {
  for (const raum of [L.werk, L.pol, L.verk]) {
    r(raum.x + 2, raum.y + 1, raum.w - 4, 1, '#ffffff');
    r(raum.x + 2, raum.y + 8, raum.w - 4, 1, 'rgba(255,255,255,.18)');
  }
  for (let i = 0; i < 3; i++) r(L.pol.x + 20 + i * 6, L.pol.y + L.pol.h - 4 - i * 4, 4, 1, 'rgba(255,255,255,.35)');
}
function dekoLuxus(L) {
  for (const raum of [L.werk, L.pol, L.verk]) r(raum.x, raum.y + 5, raum.w, 1, F.gold);
  // Marmor-Adern im Polierraum
  for (const [x, y] of [[L.pol.x + 8, L.pol.y + 28], [L.pol.x + L.pol.w - 14, L.pol.y + 14]])
    for (let i = 0; i < 6; i++) r(x + i, y + Math.round(i / 2), 1, 1, '#d8d0c6');
  // roter Teppich von der Tür zur Theke
  const ty = L.theke.y + 12;
  r(L.mitte - 8, ty, 16, L.H - 4 - ty, '#8a1a2a'); r(L.mitte - 8, ty, 1, L.H - 4 - ty, F.gold); r(L.mitte + 7, ty, 1, L.H - 4 - ty, F.gold);
  // Kronleuchter
  for (const cx of [L.verk.x + 70, L.W - 40]) sprite(['.g.g.g.', 'ggggggg', '.wgwgw.'], { g: F.gold, w: '#fff6c0' }, cx - 3, L.verk.y + 34);
}
